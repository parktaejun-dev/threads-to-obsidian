import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool, type Pool as PgPool, type PoolClient } from "pg";

import {
  type AdminMonitoringIncidentRecord,
  type AdminMonitoringRunRecord,
  buildDefaultDatabase,
  type AdminHistoryEvent,
  type BotArchiveRecord,
  type BotExtensionAccessTokenRecord,
  type BotExtensionLinkSessionRecord,
  type BotLoginTokenRecord,
  type BotOauthSessionRecord,
  type BotSessionRecord,
  type BotUserRecord,
  type CloudArchiveRecord,
  type DashboardSummary,
  type InsightsSnapshotRecord,
  type LicenseActivationRecord,
  type LicenseRecord,
  type NotionAuthSessionRecord,
  type NotionConnectionRecord,
  type PaymentMethod,
  type PurchaseOrder,
  type PublicStorefrontResponse,
  type RevenueReport,
  type SavedViewRecord,
  type SearchMonitorRecord,
  type SearchResultRecord,
  type RuntimeDatabaseConfig,
  type StorefrontSettings,
  type TrackedPostRecord,
  type WatchlistRecord,
  type WebDatabase
} from "@threads/web-schema";
import { getRuntimeConfigSnapshot } from "./runtime-config";

const DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
const DEFAULT_POSTGRES_TABLE = "threads_web_store";
const DEFAULT_POSTGRES_STORE_KEY = "default";

type FileDatabaseBackend = {
  kind: "file";
  filePath: string;
};

type PostgresDatabaseBackend = {
  kind: "postgres";
  connectionString: string;
  tableName: string;
  storeKey: string;
};

type DatabaseBackend = FileDatabaseBackend | PostgresDatabaseBackend;

export function getDatabaseFilePath(): string {
  return getRuntimeConfigSnapshot().database.filePath || DEFAULT_DB_FILE;
}

let databaseOperationChain: Promise<void> = Promise.resolve();
let postgresPool: PgPool | null = null;
let postgresPoolConnectionString: string | null = null;
const ensuredPostgresStores = new Set<string>();
let activeDatabaseAccessCount = 0;
let databaseReconfigurationBarrier: Promise<void> | null = null;
let releaseDatabaseReconfigurationBarrier: (() => void) | null = null;
let databaseReconfigurationChain: Promise<void> = Promise.resolve();
const databaseIdleWaiters = new Set<() => void>();

async function withDatabaseLock<T>(operation: () => Promise<T>): Promise<T> {
  let operationResult: Promise<T>;
  operationResult = databaseOperationChain.then(() => operation());
  databaseOperationChain = operationResult.then(() => undefined, () => undefined);
  return operationResult;
}

function notifyDatabaseIdleWaiters(): void {
  if (activeDatabaseAccessCount > 0 || databaseIdleWaiters.size === 0) {
    return;
  }

  for (const waiter of databaseIdleWaiters) {
    waiter();
  }
  databaseIdleWaiters.clear();
}

async function waitForDatabaseBarrier(): Promise<void> {
  while (databaseReconfigurationBarrier) {
    await databaseReconfigurationBarrier;
  }
}

async function withDatabaseAccess<T>(operation: () => Promise<T>): Promise<T> {
  await waitForDatabaseBarrier();
  activeDatabaseAccessCount += 1;
  try {
    return await operation();
  } finally {
    activeDatabaseAccessCount = Math.max(0, activeDatabaseAccessCount - 1);
    notifyDatabaseIdleWaiters();
  }
}

export async function withExclusiveDatabaseReconfiguration<T>(operation: () => Promise<T>): Promise<T> {
  const queuedOperation = databaseReconfigurationChain.then(async () => {
    const barrier = new Promise<void>((resolve) => {
      releaseDatabaseReconfigurationBarrier = resolve;
    });
    databaseReconfigurationBarrier = barrier;

    if (activeDatabaseAccessCount > 0) {
      await new Promise<void>((resolve) => {
        databaseIdleWaiters.add(resolve);
      });
    }

    try {
      return await operation();
    } finally {
      databaseReconfigurationBarrier = null;
      const release = releaseDatabaseReconfigurationBarrier;
      releaseDatabaseReconfigurationBarrier = null;
      release?.();
    }
  });

  databaseReconfigurationChain = queuedOperation.then(() => undefined, () => undefined);
  return queuedOperation;
}

function resolveDatabaseBackendFromConfig(config: RuntimeDatabaseConfig): DatabaseBackend {
  if (config.backend === "postgres") {
    const connectionString = config.postgresUrl.trim();
    if (!connectionString) {
      throw new Error("THREADS_WEB_STORE_BACKEND=postgres requires THREADS_WEB_POSTGRES_URL or THREADS_WEB_DATABASE_URL.");
    }

    return {
      kind: "postgres",
      connectionString,
      tableName: config.tableName.trim() || DEFAULT_POSTGRES_TABLE,
      storeKey: config.storeKey.trim() || DEFAULT_POSTGRES_STORE_KEY
    };
  }

  return {
    kind: "file",
    filePath: config.filePath.trim() || DEFAULT_DB_FILE
  };
}

function resolveDatabaseBackend(filePath?: string): DatabaseBackend {
  if (filePath) {
    return {
      kind: "file",
      filePath
    };
  }

  return resolveDatabaseBackendFromConfig(getRuntimeConfigSnapshot().database);
}

function escapeQualifiedIdentifier(identifier: string): string {
  return identifier
    .split(".")
    .map((chunk) => `"${chunk.replaceAll("\"", "\"\"")}"`)
    .join(".");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDatabasePayload(raw: unknown): WebDatabase {
  const parsed = isRecord(raw) ? (raw as Partial<WebDatabase>) : {};
  const fallback = buildDefaultDatabase();
  const now = new Date().toISOString();
  const parsedBotUsers = Array.isArray(parsed.botUsers) ? parsed.botUsers : [];
  const botUsers: BotUserRecord[] = parsedBotUsers.map((candidate) => ({
    id: typeof candidate?.id === "string" ? candidate.id : crypto.randomUUID(),
    threadsUserId: typeof candidate?.threadsUserId === "string" ? candidate.threadsUserId : null,
    threadsHandle: typeof candidate?.threadsHandle === "string" ? candidate.threadsHandle : "",
    displayName: typeof candidate?.displayName === "string" ? candidate.displayName : null,
    profilePictureUrl: typeof candidate?.profilePictureUrl === "string" ? candidate.profilePictureUrl : null,
    biography: typeof candidate?.biography === "string" ? candidate.biography : null,
    isVerified: candidate?.isVerified === true,
    accessTokenCiphertext:
      typeof candidate?.accessTokenCiphertext === "string" ? candidate.accessTokenCiphertext : null,
    tokenExpiresAt: typeof candidate?.tokenExpiresAt === "string" ? candidate.tokenExpiresAt : null,
    email: typeof candidate?.email === "string" ? candidate.email : null,
    grantedScopes: Array.isArray(candidate?.grantedScopes)
      ? candidate.grantedScopes.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0)
      : [],
    scopeVersion:
      typeof candidate?.scopeVersion === "number" && Number.isFinite(candidate.scopeVersion)
        ? candidate.scopeVersion
        : 0,
    lastScopeUpgradeAt: typeof candidate?.lastScopeUpgradeAt === "string" ? candidate.lastScopeUpgradeAt : null,
    createdAt: typeof candidate?.createdAt === "string" ? candidate.createdAt : now,
    updatedAt: typeof candidate?.updatedAt === "string" ? candidate.updatedAt : now,
    lastLoginAt: typeof candidate?.lastLoginAt === "string" ? candidate.lastLoginAt : null,
    status: candidate?.status === "disabled" ? "disabled" : "active"
  }));
  const parsedBotOauthSessions = Array.isArray(parsed.botOauthSessions) ? parsed.botOauthSessions : [];
  const botOauthSessions: BotOauthSessionRecord[] = parsedBotOauthSessions.map((candidate) => ({
    id: typeof candidate?.id === "string" ? candidate.id : crypto.randomUUID(),
    stateHash: typeof candidate?.stateHash === "string" ? candidate.stateHash : "",
    pollTokenHash: typeof candidate?.pollTokenHash === "string" ? candidate.pollTokenHash : "",
    createdAt: typeof candidate?.createdAt === "string" ? candidate.createdAt : now,
    expiresAt: typeof candidate?.expiresAt === "string" ? candidate.expiresAt : now,
    completedAt: typeof candidate?.completedAt === "string" ? candidate.completedAt : null,
    activationCode: typeof candidate?.activationCode === "string" ? candidate.activationCode : null,
    activationExpiresAt: typeof candidate?.activationExpiresAt === "string" ? candidate.activationExpiresAt : null,
    linkedSessionToken: typeof candidate?.linkedSessionToken === "string" ? candidate.linkedSessionToken : null,
    status: candidate?.status === "completed" ? "completed" : candidate?.status === "expired" ? "expired" : candidate?.status === "failed" ? "failed" : "pending"
  }));
  const settings = normalizeStorefrontSettings(parsed.settings, fallback.settings);
  const monitorRuns = Array.isArray(parsed.monitorRuns) ? parsed.monitorRuns as AdminMonitoringRunRecord[] : [];
  const monitorIncidents = Array.isArray(parsed.monitorIncidents)
    ? parsed.monitorIncidents as AdminMonitoringIncidentRecord[]
    : [];

  return {
    settings,
    paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : fallback.paymentMethods,
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
    activations: Array.isArray(parsed.activations) ? parsed.activations : [],
    notionConnections: Array.isArray(parsed.notionConnections) ? parsed.notionConnections : [],
    notionAuthSessions: Array.isArray(parsed.notionAuthSessions) ? parsed.notionAuthSessions : [],
    botUsers,
    botLoginTokens: Array.isArray(parsed.botLoginTokens) ? parsed.botLoginTokens : [],
    botOauthSessions,
    botSessions: Array.isArray(parsed.botSessions) ? parsed.botSessions : [],
    botExtensionLinkSessions: Array.isArray(parsed.botExtensionLinkSessions) ? parsed.botExtensionLinkSessions : [],
    botExtensionAccessTokens: Array.isArray(parsed.botExtensionAccessTokens) ? parsed.botExtensionAccessTokens : [],
    botArchives: Array.isArray(parsed.botArchives) ? parsed.botArchives : [],
    cloudArchives: Array.isArray(parsed.cloudArchives) ? parsed.cloudArchives : [],
    watchlists: Array.isArray(parsed.watchlists) ? parsed.watchlists : [],
    searchMonitors: Array.isArray(parsed.searchMonitors) ? parsed.searchMonitors : [],
    searchResults: Array.isArray(parsed.searchResults) ? parsed.searchResults : [],
    trackedPosts: Array.isArray(parsed.trackedPosts) ? parsed.trackedPosts : [],
    insightsSnapshots: Array.isArray(parsed.insightsSnapshots) ? parsed.insightsSnapshots : [],
    savedViews: Array.isArray(parsed.savedViews) ? parsed.savedViews : [],
    history: Array.isArray(parsed.history) ? parsed.history : [],
    monitorRuns,
    monitorIncidents
  };
}

async function getPostgresPool(connectionString: string): Promise<PgPool> {
  if (postgresPool && postgresPoolConnectionString === connectionString) {
    return postgresPool;
  }

  if (postgresPool) {
    await postgresPool.end().catch(() => undefined);
  }

  postgresPool = new Pool({
    connectionString
  });
  postgresPoolConnectionString = connectionString;
  return postgresPool;
}

async function ensurePostgresStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${tableName}`;
  if (ensuredPostgresStores.has(cacheKey)) {
    return;
  }

  const escapedTableName = escapeQualifiedIdentifier(tableName);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
      store_key TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );
  ensuredPostgresStores.add(cacheKey);
}

async function ensureParentDirectory(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function loadDatabaseUnsafe(filePath = getDatabaseFilePath()): Promise<WebDatabase> {
  try {
    const raw = await readFile(filePath, "utf8");
    return normalizeDatabasePayload(JSON.parse(raw));
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code !== "ENOENT") {
      throw error;
    }

    const initial = buildDefaultDatabase();
    await saveFileDatabase(initial, filePath);
    return initial;
  }
}

function normalizeStorefrontSettings(
  parsed: Partial<StorefrontSettings> | undefined,
  fallback: StorefrontSettings
): StorefrontSettings {
  const merged: StorefrontSettings = {
    ...fallback,
    ...(parsed ?? {})
  };

  // Upgrade existing installs that still carry the original default values.
  if (!parsed || parsed.productName === "Threads to Obsidian") {
    merged.productName = fallback.productName;
  }
  if (!parsed || parsed.headline === "Threads를 Obsidian에 저장.") {
    merged.headline = fallback.headline;
  }
  if (
    !parsed ||
    parsed.subheadline === "Free는 저장. Pro는 규칙 + 내 LLM 키로 요약, 태그, frontmatter."
  ) {
    merged.subheadline = fallback.subheadline;
  }
  if (!parsed || parsed.priceLabel === "Pro 업그레이드") {
    merged.priceLabel = fallback.priceLabel;
  }
  if (!parsed || parsed.priceValue === "$19") {
    merged.priceValue = fallback.priceValue;
  }
  if (!parsed || parsed.includedUpdates === "1회 결제 · 7일 환불 · 업데이트 1년") {
    merged.includedUpdates = fallback.includedUpdates;
  }
  if (!Array.isArray(parsed?.heroNotes) || parsed.heroNotes.length === 0) {
    merged.heroNotes = fallback.heroNotes;
  }
  if (!Array.isArray(parsed?.faqs) || parsed.faqs.length === 0) {
    merged.faqs = fallback.faqs;
  }

  return merged;
}

async function saveFileDatabase(data: WebDatabase, filePath: string): Promise<void> {
  await ensureParentDirectory(filePath);
  const tmpFilePath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const payload = JSON.stringify(data, null, 2);
  await writeFile(tmpFilePath, payload, "utf8");
  await rename(tmpFilePath, filePath);
}

async function savePostgresDatabase(data: WebDatabase, backend: PostgresDatabaseBackend): Promise<void> {
  const pool = await getPostgresPool(backend.connectionString);
  await ensurePostgresStore(pool, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  await pool.query(
    `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (store_key)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [backend.storeKey, JSON.stringify(data)]
  );
}

async function loadDatabaseFromPostgres(backend: PostgresDatabaseBackend): Promise<WebDatabase> {
  const pool = await getPostgresPool(backend.connectionString);
  await ensurePostgresStore(pool, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  const selected = await pool.query<{ payload: unknown }>(
    `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 LIMIT 1`,
    [backend.storeKey]
  );

  if (selected.rows[0]) {
    return normalizeDatabasePayload(selected.rows[0].payload);
  }

  const initial = buildDefaultDatabase();
  const inserted = await pool.query<{ payload: unknown }>(
    `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (store_key) DO NOTHING
     RETURNING payload`,
    [backend.storeKey, JSON.stringify(initial)]
  );
  if (inserted.rows[0]) {
    return normalizeDatabasePayload(inserted.rows[0].payload);
  }

  const reloaded = await pool.query<{ payload: unknown }>(
    `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 LIMIT 1`,
    [backend.storeKey]
  );
  return reloaded.rows[0] ? normalizeDatabasePayload(reloaded.rows[0].payload) : initial;
}

async function withPostgresDatabaseTransaction<T>(
  handler: (database: WebDatabase) => Promise<T> | T,
  backend: PostgresDatabaseBackend
): Promise<T> {
  const pool = await getPostgresPool(backend.connectionString);
  const client = await pool.connect();
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);

  try {
    await client.query("BEGIN");
    await ensurePostgresStore(client, backend.tableName);
    await client.query(
      `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (store_key) DO NOTHING`,
      [backend.storeKey, JSON.stringify(buildDefaultDatabase())]
    );

    const selected = await client.query<{ payload: unknown }>(
      `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 FOR UPDATE`,
      [backend.storeKey]
    );
    const database = selected.rows[0] ? normalizeDatabasePayload(selected.rows[0].payload) : buildDefaultDatabase();
    const output = await handler(database);
    await client.query(
      `UPDATE ${escapedTableName}
       SET payload = $2::jsonb,
           updated_at = NOW()
       WHERE store_key = $1`,
      [backend.storeKey, JSON.stringify(database)]
    );
    await client.query("COMMIT");
    return output;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function saveDatabase(data: WebDatabase, filePath?: string): Promise<void> {
  await withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      await savePostgresDatabase(data, backend);
      return;
    }

    await saveFileDatabase(data, backend.filePath);
  });
}

export async function loadDatabase(filePath?: string): Promise<WebDatabase> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      return loadDatabaseFromPostgres(backend);
    }

    return loadDatabaseUnsafe(backend.filePath);
  });
}

export async function withDatabaseTransaction<T>(
  handler: (database: WebDatabase) => Promise<T> | T,
  filePath?: string
): Promise<T> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      return withPostgresDatabaseTransaction(handler, backend);
    }

    return withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const output = await handler(database);
      await saveFileDatabase(database, backend.filePath);
      return output;
    });
  });
}

export async function loadDatabaseForConfig(config: RuntimeDatabaseConfig): Promise<WebDatabase> {
  const backend = resolveDatabaseBackendFromConfig(config);
  return backend.kind === "postgres" ? loadDatabaseFromPostgres(backend) : loadDatabaseUnsafe(backend.filePath);
}

export async function saveDatabaseForConfig(data: WebDatabase, config: RuntimeDatabaseConfig): Promise<void> {
  const backend = resolveDatabaseBackendFromConfig(config);
  if (backend.kind === "postgres") {
    await savePostgresDatabase(data, backend);
    return;
  }

  await saveFileDatabase(data, backend.filePath);
}

export async function testDatabaseConfig(config: RuntimeDatabaseConfig): Promise<void> {
  const backend = resolveDatabaseBackendFromConfig(config);
  if (backend.kind === "postgres") {
    const pool = await getPostgresPool(backend.connectionString);
    await ensurePostgresStore(pool, backend.tableName);
    await pool.query("SELECT 1");
    return;
  }

  await ensureParentDirectory(backend.filePath);
}

export function buildDashboardSummary(data: WebDatabase): DashboardSummary {
  const webhookIgnored = data.history.filter((event) => event.kind === "webhook_ignored");
  const webhookRejected = data.history.filter((event) => event.kind === "webhook_rejected");

  return {
    pendingOrders: data.orders.filter((order) => order.status === "pending").length,
    paidOrders: data.orders.filter((order) => order.status === "payment_confirmed").length,
    issuedKeys: data.licenses.filter((license) => license.status === "active").length,
    activePaymentMethods: data.paymentMethods.filter((method) => method.enabled).length,
    webhookProcessed: data.history.filter((event) => event.kind === "webhook_processed").length,
    webhookIgnored: webhookIgnored.length,
    webhookRejected: webhookRejected.length,
    webhookDuplicates: webhookIgnored.filter((event) => event.webhookReason === "already_processed").length,
    deliveryReadyToSend: data.orders.filter((order) => order.deliveryStatus === "ready_to_send").length,
    deliverySent: data.orders.filter((order) => order.deliveryStatus === "sent").length
  };
}

export function buildRevenueReport(data: WebDatabase): RevenueReport {
  const priceUsd = Number.parseFloat(process.env.THREADS_PRICE_USD?.trim() ?? "29") || 29;

  const paidOrders = data.orders.filter(
    (order) => order.status === "payment_confirmed" || order.status === "key_issued"
  );

  const byMethodMap = new Map<string, { methodId: string; methodName: string; orders: number; paid: number }>();
  for (const order of data.orders) {
    const method = data.paymentMethods.find((candidate) => candidate.id === order.paymentMethodId);
    const entry = byMethodMap.get(order.paymentMethodId) ?? {
      methodId: order.paymentMethodId,
      methodName: method?.name ?? order.paymentMethodId,
      orders: 0,
      paid: 0
    };
    entry.orders += 1;
    if (order.status === "payment_confirmed" || order.status === "key_issued") {
      entry.paid += 1;
    }

    byMethodMap.set(order.paymentMethodId, entry);
  }

  const byMonthMap = new Map<string, { month: string; orders: number; issued: number }>();
  for (const order of data.orders) {
    const month = order.createdAt.slice(0, 7);
    const entry = byMonthMap.get(month) ?? { month, orders: 0, issued: 0 };
    entry.orders += 1;
    if (order.status === "key_issued") {
      entry.issued += 1;
    }

    byMonthMap.set(month, entry);
  }

  return {
    totalOrders: data.orders.length,
    paidOrders: paidOrders.length,
    cancelledOrders: data.orders.filter((order) => order.status === "cancelled").length,
    issuedKeys: data.licenses.filter((license) => license.status === "active").length,
    revokedKeys: data.licenses.filter((license) => license.status === "revoked").length,
    deliveryReadyToSend: data.orders.filter((order) => order.deliveryStatus === "ready_to_send").length,
    deliverySent: data.orders.filter((order) => order.deliveryStatus === "sent").length,
    estimatedRevenueUsd: paidOrders.length * priceUsd,
    priceUsd,
    byPaymentMethod: [...byMethodMap.values()].sort((a, b) => b.paid - a.paid),
    byMonth: [...byMonthMap.values()].sort((a, b) => a.month.localeCompare(b.month))
  };
}

export function buildPublicStorefront(data: WebDatabase): PublicStorefrontResponse {
  return {
    settings: data.settings,
    paymentMethods: [...data.paymentMethods]
      .filter((method) => method.enabled)
      .sort((left, right) => left.sortOrder - right.sortOrder)
  };
}

export function appendHistory(
  data: WebDatabase,
  event: Omit<AdminHistoryEvent, "id" | "createdAt">
): AdminHistoryEvent {
  const historyEvent: AdminHistoryEvent = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event
  };
  data.history.unshift(historyEvent);
  data.history = data.history.slice(0, 200);
  return historyEvent;
}

export function upsertPaymentMethod(data: WebDatabase, method: PaymentMethod): void {
  const index = data.paymentMethods.findIndex((candidate) => candidate.id === method.id);
  if (index >= 0) {
    data.paymentMethods[index] = method;
    return;
  }

  data.paymentMethods.push(method);
}

export function upsertOrder(data: WebDatabase, order: PurchaseOrder): void {
  const index = data.orders.findIndex((candidate) => candidate.id === order.id);
  if (index >= 0) {
    data.orders[index] = order;
    return;
  }

  data.orders.unshift(order);
}

export function upsertLicense(data: WebDatabase, license: LicenseRecord): void {
  const index = data.licenses.findIndex((candidate) => candidate.id === license.id);
  if (index >= 0) {
    data.licenses[index] = license;
    return;
  }

  data.licenses.unshift(license);
}

export function upsertActivation(data: WebDatabase, activation: LicenseActivationRecord): void {
  const index = data.activations.findIndex((candidate) => candidate.id === activation.id);
  if (index >= 0) {
    data.activations[index] = activation;
    return;
  }

  data.activations.unshift(activation);
}

export function upsertNotionConnection(data: WebDatabase, connection: NotionConnectionRecord): void {
  const index = data.notionConnections.findIndex((candidate) => candidate.id === connection.id);
  if (index >= 0) {
    data.notionConnections[index] = connection;
    return;
  }

  data.notionConnections.unshift(connection);
}

export function upsertNotionAuthSession(data: WebDatabase, session: NotionAuthSessionRecord): void {
  const index = data.notionAuthSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.notionAuthSessions[index] = session;
    return;
  }

  data.notionAuthSessions.unshift(session);
}

export function upsertBotUser(data: WebDatabase, user: BotUserRecord): void {
  const index = data.botUsers.findIndex((candidate) => candidate.id === user.id);
  if (index >= 0) {
    data.botUsers[index] = user;
    return;
  }

  data.botUsers.unshift(user);
}

export function upsertBotLoginToken(data: WebDatabase, token: BotLoginTokenRecord): void {
  const index = data.botLoginTokens.findIndex((candidate) => candidate.id === token.id);
  if (index >= 0) {
    data.botLoginTokens[index] = token;
    return;
  }

  data.botLoginTokens.unshift(token);
}

export function upsertBotOauthSession(data: WebDatabase, session: BotOauthSessionRecord): void {
  const index = data.botOauthSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.botOauthSessions[index] = session;
    return;
  }

  data.botOauthSessions.unshift(session);
}

export function upsertBotSession(data: WebDatabase, session: BotSessionRecord): void {
  const index = data.botSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.botSessions[index] = session;
    return;
  }

  data.botSessions.unshift(session);
}

export function upsertBotExtensionLinkSession(data: WebDatabase, session: BotExtensionLinkSessionRecord): void {
  const index = data.botExtensionLinkSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.botExtensionLinkSessions[index] = session;
    return;
  }

  data.botExtensionLinkSessions.unshift(session);
}

export function upsertBotExtensionAccessToken(data: WebDatabase, token: BotExtensionAccessTokenRecord): void {
  const index = data.botExtensionAccessTokens.findIndex((candidate) => candidate.id === token.id);
  if (index >= 0) {
    data.botExtensionAccessTokens[index] = token;
    return;
  }

  data.botExtensionAccessTokens.unshift(token);
}

export function upsertBotArchive(data: WebDatabase, archive: BotArchiveRecord): void {
  const index = data.botArchives.findIndex((candidate) => candidate.id === archive.id);
  if (index >= 0) {
    data.botArchives[index] = archive;
    return;
  }

  data.botArchives.unshift(archive);
}

export function upsertCloudArchive(data: WebDatabase, archive: CloudArchiveRecord): void {
  const index = data.cloudArchives.findIndex((candidate) => candidate.id === archive.id);
  if (index >= 0) {
    data.cloudArchives[index] = archive;
    return;
  }

  data.cloudArchives.unshift(archive);
}

export function upsertWatchlist(data: WebDatabase, watchlist: WatchlistRecord): void {
  const index = data.watchlists.findIndex((candidate) => candidate.id === watchlist.id);
  if (index >= 0) {
    data.watchlists[index] = watchlist;
    return;
  }

  data.watchlists.unshift(watchlist);
}

export function upsertSearchMonitor(data: WebDatabase, monitor: SearchMonitorRecord): void {
  const index = data.searchMonitors.findIndex((candidate) => candidate.id === monitor.id);
  if (index >= 0) {
    data.searchMonitors[index] = monitor;
    return;
  }

  data.searchMonitors.unshift(monitor);
}

export function upsertSearchResult(data: WebDatabase, result: SearchResultRecord): void {
  const index = data.searchResults.findIndex((candidate) => candidate.id === result.id);
  if (index >= 0) {
    data.searchResults[index] = result;
    return;
  }

  data.searchResults.unshift(result);
}

export function upsertTrackedPost(data: WebDatabase, post: TrackedPostRecord): void {
  const index = data.trackedPosts.findIndex((candidate) => candidate.id === post.id);
  if (index >= 0) {
    data.trackedPosts[index] = post;
    return;
  }

  data.trackedPosts.unshift(post);
}

export function upsertInsightsSnapshot(data: WebDatabase, snapshot: InsightsSnapshotRecord): void {
  const index = data.insightsSnapshots.findIndex((candidate) => candidate.id === snapshot.id);
  if (index >= 0) {
    data.insightsSnapshots[index] = snapshot;
    return;
  }

  data.insightsSnapshots.unshift(snapshot);
}

export function upsertSavedView(data: WebDatabase, savedView: SavedViewRecord): void {
  const index = data.savedViews.findIndex((candidate) => candidate.id === savedView.id);
  if (index >= 0) {
    data.savedViews[index] = savedView;
    return;
  }

  data.savedViews.unshift(savedView);
}
