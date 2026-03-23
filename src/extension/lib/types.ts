export interface ExtractorConfig {
  version: string;
  noisePatterns: string[];
  maxRecentSaves: number;
}

export interface ExtensionOptions {
  saveTarget: SaveTarget;
  filenamePattern: string;
  savePathPattern: string;
  includeImages: boolean;
  obsidianFolderLabel: string | null;
  notion: NotionSettings;
  aiOrganization: AiOrganizationSettings;
}

export const AI_PROVIDER_VALUES = ["openai", "openrouter", "deepseek", "gemini", "ollama", "custom"] as const;
export type AiProvider = (typeof AI_PROVIDER_VALUES)[number];

export type FrontmatterPrimitive = string | number | boolean | null;
export type FrontmatterValue = FrontmatterPrimitive | FrontmatterPrimitive[];

export interface AiOrganizationSettings {
  provider: AiProvider;
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
}

export interface AiOrganizationResult {
  summary: string | null;
  tags: string[];
  frontmatter: Record<string, FrontmatterValue>;
}

export type SaveTarget = "obsidian" | "notion";
export type NotionParentType = "page" | "data_source";

export interface NotionSettings {
  token: string;
  parentType: NotionParentType;
  parentPageId: string;
  dataSourceId: string;
  uploadMedia: boolean;
}

export type PlanTier = "free" | "pro";

export type LicenseState = "none" | "valid" | "invalid" | "expired";
export type LicenseActivationState = "none" | "active" | "required" | "seat_limit" | "revoked" | "offline";

export interface LicensePayload {
  plan: "pro";
  holder: string | null;
  issuedAt: string;
  expiresAt: string | null;
}

export interface PlanStatus {
  tier: PlanTier;
  licenseState: LicenseState;
  holder: string | null;
  expiresAt: string | null;
  activationState: LicenseActivationState;
  seatLimit: number | null;
  seatsUsed: number | null;
  deviceLabel: string | null;
  activatedAt: string | null;
}

export type SourceType = "text" | "image" | "video";

export interface AuthorReply {
  author: string;
  canonicalUrl: string;
  shortcode: string;
  text: string;
  publishedAt: string | null;
  sourceType: SourceType;
  imageUrls: string[];
  videoUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
}

export interface ExtractedPost {
  canonicalUrl: string;
  shortcode: string;
  author: string;
  title: string;
  text: string;
  publishedAt: string | null;
  capturedAt: string;
  sourceType: SourceType;
  imageUrls: string[];
  videoUrl: string | null;
  externalUrl: string | null;
  quotedPostUrl: string | null;
  repliedToUrl: string | null;
  thumbnailUrl: string | null;
  authorReplies: AuthorReply[];
  extractorVersion: string;
  contentHash: string;
}

export interface PackagedResult {
  blob: Blob;
  zipFilename: string;
  archiveName: string;
  warning: string | null;
}

export type SavedVia = "direct" | "zip" | "notion";

export interface RecentSave {
  id: string;
  saveTarget: SaveTarget;
  canonicalUrl: string;
  shortcode: string;
  author: string;
  title: string;
  downloadedAt: string;
  archiveName: string;
  contentHash: string;
  status: "complete" | "error";
  savedVia: SavedVia;
  savedRelativePath: string | null;
  remotePageId: string | null;
  remotePageUrl: string | null;
  warning: string | null;
  post: ExtractedPost;
}

export interface PopupState {
  supported: boolean;
  currentUrl: string | null;
  status: SaveStatus;
  recentSaves: RecentSave[];
}

export type SaveStatusKind = "idle" | "saving" | "unsupported" | "success" | "duplicate" | "error";

export interface SaveStatus {
  kind: SaveStatusKind;
  message: string;
  saveId?: string;
  canRetry?: boolean;
}

export interface ExtractPostRequest {
  type: "extract-post";
  config: ExtractorConfig;
}

export interface PingContentScriptRequest {
  type: "ping-content-script";
}

export interface SaveCurrentPostRequest {
  type: "save-current-post";
  allowDuplicate?: boolean;
  allowImageDownloads?: boolean;
  imageFallbackWarning?: string;
}

export interface RedownloadSaveRequest {
  type: "redownload-save";
  saveId: string;
  allowImageDownloads?: boolean;
  imageFallbackWarning?: string;
}

export interface DeleteRecentSaveRequest {
  type: "delete-recent-save";
  saveId: string;
}

export interface ClearRecentSavesRequest {
  type: "clear-recent-saves";
}

export interface GetPopupStateRequest {
  type: "get-popup-state";
}

export interface GetOptionsRequest {
  type: "get-options";
}

export interface UpdateOptionsRequest {
  type: "update-options";
  options: ExtensionOptions;
}

export interface ExtractCurrentPostRequest {
  type: "extract-current-post";
}

export type PopupRequest =
  | SaveCurrentPostRequest
  | RedownloadSaveRequest
  | DeleteRecentSaveRequest
  | ClearRecentSavesRequest
  | GetPopupStateRequest
  | GetOptionsRequest
  | UpdateOptionsRequest
  | ExtractCurrentPostRequest;
