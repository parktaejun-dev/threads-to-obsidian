import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { savePostToNotionCore } from "@threads/shared/notion";
import type { Locale } from "@threads/shared/i18n";
import type { AiOrganizationResult, ExtractedPost } from "@threads/shared/types";
import type {
  NotionAuthSessionRecord,
  NotionConnectionRecord,
  NotionParentType,
  WebDatabase
} from "@threads/web-schema";
import { getLicenseSeatStatus } from "./activation-service";
import { upsertNotionAuthSession, upsertNotionConnection } from "./store";

const NOTION_AUTHORIZE_URL = "https://api.notion.com/v1/oauth/authorize";
const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";
const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";
const OAUTH_SESSION_TTL_MS = 10 * 60_000;

interface NotionOauthConfig {
  clientId: string;
  clientSecret: string;
}

interface NotionTokenResponse {
  access_token?: string;
  refresh_token?: string | null;
  workspace_id?: string;
  workspace_name?: string | null;
  workspace_icon?: string | null;
  bot_id?: string;
  owner?: {
    type?: string;
    user?: {
      id?: string;
      name?: string | null;
      person?: {
        email?: string | null;
      };
    };
  };
}

interface NotionSearchResponse {
  results?: unknown[];
}

interface NotionConnectionSummary {
  connected: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceIcon: string | null;
  selectedParentType: NotionParentType | null;
  selectedParentId: string | null;
  selectedParentLabel: string | null;
  selectedParentUrl: string | null;
}

interface NotionLocationOption {
  id: string;
  type: NotionParentType;
  label: string;
  url: string;
  subtitle: string | null;
}

interface ValidatedClient {
  tokenHash: string;
  licenseId: string | null;
  holder: string | null;
  deviceId: string;
  deviceLabel: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function readOauthConfig(): NotionOauthConfig {
  const clientId = process.env.THREADS_NOTION_CLIENT_ID?.trim();
  const clientSecret = process.env.THREADS_NOTION_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Notion OAuth is not configured on the web server. Set THREADS_NOTION_CLIENT_ID and THREADS_NOTION_CLIENT_SECRET."
    );
  }

  return { clientId, clientSecret };
}

function getEncryptionKey(): Buffer {
  const secret = process.env.THREADS_NOTION_ENCRYPTION_SECRET?.trim() || process.env.THREADS_WEB_ADMIN_TOKEN?.trim();
  if (!secret) {
    throw new Error(
      "Notion encryption secret is not configured. Set THREADS_NOTION_ENCRYPTION_SECRET or THREADS_WEB_ADMIN_TOKEN."
    );
  }

  return createHash("sha256").update(secret).digest();
}

function encryptSecret(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptSecret(value: string): string {
  const [ivRaw, tagRaw, bodyRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !bodyRaw) {
    throw new Error("Invalid encrypted secret payload.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(bodyRaw, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

function getMatchingLicenseId(data: WebDatabase, token: string): string | null {
  return data.licenses.find((candidate) => candidate.token === token)?.id ?? null;
}

export async function validateNotionClient(
  data: WebDatabase,
  token: string,
  deviceId: string,
  deviceLabel: string
): Promise<ValidatedClient> {
  const status = await getLicenseSeatStatus(data, token, deviceId, deviceLabel);
  if (!status.ok) {
    throw new Error(
      status.reason === "activation_required"
        ? "Pro activation is required."
        : status.reason === "seat_limit"
          ? "This Pro key has reached the device limit."
          : status.reason === "revoked"
            ? "This Pro key has been revoked."
            : status.reason === "expired"
              ? "This Pro key has expired."
              : "This Pro key is not valid."
    );
  }

  return {
    tokenHash: hashToken(token),
    licenseId: getMatchingLicenseId(data, token),
    holder: status.holder,
    deviceId: status.deviceId,
    deviceLabel: status.deviceLabel
  };
}

function getActiveConnection(data: WebDatabase, tokenHash: string, deviceId: string): NotionConnectionRecord | null {
  return (
    data.notionConnections.find(
      (candidate) => candidate.tokenHash === tokenHash && candidate.deviceId === deviceId && candidate.status === "active"
    ) ?? null
  );
}

function getPendingSession(data: WebDatabase, sessionId: string): NotionAuthSessionRecord | null {
  return (
    data.notionAuthSessions.find((candidate) => candidate.id === sessionId && candidate.status === "pending") ?? null
  );
}

function buildConnectionSummary(connection: NotionConnectionRecord | null): NotionConnectionSummary {
  return {
    connected: Boolean(connection && connection.status === "active"),
    workspaceId: connection?.workspaceId ?? null,
    workspaceName: connection?.workspaceName ?? null,
    workspaceIcon: connection?.workspaceIcon ?? null,
    selectedParentType: connection?.selectedParentType ?? null,
    selectedParentId: connection?.selectedParentId ?? null,
    selectedParentLabel: connection?.selectedParentLabel ?? null,
    selectedParentUrl: connection?.selectedParentUrl ?? null
  };
}

function buildRedirectUri(publicOrigin: string): string {
  return `${publicOrigin.replace(/\/+$/, "")}/api/public/notion/oauth/callback`;
}

function buildNotionAuthorizeUrl(redirectUri: string, state: string): string {
  const { clientId } = readOauthConfig();
  const url = new URL(NOTION_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("owner", "user");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

async function notionTokenRequest(
  payload: Record<string, unknown>,
  config: NotionOauthConfig
): Promise<NotionTokenResponse> {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: `Basic ${basic}`,
      "content-type": "application/json",
      "notion-version": NOTION_VERSION
    },
    body: JSON.stringify(payload)
  });

  const body = (await response.json().catch(() => null)) as { message?: string } & NotionTokenResponse | null;
  if (!response.ok) {
    throw new Error(body?.message?.trim() || "Notion OAuth token exchange failed.");
  }

  return body ?? {};
}

async function exchangeOAuthCode(code: string, redirectUri: string): Promise<NotionTokenResponse> {
  return await notionTokenRequest(
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    },
    readOauthConfig()
  );
}

async function refreshOAuthToken(refreshToken: string): Promise<NotionTokenResponse> {
  return await notionTokenRequest(
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken
    },
    readOauthConfig()
  );
}

async function notionApiRequest<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${NOTION_API_URL}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "notion-version": NOTION_VERSION,
      ...(init?.headers ?? {})
    }
  });

  const body = (await response.json().catch(() => null)) as { message?: string } & T | null;
  if (!response.ok) {
    const message = body?.message?.trim() || `Notion request failed (${response.status})`;
    throw new Error(message);
  }

  return (body ?? {}) as T;
}

async function withConnectionAccessToken<T>(
  data: WebDatabase,
  connection: NotionConnectionRecord,
  operation: (accessToken: string) => Promise<T>
): Promise<T> {
  try {
    return await operation(decryptSecret(connection.accessTokenCiphertext));
  } catch (error) {
    if (!(error instanceof Error) || !/unauthorized|expired|401/i.test(error.message) || !connection.refreshTokenCiphertext) {
      throw error;
    }

    const refreshed = await refreshOAuthToken(decryptSecret(connection.refreshTokenCiphertext));
    if (!refreshed.access_token) {
      throw new Error("Notion token refresh failed.");
    }

    connection.accessTokenCiphertext = encryptSecret(refreshed.access_token);
    if (typeof refreshed.refresh_token === "string" && refreshed.refresh_token.trim()) {
      connection.refreshTokenCiphertext = encryptSecret(refreshed.refresh_token);
    }
    connection.updatedAt = new Date().toISOString();
    upsertNotionConnection(data, connection);
    return await operation(refreshed.access_token);
  }
}

function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readTitleArray(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const parts = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const record = item as Record<string, unknown>;
      return readText(record.plain_text) || readText((record.text as Record<string, unknown> | undefined)?.content) || "";
    })
    .filter(Boolean);
  return parts.length > 0 ? parts.join("") : null;
}

function deriveTitleFromUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const slug = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "");
    const normalized = slug
      .replace(/-[0-9a-f]{32}$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
    return normalized || null;
  } catch {
    return null;
  }
}

function extractPageTitle(record: Record<string, unknown>): string {
  const title = readTitleArray(record.title);
  if (title) {
    return title;
  }

  const properties = record.properties;
  if (properties && typeof properties === "object" && !Array.isArray(properties)) {
    for (const candidate of Object.values(properties as Record<string, unknown>)) {
      if (!candidate || typeof candidate !== "object") {
        continue;
      }
      const typed = candidate as Record<string, unknown>;
      if (typed.type === "title") {
        const propertyTitle = readTitleArray(typed.title);
        if (propertyTitle) {
          return propertyTitle;
        }
      }
    }
  }

  return deriveTitleFromUrl(readText(record.url)) || "Untitled";
}

function mapSearchResultToLocation(result: unknown): NotionLocationOption | null {
  if (!result || typeof result !== "object") {
    return null;
  }

  const record = result as Record<string, unknown>;
  const objectType = readText(record.object);
  const id = readText(record.id);
  const url = readText(record.url);
  if (!id || !url || (objectType !== "page" && objectType !== "data_source")) {
    return null;
  }

  return {
    id,
    type: objectType,
    label: extractPageTitle(record),
    url,
    subtitle: objectType === "data_source" ? "Data source" : "Page"
  };
}

async function searchLocationsWithToken(
  accessToken: string,
  parentType: NotionParentType,
  query: string
): Promise<NotionLocationOption[]> {
  const payload: Record<string, unknown> = {
    page_size: 30
  };
  if (query.trim()) {
    payload.query = query.trim();
  }

  const response = await notionApiRequest<NotionSearchResponse>(accessToken, "/search", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return (response.results ?? [])
    .map((item) => mapSearchResultToLocation(item))
    .filter((item): item is NotionLocationOption => Boolean(item))
    .filter((item) => item.type === parentType)
    .slice(0, 20);
}

async function chooseDefaultLocation(accessToken: string): Promise<NotionLocationOption | null> {
  const pages = await searchLocationsWithToken(accessToken, "page", "");
  if (pages.length > 0) {
    return pages[0];
  }

  const dataSources = await searchLocationsWithToken(accessToken, "data_source", "");
  return dataSources[0] ?? null;
}

export async function createNotionAuthStart(
  data: WebDatabase,
  token: string,
  deviceId: string,
  deviceLabel: string,
  publicOrigin: string
): Promise<{ authorizeUrl: string }> {
  const validated = await validateNotionClient(data, token, deviceId, deviceLabel);
  const now = Date.now();
  const session: NotionAuthSessionRecord = {
    id: crypto.randomUUID(),
    tokenHash: validated.tokenHash,
    licenseId: validated.licenseId,
    holder: validated.holder,
    deviceId: validated.deviceId,
    deviceLabel: validated.deviceLabel,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OAUTH_SESSION_TTL_MS).toISOString(),
    completedAt: null,
    status: "pending"
  };
  upsertNotionAuthSession(data, session);

  return {
    authorizeUrl: buildNotionAuthorizeUrl(buildRedirectUri(publicOrigin), session.id)
  };
}

export async function completeNotionAuth(
  data: WebDatabase,
  state: string,
  code: string,
  publicOrigin: string
): Promise<NotionConnectionRecord> {
  const session = getPendingSession(data, state);
  if (!session) {
    throw new Error("This Notion connection session is no longer valid.");
  }

  if (Date.parse(session.expiresAt) < Date.now()) {
    session.status = "expired";
    upsertNotionAuthSession(data, session);
    throw new Error("This Notion connection session has expired.");
  }

  const tokenResponse = await exchangeOAuthCode(code, buildRedirectUri(publicOrigin));
  if (!tokenResponse.access_token || !tokenResponse.workspace_id || !tokenResponse.bot_id) {
    throw new Error("Notion OAuth completed without a usable access token.");
  }

  const now = new Date().toISOString();
  const existing =
    data.notionConnections.find(
      (candidate) =>
        candidate.tokenHash === session.tokenHash &&
        candidate.deviceId === session.deviceId &&
        candidate.status === "active"
    ) ?? null;

  const connection: NotionConnectionRecord = {
    id: existing?.id ?? crypto.randomUUID(),
    tokenHash: session.tokenHash,
    licenseId: session.licenseId,
    holder: session.holder,
    deviceId: session.deviceId,
    deviceLabel: session.deviceLabel,
    workspaceId: tokenResponse.workspace_id,
    workspaceName: tokenResponse.workspace_name ?? null,
    workspaceIcon: tokenResponse.workspace_icon ?? null,
    botId: tokenResponse.bot_id,
    ownerUserId: tokenResponse.owner?.type === "user" ? tokenResponse.owner.user?.id ?? null : null,
    ownerUserName: tokenResponse.owner?.type === "user" ? tokenResponse.owner.user?.name ?? null : null,
    ownerUserEmail: tokenResponse.owner?.type === "user" ? tokenResponse.owner.user?.person?.email ?? null : null,
    accessTokenCiphertext: encryptSecret(tokenResponse.access_token),
    refreshTokenCiphertext:
      typeof tokenResponse.refresh_token === "string" && tokenResponse.refresh_token.trim()
        ? encryptSecret(tokenResponse.refresh_token)
        : null,
    selectedParentType: existing?.selectedParentType ?? null,
    selectedParentId: existing?.selectedParentId ?? null,
    selectedParentLabel: existing?.selectedParentLabel ?? null,
    selectedParentUrl: existing?.selectedParentUrl ?? null,
    connectedAt: existing?.connectedAt ?? now,
    updatedAt: now,
    revokedAt: null,
    status: "active"
  };

  if (!connection.selectedParentId) {
    const defaultLocation = await chooseDefaultLocation(tokenResponse.access_token);
    if (defaultLocation) {
      connection.selectedParentType = defaultLocation.type;
      connection.selectedParentId = defaultLocation.id;
      connection.selectedParentLabel = defaultLocation.label;
      connection.selectedParentUrl = defaultLocation.url;
    }
  }

  upsertNotionConnection(data, connection);
  session.completedAt = now;
  session.status = "completed";
  upsertNotionAuthSession(data, session);
  return connection;
}

export function getNotionConnectionSummary(
  data: WebDatabase,
  tokenHash: string,
  deviceId: string
): NotionConnectionSummary {
  return buildConnectionSummary(getActiveConnection(data, tokenHash, deviceId));
}

export function disconnectNotionConnection(
  data: WebDatabase,
  tokenHash: string,
  deviceId: string
): NotionConnectionSummary {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection) {
    return buildConnectionSummary(null);
  }

  connection.status = "revoked";
  connection.revokedAt = new Date().toISOString();
  connection.updatedAt = connection.revokedAt;
  upsertNotionConnection(data, connection);
  return buildConnectionSummary(null);
}

export async function searchNotionLocations(
  data: WebDatabase,
  tokenHash: string,
  deviceId: string,
  parentType: NotionParentType,
  query: string
): Promise<NotionLocationOption[]> {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection) {
    throw new Error("Notion is not connected.");
  }

  return await withConnectionAccessToken(data, connection, async (accessToken) => await searchLocationsWithToken(accessToken, parentType, query));
}

export async function selectNotionLocation(
  data: WebDatabase,
  tokenHash: string,
  deviceId: string,
  parentType: NotionParentType,
  targetId: string,
  targetLabel: string,
  targetUrl: string
): Promise<NotionConnectionSummary> {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection) {
    throw new Error("Notion is not connected.");
  }

  connection.selectedParentType = parentType;
  connection.selectedParentId = targetId;
  connection.selectedParentLabel = targetLabel.trim() || "Untitled";
  connection.selectedParentUrl = targetUrl.trim();
  connection.updatedAt = new Date().toISOString();
  upsertNotionConnection(data, connection);
  return buildConnectionSummary(connection);
}

export async function savePostThroughNotionConnection(
  data: WebDatabase,
  tokenHash: string,
  deviceId: string,
  payload: {
    locale: Locale;
    post: ExtractedPost;
    includeImages: boolean;
    uploadMedia: boolean;
    aiResult: AiOrganizationResult | null;
    aiWarning: string | null;
  }
) {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection || !connection.selectedParentType || !connection.selectedParentId) {
    throw new Error("Notion is connected, but no default save location is selected.");
  }

  return await withConnectionAccessToken(data, connection, async (accessToken) => {
    return await savePostToNotionCore(payload.post, {
      token: accessToken,
      parentType: connection.selectedParentType as NotionParentType,
      targetId: connection.selectedParentId as string,
      includeImages: payload.includeImages,
      uploadMedia: payload.uploadMedia,
      aiResult: payload.aiResult,
      aiWarning: payload.aiWarning,
      locale: payload.locale
    });
  });
}
