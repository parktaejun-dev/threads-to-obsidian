import assert from "node:assert/strict";
import test from "node:test";

import { buildDefaultDatabase } from "@threads/web-schema";
import { completeBotOauth, getBotSessionState, startBotOauth } from "../packages/web-server/src/server/bot-service";
import {
  archiveSearchResult,
  createSearchMonitor,
  createWatchlist,
  readScrapbookPlusState,
  refreshInsights,
  runSearchMonitor,
  syncWatchlist
} from "../packages/web-server/src/server/scrapbook-plus-service";

function createJsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

test("watchlists, searches, and insights populate scrapbook plus state", async () => {
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_BOT_HANDLE = "parktaejun";

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.includes("/oauth/access_token")) {
      return createJsonResponse({
        access_token: "short-lived-token",
        user_id: "user-1",
        expires_in: 3600
      });
    }

    if (url.includes("/access_token?")) {
      return createJsonResponse({
        access_token: "long-lived-token",
        expires_in: 5_184_000
      });
    }

    if (url.includes("/me?")) {
      return createJsonResponse({
        id: "user-1",
        username: "writer",
        name: "Writer",
        threads_profile_picture_url: "https://cdn.example.com/profile.jpg",
        threads_biography: "Archive everything.",
        is_verified: true
      });
    }

    if (url.includes("/profile_lookup?")) {
      return createJsonResponse({
        id: "public-1",
        username: "target",
        name: "Target",
        threads_profile_picture_url: "https://cdn.example.com/target.jpg",
        threads_biography: "Target bio",
        is_verified: false
      });
    }

    if (url.includes("/public-1/threads?")) {
      return createJsonResponse({
        data: [
          {
            id: "public-post-1",
            permalink: "https://www.threads.com/@target/post/PUBLIC1",
            username: "target",
            text: "OpenAI agent notes from today",
            timestamp: "2026-03-25T01:00:00.000Z",
            media_type: "TEXT",
            media_product_type: "THREADS",
            media_url: null,
            thumbnail_url: null,
            children: []
          }
        ]
      });
    }

    if (url.includes("/keyword_search?")) {
      return createJsonResponse({
        data: [
          {
            id: "search-post-1",
            permalink: "https://www.threads.com/@searcher/post/SEARCH1",
            username: "searcher",
            text: "codex workflow note with openai context",
            timestamp: "2026-03-25T02:00:00.000Z",
            media_type: "TEXT",
            media_product_type: "THREADS",
            media_url: null,
            thumbnail_url: null,
            children: []
          }
        ]
      });
    }

    if (url.includes("/me/threads?")) {
      return createJsonResponse({
        data: [
          {
            id: "own-post-1",
            permalink: "https://www.threads.com/@writer/post/OWN1",
            username: "writer",
            text: "My top post",
            timestamp: "2026-03-25T03:00:00.000Z",
            media_type: "TEXT",
            media_product_type: "THREADS",
            media_url: null,
            thumbnail_url: null,
            children: []
          }
        ]
      });
    }

    if (url.includes("/me/threads_insights?")) {
      const metric = new URL(url).searchParams.get("metric");
      const values: Record<string, number> = {
        followers_count: 120,
        profile_views: 330,
        views: 1000,
        likes: 80,
        replies: 10,
        reposts: 4,
        quotes: 2
      };
      return createJsonResponse({
        data: [{ name: metric, total_value: { value: values[metric ?? ""] ?? null } }]
      });
    }

    if (url.includes("/own-post-1/insights?")) {
      const metric = new URL(url).searchParams.get("metric");
      const values: Record<string, number> = {
        views: 500,
        likes: 45,
        replies: 8,
        reposts: 3,
        quotes: 1
      };
      return createJsonResponse({
        data: [{ name: metric, total_value: { value: values[metric ?? ""] ?? null } }]
      });
    }

    throw new Error(`Unexpected fetch URL in scrapbook-plus-service test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    const oauthStart = startBotOauth(data, "https://threads-archive.dahanda.dev");
    const rawState = new URL(oauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(rawState);

    const session = await completeBotOauth(
      data,
      rawState as string,
      "oauth-code-1",
      "https://threads-archive.dahanda.dev"
    );

    await createWatchlist(data, session.sessionToken, {
      targetHandle: "@target",
      includeText: "openai agent",
      autoArchive: true
    });
    let workspace = await syncWatchlist(data, session.sessionToken, data.watchlists[0]?.id ?? "");
    assert.equal(workspace.watchlists.length, 1);
    assert.equal(workspace.watchlists[0]?.resultCount, 1);

    await createSearchMonitor(data, session.sessionToken, {
      query: "openai codex",
      autoArchive: false
    });
    workspace = await runSearchMonitor(data, session.sessionToken, data.searchMonitors[0]?.id ?? "");
    assert.equal(workspace.searches.length, 1);
    assert.equal(workspace.searches[0]?.resultCount, 1);

    workspace = await archiveSearchResult(data, session.sessionToken, data.searchResults[0]?.id ?? "");
    assert.equal(workspace.searches[0]?.results[0]?.status, "archived");

    workspace = await refreshInsights(data, session.sessionToken);
    assert.equal(workspace.insights.ready, true);
    assert.equal(workspace.insights.posts.length, 1);
    assert.equal(workspace.insights.overview.followers.value, 120);

    const sessionState = getBotSessionState(data, session.sessionToken);
    assert.equal(sessionState.archives.length, 2);

    const readState = readScrapbookPlusState(data, session.sessionToken);
    assert.equal(readState.scopes.needsReconnect, false);
    assert.equal(readState.watchlists[0]?.results[0]?.archived, true);
    assert.equal(readState.searches[0]?.results[0]?.status, "archived");
  } finally {
    globalThis.fetch = previousFetch;

    if (typeof previousAppId === "string") {
      process.env.THREADS_BOT_APP_ID = previousAppId;
    } else {
      delete process.env.THREADS_BOT_APP_ID;
    }
    if (typeof previousAppSecret === "string") {
      process.env.THREADS_BOT_APP_SECRET = previousAppSecret;
    } else {
      delete process.env.THREADS_BOT_APP_SECRET;
    }
    if (typeof previousAdminToken === "string") {
      process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    } else {
      delete process.env.THREADS_WEB_ADMIN_TOKEN;
    }
    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }
  }
});
