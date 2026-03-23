import type { LicenseActivationState } from "./types";

export const PRO_ACTIVATION_ORIGIN = "https://threads-obsidian.dahanda.dev";
const PRO_ACTIVATION_BASE = `${PRO_ACTIVATION_ORIGIN}/api/public/licenses`;

export interface ServerActivationSuccess {
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

export interface ServerActivationFailure {
  ok: false;
  reason: "invalid" | "expired" | "revoked" | "seat_limit" | "activation_required";
  holder: string | null;
  expiresAt: string | null;
  issuedAt: string | null;
  seatLimit: number;
  seatsUsed: number;
}

export type ServerActivationResult = ServerActivationSuccess | ServerActivationFailure;

async function postActivation<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${PRO_ACTIVATION_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const json = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok && json && typeof json === "object" && "ok" in json) {
    return json as T;
  }
  if (!response.ok) {
    throw new Error((json && typeof json === "object" && "error" in json && json.error) || `Activation request failed (${response.status})`);
  }

  return json as T;
}

export async function activateLicenseWithServer(token: string, deviceId: string, deviceLabel: string): Promise<ServerActivationResult> {
  return await postActivation<ServerActivationResult>("/activate", { token, deviceId, deviceLabel });
}

export async function getServerLicenseStatus(token: string, deviceId: string, deviceLabel: string): Promise<ServerActivationResult> {
  return await postActivation<ServerActivationResult>("/status", { token, deviceId, deviceLabel });
}

export async function releaseLicenseWithServer(token: string, deviceId: string): Promise<void> {
  await postActivation<{ released: boolean }>("/release", { token, deviceId });
}

export function mapServerFailureToActivationState(reason: ServerActivationFailure["reason"]): LicenseActivationState {
  if (reason === "seat_limit") {
    return "seat_limit";
  }
  if (reason === "revoked") {
    return "revoked";
  }
  return "required";
}
