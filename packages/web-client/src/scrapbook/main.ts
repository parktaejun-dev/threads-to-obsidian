import { SUPPORTED_LOCALES, getLocaleLabel } from "@threads/shared/locale";
import {
  applyBotHandlePlaceholder,
  applyTranslations,
  getLocale,
  scrapbookMessages,
  setLocale,
  type ScrapbookMsg,
  type WebLocale
} from "../lib/web-i18n";
import { DEFAULT_BOT_HANDLE, normalizeBotHandleValue } from "../lib/web-copy-constants";
import * as htmlToImage from "html-to-image";
import {
  calculateGrowthScore,
  calculateMedals,
  selectHighlight,
  type GrowthInsightsData
} from "./growth-tier";
interface BotPublicConfig {
  botHandle: string;
  oauthConfigured: boolean;
}

interface BotSessionAuthState extends BotPublicConfig {
  authenticated: boolean;
  user: BotUserView | null;
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
  title: string;
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

interface BotSessionState extends BotSessionAuthState {
  archives: BotArchiveView[];
  saveStatus: BotSaveStatusView | null;
}

interface NotionConnectionSummary {
  connected: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceIcon: string | null;
  selectedParentType: "page" | "data_source" | null;
  selectedParentId: string | null;
  selectedParentLabel: string | null;
  selectedParentUrl: string | null;
}

interface NotionLocationOption {
  id: string;
  type: "page" | "data_source";
  label: string;
  url: string;
  subtitle: string | null;
}

interface NotionExportPageResult {
  pageId: string;
  pageUrl: string;
  title: string;
}

interface NotionExportResult {
  exportedCount: number;
  pages: NotionExportPageResult[];
}

interface BotBootstrapState extends BotSessionState {
  workspace: ScrapbookPlusState;
}

interface BotSaveStatusView {
  currentState: "idle" | "queued" | "processing" | "completed" | "failed";
  completionSource: "job" | "archive_inferred" | null;
  collectorEnabled: boolean;
  pollIntervalMs: number;
  collectorError: string | null;
  lastCollectedAt: string | null;
  latestMentionUrl: string | null;
  latestMentionCreatedAt: string | null;
  latestMentionUpdatedAt: string | null;
  latestJobStatus: "queued" | "processing" | "completed" | "failed" | "invalid" | "unmatched" | null;
  latestJobError: string | null;
  latestSavedAt: string | null;
  expectedVisibleAt: string | null;
  retryAvailableAt: string | null;
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

interface ScrapbookInsightsSavedPostView {
  externalPostId: string | null;
  canonicalUrl: string | null;
  title: string;
  views: number | null;
  likes: number | null;
}

interface ScrapbookInsightsSavedView {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  capturedAt: string | null;
  insightProps?: {
    highlightId: string;
    highlightParams: Record<string, string | number>;
    localeAtSave: string;
    tier: string;
    score: number;
  } | null;
  overview: {
    followers: number | null;
    profileViews: number | null;
    views: number | null;
    likes: number | null;
    replies: number | null;
    reposts: number | null;
  };
  posts: ScrapbookInsightsSavedPostView[];
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
  savedViews: ScrapbookInsightsSavedView[];
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

type ArchiveExportTarget = "zip" | "notion" | "obsidian";
type PickerWindow = Window & {
  showDirectoryPicker?: (options?: { id?: string; mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};
type PermissionDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
};

interface StoredDirectoryHandleRecord {
  handle: FileSystemDirectoryHandle;
  label: string;
  savedAt: string;
}

const OBSIDIAN_DIRECTORY_DB_NAME = "threads-to-obsidian";
const OBSIDIAN_DIRECTORY_STORE_NAME = "handles";
const OBSIDIAN_DIRECTORY_KEY = "obsidian-target-directory";
const OBSIDIAN_EXPORT_FOLDER = "Threads Scrapbook";
let cachedObsidianDirectoryHandle: FileSystemDirectoryHandle | null = null;
let storedObsidianDirectoryRecordPromise: Promise<StoredDirectoryHandleRecord | null> | null = null;

interface ScrapbookSyncSnapshot {
  savedAt: string;
  config: BotPublicConfig;
  state: BotSessionState;
  workspace: ScrapbookPlusState | null;
}

type WorkspaceTab = "inbox" | "watchlists" | "searches" | "insights";
type ArchiveInlineEditMode = "title" | "tags";

interface ArchiveInlineEditState {
  archiveId: string;
  mode: ArchiveInlineEditMode;
}

let latestConfig: BotPublicConfig | null = null;
let latestState: BotSessionState | null = null;
let latestWorkspace: ScrapbookPlusState | null = null;
let activeTab: WorkspaceTab = "inbox";
let activeArchiveId: string | null = null;
let editingArchiveId: string | null = null;
let activeArchiveInlineEdit: ArchiveInlineEditState | null = null;
let activeScrapbookHandle: string | null = null;
const selectedArchiveIds = new Set<string>();
const expandedMediaArchiveIds = new Set<string>();
let connectButtonsBusy = false;
let connectButtonsAvailable = true;
let sessionMenuOpen = false;
let isExportingArchives = false;
let isRefreshingSaveStatus = false;
let archiveSearchQuery = "";
let activeArchiveTag: string | null = null;
let activeFolderId: string | null = null;
let pendingConnectedStatus = false;
let archivesHydrating = false;
let hasAppliedSyncSnapshot = false;

interface FolderEntry {
  id: string;
  name: string;
  createdAt: string;
}

const FOLDER_STORAGE_KEY = "scrapbook_folders";
const FOLDER_MAP_STORAGE_KEY = "scrapbook_folder_map";
const SYNC_SNAPSHOT_STORAGE_KEY = "scrapbook_sync_snapshot_v1";
const SYNC_SNAPSHOT_TTL_MS = 15 * 60_000;
const SYNC_SNAPSHOT_ARCHIVE_LIMIT = 30;

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

function clearSyncSnapshot(): void {
  try {
    localStorage.removeItem(SYNC_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Ignore snapshot storage failures and fall back to network-only boot.
  }
}

function loadSyncSnapshot(): ScrapbookSyncSnapshot | null {
  try {
    const raw = localStorage.getItem(SYNC_SNAPSHOT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const snapshot = JSON.parse(raw) as ScrapbookSyncSnapshot | null;
    const savedAtMs = Date.parse(snapshot?.savedAt ?? "");
    if (!snapshot?.state?.authenticated || !snapshot.state.user || !Number.isFinite(savedAtMs)) {
      clearSyncSnapshot();
      return null;
    }
    if (Date.now() - savedAtMs > SYNC_SNAPSHOT_TTL_MS) {
      clearSyncSnapshot();
      return null;
    }

    const snapshotHandle = normalizeScrapbookHandle(snapshot.state.user.threadsHandle);
    if (!snapshotHandle) {
      clearSyncSnapshot();
      return null;
    }
    if (activeScrapbookHandle && activeScrapbookHandle !== snapshotHandle) {
      return null;
    }

    return snapshot;
  } catch {
    clearSyncSnapshot();
    return null;
  }
}

function persistSyncSnapshot(): void {
  if (!latestConfig || !latestState?.authenticated || !latestState.user) {
    clearSyncSnapshot();
    return;
  }

  const snapshot: ScrapbookSyncSnapshot = {
    savedAt: new Date().toISOString(),
    config: {
      botHandle: latestConfig.botHandle,
      oauthConfigured: latestConfig.oauthConfigured
    },
    state: {
      ...latestState,
      user: { ...latestState.user },
      saveStatus: latestState.saveStatus ? { ...latestState.saveStatus } : null,
      archives: latestState.archives.slice(0, SYNC_SNAPSHOT_ARCHIVE_LIMIT).map((item) => ({
        ...item,
        tags: [...item.tags],
        mediaUrls: [...item.mediaUrls],
        authorReplies: item.authorReplies.map((reply) => ({
          ...reply,
          mediaUrls: [...reply.mediaUrls]
        }))
      }))
    },
    workspace:
      latestWorkspace && latestWorkspace.authenticated
        ? JSON.parse(JSON.stringify(latestWorkspace)) as ScrapbookPlusState
        : null
  };

  try {
    localStorage.setItem(SYNC_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    clearSyncSnapshot();
  }
}

function applySyncSnapshot(): boolean {
  const snapshot = loadSyncSnapshot();
  if (!snapshot) {
    return false;
  }

  applySessionState(snapshot.config, snapshot.state, { persist: false });
  if (snapshot.workspace?.authenticated) {
    applyWorkspaceState(snapshot.workspace, { persist: false });
  }
  return true;
}

function generateFolderId(): string {
  return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

let currentLocale: WebLocale = getLocale("en");
let msg: ScrapbookMsg = scrapbookMessages[currentLocale];

const botHandleEls = document.querySelectorAll<HTMLElement>("[data-bot-handle]");
const connectButtons = document.querySelectorAll<HTMLButtonElement>("[data-bot-connect]");
const mobileOauthNotes = document.querySelectorAll<HTMLElement>("[data-mobile-oauth-note]");
const brandLink = document.querySelector<HTMLAnchorElement>(".brand-link");
const localeSelect = document.querySelector<HTMLSelectElement>("#scrapbook-locale-select");
const metaDescription = document.querySelector<HTMLMetaElement>("#scrapbook-meta-description");
const topbarCurrentLink = document.querySelector<HTMLAnchorElement>("#topbar-current-link");
const topbarPlanBadge = document.querySelector<HTMLElement>("#topbar-plan-badge");
const authPanel = document.querySelector<HTMLElement>("#auth-panel");
const authPanelCopyNote = document.querySelector<HTMLElement>("#auth-panel-copy-note");
const sessionPanel = document.querySelector<HTMLElement>("#session-panel");
const sessionTrigger = document.querySelector<HTMLButtonElement>("#session-trigger");
const sessionMenu = document.querySelector<HTMLElement>("#session-menu");
const pageStatus = document.querySelector<HTMLParagraphElement>("#page-status");
const saveStatusPanel = document.querySelector<HTMLElement>("#save-status-panel");
const saveStatusConnectionBadge = document.querySelector<HTMLElement>("#save-status-connection-badge");
const saveStatusConnectionCopy = document.querySelector<HTMLElement>("#save-status-connection-copy");
const saveStatusLastLabel = document.querySelector<HTMLElement>("#save-status-last-label");
const saveStatusLastValue = document.querySelector<HTMLElement>("#save-status-last-value");
const saveStatusPlan = document.querySelector<HTMLElement>("#save-status-plan");
const saveStatusPlanSummary = document.querySelector<HTMLElement>("#save-status-plan-summary");
const saveStatusPlanClear = document.querySelector<HTMLButtonElement>("#save-status-plan-clear");
const planSection = document.querySelector<HTMLElement>("#plan-section");
const planEyebrow = document.querySelector<HTMLElement>("#plan-eyebrow");
const planTitle = document.querySelector<HTMLElement>("#plan-title");
const planCopy = document.querySelector<HTMLElement>("#plan-copy");
const planTierBadge = document.querySelector<HTMLElement>("#plan-tier-badge");
const planArchiveLabel = document.querySelector<HTMLElement>("#plan-archive-label");
const planArchiveUsage = document.querySelector<HTMLElement>("#plan-archive-usage");
const planFolderLabel = document.querySelector<HTMLElement>("#plan-folder-label");
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
const sessionPlanClear = document.querySelector<HTMLButtonElement>("#session-plan-clear");
const avatarImage = document.querySelector<HTMLImageElement>("#profile-avatar-image");
const avatarFallback = document.querySelector<HTMLElement>("#profile-avatar-fallback");
const archivesEl = document.querySelector<HTMLElement>("#archives");
const archivesBoard = document.querySelector<HTMLElement>("#archives-board");
const archivesEmptyEl = document.querySelector<HTMLElement>("#archives-empty");
const archivesLoadingEl = document.querySelector<HTMLElement>("#archives-loading");
const archivesLoadingLabel = document.querySelector<HTMLElement>("#archives-loading-label");
const archivesPaginationEl = document.querySelector<HTMLElement>("#archives-pagination");
const archivesPerPageSelect = document.querySelector<HTMLSelectElement>("#archives-per-page-select");
const archivesPagePrev = document.querySelector<HTMLButtonElement>("#archives-page-prev");
const archivesPageNext = document.querySelector<HTMLButtonElement>("#archives-page-next");
const archivesPageInfo = document.querySelector<HTMLSpanElement>("#archives-page-info");
const archivesSearchToggle = document.querySelector<HTMLButtonElement>("#archives-search-toggle");
const archivesSearchWrap = document.querySelector<HTMLElement>("#archives-search-wrap");
const archivesTagToggle = document.querySelector<HTMLButtonElement>("#archives-tag-toggle");
const archivesSortHeader = document.querySelector<HTMLElement>("#archives-sort-header");
const archivesSortToggle = document.querySelector<HTMLButtonElement>("#archives-sort-toggle");
const archivesSortArrow = document.querySelector<HTMLElement>("#archives-sort-arrow");
type ArchiveSortOrder = "asc" | "desc";
let archiveSortOrder: ArchiveSortOrder = "desc";
let archivesPage = 1;
let archivesPerPage = 10;
let archivesSearchExpanded = false;
let archivesTagExpanded = false;
const archivesToolbar = document.querySelector<HTMLElement>("#archives-toolbar");
const archivesToolbarMeta = document.querySelector<HTMLElement>("#archives-toolbar-meta");
const archivesToolbarActions = document.querySelector<HTMLElement>("#archives-toolbar .archives-toolbar-actions");
const archivesSelectAll = document.querySelector<HTMLInputElement>("#archives-select-all");
const archivesExportAll = document.querySelector<HTMLButtonElement>("#archives-export-all");
const archivesMoveSelected = document.querySelector<HTMLButtonElement>("#archives-move-selected");
const archivesDeleteSelected = document.querySelector<HTMLButtonElement>("#archives-delete-selected");
const archivesFilterBar = document.querySelector<HTMLElement>("#archives-filter-bar");
const archivesSearchInput = document.querySelector<HTMLInputElement>("#archives-search");
const archivesTagPanel = document.querySelector<HTMLElement>("#archives-tag-panel");
const archivesFolderStrip = document.querySelector<HTMLElement>("#archives-folder-strip");
const logoutButton = document.querySelector<HTMLButtonElement>("#logout");
const workspaceTabs = document.querySelector<HTMLElement>("#workspace-tabs");
const workspaceTabTrigger = document.querySelector<HTMLButtonElement>("#workspace-tab-trigger");
const workspaceTabCurrent = document.querySelector<HTMLElement>("#workspace-tab-current");
const workspaceTabOverlay = document.querySelector<HTMLElement>("#workspace-tab-overlay");
const workspaceTabClose = document.querySelector<HTMLButtonElement>("#workspace-tab-close");
const workspaceTabButtons = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
const workspacePanels = document.querySelectorAll<HTMLElement>("[data-tab-panel]");
const watchlistForm = document.querySelector<HTMLFormElement>("#watchlist-form");
const watchlistsList = document.querySelector<HTMLElement>("#watchlists-list");
const watchlistsEmpty = document.querySelector<HTMLElement>("#watchlists-empty");
const searchForm = document.querySelector<HTMLFormElement>("#search-form");
const searchesList = document.querySelector<HTMLElement>("#searches-list");
const searchesEmpty = document.querySelector<HTMLElement>("#searches-empty");
const insightsSaveView = document.querySelector<HTMLButtonElement>("#insights-save-view");
const insightsShareCard = document.querySelector<HTMLButtonElement>("#insights-share-card");
const insightsRefresh = document.querySelector<HTMLButtonElement>("#insights-refresh");
const insightsRefreshed = document.querySelector<HTMLElement>("#insights-refreshed");
const insightsEmpty = document.querySelector<HTMLElement>("#insights-empty");
const insightsSavedEmpty = document.querySelector<HTMLElement>("#insights-saved-empty");
const insightsSavedList = document.querySelector<HTMLElement>("#insights-saved-list");
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

type SecondaryWebLocale = Exclude<WebLocale, "ko" | "en">;
type SecondaryLocaleCopy = Partial<Record<SecondaryWebLocale, string>>;

function buildUiTextKey(ko: string, en: string): string {
  return `${ko}\u241f${en}`;
}

const staticUiTextOverrides: Record<string, SecondaryLocaleCopy> = {
  [buildUiTextKey("이동", "Move")]: {
    ja: "移動",
    "pt-BR": "Mover",
    es: "Mover",
    "zh-TW": "移動",
    vi: "Di chuyển"
  },
  [buildUiTextKey("삭제", "Delete")]: {
    ja: "削除",
    "pt-BR": "Excluir",
    es: "Eliminar",
    "zh-TW": "刪除",
    vi: "Xóa"
  },
  [buildUiTextKey("내보내기", "Export")]: {
    ja: "エクスポート",
    "pt-BR": "Exportar",
    es: "Exportar",
    "zh-TW": "匯出",
    vi: "Xuất"
  },
  [buildUiTextKey("내보내는 중", "Exporting")]: {
    ja: "エクスポート中",
    "pt-BR": "Exportando",
    es: "Exportando",
    "zh-TW": "匯出中",
    vi: "Đang xuất"
  },
  [buildUiTextKey("로그인하면 현재 계정의 저장글 한도와 Plus 연결 상태를 확인할 수 있습니다.", "Sign in to see your current save limits and Plus status for this scrapbook account.")]: {
    ja: "ログインすると、この scrapbook アカウントの保存上限と Plus 連携状態を確認できます。",
    "pt-BR": "Ao entrar, você verá os limites atuais e o estado do Plus desta conta do scrapbook.",
    es: "Al iniciar sesión podrás ver los límites actuales y el estado de Plus de esta cuenta del scrapbook.",
    "zh-TW": "登入後即可查看此 scrapbook 帳號目前的保存上限與 Plus 連線狀態。",
    vi: "Đăng nhập để xem giới hạn hiện tại và trạng thái Plus của tài khoản scrapbook này."
  },
  [buildUiTextKey("이 계정은 Plus입니다. 저장글 1,000개와 폴더 50개까지 사용할 수 있습니다.", "This account is on Plus. You can save up to 1,000 posts and use up to 50 folders.")]: {
    ja: "このアカウントは Plus です。保存は 1,000 件、フォルダは 50 個まで使えます。",
    "pt-BR": "Esta conta está no Plus. Você pode salvar até 1.000 posts e usar até 50 pastas.",
    es: "Esta cuenta tiene Plus. Puedes guardar hasta 1.000 publicaciones y usar hasta 50 carpetas.",
    "zh-TW": "此帳號目前為 Plus，可保存最多 1,000 則內容並使用 50 個資料夾。",
    vi: "Tài khoản này đang ở gói Plus. Bạn có thể lưu tối đa 1.000 bài và dùng 50 thư mục."
  },
  [buildUiTextKey("Free는 저장글 100개와 폴더 5개까지 사용할 수 있습니다.", "Free includes up to 100 saved posts and 5 folders.")]: {
    ja: "Free では保存 100 件、フォルダ 5 個まで使えます。",
    "pt-BR": "O Free inclui até 100 posts salvos e 5 pastas.",
    es: "Free incluye hasta 100 publicaciones guardadas y 5 carpetas.",
    "zh-TW": "Free 最多可保存 100 則內容並使用 5 個資料夾。",
    vi: "Gói Free cho phép lưu tối đa 100 bài và dùng 5 thư mục."
  },
  [buildUiTextKey("Plus 키", "Plus key")]: {
    ja: "Plus キー",
    "pt-BR": "Chave Plus",
    es: "Clave Plus",
    "zh-TW": "Plus 金鑰",
    vi: "Khóa Plus"
  },
  [buildUiTextKey("구매한 Plus 키를 붙여넣기", "Paste your Plus key")]: {
    ja: "購入した Plus キーを貼り付け",
    "pt-BR": "Cole sua chave Plus aqui",
    es: "Pega tu clave Plus aquí",
    "zh-TW": "貼上購買的 Plus 金鑰",
    vi: "Dán khóa Plus bạn đã mua"
  },
  [buildUiTextKey("Plus 연결", "Activate Plus")]: {
    ja: "Plus 連携",
    "pt-BR": "Ativar Plus",
    es: "Activar Plus",
    "zh-TW": "Plus 連線",
    vi: "Kết nối Plus"
  },
  [buildUiTextKey("키 제거", "Remove key")]: {
    ja: "キーを削除",
    "pt-BR": "Remover chave",
    es: "Quitar clave",
    "zh-TW": "清除金鑰",
    vi: "Xóa khóa"
  },
  [buildUiTextKey("댓글 저장", "Reply saves")]: {
    ja: "リプライ保存",
    "pt-BR": "Salvar respostas",
    es: "Guardar respuestas",
    "zh-TW": "留言儲存",
    vi: "Lưu phản hồi"
  },
  [buildUiTextKey("업데이트", "Updated")]: {
    ja: "更新済み",
    "pt-BR": "Atualizado",
    es: "Actualizado",
    "zh-TW": "已更新",
    vi: "Đã cập nhật"
  },
  [buildUiTextKey("불러오는 중", "Loading")]: {
    ja: "読み込み中",
    "pt-BR": "Carregando",
    es: "Cargando",
    "zh-TW": "讀取中",
    vi: "Đang tải"
  },
  [buildUiTextKey("Plus가 필요합니다.", "Plus required.")]: {
    ja: "Plus が必要です。",
    "pt-BR": "Necessário Plus.",
    es: "Se requiere Plus.",
    "zh-TW": "需要 Plus。",
    vi: "Yêu cầu Plus."
  },
  [buildUiTextKey("먼저 Plus 키를 입력하세요.", "Enter a Plus key first.")]: {
    ja: "先に Plus キーを入力してください。",
    "pt-BR": "Insira uma chave Plus primeiro.",
    es: "Ingresa una clave Plus primero.",
    "zh-TW": "請先輸入 Plus 金鑰。",
    vi: "Hãy nhập khóa Plus trước."
  },
  [buildUiTextKey("Plus가 이 scrapbook 계정에 연결되었습니다.", "Plus is now linked to this scrapbook account.")]: {
    ja: "Plus がこの scrapbook アカウントに連携されました。",
    "pt-BR": "O Plus agora está vinculado a esta conta do scrapbook.",
    es: "Plus ahora está vinculado a esta cuenta del scrapbook.",
    "zh-TW": "Plus 已連結至此 scrapbook 帳號。",
    vi: "Plus đã được kết nối với tài khoản scrapbook này."
  },
  [buildUiTextKey("Plus 연결에 실패했습니다.", "Could not activate Plus.")]: {
    ja: "Plus 連携に失敗しました。",
    "pt-BR": "Não foi possível ativar o Plus.",
    es: "No se pudo activar Plus.",
    "zh-TW": "Plus 連線失敗。",
    vi: "Kết nối Plus thất bại."
  },
  [buildUiTextKey("Plus 키 연결이 제거되었습니다.", "The Plus key was removed from this scrapbook account.")]: {
    ja: "Plus キーの連携が解除されました。",
    "pt-BR": "A chave Plus foi removida desta conta do scrapbook.",
    es: "Se ha quitado la clave Plus de esta cuenta del scrapbook.",
    "zh-TW": "Plus 金鑰連結已清除。",
    vi: "Đã xóa kết nối khóa Plus."
  },
  [buildUiTextKey("Plus 키 제거에 실패했습니다.", "Could not remove the Plus key.")]: {
    ja: "Plus キーの解除に 실패했습니다。",
    "pt-BR": "Não foi possível remover a chave Plus.",
    es: "No se pudo quitar la clave Plus.",
    "zh-TW": "Plus 金鑰清除失敗。",
    vi: "Xóa khóa Plus thất bại."
  },
  [buildUiTextKey("새 댓글 저장 상태를 다시 확인했습니다.", "Checked the latest reply save status.")]: {
    ja: "最新のリプライ保存状態を再確認しました。",
    "pt-BR": "Status de salvamento de respostas atualizado.",
    es: "Se ha vuelto a comprobar el estado de guardado de respuestas.",
    "zh-TW": "已重新確認最新留言儲存狀態。",
    vi: "Đã kiểm tra lại trạng thái lưu phản hồi mới."
  },
  [buildUiTextKey("구매한 Plus 키를 붙여넣기", "Paste your Plus key")]: {
    ja: "購入した Plus キーを貼り付ける",
    "pt-BR": "Cole sua chave Plus",
    es: "Pega tu clave Plus",
    "zh-TW": "貼上你購買的 Plus 金鑰",
    vi: "Dán khóa Plus bạn đã mua"
  },
  [buildUiTextKey("Plus 연결", "Activate Plus")]: {
    ja: "Plus を連携",
    "pt-BR": "Ativar Plus",
    es: "Activar Plus",
    "zh-TW": "啟用 Plus",
    vi: "Kích hoạt Plus"
  },
  [buildUiTextKey("키 제거", "Remove key")]: {
    ja: "キーを削除",
    "pt-BR": "Remover chave",
    es: "Quitar clave",
    "zh-TW": "移除金鑰",
    vi: "Gỡ khóa"
  },
  [buildUiTextKey("먼저 Threads로 로그인해야 이 scrapbook 계정에 Plus 키를 연결할 수 있습니다.", "Sign in with Threads before linking a Plus key to this scrapbook account.")]: {
    ja: "この scrapbook アカウントに Plus キーを連携するには、先に Threads へログインしてください。",
    "pt-BR": "Entre com Threads antes de vincular uma chave Plus a esta conta do scrapbook.",
    es: "Inicia sesión con Threads antes de vincular una clave Plus a esta cuenta del scrapbook.",
    "zh-TW": "要將 Plus 金鑰連到此 scrapbook 帳號，請先用 Threads 登入。",
    vi: "Hãy đăng nhập bằng Threads trước khi liên kết khóa Plus với tài khoản scrapbook này."
  },
  [buildUiTextKey("Plus 활성화됨. 같은 키를 extension에도 사용할 수 있습니다.", "Plus is active. The same key also works in the extension.")]: {
    ja: "Plus は有効です。同じキーを extension でも使えます。",
    "pt-BR": "O Plus está ativo. A mesma chave também funciona na extension.",
    es: "Plus está activo. La misma clave también funciona en la extension.",
    "zh-TW": "Plus 已啟用，同一把金鑰也可用在 extension。",
    vi: "Plus đã được kích hoạt. Cùng khóa này cũng dùng được trong extension."
  },
  [buildUiTextKey("이 scrapbook 계정에 연결된 Plus 키가 만료되었습니다. 새 키를 붙여넣거나 연장된 키로 다시 연결하세요.", "The Plus key linked to this scrapbook account has expired. Paste a renewed key to restore higher limits.")]: {
    ja: "この scrapbook アカウントに連携した Plus キーは期限切れです。更新済みのキーを貼り付けて上限を復元してください。",
    "pt-BR": "A chave Plus vinculada a esta conta do scrapbook expirou. Cole uma chave renovada para restaurar os limites maiores.",
    es: "La clave Plus vinculada a esta cuenta del scrapbook ha expirado. Pega una clave renovada para recuperar los límites ampliados.",
    "zh-TW": "此 scrapbook 帳號連結的 Plus 金鑰已過期。請貼上續期後的金鑰以恢復較高上限。",
    vi: "Khóa Plus liên kết với tài khoản scrapbook này đã hết hạn. Hãy dán khóa đã gia hạn để khôi phục giới hạn cao hơn."
  },
  [buildUiTextKey("이 scrapbook 계정에 연결된 Plus 키가 비활성화되었습니다. 다른 키로 다시 연결하세요.", "The Plus key linked to this scrapbook account has been revoked. Paste another key to reconnect.")]: {
    ja: "この scrapbook アカウントに連携した Plus キーは無効化されました。別のキーを貼り付けて再接続してください。",
    "pt-BR": "A chave Plus vinculada a esta conta do scrapbook foi revogada. Cole outra chave para reconectar.",
    es: "La clave Plus vinculada a esta cuenta del scrapbook fue revocada. Pega otra clave para volver a conectar.",
    "zh-TW": "此 scrapbook 帳號連結的 Plus 金鑰已被停用。請改用另一把金鑰重新連結。",
    vi: "Khóa Plus liên kết với tài khoản scrapbook này đã bị thu hồi. Hãy dán khóa khác để liên kết lại."
  },
  [buildUiTextKey("이 scrapbook 계정의 Plus 연결 정보를 찾을 수 없습니다. 키를 다시 붙여넣어 주세요.", "The stored Plus link could not be verified. Paste your key again to reconnect this scrapbook account.")]: {
    ja: "この scrapbook アカウントの Plus 連携情報を確認できません。キーをもう一度貼り付けてください。",
    "pt-BR": "Não foi possível verificar o vínculo Plus salvo. Cole a chave novamente para reconectar esta conta do scrapbook.",
    es: "No se pudo verificar el vínculo Plus guardado. Pega la clave de nuevo para reconectar esta cuenta del scrapbook.",
    "zh-TW": "無法驗證此 scrapbook 帳號儲存的 Plus 連線資訊。請重新貼上金鑰。",
    vi: "Không thể xác minh liên kết Plus đã lưu. Hãy dán lại khóa để kết nối lại tài khoản scrapbook này."
  },
  [buildUiTextKey("Free 플랜입니다. Plus 키를 붙여넣으면 저장글 1,000개와 폴더 50개로 확장됩니다.", "This account is on Free. Paste a Plus key to raise your limits to 1,000 saved posts and 50 folders.")]: {
    ja: "このアカウントは Free です。Plus キーを貼り付けると保存 1,000 件、フォルダ 50 個まで拡張されます。",
    "pt-BR": "Esta conta está no Free. Cole uma chave Plus para elevar os limites para 1.000 posts salvos e 50 pastas.",
    es: "Esta cuenta está en Free. Pega una clave Plus para ampliar los límites a 1.000 publicaciones guardadas y 50 carpetas.",
    "zh-TW": "此帳號目前為 Free。貼上 Plus 金鑰後可將上限提升到 1,000 則保存與 50 個資料夾。",
    vi: "Tài khoản này đang ở gói Free. Hãy dán khóa Plus để nâng giới hạn lên 1.000 bài đã lưu và 50 thư mục."
  },
  [buildUiTextKey("Threads 로그인 응답은 도착했지만 세션을 확인하지 못했습니다. 잠시 후 새로고침해 다시 확인해 주세요.", "The Threads sign-in response arrived, but the session could not be confirmed. Refresh and check again in a moment.")]: {
    ja: "Threads のログイン応答は届きましたが、セッションを確認できませんでした。少し待ってから更新して再確認してください。",
    "pt-BR": "A resposta de login do Threads chegou, mas não foi possível confirmar a sessão. Atualize em instantes e verifique novamente.",
    es: "La respuesta de inicio de sesión de Threads llegó, pero no se pudo confirmar la sesión. Actualiza en un momento y vuelve a comprobar.",
    "zh-TW": "已收到 Threads 登入回應，但無法確認工作階段。請稍後重新整理再檢查一次。",
    vi: "Đã nhận phản hồi đăng nhập từ Threads nhưng không thể xác nhận phiên. Hãy làm mới sau ít phút rồi kiểm tra lại."
  },
  [buildUiTextKey("불러오는 중", "Loading")]: {
    ja: "読み込み中",
    "pt-BR": "Carregando",
    es: "Cargando",
    "zh-TW": "載入中",
    vi: "Đang tải"
  },
  [buildUiTextKey("저장 대기", "Queued")]: {
    ja: "保存待ち",
    "pt-BR": "Na fila",
    es: "En cola",
    "zh-TW": "排隊中",
    vi: "Đang chờ"
  },
  [buildUiTextKey("처리 중", "Processing")]: {
    ja: "処理中",
    "pt-BR": "Processando",
    es: "Procesando",
    "zh-TW": "處理中",
    vi: "Đang xử lý"
  },
  [buildUiTextKey("반영 추정", "Likely reflected")]: {
    ja: "反映済み推定",
    "pt-BR": "Provavelmente refletido",
    es: "Probablemente reflejado",
    "zh-TW": "推定已反映",
    vi: "Có vẻ đã phản ánh"
  },
  [buildUiTextKey("반영 완료", "Saved")]: {
    ja: "反映完了",
    "pt-BR": "Salvo",
    es: "Guardado",
    "zh-TW": "已保存",
    vi: "Đã lưu"
  },
  [buildUiTextKey("확인 필요", "Needs review")]: {
    ja: "確認が必要",
    "pt-BR": "Precisa de revisão",
    es: "Necesita revisión",
    "zh-TW": "需要確認",
    vi: "Cần kiểm tra"
  },
  [buildUiTextKey("새 요청 대기", "Waiting")]: {
    ja: "新しいリクエスト待ち",
    "pt-BR": "Aguardando novo pedido",
    es: "Esperando una nueva solicitud",
    "zh-TW": "等待新請求",
    vi: "Đang chờ yêu cầu mới"
  },
  [buildUiTextKey("가장 최근 mention job이 완료로 기록됐습니다.", "The latest mention job was recorded as completed.")]: {
    ja: "最新の mention ジョブが完了として記録されました。",
    "pt-BR": "O job de mention mais recente foi registrado como concluído.",
    es: "El job de mention más reciente quedó registrado como completado.",
    "zh-TW": "最新的 mention 工作已記錄為完成。",
    vi: "Tác vụ mention gần nhất đã được ghi nhận là hoàn tất."
  },
  [buildUiTextKey("최근 archive 반영 시각이 마지막 mention 요청보다 늦어서 반영된 것으로 추정합니다.", "A newer archive save time than the latest mention request suggests it has likely been reflected.")]: {
    ja: "最新の mention リクエストより後の archive 保存時刻があるため、反映済みと推定します。",
    "pt-BR": "Um horário de salvamento de archive mais recente que o último pedido de mention indica que ele provavelmente já foi refletido.",
    es: "Un guardado de archive más reciente que la última solicitud de mention indica que probablemente ya fue reflejado.",
    "zh-TW": "最近一次 archive 保存時間晚於最後一次 mention 請求，因此推定已反映。",
    vi: "Thời điểm lưu archive mới hơn yêu cầu mention gần nhất nên có thể xem là đã được phản ánh."
  },
  [buildUiTextKey("멘션 댓글을 작성한 Threads 계정이 현재 연결된 scrapbook 계정과 일치하지 않았습니다.", "The reply author did not match the Threads account connected to this scrapbook.")]: {
    ja: "返信を書いた Threads アカウントが、この scrapbook に接続されたアカウントと一致しませんでした。",
    "pt-BR": "O autor da resposta não corresponde à conta do Threads conectada a este scrapbook.",
    es: "El autor de la respuesta no coincide con la cuenta de Threads conectada a este scrapbook.",
    "zh-TW": "留下回覆的 Threads 帳號與此 scrapbook 目前連結的帳號不一致。",
    vi: "Tài khoản Threads đã viết reply không khớp với tài khoản đang kết nối với scrapbook này."
  },
  [buildUiTextKey("멘션 요청을 유효한 저장 요청으로 해석하지 못했습니다.", "The mention could not be parsed as a valid save request.")]: {
    ja: "mention リクエストを有効な保存リクエストとして解釈できませんでした。",
    "pt-BR": "Não foi possível interpretar o mention como um pedido de salvamento válido.",
    es: "No se pudo interpretar el mention como una solicitud de guardado válida.",
    "zh-TW": "無法將這次 mention 解析為有效的保存請求。",
    vi: "Không thể phân tích mention này thành một yêu cầu lưu hợp lệ."
  },
  [buildUiTextKey("저장 요청 댓글을 작성한 계정과 이 scrapbook에 로그인한 계정이 같은지 확인하세요.", "Check that the reply was written from the same account that is signed in to this scrapbook.")]: {
    ja: "保存リクエストの返信を書いたアカウントと、この scrapbook にログインしているアカウントが同じか確認してください。",
    "pt-BR": "Verifique se a resposta foi escrita pela mesma conta que está conectada a este scrapbook.",
    es: "Comprueba que la respuesta fue escrita desde la misma cuenta que inició sesión en este scrapbook.",
    "zh-TW": "請確認發送保存回覆的帳號與登入此 scrapbook 的帳號是否相同。",
    vi: "Hãy kiểm tra reply được viết từ cùng tài khoản đang đăng nhập vào scrapbook này."
  },
  [buildUiTextKey("잠시 후 자동 재시도가 잡혀 있을 수 있습니다. 지금 다시 확인 버튼으로 즉시 반영도 시도할 수 있습니다.", "An automatic retry may already be queued. You can also use Check now to force another fetch.")]: {
    ja: "しばらくすると自動再試行が予定されている場合があります。今すぐ確認で再取得を強制することもできます。",
    "pt-BR": "Talvez já exista uma nova tentativa automática na fila. Você também pode usar Verificar agora para forçar outra coleta.",
    es: "Es posible que ya haya un reintento automático en cola. También puedes usar Comprobar ahora para forzar otra captura.",
    "zh-TW": "稍後可能會自動重新嘗試。你也可以用立即確認強制再抓取一次。",
    vi: "Có thể đã có một lần thử lại tự động đang xếp hàng. Bạn cũng có thể dùng Kiểm tra ngay để ép lấy lại dữ liệu."
  },
  [buildUiTextKey("최근 저장 기준", "Based on recent save")]: {
    ja: "最近の保存基準",
    "pt-BR": "Com base no salvamento recente",
    es: "Según el guardado reciente",
    "zh-TW": "依最近保存判定",
    vi: "Dựa trên lần lưu gần nhất"
  },
  [buildUiTextKey("이미 반영됨", "Already reflected")]: {
    ja: "すでに反映済み",
    "pt-BR": "Já refletido",
    es: "Ya reflejado",
    "zh-TW": "已反映",
    vi: "Đã phản ánh"
  },
  [buildUiTextKey("저장 상태를 아직 불러오지 못했습니다.", "Save status has not loaded yet.")]: {
    ja: "保存状態はまだ読み込まれていません。",
    "pt-BR": "O estado do salvamento ainda não foi carregado.",
    es: "El estado de guardado aún no se ha cargado.",
    "zh-TW": "保存狀態尚未載入。",
    vi: "Trạng thái lưu vẫn chưa được tải."
  },
  [buildUiTextKey("최근 멘션 저장 요청이 대기열에 들어왔습니다. 보통 다음 수집 주기 안에 저장 항목으로 반영됩니다.", "The latest mention save request is queued. It usually appears in saved items within the next collection cycle.")]: {
    ja: "最新の mention 保存リクエストはキューに入りました。通常は次の収集周期内に保存済み項目へ反映されます。",
    "pt-BR": "O pedido de salvamento por mention mais recente entrou na fila. Normalmente ele aparece no item salvo no próximo ciclo de coleta.",
    es: "La solicitud de guardado por mention más reciente está en cola. Normalmente aparece en los elementos guardados en el siguiente ciclo de recopilación.",
    "zh-TW": "最近一次 mention 保存請求已進入佇列，通常會在下一輪收集內出現在已保存項目。",
    vi: "Yêu cầu lưu bằng mention gần nhất đã vào hàng đợi. Thường nó sẽ xuất hiện trong mục đã lưu ở chu kỳ thu thập kế tiếp."
  },
  [buildUiTextKey("최근 멘션 저장 요청을 처리 중입니다. 수집 완료 직후 저장 항목에 반영됩니다.", "The latest mention save request is being processed and should appear right after the next completed fetch.")]: {
    ja: "最新の mention 保存リクエストを処理中です。次の収集完了直後に保存済み項目へ反映されます。",
    "pt-BR": "O pedido de salvamento por mention mais recente está sendo processado e deve aparecer logo após a próxima coleta concluída.",
    es: "La solicitud de guardado por mention más reciente se está procesando y debería aparecer justo después de la próxima recopilación completada.",
    "zh-TW": "最近一次 mention 保存請求正在處理中，通常會在下一次收集完成後立即出現在已保存項目。",
    vi: "Yêu cầu lưu bằng mention gần nhất đang được xử lý và sẽ xuất hiện ngay sau lần thu thập hoàn tất tiếp theo trong mục đã lưu."
  },
  [buildUiTextKey("가장 최근 멘션 저장 요청은 최근 저장 시각 기준으로 반영된 것으로 보입니다. 아래에서 최근 멘션과 반영 시각을 다시 확인해 주세요.", "The latest mention save request looks reflected based on the recent save time. Review the latest mention and save timing below.")]: {
    ja: "最新の mention 保存リクエストは、最近の保存時刻から見て反映済みに見えます。下で最新 mention と反映時刻を確認してください。",
    "pt-BR": "O pedido de salvamento por mention mais recente parece refletido com base no horário do último salvamento. Revise abaixo o último mention e o horário de refletir.",
    es: "La solicitud de guardado por mention más reciente parece reflejada según la hora del último guardado. Revisa abajo el último mention y la hora de reflejo.",
    "zh-TW": "依最近保存時間判斷，最近一次 mention 保存請求看起來已反映。請在下方再次確認最新 mention 與反映時間。",
    vi: "Dựa trên thời điểm lưu gần nhất, yêu cầu lưu bằng mention mới nhất có vẻ đã được phản ánh. Hãy xem lại mention mới nhất và thời điểm phản ánh bên dưới."
  },
  [buildUiTextKey("가장 최근 멘션 저장 요청이 반영되었습니다. 필요하면 아래에서 최근 멘션과 반영 시각을 다시 확인할 수 있습니다.", "The latest mention save request has been reflected. You can review the latest mention and save timing below.")]: {
    ja: "最新の mention 保存リクエストは反映されました。必要なら下で最新 mention と反映時刻を確認できます。",
    "pt-BR": "O pedido de salvamento por mention mais recente foi refletido. Se quiser, revise abaixo o último mention e o horário de refletir.",
    es: "La solicitud de guardado por mention más reciente ya fue reflejada. Si quieres, revisa abajo el último mention y la hora de reflejo.",
    "zh-TW": "最近一次 mention 保存請求已反映。如有需要，可在下方再次確認最新 mention 與反映時間。",
    vi: "Yêu cầu lưu bằng mention gần nhất đã được phản ánh. Bạn có thể xem lại mention mới nhất và thời điểm phản ánh bên dưới nếu cần."
  },
  [buildUiTextKey("가장 최근 멘션 저장 요청이 자동 반영되지 않았습니다. 실패 이유를 확인한 뒤 즉시 다시 확인할 수 있습니다.", "The latest mention save request did not reflect automatically. Review the failure reason and check again right away.")]: {
    ja: "最新の mention 保存リクエストは自動では反映されませんでした。失敗理由を確認して、すぐに再確認できます。",
    "pt-BR": "O pedido de salvamento por mention mais recente não foi refletido automaticamente. Revise o motivo da falha e verifique de novo agora.",
    es: "La solicitud de guardado por mention más reciente no se reflejó automáticamente. Revisa el motivo del fallo y vuelve a comprobar ahora mismo.",
    "zh-TW": "最近一次 mention 保存請求未自動反映。請先確認失敗原因，再立即重新檢查。",
    vi: "Yêu cầu lưu bằng mention gần nhất không được phản ánh tự động. Hãy xem lý do thất bại rồi kiểm tra lại ngay."
  },
  [buildUiTextKey("새 멘션 저장 요청을 기다리는 중입니다. 요청이 들어오면 보통 다음 수집 주기 안에 저장 항목에 반영됩니다.", "Waiting for a new mention save request. Once it arrives, it usually reaches saved items within the next collection cycle.")]: {
    ja: "新しい mention 保存リクエストを待っています。届くと通常は次の収集周期内に保存済み項目へ反映されます。",
    "pt-BR": "Aguardando um novo pedido de salvamento por mention. Quando ele chegar, normalmente entra no conteúdo salvo no próximo ciclo de coleta.",
    es: "Esperando una nueva solicitud de guardado por mention. Cuando llegue, normalmente se refleja en los elementos guardados dentro del siguiente ciclo de recopilación.",
    "zh-TW": "正在等待新的 mention 保存請求。請求進來後通常會在下一輪收集內進入已保存項目。",
    vi: "Đang chờ một yêu cầu lưu bằng mention mới. Khi yêu cầu đến, nó thường đi vào mục đã lưu trong chu kỳ thu tập kế tiếp."
  },
  [buildUiTextKey("저장 상태", "Save status")]: {
    ja: "保存状態",
    "pt-BR": "Estado do salvamento",
    es: "Estado de guardado",
    "zh-TW": "保存狀態",
    vi: "Trạng thái lưu"
  },
  [buildUiTextKey("댓글 저장 상태", "Reply save status")]: {
    ja: "返信保存状態",
    "pt-BR": "Estado do salvamento por reply",
    es: "Estado del guardado por reply",
    "zh-TW": "回覆保存狀態",
    vi: "Trạng thái lưu bằng reply"
  },
  [buildUiTextKey("현재 상태", "Current state")]: {
    ja: "現在の状態",
    "pt-BR": "Estado atual",
    es: "Estado actual",
    "zh-TW": "目前狀態",
    vi: "Trạng thái hiện tại"
  },
  [buildUiTextKey("마지막 수집", "Last collection")]: {
    ja: "最終収集",
    "pt-BR": "Última coleta",
    es: "Última recopilación",
    "zh-TW": "最後收集",
    vi: "Lần thu thập gần nhất"
  },
  [buildUiTextKey("예상 반영", "Expected reflection")]: {
    ja: "反映予定",
    "pt-BR": "Previsão de refletir",
    es: "Reflejo esperado",
    "zh-TW": "預期反映",
    vi: "Dự kiến phản ánh"
  },
  [buildUiTextKey("새 댓글 확인 중...", "Checking replies...")]: {
    ja: "新しい返信を確認中...",
    "pt-BR": "Verificando replies...",
    es: "Comprobando replies...",
    "zh-TW": "正在確認新回覆...",
    vi: "Đang kiểm tra reply mới..."
  },
  [buildUiTextKey("새 댓글 확인", "Check replies")]: {
    ja: "新しい返信を確認",
    "pt-BR": "Verificar replies",
    es: "Comprobar replies",
    "zh-TW": "確認新回覆",
    vi: "Kiểm tra reply mới"
  },
  [buildUiTextKey("최근 저장 요청", "Latest request")]: {
    ja: "最新の保存リクエスト",
    "pt-BR": "Pedido mais recente",
    es: "Solicitud más reciente",
    "zh-TW": "最近一次保存請求",
    vi: "Yêu cầu gần nhất"
  },
  [buildUiTextKey("마지막 반영 시각", "Last reflected")]: {
    ja: "最終反映時刻",
    "pt-BR": "Último refletido",
    es: "Último reflejo",
    "zh-TW": "最後反映時間",
    vi: "Lần phản ánh gần nhất"
  },
  [buildUiTextKey("완료 판정 근거", "Completion basis")]: {
    ja: "完了判定根拠",
    "pt-BR": "Base da conclusão",
    es: "Base de la finalización",
    "zh-TW": "完成判定依據",
    vi: "Cơ sở hoàn tất"
  },
  [buildUiTextKey("실패 이유", "Failure reason")]: {
    ja: "失敗理由",
    "pt-BR": "Motivo da falha",
    es: "Motivo del fallo",
    "zh-TW": "失敗原因",
    vi: "Lý do thất bại"
  },
  [buildUiTextKey("다음 자동 재시도", "Next automatic retry")]: {
    ja: "次の自動再試行",
    "pt-BR": "Próxima tentativa automática",
    es: "Próximo reintento automático",
    "zh-TW": "下一次自動重試",
    vi: "Lần thử lại tự động tiếp theo"
  },
  [buildUiTextKey("재시도 안내", "Retry guidance")]: {
    ja: "再試行ガイド",
    "pt-BR": "Orientação de nova tentativa",
    es: "Guía para reintentar",
    "zh-TW": "重試指引",
    vi: "Hướng dẫn thử lại"
  },
  [buildUiTextKey("현재 메모", "Current note")]: {
    ja: "現在のメモ",
    "pt-BR": "Nota atual",
    es: "Nota actual",
    "zh-TW": "目前備註",
    vi: "Ghi chú hiện tại"
  },
  [buildUiTextKey("아직 최근 멘션 요청 기록이 없습니다. 새 저장 요청이 들어오면 여기에서 대기와 반영 상태를 확인할 수 있습니다.", "There is no recent mention request yet. Once a new save request arrives, its queue and reflection status will appear here.")]: {
    ja: "最近の mention リクエスト記録はまだありません。新しい保存リクエストが来ると、ここで待機と反映状態を確認できます。",
    "pt-BR": "Ainda não há pedido recente por mention. Quando um novo pedido chegar, o estado de fila e reflexão aparecerá aqui.",
    es: "Todavía no hay una solicitud reciente por mention. Cuando llegue una nueva solicitud, aquí aparecerán su estado en cola y de reflejo.",
    "zh-TW": "目前還沒有最近的 mention 請求紀錄。新的保存請求進來後，這裡會顯示排隊與反映狀態。",
    vi: "Hiện chưa có yêu cầu mention gần đây. Khi có yêu cầu lưu mới, trạng thái hàng đợi và phản ánh sẽ xuất hiện ở đây."
  },
  [buildUiTextKey("최근 멘션 보기", "Open latest mention")]: {
    ja: "最新のメンションを見る",
    "pt-BR": "Abrir mention mais recente",
    es: "Abrir el mention más reciente",
    "zh-TW": "查看最近 mention",
    vi: "Mở mention gần nhất"
  },
  [buildUiTextKey("내 태그", "My tags")]: {
    ja: "自分のタグ",
    "pt-BR": "Minhas tags",
    es: "Mis etiquetas",
    "zh-TW": "我的標籤",
    vi: "Thẻ của tôi"
  },
  [buildUiTextKey("눌러서 같은 태그 글만 다시 봅니다.", "Click a tag to filter the list.")]: {
    ja: "タグを押すと同じタグの記事だけを見直せます。",
    "pt-BR": "Clique em uma tag para filtrar a lista.",
    es: "Haz clic en una etiqueta para filtrar la lista.",
    "zh-TW": "點一下標籤即可只看相同標籤的內容。",
    vi: "Nhấn vào thẻ để lọc danh sách."
  },
  [buildUiTextKey("전체", "All")]: {
    ja: "すべて",
    "pt-BR": "Todos",
    es: "Todos",
    "zh-TW": "全部",
    vi: "Tất cả"
  },
  [buildUiTextKey("Plus가 필요합니다.", "Plus required.")]: {
    ja: "Plus が必要です。",
    "pt-BR": "É necessário ter Plus.",
    es: "Se necesita Plus.",
    "zh-TW": "需要 Plus。",
    vi: "Cần Plus."
  },
  [buildUiTextKey("watchlists는 Plus에서 열립니다. Plus 키를 연결하면 공개 계정 모니터링을 사용할 수 있습니다.", "Watchlists unlock on Plus. Activate Plus to monitor public Threads accounts.")]: {
    ja: "watchlists は Plus で開放されます。Plus キーを連携すると公開アカウント監視を使えます。",
    "pt-BR": "Watchlists são liberadas no Plus. Ative o Plus para monitorar contas públicas do Threads.",
    es: "Las watchlists se desbloquean con Plus. Activa Plus para vigilar cuentas públicas de Threads.",
    "zh-TW": "watchlists 需在 Plus 中解鎖。啟用 Plus 後即可監看公開 Threads 帳號。",
    vi: "Watchlists chỉ mở trong Plus. Hãy kích hoạt Plus để theo dõi các tài khoản Threads công khai."
  },
  [buildUiTextKey("insights는 Plus에서 열립니다. Plus 키를 연결하면 계정 성과 추적을 사용할 수 있습니다.", "Insights unlock on Plus. Activate Plus to track your Threads account performance.")]: {
    ja: "insights は Plus で開放されます。Plus キーを連携するとアカウント成果追跡を使えます。",
    "pt-BR": "Insights são liberados no Plus. Ative o Plus para acompanhar o desempenho da sua conta do Threads.",
    es: "Los insights se desbloquean con Plus. Activa Plus para seguir el rendimiento de tu cuenta de Threads.",
    "zh-TW": "insights 需在 Plus 中解鎖。啟用 Plus 後即可追蹤你的 Threads 帳號表現。",
    vi: "Insights chỉ mở trong Plus. Hãy kích hoạt Plus để theo dõi hiệu suất tài khoản Threads của bạn."
  },
  [buildUiTextKey("Threads 로그인 응답을 확인하는 중입니다...", "Confirming your Threads sign-in...")]: {
    ja: "Threads ログイン応答を確認中...",
    "pt-BR": "Confirmando seu login no Threads...",
    es: "Confirmando tu inicio de sesión en Threads...",
    "zh-TW": "正在確認你的 Threads 登入...",
    vi: "Đang xác nhận đăng nhập Threads của bạn..."
  },
  [buildUiTextKey("먼저 Plus 키를 입력하세요.", "Enter a Plus key first.")]: {
    ja: "先に Plus キーを入力してください。",
    "pt-BR": "Digite primeiro uma chave Plus.",
    es: "Introduce primero una clave Plus.",
    "zh-TW": "請先輸入 Plus 金鑰。",
    vi: "Hãy nhập khóa Plus trước."
  },
  [buildUiTextKey("Plus가 이 scrapbook 계정에 연결되었습니다.", "Plus is now linked to this scrapbook account.")]: {
    ja: "Plus がこの scrapbook アカウントに連携されました。",
    "pt-BR": "O Plus agora está vinculado a esta conta do scrapbook.",
    es: "Plus ahora está vinculado a esta cuenta del scrapbook.",
    "zh-TW": "Plus 已連結到此 scrapbook 帳號。",
    vi: "Plus hiện đã được liên kết với tài khoản scrapbook này."
  },
  [buildUiTextKey("Plus 연결에 실패했습니다.", "Could not activate Plus.")]: {
    ja: "Plus の連携に失敗しました。",
    "pt-BR": "Não foi possível ativar o Plus.",
    es: "No se pudo activar Plus.",
    "zh-TW": "無法啟用 Plus。",
    vi: "Không thể kích hoạt Plus."
  },
  [buildUiTextKey("이 scrapbook 계정에서 Plus 키 연결을 제거할까요?", "Remove the Plus key from this scrapbook account?")]: {
    ja: "この scrapbook アカウントから Plus キー連携を削除しますか？",
    "pt-BR": "Remover a chave Plus desta conta do scrapbook?",
    es: "¿Quitar la clave Plus de esta cuenta del scrapbook?",
    "zh-TW": "要從這個 scrapbook 帳號移除 Plus 金鑰連結嗎？",
    vi: "Gỡ liên kết khóa Plus khỏi tài khoản scrapbook này?"
  },
  [buildUiTextKey("Plus 키 연결이 제거되었습니다.", "The Plus key was removed from this scrapbook account.")]: {
    ja: "この scrapbook アカウントから Plus キー連携を削除しました。",
    "pt-BR": "A chave Plus foi removida desta conta do scrapbook.",
    es: "La clave Plus se eliminó de esta cuenta del scrapbook.",
    "zh-TW": "已從此 scrapbook 帳號移除 Plus 金鑰連結。",
    vi: "Đã gỡ khóa Plus khỏi tài khoản scrapbook này."
  },
  [buildUiTextKey("Plus 키 제거에 실패했습니다.", "Could not remove the Plus key.")]: {
    ja: "Plus キーの削除に失敗しました。",
    "pt-BR": "Não foi possível remover a chave Plus.",
    es: "No se pudo quitar la clave Plus.",
    "zh-TW": "無法移除 Plus 金鑰。",
    vi: "Không thể gỡ khóa Plus."
  },
  [buildUiTextKey("새 댓글 저장 상태를 확인했습니다. 현재 검색이나 태그 필터 때문에 일부 항목이 바로 안 보일 수 있습니다.", "Checked the latest reply saves. Some items may still be hidden by your current search or tag filters.")]: {
    ja: "最新の返信保存状態を確認しました。現在の検索やタグフィルタのため、一部項目はすぐには表示されない場合があります。",
    "pt-BR": "O estado mais recente dos salvamentos por reply foi verificado. Alguns itens ainda podem estar ocultos pelos filtros atuais de busca ou tags.",
    es: "Se comprobó el estado más reciente de los guardados por reply. Algunos elementos pueden seguir ocultos por tus filtros actuales de búsqueda o etiquetas.",
    "zh-TW": "已確認最新的 reply 保存狀態。由於目前的搜尋或標籤篩選，部分項目可能暫時不會顯示。",
    vi: "Đã kiểm tra trạng thái lưu bằng reply mới nhất. Một số mục có thể vẫn bị ẩn bởi bộ lọc tìm kiếm hoặc thẻ hiện tại."
  },
  [buildUiTextKey("새 댓글 저장 상태를 다시 확인했습니다.", "Checked the latest reply save status.")]: {
    ja: "最新の返信保存状態を再確認しました。",
    "pt-BR": "O estado mais recente do salvamento por reply foi verificado novamente.",
    es: "Se volvió a comprobar el estado más reciente del guardado por reply.",
    "zh-TW": "已重新確認最新的 reply 保存狀態。",
    vi: "Đã kiểm tra lại trạng thái lưu bằng reply mới nhất."
  },
  [buildUiTextKey("저장 상태를 다시 확인할 수 없습니다.", "Could not refresh save status.")]: {
    ja: "保存状態を再確認できませんでした。",
    "pt-BR": "Não foi possível atualizar o estado do salvamento.",
    es: "No se pudo actualizar el estado de guardado.",
    "zh-TW": "無法重新整理保存狀態。",
    vi: "Không thể làm mới trạng thái lưu."
  }
};

function uiText(
  ko: string,
  en: string,
  extras?: SecondaryLocaleCopy,
  params?: Record<string, string | number>
): string {
  const key = buildUiTextKey(ko, en);
  const locale = currentLocale as SecondaryWebLocale;
  const template =
    currentLocale === "ko"
      ? ko
      : currentLocale === "en"
        ? en
        : extras?.[locale] ?? staticUiTextOverrides[key]?.[locale] ?? en;

  return formatMessage(template, params);
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
    sourceMention: "저장됨",
    sourceCloud: "클라우드 저장",
    searchRunNow: "지금 실행",
    searchStatusNew: "신규",
    searchStatusArchived: "보관됨",
    searchStatusDismissed: "숨김"
  },
  en: {
    requestFailed: "Request failed ({status}).",
    sourceMention: "Saved",
    sourceCloud: "Cloud save",
    searchRunNow: "Run now",
    searchStatusNew: "New",
    searchStatusArchived: "Archived",
    searchStatusDismissed: "Dismissed"
  },
  ja: {
    requestFailed: "リクエストに失敗しました ({status})。",
    sourceMention: "保存済み",
    sourceCloud: "クラウド保存",
    searchRunNow: "今すぐ実行",
    searchStatusNew: "新規",
    searchStatusArchived: "保存済み",
    searchStatusDismissed: "非表示"
  },
  "pt-BR": {
    requestFailed: "A solicitação falhou ({status}).",
    sourceMention: "Salvos",
    sourceCloud: "Salvamento na nuvem",
    searchRunNow: "Executar agora",
    searchStatusNew: "Novo",
    searchStatusArchived: "Arquivado",
    searchStatusDismissed: "Ocultado"
  },
  es: {
    requestFailed: "La solicitud falló ({status}).",
    sourceMention: "Guardado",
    sourceCloud: "Guardado en la nube",
    searchRunNow: "Ejecutar ahora",
    searchStatusNew: "Nuevo",
    searchStatusArchived: "Archivado",
    searchStatusDismissed: "Oculto"
  },
  "zh-TW": {
    requestFailed: "請求失敗 ({status})。",
    sourceMention: "珍藏",
    sourceCloud: "雲端儲存",
    searchRunNow: "立即執行",
    searchStatusNew: "新增",
    searchStatusArchived: "已封存",
    searchStatusDismissed: "已隱藏"
  },
  vi: {
    requestFailed: "Yêu cầu thất bại ({status}).",
    sourceMention: "Đã lưu",
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

function getPlanTierLabel(tier: ScrapbookPlanState["tier"]): string {
  if (tier === "plus") {
    return "Plus";
  }
  return uiText("Free", "Free", {
    ja: "無料",
    "pt-BR": "Free",
    es: "Free",
    "zh-TW": "Free",
    vi: "Free"
  });
}

function buildPlanUsageSummary(plan: ScrapbookPlanState, folderCount: number): string {
  return uiText(
    "저장 {saved}/{limit} · 폴더 {folders}/{folderLimit}",
    "Saved {saved}/{limit} · Folders {folders}/{folderLimit}",
    {
      ja: "保存 {saved}/{limit} ・フォルダ {folders}/{folderLimit}",
      "pt-BR": "Salvos {saved}/{limit} · Pastas {folders}/{folderLimit}",
      es: "Guardados {saved}/{limit} · Carpetas {folders}/{folderLimit}",
      "zh-TW": "保存 {saved}/{limit} · 資料夾 {folders}/{folderLimit}",
      vi: "Đã lưu {saved}/{limit} · Thư mục {folders}/{folderLimit}"
    },
    {
      saved: formatPlainNumber(plan.archiveCount),
      limit: formatPlainNumber(plan.archiveLimit),
      folders: formatPlainNumber(folderCount),
      folderLimit: formatPlainNumber(plan.folderLimit)
    }
  );
}

function ensureFolderLimitAvailable(): boolean {
  const folderLimit = getCurrentFolderLimit();
  const folderCount = loadFolders().length;
  if (folderCount < folderLimit) {
    return true;
  }

  setStatus(
    uiText(
      "{folderLimit}개까지 폴더를 만들 수 있습니다. Plus로 올리면 50개까지 확장됩니다.",
      "You can create up to {folderLimit} folders on this plan. Upgrade to Plus to raise it to 50.",
      {
        ja: "このプランではフォルダを最大{folderLimit}個まで作成できます。Plus にすると 50 個まで拡張されます。",
        "pt-BR": "Neste plano, você pode criar até {folderLimit} pastas. Faça upgrade para o Plus para aumentar para 50.",
        es: "En este plan puedes crear hasta {folderLimit} carpetas. Cámbiate a Plus para ampliarlo a 50.",
        "zh-TW": "此方案最多可建立 {folderLimit} 個資料夾。升級 Plus 後可擴充到 50 個。",
        vi: "Gói này cho phép tạo tối đa {folderLimit} thư mục. Nâng lên Plus để tăng lên 50."
      },
      { folderLimit }
    ),
    true
  );
  return false;
}

function renderPlanPanel(): void {
  const plan = getCurrentPlanState();
  const isAuthenticated = Boolean(latestState?.authenticated && latestState?.user);
  const folderCount = loadFolders().length;
  const hideExpandedPlan = isAuthenticated && plan.tier === "plus" && plan.plusStatus === "active";

  planSection?.classList.toggle("hidden", hideExpandedPlan);
  if (planEyebrow) {
    planEyebrow.textContent = uiText("저장 한도", "Storage", {
      ja: "保存上限",
      "pt-BR": "Limites",
      es: "Límites",
      "zh-TW": "保存上限",
      vi: "Giới hạn"
    });
  }

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
        "Plus가 연결되면 저장글 1,000개와 폴더 50개까지 사용할 수 있습니다.",
        "Plus raises your limits to 1,000 saved posts and 50 folders."
      );
    } else {
      planCopy.textContent = uiText(
        "Free는 저장글 100개와 폴더 5개까지 사용할 수 있습니다.",
        "Free includes up to 100 saved posts and 5 folders."
      );
    }
  }
  if (planTierBadge) {
    planTierBadge.textContent = getPlanTierLabel(plan.tier);
    planTierBadge.classList.toggle("is-plus", plan.tier === "plus");
  }
  if (planArchiveLabel) {
    planArchiveLabel.textContent = uiText("저장된 글", "Saved posts", {
      ja: "保存した投稿",
      "pt-BR": "Posts salvos",
      es: "Publicaciones guardadas",
      "zh-TW": "已保存貼文",
      vi: "Bài đã lưu"
    });
  }
  if (planArchiveUsage) {
    planArchiveUsage.textContent = `${plan.archiveCount} / ${plan.archiveLimit}`;
  }
  if (planFolderLabel) {
    planFolderLabel.textContent = uiText("폴더", "Folders", {
      ja: "フォルダ",
      "pt-BR": "Pastas",
      es: "Carpetas",
      "zh-TW": "資料夾",
      vi: "Thư mục"
    });
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
            "Plus 연결됨. 만료일: {date}. 같은 키를 extension에도 사용할 수 있습니다.",
            "Plus is connected. Expires on {date}. The same key also works in the extension.",
            {
              ja: "Plus が接続されています。有効期限: {date}。同じキーを extension でも使えます。",
              "pt-BR": "O Plus está conectado. Expira em {date}. A mesma chave também funciona na extensão.",
              es: "Plus está conectado. Vence el {date}. La misma clave también funciona en la extensión.",
              "zh-TW": "Plus 已連線。到期日：{date}。同一組金鑰也可在擴充功能中使用。",
              vi: "Plus đã được kết nối. Hết hạn vào {date}. Cùng một khóa cũng dùng được trong tiện ích mở rộng."
            },
            { date: formatDate(plan.plusExpiresAt) }
          )
        : uiText(
            "Plus 연결됨. 같은 키를 extension에도 사용할 수 있습니다.",
            "Plus is connected. The same key also works in the extension."
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
  return normalizeBotHandleValue(value);
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
  archivesSelectAll?.setAttribute(
    "aria-label",
    uiText("전체 선택", "Select all", {
      ja: "すべて選択",
      "pt-BR": "Selecionar tudo",
      es: "Seleccionar todo",
      "zh-TW": "全部選取",
      vi: "Chọn tất cả"
    })
  );

  applyTranslations(msg);
  if (archivesMoveSelected) {
    archivesMoveSelected.textContent = uiText("이동", "Move");
  }
  if (archivesDeleteSelected) {
    archivesDeleteSelected.textContent = uiText("삭제", "Delete");
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
    "[data-i18n='scrapbookHowStep2Desc']",
    formatMessage(t("scrapbookHowStep2Desc"), { handleInline })
  );
  setElementText(
    authPanelCopyNote,
    uiText(
      "Threads 계정을 연결하면 수집된 글이 이곳에 모입니다. 연결이 끝나면 보통 바로 표시됩니다.",
      "Connect your Threads account and the collected posts will gather here. Once connected, they usually appear right away.",
      {
        ja: "Threads アカウントを接続すると、収集した投稿がここに集まります。接続が終わると通常はすぐ表示されます。",
        "pt-BR": "Conecte sua conta Threads e os posts coletados aparecerão aqui. Depois da conexão, eles normalmente surgem quase na hora.",
        es: "Conecta tu cuenta de Threads y las publicaciones recopiladas aparecerán aquí. Una vez conectada, normalmente se muestran enseguida.",
        "zh-TW": "連接 Threads 帳號後，收集到的貼文會顯示在這裡。連線完成後通常會立即出現。",
        vi: "Kết nối tài khoản Threads và các bài đã thu thập sẽ hiện ở đây. Sau khi kết nối xong, chúng thường xuất hiện gần như ngay lập tức."
      }
    )
  );
  setElementText(
    archivesLoadingLabel,
    uiText("게시판 불러오는 중", "Loading your board", {
      ja: "ボードを読み込み中",
      "pt-BR": "Carregando seu painel",
      es: "Cargando tu panel",
      "zh-TW": "正在載入看板",
      vi: "Đang tải bảng của bạn"
    })
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
  msg = applyBotHandlePlaceholder(scrapbookMessages[currentLocale], latestConfig?.botHandle, DEFAULT_BOT_HANDLE);
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
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init
  });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.error || formatMessage(runtimeLabel().requestFailed, { status: response.status }));
  }

  return payload as T;
}

async function requestBlob(url: string, init?: RequestInit): Promise<{ blob: Blob; filename: string | null }> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init
  });
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

function formatPlainNumber(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return t("scrapbookNumberNone");
  }

  return new Intl.NumberFormat(currentLocale, {
    maximumFractionDigits: 0
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

function getPendingConnectButtonLabel(): string {
  return uiText("연결 확인 중...", "Confirming connection...", {
    ja: "ログインを確認中...",
    "pt-BR": "Confirmando conexão...",
    es: "Confirmando conexión...",
    "zh-TW": "正在確認連線...",
    vi: "Đang xác nhận kết nối..."
  });
}

function getDisconnectPlusLabel(): string {
  return uiText("키 연결 해제", "Disconnect Plus", {
    ja: "Plus 接続を解除",
    "pt-BR": "Desconectar Plus",
    es: "Desconectar Plus",
    "zh-TW": "解除 Plus 連線",
    vi: "Ngắt kết nối Plus"
  });
}

function setStatus(message: string, isError = false): void {
  if (!pageStatus) {
    return;
  }

  if (!message.trim()) {
    pageStatus.textContent = "";
    pageStatus.classList.add("hidden");
    pageStatus.classList.remove("is-error");
    pageStatus.classList.remove("is-loading");
    pageStatus.removeAttribute("aria-live");
    pageStatus.removeAttribute("role");
    return;
  }

  pageStatus.textContent = message;
  pageStatus.classList.remove("hidden");
  pageStatus.classList.toggle("is-error", isError);
  pageStatus.classList.remove("is-loading");
  pageStatus.setAttribute("aria-live", isError ? "assertive" : "polite");
  pageStatus.setAttribute("role", isError ? "alert" : "status");
}

function syncArchivesLoadingPanel(show: boolean): void {
  archivesLoadingEl?.classList.toggle("hidden", !show);
}

function setArchivesHydrating(isLoading: boolean): void {
  if (archivesHydrating === isLoading) {
    return;
  }

  archivesHydrating = isLoading;
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    return;
  }

  syncArchivesLoadingPanel(isLoading);
  if (isLoading) {
    archivesEmptyEl?.classList.add("hidden");
    archivesBoard?.classList.add("hidden");
    archivesFilterBar?.classList.add("hidden");
    archivesPaginationEl?.classList.add("hidden");
  }
}

function resolvePendingConnectedStatus(state: BotSessionState | null): void {
  if (!pendingConnectedStatus) {
    return;
  }

  if (state?.authenticated && state.user) {
    pendingConnectedStatus = false;
    setStatus("");
  }
}

function finalizePendingConnectedStatus(): void {
  if (!pendingConnectedStatus) {
    return;
  }

  pendingConnectedStatus = false;
  if (pageStatus?.classList.contains("is-error") && pageStatus.textContent?.trim()) {
    return;
  }

  setStatus(
    uiText(
      "Threads 로그인 응답은 도착했지만 세션을 확인하지 못했습니다. 잠시 후 새로고침해 다시 확인해 주세요.",
      "The Threads sign-in response arrived, but the session could not be confirmed. Refresh and check again in a moment."
    ),
    true
  );
}

function setElementText(element: HTMLElement | null, value: string): void {
  if (element) {
    element.textContent = value;
  }
}

function renderSaveStatus(state: BotSessionState | null): void {
  const isAuthenticated = Boolean(state?.authenticated && state.user);
  const plan = getCurrentPlanState();
  const folderCount = loadFolders().length;
  saveStatusPanel?.classList.toggle("hidden", !isAuthenticated);
  saveStatusPanel?.classList.toggle("is-connected", isAuthenticated);

  setElementText(
    authPanelCopyNote,
    uiText(
      "Threads 계정을 연결하면 수집된 글이 이곳에 모입니다. 연결이 끝나면 보통 바로 표시됩니다.",
      "Connect your Threads account and the collected posts will gather here. Once connected, they usually appear right away.",
      {
        ja: "Threads アカウントを接続すると、収集した投稿がここに集まります。接続が終わると通常はすぐ表示されます。",
        "pt-BR": "Conecte sua conta Threads e os posts coletados aparecerão aqui. Depois da conexão, eles normalmente surgem quase na hora.",
        es: "Conecta tu cuenta de Threads y las publicaciones recopiladas aparecerán aquí. Una vez conectada, normalmente se muestran enseguida.",
        "zh-TW": "連接 Threads 帳號後，收集到的貼文會顯示在這裡。連線完成後通常會立即出現。",
        vi: "Kết nối tài khoản Threads và các bài đã thu thập sẽ hiện ở đây. Sau khi kết nối xong, chúng thường xuất hiện gần như ngay lập tức."
      }
    )
  );

  if (sessionPlanClear) {
    sessionPlanClear.textContent = getDisconnectPlusLabel();
    sessionPlanClear.classList.toggle("hidden", !(isAuthenticated && plan.tier === "plus" && plan.plusStatus === "active"));
    sessionPlanClear.disabled = !isAuthenticated;
  }

  if (topbarPlanBadge) {
    const showPlus = isAuthenticated && plan.tier === "plus";
    topbarPlanBadge.textContent = showPlus ? getPlanTierLabel("plus") : "";
    topbarPlanBadge.classList.toggle("hidden", !showPlus);
  }

  if (!isAuthenticated) {
    return;
  }

  const saveStatus = state?.saveStatus ?? null;
  const latestSavedAt = saveStatus?.latestSavedAt ?? null;
  const hasCollectedItems = Boolean(latestSavedAt);
  if (saveStatusConnectionBadge) {
    saveStatusConnectionBadge.textContent = uiText("연결됨", "Connected");
    saveStatusConnectionBadge.classList.add("is-connected");
    saveStatusConnectionBadge.classList.remove("is-loading");
  }
  setElementText(
    saveStatusConnectionCopy,
    hasCollectedItems
      ? uiText(
          "연결이 완료됐습니다. 수집된 글은 이곳에 표시됩니다.",
          "Connection is complete. The collected posts appear here."
        )
      : uiText(
          "연결이 완료됐습니다. 수집된 글이 들어오면 이곳에 표시됩니다.",
          "Connection is complete. New collected posts will appear here."
        )
  );
  setElementText(
    saveStatusLastLabel,
    hasCollectedItems ? uiText("마지막 수집", "Last collected") : uiText("수집 상태", "Collection status")
  );
  setElementText(
    saveStatusLastValue,
    hasCollectedItems ? formatDate(latestSavedAt) : uiText("첫 수집 대기", "Waiting for the first collection")
  );
  saveStatusPlan?.classList.remove("hidden");
  setElementText(saveStatusPlanSummary, buildPlanUsageSummary(plan, folderCount));
  if (saveStatusPlanClear) {
    saveStatusPlanClear.textContent = getDisconnectPlusLabel();
    saveStatusPlanClear.classList.toggle("hidden", !(plan.tier === "plus" && plan.plusStatus === "active"));
    saveStatusPlanClear.disabled = !isAuthenticated;
  }
}

function setSessionMenuOpen(open: boolean): void {
  const shouldOpen = open && Boolean(latestState?.authenticated && latestState.user);
  sessionMenuOpen = shouldOpen;
  sessionPanel?.classList.toggle("is-open", shouldOpen);
  sessionMenu?.classList.toggle("hidden", !shouldOpen);
  sessionTrigger?.setAttribute("aria-expanded", String(shouldOpen));
}

function isWorkspaceMobileLayout(): boolean {
  return window.matchMedia("(max-width: 720px)").matches;
}

function isWorkspaceAuthenticated(): boolean {
  return Boolean(latestState?.authenticated && latestState.user);
}

function setWorkspaceTabsOpen(open: boolean): void {
  if (!workspaceTabs || !workspaceTabTrigger || !workspaceTabOverlay) {
    return;
  }

  if (isWorkspaceMobileLayout()) {
    workspaceTabs.classList.remove("hidden");
    workspaceTabs.classList.remove("is-open");
    workspaceTabOverlay.classList.add("hidden");
    workspaceTabTrigger.setAttribute("aria-expanded", "true");
    workspaceTabTrigger.setAttribute("aria-label", t("scrapbookWorkspaceAriaLabel"));
    return;
  }

  const shouldOpen = open && isWorkspaceMobileLayout() && isWorkspaceAuthenticated();
  workspaceTabs.classList.toggle("is-open", shouldOpen);
  workspaceTabs.classList.toggle("hidden", !shouldOpen);
  workspaceTabOverlay.classList.toggle("hidden", !shouldOpen);
  workspaceTabTrigger.setAttribute("aria-expanded", String(shouldOpen));
  workspaceTabTrigger.setAttribute("aria-label", t("scrapbookWorkspaceAriaLabel"));
}

function syncWorkspaceTabsVisibility(isAuthenticated: boolean): void {
  if (!workspaceTabs || !workspaceTabTrigger || !workspaceTabOverlay) {
    return;
  }

  workspaceTabTrigger.classList.toggle("hidden", !isAuthenticated);
  if (workspaceTabCurrent) {
    const activeTabLabel = Array.from(workspaceTabButtons).find((button) =>
      button.classList.contains("is-active")
    )?.textContent;
    if (activeTabLabel) {
      workspaceTabCurrent.textContent = activeTabLabel;
    }
  }

  if (isAuthenticated && isWorkspaceMobileLayout()) {
    workspaceTabs.classList.remove("is-open");
    workspaceTabs.classList.remove("hidden");
    workspaceTabOverlay.classList.add("hidden");
    workspaceTabTrigger.setAttribute("aria-expanded", "true");
    workspaceTabTrigger.setAttribute("aria-label", t("scrapbookWorkspaceAriaLabel"));
    return;
  }

  workspaceTabs.classList.toggle("hidden", !isAuthenticated);
  workspaceTabs.classList.remove("is-open");
  workspaceTabOverlay.classList.add("hidden");
  workspaceTabTrigger.setAttribute("aria-expanded", "false");
  workspaceTabTrigger.setAttribute("aria-label", t("scrapbookWorkspaceAriaLabel"));
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
  const isLoading = connectButtonsBusy || pendingConnectedStatus;
  const disabled = isLoading || !connectButtonsAvailable;
  for (const button of connectButtons) {
    button.classList.toggle("hidden", isAuthenticated);
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
    button.setAttribute("aria-busy", String(isLoading));
    button.classList.toggle("is-loading", isLoading);
    button.textContent = pendingConnectedStatus
      ? getPendingConnectButtonLabel()
      : connectButtonsBusy
        ? t("scrapbookConnectBusy")
        : t("scrapbookConnectButton");
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

function buildArchiveTitle(item: BotArchiveView): string {
  const explicitTitle = item.title?.trim();
  if (explicitTitle) {
    return explicitTitle;
  }

  if (item.targetAuthorHandle) {
    return t("scrapbookArchiveFallbackAuthorPost", { handle: item.targetAuthorHandle });
  }

  return t("scrapbookArchiveFallbackSavedItem");
}

function normalizeArchiveHandle(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/^@+/, "").toLowerCase();
}

function buildArchiveAuthorMeta(item: BotArchiveView): string {
  const displayHandle = normalizeArchiveHandle(item.targetAuthorHandle);
  const displayName = item.targetAuthorDisplayName?.trim() ?? "";
  if (!displayName && !displayHandle) {
    return "";
  }

  if (!displayName) {
    return `@${displayHandle}`;
  }

  if (!displayHandle || displayName.toLowerCase() === displayHandle.toLowerCase()) {
    return displayName;
  }

  return `${displayName} · @${displayHandle}`;
}

function buildArchiveRowMeta(item: BotArchiveView): string {
  const metaParts: string[] = [];
  const authorMeta = buildArchiveAuthorMeta(item);
  if (authorMeta) {
    metaParts.push(authorMeta);
  }

  const tagsLabel = buildArchiveTagsLabel(item);
  if (tagsLabel) {
    metaParts.push(tagsLabel);
  }

  return metaParts.join(" · ");
}

const ARCHIVE_PARSE_NOISE_PATTERNS: RegExp[] = [
  /log in or sign up for threads/i,
  /log in to continue/i,
  /sign in to continue/i,
  /continue with instagram/i,
  /threads terms?/i,
  /privacy policy/i,
  /cookie policy/i,
  /report a problem/i,
  /로그인하여 더 많은 답글을 확인해보세요/u,
  /Threads에 로그인 또는 가입하기/u,
  /Threads에 가입하여 .*$/u,
  /Threads에 가입해 .*$/u,
  /Threads 약관/u,
  /개인정보처리방침/u,
  /쿠키 정책/u,
  /문제 신고/u
];

function isLikelyArchiveParseIssue(item: BotArchiveView): boolean {
  const haystack = [item.targetText, item.markdownContent, item.noteText ?? ""].join("\n");
  return ARCHIVE_PARSE_NOISE_PATTERNS.some((pattern) => pattern.test(haystack));
}

function buildArchiveTagsLabel(item: BotArchiveView): string {
  return item.tags.map((tag) => `#${tag}`).join(" ");
}

function formatArchiveTagEditorValue(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(" ");
}

function parseArchiveTagEditorValue(value: string): string[] {
  const hashtagMatches = value.match(/#[\p{L}\p{N}_-]+/gu);
  const rawTags =
    hashtagMatches && hashtagMatches.length > 0
      ? hashtagMatches.map((match) => match.slice(1))
      : value.split(/[\s,]+/u);

  const normalized = new Set<string>();
  for (const rawTag of rawTags) {
    const tag = rawTag.trim().replace(/^#+/u, "").toLowerCase();
    if (tag) {
      normalized.add(tag);
    }
    if (normalized.size >= 3) {
      break;
    }
  }

  return [...normalized];
}

function isArchiveInlineEditActive(item: BotArchiveView, mode?: ArchiveInlineEditMode): boolean {
  return Boolean(
    activeArchiveInlineEdit &&
      activeArchiveInlineEdit.archiveId === item.id &&
      (mode ? activeArchiveInlineEdit.mode === mode : true)
  );
}

function isArchiveCompactLayout(): boolean {
  return window.matchMedia("(max-width: 720px)").matches;
}

function syncArchiveSortControls(): void {
  archivesSortHeader?.setAttribute("aria-sort", archiveSortOrder === "asc" ? "ascending" : "descending");
  archivesSortToggle?.setAttribute("aria-pressed", String(archiveSortOrder === "asc"));
  if (archivesSortArrow) {
    archivesSortArrow.textContent = archiveSortOrder === "asc" ? "↑" : "↓";
  }
}

function sortArchivesByDate(items: BotArchiveView[]): BotArchiveView[] {
  const direction = archiveSortOrder === "asc" ? 1 : -1;
  return [...items].sort((left, right) => {
    const leftArchived = Date.parse(left.archivedAt) || 0;
    const rightArchived = Date.parse(right.archivedAt) || 0;
    if (leftArchived !== rightArchived) {
      return (leftArchived - rightArchived) * direction;
    }

    const leftUpdated = Date.parse(left.updatedAt) || 0;
    const rightUpdated = Date.parse(right.updatedAt) || 0;
    if (leftUpdated !== rightUpdated) {
      return (leftUpdated - rightUpdated) * direction;
    }

    return left.id.localeCompare(right.id) * direction;
  });
}

function toggleArchiveSortOrder(): void {
  archiveSortOrder = archiveSortOrder === "asc" ? "desc" : "asc";
  archivesPage = 1;
  syncArchiveSortControls();
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
}

function syncArchiveFilterControls(): void {
  const compact = isArchiveCompactLayout();
  const searchOpen = !compact || archivesSearchExpanded;
  const tagOpen = !compact || archivesTagExpanded;
  const hasTagContent = Boolean(archivesTagPanel?.innerHTML.trim());

  archivesFilterBar?.classList.toggle("is-search-open", compact && searchOpen);
  archivesFilterBar?.classList.toggle("is-tag-open", compact && tagOpen);

  if (archivesSearchToggle) {
    archivesSearchToggle.classList.toggle("hidden", !compact);
    archivesSearchToggle.classList.toggle("is-active", Boolean(archiveSearchQuery.trim()) || (compact && archivesSearchExpanded));
    archivesSearchToggle.setAttribute("aria-expanded", String(searchOpen));
  }

  if (archivesSearchWrap) {
    archivesSearchWrap.classList.toggle("hidden", compact && !searchOpen);
    archivesSearchWrap.classList.toggle("is-open", searchOpen);
  }

  if (archivesTagToggle) {
    archivesTagToggle.classList.toggle("hidden", !compact);
    archivesTagToggle.classList.toggle("is-active", Boolean(activeArchiveTag));
    archivesTagToggle.textContent = uiText("#태그", "#Tags");
    archivesTagToggle.setAttribute("aria-expanded", String(tagOpen));
  }

  if (archivesTagPanel) {
    archivesTagPanel.classList.toggle("hidden", !hasTagContent || (compact && !tagOpen));
    archivesTagPanel.classList.toggle("is-open", tagOpen);
  }
}

function normalizeArchiveSearchValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/https?:\/\//g, " ")
    .replace(/[@#._:/\\-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildArchiveSearchText(item: BotArchiveView, activeBotHandle: string): string {
  return [
    buildArchiveTitle(item),
    buildArchiveTagsLabel(item),
    item.originLabel,
    item.targetText,
    item.markdownContent,
    item.targetAuthorHandle ?? "",
    item.targetAuthorDisplayName ?? "",
    item.noteText ?? "",
    item.targetUrl,
    ...item.tags,
    item.mentionUrl ?? "",
    item.mentionAuthorHandle ?? "",
    item.mentionAuthorDisplayName ?? "",
    ...item.authorReplies.flatMap((reply) => [reply.author, reply.text, reply.canonicalUrl]),
    activeBotHandle
  ].join("\n");
}

function hasActiveArchiveFilters(): boolean {
  return Boolean(archiveSearchQuery.trim() || activeArchiveTag || activeFolderId);
}

function filterArchivesByFolder(items: BotArchiveView[]): BotArchiveView[] {
  if (!activeFolderId) {
    return items;
  }

  const folderMap = loadFolderMap();
  return items.filter((item) => folderMap[item.id] === activeFolderId);
}

function filterArchivesBySearchQuery(items: BotArchiveView[]): BotArchiveView[] {
  if (!archiveSearchQuery.trim()) {
    return items;
  }

  const rawQuery = archiveSearchQuery.trim().toLowerCase();
  const normalizedQuery = normalizeArchiveSearchValue(archiveSearchQuery);
  const queryTokens = normalizedQuery.split(/\s+/u).filter(Boolean);
  const activeBotHandle = (latestConfig?.botHandle || latestState?.botHandle || "").toLowerCase();
  return items.filter((item) => {
    const searchable = buildArchiveSearchText(item, activeBotHandle);
    const searchableRaw = searchable.toLowerCase();
    if (searchableRaw.includes(rawQuery)) {
      return true;
    }

    if (queryTokens.length === 0) {
      return false;
    }

    const searchableNormalized = normalizeArchiveSearchValue(searchable);
    return queryTokens.every((token) => searchableNormalized.includes(token));
  });
}

type ArchiveTagSummary = {
  tag: string;
  count: number;
};

function summarizeArchiveTags(items: BotArchiveView[]): ArchiveTagSummary[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const uniqueTags = new Set(item.tags);
    for (const tag of uniqueTags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.tag.localeCompare(right.tag);
    });
}

function renderArchiveTagPanel(items: BotArchiveView[], isAuthenticated: boolean): void {
  if (!archivesTagPanel) {
    return;
  }

  if (!isAuthenticated || items.length === 0) {
    activeArchiveTag = null;
    archivesTagPanel.innerHTML = "";
    archivesTagPanel.classList.add("hidden");
    return;
  }

  const scopedItems = filterArchivesBySearchQuery(filterArchivesByFolder(items));
  const tags = summarizeArchiveTags(scopedItems);

  if (activeArchiveTag && !tags.some((entry) => entry.tag === activeArchiveTag)) {
    activeArchiveTag = null;
  }

  if (tags.length === 0) {
    archivesTagPanel.innerHTML = "";
    archivesTagPanel.classList.add("hidden");
    archivesTagExpanded = false;
    syncArchiveFilterControls();
    return;
  }

  const allLabel = uiText("전체", "All");

  archivesTagPanel.classList.remove("hidden");
  archivesTagPanel.innerHTML = `
    <div class="archives-tag-strip">
      <button class="archive-tag-pill ${activeArchiveTag === null ? "is-active" : ""}" type="button" data-tag-filter="" aria-pressed="${String(activeArchiveTag === null)}">
        ${escapeHtml(allLabel)}
      </button>
      ${tags
        .map(
          (entry) => `
            <button
              class="archive-tag-pill ${activeArchiveTag === entry.tag ? "is-active" : ""}"
              type="button"
              data-tag-filter="${escapeHtml(entry.tag)}"
              aria-pressed="${String(activeArchiveTag === entry.tag)}"
            >
              <span>#${escapeHtml(entry.tag)}</span>
              <span class="archive-tag-count">${escapeHtml(String(entry.count))}</span>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  for (const button of archivesTagPanel.querySelectorAll<HTMLButtonElement>("[data-tag-filter]")) {
    button.addEventListener("click", () => {
      activeArchiveTag = button.dataset.tagFilter?.trim() || null;
      archivesPage = 1;
      if (latestState) {
        renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
      }
    });
  }

  syncArchiveFilterControls();
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

  const total = item.authorReplies.length;
  return `
    <section class="archive-replies">
      <div class="archive-replies-head">
        <h4>${escapeHtml(t("scrapbookReplyHeader", { count: item.authorReplies.length }))}</h4>
      </div>
      <div class="archive-replies-list">
        ${item.authorReplies
          .map(
            (reply, index) => `
              ${index > 0 ? `<div class="archive-reply-divider" aria-hidden="true"></div>` : ""}
              <article class="archive-reply-card">
                <div class="archive-reply-meta">
                  <span class="archive-chip">${escapeHtml(t("scrapbookReplyLabel", { index: `${index + 1}/${total}` }))}</span>
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
  if (!archivesToolbar || !archivesToolbarMeta || !archivesSelectAll || !archivesExportAll) {
    return;
  }

  const hasItems = isAuthenticated && items.length > 0;
  const selectedCount = hasItems ? items.filter((item) => selectedArchiveIds.has(item.id)).length : 0;
  const showToolbar = hasItems && selectedCount > 0;
  archivesToolbar.classList.toggle("hidden", !showToolbar);
  archivesToolbarActions?.classList.toggle("hidden", !showToolbar);
  if (!hasItems) {
    archivesSelectAll.checked = false;
    archivesSelectAll.indeterminate = false;
    archivesExportAll.disabled = true;
    if (archivesMoveSelected) archivesMoveSelected.disabled = true;
    if (archivesDeleteSelected) archivesDeleteSelected.disabled = true;
    archivesToolbarMeta.textContent = "";
    return;
  }

  archivesToolbarMeta.textContent = "";
  archivesSelectAll.checked = selectedCount > 0 && selectedCount === items.length;
  archivesSelectAll.indeterminate = selectedCount > 0 && selectedCount < items.length;
  archivesExportAll.disabled = isExportingArchives || items.length === 0;
  archivesExportAll.textContent = isExportingArchives ? uiText("내보내는 중", "Exporting") : uiText("내보내기", "Export");
  if (archivesMoveSelected) archivesMoveSelected.disabled = selectedCount === 0;
  if (archivesDeleteSelected) archivesDeleteSelected.disabled = selectedCount === 0;
}

function filterArchives(items: BotArchiveView[]): BotArchiveView[] {
  let filtered = filterArchivesBySearchQuery(filterArchivesByFolder(items));

  if (activeArchiveTag) {
    const selectedTag = activeArchiveTag;
    filtered = filtered.filter((item) => item.tags.includes(selectedTag));
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

  const allLabel = uiText("전체", "All", {
    ja: "すべて",
    "pt-BR": "Todas",
    es: "Todo",
    "zh-TW": "全部",
    vi: "Tất cả"
  });
  const newFolderLabel = uiText("+ 새 폴더", "+ New folder", {
    ja: "+ 新しいフォルダ",
    "pt-BR": "+ Nova pasta",
    es: "+ Nueva carpeta",
    "zh-TW": "+ 新資料夾",
    vi: "+ Thư mục mới"
  });

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

  const labelPrompt = uiText("폴더 이름을 입력하세요:", "Enter folder name:", {
    ja: "フォルダ名を入力してください:",
    "pt-BR": "Digite o nome da pasta:",
    es: "Introduce el nombre de la carpeta:",
    "zh-TW": "請輸入資料夾名稱：",
    vi: "Nhập tên thư mục:"
  });
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

  const label = uiText(
    '폴더 "{name}" 생성됨',
    'Folder "{name}" created',
    {
      ja: 'フォルダ「{name}」を作成しました',
      "pt-BR": 'Pasta "{name}" criada',
      es: 'Carpeta "{name}" creada',
      "zh-TW": '已建立資料夾「{name}」',
      vi: 'Đã tạo thư mục "{name}"'
    },
    { name: newFolder.name }
  );
  setStatus(label);
}

function showFolderContextMenu(folderId: string, event: MouseEvent): void {
  const existing = document.querySelector(".folder-context-menu");
  existing?.remove();

  const folders = loadFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return;

  const renameLabel = uiText("이름 변경", "Rename", {
    ja: "名前を変更",
    "pt-BR": "Renomear",
    es: "Cambiar nombre",
    "zh-TW": "重新命名",
    vi: "Đổi tên"
  });
  const deleteLabel = uiText("폴더 삭제", "Delete folder", {
    ja: "フォルダを削除",
    "pt-BR": "Excluir pasta",
    es: "Eliminar carpeta",
    "zh-TW": "刪除資料夾",
    vi: "Xóa thư mục"
  });

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
    const prompt = uiText(
      "새 이름 입력 (현재: {name}):",
      "New name (current: {name}):",
      {
        ja: "新しい名前を入力してください（現在: {name}）:",
        "pt-BR": "Novo nome (atual: {name}):",
        es: "Nuevo nombre (actual: {name}):",
        "zh-TW": "輸入新名稱（目前：{name}）：",
        vi: "Tên mới (hiện tại: {name}):"
      },
      { name: folder.name }
    );
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
    const confirmMsg = uiText(
      '폴더 "{name}"를 삭제하시겠습니까? (안의 아이템은 삭제되지 않습니다)',
      'Delete folder "{name}"? (Items inside will not be deleted)',
      {
        ja: 'フォルダ「{name}」を削除しますか？（中の項目は削除されません）',
        "pt-BR": 'Excluir a pasta "{name}"? (Os itens dentro dela não serão excluídos)',
        es: '¿Eliminar la carpeta "{name}"? (Los elementos dentro no se eliminarán)',
        "zh-TW": '要刪除資料夾「{name}」嗎？（裡面的項目不會被刪除）',
        vi: 'Xóa thư mục "{name}"? (Các mục bên trong sẽ không bị xóa)'
      },
      { name: folder.name }
    );
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
  const removeLabel = uiText("폴더에서 제거", "Remove from folder", {
    ja: "フォルダから外す",
    "pt-BR": "Remover da pasta",
    es: "Quitar de la carpeta",
    "zh-TW": "從資料夾移除",
    vi: "Gỡ khỏi thư mục"
  });
  const newLabel = uiText("+ 새 폴더에 이동", "+ Move to new folder", {
    ja: "+ 新しいフォルダへ移動",
    "pt-BR": "+ Mover para nova pasta",
    es: "+ Mover a una carpeta nueva",
    "zh-TW": "+ 移到新資料夾",
    vi: "+ Chuyển vào thư mục mới"
  });

  const menu = document.createElement("div");
  menu.className = "folder-move-menu";

  let html = `<div class="folder-move-menu-title">${escapeHtml(
    uiText("폴더 선택", "Choose folder", {
      ja: "フォルダを選択",
      "pt-BR": "Escolher pasta",
      es: "Elegir carpeta",
      "zh-TW": "選擇資料夾",
      vi: "Chọn thư mục"
    })
  )}</div>`;
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
      const label = uiText("이동 완료", "Moved", {
        ja: "移動しました",
        "pt-BR": "Movido",
        es: "Movido",
        "zh-TW": "已移動",
        vi: "Đã chuyển"
      });
      setStatus(label);
    });
  }

  menu.querySelector<HTMLButtonElement>("[data-move-new]")?.addEventListener("click", () => {
    dismiss();
    if (!ensureFolderLimitAvailable()) {
      return;
    }
    const labelPrompt = uiText("새 폴더 이름:", "New folder name:", {
      ja: "新しいフォルダ名:",
      "pt-BR": "Nome da nova pasta:",
      es: "Nombre de la nueva carpeta:",
      "zh-TW": "新資料夾名稱：",
      vi: "Tên thư mục mới:"
    });
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
    const label = uiText(
      '"{name}" 폴더로 이동됨',
      'Moved to "{name}"',
      {
        ja: '「{name}」フォルダへ移動しました',
        "pt-BR": 'Movido para "{name}"',
        es: 'Movido a "{name}"',
        "zh-TW": '已移動到「{name}」資料夾',
        vi: 'Đã chuyển vào "{name}"'
      },
      { name: newFolder.name }
    );
    setStatus(label);
  });
}

async function bulkDeleteSelectedArchives(): Promise<void> {
  const count = selectedArchiveIds.size;
  if (count === 0) return;

  const confirmMsg = uiText(
    "선택한 {count}개 항목을 삭제하시겠습니까?",
    "Delete {count} selected items?",
    {
      ja: "選択した {count} 件を削除しますか？",
      "pt-BR": "Excluir {count} itens selecionados?",
      es: "¿Eliminar los {count} elementos seleccionados?",
      "zh-TW": "要刪除所選的 {count} 個項目嗎？",
      vi: "Xóa {count} mục đã chọn?"
    },
    { count }
  );
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

  void refreshBootstrap().catch(() => undefined);
  const label = uiText(
    "{count}개 삭제됨",
    "{count} deleted",
    {
      ja: "{count} 件を削除しました",
      "pt-BR": "{count} excluído(s)",
      es: "{count} eliminado(s)",
      "zh-TW": "已刪除 {count} 個",
      vi: "Đã xóa {count} mục"
    },
    { count: ids.length }
  );
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

function promptArchiveExportTarget(): ArchiveExportTarget | null {
  const rawChoice = window.prompt(
    uiText(
      "내보내기 대상을 입력하세요: zip / notion / obsidian",
      "Choose an export target: zip / notion / obsidian"
    ),
    "zip"
  );
  if (rawChoice === null) {
    return null;
  }

  const normalized = rawChoice.trim().toLowerCase();
  if (normalized === "zip" || normalized === "1") {
    return "zip";
  }
  if (normalized === "notion" || normalized === "2") {
    return "notion";
  }
  if (normalized === "obsidian" || normalized === "3") {
    return "obsidian";
  }

  setStatus(
    uiText(
      "알 수 없는 내보내기 대상입니다. zip, notion, obsidian 중 하나를 입력하세요.",
      "Unknown export target. Enter zip, notion, or obsidian."
    ),
    true
  );
  return null;
}

function getPickerWindow(): PickerWindow {
  return window as PickerWindow;
}

function supportsObsidianDirectExport(): boolean {
  return typeof getPickerWindow().showDirectoryPicker === "function";
}

async function openObsidianDirectoryDatabase(): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(OBSIDIAN_DIRECTORY_DB_NAME, 1);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(OBSIDIAN_DIRECTORY_STORE_NAME)) {
        database.createObjectStore(OBSIDIAN_DIRECTORY_STORE_NAME);
      }
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error ?? new Error("Could not open IndexedDB.")));
  });
}

async function getStoredObsidianDirectoryRecord(): Promise<StoredDirectoryHandleRecord | null> {
  const database = await openObsidianDirectoryDatabase();
  return await new Promise((resolve, reject) => {
    const transaction = database.transaction(OBSIDIAN_DIRECTORY_STORE_NAME, "readonly");
    const store = transaction.objectStore(OBSIDIAN_DIRECTORY_STORE_NAME);
    const request = store.get(OBSIDIAN_DIRECTORY_KEY);

    transaction.addEventListener("complete", () => database.close());
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("Could not read the stored Obsidian directory."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("Could not read the stored Obsidian directory."));
    });
    request.addEventListener("success", () => resolve((request.result ?? null) as StoredDirectoryHandleRecord | null));
    request.addEventListener("error", () => reject(request.error ?? new Error("Could not read the stored Obsidian directory.")));
  });
}

function loadStoredObsidianDirectoryRecord(): Promise<StoredDirectoryHandleRecord | null> {
  if (!storedObsidianDirectoryRecordPromise) {
    storedObsidianDirectoryRecordPromise = getStoredObsidianDirectoryRecord().catch(() => null);
  }
  return storedObsidianDirectoryRecordPromise;
}

storedObsidianDirectoryRecordPromise = getStoredObsidianDirectoryRecord().catch(() => null);

async function setStoredObsidianDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const database = await openObsidianDirectoryDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(OBSIDIAN_DIRECTORY_STORE_NAME, "readwrite");
    const store = transaction.objectStore(OBSIDIAN_DIRECTORY_STORE_NAME);
    store.put(
      {
        handle,
        label: handle.name,
        savedAt: new Date().toISOString()
      } satisfies StoredDirectoryHandleRecord,
      OBSIDIAN_DIRECTORY_KEY
    );

    transaction.addEventListener("complete", () => {
      database.close();
      resolve();
    });
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("Could not store the Obsidian directory."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("Could not store the Obsidian directory."));
    });
  });
  cachedObsidianDirectoryHandle = handle;
  storedObsidianDirectoryRecordPromise = Promise.resolve({
    handle,
    label: handle.name,
    savedAt: new Date().toISOString()
  });
}

async function clearStoredObsidianDirectoryHandle(): Promise<void> {
  const database = await openObsidianDirectoryDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(OBSIDIAN_DIRECTORY_STORE_NAME, "readwrite");
    const store = transaction.objectStore(OBSIDIAN_DIRECTORY_STORE_NAME);
    store.delete(OBSIDIAN_DIRECTORY_KEY);

    transaction.addEventListener("complete", () => {
      database.close();
      resolve();
    });
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("Could not clear the stored Obsidian directory."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("Could not clear the stored Obsidian directory."));
    });
  });
  cachedObsidianDirectoryHandle = null;
  storedObsidianDirectoryRecordPromise = Promise.resolve(null);
}

async function queryObsidianDirectoryPermission(
  handle: FileSystemDirectoryHandle
): Promise<PermissionState | "unsupported"> {
  const permissionHandle = handle as PermissionDirectoryHandle;
  const queryPermission = permissionHandle.queryPermission;
  if (typeof queryPermission !== "function") {
    return "unsupported";
  }
  return await queryPermission.call(permissionHandle, { mode: "readwrite" });
}

async function requestObsidianDirectoryPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const permissionHandle = handle as PermissionDirectoryHandle;
  const requestPermission = permissionHandle.requestPermission;
  if (typeof requestPermission !== "function") {
    return false;
  }
  return (await requestPermission.call(permissionHandle, { mode: "readwrite" })) === "granted";
}

async function ensureObsidianDirectoryPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const currentPermission = await queryObsidianDirectoryPermission(handle);
  if (currentPermission === "granted" || currentPermission === "unsupported") {
    return true;
  }
  if (currentPermission === "denied") {
    return false;
  }
  return await requestObsidianDirectoryPermission(handle);
}

async function pickObsidianDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  const showDirectoryPicker = getPickerWindow().showDirectoryPicker;
  if (typeof showDirectoryPicker !== "function") {
    throw new Error(
      uiText(
        "Obsidian 바로 내보내기는 Chromium 계열 브라우저의 폴더 권한 API가 필요합니다.",
        "Direct Obsidian export requires the folder access API in a Chromium-based browser."
      )
    );
  }

  return await showDirectoryPicker({
    id: "obsidian-vault-target",
    mode: "readwrite"
  });
}

async function resolveObsidianDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  if (cachedObsidianDirectoryHandle && (await ensureObsidianDirectoryPermission(cachedObsidianDirectoryHandle))) {
    return cachedObsidianDirectoryHandle;
  }

  if (supportsObsidianDirectExport()) {
    const stored = await loadStoredObsidianDirectoryRecord();
    if (stored && (await ensureObsidianDirectoryPermission(stored.handle))) {
      cachedObsidianDirectoryHandle = stored.handle;
      return stored.handle;
    }
    if (stored) {
      await clearStoredObsidianDirectoryHandle().catch(() => undefined);
    }

    const picked = await pickObsidianDirectoryHandle();
    if (!(await ensureObsidianDirectoryPermission(picked))) {
      throw new Error(
        uiText(
          "선택한 Obsidian 폴더에 쓰기 권한이 없습니다.",
          "The selected Obsidian folder does not have write permission."
        )
      );
    }
    await setStoredObsidianDirectoryHandle(picked);
    return picked;
  }

  throw new Error(
    uiText(
      "이 브라우저에서는 Obsidian 폴더에 직접 저장할 수 없습니다. Chromium 계열 브라우저에서 다시 시도하세요.",
      "This browser cannot save directly into an Obsidian folder. Try again in a Chromium-based browser."
    )
  );
}

async function ensureObsidianSubdirectory(
  rootHandle: FileSystemDirectoryHandle,
  parts: string[]
): Promise<FileSystemDirectoryHandle> {
  let current = rootHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }
  return current;
}

function sanitizeObsidianFilename(value: string, fallback: string): string {
  const normalized = value
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|#^\[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return normalized || fallback;
}

async function createUniqueMarkdownFileHandle(
  directory: FileSystemDirectoryHandle,
  preferredFilename: string
): Promise<FileSystemFileHandle> {
  const safeFilename = sanitizeObsidianFilename(preferredFilename.replace(/\.md$/i, ""), "threads-scrapbook");
  for (let index = 1; index < 1000; index += 1) {
    const candidate = index === 1 ? `${safeFilename}.md` : `${safeFilename} (${index}).md`;
    try {
      await directory.getFileHandle(candidate);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return await directory.getFileHandle(candidate, { create: true });
      }
      throw error;
    }
  }

  throw new Error(
    uiText(
      "Obsidian 메모 파일명을 만들지 못했습니다.",
      "Could not create a unique Obsidian note filename."
    )
  );
}

async function writeMarkdownToObsidianDirectory(
  directory: FileSystemDirectoryHandle,
  preferredFilename: string,
  markdownContent: string
): Promise<void> {
  const fileHandle = await createUniqueMarkdownFileHandle(directory, preferredFilename);
  const writable = await fileHandle.createWritable();
  await writable.write(new Blob([markdownContent], { type: "text/markdown;charset=utf-8" }));
  await writable.close();
}

async function withArchiveExportBusyState(callback: () => Promise<void>): Promise<void> {
  isExportingArchives = true;
  if (latestState) {
    updateArchivesToolbar(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }

  try {
    await callback();
  } finally {
    isExportingArchives = false;
    if (latestState) {
      updateArchivesToolbar(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }
}

async function exportArchivesZip(archiveIds: string[]): Promise<void> {
  if (archiveIds.length === 0) {
    setStatus(t("scrapbookExportChooseItems"), true);
    return;
  }

  await withArchiveExportBusyState(async () => {
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
    }
  });
}

async function getScrapbookNotionConnection(): Promise<NotionConnectionSummary> {
  return await requestJson<NotionConnectionSummary>("/api/public/bot/notion/connection", {
    method: "POST"
  });
}

async function ensureScrapbookNotionLocation(): Promise<NotionConnectionSummary | null> {
  const connection = await getScrapbookNotionConnection();
  if (!connection.connected) {
    const start = await requestJson<{ authorizeUrl: string }>("/api/public/bot/notion/oauth/start", {
      method: "POST"
    });
    window.open(start.authorizeUrl, "_blank", "noopener,noreferrer");
    setStatus(
      uiText(
        "Notion 연결 창을 열었습니다. 승인 후 이 페이지로 돌아와 다시 내보내기를 실행하세요.",
        "Opened the Notion connection window. Approve it, then come back and run export again."
      )
    );
    return null;
  }

  if (connection.selectedParentId) {
    return connection;
  }

  const rawParentType = window.prompt(
    uiText(
      "Notion 저장 위치 유형을 입력하세요: page 또는 data_source",
      "Enter the Notion destination type: page or data_source"
    ),
    "page"
  );
  if (rawParentType === null) {
    return null;
  }

  const normalizedParentType = rawParentType.trim().toLowerCase();
  const parentType =
    normalizedParentType === "data_source" || normalizedParentType === "database" || normalizedParentType === "db"
      ? "data_source"
      : "page";

  const query = window.prompt(
    uiText(
      "Notion에서 저장할 페이지 또는 데이터소스를 검색하세요.",
      "Search for the Notion page or data source to save into."
    ),
    ""
  );
  if (query === null) {
    return null;
  }

  const searchResult = await requestJson<{ results: NotionLocationOption[] }>("/api/public/bot/notion/locations/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      parentType,
      query: query.trim()
    })
  });

  if (searchResult.results.length === 0) {
    setStatus(
      uiText(
        "Notion 저장 위치 검색 결과가 없습니다. 다른 검색어로 다시 시도하세요.",
        "No Notion save locations matched. Try again with a different search."
      ),
      true
    );
    return null;
  }

  const visibleOptions = searchResult.results.slice(0, 8);
  const optionsText = visibleOptions
    .map((item, index) => `${index + 1}. [${item.type}] ${item.label}${item.subtitle ? ` - ${item.subtitle}` : ""}`)
    .join("\n");
  const rawSelection = window.prompt(
    formatMessage(
      uiText(
        "저장할 Notion 위치 번호를 입력하세요.\n{options}",
        "Enter the Notion destination number.\n{options}"
      ),
      { options: optionsText }
    ),
    "1"
  );
  if (rawSelection === null) {
    return null;
  }

  const selectionIndex = Number.parseInt(rawSelection, 10) - 1;
  if (!Number.isInteger(selectionIndex) || selectionIndex < 0 || selectionIndex >= visibleOptions.length) {
    setStatus(
      uiText(
        "올바른 Notion 저장 위치 번호를 입력하세요.",
        "Enter a valid Notion destination number."
      ),
      true
    );
    return null;
  }

  const selected = visibleOptions[selectionIndex];
  return await requestJson<NotionConnectionSummary>("/api/public/bot/notion/locations/select", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      parentType,
      targetId: selected.id,
      targetLabel: selected.label,
      targetUrl: selected.url
    })
  });
}

async function exportArchivesNotion(archiveIds: string[]): Promise<void> {
  if (archiveIds.length === 0) {
    setStatus(t("scrapbookExportChooseItems"), true);
    return;
  }

  await withArchiveExportBusyState(async () => {
    try {
      const connection = await ensureScrapbookNotionLocation();
      if (!connection) {
        return;
      }

      const result = await requestJson<NotionExportResult>("/api/public/bot/notion/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ids: archiveIds,
          locale: currentLocale
        })
      });

      setStatus(
        formatMessage(
          uiText(
            "Notion 내보내기를 완료했습니다. {count}개 페이지를 만들었습니다.",
            "Finished the Notion export. Created {count} page(s)."
          ),
          { count: result.exportedCount }
        )
      );
      if (result.pages.length === 1 && result.pages[0]?.pageUrl) {
        window.open(result.pages[0].pageUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : uiText("Notion으로 내보내지 못했습니다.", "Could not export to Notion."),
        true
      );
    }
  });
}

async function exportArchivesObsidian(items: BotArchiveView[]): Promise<void> {
  if (items.length === 0) {
    setStatus(t("scrapbookExportChooseItems"), true);
    return;
  }

  let rootHandle: FileSystemDirectoryHandle;
  try {
    rootHandle = await resolveObsidianDirectoryHandle();
  } catch (error) {
    setStatus(
      error instanceof Error
        ? error.message
        : uiText("Obsidian으로 내보내지 못했습니다.", "Could not export to Obsidian."),
      true
    );
    return;
  }

  await withArchiveExportBusyState(async () => {
    try {
      const targetDirectory = await ensureObsidianSubdirectory(rootHandle, [OBSIDIAN_EXPORT_FOLDER]);

      for (const item of items) {
        const preferredFilename = sanitizeObsidianFilename(item.title || item.targetText || item.id, "threads-scrapbook");
        await writeMarkdownToObsidianDirectory(targetDirectory, preferredFilename, item.markdownContent);
      }

      setStatus(
        formatMessage(
          uiText(
            "Obsidian 내보내기를 완료했습니다. {count}개 노트를 저장했습니다.",
            "Finished the Obsidian export. Saved {count} note(s)."
          ),
          { count: items.length }
        )
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : uiText("Obsidian으로 내보내지 못했습니다.", "Could not export to Obsidian."),
        true
      );
    }
  });
}

function renderArchiveDetailHtml(item: BotArchiveView): string {
  const tagsLabel = buildArchiveTagsLabel(item);
  const totalMediaCount = countArchiveMedia(item);
  const hasMedia = totalMediaCount > 0;
  const showMedia = expandedMediaArchiveIds.has(item.id);
  const hasParseIssue = isLikelyArchiveParseIssue(item);
  const isEditing = editingArchiveId === item.id;

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
        hasParseIssue
          ? `<div class="archive-parse-warning"><strong>${escapeHtml(uiText("파싱 결과가 불안정할 수 있어요.", "This item may have been parsed poorly."))}</strong><span>${escapeHtml(uiText("원문추적과 원문보기를 눌러 원본을 확인하세요.", "Use trace source and view original to inspect the source."))}</span></div>`
          : ""
      }
      <div class="archive-detail-links">
        ${
          item.mentionUrl
            ? `<a class="secondary-cta" href="${escapeHtml(item.mentionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(uiText("원문추적", "Trace source"))}</a>`
            : ""
        }
        <a class="secondary-cta" href="${escapeHtml(item.targetUrl)}" target="_blank" rel="noreferrer">${escapeHtml(uiText("원문보기", "View original"))}</a>
      </div>
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
        <button class="topbar-link archive-edit-toggle" type="button" data-archive-edit="${item.id}">${escapeHtml(
          isEditing ? uiText("편집 닫기", "Close edit") : uiText("메모·통합 편집", "Edit note and details")
        )}</button>
        <button class="topbar-link archive-copy" type="button" data-copy="${item.id}">${escapeHtml(t("scrapbookCopyMarkdown"))}</button>
        <a class="topbar-link archive-action-link" href="/api/public/bot/archive/${encodeURIComponent(item.id)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>
        <button class="topbar-link archive-action-link" type="button" data-archive-delete="${item.id}">${escapeHtml(t("scrapbookDelete"))}</button>
      </div>
      ${
        isEditing
          ? `<div class="archive-edit-form">
              <label class="archive-edit-label">${escapeHtml(uiText("제목 · 메모 편집", "Edit title and note"))}</label>
              <p class="archive-edit-help">${escapeHtml(
                uiText(
                  "첫 줄은 제목, 다음 줄부터는 메모입니다. #태그도 여기서 함께 수정할 수 있어요.",
                  "The first line becomes the title, lines below are notes, and you can edit #tags here too."
                )
              )}</p>
              <textarea class="archive-edit-textarea" data-edit-textarea="${item.id}" rows="4" placeholder="${escapeHtml(
                uiText("첫 줄은 제목, 다음 줄부터 메모를 입력하세요. #태그 가능", "First line is the title, lines below are notes. #tags supported.")
              )}">${escapeHtml(item.noteText ?? "")}</textarea>
              <div class="archive-edit-actions">
                <button class="topbar-link topbar-link-strong archive-edit-save" type="button" data-edit-save="${item.id}">${escapeHtml(uiText("저장", "Save"))}</button>
                <button class="topbar-link archive-edit-cancel" type="button" data-edit-cancel="${item.id}">${escapeHtml(uiText("취소", "Cancel"))}</button>
              </div>
            </div>`
          : ""
      }
    </div>
  `;
}

function renderArchiveInlineEditHtml(item: BotArchiveView): string {
  if (!activeArchiveInlineEdit || activeArchiveInlineEdit.archiveId !== item.id) {
    return "";
  }

  const isTitleMode = activeArchiveInlineEdit.mode === "title";
  const label = isTitleMode ? uiText("제목 편집", "Edit title") : uiText("태그 편집", "Edit tags");
  const help = isTitleMode
    ? uiText(
        "목록 제목만 바로 바꿉니다. 저장하면 이 항목에 제목이 고정됩니다.",
        "Change the list title in place. Saving pins an explicit title for this item."
      )
    : uiText(
        "공백이나 쉼표로 구분해 입력하거나 #태그 형식으로 적어도 됩니다. 최대 3개까지 저장됩니다.",
        "Enter tags with spaces, commas, or #hashtags. Up to 3 tags are saved."
      );
  const value = isTitleMode ? buildArchiveTitle(item) : formatArchiveTagEditorValue(item.tags);
  const placeholder = isTitleMode ? uiText("새 제목", "New title") : uiText("#threads #idea", "#threads #idea");

  return `
    <div class="archive-inline-edit">
      <label class="archive-edit-label">${escapeHtml(label)}</label>
      <p class="archive-edit-help">${escapeHtml(help)}</p>
      <input
        class="archive-edit-input"
        type="text"
        data-inline-input="${item.id}"
        data-inline-mode="${activeArchiveInlineEdit.mode}"
        value="${escapeHtml(value)}"
        placeholder="${escapeHtml(placeholder)}"
      />
      <div class="archive-edit-actions">
        <button class="topbar-link topbar-link-strong" type="button" data-inline-save="${item.id}" data-inline-mode="${activeArchiveInlineEdit.mode}">${escapeHtml(uiText("저장", "Save"))}</button>
        <button class="topbar-link" type="button" data-inline-cancel="${item.id}">${escapeHtml(uiText("취소", "Cancel"))}</button>
      </div>
    </div>
  `;
}

function renderArchives(items: BotArchiveView[], isAuthenticated: boolean): void {
  if (!archivesEl || !archivesEmptyEl || !archivesBoard) {
    return;
  }

  syncArchiveSortControls();
  syncArchiveFilterControls();

  const showLoadingState = isAuthenticated && archivesHydrating && (items.length === 0 || pendingConnectedStatus);
  syncArchivesLoadingPanel(showLoadingState);
  if (showLoadingState) {
    archivesEl.innerHTML = "";
    archivesBoard.classList.add("hidden");
    archivesEmptyEl.classList.add("hidden");
    archivesPaginationEl?.classList.add("hidden");
    updateArchivesToolbar([], isAuthenticated);
    archivesFilterBar?.classList.add("hidden");
    renderArchiveTagPanel([], false);
    syncScrapbookHistory();
    return;
  }

  if (!isAuthenticated || items.length === 0) {
    archivesEl.innerHTML = "";
    archivesBoard.classList.add("hidden");
    archivesEmptyEl.classList.remove("hidden");
    archivesEmptyEl.innerHTML = !isAuthenticated
      ? `<strong>${escapeHtml(t("scrapbookArchiveLoginTitle"))}</strong><span>${escapeHtml(
          uiText(
            "Threads 계정을 연결하면 수집된 글이 여기에 모입니다.",
            "Connect your Threads account and the collected posts will gather here."
          )
        )}</span>`
      : `<strong>${escapeHtml(t("scrapbookArchiveEmptyTitle"))}</strong><span>${escapeHtml(
          uiText(
            "연결이 완료되면 멘션, 클라우드 저장, 모니터링에서 모인 글이 여기에 표시됩니다.",
            "Once connected, posts from mentions, cloud saves, and monitoring will appear here."
          )
        )}</span>`;
    activeArchiveId = null;
    activeArchiveInlineEdit = null;
    archivesPaginationEl?.classList.add("hidden");
    updateArchivesToolbar([], isAuthenticated);
    archivesFilterBar?.classList.toggle("hidden", true);
    renderArchiveTagPanel([], false);
    syncScrapbookHistory();
    return;
  }

  archivesFilterBar?.classList.remove("hidden");
  const ordered = sortArchivesByDate(items);
  renderFolderStrip(ordered);
  renderArchiveTagPanel(ordered, isAuthenticated);

  const filtered = filterArchives(ordered);

  syncSelectedArchiveIds(filtered);
  if (!filtered.some((item) => item.id === activeArchiveId)) {
    activeArchiveId = null;
  }
  if (activeArchiveInlineEdit && !filtered.some((item) => item.id === activeArchiveInlineEdit?.archiveId)) {
    activeArchiveInlineEdit = null;
  }

  archivesEmptyEl.classList.add("hidden");
  archivesBoard.classList.remove("hidden");

  if (filtered.length === 0) {
    archivesEl.innerHTML = `<tr><td colspan="3" class="archive-no-results">${escapeHtml(t("scrapbookNoResults"))}</td></tr>`;
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
    const rowMeta = buildArchiveRowMeta(item);
    const hasInlineEdit = isArchiveInlineEditActive(item);
    html += `
        <tr class="${isActive ? "is-active" : ""}" data-open-row="${item.id}">
          <td class="archive-table-select">
            <label class="archive-row-checkbox">
              <input type="checkbox" data-select="${item.id}" ${isSelected ? "checked" : ""} />
            </label>
          </td>
          <td>
            <div class="archive-row-main">
              <button class="archive-row-title" type="button" data-open-trigger="${item.id}">${escapeHtml(buildArchiveTitle(item))}</button>
              ${rowMeta ? `<div class="archive-row-meta">${escapeHtml(rowMeta)}</div>` : ""}
              <div class="archive-row-inline-actions">
                <button class="archive-row-inline-action ${isArchiveInlineEditActive(item, "title") ? "is-active" : ""}" type="button" data-row-edit="${item.id}" data-row-edit-mode="title" aria-pressed="${String(isArchiveInlineEditActive(item, "title"))}">${escapeHtml(uiText("제목 편집", "Edit title"))}</button>
                <button class="archive-row-inline-action ${isArchiveInlineEditActive(item, "tags") ? "is-active" : ""}" type="button" data-row-edit="${item.id}" data-row-edit-mode="tags" aria-pressed="${String(isArchiveInlineEditActive(item, "tags"))}">${escapeHtml(uiText("태그 편집", "Edit tags"))}</button>
              </div>
              ${hasInlineEdit ? `<div class="archive-row-inline-panel">${renderArchiveInlineEditHtml(item)}</div>` : ""}
            </div>
          </td>
          <td class="archive-row-date">${escapeHtml(formatDate(item.archivedAt))}</td>
        </tr>
      `;
    if (isActive) {
      html += `<tr class="archive-row-detail"><td colspan="3">${renderArchiveDetailHtml(item)}</td></tr>`;
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

  const toggleArchiveOpen = (archiveId: string): void => {
    activeArchiveId = activeArchiveId === archiveId ? null : archiveId;
    renderArchives(items, isAuthenticated);
  };

  for (const row of archivesEl.querySelectorAll<HTMLTableRowElement>("[data-open-row]")) {
    row.addEventListener("click", (event) => {
      const archiveId = row.dataset.openRow;
      if (!archiveId) {
        return;
      }
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (
        event.target.closest(".archive-row-checkbox") ||
        event.target.closest(".archive-row-inline-actions") ||
        event.target.closest(".archive-row-inline-panel") ||
        event.target.closest(".archive-inline-edit")
      ) {
        return;
      }
      toggleArchiveOpen(archiveId);
    });
  }

  for (const trigger of archivesEl.querySelectorAll<HTMLButtonElement>("[data-open-trigger]")) {
    trigger.addEventListener("click", (event) => {
      const archiveId = trigger.dataset.openTrigger;
      if (!archiveId) {
        return;
      }
      event.stopPropagation();
      toggleArchiveOpen(archiveId);
    });
  }

  for (const button of archivesEl.querySelectorAll<HTMLButtonElement>("[data-row-edit]")) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const archiveId = button.dataset.rowEdit;
      const mode = button.dataset.rowEditMode as ArchiveInlineEditMode | undefined;
      if (!archiveId || !mode) {
        return;
      }
      activeArchiveInlineEdit =
        activeArchiveInlineEdit?.archiveId === archiveId && activeArchiveInlineEdit.mode === mode
          ? null
          : { archiveId, mode };
      editingArchiveId = null;
      renderArchives(items, isAuthenticated);
    });
  }

  for (const button of archivesEl.querySelectorAll<HTMLButtonElement>("[data-inline-save]")) {
    button.addEventListener("click", () => {
      const archiveId = button.dataset.inlineSave;
      const mode = button.dataset.inlineMode as ArchiveInlineEditMode | undefined;
      if (!archiveId || !mode) {
        return;
      }
      const input = archivesEl.querySelector<HTMLInputElement>(`[data-inline-input="${archiveId}"]`);
      if (!input) {
        return;
      }
      if (mode === "title") {
        void updateArchiveTitleRequest(archiveId, input.value);
        return;
      }
      void updateArchiveTagsRequest(archiveId, input.value);
    });
  }

  for (const button of archivesEl.querySelectorAll<HTMLButtonElement>("[data-inline-cancel]")) {
    button.addEventListener("click", () => {
      activeArchiveInlineEdit = null;
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

    const archiveEditButton = archivesEl.querySelector<HTMLButtonElement>("[data-archive-edit]");
    if (archiveEditButton) {
      archiveEditButton.addEventListener("click", () => {
        activeArchiveInlineEdit = null;
        editingArchiveId = editingArchiveId === detailItem.id ? null : detailItem.id;
        renderArchives(items, isAuthenticated);
      });
    }

    const editSaveButton = archivesEl.querySelector<HTMLButtonElement>("[data-edit-save]");
    if (editSaveButton) {
      editSaveButton.addEventListener("click", () => {
        const textarea = archivesEl?.querySelector<HTMLTextAreaElement>(`[data-edit-textarea="${detailItem.id}"]`);
        if (!textarea) return;
        void updateArchiveNoteRequest(detailItem.id, textarea.value);
      });
    }

    const editCancelButton = archivesEl.querySelector<HTMLButtonElement>("[data-edit-cancel]");
    if (editCancelButton) {
      editCancelButton.addEventListener("click", () => {
        editingArchiveId = null;
        renderArchives(items, isAuthenticated);
      });
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
    scopeStatus.textContent = "";
    scopeStatus.classList.add("hidden");
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
  let selectedLabel = "";

  for (const button of workspaceTabButtons) {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    if (isActive) {
      selectedLabel = button.textContent?.trim() || "";
    }
  }
  for (const panel of workspacePanels) {
    panel.classList.toggle("hidden", panel.dataset.tabPanel !== tab);
  }

  if (selectedLabel && workspaceTabCurrent) {
    workspaceTabCurrent.textContent = selectedLabel;
  }

  if (isWorkspaceMobileLayout()) {
    setWorkspaceTabsOpen(false);
  }
}

function renderFeatureGateState(
  emptyEl: HTMLElement,
  listEl: HTMLElement | null,
  title: string,
  copy: string,
  formEl?: HTMLElement | null
): void {
  listEl?.classList.add("hidden");
  if (listEl) {
    listEl.innerHTML = "";
  }
  formEl?.classList.add("hidden");
  emptyEl.classList.remove("hidden");
  emptyEl.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span>`;
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
    renderFeatureGateState(
      watchlistsEmpty,
      watchlistsList,
      t("scrapbookWatchlistsLoginTitle"),
      t("scrapbookWatchlistsLoginCopy"),
      watchlistForm
    );
    return;
  }

  if (workspace.plan.tier !== "plus") {
    renderFeatureGateState(
      watchlistsEmpty,
      watchlistsList,
      uiText("Plus가 필요합니다.", "Plus required."),
      uiText(
        "공개 계정 모니터링은 Plus에서 열립니다. Plus를 연결하면 바로 사용할 수 있습니다.",
        "Public account monitoring unlocks on Plus. Connect Plus to start using it."
      ),
      watchlistForm
    );
    return;
  }

  if (workspace.scopes.needsReconnect) {
    renderFeatureGateState(
      watchlistsEmpty,
      watchlistsList,
      t("scrapbookWatchlistsReconnectTitle"),
      t("scrapbookWatchlistsReconnectCopy"),
      watchlistForm
    );
    return;
  }

  watchlistForm?.classList.remove("hidden");
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
    renderFeatureGateState(
      searchesEmpty,
      searchesList,
      t("scrapbookSearchesLoginTitle"),
      t("scrapbookSearchesLoginCopy"),
      searchForm
    );
    return;
  }

  if (workspace.scopes.needsReconnect) {
    renderFeatureGateState(
      searchesEmpty,
      searchesList,
      t("scrapbookSearchesReconnectTitle"),
      t("scrapbookSearchesReconnectCopy"),
      searchForm
    );
    return;
  }

  searchForm?.classList.remove("hidden");
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

type InsightCardModel = {
  title: string;
  subtitle: string;
  handle: string;
  avatarUrl: string | null;
  dateStr: string;
  insightsData: GrowthInsightsData;
  insightProps?: {
    highlightId: string;
    highlightParams: Record<string, string | number>;
    localeAtSave: string;
    tier: string;
    score: number;
  } | null;
};

function buildInsightsCardModelFromCurrent(workspace: ScrapbookPlusState | null): InsightCardModel | null {
  if (!workspace?.authenticated || !workspace.insights.ready) {
    return null;
  }

  const handle = latestState?.user?.threadsHandle || latestConfig?.botHandle || "unknown";
  const avatarUrl = latestState?.user?.profilePictureUrl || null;

  const insightsData: GrowthInsightsData = {
    overview: workspace.insights.overview,
    posts: workspace.insights.posts.map((p) => ({
      metrics: {
        views: p.metrics.views,
        likes: p.metrics.likes,
        replies: p.metrics.replies,
        reposts: p.metrics.reposts
      }
    }))
  };

  return {
    title: t("scrapbookInsightsTitle"),
    subtitle: workspace.insights.refreshedAt
      ? t("scrapbookInsightsRefreshedAt", { date: formatDate(workspace.insights.refreshedAt) })
      : t("scrapbookInsightsNotLoadedYet"),
    handle,
    avatarUrl,
    dateStr: formatDate(new Date().toISOString()),
    insightsData
  };
}

function buildInsightsCardModelFromSavedView(view: ScrapbookInsightsSavedView): InsightCardModel {
  const handle = latestState?.user?.threadsHandle || latestConfig?.botHandle || "unknown";
  const avatarUrl = latestState?.user?.profilePictureUrl || null;

  const insightsData: GrowthInsightsData = {
    overview: {
      followers: { value: view.overview.followers },
      views: { value: view.overview.views },
      likes: { value: view.overview.likes },
      replies: { value: view.overview.replies },
      reposts: { value: view.overview.reposts }
    },
    posts: view.posts.map((p) => ({
      metrics: {
        views: { value: p.views },
        likes: { value: p.likes },
        replies: { value: null }, // Old saved views might not have these
        reposts: { value: null }
      }
    }))
  };

  return {
    title: view.name,
    subtitle: t("scrapbookInsightsSavedAt", { date: formatDate(view.capturedAt || view.createdAt) }),
    handle,
    avatarUrl,
    dateStr: formatDate(view.capturedAt || view.createdAt),
    insightsData,
    insightProps: view.insightProps
  };
}

async function renderInsightsCardBlob(card: InsightCardModel): Promise<Blob> {
  const calculatedScore = calculateGrowthScore(card.insightsData);
  const score = card.insightProps?.score ?? calculatedScore.score;
  const tier = card.insightProps?.tier ?? calculatedScore.tier;
  const tierNameEn = card.insightProps ? card.insightProps.tier.replace(/-/g, " ") : calculatedScore.tierNameEn;

  const medals = calculateMedals(card.insightsData);
  const highlight = card.insightProps ? { id: card.insightProps.highlightId, params: card.insightProps.highlightParams } : selectHighlight(card.insightsData);

  const container = document.createElement("div");
  container.className = "growth-card-export";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";

  let highlightTitle = "";
  let highlightCopy = "";
  if (highlight.id === "top-post") {
    highlightTitle = `역대 최고 히트수 기록`;
    highlightCopy = `${formatCompactNumber(highlight.params.views as number)} 조회수와 ${formatCompactNumber(highlight.params.likes as number)} 반응을 끌어낸 최고의 글이 탄생했습니다.`;
  } else if (highlight.id === "reply-magnet") {
    highlightTitle = `폭발적인 대화의 중심`;
    highlightCopy = `평소보다 ${highlight.params.multiplier}배 많은 답글을 연달아 이끌어낸 커뮤니티의 핵심입니다.`;
  } else if (highlight.id === "reposted-post") {
    highlightTitle = `영향력의 확산`;
    highlightCopy = `내가 쓴 글이 계속 리포스트되며 조용하게 그러나 멀리 울려 퍼졌습니다.`;
  } else if (highlight.id === "high-engage") {
    highlightTitle = `미친 반응률, 마그넷 계정`;
    highlightCopy = `조회수 대비 반응률이 ${highlight.params.rate}%에 달하는 극강의 인게이지먼트를 달성했습니다.`;
  } else if (highlight.id === "silent-reach") {
    highlightTitle = `소리없는 도약`;
    highlightCopy = `조용히 그러나 묵직하게. 평균보다 3배 많은 유저 핏에 스며들었습니다.`;
  } else {
    highlightTitle = `조용한 성장의 씨앗`;
    highlightCopy = `조용히 땅의 기운을 모으고 있습니다. 당신만의 색깔을 키워보세요.`;
  }

  container.innerHTML = `
    <div class="gc-panel">
      <div class="gc-header">
        <div class="gc-user">
          ${card.avatarUrl ? `<img src="${card.avatarUrl}" class="gc-user-avatar" crossorigin="anonymous" />` : '<div class="gc-user-avatar" style="background: rgba(255,255,255,0.1);"></div>'}
          <div class="gc-user-info">
            <span class="gc-user-name">${card.handle}</span>
            <span class="gc-user-handle">@${card.handle}</span>
          </div>
        </div>
        <div class="gc-brand">
          <p class="gc-brand-name">SS<span class="gc-brand-accent">THREADS</span></p>
          <p class="gc-brand-date">${card.dateStr}</p>
        </div>
      </div>
      
      <div class="gc-hero">
        <h1 class="gc-highlight-title">${highlightTitle}</h1>
        <p class="gc-highlight-copy">${highlightCopy}</p>
      </div>

      <div class="gc-stats-grid">
        <div class="gc-tier-box">
          <span class="gc-tier-label">Growth Tier</span>
          <h2 class="gc-tier-value">${tierNameEn.toUpperCase()}</h2>
          <p class="gc-score-value">${score.toLocaleString()} PTS</p>
        </div>
        <div class="gc-medals-box">
          <div class="gc-medals-row">
            <div class="gc-medal-item">
              <div class="gc-hex" data-tier="${medals.reach}">${medals.reach.charAt(0).toUpperCase()}</div>
              <span class="gc-medal-label">Reach</span>
            </div>
            <div class="gc-medal-item">
              <div class="gc-hex" data-tier="${medals.community}">${medals.community.charAt(0).toUpperCase()}</div>
              <span class="gc-medal-label">Comm</span>
            </div>
            <div class="gc-medal-item">
              <div class="gc-hex" data-tier="${medals.engagement}">${medals.engagement.charAt(0).toUpperCase()}</div>
              <span class="gc-medal-label">Engage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  await document.fonts?.ready;
  if (card.avatarUrl) {
    const img = container.querySelector("img");
    if (img && !img.complete) {
      await Promise.race([
        new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        }),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);
    }
  }

  const blob = await htmlToImage.toBlob(container, {
    quality: 1.0,
    pixelRatio: 2,
    skipFonts: false
  });

  document.body.removeChild(container);

  if (!blob) throw new Error("Card rendering failed");
  return blob;
}

function buildInsightCardFilename(prefix: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${stamp}.png`;
}

async function shareInsightCard(card: InsightCardModel): Promise<void> {
  const blob = await renderInsightsCardBlob(card);
  const filename = buildInsightCardFilename("ss-threads-growth");
  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: card.title,
      files: [file]
    });
    setStatus(t("scrapbookStatusInsightsCardShared"));
    return;
  }

  downloadBlob(blob, filename);
  setStatus(t("scrapbookStatusInsightsCardDownloaded"));
}

function renderInsightsSavedViews(workspace: ScrapbookPlusState | null): void {
  if (!insightsSavedEmpty || !insightsSavedList) {
    return;
  }

  const insightsLocked = !workspace || !workspace.authenticated || workspace.plan.tier !== "plus" || workspace.scopes.needsReconnect;
  if (insightsLocked) {
    insightsSavedEmpty.classList.add("hidden");
    insightsSavedList.classList.add("hidden");
    insightsSavedList.innerHTML = "";
    return;
  }

  const savedViews = workspace.insights.savedViews;
  if (savedViews.length === 0) {
    insightsSavedList.classList.add("hidden");
    insightsSavedList.innerHTML = "";
    insightsSavedEmpty.classList.remove("hidden");
    return;
  }

  insightsSavedEmpty.classList.add("hidden");
  insightsSavedList.classList.remove("hidden");
  insightsSavedList.innerHTML = savedViews
    .map(
      (view) => `
        <details class="insights-saved-card">
          <summary class="insights-saved-summary">
            <div class="insights-saved-summary-main">
              <div class="insights-saved-copy">
                <strong class="insights-saved-title">${escapeHtml(view.name)}</strong>
                <span class="insights-saved-date">${escapeHtml(t("scrapbookInsightsSavedAt", { date: formatDate(view.capturedAt || view.createdAt) }))}</span>
              </div>
              <div class="insights-saved-summary-metrics">
                <span class="insights-saved-summary-metric">
                  <span>${escapeHtml(t("scrapbookMetricFollowers"))}</span>
                  <strong>${escapeHtml(formatCompactNumber(view.overview.followers))}</strong>
                </span>
                <span class="insights-saved-summary-metric">
                  <span>${escapeHtml(t("scrapbookMetricViews"))}</span>
                  <strong>${escapeHtml(formatCompactNumber(view.overview.views))}</strong>
                </span>
                <span class="insights-saved-summary-metric">
                  <span>${escapeHtml(t("scrapbookMetricLikes"))}</span>
                  <strong>${escapeHtml(formatCompactNumber(view.overview.likes))}</strong>
                </span>
              </div>
            </div>
            <span class="insights-saved-chevron" aria-hidden="true"></span>
          </summary>
          <div class="insights-saved-body">
            <div class="insights-saved-actions">
              <button class="secondary-cta" type="button" data-insight-share-view="${escapeHtml(view.id)}">${escapeHtml(t("scrapbookInsightsShareCardAgain"))}</button>
              <button class="topbar-link" type="button" data-insight-delete-view="${escapeHtml(view.id)}">${escapeHtml(t("scrapbookInsightsDeleteView"))}</button>
            </div>
            <div class="insights-saved-metrics">
              <div class="insights-saved-metric">
                <span>${escapeHtml(t("scrapbookMetricFollowers"))}</span>
                <strong>${escapeHtml(formatCompactNumber(view.overview.followers))}</strong>
              </div>
              <div class="insights-saved-metric">
                <span>${escapeHtml(t("scrapbookMetricViews"))}</span>
                <strong>${escapeHtml(formatCompactNumber(view.overview.views))}</strong>
              </div>
              <div class="insights-saved-metric">
                <span>${escapeHtml(t("scrapbookMetricLikes"))}</span>
                <strong>${escapeHtml(formatCompactNumber(view.overview.likes))}</strong>
              </div>
            </div>
            ${
              view.posts.length > 0
                ? `<div class="insights-saved-posts">
                    ${view.posts
                      .map(
                        (post) => `
                          <div class="insights-saved-post">
                            <span class="insights-saved-post-title">${escapeHtml(post.title)}</span>
                            <span class="insights-saved-post-meta">${escapeHtml(`${t("scrapbookInsightsViews", { value: formatCompactNumber(post.views) })} · ${t("scrapbookInsightsLikes", { value: formatCompactNumber(post.likes) })}`)}</span>
                          </div>
                        `
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>
        </details>
      `
    )
    .join("");

  for (const button of insightsSavedList.querySelectorAll<HTMLButtonElement>("[data-insight-share-view]")) {
    button.addEventListener("click", () => {
      const view = workspace.insights.savedViews.find((candidate) => candidate.id === (button.dataset.insightShareView || ""));
      if (view) {
        void shareInsightCard(buildInsightsCardModelFromSavedView(view));
      }
    });
  }

  for (const button of insightsSavedList.querySelectorAll<HTMLButtonElement>("[data-insight-delete-view]")) {
    button.addEventListener("click", () => void deleteInsightsViewRequest(button.dataset.insightDeleteView || ""));
  }
}

function renderInsights(workspace: ScrapbookPlusState | null): void {
  if (insightsRefreshed) {
    insightsRefreshed.textContent = workspace?.insights.refreshedAt
      ? t("scrapbookInsightsRefreshedAt", { date: formatDate(workspace.insights.refreshedAt) })
      : t("scrapbookInsightsNotLoadedYet");
  }

  const insightsLocked = !workspace || !workspace.authenticated || workspace.plan.tier !== "plus" || workspace.scopes.needsReconnect;
  const currentCard = buildInsightsCardModelFromCurrent(workspace);
  if (insightsSaveView) {
    insightsSaveView.disabled = insightsLocked || !currentCard;
  }
  if (insightsShareCard) {
    insightsShareCard.disabled = insightsLocked || !currentCard;
  }
  if (insightsRefresh) {
    insightsRefresh.disabled = insightsLocked;
  }
  renderInsightsSavedViews(workspace);

  if (!workspace || !workspace.authenticated || workspace.plan.tier !== "plus" || workspace.scopes.needsReconnect) {
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
          : workspace.plan.tier !== "plus"
            ? `<strong>${escapeHtml(uiText("Plus가 필요합니다.", "Plus required."))}</strong><span>${escapeHtml(
                uiText(
                  "성과 보기는 Plus에서 열립니다. Plus를 연결하면 내 계정 성장을 바로 확인할 수 있습니다.",
                  "Growth insights unlock on Plus. Connect Plus to see your account growth here."
                )
              )}</span>`
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

  if (!workspace.insights.ready) {
    insightsPosts.innerHTML = "";
    insightsPosts.classList.add("hidden");
    insightsEmpty.classList.remove("hidden");
    return;
  }

  if (workspace.insights.posts.length === 0) {
    insightsPosts.innerHTML = "";
    insightsPosts.classList.add("hidden");
    insightsEmpty.classList.remove("hidden");
    insightsEmpty.innerHTML = `<strong>${escapeHtml(
      uiText(
        "아직 표시할 최근 게시물이 없습니다.",
        "No recent posts to show yet.",
        {
          ja: "まだ表示する最近の投稿はありません。",
          "pt-BR": "Ainda não há posts recentes para mostrar.",
          es: "Todavía no hay publicaciones recientes para mostrar.",
          "zh-TW": "目前還沒有可顯示的最近貼文。",
          vi: "Chưa có bài gần đây để hiển thị."
        }
      )
    )}</strong><span>${escapeHtml(
      uiText(
        "새 글을 올린 뒤 다시 업데이트하면 최근 게시물 반응이 여기에 표시됩니다.",
        "Update again after you publish and recent post reactions will appear here.",
        {
          ja: "新しい投稿を公開したあとに再度更新すると、最近の投稿反応がここに表示されます。",
          "pt-BR": "Atualize novamente depois de publicar e as reações dos posts recentes aparecerão aqui.",
          es: "Vuelve a actualizar después de publicar y aquí aparecerán las reacciones de tus publicaciones recientes.",
          "zh-TW": "發文之後再更新一次，最近貼文的反應就會顯示在這裡。",
          vi: "Hãy cập nhật lại sau khi đăng bài và phản ứng của các bài gần đây sẽ xuất hiện tại đây."
        }
      )
    )}</span>`;
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

function applySessionState(
  config: BotPublicConfig,
  state: BotSessionState,
  options: { persist?: boolean } = {}
): void {
  const previousUserHandle = normalizeScrapbookHandle(latestState?.user?.threadsHandle);
  latestConfig = config;
  latestState = state;
  applyStaticTranslations();
  for (const element of document.querySelectorAll<HTMLElement>("[data-bot-handle]")) {
    element.textContent = `@${normalizeBotHandle(config.botHandle) || DEFAULT_BOT_HANDLE}`;
  }

  const isAuthenticated = state.authenticated && Boolean(state.user);
  if (!isAuthenticated) {
    archivesHydrating = false;
  }
  const nextUserHandle = isAuthenticated ? normalizeScrapbookHandle(state.user?.threadsHandle) : null;
  activeScrapbookHandle = nextUserHandle;
  if (!isAuthenticated || (previousUserHandle && nextUserHandle && previousUserHandle !== nextUserHandle)) {
    editingArchiveId = null;
    activeArchiveInlineEdit = null;
    latestWorkspace = null;
    renderScopeStatus(null);
    renderWatchlists(null);
    renderSearches(null);
    renderInsights(null);
  }
  authPanel?.classList.toggle("hidden", isAuthenticated);
  sessionPanel?.classList.toggle("hidden", !isAuthenticated);
  syncWorkspaceTabsVisibility(isAuthenticated);
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
  renderSaveStatus(state);
  renderPlanPanel();
  syncScrapbookHistory();
  resolvePendingConnectedStatus(state);
  if (options.persist ?? true) {
    persistSyncSnapshot();
  }
}

function materializeSessionStateFromAuth(authState: BotSessionAuthState): BotSessionState {
  if (!authState.authenticated || !authState.user) {
    return {
      ...authState,
      archives: [],
      saveStatus: null
    };
  }

  const currentUserId = latestState?.user?.id ?? null;
  if (latestState?.authenticated && currentUserId === authState.user.id) {
    return {
      ...latestState,
      ...authState,
      user: { ...authState.user }
    };
  }

  return {
    ...authState,
    archives: [],
    saveStatus: null
  };
}

function applyWorkspaceState(workspace: ScrapbookPlusState, options: { persist?: boolean } = {}): void {
  latestWorkspace = workspace;
  renderScopeStatus(workspace);
  renderWatchlists(workspace);
  renderSearches(workspace);
  renderInsights(workspace);
  renderPlanPanel();
  renderSaveStatus(latestState);
  if (options.persist ?? true) {
    persistSyncSnapshot();
  }
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
    pendingConnectedStatus = true;
    setStatus("");
    renderConnectButtons();
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
  const state = await requestJson<BotSessionAuthState>("/api/public/bot/session");
  const config = {
    botHandle: state.botHandle,
    oauthConfigured: state.oauthConfigured
  };
  latestConfig = config;
  applySessionState(config, materializeSessionStateFromAuth(state));
}

async function refreshInbox(): Promise<void> {
  const state = await requestJson<BotSessionState>("/api/public/bot/inbox");
  const config = {
    botHandle: state.botHandle,
    oauthConfigured: state.oauthConfigured
  };
  latestConfig = config;
  applySessionState(config, state);
}

async function refreshBootstrap(): Promise<void> {
  const state = await requestJson<BotBootstrapState>("/api/public/bot/bootstrap");
  const config = {
    botHandle: state.botHandle,
    oauthConfigured: state.oauthConfigured
  };
  const { workspace, ...sessionState } = state;
  latestConfig = config;
  applySessionState(config, sessionState);
  applyWorkspaceState(workspace);
}

async function initializeScrapbook(): Promise<void> {
  setArchivesHydrating(true);
  try {
    if (pendingConnectedStatus) {
      try {
        await refreshInbox();
      } catch {
        // Ignore a transient inbox failure here; the bootstrap refresh below is the source of truth.
      }
    }

    await refreshBootstrap();
    if (latestState?.authenticated && latestState.user) {
      void syncLatestMentions({ silent: true, suppressErrors: true }).catch(() => undefined);
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookStatusLoadFailed"), true);
  } finally {
    setArchivesHydrating(false);
  }
}

function applyArchiveMutationState(state: BotSessionState): void {
  if (!latestConfig) {
    latestState =
      latestState?.authenticated && latestState.user?.id === state.user?.id
        ? {
            ...state,
            saveStatus: state.saveStatus ?? latestState.saveStatus ?? null
          }
        : state;
    return;
  }

  const nextState =
    latestState?.authenticated && latestState.user?.id === state.user?.id
      ? {
          ...state,
          saveStatus: state.saveStatus ?? latestState.saveStatus ?? null
        }
      : state;

  applySessionState(latestConfig, {
    ...nextState,
    botHandle: latestConfig.botHandle,
    oauthConfigured: latestConfig.oauthConfigured
  });
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

async function syncLatestMentions(options: { silent?: boolean; suppressErrors?: boolean } = {}): Promise<void> {
  if (!latestConfig) {
    return;
  }
  isRefreshingSaveStatus = true;
  renderSaveStatus(latestState);

  try {
    const state = await requestJson<BotBootstrapState>("/api/public/bot/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    const config = {
      botHandle: state.botHandle,
      oauthConfigured: state.oauthConfigured
    };
    const { workspace, ...sessionState } = state;
    latestConfig = config;
    applySessionState(config, sessionState);
    applyWorkspaceState(workspace);
    if (!options.silent) {
      const filteredCount = filterArchives(state.archives).length;
      setStatus(
        hasActiveArchiveFilters() && state.archives.length > filteredCount
          ? uiText(
              "새 댓글 저장 상태를 확인했습니다. 현재 검색이나 태그 필터 때문에 일부 항목이 바로 안 보일 수 있습니다.",
              "Checked the latest reply saves. Some items may still be hidden by your current search or tag filters."
            )
          : uiText("새 댓글 저장 상태를 다시 확인했습니다.", "Checked the latest reply save status.")
      );
    }
  } catch (error) {
    if (!options.suppressErrors) {
      setStatus(error instanceof Error ? error.message : uiText("저장 상태를 다시 확인할 수 없습니다.", "Could not refresh save status."), true);
    }
    throw error;
  } finally {
    isRefreshingSaveStatus = false;
    renderSaveStatus(latestState);
  }
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
  const mediaTypes = Array.from(watchlistForm.querySelectorAll<HTMLInputElement>("input[name='mediaTypes']:checked")).map(
    (option) => option.value
  );

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
  void refreshBootstrap().catch(() => undefined);
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

  const state = await requestJson<BotSessionState>(`/api/public/bot/archive/${encodeURIComponent(normalizedId)}`, {
    method: "DELETE"
  });
  selectedArchiveIds.delete(normalizedId);
  expandedMediaArchiveIds.delete(normalizedId);
  if (activeArchiveId === normalizedId) {
    activeArchiveId = null;
  }
  if (activeArchiveInlineEdit?.archiveId === normalizedId) {
    activeArchiveInlineEdit = null;
  }
  applyArchiveMutationState(state);
  setStatus(t("scrapbookStatusArchiveDeleted"));
}

async function updateArchiveNoteRequest(archiveId: string, noteText: string): Promise<void> {
  const normalizedId = archiveId.trim();
  if (!normalizedId) {
    return;
  }

  try {
    const state = await requestJson<BotSessionState>(`/api/public/bot/archive/${encodeURIComponent(normalizedId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ noteText })
    });
    editingArchiveId = null;
    applyArchiveMutationState(state);
    setStatus(uiText("메모가 저장되었습니다.", "Note saved."));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : uiText("메모 저장에 실패했습니다.", "Failed to save note."), true);
  }
}

async function updateArchiveTitleRequest(archiveId: string, title: string): Promise<void> {
  const normalizedId = archiveId.trim();
  if (!normalizedId) {
    return;
  }

  try {
    const state = await requestJson<BotSessionState>(`/api/public/bot/archive/${encodeURIComponent(normalizedId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title })
    });
    activeArchiveInlineEdit = null;
    applyArchiveMutationState(state);
    setStatus(uiText("제목이 저장되었습니다.", "Title saved."));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : uiText("제목 저장에 실패했습니다.", "Failed to save title."), true);
  }
}

async function updateArchiveTagsRequest(archiveId: string, rawTags: string): Promise<void> {
  const normalizedId = archiveId.trim();
  if (!normalizedId) {
    return;
  }

  try {
    const state = await requestJson<BotSessionState>(`/api/public/bot/archive/${encodeURIComponent(normalizedId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tags: parseArchiveTagEditorValue(rawTags) })
    });
    activeArchiveInlineEdit = null;
    applyArchiveMutationState(state);
    setStatus(uiText("태그가 저장되었습니다.", "Tags saved."));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : uiText("태그 저장에 실패했습니다.", "Failed to save tags."), true);
  }
}

async function archiveTrackedPostRequest(trackedPostId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/tracked-posts/${encodeURIComponent(trackedPostId)}/archive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  void refreshBootstrap().catch(() => undefined);
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
      searchType: formData.get("searchType")?.toString() ?? "recent",
      autoArchive: formData.get("autoArchive") === "on"
    })
  });
  searchForm.reset();
  const searchTypeSelect = searchForm.querySelector<HTMLSelectElement>("select[name='searchType']");
  if (searchTypeSelect) {
    searchTypeSelect.value = "recent";
  }
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
  void refreshBootstrap().catch(() => undefined);
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
  void refreshBootstrap().catch(() => undefined);
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

async function saveInsightsViewRequest(): Promise<void> {
  const snapshotDate = latestWorkspace?.insights.refreshedAt ? formatDate(latestWorkspace.insights.refreshedAt) : formatDate(new Date().toISOString());
  const name = uiText(
    "성과 카드 {date}",
    "Growth card {date}",
    {
      ja: "成長カード {date}",
      "pt-BR": "Cartão de crescimento {date}",
      es: "Tarjeta de crecimiento {date}",
      "zh-TW": "成長卡片 {date}",
      vi: "Thẻ tăng trưởng {date}"
    },
    { date: snapshotDate }
  );

  const model = buildInsightsCardModelFromCurrent(latestWorkspace);
  let insightProps = null;
  if (model) {
    const { score, tier } = calculateGrowthScore(model.insightsData);
    const highlight = selectHighlight(model.insightsData);
    insightProps = {
      highlightId: highlight.id,
      highlightParams: highlight.params,
      localeAtSave: typeof window !== "undefined" && document.documentElement.lang ? document.documentElement.lang : "en",
      tier,
      score
    };
  }

  const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/insights/views", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, insightProps })
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusInsightsViewSaved"));
}

async function deleteInsightsViewRequest(viewId: string): Promise<void> {
  const confirmed = window.confirm(t("scrapbookInsightsDeleteConfirm"));
  if (!confirmed) {
    return;
  }

  const workspace = await requestJson<ScrapbookPlusState>(`/api/public/bot/insights/views/${encodeURIComponent(viewId)}`, {
    method: "DELETE"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusInsightsViewDeleted"));
}

async function archiveInsightPostRequest(postId: string): Promise<void> {
  const workspace = await requestJson<ScrapbookPlusState>("/api/public/bot/insights/archive", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ postId })
  });
  applyWorkspaceState(workspace);
  void refreshBootstrap().catch(() => undefined);
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
    setWorkspaceTabsOpen(false);
  }
});

window.addEventListener("resize", () => {
  syncWorkspaceTabsVisibility(Boolean(latestState?.authenticated && latestState.user));
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
    latestWorkspace = null;
    if (latestConfig) {
      applySessionState(latestConfig, {
        authenticated: false,
        botHandle: latestConfig.botHandle,
        oauthConfigured: latestConfig.oauthConfigured,
        user: null,
        archives: [],
        saveStatus: null
      });
    }
    renderScopeStatus(null);
    renderWatchlists(null);
    renderSearches(null);
    renderInsights(null);
    renderPlanPanel();
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

workspaceTabTrigger?.addEventListener("click", () => {
  setWorkspaceTabsOpen(!workspaceTabTrigger?.getAttribute("aria-expanded") || workspaceTabTrigger.getAttribute("aria-expanded") === "false");
});

workspaceTabOverlay?.addEventListener("click", () => {
  setWorkspaceTabsOpen(false);
});

workspaceTabClose?.addEventListener("click", () => {
  setWorkspaceTabsOpen(false);
});

watchlistForm?.addEventListener("submit", (event) => {
  void submitWatchlist(event);
});

searchForm?.addEventListener("submit", (event) => {
  void submitSearch(event);
});

insightsRefresh?.addEventListener("click", () => {
  void refreshInsightsRequest();
});

insightsSaveView?.addEventListener("click", () => {
  void saveInsightsViewRequest();
});

insightsShareCard?.addEventListener("click", () => {
  const card = buildInsightsCardModelFromCurrent(latestWorkspace);
  if (card) {
    void shareInsightCard(card);
  }
});

saveStatusPlanClear?.addEventListener("click", () => {
  void clearPlusActivationRequest();
});

sessionPlanClear?.addEventListener("click", () => {
  void clearPlusActivationRequest();
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

archivesSearchToggle?.addEventListener("click", () => {
  archivesSearchExpanded = !archivesSearchExpanded;
  syncArchiveFilterControls();
  if (archivesSearchExpanded) {
    window.setTimeout(() => archivesSearchInput?.focus(), 0);
  }
});

archivesTagToggle?.addEventListener("click", () => {
  archivesTagExpanded = !archivesTagExpanded;
  syncArchiveFilterControls();
});

archivesSortToggle?.addEventListener("click", () => {
  toggleArchiveSortOrder();
});

archivesExportAll?.addEventListener("click", async () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }

  const exportTarget = promptArchiveExportTarget();
  if (!exportTarget) {
    return;
  }

  const exportItems = latestState.archives.filter((item) => selectedArchiveIds.has(item.id));
  const targetItems = exportItems.length > 0 ? exportItems : latestState.archives;
  const targetIds = targetItems.map((item) => item.id);

  if (exportTarget === "notion") {
    await exportArchivesNotion(targetIds);
    return;
  }

  if (exportTarget === "obsidian") {
    await exportArchivesObsidian(targetItems);
    return;
  }

  await exportArchivesZip(targetIds);
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
  archivesSearchExpanded = true;
  syncArchiveFilterControls();
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
hasAppliedSyncSnapshot = false;
setActiveTab("inbox");

void (async () => {
  try {
    await initializeScrapbook();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookStatusLoadFailed"), true);
    if (!hasAppliedSyncSnapshot) {
      authPanel?.classList.remove("hidden");
      archivesEmptyEl?.classList.remove("hidden");
    }
  } finally {
    finalizePendingConnectedStatus();
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
