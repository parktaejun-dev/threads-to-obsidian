import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";

const DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
const DEFAULT_TABLE = "threads_web_store";
const DEFAULT_STORE_KEY = "default";

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
    throw new Error("Set --url=<postgres-url> or THREADS_WEB_POSTGRES_URL before running the migration.");
  }

  return value;
}

function readSourceFilePath() {
  return readArg("from") || process.env.THREADS_WEB_DB_FILE?.trim() || DEFAULT_DB_FILE;
}

function readTableName() {
  return readArg("table") || process.env.THREADS_WEB_POSTGRES_TABLE?.trim() || DEFAULT_TABLE;
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

async function main() {
  const connectionString = readRequiredConnectionString();
  const sourceFilePath = readSourceFilePath();
  const tableName = readTableName();
  const storeKey = readStoreKey();
  const escapedTableName = escapeQualifiedIdentifier(tableName);

  const raw = await readFile(sourceFilePath, "utf8");
  JSON.parse(raw);

  const pool = new Pool({
    connectionString
  });

  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
        store_key TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    );
    await pool.query(
      `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (store_key)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [storeKey, raw]
    );
    process.stdout.write(
      `Migrated ${sourceFilePath} into ${tableName} (store_key=${storeKey}).\n`
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
