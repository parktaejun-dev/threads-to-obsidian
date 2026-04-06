import type {
  ArchiveRecord,
  DeviceRegistration,
  NotionArchiveExportInput,
  NotionAuthStartResponse,
  NotionConnectionSummary,
  NotionExportResult,
  NotionLocationOption,
  NotionParentType,
  PairBinding,
  PairingSession,
  PairingStatus
} from "./types";

const DEFAULT_ORIGIN = "https://ss-threads.dahanda.dev";

function getBaseOrigin(): string {
  const configured = (process.env.EXPO_PUBLIC_THREADS_MOBILE_SAVE_ORIGIN ?? "").trim();
  return configured || DEFAULT_ORIGIN;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : `Request failed with status ${response.status}.`;
    throw new Error(errorMessage);
  }
  return payload as T;
}

function buildDeviceHeaders(device: DeviceRegistration): HeadersInit {
  return {
    "x-mobile-save-device-id": device.deviceId,
    "x-mobile-save-device-secret": device.deviceSecret
  };
}

async function postJson<T>(path: string, payload: object, headers?: HeadersInit): Promise<T> {
  const response = await fetch(`${getBaseOrigin()}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers ?? {})
    },
    body: JSON.stringify(payload)
  });
  return await parseJson<T>(response);
}

async function getJson<T>(path: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(`${getBaseOrigin()}${path}`, {
    headers
  });
  return await parseJson<T>(response);
}

export async function startPairing(device: DeviceRegistration): Promise<PairingSession> {
  return await postJson<PairingSession>("/mobile-save/pairings", {
    deviceId: device.deviceId,
    deviceSecret: device.deviceSecret,
    deviceLabel: "Expo mobile app"
  });
}

export async function getPairingStatus(
  device: DeviceRegistration,
  pairingId: string
): Promise<{
  pairingId: string;
  status: PairingStatus;
  expiresAt: string;
  pairedAt: string | null;
  pairedAccount: Omit<PairBinding, "active" | "pairedAt"> | null;
}> {
  return await getJson(`/mobile-save/pairings/${encodeURIComponent(pairingId)}`, buildDeviceHeaders(device));
}

export async function syncArchives(
  device: DeviceRegistration,
  cursor?: string | null
): Promise<{ items: ArchiveRecord[]; nextCursor: string | null }> {
  const url = new URL("/mobile-save/archives", getBaseOrigin());
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  const response = await fetch(url.toString(), {
    headers: buildDeviceHeaders(device)
  });
  return await parseJson(response);
}

export async function getNotionConnection(device: DeviceRegistration): Promise<NotionConnectionSummary> {
  return await getJson("/mobile-save/notion/connection", buildDeviceHeaders(device));
}

export async function startNotionOAuth(device: DeviceRegistration): Promise<NotionAuthStartResponse> {
  return await postJson("/mobile-save/notion/oauth/start", {}, buildDeviceHeaders(device));
}

export async function disconnectNotion(device: DeviceRegistration): Promise<NotionConnectionSummary> {
  return await postJson("/mobile-save/notion/disconnect", {}, buildDeviceHeaders(device));
}

export async function searchNotionLocations(
  device: DeviceRegistration,
  parentType: NotionParentType,
  query: string
): Promise<NotionLocationOption[]> {
  const result = await postJson<{ results: NotionLocationOption[] }>(
    "/mobile-save/notion/locations/search",
    {
      parentType,
      query
    },
    buildDeviceHeaders(device)
  );
  return result.results ?? [];
}

export async function selectNotionLocation(
  device: DeviceRegistration,
  parentType: NotionParentType,
  option: NotionLocationOption
): Promise<NotionConnectionSummary> {
  return await postJson(
    "/mobile-save/notion/locations/select",
    {
      parentType,
      targetId: option.id,
      targetLabel: option.label,
      targetUrl: option.url
    },
    buildDeviceHeaders(device)
  );
}

export async function exportArchivesToNotion(
  device: DeviceRegistration,
  items: NotionArchiveExportInput[],
  uploadMedia: boolean
): Promise<NotionExportResult> {
  return await postJson(
    "/mobile-save/notion/export",
    {
      items,
      includeImages: true,
      uploadMedia
    },
    buildDeviceHeaders(device)
  );
}
