import { BUNDLED_EXTRACTOR_CONFIG, DEFAULT_OPTIONS } from "./lib/config";
import {
  buildCloudLinkStartUrl,
  completeCloudLink,
  deleteCloudArchiveWithServer,
  disconnectCloudConnection,
  fetchCloudArchivesWithServer,
  fetchCloudConnectionStatus,
  savePostToCloudWithServer
} from "./lib/cloud-server";
import { t } from "./lib/i18n";
import { organizePostWithAi } from "./lib/llm";
import { resolveImageDownloadPolicy } from "./lib/media-permissions";
import { savePostToNotionWithServer } from "./lib/notion-server";
import { buildZipPackage } from "./lib/package";
import { PRIMARY_BACKEND_ORIGIN } from "./lib/pro-activation";
import {
  clearRecentSaves,
  findDuplicateSave,
  findRecentSaveById,
  getEffectiveOptions,
  getOptions,
  getPendingCloudLinkRecord,
  getRecentSaves,
  getStoredCloudConnectionStatus,
  removeRecentSaveById,
  setOptions,
  setPendingCloudLinkRecord,
  syncCloudRecentSaves,
  upsertRecentSave
} from "./lib/storage";
import type { CloudConnectionStatus, ExtractPostRequest, PopupRequest, PopupState, RecentSave, SaveStatus, SaveTarget } from "./lib/types";
import { isSupportedPermalink } from "./lib/utils";

let currentStatus: SaveStatus = {
  kind: "idle",
  message: ""
};

async function startCloudLinkFlow(): Promise<void> {
  const state = crypto.randomUUID();
  const createdTab = await chrome.tabs.create({
    url: buildCloudLinkStartUrl(state)
  });
  await setPendingCloudLinkRecord({
    state,
    startedAt: new Date().toISOString(),
    tabId: createdTab.id ?? null
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const currentUrl = changeInfo.url ?? tab.url;
  if (!currentUrl) {
    return;
  }

  void (async () => {
    const pending = await getPendingCloudLinkRecord();
    if (!pending?.state) {
      return;
    }

    const parsed = new URL(currentUrl);
    if (parsed.origin !== PRIMARY_BACKEND_ORIGIN) {
      return;
    }

    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const code = hashParams.get("code");
    const state = hashParams.get("state");
    const authError = parsed.searchParams.get("authError");
    if (authError) {
      await setPendingCloudLinkRecord(null);
      broadcastStatus({
        kind: "error",
        message: authError,
        canRetry: false
      });
      return;
    }

    if (!code || state !== pending.state) {
      return;
    }

    try {
      await completeCloudLink(code, state);
      await setPendingCloudLinkRecord(null);
      await chrome.tabs.remove(tabId).catch(() => undefined);
      broadcastStatus({
        kind: "success",
        message: (await t()).statusCloudConnected,
        canRetry: false
      });
    } catch (error) {
      await setPendingCloudLinkRecord(null);
      broadcastStatus({
        kind: "error",
        message: error instanceof Error ? error.message : (await t()).statusCloudSessionExpired,
        canRetry: false
      });
    }
  })();
});

function broadcastStatus(status: SaveStatus): void {
  currentStatus = status;
  void chrome.runtime.sendMessage({ type: "save-status", status }).catch(() => undefined);
}

function broadcastPopupState(state: PopupState): void {
  void chrome.runtime.sendMessage({ type: "popup-state-refresh", state }).catch(() => undefined);
}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0] ?? null;
}

async function createUnsupportedState(url: string | null): Promise<SaveStatus> {
  const msg = await t();
  return {
    kind: "unsupported",
    message: url ? msg.statusUnsupported : msg.statusNoTab
  };
}

async function createZipRecentSave(post: RecentSave["post"], archiveName: string, warning: string | null): Promise<RecentSave> {
  return {
    id: crypto.randomUUID(),
    saveTarget: "obsidian",
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    downloadedAt: new Date().toISOString(),
    archiveName,
    contentHash: post.contentHash,
    status: "complete",
    savedVia: "zip",
    savedRelativePath: null,
    remotePageId: null,
    remotePageUrl: null,
    warning,
    post
  };
}

async function createNotionRecentSave(
  post: RecentSave["post"],
  pageId: string,
  pageUrl: string,
  warning: string | null
): Promise<RecentSave> {
  return {
    id: crypto.randomUUID(),
    saveTarget: "notion",
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    downloadedAt: new Date().toISOString(),
    archiveName: post.title,
    contentHash: post.contentHash,
    status: "complete",
    savedVia: "notion",
    savedRelativePath: null,
    remotePageId: pageId,
    remotePageUrl: pageUrl,
    warning,
    post
  };
}

async function createCloudRecentSave(
  post: RecentSave["post"],
  archiveId: string,
  archiveUrl: string,
  archiveTitle: string,
  warning: string | null
): Promise<RecentSave> {
  return {
    id: archiveId,
    saveTarget: "cloud",
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    downloadedAt: new Date().toISOString(),
    archiveName: archiveTitle,
    contentHash: post.contentHash,
    status: "complete",
    savedVia: "cloud",
    savedRelativePath: null,
    remotePageId: archiveId,
    remotePageUrl: archiveUrl,
    remoteOrigin: "cloud",
    warning,
    post
  };
}

function isMissingReceiverError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Receiving end does not exist");
}

async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "ping-content-script" });
    return;
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error;
    }
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}

async function requestExtraction(tabId: number, message: ExtractPostRequest): Promise<RecentSave["post"] | { __error: string }> {
  try {
    return (await chrome.tabs.sendMessage(tabId, message)) as RecentSave["post"] | { __error: string };
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error;
    }

    await ensureContentScript(tabId);
    return (await chrome.tabs.sendMessage(tabId, message)) as RecentSave["post"] | { __error: string };
  }
}

async function resolvePopupRecentSaves(saveTarget: SaveTarget, cloudConnection: CloudConnectionStatus): Promise<RecentSave[]> {
  if (saveTarget !== "cloud" || cloudConnection.state !== "linked") {
    return await getRecentSaves();
  }

  try {
    const cloudArchives = await fetchCloudArchivesWithServer();
    return await syncCloudRecentSaves(cloudArchives);
  } catch {
    return await getRecentSaves();
  }
}

async function buildCachedPopupState(): Promise<PopupState> {
  const [tab, options, recentSaves, cloudConnection] = await Promise.all([
    getActiveTab(),
    getOptions(),
    getRecentSaves(),
    getStoredCloudConnectionStatus()
  ]);
  const supported = Boolean(tab?.url && isSupportedPermalink(tab.url));

  return {
    supported,
    currentUrl: tab?.url ?? null,
    status: supported ? currentStatus : await createUnsupportedState(tab?.url ?? null),
    recentSaves,
    cloudConnection,
    saveTarget: options.saveTarget
  };
}

async function buildFreshPopupState(): Promise<PopupState> {
  const [tab, options] = await Promise.all([getActiveTab(), getEffectiveOptions()]);
  const supported = Boolean(tab?.url && isSupportedPermalink(tab.url));
  const cloudConnection =
    options.saveTarget === "cloud"
      ? await fetchCloudConnectionStatus()
      : await getStoredCloudConnectionStatus();
  const recentSaves = await resolvePopupRecentSaves(options.saveTarget, cloudConnection);

  return {
    supported,
    currentUrl: tab?.url ?? null,
    status: supported ? currentStatus : await createUnsupportedState(tab?.url ?? null),
    recentSaves,
    cloudConnection,
    saveTarget: options.saveTarget
  };
}

async function extractPostFromTab(tab: chrome.tabs.Tab): Promise<RecentSave["post"]> {
  if (!tab.id || !tab.url) {
    const msg = await t();
    throw new Error(msg.statusTabError);
  }

  const message: ExtractPostRequest = { type: "extract-post", config: BUNDLED_EXTRACTOR_CONFIG };
  const response = await requestExtraction(tab.id, message);
  if ("__error" in response) {
    throw new Error(response.__error);
  }

  return response;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const mimeType = blob.type || "application/octet-stream";
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}

async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const dataUrl = await blobToDataUrl(blob);
  await chrome.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false
  });
}

async function saveCurrentPost(
  tab: chrome.tabs.Tab,
  allowDuplicate = false,
  imageOverride?: { allowImageDownloads?: boolean; imageFallbackWarning?: string }
): Promise<SaveStatus> {
  if (!tab.url || !isSupportedPermalink(tab.url)) {
    const unsupported = await createUnsupportedState(tab.url ?? null);
    broadcastStatus(unsupported);
    return unsupported;
  }

  const msg = await t();
  broadcastStatus({ kind: "saving", message: msg.statusSaving });

  try {
    const post = await extractPostFromTab(tab);
    const options = await getEffectiveOptions();
    if (options.saveTarget === "cloud") {
      const ai = await organizePostWithAi(post, options.aiOrganization);
      const cloudResult = await savePostToCloudWithServer(post, ai.result, ai.warning);
      const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash, "cloud");
      const recent = duplicate && allowDuplicate
        ? {
            ...duplicate,
            id: cloudResult.archiveId,
            saveTarget: "cloud" as const,
            canonicalUrl: post.canonicalUrl,
            shortcode: post.shortcode,
            author: post.author,
            title: post.title,
            downloadedAt: new Date().toISOString(),
            archiveName: cloudResult.title,
            contentHash: post.contentHash,
            status: "complete" as const,
            savedVia: "cloud" as const,
            savedRelativePath: null,
            remotePageId: cloudResult.archiveId,
            remotePageUrl: cloudResult.archiveUrl,
            remoteOrigin: "cloud" as const,
            warning: cloudResult.warning,
            post
          }
        : await createCloudRecentSave(
            post,
            cloudResult.archiveId,
            cloudResult.archiveUrl,
            cloudResult.title,
            cloudResult.warning
          );
      await upsertRecentSave(recent);

      const success: SaveStatus = {
        kind: "success",
        message: cloudResult.warning ? `${msg.statusSavedCloud}: ${cloudResult.warning}` : msg.statusSavedCloud,
        saveId: recent.id,
        canRetry: true
      };
      broadcastStatus(success);
      return success;
    }

    if (options.saveTarget === "notion") {
      const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash, "notion");
      if (duplicate && !allowDuplicate) {
        const alreadySaved: SaveStatus = {
          kind: "success",
          message: msg.statusAlreadySaved,
          saveId: duplicate.id,
          canRetry: true
        };
        broadcastStatus(alreadySaved);
        return alreadySaved;
      }

      const ai = await organizePostWithAi(post, options.aiOrganization);
      const notionResult = await savePostToNotionWithServer(post, options.notion, options.includeImages, ai.result, ai.warning);
      const recent = duplicate && allowDuplicate
        ? {
            ...duplicate,
            saveTarget: "notion" as const,
            canonicalUrl: post.canonicalUrl,
            shortcode: post.shortcode,
            author: post.author,
            title: post.title,
            downloadedAt: new Date().toISOString(),
            archiveName: notionResult.title,
            contentHash: post.contentHash,
            status: "complete" as const,
            savedVia: "notion" as const,
            savedRelativePath: null,
            remotePageId: notionResult.pageId,
            remotePageUrl: notionResult.pageUrl,
            warning: notionResult.warning,
            post
          }
        : await createNotionRecentSave(post, notionResult.pageId, notionResult.pageUrl, notionResult.warning);
      await upsertRecentSave(recent);

      const success: SaveStatus = {
        kind: "success",
        message: notionResult.warning ? `${msg.statusSavedNotion}: ${notionResult.warning}` : msg.statusSavedNotion,
        saveId: recent.id,
        canRetry: true
      };
      broadcastStatus(success);
      return success;
    }

    const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash, "obsidian");
    const imagePolicy =
      imageOverride && typeof imageOverride.allowImageDownloads === "boolean" && imageOverride.imageFallbackWarning
        ? {
          allowImageDownloads: imageOverride.allowImageDownloads,
          fallbackWarning: imageOverride.imageFallbackWarning
        }
        : await resolveImageDownloadPolicy(post, options.includeImages, true);
    const packaged = await buildZipPackage(
      post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning,
      options.savePathPattern,
      options.aiOrganization
    );
    await downloadBlob(packaged.blob, packaged.zipFilename);
    const recent =
      duplicate && !allowDuplicate
        ? {
          ...duplicate,
          saveTarget: "obsidian" as const,
          canonicalUrl: post.canonicalUrl,
          shortcode: post.shortcode,
          author: post.author,
          title: post.title,
          downloadedAt: new Date().toISOString(),
          archiveName: packaged.archiveName,
          contentHash: post.contentHash,
          status: "complete" as const,
          savedVia: "zip" as const,
          savedRelativePath: null,
          remotePageId: null,
          remotePageUrl: null,
          warning: packaged.warning,
          post
        }
        : await createZipRecentSave(post, packaged.archiveName, packaged.warning);
    await upsertRecentSave(recent);

    const success: SaveStatus = {
      kind: "success",
      message:
        duplicate && !allowDuplicate
          ? packaged.warning
            ? `${msg.statusDuplicateWarning}${packaged.warning}`
            : msg.statusDuplicate
          : packaged.warning
            ? `${msg.statusSavedZip}: ${packaged.warning}`
            : msg.statusSavedZip,
      saveId: recent.id,
      canRetry: true
    };
    broadcastStatus(success);
    return success;
  } catch (error) {
    const message = error instanceof Error ? error.message : msg.statusError;
    const failed: SaveStatus = { kind: "error", message, canRetry: true };
    broadcastStatus(failed);
    return failed;
  }
}

async function redownloadSave(
  saveId: string,
  successMessage?: string,
  imageOverride?: { allowImageDownloads?: boolean; imageFallbackWarning?: string }
): Promise<SaveStatus> {
  const msg = await t();
  const resolvedSuccessMessage = successMessage ?? msg.statusResaved;
  const recentSave = await findRecentSaveById(saveId);
  if (!recentSave) {
    const failed = { kind: "error", message: msg.statusRecentNotFound, canRetry: false } satisfies SaveStatus;
    broadcastStatus(failed);
    return failed;
  }

  broadcastStatus({ kind: "saving", message: msg.statusResaving });
  try {
    const options = await getEffectiveOptions();
    if (recentSave.saveTarget === "cloud") {
      const ai = await organizePostWithAi(recentSave.post, options.aiOrganization);
      const cloudResult = await savePostToCloudWithServer(
        recentSave.post,
        ai.result,
        ai.warning
      );
      const updatedSave: RecentSave = {
        ...recentSave,
        id: cloudResult.archiveId,
        saveTarget: "cloud",
        downloadedAt: new Date().toISOString(),
        archiveName: cloudResult.title,
        savedVia: "cloud",
        savedRelativePath: null,
        remotePageId: cloudResult.archiveId,
        remotePageUrl: cloudResult.archiveUrl,
        remoteOrigin: "cloud",
        warning: cloudResult.warning
      };
      await upsertRecentSave(updatedSave);
      const success = {
        kind: "success",
        message: cloudResult.warning ? `${msg.statusResavedCloud}: ${cloudResult.warning}` : msg.statusResavedCloud,
        saveId: updatedSave.id,
        canRetry: true
      } satisfies SaveStatus;
      broadcastStatus(success);
      return success;
    }

    if (recentSave.saveTarget === "notion") {
      const ai = await organizePostWithAi(recentSave.post, options.aiOrganization);
      const notionResult = await savePostToNotionWithServer(
        recentSave.post,
        options.notion,
        options.includeImages,
        ai.result,
        ai.warning
      );
      const updatedSave: RecentSave = {
        ...recentSave,
        saveTarget: "notion",
        downloadedAt: new Date().toISOString(),
        archiveName: notionResult.title,
        savedVia: "notion",
        savedRelativePath: null,
        remotePageId: notionResult.pageId,
        remotePageUrl: notionResult.pageUrl,
        warning: notionResult.warning
      };
      await upsertRecentSave(updatedSave);
      const success = {
        kind: "success",
        message: notionResult.warning ? `${msg.statusResavedNotion}: ${notionResult.warning}` : msg.statusResavedNotion,
        saveId: updatedSave.id,
        canRetry: true
      } satisfies SaveStatus;
      broadcastStatus(success);
      return success;
    }

    const imagePolicy =
      imageOverride && typeof imageOverride.allowImageDownloads === "boolean" && imageOverride.imageFallbackWarning
        ? {
          allowImageDownloads: imageOverride.allowImageDownloads,
          fallbackWarning: imageOverride.imageFallbackWarning
        }
        : await resolveImageDownloadPolicy(recentSave.post, options.includeImages, true);
    const packaged = await buildZipPackage(
      recentSave.post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning,
      options.savePathPattern,
      options.aiOrganization
    );
    await downloadBlob(packaged.blob, packaged.zipFilename);

    const updatedSave: RecentSave = {
      ...recentSave,
      saveTarget: "obsidian",
      downloadedAt: new Date().toISOString(),
      archiveName: packaged.archiveName,
      savedVia: "zip",
      savedRelativePath: null,
      remotePageId: null,
      remotePageUrl: null,
      warning: packaged.warning
    };
    await upsertRecentSave(updatedSave);
    const success = {
      kind: "success",
      message: resolvedSuccessMessage,
      saveId: updatedSave.id,
      canRetry: true
    } satisfies SaveStatus;
    broadcastStatus(success);
    return success;
  } catch (error) {
    const failed = {
      kind: "error",
      message: error instanceof Error ? error.message : msg.statusRedownloadError,
      canRetry: true
    } satisfies SaveStatus;
    broadcastStatus(failed);
    return failed;
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const options = await getOptions();
  await setOptions({ ...DEFAULT_OPTIONS, ...options });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "save-current-post") {
    return;
  }

  const tab = await getActiveTab();
  if (!tab) {
    broadcastStatus(await createUnsupportedState(null));
    return;
  }

  await saveCurrentPost(tab);
});

chrome.runtime.onMessage.addListener((request: PopupRequest, _sender, sendResponse) => {
  void (async () => {
    switch (request.type) {
      case "get-popup-state": {
        sendResponse(await buildCachedPopupState());
        void buildFreshPopupState().then((state) => broadcastPopupState(state)).catch(() => undefined);
        break;
      }
      case "save-current-post": {
        const tab = await getActiveTab();
        if (!tab) {
          sendResponse(createUnsupportedState(null));
          return;
        }

        sendResponse(
          await saveCurrentPost(tab, request.allowDuplicate, {
            allowImageDownloads: request.allowImageDownloads,
            imageFallbackWarning: request.imageFallbackWarning
          })
        );
        break;
      }
      case "extract-current-post": {
        const tab = await getActiveTab();
        const msg = await t();
        if (!tab) {
          sendResponse({ __error: msg.statusNoTab });
          return;
        }

        if (!tab.url || !isSupportedPermalink(tab.url)) {
          sendResponse({ __error: msg.statusUnsupported });
          return;
        }

        try {
          sendResponse(await extractPostFromTab(tab));
        } catch (error) {
          sendResponse({ __error: error instanceof Error ? error.message : msg.statusExtractFailed });
        }
        break;
      }
      case "redownload-save": {
        sendResponse(
          await redownloadSave(request.saveId, undefined, {
            allowImageDownloads: request.allowImageDownloads,
            imageFallbackWarning: request.imageFallbackWarning
          })
        );
        break;
      }
      case "delete-recent-save": {
        const recentSave = await findRecentSaveById(request.saveId);
        if (recentSave?.saveTarget === "cloud" && recentSave.remotePageId) {
          try {
            await deleteCloudArchiveWithServer(recentSave.remotePageId);
          } catch (error) {
            const tab = await getActiveTab();
            const cloudConnection = await fetchCloudConnectionStatus();
            const options = await getEffectiveOptions();
            const response: PopupState = {
              supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
              currentUrl: tab?.url ?? null,
              status: {
                kind: "error",
                message: error instanceof Error ? error.message : (await t()).statusError,
                canRetry: false
              },
              recentSaves: await resolvePopupRecentSaves(options.saveTarget, cloudConnection),
              cloudConnection,
              saveTarget: options.saveTarget
            };
            broadcastStatus(response.status);
            sendResponse(response);
            return;
          }
        }

        await removeRecentSaveById(request.saveId);
        const tab = await getActiveTab();
        const msg = await t();
        const options = await getEffectiveOptions();
        const cloudConnection = await fetchCloudConnectionStatus();
        const recentSaves = await resolvePopupRecentSaves(options.saveTarget, cloudConnection);
        const response: PopupState = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusDeletedRecent,
            canRetry: false
          },
          recentSaves,
          cloudConnection,
          saveTarget: options.saveTarget
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "clear-recent-saves": {
        await clearRecentSaves();
        const tab = await getActiveTab();
        const msg = await t();
        const options = await getEffectiveOptions();
        const cloudConnection = await fetchCloudConnectionStatus();
        const response: PopupState = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusClearedRecents,
            canRetry: false
          },
          recentSaves: await resolvePopupRecentSaves(options.saveTarget, cloudConnection),
          cloudConnection,
          saveTarget: options.saveTarget
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "start-cloud-link": {
        await startCloudLinkFlow();
        sendResponse({ ok: true });
        break;
      }
      case "disconnect-cloud-link": {
        const cloudConnection = await disconnectCloudConnection();
        const tab = await getActiveTab();
        const msg = await t();
        const response: PopupState = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusCloudDisconnected,
            canRetry: false
          },
          recentSaves: await getRecentSaves(),
          cloudConnection,
          saveTarget: "cloud"
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "get-options": {
        sendResponse(await getOptions());
        break;
      }
      case "update-options": {
        await setOptions(request.options);
        sendResponse({ ok: true });
        break;
      }
      default: {
        sendResponse({ ok: false });
      }
    }
  })();

  return true;
});
