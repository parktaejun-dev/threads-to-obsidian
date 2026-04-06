import type {
  MobileSaveArchiveRecord,
  MobileSaveNotionParentType,
  MobileSavePairingStatus
} from "@threads/shared/mobile-save";

export interface MobileSaveDeviceRecord {
  id: string;
  secretHash: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  activeBindingId: string | null;
}

export interface MobileSavePairingRecord {
  id: string;
  deviceId: string;
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
  pairedAt: string | null;
  mentionId: string | null;
  mentionUrl: string | null;
  threadsUserId: string | null;
  threadsHandle: string | null;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  status: MobileSavePairingStatus;
}

export interface MobileSaveBindingRecord {
  id: string;
  deviceId: string;
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  pairedAt: string;
  active: boolean;
  replacedAt: string | null;
}

export interface MobileSaveStoredArchiveRecord extends MobileSaveArchiveRecord {
  deviceId: string;
  bindingId: string;
  threadsUserId: string | null;
  threadsHandle: string;
}

export interface MobileSaveProcessedMentionRecord {
  mentionId: string;
  mentionUrl: string | null;
  outcome: "paired" | "saved" | "duplicate" | "ignored" | "invalid";
  processedAt: string;
}

export interface MobileSaveNotionAuthSessionRecord {
  id: string;
  deviceId: string;
  bindingId: string;
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  status: "pending" | "completed" | "expired";
}

export interface MobileSaveNotionConnectionRecord {
  id: string;
  deviceId: string;
  bindingId: string;
  threadsUserId: string | null;
  threadsHandle: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceIcon: string | null;
  botId: string;
  accessToken: string;
  refreshToken: string | null;
  selectedParentType: MobileSaveNotionParentType | null;
  selectedParentId: string | null;
  selectedParentLabel: string | null;
  selectedParentUrl: string | null;
  connectedAt: string;
  updatedAt: string;
  revokedAt: string | null;
  status: "active" | "revoked";
}

export interface MobileSaveDatabase {
  devices: MobileSaveDeviceRecord[];
  pairings: MobileSavePairingRecord[];
  bindings: MobileSaveBindingRecord[];
  archives: MobileSaveStoredArchiveRecord[];
  processedMentions: MobileSaveProcessedMentionRecord[];
  notionAuthSessions: MobileSaveNotionAuthSessionRecord[];
  notionConnections: MobileSaveNotionConnectionRecord[];
}

export interface MobileSaveCollectorConfig {
  botHandle: string;
  accessToken: string;
  pairingPostUrl: string;
  graphApiVersion: string;
  intervalMs: number;
  fetchLimit: number;
  maxPages: number;
}

export interface MobileSaveCollectorSummary {
  ok: boolean;
  reason: string | null;
  fetchedMentions: number;
  pairedDevices: number;
  savedArchives: number;
  updatedArchives: number;
  ignoredMentions: number;
  invalidMentions: number;
}

export interface MobileSaveCollectorStatus {
  enabled: boolean;
  running: boolean;
  botHandle: string;
  pairingPostUrl: string;
  pollIntervalMs: number;
  fetchLimit: number;
  maxPages: number;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastError: string | null;
  lastSummary: MobileSaveCollectorSummary | null;
}
