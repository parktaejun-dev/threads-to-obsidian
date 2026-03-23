import { t } from "./i18n";
import { buildNotionBundle } from "./package";
import type { AiOrganizationResult, AiOrganizationSettings, ExtractedPost, NotionSettings } from "./types";

const NOTION_API_URL = "https://api.notion.com/v1/pages";
const NOTION_DATA_SOURCE_API_URL = "https://api.notion.com/v1/data_sources";
const NOTION_HOST_PATTERN = "https://api.notion.com/*";
const NOTION_VERSION = "2026-03-11";
const RICH_TEXT_CHUNK_LENGTH = 2000;

interface NotionErrorResponse {
  code?: string;
  message?: string;
}

interface NotionCreatePageResponse {
  id?: string;
  url?: string;
}

interface NotionSelectLikeOption {
  id?: string;
  name?: string;
}

interface NotionPropertySchema {
  id?: string;
  type?: string;
  select?: {
    options?: NotionSelectLikeOption[];
  };
  multi_select?: {
    options?: NotionSelectLikeOption[];
  };
  status?: {
    options?: NotionSelectLikeOption[];
  };
}

interface NotionDataSourceResponse {
  id?: string;
  properties?: Record<string, NotionPropertySchema>;
}

export interface NotionSaveResult {
  pageId: string;
  pageUrl: string;
  title: string;
  warning: string | null;
}

function normalizeUuid(value: string): string {
  const compact = value.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(compact)) {
    throw new Error("invalid_notion_page_id");
  }

  return [
    compact.slice(0, 8),
    compact.slice(8, 12),
    compact.slice(12, 16),
    compact.slice(16, 20),
    compact.slice(20, 32)
  ].join("-");
}

export function normalizeNotionPageIdInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("missing_notion_page_id");
  }

  const match = trimmed.match(/[0-9a-f]{32}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i);
  if (!match?.[0]) {
    throw new Error("invalid_notion_page_id");
  }

  return normalizeUuid(match[0]);
}

export function isNotionConfigured(settings: NotionSettings): boolean {
  const targetId = settings.parentType === "data_source" ? settings.dataSourceId : settings.parentPageId;
  return settings.token.trim().length > 0 && targetId.trim().length > 0;
}

export async function hasNotionHostPermission(): Promise<boolean> {
  if (!chrome.permissions?.contains) {
    return false;
  }

  try {
    return await chrome.permissions.contains({ origins: [NOTION_HOST_PATTERN] });
  } catch {
    return false;
  }
}

export async function requestNotionHostPermission(): Promise<boolean> {
  if (!chrome.permissions?.request) {
    return false;
  }

  try {
    return await chrome.permissions.request({ origins: [NOTION_HOST_PATTERN] });
  } catch {
    return false;
  }
}

async function mapNotionError(status: number, body: NotionErrorResponse | null, retryAfter: string | null): Promise<string> {
  const msg = await t();
  const apiMessage = body?.message?.trim();

  if (status === 401) {
    return msg.errNotionUnauthorized;
  }

  if (status === 403) {
    return msg.errNotionForbidden;
  }

  if (status === 404) {
    return msg.errNotionParentNotFound;
  }

  if (status === 429) {
    const seconds = retryAfter?.trim() || "60";
    return msg.errNotionRateLimited.replace("{seconds}", seconds);
  }

  if (status === 400) {
    return apiMessage ? `${msg.errNotionValidation}: ${apiMessage}` : msg.errNotionValidation;
  }

  return apiMessage ? `${msg.errNotionRequestFailed}: ${apiMessage}` : msg.errNotionRequestFailed;
}

function normalizePropertyName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "");
}

function chunkRichText(value: string): Array<{ type: "text"; text: { content: string } }> {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const chunks: Array<{ type: "text"; text: { content: string } }> = [];
  for (let index = 0; index < trimmed.length; index += RICH_TEXT_CHUNK_LENGTH) {
    chunks.push({
      type: "text",
      text: {
        content: trimmed.slice(index, index + RICH_TEXT_CHUNK_LENGTH)
      }
    });
  }

  return chunks;
}

function getConfiguredTargetId(settings: NotionSettings): string {
  return settings.parentType === "data_source" ? settings.dataSourceId : settings.parentPageId;
}

async function notionRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "notion-version": NOTION_VERSION,
      ...(init?.headers ?? {})
    }
  });

  const retryAfter = response.headers.get("retry-after");
  const responseBody = (await response.json().catch(() => null)) as (T & NotionErrorResponse) | null;
  if (!response.ok) {
    throw new Error(await mapNotionError(response.status, responseBody, retryAfter));
  }

  return (responseBody ?? {}) as T;
}

async function retrieveDataSource(token: string, dataSourceId: string): Promise<NotionDataSourceResponse> {
  return await notionRequest<NotionDataSourceResponse>(`${NOTION_DATA_SOURCE_API_URL}/${dataSourceId}`, token, {
    method: "GET"
  });
}

function matchAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

function resolveNamedOption(options: NotionSelectLikeOption[] | undefined, preferred: string): string | null {
  if (!preferred.trim()) {
    return null;
  }

  const normalizedPreferred = normalizePropertyName(preferred);
  const matched = (options ?? []).find((option) => normalizePropertyName(option.name ?? "") === normalizedPreferred);
  return matched?.name ?? preferred;
}

function buildAutoPropertyValue(
  propertyName: string,
  schema: NotionPropertySchema,
  post: ExtractedPost,
  aiResult: AiOrganizationResult | null
): Record<string, unknown> | null {
  const normalizedName = normalizePropertyName(propertyName);
  const propertyType = schema.type ?? "";
  const tags = Array.from(new Set(["threads", ...(aiResult?.tags ?? [])]));
  const hasImages = post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
  const hasExternalUrl = Boolean(post.externalUrl || post.authorReplies.some((reply) => reply.externalUrl));

  if (propertyType === "title") {
    return {
      title: chunkRichText(post.title)
    };
  }

  if (propertyType === "url") {
    if (matchAny(normalizedName, ["canonicalurl", "sourceurl", "source", "threadurl", "threadsurl", "url", "link"])) {
      return { url: post.canonicalUrl };
    }

    if (matchAny(normalizedName, ["externalurl", "externallink", "articleurl"])) {
      return post.externalUrl ? { url: post.externalUrl } : null;
    }

    return null;
  }

  if (propertyType === "rich_text") {
    if (matchAny(normalizedName, ["author", "username", "handle", "creator"])) {
      return { rich_text: chunkRichText(`@${post.author}`) };
    }

    if (matchAny(normalizedName, ["canonicalurl", "sourceurl", "threadurl", "threadsurl", "source", "url", "link"])) {
      return { rich_text: chunkRichText(post.canonicalUrl) };
    }

    if (matchAny(normalizedName, ["summary", "aisummary"])) {
      return aiResult?.summary ? { rich_text: chunkRichText(aiResult.summary) } : null;
    }

    if (matchAny(normalizedName, ["shortcode", "postid"])) {
      return { rich_text: chunkRichText(post.shortcode) };
    }

    if (matchAny(normalizedName, ["sourcetype", "contenttype", "type"])) {
      return { rich_text: chunkRichText(post.sourceType) };
    }

    if (matchAny(normalizedName, ["externalurl", "externallink", "articleurl"])) {
      return post.externalUrl ? { rich_text: chunkRichText(post.externalUrl) } : null;
    }

    return null;
  }

  if (propertyType === "date") {
    if (matchAny(normalizedName, ["capturedat", "savedat", "archivedat", "importedat", "clippedat"])) {
      return { date: { start: post.capturedAt } };
    }

    if (matchAny(normalizedName, ["publishedat", "publisheddate", "published", "date"])) {
      return { date: { start: post.publishedAt ?? post.capturedAt } };
    }

    return null;
  }

  if (propertyType === "number") {
    if (matchAny(normalizedName, ["authorreplycount", "replycount", "replies"])) {
      return { number: post.authorReplies.length };
    }

    return null;
  }

  if (propertyType === "checkbox") {
    if (matchAny(normalizedName, ["hasimages", "hasmedia", "images"])) {
      return { checkbox: hasImages };
    }

    if (matchAny(normalizedName, ["hasexternalurl", "haslink", "hasexternallink"])) {
      return { checkbox: hasExternalUrl };
    }

    return null;
  }

  if (propertyType === "multi_select") {
    if (matchAny(normalizedName, ["tags", "tag", "topics", "labels"])) {
      return {
        multi_select: tags.map((tag) => {
          const optionName = resolveNamedOption(schema.multi_select?.options, tag) ?? tag;
          return { name: optionName };
        })
      };
    }

    return null;
  }

  if (propertyType === "select") {
    if (matchAny(normalizedName, ["sourcetype", "contenttype", "type"])) {
      const optionName = resolveNamedOption(schema.select?.options, post.sourceType);
      return optionName ? { select: { name: optionName } } : null;
    }

    return null;
  }

  if (propertyType === "status") {
    if (matchAny(normalizedName, ["status", "contentstatus"])) {
      const optionName = resolveNamedOption(schema.status?.options, "captured");
      return optionName ? { status: { name: optionName } } : null;
    }

    return null;
  }

  return null;
}

function buildDataSourceProperties(
  schema: Record<string, NotionPropertySchema>,
  post: ExtractedPost,
  aiResult: AiOrganizationResult | null
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [propertyName, propertySchema] of Object.entries(schema)) {
    const propertyKey = propertySchema.id ?? propertyName;
    const value = buildAutoPropertyValue(propertyName, propertySchema, post, aiResult);
    if (value) {
      properties[propertyKey] = value;
    }
  }

  return properties;
}

export async function savePostToNotion(
  post: ExtractedPost,
  settings: NotionSettings,
  includeImages: boolean,
  aiOrganization?: AiOrganizationSettings
): Promise<NotionSaveResult> {
  const msg = await t();
  const token = settings.token.trim();
  if (!token) {
    throw new Error(msg.errNotionTokenMissing);
  }

  const targetId = normalizeNotionPageIdInput(getConfiguredTargetId(settings));
  if (!(await hasNotionHostPermission())) {
    throw new Error(msg.errNotionPermissionMissing);
  }

  const bundle = await buildNotionBundle(post, includeImages, aiOrganization);
  let properties: Record<string, unknown> | undefined;
  let parent: Record<string, string>;

  if (settings.parentType === "data_source") {
    const dataSource = await retrieveDataSource(token, targetId);
    properties = buildDataSourceProperties(dataSource.properties ?? {}, post, bundle.aiResult);
    parent = {
      data_source_id: targetId
    };
  } else {
    parent = {
      page_id: targetId
    };
  }

  const responseBody = await notionRequest<NotionCreatePageResponse>(NOTION_API_URL, token, {
    method: "POST",
    body: JSON.stringify({
      parent,
      ...(properties ? { properties } : {}),
      markdown: bundle.markdownContent
    })
  });

  if (!responseBody?.id || !responseBody.url) {
    throw new Error(msg.errNotionRequestFailed);
  }

  return {
    pageId: responseBody.id,
    pageUrl: responseBody.url,
    title: bundle.title,
    warning: bundle.warning
  };
}
