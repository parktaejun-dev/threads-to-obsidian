import { t } from "./i18n";
import { organizePostWithAi } from "./llm";
import { renderNotionMarkdown, type MarkdownMediaRefs } from "./markdown";
import type { AiOrganizationResult, AiOrganizationSettings, AuthorReply, ExtractedPost, NotionSettings } from "./types";

const NOTION_API_URL = "https://api.notion.com/v1/pages";
const NOTION_BLOCKS_API_URL = "https://api.notion.com/v1/blocks";
const NOTION_DATA_SOURCE_API_URL = "https://api.notion.com/v1/data_sources";
const NOTION_FILE_UPLOAD_API_URL = "https://api.notion.com/v1/file_uploads";
const NOTION_HOST_PATTERN = "https://api.notion.com/*";
const NOTION_VERSION = "2026-03-11";
const RICH_TEXT_CHUNK_LENGTH = 2000;
const SINGLE_PART_UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;
const MULTI_PART_CHUNK_BYTES = 10 * 1024 * 1024;

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

interface NotionFileUploadResponse {
  id?: string;
  status?: string;
  upload_url?: string;
}

interface NotionMediaPolicy {
  allowMediaDownloads: boolean;
  fallbackWarning: string;
}

interface UploadedNotionMediaFile {
  fileUploadId: string;
  kind: "image" | "video";
  label: string;
}

interface UploadedNotionMediaGroup {
  heading: string;
  files: UploadedNotionMediaFile[];
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

function buildNotionMediaRefs(post: ExtractedPost, includeImages: boolean): MarkdownMediaRefs {
  return {
    postImages: includeImages ? [...post.imageUrls] : [],
    postVideo:
      includeImages && post.sourceType === "video"
        ? {
            file: post.videoUrl,
            thumbnail: post.thumbnailUrl
          }
        : null,
    replyImages: post.authorReplies.map((reply) => (includeImages ? [...reply.imageUrls] : [])),
    replyVideos: post.authorReplies.map((reply) =>
      includeImages && reply.sourceType === "video"
        ? {
            file: reply.videoUrl,
            thumbnail: reply.thumbnailUrl
          }
        : null
    )
  };
}

function getConfiguredTargetId(settings: NotionSettings): string {
  return settings.parentType === "data_source" ? settings.dataSourceId : settings.parentPageId;
}

function hasAnyMedia(post: ExtractedPost): boolean {
  return (
    post.imageUrls.length > 0 ||
    Boolean(post.videoUrl) ||
    (post.sourceType === "video" && Boolean(post.thumbnailUrl)) ||
    post.authorReplies.some((reply) => reply.imageUrls.length > 0 || Boolean(reply.videoUrl) || (reply.sourceType === "video" && Boolean(reply.thumbnailUrl)))
  );
}

function combineWarnings(...values: Array<string | null | undefined>): string | null {
  const unique = Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
  return unique.length > 0 ? unique.join(" | ") : null;
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

async function notionUploadRequest<T>(url: string, token: string, formData: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "notion-version": NOTION_VERSION
    },
    body: formData
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

async function renderBundle(
  post: ExtractedPost,
  includeImages: boolean,
  aiOrganization: AiOrganizationSettings | undefined,
  inlineMedia: boolean
): Promise<{ title: string; markdownContent: string; aiResult: AiOrganizationResult | null; warning: string | null }> {
  const ai = aiOrganization ? await organizePostWithAi(post, aiOrganization) : { result: null, warning: null };
  const mediaRefs = buildNotionMediaRefs(post, includeImages && inlineMedia);
  const markdownContent = await renderNotionMarkdown(post, mediaRefs, ai.warning, ai.result);

  return {
    title: post.title,
    markdownContent,
    aiResult: ai.result,
    warning: ai.warning
  };
}

function guessExtension(url: string, contentType: string | null): string {
  if (contentType?.includes("png")) {
    return "png";
  }
  if (contentType?.includes("webp")) {
    return "webp";
  }
  if (contentType?.includes("gif")) {
    return "gif";
  }
  if (contentType?.includes("mp4")) {
    return "mp4";
  }
  if (contentType?.includes("quicktime")) {
    return "mov";
  }

  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "bin";
}

function sanitizeUploadFilename(label: string, url: string, contentType: string | null): string {
  const extension = guessExtension(url, contentType);
  const baseName = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "threads-media";
  return baseName.includes(".") ? baseName : `${baseName}.${extension}`;
}

async function fetchMediaBlob(url: string, label: string): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`media_fetch_failed:${label}`);
  }

  const blob = await response.blob();
  const filename = sanitizeUploadFilename(label, url, response.headers.get("content-type"));
  return { blob, filename };
}

async function createFileUpload(token: string, filename: string, contentType: string, blobSize: number, numberOfParts?: number): Promise<NotionFileUploadResponse> {
  return await notionRequest<NotionFileUploadResponse>(NOTION_FILE_UPLOAD_API_URL, token, {
    method: "POST",
    body: JSON.stringify({
      mode: numberOfParts && numberOfParts > 1 ? "multi_part" : "single_part",
      filename,
      content_type: contentType,
      ...(numberOfParts && numberOfParts > 1 ? { number_of_parts: numberOfParts } : { content_length: blobSize })
    })
  });
}

async function completeFileUpload(token: string, fileUploadId: string): Promise<void> {
  await notionRequest<NotionFileUploadResponse>(`${NOTION_FILE_UPLOAD_API_URL}/${fileUploadId}/complete`, token, {
    method: "POST",
    body: JSON.stringify({})
  });
}

async function uploadBlobToNotion(token: string, blob: Blob, filename: string): Promise<string> {
  const contentType = blob.type || "application/octet-stream";
  const numberOfParts = blob.size > SINGLE_PART_UPLOAD_LIMIT_BYTES ? Math.ceil(blob.size / MULTI_PART_CHUNK_BYTES) : 1;
  const fileUpload = await createFileUpload(token, filename, contentType, blob.size, numberOfParts);
  if (!fileUpload.id) {
    throw new Error("missing_file_upload_id");
  }

  const uploadUrl = fileUpload.upload_url || `${NOTION_FILE_UPLOAD_API_URL}/${fileUpload.id}/send`;
  if (numberOfParts === 1) {
    const formData = new FormData();
    formData.append("file", blob, filename);
    await notionUploadRequest<NotionFileUploadResponse>(uploadUrl, token, formData);
    return fileUpload.id;
  }

  let offset = 0;
  let partNumber = 1;
  while (offset < blob.size) {
    const nextChunk = blob.slice(offset, Math.min(offset + MULTI_PART_CHUNK_BYTES, blob.size), contentType);
    const formData = new FormData();
    formData.append("part_number", String(partNumber));
    formData.append("file", nextChunk, filename);
    await notionUploadRequest<NotionFileUploadResponse>(uploadUrl, token, formData);
    offset += MULTI_PART_CHUNK_BYTES;
    partNumber += 1;
  }

  await completeFileUpload(token, fileUpload.id);
  return fileUpload.id;
}

async function uploadRemoteMediaFile(token: string, url: string, label: string, kind: "image" | "video"): Promise<UploadedNotionMediaFile> {
  const { blob, filename } = await fetchMediaBlob(url, label);
  const fileUploadId = await uploadBlobToNotion(token, blob, filename);
  return { fileUploadId, kind, label };
}

async function buildUploadedMediaGroups(
  token: string,
  post: ExtractedPost,
  replyLabel: string
): Promise<UploadedNotionMediaGroup[]> {
  const groups: UploadedNotionMediaGroup[] = [];

  const postFiles: UploadedNotionMediaFile[] = [];
  for (const [index, imageUrl] of post.imageUrls.entries()) {
    postFiles.push(await uploadRemoteMediaFile(token, imageUrl, `post-image-${index + 1}`, "image"));
  }
  if (post.sourceType === "video" && post.videoUrl) {
    postFiles.push(await uploadRemoteMediaFile(token, post.videoUrl, "post-video", "video"));
    if (post.thumbnailUrl) {
      postFiles.push(await uploadRemoteMediaFile(token, post.thumbnailUrl, "post-video-thumbnail", "image"));
    }
  }
  if (postFiles.length > 0) {
    groups.push({
      heading: post.title,
      files: postFiles
    });
  }

  for (const [index, reply] of post.authorReplies.entries()) {
    const replyFiles = await uploadReplyMediaFiles(token, reply, index);
    if (replyFiles.length > 0) {
      groups.push({
        heading: `${replyLabel} ${index + 1}`,
        files: replyFiles
      });
    }
  }

  return groups;
}

async function uploadReplyMediaFiles(token: string, reply: AuthorReply, replyIndex: number): Promise<UploadedNotionMediaFile[]> {
  const files: UploadedNotionMediaFile[] = [];
  for (const [index, imageUrl] of reply.imageUrls.entries()) {
    files.push(await uploadRemoteMediaFile(token, imageUrl, `reply-${replyIndex + 1}-image-${index + 1}`, "image"));
  }
  if (reply.sourceType === "video" && reply.videoUrl) {
    files.push(await uploadRemoteMediaFile(token, reply.videoUrl, `reply-${replyIndex + 1}-video`, "video"));
    if (reply.thumbnailUrl) {
      files.push(await uploadRemoteMediaFile(token, reply.thumbnailUrl, `reply-${replyIndex + 1}-video-thumbnail`, "image"));
    }
  }
  return files;
}

function buildHeadingBlock(level: 2 | 3, text: string): Record<string, unknown> {
  const type = level === 2 ? "heading_2" : "heading_3";
  return {
    object: "block",
    type,
    [type]: {
      rich_text: chunkRichText(text)
    }
  };
}

function buildFileBlock(file: UploadedNotionMediaFile): Record<string, unknown> {
  return {
    object: "block",
    type: file.kind,
    [file.kind]: {
      type: "file_upload",
      file_upload: {
        id: file.fileUploadId
      },
      caption: chunkRichText(file.label)
    }
  };
}

function buildUploadedMediaBlocks(groups: UploadedNotionMediaGroup[], sectionTitle: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  if (groups.length === 0) {
    return blocks;
  }

  blocks.push(buildHeadingBlock(2, sectionTitle));
  for (const group of groups) {
    blocks.push(buildHeadingBlock(3, group.heading));
    blocks.push(...group.files.map((file) => buildFileBlock(file)));
  }
  return blocks;
}

async function appendBlockChildren(token: string, blockId: string, children: Record<string, unknown>[]): Promise<void> {
  if (children.length === 0) {
    return;
  }

  await notionRequest<Record<string, unknown>>(`${NOTION_BLOCKS_API_URL}/${blockId}/children`, token, {
    method: "PATCH",
    body: JSON.stringify({
      children
    })
  });
}

export async function savePostToNotion(
  post: ExtractedPost,
  settings: NotionSettings,
  includeImages: boolean,
  aiOrganization?: AiOrganizationSettings,
  mediaPolicy?: NotionMediaPolicy
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

  let uploadedMediaBlocks: Record<string, unknown>[] = [];
  let mediaWarning: string | null = null;
  let inlineMedia = includeImages;

  if (includeImages && settings.uploadMedia && hasAnyMedia(post)) {
    if (mediaPolicy && !mediaPolicy.allowMediaDownloads) {
      mediaWarning = mediaPolicy.fallbackWarning;
    } else {
      try {
        const uploadedMediaGroups = await buildUploadedMediaGroups(token, post, msg.mdReplyLabel);
        uploadedMediaBlocks = buildUploadedMediaBlocks(uploadedMediaGroups, msg.mdUploadedMediaSection);
        inlineMedia = false;
      } catch {
        mediaWarning = combineWarnings(mediaPolicy?.fallbackWarning, msg.warnNotionMediaUploadFailed);
      }
    }
  }

  const bundle = await renderBundle(post, includeImages, aiOrganization, inlineMedia);
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

  if (uploadedMediaBlocks.length > 0) {
    try {
      await appendBlockChildren(token, responseBody.id, uploadedMediaBlocks);
    } catch {
      mediaWarning = combineWarnings(mediaWarning, msg.warnNotionMediaUploadFailed);
    }
  }

  return {
    pageId: responseBody.id,
    pageUrl: responseBody.url,
    title: bundle.title,
    warning: combineWarnings(bundle.warning, mediaWarning)
  };
}
