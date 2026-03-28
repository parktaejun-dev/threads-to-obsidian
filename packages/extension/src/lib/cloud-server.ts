import { getLocale, t } from "./i18n";
import { BACKEND_ORIGINS, PRIMARY_BACKEND_ORIGIN } from "./pro-activation";
import {
  clearCloudLinkRecord,
  getCloudLinkRecord,
  getServerAuthContext,
  getStoredCloudConnectionStatus,
  setCloudLinkRecord,
  type StoredCloudLinkRecord
} from "./storage";
import type { AiOrganizationResult, CloudArchiveRecentRecord, CloudConnectionStatus, CloudSaveResult, ExtractedPost } from "./types";

const PUBLIC_BOT_PATH = "/api/public/bot";
const EXTENSION_API_PATH = "/api/extension";

interface ServerAuthPayload {
  token: string;
  deviceId: string;
  deviceLabel: string;
}

interface CloudLinkCompleteResult {
  token: string;
  expiresAt: string;
  linkedAt: string;
  userHandle: string;
}

async function requireCloudAuthPayload(): Promise<ServerAuthPayload> {
  const auth = await getServerAuthContext();
  if (auth) {
    return auth;
  }

  const msg = await t();
  throw new Error(msg.optionsCloudRequiresPro);
}

async function requireCloudLinkRecord(): Promise<StoredCloudLinkRecord> {
  const record = await getCloudLinkRecord();
  if (record?.token) {
    return record;
  }

  const msg = await t();
  throw new Error(msg.statusCloudConnectRequired);
}

async function requestJsonFromOrigins<T>(
  apiPath: string,
  init: RequestInit,
  options: {
    authToken?: string | null;
    treatUnauthorizedAsExpired?: boolean;
  } = {}
): Promise<T> {
  let fallbackError: Error | null = null;
  const msg = await t();

  for (const origin of BACKEND_ORIGINS) {
    try {
      const headers = new Headers(init.headers ?? {});
      if (!headers.has("content-type") && init.body) {
        headers.set("content-type", "application/json");
      }
      if (options.authToken) {
        headers.set("authorization", `Bearer ${options.authToken}`);
      }

      const response = await fetch(`${origin}${apiPath}`, {
        ...init,
        headers
      });
      const body = (await response.json().catch(() => null)) as { error?: string } & T | null;
      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          fallbackError = new Error(`${origin}${apiPath}: ${body?.error?.trim() || `HTTP ${response.status}`}`);
          continue;
        }
        if (response.status === 401) {
          throw new Error(options.treatUnauthorizedAsExpired ? msg.statusCloudSessionExpired : msg.statusCloudConnectRequired);
        }
        throw new Error(body?.error?.trim() || `Cloud request failed (${response.status})`);
      }

      return (body ?? {}) as T;
    } catch (error) {
      fallbackError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw fallbackError ?? new Error(`Cloud save backend is not reachable at ${PRIMARY_BACKEND_ORIGIN}.`);
}

function buildCloudLinkRecord(result: CloudLinkCompleteResult): StoredCloudLinkRecord {
  return {
    token: result.token,
    expiresAt: result.expiresAt,
    linkedAt: result.linkedAt,
    userHandle: result.userHandle
  };
}

export function buildCloudLinkStartUrl(state: string): string {
  const url = new URL(`${PRIMARY_BACKEND_ORIGIN}${PUBLIC_BOT_PATH}/extension/link/start`);
  url.searchParams.set("state", state);
  return url.toString();
}

export function buildCloudScrapbookUrl(): string {
  return new URL("/scrapbook", PRIMARY_BACKEND_ORIGIN).toString();
}

export async function completeCloudLink(code: string, state: string): Promise<CloudConnectionStatus> {
  const result = await requestJsonFromOrigins<CloudLinkCompleteResult>(
    `${EXTENSION_API_PATH}/link/complete`,
    {
      method: "POST",
      body: JSON.stringify({ code, state })
    }
  );
  const record = buildCloudLinkRecord(result);
  await setCloudLinkRecord(record);
  return {
    state: "linked",
    userHandle: record.userHandle,
    expiresAt: record.expiresAt,
    linkedAt: record.linkedAt
  };
}

export async function fetchCloudConnectionStatus(): Promise<CloudConnectionStatus> {
  const localStatus = await getStoredCloudConnectionStatus();
  if (localStatus.state === "unlinked") {
    return localStatus;
  }

  const record = await getCloudLinkRecord();
  if (!record?.token) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }

  try {
    const status = await requestJsonFromOrigins<CloudConnectionStatus>(
      `${EXTENSION_API_PATH}/cloud/status`,
      {
        method: "GET"
      },
      {
        authToken: record.token,
        treatUnauthorizedAsExpired: true
      }
    );

    if (status.state === "linked") {
      await setCloudLinkRecord({
        token: record.token,
        expiresAt: status.expiresAt ?? record.expiresAt,
        linkedAt: status.linkedAt ?? record.linkedAt,
        userHandle: status.userHandle ?? record.userHandle
      });
      return status;
    }

    await clearCloudLinkRecord();
    return status;
  } catch {
    return {
      ...localStatus,
      state: "offline"
    };
  }
}

export async function disconnectCloudConnection(): Promise<CloudConnectionStatus> {
  const record = await getCloudLinkRecord();
  if (!record?.token) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }

  try {
    const status = await requestJsonFromOrigins<CloudConnectionStatus>(
      `${EXTENSION_API_PATH}/cloud/link`,
      {
        method: "DELETE"
      },
      {
        authToken: record.token,
        treatUnauthorizedAsExpired: true
      }
    );
    await clearCloudLinkRecord();
    return status;
  } catch {
    await clearCloudLinkRecord();
    return {
      state: "revoked",
      userHandle: record.userHandle,
      expiresAt: record.expiresAt,
      linkedAt: record.linkedAt
    };
  }
}

export async function fetchCloudArchivesWithServer(): Promise<CloudArchiveRecentRecord[]> {
  const cloudLink = await requireCloudLinkRecord();
  const result = await requestJsonFromOrigins<{ archives?: CloudArchiveRecentRecord[] }>(
    `${EXTENSION_API_PATH}/cloud/archives`,
    {
      method: "GET"
    },
    {
      authToken: cloudLink.token,
      treatUnauthorizedAsExpired: true
    }
  );
  return result.archives ?? [];
}

export async function deleteCloudArchiveWithServer(archiveId: string): Promise<void> {
  const cloudLink = await requireCloudLinkRecord();
  await requestJsonFromOrigins<{ ok?: boolean }>(
    `${EXTENSION_API_PATH}/cloud/archive/${encodeURIComponent(archiveId)}`,
    {
      method: "DELETE"
    },
    {
      authToken: cloudLink.token,
      treatUnauthorizedAsExpired: true
    }
  );
}

export async function savePostToCloudWithServer(
  post: ExtractedPost,
  aiResult: AiOrganizationResult | null,
  aiWarning: string | null
): Promise<CloudSaveResult> {
  const [auth, locale, cloudLink] = await Promise.all([
    requireCloudAuthPayload(),
    getLocale(),
    requireCloudLinkRecord()
  ]);

  return await requestJsonFromOrigins<CloudSaveResult>(
    `${EXTENSION_API_PATH}/cloud/save`,
    {
      method: "POST",
      body: JSON.stringify({
        ...auth,
        locale,
        post,
        aiResult,
        aiWarning
      })
    },
    {
      authToken: cloudLink.token,
      treatUnauthorizedAsExpired: true
    }
  );
}
