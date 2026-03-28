import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { createWebRequestHandler } from "../packages/web-server/src/server";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";
import type {
  AdminMonitoringIncidentRecord,
  AdminMonitoringOverviewResponse
} from "@threads/web-schema";

async function startTestServer(): Promise<{ server: import("node:http").Server; origin: string }> {
  const handler = createWebRequestHandler();
  const server = createServer((request, response) => {
    void handler(request, response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind test server.");
  }
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

async function stopTestServer(server: import("node:http").Server): Promise<void> {
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

async function loginAdminSession(origin: string): Promise<string> {
  const response = await fetch(`${origin}/api/admin/session/login`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json"
    },
    body: JSON.stringify({ token: "threads-admin-secret" })
  });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie") ?? "";
}

test("monitoring run raises and resolves the bot handle incident", async () => {
  const previousAdminToken = process.env.THREADS_WEB_ADMIN_TOKEN;
  const previousDbFile = process.env.THREADS_WEB_DB_FILE;
  const previousRuntimeConfigFile = process.env.THREADS_WEB_RUNTIME_CONFIG_FILE;
  const previousBotHandle = process.env.THREADS_BOT_HANDLE;
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-admin-monitoring-"));

  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = path.join(tempDir, "db.json");
  process.env.THREADS_WEB_RUNTIME_CONFIG_FILE = path.join(tempDir, "runtime-config.json");
  delete process.env.THREADS_BOT_HANDLE;
  replaceRuntimeConfigForTests(null);

  const { server, origin } = await startTestServer();

  try {
    const cookie = await loginAdminSession(origin);

    const initialOverviewResponse = await fetch(`${origin}/api/admin/monitoring/overview`, {
      headers: {
        cookie,
        origin
      }
    });
    assert.equal(initialOverviewResponse.status, 200);
    const initialOverview = await initialOverviewResponse.json() as AdminMonitoringOverviewResponse;
    assert.equal(initialOverview.openIncidents, 0);
    assert.equal(initialOverview.overallStatus, "critical");

    const runResponse = await fetch(`${origin}/api/admin/monitoring/run-now`, {
      method: "POST",
      headers: {
        cookie,
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({})
    });
    assert.equal(runResponse.status, 200);
    const runOverview = await runResponse.json() as AdminMonitoringOverviewResponse;
    assert.equal(runOverview.openIncidents, 1);
    assert.equal(runOverview.criticalIncidents, 1);

    const incidentsResponse = await fetch(`${origin}/api/admin/monitoring/incidents`, {
      headers: {
        cookie,
        origin
      }
    });
    assert.equal(incidentsResponse.status, 200);
    const incidents = await incidentsResponse.json() as AdminMonitoringIncidentRecord[];
    const botHandleIncident = incidents.find((incident) => incident.dedupeKey === "bot-account-config");
    assert.ok(botHandleIncident);
    assert.equal(botHandleIncident?.status, "new");

    const acknowledgeResponse = await fetch(`${origin}/api/admin/monitoring/incidents/${botHandleIncident?.id}/ack`, {
      method: "POST",
      headers: {
        cookie,
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({})
    });
    assert.equal(acknowledgeResponse.status, 200);

    const updateRuntimeResponse = await fetch(`${origin}/api/admin/runtime-config`, {
      method: "PUT",
      headers: {
        cookie,
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        collector: {
          botHandle: "@OpsBot"
        }
      })
    });
    assert.equal(updateRuntimeResponse.status, 200);

    const rerunResponse = await fetch(`${origin}/api/admin/monitoring/run-now`, {
      method: "POST",
      headers: {
        cookie,
        origin,
        "content-type": "application/json"
      },
      body: JSON.stringify({})
    });
    assert.equal(rerunResponse.status, 200);

    const finalIncidentsResponse = await fetch(`${origin}/api/admin/monitoring/incidents`, {
      headers: {
        cookie,
        origin
      }
    });
    assert.equal(finalIncidentsResponse.status, 200);
    const finalIncidents = await finalIncidentsResponse.json() as AdminMonitoringIncidentRecord[];
    const resolvedIncident = finalIncidents.find((incident) => incident.dedupeKey === "bot-account-config");
    assert.equal(resolvedIncident?.status, "resolved");
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
    if (typeof previousBotHandle === "string") {
      process.env.THREADS_BOT_HANDLE = previousBotHandle;
    } else {
      delete process.env.THREADS_BOT_HANDLE;
    }
    replaceRuntimeConfigForTests(null);
  }
});
