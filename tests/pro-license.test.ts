import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { validateProLicenseToken } from "../packages/extension/src/lib/license";

function base64UrlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function jsonB64Url(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return base64UrlEncode(bytes);
}

async function signProLicenseToken(payload: unknown): Promise<{ token: string; publicJwk: JsonWebKey }> {
  const subtle = webcrypto.subtle;
  const keyPair = (await subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair;

  // Token format used by the extension: `${base64url(payloadJson)}.${base64url(ES256(signature over payloadSegment))}`
  const payloadSegment = jsonB64Url(payload);
  const signature = new Uint8Array(
    await subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      keyPair.privateKey,
      new TextEncoder().encode(payloadSegment)
    )
  );

  const token = `${payloadSegment}.${base64UrlEncode(signature)}`;
  const publicJwk = (await subtle.exportKey("jwk", keyPair.publicKey)) as JsonWebKey;

  return { token, publicJwk };
}

test("offline Pro token verification accepts a valid token", async () => {
  const nowMs = Date.now();
  const { token, publicJwk } = await signProLicenseToken({
    plan: "pro",
    holder: "test-user",
    issuedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + 60 * 60_000).toISOString()
  });

  const result = await validateProLicenseToken(token, publicJwk);
  assert.equal(result.state, "valid");
  assert.equal(result.payload?.plan, "pro");
});

test("offline Pro token verification rejects expired token", async () => {
  const nowMs = Date.now();
  const { token, publicJwk } = await signProLicenseToken({
    plan: "pro",
    holder: null,
    issuedAt: new Date(nowMs - 120_000).toISOString(),
    expiresAt: new Date(nowMs - 60_000).toISOString()
  });

  const result = await validateProLicenseToken(token, publicJwk);
  assert.equal(result.state, "expired");
  assert.equal(result.payload?.plan, "pro");
});

test("offline Pro token verification rejects tampered payload", async () => {
  const nowMs = Date.now();
  const signed = await signProLicenseToken({
    plan: "pro",
    holder: null,
    issuedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + 60 * 60_000).toISOString()
  });

  const parts = signed.token.split(".");
  assert.equal(parts.length, 2);
  const tamperedPayload = jsonB64Url({
    plan: "pro",
    holder: "tampered",
    issuedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + 60 * 60_000).toISOString()
  });
  const tampered = `${tamperedPayload}.${parts[1]}`;

  const result = await validateProLicenseToken(tampered, signed.publicJwk);
  assert.equal(result.state, "invalid");
});
