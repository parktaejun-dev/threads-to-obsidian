import type { LicenseActivationState } from "./types";

export const PRIMARY_BACKEND_ORIGIN = "https://ss-threads.dahanda.dev";
export const BACKEND_ORIGINS = [PRIMARY_BACKEND_ORIGIN];
export const PRO_ACTIVATION_ORIGIN = PRIMARY_BACKEND_ORIGIN;
const PRO_ACTIVATION_PATH = "/api/public/licenses";

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

function shouldTryNextOrigin(response: Response): boolean {
  return response.status === 404 || response.status >= 500;
}

async function postActivation<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  let fallbackError: Error | null = null;
  for (const origin of BACKEND_ORIGINS) {
    try {
      const response = await fetch(`${origin}${PRO_ACTIVATION_PATH}${path}`, {
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
        const errorMessage =
          (json && typeof json === "object" && "error" in json && json.error) || `Activation request failed (${response.status})`;
        if (shouldTryNextOrigin(response)) {
          fallbackError = new Error(`${origin}: ${errorMessage}`);
          continue;
        }
        throw new Error(errorMessage);
      }

      return json as T;
    } catch (error) {
      fallbackError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw fallbackError ?? new Error(`Activation backend is not reachable at ${BACKEND_ORIGINS.join(" or ")}.`);
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
