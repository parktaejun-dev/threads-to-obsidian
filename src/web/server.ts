import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PaymentMethod, PurchaseOrder } from "./lib/schema";
import { buildDeliveryDraft, buildTokenPreview, signProLicenseToken } from "./server/license-service";
import { activateLicenseSeat, getLicenseSeatStatus, releaseLicenseSeat } from "./server/activation-service";
import { isMailerConfigured, sendDeliveryEmail } from "./server/mailer";
import {
  appendHistory,
  buildDashboardSummary,
  buildPublicStorefront,
  buildRevenueReport,
  loadDatabase,
  upsertLicense,
  upsertOrder,
  upsertPaymentMethod,
  withDatabaseTransaction
} from "./server/store";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PORT = 4173;
const DEFAULT_MAX_BODY_BYTES = 1_000_000;
const MAX_ALLOWED_BODY_BYTES = 2_000_000;

interface ServerConfig {
  adminToken: string;
  maxBodyBytes: number;
  port: number;
}

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

const PROVIDER_METHOD_DEFAULT_IDS: Record<PaymentProvider, string> = {
  stableorder: "pm-stableorder",
  stripe: "pm-stripe",
  paypal: "pm-paypal"
};

const PROVIDER_WEBHOOK_SECRETS: Record<PaymentProvider, string> = {
  stableorder: "THREADS_WEBHOOK_SECRET_STABLEORDER",
  stripe: "THREADS_WEBHOOK_SECRET_STRIPE",
  paypal: "THREADS_WEBHOOK_SECRET_PAYPAL"
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

function trimEnv(name: string): string | undefined {
  return process.env[name]?.trim();
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

function resolveConfig(portOverride?: number): ServerConfig {
  const adminToken = trimEnv("THREADS_WEB_ADMIN_TOKEN");
  if (!adminToken) {
    throw new RequestError(500, "THREADS_WEB_ADMIN_TOKEN is required for web server startup.");
  }

  return {
    adminToken,
    maxBodyBytes: parseMaxBodyBytes(trimEnv("THREADS_WEB_MAX_BODY_BYTES")),
    port: parsePortFromArg(portOverride, trimEnv("THREADS_WEB_PORT"))
  };
}

function json(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
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

function isAdminAuthorized(request: IncomingMessage, adminToken: string): boolean {
  const auth = request.headers.authorization;
  return auth === `Bearer ${adminToken}`;
}

async function parseJsonBody<T>(request: IncomingMessage, maxBytes: number): Promise<T> {
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const binary = typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    totalBytes += binary.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestError(413, `Request body exceeds ${maxBytes} bytes.`);
    }
    chunks.push(binary);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new RequestError(400, "Invalid JSON payload.");
  }
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

function readForwardedValue(headers: IncomingMessage["headers"], name: string): string | null {
  const value = readHeader(headers, name);
  if (!value) {
    return null;
  }

  return value.split(",")[0]?.trim() ?? null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolvePublicOrigin(request: IncomingMessage, requestUrl: URL): string {
  const configuredOrigin = trimEnv("THREADS_WEB_PUBLIC_ORIGIN");
  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {
      // Ignore invalid explicit origin and derive from the current request instead.
    }
  }

  const forwardedProto = readForwardedValue(request.headers, "x-forwarded-proto");
  const forwardedHost = readForwardedValue(request.headers, "x-forwarded-host");
  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? forwardedProto
      : requestUrl.protocol.replace(/:$/, "");
  const host = forwardedHost || request.headers.host || requestUrl.host;
  return `${protocol}://${host}`;
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

function secretsMatch(signature: string, secret: string): boolean {
  const signatureBytes = Buffer.from(signature);
  const secretBytes = Buffer.from(secret);
  return signatureBytes.length === secretBytes.length && timingSafeEqual(signatureBytes, secretBytes);
}

function verifyWebhookAuth(provider: PaymentProvider, headers: IncomingMessage["headers"]): void {
  const secret = trimEnv(PROVIDER_WEBHOOK_SECRETS[provider]);
  if (!secret) {
    throw new RequestError(503, `Webhook secret is not configured for provider "${provider}".`);
  }

  const headerName = PROVIDER_WEBHOOK_HEADERS[provider];
  const signature = readHeader(headers, headerName);
  if (!signature) {
    throw new RequestError(401, "Webhook request missing signature header.");
  }

  if (!secretsMatch(signature, secret)) {
    throw new RequestError(401, "Invalid webhook signature.");
  }
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

function getProviderMethodIds(data: import("./lib/schema").WebDatabase, provider: PaymentProvider): string[] {
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
  data: import("./lib/schema").WebDatabase,
  provider: PaymentProvider,
  hints: WebhookHints
): import("./lib/schema").PurchaseOrder | null {
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

  if (normalizedPath === "/admin" || normalizedPath === "/admin/") {
    return ["admin/index.html"];
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

  const absolutePath = path.resolve(__dirname, normalized);
  const basePath = path.resolve(__dirname);
  if (!absolutePath.startsWith(`${basePath}${path.sep}`) && absolutePath !== basePath) {
    return null;
  }

  return absolutePath;
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
        const contents = (await readFile(absolutePath, "utf8"))
          .replaceAll("__SITE_URL__", escapeHtml(siteUrl))
          .replaceAll("__SITE_HOST__", escapeHtml(siteHost));

        response.writeHead(200, {
          "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
        });
        response.end(contents);
        return true;
      }

      const contents = await readFile(absolutePath);
      response.writeHead(200, {
        "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
      });
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

function appendWebhookHistory(
  data: import("./lib/schema").WebDatabase,
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

async function issueLicenseForOrder(
  data: import("./lib/schema").WebDatabase,
  order: import("./lib/schema").PurchaseOrder,
  provider: string | null,
  expiresAt: string | null
): Promise<{ license: import("./lib/schema").LicenseRecord; emailDraft: import("./lib/schema").EmailDeliveryDraft; order: import("./lib/schema").PurchaseOrder; issued: boolean }> {
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

  const token = await signProLicenseToken(order.buyerEmail, expiresAt);
  const license: import("./lib/schema").LicenseRecord = {
    id: crypto.randomUUID(),
    orderId: order.id,
    holderName: order.buyerName,
    holderEmail: order.buyerEmail,
    token,
    tokenPreview: buildTokenPreview(token),
    issuedAt: now,
    expiresAt,
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
    message: `Issued Pro key for ${order.buyerEmail}`,
    orderId: order.id,
    paymentMethodId: order.paymentMethodId,
    licenseId: license.id
  });

  return { license, emailDraft: buildDeliveryDraft(order, license), order, issued: true };
}

async function tryAutoSendEmail(
  order: import("./lib/schema").PurchaseOrder,
  license: import("./lib/schema").LicenseRecord
): Promise<{ sent: boolean; error: string | null }> {
  if (!isMailerConfigured()) {
    return { sent: false, error: null };
  }

  try {
    const draft = buildDeliveryDraft(order, license);
    await sendDeliveryEmail(draft);
    return { sent: true, error: null };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown mailer error" };
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
    paymentMethodId?: string;
    note?: string;
  }>(request, config.maxBodyBytes);

  const buyerName = safeText(body.buyerName);
  const buyerEmail = normalizeEmail(safeText(body.buyerEmail));
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

  const rawPayload = await parseJsonBody<unknown>(request, config.maxBodyBytes);
  const webhookHints = buildWebhookHints(provider, rawPayload);
  try {
    verifyWebhookAuth(provider, request.headers);
  } catch (error) {
    if (error instanceof RequestError) {
      await withDatabaseTransaction(async (data) => {
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
    const order = resolveOrderForWebhook(data, provider, hints);

    if (!order) {
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

async function handleAdminRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  config: ServerConfig
): Promise<void> {
  if (!isAdminAuthorized(request, config.adminToken)) {
    unauthorized(response);
    return;
  }

  const method = request.method ?? "GET";

  if (pathname === "/api/admin/dashboard") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }

    const data = await loadDatabase();
    json(response, 200, {
      ...buildPublicStorefront(data),
      orders: data.orders,
      licenses: data.licenses,
      history: data.history,
      summary: buildDashboardSummary(data),
      revenueReport: buildRevenueReport(data),
      mailerConfigured: isMailerConfigured()
    });
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
      return paymentMethod;
    });
    json(response, 201, created);
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
      return updatedMethod;
    });

    json(response, 200, updated);
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
            message: `Revoked Pro key for ${existing.holderEmail} (reissue)`,
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

      const token = await signProLicenseToken(order.buyerEmail, expiresAt);
      const license: import("./lib/schema").LicenseRecord = {
        id: crypto.randomUUID(),
        orderId: order.id,
        holderName: order.buyerName,
        holderEmail: order.buyerEmail,
        token,
        tokenPreview: buildTokenPreview(token),
        issuedAt: now,
        expiresAt,
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
        message: `Reissued Pro key for ${order.buyerEmail}`,
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
          message: `Revoked Pro key for ${license.holderEmail}`,
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
  return error instanceof Error ? error.message : "Unexpected server error";
}

function toRequestMethod(request: IncomingMessage): string {
  return request.method ?? "GET";
}

async function handleRequest(request: IncomingMessage, response: ServerResponse, config: ServerConfig): Promise<void> {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `127.0.0.1:${config.port}`}`);
  } catch {
    badRequest(response, "Invalid request URL.");
    return;
  }

  const pathname = requestUrl.pathname;
  const method = toRequestMethod(request);

  try {
    if (pathname === "/health" && method === "GET") {
      json(response, 200, { status: "ok", service: "threads-to-obsidian-web" });
      return;
    }
    if (pathname === "/ready") {
      if (method !== "GET") {
        methodNotAllowed(response);
        return;
      }

      const data = await loadDatabase();
      json(response, 200, {
        status: "ready",
        service: "threads-to-obsidian-web",
        databaseLoaded: Array.isArray(data.orders) && Array.isArray(data.paymentMethods)
      });
      return;
    }

    if (pathname === "/api/public/storefront") {
      if (method !== "GET") {
        methodNotAllowed(response);
        return;
      }

      const data = await loadDatabase();
      json(response, 200, buildPublicStorefront(data));
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

    if (pathname.startsWith("/api/public/licenses/")) {
      await handlePublicLicenseRoute(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/public/webhooks/")) {
      await handlePublicWebhook(request, response, pathname, config);
      return;
    }

    if (pathname.startsWith("/api/admin/")) {
      await handleAdminRoutes(request, response, pathname, config);
      return;
    }

    if (await serveStatic(request, response, pathname)) {
      return;
    }

    notFound(response);
  } catch (error) {
    if (error instanceof RequestError) {
      json(response, error.statusCode, { error: error.message });
      return;
    }

    json(response, 500, { error: toInternalError(error) });
  }
}

export function startWebServer(port?: number): import("node:http").Server {
  const config = resolveConfig(port);
  const server = createServer((request, response) => {
    void handleRequest(request, response, config);
  });

  server.listen(config.port, () => {
    console.log(`Threads Pro web app running at http://127.0.0.1:${config.port}`);
  });

  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startWebServer();
}
