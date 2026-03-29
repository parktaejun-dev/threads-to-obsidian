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
  type BotMentionJobRecord,
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
  type RequestLogRecord,
  type PublicStorefrontResponse,
  type RevenueReport,
  type SavedViewRecord,
  type SearchMonitorRecord,
  type SearchResultRecord,
  type RuntimeDatabaseConfig,
  type StorefrontSettings,
  type TrackedPostRecord,
  type WebhookEventRecord,
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

type RelationalColumnDescriptor<T> = {
  name: string;
  cast?: string;
  getValue: (record: T) => unknown;
};

export function getDatabaseFilePath(): string {
  return getRuntimeConfigSnapshot().database.filePath || DEFAULT_DB_FILE;
}

let databaseOperationChain: Promise<void> = Promise.resolve();
let postgresPool: PgPool | null = null;
let postgresPoolConnectionString: string | null = null;
const ensuredPostgresStores = new Set<string>();
const ensuredPostgresMentionJobStores = new Set<string>();
const ensuredPostgresBotUserStores = new Set<string>();
const ensuredPostgresBotArchiveStores = new Set<string>();
const ensuredPostgresRelationalStores = new Set<string>();
const seededPostgresBotUserStores = new Set<string>();
const seededPostgresBotArchiveStores = new Set<string>();
const seededPostgresRelationalStores = new Set<string>();
let activeDatabaseAccessCount = 0;
let databaseReconfigurationBarrier: Promise<void> | null = null;
let releaseDatabaseReconfigurationBarrier: (() => void) | null = null;
let databaseReconfigurationChain: Promise<void> = Promise.resolve();
const databaseIdleWaiters = new Set<() => void>();

function trimEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

function parsePositiveInteger(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

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

function normalizeThreadsHandle(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/^@+/, "").toLowerCase();
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry): entry is string => Boolean(entry));
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
    plusLicenseId: typeof candidate?.plusLicenseId === "string" ? candidate.plusLicenseId : null,
    plusActivatedAt: typeof candidate?.plusActivatedAt === "string" ? candidate.plusActivatedAt : null,
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
  const webhookEvents = Array.isArray(parsed.webhookEvents)
    ? parsed.webhookEvents as WebhookEventRecord[]
    : [];
  const requestLogs = Array.isArray(parsed.requestLogs)
    ? parsed.requestLogs as RequestLogRecord[]
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
    botMentionJobs: Array.isArray(parsed.botMentionJobs) ? parsed.botMentionJobs : [],
    botArchives: Array.isArray(parsed.botArchives) ? parsed.botArchives : [],
    cloudArchives: Array.isArray(parsed.cloudArchives) ? parsed.cloudArchives : [],
    watchlists: Array.isArray(parsed.watchlists) ? parsed.watchlists : [],
    searchMonitors: Array.isArray(parsed.searchMonitors) ? parsed.searchMonitors : [],
    searchResults: Array.isArray(parsed.searchResults) ? parsed.searchResults : [],
    trackedPosts: Array.isArray(parsed.trackedPosts) ? parsed.trackedPosts : [],
    insightsSnapshots: Array.isArray(parsed.insightsSnapshots) ? parsed.insightsSnapshots : [],
    savedViews: Array.isArray(parsed.savedViews) ? parsed.savedViews : [],
    webhookEvents,
    requestLogs,
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
    await closeDatabaseConnections();
  }

  postgresPool = new Pool({
    connectionString,
    allowExitOnIdle: true,
    connectionTimeoutMillis: parsePositiveInteger(trimEnv("THREADS_WEB_POSTGRES_CONNECTION_TIMEOUT_MS"), 10_000),
    idleTimeoutMillis: parsePositiveInteger(trimEnv("THREADS_WEB_POSTGRES_IDLE_TIMEOUT_MS"), 30_000),
    max: parsePositiveInteger(trimEnv("THREADS_WEB_POSTGRES_MAX"), 10),
    query_timeout: parsePositiveInteger(trimEnv("THREADS_WEB_POSTGRES_QUERY_TIMEOUT_MS"), 15_000),
    statement_timeout: parsePositiveInteger(trimEnv("THREADS_WEB_POSTGRES_STATEMENT_TIMEOUT_MS"), 15_000)
  });
  postgresPool.on("error", (error) => {
    console.error("[threads-web] postgres pool error", error);
  });
  postgresPoolConnectionString = connectionString;
  return postgresPool;
}

export async function closeDatabaseConnections(): Promise<void> {
  if (postgresPool) {
    await postgresPool.end().catch(() => undefined);
    postgresPool = null;
  }

  postgresPoolConnectionString = null;
  ensuredPostgresStores.clear();
  ensuredPostgresMentionJobStores.clear();
  ensuredPostgresBotUserStores.clear();
  ensuredPostgresBotArchiveStores.clear();
  ensuredPostgresRelationalStores.clear();
  seededPostgresBotUserStores.clear();
  seededPostgresBotArchiveStores.clear();
  seededPostgresRelationalStores.clear();
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

function getPostgresMentionJobsTableName(tableName: string): string {
  const parts = tableName.split(".");
  const baseName = parts.pop() ?? DEFAULT_POSTGRES_TABLE;
  return [...parts, `${baseName}_bot_mention_jobs`].join(".");
}

function getPostgresBotUsersTableName(tableName: string): string {
  const parts = tableName.split(".");
  const baseName = parts.pop() ?? DEFAULT_POSTGRES_TABLE;
  return [...parts, `${baseName}_bot_users`].join(".");
}

function getPostgresBotArchivesTableName(tableName: string): string {
  const parts = tableName.split(".");
  const baseName = parts.pop() ?? DEFAULT_POSTGRES_TABLE;
  return [...parts, `${baseName}_bot_archives`].join(".");
}

function getPostgresDerivedTableName(tableName: string, suffix: string): string {
  const parts = tableName.split(".");
  const baseName = parts.pop() ?? DEFAULT_POSTGRES_TABLE;
  return [...parts, `${baseName}_${suffix}`].join(".");
}

function getPostgresBotLoginTokensTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "bot_login_tokens");
}

function getPostgresBotOauthSessionsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "bot_oauth_sessions");
}

function getPostgresBotSessionsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "bot_sessions");
}

function getPostgresBotExtensionLinkSessionsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "bot_extension_link_sessions");
}

function getPostgresBotExtensionAccessTokensTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "bot_extension_access_tokens");
}

function getPostgresCloudArchivesTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "cloud_archives");
}

function getPostgresWatchlistsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "watchlists");
}

function getPostgresSearchMonitorsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "search_monitors");
}

function getPostgresSearchResultsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "search_results");
}

function getPostgresTrackedPostsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "tracked_posts");
}

function getPostgresInsightsSnapshotsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "insights_snapshots");
}

function getPostgresSavedViewsTableName(tableName: string): string {
  return getPostgresDerivedTableName(tableName, "saved_views");
}

async function ensurePostgresMentionJobsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const mentionJobsTableName = getPostgresMentionJobsTableName(tableName);
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${mentionJobsTableName}`;
  if (ensuredPostgresMentionJobStores.has(cacheKey)) {
    return;
  }

  const escapedTableName = escapeQualifiedIdentifier(mentionJobsTableName);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
      id TEXT PRIMARY KEY,
      mention_id TEXT NOT NULL UNIQUE,
      mention_url TEXT,
      mention_author_handle TEXT,
      mention_author_user_id TEXT,
      mention_text TEXT,
      mention_published_at TIMESTAMPTZ,
      raw_summary_json JSONB,
      attempts INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      last_error TEXT,
      available_at TIMESTAMPTZ NOT NULL,
      leased_at TIMESTAMPTZ,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${mentionJobsTableName.replaceAll(".", "_")}_claimable_idx`)}
     ON ${escapedTableName} (status, available_at, created_at)`
  );
  ensuredPostgresMentionJobStores.add(cacheKey);
}

async function ensurePostgresBotUsersStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const botUsersTableName = getPostgresBotUsersTableName(tableName);
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${botUsersTableName}`;
  if (ensuredPostgresBotUserStores.has(cacheKey)) {
    return;
  }

  const escapedTableName = escapeQualifiedIdentifier(botUsersTableName);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
      id TEXT PRIMARY KEY,
      threads_user_id TEXT,
      threads_handle TEXT NOT NULL,
      display_name TEXT,
      profile_picture_url TEXT,
      biography TEXT,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      access_token_ciphertext TEXT,
      token_expires_at TIMESTAMPTZ,
      email TEXT,
      granted_scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
      scope_version INTEGER NOT NULL DEFAULT 0,
      last_scope_upgrade_at TIMESTAMPTZ,
      plus_license_id TEXT,
      plus_activated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      last_login_at TIMESTAMPTZ,
      status TEXT NOT NULL
    )`
  );
  await client.query(`ALTER TABLE ${escapedTableName} ADD COLUMN IF NOT EXISTS plus_license_id TEXT`);
  await client.query(`ALTER TABLE ${escapedTableName} ADD COLUMN IF NOT EXISTS plus_activated_at TIMESTAMPTZ`);
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botUsersTableName.replaceAll(".", "_")}_threads_handle_uidx`)}
     ON ${escapedTableName} (threads_handle)`
  );
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botUsersTableName.replaceAll(".", "_")}_threads_user_id_uidx`)}
     ON ${escapedTableName} (threads_user_id)
     WHERE threads_user_id IS NOT NULL`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botUsersTableName.replaceAll(".", "_")}_active_handle_idx`)}
     ON ${escapedTableName} (status, threads_handle)`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botUsersTableName.replaceAll(".", "_")}_active_user_id_idx`)}
     ON ${escapedTableName} (status, threads_user_id)`
  );
  ensuredPostgresBotUserStores.add(cacheKey);
}

async function ensurePostgresBotArchivesStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const botArchivesTableName = getPostgresBotArchivesTableName(tableName);
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${botArchivesTableName}`;
  if (ensuredPostgresBotArchiveStores.has(cacheKey)) {
    return;
  }

  const escapedTableName = escapeQualifiedIdentifier(botArchivesTableName);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mention_id TEXT,
      mention_url TEXT NOT NULL,
      mention_author_handle TEXT NOT NULL,
      mention_author_display_name TEXT,
      note_text TEXT,
      target_url TEXT NOT NULL,
      target_author_handle TEXT,
      target_author_display_name TEXT,
      target_text TEXT NOT NULL,
      target_published_at TIMESTAMPTZ,
      media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      markdown_content TEXT NOT NULL,
      raw_payload_json TEXT,
      archived_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL
    )`
  );
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botArchivesTableName.replaceAll(".", "_")}_mention_id_uidx`)}
     ON ${escapedTableName} (user_id, mention_id)
     WHERE mention_id IS NOT NULL`
  );
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botArchivesTableName.replaceAll(".", "_")}_mention_url_uidx`)}
     ON ${escapedTableName} (user_id, mention_url)`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botArchivesTableName.replaceAll(".", "_")}_user_updated_idx`)}
     ON ${escapedTableName} (user_id, updated_at DESC)`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${botArchivesTableName.replaceAll(".", "_")}_mention_lookup_idx`)}
     ON ${escapedTableName} (mention_id, mention_url)`
  );
  ensuredPostgresBotArchiveStores.add(cacheKey);
}

async function ensurePostgresRelationalStore(
  client: PgPool | PoolClient,
  tableName: string,
  statements: readonly string[]
): Promise<void> {
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${tableName}`;
  if (ensuredPostgresRelationalStores.has(cacheKey)) {
    return;
  }

  for (const statement of statements) {
    await client.query(statement);
  }
  ensuredPostgresRelationalStores.add(cacheKey);
}

async function upsertPostgresRecords<T extends { id: string }>(
  client: PgPool | PoolClient,
  tableName: string,
  columns: readonly RelationalColumnDescriptor<T>[],
  records: readonly T[]
): Promise<void> {
  if (records.length === 0) {
    return;
  }

  const escapedTableName = escapeQualifiedIdentifier(tableName);
  const escapedColumns = columns.map((column) => escapeQualifiedIdentifier(column.name)).join(", ");
  const values: unknown[] = [];
  const placeholders = records
    .map((record, rowIndex) => {
      const rowPlaceholders = columns
        .map((column, columnIndex) => {
          values.push(column.getValue(record));
          const placeholder = `$${rowIndex * columns.length + columnIndex + 1}`;
          return column.cast ? `${placeholder}::${column.cast}` : placeholder;
        })
        .join(", ");
      return `(${rowPlaceholders})`;
    })
    .join(", ");
  const updateAssignments = columns
    .filter((column) => column.name !== "id")
    .map(
      (column) =>
        `${escapeQualifiedIdentifier(column.name)} = EXCLUDED.${escapeQualifiedIdentifier(column.name)}`
    )
    .join(", ");

  await client.query(
    `INSERT INTO ${escapedTableName} (${escapedColumns})
     VALUES ${placeholders}
     ON CONFLICT (id) DO UPDATE SET ${updateAssignments}`,
    values
  );
}

async function deletePostgresRecords(
  client: PgPool | PoolClient,
  tableName: string,
  ids: readonly string[]
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  await client.query(
    `DELETE FROM ${escapeQualifiedIdentifier(tableName)}
     WHERE id = ANY($1::text[])`,
    [ids]
  );
}

async function loadPostgresRecords<T>(
  client: PgPool | PoolClient,
  tableName: string,
  orderBy: string,
  normalize: (row: Record<string, unknown>) => T
): Promise<T[]> {
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(tableName)}
     ORDER BY ${orderBy}`
  );
  return result.rows.map(normalize);
}

async function maybeSeedPostgresRelationalStore<T extends { id: string }>(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly T[],
  upsert: (client: PgPool | PoolClient, records: readonly T[]) => Promise<void>
): Promise<void> {
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::seed::${tableName}`;
  if (seededPostgresRelationalStores.has(cacheKey)) {
    return;
  }

  const countResult = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${escapeQualifiedIdentifier(tableName)}`
  );
  if ((countResult.rows[0]?.count ?? "0") === "0" && records.length > 0) {
    await upsert(client, records);
  }

  seededPostgresRelationalStores.add(cacheKey);
}

function serializeDatabaseForPostgres(data: WebDatabase): WebDatabase {
  return {
    ...data,
    botUsers: [],
    botLoginTokens: [],
    botOauthSessions: [],
    botSessions: [],
    botExtensionLinkSessions: [],
    botExtensionAccessTokens: [],
    botMentionJobs: [],
    botArchives: [],
    cloudArchives: [],
    watchlists: [],
    searchMonitors: [],
    searchResults: [],
    trackedPosts: [],
    insightsSnapshots: [],
    savedViews: []
  };
}

function toIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizePostgresBotMentionJob(row: Record<string, unknown>): BotMentionJobRecord {
  return {
    id: typeof row.id === "string" ? row.id : typeof row.mention_id === "string" ? row.mention_id : crypto.randomUUID(),
    mentionId: typeof row.mention_id === "string" ? row.mention_id : typeof row.id === "string" ? row.id : "",
    mentionUrl: typeof row.mention_url === "string" ? row.mention_url : null,
    mentionAuthorHandle: typeof row.mention_author_handle === "string" ? row.mention_author_handle : null,
    mentionAuthorUserId: typeof row.mention_author_user_id === "string" ? row.mention_author_user_id : null,
    mentionText: typeof row.mention_text === "string" ? row.mention_text : null,
    mentionPublishedAt: toIsoString(row.mention_published_at),
    rawSummaryJson: row.raw_summary_json == null ? null : JSON.stringify(row.raw_summary_json),
    attempts: typeof row.attempts === "number" ? row.attempts : Number(row.attempts ?? 0),
    status: typeof row.status === "string" ? row.status as BotMentionJobRecord["status"] : "queued",
    lastError: typeof row.last_error === "string" ? row.last_error : null,
    availableAt: toIsoString(row.available_at) ?? new Date().toISOString(),
    leasedAt: toIsoString(row.leased_at),
    processedAt: toIsoString(row.processed_at),
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString()
  };
}

function normalizePostgresBotUser(row: Record<string, unknown>): BotUserRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    threadsUserId: typeof row.threads_user_id === "string" ? row.threads_user_id : null,
    threadsHandle:
      typeof row.threads_handle === "string" ? normalizeThreadsHandle(row.threads_handle) : "",
    displayName: typeof row.display_name === "string" ? row.display_name : null,
    profilePictureUrl: typeof row.profile_picture_url === "string" ? row.profile_picture_url : null,
    biography: typeof row.biography === "string" ? row.biography : null,
    isVerified: row.is_verified === true,
    accessTokenCiphertext:
      typeof row.access_token_ciphertext === "string" ? row.access_token_ciphertext : null,
    tokenExpiresAt: toIsoString(row.token_expires_at),
    email: typeof row.email === "string" ? row.email : null,
    grantedScopes: readStringArray(row.granted_scopes),
    scopeVersion: typeof row.scope_version === "number" ? row.scope_version : Number(row.scope_version ?? 0),
    lastScopeUpgradeAt: toIsoString(row.last_scope_upgrade_at),
    plusLicenseId: typeof row.plus_license_id === "string" ? row.plus_license_id : null,
    plusActivatedAt: toIsoString(row.plus_activated_at),
    createdAt: toIsoString(row.created_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    lastLoginAt: toIsoString(row.last_login_at),
    status: row.status === "disabled" ? "disabled" : "active"
  };
}

function normalizePostgresBotArchive(row: Record<string, unknown>): BotArchiveRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    mentionId: typeof row.mention_id === "string" ? row.mention_id : null,
    mentionUrl: typeof row.mention_url === "string" ? row.mention_url : "",
    mentionAuthorHandle: typeof row.mention_author_handle === "string" ? row.mention_author_handle : "",
    mentionAuthorDisplayName:
      typeof row.mention_author_display_name === "string" ? row.mention_author_display_name : null,
    noteText: typeof row.note_text === "string" ? row.note_text : null,
    targetUrl: typeof row.target_url === "string" ? row.target_url : "",
    targetAuthorHandle: typeof row.target_author_handle === "string" ? row.target_author_handle : null,
    targetAuthorDisplayName:
      typeof row.target_author_display_name === "string" ? row.target_author_display_name : null,
    targetText: typeof row.target_text === "string" ? row.target_text : "",
    targetPublishedAt: toIsoString(row.target_published_at),
    mediaUrls: readStringArray(row.media_urls),
    markdownContent: typeof row.markdown_content === "string" ? row.markdown_content : "",
    rawPayloadJson: typeof row.raw_payload_json === "string" ? row.raw_payload_json : null,
    archivedAt: toIsoString(row.archived_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    status: "saved"
  };
}

function normalizePostgresBotLoginToken(row: Record<string, unknown>): BotLoginTokenRecord {
  const now = new Date().toISOString();
  const status =
    row.status === "consumed" ? "consumed" : row.status === "expired" ? "expired" : "pending";
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    tokenHash: typeof row.token_hash === "string" ? row.token_hash : "",
    requestedHandle: typeof row.requested_handle === "string" ? row.requested_handle : "",
    createdAt: toIsoString(row.created_at) ?? now,
    expiresAt: toIsoString(row.expires_at) ?? now,
    consumedAt: toIsoString(row.consumed_at),
    status
  };
}

function normalizePostgresBotOauthSession(row: Record<string, unknown>): BotOauthSessionRecord {
  const now = new Date().toISOString();
  const status =
    row.status === "completed"
      ? "completed"
      : row.status === "expired"
        ? "expired"
        : row.status === "failed"
          ? "failed"
          : "pending";
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    stateHash: typeof row.state_hash === "string" ? row.state_hash : "",
    pollTokenHash: typeof row.poll_token_hash === "string" ? row.poll_token_hash : "",
    createdAt: toIsoString(row.created_at) ?? now,
    expiresAt: toIsoString(row.expires_at) ?? now,
    completedAt: toIsoString(row.completed_at),
    activationCode: typeof row.activation_code === "string" ? row.activation_code : null,
    activationExpiresAt: toIsoString(row.activation_expires_at),
    linkedSessionToken: typeof row.linked_session_token === "string" ? row.linked_session_token : null,
    status
  };
}

function normalizePostgresBotSession(row: Record<string, unknown>): BotSessionRecord {
  const now = new Date().toISOString();
  const status = row.status === "revoked" ? "revoked" : row.status === "expired" ? "expired" : "active";
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    sessionHash: typeof row.session_hash === "string" ? row.session_hash : "",
    createdAt: toIsoString(row.created_at) ?? now,
    expiresAt: toIsoString(row.expires_at) ?? now,
    lastSeenAt: toIsoString(row.last_seen_at) ?? now,
    revokedAt: toIsoString(row.revoked_at),
    status
  };
}

function normalizePostgresBotExtensionLinkSession(
  row: Record<string, unknown>
): BotExtensionLinkSessionRecord {
  const now = new Date().toISOString();
  const status =
    row.status === "consumed"
      ? "consumed"
      : row.status === "expired"
        ? "expired"
        : row.status === "revoked"
          ? "revoked"
          : "pending";
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    state: typeof row.state === "string" ? row.state : "",
    codeHash: typeof row.code_hash === "string" ? row.code_hash : "",
    createdAt: toIsoString(row.created_at) ?? now,
    expiresAt: toIsoString(row.expires_at) ?? now,
    consumedAt: toIsoString(row.consumed_at),
    revokedAt: toIsoString(row.revoked_at),
    status
  };
}

function normalizePostgresBotExtensionAccessToken(
  row: Record<string, unknown>
): BotExtensionAccessTokenRecord {
  const now = new Date().toISOString();
  const status = row.status === "revoked" ? "revoked" : row.status === "expired" ? "expired" : "active";
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    tokenHash: typeof row.token_hash === "string" ? row.token_hash : "",
    createdAt: toIsoString(row.created_at) ?? now,
    expiresAt: toIsoString(row.expires_at) ?? now,
    linkedAt: toIsoString(row.linked_at) ?? now,
    lastUsedAt: toIsoString(row.last_used_at),
    revokedAt: toIsoString(row.revoked_at),
    status
  };
}

function normalizePostgresCloudArchive(row: Record<string, unknown>): CloudArchiveRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    canonicalUrl: typeof row.canonical_url === "string" ? row.canonical_url : "",
    shortcode: typeof row.shortcode === "string" ? row.shortcode : "",
    targetAuthorHandle: typeof row.target_author_handle === "string" ? row.target_author_handle : null,
    targetAuthorDisplayName:
      typeof row.target_author_display_name === "string" ? row.target_author_display_name : null,
    targetTitle: typeof row.target_title === "string" ? row.target_title : "",
    targetText: typeof row.target_text === "string" ? row.target_text : "",
    targetPublishedAt: toIsoString(row.target_published_at),
    mediaUrls: readStringArray(row.media_urls),
    markdownContent: typeof row.markdown_content === "string" ? row.markdown_content : "",
    rawPayloadJson: typeof row.raw_payload_json === "string" ? row.raw_payload_json : null,
    contentHash: typeof row.content_hash === "string" ? row.content_hash : "",
    savedAt: toIsoString(row.saved_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    status: "saved"
  };
}

const BOT_LOGIN_TOKEN_COLUMNS: readonly RelationalColumnDescriptor<BotLoginTokenRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "token_hash", getValue: (record) => record.tokenHash },
  { name: "requested_handle", getValue: (record) => record.requestedHandle },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "expires_at", cast: "timestamptz", getValue: (record) => record.expiresAt },
  { name: "consumed_at", cast: "timestamptz", getValue: (record) => record.consumedAt },
  { name: "status", getValue: (record) => record.status }
];

const BOT_OAUTH_SESSION_COLUMNS: readonly RelationalColumnDescriptor<BotOauthSessionRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "state_hash", getValue: (record) => record.stateHash },
  { name: "poll_token_hash", getValue: (record) => record.pollTokenHash },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "expires_at", cast: "timestamptz", getValue: (record) => record.expiresAt },
  { name: "completed_at", cast: "timestamptz", getValue: (record) => record.completedAt },
  { name: "activation_code", getValue: (record) => record.activationCode },
  { name: "activation_expires_at", cast: "timestamptz", getValue: (record) => record.activationExpiresAt },
  { name: "linked_session_token", getValue: (record) => record.linkedSessionToken },
  { name: "status", getValue: (record) => record.status }
];

const BOT_SESSION_COLUMNS: readonly RelationalColumnDescriptor<BotSessionRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "session_hash", getValue: (record) => record.sessionHash },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "expires_at", cast: "timestamptz", getValue: (record) => record.expiresAt },
  { name: "last_seen_at", cast: "timestamptz", getValue: (record) => record.lastSeenAt },
  { name: "revoked_at", cast: "timestamptz", getValue: (record) => record.revokedAt },
  { name: "status", getValue: (record) => record.status }
];

const BOT_EXTENSION_LINK_SESSION_COLUMNS: readonly RelationalColumnDescriptor<BotExtensionLinkSessionRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "state", getValue: (record) => record.state },
  { name: "code_hash", getValue: (record) => record.codeHash },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "expires_at", cast: "timestamptz", getValue: (record) => record.expiresAt },
  { name: "consumed_at", cast: "timestamptz", getValue: (record) => record.consumedAt },
  { name: "revoked_at", cast: "timestamptz", getValue: (record) => record.revokedAt },
  { name: "status", getValue: (record) => record.status }
];

const BOT_EXTENSION_ACCESS_TOKEN_COLUMNS: readonly RelationalColumnDescriptor<BotExtensionAccessTokenRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "token_hash", getValue: (record) => record.tokenHash },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "expires_at", cast: "timestamptz", getValue: (record) => record.expiresAt },
  { name: "linked_at", cast: "timestamptz", getValue: (record) => record.linkedAt },
  { name: "last_used_at", cast: "timestamptz", getValue: (record) => record.lastUsedAt },
  { name: "revoked_at", cast: "timestamptz", getValue: (record) => record.revokedAt },
  { name: "status", getValue: (record) => record.status }
];

const CLOUD_ARCHIVE_COLUMNS: readonly RelationalColumnDescriptor<CloudArchiveRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "canonical_url", getValue: (record) => record.canonicalUrl },
  { name: "shortcode", getValue: (record) => record.shortcode },
  { name: "target_author_handle", getValue: (record) => record.targetAuthorHandle },
  { name: "target_author_display_name", getValue: (record) => record.targetAuthorDisplayName },
  { name: "target_title", getValue: (record) => record.targetTitle },
  { name: "target_text", getValue: (record) => record.targetText },
  { name: "target_published_at", cast: "timestamptz", getValue: (record) => record.targetPublishedAt },
  { name: "media_urls", cast: "jsonb", getValue: (record) => JSON.stringify(record.mediaUrls) },
  { name: "markdown_content", getValue: (record) => record.markdownContent },
  { name: "raw_payload_json", getValue: (record) => record.rawPayloadJson },
  { name: "content_hash", getValue: (record) => record.contentHash },
  { name: "saved_at", cast: "timestamptz", getValue: (record) => record.savedAt },
  { name: "updated_at", cast: "timestamptz", getValue: (record) => record.updatedAt },
  { name: "status", getValue: (record) => record.status }
];

async function ensurePostgresBotLoginTokensStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresBotLoginTokensTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       token_hash TEXT NOT NULL UNIQUE,
       requested_handle TEXT NOT NULL,
       created_at TIMESTAMPTZ NOT NULL,
       expires_at TIMESTAMPTZ NOT NULL,
       consumed_at TIMESTAMPTZ,
       status TEXT NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_expires_idx`)}
     ON ${escapedTableName} (expires_at)`
  ]);
}

async function ensurePostgresBotOauthSessionsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresBotOauthSessionsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       state_hash TEXT NOT NULL UNIQUE,
       poll_token_hash TEXT NOT NULL UNIQUE,
       created_at TIMESTAMPTZ NOT NULL,
       expires_at TIMESTAMPTZ NOT NULL,
       completed_at TIMESTAMPTZ,
       activation_code TEXT UNIQUE,
       activation_expires_at TIMESTAMPTZ,
       linked_session_token TEXT,
       status TEXT NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_status_idx`)}
     ON ${escapedTableName} (status, expires_at, created_at DESC)`
  ]);
}

async function ensurePostgresBotSessionsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresBotSessionsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       session_hash TEXT NOT NULL UNIQUE,
       created_at TIMESTAMPTZ NOT NULL,
       expires_at TIMESTAMPTZ NOT NULL,
       last_seen_at TIMESTAMPTZ NOT NULL,
       revoked_at TIMESTAMPTZ,
       status TEXT NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, last_seen_at DESC)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_expires_idx`)}
     ON ${escapedTableName} (expires_at)`
  ]);
}

async function ensurePostgresBotExtensionLinkSessionsStore(
  client: PgPool | PoolClient,
  tableName: string
): Promise<void> {
  const fullTableName = getPostgresBotExtensionLinkSessionsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       state TEXT NOT NULL UNIQUE,
       code_hash TEXT NOT NULL UNIQUE,
       created_at TIMESTAMPTZ NOT NULL,
       expires_at TIMESTAMPTZ NOT NULL,
       consumed_at TIMESTAMPTZ,
       revoked_at TIMESTAMPTZ,
       status TEXT NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_expires_idx`)}
     ON ${escapedTableName} (expires_at)`
  ]);
}

async function ensurePostgresBotExtensionAccessTokensStore(
  client: PgPool | PoolClient,
  tableName: string
): Promise<void> {
  const fullTableName = getPostgresBotExtensionAccessTokensTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       token_hash TEXT NOT NULL UNIQUE,
       created_at TIMESTAMPTZ NOT NULL,
       expires_at TIMESTAMPTZ NOT NULL,
       linked_at TIMESTAMPTZ NOT NULL,
       last_used_at TIMESTAMPTZ,
       revoked_at TIMESTAMPTZ,
       status TEXT NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, linked_at DESC)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_expires_idx`)}
     ON ${escapedTableName} (expires_at)`
  ]);
}

async function ensurePostgresCloudArchivesStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresCloudArchivesTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       canonical_url TEXT NOT NULL,
       shortcode TEXT NOT NULL,
       target_author_handle TEXT,
       target_author_display_name TEXT,
       target_title TEXT NOT NULL,
       target_text TEXT NOT NULL,
       target_published_at TIMESTAMPTZ,
       media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
       markdown_content TEXT NOT NULL,
       raw_payload_json TEXT,
       content_hash TEXT NOT NULL,
       saved_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL,
       status TEXT NOT NULL
     )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_canonical_url_uidx`)}
     ON ${escapedTableName} (user_id, canonical_url)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_content_hash_uidx`)}
     ON ${escapedTableName} (user_id, content_hash)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_updated_idx`)}
     ON ${escapedTableName} (user_id, updated_at DESC)`
  ]);
}

async function upsertPostgresBotLoginTokens(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly BotLoginTokenRecord[]
): Promise<void> {
  await ensurePostgresBotLoginTokensStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresBotLoginTokensTableName(tableName), BOT_LOGIN_TOKEN_COLUMNS, records);
}

async function upsertPostgresBotOauthSessions(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly BotOauthSessionRecord[]
): Promise<void> {
  await ensurePostgresBotOauthSessionsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresBotOauthSessionsTableName(tableName), BOT_OAUTH_SESSION_COLUMNS, records);
}

async function upsertPostgresBotSessions(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly BotSessionRecord[]
): Promise<void> {
  await ensurePostgresBotSessionsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresBotSessionsTableName(tableName), BOT_SESSION_COLUMNS, records);
}

async function upsertPostgresBotExtensionLinkSessions(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly BotExtensionLinkSessionRecord[]
): Promise<void> {
  await ensurePostgresBotExtensionLinkSessionsStore(client, tableName);
  await upsertPostgresRecords(
    client,
    getPostgresBotExtensionLinkSessionsTableName(tableName),
    BOT_EXTENSION_LINK_SESSION_COLUMNS,
    records
  );
}

async function upsertPostgresBotExtensionAccessTokens(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly BotExtensionAccessTokenRecord[]
): Promise<void> {
  await ensurePostgresBotExtensionAccessTokensStore(client, tableName);
  await upsertPostgresRecords(
    client,
    getPostgresBotExtensionAccessTokensTableName(tableName),
    BOT_EXTENSION_ACCESS_TOKEN_COLUMNS,
    records
  );
}

async function upsertPostgresCloudArchives(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly CloudArchiveRecord[]
): Promise<void> {
  await ensurePostgresCloudArchivesStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresCloudArchivesTableName(tableName), CLOUD_ARCHIVE_COLUMNS, records);
}

async function loadPostgresBotLoginTokens(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotLoginTokenRecord[] = []
): Promise<BotLoginTokenRecord[]> {
  const tableName = getPostgresBotLoginTokensTableName(backend.tableName);
  await ensurePostgresBotLoginTokensStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresBotLoginTokens(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "created_at DESC", normalizePostgresBotLoginToken);
}

async function loadPostgresBotOauthSessions(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotOauthSessionRecord[] = []
): Promise<BotOauthSessionRecord[]> {
  const tableName = getPostgresBotOauthSessionsTableName(backend.tableName);
  await ensurePostgresBotOauthSessionsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresBotOauthSessions(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "created_at DESC", normalizePostgresBotOauthSession);
}

async function loadPostgresBotSessions(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotSessionRecord[] = []
): Promise<BotSessionRecord[]> {
  const tableName = getPostgresBotSessionsTableName(backend.tableName);
  await ensurePostgresBotSessionsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresBotSessions(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "last_seen_at DESC, created_at DESC", normalizePostgresBotSession);
}

async function loadPostgresBotExtensionLinkSessions(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotExtensionLinkSessionRecord[] = []
): Promise<BotExtensionLinkSessionRecord[]> {
  const tableName = getPostgresBotExtensionLinkSessionsTableName(backend.tableName);
  await ensurePostgresBotExtensionLinkSessionsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresBotExtensionLinkSessions(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(
    client,
    tableName,
    "created_at DESC",
    normalizePostgresBotExtensionLinkSession
  );
}

async function loadPostgresBotExtensionAccessTokens(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotExtensionAccessTokenRecord[] = []
): Promise<BotExtensionAccessTokenRecord[]> {
  const tableName = getPostgresBotExtensionAccessTokensTableName(backend.tableName);
  await ensurePostgresBotExtensionAccessTokensStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresBotExtensionAccessTokens(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(
    client,
    tableName,
    "linked_at DESC, created_at DESC",
    normalizePostgresBotExtensionAccessToken
  );
}

async function loadPostgresCloudArchives(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly CloudArchiveRecord[] = []
): Promise<CloudArchiveRecord[]> {
  const tableName = getPostgresCloudArchivesTableName(backend.tableName);
  await ensurePostgresCloudArchivesStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresCloudArchives(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "updated_at DESC, saved_at DESC", normalizePostgresCloudArchive);
}

function normalizePostgresWatchlist(row: Record<string, unknown>): WatchlistRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    targetHandle: typeof row.target_handle === "string" ? row.target_handle : "",
    targetThreadsUserId: typeof row.target_threads_user_id === "string" ? row.target_threads_user_id : null,
    targetDisplayName: typeof row.target_display_name === "string" ? row.target_display_name : null,
    targetProfilePictureUrl:
      typeof row.target_profile_picture_url === "string" ? row.target_profile_picture_url : null,
    includeText: typeof row.include_text === "string" ? row.include_text : "",
    excludeText: typeof row.exclude_text === "string" ? row.exclude_text : "",
    mediaTypes: readStringArray(row.media_types),
    autoArchive: row.auto_archive === true,
    digestCadence:
      row.digest_cadence === "daily" ? "daily" : row.digest_cadence === "weekly" ? "weekly" : "off",
    lastCursor: typeof row.last_cursor === "string" ? row.last_cursor : null,
    lastSyncedAt: toIsoString(row.last_synced_at),
    lastError: typeof row.last_error === "string" ? row.last_error : null,
    createdAt: toIsoString(row.created_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    status: row.status === "paused" ? "paused" : "active"
  };
}

function normalizePostgresSearchMonitor(row: Record<string, unknown>): SearchMonitorRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    query: typeof row.query === "string" ? row.query : "",
    authorHandle: typeof row.author_handle === "string" ? row.author_handle : null,
    excludeHandles: readStringArray(row.exclude_handles),
    autoArchive: row.auto_archive === true,
    searchType: row.search_type === "recent" ? "recent" : "top",
    lastCursor: typeof row.last_cursor === "string" ? row.last_cursor : null,
    lastRunAt: toIsoString(row.last_run_at),
    lastError: typeof row.last_error === "string" ? row.last_error : null,
    createdAt: toIsoString(row.created_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    status: row.status === "paused" ? "paused" : "active"
  };
}

function normalizePostgresSearchResult(row: Record<string, unknown>): SearchResultRecord {
  const now = new Date().toISOString();
  const status =
    row.status === "archived" ? "archived" : row.status === "dismissed" ? "dismissed" : "new";
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    monitorId: typeof row.monitor_id === "string" ? row.monitor_id : "",
    externalPostId: typeof row.external_post_id === "string" ? row.external_post_id : "",
    canonicalUrl: typeof row.canonical_url === "string" ? row.canonical_url : "",
    authorHandle: typeof row.author_handle === "string" ? row.author_handle : "",
    authorDisplayName: typeof row.author_display_name === "string" ? row.author_display_name : null,
    text: typeof row.text === "string" ? row.text : "",
    publishedAt: toIsoString(row.published_at),
    mediaType: typeof row.media_type === "string" ? row.media_type : null,
    mediaUrls: readStringArray(row.media_urls),
    matchedTerms: readStringArray(row.matched_terms),
    relevanceScore: toNullableNumber(row.relevance_score),
    archiveId: typeof row.archive_id === "string" ? row.archive_id : null,
    archivedAt: toIsoString(row.archived_at),
    dismissedAt: toIsoString(row.dismissed_at),
    discoveredAt: toIsoString(row.discovered_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    rawPayloadJson: typeof row.raw_payload_json === "string" ? row.raw_payload_json : null,
    status
  };
}

function normalizePostgresTrackedPost(row: Record<string, unknown>): TrackedPostRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    origin: row.origin === "insight" ? "insight" : "watchlist",
    sourceId: typeof row.source_id === "string" ? row.source_id : null,
    externalPostId: typeof row.external_post_id === "string" ? row.external_post_id : "",
    canonicalUrl: typeof row.canonical_url === "string" ? row.canonical_url : "",
    authorHandle: typeof row.author_handle === "string" ? row.author_handle : "",
    authorDisplayName: typeof row.author_display_name === "string" ? row.author_display_name : null,
    text: typeof row.text === "string" ? row.text : "",
    publishedAt: toIsoString(row.published_at),
    mediaType: typeof row.media_type === "string" ? row.media_type : null,
    mediaUrls: readStringArray(row.media_urls),
    matchedTerms: readStringArray(row.matched_terms),
    relevanceScore: toNullableNumber(row.relevance_score),
    archiveId: typeof row.archive_id === "string" ? row.archive_id : null,
    archivedAt: toIsoString(row.archived_at),
    discoveredAt: toIsoString(row.discovered_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    rawPayloadJson: typeof row.raw_payload_json === "string" ? row.raw_payload_json : null
  };
}

function normalizePostgresInsightsSnapshot(row: Record<string, unknown>): InsightsSnapshotRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    kind: row.kind === "post" ? "post" : "profile",
    externalPostId: typeof row.external_post_id === "string" ? row.external_post_id : null,
    canonicalUrl: typeof row.canonical_url === "string" ? row.canonical_url : null,
    title: typeof row.title === "string" ? row.title : null,
    likes: toNullableNumber(row.likes),
    replies: toNullableNumber(row.replies),
    reposts: toNullableNumber(row.reposts),
    quotes: toNullableNumber(row.quotes),
    views: toNullableNumber(row.views),
    followers: toNullableNumber(row.followers),
    profileViews: toNullableNumber(row.profile_views),
    capturedAt: toIsoString(row.captured_at) ?? now,
    rawPayloadJson: typeof row.raw_payload_json === "string" ? row.raw_payload_json : null
  };
}

function normalizePostgresSavedView(row: Record<string, unknown>): SavedViewRecord {
  const now = new Date().toISOString();
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    userId: typeof row.user_id === "string" ? row.user_id : "",
    name: typeof row.name === "string" ? row.name : "",
    kind: row.kind === "search" ? "search" : row.kind === "insight" ? "insight" : "watchlist",
    targetIds: readStringArray(row.target_ids),
    createdAt: toIsoString(row.created_at) ?? now,
    updatedAt: toIsoString(row.updated_at) ?? now,
    status: "active"
  };
}

const WATCHLIST_COLUMNS: readonly RelationalColumnDescriptor<WatchlistRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "target_handle", getValue: (record) => record.targetHandle },
  { name: "target_threads_user_id", getValue: (record) => record.targetThreadsUserId },
  { name: "target_display_name", getValue: (record) => record.targetDisplayName },
  { name: "target_profile_picture_url", getValue: (record) => record.targetProfilePictureUrl },
  { name: "include_text", getValue: (record) => record.includeText },
  { name: "exclude_text", getValue: (record) => record.excludeText },
  { name: "media_types", cast: "jsonb", getValue: (record) => JSON.stringify(record.mediaTypes) },
  { name: "auto_archive", getValue: (record) => record.autoArchive },
  { name: "digest_cadence", getValue: (record) => record.digestCadence },
  { name: "last_cursor", getValue: (record) => record.lastCursor },
  { name: "last_synced_at", cast: "timestamptz", getValue: (record) => record.lastSyncedAt },
  { name: "last_error", getValue: (record) => record.lastError },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "updated_at", cast: "timestamptz", getValue: (record) => record.updatedAt },
  { name: "status", getValue: (record) => record.status }
];

const SEARCH_MONITOR_COLUMNS: readonly RelationalColumnDescriptor<SearchMonitorRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "query", getValue: (record) => record.query },
  { name: "author_handle", getValue: (record) => record.authorHandle },
  { name: "exclude_handles", cast: "jsonb", getValue: (record) => JSON.stringify(record.excludeHandles) },
  { name: "auto_archive", getValue: (record) => record.autoArchive },
  { name: "search_type", getValue: (record) => record.searchType },
  { name: "last_cursor", getValue: (record) => record.lastCursor },
  { name: "last_run_at", cast: "timestamptz", getValue: (record) => record.lastRunAt },
  { name: "last_error", getValue: (record) => record.lastError },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "updated_at", cast: "timestamptz", getValue: (record) => record.updatedAt },
  { name: "status", getValue: (record) => record.status }
];

const SEARCH_RESULT_COLUMNS: readonly RelationalColumnDescriptor<SearchResultRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "monitor_id", getValue: (record) => record.monitorId },
  { name: "external_post_id", getValue: (record) => record.externalPostId },
  { name: "canonical_url", getValue: (record) => record.canonicalUrl },
  { name: "author_handle", getValue: (record) => record.authorHandle },
  { name: "author_display_name", getValue: (record) => record.authorDisplayName },
  { name: "text", getValue: (record) => record.text },
  { name: "published_at", cast: "timestamptz", getValue: (record) => record.publishedAt },
  { name: "media_type", getValue: (record) => record.mediaType },
  { name: "media_urls", cast: "jsonb", getValue: (record) => JSON.stringify(record.mediaUrls) },
  { name: "matched_terms", cast: "jsonb", getValue: (record) => JSON.stringify(record.matchedTerms) },
  { name: "relevance_score", cast: "double precision", getValue: (record) => record.relevanceScore },
  { name: "archive_id", getValue: (record) => record.archiveId },
  { name: "archived_at", cast: "timestamptz", getValue: (record) => record.archivedAt },
  { name: "dismissed_at", cast: "timestamptz", getValue: (record) => record.dismissedAt },
  { name: "discovered_at", cast: "timestamptz", getValue: (record) => record.discoveredAt },
  { name: "updated_at", cast: "timestamptz", getValue: (record) => record.updatedAt },
  { name: "raw_payload_json", getValue: (record) => record.rawPayloadJson },
  { name: "status", getValue: (record) => record.status }
];

const TRACKED_POST_COLUMNS: readonly RelationalColumnDescriptor<TrackedPostRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "origin", getValue: (record) => record.origin },
  { name: "source_id", getValue: (record) => record.sourceId },
  { name: "external_post_id", getValue: (record) => record.externalPostId },
  { name: "canonical_url", getValue: (record) => record.canonicalUrl },
  { name: "author_handle", getValue: (record) => record.authorHandle },
  { name: "author_display_name", getValue: (record) => record.authorDisplayName },
  { name: "text", getValue: (record) => record.text },
  { name: "published_at", cast: "timestamptz", getValue: (record) => record.publishedAt },
  { name: "media_type", getValue: (record) => record.mediaType },
  { name: "media_urls", cast: "jsonb", getValue: (record) => JSON.stringify(record.mediaUrls) },
  { name: "matched_terms", cast: "jsonb", getValue: (record) => JSON.stringify(record.matchedTerms) },
  { name: "relevance_score", cast: "double precision", getValue: (record) => record.relevanceScore },
  { name: "archive_id", getValue: (record) => record.archiveId },
  { name: "archived_at", cast: "timestamptz", getValue: (record) => record.archivedAt },
  { name: "discovered_at", cast: "timestamptz", getValue: (record) => record.discoveredAt },
  { name: "updated_at", cast: "timestamptz", getValue: (record) => record.updatedAt },
  { name: "raw_payload_json", getValue: (record) => record.rawPayloadJson }
];

const INSIGHTS_SNAPSHOT_COLUMNS: readonly RelationalColumnDescriptor<InsightsSnapshotRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "kind", getValue: (record) => record.kind },
  { name: "external_post_id", getValue: (record) => record.externalPostId },
  { name: "canonical_url", getValue: (record) => record.canonicalUrl },
  { name: "title", getValue: (record) => record.title },
  { name: "likes", cast: "bigint", getValue: (record) => record.likes },
  { name: "replies", cast: "bigint", getValue: (record) => record.replies },
  { name: "reposts", cast: "bigint", getValue: (record) => record.reposts },
  { name: "quotes", cast: "bigint", getValue: (record) => record.quotes },
  { name: "views", cast: "bigint", getValue: (record) => record.views },
  { name: "followers", cast: "bigint", getValue: (record) => record.followers },
  { name: "profile_views", cast: "bigint", getValue: (record) => record.profileViews },
  { name: "captured_at", cast: "timestamptz", getValue: (record) => record.capturedAt },
  { name: "raw_payload_json", getValue: (record) => record.rawPayloadJson }
];

const SAVED_VIEW_COLUMNS: readonly RelationalColumnDescriptor<SavedViewRecord>[] = [
  { name: "id", getValue: (record) => record.id },
  { name: "user_id", getValue: (record) => record.userId },
  { name: "name", getValue: (record) => record.name },
  { name: "kind", getValue: (record) => record.kind },
  { name: "target_ids", cast: "jsonb", getValue: (record) => JSON.stringify(record.targetIds) },
  { name: "created_at", cast: "timestamptz", getValue: (record) => record.createdAt },
  { name: "updated_at", cast: "timestamptz", getValue: (record) => record.updatedAt },
  { name: "status", getValue: (record) => record.status }
];

async function ensurePostgresWatchlistsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresWatchlistsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       target_handle TEXT NOT NULL,
       target_threads_user_id TEXT,
       target_display_name TEXT,
       target_profile_picture_url TEXT,
       include_text TEXT NOT NULL DEFAULT '',
       exclude_text TEXT NOT NULL DEFAULT '',
       media_types JSONB NOT NULL DEFAULT '[]'::jsonb,
       auto_archive BOOLEAN NOT NULL DEFAULT FALSE,
       digest_cadence TEXT NOT NULL DEFAULT 'off',
       last_cursor TEXT,
       last_synced_at TIMESTAMPTZ,
       last_error TEXT,
       created_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL,
       status TEXT NOT NULL
     )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_target_handle_uidx`)}
     ON ${escapedTableName} (user_id, target_handle)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, updated_at DESC)`
  ]);
}

async function ensurePostgresSearchMonitorsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresSearchMonitorsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       query TEXT NOT NULL,
       author_handle TEXT,
       exclude_handles JSONB NOT NULL DEFAULT '[]'::jsonb,
       auto_archive BOOLEAN NOT NULL DEFAULT FALSE,
       search_type TEXT NOT NULL DEFAULT 'top',
       last_cursor TEXT,
       last_run_at TIMESTAMPTZ,
       last_error TEXT,
       created_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL,
       status TEXT NOT NULL
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, updated_at DESC)`
  ]);
}

async function ensurePostgresSearchResultsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresSearchResultsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       monitor_id TEXT NOT NULL,
       external_post_id TEXT NOT NULL,
       canonical_url TEXT NOT NULL,
       author_handle TEXT NOT NULL,
       author_display_name TEXT,
       text TEXT NOT NULL,
       published_at TIMESTAMPTZ,
       media_type TEXT,
       media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
       matched_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
       relevance_score DOUBLE PRECISION,
       archive_id TEXT,
       archived_at TIMESTAMPTZ,
       dismissed_at TIMESTAMPTZ,
       discovered_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL,
       raw_payload_json TEXT,
       status TEXT NOT NULL
     )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_monitor_external_uidx`)}
     ON ${escapedTableName} (user_id, monitor_id, external_post_id)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_status_idx`)}
     ON ${escapedTableName} (user_id, status, discovered_at DESC)`
  ]);
}

async function ensurePostgresTrackedPostsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresTrackedPostsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       origin TEXT NOT NULL,
       source_id TEXT,
       external_post_id TEXT NOT NULL,
       canonical_url TEXT NOT NULL,
       author_handle TEXT NOT NULL,
       author_display_name TEXT,
       text TEXT NOT NULL,
       published_at TIMESTAMPTZ,
       media_type TEXT,
       media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
       matched_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
       relevance_score DOUBLE PRECISION,
       archive_id TEXT,
       archived_at TIMESTAMPTZ,
       discovered_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL,
       raw_payload_json TEXT
     )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_source_external_uidx`)}
     ON ${escapedTableName} (user_id, origin, COALESCE(source_id, ''), external_post_id)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_origin_idx`)}
     ON ${escapedTableName} (user_id, origin, discovered_at DESC)`
  ]);
}

async function ensurePostgresInsightsSnapshotsStore(
  client: PgPool | PoolClient,
  tableName: string
): Promise<void> {
  const fullTableName = getPostgresInsightsSnapshotsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       kind TEXT NOT NULL,
       external_post_id TEXT,
       canonical_url TEXT,
       title TEXT,
       likes BIGINT,
       replies BIGINT,
       reposts BIGINT,
       quotes BIGINT,
       views BIGINT,
       followers BIGINT,
       profile_views BIGINT,
       captured_at TIMESTAMPTZ NOT NULL,
       raw_payload_json TEXT
     )`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_kind_idx`)}
     ON ${escapedTableName} (user_id, kind, captured_at DESC)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_external_post_idx`)}
     ON ${escapedTableName} (user_id, external_post_id, captured_at DESC)`
  ]);
}

async function ensurePostgresSavedViewsStore(client: PgPool | PoolClient, tableName: string): Promise<void> {
  const fullTableName = getPostgresSavedViewsTableName(tableName);
  const escapedTableName = escapeQualifiedIdentifier(fullTableName);
  await ensurePostgresRelationalStore(client, fullTableName, [
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       name TEXT NOT NULL,
       kind TEXT NOT NULL,
       target_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
       created_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL,
       status TEXT NOT NULL
     )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_name_uidx`)}
     ON ${escapedTableName} (user_id, name)`,
    `CREATE INDEX IF NOT EXISTS ${escapeQualifiedIdentifier(`${fullTableName.replaceAll(".", "_")}_user_kind_idx`)}
     ON ${escapedTableName} (user_id, kind, updated_at DESC)`
  ]);
}

async function upsertPostgresWatchlists(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly WatchlistRecord[]
): Promise<void> {
  await ensurePostgresWatchlistsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresWatchlistsTableName(tableName), WATCHLIST_COLUMNS, records);
}

async function upsertPostgresSearchMonitors(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly SearchMonitorRecord[]
): Promise<void> {
  await ensurePostgresSearchMonitorsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresSearchMonitorsTableName(tableName), SEARCH_MONITOR_COLUMNS, records);
}

async function upsertPostgresSearchResults(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly SearchResultRecord[]
): Promise<void> {
  await ensurePostgresSearchResultsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresSearchResultsTableName(tableName), SEARCH_RESULT_COLUMNS, records);
}

async function upsertPostgresTrackedPosts(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly TrackedPostRecord[]
): Promise<void> {
  await ensurePostgresTrackedPostsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresTrackedPostsTableName(tableName), TRACKED_POST_COLUMNS, records);
}

async function upsertPostgresInsightsSnapshots(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly InsightsSnapshotRecord[]
): Promise<void> {
  await ensurePostgresInsightsSnapshotsStore(client, tableName);
  await upsertPostgresRecords(
    client,
    getPostgresInsightsSnapshotsTableName(tableName),
    INSIGHTS_SNAPSHOT_COLUMNS,
    records
  );
}

async function upsertPostgresSavedViews(
  client: PgPool | PoolClient,
  tableName: string,
  records: readonly SavedViewRecord[]
): Promise<void> {
  await ensurePostgresSavedViewsStore(client, tableName);
  await upsertPostgresRecords(client, getPostgresSavedViewsTableName(tableName), SAVED_VIEW_COLUMNS, records);
}

async function loadPostgresWatchlists(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly WatchlistRecord[] = []
): Promise<WatchlistRecord[]> {
  const tableName = getPostgresWatchlistsTableName(backend.tableName);
  await ensurePostgresWatchlistsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresWatchlists(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "updated_at DESC, created_at DESC", normalizePostgresWatchlist);
}

async function loadPostgresSearchMonitors(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly SearchMonitorRecord[] = []
): Promise<SearchMonitorRecord[]> {
  const tableName = getPostgresSearchMonitorsTableName(backend.tableName);
  await ensurePostgresSearchMonitorsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresSearchMonitors(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(
    client,
    tableName,
    "updated_at DESC, created_at DESC",
    normalizePostgresSearchMonitor
  );
}

async function loadPostgresSearchResults(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly SearchResultRecord[] = []
): Promise<SearchResultRecord[]> {
  const tableName = getPostgresSearchResultsTableName(backend.tableName);
  await ensurePostgresSearchResultsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresSearchResults(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(
    client,
    tableName,
    "discovered_at DESC, updated_at DESC",
    normalizePostgresSearchResult
  );
}

async function loadPostgresTrackedPosts(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly TrackedPostRecord[] = []
): Promise<TrackedPostRecord[]> {
  const tableName = getPostgresTrackedPostsTableName(backend.tableName);
  await ensurePostgresTrackedPostsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresTrackedPosts(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "discovered_at DESC, updated_at DESC", normalizePostgresTrackedPost);
}

async function loadPostgresInsightsSnapshots(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly InsightsSnapshotRecord[] = []
): Promise<InsightsSnapshotRecord[]> {
  const tableName = getPostgresInsightsSnapshotsTableName(backend.tableName);
  await ensurePostgresInsightsSnapshotsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresInsightsSnapshots(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "captured_at DESC", normalizePostgresInsightsSnapshot);
}

async function loadPostgresSavedViews(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly SavedViewRecord[] = []
): Promise<SavedViewRecord[]> {
  const tableName = getPostgresSavedViewsTableName(backend.tableName);
  await ensurePostgresSavedViewsStore(client, backend.tableName);
  await maybeSeedPostgresRelationalStore(client, tableName, seedRecords, async (currentClient, records) =>
    upsertPostgresSavedViews(currentClient, backend.tableName, records)
  );
  return loadPostgresRecords(client, tableName, "updated_at DESC, created_at DESC", normalizePostgresSavedView);
}

async function findPostgresBotUserById(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<BotUserRecord | null> {
  await ensurePostgresBotUsersStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotUsersTableName(backend.tableName))}
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? normalizePostgresBotUser(result.rows[0]) : null;
}

async function findPostgresBotSessionByHash(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  sessionHash: string
): Promise<BotSessionRecord | null> {
  await ensurePostgresBotSessionsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotSessionsTableName(backend.tableName))}
     WHERE session_hash = $1
     LIMIT 1`,
    [sessionHash]
  );
  return result.rows[0] ? normalizePostgresBotSession(result.rows[0]) : null;
}

async function findPostgresBotExtensionAccessTokenByHash(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  tokenHash: string
): Promise<BotExtensionAccessTokenRecord | null> {
  await ensurePostgresBotExtensionAccessTokensStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotExtensionAccessTokensTableName(backend.tableName))}
     WHERE token_hash = $1
     LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] ? normalizePostgresBotExtensionAccessToken(result.rows[0]) : null;
}

async function loadPostgresBotLoginTokensForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<BotLoginTokenRecord[]> {
  await ensurePostgresBotLoginTokensStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotLoginTokensTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresBotLoginToken);
}

async function loadPostgresBotSessionsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<BotSessionRecord[]> {
  await ensurePostgresBotSessionsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotSessionsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY last_seen_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresBotSession);
}

async function loadPostgresBotExtensionLinkSessionsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<BotExtensionLinkSessionRecord[]> {
  await ensurePostgresBotExtensionLinkSessionsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotExtensionLinkSessionsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresBotExtensionLinkSession);
}

async function loadPostgresBotExtensionAccessTokensForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<BotExtensionAccessTokenRecord[]> {
  await ensurePostgresBotExtensionAccessTokensStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotExtensionAccessTokensTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY linked_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresBotExtensionAccessToken);
}

async function loadPostgresBotArchivesForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<BotArchiveRecord[]> {
  await ensurePostgresBotArchivesStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY updated_at DESC, archived_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresBotArchive);
}

async function loadPostgresCloudArchivesForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<CloudArchiveRecord[]> {
  await ensurePostgresCloudArchivesStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresCloudArchivesTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY updated_at DESC, saved_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresCloudArchive);
}

async function loadPostgresWatchlistsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<WatchlistRecord[]> {
  await ensurePostgresWatchlistsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresWatchlistsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY updated_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresWatchlist);
}

async function loadPostgresSearchMonitorsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<SearchMonitorRecord[]> {
  await ensurePostgresSearchMonitorsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresSearchMonitorsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY updated_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresSearchMonitor);
}

async function loadPostgresSearchResultsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<SearchResultRecord[]> {
  await ensurePostgresSearchResultsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresSearchResultsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY discovered_at DESC, updated_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresSearchResult);
}

async function loadPostgresTrackedPostsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<TrackedPostRecord[]> {
  await ensurePostgresTrackedPostsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresTrackedPostsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY discovered_at DESC, updated_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresTrackedPost);
}

async function loadPostgresInsightsSnapshotsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<InsightsSnapshotRecord[]> {
  await ensurePostgresInsightsSnapshotsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresInsightsSnapshotsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY captured_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresInsightsSnapshot);
}

async function loadPostgresSavedViewsForUser(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<SavedViewRecord[]> {
  await ensurePostgresSavedViewsStore(client, backend.tableName);
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapeQualifiedIdentifier(getPostgresSavedViewsTableName(backend.tableName))}
     WHERE user_id = $1
     ORDER BY updated_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizePostgresSavedView);
}

async function upsertPostgresBotUsers(
  client: PgPool | PoolClient,
  tableName: string,
  users: readonly BotUserRecord[]
): Promise<void> {
  if (users.length === 0) {
    return;
  }

  await ensurePostgresBotUsersStore(client, tableName);
  const escapedTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(tableName));
  const values: unknown[] = [];
  const placeholders = users
    .map((user, index) => {
      const offset = index * 19;
      values.push(
        user.id,
        user.threadsUserId,
        normalizeThreadsHandle(user.threadsHandle),
        user.displayName,
        user.profilePictureUrl,
        user.biography,
        user.isVerified,
        user.accessTokenCiphertext,
        user.tokenExpiresAt,
        user.email,
        JSON.stringify(user.grantedScopes),
        user.scopeVersion,
        user.lastScopeUpgradeAt,
        user.plusLicenseId ?? null,
        user.plusActivatedAt ?? null,
        user.createdAt,
        user.updatedAt,
        user.lastLoginAt,
        user.status
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}::timestamptz, $${offset + 10}, $${offset + 11}::jsonb, $${offset + 12}, $${offset + 13}::timestamptz, $${offset + 14}, $${offset + 15}::timestamptz, $${offset + 16}::timestamptz, $${offset + 17}::timestamptz, $${offset + 18}::timestamptz, $${offset + 19})`;
    })
    .join(", ");

  await client.query(
    `INSERT INTO ${escapedTableName} (
       id,
       threads_user_id,
       threads_handle,
       display_name,
       profile_picture_url,
       biography,
       is_verified,
       access_token_ciphertext,
       token_expires_at,
       email,
       granted_scopes,
       scope_version,
       last_scope_upgrade_at,
       plus_license_id,
       plus_activated_at,
       created_at,
       updated_at,
       last_login_at,
       status
     )
     VALUES ${placeholders}
     ON CONFLICT (id) DO UPDATE SET
       threads_user_id = EXCLUDED.threads_user_id,
       threads_handle = EXCLUDED.threads_handle,
       display_name = EXCLUDED.display_name,
       profile_picture_url = EXCLUDED.profile_picture_url,
       biography = EXCLUDED.biography,
       is_verified = EXCLUDED.is_verified,
       access_token_ciphertext = EXCLUDED.access_token_ciphertext,
       token_expires_at = EXCLUDED.token_expires_at,
       email = EXCLUDED.email,
       granted_scopes = EXCLUDED.granted_scopes,
       scope_version = EXCLUDED.scope_version,
       last_scope_upgrade_at = EXCLUDED.last_scope_upgrade_at,
       plus_license_id = EXCLUDED.plus_license_id,
       plus_activated_at = EXCLUDED.plus_activated_at,
       created_at = EXCLUDED.created_at,
       updated_at = EXCLUDED.updated_at,
       last_login_at = EXCLUDED.last_login_at,
       status = EXCLUDED.status`,
    values
  );
}

async function deletePostgresBotUsers(
  client: PgPool | PoolClient,
  tableName: string,
  ids: readonly string[]
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  await ensurePostgresBotUsersStore(client, tableName);
  const escapedTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(tableName));
  await client.query(
    `DELETE FROM ${escapedTableName}
     WHERE id = ANY($1::text[])`,
    [ids]
  );
}

async function upsertPostgresBotArchives(
  client: PgPool | PoolClient,
  tableName: string,
  archives: readonly BotArchiveRecord[]
): Promise<void> {
  if (archives.length === 0) {
    return;
  }

  await ensurePostgresBotArchivesStore(client, tableName);
  const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(tableName));
  const values: unknown[] = [];
  const placeholders = archives
    .map((archive, index) => {
      const offset = index * 18;
      values.push(
        archive.id,
        archive.userId,
        archive.mentionId,
        archive.mentionUrl,
        archive.mentionAuthorHandle,
        archive.mentionAuthorDisplayName,
        archive.noteText,
        archive.targetUrl,
        archive.targetAuthorHandle,
        archive.targetAuthorDisplayName,
        archive.targetText,
        archive.targetPublishedAt,
        JSON.stringify(archive.mediaUrls),
        archive.markdownContent,
        archive.rawPayloadJson,
        archive.archivedAt,
        archive.updatedAt,
        archive.status
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}::timestamptz, $${offset + 13}::jsonb, $${offset + 14}, $${offset + 15}, $${offset + 16}::timestamptz, $${offset + 17}::timestamptz, $${offset + 18})`;
    })
    .join(", ");

  await client.query(
    `INSERT INTO ${escapedTableName} (
       id,
       user_id,
       mention_id,
       mention_url,
       mention_author_handle,
       mention_author_display_name,
       note_text,
       target_url,
       target_author_handle,
       target_author_display_name,
       target_text,
       target_published_at,
       media_urls,
       markdown_content,
       raw_payload_json,
       archived_at,
       updated_at,
       status
     )
     VALUES ${placeholders}
     ON CONFLICT (id) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       mention_id = EXCLUDED.mention_id,
       mention_url = EXCLUDED.mention_url,
       mention_author_handle = EXCLUDED.mention_author_handle,
       mention_author_display_name = EXCLUDED.mention_author_display_name,
       note_text = EXCLUDED.note_text,
       target_url = EXCLUDED.target_url,
       target_author_handle = EXCLUDED.target_author_handle,
       target_author_display_name = EXCLUDED.target_author_display_name,
       target_text = EXCLUDED.target_text,
       target_published_at = EXCLUDED.target_published_at,
       media_urls = EXCLUDED.media_urls,
       markdown_content = EXCLUDED.markdown_content,
       raw_payload_json = EXCLUDED.raw_payload_json,
       archived_at = EXCLUDED.archived_at,
       updated_at = EXCLUDED.updated_at,
       status = EXCLUDED.status`,
    values
  );
}

async function deletePostgresBotArchives(
  client: PgPool | PoolClient,
  tableName: string,
  ids: readonly string[]
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  await ensurePostgresBotArchivesStore(client, tableName);
  const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(tableName));
  await client.query(
    `DELETE FROM ${escapedTableName}
     WHERE id = ANY($1::text[])`,
    [ids]
  );
}

async function loadPrimaryDatabasePayload(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend
): Promise<WebDatabase> {
  await ensurePostgresStore(client, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  const selected = await client.query<{ payload: unknown }>(
    `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 LIMIT 1`,
    [backend.storeKey]
  );
  if (selected.rows[0]) {
    return normalizeDatabasePayload(selected.rows[0].payload);
  }

  return buildDefaultDatabase();
}

async function ensurePrimaryPostgresStoreRow(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend
): Promise<void> {
  await ensurePostgresStore(client, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  await client.query(
    `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (store_key) DO NOTHING`,
    [backend.storeKey, JSON.stringify(serializeDatabaseForPostgres(buildDefaultDatabase()))]
  );
}

async function maybeSeedPostgresBotUsersStore(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotUserRecord[] = []
): Promise<void> {
  const botUsersTableName = getPostgresBotUsersTableName(backend.tableName);
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${botUsersTableName}`;
  if (seededPostgresBotUserStores.has(cacheKey)) {
    return;
  }

  await ensurePostgresBotUsersStore(client, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(botUsersTableName);
  const countResult = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${escapedTableName}`
  );
  if ((countResult.rows[0]?.count ?? "0") === "0") {
    await upsertPostgresBotUsers(
      client,
      backend.tableName,
      seedRecords.length > 0 ? seedRecords : (await loadPrimaryDatabasePayload(client, backend)).botUsers
    );
  }

  seededPostgresBotUserStores.add(cacheKey);
}

async function maybeSeedPostgresBotArchivesStore(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotArchiveRecord[] = []
): Promise<void> {
  const botArchivesTableName = getPostgresBotArchivesTableName(backend.tableName);
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${botArchivesTableName}`;
  if (seededPostgresBotArchiveStores.has(cacheKey)) {
    return;
  }

  await ensurePostgresBotArchivesStore(client, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(botArchivesTableName);
  const countResult = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${escapedTableName}`
  );
  if ((countResult.rows[0]?.count ?? "0") === "0") {
    await upsertPostgresBotArchives(
      client,
      backend.tableName,
      seedRecords.length > 0 ? seedRecords : (await loadPrimaryDatabasePayload(client, backend)).botArchives
    );
  }

  seededPostgresBotArchiveStores.add(cacheKey);
}

async function loadPostgresBotUsers(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotUserRecord[] = []
): Promise<BotUserRecord[]> {
  await ensurePostgresBotUsersStore(client, backend.tableName);
  await maybeSeedPostgresBotUsersStore(client, backend, seedRecords);
  return loadPostgresRecords(
    client,
    getPostgresBotUsersTableName(backend.tableName),
    "updated_at DESC, created_at DESC",
    normalizePostgresBotUser
  );
}

async function loadPostgresBotArchives(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  seedRecords: readonly BotArchiveRecord[] = []
): Promise<BotArchiveRecord[]> {
  await ensurePostgresBotArchivesStore(client, backend.tableName);
  await maybeSeedPostgresBotArchivesStore(client, backend, seedRecords);
  return loadPostgresRecords(
    client,
    getPostgresBotArchivesTableName(backend.tableName),
    "updated_at DESC, archived_at DESC",
    normalizePostgresBotArchive
  );
}

async function syncPostgresBotUsers(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialUsers: readonly BotUserRecord[],
  nextUsers: readonly BotUserRecord[]
): Promise<void> {
  const nextIds = new Set(nextUsers.map((user) => user.id));
  const removed = initialUsers.filter((user) => !nextIds.has(user.id)).map((user) => user.id);
  await upsertPostgresBotUsers(client, backend.tableName, nextUsers);
  await deletePostgresBotUsers(client, backend.tableName, removed);
}

async function syncPostgresBotArchives(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialArchives: readonly BotArchiveRecord[],
  nextArchives: readonly BotArchiveRecord[]
): Promise<void> {
  const nextIds = new Set(nextArchives.map((archive) => archive.id));
  const removed = initialArchives.filter((archive) => !nextIds.has(archive.id)).map((archive) => archive.id);
  await upsertPostgresBotArchives(client, backend.tableName, nextArchives);
  await deletePostgresBotArchives(client, backend.tableName, removed);
}

async function syncPostgresBotLoginTokens(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly BotLoginTokenRecord[],
  nextRecords: readonly BotLoginTokenRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresBotLoginTokens(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresBotLoginTokensTableName(backend.tableName), removed);
}

async function syncPostgresBotOauthSessions(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly BotOauthSessionRecord[],
  nextRecords: readonly BotOauthSessionRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresBotOauthSessions(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresBotOauthSessionsTableName(backend.tableName), removed);
}

async function syncPostgresBotSessions(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly BotSessionRecord[],
  nextRecords: readonly BotSessionRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresBotSessions(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresBotSessionsTableName(backend.tableName), removed);
}

async function syncPostgresBotExtensionLinkSessions(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly BotExtensionLinkSessionRecord[],
  nextRecords: readonly BotExtensionLinkSessionRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresBotExtensionLinkSessions(client, backend.tableName, nextRecords);
  await deletePostgresRecords(
    client,
    getPostgresBotExtensionLinkSessionsTableName(backend.tableName),
    removed
  );
}

async function syncPostgresBotExtensionAccessTokens(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly BotExtensionAccessTokenRecord[],
  nextRecords: readonly BotExtensionAccessTokenRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresBotExtensionAccessTokens(client, backend.tableName, nextRecords);
  await deletePostgresRecords(
    client,
    getPostgresBotExtensionAccessTokensTableName(backend.tableName),
    removed
  );
}

async function syncPostgresCloudArchives(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly CloudArchiveRecord[],
  nextRecords: readonly CloudArchiveRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresCloudArchives(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresCloudArchivesTableName(backend.tableName), removed);
}

async function syncPostgresWatchlists(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly WatchlistRecord[],
  nextRecords: readonly WatchlistRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresWatchlists(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresWatchlistsTableName(backend.tableName), removed);
}

async function syncPostgresSearchMonitors(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly SearchMonitorRecord[],
  nextRecords: readonly SearchMonitorRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresSearchMonitors(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresSearchMonitorsTableName(backend.tableName), removed);
}

async function syncPostgresSearchResults(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly SearchResultRecord[],
  nextRecords: readonly SearchResultRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresSearchResults(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresSearchResultsTableName(backend.tableName), removed);
}

async function syncPostgresTrackedPosts(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly TrackedPostRecord[],
  nextRecords: readonly TrackedPostRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresTrackedPosts(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresTrackedPostsTableName(backend.tableName), removed);
}

async function syncPostgresInsightsSnapshots(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly InsightsSnapshotRecord[],
  nextRecords: readonly InsightsSnapshotRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresInsightsSnapshots(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresInsightsSnapshotsTableName(backend.tableName), removed);
}

async function syncPostgresSavedViews(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialRecords: readonly SavedViewRecord[],
  nextRecords: readonly SavedViewRecord[]
): Promise<void> {
  const nextIds = new Set(nextRecords.map((record) => record.id));
  const removed = initialRecords.filter((record) => !nextIds.has(record.id)).map((record) => record.id);
  await upsertPostgresSavedViews(client, backend.tableName, nextRecords);
  await deletePostgresRecords(client, getPostgresSavedViewsTableName(backend.tableName), removed);
}

function snapshotRelationalCollections(data: WebDatabase) {
  return {
    botUsers: structuredClone(data.botUsers) as BotUserRecord[],
    botLoginTokens: structuredClone(data.botLoginTokens) as BotLoginTokenRecord[],
    botOauthSessions: structuredClone(data.botOauthSessions) as BotOauthSessionRecord[],
    botSessions: structuredClone(data.botSessions) as BotSessionRecord[],
    botExtensionLinkSessions: structuredClone(data.botExtensionLinkSessions) as BotExtensionLinkSessionRecord[],
    botExtensionAccessTokens: structuredClone(data.botExtensionAccessTokens) as BotExtensionAccessTokenRecord[],
    botArchives: structuredClone(data.botArchives) as BotArchiveRecord[],
    cloudArchives: structuredClone(data.cloudArchives) as CloudArchiveRecord[],
    watchlists: structuredClone(data.watchlists) as WatchlistRecord[],
    searchMonitors: structuredClone(data.searchMonitors) as SearchMonitorRecord[],
    searchResults: structuredClone(data.searchResults) as SearchResultRecord[],
    trackedPosts: structuredClone(data.trackedPosts) as TrackedPostRecord[],
    insightsSnapshots: structuredClone(data.insightsSnapshots) as InsightsSnapshotRecord[],
    savedViews: structuredClone(data.savedViews) as SavedViewRecord[]
  };
}

async function hydratePostgresDatabase(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  database: WebDatabase
): Promise<WebDatabase> {
  database.botUsers = await loadPostgresBotUsers(client, backend, database.botUsers);
  database.botLoginTokens = await loadPostgresBotLoginTokens(client, backend, database.botLoginTokens);
  database.botOauthSessions = await loadPostgresBotOauthSessions(client, backend, database.botOauthSessions);
  database.botSessions = await loadPostgresBotSessions(client, backend, database.botSessions);
  database.botExtensionLinkSessions = await loadPostgresBotExtensionLinkSessions(
    client,
    backend,
    database.botExtensionLinkSessions
  );
  database.botExtensionAccessTokens = await loadPostgresBotExtensionAccessTokens(
    client,
    backend,
    database.botExtensionAccessTokens
  );
  database.botArchives = await loadPostgresBotArchives(client, backend, database.botArchives);
  database.cloudArchives = await loadPostgresCloudArchives(client, backend, database.cloudArchives);
  database.watchlists = await loadPostgresWatchlists(client, backend, database.watchlists);
  database.searchMonitors = await loadPostgresSearchMonitors(client, backend, database.searchMonitors);
  database.searchResults = await loadPostgresSearchResults(client, backend, database.searchResults);
  database.trackedPosts = await loadPostgresTrackedPosts(client, backend, database.trackedPosts);
  database.insightsSnapshots = await loadPostgresInsightsSnapshots(client, backend, database.insightsSnapshots);
  database.savedViews = await loadPostgresSavedViews(client, backend, database.savedViews);
  return database;
}

async function syncPostgresRelationalCollections(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initial: ReturnType<typeof snapshotRelationalCollections>,
  next: WebDatabase
): Promise<void> {
  await syncPostgresBotUsers(client, backend, initial.botUsers, next.botUsers);
  await syncPostgresBotLoginTokens(client, backend, initial.botLoginTokens, next.botLoginTokens);
  await syncPostgresBotOauthSessions(client, backend, initial.botOauthSessions, next.botOauthSessions);
  await syncPostgresBotSessions(client, backend, initial.botSessions, next.botSessions);
  await syncPostgresBotExtensionLinkSessions(
    client,
    backend,
    initial.botExtensionLinkSessions,
    next.botExtensionLinkSessions
  );
  await syncPostgresBotExtensionAccessTokens(
    client,
    backend,
    initial.botExtensionAccessTokens,
    next.botExtensionAccessTokens
  );
  await syncPostgresBotArchives(client, backend, initial.botArchives, next.botArchives);
  await syncPostgresCloudArchives(client, backend, initial.cloudArchives, next.cloudArchives);
  await syncPostgresWatchlists(client, backend, initial.watchlists, next.watchlists);
  await syncPostgresSearchMonitors(client, backend, initial.searchMonitors, next.searchMonitors);
  await syncPostgresSearchResults(client, backend, initial.searchResults, next.searchResults);
  await syncPostgresTrackedPosts(client, backend, initial.trackedPosts, next.trackedPosts);
  await syncPostgresInsightsSnapshots(client, backend, initial.insightsSnapshots, next.insightsSnapshots);
  await syncPostgresSavedViews(client, backend, initial.savedViews, next.savedViews);
}

function snapshotBotAuthCollections(data: WebDatabase) {
  return {
    botUsers: structuredClone(data.botUsers) as BotUserRecord[],
    botLoginTokens: structuredClone(data.botLoginTokens) as BotLoginTokenRecord[],
    botOauthSessions: structuredClone(data.botOauthSessions) as BotOauthSessionRecord[],
    botSessions: structuredClone(data.botSessions) as BotSessionRecord[],
    botExtensionLinkSessions: structuredClone(data.botExtensionLinkSessions) as BotExtensionLinkSessionRecord[],
    botExtensionAccessTokens: structuredClone(data.botExtensionAccessTokens) as BotExtensionAccessTokenRecord[]
  };
}

async function syncPostgresBotAuthCollections(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initial: ReturnType<typeof snapshotBotAuthCollections>,
  next: WebDatabase
): Promise<void> {
  await syncPostgresBotUsers(client, backend, initial.botUsers, next.botUsers);
  await syncPostgresBotLoginTokens(client, backend, initial.botLoginTokens, next.botLoginTokens);
  await syncPostgresBotOauthSessions(client, backend, initial.botOauthSessions, next.botOauthSessions);
  await syncPostgresBotSessions(client, backend, initial.botSessions, next.botSessions);
  await syncPostgresBotExtensionLinkSessions(
    client,
    backend,
    initial.botExtensionLinkSessions,
    next.botExtensionLinkSessions
  );
  await syncPostgresBotExtensionAccessTokens(
    client,
    backend,
    initial.botExtensionAccessTokens,
    next.botExtensionAccessTokens
  );
}

function snapshotUserScopedCollections(data: WebDatabase) {
  return {
    botUsers: structuredClone(data.botUsers) as BotUserRecord[],
    botLoginTokens: structuredClone(data.botLoginTokens) as BotLoginTokenRecord[],
    botSessions: structuredClone(data.botSessions) as BotSessionRecord[],
    botExtensionLinkSessions: structuredClone(data.botExtensionLinkSessions) as BotExtensionLinkSessionRecord[],
    botExtensionAccessTokens: structuredClone(data.botExtensionAccessTokens) as BotExtensionAccessTokenRecord[],
    botArchives: structuredClone(data.botArchives) as BotArchiveRecord[],
    cloudArchives: structuredClone(data.cloudArchives) as CloudArchiveRecord[],
    watchlists: structuredClone(data.watchlists) as WatchlistRecord[],
    searchMonitors: structuredClone(data.searchMonitors) as SearchMonitorRecord[],
    searchResults: structuredClone(data.searchResults) as SearchResultRecord[],
    trackedPosts: structuredClone(data.trackedPosts) as TrackedPostRecord[],
    insightsSnapshots: structuredClone(data.insightsSnapshots) as InsightsSnapshotRecord[],
    savedViews: structuredClone(data.savedViews) as SavedViewRecord[]
  };
}

async function hydrateUserScopedPostgresDatabase(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  userId: string
): Promise<WebDatabase> {
  const database = await loadPrimaryDatabasePayload(client, backend);
  const user = await findPostgresBotUserById(client, backend, userId);
  database.botUsers = user ? [user] : [];
  database.botLoginTokens = await loadPostgresBotLoginTokensForUser(client, backend, userId);
  database.botOauthSessions = [];
  database.botSessions = await loadPostgresBotSessionsForUser(client, backend, userId);
  database.botExtensionLinkSessions = await loadPostgresBotExtensionLinkSessionsForUser(client, backend, userId);
  database.botExtensionAccessTokens = await loadPostgresBotExtensionAccessTokensForUser(client, backend, userId);
  database.botMentionJobs = [];
  database.botArchives = await loadPostgresBotArchivesForUser(client, backend, userId);
  database.cloudArchives = await loadPostgresCloudArchivesForUser(client, backend, userId);
  database.watchlists = await loadPostgresWatchlistsForUser(client, backend, userId);
  database.searchMonitors = await loadPostgresSearchMonitorsForUser(client, backend, userId);
  database.searchResults = await loadPostgresSearchResultsForUser(client, backend, userId);
  database.trackedPosts = await loadPostgresTrackedPostsForUser(client, backend, userId);
  database.insightsSnapshots = await loadPostgresInsightsSnapshotsForUser(client, backend, userId);
  database.savedViews = await loadPostgresSavedViewsForUser(client, backend, userId);
  return database;
}

async function syncPostgresUserScopedCollections(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initial: ReturnType<typeof snapshotUserScopedCollections>,
  next: WebDatabase
): Promise<void> {
  await syncPostgresBotUsers(client, backend, initial.botUsers, next.botUsers);
  await syncPostgresBotLoginTokens(client, backend, initial.botLoginTokens, next.botLoginTokens);
  await syncPostgresBotSessions(client, backend, initial.botSessions, next.botSessions);
  await syncPostgresBotExtensionLinkSessions(
    client,
    backend,
    initial.botExtensionLinkSessions,
    next.botExtensionLinkSessions
  );
  await syncPostgresBotExtensionAccessTokens(
    client,
    backend,
    initial.botExtensionAccessTokens,
    next.botExtensionAccessTokens
  );
  await syncPostgresBotArchives(client, backend, initial.botArchives, next.botArchives);
  await syncPostgresCloudArchives(client, backend, initial.cloudArchives, next.cloudArchives);
  await syncPostgresWatchlists(client, backend, initial.watchlists, next.watchlists);
  await syncPostgresSearchMonitors(client, backend, initial.searchMonitors, next.searchMonitors);
  await syncPostgresSearchResults(client, backend, initial.searchResults, next.searchResults);
  await syncPostgresTrackedPosts(client, backend, initial.trackedPosts, next.trackedPosts);
  await syncPostgresInsightsSnapshots(client, backend, initial.insightsSnapshots, next.insightsSnapshots);
  await syncPostgresSavedViews(client, backend, initial.savedViews, next.savedViews);
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
  const legacyHeroNotes = [
    "한 제품, 두 진입 경로: PC extension + 모바일 mention scrapbook",
    "Free: mention inbox + searches + Markdown / ZIP export",
    "Plus: 1,000 saves + 50 folders + watchlists · insights"
  ];
  const legacyFaqs = [
    {
      question: "저장하려면 Plus가 필요한가요?",
      answer:
        "아니요. Free에서도 저장, 이미지 포함, 연속 답글, 중복 건너뜀이 가능합니다. 저장글 100개, 폴더 5개, searches까지 Free에서 사용할 수 있고, watchlists와 insights는 Plus에서 열립니다."
    },
    {
      question: "누가 Plus를 쓰면 좋나요?",
      answer:
        "scrapbook 저장글이 100개를 넘거나, 폴더를 5개 이상 쓰고 싶은 사용자, 그리고 watchlists와 insights가 필요한 사용자에게 맞습니다. 같은 키를 extension에도 연결할 수 있습니다."
    },
    {
      question: "Plus에서는 뭐가 달라지나요?",
      answer:
        "scrapbook 저장글 1,000개, 폴더 50개까지 확장되고, watchlists와 insights가 열리며, 동일한 키를 extension에도 연결할 수 있습니다."
    },
    {
      question: "Plus 키는 어떻게 전달되나요?",
      answer: "결제가 확인되면 보통 30분 안에 Plus 키를 이메일로 보내드립니다."
    },
    {
      question: "환불 정책은 있나요?",
      answer: "구매 후 7일 내에 환불 요청을 보내면 확인 후 처리합니다."
    }
  ];

  const merged: StorefrontSettings = {
    ...fallback,
    ...(parsed ?? {})
  };

  // Upgrade existing installs that still carry the original default values.
  if (!parsed || parsed.productName === "Threads to Obsidian" || parsed.productName === "Threads Saver") {
    merged.productName = fallback.productName;
  }
  if (
    !parsed ||
    parsed.headline === "Threads를 Obsidian에 저장." ||
    parsed.headline === "Threads 저장을 편하게\nPC는 extension, 모바일은 @mention\n댓글로 @ss_threads_bot 만 적으세요."
  ) {
    merged.headline = fallback.headline;
  }
  if (
    !parsed ||
    parsed.subheadline === "Free는 저장. Pro는 규칙 + 내 LLM 키로 요약, 태그, frontmatter."
  ) {
    merged.subheadline = fallback.subheadline;
  }
  if (
    !parsed ||
    parsed.priceLabel === "Pro 업그레이드" ||
    parsed.priceLabel === "Threads to Obsidian Pro" ||
    parsed.priceLabel === "Threads Saver Pro"
  ) {
    merged.priceLabel = fallback.priceLabel;
  }
  if (!parsed || parsed.priceValue === "$19") {
    merged.priceValue = fallback.priceValue;
  }
  if (
    !parsed ||
    parsed.includedUpdates === "1회 결제 · 7일 환불 · 업데이트 1년" ||
    parsed.includedUpdates === "월 US$2.99 · 연 US$19.99 · Free 100/5 + searches -> Plus 1000/50 + watchlists/insights"
  ) {
    merged.includedUpdates = fallback.includedUpdates;
  }
  if (
    !Array.isArray(parsed?.heroNotes) ||
    (parsed.heroNotes.length === legacyHeroNotes.length &&
      parsed.heroNotes.every((note, index) => note === legacyHeroNotes[index]))
  ) {
    merged.heroNotes = fallback.heroNotes;
  }
  if (
    !Array.isArray(parsed?.faqs) ||
    (parsed.faqs.length === legacyFaqs.length &&
      parsed.faqs.every(
        (faq, index) =>
          faq.question === legacyFaqs[index]?.question &&
          faq.answer === legacyFaqs[index]?.answer
      ))
  ) {
    merged.faqs = fallback.faqs;
  }

  return merged;
}

async function saveFileDatabase(data: WebDatabase, filePath: string): Promise<void> {
  await ensureParentDirectory(filePath);
  const tmpFilePath = `${filePath}.tmp.${process.pid}.${crypto.randomUUID()}`;
  const payload = JSON.stringify(data, null, 2);
  await writeFile(tmpFilePath, payload, "utf8");
  await rename(tmpFilePath, filePath);
}

async function savePostgresDatabase(data: WebDatabase, backend: PostgresDatabaseBackend): Promise<void> {
  const pool = await getPostgresPool(backend.connectionString);
  const client = await pool.connect();
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);

  try {
    await client.query("BEGIN");
    await ensurePrimaryPostgresStoreRow(client, backend);
    const initialDatabase = await hydratePostgresDatabase(
      client,
      backend,
      await loadPrimaryDatabasePayload(client, backend)
    );
    await syncPostgresRelationalCollections(client, backend, snapshotRelationalCollections(initialDatabase), data);
    await client.query(
      `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (store_key)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [backend.storeKey, JSON.stringify(serializeDatabaseForPostgres(data))]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function loadDatabaseFromPostgres(backend: PostgresDatabaseBackend): Promise<WebDatabase> {
  const pool = await getPostgresPool(backend.connectionString);
  await ensurePrimaryPostgresStoreRow(pool, backend);
  return hydratePostgresDatabase(pool, backend, await loadPrimaryDatabasePayload(pool, backend));
}

async function loadPublicStorefrontFromPostgres(backend: PostgresDatabaseBackend): Promise<PublicStorefrontResponse> {
  const pool = await getPostgresPool(backend.connectionString);
  await ensurePostgresStore(pool, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  const selected = await pool.query<{ settings: unknown; payment_methods: unknown }>(
    `SELECT payload -> 'settings' AS settings,
            payload -> 'paymentMethods' AS payment_methods
     FROM ${escapedTableName}
     WHERE store_key = $1
     LIMIT 1`,
    [backend.storeKey]
  );

  if (!selected.rows[0]) {
    return buildPublicStorefront(buildDefaultDatabase());
  }

  return buildPublicStorefront(
    normalizeDatabasePayload({
      settings: selected.rows[0].settings,
      paymentMethods: selected.rows[0].payment_methods
    })
  );
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
    await ensurePrimaryPostgresStoreRow(client, backend);
    const selected = await client.query<{ payload: unknown }>(
      `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 FOR UPDATE`,
      [backend.storeKey]
    );
    const database = await hydratePostgresDatabase(
      client,
      backend,
      selected.rows[0] ? normalizeDatabasePayload(selected.rows[0].payload) : buildDefaultDatabase()
    );
    const initialRelationalCollections = snapshotRelationalCollections(database);
    const output = await handler(database);
    await syncPostgresRelationalCollections(client, backend, initialRelationalCollections, database);
    await client.query(
      `UPDATE ${escapedTableName}
       SET payload = $2::jsonb,
           updated_at = NOW()
       WHERE store_key = $1`,
      [backend.storeKey, JSON.stringify(serializeDatabaseForPostgres(database))]
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

export async function pingDatabase(filePath?: string): Promise<void> {
  await withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await pool.query("SELECT 1");
      return;
    }

    await ensureParentDirectory(backend.filePath);
  });
}

export async function loadPublicStorefrontSnapshot(filePath?: string): Promise<PublicStorefrontResponse> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      return loadPublicStorefrontFromPostgres(backend);
    }

    return buildPublicStorefront(await loadDatabaseUnsafe(backend.filePath));
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

export async function loadPrimaryDatabase(filePath?: string): Promise<WebDatabase> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      return loadDatabaseFromPostgres(backend);
    }

    return loadDatabaseUnsafe(backend.filePath);
  });
}

export async function withPrimaryDatabaseTransaction<T>(
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

export async function withBotAuthDatabaseTransaction<T>(
  handler: (database: WebDatabase) => Promise<T> | T,
  filePath?: string
): Promise<T> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind !== "postgres") {
      return withDatabaseTransaction(handler, backend.filePath);
    }

    const pool = await getPostgresPool(backend.connectionString);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await ensurePrimaryPostgresStoreRow(client, backend);
      const database = await loadPrimaryDatabasePayload(client, backend);
      database.botUsers = await loadPostgresBotUsers(client, backend, database.botUsers);
      database.botLoginTokens = await loadPostgresBotLoginTokens(client, backend, database.botLoginTokens);
      database.botOauthSessions = await loadPostgresBotOauthSessions(client, backend, database.botOauthSessions);
      database.botSessions = await loadPostgresBotSessions(client, backend, database.botSessions);
      database.botExtensionLinkSessions = await loadPostgresBotExtensionLinkSessions(
        client,
        backend,
        database.botExtensionLinkSessions
      );
      database.botExtensionAccessTokens = await loadPostgresBotExtensionAccessTokens(
        client,
        backend,
        database.botExtensionAccessTokens
      );
      const initial = snapshotBotAuthCollections(database);
      const output = await handler(database);
      await syncPostgresBotAuthCollections(client, backend, initial, database);
      await client.query("COMMIT");
      return output;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  });
}

export async function withUserScopedDatabaseTransaction<T>(
  userId: string,
  handler: (database: WebDatabase) => Promise<T> | T,
  filePath?: string
): Promise<T> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind !== "postgres") {
      return withDatabaseTransaction(handler, backend.filePath);
    }

    const normalizedUserId = userId.trim();
    const pool = await getPostgresPool(backend.connectionString);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await ensurePrimaryPostgresStoreRow(client, backend);
      const database = await hydrateUserScopedPostgresDatabase(client, backend, normalizedUserId);
      const initial = snapshotUserScopedCollections(database);
      const output = await handler(database);
      await syncPostgresUserScopedCollections(client, backend, initial, database);
      await client.query("COMMIT");
      return output;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  });
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
    await ensurePostgresMentionJobsStore(pool, backend.tableName);
    await ensurePostgresBotUsersStore(pool, backend.tableName);
    await ensurePostgresBotArchivesStore(pool, backend.tableName);
    await ensurePostgresBotLoginTokensStore(pool, backend.tableName);
    await ensurePostgresBotOauthSessionsStore(pool, backend.tableName);
    await ensurePostgresBotSessionsStore(pool, backend.tableName);
    await ensurePostgresBotExtensionLinkSessionsStore(pool, backend.tableName);
    await ensurePostgresBotExtensionAccessTokensStore(pool, backend.tableName);
    await ensurePostgresCloudArchivesStore(pool, backend.tableName);
    await ensurePostgresWatchlistsStore(pool, backend.tableName);
    await ensurePostgresSearchMonitorsStore(pool, backend.tableName);
    await ensurePostgresSearchResultsStore(pool, backend.tableName);
    await ensurePostgresTrackedPostsStore(pool, backend.tableName);
    await ensurePostgresInsightsSnapshotsStore(pool, backend.tableName);
    await ensurePostgresSavedViewsStore(pool, backend.tableName);
    await pool.query("SELECT 1");
    return;
  }

  await ensureParentDirectory(backend.filePath);
}

export async function loadBotMentionJobs(filePath?: string): Promise<BotMentionJobRecord[]> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresMentionJobsStore(pool, backend.tableName);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresMentionJobsTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         ORDER BY created_at DESC`
      );
      return result.rows.map(normalizePostgresBotMentionJob);
    }

    return (await loadDatabaseUnsafe(backend.filePath)).botMentionJobs.map((candidate) => ({ ...candidate }));
  });
}

export async function loadBotUsers(filePath?: string): Promise<BotUserRecord[]> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      return loadPostgresBotUsers(pool, backend);
    }

    return (await loadDatabaseUnsafe(backend.filePath)).botUsers.map((candidate) => ({
      ...candidate,
      grantedScopes: [...candidate.grantedScopes]
    }));
  });
}

export async function loadBotArchives(filePath?: string): Promise<BotArchiveRecord[]> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      return loadPostgresBotArchives(pool, backend);
    }

    return (await loadDatabaseUnsafe(backend.filePath)).botArchives.map((candidate) => ({
      ...candidate,
      mediaUrls: [...candidate.mediaUrls]
    }));
  });
}

export async function loadBotMentionReadState(filePath?: string): Promise<{
  activeUserIds: string[];
  activeUserHandles: string[];
  knownMentionIds: string[];
}> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotUsersStore(pool, backend.tableName);
      await ensurePostgresBotArchivesStore(pool, backend.tableName);
      await ensurePostgresMentionJobsStore(pool, backend.tableName);
      await maybeSeedPostgresBotUsersStore(pool, backend);
      await maybeSeedPostgresBotArchivesStore(pool, backend);

      const usersTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(backend.tableName));
      const archivesTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
      const mentionJobsTableName = escapeQualifiedIdentifier(getPostgresMentionJobsTableName(backend.tableName));

      const activeUsersResult = await pool.query<Record<string, unknown>>(
        `SELECT threads_user_id, threads_handle
         FROM ${usersTableName}
         WHERE status = 'active'`
      );
      const knownMentionIdsResult = await pool.query<Record<string, unknown>>(
        `SELECT mention_id
         FROM ${archivesTableName}
         WHERE mention_id IS NOT NULL
         UNION
         SELECT mention_id
         FROM ${mentionJobsTableName}`
      );

      return {
        activeUserIds: activeUsersResult.rows
          .map((row) => (typeof row.threads_user_id === "string" ? row.threads_user_id : ""))
          .filter(Boolean),
        activeUserHandles: activeUsersResult.rows
          .map((row) => normalizeThreadsHandle(typeof row.threads_handle === "string" ? row.threads_handle : ""))
          .filter(Boolean),
        knownMentionIds: knownMentionIdsResult.rows
          .map((row) => (typeof row.mention_id === "string" ? row.mention_id.trim() : ""))
          .filter(Boolean)
      };
    }

    const database = await loadDatabaseUnsafe(backend.filePath);
    return {
      activeUserIds: database.botUsers
        .filter((candidate) => candidate.status === "active")
        .map((candidate) => candidate.threadsUserId ?? "")
        .filter(Boolean),
      activeUserHandles: database.botUsers
        .filter((candidate) => candidate.status === "active")
        .map((candidate) => normalizeThreadsHandle(candidate.threadsHandle))
        .filter(Boolean),
      knownMentionIds: [
        ...database.botArchives.map((candidate) => candidate.mentionId ?? ""),
        ...database.botMentionJobs.map((candidate) => candidate.mentionId)
      ].filter(Boolean)
    };
  });
}

export async function findBotUserByThreadsUserId(
  rawThreadsUserId: string | null | undefined,
  filePath?: string
): Promise<BotUserRecord | null> {
  const threadsUserId = typeof rawThreadsUserId === "string" ? rawThreadsUserId.trim() : "";
  if (!threadsUserId) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotUsersStore(pool, backend.tableName);
      await maybeSeedPostgresBotUsersStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE threads_user_id = $1
           AND status = 'active'
         LIMIT 1`,
        [threadsUserId]
      );
      return result.rows[0] ? normalizePostgresBotUser(result.rows[0]) : null;
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botUsers.find(
        (candidate) => candidate.threadsUserId === threadsUserId && candidate.status === "active"
      ) ?? null
    );
  });
}

export async function findBotUserByHandle(
  rawHandle: string | null | undefined,
  filePath?: string
): Promise<BotUserRecord | null> {
  const handle = normalizeThreadsHandle(rawHandle);
  if (!handle) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotUsersStore(pool, backend.tableName);
      await maybeSeedPostgresBotUsersStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE threads_handle = $1
           AND status = 'active'
         LIMIT 1`,
        [handle]
      );
      return result.rows[0] ? normalizePostgresBotUser(result.rows[0]) : null;
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botUsers.find(
        (candidate) => normalizeThreadsHandle(candidate.threadsHandle) === handle && candidate.status === "active"
      ) ?? null
    );
  });
}

export async function findBotUserById(
  userId: string | null | undefined,
  filePath?: string
): Promise<BotUserRecord | null> {
  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
  if (!normalizedUserId) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotUsersStore(pool, backend.tableName);
      await maybeSeedPostgresBotUsersStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE id = $1
           AND status = 'active'
         LIMIT 1`,
        [normalizedUserId]
      );
      return result.rows[0] ? normalizePostgresBotUser(result.rows[0]) : null;
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botUsers.find(
        (candidate) => candidate.id === normalizedUserId && candidate.status === "active"
      ) ?? null
    );
  });
}

export async function findBotSessionByHash(
  sessionHash: string | null | undefined,
  filePath?: string
): Promise<BotSessionRecord | null> {
  const normalizedSessionHash = typeof sessionHash === "string" ? sessionHash.trim() : "";
  if (!normalizedSessionHash) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      return findPostgresBotSessionByHash(pool, backend, normalizedSessionHash);
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botSessions.find(
        (candidate) => candidate.sessionHash === normalizedSessionHash
      ) ?? null
    );
  });
}

export async function findBotExtensionAccessTokenByHash(
  tokenHash: string | null | undefined,
  filePath?: string
): Promise<BotExtensionAccessTokenRecord | null> {
  const normalizedTokenHash = typeof tokenHash === "string" ? tokenHash.trim() : "";
  if (!normalizedTokenHash) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      return findPostgresBotExtensionAccessTokenByHash(pool, backend, normalizedTokenHash);
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botExtensionAccessTokens.find(
        (candidate) => candidate.tokenHash === normalizedTokenHash
      ) ?? null
    );
  });
}

export async function saveBotUserRecord(user: BotUserRecord, filePath?: string): Promise<void> {
  await withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await upsertPostgresBotUsers(pool, backend.tableName, [user]);
      return;
    }

    await withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      upsertBotUser(database, user);
      await saveFileDatabase(database, backend.filePath);
    });
  });
}

export async function findBotArchiveByMention(
  userId: string,
  mentionId: string | null | undefined,
  mentionUrl: string,
  filePath?: string
): Promise<BotArchiveRecord | null> {
  const normalizedUserId = userId.trim();
  const normalizedMentionId = typeof mentionId === "string" ? mentionId.trim() : "";
  const normalizedMentionUrl = mentionUrl.trim();
  if (!normalizedUserId || !normalizedMentionUrl) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotArchivesStore(pool, backend.tableName);
      await maybeSeedPostgresBotArchivesStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE user_id = $1
           AND (
             ($2::text <> '' AND mention_id = $2)
             OR mention_url = $3
           )
         ORDER BY CASE WHEN $2::text <> '' AND mention_id = $2 THEN 0 ELSE 1 END, updated_at DESC
         LIMIT 1`,
        [normalizedUserId, normalizedMentionId, normalizedMentionUrl]
      );
      return result.rows[0] ? normalizePostgresBotArchive(result.rows[0]) : null;
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botArchives.find((candidate) => {
        if (candidate.userId !== normalizedUserId) {
          return false;
        }
        if (normalizedMentionId && candidate.mentionId) {
          return candidate.mentionId === normalizedMentionId;
        }
        return candidate.mentionUrl === normalizedMentionUrl;
      }) ?? null
    );
  });
}

export async function findBotArchiveById(
  userId: string,
  archiveId: string | null | undefined,
  filePath?: string
): Promise<BotArchiveRecord | null> {
  const normalizedUserId = userId.trim();
  const normalizedArchiveId = typeof archiveId === "string" ? archiveId.trim() : "";
  if (!normalizedUserId || !normalizedArchiveId) {
    return null;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotArchivesStore(pool, backend.tableName);
      await maybeSeedPostgresBotArchivesStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE user_id = $1
           AND id = $2
         LIMIT 1`,
        [normalizedUserId, normalizedArchiveId]
      );
      return result.rows[0] ? normalizePostgresBotArchive(result.rows[0]) : null;
    }

    return (
      (await loadDatabaseUnsafe(backend.filePath)).botArchives.find(
        (candidate) => candidate.userId === normalizedUserId && candidate.id === normalizedArchiveId
      ) ?? null
    );
  });
}

export async function listBotArchivesForUser(
  userId: string,
  filePath?: string
): Promise<BotArchiveRecord[]> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    return [];
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotArchivesStore(pool, backend.tableName);
      await maybeSeedPostgresBotArchivesStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE user_id = $1
         ORDER BY updated_at DESC, archived_at DESC`,
        [normalizedUserId]
      );
      return result.rows.map(normalizePostgresBotArchive);
    }

    return (await loadDatabaseUnsafe(backend.filePath)).botArchives
      .filter((candidate) => candidate.userId === normalizedUserId)
      .map((candidate) => ({ ...candidate, mediaUrls: [...candidate.mediaUrls] }));
  });
}

export async function findBotArchivesByIds(
  userId: string,
  archiveIds: readonly string[],
  filePath?: string
): Promise<BotArchiveRecord[]> {
  const normalizedUserId = userId.trim();
  const ids = [...new Set(archiveIds.map((value) => value.trim()).filter(Boolean))];
  if (!normalizedUserId || ids.length === 0) {
    return [];
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotArchivesStore(pool, backend.tableName);
      await maybeSeedPostgresBotArchivesStore(pool, backend);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
      const result = await pool.query<Record<string, unknown>>(
        `SELECT *
         FROM ${escapedTableName}
         WHERE user_id = $1
           AND id = ANY($2::text[])`,
        [normalizedUserId, ids]
      );
      return result.rows.map(normalizePostgresBotArchive);
    }

    const byId = new Set(ids);
    return (await loadDatabaseUnsafe(backend.filePath)).botArchives
      .filter((candidate) => candidate.userId === normalizedUserId && byId.has(candidate.id))
      .map((candidate) => ({ ...candidate, mediaUrls: [...candidate.mediaUrls] }));
  });
}

export async function saveBotArchiveRecord(archive: BotArchiveRecord, filePath?: string): Promise<void> {
  await withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await upsertPostgresBotArchives(pool, backend.tableName, [archive]);
      return;
    }

    await withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      upsertBotArchive(database, archive);
      await saveFileDatabase(database, backend.filePath);
    });
  });
}

export async function deleteBotArchiveRecord(
  userId: string,
  archiveId: string,
  filePath?: string
): Promise<boolean> {
  const normalizedUserId = userId.trim();
  const normalizedArchiveId = archiveId.trim();
  if (!normalizedUserId || !normalizedArchiveId) {
    return false;
  }

  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresBotArchivesStore(pool, backend.tableName);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
      const result = await pool.query(
        `DELETE FROM ${escapedTableName}
         WHERE user_id = $1
           AND id = $2`,
        [normalizedUserId, normalizedArchiveId]
      );
      return (result.rowCount ?? 0) > 0;
    }

    return withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const index = database.botArchives.findIndex(
        (candidate) => candidate.userId === normalizedUserId && candidate.id === normalizedArchiveId
      );
      if (index < 0) {
        return false;
      }
      database.botArchives.splice(index, 1);
      await saveFileDatabase(database, backend.filePath);
      return true;
    });
  });
}

export async function enqueueBotMentionJobs(
  jobs: BotMentionJobRecord[],
  options?: {
    forceRequeue?: boolean;
    filePath?: string;
  }
): Promise<number> {
  const forceRequeue = options?.forceRequeue === true;
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(options?.filePath);
    if (backend.kind === "postgres") {
      if (jobs.length === 0) {
        return 0;
      }

      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresMentionJobsStore(pool, backend.tableName);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresMentionJobsTableName(backend.tableName));
      const values: unknown[] = [];
      const placeholders = jobs.map((job, index) => {
        const offset = index * 14;
        values.push(
          job.id,
          job.mentionId,
          job.mentionUrl,
          job.mentionAuthorHandle,
          job.mentionAuthorUserId,
          job.mentionText,
          job.mentionPublishedAt,
          job.rawSummaryJson ? JSON.parse(job.rawSummaryJson) : null,
          job.attempts,
          job.status,
          job.lastError,
          job.availableAt,
          job.createdAt,
          job.updatedAt
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}::jsonb, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14})`;
      }).join(", ");

      const query = forceRequeue
        ? `INSERT INTO ${escapedTableName} (
             id,
             mention_id,
             mention_url,
             mention_author_handle,
             mention_author_user_id,
             mention_text,
             mention_published_at,
             raw_summary_json,
             attempts,
             status,
             last_error,
             available_at,
             created_at,
             updated_at
           )
           VALUES ${placeholders}
           ON CONFLICT (mention_id) DO UPDATE SET
             mention_url = EXCLUDED.mention_url,
             mention_author_handle = EXCLUDED.mention_author_handle,
             mention_author_user_id = EXCLUDED.mention_author_user_id,
             mention_text = EXCLUDED.mention_text,
             mention_published_at = EXCLUDED.mention_published_at,
             raw_summary_json = EXCLUDED.raw_summary_json,
             status = 'queued',
             last_error = NULL,
             available_at = EXCLUDED.available_at,
             leased_at = NULL,
             processed_at = NULL,
             updated_at = EXCLUDED.updated_at`
        : `INSERT INTO ${escapedTableName} (
             id,
             mention_id,
             mention_url,
             mention_author_handle,
             mention_author_user_id,
             mention_text,
             mention_published_at,
             raw_summary_json,
             attempts,
             status,
             last_error,
             available_at,
             created_at,
             updated_at
           )
           VALUES ${placeholders}
           ON CONFLICT (mention_id) DO NOTHING`;
      const result = await pool.query(query, values);
      return result.rowCount ?? 0;
    }

    return withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      let enqueued = 0;
      for (const job of jobs) {
        const existingJob = database.botMentionJobs.find((candidate) => candidate.mentionId === job.mentionId);
        if (existingJob) {
          if (!forceRequeue) {
            continue;
          }

          Object.assign(existingJob, {
            ...job,
            status: "queued",
            lastError: null,
            leasedAt: null,
            processedAt: null
          });
          upsertBotMentionJob(database, existingJob);
          enqueued += 1;
          continue;
        }

        upsertBotMentionJob(database, job);
        enqueued += 1;
      }

      await saveFileDatabase(database, backend.filePath);
      return enqueued;
    });
  });
}

export async function claimBotMentionJobs(
  now: string,
  batchSize: number,
  leaseMs: number,
  filePath?: string
): Promise<BotMentionJobRecord[]> {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      const client = await pool.connect();
      const escapedTableName = escapeQualifiedIdentifier(getPostgresMentionJobsTableName(backend.tableName));
      try {
        await client.query("BEGIN");
        await ensurePostgresMentionJobsStore(client, backend.tableName);
        const result = await client.query<Record<string, unknown>>(
          `WITH claimable AS (
             SELECT id
             FROM ${escapedTableName}
             WHERE available_at <= $1::timestamptz
               AND (
                 status IN ('queued', 'failed')
                 OR (
                   status = 'processing'
                   AND COALESCE(leased_at, available_at) <= $2::timestamptz
                 )
               )
             ORDER BY available_at ASC, created_at ASC
             FOR UPDATE SKIP LOCKED
             LIMIT $3
           )
           UPDATE ${escapedTableName} AS jobs
           SET status = 'processing',
               attempts = jobs.attempts + 1,
               leased_at = $1::timestamptz,
               updated_at = $1::timestamptz
           FROM claimable
           WHERE jobs.id = claimable.id
           RETURNING jobs.*`,
          [now, new Date(Date.parse(now) - leaseMs).toISOString(), batchSize]
        );
        await client.query("COMMIT");
        return result.rows.map(normalizePostgresBotMentionJob);
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    }

    return withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const nowMs = Date.parse(now);
      const claimed = database.botMentionJobs
        .filter((candidate) => {
          if (Date.parse(candidate.availableAt) > nowMs) {
            return false;
          }
          if (candidate.status === "queued" || candidate.status === "failed") {
            return true;
          }
          if (candidate.status !== "processing") {
            return false;
          }

          const leasedAt = candidate.leasedAt ? Date.parse(candidate.leasedAt) : 0;
          return leasedAt + leaseMs <= nowMs;
        })
        .sort((left, right) => Date.parse(left.availableAt) - Date.parse(right.availableAt) || Date.parse(left.createdAt) - Date.parse(right.createdAt))
        .slice(0, batchSize)
        .map((candidate) => {
          candidate.status = "processing";
          candidate.attempts = Math.max(0, candidate.attempts) + 1;
          candidate.leasedAt = now;
          candidate.updatedAt = now;
          upsertBotMentionJob(database, candidate);
          return { ...candidate };
        });

      await saveFileDatabase(database, backend.filePath);
      return claimed;
    });
  });
}

export async function finalizeBotMentionJob(
  mentionId: string,
  update: Pick<BotMentionJobRecord, "status" | "lastError" | "availableAt" | "leasedAt" | "processedAt" | "updatedAt">,
  filePath?: string
): Promise<void> {
  await withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresMentionJobsStore(pool, backend.tableName);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresMentionJobsTableName(backend.tableName));
      await pool.query(
        `UPDATE ${escapedTableName}
         SET status = $2,
             last_error = $3,
             available_at = $4::timestamptz,
             leased_at = $5::timestamptz,
             processed_at = $6::timestamptz,
             updated_at = $7::timestamptz
         WHERE mention_id = $1`,
        [
          mentionId,
          update.status,
          update.lastError,
          update.availableAt,
          update.leasedAt,
          update.processedAt,
          update.updatedAt
        ]
      );
      return;
    }

    await withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const job = database.botMentionJobs.find((candidate) => candidate.mentionId === mentionId);
      if (!job) {
        return;
      }

      Object.assign(job, update);
      upsertBotMentionJob(database, job);
      await saveFileDatabase(database, backend.filePath);
    });
  });
}

export async function pruneBotMentionJobs(
  cutoffIso: string,
  filePath?: string
): Promise<void> {
  await withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePostgresMentionJobsStore(pool, backend.tableName);
      const escapedTableName = escapeQualifiedIdentifier(getPostgresMentionJobsTableName(backend.tableName));
      await pool.query(
        `DELETE FROM ${escapedTableName}
         WHERE status IN ('completed', 'invalid', 'unmatched')
           AND updated_at < $1::timestamptz`,
        [cutoffIso]
      );
      return;
    }

    await withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const cutoff = Date.parse(cutoffIso);
      database.botMentionJobs = database.botMentionJobs.filter((candidate) => {
        if (candidate.status === "queued" || candidate.status === "processing" || candidate.status === "failed") {
          return true;
        }
        return Date.parse(candidate.updatedAt) >= cutoff;
      });
      await saveFileDatabase(database, backend.filePath);
    });
  });
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

export function upsertBotMentionJob(data: WebDatabase, job: BotMentionJobRecord): void {
  const index = data.botMentionJobs.findIndex((candidate) => candidate.id === job.id);
  if (index >= 0) {
    data.botMentionJobs[index] = job;
    return;
  }

  data.botMentionJobs.unshift(job);
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
