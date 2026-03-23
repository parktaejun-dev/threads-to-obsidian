import { queryDirectoryPermission, requestDirectoryPermission, supportsFileSystemAccess, writePostToDirectory } from "./lib/direct-save";
import { getObsidianDirectoryHandle } from "./lib/fs-handle-store";
import { type Locale, type Messages, getLocale, setLocale, t } from "./lib/i18n";
import { resolveImageDownloadPolicy } from "./lib/media-permissions";
import { isNotionConfigured } from "./lib/notion";
import { findDuplicateSave, findRecentSaveByUrl, getEffectiveOptions, upsertRecentSave } from "./lib/storage";
import type { ExtractedPost, PopupState, RecentSave, SaveStatus, SaveTarget } from "./lib/types";
import { cleanTextLines, normalizeThreadsUrl } from "./lib/utils";

const statusLabel = document.querySelector<HTMLDivElement>("#status-label");
const subtitle = document.querySelector<HTMLParagraphElement>("#subtitle");
const saveButton = document.querySelector<HTMLButtonElement>("#save-button");
const retryButton = document.querySelector<HTMLButtonElement>("#retry-button");
const recentList = document.querySelector<HTMLUListElement>("#recent-list");
const openOptionsButton = document.querySelector<HTMLButtonElement>("#open-options");
const clearRecentsButton = document.querySelector<HTMLButtonElement>("#clear-recents");
const languageSwitch = document.querySelector<HTMLElement>("#language-switch");
const languageButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-locale]"));

let latestStatus: SaveStatus | null = null;
let cachedDirectoryHandle: FileSystemDirectoryHandle | null = null;
let cachedDirectReady = false;
let cachedPermissionState: PermissionState | "unsupported" = "prompt";
let cachedSaveTarget: SaveTarget = "obsidian";
let cachedNotionReady = false;
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

  if (cachedSaveTarget === "notion") {
    return {
      kind: "idle",
      message: cachedNotionReady ? msg.statusReady : msg.statusNotionSetupRequired,
      canRetry: false
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

function applyLanguageSwitch(locale: Locale): void {
  if (languageSwitch) {
    languageSwitch.setAttribute("aria-label", msg.uiLanguageLabel);
  }

  for (const button of languageButtons) {
    const buttonLocale = button.dataset.locale;
    const isActive = buttonLocale === locale;
    button.textContent = buttonLocale === "ko" ? msg.uiLanguageKo : msg.uiLanguageEn;
    button.classList.toggle("language-option-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
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
        saveButton.disabled = !state.supported || (cachedSaveTarget === "notion" && !cachedNotionReady);
      }
    });
  }
}

async function refreshSaveTargetState(): Promise<void> {
  const options = await getEffectiveOptions();
  cachedSaveTarget = options.saveTarget;

  if (cachedSaveTarget === "notion") {
    cachedDirectoryHandle = null;
    cachedDirectReady = false;
    cachedPermissionState = "unsupported";
    cachedNotionReady = isNotionConfigured(options.notion);
    setSubtitle(cachedNotionReady ? msg.popupSubtitleNotion : msg.popupSubtitleNotionSetup);
    return;
  }

  cachedNotionReady = false;
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
  await refreshSaveTargetState();
  const renderedRecentSaves = await repairVisibleRecentSaves(state);
  setStatus(overrideStatus ?? (useIdleStatus ? getIdleStatus(state.supported) : state.status));
  renderRecentSaves(renderedRecentSaves);
  if (saveButton) {
    saveButton.disabled = !state.supported || (cachedSaveTarget === "notion" && !cachedNotionReady);
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
  const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash, "obsidian");
  const recent: RecentSave = duplicate
    ? {
      ...duplicate,
      saveTarget: "obsidian",
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
      remotePageId: null,
      remotePageUrl: null,
      warning,
      post
    }
    : {
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
      savedVia: "direct",
      savedRelativePath,
      remotePageId: null,
      remotePageUrl: null,
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

  const options = await getEffectiveOptions();
  const post = await extractCurrentPost();

  const existingSave = await findRecentSaveByUrl(post.canonicalUrl, "obsidian");
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
      imagePolicy.fallbackWarning,
      options.savePathPattern,
      options.aiOrganization
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
  const options = await getEffectiveOptions();
  const imagePolicy = await resolveImageDownloadPolicy(post, options.includeImages, true);

  return {
    allowImageDownloads: imagePolicy.allowImageDownloads,
    imageFallbackWarning: imagePolicy.fallbackWarning
  };
}

async function saveCurrent(): Promise<void> {
  setStatus({ kind: "saving", message: msg.statusSaving });

  try {
    const options = await getEffectiveOptions();
    if (options.saveTarget === "notion") {
      const status = (await chrome.runtime.sendMessage({
        type: "save-current-post",
        allowDuplicate: false
      })) as SaveStatus;
      await refreshPopupState(false, status);
      return;
    }

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

  if (item.saveTarget === "notion") {
    const status = (await chrome.runtime.sendMessage({
      type: "redownload-save",
      saveId: item.id
    })) as SaveStatus;
    await refreshPopupState(false, status);
    return;
  }

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
    const options = await getEffectiveOptions();
    const imagePolicy = await resolveImageDownloadPolicy(item.post, options.includeImages, true);
    const result = await writePostToDirectory(
      cachedDirectoryHandle,
      item.post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning,
      options.savePathPattern,
      options.aiOrganization
    );
    const updatedSave: RecentSave = {
      ...item,
      saveTarget: "obsidian",
      downloadedAt: new Date().toISOString(),
      archiveName: result.archiveName,
      savedVia: "direct",
      savedRelativePath: result.savedRelativePath,
      remotePageId: null,
      remotePageUrl: null,
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

async function openLocalizedOptionsPage(): Promise<void> {
  const locale = await getLocale();
  const baseUrl = chrome.runtime.getURL("options.html");
  const optionsUrl = `${baseUrl}?locale=${locale}`;
  const [existingTab] = await chrome.tabs.query({
    url: [baseUrl, `${baseUrl}?*`, `${baseUrl}#*`]
  });

  if (existingTab?.id) {
    await chrome.tabs.update(existingTab.id, { active: true, url: optionsUrl });
    if (typeof existingTab.windowId === "number") {
      await chrome.windows.update(existingTab.windowId, { focused: true });
    }
    return;
  }

  await chrome.tabs.create({ url: optionsUrl });
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
  await openLocalizedOptionsPage();
});

clearRecentsButton?.addEventListener("click", async () => {
  const state = (await chrome.runtime.sendMessage({ type: "clear-recent-saves" })) as PopupState;
  expandedSaveIds.clear();
  await refreshSaveTargetState();
  setStatus(state.status);
  renderRecentSaves(state.recentSaves);
  if (saveButton) {
    saveButton.disabled = !state.supported || (cachedSaveTarget === "notion" && !cachedNotionReady);
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
  document.documentElement.lang = locale;
  applyLanguageSwitch(locale);

  for (const button of languageButtons) {
    button.addEventListener("click", async () => {
      const next = button.dataset.locale;
      if (next !== "ko" && next !== "en") {
        return;
      }

      const current = await getLocale();
      if (current === next) {
        return;
      }

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
  const promoTitle = document.querySelector("#promo-slot-title");
  if (promoTitle) { promoTitle.textContent = msg.popupPromoTitle; }
  const promoDescription = document.querySelector("#promo-slot-description");
  if (promoDescription) { promoDescription.textContent = msg.popupPromoDescription; }
  await refreshPopupState(true);
})();
