import { DEFAULT_OPTIONS } from "./lib/config";
import { pickDirectoryHandle, queryDirectoryPermission, supportsFileSystemAccess } from "./lib/direct-save";
import { clearObsidianDirectoryHandle, getObsidianDirectoryRecord, setObsidianDirectoryHandle } from "./lib/fs-handle-store";
import { type Messages, getLocale, setLocale, t } from "./lib/i18n";
import { getOptions, setOptions } from "./lib/storage";
import type { ExtensionOptions } from "./lib/types";

const form = document.querySelector<HTMLFormElement>("#options-form");
const filenamePattern = document.querySelector<HTMLInputElement>("#filename-pattern");
const includeImages = document.querySelector<HTMLInputElement>("#include-images");
const saveStatus = document.querySelector<HTMLParagraphElement>("#save-status");
const folderStatus = document.querySelector<HTMLParagraphElement>("#folder-status");
const folderLabel = document.querySelector<HTMLElement>("#folder-label");
const connectFolderButton = document.querySelector<HTMLButtonElement>("#connect-folder");
const disconnectFolderButton = document.querySelector<HTMLButtonElement>("#disconnect-folder");
const langToggle = document.querySelector<HTMLButtonElement>("#lang-toggle");

let msg: Messages;

function setSaveStatus(message: string): void {
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}

function setFolderStatus(message: string): void {
  if (folderStatus) {
    folderStatus.textContent = message;
  }
}

function applyOptions(options: ExtensionOptions): void {
  if (!filenamePattern || !includeImages) {
    return;
  }

  filenamePattern.value = options.filenamePattern;
  includeImages.checked = options.includeImages;
}

async function refreshFolderState(): Promise<void> {
  if (!folderLabel || !connectFolderButton || !disconnectFolderButton) {
    return;
  }

  if (!supportsFileSystemAccess()) {
    folderLabel.textContent = msg.optionsFolderUnsupported;
    setFolderStatus(msg.optionsFolderUnsupportedStatus);
    connectFolderButton.disabled = true;
    disconnectFolderButton.classList.add("hidden");
    return;
  }

  connectFolderButton.disabled = false;
  const record = await getObsidianDirectoryRecord();
  const options = await getOptions();
  const label = record?.label ?? options.obsidianFolderLabel ?? msg.optionsFolderNotConnected;
  folderLabel.textContent = label;

  if (!record) {
    setFolderStatus(msg.optionsFolderNotConnectedStatus);
    disconnectFolderButton.classList.add("hidden");
    return;
  }

  disconnectFolderButton.classList.remove("hidden");
  const permission = await queryDirectoryPermission(record.handle);
  if (permission === "granted") {
    setFolderStatus(msg.optionsFolderReady);
    return;
  }

  if (permission === "prompt") {
    setFolderStatus(msg.optionsFolderPermissionCheck);
    return;
  }

  if (permission === "denied") {
    setFolderStatus(msg.optionsFolderPermissionLost);
    return;
  }

  setFolderStatus(msg.optionsFolderChecked);
}

connectFolderButton?.addEventListener("click", async () => {
  try {
    const handle = await pickDirectoryHandle();
    await setObsidianDirectoryHandle(handle);
    const currentOptions = await getOptions();
    await setOptions({
      ...currentOptions,
      obsidianFolderLabel: handle.name
    });
    setSaveStatus(`"${handle.name}" folder connected.`);
    await refreshFolderState();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      setSaveStatus(msg.optionsFolderCancelled);
      return;
    }

    setSaveStatus(error instanceof Error ? error.message : msg.optionsFolderError);
  }
});

disconnectFolderButton?.addEventListener("click", async () => {
  await clearObsidianDirectoryHandle();
  const currentOptions = await getOptions();
  await setOptions({
    ...currentOptions,
    obsidianFolderLabel: null
  });
  setSaveStatus(msg.optionsFolderDisconnect);
  await refreshFolderState();
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!filenamePattern || !includeImages) {
    return;
  }

  const currentOptions = await getOptions();
  const nextOptions: ExtensionOptions = {
    ...currentOptions,
    filenamePattern: filenamePattern.value.trim() || DEFAULT_OPTIONS.filenamePattern,
    includeImages: includeImages.checked
  };

  await setOptions(nextOptions);
  setSaveStatus(msg.optionsSaved);
});

void (async () => {
  msg = await t();
  const locale = await getLocale();
  if (langToggle) {
    langToggle.textContent = locale === "ko" ? "EN" : "\ud55c";
    langToggle.addEventListener("click", async () => {
      const current = await getLocale();
      const next = current === "ko" ? "en" : "ko";
      await setLocale(next);
      location.reload();
    });
  }

  // Apply localized text to static elements
  const titleEl = document.querySelector("#options-title");
  if (titleEl) { titleEl.textContent = msg.optionsTitle; }
  const subtitleEl = document.querySelector("#options-subtitle");
  if (subtitleEl) { subtitleEl.textContent = msg.optionsSubtitle; }
  const folderSectionEl = document.querySelector("#folder-section-title");
  if (folderSectionEl) { folderSectionEl.textContent = msg.optionsFolderSection; }
  if (connectFolderButton) { connectFolderButton.textContent = msg.optionsFolderConnect; }
  const fileRulesEl = document.querySelector("#file-rules-title");
  if (fileRulesEl) { fileRulesEl.textContent = msg.optionsFileRules; }
  const step1 = document.querySelector("#step1");
  if (step1) { step1.textContent = msg.optionsStep1; }
  const step2 = document.querySelector("#step2");
  if (step2) { step2.textContent = msg.optionsStep2; }
  const step3 = document.querySelector("#step3");
  if (step3) { step3.textContent = msg.optionsStep3; }
  const metaLabel = document.querySelector("#folder-meta-label");
  if (metaLabel) { metaLabel.textContent = msg.optionsFolderLabel; }
  if (disconnectFolderButton) { disconnectFolderButton.textContent = msg.optionsFolderDisconnect; }
  const patternLabelEl = document.querySelector("#pattern-label");
  if (patternLabelEl) { patternLabelEl.textContent = msg.optionsFilenamePattern; }
  const tokensEl = document.querySelector("#tokens-hint");
  if (tokensEl) { tokensEl.textContent = msg.optionsFilenameTokens; }
  const imagesLabelEl = document.querySelector("#images-label");
  if (imagesLabelEl) { imagesLabelEl.textContent = msg.optionsIncludeImages; }
  const submitBtn = document.querySelector("#submit-btn");
  if (submitBtn) { submitBtn.textContent = msg.optionsSave; }

  const options = await getOptions();
  applyOptions({ ...DEFAULT_OPTIONS, ...options });
  await refreshFolderState();
})();
