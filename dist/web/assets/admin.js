// src/web/lib/web-i18n.ts
var LS_KEY = "web-locale";
function getLocale(fallback = "ko") {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "ko" || v === "en") return v;
  } catch {
  }
  return fallback;
}
function setLocale(locale) {
  try {
    localStorage.setItem(LS_KEY, locale);
  } catch {
  }
}
function applyTranslations(dict) {
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key = el.getAttribute("data-i18n");
    if (key in dict) el.textContent = dict[key];
  }
  for (const el of document.querySelectorAll("[data-i18n-ph]")) {
    const key = el.getAttribute("data-i18n-ph");
    if (key in dict) el.placeholder = dict[key];
  }
}
function applyLangToggle(locale) {
  for (const btn of document.querySelectorAll("[data-web-locale]")) {
    btn.classList.toggle("web-lang-btn-active", btn.dataset.webLocale === locale);
  }
}
function bindLangToggle(onSwitch) {
  for (const btn of document.querySelectorAll("[data-web-locale]")) {
    btn.addEventListener("click", () => {
      const next = btn.dataset.webLocale;
      if (next !== "ko" && next !== "en") return;
      setLocale(next);
      onSwitch(next);
    });
  }
}
var adminMessages = {
  ko: {
    adminH1: "\uACB0\uC81C, \uBC1C\uAE09, \uC804\uB2EC \uAD00\uB9AC",
    adminLead: "\uACB0\uC81C \uC218\uB2E8 \uAD00\uB9AC, \uAD6C\uB9E4 \uC694\uCCAD \uAC80\uD1A0, Pro \uD0A4 \uBC1C\uAE09, \uC218\uB3D9 \uC774\uBA54\uC77C \uC804\uB2EC\uC744 \uC704\uD55C \uAD00\uB9AC\uC790 \uD328\uB110\uC785\uB2C8\uB2E4.",
    tokenLabel: "\uAD00\uB9AC\uC790 \uD1A0\uD070",
    tokenApply: "\uC801\uC6A9",
    tokenStatusDefault: "/api/admin/* \uC811\uADFC\uC744 \uC704\uD574 \uD1A0\uD070\uC774 \uD544\uC694\uD569\uB2C8\uB2E4",
    statPending: "\uBBF8\uACB0 \uC8FC\uBB38",
    statPaid: "\uACB0\uC81C \uD655\uC778, \uD0A4 \uB300\uAE30",
    statIssued: "\uBC1C\uAE09\uB41C \uD0A4",
    statMethods: "\uD65C\uC131 \uACB0\uC81C \uC218\uB2E8",
    statWebhookProcessed: "\uC6F9\uD6C5 \uCC98\uB9AC\uB428",
    statWebhookIgnored: "\uC6F9\uD6C5 \uBB34\uC2DC\uB428",
    statWebhookRejected: "\uC6F9\uD6C5 \uAC70\uBD80\uB428",
    statWebhookDuplicates: "\uC6F9\uD6C5 \uC911\uBCF5 \uAC10\uC9C0",
    paymentMethodsTitle: "\uACB0\uC81C \uC218\uB2E8",
    paymentMethodsCopy: "\uD65C\uC131\uD654\uB41C \uC218\uB2E8\uB9CC \uB79C\uB529 \uD398\uC774\uC9C0\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
    reloadBtn: "\uC0C8\uB85C\uACE0\uCE68",
    colName: "\uC774\uB984",
    colSummary: "\uC694\uC57D",
    colAction: "\uC561\uC158",
    colEnabled: "\uD65C\uC131",
    colActions: "\uAD00\uB9AC",
    methodNameLabel: "\uACB0\uC81C \uC218\uB2E8 \uC774\uB984",
    methodSortLabel: "\uC815\uB82C \uC21C\uC11C",
    methodSummaryLabel: "\uC694\uC57D",
    methodInstructionsLabel: "\uC548\uB0B4\uC0AC\uD56D",
    methodCtaLabel: "CTA \uB808\uC774\uBE14",
    methodActionUrlLabel: "\uC678\uBD80 \uB9C1\uD06C",
    methodEnabledLabel: "\uD65C\uC131",
    addMethodBtn: "\uACB0\uC81C \uC218\uB2E8 \uCD94\uAC00",
    ordersTitle: "\uAD6C\uB9E4 \uC694\uCCAD",
    ordersCopy: "\uACB0\uC81C \uD655\uC778 \uD6C4 \uD0A4\uB97C \uBC1C\uAE09\uD558\uACE0, \uC774\uBA54\uC77C \uCD08\uC548\uC744 \uBCF5\uC0AC\uD558\uC138\uC694.",
    colBuyer: "\uAD6C\uB9E4\uC790",
    colMethod: "\uACB0\uC81C \uC218\uB2E8",
    colStatus: "\uC0C1\uD0DC",
    colCreated: "\uC0DD\uC131\uC77C",
    licensesTitle: "\uBC1C\uAE09\uB41C \uD0A4",
    licensesCopy: "\uC0DD\uC131\uB41C \uBAA8\uB4E0 \uD0A4\uB294 \uBBF8\uB9AC\uBCF4\uAE30, \uC218\uB839\uC778, \uC0C1\uD0DC\uC640 \uD568\uAED8 \uC800\uC7A5\uB429\uB2C8\uB2E4.",
    colHolder: "\uC218\uB839\uC778",
    colIssuedAt: "\uBC1C\uAE09\uC77C",
    colPreview: "\uBBF8\uB9AC\uBCF4\uAE30",
    emailDraftTitle: "\uC774\uBA54\uC77C \uCD08\uC548",
    emailDraftCopy: "\uB2E8\uC21C\uD558\uACE0 \uCD94\uC801 \uAC00\uB2A5\uD558\uBA70 \uC624\uD504\uB77C\uC778 \uD0A4 \uC804\uB2EC\uC5D0 \uCD5C\uC801\uD654\uB41C \uBC29\uC2DD\uC785\uB2C8\uB2E4.",
    emailPreviewLabel: "\uBBF8\uB9AC\uBCF4\uAE30",
    copyEmailBtn: "\uC774\uBA54\uC77C \uCD08\uC548 \uBCF5\uC0AC",
    emailStatusDefault: "\uBC1C\uAE09\uB41C \uC8FC\uBB38\uC744 \uC120\uD0DD\uD558\uBA74 \uC804\uB2EC \uD14D\uC2A4\uD2B8\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
    historyTitle: "\uC774\uBCA4\uD2B8 \uAE30\uB85D",
    historyCopy: "\uD0A4, \uACB0\uC81C, \uC6F9\uD6C5 \uC774\uBCA4\uD2B8 \uB0B4\uC5ED (\uAC70\uBD80\xB7\uC911\uBCF5\xB7\uBB34\uC2DC \uD3EC\uD568).",
    filterKindLabel: "\uC885\uB958",
    filterProviderLabel: "\uD504\uB85C\uBC14\uC774\uB354",
    filterReasonLabel: "\uC774\uC720",
    allOption: "\uC804\uCCB4",
    colWhen: "\uC2DC\uAC04",
    colEventKind: "\uC774\uBCA4\uD2B8",
    colProvider: "\uD504\uB85C\uBC14\uC774\uB354",
    colEventId: "\uC774\uBCA4\uD2B8 ID",
    colReason: "\uC774\uC720",
    colMessage: "\uBA54\uC2DC\uC9C0",
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    dashboardLoaded: "\uB300\uC2DC\uBCF4\uB4DC \uB85C\uB4DC \uC644\uB8CC",
    tokenSaving: "\uD1A0\uD070 \uC800\uC7A5\uB428. \uB300\uC2DC\uBCF4\uB4DC \uB85C\uB529 \uC911...",
    tokenCleared: "\uD1A0\uD070 \uCD08\uAE30\uD654\uB428",
    dashboardError: "\uB300\uC2DC\uBCF4\uB4DC\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    noHistoryMatch: "\uC120\uD0DD\uD55C \uD544\uD130\uC5D0 \uB9DE\uB294 \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    btnEnable: "\uD65C\uC131\uD654",
    btnDisable: "\uBE44\uD65C\uC131\uD654",
    btnMarkPaid: "\uACB0\uC81C \uD655\uC778",
    btnIssueKey: "\uD0A4 \uBC1C\uAE09",
    btnPreviewEmail: "\uC774\uBA54\uC77C \uBBF8\uB9AC\uBCF4\uAE30",
    btnReissueKey: "\uC7AC\uBC1C\uAE09",
    btnSendEmail: "\uC774\uBA54\uC77C \uBC1C\uC1A1",
    btnRevoke: "\uD3D0\uAE30",
    noActions: "\uB3D9\uC791 \uC5C6\uC74C",
    pillEnabled: "\uD65C\uC131",
    pillDisabled: "\uBE44\uD65C\uC131",
    emailDraftReady: "{email} \uCD08\uC548 \uC900\uBE44\uB428",
    keyIssued: "{email}\uC5D0 \uD0A4 \uBC1C\uAE09\uB428",
    keyReissued: "{email}\uC5D0 \uD0A4 \uC7AC\uBC1C\uAE09\uB428",
    emailSent: "{email}\uB85C \uC774\uBA54\uC77C \uBC1C\uC1A1 \uC644\uB8CC",
    emailSendError: "\uC774\uBA54\uC77C \uBC1C\uC1A1 \uC2E4\uD328: {error}",
    nothingToCopy: "\uBCF5\uC0AC\uD560 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    emailCopied: "\uC774\uBA54\uC77C \uCD08\uC548\uC774 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB410\uC2B5\uB2C8\uB2E4.",
    requestFailed: "\uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
    revenueTitle: "\uB9E4\uCD9C \uD604\uD669",
    revenueCopy: "\uACB0\uC81C \uC644\uB8CC \uAE30\uC900 \uC608\uC0C1 \uB9E4\uCD9C\uC785\uB2C8\uB2E4. \uC2E4\uC81C \uC218\uB839\uC561\uACFC \uB2E4\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    revenueEstimate: "\uC608\uC0C1 \uB9E4\uCD9C",
    revenueTotalOrders: "\uC804\uCCB4 \uC8FC\uBB38",
    revenuePaid: "\uACB0\uC81C \uC644\uB8CC",
    revenueIssued: "\uD0A4 \uBC1C\uAE09\uB428",
    revenueRevoked: "\uD3D0\uAE30\uB41C \uD0A4",
    revenueReadyToSend: "\uBC1C\uC1A1 \uB300\uAE30",
    revenueSent: "\uBC1C\uC1A1 \uC644\uB8CC",
    revenueByMethod: "\uACB0\uC81C\uC218\uB2E8\uBCC4",
    revenueByMonth: "\uC6D4\uBCC4 \uC8FC\uBB38",
    colOrders: "\uC8FC\uBB38\uC218",
    colPaid: "\uACB0\uC81C",
    colIssued: "\uBC1C\uAE09",
    mailerOn: "\uC774\uBA54\uC77C \uC790\uB3D9 \uBC1C\uC1A1: \uCF1C\uC9D0",
    mailerOff: "\uC774\uBA54\uC77C \uC790\uB3D9 \uBC1C\uC1A1: \uAEBC\uC9D0 (\uC218\uB3D9 \uBC1C\uC1A1 \uD544\uC694)",
    statDeliveryReady: "\uBC1C\uC1A1 \uB300\uAE30",
    statDeliverySent: "\uBC1C\uC1A1 \uC644\uB8CC"
  },
  en: {
    adminH1: "Payments, issuance, and delivery",
    adminLead: "Manage accepted payment methods, review purchase requests, issue signed Pro keys, and keep an auditable history for manual email delivery.",
    tokenLabel: "Admin token",
    tokenApply: "Apply",
    tokenStatusDefault: "Token required for /api/admin/*",
    statPending: "Pending orders",
    statPaid: "Paid, awaiting key",
    statIssued: "Issued keys",
    statMethods: "Active payment methods",
    statWebhookProcessed: "Webhook processed",
    statWebhookIgnored: "Webhook ignored",
    statWebhookRejected: "Webhook rejected",
    statWebhookDuplicates: "Webhook retries detected",
    paymentMethodsTitle: "Payment methods",
    paymentMethodsCopy: "Public landing page reads only enabled methods from here.",
    reloadBtn: "Reload dashboard",
    colName: "Name",
    colSummary: "Summary",
    colAction: "Action",
    colEnabled: "Enabled",
    colActions: "Actions",
    methodNameLabel: "Method name",
    methodSortLabel: "Sort order",
    methodSummaryLabel: "Summary",
    methodInstructionsLabel: "Instructions",
    methodCtaLabel: "CTA label",
    methodActionUrlLabel: "External action URL",
    methodEnabledLabel: "Enabled",
    addMethodBtn: "Add payment method",
    ordersTitle: "Purchase requests",
    ordersCopy: "Mark payment, issue a key, then copy the email draft.",
    colBuyer: "Buyer",
    colMethod: "Method",
    colStatus: "Status",
    colCreated: "Created",
    licensesTitle: "Issued keys",
    licensesCopy: "Every generated key is stored with preview, holder, and status.",
    colHolder: "Holder",
    colIssuedAt: "Issued at",
    colPreview: "Preview",
    emailDraftTitle: "Email delivery draft",
    emailDraftCopy: "Email works well for this product because it is simple, auditable, and fits paste-in offline keys.",
    emailPreviewLabel: "Preview",
    copyEmailBtn: "Copy email draft",
    emailStatusDefault: "Select an issued order to preview delivery text.",
    historyTitle: "History",
    historyCopy: "Recent key, payment, and webhook events (including rejected/duplicate/ignored cases).",
    filterKindLabel: "Kind",
    filterProviderLabel: "Provider",
    filterReasonLabel: "Reason",
    allOption: "All",
    colWhen: "When",
    colEventKind: "Event kind",
    colProvider: "Provider",
    colEventId: "Event ID",
    colReason: "Reason",
    colMessage: "Message",
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    dashboardLoaded: "Dashboard loaded",
    tokenSaving: "Token saved locally. Loading dashboard...",
    tokenCleared: "Token cleared",
    dashboardError: "Could not load dashboard",
    noHistoryMatch: "No events match the selected filters.",
    btnEnable: "Enable",
    btnDisable: "Disable",
    btnMarkPaid: "Mark paid",
    btnIssueKey: "Issue key",
    btnPreviewEmail: "Preview email",
    btnReissueKey: "Reissue",
    btnSendEmail: "Send email",
    btnRevoke: "Revoke",
    noActions: "No actions",
    pillEnabled: "enabled",
    pillDisabled: "disabled",
    emailDraftReady: "Draft ready for {email}",
    keyIssued: "Issued key for {email}",
    keyReissued: "Reissued key for {email}",
    emailSent: "Email sent to {email}",
    emailSendError: "Email send failed: {error}",
    nothingToCopy: "Nothing to copy yet.",
    emailCopied: "Email draft copied to clipboard.",
    requestFailed: "Admin request failed.",
    revenueTitle: "Revenue",
    revenueCopy: "Estimated from completed payments. May differ from actual amounts received.",
    revenueEstimate: "Estimated revenue",
    revenueTotalOrders: "Total orders",
    revenuePaid: "Paid",
    revenueIssued: "Keys issued",
    revenueRevoked: "Revoked keys",
    revenueReadyToSend: "Awaiting delivery",
    revenueSent: "Delivered",
    revenueByMethod: "By payment method",
    revenueByMonth: "Monthly orders",
    colOrders: "Orders",
    colPaid: "Paid",
    colIssued: "Issued",
    mailerOn: "Auto email delivery: ON",
    mailerOff: "Auto email delivery: OFF (manual delivery required)",
    statDeliveryReady: "Awaiting delivery",
    statDeliverySent: "Delivered"
  }
};

// src/web/admin/main.ts
var ADMIN_TOKEN_KEY = "threads-pro-admin-token";
var methodList = document.getElementById("method-list");
var ordersList = document.getElementById("orders-list");
var historyList = document.getElementById("history-list");
var licenseList = document.getElementById("license-history");
var emailPreview = document.getElementById("email-preview");
var emailStatus = document.getElementById("email-status");
var copyEmailButton = document.getElementById("copy-email");
var tokenInput = document.getElementById("admin-token");
var tokenStatus = document.getElementById("token-status");
var applyTokenButton = document.getElementById("token-apply");
var reloadButton = document.getElementById("reload-all");
var methodForm = document.getElementById("method-form");
var historyKindFilter = document.getElementById("history-filter-kind");
var historyProviderFilter = document.getElementById("history-filter-provider");
var historyReasonFilter = document.getElementById("history-filter-reason");
var stats = {
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
var revenue = {
  estimate: document.getElementById("rev-estimate"),
  totalOrders: document.getElementById("rev-total-orders"),
  paid: document.getElementById("rev-paid"),
  issued: document.getElementById("rev-issued"),
  revoked: document.getElementById("rev-revoked"),
  readyToSend: document.getElementById("rev-ready-to-send"),
  sent: document.getElementById("rev-sent"),
  byMethod: document.getElementById("rev-by-method"),
  byMonth: document.getElementById("rev-by-month")
};
var mailerStatus = document.getElementById("mailer-status");
var dashboard = null;
var currentEmailDraft = "";
var adminTokenState = "";
var msg = adminMessages.en;
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function getAdminToken() {
  return adminTokenState;
}
function setAdminToken(token) {
  adminTokenState = token;
  try {
    if (!token) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      return;
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    return;
  } catch {
  }
}
async function requestAdmin(url, init) {
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
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || msg.requestFailed);
  }
  return payload;
}
function statusPill(label, variant) {
  return `<span class="status-pill ${variant}">${label}</span>`;
}
function historyKindVariant(kind) {
  if (kind === "webhook_processed" || kind === "license_issued") {
    return "success";
  }
  if (kind === "webhook_rejected" || kind === "webhook_ignored") {
    return "warning";
  }
  return kind === "order_paid" ? "neutral" : "success";
}
function paymentMethodName(methodId) {
  return dashboard?.paymentMethods.find((method) => method.id === methodId)?.name ?? methodId;
}
function getHistoryFilters() {
  return {
    kind: historyKindFilter?.value ?? "",
    provider: historyProviderFilter?.value ?? "",
    reason: historyReasonFilter?.value ?? ""
  };
}
function matchesWebhookFilter(event) {
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
function renderStats() {
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
function renderRevenue() {
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
    revenue.byMethod.innerHTML = rep.byPaymentMethod.length === 0 ? `<tr><td colspan="3" class="table-subtle">\u2014</td></tr>` : rep.byPaymentMethod.map((row) => `
          <tr>
            <td>${escapeHtml(row.methodName)}</td>
            <td>${row.orders}</td>
            <td>${row.paid}</td>
          </tr>
        `).join("");
  }
  if (revenue.byMonth) {
    revenue.byMonth.innerHTML = rep.byMonth.length === 0 ? `<tr><td colspan="3" class="table-subtle">\u2014</td></tr>` : rep.byMonth.map((row) => `
          <tr>
            <td>${escapeHtml(row.month)}</td>
            <td>${row.orders}</td>
            <td>${row.issued}</td>
          </tr>
        `).join("");
  }
}
function renderPaymentMethods() {
  if (!dashboard || !methodList) {
    return;
  }
  methodList.innerHTML = dashboard.paymentMethods.map(
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
  ).join("");
}
function renderOrders() {
  if (!dashboard || !ordersList) {
    return;
  }
  ordersList.innerHTML = dashboard.orders.map((order) => {
    const variant = order.status === "key_issued" ? "success" : order.status === "payment_confirmed" ? "neutral" : "warning";
    const actions = [];
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
  }).join("");
}
function renderLicenses() {
  if (!dashboard || !licenseList) {
    return;
  }
  licenseList.innerHTML = dashboard.licenses.map(
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
  ).join("");
}
function renderHistory() {
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
  historyList.innerHTML = events.map(
    (event) => `
        <tr>
          <td>${new Date(event.createdAt).toLocaleString()}</td>
          <td>${statusPill(event.kind, historyKindVariant(event.kind))}</td>
          <td>${escapeHtml(event.webhookProvider ?? "\u2014")}</td>
          <td>${escapeHtml(event.webhookEventId ?? "\u2014")}</td>
          <td>${escapeHtml(event.webhookReason ?? "\u2014")}</td>
          <td>${escapeHtml(event.message)}</td>
        </tr>
      `
  ).join("");
}
function renderAll() {
  renderStats();
  renderRevenue();
  renderPaymentMethods();
  renderOrders();
  renderLicenses();
  renderHistory();
}
async function refreshDashboard() {
  dashboard = await requestAdmin("/api/admin/dashboard");
  renderAll();
  if (tokenStatus) {
    tokenStatus.textContent = msg.dashboardLoaded;
  }
}
async function handleMethodSubmit(event) {
  event.preventDefault();
  if (!methodForm) {
    return;
  }
  const formData = new FormData(methodForm);
  await requestAdmin("/api/admin/payment-methods", {
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
async function togglePaymentMethod(methodId) {
  if (!dashboard) {
    return;
  }
  const method = dashboard.paymentMethods.find((candidate) => candidate.id === methodId);
  if (!method) {
    return;
  }
  await requestAdmin(`/api/admin/payment-methods/${methodId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...method,
      enabled: !method.enabled
    })
  });
  await refreshDashboard();
}
async function previewEmail(orderId) {
  const draft = await requestAdmin(`/api/admin/orders/${orderId}/email-preview`, {
    method: "GET"
  });
  currentEmailDraft = `To: ${draft.to}
Subject: ${draft.subject}

${draft.body}`;
  if (emailPreview) {
    emailPreview.value = currentEmailDraft;
  }
  if (emailStatus) {
    emailStatus.textContent = msg.emailDraftReady.replace("{email}", draft.to);
  }
}
async function handleOrderAction(target) {
  const markPaidId = target.getAttribute("data-mark-paid");
  const issueLicenseId = target.getAttribute("data-issue-license");
  const emailPreviewId = target.getAttribute("data-email-preview");
  const reissueId = target.getAttribute("data-reissue");
  const sendEmailId = target.getAttribute("data-send-email");
  if (markPaidId) {
    await requestAdmin(`/api/admin/orders/${markPaidId}/mark-paid`, {
      method: "POST",
      body: JSON.stringify({})
    });
    await refreshDashboard();
    return;
  }
  if (issueLicenseId) {
    const expiresAt = window.prompt("Optional expiry date (YYYY-MM-DD). Leave blank for no expiry.", "") || "";
    const payload = {
      expiresAt: expiresAt ? (/* @__PURE__ */ new Date(`${expiresAt}T00:00:00.000Z`)).toISOString() : null
    };
    const result = await requestAdmin(
      `/api/admin/orders/${issueLicenseId}/issue-license`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    currentEmailDraft = `To: ${result.emailDraft.to}
Subject: ${result.emailDraft.subject}

${result.emailDraft.body}`;
    if (emailPreview) {
      emailPreview.value = currentEmailDraft;
    }
    if (emailStatus) {
      const base = msg.keyIssued.replace("{email}", result.license.holderEmail);
      emailStatus.textContent = result.autoSent ? `${base} \xB7 ${msg.emailSent.replace("{email}", result.license.holderEmail)}` : base;
    }
    await refreshDashboard();
    return;
  }
  if (reissueId) {
    const expiresAt = window.prompt("Optional expiry date (YYYY-MM-DD). Leave blank for no expiry.", "") || "";
    const payload = {
      expiresAt: expiresAt ? (/* @__PURE__ */ new Date(`${expiresAt}T00:00:00.000Z`)).toISOString() : null
    };
    const result = await requestAdmin(
      `/api/admin/orders/${reissueId}/reissue`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    currentEmailDraft = `To: ${result.emailDraft.to}
Subject: ${result.emailDraft.subject}

${result.emailDraft.body}`;
    if (emailPreview) {
      emailPreview.value = currentEmailDraft;
    }
    if (emailStatus) {
      const base = msg.keyReissued.replace("{email}", result.license.holderEmail);
      emailStatus.textContent = result.autoSent ? `${base} \xB7 ${msg.emailSent.replace("{email}", result.license.holderEmail)}` : base;
    }
    await refreshDashboard();
    return;
  }
  if (sendEmailId) {
    const result = await requestAdmin(
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
async function handleLicenseAction(target) {
  const revokeId = target.getAttribute("data-revoke-license");
  if (!revokeId) return;
  await requestAdmin(`/api/admin/licenses/${revokeId}/revoke`, {
    method: "POST",
    body: JSON.stringify({})
  });
  await refreshDashboard();
}
function applyLocale(locale) {
  msg = adminMessages[locale];
  document.documentElement.lang = locale;
  applyTranslations(msg);
  applyLangToggle(locale);
  if (dashboard) {
    renderAll();
  }
}
function bindEvents() {
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
  applyTranslations(msg);
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
