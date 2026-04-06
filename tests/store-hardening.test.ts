import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  claimBotMentionJobs,
  loadDatabase,
  loadDatabaseForConfig,
  saveDatabaseForConfig,
  withBotAuthDatabaseReadTransaction,
  withBotAuthDatabaseTransaction,
  withDatabaseTransaction,
  withExclusiveDatabaseReconfiguration,
  withUserScopedDatabaseReadTransaction
} from "../packages/web-server/src/server/store";

test("loadDatabase initializes a default database only when the file is missing", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-store-hardening-"));
  const filePath = path.join(tempDir, "web-admin-data.json");

  const database = await loadDatabase(filePath);
  const persisted = JSON.parse(await readFile(filePath, "utf8")) as { paymentMethods?: unknown[]; orders?: unknown[] };

  assert.ok(Array.isArray(database.paymentMethods));
  assert.ok(database.paymentMethods.length > 0);
  assert.ok(Array.isArray(persisted.paymentMethods));
  assert.ok(Array.isArray(persisted.orders));
});

test("loadDatabase preserves a corrupt database file instead of replacing it", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-store-hardening-"));
  const filePath = path.join(tempDir, "web-admin-data.json");
  const invalidJson = "{\"orders\": [}";

  await writeFile(filePath, invalidJson, "utf8");

  await assert.rejects(async () => await loadDatabase(filePath), SyntaxError);
  assert.equal(await readFile(filePath, "utf8"), invalidJson);
});

test("exclusive database reconfiguration waits for in-flight writes before migrating", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-store-hardening-"));
  const filePathA = path.join(tempDir, "web-admin-a.json");
  const filePathB = path.join(tempDir, "web-admin-b.json");

  await loadDatabase(filePathA);

  let releaseWrite!: () => void;
  const writeHeld = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  let transactionEntered!: () => void;
  const transactionStarted = new Promise<void>((resolve) => {
    transactionEntered = resolve;
  });

  const writeOperation = withDatabaseTransaction(async (database) => {
    database.orders.push({
      id: "order-1",
      buyerName: "Alice",
      buyerEmail: "alice@example.com",
      paymentMethodId: "pm-stableorder",
      status: "pending",
      note: "",
      createdAt: "2026-03-26T00:00:00.000Z",
      updatedAt: "2026-03-26T00:00:00.000Z",
      paidAt: null,
      issuedLicenseId: null,
      deliveryStatus: "not_sent"
    });
    transactionEntered();
    await writeHeld;
  }, filePathA);

  await transactionStarted;

  let migrationFinished = false;
  const fileConfigA = {
    backend: "file" as const,
    filePath: filePathA,
    postgresUrl: "",
    tableName: "threads_web_store",
    storeKey: "default"
  };
  const fileConfigB = {
    ...fileConfigA,
    filePath: filePathB
  };
  const migration = withExclusiveDatabaseReconfiguration(async () => {
    const currentData = await loadDatabaseForConfig(fileConfigA);
    await saveDatabaseForConfig(currentData, fileConfigB);
    migrationFinished = true;
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(migrationFinished, false);

  releaseWrite();
  await Promise.all([writeOperation, migration]);

  const migrated = await loadDatabase(filePathB);
  assert.equal(migrated.orders.length, 1);
  assert.equal(migrated.orders[0]?.buyerEmail, "alice@example.com");
});

test("bot auth read transactions do not persist file-backed changes", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-store-hardening-"));
  const filePath = path.join(tempDir, "web-admin-data.json");

  await withBotAuthDatabaseTransaction((database) => {
    database.botUsers.push({
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
      status: "active",
      lastLoginAt: "2026-03-31T00:00:00.000Z",
      grantedScopes: [],
      scopeVersion: 2,
      lastScopeUpgradeAt: null,
      createdAt: "2026-03-31T00:00:00.000Z",
      updatedAt: "2026-03-31T00:00:00.000Z"
    });
  }, filePath);

  await withBotAuthDatabaseReadTransaction((database) => {
    database.botUsers[0]!.threadsHandle = "changed-in-read";
  }, filePath);

  const reloaded = await loadDatabase(filePath);
  assert.equal(reloaded.botUsers[0]?.threadsHandle, "writer");
});

test("user-scoped read transactions do not persist file-backed changes", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-store-hardening-"));
  const filePath = path.join(tempDir, "web-admin-data.json");

  await withBotAuthDatabaseTransaction((database) => {
    database.botUsers.push({
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
      status: "active",
      lastLoginAt: "2026-03-31T00:00:00.000Z",
      grantedScopes: [],
      scopeVersion: 2,
      lastScopeUpgradeAt: null,
      createdAt: "2026-03-31T00:00:00.000Z",
      updatedAt: "2026-03-31T00:00:00.000Z"
    });
    database.botArchives.push({
      id: "archive-1",
      userId: "user-1",
      mentionId: "mention-1",
      mentionUrl: "https://threads.net/@writer/post/1",
      mentionAuthorHandle: "writer",
      mentionAuthorDisplayName: "Writer",
      noteText: null,
      targetUrl: "https://threads.net/@target/post/2",
      targetAuthorHandle: "target",
      targetAuthorDisplayName: "Target",
      targetText: "Archived post",
      targetPublishedAt: "2026-03-31T00:00:00.000Z",
      mediaUrls: [],
      rawPayloadJson: null,
      markdownContent: "# Archived post",
      status: "saved",
      archivedAt: "2026-03-31T00:00:00.000Z",
      updatedAt: "2026-03-31T00:00:00.000Z"
    });
  }, filePath);

  await withUserScopedDatabaseReadTransaction("user-1", (database) => {
    database.botArchives[0]!.targetText = "changed-in-read";
  }, filePath);

  const reloaded = await loadDatabase(filePath);
  assert.equal(reloaded.botArchives[0]?.targetText, "Archived post");
});

test("claimBotMentionJobs keeps oldest jobs first by default and can prioritize newest jobs for user syncs", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-store-hardening-"));
  const filePath = path.join(tempDir, "web-admin-data.json");

  await withDatabaseTransaction((database) => {
    database.botMentionJobs.push(
      {
        id: "job-old",
        mentionId: "mention-old",
        mentionUrl: "https://www.threads.com/@writer/post/OLD",
        mentionAuthorHandle: "writer",
        mentionAuthorUserId: "threads-user-1",
        mentionText: "@collectorbot old",
        mentionPublishedAt: "2026-03-31T00:00:00.000Z",
        rawSummaryJson: null,
        attempts: 0,
        status: "queued",
        lastError: null,
        availableAt: "2026-03-31T00:00:00.000Z",
        leasedAt: null,
        processedAt: null,
        createdAt: "2026-03-31T00:00:00.000Z",
        updatedAt: "2026-03-31T00:00:00.000Z"
      },
      {
        id: "job-new",
        mentionId: "mention-new",
        mentionUrl: "https://www.threads.com/@writer/post/NEW",
        mentionAuthorHandle: "writer",
        mentionAuthorUserId: "threads-user-1",
        mentionText: "@collectorbot new",
        mentionPublishedAt: "2026-03-31T00:05:00.000Z",
        rawSummaryJson: null,
        attempts: 0,
        status: "queued",
        lastError: null,
        availableAt: "2026-03-31T00:05:00.000Z",
        leasedAt: null,
        processedAt: null,
        createdAt: "2026-03-31T00:05:00.000Z",
        updatedAt: "2026-03-31T00:05:00.000Z"
      }
    );
  }, filePath);

  const oldestFirst = await claimBotMentionJobs("2026-03-31T01:00:00.000Z", 1, 60_000, filePath);
  assert.equal(oldestFirst[0]?.mentionId, "mention-old");

  const newestFirst = await claimBotMentionJobs("2026-03-31T01:00:00.000Z", 1, 60_000, filePath, {
    order: "newest"
  });
  assert.equal(newestFirst[0]?.mentionId, "mention-new");
});
