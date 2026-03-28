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

interface ScrapbookPlanState {
  tier: "free" | "plus";
  archiveLimit: number;
  folderLimit: number;
  archiveCount: number;
  remainingArchiveSlots: number;
  plusStatus: "inactive" | "active" | "expired" | "revoked" | "missing";
  plusLicenseId: string | null;
  plusActivatedAt: string | null;
  plusExpiresAt: string | null;
}

interface ScrapbookPlusState {
  authenticated: boolean;
  plan: ScrapbookPlanState;
  scopes: ScrapbookScopeState;
  watchlists: ScrapbookWatchlistView[];
  searches: ScrapbookSearchView[];
  insights: ScrapbookInsightsView;
}

type WorkspaceTab = "inbox" | "watchlists" | "searches" | "insights";
const LEGACY_BOT_HANDLE = "parktaejun";
const DEFAULT_BOT_HANDLE = "your-bot";

let latestConfig: BotPublicConfig | null = null;
let latestState: BotSessionState | null = null;
let latestWorkspace: ScrapbookPlusState | null = null;
let activeTab: WorkspaceTab = "inbox";
let activeArchiveId: string | null = null;
let activeScrapbookHandle: string | null = null;
const selectedArchiveIds = new Set<string>();
const expandedMediaArchiveIds = new Set<string>();
let connectButtonsBusy = false;
let connectButtonsAvailable = true;
let sessionMenuOpen = false;
let isExportingArchives = false;
let archiveSearchQuery = "";
let activeFolderId: string | null = null;

interface FolderEntry {
  id: string;
  name: string;
  createdAt: string;
}

const FOLDER_STORAGE_KEY = "scrapbook_folders";
const FOLDER_MAP_STORAGE_KEY = "scrapbook_folder_map";

function loadFolders(): FolderEntry[] {
  try {
    const raw = localStorage.getItem(FOLDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FolderEntry[]) : [];
  } catch {
    return [];
  }
}

function saveFolders(folders: FolderEntry[]): void {
  localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders));
}

function loadFolderMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FOLDER_MAP_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveFolderMap(map: Record<string, string>): void {
  localStorage.setItem(FOLDER_MAP_STORAGE_KEY, JSON.stringify(map));
}

function generateFolderId(): string {
  return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

let currentLocale: WebLocale = getLocale("en");
let msg: ScrapbookMsg = scrapbookMessages[currentLocale];

const botHandleEls = document.querySelectorAll<HTMLElement>("[data-bot-handle]");
const hostEls = document.querySelectorAll<HTMLElement>("[data-site-host]");
const connectButtons = document.querySelectorAll<HTMLButtonElement>("[data-bot-connect]");
const mobileOauthNotes = document.querySelectorAll<HTMLElement>("[data-mobile-oauth-note]");
const brandLink = document.querySelector<HTMLAnchorElement>(".brand-link");
const localeSelect = document.querySelector<HTMLSelectElement>("#scrapbook-locale-select");
const metaDescription = document.querySelector<HTMLMetaElement>("#scrapbook-meta-description");
const topbarCurrentLink = document.querySelector<HTMLAnchorElement>("#topbar-current-link");
const authPanel = document.querySelector<HTMLElement>("#auth-panel");
const sessionPanel = document.querySelector<HTMLElement>("#session-panel");
const sessionTrigger = document.querySelector<HTMLButtonElement>("#session-trigger");
const sessionMenu = document.querySelector<HTMLElement>("#session-menu");
const pageStatus = document.querySelector<HTMLParagraphElement>("#page-status");
const planTitle = document.querySelector<HTMLElement>("#plan-title");
const planCopy = document.querySelector<HTMLElement>("#plan-copy");
const planTierBadge = document.querySelector<HTMLElement>("#plan-tier-badge");
const planArchiveUsage = document.querySelector<HTMLElement>("#plan-archive-usage");
const planFolderUsage = document.querySelector<HTMLElement>("#plan-folder-usage");
const planLicenseStatus = document.querySelector<HTMLElement>("#plan-license-status");
const planKeyForm = document.querySelector<HTMLFormElement>("#plan-key-form");
const planKeyLabel = document.querySelector<HTMLElement>("#plan-key-label");
const planKeyInput = document.querySelector<HTMLInputElement>("#plan-key-input");
const planKeySubmit = document.querySelector<HTMLButtonElement>("#plan-key-submit");
const planKeyClear = document.querySelector<HTMLButtonElement>("#plan-key-clear");
const sessionName = document.querySelector<HTMLElement>("#session-name");
const sessionMeta = document.querySelector<HTMLParagraphElement>("#session-meta");
const sessionBio = document.querySelector<HTMLParagraphElement>("#session-bio");
const sessionRouting = document.querySelector<HTMLParagraphElement>("#session-routing");
const scopeStatus = document.querySelector<HTMLParagraphElement>("#scope-status");
const sessionProfileLink = document.querySelector<HTMLAnchorElement>("#session-profile-link");
const sessionScrapbookLink = document.querySelector<HTMLAnchorElement>("#session-scrapbook-link");
const avatarImage = document.querySelector<HTMLImageElement>("#profile-avatar-image");
const avatarFallback = document.querySelector<HTMLElement>("#profile-avatar-fallback");
const archivesEl = document.querySelector<HTMLElement>("#archives");
const archivesBoard = document.querySelector<HTMLElement>("#archives-board");
const archivesEmptyEl = document.querySelector<HTMLElement>("#archives-empty");
const archivesPaginationEl = document.querySelector<HTMLElement>("#archives-pagination");
const archivesPerPageSelect = document.querySelector<HTMLSelectElement>("#archives-per-page-select");
const archivesPagePrev = document.querySelector<HTMLButtonElement>("#archives-page-prev");
const archivesPageNext = document.querySelector<HTMLButtonElement>("#archives-page-next");
const archivesPageInfo = document.querySelector<HTMLSpanElement>("#archives-page-info");
let archivesPage = 1;
let archivesPerPage = 10;
const archivesToolbar = document.querySelector<HTMLElement>("#archives-toolbar");
const archivesToolbarMeta = document.querySelector<HTMLElement>("#archives-toolbar-meta");
const archivesSelectAll = document.querySelector<HTMLInputElement>("#archives-select-all");
const archivesExportSelected = document.querySelector<HTMLButtonElement>("#archives-export-selected");
const archivesExportAll = document.querySelector<HTMLButtonElement>("#archives-export-all");
const archivesMoveSelected = document.querySelector<HTMLButtonElement>("#archives-move-selected");
const archivesDeleteSelected = document.querySelector<HTMLButtonElement>("#archives-delete-selected");
const archivesFilterBar = document.querySelector<HTMLElement>("#archives-filter-bar");
const archivesSearchInput = document.querySelector<HTMLInputElement>("#archives-search");
const archivesFolderStrip = document.querySelector<HTMLElement>("#archives-folder-strip");
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

function uiText(ko: string, en: string): string {
  return currentLocale === "ko" ? ko : en;
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
    sourceMention: "Inbox",
    sourceCloud: "클라우드 저장",
    searchRunNow: "지금 실행",
    searchStatusNew: "신규",
    searchStatusArchived: "보관됨",
    searchStatusDismissed: "숨김"
  },
  en: {
    requestFailed: "Request failed ({status}).",
    sourceMention: "Inbox",
    sourceCloud: "Cloud save",
    searchRunNow: "Run now",
    searchStatusNew: "New",
    searchStatusArchived: "Archived",
    searchStatusDismissed: "Dismissed"
  },
  ja: {
    requestFailed: "リクエストに失敗しました ({status})。",
    sourceMention: "Inbox",
    sourceCloud: "クラウド保存",
    searchRunNow: "今すぐ実行",
    searchStatusNew: "新規",
    searchStatusArchived: "保存済み",
    searchStatusDismissed: "非表示"
  },
  "pt-BR": {
    requestFailed: "A solicitação falhou ({status}).",
    sourceMention: "Inbox",
    sourceCloud: "Salvamento na nuvem",
    searchRunNow: "Executar agora",
    searchStatusNew: "Novo",
    searchStatusArchived: "Arquivado",
    searchStatusDismissed: "Ocultado"
  },
  es: {
    requestFailed: "La solicitud falló ({status}).",
    sourceMention: "Inbox",
    sourceCloud: "Guardado en la nube",
    searchRunNow: "Ejecutar ahora",
    searchStatusNew: "Nuevo",
    searchStatusArchived: "Archivado",
    searchStatusDismissed: "Oculto"
  },
  "zh-TW": {
    requestFailed: "請求失敗 ({status})。",
    sourceMention: "Inbox",
    sourceCloud: "雲端儲存",
    searchRunNow: "立即執行",
    searchStatusNew: "新增",
    searchStatusArchived: "已封存",
    searchStatusDismissed: "已隱藏"
  },
  vi: {
    requestFailed: "Yêu cầu thất bại ({status}).",
    sourceMention: "Inbox",
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

function getCurrentPlanState(): ScrapbookPlanState {
  return latestWorkspace?.plan ?? {
    tier: "free",
    archiveLimit: 100,
    folderLimit: 5,
    archiveCount: latestState?.archives.length ?? 0,
    remainingArchiveSlots: Math.max(0, 100 - (latestState?.archives.length ?? 0)),
    plusStatus: "inactive",
    plusLicenseId: null,
    plusActivatedAt: null,
    plusExpiresAt: null
  };
}

function getCurrentFolderLimit(): number {
  return getCurrentPlanState().folderLimit;
}

function ensureFolderLimitAvailable(): boolean {
  const folderLimit = getCurrentFolderLimit();
  const folderCount = loadFolders().length;
  if (folderCount < folderLimit) {
    return true;
  }

  setStatus(
    uiText(
      `${folderLimit}개까지 폴더를 만들 수 있습니다. Plus로 올리면 50개까지 확장됩니다.`,
      `You can create up to ${folderLimit} folders on this plan. Upgrade to Plus to raise it to 50.`
    ),
    true
  );
  return false;
}

function renderPlanPanel(): void {
  const plan = getCurrentPlanState();
  const isAuthenticated = Boolean(latestState?.authenticated && latestState?.user);
  const folderCount = loadFolders().length;

  if (planTitle) {
    planTitle.textContent = plan.tier === "plus" ? "Plus 1000 / 50" : "Free 100 / 5";
  }
  if (planCopy) {
    if (!isAuthenticated) {
      planCopy.textContent = uiText(
        "로그인하면 현재 계정의 저장글 한도와 Plus 연결 상태를 확인할 수 있습니다.",
        "Sign in to see your current save limits and Plus status for this scrapbook account."
      );
    } else if (plan.tier === "plus") {
      planCopy.textContent = uiText(
        "이 계정은 Plus입니다. 저장글 1,000개와 폴더 50개까지 사용할 수 있습니다.",
        "This account is on Plus. You can save up to 1,000 posts and use up to 50 folders."
      );
    } else {
      planCopy.textContent = uiText(
        "Free는 저장글 100개와 폴더 5개까지 사용할 수 있습니다.",
        "Free includes up to 100 saved posts and 5 folders."
      );
    }
  }
  if (planTierBadge) {
    planTierBadge.textContent = plan.tier === "plus" ? "Plus" : "Free";
    planTierBadge.classList.toggle("is-plus", plan.tier === "plus");
  }
  if (planArchiveUsage) {
    planArchiveUsage.textContent = `${plan.archiveCount} / ${plan.archiveLimit}`;
  }
  if (planFolderUsage) {
    planFolderUsage.textContent = `${folderCount} / ${plan.folderLimit}`;
  }
  if (planKeyLabel) {
    planKeyLabel.textContent = uiText("Plus 키", "Plus key");
  }
  if (planKeyInput) {
    planKeyInput.placeholder = uiText("구매한 Plus 키를 붙여넣기", "Paste your Plus key");
    planKeyInput.disabled = !isAuthenticated;
  }
  if (planKeySubmit) {
    planKeySubmit.textContent = uiText("Plus 연결", "Activate Plus");
    planKeySubmit.disabled = !isAuthenticated;
  }
  if (planKeyClear) {
    planKeyClear.textContent = uiText("키 제거", "Remove key");
    planKeyClear.disabled = !isAuthenticated || (!plan.plusLicenseId && plan.plusStatus === "inactive");
  }
  if (planLicenseStatus) {
    let statusText = "";
    if (!isAuthenticated) {
      statusText = uiText(
        "먼저 Threads로 로그인해야 이 scrapbook 계정에 Plus 키를 연결할 수 있습니다.",
        "Sign in with Threads before linking a Plus key to this scrapbook account."
      );
    } else if (plan.plusStatus === "active") {
      statusText = plan.plusExpiresAt
        ? uiText(
            `Plus 활성화됨. 만료일: ${formatDate(plan.plusExpiresAt)}. 같은 키를 extension에도 사용할 수 있습니다.`,
            `Plus is active. Expires on ${formatDate(plan.plusExpiresAt)}. The same key also works in the extension.`
          )
        : uiText(
            "Plus 활성화됨. 같은 키를 extension에도 사용할 수 있습니다.",
            "Plus is active. The same key also works in the extension."
          );
    } else if (plan.plusStatus === "expired") {
      statusText = uiText(
        "이 scrapbook 계정에 연결된 Plus 키가 만료되었습니다. 새 키를 붙여넣거나 연장된 키로 다시 연결하세요.",
        "The Plus key linked to this scrapbook account has expired. Paste a renewed key to restore higher limits."
      );
    } else if (plan.plusStatus === "revoked") {
      statusText = uiText(
        "이 scrapbook 계정에 연결된 Plus 키가 비활성화되었습니다. 다른 키로 다시 연결하세요.",
        "The Plus key linked to this scrapbook account has been revoked. Paste another key to reconnect."
      );
    } else if (plan.plusStatus === "missing") {
      statusText = uiText(
        "이 scrapbook 계정의 Plus 연결 정보를 찾을 수 없습니다. 키를 다시 붙여넣어 주세요.",
        "The stored Plus link could not be verified. Paste your key again to reconnect this scrapbook account."
      );
    } else {
      statusText = uiText(
        "Free 플랜입니다. Plus 키를 붙여넣으면 저장글 1,000개와 폴더 50개로 확장됩니다.",
        "This account is on Free. Paste a Plus key to raise your limits to 1,000 saved posts and 50 folders."
      );
    }

    planLicenseStatus.textContent = statusText;
    planLicenseStatus.classList.toggle("hidden", statusText.length === 0);
  }
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

function normalizeBotHandle(value: string | null | undefined): string {
  return `${value ?? ""}`.trim().replace(/^@+/, "");
}

function normalizeScrapbookHandle(value: string | null | undefined): string | null {
  const normalized = normalizeBotHandle(value).toLowerCase();
  return normalized || null;
}

function buildScrapbookBasePath(handle = activeScrapbookHandle): string {
  const normalizedHandle = normalizeScrapbookHandle(handle);
  return normalizedHandle ? `/scrapbook/@${encodeURIComponent(normalizedHandle)}` : "/scrapbook";
}

function buildScrapbookArchivePath(archiveId: string, handle = activeScrapbookHandle): string {
  return `${buildScrapbookBasePath(handle).replace(/\/+$/, "")}/archive/${encodeURIComponent(archiveId)}`;
}

function readScrapbookRoute(pathname = window.location.pathname): { handle: string | null; archiveId: string | null } {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const archiveMatch = normalizedPath.match(/^\/scrapbook(?:\/@([^/]+))?\/archive\/([^/]+)$/);
  if (archiveMatch) {
    return {
      handle: normalizeScrapbookHandle(decodeURIComponent(archiveMatch[1] ?? "")),
      archiveId: decodeURIComponent(archiveMatch[2] ?? "")
    };
  }

  const handleMatch = normalizedPath.match(/^\/scrapbook\/@([^/]+)$/);
  if (handleMatch) {
    return {
      handle: normalizeScrapbookHandle(decodeURIComponent(handleMatch[1] ?? "")),
      archiveId: null
    };
  }

  return { handle: null, archiveId: null };
}

function syncScrapbookLinks(): void {
  const targetPath = buildScrapbookBasePath();
  if (topbarCurrentLink) {
    topbarCurrentLink.href = targetPath;
  }
  if (sessionScrapbookLink) {
    sessionScrapbookLink.href = targetPath;
  }
}

function syncScrapbookHistory(): void {
  const targetPath = activeArchiveId ? buildScrapbookArchivePath(activeArchiveId) : buildScrapbookBasePath();
  const currentUrl = new URL(window.location.href);
  if (currentUrl.pathname === targetPath) {
    return;
  }

  history.replaceState({}, "", `${targetPath}${currentUrl.search}${currentUrl.hash}`);
}

function replaceLegacyBotHandle(value: string, handle = getCurrentBotHandle()): string {
  const normalized = normalizeBotHandle(handle) || DEFAULT_BOT_HANDLE;
  return value.replaceAll(`@${LEGACY_BOT_HANDLE}`, `@${normalized}`);
}

function applyBotHandleToCopy<T>(value: T): T {
  if (typeof value === "string") {
    return replaceLegacyBotHandle(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => applyBotHandleToCopy(entry)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, applyBotHandleToCopy(entry)])
    ) as T;
  }

  return value;
}

function getCurrentBotHandle(): string {
  return normalizeBotHandle(latestConfig?.botHandle) || DEFAULT_BOT_HANDLE;
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
  if (archivesMoveSelected) {
    archivesMoveSelected.textContent = uiText("폴더 이동", "Move to folder");
  }
  if (archivesDeleteSelected) {
    archivesDeleteSelected.textContent = uiText("선택 삭제", "Delete selected");
  }

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
  msg = applyBotHandleToCopy(scrapbookMessages[currentLocale]);
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

  renderPlanPanel();
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

function setSessionMenuOpen(open: boolean): void {
  const shouldOpen = open && Boolean(latestState?.authenticated && latestState.user);
  sessionMenuOpen = shouldOpen;
  sessionPanel?.classList.toggle("is-open", shouldOpen);
  sessionMenu?.classList.toggle("hidden", !shouldOpen);
  sessionTrigger?.setAttribute("aria-expanded", String(shouldOpen));
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
  const isAuthenticated = Boolean(latestState?.authenticated && latestState.user);
  const disabled = connectButtonsBusy || !connectButtonsAvailable;
  for (const button of connectButtons) {
    button.classList.toggle("hidden", isAuthenticated);
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

function extractArchiveTitleExcerpt(text: string, maxChars = 30): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const firstSentence = normalized.split(/(?<=[.!?。！？])\s+|\n+/u, 1)[0]?.trim() ?? normalized;
  return Array.from(firstSentence).slice(0, maxChars).join("").trim();
}

function buildArchiveTitle(item: BotArchiveView): string {
  const excerpt = extractArchiveTitleExcerpt(item.targetText, 30);
  if (excerpt) {
    return excerpt;
  }
  if (item.targetAuthorHandle) {
    return t("scrapbookArchiveFallbackAuthorPost", { handle: item.targetAuthorHandle });
  }
  return t("scrapbookArchiveFallbackSavedItem");
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
    if (archivesMoveSelected) archivesMoveSelected.disabled = true;
    if (archivesDeleteSelected) archivesDeleteSelected.disabled = true;
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
  if (archivesMoveSelected) archivesMoveSelected.disabled = selectedCount === 0;
  if (archivesDeleteSelected) archivesDeleteSelected.disabled = selectedCount === 0;
}

function filterArchives(items: BotArchiveView[]): BotArchiveView[] {
  let filtered = items;

  if (activeFolderId) {
    const folderMap = loadFolderMap();
    filtered = filtered.filter((item) => folderMap[item.id] === activeFolderId);
  }

  if (archiveSearchQuery.trim()) {
    const query = archiveSearchQuery.trim().toLowerCase();
    const activeBotHandle = (latestConfig?.botHandle || latestState?.botHandle || "").toLowerCase();
    filtered = filtered.filter((item) => {
      const searchable = [
        item.targetText,
        item.targetAuthorHandle ?? "",
        item.targetAuthorDisplayName ?? "",
        item.noteText ?? "",
        item.targetUrl,
        ...item.tags,
        item.mentionUrl ?? "",
        item.mentionAuthorHandle ?? "",
        item.mentionAuthorDisplayName ?? "",
        ...item.authorReplies.map((r) => r.text),
        activeBotHandle
      ].join(" ").toLowerCase();
      return searchable.includes(query);
    });
  }

  return filtered;
}

function renderFolderStrip(allItems: BotArchiveView[]): void {
  if (!archivesFolderStrip) return;

  const folders = loadFolders();
  const folderMap = loadFolderMap();

  const folderCounts: Record<string, number> = {};
  let unfolderedCount = 0;
  for (const item of allItems) {
    const fid = folderMap[item.id];
    if (fid) {
      folderCounts[fid] = (folderCounts[fid] || 0) + 1;
    } else {
      unfolderedCount++;
    }
  }

  const allLabel = currentLocale === "ko" ? "전체" : currentLocale === "ja" ? "すべて" : "All";
  const newFolderLabel = currentLocale === "ko" ? "+ 새 폴더" : currentLocale === "ja" ? "+ 新規" : "+ New";

  let html = `<button class="folder-pill ${activeFolderId === null ? "is-active" : ""}" type="button" data-folder-id="">
    ${escapeHtml(allLabel)}
    <span class="folder-pill-count">${allItems.length}</span>
  </button>`;

  for (const folder of folders) {
    const count = folderCounts[folder.id] || 0;
    const isActive = activeFolderId === folder.id;
    html += `<button class="folder-pill ${isActive ? "is-active" : ""}" type="button" data-folder-id="${escapeHtml(folder.id)}">
      ${escapeHtml(folder.name)}
      <span class="folder-pill-count">${count}</span>
    </button>`;
  }

  html += `<button class="folder-pill folder-pill-new" type="button" data-folder-new="1">${escapeHtml(newFolderLabel)}</button>`;

  archivesFolderStrip.innerHTML = html;

  for (const button of archivesFolderStrip.querySelectorAll<HTMLButtonElement>("[data-folder-id]")) {
    button.addEventListener("click", () => {
      const fid = button.dataset.folderId || null;
      activeFolderId = fid || null;
      if (latestState) {
        renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
      }
    });

    button.addEventListener("contextmenu", (event) => {
      const fid = button.dataset.folderId;
      if (!fid) return;
      event.preventDefault();
      showFolderContextMenu(fid, event as MouseEvent);
    });
  }

  const newFolderButton = archivesFolderStrip.querySelector<HTMLButtonElement>("[data-folder-new]");
  newFolderButton?.addEventListener("click", () => void createFolderPrompt());
}

function createFolderPrompt(): void {
  if (!ensureFolderLimitAvailable()) {
    return;
  }

  const labelPrompt = currentLocale === "ko" ? "폴더 이름을 입력하세요:" : "Enter folder name:";
  const name = window.prompt(labelPrompt);
  if (!name?.trim()) return;

  const folders = loadFolders();
  const newFolder: FolderEntry = {
    id: generateFolderId(),
    name: name.trim(),
    createdAt: new Date().toISOString()
  };
  folders.push(newFolder);
  saveFolders(folders);

  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
  renderPlanPanel();

  const label = currentLocale === "ko" ? `폴더 "${newFolder.name}" 생성됨` : `Folder "${newFolder.name}" created`;
  setStatus(label);
}

function showFolderContextMenu(folderId: string, event: MouseEvent): void {
  const existing = document.querySelector(".folder-context-menu");
  existing?.remove();

  const folders = loadFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return;

  const renameLabel = currentLocale === "ko" ? "이름 변경" : "Rename";
  const deleteLabel = currentLocale === "ko" ? "폴더 삭제" : "Delete folder";

  const menu = document.createElement("div");
  menu.className = "folder-context-menu";
  menu.style.position = "fixed";
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  menu.innerHTML = `
    <button class="folder-context-item" data-action="rename">${escapeHtml(renameLabel)}</button>
    <button class="folder-context-item folder-context-item-danger" data-action="delete">${escapeHtml(deleteLabel)}</button>
  `;
  document.body.appendChild(menu);

  const dismiss = () => menu.remove();
  window.setTimeout(() => document.addEventListener("click", dismiss, { once: true }), 0);

  menu.querySelector<HTMLButtonElement>("[data-action='rename']")?.addEventListener("click", () => {
    dismiss();
    const prompt = currentLocale === "ko" ? `새 이름 입력 (현재: ${folder.name}):` : `New name (current: ${folder.name}):`;
    const newName = window.prompt(prompt, folder.name);
    if (!newName?.trim()) return;
    folder.name = newName.trim();
    saveFolders(folders);
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
    renderPlanPanel();
  });

  menu.querySelector<HTMLButtonElement>("[data-action='delete']")?.addEventListener("click", () => {
    dismiss();
    const confirmMsg = currentLocale === "ko"
      ? `폴더 "${folder.name}"를 삭제하시겠습니까? (안의 아이템은 삭제되지 않습니다)`
      : `Delete folder "${folder.name}"? (Items inside will not be deleted)`;
    if (!window.confirm(confirmMsg)) return;

    const updatedFolders = folders.filter((f) => f.id !== folderId);
    saveFolders(updatedFolders);

    const folderMap = loadFolderMap();
    for (const key of Object.keys(folderMap)) {
      if (folderMap[key] === folderId) {
        delete folderMap[key];
      }
    }
    saveFolderMap(folderMap);

    if (activeFolderId === folderId) {
      activeFolderId = null;
    }

    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
    renderPlanPanel();
  });
}

function showMoveToFolderMenu(): void {
  const existing = document.querySelector(".folder-move-menu");
  existing?.remove();

  const folders = loadFolders();
  const removeLabel = currentLocale === "ko" ? "폴더에서 제거" : "Remove from folder";
  const newLabel = currentLocale === "ko" ? "+ 새 폴더에 이동" : "+ Move to new folder";

  const menu = document.createElement("div");
  menu.className = "folder-move-menu";

  let html = `<div class="folder-move-menu-title">${escapeHtml(currentLocale === "ko" ? "폴더 선택" : "Choose folder")}</div>`;
  for (const folder of folders) {
    html += `<button class="folder-move-item" type="button" data-move-folder="${escapeHtml(folder.id)}">${escapeHtml(folder.name)}</button>`;
  }
  html += `<button class="folder-move-item" type="button" data-move-folder="">${escapeHtml(removeLabel)}</button>`;
  html += `<button class="folder-move-item folder-move-item-new" type="button" data-move-new="1">${escapeHtml(newLabel)}</button>`;

  menu.innerHTML = html;

  const btn = archivesMoveSelected;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 4}px`;
  }

  document.body.appendChild(menu);

  const dismiss = () => menu.remove();
  window.setTimeout(() => document.addEventListener("click", dismiss, { once: true }), 0);

  for (const item of menu.querySelectorAll<HTMLButtonElement>("[data-move-folder]")) {
    item.addEventListener("click", () => {
      dismiss();
      const targetFolderId = item.dataset.moveFolder || "";
      const folderMap = loadFolderMap();
      for (const archiveId of selectedArchiveIds) {
        if (targetFolderId) {
          folderMap[archiveId] = targetFolderId;
        } else {
          delete folderMap[archiveId];
        }
      }
      saveFolderMap(folderMap);
      selectedArchiveIds.clear();
      if (latestState) {
        renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
      }
      const label = currentLocale === "ko" ? "이동 완료" : "Moved";
      setStatus(label);
    });
  }

  menu.querySelector<HTMLButtonElement>("[data-move-new]")?.addEventListener("click", () => {
    dismiss();
    if (!ensureFolderLimitAvailable()) {
      return;
    }
    const labelPrompt = currentLocale === "ko" ? "새 폴더 이름:" : "New folder name:";
    const name = window.prompt(labelPrompt);
    if (!name?.trim()) return;

    const folders2 = loadFolders();
    const newFolder: FolderEntry = {
      id: generateFolderId(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };
    folders2.push(newFolder);
    saveFolders(folders2);

    const folderMap = loadFolderMap();
    for (const archiveId of selectedArchiveIds) {
      folderMap[archiveId] = newFolder.id;
    }
    saveFolderMap(folderMap);
    selectedArchiveIds.clear();

    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
    renderPlanPanel();
    const label = currentLocale === "ko" ? `"${newFolder.name}" 폴더로 이동됨` : `Moved to "${newFolder.name}"`;
    setStatus(label);
  });
}

async function bulkDeleteSelectedArchives(): Promise<void> {
  const count = selectedArchiveIds.size;
  if (count === 0) return;

  const confirmMsg = currentLocale === "ko"
    ? `선택한 ${count}개 항목을 삭제하시겠습니까?`
    : `Delete ${count} selected items?`;
  if (!window.confirm(confirmMsg)) return;

  const ids = [...selectedArchiveIds];
  for (const id of ids) {
    try {
      await requestJson<unknown>(`/api/public/bot/archive/${encodeURIComponent(id)}`, { method: "DELETE" });
      selectedArchiveIds.delete(id);
      expandedMediaArchiveIds.delete(id);
      if (activeArchiveId === id) {
        activeArchiveId = null;
      }
    } catch {
      // skip failed ones
    }
  }

  const folderMap = loadFolderMap();
  for (const id of ids) {
    delete folderMap[id];
  }
  saveFolderMap(folderMap);

  await refreshEverything();
  const label = currentLocale === "ko" ? `${ids.length}개 삭제됨` : `${ids.length} deleted`;
  setStatus(label);
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

function renderArchiveDetailHtml(item: BotArchiveView): string {
  const tagsLabel = buildArchiveTagsLabel(item);
  const totalMediaCount = countArchiveMedia(item);
  const hasMedia = totalMediaCount > 0;
  const showMedia = expandedMediaArchiveIds.has(item.id);
  const triggerLink = item.mentionUrl
    ? `<a class="topbar-link archive-action-link" href="${escapeHtml(item.mentionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTriggerView"))}</a>`
    : "";

  return `
    <div class="archive-detail-inline">
      <div class="archive-detail-head">
        <div>
          <h3>${escapeHtml(buildArchiveTitle(item))}</h3>
          <div class="archive-detail-meta">
            <span class="archive-chip">${escapeHtml(formatDate(item.archivedAt))}</span>
            ${tagsLabel ? `<span class="archive-chip">${escapeHtml(tagsLabel)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="archive-detail-body">${escapeHtml(item.targetText)}</div>
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
    </div>
  `;
}

function renderArchives(items: BotArchiveView[], isAuthenticated: boolean): void {
  if (!archivesEl || !archivesEmptyEl || !archivesBoard) {
    return;
  }

  if (!isAuthenticated || items.length === 0) {
    archivesEl.innerHTML = "";
    archivesBoard.classList.add("hidden");
    archivesEmptyEl.classList.remove("hidden");
    archivesEmptyEl.innerHTML = !isAuthenticated
      ? `<strong>${escapeHtml(t("scrapbookArchiveLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookArchiveLoginRequiredCopy"))}</span>`
      : `<strong>${escapeHtml(t("scrapbookArchiveEmptyTitle"))}</strong><span>${escapeHtml(t("scrapbookArchiveEmptyCopy"))}</span>`;
    activeArchiveId = null;
    archivesPaginationEl?.classList.add("hidden");
    updateArchivesToolbar([], isAuthenticated);
    archivesFilterBar?.classList.toggle("hidden", true);
    syncScrapbookHistory();
    return;
  }

  archivesFilterBar?.classList.remove("hidden");
  const ordered = [...items].sort((left, right) => {
    const archivedDelta = Date.parse(right.archivedAt) - Date.parse(left.archivedAt);
    if (archivedDelta !== 0) {
      return archivedDelta;
    }
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  });
  renderFolderStrip(ordered);

  const filtered = filterArchives(ordered);

  syncSelectedArchiveIds(filtered);
  if (!filtered.some((item) => item.id === activeArchiveId)) {
    activeArchiveId = null; 
  }

  archivesEmptyEl.classList.add("hidden");
  archivesBoard.classList.remove("hidden");

  if (filtered.length === 0) {
    archivesEl.innerHTML = `<tr><td colspan="4" class="archive-no-results">${escapeHtml(t("scrapbookNoResults"))}</td></tr>`;
    archivesPaginationEl?.classList.add("hidden");
    updateArchivesToolbar(filtered, isAuthenticated);
    syncScrapbookHistory();
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / archivesPerPage));
  if (archivesPage > totalPages) archivesPage = totalPages;
  if (archivesPaginationEl) archivesPaginationEl.classList.remove("hidden");
  if (archivesPageInfo) archivesPageInfo.textContent = `${archivesPage} / ${totalPages}`;
  if (archivesPagePrev) archivesPagePrev.disabled = archivesPage <= 1;
  if (archivesPageNext) archivesPageNext.disabled = archivesPage >= totalPages;

  const startIndex = (archivesPage - 1) * archivesPerPage;
  const paginated = filtered.slice(startIndex, startIndex + archivesPerPage);

  let html = "";
  for (const item of paginated) {
    const isSelected = selectedArchiveIds.has(item.id);
    const isActive = activeArchiveId === item.id;
    const tagsLabel = buildArchiveTagsLabel(item);
    html += `
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
          <td class="archive-row-tags">${escapeHtml(tagsLabel)}</td>
        </tr>
      `;
    if (isActive) {
      html += `<tr class="archive-row-detail"><td colspan="4">${renderArchiveDetailHtml(item)}</td></tr>`;
    }
  }

  archivesEl.innerHTML = html;

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
      updateArchivesToolbar(filtered, isAuthenticated);
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
      if (activeArchiveId === archiveId) {
        activeArchiveId = null;
      } else {
        activeArchiveId = archiveId;
      }
      renderArchives(items, isAuthenticated);
    });
  }

  const detailItem = paginated.find((item) => item.id === activeArchiveId);
  if (detailItem) {
    const copyButton = archivesEl.querySelector<HTMLButtonElement>("[data-copy]");
    if (copyButton) {
      copyButton.addEventListener("click", () => void copyArchiveMarkdown(detailItem, copyButton));
    }

    const mediaToggle = archivesEl.querySelector<HTMLButtonElement>("[data-media-toggle]");
    if (mediaToggle) {
      mediaToggle.addEventListener("click", () => {
        if (expandedMediaArchiveIds.has(detailItem.id)) {
          expandedMediaArchiveIds.delete(detailItem.id);
        } else {
          expandedMediaArchiveIds.add(detailItem.id);
        }
        renderArchives(items, isAuthenticated);
      });
    }

    const archiveDeleteButton = archivesEl.querySelector<HTMLButtonElement>("[data-archive-delete]");
    if (archiveDeleteButton) {
      archiveDeleteButton.addEventListener("click", () => void deleteArchiveRequest(detailItem.id));
    }
  }

  updateArchivesToolbar(filtered, isAuthenticated);
  syncScrapbookHistory();
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
      avatarFallback.classList.remove("hidden");
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
      avatarFallback?.classList.add("hidden");
    } else {
      avatarImage.src = "";
      avatarImage.classList.add("hidden");
      avatarFallback?.classList.remove("hidden");
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
    element.textContent = `@${normalizeBotHandle(config.botHandle) || DEFAULT_BOT_HANDLE}`;
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-site-host]")) {
    element.textContent = window.location.host;
  }

  const isAuthenticated = state.authenticated && Boolean(state.user);
  activeScrapbookHandle = isAuthenticated ? normalizeScrapbookHandle(state.user?.threadsHandle) : null;
  authPanel?.classList.toggle("hidden", isAuthenticated);
  sessionPanel?.classList.toggle("hidden", !isAuthenticated);
  workspaceTabs?.classList.toggle("hidden", !isAuthenticated);
  syncScrapbookLinks();
  setSessionMenuOpen(false);

  if (!config.oauthConfigured && !isAuthenticated) {
    setStatus(t("scrapbookConnectServerNotReady"), true);
    setConnectButtonsEnabled(false);
  } else {
    setConnectButtonsEnabled(true);
  }

  renderUser(isAuthenticated ? state.user : null);
  renderConnectButtons();
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
  renderPlanPanel();
  syncScrapbookHistory();
}

function applyWorkspaceState(workspace: ScrapbookPlusState): void {
  latestWorkspace = workspace;
  renderScopeStatus(workspace);
  renderWatchlists(workspace);
  renderSearches(workspace);
  renderInsights(workspace);
  renderPlanPanel();
}

function applyQueryStatus(): void {
  const currentUrl = new URL(window.location.href);
  const routeState = readScrapbookRoute(currentUrl.pathname);
  activeScrapbookHandle = routeState.handle;
  syncScrapbookLinks();
  const connected = currentUrl.searchParams.get("connected");
  const authError = currentUrl.searchParams.get("authError");
  const archiveId = routeState.archiveId ?? currentUrl.searchParams.get("archive");
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

async function submitPlusActivation(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!planKeyInput) {
    return;
  }

  const token = planKeyInput.value.trim();
  if (!token) {
    setStatus(uiText("먼저 Plus 키를 입력하세요.", "Enter a Plus key first."), true);
    return;
  }

  if (planKeySubmit) {
    planKeySubmit.disabled = true;
  }
  if (planKeyClear) {
    planKeyClear.disabled = true;
  }

  try {
    const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/plus/activate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token })
    });
    planKeyInput.value = "";
    applyWorkspaceState(workspace);
    setStatus(uiText("Plus가 이 scrapbook 계정에 연결되었습니다.", "Plus is now linked to this scrapbook account."));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : uiText("Plus 연결에 실패했습니다.", "Could not activate Plus."), true);
  } finally {
    renderPlanPanel();
  }
}

async function clearPlusActivationRequest(): Promise<void> {
  const confirmed = window.confirm(
    uiText(
      "이 scrapbook 계정에서 Plus 키 연결을 제거할까요?",
      "Remove the Plus key from this scrapbook account?"
    )
  );
  if (!confirmed) {
    return;
  }

  if (planKeySubmit) {
    planKeySubmit.disabled = true;
  }
  if (planKeyClear) {
    planKeyClear.disabled = true;
  }

  try {
    const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/plus/clear", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    if (planKeyInput) {
      planKeyInput.value = "";
    }
    applyWorkspaceState(workspace);
    setStatus(uiText("Plus 키 연결이 제거되었습니다.", "The Plus key was removed from this scrapbook account."));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : uiText("Plus 키 제거에 실패했습니다.", "Could not remove the Plus key."), true);
  } finally {
    renderPlanPanel();
  }
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

sessionTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  setSessionMenuOpen(!sessionMenuOpen);
});

avatarImage?.addEventListener("error", () => {
  avatarImage.src = "";
  avatarImage.classList.add("hidden");
  avatarFallback?.classList.remove("hidden");
});

document.addEventListener("click", (event) => {
  if (!sessionPanel || !(event.target instanceof Node) || sessionPanel.contains(event.target)) {
    return;
  }
  setSessionMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSessionMenuOpen(false);
  }
});

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
    setSessionMenuOpen(false);
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

planKeyForm?.addEventListener("submit", (event) => {
  void submitPlusActivation(event);
});

planKeyClear?.addEventListener("click", () => {
  void clearPlusActivationRequest();
});

archivesSelectAll?.addEventListener("change", () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  const filtered = filterArchives(latestState.archives);
  if (archivesSelectAll.checked) {
    for (const item of filtered) {
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

archivesMoveSelected?.addEventListener("click", () => {
  showMoveToFolderMenu();
});

archivesDeleteSelected?.addEventListener("click", () => {
  void bulkDeleteSelectedArchives();
});

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
archivesSearchInput?.addEventListener("input", () => {
  archiveSearchQuery = archivesSearchInput.value;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }, 200);
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

archivesPerPageSelect?.addEventListener("change", () => {
  archivesPerPage = parseInt(archivesPerPageSelect.value, 10);
  archivesPage = 1;
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
});

archivesPagePrev?.addEventListener("click", () => {
  if (archivesPage > 1) {
    archivesPage--;
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }
});

archivesPageNext?.addEventListener("click", () => {
  archivesPage++;
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
});
