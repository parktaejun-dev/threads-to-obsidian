import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
const DEFAULT_LEGACY_TABLE = "threads_web_store";
const DEFAULT_STORE_KEY = "default";
const RELATIONAL_TABLE_PREFIX = "threads_web_store";
const DEFAULT_SOURCE_MODE = "auto";
const RELATIONAL_MIGRATION_FILE = path.resolve(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260328164355_public_multiuser_foundation.sql"
);

function readArg(name) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((value) => value.startsWith(prefix));
  return raw ? raw.slice(prefix.length).trim() : "";
}

function readRequiredConnectionString() {
  const value =
    readArg("url") ||
    process.env.THREADS_WEB_POSTGRES_URL?.trim() ||
    process.env.THREADS_WEB_DATABASE_URL?.trim() ||
    "";

  if (!value) {
    throw new Error("Set --url=<postgres-url> or THREADS_WEB_POSTGRES_URL before running the backfill.");
  }

  return value;
}

function readSourceMode() {
  const explicitMode = readArg("source");
  if (explicitMode) {
    const value = explicitMode.toLowerCase();
    if (value === "auto" || value === "file" || value === "postgres") {
      return value;
    }

    throw new Error(`Unsupported --source value: ${value}`);
  }

  if (readArg("from")) {
    return "file";
  }

  if (process.env.THREADS_WEB_STORE_BACKEND?.trim().toLowerCase() === "postgres") {
    return "postgres";
  }

  const value = DEFAULT_SOURCE_MODE;
  if (value === "auto" || value === "file" || value === "postgres") {
    return value;
  }

  throw new Error(`Unsupported --source value: ${value}`);
}

function readSourceFilePath() {
  return readArg("from") || process.env.THREADS_WEB_DB_FILE?.trim() || DEFAULT_DB_FILE;
}

function readLegacyTableName() {
  return readArg("legacy-table") || process.env.THREADS_WEB_POSTGRES_TABLE?.trim() || DEFAULT_LEGACY_TABLE;
}

function readStoreKey() {
  return readArg("store-key") || process.env.THREADS_WEB_POSTGRES_STORE_KEY?.trim() || DEFAULT_STORE_KEY;
}

function escapeQualifiedIdentifier(identifier) {
  return identifier
    .split(".")
    .map((chunk) => `"${chunk.replaceAll("\"", "\"\"")}"`)
    .join(".");
}

function buildTableNames(prefix) {
  return {
    botUsers: `${prefix}_bot_users`,
    botLoginTokens: `${prefix}_bot_login_tokens`,
    botOauthSessions: `${prefix}_bot_oauth_sessions`,
    botSessions: `${prefix}_bot_sessions`,
    botExtensionLinkSessions: `${prefix}_bot_extension_link_sessions`,
    botExtensionAccessTokens: `${prefix}_bot_extension_access_tokens`,
    botMentionJobs: `${prefix}_bot_mention_jobs`,
    botArchives: `${prefix}_bot_archives`,
    cloudArchives: `${prefix}_cloud_archives`,
    watchlists: `${prefix}_watchlists`,
    searchMonitors: `${prefix}_search_monitors`,
    searchResults: `${prefix}_search_results`,
    trackedPosts: `${prefix}_tracked_posts`,
    insightsSnapshots: `${prefix}_insights_snapshots`,
    savedViews: `${prefix}_saved_views`
  };
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNonEmptyStringOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNullableString(value) {
  return typeof value === "string" ? value : null;
}

function asBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asInteger(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;
}

function asJsonArrayOfStrings(value) {
  return asArray(value).filter((entry) => typeof entry === "string");
}

function asJsonString(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { raw: value };
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return { raw: value };
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readLegacyDatabaseFromFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readLegacyDatabaseFromPostgres(pool, tableName, storeKey) {
  const escapedTableName = escapeQualifiedIdentifier(tableName);
  const result = await pool.query(
    `SELECT payload
     FROM ${escapedTableName}
     WHERE store_key = $1
     LIMIT 1`,
    [storeKey]
  );
  if (!result.rows[0]?.payload) {
    throw new Error(`Could not find legacy payload row in ${tableName} (store_key=${storeKey}).`);
  }

  return result.rows[0].payload;
}

async function loadLegacyDatabase(pool, sourceMode, sourceFilePath, legacyTableName, storeKey) {
  if (sourceMode === "file") {
    return readLegacyDatabaseFromFile(sourceFilePath);
  }

  if (sourceMode === "postgres") {
    return readLegacyDatabaseFromPostgres(pool, legacyTableName, storeKey);
  }

  if (await fileExists(sourceFilePath)) {
    return readLegacyDatabaseFromFile(sourceFilePath);
  }

  return readLegacyDatabaseFromPostgres(pool, legacyTableName, storeKey);
}

function renderInsertPlaceholders(columns, jsonColumns) {
  return columns.map((column, index) => `$${index + 1}${jsonColumns.has(column) ? "::jsonb" : ""}`).join(", ");
}

async function upsertRowsById(client, config) {
  const rows = asArray(config.rows).filter((candidate) => isRecord(candidate) && asString(candidate.id).trim());
  if (rows.length === 0) {
    return 0;
  }

  const escapedTableName = escapeQualifiedIdentifier(config.tableName);
  const escapedColumns = config.columns.map((column) => escapeQualifiedIdentifier(column)).join(", ");
  const insertPlaceholders = renderInsertPlaceholders(config.columns, config.jsonColumns ?? new Set());
  const updateAssignments = config.columns
    .filter((column) => column !== "id")
    .map((column) => `${escapeQualifiedIdentifier(column)} = EXCLUDED.${escapeQualifiedIdentifier(column)}`)
    .join(", ");

  const query = `INSERT INTO ${escapedTableName} (${escapedColumns})
    VALUES (${insertPlaceholders})
    ON CONFLICT (id)
    DO UPDATE SET ${updateAssignments}`;

  for (const row of rows) {
    await client.query(query, config.mapRow(row));
  }

  return rows.length;
}

async function main() {
  const connectionString = readRequiredConnectionString();
  const sourceMode = readSourceMode();
  const sourceFilePath = readSourceFilePath();
  const legacyTableName = readLegacyTableName();
  const storeKey = readStoreKey();
  const relationalTables = buildTableNames(RELATIONAL_TABLE_PREFIX);

  const migrationSql = await readFile(RELATIONAL_MIGRATION_FILE, "utf8");
  const pool = new Pool({
    connectionString
  });

  try {
    await pool.query(migrationSql);
    const rawLegacyDatabase = await loadLegacyDatabase(pool, sourceMode, sourceFilePath, legacyTableName, storeKey);
    const legacyDatabase = isRecord(rawLegacyDatabase) ? rawLegacyDatabase : {};
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const results = {
        botUsers: await upsertRowsById(client, {
          tableName: relationalTables.botUsers,
          columns: [
            "id",
            "threads_user_id",
            "threads_handle",
            "display_name",
            "profile_picture_url",
            "biography",
            "is_verified",
            "access_token_ciphertext",
            "token_expires_at",
            "email",
            "granted_scopes",
            "scope_version",
            "last_scope_upgrade_at",
            "created_at",
            "updated_at",
            "last_login_at",
            "status"
          ],
          jsonColumns: new Set(["granted_scopes"]),
          rows: legacyDatabase.botUsers,
          mapRow: (row) => [
            asString(row.id),
            asNullableString(row.threadsUserId),
            asString(row.threadsHandle),
            asNullableString(row.displayName),
            asNullableString(row.profilePictureUrl),
            asNullableString(row.biography),
            asBoolean(row.isVerified),
            asNullableString(row.accessTokenCiphertext),
            asNullableString(row.tokenExpiresAt),
            asNullableString(row.email),
            asJsonArrayOfStrings(row.grantedScopes),
            asInteger(row.scopeVersion, 0),
            asNullableString(row.lastScopeUpgradeAt),
            asString(row.createdAt),
            asString(row.updatedAt),
            asNullableString(row.lastLoginAt),
            asString(row.status, "active")
          ]
        }),
        botLoginTokens: await upsertRowsById(client, {
          tableName: relationalTables.botLoginTokens,
          columns: ["id", "user_id", "token_hash", "requested_handle", "created_at", "expires_at", "consumed_at", "status"],
          rows: legacyDatabase.botLoginTokens,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.tokenHash),
            asString(row.requestedHandle),
            asString(row.createdAt),
            asString(row.expiresAt),
            asNullableString(row.consumedAt),
            asString(row.status, "pending")
          ]
        }),
        botOauthSessions: await upsertRowsById(client, {
          tableName: relationalTables.botOauthSessions,
          columns: [
            "id",
            "state_hash",
            "poll_token_hash",
            "created_at",
            "expires_at",
            "completed_at",
            "activation_code",
            "activation_expires_at",
            "linked_session_token",
            "status"
          ],
          rows: legacyDatabase.botOauthSessions,
          mapRow: (row) => [
            asString(row.id),
            asString(row.stateHash),
            asNonEmptyStringOrFallback(
              row.pollTokenHash,
              `legacy-missing-poll-token:${asString(row.id) || asString(row.stateHash)}`
            ),
            asString(row.createdAt),
            asString(row.expiresAt),
            asNullableString(row.completedAt),
            asNullableString(row.activationCode),
            asNullableString(row.activationExpiresAt),
            asNullableString(row.linkedSessionToken),
            asString(row.status, "pending")
          ]
        }),
        botSessions: await upsertRowsById(client, {
          tableName: relationalTables.botSessions,
          columns: ["id", "user_id", "session_hash", "created_at", "expires_at", "last_seen_at", "revoked_at", "status"],
          rows: legacyDatabase.botSessions,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.sessionHash),
            asString(row.createdAt),
            asString(row.expiresAt),
            asString(row.lastSeenAt),
            asNullableString(row.revokedAt),
            asString(row.status, "active")
          ]
        }),
        botExtensionLinkSessions: await upsertRowsById(client, {
          tableName: relationalTables.botExtensionLinkSessions,
          columns: ["id", "user_id", "state", "code_hash", "created_at", "expires_at", "consumed_at", "revoked_at", "status"],
          rows: legacyDatabase.botExtensionLinkSessions,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.state),
            asString(row.codeHash),
            asString(row.createdAt),
            asString(row.expiresAt),
            asNullableString(row.consumedAt),
            asNullableString(row.revokedAt),
            asString(row.status, "pending")
          ]
        }),
        botExtensionAccessTokens: await upsertRowsById(client, {
          tableName: relationalTables.botExtensionAccessTokens,
          columns: ["id", "user_id", "token_hash", "created_at", "expires_at", "linked_at", "last_used_at", "revoked_at", "status"],
          rows: legacyDatabase.botExtensionAccessTokens,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.tokenHash),
            asString(row.createdAt),
            asString(row.expiresAt),
            asString(row.linkedAt),
            asNullableString(row.lastUsedAt),
            asNullableString(row.revokedAt),
            asString(row.status, "active")
          ]
        }),
        botMentionJobs: await upsertRowsById(client, {
          tableName: relationalTables.botMentionJobs,
          columns: [
            "id",
            "mention_id",
            "mention_url",
            "mention_author_handle",
            "mention_author_user_id",
            "mention_text",
            "mention_published_at",
            "raw_summary_json",
            "attempts",
            "status",
            "last_error",
            "available_at",
            "leased_at",
            "processed_at",
            "created_at",
            "updated_at"
          ],
          jsonColumns: new Set(["raw_summary_json"]),
          rows: legacyDatabase.botMentionJobs,
          mapRow: (row) => [
            asString(row.id),
            asString(row.mentionId),
            asNullableString(row.mentionUrl),
            asNullableString(row.mentionAuthorHandle),
            asNullableString(row.mentionAuthorUserId),
            asNullableString(row.mentionText),
            asNullableString(row.mentionPublishedAt),
            asJsonString(row.rawSummaryJson),
            asInteger(row.attempts, 0),
            asString(row.status, "queued"),
            asNullableString(row.lastError),
            asString(row.availableAt),
            asNullableString(row.leasedAt),
            asNullableString(row.processedAt),
            asString(row.createdAt),
            asString(row.updatedAt)
          ]
        }),
        botArchives: await upsertRowsById(client, {
          tableName: relationalTables.botArchives,
          columns: [
            "id",
            "user_id",
            "mention_id",
            "mention_url",
            "mention_author_handle",
            "mention_author_display_name",
            "note_text",
            "target_url",
            "target_author_handle",
            "target_author_display_name",
            "target_text",
            "target_published_at",
            "media_urls",
            "markdown_content",
            "raw_payload_json",
            "archived_at",
            "updated_at",
            "status"
          ],
          jsonColumns: new Set(["media_urls"]),
          rows: legacyDatabase.botArchives,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asNullableString(row.mentionId),
            asString(row.mentionUrl),
            asString(row.mentionAuthorHandle),
            asNullableString(row.mentionAuthorDisplayName),
            asNullableString(row.noteText),
            asString(row.targetUrl),
            asNullableString(row.targetAuthorHandle),
            asNullableString(row.targetAuthorDisplayName),
            asString(row.targetText),
            asNullableString(row.targetPublishedAt),
            asJsonArrayOfStrings(row.mediaUrls),
            asString(row.markdownContent),
            asNullableString(row.rawPayloadJson),
            asString(row.archivedAt),
            asString(row.updatedAt),
            asString(row.status, "saved")
          ]
        }),
        cloudArchives: await upsertRowsById(client, {
          tableName: relationalTables.cloudArchives,
          columns: [
            "id",
            "user_id",
            "canonical_url",
            "shortcode",
            "target_author_handle",
            "target_author_display_name",
            "target_title",
            "target_text",
            "target_published_at",
            "media_urls",
            "markdown_content",
            "raw_payload_json",
            "content_hash",
            "saved_at",
            "updated_at",
            "status"
          ],
          jsonColumns: new Set(["media_urls"]),
          rows: legacyDatabase.cloudArchives,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.canonicalUrl),
            asString(row.shortcode),
            asNullableString(row.targetAuthorHandle),
            asNullableString(row.targetAuthorDisplayName),
            asString(row.targetTitle),
            asString(row.targetText),
            asNullableString(row.targetPublishedAt),
            asJsonArrayOfStrings(row.mediaUrls),
            asString(row.markdownContent),
            asNullableString(row.rawPayloadJson),
            asString(row.contentHash),
            asString(row.savedAt),
            asString(row.updatedAt),
            asString(row.status, "saved")
          ]
        }),
        watchlists: await upsertRowsById(client, {
          tableName: relationalTables.watchlists,
          columns: [
            "id",
            "user_id",
            "target_handle",
            "target_threads_user_id",
            "target_display_name",
            "target_profile_picture_url",
            "include_text",
            "exclude_text",
            "media_types",
            "auto_archive",
            "digest_cadence",
            "last_cursor",
            "last_synced_at",
            "last_error",
            "created_at",
            "updated_at",
            "status"
          ],
          jsonColumns: new Set(["media_types"]),
          rows: legacyDatabase.watchlists,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.targetHandle),
            asNullableString(row.targetThreadsUserId),
            asNullableString(row.targetDisplayName),
            asNullableString(row.targetProfilePictureUrl),
            asString(row.includeText),
            asString(row.excludeText),
            asJsonArrayOfStrings(row.mediaTypes),
            asBoolean(row.autoArchive),
            asString(row.digestCadence, "off"),
            asNullableString(row.lastCursor),
            asNullableString(row.lastSyncedAt),
            asNullableString(row.lastError),
            asString(row.createdAt),
            asString(row.updatedAt),
            asString(row.status, "active")
          ]
        }),
        searchMonitors: await upsertRowsById(client, {
          tableName: relationalTables.searchMonitors,
          columns: [
            "id",
            "user_id",
            "query",
            "author_handle",
            "exclude_handles",
            "auto_archive",
            "search_type",
            "last_cursor",
            "last_run_at",
            "last_error",
            "created_at",
            "updated_at",
            "status"
          ],
          jsonColumns: new Set(["exclude_handles"]),
          rows: legacyDatabase.searchMonitors,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.query),
            asNullableString(row.authorHandle),
            asJsonArrayOfStrings(row.excludeHandles),
            asBoolean(row.autoArchive),
            asString(row.searchType, "top"),
            asNullableString(row.lastCursor),
            asNullableString(row.lastRunAt),
            asNullableString(row.lastError),
            asString(row.createdAt),
            asString(row.updatedAt),
            asString(row.status, "active")
          ]
        }),
        searchResults: await upsertRowsById(client, {
          tableName: relationalTables.searchResults,
          columns: [
            "id",
            "user_id",
            "monitor_id",
            "external_post_id",
            "canonical_url",
            "author_handle",
            "author_display_name",
            "text",
            "published_at",
            "media_type",
            "media_urls",
            "matched_terms",
            "relevance_score",
            "archive_id",
            "archived_at",
            "dismissed_at",
            "discovered_at",
            "updated_at",
            "raw_payload_json",
            "status"
          ],
          jsonColumns: new Set(["media_urls", "matched_terms"]),
          rows: legacyDatabase.searchResults,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.monitorId),
            asString(row.externalPostId),
            asString(row.canonicalUrl),
            asString(row.authorHandle),
            asNullableString(row.authorDisplayName),
            asString(row.text),
            asNullableString(row.publishedAt),
            asNullableString(row.mediaType),
            asJsonArrayOfStrings(row.mediaUrls),
            asJsonArrayOfStrings(row.matchedTerms),
            asNumber(row.relevanceScore),
            asNullableString(row.archiveId),
            asNullableString(row.archivedAt),
            asNullableString(row.dismissedAt),
            asString(row.discoveredAt),
            asString(row.updatedAt),
            asNullableString(row.rawPayloadJson),
            asString(row.status, "new")
          ]
        }),
        trackedPosts: await upsertRowsById(client, {
          tableName: relationalTables.trackedPosts,
          columns: [
            "id",
            "user_id",
            "origin",
            "source_id",
            "external_post_id",
            "canonical_url",
            "author_handle",
            "author_display_name",
            "text",
            "published_at",
            "media_type",
            "media_urls",
            "matched_terms",
            "relevance_score",
            "archive_id",
            "archived_at",
            "discovered_at",
            "updated_at",
            "raw_payload_json"
          ],
          jsonColumns: new Set(["media_urls", "matched_terms"]),
          rows: legacyDatabase.trackedPosts,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.origin),
            asNullableString(row.sourceId),
            asString(row.externalPostId),
            asString(row.canonicalUrl),
            asString(row.authorHandle),
            asNullableString(row.authorDisplayName),
            asString(row.text),
            asNullableString(row.publishedAt),
            asNullableString(row.mediaType),
            asJsonArrayOfStrings(row.mediaUrls),
            asJsonArrayOfStrings(row.matchedTerms),
            asNumber(row.relevanceScore),
            asNullableString(row.archiveId),
            asNullableString(row.archivedAt),
            asString(row.discoveredAt),
            asString(row.updatedAt),
            asNullableString(row.rawPayloadJson)
          ]
        }),
        insightsSnapshots: await upsertRowsById(client, {
          tableName: relationalTables.insightsSnapshots,
          columns: [
            "id",
            "user_id",
            "kind",
            "external_post_id",
            "canonical_url",
            "title",
            "likes",
            "replies",
            "reposts",
            "quotes",
            "views",
            "followers",
            "profile_views",
            "captured_at",
            "raw_payload_json"
          ],
          rows: legacyDatabase.insightsSnapshots,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.kind),
            asNullableString(row.externalPostId),
            asNullableString(row.canonicalUrl),
            asNullableString(row.title),
            asNumber(row.likes),
            asNumber(row.replies),
            asNumber(row.reposts),
            asNumber(row.quotes),
            asNumber(row.views),
            asNumber(row.followers),
            asNumber(row.profileViews),
            asString(row.capturedAt),
            asNullableString(row.rawPayloadJson)
          ]
        }),
        savedViews: await upsertRowsById(client, {
          tableName: relationalTables.savedViews,
          columns: ["id", "user_id", "name", "kind", "target_ids", "created_at", "updated_at", "status"],
          jsonColumns: new Set(["target_ids"]),
          rows: legacyDatabase.savedViews,
          mapRow: (row) => [
            asString(row.id),
            asString(row.userId),
            asString(row.name),
            asString(row.kind),
            asJsonArrayOfStrings(row.targetIds),
            asString(row.createdAt),
            asString(row.updatedAt),
            asString(row.status, "active")
          ]
        })
      };

      await client.query("COMMIT");

      process.stdout.write(`Applied relational schema from ${RELATIONAL_MIGRATION_FILE}.\n`);
      process.stdout.write(
        `Backfilled legacy data from ${
          sourceMode === "postgres" || !(await fileExists(sourceFilePath))
            ? `${legacyTableName} (store_key=${storeKey})`
            : sourceFilePath
        }.\n`
      );
      for (const [label, count] of Object.entries(results)) {
      process.stdout.write(`- ${label}: ${count}\n`);
      }
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
