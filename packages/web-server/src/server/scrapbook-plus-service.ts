import { createHash } from "node:crypto";

import type { ExtractedPost, SourceType } from "@threads/shared/types";
import type {
  BotArchiveRecord,
  BotUserRecord,
  InsightsSnapshotRecord,
  SearchMonitorRecord,
  SearchResultRecord,
  TrackedPostRecord,
  WatchlistRecord,
  WebDatabase
} from "@threads/web-schema";
import {
  getBotRequiredScopes,
  getBotScopeVersion,
  withBotSessionDatabaseTransaction,
  getBotSessionUserRecord,
  getBotSessionAuthContext
} from "./bot-service";
import {
  collectPostMediaUrls,
  getPostInsights,
  getProfileInsights,
  listOwnPosts,
  listPublicProfilePosts,
  lookupPublicProfile,
  searchKeywordPosts,
  type ThreadsApiPost,
  type ThreadsPublicProfile
} from "./threads-client";
import {
  upsertBotArchive,
  upsertInsightsSnapshot,
  upsertSearchMonitor,
  upsertSearchResult,
  upsertTrackedPost,
  upsertWatchlist
} from "./store";
import {
  activateScrapbookPlus as activateScrapbookPlan,
  canCreateScrapbookArchive,
  clearScrapbookPlus as clearScrapbookPlan,
  getScrapbookArchiveLimitError,
  type ScrapbookPlanState,
  readScrapbookPlanState
} from "./scrapbook-plan-service";

export interface ScrapbookMetricValue {
  value: number | null;
  delta: number | null;
}

export interface ScrapbookTrackedPostView {
  id: string;
  externalPostId: string;
  canonicalUrl: string;
  authorHandle: string;
  authorDisplayName: string | null;
  text: string;
  publishedAt: string | null;
  mediaType: string | null;
  mediaUrls: string[];
  matchedTerms: string[];
  relevanceScore: number | null;
  archived: boolean;
  archiveId: string | null;
  discoveredAt: string;
}

export interface ScrapbookWatchlistView {
  id: string;
  targetHandle: string;
  targetDisplayName: string | null;
  targetProfilePictureUrl: string | null;
  includeText: string;
  excludeText: string;
  mediaTypes: string[];
  autoArchive: boolean;
  digestCadence: "off" | "daily" | "weekly";
  lastSyncedAt: string | null;
  lastError: string | null;
  status: "active" | "paused";
  resultCount: number;
  results: ScrapbookTrackedPostView[];
}

export interface ScrapbookSearchResultView {
  id: string;
  externalPostId: string;
  canonicalUrl: string;
  authorHandle: string;
  authorDisplayName: string | null;
  text: string;
  publishedAt: string | null;
  mediaType: string | null;
  mediaUrls: string[];
  matchedTerms: string[];
  relevanceScore: number | null;
  archiveId: string | null;
  discoveredAt: string;
  status: "new" | "archived" | "dismissed";
}

export interface ScrapbookSearchView {
  id: string;
  query: string;
  authorHandle: string | null;
  excludeHandles: string[];
  autoArchive: boolean;
  searchType: "top" | "recent";
  lastRunAt: string | null;
  lastError: string | null;
  status: "active" | "paused";
  resultCount: number;
  results: ScrapbookSearchResultView[];
}

export interface ScrapbookInsightsPostView {
  externalPostId: string;
  canonicalUrl: string;
  title: string;
  text: string;
  publishedAt: string | null;
  metrics: {
    views: ScrapbookMetricValue;
    likes: ScrapbookMetricValue;
    replies: ScrapbookMetricValue;
    reposts: ScrapbookMetricValue;
    quotes: ScrapbookMetricValue;
  };
  archived: boolean;
  archiveId: string | null;
  capturedAt: string | null;
}

export interface ScrapbookInsightsView {
  ready: boolean;
  refreshedAt: string | null;
  overview: {
    followers: ScrapbookMetricValue;
    profileViews: ScrapbookMetricValue;
    views: ScrapbookMetricValue;
    likes: ScrapbookMetricValue;
    replies: ScrapbookMetricValue;
    reposts: ScrapbookMetricValue;
    quotes: ScrapbookMetricValue;
  };
  posts: ScrapbookInsightsPostView[];
}

function toOperationalStatusError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    if (/unauthorized|forbidden|expired|401|403/i.test(error.message)) {
      return "Reconnect Threads to restore this feature.";
    }
    if (/rate.?limit|429/i.test(error.message)) {
      return "Threads API rate limit reached. Try again later.";
    }
    if (/network|fetch|timeout|econn|socket/i.test(error.message)) {
      return "Threads API is temporarily unavailable.";
    }
  }

  return fallback;
}

export interface ScrapbookScopeState {
  requiredScopes: string[];
  grantedScopes: string[];
  missingScopes: string[];
  scopeVersion: number;
  requiredScopeVersion: number;
  needsReconnect: boolean;
}

export interface ScrapbookPlusState {
  authenticated: boolean;
  plan: ScrapbookPlanState;
  scopes: ScrapbookScopeState;
  watchlists: ScrapbookWatchlistView[];
  searches: ScrapbookSearchView[];
  insights: ScrapbookInsightsView;
}

interface UpsertArchiveFromPostResult {
  archive: BotArchiveRecord | null;
  plan: ScrapbookPlanState;
}

export interface CreateWatchlistInput {
  targetHandle: string;
  includeText?: string | null;
  excludeText?: string | null;
  mediaTypes?: string[] | null;
  autoArchive?: boolean | null;
  digestCadence?: "off" | "daily" | "weekly" | null;
}

export interface CreateSearchMonitorInput {
  query: string;
  authorHandle?: string | null;
  excludeHandles?: string[] | null;
  autoArchive?: boolean | null;
  searchType?: "top" | "recent" | null;
}

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHandle(value: string | null | undefined): string {
  return safeText(value).replace(/^@+/, "").toLowerCase();
}

function parseCsvHandles(value: string | null | undefined): string[] {
  return [...new Set(safeText(value).split(",").map((part) => normalizeHandle(part)).filter(Boolean))];
}

function titleFromText(text: string, fallback: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return fallback;
  }

  const excerpt = Array.from(normalized).slice(0, 80).join("").trim();
  return excerpt || fallback;
}

function normalizeMediaType(post: ThreadsApiPost): string {
  const mediaType = safeText(post.media_type).toUpperCase();
  if (mediaType.includes("VIDEO")) {
    return "VIDEO";
  }
  if (mediaType.includes("IMAGE")) {
    return "IMAGE";
  }
  if (mediaType.includes("CAROUSEL")) {
    return "CAROUSEL";
  }
  return "TEXT";
}

function createScopeState(user: BotUserRecord | null): ScrapbookScopeState {
  const requiredScopes = getBotRequiredScopes();
  const grantedScopes = user ? [...user.grantedScopes] : [];
  const missingScopes = requiredScopes.filter((scope) => !grantedScopes.includes(scope));
  const requiredScopeVersion = getBotScopeVersion();
  const scopeVersion = user?.scopeVersion ?? 0;

  return {
    requiredScopes,
    grantedScopes,
    missingScopes,
    scopeVersion,
    requiredScopeVersion,
    needsReconnect: !user || missingScopes.length > 0 || scopeVersion < requiredScopeVersion
  };
}

async function requireAdvancedContext(data: WebDatabase, rawSession: string | null | undefined) {
  const context = await getBotSessionAuthContext(data, rawSession);
  const scopes = createScopeState(context.user);
  if (scopes.needsReconnect) {
    throw new Error("Reconnect with Threads to grant profile discovery, keyword search, and insights permissions.");
  }

  return context;
}

function getLatestWatchlistResults(data: WebDatabase, userId: string, watchlistId: string): TrackedPostRecord[] {
  return data.trackedPosts
    .filter((candidate) => candidate.userId === userId && candidate.origin === "watchlist" && candidate.sourceId === watchlistId)
    .sort((left, right) => Date.parse(right.discoveredAt) - Date.parse(left.discoveredAt));
}

function getLatestSearchResults(data: WebDatabase, userId: string, monitorId: string): SearchResultRecord[] {
  return data.searchResults
    .filter((candidate) => candidate.userId === userId && candidate.monitorId === monitorId)
    .sort((left, right) => Date.parse(right.discoveredAt) - Date.parse(left.discoveredAt));
}

function toTrackedPostView(record: TrackedPostRecord): ScrapbookTrackedPostView {
  return {
    id: record.id,
    externalPostId: record.externalPostId,
    canonicalUrl: record.canonicalUrl,
    authorHandle: record.authorHandle,
    authorDisplayName: record.authorDisplayName,
    text: record.text,
    publishedAt: record.publishedAt,
    mediaType: record.mediaType,
    mediaUrls: [...record.mediaUrls],
    matchedTerms: [...record.matchedTerms],
    relevanceScore: record.relevanceScore,
    archived: Boolean(record.archiveId),
    archiveId: record.archiveId,
    discoveredAt: record.discoveredAt
  };
}

function toSearchResultView(record: SearchResultRecord): ScrapbookSearchResultView {
  return {
    id: record.id,
    externalPostId: record.externalPostId,
    canonicalUrl: record.canonicalUrl,
    authorHandle: record.authorHandle,
    authorDisplayName: record.authorDisplayName,
    text: record.text,
    publishedAt: record.publishedAt,
    mediaType: record.mediaType,
    mediaUrls: [...record.mediaUrls],
    matchedTerms: [...record.matchedTerms],
    relevanceScore: record.relevanceScore,
    archiveId: record.archiveId,
    discoveredAt: record.discoveredAt,
    status: record.status
  };
}

function metricValue(current: number | null, previous: number | null): ScrapbookMetricValue {
  return {
    value: current,
    delta:
      typeof current === "number" && typeof previous === "number" && Number.isFinite(current) && Number.isFinite(previous)
        ? current - previous
        : null
  };
}

function getInsightMetricSnapshotMap(data: WebDatabase, userId: string) {
  const profileSnapshots = data.insightsSnapshots
    .filter((candidate) => candidate.userId === userId && candidate.kind === "profile")
    .sort((left, right) => Date.parse(right.capturedAt) - Date.parse(left.capturedAt));
  const latestProfile = profileSnapshots[0] ?? null;
  const previousProfile = profileSnapshots[1] ?? null;

  const postSnapshotGroups = new Map<string, InsightsSnapshotRecord[]>();
  for (const snapshot of data.insightsSnapshots
    .filter((candidate) => candidate.userId === userId && candidate.kind === "post" && candidate.externalPostId)
    .sort((left, right) => Date.parse(right.capturedAt) - Date.parse(left.capturedAt))) {
    const key = snapshot.externalPostId as string;
    const group = postSnapshotGroups.get(key) ?? [];
    group.push(snapshot);
    postSnapshotGroups.set(key, group);
  }

  return {
    latestProfile,
    previousProfile,
    postSnapshotGroups
  };
}

function findExistingWatchlistPost(
  data: WebDatabase,
  userId: string,
  watchlistId: string,
  externalPostId: string
): TrackedPostRecord | null {
  return (
    data.trackedPosts.find(
      (candidate) =>
        candidate.userId === userId &&
        candidate.origin === "watchlist" &&
        candidate.sourceId === watchlistId &&
        candidate.externalPostId === externalPostId
    ) ?? null
  );
}

function findExistingInsightPost(data: WebDatabase, userId: string, externalPostId: string): TrackedPostRecord | null {
  return (
    data.trackedPosts.find(
      (candidate) =>
        candidate.userId === userId &&
        candidate.origin === "insight" &&
        candidate.externalPostId === externalPostId
    ) ?? null
  );
}

function ensureTrackedPostBelongsToUser(data: WebDatabase, userId: string, trackedPostId: string): TrackedPostRecord {
  const tracked = data.trackedPosts.find((candidate) => candidate.id === trackedPostId && candidate.userId === userId);
  if (!tracked) {
    throw new Error("The requested tracked post could not be found.");
  }

  return tracked;
}

function matchesWatchlist(post: ThreadsApiPost, watchlist: WatchlistRecord): boolean {
  const haystack = `${post.text}\n${post.permalink}`.toLowerCase();
  const includeTokens = safeText(watchlist.includeText)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const excludeTokens = safeText(watchlist.excludeText)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (includeTokens.length > 0 && !includeTokens.every((token) => haystack.includes(token))) {
    return false;
  }
  if (excludeTokens.some((token) => haystack.includes(token))) {
    return false;
  }
  if (watchlist.mediaTypes.length > 0 && !watchlist.mediaTypes.includes(normalizeMediaType(post))) {
    return false;
  }

  return true;
}

function buildMatchedTerms(query: string, text: string): string[] {
  const haystack = text.toLowerCase();
  return [...new Set(query.toLowerCase().split(/\s+/).filter((token) => token.length > 1 && haystack.includes(token)))];
}

function buildRelevanceScore(query: string, text: string): number {
  const matched = buildMatchedTerms(query, text);
  return matched.length;
}

function buildExtractedPost(post: {
  canonicalUrl: string;
  authorHandle: string;
  text: string;
  publishedAt: string | null;
  mediaType: string | null;
  mediaUrls: string[];
}): ExtractedPost {
  const normalizedMediaType = safeText(post.mediaType).toUpperCase();
  const sourceType: SourceType = normalizedMediaType === "VIDEO" ? "video" : normalizedMediaType === "IMAGE" || normalizedMediaType === "CAROUSEL" ? "image" : "text";
  const imageUrls = sourceType === "image" ? [...post.mediaUrls] : [];
  const videoUrl = sourceType === "video" ? post.mediaUrls[0] ?? null : null;
  const thumbnailUrl = sourceType === "video" ? post.mediaUrls[1] ?? null : null;
  const shortcodeMatch = post.canonicalUrl.match(/\/post\/([^/?#]+)/i);

  return {
    canonicalUrl: post.canonicalUrl,
    shortcode: shortcodeMatch?.[1] ?? createHash("sha1").update(post.canonicalUrl).digest("hex").slice(0, 12),
    author: post.authorHandle,
    title: titleFromText(post.text, `@${post.authorHandle}`),
    text: post.text,
    publishedAt: post.publishedAt,
    capturedAt: new Date().toISOString(),
    sourceType,
    imageUrls,
    videoUrl,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl,
    authorReplies: [],
    extractorVersion: "threads-api-v1",
    contentHash: createHash("sha1").update(`${post.canonicalUrl}\n${post.text}\n${post.mediaUrls.join("\n")}`).digest("hex")
  };
}

function archiveLabel(sourceKind: "watchlist" | "search" | "insight", label: string): string {
  if (sourceKind === "watchlist") {
    return `watchlist:${label}`;
  }
  if (sourceKind === "search") {
    return `search:${label}`;
  }
  return `insight:${label}`;
}

function upsertArchiveFromPost(
  data: WebDatabase,
  user: BotUserRecord,
  sourceKind: "watchlist" | "search" | "insight",
  sourceLabel: string,
  item: {
    canonicalUrl: string;
    authorHandle: string;
    authorDisplayName: string | null;
    text: string;
    publishedAt: string | null;
    mediaType: string | null;
    mediaUrls: string[];
    metadata: Record<string, unknown>;
  }
): UpsertArchiveFromPostResult {
  const now = new Date().toISOString();
  const existing = data.botArchives.find(
    (candidate) => candidate.userId === user.id && candidate.targetUrl === item.canonicalUrl
  );
  const creationPermission = canCreateScrapbookArchive(data, user, existing);
  if (!creationPermission.allowed) {
    return {
      archive: null,
      plan: creationPermission.plan
    };
  }

  const rawPayloadJson = JSON.stringify({
    sourceKind,
    sourceLabel,
    ...item.metadata,
    extractedPost: buildExtractedPost(item)
  });

  if (existing) {
    existing.noteText = archiveLabel(sourceKind, sourceLabel);
    existing.targetUrl = item.canonicalUrl;
    existing.targetAuthorHandle = item.authorHandle;
    existing.targetAuthorDisplayName = item.authorDisplayName;
    existing.targetText = item.text;
    existing.targetPublishedAt = item.publishedAt;
    existing.mediaUrls = [...item.mediaUrls];
    existing.rawPayloadJson = rawPayloadJson;
    existing.updatedAt = now;
    upsertBotArchive(data, existing);
    return {
      archive: existing,
      plan: creationPermission.plan
    };
  }

  const archive: BotArchiveRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    mentionId: null,
    mentionUrl: item.canonicalUrl,
    mentionAuthorHandle: item.authorHandle,
    mentionAuthorDisplayName: sourceLabel,
    noteText: archiveLabel(sourceKind, sourceLabel),
    targetUrl: item.canonicalUrl,
    targetAuthorHandle: item.authorHandle,
    targetAuthorDisplayName: item.authorDisplayName,
    targetText: item.text,
    targetPublishedAt: item.publishedAt,
    mediaUrls: [...item.mediaUrls],
    markdownContent: item.text,
    rawPayloadJson,
    archivedAt: now,
    updatedAt: now,
    status: "saved"
  };
  upsertBotArchive(data, archive);
  return {
    archive,
    plan: creationPermission.plan
  };
}

function ensureWatchlistBelongsToUser(data: WebDatabase, userId: string, watchlistId: string): WatchlistRecord {
  const watchlist = data.watchlists.find((candidate) => candidate.id === watchlistId && candidate.userId === userId);
  if (!watchlist) {
    throw new Error("The requested watchlist could not be found.");
  }

  return watchlist;
}

function ensureSearchMonitorBelongsToUser(data: WebDatabase, userId: string, monitorId: string): SearchMonitorRecord {
  const monitor = data.searchMonitors.find((candidate) => candidate.id === monitorId && candidate.userId === userId);
  if (!monitor) {
    throw new Error("The requested search monitor could not be found.");
  }

  return monitor;
}

function ensureSearchResultBelongsToUser(data: WebDatabase, userId: string, resultId: string): SearchResultRecord {
  const result = data.searchResults.find((candidate) => candidate.id === resultId && candidate.userId === userId);
  if (!result) {
    throw new Error("The requested search result could not be found.");
  }

  return result;
}

function buildWatchlistView(data: WebDatabase, watchlist: WatchlistRecord): ScrapbookWatchlistView {
  const results = getLatestWatchlistResults(data, watchlist.userId, watchlist.id);
  return {
    id: watchlist.id,
    targetHandle: watchlist.targetHandle,
    targetDisplayName: watchlist.targetDisplayName,
    targetProfilePictureUrl: watchlist.targetProfilePictureUrl,
    includeText: watchlist.includeText,
    excludeText: watchlist.excludeText,
    mediaTypes: [...watchlist.mediaTypes],
    autoArchive: watchlist.autoArchive,
    digestCadence: watchlist.digestCadence,
    lastSyncedAt: watchlist.lastSyncedAt,
    lastError: watchlist.lastError,
    status: watchlist.status,
    resultCount: results.length,
    results: results.slice(0, 12).map(toTrackedPostView)
  };
}

function buildSearchMonitorView(data: WebDatabase, monitor: SearchMonitorRecord): ScrapbookSearchView {
  const results = getLatestSearchResults(data, monitor.userId, monitor.id);
  return {
    id: monitor.id,
    query: monitor.query,
    authorHandle: monitor.authorHandle,
    excludeHandles: [...monitor.excludeHandles],
    autoArchive: monitor.autoArchive,
    searchType: monitor.searchType,
    lastRunAt: monitor.lastRunAt,
    lastError: monitor.lastError,
    status: monitor.status,
    resultCount: results.length,
    results: results.slice(0, 16).map(toSearchResultView)
  };
}

export function readScrapbookPlusState(
  data: WebDatabase,
  rawSession: string | null | undefined,
  userId: string | null = null
): ScrapbookPlusState {
  const user =
    userId
      ? data.botUsers.find((candidate) => candidate.id === userId && candidate.status === "active") ?? null
      : getBotSessionUserRecord(data, rawSession);
  const scopes = createScopeState(user);
  const plan = readScrapbookPlanState(data, user);
  if (!user) {
    return {
      authenticated: false,
      plan,
      scopes,
      watchlists: [],
      searches: [],
      insights: {
        ready: false,
        refreshedAt: null,
        overview: {
          followers: metricValue(null, null),
          profileViews: metricValue(null, null),
          views: metricValue(null, null),
          likes: metricValue(null, null),
          replies: metricValue(null, null),
          reposts: metricValue(null, null),
          quotes: metricValue(null, null)
        },
        posts: []
      }
    };
  }

  void rawSession;
  const watchlists = data.watchlists
    .filter((candidate) => candidate.userId === user.id)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .map((watchlist) => buildWatchlistView(data, watchlist));
  const searches = data.searchMonitors
    .filter((candidate) => candidate.userId === user.id)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .map((monitor) => buildSearchMonitorView(data, monitor));

  const { latestProfile, previousProfile, postSnapshotGroups } = getInsightMetricSnapshotMap(data, user.id);
  const insightPosts = data.trackedPosts
    .filter((candidate) => candidate.userId === user.id && candidate.origin === "insight")
    .sort((left, right) => Date.parse(right.discoveredAt) - Date.parse(left.discoveredAt))
    .slice(0, 8)
    .map((post) => {
      const snapshots = postSnapshotGroups.get(post.externalPostId) ?? [];
      const latest = snapshots[0] ?? null;
      const previous = snapshots[1] ?? null;
      return {
        externalPostId: post.externalPostId,
        canonicalUrl: post.canonicalUrl,
        title: titleFromText(post.text, `@${post.authorHandle}`),
        text: post.text,
        publishedAt: post.publishedAt,
        metrics: {
          views: metricValue(latest?.views ?? null, previous?.views ?? null),
          likes: metricValue(latest?.likes ?? null, previous?.likes ?? null),
          replies: metricValue(latest?.replies ?? null, previous?.replies ?? null),
          reposts: metricValue(latest?.reposts ?? null, previous?.reposts ?? null),
          quotes: metricValue(latest?.quotes ?? null, previous?.quotes ?? null)
        },
        archived: Boolean(post.archiveId),
        archiveId: post.archiveId,
        capturedAt: latest?.capturedAt ?? null
      } satisfies ScrapbookInsightsPostView;
    });

  return {
    authenticated: true,
    plan,
    scopes,
    watchlists,
    searches,
    insights: {
      ready: Boolean(latestProfile),
      refreshedAt: latestProfile?.capturedAt ?? null,
      overview: {
        followers: metricValue(latestProfile?.followers ?? null, previousProfile?.followers ?? null),
        profileViews: metricValue(latestProfile?.profileViews ?? null, previousProfile?.profileViews ?? null),
        views: metricValue(latestProfile?.views ?? null, previousProfile?.views ?? null),
        likes: metricValue(latestProfile?.likes ?? null, previousProfile?.likes ?? null),
        replies: metricValue(latestProfile?.replies ?? null, previousProfile?.replies ?? null),
        reposts: metricValue(latestProfile?.reposts ?? null, previousProfile?.reposts ?? null),
        quotes: metricValue(latestProfile?.quotes ?? null, previousProfile?.quotes ?? null)
      },
      posts: insightPosts
    }
  };
}

async function resolveStateForCurrentUser(data: WebDatabase, rawSession: string | null | undefined): Promise<ScrapbookPlusState> {
  return readScrapbookPlusState(data, rawSession);
}

export async function createWatchlist(
  data: WebDatabase,
  rawSession: string | null | undefined,
  input: CreateWatchlistInput
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  const targetHandle = normalizeHandle(input.targetHandle);
  if (!targetHandle) {
    throw new Error("Enter a Threads handle to watch.");
  }

  const now = new Date().toISOString();
  const existing = data.watchlists.find(
    (candidate) => candidate.userId === user.id && candidate.targetHandle === targetHandle
  );
  const watchlist: WatchlistRecord = existing ?? {
    id: crypto.randomUUID(),
    userId: user.id,
    targetHandle,
    targetThreadsUserId: null,
    targetDisplayName: null,
    targetProfilePictureUrl: null,
    includeText: "",
    excludeText: "",
    mediaTypes: [],
    autoArchive: false,
    digestCadence: "off",
    lastCursor: null,
    lastSyncedAt: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    status: "active"
  };

  watchlist.includeText = safeText(input.includeText);
  watchlist.excludeText = safeText(input.excludeText);
  watchlist.mediaTypes = [...new Set((input.mediaTypes ?? []).map((value) => safeText(value).toUpperCase()).filter(Boolean))];
  watchlist.autoArchive = input.autoArchive === true;
  watchlist.digestCadence = input.digestCadence ?? "off";
  watchlist.updatedAt = now;
  watchlist.status = "active";
  upsertWatchlist(data, watchlist);

  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function deleteWatchlist(
  data: WebDatabase,
  rawSession: string | null | undefined,
  watchlistId: string
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  ensureWatchlistBelongsToUser(data, user.id, watchlistId);
  data.watchlists = data.watchlists.filter((candidate) => !(candidate.userId === user.id && candidate.id === watchlistId));
  data.trackedPosts = data.trackedPosts.filter(
    (candidate) => !(candidate.userId === user.id && candidate.origin === "watchlist" && candidate.sourceId === watchlistId)
  );
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function syncWatchlist(
  data: WebDatabase,
  rawSession: string | null | undefined,
  watchlistId: string
): Promise<ScrapbookPlusState> {
  const { user, accessToken } = await requireAdvancedContext(data, rawSession);
  const watchlist = ensureWatchlistBelongsToUser(data, user.id, watchlistId);

  try {
    const profile = await lookupPublicProfile(accessToken, watchlist.targetHandle);
    const posts = await listPublicProfilePosts(accessToken, profile.id, 12, profile);
    const now = new Date().toISOString();

    watchlist.targetThreadsUserId = profile.id;
    watchlist.targetDisplayName = profile.name;
    watchlist.targetProfilePictureUrl = profile.threads_profile_picture_url;
    watchlist.lastError = null;
    watchlist.lastSyncedAt = now;
    watchlist.updatedAt = now;
    upsertWatchlist(data, watchlist);

    for (const post of posts.filter((candidate) => matchesWatchlist(candidate, watchlist))) {
      const existing = findExistingWatchlistPost(data, user.id, watchlist.id, post.id);
      const mediaUrls = collectPostMediaUrls(post);
      const tracked: TrackedPostRecord = existing ?? {
        id: crypto.randomUUID(),
        userId: user.id,
        origin: "watchlist",
        sourceId: watchlist.id,
        externalPostId: post.id,
        canonicalUrl: post.permalink,
        authorHandle: normalizeHandle(post.username),
        authorDisplayName: profile.name,
        text: post.text,
        publishedAt: post.timestamp,
        mediaType: normalizeMediaType(post),
        mediaUrls,
        matchedTerms: buildMatchedTerms(watchlist.includeText, post.text),
        relevanceScore: watchlist.includeText ? buildRelevanceScore(watchlist.includeText, post.text) : null,
        archiveId: null,
        archivedAt: null,
        discoveredAt: now,
        updatedAt: now,
        rawPayloadJson: JSON.stringify(post.raw)
      };

      tracked.canonicalUrl = post.permalink;
      tracked.authorHandle = normalizeHandle(post.username);
      tracked.authorDisplayName = profile.name;
      tracked.text = post.text;
      tracked.publishedAt = post.timestamp;
      tracked.mediaType = normalizeMediaType(post);
      tracked.mediaUrls = mediaUrls;
      tracked.matchedTerms = buildMatchedTerms(watchlist.includeText, post.text);
      tracked.relevanceScore = watchlist.includeText ? buildRelevanceScore(watchlist.includeText, post.text) : null;
      tracked.updatedAt = now;
      tracked.rawPayloadJson = JSON.stringify(post.raw);

      if (watchlist.autoArchive) {
        const archiveResult = upsertArchiveFromPost(data, user, "watchlist", `@${watchlist.targetHandle}`, {
          canonicalUrl: tracked.canonicalUrl,
          authorHandle: tracked.authorHandle,
          authorDisplayName: tracked.authorDisplayName,
          text: tracked.text,
          publishedAt: tracked.publishedAt,
          mediaType: tracked.mediaType,
          mediaUrls: tracked.mediaUrls,
          metadata: {
            watchlistId: watchlist.id
          }
        });
        if (archiveResult.archive) {
          tracked.archiveId = archiveResult.archive.id;
          tracked.archivedAt = archiveResult.archive.archivedAt;
        }
      }

      upsertTrackedPost(data, tracked);
    }
  } catch (error) {
    watchlist.lastError = toOperationalStatusError(error, "Watchlist sync failed.");
    watchlist.updatedAt = new Date().toISOString();
    upsertWatchlist(data, watchlist);
    throw error;
  }

  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function createSearchMonitor(
  data: WebDatabase,
  rawSession: string | null | undefined,
  input: CreateSearchMonitorInput
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  const query = safeText(input.query);
  if (!query) {
    throw new Error("Enter a keyword query to monitor.");
  }

  const now = new Date().toISOString();
  const monitor: SearchMonitorRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    query,
    authorHandle: normalizeHandle(input.authorHandle) || null,
    excludeHandles: [...new Set((input.excludeHandles ?? []).map((value) => normalizeHandle(value)).filter(Boolean))],
    autoArchive: input.autoArchive === true,
    searchType: input.searchType === "recent" ? "recent" : "top",
    lastCursor: null,
    lastRunAt: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    status: "active"
  };
  upsertSearchMonitor(data, monitor);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function deleteSearchMonitor(
  data: WebDatabase,
  rawSession: string | null | undefined,
  monitorId: string
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  ensureSearchMonitorBelongsToUser(data, user.id, monitorId);
  data.searchMonitors = data.searchMonitors.filter((candidate) => !(candidate.userId === user.id && candidate.id === monitorId));
  data.searchResults = data.searchResults.filter((candidate) => !(candidate.userId === user.id && candidate.monitorId === monitorId));
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function runSearchMonitor(
  data: WebDatabase,
  rawSession: string | null | undefined,
  monitorId: string
): Promise<ScrapbookPlusState> {
  const { user, accessToken } = await requireAdvancedContext(data, rawSession);
  const monitor = ensureSearchMonitorBelongsToUser(data, user.id, monitorId);
  const now = new Date().toISOString();

  try {
    const posts = await searchKeywordPosts(
      accessToken,
      monitor.query,
      12,
      monitor.searchType === "recent" ? "RECENT" : "TOP"
    );

    for (const post of posts) {
      const authorHandle = normalizeHandle(post.username);
      if (monitor.authorHandle && authorHandle !== monitor.authorHandle) {
        continue;
      }
      if (monitor.excludeHandles.includes(authorHandle)) {
        continue;
      }

      const existing = data.searchResults.find(
        (candidate) =>
          candidate.userId === user.id &&
          candidate.monitorId === monitor.id &&
          candidate.externalPostId === post.id
      );
      const mediaUrls = collectPostMediaUrls(post);
      const result: SearchResultRecord = existing ?? {
        id: crypto.randomUUID(),
        userId: user.id,
        monitorId: monitor.id,
        externalPostId: post.id,
        canonicalUrl: post.permalink,
        authorHandle,
        authorDisplayName: null,
        text: post.text,
        publishedAt: post.timestamp,
        mediaType: normalizeMediaType(post),
        mediaUrls,
        matchedTerms: buildMatchedTerms(monitor.query, post.text),
        relevanceScore: buildRelevanceScore(monitor.query, post.text),
        archiveId: null,
        archivedAt: null,
        dismissedAt: null,
        discoveredAt: now,
        updatedAt: now,
        rawPayloadJson: JSON.stringify(post.raw),
        status: "new"
      };

      result.canonicalUrl = post.permalink;
      result.authorHandle = authorHandle;
      result.authorDisplayName = null;
      result.text = post.text;
      result.publishedAt = post.timestamp;
      result.mediaType = normalizeMediaType(post);
      result.mediaUrls = mediaUrls;
      result.matchedTerms = buildMatchedTerms(monitor.query, post.text);
      result.relevanceScore = buildRelevanceScore(monitor.query, post.text);
      result.updatedAt = now;
      result.rawPayloadJson = JSON.stringify(post.raw);

      if (monitor.autoArchive && !result.archiveId) {
        const archiveResult = upsertArchiveFromPost(data, user, "search", monitor.query, {
          canonicalUrl: result.canonicalUrl,
          authorHandle: result.authorHandle,
          authorDisplayName: result.authorDisplayName,
          text: result.text,
          publishedAt: result.publishedAt,
          mediaType: result.mediaType,
          mediaUrls: result.mediaUrls,
          metadata: {
            monitorId: monitor.id,
            matchedTerms: result.matchedTerms
          }
        });
        if (archiveResult.archive) {
          result.archiveId = archiveResult.archive.id;
          result.archivedAt = archiveResult.archive.archivedAt;
          result.status = "archived";
        }
      }

      upsertSearchResult(data, result);
    }

    monitor.lastError = null;
    monitor.lastRunAt = now;
    monitor.updatedAt = now;
    upsertSearchMonitor(data, monitor);
  } catch (error) {
    monitor.lastError = toOperationalStatusError(error, "Keyword search failed.");
    monitor.lastRunAt = now;
    monitor.updatedAt = now;
    upsertSearchMonitor(data, monitor);
    throw error;
  }

  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function archiveSearchResult(
  data: WebDatabase,
  rawSession: string | null | undefined,
  resultId: string
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  const result = ensureSearchResultBelongsToUser(data, user.id, resultId);
  const archiveResult = upsertArchiveFromPost(
    data,
    user,
    "search",
    result.matchedTerms.join(", ") || result.authorHandle,
    {
    canonicalUrl: result.canonicalUrl,
    authorHandle: result.authorHandle,
    authorDisplayName: result.authorDisplayName,
    text: result.text,
    publishedAt: result.publishedAt,
    mediaType: result.mediaType,
    mediaUrls: result.mediaUrls,
    metadata: {
      monitorId: result.monitorId,
      resultId: result.id
    }
  });
  if (!archiveResult.archive) {
    throw new Error(getScrapbookArchiveLimitError(archiveResult.plan));
  }
  result.archiveId = archiveResult.archive.id;
  result.archivedAt = archiveResult.archive.archivedAt;
  result.status = "archived";
  result.updatedAt = new Date().toISOString();
  upsertSearchResult(data, result);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function dismissSearchResult(
  data: WebDatabase,
  rawSession: string | null | undefined,
  resultId: string
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  const result = ensureSearchResultBelongsToUser(data, user.id, resultId);
  result.dismissedAt = new Date().toISOString();
  result.status = "dismissed";
  result.updatedAt = result.dismissedAt;
  upsertSearchResult(data, result);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function refreshInsights(
  data: WebDatabase,
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  const { user, accessToken } = await requireAdvancedContext(data, rawSession);
  const now = new Date().toISOString();

  const profileInsights = await getProfileInsights(accessToken);
  upsertInsightsSnapshot(data, {
    id: crypto.randomUUID(),
    userId: user.id,
    kind: "profile",
    externalPostId: null,
    canonicalUrl: null,
    title: null,
    likes: profileInsights.likes,
    replies: profileInsights.replies,
    reposts: profileInsights.reposts,
    quotes: profileInsights.quotes,
    views: profileInsights.views,
    followers: profileInsights.followers,
    profileViews: profileInsights.profileViews,
    capturedAt: now,
    rawPayloadJson: JSON.stringify(profileInsights.raw)
  });

  const posts = await listOwnPosts(accessToken, 6);
  for (const post of posts) {
    const existing = findExistingInsightPost(data, user.id, post.id);
    const mediaUrls = collectPostMediaUrls(post);
    const tracked: TrackedPostRecord = existing ?? {
      id: crypto.randomUUID(),
      userId: user.id,
      origin: "insight",
      sourceId: null,
      externalPostId: post.id,
      canonicalUrl: post.permalink,
      authorHandle: normalizeHandle(post.username) || user.threadsHandle,
      authorDisplayName: user.displayName,
      text: post.text,
      publishedAt: post.timestamp,
      mediaType: normalizeMediaType(post),
      mediaUrls,
      matchedTerms: [],
      relevanceScore: null,
      archiveId: null,
      archivedAt: null,
      discoveredAt: now,
      updatedAt: now,
      rawPayloadJson: JSON.stringify(post.raw)
    };

    tracked.canonicalUrl = post.permalink;
    tracked.authorHandle = normalizeHandle(post.username) || user.threadsHandle;
    tracked.authorDisplayName = user.displayName;
    tracked.text = post.text;
    tracked.publishedAt = post.timestamp;
    tracked.mediaType = normalizeMediaType(post);
    tracked.mediaUrls = mediaUrls;
    tracked.updatedAt = now;
    tracked.rawPayloadJson = JSON.stringify(post.raw);
    upsertTrackedPost(data, tracked);

    const insights = await getPostInsights(accessToken, post.id);
    upsertInsightsSnapshot(data, {
      id: crypto.randomUUID(),
      userId: user.id,
      kind: "post",
      externalPostId: post.id,
      canonicalUrl: post.permalink,
      title: titleFromText(post.text, `@${tracked.authorHandle}`),
      likes: insights.likes,
      replies: insights.replies,
      reposts: insights.reposts,
      quotes: insights.quotes,
      views: insights.views,
      followers: null,
      profileViews: null,
      capturedAt: now,
      rawPayloadJson: JSON.stringify(insights.raw)
    });
  }

  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function archiveTrackedInsightPost(
  data: WebDatabase,
  rawSession: string | null | undefined,
  externalPostId: string
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  const tracked = findExistingInsightPost(data, user.id, externalPostId);
  if (!tracked) {
    throw new Error("The requested insight post could not be found.");
  }

  const archiveResult = upsertArchiveFromPost(data, user, "insight", "own-post", {
    canonicalUrl: tracked.canonicalUrl,
    authorHandle: tracked.authorHandle,
    authorDisplayName: tracked.authorDisplayName,
    text: tracked.text,
    publishedAt: tracked.publishedAt,
    mediaType: tracked.mediaType,
    mediaUrls: tracked.mediaUrls,
    metadata: {
      externalPostId
    }
  });
  if (!archiveResult.archive) {
    throw new Error(getScrapbookArchiveLimitError(archiveResult.plan));
  }
  tracked.archiveId = archiveResult.archive.id;
  tracked.archivedAt = archiveResult.archive.archivedAt;
  tracked.updatedAt = new Date().toISOString();
  upsertTrackedPost(data, tracked);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function archiveTrackedPost(
  data: WebDatabase,
  rawSession: string | null | undefined,
  trackedPostId: string
): Promise<ScrapbookPlusState> {
  const { user } = await requireAdvancedContext(data, rawSession);
  const tracked = ensureTrackedPostBelongsToUser(data, user.id, trackedPostId);
  const sourceLabel =
    tracked.origin === "watchlist"
      ? data.watchlists.find((candidate) => candidate.id === tracked.sourceId)?.targetHandle ?? tracked.authorHandle
      : "own-post";
  const archiveResult = upsertArchiveFromPost(data, user, tracked.origin, sourceLabel, {
    canonicalUrl: tracked.canonicalUrl,
    authorHandle: tracked.authorHandle,
    authorDisplayName: tracked.authorDisplayName,
    text: tracked.text,
    publishedAt: tracked.publishedAt,
    mediaType: tracked.mediaType,
    mediaUrls: tracked.mediaUrls,
    metadata: {
      trackedPostId: tracked.id,
      origin: tracked.origin
    }
  });
  if (!archiveResult.archive) {
    throw new Error(getScrapbookArchiveLimitError(archiveResult.plan));
  }
  tracked.archiveId = archiveResult.archive.id;
  tracked.archivedAt = archiveResult.archive.archivedAt;
  tracked.updatedAt = new Date().toISOString();
  upsertTrackedPost(data, tracked);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function readAuthenticatedScrapbookPlusState(
  data: WebDatabase,
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  return resolveStateForCurrentUser(data, rawSession);
}

export async function readScrapbookPlusStateFromStore(
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => readScrapbookPlusState(data, rawSession));
}

export async function readAuthenticatedScrapbookPlusStateFromStore(
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => readAuthenticatedScrapbookPlusState(data, rawSession));
}

export async function activateScrapbookPlusForSession(
  data: WebDatabase,
  rawSession: string | null | undefined,
  token: string
): Promise<ScrapbookPlusState> {
  const user = getBotSessionUserRecord(data, rawSession);
  if (!user) {
    throw new Error("Sign in to Threads scrapbook first.");
  }

  await activateScrapbookPlan(data, user, token);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function activateScrapbookPlusForSessionFromStore(
  rawSession: string | null | undefined,
  token: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) =>
    activateScrapbookPlusForSession(data, rawSession, token)
  );
}

export async function clearScrapbookPlusForSession(
  data: WebDatabase,
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  const user = getBotSessionUserRecord(data, rawSession);
  if (!user) {
    throw new Error("Sign in to Threads scrapbook first.");
  }

  clearScrapbookPlan(data, user);
  return readScrapbookPlusState(data, rawSession, user.id);
}

export async function clearScrapbookPlusForSessionFromStore(
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => clearScrapbookPlusForSession(data, rawSession));
}

export async function createWatchlistFromStore(
  rawSession: string | null | undefined,
  input: CreateWatchlistInput
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => createWatchlist(data, rawSession, input));
}

export async function deleteWatchlistFromStore(
  rawSession: string | null | undefined,
  watchlistId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => deleteWatchlist(data, rawSession, watchlistId));
}

export async function syncWatchlistFromStore(
  rawSession: string | null | undefined,
  watchlistId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => syncWatchlist(data, rawSession, watchlistId));
}

export async function createSearchMonitorFromStore(
  rawSession: string | null | undefined,
  input: CreateSearchMonitorInput
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => createSearchMonitor(data, rawSession, input));
}

export async function deleteSearchMonitorFromStore(
  rawSession: string | null | undefined,
  monitorId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => deleteSearchMonitor(data, rawSession, monitorId));
}

export async function runSearchMonitorFromStore(
  rawSession: string | null | undefined,
  monitorId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => runSearchMonitor(data, rawSession, monitorId));
}

export async function archiveSearchResultFromStore(
  rawSession: string | null | undefined,
  resultId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => archiveSearchResult(data, rawSession, resultId));
}

export async function dismissSearchResultFromStore(
  rawSession: string | null | undefined,
  resultId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => dismissSearchResult(data, rawSession, resultId));
}

export async function refreshInsightsFromStore(
  rawSession: string | null | undefined
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => refreshInsights(data, rawSession));
}

export async function archiveTrackedInsightPostFromStore(
  rawSession: string | null | undefined,
  externalPostId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) =>
    archiveTrackedInsightPost(data, rawSession, externalPostId)
  );
}

export async function archiveTrackedPostFromStore(
  rawSession: string | null | undefined,
  trackedPostId: string
): Promise<ScrapbookPlusState> {
  return withBotSessionDatabaseTransaction(rawSession, (data) => archiveTrackedPost(data, rawSession, trackedPostId));
}
