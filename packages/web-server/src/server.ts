import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeLocale, parseSupportedLocale, type SupportedLocale } from "@threads/shared/locale";
import type { AiOrganizationResult, ExtractedPost } from "@threads/shared/types";
import type {
  AdminRuntimeConfigResponse,
  AdminRuntimeConfigSecretState,
  BotMentionJobRecord,
  BillingCycle,
  EmailDeliveryDraft,
  LicenseRecord,
  PaymentMethod,
  PublicStorefrontResponse,
  PurchaseOrder,
  RuntimeCollectorConfig,
  RuntimeConfigTestResult,
  RuntimeDatabaseConfig,
  RuntimeSmtpConfig,
  StorefrontSettings,
  WebDatabase,
  WebRuntimeConfig
} from "@threads/web-schema";
import { buildDeliveryDraft, buildTokenPreview, signProLicenseToken } from "./server/license-service";
import { activateLicenseSeat, getLicenseSeatStatus, releaseLicenseSeat } from "./server/activation-service";
import { isMailerConfigured, sendDeliveryEmail, testDeliveryEmailConfig } from "./server/mailer";
import {
  completeNotionAuth,
  createNotionAuthStart,
  disconnectNotionConnection,
  getNotionConnectionSummary,
  savePostThroughNotionConnection,
  searchNotionLocations,
  selectNotionLocation,
  validateNotionClient
} from "./server/notion-service";
import {
  activateBotOauthSessionFromStore,
  failBotOauthSessionFromStore,
  completeExtensionLinkCodeFromStore,
  type BotIngestPayload,
  createExtensionLinkCodeFromStore,
  deleteArchiveFromStore,
  updateArchiveFromStore,
  deleteExtensionCloudArchiveFromStore,
  completeBotOauthFromStore,
  getExtensionCloudConnectionStatusFromStore,
  getBotPublicConfig,
  getBotSessionStateFromStore,
  listExtensionCloudArchivesFromStore,
  readBotArchiveZipFromStore,
  ingestBotMention,
  pollBotOauthSessionFromStore,
  repairBotSessionArchivesFromStore,
  revokeExtensionCloudConnectionFromStore,
  readBotArchiveMarkdownFromStore,
  saveCloudArchiveWithExtensionTokenFromStore,
  revokeBotSessionFromStore,
  syncExtensionCloudLicenseLinkFromStore,
  startBotOauthFromStore,
  validateBotIngestRequest
} from "./server/bot-service";
import {
  archiveSearchResultFromStore,
  archiveTrackedPostFromStore,
  archiveTrackedInsightPostFromStore,
  activateScrapbookPlusForSessionFromStore,
  clearScrapbookPlusForSessionFromStore,
  createSearchMonitorFromStore,
  createWatchlistFromStore,
  deleteInsightsViewFromStore,
  deleteSearchMonitorFromStore,
  deleteWatchlistFromStore,
  dismissSearchResultFromStore,
  readScrapbookPlusStateFromStore,
  refreshInsightsFromStore,
  saveInsightsViewFromStore,
  runSearchMonitorFromStore,
  syncWatchlistFromStore
} from "./server/scrapbook-plus-service";
import {
  createBotMentionCollector,
  type BotMentionCollector
} from "./server/bot-mention-service";
import {
  appendHistory,
  buildDashboardSummary,
  buildPublicStorefront,
  buildRevenueReport,
  closeDatabaseConnections,
  loadBotArchives,
  loadBotMentionJobs,
  loadDatabase,
  loadDatabaseForConfig,
  loadPublicStorefrontSnapshot,
  pingDatabase,
  saveDatabaseForConfig,
  testDatabaseConfig,
  upsertLicense,
  upsertOrder,
  upsertPaymentMethod,
  withExclusiveDatabaseReconfiguration,
  withDatabaseTransaction
} from "./server/store";
import {
  acknowledgeMonitoringIncident,
  configureMonitoringService,
  getMonitoringOverview,
  listMonitoringIncidents,
  resolveMonitoringIncident,
  runMonitoringNow,
  stopMonitoringService
} from "./server/monitoring-service";
import { fetchWithTimeout } from "./server/http-client";
import {
  appendRequestLog,
  buildRequestMetricsSummary,
  classifyRequestCategory,
  emitStructuredRequestLog,
  listRecentRequestLogs,
  shouldPersistRequestLog
} from "./server/request-observability";
import {
  activateRuntimeConfig,
  getPersistedRuntimeConfigSnapshot,
  getRuntimeConfigSnapshot,
  normalizeRuntimeConfig,
  saveRuntimeConfig
} from "./server/runtime-config";
import {
  buildWebhookPayloadHash,
  isProcessedWebhookDuplicate,
  listRecentWebhookEvents,
  markWebhookEventOutcome,
  recordWebhookEventAttempt
} from "./server/webhook-ledger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PORT = 4173;
const DEFAULT_MAX_BODY_BYTES = 1_000_000;
const MAX_ALLOWED_BODY_BYTES = 2_000_000;
const BOT_SESSION_COOKIE = "threads_bot_session";
const BOT_SESSION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const ADMIN_SESSION_COOKIE = "threads_admin_session";
const ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;
const ADMIN_SESSION_VERSION = "v1";
const DEFAULT_LANDING_BOT_HANDLE = "ss_threads_bot";
const LANDING_HEADLINE_LINES: Record<SupportedLocale, string[]> = {
  ko: ["Threads 글 저장을 편하게,", "PC는 extension, 모바일은 @mention"],
  en: ["Keep Threads in one place.", "Desktop saves with the extension."],
  ja: ["Threads 保存をもっと手軽に", "PC は extension、Mobile は @mention", "返信で @{botHandle} と書くだけ。"],
  "pt-BR": ["Salve Threads com menos atrito.", "Extension no PC, @mention no celular.", "Responda com @{botHandle}."],
  es: ["Guarda Threads de forma simple.", "Extension en PC, @mention en móvil.", "Responde con @{botHandle}."],
  "zh-TW": ["更輕鬆地保存 Threads", "PC 用 extension，Mobile 用 @mention", "回覆 @{botHandle} 就可以。"],
  vi: ["Lưu Threads gọn hơn.", "Dùng extension trên PC, @mention trên mobile.", "Chỉ cần trả lời với @{botHandle}."]
};
const LANDING_MENTION_HTML: Partial<Record<SupportedLocale, string>> = {
  ko: '댓글로 <code class="bot-handle">@{botHandle}</code> 만 적으세요.',
  en: 'Reply with <code class="bot-handle">@{botHandle}</code> only.'
};
const DEFAULT_ADMIN_ALLOWLIST = new Set(["127.0.0.1", "::1"]);
const RATE_LIMIT_BUCKET_GC_INTERVAL_MS = 5 * 60_000;
const DEFAULT_RATE_LIMIT_BUCKET_LIMIT = 50_000;
const DEFAULT_STRIPE_WEBHOOK_TOLERANCE_MS = 5 * 60_000;
const DEFAULT_SERVER_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_SERVER_HEADERS_TIMEOUT_MS = 35_000;
const DEFAULT_SERVER_KEEP_ALIVE_TIMEOUT_MS = 5_000;
const DEFAULT_GRACEFUL_SHUTDOWN_TIMEOUT_MS = 15_000;
const DEFAULT_PUBLIC_STOREFRONT_CACHE_TTL_MS = 60_000;
const DEFAULT_PUBLIC_STOREFRONT_STALE_WHILE_REVALIDATE_MS = 5 * 60_000;
const DEFAULT_PUBLIC_STOREFRONT_STALE_IF_ERROR_MS = 24 * 60 * 60_000;
const DEFAULT_PUBLIC_STOREFRONT_SNAPSHOT_FILE = path.resolve(process.cwd(), "output", "public-storefront-snapshot.json");
const PUBLIC_MARKETING_PAGE_CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self' https://cdn.jsdelivr.net; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://cdn.jsdelivr.net; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'";
const ADMIN_PAGE_CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'";
const PUBLIC_PAGE_PERMISSIONS_POLICY =
  "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
let ignoredForwardedForWarningLogged = false;

type CachedPublicStorefront = {
  loadedAt: number;
  snapshot: PublicStorefrontResponse;
};

const publicStorefrontCache: {
  current: CachedPublicStorefront | null;
  diskLoadAttempted: boolean;
  refreshInFlight: Promise<CachedPublicStorefront> | null;
} = {
  current: null,
  diskLoadAttempted: false,
  refreshInFlight: null
};
const staticTextTemplateCache = new Map<string, string>();

interface ServerConfig {
  adminToken: string;
  host: string;
  maxBodyBytes: number;
  port: number;
}

type RuntimeConfigPatch = {
  publicOrigin?: string;
  database?: Partial<RuntimeDatabaseConfig>;
  smtp?: Partial<RuntimeSmtpConfig>;
  collector?: Partial<RuntimeCollectorConfig>;
  secretActions?: {
    databasePostgresUrl?: "clear" | "keep" | "replace";
    smtpPass?: "clear" | "keep" | "replace";
  };
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitState = {
  buckets: Map<string, RateLimitBucket>;
  gcTimer: NodeJS.Timeout | null;
};

class RequestError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

type PaymentProvider = "stableorder" | "stripe" | "paypal";

interface WebhookHints {
  orderId: string | null;
  orderReference: string | null;
  email: string | null;
  eventId: string | null;
  paid: boolean;
}

type WebhookReason =
  | "signature_rejected"
  | "order_not_found"
  | "payment_not_completed"
  | "already_processed"
  | "issued"
  | "no_change"
  | "payment_marked";

type PublicMentionSaveState = "idle" | "queued" | "processing" | "completed" | "failed";

type PublicMentionSaveStatus = {
  currentState: PublicMentionSaveState;
  completionSource: "job" | "archive_inferred" | null;
  collectorEnabled: boolean;
  pollIntervalMs: number;
  collectorError: string | null;
  lastCollectedAt: string | null;
  latestMentionUrl: string | null;
  latestMentionCreatedAt: string | null;
  latestMentionUpdatedAt: string | null;
  latestJobStatus: string | null;
  latestJobError: string | null;
  latestSavedAt: string | null;
  expectedVisibleAt: string | null;
  retryAvailableAt: string | null;
};

const PROVIDER_METHOD_DEFAULT_IDS: Record<PaymentProvider, string> = {
  stableorder: "pm-stableorder",
  stripe: "pm-stripe",
  paypal: "pm-paypal"
};

const PROVIDER_WEBHOOK_SECRETS: Record<Exclude<PaymentProvider, "paypal">, string> = {
  stableorder: "THREADS_WEBHOOK_SECRET_STABLEORDER",
  stripe: "THREADS_WEBHOOK_SECRET_STRIPE"
};

const PROVIDER_WEBHOOK_HEADERS: Record<PaymentProvider, string> = {
  stableorder: "x-stableorder-signature",
  stripe: "stripe-signature",
  paypal: "paypal-transmission-sig"
};

const PROVIDER_ACTION_URL_PATTERNS: Record<PaymentProvider, RegExp> = {
  stableorder: /stableorder\.com/i,
  stripe: /stripe\.com/i,
  paypal: /paypal\.com/i
};
const DEFAULT_PUBLIC_ORIGIN = "https://ss-threads.dahanda.dev";
const LEGACY_PUBLIC_HOSTS = new Set(["threads-obsidian.dahanda.dev"]);
const LEGACY_PUBLIC_PAGE_PATHS = new Set(["/", "/landing", "/landing/", "/install", "/install/", "/scrapbook", "/scrapbook/", "/checkout", "/checkout/"]);
const SCRAPBOOK_HANDLE_PATH_RE = /^\/scrapbook\/@[^/.?#/]+\/?$/;
const SCRAPBOOK_ARCHIVE_PATH_RE = /^\/scrapbook(?:\/@[^/.?#/]+)?\/archive\/[^/]+\/?$/;

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

function parseBooleanFlag(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function parsePort(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new RequestError(500, `Invalid port in THREADS_WEB_PORT: ${raw}`);
  }

  return parsed;
}

function parsePortFromArg(port: number | undefined, envPort: string | undefined): number {
  if (typeof port === "undefined") {
    return parsePort(envPort, DEFAULT_PORT);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RequestError(400, `Invalid server port argument: ${port}`);
  }

  return port;
}

function parseBindHost(raw: string | undefined): string {
  const normalized = raw?.trim();
  return normalized && normalized.length > 0 ? normalized : "0.0.0.0";
}

function parseMaxBodyBytes(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_MAX_BODY_BYTES;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1024 || parsed > MAX_ALLOWED_BODY_BYTES) {
    throw new RequestError(
      500,
      `Invalid THREADS_WEB_MAX_BODY_BYTES value: ${raw} (expected ${1024}-${MAX_ALLOWED_BODY_BYTES})`
    );
  }

  return parsed;
}

function isProductionRuntime(): boolean {
  return trimEnv("NODE_ENV") === "production";
}

function assertSupportedProductionDatabaseConfig(
  database: RuntimeDatabaseConfig,
  statusCode = 500
): void {
  if (!isProductionRuntime()) {
    return;
  }

  if (database.backend !== "postgres") {
    throw new RequestError(
      statusCode,
      "Production requires THREADS_WEB_STORE_BACKEND=postgres and a Supabase/Postgres database."
    );
  }

  if (!database.postgresUrl.trim()) {
    throw new RequestError(
      statusCode,
      "Production requires THREADS_WEB_POSTGRES_URL or THREADS_WEB_DATABASE_URL."
    );
  }
}

function resolveConfig(portOverride?: number): ServerConfig {
  const adminToken = trimEnv("THREADS_WEB_ADMIN_TOKEN");
  if (!adminToken) {
    throw new RequestError(500, "THREADS_WEB_ADMIN_TOKEN is required for web server startup.");
  }

  return {
    adminToken,
    host: parseBindHost(trimEnv("THREADS_WEB_HOST")),
    maxBodyBytes: parseMaxBodyBytes(trimEnv("THREADS_WEB_MAX_BODY_BYTES")),
    port: parsePortFromArg(portOverride, trimEnv("THREADS_WEB_PORT"))
  };
}

function getRateLimitBucketLimit(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_RATE_LIMIT_BUCKET_LIMIT"), DEFAULT_RATE_LIMIT_BUCKET_LIMIT);
}

function getStripeWebhookToleranceMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_STRIPE_WEBHOOK_TOLERANCE_MS"), DEFAULT_STRIPE_WEBHOOK_TOLERANCE_MS);
}

function getServerRequestTimeoutMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_REQUEST_TIMEOUT_MS"), DEFAULT_SERVER_REQUEST_TIMEOUT_MS);
}

function getServerHeadersTimeoutMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_HEADERS_TIMEOUT_MS"), DEFAULT_SERVER_HEADERS_TIMEOUT_MS);
}

function getServerKeepAliveTimeoutMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_KEEP_ALIVE_TIMEOUT_MS"), DEFAULT_SERVER_KEEP_ALIVE_TIMEOUT_MS);
}

function getGracefulShutdownTimeoutMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_GRACEFUL_SHUTDOWN_TIMEOUT_MS"), DEFAULT_GRACEFUL_SHUTDOWN_TIMEOUT_MS);
}

function isCollectorAutostartEnabled(): boolean {
  return !parseBooleanFlag(trimEnv("THREADS_WEB_DISABLE_COLLECTOR"));
}

function isMonitoringAutostartEnabled(): boolean {
  return !parseBooleanFlag(trimEnv("THREADS_WEB_DISABLE_MONITORING_AUTORUN"));
}

function isPrimaryBackgroundWorkerInstance(): boolean {
  const instance = trimEnv("NODE_APP_INSTANCE");
  return !instance || instance === "0";
}

function shouldAutostartCollector(): boolean {
  return isCollectorAutostartEnabled() && isPrimaryBackgroundWorkerInstance();
}

function shouldAutostartMonitoring(): boolean {
  return isMonitoringAutostartEnabled() && isPrimaryBackgroundWorkerInstance();
}

function getPublicStorefrontCacheTtlMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_PUBLIC_STOREFRONT_CACHE_TTL_MS"), DEFAULT_PUBLIC_STOREFRONT_CACHE_TTL_MS);
}

function getPublicStorefrontStaleWhileRevalidateMs(): number {
  return parsePositiveInteger(
    trimEnv("THREADS_WEB_PUBLIC_STOREFRONT_STALE_WHILE_REVALIDATE_MS"),
    DEFAULT_PUBLIC_STOREFRONT_STALE_WHILE_REVALIDATE_MS
  );
}

function getPublicStorefrontStaleIfErrorMs(): number {
  return parsePositiveInteger(
    trimEnv("THREADS_WEB_PUBLIC_STOREFRONT_STALE_IF_ERROR_MS"),
    DEFAULT_PUBLIC_STOREFRONT_STALE_IF_ERROR_MS
  );
}

function getPublicStorefrontSnapshotFilePath(): string {
  return trimEnv("THREADS_WEB_PUBLIC_STOREFRONT_SNAPSHOT_FILE") || DEFAULT_PUBLIC_STOREFRONT_SNAPSHOT_FILE;
}

function buildEtag(value: unknown): string {
  return `"${createHash("sha1").update(JSON.stringify(value)).digest("hex")}"`;
}

function formatPublicCacheControlHeader(): string {
  const maxAgeSeconds = Math.max(0, Math.floor(getPublicStorefrontCacheTtlMs() / 1_000));
  const staleWhileRevalidateSeconds = Math.max(0, Math.floor(getPublicStorefrontStaleWhileRevalidateMs() / 1_000));
  const staleIfErrorSeconds = Math.max(0, Math.floor(getPublicStorefrontStaleIfErrorMs() / 1_000));
  return `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}, stale-if-error=${staleIfErrorSeconds}`;
}

function readIfNoneMatchHeader(request: IncomingMessage): string | null {
  const value = request.headers["if-none-match"];
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function buildPublicApiCacheHeaders(etag: string): Record<string, string> {
  return {
    "cache-control": formatPublicCacheControlHeader(),
    etag
  };
}

function buildPublicHtmlCacheHeaders(etag: string): Record<string, string> {
  return {
    "cache-control": formatPublicCacheControlHeader(),
    etag,
    vary: "accept-language, host"
  };
}

async function loadCachedTextTemplate(absolutePath: string): Promise<string> {
  const cached = staticTextTemplateCache.get(absolutePath);
  if (typeof cached === "string") {
    return cached;
  }

  const contents = await readFile(absolutePath, "utf8");
  staticTextTemplateCache.set(absolutePath, contents);
  return contents;
}

function json(response: ServerResponse, statusCode: number, payload: unknown, headers: Record<string, string> = {}): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function html(response: ServerResponse, statusCode: number, markup: string, headers: Record<string, string> = {}): void {
  response.writeHead(statusCode, {
    "content-type": "text/html; charset=utf-8",
    "permissions-policy": PUBLIC_PAGE_PERMISSIONS_POLICY,
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    ...headers
  });
  response.end(markup);
}

function notFound(response: ServerResponse): void {
  json(response, 404, { error: "Not found" });
}

function unauthorized(response: ServerResponse): void {
  json(response, 401, { error: "Unauthorized" });
}

function badRequest(response: ServerResponse, message: string): void {
  json(response, 400, { error: message });
}

function methodNotAllowed(response: ServerResponse): void {
  json(response, 405, { error: "Method not allowed" });
}

function isAdminBearerAuthorized(request: IncomingMessage, adminToken: string): boolean {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return false;
  }

  const candidate = safeText(auth.slice("Bearer ".length));
  return Boolean(candidate) && fixedLengthSecretsMatch(candidate, adminToken);
}

function isAdminAuthorized(request: IncomingMessage, adminToken: string): boolean {
  return isAdminBearerAuthorized(request, adminToken) || Boolean(readAdminSession(request, adminToken));
}

async function parseJsonBody<T>(request: IncomingMessage, maxBytes: number): Promise<T> {
  return (await readJsonBody<T>(request, maxBytes)).value;
}

async function parseFormBody(
  request: IncomingMessage,
  maxBytes: number
): Promise<URLSearchParams> {
  return new URLSearchParams((await readRequestBody(request, maxBytes)).toString("utf8"));
}

function assertJsonContentType(headers: IncomingMessage["headers"]): void {
  const contentType = readHeader(headers, "content-type");
  const mediaType = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mediaType !== "application/json" && !mediaType.endsWith("+json")) {
    throw new RequestError(415, "Content-Type must be application/json.");
  }
}

async function readRequestBody(request: IncomingMessage, maxBytes: number): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const binary = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    totalBytes += binary.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestError(413, `Request body exceeds ${maxBytes} bytes.`);
    }
    chunks.push(binary);
  }

  return Buffer.concat(chunks);
}

function parseJsonText<T>(rawText: string): T {
  if (!rawText.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new RequestError(400, "Invalid JSON payload.");
  }
}

async function readJsonBody<T>(
  request: IncomingMessage,
  maxBytes: number
): Promise<{ rawBytes: Buffer; rawText: string; value: T }> {
  assertJsonContentType(request.headers);
  const rawBytes = await readRequestBody(request, maxBytes);
  const rawText = rawBytes.toString("utf8");
  return {
    rawBytes,
    rawText,
    value: parseJsonText<T>(rawText)
  };
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeText(value: string | undefined | null): string {
  return (value ?? "").trim();
}

function readHeader(headers: IncomingMessage["headers"], name: string): string | null {
  const value = headers[name.toLowerCase()];
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value[0]?.trim() ?? null;
}

function readRequestSourceOrigin(request: IncomingMessage): string | null {
  const origin = readHeader(request.headers, "origin");
  if (origin) {
    return origin;
  }

  const referer = readHeader(request.headers, "referer");
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function isBrowserExtensionOrigin(origin: string): boolean {
  const normalized = origin.toLowerCase();
  return normalized.startsWith("chrome-extension://") || normalized.startsWith("moz-extension://");
}

function readForwardedValue(headers: IncomingMessage["headers"], name: string): string | null {
  const value = readHeader(headers, name);
  if (!value) {
    return null;
  }

  return value.split(",")[0]?.trim() ?? null;
}

function readCookie(headers: IncomingMessage["headers"], name: string): string | null {
  const rawCookie = readHeader(headers, "cookie");
  if (!rawCookie) {
    return null;
  }

  for (const chunk of rawCookie.split(";")) {
    const [rawName, ...rawValue] = chunk.trim().split("=");
    if (rawName !== name) {
      continue;
    }

    try {
      return decodeURIComponent(rawValue.join("="));
    } catch {
      return rawValue.join("=");
    }
  }

  return null;
}

function appendSetCookie(response: ServerResponse, cookie: string): void {
  const existing = response.getHeader("set-cookie");
  if (!existing) {
    response.setHeader("set-cookie", cookie);
    return;
  }

  const next = Array.isArray(existing) ? [...existing, cookie] : [String(existing), cookie];
  response.setHeader("set-cookie", next);
}

function getSessionCookieSameSite(secure: boolean): "Lax" | "None" {
  void secure;
  return "Lax";
}

function buildCookie(options: {
  httpOnly?: boolean;
  maxAge: number;
  name: string;
  path?: string;
  sameSite: "Lax" | "None" | "Strict";
  secure: boolean;
  value: string;
}): string {
  return [
    `${options.name}=${encodeURIComponent(options.value)}`,
    `Path=${options.path ?? "/"}`,
    options.httpOnly === false ? "" : "HttpOnly",
    `SameSite=${options.sameSite}`,
    `Max-Age=${options.maxAge}`,
    options.secure ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function buildSessionCookie(value: string, secure: boolean): string {
  return buildCookie({
    name: BOT_SESSION_COOKIE,
    value,
    secure,
    sameSite: getSessionCookieSameSite(secure),
    maxAge: BOT_SESSION_COOKIE_MAX_AGE_SECONDS
  });
}

function buildClearedSessionCookie(secure: boolean): string {
  return buildCookie({
    name: BOT_SESSION_COOKIE,
    value: "",
    secure,
    sameSite: getSessionCookieSameSite(secure),
    maxAge: 0
  });
}

function refreshActiveBotSessionCookie(
  response: ServerResponse,
  rawSession: string | null | undefined,
  secure: boolean,
  authenticated: boolean
): void {
  if (!authenticated || !rawSession) {
    return;
  }
  appendSetCookie(response, buildSessionCookie(rawSession, secure));
}

function buildAdminSessionCookie(value: string, secure: boolean): string {
  return buildCookie({
    name: ADMIN_SESSION_COOKIE,
    value,
    secure,
    sameSite: "Strict",
    path: "/api/admin",
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS
  });
}

function buildClearedAdminSessionCookie(secure: boolean): string {
  return buildCookie({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    secure,
    sameSite: "Strict",
    path: "/api/admin",
    maxAge: 0
  });
}

function createFixedLengthHash(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function fixedLengthSecretsMatch(left: string, right: string): boolean {
  return timingSafeEqual(createFixedLengthHash(left), createFixedLengthHash(right));
}

function createAdminSessionSignature(adminToken: string, payload: string): string {
  return createHmac("sha256", adminToken).update(payload).digest("base64url");
}

function createAdminSessionToken(adminToken: string, now = Date.now()): string {
  const expiresAt = now + ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS * 1000;
  const sessionId = crypto.randomUUID();
  const payload = `${ADMIN_SESSION_VERSION}.${expiresAt}.${sessionId}`;
  const signature = createAdminSessionSignature(adminToken, payload);
  return `${payload}.${signature}`;
}

function readAdminSession(request: IncomingMessage, adminToken: string): { expiresAt: number; sessionId: string } | null {
  const raw = readCookie(request.headers, ADMIN_SESSION_COOKIE);
  if (!raw) {
    return null;
  }

  const [version, rawExpiresAt, sessionId, signature] = raw.split(".");
  if (!version || !rawExpiresAt || !sessionId || !signature || version !== ADMIN_SESSION_VERSION) {
    return null;
  }

  const expiresAt = Number.parseInt(rawExpiresAt, 10);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  const payload = `${version}.${rawExpiresAt}.${sessionId}`;
  const expectedSignature = createAdminSessionSignature(adminToken, payload);
  if (!fixedLengthSecretsMatch(signature, expectedSignature)) {
    return null;
  }

  return {
    expiresAt,
    sessionId
  };
}

function describeProActivationFailure(
  reason: "invalid" | "expired" | "revoked" | "seat_limit" | "activation_required"
): string {
  if (reason === "activation_required") {
    return "Plus activation is required.";
  }
  if (reason === "seat_limit") {
    return "This Plus key has reached the device limit.";
  }
  if (reason === "revoked") {
    return "This Plus key has been revoked.";
  }
  if (reason === "expired") {
    return "This Plus key has expired.";
  }
  return "This Plus key is not valid.";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveRequestLocale(
  request: IncomingMessage,
  requestUrl: URL,
  fallback: SupportedLocale = "en"
): SupportedLocale {
  const queryLocale = requestUrl.searchParams.get("locale") || requestUrl.searchParams.get("lang");
  if (queryLocale) {
    return normalizeLocale(queryLocale, fallback);
  }

  const acceptLanguageHeader = Array.isArray(request.headers["accept-language"])
    ? request.headers["accept-language"][0]
    : request.headers["accept-language"];
  return normalizeLocale(acceptLanguageHeader, fallback);
}

const COUNTRY_TO_LOCALE: Partial<Record<string, SupportedLocale>> = {
  KR: "ko",
  JP: "ja",
  BR: "pt-BR",
  PT: "pt-BR",
  ES: "es",
  MX: "es",
  AR: "es",
  CL: "es",
  CO: "es",
  PE: "es",
  TW: "zh-TW",
  HK: "zh-TW",
  MO: "zh-TW",
  VN: "vi"
};

function readSingleHeader(request: IncomingMessage, name: string): string | null {
  const raw = request.headers[name];
  if (Array.isArray(raw)) {
    return raw[0]?.trim() || null;
  }
  return typeof raw === "string" ? raw.trim() || null : null;
}

function readCookieValue(request: IncomingMessage, name: string): string | null {
  const rawCookie = readSingleHeader(request, "cookie");
  if (!rawCookie) {
    return null;
  }

  for (const pair of rawCookie.split(";")) {
    const [rawKey, ...rawValue] = pair.split("=");
    if (rawKey?.trim() !== name) {
      continue;
    }

    try {
      return decodeURIComponent(rawValue.join("=")).trim() || null;
    } catch {
      return null;
    }
  }

  return null;
}

function resolveGeoCountryLocale(request: IncomingMessage): SupportedLocale | null {
  const candidates = [
    readSingleHeader(request, "cf-ipcountry"),
    readSingleHeader(request, "x-vercel-ip-country"),
    readSingleHeader(request, "cloudfront-viewer-country"),
    readSingleHeader(request, "x-country-code"),
    readSingleHeader(request, "x-appengine-country")
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const locale = COUNTRY_TO_LOCALE[candidate.toUpperCase()];
    if (locale) {
      return locale;
    }
  }

  return null;
}

function resolveInitialLandingLocale(request: IncomingMessage, requestUrl: URL): SupportedLocale {
  const queryLocale = requestUrl.searchParams.get("locale") || requestUrl.searchParams.get("lang");
  if (queryLocale) {
    return normalizeLocale(queryLocale, "en");
  }

  const cookieLocale = parseSupportedLocale(readCookieValue(request, "threads-web-locale"));
  if (cookieLocale) {
    return cookieLocale;
  }

  const acceptLanguageHeader = Array.isArray(request.headers["accept-language"])
    ? request.headers["accept-language"][0]
    : request.headers["accept-language"];
  const detected = parseSupportedLocale(acceptLanguageHeader);
  if (detected) {
    return detected;
  }

  return resolveGeoCountryLocale(request) ?? "en";
}

type ServerPageCopy = {
  oauthTitle: string;
  oauthEyebrow: string;
  oauthHeading: string;
  oauthLead: string;
  oauthAuthorizeButton?: string;
  oauthStep1?: string;
  oauthStep2?: string;
  oauthStep3?: string;
  oauthCopyButton?: string;
  oauthCopiedButton?: string;
  oauthCopiedStatus?: string;
  oauthCopyFailedStatus?: string;
  oauthHint?: string;
  oauthWaitingStatus?: string;
  oauthAuthorizedStatus?: string;
  oauthExpiredStatus?: string;
  oauthTimeoutStatus?: string;
  oauthFallbackHint?: string;
  privacyTitle: string;
  privacyDescription: string;
  privacyHeading: string;
  termsTitle: string;
  termsDescription: string;
  termsHeading: string;
  legalLastUpdated: string;
  legalServiceUrl: string;
  privacyBody1: string;
  privacyBody2: string;
  privacyBody3: string;
  privacyBody4: string;
  termsBody1: string;
  termsBody2: string;
  termsBody3: string;
  termsBody4: string;
  deletionTitle: string;
  deletionDescription: string;
  deletionHeading: string;
  deletionBody1: string;
  deletionBody2: string;
  notionFailedHeading: string;
  notionCloseHint: string;
  notionMissingParams: string;
  notionConnectedHeading: string;
  notionConnectedBody: string;
  notionUnexpected: string;
  threadsSigninStartError: string;
  threadsSigninCodeError: string;
  threadsSigninUnexpected: string;
};

const serverPageCopy: Record<SupportedLocale, ServerPageCopy> = {
  ko: {
    oauthTitle: "Threads 로그인",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "브라우저에서 로그인 계속",
    oauthLead:
      "모바일에서는 로그인 링크를 복사해 새 브라우저 탭 주소창에 붙여넣는 방식이 가장 안정적입니다. {handle} scrapbook 연결을 위해 아래 순서대로 진행해 주세요.",
    oauthAuthorizeButton: "로그인 링크 직접 열기",
    oauthStep1: "로그인 링크 복사를 누릅니다.",
    oauthStep2: "브라우저에서 새 탭을 열고 주소창에 붙여넣습니다.",
    oauthStep3: "붙여넣은 URL을 열어 Threads 로그인을 완료합니다.",
    oauthCopyButton: "로그인 링크 복사",
    oauthCopiedButton: "복사 완료",
    oauthCopiedStatus: "로그인 링크를 복사했습니다. 새 브라우저 탭 주소창에 붙여넣어 진행해 주세요.",
    oauthCopyFailedStatus: "자동 복사에 실패했습니다. 아래 링크가 선택되었으니 길게 눌러 직접 복사해 주세요.",
    oauthHint: "자동 복사가 막히면 아래 링크를 길게 눌러 복사한 뒤, 새 브라우저 탭에서 열 수 있습니다.",
    oauthWaitingStatus: "브라우저에서 인증이 끝나면 연결을 확인합니다...",
    oauthAuthorizedStatus: "인증 완료! 잠시 후 이동합니다...",
    oauthExpiredStatus: "로그인 세션이 만료되었습니다. 페이지를 새로고침해 주세요.",
    oauthTimeoutStatus: "응답이 없습니다. 인증을 취소했거나 시간이 초과됐을 수 있습니다.",
    oauthFallbackHint: "Threads 앱으로 바로 여는 방식보다 브라우저에서 링크를 붙여넣는 편이 더 안정적입니다.",
    privacyTitle: "Threads Archive 개인정보 처리방침",
    privacyDescription: "Threads Archive OAuth 및 scrapbook 저장소에 대한 개인정보 안내입니다.",
    privacyHeading: "Threads Archive 개인정보 처리방침",
    termsTitle: "Threads Archive 이용약관",
    termsDescription: "Threads Archive scrapbook 서비스의 기본 이용약관입니다.",
    termsHeading: "Threads Archive 이용약관",
    legalLastUpdated: "최종 업데이트",
    legalServiceUrl: "서비스 URL",
    privacyBody1:
      "Threads Archive는 로그인한 Threads 사용자가 비공개 scrapbook에 저장한 멘션을 보관할 수 있도록 필요한 최소 정보만 저장합니다.",
    privacyBody2:
      "서비스는 연결된 scrapbook 계정을 유지하고 허용된 API 요청을 처리하기 위해 Threads 계정 식별자, 사용자명, 공개 프로필 메타데이터 일부, 암호화된 OAuth 토큰을 저장합니다.",
    privacyBody3:
      "저장된 scrapbook 항목에는 멘션된 게시물 URL, 원문 텍스트, 관련 메타데이터, 내보낼 수 있는 Markdown 콘텐츠가 포함됩니다. 이 데이터는 판매하지 않습니다.",
    privacyBody4:
      "scrapbook 페이지에서 언제든 계정 연결을 해제할 수 있습니다. 데이터 삭제 요청은 Meta를 통해 진행하거나 이 앱에 표시된 운영자에게 문의해 접수할 수 있습니다.",
    termsBody1: "Threads Archive는 사용자가 Threads 멘션을 수집하고 Markdown으로 내보낼 수 있도록 돕는 비공개 scrapbook 서비스입니다.",
    termsBody2:
      "저장하는 콘텐츠, Threads 플랫폼 규칙 준수, 사용할 권한이 없는 콘텐츠를 저장하지 않을 책임은 사용자에게 있습니다.",
    termsBody3:
      "서비스는 언제든 변경되거나 중단될 수 있습니다. 운영자는 안전 또는 법적 준수를 위해 악의적 접근을 차단하거나 저장된 데이터를 제거할 수 있습니다.",
    termsBody4: "서비스를 사용하면 공개 Threads 상호작용이 scrapbook 워크플로 제공을 위해 처리된다는 점에 동의한 것으로 봅니다.",
    deletionTitle: "데이터 삭제 요청 접수됨",
    deletionDescription: "Threads Archive 데이터 삭제 콜백 상태 페이지입니다.",
    deletionHeading: "데이터 삭제 요청이 접수되었습니다",
    deletionBody1: "요청이 확인 코드 {code}로 기록되었습니다.",
    deletionBody2: "연결된 계정에 scrapbook 데이터가 있다면 삭제 절차에 따라 함께 제거됩니다.",
    notionFailedHeading: "Notion 연결 실패",
    notionCloseHint: "이 탭을 닫고 확장 프로그램으로 돌아가세요.",
    notionMissingParams: "OAuth 콜백 파라미터가 누락되었습니다.",
    notionConnectedHeading: "Notion 연결 완료",
    notionConnectedBody: "이제 이 탭을 닫고 확장 프로그램으로 돌아가면 됩니다.",
    notionUnexpected: "예상하지 못한 Notion OAuth 오류입니다.",
    threadsSigninStartError: "Threads 로그인을 시작하지 못했습니다.",
    threadsSigninCodeError: "Threads 로그인에서 사용할 수 있는 인증 코드를 받지 못했습니다.",
    threadsSigninUnexpected: "예상하지 못한 Threads 로그인 오류입니다."
  },
  en: {
    oauthTitle: "Sign In with Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Continue sign-in in your browser",
    oauthLead:
      "On mobile, the most reliable flow is to copy the sign-in link, paste it into a new browser tab, and complete the Threads OAuth flow there for the {handle} scrapbook.",
    oauthAuthorizeButton: "Open sign-in link directly",
    oauthStep1: "Tap Copy sign-in link.",
    oauthStep2: "Open a new browser tab and paste the link into the address bar.",
    oauthStep3: "Open the pasted URL and complete the Threads sign-in flow.",
    oauthCopyButton: "Copy sign-in link",
    oauthCopiedButton: "Copied",
    oauthCopiedStatus: "The sign-in link is copied. Paste it into a new browser tab to continue.",
    oauthCopyFailedStatus: "Automatic copy failed. The link below is selected so you can copy it manually.",
    oauthHint: "If clipboard access is blocked, long-press the link below and copy it manually.",
    oauthWaitingStatus: "Waiting for browser sign-in to complete...",
    oauthAuthorizedStatus: "Authorized! Redirecting...",
    oauthExpiredStatus: "Sign-in session expired. Please refresh the page.",
    oauthTimeoutStatus: "No response. You may have cancelled, or the request timed out.",
    oauthFallbackHint: "This browser flow is more reliable on mobile than jumping straight into the Threads app.",
    privacyTitle: "Threads Archive Privacy Policy",
    privacyDescription: "Privacy details for Threads Archive OAuth and scrapbook storage.",
    privacyHeading: "Threads Archive Privacy Policy",
    termsTitle: "Threads Archive Terms",
    termsDescription: "Basic service terms for the Threads Archive scrapbook service.",
    termsHeading: "Threads Archive Terms",
    legalLastUpdated: "Last updated",
    legalServiceUrl: "Service URL",
    privacyBody1:
      "Threads Archive stores only the minimum information needed to let a signed-in Threads user keep a private scrapbook of saved mentions.",
    privacyBody2:
      "We store your Threads account identifier, username, optional public profile metadata, and encrypted OAuth tokens so the service can keep your scrapbook account linked and process permitted API requests.",
    privacyBody3:
      "Saved scrapbook entries include the mentioned post URL, source text, related metadata, and exportable Markdown content. We do not sell this data.",
    privacyBody4:
      "You can disconnect your account at any time from the scrapbook page. Data deletion requests can be initiated through Meta or by contacting the operator shown on this app.",
    termsBody1: "Threads Archive is a private scrapbook service that helps users capture Threads mentions and export them as Markdown.",
    termsBody2:
      "You are responsible for the content you save, for complying with the Threads platform rules, and for not storing content you do not have permission to use.",
    termsBody3:
      "The service may change or be suspended at any time. The operator may revoke abusive access or remove stored data when required for safety or legal compliance.",
    termsBody4: "By using the service, you agree that public Threads interactions are processed to provide the scrapbook workflow.",
    deletionTitle: "Data Deletion Request Received",
    deletionDescription: "Threads Archive data deletion callback status page.",
    deletionHeading: "Data deletion request received",
    deletionBody1: "Your request has been recorded under confirmation code {code}.",
    deletionBody2: "If any scrapbook data exists for the linked account, it will be removed as part of the deletion workflow.",
    notionFailedHeading: "Notion connection failed",
    notionCloseHint: "You can close this tab and return to the extension.",
    notionMissingParams: "Missing OAuth callback parameters.",
    notionConnectedHeading: "Notion is connected",
    notionConnectedBody: "You can close this tab and return to the extension.",
    notionUnexpected: "Unexpected Notion OAuth error.",
    threadsSigninStartError: "Could not start Threads sign-in.",
    threadsSigninCodeError: "Threads sign-in did not return a usable authorization code.",
    threadsSigninUnexpected: "Unexpected Threads sign-in error."
  },
  ja: {
    oauthTitle: "Threads ログインを続ける",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "ブラウザでログインを続ける",
    oauthLead:
      "モバイルでは直接開くより、ログインリンクをコピーする方が安定しています。以下の手順で {handle} scrapbook を接続してください。",
    oauthStep1: "「ログインリンクをコピー」を押します。",
    oauthStep2: "ブラウザで新しいタブを開き、アドレスバーに貼り付けます。",
    oauthStep3: "貼り付けた URL を開いて Threads のログインを完了します。",
    oauthCopyButton: "ログインリンクをコピー",
    oauthCopiedButton: "コピー完了",
    oauthCopiedStatus: "ログインリンクをコピーしました。新しいブラウザタブに貼り付けて開いてください。",
    oauthCopyFailedStatus: "自動コピーに失敗しました。下のリンクを選択した状態なので手動でコピーしてください。",
    oauthHint: "同じリンクが下のボックスにも表示されています。自動コピーがブロックされた場合は長押しして手動でコピーしてください。",
    privacyTitle: "Threads Archive プライバシーポリシー",
    privacyDescription: "Threads Archive の OAuth と scrapbook 保存に関するプライバシー情報です。",
    privacyHeading: "Threads Archive プライバシーポリシー",
    termsTitle: "Threads Archive 利用規約",
    termsDescription: "Threads Archive scrapbook サービスの基本利用規約です。",
    termsHeading: "Threads Archive 利用規約",
    legalLastUpdated: "最終更新日",
    legalServiceUrl: "サービス URL",
    privacyBody1:
      "Threads Archive は、ログインした Threads ユーザーが保存したメンションを非公開 scrapbook に保持するために必要な最小限の情報のみを保存します。",
    privacyBody2:
      "サービスは scrapbook アカウントの接続維持と許可された API リクエスト処理のため、Threads アカウント識別子、ユーザー名、公開プロフィールの一部メタデータ、暗号化された OAuth トークンを保存します。",
    privacyBody3:
      "保存された scrapbook 項目には、メンションされた投稿 URL、元テキスト、関連メタデータ、書き出し可能な Markdown コンテンツが含まれます。これらのデータを販売することはありません。",
    privacyBody4:
      "scrapbook ページからいつでもアカウント連携を解除できます。データ削除リクエストは Meta 経由、またはこのアプリに表示される運営者への連絡で開始できます。",
    termsBody1: "Threads Archive は、Threads のメンションを収集し Markdown として書き出せるようにする非公開 scrapbook サービスです。",
    termsBody2:
      "保存するコンテンツ、Threads プラットフォーム規則の遵守、利用許可のないコンテンツを保存しない責任はユーザーにあります。",
    termsBody3:
      "サービスはいつでも変更または停止される場合があります。運営者は安全上または法令遵守のため、不正アクセスを取り消したり保存データを削除したりできます。",
    termsBody4: "本サービスを利用することで、公開された Threads 上のやり取りが scrapbook ワークフロー提供のために処理されることに同意したものとみなされます。",
    deletionTitle: "データ削除リクエストを受け付けました",
    deletionDescription: "Threads Archive のデータ削除コールバック状況ページです。",
    deletionHeading: "データ削除リクエストを受け付けました",
    deletionBody1: "リクエストは確認コード {code} で記録されました。",
    deletionBody2: "連携済みアカウントに scrapbook データがある場合は、削除フローの一部として削除されます。",
    notionFailedHeading: "Notion 連携に失敗しました",
    notionCloseHint: "このタブを閉じて拡張機能に戻ってください。",
    notionMissingParams: "OAuth コールバックのパラメータが不足しています。",
    notionConnectedHeading: "Notion の接続が完了しました",
    notionConnectedBody: "このタブを閉じて拡張機能に戻れます。",
    notionUnexpected: "予期しない Notion OAuth エラーです。",
    threadsSigninStartError: "Threads ログインを開始できませんでした。",
    threadsSigninCodeError: "Threads ログインから利用可能な認証コードが返されませんでした。",
    threadsSigninUnexpected: "予期しない Threads ログインエラーです。"
  },
  "pt-BR": {
    oauthTitle: "Continuar login do Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Continue o login no navegador",
    oauthLead:
      "No celular, copiar o link de login costuma ser mais estável do que abri-lo diretamente. Siga os passos abaixo para conectar o scrapbook {handle}.",
    oauthStep1: "Toque em Copiar link de login.",
    oauthStep2: "Abra uma nova guia no navegador e cole o link na barra de endereço.",
    oauthStep3: "Abra a URL colada e conclua o login no Threads.",
    oauthCopyButton: "Copiar link de login",
    oauthCopiedButton: "Copiado",
    oauthCopiedStatus: "O link de login foi copiado. Cole-o em uma nova guia do navegador e abra-o.",
    oauthCopyFailedStatus: "A cópia automática falhou. O link abaixo está selecionado para você copiar manualmente.",
    oauthHint: "O mesmo link também aparece abaixo. Se a cópia automática for bloqueada, pressione e segure para copiar manualmente.",
    privacyTitle: "Política de Privacidade do Threads Archive",
    privacyDescription: "Detalhes de privacidade do OAuth e do armazenamento do scrapbook no Threads Archive.",
    privacyHeading: "Política de Privacidade do Threads Archive",
    termsTitle: "Termos do Threads Archive",
    termsDescription: "Termos básicos do serviço de scrapbook do Threads Archive.",
    termsHeading: "Termos do Threads Archive",
    legalLastUpdated: "Última atualização",
    legalServiceUrl: "URL do serviço",
    privacyBody1:
      "O Threads Archive armazena apenas o mínimo de informações necessário para que um usuário autenticado do Threads mantenha um scrapbook privado de menções salvas.",
    privacyBody2:
      "Armazenamos o identificador da sua conta Threads, nome de usuário, metadados públicos opcionais do perfil e tokens OAuth criptografados para manter sua conta de scrapbook conectada e processar solicitações de API permitidas.",
    privacyBody3:
      "As entradas salvas no scrapbook incluem a URL da publicação mencionada, texto de origem, metadados relacionados e conteúdo Markdown exportável. Não vendemos esses dados.",
    privacyBody4:
      "Você pode desconectar sua conta a qualquer momento na página do scrapbook. Solicitações de exclusão de dados podem ser iniciadas via Meta ou entrando em contato com o operador exibido neste app.",
    termsBody1: "O Threads Archive é um serviço privado de scrapbook que ajuda usuários a capturar menções no Threads e exportá-las como Markdown.",
    termsBody2:
      "Você é responsável pelo conteúdo que salva, por cumprir as regras da plataforma Threads e por não armazenar conteúdo sem permissão de uso.",
    termsBody3:
      "O serviço pode mudar ou ser suspenso a qualquer momento. O operador pode revogar acessos abusivos ou remover dados armazenados quando necessário por segurança ou conformidade legal.",
    termsBody4: "Ao usar o serviço, você concorda que interações públicas no Threads sejam processadas para fornecer o fluxo do scrapbook.",
    deletionTitle: "Solicitação de exclusão de dados recebida",
    deletionDescription: "Página de status do retorno de exclusão de dados do Threads Archive.",
    deletionHeading: "Solicitação de exclusão de dados recebida",
    deletionBody1: "Sua solicitação foi registrada com o código de confirmação {code}.",
    deletionBody2: "Se existirem dados de scrapbook para a conta vinculada, eles serão removidos como parte do fluxo de exclusão.",
    notionFailedHeading: "Falha na conexão com o Notion",
    notionCloseHint: "Você pode fechar esta guia e voltar para a extensão.",
    notionMissingParams: "Parâmetros do callback OAuth ausentes.",
    notionConnectedHeading: "Notion conectado",
    notionConnectedBody: "Você pode fechar esta guia e voltar para a extensão.",
    notionUnexpected: "Erro inesperado de OAuth do Notion.",
    threadsSigninStartError: "Não foi possível iniciar o login do Threads.",
    threadsSigninCodeError: "O login do Threads não retornou um código de autorização utilizável.",
    threadsSigninUnexpected: "Erro inesperado no login do Threads."
  },
  es: {
    oauthTitle: "Continuar inicio de sesión de Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Continúa el inicio de sesión en tu navegador",
    oauthLead:
      "En móvil suele ser más fiable copiar el enlace de inicio de sesión que abrirlo directamente. Sigue estos pasos para conectar el scrapbook de {handle}.",
    oauthStep1: "Pulsa Copiar enlace de inicio de sesión.",
    oauthStep2: "Abre una pestaña nueva del navegador y pega el enlace en la barra de direcciones.",
    oauthStep3: "Abre la URL pegada y completa el inicio de sesión en Threads.",
    oauthCopyButton: "Copiar enlace de inicio de sesión",
    oauthCopiedButton: "Copiado",
    oauthCopiedStatus: "Se copió el enlace de inicio de sesión. Pégalo en una nueva pestaña del navegador y ábrelo.",
    oauthCopyFailedStatus: "La copia automática falló. El enlace de abajo está seleccionado para que puedas copiarlo manualmente.",
    oauthHint: "El mismo enlace también aparece abajo. Si la copia automática se bloquea, mantén pulsado para copiarlo manualmente.",
    privacyTitle: "Política de privacidad de Threads Archive",
    privacyDescription: "Detalles de privacidad sobre OAuth y el almacenamiento del scrapbook en Threads Archive.",
    privacyHeading: "Política de privacidad de Threads Archive",
    termsTitle: "Términos de Threads Archive",
    termsDescription: "Términos básicos del servicio de scrapbook de Threads Archive.",
    termsHeading: "Términos de Threads Archive",
    legalLastUpdated: "Última actualización",
    legalServiceUrl: "URL del servicio",
    privacyBody1:
      "Threads Archive almacena solo la información mínima necesaria para que un usuario autenticado de Threads mantenga un scrapbook privado con menciones guardadas.",
    privacyBody2:
      "Guardamos el identificador de tu cuenta de Threads, nombre de usuario, metadatos públicos opcionales del perfil y tokens OAuth cifrados para mantener vinculada tu cuenta de scrapbook y procesar solicitudes de API permitidas.",
    privacyBody3:
      "Las entradas guardadas del scrapbook incluyen la URL de la publicación mencionada, el texto de origen, metadatos relacionados y contenido Markdown exportable. No vendemos estos datos.",
    privacyBody4:
      "Puedes desconectar tu cuenta en cualquier momento desde la página del scrapbook. Las solicitudes de eliminación de datos pueden iniciarse a través de Meta o contactando al operador indicado en esta app.",
    termsBody1: "Threads Archive es un servicio privado de scrapbook que ayuda a los usuarios a capturar menciones de Threads y exportarlas como Markdown.",
    termsBody2:
      "Eres responsable del contenido que guardas, de cumplir las reglas de la plataforma Threads y de no almacenar contenido para el que no tengas permiso de uso.",
    termsBody3:
      "El servicio puede cambiar o suspenderse en cualquier momento. El operador puede revocar accesos abusivos o eliminar datos guardados cuando sea necesario por seguridad o cumplimiento legal.",
    termsBody4: "Al usar el servicio, aceptas que las interacciones públicas en Threads se procesen para proporcionar el flujo de trabajo del scrapbook.",
    deletionTitle: "Solicitud de eliminación de datos recibida",
    deletionDescription: "Página de estado del callback de eliminación de datos de Threads Archive.",
    deletionHeading: "Solicitud de eliminación de datos recibida",
    deletionBody1: "Tu solicitud se registró con el código de confirmación {code}.",
    deletionBody2: "Si existe algún dato de scrapbook para la cuenta vinculada, se eliminará como parte del flujo de eliminación.",
    notionFailedHeading: "Falló la conexión con Notion",
    notionCloseHint: "Puedes cerrar esta pestaña y volver a la extensión.",
    notionMissingParams: "Faltan parámetros del callback de OAuth.",
    notionConnectedHeading: "Notion está conectado",
    notionConnectedBody: "Puedes cerrar esta pestaña y volver a la extensión.",
    notionUnexpected: "Error inesperado de OAuth de Notion.",
    threadsSigninStartError: "No se pudo iniciar el inicio de sesión de Threads.",
    threadsSigninCodeError: "El inicio de sesión de Threads no devolvió un código de autorización utilizable.",
    threadsSigninUnexpected: "Error inesperado en el inicio de sesión de Threads."
  },
  "zh-TW": {
    oauthTitle: "繼續 Threads 登入",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "在瀏覽器中繼續登入",
    oauthLead: "在行動裝置上，複製登入連結通常比直接開啟更穩定。請依照下列步驟連接 {handle} scrapbook。",
    oauthStep1: "點選「複製登入連結」。",
    oauthStep2: "在瀏覽器開啟新分頁，將連結貼到網址列。",
    oauthStep3: "開啟貼上的網址並完成 Threads 登入。",
    oauthCopyButton: "複製登入連結",
    oauthCopiedButton: "已複製",
    oauthCopiedStatus: "登入連結已複製。請貼到新的瀏覽器分頁並開啟。",
    oauthCopyFailedStatus: "自動複製失敗。下方連結已被選取，請手動複製。",
    oauthHint: "相同連結也顯示在下方。若自動複製被阻擋，請長按後手動複製。",
    privacyTitle: "Threads Archive 隱私權政策",
    privacyDescription: "Threads Archive OAuth 與 scrapbook 儲存的隱私權說明。",
    privacyHeading: "Threads Archive 隱私權政策",
    termsTitle: "Threads Archive 服務條款",
    termsDescription: "Threads Archive scrapbook 服務的基本條款。",
    termsHeading: "Threads Archive 服務條款",
    legalLastUpdated: "最後更新",
    legalServiceUrl: "服務網址",
    privacyBody1:
      "Threads Archive 只會儲存讓已登入 Threads 使用者維持私人 scrapbook 所需的最少資訊。",
    privacyBody2:
      "我們會儲存你的 Threads 帳號識別資訊、使用者名稱、可選的公開個人檔案中繼資料，以及加密後的 OAuth 權杖，以維持 scrapbook 帳號連線並處理已授權的 API 請求。",
    privacyBody3:
      "已儲存的 scrapbook 項目包含被提及貼文的 URL、原始文字、相關中繼資料與可匯出的 Markdown 內容。我們不會販售這些資料。",
    privacyBody4:
      "你可以隨時在 scrapbook 頁面解除帳號連線。資料刪除請求可透過 Meta 發起，或聯絡此應用程式上顯示的營運者。",
    termsBody1: "Threads Archive 是一項私人 scrapbook 服務，協助使用者收集 Threads 提及內容並匯出為 Markdown。",
    termsBody2:
      "你需對自己儲存的內容、遵守 Threads 平台規則，以及不儲存未獲授權使用的內容負責。",
    termsBody3:
      "服務可能隨時變更或暫停。營運者可因安全或法律遵循需求撤銷濫用存取權或移除已儲存資料。",
    termsBody4: "使用本服務即表示你同意系統會處理公開的 Threads 互動，以提供 scrapbook 工作流程。",
    deletionTitle: "已收到資料刪除請求",
    deletionDescription: "Threads Archive 資料刪除回呼狀態頁面。",
    deletionHeading: "已收到資料刪除請求",
    deletionBody1: "你的請求已以確認碼 {code} 記錄。",
    deletionBody2: "若連結帳號存在 scrapbook 資料，系統將在刪除流程中一併移除。",
    notionFailedHeading: "Notion 連線失敗",
    notionCloseHint: "你可以關閉此分頁並返回擴充功能。",
    notionMissingParams: "缺少 OAuth 回呼參數。",
    notionConnectedHeading: "Notion 已連線",
    notionConnectedBody: "你可以關閉此分頁並返回擴充功能。",
    notionUnexpected: "發生未預期的 Notion OAuth 錯誤。",
    threadsSigninStartError: "無法開始 Threads 登入。",
    threadsSigninCodeError: "Threads 登入未回傳可用的授權碼。",
    threadsSigninUnexpected: "發生未預期的 Threads 登入錯誤。"
  },
  vi: {
    oauthTitle: "Tiếp tục đăng nhập Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Tiếp tục đăng nhập trong trình duyệt",
    oauthLead:
      "Trên thiết bị di động, việc sao chép liên kết đăng nhập thường ổn định hơn mở trực tiếp. Hãy làm theo các bước dưới đây để kết nối scrapbook {handle}.",
    oauthStep1: "Nhấn Sao chép liên kết đăng nhập.",
    oauthStep2: "Mở một tab trình duyệt mới và dán liên kết vào thanh địa chỉ.",
    oauthStep3: "Mở URL đã dán và hoàn tất đăng nhập Threads.",
    oauthCopyButton: "Sao chép liên kết đăng nhập",
    oauthCopiedButton: "Đã sao chép",
    oauthCopiedStatus: "Đã sao chép liên kết đăng nhập. Hãy dán nó vào một tab trình duyệt mới rồi mở.",
    oauthCopyFailedStatus: "Sao chép tự động thất bại. Liên kết bên dưới đã được chọn để bạn sao chép thủ công.",
    oauthHint: "Liên kết tương tự cũng hiển thị bên dưới. Nếu sao chép tự động bị chặn, hãy nhấn giữ để sao chép thủ công.",
    privacyTitle: "Chính sách quyền riêng tư của Threads Archive",
    privacyDescription: "Thông tin quyền riêng tư cho OAuth và lưu trữ scrapbook của Threads Archive.",
    privacyHeading: "Chính sách quyền riêng tư của Threads Archive",
    termsTitle: "Điều khoản Threads Archive",
    termsDescription: "Các điều khoản cơ bản cho dịch vụ scrapbook của Threads Archive.",
    termsHeading: "Điều khoản Threads Archive",
    legalLastUpdated: "Cập nhật lần cuối",
    legalServiceUrl: "URL dịch vụ",
    privacyBody1:
      "Threads Archive chỉ lưu trữ lượng thông tin tối thiểu cần thiết để người dùng Threads đã đăng nhập có thể duy trì scrapbook riêng tư của các lượt nhắc đã lưu.",
    privacyBody2:
      "Chúng tôi lưu mã định danh tài khoản Threads, tên người dùng, siêu dữ liệu hồ sơ công khai tùy chọn và token OAuth đã mã hóa để giữ liên kết với tài khoản scrapbook của bạn và xử lý các yêu cầu API được cho phép.",
    privacyBody3:
      "Các mục scrapbook đã lưu bao gồm URL bài viết được nhắc đến, văn bản nguồn, siêu dữ liệu liên quan và nội dung Markdown có thể xuất ra. Chúng tôi không bán dữ liệu này.",
    privacyBody4:
      "Bạn có thể ngắt kết nối tài khoản bất cứ lúc nào từ trang scrapbook. Yêu cầu xóa dữ liệu có thể được khởi tạo qua Meta hoặc bằng cách liên hệ với đơn vị vận hành hiển thị trong ứng dụng này.",
    termsBody1: "Threads Archive là dịch vụ scrapbook riêng tư giúp người dùng thu thập các lượt nhắc trên Threads và xuất chúng sang Markdown.",
    termsBody2:
      "Bạn chịu trách nhiệm về nội dung mình lưu, việc tuân thủ quy tắc của nền tảng Threads và không lưu nội dung mà bạn không có quyền sử dụng.",
    termsBody3:
      "Dịch vụ có thể thay đổi hoặc bị tạm ngưng bất cứ lúc nào. Đơn vị vận hành có thể thu hồi quyền truy cập lạm dụng hoặc xóa dữ liệu đã lưu khi cần thiết vì lý do an toàn hoặc tuân thủ pháp lý.",
    termsBody4: "Khi sử dụng dịch vụ, bạn đồng ý rằng các tương tác công khai trên Threads sẽ được xử lý để cung cấp quy trình scrapbook.",
    deletionTitle: "Đã nhận yêu cầu xóa dữ liệu",
    deletionDescription: "Trang trạng thái callback xóa dữ liệu của Threads Archive.",
    deletionHeading: "Đã nhận yêu cầu xóa dữ liệu",
    deletionBody1: "Yêu cầu của bạn đã được ghi nhận với mã xác nhận {code}.",
    deletionBody2: "Nếu có dữ liệu scrapbook cho tài khoản đã liên kết, dữ liệu đó sẽ bị xóa trong quy trình xóa.",
    notionFailedHeading: "Kết nối Notion thất bại",
    notionCloseHint: "Bạn có thể đóng tab này và quay lại tiện ích mở rộng.",
    notionMissingParams: "Thiếu tham số callback OAuth.",
    notionConnectedHeading: "Notion đã được kết nối",
    notionConnectedBody: "Bạn có thể đóng tab này và quay lại tiện ích mở rộng.",
    notionUnexpected: "Lỗi OAuth Notion không mong muốn.",
    threadsSigninStartError: "Không thể bắt đầu đăng nhập Threads.",
    threadsSigninCodeError: "Đăng nhập Threads không trả về mã ủy quyền hợp lệ.",
    threadsSigninUnexpected: "Đã xảy ra lỗi đăng nhập Threads không mong muốn."
  }
};

function tServer(locale: SupportedLocale): ServerPageCopy {
  return serverPageCopy[locale];
}

function interpolateServerText(template: string, values: Record<string, string>): string {
  let output = template;
  for (const [key, value] of Object.entries(values)) {
    output = output.replaceAll(`{${key}}`, value);
  }
  return output;
}

function renderLegalPage(title: string, description: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <style>
      :root {
        color-scheme: light;
        font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      }
      body {
        margin: 0;
        background: #ffffff;
        color: #0f172a;
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 48px 20px 72px;
        line-height: 1.7;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 2rem;
        line-height: 1.1;
        letter-spacing: -0.04em;
      }
      p {
        margin: 0 0 14px;
        color: #475569;
      }
      .muted {
        color: #64748b;
        font-size: 0.95rem;
      }
      .card {
        margin-top: 24px;
        padding: 20px;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #f8fafc;
      }
      a {
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>`;
}

function renderOauthBridgePage(
  authorizeUrl: string,
  botHandle: string,
  pollToken: string,
  publicOrigin: string,
  locale: SupportedLocale
): string {
  const msg = tServer(locale);
  const safeAuthorizeUrlJson = JSON.stringify(authorizeUrl).replace(/</g, "\\u003c");
  const safePollUrlJson = JSON.stringify(`${publicOrigin}/api/public/bot/oauth/poll`).replace(/</g, "\\u003c");
  const safeActivateUrlJson = JSON.stringify(`${publicOrigin}/api/public/bot/oauth/activate`).replace(/</g, "\\u003c");
  const safePollTokenJson = JSON.stringify(pollToken).replace(/</g, "\\u003c");
  const steps = [msg.oauthStep1, msg.oauthStep2, msg.oauthStep3].filter((value): value is string => Boolean(value));
  const stepsMarkup = steps.length > 0
    ? `<ol class="steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
    : "";
  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(msg.oauthTitle)}</title>
    <meta name="robots" content="noindex,nofollow" />
    <style>
      :root {
        color-scheme: light;
        font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
        --bg: #f8fafc;
        --surface: #ffffff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #e2e8f0;
        --accent: #111827;
        --success: #16a34a;
      }
      * { box-sizing: border-box; }
      html {
        min-height: 100%;
        background: radial-gradient(circle at top, #ffffff 0%, var(--bg) 70%);
      }
      body {
        margin: 0;
        min-height: 100%;
        color: var(--ink);
        padding: calc(24px + env(safe-area-inset-top)) 24px calc(32px + env(safe-area-inset-bottom));
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .card {
        width: min(100%, 420px);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
      }
      @supports (min-height: 100dvh) {
        body { min-height: 100dvh; }
      }
      .eyebrow {
        margin: 0 0 12px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      h1 {
        margin: 0;
        font-size: 1.8rem;
        line-height: 1.1;
        letter-spacing: -0.04em;
      }
      p {
        margin: 14px 0 0;
        color: var(--muted);
        line-height: 1.6;
      }
      .actions {
        display: grid;
        gap: 10px;
        margin-top: 24px;
      }
      .steps {
        margin: 18px 0 0;
        padding-left: 18px;
        color: var(--muted);
        line-height: 1.6;
      }
      .steps li + li {
        margin-top: 8px;
      }
      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 52px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        background: var(--accent);
        color: #fff;
        border: none;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.15s;
      }
      .cta:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .secondary-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.95rem;
        border: 1px solid var(--line);
        color: var(--ink);
        background: #fff;
      }
      .link-box {
        margin-top: 16px;
      }
      .link-box label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .link-box textarea {
        width: 100%;
        min-height: 104px;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px;
        font: inherit;
        color: var(--ink);
        background: #f8fafc;
        resize: none;
      }
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        margin-right: 8px;
        flex-shrink: 0;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .status {
        min-height: 20px;
        margin-top: 16px;
        font-size: 13px;
        color: var(--muted);
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .status.success { color: var(--success); font-weight: 600; }
      .status.error { color: #dc2626; }
      .hint {
        margin-top: 18px;
        font-size: 12px;
        color: var(--muted);
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <p class="eyebrow">${escapeHtml(msg.oauthEyebrow)}</p>
      <h1>${escapeHtml(msg.oauthHeading)}</h1>
      <p>${escapeHtml(interpolateServerText(msg.oauthLead, { handle: `@${escapeHtml(botHandle)}` }))}</p>
      ${stepsMarkup}
      <div class="actions">
        <button id="copy-button" class="cta" type="button">
          ${escapeHtml(String(msg.oauthCopyButton ?? "Copy sign-in link"))}
        </button>
      </div>
      <p id="auth-status" class="status" aria-live="polite" aria-atomic="true"></p>
      <div class="link-box">
        <label for="login-link">Login link</label>
        <textarea id="login-link" readonly spellcheck="false">${escapeHtml(authorizeUrl)}</textarea>
      </div>
      <p class="hint">${escapeHtml(String(msg.oauthFallbackHint ?? "Open the sign-in flow in your browser if the Threads app is unavailable."))}</p>
      <p class="hint">${escapeHtml(String(msg.oauthHint ?? ""))}</p>
    </main>
    <script>
      (() => {
        const pollUrl = ${safePollUrlJson};
        const activateUrl = ${safeActivateUrlJson};
        const pollToken = ${safePollTokenJson};
        const authorizeUrl = ${safeAuthorizeUrlJson};
        const copiedText = ${JSON.stringify(msg.oauthCopiedStatus ?? "Copied the sign-in link. Paste it into a new browser tab to continue.").replace(/</g, "\\u003c")};
        const copyFailedText = ${JSON.stringify(msg.oauthCopyFailedStatus ?? "Automatic copy failed. Copy the selected link manually.").replace(/</g, "\\u003c")};
        const waitingText = ${JSON.stringify(msg.oauthWaitingStatus ?? "Complete authorization in the Threads app...").replace(/</g, "\\u003c")};
        const authorizedText = ${JSON.stringify(msg.oauthAuthorizedStatus ?? "Authorized! Redirecting...").replace(/</g, "\\u003c")};
        const expiredText = ${JSON.stringify(msg.oauthExpiredStatus ?? "Sign-in session expired. Please refresh the page.").replace(/</g, "\\u003c")};
        const timeoutText = ${JSON.stringify(msg.oauthTimeoutStatus ?? "No response. You may have cancelled, or the request timed out.").replace(/</g, "\\u003c")};
        const copyButtonText = ${JSON.stringify(msg.oauthCopyButton ?? "Copy sign-in link").replace(/</g, "\\u003c")};
        const copiedButtonText = ${JSON.stringify(msg.oauthCopiedButton ?? "Copied").replace(/</g, "\\u003c")};
        const POLL_TIMEOUT_MS = 3 * 60 * 1000;

        const copyButton = document.getElementById("copy-button");
        const loginLinkEl = document.getElementById("login-link");
        const statusEl = document.getElementById("auth-status");

        let polling = false;
        let everPolled = false;
        let pollInterval = null;
        let pollTimeoutId = null;

        function setStatus(text, cls) {
          if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = "status" + (cls ? " " + cls : "");
          }
        }

        function setButtonEnabled(enabled) {
          if (copyButton instanceof HTMLButtonElement) {
            copyButton.disabled = !enabled;
            copyButton.textContent = enabled ? copyButtonText : copiedButtonText;
          }
        }

        function selectLink() {
          if (!(loginLinkEl instanceof HTMLTextAreaElement)) return;
          loginLinkEl.focus();
          loginLinkEl.select();
          loginLinkEl.setSelectionRange(0, loginLinkEl.value.length);
        }

        function stopPolling(statusText, cls) {
          clearInterval(pollInterval);
          clearTimeout(pollTimeoutId);
          polling = false;
          setStatus(statusText, cls);
          setButtonEnabled(true);
        }

        function startPolling(initialText) {
          if (polling) return;
          polling = true;
          everPolled = true;
          setButtonEnabled(false);
          setStatus(initialText || waitingText);
          pollTimeoutId = setTimeout(() => stopPolling(timeoutText, "error"), POLL_TIMEOUT_MS);
          pollInterval = setInterval(async () => {
            try {
              const res = await fetch(pollUrl + "?token=" + encodeURIComponent(pollToken), { credentials: "omit", cache: "no-store" });
              if (!res.ok) return;
              const data = await res.json();
              if (data.status === "authorized" && data.activationCode) {
                clearTimeout(pollTimeoutId);
                clearInterval(pollInterval);
                polling = false;
                setStatus(authorizedText, "success");
                window.location.href = activateUrl + "?code=" + encodeURIComponent(data.activationCode);
              } else if (data.status === "expired") {
                stopPolling(expiredText, "error");
              } else if (statusEl && !statusEl.textContent) {
                setStatus(waitingText);
              }
            } catch (_) {}
          }, 2000);
        }

        if (copyButton instanceof HTMLButtonElement) {
          copyButton.addEventListener("click", async () => {
            if (polling) return;
            if (everPolled) {
              window.location.reload();
              return;
            }

            try {
              await navigator.clipboard.writeText(authorizeUrl);
              setStatus(copiedText);
            } catch (_) {
              selectLink();
              setStatus(copyFailedText);
            }

            startPolling(statusEl && statusEl.textContent ? statusEl.textContent : waitingText);
          });
        }

        if (loginLinkEl instanceof HTMLTextAreaElement) {
          loginLinkEl.addEventListener("focus", selectLink);
          loginLinkEl.addEventListener("click", selectLink);
        }
      })();
    </script>
  </body>
</html>`;
}

function renderPrivacyPage(publicOrigin: string, locale: SupportedLocale): string {
  const msg = tServer(locale);
  return renderLegalPage(
    msg.privacyTitle,
    msg.privacyDescription,
    `
      <h1>${escapeHtml(msg.privacyHeading)}</h1>
      <p class="muted">${escapeHtml(msg.legalLastUpdated)}: ${escapeHtml(new Date().toISOString().slice(0, 10))}</p>
      <div class="card">
        <p>${escapeHtml(msg.privacyBody1)}</p>
        <p>${escapeHtml(msg.privacyBody2)}</p>
        <p>${escapeHtml(msg.privacyBody3)}</p>
        <p>${escapeHtml(msg.privacyBody4)}</p>
        <p>${escapeHtml(msg.legalServiceUrl)}: <a href="${escapeHtml(publicOrigin)}">${escapeHtml(publicOrigin)}</a></p>
      </div>
    `
  );
}

function renderTermsPage(publicOrigin: string, locale: SupportedLocale): string {
  const msg = tServer(locale);
  return renderLegalPage(
    msg.termsTitle,
    msg.termsDescription,
    `
      <h1>${escapeHtml(msg.termsHeading)}</h1>
      <p class="muted">${escapeHtml(msg.legalLastUpdated)}: ${escapeHtml(new Date().toISOString().slice(0, 10))}</p>
      <div class="card">
        <p>${escapeHtml(msg.termsBody1)}</p>
        <p>${escapeHtml(msg.termsBody2)}</p>
        <p>${escapeHtml(msg.termsBody3)}</p>
        <p>${escapeHtml(msg.termsBody4)}</p>
        <p>${escapeHtml(msg.legalServiceUrl)}: <a href="${escapeHtml(publicOrigin)}">${escapeHtml(publicOrigin)}</a></p>
      </div>
    `
  );
}

function renderNotionCallbackPage(
  locale: SupportedLocale,
  heading: string,
  body: string,
  autoClose = false
): string {
  return `<!doctype html><html lang="${escapeHtml(locale)}"><body><main style="font-family: sans-serif; max-width: 520px; margin: 48px auto; line-height: 1.6;"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(body)}</p>${autoClose ? "<script>window.close()</script>" : ""}</main></body></html>`;
}

function decodeBase64UrlJson<T>(value: string): T | null {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  try {
    return JSON.parse(Buffer.from(`${normalized}${padding}`, "base64").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function buildThreadsMetaDeletionResponse(publicOrigin: string, signedRequest: string | null): {
  confirmationCode: string;
  statusUrl: string;
} {
  const [, payloadPart] = safeText(signedRequest).split(".", 2);
  const payload = payloadPart
    ? decodeBase64UrlJson<{ user_id?: string | null }>(payloadPart)
    : null;
  const confirmationCode = createHash("sha256")
    .update(`${payload?.user_id ?? "anonymous"}:${Date.now()}:${publicOrigin}`)
    .digest("hex")
    .slice(0, 16);

  return {
    confirmationCode,
    statusUrl: `${publicOrigin.replace(/\/+$/, "")}/legal/data-deletion-status?code=${encodeURIComponent(confirmationCode)}`
  };
}

async function handleMetaThreadsUtilityRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const method = request.method ?? "GET";
  const locale = resolveRequestLocale(request, requestUrl);
  const msg = tServer(locale);

  if (pathname === "/privacy") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    html(response, 200, renderPrivacyPage(publicOrigin, locale));
    return;
  }

  if (pathname === "/terms") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    html(response, 200, renderTermsPage(publicOrigin, locale));
    return;
  }

  if (pathname === "/legal/data-deletion-status") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const code = safeText(requestUrl.searchParams.get("code")) || "pending";
    html(
      response,
      200,
      renderLegalPage(
        "Data Deletion Request Received",
        msg.deletionDescription,
        `
          <h1>${escapeHtml(msg.deletionHeading)}</h1>
          <div class="card">
            <p>${escapeHtml(interpolateServerText(msg.deletionBody1, { code }))}</p>
            <p>${escapeHtml(msg.deletionBody2)}</p>
          </div>
        `
      )
    );
    return;
  }

  if (pathname === "/api/public/threads/deauthorize") {
    if (method !== "POST" && method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    json(response, 200, { ok: true, status: "received" });
    return;
  }

  if (pathname === "/api/public/threads/delete") {
    if (method !== "POST" && method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    let signedRequest: string | null = safeText(requestUrl.searchParams.get("signed_request")) || null;
    if (method === "POST") {
      const form = await parseFormBody(request, config.maxBodyBytes);
      signedRequest = safeText(form.get("signed_request")) || signedRequest;
    }

    const deletion = buildThreadsMetaDeletionResponse(publicOrigin, signedRequest);
    json(response, 200, {
      url: deletion.statusUrl,
      confirmation_code: deletion.confirmationCode
    });
    return;
  }
}

function resolveRequestOrigin(request: IncomingMessage, requestUrl: URL): string {
  const forwardedProto = readForwardedValue(request.headers, "x-forwarded-proto");
  const forwardedHost = readForwardedValue(request.headers, "x-forwarded-host");
  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? forwardedProto
      : requestUrl.protocol.replace(/:$/, "");
  const host = forwardedHost || request.headers.host || requestUrl.host;
  return `${protocol}://${host}`;
}

function readConfiguredPublicOrigin(): string | null {
  const configuredOrigin = getRuntimeConfigSnapshot().publicOrigin || trimEnv("THREADS_WEB_PUBLIC_ORIGIN");
  if (!configuredOrigin) {
    return null;
  }

  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return null;
  }
}

function isSecureRequest(request: IncomingMessage, requestUrl: URL): boolean {
  if (resolveRequestOrigin(request, requestUrl).startsWith("https://")) {
    return true;
  }

  const configuredAdminOrigin = readConfiguredAdminOrigin();
  if (configuredAdminOrigin?.startsWith("https://")) {
    return true;
  }

  return resolvePublicOrigin(request, requestUrl).startsWith("https://");
}

function resolvePreferredPublicOrigin(): string {
  return readConfiguredPublicOrigin() ?? DEFAULT_PUBLIC_ORIGIN;
}

function resolvePublicOrigin(request: IncomingMessage, requestUrl: URL): string {
  const requestOrigin = resolveRequestOrigin(request, requestUrl);
  const configuredOrigin = readConfiguredPublicOrigin();
  if (configuredOrigin) {
    try {
      const configured = new URL(configuredOrigin);
      const derived = new URL(requestOrigin);
      if (configured.host === derived.host) {
        return configured.origin;
      }
    } catch {
      // Ignore invalid explicit origin and derive from the current request instead.
    }
  }

  return requestOrigin;
}

function assertTrustedMutationOrigin(
  request: IncomingMessage,
  requestUrl: URL,
  options: { allowExtensionOrigin?: boolean } = {}
): void {
  const sourceOrigin = readRequestSourceOrigin(request);
  if (!sourceOrigin) {
    throw new RequestError(403, "Origin header is required.");
  }

  if (options.allowExtensionOrigin && isBrowserExtensionOrigin(sourceOrigin)) {
    return;
  }

  const allowedOrigins = new Set<string>([
    resolveRequestOrigin(request, requestUrl),
    resolvePublicOrigin(request, requestUrl),
    resolvePreferredPublicOrigin()
  ]);
  const configuredOrigin = readConfiguredPublicOrigin();
  if (configuredOrigin) {
    allowedOrigins.add(configuredOrigin);
  }

  if (!allowedOrigins.has(sourceOrigin)) {
    throw new RequestError(403, "Origin is not allowed.");
  }
}

type MutationOriginPolicy = {
  enforce: boolean;
  allowExtensionOrigin: boolean;
};

function getMutationOriginPolicy(pathname: string, method: string): MutationOriginPolicy {
  const normalizedMethod = method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)) {
    return { enforce: false, allowExtensionOrigin: false };
  }

  if (pathname === "/api/public/orders") {
    return { enforce: true, allowExtensionOrigin: false };
  }

  if (pathname.startsWith("/api/public/licenses/")) {
    return { enforce: true, allowExtensionOrigin: true };
  }

  if (pathname.startsWith("/api/public/notion/") && pathname !== "/api/public/notion/oauth/callback") {
    return { enforce: true, allowExtensionOrigin: true };
  }

  if (pathname === "/api/public/bot/ingest" || pathname.startsWith("/api/public/webhooks/")) {
    return { enforce: false, allowExtensionOrigin: false };
  }

  if (pathname.startsWith("/api/public/bot/")) {
    return { enforce: true, allowExtensionOrigin: false };
  }

  if (pathname.startsWith("/api/admin/")) {
    return { enforce: true, allowExtensionOrigin: false };
  }

  if (pathname.startsWith("/api/extension/")) {
    return { enforce: true, allowExtensionOrigin: true };
  }

  return { enforce: false, allowExtensionOrigin: false };
}

function readBearerToken(request: IncomingMessage): string | null {
  const authorization = readHeader(request.headers, "authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return safeText(authorization.slice("Bearer ".length));
}

function normalizeIpAddress(value: string | null | undefined): string {
  const normalized = safeText(value);
  if (!normalized) {
    return "";
  }

  return normalized.startsWith("::ffff:") ? normalized.slice("::ffff:".length) : normalized;
}

function readTrustedProxyAllowlist(): Set<string> {
  const raw = trimEnv("THREADS_WEB_TRUST_PROXY_ALLOWLIST");
  if (!raw) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((entry) => normalizeIpAddress(entry))
      .filter(Boolean)
  );
}

function warnIgnoredForwardedForHeader(peerIp: string): void {
  if (ignoredForwardedForWarningLogged) {
    return;
  }

  ignoredForwardedForWarningLogged = true;
  console.warn(
    `[threads-web] Ignoring X-Forwarded-For from untrusted peer ${peerIp || "unknown"}. Configure THREADS_WEB_TRUST_PROXY_ALLOWLIST when running behind a reverse proxy.`
  );
}

function readPeerIp(request: IncomingMessage): string {
  return normalizeIpAddress(request.socket.remoteAddress) || "unknown";
}

function readClientIp(request: IncomingMessage): string {
  const peerIp = readPeerIp(request);
  if (!readTrustedProxyAllowlist().has(peerIp)) {
    if (readForwardedValue(request.headers, "x-forwarded-for")) {
      warnIgnoredForwardedForHeader(peerIp);
    }
    return peerIp;
  }

  const forwarded = readForwardedValue(request.headers, "x-forwarded-for");
  if (forwarded) {
    return normalizeIpAddress(forwarded);
  }

  return peerIp;
}

function hasForwardedProxyHeaders(request: IncomingMessage): boolean {
  return Boolean(
    readForwardedValue(request.headers, "x-forwarded-for") ||
      readForwardedValue(request.headers, "x-forwarded-host") ||
      readForwardedValue(request.headers, "x-forwarded-proto")
  );
}

function buildTrustProxyDiagnostics(request: IncomingMessage): {
  ready: boolean;
  peerIp: string;
  clientIp: string;
  forwardedHeadersSeen: boolean;
  allowlistSize: number;
  trustedPeer: boolean;
  warning: string | null;
} {
  const allowlist = readTrustedProxyAllowlist();
  const peerIp = readPeerIp(request);
  const trustedPeer = allowlist.has(peerIp);
  const forwardedHeadersSeen = hasForwardedProxyHeaders(request);
  const ready = !forwardedHeadersSeen || trustedPeer;
  const warning =
    forwardedHeadersSeen && !trustedPeer
      ? "Forwarded proxy headers are present but this peer is not trusted. Configure THREADS_WEB_TRUST_PROXY_ALLOWLIST so IP-based protections use the real client IP."
      : null;

  return {
    ready,
    peerIp,
    clientIp: trustedPeer ? readClientIp(request) : peerIp,
    forwardedHeadersSeen,
    allowlistSize: allowlist.size,
    trustedPeer,
    warning
  };
}

function toTimestamp(value: string | null | undefined, fallback = 0): number {
  const parsed = Date.parse(`${value ?? ""}`.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeHandleForStatus(value: string | null | undefined): string {
  return safeText(value).replace(/^@+/, "").toLowerCase();
}

async function buildPublicMentionSaveStatus(
  sessionState: Awaited<ReturnType<typeof getBotSessionStateFromStore>>,
  collector: BotMentionCollector
): Promise<PublicMentionSaveStatus | null> {
  if (!sessionState.authenticated || !sessionState.user) {
    return null;
  }

  const collectorStatus = collector.getStatus();
  const [botArchives, botMentionJobs] = await Promise.all([
    loadBotArchives(),
    loadBotMentionJobs()
  ]);

  let latestArchiveUpdatedAt: string | null = null;
  for (const candidate of botArchives) {
    if (candidate.userId !== sessionState.user?.id) {
      continue;
    }

    if (
      !latestArchiveUpdatedAt ||
      toTimestamp(candidate.updatedAt) > toTimestamp(latestArchiveUpdatedAt)
    ) {
      latestArchiveUpdatedAt = candidate.updatedAt;
    }
  }

  const userId = safeText(sessionState.user?.threadsUserId);
  const userHandle = normalizeHandleForStatus(sessionState.user?.threadsHandle);
  let latestMentionUrl: string | null = null;
  let latestMentionCreatedAt: string | null = null;
  let latestMentionUpdatedAt: string | null = null;
  let latestMentionStatus: BotMentionJobRecord["status"] | null = null;
  let latestMentionError: string | null = null;
  let latestMentionAvailableAt: string | null = null;
  let latestMentionTimestamp = -1;
  for (const candidate of botMentionJobs) {
    const matchesUser =
      (userId && safeText(candidate.mentionAuthorUserId) === userId) ||
      normalizeHandleForStatus(candidate.mentionAuthorHandle) === userHandle;
    if (!matchesUser) {
      continue;
    }

    const candidateTimestamp = toTimestamp(candidate.updatedAt || candidate.createdAt);
    if (candidateTimestamp > latestMentionTimestamp) {
      latestMentionTimestamp = candidateTimestamp;
      latestMentionUrl = candidate.mentionUrl;
      latestMentionCreatedAt = candidate.createdAt;
      latestMentionUpdatedAt = candidate.updatedAt;
      latestMentionStatus = candidate.status;
      latestMentionError = candidate.lastError;
      latestMentionAvailableAt = candidate.availableAt;
    }
  }

  let currentState: PublicMentionSaveState = "idle";
  let completionSource: "job" | "archive_inferred" | null = null;
  if (latestMentionStatus === "queued") {
    currentState = "queued";
  } else if (latestMentionStatus === "processing") {
    currentState = "processing";
  } else if (
    latestMentionStatus === "failed" ||
    latestMentionStatus === "invalid" ||
    latestMentionStatus === "unmatched"
  ) {
    currentState = "failed";
  } else if (latestMentionStatus === "completed") {
    currentState = "completed";
    completionSource = "job";
  } else if (
    latestMentionTimestamp >= 0 &&
    latestArchiveUpdatedAt &&
    toTimestamp(latestArchiveUpdatedAt) >= toTimestamp(latestMentionUpdatedAt || latestMentionCreatedAt, 0)
  ) {
    currentState = "completed";
    completionSource = "archive_inferred";
  }

  let expectedVisibleAt: string | null = null;
  if (currentState === "queued" || currentState === "processing") {
    expectedVisibleAt = new Date(
      Math.max(Date.now(), toTimestamp(latestMentionAvailableAt, Date.now())) + collectorStatus.pollIntervalMs
    ).toISOString();
  } else if (currentState === "failed") {
    expectedVisibleAt = latestMentionAvailableAt;
  }

  return {
    currentState,
    completionSource,
    collectorEnabled: collectorStatus.enabled,
    pollIntervalMs: collectorStatus.pollIntervalMs,
    collectorError: collectorStatus.lastError,
    lastCollectedAt: collectorStatus.lastSucceededAt ?? collectorStatus.lastCompletedAt,
    latestMentionUrl,
    latestMentionCreatedAt,
    latestMentionUpdatedAt,
    latestJobStatus: latestMentionStatus,
    latestJobError: latestMentionError,
    latestSavedAt: latestArchiveUpdatedAt,
    expectedVisibleAt,
    retryAvailableAt: currentState === "failed" ? latestMentionAvailableAt : null
  };
}

async function buildPublicBotSessionResponse(
  rawSession: string | null | undefined,
  collector: BotMentionCollector
): Promise<Awaited<ReturnType<typeof getBotSessionStateFromStore>> & { saveStatus: PublicMentionSaveStatus | null }> {
  await repairBotSessionArchivesFromStore(rawSession);
  const state = await getBotSessionStateFromStore(rawSession);
  return {
    ...state,
    saveStatus: await buildPublicMentionSaveStatus(state, collector)
  };
}

function readAdminAllowlist(): Set<string> | null {
  const raw = trimEnv("THREADS_WEB_ADMIN_ALLOWLIST");
  if (!raw) {
    return new Set(DEFAULT_ADMIN_ALLOWLIST);
  }

  const values = raw
    .split(",")
    .map((entry) => normalizeIpAddress(entry))
    .filter(Boolean);
  return values.length > 0 ? new Set(values) : null;
}

function assertAdminIpAllowed(request: IncomingMessage): void {
  const allowlist = readAdminAllowlist();
  if (!allowlist) {
    return;
  }

  const clientIp = readClientIp(request);
  if (!allowlist.has(clientIp)) {
    throw new RequestError(403, "Admin access is not allowed from this IP.");
  }
}

function readConfiguredAdminOrigin(): string | null {
  const raw = trimEnv("THREADS_WEB_ADMIN_ORIGIN");
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function assertAdminOriginAllowed(request: IncomingMessage, requestUrl: URL): void {
  const configuredAdminOrigin = readConfiguredAdminOrigin();
  if (!configuredAdminOrigin) {
    return;
  }

  const requestOrigin = resolveRequestOrigin(request, requestUrl);
  if (new URL(configuredAdminOrigin).host.toLowerCase() !== new URL(requestOrigin).host.toLowerCase()) {
    throw new RequestError(404, "Not found");
  }
}

type RateLimitRule = {
  keyScope: "ip" | "session" | "auth";
  maxRequests: number;
  name: string;
  windowMs: number;
};

function createRateLimitState(): RateLimitState {
  return {
    buckets: new Map(),
    gcTimer: null
  };
}

function cleanupRateLimitBuckets(state: RateLimitState, now = Date.now()): void {
  for (const [key, bucket] of state.buckets.entries()) {
    if (bucket.resetAt <= now) {
      state.buckets.delete(key);
    }
  }
}

function enforceRateLimitBucketCap(state: RateLimitState, now = Date.now()): void {
  cleanupRateLimitBuckets(state, now);
  const maxBuckets = getRateLimitBucketLimit();
  if (state.buckets.size < maxBuckets) {
    return;
  }

  const overflowCount = state.buckets.size - maxBuckets + 1;
  const entriesByExpiry = [...state.buckets.entries()].sort((left, right) => left[1].resetAt - right[1].resetAt);
  for (let index = 0; index < overflowCount; index += 1) {
    const entry = entriesByExpiry[index];
    if (!entry) {
      break;
    }
    state.buckets.delete(entry[0]);
  }
}

function ensureRateLimitBucketGcTimer(state: RateLimitState): void {
  if (state.gcTimer) {
    return;
  }

  state.gcTimer = setInterval(() => {
    cleanupRateLimitBuckets(state);
  }, RATE_LIMIT_BUCKET_GC_INTERVAL_MS);
  state.gcTimer.unref?.();
}

function stopRateLimitBucketGcTimer(state: RateLimitState): void {
  if (state.gcTimer) {
    clearInterval(state.gcTimer);
    state.gcTimer = null;
  }
  state.buckets.clear();
}

function getRateLimitRule(pathname: string, method: string): RateLimitRule | null {
  const normalizedMethod = method.toUpperCase();

  if (pathname.startsWith("/api/admin/")) {
    return { name: "admin-api", windowMs: 10 * 60_000, maxRequests: 240, keyScope: "auth" };
  }

  if (pathname === "/api/public/orders" && normalizedMethod === "POST") {
    return { name: "public-order-create", windowMs: 10 * 60_000, maxRequests: 10, keyScope: "ip" };
  }

  if (pathname === "/api/extension/cloud/save" && normalizedMethod === "POST") {
    return { name: "extension-cloud-save", windowMs: 60_000, maxRequests: 20, keyScope: "auth" };
  }

  if (pathname === "/api/public/bot/archives.zip" && normalizedMethod === "POST") {
    return { name: "scrapbook-archive-export", windowMs: 60 * 60_000, maxRequests: 12, keyScope: "session" };
  }

  if (
    normalizedMethod === "POST" &&
    (pathname === "/api/public/bot/sync" ||
      pathname === "/api/public/bot/insights/refresh" ||
      /^\/api\/public\/bot\/watchlists\/[^/]+\/sync$/.test(pathname) ||
      /^\/api\/public\/bot\/searches\/[^/]+\/run$/.test(pathname))
  ) {
    return { name: "scrapbook-sync", windowMs: 10 * 60_000, maxRequests: 15, keyScope: "session" };
  }

  if (pathname === "/api/public/bot/extension/link/start" && normalizedMethod === "GET") {
    return { name: "extension-link-start", windowMs: 10 * 60_000, maxRequests: 10, keyScope: "session" };
  }

  if (pathname === "/api/extension/link/complete" && normalizedMethod === "POST") {
    return { name: "extension-link-complete", windowMs: 10 * 60_000, maxRequests: 10, keyScope: "ip" };
  }

  return null;
}

function buildRateLimitKey(request: IncomingMessage, rule: RateLimitRule): string {
  if (rule.keyScope === "auth") {
    const bearerToken = readBearerToken(request);
    if (bearerToken) {
      return `${rule.name}:auth:${createHash("sha256").update(bearerToken).digest("hex")}`;
    }

    const adminSession = readCookie(request.headers, ADMIN_SESSION_COOKIE);
    if (adminSession) {
      return `${rule.name}:admin:${createHash("sha256").update(adminSession).digest("hex")}`;
    }
  }

  if (rule.keyScope === "session" || rule.keyScope === "auth") {
    const sessionToken = readCookie(request.headers, BOT_SESSION_COOKIE);
    if (sessionToken) {
      return `${rule.name}:session:${createHash("sha256").update(sessionToken).digest("hex")}`;
    }
  }

  return `${rule.name}:ip:${readClientIp(request)}`;
}

function assertRateLimit(state: RateLimitState, request: IncomingMessage, pathname: string, method: string): void {
  const rule = getRateLimitRule(pathname, method);
  if (!rule) {
    return;
  }

  const now = Date.now();
  const key = buildRateLimitKey(request, rule);
  const existing = state.buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    enforceRateLimitBucketCap(state, now);
    state.buckets.set(key, {
      count: 1,
      resetAt: now + rule.windowMs
    });
    return;
  }

  if (existing.count >= rule.maxRequests) {
    throw new RequestError(429, "Too many requests. Try again soon.");
  }

  existing.count += 1;
  state.buckets.set(key, existing);
}

function shouldRedirectLegacyPublicPage(request: IncomingMessage, requestUrl: URL): URL | null {
  const method = request.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") {
    return null;
  }

  const requestOrigin = resolveRequestOrigin(request, requestUrl);
  let requestHost: string;
  try {
    requestHost = new URL(requestOrigin).host.toLowerCase();
  } catch {
    return null;
  }

  const isLegacyPublicPath =
    LEGACY_PUBLIC_PAGE_PATHS.has(requestUrl.pathname) ||
    SCRAPBOOK_HANDLE_PATH_RE.test(requestUrl.pathname) ||
    SCRAPBOOK_ARCHIVE_PATH_RE.test(requestUrl.pathname);
  if (!LEGACY_PUBLIC_HOSTS.has(requestHost) || !isLegacyPublicPath) {
    return null;
  }

  const preferredOrigin = resolvePreferredPublicOrigin();
  if (new URL(preferredOrigin).host.toLowerCase() === requestHost) {
    return null;
  }

  return new URL(`${requestUrl.pathname}${requestUrl.search}`, preferredOrigin);
}

function resolveLandingMeta(_siteHost: string): { title: string; description: string } {
  const botHandle = getBotPublicConfig().botHandle;
  return {
    title: "ss-threads",
    description: `ss-threads는 PC에서는 extension으로, 모바일에서는 댓글 @${botHandle} 멘션으로 Threads를 scrapbook에 저장합니다.`
  };
}

function normalizeLandingBotHandle(value: string | null | undefined): string {
  return `${value ?? ""}`.trim().replace(/^@+/, "") || DEFAULT_LANDING_BOT_HANDLE;
}

function applyLandingBotHandleTemplate(value: string, botHandle: string): string {
  return value.replaceAll("@{botHandle}", `@${normalizeLandingBotHandle(botHandle)}`);
}

function escapeInlineJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function renderLandingHeadlineLines(value: string): string {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  const normalizedLines =
    lines.length > 1
      ? lines
      : lines[0]
          .split(/(?<=[.!?。！？])\s+/)
          .map((line) => line.trim())
          .filter(Boolean);

  return normalizedLines.map((line) => `<span class="headline-row">${escapeHtml(line)}</span>`).join("");
}

function resolveInitialLandingHeadline(
  locale: SupportedLocale,
  siteHost: string,
  storefrontSettings: StorefrontSettings | null
): string {
  const botHandle = getBotPublicConfig().botHandle;
  void siteHost;
  const defaultHeadline = LANDING_HEADLINE_LINES[locale]
    .map((line) => `<span class="headline-row">${escapeHtml(applyLandingBotHandleTemplate(line, botHandle))}</span>`)
    .join("");

  if (locale !== "ko" || !storefrontSettings) {
    return defaultHeadline;
  }

  const persistedHeadline = applyLandingBotHandleTemplate(storefrontSettings.headline, botHandle);
  return persistedHeadline.trim() ? renderLandingHeadlineLines(persistedHeadline) : defaultHeadline;
}

function resolveInitialLandingMention(locale: SupportedLocale): string {
  const template = LANDING_MENTION_HTML[locale];
  if (!template) {
    return "";
  }

  return applyLandingBotHandleTemplate(template, getBotPublicConfig().botHandle);
}

function resolvePublicStorefrontSettings(settings: StorefrontSettings): StorefrontSettings {
  const botHandle = getBotPublicConfig().botHandle;
  return {
    ...settings,
    headline: applyLandingBotHandleTemplate(settings.headline, botHandle),
    subheadline: applyLandingBotHandleTemplate(settings.subheadline, botHandle),
    includedUpdates: applyLandingBotHandleTemplate(settings.includedUpdates, botHandle),
    heroNotes: settings.heroNotes.map((note) => applyLandingBotHandleTemplate(note, botHandle)),
    faqs: settings.faqs.map((faq) => ({
      ...faq,
      question: applyLandingBotHandleTemplate(faq.question, botHandle),
      answer: applyLandingBotHandleTemplate(faq.answer, botHandle)
    }))
  };
}

function buildResolvedPublicStorefront(publicStorefront: PublicStorefrontResponse): PublicStorefrontResponse {
  return {
    ...publicStorefront,
    settings: publicStorefront.settings ? resolvePublicStorefrontSettings(publicStorefront.settings) : publicStorefront.settings
  };
}

async function readPersistedPublicStorefrontSnapshot(): Promise<PublicStorefrontResponse | null> {
  try {
    const raw = await readFile(getPublicStorefrontSnapshotFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<PublicStorefrontResponse> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.settings || !Array.isArray(parsed.paymentMethods)) {
      return null;
    }

    return parsed as PublicStorefrontResponse;
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function persistPublicStorefrontSnapshot(snapshot: PublicStorefrontResponse): Promise<void> {
  const filePath = getPublicStorefrontSnapshotFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp.${process.pid}.${crypto.randomUUID()}`;
  await writeFile(tempPath, JSON.stringify(snapshot, null, 2), "utf8");
  await rename(tempPath, filePath);
}

function cachePublicStorefrontSnapshot(snapshot: PublicStorefrontResponse): CachedPublicStorefront {
  const cached = {
    loadedAt: Date.now(),
    snapshot
  };
  publicStorefrontCache.current = cached;
  publicStorefrontCache.diskLoadAttempted = true;
  return cached;
}

function setPublicStorefrontSnapshotCache(snapshot: PublicStorefrontResponse): void {
  cachePublicStorefrontSnapshot(snapshot);
  void persistPublicStorefrontSnapshot(snapshot).catch((error) => {
    logUnexpectedError("public storefront snapshot persist failed", error);
  });
}

function resetPublicStorefrontSnapshotCache(): void {
  publicStorefrontCache.current = null;
  publicStorefrontCache.diskLoadAttempted = false;
  publicStorefrontCache.refreshInFlight = null;
}

async function refreshPublicStorefrontSnapshotCache(): Promise<CachedPublicStorefront> {
  if (publicStorefrontCache.refreshInFlight) {
    return publicStorefrontCache.refreshInFlight;
  }

  const refreshPromise = (async () => {
    const snapshot = await loadPublicStorefrontSnapshot();
    const cached = cachePublicStorefrontSnapshot(snapshot);
    await persistPublicStorefrontSnapshot(snapshot).catch((error) => {
      logUnexpectedError("public storefront snapshot persist failed", error);
    });
    return cached;
  })();

  publicStorefrontCache.refreshInFlight = refreshPromise;
  refreshPromise.finally(() => {
    if (publicStorefrontCache.refreshInFlight === refreshPromise) {
      publicStorefrontCache.refreshInFlight = null;
    }
  }).catch(() => undefined);
  return refreshPromise;
}

function schedulePublicStorefrontSnapshotRefresh(): void {
  if (publicStorefrontCache.refreshInFlight) {
    return;
  }

  void refreshPublicStorefrontSnapshotCache().catch((error) => {
    logUnexpectedError("public storefront cache refresh failed", error);
  });
}

async function getPublicStorefrontSnapshotCached(): Promise<PublicStorefrontResponse> {
  const cached = publicStorefrontCache.current;
  if (cached) {
    const fileStat = await stat(getPublicStorefrontSnapshotFilePath()).catch(() => null);
    if (fileStat && fileStat.mtimeMs > cached.loadedAt) {
      return (await refreshPublicStorefrontSnapshotCache()).snapshot;
    }

    if (Date.now() - cached.loadedAt > getPublicStorefrontCacheTtlMs()) {
      schedulePublicStorefrontSnapshotRefresh();
    }
    return cached.snapshot;
  }

  if (!publicStorefrontCache.diskLoadAttempted) {
    const persisted = await readPersistedPublicStorefrontSnapshot().catch((error) => {
      logUnexpectedError("public storefront snapshot load failed", error);
      return null;
    });
    if (persisted) {
      const diskCached = cachePublicStorefrontSnapshot(persisted);
      schedulePublicStorefrontSnapshotRefresh();
      return diskCached.snapshot;
    }
    publicStorefrontCache.diskLoadAttempted = true;
  }

  return (await refreshPublicStorefrontSnapshotCache()).snapshot;
}

function parsePaymentProvider(raw: string | undefined): PaymentProvider | null {
  if (!raw) {
    return null;
  }

  if (raw === "stableorder" || raw === "stripe" || raw === "paypal") {
    return raw;
  }

  return null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function readNestedValue(root: unknown, path: Array<string>): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10);
      if (Number.isNaN(index)) {
        return undefined;
      }

      return current[index];
    }

    const record = current as Record<string, unknown>;
    current = record[segment];
  }

  return current;
}

function pickFirst(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const normalized = readString(value);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
}

function isCompletedStatus(status: string | null): boolean {
  if (!status) {
    return false;
  }

  const normalized = status.trim().toLowerCase();
  return (
    normalized === "paid" ||
    normalized === "payment_succeeded" ||
    normalized === "succeeded" ||
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "captured" ||
    normalized === "approved"
  );
}

function rawSecretsMatch(signature: string, secret: string): boolean {
  const signatureBytes = Buffer.from(signature);
  const secretBytes = Buffer.from(secret);
  return signatureBytes.length === secretBytes.length && timingSafeEqual(signatureBytes, secretBytes);
}

function requireWebhookHeader(headers: IncomingMessage["headers"], headerName: string): string {
  const value = readHeader(headers, headerName);
  if (!value) {
    throw new RequestError(401, "Webhook request missing signature header.");
  }
  return value;
}

function verifyStableorderWebhookSignature(headers: IncomingMessage["headers"], rawText: string): void {
  const secret = trimEnv(PROVIDER_WEBHOOK_SECRETS.stableorder);
  if (!secret) {
    throw new RequestError(503, `Webhook secret is not configured for provider "stableorder".`);
  }

  const signature = requireWebhookHeader(headers, PROVIDER_WEBHOOK_HEADERS.stableorder);
  if (rawSecretsMatch(signature, secret)) {
    return;
  }

  const expectedSignature = createHmac("sha256", secret).update(rawText).digest("hex");
  if (rawSecretsMatch(signature, expectedSignature) || rawSecretsMatch(signature, `sha256=${expectedSignature}`)) {
    return;
  }

  throw new RequestError(401, "Invalid webhook signature.");
}

function parseSignatureHeader(signatureHeader: string): Map<string, string[]> {
  const parts = new Map<string, string[]>();
  for (const segment of signatureHeader.split(",")) {
    const [rawKey, ...rawValueParts] = segment.split("=");
    const key = rawKey?.trim();
    const value = rawValueParts.join("=").trim();
    if (!key || !value) {
      continue;
    }

    const existing = parts.get(key) ?? [];
    existing.push(value);
    parts.set(key, existing);
  }

  return parts;
}

function verifyStripeWebhookSignature(headers: IncomingMessage["headers"], rawText: string): void {
  const secret = trimEnv(PROVIDER_WEBHOOK_SECRETS.stripe);
  if (!secret) {
    throw new RequestError(503, `Webhook secret is not configured for provider "stripe".`);
  }

  const signatureHeader = requireWebhookHeader(headers, PROVIDER_WEBHOOK_HEADERS.stripe);
  const parsedSignature = parseSignatureHeader(signatureHeader);
  const timestampText = parsedSignature.get("t")?.[0];
  const signatures = parsedSignature.get("v1") ?? [];
  if (!timestampText || signatures.length === 0) {
    throw new RequestError(401, "Invalid webhook signature.");
  }

  const timestamp = Number.parseInt(timestampText, 10);
  if (!Number.isInteger(timestamp)) {
    throw new RequestError(401, "Invalid webhook signature.");
  }

  const ageMs = Math.abs(Date.now() - timestamp * 1000);
  if (ageMs > getStripeWebhookToleranceMs()) {
    throw new RequestError(401, "Webhook signature timestamp is outside the allowed tolerance.");
  }

  const payload = `${timestamp}.${rawText}`;
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");
  if (!signatures.some((candidate) => rawSecretsMatch(candidate, expectedSignature))) {
    throw new RequestError(401, "Invalid webhook signature.");
  }
}

function readRequiredPaypalVerificationConfig(): {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  webhookId: string;
} {
  const clientId = trimEnv("THREADS_PAYPAL_CLIENT_ID");
  const clientSecret = trimEnv("THREADS_PAYPAL_CLIENT_SECRET");
  const webhookId = trimEnv("THREADS_PAYPAL_WEBHOOK_ID");
  const apiBaseUrl = trimEnv("THREADS_PAYPAL_API_BASE_URL") ?? "https://api-m.paypal.com";

  if (!clientId || !clientSecret || !webhookId) {
    throw new RequestError(503, "PayPal webhook verification is not fully configured.");
  }

  return { apiBaseUrl, clientId, clientSecret, webhookId };
}

async function fetchPaypalAccessToken(config: {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const authorization = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetchWithTimeout(new URL("/v1/oauth2/token", config.apiBaseUrl), {
    method: "POST",
    headers: {
      authorization: `Basic ${authorization}`,
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const accessToken = readString(payload?.access_token);
  if (!response.ok || !accessToken) {
    throw new RequestError(502, "PayPal webhook verification token request failed.");
  }
  return accessToken;
}

async function verifyPaypalWebhookSignature(
  headers: IncomingMessage["headers"],
  rawPayload: unknown
): Promise<void> {
  const config = readRequiredPaypalVerificationConfig();
  const accessToken = await fetchPaypalAccessToken(config);
  const transmissionId = requireWebhookHeader(headers, "paypal-transmission-id");
  const transmissionSig = requireWebhookHeader(headers, "paypal-transmission-sig");
  const transmissionTime = requireWebhookHeader(headers, "paypal-transmission-time");
  const authAlgo = requireWebhookHeader(headers, "paypal-auth-algo");
  const certUrl = requireWebhookHeader(headers, "paypal-cert-url");

  const response = await fetchWithTimeout(new URL("/v1/notifications/verify-webhook-signature", config.apiBaseUrl), {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: config.webhookId,
      webhook_event: rawPayload
    })
  });
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const verificationStatus = readString(payload?.verification_status)?.toUpperCase();
  if (!response.ok) {
    throw new RequestError(502, "PayPal webhook verification failed.");
  }
  if (verificationStatus !== "SUCCESS") {
    throw new RequestError(401, "Invalid webhook signature.");
  }
}

async function verifyWebhookAuth(
  provider: PaymentProvider,
  headers: IncomingMessage["headers"],
  rawText: string,
  rawPayload: unknown
): Promise<void> {
  if (provider === "stableorder") {
    verifyStableorderWebhookSignature(headers, rawText);
    return;
  }

  if (provider === "stripe") {
    verifyStripeWebhookSignature(headers, rawText);
    return;
  }

  await verifyPaypalWebhookSignature(headers, rawPayload);
}

function buildWebhookHints(provider: PaymentProvider, rawPayload: unknown): WebhookHints {
  const payload = toRecord(rawPayload);
  if (!payload) {
    return {
      orderId: null,
      orderReference: null,
      email: null,
      eventId: null,
      paid: false
    };
  }

  if (provider === "stableorder") {
    const resultPayload = toRecord(payload.result);
    const paymentStatus = pickFirst(
      readString(payload.status),
      readString(payload.payment_status),
      readString(payload.state),
      readString(resultPayload?.status)
    );
    const email = pickFirst(
      readString(payload.buyer_email),
      readString(payload.buyerEmail),
      readString(payload.customer_email),
      readString(payload.customerEmail),
      readString(payload.email),
      readString(payload.payer_email),
      readString(payload.payerEmail)
    );

    return {
      orderId: pickFirst(
        readString(payload.order_id),
        readString(payload.orderId),
        readString(payload.orderIdStr),
        readString(payload.id)
      ),
      orderReference: pickFirst(
        readString(payload.reference),
        readString(payload.order_reference),
        readString(payload.orderReference)
      ),
      email,
      eventId: pickFirst(readString(payload.eventId), readString(payload.event_id), readString(payload.id)),
      paid: isCompletedStatus(paymentStatus)
    };
  }

  const type = pickFirst(readString(payload.type), readString(payload.event_type));
  if (provider === "stripe") {
    const stripePayload = toRecord(readNestedValue(payload, ["data", "object"])) ?? payload;
    const email = pickFirst(
      readString(readNestedValue(stripePayload, ["customer_details", "email"])),
      readString(stripePayload.customer_email),
      readString(stripePayload.customerEmail),
      readString(stripePayload.email),
      readString(stripePayload.customer),
      readString(readNestedValue(stripePayload, ["metadata", "buyer_email"])),
      readString(readNestedValue(stripePayload, ["metadata", "email"]))
    );
    const orderId = pickFirst(
      readString(readNestedValue(stripePayload, ["metadata", "threads_order_id"])),
      readString(readNestedValue(stripePayload, ["metadata", "order_id"])),
      readString(readNestedValue(stripePayload, ["metadata", "orderId"])),
      readString(readNestedValue(stripePayload, ["client_reference_id"])),
      readString(stripePayload.id)
    );
    const orderReference = pickFirst(readString(readNestedValue(stripePayload, ["metadata", "order_reference"])));
    const paymentStatus = pickFirst(
      type,
      readString(stripePayload.status),
      readString(stripePayload.payment_status)
    );

    return {
      orderId,
      orderReference,
      email,
      eventId: pickFirst(readString(payload.id), readString(readNestedValue(payload, ["data", "id"]))),
      paid: isCompletedStatus(paymentStatus) || (type !== null && type.includes("succeeded")) || (type !== null && type.includes("completed"))
    };
  }

  const paypalPayload = toRecord(readNestedValue(payload, ["resource"])) ?? payload;
  const paypalEmail = pickFirst(
    readString(readNestedValue(paypalPayload, ["payer", "email_address"])),
    readString(readNestedValue(paypalPayload, ["payer", "email"])),
    readString(paypalPayload.payer_email),
    readString(readNestedValue(paypalPayload, ["custom", "buyer_email"])),
    readString(readNestedValue(payload, ["resource", "payer", "email_address"]))
  );
  const orderId = pickFirst(
    readString(readNestedValue(payload, ["resource", "invoice_id"])),
    readString(readNestedValue(payload, ["resource", "custom_id"])),
    readString(readNestedValue(payload, ["resource", "id"])),
    readString(payload.id),
    readString(payload.invoice_id),
    readString(payload.custom_id)
  );

  const orderReference = pickFirst(
    readString(readNestedValue(payload, ["resource", "invoice_number"])),
    readString(readNestedValue(payload, ["invoice_id"]))
  );
  const paymentStatus = pickFirst(
    type,
    readString(paypalPayload.status),
    readString(paypalPayload.state),
    readString(readNestedValue(payload, ["resource", "status"]))
  );

  return {
    orderId,
    orderReference,
    email: paypalEmail,
    eventId: pickFirst(
      readString(readNestedValue(payload, ["id"])),
      readString(readNestedValue(payload, ["resource", "id"]))
    ),
    paid:
      isCompletedStatus(paymentStatus) ||
      (type !== null && type.includes("COMPLETED")) ||
      (type !== null && type.includes("completed"))
  };
}

function getProviderMethodIds(data: WebDatabase, provider: PaymentProvider): string[] {
  const matcher = PROVIDER_ACTION_URL_PATTERNS[provider];
  const byUrl = data.paymentMethods
    .filter((method) => matcher.test(method.actionUrl))
    .map((method) => method.id);

  if (byUrl.length > 0) {
    return byUrl;
  }

  const fallback = data.paymentMethods.find((method) => method.id === PROVIDER_METHOD_DEFAULT_IDS[provider]);
  return fallback ? [fallback.id] : [];
}

function resolveOrderForWebhook(
  data: WebDatabase,
  provider: PaymentProvider,
  hints: WebhookHints
): PurchaseOrder | null {
  const candidateMethods = getProviderMethodIds(data, provider);
  const orderIdCandidates = [hints.orderId, hints.orderReference]
    .map((candidate) => candidate)
    .filter((candidate): candidate is string => candidate !== null);

  const statusAllowed = new Set(["pending", "payment_confirmed", "key_issued"]);

  const candidates = data.orders
    .filter(
      (order) =>
        statusAllowed.has(order.status) &&
        (candidateMethods.length === 0 || candidateMethods.includes(order.paymentMethodId))
    )
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  if (orderIdCandidates.length > 0) {
    const exactMatch = candidates.find((order) => order.id === orderIdCandidates[0] || order.paymentReference === orderIdCandidates[0]);
    if (exactMatch) {
      return exactMatch;
    }

    if (orderIdCandidates.length > 1) {
      const exactMatch2 = candidates.find((order) => order.id === orderIdCandidates[1] || order.paymentReference === orderIdCandidates[1]);
      if (exactMatch2) {
        return exactMatch2;
      }
    }
  }

  if (!hints.email) {
    return null;
  }

  const emailMatch = candidates.filter((order) => order.buyerEmail === normalizeEmail(hints.email as string));
  if (emailMatch.length === 1) {
    return emailMatch[0];
  }

  if (emailMatch.length > 1) {
    return emailMatch[0];
  }

  return null;
}
function getStaticCandidates(urlPath: string): string[] {
  const normalizedPath = path.posix.normalize(decodeURIComponent(urlPath));
  if (normalizedPath.includes("..")) {
    return [];
  }

  if (normalizedPath === "/" || normalizedPath === "") {
    return ["landing/index.html", "index.html"];
  }

  if (normalizedPath === "/landing" || normalizedPath === "/landing/") {
    return ["landing/index.html"];
  }

  if (normalizedPath === "/install" || normalizedPath === "/install/") {
    return ["install/index.html"];
  }

  if (normalizedPath === "/admin" || normalizedPath === "/admin/") {
    return ["admin/index.html"];
  }

  if (normalizedPath === "/scrapbook" || normalizedPath === "/scrapbook/") {
    return ["scrapbook/index.html"];
  }

  if (SCRAPBOOK_HANDLE_PATH_RE.test(normalizedPath) || SCRAPBOOK_ARCHIVE_PATH_RE.test(normalizedPath)) {
    return ["scrapbook/index.html"];
  }

  if (normalizedPath === "/checkout" || normalizedPath === "/checkout/") {
    return ["checkout/index.html"];
  }

  const relativePath = normalizedPath.replace(/^\/+/, "");
  if (!relativePath) {
    return [];
  }

  return [relativePath];
}

function resolveStaticPath(candidate: string): string | null {
  const normalized = path.normalize(candidate);
  if (normalized.includes("..")) {
    return null;
  }

  for (const basePath of [path.resolve(__dirname), path.resolve(__dirname, "../../../dist/web")]) {
    const absolutePath = path.resolve(basePath, normalized);
    if (!absolutePath.startsWith(`${basePath}${path.sep}`) && absolutePath !== basePath) {
      continue;
    }

    if (existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  return null;
}

function buildStaticAssetHeaders(contentType: string): Record<string, string> {
  return {
    "content-type": contentType,
    "x-content-type-options": "nosniff"
  };
}

function buildPublicMarketingPageHeaders(contentType: string): Record<string, string> {
  return {
    ...buildStaticAssetHeaders(contentType),
    "content-security-policy": PUBLIC_MARKETING_PAGE_CONTENT_SECURITY_POLICY,
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "permissions-policy": PUBLIC_PAGE_PERMISSIONS_POLICY,
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY"
  };
}

function buildAdminPageHeaders(contentType: string): Record<string, string> {
  return {
    ...buildStaticAssetHeaders(contentType),
    "cache-control": "no-store",
    "content-security-policy": ADMIN_PAGE_CONTENT_SECURITY_POLICY,
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "permissions-policy": PUBLIC_PAGE_PERMISSIONS_POLICY,
    "referrer-policy": "no-referrer",
    "x-frame-options": "DENY"
  };
}

async function serveStatic(request: IncomingMessage, response: ServerResponse, pathname: string): Promise<boolean> {
  for (const relativePath of getStaticCandidates(pathname)) {
    const absolutePath = resolveStaticPath(relativePath);
    if (!absolutePath) {
      continue;
    }

    try {
      const extension = path.extname(absolutePath);
      if (relativePath === "landing/index.html") {
        const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        const siteUrl = resolvePublicOrigin(request, requestUrl);
        const siteHost = new URL(siteUrl).host;
        const landingMeta = resolveLandingMeta(siteHost);
        const initialLocale = resolveInitialLandingLocale(request, requestUrl);
        let storefrontSettings: StorefrontSettings | null = null;
        try {
          storefrontSettings = buildResolvedPublicStorefront(await getPublicStorefrontSnapshotCached()).settings ?? null;
        } catch (error) {
          logUnexpectedError("landing bootstrap load failed", error);
        }
        const landingHeadline = resolveInitialLandingHeadline(initialLocale, siteHost, storefrontSettings);
        const landingMention = resolveInitialLandingMention(initialLocale);
        const landingBootstrap = escapeInlineJson({
          botHandle: getBotPublicConfig().botHandle,
          storefrontSettings
        });
        const contents = (await loadCachedTextTemplate(absolutePath))
          .replaceAll("__SITE_TITLE__", escapeHtml(landingMeta.title))
          .replaceAll("__SITE_DESCRIPTION__", escapeHtml(landingMeta.description))
          .replaceAll("__SITE_URL__", escapeHtml(siteUrl))
          .replaceAll("__SITE_HOST__", escapeHtml(siteHost))
          .replaceAll("__INITIAL_LOCALE__", escapeHtml(initialLocale))
          .replaceAll("__LANDING_HEADLINE__", landingHeadline)
          .replaceAll("__LANDING_MENTION__", landingMention)
          .replaceAll("__LANDING_MENTION_HIDDEN__", landingMention ? "" : "hidden")
          .replaceAll("__LANDING_BOOTSTRAP__", landingBootstrap);
        const etag = buildEtag({
          siteUrl,
          siteHost,
          initialLocale,
          storefrontSettings,
          contents
        });
        if (readIfNoneMatchHeader(request) === etag) {
          response.writeHead(304, {
            ...buildPublicMarketingPageHeaders(MIME_TYPES[extension] ?? "application/octet-stream"),
            ...buildPublicHtmlCacheHeaders(etag)
          });
          response.end();
          return true;
        }

        response.writeHead(200, {
          ...buildPublicMarketingPageHeaders(MIME_TYPES[extension] ?? "application/octet-stream"),
          ...buildPublicHtmlCacheHeaders(etag)
        });
        response.end(contents);
        return true;
      }

      if (relativePath === "checkout/index.html" || relativePath === "install/index.html") {
        const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        const siteUrl = resolvePublicOrigin(request, requestUrl);
        const siteHost = new URL(siteUrl).host;
        const landingMeta = resolveLandingMeta(siteHost);
        const initialLocale = resolveInitialLandingLocale(request, requestUrl);
        const contents = (await loadCachedTextTemplate(absolutePath))
          .replaceAll("__SITE_TITLE__", escapeHtml(landingMeta.title))
          .replaceAll("__SITE_DESCRIPTION__", escapeHtml(landingMeta.description))
          .replaceAll("__SITE_URL__", escapeHtml(siteUrl))
          .replaceAll("__SITE_HOST__", escapeHtml(siteHost))
          .replaceAll("__INITIAL_LOCALE__", escapeHtml(initialLocale));

        const etag = buildEtag({
          relativePath,
          siteUrl,
          siteHost,
          initialLocale,
          contents
        });
        if (readIfNoneMatchHeader(request) === etag) {
          response.writeHead(304, {
            ...buildPublicMarketingPageHeaders(MIME_TYPES[extension] ?? "application/octet-stream"),
            ...buildPublicHtmlCacheHeaders(etag)
          });
          response.end();
          return true;
        }

        response.writeHead(200, {
          ...buildPublicMarketingPageHeaders(MIME_TYPES[extension] ?? "application/octet-stream"),
          ...buildPublicHtmlCacheHeaders(etag)
        });
        response.end(contents);
        return true;
      }

      if (relativePath === "scrapbook/index.html") {
        const contents = await readFile(absolutePath);
        response.writeHead(200, buildPublicMarketingPageHeaders(MIME_TYPES[extension] ?? "application/octet-stream"));
        response.end(contents);
        return true;
      }

      if (relativePath === "admin/index.html") {
        const contents = await readFile(absolutePath);
        response.writeHead(200, buildAdminPageHeaders(MIME_TYPES[extension] ?? "application/octet-stream"));
        response.end(contents);
        return true;
      }

      const contents = await readFile(absolutePath);
      response.writeHead(200, buildStaticAssetHeaders(MIME_TYPES[extension] ?? "application/octet-stream"));
      response.end(contents);
      return true;
    } catch {
      // try next candidate
    }
  }

  return false;
}

function mapPaymentMethodInput(input: Partial<PaymentMethod>, existing?: PaymentMethod): PaymentMethod {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name: safeText(input.name) || existing?.name || "Unnamed method",
    summary: safeText(input.summary) || existing?.summary || "",
    instructions: safeText(input.instructions) || existing?.instructions || "",
    actionLabel: safeText(input.actionLabel) || existing?.actionLabel || "Continue",
    actionUrl: safeText(input.actionUrl) || existing?.actionUrl || "",
    enabled: typeof input.enabled === "boolean" ? input.enabled : existing?.enabled ?? true,
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : existing?.sortOrder ?? 999,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

function buildRuntimeConfigSecretState(config: WebRuntimeConfig): AdminRuntimeConfigSecretState {
  return {
    databasePostgresUrlConfigured: safeText(config.database.postgresUrl).length > 0,
    smtpPassConfigured: safeText(config.smtp.pass).length > 0
  };
}

function redactRuntimeConfigForAdmin(config: WebRuntimeConfig): WebRuntimeConfig {
  return {
    ...config,
    database: {
      ...config.database,
      postgresUrl: ""
    },
    smtp: {
      ...config.smtp,
      pass: ""
    }
  };
}

function getComparableDatabaseConfig(config: RuntimeDatabaseConfig): Record<string, string> {
  if (config.backend === "postgres") {
    return {
      backend: "postgres",
      postgresUrl: config.postgresUrl.trim(),
      tableName: config.tableName.trim(),
      storeKey: config.storeKey.trim()
    };
  }

  return {
    backend: "file",
    filePath: config.filePath.trim()
  };
}

function databaseConfigRequiresRestart(savedConfig: RuntimeDatabaseConfig, activeConfig: RuntimeDatabaseConfig): boolean {
  return JSON.stringify(getComparableDatabaseConfig(savedConfig)) !== JSON.stringify(getComparableDatabaseConfig(activeConfig));
}

function buildAdminRuntimeConfigResponse(savedConfig: WebRuntimeConfig, activeConfig = getRuntimeConfigSnapshot()): AdminRuntimeConfigResponse {
  const secretState = buildRuntimeConfigSecretState(savedConfig);
  const redactedConfig = redactRuntimeConfigForAdmin(savedConfig);
  const redactedActiveConfig = redactRuntimeConfigForAdmin(activeConfig);
  return {
    config: redactedConfig,
    activeDatabase: {
      ...redactedActiveConfig.database
    },
    databaseRestartRequired: databaseConfigRequiresRestart(savedConfig.database, activeConfig.database),
    secretState
  };
}

function mergeRuntimeConfig(current: WebRuntimeConfig, patch: RuntimeConfigPatch): WebRuntimeConfig {
  const nextDatabase = {
    ...current.database,
    ...(patch.database ?? {})
  };
  const databaseSecretAction = patch.secretActions?.databasePostgresUrl ?? "replace";
  if (patch.database && safeText(patch.database.postgresUrl) === "" && safeText(current.database.postgresUrl) && databaseSecretAction !== "clear") {
    nextDatabase.postgresUrl = current.database.postgresUrl;
  }
  if (databaseSecretAction === "clear") {
    nextDatabase.postgresUrl = "";
  }

  const nextSmtp = {
    ...current.smtp,
    ...(patch.smtp ?? {})
  };
  const smtpSecretAction = patch.secretActions?.smtpPass ?? "replace";
  if (patch.smtp && safeText(patch.smtp.pass) === "" && safeText(current.smtp.pass) && smtpSecretAction !== "clear") {
    nextSmtp.pass = current.smtp.pass;
  }
  if (smtpSecretAction === "clear") {
    nextSmtp.pass = "";
  }

  return normalizeRuntimeConfig({
    ...current,
    ...patch,
    database: nextDatabase,
    smtp: nextSmtp,
    collector: {
      ...current.collector,
      ...(patch.collector ?? {})
    }
  });
}

function toPublicErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof RequestError) {
    return error.statusCode >= 500 ? fallback : error.message;
  }

  return fallback;
}

function toPublicErrorStatus(error: unknown, fallback: number): number {
  return error instanceof RequestError ? error.statusCode : fallback;
}

function logUnexpectedError(context: string, error: unknown): void {
  console.error(`[threads-web] ${context}:`, error);
}

function mapStorefrontSettingsInput(
  input: Partial<StorefrontSettings>,
  existing: StorefrontSettings
): StorefrontSettings {
  const hasTextField = (key: keyof StorefrontSettings): boolean =>
    Object.prototype.hasOwnProperty.call(input, key);

  const resolveTextField = (
    key: keyof Pick<
      StorefrontSettings,
      "productName" | "headline" | "subheadline" | "priceLabel" | "priceValue" | "supportEmail" | "includedUpdates"
    >
  ): string => {
    if (!hasTextField(key)) {
      return existing[key];
    }

    return safeText(input[key]);
  };

  const heroNotesInput = Array.isArray(input.heroNotes) ? input.heroNotes : null;
  const heroNotes = heroNotesInput
    ? heroNotesInput.map((note) => safeText(note)).filter(Boolean)
    : existing.heroNotes;

  const faqsInput = Array.isArray(input.faqs) ? input.faqs : null;
  const faqs = faqsInput
    ? faqsInput
        .map((candidate, index) => ({
          id: safeText(candidate?.id) || existing.faqs[index]?.id || crypto.randomUUID(),
          question: safeText(candidate?.question),
          answer: safeText(candidate?.answer)
        }))
        .filter((candidate) => candidate.question && candidate.answer)
    : existing.faqs;

  return {
    productName: resolveTextField("productName"),
    headline: resolveTextField("headline"),
    subheadline: resolveTextField("subheadline"),
    priceLabel: resolveTextField("priceLabel"),
    priceValue: resolveTextField("priceValue"),
    supportEmail: resolveTextField("supportEmail"),
    includedUpdates: resolveTextField("includedUpdates"),
    heroNotes: heroNotesInput ? heroNotes : existing.heroNotes,
    faqs: faqsInput ? faqs : existing.faqs
  };
}

function appendWebhookHistory(
  data: WebDatabase,
  provider: PaymentProvider,
  kind: "webhook_processed" | "webhook_ignored" | "webhook_rejected",
  reason: WebhookReason,
  orderId: string | null,
  message: string,
  paymentMethodId: string | null,
  licenseId: string | null,
  eventId: string | null = null
): void {
  appendHistory(data, {
    kind,
    message,
    orderId,
    paymentMethodId,
    licenseId,
    webhookProvider: provider,
    webhookEventId: eventId,
    webhookReason: reason
  });
}

function parseOptionalDate(raw: string | undefined | null): string | null {
  const text = safeText(raw ?? "").trim();
  if (!text) {
    return null;
  }

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) {
    throw new RequestError(400, "Invalid expiry date format.");
  }

  return new Date(parsed).toISOString();
}

function normalizeBillingCycle(value: string | null | undefined): BillingCycle {
  return value === "monthly" ? "monthly" : "yearly";
}

function deriveLicenseExpiry(billingCycle: BillingCycle | null | undefined, issuedAtIso: string): string {
  const issuedAt = new Date(issuedAtIso);
  if (normalizeBillingCycle(billingCycle) === "monthly") {
    issuedAt.setMonth(issuedAt.getMonth() + 1);
  } else {
    issuedAt.setFullYear(issuedAt.getFullYear() + 1);
  }

  return issuedAt.toISOString();
}

async function issueLicenseForOrder(
  data: WebDatabase,
  order: PurchaseOrder,
  provider: string | null,
  expiresAt: string | null
): Promise<{ license: LicenseRecord; emailDraft: EmailDeliveryDraft; order: PurchaseOrder; issued: boolean }> {
  if (order.status === "key_issued" && order.issuedLicenseId) {
    const existing = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
    if (!existing) {
      throw new RequestError(409, "Issued license record was not found.");
    }

    return { license: existing, emailDraft: buildDeliveryDraft(order, existing), order, issued: false };
  }

  if (order.status !== "payment_confirmed" && order.status !== "pending") {
    throw new RequestError(409, "Order must be payment_confirmed before issuing a key.");
  }

  const now = new Date().toISOString();
  if (order.status === "pending") {
    order.status = "payment_confirmed";
    order.paidAt = now;
  }

  const effectiveExpiresAt = expiresAt ?? deriveLicenseExpiry(order.billingCycle ?? "yearly", now);
  const token = await signProLicenseToken(order.buyerEmail, effectiveExpiresAt);
  const license: LicenseRecord = {
    id: crypto.randomUUID(),
    orderId: order.id,
    holderName: order.buyerName,
    holderEmail: order.buyerEmail,
    token,
    tokenPreview: buildTokenPreview(token),
    issuedAt: now,
    expiresAt: effectiveExpiresAt,
    revokedAt: null,
    status: "active"
  };

  order.status = "key_issued";
  order.updatedAt = now;
  order.paidAt ??= now;
  order.issuedLicenseId = license.id;
  order.deliveryStatus = "ready_to_send";
  if (provider) {
    order.paymentProvider = provider;
  }

  upsertLicense(data, license);
  appendHistory(data, {
    kind: "license_issued",
    message: `Issued Plus key for ${order.buyerEmail}`,
    orderId: order.id,
    paymentMethodId: order.paymentMethodId,
    licenseId: license.id
  });

  return { license, emailDraft: buildDeliveryDraft(order, license), order, issued: true };
}

async function tryAutoSendEmail(
  order: PurchaseOrder,
  license: LicenseRecord
): Promise<{ sent: boolean; error: string | null }> {
  if (!isMailerConfigured()) {
    return { sent: false, error: null };
  }

  try {
    const draft = buildDeliveryDraft(order, license);
    await sendDeliveryEmail(draft);
    return { sent: true, error: null };
  } catch (error) {
    logUnexpectedError("auto email delivery failed", error);
    return { sent: false, error: "Email delivery failed." };
  }
}

async function handleCreateOrder(
  request: IncomingMessage,
  response: ServerResponse,
  config: ServerConfig
): Promise<void> {
  const body = await parseJsonBody<{
    buyerName?: string;
    buyerEmail?: string;
    billingCycle?: BillingCycle | null;
    paymentMethodId?: string;
    note?: string;
  }>(request, config.maxBodyBytes);

  const buyerName = safeText(body.buyerName);
  const buyerEmail = normalizeEmail(safeText(body.buyerEmail));
  const billingCycle = normalizeBillingCycle(body.billingCycle ?? "yearly");
  const paymentMethodId = safeText(body.paymentMethodId);
  const note = safeText(body.note);

  if (!buyerName || !buyerEmail || !paymentMethodId) {
    badRequest(response, "Name, email, and payment method are required.");
    return;
  }

  if (!isValidEmail(buyerEmail)) {
    badRequest(response, "A valid email address is required.");
    return;
  }

  const { order, paymentMethod } = await withDatabaseTransaction(async (data) => {
    const paymentMethod = data.paymentMethods.find((method) => method.id === paymentMethodId && method.enabled);
    if (!paymentMethod) {
      throw new RequestError(400, "The selected payment method is not available.");
    }

    const timestamp = new Date().toISOString();
    const order: PurchaseOrder = {
      id: crypto.randomUUID(),
      buyerName,
      buyerEmail,
      billingCycle,
      paymentMethodId,
      paymentReference: crypto.randomUUID(),
      status: "pending",
      note,
      createdAt: timestamp,
      updatedAt: timestamp,
      paidAt: null,
      issuedLicenseId: null,
      deliveryStatus: "not_sent"
    };

    upsertOrder(data, order);
    appendHistory(data, {
      kind: "order_created",
      message: `New order request from ${buyerEmail}`,
      orderId: order.id,
      paymentMethodId,
      licenseId: null
    });

    return { order, paymentMethod };
  });

  json(response, 201, {
    order,
    paymentMethod
  });
}

async function handlePublicLicenseRoute(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig
): Promise<void> {
  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }

  const body = await parseJsonBody<{
    token?: string;
    deviceId?: string;
    deviceLabel?: string;
  }>(request, config.maxBodyBytes);
  const token = safeText(body.token);
  const deviceId = safeText(body.deviceId);
  const deviceLabel = safeText(body.deviceLabel) || "Unknown device";

  if (!token || !deviceId) {
    badRequest(response, "token and deviceId are required.");
    return;
  }

  if (pathname === "/api/public/licenses/activate") {
    const result = await withDatabaseTransaction(async (data) => await activateLicenseSeat(data, token, deviceId, deviceLabel));
    json(response, result.ok ? 200 : result.reason === "seat_limit" ? 409 : 403, result);
    return;
  }

  if (pathname === "/api/public/licenses/status") {
    const result = await withDatabaseTransaction(async (data) => await getLicenseSeatStatus(data, token, deviceId, deviceLabel));
    json(response, result.ok ? 200 : result.reason === "activation_required" ? 409 : 403, result);
    return;
  }

  if (pathname === "/api/public/licenses/release") {
    const result = await withDatabaseTransaction(async (data) => await releaseLicenseSeat(data, token, deviceId));
    json(response, 200, result);
    return;
  }

  notFound(response);
}

async function handlePublicNotionRoute(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const locale = resolveRequestLocale(request, requestUrl);
  const msg = tServer(locale);

  if (pathname === "/api/public/notion/oauth/callback") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const code = safeText(requestUrl.searchParams.get("code"));
    const state = safeText(requestUrl.searchParams.get("state"));
    const error = safeText(requestUrl.searchParams.get("error"));
    if (error) {
      html(response, 400, renderNotionCallbackPage(locale, msg.notionFailedHeading, `${error} ${msg.notionCloseHint}`));
      return;
    }

    if (!code || !state) {
      html(response, 400, renderNotionCallbackPage(locale, msg.notionFailedHeading, `${msg.notionMissingParams} ${msg.notionCloseHint}`));
      return;
    }

    try {
      await withDatabaseTransaction(async (data) => {
        await completeNotionAuth(data, state, code, publicOrigin);
      });
      html(response, 200, renderNotionCallbackPage(locale, msg.notionConnectedHeading, msg.notionConnectedBody, true));
    } catch (oauthError) {
      html(
        response,
        400,
        renderNotionCallbackPage(
          locale,
          msg.notionFailedHeading,
          `${oauthError instanceof Error ? oauthError.message : msg.notionUnexpected} ${msg.notionCloseHint}`
        )
      );
    }
    return;
  }

  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }

  const body = await parseJsonBody<{
    token?: string;
    deviceId?: string;
    deviceLabel?: string;
    parentType?: "page" | "data_source";
    query?: string;
    targetId?: string;
    targetLabel?: string;
    targetUrl?: string;
    locale?: string;
    post?: unknown;
    notion?: {
      uploadMedia?: boolean;
      parentType?: "page" | "data_source";
    };
    includeImages?: boolean;
    aiResult?: AiOrganizationResult | null;
    aiWarning?: string | null;
  }>(request, config.maxBodyBytes);

  const token = safeText(body.token);
  const deviceId = safeText(body.deviceId);
  const deviceLabel = safeText(body.deviceLabel) || "Unknown device";
  if (!token || !deviceId) {
    badRequest(response, "token and deviceId are required.");
    return;
  }

  try {
    if (pathname === "/api/public/notion/oauth/start") {
      const result = await withDatabaseTransaction(async (data) => {
        await validateNotionClient(data, token, deviceId, deviceLabel);
        return await createNotionAuthStart(data, token, deviceId, deviceLabel, publicOrigin);
      });
      json(response, 200, result);
      return;
    }

    const notionContext = await withDatabaseTransaction(async (data) => {
      return await validateNotionClient(data, token, deviceId, deviceLabel);
    });

    if (pathname === "/api/public/notion/connection") {
      const result = await withDatabaseTransaction(async (data) => {
        return getNotionConnectionSummary(data, notionContext.tokenHash, notionContext.deviceId);
      });
      json(response, 200, result);
      return;
    }

    if (pathname === "/api/public/notion/disconnect") {
      const result = await withDatabaseTransaction(async (data) => {
        return disconnectNotionConnection(data, notionContext.tokenHash, notionContext.deviceId);
      });
      json(response, 200, result);
      return;
    }

    if (pathname === "/api/public/notion/locations/search") {
      const parentType = body.parentType === "data_source" ? "data_source" : "page";
      const result = await withDatabaseTransaction(async (data) => {
        return await searchNotionLocations(data, notionContext.tokenHash, notionContext.deviceId, parentType, safeText(body.query) || "");
      });
      json(response, 200, { results: result });
      return;
    }

    if (pathname === "/api/public/notion/locations/select") {
      const parentType = body.parentType === "data_source" ? "data_source" : "page";
      const targetId = safeText(body.targetId);
      const targetLabel = safeText(body.targetLabel);
      const targetUrl = safeText(body.targetUrl);
      if (!targetId || !targetLabel || !targetUrl) {
        badRequest(response, "targetId, targetLabel, and targetUrl are required.");
        return;
      }

      const result = await withDatabaseTransaction(async (data) => {
        return await selectNotionLocation(data, notionContext.tokenHash, notionContext.deviceId, parentType, targetId, targetLabel, targetUrl);
      });
      json(response, 200, result);
      return;
    }

    if (pathname === "/api/public/notion/save") {
      const locale = normalizeLocale(body.locale, "ko");
      const post = body.post as ExtractedPost | undefined;
      if (!post || typeof post !== "object") {
        badRequest(response, "post is required.");
        return;
      }

      const result = await withDatabaseTransaction(async (data) => {
        return await savePostThroughNotionConnection(data, notionContext.tokenHash, notionContext.deviceId, {
          locale,
          post,
          includeImages: Boolean(body.includeImages),
          uploadMedia: Boolean(body.notion?.uploadMedia),
          aiResult: (body.aiResult as AiOrganizationResult | null | undefined) ?? null,
          aiWarning: typeof body.aiWarning === "string" ? body.aiWarning : null
        });
      });
      json(response, 200, result);
      return;
    }
  } catch (routeError) {
    json(response, 400, {
      error: toPublicErrorMessage(routeError, "Unexpected Notion error.")
    });
    return;
  }

  notFound(response);
}

async function handlePublicBotRoute(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig,
  collector: BotMentionCollector
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const secureCookie = publicOrigin.startsWith("https://");
  const locale = resolveRequestLocale(request, requestUrl);
  const msg = tServer(locale);

  response.setHeader("cache-control", "no-store");

  if (pathname === "/api/public/bot/config") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    json(response, 200, getBotPublicConfig());
    return;
  }

  if (pathname === "/api/public/bot/oauth/start") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    try {
      const result = await startBotOauthFromStore(publicOrigin);
      if (requestUrl.searchParams.get("redirect") === "1") {
        response.writeHead(302, {
          location: result.authorizeUrl,
          "cache-control": "no-store"
        });
        response.end();
        return;
      }
      json(response, 200, result);
    } catch (error) {
      badRequest(response, toPublicErrorMessage(error, msg.threadsSigninStartError));
    }
    return;
  }

  if (pathname === "/api/public/bot/oauth/bridge") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    try {
      const result = await startBotOauthFromStore(publicOrigin);
      const bridgeMarkup = renderOauthBridgePage(result.authorizeUrl, result.botHandle, result.pollToken, publicOrigin, locale);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(bridgeMarkup);
    } catch (error) {
      badRequest(response, toPublicErrorMessage(error, msg.threadsSigninStartError));
    }
    return;
  }

  if (pathname === "/api/public/bot/oauth/poll") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const rawPollToken = safeText(requestUrl.searchParams.get("token"));
    if (!rawPollToken) {
      json(response, 400, { status: "expired" });
      return;
    }

    const pollResult = await pollBotOauthSessionFromStore(rawPollToken);
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify(pollResult));
    return;
  }

  if (pathname === "/api/public/bot/oauth/activate") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const rawCode = safeText(requestUrl.searchParams.get("code"));
    const redirectUrl = new URL("/scrapbook", publicOrigin);

    if (!rawCode) {
      redirectUrl.searchParams.set("authError", msg.threadsSigninCodeError);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }

    const activationResult = await activateBotOauthSessionFromStore(rawCode);
    if (!activationResult) {
      redirectUrl.searchParams.set("authError", msg.threadsSigninUnexpected);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }

    appendSetCookie(response, buildSessionCookie(activationResult.sessionToken, secureCookie));
    redirectUrl.searchParams.set("connected", "1");
    response.writeHead(302, { location: redirectUrl.toString() });
    response.end();
    return;
  }

  if (pathname === "/api/public/bot/oauth/callback") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const providerError = safeText(requestUrl.searchParams.get("error"));
    const providerErrorDescription = safeText(requestUrl.searchParams.get("error_description"));
    const rawState = safeText(requestUrl.searchParams.get("state"));
    const code = safeText(requestUrl.searchParams.get("code"));
    const redirectUrl = new URL("/scrapbook", publicOrigin);

    if (providerError) {
      if (rawState) {
        await failBotOauthSessionFromStore(rawState);
      }
      redirectUrl.searchParams.set("authError", providerErrorDescription || providerError);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }

    if (!rawState || !code) {
      redirectUrl.searchParams.set("authError", msg.threadsSigninCodeError);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }

    try {
      const session = await completeBotOauthFromStore(rawState, code, publicOrigin);
      appendSetCookie(response, buildSessionCookie(session.sessionToken, secureCookie));
      redirectUrl.searchParams.set("connected", "1");
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    } catch (error) {
      await failBotOauthSessionFromStore(rawState);
      redirectUrl.searchParams.set(
        "authError",
        toPublicErrorMessage(error, msg.threadsSigninUnexpected)
      );
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
  }

  if (pathname === "/api/public/bot/extension/link/start") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const linkState = safeText(requestUrl.searchParams.get("state"));
    const redirectUrl = new URL("/scrapbook", publicOrigin);
    if (!rawSession) {
      redirectUrl.searchParams.set("authError", "Sign in to Threads Archive scrapbook first.");
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }

    try {
      const link = await createExtensionLinkCodeFromStore(rawSession, linkState);
      redirectUrl.searchParams.set("extensionLinked", "1");
      redirectUrl.hash = new URLSearchParams({
        state: linkState,
        code: link.code
      }).toString();
      response.writeHead(302, {
        location: redirectUrl.toString(),
        "cache-control": "no-store"
      });
      response.end();
      return;
    } catch (error) {
      redirectUrl.searchParams.set(
        "authError",
        toPublicErrorMessage(error, "Could not link the extension.")
      );
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
  }

  const archiveMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)\.md$/);
  if (archiveMatch) {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    try {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      const { filename, markdownContent } = await readBotArchiveMarkdownFromStore(
        rawSession,
        archiveMatch[1] ?? ""
      );
      response.writeHead(200, {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`
      });
      response.end(markdownContent);
      return;
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Unexpected archive export error.")
      });
      return;
    }
  }

  const archiveZipMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)\.zip$/);
  if (archiveZipMatch) {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    try {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      const { filename, content } = await readBotArchiveZipFromStore(rawSession, [
        archiveZipMatch[1] ?? ""
      ]);
      response.writeHead(200, {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "content-length": String(content.byteLength)
      });
      response.end(content);
      return;
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Unexpected archive ZIP export error.")
      });
      return;
    }
  }

  if (pathname === "/api/public/bot/session") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const state = await buildPublicBotSessionResponse(rawSession, collector);
    refreshActiveBotSessionCookie(response, rawSession, secureCookie, state.authenticated);
    json(response, 200, state);
    return;
  }

  if (pathname === "/api/public/bot/cloud/save") {
    json(response, 410, {
      error: "Legacy cloud save is no longer supported. Reconnect the extension and use the current cloud save flow."
    });
    return;
  }

  if (pathname === "/api/public/bot/plus") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await readScrapbookPlusStateFromStore(rawSession);
      refreshActiveBotSessionCookie(response, rawSession, secureCookie, state.authenticated);
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not load scrapbook state.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/plus/activate") {
    if ((request.method ?? "GET") !== "POST") {
      methodNotAllowed(response);
      return;
    }

    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody<{ token?: string }>(request, config.maxBodyBytes);

    try {
      const state = await activateScrapbookPlusForSessionFromStore(rawSession, safeText(body.token));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not activate Plus for this scrapbook account.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/plus/clear") {
    if ((request.method ?? "GET") !== "POST") {
      methodNotAllowed(response);
      return;
    }

    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await clearScrapbookPlusForSessionFromStore(rawSession);
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not remove Plus from this scrapbook account.")
      });
    }
    return;
  }

  if ((request.method ?? "GET") !== "POST") {
    const archiveDeleteMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)$/);
    if ((request.method ?? "GET") === "DELETE" && archiveDeleteMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      try {
        const state = await deleteArchiveFromStore(
          rawSession,
          decodeURIComponent(archiveDeleteMatch[1] ?? "")
        );
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not delete the archive.")
        });
      }
      return;
    }

    const archivePatchMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)$/);
    if ((request.method ?? "GET") === "PATCH" && archivePatchMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      const body = await parseJsonBody<{ noteText?: string; title?: string; tags?: string[] }>(request, config.maxBodyBytes);
      const patch: {
        noteText?: string;
        title?: string;
        tags?: string[];
      } = {};
      if (Object.prototype.hasOwnProperty.call(body, "noteText")) {
        patch.noteText = typeof body.noteText === "string" ? body.noteText : "";
      }
      if (Object.prototype.hasOwnProperty.call(body, "title")) {
        patch.title = typeof body.title === "string" ? body.title : "";
      }
      if (Object.prototype.hasOwnProperty.call(body, "tags")) {
        patch.tags = Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string") : [];
      }
      try {
        const state = await updateArchiveFromStore(
          rawSession,
          decodeURIComponent(archivePatchMatch[1] ?? ""),
          patch
        );
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not update the archive.")
        });
      }
      return;
    }

    const watchlistDeleteMatch = pathname.match(/^\/api\/public\/bot\/watchlists\/([^/]+)$/);
    if ((request.method ?? "GET") === "DELETE" && watchlistDeleteMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      try {
        const state = await deleteWatchlistFromStore(rawSession, decodeURIComponent(watchlistDeleteMatch[1] ?? ""));
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not delete the watchlist.")
        });
      }
      return;
    }

    const searchDeleteMatch = pathname.match(/^\/api\/public\/bot\/searches\/([^/]+)$/);
    if ((request.method ?? "GET") === "DELETE" && searchDeleteMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      try {
        const state = await deleteSearchMonitorFromStore(rawSession, decodeURIComponent(searchDeleteMatch[1] ?? ""));
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not delete the search monitor.")
        });
      }
      return;
    }

    methodNotAllowed(response);
    return;
  }

  if (pathname === "/api/public/bot/sync") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const state = await buildPublicBotSessionResponse(rawSession, collector);
    if (!state.authenticated || !state.user) {
      unauthorized(response);
      return;
    }

    try {
      await collector.syncNow("user_sync");
      const nextState = await buildPublicBotSessionResponse(rawSession, collector);
      const workspace = await readScrapbookPlusStateFromStore(rawSession);
      json(response, 200, {
        ...nextState,
        workspace
      });
    } catch (error) {
      json(response, 502, {
        error: toPublicErrorMessage(error, "Could not sync the latest mentions.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/logout") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    await revokeBotSessionFromStore(rawSession);
    appendSetCookie(response, buildClearedSessionCookie(secureCookie));
    json(response, 200, { ok: true });
    return;
  }

  if (pathname === "/api/public/bot/watchlists") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody<{
      targetHandle?: string;
      includeText?: string | null;
      excludeText?: string | null;
      mediaTypes?: string[] | null;
      autoArchive?: boolean | null;
      digestCadence?: "off" | "daily" | "weekly" | null;
    }>(request, config.maxBodyBytes);

    try {
      const state = await createWatchlistFromStore(rawSession, {
        targetHandle: body.targetHandle ?? "",
        includeText: body.includeText ?? null,
        excludeText: body.excludeText ?? null,
        mediaTypes: body.mediaTypes ?? [],
        autoArchive: body.autoArchive ?? false,
        digestCadence: body.digestCadence ?? "off"
      });
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not save the watchlist.")
      });
    }
    return;
  }

  const watchlistSyncMatch = pathname.match(/^\/api\/public\/bot\/watchlists\/([^/]+)\/sync$/);
  if (watchlistSyncMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await syncWatchlistFromStore(rawSession, decodeURIComponent(watchlistSyncMatch[1] ?? ""));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not sync the watchlist.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/searches") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody<{
      query?: string;
      authorHandle?: string | null;
      excludeHandles?: string[] | string | null;
      autoArchive?: boolean | null;
      searchType?: "top" | "recent" | null;
    }>(request, config.maxBodyBytes);

    const excludeHandles = Array.isArray(body.excludeHandles)
      ? body.excludeHandles
      : typeof body.excludeHandles === "string"
        ? body.excludeHandles.split(",")
        : [];

    try {
      const state = await createSearchMonitorFromStore(rawSession, {
        query: body.query ?? "",
        authorHandle: body.authorHandle ?? null,
        excludeHandles,
        autoArchive: body.autoArchive ?? false,
        searchType: body.searchType ?? "recent"
      });
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not save the keyword search.")
      });
    }
    return;
  }

  const searchRunMatch = pathname.match(/^\/api\/public\/bot\/searches\/([^/]+)\/run$/);
  if (searchRunMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await runSearchMonitorFromStore(rawSession, decodeURIComponent(searchRunMatch[1] ?? ""));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not run the keyword search.")
      });
    }
    return;
  }

  const searchArchiveMatch = pathname.match(/^\/api\/public\/bot\/search-results\/([^/]+)\/archive$/);
  if (searchArchiveMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await archiveSearchResultFromStore(rawSession, decodeURIComponent(searchArchiveMatch[1] ?? ""));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not archive the keyword search result.")
      });
    }
    return;
  }

  const searchDismissMatch = pathname.match(/^\/api\/public\/bot\/search-results\/([^/]+)\/dismiss$/);
  if (searchDismissMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await dismissSearchResultFromStore(rawSession, decodeURIComponent(searchDismissMatch[1] ?? ""));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not dismiss the keyword search result.")
      });
    }
    return;
  }

  const trackedArchiveMatch = pathname.match(/^\/api\/public\/bot\/tracked-posts\/([^/]+)\/archive$/);
  if (trackedArchiveMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await archiveTrackedPostFromStore(rawSession, decodeURIComponent(trackedArchiveMatch[1] ?? ""));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not archive the tracked post.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/insights/refresh") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await refreshInsightsFromStore(rawSession);
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not refresh insights.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/insights/views" && request.method === "POST") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody<{
      name?: string | null;
      insightProps?: {
        highlightId: string;
        highlightParams: Record<string, string | number>;
        localeAtSave: string;
        tier: string;
        score: number;
      } | null;
    }>(request, config.maxBodyBytes);
    try {
      const state = await saveInsightsViewFromStore(rawSession, body.name ?? null, body.insightProps ?? null);
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not save the insight card.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/insights/archive") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody<{ postId?: string }>(request, config.maxBodyBytes);
    try {
      const state = await archiveTrackedInsightPostFromStore(rawSession, safeText(body.postId));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not archive the insight post.")
      });
    }
    return;
  }

  const insightsViewDeleteMatch = pathname.match(/^\/api\/public\/bot\/insights\/views\/([^/]+)$/);
  if (insightsViewDeleteMatch && request.method === "DELETE") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await deleteInsightsViewFromStore(rawSession, decodeURIComponent(insightsViewDeleteMatch[1] ?? ""));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not delete the insight card.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/archives.zip") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody<{ ids?: string[] }>(request, config.maxBodyBytes);

    try {
      const { filename, content } = await readBotArchiveZipFromStore(
        rawSession,
        Array.isArray(body?.ids) ? body.ids : []
      );
      response.writeHead(200, {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "content-length": String(content.byteLength)
      });
      response.end(content);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not build scrapbook ZIP export.")
      });
    }
    return;
  }

  if (pathname === "/api/public/bot/ingest") {
    try {
      validateBotIngestRequest(readHeader(request.headers, "authorization"));
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Unauthorized bot ingest request.")
      });
      return;
    }

    const body = await parseJsonBody<BotIngestPayload>(request, config.maxBodyBytes);
    try {
      const result = await withDatabaseTransaction((data) => ingestBotMention(data, body));
      json(response, result.matched ? 200 : 202, result);
    } catch (error) {
      badRequest(response, toPublicErrorMessage(error, "Could not archive mention payload."));
    }
    return;
  }

  notFound(response);
}

async function handlePublicWebhook(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig
): Promise<void> {
  const providerMatch = pathname.match(/^\/api\/public\/webhooks\/([^/]+)$/);
  if (!providerMatch) {
    methodNotAllowed(response);
    return;
  }

  const provider = parsePaymentProvider(providerMatch[1]);
  if (!provider) {
    notFound(response);
    return;
  }

  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }

  const { value: rawPayload, rawText } = await readJsonBody<unknown>(request, config.maxBodyBytes);
  const webhookHints = buildWebhookHints(provider, rawPayload);
  const payloadHash = buildWebhookPayloadHash(rawText);
  try {
    await verifyWebhookAuth(provider, request.headers, rawText, rawPayload);
  } catch (error) {
    if (error instanceof RequestError) {
      await withDatabaseTransaction(async (data) => {
        const ledgerEvent = recordWebhookEventAttempt(data, {
          provider,
          eventId: webhookHints.eventId,
          payloadHash
        });
        markWebhookEventOutcome(ledgerEvent, {
          status: "rejected",
          reason: "signature_rejected",
          responseStatusCode: error.statusCode
        });
        appendWebhookHistory(
          data,
          provider,
          "webhook_rejected",
          "signature_rejected",
          null,
          `Webhook signature rejected.`,
          null,
          null,
          webhookHints.eventId
        );
      });
    }

    throw error;
  }

  const result = await withDatabaseTransaction(async (data) => {
    const hints = webhookHints;
    const ledgerEvent = recordWebhookEventAttempt(data, {
      provider,
      eventId: hints.eventId,
      payloadHash
    });
    if (isProcessedWebhookDuplicate(ledgerEvent)) {
      const duplicateOrder = ledgerEvent?.orderId
        ? data.orders.find((candidate) => candidate.id === ledgerEvent.orderId) ?? null
        : null;
      const duplicateLicense = ledgerEvent?.licenseId
        ? data.licenses.find((candidate) => candidate.id === ledgerEvent.licenseId) ?? null
        : null;
      markWebhookEventOutcome(ledgerEvent, {
        status: "processed",
        reason: "already_processed",
        orderId: duplicateOrder?.id ?? null,
        paymentMethodId: duplicateOrder?.paymentMethodId ?? null,
        licenseId: duplicateLicense?.id ?? null,
        responseStatusCode: 200
      });
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "already_processed",
        duplicateOrder?.id ?? null,
        "Webhook duplicate ignored via event ledger.",
        duplicateOrder?.paymentMethodId ?? null,
        duplicateLicense?.id ?? null,
        hints.eventId
      );
      return {
        ok: true as const,
        status: 200,
        reason: "already_processed",
        provider,
        paid: true,
        webhookReason: "already_processed",
        webhookProvider: provider,
        order: duplicateOrder ? { id: duplicateOrder.id, status: duplicateOrder.status } : undefined,
        license: duplicateLicense
      };
    }

    const order = resolveOrderForWebhook(data, provider, hints);

    if (!order) {
      markWebhookEventOutcome(ledgerEvent, {
        status: "ignored",
        reason: "order_not_found",
        responseStatusCode: 404
      });
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "order_not_found",
        null,
        `Webhook received but no matching pending/paid order found.`,
        null,
        null,
        hints.eventId
      );
      return {
        ok: false as const,
        status: 404,
        provider,
        paid: hints.paid,
        reason: "order_not_found",
        webhookProvider: provider,
        webhookReason: "order_not_found"
      };
    }

    if (!hints.paid) {
      markWebhookEventOutcome(ledgerEvent, {
        status: "ignored",
        reason: "payment_not_completed",
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        responseStatusCode: 200
      });
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "payment_not_completed",
        order.id,
        "Webhook received but payment status was not complete.",
        order.paymentMethodId,
        null,
        hints.eventId
      );
      return {
        ok: false as const,
        status: 200,
        provider,
        paid: false,
        reason: "payment_not_completed",
        webhookProvider: provider,
        webhookReason: "payment_not_completed",
        webhookEventId: hints.eventId
      };
    }

    const now = new Date().toISOString();
    if (hints.eventId && order.paymentProviderEventId === hints.eventId && order.status === "key_issued") {
      markWebhookEventOutcome(ledgerEvent, {
        status: "processed",
        reason: "already_processed",
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: order.issuedLicenseId,
        responseStatusCode: 200
      });
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "already_processed",
        order.id,
        `Webhook duplicate ignored.`,
        order.paymentMethodId,
        order.issuedLicenseId,
        hints.eventId
      );
      return {
        ok: true as const,
        status: 200,
        reason: "already_processed",
        provider,
        paid: true,
        webhookReason: "already_processed",
        webhookProvider: provider,
        order: { id: order.id, status: order.status },
        license: data.licenses.find((candidate) => candidate.id === order.issuedLicenseId) ?? null
      };
    }

    order.paymentProvider = provider;
    if (hints.eventId) {
      order.paymentProviderEventId = hints.eventId;
    }
    order.updatedAt = now;

    if (order.status === "pending") {
      order.status = "payment_confirmed";
      order.paidAt = order.paidAt ?? now;
      appendHistory(data, {
        kind: "order_paid",
        message: `Payment confirmed for order ${order.id} via ${provider} webhook`,
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: null
      });
    }

    const issued = await issueLicenseForOrder(data, order, provider, null);
    appendWebhookHistory(
      data,
      provider,
      "webhook_processed",
      issued.issued ? "issued" : "no_change",
      order.id,
      `Webhook processed, key ${issued.issued ? "issued" : "already issued"} for order.`,
      order.paymentMethodId,
      issued.license.id,
      hints.eventId
    );
    markWebhookEventOutcome(ledgerEvent, {
      status: "processed",
      reason: issued.issued ? "issued" : "no_change",
      orderId: order.id,
      paymentMethodId: order.paymentMethodId,
      licenseId: issued.license.id,
      responseStatusCode: 200
    });

    // Auto-send email (non-blocking — update delivery status in a follow-up transaction)
    void tryAutoSendEmail(issued.order, issued.license).then(({ sent }) => {
      if (!sent) return;
      void withDatabaseTransaction(async (database) => {
        const orderToUpdate = database.orders.find((candidate) => candidate.id === order.id);
        if (orderToUpdate) {
          orderToUpdate.deliveryStatus = "sent";
        }
      });
    });

    return {
      ok: true,
      status: 200,
      reason: issued.issued ? "issued" : "already_issued",
      provider,
      paid: true,
      order: {
        id: order.id,
        status: order.status,
        paymentProviderEventId: order.paymentProviderEventId
      },
      license: issued.license
    };
  });

  if (!result.ok && result.status === 404) {
    json(response, 200, { ...result, status: "received" });
    return;
  }

  if (!result.ok && result.paid) {
    json(response, 200, { ...result, status: "received" });
    return;
  }

  json(response, result.status, { ...result, status: "ok" });
}

async function handleExtensionRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const bearerToken = readBearerToken(request);

  if (pathname === "/api/extension/link/complete") {
    if ((request.method ?? "GET") !== "POST") {
      methodNotAllowed(response);
      return;
    }

    const body = await parseJsonBody<{
      code?: string;
      state?: string;
      token?: string;
      deviceId?: string;
      deviceLabel?: string;
    }>(request, config.maxBodyBytes);
    try {
      const result = await completeExtensionLinkCodeFromStore(safeText(body.code), safeText(body.state));
      const token = safeText(body.token);
      const deviceId = safeText(body.deviceId);
      const deviceLabel = safeText(body.deviceLabel);
      if (token && deviceId && deviceLabel) {
        try {
          const activation = await withDatabaseTransaction((data) => getLicenseSeatStatus(data, token, deviceId, deviceLabel));
          if (activation.ok && activation.licenseId) {
            await syncExtensionCloudLicenseLinkFromStore(result.token, activation.licenseId, activation.activatedAt);
          }
        } catch {
          // Linking the scrapbook session should not fail just because plan sync was skipped.
        }
      }
      json(response, 200, result);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not complete the cloud connection.")
      });
    }
    return;
  }

  if (pathname === "/api/extension/cloud/status") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const token = safeText(readHeader(request.headers, "x-threads-license-token"));
    const deviceId = safeText(readHeader(request.headers, "x-threads-device-id"));
    const deviceLabel = safeText(readHeader(request.headers, "x-threads-device-label"));
    if (bearerToken && token && deviceId && deviceLabel) {
      try {
        const activation = await withDatabaseTransaction((data) => getLicenseSeatStatus(data, token, deviceId, deviceLabel));
        if (activation.ok && activation.licenseId) {
          await syncExtensionCloudLicenseLinkFromStore(bearerToken, activation.licenseId, activation.activatedAt);
        }
      } catch {
        // Keep cloud status readable even when plan sync cannot be refreshed.
      }
    }

    const status = await getExtensionCloudConnectionStatusFromStore(bearerToken);
    json(response, 200, status);
    return;
  }

  if (pathname === "/api/extension/cloud/link") {
    if ((request.method ?? "GET") !== "DELETE") {
      methodNotAllowed(response);
      return;
    }

    const status = await revokeExtensionCloudConnectionFromStore(bearerToken);
    json(response, 200, status);
    return;
  }

  if (pathname === "/api/extension/cloud/archives") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }

    if (!bearerToken) {
      json(response, 401, {
        error: "Connect the extension to Threads Archive scrapbook first."
      });
      return;
    }

    try {
      const rawLimit = requestUrl.searchParams.get("limit");
      const limit = rawLimit ? Number.parseInt(rawLimit, 10) : 10;
      const archives = await listExtensionCloudArchivesFromStore(bearerToken, publicOrigin, limit);
      json(response, 200, { archives });
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Could not load cloud archives.")
      });
    }
    return;
  }

  const cloudArchiveDeleteMatch = pathname.match(/^\/api\/extension\/cloud\/archive\/([^/]+)$/);
  if (cloudArchiveDeleteMatch) {
    if ((request.method ?? "GET") !== "DELETE") {
      methodNotAllowed(response);
      return;
    }

    if (!bearerToken) {
      json(response, 401, {
        error: "Connect the extension to Threads Archive scrapbook first."
      });
      return;
    }

    try {
      await deleteExtensionCloudArchiveFromStore(bearerToken, decodeURIComponent(cloudArchiveDeleteMatch[1] ?? ""));
      json(response, 200, { ok: true });
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Could not delete the cloud archive.")
      });
    }
    return;
  }

  if (pathname === "/api/extension/cloud/save") {
    if ((request.method ?? "GET") !== "POST") {
      methodNotAllowed(response);
      return;
    }

    const body = await parseJsonBody<{
      token?: string;
      deviceId?: string;
      deviceLabel?: string;
      locale?: string;
      post?: ExtractedPost;
      aiResult?: AiOrganizationResult | null;
      aiWarning?: string | null;
    }>(request, config.maxBodyBytes);
    const token = safeText(body.token);
    const deviceId = safeText(body.deviceId);
    const deviceLabel = safeText(body.deviceLabel);
    const post = body.post as ExtractedPost | undefined;

    if (!bearerToken) {
      json(response, 401, {
        error: "Connect the extension to Threads Archive scrapbook first."
      });
      return;
    }

    if (!token || !deviceId || !deviceLabel) {
      json(response, 403, {
        error: "A valid Plus activation is required for cloud save."
      });
      return;
    }

    if (!post || typeof post !== "object") {
      badRequest(response, "post is required.");
      return;
    }

    try {
      const activation = await withDatabaseTransaction((data) => getLicenseSeatStatus(data, token, deviceId, deviceLabel));
      if (!activation.ok) {
        throw new RequestError(403, describeProActivationFailure(activation.reason));
      }
      if (activation.licenseId) {
        await syncExtensionCloudLicenseLinkFromStore(bearerToken, activation.licenseId, activation.activatedAt);
      }

      const result = await saveCloudArchiveWithExtensionTokenFromStore(
        bearerToken,
        {
          post,
          aiResult: (body.aiResult as AiOrganizationResult | null | undefined) ?? null,
          aiWarning: typeof body.aiWarning === "string" ? body.aiWarning : null,
          locale: normalizeLocale(body.locale, "ko")
        },
        publicOrigin
      );
      json(response, 200, result);
    } catch (error) {
      const message = toPublicErrorMessage(error, "Could not save this post to cloud scrapbook.");
      const statusCode =
        error instanceof RequestError
          ? error.statusCode
          : /connect|expired/i.test(message)
            ? 401
            : 400;
      json(response, statusCode, {
        error: message
      });
    }
    return;
  }

  notFound(response);
}

async function handleAdminRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig,
  collector: BotMentionCollector
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const secureCookie = isSecureRequest(request, requestUrl);
  const method = request.method ?? "GET";

  response.setHeader("cache-control", "no-store");

  if (pathname === "/api/admin/session") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const session = readAdminSession(request, config.adminToken);
    json(response, 200, {
      authenticated: Boolean(session),
      expiresAt: session ? new Date(session.expiresAt).toISOString() : null
    });
    return;
  }

  if (pathname === "/api/admin/session/login") {
    if (method !== "POST") {
      methodNotAllowed(response);
      return;
    }

    const body = await parseJsonBody<{ token?: string }>(request, config.maxBodyBytes);
    const token = safeText(body.token);
    if (!token || !fixedLengthSecretsMatch(token, config.adminToken)) {
      unauthorized(response);
      return;
    }

    const nextSession = createAdminSessionToken(config.adminToken);
    appendSetCookie(response, buildAdminSessionCookie(nextSession, secureCookie));
    json(response, 200, {
      authenticated: true
    });
    return;
  }

  if (pathname === "/api/admin/session/logout") {
    if (method !== "POST") {
      methodNotAllowed(response);
      return;
    }

    appendSetCookie(response, buildClearedAdminSessionCookie(secureCookie));
    json(response, 200, {
      authenticated: false
    });
    return;
  }

  if (!isAdminAuthorized(request, config.adminToken)) {
    unauthorized(response);
    return;
  }

  if (pathname === "/api/admin/bot-collector") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    json(response, 200, collector.getStatus());
    return;
  }

  if (pathname === "/api/admin/bot-collector/sync") {
    if (method !== "POST") {
      methodNotAllowed(response);
      return;
    }

    try {
      const summary = await collector.syncNow("admin");
      json(response, 200, {
        status: collector.getStatus(),
        summary
      });
    } catch (error) {
      logUnexpectedError("admin collector sync failed", error);
      json(response, 502, {
        error: toPublicErrorMessage(error, "Could not sync mentions."),
        status: collector.getStatus()
      });
    }
    return;
  }

  if (pathname === "/api/admin/runtime-config") {
    if (method === "GET") {
      const savedConfig = getPersistedRuntimeConfigSnapshot();
      const activeConfig = getRuntimeConfigSnapshot();
      json(response, 200, buildAdminRuntimeConfigResponse(savedConfig, activeConfig));
      return;
    }

    if (method === "PUT") {
      const body = await parseJsonBody<RuntimeConfigPatch>(request, config.maxBodyBytes);
      const { savedConfig, activeConfig, databaseChanged } = await withExclusiveDatabaseReconfiguration(async () => {
        const currentActiveConfig = getRuntimeConfigSnapshot();
        const currentSavedConfig = getPersistedRuntimeConfigSnapshot();
        const nextSavedConfig = mergeRuntimeConfig(currentSavedConfig, body);
        assertSupportedProductionDatabaseConfig(nextSavedConfig.database, 400);
        const didDatabaseSettingsChange = databaseConfigRequiresRestart(nextSavedConfig.database, currentSavedConfig.database);
        const restartRequired = databaseConfigRequiresRestart(nextSavedConfig.database, currentActiveConfig.database);

        if (didDatabaseSettingsChange) {
          await testDatabaseConfig(nextSavedConfig.database);
          if (restartRequired) {
            const existingData = await loadDatabaseForConfig(currentActiveConfig.database);
            await saveDatabaseForConfig(existingData, nextSavedConfig.database);
          }
        }

        const persistedConfig = await saveRuntimeConfig(nextSavedConfig, {
          activate: !restartRequired
        });
        const nextActiveConfig = restartRequired
          ? activateRuntimeConfig({
              ...persistedConfig,
              database: currentActiveConfig.database
            })
          : persistedConfig;

        return {
          savedConfig: persistedConfig,
          activeConfig: nextActiveConfig,
          databaseChanged: didDatabaseSettingsChange
        };
      });
      const collectorStatus = collector.reloadConfig();
      json(response, 200, {
        ...buildAdminRuntimeConfigResponse(savedConfig, activeConfig),
        migrated: databaseChanged,
        collectorStatus
      });
      return;
    }
  }

  if (pathname === "/api/admin/runtime-config/database/test" && method === "POST") {
    const body = await parseJsonBody<{ database?: Partial<RuntimeDatabaseConfig> }>(request, config.maxBodyBytes);
    const candidate = mergeRuntimeConfig(getPersistedRuntimeConfigSnapshot(), {
      database: body.database ?? {}
    });
    assertSupportedProductionDatabaseConfig(candidate.database, 400);
    await testDatabaseConfig(candidate.database);
    const payload: RuntimeConfigTestResult = {
      ok: true,
      message:
        candidate.database.backend === "postgres"
          ? `Connected to ${candidate.database.tableName} (${candidate.database.storeKey}).`
          : `File backend directory is ready for ${candidate.database.filePath}.`
    };
    json(response, 200, payload);
    return;
  }

  if (pathname === "/api/admin/runtime-config/smtp/test" && method === "POST") {
    const body = await parseJsonBody<{ smtp?: Partial<RuntimeSmtpConfig> }>(request, config.maxBodyBytes);
    const candidate = mergeRuntimeConfig(getPersistedRuntimeConfigSnapshot(), {
      smtp: body.smtp ?? {}
    });
    await testDeliveryEmailConfig(candidate.smtp);
    const payload: RuntimeConfigTestResult = {
      ok: true,
      message: `SMTP connection verified for ${candidate.smtp.host}:${candidate.smtp.port}.`
    };
    json(response, 200, payload);
    return;
  }

  if (pathname === "/api/admin/dashboard") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const data = await loadDatabase();
    json(response, 200, {
      settings: data.settings,
      paymentMethods: [...data.paymentMethods].sort((left, right) => left.sortOrder - right.sortOrder),
      orders: data.orders,
      licenses: data.licenses,
      webhookEvents: listRecentWebhookEvents(data),
      recentRequests: listRecentRequestLogs(data.requestLogs),
      requestMetrics: buildRequestMetricsSummary(data.requestLogs),
      history: data.history,
      summary: buildDashboardSummary(data),
      revenueReport: buildRevenueReport(data),
      mailerConfigured: isMailerConfigured(),
      collectorStatus: collector.getStatus()
    });
    return;
  }

  if (pathname === "/api/admin/monitoring/overview") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    json(response, 200, await getMonitoringOverview());
    return;
  }

  if (pathname === "/api/admin/monitoring/incidents") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    json(response, 200, await listMonitoringIncidents());
    return;
  }

  if (pathname === "/api/admin/monitoring/run-now" && method === "POST") {
    json(response, 200, await runMonitoringNow());
    return;
  }

  const acknowledgeMonitoringMatch = pathname.match(/^\/api\/admin\/monitoring\/incidents\/([^/]+)\/ack$/);
  if (acknowledgeMonitoringMatch && method === "POST") {
    json(response, 200, await acknowledgeMonitoringIncident(acknowledgeMonitoringMatch[1]));
    return;
  }

  const resolveMonitoringMatch = pathname.match(/^\/api\/admin\/monitoring\/incidents\/([^/]+)\/resolve$/);
  if (resolveMonitoringMatch && method === "POST") {
    json(response, 200, await resolveMonitoringIncident(resolveMonitoringMatch[1]));
    return;
  }

  if (pathname === "/api/admin/payment-methods" && method === "POST") {
    const body = await parseJsonBody<Partial<PaymentMethod>>(request, config.maxBodyBytes);
    const paymentMethod = mapPaymentMethodInput(body);
    const created = await withDatabaseTransaction(async (data) => {
      upsertPaymentMethod(data, paymentMethod);
      appendHistory(data, {
        kind: "payment_method_created",
        message: `Created payment method ${paymentMethod.name}`,
        orderId: null,
        paymentMethodId: paymentMethod.id,
        licenseId: null
      });
      return {
        paymentMethod,
        publicStorefront: buildPublicStorefront(data)
      };
    });
    setPublicStorefrontSnapshotCache(created.publicStorefront);
    json(response, 201, created.paymentMethod);
    return;
  }

  if (pathname === "/api/admin/storefront-settings" && method === "PUT") {
    const body = await parseJsonBody<Partial<StorefrontSettings>>(request, config.maxBodyBytes);
    const updatedSettings = await withDatabaseTransaction(async (data) => {
      const nextSettings = mapStorefrontSettingsInput(body, data.settings);
      data.settings = nextSettings;
      return {
        settings: nextSettings,
        publicStorefront: buildPublicStorefront(data)
      };
    });
    setPublicStorefrontSnapshotCache(updatedSettings.publicStorefront);
    json(response, 200, updatedSettings.settings);
    return;
  }

  if (method !== "GET" && method !== "POST" && method !== "PUT") {
    methodNotAllowed(response);
    return;
  }

  const paymentMethodMatch = pathname.match(/^\/api\/admin\/payment-methods\/([^/]+)$/);
  if (paymentMethodMatch && method === "PUT") {
    const paymentMethodId = paymentMethodMatch[1];
    const body = await parseJsonBody<Partial<PaymentMethod>>(request, config.maxBodyBytes);

    const updated = await withDatabaseTransaction(async (data) => {
      const existing = data.paymentMethods.find((candidate) => candidate.id === paymentMethodId);
      if (!existing) {
        throw new RequestError(404, "Payment method not found.");
      }

      const updatedMethod = mapPaymentMethodInput(body, existing);
      upsertPaymentMethod(data, updatedMethod);
      appendHistory(data, {
        kind: "payment_method_updated",
        message: `Updated payment method ${updatedMethod.name}`,
        orderId: null,
        paymentMethodId: updatedMethod.id,
        licenseId: null
      });
      return {
        paymentMethod: updatedMethod,
        publicStorefront: buildPublicStorefront(data)
      };
    });

    setPublicStorefrontSnapshotCache(updated.publicStorefront);
    json(response, 200, updated.paymentMethod);
    return;
  }

  const markPaidMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/mark-paid$/);
  if (markPaidMatch && method === "POST") {
    const orderId = markPaidMatch[1];

    const updatedOrder = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }

      if (order.status !== "pending") {
        throw new RequestError(409, "Only pending orders can be marked as paid.");
      }

      const now = new Date().toISOString();
      order.status = "payment_confirmed";
      order.paidAt = now;
      order.updatedAt = now;
      appendHistory(data, {
        kind: "order_paid",
        message: `Marked order ${order.id} as paid`,
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: null
      });
      return order;
    });

    json(response, 200, updatedOrder);
    return;
  }

  const issueLicenseMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/issue-license$/);
  if (issueLicenseMatch && method === "POST") {
    const orderId = issueLicenseMatch[1];
    const body = await parseJsonBody<{ expiresAt?: string | null }>(request, config.maxBodyBytes);
    const expiresAt = parseOptionalDate(body.expiresAt);

    const result = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }

      return issueLicenseForOrder(data, order, null, expiresAt);
    });

    // Auto-send if SMTP is configured; update delivery status on success
    const { sent, error: sendError } = await tryAutoSendEmail(result.order, result.license);
    if (sent || sendError === null) {
      await withDatabaseTransaction(async (data) => {
        const order = data.orders.find((candidate) => candidate.id === orderId);
        if (order && sent) {
          order.deliveryStatus = "sent";
        }
      });
    }

    json(response, 201, { ...result, autoSent: sent, mailerError: sendError });
    return;
  }

  const reissueMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/reissue$/);
  if (reissueMatch && method === "POST") {
    const orderId = reissueMatch[1];
    const body = await parseJsonBody<{ expiresAt?: string | null }>(request, config.maxBodyBytes);
    const expiresAt = parseOptionalDate(body.expiresAt);

    const result = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }

      if (order.status !== "key_issued" && order.status !== "payment_confirmed") {
        throw new RequestError(409, "Order must have an existing key or confirmed payment to reissue.");
      }

      const now = new Date().toISOString();

      // Revoke existing license
      if (order.issuedLicenseId) {
        const existing = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
        if (existing && existing.status !== "revoked") {
          existing.status = "revoked";
          existing.revokedAt = now;
          appendHistory(data, {
            kind: "license_revoked",
            message: `Revoked Plus key for ${existing.holderEmail} (reissue)`,
            orderId: order.id,
            paymentMethodId: null,
            licenseId: existing.id
          });
        }
      }

      // Reset order status to allow re-issuance
      order.status = "payment_confirmed";
      order.issuedLicenseId = null;
      order.deliveryStatus = "not_sent";
      order.updatedAt = now;

      const effectiveExpiresAt = expiresAt ?? deriveLicenseExpiry(order.billingCycle ?? "yearly", now);
      const token = await signProLicenseToken(order.buyerEmail, effectiveExpiresAt);
      const license: LicenseRecord = {
        id: crypto.randomUUID(),
        orderId: order.id,
        holderName: order.buyerName,
        holderEmail: order.buyerEmail,
        token,
        tokenPreview: buildTokenPreview(token),
        issuedAt: now,
        expiresAt: effectiveExpiresAt,
        revokedAt: null,
        status: "active"
      };

      order.status = "key_issued";
      order.updatedAt = now;
      order.issuedLicenseId = license.id;
      order.deliveryStatus = "ready_to_send";

      upsertLicense(data, license);
      appendHistory(data, {
        kind: "license_issued",
        message: `Reissued Plus key for ${order.buyerEmail}`,
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: license.id
      });

      return { license, emailDraft: buildDeliveryDraft(order, license), order };
    });

    const { sent, error: sendError } = await tryAutoSendEmail(result.order, result.license);
    if (sent) {
      await withDatabaseTransaction(async (data) => {
        const order = data.orders.find((candidate) => candidate.id === orderId);
        if (order) {
          order.deliveryStatus = "sent";
        }
      });
    }

    json(response, 200, { ...result, autoSent: sent, mailerError: sendError });
    return;
  }

  const sendEmailMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/send-email$/);
  if (sendEmailMatch && method === "POST") {
    const orderId = sendEmailMatch[1];
    const data = await loadDatabase();
    const order = data.orders.find((candidate) => candidate.id === orderId);
    if (!order || !order.issuedLicenseId) {
      notFound(response);
      return;
    }

    const license = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
    if (!license) {
      notFound(response);
      return;
    }

    const draft = buildDeliveryDraft(order, license);
    await sendDeliveryEmail(draft);

    await withDatabaseTransaction(async (database) => {
      const orderToUpdate = database.orders.find((candidate) => candidate.id === orderId);
      if (orderToUpdate) {
        orderToUpdate.deliveryStatus = "sent";
      }
    });

    json(response, 200, { sent: true, to: draft.to });
    return;
  }

  const emailPreviewMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/email-preview$/);
  if (emailPreviewMatch && method === "GET") {
    const orderId = emailPreviewMatch[1];
    const data = await loadDatabase();
    const order = data.orders.find((candidate) => candidate.id === orderId);
    if (!order || !order.issuedLicenseId) {
      notFound(response);
      return;
    }

    const license = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
    if (!license) {
      notFound(response);
      return;
    }

    json(response, 200, buildDeliveryDraft(order, license));
    return;
  }

  const revokeLicenseMatch = pathname.match(/^\/api\/admin\/licenses\/([^/]+)\/revoke$/);
  if (revokeLicenseMatch && method === "POST") {
    const licenseId = revokeLicenseMatch[1];
    const revoked = await withDatabaseTransaction(async (data) => {
      const license = data.licenses.find((candidate) => candidate.id === licenseId);
      if (!license) {
        throw new RequestError(404, "License not found.");
      }

      if (license.status !== "revoked") {
        license.status = "revoked";
        license.revokedAt = new Date().toISOString();
        appendHistory(data, {
          kind: "license_revoked",
          message: `Revoked Plus key for ${license.holderEmail}`,
          orderId: license.orderId,
          paymentMethodId: null,
          licenseId: license.id
        });
      }

      return license;
    });

    json(response, 200, revoked);
    return;
  }

  notFound(response);
}

function toInternalError(error: unknown): string {
  return error instanceof RequestError && error.statusCode < 500 ? error.message : "Unexpected server error";
}

function toRequestMethod(request: IncomingMessage): string {
  return request.method ?? "GET";
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  config: ServerConfig,
  collector: BotMentionCollector,
  rateLimitState: RateLimitState
): Promise<void> {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `127.0.0.1:${config.port}`}`);
  } catch {
    badRequest(response, "Invalid request URL.");
    return;
  }

  const pathname = requestUrl.pathname;
  const method = toRequestMethod(request);
  const legacyRedirectUrl = shouldRedirectLegacyPublicPage(request, requestUrl);
  if (legacyRedirectUrl) {
    response.writeHead(308, { location: legacyRedirectUrl.toString() });
    response.end();
    return;
  }

  try {
    const mutationOriginPolicy = getMutationOriginPolicy(pathname, method);
    if (mutationOriginPolicy.enforce) {
      assertTrustedMutationOrigin(request, requestUrl, {
        allowExtensionOrigin: mutationOriginPolicy.allowExtensionOrigin
      });
    }
    if (pathname.startsWith("/api/admin/") || pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/admin/")) {
      assertAdminOriginAllowed(request, requestUrl);
    }
    assertRateLimit(rateLimitState, request, pathname, method);
    if (pathname.startsWith("/api/admin/")) {
      assertAdminIpAllowed(request);
    }

    if (pathname === "/health" && method === "GET") {
      json(response, 200, { status: "ok", service: "ss-threads-web" });
      return;
    }
    if (pathname === "/ready") {
      if (method !== "GET") {
        methodNotAllowed(response);
        return;
      }

      let databaseLoaded = false;
      try {
        await pingDatabase();
        databaseLoaded = true;
      } catch {
        databaseLoaded = false;
      }
      const trustProxy = buildTrustProxyDiagnostics(request);
      const publicOrderRateLimit = getRateLimitRule("/api/public/orders", "POST");
      const isReady = databaseLoaded && trustProxy.ready;

      json(response, isReady ? 200 : 503, {
        status: isReady ? "ready" : "not_ready",
        service: "ss-threads-web",
        databaseLoaded,
        trustProxy,
        security: {
          publicOrderRateLimit
        }
      });
      return;
    }

    if (pathname === "/api/public/storefront") {
      if (method !== "GET") {
        methodNotAllowed(response);
        return;
      }

      const publicStorefront = buildResolvedPublicStorefront(await getPublicStorefrontSnapshotCached());
      const etag = buildEtag(publicStorefront);
      if (readIfNoneMatchHeader(request) === etag) {
        response.writeHead(304, buildPublicApiCacheHeaders(etag));
        response.end();
        return;
      }

      json(response, 200, publicStorefront, buildPublicApiCacheHeaders(etag));
      return;
    }

    if (pathname === "/api/public/orders") {
      if (method !== "POST") {
        methodNotAllowed(response);
        return;
      }

      await handleCreateOrder(request, response, config);
      return;
    }

    if (
      pathname === "/privacy" ||
      pathname === "/terms" ||
      pathname === "/legal/data-deletion-status" ||
      pathname === "/api/public/threads/deauthorize" ||
      pathname === "/api/public/threads/delete"
    ) {
      await handleMetaThreadsUtilityRoutes(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/public/licenses/")) {
      await handlePublicLicenseRoute(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/public/bot/")) {
      await handlePublicBotRoute(request, response, pathname, config, collector);
      return;
    }

    if (pathname.startsWith("/api/public/notion/")) {
      await handlePublicNotionRoute(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/public/webhooks/")) {
      await handlePublicWebhook(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/extension/")) {
      await handleExtensionRoutes(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/admin/")) {
      await handleAdminRoutes(request, response, pathname, config, collector);
      return;
    }

    if (await serveStatic(request, response, pathname)) {
      return;
    }

    notFound(response);
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.statusCode >= 500) {
        logUnexpectedError("request failed", error);
      }
      json(response, error.statusCode, {
        error: error.statusCode >= 500 ? "Unexpected server error" : error.message
      });
      return;
    }

    logUnexpectedError("request failed", error);
    json(response, 500, { error: toInternalError(error) });
  }
}

function createWebRuntime(port?: number): {
  config: ServerConfig;
  collector: BotMentionCollector;
  requestHandler: (request: IncomingMessage, response: ServerResponse) => Promise<void>;
  shutdown: () => Promise<void>;
} {
  const config = resolveConfig(port);
  assertSupportedProductionDatabaseConfig(getRuntimeConfigSnapshot().database);
  resetPublicStorefrontSnapshotCache();
  const collector = createBotMentionCollector({
    runTransaction: withDatabaseTransaction,
    loadDatabase
  });
  const rateLimitState = createRateLimitState();
  ensureRateLimitBucketGcTimer(rateLimitState);
  configureMonitoringService({
    enableAutoRun: shouldAutostartMonitoring(),
    getCollectorStatus: () => collector.getStatus()
  });
  void getPublicStorefrontSnapshotCached().catch((error) => {
    logUnexpectedError("public storefront warmup failed", error);
  });

  return {
    config,
    collector,
    requestHandler: async (request: IncomingMessage, response: ServerResponse) => {
      const startedAt = new Date().toISOString();
      const startedAtMs = Date.now();
      const requestId = crypto.randomUUID();
      let pathname = "/";

      try {
        pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? `127.0.0.1:${config.port}`}`).pathname;
      } catch {
        pathname = "/invalid";
      }

      if (!response.headersSent) {
        response.setHeader("x-request-id", requestId);
      }

      try {
        await handleRequest(request, response, config, collector, rateLimitState);
      } finally {
        const completedAt = new Date().toISOString();
        const durationMs = Math.max(0, Date.now() - startedAtMs);
        const statusCode = response.statusCode || 500;
        const requestLog = {
          requestId,
          method: toRequestMethod(request),
          pathname,
          category: classifyRequestCategory(pathname),
          statusCode,
          durationMs,
          startedAt,
          completedAt
        } as const;

        emitStructuredRequestLog(requestLog);
        if (shouldPersistRequestLog(pathname)) {
          void withDatabaseTransaction(async (data) => {
            appendRequestLog(data, requestLog);
          }).catch((error) => {
            logUnexpectedError("request log write failed", error);
          });
        }
      }
    },
    shutdown: async () => {
      await collector.stop();
      stopMonitoringService();
      stopRateLimitBucketGcTimer(rateLimitState);
      await closeDatabaseConnections();
    }
  };
}

export function createWebRequestHandler(port?: number): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  return createWebRuntime(port).requestHandler;
}

export function startWebServer(port?: number): import("node:http").Server {
  const { config, collector, requestHandler, shutdown } = createWebRuntime(port);
  const server = createServer((request, response) => {
    void requestHandler(request, response);
  });
  server.requestTimeout = getServerRequestTimeoutMs();
  server.headersTimeout = Math.max(server.requestTimeout + 1_000, getServerHeadersTimeoutMs());
  server.keepAliveTimeout = getServerKeepAliveTimeoutMs();

  server.listen(config.port, config.host, () => {
    console.log(`ss-threads Plus web app running at http://${config.host}:${config.port}`);
  });

  if (shouldAutostartCollector()) {
    collector.start();
  }
  let shutdownPromise: Promise<void> | null = null;
  let runtimeClosed = false;

  const closeRuntime = async (): Promise<void> => {
    if (runtimeClosed) {
      return;
    }
    runtimeClosed = true;
    await shutdown();
  };

  const removeSignalHandlers = () => {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  };

  const onSignal = (signal: NodeJS.Signals): void => {
    if (shutdownPromise) {
      return;
    }

    console.log(`[threads-web] Received ${signal}. Starting graceful shutdown.`);
    const forceExitTimer = setTimeout(() => {
      console.error("[threads-web] Graceful shutdown timed out.");
      process.exit(1);
    }, getGracefulShutdownTimeoutMs());
    forceExitTimer.unref?.();

    shutdownPromise = new Promise<void>((resolve) => {
      server.close(async (error) => {
        try {
          if (error) {
            logUnexpectedError("server close failed", error);
            process.exitCode = 1;
          }
          await closeRuntime();
        } catch (shutdownError) {
          logUnexpectedError("graceful shutdown failed", shutdownError);
          process.exitCode = 1;
        } finally {
          clearTimeout(forceExitTimer);
          removeSignalHandlers();
          resolve();
        }
      });
    });
  };

  server.on("close", () => {
    void closeRuntime();
    removeSignalHandlers();
  });
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startWebServer();
}
