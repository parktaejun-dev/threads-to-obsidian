import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { getRuntimeConfigSnapshot, replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

test("runtime config does not auto-select postgres from generic DATABASE_URL", () => {
  const previousStoreBackend = process.env.THREADS_WEB_STORE_BACKEND;
  const previousPostgresUrl = process.env.THREADS_WEB_POSTGRES_URL;
  const previousWebDatabaseUrl = process.env.THREADS_WEB_DATABASE_URL;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousRuntimeConfigFile = process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;

  const runtimeDirPromise = mkdtemp(path.join(tmpdir(), "threads-runtime-config-"));

  return runtimeDirPromise.then((runtimeDir) => {
    process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = path.join(runtimeDir, "runtime-config.json");
    process.env.DATABASE_URL = "postgres://generic:secret@example.com:5432/threads";
    delete process.env.THREADS_WEB_STORE_BACKEND;
    delete process.env.THREADS_WEB_POSTGRES_URL;
    delete process.env.THREADS_WEB_DATABASE_URL;
    replaceRuntimeConfigForTests(null);

    try {
      const snapshot = getRuntimeConfigSnapshot();
      assert.equal(snapshot.database.backend, "file");
      assert.equal(snapshot.database.postgresUrl, "");
    } finally {
      if (typeof previousRuntimeConfigFile === "string") {
        process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = previousRuntimeConfigFile;
      } else {
        delete process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
      }
      replaceRuntimeConfigForTests(null);
    }
  }).finally(() => {
    if (typeof previousStoreBackend === "string") {
      process.env.THREADS_WEB_STORE_BACKEND = previousStoreBackend;
    } else {
      delete process.env.THREADS_WEB_STORE_BACKEND;
    }
    if (typeof previousPostgresUrl === "string") {
      process.env.THREADS_WEB_POSTGRES_URL = previousPostgresUrl;
    } else {
      delete process.env.THREADS_WEB_POSTGRES_URL;
    }
    if (typeof previousWebDatabaseUrl === "string") {
      process.env.THREADS_WEB_DATABASE_URL = previousWebDatabaseUrl;
    } else {
      delete process.env.THREADS_WEB_DATABASE_URL;
    }
    if (typeof previousDatabaseUrl === "string") {
      process.env.DATABASE_URL = previousDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  });
});

test("runtime config only uses explicit web postgres settings", () => {
  const previousStoreBackend = process.env.THREADS_WEB_STORE_BACKEND;
  const previousPostgresUrl = process.env.THREADS_WEB_POSTGRES_URL;
  const previousWebDatabaseUrl = process.env.THREADS_WEB_DATABASE_URL;
  const previousRuntimeConfigFile = process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;

  const runtimeDirPromise = mkdtemp(path.join(tmpdir(), "threads-runtime-config-"));

  return runtimeDirPromise.then((runtimeDir) => {
    process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = path.join(runtimeDir, "runtime-config.json");
    process.env.THREADS_WEB_STORE_BACKEND = "postgres";
    process.env.THREADS_WEB_POSTGRES_URL = "postgres://threads:secret@example.com:5432/threads";
    delete process.env.THREADS_WEB_DATABASE_URL;
    replaceRuntimeConfigForTests(null);

    try {
      const snapshot = getRuntimeConfigSnapshot();
      assert.equal(snapshot.database.backend, "postgres");
      assert.equal(snapshot.database.postgresUrl, "postgres://threads:secret@example.com:5432/threads");
    } finally {
      if (typeof previousRuntimeConfigFile === "string") {
        process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = previousRuntimeConfigFile;
      } else {
        delete process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
      }
      replaceRuntimeConfigForTests(null);
    }
  }).finally(() => {
    if (typeof previousStoreBackend === "string") {
      process.env.THREADS_WEB_STORE_BACKEND = previousStoreBackend;
    } else {
      delete process.env.THREADS_WEB_STORE_BACKEND;
    }
    if (typeof previousPostgresUrl === "string") {
      process.env.THREADS_WEB_POSTGRES_URL = previousPostgresUrl;
    } else {
      delete process.env.THREADS_WEB_POSTGRES_URL;
    }
    if (typeof previousWebDatabaseUrl === "string") {
      process.env.THREADS_WEB_DATABASE_URL = previousWebDatabaseUrl;
    } else {
      delete process.env.THREADS_WEB_DATABASE_URL;
    }
  });
});
