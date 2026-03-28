import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  loadDatabase,
  loadDatabaseForConfig,
  saveDatabaseForConfig,
  withDatabaseTransaction,
  withExclusiveDatabaseReconfiguration
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
