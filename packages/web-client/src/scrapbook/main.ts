import { SUPPORTED_LOCALES, getLocaleLabel } from "@threads/shared/locale";
import { applyTranslations, getLocale, scrapbookMessages, setLocale, type ScrapbookMsg, type WebLocale } from "../lib/web-i18n";

interface BotPublicConfig {
  botHandle: string;
  oauthConfigured: boolean;
}

interface BotUserView {
  id: string;
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  biography: string | null;
  isVerified: boolean;
  lastLoginAt: string | null;
  grantedScopes: string[];
  scopeVersion: number;
  lastScopeUpgradeAt: string | null;
}

interface BotArchiveReplyView {
  canonicalUrl: string;
  author: string;
  text: string;
  publishedAt: string | null;
  mediaUrls: string[];
}

interface BotArchiveView {
  id: string;
  origin: "mention" | "cloud";
  originLabel: string;
  mentionUrl: string | null;
  mentionAuthorHandle: string | null;
  mentionAuthorDisplayName: string | null;
  noteText: string | null;
  tags: string[];
  targetUrl: string;
  targetAuthorHandle: string | null;
  targetAuthorDisplayName: string | null;
  targetText: string;
  targetPublishedAt: string | null;
  mediaUrls: string[];
  authorReplies: BotArchiveReplyView[];
  markdownContent: string;
  archivedAt: string;
  updatedAt: string;
}

interface BotSessionState {
  authenticated: boolean;
  botHandle: string;
  oauthConfigured: boolean;
  user: BotUserView | null;
  archives: BotArchiveView[];
}

interface BotOauthStartResult {
  authorizeUrl: string;
  botHandle: string;
}

interface ScrapbookMetricValue {
  value: number | null;
  delta: number | null;
}

interface ScrapbookTrackedPostView {
  id: string;
  externalPostId: string;
  canonicalUrl: string;
  authorHandle: string;
  authorDisplayName: string | null;
  text: string;
  publishedAt: string | null;
  mediaType: string | null;
  mediaUrls: string[];
  matchedTerms: string[];
  relevanceScore: number | null;
  archived: boolean;
  archiveId: string | null;
  discoveredAt: string;
}

interface ScrapbookWatchlistView {
  id: string;
  targetHandle: string;
  targetDisplayName: string | null;
  targetProfilePictureUrl: string | null;
  includeText: string;
  excludeText: string;
  mediaTypes: string[];
  autoArchive: boolean;
  digestCadence: "off" | "daily" | "weekly";
  lastSyncedAt: string | null;
  lastError: string | null;
  status: "active" | "paused";
  resultCount: number;
  results: ScrapbookTrackedPostView[];
}

interface ScrapbookSearchResultView {
  id: string;
  externalPostId: string;
  canonicalUrl: string;
  authorHandle: string;
  authorDisplayName: string | null;
  text: string;
  publishedAt: string | null;
  mediaType: string | null;
  mediaUrls: string[];
  matchedTerms: string[];
  relevanceScore: number | null;
  archiveId: string | null;
  discoveredAt: string;
  status: "new" | "archived" | "dismissed";
}

interface ScrapbookSearchView {
  id: string;
  query: string;
  authorHandle: string | null;
  excludeHandles: string[];
  autoArchive: boolean;
  searchType: "top" | "recent";
  lastRunAt: string | null;
  lastError: string | null;
  status: "active" | "paused";
  resultCount: number;
  results: ScrapbookSearchResultView[];
}

interface ScrapbookInsightsPostView {
  externalPostId: string;
  canonicalUrl: string;
  title: string;
  text: string;
  publishedAt: string | null;
  metrics: {
    views: ScrapbookMetricValue;
    likes: ScrapbookMetricValue;
    replies: ScrapbookMetricValue;
    reposts: ScrapbookMetricValue;
    quotes: ScrapbookMetricValue;
  };
  archived: boolean;
  archiveId: string | null;
  capturedAt: string | null;
}

interface ScrapbookInsightsView {
  ready: boolean;
  refreshedAt: string | null;
  overview: {
    followers: ScrapbookMetricValue;
    profileViews: ScrapbookMetricValue;
    views: ScrapbookMetricValue;
    likes: ScrapbookMetricValue;
    replies: ScrapbookMetricValue;
    reposts: ScrapbookMetricValue;
    quotes: ScrapbookMetricValue;
  };
  posts: ScrapbookInsightsPostView[];
}

interface ScrapbookScopeState {
  requiredScopes: string[];
  grantedScopes: string[];
  missingScopes: string[];
  scopeVersion: number;
  requiredScopeVersion: number;
  needsReconnect: boolean;
}

interface ScrapbookPlusState {
  authenticated: boolean;
  scopes: ScrapbookScopeState;
  watchlists: ScrapbookWatchlistView[];
  searches: ScrapbookSearchView[];
  insights: ScrapbookInsightsView;
}

type WorkspaceTab = "inbox" | "watchlists" | "searches" | "insights";

let latestConfig: BotPublicConfig | null = null;
let latestState: BotSessionState | null = null;
let latestWorkspace: ScrapbookPlusState | null = null;
let activeTab: WorkspaceTab = "inbox";
const selectedArchiveIds = new Set<string>();
const expandedMediaArchiveIds = new Set<string>();
let activeArchiveId: string | null = null;
let isExportingArchives = false;
let connectButtonsAvailable = true;
let connectButtonsBusy = false;
let currentLocale: WebLocale = getLocale("en");
let msg: ScrapbookMsg = scrapbookMessages[currentLocale];

const botHandleEls = document.querySelectorAll<HTMLElement>("[data-bot-handle]");
const hostEls = document.querySelectorAll<HTMLElement>("[data-site-host]");
const connectButtons = document.querySelectorAll<HTMLButtonElement>("[data-bot-connect]");
const mobileOauthNotes = document.querySelectorAll<HTMLElement>("[data-mobile-oauth-note]");
const brandLink = document.querySelector<HTMLAnchorElement>(".brand-link");
const localeSelect = document.querySelector<HTMLSelectElement>("#scrapbook-locale-select");
const metaDescription = document.querySelector<HTMLMetaElement>("#scrapbook-meta-description");
const authPanel = document.querySelector<HTMLElement>("#auth-panel");
const sessionPanel = document.querySelector<HTMLElement>("#session-panel");
const pageStatus = document.querySelector<HTMLParagraphElement>("#page-status");
const sessionName = document.querySelector<HTMLElement>("#session-name");
const sessionMeta = document.querySelector<HTMLParagraphElement>("#session-meta");
const sessionBio = document.querySelector<HTMLParagraphElement>("#session-bio");
const sessionRouting = document.querySelector<HTMLParagraphElement>("#session-routing");
const scopeStatus = document.querySelector<HTMLParagraphElement>("#scope-status");
const sessionProfileLink = document.querySelector<HTMLAnchorElement>("#session-profile-link");
const avatarImage = document.querySelector<HTMLImageElement>("#profile-avatar-image");
const avatarFallback = document.querySelector<HTMLElement>("#profile-avatar-fallback");
const archivesEl = document.querySelector<HTMLElement>("#archives");
const archivesBoard = document.querySelector<HTMLElement>("#archives-board");
const archivesEmptyEl = document.querySelector<HTMLElement>("#archives-empty");
const archiveDetailEl = document.querySelector<HTMLElement>("#archive-detail");
const archivesToolbar = document.querySelector<HTMLElement>("#archives-toolbar");
const archivesToolbarMeta = document.querySelector<HTMLElement>("#archives-toolbar-meta");
const archivesSelectAll = document.querySelector<HTMLInputElement>("#archives-select-all");
const archivesExportSelected = document.querySelector<HTMLButtonElement>("#archives-export-selected");
const archivesExportAll = document.querySelector<HTMLButtonElement>("#archives-export-all");
const logoutButton = document.querySelector<HTMLButtonElement>("#logout");
const workspaceTabs = document.querySelector<HTMLElement>("#workspace-tabs");
const workspaceTabButtons = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
const workspacePanels = document.querySelectorAll<HTMLElement>("[data-tab-panel]");
const watchlistForm = document.querySelector<HTMLFormElement>("#watchlist-form");
const watchlistsList = document.querySelector<HTMLElement>("#watchlists-list");
const watchlistsEmpty = document.querySelector<HTMLElement>("#watchlists-empty");
const searchForm = document.querySelector<HTMLFormElement>("#search-form");
const searchesList = document.querySelector<HTMLElement>("#searches-list");
const searchesEmpty = document.querySelector<HTMLElement>("#searches-empty");
const insightsRefresh = document.querySelector<HTMLButtonElement>("#insights-refresh");
const insightsRefreshed = document.querySelector<HTMLElement>("#insights-refreshed");
const insightsEmpty = document.querySelector<HTMLElement>("#insights-empty");
const insightsPosts = document.querySelector<HTMLElement>("#insights-posts");
const metricFollowers = document.querySelector<HTMLElement>("#metric-followers");
const metricFollowersDelta = document.querySelector<HTMLElement>("#metric-followers-delta");
const metricProfileViews = document.querySelector<HTMLElement>("#metric-profile-views");
const metricProfileViewsDelta = document.querySelector<HTMLElement>("#metric-profile-views-delta");
const metricViews = document.querySelector<HTMLElement>("#metric-views");
const metricViewsDelta = document.querySelector<HTMLElement>("#metric-views-delta");
const metricLikes = document.querySelector<HTMLElement>("#metric-likes");
const metricLikesDelta = document.querySelector<HTMLElement>("#metric-likes-delta");
const metricReplies = document.querySelector<HTMLElement>("#metric-replies");
const metricRepliesDelta = document.querySelector<HTMLElement>("#metric-replies-delta");
const metricReposts = document.querySelector<HTMLElement>("#metric-reposts");
const metricRepostsDelta = document.querySelector<HTMLElement>("#metric-reposts-delta");

function formatMessage(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

function t<K extends keyof ScrapbookMsg>(key: K, params?: Record<string, string | number>): string {
  return formatMessage(msg[key], params);
}

type RuntimeLocaleLabels = {
  requestFailed: string;
  sourceMention: string;
  sourceCloud: string;
  searchRunNow: string;
  searchStatusNew: string;
  searchStatusArchived: string;
  searchStatusDismissed: string;
};

const runtimeLocaleLabels: Record<WebLocale, RuntimeLocaleLabels> = {
  ko: {
    requestFailed: "요청에 실패했습니다 ({status}).",
    sourceMention: "멘션 inbox",
    sourceCloud: "클라우드 저장",
    searchRunNow: "지금 실행",
    searchStatusNew: "신규",
    searchStatusArchived: "보관됨",
    searchStatusDismissed: "숨김"
  },
  en: {
    requestFailed: "Request failed ({status}).",
    sourceMention: "Mention inbox",
    sourceCloud: "Cloud save",
    searchRunNow: "Run now",
    searchStatusNew: "New",
    searchStatusArchived: "Archived",
    searchStatusDismissed: "Dismissed"
  },
  ja: {
    requestFailed: "リクエストに失敗しました ({status})。",
    sourceMention: "メンション inbox",
    sourceCloud: "クラウド保存",
    searchRunNow: "今すぐ実行",
    searchStatusNew: "新規",
    searchStatusArchived: "保存済み",
    searchStatusDismissed: "非表示"
  },
  "pt-BR": {
    requestFailed: "A solicitação falhou ({status}).",
    sourceMention: "Inbox de menções",
    sourceCloud: "Salvamento na nuvem",
    searchRunNow: "Executar agora",
    searchStatusNew: "Novo",
    searchStatusArchived: "Arquivado",
    searchStatusDismissed: "Ocultado"
  },
  es: {
    requestFailed: "La solicitud falló ({status}).",
    sourceMention: "Inbox de menciones",
    sourceCloud: "Guardado en la nube",
    searchRunNow: "Ejecutar ahora",
    searchStatusNew: "Nuevo",
    searchStatusArchived: "Archivado",
    searchStatusDismissed: "Oculto"
  },
  "zh-TW": {
    requestFailed: "請求失敗 ({status})。",
    sourceMention: "提及 inbox",
    sourceCloud: "雲端儲存",
    searchRunNow: "立即執行",
    searchStatusNew: "新增",
    searchStatusArchived: "已封存",
    searchStatusDismissed: "已隱藏"
  },
  vi: {
    requestFailed: "Yêu cầu thất bại ({status}).",
    sourceMention: "Inbox đề cập",
    sourceCloud: "Lưu đám mây",
    searchRunNow: "Chạy ngay",
    searchStatusNew: "Mới",
    searchStatusArchived: "Đã lưu trữ",
    searchStatusDismissed: "Đã ẩn"
  }
};

function runtimeLabel(): RuntimeLocaleLabels {
  return runtimeLocaleLabels[currentLocale];
}

function localizeMediaType(mediaType: string | null | undefined): string {
  switch ((mediaType ?? "").toUpperCase()) {
    case "TEXT":
      return t("scrapbookMediaTypeText");
    case "IMAGE":
      return t("scrapbookMediaTypeImage");
    case "VIDEO":
      return t("scrapbookMediaTypeVideo");
    case "CAROUSEL":
      return t("scrapbookMediaTypeCarousel");
    default:
      return mediaType ?? "";
  }
}

function localizeSearchType(searchType: ScrapbookSearchView["searchType"]): string {
  return searchType === "recent" ? t("scrapbookSearchTypeRecent") : t("scrapbookSearchTypeTop");
}

function localizeSearchStatus(status: ScrapbookSearchResultView["status"]): string {
  if (status === "archived") {
    return runtimeLabel().searchStatusArchived;
  }
  if (status === "dismissed") {
    return runtimeLabel().searchStatusDismissed;
  }
  return runtimeLabel().searchStatusNew;
}

function getCurrentBotHandle(): string {
  return latestConfig?.botHandle ?? "parktaejun";
}

function setLocalizedHtml(selector: string, html: string): void {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    element.innerHTML = html;
  }
}

function applyStaticTranslations(): void {
  const botHandle = getCurrentBotHandle();
  const handleInline = `<span data-bot-handle>@${escapeHtml(botHandle)}</span>`;
  const handleStrong = `<strong data-bot-handle>@${escapeHtml(botHandle)}</strong>`;
  const copyLoginLinkStrong = `<strong>${escapeHtml(t("scrapbookCopyLoginLink"))}</strong>`;

  document.documentElement.lang = currentLocale;
  document.title = t("scrapbookDocumentTitle");
  metaDescription?.setAttribute("content", t("scrapbookDocumentDescription"));
  brandLink?.setAttribute("aria-label", t("scrapbookHomeAriaLabel"));
  localeSelect?.setAttribute("aria-label", t("scrapbookLocaleLabel"));
  workspaceTabs?.setAttribute("aria-label", t("scrapbookWorkspaceAriaLabel"));

  applyTranslations(msg);

  setLocalizedHtml(
    "[data-i18n='scrapbookHeroLead']",
    formatMessage(t("scrapbookHeroLead"), { handleStrong })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookMobileOauthNote']",
    formatMessage(t("scrapbookMobileOauthNote"), { copyLoginLinkStrong })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookFlowStep2']",
    formatMessage(t("scrapbookFlowStep2"), { handleInline })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookConnectCopy']",
    formatMessage(t("scrapbookConnectCopy"), { handleInline })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookHowStep2Desc']",
    formatMessage(t("scrapbookHowStep2Desc"), { handleInline })
  );
}

function syncLocaleSelect(): void {
  if (!localeSelect) {
    return;
  }

  if (localeSelect.options.length === 0) {
    for (const locale of SUPPORTED_LOCALES) {
      const option = document.createElement("option");
      option.value = locale;
      option.textContent = getLocaleLabel(locale);
      localeSelect.append(option);
    }
  }

  localeSelect.value = currentLocale;
}

function applyLocale(locale: WebLocale): void {
  currentLocale = locale;
  msg = scrapbookMessages[currentLocale];
  setLocale(locale);
  syncLocaleSelect();
  applyStaticTranslations();
  renderConnectButtons();

  if (latestConfig && latestState) {
    applySessionState(latestConfig, latestState);
  }

  if (latestWorkspace) {
    applyWorkspaceState(latestWorkspace);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.error || formatMessage(runtimeLabel().requestFailed, { status: response.status }));
  }

  return payload as T;
}

async function requestBlob(url: string, init?: RequestInit): Promise<{ blob: Blob; filename: string | null }> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || formatMessage(runtimeLabel().requestFailed, { status: response.status }));
  }

  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? null
  };
}

function formatDate(iso: string | null): string {
  if (!iso) {
    return t("scrapbookDateNone");
  }

  try {
    return new Date(iso).toLocaleString(currentLocale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function formatCompactNumber(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return t("scrapbookNumberNone");
  }

  return new Intl.NumberFormat(currentLocale, {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

function formatDelta(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return t("scrapbookNoChange");
  }
  if (value === 0) {
    return t("scrapbookNoChange");
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCompactNumber(value)}`;
}

function setMetricValue(valueEl: HTMLElement | null, deltaEl: HTMLElement | null, metric: ScrapbookMetricValue): void {
  if (valueEl) {
    valueEl.textContent = formatCompactNumber(metric.value);
  }
  if (!deltaEl) {
    return;
  }

  deltaEl.textContent = formatDelta(metric.delta);
  deltaEl.classList.toggle("metric-positive", typeof metric.delta === "number" && metric.delta > 0);
  deltaEl.classList.toggle("metric-negative", typeof metric.delta === "number" && metric.delta < 0);
}

function setStatus(message: string, isError = false): void {
  if (!pageStatus) {
    return;
  }

  if (!message.trim()) {
    pageStatus.textContent = "";
    pageStatus.classList.add("hidden");
    pageStatus.classList.remove("is-error");
    return;
  }

  pageStatus.textContent = message;
  pageStatus.classList.remove("hidden");
  pageStatus.classList.toggle("is-error", isError);
}

function setConnectButtonsEnabled(enabled: boolean): void {
  connectButtonsAvailable = enabled;
  renderConnectButtons();
}

function isLikelyMobileDevice(): boolean {
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

function renderMobileOauthNotice(): void {
  const show = isLikelyMobileDevice() && connectButtonsAvailable && !(latestState?.authenticated && latestState.user);
  for (const note of mobileOauthNotes) {
    note.classList.toggle("hidden", !show);
  }
}

function renderConnectButtons(): void {
  const disabled = connectButtonsBusy || !connectButtonsAvailable;
  for (const button of connectButtons) {
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
    button.setAttribute("aria-busy", String(connectButtonsBusy));
    button.textContent = connectButtonsBusy ? t("scrapbookConnectBusy") : t("scrapbookConnectButton");
    button.title = "";
  }
  renderMobileOauthNotice();
}

function setConnectButtonsBusy(isBusy: boolean): void {
  connectButtonsBusy = isBusy;
  renderConnectButtons();
}

function setConnectButtonsIdle(): void {
  connectButtonsBusy = false;
  renderConnectButtons();
}

function extractArchiveTitleExcerpt(text: string, maxChars = 20): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const firstSentence = normalized.split(/(?<=[.!?。！？])\s+|\n+/u, 1)[0]?.trim() ?? normalized;
  return Array.from(firstSentence).slice(0, maxChars).join("").trim();
}

function buildArchiveTitle(item: BotArchiveView): string {
  const excerpt = extractArchiveTitleExcerpt(item.targetText, 20);
  if (excerpt) {
    return excerpt;
  }
  if (item.targetAuthorHandle) {
    return t("scrapbookArchiveFallbackAuthorPost", { handle: item.targetAuthorHandle });
  }
  return t("scrapbookArchiveFallbackSavedItem");
}

function buildArchiveSource(item: BotArchiveView): string {
  const originLabel = item.origin === "cloud" ? runtimeLabel().sourceCloud : runtimeLabel().sourceMention;
  if (item.targetAuthorHandle) {
    return `${originLabel} · @${item.targetAuthorHandle}`;
  }
  return originLabel;
}

function buildArchiveTagsLabel(item: BotArchiveView): string {
  return item.tags.map((tag) => `#${tag}`).join(" ");
}

function buildArchiveSelectionTitle(count: number, total: number): string {
  if (total === 0) {
    return "";
  }
  return count > 0
    ? t("scrapbookArchiveSelectionSummary", { count, total })
    : t("scrapbookArchiveSelectionTotal", { total });
}

function isLikelyVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm)(?:[?#]|$)/i.test(url);
}

function renderMediaPreviewUrls(urls: string[]): string {
  if (urls.length === 0) {
    return "";
  }

  const previewUrls = urls.filter((url) => !isLikelyVideoUrl(url)).slice(0, 4);
  if (previewUrls.length === 0) {
    return `<div class="archive-media-note">${escapeHtml(t("scrapbookMediaIncluded", { count: urls.length }))}</div>`;
  }

  return `
    <div class="archive-media-grid">
      ${previewUrls
        .map(
          (url, index) => `
            <a class="archive-media-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(`${t("scrapbookMediaTypeImage")} ${index + 1}`)}">
              <img class="archive-media-thumb" src="${escapeHtml(url)}" alt="" loading="lazy" />
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function countArchiveMedia(item: BotArchiveView): number {
  return item.mediaUrls.length + item.authorReplies.reduce((count, reply) => count + reply.mediaUrls.length, 0);
}

function renderReplyBlocks(item: BotArchiveView, showMedia: boolean): string {
  if (item.authorReplies.length === 0) {
    return "";
  }

  return `
    <section class="archive-replies">
      <div class="archive-replies-head">
        <h4>${escapeHtml(t("scrapbookReplyHeader", { count: item.authorReplies.length }))}</h4>
      </div>
      <div class="archive-replies-list">
        ${item.authorReplies
          .map(
            (reply, index) => `
              <article class="archive-reply-card">
                <div class="archive-reply-meta">
                  <span class="archive-chip">${escapeHtml(t("scrapbookReplyLabel", { index: index + 1 }))}</span>
                  <span class="archive-chip">@${escapeHtml(reply.author)}</span>
                  ${reply.publishedAt ? `<span class="archive-chip">${escapeHtml(formatDate(reply.publishedAt))}</span>` : ""}
                </div>
                <p class="archive-reply-body">${escapeHtml(reply.text)}</p>
                <div class="archive-reply-actions">
                  <a class="topbar-link archive-action-link" href="${escapeHtml(reply.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookReplyOpenOriginal"))}</a>
                </div>
                ${showMedia && reply.mediaUrls.length > 0 ? renderMediaPreviewUrls(reply.mediaUrls) : ""}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

async function copyArchiveMarkdown(item: BotArchiveView, button: HTMLButtonElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(item.markdownContent);
    const previousLabel = button.textContent;
    button.textContent = t("scrapbookCopied");
    window.setTimeout(() => {
      button.textContent = previousLabel ?? t("scrapbookCopyMarkdown");
    }, 1200);
  } catch {
    setStatus(t("scrapbookClipboardError"), true);
  }
}

function syncSelectedArchiveIds(items: BotArchiveView[]): void {
  const validIds = new Set(items.map((item) => item.id));
  for (const archiveId of [...selectedArchiveIds]) {
    if (!validIds.has(archiveId)) {
      selectedArchiveIds.delete(archiveId);
    }
  }
}

function updateArchivesToolbar(items: BotArchiveView[], isAuthenticated: boolean): void {
  if (!archivesToolbar || !archivesToolbarMeta || !archivesSelectAll || !archivesExportSelected || !archivesExportAll) {
    return;
  }

  const hasItems = isAuthenticated && items.length > 0;
  archivesToolbar.classList.toggle("hidden", !hasItems);
  if (!hasItems) {
    archivesSelectAll.checked = false;
    archivesSelectAll.indeterminate = false;
    archivesExportSelected.disabled = true;
    archivesExportAll.disabled = true;
    archivesToolbarMeta.textContent = "";
    return;
  }

  const selectedCount = items.filter((item) => selectedArchiveIds.has(item.id)).length;
  archivesToolbarMeta.textContent = buildArchiveSelectionTitle(selectedCount, items.length);
  archivesSelectAll.checked = selectedCount > 0 && selectedCount === items.length;
  archivesSelectAll.indeterminate = selectedCount > 0 && selectedCount < items.length;
  archivesExportSelected.disabled = isExportingArchives || selectedCount === 0;
  archivesExportAll.disabled = isExportingArchives || items.length === 0;
  archivesExportSelected.textContent = isExportingArchives ? t("scrapbookExportPreparing") : t("scrapbookExportSelected");
  archivesExportAll.textContent = isExportingArchives ? t("scrapbookExportPreparing") : t("scrapbookExportAll");
}

function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function exportArchivesZip(archiveIds: string[]): Promise<void> {
  if (archiveIds.length === 0) {
    setStatus(t("scrapbookExportChooseItems"), true);
    return;
  }

  isExportingArchives = true;
  if (latestState) {
    updateArchivesToolbar(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }

  try {
    const { blob, filename } = await requestBlob("/api/public/bot/archives.zip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: archiveIds })
    });
    downloadBlob(blob, filename || "threads-scrapbook.zip");
    setStatus(t("scrapbookExportReady", { count: archiveIds.length }));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookExportFailed"), true);
  } finally {
    isExportingArchives = false;
    if (latestState) {
      updateArchivesToolbar(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }
}

function renderArchiveDetail(item: BotArchiveView | null): void {
  if (!archiveDetailEl) {
    return;
  }

  if (!item) {
    archiveDetailEl.innerHTML = "";
    archiveDetailEl.classList.add("hidden");
    return;
  }

  const tagsLabel = buildArchiveTagsLabel(item);
  const totalMediaCount = countArchiveMedia(item);
  const hasMedia = totalMediaCount > 0;
  const showMedia = expandedMediaArchiveIds.has(item.id);
  const triggerLink = item.mentionUrl
    ? `<a class="topbar-link archive-action-link" href="${escapeHtml(item.mentionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTriggerView"))}</a>`
    : "";

  archiveDetailEl.classList.remove("hidden");
  archiveDetailEl.innerHTML = `
    <div class="archive-detail-head">
      <div>
        <h3>${escapeHtml(buildArchiveTitle(item))}</h3>
        <div class="archive-detail-meta">
          <span class="archive-chip">${escapeHtml(formatDate(item.archivedAt))}</span>
          ${buildArchiveSource(item) ? `<span class="archive-chip">${escapeHtml(buildArchiveSource(item))}</span>` : ""}
          ${tagsLabel ? `<span class="archive-chip">${escapeHtml(tagsLabel)}</span>` : ""}
        </div>
      </div>
    </div>
    <p class="archive-detail-body">${escapeHtml(item.targetText)}</p>
    ${
      hasMedia
        ? `<button class="secondary-cta archive-media-toggle" type="button" data-media-toggle="${item.id}">${escapeHtml(
            showMedia ? t("scrapbookImagesHide") : t("scrapbookImagesShow", { count: totalMediaCount })
          )}</button>`
        : ""
    }
    ${hasMedia && showMedia && item.mediaUrls.length > 0 ? renderMediaPreviewUrls(item.mediaUrls) : ""}
    ${renderReplyBlocks(item, showMedia)}
    <div class="archive-actions">
      <a class="secondary-cta archive-action-link" href="${escapeHtml(item.targetUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookOpenOriginal"))}</a>
      ${triggerLink}
      <button class="topbar-link archive-copy" type="button" data-copy="${item.id}">${escapeHtml(t("scrapbookCopyMarkdown"))}</button>
      <a class="topbar-link archive-action-link" href="/api/public/bot/archive/${encodeURIComponent(item.id)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>
      <a class="topbar-link archive-action-link" href="/api/public/bot/archive/${encodeURIComponent(item.id)}.zip">${escapeHtml(t("scrapbookDownloadZip"))}</a>
      <button class="topbar-link archive-action-link" type="button" data-archive-delete="${item.id}">${escapeHtml(t("scrapbookDelete"))}</button>
    </div>
  `;

  const copyButton = archiveDetailEl.querySelector<HTMLButtonElement>("[data-copy]");
  if (copyButton) {
    copyButton.addEventListener("click", () => void copyArchiveMarkdown(item, copyButton));
  }

  const mediaToggle = archiveDetailEl.querySelector<HTMLButtonElement>("[data-media-toggle]");
  if (mediaToggle) {
    mediaToggle.addEventListener("click", () => {
      if (expandedMediaArchiveIds.has(item.id)) {
        expandedMediaArchiveIds.delete(item.id);
      } else {
        expandedMediaArchiveIds.add(item.id);
      }
      renderArchiveDetail(item);
    });
  }

  const archiveDeleteButton = archiveDetailEl.querySelector<HTMLButtonElement>("[data-archive-delete]");
  if (archiveDeleteButton) {
    archiveDeleteButton.addEventListener("click", () => void deleteArchiveRequest(item.id));
  }
}

function renderArchives(items: BotArchiveView[], isAuthenticated: boolean): void {
  if (!archivesEl || !archivesEmptyEl || !archivesBoard) {
    return;
  }

  if (!isAuthenticated) {
    archivesEl.innerHTML = "";
    archivesBoard.classList.add("hidden");
    archivesEmptyEl.classList.remove("hidden");
    archivesEmptyEl.innerHTML =
      `<strong>${escapeHtml(t("scrapbookArchiveLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookArchiveLoginRequiredCopy"))}</span>`;
    activeArchiveId = null;
    updateArchivesToolbar([], false);
    renderArchiveDetail(null);
    return;
  }

  if (items.length === 0) {
    archivesEl.innerHTML = "";
    archivesBoard.classList.add("hidden");
    archivesEmptyEl.classList.remove("hidden");
    archivesEmptyEl.innerHTML =
      `<strong>${escapeHtml(t("scrapbookArchiveEmptyTitle"))}</strong><span>${escapeHtml(t("scrapbookArchiveEmptyCopy"))}</span>`;
    activeArchiveId = null;
    updateArchivesToolbar([], true);
    renderArchiveDetail(null);
    return;
  }

  syncSelectedArchiveIds(items);
  if (!items.some((item) => item.id === activeArchiveId)) {
    activeArchiveId = items[0]?.id ?? null;
  }

  archivesEmptyEl.classList.add("hidden");
  archivesBoard.classList.remove("hidden");
  archivesEl.innerHTML = items
    .map((item) => {
      const isSelected = selectedArchiveIds.has(item.id);
      const isActive = activeArchiveId === item.id;
      const source = buildArchiveSource(item);
      const tagsLabel = buildArchiveTagsLabel(item);
      return `
        <tr class="${isActive ? "is-active" : ""}" data-open="${item.id}">
          <td class="archive-table-select">
            <label class="archive-row-checkbox">
              <input type="checkbox" data-select="${item.id}" ${isSelected ? "checked" : ""} />
            </label>
          </td>
          <td>
            <button class="archive-row-title" type="button" data-open="${item.id}">${escapeHtml(buildArchiveTitle(item))}</button>
          </td>
          <td class="archive-row-date">${escapeHtml(formatDate(item.archivedAt))}</td>
          <td class="archive-row-source">${escapeHtml(source)}</td>
          <td class="archive-row-tags">${escapeHtml(tagsLabel)}</td>
        </tr>
      `;
    })
    .join("");

  for (const input of archivesEl.querySelectorAll<HTMLInputElement>("[data-select]")) {
    input.addEventListener("change", () => {
      const archiveId = input.dataset.select;
      if (!archiveId) {
        return;
      }
      if (input.checked) {
        selectedArchiveIds.add(archiveId);
      } else {
        selectedArchiveIds.delete(archiveId);
      }
      updateArchivesToolbar(items, isAuthenticated);
    });
  }

  for (const trigger of archivesEl.querySelectorAll<HTMLElement>("[data-open]")) {
    trigger.addEventListener("click", (event) => {
      const archiveId = trigger.dataset.open;
      if (!archiveId) {
        return;
      }
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      activeArchiveId = archiveId;
      renderArchives(items, isAuthenticated);
    });
  }

  updateArchivesToolbar(items, isAuthenticated);
  renderArchiveDetail(items.find((item) => item.id === activeArchiveId) ?? null);
}

function renderUser(user: BotUserView | null): void {
  if (!user) {
    if (sessionName) sessionName.textContent = "";
    if (sessionMeta) sessionMeta.textContent = "";
    if (sessionBio) {
      sessionBio.textContent = "";
      sessionBio.classList.add("hidden");
    }
    if (sessionRouting) {
      sessionRouting.textContent = "";
      sessionRouting.classList.add("hidden");
    }
    if (scopeStatus) {
      scopeStatus.textContent = "";
      scopeStatus.classList.add("hidden");
    }
    if (sessionProfileLink) {
      sessionProfileLink.href = "#";
    }
    if (avatarImage) {
      avatarImage.src = "";
      avatarImage.classList.add("hidden");
    }
    if (avatarFallback) {
      avatarFallback.textContent = "T";
    }
    return;
  }

  const displayName = user.displayName?.trim() || `@${user.threadsHandle}`;
  if (sessionName) {
    sessionName.textContent = displayName;
  }
  if (sessionMeta) {
    const parts = [`@${user.threadsHandle}`];
    if (user.isVerified) {
      parts.push(t("scrapbookVerified"));
    }
    parts.push(t("scrapbookLastLogin", { date: formatDate(user.lastLoginAt) }));
    sessionMeta.textContent = parts.join(" · ");
  }
  if (sessionBio) {
    const bio = user.biography?.trim() || "";
    sessionBio.textContent = bio;
    sessionBio.classList.toggle("hidden", bio.length === 0);
  }
  if (sessionProfileLink) {
    sessionProfileLink.href = `https://www.threads.com/@${encodeURIComponent(user.threadsHandle)}`;
  }
  if (avatarFallback) {
    avatarFallback.textContent = displayName.charAt(0).toUpperCase() || "T";
  }
  if (avatarImage) {
    if (user.profilePictureUrl) {
      avatarImage.src = user.profilePictureUrl;
      avatarImage.alt = t("scrapbookProfilePictureAlt", { name: displayName });
      avatarImage.classList.remove("hidden");
    } else {
      avatarImage.src = "";
      avatarImage.classList.add("hidden");
    }
  }
}

function renderScopeStatus(state: ScrapbookPlusState | null): void {
  if (!scopeStatus) {
    return;
  }

  if (!state || !state.authenticated) {
    scopeStatus.textContent = "";
    scopeStatus.classList.add("hidden");
    return;
  }

  if (!state.scopes.needsReconnect) {
    scopeStatus.textContent = t("scrapbookScopeReady", {
      scopes: state.scopes.grantedScopes.join(", ")
    });
    scopeStatus.classList.remove("hidden");
    return;
  }

  const missing = state.scopes.missingScopes.join(", ");
  scopeStatus.textContent = t("scrapbookScopeReconnect", {
    scopes: missing || t("scrapbookScopeUpgrade")
  });
  scopeStatus.classList.remove("hidden");
}

function setActiveTab(tab: WorkspaceTab): void {
  activeTab = tab;
  for (const button of workspaceTabButtons) {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  }
  for (const panel of workspacePanels) {
    panel.classList.toggle("hidden", panel.dataset.tabPanel !== tab);
  }
}

function renderTrackedPostCard(item: ScrapbookTrackedPostView, archiveEndpoint: string): string {
  return `
    <article class="feature-item">
      <div class="feature-item-head">
        <div>
          <strong>@${escapeHtml(item.authorHandle)}</strong>
          <div class="feature-item-meta">
            <span class="archive-chip">${escapeHtml(formatDate(item.publishedAt || item.discoveredAt))}</span>
            ${item.mediaType ? `<span class="archive-chip">${escapeHtml(localizeMediaType(item.mediaType))}</span>` : ""}
            ${item.matchedTerms.length > 0 ? `<span class="archive-chip">${escapeHtml(item.matchedTerms.join(", "))}</span>` : ""}
          </div>
        </div>
        <div class="feature-inline-actions">
          <a class="secondary-cta" href="${escapeHtml(item.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTrackedOpen"))}</a>
          ${
            item.archived
              ? `<a class="topbar-link" href="/api/public/bot/archive/${encodeURIComponent(item.archiveId || "")}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>`
              : `<button class="topbar-link" type="button" data-track-archive="${escapeHtml(item.id)}" data-track-endpoint="${escapeHtml(archiveEndpoint)}">${escapeHtml(t("scrapbookTrackedSaveInbox"))}</button>`
          }
        </div>
      </div>
      <p class="feature-item-body">${escapeHtml(item.text || t("scrapbookEmptyBody"))}</p>
    </article>
  `;
}

function renderWatchlists(workspace: ScrapbookPlusState | null): void {
  if (!watchlistsList || !watchlistsEmpty) {
    return;
  }

  if (!workspace || !workspace.authenticated) {
    watchlistsList.innerHTML = "";
    watchlistsList.classList.add("hidden");
    watchlistsEmpty.classList.remove("hidden");
    watchlistsEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookWatchlistsLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookWatchlistsLoginCopy"))}</span>`;
    return;
  }

  if (workspace.scopes.needsReconnect) {
    watchlistsList.innerHTML = "";
    watchlistsList.classList.add("hidden");
    watchlistsEmpty.classList.remove("hidden");
    watchlistsEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookWatchlistsReconnectTitle"))}</strong><span>${escapeHtml(t("scrapbookWatchlistsReconnectCopy"))}</span>`;
    return;
  }

  if (workspace.watchlists.length === 0) {
    watchlistsList.innerHTML = "";
    watchlistsList.classList.add("hidden");
    watchlistsEmpty.classList.remove("hidden");
    return;
  }

  watchlistsEmpty.classList.add("hidden");
  watchlistsList.classList.remove("hidden");
  watchlistsList.innerHTML = workspace.watchlists
    .map(
      (watchlist) => `
        <article class="feature-card">
          <div class="feature-card-head">
            <div>
              <strong>@${escapeHtml(watchlist.targetHandle)}</strong>
                <div class="feature-card-meta">
                  ${watchlist.targetDisplayName ? `<span class="archive-chip">${escapeHtml(watchlist.targetDisplayName)}</span>` : ""}
                <span class="archive-chip">${escapeHtml(t("scrapbookWatchlistsResults", { count: watchlist.resultCount }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookWatchlistsLastSync", { date: formatDate(watchlist.lastSyncedAt) }))}</span>
              </div>
            </div>
            <div class="feature-actions">
              <button class="secondary-cta" type="button" data-watchlist-sync="${watchlist.id}">${escapeHtml(t("scrapbookWatchlistsSyncNow"))}</button>
              <button class="topbar-link" type="button" data-watchlist-delete="${watchlist.id}">${escapeHtml(t("scrapbookDelete"))}</button>
            </div>
          </div>
          <p class="feature-card-copy">
            ${escapeHtml(t("scrapbookFilterIncludeLabel"))}: ${escapeHtml(watchlist.includeText || t("scrapbookIncludeNone"))} · ${escapeHtml(t("scrapbookFilterExcludeLabel"))}: ${escapeHtml(watchlist.excludeText || t("scrapbookExcludeNone"))} · ${escapeHtml(t("scrapbookFilterMediaLabel"))}: ${escapeHtml(watchlist.mediaTypes.map((mediaType) => localizeMediaType(mediaType)).join(", ") || t("scrapbookMediaAll"))} · ${escapeHtml(t("scrapbookFilterAutoArchiveLabel"))}: ${escapeHtml(watchlist.autoArchive ? t("scrapbookAutoArchiveOn") : t("scrapbookAutoArchiveOff"))}
          </p>
          ${watchlist.lastError ? `<p class="feature-card-copy">${escapeHtml(t("scrapbookRecentError", { error: watchlist.lastError }))}</p>` : ""}
          <div class="feature-result-list">
            ${
              watchlist.results.length > 0
                ? watchlist.results.map((item) => renderTrackedPostCard(item, "tracked")).join("")
                : `<div class="empty-state"><strong>${escapeHtml(t("scrapbookWatchlistsNoResultsTitle"))}</strong><span>${escapeHtml(t("scrapbookWatchlistsNoResultsCopy"))}</span></div>`
            }
          </div>
        </article>
      `
    )
    .join("");

  for (const button of watchlistsList.querySelectorAll<HTMLButtonElement>("[data-watchlist-sync]")) {
    button.addEventListener("click", () => void syncWatchlistRequest(button.dataset.watchlistSync || ""));
  }
  for (const button of watchlistsList.querySelectorAll<HTMLButtonElement>("[data-watchlist-delete]")) {
    button.addEventListener("click", () => void deleteWatchlistRequest(button.dataset.watchlistDelete || ""));
  }
  for (const button of watchlistsList.querySelectorAll<HTMLButtonElement>("[data-track-archive]")) {
    button.addEventListener("click", () => void archiveTrackedPostRequest(button.dataset.trackArchive || ""));
  }
}

function renderSearches(workspace: ScrapbookPlusState | null): void {
  if (!searchesList || !searchesEmpty) {
    return;
  }

  if (!workspace || !workspace.authenticated) {
    searchesList.innerHTML = "";
    searchesList.classList.add("hidden");
    searchesEmpty.classList.remove("hidden");
    searchesEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookSearchesLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookSearchesLoginCopy"))}</span>`;
    return;
  }

  if (workspace.scopes.needsReconnect) {
    searchesList.innerHTML = "";
    searchesList.classList.add("hidden");
    searchesEmpty.classList.remove("hidden");
    searchesEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookSearchesReconnectTitle"))}</strong><span>${escapeHtml(t("scrapbookSearchesReconnectCopy"))}</span>`;
    return;
  }

  if (workspace.searches.length === 0) {
    searchesList.innerHTML = "";
    searchesList.classList.add("hidden");
    searchesEmpty.classList.remove("hidden");
    return;
  }

  searchesEmpty.classList.add("hidden");
  searchesList.classList.remove("hidden");
  searchesList.innerHTML = workspace.searches
    .map(
      (search) => `
        <article class="feature-card">
          <div class="feature-card-head">
            <div>
              <strong>${escapeHtml(search.query)}</strong>
              <div class="feature-card-meta">
                <span class="archive-chip">${escapeHtml(t("scrapbookSearchResults", { count: search.resultCount }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookSearchMode", { mode: localizeSearchType(search.searchType) }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookSearchLastRun", { date: formatDate(search.lastRunAt) }))}</span>
              </div>
            </div>
            <div class="feature-actions">
              <button class="secondary-cta" type="button" data-search-run="${search.id}">${escapeHtml(runtimeLabel().searchRunNow)}</button>
              <button class="topbar-link" type="button" data-search-delete="${search.id}">${escapeHtml(t("scrapbookDelete"))}</button>
            </div>
          </div>
          <p class="feature-card-copy">
            ${escapeHtml(t("scrapbookFilterAuthorLabel"))}: ${escapeHtml(search.authorHandle ? `@${search.authorHandle}` : t("scrapbookSearchAuthorAll"))} · ${escapeHtml(t("scrapbookFilterExcludeLabel"))}: ${escapeHtml(search.excludeHandles.join(", ") || t("scrapbookExcludeNone"))} · ${escapeHtml(t("scrapbookFilterAutoArchiveLabel"))}: ${escapeHtml(search.autoArchive ? t("scrapbookAutoArchiveOn") : t("scrapbookAutoArchiveOff"))}
          </p>
          ${search.lastError ? `<p class="feature-card-copy">${escapeHtml(t("scrapbookRecentError", { error: search.lastError }))}</p>` : ""}
          <div class="feature-result-list">
            ${
              search.results.length > 0
                ? search.results
                    .map(
                      (result) => `
                        <article class="feature-item">
                          <div class="feature-item-head">
                            <div>
                              <strong>@${escapeHtml(result.authorHandle)}</strong>
                              <div class="feature-item-meta">
                                <span class="archive-chip">${escapeHtml(localizeSearchStatus(result.status))}</span>
                                <span class="archive-chip">${escapeHtml(formatDate(result.publishedAt || result.discoveredAt))}</span>
                                ${result.matchedTerms.length > 0 ? `<span class="archive-chip">${escapeHtml(result.matchedTerms.join(", "))}</span>` : ""}
                              </div>
                            </div>
                            <div class="feature-inline-actions">
                              <a class="secondary-cta" href="${escapeHtml(result.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTrackedOpen"))}</a>
                              ${
                                result.status === "archived" && result.archiveId
                                  ? `<a class="topbar-link" href="/api/public/bot/archive/${encodeURIComponent(result.archiveId)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>`
                                  : `<button class="topbar-link" type="button" data-search-archive="${result.id}">${escapeHtml(t("scrapbookTrackedSaveInbox"))}</button>`
                              }
                              ${
                                result.status === "dismissed"
                                  ? ""
                                  : `<button class="topbar-link" type="button" data-search-dismiss="${result.id}">${escapeHtml(t("scrapbookSearchHide"))}</button>`
                              }
                            </div>
                          </div>
                          <p class="feature-item-body">${escapeHtml(result.text || t("scrapbookEmptyBody"))}</p>
                        </article>
                      `
                    )
                    .join("")
                : `<div class="empty-state"><strong>${escapeHtml(t("scrapbookSearchesNoResultsTitle"))}</strong><span>${escapeHtml(t("scrapbookSearchesNoResultsCopy"))}</span></div>`
            }
          </div>
        </article>
      `
    )
    .join("");

  for (const button of searchesList.querySelectorAll<HTMLButtonElement>("[data-search-run]")) {
    button.addEventListener("click", () => void runSearchRequest(button.dataset.searchRun || ""));
  }
  for (const button of searchesList.querySelectorAll<HTMLButtonElement>("[data-search-delete]")) {
    button.addEventListener("click", () => void deleteSearchRequest(button.dataset.searchDelete || ""));
  }
  for (const button of searchesList.querySelectorAll<HTMLButtonElement>("[data-search-archive]")) {
    button.addEventListener("click", () => void archiveSearchResultRequest(button.dataset.searchArchive || ""));
  }
  for (const button of searchesList.querySelectorAll<HTMLButtonElement>("[data-search-dismiss]")) {
    button.addEventListener("click", () => void dismissSearchResultRequest(button.dataset.searchDismiss || ""));
  }
}

function renderInsights(workspace: ScrapbookPlusState | null): void {
  if (insightsRefreshed) {
    insightsRefreshed.textContent = workspace?.insights.refreshedAt
      ? t("scrapbookInsightsRefreshedAt", { date: formatDate(workspace.insights.refreshedAt) })
      : t("scrapbookInsightsNotLoadedYet");
  }

  if (!workspace || !workspace.authenticated || workspace.scopes.needsReconnect) {
    setMetricValue(metricFollowers, metricFollowersDelta, { value: null, delta: null });
    setMetricValue(metricProfileViews, metricProfileViewsDelta, { value: null, delta: null });
    setMetricValue(metricViews, metricViewsDelta, { value: null, delta: null });
    setMetricValue(metricLikes, metricLikesDelta, { value: null, delta: null });
    setMetricValue(metricReplies, metricRepliesDelta, { value: null, delta: null });
    setMetricValue(metricReposts, metricRepostsDelta, { value: null, delta: null });
    if (insightsPosts) {
      insightsPosts.innerHTML = "";
      insightsPosts.classList.add("hidden");
    }
    if (insightsEmpty) {
      insightsEmpty.classList.remove("hidden");
      insightsEmpty.innerHTML =
        !workspace || !workspace.authenticated
          ? `<strong>${escapeHtml(t("scrapbookInsightsLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookInsightsLoginCopy"))}</span>`
          : `<strong>${escapeHtml(t("scrapbookInsightsReconnectTitle"))}</strong><span>${escapeHtml(t("scrapbookInsightsReconnectCopy"))}</span>`;
    }
    return;
  }

  setMetricValue(metricFollowers, metricFollowersDelta, workspace.insights.overview.followers);
  setMetricValue(metricProfileViews, metricProfileViewsDelta, workspace.insights.overview.profileViews);
  setMetricValue(metricViews, metricViewsDelta, workspace.insights.overview.views);
  setMetricValue(metricLikes, metricLikesDelta, workspace.insights.overview.likes);
  setMetricValue(metricReplies, metricRepliesDelta, workspace.insights.overview.replies);
  setMetricValue(metricReposts, metricRepostsDelta, workspace.insights.overview.reposts);

  if (!insightsPosts || !insightsEmpty) {
    return;
  }

  if (workspace.insights.posts.length === 0) {
    insightsPosts.innerHTML = "";
    insightsPosts.classList.add("hidden");
    insightsEmpty.classList.remove("hidden");
    return;
  }

  insightsEmpty.classList.add("hidden");
  insightsPosts.classList.remove("hidden");
  insightsPosts.innerHTML = workspace.insights.posts
    .map(
      (post) => `
        <article class="feature-card">
          <div class="feature-card-head">
            <div>
              <strong>${escapeHtml(post.title)}</strong>
              <div class="feature-card-meta">
                <span class="archive-chip">${escapeHtml(formatDate(post.publishedAt || post.capturedAt))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookInsightsViews", { value: formatCompactNumber(post.metrics.views.value) }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookInsightsLikes", { value: formatCompactNumber(post.metrics.likes.value) }))}</span>
              </div>
            </div>
            <div class="feature-actions">
              <a class="secondary-cta" href="${escapeHtml(post.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTrackedOpen"))}</a>
              ${
                post.archived && post.archiveId
                  ? `<a class="topbar-link" href="/api/public/bot/archive/${encodeURIComponent(post.archiveId)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>`
                  : `<button class="topbar-link" type="button" data-insight-archive="${escapeHtml(post.externalPostId)}">${escapeHtml(t("scrapbookTrackedSaveInbox"))}</button>`
              }
            </div>
          </div>
          <p class="feature-card-copy">${escapeHtml(post.text || t("scrapbookEmptyBody"))}</p>
          <div class="feature-card-meta">
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsViews", { value: formatDelta(post.metrics.views.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsLikes", { value: formatDelta(post.metrics.likes.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsReplies", { value: formatDelta(post.metrics.replies.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsReposts", { value: formatDelta(post.metrics.reposts.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsQuotes", { value: formatDelta(post.metrics.quotes.delta) }))}</span>
          </div>
        </article>
      `
    )
    .join("");

  for (const button of insightsPosts.querySelectorAll<HTMLButtonElement>("[data-insight-archive]")) {
    button.addEventListener("click", () => void archiveInsightPostRequest(button.dataset.insightArchive || ""));
  }
}

function applySessionState(config: BotPublicConfig, state: BotSessionState): void {
  latestConfig = config;
  latestState = state;
  applyStaticTranslations();
  for (const element of document.querySelectorAll<HTMLElement>("[data-bot-handle]")) {
    element.textContent = `@${config.botHandle}`;
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-site-host]")) {
    element.textContent = window.location.host;
  }

  const isAuthenticated = state.authenticated && Boolean(state.user);
  authPanel?.classList.toggle("hidden", isAuthenticated);
  sessionPanel?.classList.toggle("hidden", !isAuthenticated);
  workspaceTabs?.classList.toggle("hidden", !isAuthenticated);

  if (!config.oauthConfigured && !isAuthenticated) {
    setStatus(t("scrapbookConnectServerNotReady"), true);
    setConnectButtonsEnabled(false);
  } else {
    setConnectButtonsEnabled(true);
  }

  renderUser(isAuthenticated ? state.user : null);
  if (sessionRouting) {
    if (isAuthenticated && state.user) {
      sessionRouting.textContent = t("scrapbookSessionRouting", {
        handle: state.user.threadsHandle,
        botHandle: config.botHandle
      });
      sessionRouting.classList.remove("hidden");
    } else {
      sessionRouting.textContent = "";
      sessionRouting.classList.add("hidden");
    }
  }
  renderArchives(state.archives, isAuthenticated);
}

function applyWorkspaceState(workspace: ScrapbookPlusState): void {
  latestWorkspace = workspace;
  renderScopeStatus(workspace);
  renderWatchlists(workspace);
  renderSearches(workspace);
  renderInsights(workspace);
}

function applyQueryStatus(): void {
  const currentUrl = new URL(window.location.href);
  const connected = currentUrl.searchParams.get("connected");
  const authError = currentUrl.searchParams.get("authError");
  const archiveId = currentUrl.searchParams.get("archive");
  if (connected === "1") {
    setStatus(t("scrapbookStatusConnected"));
  } else if (authError) {
    setStatus(authError, true);
  }
  if (archiveId) {
    activeArchiveId = archiveId;
  }
  if (connected === "1" || authError || archiveId) {
    currentUrl.searchParams.delete("connected");
    currentUrl.searchParams.delete("authError");
    currentUrl.searchParams.delete("archive");
    history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }
}

async function refreshSession(): Promise<void> {
  const [config, state] = await Promise.all([
    requestJson<BotPublicConfig>("/api/public/bot/config"),
    requestJson<BotSessionState>("/api/public/bot/session")
  ]);
  latestConfig = config;
  applySessionState(config, {
    ...state,
    botHandle: config.botHandle,
    oauthConfigured: config.oauthConfigured
  });
}

async function refreshWorkspace(): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/plus");
  applyWorkspaceState(workspace);
}

async function refreshEverything(): Promise<void> {
  await Promise.all([refreshSession(), refreshWorkspace()]);
}

async function syncLatestMentions(): Promise<void> {
  if (!latestConfig) {
    return;
  }
  const state = await requestJson<BotSessionState>("/api/public/bot/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applySessionState(latestConfig, {
    ...state,
    botHandle: latestConfig.botHandle,
    oauthConfigured: latestConfig.oauthConfigured
  });
}

async function startOauth(): Promise<void> {
  setConnectButtonsBusy(true);
  window.location.assign(isLikelyMobileDevice() ? "/api/public/bot/oauth/bridge" : "/api/public/bot/oauth/start?redirect=1");
}

async function submitWatchlist(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!watchlistForm) {
    return;
  }
  const formData = new FormData(watchlistForm);
  const mediaTypes = Array.from(watchlistForm.querySelectorAll<HTMLOptionElement>("select[name='mediaTypes'] option"))
    .filter((option) => option.selected)
    .map((option) => option.value);

  const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/watchlists", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      targetHandle: formData.get("targetHandle")?.toString() ?? "",
      includeText: formData.get("includeText")?.toString() ?? "",
      excludeText: formData.get("excludeText")?.toString() ?? "",
      mediaTypes,
      autoArchive: formData.get("autoArchive") === "on"
    })
  });
  watchlistForm.reset();
  for (const option of watchlistForm.querySelectorAll<HTMLOptionElement>("select[name='mediaTypes'] option")) {
    option.selected = false;
  }
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusWatchlistSaved"));
  setActiveTab("watchlists");
}

async function syncWatchlistRequest(watchlistId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/watchlists/${encodeURIComponent(watchlistId)}/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusWatchlistSynced"));
}

async function deleteWatchlistRequest(watchlistId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/watchlists/${encodeURIComponent(watchlistId)}`, {
    method: "DELETE"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusWatchlistDeleted"));
}

async function deleteArchiveRequest(archiveId: string): Promise<void> {
  const normalizedId = archiveId.trim();
  if (!normalizedId) {
    return;
  }

  const archive = latestState?.archives.find((candidate) => candidate.id === normalizedId) ?? null;
  const archiveTitle = archive ? buildArchiveTitle(archive) : t("scrapbookArchiveFallbackSavedItem");
  const confirmed = window.confirm(t("scrapbookArchiveDeleteConfirm", { title: archiveTitle }));
  if (!confirmed) {
    return;
  }

  await requestJson<BotSessionState>(`/api/public/bot/archive/${encodeURIComponent(normalizedId)}`, {
    method: "DELETE"
  });
  selectedArchiveIds.delete(normalizedId);
  expandedMediaArchiveIds.delete(normalizedId);
  if (activeArchiveId === normalizedId) {
    activeArchiveId = null;
  }
  await refreshEverything();
  setStatus(t("scrapbookStatusArchiveDeleted"));
}

async function archiveTrackedPostRequest(trackedPostId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/tracked-posts/${encodeURIComponent(trackedPostId)}/archive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusTrackedSaved"));
}

async function submitSearch(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!searchForm) {
    return;
  }
  const formData = new FormData(searchForm);
  const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/searches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: formData.get("query")?.toString() ?? "",
      authorHandle: formData.get("authorHandle")?.toString() ?? "",
      excludeHandles: formData.get("excludeHandles")?.toString() ?? "",
      searchType: formData.get("searchType")?.toString() ?? "top",
      autoArchive: formData.get("autoArchive") === "on"
    })
  });
  searchForm.reset();
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusSearchSaved"));
  setActiveTab("searches");
}

async function runSearchRequest(searchId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/searches/${encodeURIComponent(searchId)}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusSearchRun"));
}

async function deleteSearchRequest(searchId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/searches/${encodeURIComponent(searchId)}`, {
    method: "DELETE"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusSearchDeleted"));
}

async function archiveSearchResultRequest(resultId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/search-results/${encodeURIComponent(resultId)}/archive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusSearchArchived"));
}

async function dismissSearchResultRequest(resultId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/search-results/${encodeURIComponent(resultId)}/dismiss`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusSearchDismissed"));
}

async function refreshInsightsRequest(): Promise<void> {
  if (insightsRefresh) {
    insightsRefresh.disabled = true;
    insightsRefresh.textContent = t("scrapbookInsightsRefreshLoading");
  }
  try {
    const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/insights/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    applyWorkspaceState(workspace);
    setStatus(t("scrapbookStatusInsightsRefreshed"));
  } finally {
    if (insightsRefresh) {
      insightsRefresh.disabled = false;
      insightsRefresh.textContent = t("scrapbookInsightsRefresh");
    }
  }
}

async function archiveInsightPostRequest(postId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/insights/archive", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ postId })
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusInsightSaved"));
}

for (const button of connectButtons) {
  button.addEventListener("click", () => void startOauth());
}

logoutButton?.addEventListener("click", async () => {
  try {
    await requestJson<{ ok: boolean }>("/api/public/bot/logout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    setStatus(t("scrapbookLogoutSuccess"));
    selectedArchiveIds.clear();
    expandedMediaArchiveIds.clear();
    activeArchiveId = null;
    await refreshEverything();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookLogoutFail"), true);
  }
});

for (const button of workspaceTabButtons) {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab as WorkspaceTab | undefined;
    if (tab) {
      setActiveTab(tab);
    }
  });
}

watchlistForm?.addEventListener("submit", (event) => {
  void submitWatchlist(event);
});

searchForm?.addEventListener("submit", (event) => {
  void submitSearch(event);
});

insightsRefresh?.addEventListener("click", () => {
  void refreshInsightsRequest();
});

archivesSelectAll?.addEventListener("change", () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  if (archivesSelectAll.checked) {
    for (const item of latestState.archives) {
      selectedArchiveIds.add(item.id);
    }
  } else {
    selectedArchiveIds.clear();
  }
  renderArchives(latestState.archives, true);
});

archivesExportSelected?.addEventListener("click", async () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  await exportArchivesZip(latestState.archives.filter((item) => selectedArchiveIds.has(item.id)).map((item) => item.id));
});

archivesExportAll?.addEventListener("click", async () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  await exportArchivesZip(latestState.archives.map((item) => item.id));
});

syncLocaleSelect();
applyLocale(currentLocale);
localeSelect?.addEventListener("change", () => {
  const selected = localeSelect.value as WebLocale;
  if (selected in scrapbookMessages) {
    applyLocale(selected);
  }
});
applyQueryStatus();
setActiveTab("inbox");

void (async () => {
  try {
    await refreshEverything();
    const sessionState = latestState as BotSessionState | null;
    if (sessionState && sessionState.authenticated && sessionState.user) {
      await syncLatestMentions();
      await refreshWorkspace();
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookStatusLoadFailed"), true);
  } finally {
    setConnectButtonsIdle();
    renderConnectButtons();
  }
})();
