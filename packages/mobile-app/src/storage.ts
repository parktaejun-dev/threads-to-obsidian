import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";

import type {
  ArchiveOverride,
  ArchiveRecord,
  DeviceRegistration,
  ExportState,
  FolderEntry,
  MediaCacheRecord,
  PairBinding,
  PairingSession,
  SyncCursor
} from "./types";

const DEVICE_REGISTRATION_KEY = "mobile-save-device-registration";
const STATE_PAIRING_KEY = "pairing-session";
const STATE_BINDING_KEY = "pair-binding";
const STATE_SYNC_CURSOR_KEY = "sync-cursor";
const STATE_ARCHIVE_OVERRIDES_KEY = "archive-overrides";
const STATE_FOLDERS_KEY = "folders";
const STATE_FOLDER_MAP_KEY = "folder-map";
const STATE_EXPORT_STATE_KEY = "export-state";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function createRandomId(): string {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createRandomSecret(): string {
  return Array.from({ length: 40 }, () => Math.floor(Math.random() * 36).toString(36)).join("");
}

function buildDefaultExportState(): ExportState {
  return {
    lastMarkdownExportAt: null,
    lastZipExportAt: null,
    lastObsidianExportAt: null,
    notionUploadMedia: true,
    notionPanelOpen: false,
    obsidianDirectoryUri: null,
    obsidianDirectoryLabel: null
  };
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await SQLite.openDatabaseAsync("threads-mobile-save.db");
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY NOT NULL,
          value_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS archives (
          id TEXT PRIMARY KEY NOT NULL,
          saved_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          payload_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS media_cache (
          id TEXT PRIMARY KEY NOT NULL,
          archive_id TEXT NOT NULL,
          remote_url TEXT NOT NULL UNIQUE,
          local_uri TEXT,
          status TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      return database;
    })();
  }

  return await dbPromise;
}

async function readStateValue<T>(key: string): Promise<T | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value_json: string }>("SELECT value_json FROM app_state WHERE key = ?", [key]);
  if (!row?.value_json) {
    return null;
  }

  return JSON.parse(row.value_json) as T;
}

async function writeStateValue(key: string, value: unknown): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO app_state (key, value_json) VALUES (?, ?)",
    [key, JSON.stringify(value)]
  );
}

async function deleteStateValue(key: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM app_state WHERE key = ?", [key]);
}

export async function getOrCreateDeviceRegistration(): Promise<DeviceRegistration> {
  const stored = await SecureStore.getItemAsync(DEVICE_REGISTRATION_KEY);
  if (stored) {
    return JSON.parse(stored) as DeviceRegistration;
  }

  const created: DeviceRegistration = {
    deviceId: createRandomId(),
    deviceSecret: createRandomSecret(),
    createdAt: new Date().toISOString()
  };
  await SecureStore.setItemAsync(DEVICE_REGISTRATION_KEY, JSON.stringify(created));
  return created;
}

export async function savePairingSession(session: PairingSession | null): Promise<void> {
  if (!session) {
    await deleteStateValue(STATE_PAIRING_KEY);
    return;
  }
  await writeStateValue(STATE_PAIRING_KEY, session);
}

export async function loadPairingSession(): Promise<PairingSession | null> {
  return await readStateValue<PairingSession>(STATE_PAIRING_KEY);
}

export async function savePairBinding(binding: PairBinding | null): Promise<void> {
  if (!binding) {
    await deleteStateValue(STATE_BINDING_KEY);
    return;
  }
  await writeStateValue(STATE_BINDING_KEY, binding);
}

export async function loadPairBinding(): Promise<PairBinding | null> {
  return await readStateValue<PairBinding>(STATE_BINDING_KEY);
}

export async function saveSyncCursor(cursor: SyncCursor): Promise<void> {
  await writeStateValue(STATE_SYNC_CURSOR_KEY, cursor);
}

export async function loadSyncCursor(): Promise<SyncCursor> {
  return (await readStateValue<SyncCursor>(STATE_SYNC_CURSOR_KEY)) ?? { cursor: null, updatedAt: null };
}

export async function upsertArchives(items: ArchiveRecord[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const database = await getDatabase();
  for (const item of items) {
    await database.runAsync(
      "INSERT OR REPLACE INTO archives (id, saved_at, updated_at, payload_json) VALUES (?, ?, ?, ?)",
      [item.id, item.savedAt, item.updatedAt, JSON.stringify(item)]
    );
  }
}

export async function listArchives(): Promise<ArchiveRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ payload_json: string }>(
    "SELECT payload_json FROM archives ORDER BY saved_at DESC, id DESC"
  );
  return rows.map((row: { payload_json: string }) => JSON.parse(row.payload_json) as ArchiveRecord);
}

export async function loadArchiveOverrides(): Promise<Record<string, ArchiveOverride>> {
  return (await readStateValue<Record<string, ArchiveOverride>>(STATE_ARCHIVE_OVERRIDES_KEY)) ?? {};
}

export async function saveArchiveOverride(
  archiveId: string,
  patch: Partial<Pick<ArchiveOverride, "customTitle" | "noteText" | "tags">>
): Promise<ArchiveOverride> {
  const current = await loadArchiveOverrides();
  const existing = current[archiveId];
  const next: ArchiveOverride = {
    archiveId,
    customTitle: patch.customTitle ?? existing?.customTitle ?? null,
    noteText: patch.noteText ?? existing?.noteText ?? null,
    tags: patch.tags ?? existing?.tags ?? [],
    updatedAt: new Date().toISOString()
  };
  current[archiveId] = next;
  await writeStateValue(STATE_ARCHIVE_OVERRIDES_KEY, current);
  return next;
}

export async function loadFolders(): Promise<FolderEntry[]> {
  return (await readStateValue<FolderEntry[]>(STATE_FOLDERS_KEY)) ?? [];
}

export async function createFolder(name: string): Promise<FolderEntry> {
  const folders = await loadFolders();
  const now = new Date().toISOString();
  const folder: FolderEntry = {
    id: createRandomId(),
    name,
    createdAt: now,
    updatedAt: now
  };
  folders.push(folder);
  await writeStateValue(STATE_FOLDERS_KEY, folders);
  return folder;
}

export async function renameFolder(folderId: string, name: string): Promise<void> {
  const folders = await loadFolders();
  const nextFolders = folders.map((folder) =>
    folder.id === folderId
      ? {
          ...folder,
          name,
          updatedAt: new Date().toISOString()
        }
      : folder
  );
  await writeStateValue(STATE_FOLDERS_KEY, nextFolders);
}

export async function deleteFolder(folderId: string): Promise<void> {
  const folders = await loadFolders();
  await writeStateValue(
    STATE_FOLDERS_KEY,
    folders.filter((folder) => folder.id !== folderId)
  );

  const folderMap = await loadFolderMap();
  const nextFolderMap = { ...folderMap };
  for (const [archiveId, mappedFolderId] of Object.entries(nextFolderMap)) {
    if (mappedFolderId === folderId) {
      delete nextFolderMap[archiveId];
    }
  }
  await writeStateValue(STATE_FOLDER_MAP_KEY, nextFolderMap);
}

export async function loadFolderMap(): Promise<Record<string, string>> {
  return (await readStateValue<Record<string, string>>(STATE_FOLDER_MAP_KEY)) ?? {};
}

export async function setArchiveFolder(archiveId: string, folderId: string | null): Promise<void> {
  const folderMap = await loadFolderMap();
  const nextFolderMap = { ...folderMap };
  if (folderId) {
    nextFolderMap[archiveId] = folderId;
  } else {
    delete nextFolderMap[archiveId];
  }
  await writeStateValue(STATE_FOLDER_MAP_KEY, nextFolderMap);
}

export async function loadExportState(): Promise<ExportState> {
  return {
    ...buildDefaultExportState(),
    ...((await readStateValue<ExportState>(STATE_EXPORT_STATE_KEY)) ?? {})
  };
}

export async function saveExportState(nextState: Partial<ExportState>): Promise<ExportState> {
  const merged = {
    ...(await loadExportState()),
    ...nextState
  };
  await writeStateValue(STATE_EXPORT_STATE_KEY, merged);
  return merged;
}

export async function saveMediaCache(records: MediaCacheRecord[]): Promise<void> {
  if (records.length === 0) {
    return;
  }

  const database = await getDatabase();
  for (const record of records) {
    await database.runAsync(
      "INSERT OR REPLACE INTO media_cache (id, archive_id, remote_url, local_uri, status, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [record.id, record.archiveId, record.remoteUrl, record.localUri, record.status, record.updatedAt]
    );
  }
}

export async function upsertMediaCacheRecord(record: MediaCacheRecord): Promise<void> {
  await saveMediaCache([record]);
}

export async function loadMediaCacheRecord(remoteUrl: string): Promise<MediaCacheRecord | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ payload_json?: string } & MediaCacheRecord>(
    "SELECT id, archive_id as archiveId, remote_url as remoteUrl, local_uri as localUri, status, updated_at as updatedAt FROM media_cache WHERE remote_url = ?",
    [remoteUrl]
  );
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    archiveId: row.archiveId,
    remoteUrl: row.remoteUrl,
    localUri: row.localUri,
    status: row.status,
    updatedAt: row.updatedAt
  };
}

export async function listMediaCacheRecordsForArchive(archiveId: string): Promise<MediaCacheRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<MediaCacheRecord & { archiveId: string; remoteUrl: string; localUri: string | null; updatedAt: string }>(
    "SELECT id, archive_id as archiveId, remote_url as remoteUrl, local_uri as localUri, status, updated_at as updatedAt FROM media_cache WHERE archive_id = ? ORDER BY updated_at DESC, id DESC",
    [archiveId]
  );
  return rows.map((row) => ({
    id: row.id,
    archiveId: row.archiveId,
    remoteUrl: row.remoteUrl,
    localUri: row.localUri,
    status: row.status,
    updatedAt: row.updatedAt
  }));
}
