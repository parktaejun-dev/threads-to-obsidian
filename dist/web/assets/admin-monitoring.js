// src/admin/monitoring.ts
var strings = {
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
    authRequired: "\uB85C\uADF8\uC778 \uD6C4 \uBAA8\uB2C8\uD130\uB9C1\uC744 \uBD88\uB7EC\uC62C \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    loading: "\uBAA8\uB2C8\uD130\uB9C1\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...",
    loadFailed: "\uBAA8\uB2C8\uD130\uB9C1\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    refreshDone: "\uBAA8\uB2C8\uD130\uB9C1\uC744 \uC0C8\uB85C\uACE0\uCE68\uD588\uC2B5\uB2C8\uB2E4.",
    runStarted: "\uB0B4\uBD80 \uC810\uAC80\uC744 \uC2E4\uD589\uD558\uB294 \uC911\uC785\uB2C8\uB2E4...",
    runDone: "\uBAA8\uB2C8\uD130\uB9C1 \uC810\uAC80\uC774 \uC644\uB8CC\uB410\uC2B5\uB2C8\uB2E4.",
    incidentsTitle: "\uC778\uC2DC\uB358\uD2B8",
    noIncidents: "\uAE30\uB85D\uB41C \uBAA8\uB2C8\uD130\uB9C1 \uC778\uC2DC\uB358\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noRuns: "\uC544\uC9C1 \uBAA8\uB2C8\uD130\uB9C1 \uC2E4\uD589 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noChannels: "\uCC44\uB110 \uC0C1\uD0DC \uB370\uC774\uD130\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.",
    overallHealth: "\uC804\uCCB4 \uC0C1\uD0DC",
    openIncidents: "\uC5F4\uB9B0 \uC778\uC2DC\uB358\uD2B8",
    criticalIncidents: "\uCE58\uBA85 \uC778\uC2DC\uB358\uD2B8",
    currentBotHandle: "\uD604\uC7AC \uBD07 \uD578\uB4E4",
    lastRun: "\uB9C8\uC9C0\uB9C9 \uC2E4\uD589",
    lastHealthyRun: "\uB9C8\uC9C0\uB9C9 \uC815\uC0C1 \uC2E4\uD589",
    fallbackRatio: "\uD3F4\uBC31 \uBE44\uC728",
    policyReviewPending: "\uC815\uCC45 \uAC80\uD1A0 \uB300\uAE30",
    never: "\uC5C6\uC74C",
    notConfigured: "\uBBF8\uC124\uC815",
    recentRuns: "\uCD5C\uADFC \uC2E4\uD589",
    channels: "\uCC44\uB110 \uC0C1\uD0DC",
    acknowledged: "\uD655\uC778\uB428",
    resolved: "\uD574\uACB0\uB428",
    acknowledge: "\uD655\uC778",
    resolve: "\uD574\uACB0 \uCC98\uB9AC",
    unknown: "\uC54C \uC218 \uC5C6\uC74C"
  }
};
var root = document.getElementById("monitoring-root");
var statusEl = document.getElementById("monitoring-status");
var refreshButton = document.getElementById("monitoring-refresh");
var runButton = document.getElementById("monitoring-run");
var overview = null;
var incidents = [];
var loading = false;
function ui() {
  return document.documentElement.lang.startsWith("ko") ? strings.ko : strings.en;
}
function setStatus(message, state = "idle") {
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
function formatDate(value) {
  if (!value) {
    return ui().never;
  }
  try {
    return new Intl.DateTimeFormat(document.documentElement.lang || void 0, {
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
function formatStatus(value) {
  if (!value) {
    return ui().unknown;
  }
  return value.split(/[_\s-]+/).filter(Boolean).map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(" ");
}
async function requestJson(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers ?? {},
      ...init?.method && init.method !== "GET" ? { "content-type": "application/json" } : {}
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(ui().authRequired);
    }
    throw new Error(payload?.error || `${response.status} ${response.statusText}`);
  }
  return payload;
}
function render() {
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
  const channelHtml = overview.channels.length > 0 ? overview.channels.map(
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
  ).join("") : `<p class="monitoring-subtle">${ui().noChannels}</p>`;
  const runHtml = overview.recentRuns.length > 0 ? overview.recentRuns.map(
    (run) => `
            <article class="monitoring-item">
              <div class="monitoring-row">
                <strong>${formatDate(run.createdAt)}</strong>
                <span class="monitoring-pill" data-state="${run.overallStatus}">${formatStatus(run.overallStatus)}</span>
              </div>
              <p class="monitoring-subtle">${run.summary}</p>
            </article>
          `
  ).join("") : `<p class="monitoring-subtle">${ui().noRuns}</p>`;
  const incidentHtml = incidents.length > 0 ? incidents.map(
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
  ).join("") : `<p class="monitoring-subtle">${ui().noIncidents}</p>`;
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
async function loadMonitoring() {
  if (loading) {
    return;
  }
  loading = true;
  refreshButton && (refreshButton.disabled = true);
  runButton && (runButton.disabled = true);
  setStatus(ui().loading);
  try {
    const [nextOverview, nextIncidents] = await Promise.all([
      requestJson("/api/admin/monitoring/overview"),
      requestJson("/api/admin/monitoring/incidents")
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
async function runMonitoringChecks() {
  runButton && (runButton.disabled = true);
  setStatus(ui().runStarted);
  try {
    overview = await requestJson("/api/admin/monitoring/run-now", {
      method: "POST",
      body: JSON.stringify({})
    });
    incidents = await requestJson("/api/admin/monitoring/incidents");
    render();
    setStatus(ui().runDone, overview.overallStatus === "critical" ? "error" : overview.overallStatus === "degraded" ? "warning" : "success");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : ui().loadFailed, "error");
  } finally {
    runButton && (runButton.disabled = false);
  }
}
async function updateIncident(id, action) {
  try {
    await requestJson(`/api/admin/monitoring/incidents/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify({})
    });
    setStatus(action === "ack" ? ui().acknowledged : ui().resolved, "success");
    await loadMonitoring();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : ui().loadFailed, "error");
  }
}
function bind() {
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
  }, 3e4);
}
if (root && statusEl) {
  bind();
  render();
  void loadMonitoring();
}
