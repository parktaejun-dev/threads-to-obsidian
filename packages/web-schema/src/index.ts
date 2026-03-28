export type OrderStatus = "pending" | "payment_confirmed" | "key_issued" | "cancelled";
export type LicenseStatus = "active" | "revoked";
export type DeliveryStatus = "not_sent" | "ready_to_send" | "sent";
export type LicenseActivationStatus = "active" | "released";
export type NotionConnectionStatus = "active" | "revoked";
export type NotionAuthSessionStatus = "pending" | "completed" | "expired";
export type NotionParentType = "page" | "data_source";
export type BotUserStatus = "active" | "disabled";
export type BotLoginTokenStatus = "pending" | "consumed" | "expired";
export type BotOauthSessionStatus = "pending" | "completed" | "expired" | "failed";
export type BotSessionStatus = "active" | "revoked" | "expired";
export type BotExtensionLinkSessionStatus = "pending" | "consumed" | "expired" | "revoked";
export type BotExtensionAccessTokenStatus = "active" | "revoked" | "expired";
export type BotArchiveStatus = "saved";
export type CloudArchiveStatus = "saved";
export type WatchlistStatus = "active" | "paused";
export type SearchMonitorStatus = "active" | "paused";
export type SearchResultStatus = "new" | "archived" | "dismissed";
export type TrackedPostOrigin = "watchlist" | "insight";
export type InsightSnapshotKind = "profile" | "post";
export type SavedViewStatus = "active";

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
}

export interface StorefrontSettings {
  productName: string;
  headline: string;
  subheadline: string;
  priceLabel: string;
  priceValue: string;
  supportEmail: string;
  includedUpdates: string;
  heroNotes: string[];
  faqs: StorefrontFaq[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  summary: string;
  instructions: string;
  actionLabel: string;
  actionUrl: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  buyerName: string;
  buyerEmail: string;
  paymentMethodId: string;
  paymentProvider?: string | null;
  paymentProviderEventId?: string | null;
  paymentReference?: string | null;
  status: OrderStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  issuedLicenseId: string | null;
  deliveryStatus: DeliveryStatus;
}

export interface LicenseRecord {
  id: string;
  orderId: string;
  holderName: string;
  holderEmail: string;
  token: string;
  tokenPreview: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  status: LicenseStatus;
}

export interface LicenseActivationRecord {
  id: string;
  licenseId: string | null;
  tokenHash: string;
  tokenPreview: string;
  holder: string | null;
  deviceId: string;
  deviceLabel: string;
  activatedAt: string;
  lastValidatedAt: string;
  releasedAt: string | null;
  status: LicenseActivationStatus;
}

export interface NotionConnectionRecord {
  id: string;
  tokenHash: string;
  licenseId: string | null;
  holder: string | null;
  deviceId: string;
  deviceLabel: string;
  workspaceId: string;
  workspaceName: string | null;
  workspaceIcon: string | null;
  botId: string;
  ownerUserId: string | null;
  ownerUserName: string | null;
  ownerUserEmail: string | null;
  accessTokenCiphertext: string;
  refreshTokenCiphertext: string | null;
  selectedParentType: NotionParentType | null;
  selectedParentId: string | null;
  selectedParentLabel: string | null;
  selectedParentUrl: string | null;
  connectedAt: string;
  updatedAt: string;
  revokedAt: string | null;
  status: NotionConnectionStatus;
}

export interface NotionAuthSessionRecord {
  id: string;
  tokenHash: string;
  licenseId: string | null;
  holder: string | null;
  deviceId: string;
  deviceLabel: string;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  status: NotionAuthSessionStatus;
}

export interface BotUserRecord {
  id: string;
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  biography: string | null;
  isVerified: boolean;
  accessTokenCiphertext: string | null;
  tokenExpiresAt: string | null;
  email: string | null;
  grantedScopes: string[];
  scopeVersion: number;
  lastScopeUpgradeAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  status: BotUserStatus;
}

export interface BotLoginTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  requestedHandle: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
  status: BotLoginTokenStatus;
}

export interface BotOauthSessionRecord {
  id: string;
  stateHash: string;
  pollTokenHash: string;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  activationCode: string | null;
  activationExpiresAt: string | null;
  linkedSessionToken: string | null;
  status: BotOauthSessionStatus;
}

export interface BotSessionRecord {
  id: string;
  userId: string;
  sessionHash: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
  status: BotSessionStatus;
}

export interface BotExtensionLinkSessionRecord {
  id: string;
  userId: string;
  state: string;
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
  revokedAt: string | null;
  status: BotExtensionLinkSessionStatus;
}

export interface BotExtensionAccessTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  linkedAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  status: BotExtensionAccessTokenStatus;
}

export interface BotArchiveRecord {
  id: string;
  userId: string;
  mentionId: string | null;
  mentionUrl: string;
  mentionAuthorHandle: string;
  mentionAuthorDisplayName: string | null;
  noteText: string | null;
  targetUrl: string;
  targetAuthorHandle: string | null;
  targetAuthorDisplayName: string | null;
  targetText: string;
  targetPublishedAt: string | null;
  mediaUrls: string[];
  markdownContent: string;
  rawPayloadJson: string | null;
  archivedAt: string;
  updatedAt: string;
  status: BotArchiveStatus;
}

export interface CloudArchiveRecord {
  id: string;
  userId: string;
  canonicalUrl: string;
  shortcode: string;
  targetAuthorHandle: string | null;
  targetAuthorDisplayName: string | null;
  targetTitle: string;
  targetText: string;
  targetPublishedAt: string | null;
  mediaUrls: string[];
  markdownContent: string;
  rawPayloadJson: string | null;
  contentHash: string;
  savedAt: string;
  updatedAt: string;
  status: CloudArchiveStatus;
}

export interface WatchlistRecord {
  id: string;
  userId: string;
  targetHandle: string;
  targetThreadsUserId: string | null;
  targetDisplayName: string | null;
  targetProfilePictureUrl: string | null;
  includeText: string;
  excludeText: string;
  mediaTypes: string[];
  autoArchive: boolean;
  digestCadence: "off" | "daily" | "weekly";
  lastCursor: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  status: WatchlistStatus;
}

export interface SearchMonitorRecord {
  id: string;
  userId: string;
  query: string;
  authorHandle: string | null;
  excludeHandles: string[];
  autoArchive: boolean;
  searchType: "top" | "recent";
  lastCursor: string | null;
  lastRunAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  status: SearchMonitorStatus;
}

export interface SearchResultRecord {
  id: string;
  userId: string;
  monitorId: string;
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
  archivedAt: string | null;
  dismissedAt: string | null;
  discoveredAt: string;
  updatedAt: string;
  rawPayloadJson: string | null;
  status: SearchResultStatus;
}

export interface TrackedPostRecord {
  id: string;
  userId: string;
  origin: TrackedPostOrigin;
  sourceId: string | null;
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
  archivedAt: string | null;
  discoveredAt: string;
  updatedAt: string;
  rawPayloadJson: string | null;
}

export interface InsightsSnapshotRecord {
  id: string;
  userId: string;
  kind: InsightSnapshotKind;
  externalPostId: string | null;
  canonicalUrl: string | null;
  title: string | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  quotes: number | null;
  views: number | null;
  followers: number | null;
  profileViews: number | null;
  capturedAt: string;
  rawPayloadJson: string | null;
}

export interface SavedViewRecord {
  id: string;
  userId: string;
  name: string;
  kind: "watchlist" | "search" | "insight";
  targetIds: string[];
  createdAt: string;
  updatedAt: string;
  status: SavedViewStatus;
}

export interface BotMentionSyncSummary {
  ok: boolean;
  reason: string | null;
  mode: string;
  fetchedPages: number;
  fetchedMentions: number;
  processedMentions: number;
  createdArchives: number;
  updatedArchives: number;
  unmatchedMentions: number;
  skippedExisting: number;
  skippedInvalid: number;
}

export type BotMentionJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "invalid"
  | "unmatched";

export interface BotMentionJobRecord {
  id: string;
  mentionId: string;
  mentionUrl: string | null;
  mentionAuthorHandle: string | null;
  mentionAuthorUserId: string | null;
  mentionText: string | null;
  mentionPublishedAt: string | null;
  rawSummaryJson: string | null;
  attempts: number;
  status: BotMentionJobStatus;
  lastError: string | null;
  availableAt: string;
  leasedAt: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BotMentionCollectorStatus {
  enabled: boolean;
  running: boolean;
  botHandle: string;
  pollIntervalMs: number;
  fetchLimit: number;
  maxPages: number;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastSucceededAt: string | null;
  lastError: string | null;
  lastSummary: BotMentionSyncSummary | null;
}

export interface RuntimeDatabaseConfig {
  backend: "file" | "postgres";
  filePath: string;
  postgresUrl: string;
  tableName: string;
  storeKey: string;
}

export interface RuntimeSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface RuntimeCollectorConfig {
  botHandle: string;
  accessTokenOverride: string;
  graphApiVersion: string;
  intervalMs: number;
  fetchLimit: number;
  maxPages: number;
}

export interface WebRuntimeConfig {
  publicOrigin: string;
  database: RuntimeDatabaseConfig;
  smtp: RuntimeSmtpConfig;
  collector: RuntimeCollectorConfig;
}

export interface AdminRuntimeConfigSecretState {
  databasePostgresUrlConfigured: boolean;
  smtpPassConfigured: boolean;
}

export interface AdminRuntimeConfigResponse {
  config: WebRuntimeConfig;
  activeDatabase: RuntimeDatabaseConfig;
  databaseRestartRequired: boolean;
  secretState: AdminRuntimeConfigSecretState;
}

export interface RuntimeConfigTestResult {
  ok: boolean;
  message: string;
}

export type AdminMonitoringStatus = "healthy" | "degraded" | "critical" | "unknown";
export type AdminMonitoringSeverity = "info" | "warning" | "critical";
export type AdminMonitoringChannel = "public_api" | "admin_api" | "collector" | "bot_account";
export type AdminMonitoringIncidentStatus = "new" | "acknowledged" | "resolved" | "muted";

export interface AdminMonitoringRunCheck {
  id: string;
  channel: AdminMonitoringChannel;
  label: string;
  status: AdminMonitoringStatus;
  severity: AdminMonitoringSeverity;
  summary: string;
  checkedAt: string;
}

export interface AdminMonitoringRunRecord {
  id: string;
  source: "internal";
  overallStatus: AdminMonitoringStatus;
  createdAt: string;
  summary: string;
  checks: AdminMonitoringRunCheck[];
}

export interface AdminMonitoringIncidentRecord {
  id: string;
  dedupeKey: string;
  channel: AdminMonitoringChannel;
  severity: AdminMonitoringSeverity;
  status: AdminMonitoringIncidentStatus;
  summary: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastRunId: string | null;
  mutedUntil: string | null;
  note: string | null;
}

export interface AdminMonitoringChannelState {
  id: AdminMonitoringChannel;
  label: string;
  status: AdminMonitoringStatus;
  summary: string;
  checkedAt: string | null;
}

export interface AdminMonitoringOverviewResponse {
  overallStatus: AdminMonitoringStatus;
  openIncidents: number;
  criticalIncidents: number;
  lastRunAt: string | null;
  lastHealthyRunAt: string | null;
  fallbackRatio: number;
  policyReviewPending: number;
  currentBotHandle: string;
  channels: AdminMonitoringChannelState[];
  recentRuns: AdminMonitoringRunRecord[];
}

export interface AdminHistoryEvent {
  id: string;
  kind:
    | "payment_method_created"
    | "payment_method_updated"
    | "order_created"
    | "order_paid"
    | "license_issued"
    | "license_revoked"
    | "webhook_processed"
    | "webhook_ignored"
    | "webhook_rejected";
  message: string;
  createdAt: string;
  orderId: string | null;
  paymentMethodId: string | null;
  licenseId: string | null;
  webhookProvider?: string | null;
  webhookEventId?: string | null;
  webhookReason?: string | null;
}

export interface WebDatabase {
  settings: StorefrontSettings;
  paymentMethods: PaymentMethod[];
  orders: PurchaseOrder[];
  licenses: LicenseRecord[];
  activations: LicenseActivationRecord[];
  notionConnections: NotionConnectionRecord[];
  notionAuthSessions: NotionAuthSessionRecord[];
  botUsers: BotUserRecord[];
  botLoginTokens: BotLoginTokenRecord[];
  botOauthSessions: BotOauthSessionRecord[];
  botSessions: BotSessionRecord[];
  botExtensionLinkSessions: BotExtensionLinkSessionRecord[];
  botExtensionAccessTokens: BotExtensionAccessTokenRecord[];
  botMentionJobs: BotMentionJobRecord[];
  botArchives: BotArchiveRecord[];
  cloudArchives: CloudArchiveRecord[];
  watchlists: WatchlistRecord[];
  searchMonitors: SearchMonitorRecord[];
  searchResults: SearchResultRecord[];
  trackedPosts: TrackedPostRecord[];
  insightsSnapshots: InsightsSnapshotRecord[];
  savedViews: SavedViewRecord[];
  history: AdminHistoryEvent[];
  monitorRuns: AdminMonitoringRunRecord[];
  monitorIncidents: AdminMonitoringIncidentRecord[];
}

export interface PublicStorefrontResponse {
  settings: StorefrontSettings;
  paymentMethods: PaymentMethod[];
}

export interface DashboardSummary {
  pendingOrders: number;
  paidOrders: number;
  issuedKeys: number;
  activePaymentMethods: number;
  webhookProcessed: number;
  webhookIgnored: number;
  webhookRejected: number;
  webhookDuplicates: number;
  deliveryReadyToSend: number;
  deliverySent: number;
}

export interface RevenueByMethod {
  methodId: string;
  methodName: string;
  orders: number;
  paid: number;
}

export interface RevenueByMonth {
  month: string;
  orders: number;
  issued: number;
}

export interface RevenueReport {
  totalOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  issuedKeys: number;
  revokedKeys: number;
  deliveryReadyToSend: number;
  deliverySent: number;
  estimatedRevenueUsd: number;
  priceUsd: number;
  byPaymentMethod: RevenueByMethod[];
  byMonth: RevenueByMonth[];
}

export interface AdminDashboardResponse extends PublicStorefrontResponse {
  orders: PurchaseOrder[];
  licenses: LicenseRecord[];
  history: AdminHistoryEvent[];
  summary: DashboardSummary;
  revenueReport: RevenueReport;
  mailerConfigured?: boolean;
  collectorStatus?: BotMentionCollectorStatus | null;
}

export interface EmailDeliveryDraft {
  to: string;
  subject: string;
  body: string;
}

export const DEFAULT_SETTINGS: StorefrontSettings = {
  productName: "Threads Saver",
  headline: "Threads 저장을 한 곳에서.",
  subheadline: "29달러 1회 결제로 Chrome extension Pro와 scrapbook core를 함께 씁니다. Discovery, Search, Insights는 cloud add-on으로 확장합니다.",
  priceLabel: "Threads Saver Pro",
  priceValue: "$29",
  supportEmail: "hello@oxcorp.ninja",
  includedUpdates: "1회 결제 · 7일 환불 · extension Pro + scrapbook core",
  heroNotes: [
    "Free: 현재 글 저장 · 이미지 포함 · 작성자 연속 답글",
    "Pro: 파일명 패턴 · 저장 경로 · AI 요약 · AI 태그 · scrapbook core",
    "Cloud add-on: Watchlists · Keyword search · Insights"
  ],
  faqs: [
    {
      id: "faq-1",
      question: "저장하려면 Pro가 필요한가요?",
      answer: "아니요. 저장, 이미지 포함, 연속 답글, 중복 건너뜀 모두 Free에서 가능합니다."
    },
    {
      id: "faq-2",
      question: "누가 Pro를 사면 좋나요?",
      answer: "저장할 때 파일명·경로 규칙을 직접 제어하고, 자신의 LLM 키로 요약·태그·frontmatter를 붙이고 싶은 분께 맞습니다."
    },
    {
      id: "faq-3",
      question: "요약이나 태그 같은 AI 정리는 되나요?",
      answer: "됩니다. Pro에서 OpenAI 호환 엔드포인트와 자신의 키를 넣으면 요약, 태그, 추가 frontmatter를 생성합니다."
    },
    {
      id: "faq-4",
      question: "Pro 키는 어떻게 전달되나요?",
      answer: "결제가 확인되면 Pro 키를 이메일로 보내드립니다."
    },
    {
      id: "faq-5",
      question: "환불 정책은 있나요?",
      answer: "구매 후 7일 내에 환불 요청을 보내면 확인 후 처리합니다."
    }
  ]
};

export function buildDefaultDatabase(now = new Date().toISOString()): WebDatabase {
  return {
    settings: DEFAULT_SETTINGS,
    paymentMethods: [
      {
        id: "pm-stableorder",
        name: "Stableorder",
        summary: "KRW-friendly checkout with card and transfer options",
        instructions: "Open the Stableorder checkout page, pay using the order email, and return with the paid confirmation.",
        actionLabel: "Pay with Stableorder",
        actionUrl: "https://stableorder.com/",
        enabled: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-stripe",
        name: "Stripe Checkout",
        summary: "Global card checkout",
        instructions: "Open Stripe checkout, complete payment, and make sure the paid email matches your order email.",
        actionLabel: "Pay with Stripe",
        actionUrl: "https://checkout.stripe.com/",
        enabled: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-paypal",
        name: "PayPal",
        summary: "PayPal checkout for international buyers",
        instructions: "Use the PayPal checkout link, complete payment, and reply with the order email used in the request.",
        actionLabel: "Pay with PayPal",
        actionUrl: "https://www.paypal.com/checkout/home",
        enabled: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      }
    ],
    orders: [],
    licenses: [],
    activations: [],
    notionConnections: [],
    notionAuthSessions: [],
    botUsers: [],
    botLoginTokens: [],
    botOauthSessions: [],
    botSessions: [],
    botExtensionLinkSessions: [],
    botExtensionAccessTokens: [],
    botMentionJobs: [],
    botArchives: [],
    cloudArchives: [],
    watchlists: [],
    searchMonitors: [],
    searchResults: [],
    trackedPosts: [],
    insightsSnapshots: [],
    savedViews: [],
    history: [],
    monitorRuns: [],
    monitorIncidents: []
  };
}

export const WORKSPACE_INFO = {
  kind: "schema-library",
  name: "@threads/web-schema"
} as const;
