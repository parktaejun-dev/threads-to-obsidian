import type {
  AdminMonitoringIncidentRecord,
  AdminMonitoringOverviewResponse
} from "@threads/web-schema";

type UiStrings = {
  authRequired: string;
  loading: string;
  loadFailed: string;
  refreshDone: string;
  runStarted: string;
  runDone: string;
  incidentsTitle: string;
  noIncidents: string;
  noRuns: string;
  noChannels: string;
  overallHealth: string;
  openIncidents: string;
  criticalIncidents: string;
  currentBotHandle: string;
  lastRun: string;
  lastHealthyRun: string;
  fallbackRatio: string;
  policyReviewPending: string;
  never: string;
  notConfigured: string;
  recentRuns: string;
  channels: string;
  acknowledged: string;
  resolved: string;
  acknowledge: string;
  resolve: string;
  unknown: string;
};

const strings: Record<"en" | "ko", UiStrings> = {
  en: {
    authRequired: "Sign in to load monitoring.",
    loading: "Loading monitoring...",
    loadFailed: "Failed to load monitoring.",
    refreshDone: "Monitoring refreshed.",
    runStarted: "Running internal checks...",
    runDone: "Monitoring checks completed.",
    incidentsTitle: "Incidents",
    noIncidents: "No monitoring incidents recorded.",
    noRuns: "No monitoring runs yet.",
    noChannels: "No channel health data yet.",
    overallHealth: "Overall health",
    openIncidents: "Open incidents",
    criticalIncidents: "Critical incidents",
    currentBotHandle: "Current bot handle",
    lastRun: "Last run",
    lastHealthyRun: "Last healthy run",
    fallbackRatio: "Fallback ratio",
    policyReviewPending: "Policy review pending",
    never: "Never",
    notConfigured: "Not configured",
    recentRuns: "Recent runs",
    channels: "Channel health",
    acknowledged: "Acknowledged",
    resolved: "Resolved",
    acknowledge: "Acknowledge",
    resolve: "Resolve",
    unknown: "Unknown"
  },
  ko: {
    authRequired: "로그인 후 모니터링을 불러올 수 있습니다.",
    loading: "모니터링을 불러오는 중입니다...",
    loadFailed: "모니터링을 불러오지 못했습니다.",
    refreshDone: "모니터링을 새로고침했습니다.",
    runStarted: "내부 점검을 실행하는 중입니다...",
    runDone: "모니터링 점검이 완료됐습니다.",
    incidentsTitle: "인시던트",
    noIncidents: "기록된 모니터링 인시던트가 없습니다.",
    noRuns: "아직 모니터링 실행 기록이 없습니다.",
    noChannels: "채널 상태 데이터가 아직 없습니다.",
    overallHealth: "전체 상태",
    openIncidents: "열린 인시던트",
    criticalIncidents: "치명 인시던트",
    currentBotHandle: "현재 봇 핸들",
    lastRun: "마지막 실행",
    lastHealthyRun: "마지막 정상 실행",
    fallbackRatio: "폴백 비율",
    policyReviewPending: "정책 검토 대기",
    never: "없음",
    notConfigured: "미설정",
    recentRuns: "최근 실행",
    channels: "채널 상태",
    acknowledged: "확인됨",
    resolved: "해결됨",
    acknowledge: "확인",
    resolve: "해결 처리",
    unknown: "알 수 없음"
  }
};

const root = document.getElementById("monitoring-root") as HTMLDivElement | null;
const statusEl = document.getElementById("monitoring-status") as HTMLParagraphElement | null;
const refreshButton = document.getElementById("monitoring-refresh") as HTMLButtonElement | null;
const runButton = document.getElementById("monitoring-run") as HTMLButtonElement | null;

let overview: AdminMonitoringOverviewResponse | null = null;
let incidents: AdminMonitoringIncidentRecord[] = [];
let loading = false;

function ui(): UiStrings {
  return document.documentElement.lang.startsWith("ko") ? strings.ko : strings.en;
}

function setStatus(message: string, state: "success" | "warning" | "error" | "idle" = "idle"): void {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message;
  if (state === "idle") {
    statusEl.removeAttribute("data-state");
    return;
  }
  statusEl.setAttribute("data-state", state === "error" ? "error" : state === "warning" ? "warning" : "success");
}

function formatDate(value: string | null): string {
  if (!value) {
    return ui().never;
  }

  try {
    return new Intl.DateTimeFormat(document.documentElement.lang || undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatus(value: string): string {
  if (!value) {
    return ui().unknown;
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(init?.method && init.method !== "GET" ? { "content-type": "application/json" } : {})
    }
  });

  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(ui().authRequired);
    }
    throw new Error(payload?.error || `${response.status} ${response.statusText}`);
  }

  return payload as T;
}

function render(): void {
  if (!root) {
    return;
  }

  if (!overview) {
    root.innerHTML = `
      <div class="monitoring-section">
        <p class="monitoring-subtle">${ui().authRequired}</p>
      </div>
    `;
    return;
  }

  const channelHtml = overview.channels.length > 0
    ? overview.channels
        .map(
          (channel) => `
            <article class="monitoring-item">
              <div class="monitoring-row">
                <strong>${channel.label}</strong>
                <span class="monitoring-pill" data-state="${channel.status}">${formatStatus(channel.status)}</span>
              </div>
              <p class="monitoring-subtle">${channel.summary}</p>
              <p class="monitoring-subtle">${formatDate(channel.checkedAt)}</p>
            </article>
          `
        )
        .join("")
    : `<p class="monitoring-subtle">${ui().noChannels}</p>`;

  const runHtml = overview.recentRuns.length > 0
    ? overview.recentRuns
        .map(
          (run) => `
            <article class="monitoring-item">
              <div class="monitoring-row">
                <strong>${formatDate(run.createdAt)}</strong>
                <span class="monitoring-pill" data-state="${run.overallStatus}">${formatStatus(run.overallStatus)}</span>
              </div>
              <p class="monitoring-subtle">${run.summary}</p>
            </article>
          `
        )
        .join("")
    : `<p class="monitoring-subtle">${ui().noRuns}</p>`;

  const incidentHtml = incidents.length > 0
    ? incidents
        .map(
          (incident) => `
            <article class="monitoring-item">
              <div class="monitoring-row">
                <strong>${incident.summary}</strong>
                <span class="monitoring-pill" data-state="${incident.severity}">${formatStatus(incident.severity)}</span>
              </div>
              <div class="monitoring-row">
                <span class="monitoring-subtle">${formatStatus(incident.channel)}</span>
                <span class="monitoring-subtle">${formatDate(incident.lastSeenAt)}</span>
              </div>
              <div class="monitoring-row">
                <span class="monitoring-subtle">${formatStatus(incident.status)}</span>
                <div class="monitoring-actions-row">
                  ${incident.status !== "resolved" ? `<button class="ghost small" type="button" data-monitoring-ack="${incident.id}">${ui().acknowledge}</button>` : ""}
                  ${incident.status !== "resolved" ? `<button class="ghost small" type="button" data-monitoring-resolve="${incident.id}">${ui().resolve}</button>` : ""}
                </div>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="monitoring-subtle">${ui().noIncidents}</p>`;

  root.innerHTML = `
    <div class="monitoring-grid">
      <article class="monitoring-card">
        <h3>${ui().overallHealth}</h3>
        <p class="monitoring-value">${formatStatus(overview.overallStatus)}</p>
        <p class="monitoring-subtle">${ui().lastRun}: ${formatDate(overview.lastRunAt)}</p>
      </article>
      <article class="monitoring-card">
        <h3>${ui().openIncidents}</h3>
        <p class="monitoring-value">${overview.openIncidents}</p>
        <p class="monitoring-subtle">${ui().lastHealthyRun}: ${formatDate(overview.lastHealthyRunAt)}</p>
      </article>
      <article class="monitoring-card">
        <h3>${ui().criticalIncidents}</h3>
        <p class="monitoring-value">${overview.criticalIncidents}</p>
        <p class="monitoring-subtle">${ui().fallbackRatio}: ${overview.fallbackRatio}%</p>
      </article>
      <article class="monitoring-card">
        <h3>${ui().currentBotHandle}</h3>
        <p class="monitoring-value">${overview.currentBotHandle ? `@${overview.currentBotHandle}` : ui().notConfigured}</p>
        <p class="monitoring-subtle">${ui().policyReviewPending}: ${overview.policyReviewPending}</p>
      </article>
    </div>
    <section class="monitoring-section">
      <h3>${ui().channels}</h3>
      <div class="monitoring-channel-list">${channelHtml}</div>
    </section>
    <section class="monitoring-section">
      <h3>${ui().recentRuns}</h3>
      <div class="monitoring-run-list">${runHtml}</div>
    </section>
    <section class="monitoring-section">
      <h3>${ui().incidentsTitle}</h3>
      <div class="monitoring-incident-list">${incidentHtml}</div>
    </section>
  `;
}

async function loadMonitoring(): Promise<void> {
  if (loading) {
    return;
  }

  loading = true;
  refreshButton && (refreshButton.disabled = true);
  runButton && (runButton.disabled = true);
  setStatus(ui().loading);

  try {
    const [nextOverview, nextIncidents] = await Promise.all([
      requestJson<AdminMonitoringOverviewResponse>("/api/admin/monitoring/overview"),
      requestJson<AdminMonitoringIncidentRecord[]>("/api/admin/monitoring/incidents")
    ]);
    overview = nextOverview;
    incidents = nextIncidents;
    render();
    setStatus(ui().refreshDone, overview.overallStatus === "critical" ? "error" : overview.overallStatus === "degraded" ? "warning" : "success");
  } catch (error) {
    overview = null;
    incidents = [];
    render();
    setStatus(error instanceof Error ? error.message : ui().loadFailed, "error");
  } finally {
    loading = false;
    refreshButton && (refreshButton.disabled = false);
    runButton && (runButton.disabled = false);
  }
}

async function runMonitoringChecks(): Promise<void> {
  runButton && (runButton.disabled = true);
  setStatus(ui().runStarted);
  try {
    overview = await requestJson<AdminMonitoringOverviewResponse>("/api/admin/monitoring/run-now", {
      method: "POST",
      body: JSON.stringify({})
    });
    incidents = await requestJson<AdminMonitoringIncidentRecord[]>("/api/admin/monitoring/incidents");
    render();
    setStatus(ui().runDone, overview.overallStatus === "critical" ? "error" : overview.overallStatus === "degraded" ? "warning" : "success");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : ui().loadFailed, "error");
  } finally {
    runButton && (runButton.disabled = false);
  }
}

async function updateIncident(id: string, action: "ack" | "resolve"): Promise<void> {
  try {
    await requestJson<AdminMonitoringIncidentRecord>(`/api/admin/monitoring/incidents/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify({})
    });
    setStatus(action === "ack" ? ui().acknowledged : ui().resolved, "success");
    await loadMonitoring();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : ui().loadFailed, "error");
  }
}

function bind(): void {
  refreshButton?.addEventListener("click", () => {
    void loadMonitoring();
  });

  runButton?.addEventListener("click", () => {
    void runMonitoringChecks();
  });

  root?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const ackId = target.getAttribute("data-monitoring-ack");
    if (ackId) {
      void updateIncident(ackId, "ack");
      return;
    }

    const resolveId = target.getAttribute("data-monitoring-resolve");
    if (resolveId) {
      void updateIncident(resolveId, "resolve");
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      void loadMonitoring();
    }
  });

  new MutationObserver(() => {
    render();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  window.setInterval(() => {
    void loadMonitoring();
  }, 30_000);
}

if (root && statusEl) {
  bind();
  render();
  void loadMonitoring();
}
