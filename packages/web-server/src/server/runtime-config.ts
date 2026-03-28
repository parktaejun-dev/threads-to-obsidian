import { readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  RuntimeCollectorConfig,
  RuntimeDatabaseConfig,
  RuntimeSmtpConfig,
  WebRuntimeConfig
} from "@threads/web-schema";

const DEFAULT_RUNTIME_CONFIG_FILE = path.resolve(process.cwd(), "output", "web-runtime-config.json");
const DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
const DEFAULT_POSTGRES_TABLE = "threads_web_store";
const DEFAULT_POSTGRES_STORE_KEY = "default";
const DEFAULT_PUBLIC_ORIGIN = "https://ss-threads.dahanda.dev";
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_COLLECTOR_INTERVAL_MS = 60_000;
const DEFAULT_COLLECTOR_FETCH_LIMIT = 25;
const DEFAULT_COLLECTOR_MAX_PAGES = 5;
const MAX_COLLECTOR_FETCH_LIMIT = 100;
const BOT_HANDLE_PATTERN = /^[a-z0-9._]+$/;

function trimEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function parsePositiveInteger(raw: string | number | null | undefined, fallback: number, minimum: number, maximum: number): number {
  const text = typeof raw === "number" ? String(raw) : `${raw ?? ""}`.trim();
  if (!text) {
    return fallback;
  }

  const parsed = Number.parseInt(text, 10);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return fallback;
  }

  return parsed;
}

function normalizeOrigin(raw: string | null | undefined, fallback: string): string {
  const text = `${raw ?? ""}`.trim();
  if (!text) {
    return fallback;
  }

  try {
    return new URL(text).origin;
  } catch {
    return fallback;
  }
}

function normalizeBotHandle(raw: string | null | undefined): string {
  const normalized = `${raw ?? ""}`.trim().replace(/^@+/, "").toLowerCase();
  if (!normalized || !BOT_HANDLE_PATTERN.test(normalized)) {
    return "";
  }

  return normalized;
}

export function getRuntimeConfigFilePath(): string {
  return trimEnv("THREADS_WEB_RUNTIME_CONFIG_FILE") || DEFAULT_RUNTIME_CONFIG_FILE;
}

function readEnvDatabaseBackendPreference(): "file" | "postgres" | null {
  const normalized = trimEnv("THREADS_WEB_STORE_BACKEND").toLowerCase();
  if (normalized === "file" || normalized === "postgres") {
    return normalized;
  }

  return null;
}

function readEnvDatabaseConnectionString(): string {
  return trimEnv("THREADS_WEB_POSTGRES_URL") || trimEnv("THREADS_WEB_DATABASE_URL");
}

function buildFallbackRuntimeConfig(): WebRuntimeConfig {
  return {
    publicOrigin: DEFAULT_PUBLIC_ORIGIN,
    database: {
      backend: "file",
      filePath: DEFAULT_DB_FILE,
      postgresUrl: "",
      tableName: DEFAULT_POSTGRES_TABLE,
      storeKey: DEFAULT_POSTGRES_STORE_KEY
    },
    smtp: {
      host: "",
      port: DEFAULT_SMTP_PORT,
      secure: false,
      user: "",
      pass: "",
      from: ""
    },
    collector: {
      botHandle: "",
      accessTokenOverride: "",
      graphApiVersion: "",
      intervalMs: DEFAULT_COLLECTOR_INTERVAL_MS,
      fetchLimit: DEFAULT_COLLECTOR_FETCH_LIMIT,
      maxPages: DEFAULT_COLLECTOR_MAX_PAGES
    }
  };
}

function buildRuntimeConfigFromEnv(): WebRuntimeConfig {
  const databaseBackend = readEnvDatabaseBackendPreference() ?? "file";
  return normalizeRuntimeConfig({
    publicOrigin: trimEnv("THREADS_WEB_PUBLIC_ORIGIN") || DEFAULT_PUBLIC_ORIGIN,
    database: {
      backend: databaseBackend,
      filePath: trimEnv("THREADS_WEB_DB_FILE") || DEFAULT_DB_FILE,
      postgresUrl: readEnvDatabaseConnectionString(),
      tableName: trimEnv("THREADS_WEB_POSTGRES_TABLE") || DEFAULT_POSTGRES_TABLE,
      storeKey: trimEnv("THREADS_WEB_POSTGRES_STORE_KEY") || DEFAULT_POSTGRES_STORE_KEY
    },
    smtp: {
      host: trimEnv("THREADS_SMTP_HOST"),
      port: parsePositiveInteger(trimEnv("THREADS_SMTP_PORT"), DEFAULT_SMTP_PORT, 1, 65535),
      secure: trimEnv("THREADS_SMTP_SECURE").toLowerCase() === "true",
      user: trimEnv("THREADS_SMTP_USER"),
      pass: trimEnv("THREADS_SMTP_PASS"),
      from: trimEnv("THREADS_SMTP_FROM")
    },
    collector: {
      botHandle: trimEnv("THREADS_BOT_HANDLE"),
      accessTokenOverride: trimEnv("THREADS_BOT_MENTION_ACCESS_TOKEN"),
      graphApiVersion: trimEnv("THREADS_BOT_GRAPH_API_VERSION"),
      intervalMs: parsePositiveInteger(trimEnv("THREADS_BOT_MENTION_POLL_INTERVAL_MS"), DEFAULT_COLLECTOR_INTERVAL_MS, 5_000, 86_400_000),
      fetchLimit: parsePositiveInteger(trimEnv("THREADS_BOT_MENTION_FETCH_LIMIT"), DEFAULT_COLLECTOR_FETCH_LIMIT, 1, MAX_COLLECTOR_FETCH_LIMIT),
      maxPages: parsePositiveInteger(trimEnv("THREADS_BOT_MENTION_MAX_PAGES"), DEFAULT_COLLECTOR_MAX_PAGES, 1, 20)
    }
  }, buildFallbackRuntimeConfig());
}

function normalizeDatabaseConfig(
  parsed: Partial<RuntimeDatabaseConfig> | undefined,
  fallback: RuntimeDatabaseConfig
): RuntimeDatabaseConfig {
  const backend = parsed?.backend === "postgres" ? "postgres" : parsed?.backend === "file" ? "file" : fallback.backend;
  return {
    backend,
    filePath: `${parsed?.filePath ?? fallback.filePath ?? ""}`.trim() || fallback.filePath,
    postgresUrl: `${parsed?.postgresUrl ?? fallback.postgresUrl ?? ""}`.trim(),
    tableName: `${parsed?.tableName ?? fallback.tableName ?? ""}`.trim() || fallback.tableName,
    storeKey: `${parsed?.storeKey ?? fallback.storeKey ?? ""}`.trim() || fallback.storeKey
  };
}

function normalizeSmtpConfig(
  parsed: Partial<RuntimeSmtpConfig> | undefined,
  fallback: RuntimeSmtpConfig
): RuntimeSmtpConfig {
  return {
    host: `${parsed?.host ?? fallback.host ?? ""}`.trim(),
    port: parsePositiveInteger(parsed?.port, fallback.port, 1, 65535),
    secure: typeof parsed?.secure === "boolean" ? parsed.secure : fallback.secure,
    user: `${parsed?.user ?? fallback.user ?? ""}`.trim(),
    pass: `${parsed?.pass ?? fallback.pass ?? ""}`.trim(),
    from: `${parsed?.from ?? fallback.from ?? ""}`.trim()
  };
}

function normalizeCollectorConfig(
  parsed: Partial<RuntimeCollectorConfig> | undefined,
  fallback: RuntimeCollectorConfig
): RuntimeCollectorConfig {
  const fallbackBotHandle = normalizeBotHandle(fallback.botHandle ?? "");
  const nextBotHandle = normalizeBotHandle(parsed?.botHandle ?? fallbackBotHandle);
  return {
    botHandle: nextBotHandle || fallbackBotHandle,
    accessTokenOverride: `${parsed?.accessTokenOverride ?? fallback.accessTokenOverride ?? ""}`.trim(),
    graphApiVersion: `${parsed?.graphApiVersion ?? fallback.graphApiVersion ?? ""}`.trim(),
    intervalMs: parsePositiveInteger(parsed?.intervalMs, fallback.intervalMs, 5_000, 86_400_000),
    fetchLimit: parsePositiveInteger(parsed?.fetchLimit, fallback.fetchLimit, 1, MAX_COLLECTOR_FETCH_LIMIT),
    maxPages: parsePositiveInteger(parsed?.maxPages, fallback.maxPages, 1, 20)
  };
}

export function normalizeRuntimeConfig(
  parsed: Partial<WebRuntimeConfig> | undefined,
  fallback = buildRuntimeConfigFromEnv()
): WebRuntimeConfig {
  return {
    publicOrigin: normalizeOrigin(parsed?.publicOrigin, fallback.publicOrigin),
    database: normalizeDatabaseConfig(parsed?.database, fallback.database),
    smtp: normalizeSmtpConfig(parsed?.smtp, fallback.smtp),
    collector: normalizeCollectorConfig(parsed?.collector, fallback.collector)
  };
}

function cloneRuntimeConfig(config: WebRuntimeConfig): WebRuntimeConfig {
  return {
    publicOrigin: config.publicOrigin,
    database: { ...config.database },
    smtp: { ...config.smtp },
    collector: { ...config.collector }
  };
}

let runtimeConfigOverride: WebRuntimeConfig | null = null;
let activeRuntimeConfig: WebRuntimeConfig | null = null;
let activeRuntimeConfigFilePath: string | null = null;

function loadRuntimeConfigFromDisk(): WebRuntimeConfig {
  const fallback = buildRuntimeConfigFromEnv();
  const filePath = getRuntimeConfigFilePath();
  try {
    const raw = readFileSync(filePath, "utf8");
    return normalizeRuntimeConfig(JSON.parse(raw) as Partial<WebRuntimeConfig>, fallback);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export function getRuntimeConfigSnapshot(): WebRuntimeConfig {
  if (runtimeConfigOverride) {
    return cloneRuntimeConfig(runtimeConfigOverride);
  }

  const filePath = getRuntimeConfigFilePath();
  if (!activeRuntimeConfig || activeRuntimeConfigFilePath !== filePath) {
    activeRuntimeConfig = loadRuntimeConfigFromDisk();
    activeRuntimeConfigFilePath = filePath;
  }

  return cloneRuntimeConfig(activeRuntimeConfig);
}

export function getPersistedRuntimeConfigSnapshot(): WebRuntimeConfig {
  if (runtimeConfigOverride) {
    return cloneRuntimeConfig(runtimeConfigOverride);
  }

  return cloneRuntimeConfig(loadRuntimeConfigFromDisk());
}

export function activateRuntimeConfig(nextConfig: Partial<WebRuntimeConfig> | WebRuntimeConfig): WebRuntimeConfig {
  const normalized = normalizeRuntimeConfig(nextConfig, getPersistedRuntimeConfigSnapshot());
  activeRuntimeConfig = normalized;
  activeRuntimeConfigFilePath = getRuntimeConfigFilePath();
  return cloneRuntimeConfig(normalized);
}

export async function saveRuntimeConfig(
  nextConfig: Partial<WebRuntimeConfig> | WebRuntimeConfig,
  options: { activate?: boolean } = {}
): Promise<WebRuntimeConfig> {
  const normalized = normalizeRuntimeConfig(nextConfig, getPersistedRuntimeConfigSnapshot());
  const filePath = getRuntimeConfigFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  await writeFile(tempPath, JSON.stringify(normalized, null, 2), "utf8");
  await rename(tempPath, filePath);
  if (runtimeConfigOverride) {
    runtimeConfigOverride = normalized;
  }
  if (options.activate !== false) {
    activeRuntimeConfig = normalized;
    activeRuntimeConfigFilePath = filePath;
  }
  return cloneRuntimeConfig(normalized);
}

export function replaceRuntimeConfigForTests(nextConfig: WebRuntimeConfig | null): void {
  runtimeConfigOverride = nextConfig ? normalizeRuntimeConfig(nextConfig) : null;
  activeRuntimeConfig = nextConfig ? normalizeRuntimeConfig(nextConfig) : null;
  activeRuntimeConfigFilePath = nextConfig ? getRuntimeConfigFilePath() : null;
}
