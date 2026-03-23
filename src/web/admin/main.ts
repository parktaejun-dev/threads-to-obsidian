import type {
  AdminDashboardResponse,
  EmailDeliveryDraft,
  LicenseRecord,
  PaymentMethod,
  PurchaseOrder,
  RevenueReport
} from "../lib/schema";
import {
  getLocale,
  applyTranslations,
  applyLangToggle,
  bindLangToggle,
  adminMessages,
  type AdminMsg,
  type WebLocale
} from "../lib/web-i18n";

const ADMIN_TOKEN_KEY = "threads-pro-admin-token";

const methodList = document.getElementById("method-list") as HTMLTableSectionElement | null;
const ordersList = document.getElementById("orders-list") as HTMLTableSectionElement | null;
const historyList = document.getElementById("history-list") as HTMLTableSectionElement | null;
const licenseList = document.getElementById("license-history") as HTMLTableSectionElement | null;
const emailPreview = document.getElementById("email-preview") as HTMLTextAreaElement | null;
const emailStatus = document.getElementById("email-status") as HTMLParagraphElement | null;
const copyEmailButton = document.getElementById("copy-email") as HTMLButtonElement | null;
const tokenInput = document.getElementById("admin-token") as HTMLInputElement | null;
const tokenStatus = document.getElementById("token-status") as HTMLParagraphElement | null;
const applyTokenButton = document.getElementById("token-apply") as HTMLButtonElement | null;
const reloadButton = document.getElementById("reload-all") as HTMLButtonElement | null;
const methodForm = document.getElementById("method-form") as HTMLFormElement | null;
const historyKindFilter = document.getElementById("history-filter-kind") as HTMLSelectElement | null;
const historyProviderFilter = document.getElementById("history-filter-provider") as HTMLSelectElement | null;
const historyReasonFilter = document.getElementById("history-filter-reason") as HTMLSelectElement | null;

const stats = {
  pending: document.getElementById("stat-pending"),
  paid: document.getElementById("stat-paid"),
  issued: document.getElementById("stat-issued"),
  methods: document.getElementById("stat-methods"),
  webhookProcessed: document.getElementById("stat-webhook-processed"),
  webhookIgnored: document.getElementById("stat-webhook-ignored"),
  webhookRejected: document.getElementById("stat-webhook-rejected"),
  webhookDuplicates: document.getElementById("stat-webhook-duplicates"),
  deliveryReady: document.getElementById("stat-delivery-ready"),
  deliverySent: document.getElementById("stat-delivery-sent")
};

const revenue = {
  estimate: document.getElementById("rev-estimate"),
  totalOrders: document.getElementById("rev-total-orders"),
  paid: document.getElementById("rev-paid"),
  issued: document.getElementById("rev-issued"),
  revoked: document.getElementById("rev-revoked"),
  readyToSend: document.getElementById("rev-ready-to-send"),
  sent: document.getElementById("rev-sent"),
  byMethod: document.getElementById("rev-by-method") as HTMLTableSectionElement | null,
  byMonth: document.getElementById("rev-by-month") as HTMLTableSectionElement | null
};

const mailerStatus = document.getElementById("mailer-status");

let dashboard: (AdminDashboardResponse & { revenueReport?: RevenueReport; mailerConfigured?: boolean }) | null = null;
let currentEmailDraft = "";
let adminTokenState = "";
let msg: AdminMsg = adminMessages.en;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAdminToken(): string {
  return adminTokenState;
}

function setAdminToken(token: string): void {
  adminTokenState = token;

  try {
    if (!token) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      return;
    }

    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    return;
  } catch {
    // session storage is optional runtime support.
  }
}

async function requestAdmin<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers ?? {});
  headers.set("content-type", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || msg.requestFailed);
  }

  return payload;
}

function statusPill(label: string, variant: "success" | "warning" | "neutral"): string {
  return `<span class="status-pill ${variant}">${label}</span>`;
}

function historyKindVariant(kind: string): "success" | "warning" | "neutral" {
  if (kind === "webhook_processed" || kind === "license_issued") {
    return "success";
  }

  if (kind === "webhook_rejected" || kind === "webhook_ignored") {
    return "warning";
  }

  return kind === "order_paid" ? "neutral" : "success";
}

function paymentMethodName(methodId: string): string {
  return dashboard?.paymentMethods.find((method) => method.id === methodId)?.name ?? methodId;
}

function getHistoryFilters(): { kind: string; provider: string; reason: string } {
  return {
    kind: historyKindFilter?.value ?? "",
    provider: historyProviderFilter?.value ?? "",
    reason: historyReasonFilter?.value ?? ""
  };
}

function matchesWebhookFilter(event: {
  kind: string;
  webhookProvider?: string | null;
  webhookReason?: string | null;
}): boolean {
  const filters = getHistoryFilters();
  if (filters.kind && event.kind !== filters.kind) {
    return false;
  }

  if (filters.provider && (event.webhookProvider ?? "") !== filters.provider) {
    return false;
  }

  if (filters.reason && (event.webhookReason ?? "") !== filters.reason) {
    return false;
  }

  return true;
}

function renderStats(): void {
  if (!dashboard) {
    return;
  }

  if (stats.pending) stats.pending.textContent = String(dashboard.summary.pendingOrders);
  if (stats.paid) stats.paid.textContent = String(dashboard.summary.paidOrders);
  if (stats.issued) stats.issued.textContent = String(dashboard.summary.issuedKeys);
  if (stats.methods) stats.methods.textContent = String(dashboard.summary.activePaymentMethods);
  if (stats.webhookProcessed) stats.webhookProcessed.textContent = String(dashboard.summary.webhookProcessed);
  if (stats.webhookIgnored) stats.webhookIgnored.textContent = String(dashboard.summary.webhookIgnored);
  if (stats.webhookRejected) stats.webhookRejected.textContent = String(dashboard.summary.webhookRejected);
  if (stats.webhookDuplicates) stats.webhookDuplicates.textContent = String(dashboard.summary.webhookDuplicates);
  if (stats.deliveryReady) stats.deliveryReady.textContent = String(dashboard.summary.deliveryReadyToSend ?? 0);
  if (stats.deliverySent) stats.deliverySent.textContent = String(dashboard.summary.deliverySent ?? 0);
}

function renderRevenue(): void {
  if (!dashboard) return;
  const rep = dashboard.revenueReport;
  if (!rep) return;

  if (revenue.estimate) revenue.estimate.textContent = `$${rep.estimatedRevenueUsd.toFixed(2)}`;
  if (revenue.totalOrders) revenue.totalOrders.textContent = String(rep.totalOrders);
  if (revenue.paid) revenue.paid.textContent = String(rep.paidOrders);
  if (revenue.issued) revenue.issued.textContent = String(rep.issuedKeys);
  if (revenue.revoked) revenue.revoked.textContent = String(rep.revokedKeys);
  if (revenue.readyToSend) revenue.readyToSend.textContent = String(rep.deliveryReadyToSend);
  if (revenue.sent) revenue.sent.textContent = String(rep.deliverySent);

  if (mailerStatus) {
    mailerStatus.textContent = dashboard.mailerConfigured ? msg.mailerOn : msg.mailerOff;
  }

  if (revenue.byMethod) {
    revenue.byMethod.innerHTML = rep.byPaymentMethod.length === 0
      ? `<tr><td colspan="3" class="table-subtle">—</td></tr>`
      : rep.byPaymentMethod.map((row) => `
          <tr>
            <td>${escapeHtml(row.methodName)}</td>
            <td>${row.orders}</td>
            <td>${row.paid}</td>
          </tr>
        `).join("");
  }

  if (revenue.byMonth) {
    revenue.byMonth.innerHTML = rep.byMonth.length === 0
      ? `<tr><td colspan="3" class="table-subtle">—</td></tr>`
      : rep.byMonth.map((row) => `
          <tr>
            <td>${escapeHtml(row.month)}</td>
            <td>${row.orders}</td>
            <td>${row.issued}</td>
          </tr>
        `).join("");
  }
}

function renderPaymentMethods(): void {
  if (!dashboard || !methodList) {
    return;
  }

  methodList.innerHTML = dashboard.paymentMethods
    .map(
      (method) => `
        <tr>
          <td>${escapeHtml(method.name)}</td>
          <td>${escapeHtml(method.summary)}</td>
          <td>${escapeHtml(method.actionLabel || "Continue")}</td>
          <td>${statusPill(method.enabled ? msg.pillEnabled : msg.pillDisabled, method.enabled ? "success" : "neutral")}</td>
          <td class="action-cell">
            <button class="ghost small" data-toggle-method="${method.id}" type="button">
              ${method.enabled ? msg.btnDisable : msg.btnEnable}
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderOrders(): void {
  if (!dashboard || !ordersList) {
    return;
  }

  ordersList.innerHTML = dashboard.orders
    .map((order) => {
      const variant =
        order.status === "key_issued" ? "success" : order.status === "payment_confirmed" ? "neutral" : "warning";
      const actions: string[] = [];
      if (order.status === "pending") {
        actions.push(`<button class="ghost small" data-mark-paid="${order.id}" type="button">${msg.btnMarkPaid}</button>`);
      }
      if (order.status === "payment_confirmed") {
        actions.push(`<button class="ghost small" data-issue-license="${order.id}" type="button">${msg.btnIssueKey}</button>`);
      }
      if (order.status === "key_issued") {
        actions.push(`<button class="ghost small" data-email-preview="${order.id}" type="button">${msg.btnPreviewEmail}</button>`);
        actions.push(`<button class="ghost small" data-reissue="${order.id}" type="button">${msg.btnReissueKey}</button>`);
        if (order.deliveryStatus === "ready_to_send") {
          actions.push(`<button class="ghost small" data-send-email="${order.id}" type="button">${msg.btnSendEmail}</button>`);
        }
      }

      return `
        <tr>
          <td>
            <strong>${escapeHtml(order.buyerName)}</strong><br />
            <span class="table-subtle">${escapeHtml(order.buyerEmail)}</span>
          </td>
          <td>${escapeHtml(paymentMethodName(order.paymentMethodId))}</td>
          <td>${statusPill(order.status.replaceAll("_", " "), variant)}</td>
          <td>${new Date(order.createdAt).toLocaleString()}</td>
          <td class="action-cell">${actions.join("") || `<span class="table-subtle">${msg.noActions}</span>`}</td>
        </tr>
      `;
    })
    .join("");
}

function renderLicenses(): void {
  if (!dashboard || !licenseList) {
    return;
  }

  licenseList.innerHTML = dashboard.licenses
    .map(
      (license) => `
        <tr>
          <td>
            <strong>${escapeHtml(license.holderName)}</strong><br />
            <span class="table-subtle">${escapeHtml(license.holderEmail)}</span>
          </td>
          <td>${new Date(license.issuedAt).toLocaleString()}</td>
          <td><code>${escapeHtml(license.tokenPreview)}</code></td>
          <td>${statusPill(license.status, license.status === "active" ? "success" : "warning")}</td>
          <td class="action-cell">
            ${license.status === "active" ? `<button class="ghost small" data-revoke-license="${license.id}" type="button">${msg.btnRevoke}</button>` : ""}
          </td>
        </tr>
      `
    )
    .join("");
}

function renderHistory(): void {
  if (!dashboard || !historyList) {
    return;
  }

  const events = dashboard.history.filter(matchesWebhookFilter);
  if (events.length === 0) {
    historyList.innerHTML = `
      <tr>
        <td colspan="6" class="table-subtle">${msg.noHistoryMatch}</td>
      </tr>
    `;
    return;
  }

  historyList.innerHTML = events
    .map(
      (event) => `
        <tr>
          <td>${new Date(event.createdAt).toLocaleString()}</td>
          <td>${statusPill(event.kind, historyKindVariant(event.kind))}</td>
          <td>${escapeHtml(event.webhookProvider ?? "—")}</td>
          <td>${escapeHtml(event.webhookEventId ?? "—")}</td>
          <td>${escapeHtml(event.webhookReason ?? "—")}</td>
          <td>${escapeHtml(event.message)}</td>
        </tr>
      `
    )
    .join("");
}

function renderAll(): void {
  renderStats();
  renderRevenue();
  renderPaymentMethods();
  renderOrders();
  renderLicenses();
  renderHistory();
}

async function refreshDashboard(): Promise<void> {
  dashboard = await requestAdmin<AdminDashboardResponse>("/api/admin/dashboard");
  renderAll();
  if (tokenStatus) {
    tokenStatus.textContent = msg.dashboardLoaded;
  }
}

async function handleMethodSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!methodForm) {
    return;
  }

  const formData = new FormData(methodForm);
  await requestAdmin<PaymentMethod>("/api/admin/payment-methods", {
    method: "POST",
    body: JSON.stringify({
      name: formData.get("name")?.toString() ?? "",
      summary: formData.get("summary")?.toString() ?? "",
      instructions: formData.get("instructions")?.toString() ?? "",
      actionLabel: formData.get("actionLabel")?.toString() ?? "",
      actionUrl: formData.get("actionUrl")?.toString() ?? "",
      enabled: formData.get("enabled") === "on",
      sortOrder: Number(formData.get("sortOrder")?.toString() ?? "0")
    })
  });
  methodForm.reset();
  await refreshDashboard();
}

async function togglePaymentMethod(methodId: string): Promise<void> {
  if (!dashboard) {
    return;
  }

  const method = dashboard.paymentMethods.find((candidate) => candidate.id === methodId);
  if (!method) {
    return;
  }

  await requestAdmin<PaymentMethod>(`/api/admin/payment-methods/${methodId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...method,
      enabled: !method.enabled
    })
  });
  await refreshDashboard();
}

async function previewEmail(orderId: string): Promise<void> {
  const draft = await requestAdmin<EmailDeliveryDraft>(`/api/admin/orders/${orderId}/email-preview`, {
    method: "GET"
  });
  currentEmailDraft = `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`;
  if (emailPreview) {
    emailPreview.value = currentEmailDraft;
  }
  if (emailStatus) {
    emailStatus.textContent = msg.emailDraftReady.replace("{email}", draft.to);
  }
}

async function handleOrderAction(target: HTMLElement): Promise<void> {
  const markPaidId = target.getAttribute("data-mark-paid");
  const issueLicenseId = target.getAttribute("data-issue-license");
  const emailPreviewId = target.getAttribute("data-email-preview");
  const reissueId = target.getAttribute("data-reissue");
  const sendEmailId = target.getAttribute("data-send-email");

  if (markPaidId) {
    await requestAdmin<PurchaseOrder>(`/api/admin/orders/${markPaidId}/mark-paid`, {
      method: "POST",
      body: JSON.stringify({})
    });
    await refreshDashboard();
    return;
  }

  if (issueLicenseId) {
    const expiresAt = window.prompt("Optional expiry date (YYYY-MM-DD). Leave blank for no expiry.", "") || "";
    const payload = {
      expiresAt: expiresAt ? new Date(`${expiresAt}T00:00:00.000Z`).toISOString() : null
    };
    const result = await requestAdmin<{ license: LicenseRecord; emailDraft: EmailDeliveryDraft; autoSent?: boolean }>(
      `/api/admin/orders/${issueLicenseId}/issue-license`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    currentEmailDraft = `To: ${result.emailDraft.to}\nSubject: ${result.emailDraft.subject}\n\n${result.emailDraft.body}`;
    if (emailPreview) {
      emailPreview.value = currentEmailDraft;
    }
    if (emailStatus) {
      const base = msg.keyIssued.replace("{email}", result.license.holderEmail);
      emailStatus.textContent = result.autoSent ? `${base} · ${msg.emailSent.replace("{email}", result.license.holderEmail)}` : base;
    }
    await refreshDashboard();
    return;
  }

  if (reissueId) {
    const expiresAt = window.prompt("Optional expiry date (YYYY-MM-DD). Leave blank for no expiry.", "") || "";
    const payload = {
      expiresAt: expiresAt ? new Date(`${expiresAt}T00:00:00.000Z`).toISOString() : null
    };
    const result = await requestAdmin<{ license: LicenseRecord; emailDraft: EmailDeliveryDraft; autoSent?: boolean }>(
      `/api/admin/orders/${reissueId}/reissue`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    currentEmailDraft = `To: ${result.emailDraft.to}\nSubject: ${result.emailDraft.subject}\n\n${result.emailDraft.body}`;
    if (emailPreview) {
      emailPreview.value = currentEmailDraft;
    }
    if (emailStatus) {
      const base = msg.keyReissued.replace("{email}", result.license.holderEmail);
      emailStatus.textContent = result.autoSent ? `${base} · ${msg.emailSent.replace("{email}", result.license.holderEmail)}` : base;
    }
    await refreshDashboard();
    return;
  }

  if (sendEmailId) {
    const result = await requestAdmin<{ sent: boolean; to: string }>(
      `/api/admin/orders/${sendEmailId}/send-email`,
      { method: "POST", body: JSON.stringify({}) }
    );
    if (emailStatus) {
      emailStatus.textContent = msg.emailSent.replace("{email}", result.to);
    }
    await refreshDashboard();
    return;
  }

  if (emailPreviewId) {
    await previewEmail(emailPreviewId);
  }
}

async function handleLicenseAction(target: HTMLElement): Promise<void> {
  const revokeId = target.getAttribute("data-revoke-license");
  if (!revokeId) return;

  await requestAdmin<LicenseRecord>(`/api/admin/licenses/${revokeId}/revoke`, {
    method: "POST",
    body: JSON.stringify({})
  });
  await refreshDashboard();
}

function applyLocale(locale: WebLocale): void {
  msg = adminMessages[locale];
  document.documentElement.lang = locale;
  applyTranslations(msg as unknown as Record<string, string>);
  applyLangToggle(locale);
  // Re-render dynamic table content that uses msg strings
  if (dashboard) {
    renderAll();
  }
}

function bindEvents(): void {
  applyTokenButton?.addEventListener("click", async () => {
    const token = tokenInput?.value.trim() ?? "";
    setAdminToken(token);
    if (tokenStatus) {
      tokenStatus.textContent = token ? msg.tokenSaving : msg.tokenCleared;
    }
    if (!token) {
      return;
    }

    try {
      await refreshDashboard();
    } catch (error) {
      if (tokenStatus) {
        tokenStatus.textContent = error instanceof Error ? error.message : msg.dashboardError;
      }
    }
  });

  reloadButton?.addEventListener("click", () => {
    void refreshDashboard();
  });

  methodForm?.addEventListener("submit", (event) => {
    void handleMethodSubmit(event);
  });

  methodList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const methodId = target.getAttribute("data-toggle-method");
    if (methodId) {
      void togglePaymentMethod(methodId);
    }
  });

  ordersList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    void handleOrderAction(target);
  });

  licenseList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    void handleLicenseAction(target);
  });

  copyEmailButton?.addEventListener("click", async () => {
    if (!currentEmailDraft) {
      if (emailStatus) {
        emailStatus.textContent = msg.nothingToCopy;
      }
      return;
    }

    await navigator.clipboard.writeText(currentEmailDraft);
    if (emailStatus) {
      emailStatus.textContent = msg.emailCopied;
    }
  });

  historyKindFilter?.addEventListener("change", () => {
    renderHistory();
  });

  historyProviderFilter?.addEventListener("change", () => {
    renderHistory();
  });

  historyReasonFilter?.addEventListener("change", () => {
    renderHistory();
  });

  bindLangToggle((next) => {
    applyLocale(next);
  });
}

void (async () => {
  const locale = getLocale("en");
  msg = adminMessages[locale];
  applyTranslations(msg as unknown as Record<string, string>);
  applyLangToggle(locale);
  document.documentElement.lang = locale;

  try {
    adminTokenState = sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
  } catch {
    adminTokenState = "";
  }

  const savedToken = getAdminToken();
  if (tokenInput) {
    tokenInput.value = savedToken;
  }
  bindEvents();
  if (!savedToken) {
    return;
  }

  try {
    await refreshDashboard();
  } catch (error) {
    if (tokenStatus) {
      tokenStatus.textContent = error instanceof Error ? error.message : msg.dashboardError;
    }
  }
})();
