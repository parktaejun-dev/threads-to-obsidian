import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

import { JSDOM } from "jsdom";

import { BUNDLED_EXTRACTOR_CONFIG } from "@threads/shared/config";
import { extractPostFromDocument } from "@threads/shared/extractor";
import { renderMarkdown, type MarkdownMediaRefs } from "@threads/shared/markdown";
import { savePostToNotionCore } from "@threads/shared/notion";
import type {
  MobileSaveArchiveRecord,
  MobileSaveArchiveSyncResponse,
  MobileSaveNotionConnectionSummary,
  MobileSaveNotionExportItemInput,
  MobileSaveNotionExportItemResult,
  MobileSaveNotionExportRequest,
  MobileSaveNotionExportResponse,
  MobileSaveNotionLocationOption,
  MobileSaveNotionLocationSearchRequest,
  MobileSaveNotionLocationSelectRequest,
  MobileSavePairingStartRequest,
  MobileSavePairingStartResponse,
  MobileSavePairingStatusResponse
} from "@threads/shared/mobile-save";
import type { ExtractedPost, NotionParentType } from "@threads/shared/types";
import {
  buildArchiveTitle,
  extractShortcode,
  extractTitleExcerpt,
  normalizeThreadsUrl
} from "@threads/shared/utils";
import {
  withMobileSaveDatabaseRead,
  withMobileSaveDatabaseTransaction
} from "./store";
import type {
  MobileSaveBindingRecord,
  MobileSaveCollectorConfig,
  MobileSaveCollectorSummary,
  MobileSaveDatabase,
  MobileSaveDeviceRecord,
  MobileSaveNotionAuthSessionRecord,
  MobileSaveNotionConnectionRecord,
  MobileSavePairingRecord,
  MobileSaveProcessedMentionRecord,
  MobileSaveStoredArchiveRecord
} from "./types";

const DEFAULT_BOT_HANDLE = "ss_threads_mobile_bot";
const DEFAULT_PAIRING_TTL_MS = 10 * 60_000;
const DEFAULT_POLL_INTERVAL_MS = 60_000;
const DEFAULT_FETCH_LIMIT = 25;
const DEFAULT_MAX_PAGES = 3;
const MAX_FETCH_LIMIT = 100;
const MAX_PROCESSED_MENTION_RECORDS = 5_000;
const OUTBOUND_FETCH_TIMEOUT_MS = 15_000;
const THREADS_GRAPH_BASE_URL = "https://graph.threads.net";
const NOTION_AUTHORIZE_URL = "https://api.notion.com/v1/oauth/authorize";
const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";
const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";
const OAUTH_SESSION_TTL_MS = 10 * 60_000;
const THREAD_FIELDS = [
  "id",
  "text",
  "timestamp",
  "permalink",
  "shortcode",
  "username",
  "media_type",
  "media_url",
  "thumbnail_url"
];
const THREAD_RELATION_FIELDS = [
  "replied_to{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url,owner{id,username,name,is_verified}}",
  "root_post{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url,owner{id,username,name,is_verified}}",
  "quoted_post{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url,owner{id,username,name,is_verified}}",
  "owner{id,username,name,is_verified}"
];
const THREAD_DETAIL_FIELDS = [...THREAD_FIELDS, ...THREAD_RELATION_FIELDS];
const PAIRING_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MOBILE_SAVE_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

type ThreadsNode = Record<string, unknown>;

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function parsePositiveInt(raw: string | null | undefined, fallback: number, minimum = 1, maximum = Number.MAX_SAFE_INTEGER): number {
  const parsed = Number.parseInt(safeText(raw), 10);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return fallback;
  }
  return parsed;
}

function normalizeHandle(value: string | null | undefined): string {
  return safeText(value).replace(/^@+/, "").toLowerCase();
}

function normalizeOptionalThreadsUrl(value: string | null | undefined): string | null {
  const normalized = safeText(value);
  if (!normalized) {
    return null;
  }

  try {
    return normalizeThreadsUrl(normalized);
  } catch {
    return normalized;
  }
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function secretsMatch(rawValue: string, storedHash: string): boolean {
  if (!safeText(storedHash)) {
    return false;
  }

  return timingSafeEqual(Buffer.from(hashValue(rawValue), "hex"), Buffer.from(storedHash, "hex"));
}

function createTimeoutSignal(timeoutMs = OUTBOUND_FETCH_TIMEOUT_MS): AbortSignal {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Timed out after ${timeoutMs} ms.`));
  }, timeoutMs) as ReturnType<typeof setTimeout> & { unref?: () => void };
  timeout.unref?.();
  controller.signal.addEventListener("abort", () => clearTimeout(timeout), { once: true });
  return controller.signal;
}

function encodeCursor(updatedAt: string, id: string): string {
  return Buffer.from(JSON.stringify({ updatedAt, id }), "utf8").toString("base64url");
}

function decodeCursor(rawCursor: string | null | undefined): { updatedAt: string; id: string } | null {
  const normalized = safeText(rawCursor);
  if (!normalized) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(normalized, "base64url").toString("utf8")) as {
      updatedAt?: string;
      id?: string;
    };
    return safeText(parsed.updatedAt) && safeText(parsed.id)
      ? { updatedAt: safeText(parsed.updatedAt), id: safeText(parsed.id) }
      : null;
  } catch {
    return null;
  }
}

function compareCursorValues(left: { updatedAt: string; id: string }, right: { updatedAt: string; id: string }): number {
  const leftTime = Date.parse(left.updatedAt);
  const rightTime = Date.parse(right.updatedAt);
  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }
  return left.id.localeCompare(right.id);
}

function generatePairingCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let index = 0; index < length; index += 1) {
    code += PAIRING_CODE_ALPHABET[bytes[index]! % PAIRING_CODE_ALPHABET.length];
  }
  return code;
}

function expireStalePairings(data: MobileSaveDatabase, now: string): void {
  const nowMs = Date.parse(now);
  for (const pairing of data.pairings) {
    if (pairing.status === "pending" && Date.parse(pairing.expiresAt) <= nowMs) {
      pairing.status = "expired";
    }
  }
}

function touchDevice(
  data: MobileSaveDatabase,
  input: MobileSavePairingStartRequest,
  now: string
): MobileSaveDeviceRecord {
  const existing = data.devices.find((candidate) => candidate.id === input.deviceId) ?? null;
  if (existing) {
    if (!secretsMatch(input.deviceSecret, existing.secretHash)) {
      throw new Error("Device credentials are not valid.");
    }

    existing.label = safeText(input.deviceLabel) || existing.label || "Mobile device";
    existing.updatedAt = now;
    existing.lastSeenAt = now;
    return existing;
  }

  const device: MobileSaveDeviceRecord = {
    id: input.deviceId,
    secretHash: hashValue(input.deviceSecret),
    label: safeText(input.deviceLabel) || "Mobile device",
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
    activeBindingId: null
  };
  data.devices.push(device);
  return device;
}

function authenticateDevice(data: MobileSaveDatabase, deviceId: string, deviceSecret: string): MobileSaveDeviceRecord {
  const device = data.devices.find((candidate) => candidate.id === deviceId) ?? null;
  if (!device || !secretsMatch(deviceSecret, device.secretHash)) {
    throw new Error("Device credentials are not valid.");
  }
  return device;
}

function findActiveBindingForDevice(data: MobileSaveDatabase, deviceId: string): MobileSaveBindingRecord | null {
  return data.bindings.find((candidate) => candidate.deviceId === deviceId && candidate.active) ?? null;
}

function isSameAccount(
  binding: Pick<MobileSaveBindingRecord, "threadsUserId" | "threadsHandle">,
  threadsUserId: string | null,
  threadsHandle: string
): boolean {
  if (binding.threadsUserId && threadsUserId) {
    return binding.threadsUserId === threadsUserId;
  }
  return normalizeHandle(binding.threadsHandle) === normalizeHandle(threadsHandle);
}

function createMarkdownMediaRefs(post: ExtractedPost): MarkdownMediaRefs {
  return {
    postImages: [...post.imageUrls],
    postVideo:
      post.sourceType === "video"
        ? {
            file: post.videoUrl,
            thumbnail: post.thumbnailUrl
          }
        : null,
    replyImages: post.authorReplies.map((reply) => [...reply.imageUrls]),
    replyVideos: post.authorReplies.map((reply) =>
      reply.sourceType === "video"
        ? {
            file: reply.videoUrl,
            thumbnail: reply.thumbnailUrl
          }
        : null
    )
  };
}

function toArchiveRecord(
  post: ExtractedPost,
  mentionId: string,
  mentionUrl: string | null,
  mentionText: string | null,
  savedAt: string,
  markdownContent: string
): MobileSaveArchiveRecord {
  return {
    id: randomUUID(),
    mentionId,
    mentionUrl,
    sourceMentionText: mentionText,
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    text: post.text,
    publishedAt: post.publishedAt,
    capturedAt: post.capturedAt,
    sourceType: post.sourceType,
    imageUrls: [...post.imageUrls],
    videoUrl: post.videoUrl,
    externalUrl: post.externalUrl,
    quotedPostUrl: post.quotedPostUrl,
    repliedToUrl: post.repliedToUrl,
    thumbnailUrl: post.thumbnailUrl,
    authorReplies: post.authorReplies.map((reply) => ({ ...reply, imageUrls: [...reply.imageUrls] })),
    markdownContent,
    savedAt,
    updatedAt: savedAt
  };
}

function buildFallbackExtractedPost(targetNode: ThreadsNode | null, fallbackUrl: string, now: string): ExtractedPost {
  const targetUrl = normalizeOptionalThreadsUrl(buildThreadPermalink(targetNode) || fallbackUrl) ?? fallbackUrl;
  const author = extractThreadHandle(targetNode) || "unknown";
  const text = safeText(extractThreadText(targetNode)) || `Threads post by @${author}`;
  return {
    canonicalUrl: targetUrl,
    shortcode: extractShortcode(targetUrl) || `mobile-save-${Date.now()}`,
    author,
    title: buildArchiveTitle(author, text),
    text,
    publishedAt: extractThreadTimestamp(targetNode),
    capturedAt: now,
    sourceType: readThreadSourceType(targetNode),
    imageUrls: extractThreadImageUrls(targetNode),
    videoUrl: extractThreadVideoUrl(targetNode),
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl: extractThreadThumbnailUrl(targetNode),
    authorReplies: [],
    extractorVersion: "mobile-save-fallback",
    contentHash: hashValue(`${targetUrl}:${text}`).slice(0, 16)
  };
}

async function extractTargetPost(targetUrl: string): Promise<ExtractedPost | null> {
  const normalizedUrl = normalizeOptionalThreadsUrl(targetUrl);
  if (!normalizedUrl) {
    return null;
  }

  const response = await fetch(normalizedUrl, {
    signal: createTimeoutSignal(),
    cache: "no-store",
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "ko,en;q=0.8",
      "user-agent": MOBILE_SAVE_USER_AGENT
    }
  }).catch(() => null);
  if (!response?.ok) {
    return null;
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url: response.url || normalizedUrl });
  return await extractPostFromDocument(dom.window.document, dom.window.location.href, BUNDLED_EXTRACTOR_CONFIG).catch(() => null);
}

function buildThreadsApiBaseUrl(config: MobileSaveCollectorConfig): string {
  return `${THREADS_GRAPH_BASE_URL}/${safeText(config.graphApiVersion) ? `${safeText(config.graphApiVersion)}/` : ""}`;
}

function toRecord(value: unknown): ThreadsNode | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as ThreadsNode;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized || null;
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }
  return null;
}

function readNestedString(node: ThreadsNode | null, ...paths: string[][]): string | null {
  if (!node) {
    return null;
  }

  for (const path of paths) {
    let current: unknown = node;
    for (const segment of path) {
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        current = null;
        break;
      }
      current = (current as ThreadsNode)[segment];
    }
    const value = readString(current);
    if (value) {
      return value;
    }
  }

  return null;
}

function readNestedNode(node: ThreadsNode | null, ...paths: string[][]): ThreadsNode | null {
  if (!node) {
    return null;
  }

  for (const path of paths) {
    let current: unknown = node;
    for (const segment of path) {
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        current = null;
        break;
      }
      current = (current as ThreadsNode)[segment];
    }
    const record = toRecord(current);
    if (record) {
      return record;
    }
  }

  return null;
}

function readNestedBoolean(node: ThreadsNode | null, ...paths: string[][]): boolean | null {
  if (!node) {
    return null;
  }

  for (const path of paths) {
    let current: unknown = node;
    for (const segment of path) {
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        current = null;
        break;
      }
      current = (current as ThreadsNode)[segment];
    }

    const value = readBoolean(current);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function buildThreadPermalink(node: ThreadsNode | null): string | null {
  const permalink = readNestedString(node, ["permalink"]);
  if (permalink) {
    return permalink;
  }

  const username = normalizeHandle(readNestedString(node, ["username"], ["owner", "username"]));
  const shortcode = readNestedString(node, ["shortcode"]);
  if (!username || !shortcode) {
    return null;
  }

  return `https://www.threads.com/@${encodeURIComponent(username)}/post/${encodeURIComponent(shortcode)}`;
}

function extractThreadHandle(node: ThreadsNode | null): string | null {
  return normalizeHandle(readNestedString(node, ["username"], ["owner", "username"])) || null;
}

function extractThreadUserId(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["owner", "id"], ["user", "id"]);
}

function extractThreadDisplayName(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["name"], ["owner", "name"], ["owner", "username"]);
}

function extractThreadProfilePictureUrl(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["profile_picture_url"], ["owner", "profile_picture_url"], ["owner", "profile_picture"]);
}

function extractThreadIsVerified(node: ThreadsNode | null): boolean {
  return (
    readNestedBoolean(node, ["is_verified"], ["owner", "is_verified"], ["owner", "verified"]) ??
    false
  );
}

function extractThreadText(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["text"], ["caption"], ["content"]);
}

function extractThreadTimestamp(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["timestamp"]);
}

function extractThreadMediaType(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["media_type"]);
}

function extractThreadImageUrls(node: ThreadsNode | null): string[] {
  const mediaUrl = readNestedString(node, ["media_url"]);
  if (extractThreadMediaType(node)?.toUpperCase() === "VIDEO") {
    return [];
  }
  return mediaUrl ? [mediaUrl] : [];
}

function extractThreadVideoUrl(node: ThreadsNode | null): string | null {
  return extractThreadMediaType(node)?.toUpperCase() === "VIDEO" ? readNestedString(node, ["media_url"]) : null;
}

function extractThreadThumbnailUrl(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["thumbnail_url"]);
}

function readThreadSourceType(node: ThreadsNode | null): ExtractedPost["sourceType"] {
  const mediaType = safeText(extractThreadMediaType(node)).toUpperCase();
  if (mediaType === "VIDEO") {
    return "video";
  }
  if (mediaType === "IMAGE" || mediaType === "CAROUSEL_ALBUM") {
    return "image";
  }
  return "text";
}

function extractRelatedThreadNode(node: ThreadsNode | null): ThreadsNode | null {
  return (
    readNestedNode(node, ["root_post"]) ??
    readNestedNode(node, ["replied_to"]) ??
    readNestedNode(node, ["reply_to"]) ??
    readNestedNode(node, ["quoted_post"])
  );
}

async function fetchThreadsJson(url: URL, accessToken: string): Promise<ThreadsNode> {
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url, {
    signal: createTimeoutSignal(),
    headers: {
      accept: "application/json"
    }
  });
  const payload = (await response.json().catch(() => null)) as ThreadsNode | null;
  if (!response.ok) {
    throw new Error(readNestedString(toRecord(payload), ["error", "message"]) || `Threads API request failed (${response.status}).`);
  }
  return toRecord(payload) ?? {};
}

async function fetchMentionPage(
  config: MobileSaveCollectorConfig,
  accessToken: string,
  afterCursor: string | null
): Promise<{ items: ThreadsNode[]; nextCursor: string | null }> {
  const url = new URL("me/mentions", buildThreadsApiBaseUrl(config));
  url.searchParams.set("fields", THREAD_FIELDS.join(","));
  url.searchParams.set("limit", String(config.fetchLimit));
  if (afterCursor) {
    url.searchParams.set("after", afterCursor);
  }

  const payload = await fetchThreadsJson(url, accessToken);
  return {
    items: Array.isArray(payload.data) ? payload.data.map(toRecord).filter((value): value is ThreadsNode => Boolean(value)) : [],
    nextCursor: readNestedString(toRecord(payload.paging), ["cursors", "after"])
  };
}

async function fetchThreadNode(config: MobileSaveCollectorConfig, accessToken: string, threadId: string): Promise<ThreadsNode | null> {
  const url = new URL(encodeURIComponent(threadId), buildThreadsApiBaseUrl(config));
  url.searchParams.set("fields", THREAD_DETAIL_FIELDS.join(","));
  return await fetchThreadsJson(url, accessToken).catch(() => null);
}

function extractPairingCode(text: string | null): string | null {
  const normalized = safeText(text).toUpperCase();
  const segments = normalized.match(/[A-Z0-9]+/g) ?? [];
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const candidate = segments[index] ?? "";
    if (/^[A-HJ-NP-Z2-9]{6}$/.test(candidate)) {
      return candidate;
    }
  }
  return null;
}

function findPendingPairingByCode(data: MobileSaveDatabase, code: string, now: string): MobileSavePairingRecord | null {
  expireStalePairings(data, now);
  const codeHash = hashValue(code);
  return (
    data.pairings
      .filter((candidate) => candidate.status === "pending" && candidate.codeHash === codeHash)
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0] ?? null
  );
}

function recordProcessedMention(
  data: MobileSaveDatabase,
  mentionId: string,
  mentionUrl: string | null,
  outcome: MobileSaveProcessedMentionRecord["outcome"],
  now: string
): void {
  const existing = data.processedMentions.find((candidate) => candidate.mentionId === mentionId) ?? null;
  if (existing) {
    existing.mentionUrl = mentionUrl;
    existing.outcome = outcome;
    existing.processedAt = now;
  } else {
    data.processedMentions.push({
      mentionId,
      mentionUrl,
      outcome,
      processedAt: now
    });
  }

  data.processedMentions.sort((left, right) => Date.parse(right.processedAt) - Date.parse(left.processedAt));
  if (data.processedMentions.length > MAX_PROCESSED_MENTION_RECORDS) {
    data.processedMentions = data.processedMentions.slice(0, MAX_PROCESSED_MENTION_RECORDS);
  }
}

function applyPairing(
  data: MobileSaveDatabase,
  pairing: MobileSavePairingRecord,
  device: MobileSaveDeviceRecord,
  account: {
    threadsUserId: string | null;
    threadsHandle: string;
    displayName: string | null;
    profilePictureUrl: string | null;
    isVerified: boolean;
  },
  mentionId: string,
  mentionUrl: string | null,
  now: string
): void {
  for (const binding of data.bindings) {
    if (!binding.active) {
      continue;
    }

    const sameDevice = binding.deviceId === device.id;
    const sameAccount = isSameAccount(binding, account.threadsUserId, account.threadsHandle);
    if (!sameDevice && !sameAccount) {
      continue;
    }

    binding.active = false;
    binding.replacedAt = now;
    const boundDevice = data.devices.find((candidate) => candidate.id === binding.deviceId) ?? null;
    if (boundDevice?.activeBindingId === binding.id) {
      boundDevice.activeBindingId = null;
      boundDevice.updatedAt = now;
    }
  }

  const binding: MobileSaveBindingRecord = {
    id: randomUUID(),
    deviceId: device.id,
    threadsUserId: account.threadsUserId,
    threadsHandle: account.threadsHandle,
    displayName: account.displayName,
    profilePictureUrl: account.profilePictureUrl,
    isVerified: account.isVerified,
    pairedAt: now,
    active: true,
    replacedAt: null
  };
  data.bindings.push(binding);
  device.activeBindingId = binding.id;
  device.updatedAt = now;
  device.lastSeenAt = now;

  pairing.status = "paired";
  pairing.consumedAt = now;
  pairing.pairedAt = now;
  pairing.mentionId = mentionId;
  pairing.mentionUrl = mentionUrl;
  pairing.threadsUserId = account.threadsUserId;
  pairing.threadsHandle = account.threadsHandle;
  pairing.displayName = account.displayName;
  pairing.profilePictureUrl = account.profilePictureUrl;
  pairing.isVerified = account.isVerified;
}

function upsertArchive(
  data: MobileSaveDatabase,
  binding: MobileSaveBindingRecord,
  archive: MobileSaveArchiveRecord,
  now: string
): { created: boolean } {
  const existing =
    data.archives.find(
      (candidate) =>
        candidate.deviceId === binding.deviceId &&
        isSameAccount(candidate, binding.threadsUserId, binding.threadsHandle) &&
        candidate.canonicalUrl === archive.canonicalUrl
    ) ?? null;

  if (existing) {
    existing.mentionId = archive.mentionId;
    existing.mentionUrl = archive.mentionUrl;
    existing.sourceMentionText = archive.sourceMentionText;
    existing.author = archive.author;
    existing.title = archive.title;
    existing.text = archive.text;
    existing.publishedAt = archive.publishedAt;
    existing.capturedAt = archive.capturedAt;
    existing.sourceType = archive.sourceType;
    existing.imageUrls = [...archive.imageUrls];
    existing.videoUrl = archive.videoUrl;
    existing.externalUrl = archive.externalUrl;
    existing.quotedPostUrl = archive.quotedPostUrl;
    existing.repliedToUrl = archive.repliedToUrl;
    existing.thumbnailUrl = archive.thumbnailUrl;
    existing.authorReplies = archive.authorReplies.map((reply) => ({ ...reply, imageUrls: [...reply.imageUrls] }));
    existing.markdownContent = archive.markdownContent;
    existing.updatedAt = now;
    return { created: false };
  }

  data.archives.push({
    ...archive,
    deviceId: binding.deviceId,
    bindingId: binding.id,
    threadsUserId: binding.threadsUserId,
    threadsHandle: binding.threadsHandle
  });
  return { created: true };
}

export function getMobileSaveCollectorConfig(): MobileSaveCollectorConfig {
  return {
    botHandle: safeText(process.env.THREADS_MOBILE_SAVE_BOT_HANDLE) || DEFAULT_BOT_HANDLE,
    accessToken: safeText(process.env.THREADS_MOBILE_SAVE_BOT_ACCESS_TOKEN),
    pairingPostUrl: safeText(process.env.THREADS_MOBILE_SAVE_PAIRING_POST_URL),
    graphApiVersion: safeText(process.env.THREADS_MOBILE_SAVE_GRAPH_API_VERSION) || "v1.0",
    intervalMs: parsePositiveInt(process.env.THREADS_MOBILE_SAVE_POLL_INTERVAL_MS, DEFAULT_POLL_INTERVAL_MS, 5_000),
    fetchLimit: parsePositiveInt(process.env.THREADS_MOBILE_SAVE_FETCH_LIMIT, DEFAULT_FETCH_LIMIT, 1, MAX_FETCH_LIMIT),
    maxPages: parsePositiveInt(process.env.THREADS_MOBILE_SAVE_MAX_PAGES, DEFAULT_MAX_PAGES, 1, 20)
  };
}

export function getMobileSavePublicConfig(): { botHandle: string; pairingPostUrl: string } {
  const config = getMobileSaveCollectorConfig();
  return {
    botHandle: config.botHandle,
    pairingPostUrl: config.pairingPostUrl
  };
}

interface MobileSaveNotionOauthConfig {
  clientId: string;
  clientSecret: string;
}

interface MobileSaveNotionTokenResponse {
  access_token?: string;
  refresh_token?: string | null;
  workspace_id?: string;
  workspace_name?: string | null;
  workspace_icon?: string | null;
  bot_id?: string;
}

interface MobileSaveNotionSearchResponse {
  results?: unknown[];
}

function getMobileSaveNotionOauthConfig(): MobileSaveNotionOauthConfig | null {
  const clientId = safeText(process.env.THREADS_MOBILE_SAVE_NOTION_CLIENT_ID);
  const clientSecret = safeText(process.env.THREADS_MOBILE_SAVE_NOTION_CLIENT_SECRET);
  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

function getMobileSaveNotionApiVersion(): string {
  return safeText(process.env.THREADS_MOBILE_SAVE_NOTION_VERSION) || NOTION_VERSION;
}

function buildMobileSaveNotionRedirectUri(publicOrigin: string): string {
  return `${publicOrigin.replace(/\/+$/, "")}/mobile-save/notion/oauth/callback`;
}

function buildMobileSaveNotionAuthorizeUrl(redirectUri: string, state: string, clientId: string): string {
  const url = new URL(NOTION_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("owner", "user");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

function buildMobileSaveNotionSummary(
  connection: MobileSaveNotionConnectionRecord | null
): MobileSaveNotionConnectionSummary {
  return {
    connected: Boolean(connection && connection.status === "active"),
    workspaceId: connection?.workspaceId ?? null,
    workspaceName: connection?.workspaceName ?? null,
    workspaceIcon: connection?.workspaceIcon ?? null,
    selectedParentType: connection?.selectedParentType ?? null,
    selectedParentId: connection?.selectedParentId ?? null,
    selectedParentLabel: connection?.selectedParentLabel ?? null,
    selectedParentUrl: connection?.selectedParentUrl ?? null,
    displayName: connection?.displayName ?? null,
    threadsHandle: connection?.threadsHandle ?? null,
    profilePictureUrl: connection?.profilePictureUrl ?? null,
    isVerified: connection?.isVerified === true
  };
}

function getActiveMobileSaveBinding(data: MobileSaveDatabase, deviceId: string): MobileSaveBindingRecord | null {
  return data.bindings.find((candidate) => candidate.deviceId === deviceId && candidate.active) ?? null;
}

function getActiveMobileSaveNotionConnection(
  data: MobileSaveDatabase,
  deviceId: string
): MobileSaveNotionConnectionRecord | null {
  const binding = getActiveMobileSaveBinding(data, deviceId);
  if (!binding) {
    return null;
  }

  return (
    data.notionConnections.find(
      (candidate) =>
        candidate.deviceId === deviceId &&
        candidate.bindingId === binding.id &&
        candidate.status === "active"
    ) ?? null
  );
}

function getPendingMobileSaveNotionSession(
  data: MobileSaveDatabase,
  sessionId: string
): MobileSaveNotionAuthSessionRecord | null {
  return data.notionAuthSessions.find((candidate) => candidate.id === sessionId && candidate.status === "pending") ?? null;
}

function expireMobileSaveNotionSessions(data: MobileSaveDatabase, now: string): void {
  const nowMs = Date.parse(now);
  for (const session of data.notionAuthSessions) {
    if (session.status === "pending" && Date.parse(session.expiresAt) <= nowMs) {
      session.status = "expired";
    }
  }
}

function upsertMobileSaveNotionAuthSession(data: MobileSaveDatabase, session: MobileSaveNotionAuthSessionRecord): void {
  const index = data.notionAuthSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.notionAuthSessions[index] = session;
    return;
  }

  data.notionAuthSessions.unshift(session);
}

function upsertMobileSaveNotionConnection(data: MobileSaveDatabase, connection: MobileSaveNotionConnectionRecord): void {
  const index = data.notionConnections.findIndex((candidate) => candidate.id === connection.id);
  if (index >= 0) {
    data.notionConnections[index] = connection;
    return;
  }

  data.notionConnections.unshift(connection);
}

function buildMobileSaveNotionLocationOption(result: unknown): MobileSaveNotionLocationOption | null {
  if (!result || typeof result !== "object") {
    return null;
  }

  const record = result as Record<string, unknown>;
  const objectType = safeText(typeof record.object === "string" ? record.object : null);
  const id = safeText(typeof record.id === "string" ? record.id : null);
  const url = safeText(typeof record.url === "string" ? record.url : null);
  if (!id || !url || (objectType !== "page" && objectType !== "data_source")) {
    return null;
  }

  const titleArray = Array.isArray(record.title)
    ? record.title
        .map((item) => {
          if (!item || typeof item !== "object") {
            return "";
          }
          const entry = item as Record<string, unknown>;
          return safeText(typeof entry.plain_text === "string" ? entry.plain_text : null);
        })
        .join(" ")
        .trim()
    : "";

  let title = titleArray;
  if (!title && record.properties && typeof record.properties === "object" && !Array.isArray(record.properties)) {
    for (const value of Object.values(record.properties as Record<string, unknown>)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }
      const property = value as Record<string, unknown>;
      if (property.type !== "title" || !Array.isArray(property.title)) {
        continue;
      }
      title = property.title
        .map((item) => {
          if (!item || typeof item !== "object") {
            return "";
          }
          const entry = item as Record<string, unknown>;
          return safeText(typeof entry.plain_text === "string" ? entry.plain_text : null);
        })
        .join(" ")
        .trim();
      if (title) {
        break;
      }
    }
  }

  return {
    id,
    type: objectType as MobileSaveNotionLocationOption["type"],
    label: title || "Untitled",
    url,
    subtitle: objectType === "data_source" ? "Data source" : "Page"
  };
}

async function notionRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "notion-version": getMobileSaveNotionApiVersion(),
      ...(init?.headers ?? {})
    }
  });

  const body = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!response.ok) {
    throw new Error(body?.message?.trim() || `Notion request failed (${response.status}).`);
  }

  return (body ?? {}) as T;
}

async function notionTokenRequest(
  payload: Record<string, unknown>,
  config: MobileSaveNotionOauthConfig
): Promise<MobileSaveNotionTokenResponse> {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: `Basic ${basic}`,
      "content-type": "application/json",
      "notion-version": getMobileSaveNotionApiVersion()
    },
    body: JSON.stringify(payload)
  });

  const body = (await response.json().catch(() => null)) as (MobileSaveNotionTokenResponse & { message?: string }) | null;
  if (!response.ok) {
    throw new Error(body?.message?.trim() || "Notion OAuth token exchange failed.");
  }

  return body ?? {};
}

async function exchangeMobileSaveNotionOAuthCode(
  code: string,
  redirectUri: string,
  config: MobileSaveNotionOauthConfig
): Promise<MobileSaveNotionTokenResponse> {
  return await notionTokenRequest(
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    },
    config
  );
}

async function searchMobileSaveNotionLocationsWithToken(
  token: string,
  parentType: "page" | "data_source",
  query: string
): Promise<MobileSaveNotionLocationOption[]> {
  const payload: Record<string, unknown> = { page_size: 30 };
  if (query.trim()) {
    payload.query = query.trim();
  }

  const response = await notionRequest<MobileSaveNotionSearchResponse>(`${NOTION_API_URL}/search`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return (response.results ?? [])
    .map((item) => buildMobileSaveNotionLocationOption(item))
    .filter((item): item is MobileSaveNotionLocationOption => Boolean(item))
    .filter((item) => item.type === parentType)
    .slice(0, 20);
}

async function chooseDefaultMobileSaveNotionLocation(token: string): Promise<MobileSaveNotionLocationOption | null> {
  const page = await searchMobileSaveNotionLocationsWithToken(token, "page", "");
  if (page.length > 0) {
    return page[0] ?? null;
  }

  const dataSource = await searchMobileSaveNotionLocationsWithToken(token, "data_source", "");
  return dataSource[0] ?? null;
}

function exportItemToExtractedPost(item: MobileSaveNotionExportItemInput): ExtractedPost {
  return {
    canonicalUrl: item.canonicalUrl,
    shortcode: item.shortcode,
    author: item.author,
    title: item.title,
    text: item.text,
    publishedAt: item.publishedAt,
    capturedAt: item.capturedAt,
    sourceType: item.sourceType,
    imageUrls: [...item.imageUrls],
    videoUrl: item.videoUrl,
    externalUrl: item.externalUrl,
    quotedPostUrl: item.quotedPostUrl,
    repliedToUrl: item.repliedToUrl,
    thumbnailUrl: item.thumbnailUrl,
    authorReplies: item.authorReplies.map((reply) => ({ ...reply, imageUrls: [...reply.imageUrls] })),
    extractorVersion: "mobile-save-export",
    contentHash: hashValue(`${item.canonicalUrl}:${item.text}:${item.savedAt}`).slice(0, 16)
  };
}

export async function createPairingSession(
  input: MobileSavePairingStartRequest
): Promise<MobileSavePairingStartResponse> {
  const deviceId = safeText(input.deviceId);
  const deviceSecret = safeText(input.deviceSecret);
  if (!deviceId || !deviceSecret) {
    throw new Error("deviceId and deviceSecret are required.");
  }

  const config = getMobileSaveCollectorConfig();
  if (!config.pairingPostUrl) {
    throw new Error("THREADS_MOBILE_SAVE_PAIRING_POST_URL is not configured.");
  }

  return await withMobileSaveDatabaseTransaction(async (data) => {
    const now = new Date().toISOString();
    expireStalePairings(data, now);
    const device = touchDevice(data, { ...input, deviceId, deviceSecret }, now);
    for (const pairing of data.pairings) {
      if (pairing.deviceId === device.id && pairing.status === "pending") {
        pairing.status = "expired";
      }
    }

    const pairingCode = generatePairingCode();
    const expiresAt = new Date(Date.now() + DEFAULT_PAIRING_TTL_MS).toISOString();
    const pairing: MobileSavePairingRecord = {
      id: randomUUID(),
      deviceId: device.id,
      codeHash: hashValue(pairingCode),
      createdAt: now,
      expiresAt,
      consumedAt: null,
      pairedAt: null,
      mentionId: null,
      mentionUrl: null,
      threadsUserId: null,
      threadsHandle: null,
      displayName: null,
      profilePictureUrl: null,
      isVerified: false,
      status: "pending"
    };
    data.pairings.push(pairing);

    return {
      pairingId: pairing.id,
      pairingCode,
      expiresAt,
      botHandle: config.botHandle,
      pairingPostUrl: config.pairingPostUrl,
      status: "pending"
    };
  });
}

export async function readPairingStatus(
  pairingId: string,
  deviceId: string,
  deviceSecret: string
): Promise<MobileSavePairingStatusResponse> {
  return await withMobileSaveDatabaseTransaction(async (data) => {
    const now = new Date().toISOString();
    expireStalePairings(data, now);
    authenticateDevice(data, deviceId, deviceSecret);
    const pairing = data.pairings.find((candidate) => candidate.id === pairingId && candidate.deviceId === deviceId) ?? null;
    if (!pairing) {
      throw new Error("Pairing session was not found.");
    }

    return {
      pairingId: pairing.id,
      status: pairing.status,
      expiresAt: pairing.expiresAt,
      pairedAt: pairing.pairedAt,
      pairedAccount:
        pairing.status === "paired" && pairing.threadsHandle
          ? {
              threadsUserId: pairing.threadsUserId,
              threadsHandle: pairing.threadsHandle,
              displayName: pairing.displayName ?? null,
              profilePictureUrl: pairing.profilePictureUrl ?? null,
              isVerified: pairing.isVerified === true
            }
          : null
    };
  });
}

export async function createMobileSaveNotionAuthStart(
  deviceId: string,
  deviceSecret: string,
  deviceLabel: string,
  publicOrigin: string
): Promise<{
  authorizeUrl: string;
  sessionId: string;
  expiresAt: string;
  connection: MobileSaveNotionConnectionSummary;
}> {
  const config = getMobileSaveNotionOauthConfig();
  if (!config) {
    throw new Error("THREADS_MOBILE_SAVE_NOTION_CLIENT_ID and THREADS_MOBILE_SAVE_NOTION_CLIENT_SECRET are required.");
  }

  return await withMobileSaveDatabaseTransaction(async (data) => {
    const now = new Date().toISOString();
    expireStalePairings(data, now);
    expireMobileSaveNotionSessions(data, now);
    const device = authenticateDevice(data, deviceId, deviceSecret);
    device.label = safeText(deviceLabel) || device.label || "Mobile device";
    device.updatedAt = now;
    device.lastSeenAt = now;

    const binding = getActiveMobileSaveBinding(data, device.id);
    if (!binding) {
      throw new Error("Device is not paired.");
    }

    const session: MobileSaveNotionAuthSessionRecord = {
      id: randomUUID(),
      deviceId: device.id,
      bindingId: binding.id,
      threadsUserId: binding.threadsUserId,
      threadsHandle: binding.threadsHandle,
      displayName: binding.displayName ?? null,
      profilePictureUrl: binding.profilePictureUrl ?? null,
      isVerified: binding.isVerified === true,
      createdAt: now,
      expiresAt: new Date(Date.now() + OAUTH_SESSION_TTL_MS).toISOString(),
      completedAt: null,
      status: "pending"
    };
    upsertMobileSaveNotionAuthSession(data, session);

    const existing = getActiveMobileSaveNotionConnection(data, device.id);

    return {
      authorizeUrl: buildMobileSaveNotionAuthorizeUrl(buildMobileSaveNotionRedirectUri(publicOrigin), session.id, config.clientId),
      sessionId: session.id,
      expiresAt: session.expiresAt,
      connection: buildMobileSaveNotionSummary(existing)
    };
  });
}

export async function completeMobileSaveNotionAuth(
  state: string,
  code: string,
  publicOrigin: string
): Promise<MobileSaveNotionConnectionSummary> {
  const config = getMobileSaveNotionOauthConfig();
  if (!config) {
    throw new Error("THREADS_MOBILE_SAVE_NOTION_CLIENT_ID and THREADS_MOBILE_SAVE_NOTION_CLIENT_SECRET are required.");
  }

  return await withMobileSaveDatabaseTransaction(async (data) => {
    const now = new Date().toISOString();
    expireMobileSaveNotionSessions(data, now);
    const session = getPendingMobileSaveNotionSession(data, state);
    if (!session) {
      throw new Error("This Notion connection session is no longer valid.");
    }

    if (Date.parse(session.expiresAt) <= Date.parse(now)) {
      session.status = "expired";
      upsertMobileSaveNotionAuthSession(data, session);
      throw new Error("This Notion connection session has expired.");
    }

    const tokenResponse = await exchangeMobileSaveNotionOAuthCode(
      safeText(code),
      buildMobileSaveNotionRedirectUri(publicOrigin),
      config
    );
    if (!tokenResponse.access_token || !tokenResponse.workspace_id || !tokenResponse.bot_id) {
      throw new Error("Notion OAuth completed without a usable access token.");
    }

    const existing =
      data.notionConnections.find(
        (candidate) =>
          candidate.deviceId === session.deviceId &&
          candidate.bindingId === session.bindingId &&
          candidate.status === "active"
      ) ?? null;

    if (existing) {
      existing.status = "revoked";
      existing.revokedAt = now;
      existing.updatedAt = now;
      upsertMobileSaveNotionConnection(data, existing);
    }

    for (const connection of data.notionConnections) {
      if (connection.deviceId !== session.deviceId || connection.bindingId === session.bindingId || connection.status !== "active") {
        continue;
      }
      connection.status = "revoked";
      connection.revokedAt = now;
      connection.updatedAt = now;
    }

    const connection: MobileSaveNotionConnectionRecord = {
      id: existing?.id ?? randomUUID(),
      deviceId: session.deviceId,
      bindingId: session.bindingId,
      threadsUserId: session.threadsUserId,
      threadsHandle: session.threadsHandle,
      displayName: session.displayName ?? null,
      profilePictureUrl: session.profilePictureUrl ?? null,
      isVerified: session.isVerified === true,
      workspaceId: tokenResponse.workspace_id,
      workspaceName: tokenResponse.workspace_name ?? null,
      workspaceIcon: tokenResponse.workspace_icon ?? null,
      botId: tokenResponse.bot_id,
      accessToken: tokenResponse.access_token,
      refreshToken: typeof tokenResponse.refresh_token === "string" && tokenResponse.refresh_token.trim() ? tokenResponse.refresh_token : null,
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
      const defaultLocation = await chooseDefaultMobileSaveNotionLocation(tokenResponse.access_token);
      if (defaultLocation) {
        connection.selectedParentType = defaultLocation.type;
        connection.selectedParentId = defaultLocation.id;
        connection.selectedParentLabel = defaultLocation.label;
        connection.selectedParentUrl = defaultLocation.url;
      }
    }

    upsertMobileSaveNotionConnection(data, connection);
    session.completedAt = now;
    session.status = "completed";
    upsertMobileSaveNotionAuthSession(data, session);
    return buildMobileSaveNotionSummary(connection);
  });
}

export function getMobileSaveNotionConnectionSummary(
  data: MobileSaveDatabase,
  deviceId: string,
  deviceSecret: string
): MobileSaveNotionConnectionSummary {
  authenticateDevice(data, deviceId, deviceSecret);
  return buildMobileSaveNotionSummary(getActiveMobileSaveNotionConnection(data, deviceId));
}

export function disconnectMobileSaveNotionConnection(
  data: MobileSaveDatabase,
  deviceId: string,
  deviceSecret: string
): MobileSaveNotionConnectionSummary {
  authenticateDevice(data, deviceId, deviceSecret);
  const connection = getActiveMobileSaveNotionConnection(data, deviceId);
  if (!connection) {
    return buildMobileSaveNotionSummary(null);
  }

  connection.status = "revoked";
  connection.revokedAt = new Date().toISOString();
  connection.updatedAt = connection.revokedAt;
  upsertMobileSaveNotionConnection(data, connection);
  return buildMobileSaveNotionSummary(null);
}

export async function searchMobileSaveNotionLocations(
  data: MobileSaveDatabase,
  deviceId: string,
  deviceSecret: string,
  parentType: "page" | "data_source",
  query: string
): Promise<MobileSaveNotionLocationOption[]> {
  authenticateDevice(data, deviceId, deviceSecret);
  const connection = getActiveMobileSaveNotionConnection(data, deviceId);
  if (!connection) {
    throw new Error("Notion is not connected.");
  }

  return await notionRequest<MobileSaveNotionSearchResponse>(`${NOTION_API_URL}/search`, connection.accessToken, {
    method: "POST",
    body: JSON.stringify({
      query: safeText(query) || undefined,
      page_size: 30
    })
  }).then((response) =>
    (response.results ?? [])
      .map((item) => buildMobileSaveNotionLocationOption(item))
      .filter((item): item is MobileSaveNotionLocationOption => Boolean(item))
      .filter((item) => item.type === parentType)
      .slice(0, 20)
  );
}

export async function selectMobileSaveNotionLocation(
  data: MobileSaveDatabase,
  deviceId: string,
  deviceSecret: string,
  parentType: "page" | "data_source",
  targetId: string,
  targetLabel: string,
  targetUrl: string
): Promise<MobileSaveNotionConnectionSummary> {
  authenticateDevice(data, deviceId, deviceSecret);
  const connection = getActiveMobileSaveNotionConnection(data, deviceId);
  if (!connection) {
    throw new Error("Notion is not connected.");
  }

  connection.selectedParentType = parentType;
  connection.selectedParentId = targetId.trim();
  connection.selectedParentLabel = targetLabel.trim() || "Untitled";
  connection.selectedParentUrl = targetUrl.trim();
  connection.updatedAt = new Date().toISOString();
  upsertMobileSaveNotionConnection(data, connection);
  return buildMobileSaveNotionSummary(connection);
}

export async function saveMobileSaveArchivesThroughNotionConnection(
  data: MobileSaveDatabase,
  deviceId: string,
  deviceSecret: string,
  payload: MobileSaveNotionExportRequest
): Promise<MobileSaveNotionExportResponse> {
  authenticateDevice(data, deviceId, deviceSecret);
  const connection = getActiveMobileSaveNotionConnection(data, deviceId);
  if (!connection || !connection.selectedParentType || !connection.selectedParentId) {
    throw new Error("Notion is connected, but no default save location is selected.");
  }

  const payloadItems = Array.isArray(payload.items) ? payload.items.filter((item) => Boolean(item && item.canonicalUrl && item.title)) : [];
  const fallbackArchiveIds = Array.from(new Set((payload.archiveIds ?? []).map((id) => safeText(id)).filter(Boolean)));
  const targetItems: Array<MobileSaveNotionExportItemInput & { archiveId: string | null }> =
    payloadItems.length > 0
      ? payloadItems.map((item) => ({ ...item, archiveId: safeText(item.archiveId) || null }))
      : (fallbackArchiveIds.length > 0
          ? data.archives
              .filter((candidate) => candidate.deviceId === deviceId && fallbackArchiveIds.includes(candidate.id))
              .map((archive) => ({
                archiveId: archive.id,
                canonicalUrl: archive.canonicalUrl,
                shortcode: archive.shortcode,
                author: archive.author,
                title: archive.title,
                text: archive.text,
                publishedAt: archive.publishedAt,
                capturedAt: archive.capturedAt,
                sourceType: archive.sourceType,
                imageUrls: [...archive.imageUrls],
                videoUrl: archive.videoUrl,
                externalUrl: archive.externalUrl,
                quotedPostUrl: archive.quotedPostUrl,
                repliedToUrl: archive.repliedToUrl,
                thumbnailUrl: archive.thumbnailUrl,
                authorReplies: archive.authorReplies.map((reply) => ({ ...reply, imageUrls: [...reply.imageUrls] })),
                markdownContent: archive.markdownContent,
                savedAt: archive.savedAt,
                updatedAt: archive.updatedAt
              }))
          : data.archives
              .filter((candidate) => candidate.deviceId === deviceId)
              .map((archive) => ({
                archiveId: archive.id,
                canonicalUrl: archive.canonicalUrl,
                shortcode: archive.shortcode,
                author: archive.author,
                title: archive.title,
                text: archive.text,
                publishedAt: archive.publishedAt,
                capturedAt: archive.capturedAt,
                sourceType: archive.sourceType,
                imageUrls: [...archive.imageUrls],
                videoUrl: archive.videoUrl,
                externalUrl: archive.externalUrl,
                quotedPostUrl: archive.quotedPostUrl,
                repliedToUrl: archive.repliedToUrl,
                thumbnailUrl: archive.thumbnailUrl,
                authorReplies: archive.authorReplies.map((reply) => ({ ...reply, imageUrls: [...reply.imageUrls] })),
                markdownContent: archive.markdownContent,
                savedAt: archive.savedAt,
                updatedAt: archive.updatedAt
              })));

  const results: MobileSaveNotionExportItemResult[] = [];
  const warnings = new Set<string>();
  for (const archive of targetItems) {
    try {
      const exported = await savePostToNotionCore(exportItemToExtractedPost(archive), {
        token: connection.accessToken,
        parentType: connection.selectedParentType as NotionParentType,
        targetId: connection.selectedParentId,
        includeImages: Boolean(payload.includeImages),
        uploadMedia: Boolean(payload.uploadMedia)
      });
      results.push({
        archiveId: archive.archiveId ?? null,
        canonicalUrl: archive.canonicalUrl,
        pageId: exported.pageId,
        pageUrl: exported.pageUrl,
        title: exported.title,
        warning: exported.warning
      });
      if (exported.warning) {
        warnings.add(exported.warning);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "notion_export_failed";
      warnings.add(`${archive.archiveId ?? archive.canonicalUrl}:${message}`);
    }
  }

  return {
    results,
    warning: warnings.size > 0 ? Array.from(warnings).join(" | ") : null
  };
}

export async function listArchivesForDevice(
  deviceId: string,
  deviceSecret: string,
  rawCursor?: string | null
): Promise<MobileSaveArchiveSyncResponse> {
  return await withMobileSaveDatabaseRead(async (data) => {
    authenticateDevice(data, deviceId, deviceSecret);
    const cursor = decodeCursor(rawCursor);
    const items = data.archives
      .filter((candidate) => candidate.deviceId === deviceId)
      .sort((left, right) => compareCursorValues(left, right))
      .filter((candidate) =>
        cursor ? compareCursorValues(candidate, cursor) > 0 : true
      )
      .map((candidate) => {
        const { deviceId: _deviceId, bindingId: _bindingId, threadsUserId: _threadsUserId, threadsHandle: _threadsHandle, ...archive } = candidate;
        return archive;
      });

    const lastItem = items[items.length - 1] ?? null;
    return {
      items,
      nextCursor: lastItem ? encodeCursor(lastItem.updatedAt, lastItem.id) : rawCursor ?? null
    };
  });
}

export async function processMentionById(
  mentionId: string,
  config = getMobileSaveCollectorConfig()
): Promise<MobileSaveCollectorSummary> {
  if (!safeText(mentionId)) {
    return {
      ok: false,
      reason: "mention_id_missing",
      fetchedMentions: 0,
      pairedDevices: 0,
      savedArchives: 0,
      updatedArchives: 0,
      ignoredMentions: 0,
      invalidMentions: 1
    };
  }

  const mention = await fetchThreadNode(config, config.accessToken, mentionId);
  if (!mention) {
    return {
      ok: false,
      reason: "mention_not_found",
      fetchedMentions: 0,
      pairedDevices: 0,
      savedArchives: 0,
      updatedArchives: 0,
      ignoredMentions: 0,
      invalidMentions: 1
    };
  }

  return await processMentionNode(mention, config);
}

export async function processMentionNode(
  mentionNode: ThreadsNode,
  config = getMobileSaveCollectorConfig()
): Promise<MobileSaveCollectorSummary> {
  const initialMentionId = safeText(readNestedString(mentionNode, ["id"]));
  const hydratedMentionNode =
    !extractRelatedThreadNode(mentionNode) && initialMentionId && config.accessToken
      ? (await fetchThreadNode(config, config.accessToken, initialMentionId).catch(() => null)) ?? mentionNode
      : mentionNode;
  const now = new Date().toISOString();
  const mentionId = safeText(readNestedString(hydratedMentionNode, ["id"]));
  const mentionUrl = normalizeOptionalThreadsUrl(buildThreadPermalink(hydratedMentionNode));
  const mentionText = safeText(extractThreadText(hydratedMentionNode)) || null;
  const mentionAuthorHandle = extractThreadHandle(hydratedMentionNode);
  const mentionAuthorUserId = extractThreadUserId(hydratedMentionNode);
  const mentionAuthorDisplayName = extractThreadDisplayName(hydratedMentionNode);

  if (!mentionId || !mentionUrl || !mentionAuthorHandle) {
    return await withMobileSaveDatabaseTransaction(async (data) => {
      if (mentionId) {
        recordProcessedMention(data, mentionId, mentionUrl, "invalid", now);
      }
      return {
        ok: false,
        reason: "invalid_mention",
        fetchedMentions: 1,
        pairedDevices: 0,
        savedArchives: 0,
        updatedArchives: 0,
        ignoredMentions: 0,
        invalidMentions: 1
      };
    });
  }

  return await withMobileSaveDatabaseTransaction(async (data) => {
    expireStalePairings(data, now);
    if (data.processedMentions.some((candidate) => candidate.mentionId === mentionId)) {
      return {
        ok: true,
        reason: null,
        fetchedMentions: 1,
        pairedDevices: 0,
        savedArchives: 0,
        updatedArchives: 0,
        ignoredMentions: 1,
        invalidMentions: 0
      };
    }

    const relatedNode = extractRelatedThreadNode(hydratedMentionNode);
    const relatedUrl = normalizeOptionalThreadsUrl(buildThreadPermalink(relatedNode));
    const pairingPostUrl = normalizeOptionalThreadsUrl(config.pairingPostUrl);
    if (pairingPostUrl && relatedUrl && relatedUrl === pairingPostUrl) {
      const pairingCode = extractPairingCode(mentionText);
      if (!pairingCode) {
        recordProcessedMention(data, mentionId, mentionUrl, "ignored", now);
        return {
          ok: true,
          reason: null,
          fetchedMentions: 1,
          pairedDevices: 0,
          savedArchives: 0,
          updatedArchives: 0,
          ignoredMentions: 1,
          invalidMentions: 0
        };
      }

      const pairing = findPendingPairingByCode(data, pairingCode, now);
      if (!pairing) {
        recordProcessedMention(data, mentionId, mentionUrl, "ignored", now);
        return {
          ok: true,
          reason: null,
          fetchedMentions: 1,
          pairedDevices: 0,
          savedArchives: 0,
          updatedArchives: 0,
          ignoredMentions: 1,
          invalidMentions: 0
        };
      }

      const device = data.devices.find((candidate) => candidate.id === pairing.deviceId) ?? null;
      if (!device) {
        pairing.status = "expired";
        recordProcessedMention(data, mentionId, mentionUrl, "invalid", now);
        return {
          ok: false,
          reason: "pairing_device_missing",
          fetchedMentions: 1,
          pairedDevices: 0,
          savedArchives: 0,
          updatedArchives: 0,
          ignoredMentions: 0,
          invalidMentions: 1
        };
      }

      applyPairing(
        data,
        pairing,
        device,
        {
          threadsUserId: mentionAuthorUserId,
          threadsHandle: mentionAuthorHandle,
          displayName: mentionAuthorDisplayName,
          profilePictureUrl: extractThreadProfilePictureUrl(hydratedMentionNode),
          isVerified: extractThreadIsVerified(hydratedMentionNode)
        },
        mentionId,
        mentionUrl,
        now
      );
      recordProcessedMention(data, mentionId, mentionUrl, "paired", now);
      return {
        ok: true,
        reason: null,
        fetchedMentions: 1,
        pairedDevices: 1,
        savedArchives: 0,
        updatedArchives: 0,
        ignoredMentions: 0,
        invalidMentions: 0
      };
    }

    const binding =
      data.bindings.find(
        (candidate) =>
          candidate.active &&
          isSameAccount(candidate, mentionAuthorUserId, mentionAuthorHandle)
      ) ?? null;
    if (!binding) {
      recordProcessedMention(data, mentionId, mentionUrl, "ignored", now);
      return {
        ok: true,
        reason: null,
        fetchedMentions: 1,
        pairedDevices: 0,
        savedArchives: 0,
        updatedArchives: 0,
        ignoredMentions: 1,
        invalidMentions: 0
      };
    }

    const targetCandidateUrl = relatedUrl || mentionUrl;
    const extractedPost = await extractTargetPost(targetCandidateUrl);
    const post = extractedPost ?? buildFallbackExtractedPost(relatedNode, targetCandidateUrl, now);
    const resolvedTitle =
      extractTitleExcerpt(post.text, post.author, 60) ||
      buildArchiveTitle(post.author, post.text, {
        fallbackWithAuthor: `Threads post by @${post.author}`,
        fallbackWithoutAuthor: "Saved Threads post"
      });
    const normalizedPost: ExtractedPost = {
      ...post,
      title: resolvedTitle
    };
    const markdownContent = await renderMarkdown(normalizedPost, createMarkdownMediaRefs(normalizedPost), null, null, "en");
    const archive = toArchiveRecord(normalizedPost, mentionId, mentionUrl, mentionText, now, markdownContent);
    const upserted = upsertArchive(data, binding, archive, now);
    recordProcessedMention(data, mentionId, mentionUrl, upserted.created ? "saved" : "duplicate", now);
    return {
      ok: true,
      reason: null,
      fetchedMentions: 1,
      pairedDevices: 0,
      savedArchives: upserted.created ? 1 : 0,
      updatedArchives: upserted.created ? 0 : 1,
      ignoredMentions: 0,
      invalidMentions: 0
    };
  });
}

export async function syncCollector(
  config = getMobileSaveCollectorConfig()
): Promise<MobileSaveCollectorSummary> {
  if (!config.accessToken) {
    return {
      ok: false,
      reason: "access_token_missing",
      fetchedMentions: 0,
      pairedDevices: 0,
      savedArchives: 0,
      updatedArchives: 0,
      ignoredMentions: 0,
      invalidMentions: 0
    };
  }

  const summary: MobileSaveCollectorSummary = {
    ok: true,
    reason: null,
    fetchedMentions: 0,
    pairedDevices: 0,
    savedArchives: 0,
    updatedArchives: 0,
    ignoredMentions: 0,
    invalidMentions: 0
  };

  let afterCursor: string | null = null;
  for (let page = 0; page < config.maxPages; page += 1) {
    let pageResult: Awaited<ReturnType<typeof fetchMentionPage>> | null = null;
    try {
      pageResult = await fetchMentionPage(config, config.accessToken, afterCursor);
    } catch (error) {
      summary.ok = false;
      summary.reason = error instanceof Error ? error.message : "mention_fetch_failed";
    }
    if (!pageResult) {
      break;
    }

    summary.fetchedMentions += pageResult.items.length;
    for (const item of pageResult.items) {
      const result = await processMentionNode(item, config);
      summary.ok = summary.ok && result.ok;
      summary.reason = summary.reason ?? result.reason;
      summary.pairedDevices += result.pairedDevices;
      summary.savedArchives += result.savedArchives;
      summary.updatedArchives += result.updatedArchives;
      summary.ignoredMentions += result.ignoredMentions;
      summary.invalidMentions += result.invalidMentions;
    }

    afterCursor = pageResult.nextCursor;
    if (!afterCursor || pageResult.items.length === 0) {
      break;
    }
  }

  return summary;
}
