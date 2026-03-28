import { fetchWithTimeout } from "./http-client";

const THREADS_GRAPH_BASE_URL = "https://graph.threads.net";

export interface ThreadsPublicProfile {
  id: string;
  username: string;
  name: string | null;
  threads_profile_picture_url: string | null;
  threads_biography: string | null;
  is_verified: boolean;
}

export interface ThreadsApiPost {
  id: string;
  text: string;
  permalink: string;
  username: string;
  timestamp: string | null;
  media_type: string | null;
  media_product_type: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  short_code: string | null;
  link_attachment_url: string | null;
  children: Array<{
    media_type: string | null;
    media_url: string | null;
    thumbnail_url: string | null;
  }>;
  raw: Record<string, unknown>;
}

export interface ThreadsInsightsSnapshot {
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  quotes: number | null;
  views: number | null;
  followers: number | null;
  profileViews: number | null;
  raw: Record<string, unknown>[];
}

interface ThreadsCollectionResponse<T> {
  data?: T[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
  };
}

interface ThreadsMetricItem {
  name?: string;
  total_value?: { value?: number | null } | null;
  values?: Array<{ value?: number | null }>;
}

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readGraphApiVersion(): string {
  return process.env.THREADS_GRAPH_API_VERSION?.trim() || "v1.0";
}

function buildGraphApiUrl(pathname: string): URL {
  return new URL(pathname.replace(/^\//, ""), `${THREADS_GRAPH_BASE_URL}/${readGraphApiVersion()}/`);
}

function parseThreadsApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === "object") {
    const nestedRecord = nested as Record<string, unknown>;
    const message = safeText(nestedRecord.message);
    if (message) {
      return message;
    }
  }

  const directMessage = safeText(record.error_message) || safeText(record.message);
  return directMessage || fallback;
}

async function requestThreadsJson<T>(url: URL): Promise<T> {
  const response = await fetchWithTimeout(url, { cache: "no-store" });
  const body = (await response.json().catch(() => null)) as T | Record<string, unknown> | null;
  if (!response.ok) {
    throw new Error(parseThreadsApiError(body, `Threads API request failed (${response.status}).`));
  }

  return (body ?? {}) as T;
}

function buildPostFields(): string {
  return [
    "id",
    "text",
    "permalink",
    "username",
    "timestamp",
    "media_type",
    "media_product_type",
    "media_url",
    "thumbnail_url",
    "short_code",
    "link_attachment_url",
    "children{media_type,media_url,thumbnail_url}"
  ].join(",");
}

function normalizePost(value: unknown, profileFallback?: ThreadsPublicProfile | null): ThreadsApiPost | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = safeText(record.id);
  const permalink = safeText(record.permalink);
  if (!id || !permalink) {
    return null;
  }

  const childItems = Array.isArray(record.children)
    ? record.children
    : Array.isArray((record.children as { data?: unknown[] } | null)?.data)
      ? (((record.children as { data?: unknown[] }).data ?? []) as unknown[])
      : [];

  return {
    id,
    text: safeText(record.text),
    permalink,
    username: safeText(record.username) || profileFallback?.username || "",
    timestamp: safeText(record.timestamp) || null,
    media_type: safeText(record.media_type) || null,
    media_product_type: safeText(record.media_product_type) || null,
    media_url: safeText(record.media_url) || null,
    thumbnail_url: safeText(record.thumbnail_url) || null,
    short_code: safeText(record.short_code) || null,
    link_attachment_url: safeText(record.link_attachment_url) || null,
    children: childItems
      .map((child) => {
        if (!child || typeof child !== "object" || Array.isArray(child)) {
          return null;
        }

        const childRecord = child as Record<string, unknown>;
        return {
          media_type: safeText(childRecord.media_type) || null,
          media_url: safeText(childRecord.media_url) || null,
          thumbnail_url: safeText(childRecord.thumbnail_url) || null
        };
      })
      .filter((child): child is ThreadsApiPost["children"][number] => Boolean(child)),
    raw: record
  };
}

function extractMetricValue(item: ThreadsMetricItem | null | undefined): number | null {
  const total = item?.total_value?.value;
  if (typeof total === "number" && Number.isFinite(total)) {
    return total;
  }

  const lastValue = item?.values?.find((candidate) => typeof candidate?.value === "number");
  if (typeof lastValue?.value === "number" && Number.isFinite(lastValue.value)) {
    return lastValue.value;
  }

  return null;
}

async function requestInsightMetric(
  accessToken: string,
  pathname: string,
  metric: string
): Promise<{ name: string; value: number | null; raw: Record<string, unknown>[] }> {
  const url = buildGraphApiUrl(pathname);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("metric", metric);

  try {
    const payload = await requestThreadsJson<ThreadsCollectionResponse<ThreadsMetricItem>>(url);
    const items = Array.isArray(payload.data) ? payload.data : [];
    const first = items[0] ?? null;
    return {
      name: safeText(first?.name) || metric,
      value: extractMetricValue(first),
      raw: items.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    };
  } catch {
    return { name: metric, value: null, raw: [] };
  }
}

export async function lookupPublicProfile(accessToken: string, username: string): Promise<ThreadsPublicProfile> {
  const url = buildGraphApiUrl("profile_lookup");
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("username", username.replace(/^@+/, "").trim().toLowerCase());
  url.searchParams.set(
    "fields",
    ["id", "username", "name", "threads_profile_picture_url", "threads_biography", "is_verified"].join(",")
  );

  const payload = await requestThreadsJson<Record<string, unknown>>(url);
  const profile: ThreadsPublicProfile = {
    id: safeText(payload.id),
    username: safeText(payload.username),
    name: safeText(payload.name) || null,
    threads_profile_picture_url: safeText(payload.threads_profile_picture_url) || null,
    threads_biography: safeText(payload.threads_biography) || null,
    is_verified: payload.is_verified === true
  };

  if (!profile.id || !profile.username) {
    throw new Error("Threads profile discovery returned an invalid profile.");
  }

  return profile;
}

export async function listPublicProfilePosts(
  accessToken: string,
  threadsUserId: string,
  limit = 12,
  profileFallback?: ThreadsPublicProfile | null
): Promise<ThreadsApiPost[]> {
  const url = buildGraphApiUrl(`${threadsUserId}/threads`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", buildPostFields());
  url.searchParams.set("limit", String(limit));

  const payload = await requestThreadsJson<ThreadsCollectionResponse<unknown>>(url);
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items
    .map((item) => normalizePost(item, profileFallback))
    .filter((item): item is ThreadsApiPost => Boolean(item));
}

export async function searchKeywordPosts(
  accessToken: string,
  query: string,
  limit = 12,
  searchType: "TOP" | "RECENT" = "TOP"
): Promise<ThreadsApiPost[]> {
  const candidates: URL[] = [];
  for (const paramName of ["query", "q"]) {
    const url = buildGraphApiUrl("keyword_search");
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set(paramName, query);
    url.searchParams.set("fields", buildPostFields());
    url.searchParams.set("search_type", searchType);
    url.searchParams.set("limit", String(limit));
    candidates.push(url);
  }

  let lastError: Error | null = null;
  for (const url of candidates) {
    try {
      const payload = await requestThreadsJson<ThreadsCollectionResponse<unknown>>(url);
      const items = Array.isArray(payload.data) ? payload.data : [];
      return items.map((item) => normalizePost(item)).filter((item): item is ThreadsApiPost => Boolean(item));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Threads keyword search failed.");
    }
  }

  throw lastError ?? new Error("Threads keyword search failed.");
}

export async function listOwnPosts(accessToken: string, limit = 8): Promise<ThreadsApiPost[]> {
  const url = buildGraphApiUrl("me/threads");
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", buildPostFields());
  url.searchParams.set("limit", String(limit));
  const payload = await requestThreadsJson<ThreadsCollectionResponse<unknown>>(url);
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => normalizePost(item)).filter((item): item is ThreadsApiPost => Boolean(item));
}

export async function getProfileInsights(accessToken: string): Promise<ThreadsInsightsSnapshot> {
  const metrics = ["views", "likes", "replies", "reposts", "quotes", "followers_count", "profile_views"];
  const results = await Promise.all(metrics.map((metric) => requestInsightMetric(accessToken, "me/threads_insights", metric)));
  const raw = results.flatMap((result) => result.raw);
  return {
    likes: results.find((result) => result.name === "likes")?.value ?? null,
    replies: results.find((result) => result.name === "replies")?.value ?? null,
    reposts: results.find((result) => result.name === "reposts")?.value ?? null,
    quotes: results.find((result) => result.name === "quotes")?.value ?? null,
    views: results.find((result) => result.name === "views")?.value ?? null,
    followers: results.find((result) => result.name === "followers_count")?.value ?? null,
    profileViews: results.find((result) => result.name === "profile_views")?.value ?? null,
    raw
  };
}

export async function getPostInsights(accessToken: string, postId: string): Promise<ThreadsInsightsSnapshot> {
  const metrics = ["views", "likes", "replies", "reposts", "quotes"];
  const results = await Promise.all(
    metrics.map((metric) => requestInsightMetric(accessToken, `${postId}/insights`, metric))
  );
  const raw = results.flatMap((result) => result.raw);
  return {
    likes: results.find((result) => result.name === "likes")?.value ?? null,
    replies: results.find((result) => result.name === "replies")?.value ?? null,
    reposts: results.find((result) => result.name === "reposts")?.value ?? null,
    quotes: results.find((result) => result.name === "quotes")?.value ?? null,
    views: results.find((result) => result.name === "views")?.value ?? null,
    followers: null,
    profileViews: null,
    raw
  };
}

export function collectPostMediaUrls(post: ThreadsApiPost): string[] {
  const urls = [post.media_url, post.thumbnail_url, post.link_attachment_url];
  for (const child of post.children) {
    urls.push(child.media_url, child.thumbnail_url);
  }

  return [...new Set(urls.map((value) => safeText(value)).filter(Boolean))];
}
