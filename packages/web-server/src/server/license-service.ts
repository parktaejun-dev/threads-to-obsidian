import { readFile } from "node:fs/promises";

import type { EmailDeliveryDraft, LicenseRecord, PurchaseOrder } from "@threads/web-schema";

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseJsonWebKey(raw: string, source: string): JsonWebKey {
  try {
    return JSON.parse(raw) as JsonWebKey;
  } catch {
    throw new Error(`Invalid JSON web key data in ${source}.`);
  }
}

const PRIVATE_KEY_ENV_NAME = "SS_THREADS_PRO_PRIVATE_JWK";
const PRIVATE_KEY_FILE_ENV_NAME = "SS_THREADS_PRO_PRIVATE_JWK_FILE";
const LEGACY_PRIVATE_KEY_ENV_NAME = "THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK";
const LEGACY_PRIVATE_KEY_FILE_ENV_NAME = "THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE";

async function readPrivateKeyJwk(): Promise<JsonWebKey> {
  const inline = process.env[PRIVATE_KEY_ENV_NAME]?.trim() || process.env[LEGACY_PRIVATE_KEY_ENV_NAME]?.trim();
  if (inline) {
    return parseJsonWebKey(
      inline,
      process.env[PRIVATE_KEY_ENV_NAME]?.trim() ? PRIVATE_KEY_ENV_NAME : LEGACY_PRIVATE_KEY_ENV_NAME
    );
  }

  const explicitFile = process.env[PRIVATE_KEY_FILE_ENV_NAME]?.trim() || process.env[LEGACY_PRIVATE_KEY_FILE_ENV_NAME]?.trim();
  if (!explicitFile) {
    throw new Error(
      `Missing license private key. Set ${PRIVATE_KEY_ENV_NAME} or ${PRIVATE_KEY_FILE_ENV_NAME}. Legacy THREADS_TO_OBSIDIAN_* names are still accepted.`
    );
  }

  const fileContents = await readFile(explicitFile, "utf8");
  return parseJsonWebKey(fileContents, explicitFile);
}

export async function signProLicenseToken(holder: string, expiresAt: string | null): Promise<string> {
  const payload = {
    plan: "pro",
    holder,
    issuedAt: new Date().toISOString(),
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

export function buildTokenPreview(token: string): string {
  if (token.length <= 20) {
    return token;
  }

  return `${token.slice(0, 12)}...${token.slice(-8)}`;
}

export function buildDeliveryDraft(order: PurchaseOrder, license: LicenseRecord): EmailDeliveryDraft {
  const cycleLabel = order.billingCycle === "monthly" ? "monthly" : "yearly";
  const subject = "Your SS Threads Plus key";
  const body = [
    `Hi ${order.buyerName || "there"},`,
    "",
    `Thanks for purchasing SS Threads Plus (${cycleLabel}).`,
    "",
    "Your Plus key:",
    license.token,
    "",
    "Activation steps:",
    "1. Open the extension settings page.",
    "2. Go to the Plus section.",
    "3. Paste the key and activate organization rules.",
    "4. In scrapbook, you can also paste the same key in the Plus panel to unlock the higher save/folder limits.",
    "",
    "Notes:",
    "- The key is meant for your use and should not be shared.",
    "- You can activate it on up to 3 devices. Remove it from an old device to free a seat.",
    "- Free keeps working without this key, but scrapbook stays limited to 100 saved posts and 5 folders.",
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
