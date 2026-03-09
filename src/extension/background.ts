import { BUNDLED_EXTRACTOR_CONFIG, DEFAULT_OPTIONS } from "./lib/config";
import { t } from "./lib/i18n";
import { resolveImageDownloadPolicy } from "./lib/media-permissions";
import { buildZipPackage } from "./lib/package";
import { clearRecentSaves, findDuplicateSave, findRecentSaveById, getOptions, getRecentSaves, removeRecentSaveById, setOptions, upsertRecentSave } from "./lib/storage";
import type { ExtractPostRequest, PopupRequest, PopupState, RecentSave, SaveStatus } from "./lib/types";
import { isSupportedPermalink } from "./lib/utils";

let currentStatus: SaveStatus = {
  kind: "idle",
  message: ""
};

function broadcastStatus(status: SaveStatus): void {
  currentStatus = status;
  void chrome.runtime.sendMessage({ type: "save-status", status }).catch(() => undefined);
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
    const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash);
    const options = await getOptions();
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
      imagePolicy.fallbackWarning
    );
    await downloadBlob(packaged.blob, packaged.zipFilename);
    const recent =
      duplicate && !allowDuplicate
        ? {
          ...duplicate,
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
    const options = await getOptions();
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
      imagePolicy.fallbackWarning
    );
    await downloadBlob(packaged.blob, packaged.zipFilename);

    const updatedSave: RecentSave = {
      ...recentSave,
      downloadedAt: new Date().toISOString(),
      archiveName: packaged.archiveName,
      savedVia: "zip",
      savedRelativePath: null,
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
        const tab = await getActiveTab();
        const recentSaves = await getRecentSaves();
        const supported = Boolean(tab?.url && isSupportedPermalink(tab.url));
        const response: PopupState = {
          supported,
          currentUrl: tab?.url ?? null,
          status: supported ? currentStatus : await createUnsupportedState(tab?.url ?? null),
          recentSaves
        };
        sendResponse(response);
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
        const recentSaves = await removeRecentSaveById(request.saveId);
        const tab = await getActiveTab();
        const msg = await t();
        const response: PopupState = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusDeletedRecent,
            canRetry: false
          },
          recentSaves
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "clear-recent-saves": {
        await clearRecentSaves();
        const tab = await getActiveTab();
        const msg = await t();
        const response: PopupState = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusClearedRecents,
            canRetry: false
          },
          recentSaves: []
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
