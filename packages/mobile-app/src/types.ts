export type PairingStatus = "pending" | "paired" | "expired";

export interface DeviceRegistration {
  deviceId: string;
  deviceSecret: string;
  createdAt: string;
}

export interface PairingSession {
  pairingId: string;
  pairingCode: string;
  expiresAt: string;
  botHandle: string;
  pairingPostUrl: string;
  status: PairingStatus;
}

export interface PairBinding {
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  pairedAt: string;
  active: boolean;
}

export interface AuthorReply {
  author: string;
  canonicalUrl: string;
  shortcode: string;
  text: string;
  publishedAt: string | null;
  sourceType: "text" | "image" | "video";
  imageUrls: string[];
  videoUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
}

export interface ArchiveRecord {
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
  sourceType: "text" | "image" | "video";
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

export interface SyncCursor {
  cursor: string | null;
  updatedAt: string | null;
}

export interface MediaCacheRecord {
  id: string;
  archiveId: string;
  remoteUrl: string;
  localUri: string | null;
  status: "pending" | "cached" | "failed";
  updatedAt: string;
}

export interface ArchiveOverride {
  archiveId: string;
  customTitle: string | null;
  noteText: string | null;
  tags: string[];
  updatedAt: string;
}

export interface FolderEntry {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportState {
  lastMarkdownExportAt: string | null;
  lastZipExportAt: string | null;
  lastObsidianExportAt: string | null;
  notionUploadMedia: boolean;
  notionPanelOpen: boolean;
  obsidianDirectoryUri: string | null;
  obsidianDirectoryLabel: string | null;
}

export type NotionParentType = "page" | "data_source";

export interface NotionConnectionSummary {
  connected: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceIcon: string | null;
  selectedParentType: NotionParentType | null;
  selectedParentId: string | null;
  selectedParentLabel: string | null;
  selectedParentUrl: string | null;
}

export interface NotionLocationOption {
  id: string;
  type: NotionParentType;
  label: string;
  url: string;
  subtitle: string | null;
}

export interface NotionAuthStartResponse {
  authorizeUrl: string;
  sessionId: string;
  expiresAt: string;
  connection: NotionConnectionSummary;
}

export interface NotionExportPage {
  archiveId: string | null;
  canonicalUrl: string;
  title: string;
  pageId: string;
  pageUrl: string | null;
  warning: string | null;
}

export interface NotionExportResult {
  results: NotionExportPage[];
  warning: string | null;
}

export interface NotionArchiveExportInput {
  archiveId: string | null;
  title: string;
  canonicalUrl: string;
  author: string;
  text: string;
  markdownContent: string;
  shortcode: string;
  publishedAt: string | null;
  capturedAt: string;
  authorReplies: AuthorReply[];
  imageUrls: string[];
  videoUrl: string | null;
  thumbnailUrl: string | null;
  externalUrl: string | null;
  quotedPostUrl: string | null;
  repliedToUrl: string | null;
  sourceType: "text" | "image" | "video";
  savedAt: string;
  updatedAt: string;
}

export interface ArchiveView extends ArchiveRecord {
  displayTitle: string;
  noteText: string | null;
  tags: string[];
  folderId: string | null;
  folderName: string | null;
  overrideUpdatedAt: string | null;
}
