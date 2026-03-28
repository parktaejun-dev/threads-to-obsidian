import test from "node:test";
import assert from "node:assert/strict";

import { buildDefaultDatabase } from "@threads/web-schema";
import {
  appendRequestLog,
  buildRequestMetricsSummary
} from "../packages/web-server/src/server/request-observability";

test("request metrics summary counts statuses, request classes, and latency percentiles", () => {
  const data = buildDefaultDatabase("2026-03-28T00:00:00.000Z");

  appendRequestLog(data, {
    requestId: "req-1",
    method: "GET",
    pathname: "/health",
    category: "health",
    statusCode: 200,
    durationMs: 12,
    startedAt: "2026-03-28T00:00:00.000Z",
    completedAt: "2026-03-28T00:00:00.012Z"
  });
  appendRequestLog(data, {
    requestId: "req-2",
    method: "POST",
    pathname: "/api/public/webhooks/stripe",
    category: "webhook",
    statusCode: 200,
    durationMs: 48,
    startedAt: "2026-03-28T00:01:00.000Z",
    completedAt: "2026-03-28T00:01:00.048Z"
  });
  appendRequestLog(data, {
    requestId: "req-3",
    method: "GET",
    pathname: "/api/admin/dashboard",
    category: "admin_api",
    statusCode: 500,
    durationMs: 120,
    startedAt: "2026-03-28T00:02:00.000Z",
    completedAt: "2026-03-28T00:02:00.120Z"
  });
  appendRequestLog(data, {
    requestId: "req-4",
    method: "POST",
    pathname: "/api/extension/cloud/save",
    category: "extension_api",
    statusCode: 429,
    durationMs: 90,
    startedAt: "2026-03-28T00:03:00.000Z",
    completedAt: "2026-03-28T00:03:00.090Z"
  });

  const summary = buildRequestMetricsSummary(data.requestLogs);
  assert.equal(summary.totalRequests, 4);
  assert.equal(summary.successResponses, 2);
  assert.equal(summary.clientErrors, 1);
  assert.equal(summary.serverErrors, 1);
  assert.equal(summary.rateLimitedResponses, 1);
  assert.equal(summary.webhookRequests, 1);
  assert.equal(summary.adminRequests, 1);
  assert.equal(summary.averageDurationMs, 68);
  assert.equal(summary.p95DurationMs, 120);
  assert.equal(summary.lastRequestAt, "2026-03-28T00:03:00.090Z");
});
