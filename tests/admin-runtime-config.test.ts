import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createWebRequestHandler } from "../packages/web-server/src/server";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

async function startTestServer(): Promise<{ server: Server; origin: string }> {
  const handler = createWebRequestHandler();
  const server = createServer((request, response) => {
    void handler(request, response);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve test server address.");
  }

  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

async function stopTestServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

test("admin runtime config can switch file databases and migrate existing data", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousRuntimeConfigFile = process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
  const previousAdminAllowlist = process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  const previousTrustedProxyAllowlist = process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-admin-runtime-"));
  const dbFileA = path.join(tempDir, "db-a.json");
  const dbFileB = path.join(tempDir, "db-b.json");
  const runtimeConfigFile = path.join(tempDir, "runtime-config.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFileA;
  process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = runtimeConfigFile;
  process.env.THREADS_WEB_ADMIN_ALLOWLIST = "10.0.0.1";
  process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = "127.0.0.1";
  replaceRuntimeConfigForTests(null);

  const { server, origin } = await startTestServer();

  try {
    const createOrder = await fetch(`${origin}/api/public/orders`, {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        buyerName: "Alice",
        buyerEmail: "alice@example.com",
        paymentMethodId: "pm-stableorder"
      })
    });
    assert.equal(createOrder.status, 201);

    const updateRuntime = await fetch(`${origin}/api/admin/runtime-config`, {
      method: "PUT",
      headers: {
        authorization: "Bearer threads-admin-secret",
        origin,
        "x-forwarded-for": "10.0.0.1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        publicOrigin: origin,
        database: {
          backend: "file",
          filePath: dbFileB
        }
      })
    });
    assert.equal(updateRuntime.status, 200);
    const runtimePayload = await updateRuntime.json() as {
      migrated?: boolean;
      databaseRestartRequired?: boolean;
      activeDatabase?: { filePath?: string };
      config?: { database?: { filePath?: string } };
    };
    assert.equal(runtimePayload.migrated, true);
    assert.equal(runtimePayload.databaseRestartRequired, true);
    assert.equal(runtimePayload.config?.database?.filePath, dbFileB);
    assert.equal(runtimePayload.activeDatabase?.filePath, dbFileA);

    const dashboardResponse = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret",
        "x-forwarded-for": "10.0.0.1"
      }
    });
    assert.equal(dashboardResponse.status, 200);
    const dashboardPayload = await dashboardResponse.json() as { orders?: Array<{ buyerEmail: string }> };
    assert.equal(dashboardPayload.orders?.length, 1);
    assert.equal(dashboardPayload.orders?.[0]?.buyerEmail, "alice@example.com");

    const migratedRaw = JSON.parse(await readFile(dbFileB, "utf8")) as { orders?: Array<{ buyerEmail: string }> };
    assert.equal(migratedRaw.orders?.length, 1);
    assert.equal(migratedRaw.orders?.[0]?.buyerEmail, "alice@example.com");
  } finally {
    await stopTestServer(server);
    if (typeof previousAdminToken === "string") {
      process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    } else {
      delete process.env.THREADS_WEB_ADMIN_TOKEN;
    }
    if (typeof previousDbFile === "string") {
      process.env.THREADS_WEB_DB_FILE = previousDbFile;
    } else {
      delete process.env.THREADS_WEB_DB_FILE;
    }
    if (typeof previousRuntimeConfigFile === "string") {
      process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = previousRuntimeConfigFile;
    } else {
      delete process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
    }
    if (typeof previousAdminAllowlist === "string") {
      process.env.THREADS_WEB_ADMIN_ALLOWLIST = previousAdminAllowlist;
    } else {
      delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
    }
    if (typeof previousTrustedProxyAllowlist === "string") {
      process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = previousTrustedProxyAllowlist;
    } else {
      delete process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
    }
    replaceRuntimeConfigForTests(null);
  }
});

test("admin can update storefront settings", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousRuntimeConfigFile = process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
  const previousAdminAllowlist = process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  const previousTrustedProxyAllowlist = process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-admin-runtime-"));
  const dbFile = path.join(tempDir, "db.json");
  const runtimeConfigFile = path.join(tempDir, "runtime-config.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = runtimeConfigFile;
  process.env.THREADS_WEB_ADMIN_ALLOWLIST = "10.0.0.1";
  process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = "127.0.0.1";
  replaceRuntimeConfigForTests(null);

  const { server, origin } = await startTestServer();

  try {
    const saveSettings = await fetch(`${origin}/api/admin/storefront-settings`, {
      method: "PUT",
      headers: {
        authorization: "Bearer threads-admin-secret",
        origin,
        "x-forwarded-for": "10.0.0.1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        productName: "Threads Saver Max",
        headline: "Archive Threads with one click.",
        heroNotes: ["One line", "Second line"],
        faqs: [
          {
            id: "faq-1",
            question: "Does it sync?",
            answer: "Yes."
          }
        ]
      })
    });
    assert.equal(saveSettings.status, 200);

    const dashboardResponse = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret",
        "x-forwarded-for": "10.0.0.1"
      }
    });
    const dashboardPayload = await dashboardResponse.json() as {
      settings?: {
        productName?: string;
        headline?: string;
        heroNotes?: string[];
        faqs?: Array<{ question: string; answer: string }>;
      };
    };

    assert.equal(dashboardPayload.settings?.productName, "Threads Saver Max");
    assert.equal(dashboardPayload.settings?.headline, "Archive Threads with one click.");
    assert.deepEqual(dashboardPayload.settings?.heroNotes, ["One line", "Second line"]);
    assert.deepEqual(dashboardPayload.settings?.faqs, [
      {
        id: "faq-1",
        question: "Does it sync?",
        answer: "Yes."
      }
    ]);
  } finally {
    await stopTestServer(server);
    if (typeof previousAdminToken === "string") {
      process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    } else {
      delete process.env.THREADS_WEB_ADMIN_TOKEN;
    }
    if (typeof previousDbFile === "string") {
      process.env.THREADS_WEB_DB_FILE = previousDbFile;
    } else {
      delete process.env.THREADS_WEB_DB_FILE;
    }
    if (typeof previousRuntimeConfigFile === "string") {
      process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = previousRuntimeConfigFile;
    } else {
      delete process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
    }
    if (typeof previousAdminAllowlist === "string") {
      process.env.THREADS_WEB_ADMIN_ALLOWLIST = previousAdminAllowlist;
    } else {
      delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
    }
    if (typeof previousTrustedProxyAllowlist === "string") {
      process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = previousTrustedProxyAllowlist;
    } else {
      delete process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
    }
    replaceRuntimeConfigForTests(null);
  }
});

test("admin runtime config redacts secrets and preserves them when blank values are resubmitted", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousRuntimeConfigFile = process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
  const previousAdminAllowlist = process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  const previousTrustedProxyAllowlist = process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-admin-runtime-"));
  const dbFile = path.join(tempDir, "db.json");
  const runtimeConfigFile = path.join(tempDir, "runtime-config.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = runtimeConfigFile;
  process.env.THREADS_WEB_ADMIN_ALLOWLIST = "10.0.0.1";
  process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = "127.0.0.1";
  replaceRuntimeConfigForTests(null);

  const { server, origin } = await startTestServer();

  try {
    const initialSave = await fetch(`${origin}/api/admin/runtime-config`, {
      method: "PUT",
      headers: {
        authorization: "Bearer threads-admin-secret",
        origin,
        "x-forwarded-for": "10.0.0.1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        publicOrigin: origin,
        database: {
          backend: "file",
          postgresUrl: "postgres://admin:super-secret@example.com:5432/threads",
          tableName: "threads_web_store",
          storeKey: "default"
        },
        smtp: {
          host: "smtp.example.com",
          port: 587,
          secure: false,
          user: "apikey",
          pass: "smtp-super-secret",
          from: "ops@example.com"
        }
      })
    });
    assert.equal(initialSave.status, 200);

    const readRuntime = await fetch(`${origin}/api/admin/runtime-config`, {
      headers: {
        authorization: "Bearer threads-admin-secret",
        "x-forwarded-for": "10.0.0.1"
      }
    });
    assert.equal(readRuntime.status, 200);
    const runtimePayload = await readRuntime.json() as {
      config?: {
        database?: { postgresUrl?: string };
        smtp?: { pass?: string };
      };
      databaseRestartRequired?: boolean;
      secretState?: {
        databasePostgresUrlConfigured?: boolean;
        smtpPassConfigured?: boolean;
      };
    };
    assert.equal(runtimePayload.config?.database?.postgresUrl, "");
    assert.equal(runtimePayload.config?.smtp?.pass, "");
    assert.equal(runtimePayload.databaseRestartRequired, false);
    assert.equal(runtimePayload.secretState?.databasePostgresUrlConfigured, true);
    assert.equal(runtimePayload.secretState?.smtpPassConfigured, true);

    const preserveSecrets = await fetch(`${origin}/api/admin/runtime-config`, {
      method: "PUT",
      headers: {
        authorization: "Bearer threads-admin-secret",
        origin,
        "x-forwarded-for": "10.0.0.1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        publicOrigin: origin,
        database: {
          backend: "file",
          postgresUrl: ""
        },
        smtp: {
          pass: ""
        }
      })
    });
    assert.equal(preserveSecrets.status, 200);

    const savedConfig = JSON.parse(await readFile(runtimeConfigFile, "utf8")) as {
      database?: { postgresUrl?: string };
      smtp?: { pass?: string };
    };
    assert.equal(savedConfig.database?.postgresUrl, "postgres://admin:super-secret@example.com:5432/threads");
    assert.equal(savedConfig.smtp?.pass, "smtp-super-secret");

    const clearSecrets = await fetch(`${origin}/api/admin/runtime-config`, {
      method: "PUT",
      headers: {
        authorization: "Bearer threads-admin-secret",
        origin,
        "x-forwarded-for": "10.0.0.1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        publicOrigin: origin,
        database: {
          backend: "file",
          postgresUrl: ""
        },
        smtp: {
          pass: ""
        },
        secretActions: {
          databasePostgresUrl: "clear",
          smtpPass: "clear"
        }
      })
    });
    assert.equal(clearSecrets.status, 200);

    const clearedConfig = JSON.parse(await readFile(runtimeConfigFile, "utf8")) as {
      database?: { postgresUrl?: string };
      smtp?: { pass?: string };
    };
    assert.equal(clearedConfig.database?.postgresUrl, "");
    assert.equal(clearedConfig.smtp?.pass, "");
  } finally {
    await stopTestServer(server);
    if (typeof previousAdminToken === "string") {
      process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    } else {
      delete process.env.THREADS_WEB_ADMIN_TOKEN;
    }
    if (typeof previousDbFile === "string") {
      process.env.THREADS_WEB_DB_FILE = previousDbFile;
    } else {
      delete process.env.THREADS_WEB_DB_FILE;
    }
    if (typeof previousRuntimeConfigFile === "string") {
      process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = previousRuntimeConfigFile;
    } else {
      delete process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
    }
    if (typeof previousAdminAllowlist === "string") {
      process.env.THREADS_WEB_ADMIN_ALLOWLIST = previousAdminAllowlist;
    } else {
      delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
    }
    if (typeof previousTrustedProxyAllowlist === "string") {
      process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = previousTrustedProxyAllowlist;
    } else {
      delete process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
    }
    replaceRuntimeConfigForTests(null);
  }
});
