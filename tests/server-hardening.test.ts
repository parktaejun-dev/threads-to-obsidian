import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createWebRequestHandler } from "../packages/web-server/src/server";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

async function startTestServer(): Promise<{ server: Server; origin: string }> {
  replaceRuntimeConfigForTests(null);
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

async function loginAdminSession(
  origin: string,
  options: {
    adminToken?: string;
    forwardedFor?: string;
  } = {}
): Promise<string> {
  const response = await fetch(`${origin}/api/admin/session/login`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      ...(options.forwardedFor ? { "x-forwarded-for": options.forwardedFor } : {})
    },
    body: JSON.stringify({
      token: options.adminToken ?? "threads-admin-secret"
    })
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie");
  assert.ok(cookie);
  return cookie.split(";")[0] ?? cookie;
}

test("mutating public routes reject requests without an Origin header", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/public/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        buyerName: "Alice",
        buyerEmail: "alice@example.com",
        paymentMethodId: "pm-stableorder"
      })
    });

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Origin header is required." });
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
  }
});

test("production startup rejects file-backed runtime databases", () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousStoreBackend = process.env.THREADS_WEB_STORE_BACKEND;
  const previousPostgresUrl = process.env.THREADS_WEB_POSTGRES_URL;

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.NODE_ENV = "production";
  delete process.env.THREADS_WEB_STORE_BACKEND;
  delete process.env.THREADS_WEB_POSTGRES_URL;
  replaceRuntimeConfigForTests(null);

  try {
    assert.throws(
      () => createWebRequestHandler(),
      /THREADS_WEB_STORE_BACKEND=postgres/
    );
  } finally {
    if (typeof previousAdminToken === "string") {
      process.env.THREADS_WEB_ADMIN_TOKEN = previousAdminToken;
    } else {
      delete process.env.THREADS_WEB_ADMIN_TOKEN;
    }
    if (typeof previousNodeEnv === "string") {
      process.env.NODE_ENV = previousNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
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
    replaceRuntimeConfigForTests(null);
  }
});

test("JSON endpoints require application/json content types", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/public/orders`, {
      method: "POST",
      headers: {
        origin,
        "content-type": "text/plain"
      },
      body: JSON.stringify({
        buyerName: "Alice",
        buyerEmail: "alice@example.com",
        paymentMethodId: "pm-stableorder"
      })
    });

    assert.equal(response.status, 415);
    assert.deepEqual(await response.json(), { error: "Content-Type must be application/json." });
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
  }
});

test("trusted browser extension origins can call extension-backed JSON endpoints", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/public/licenses/status`, {
      method: "POST",
      headers: {
        origin: "chrome-extension://test-extension-id",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        token: "invalid-token",
        deviceId: "device-1",
        deviceLabel: "Test device"
      })
    });

    const payload = await response.json() as { error?: string; ok?: boolean; reason?: string };
    assert.equal(response.status, 403);
    assert.notEqual(payload.error, "Origin is not allowed.");
    assert.equal(payload.ok, false);
    assert.equal(payload.reason, "invalid");
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
  }
});

test("admin routes can be restricted by IP allowlist", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousAllowlist = process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.THREADS_WEB_ADMIN_ALLOWLIST = "10.0.0.1";

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret"
      }
    });

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Admin access is not allowed from this IP." });
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
    if (typeof previousAllowlist === "string") {
      process.env.THREADS_WEB_ADMIN_ALLOWLIST = previousAllowlist;
    } else {
      delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
    }
  }
});

test("admin routes default to loopback-only access when no allowlist is configured", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousAllowlist = process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  const previousTrustedProxyAllowlist = process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  delete process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret",
        "x-forwarded-for": "10.0.0.2"
      }
    });

    assert.equal(response.status, 200);
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
    if (typeof previousAllowlist === "string") {
      process.env.THREADS_WEB_ADMIN_ALLOWLIST = previousAllowlist;
    } else {
      delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
    }
    if (typeof previousTrustedProxyAllowlist === "string") {
      process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = previousTrustedProxyAllowlist;
    } else {
      delete process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
    }
  }
});

test("admin IP allowlist only trusts X-Forwarded-For when the proxy is trusted", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousAllowlist = process.env.THREADS_WEB_ADMIN_ALLOWLIST;
  const previousTrustedProxyAllowlist = process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.THREADS_WEB_ADMIN_ALLOWLIST = "10.0.0.1";
  process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = "127.0.0.1";

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret",
        origin,
        "x-forwarded-for": "10.0.0.2"
      }
    });

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Admin access is not allowed from this IP." });
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
    if (typeof previousAllowlist === "string") {
      process.env.THREADS_WEB_ADMIN_ALLOWLIST = previousAllowlist;
    } else {
      delete process.env.THREADS_WEB_ADMIN_ALLOWLIST;
    }
    if (typeof previousTrustedProxyAllowlist === "string") {
      process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST = previousTrustedProxyAllowlist;
    } else {
      delete process.env.THREADS_WEB_TRUST_PROXY_ALLOWLIST;
    }
  }
});

test("admin session login issues an HttpOnly cookie that can access admin APIs", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const cookie = await loginAdminSession(origin);
    const dashboardResponse = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        cookie,
        origin
      }
    });
    assert.equal(dashboardResponse.status, 200);

    const logoutResponse = await fetch(`${origin}/api/admin/session/logout`, {
      method: "POST",
      headers: {
        cookie,
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({})
    });
    assert.equal(logoutResponse.status, 200);

    const clearedCookie = logoutResponse.headers.get("set-cookie") ?? "";
    assert.match(clearedCookie, /threads_admin_session=/);
    assert.match(clearedCookie, /HttpOnly/i);
    assert.match(clearedCookie, /SameSite=Strict/i);
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
  }
});

test("extension cloud save is rate limited per token", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    let finalResponse: Response | null = null;
    for (let index = 0; index < 21; index += 1) {
      finalResponse = await fetch(`${origin}/api/extension/cloud/save`, {
        method: "POST",
        headers: {
          origin: "chrome-extension://test-extension-id",
          authorization: "Bearer ext-token-1",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          token: "pro-token",
          deviceId: "device-1",
          deviceLabel: "Test device",
          post: {}
        })
      });
    }

    assert.ok(finalResponse);
    assert.equal(finalResponse.status, 429);
    assert.deepEqual(await finalResponse.json(), { error: "Too many requests. Try again soon." });
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
  }
});

test("legacy public cloud save route is retired", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const response = await fetch(`${origin}/api/public/bot/cloud/save`, {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({})
    });

    assert.equal(response.status, 410);
    assert.deepEqual(await response.json(), {
      error: "Legacy cloud save is no longer supported. Reconnect the extension and use the current cloud save flow."
    });
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
  }
});
