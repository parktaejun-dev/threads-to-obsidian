import type { AuthorReply, SourceType } from "./types";

export type MobileSavePairingStatus = "pending" | "paired" | "expired";

export interface MobileSaveDeviceRegistration {
  deviceId: string;
  deviceSecret: string;
  createdAt: string;
}

export interface MobileSavePairBinding {
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  pairedAt: string;
  active: boolean;
}

export interface MobileSaveAccountSummary {
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
}

export interface MobileSavePairingStartRequest {
  deviceId: string;
  deviceSecret: string;
  deviceLabel?: string | null;
}

export interface MobileSavePairingStartResponse {
  pairingId: string;
  pairingCode: string;
  expiresAt: string;
  botHandle: string;
  pairingPostUrl: string;
  status: "pending";
}

export interface MobileSavePairingStatusResponse {
  pairingId: string;
  status: MobileSavePairingStatus;
  expiresAt: string;
  pairedAt: string | null;
  pairedAccount: MobileSaveAccountSummary | null;
}

export type MobileSaveNotionParentType = "page" | "data_source";

export interface MobileSaveNotionConnectionSummary {
  connected: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceIcon: string | null;
  selectedParentType: MobileSaveNotionParentType | null;
  selectedParentId: string | null;
  selectedParentLabel: string | null;
  selectedParentUrl: string | null;
  displayName: string | null;
  threadsHandle: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
}

export interface MobileSaveNotionLocationOption {
  id: string;
  type: MobileSaveNotionParentType;
  label: string;
  url: string;
  subtitle: string | null;
}

export interface MobileSaveNotionAuthStartResponse {
  authorizeUrl: string;
  sessionId: string;
  expiresAt: string;
  connection: MobileSaveNotionConnectionSummary;
}

export interface MobileSaveNotionLocationSearchRequest {
  query: string;
  parentType: MobileSaveNotionParentType;
}

export interface MobileSaveNotionLocationSelectRequest {
  parentType: MobileSaveNotionParentType;
  targetId: string;
  targetLabel: string;
  targetUrl: string;
}

export interface MobileSaveNotionExportItemInput {
  archiveId?: string | null;
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
  markdownContent: string;
  savedAt: string;
  updatedAt: string;
}

export interface MobileSaveNotionExportRequest {
  items: MobileSaveNotionExportItemInput[];
  archiveIds?: string[];
  includeImages: boolean;
  uploadMedia: boolean;
}

export interface MobileSaveNotionExportItemResult {
  archiveId: string | null;
  canonicalUrl: string;
  pageId: string;
  pageUrl: string;
  title: string;
  warning: string | null;
}

export interface MobileSaveNotionExportResponse {
  results: MobileSaveNotionExportItemResult[];
  warning: string | null;
}

export interface MobileSaveArchiveRecord {
  id: string;
  mentionId: string;
  mentionUrl: string | null;
  sourceMentionText: string | null;
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
  markdownContent: string;
  savedAt: string;
  updatedAt: string;
}

export interface MobileSaveArchiveSyncResponse {
  items: MobileSaveArchiveRecord[];
  nextCursor: string | null;
}

export interface MobileSaveSyncCursor {
  cursor: string | null;
  updatedAt: string | null;
}

export interface MobileSaveMediaCacheRecord {
  id: string;
  archiveId: string;
  remoteUrl: string;
  localUri: string | null;
  status: "pending" | "cached" | "failed";
  updatedAt: string;
}
