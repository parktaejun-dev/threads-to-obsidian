import { getLocale, t } from "./i18n";
import type { NotionSaveResult } from "./notion";
import { BACKEND_ORIGINS, PRIMARY_BACKEND_ORIGIN } from "./pro-activation";
import { getServerAuthContext } from "./storage";
import type {
  AiOrganizationResult,
  ExtractedPost,
  NotionConnectionSummary,
  NotionLocationOption,
  NotionParentType,
  NotionSettings
} from "./types";

const NOTION_SERVER_PATH = "/api/public/notion";

interface ServerAuthPayload {
  token: string;
  deviceId: string;
  deviceLabel: string;
}

async function requireServerAuthPayload(): Promise<ServerAuthPayload> {
  const auth = await getServerAuthContext();
  if (auth) {
    return auth;
  }

  const msg = await t();
  throw new Error(msg.optionsNotionOAuthRequiresPro);
}

async function postServerJson<T>(path: string, payload: object): Promise<T> {
  let fallbackError: Error | null = null;
  for (const origin of BACKEND_ORIGINS) {
    try {
      const response = await fetch(`${origin}${NOTION_SERVER_PATH}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const body = (await response.json().catch(() => null)) as { error?: string } & T | null;
      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          fallbackError = new Error(`${origin}${NOTION_SERVER_PATH}: ${body?.error?.trim() || `HTTP ${response.status}`}`);
          continue;
        }
        throw new Error(body?.error?.trim() || `Notion server request failed (${response.status})`);
      }

      return (body ?? {}) as T;
    } catch (error) {
      fallbackError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw fallbackError ?? new Error(`Notion OAuth backend is not reachable at ${PRIMARY_BACKEND_ORIGIN}.`);
}

export async function startNotionOAuthSession(): Promise<string> {
  const auth = await requireServerAuthPayload();
  const result = await postServerJson<{ authorizeUrl: string }>("/oauth/start", auth);
  if (!result.authorizeUrl) {
    throw new Error("Missing Notion authorize URL.");
  }

  return result.authorizeUrl;
}

export async function fetchNotionConnectionSummary(): Promise<NotionConnectionSummary> {
  const auth = await requireServerAuthPayload();
  return await postServerJson<NotionConnectionSummary>("/connection", auth);
}

export async function disconnectNotionConnection(): Promise<NotionConnectionSummary> {
  const auth = await requireServerAuthPayload();
  return await postServerJson<NotionConnectionSummary>("/disconnect", auth);
}

export async function searchNotionLocations(parentType: NotionParentType, query: string): Promise<NotionLocationOption[]> {
  const auth = await requireServerAuthPayload();
  const result = await postServerJson<{ results: NotionLocationOption[] }>("/locations/search", {
    ...auth,
    parentType,
    query
  });
  return result.results ?? [];
}

export async function selectNotionLocation(parentType: NotionParentType, location: NotionLocationOption): Promise<NotionConnectionSummary> {
  const auth = await requireServerAuthPayload();
  return await postServerJson<NotionConnectionSummary>("/locations/select", {
    ...auth,
    parentType,
    targetId: location.id,
    targetLabel: location.label,
    targetUrl: location.url
  });
}

export async function savePostToNotionWithServer(
  post: ExtractedPost,
  notion: NotionSettings,
  includeImages: boolean,
  aiResult: AiOrganizationResult | null,
  aiWarning: string | null
): Promise<NotionSaveResult> {
  const auth = await requireServerAuthPayload();
  const locale = await getLocale();
  return await postServerJson<NotionSaveResult>("/save", {
    ...auth,
    locale,
    post,
    notion: {
      parentType: notion.parentType,
      uploadMedia: notion.uploadMedia
    },
    includeImages,
    aiResult,
    aiWarning
  });
}
