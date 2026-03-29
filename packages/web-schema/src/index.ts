export type OrderStatus = "pending" | "payment_confirmed" | "key_issued" | "cancelled";
export type LicenseStatus = "active" | "revoked";
export type DeliveryStatus = "not_sent" | "ready_to_send" | "sent";
export type BillingCycle = "monthly" | "yearly";
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
  billingCycle?: BillingCycle | null;
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
  plusLicenseId?: string | null;
  plusActivatedAt?: string | null;
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

export interface SavedViewInsightProps {
  highlightId: string;
  highlightParams: Record<string, string | number>;
  localeAtSave: string;
  tier: string;
  score: number;
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
  insightProps?: SavedViewInsightProps | null;
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
  requestMetrics: RequestMetricsSummary;
  channels: AdminMonitoringChannelState[];
  recentRuns: AdminMonitoringRunRecord[];
}

export type WebhookEventStatus = "received" | "processed" | "ignored" | "rejected";

export interface WebhookEventRecord {
  id: string;
  provider: string;
  eventId: string;
  dedupeKey: string;
  payloadHash: string;
  orderId: string | null;
  paymentMethodId: string | null;
  licenseId: string | null;
  status: WebhookEventStatus;
  reason: string | null;
  attempts: number;
  firstSeenAt: string;
  lastSeenAt: string;
  handledAt: string | null;
  responseStatusCode: number | null;
}

export type RequestLogCategory = "admin_api" | "extension_api" | "public_api" | "webhook" | "health";

export interface RequestLogRecord {
  id: string;
  requestId: string;
  method: string;
  pathname: string;
  category: RequestLogCategory;
  statusCode: number;
  durationMs: number;
  startedAt: string;
  completedAt: string;
}

export interface RequestMetricsSummary {
  totalRequests: number;
  lastHourRequests: number;
  successResponses: number;
  clientErrors: number;
  serverErrors: number;
  rateLimitedResponses: number;
  webhookRequests: number;
  adminRequests: number;
  averageDurationMs: number;
  p95DurationMs: number;
  lastRequestAt: string | null;
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
  webhookEvents: WebhookEventRecord[];
  requestLogs: RequestLogRecord[];
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
  webhookEvents: WebhookEventRecord[];
  recentRequests: RequestLogRecord[];
  requestMetrics: RequestMetricsSummary;
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
  productName: "ss-threads",
  headline: "Threads 글 저장을 편하게,\nPC는 extension, 모바일은 @mention",
  subheadline: "",
  priceLabel: "ss-threads Plus",
  priceValue: "US$19.99",
  supportEmail: "hello@oxcorp.ninja",
  includedUpdates: "Free는 저장글 100개와 폴더 5개. Plus는 1,000개와 50개, 관심 계정과 반응 보기.",
  heroNotes: [
    "PC는 설치 후 바로 저장",
    "모바일은 댓글 한 줄로 스크랩북에 저장",
    "저장한 글은 태그와 검색으로 다시 찾기"
  ],
  faqs: [
    {
      id: "faq-1",
      question: "저장하려면 Plus가 필요한가요?",
      answer: "아니요. Free에서도 저장과 검색, 태그 정리를 쓸 수 있습니다. Plus는 저장 공간과 보기 범위를 넓혀 주는 선택지입니다."
    },
    {
      id: "faq-2",
      question: "누가 Plus를 쓰면 좋나요?",
      answer: "저장글이 100개를 넘기 시작하거나, 폴더를 더 쓰고 싶거나, 관심 계정과 반응 보기까지 같이 쓰고 싶은 사용자에게 맞습니다."
    },
    {
      id: "faq-3",
      question: "Plus에서는 뭐가 달라지나요?",
      answer: "저장글 1,000개, 폴더 50개까지 넓어지고 관심 계정과 반응 보기가 열립니다. 같은 키를 확장에도 연결할 수 있습니다."
    },
    {
      id: "faq-4",
      question: "Plus 키는 어떻게 전달되나요?",
      answer: "결제가 확인되면 보통 30분 안에 Plus 키를 이메일로 보내드립니다."
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
        summary: "Card and transfer checkout",
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
    webhookEvents: [],
    requestLogs: [],
    history: [],
    monitorRuns: [],
    monitorIncidents: []
  };
}

export const WORKSPACE_INFO = {
  kind: "schema-library",
  name: "@threads/web-schema"
} as const;
