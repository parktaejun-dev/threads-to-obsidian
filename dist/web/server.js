// src/web/server.ts
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFile as readFile3 } from "node:fs/promises";
import path2 from "node:path";
import { fileURLToPath } from "node:url";

// src/web/server/license-service.ts
import { readFile } from "node:fs/promises";
function toBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function parseJsonWebKey(raw, source) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON web key data in ${source}.`);
  }
}
async function readPrivateKeyJwk() {
  const inline = process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK?.trim();
  if (inline) {
    return parseJsonWebKey(inline, "THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK");
  }
  const explicitFile = process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE?.trim();
  if (!explicitFile) {
    throw new Error(
      "Missing license private key. Set THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK or THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE."
    );
  }
  const fileContents = await readFile(explicitFile, "utf8");
  return parseJsonWebKey(fileContents, explicitFile);
}
async function signProLicenseToken(holder, expiresAt) {
  const payload = {
    plan: "pro",
    holder,
    issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt
  };
  const payloadSegment = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const privateKey = await readPrivateKeyJwk();
  const signingKey = await crypto.subtle.importKey(
    "jwk",
    privateKey,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256"
    },
    signingKey,
    new TextEncoder().encode(payloadSegment)
  );
  return `${payloadSegment}.${toBase64Url(new Uint8Array(signature))}`;
}
function buildTokenPreview(token) {
  if (token.length <= 20) {
    return token;
  }
  return `${token.slice(0, 12)}...${token.slice(-8)}`;
}
function buildDeliveryDraft(order, license) {
  const subject = "Your Threads to Obsidian Pro key";
  const body = [
    `Hi ${order.buyerName || "there"},`,
    "",
    "Thanks for purchasing Threads to Obsidian Pro.",
    "",
    "Your Pro key:",
    license.token,
    "",
    "Activation steps:",
    "1. Open the extension settings page.",
    "2. Go to the Pro section.",
    "3. Paste the key and activate organization rules.",
    "",
    "Notes:",
    "- The key is meant for your use and should not be shared.",
    "- You can activate it on up to 3 devices. Remove it from an old device to free a seat.",
    "- Free saving still works without this key.",
    license.expiresAt ? `- This key expires on ${license.expiresAt}.` : "- This key currently has no expiration date.",
    "",
    "If you need help, reply to this email with the address you used for purchase.",
    "",
    "OX Corp"
  ].join("\n");
  return {
    to: order.buyerEmail,
    subject,
    body
  };
}

// src/web/server/activation-service.ts
import { createHash } from "node:crypto";

// src/extension/lib/license.ts
var PRO_LICENSE_PUBLIC_KEY = {
  kty: "EC",
  x: "sACfUItyPveEEvzTzJRpeoBqpsg7DBTcmidebSuJ29U",
  y: "lv68pNMuUrDUT0SgjTTmWigwcItjIBtRqE3pRxdSKLM",
  crv: "P-256"
};
var cachedPublicKey = null;
function toBase64UrlBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
function decodePayloadSegment(segment) {
  try {
    const bytes = toBase64UrlBytes(segment);
    const raw = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(raw);
    if (parsed.plan !== "pro" || typeof parsed.issuedAt !== "string") {
      return null;
    }
    if (parsed.expiresAt !== null && parsed.expiresAt !== void 0 && typeof parsed.expiresAt !== "string") {
      return null;
    }
    if (parsed.holder !== null && parsed.holder !== void 0 && typeof parsed.holder !== "string") {
      return null;
    }
    return {
      plan: "pro",
      holder: parsed.holder ?? null,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt ?? null
    };
  } catch {
    return null;
  }
}
function hasExpired(payload) {
  if (!payload.expiresAt) {
    return false;
  }
  const expiresAt = Date.parse(payload.expiresAt);
  if (!Number.isFinite(expiresAt)) {
    return true;
  }
  return expiresAt < Date.now();
}
async function importPublicKey(publicKey) {
  return await crypto.subtle.importKey(
    "jwk",
    publicKey,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["verify"]
  );
}
async function getPublicKey(publicKey = PRO_LICENSE_PUBLIC_KEY) {
  if (publicKey !== PRO_LICENSE_PUBLIC_KEY) {
    return await importPublicKey(publicKey);
  }
  cachedPublicKey ??= importPublicKey(publicKey);
  return await cachedPublicKey;
}
async function validateProLicenseToken(token, publicKey = PRO_LICENSE_PUBLIC_KEY) {
  const normalized = token.trim();
  if (!normalized) {
    return { state: "none", payload: null };
  }
  const [payloadSegment, signatureSegment, ...rest] = normalized.split(".");
  if (!payloadSegment || !signatureSegment || rest.length > 0) {
    return { state: "invalid", payload: null };
  }
  const payload = decodePayloadSegment(payloadSegment);
  if (!payload) {
    return { state: "invalid", payload: null };
  }
  try {
    const key = await getPublicKey(publicKey);
    const signatureBytes = toBase64UrlBytes(signatureSegment);
    const signature = new Uint8Array(signatureBytes.length);
    signature.set(signatureBytes);
    const data = new TextEncoder().encode(payloadSegment);
    const verified = await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: "SHA-256"
      },
      key,
      signature,
      data
    );
    if (!verified) {
      return { state: "invalid", payload: null };
    }
  } catch {
    return { state: "invalid", payload: null };
  }
  if (hasExpired(payload)) {
    return { state: "expired", payload };
  }
  return { state: "valid", payload };
}

// src/web/server/store.ts
import { mkdir, readFile as readFile2, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// src/web/lib/schema.ts
var DEFAULT_SETTINGS = {
  productName: "Threads to Obsidian",
  headline: "Threads\uB97C Obsidian\uC5D0 \uC800\uC7A5.",
  subheadline: "Free\uB294 \uC800\uC7A5. Pro\uB294 \uADDC\uCE59 + \uB0B4 LLM \uD0A4\uB85C \uC694\uC57D, \uD0DC\uADF8, frontmatter.",
  priceLabel: "Pro \uC5C5\uADF8\uB808\uC774\uB4DC",
  priceValue: "$19",
  supportEmail: "hello@oxcorp.ninja",
  includedUpdates: "1\uD68C \uACB0\uC81C \xB7 7\uC77C \uD658\uBD88 \xB7 \uC5C5\uB370\uC774\uD2B8 1\uB144",
  heroNotes: [
    "Free: \uD604\uC7AC \uAE00 \uC800\uC7A5 \xB7 \uC774\uBBF8\uC9C0 \uD3EC\uD568 \xB7 \uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
    "Pro: \uD30C\uC77C\uBA85 \uD328\uD134 \xB7 \uC800\uC7A5 \uACBD\uB85C \xB7 AI \uC694\uC57D \xB7 AI \uD0DC\uADF8",
    "Chrome \uD655\uC7A5\uC73C\uB85C \uBC14\uB85C \uC2DC\uC791 \xB7 \uD544\uC694\uD560 \uB54C\uB9CC Pro"
  ],
  faqs: [
    {
      id: "faq-1",
      question: "\uC800\uC7A5\uD558\uB824\uBA74 Pro\uAC00 \uD544\uC694\uD55C\uAC00\uC694?",
      answer: "\uC544\uB2C8\uC694. \uC800\uC7A5, \uC774\uBBF8\uC9C0 \uD3EC\uD568, \uC5F0\uC18D \uB2F5\uAE00, \uC911\uBCF5 \uAC74\uB108\uB700 \uBAA8\uB450 Free\uC5D0\uC11C \uAC00\uB2A5\uD569\uB2C8\uB2E4."
    },
    {
      id: "faq-2",
      question: "\uB204\uAC00 Pro\uB97C \uC0AC\uBA74 \uC88B\uB098\uC694?",
      answer: "\uC800\uC7A5\uD560 \uB54C \uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uC744 \uC9C1\uC811 \uC81C\uC5B4\uD558\uACE0, \uC790\uC2E0\uC758 LLM \uD0A4\uB85C \uC694\uC57D\xB7\uD0DC\uADF8\xB7frontmatter\uB97C \uBD99\uC774\uACE0 \uC2F6\uC740 \uBD84\uAED8 \uB9DE\uC2B5\uB2C8\uB2E4."
    },
    {
      id: "faq-3",
      question: "\uC694\uC57D\uC774\uB098 \uD0DC\uADF8 \uAC19\uC740 AI \uC815\uB9AC\uB294 \uB418\uB098\uC694?",
      answer: "\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C OpenAI \uD638\uD658 \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uC640 \uC790\uC2E0\uC758 \uD0A4\uB97C \uB123\uC73C\uBA74 \uC694\uC57D, \uD0DC\uADF8, \uCD94\uAC00 frontmatter\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4."
    },
    {
      id: "faq-4",
      question: "Pro \uD0A4\uB294 \uC5B4\uB5BB\uAC8C \uC804\uB2EC\uB418\uB098\uC694?",
      answer: "\uACB0\uC81C\uAC00 \uD655\uC778\uB418\uBA74 Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4."
    },
    {
      id: "faq-5",
      question: "\uD658\uBD88 \uC815\uCC45\uC740 \uC788\uB098\uC694?",
      answer: "\uAD6C\uB9E4 \uD6C4 7\uC77C \uB0B4\uC5D0 \uD658\uBD88 \uC694\uCCAD\uC744 \uBCF4\uB0B4\uBA74 \uD655\uC778 \uD6C4 \uCC98\uB9AC\uD569\uB2C8\uB2E4."
    }
  ]
};
function buildDefaultDatabase(now = (/* @__PURE__ */ new Date()).toISOString()) {
  return {
    settings: DEFAULT_SETTINGS,
    paymentMethods: [
      {
        id: "pm-stableorder",
        name: "Stableorder",
        summary: "KRW-friendly checkout with card and transfer options",
        instructions: "Open the Stableorder checkout page, pay using the order email, and return with the paid confirmation.",
        actionLabel: "Pay with Stableorder",
        actionUrl: "https://stableorder.com/",
        enabled: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-stripe",
        name: "Stripe Checkout",
        summary: "Global card checkout",
        instructions: "Open Stripe checkout, complete payment, and make sure the paid email matches your order email.",
        actionLabel: "Pay with Stripe",
        actionUrl: "https://checkout.stripe.com/",
        enabled: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-paypal",
        name: "PayPal",
        summary: "PayPal checkout for international buyers",
        instructions: "Use the PayPal checkout link, complete payment, and reply with the order email used in the request.",
        actionLabel: "Pay with PayPal",
        actionUrl: "https://www.paypal.com/checkout/home",
        enabled: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      }
    ],
    orders: [],
    licenses: [],
    activations: [],
    history: []
  };
}

// src/web/server/store.ts
var DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
function getDatabaseFilePath() {
  return process.env.THREADS_WEB_DB_FILE || DEFAULT_DB_FILE;
}
var databaseOperationChain = Promise.resolve();
async function withDatabaseLock(operation) {
  let operationResult;
  operationResult = databaseOperationChain.then(() => operation());
  databaseOperationChain = operationResult.then(() => void 0, () => void 0);
  return operationResult;
}
async function ensureParentDirectory(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}
async function loadDatabaseUnsafe(filePath = getDatabaseFilePath()) {
  try {
    const raw = await readFile2(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const fallback = buildDefaultDatabase();
    return {
      settings: fallback.settings,
      paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : fallback.paymentMethods,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
      activations: Array.isArray(parsed.activations) ? parsed.activations : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    const initial = buildDefaultDatabase();
    await saveDatabase(initial, filePath);
    return initial;
  }
}
async function saveDatabase(data, filePath = getDatabaseFilePath()) {
  await ensureParentDirectory(filePath);
  const tmpFilePath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const payload = JSON.stringify(data, null, 2);
  await writeFile(tmpFilePath, payload, "utf8");
  await rename(tmpFilePath, filePath);
}
async function loadDatabase(filePath = getDatabaseFilePath()) {
  return loadDatabaseUnsafe(filePath);
}
async function withDatabaseTransaction(handler, filePath = getDatabaseFilePath()) {
  return withDatabaseLock(async () => {
    const database = await loadDatabaseUnsafe(filePath);
    const output = await handler(database);
    await saveDatabase(database, filePath);
    return output;
  });
}
function buildDashboardSummary(data) {
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
function buildRevenueReport(data) {
  const priceUsd = Number.parseFloat(process.env.THREADS_PRICE_USD?.trim() ?? "19") || 19;
  const paidOrders = data.orders.filter(
    (order) => order.status === "payment_confirmed" || order.status === "key_issued"
  );
  const byMethodMap = /* @__PURE__ */ new Map();
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
  const byMonthMap = /* @__PURE__ */ new Map();
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
function buildPublicStorefront(data) {
  return {
    settings: data.settings,
    paymentMethods: [...data.paymentMethods].filter((method) => method.enabled).sort((left, right) => left.sortOrder - right.sortOrder)
  };
}
function appendHistory(data, event) {
  const historyEvent = {
    id: crypto.randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...event
  };
  data.history.unshift(historyEvent);
  data.history = data.history.slice(0, 200);
  return historyEvent;
}
function upsertPaymentMethod(data, method) {
  const index = data.paymentMethods.findIndex((candidate) => candidate.id === method.id);
  if (index >= 0) {
    data.paymentMethods[index] = method;
    return;
  }
  data.paymentMethods.push(method);
}
function upsertOrder(data, order) {
  const index = data.orders.findIndex((candidate) => candidate.id === order.id);
  if (index >= 0) {
    data.orders[index] = order;
    return;
  }
  data.orders.unshift(order);
}
function upsertLicense(data, license) {
  const index = data.licenses.findIndex((candidate) => candidate.id === license.id);
  if (index >= 0) {
    data.licenses[index] = license;
    return;
  }
  data.licenses.unshift(license);
}
function upsertActivation(data, activation) {
  const index = data.activations.findIndex((candidate) => candidate.id === activation.id);
  if (index >= 0) {
    data.activations[index] = activation;
    return;
  }
  data.activations.unshift(activation);
}

// src/web/server/activation-service.ts
var LICENSE_SEAT_LIMIT = 3;
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function getMatchingLicense(data, token) {
  return data.licenses.find((candidate) => candidate.token === token) ?? null;
}
function getActiveActivations(data, tokenHash) {
  return data.activations.filter((candidate) => candidate.tokenHash === tokenHash && candidate.status === "active");
}
function buildFailure(reason, holder, expiresAt, issuedAt, seatsUsed) {
  return {
    ok: false,
    reason,
    holder,
    expiresAt,
    issuedAt,
    seatLimit: LICENSE_SEAT_LIMIT,
    seatsUsed
  };
}
async function validateTokenAgainstServerState(data, token) {
  const validation = await validateProLicenseToken(token);
  if (validation.state === "invalid" || validation.state === "none") {
    return buildFailure("invalid", null, null, null, 0);
  }
  if (validation.state === "expired" || !validation.payload) {
    return buildFailure("expired", validation.payload?.holder ?? null, validation.payload?.expiresAt ?? null, validation.payload?.issuedAt ?? null, 0);
  }
  const license = getMatchingLicense(data, token);
  if (license?.status === "revoked") {
    return buildFailure("revoked", validation.payload.holder, validation.payload.expiresAt, validation.payload.issuedAt, 0);
  }
  return {
    tokenHash: hashToken(token),
    holder: validation.payload.holder,
    expiresAt: validation.payload.expiresAt,
    issuedAt: validation.payload.issuedAt,
    license
  };
}
async function activateLicenseSeat(data, token, deviceId, deviceLabel) {
  const validated = await validateTokenAgainstServerState(data, token);
  if ("reason" in validated) {
    return validated;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const activeActivations = getActiveActivations(data, validated.tokenHash);
  const existing = activeActivations.find((candidate) => candidate.deviceId === deviceId);
  if (existing) {
    existing.deviceLabel = deviceLabel;
    existing.lastValidatedAt = now;
    existing.releasedAt = null;
    existing.status = "active";
    upsertActivation(data, existing);
    return {
      ok: true,
      holder: validated.holder,
      expiresAt: validated.expiresAt,
      issuedAt: validated.issuedAt,
      seatLimit: LICENSE_SEAT_LIMIT,
      seatsUsed: activeActivations.length,
      activatedAt: existing.activatedAt,
      deviceId,
      deviceLabel
    };
  }
  if (activeActivations.length >= LICENSE_SEAT_LIMIT) {
    return buildFailure("seat_limit", validated.holder, validated.expiresAt, validated.issuedAt, activeActivations.length);
  }
  const activation = {
    id: crypto.randomUUID(),
    licenseId: validated.license?.id ?? null,
    tokenHash: validated.tokenHash,
    tokenPreview: buildTokenPreview(token),
    holder: validated.holder,
    deviceId,
    deviceLabel,
    activatedAt: now,
    lastValidatedAt: now,
    releasedAt: null,
    status: "active"
  };
  upsertActivation(data, activation);
  return {
    ok: true,
    holder: validated.holder,
    expiresAt: validated.expiresAt,
    issuedAt: validated.issuedAt,
    seatLimit: LICENSE_SEAT_LIMIT,
    seatsUsed: activeActivations.length + 1,
    activatedAt: activation.activatedAt,
    deviceId,
    deviceLabel
  };
}
async function getLicenseSeatStatus(data, token, deviceId, deviceLabel) {
  const validated = await validateTokenAgainstServerState(data, token);
  if ("reason" in validated) {
    return validated;
  }
  const activeActivations = getActiveActivations(data, validated.tokenHash);
  const existing = activeActivations.find((candidate) => candidate.deviceId === deviceId);
  if (!existing) {
    return buildFailure("activation_required", validated.holder, validated.expiresAt, validated.issuedAt, activeActivations.length);
  }
  existing.lastValidatedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (deviceLabel) {
    existing.deviceLabel = deviceLabel;
  }
  upsertActivation(data, existing);
  return {
    ok: true,
    holder: validated.holder,
    expiresAt: validated.expiresAt,
    issuedAt: validated.issuedAt,
    seatLimit: LICENSE_SEAT_LIMIT,
    seatsUsed: activeActivations.length,
    activatedAt: existing.activatedAt,
    deviceId: existing.deviceId,
    deviceLabel: existing.deviceLabel
  };
}
async function releaseLicenseSeat(data, token, deviceId) {
  const validation = await validateProLicenseToken(token);
  if (validation.state === "invalid" || validation.state === "none") {
    return { released: false };
  }
  const tokenHash = hashToken(token);
  const existing = getActiveActivations(data, tokenHash).find((candidate) => candidate.deviceId === deviceId);
  if (!existing) {
    return { released: false };
  }
  existing.status = "released";
  existing.releasedAt = (/* @__PURE__ */ new Date()).toISOString();
  existing.lastValidatedAt = existing.releasedAt;
  upsertActivation(data, existing);
  return { released: true };
}

// src/web/server/mailer.ts
import nodemailer from "nodemailer";
function readSmtpConfig() {
  const host = process.env.THREADS_SMTP_HOST?.trim();
  const user = process.env.THREADS_SMTP_USER?.trim();
  const pass = process.env.THREADS_SMTP_PASS?.trim();
  const from = process.env.THREADS_SMTP_FROM?.trim();
  if (!host || !user || !pass || !from) {
    return null;
  }
  const portRaw = process.env.THREADS_SMTP_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  const secure = process.env.THREADS_SMTP_SECURE?.trim().toLowerCase() === "true";
  return { host, port, secure, user, pass, from };
}
function isMailerConfigured() {
  return readSmtpConfig() !== null;
}
async function sendDeliveryEmail(draft) {
  const config = readSmtpConfig();
  if (!config) {
    throw new Error(
      "SMTP is not configured. Set THREADS_SMTP_HOST, THREADS_SMTP_USER, THREADS_SMTP_PASS, THREADS_SMTP_FROM."
    );
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });
  await transporter.sendMail({
    from: config.from,
    to: draft.to,
    subject: draft.subject,
    text: draft.body
  });
}

// src/web/server.ts
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
var DEFAULT_PORT = 4173;
var DEFAULT_MAX_BODY_BYTES = 1e6;
var MAX_ALLOWED_BODY_BYTES = 2e6;
var RequestError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
var MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};
var PROVIDER_METHOD_DEFAULT_IDS = {
  stableorder: "pm-stableorder",
  stripe: "pm-stripe",
  paypal: "pm-paypal"
};
var PROVIDER_WEBHOOK_SECRETS = {
  stableorder: "THREADS_WEBHOOK_SECRET_STABLEORDER",
  stripe: "THREADS_WEBHOOK_SECRET_STRIPE",
  paypal: "THREADS_WEBHOOK_SECRET_PAYPAL"
};
var PROVIDER_WEBHOOK_HEADERS = {
  stableorder: "x-stableorder-signature",
  stripe: "stripe-signature",
  paypal: "paypal-transmission-sig"
};
var PROVIDER_ACTION_URL_PATTERNS = {
  stableorder: /stableorder\.com/i,
  stripe: /stripe\.com/i,
  paypal: /paypal\.com/i
};
function trimEnv(name) {
  return process.env[name]?.trim();
}
function parsePort(raw, fallback) {
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new RequestError(500, `Invalid port in THREADS_WEB_PORT: ${raw}`);
  }
  return parsed;
}
function parsePortFromArg(port, envPort) {
  if (typeof port === "undefined") {
    return parsePort(envPort, DEFAULT_PORT);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RequestError(400, `Invalid server port argument: ${port}`);
  }
  return port;
}
function parseMaxBodyBytes(raw) {
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
function resolveConfig(portOverride) {
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
function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
function notFound(response) {
  json(response, 404, { error: "Not found" });
}
function unauthorized(response) {
  json(response, 401, { error: "Unauthorized" });
}
function badRequest(response, message) {
  json(response, 400, { error: message });
}
function methodNotAllowed(response) {
  json(response, 405, { error: "Method not allowed" });
}
function isAdminAuthorized(request, adminToken) {
  const auth = request.headers.authorization;
  return auth === `Bearer ${adminToken}`;
}
async function parseJsonBody(request, maxBytes) {
  const chunks = [];
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
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new RequestError(400, "Invalid JSON payload.");
  }
}
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function safeText(value) {
  return (value ?? "").trim();
}
function readHeader(headers, name) {
  const value = headers[name.toLowerCase()];
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return value[0]?.trim() ?? null;
}
function readForwardedValue(headers, name) {
  const value = readHeader(headers, name);
  if (!value) {
    return null;
  }
  return value.split(",")[0]?.trim() ?? null;
}
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function resolvePublicOrigin(request, requestUrl) {
  const configuredOrigin = trimEnv("THREADS_WEB_PUBLIC_ORIGIN");
  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {
    }
  }
  const forwardedProto = readForwardedValue(request.headers, "x-forwarded-proto");
  const forwardedHost = readForwardedValue(request.headers, "x-forwarded-host");
  const protocol = forwardedProto === "https" || forwardedProto === "http" ? forwardedProto : requestUrl.protocol.replace(/:$/, "");
  const host = forwardedHost || request.headers.host || requestUrl.host;
  return `${protocol}://${host}`;
}
function parsePaymentProvider(raw) {
  if (!raw) {
    return null;
  }
  if (raw === "stableorder" || raw === "stripe" || raw === "paypal") {
    return raw;
  }
  return null;
}
function toRecord(value) {
  if (value === null || typeof value !== "object") {
    return null;
  }
  return value;
}
function readString(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
function readNestedValue(root, path3) {
  let current = root;
  for (const segment of path3) {
    if (current === null || typeof current !== "object") {
      return void 0;
    }
    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10);
      if (Number.isNaN(index)) {
        return void 0;
      }
      return current[index];
    }
    const record = current;
    current = record[segment];
  }
  return current;
}
function pickFirst(...values) {
  for (const value of values) {
    const normalized = readString(value);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
}
function isCompletedStatus(status) {
  if (!status) {
    return false;
  }
  const normalized = status.trim().toLowerCase();
  return normalized === "paid" || normalized === "payment_succeeded" || normalized === "succeeded" || normalized === "completed" || normalized === "complete" || normalized === "captured" || normalized === "approved";
}
function secretsMatch(signature, secret) {
  const signatureBytes = Buffer.from(signature);
  const secretBytes = Buffer.from(secret);
  return signatureBytes.length === secretBytes.length && timingSafeEqual(signatureBytes, secretBytes);
}
function verifyWebhookAuth(provider, headers) {
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
function buildWebhookHints(provider, rawPayload) {
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
    const paymentStatus2 = pickFirst(
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
      paid: isCompletedStatus(paymentStatus2)
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
    const orderId2 = pickFirst(
      readString(readNestedValue(stripePayload, ["metadata", "threads_order_id"])),
      readString(readNestedValue(stripePayload, ["metadata", "order_id"])),
      readString(readNestedValue(stripePayload, ["metadata", "orderId"])),
      readString(readNestedValue(stripePayload, ["client_reference_id"])),
      readString(stripePayload.id)
    );
    const orderReference2 = pickFirst(readString(readNestedValue(stripePayload, ["metadata", "order_reference"])));
    const paymentStatus2 = pickFirst(
      type,
      readString(stripePayload.status),
      readString(stripePayload.payment_status)
    );
    return {
      orderId: orderId2,
      orderReference: orderReference2,
      email,
      eventId: pickFirst(readString(payload.id), readString(readNestedValue(payload, ["data", "id"]))),
      paid: isCompletedStatus(paymentStatus2) || type !== null && type.includes("succeeded") || type !== null && type.includes("completed")
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
    paid: isCompletedStatus(paymentStatus) || type !== null && type.includes("COMPLETED") || type !== null && type.includes("completed")
  };
}
function getProviderMethodIds(data, provider) {
  const matcher = PROVIDER_ACTION_URL_PATTERNS[provider];
  const byUrl = data.paymentMethods.filter((method) => matcher.test(method.actionUrl)).map((method) => method.id);
  if (byUrl.length > 0) {
    return byUrl;
  }
  const fallback = data.paymentMethods.find((method) => method.id === PROVIDER_METHOD_DEFAULT_IDS[provider]);
  return fallback ? [fallback.id] : [];
}
function resolveOrderForWebhook(data, provider, hints) {
  const candidateMethods = getProviderMethodIds(data, provider);
  const orderIdCandidates = [hints.orderId, hints.orderReference].map((candidate) => candidate).filter((candidate) => candidate !== null);
  const statusAllowed = /* @__PURE__ */ new Set(["pending", "payment_confirmed", "key_issued"]);
  const candidates = data.orders.filter(
    (order) => statusAllowed.has(order.status) && (candidateMethods.length === 0 || candidateMethods.includes(order.paymentMethodId))
  ).sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
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
  const emailMatch = candidates.filter((order) => order.buyerEmail === normalizeEmail(hints.email));
  if (emailMatch.length === 1) {
    return emailMatch[0];
  }
  if (emailMatch.length > 1) {
    return emailMatch[0];
  }
  return null;
}
function getStaticCandidates(urlPath) {
  const normalizedPath = path2.posix.normalize(decodeURIComponent(urlPath));
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
function resolveStaticPath(candidate) {
  const normalized = path2.normalize(candidate);
  if (normalized.includes("..")) {
    return null;
  }
  const absolutePath = path2.resolve(__dirname, normalized);
  const basePath = path2.resolve(__dirname);
  if (!absolutePath.startsWith(`${basePath}${path2.sep}`) && absolutePath !== basePath) {
    return null;
  }
  return absolutePath;
}
async function serveStatic(request, response, pathname) {
  for (const relativePath of getStaticCandidates(pathname)) {
    const absolutePath = resolveStaticPath(relativePath);
    if (!absolutePath) {
      continue;
    }
    try {
      const extension = path2.extname(absolutePath);
      if (relativePath === "landing/index.html") {
        const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        const siteUrl = resolvePublicOrigin(request, requestUrl);
        const siteHost = new URL(siteUrl).host;
        const contents2 = (await readFile3(absolutePath, "utf8")).replaceAll("__SITE_URL__", escapeHtml(siteUrl)).replaceAll("__SITE_HOST__", escapeHtml(siteHost));
        response.writeHead(200, {
          "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
        });
        response.end(contents2);
        return true;
      }
      const contents = await readFile3(absolutePath);
      response.writeHead(200, {
        "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
      });
      response.end(contents);
      return true;
    } catch {
    }
  }
  return false;
}
function mapPaymentMethodInput(input, existing) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
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
function appendWebhookHistory(data, provider, kind, reason, orderId, message, paymentMethodId, licenseId, eventId = null) {
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
function parseOptionalDate(raw) {
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
async function issueLicenseForOrder(data, order, provider, expiresAt) {
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
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (order.status === "pending") {
    order.status = "payment_confirmed";
    order.paidAt = now;
  }
  const token = await signProLicenseToken(order.buyerEmail, expiresAt);
  const license = {
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
async function tryAutoSendEmail(order, license) {
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
async function handleCreateOrder(request, response, config) {
  const body = await parseJsonBody(request, config.maxBodyBytes);
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
    const paymentMethod2 = data.paymentMethods.find((method) => method.id === paymentMethodId && method.enabled);
    if (!paymentMethod2) {
      throw new RequestError(400, "The selected payment method is not available.");
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const order2 = {
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
    upsertOrder(data, order2);
    appendHistory(data, {
      kind: "order_created",
      message: `New order request from ${buyerEmail}`,
      orderId: order2.id,
      paymentMethodId,
      licenseId: null
    });
    return { order: order2, paymentMethod: paymentMethod2 };
  });
  json(response, 201, {
    order,
    paymentMethod
  });
}
async function handlePublicLicenseRoute(request, response, pathname, config) {
  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }
  const body = await parseJsonBody(request, config.maxBodyBytes);
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
async function handlePublicWebhook(request, response, pathname, config) {
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
  const rawPayload = await parseJsonBody(request, config.maxBodyBytes);
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
        ok: false,
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
        ok: false,
        status: 200,
        provider,
        paid: false,
        reason: "payment_not_completed",
        webhookProvider: provider,
        webhookReason: "payment_not_completed",
        webhookEventId: hints.eventId
      };
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
        ok: true,
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
async function handleAdminRoutes(request, response, pathname, config) {
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
    const body = await parseJsonBody(request, config.maxBodyBytes);
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
    const body = await parseJsonBody(request, config.maxBodyBytes);
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
      const now = (/* @__PURE__ */ new Date()).toISOString();
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
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const expiresAt = parseOptionalDate(body.expiresAt);
    const result = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }
      return issueLicenseForOrder(data, order, null, expiresAt);
    });
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
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const expiresAt = parseOptionalDate(body.expiresAt);
    const result = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }
      if (order.status !== "key_issued" && order.status !== "payment_confirmed") {
        throw new RequestError(409, "Order must have an existing key or confirmed payment to reissue.");
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
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
      order.status = "payment_confirmed";
      order.issuedLicenseId = null;
      order.deliveryStatus = "not_sent";
      order.updatedAt = now;
      const token = await signProLicenseToken(order.buyerEmail, expiresAt);
      const license = {
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
        license.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
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
function toInternalError(error) {
  return error instanceof Error ? error.message : "Unexpected server error";
}
function toRequestMethod(request) {
  return request.method ?? "GET";
}
async function handleRequest(request, response, config) {
  let requestUrl;
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
function startWebServer(port) {
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
export {
  startWebServer
};
