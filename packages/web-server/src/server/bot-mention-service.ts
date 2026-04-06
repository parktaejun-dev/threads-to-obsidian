import { JSDOM } from "jsdom";

import { BUNDLED_EXTRACTOR_CONFIG } from "@threads/shared/config";
import { extractPostFromDocument } from "@threads/shared/extractor";
import type { ExtractedPost } from "@threads/shared/types";
import type {
  BotMentionCollectorStatus,
  BotMentionJobRecord,
  BotMentionSyncSummary,
  RuntimeCollectorConfig,
  WebDatabase
} from "@threads/web-schema";
import type { BotIngestPayload, BotIngestResult } from "./bot-service";
import {
  getFreshAccessTokenForUserRecord,
  getBotAccessTokenForThreadsUserId,
  getBotAccessTokenForHandle,
  getConfiguredBotHandle,
  ingestBotMention,
  materializeBotMentionArchive
} from "./bot-service";
import { resolveTargetPostWithBrowser } from "./browser-target-resolver";
import { getRuntimeConfigSnapshot } from "./runtime-config";
import {
  claimBotMentionJobs as claimStoredBotMentionJobs,
  enqueueBotMentionJobs as enqueueStoredBotMentionJobs,
  findBotArchiveByMention,
  findBotUserByHandle,
  findBotUserByThreadsUserId,
  finalizeBotMentionJob as finalizeStoredBotMentionJob,
  loadDatabase,
  loadBotMentionReadState,
  loadBotMentionJobs,
  pruneBotMentionJobs,
  saveBotArchiveRecord,
  saveBotUserRecord,
  upsertBotMentionJob
} from "./store";
import { canCreateScrapbookArchive } from "./scrapbook-plan-service";

const THREADS_GRAPH_BASE_URL = "https://graph.threads.net";
const DEFAULT_POLL_INTERVAL_MS = 60_000;
const DEFAULT_FETCH_LIMIT = 25;
const DEFAULT_MAX_PAGES = 5;
const MAX_FETCH_LIMIT = 100;
const DEFAULT_PROCESSING_CONCURRENCY = 4;
const MAX_PROCESSING_CONCURRENCY = 32;
const DEFAULT_WORKER_INTERVAL_MS = 1_000;
const DEFAULT_JOB_BATCH_SIZE = 25;
const MAX_JOB_BATCH_SIZE = 100;
const DEFAULT_JOB_LEASE_MS = 2 * 60_000;
const DEFAULT_JOB_RETRY_BASE_MS = 15_000;
const MAX_JOB_RETRY_DELAY_MS = 15 * 60_000;
const DEFAULT_JOB_RETENTION_MS = 7 * 24 * 60 * 60_000;

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
type DatabaseLoader = () => Promise<WebDatabase>;
type ThreadsAccessTokenResolver = (
  rawThreadsUserId: string | null | undefined,
  rawHandle: string | null | undefined
) => Promise<string | null>;

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

interface MentionSyncReadState {
  activeUserIds: Set<string>;
  activeUserHandles: Set<string>;
  activeUsers: Array<{
    threadsUserId: string | null;
    threadsHandle: string;
  }>;
  knownMentionIds: Set<string>;
}

type MentionPreparationResult =
  | { kind: "invalid" }
  | { kind: "unmatched" }
  | { kind: "payload"; payload: BotIngestPayload };

type MentionProcessResult =
  | { kind: "invalid" }
  | { kind: "unmatched" }
  | { kind: "failed"; error: unknown }
  | { kind: "ingested"; ingest: BotIngestResult };

export interface BotMentionCollector {
  start: () => void;
  stop: () => Promise<void>;
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

function createSummary(
  mode: string,
  overrides: Partial<BotMentionSyncSummary>
): BotMentionSyncSummary {
  return {
    ok: true,
    reason: null,
    mode,
    fetchedPages: 0,
    fetchedMentions: 0,
    processedMentions: 0,
    createdArchives: 0,
    updatedArchives: 0,
    unmatchedMentions: 0,
    skippedExisting: 0,
    skippedInvalid: 0,
    ...overrides
  };
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
    const extractedPost = await extractPostFromDocument(
      dom.window.document,
      dom.window.location.href,
      BUNDLED_EXTRACTOR_CONFIG
    );
    if (extractedPost.repliedToUrl || extractedPost.quotedPostUrl) {
      return extractedPost;
    }

    const embeddedMatches = html.matchAll(
      /"post":\{[\s\S]*?"user":\{[\s\S]*?"username":"([^"]+)"[\s\S]*?"code":"([A-Za-z0-9_-]+)"/g
    );
    const embeddedUrls = Array.from(
      new Set(
        Array.from(embeddedMatches, (match) => {
          const username = safeText(match[1]);
          const code = safeText(match[2]);
          return username && code ? `https://www.threads.com/@${username}/post/${code}` : null;
        }).filter((value): value is string => Boolean(value))
      )
    );
    const currentIndex = embeddedUrls.indexOf(extractedPost.canonicalUrl);
    if (currentIndex <= 0) {
      return extractedPost;
    }

    return {
      ...extractedPost,
      repliedToUrl: embeddedUrls[currentIndex - 1] ?? extractedPost.repliedToUrl
    };
  } catch {
    return null;
  }
}

async function extractRelatedTargetPermalink(permalinkUrl: string): Promise<string | null> {
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
      return null;
    }

    const html = await response.text();
    const embeddedMatches = html.matchAll(
      /"post":\{[\s\S]*?"user":\{[\s\S]*?"username":"([^"]+)"[\s\S]*?"code":"([A-Za-z0-9_-]+)"/g
    );
    const embeddedUrls = Array.from(
      new Set(
        Array.from(embeddedMatches, (match) => {
          const username = safeText(match[1]);
          const code = safeText(match[2]);
          return username && code ? `https://www.threads.com/@${username}/post/${code}` : null;
        }).filter((value): value is string => Boolean(value))
      )
    );
    const currentIndex = embeddedUrls.indexOf(normalizedUrl);
    return currentIndex > 0 ? embeddedUrls[currentIndex - 1] ?? null : null;
  } catch {
    return null;
  }
}

async function resolveExtractedTargetPost(
  unresolvedTargetUrl: string,
  mentionUrl: string,
  mentionText: string
): Promise<ExtractedPost | null> {
  const extractedTargetPost = await extractTargetPostFromPermalink(unresolvedTargetUrl);
  const relatedTargetUrl =
    safeText(extractedTargetPost?.repliedToUrl || extractedTargetPost?.quotedPostUrl) ||
    (await extractRelatedTargetPermalink(unresolvedTargetUrl));
  if (!extractedTargetPost && !relatedTargetUrl) {
    return await resolveTargetPostWithBrowser(mentionUrl);
  }

  if (!extractedTargetPost && relatedTargetUrl) {
    return (
      (await extractTargetPostFromPermalink(relatedTargetUrl)) ??
      (await resolveTargetPostWithBrowser(mentionUrl)) ??
      null
    );
  }

  const looksLikeTriggerCapture =
    unresolvedTargetUrl === mentionUrl ||
    extractedTargetPost?.canonicalUrl === mentionUrl ||
    (mentionText.length > 0 && extractedTargetPost?.text === mentionText);
  if (looksLikeTriggerCapture) {
    const browserResolvedTarget = await resolveTargetPostWithBrowser(mentionUrl);
    if (browserResolvedTarget) {
      return browserResolvedTarget;
    }
  }
  if (!relatedTargetUrl || relatedTargetUrl === mentionUrl || !looksLikeTriggerCapture) {
    return extractedTargetPost ?? null;
  }

  return (
    (await extractTargetPostFromPermalink(relatedTargetUrl)) ??
    (await resolveTargetPostWithBrowser(mentionUrl)) ??
    extractedTargetPost
  );
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

function readProcessingConcurrency(): number {
  return parsePositiveIntEnv(
    "THREADS_BOT_MENTION_PROCESSING_CONCURRENCY",
    DEFAULT_PROCESSING_CONCURRENCY,
    1,
    MAX_PROCESSING_CONCURRENCY
  );
}

function readWorkerIntervalMs(): number {
  return parsePositiveIntEnv(
    "THREADS_BOT_MENTION_WORKER_INTERVAL_MS",
    DEFAULT_WORKER_INTERVAL_MS,
    250,
    60_000
  );
}

function useExternalizedMentionJobs(): boolean {
  const database = getRuntimeConfigSnapshot().database;
  return database.backend === "postgres" && Boolean(database.postgresUrl.trim());
}

function readJobBatchSize(): number {
  return parsePositiveIntEnv(
    "THREADS_BOT_MENTION_JOB_BATCH_SIZE",
    DEFAULT_JOB_BATCH_SIZE,
    1,
    MAX_JOB_BATCH_SIZE
  );
}

function readJobLeaseMs(): number {
  return parsePositiveIntEnv(
    "THREADS_BOT_MENTION_JOB_LEASE_MS",
    DEFAULT_JOB_LEASE_MS,
    5_000,
    15 * 60_000
  );
}

function safeTime(value: string | null | undefined, fallback = 0): number {
  if (!value) {
    return fallback;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeJsonStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function createCachedAccessTokenResolver(baseResolver: ThreadsAccessTokenResolver): ThreadsAccessTokenResolver {
  const cache = new Map<string, Promise<string | null>>();

  return (rawThreadsUserId, rawHandle) => {
    const threadsUserId = safeText(rawThreadsUserId) || "";
    const handle = normalizeHandle(rawHandle);
    const cacheKey = `${threadsUserId}::${handle}`;
    if (!cache.has(cacheKey)) {
      const pending = baseResolver(rawThreadsUserId, rawHandle).catch((error) => {
        cache.delete(cacheKey);
        throw error;
      });
      cache.set(cacheKey, pending);
    }

    return cache.get(cacheKey) as Promise<string | null>;
  };
}

function parseMentionSummaryJobPayload(job: BotMentionJobRecord): ThreadsNode | null {
  if (job.rawSummaryJson) {
    try {
      return toRecord(JSON.parse(job.rawSummaryJson));
    } catch {
      // Ignore malformed stored payloads and fall back to the lightweight fields below.
    }
  }

  return toRecord({
    id: job.mentionId,
    permalink: job.mentionUrl,
    username: job.mentionAuthorHandle,
    text: job.mentionText,
    timestamp: job.mentionPublishedAt
  });
}

function buildMentionJobRecord(mentionSummary: ThreadsNode, now: string): BotMentionJobRecord | null {
  const mentionId = safeText(readNestedString(mentionSummary, ["id"]) || "");
  if (!mentionId) {
    return null;
  }

  return {
    id: mentionId,
    mentionId,
    mentionUrl: buildThreadPermalink(mentionSummary),
    mentionAuthorHandle: extractThreadHandle(mentionSummary),
    mentionAuthorUserId: extractThreadUserId(mentionSummary),
    mentionText: safeText(extractThreadText(mentionSummary) || "") || null,
    mentionPublishedAt: extractThreadTimestamp(mentionSummary),
    rawSummaryJson: safeJsonStringify(mentionSummary),
    attempts: 0,
    status: "queued",
    lastError: null,
    availableAt: now,
    leasedAt: null,
    processedAt: null,
    createdAt: now,
    updatedAt: now
  };
}

function pruneMentionJobs(data: WebDatabase, now: string): void {
  const cutoff = safeTime(now) - DEFAULT_JOB_RETENTION_MS;
  if (!Number.isFinite(cutoff)) {
    return;
  }

  data.botMentionJobs = data.botMentionJobs.filter((job) => {
    if (job.status === "queued" || job.status === "processing" || job.status === "failed") {
      return true;
    }

    return safeTime(job.updatedAt, 0) >= cutoff;
  });
}

function enqueueMentionJobs(
  data: WebDatabase,
  mentionSummaries: ThreadsNode[],
  now: string,
  forceRequeue: boolean
): { enqueued: number; invalid: number } {
  let enqueued = 0;
  let invalid = 0;
  for (const mentionSummary of mentionSummaries) {
    const job = buildMentionJobRecord(mentionSummary, now);
    if (!job) {
      invalid += 1;
      continue;
    }

    const existingJob = data.botMentionJobs.find((candidate) => candidate.mentionId === job.mentionId);
    const existingArchive = data.botArchives.some((candidate) => safeText(candidate.mentionId) === job.mentionId);
    if (!forceRequeue && (existingJob || existingArchive)) {
      continue;
    }

    if (existingJob) {
      existingJob.mentionUrl = job.mentionUrl;
      existingJob.mentionAuthorHandle = job.mentionAuthorHandle;
      existingJob.mentionAuthorUserId = job.mentionAuthorUserId;
      existingJob.mentionText = job.mentionText;
      existingJob.mentionPublishedAt = job.mentionPublishedAt;
      existingJob.rawSummaryJson = job.rawSummaryJson;
      existingJob.status = "queued";
      existingJob.lastError = null;
      existingJob.availableAt = now;
      existingJob.leasedAt = null;
      existingJob.processedAt = null;
      existingJob.updatedAt = now;
      upsertBotMentionJob(data, existingJob);
      enqueued += 1;
      continue;
    }

    upsertBotMentionJob(data, job);
    enqueued += 1;
  }

  pruneMentionJobs(data, now);
  return { enqueued, invalid };
}

function isClaimableJob(job: BotMentionJobRecord, now: number, leaseMs: number): boolean {
  if (safeTime(job.availableAt, 0) > now) {
    return false;
  }

  if (job.status === "queued" || job.status === "failed") {
    return true;
  }

  if (job.status !== "processing") {
    return false;
  }

  return safeTime(job.leasedAt, 0) + leaseMs <= now;
}

type MentionJobClaimOrder = "oldest" | "newest";

function claimMentionJobs(
  data: WebDatabase,
  now: string,
  batchSize: number,
  leaseMs: number,
  options: {
    order?: MentionJobClaimOrder;
  } = {}
): BotMentionJobRecord[] {
  const nowMs = safeTime(now);
  const sortDirection = options.order === "newest" ? -1 : 1;
  const claimed = data.botMentionJobs
    .filter((candidate) => isClaimableJob(candidate, nowMs, leaseMs))
    .sort((left, right) =>
      sortDirection === -1
        ? safeTime(right.availableAt) - safeTime(left.availableAt) || safeTime(right.createdAt) - safeTime(left.createdAt)
        : safeTime(left.availableAt) - safeTime(right.availableAt) || safeTime(left.createdAt) - safeTime(right.createdAt)
    )
    .slice(0, batchSize);

  for (const job of claimed) {
    job.status = "processing";
    job.attempts = Math.max(0, job.attempts) + 1;
    job.leasedAt = now;
    job.updatedAt = now;
    upsertBotMentionJob(data, job);
  }

  return claimed.map((candidate) => structuredClone(candidate) as BotMentionJobRecord);
}

function retryDelayMs(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  return Math.min(DEFAULT_JOB_RETRY_BASE_MS * (2 ** exponent), MAX_JOB_RETRY_DELAY_MS);
}

function completeMentionJob(
  data: WebDatabase,
  mentionId: string,
  input: {
    now: string;
    status: "completed" | "failed" | "invalid" | "unmatched";
    lastError?: string | null;
    attempts?: number;
  }
): void {
  const job = data.botMentionJobs.find((candidate) => candidate.mentionId === mentionId);
  if (!job) {
    return;
  }

  job.status = input.status;
  job.lastError = input.lastError ?? null;
  job.leasedAt = null;
  job.updatedAt = input.now;

  if (input.status === "failed") {
    job.availableAt = new Date(safeTime(input.now) + retryDelayMs(input.attempts ?? job.attempts)).toISOString();
    job.processedAt = null;
  } else {
    job.availableAt = input.now;
    job.processedAt = input.now;
  }

  upsertBotMentionJob(data, job);
  pruneMentionJobs(data, input.now);
}

function buildMentionSyncReadState(input: {
  activeUsers: Iterable<{
    threadsUserId: string | null | undefined;
    threadsHandle: string | null | undefined;
  }>;
  knownMentionIds: Iterable<string>;
}): MentionSyncReadState {
  const activeUserIds = new Set<string>();
  const activeUserHandles = new Set<string>();
  const activeUsers: MentionSyncReadState["activeUsers"] = [];
  const seenUsers = new Set<string>();

  for (const candidate of input.activeUsers) {
    const threadsUserId = safeText(candidate.threadsUserId) || null;
    const threadsHandle = normalizeHandle(candidate.threadsHandle);
    if (!threadsUserId && !threadsHandle) {
      continue;
    }

    if (threadsUserId) {
      activeUserIds.add(threadsUserId);
    }
    if (threadsHandle) {
      activeUserHandles.add(threadsHandle);
    }

    const cacheKey = `${threadsUserId ?? ""}::${threadsHandle}`;
    if (seenUsers.has(cacheKey)) {
      continue;
    }
    seenUsers.add(cacheKey);
    activeUsers.push({
      threadsUserId,
      threadsHandle
    });
  }

  return {
    activeUserIds,
    activeUserHandles,
    activeUsers,
    knownMentionIds: new Set([...input.knownMentionIds].map((value) => safeText(value)).filter(Boolean))
  };
}

function createMentionSyncReadState(data: WebDatabase): MentionSyncReadState {
  return buildMentionSyncReadState({
    activeUsers: data.botUsers
      .filter((candidate) => candidate.status === "active")
      .map((candidate) => ({
        threadsUserId: candidate.threadsUserId,
        threadsHandle: candidate.threadsHandle
      })),
    knownMentionIds: [
      ...data.botArchives.map((candidate) => safeText(candidate.mentionId)),
      ...data.botMentionJobs.map((candidate) => safeText(candidate.mentionId))
    ]
  });
}

function hasMatchedUser(
  readState: MentionSyncReadState,
  rawThreadsUserId: string | null | undefined,
  rawHandle: string | null | undefined
): boolean {
  const threadsUserId = safeText(rawThreadsUserId);
  if (threadsUserId && readState.activeUserIds.has(threadsUserId)) {
    return true;
  }

  const handle = normalizeHandle(rawHandle);
  return Boolean(handle && readState.activeUserHandles.has(handle));
}

async function mapWithConcurrency<T, TResult>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<TResult>
): Promise<TResult[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<TResult>(items.length);
  let cursor = 0;
  const workerCount = Math.min(Math.max(concurrency, 1), items.length);

  const runWorker = async (): Promise<void> => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }

      results[index] = await worker(items[index] as T);
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
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
  config: MentionCollectorConfig,
  resolveAccessToken: ThreadsAccessTokenResolver,
  mentionId: string,
  mentionUrl: string,
  mentionAuthorUserId: string | null,
  mentionAuthorHandle: string | null
): Promise<ThreadsNode | null> {
  let ownerAccessToken: string | null;
  try {
    ownerAccessToken = await resolveAccessToken(mentionAuthorUserId, mentionAuthorHandle);
  } catch {
    return null;
  }

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
  readState: MentionSyncReadState,
  config: MentionCollectorConfig,
  accessToken: string,
  mentionSummary: ThreadsNode,
  resolveRepliesAccessToken: ThreadsAccessTokenResolver
): Promise<MentionPreparationResult> {
  const mentionId = readNestedString(mentionSummary, ["id"]);
  if (!mentionId) {
    return { kind: "invalid" };
  }

  const mentionDetail = await fetchThreadNode(config, accessToken, mentionId, true).catch(() => null);
  const mentionNode = mentionDetail ?? mentionSummary;
  const mentionUrl = buildThreadPermalink(mentionNode) || buildThreadPermalink(mentionSummary);
  const mentionAuthorHandle = extractThreadHandle(mentionNode) || extractThreadHandle(mentionSummary);
  const mentionAuthorUserId = extractThreadUserId(mentionNode) || extractThreadUserId(mentionSummary);
  if (!mentionUrl || !mentionAuthorHandle) {
    return { kind: "invalid" };
  }

  if (!hasMatchedUser(readState, mentionAuthorUserId, mentionAuthorHandle)) {
    return { kind: "unmatched" };
  }

  const relatedThreadId = extractRelatedThreadId(mentionNode);
  const relatedThreadNode = await hydrateRelatedThreadNode(
    config,
    accessToken,
    extractRelatedThreadNode(mentionNode)
  );
  const replyResolvedTarget =
    relatedThreadNode ??
    (relatedThreadId ? await fetchThreadNode(config, accessToken, relatedThreadId, false) : null) ??
    (await resolveTargetFromRepliesFeed(
      config,
      resolveRepliesAccessToken,
      mentionId,
      mentionUrl,
      mentionAuthorUserId,
      mentionAuthorHandle
    ));
  const targetNode = replyResolvedTarget ?? mentionDetail ?? mentionSummary;

  const unresolvedTargetUrl = buildThreadPermalink(targetNode) || mentionUrl;
  const mentionText = safeText(extractThreadText(mentionNode) || extractThreadText(mentionSummary) || "");
  const extractedTargetPost = await resolveExtractedTargetPost(unresolvedTargetUrl, mentionUrl, mentionText);
  const targetUrl = safeText(extractedTargetPost?.canonicalUrl) || unresolvedTargetUrl;
  const targetText =
    safeText(extractedTargetPost?.text) ||
    safeText(extractThreadText(targetNode) || "") ||
    buildFallbackTargetText(targetNode);
  const targetIsSeparate = targetUrl !== mentionUrl || targetText !== mentionText;

  return {
    kind: "payload",
    payload: {
      mentionId,
      mentionUrl,
      mentionAuthorUserId,
      mentionAuthorHandle,
      mentionAuthorDisplayName: extractThreadDisplayName(mentionNode) || extractThreadDisplayName(mentionSummary),
      noteText: targetIsSeparate ? mentionText || null : null,
      targetUrl,
      targetAuthorHandle: safeText(extractedTargetPost?.author) || extractThreadHandle(targetNode),
      targetAuthorDisplayName: extractThreadDisplayName(targetNode),
      targetText,
      targetPublishedAt: safeText(extractedTargetPost?.publishedAt) || extractThreadTimestamp(targetNode),
      mediaUrls: extractedTargetPost ? summarizeExtractedPostPreviewMediaUrls(extractedTargetPost) : extractMediaUrls(targetNode),
      extractedPost: extractedTargetPost,
      rawPayload: {
        mention: mentionNode,
        target: targetNode,
        extractedPost: extractedTargetPost
      }
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

async function resolveStoredAccessToken(
  rawThreadsUserId: string | null | undefined,
  rawHandle: string | null | undefined
): Promise<string | null> {
  const user =
    (rawThreadsUserId ? await findBotUserByThreadsUserId(rawThreadsUserId) : null) ??
    (rawHandle ? await findBotUserByHandle(rawHandle) : null);
  if (!user) {
    return null;
  }

  return getFreshAccessTokenForUserRecord(user, async (nextUser) => {
    await saveBotUserRecord(nextUser);
  });
}

async function ingestMentionPayload(
  payload: BotIngestPayload,
  runTransaction: DatabaseRunner
): Promise<BotIngestResult> {
  if (!useExternalizedMentionJobs()) {
    return runTransaction((data) => ingestBotMention(data, payload));
  }

  const user =
    (payload.mentionAuthorUserId ? await findBotUserByThreadsUserId(payload.mentionAuthorUserId) : null) ??
    (payload.mentionAuthorHandle ? await findBotUserByHandle(payload.mentionAuthorHandle) : null);
  const existingArchive =
    user && payload.mentionUrl
      ? await findBotArchiveByMention(user.id, payload.mentionId ?? null, safeText(payload.mentionUrl))
      : null;
  const resolvedAllowance = user
    ? await loadDatabase().then((database) => {
        const permission = canCreateScrapbookArchive(database, user, existingArchive);
        return {
          allowed: permission.allowed,
          reason: permission.allowed ? null : "limit_reached"
        };
      })
    : { allowed: true, reason: null };
  const materialized = materializeBotMentionArchive(user, existingArchive, payload, resolvedAllowance);
  if (materialized.archive) {
    await saveBotArchiveRecord(materialized.archive);
  }
  return materialized.result;
}

function mergeSummaries(mode: string, ...summaries: BotMentionSyncSummary[]): BotMentionSyncSummary {
  return summaries.reduce(
    (accumulator, summary) =>
      createSummary(mode, {
        ok: accumulator.ok && summary.ok,
        reason: accumulator.reason ?? summary.reason,
        fetchedPages: accumulator.fetchedPages + summary.fetchedPages,
        fetchedMentions: accumulator.fetchedMentions + summary.fetchedMentions,
        processedMentions: accumulator.processedMentions + summary.processedMentions,
        createdArchives: accumulator.createdArchives + summary.createdArchives,
        updatedArchives: accumulator.updatedArchives + summary.updatedArchives,
        unmatchedMentions: accumulator.unmatchedMentions + summary.unmatchedMentions,
        skippedExisting: accumulator.skippedExisting + summary.skippedExisting,
        skippedInvalid: accumulator.skippedInvalid + summary.skippedInvalid
      }),
    createSummary(mode, {})
  );
}

async function enqueueMentionSyncJobs(
  readState: MentionSyncReadState,
  config: MentionCollectorConfig,
  mode: string,
  accessToken: string,
  resolveRepliesAccessToken: ThreadsAccessTokenResolver,
  runTransaction: DatabaseRunner
): Promise<BotMentionSyncSummary> {
  const knownMentionIds = new Set(readState.knownMentionIds);
  const queuedMentions: ThreadsNode[] = [];
  const queuedMentionIds = new Set<string>();
  const normalizedBotHandle = normalizeHandle(config.botHandle);

  let fetchedPages = 0;
  let fetchedMentions = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;
  let afterCursor: string | null = null;

  const enqueueMentionSummary = (mentionSummary: ThreadsNode): void => {
    const mentionId = safeText(readNestedString(mentionSummary, ["id"]) || "");
    if (!mentionId) {
      skippedInvalid += 1;
      return;
    }

    if (queuedMentionIds.has(mentionId)) {
      return;
    }

    if (mode === "interval" && knownMentionIds.has(mentionId)) {
      skippedExisting += 1;
      return;
    }

    knownMentionIds.add(mentionId);
    queuedMentionIds.add(mentionId);
    queuedMentions.push(mentionSummary);
  };

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
      enqueueMentionSummary(mentionSummary);
    }

    afterCursor = pageResult.nextCursor;
    if (!afterCursor || pageResult.items.length === 0 || sawOnlyExisting) {
      break;
    }
  }

  if (normalizedBotHandle) {
    for (const activeUser of readState.activeUsers) {
      let ownerAccessToken: string | null;
      try {
        ownerAccessToken = await resolveRepliesAccessToken(activeUser.threadsUserId, activeUser.threadsHandle);
      } catch {
        continue;
      }

      if (!ownerAccessToken) {
        continue;
      }

      let repliesCursor: string | null = null;
      for (let page = 0; page < config.maxPages; page += 1) {
        let replyPage: { items: ThreadsNode[]; nextCursor: string | null };
        try {
          replyPage = await fetchRepliesPage(config, ownerAccessToken, repliesCursor);
        } catch {
          break;
        }

        fetchedPages += 1;
        fetchedMentions += replyPage.items.length;
        for (const replySummary of replyPage.items) {
          const mentionText = safeText(extractThreadText(replySummary) || "").toLowerCase();
          if (!mentionText.includes(`@${normalizedBotHandle}`)) {
            continue;
          }
          enqueueMentionSummary(replySummary);
        }

        repliesCursor = replyPage.nextCursor;
        if (!repliesCursor || replyPage.items.length === 0) {
          break;
        }
      }
    }
  }

  if (queuedMentions.length > 0) {
    const now = new Date().toISOString();
    if (useExternalizedMentionJobs()) {
      const jobs = queuedMentions
        .map((mentionSummary) => buildMentionJobRecord(mentionSummary, now))
        .filter((job): job is BotMentionJobRecord => Boolean(job));
      skippedInvalid += queuedMentions.length - jobs.length;
      await enqueueStoredBotMentionJobs(jobs, {
        forceRequeue: mode !== "interval"
      });
      await pruneBotMentionJobs(new Date(Date.now() - DEFAULT_JOB_RETENTION_MS).toISOString());
    } else {
      const enqueueResult = await runTransaction((data) =>
        enqueueMentionJobs(data, queuedMentions, now, mode !== "interval")
      );
      skippedInvalid += enqueueResult.invalid;
    }
  }

  return createSummary(mode, {
    fetchedPages,
    fetchedMentions,
    skippedExisting,
    skippedInvalid
  });
}

async function processMentionJob(
  job: BotMentionJobRecord,
  readState: MentionSyncReadState,
  config: MentionCollectorConfig,
  accessToken: string,
  resolveRepliesAccessToken: ThreadsAccessTokenResolver,
  runTransaction: DatabaseRunner
): Promise<MentionProcessResult> {
  const mentionSummary = parseMentionSummaryJobPayload(job);
  if (!mentionSummary) {
    return { kind: "invalid" };
  }

  try {
    const prepared = await buildIngestPayload(
      readState,
      config,
      accessToken,
      mentionSummary,
      resolveRepliesAccessToken
    );
    if (prepared.kind === "invalid") {
      return { kind: "invalid" };
    }
    if (prepared.kind === "unmatched") {
      return { kind: "unmatched" };
    }

    const ingest = await ingestMentionPayload(prepared.payload, runTransaction);
    return {
      kind: "ingested",
      ingest
    };
  } catch (error) {
    return {
      kind: "failed",
      error
    };
  }
}

async function drainMentionSyncJobs(
  config: MentionCollectorConfig,
  mode: string,
  options: {
    loadReadState: () => Promise<MentionSyncReadState>;
    processingConcurrency: number;
    resolveRepliesAccessToken: ThreadsAccessTokenResolver;
    runTransaction: DatabaseRunner;
    resolveCollectorAccessToken: () => Promise<string | null>;
    jobBatchSize: number;
    jobLeaseMs: number;
  }
): Promise<BotMentionSyncSummary> {
  if (!config.botHandle) {
    return createSummary(mode, {
      ok: false,
      reason: "bot_handle_missing"
    });
  }

  const accessToken = await options.resolveCollectorAccessToken();
  if (!accessToken) {
    return createSummary(mode, {
      ok: false,
      reason: "access_token_missing"
    });
  }

  const preferNewestJobs = mode === "manual" || mode === "test" || mode === "user_sync";
  const summary = createSummary(mode, {});

  while (true) {
    const claimedJobs = useExternalizedMentionJobs()
      ? await claimStoredBotMentionJobs(
          new Date().toISOString(),
          options.jobBatchSize,
          options.jobLeaseMs,
          undefined,
          { order: preferNewestJobs ? "newest" : "oldest" }
        )
      : await options.runTransaction((data) =>
          claimMentionJobs(
            data,
            new Date().toISOString(),
            options.jobBatchSize,
            options.jobLeaseMs,
            { order: preferNewestJobs ? "newest" : "oldest" }
          )
        );
    if (claimedJobs.length === 0) {
      break;
    }

    const readState = await options.loadReadState();
    const results = await mapWithConcurrency(
      claimedJobs,
      options.processingConcurrency,
      async (job): Promise<MentionProcessResult> =>
        processMentionJob(
          job,
          readState,
          config,
          accessToken,
          options.resolveRepliesAccessToken,
          options.runTransaction
        )
    );

    for (let index = 0; index < claimedJobs.length; index += 1) {
      const job = claimedJobs[index] as BotMentionJobRecord;
      const result = results[index] as MentionProcessResult;

      if (result.kind === "invalid") {
        summary.skippedInvalid += 1;
        if (useExternalizedMentionJobs()) {
          await finalizeStoredBotMentionJob(job.mentionId, {
            status: "invalid",
            lastError: null,
            availableAt: new Date().toISOString(),
            leasedAt: null,
            processedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          await options.runTransaction((data) => {
            completeMentionJob(data, job.mentionId, {
              now: new Date().toISOString(),
              status: "invalid"
            });
          });
        }
        continue;
      }

      summary.processedMentions += 1;

      if (result.kind === "failed") {
        summary.ok = false;
        summary.reason = summary.reason ?? toCollectorStatusError(result.error);
        const now = new Date().toISOString();
        if (useExternalizedMentionJobs()) {
          await finalizeStoredBotMentionJob(job.mentionId, {
            status: "failed",
            lastError: toCollectorStatusError(result.error),
            availableAt: new Date(safeTime(now) + retryDelayMs(job.attempts)).toISOString(),
            leasedAt: null,
            processedAt: null,
            updatedAt: now
          });
        } else {
          await options.runTransaction((data) => {
            completeMentionJob(data, job.mentionId, {
              now,
              status: "failed",
              lastError: toCollectorStatusError(result.error),
              attempts: job.attempts
            });
          });
        }
        continue;
      }

      if (result.kind === "unmatched") {
        summary.unmatchedMentions += 1;
        if (useExternalizedMentionJobs()) {
          await finalizeStoredBotMentionJob(job.mentionId, {
            status: "unmatched",
            lastError: null,
            availableAt: new Date().toISOString(),
            leasedAt: null,
            processedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          await options.runTransaction((data) => {
            completeMentionJob(data, job.mentionId, {
              now: new Date().toISOString(),
              status: "unmatched"
            });
          });
        }
        continue;
      }

      if (!result.ingest.matched) {
        summary.unmatchedMentions += 1;
        if (useExternalizedMentionJobs()) {
          await finalizeStoredBotMentionJob(job.mentionId, {
            status: "unmatched",
            lastError: null,
            availableAt: new Date().toISOString(),
            leasedAt: null,
            processedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          await options.runTransaction((data) => {
            completeMentionJob(data, job.mentionId, {
              now: new Date().toISOString(),
              status: "unmatched"
            });
          });
        }
        continue;
      }

      if (result.ingest.created) {
        summary.createdArchives += 1;
      } else {
        summary.updatedArchives += 1;
      }

      if (useExternalizedMentionJobs()) {
        await finalizeStoredBotMentionJob(job.mentionId, {
          status: "completed",
          lastError: null,
          availableAt: new Date().toISOString(),
          leasedAt: null,
          processedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await options.runTransaction((data) => {
          completeMentionJob(data, job.mentionId, {
            now: new Date().toISOString(),
            status: "completed"
          });
        });
      }
    }
  }

  return summary;
}

export function createBotMentionCollector(deps: {
  runTransaction: DatabaseRunner;
  loadDatabase?: DatabaseLoader;
  logger?: LoggerLike;
}): BotMentionCollector {
  let config = readCollectorConfig();
  const logger = deps.logger ?? console;
  const status = createInitialStatus(config);
  const loadBaseDatabaseSnapshot =
    deps.loadDatabase ??
    (() => deps.runTransaction((data) => structuredClone(data) as WebDatabase));
  const loadDatabaseSnapshot = async (): Promise<WebDatabase> => {
    const database = await loadBaseDatabaseSnapshot();
    if (useExternalizedMentionJobs()) {
      database.botMentionJobs = await loadBotMentionJobs();
    }
    return database;
  };
  const loadReadState = async (): Promise<MentionSyncReadState> => {
    if (useExternalizedMentionJobs()) {
      return buildMentionSyncReadState(await loadBotMentionReadState());
    }
    return createMentionSyncReadState(await loadDatabaseSnapshot());
  };

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let workerTimer: ReturnType<typeof setInterval> | null = null;
  let pollInFlight: Promise<BotMentionSyncSummary> | null = null;
  let drainInFlight: Promise<BotMentionSyncSummary> | null = null;
  let syncInFlight: Promise<BotMentionSyncSummary> | null = null;
  let started = false;
  const workerIntervalMs = readWorkerIntervalMs();
  const jobBatchSize = readJobBatchSize();
  const jobLeaseMs = readJobLeaseMs();

  const resolveCollectorToken = async (): Promise<string | null> => {
    if (config.accessTokenOverride.trim()) {
      return config.accessTokenOverride;
    }

    if (useExternalizedMentionJobs()) {
      return resolveStoredAccessToken(null, config.botHandle);
    }

    return deps.runTransaction((data) => resolveCollectorAccessToken(config, data));
  };

  const resolveRepliesAccessToken: ThreadsAccessTokenResolver = (rawThreadsUserId, rawHandle) =>
    useExternalizedMentionJobs()
      ? resolveStoredAccessToken(rawThreadsUserId, rawHandle)
      : deps.runTransaction(async (data) => {
      const tokenByUserId = rawThreadsUserId
        ? await getBotAccessTokenForThreadsUserId(data, rawThreadsUserId)
        : null;
      if (tokenByUserId) {
        return tokenByUserId;
      }

      return rawHandle ? getBotAccessTokenForHandle(data, rawHandle) : null;
    });

  const applyStatusConfig = (): void => {
    status.enabled = Boolean(config.botHandle) && config.intervalMs > 0;
    status.botHandle = config.botHandle;
    status.pollIntervalMs = config.intervalMs;
    status.fetchLimit = config.fetchLimit;
    status.maxPages = config.maxPages;
  };

  const updateRunningState = (): void => {
    status.running = Boolean(syncInFlight || pollInFlight || drainInFlight);
  };

  const commitSummary = (summary: BotMentionSyncSummary): BotMentionSyncSummary => {
    status.lastSummary = summary;
    status.lastCompletedAt = new Date().toISOString();
    if (summary.ok) {
      status.lastSucceededAt = status.lastCompletedAt;
      status.lastError = null;
    } else {
      status.lastError = summary.reason;
    }
    return summary;
  };

  const commitUnexpectedError = (error: unknown): never => {
    status.lastCompletedAt = new Date().toISOString();
    status.lastError = toCollectorStatusError(error);
    throw error;
  };

  const enqueueNow = async (mode: string): Promise<BotMentionSyncSummary> => {
    if (!config.botHandle) {
      return createSummary(mode, {
        ok: false,
        reason: "bot_handle_missing"
      });
    }

    const accessToken = await resolveCollectorToken();
    if (!accessToken) {
      return createSummary(mode, {
        ok: false,
        reason: "access_token_missing"
      });
    }

    const readState = await loadReadState();
    return enqueueMentionSyncJobs(
      readState,
      config,
      mode,
      accessToken,
      createCachedAccessTokenResolver(resolveRepliesAccessToken),
      deps.runTransaction
    );
  };

  const drainNow = async (mode: string): Promise<BotMentionSyncSummary> =>
    drainMentionSyncJobs(config, mode, {
      loadReadState,
      processingConcurrency: readProcessingConcurrency(),
      resolveRepliesAccessToken: createCachedAccessTokenResolver(resolveRepliesAccessToken),
      runTransaction: deps.runTransaction,
      resolveCollectorAccessToken: resolveCollectorToken,
      jobBatchSize,
      jobLeaseMs
    });

  const schedulePollTimer = (): void => {
    if (!started || !status.enabled || pollTimer) {
      return;
    }

    pollTimer = setInterval(() => {
      if (syncInFlight) {
        return;
      }

      void runPollCycle("interval").catch((error) => {
        logger.error("[threads-bot] mention sync failed:", error);
      });
    }, config.intervalMs);
  };

  const scheduleWorkerTimer = (): void => {
    if (!started || !status.enabled || workerTimer) {
      return;
    }

    workerTimer = setInterval(() => {
      if (syncInFlight) {
        return;
      }

      void runDrainCycle("worker").catch((error) => {
        logger.error("[threads-bot] mention worker failed:", error);
      });
    }, workerIntervalMs);
  };

  const restartTimers = (): void => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (workerTimer) {
      clearInterval(workerTimer);
      workerTimer = null;
    }

    schedulePollTimer();
    scheduleWorkerTimer();
  };

  const runPollCycle = async (mode: string): Promise<BotMentionSyncSummary> => {
    if (pollInFlight) {
      return pollInFlight;
    }

    status.lastStartedAt = new Date().toISOString();
    status.lastError = null;
    updateRunningState();

    pollInFlight = enqueueNow(mode)
      .then((summary) => {
        commitSummary(summary);
        return summary;
      })
      .catch(commitUnexpectedError)
      .finally(() => {
        pollInFlight = null;
        updateRunningState();
        if (started && status.enabled && !syncInFlight) {
          void runDrainCycle(`${mode}_drain`).catch((error) => {
            logger.error("[threads-bot] mention drain failed:", error);
          });
        }
      });

    updateRunningState();
    return pollInFlight;
  };

  const runDrainCycle = async (mode: string): Promise<BotMentionSyncSummary> => {
    if (drainInFlight) {
      return drainInFlight;
    }

    status.lastStartedAt = new Date().toISOString();
    status.lastError = null;
    updateRunningState();

    drainInFlight = drainNow(mode)
      .then((summary) => {
        if (summary.processedMentions > 0 || summary.skippedInvalid > 0 || !summary.ok) {
          commitSummary(summary);
        }
        return summary;
      })
      .catch(commitUnexpectedError)
      .finally(() => {
        drainInFlight = null;
        updateRunningState();
      });

    updateRunningState();
    return drainInFlight;
  };

  const runSync = async (mode = "manual"): Promise<BotMentionSyncSummary> => {
    if (syncInFlight) {
      return syncInFlight;
    }

    const prioritizeFreshSync = mode === "manual" || mode === "test" || mode === "user_sync";
    status.lastStartedAt = new Date().toISOString();
    status.lastError = null;
    updateRunningState();

    syncInFlight = (async () => {
      const enqueueSummary = prioritizeFreshSync || !pollInFlight ? await enqueueNow(mode) : await pollInFlight;
      const priorDrainSummary = prioritizeFreshSync || !drainInFlight ? createSummary(mode, {}) : await drainInFlight;
      const drainSummary = await drainNow(mode);
      return commitSummary(mergeSummaries(mode, enqueueSummary, priorDrainSummary, drainSummary));
    })()
      .catch(commitUnexpectedError)
      .finally(() => {
        syncInFlight = null;
        updateRunningState();
      });

    updateRunningState();
    return syncInFlight;
  };

  return {
    start() {
      started = true;
      applyStatusConfig();
      if (!status.enabled) {
        return;
      }

      void runPollCycle("startup").catch((error) => {
        logger.error("[threads-bot] initial mention sync failed:", error);
      });
      schedulePollTimer();
      scheduleWorkerTimer();
    },

    async stop() {
      started = false;
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (workerTimer) {
        clearInterval(workerTimer);
        workerTimer = null;
      }

      const inFlight = [syncInFlight, pollInFlight, drainInFlight].filter(
        (value): value is Promise<BotMentionSyncSummary> => Boolean(value)
      );
      if (inFlight.length > 0) {
        await Promise.allSettled(inFlight);
      }
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
      restartTimers();
      if (started && status.enabled) {
        void runPollCycle("config_reload").catch((error) => {
          logger.error("[threads-bot] collector reload sync failed:", error);
        });
      }
      return {
        ...status
      };
    }
  };
}
