import type { LicensePayload, LicenseState } from "./types";

export const PRO_LICENSE_PUBLIC_KEY: JsonWebKey = {
  kty: "EC",
  x: "sACfUItyPveEEvzTzJRpeoBqpsg7DBTcmidebSuJ29U",
  y: "lv68pNMuUrDUT0SgjTTmWigwcItjIBtRqE3pRxdSKLM",
  crv: "P-256"
};

export interface LicenseValidationResult {
  state: LicenseState;
  payload: LicensePayload | null;
}

let cachedPublicKey: Promise<CryptoKey> | null = null;

function toBase64UrlBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function decodePayloadSegment(segment: string): LicensePayload | null {
  try {
    const bytes = toBase64UrlBytes(segment);
    const raw = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(raw) as Partial<LicensePayload>;
    if (parsed.plan !== "pro" || typeof parsed.issuedAt !== "string") {
      return null;
    }

    if (parsed.expiresAt !== null && parsed.expiresAt !== undefined && typeof parsed.expiresAt !== "string") {
      return null;
    }

    if (parsed.holder !== null && parsed.holder !== undefined && typeof parsed.holder !== "string") {
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

function hasExpired(payload: LicensePayload): boolean {
  if (!payload.expiresAt) {
    return false;
  }

  const expiresAt = Date.parse(payload.expiresAt);
  if (!Number.isFinite(expiresAt)) {
    return true;
  }

  return expiresAt < Date.now();
}

async function importPublicKey(publicKey: JsonWebKey): Promise<CryptoKey> {
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

async function getPublicKey(publicKey = PRO_LICENSE_PUBLIC_KEY): Promise<CryptoKey> {
  if (publicKey !== PRO_LICENSE_PUBLIC_KEY) {
    return await importPublicKey(publicKey);
  }

  cachedPublicKey ??= importPublicKey(publicKey);
  return await cachedPublicKey;
}

export async function validateProLicenseToken(
  token: string,
  publicKey = PRO_LICENSE_PUBLIC_KEY
): Promise<LicenseValidationResult> {
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
