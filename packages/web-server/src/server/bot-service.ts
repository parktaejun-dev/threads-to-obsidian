import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { lookup } from "node:dns/promises";
import net from "node:net";
import { JSDOM } from "jsdom";
import JSZip from "jszip";

import { BUNDLED_EXTRACTOR_CONFIG } from "@threads/shared/config";
import { type Locale } from "@threads/shared/i18n";
import { isSupportedLocale, normalizeLocale } from "@threads/shared/locale";
import { renderMarkdown } from "@threads/shared/markdown";
import type {
  AiOrganizationResult,
  AuthorReply,
  CloudArchiveRecentRecord,
  CloudConnectionStatus,
  ExtractedPost,
  FrontmatterPrimitive
} from "@threads/shared/types";
import { extractPostFromDocument } from "@threads/shared/extractor";
import { dedupeStrings, extractTitleExcerpt } from "@threads/shared/utils";
import type {
  BotArchiveRecord,
  BotExtensionAccessTokenRecord,
  BotExtensionLinkSessionRecord,
  CloudArchiveRecord,
  BotOauthSessionRecord,
  BotSessionRecord,
  BotUserRecord,
  WebDatabase
} from "@threads/web-schema";
import {
  withBotAuthDatabaseTransaction,
  withUserScopedDatabaseTransaction,
  upsertBotArchive,
  upsertBotExtensionAccessToken,
  upsertBotExtensionLinkSession,
  upsertCloudArchive,
  upsertBotOauthSession,
  upsertBotSession,
  upsertBotUser
} from "./store";
import { fetchWithTimeout } from "./http-client";
import { getRuntimeConfigSnapshot } from "./runtime-config";
import {
  canCreateScrapbookArchive,
  getScrapbookArchiveLimitError,
  syncScrapbookPlusLicenseLink
} from "./scrapbook-plan-service";

const BOT_OAUTH_TTL_MS = 10 * 60_000;
const BOT_OAUTH_ACTIVATION_TTL_MS = 5 * 60_000;
const BOT_SESSION_TTL_MS = 30 * 24 * 60 * 60_000;
const BOT_SESSION_TOUCH_INTERVAL_MS = 12 * 60 * 60_000;
const BOT_EXTENSION_LINK_TTL_MS = 10 * 60_000;
const BOT_EXTENSION_TOKEN_TTL_MS = 30 * 24 * 60 * 60_000;
const THREADS_LONG_LIVED_TOKEN_TTL_MS = 60 * 24 * 60 * 60_000;
const BOT_TOKEN_REFRESH_WINDOW_MS = 24 * 60 * 60_000;
const THREADS_AUTHORIZE_BASE_URL = "https://www.threads.com";
const THREADS_GRAPH_BASE_URL = "https://graph.threads.net";
const BOT_SCOPE_VERSION = 2;
const THREADS_OAUTH_SCOPES = [
  "threads_basic",
  "threads_manage_mentions",
  "threads_read_replies",
  "threads_profile_discovery",
  "threads_keyword_search",
  "threads_manage_insights"
];

interface ThreadsOauthConfig {
  appId: string;
  appSecret: string;
  graphApiVersion: string | null;
}

interface ThreadsTokenResponse {
  access_token?: string;
  user_id?: string;
  expires_in?: number;
}

interface ThreadsProfileResponse {
  id?: string;
  username?: string;
  name?: string | null;
  threads_profile_picture_url?: string | null;
  threads_biography?: string | null;
  is_verified?: boolean;
}

export interface BotUserView {
  id: string;
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  biography: string | null;
  isVerified: boolean;
  lastLoginAt: string | null;
  grantedScopes: string[];
  scopeVersion: number;
  lastScopeUpgradeAt: string | null;
}

export interface BotArchiveView {
  id: string;
  origin: "mention" | "cloud";
  originLabel: string;
  mentionUrl: string | null;
  mentionAuthorHandle: string | null;
  mentionAuthorDisplayName: string | null;
  noteText: string | null;
  tags: string[];
  targetUrl: string;
  targetAuthorHandle: string | null;
  targetAuthorDisplayName: string | null;
  targetText: string;
  targetPublishedAt: string | null;
  mediaUrls: string[];
  authorReplies: BotArchiveReplyView[];
  markdownContent: string;
  archivedAt: string;
  updatedAt: string;
}

export interface BotArchiveReplyView {
  canonicalUrl: string;
  author: string;
  text: string;
  publishedAt: string | null;
  mediaUrls: string[];
}

export interface BotSessionState {
  authenticated: boolean;
  botHandle: string;
  oauthConfigured: boolean;
  user: BotUserView | null;
  archives: BotArchiveView[];
}

export interface BotSessionAuthContext {
  user: BotUserRecord;
  accessToken: string;
}

export interface BotPublicConfig {
  botHandle: string;
  oauthConfigured: boolean;
}

export interface BotOauthStartResult {
  authorizeUrl: string;
  botHandle: string;
  pollToken: string;
}

export interface BotOauthPollResult {
  status: "pending" | "authorized" | "expired";
  activationCode?: string;
}

export interface BotIngestPayload {
  mentionId?: string | null;
  mentionUrl?: string | null;
  mentionAuthorUserId?: string | null;
  mentionAuthorHandle?: string | null;
  mentionAuthorDisplayName?: string | null;
  noteText?: string | null;
  targetUrl?: string | null;
  targetAuthorHandle?: string | null;
  targetAuthorDisplayName?: string | null;
  targetText?: string | null;
  targetPublishedAt?: string | null;
  mediaUrls?: string[] | null;
  extractedPost?: ExtractedPost | null;
  rawPayload?: unknown;
}

export interface BotIngestResult {
  ok: boolean;
  matched: boolean;
  created: boolean;
  archiveId: string | null;
  reason: string | null;
}

export interface MaterializedBotMentionArchive {
  result: BotIngestResult;
  archive: BotArchiveRecord | null;
}

interface MentionArchiveAllowance {
  allowed: boolean;
  reason: string | null;
}

export interface CloudArchiveSaveInput {
  post: ExtractedPost;
  aiResult: AiOrganizationResult | null;
  aiWarning: string | null;
  locale?: Locale;
}

export interface CloudArchiveSaveResult {
  archiveId: string;
  archiveUrl: string;
  title: string;
  warning: string | null;
  created: boolean;
}

export interface ExtensionLinkCompleteResult {
  token: string;
  expiresAt: string;
  linkedAt: string;
  userHandle: string;
}

interface BotArchiveMarkdownPayload {
  mentionUrl: string;
  mentionAuthorHandle: string;
  mentionAuthorDisplayName: string | null;
  noteText: string | null;
  tags: string[];
  targetUrl: string;
  targetAuthorHandle: string | null;
  targetAuthorDisplayName: string | null;
  targetText: string;
  targetPublishedAt: string | null;
  mediaUrls: string[];
  archivedAt: string;
}

interface BotArchiveVideoRef {
  file: string | null;
  thumbnail: string | null;
}

interface BotArchiveMarkdownMediaRefs {
  postImages: string[];
  postVideo: BotArchiveVideoRef | null;
  replyImages: string[][];
  replyVideos: Array<BotArchiveVideoRef | null>;
}

interface ParsedCloudArchivePayload {
  extractedPost: ExtractedPost | null;
  aiResult: AiOrganizationResult | null;
  aiWarning: string | null;
  locale: Locale;
}

type StoredArchiveRecord = BotArchiveRecord | CloudArchiveRecord;

export interface BotArchiveZipResult {
  filename: string;
  content: Buffer;
}

const MAX_ARCHIVE_TAGS = 3;
const DEFAULT_MEDIA_HOST_ALLOWLIST = [
  "threads.com",
  "threads.net",
  "cdninstagram.com",
  "fbcdn.net"
] as const;

function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function readAllowedMediaHostSuffixes(): string[] {
  const envValue =
    process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST?.trim() ||
    process.env.THREADS_MEDIA_ALLOWED_HOSTS?.trim();
  const configured = envValue
    ? envValue
        .split(",")
        .map((entry) => entry.trim().toLowerCase().replace(/^\.+/, ""))
        .filter(Boolean)
    : [];
  return [...new Set([...DEFAULT_MEDIA_HOST_ALLOWLIST, ...configured])];
}

function hasAllowedMediaHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  return readAllowedMediaHostSuffixes().some((suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`));
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [first, second] = parts;
  if (first === 0 || first === 10 || first === 127) {
    return true;
  }
  if (first === 100 && second >= 64 && second <= 127) {
    return true;
  }
  if (first === 169 && second === 254) {
    return true;
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }
  if (first === 192 && second === 168) {
    return true;
  }
  return false;
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
}

async function assertSafeArchiveMediaUrl(mediaUrl: string): Promise<URL> {
  const parsed = new URL(mediaUrl);
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS media URLs are allowed.");
  }

  const hostname = parsed.hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!hostname || net.isIP(hostname) !== 0 || !hasAllowedMediaHost(hostname)) {
    throw new Error("Media host is not allowed.");
  }

  const resolved = await lookup(hostname, { all: true, verbatim: true });
  if (resolved.length === 0) {
    throw new Error("Media host did not resolve.");
  }

  for (const entry of resolved) {
    if (
      (entry.family === 4 && isPrivateIpv4(entry.address)) ||
      (entry.family === 6 && isPrivateIpv6(entry.address))
    ) {
      throw new Error("Media host resolved to a private address.");
    }
  }

  return parsed;
}

async function fetchArchiveAsset(mediaUrl: string): Promise<Response> {
  const safeUrl = await assertSafeArchiveMediaUrl(mediaUrl);
  const response = await fetchWithTimeout(safeUrl, {
    cache: "no-store",
    redirect: "manual"
  });
  if (response.status >= 300 && response.status < 400) {
    throw new Error("Media redirects are not allowed.");
  }
  if (!response.ok) {
    throw new Error("Media fetch failed.");
  }
  return response;
}

function normalizeThreadsHandle(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => readString(entry)).filter((entry): entry is string => Boolean(entry));
}

function isSourceType(value: unknown): value is "text" | "image" | "video" {
  return value === "text" || value === "image" || value === "video";
}

function isCloudArchiveRecord(archive: StoredArchiveRecord): archive is CloudArchiveRecord {
  return "canonicalUrl" in archive;
}

function parseFrontmatterPrimitive(value: unknown): FrontmatterPrimitive | null {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function parseAiOrganizationResult(value: unknown): AiOrganizationResult | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const frontmatterRecord = toRecord(record.frontmatter);
  const frontmatter: Record<string, FrontmatterPrimitive | FrontmatterPrimitive[]> = {};
  for (const [key, entryValue] of Object.entries(frontmatterRecord ?? {})) {
    const primitive = parseFrontmatterPrimitive(entryValue);
    if (primitive !== null) {
      frontmatter[key] = primitive;
      continue;
    }

    if (!Array.isArray(entryValue)) {
      continue;
    }

    const parsedArray = entryValue
      .map((item) => parseFrontmatterPrimitive(item))
      .filter((item): item is FrontmatterPrimitive => item !== null);
    if (parsedArray.length > 0) {
      frontmatter[key] = parsedArray;
    }
  }

  const summary = readString(record.summary);
  const tags = dedupeStrings(readStringArray(record.tags));

  if (!summary && tags.length === 0 && Object.keys(frontmatter).length === 0) {
    return null;
  }

  return {
    summary,
    tags,
    frontmatter
  };
}

function parseAuthorReply(value: unknown): AuthorReply | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const author = readString(record.author);
  const canonicalUrl = readString(record.canonicalUrl);
  const shortcode = readString(record.shortcode);
  const text = readString(record.text);
  const sourceType = record.sourceType;
  if (!author || !canonicalUrl || !shortcode || !text || !isSourceType(sourceType)) {
    return null;
  }

  return {
    author,
    canonicalUrl,
    shortcode,
    text,
    publishedAt: readString(record.publishedAt),
    sourceType,
    imageUrls: readStringArray(record.imageUrls),
    videoUrl: readString(record.videoUrl),
    externalUrl: readString(record.externalUrl),
    thumbnailUrl: readString(record.thumbnailUrl)
  };
}

function parseExtractedPost(value: unknown): ExtractedPost | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const canonicalUrl = readString(record.canonicalUrl);
  const shortcode = readString(record.shortcode);
  const author = readString(record.author);
  const title = readString(record.title);
  const text = readString(record.text);
  const capturedAt = readString(record.capturedAt);
  const sourceType = record.sourceType;
  const extractorVersion = readString(record.extractorVersion);
  const contentHash = readString(record.contentHash);
  if (!canonicalUrl || !shortcode || !author || !title || !text || !capturedAt || !extractorVersion || !contentHash || !isSourceType(sourceType)) {
    return null;
  }

  const authorReplies = Array.isArray(record.authorReplies)
    ? record.authorReplies.map((entry) => parseAuthorReply(entry)).filter((entry): entry is AuthorReply => Boolean(entry))
    : [];

  return {
    canonicalUrl,
    shortcode,
    author,
    title,
    text,
    publishedAt: readString(record.publishedAt),
    capturedAt,
    sourceType,
    imageUrls: readStringArray(record.imageUrls),
    videoUrl: readString(record.videoUrl),
    externalUrl: readString(record.externalUrl),
    quotedPostUrl: readString(record.quotedPostUrl),
    repliedToUrl: readString(record.repliedToUrl),
    thumbnailUrl: readString(record.thumbnailUrl),
    authorReplies,
    extractorVersion,
    contentHash
  };
}

function readArchiveExtractedPost(rawPayloadJson: string | null): ExtractedPost | null {
  if (!rawPayloadJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawPayloadJson) as unknown;
    const record = toRecord(parsed);
    if (record?.extractedPost) {
      return parseExtractedPost(record.extractedPost);
    }

    return parseExtractedPost(parsed);
  } catch {
    return null;
  }
}

function writeArchiveExtractedPost(rawPayloadJson: string | null, extractedPost: ExtractedPost): string {
  if (!rawPayloadJson) {
    return JSON.stringify({ extractedPost });
  }

  try {
    const parsed = JSON.parse(rawPayloadJson) as unknown;
    const record = toRecord(parsed);
    if (record) {
      return JSON.stringify({
        ...record,
        extractedPost
      });
    }
  } catch {
    // Fall back to the minimal extracted payload below.
  }

  return JSON.stringify({ extractedPost });
}

function readCloudArchivePayload(rawPayloadJson: string | null): ParsedCloudArchivePayload {
  if (!rawPayloadJson) {
    return {
      extractedPost: null,
      aiResult: null,
      aiWarning: null,
      locale: "ko"
    };
  }

  try {
    const parsed = JSON.parse(rawPayloadJson) as unknown;
    const record = toRecord(parsed);
    return {
      extractedPost: record?.extractedPost ? parseExtractedPost(record.extractedPost) : parseExtractedPost(parsed),
      aiResult: parseAiOrganizationResult(record?.aiResult),
      aiWarning: readString(record?.aiWarning),
      locale: normalizeLocale(record?.locale, "ko")
    };
  } catch {
    return {
      extractedPost: null,
      aiResult: null,
      aiWarning: null,
      locale: "ko"
    };
  }
}

function summarizeReplyMediaUrls(reply: AuthorReply): string[] {
  return dedupeStrings([
    ...reply.imageUrls,
    reply.sourceType === "video" ? reply.thumbnailUrl ?? reply.videoUrl : null
  ]);
}

async function extractArchivePostFromPermalink(permalinkUrl: string): Promise<ExtractedPost | null> {
  const normalizedUrl = safeText(permalinkUrl);
  if (!normalizedUrl) {
    return null;
  }

  try {
    const response = await fetch(normalizedUrl, {
      cache: "no-store",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ko,en;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Threads HTML fetch failed (${response.status}).`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url: response.url || normalizedUrl });
    return await extractPostFromDocument(
      dom.window.document,
      dom.window.location.href,
      BUNDLED_EXTRACTOR_CONFIG
    );
  } catch {
    return null;
  }
}

function shouldRepairMentionArchiveRecord(archive: BotArchiveRecord, extractedPost: ExtractedPost | null): boolean {
  if (!archive.mentionUrl) {
    return false;
  }

  if (archive.targetUrl === archive.mentionUrl) {
    return true;
  }

  if (archive.noteText && safeText(archive.targetText) === safeText(archive.noteText)) {
    return true;
  }

  return Boolean((extractedPost?.repliedToUrl || extractedPost?.quotedPostUrl) && extractedPost.canonicalUrl === archive.mentionUrl);
}

async function repairMentionArchiveRecord(archive: BotArchiveRecord): Promise<boolean> {
  const currentExtractedPost = readArchiveExtractedPost(archive.rawPayloadJson);
  if (!shouldRepairMentionArchiveRecord(archive, currentExtractedPost)) {
    return false;
  }

  const mentionExtractedPost =
    currentExtractedPost?.canonicalUrl === archive.mentionUrl
      ? currentExtractedPost
      : await extractArchivePostFromPermalink(archive.mentionUrl);
  const relatedTargetUrl = safeText(mentionExtractedPost?.repliedToUrl || mentionExtractedPost?.quotedPostUrl);
  if (!relatedTargetUrl || relatedTargetUrl === archive.mentionUrl) {
    return false;
  }

  const originalExtractedPost = await extractArchivePostFromPermalink(relatedTargetUrl);
  if (!originalExtractedPost || !safeText(originalExtractedPost.text) || originalExtractedPost.canonicalUrl === archive.mentionUrl) {
    return false;
  }

  const now = new Date().toISOString();
  const mediaUrls = summarizeExtractedPostPreviewMediaUrls(originalExtractedPost);
  const rawPayloadJson = writeArchiveExtractedPost(archive.rawPayloadJson, originalExtractedPost);
  archive.targetUrl = originalExtractedPost.canonicalUrl;
  archive.targetAuthorHandle = safeText(originalExtractedPost.author) || archive.targetAuthorHandle;
  archive.targetAuthorDisplayName = null;
  archive.targetText = originalExtractedPost.text;
  archive.targetPublishedAt = originalExtractedPost.publishedAt;
  archive.mediaUrls = mediaUrls;
  archive.rawPayloadJson = rawPayloadJson;
  archive.updatedAt = now;
  archive.markdownContent = buildArchiveMarkdownFromRecord(archive, mediaUrls);
  return true;
}

function buildArchiveReplyView(reply: AuthorReply): BotArchiveReplyView {
  return {
    canonicalUrl: reply.canonicalUrl,
    author: reply.author,
    text: reply.text,
    publishedAt: reply.publishedAt,
    mediaUrls: summarizeReplyMediaUrls(reply)
  };
}

function summarizeExtractedPostPreviewMediaUrls(post: ExtractedPost): string[] {
  return dedupeStrings([
    ...post.imageUrls,
    post.sourceType === "video" ? post.thumbnailUrl ?? post.videoUrl : null
  ]);
}

function buildRemoteMarkdownMediaRefs(post: ExtractedPost): BotArchiveMarkdownMediaRefs {
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

function buildCloudArchiveTags(payload: ParsedCloudArchivePayload): string[] {
  return dedupeStrings(payload.aiResult?.tags ?? []).slice(0, MAX_ARCHIVE_TAGS);
}

function extractArchiveTags(noteText: string | null | undefined): string[] {
  const normalized = safeText(noteText);
  if (!normalized) {
    return [];
  }

  const tags: string[] = [];
  const seen = new Set<string>();
  const matches = normalized.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  for (const match of matches) {
    const normalizedTag = match.slice(1).trim().toLowerCase();
    if (!normalizedTag || seen.has(normalizedTag)) {
      continue;
    }

    seen.add(normalizedTag);
    tags.push(normalizedTag);
    if (tags.length >= MAX_ARCHIVE_TAGS) {
      break;
    }
  }

  return tags;
}

function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

function readBotHandle(): string {
  return normalizeThreadsHandle(
    getRuntimeConfigSnapshot().collector.botHandle || process.env.THREADS_BOT_HANDLE?.trim() || ""
  );
}

function requireBotIngestToken(): string {
  const token = process.env.THREADS_BOT_INGEST_TOKEN?.trim();
  if (!token) {
    throw new Error("THREADS_BOT_INGEST_TOKEN is not configured.");
  }

  return token;
}

function readThreadsOauthConfig(): ThreadsOauthConfig {
  const appId = process.env.THREADS_BOT_APP_ID?.trim();
  const appSecret = process.env.THREADS_BOT_APP_SECRET?.trim();
  const graphApiVersion = process.env.THREADS_BOT_GRAPH_API_VERSION?.trim() || null;
  if (!appId || !appSecret) {
    throw new Error(
      "Threads OAuth is not configured. Set THREADS_BOT_APP_ID and THREADS_BOT_APP_SECRET on the web server."
    );
  }

  return { appId, appSecret, graphApiVersion };
}

function isThreadsOauthConfigured(): boolean {
  return Boolean(process.env.THREADS_BOT_APP_ID?.trim() && process.env.THREADS_BOT_APP_SECRET?.trim());
}

function getEncryptionKey(): Buffer {
  const secret =
    process.env.THREADS_BOT_ENCRYPTION_SECRET?.trim() ||
    process.env.THREADS_WEB_ADMIN_TOKEN?.trim();
  if (!secret) {
    throw new Error(
      "Threads bot encryption secret is not configured. Set THREADS_BOT_ENCRYPTION_SECRET or THREADS_WEB_ADMIN_TOKEN."
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

function isExpired(iso: string, now = Date.now()): boolean {
  return Date.parse(iso) <= now;
}

function buildThreadsApiBaseUrl(): string {
  const { graphApiVersion } = readThreadsOauthConfig();
  return `${THREADS_GRAPH_BASE_URL}/${graphApiVersion ? `${graphApiVersion}/` : ""}`;
}

function buildRedirectUri(publicOrigin: string): string {
  return `${publicOrigin.replace(/\/+$/, "")}/api/public/bot/oauth/callback`;
}

function buildThreadsAuthorizeUrl(publicOrigin: string, rawState: string): string {
  const { appId } = readThreadsOauthConfig();
  const url = new URL("/oauth/authorize/", THREADS_AUTHORIZE_BASE_URL);
  url.searchParams.set("scope", THREADS_OAUTH_SCOPES.join(","));
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", buildRedirectUri(publicOrigin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", rawState);
  // Keep the OAuth flow in the browser on mobile instead of letting universal links
  // hand the request to the Threads app before the consent screen is shown.
  url.hash = "weblink";
  return url.toString();
}

function extractArchiveTitleExcerpt(text: string, maxChars = 20): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const firstSentence = normalized.split(/(?<=[.!?。！？])\s+|\n+/u, 1)[0]?.trim() ?? normalized;
  return Array.from(firstSentence).slice(0, maxChars).join("").trim();
}

function buildArchiveTitle(targetAuthorHandle: string | null, targetText: string): string {
  const excerpt = extractTitleExcerpt(targetText, targetAuthorHandle, 30);
  if (excerpt) {
    return excerpt;
  }

  if (targetAuthorHandle) {
    return `Threads post by @${targetAuthorHandle}`;
  }

  return "Saved Threads mention";
}

function renderMarkdownImageBlocks(refs: string[], labelPrefix: string): string[] {
  const lines: string[] = [];
  for (const [index, ref] of refs.entries()) {
    lines.push(`![${labelPrefix} ${index + 1}](${ref})`, "");
  }
  return lines;
}

function renderMarkdownVideoBlock(videoRef: BotArchiveVideoRef | null, canonicalUrl: string): string[] {
  if (!videoRef) {
    return [];
  }

  const lines: string[] = ["Video on Threads: " + canonicalUrl];
  if (videoRef.file && !isRemoteRef(videoRef.file)) {
    lines.push(`Saved video file: ${videoRef.file}`);
  }

  lines.push("");

  if (videoRef.thumbnail) {
    lines.push(`![Video thumbnail](${videoRef.thumbnail})`, "");
  }

  return lines;
}

function buildArchiveMarkdownFromExtractedPost(
  post: ExtractedPost,
  archivedAt: string,
  tags: string[],
  mediaRefs: BotArchiveMarkdownMediaRefs
): string {
  const lines: string[] = [
    `# ${buildArchiveTitle(post.author, post.text)}`,
    "",
    `Saved: ${archivedAt}`,
    `Source: ${post.canonicalUrl}`,
    `Author: @${post.author}`
  ];

  if (post.publishedAt) {
    lines.push(`Published: ${post.publishedAt}`);
  }

  if (post.externalUrl) {
    lines.push(`External link: ${post.externalUrl}`);
  }

  if (post.quotedPostUrl) {
    lines.push(`Quoted post: ${post.quotedPostUrl}`);
  }

  if (post.repliedToUrl) {
    lines.push(`Replied to: ${post.repliedToUrl}`);
  }

  if (tags.length > 0) {
    lines.push(`Tags: ${tags.map((tag) => `#${tag}`).join(" ")}`);
  }

  lines.push("", "## Post", "", post.text.trim(), "");

  if (post.sourceType === "video") {
    lines.push(...renderMarkdownVideoBlock(mediaRefs.postVideo, post.canonicalUrl));
  }

  if (mediaRefs.postImages.length > 0) {
    lines.push("## Images", "");
    lines.push(...renderMarkdownImageBlocks(mediaRefs.postImages, "Image"));
  }

  if (post.authorReplies.length > 0) {
    lines.push("## Author Replies", "");
    const total = post.authorReplies.length;

    post.authorReplies.forEach((reply, index) => {
      if (index > 0) {
        lines.push("---", "");
      }

      lines.push(`### Reply ${index + 1}/${total}`, "", `Source: ${reply.canonicalUrl}`, `Author: @${reply.author}`);
      if (reply.publishedAt) {
        lines.push(`Published: ${reply.publishedAt}`);
      }
      if (reply.externalUrl) {
        lines.push(`External link: ${reply.externalUrl}`);
      }

      lines.push("", reply.text.trim(), "");

      if (reply.sourceType === "video") {
        lines.push(...renderMarkdownVideoBlock(mediaRefs.replyVideos[index] ?? null, reply.canonicalUrl));
      }

      lines.push(...renderMarkdownImageBlocks(mediaRefs.replyImages[index] ?? [], `Reply ${index + 1} image`));
    });
  }

  return lines.join("\n").trim();
}

function isRemoteRef(ref: string): boolean {
  return /^https?:\/\//i.test(ref);
}

function isImageRef(ref: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(?:[?#]|$)/i.test(ref);
}

function shortenUrlLabel(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    const lastSegment = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return safeText(lastSegment).slice(0, 40) || fallback;
  } catch {
    return fallback;
  }
}

function buildArchiveMarkdown(payload: BotArchiveMarkdownPayload): string {
  const title = buildArchiveTitle(payload.targetAuthorHandle, payload.targetText);
  const lines: string[] = [
    `# ${title}`,
    "",
    `Saved: ${payload.archivedAt}`,
    `Source: ${payload.targetAuthorHandle ? `@${payload.targetAuthorHandle}` : "unknown"}`,
    `URL: ${payload.targetUrl}`
  ];

  if (payload.targetPublishedAt) {
    lines.push(`Published: ${payload.targetPublishedAt}`);
  }

  if (payload.tags.length > 0) {
    lines.push(`Tags: ${payload.tags.map((tag) => `#${tag}`).join(" ")}`);
  }

  lines.push("", "## Post", "", payload.targetText);

  if (payload.mediaUrls.length > 0) {
    lines.push("", "## Media", "");
    for (const [index, mediaRef] of payload.mediaUrls.entries()) {
      if (isRemoteRef(mediaRef)) {
        const fallbackLabel = isImageRef(mediaRef)
          ? `image-${String(index + 1).padStart(2, "0")}`
          : `media-${String(index + 1).padStart(2, "0")}`;
        lines.push(`- [${shortenUrlLabel(mediaRef, fallbackLabel)}](${mediaRef})`);
        continue;
      }

      if (isImageRef(mediaRef)) {
        lines.push(`![${mediaRef}](${mediaRef})`);
      } else {
        lines.push(`- [${mediaRef}](${mediaRef})`);
      }
    }
  }

  return lines.join("\n").trim();
}

function buildArchiveMarkdownPayload(
  archive: Pick<
    BotArchiveRecord,
    | "mentionUrl"
    | "mentionAuthorHandle"
    | "mentionAuthorDisplayName"
    | "noteText"
    | "targetUrl"
    | "targetAuthorHandle"
    | "targetAuthorDisplayName"
    | "targetText"
    | "targetPublishedAt"
    | "archivedAt"
  >,
  mediaUrls: string[]
): BotArchiveMarkdownPayload {
  return {
    mentionUrl: archive.mentionUrl,
    mentionAuthorHandle: archive.mentionAuthorHandle,
    mentionAuthorDisplayName: archive.mentionAuthorDisplayName,
    noteText: archive.noteText,
    tags: extractArchiveTags(archive.noteText),
    targetUrl: archive.targetUrl,
    targetAuthorHandle: archive.targetAuthorHandle,
    targetAuthorDisplayName: archive.targetAuthorDisplayName,
    targetText: archive.targetText,
    targetPublishedAt: archive.targetPublishedAt,
    mediaUrls,
    archivedAt: archive.archivedAt
  };
}

function buildArchiveMarkdownFromRecord(
  archive: Pick<
    BotArchiveRecord,
    | "mentionUrl"
    | "mentionAuthorHandle"
    | "mentionAuthorDisplayName"
    | "noteText"
    | "targetUrl"
    | "targetAuthorHandle"
    | "targetAuthorDisplayName"
    | "targetText"
    | "targetPublishedAt"
    | "rawPayloadJson"
    | "archivedAt"
  >,
  mediaUrls: string[]
): string {
  const extractedPost = readArchiveExtractedPost(archive.rawPayloadJson);
  if (!extractedPost) {
    return buildArchiveMarkdown(buildArchiveMarkdownPayload(archive, mediaUrls));
  }

  return buildArchiveMarkdownFromExtractedPost(
    extractedPost,
    archive.archivedAt,
    extractArchiveTags(archive.noteText),
    buildRemoteMarkdownMediaRefs(extractedPost)
  );
}

function buildArchiveSlug(targetAuthorHandle: string | null, targetText: string, fallback = "threads-archive"): string {
  const base = buildArchiveTitle(targetAuthorHandle, targetText)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || fallback;
}

function buildArchiveNoteFilename(archiveName: string): string {
  return `${archiveName}.md`;
}

function guessAssetExtension(url: string, contentType: string | null): string {
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
  if (contentType?.includes("webm")) {
    return "webm";
  }
  if (contentType?.includes("quicktime")) {
    return "mov";
  }

  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}

async function collectArchiveAssetFiles(
  mediaUrls: string[]
): Promise<{ refs: string[]; files: Array<{ path: string; data: ArrayBuffer }> }> {
  const refs: string[] = [];
  const files: Array<{ path: string; data: ArrayBuffer }> = [];

  for (const [index, mediaUrl] of mediaUrls.entries()) {
    try {
      const response = await fetchArchiveAsset(mediaUrl);
      const extension = guessAssetExtension(mediaUrl, response.headers.get("content-type"));
      const assetPrefix = /^(mp4|mov|webm)$/i.test(extension) ? "video" : "image";
      const relativePath = `${assetPrefix}-${String(index + 1).padStart(2, "0")}.${extension}`;
      refs.push(relativePath);
      files.push({
        path: relativePath,
        data: await response.arrayBuffer()
      });
    } catch {
      refs.push(mediaUrl);
    }
  }

  return { refs, files };
}

async function collectSingleArchiveAsset(
  url: string | null,
  relativeBasePath: string
): Promise<{ ref: string | null; files: Array<{ path: string; data: ArrayBuffer }> }> {
  const normalizedUrl = safeText(url);
  if (!normalizedUrl) {
    return { ref: null, files: [] };
  }

  try {
    const response = await fetchArchiveAsset(normalizedUrl);
    const extension = guessAssetExtension(normalizedUrl, response.headers.get("content-type"));
    const relativePath = `${relativeBasePath}.${extension}`;
    return {
      ref: relativePath,
      files: [
        {
          path: relativePath,
          data: await response.arrayBuffer()
        }
      ]
    };
  } catch {
    return { ref: normalizedUrl, files: [] };
  }
}

async function collectExtractedPostAssetFiles(
  post: ExtractedPost
): Promise<{ mediaRefs: BotArchiveMarkdownMediaRefs; files: Array<{ path: string; data: ArrayBuffer }> }> {
  const files: Array<{ path: string; data: ArrayBuffer }> = [];
  const postImages: string[] = [];
  for (const [index, imageUrl] of post.imageUrls.entries()) {
    const result = await collectSingleArchiveAsset(imageUrl, `image-${String(index + 1).padStart(2, "0")}`);
    if (result.ref) {
      postImages.push(result.ref);
    }
    files.push(...result.files);
  }

  let postVideo: BotArchiveVideoRef | null = null;

  if (post.sourceType === "video") {
    const videoFile = await collectSingleArchiveAsset(post.videoUrl, "video-01");
    const videoThumb = await collectSingleArchiveAsset(post.thumbnailUrl, "video-01-thumb");
    postVideo = {
      file: videoFile.ref,
      thumbnail: videoThumb.ref
    };
    files.push(...videoFile.files, ...videoThumb.files);
  }

  const replyImages: string[][] = [];
  const replyVideos: Array<BotArchiveVideoRef | null> = [];
  for (const [replyIndex, reply] of post.authorReplies.entries()) {
    const imageRefs: string[] = [];
    for (const [imageIndex, imageUrl] of reply.imageUrls.entries()) {
      const result = await collectSingleArchiveAsset(
        imageUrl,
        `reply-${String(replyIndex + 1).padStart(2, "0")}-image-${String(imageIndex + 1).padStart(2, "0")}`
      );
      if (result.ref) {
        imageRefs.push(result.ref);
      }
      files.push(...result.files);
    }
    replyImages.push(imageRefs);

    if (reply.sourceType === "video") {
      const videoFile = await collectSingleArchiveAsset(
        reply.videoUrl,
        `reply-${String(replyIndex + 1).padStart(2, "0")}-video`
      );
      const videoThumb = await collectSingleArchiveAsset(
        reply.thumbnailUrl,
        `reply-${String(replyIndex + 1).padStart(2, "0")}-video-thumb`
      );
      replyVideos.push({
        file: videoFile.ref,
        thumbnail: videoThumb.ref
      });
      files.push(...videoFile.files, ...videoThumb.files);
    } else {
      replyVideos.push(null);
    }
  }

  return {
    mediaRefs: {
      postImages,
      postVideo,
      replyImages,
      replyVideos
    },
    files
  };
}

function buildArchiveFilenameBase(targetAuthorHandle: string | null, targetText: string, fallback = "threads-archive"): string {
  return (
    buildArchiveTitle(targetAuthorHandle, targetText)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || fallback
  );
}

function buildCloudArchiveRawPayload(input: CloudArchiveSaveInput): string {
  return JSON.stringify({
    extractedPost: input.post,
    aiResult: input.aiResult,
    aiWarning: input.aiWarning,
    locale: normalizeLocale(input.locale, "ko")
  });
}

function normalizeScrapbookHandle(value: string | null | undefined): string | null {
  const normalized = safeText(value).replace(/^@+/, "").toLowerCase();
  return normalized || null;
}

function buildScrapbookBaseUrl(publicOrigin: string, userHandle?: string | null): string {
  const normalizedHandle = normalizeScrapbookHandle(userHandle);
  if (!normalizedHandle) {
    return new URL("/scrapbook", publicOrigin).toString();
  }

  const url = new URL(publicOrigin);
  url.pathname = `/scrapbook/@${normalizedHandle}`;
  return url.toString();
}

function buildCloudArchiveUrl(publicOrigin: string, archiveId: string, userHandle?: string | null): string {
  const url = new URL(buildScrapbookBaseUrl(publicOrigin, userHandle));
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/archive/${encodeURIComponent(archiveId)}`;
  return url.toString();
}

async function buildArchiveZipBundle(archives: StoredArchiveRecord[]): Promise<BotArchiveZipResult> {
  const zip = new JSZip();
  const now = new Date();
  const zipStamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  let singleArchiveName = "threads-archive";

  for (const [index, archive] of archives.entries()) {
    const archivePayload = isCloudArchiveRecord(archive) ? readCloudArchivePayload(archive.rawPayloadJson) : null;
    const extractedPost = archivePayload?.extractedPost ?? readArchiveExtractedPost(archive.rawPayloadJson);
    const targetAuthorHandle =
      (isCloudArchiveRecord(archive) ? archive.targetAuthorHandle : archive.targetAuthorHandle) ?? extractedPost?.author ?? null;
    const targetText = extractedPost?.text ?? archive.targetText;
    const archiveName = buildArchiveSlug(targetAuthorHandle, targetText, `threads-archive-${index + 1}`);
    if (archives.length === 1) {
      singleArchiveName = archiveName;
    }

    const fallbackMedia = extractedPost ? null : await collectArchiveAssetFiles(archive.mediaUrls);
    const extractedMedia = extractedPost ? await collectExtractedPostAssetFiles(extractedPost) : null;
    const markdown = extractedPost
      ? isCloudArchiveRecord(archive)
        ? await renderMarkdown(
            extractedPost,
            extractedMedia!.mediaRefs,
            archivePayload?.aiWarning ?? null,
            archivePayload?.aiResult ?? null,
            archivePayload?.locale
          )
        : buildArchiveMarkdownFromExtractedPost(
            extractedPost,
            archive.archivedAt,
            extractArchiveTags(archive.noteText),
            extractedMedia!.mediaRefs
          )
      : isCloudArchiveRecord(archive)
        ? archive.markdownContent
        : buildArchiveMarkdown(buildArchiveMarkdownPayload(archive, fallbackMedia!.refs));
    const targetFolder = archives.length === 1 ? zip : zip.folder(archiveName);
    if (!targetFolder) {
      continue;
    }

    targetFolder.file(buildArchiveNoteFilename(archiveName), markdown);

    for (const file of extractedPost ? extractedMedia!.files : fallbackMedia!.files) {
      targetFolder.file(file.path, file.data);
    }
  }

  return {
    filename: archives.length === 1 ? `${singleArchiveName}_${zipStamp}.zip` : `threads-scrapbook_${zipStamp}.zip`,
    content: await zip.generateAsync({ type: "nodebuffer" })
  };
}

function toBotUserView(user: BotUserRecord): BotUserView {
  return {
    id: user.id,
    threadsUserId: user.threadsUserId,
    threadsHandle: user.threadsHandle,
    displayName: user.displayName,
    profilePictureUrl: user.profilePictureUrl,
    biography: user.biography,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt,
    grantedScopes: [...user.grantedScopes],
    scopeVersion: user.scopeVersion,
    lastScopeUpgradeAt: user.lastScopeUpgradeAt
  };
}

function toBotArchiveView(item: BotArchiveRecord): BotArchiveView {
  const extractedPost = readArchiveExtractedPost(item.rawPayloadJson);
  const mediaUrls = extractedPost ? summarizeExtractedPostPreviewMediaUrls(extractedPost) : [...item.mediaUrls];
  return {
    id: item.id,
    origin: "mention",
    originLabel: "Saved",
    mentionUrl: item.mentionUrl,
    mentionAuthorHandle: item.mentionAuthorHandle,
    mentionAuthorDisplayName: item.mentionAuthorDisplayName,
    noteText: item.noteText,
    tags: extractArchiveTags(item.noteText),
    targetUrl: item.targetUrl,
    targetAuthorHandle: item.targetAuthorHandle ?? extractedPost?.author ?? null,
    targetAuthorDisplayName: item.targetAuthorDisplayName,
    targetText: extractedPost?.text ?? item.targetText,
    targetPublishedAt: extractedPost?.publishedAt ?? item.targetPublishedAt,
    mediaUrls,
    authorReplies: extractedPost?.authorReplies.map((reply) => buildArchiveReplyView(reply)) ?? [],
    markdownContent: buildArchiveMarkdownFromRecord(item, mediaUrls),
    archivedAt: item.archivedAt,
    updatedAt: item.updatedAt
  };
}

function isTriggerOnlyArchiveRecord(
  item: Pick<
    BotArchiveRecord,
    "mentionAuthorHandle" | "mentionUrl" | "targetAuthorHandle" | "targetText" | "targetUrl"
  >
): boolean {
  const normalizedBotHandle = readBotHandle();
  if (!normalizedBotHandle) {
    return false;
  }

  const normalizedTargetText = safeText(item.targetText).trim().toLowerCase();
  if (!normalizedTargetText.includes(`@${normalizedBotHandle}`)) {
    return false;
  }

  return (
    item.targetUrl === item.mentionUrl &&
    normalizeThreadsHandle(safeText(item.targetAuthorHandle)) ===
      normalizeThreadsHandle(safeText(item.mentionAuthorHandle))
  );
}

function toCloudArchiveView(item: CloudArchiveRecord): BotArchiveView {
  const payload = readCloudArchivePayload(item.rawPayloadJson);
  const mediaUrls = payload.extractedPost ? summarizeExtractedPostPreviewMediaUrls(payload.extractedPost) : [...item.mediaUrls];
  return {
    id: item.id,
    origin: "cloud",
    originLabel: "클라우드 저장",
    mentionUrl: null,
    mentionAuthorHandle: null,
    mentionAuthorDisplayName: null,
    noteText: payload.aiResult?.summary ?? null,
    tags: buildCloudArchiveTags(payload),
    targetUrl: item.canonicalUrl,
    targetAuthorHandle: item.targetAuthorHandle ?? payload.extractedPost?.author ?? null,
    targetAuthorDisplayName: item.targetAuthorDisplayName,
    targetText: payload.extractedPost?.text ?? item.targetText,
    targetPublishedAt: payload.extractedPost?.publishedAt ?? item.targetPublishedAt,
    mediaUrls,
    authorReplies: payload.extractedPost?.authorReplies.map((reply) => buildArchiveReplyView(reply)) ?? [],
    markdownContent: safeText(item.markdownContent) || "",
    archivedAt: item.savedAt,
    updatedAt: item.updatedAt
  };
}

function buildFallbackExtractedPostFromCloudArchive(item: CloudArchiveRecord): ExtractedPost {
  return {
    canonicalUrl: item.canonicalUrl,
    shortcode: item.shortcode,
    author: item.targetAuthorHandle ?? "",
    title: item.targetTitle,
    text: item.targetText,
    publishedAt: item.targetPublishedAt,
    capturedAt: item.updatedAt,
    sourceType: "text",
    imageUrls: [],
    videoUrl: null,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl: null,
    authorReplies: [],
    extractorVersion: "server-cloud-cache",
    contentHash: item.contentHash
  };
}

function buildFallbackExtractedPostFromBotArchive(item: BotArchiveRecord): ExtractedPost {
  return {
    canonicalUrl: item.targetUrl,
    shortcode: item.targetUrl.split("/").pop() ?? item.id,
    author: item.targetAuthorHandle ?? "",
    title: buildArchiveTitle(item.targetAuthorHandle, item.targetText),
    text: item.targetText,
    publishedAt: item.targetPublishedAt,
    capturedAt: item.updatedAt,
    sourceType: item.mediaUrls.length > 0 ? "image" : "text",
    imageUrls: [...item.mediaUrls],
    videoUrl: null,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl: null,
    authorReplies: [],
    extractorVersion: "server-mention-cache",
    contentHash: item.id
  };
}

function toBotArchiveRecentRecord(item: BotArchiveRecord, publicOrigin: string, userHandle?: string | null): CloudArchiveRecentRecord {
  const extractedPost = readArchiveExtractedPost(item.rawPayloadJson) ?? buildFallbackExtractedPostFromBotArchive(item);
  return {
    archiveId: item.id,
    archiveUrl: buildCloudArchiveUrl(publicOrigin, item.id, userHandle),
    title: buildArchiveTitle(item.targetAuthorHandle, extractedPost.text || item.targetText),
    savedAt: item.archivedAt,
    updatedAt: item.updatedAt,
    warning: null,
    origin: "mention",
    post: extractedPost
  };
}

function toCloudArchiveRecentRecord(
  item: CloudArchiveRecord,
  publicOrigin: string,
  userHandle?: string | null
): CloudArchiveRecentRecord {
  const payload = readCloudArchivePayload(item.rawPayloadJson);
  return {
    archiveId: item.id,
    archiveUrl: buildCloudArchiveUrl(publicOrigin, item.id, userHandle),
    title: item.targetTitle,
    savedAt: item.savedAt,
    updatedAt: item.updatedAt,
    warning: payload.aiWarning,
    origin: "cloud",
    post: payload.extractedPost ?? buildFallbackExtractedPostFromCloudArchive(item)
  };
}

function getBotUserByThreadsUserId(data: WebDatabase, threadsUserId: string): BotUserRecord | null {
  return (
    data.botUsers.find(
      (candidate) => candidate.threadsUserId === threadsUserId && candidate.status === "active"
    ) ?? null
  );
}

function getBotUserByHandle(data: WebDatabase, threadsHandle: string): BotUserRecord | null {
  return (
    data.botUsers.find(
      (candidate) => candidate.threadsHandle === threadsHandle && candidate.status === "active"
    ) ?? null
  );
}

function touchExpiredOauthSessions(data: WebDatabase): void {
  const now = Date.now();
  for (const session of data.botOauthSessions) {
    if (session.status === "pending" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
      upsertBotOauthSession(data, session);
    }
  }
}

function touchExpiredSessions(data: WebDatabase): void {
  const now = Date.now();
  for (const session of data.botSessions) {
    if (session.status === "active" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
      upsertBotSession(data, session);
    }
  }
}

function touchExpiredExtensionLinkSessions(data: WebDatabase): void {
  const now = Date.now();
  for (const session of data.botExtensionLinkSessions) {
    if (session.status === "pending" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
      upsertBotExtensionLinkSession(data, session);
    }
  }
}

function touchExpiredExtensionAccessTokens(data: WebDatabase): void {
  const now = Date.now();
  for (const token of data.botExtensionAccessTokens) {
    if (token.status === "active" && isExpired(token.expiresAt, now)) {
      token.status = "expired";
      upsertBotExtensionAccessToken(data, token);
    }
  }
}

function revokeActiveExtensionTokensForUser(data: WebDatabase, userId: string, now: string): void {
  for (const token of data.botExtensionAccessTokens) {
    if (token.userId !== userId || token.status !== "active") {
      continue;
    }
    token.status = "revoked";
    token.revokedAt = now;
    upsertBotExtensionAccessToken(data, token);
  }
}

function createBotSession(data: WebDatabase, user: BotUserRecord): { sessionToken: string; user: BotUserView } {
  const rawSession = createOpaqueToken();
  const now = new Date().toISOString();
  const session: BotSessionRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    sessionHash: hashSecret(rawSession),
    createdAt: now,
    expiresAt: new Date(Date.now() + BOT_SESSION_TTL_MS).toISOString(),
    lastSeenAt: now,
    revokedAt: null,
    status: "active"
  };
  upsertBotSession(data, session);

  user.lastLoginAt = now;
  user.updatedAt = now;
  upsertBotUser(data, user);

  return {
    sessionToken: rawSession,
    user: toBotUserView(user)
  };
}

function shouldRefreshBotSession(session: BotSessionRecord, nowMs: number): boolean {
  const lastSeenAtMs = Date.parse(session.lastSeenAt);
  const expiresAtMs = Date.parse(session.expiresAt);
  if (!Number.isFinite(lastSeenAtMs) || !Number.isFinite(expiresAtMs)) {
    return true;
  }

  return nowMs - lastSeenAtMs >= BOT_SESSION_TOUCH_INTERVAL_MS || expiresAtMs - nowMs <= BOT_SESSION_TOUCH_INTERVAL_MS;
}

function refreshBotSessionKeepAlive(data: WebDatabase, session: BotSessionRecord): void {
  const nowMs = Date.now();
  if (!shouldRefreshBotSession(session, nowMs)) {
    return;
  }

  const now = new Date(nowMs).toISOString();
  session.lastSeenAt = now;
  session.expiresAt = new Date(nowMs + BOT_SESSION_TTL_MS).toISOString();
  upsertBotSession(data, session);
}

function getBotSessionRecord(data: WebDatabase, rawSession: string | null | undefined): BotSessionRecord | null {
  touchExpiredSessions(data);
  const normalized = safeText(rawSession);
  if (!normalized) {
    return null;
  }

  const hash = hashSecret(normalized);
  const session = data.botSessions.find((candidate) => candidate.sessionHash === hash && candidate.status === "active") ?? null;
  if (!session) {
    return null;
  }

  refreshBotSessionKeepAlive(data, session);
  return session;
}

function findBotExtensionAccessTokenRecord(
  data: WebDatabase,
  rawToken: string | null | undefined
): BotExtensionAccessTokenRecord | null {
  touchExpiredExtensionAccessTokens(data);
  const normalized = safeText(rawToken);
  if (!normalized) {
    return null;
  }

  const hash = hashSecret(normalized);
  return data.botExtensionAccessTokens.find((candidate) => candidate.tokenHash === hash) ?? null;
}

async function exchangeAuthorizationCode(code: string, publicOrigin: string): Promise<ThreadsTokenResponse> {
  const { appId, appSecret } = readThreadsOauthConfig();
  const response = await fetchWithTimeout(`${buildThreadsApiBaseUrl()}oauth/access_token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: buildRedirectUri(publicOrigin),
      code
    }).toString()
  });

  const body = (await response.json().catch(() => null)) as { error_message?: string } & ThreadsTokenResponse | null;
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads OAuth token exchange failed.");
  }

  return body ?? {};
}

async function exchangeLongLivedToken(accessToken: string): Promise<ThreadsTokenResponse> {
  const { appSecret } = readThreadsOauthConfig();
  const url = new URL("access_token", buildThreadsApiBaseUrl());
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", accessToken);
  const response = await fetchWithTimeout(url);
  const body = (await response.json().catch(() => null)) as { error_message?: string } & ThreadsTokenResponse | null;
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads long-lived token exchange failed.");
  }

  return body ?? {};
}

async function fetchThreadsProfile(accessToken: string): Promise<ThreadsProfileResponse> {
  const url = new URL("me", buildThreadsApiBaseUrl());
  url.searchParams.set(
    "fields",
    ["id", "username", "name", "threads_profile_picture_url", "threads_biography", "is_verified"].join(",")
  );
  url.searchParams.set("access_token", accessToken);
  const response = await fetchWithTimeout(url);
  const body = (await response.json().catch(() => null)) as { error_message?: string } & ThreadsProfileResponse | null;
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads profile lookup failed.");
  }

  return body ?? {};
}

async function refreshThreadsAccessToken(accessToken: string): Promise<ThreadsTokenResponse> {
  const url = new URL("refresh_access_token", buildThreadsApiBaseUrl());
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetchWithTimeout(url);
  const body = (await response.json().catch(() => null)) as { error_message?: string } & ThreadsTokenResponse | null;
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads access token refresh failed.");
  }

  // Meta documents this endpoint without a response body in some flows, so keep
  // the existing token and extend its lifetime when the refresh succeeds.
  return {
    access_token: safeText(body?.access_token) || accessToken,
    expires_in:
      typeof body?.expires_in === "number" && Number.isFinite(body.expires_in)
        ? body.expires_in
        : THREADS_LONG_LIVED_TOKEN_TTL_MS / 1000
  };
}

function upsertBotUserFromThreadsProfile(
  data: WebDatabase,
  profile: ThreadsProfileResponse,
  accessToken: string,
  expiresAt: string | null
): BotUserRecord {
  const threadsUserId = safeText(profile.id);
  const threadsHandle = normalizeThreadsHandle(safeText(profile.username));
  if (!threadsUserId || !threadsHandle) {
    throw new Error("Threads OAuth did not return a valid user profile.");
  }

  const byUserId = getBotUserByThreadsUserId(data, threadsUserId);
  const byHandle = getBotUserByHandle(data, threadsHandle);
  if (byUserId && byHandle && byUserId.id !== byHandle.id) {
    throw new Error("This Threads account conflicts with an existing scrapbook record.");
  }

  const now = new Date().toISOString();
  const user = byUserId ?? byHandle ?? {
    id: crypto.randomUUID(),
    threadsUserId: null,
    threadsHandle,
    displayName: null,
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    status: "active" as const
  };

  user.threadsUserId = threadsUserId;
  user.threadsHandle = threadsHandle;
  user.displayName = safeText(profile.name) || threadsHandle;
  user.profilePictureUrl = safeText(profile.threads_profile_picture_url) || null;
  user.biography = safeText(profile.threads_biography) || null;
  user.isVerified = profile.is_verified === true;
  user.accessTokenCiphertext = encryptSecret(accessToken);
  user.tokenExpiresAt = expiresAt;
  user.grantedScopes = [...THREADS_OAUTH_SCOPES];
  user.scopeVersion = BOT_SCOPE_VERSION;
  user.lastScopeUpgradeAt = now;
  user.updatedAt = now;
  user.status = "active";
  upsertBotUser(data, user);
  return user;
}

function buildBotAccessTokenExpiry(expiresIn: number | undefined): string | null {
  if (!Number.isFinite(expiresIn) || typeof expiresIn !== "number" || expiresIn <= 0) {
    return null;
  }

  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

export function getBotPublicConfig(): BotPublicConfig {
  return {
    botHandle: readBotHandle(),
    oauthConfigured: isThreadsOauthConfigured()
  };
}

export function getConfiguredBotHandle(): string {
  return readBotHandle();
}

export function startBotOauth(data: WebDatabase, publicOrigin: string): BotOauthStartResult {
  if (!isThreadsOauthConfigured()) {
    throw new Error("Threads OAuth is not configured on the server yet.");
  }

  touchExpiredOauthSessions(data);
  const rawState = createOpaqueToken();
  const rawPollToken = createOpaqueToken();
  const session: BotOauthSessionRecord = {
    id: crypto.randomUUID(),
    stateHash: hashSecret(rawState),
    pollTokenHash: hashSecret(rawPollToken),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + BOT_OAUTH_TTL_MS).toISOString(),
    completedAt: null,
    activationCode: null,
    activationExpiresAt: null,
    linkedSessionToken: null,
    status: "pending"
  };
  upsertBotOauthSession(data, session);

  return {
    authorizeUrl: buildThreadsAuthorizeUrl(publicOrigin, rawState),
    botHandle: readBotHandle(),
    pollToken: rawPollToken
  };
}

export async function completeBotOauth(
  data: WebDatabase,
  rawState: string,
  code: string,
  publicOrigin: string
): Promise<{ sessionToken: string; user: BotUserView; activationCode: string }> {
  if (!isThreadsOauthConfigured()) {
    throw new Error("Threads OAuth is not configured on the server yet.");
  }

  touchExpiredOauthSessions(data);
  touchExpiredSessions(data);

  const normalizedState = safeText(rawState);
  const oauthSession =
    data.botOauthSessions.find(
      (candidate) =>
        candidate.stateHash === hashSecret(normalizedState) &&
        candidate.status === "pending"
    ) ?? null;
  if (!oauthSession || isExpired(oauthSession.expiresAt)) {
    throw new Error("This Threads sign-in session is invalid or expired.");
  }

  const tokenResponse = await exchangeAuthorizationCode(safeText(code), publicOrigin);
  const shortLivedAccessToken = safeText(tokenResponse.access_token);
  if (!shortLivedAccessToken) {
    throw new Error("Threads OAuth did not return an access token.");
  }

  let activeAccessToken = shortLivedAccessToken;
  let tokenExpiresAt = buildBotAccessTokenExpiry(tokenResponse.expires_in);

  try {
    const longLived = await exchangeLongLivedToken(shortLivedAccessToken);
    if (safeText(longLived.access_token)) {
      activeAccessToken = safeText(longLived.access_token);
      tokenExpiresAt = buildBotAccessTokenExpiry(longLived.expires_in);
    }
  } catch {
    // Fall back to the short-lived token if token exchange fails.
  }

  const profile = await fetchThreadsProfile(activeAccessToken);
  const user = upsertBotUserFromThreadsProfile(data, profile, activeAccessToken, tokenExpiresAt);

  const rawActivationCode = createOpaqueToken();
  const sessionResult = createBotSession(data, user);

  oauthSession.status = "completed";
  oauthSession.completedAt = new Date().toISOString();
  oauthSession.activationCode = rawActivationCode;
  oauthSession.activationExpiresAt = new Date(Date.now() + BOT_OAUTH_ACTIVATION_TTL_MS).toISOString();
  oauthSession.linkedSessionToken = sessionResult.sessionToken;
  upsertBotOauthSession(data, oauthSession);

  return { ...sessionResult, activationCode: rawActivationCode };
}

export function failBotOauthSession(data: WebDatabase, rawState: string): void {
  const normalizedState = safeText(rawState);
  const oauthSession =
    data.botOauthSessions.find(
      (s) => s.stateHash === hashSecret(normalizedState) && s.status === "pending"
    ) ?? null;
  if (oauthSession) {
    oauthSession.status = "failed";
    upsertBotOauthSession(data, oauthSession);
  }
}

export function pollBotOauthSession(data: WebDatabase, rawPollToken: string): BotOauthPollResult {
  touchExpiredOauthSessions(data);
  const pollTokenHash = hashSecret(safeText(rawPollToken));
  const oauthSession = data.botOauthSessions.find((s) => s.pollTokenHash === pollTokenHash) ?? null;

  if (!oauthSession || isExpired(oauthSession.expiresAt)) {
    return { status: "expired" };
  }

  if (oauthSession.status === "expired" || oauthSession.status === "failed") {
    return { status: "expired" };
  }

  if (oauthSession.status === "completed") {
    if (
      oauthSession.activationCode &&
      oauthSession.activationExpiresAt &&
      !isExpired(oauthSession.activationExpiresAt)
    ) {
      return { status: "authorized", activationCode: oauthSession.activationCode };
    }
    // completed이지만 activationCode가 만료됐거나 이미 소비됨
    return { status: "expired" };
  }

  return { status: "pending" };
}

export function activateBotOauthSession(
  data: WebDatabase,
  rawActivationCode: string
): { sessionToken: string } | null {
  const code = safeText(rawActivationCode);
  const oauthSession = data.botOauthSessions.find((s) => s.activationCode === code) ?? null;

  if (!oauthSession || !oauthSession.activationExpiresAt || isExpired(oauthSession.activationExpiresAt) || !oauthSession.linkedSessionToken) {
    return null;
  }

  const sessionToken = oauthSession.linkedSessionToken;

  // Consume the activation code (one-time use) and clear the stored token
  oauthSession.activationCode = null;
  oauthSession.activationExpiresAt = null;
  oauthSession.linkedSessionToken = null;
  upsertBotOauthSession(data, oauthSession);

  return { sessionToken };
}

export function createExtensionLinkCode(
  data: WebDatabase,
  rawSession: string | null | undefined,
  state: string
): { code: string; expiresAt: string; userHandle: string } {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("Sign in to Threads Archive scrapbook first.");
  }

  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    session.status = "revoked";
    session.revokedAt = new Date().toISOString();
    upsertBotSession(data, session);
    throw new Error("Your Threads Archive scrapbook session expired. Sign in again.");
  }

  const normalizedState = safeText(state);
  if (!normalizedState) {
    throw new Error("A valid extension link state is required.");
  }

  touchExpiredExtensionLinkSessions(data);
  const now = new Date().toISOString();
  const rawCode = createOpaqueToken();
  const linkSession: BotExtensionLinkSessionRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    state: normalizedState,
    codeHash: hashSecret(rawCode),
    createdAt: now,
    expiresAt: new Date(Date.now() + BOT_EXTENSION_LINK_TTL_MS).toISOString(),
    consumedAt: null,
    revokedAt: null,
    status: "pending"
  };
  upsertBotExtensionLinkSession(data, linkSession);

  return {
    code: rawCode,
    expiresAt: linkSession.expiresAt,
    userHandle: user.threadsHandle
  };
}

export function completeExtensionLinkCode(
  data: WebDatabase,
  rawCode: string,
  state: string
): ExtensionLinkCompleteResult {
  touchExpiredExtensionLinkSessions(data);
  touchExpiredExtensionAccessTokens(data);

  const normalizedCode = safeText(rawCode);
  const normalizedState = safeText(state);
  if (!normalizedCode || !normalizedState) {
    throw new Error("A valid extension link code is required.");
  }

  const linkSession =
    data.botExtensionLinkSessions.find(
      (candidate) =>
        candidate.codeHash === hashSecret(normalizedCode) &&
        candidate.state === normalizedState &&
        candidate.status === "pending"
    ) ?? null;
  if (!linkSession || isExpired(linkSession.expiresAt)) {
    throw new Error("This extension link request is invalid or expired.");
  }

  const user = data.botUsers.find((candidate) => candidate.id === linkSession.userId && candidate.status === "active");
  if (!user) {
    linkSession.status = "revoked";
    linkSession.revokedAt = new Date().toISOString();
    upsertBotExtensionLinkSession(data, linkSession);
    throw new Error("This scrapbook account is no longer available.");
  }

  const now = new Date().toISOString();
  linkSession.status = "consumed";
  linkSession.consumedAt = now;
  upsertBotExtensionLinkSession(data, linkSession);

  revokeActiveExtensionTokensForUser(data, user.id, now);

  const rawToken = createOpaqueToken();
  const tokenRecord: BotExtensionAccessTokenRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: hashSecret(rawToken),
    createdAt: now,
    expiresAt: new Date(Date.now() + BOT_EXTENSION_TOKEN_TTL_MS).toISOString(),
    linkedAt: now,
    lastUsedAt: null,
    revokedAt: null,
    status: "active"
  };
  upsertBotExtensionAccessToken(data, tokenRecord);

  return {
    token: rawToken,
    expiresAt: tokenRecord.expiresAt,
    linkedAt: tokenRecord.linkedAt,
    userHandle: user.threadsHandle
  };
}

function buildCloudConnectionStatusFromTokenRecord(
  data: WebDatabase,
  tokenRecord: BotExtensionAccessTokenRecord | null
): CloudConnectionStatus {
  if (!tokenRecord) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }

  const user = data.botUsers.find((candidate) => candidate.id === tokenRecord.userId && candidate.status === "active");
  if (!user) {
    tokenRecord.status = "revoked";
    tokenRecord.revokedAt = new Date().toISOString();
    upsertBotExtensionAccessToken(data, tokenRecord);
    return {
      state: "revoked",
      userHandle: null,
      expiresAt: tokenRecord.expiresAt,
      linkedAt: tokenRecord.linkedAt
    };
  }

  const state =
    tokenRecord.status === "active"
      ? "linked"
      : tokenRecord.status === "expired"
        ? "expired"
        : "revoked";

  return {
    state,
    userHandle: user.threadsHandle,
    expiresAt: tokenRecord.expiresAt,
    linkedAt: tokenRecord.linkedAt
  };
}

export function getExtensionCloudConnectionStatus(
  data: WebDatabase,
  rawToken: string | null | undefined
): CloudConnectionStatus {
  return buildCloudConnectionStatusFromTokenRecord(data, findBotExtensionAccessTokenRecord(data, rawToken));
}

function requireExtensionLinkUser(
  data: WebDatabase,
  rawToken: string | null | undefined
): { user: BotUserRecord; tokenRecord: BotExtensionAccessTokenRecord } {
  const tokenRecord = findBotExtensionAccessTokenRecord(data, rawToken);
  if (!tokenRecord || tokenRecord.status !== "active") {
    throw new Error("Your cloud connection expired. Reconnect the extension.");
  }

  const user = data.botUsers.find((candidate) => candidate.id === tokenRecord.userId && candidate.status === "active");
  if (!user) {
    tokenRecord.status = "revoked";
    tokenRecord.revokedAt = new Date().toISOString();
    upsertBotExtensionAccessToken(data, tokenRecord);
    throw new Error("Your cloud connection expired. Reconnect the extension.");
  }

  tokenRecord.lastUsedAt = new Date().toISOString();
  upsertBotExtensionAccessToken(data, tokenRecord);
  return { user, tokenRecord };
}

export function syncExtensionCloudLicenseLink(
  data: WebDatabase,
  rawToken: string | null | undefined,
  licenseId: string | null | undefined,
  linkedAt?: string | null
): boolean {
  const { user } = requireExtensionLinkUser(data, rawToken);
  return syncScrapbookPlusLicenseLink(data, user, licenseId, linkedAt);
}

export function revokeExtensionCloudConnection(
  data: WebDatabase,
  rawToken: string | null | undefined
): CloudConnectionStatus {
  const tokenRecord = findBotExtensionAccessTokenRecord(data, rawToken);
  if (!tokenRecord) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }

  if (tokenRecord.status === "active") {
    tokenRecord.status = "revoked";
    tokenRecord.revokedAt = new Date().toISOString();
    upsertBotExtensionAccessToken(data, tokenRecord);
  }

  return buildCloudConnectionStatusFromTokenRecord(data, tokenRecord);
}

export function getBotSessionState(data: WebDatabase, rawSession: string | null | undefined): BotSessionState {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return {
      authenticated: false,
      botHandle: readBotHandle(),
      oauthConfigured: isThreadsOauthConfigured(),
      user: null,
      archives: []
    };
  }

  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    session.status = "revoked";
    session.revokedAt = new Date().toISOString();
    upsertBotSession(data, session);
    return {
      authenticated: false,
      botHandle: readBotHandle(),
      oauthConfigured: isThreadsOauthConfigured(),
      user: null,
      archives: []
    };
  }

  const archives = [
    ...data.botArchives
      .filter((candidate) => candidate.userId === user.id && !isTriggerOnlyArchiveRecord(candidate))
      .map(toBotArchiveView),
    ...data.cloudArchives.filter((candidate) => candidate.userId === user.id).map(toCloudArchiveView)
  ].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));

  return {
    authenticated: true,
    botHandle: readBotHandle(),
    oauthConfigured: isThreadsOauthConfigured(),
    user: toBotUserView(user),
    archives
  };
}

function buildUnauthenticatedSessionState(): BotSessionState {
  return {
    authenticated: false,
    botHandle: readBotHandle(),
    oauthConfigured: isThreadsOauthConfigured(),
    user: null,
    archives: []
  };
}

async function resolveSessionUserId(rawSession: string | null | undefined): Promise<string | null> {
  return withBotAuthDatabaseTransaction((data) => {
    const session = getBotSessionRecord(data, rawSession);
    return session?.userId ?? null;
  });
}

async function resolveExtensionTokenUserId(rawToken: string | null | undefined): Promise<string | null> {
  return withBotAuthDatabaseTransaction((data) => {
    const tokenRecord = findBotExtensionAccessTokenRecord(data, rawToken);
    return tokenRecord?.userId ?? null;
  });
}

export async function withBotSessionDatabaseTransaction<T>(
  rawSession: string | null | undefined,
  handler: (data: WebDatabase, userId: string | null) => Promise<T> | T
): Promise<T> {
  const userId = await resolveSessionUserId(rawSession);
  if (userId) {
    return withUserScopedDatabaseTransaction(userId, (data) => handler(data, userId));
  }

  return withBotAuthDatabaseTransaction((data) => handler(data, null));
}

export async function withExtensionTokenDatabaseTransaction<T>(
  rawToken: string | null | undefined,
  handler: (data: WebDatabase, userId: string | null) => Promise<T> | T
): Promise<T> {
  const userId = await resolveExtensionTokenUserId(rawToken);
  if (userId) {
    return withUserScopedDatabaseTransaction(userId, (data) => handler(data, userId));
  }

  return withBotAuthDatabaseTransaction((data) => handler(data, null));
}

export async function startBotOauthFromStore(publicOrigin: string): Promise<BotOauthStartResult> {
  return withBotAuthDatabaseTransaction((data) => startBotOauth(data, publicOrigin));
}

export async function pollBotOauthSessionFromStore(rawPollToken: string): Promise<BotOauthPollResult> {
  return withBotAuthDatabaseTransaction((data) => pollBotOauthSession(data, rawPollToken));
}

export async function activateBotOauthSessionFromStore(
  rawActivationCode: string
): Promise<{ sessionToken: string } | null> {
  return withBotAuthDatabaseTransaction((data) => activateBotOauthSession(data, rawActivationCode));
}

export async function failBotOauthSessionFromStore(rawState: string): Promise<void> {
  await withBotAuthDatabaseTransaction((data) => {
    failBotOauthSession(data, rawState);
  });
}

export async function completeBotOauthFromStore(
  rawState: string,
  code: string,
  publicOrigin: string
): Promise<{ sessionToken: string; user: BotUserView; activationCode: string }> {
  return withBotAuthDatabaseTransaction((data) => completeBotOauth(data, rawState, code, publicOrigin));
}

export async function createExtensionLinkCodeFromStore(
  rawSession: string | null | undefined,
  state: string
): Promise<{ code: string; expiresAt: string; userHandle: string }> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => createExtensionLinkCode(data, rawSession, state));
}

export async function completeExtensionLinkCodeFromStore(
  rawCode: string,
  state: string
): Promise<ExtensionLinkCompleteResult> {
  return withBotAuthDatabaseTransaction((data) => completeExtensionLinkCode(data, rawCode, state));
}

export async function getExtensionCloudConnectionStatusFromStore(
  rawToken: string | null | undefined
): Promise<CloudConnectionStatus> {
  return withBotAuthDatabaseTransaction((data) => getExtensionCloudConnectionStatus(data, rawToken));
}

export async function revokeExtensionCloudConnectionFromStore(
  rawToken: string | null | undefined
): Promise<CloudConnectionStatus> {
  return withBotAuthDatabaseTransaction((data) => revokeExtensionCloudConnection(data, rawToken));
}

export async function syncExtensionCloudLicenseLinkFromStore(
  rawToken: string | null | undefined,
  licenseId: string | null | undefined,
  linkedAt?: string | null
): Promise<boolean> {
  return withBotAuthDatabaseTransaction((data) =>
    syncExtensionCloudLicenseLink(data, rawToken, licenseId, linkedAt)
  );
}

export async function getBotSessionStateFromStore(
  rawSession: string | null | undefined
): Promise<BotSessionState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => getBotSessionState(data, rawSession));
}

export async function repairBotSessionArchives(
  data: WebDatabase,
  userId: string | null | undefined
): Promise<number> {
  const normalizedUserId = safeText(userId) || null;
  if (!normalizedUserId) {
    return 0;
  }

  let repaired = 0;
  const archives = data.botArchives.filter((candidate) => candidate.userId === normalizedUserId && candidate.status === "saved");
  for (const archive of archives) {
    if (await repairMentionArchiveRecord(archive)) {
      repaired += 1;
    }
  }

  return repaired;
}

export async function repairBotSessionArchivesFromStore(
  rawSession: string | null | undefined
): Promise<number> {
  return withBotSessionDatabaseTransaction(rawSession, (data, userId) => repairBotSessionArchives(data, userId));
}

export function revokeBotSession(data: WebDatabase, rawSession: string | null | undefined): void {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return;
  }

  session.status = "revoked";
  session.revokedAt = new Date().toISOString();
  upsertBotSession(data, session);
}

export function readBotArchiveMarkdown(
  data: WebDatabase,
  rawSession: string | null | undefined,
  archiveId: string
): { filename: string; markdownContent: string } {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }

  const mentionArchive =
    data.botArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ?? null;
  if (mentionArchive) {
    const extractedPost = readArchiveExtractedPost(mentionArchive.rawPayloadJson);
    const titleText = extractedPost?.text ?? mentionArchive.targetText;
    const titleAuthor = mentionArchive.targetAuthorHandle ?? extractedPost?.author ?? null;
    return {
      filename: `${buildArchiveFilenameBase(titleAuthor, titleText)}.md`,
      markdownContent: buildArchiveMarkdownFromRecord(mentionArchive, mentionArchive.mediaUrls)
    };
  }

  const cloudArchive =
    data.cloudArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ?? null;
  if (!cloudArchive) {
    throw new Error("The requested archive could not be found.");
  }

  const payload = readCloudArchivePayload(cloudArchive.rawPayloadJson);
  const titleText = payload.extractedPost?.text ?? cloudArchive.targetText;
  const titleAuthor = cloudArchive.targetAuthorHandle ?? payload.extractedPost?.author ?? null;
  return {
    filename: `${buildArchiveFilenameBase(titleAuthor, titleText)}.md`,
    markdownContent: safeText(cloudArchive.markdownContent) || `# ${buildArchiveTitle(titleAuthor, titleText)}\n`
  };
}

export async function readBotArchiveMarkdownFromStore(
  rawSession: string | null | undefined,
  archiveId: string
): Promise<{ filename: string; markdownContent: string }> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => readBotArchiveMarkdown(data, rawSession, archiveId));
}

export async function readBotArchiveZip(
  data: WebDatabase,
  rawSession: string | null | undefined,
  archiveIds: string[]
): Promise<BotArchiveZipResult> {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }

  const requestedIds = [...new Set(archiveIds.map((value) => safeText(value)).filter(Boolean))];
  if (requestedIds.length === 0) {
    throw new Error("Select at least one archive to export.");
  }

  const archives = requestedIds
    .map(
      (archiveId) =>
        data.botArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ??
        data.cloudArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ??
        null
    )
    .filter((candidate): candidate is StoredArchiveRecord => Boolean(candidate));

  if (archives.length === 0) {
    throw new Error("The requested archives could not be found.");
  }

  return buildArchiveZipBundle(archives);
}

export async function readBotArchiveZipFromStore(
  rawSession: string | null | undefined,
  archiveIds: string[]
): Promise<BotArchiveZipResult> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => readBotArchiveZip(data, rawSession, archiveIds));
}

function buildArchiveRawPayload(payload: BotIngestPayload): string | null {
  if (payload.rawPayload === undefined && !payload.extractedPost) {
    return null;
  }

  const baseRecord = toRecord(payload.rawPayload);
  const value =
    payload.extractedPost
      ? {
          ...(baseRecord ?? {}),
          extractedPost: payload.extractedPost
        }
      : payload.rawPayload;

  return JSON.stringify(value);
}

export function materializeBotMentionArchive(
  user: BotUserRecord | null,
  existingArchive: BotArchiveRecord | null,
  payload: BotIngestPayload,
  allowance: MentionArchiveAllowance = { allowed: true, reason: null }
): MaterializedBotMentionArchive {
  const mentionUrl = safeText(payload.mentionUrl);
  const mentionAuthorUserId = safeText(payload.mentionAuthorUserId) || null;
  const mentionAuthorHandle = normalizeThreadsHandle(payload.mentionAuthorHandle ?? "");
  const extractedPost = payload.extractedPost ?? null;
  const targetUrl = safeText(extractedPost?.canonicalUrl ?? payload.targetUrl);
  const targetText = safeText(extractedPost?.text ?? payload.targetText);

  if (!mentionUrl || (!mentionAuthorUserId && !mentionAuthorHandle) || !targetUrl) {
    throw new Error("mentionUrl, mentionAuthor identity, and targetUrl are required.");
  }

  if (!user) {
    return {
      result: {
        ok: true,
        matched: false,
        created: false,
        archiveId: null,
        reason: "user_not_found"
      },
      archive: null
    };
  }

  if (!existingArchive && !allowance.allowed) {
    return {
      result: {
        ok: true,
        matched: true,
        created: false,
        archiveId: null,
        reason: allowance.reason ?? "limit_reached"
      },
      archive: null
    };
  }

  const now = new Date().toISOString();
  const mediaUrls = extractedPost
    ? summarizeExtractedPostPreviewMediaUrls(extractedPost)
    : Array.isArray(payload.mediaUrls)
      ? payload.mediaUrls.map((value) => safeText(value)).filter(Boolean)
      : [];
  const noteText = safeText(payload.noteText) || null;
  const rawPayloadJson = buildArchiveRawPayload(payload);
  const archiveDraft = {
    mentionUrl,
    mentionAuthorHandle: mentionAuthorHandle || user.threadsHandle,
    mentionAuthorDisplayName: safeText(payload.mentionAuthorDisplayName) || user.displayName,
    noteText,
    targetUrl,
    targetAuthorHandle: safeText(payload.targetAuthorHandle) || extractedPost?.author || null,
    targetAuthorDisplayName: safeText(payload.targetAuthorDisplayName) || null,
    targetText,
    targetPublishedAt: safeText(extractedPost?.publishedAt ?? payload.targetPublishedAt) || null,
    rawPayloadJson,
    archivedAt: now
  } satisfies Pick<
    BotArchiveRecord,
    | "mentionUrl"
    | "mentionAuthorHandle"
    | "mentionAuthorDisplayName"
    | "noteText"
    | "targetUrl"
    | "targetAuthorHandle"
    | "targetAuthorDisplayName"
    | "targetText"
    | "targetPublishedAt"
    | "rawPayloadJson"
    | "archivedAt"
  >;
  const unresolvedTargetCapture = isTriggerOnlyArchiveRecord(archiveDraft);
  if (unresolvedTargetCapture) {
    const preservedArchive =
      existingArchive && !isTriggerOnlyArchiveRecord(existingArchive) ? existingArchive : null;
    return {
      result: {
        ok: true,
        matched: Boolean(preservedArchive),
        created: false,
        archiveId: preservedArchive?.id ?? null,
        reason: preservedArchive ? null : "unresolved_target"
      },
      archive: preservedArchive
    };
  }
  const markdownContent = buildArchiveMarkdownFromRecord(archiveDraft, mediaUrls);

  if (existingArchive) {
    return {
      result: {
        ok: true,
        matched: true,
        created: false,
        archiveId: existingArchive.id,
        reason: null
      },
      archive: {
        ...existingArchive,
        mentionAuthorHandle: mentionAuthorHandle || existingArchive.mentionAuthorHandle,
        mentionAuthorDisplayName:
          safeText(payload.mentionAuthorDisplayName) || existingArchive.mentionAuthorDisplayName,
        noteText: noteText ?? existingArchive.noteText,
        targetUrl,
        targetAuthorHandle: safeText(payload.targetAuthorHandle) || extractedPost?.author || null,
        targetAuthorDisplayName: safeText(payload.targetAuthorDisplayName) || null,
        targetText,
        targetPublishedAt: safeText(extractedPost?.publishedAt ?? payload.targetPublishedAt) || null,
        mediaUrls,
        markdownContent,
        rawPayloadJson: rawPayloadJson ?? existingArchive.rawPayloadJson,
        updatedAt: now
      }
    };
  }

  const archive: BotArchiveRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    mentionId: safeText(payload.mentionId) || null,
    mentionUrl,
    mentionAuthorHandle: mentionAuthorHandle || user.threadsHandle,
    mentionAuthorDisplayName: safeText(payload.mentionAuthorDisplayName) || user.displayName,
    noteText,
    targetUrl,
    targetAuthorHandle: safeText(payload.targetAuthorHandle) || null,
    targetAuthorDisplayName: safeText(payload.targetAuthorDisplayName) || null,
    targetText,
    targetPublishedAt: safeText(extractedPost?.publishedAt ?? payload.targetPublishedAt) || null,
    mediaUrls,
    markdownContent,
    rawPayloadJson,
    archivedAt: now,
    updatedAt: now,
    status: "saved"
  };

  return {
    result: {
      ok: true,
      matched: true,
      created: true,
      archiveId: archive.id,
      reason: null
    },
    archive
  };
}

export function validateBotIngestRequest(authHeader: string | null | undefined): void {
  const expected = requireBotIngestToken();
  if (safeText(authHeader) !== `Bearer ${expected}`) {
    throw new Error("Unauthorized bot ingest request.");
  }
}

export function ingestBotMention(data: WebDatabase, payload: BotIngestPayload): BotIngestResult {
  const mentionUrl = safeText(payload.mentionUrl);
  const mentionAuthorUserId = safeText(payload.mentionAuthorUserId) || null;
  const mentionAuthorHandle = normalizeThreadsHandle(payload.mentionAuthorHandle ?? "");

  const user =
    (mentionAuthorUserId ? getBotUserByThreadsUserId(data, mentionAuthorUserId) : null) ??
    (mentionAuthorHandle ? getBotUserByHandle(data, mentionAuthorHandle) : null);

  const existing = data.botArchives.find((candidate) => {
    if (!user || candidate.userId !== user.id) {
      return false;
    }
    if (payload.mentionId && candidate.mentionId) {
      return candidate.mentionId === safeText(payload.mentionId);
    }
    return candidate.mentionUrl === mentionUrl;
  });

  const allowance =
    user
      ? (() => {
          const permission = canCreateScrapbookArchive(data, user, existing ?? null);
          return {
            allowed: permission.allowed,
            reason: permission.allowed ? null : "limit_reached"
          } satisfies MentionArchiveAllowance;
        })()
      : { allowed: true, reason: null };

  const materialized = materializeBotMentionArchive(user, existing ?? null, payload, allowance);
  if (materialized.archive) {
    upsertBotArchive(data, materialized.archive);
  }

  return materialized.result;
}

export async function saveCloudArchive(
  data: WebDatabase,
  rawSession: string | null | undefined,
  input: CloudArchiveSaveInput,
  publicOrigin: string
): Promise<CloudArchiveSaveResult> {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("Sign in to Threads Archive scrapbook first.");
  }

  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    session.status = "revoked";
    session.revokedAt = new Date().toISOString();
    upsertBotSession(data, session);
    throw new Error("Your Threads Archive scrapbook session expired. Sign in again.");
  }

  return saveCloudArchiveForUser(data, user, input, publicOrigin);
}

async function saveCloudArchiveForUser(
  data: WebDatabase,
  user: BotUserRecord,
  input: CloudArchiveSaveInput,
  publicOrigin: string
): Promise<CloudArchiveSaveResult> {
  const post = input.post;
  const canonicalUrl = safeText(post.canonicalUrl);
  const shortcode = safeText(post.shortcode);
  const contentHash = safeText(post.contentHash);
  if (!canonicalUrl || !shortcode || !contentHash) {
    throw new Error("A valid Threads post is required for cloud save.");
  }

  const locale = normalizeLocale(input.locale, "ko");
  const mediaUrls = summarizeExtractedPostPreviewMediaUrls(post);
  const markdownContent = await renderMarkdown(
    post,
    buildRemoteMarkdownMediaRefs(post),
    input.aiWarning ?? null,
    input.aiResult ?? null,
    locale
  );
  const rawPayloadJson = buildCloudArchiveRawPayload({
    ...input,
    locale
  });
  const now = new Date().toISOString();
  const title = buildArchiveTitle(post.author, post.text);

  const existing =
    data.cloudArchives.find(
      (candidate) =>
        candidate.userId === user.id &&
        (candidate.contentHash === contentHash || candidate.canonicalUrl === canonicalUrl)
    ) ?? null;

  const creationPermission = canCreateScrapbookArchive(data, user, existing);
  if (!creationPermission.allowed) {
    throw new Error(getScrapbookArchiveLimitError(creationPermission.plan));
  }

  if (existing) {
    existing.canonicalUrl = canonicalUrl;
    existing.shortcode = shortcode;
    existing.targetAuthorHandle = safeText(post.author) || existing.targetAuthorHandle;
    existing.targetAuthorDisplayName = existing.targetAuthorDisplayName;
    existing.targetTitle = safeText(post.title) || title;
    existing.targetText = safeText(post.text) || existing.targetText;
    existing.targetPublishedAt = safeText(post.publishedAt) || null;
    existing.mediaUrls = mediaUrls;
    existing.markdownContent = markdownContent;
    existing.rawPayloadJson = rawPayloadJson;
    existing.contentHash = contentHash;
    existing.updatedAt = now;
    upsertCloudArchive(data, existing);
    return {
      archiveId: existing.id,
      archiveUrl: buildCloudArchiveUrl(publicOrigin, existing.id, user.threadsHandle),
      title: existing.targetTitle,
      warning: input.aiWarning ?? null,
      created: false
    };
  }

  const archive: CloudArchiveRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    canonicalUrl,
    shortcode,
    targetAuthorHandle: safeText(post.author) || null,
    targetAuthorDisplayName: null,
    targetTitle: safeText(post.title) || title,
    targetText: safeText(post.text),
    targetPublishedAt: safeText(post.publishedAt) || null,
    mediaUrls,
    markdownContent,
    rawPayloadJson,
    contentHash,
    savedAt: now,
    updatedAt: now,
    status: "saved"
  };
  upsertCloudArchive(data, archive);

  return {
    archiveId: archive.id,
    archiveUrl: buildCloudArchiveUrl(publicOrigin, archive.id, user.threadsHandle),
    title: archive.targetTitle,
    warning: input.aiWarning ?? null,
    created: true
  };
}

export async function saveCloudArchiveWithExtensionToken(
  data: WebDatabase,
  rawToken: string | null | undefined,
  input: CloudArchiveSaveInput,
  publicOrigin: string
): Promise<CloudArchiveSaveResult> {
  const { user } = requireExtensionLinkUser(data, rawToken);
  return saveCloudArchiveForUser(data, user, input, publicOrigin);
}

export async function saveCloudArchiveWithExtensionTokenFromStore(
  rawToken: string | null | undefined,
  input: CloudArchiveSaveInput,
  publicOrigin: string
): Promise<CloudArchiveSaveResult> {
  return withExtensionTokenDatabaseTransaction(rawToken, (data) =>
    saveCloudArchiveWithExtensionToken(data, rawToken, input, publicOrigin)
  );
}

export function listExtensionCloudArchives(
  data: WebDatabase,
  rawToken: string | null | undefined,
  publicOrigin: string,
  limit = 10
): CloudArchiveRecentRecord[] {
  const { user } = requireExtensionLinkUser(data, rawToken);
  const normalizedLimit = Number.isFinite(limit) ? Math.max(1, Math.min(50, Math.trunc(limit))) : 10;
  return [
    ...data.botArchives
      .filter((candidate) => candidate.userId === user.id)
      .map((item) => ({
        savedAt: item.archivedAt,
        record: toBotArchiveRecentRecord(item, publicOrigin, user.threadsHandle)
      })),
    ...data.cloudArchives
      .filter((candidate) => candidate.userId === user.id)
      .map((item) => ({
        savedAt: item.savedAt,
        record: toCloudArchiveRecentRecord(item, publicOrigin, user.threadsHandle)
      }))
  ]
    .sort((left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt))
    .slice(0, normalizedLimit)
    .map((entry) => entry.record);
}

export async function listExtensionCloudArchivesFromStore(
  rawToken: string | null | undefined,
  publicOrigin: string,
  limit = 10
): Promise<CloudArchiveRecentRecord[]> {
  return withExtensionTokenDatabaseTransaction(rawToken, (data) =>
    listExtensionCloudArchives(data, rawToken, publicOrigin, limit)
  );
}

export function deleteExtensionCloudArchive(
  data: WebDatabase,
  rawToken: string | null | undefined,
  archiveId: string
): void {
  const { user } = requireExtensionLinkUser(data, rawToken);
  const normalizedId = safeText(archiveId);
  if (!normalizedId) {
    throw new Error("Select an archive to delete.");
  }

  const cloudIndex = data.cloudArchives.findIndex(
    (candidate) => candidate.id === normalizedId && candidate.userId === user.id
  );
  if (cloudIndex >= 0) {
    data.cloudArchives.splice(cloudIndex, 1);
    clearArchiveReferences(data, user.id, normalizedId);
    return;
  }

  const mentionIndex = data.botArchives.findIndex(
    (candidate) => candidate.id === normalizedId && candidate.userId === user.id
  );
  if (mentionIndex >= 0) {
    data.botArchives.splice(mentionIndex, 1);
    clearArchiveReferences(data, user.id, normalizedId);
    return;
  }

  throw new Error("The requested archive could not be found.");
}

export async function deleteExtensionCloudArchiveFromStore(
  rawToken: string | null | undefined,
  archiveId: string
): Promise<void> {
  await withExtensionTokenDatabaseTransaction(rawToken, (data) =>
    deleteExtensionCloudArchive(data, rawToken, archiveId)
  );
}

function clearArchiveReferences(data: WebDatabase, userId: string, archiveId: string): void {
  for (const result of data.searchResults) {
    if (result.userId !== userId || result.archiveId !== archiveId) {
      continue;
    }
    result.archiveId = null;
    result.archivedAt = null;
    if (result.status === "archived") {
      result.status = "new";
    }
  }

  for (const tracked of data.trackedPosts) {
    if (tracked.userId !== userId || tracked.archiveId !== archiveId) {
      continue;
    }
    tracked.archiveId = null;
    tracked.archivedAt = null;
  }
}

export function deleteArchive(
  data: WebDatabase,
  rawSession: string | null | undefined,
  archiveId: string
): BotSessionState {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }

  const normalizedId = safeText(archiveId);
  if (!normalizedId) {
    throw new Error("Select an archive to delete.");
  }

  const mentionIndex = data.botArchives.findIndex(
    (candidate) => candidate.id === normalizedId && candidate.userId === session.userId
  );
  if (mentionIndex >= 0) {
    data.botArchives.splice(mentionIndex, 1);
    clearArchiveReferences(data, session.userId, normalizedId);
    return getBotSessionState(data, rawSession);
  }

  const cloudIndex = data.cloudArchives.findIndex(
    (candidate) => candidate.id === normalizedId && candidate.userId === session.userId
  );
  if (cloudIndex >= 0) {
    data.cloudArchives.splice(cloudIndex, 1);
    clearArchiveReferences(data, session.userId, normalizedId);
    return getBotSessionState(data, rawSession);
  }

  throw new Error("The requested archive could not be found.");
}

export async function deleteArchiveFromStore(
  rawSession: string | null | undefined,
  archiveId: string
): Promise<BotSessionState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => deleteArchive(data, rawSession, archiveId));
}

export function getBotUserAccessToken(data: WebDatabase, rawSession: string | null | undefined): string | null {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return null;
  }

  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user?.accessTokenCiphertext) {
    return null;
  }

  return decryptSecret(user.accessTokenCiphertext);
}

export function getBotSessionUserRecord(
  data: WebDatabase,
  rawSession: string | null | undefined
): BotUserRecord | null {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return null;
  }

  return data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active") ?? null;
}

export function getBotRequiredScopes(): string[] {
  return [...THREADS_OAUTH_SCOPES];
}

export function getBotScopeVersion(): number {
  return BOT_SCOPE_VERSION;
}

export async function getFreshAccessTokenForUserRecord(
  user: BotUserRecord,
  persistUser: (user: BotUserRecord) => Promise<void> | void
): Promise<string | null> {
  if (!user.accessTokenCiphertext) {
    return null;
  }

  const decrypted = decryptSecret(user.accessTokenCiphertext);
  const expiry = user.tokenExpiresAt ? Date.parse(user.tokenExpiresAt) : Number.NaN;
  if (!Number.isFinite(expiry) || expiry > Date.now() + BOT_TOKEN_REFRESH_WINDOW_MS) {
    return decrypted;
  }

  try {
    const refreshed = await refreshThreadsAccessToken(decrypted);
    const nextToken = safeText(refreshed.access_token) || decrypted;
    user.accessTokenCiphertext = encryptSecret(nextToken);
    user.tokenExpiresAt = buildBotAccessTokenExpiry(refreshed.expires_in);
    user.updatedAt = new Date().toISOString();
    await persistUser(user);
    return nextToken;
  } catch {
    if (expiry > Date.now()) {
      return decrypted;
    }

    throw new Error("The stored Threads access token expired. Sign in with Threads again.");
  }
}

async function getFreshAccessTokenForUser(data: WebDatabase, user: BotUserRecord): Promise<string | null> {
  return getFreshAccessTokenForUserRecord(user, (nextUser) => {
    upsertBotUser(data, nextUser);
  });
}

export async function getBotAccessTokenForHandle(
  data: WebDatabase,
  rawHandle: string | null | undefined
): Promise<string | null> {
  const handle = normalizeThreadsHandle(rawHandle ?? "");
  if (!handle) {
    return null;
  }

  const user = getBotUserByHandle(data, handle);
  if (!user) {
    return null;
  }

  return getFreshAccessTokenForUser(data, user);
}

export async function getBotSessionAuthContext(
  data: WebDatabase,
  rawSession: string | null | undefined
): Promise<BotSessionAuthContext> {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }

  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    throw new Error("This scrapbook session is no longer active.");
  }

  const accessToken = await getFreshAccessTokenForUser(data, user);
  if (!accessToken) {
    throw new Error("Reconnect with Threads to use advanced scrapbook features.");
  }

  return { user, accessToken };
}

export async function revokeBotSessionFromStore(rawSession: string | null | undefined): Promise<void> {
  await withBotAuthDatabaseTransaction((data) => {
    revokeBotSession(data, rawSession);
  });
}

export async function getBotAccessTokenForThreadsUserId(
  data: WebDatabase,
  rawThreadsUserId: string | null | undefined
): Promise<string | null> {
  const threadsUserId = safeText(rawThreadsUserId);
  if (!threadsUserId) {
    return null;
  }

  const user = getBotUserByThreadsUserId(data, threadsUserId);
  if (!user) {
    return null;
  }

  return getFreshAccessTokenForUser(data, user);
}
