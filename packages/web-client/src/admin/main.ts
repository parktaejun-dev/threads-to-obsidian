import type {
  AdminRuntimeConfigResponse,
  AdminRuntimeConfigSecretState,
  AdminDashboardResponse,
  BotMentionCollectorStatus,
  EmailDeliveryDraft,
  LicenseRecord,
  PaymentMethod,
  PurchaseOrder,
  RevenueReport,
  RuntimeConfigTestResult,
  RuntimeDatabaseConfig,
  StorefrontSettings,
  WebRuntimeConfig
} from "@threads/web-schema";
import {
  getLocale,
  applyTranslations,
  applyLangToggle,
  bindLangToggle,
  adminMessages,
  type AdminMsg,
  type WebLocale
} from "../lib/web-i18n";

const methodList = document.getElementById("method-list") as HTMLTableSectionElement | null;
const ordersList = document.getElementById("orders-list") as HTMLTableSectionElement | null;
const historyList = document.getElementById("history-list") as HTMLTableSectionElement | null;
const licenseList = document.getElementById("license-history") as HTMLTableSectionElement | null;
const emailPreview = document.getElementById("email-preview") as HTMLTextAreaElement | null;
const emailStatus = document.getElementById("email-status") as HTMLParagraphElement | null;
const copyEmailButton = document.getElementById("copy-email") as HTMLButtonElement | null;
const issueExpiryInput = document.getElementById("license-expiry-date") as HTMLInputElement | null;
const issueExpiryClearButton = document.getElementById("license-expiry-clear") as HTMLButtonElement | null;
const tokenInput = document.getElementById("admin-token") as HTMLInputElement | null;
const tokenLabel = document.getElementById("admin-token-label") as HTMLLabelElement | null;
const tokenLoginRow = document.getElementById("token-login-row") as HTMLDivElement | null;
const tokenStatus = document.getElementById("token-status") as HTMLParagraphElement | null;
const applyTokenButton = document.getElementById("token-apply") as HTMLButtonElement | null;
const logoutButton = document.getElementById("token-logout") as HTMLButtonElement | null;
const authState = document.getElementById("admin-auth-state") as HTMLParagraphElement | null;
const authDetail = document.getElementById("admin-auth-detail") as HTMLParagraphElement | null;
const authBanner = document.getElementById("admin-auth-banner") as HTMLElement | null;
const authBannerStatus = document.getElementById("admin-auth-banner-status") as HTMLParagraphElement | null;
const reloadButton = document.getElementById("reload-all") as HTMLButtonElement | null;
const methodForm = document.getElementById("method-form") as HTMLFormElement | null;
const historyKindFilter = document.getElementById("history-filter-kind") as HTMLSelectElement | null;
const historyProviderFilter = document.getElementById("history-filter-provider") as HTMLSelectElement | null;
const historyReasonFilter = document.getElementById("history-filter-reason") as HTMLSelectElement | null;
const methodSubmitButton = document.getElementById("method-submit") as HTMLButtonElement | null;
const methodCancelButton = document.getElementById("method-cancel") as HTMLButtonElement | null;
const methodStatus = document.getElementById("method-status") as HTMLParagraphElement | null;
const collectorForm = document.getElementById("collector-form") as HTMLFormElement | null;
const collectorSyncButton = document.getElementById("collector-sync") as HTMLButtonElement | null;
const collectorSaveButton = document.getElementById("collector-save") as HTMLButtonElement | null;
const collectorStatusText = document.getElementById("collector-status") as HTMLParagraphElement | null;
const collectorState = document.getElementById("collector-state");
const collectorLastSuccess = document.getElementById("collector-last-success");
const collectorLastError = document.getElementById("collector-last-error");
const collectorHandlePreview = document.getElementById("collector-handle-preview") as HTMLParagraphElement | null;
const collectorHandleLink = document.getElementById("collector-handle-link") as HTMLAnchorElement | null;
const runtimeForm = document.getElementById("runtime-form") as HTMLFormElement | null;
const runtimeStatus = document.getElementById("runtime-status") as HTMLParagraphElement | null;
const runtimeActiveDatabase = document.getElementById("runtime-active-database") as HTMLParagraphElement | null;
const databaseTestButton = document.getElementById("database-test") as HTMLButtonElement | null;
const runtimeSaveButton = document.getElementById("runtime-save") as HTMLButtonElement | null;
const smtpTestButton = document.getElementById("smtp-test") as HTMLButtonElement | null;
const smtpStatus = document.getElementById("smtp-status") as HTMLParagraphElement | null;
const storefrontForm = document.getElementById("storefront-form") as HTMLFormElement | null;
const storefrontSaveButton = document.getElementById("storefront-save") as HTMLButtonElement | null;
const storefrontStatus = document.getElementById("storefront-status") as HTMLParagraphElement | null;
const ordersStatus = document.getElementById("orders-status") as HTMLParagraphElement | null;
const licensesStatus = document.getElementById("licenses-status") as HTMLParagraphElement | null;
const protectedSections = [...document.querySelectorAll<HTMLElement>("[data-admin-auth-required]")];

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

let dashboard: (AdminDashboardResponse & { revenueReport?: RevenueReport }) | null = null;
let runtimeConfig: WebRuntimeConfig | null = null;
let runtimeSecretState: AdminRuntimeConfigSecretState | null = null;
let activeRuntimeDatabase: RuntimeDatabaseConfig | null = null;
let collector: BotMentionCollectorStatus | null = null;
let currentEmailDraft = "";
let adminAuthenticated = false;
let msg: AdminMsg = adminMessages.en;

const statusElements = [
  tokenStatus,
  authBannerStatus,
  methodStatus,
  collectorStatusText,
  runtimeStatus,
  smtpStatus,
  storefrontStatus,
  ordersStatus,
  licensesStatus,
  emailStatus
].filter((value): value is HTMLParagraphElement => Boolean(value));

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeBotHandle(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function setStatus(
  element: HTMLParagraphElement | null,
  text: string,
  state: "neutral" | "success" | "warning" | "error" = "neutral"
): void {
  if (!element) {
    return;
  }

  element.textContent = text;
  if (state === "neutral") {
    delete element.dataset.state;
    return;
  }

  element.dataset.state = state;
}

function clearStatus(element: HTMLParagraphElement | null, placeholder = "—"): void {
  if (!element) {
    return;
  }

  element.textContent = placeholder;
  delete element.dataset.state;
}

function setTokenFeedback(text: string, state: "neutral" | "success" | "warning" | "error" = "neutral"): void {
  if (!tokenStatus) {
    return;
  }

  tokenStatus.hidden = false;
  setStatus(tokenStatus, text, state);
}

function clearTokenFeedback(): void {
  if (!tokenStatus) {
    return;
  }

  tokenStatus.hidden = true;
  tokenStatus.textContent = "";
  delete tokenStatus.dataset.state;
}

type BusyButtonState = {
  button: HTMLButtonElement | null;
  label?: string;
};

function setButtonBusyState(button: HTMLButtonElement | null, busy: boolean, label?: string): void {
  if (!button) {
    return;
  }

  if (busy) {
    button.dataset.idleLabel = button.textContent?.trim() ?? "";
    button.dataset.busy = "true";
    button.setAttribute("aria-busy", "true");
    if (label) {
      button.textContent = label;
    }
    return;
  }

  if (button.dataset.idleLabel) {
    button.textContent = button.dataset.idleLabel;
  }
  delete button.dataset.busy;
  button.removeAttribute("aria-busy");
}

function setBusy(target: HTMLElement | HTMLFormElement | null, busy: boolean): void {
  if (!target) {
    return;
  }

  if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
    target.disabled = busy;
    return;
  }

  for (const control of target.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>("input, button, select, textarea")) {
    if (control === tokenInput || control === applyTokenButton || control === logoutButton) {
      continue;
    }
    control.disabled = busy;
  }
}

function formatBotHandlePreview(handle: string | null | undefined): string {
  const normalized = normalizeBotHandle(handle ?? "");
  return normalized ? `@${normalized}` : "@ss_threads_bot";
}

function updateCollectorHandlePreview(handle: string | null | undefined): void {
  const normalized = normalizeBotHandle(handle ?? "");
  if (collectorHandlePreview) {
    collectorHandlePreview.textContent = formatBotHandlePreview(normalized);
  }

  if (collectorHandleLink) {
    const hasHandle = Boolean(normalized);
    collectorHandleLink.hidden = !hasHandle;
    collectorHandleLink.href = hasHandle ? `https://www.threads.com/@${normalized}` : "#";
  }
}

function tableEmptyMarkup(title: string, copy: string, colspan: number): string {
  return `
    <tr class="table-empty-row">
      <td colspan="${colspan}" class="table-empty-cell">
        <div class="table-empty">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(copy)}</span>
        </div>
      </td>
    </tr>
  `;
}

function getLockedEmptyCopy(): string {
  return msg.authOverlayLabel ?? "Sign in to unlock this section.";
}

function parseExpiryIsoFromInput(): { ok: true; iso: string | null } | { ok: false } {
  const raw = issueExpiryInput?.value.trim() ?? "";
  if (!raw) {
    return { ok: true, iso: null };
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { ok: false };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return { ok: false };
  }

  return { ok: true, iso: parsed.toISOString() };
}

async function runWithFeedback<T>(
  work: () => Promise<T>,
  options: {
    statusEl?: HTMLParagraphElement | null;
    busyTargets?: Array<HTMLElement | HTMLFormElement | null>;
    busyButtons?: BusyButtonState[];
    pendingText?: string;
    errorFallback?: string;
  } = {}
): Promise<T | null> {
  const statusEl = options.statusEl ?? null;
  const busyTargets = options.busyTargets ?? [];
  const busyButtons = options.busyButtons ?? [];
  const previousDisabled = busyTargets.map((target) =>
    target instanceof HTMLButtonElement ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
      ? target.disabled
      : null
  );

  for (const target of busyTargets) {
    setBusy(target, true);
  }
  for (const { button, label } of busyButtons) {
    setButtonBusyState(button, true, label);
  }

  if (options.pendingText) {
    if (statusEl === tokenStatus && tokenStatus) {
      tokenStatus.hidden = false;
    }
    setStatus(statusEl, options.pendingText, "warning");
  }

  try {
    return await work();
  } catch (error) {
    const message = error instanceof Error ? error.message : options.errorFallback ?? msg.dashboardError;
    if (statusEl === tokenStatus && tokenStatus) {
      tokenStatus.hidden = false;
    }
    setStatus(statusEl, message, "error");
    if (statusEl !== tokenStatus && !adminAuthenticated) {
      setTokenFeedback(message, "error");
    }
    return null;
  } finally {
    busyTargets.forEach((target, index) => {
      if (!target) {
        return;
      }

      const restore = previousDisabled[index];
      if (restore === null || typeof restore === "undefined") {
        setBusy(target, false);
        return;
      }

      if (
        target instanceof HTMLButtonElement ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        target.disabled = restore;
      } else {
        setBusy(target, false);
      }
    });
    for (const { button } of busyButtons) {
      setButtonBusyState(button, false);
    }
    updateAdminSessionUi();
  }
}

type AdminSessionResponse = {
  authenticated: boolean;
  expiresAt?: string | null;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    if (response.status === 401) {
      adminAuthenticated = false;
      clearAdminState();
      renderAll();
      updateAdminSessionUi();
    }
    throw new Error(payload.error || msg.requestFailed);
  }

  return payload;
}

async function requestAdmin<T>(url: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(url, init);
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

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function formatActiveDatabaseSummary(database: RuntimeDatabaseConfig | null | undefined): string {
  if (!database) {
    return "—";
  }

  if (database.backend === "postgres") {
    return `Postgres · ${database.tableName || "threads_web_store"} · ${database.storeKey || "default"}`;
  }

  return `File · ${database.filePath || "—"}`;
}

function resetProtectedForms(): void {
  if (collectorForm) {
    collectorForm.reset();
  }
  if (runtimeForm) {
    runtimeForm.reset();
  }
  if (storefrontForm) {
    storefrontForm.reset();
  }
  resetMethodForm();
  if (emailPreview) {
    emailPreview.value = "";
  }
  if (issueExpiryInput) {
    issueExpiryInput.value = "";
  }
  updateCollectorHandlePreview("");
  if (runtimeActiveDatabase) {
    runtimeActiveDatabase.textContent = `${msg.databaseActiveLabel ?? "Active database"}: —`;
  }
}

function clearAdminState(): void {
  dashboard = null;
  runtimeConfig = null;
  runtimeSecretState = null;
  activeRuntimeDatabase = null;
  collector = null;
  currentEmailDraft = "";
  resetProtectedForms();
}

function updateAdminSessionUi(): void {
  document.body.classList.toggle("admin-authenticated", adminAuthenticated);
  authBanner?.toggleAttribute("hidden", adminAuthenticated);

  if (authState) {
    authState.textContent = adminAuthenticated
      ? (msg.authStateLoggedIn ?? "Signed in")
      : (msg.authStateLoggedOut ?? "Sign in required");
    authState.dataset.state = adminAuthenticated ? "success" : "warning";
  }

  if (authDetail) {
    authDetail.textContent = adminAuthenticated
      ? (msg.authDetailLoggedIn ?? "Live changes are enabled.")
      : (msg.authDetailLoggedOut ?? "Live changes are locked.");
  }

  const lockLabel = msg.authOverlayLabel ?? "Sign in to unlock this section.";
  for (const section of protectedSections) {
    section.classList.toggle("is-locked", !adminAuthenticated);
    section.dataset.lockLabel = lockLabel;
    section.setAttribute("aria-hidden", adminAuthenticated ? "false" : "true");

    for (const control of section.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>("input, button, select, textarea")) {
      if (control === issueExpiryInput || control === issueExpiryClearButton) {
        control.disabled = !adminAuthenticated;
        continue;
      }
      control.disabled = !adminAuthenticated;
    }
  }

  if (tokenInput) {
    tokenInput.disabled = adminAuthenticated;
    if (adminAuthenticated) {
      tokenInput.value = "";
    }
  }
  if (tokenLabel) {
    tokenLabel.hidden = adminAuthenticated;
  }
  if (tokenLoginRow) {
    tokenLoginRow.hidden = adminAuthenticated;
  }
  if (applyTokenButton) {
    applyTokenButton.disabled = adminAuthenticated;
  }
  if (logoutButton) {
    logoutButton.hidden = !adminAuthenticated;
  }
  if (authBannerStatus) {
    setStatus(authBannerStatus, msg.authBannerCopy ?? "Sign in before changing live settings or issuing keys.");
  }
}

function setMethodFormMode(editing: boolean): void {
  if (methodSubmitButton) {
    methodSubmitButton.textContent = editing ? msg.methodSaveBtn ?? "Save method" : msg.addMethodBtn;
  }

  if (methodCancelButton) {
    methodCancelButton.hidden = !editing;
  }
}

function resetMethodForm(): void {
  if (!methodForm) {
    return;
  }

  methodForm.reset();
  const idInput = methodForm.elements.namedItem("id");
  if (idInput instanceof HTMLInputElement) {
    idInput.value = "";
  }
  const enabledInput = methodForm.elements.namedItem("enabled");
  if (enabledInput instanceof HTMLInputElement) {
    enabledInput.checked = true;
  }
  const sortOrderInput = methodForm.elements.namedItem("sortOrder");
  if (sortOrderInput instanceof HTMLInputElement) {
    sortOrderInput.value = "10";
  }
  setMethodFormMode(false);
}

function beginMethodEdit(method: PaymentMethod): void {
  if (!methodForm) {
    return;
  }

  const setValue = (name: string, value: string) => {
    const field = methodForm.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
    }
  };

  setValue("id", method.id);
  setValue("name", method.name);
  setValue("summary", method.summary);
  setValue("instructions", method.instructions);
  setValue("actionLabel", method.actionLabel);
  setValue("actionUrl", method.actionUrl);
  setValue("sortOrder", String(method.sortOrder));
  const enabledInput = methodForm.elements.namedItem("enabled");
  if (enabledInput instanceof HTMLInputElement) {
    enabledInput.checked = method.enabled;
  }
  setMethodFormMode(true);
  if (methodStatus) {
    methodStatus.textContent = msg.methodEditing ?? "Editing payment method.";
  }
}

function parseStorefrontFaqs(raw: string): StorefrontSettings["faqs"] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [question, ...answerParts] = line.split("::");
      return {
        id: `faq-${index + 1}`,
        question: question?.trim() ?? "",
        answer: answerParts.join("::").trim()
      };
    })
    .filter((candidate) => candidate.question && candidate.answer);
}

function parseStorefrontForm(): Partial<StorefrontSettings> {
  if (!storefrontForm) {
    return {};
  }

  const formData = new FormData(storefrontForm);
  return {
    productName: formData.get("productName")?.toString() ?? "",
    supportEmail: formData.get("supportEmail")?.toString() ?? "",
    headline: formData.get("headline")?.toString() ?? "",
    subheadline: formData.get("subheadline")?.toString() ?? "",
    priceLabel: formData.get("priceLabel")?.toString() ?? "",
    priceValue: formData.get("priceValue")?.toString() ?? "",
    includedUpdates: formData.get("includedUpdates")?.toString() ?? "",
    heroNotes: (formData.get("heroNotes")?.toString() ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    faqs: parseStorefrontFaqs(formData.get("faqs")?.toString() ?? "")
  };
}

function populateStorefrontForm(settings: StorefrontSettings | null | undefined): void {
  if (!storefrontForm || !settings) {
    return;
  }

  const setValue = (name: string, value: string) => {
    const field = storefrontForm.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
    }
  };

  setValue("productName", settings.productName);
  setValue("supportEmail", settings.supportEmail);
  setValue("headline", settings.headline);
  setValue("subheadline", settings.subheadline);
  setValue("priceLabel", settings.priceLabel);
  setValue("priceValue", settings.priceValue);
  setValue("includedUpdates", settings.includedUpdates);
  setValue("heroNotes", settings.heroNotes.join("\n"));
  setValue("faqs", settings.faqs.map((faq) => `${faq.question} :: ${faq.answer}`).join("\n"));
}

function parseRuntimeConfigFromForm(): Partial<WebRuntimeConfig> {
  if (!runtimeForm) {
    return {};
  }

  const formData = new FormData(runtimeForm);
  const clearPostgresUrl = formData.get("clearPostgresUrl") === "on";
  const clearSmtpPass = formData.get("clearSmtpPass") === "on";
  return {
    publicOrigin: formData.get("publicOrigin")?.toString() ?? "",
    database: {
      backend: formData.get("backend")?.toString() === "postgres" ? "postgres" : "file",
      filePath: formData.get("filePath")?.toString() ?? "",
      postgresUrl: formData.get("postgresUrl")?.toString() ?? "",
      tableName: formData.get("tableName")?.toString() ?? "",
      storeKey: formData.get("storeKey")?.toString() ?? ""
    },
    smtp: {
      host: formData.get("smtpHost")?.toString() ?? "",
      port: Number(formData.get("smtpPort")?.toString() ?? "0"),
      secure: formData.get("smtpSecure") === "on",
      user: formData.get("smtpUser")?.toString() ?? "",
      pass: formData.get("smtpPass")?.toString() ?? "",
      from: formData.get("smtpFrom")?.toString() ?? ""
    },
    secretActions: {
      databasePostgresUrl: clearPostgresUrl ? "clear" : "keep",
      smtpPass: clearSmtpPass ? "clear" : "keep"
    }
  } as Partial<WebRuntimeConfig> & {
    secretActions: {
      databasePostgresUrl: "clear" | "keep";
      smtpPass: "clear" | "keep";
    };
  };
}

function populateRuntimeForm(config: WebRuntimeConfig | null): void {
  if (!runtimeForm || !config) {
    return;
  }

  const setValue = (name: string, value: string) => {
    const field = runtimeForm.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      field.value = value;
    }
  };

  setValue("publicOrigin", config.publicOrigin);
  setValue("backend", config.database.backend);
  setValue("filePath", config.database.filePath);
  setValue("postgresUrl", config.database.postgresUrl);
  setValue("tableName", config.database.tableName);
  setValue("storeKey", config.database.storeKey);
  setValue("smtpHost", config.smtp.host);
  setValue("smtpPort", String(config.smtp.port));
  setValue("smtpUser", config.smtp.user);
  setValue("smtpPass", config.smtp.pass);
  setValue("smtpFrom", config.smtp.from);
  const secureField = runtimeForm.elements.namedItem("smtpSecure");
  if (secureField instanceof HTMLInputElement) {
    secureField.checked = config.smtp.secure;
  }
  const clearPostgresUrlField = runtimeForm.elements.namedItem("clearPostgresUrl");
  if (clearPostgresUrlField instanceof HTMLInputElement) {
    clearPostgresUrlField.checked = false;
  }
  const clearSmtpPassField = runtimeForm.elements.namedItem("clearSmtpPass");
  if (clearSmtpPassField instanceof HTMLInputElement) {
    clearSmtpPassField.checked = false;
  }

  const applySecretPlaceholder = (name: string, configured: boolean, configuredPlaceholder: string) => {
    const field = runtimeForm.elements.namedItem(name);
    if (!(field instanceof HTMLInputElement)) {
      return;
    }

    if (!field.dataset.defaultPlaceholder) {
      field.dataset.defaultPlaceholder = field.placeholder;
    }

    if (configured) {
      field.placeholder = configuredPlaceholder;
      field.value = "";
      return;
    }

    field.placeholder = field.dataset.defaultPlaceholder;
  };

  applySecretPlaceholder(
    "postgresUrl",
    runtimeSecretState?.databasePostgresUrlConfigured === true,
    msg.databaseUrlConfiguredPlaceholder ?? "Configured. Enter a new URL to replace it."
  );
  applySecretPlaceholder(
    "smtpPass",
    runtimeSecretState?.smtpPassConfigured === true,
    msg.smtpPassConfiguredPlaceholder ?? "Configured. Enter a new password to replace it."
  );
  if (runtimeActiveDatabase) {
    runtimeActiveDatabase.textContent = `${msg.databaseActiveLabel ?? "Active database"}: ${formatActiveDatabaseSummary(
      activeRuntimeDatabase
    )}`;
  }
}

function parseCollectorForm(): Partial<WebRuntimeConfig> {
  if (!collectorForm) {
    return {};
  }

  const formData = new FormData(collectorForm);
  return {
    collector: {
      botHandle: normalizeBotHandle(formData.get("botHandle")?.toString() ?? ""),
      accessTokenOverride: formData.get("accessTokenOverride")?.toString() ?? "",
      graphApiVersion: formData.get("graphApiVersion")?.toString() ?? "",
      intervalMs: Number(formData.get("intervalMs")?.toString() ?? "0"),
      fetchLimit: Number(formData.get("fetchLimit")?.toString() ?? "0"),
      maxPages: Number(formData.get("maxPages")?.toString() ?? "0")
    }
  };
}

function populateCollectorForm(config: WebRuntimeConfig | null): void {
  if (!collectorForm || !config) {
    return;
  }

  const setValue = (name: string, value: string) => {
    const field = collectorForm.elements.namedItem(name);
    if (field instanceof HTMLInputElement) {
      field.value = value;
    }
  };

  setValue("botHandle", normalizeBotHandle(config.collector.botHandle));
  setValue("accessTokenOverride", config.collector.accessTokenOverride);
  setValue("graphApiVersion", config.collector.graphApiVersion);
  setValue("intervalMs", String(config.collector.intervalMs));
  setValue("fetchLimit", String(config.collector.fetchLimit));
  setValue("maxPages", String(config.collector.maxPages));
  updateCollectorHandlePreview(config.collector.botHandle);
}

function renderCollector(): void {
  const status = collector ?? dashboard?.collectorStatus ?? null;
  const handleField = collectorForm?.elements.namedItem("botHandle");
  const fallbackHandle = handleField instanceof HTMLInputElement ? handleField.value : "";
  updateCollectorHandlePreview(status?.botHandle ?? runtimeConfig?.collector.botHandle ?? fallbackHandle);

  if (collectorState) {
    collectorState.textContent = !status
      ? "—"
      : status.running
        ? msg.collectorStateRunning ?? "Running"
        : status.enabled
          ? msg.collectorStateReady ?? "Ready"
          : msg.collectorStateDisabled ?? "Disabled";
  }
  if (collectorLastSuccess) {
    collectorLastSuccess.textContent = status ? formatDateTime(status.lastSucceededAt) : "—";
  }
  if (collectorLastError) {
    collectorLastError.textContent = status?.lastError || "—";
  }
  if (collectorSyncButton) {
    collectorSyncButton.disabled = !adminAuthenticated || !Boolean(normalizeBotHandle(status?.botHandle ?? fallbackHandle));
  }
}

function renderStats(): void {
  const summary = dashboard?.summary;

  if (stats.pending) stats.pending.textContent = summary ? String(summary.pendingOrders) : "—";
  if (stats.paid) stats.paid.textContent = summary ? String(summary.paidOrders) : "—";
  if (stats.issued) stats.issued.textContent = summary ? String(summary.issuedKeys) : "—";
  if (stats.methods) stats.methods.textContent = summary ? String(summary.activePaymentMethods) : "—";
  if (stats.webhookProcessed) stats.webhookProcessed.textContent = summary ? String(summary.webhookProcessed) : "—";
  if (stats.webhookIgnored) stats.webhookIgnored.textContent = summary ? String(summary.webhookIgnored) : "—";
  if (stats.webhookRejected) stats.webhookRejected.textContent = summary ? String(summary.webhookRejected) : "—";
  if (stats.webhookDuplicates) stats.webhookDuplicates.textContent = summary ? String(summary.webhookDuplicates) : "—";
  if (stats.deliveryReady) stats.deliveryReady.textContent = summary ? String(summary.deliveryReadyToSend ?? 0) : "—";
  if (stats.deliverySent) stats.deliverySent.textContent = summary ? String(summary.deliverySent ?? 0) : "—";
}

function renderRevenue(): void {
  const rep = dashboard?.revenueReport;

  if (revenue.estimate) revenue.estimate.textContent = rep ? `$${rep.estimatedRevenueUsd.toFixed(2)}` : "—";
  if (revenue.totalOrders) revenue.totalOrders.textContent = rep ? String(rep.totalOrders) : "—";
  if (revenue.paid) revenue.paid.textContent = rep ? String(rep.paidOrders) : "—";
  if (revenue.issued) revenue.issued.textContent = rep ? String(rep.issuedKeys) : "—";
  if (revenue.revoked) revenue.revoked.textContent = rep ? String(rep.revokedKeys) : "—";
  if (revenue.readyToSend) revenue.readyToSend.textContent = rep ? String(rep.deliveryReadyToSend) : "—";
  if (revenue.sent) revenue.sent.textContent = rep ? String(rep.deliverySent) : "—";

  if (mailerStatus) {
    mailerStatus.textContent = dashboard ? (dashboard.mailerConfigured ? msg.mailerOn : msg.mailerOff) : "—";
  }

  if (revenue.byMethod) {
    revenue.byMethod.innerHTML = !rep
      ? tableEmptyMarkup(
          msg.revenueEmptyTitle ?? "Revenue is locked",
          adminAuthenticated
            ? msg.revenueEmptyCopy ?? "Completed payments will show up here."
            : getLockedEmptyCopy(),
          3
        )
      : rep.byPaymentMethod.length === 0
        ? tableEmptyMarkup(
            msg.revenueEmptyTitle ?? "No payment method revenue yet",
            msg.revenueEmptyCopy ?? "Completed payments will show up here.",
            3
          )
        : rep.byPaymentMethod.map((row) => `
          <tr>
            <td data-label="${escapeHtml(msg.colName)}">${escapeHtml(row.methodName)}</td>
            <td data-label="${escapeHtml(msg.colOrders)}">${row.orders}</td>
            <td data-label="${escapeHtml(msg.colPaid)}">${row.paid}</td>
          </tr>
        `).join("");
  }

  if (revenue.byMonth) {
    revenue.byMonth.innerHTML = !rep
      ? tableEmptyMarkup(
          msg.revenueEmptyTitle ?? "Revenue is locked",
          adminAuthenticated
            ? msg.revenueEmptyCopy ?? "Completed payments will show up here."
            : getLockedEmptyCopy(),
          3
        )
      : rep.byMonth.length === 0
        ? tableEmptyMarkup(
            msg.revenueEmptyTitle ?? "No monthly revenue yet",
            msg.revenueEmptyCopy ?? "Completed payments will show up here.",
            3
          )
        : rep.byMonth.map((row) => `
          <tr>
            <td data-label="${escapeHtml(msg.colMonth ?? "Month")}">${escapeHtml(row.month)}</td>
            <td data-label="${escapeHtml(msg.colOrders)}">${row.orders}</td>
            <td data-label="${escapeHtml(msg.colIssued)}">${row.issued}</td>
          </tr>
        `).join("");
  }
}

function renderPaymentMethods(): void {
  if (!methodList) {
    return;
  }

  if (!dashboard) {
    methodList.innerHTML = tableEmptyMarkup(
      msg.methodsEmptyTitle ?? "Payment methods are locked",
      adminAuthenticated
        ? msg.methodsEmptyCopy ?? "Add the first payment method to publish checkout choices."
        : getLockedEmptyCopy(),
      5
    );
    return;
  }

  if (dashboard.paymentMethods.length === 0) {
    methodList.innerHTML = tableEmptyMarkup(
      msg.methodsEmptyTitle ?? "No payment methods yet",
      msg.methodsEmptyCopy ?? "Add the first payment method to publish checkout choices.",
      5
    );
    return;
  }

  methodList.innerHTML = dashboard.paymentMethods
    .map(
      (method) => `
        <tr>
          <td data-label="${escapeHtml(msg.colName)}">${escapeHtml(method.name)}</td>
          <td data-label="${escapeHtml(msg.colSummary)}">${escapeHtml(method.summary)}</td>
          <td data-label="${escapeHtml(msg.colAction)}">${escapeHtml(method.actionLabel || "Continue")}</td>
          <td data-label="${escapeHtml(msg.colEnabled)}">${statusPill(method.enabled ? msg.pillEnabled : msg.pillDisabled, method.enabled ? "success" : "neutral")}</td>
          <td data-label="${escapeHtml(msg.colActions)}" class="action-cell">
            <button class="ghost small" data-edit-method="${method.id}" type="button">
              ${msg.methodEditBtn ?? "Edit"}
            </button>
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
  if (!ordersList) {
    return;
  }

  if (!dashboard) {
    ordersList.innerHTML = tableEmptyMarkup(
      msg.ordersEmptyTitle ?? "Purchase requests are locked",
      adminAuthenticated
        ? msg.ordersEmptyCopy ?? "New purchase requests will appear here."
        : getLockedEmptyCopy(),
      6
    );
    return;
  }

  if (dashboard.orders.length === 0) {
    ordersList.innerHTML = tableEmptyMarkup(
      msg.ordersEmptyTitle ?? "No purchase requests yet",
      msg.ordersEmptyCopy ?? "New purchase requests will appear here.",
      6
    );
    return;
  }

  ordersList.innerHTML = dashboard.orders
    .map((order) => {
      const variant =
        order.status === "key_issued" ? "success" : order.status === "payment_confirmed" ? "neutral" : "warning";
      let nextActionMarkup = `<span class="table-subtle">${msg.noActions}</span>`;
      const actions: string[] = [];
      if (order.status === "pending") {
        nextActionMarkup = statusPill(msg.btnMarkPaid, "warning");
        actions.push(`<button class="ghost small" data-mark-paid="${order.id}" type="button">${msg.btnMarkPaid}</button>`);
      }
      if (order.status === "payment_confirmed") {
        nextActionMarkup = statusPill(msg.btnIssueKey, "neutral");
        actions.push(`<button class="ghost small" data-issue-license="${order.id}" type="button">${msg.btnIssueKey}</button>`);
      }
      if (order.status === "key_issued") {
        nextActionMarkup =
          order.deliveryStatus === "ready_to_send"
            ? statusPill(msg.btnSendEmail, "success")
            : order.deliveryStatus === "sent"
              ? statusPill(msg.statDeliverySent ?? "Delivered", "success")
              : statusPill(msg.btnPreviewEmail, "neutral");
        actions.push(`<button class="ghost small" data-email-preview="${order.id}" type="button">${msg.btnPreviewEmail}</button>`);
        actions.push(`<button class="ghost small" data-reissue="${order.id}" type="button">${msg.btnReissueKey}</button>`);
        if (order.deliveryStatus === "ready_to_send") {
          actions.push(`<button class="ghost small" data-send-email="${order.id}" type="button">${msg.btnSendEmail}</button>`);
        }
      }

      return `
        <tr>
          <td data-label="${escapeHtml(msg.colBuyer)}">
            <strong>${escapeHtml(order.buyerName)}</strong><br />
            <span class="table-subtle">${escapeHtml(order.buyerEmail)}</span>
          </td>
          <td data-label="${escapeHtml(msg.colMethod)}">${escapeHtml(paymentMethodName(order.paymentMethodId))}</td>
          <td data-label="${escapeHtml(msg.colStatus)}">${statusPill(order.status.replaceAll("_", " "), variant)}</td>
          <td data-label="${escapeHtml(msg.colAction)}" class="action-next">${nextActionMarkup}</td>
          <td data-label="${escapeHtml(msg.colCreated)}">${new Date(order.createdAt).toLocaleString()}</td>
          <td data-label="${escapeHtml(msg.colActions)}" class="action-cell">${actions.join("") || `<span class="table-subtle">${msg.noActions}</span>`}</td>
        </tr>
      `;
    })
    .join("");
}

function renderLicenses(): void {
  if (!licenseList) {
    return;
  }

  if (!dashboard) {
    licenseList.innerHTML = tableEmptyMarkup(
      msg.licensesEmptyTitle ?? "Issued keys are locked",
      adminAuthenticated
        ? msg.licensesEmptyCopy ?? "Issued keys will appear here."
        : getLockedEmptyCopy(),
      5
    );
    return;
  }

  if (dashboard.licenses.length === 0) {
    licenseList.innerHTML = tableEmptyMarkup(
      msg.licensesEmptyTitle ?? "No issued keys yet",
      msg.licensesEmptyCopy ?? "Issued keys will appear here.",
      5
    );
    return;
  }

  licenseList.innerHTML = dashboard.licenses
    .map(
      (license) => `
        <tr>
          <td data-label="${escapeHtml(msg.colHolder)}">
            <strong>${escapeHtml(license.holderName)}</strong><br />
            <span class="table-subtle">${escapeHtml(license.holderEmail)}</span>
          </td>
          <td data-label="${escapeHtml(msg.colIssuedAt)}">${new Date(license.issuedAt).toLocaleString()}</td>
          <td data-label="${escapeHtml(msg.colPreview)}"><code>${escapeHtml(license.tokenPreview)}</code></td>
          <td data-label="${escapeHtml(msg.colStatus)}">${statusPill(license.status, license.status === "active" ? "success" : "warning")}</td>
          <td data-label="${escapeHtml(msg.colActions)}" class="action-cell">
            ${license.status === "active" ? `<button class="ghost small" data-revoke-license="${license.id}" type="button">${msg.btnRevoke}</button>` : ""}
          </td>
        </tr>
      `
    )
    .join("");
}

function renderHistory(): void {
  if (!historyList) {
    return;
  }

  if (!dashboard) {
    historyList.innerHTML = tableEmptyMarkup(
      msg.historyEmptyTitle ?? "History is locked",
      adminAuthenticated
        ? msg.historyEmptyCopy ?? "Key, payment, and webhook events will appear here."
        : getLockedEmptyCopy(),
      6
    );
    return;
  }

  const events = dashboard.history.filter(matchesWebhookFilter);
  if (events.length === 0) {
    historyList.innerHTML = tableEmptyMarkup(
      msg.historyEmptyTitle ?? "No matching events",
      msg.noHistoryMatch,
      6
    );
    return;
  }

  historyList.innerHTML = events
    .map(
      (event) => `
        <tr>
          <td data-label="${escapeHtml(msg.colWhen)}">${new Date(event.createdAt).toLocaleString()}</td>
          <td data-label="${escapeHtml(msg.colEventKind)}">${statusPill(event.kind, historyKindVariant(event.kind))}</td>
          <td data-label="${escapeHtml(msg.colProvider)}">${escapeHtml(event.webhookProvider ?? "—")}</td>
          <td data-label="${escapeHtml(msg.colEventId)}">${escapeHtml(event.webhookEventId ?? "—")}</td>
          <td data-label="${escapeHtml(msg.colReason)}">${escapeHtml(event.webhookReason ?? "—")}</td>
          <td data-label="${escapeHtml(msg.colMessage)}">${escapeHtml(event.message)}</td>
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
  renderCollector();
  if (dashboard) {
    populateStorefrontForm(dashboard.settings);
  }
  if (runtimeConfig) {
    populateRuntimeForm(runtimeConfig);
    populateCollectorForm(runtimeConfig);
  }
}

async function refreshDashboard(): Promise<void> {
  dashboard = await requestAdmin<AdminDashboardResponse>("/api/admin/dashboard");
  collector = dashboard.collectorStatus ?? collector;
  renderAll();
  clearTokenFeedback();
}

async function refreshAdminData(): Promise<void> {
  const [nextDashboard, runtimeResponse] = await Promise.all([
    requestAdmin<AdminDashboardResponse>("/api/admin/dashboard"),
    requestAdmin<AdminRuntimeConfigResponse>("/api/admin/runtime-config")
  ]);
  dashboard = nextDashboard;
  runtimeConfig = runtimeResponse.config;
  runtimeSecretState = runtimeResponse.secretState;
  activeRuntimeDatabase = runtimeResponse.activeDatabase;
  collector = nextDashboard.collectorStatus ?? collector;
  renderAll();
  clearTokenFeedback();
}

async function refreshAdminSession(): Promise<boolean> {
  const session = await requestJson<AdminSessionResponse>("/api/admin/session");
  adminAuthenticated = session.authenticated === true;
  if (!adminAuthenticated) {
    clearAdminState();
    renderAll();
  }
  updateAdminSessionUi();
  return adminAuthenticated;
}

async function loginAdminSession(): Promise<void> {
  const token = tokenInput?.value.trim() ?? "";
  if (!token) {
    setTokenFeedback(msg.tokenStatusDefault, "warning");
    return;
  }

  const result = await runWithFeedback(
    () =>
      requestJson<AdminSessionResponse>("/api/admin/session/login", {
        method: "POST",
        body: JSON.stringify({ token })
      }),
    {
      statusEl: tokenStatus,
      busyTargets: [applyTokenButton, tokenInput],
      busyButtons: [{ button: applyTokenButton, label: msg.tokenSaving }],
      pendingText: msg.tokenSaving,
      errorFallback: msg.dashboardError
    }
  );
  if (!result) {
    return;
  }

  adminAuthenticated = true;
  updateAdminSessionUi();
  await refreshAdminData();
}

async function logoutAdminSession(): Promise<void> {
  const result = await runWithFeedback(
    () =>
      requestJson<AdminSessionResponse>("/api/admin/session/logout", {
        method: "POST",
        body: JSON.stringify({})
      }),
    {
      statusEl: tokenStatus,
      busyTargets: [logoutButton],
      busyButtons: [{ button: logoutButton, label: msg.tokenLoggingOut ?? "Signing out..." }],
      pendingText: msg.tokenLoggingOut ?? "Signing out..."
    }
  );
  if (!result) {
    return;
  }

  adminAuthenticated = false;
  clearAdminState();
  renderAll();
  updateAdminSessionUi();
  setTokenFeedback(msg.tokenCleared, "success");
}

async function handleMethodSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!methodForm) {
    return;
  }

  const formData = new FormData(methodForm);
  const methodId = formData.get("id")?.toString() ?? "";
  const payload = {
    name: formData.get("name")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    instructions: formData.get("instructions")?.toString() ?? "",
    actionLabel: formData.get("actionLabel")?.toString() ?? "",
    actionUrl: formData.get("actionUrl")?.toString() ?? "",
    enabled: formData.get("enabled") === "on",
    sortOrder: Number(formData.get("sortOrder")?.toString() ?? "0")
  };
  const saved = await runWithFeedback(
    () =>
      requestAdmin<PaymentMethod>(methodId ? `/api/admin/payment-methods/${methodId}` : "/api/admin/payment-methods", {
        method: methodId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      }),
    {
      statusEl: methodStatus,
      busyTargets: [methodForm],
      busyButtons: [{ button: methodSubmitButton, label: msg.methodSaving ?? "Saving payment method..." }],
      pendingText: msg.methodSaving ?? "Saving payment method...",
      errorFallback: msg.dashboardError
    }
  );
  if (!saved) {
    return;
  }

  resetMethodForm();
  setStatus(methodStatus, methodId ? msg.methodSaved ?? "Payment method updated." : msg.methodCreated ?? "Payment method created.", "success");
  await refreshDashboard();
}

async function togglePaymentMethod(methodId: string, actionButton?: HTMLButtonElement | null): Promise<void> {
  if (!dashboard) {
    return;
  }

  const method = dashboard.paymentMethods.find((candidate) => candidate.id === methodId);
  if (!method) {
    return;
  }

  const updated = await runWithFeedback(
    () =>
      requestAdmin<PaymentMethod>(`/api/admin/payment-methods/${methodId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...method,
          enabled: !method.enabled
        })
      }),
    {
      statusEl: methodStatus,
      busyTargets: actionButton ? [actionButton] : [],
      busyButtons: actionButton ? [{ button: actionButton, label: msg.methodSaving ?? "Updating payment method..." }] : [],
      pendingText: msg.methodSaving ?? "Updating payment method...",
      errorFallback: msg.dashboardError
    }
  );
  if (!updated) {
    return;
  }

  setStatus(methodStatus, msg.methodSaved ?? "Payment method updated.", "success");
  await refreshDashboard();
}

async function saveCollectorSettings(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const response = await runWithFeedback(
    () =>
      requestAdmin<AdminRuntimeConfigResponse & { collectorStatus?: BotMentionCollectorStatus }>(
        "/api/admin/runtime-config",
        {
          method: "PUT",
          body: JSON.stringify(parseCollectorForm())
        }
      ),
    {
      statusEl: collectorStatusText,
      busyTargets: [collectorForm, collectorSyncButton],
      busyButtons: [{ button: collectorSaveButton, label: msg.collectorSaving ?? "Saving collector settings..." }],
      pendingText: msg.collectorSaving ?? "Saving collector settings...",
      errorFallback: msg.dashboardError
    }
  );
  if (!response) {
    return;
  }

  runtimeConfig = response.config;
  runtimeSecretState = response.secretState;
  activeRuntimeDatabase = response.activeDatabase;
  collector = response.collectorStatus ?? collector;
  populateCollectorForm(runtimeConfig);
  renderCollector();
  setStatus(collectorStatusText, msg.collectorSaved ?? "Collector settings saved.", "success");
}

async function syncCollectorNow(): Promise<void> {
  const result = await runWithFeedback(
    () =>
      requestAdmin<{ status: BotMentionCollectorStatus }>("/api/admin/bot-collector/sync", {
        method: "POST",
        body: JSON.stringify({})
      }),
    {
      statusEl: collectorStatusText,
      busyTargets: [collectorSyncButton, collectorForm],
      busyButtons: [{ button: collectorSyncButton, label: msg.collectorSyncing ?? "Syncing mentions now..." }],
      pendingText: msg.collectorSyncing ?? "Syncing mentions now...",
      errorFallback: msg.dashboardError
    }
  );
  if (!result) {
    return;
  }

  collector = result.status;
  renderCollector();
  setStatus(collectorStatusText, msg.collectorSynced ?? "Collector sync completed.", "success");
}

async function saveRuntimeSettings(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const response = await runWithFeedback(
    () =>
      requestAdmin<AdminRuntimeConfigResponse & { migrated?: boolean; collectorStatus?: BotMentionCollectorStatus }>(
        "/api/admin/runtime-config",
        {
          method: "PUT",
          body: JSON.stringify(parseRuntimeConfigFromForm())
        }
      ),
    {
      statusEl: runtimeStatus,
      busyTargets: [runtimeForm, databaseTestButton, smtpTestButton],
      busyButtons: [{ button: runtimeSaveButton, label: msg.runtimeSaving ?? "Saving runtime settings..." }],
      pendingText: msg.runtimeSaving ?? "Saving runtime settings...",
      errorFallback: msg.dashboardError
    }
  );
  if (!response) {
    return;
  }

  runtimeConfig = response.config;
  runtimeSecretState = response.secretState;
  activeRuntimeDatabase = response.activeDatabase;
  collector = response.collectorStatus ?? collector;
  populateRuntimeForm(runtimeConfig);
  renderCollector();
  setStatus(
    runtimeStatus,
    response.databaseRestartRequired
      ? msg.runtimeRestartRequired ?? "Database settings were saved. Restart the server before using the new backend."
      : response.migrated
        ? msg.runtimeMigrated ?? "Runtime settings saved and data migrated to the new database."
        : msg.runtimeSaved ?? "Runtime settings saved.",
    response.databaseRestartRequired ? "warning" : "success"
  );
  await refreshDashboard();
}

async function testRuntimeDatabase(): Promise<void> {
  const result = await runWithFeedback(
    () =>
      requestAdmin<RuntimeConfigTestResult>("/api/admin/runtime-config/database/test", {
        method: "POST",
        body: JSON.stringify({
          database: parseRuntimeConfigFromForm().database
        })
      }),
    {
      statusEl: runtimeStatus,
      busyTargets: [databaseTestButton],
      busyButtons: [{ button: databaseTestButton, label: msg.databaseTesting ?? "Testing database connection..." }],
      pendingText: msg.databaseTesting ?? "Testing database connection...",
      errorFallback: msg.dashboardError
    }
  );
  if (!result) {
    return;
  }

  setStatus(runtimeStatus, result.message, "success");
}

async function testRuntimeSmtp(): Promise<void> {
  const result = await runWithFeedback(
    () =>
      requestAdmin<RuntimeConfigTestResult>("/api/admin/runtime-config/smtp/test", {
        method: "POST",
        body: JSON.stringify({
          smtp: parseRuntimeConfigFromForm().smtp
        })
      }),
    {
      statusEl: smtpStatus,
      busyTargets: [smtpTestButton],
      busyButtons: [{ button: smtpTestButton, label: msg.smtpTesting ?? "Testing SMTP connection..." }],
      pendingText: msg.smtpTesting ?? "Testing SMTP connection...",
      errorFallback: msg.dashboardError
    }
  );
  if (!result) {
    return;
  }

  setStatus(smtpStatus, result.message, "success");
}

async function saveStorefrontSettings(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const settings = await runWithFeedback(
    () =>
      requestAdmin<StorefrontSettings>("/api/admin/storefront-settings", {
        method: "PUT",
        body: JSON.stringify(parseStorefrontForm())
      }),
    {
      statusEl: storefrontStatus,
      busyTargets: [storefrontForm],
      busyButtons: [{ button: storefrontSaveButton, label: msg.storefrontSaving ?? "Saving storefront settings..." }],
      pendingText: msg.storefrontSaving ?? "Saving storefront settings...",
      errorFallback: msg.dashboardError
    }
  );
  if (!settings) {
    return;
  }

  if (dashboard) {
    dashboard.settings = settings;
  }
  populateStorefrontForm(settings);
  setStatus(storefrontStatus, msg.storefrontSaved ?? "Storefront settings saved.", "success");
}

async function previewEmail(orderId: string): Promise<EmailDeliveryDraft | null> {
  const draft = await runWithFeedback(
    () =>
      requestAdmin<EmailDeliveryDraft>(`/api/admin/orders/${orderId}/email-preview`, {
        method: "GET"
      }),
    {
      statusEl: emailStatus,
      busyTargets: [copyEmailButton],
      pendingText: msg.emailPreviewLoading ?? "Preparing email preview...",
      errorFallback: msg.dashboardError
    }
  );
  if (!draft) {
    return null;
  }

  currentEmailDraft = `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`;
  if (emailPreview) {
    emailPreview.value = currentEmailDraft;
  }
  setStatus(emailStatus, msg.emailDraftReady.replace("{email}", draft.to), "success");
  return draft;
}

async function handleOrderAction(target: HTMLElement): Promise<void> {
  const actionButton = target.closest("button");
  if (!(actionButton instanceof HTMLButtonElement)) {
    return;
  }

  const markPaidId = actionButton.getAttribute("data-mark-paid");
  const issueLicenseId = actionButton.getAttribute("data-issue-license");
  const emailPreviewId = actionButton.getAttribute("data-email-preview");
  const reissueId = actionButton.getAttribute("data-reissue");
  const sendEmailId = actionButton.getAttribute("data-send-email");

  if (markPaidId) {
    const order = await runWithFeedback(
      () =>
        requestAdmin<PurchaseOrder>(`/api/admin/orders/${markPaidId}/mark-paid`, {
          method: "POST",
          body: JSON.stringify({})
        }),
      {
        statusEl: ordersStatus,
        busyTargets: [actionButton],
        busyButtons: [{ button: actionButton, label: msg.orderMarkingPaid ?? "Marking the order as paid..." }],
        pendingText: msg.orderMarkingPaid ?? "Marking the order as paid...",
        errorFallback: msg.dashboardError
      }
    );
    if (!order) {
      return;
    }

    setStatus(
      ordersStatus,
      (msg.orderMarkedPaid ?? "Marked the order for {email} as paid.").replace("{email}", order.buyerEmail),
      "success"
    );
    await refreshDashboard();
    return;
  }

  if (issueLicenseId || reissueId) {
    const expiry = parseExpiryIsoFromInput();
    if (!expiry.ok) {
      setStatus(emailStatus, msg.issueExpiryInvalid ?? "Expiry must be a valid YYYY-MM-DD date.", "error");
      issueExpiryInput?.focus();
      return;
    }

    const orderId = issueLicenseId ?? reissueId;
    const isReissue = Boolean(reissueId);
    const result = await runWithFeedback(
      () =>
        requestAdmin<{ license: LicenseRecord; emailDraft: EmailDeliveryDraft; autoSent?: boolean }>(
          `/api/admin/orders/${orderId}/${isReissue ? "reissue" : "issue-license"}`,
          {
            method: "POST",
            body: JSON.stringify({ expiresAt: expiry.iso })
          }
        ),
      {
        statusEl: ordersStatus,
        busyTargets: [actionButton, copyEmailButton],
        busyButtons: [
          {
            button: actionButton,
            label: isReissue
              ? msg.keyReissuing ?? "Reissuing a key..."
              : msg.keyIssuing ?? "Issuing a key..."
          }
        ],
        pendingText: isReissue
          ? msg.keyReissuing ?? "Reissuing a key..."
          : msg.keyIssuing ?? "Issuing a key...",
        errorFallback: msg.dashboardError
      }
    );
    if (!result) {
      return;
    }

    currentEmailDraft = `To: ${result.emailDraft.to}\nSubject: ${result.emailDraft.subject}\n\n${result.emailDraft.body}`;
    if (emailPreview) {
      emailPreview.value = currentEmailDraft;
    }

    const issuedMessage = isReissue
      ? msg.keyReissued.replace("{email}", result.license.holderEmail)
      : msg.keyIssued.replace("{email}", result.license.holderEmail);
    const emailMessage = result.autoSent
      ? msg.emailSent.replace("{email}", result.license.holderEmail)
      : msg.emailDraftReady.replace("{email}", result.emailDraft.to);

    setStatus(ordersStatus, issuedMessage, "success");
    setStatus(licensesStatus, issuedMessage, "success");
    setStatus(emailStatus, result.autoSent ? `${issuedMessage} · ${emailMessage}` : emailMessage, "success");
    if (issueExpiryInput) {
      issueExpiryInput.value = "";
    }
    await refreshDashboard();
    return;
  }

  if (sendEmailId) {
    const result = await runWithFeedback(
      () =>
        requestAdmin<{ sent: boolean; to: string }>(`/api/admin/orders/${sendEmailId}/send-email`, {
          method: "POST",
          body: JSON.stringify({})
        }),
      {
        statusEl: ordersStatus,
        busyTargets: [actionButton, copyEmailButton],
        busyButtons: [{ button: actionButton, label: msg.emailSending ?? "Sending email..." }],
        pendingText: msg.emailSending ?? "Sending email...",
        errorFallback: msg.dashboardError
      }
    );
    if (!result) {
      return;
    }

    const sentMessage = msg.emailSent.replace("{email}", result.to);
    setStatus(ordersStatus, sentMessage, "success");
    setStatus(emailStatus, sentMessage, "success");
    await refreshDashboard();
    return;
  }

  if (emailPreviewId) {
    const draft = await previewEmail(emailPreviewId);
    if (!draft) {
      return;
    }

    setStatus(
      ordersStatus,
      msg.emailDraftReady.replace("{email}", draft.to),
      "success"
    );
  }
}

async function handleLicenseAction(target: HTMLElement): Promise<void> {
  const actionButton = target.closest("button");
  if (!(actionButton instanceof HTMLButtonElement)) {
    return;
  }

  const revokeId = actionButton.getAttribute("data-revoke-license");
  if (!revokeId) {
    return;
  }

  const license = await runWithFeedback(
    () =>
      requestAdmin<LicenseRecord>(`/api/admin/licenses/${revokeId}/revoke`, {
        method: "POST",
        body: JSON.stringify({})
      }),
    {
      statusEl: licensesStatus,
      busyTargets: [actionButton],
      busyButtons: [{ button: actionButton, label: msg.licenseRevoking ?? "Revoking the key..." }],
      pendingText: msg.licenseRevoking ?? "Revoking the key...",
      errorFallback: msg.dashboardError
    }
  );
  if (!license) {
    return;
  }

  setStatus(
    licensesStatus,
    (msg.licenseRevoked ?? "Revoked the key for {email}.").replace("{email}", license.holderEmail),
    "success"
  );
  await refreshDashboard();
}

function applyLocale(locale: WebLocale): void {
  msg = adminMessages[locale];
  document.documentElement.lang = locale;
  applyTranslations(msg as unknown as Record<string, string>);
  applyLangToggle(locale);
  renderAll();
  updateAdminSessionUi();
}

function bindEvents(): void {
  for (const element of statusElements) {
    element.setAttribute("aria-live", "polite");
    element.setAttribute("role", "status");
  }

  applyTokenButton?.addEventListener("click", () => {
    void loginAdminSession().catch((error) => {
      setTokenFeedback(error instanceof Error ? error.message : msg.dashboardError, "error");
    });
  });

  logoutButton?.addEventListener("click", () => {
    void logoutAdminSession().catch((error) => {
      setTokenFeedback(error instanceof Error ? error.message : msg.dashboardError, "error");
    });
  });

  tokenInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    void loginAdminSession().catch((error) => {
      setTokenFeedback(error instanceof Error ? error.message : msg.dashboardError, "error");
    });
  });

  reloadButton?.addEventListener("click", () => {
    void refreshAdminData().catch((error) => {
      setTokenFeedback(error instanceof Error ? error.message : msg.dashboardError, "error");
    });
  });

  methodForm?.addEventListener("submit", (event) => {
    void handleMethodSubmit(event);
  });

  methodCancelButton?.addEventListener("click", () => {
    resetMethodForm();
    if (methodStatus) {
      methodStatus.textContent = msg.methodEditCancelled ?? "Edit cancelled.";
    }
  });

  methodList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const editId = target.getAttribute("data-edit-method");
    if (editId && dashboard) {
      const method = dashboard.paymentMethods.find((candidate) => candidate.id === editId);
      if (method) {
        beginMethodEdit(method);
      }
      return;
    }

    const methodId = target.getAttribute("data-toggle-method");
    if (methodId) {
      void togglePaymentMethod(methodId, target.closest("button"));
    }
  });

  collectorForm?.addEventListener("submit", (event) => {
    const handleField = collectorForm.elements.namedItem("botHandle");
    if (handleField instanceof HTMLInputElement) {
      const normalizedHandle = handleField.value.trim().replace(/^@+/, "").toLowerCase();
      if (!normalizedHandle || !/^[a-z0-9._]+$/.test(normalizedHandle)) {
        event.preventDefault();
        setStatus(collectorStatusText, "Enter a valid Threads bot handle.", "error");
        handleField.focus();
        return;
      }

      handleField.value = normalizedHandle;
      updateCollectorHandlePreview(normalizedHandle);
    }

    void saveCollectorSettings(event);
  });

  const collectorHandleField = collectorForm?.elements.namedItem("botHandle");
  if (collectorHandleField instanceof HTMLInputElement) {
    collectorHandleField.addEventListener("input", () => {
      updateCollectorHandlePreview(collectorHandleField.value);
    });
  }

  collectorSyncButton?.addEventListener("click", () => {
    void syncCollectorNow();
  });

  runtimeForm?.addEventListener("submit", (event) => {
    void saveRuntimeSettings(event);
  });

  databaseTestButton?.addEventListener("click", () => {
    void testRuntimeDatabase();
  });

  smtpTestButton?.addEventListener("click", () => {
    void testRuntimeSmtp();
  });

  storefrontForm?.addEventListener("submit", (event) => {
    void saveStorefrontSettings(event);
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
      setStatus(emailStatus, msg.nothingToCopy, "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentEmailDraft);
      setStatus(emailStatus, msg.emailCopied, "success");
    } catch (error) {
      setStatus(emailStatus, error instanceof Error ? error.message : msg.dashboardError, "error");
    }
  });

  issueExpiryClearButton?.addEventListener("click", () => {
    if (issueExpiryInput) {
      issueExpiryInput.value = "";
      issueExpiryInput.focus();
    }
    setStatus(emailStatus, msg.issueExpiryHint ?? "Leave it empty for a key without expiry.");
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
  bindEvents();
  resetMethodForm();
  renderAll();
  updateAdminSessionUi();

  let authenticated = false;
  try {
    authenticated = await refreshAdminSession();
  } catch (error) {
    setTokenFeedback(error instanceof Error ? error.message : msg.dashboardError, "error");
  }

  if (!authenticated) {
    return;
  }

  try {
    await refreshAdminData();
  } catch (error) {
    setTokenFeedback(error instanceof Error ? error.message : msg.dashboardError, "error");
  }
})();
