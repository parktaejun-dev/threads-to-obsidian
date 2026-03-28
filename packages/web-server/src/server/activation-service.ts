import { createHash } from "node:crypto";

import { validateProLicenseToken } from "@threads/shared/license";
import type { LicenseActivationRecord, LicenseRecord, WebDatabase } from "@threads/web-schema";
import { buildTokenPreview } from "./license-service";
import { upsertActivation } from "./store";

export const LICENSE_SEAT_LIMIT = 3;

export type ActivationFailureReason = "invalid" | "expired" | "revoked" | "seat_limit" | "activation_required";

export interface ActivationSuccess {
  ok: true;
  holder: string | null;
  expiresAt: string | null;
  issuedAt: string;
  seatLimit: number;
  seatsUsed: number;
  activatedAt: string;
  deviceId: string;
  deviceLabel: string;
}

export interface ActivationFailure {
  ok: false;
  reason: ActivationFailureReason;
  holder: string | null;
  expiresAt: string | null;
  issuedAt: string | null;
  seatLimit: number;
  seatsUsed: number;
}

export type ActivationResult = ActivationSuccess | ActivationFailure;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getMatchingLicense(data: WebDatabase, token: string): LicenseRecord | null {
  return data.licenses.find((candidate) => candidate.token === token) ?? null;
}

function getActiveActivations(data: WebDatabase, tokenHash: string): LicenseActivationRecord[] {
  return data.activations.filter((candidate) => candidate.tokenHash === tokenHash && candidate.status === "active");
}

function buildFailure(
  reason: ActivationFailureReason,
  holder: string | null,
  expiresAt: string | null,
  issuedAt: string | null,
  seatsUsed: number
): ActivationFailure {
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

async function validateTokenAgainstServerState(data: WebDatabase, token: string): Promise<{
  tokenHash: string;
  holder: string | null;
  expiresAt: string | null;
  issuedAt: string;
  license: LicenseRecord | null;
} | ActivationFailure> {
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

export async function activateLicenseSeat(
  data: WebDatabase,
  token: string,
  deviceId: string,
  deviceLabel: string
): Promise<ActivationResult> {
  const validated = await validateTokenAgainstServerState(data, token);
  if ("reason" in validated) {
    return validated;
  }

  const now = new Date().toISOString();
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

  const activation: LicenseActivationRecord = {
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

export async function getLicenseSeatStatus(
  data: WebDatabase,
  token: string,
  deviceId: string,
  deviceLabel?: string | null
): Promise<ActivationResult> {
  const validated = await validateTokenAgainstServerState(data, token);
  if ("reason" in validated) {
    return validated;
  }

  const activeActivations = getActiveActivations(data, validated.tokenHash);
  const existing = activeActivations.find((candidate) => candidate.deviceId === deviceId);
  if (!existing) {
    return buildFailure("activation_required", validated.holder, validated.expiresAt, validated.issuedAt, activeActivations.length);
  }

  existing.lastValidatedAt = new Date().toISOString();
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

export async function releaseLicenseSeat(
  data: WebDatabase,
  token: string,
  deviceId: string
): Promise<{ released: boolean }> {
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
  existing.releasedAt = new Date().toISOString();
  existing.lastValidatedAt = existing.releasedAt;
  upsertActivation(data, existing);
  return { released: true };
}
