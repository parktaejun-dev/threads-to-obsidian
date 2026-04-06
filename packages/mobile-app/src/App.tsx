import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";

import {
  disconnectNotion,
  exportArchivesToNotion,
  getNotionConnection,
  getPairingStatus,
  searchNotionLocations,
  selectNotionLocation,
  startNotionOAuth,
  startPairing,
  syncArchives
} from "./api";
import {
  buildInitials,
  filterArchiveViews,
  formatTagInput,
  mapArchiveViews,
  parseTagInput,
  summarizeFolderCounts,
  summarizeTags,
  toNotionArchiveExportInput
} from "./archive-utils";
import {
  copyArchiveMarkdown,
  exportArchiveMarkdown,
  exportArchivesToObsidian,
  exportArchivesZip,
  getObsidianDirectoryLabel,
  pickObsidianDirectory
} from "./export";
import {
  createFolder,
  deleteFolder,
  getOrCreateDeviceRegistration,
  listArchives,
  loadArchiveOverrides,
  loadExportState,
  loadFolderMap,
  loadFolders,
  loadPairBinding,
  loadPairingSession,
  loadSyncCursor,
  saveArchiveOverride,
  saveExportState,
  savePairBinding,
  savePairingSession,
  saveSyncCursor,
  setArchiveFolder,
  upsertArchives
} from "./storage";
import type {
  ArchiveOverride,
  ArchiveView,
  ExportState,
  FolderEntry,
  NotionConnectionSummary,
  NotionLocationOption,
  NotionParentType,
  PairBinding,
  PairingSession
} from "./types";

const APP_LOGO = require("../assets/logo.png");

interface EditorDraft {
  title: string;
  noteText: string;
  tags: string;
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

function isExpired(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return false;
  }

  return time <= Date.now();
}

function getPairingState(
  binding: PairBinding | null,
  pairingSession: PairingSession | null
): "paired" | "pending" | "expired" | "unpaired" {
  if (binding) {
    return "paired";
  }

  if (!pairingSession) {
    return "unpaired";
  }

  if (pairingSession.status === "expired" || isExpired(pairingSession.expiresAt)) {
    return "expired";
  }

  return pairingSession.status;
}

function formatPairingState(value: "paired" | "pending" | "expired" | "unpaired"): string {
  switch (value) {
    case "paired":
      return "paired";
    case "pending":
      return "pending";
    case "expired":
      return "expired";
    default:
      return "unpaired";
  }
}

function toBindingFromStatus(status: Awaited<ReturnType<typeof getPairingStatus>>): PairBinding | null {
  if (status.status !== "paired" || !status.pairedAccount) {
    return null;
  }

  return {
    threadsUserId: status.pairedAccount.threadsUserId,
    threadsHandle: status.pairedAccount.threadsHandle,
    displayName: status.pairedAccount.displayName,
    profilePictureUrl: status.pairedAccount.profilePictureUrl,
    isVerified: status.pairedAccount.isVerified,
    pairedAt: status.pairedAt ?? new Date().toISOString(),
    active: true
  };
}

function buildEditorDraft(item: ArchiveView): EditorDraft {
  return {
    title: item.displayTitle,
    noteText: item.noteText ?? "",
    tags: formatTagInput(item.tags)
  };
}

function StatusChip({ label, tone = "default" }: { label: string; tone?: "default" | "active" | "warning" | "muted" }) {
  return (
    <View
      style={[
        styles.statusChip,
        tone === "active" ? styles.statusChipActive : null,
        tone === "warning" ? styles.statusChipWarning : null,
        tone === "muted" ? styles.statusChipMuted : null
      ]}
    >
      <Text
        style={[
          styles.statusChipText,
          tone === "active" ? styles.statusChipTextActive : null,
          tone === "warning" ? styles.statusChipTextWarning : null
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function App() {
  const [archives, setArchives] = useState<ArchiveView[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ArchiveOverride>>({});
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [folderMap, setFolderMap] = useState<Record<string, string>>({});
  const [exportState, setExportState] = useState<ExportState | null>(null);
  const [pairingSession, setPairingSession] = useState<PairingSession | null>(null);
  const [binding, setBinding] = useState<PairBinding | null>(null);
  const [notionConnection, setNotionConnection] = useState<NotionConnectionSummary | null>(null);
  const [notionParentType, setNotionParentType] = useState<NotionParentType>("page");
  const [notionQuery, setNotionQuery] = useState("");
  const [notionResults, setNotionResults] = useState<NotionLocationOption[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, EditorDraft>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const hydrate = async (): Promise<void> => {
    setLoading(true);

    try {
      const [storedArchives, storedPairing, storedBinding, storedSyncCursor, storedOverrides, storedFolders, storedFolderMap, storedExportState] =
        await Promise.all([
          listArchives(),
          loadPairingSession(),
          loadPairBinding(),
          loadSyncCursor(),
          loadArchiveOverrides(),
          loadFolders(),
          loadFolderMap(),
          loadExportState()
        ]);
      const nextPairing =
        storedPairing && !storedBinding && storedPairing.status !== "paired" && isExpired(storedPairing.expiresAt)
          ? { ...storedPairing, status: "expired" as const }
          : storedPairing;

      setArchives(mapArchiveViews(storedArchives, storedOverrides, storedFolderMap, storedFolders));
      setPairingSession(nextPairing);
      setBinding(storedBinding);
      setOverrides(storedOverrides);
      setFolders(storedFolders);
      setFolderMap(storedFolderMap);
      setExportState(storedExportState);
      setLastSyncedAt(storedSyncCursor.updatedAt);

      if (nextPairing?.status === "expired" && storedPairing?.status !== "expired") {
        await savePairingSession(nextPairing);
      }

      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load local data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void hydrate();
  }, []);

  const selectionIds = useMemo(
    () => Object.keys(selectedIds).filter((id) => selectedIds[id]),
    [selectedIds]
  );

  const filteredArchives = useMemo(() => {
    return filterArchiveViews(archives, {
      query,
      activeTag,
      activeFolderId
    });
  }, [activeFolderId, activeTag, archives, query]);

  const tagSummary = useMemo(() => {
    const scoped = activeFolderId ? archives.filter((item) => item.folderId === activeFolderId) : archives;
    return summarizeTags(scoped);
  }, [activeFolderId, archives]);

  const folderCounts = useMemo(() => summarizeFolderCounts(archives), [archives]);

  const selectedArchives = useMemo(
    () => archives.filter((item) => selectionIds.includes(item.id)),
    [archives, selectionIds]
  );

  const pairingState = getPairingState(binding, pairingSession);

  async function reloadArchiveState(): Promise<void> {
    const [storedArchives, storedOverrides, storedFolders, storedFolderMap] = await Promise.all([
      listArchives(),
      loadArchiveOverrides(),
      loadFolders(),
      loadFolderMap()
    ]);
    setOverrides(storedOverrides);
    setFolders(storedFolders);
    setFolderMap(storedFolderMap);
    setArchives(mapArchiveViews(storedArchives, storedOverrides, storedFolderMap, storedFolders));
  }

  async function reloadNotionState(): Promise<void> {
    if (!binding) {
      setNotionConnection(null);
      return;
    }

    try {
      const device = await getOrCreateDeviceRegistration();
      const connection = await getNotionConnection(device);
      setNotionConnection(connection);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not refresh Notion state.");
    }
  }

  async function refreshArchivesFromServer(): Promise<void> {
    const device = await getOrCreateDeviceRegistration();
    const currentCursor = await loadSyncCursor();
    const result = await syncArchives(device, currentCursor.cursor);

    if (result.items.length > 0) {
      await upsertArchives(result.items);
    }

    await saveSyncCursor({
      cursor: result.nextCursor,
      updatedAt: new Date().toISOString()
    });
    setLastSyncedAt(new Date().toISOString());
    await reloadArchiveState();
  }

  async function refreshPairing(): Promise<void> {
    if (!pairingSession) {
      return;
    }

    const device = await getOrCreateDeviceRegistration();
    const status = await getPairingStatus(device, pairingSession.pairingId);

    if (status.status === "expired") {
      const expiredSession = {
        ...pairingSession,
        status: "expired" as const,
        expiresAt: status.expiresAt
      };
      setPairingSession(expiredSession);
      await savePairingSession(expiredSession);
      setError("Pairing code expired. Generate a new code.");
      return;
    }

    if (status.status === "paired") {
      const nextBinding = toBindingFromStatus(status);
      setBinding(nextBinding);
      await savePairBinding(nextBinding);

      const nextPairing = {
        ...pairingSession,
        status: "paired" as const,
        expiresAt: status.expiresAt
      };
      setPairingSession(nextPairing);
      await savePairingSession(nextPairing);
      await refreshArchivesFromServer();
      await reloadNotionState();
      setNotice("Pairing completed.");
      setError(null);
      return;
    }

    const nextPairing = {
      ...pairingSession,
      status: "pending" as const,
      expiresAt: status.expiresAt
    };
    setPairingSession(nextPairing);
    await savePairingSession(nextPairing);
  }

  const runBusyAction = async (action: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await action();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  };

  const beginPairing = async (): Promise<void> => {
    await runBusyAction(async () => {
      const device = await getOrCreateDeviceRegistration();
      const created = await startPairing(device);
      setPairingSession(created);
      await savePairingSession(created);
      setBinding(null);
      await savePairBinding(null);
      setNotice("New pairing code generated.");
    });
  };

  const refreshAll = async (): Promise<void> => {
    await runBusyAction(async () => {
      if (pairingState === "pending") {
        await refreshPairing();
      }

      if (binding) {
        await refreshArchivesFromServer();
        await reloadNotionState();
      }
    });
  };

  useEffect(() => {
    if (!binding) {
      return;
    }
    void reloadNotionState();
    void refreshArchivesFromServer().catch(() => undefined);
  }, [binding?.threadsHandle]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        return;
      }

      void (async () => {
        if (pairingState === "pending") {
          await refreshPairing().catch(() => undefined);
        }
        if (binding) {
          await reloadNotionState().catch(() => undefined);
        }
      })();
    });

    return () => {
      subscription.remove();
    };
  }, [binding, pairingState, pairingSession]);

  const ensureDraft = (item: ArchiveView): void => {
    setDrafts((current) => {
      if (current[item.id]) {
        return current;
      }

      return {
        ...current,
        [item.id]: buildEditorDraft(item)
      };
    });
  };

  const toggleExpanded = (item: ArchiveView): void => {
    ensureDraft(item);
    setExpandedIds((current) => ({
      ...current,
      [item.id]: !current[item.id]
    }));
  };

  const toggleSelected = (archiveId: string): void => {
    setSelectedIds((current) => {
      const next = { ...current };
      if (next[archiveId]) {
        delete next[archiveId];
      } else {
        next[archiveId] = true;
      }
      return next;
    });
  };

  const updateDraft = (archiveId: string, patch: Partial<EditorDraft>): void => {
    setDrafts((current) => ({
      ...current,
      [archiveId]: {
        ...(current[archiveId] ?? { title: "", noteText: "", tags: "" }),
        ...patch
      }
    }));
  };

  const saveDraft = async (item: ArchiveView): Promise<void> => {
    const draft = drafts[item.id] ?? buildEditorDraft(item);
    const tags = parseTagInput(draft.tags);
    await runBusyAction(async () => {
      await saveArchiveOverride(item.id, {
        customTitle: draft.title.trim() || null,
        noteText: draft.noteText.trim() || null,
        tags
      });
      await reloadArchiveState();
      setNotice("Saved locally.");
    });
  };

  const handleCreateFolder = async (): Promise<void> => {
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      return;
    }

    await runBusyAction(async () => {
      await createFolder(trimmed);
      setNewFolderName("");
      const nextFolders = await loadFolders();
      setFolders(nextFolders);
      setNotice("Folder created.");
    });
  };

  const handleDeleteFolder = async (folder: FolderEntry): Promise<void> => {
    Alert.alert("Delete folder?", folder.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void runBusyAction(async () => {
            await deleteFolder(folder.id);
            if (activeFolderId === folder.id) {
              setActiveFolderId(null);
            }
            await reloadArchiveState();
            setNotice("Folder deleted.");
          });
        }
      }
    ]);
  };

  const assignFolder = async (archiveId: string, folderId: string | null): Promise<void> => {
    await runBusyAction(async () => {
      await setArchiveFolder(archiveId, folderId);
      await reloadArchiveState();
      setNotice(folderId ? "Archive moved." : "Archive removed from folder.");
    });
  };

  const handleCopyMarkdown = async (item: ArchiveView): Promise<void> => {
    await runBusyAction(async () => {
      await copyArchiveMarkdown(item);
      setNotice("Markdown copied.");
    });
  };

  const handleMarkdownExport = async (items: ArchiveView[]): Promise<void> => {
    await runBusyAction(async () => {
      if (items.length === 1) {
        const outcome = await exportArchiveMarkdown(items[0]);
        setNotice(outcome.warning ?? "Markdown ready.");
        return;
      }
      const outcome = await exportArchivesZip(items);
      setNotice(outcome.warning ?? `ZIP ready for ${outcome.exportedCount} archive(s).`);
    });
  };

  const handleZipExport = async (items: ArchiveView[]): Promise<void> => {
    await runBusyAction(async () => {
      const outcome = await exportArchivesZip(items);
      setNotice(outcome.warning ?? `ZIP ready for ${outcome.exportedCount} archive(s).`);
    });
  };

  const handleObsidianExport = async (items: ArchiveView[]): Promise<void> => {
    await runBusyAction(async () => {
      const outcome = await exportArchivesToObsidian(items);
      setExportState(await saveExportState({}));
      setNotice(outcome.warning ?? `Saved ${outcome.exportedCount} note(s) to Obsidian.`);
    });
  };

  const handlePickObsidianDirectory = async (): Promise<void> => {
    await runBusyAction(async () => {
      await pickObsidianDirectory();
      setExportState(await loadExportState());
      setNotice("Obsidian folder connected.");
    });
  };

  const handleConnectNotion = async (): Promise<void> => {
    await runBusyAction(async () => {
      const device = await getOrCreateDeviceRegistration();
      const start = await startNotionOAuth(device);
      setNotionConnection(start.connection);
      await Linking.openURL(start.authorizeUrl);
      setNotice("Opened Notion in the browser. Approve access, then return to the app.");
    });
  };

  const handleDisconnectNotion = async (): Promise<void> => {
    await runBusyAction(async () => {
      const device = await getOrCreateDeviceRegistration();
      const connection = await disconnectNotion(device);
      setNotionConnection(connection);
      setNotice("Notion disconnected.");
    });
  };

  const handleSearchNotion = async (): Promise<void> => {
    await runBusyAction(async () => {
      const device = await getOrCreateDeviceRegistration();
      const results = await searchNotionLocations(device, notionParentType, notionQuery);
      setNotionResults(results);
      setNotice(results.length > 0 ? `Loaded ${results.length} Notion locations.` : "No matching Notion locations.");
    });
  };

  const handleSelectNotionLocation = async (option: NotionLocationOption): Promise<void> => {
    await runBusyAction(async () => {
      const device = await getOrCreateDeviceRegistration();
      const connection = await selectNotionLocation(device, notionParentType, option);
      setNotionConnection(connection);
      setNotice("Notion destination updated.");
    });
  };

  const handleToggleNotionPanel = async (): Promise<void> => {
    const current = exportState ?? (await loadExportState());
    const next = await saveExportState({
      notionPanelOpen: !current.notionPanelOpen
    });
    setExportState(next);
  };

  const handleToggleUploadMedia = async (value: boolean): Promise<void> => {
    const next = await saveExportState({
      notionUploadMedia: value
    });
    setExportState(next);
  };

  const handleNotionExport = async (items: ArchiveView[]): Promise<void> => {
    await runBusyAction(async () => {
      const device = await getOrCreateDeviceRegistration();
      const currentConnection = await getNotionConnection(device);
      setNotionConnection(currentConnection);
      if (!currentConnection.connected) {
        throw new Error("Connect Notion first.");
      }
      if (!currentConnection.selectedParentId) {
        throw new Error("Choose a Notion destination first.");
      }

      const currentExportState = exportState ?? (await loadExportState());
      const result = await exportArchivesToNotion(
        device,
        items.map((item) => toNotionArchiveExportInput(item)),
        currentExportState.notionUploadMedia
      );
      const firstPageUrl = result.results[0]?.pageUrl;
      if (firstPageUrl) {
        void Linking.openURL(firstPageUrl);
      }
      setNotice(result.warning ?? `Exported ${result.results.length} archive(s) to Notion.`);
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.centerStateText}>Loading your local archive…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExportState = exportState ?? {
    lastMarkdownExportAt: null,
    lastZipExportAt: null,
    lastObsidianExportAt: null,
    notionUploadMedia: true,
    notionPanelOpen: false,
    obsidianDirectoryUri: null,
    obsidianDirectoryLabel: null
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Image source={APP_LOGO} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.title}>ss-threads</Text>
              <Text style={styles.subtitle}>mobile scrapbook</Text>
            </View>
          </View>
          <Pressable style={[styles.ghostButton, busy ? styles.disabledButton : null]} onPress={() => void refreshAll()} disabled={busy}>
            <Text style={styles.ghostButtonText}>Refresh</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusStrip}>
          <StatusChip label="Archive : Mobile" tone="active" />
          <StatusChip label={formatPairingState(pairingState)} tone={pairingState === "paired" ? "active" : pairingState === "expired" ? "warning" : "default"} />
          <StatusChip label={binding ? `@${binding.threadsHandle}` : "No pairing"} tone={binding ? "default" : "muted"} />
          <StatusChip label={`Paired ${binding ? formatShortDate(binding.pairedAt) : "-"}`} tone="muted" />
          <StatusChip label={`Sync ${lastSyncedAt ? formatShortDate(lastSyncedAt) : "-"}`} tone="muted" />
          <StatusChip
            label={
              notionConnection?.connected
                ? notionConnection.selectedParentLabel
                  ? `Notion ready`
                  : `Notion connected`
                : "Notion off"
            }
            tone={notionConnection?.connected ? "active" : "muted"}
          />
          <StatusChip
            label={`Obsidian ${getObsidianDirectoryLabel(currentExportState.obsidianDirectoryUri, currentExportState.obsidianDirectoryLabel)}`}
            tone={currentExportState.obsidianDirectoryUri ? "active" : "muted"}
          />
        </ScrollView>

        <View style={styles.accountCard}>
          <View style={styles.accountRow}>
            {binding?.profilePictureUrl ? (
              <Image source={{ uri: binding.profilePictureUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{buildInitials(binding?.displayName, binding?.threadsHandle)}</Text>
              </View>
            )}
            <View style={styles.accountMeta}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>
                  {binding ? binding.displayName || `@${binding.threadsHandle}` : "Not paired yet"}
                </Text>
                {binding?.isVerified ? <Text style={styles.verifiedBadge}>verified</Text> : null}
              </View>
              <Text style={styles.accountHandle}>{binding ? `@${binding.threadsHandle}` : "댓글로 페어링 코드를 남기면 여기에 계정이 표시됩니다."}</Text>
              <Text style={styles.accountFootnote}>
                {binding ? `Paired on ${formatDate(binding.pairedAt)}` : pairingSession ? `Current code expires ${formatDate(pairingSession.expiresAt)}` : "Generate a pairing code to start."}
              </Text>
            </View>
          </View>

          <View style={styles.inlineActions}>
            <Pressable style={[styles.primaryButton, busy ? styles.disabledButton : null]} onPress={() => void beginPairing()} disabled={busy}>
              <Text style={styles.primaryButtonText}>New code</Text>
            </Pressable>
            {pairingSession ? (
              <Pressable style={[styles.ghostButton, busy ? styles.disabledButton : null]} onPress={() => void refreshPairing()} disabled={busy}>
                <Text style={styles.ghostButtonText}>Check status</Text>
              </Pressable>
            ) : null}
            {pairingSession?.pairingPostUrl ? (
              <Pressable style={styles.ghostButton} onPress={() => void Linking.openURL(pairingSession.pairingPostUrl)}>
                <Text style={styles.ghostButtonText}>Open pairing post</Text>
              </Pressable>
            ) : null}
          </View>

          {pairingSession ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Pairing code</Text>
              <Text style={styles.codeValue}>{pairingSession.pairingCode}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Search & filters</Text>
            <Text style={styles.panelMeta}>{filteredArchives.length} visible</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search titles, notes, tags, replies"
            placeholderTextColor="#94a3b8"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderStrip}>
            <Pressable
              style={[styles.filterChip, activeFolderId === null ? styles.filterChipActive : null]}
              onPress={() => setActiveFolderId(null)}
            >
              <Text style={[styles.filterChipText, activeFolderId === null ? styles.filterChipTextActive : null]}>
                All · {archives.length}
              </Text>
            </Pressable>
            {folders.map((folder) => (
              <Pressable
                key={folder.id}
                style={[styles.filterChip, activeFolderId === folder.id ? styles.filterChipActive : null]}
                onPress={() => setActiveFolderId(activeFolderId === folder.id ? null : folder.id)}
                onLongPress={() => handleDeleteFolder(folder)}
              >
                <Text style={[styles.filterChipText, activeFolderId === folder.id ? styles.filterChipTextActive : null]}>
                  {folder.name} · {folderCounts[folder.id] ?? 0}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.folderComposer}>
            <TextInput
              style={styles.folderInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="New folder"
              placeholderTextColor="#94a3b8"
            />
            <Pressable style={styles.ghostButton} onPress={() => void handleCreateFolder()}>
              <Text style={styles.ghostButtonText}>Create</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagStrip}>
            <Pressable
              style={[styles.filterChip, activeTag === null ? styles.filterChipActive : null]}
              onPress={() => setActiveTag(null)}
            >
              <Text style={[styles.filterChipText, activeTag === null ? styles.filterChipTextActive : null]}>All tags</Text>
            </Pressable>
            {tagSummary.map((entry) => (
              <Pressable
                key={entry.tag}
                style={[styles.filterChip, activeTag === entry.tag ? styles.filterChipActive : null]}
                onPress={() => setActiveTag(activeTag === entry.tag ? null : entry.tag)}
              >
                <Text style={[styles.filterChipText, activeTag === entry.tag ? styles.filterChipTextActive : null]}>
                  #{entry.tag} · {entry.count}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Notion & Obsidian</Text>
            <Pressable onPress={() => void handleToggleNotionPanel()}>
              <Text style={styles.linkText}>{currentExportState.notionPanelOpen ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          <View style={styles.inlineActions}>
            <Pressable style={styles.ghostButton} onPress={() => void handlePickObsidianDirectory()}>
              <Text style={styles.ghostButtonText}>
                {currentExportState.obsidianDirectoryUri ? "Change Obsidian folder" : "Connect Obsidian folder"}
              </Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => void reloadNotionState()}>
              <Text style={styles.ghostButtonText}>Refresh Notion</Text>
            </Pressable>
          </View>
          <Text style={styles.inlineMeta}>
            Obsidian: {getObsidianDirectoryLabel(currentExportState.obsidianDirectoryUri, currentExportState.obsidianDirectoryLabel)}
          </Text>

          {currentExportState.notionPanelOpen ? (
            <View style={styles.notionPanel}>
              <View style={styles.inlineActions}>
                {notionConnection?.connected ? (
                  <Pressable style={styles.primaryButton} onPress={() => void handleDisconnectNotion()}>
                    <Text style={styles.primaryButtonText}>Disconnect Notion</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.primaryButton} onPress={() => void handleConnectNotion()}>
                    <Text style={styles.primaryButtonText}>Connect Notion</Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.inlineMeta}>
                {notionConnection?.connected
                  ? `${notionConnection.workspaceName || "Workspace"} · ${notionConnection.selectedParentLabel || "Choose a destination"}`
                  : "Notion is not connected."}
              </Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Upload media when exporting</Text>
                <Switch value={currentExportState.notionUploadMedia} onValueChange={(value) => void handleToggleUploadMedia(value)} />
              </View>

              <View style={styles.parentTypeRow}>
                <Pressable
                  style={[styles.filterChip, notionParentType === "page" ? styles.filterChipActive : null]}
                  onPress={() => setNotionParentType("page")}
                >
                  <Text style={[styles.filterChipText, notionParentType === "page" ? styles.filterChipTextActive : null]}>Page</Text>
                </Pressable>
                <Pressable
                  style={[styles.filterChip, notionParentType === "data_source" ? styles.filterChipActive : null]}
                  onPress={() => setNotionParentType("data_source")}
                >
                  <Text style={[styles.filterChipText, notionParentType === "data_source" ? styles.filterChipTextActive : null]}>Data source</Text>
                </Pressable>
              </View>
              <View style={styles.folderComposer}>
                <TextInput
                  style={styles.folderInput}
                  value={notionQuery}
                  onChangeText={setNotionQuery}
                  placeholder="Search Notion destination"
                  placeholderTextColor="#94a3b8"
                />
                <Pressable style={styles.ghostButton} onPress={() => void handleSearchNotion()}>
                  <Text style={styles.ghostButtonText}>Search</Text>
                </Pressable>
              </View>
              {notionResults.map((option) => (
                <Pressable key={option.id} style={styles.resultRow} onPress={() => void handleSelectNotionLocation(option)}>
                  <Text style={styles.resultTitle}>{option.label}</Text>
                  <Text style={styles.resultSubtitle}>{option.subtitle || option.type}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

        {selectionIds.length > 0 ? (
          <View style={styles.bulkBar}>
            <Text style={styles.bulkCount}>{selectionIds.length} selected</Text>
            <View style={styles.bulkActions}>
              <Pressable style={styles.bulkButton} onPress={() => void handleZipExport(selectedArchives)}>
                <Text style={styles.bulkButtonText}>ZIP</Text>
              </Pressable>
              <Pressable style={styles.bulkButton} onPress={() => void handleNotionExport(selectedArchives)}>
                <Text style={styles.bulkButtonText}>Notion</Text>
              </Pressable>
              <Pressable style={styles.bulkButton} onPress={() => void handleObsidianExport(selectedArchives)}>
                <Text style={styles.bulkButtonText}>Obsidian</Text>
              </Pressable>
              <Pressable style={styles.bulkButton} onPress={() => setSelectedIds({})}>
                <Text style={styles.bulkButtonText}>Clear</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.archiveList}>
          {filteredArchives.map((item) => {
            const isExpanded = expandedIds[item.id] === true;
            const isSelected = selectedIds[item.id] === true;
            const draft = drafts[item.id] ?? buildEditorDraft(item);
            return (
              <View key={item.id} style={[styles.archiveCard, isSelected ? styles.archiveCardSelected : null]}>
                <Pressable style={styles.archiveCardTop} onPress={() => toggleExpanded(item)} onLongPress={() => toggleSelected(item.id)}>
                  <View style={styles.archiveCardMeta}>
                    <Text style={styles.archiveTitle}>{item.displayTitle}</Text>
                    <Text style={styles.archiveMetaLine}>
                      @{item.author} · {formatShortDate(item.savedAt)} · {item.folderName || "Inbox"}
                    </Text>
                    {item.tags.length > 0 ? <Text style={styles.archiveMetaLine}>{item.tags.map((tag) => `#${tag}`).join(" ")}</Text> : null}
                  </View>
                  <View style={styles.archiveCardRight}>
                    <Pressable style={styles.selectButton} onPress={() => toggleSelected(item.id)}>
                      <Text style={styles.selectButtonText}>{isSelected ? "Selected" : "Select"}</Text>
                    </Pressable>
                    <Text style={styles.expandLabel}>{isExpanded ? "Hide" : "Open"}</Text>
                  </View>
                </Pressable>

                {isExpanded ? (
                  <View style={styles.archiveDetail}>
                    <Text style={styles.detailBody}>{item.text || "No captured text."}</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
                      {item.imageUrls.map((imageUrl) => (
                        <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.mediaThumb} />
                      ))}
                    </ScrollView>

                    {item.authorReplies.length > 0 ? (
                      <View style={styles.replyBlock}>
                        <Text style={styles.replyTitle}>Author replies</Text>
                        {item.authorReplies.map((reply, replyIndex) => (
                          <View key={`${item.id}:${replyIndex}`} style={styles.replyRow}>
                            <Text style={styles.replyMeta}>Reply {replyIndex + 1} · {formatShortDate(reply.publishedAt)}</Text>
                            <Text style={styles.replyText}>{reply.text || "No captured text."}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <View style={styles.inlineActions}>
                      <Pressable style={styles.ghostButton} onPress={() => void handleCopyMarkdown(item)}>
                        <Text style={styles.ghostButtonText}>Copy</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => void handleMarkdownExport([item])}>
                        <Text style={styles.ghostButtonText}>Markdown</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => void handleZipExport([item])}>
                        <Text style={styles.ghostButtonText}>ZIP</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => void handleNotionExport([item])}>
                        <Text style={styles.ghostButtonText}>Notion</Text>
                      </Pressable>
                      <Pressable style={styles.ghostButton} onPress={() => void handleObsidianExport([item])}>
                        <Text style={styles.ghostButtonText}>Obsidian</Text>
                      </Pressable>
                    </View>

                    <View style={styles.editorBlock}>
                      <Text style={styles.editorLabel}>Local title</Text>
                      <TextInput
                        style={styles.editorInput}
                        value={draft.title}
                        onChangeText={(value) => updateDraft(item.id, { title: value })}
                        placeholder="Custom title"
                        placeholderTextColor="#94a3b8"
                      />
                      <Text style={styles.editorLabel}>Local note</Text>
                      <TextInput
                        style={[styles.editorInput, styles.editorTextarea]}
                        value={draft.noteText}
                        onChangeText={(value) => updateDraft(item.id, { noteText: value })}
                        placeholder="Notes for this archive"
                        placeholderTextColor="#94a3b8"
                        multiline
                      />
                      <Text style={styles.editorLabel}>Tags</Text>
                      <TextInput
                        style={styles.editorInput}
                        value={draft.tags}
                        onChangeText={(value) => updateDraft(item.id, { tags: value })}
                        placeholder="#tags"
                        placeholderTextColor="#94a3b8"
                      />
                      <Pressable style={styles.primaryButton} onPress={() => void saveDraft(item)}>
                        <Text style={styles.primaryButtonText}>Save local edits</Text>
                      </Pressable>
                    </View>

                    <View style={styles.folderAssignment}>
                      <Text style={styles.editorLabel}>Folder</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderStrip}>
                        <Pressable
                          style={[styles.filterChip, item.folderId === null ? styles.filterChipActive : null]}
                          onPress={() => void assignFolder(item.id, null)}
                        >
                          <Text style={[styles.filterChipText, item.folderId === null ? styles.filterChipTextActive : null]}>
                            Inbox
                          </Text>
                        </Pressable>
                        {folders.map((folder) => (
                          <Pressable
                            key={`${item.id}:${folder.id}`}
                            style={[styles.filterChip, item.folderId === folder.id ? styles.filterChipActive : null]}
                            onPress={() => void assignFolder(item.id, folder.id)}
                          >
                            <Text style={[styles.filterChipText, item.folderId === folder.id ? styles.filterChipTextActive : null]}>
                              {folder.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.linksRow}>
                      <Pressable onPress={() => void Linking.openURL(item.canonicalUrl)}>
                        <Text style={styles.linkText}>Open post</Text>
                      </Pressable>
                      {item.quotedPostUrl ? (
                        <Pressable onPress={() => void Linking.openURL(item.quotedPostUrl!)}>
                          <Text style={styles.linkText}>Quoted post</Text>
                        </Pressable>
                      ) : null}
                      {item.repliedToUrl ? (
                        <Pressable onPress={() => void Linking.openURL(item.repliedToUrl!)}>
                          <Text style={styles.linkText}>Reply target</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}

          {filteredArchives.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No archives match the current view.</Text>
              <Text style={styles.emptyStateBody}>Change the search, clear a filter, or sync again.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 16
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  centerStateText: {
    color: "#64748b",
    fontSize: 15
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  logo: {
    width: 42,
    height: 42
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.8
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.4
  },
  statusStrip: {
    gap: 8,
    paddingBottom: 2
  },
  statusChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  statusChipActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe"
  },
  statusChipWarning: {
    backgroundColor: "#fff7ed",
    borderColor: "#fdba74"
  },
  statusChipMuted: {
    opacity: 0.8
  },
  statusChipText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700"
  },
  statusChipTextActive: {
    color: "#111827"
  },
  statusChipTextWarning: {
    color: "#9a3412"
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 18,
    gap: 16
  },
  accountRow: {
    flexDirection: "row",
    gap: 14
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#e2e8f0"
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarFallbackText: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800"
  },
  accountMeta: {
    flex: 1,
    gap: 5
  },
  accountNameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8
  },
  accountName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a"
  },
  verifiedBadge: {
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    overflow: "hidden"
  },
  accountHandle: {
    fontSize: 14,
    color: "#475569"
  },
  accountFootnote: {
    fontSize: 12,
    color: "#64748b"
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#dbe3ee",
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 14,
    gap: 6,
    backgroundColor: "#f8fafc"
  },
  codeLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  codeValue: {
    fontSize: 30,
    color: "#0f172a",
    fontWeight: "800",
    letterSpacing: 1.6
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 18,
    gap: 14
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a"
  },
  panelMeta: {
    fontSize: 12,
    color: "#64748b"
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f8fafc"
  },
  folderStrip: {
    gap: 8
  },
  tagStrip: {
    gap: 8
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8fafc"
  },
  filterChipActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe"
  },
  filterChipText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13
  },
  filterChipTextActive: {
    color: "#1d4ed8"
  },
  folderComposer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  folderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0f172a",
    backgroundColor: "#f8fafc"
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff"
  },
  ghostButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700"
  },
  disabledButton: {
    opacity: 0.5
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  inlineMeta: {
    color: "#64748b",
    fontSize: 13
  },
  notionPanel: {
    gap: 12
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switchLabel: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700"
  },
  parentTypeRow: {
    flexDirection: "row",
    gap: 8
  },
  resultRow: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 12,
    gap: 4,
    backgroundColor: "#f8fafc"
  },
  resultTitle: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "800"
  },
  resultSubtitle: {
    fontSize: 12,
    color: "#64748b"
  },
  errorText: {
    color: "#8f2d16",
    backgroundColor: "#f7dacb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  noticeText: {
    color: "#1d4f2b",
    backgroundColor: "#ddefd8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  bulkBar: {
    borderWidth: 1,
    borderColor: "#171511",
    backgroundColor: "#171511",
    borderRadius: 24,
    padding: 14,
    gap: 12
  },
  bulkCount: {
    color: "#f7f3eb",
    fontSize: 14,
    fontWeight: "800"
  },
  bulkActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  bulkButton: {
    backgroundColor: "#2a261f",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14
  },
  bulkButtonText: {
    color: "#f7f3eb",
    fontWeight: "800",
    fontSize: 12
  },
  archiveList: {
    gap: 12
  },
  archiveCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 14
  },
  archiveCardSelected: {
    borderColor: "#93c5fd",
    borderWidth: 1.5,
    backgroundColor: "#f8fbff"
  },
  archiveCardTop: {
    flexDirection: "row",
    gap: 12
  },
  archiveCardMeta: {
    flex: 1,
    gap: 4
  },
  archiveCardRight: {
    alignItems: "flex-end",
    gap: 8
  },
  archiveTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a"
  },
  archiveMetaLine: {
    fontSize: 12,
    color: "#64748b"
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f8fafc"
  },
  selectButtonText: {
    fontSize: 11,
    color: "#0f172a",
    fontWeight: "700"
  },
  expandLabel: {
    fontSize: 12,
    color: "#64748b"
  },
  archiveDetail: {
    gap: 14
  },
  detailBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#0f172a"
  },
  mediaStrip: {
    gap: 10
  },
  mediaThumb: {
    width: 140,
    height: 140,
    borderRadius: 18,
    backgroundColor: "#e2e8f0"
  },
  replyBlock: {
    gap: 8
  },
  replyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a"
  },
  replyRow: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 12,
    gap: 6,
    backgroundColor: "#f8fafc"
  },
  replyMeta: {
    fontSize: 11,
    color: "#64748b"
  },
  replyText: {
    fontSize: 14,
    color: "#0f172a",
    lineHeight: 20
  },
  editorBlock: {
    gap: 8
  },
  editorLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  editorInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc"
  },
  editorTextarea: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  folderAssignment: {
    gap: 8
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  linkText: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "700"
  },
  emptyState: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#ffffff",
    gap: 6
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a"
  },
  emptyStateBody: {
    fontSize: 14,
    color: "#64748b"
  }
});
