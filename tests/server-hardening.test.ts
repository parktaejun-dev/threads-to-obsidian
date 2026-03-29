import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer, type Server } from "node:http";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createWebRequestHandler } from "../packages/web-server/src/server";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

const privateKeyFile = path.resolve(process.cwd(), "output", "dev-pro-license-private.jwk");

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

function createStripeSignature(secret: string, payload: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
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

test("public order creation is rate limited per IP", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    let finalResponse: Response | null = null;
    for (let index = 0; index < 11; index += 1) {
      finalResponse = await fetch(`${origin}/api/public/orders`, {
        method: "POST",
        headers: {
          origin,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          buyerName: `Buyer ${index}`,
          buyerEmail: `buyer-${index}@example.com`,
          paymentMethodId: "pm-stableorder"
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

test("landing and checkout pages send public security headers", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    for (const pathname of ["/landing", "/checkout"]) {
      const response = await fetch(`${origin}${pathname}`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-frame-options"), "DENY");
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
      assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
      assert.match(response.headers.get("content-security-policy") ?? "", /style-src 'self' https:\/\/cdn\.jsdelivr\.net/);
    }
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

test("stripe webhooks require a signed payload instead of plain secret equality", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousPrivateJwkFile = process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE;
  const previousStripeWebhookSecret = process.env.THREADS_WEBHOOK_SECRET_STRIPE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE = privateKeyFile;
  process.env.THREADS_WEBHOOK_SECRET_STRIPE = "whsec_test";

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
        paymentMethodId: "pm-stripe"
      })
    });
    assert.equal(createOrder.status, 201);
    const created = await createOrder.json() as { order: { id: string } };
    const payload = JSON.stringify({
      id: "evt_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1",
          customer_email: "alice@example.com",
          metadata: {
            threads_order_id: created.order.id
          }
        }
      }
    });

    const rejected = await fetch(`${origin}/api/public/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "whsec_test"
      },
      body: payload
    });
    assert.equal(rejected.status, 401);
    assert.deepEqual(await rejected.json(), { error: "Invalid webhook signature." });

    const accepted = await fetch(`${origin}/api/public/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": createStripeSignature("whsec_test", payload)
      },
      body: payload
    });
    assert.equal(accepted.status, 200);
    const acceptedBody = await accepted.json() as {
      reason: string;
      status: string;
      order?: { id: string; status: string };
      license?: { id: string } | null;
    };
    assert.equal(acceptedBody.status, "ok");
    assert.equal(acceptedBody.reason, "issued");
    assert.equal(acceptedBody.order?.id, created.order.id);
    assert.equal(acceptedBody.order?.status, "key_issued");
    assert.ok(acceptedBody.license?.id);
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
    if (typeof previousPrivateJwkFile === "string") {
      process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE = previousPrivateJwkFile;
    } else {
      delete process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE;
    }
    if (typeof previousStripeWebhookSecret === "string") {
      process.env.THREADS_WEBHOOK_SECRET_STRIPE = previousStripeWebhookSecret;
    } else {
      delete process.env.THREADS_WEBHOOK_SECRET_STRIPE;
    }
  }
});

test("paypal webhooks are verified through paypal's verification API", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousPrivateJwkFile = process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE;
  const previousPaypalClientId = process.env.THREADS_PAYPAL_CLIENT_ID;
  const previousPaypalClientSecret = process.env.THREADS_PAYPAL_CLIENT_SECRET;
  const previousPaypalWebhookId = process.env.THREADS_PAYPAL_WEBHOOK_ID;
  const previousPaypalApiBaseUrl = process.env.THREADS_PAYPAL_API_BASE_URL;
  const previousFetch = globalThis.fetch;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE = privateKeyFile;
  process.env.THREADS_PAYPAL_CLIENT_ID = "paypal-client-id";
  process.env.THREADS_PAYPAL_CLIENT_SECRET = "paypal-client-secret";
  process.env.THREADS_PAYPAL_WEBHOOK_ID = "paypal-webhook-id";
  process.env.THREADS_PAYPAL_API_BASE_URL = "https://api-m.paypal.com";

  const { server, origin } = await startTestServer();
  const nativeFetch = previousFetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith(origin)) {
      return nativeFetch(input, init);
    }

    if (url === "https://api-m.paypal.com/v1/oauth2/token") {
      return new Response(JSON.stringify({ access_token: "paypal-access-token" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }

    if (url === "https://api-m.paypal.com/v1/notifications/verify-webhook-signature") {
      const body = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { transmission_sig?: string };
      return new Response(
        JSON.stringify({
          verification_status: body.transmission_sig === "signed-paypal" ? "SUCCESS" : "FAILURE"
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" }
        }
      );
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  }) as typeof fetch;

  try {
    const createOrder = await fetch(`${origin}/api/public/orders`, {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        buyerName: "Bob",
        buyerEmail: "bob@example.com",
        paymentMethodId: "pm-paypal"
      })
    });
    assert.equal(createOrder.status, 201);
    const created = await createOrder.json() as { order: { id: string } };
    const payload = JSON.stringify({
      id: "WH-123",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "capture-1",
        invoice_id: created.order.id,
        payer: {
          email_address: "bob@example.com"
        }
      }
    });
    const headers = {
      "content-type": "application/json",
      "paypal-auth-algo": "SHA256withRSA",
      "paypal-cert-url": "https://api-m.paypal.com/certs/cert.pem",
      "paypal-transmission-id": "transmission-1",
      "paypal-transmission-time": "2026-03-28T12:00:00Z"
    };

    const rejected = await fetch(`${origin}/api/public/webhooks/paypal`, {
      method: "POST",
      headers: {
        ...headers,
        "paypal-transmission-sig": "legacy-secret"
      },
      body: payload
    });
    assert.equal(rejected.status, 401);
    assert.deepEqual(await rejected.json(), { error: "Invalid webhook signature." });

    const accepted = await fetch(`${origin}/api/public/webhooks/paypal`, {
      method: "POST",
      headers: {
        ...headers,
        "paypal-transmission-sig": "signed-paypal"
      },
      body: payload
    });
    assert.equal(accepted.status, 200);
    const acceptedBody = await accepted.json() as {
      reason: string;
      status: string;
      order?: { id: string; status: string };
      license?: { id: string } | null;
    };
    assert.equal(acceptedBody.status, "ok");
    assert.equal(acceptedBody.reason, "issued");
    assert.equal(acceptedBody.order?.id, created.order.id);
    assert.equal(acceptedBody.order?.status, "key_issued");
    assert.ok(acceptedBody.license?.id);
  } finally {
    globalThis.fetch = previousFetch;
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
    if (typeof previousPrivateJwkFile === "string") {
      process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE = previousPrivateJwkFile;
    } else {
      delete process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE;
    }
    if (typeof previousPaypalClientId === "string") {
      process.env.THREADS_PAYPAL_CLIENT_ID = previousPaypalClientId;
    } else {
      delete process.env.THREADS_PAYPAL_CLIENT_ID;
    }
    if (typeof previousPaypalClientSecret === "string") {
      process.env.THREADS_PAYPAL_CLIENT_SECRET = previousPaypalClientSecret;
    } else {
      delete process.env.THREADS_PAYPAL_CLIENT_SECRET;
    }
    if (typeof previousPaypalWebhookId === "string") {
      process.env.THREADS_PAYPAL_WEBHOOK_ID = previousPaypalWebhookId;
    } else {
      delete process.env.THREADS_PAYPAL_WEBHOOK_ID;
    }
    if (typeof previousPaypalApiBaseUrl === "string") {
      process.env.THREADS_PAYPAL_API_BASE_URL = previousPaypalApiBaseUrl;
    } else {
      delete process.env.THREADS_PAYPAL_API_BASE_URL;
    }
  }
});

test("ignored webhook events can be retried later and are tracked in the event ledger", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousPrivateJwkFile = process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE;
  const previousStripeWebhookSecret = process.env.THREADS_WEBHOOK_SECRET_STRIPE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;
  process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE = privateKeyFile;
  process.env.THREADS_WEBHOOK_SECRET_STRIPE = "whsec_test";

  const { server, origin } = await startTestServer();

  try {
    const payload = JSON.stringify({
      id: "evt_late_order",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_late",
          customer_email: "late@example.com"
        }
      }
    });

    const ignored = await fetch(`${origin}/api/public/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": createStripeSignature("whsec_test", payload)
      },
      body: payload
    });
    assert.equal(ignored.status, 200);
    const ignoredBody = await ignored.json() as { reason?: string; status?: string };
    assert.equal(ignoredBody.reason, "order_not_found");
    assert.equal(ignoredBody.status, "received");

    const createOrder = await fetch(`${origin}/api/public/orders`, {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        buyerName: "Late Buyer",
        buyerEmail: "late@example.com",
        paymentMethodId: "pm-stripe"
      })
    });
    assert.equal(createOrder.status, 201);

    const accepted = await fetch(`${origin}/api/public/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": createStripeSignature("whsec_test", payload)
      },
      body: payload
    });
    assert.equal(accepted.status, 200);
    const acceptedBody = await accepted.json() as { reason?: string; status?: string };
    assert.equal(acceptedBody.reason, "issued");
    assert.equal(acceptedBody.status, "ok");

    const dashboard = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret"
      }
    });
    assert.equal(dashboard.status, 200);
    const dashboardBody = await dashboard.json() as {
      webhookEvents?: Array<{ eventId: string; status: string; attempts: number; reason: string | null }>;
    };
    const event = dashboardBody.webhookEvents?.find((candidate) => candidate.eventId === "evt_late_order");
    assert.ok(event);
    assert.equal(event?.status, "processed");
    assert.equal(event?.attempts, 2);
    assert.equal(event?.reason, "issued");
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
    if (typeof previousPrivateJwkFile === "string") {
      process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE = previousPrivateJwkFile;
    } else {
      delete process.env.SS_THREADS_PRO_PRIVATE_JWK_FILE;
    }
    if (typeof previousStripeWebhookSecret === "string") {
      process.env.THREADS_WEBHOOK_SECRET_STRIPE = previousStripeWebhookSecret;
    } else {
      delete process.env.THREADS_WEBHOOK_SECRET_STRIPE;
    }
  }
});

test("dashboard and monitoring expose recent request metrics", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    await fetch(`${origin}/health`);
    await fetch(`${origin}/api/public/unknown`);

    for (let index = 0; index < 21; index += 1) {
      await fetch(`${origin}/api/extension/cloud/save`, {
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

    await new Promise((resolve) => setTimeout(resolve, 50));

    const dashboard = await fetch(`${origin}/api/admin/dashboard`, {
      headers: {
        authorization: "Bearer threads-admin-secret"
      }
    });
    assert.equal(dashboard.status, 200);
    const dashboardBody = await dashboard.json() as {
      requestMetrics?: {
        totalRequests: number;
        clientErrors: number;
        rateLimitedResponses: number;
      };
      recentRequests?: Array<{ pathname: string; statusCode: number }>;
    };
    assert.ok(dashboardBody.requestMetrics);
    assert.equal((dashboardBody.requestMetrics?.totalRequests ?? 0) >= 22, true);
    assert.equal((dashboardBody.requestMetrics?.clientErrors ?? 0) >= 2, true);
    assert.equal((dashboardBody.requestMetrics?.rateLimitedResponses ?? 0) >= 1, true);
    assert.equal(
      dashboardBody.recentRequests?.some(
        (entry) => entry.pathname === "/api/extension/cloud/save" && entry.statusCode === 429
      ),
      true
    );

    const overview = await fetch(`${origin}/api/admin/monitoring/overview`, {
      headers: {
        authorization: "Bearer threads-admin-secret"
      }
    });
    assert.equal(overview.status, 200);
    const overviewBody = await overview.json() as {
      requestMetrics?: {
        totalRequests: number;
        rateLimitedResponses: number;
      };
    };
    assert.equal((overviewBody.requestMetrics?.totalRequests ?? 0) >= 22, true);
    assert.equal((overviewBody.requestMetrics?.rateLimitedResponses ?? 0) >= 1, true);
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

test("public storefront responses expose cache headers and support etag revalidation", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const firstResponse = await fetch(`${origin}/api/public/storefront`);
    assert.equal(firstResponse.status, 200);
    const etag = firstResponse.headers.get("etag");
    assert.ok(etag);
    assert.match(firstResponse.headers.get("cache-control") ?? "", /stale-while-revalidate=/);

    const secondResponse = await fetch(`${origin}/api/public/storefront`, {
      headers: {
        "if-none-match": etag ?? ""
      }
    });
    assert.equal(secondResponse.status, 304);
    assert.equal(secondResponse.headers.get("etag"), etag);
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

test("checkout page responses expose cache headers and support etag revalidation", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const firstResponse = await fetch(`${origin}/checkout`);
    assert.equal(firstResponse.status, 200);
    const etag = firstResponse.headers.get("etag");
    assert.ok(etag);
    assert.match(firstResponse.headers.get("cache-control") ?? "", /stale-while-revalidate=/);

    const secondResponse = await fetch(`${origin}/checkout`, {
      headers: {
        "if-none-match": etag ?? ""
      }
    });
    assert.equal(secondResponse.status, 304);
    assert.equal(secondResponse.headers.get("etag"), etag);
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

test("storefront cache updates immediately after admin settings changes", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-server-hardening-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  const { server, origin } = await startTestServer();

  try {
    const adminCookie = await loginAdminSession(origin);
    const updateResponse = await fetch(`${origin}/api/admin/storefront-settings`, {
      method: "PUT",
      headers: {
        origin,
        cookie: adminCookie,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        headline: "Updated headline for cache"
      })
    });
    assert.equal(updateResponse.status, 200);

    const storefrontResponse = await fetch(`${origin}/api/public/storefront`);
    assert.equal(storefrontResponse.status, 200);
    const storefrontBody = await storefrontResponse.json() as {
      settings?: {
        headline?: string;
      };
    };
    assert.equal(storefrontBody.settings?.headline, "Updated headline for cache");
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
