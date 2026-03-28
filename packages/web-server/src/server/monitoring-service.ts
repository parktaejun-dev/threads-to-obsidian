import type {
  AdminMonitoringChannelState,
  AdminMonitoringIncidentRecord,
  AdminMonitoringOverviewResponse,
  AdminMonitoringRunCheck,
  AdminMonitoringRunRecord,
  AdminMonitoringSeverity,
  AdminMonitoringStatus,
  BotMentionCollectorStatus,
  WebDatabase
} from "@threads/web-schema";

import { buildRequestMetricsSummary } from "./request-observability";
import { getRuntimeConfigSnapshot } from "./runtime-config";
import { loadDatabase, withDatabaseTransaction } from "./store";

const AUTO_RUN_INTERVAL_MS = 10 * 60_000;
const MAX_MONITOR_RUNS = 30;
const MAX_MONITOR_INCIDENTS = 100;

let collectorStatusReader: (() => BotMentionCollectorStatus | null) | null = null;
let autoRunTimer: NodeJS.Timeout | null = null;

function byNewest<T extends { createdAt?: string; lastSeenAt?: string }>(left: T, right: T): number {
  const leftValue = left.lastSeenAt ?? left.createdAt ?? "";
  const rightValue = right.lastSeenAt ?? right.createdAt ?? "";
  return rightValue.localeCompare(leftValue);
}

function readCollectorStatus(): BotMentionCollectorStatus | null {
  try {
    return collectorStatusReader?.() ?? null;
  } catch {
    return null;
  }
}

function rankStatus(status: AdminMonitoringStatus): number {
  switch (status) {
    case "critical":
      return 3;
    case "degraded":
      return 2;
    case "healthy":
      return 1;
    default:
      return 0;
  }
}

function maxStatus(left: AdminMonitoringStatus, right: AdminMonitoringStatus): AdminMonitoringStatus {
  return rankStatus(left) >= rankStatus(right) ? left : right;
}

function statusToSeverity(status: AdminMonitoringStatus): AdminMonitoringSeverity {
  if (status === "critical") {
    return "critical";
  }
  if (status === "degraded") {
    return "warning";
  }
  return "info";
}

function isIssueStatus(status: AdminMonitoringStatus): boolean {
  return status === "critical" || status === "degraded";
}

function buildCheck(
  id: string,
  channel: AdminMonitoringRunCheck["channel"],
  label: string,
  status: AdminMonitoringStatus,
  summary: string,
  checkedAt: string
): AdminMonitoringRunCheck {
  return {
    id,
    channel,
    label,
    status,
    severity: statusToSeverity(status),
    summary,
    checkedAt
  };
}

function formatAgeSummary(timestamp: string | null): string {
  if (!timestamp) {
    return "No successful sync recorded yet.";
  }

  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageMinutes = Math.max(1, Math.round(ageMs / 60_000));
  if (ageMinutes < 60) {
    return `Last successful sync ${ageMinutes} minute${ageMinutes === 1 ? "" : "s"} ago.`;
  }

  const ageHours = Math.max(1, Math.round(ageMinutes / 60));
  return `Last successful sync ${ageHours} hour${ageHours === 1 ? "" : "s"} ago.`;
}

function evaluateChecks(data: WebDatabase, collectorStatus: BotMentionCollectorStatus | null): AdminMonitoringRunCheck[] {
  const checkedAt = new Date().toISOString();
  const runtimeConfig = getRuntimeConfigSnapshot();
  const checks: AdminMonitoringRunCheck[] = [];
  const enabledPaymentMethods = data.paymentMethods.filter((method) => method.enabled).length;

  checks.push(
    buildCheck(
      "public-storefront",
      "public_api",
      "Public storefront",
      enabledPaymentMethods > 0 ? "healthy" : "critical",
      enabledPaymentMethods > 0
        ? `${enabledPaymentMethods} payment method${enabledPaymentMethods === 1 ? " is" : "s are"} available publicly.`
        : "No payment methods are enabled for the public storefront.",
      checkedAt
    )
  );

  checks.push(
    buildCheck(
      "admin-dashboard",
      "admin_api",
      "Admin dashboard data",
      "healthy",
      `Dashboard data loaded with ${data.orders.length} order${data.orders.length === 1 ? "" : "s"} and ${data.licenses.length} license${data.licenses.length === 1 ? "" : "s"}.`,
      checkedAt
    )
  );

  const configuredBotHandle = runtimeConfig.collector.botHandle.trim();
  const collectorBotHandle = collectorStatus?.botHandle?.trim() ?? "";
  let botAccountStatus: AdminMonitoringStatus = "healthy";
  let botAccountSummary = configuredBotHandle
    ? `Public bot handle is @${configuredBotHandle}.`
    : "Collector bot handle is not configured.";

  if (!configuredBotHandle) {
    botAccountStatus = "critical";
  } else if (collectorBotHandle && collectorBotHandle !== configuredBotHandle) {
    botAccountStatus = "degraded";
    botAccountSummary = `Runtime config uses @${configuredBotHandle}, but collector status reports @${collectorBotHandle}.`;
  }

  checks.push(buildCheck("bot-account-config", "bot_account", "Bot account", botAccountStatus, botAccountSummary, checkedAt));

  let collectorHealthStatus: AdminMonitoringStatus = "unknown";
  let collectorHealthSummary = "Collector status is unavailable.";
  if (collectorStatus) {
    const staleThresholdMs = Math.max(collectorStatus.pollIntervalMs * 3, 30 * 60_000);
    collectorHealthStatus = "healthy";
    collectorHealthSummary = formatAgeSummary(collectorStatus.lastSucceededAt);

    if (!collectorStatus.enabled) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = collectorStatus.lastError
        ? `Collector is disabled: ${collectorStatus.lastError}.`
        : "Collector is disabled or missing credentials.";
    } else if (collectorStatus.lastError && !collectorStatus.lastSucceededAt) {
      collectorHealthStatus = "critical";
      collectorHealthSummary = `Collector has not succeeded yet: ${collectorStatus.lastError}.`;
    } else if (collectorStatus.lastError) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = `Collector reported an error: ${collectorStatus.lastError}.`;
    } else if (!collectorStatus.lastSucceededAt) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = "Collector is enabled but has not completed a successful sync yet.";
    } else if (Date.now() - new Date(collectorStatus.lastSucceededAt).getTime() > staleThresholdMs) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = `${formatAgeSummary(collectorStatus.lastSucceededAt)} Collector freshness exceeded the expected window.`;
    }
  }

  checks.push(
    buildCheck(
      "collector-health",
      "collector",
      "Mention collector",
      collectorHealthStatus,
      collectorHealthSummary,
      checkedAt
    )
  );

  return checks;
}

function buildRun(checks: AdminMonitoringRunCheck[]): AdminMonitoringRunRecord {
  const createdAt = new Date().toISOString();
  const overallStatus = checks.reduce<AdminMonitoringStatus>((current, check) => maxStatus(current, check.status), "unknown");
  const failingChecks = checks.filter((check) => isIssueStatus(check.status));
  const summary = failingChecks.length > 0
    ? failingChecks.map((check) => check.summary).join(" | ")
    : "All internal monitoring checks passed.";

  return {
    id: crypto.randomUUID(),
    source: "internal",
    overallStatus,
    createdAt,
    summary,
    checks
  };
}

function syncIncidentsForRun(data: WebDatabase, run: AdminMonitoringRunRecord): void {
  const now = run.createdAt;
  const activeKeys = new Set<string>();

  for (const check of run.checks) {
    if (!isIssueStatus(check.status)) {
      continue;
    }

    activeKeys.add(check.id);
    const existing = data.monitorIncidents.find((incident) => incident.dedupeKey === check.id);
    if (!existing) {
      data.monitorIncidents.push({
        id: crypto.randomUUID(),
        dedupeKey: check.id,
        channel: check.channel,
        severity: check.severity,
        status: "new",
        summary: check.summary,
        firstSeenAt: now,
        lastSeenAt: now,
        lastRunId: run.id,
        mutedUntil: null,
        note: null
      });
      continue;
    }

    const wasMuted = existing.status === "muted" && existing.mutedUntil && new Date(existing.mutedUntil).getTime() > Date.now();
    const reopen = existing.status === "resolved" || (existing.status === "muted" && !wasMuted);
    existing.channel = check.channel;
    existing.severity = check.severity;
    existing.summary = check.summary;
    existing.lastSeenAt = now;
    existing.lastRunId = run.id;
    if (reopen) {
      existing.status = "new";
      existing.firstSeenAt = now;
      existing.mutedUntil = null;
    }
  }

  for (const incident of data.monitorIncidents) {
    if (!activeKeys.has(incident.dedupeKey) && incident.status !== "resolved") {
      incident.status = "resolved";
      incident.lastSeenAt = now;
      incident.mutedUntil = null;
    }
  }

  data.monitorIncidents = [...data.monitorIncidents].sort(byNewest).slice(0, MAX_MONITOR_INCIDENTS);
}

function buildOverviewFromData(
  data: WebDatabase,
  checks = evaluateChecks(data, readCollectorStatus())
): AdminMonitoringOverviewResponse {
  const overallStatus = checks.reduce<AdminMonitoringStatus>((current, check) => maxStatus(current, check.status), "unknown");
  const recentRuns = [...data.monitorRuns].sort(byNewest).slice(0, 5);
  const lastRun = recentRuns[0] ?? null;
  const lastHealthyRun = [...data.monitorRuns].sort(byNewest).find((run) => run.overallStatus === "healthy") ?? null;
  const openIncidents = data.monitorIncidents.filter((incident) => incident.status !== "resolved");
  const channels: AdminMonitoringChannelState[] = checks.map((check) => ({
    id: check.channel,
    label: check.label,
    status: check.status,
    summary: check.summary,
    checkedAt: check.checkedAt
  }));
  const currentBotHandle = getRuntimeConfigSnapshot().collector.botHandle || readCollectorStatus()?.botHandle || "";

  return {
    overallStatus,
    openIncidents: openIncidents.length,
    criticalIncidents: openIncidents.filter((incident) => incident.severity === "critical").length,
    lastRunAt: lastRun?.createdAt ?? null,
    lastHealthyRunAt: lastHealthyRun?.createdAt ?? null,
    fallbackRatio: 0,
    policyReviewPending: 0,
    currentBotHandle,
    requestMetrics: buildRequestMetricsSummary(data.requestLogs),
    channels,
    recentRuns
  };
}

export function configureMonitoringService(options: {
  getCollectorStatus: () => BotMentionCollectorStatus | null;
}): void {
  collectorStatusReader = options.getCollectorStatus;
  if (autoRunTimer) {
    return;
  }

  autoRunTimer = setInterval(() => {
    void runMonitoringNow().catch(() => undefined);
  }, AUTO_RUN_INTERVAL_MS);
  autoRunTimer.unref?.();
}

export function stopMonitoringService(): void {
  if (autoRunTimer) {
    clearInterval(autoRunTimer);
    autoRunTimer = null;
  }
  collectorStatusReader = null;
}

export async function getMonitoringOverview(): Promise<AdminMonitoringOverviewResponse> {
  const data = await loadDatabase();
  return buildOverviewFromData(data);
}

export async function listMonitoringIncidents(): Promise<AdminMonitoringIncidentRecord[]> {
  const data = await loadDatabase();
  return [...data.monitorIncidents].sort(byNewest);
}

export async function runMonitoringNow(): Promise<AdminMonitoringOverviewResponse> {
  return withDatabaseTransaction(async (data) => {
    const checks = evaluateChecks(data, readCollectorStatus());
    const run = buildRun(checks);
    data.monitorRuns = [run, ...data.monitorRuns].sort(byNewest).slice(0, MAX_MONITOR_RUNS);
    syncIncidentsForRun(data, run);
    return buildOverviewFromData(data, checks);
  });
}

async function updateIncidentStatus(id: string, status: AdminMonitoringIncidentRecord["status"]): Promise<AdminMonitoringIncidentRecord> {
  return withDatabaseTransaction(async (data) => {
    const incident = data.monitorIncidents.find((candidate) => candidate.id === id);
    if (!incident) {
      throw new Error("Monitoring incident was not found.");
    }

    incident.status = status;
    incident.lastSeenAt = new Date().toISOString();
    if (status === "resolved") {
      incident.mutedUntil = null;
    }
    return { ...incident };
  });
}

export async function acknowledgeMonitoringIncident(id: string): Promise<AdminMonitoringIncidentRecord> {
  return updateIncidentStatus(id, "acknowledged");
}

export async function resolveMonitoringIncident(id: string): Promise<AdminMonitoringIncidentRecord> {
  return updateIncidentStatus(id, "resolved");
}
