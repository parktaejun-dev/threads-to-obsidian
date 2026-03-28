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
const ensuredPostgresMentionJobStores = new Set<string>();
const ensuredPostgresBotUserStores = new Set<string>();
const ensuredPostgresBotArchiveStores = new Set<string>();
const seededPostgresBotUserStores = new Set<string>();
const seededPostgresBotArchiveStores = new Set<string>();
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
    botMentionJobs: Array.isArray(parsed.botMentionJobs) ? parsed.botMentionJobs : [],
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
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      last_login_at TIMESTAMPTZ,
      status TEXT NOT NULL
    )`
  );
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

function serializeDatabaseForPostgres(data: WebDatabase): WebDatabase {
  return {
    ...data,
    botUsers: [],
    botMentionJobs: [],
    botArchives: []
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

function buildBotUserSyncMarker(user: BotUserRecord): string {
  return [
    user.id,
    user.threadsUserId ?? "",
    user.threadsHandle,
    user.updatedAt,
    user.status
  ].join("|");
}

function buildBotArchiveSyncMarker(archive: BotArchiveRecord): string {
  return [
    archive.id,
    archive.userId,
    archive.mentionId ?? "",
    archive.mentionUrl,
    archive.updatedAt,
    archive.status
  ].join("|");
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
      const offset = index * 17;
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
        user.createdAt,
        user.updatedAt,
        user.lastLoginAt,
        user.status
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}::timestamptz, $${offset + 10}, $${offset + 11}::jsonb, $${offset + 12}, $${offset + 13}::timestamptz, $${offset + 14}::timestamptz, $${offset + 15}::timestamptz, $${offset + 16}::timestamptz, $${offset + 17})`;
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
  backend: PostgresDatabaseBackend
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
    const database = await loadPrimaryDatabasePayload(client, backend);
    await upsertPostgresBotUsers(client, backend.tableName, database.botUsers);
  }

  seededPostgresBotUserStores.add(cacheKey);
}

async function maybeSeedPostgresBotArchivesStore(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend
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
    const database = await loadPrimaryDatabasePayload(client, backend);
    await upsertPostgresBotArchives(client, backend.tableName, database.botArchives);
  }

  seededPostgresBotArchiveStores.add(cacheKey);
}

async function loadPostgresBotUsers(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend
): Promise<BotUserRecord[]> {
  await ensurePostgresBotUsersStore(client, backend.tableName);
  await maybeSeedPostgresBotUsersStore(client, backend);
  const escapedTableName = escapeQualifiedIdentifier(getPostgresBotUsersTableName(backend.tableName));
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapedTableName}
     ORDER BY updated_at DESC, created_at DESC`
  );
  return result.rows.map(normalizePostgresBotUser);
}

async function loadPostgresBotArchives(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend
): Promise<BotArchiveRecord[]> {
  await ensurePostgresBotArchivesStore(client, backend.tableName);
  await maybeSeedPostgresBotArchivesStore(client, backend);
  const escapedTableName = escapeQualifiedIdentifier(getPostgresBotArchivesTableName(backend.tableName));
  const result = await client.query<Record<string, unknown>>(
    `SELECT *
     FROM ${escapedTableName}
     ORDER BY updated_at DESC, archived_at DESC`
  );
  return result.rows.map(normalizePostgresBotArchive);
}

async function syncPostgresBotUsers(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialUsers: readonly BotUserRecord[],
  nextUsers: readonly BotUserRecord[]
): Promise<void> {
  const initialMarkers = new Map(initialUsers.map((user) => [user.id, buildBotUserSyncMarker(user)]));
  const nextIds = new Set(nextUsers.map((user) => user.id));
  const changed = nextUsers.filter((user) => initialMarkers.get(user.id) !== buildBotUserSyncMarker(user));
  const removed = initialUsers.filter((user) => !nextIds.has(user.id)).map((user) => user.id);
  await upsertPostgresBotUsers(client, backend.tableName, changed);
  await deletePostgresBotUsers(client, backend.tableName, removed);
}

async function syncPostgresBotArchives(
  client: PgPool | PoolClient,
  backend: PostgresDatabaseBackend,
  initialArchives: readonly BotArchiveRecord[],
  nextArchives: readonly BotArchiveRecord[]
): Promise<void> {
  const initialMarkers = new Map(initialArchives.map((archive) => [archive.id, buildBotArchiveSyncMarker(archive)]));
  const nextIds = new Set(nextArchives.map((archive) => archive.id));
  const changed = nextArchives.filter(
    (archive) => initialMarkers.get(archive.id) !== buildBotArchiveSyncMarker(archive)
  );
  const removed = initialArchives.filter((archive) => !nextIds.has(archive.id)).map((archive) => archive.id);
  await upsertPostgresBotArchives(client, backend.tableName, changed);
  await deletePostgresBotArchives(client, backend.tableName, removed);
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
  const client = await pool.connect();
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);

  try {
    await client.query("BEGIN");
    await ensurePrimaryPostgresStoreRow(client, backend);
    await ensurePostgresBotUsersStore(client, backend.tableName);
    await ensurePostgresBotArchivesStore(client, backend.tableName);

    const initialBotUsers = await loadPostgresBotUsers(client, backend);
    const initialBotArchives = await loadPostgresBotArchives(client, backend);
    await syncPostgresBotUsers(client, backend, initialBotUsers, data.botUsers);
    await syncPostgresBotArchives(client, backend, initialBotArchives, data.botArchives);
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
  let database = await loadPrimaryDatabasePayload(pool, backend);

  database.botUsers = await loadPostgresBotUsers(pool, backend);
  database.botArchives = await loadPostgresBotArchives(pool, backend);
  return database;
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
    await ensurePostgresBotUsersStore(client, backend.tableName);
    await ensurePostgresBotArchivesStore(client, backend.tableName);

    const selected = await client.query<{ payload: unknown }>(
      `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 FOR UPDATE`,
      [backend.storeKey]
    );
    const database = selected.rows[0] ? normalizeDatabasePayload(selected.rows[0].payload) : buildDefaultDatabase();
    const initialBotUsers = await loadPostgresBotUsers(client, backend);
    const initialBotArchives = await loadPostgresBotArchives(client, backend);
    database.botUsers = structuredClone(initialBotUsers) as BotUserRecord[];
    database.botArchives = structuredClone(initialBotArchives) as BotArchiveRecord[];
    const output = await handler(database);
    await syncPostgresBotUsers(client, backend, initialBotUsers, database.botUsers);
    await syncPostgresBotArchives(client, backend, initialBotArchives, database.botArchives);
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
      const pool = await getPostgresPool(backend.connectionString);
      await ensurePrimaryPostgresStoreRow(pool, backend);
      return loadPrimaryDatabasePayload(pool, backend);
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
        const database = selected.rows[0]
          ? normalizeDatabasePayload(selected.rows[0].payload)
          : buildDefaultDatabase();
        const output = await handler(database);
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

    return withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const output = await handler(database);
      await saveFileDatabase(database, backend.filePath);
      return output;
    });
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
