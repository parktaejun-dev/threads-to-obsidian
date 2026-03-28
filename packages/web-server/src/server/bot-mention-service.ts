import { JSDOM } from "jsdom";

import { BUNDLED_EXTRACTOR_CONFIG } from "@threads/shared/config";
import { extractPostFromDocument } from "@threads/shared/extractor";
import type { ExtractedPost } from "@threads/shared/types";
import type {
  BotMentionCollectorStatus,
  BotMentionSyncSummary,
  RuntimeCollectorConfig,
  WebDatabase
} from "@threads/web-schema";
import type { BotIngestPayload } from "./bot-service";
import {
  getBotAccessTokenForThreadsUserId,
  getBotAccessTokenForHandle,
  getConfiguredBotHandle,
  ingestBotMention
} from "./bot-service";
import { getRuntimeConfigSnapshot } from "./runtime-config";

const THREADS_GRAPH_BASE_URL = "https://graph.threads.net";
const DEFAULT_POLL_INTERVAL_MS = 60_000;
const DEFAULT_FETCH_LIMIT = 25;
const DEFAULT_MAX_PAGES = 5;
const MAX_FETCH_LIMIT = 100;

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
  "replied_to{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url}",
  "root_post{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url}",
  "quoted_post{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url}"
];

const THREAD_DETAIL_FIELDS = [...THREAD_FIELDS, ...THREAD_RELATION_FIELDS];

type LoggerLike = Pick<Console, "error" | "info">;

type DatabaseRunner = <T>(operation: (data: WebDatabase) => Promise<T> | T) => Promise<T>;

interface ThreadsPaging {
  cursors?: {
    after?: string;
  };
}

interface ThreadsListResponse {
  data?: unknown[];
  paging?: ThreadsPaging;
  error_message?: string;
  error?: {
    message?: string;
  };
}

type ThreadsNode = Record<string, unknown>;

type MentionCollectorConfig = RuntimeCollectorConfig;

export interface BotMentionCollector {
  start: () => void;
  stop: () => void;
  syncNow: (mode?: string) => Promise<BotMentionSyncSummary>;
  getStatus: () => BotMentionCollectorStatus;
  reloadConfig: () => BotMentionCollectorStatus;
}

function parsePositiveInt(raw: string | number | null | undefined, fallback: number, minimum = 1, maximum = Number.MAX_SAFE_INTEGER): number {
  const text = `${raw ?? ""}`.trim();
  if (!text) {
    return fallback;
  }

  const parsed = Number.parseInt(text, 10);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return fallback;
  }

  return parsed;
}

function trimEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function parsePositiveIntEnv(name: string, fallback: number, minimum = 1, maximum = Number.MAX_SAFE_INTEGER): number {
  const raw = trimEnv(name);
  if (!raw) {
    return fallback;
  }

  return parsePositiveInt(raw, fallback, minimum, maximum);
}

function normalizeHandle(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/^@+/, "").toLowerCase();
}

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function toCollectorStatusError(error: unknown): string {
  if (error instanceof Error) {
    if (/unauthorized|forbidden|expired|401|403/i.test(error.message)) {
      return "Collector access token is invalid or expired.";
    }
    if (/rate.?limit|429/i.test(error.message)) {
      return "Threads API rate limit reached. Try again later.";
    }
    if (/network|fetch|timeout|econn|socket/i.test(error.message)) {
      return "Collector could not reach Threads API.";
    }
  }

  return "Unexpected collector error.";
}

function summarizeExtractedPostPreviewMediaUrls(post: ExtractedPost): string[] {
  const urls = [...post.imageUrls];
  if (post.sourceType === "video") {
    if (post.thumbnailUrl) {
      urls.push(post.thumbnailUrl);
    } else if (post.videoUrl) {
      urls.push(post.videoUrl);
    }
  }

  return Array.from(new Set(urls.map((value) => safeText(value)).filter(Boolean)));
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
  return normalized ? normalized : null;
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

async function extractTargetPostFromPermalink(permalinkUrl: string): Promise<ExtractedPost | null> {
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

function buildThreadsApiBaseUrl(config: MentionCollectorConfig): string {
  return `${THREADS_GRAPH_BASE_URL}/${config.graphApiVersion.trim() ? `${config.graphApiVersion.trim()}/` : ""}`;
}

function readCollectorConfig(): MentionCollectorConfig {
  const runtime = getRuntimeConfigSnapshot().collector;
  return {
    botHandle: getConfiguredBotHandle() || runtime.botHandle || "",
    accessTokenOverride: runtime.accessTokenOverride.trim(),
    graphApiVersion: runtime.graphApiVersion.trim(),
    intervalMs: parsePositiveInt(runtime.intervalMs, DEFAULT_POLL_INTERVAL_MS, 5_000),
    fetchLimit: parsePositiveInt(runtime.fetchLimit, DEFAULT_FETCH_LIMIT, 1, MAX_FETCH_LIMIT),
    maxPages: parsePositiveInt(runtime.maxPages, DEFAULT_MAX_PAGES, 1, 20)
  };
}

function createInitialStatus(config: MentionCollectorConfig): BotMentionCollectorStatus {
  return {
    enabled: Boolean(config.botHandle) && config.intervalMs > 0,
    running: false,
    botHandle: config.botHandle,
    pollIntervalMs: config.intervalMs,
    fetchLimit: config.fetchLimit,
    maxPages: config.maxPages,
    lastStartedAt: null,
    lastCompletedAt: null,
    lastSucceededAt: null,
    lastError: null,
    lastSummary: null
  };
}

async function fetchThreadsJson(
  url: URL,
  accessToken: string
): Promise<ThreadsNode> {
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url, {
    headers: {
      accept: "application/json"
    }
  });
  const body = (await response.json().catch(() => null)) as ThreadsListResponse | ThreadsNode | null;
  if (!response.ok) {
    const record = toRecord(body);
    const message =
      readNestedString(record, ["error", "message"]) ||
      readString(record?.error_message) ||
      `Threads API request failed (${response.status}).`;
    throw new Error(message);
  }

  return toRecord(body) ?? {};
}

async function fetchMentionPage(
  config: MentionCollectorConfig,
  accessToken: string,
  afterCursor: string | null
): Promise<{ items: ThreadsNode[]; nextCursor: string | null }> {
  const url = new URL("me/mentions", buildThreadsApiBaseUrl(config));
  url.searchParams.set("fields", THREAD_FIELDS.join(","));
  url.searchParams.set("limit", String(config.fetchLimit));
  if (afterCursor) {
    url.searchParams.set("after", afterCursor);
  }

  const body = await fetchThreadsJson(url, accessToken);
  const items = Array.isArray(body.data) ? body.data.map(toRecord).filter((value): value is ThreadsNode => Boolean(value)) : [];
  const nextCursor = readNestedString(toRecord(body.paging), ["cursors", "after"]);
  return { items, nextCursor };
}

async function fetchRepliesPage(
  config: MentionCollectorConfig,
  accessToken: string,
  afterCursor: string | null
): Promise<{ items: ThreadsNode[]; nextCursor: string | null }> {
  const url = new URL("me/replies", buildThreadsApiBaseUrl(config));
  url.searchParams.set("fields", [...THREAD_FIELDS, ...THREAD_RELATION_FIELDS].join(","));
  url.searchParams.set("limit", String(config.fetchLimit));
  if (afterCursor) {
    url.searchParams.set("after", afterCursor);
  }

  const body = await fetchThreadsJson(url, accessToken);
  const items = Array.isArray(body.data) ? body.data.map(toRecord).filter((value): value is ThreadsNode => Boolean(value)) : [];
  const nextCursor = readNestedString(toRecord(body.paging), ["cursors", "after"]);
  return { items, nextCursor };
}

async function fetchThreadNode(
  config: MentionCollectorConfig,
  accessToken: string,
  threadId: string,
  includeRelations: boolean
): Promise<ThreadsNode | null> {
  const url = new URL(encodeURIComponent(threadId), buildThreadsApiBaseUrl(config));
  url.searchParams.set("fields", (includeRelations ? THREAD_DETAIL_FIELDS : THREAD_FIELDS).join(","));

  try {
    return await fetchThreadsJson(url, accessToken);
  } catch (error) {
    if (!includeRelations) {
      throw error;
    }

    // Fallback to the base fields if relation fields are unavailable for the current API version.
    const fallbackUrl = new URL(encodeURIComponent(threadId), buildThreadsApiBaseUrl(config));
    fallbackUrl.searchParams.set("fields", THREAD_FIELDS.join(","));
    return fetchThreadsJson(fallbackUrl, accessToken);
  }
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

function extractThreadText(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["text"], ["caption"], ["content"]);
}

function extractThreadTimestamp(node: ThreadsNode | null): string | null {
  return readNestedString(node, ["timestamp"]);
}

function extractMediaUrls(node: ThreadsNode | null): string[] {
  const values = [
    readNestedString(node, ["media_url"]),
    readNestedString(node, ["thumbnail_url"])
  ];

  const unique = new Set<string>();
  for (const value of values) {
    if (value) {
      unique.add(value);
    }
  }

  return [...unique];
}

function extractRelatedThreadId(node: ThreadsNode | null): string | null {
  if (!node) {
    return null;
  }

  const direct = [
    readNestedString(node, ["root_post_id"]),
    readNestedString(node, ["reply_to_id"])
  ].find(Boolean);
  if (direct) {
    return direct ?? null;
  }

  const relationCandidates = [
    node.root_post,
    node.replied_to,
    node.reply_to
  ];

  for (const candidate of relationCandidates) {
    const raw = readString(candidate);
    if (raw) {
      return raw;
    }

    const record = toRecord(candidate);
    const nestedId = readNestedString(record, ["id"]);
    if (nestedId) {
      return nestedId;
    }
  }

  return null;
}

function extractRelatedThreadNode(node: ThreadsNode | null): ThreadsNode | null {
  return (
    readNestedNode(node, ["root_post"]) ??
    readNestedNode(node, ["replied_to"]) ??
    readNestedNode(node, ["quoted_post"]) ??
    readNestedNode(node, ["reply_to"])
  );
}

async function hydrateRelatedThreadNode(
  config: MentionCollectorConfig,
  accessToken: string,
  node: ThreadsNode | null
): Promise<ThreadsNode | null> {
  if (!node) {
    return null;
  }

  const hasPermalink = Boolean(buildThreadPermalink(node));
  const hasText = Boolean(safeText(extractThreadText(node) || ""));
  if (hasPermalink || hasText) {
    return node;
  }

  const relationId = readNestedString(node, ["id"]);
  if (!relationId) {
    return node;
  }

  return (await fetchThreadNode(config, accessToken, relationId, false)) ?? node;
}

function isSameThread(left: ThreadsNode | null, rightId: string | null, rightPermalink: string | null): boolean {
  if (!left) {
    return false;
  }

  const leftId = readNestedString(left, ["id"]);
  if (leftId && rightId && leftId === rightId) {
    return true;
  }

  const leftPermalink = buildThreadPermalink(left);
  return Boolean(leftPermalink && rightPermalink && leftPermalink === rightPermalink);
}

async function resolveTargetFromRepliesFeed(
  data: WebDatabase,
  config: MentionCollectorConfig,
  mentionId: string,
  mentionUrl: string,
  mentionAuthorUserId: string | null,
  mentionAuthorHandle: string | null
): Promise<ThreadsNode | null> {
  const ownerAccessToken =
    (mentionAuthorUserId ? await getBotAccessTokenForThreadsUserId(data, mentionAuthorUserId) : null) ??
    (mentionAuthorHandle ? await getBotAccessTokenForHandle(data, mentionAuthorHandle) : null);
  if (!ownerAccessToken) {
    return null;
  }

  let afterCursor: string | null = null;
  for (let page = 0; page < config.maxPages; page += 1) {
    let replyPage: { items: ThreadsNode[]; nextCursor: string | null };
    try {
      replyPage = await fetchRepliesPage(config, ownerAccessToken, afterCursor);
    } catch {
      return null;
    }

    for (const reply of replyPage.items) {
      if (!isSameThread(reply, mentionId, mentionUrl)) {
        continue;
      }

      return extractRelatedThreadNode(reply);
    }

    afterCursor = replyPage.nextCursor;
    if (!afterCursor || replyPage.items.length === 0) {
      break;
    }
  }

  return null;
}

function buildFallbackTargetText(node: ThreadsNode | null): string {
  const handle = extractThreadHandle(node);
  return handle
    ? `Threads post by @${handle} (no text returned by the API).`
    : "Threads post (no text returned by the API).";
}

async function buildIngestPayload(
  data: WebDatabase,
  config: MentionCollectorConfig,
  accessToken: string,
  mentionSummary: ThreadsNode
): Promise<BotIngestPayload | null> {
  const mentionId = readNestedString(mentionSummary, ["id"]);
  if (!mentionId) {
    return null;
  }

  const mentionDetail = await fetchThreadNode(config, accessToken, mentionId, true);
  const mentionUrl = buildThreadPermalink(mentionDetail) || buildThreadPermalink(mentionSummary);
  const mentionAuthorHandle = extractThreadHandle(mentionDetail) || extractThreadHandle(mentionSummary);
  const mentionAuthorUserId = extractThreadUserId(mentionDetail) || extractThreadUserId(mentionSummary);
  if (!mentionUrl || !mentionAuthorHandle) {
    return null;
  }

  const relatedThreadId = extractRelatedThreadId(mentionDetail);
  const relatedThreadNode = await hydrateRelatedThreadNode(
    config,
    accessToken,
    extractRelatedThreadNode(mentionDetail)
  );
  const replyResolvedTarget =
    relatedThreadNode ??
    (relatedThreadId ? await fetchThreadNode(config, accessToken, relatedThreadId, false) : null) ??
    (await resolveTargetFromRepliesFeed(
      data,
      config,
      mentionId,
      mentionUrl,
      mentionAuthorUserId,
      mentionAuthorHandle
    ));
  const targetNode = replyResolvedTarget ?? mentionDetail ?? mentionSummary;

  const unresolvedTargetUrl = buildThreadPermalink(targetNode) || mentionUrl;
  const mentionText = safeText(extractThreadText(mentionDetail) || extractThreadText(mentionSummary) || "");
  const extractedTargetPost = await extractTargetPostFromPermalink(unresolvedTargetUrl);
  const targetUrl = safeText(extractedTargetPost?.canonicalUrl) || unresolvedTargetUrl;
  const targetText =
    safeText(extractedTargetPost?.text) ||
    safeText(extractThreadText(targetNode) || "") ||
    buildFallbackTargetText(targetNode);
  const targetIsSeparate = targetUrl !== mentionUrl || targetText !== mentionText;

  return {
    mentionId,
    mentionUrl,
    mentionAuthorUserId,
    mentionAuthorHandle,
    mentionAuthorDisplayName: extractThreadDisplayName(mentionDetail) || extractThreadDisplayName(mentionSummary),
    noteText: targetIsSeparate ? mentionText || null : null,
    targetUrl,
    targetAuthorHandle: safeText(extractedTargetPost?.author) || extractThreadHandle(targetNode),
    targetAuthorDisplayName: extractThreadDisplayName(targetNode),
    targetText,
    targetPublishedAt: safeText(extractedTargetPost?.publishedAt) || extractThreadTimestamp(targetNode),
    mediaUrls: extractedTargetPost ? summarizeExtractedPostPreviewMediaUrls(extractedTargetPost) : extractMediaUrls(targetNode),
    extractedPost: extractedTargetPost,
    rawPayload: {
      mention: mentionDetail ?? mentionSummary,
      target: targetNode,
      extractedPost: extractedTargetPost
    }
  };
}

async function resolveCollectorAccessToken(
  config: MentionCollectorConfig,
  data: WebDatabase
): Promise<string | null> {
  if (config.accessTokenOverride.trim()) {
    return config.accessTokenOverride;
  }

  return getBotAccessTokenForHandle(data, config.botHandle);
}

async function syncMentions(
  data: WebDatabase,
  config: MentionCollectorConfig,
  mode: string
): Promise<BotMentionSyncSummary> {
  if (!config.botHandle) {
    return {
      ok: false,
      reason: "bot_handle_missing",
      mode,
      fetchedPages: 0,
      fetchedMentions: 0,
      processedMentions: 0,
      createdArchives: 0,
      updatedArchives: 0,
      unmatchedMentions: 0,
      skippedExisting: 0,
      skippedInvalid: 0
    };
  }

  const accessToken = await resolveCollectorAccessToken(config, data);
  if (!accessToken) {
    return {
      ok: false,
      reason: "access_token_missing",
      mode,
      fetchedPages: 0,
      fetchedMentions: 0,
      processedMentions: 0,
      createdArchives: 0,
      updatedArchives: 0,
      unmatchedMentions: 0,
      skippedExisting: 0,
      skippedInvalid: 0
    };
  }

  const knownMentionIds = new Set(
    data.botArchives
      .map((candidate) => safeText(candidate.mentionId))
      .filter(Boolean)
  );

  let fetchedPages = 0;
  let fetchedMentions = 0;
  let processedMentions = 0;
  let createdArchives = 0;
  let updatedArchives = 0;
  let unmatchedMentions = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;
  let afterCursor: string | null = null;

  for (let page = 0; page < config.maxPages; page += 1) {
    const pageResult = await fetchMentionPage(config, accessToken, afterCursor);
    fetchedPages += 1;
    fetchedMentions += pageResult.items.length;

    let sawOnlyExisting = true;
    for (const mentionSummary of pageResult.items) {
      const mentionId = safeText(readNestedString(mentionSummary, ["id"]) || "");
      if (mode === "interval" && mentionId && knownMentionIds.has(mentionId)) {
        skippedExisting += 1;
        continue;
      }

      sawOnlyExisting = false;
      const payload = await buildIngestPayload(data, config, accessToken, mentionSummary);
      if (!payload) {
        skippedInvalid += 1;
        continue;
      }

      processedMentions += 1;
      const ingest = ingestBotMention(data, payload);
      if (payload.mentionId) {
        knownMentionIds.add(payload.mentionId);
      }

      if (!ingest.matched) {
        unmatchedMentions += 1;
        continue;
      }

      if (ingest.created) {
        createdArchives += 1;
      } else {
        updatedArchives += 1;
      }
    }

    afterCursor = pageResult.nextCursor;
    if (!afterCursor || pageResult.items.length === 0 || sawOnlyExisting) {
      break;
    }
  }

  return {
    ok: true,
    reason: null,
    mode,
    fetchedPages,
    fetchedMentions,
    processedMentions,
    createdArchives,
    updatedArchives,
    unmatchedMentions,
    skippedExisting,
    skippedInvalid
  };
}

export function createBotMentionCollector(deps: {
  runTransaction: DatabaseRunner;
  logger?: LoggerLike;
}): BotMentionCollector {
  let config = readCollectorConfig();
  const logger = deps.logger ?? console;
  const status = createInitialStatus(config);

  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight: Promise<BotMentionSyncSummary> | null = null;
  let started = false;

  const applyStatusConfig = (): void => {
    status.enabled = Boolean(config.botHandle) && config.intervalMs > 0;
    status.botHandle = config.botHandle;
    status.pollIntervalMs = config.intervalMs;
    status.fetchLimit = config.fetchLimit;
    status.maxPages = config.maxPages;
  };

  const scheduleTimer = (): void => {
    if (!started || !status.enabled || timer) {
      return;
    }

    timer = setInterval(() => {
      void runSync("interval").catch((error) => {
        logger.error("[threads-bot] mention sync failed:", error);
      });
    }, config.intervalMs);
  };

  const restartTimer = (): void => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    scheduleTimer();
  };

  const runSync = async (mode = "manual"): Promise<BotMentionSyncSummary> => {
    if (inFlight) {
      return inFlight;
    }

    status.running = true;
    status.lastStartedAt = new Date().toISOString();
    status.lastError = null;

    inFlight = deps
      .runTransaction((data) => syncMentions(data, config, mode))
      .then((summary) => {
        status.lastSummary = summary;
        status.lastCompletedAt = new Date().toISOString();
        if (summary.ok) {
          status.lastSucceededAt = status.lastCompletedAt;
        } else {
          status.lastError = summary.reason;
        }
        return summary;
      })
      .catch((error) => {
        status.lastCompletedAt = new Date().toISOString();
        status.lastError = toCollectorStatusError(error);
        throw error;
      })
      .finally(() => {
        status.running = false;
        inFlight = null;
      });

    return inFlight;
  };

  return {
    start() {
      started = true;
      applyStatusConfig();
      if (!status.enabled || timer) {
        return;
      }

      void runSync("startup").catch((error) => {
        logger.error("[threads-bot] initial mention sync failed:", error);
      });
      scheduleTimer();
    },

    stop() {
      started = false;
      if (!timer) {
        return;
      }

      clearInterval(timer);
      timer = null;
    },

    syncNow(mode = "manual") {
      return runSync(mode);
    },

    getStatus() {
      return {
        ...status
      };
    },

    reloadConfig() {
      config = readCollectorConfig();
      applyStatusConfig();
      restartTimer();
      if (started && status.enabled) {
        void runSync("config_reload").catch((error) => {
          logger.error("[threads-bot] collector reload sync failed:", error);
        });
      }
      return {
        ...status
      };
    }
  };
}
