import { queryDirectoryPermission, requestDirectoryPermission, supportsFileSystemAccess, writePostToDirectory } from "./lib/direct-save";
import { getObsidianDirectoryHandle } from "./lib/fs-handle-store";
import { type Messages, getLocale, setLocale, t } from "./lib/i18n";
import { resolveImageDownloadPolicy } from "./lib/media-permissions";
import { findDuplicateSave, findRecentSaveByUrl, getOptions, upsertRecentSave } from "./lib/storage";
import type { ExtractedPost, PopupState, RecentSave, SaveStatus } from "./lib/types";
import { cleanTextLines, normalizeThreadsUrl } from "./lib/utils";

const statusLabel = document.querySelector<HTMLDivElement>("#status-label");
const subtitle = document.querySelector<HTMLParagraphElement>("#subtitle");
const saveButton = document.querySelector<HTMLButtonElement>("#save-button");
const retryButton = document.querySelector<HTMLButtonElement>("#retry-button");
const recentList = document.querySelector<HTMLUListElement>("#recent-list");
const openOptionsButton = document.querySelector<HTMLButtonElement>("#open-options");
const clearRecentsButton = document.querySelector<HTMLButtonElement>("#clear-recents");
const langToggle = document.querySelector<HTMLButtonElement>("#lang-toggle");

let latestStatus: SaveStatus | null = null;
let cachedDirectoryHandle: FileSystemDirectoryHandle | null = null;
let cachedDirectReady = false;
let cachedPermissionState: PermissionState | "unsupported" = "prompt";
let activeRecentSaves: RecentSave[] = [];
const expandedSaveIds = new Set<string>();
let msg: Messages;

saveButton?.setAttribute("disabled", "true");

function getIdleStatus(supported: boolean): SaveStatus {
  if (!supported) {
    return {
      kind: "unsupported",
      message: msg.statusUnsupported
    };
  }

  return {
    kind: "idle",
    message: cachedDirectReady ? msg.statusReadyDirect : msg.statusReadyDownload,
    canRetry: false
  };
}

function setSubtitle(message: string): void {
  if (subtitle) {
    subtitle.textContent = message;
  }
}

function setStatus(status: SaveStatus): void {
  latestStatus = status;
  if (!statusLabel || !retryButton) {
    return;
  }

  statusLabel.textContent = status.message;
  retryButton.classList.toggle("hidden", !status.canRetry);
  retryButton.textContent = status.kind === "error" ? msg.statusRetry : msg.statusResaveButton;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function normalizePreviewText(item: RecentSave): string {
  const cleanedBody = normalizeBodyText(item);
  const firstBodyParagraph = cleanedBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .find(Boolean);

  if (firstBodyParagraph) {
    return firstBodyParagraph.replace(/\s+/g, " ").trim();
  }

  const firstReplyParagraph = normalizeReplyPreview(item);
  if (firstReplyParagraph) {
    return firstReplyParagraph.replace(/\s+/g, " ").trim();
  }

  const cleanedTitle = item.title.replace(/\s+/g, " ").trim();
  if (cleanedTitle && !/^Threads(?:\s|•|-)/i.test(cleanedTitle)) {
    return cleanedTitle;
  }

  return item.canonicalUrl;
}

function normalizeBodyText(item: RecentSave): string {
  const cleanedBody = cleanTextLines(item.post.text, item.author);
  return cleanedBody.replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeReplyPreview(item: RecentSave): string | null {
  return (
    item.post.authorReplies
      .map((reply) => cleanTextLines(reply.text, reply.author))
      .map((text) =>
        text
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .find(Boolean)
      )
      .find(Boolean) ?? null
  );
}

function hasUsableMainText(item: RecentSave): boolean {
  return normalizeBodyText(item).length > 0;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
}

function renderRecentSaves(items: RecentSave[]): void {
  if (!recentList) {
    return;
  }

  activeRecentSaves = items;
  clearRecentsButton?.classList.toggle("hidden", items.length === 0);

  if (items.length === 0) {
    recentList.innerHTML = `<li class="empty">${escapeHtml(msg.popupEmpty)}</li>`;
    return;
  }

  recentList.innerHTML = items
    .map((item) => {
      const preview = normalizePreviewText(item);
      const fullBody = normalizeBodyText(item) || normalizeReplyPreview(item) || item.canonicalUrl;
      const expanded = expandedSaveIds.has(item.id);
      const displayText = expanded ? preview : truncateText(preview, 50);
      const expandLabel = expanded ? msg.popupCollapse : msg.popupExpand;
      const resaveLabel = msg.popupResave;

      return `
        <li class="recent-item">
          <div class="recent-title">${escapeHtml(displayText)}</div>
          <div class="recent-meta">@${escapeHtml(item.author)} · ${escapeHtml(new Date(item.downloadedAt).toLocaleString())}</div>
          ${item.warning ? `<div class="recent-warning">${escapeHtml(item.warning)}</div>` : ""}
          <a class="recent-url" href="${escapeAttribute(item.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.canonicalUrl)}</a>
          ${expanded ? `<div class="recent-expanded">${escapeHtml(fullBody)}</div>` : ""}
          <div class="recent-actions-text">
            <button class="recent-text-action" data-toggle-id="${item.id}" type="button">${expandLabel}</button>
            <span class="recent-divider">·</span>
            <button class="recent-text-action" data-save-id="${item.id}" type="button">${resaveLabel}</button>
            <span class="recent-divider">·</span>
            <button class="recent-text-action recent-delete-text" data-delete-id="${item.id}" type="button">${msg.popupDelete}</button>
          </div>
        </li>
      `;
    })
    .join("");

  for (const button of recentList.querySelectorAll<HTMLButtonElement>("[data-toggle-id]")) {
    button.addEventListener("click", () => {
      const saveId = button.dataset.toggleId;
      if (!saveId) {
        return;
      }

      if (expandedSaveIds.has(saveId)) {
        expandedSaveIds.delete(saveId);
      } else {
        expandedSaveIds.add(saveId);
      }
      renderRecentSaves(items);
    });
  }

  for (const button of recentList.querySelectorAll<HTMLButtonElement>("[data-save-id]")) {
    button.addEventListener("click", async () => {
      const saveId = button.dataset.saveId;
      if (!saveId) {
        return;
      }

      const item = items.find((candidate) => candidate.id === saveId);
      if (!item) {
        return;
      }

      await resaveRecent(item);
    });
  }

  for (const button of recentList.querySelectorAll<HTMLButtonElement>("[data-delete-id]")) {
    button.addEventListener("click", async () => {
      const saveId = button.dataset.deleteId;
      if (!saveId) {
        return;
      }

      expandedSaveIds.delete(saveId);
      const state = (await chrome.runtime.sendMessage({ type: "delete-recent-save", saveId })) as PopupState;
      setStatus(state.status);
      renderRecentSaves(state.recentSaves);
      if (saveButton) {
        saveButton.disabled = !state.supported;
      }
    });
  }
}

async function refreshDirectSaveState(): Promise<void> {
  if (!supportsFileSystemAccess()) {
    cachedDirectoryHandle = null;
    cachedDirectReady = false;
    cachedPermissionState = "unsupported";
    setSubtitle(msg.popupSubtitleUnsupported);
    return;
  }

  cachedDirectoryHandle = await getObsidianDirectoryHandle();
  if (!cachedDirectoryHandle) {
    cachedDirectReady = false;
    cachedPermissionState = "prompt";
    setSubtitle(msg.popupSubtitleDownload);
    return;
  }

  const permission = await queryDirectoryPermission(cachedDirectoryHandle);
  cachedPermissionState = permission;
  cachedDirectReady = permission === "granted" || permission === "prompt";
  setSubtitle(
    permission === "granted"
      ? msg.popupSubtitleConnected
      : msg.popupSubtitlePermissionCheck
  );
}

async function refreshPopupState(useIdleStatus = false, overrideStatus?: SaveStatus): Promise<PopupState> {
  const state = (await chrome.runtime.sendMessage({ type: "get-popup-state" })) as PopupState;
  await refreshDirectSaveState();
  const renderedRecentSaves = await repairVisibleRecentSaves(state);
  setStatus(overrideStatus ?? (useIdleStatus ? getIdleStatus(state.supported) : state.status));
  renderRecentSaves(renderedRecentSaves);
  if (saveButton) {
    saveButton.disabled = !state.supported;
  }

  return {
    ...state,
    recentSaves: renderedRecentSaves
  };
}

async function extractCurrentPost(): Promise<ExtractedPost> {
  const response = (await chrome.runtime.sendMessage({ type: "extract-current-post" })) as ExtractedPost | { __error: string };
  if ("__error" in response) {
    throw new Error(response.__error);
  }

  return response;
}

async function repairVisibleRecentSaves(state: PopupState): Promise<RecentSave[]> {
  if (!state.supported || !state.currentUrl) {
    return state.recentSaves;
  }

  const normalizedCurrentUrl = normalizeThreadsUrl(state.currentUrl);
  const targetIndex = state.recentSaves.findIndex((item) => item.canonicalUrl === normalizedCurrentUrl);
  if (targetIndex < 0) {
    return state.recentSaves;
  }

  const target = state.recentSaves[targetIndex];
  if (!target || hasUsableMainText(target)) {
    return state.recentSaves;
  }

  try {
    const livePost = await extractCurrentPost();
    if (livePost.canonicalUrl !== target.canonicalUrl) {
      return state.recentSaves;
    }

    if (!cleanTextLines(livePost.text, livePost.author).trim()) {
      return state.recentSaves;
    }

    return state.recentSaves.map((item, index) =>
      index === targetIndex
        ? {
          ...item,
          title: livePost.title,
          contentHash: livePost.contentHash,
          post: livePost
        }
        : item
    );
  } catch {
    return state.recentSaves;
  }
}

function buildDirectSuccessMessage(warning: string | null): string {
  if (warning) {
    return `${msg.statusSavedDirect}: ${warning}`;
  }

  return msg.statusSavedDirect;
}

function mergeZipFallbackStatus(status: SaveStatus, reason: string | null): SaveStatus {
  if (!reason) {
    return status;
  }

  if (status.kind === "success") {
    return {
      ...status,
      message: `${reason}${msg.fallbackZipMessage}`
    };
  }

  return status;
}

async function recordDirectSave(post: ExtractedPost, archiveName: string, savedRelativePath: string, warning: string | null): Promise<RecentSave> {
  const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash);
  const recent: RecentSave = duplicate
    ? {
      ...duplicate,
      canonicalUrl: post.canonicalUrl,
      shortcode: post.shortcode,
      author: post.author,
      title: post.title,
      downloadedAt: new Date().toISOString(),
      archiveName,
      contentHash: post.contentHash,
      status: "complete",
      savedVia: "direct",
      savedRelativePath,
      warning,
      post
    }
    : {
      id: crypto.randomUUID(),
      canonicalUrl: post.canonicalUrl,
      shortcode: post.shortcode,
      author: post.author,
      title: post.title,
      downloadedAt: new Date().toISOString(),
      archiveName,
      contentHash: post.contentHash,
      status: "complete",
      savedVia: "direct",
      savedRelativePath,
      warning,
      post
    };

  await upsertRecentSave(recent);
  return recent;
}

async function tryDirectSaveCurrent(): Promise<{ status: SaveStatus } | { fallbackReason: string | null } | null> {
  if (!cachedDirectoryHandle) {
    return null;
  }

  const permitted = cachedPermissionState === "granted" ? true : await requestDirectoryPermission(cachedDirectoryHandle);
  if (!permitted) {
    cachedDirectReady = false;
    cachedPermissionState = "denied";
    return { fallbackReason: msg.fallbackPermissionDenied };
  }
  cachedDirectReady = true;
  cachedPermissionState = "granted";

  const options = await getOptions();
  const post = await extractCurrentPost();

  const existingSave = await findRecentSaveByUrl(post.canonicalUrl);
  if (existingSave) {
    return {
      status: {
        kind: "success",
        message: msg.statusAlreadySaved,
        saveId: existingSave.id,
        canRetry: true
      }
    };
  }

  const imagePolicy = await resolveImageDownloadPolicy(post, options.includeImages, true);
  try {
    const result = await writePostToDirectory(
      cachedDirectoryHandle,
      post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning
    );
    const recent = await recordDirectSave(post, result.archiveName, result.savedRelativePath, result.warning);

    return {
      status: {
        kind: "success",
        message: buildDirectSuccessMessage(result.warning),
        saveId: recent.id,
        canRetry: true
      }
    };
  } catch (error) {
    return {
      fallbackReason: error instanceof Error ? error.message : msg.fallbackDirectFailed
    };
  }
}

async function resolveZipImageOverride(post: ExtractedPost): Promise<{
  allowImageDownloads: boolean;
  imageFallbackWarning: string;
}> {
  const options = await getOptions();
  const imagePolicy = await resolveImageDownloadPolicy(post, options.includeImages, true);

  return {
    allowImageDownloads: imagePolicy.allowImageDownloads,
    imageFallbackWarning: imagePolicy.fallbackWarning
  };
}

async function saveCurrent(): Promise<void> {
  setStatus({ kind: "saving", message: msg.statusSaving });

  try {
    const directResult = await tryDirectSaveCurrent();
    if (directResult && "status" in directResult) {
      await refreshPopupState(false, directResult.status);
      return;
    }

    const currentPost = await extractCurrentPost();
    const imageOverride = await resolveZipImageOverride(currentPost);
    const zipStatus = (await chrome.runtime.sendMessage({
      type: "save-current-post",
      allowDuplicate: false,
      allowImageDownloads: imageOverride.allowImageDownloads,
      imageFallbackWarning: imageOverride.imageFallbackWarning
    })) as SaveStatus;

    await refreshPopupState(false, mergeZipFallbackStatus(zipStatus, directResult?.fallbackReason ?? null));
  } catch (error) {
    const failed = {
      kind: "error",
      message: error instanceof Error ? error.message : msg.statusError,
      canRetry: true
    } satisfies SaveStatus;
    setStatus(failed);
  }
}

async function resaveRecent(item: RecentSave): Promise<void> {
  setStatus({ kind: "saving", message: msg.statusResaving });

  if (item.savedVia === "zip") {
    const imageOverride = await resolveZipImageOverride(item.post);
    const status = (await chrome.runtime.sendMessage({
      type: "redownload-save",
      saveId: item.id,
      allowImageDownloads: imageOverride.allowImageDownloads,
      imageFallbackWarning: imageOverride.imageFallbackWarning
    })) as SaveStatus;
    await refreshPopupState(false, status);
    return;
  }

  if (!cachedDirectoryHandle) {
    const imageOverride = await resolveZipImageOverride(item.post);
    const status = (await chrome.runtime.sendMessage({
      type: "redownload-save",
      saveId: item.id,
      allowImageDownloads: imageOverride.allowImageDownloads,
      imageFallbackWarning: imageOverride.imageFallbackWarning
    })) as SaveStatus;
    await refreshPopupState(false, mergeZipFallbackStatus(status, msg.fallbackNoFolder));
    return;
  }

  const permitted = cachedPermissionState === "granted" ? true : await requestDirectoryPermission(cachedDirectoryHandle);
  if (!permitted) {
    cachedDirectReady = false;
    cachedPermissionState = "denied";
    const status = (await chrome.runtime.sendMessage({ type: "redownload-save", saveId: item.id })) as SaveStatus;
    await refreshPopupState(false, mergeZipFallbackStatus(status, msg.fallbackPermissionDenied));
    return;
  }
  cachedDirectReady = true;
  cachedPermissionState = "granted";

  try {
    const options = await getOptions();
    const imagePolicy = await resolveImageDownloadPolicy(item.post, options.includeImages, true);
    const result = await writePostToDirectory(
      cachedDirectoryHandle,
      item.post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning
    );
    const updatedSave: RecentSave = {
      ...item,
      downloadedAt: new Date().toISOString(),
      archiveName: result.archiveName,
      savedVia: "direct",
      savedRelativePath: result.savedRelativePath,
      warning: result.warning,
      status: "complete"
    };
    await upsertRecentSave(updatedSave);
    await refreshPopupState(false, {
      kind: "success",
      message: buildDirectSuccessMessage(result.warning),
      saveId: updatedSave.id,
      canRetry: true
    });
  } catch (error) {
    const imageOverride = await resolveZipImageOverride(item.post);
    const status = (await chrome.runtime.sendMessage({
      type: "redownload-save",
      saveId: item.id,
      allowImageDownloads: imageOverride.allowImageDownloads,
      imageFallbackWarning: imageOverride.imageFallbackWarning
    })) as SaveStatus;
    const reason = error instanceof Error ? error.message : msg.fallbackDirectFailed;
    await refreshPopupState(false, mergeZipFallbackStatus(status, reason));
  }
}

saveButton?.addEventListener("click", async () => {
  await saveCurrent();
});

retryButton?.addEventListener("click", async () => {
  if (latestStatus?.saveId) {
    const recent = activeRecentSaves.find((item) => item.id === latestStatus?.saveId);
    if (recent) {
      await resaveRecent(recent);
      return;
    }
  }

  await saveCurrent();
});

openOptionsButton?.addEventListener("click", async () => {
  await chrome.runtime.openOptionsPage();
});

clearRecentsButton?.addEventListener("click", async () => {
  const state = (await chrome.runtime.sendMessage({ type: "clear-recent-saves" })) as PopupState;
  expandedSaveIds.clear();
  await refreshDirectSaveState();
  setStatus(state.status);
  renderRecentSaves(state.recentSaves);
  if (saveButton) {
    saveButton.disabled = !state.supported;
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "save-status") {
    setStatus(message.status as SaveStatus);
  }
});

void (async () => {
  msg = await t();
  const locale = await getLocale();
  if (langToggle) {
    langToggle.textContent = locale === "ko" ? "EN" : "한";
    langToggle.addEventListener("click", async () => {
      const current = await getLocale();
      const next = current === "ko" ? "en" : "ko";
      await setLocale(next);
      location.reload();
    });
  }
  const titleEl = document.querySelector("#header-title");
  if (titleEl) { titleEl.textContent = msg.popupTitle; }
  if (saveButton) { saveButton.textContent = msg.popupSave; }
  const recentTitle = document.querySelector("#recent-title");
  if (recentTitle) { recentTitle.textContent = msg.popupRecentSaves; }
  if (clearRecentsButton) { clearRecentsButton.textContent = msg.popupClearAll; }
  if (openOptionsButton) { openOptionsButton.textContent = msg.popupSettings; }
  await refreshPopupState(true);
})();
