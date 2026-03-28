import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { buildDefaultDatabase, type BotArchiveRecord, type BotUserRecord } from "@threads/web-schema";
import { ingestBotMention } from "../packages/web-server/src/server/bot-service";
import { readScrapbookPlusState } from "../packages/web-server/src/server/scrapbook-plus-service";

function createBotUser(overrides: Partial<BotUserRecord> = {}): BotUserRecord {
  return {
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
    plusLicenseId: null,
    plusActivatedAt: null,
    createdAt: "2026-03-28T00:00:00.000Z",
    updatedAt: "2026-03-28T00:00:00.000Z",
    lastLoginAt: "2026-03-28T00:00:00.000Z",
    status: "active",
    ...overrides
  };
}

function createArchive(index: number): BotArchiveRecord {
  return {
    id: `archive-${index}`,
    userId: "user-1",
    mentionId: `mention-${index}`,
    mentionUrl: `https://www.threads.com/@writer/post/MENTION${index}`,
    mentionAuthorHandle: "writer",
    mentionAuthorDisplayName: "Writer",
    noteText: null,
    targetUrl: `https://www.threads.com/@target/post/TARGET${index}`,
    targetAuthorHandle: "target",
    targetAuthorDisplayName: "Target",
    targetText: `Saved post ${index}`,
    targetPublishedAt: "2026-03-28T01:00:00.000Z",
    mediaUrls: [],
    markdownContent: `Saved post ${index}`,
    rawPayloadJson: null,
    archivedAt: "2026-03-28T01:00:00.000Z",
    updatedAt: "2026-03-28T01:00:00.000Z",
    status: "saved"
  };
}

test("free scrapbook blocks mention ingest after 100 saved posts", () => {
  const data = buildDefaultDatabase("2026-03-28T00:00:00.000Z");
  data.botUsers.push(createBotUser());
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
    createdAt: "2026-03-28T00:00:00.000Z",
    expiresAt: "2026-04-28T00:00:00.000Z",
    lastSeenAt: "2026-03-28T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });
  data.botArchives.push(...Array.from({ length: 100 }, (_, index) => createArchive(index + 1)));

  const result = ingestBotMention(data, {
    mentionId: "mention-overflow",
    mentionUrl: "https://www.threads.com/@writer/post/MENTION_OVERFLOW",
    mentionAuthorUserId: "threads-user-1",
    mentionAuthorHandle: "writer",
    mentionAuthorDisplayName: "Writer",
    targetUrl: "https://www.threads.com/@target/post/TARGET_OVERFLOW",
    targetAuthorHandle: "target",
    targetAuthorDisplayName: "Target",
    targetText: "This save should be blocked on Free."
  });

  assert.equal(result.ok, true);
  assert.equal(result.matched, true);
  assert.equal(result.created, false);
  assert.equal(result.reason, "limit_reached");
  assert.equal(data.botArchives.length, 100);
});

test("scrapbook plus state reports Plus limits when an active license is linked", () => {
  const data = buildDefaultDatabase("2026-03-28T00:00:00.000Z");
  data.botUsers.push(
    createBotUser({
      plusLicenseId: "license-1",
      plusActivatedAt: "2026-03-28T00:05:00.000Z"
    })
  );
  data.botSessions.push({
    id: "session-1",
    userId: "user-1",
    sessionHash: createHash("sha256").update("session-token-1").digest("hex"),
    createdAt: "2026-03-28T00:00:00.000Z",
    expiresAt: "2026-04-28T00:00:00.000Z",
    lastSeenAt: "2026-03-28T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });
  data.licenses.push({
    id: "license-1",
    orderId: "order-1",
    holderName: "Writer",
    holderEmail: "writer@example.com",
    token: "signed.token.value",
    tokenPreview: "signed...value",
    issuedAt: "2026-03-28T00:00:00.000Z",
    expiresAt: "2027-03-28T00:00:00.000Z",
    revokedAt: null,
    status: "active"
  });
  data.botArchives.push(createArchive(1));

  const state = readScrapbookPlusState(data, "session-token-1");
  assert.equal(state.plan.tier, "plus");
  assert.equal(state.plan.archiveLimit, 1000);
  assert.equal(state.plan.folderLimit, 50);
  assert.equal(state.plan.archiveCount, 1);
  assert.equal(state.plan.plusStatus, "active");
});
