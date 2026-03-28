import assert from "node:assert/strict";
import test from "node:test";

import { buildDefaultDatabase } from "@threads/web-schema";
import { completeBotOauth, startBotOauth } from "../packages/web-server/src/server/bot-service";
import { createBotMentionCollector } from "../packages/web-server/src/server/bot-mention-service";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

const extractedThreadFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@source/post/TARGET1" />
    <meta property="og:title" content="source on Threads" />
    <meta property="og:description" content="Target post body from the original thread." />
  </head>
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@source/post/TARGET1"><time datetime="2026-03-25T11:59:00.000Z">1분</time></a>
        <div>source</div>
        <div>Target post body from the original thread.</div>
        <img src="https://cdn.example.com/image-1.jpg" alt="main image" width="640" height="480" />
        <button>좋아요 3</button>
      </article>
      <article>
        <a href="https://www.threads.com/@source/post/REPLY1"><time datetime="2026-03-25T12:01:00.000Z">방금</time></a>
        <div>source</div>
        <div>Author follow-up reply from the same thread.</div>
        <img src="https://cdn.example.com/reply-1.jpg" alt="reply image" width="640" height="480" />
        <button>좋아요 1</button>
      </article>
    </main>
  </body>
</html>
`;

function createJsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

test("mention collector fetches mentions and ingests them idempotently", async () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousInterval = process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS;
  const previousFetchLimit = process.env.THREADS_BOT_MENTION_FETCH_LIMIT;
  const previousMaxPages = process.env.THREADS_BOT_MENTION_MAX_PAGES;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_HANDLE = "parktaejun";
  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "bot-test-admin-secret";
  process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS = "30000";
  process.env.THREADS_BOT_MENTION_FETCH_LIMIT = "10";
  process.env.THREADS_BOT_MENTION_MAX_PAGES = "2";
  replaceRuntimeConfigForTests(null);

  let mentionListCalls = 0;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.includes("/oauth/access_token")) {
      return createJsonResponse({
        access_token: "short-lived-token",
        user_id: "bot-user-1",
        expires_in: 3600
      });
    }

    if (url.includes("/access_token?grant_type=th_exchange_token")) {
      return createJsonResponse({
        access_token: "long-lived-token",
        expires_in: 5_184_000
      });
    }

    if (url.includes("/me?fields=")) {
      return createJsonResponse({
        id: "bot-user-1",
        username: "parktaejun",
        name: "Park Taejun",
        is_verified: true
      });
    }

    if (url.includes("/me/mentions?")) {
      mentionListCalls += 1;
      return createJsonResponse({
        data: [
          {
            id: "mention-1",
            username: "parktaejun",
            text: "@parktaejun",
            timestamp: "2026-03-25T12:00:00.000Z",
            permalink: "https://www.threads.com/@parktaejun/post/MENTION1"
          }
        ]
      });
    }

    if (url.includes("/mention-1?")) {
      return createJsonResponse({
        id: "mention-1",
        username: "parktaejun",
        text: "@parktaejun save this",
        timestamp: "2026-03-25T12:00:00.000Z",
        permalink: "https://www.threads.com/@parktaejun/post/MENTION1",
        replied_to: {
          id: "target-1"
        }
      });
    }

    if (url.includes("/target-1?")) {
      return createJsonResponse({
        id: "target-1",
        username: "source",
        text: "Target post body from the original thread.",
        timestamp: "2026-03-25T11:59:00.000Z",
        permalink: "https://www.threads.com/@source/post/TARGET1",
        media_url: "https://cdn.example.com/image-1.jpg"
      });
    }

    if (url === "https://www.threads.com/@source/post/TARGET1") {
      return new Response(extractedThreadFixture, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8"
        }
      });
    }

    throw new Error(`Unexpected fetch URL in bot-mention-service test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    const oauthStart = startBotOauth(data, "https://ss-threads.dahanda.dev");
    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(state);

    await completeBotOauth(
      data,
      state as string,
      "oauth-code-1",
      "https://ss-threads.dahanda.dev"
    );

    const collector = createBotMentionCollector({
      runTransaction: async (operation) => operation(data),
      loadDatabase: async () => structuredClone(data)
    });

    const firstSync = await collector.syncNow("test");
    assert.equal(firstSync.ok, true);
    assert.equal(firstSync.createdArchives, 1);
    assert.equal(firstSync.updatedArchives, 0);
    assert.equal(firstSync.unmatchedMentions, 0);
    assert.equal(data.botArchives.length, 1);
    assert.equal(data.botMentionJobs.length, 1);
    assert.equal(data.botMentionJobs[0]?.status, "completed");
    assert.equal(data.botArchives[0]?.mentionId, "mention-1");
    assert.equal(data.botArchives[0]?.targetUrl, "https://www.threads.com/@source/post/TARGET1");
    assert.equal(data.botArchives[0]?.targetText, "Target post body from the original thread.");
    assert.equal(data.botArchives[0]?.noteText, "@parktaejun save this");
    assert.match(data.botArchives[0]?.markdownContent ?? "", /Author follow-up reply from the same thread\./);
    assert.match(data.botArchives[0]?.rawPayloadJson ?? "", /"authorReplies":\[/);

    const secondSync = await collector.syncNow("interval");
    assert.equal(secondSync.ok, true);
    assert.equal(secondSync.createdArchives, 0);
    assert.equal(secondSync.skippedExisting, 1);
    assert.equal(data.botArchives.length, 1);
    assert.equal(mentionListCalls >= 2, true);
  } finally {
    globalThis.fetch = previousFetch;

    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }

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

    if (typeof previousInterval === "string") {
      process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS = previousInterval;
    } else {
      delete process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS;
    }

    if (typeof previousFetchLimit === "string") {
      process.env.THREADS_BOT_MENTION_FETCH_LIMIT = previousFetchLimit;
    } else {
      delete process.env.THREADS_BOT_MENTION_FETCH_LIMIT;
    }

    if (typeof previousMaxPages === "string") {
      process.env.THREADS_BOT_MENTION_MAX_PAGES = previousMaxPages;
    } else {
      delete process.env.THREADS_BOT_MENTION_MAX_PAGES;
    }

    replaceRuntimeConfigForTests(null);
  }
});

test("mention collector refreshes existing archives with the original replied post during user sync", async () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousInterval = process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS;
  const previousFetchLimit = process.env.THREADS_BOT_MENTION_FETCH_LIMIT;
  const previousMaxPages = process.env.THREADS_BOT_MENTION_MAX_PAGES;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_HANDLE = "ss_savebot";
  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "bot-test-admin-secret";
  process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS = "30000";
  process.env.THREADS_BOT_MENTION_FETCH_LIMIT = "10";
  process.env.THREADS_BOT_MENTION_MAX_PAGES = "2";
  replaceRuntimeConfigForTests(null);

  let replyResolutionEnabled = false;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const body = typeof init?.body === "string" ? init.body : "";

    if (url.includes("/oauth/access_token")) {
      return createJsonResponse({
        access_token: body.includes("oauth-code-user") ? "user-short-lived-token" : "bot-short-lived-token",
        user_id: body.includes("oauth-code-user") ? "user-1" : "bot-1",
        expires_in: 3600
      });
    }

    if (url.includes("/access_token?grant_type=th_exchange_token")) {
      return createJsonResponse({
        access_token: url.includes("user-short-lived-token") ? "user-long-lived-token" : "bot-long-lived-token",
        expires_in: 5_184_000
      });
    }

    if (url.includes("/me?fields=")) {
      const accessToken = new URL(url).searchParams.get("access_token");
      if (accessToken === "bot-long-lived-token") {
        return createJsonResponse({
          id: "bot-1",
          username: "ss_savebot",
          name: "SS Savebot",
          is_verified: false
        });
      }

      return createJsonResponse({
        id: "user-1",
        username: "parktaejun",
        name: "Park Taejun",
        is_verified: true
      });
    }

    if (url.includes("/me/mentions?")) {
      return createJsonResponse({
        data: [
          {
            id: "mention-1",
            username: "parktaejun",
            text: "@ss_savebot",
            timestamp: "2026-03-25T12:00:00.000Z",
            permalink: "https://www.threads.com/@parktaejun/post/MENTION1"
          }
        ]
      });
    }

    if (url.includes("/mention-1?")) {
      return createJsonResponse({
        id: "mention-1",
        username: "parktaejun",
        text: "@ss_savebot",
        timestamp: "2026-03-25T12:00:00.000Z",
        permalink: "https://www.threads.com/@parktaejun/post/MENTION1"
      });
    }

    if (url.includes("/me/replies?")) {
      if (!replyResolutionEnabled) {
        return createJsonResponse(
          {
            error: {
              message: "Application does not have permission for this action"
            }
          },
          { status: 500 }
        );
      }

      return createJsonResponse({
        data: [
          {
            id: "mention-1",
            username: "parktaejun",
            text: "@ss_savebot",
            timestamp: "2026-03-25T12:00:00.000Z",
            permalink: "https://www.threads.com/@parktaejun/post/MENTION1",
            root_post: {
              id: "target-1",
              username: "source",
              text: "Original source post body.",
              timestamp: "2026-03-25T11:58:00.000Z",
              permalink: "https://www.threads.com/@source/post/TARGET1",
              media_url: "https://cdn.example.com/source-image.jpg"
            }
          }
        ]
      });
    }

    if (url === "https://www.threads.com/@source/post/TARGET1") {
      return new Response(
        extractedThreadFixture
          .replaceAll("Target post body from the original thread.", "Original source post body.")
          .replace("https://cdn.example.com/image-1.jpg", "https://cdn.example.com/source-image.jpg"),
        {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8"
          }
        }
      );
    }

    throw new Error(`Unexpected fetch URL in bot-mention-service refresh test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");

    const botOauthStart = startBotOauth(data, "https://ss-threads.dahanda.dev");
    const botState = new URL(botOauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(botState);
    await completeBotOauth(
      data,
      botState as string,
      "oauth-code-bot",
      "https://ss-threads.dahanda.dev"
    );

    process.env.THREADS_BOT_HANDLE = "parktaejun";
    const userOauthStart = startBotOauth(data, "https://ss-threads.dahanda.dev");
    const userState = new URL(userOauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(userState);
    await completeBotOauth(
      data,
      userState as string,
      "oauth-code-user",
      "https://ss-threads.dahanda.dev"
    );
    process.env.THREADS_BOT_HANDLE = "ss_savebot";

    const collector = createBotMentionCollector({
      runTransaction: async (operation) => operation(data),
      loadDatabase: async () => structuredClone(data)
    });

    const firstSync = await collector.syncNow("interval");
    assert.equal(firstSync.ok, true);
    assert.equal(firstSync.createdArchives, 1);
    assert.equal(data.botMentionJobs[0]?.status, "completed");
    assert.equal(data.botArchives[0]?.targetUrl, "https://www.threads.com/@parktaejun/post/MENTION1");
    assert.equal(data.botArchives[0]?.targetText, "@ss_savebot");

    replyResolutionEnabled = true;
    const repairSync = await collector.syncNow("user_sync");
    assert.equal(repairSync.ok, true);
    assert.equal(repairSync.createdArchives, 0);
    assert.equal(repairSync.updatedArchives, 1);
    assert.equal(data.botArchives[0]?.targetUrl, "https://www.threads.com/@source/post/TARGET1");
    assert.equal(data.botArchives[0]?.targetText, "Original source post body.");
    assert.equal(data.botArchives[0]?.mediaUrls[0], "https://cdn.example.com/source-image.jpg");
    assert.match(data.botArchives[0]?.markdownContent ?? "", /Author follow-up reply from the same thread\./);
  } finally {
    globalThis.fetch = previousFetch;

    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }

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

    if (typeof previousInterval === "string") {
      process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS = previousInterval;
    } else {
      delete process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS;
    }

    if (typeof previousFetchLimit === "string") {
      process.env.THREADS_BOT_MENTION_FETCH_LIMIT = previousFetchLimit;
    } else {
      delete process.env.THREADS_BOT_MENTION_FETCH_LIMIT;
    }

    if (typeof previousMaxPages === "string") {
      process.env.THREADS_BOT_MENTION_MAX_PAGES = previousMaxPages;
    } else {
      delete process.env.THREADS_BOT_MENTION_MAX_PAGES;
    }

    replaceRuntimeConfigForTests(null);
  }
});

test("mention collector skips target hydration for unmatched users", async () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousInterval = process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS;
  const previousFetchLimit = process.env.THREADS_BOT_MENTION_FETCH_LIMIT;
  const previousMaxPages = process.env.THREADS_BOT_MENTION_MAX_PAGES;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_HANDLE = "ss_savebot";
  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "bot-test-admin-secret";
  process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS = "30000";
  process.env.THREADS_BOT_MENTION_FETCH_LIMIT = "10";
  process.env.THREADS_BOT_MENTION_MAX_PAGES = "2";
  replaceRuntimeConfigForTests(null);

  let mentionDetailCalls = 0;
  let targetHydrationCalls = 0;
  let htmlHydrationCalls = 0;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.includes("/oauth/access_token")) {
      return createJsonResponse({
        access_token: "short-lived-token",
        user_id: "bot-user-1",
        expires_in: 3600
      });
    }

    if (url.includes("/access_token?grant_type=th_exchange_token")) {
      return createJsonResponse({
        access_token: "long-lived-token",
        expires_in: 5_184_000
      });
    }

    if (url.includes("/me?fields=")) {
      return createJsonResponse({
        id: "bot-user-1",
        username: "ss_savebot",
        name: "SS Savebot",
        is_verified: false
      });
    }

    if (url.includes("/me/mentions?")) {
      return createJsonResponse({
        data: [
          {
            id: "mention-1",
            username: "stranger",
            text: "@ss_savebot",
            timestamp: "2026-03-25T12:00:00.000Z",
            permalink: "https://www.threads.com/@stranger/post/MENTION1"
          }
        ]
      });
    }

    if (url.includes("/mention-1?")) {
      mentionDetailCalls += 1;
      return createJsonResponse({
        id: "mention-1",
        username: "stranger",
        text: "@ss_savebot save this",
        timestamp: "2026-03-25T12:00:00.000Z",
        permalink: "https://www.threads.com/@stranger/post/MENTION1",
        replied_to: {
          id: "target-1"
        }
      });
    }

    if (url.includes("/target-1?")) {
      targetHydrationCalls += 1;
      throw new Error("Unexpected target hydration for unmatched mention.");
    }

    if (url === "https://www.threads.com/@source/post/TARGET1") {
      htmlHydrationCalls += 1;
      throw new Error("Unexpected HTML hydration for unmatched mention.");
    }

    throw new Error(`Unexpected fetch URL in unmatched collector test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    const oauthStart = startBotOauth(data, "https://ss-threads.dahanda.dev");
    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(state);

    await completeBotOauth(
      data,
      state as string,
      "oauth-code-1",
      "https://ss-threads.dahanda.dev"
    );

    const collector = createBotMentionCollector({
      runTransaction: async (operation) => operation(data),
      loadDatabase: async () => structuredClone(data)
    });

    const sync = await collector.syncNow("interval");
    assert.equal(sync.ok, true);
    assert.equal(sync.processedMentions, 1);
    assert.equal(sync.unmatchedMentions, 1);
    assert.equal(sync.createdArchives, 0);
    assert.equal(data.botArchives.length, 0);
    assert.equal(data.botMentionJobs.length, 1);
    assert.equal(data.botMentionJobs[0]?.status, "unmatched");
    assert.equal(mentionDetailCalls, 1);
    assert.equal(targetHydrationCalls, 0);
    assert.equal(htmlHydrationCalls, 0);
  } finally {
    globalThis.fetch = previousFetch;

    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }

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

    if (typeof previousInterval === "string") {
      process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS = previousInterval;
    } else {
      delete process.env.THREADS_BOT_MENTION_POLL_INTERVAL_MS;
    }

    if (typeof previousFetchLimit === "string") {
      process.env.THREADS_BOT_MENTION_FETCH_LIMIT = previousFetchLimit;
    } else {
      delete process.env.THREADS_BOT_MENTION_FETCH_LIMIT;
    }

    if (typeof previousMaxPages === "string") {
      process.env.THREADS_BOT_MENTION_MAX_PAGES = previousMaxPages;
    } else {
      delete process.env.THREADS_BOT_MENTION_MAX_PAGES;
    }

    replaceRuntimeConfigForTests(null);
  }
});
