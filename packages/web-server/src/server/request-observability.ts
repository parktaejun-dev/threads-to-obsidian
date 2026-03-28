import type {
  RequestLogCategory,
  RequestLogRecord,
  RequestMetricsSummary,
  WebDatabase
} from "@threads/web-schema";

const MAX_REQUEST_LOGS = 500;

function trimEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

function requestLogsToStdoutEnabled(): boolean {
  const raw = trimEnv("THREADS_WEB_STRUCTURED_REQUEST_LOGS");
  return raw === "1" || raw === "true" || raw === "yes";
}

export function classifyRequestCategory(pathname: string): RequestLogCategory {
  if (pathname === "/health" || pathname === "/ready") {
    return "health";
  }
  if (pathname.startsWith("/api/public/webhooks/")) {
    return "webhook";
  }
  if (pathname.startsWith("/api/admin/")) {
    return "admin_api";
  }
  if (pathname.startsWith("/api/extension/")) {
    return "extension_api";
  }
  return "public_api";
}

export function shouldPersistRequestLog(pathname: string): boolean {
  return pathname === "/health" || pathname === "/ready" || pathname.startsWith("/api/");
}

export function appendRequestLog(
  data: WebDatabase,
  event: Omit<RequestLogRecord, "id">
): RequestLogRecord {
  const requestLog: RequestLogRecord = {
    id: crypto.randomUUID(),
    ...event
  };
  data.requestLogs.unshift(requestLog);
  data.requestLogs = data.requestLogs
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
    .slice(0, MAX_REQUEST_LOGS);
  return requestLog;
}

export function buildRequestMetricsSummary(logs: RequestLogRecord[]): RequestMetricsSummary {
  const sortedLogs = [...logs].sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  const durations = sortedLogs
    .map((entry) => entry.durationMs)
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((left, right) => left - right);
  const now = Date.now();
  const lastHourRequests = logs.filter((entry) => now - new Date(entry.startedAt).getTime() <= 60 * 60_000);
  const totalDuration = durations.reduce((sum, value) => sum + value, 0);
  const p95Index = durations.length === 0 ? -1 : Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1);

  return {
    totalRequests: logs.length,
    lastHourRequests: lastHourRequests.length,
    successResponses: logs.filter((entry) => entry.statusCode >= 200 && entry.statusCode < 400).length,
    clientErrors: logs.filter((entry) => entry.statusCode >= 400 && entry.statusCode < 500).length,
    serverErrors: logs.filter((entry) => entry.statusCode >= 500).length,
    rateLimitedResponses: logs.filter((entry) => entry.statusCode === 429).length,
    webhookRequests: logs.filter((entry) => entry.category === "webhook").length,
    adminRequests: logs.filter((entry) => entry.category === "admin_api").length,
    averageDurationMs: durations.length === 0 ? 0 : Math.round(totalDuration / durations.length),
    p95DurationMs: p95Index < 0 ? 0 : durations[p95Index] ?? 0,
    lastRequestAt: logs[0]?.completedAt ?? null
  };
}

export function listRecentRequestLogs(logs: RequestLogRecord[], limit = 50): RequestLogRecord[] {
  return [...logs]
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
    .slice(0, limit);
}

export function emitStructuredRequestLog(log: Omit<RequestLogRecord, "id">): void {
  if (!requestLogsToStdoutEnabled()) {
    return;
  }

  console.info(JSON.stringify({
    kind: "request",
    ...log
  }));
}
