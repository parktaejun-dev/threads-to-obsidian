import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import JSZip from "jszip";

import { buildDefaultDatabase } from "@threads/web-schema";
import {
  activateBotOauthSession,
  completeExtensionLinkCode,
  completeBotOauth,
  createExtensionLinkCode,
  deleteArchive,
  failBotOauthSession,
  getExtensionCloudConnectionStatus,
  getBotSessionState,
  ingestBotMention,
  listExtensionCloudArchives,
  pollBotOauthSession,
  readBotArchiveMarkdown,
  readBotArchiveZip,
  repairBotSessionArchives,
  revokeExtensionCloudConnection,
  saveCloudArchive,
  saveCloudArchiveWithExtensionToken,
  startBotOauth,
  syncExtensionCloudLicenseLink,
  validateBotIngestRequest
} from "../packages/web-server/src/server/bot-service";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

function createJsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

test("bot Threads OAuth sign-in and mention ingest create a scrapbook archive", async () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousIngestToken = process.env.THREADS_BOT_INGEST_TOKEN;
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_HANDLE = "collectorbot";
  process.env.THREADS_BOT_INGEST_TOKEN = "test-ingest-token";
  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "bot-test-admin-secret";

  let fetchCallCount = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    fetchCallCount += 1;
    assert.ok(init?.signal instanceof AbortSignal);

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

    throw new Error(`Unexpected fetch URL in bot-service test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    const oauthStart = startBotOauth(data, "https://ss-threads.dahanda.dev");
    assert.equal(oauthStart.botHandle, "collectorbot");
    assert.match(oauthStart.authorizeUrl, /^https:\/\/www\.threads\.com\/oauth\/authorize\/\?/);
    assert.equal(new URL(oauthStart.authorizeUrl).hash, "#weblink");

    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(state);

    const session = await completeBotOauth(
      data,
      state as string,
      "oauth-code-1",
      "https://ss-threads.dahanda.dev"
    );

    assert.equal(fetchCallCount, 3);

    const initialState = getBotSessionState(data, session.sessionToken);
    assert.equal(initialState.authenticated, true);
    assert.equal(initialState.oauthConfigured, true);
    assert.equal(initialState.user?.threadsHandle, "writer");
    assert.equal(initialState.user?.threadsUserId, "user-1");
    assert.equal(initialState.user?.isVerified, true);
    assert.equal(initialState.archives.length, 0);

    validateBotIngestRequest("Bearer test-ingest-token");
    const ingest = ingestBotMention(data, {
      mentionId: "mention-1",
      mentionUrl: "https://www.threads.com/@writer.renamed/post/MENTION1",
      mentionAuthorUserId: "user-1",
      mentionAuthorHandle: "writer.renamed",
      mentionAuthorDisplayName: "Writer",
      noteText: "@collectorbot #inbox #ads #idea #overflow",
      targetUrl: "https://www.threads.com/@target/post/TARGET1",
      targetAuthorHandle: "target",
      targetAuthorDisplayName: "Target User",
      targetText: "Captured text from the target post.",
      targetPublishedAt: "2026-03-25T01:00:00.000Z",
      mediaUrls: ["https://cdn.example.com/image-1.jpg"]
    });

    assert.equal(ingest.ok, true);
    assert.equal(ingest.matched, true);
    assert.equal(ingest.created, true);
    assert.ok(ingest.archiveId);

    const duplicate = ingestBotMention(data, {
      mentionId: "mention-1",
      mentionUrl: "https://www.threads.com/@writer.renamed/post/MENTION1",
      mentionAuthorUserId: "user-1",
      mentionAuthorHandle: "writer.renamed",
      targetUrl: "https://www.threads.com/@target/post/TARGET1",
      targetAuthorHandle: "target",
      targetText: "Captured text from the target post."
    });

    assert.equal(duplicate.ok, true);
    assert.equal(duplicate.created, false);

    const finalState = getBotSessionState(data, session.sessionToken);
    assert.equal(finalState.archives.length, 1);
    assert.equal(finalState.archives[0]?.mentionAuthorHandle, "writer.renamed");
    assert.equal(finalState.archives[0]?.targetAuthorHandle, "target");
    assert.deepEqual(finalState.archives[0]?.tags, ["inbox", "ads", "idea"]);

    const exported = readBotArchiveMarkdown(data, session.sessionToken, ingest.archiveId as string);
    assert.match(exported.filename, /\.md$/);
    assert.ok(exported.markdownContent.includes("Captured text from the target post."));
    assert.ok(exported.markdownContent.includes("Source: @target"));
    assert.ok(exported.markdownContent.includes("Tags: #inbox #ads #idea"));
  } finally {
    globalThis.fetch = previousFetch;

    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }

    if (typeof previousIngestToken === "string") {
      process.env.THREADS_BOT_INGEST_TOKEN = previousIngestToken;
    } else {
      delete process.env.THREADS_BOT_INGEST_TOKEN;
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
  }
});

test("re-signing in keeps earlier scrapbook web sessions active", async () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_HANDLE = "collectorbot";
  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "bot-test-admin-secret";

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    assert.ok(init?.signal instanceof AbortSignal);

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

    throw new Error(`Unexpected fetch URL in bot-service test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    const firstState = new URL(startBotOauth(data, "https://ss-threads.dahanda.dev").authorizeUrl).searchParams.get("state");
    const secondState = new URL(startBotOauth(data, "https://ss-threads.dahanda.dev").authorizeUrl).searchParams.get("state");
    assert.ok(firstState);
    assert.ok(secondState);

    const firstSession = await completeBotOauth(
      data,
      firstState as string,
      "oauth-code-1",
      "https://ss-threads.dahanda.dev"
    );
    const secondSession = await completeBotOauth(
      data,
      secondState as string,
      "oauth-code-2",
      "https://ss-threads.dahanda.dev"
    );

    assert.notEqual(firstSession.sessionToken, secondSession.sessionToken);
    assert.equal(getBotSessionState(data, firstSession.sessionToken).authenticated, true);
    assert.equal(getBotSessionState(data, secondSession.sessionToken).authenticated, true);
    assert.equal(data.botSessions.filter((candidate) => candidate.status === "active").length, 2);
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
  }
});

test("reading scrapbook session state refreshes the active session expiry window", () => {
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  data.botUsers.push({
    id: "user-1",
    threadsUserId: "threads-user-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    lastLoginAt: "2026-03-01T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
    createdAt: "2026-03-01T00:00:00.000Z",
    expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    lastSeenAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
    revokedAt: null,
    status: "active"
  });

  const previousExpiry = data.botSessions[0]!.expiresAt;
  const previousLastSeen = data.botSessions[0]!.lastSeenAt;
  const state = getBotSessionState(data, "session-token-1");

  assert.equal(state.authenticated, true);
  assert.ok(Date.parse(data.botSessions[0]!.expiresAt) > Date.parse(previousExpiry));
  assert.ok(Date.parse(data.botSessions[0]!.lastSeenAt) > Date.parse(previousLastSeen));
});

test("scrapbook archive title uses the first sentence and truncates it to 30 characters", async () => {
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  data.botUsers.push({
    id: "user-1",
    threadsUserId: "threads-user-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });

  const ingest = ingestBotMention(data, {
    mentionId: "mention-1",
    mentionUrl: "https://www.threads.com/@writer/post/MENTION1",
    mentionAuthorUserId: "threads-user-1",
    mentionAuthorHandle: "writer",
    mentionAuthorDisplayName: "Writer",
    noteText: "@ss_threads_bot",
    targetUrl: "https://www.threads.com/@target/post/TARGET1",
    targetAuthorHandle: "target",
    targetAuthorDisplayName: "Target",
    targetText: "This is the first sentence that should be cut. This second sentence should not affect the title.",
    targetPublishedAt: "2026-03-25T01:00:00.000Z",
    mediaUrls: []
  });

  const exported = readBotArchiveMarkdown(data, "session-token-1", ingest.archiveId as string);
  assert.equal(exported.filename, "this-is-the-first-sentence.md");
  assert.match(exported.markdownContent, /^# This is the first sentence$/m);
});

test("scrapbook archive title prefers first-line note text over the target post body", async () => {
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  data.botUsers.push({
    id: "user-1",
    threadsUserId: "threads-user-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });

  const ingest = ingestBotMention(data, {
    mentionId: "mention-quoted-1",
    mentionUrl: "https://www.threads.com/@writer/post/MENTIONQ1",
    mentionAuthorUserId: "threads-user-1",
    mentionAuthorHandle: "writer",
    mentionAuthorDisplayName: "Writer",
    noteText: "AI 뉴스\n감사합니다. @ss_threads_bot",
    targetUrl: "https://www.threads.com/@target/post/TARGETQ1",
    targetAuthorHandle: "target",
    targetAuthorDisplayName: "Target",
    targetText: "This target body should not appear in the title.",
    targetPublishedAt: "2026-03-25T01:00:00.000Z",
    mediaUrls: []
  });

  const exported = readBotArchiveMarkdown(data, "session-token-1", ingest.archiveId as string);
  assert.match(exported.markdownContent, /^# AI 뉴스$/m);
});

test("repairBotSessionArchives rewrites mention captures to the original post thread", async () => {
  const previousFetch = globalThis.fetch;
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");

  data.botUsers.push({
    id: "user-1",
    threadsUserId: "threads-user-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });
  data.botArchives.push({
    id: "archive-1",
    userId: "user-1",
    mentionId: "mention-1",
    mentionUrl: "https://www.threads.com/@writer/post/MENTION1",
    mentionAuthorHandle: "writer",
    mentionAuthorDisplayName: "Writer",
    noteText: "@ss_threads_bot #voiceAI #audio thanks",
    targetUrl: "https://www.threads.com/@writer/post/MENTION1",
    targetAuthorHandle: null,
    targetAuthorDisplayName: null,
    targetText: "@ss_threads_bot #voiceAI #audio thanks",
    targetPublishedAt: "2026-03-25T12:00:00.000Z",
    mediaUrls: [],
    markdownContent: "# stale",
    rawPayloadJson: JSON.stringify({
      extractedPost: {
        canonicalUrl: "https://www.threads.com/@writer/post/MENTION1",
        shortcode: "MENTION1",
        author: "writer",
        title: "@ss_threads_bot #voiceAI #audio",
        text: "@ss_threads_bot #voiceAI #audio thanks",
        publishedAt: "2026-03-25T12:00:00.000Z",
        capturedAt: "2026-03-25T12:00:30.000Z",
        sourceType: "text",
        imageUrls: [],
        videoUrl: null,
        externalUrl: null,
        quotedPostUrl: "https://www.threads.com/@source/post/TARGET1",
        repliedToUrl: null,
        thumbnailUrl: null,
        authorReplies: [],
        extractorVersion: "test",
        contentHash: "mention-hash"
      }
    }),
    archivedAt: "2026-03-25T12:01:00.000Z",
    updatedAt: "2026-03-25T12:01:00.000Z",
    status: "saved"
  });

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url === "https://www.threads.com/@source/post/TARGET1") {
      return new Response(
        `<!doctype html>
        <html lang="ko">
          <head>
            <link rel="canonical" href="https://www.threads.com/@source/post/TARGET1" />
            <meta property="og:title" content="source on Threads" />
            <meta property="og:description" content="Original source post body." />
          </head>
          <body>
            <main>
              <article>
                <a href="https://www.threads.com/@source/post/TARGET1"><time datetime="2026-03-25T11:59:00.000Z">1분</time></a>
                <div>source</div>
                <div>Original source post body.</div>
              </article>
              <article>
                <a href="https://www.threads.com/@source/post/REPLY1"><time datetime="2026-03-25T12:01:00.000Z">방금</time></a>
                <div>source</div>
                <div>Author follow-up reply from the same thread.</div>
              </article>
            </main>
          </body>
        </html>`,
        {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8"
          }
        }
      );
    }

    throw new Error(`Unexpected fetch URL in repairBotSessionArchives test: ${url}`);
  }) as typeof fetch;

  try {
    const repaired = await repairBotSessionArchives(data, "user-1");
    assert.equal(repaired, 1);

    const state = getBotSessionState(data, "session-token-1");
    assert.equal(state.archives[0]?.targetUrl, "https://www.threads.com/@source/post/TARGET1");
    assert.equal(state.archives[0]?.targetAuthorHandle, "source");
    assert.equal(state.archives[0]?.targetText, "Original source post body.");
    assert.equal(state.archives[0]?.authorReplies.length, 1);
    assert.match(state.archives[0]?.authorReplies[0]?.text ?? "", /Author follow-up reply/);

    const exported = readBotArchiveMarkdown(data, "session-token-1", "archive-1");
    assert.match(exported.markdownContent, /Original source post body\./);
    assert.match(exported.markdownContent, /Author follow-up reply from the same thread\./);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("trigger-only mention captures are hidden from the scrapbook archive list", () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  process.env.THREADS_BOT_HANDLE = "ss_threads_bot";
  replaceRuntimeConfigForTests(null);

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    data.botUsers.push({
      id: "user-1",
      threadsUserId: "threads-user-1",
      threadsHandle: "writer",
      displayName: "Writer",
      profilePictureUrl: null,
      biography: null,
      isVerified: false,
      accessTokenCiphertext: null,
      tokenExpiresAt: null,
      email: null,
      grantedScopes: [],
      scopeVersion: 0,
      lastScopeUpgradeAt: null,
      createdAt: "2026-03-25T00:00:00.000Z",
      updatedAt: "2026-03-25T00:00:00.000Z",
      lastLoginAt: "2026-03-25T00:00:00.000Z",
      status: "active"
    });
    data.botSessions.push({
      id: "session-1",
      userId: "user-1",
      sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
      createdAt: "2026-03-25T00:00:00.000Z",
      expiresAt: "2026-04-25T00:00:00.000Z",
      lastSeenAt: "2026-03-25T00:00:00.000Z",
      revokedAt: null,
      status: "active"
    });
    data.botArchives.push({
      id: "archive-1",
      userId: "user-1",
      mentionId: "mention-1",
      mentionUrl: "https://www.threads.com/@writer/post/MENTION1",
      mentionAuthorHandle: "writer",
      mentionAuthorDisplayName: "Writer",
      noteText: null,
      targetUrl: "https://www.threads.com/@writer/post/MENTION1",
      targetAuthorHandle: "writer",
      targetAuthorDisplayName: "Writer",
      targetText: "@ss_threads_bot #skills 감사합니다.",
      targetPublishedAt: "2026-03-25T01:00:00.000Z",
      mediaUrls: [],
      markdownContent: "# stale",
      rawPayloadJson: JSON.stringify({
        mention: {
          id: "mention-1"
        },
        target: {
          id: "mention-1"
        },
        extractedPost: null
      }),
      archivedAt: "2026-03-25T01:00:00.000Z",
      updatedAt: "2026-03-25T01:00:00.000Z",
      status: "saved"
    });

    const state = getBotSessionState(data, "session-token-1");
    assert.equal(state.archives.length, 0);
  } finally {
    replaceRuntimeConfigForTests(null);
    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }
  }
});

test("trigger-only mention captures are hidden when the bot mention is at the end of the comment", () => {
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  process.env.THREADS_BOT_HANDLE = "ss_threads_bot";
  replaceRuntimeConfigForTests(null);

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    data.botUsers.push({
      id: "user-1",
      threadsUserId: "threads-user-1",
      threadsHandle: "writer",
      displayName: "Writer",
      profilePictureUrl: null,
      biography: null,
      isVerified: false,
      accessTokenCiphertext: null,
      tokenExpiresAt: null,
      email: null,
      grantedScopes: [],
      scopeVersion: 0,
      lastScopeUpgradeAt: null,
      createdAt: "2026-03-25T00:00:00.000Z",
      updatedAt: "2026-03-25T00:00:00.000Z",
      lastLoginAt: "2026-03-25T00:00:00.000Z",
      status: "active"
    });
    data.botSessions.push({
      id: "session-1",
      userId: "user-1",
      sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
      createdAt: "2026-03-25T00:00:00.000Z",
      expiresAt: "2026-04-25T00:00:00.000Z",
      lastSeenAt: "2026-03-25T00:00:00.000Z",
      revokedAt: null,
      status: "active"
    });
    data.botArchives.push({
      id: "archive-1",
      userId: "user-1",
      mentionId: "mention-1",
      mentionUrl: "https://www.threads.com/@writer/post/MENTION1",
      mentionAuthorHandle: "writer",
      mentionAuthorDisplayName: "Writer",
      noteText: null,
      targetUrl: "https://www.threads.com/@writer/post/MENTION1",
      targetAuthorHandle: "writer",
      targetAuthorDisplayName: "Writer",
      targetText: "감사합니다! @ss_threads_bot",
      targetPublishedAt: "2026-03-25T01:00:00.000Z",
      mediaUrls: [],
      markdownContent: "# stale",
      rawPayloadJson: JSON.stringify({
        mention: {
          id: "mention-1"
        },
        target: {
          id: "mention-1"
        },
        extractedPost: null
      }),
      archivedAt: "2026-03-25T01:00:00.000Z",
      updatedAt: "2026-03-25T01:00:00.000Z",
      status: "saved"
    });

    const state = getBotSessionState(data, "session-token-1");
    assert.equal(state.archives.length, 0);
  } finally {
    replaceRuntimeConfigForTests(null);
    if (typeof previousHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }
  }
});

test("scrapbook ZIP export keeps one markdown file and flat image files per archive", async () => {
  const previousFetch = globalThis.fetch;
  const previousMediaAllowlist = process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST;
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST = "example.com";
  data.botUsers.push({
    id: "user-1",
    threadsUserId: "threads-user-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-zip").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });

  const ingest = ingestBotMention(data, {
    mentionId: "mention-zip",
    mentionUrl: "https://www.threads.com/@writer/post/MENTIONZIP",
    mentionAuthorUserId: "threads-user-1",
    mentionAuthorHandle: "writer",
    noteText: "@ss_threads_bot #archive",
    targetUrl: "https://www.threads.com/@target/post/TARGETZIP",
    targetAuthorHandle: "target",
    targetText: "Archive this source body for ZIP.",
    mediaUrls: ["https://www.example.com/source-image.jpg"],
    extractedPost: {
      canonicalUrl: "https://www.threads.com/@target/post/TARGETZIP",
      shortcode: "TARGETZIP",
      author: "target",
      title: "Archive this source body for ZIP.",
      text: "Archive this source body for ZIP.",
      publishedAt: "2026-03-25T01:00:00.000Z",
      capturedAt: "2026-03-25T01:02:00.000Z",
      sourceType: "image",
      imageUrls: ["https://www.example.com/source-image.jpg"],
      videoUrl: null,
      externalUrl: null,
      quotedPostUrl: null,
      repliedToUrl: null,
      thumbnailUrl: null,
      authorReplies: [
        {
          author: "target",
          canonicalUrl: "https://www.threads.com/@target/post/REPLYZIP1",
          shortcode: "REPLYZIP1",
          text: "Follow-up reply from the author.",
          publishedAt: "2026-03-25T01:01:00.000Z",
          sourceType: "image",
          imageUrls: ["https://www.example.com/reply-image.jpg"],
          videoUrl: null,
          externalUrl: null,
          thumbnailUrl: null
        }
      ],
      extractorVersion: "test",
      contentHash: "ziphash1234"
    }
  });

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url === "https://www.example.com/source-image.jpg") {
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: {
          "content-type": "image/jpeg"
        }
      });
    }

    if (url === "https://www.example.com/reply-image.jpg") {
      return new Response(new Uint8Array([4, 5, 6]), {
        status: 200,
        headers: {
          "content-type": "image/jpeg"
        }
      });
    }

    throw new Error(`Unexpected fetch URL in bot-service ZIP test: ${url}`);
  }) as typeof fetch;

  try {
    const exported = await readBotArchiveZip(data, "session-token-zip", [ingest.archiveId as string]);
    assert.match(exported.filename, /^archive-this-source-body-for(?:_[0-9]{6}_[0-9]{4})?\.zip$/);

    const zip = await JSZip.loadAsync(exported.content);
    const fileNames = Object.keys(zip.files).sort();
    const noteFilename = fileNames.find((name) => name.endsWith(".md"));
    assert.ok(noteFilename);
    assert.match(noteFilename, /^archive-this-source-body-for(?:_[0-9]{6}_[0-9]{4})?\.md$/);
    assert.deepEqual(fileNames.filter((name) => !name.endsWith(".md")), ["image-01.jpg", "reply-01-image-01.jpg"]);

    const note = await zip.file(noteFilename)?.async("text");
    assert.ok(note?.includes("# Archive this source"));
    assert.ok(note?.includes("(image-01.jpg)"));
    assert.ok(note?.includes("## Author Replies"));
    assert.ok(note?.includes("Follow-up reply from the author."));
    assert.ok(note?.includes("(reply-01-image-01.jpg)"));
  } finally {
    globalThis.fetch = previousFetch;
    if (typeof previousMediaAllowlist === "string") {
      process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST = previousMediaAllowlist;
    } else {
      delete process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST;
    }
  }
});

test("cloud save creates a scrapbook archive with deep link and ZIP export", async () => {
  const previousFetch = globalThis.fetch;
  const previousMediaAllowlist = process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST;
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST = "example.com";
  data.botUsers.push({
    id: "user-1",
    threadsUserId: "threads-user-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-cloud-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-cloud-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url === "https://www.example.com/post-1.jpg") {
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "image/jpeg" }
      });
    }

    throw new Error(`Unexpected fetch URL in cloud archive test: ${url}`);
  }) as typeof fetch;

  try {
    const result = await saveCloudArchive(
      data,
      "session-token-cloud-1",
      {
        locale: "en",
        aiWarning: "AI summary used fallback tags.",
        aiResult: {
          summary: "A concise AI summary.",
          tags: ["launch", "threads"],
          frontmatter: {
            topic: "launch"
          }
        },
        post: {
          canonicalUrl: "https://www.threads.com/@writer/post/CLOUD1",
          shortcode: "CLOUD1",
          author: "writer",
          title: "Writer on Threads",
          text: "Cloud saved post body.",
          publishedAt: "2026-03-25T09:00:00.000Z",
          capturedAt: "2026-03-25T09:01:00.000Z",
          sourceType: "image",
          imageUrls: ["https://www.example.com/post-1.jpg"],
          videoUrl: null,
          externalUrl: null,
          quotedPostUrl: null,
          repliedToUrl: null,
          thumbnailUrl: null,
          authorReplies: [],
          extractorVersion: "2026-03-08",
          contentHash: "cloud-hash-1"
        }
      },
      "https://ss-threads.dahanda.dev"
    );

    assert.equal(result.created, true);
    assert.equal(result.archiveUrl, `https://ss-threads.dahanda.dev/scrapbook/@writer/archive/${result.archiveId}`);

    const sessionState = getBotSessionState(data, "session-token-cloud-1");
    assert.equal(sessionState.archives.length, 1);
    assert.equal(sessionState.archives[0]?.origin, "cloud");
    assert.equal(sessionState.archives[0]?.mentionUrl, null);
    assert.deepEqual(sessionState.archives[0]?.tags, ["launch", "threads"]);

    const markdown = readBotArchiveMarkdown(data, "session-token-cloud-1", result.archiveId);
    assert.match(markdown.filename, /\.md$/);
    assert.ok(markdown.markdownContent.includes("A concise AI summary."));
    assert.ok(markdown.markdownContent.includes("Cloud saved post body."));

    const exported = await readBotArchiveZip(data, "session-token-cloud-1", [result.archiveId]);
    assert.match(exported.filename, /\.zip$/);
    const zip = await JSZip.loadAsync(exported.content);
    const fileNames = Object.keys(zip.files).sort();
    assert.equal(fileNames.includes("image-01.jpg"), true);
    assert.equal(fileNames.some((name) => name.endsWith(".md")), true);
  } finally {
    globalThis.fetch = previousFetch;
    if (typeof previousMediaAllowlist === "string") {
      process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST = previousMediaAllowlist;
    } else {
      delete process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST;
    }
  }
});

test("extension cloud link issues a scoped token, saves archives, and can be revoked", async () => {
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  data.botUsers.push({
    id: "user-ext-1",
    threadsUserId: "threads-user-ext-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-ext-1",
    userId: "user-ext-1",
    sessionHash: createHash("sha256").update("session-token-ext-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });

  const link = createExtensionLinkCode(data, "session-token-ext-1", "state-one");
  assert.equal(link.userHandle, "writer");

  const completed = completeExtensionLinkCode(data, link.code, "state-one");
  const linkedStatus = getExtensionCloudConnectionStatus(data, completed.token);
  assert.equal(linkedStatus.state, "linked");
  assert.equal(linkedStatus.userHandle, "writer");

  const saveResult = await saveCloudArchiveWithExtensionToken(
    data,
    completed.token,
    {
      locale: "en",
      aiResult: null,
      aiWarning: null,
      post: {
        canonicalUrl: "https://www.threads.com/@writer/post/EXTLINK1",
        shortcode: "EXTLINK1",
        author: "writer",
        title: "Writer on Threads",
        text: "Saved from the extension link token.",
        publishedAt: "2026-03-25T09:00:00.000Z",
        capturedAt: "2026-03-25T09:01:00.000Z",
        sourceType: "text",
        imageUrls: [],
        videoUrl: null,
        externalUrl: null,
        quotedPostUrl: null,
        repliedToUrl: null,
        thumbnailUrl: null,
        authorReplies: [],
        extractorVersion: "2026-03-25",
        contentHash: "ext-link-hash-1"
      }
    },
    "https://ss-threads.dahanda.dev"
  );
  assert.equal(saveResult.created, true);
  assert.equal(data.cloudArchives.length, 1);

  const mentionResult = ingestBotMention(data, {
    mentionId: "mention-ext-1",
    mentionUrl: "https://www.threads.com/@writer/post/MENTIONEXT1",
    mentionAuthorUserId: "threads-user-ext-1",
    mentionAuthorHandle: "writer",
    noteText: "AI 뉴스\n감사합니다. @ss_threads_bot",
    targetUrl: "https://www.threads.com/@target/post/TARGETEXT1",
    targetAuthorHandle: "target",
    targetText: "Mention-saved archive for scrapbook sync."
  });
  assert.equal(mentionResult.created, true);

  const syncedArchives = listExtensionCloudArchives(data, completed.token, "https://ss-threads.dahanda.dev");
  assert.equal(syncedArchives.length, 2);
  assert.equal(syncedArchives[0]?.origin, "mention");
  assert.equal(syncedArchives[0]?.title, "AI 뉴스");
  assert.equal(syncedArchives[0]?.archiveUrl, `https://ss-threads.dahanda.dev/scrapbook/@writer/archive/${mentionResult.archiveId}`);
  assert.equal(syncedArchives[1]?.origin, "cloud");
  assert.equal(syncedArchives[1]?.archiveUrl, `https://ss-threads.dahanda.dev/scrapbook/@writer/archive/${saveResult.archiveId}`);

  const replacementLink = createExtensionLinkCode(data, "session-token-ext-1", "state-two");
  const replacement = completeExtensionLinkCode(data, replacementLink.code, "state-two");
  assert.equal(getExtensionCloudConnectionStatus(data, completed.token).state, "revoked");
  assert.equal(getExtensionCloudConnectionStatus(data, replacement.token).state, "linked");

  const revokedStatus = revokeExtensionCloudConnection(data, replacement.token);
  assert.equal(revokedStatus.state, "revoked");
  await assert.rejects(
    async () =>
      saveCloudArchiveWithExtensionToken(
        data,
        replacement.token,
        {
          locale: "en",
          aiResult: null,
          aiWarning: null,
          post: {
            canonicalUrl: "https://www.threads.com/@writer/post/EXTLINK2",
            shortcode: "EXTLINK2",
            author: "writer",
            title: "Writer on Threads",
            text: "This save should be rejected.",
            publishedAt: "2026-03-25T10:00:00.000Z",
            capturedAt: "2026-03-25T10:01:00.000Z",
            sourceType: "text",
            imageUrls: [],
            videoUrl: null,
            externalUrl: null,
            quotedPostUrl: null,
            repliedToUrl: null,
            thumbnailUrl: null,
            authorReplies: [],
            extractorVersion: "2026-03-25",
            contentHash: "ext-link-hash-2"
          }
        },
        "https://ss-threads.dahanda.dev"
      ),
    /Reconnect the extension/i
  );
});

test("extension cloud link can sync the linked user's Plus license", () => {
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  data.botUsers.push({
    id: "user-ext-plus-1",
    threadsUserId: "threads-user-ext-plus-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    plusLicenseId: null,
    plusActivatedAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-ext-plus-1",
    userId: "user-ext-plus-1",
    sessionHash: createHash("sha256").update("session-token-ext-plus-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });
  data.licenses.push({
    id: "license-ext-plus-1",
    orderId: "order-ext-plus-1",
    holderName: "Writer",
    holderEmail: "writer@example.com",
    token: "signed.token.value",
    tokenPreview: "signed...value",
    issuedAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2027-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });

  const link = createExtensionLinkCode(data, "session-token-ext-plus-1", "state-plus");
  const completed = completeExtensionLinkCode(data, link.code, "state-plus");
  const synced = syncExtensionCloudLicenseLink(
    data,
    completed.token,
    "license-ext-plus-1",
    "2026-03-25T01:00:00.000Z"
  );

  assert.equal(synced, true);
  assert.equal(data.botUsers[0]?.plusLicenseId, "license-ext-plus-1");
  assert.equal(data.botUsers[0]?.plusActivatedAt, "2026-03-25T01:00:00.000Z");
});

test("deleting an archive removes linked search and tracked references", () => {
  const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
  data.botUsers.push({
    id: "user-delete-1",
    threadsUserId: "threads-user-delete-1",
    threadsHandle: "writer",
    displayName: "Writer",
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
    lastLoginAt: "2026-03-25T00:00:00.000Z",
    status: "active"
  });
  data.botSessions.push({
    id: "session-delete-1",
    userId: "user-delete-1",
    sessionHash: createHash("sha256").update("session-token-delete-1").digest("hex"),
    createdAt: "2026-03-25T00:00:00.000Z",
    expiresAt: "2026-04-25T00:00:00.000Z",
    lastSeenAt: "2026-03-25T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });
  data.cloudArchives.push({
    id: "archive-delete-1",
    userId: "user-delete-1",
    canonicalUrl: "https://www.threads.com/@writer/post/DELETE1",
    shortcode: "DELETE1",
    targetAuthorHandle: "writer",
    targetAuthorDisplayName: "Writer",
    targetTitle: "Delete me",
    targetText: "Delete me",
    targetPublishedAt: "2026-03-25T09:00:00.000Z",
    mediaUrls: [],
    markdownContent: "# Delete me",
    rawPayloadJson: "{}",
    contentHash: "delete-hash-1",
    savedAt: "2026-03-25T09:01:00.000Z",
    updatedAt: "2026-03-25T09:01:00.000Z",
    status: "saved"
  });
  data.searchResults.push({
    id: "search-result-1",
    userId: "user-delete-1",
    monitorId: "monitor-1",
    externalPostId: "DELETE1",
    canonicalUrl: "https://www.threads.com/@writer/post/DELETE1",
    authorHandle: "writer",
    authorDisplayName: "Writer",
    text: "Delete me",
    publishedAt: "2026-03-25T09:00:00.000Z",
    mediaType: "TEXT",
    mediaUrls: [],
    matchedTerms: ["delete"],
    relevanceScore: 1,
    archiveId: "archive-delete-1",
    archivedAt: "2026-03-25T09:01:00.000Z",
    dismissedAt: null,
    discoveredAt: "2026-03-25T09:01:00.000Z",
    updatedAt: "2026-03-25T09:01:00.000Z",
    rawPayloadJson: "{}",
    status: "archived"
  });
  data.trackedPosts.push({
    id: "tracked-post-1",
    userId: "user-delete-1",
    origin: "watchlist",
    sourceId: "watch-1",
    externalPostId: "DELETE1",
    canonicalUrl: "https://www.threads.com/@writer/post/DELETE1",
    authorHandle: "writer",
    authorDisplayName: "Writer",
    text: "Delete me",
    publishedAt: "2026-03-25T09:00:00.000Z",
    mediaType: "TEXT",
    mediaUrls: [],
    matchedTerms: ["delete"],
    relevanceScore: 1,
    archiveId: "archive-delete-1",
    archivedAt: "2026-03-25T09:01:00.000Z",
    discoveredAt: "2026-03-25T09:01:00.000Z",
    updatedAt: "2026-03-25T09:01:00.000Z",
    rawPayloadJson: "{}"
  });

  const state = deleteArchive(data, "session-token-delete-1", "archive-delete-1");
  assert.equal(data.cloudArchives.length, 0);
  assert.equal(data.searchResults[0]?.archiveId, null);
  assert.equal(data.searchResults[0]?.archivedAt, null);
  assert.equal(data.searchResults[0]?.status, "new");
  assert.equal(data.trackedPosts[0]?.archiveId, null);
  assert.equal(data.trackedPosts[0]?.archivedAt, null);
  assert.equal(state.archives.length, 0);
});

test("bot OAuth login upgrades a legacy scrapbook record that only had a handle", async () => {
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_APP_ID = "threads-app-id";
  process.env.THREADS_BOT_APP_SECRET = "threads-app-secret";
  process.env.THREADS_WEB_ADMIN_TOKEN = "bot-test-admin-secret";

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
        username: "writer.next",
        name: "Writer Next",
        is_verified: false
      });
    }

    throw new Error(`Unexpected fetch URL in bot-service test: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase("2026-03-25T00:00:00.000Z");
    data.botUsers.push({
      id: "legacy-user",
      threadsUserId: null,
      threadsHandle: "writer.next",
      displayName: "Writer",
      profilePictureUrl: null,
      biography: null,
      isVerified: false,
      accessTokenCiphertext: null,
      tokenExpiresAt: null,
      email: null,
      grantedScopes: [],
      scopeVersion: 0,
      lastScopeUpgradeAt: null,
      createdAt: "2026-03-20T00:00:00.000Z",
      updatedAt: "2026-03-20T00:00:00.000Z",
      lastLoginAt: null,
      status: "active"
    });

    const oauthStart = startBotOauth(data, "https://ss-threads.dahanda.dev");
    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state");
    assert.ok(state);

    const session = await completeBotOauth(
      data,
      state as string,
      "oauth-code-legacy",
      "https://ss-threads.dahanda.dev"
    );

    assert.equal(session.user.id, "legacy-user");
    assert.equal(data.botUsers.length, 1);
    assert.equal(data.botUsers[0]?.threadsUserId, "user-1");
    assert.equal(data.botUsers[0]?.threadsHandle, "writer.next");
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
  }
});

test("polling flow: poll returns pending then authorized, activate sets session token", async () => {
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_APP_ID = "app-id";
  process.env.THREADS_BOT_APP_SECRET = "app-secret";
  process.env.THREADS_BOT_HANDLE = "testbot";
  process.env.THREADS_WEB_ADMIN_TOKEN = "test-admin-secret";

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/oauth/access_token")) return createJsonResponse({ access_token: "short", user_id: "u1", expires_in: 3600 });
    if (url.includes("/access_token?")) return createJsonResponse({ access_token: "long", expires_in: 5_184_000 });
    if (url.includes("/me?")) return createJsonResponse({ id: "u1", username: "polluser", name: "Poll User" });
    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase();
    const oauthStart = startBotOauth(data, "https://example.com");
    assert.ok(oauthStart.pollToken, "pollToken should be returned");

    const beforePoll = pollBotOauthSession(data, oauthStart.pollToken);
    assert.equal(beforePoll.status, "pending");

    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state") as string;
    const completed = await completeBotOauth(data, state, "code-poll-1", "https://example.com");
    assert.ok(completed.activationCode, "activationCode should be returned after completion");

    const afterPoll = pollBotOauthSession(data, oauthStart.pollToken);
    assert.equal(afterPoll.status, "authorized");
    assert.equal(afterPoll.activationCode, completed.activationCode);

    const activation = activateBotOauthSession(data, completed.activationCode);
    assert.ok(activation, "activation should succeed");
    assert.equal(activation!.sessionToken, completed.sessionToken);

    const reuse = activateBotOauthSession(data, completed.activationCode);
    assert.equal(reuse, null, "activationCode must be single-use");

    const afterActivatePoll = pollBotOauthSession(data, oauthStart.pollToken);
    assert.equal(afterActivatePoll.status, "expired", "poll after activation should return expired");
  } finally {
    globalThis.fetch = previousFetch;
    if (typeof previousAppId === "string") process.env.THREADS_BOT_APP_ID = previousAppId;
    else delete process.env.THREADS_BOT_APP_ID;
    if (typeof previousAppSecret === "string") process.env.THREADS_BOT_APP_SECRET = previousAppSecret;
    else delete process.env.THREADS_BOT_APP_SECRET;
    if (typeof previousHandle === "string") process.env.THREADS_BOT_HANDLE = previousHandle;
    else delete process.env.THREADS_BOT_HANDLE;
    if (typeof previousAdminToken === "string") process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    else delete process.env.THREADS_WEB_ADMIN_TOKEN;
  }
});

test("polling flow: OAuth provider error marks session failed, poll returns expired immediately", () => {
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousHandle = process.env.THREADS_BOT_HANDLE;

  process.env.THREADS_BOT_APP_ID = "app-id";
  process.env.THREADS_BOT_APP_SECRET = "app-secret";
  process.env.THREADS_BOT_HANDLE = "testbot";

  try {
    const data = buildDefaultDatabase();
    const oauthStart = startBotOauth(data, "https://example.com");
    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state") as string;

    failBotOauthSession(data, state);

    const pollResult = pollBotOauthSession(data, oauthStart.pollToken);
    assert.equal(pollResult.status, "expired");
  } finally {
    if (typeof previousAppId === "string") process.env.THREADS_BOT_APP_ID = previousAppId;
    else delete process.env.THREADS_BOT_APP_ID;
    if (typeof previousAppSecret === "string") process.env.THREADS_BOT_APP_SECRET = previousAppSecret;
    else delete process.env.THREADS_BOT_APP_SECRET;
    if (typeof previousHandle === "string") process.env.THREADS_BOT_HANDLE = previousHandle;
    else delete process.env.THREADS_BOT_HANDLE;
  }
});

test("polling flow: expired activationCode returns expired from poll, not pending", async () => {
  const previousAppId = process.env.THREADS_BOT_APP_ID;
  const previousAppSecret = process.env.THREADS_BOT_APP_SECRET;
  const previousHandle = process.env.THREADS_BOT_HANDLE;
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousFetch = globalThis.fetch;

  process.env.THREADS_BOT_APP_ID = "app-id";
  process.env.THREADS_BOT_APP_SECRET = "app-secret";
  process.env.THREADS_BOT_HANDLE = "testbot";
  process.env.THREADS_WEB_ADMIN_TOKEN = "test-admin-secret";

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/oauth/access_token")) return createJsonResponse({ access_token: "short", user_id: "u3", expires_in: 3600 });
    if (url.includes("/access_token?")) return createJsonResponse({ access_token: "long", expires_in: 5_184_000 });
    if (url.includes("/me?")) return createJsonResponse({ id: "u3", username: "expireduser", name: "Expired User" });
    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const data = buildDefaultDatabase();
    const oauthStart = startBotOauth(data, "https://example.com");
    const state = new URL(oauthStart.authorizeUrl).searchParams.get("state") as string;
    await completeBotOauth(data, state, "code-exp-1", "https://example.com");

    const oauthSession = data.botOauthSessions.find((s) => s.status === "completed");
    assert.ok(oauthSession);
    const expiredCode = oauthSession!.activationCode!;
    oauthSession!.activationExpiresAt = new Date(Date.now() - 1000).toISOString();

    const pollResult = pollBotOauthSession(data, oauthStart.pollToken);
    assert.equal(pollResult.status, "expired", "expired activationCode should return expired, not pending");

    const activation = activateBotOauthSession(data, expiredCode);
    assert.equal(activation, null, "expired activationCode should not activate");
  } finally {
    globalThis.fetch = previousFetch;
    if (typeof previousAppId === "string") process.env.THREADS_BOT_APP_ID = previousAppId;
    else delete process.env.THREADS_BOT_APP_ID;
    if (typeof previousAppSecret === "string") process.env.THREADS_BOT_APP_SECRET = previousAppSecret;
    else delete process.env.THREADS_BOT_APP_SECRET;
    if (typeof previousHandle === "string") process.env.THREADS_BOT_HANDLE = previousHandle;
    else delete process.env.THREADS_BOT_HANDLE;
    if (typeof previousAdminToken === "string") process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    else delete process.env.THREADS_WEB_ADMIN_TOKEN;
  }
});
