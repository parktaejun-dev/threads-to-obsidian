import { readFile } from "node:fs/promises";

import type { EmailDeliveryDraft, LicenseRecord, PurchaseOrder } from "../lib/schema";

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

async function readPrivateKeyJwk(): Promise<JsonWebKey> {
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
