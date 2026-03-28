import { DEFAULT_AI_ORGANIZATION_PROMPT, DEFAULT_OPTIONS, NOTION_UI_HIDDEN, getAiProviderKeyMismatch, getAiProviderPreset } from "./lib/config";
import { fetchCloudConnectionStatus } from "./lib/cloud-server";
import { pickDirectoryHandle, queryDirectoryPermission, supportsFileSystemAccess } from "./lib/direct-save";
import { clearObsidianDirectoryHandle, getObsidianDirectoryRecord, setObsidianDirectoryHandle } from "./lib/fs-handle-store";
import { type Locale, type Messages, getLocale, setLocale, t } from "./lib/i18n";
import { getAiPermissionPattern, requestAiHostPermission } from "./lib/llm";
import { disconnectNotionConnection, fetchNotionConnectionSummary, searchNotionLocations, selectNotionLocation, startNotionOAuthSession } from "./lib/notion-server";
import { activateProLicense, clearProLicense, getOptions, getPlanStatus, setOptions } from "./lib/storage";
import { AI_PROVIDER_VALUES, type AiProvider, type ExtensionOptions, type NotionConnectionSummary, type NotionLocationOption, type NotionParentType, type PlanStatus, type SaveTarget } from "./lib/types";
import { SUPPORTED_LOCALES, getLocaleLabel, isSupportedLocale } from "@threads/shared/locale";

const form = document.querySelector<HTMLFormElement>("#options-form");
const filenamePattern = document.querySelector<HTMLInputElement>("#filename-pattern");
const savePathPattern = document.querySelector<HTMLInputElement>("#save-path-pattern");
const saveTarget = document.querySelector<HTMLSelectElement>("#save-target");
const notionSection = document.querySelector<HTMLElement>("#notion-section");
const cloudSection = document.querySelector<HTMLElement>("#cloud-section");
const cloudConnectionStatus = document.querySelector<HTMLParagraphElement>("#cloud-connection-status");
const connectCloudButton = document.querySelector<HTMLButtonElement>("#connect-cloud");
const disconnectCloudButton = document.querySelector<HTMLButtonElement>("#disconnect-cloud");
const notionConnectionStatus = document.querySelector<HTMLParagraphElement>("#notion-connection-status");
const notionWorkspaceMeta = document.querySelector<HTMLParagraphElement>("#notion-workspace-meta");
const connectNotionButton = document.querySelector<HTMLButtonElement>("#connect-notion");
const disconnectNotionButton = document.querySelector<HTMLButtonElement>("#disconnect-notion");
const notionParentType = document.querySelector<HTMLSelectElement>("#notion-parent-type");
const notionSelectedTarget = document.querySelector<HTMLParagraphElement>("#notion-selected-target");
const notionSearchQuery = document.querySelector<HTMLInputElement>("#notion-search-query");
const notionSearchButton = document.querySelector<HTMLButtonElement>("#search-notion");
const notionLocationResults = document.querySelector<HTMLSelectElement>("#notion-location-results");
const notionUseLocationButton = document.querySelector<HTMLButtonElement>("#use-notion-location");
const notionUploadMedia = document.querySelector<HTMLInputElement>("#notion-upload-media");
const includeImages = document.querySelector<HTMLInputElement>("#include-images");
const saveStatus = document.querySelector<HTMLParagraphElement>("#save-status");
const folderSection = document.querySelector<HTMLElement>("#folder-section");
const folderStatus = document.querySelector<HTMLParagraphElement>("#folder-status");
const folderPathPreview = document.querySelector<HTMLElement>("#folder-path-preview");
const connectFolderButton = document.querySelector<HTMLButtonElement>("#connect-folder");
const disconnectFolderButton = document.querySelector<HTMLButtonElement>("#disconnect-folder");
const languageSwitch = document.querySelector<HTMLElement>("#language-switch");
const languageSelect = document.querySelector<HTMLSelectElement>("#language-select");
const planSpotlight = document.querySelector<HTMLElement>("#plan-spotlight");
const planSpotlightBadge = document.querySelector<HTMLElement>("#plan-spotlight-badge");
const planSpotlightTitle = document.querySelector<HTMLElement>("#plan-spotlight-title");
const planSpotlightCopy = document.querySelector<HTMLElement>("#plan-spotlight-copy");
const planSpotlightMeta = document.querySelector<HTMLElement>("#plan-spotlight-meta");
const proAiNote = document.querySelector<HTMLParagraphElement>("#pro-ai-note");
const proStatus = document.querySelector<HTMLParagraphElement>("#pro-status");
const proLicenseMeta = document.querySelector<HTMLParagraphElement>("#pro-license-meta");
const proPlanBadge = document.querySelector<HTMLSpanElement>("#pro-plan-badge");
const proLicenseKey = document.querySelector<HTMLInputElement>("#pro-license-key");
const activateProButton = document.querySelector<HTMLButtonElement>("#activate-pro");
const clearProButton = document.querySelector<HTMLButtonElement>("#clear-pro");
const proSalesLink = document.querySelector<HTMLAnchorElement>("#pro-sales-link");
const patternLockHint = document.querySelector<HTMLSpanElement>("#pattern-lock-hint");
const savePathLockHint = document.querySelector<HTMLSpanElement>("#save-path-lock-hint");
const cmpSave = document.querySelector<HTMLTableCellElement>("#cmp-save");
const cmpImages = document.querySelector<HTMLTableCellElement>("#cmp-images");
const cmpReplies = document.querySelector<HTMLTableCellElement>("#cmp-replies");
const cmpDupes = document.querySelector<HTMLTableCellElement>("#cmp-dupes");
const cmpFilename = document.querySelector<HTMLTableCellElement>("#cmp-filename");
const cmpFolder = document.querySelector<HTMLTableCellElement>("#cmp-folder");
const cmpNotionDataSource = document.querySelector<HTMLTableCellElement>("#cmp-notion-data-source");
const cmpNotionMediaUpload = document.querySelector<HTMLTableCellElement>("#cmp-notion-media-upload");
const cmpAiSummary = document.querySelector<HTMLTableCellElement>("#cmp-ai-summary");
const cmpAiTags = document.querySelector<HTMLTableCellElement>("#cmp-ai-tags");
const cmpAiFrontmatter = document.querySelector<HTMLTableCellElement>("#cmp-ai-frontmatter");
const compareFreeLabel = document.querySelector<HTMLTableCellElement>("#compare-free-label");
const compareProLabel = document.querySelector<HTMLTableCellElement>("#compare-pro-label");
const aiEnabled = document.querySelector<HTMLInputElement>("#ai-enabled");
const aiProvider = document.querySelector<HTMLSelectElement>("#ai-provider");
const aiApiKey = document.querySelector<HTMLInputElement>("#ai-api-key");
const aiBaseUrl = document.querySelector<HTMLInputElement>("#ai-base-url");
const aiModel = document.querySelector<HTMLInputElement>("#ai-model");
const aiPrompt = document.querySelector<HTMLTextAreaElement>("#ai-prompt");
const aiQuickstart = document.querySelector<HTMLParagraphElement>("#ai-quickstart");
const aiAdvancedPanel = document.querySelector<HTMLDetailsElement>(".ai-advanced-panel");
const aiAdvancedSummary = document.querySelector<HTMLElement>("#ai-advanced-summary");
const aiLockHint = document.querySelector<HTMLSpanElement>("#ai-lock-hint");

let msg: Messages;
let currentPlan: PlanStatus = {
  tier: "free",
  licenseState: "none",
  holder: null,
  expiresAt: null,
  activationState: "none",
  seatLimit: null,
  seatsUsed: null,
  deviceLabel: null,
  activatedAt: null
};
let connectedFolderName: string | null = null;
let currentSaveTarget: SaveTarget = DEFAULT_OPTIONS.saveTarget;
let notionLocationOptions: NotionLocationOption[] = [];
let notionPollTimer: number | null = null;
const DIRTY_FIELD_IDS = new Set([
  "save-target",
  "notion-parent-type",
  "notion-upload-media",
  "filename-pattern",
  "save-path-pattern",
  "include-images",
  "ai-enabled",
  "ai-provider",
  "ai-api-key",
  "ai-base-url",
  "ai-model",
  "ai-prompt"
]);

function getLocaleFromSearch(): Locale | null {
  const value = new URLSearchParams(window.location.search).get("locale");
  return isSupportedLocale(value) ? value : null;
}

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

function normalizePathPatternForDisplay(value: string): string {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

function renderFolderPathPreview(): void {
  if (!folderPathPreview) {
    return;
  }

  if (!connectedFolderName) {
    folderPathPreview.textContent = msg.optionsFolderPathUnavailable;
    return;
  }

  const activePathPattern = currentPlan.tier === "pro" ? normalizePathPatternForDisplay(savePathPattern?.value.trim() ?? "") : "";
  folderPathPreview.textContent = activePathPattern ? `${connectedFolderName}/${activePathPattern}` : `${connectedFolderName}/`;
}

function getCurrentSaveTarget(): SaveTarget {
  if (saveTarget?.value === "notion") {
    return "notion";
  }
  if (saveTarget?.value === "cloud") {
    return "cloud";
  }
  return "obsidian";
}

function hideNotionRows(): void {
  cmpNotionDataSource?.closest("tr")?.classList.toggle("hidden", NOTION_UI_HIDDEN);
  cmpNotionMediaUpload?.closest("tr")?.classList.toggle("hidden", NOTION_UI_HIDDEN);
}

function applyNotionUiVisibility(): void {
  if (!saveTarget) {
    hideNotionRows();
    notionSection?.classList.toggle("hidden", NOTION_UI_HIDDEN || currentSaveTarget !== "notion");
    return;
  }

  const notionOption = saveTarget.querySelector<HTMLOptionElement>('option[value="notion"]');
  if (notionOption) {
    notionOption.hidden = NOTION_UI_HIDDEN;
    notionOption.disabled = NOTION_UI_HIDDEN;
  }

  if (NOTION_UI_HIDDEN && saveTarget.value === "notion") {
    saveTarget.value = "obsidian";
  }

  currentSaveTarget = getCurrentSaveTarget();
  notionSection?.classList.toggle("hidden", NOTION_UI_HIDDEN || currentSaveTarget !== "notion");
  hideNotionRows();
}

function getCurrentNotionParentType(): NotionParentType {
  return notionParentType?.value === "data_source" ? "data_source" : "page";
}

function getSelectedNotionTargetId(): string {
  return getCurrentNotionParentType() === "data_source" ? notionLocationResults?.value ?? "" : notionLocationResults?.value ?? "";
}

function isCurrentNotionConnected(): boolean {
  return notionConnectionStatus?.dataset.connected === "true";
}

function isNotionReadyForSelection(): boolean {
  return isCurrentNotionConnected() && Boolean(notionSelectedTarget?.dataset.targetId);
}

function renderNotionParentState(): void {
  const parentType = getCurrentNotionParentType();
  if (notionSearchQuery) {
    notionSearchQuery.placeholder = parentType === "data_source" ? msg.optionsNotionSearchPlaceholderDataSource : msg.optionsNotionSearchPlaceholderPage;
  }
}

function renderNotionPlanState(): void {
  const isPro = currentPlan.tier === "pro";
  const notionUiAvailable = !NOTION_UI_HIDDEN;
  cloudSection?.classList.toggle("hidden", false);
  const cloudOption = saveTarget?.querySelector<HTMLOptionElement>('option[value="cloud"]');
  if (cloudOption) {
    cloudOption.disabled = !isPro;
  }

  if (!isPro && saveTarget?.value === "cloud") {
    saveTarget.value = "obsidian";
  }

  const notionOption = saveTarget?.querySelector<HTMLOptionElement>('option[value="notion"]');
  if (notionOption) {
    notionOption.disabled = !isPro || !notionUiAvailable;
  }

  if ((!isPro || !notionUiAvailable) && saveTarget?.value === "notion") {
    saveTarget.value = "obsidian";
  }

  const dataSourceOption = notionParentType?.querySelector<HTMLOptionElement>('option[value="data_source"]');
  if (dataSourceOption) {
    dataSourceOption.disabled = !isPro || !notionUiAvailable;
  }

  if (!isPro && notionParentType?.value === "data_source") {
    notionParentType.value = "page";
  }

  if (connectCloudButton) {
    connectCloudButton.disabled = !isPro;
  }

  if (disconnectCloudButton) {
    disconnectCloudButton.disabled = !isPro;
  }

  if (notionUploadMedia) {
    notionUploadMedia.disabled = !isPro || !notionUiAvailable || !isNotionReadyForSelection();
    if (!isPro) {
      notionUploadMedia.checked = false;
    }
  }

  if (connectNotionButton) {
    connectNotionButton.disabled = !isPro || !notionUiAvailable;
  }

  if (disconnectNotionButton) {
    disconnectNotionButton.disabled = !isPro || !notionUiAvailable;
  }

  if (notionParentType) {
    notionParentType.disabled = !isPro || !notionUiAvailable || !isCurrentNotionConnected();
  }

  if (notionSearchQuery) {
    notionSearchQuery.disabled = !isPro || !notionUiAvailable || !isCurrentNotionConnected();
  }

  if (notionSearchButton) {
    notionSearchButton.disabled = !isPro || !notionUiAvailable || !isCurrentNotionConnected();
  }

  if (notionLocationResults) {
    notionLocationResults.disabled = !isPro || !notionUiAvailable || !isCurrentNotionConnected();
  }

  if (notionUseLocationButton) {
    notionUseLocationButton.disabled = !isPro || !notionUiAvailable || !isCurrentNotionConnected() || notionLocationOptions.length === 0;
  }

  const dataSourceLockHint = document.querySelector<HTMLElement>("#notion-data-source-lock-hint");
  if (dataSourceLockHint) {
    dataSourceLockHint.textContent = isPro ? "" : msg.optionsNotionOAuthRequiresPro;
  }

  const uploadMediaLockHint = document.querySelector<HTMLElement>("#notion-upload-media-lock-hint");
  if (uploadMediaLockHint) {
    uploadMediaLockHint.textContent = isPro ? "" : msg.optionsNotionOAuthRequiresPro;
  }

  renderNotionParentState();
}

function formatCloudStatusCopy(
  state: Awaited<ReturnType<typeof fetchCloudConnectionStatus>>
): string {
  if (currentPlan.tier !== "pro") {
    return msg.optionsCloudRequiresPro;
  }

  if (state.state === "linked") {
    return msg.optionsCloudStatusLinked.replace("{handle}", state.userHandle ?? "unknown");
  }

  if (state.state === "expired" || state.state === "revoked") {
    return msg.optionsCloudStatusExpired;
  }

  if (state.state === "offline") {
    return msg.optionsCloudStatusOffline;
  }

  return msg.optionsCloudStatusUnlinked;
}

async function refreshCloudConnectionState(): Promise<void> {
  if (!cloudConnectionStatus || !connectCloudButton || !disconnectCloudButton) {
    return;
  }

  const connection = await fetchCloudConnectionStatus();
  cloudConnectionStatus.textContent = formatCloudStatusCopy(connection);
  const connected = connection.state === "linked" || connection.state === "offline";
  connectCloudButton.classList.toggle("hidden", connected || currentPlan.tier !== "pro");
  disconnectCloudButton.classList.toggle("hidden", !connected || currentPlan.tier !== "pro");
  connectCloudButton.disabled = currentPlan.tier !== "pro";
  disconnectCloudButton.disabled = currentPlan.tier !== "pro";
}

function renderSaveTargetState(): void {
  currentSaveTarget = getCurrentSaveTarget();
  renderNotionPlanState();
  currentSaveTarget = getCurrentSaveTarget();
  folderSection?.classList.toggle("hidden", currentSaveTarget !== "obsidian");
  applyNotionUiVisibility();
}

function setNotionConnectionDisplay(summary: NotionConnectionSummary | null): void {
  const connected = Boolean(summary?.connected);
  if (notionConnectionStatus) {
    notionConnectionStatus.dataset.connected = String(connected);
    notionConnectionStatus.textContent = connected ? msg.optionsNotionConnected : msg.optionsNotionDisconnected;
  }

  if (notionWorkspaceMeta) {
    const workspaceText = summary?.workspaceName?.trim() || "";
    notionWorkspaceMeta.textContent = workspaceText;
    notionWorkspaceMeta.classList.toggle("hidden", workspaceText.length === 0);
  }

  if (disconnectNotionButton) {
    disconnectNotionButton.classList.toggle("hidden", !connected);
  }

  const targetId = summary?.selectedParentId?.trim() || "";
  if (notionSelectedTarget) {
    notionSelectedTarget.dataset.targetId = targetId;
    notionSelectedTarget.textContent =
      summary?.selectedParentLabel?.trim() ||
      (connected ? msg.optionsNotionTargetNotSelected : msg.optionsNotionConnectFirst);
  }
}

function populateNotionLocationResults(items: NotionLocationOption[]): void {
  notionLocationOptions = items;
  if (!notionLocationResults) {
    return;
  }

  notionLocationResults.replaceChildren(
    ...items.map((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.subtitle ? `${item.label} · ${item.subtitle}` : item.label;
      return option;
    })
  );

  if (items.length > 0) {
    notionLocationResults.value = items[0]?.id ?? "";
  }
  renderNotionPlanState();
}

function mergeNotionSummaryIntoOptions(
  options: ExtensionOptions,
  summary: NotionConnectionSummary | null
): ExtensionOptions {
  const connected = Boolean(summary?.connected);
  const selectedParentType = summary?.selectedParentType ?? options.notion.parentType;
  const selectedParentId = summary?.selectedParentId ?? "";
  return {
    ...options,
    notion: {
      ...options.notion,
      token: "",
      oauthConnected: connected,
      workspaceId: summary?.workspaceId ?? "",
      workspaceName: summary?.workspaceName ?? "",
      workspaceIcon: summary?.workspaceIcon ?? "",
      parentType: selectedParentType,
      parentPageId: selectedParentType === "page" ? selectedParentId : "",
      dataSourceId: selectedParentType === "data_source" ? selectedParentId : "",
      selectedParentLabel: summary?.selectedParentLabel ?? "",
      selectedParentUrl: summary?.selectedParentUrl ?? ""
    }
  };
}

async function persistNotionSummary(summary: NotionConnectionSummary | null): Promise<void> {
  const currentOptions = await getOptions();
  await setOptions(mergeNotionSummaryIntoOptions(currentOptions, summary));
  setNotionConnectionDisplay(summary);
}

async function refreshNotionConnectionState(): Promise<void> {
  if (currentPlan.tier !== "pro") {
    await persistNotionSummary(null);
    return;
  }

  try {
    const summary = await fetchNotionConnectionSummary();
    await persistNotionSummary(summary);
  } catch {
    setNotionConnectionDisplay(null);
  } finally {
    renderNotionPlanState();
  }
}

function stopNotionConnectionPolling(): void {
  if (notionPollTimer !== null) {
    window.clearInterval(notionPollTimer);
    notionPollTimer = null;
  }
}

function startNotionConnectionPolling(): void {
  stopNotionConnectionPolling();
  let attempts = 0;
  notionPollTimer = window.setInterval(async () => {
    attempts += 1;
    await refreshNotionConnectionState();
    if (isCurrentNotionConnected() || attempts >= 60) {
      stopNotionConnectionPolling();
    }
  }, 2000);
}

function isAiProvider(value: string | null | undefined): value is AiProvider {
  return AI_PROVIDER_VALUES.some((provider) => provider === value);
}

function getCurrentAiProvider(): AiProvider {
  return isAiProvider(aiProvider?.value) ? aiProvider.value : DEFAULT_OPTIONS.aiOrganization.provider;
}

function getAiProviderLabel(provider: AiProvider): string {
  switch (provider) {
    case "openrouter":
      return msg.optionsAiProviderOpenRouter;
    case "deepseek":
      return msg.optionsAiProviderDeepSeek;
    case "gemini":
      return msg.optionsAiProviderGemini;
    case "ollama":
      return msg.optionsAiProviderOllama;
    case "custom":
      return msg.optionsAiProviderCustom;
    case "openai":
    default:
      return msg.optionsAiProviderOpenAi;
  }
}

function getAiProviderMismatchMessage(provider: AiProvider, apiKey: string): string | null {
  const mismatch = getAiProviderKeyMismatch(provider, apiKey);
  if (mismatch === "gemini_key_looks_openai") {
    return msg.optionsAiKeyMismatchGemini;
  }

  if (mismatch === "openai_compatible_key_looks_gemini") {
    return msg.optionsAiKeyMismatchOpenAi;
  }

  return null;
}

function renderAiProviderOptions(): void {
  if (!aiProvider) {
    return;
  }

  const selectedProvider = getCurrentAiProvider();
  aiProvider.replaceChildren(
    ...AI_PROVIDER_VALUES.map((provider) => {
      const option = document.createElement("option");
      option.value = provider;
      option.textContent = getAiProviderLabel(provider);
      return option;
    })
  );
  aiProvider.value = selectedProvider;
}

function syncAiAdvancedPanel(settings: ExtensionOptions["aiOrganization"]): void {
  if (!aiAdvancedPanel) {
    return;
  }

  const preset = getAiProviderPreset(settings.provider);
  const usesCustomBaseUrl = settings.baseUrl !== preset.baseUrl;
  const usesCustomModel = settings.model !== preset.model;
  const usesCustomPrompt = settings.prompt !== DEFAULT_AI_ORGANIZATION_PROMPT;
  aiAdvancedPanel.open = settings.provider === "custom" || usesCustomBaseUrl || usesCustomModel || usesCustomPrompt;
}

function applyAiProviderPreset(provider: AiProvider): void {
  if (!aiBaseUrl || !aiModel || !aiPrompt) {
    return;
  }

  if (provider === "custom") {
    if (aiAdvancedPanel) {
      aiAdvancedPanel.open = true;
    }
    return;
  }

  const preset = getAiProviderPreset(provider);
  aiBaseUrl.value = preset.baseUrl;
  aiModel.value = preset.model;
  if (!aiPrompt.value.trim()) {
    aiPrompt.value = DEFAULT_AI_ORGANIZATION_PROMPT;
  }

  syncAiAdvancedPanel({
    provider,
    enabled: aiEnabled?.checked ?? false,
    apiKey: aiApiKey?.value.trim() ?? "",
    baseUrl: aiBaseUrl.value.trim() || preset.baseUrl,
    model: aiModel.value.trim() || preset.model,
    prompt: aiPrompt.value.trim() || DEFAULT_AI_ORGANIZATION_PROMPT
  });
}

function applyStaticMessages(): void {
  const titleEl = document.querySelector("#options-title");
  if (titleEl) { titleEl.textContent = NOTION_UI_HIDDEN ? msg.optionsTitleObsidianOnly : msg.optionsTitle; }
  const subtitleEl = document.querySelector("#options-subtitle");
  if (subtitleEl) { subtitleEl.textContent = NOTION_UI_HIDDEN ? msg.optionsSubtitleObsidianOnly : msg.optionsSubtitle; }
  const adSlotLabelEl = document.querySelector("#ad-slot-label");
  if (adSlotLabelEl) { adSlotLabelEl.textContent = msg.optionsAdSlotLabel; }
  const adSlotTitleEl = document.querySelector("#ad-slot-title");
  if (adSlotTitleEl) { adSlotTitleEl.textContent = msg.optionsAdSlotTitle; }
  const adSlotCopyEl = document.querySelector("#ad-slot-copy");
  if (adSlotCopyEl) { adSlotCopyEl.textContent = msg.optionsAdSlotCopy; }
  const folderSectionEl = document.querySelector("#folder-section-title");
  if (folderSectionEl) { folderSectionEl.textContent = msg.optionsFolderSection; }
  if (connectFolderButton) { connectFolderButton.textContent = msg.optionsFolderConnect; }
  const basicSectionEl = document.querySelector("#basic-section-title");
  if (basicSectionEl) { basicSectionEl.textContent = msg.optionsBasicSection; }
  const compareSectionTitleEl = document.querySelector("#compare-section-title");
  if (compareSectionTitleEl) { compareSectionTitleEl.textContent = msg.optionsCompareSection; }
  const proTitleEl = document.querySelector("#pro-section-title");
  if (proTitleEl) { proTitleEl.textContent = msg.optionsProSection; }
  const proSubtitleEl = document.querySelector("#pro-section-subtitle");
  if (proSubtitleEl) { proSubtitleEl.textContent = msg.optionsProSubtitle; }
  if (proAiNote) { proAiNote.textContent = msg.optionsProAiNote; }
  if (compareFreeLabel) { compareFreeLabel.textContent = msg.optionsProCompareFree; }
  if (compareProLabel) { compareProLabel.textContent = msg.optionsProComparePro; }
  if (cmpSave) { cmpSave.textContent = msg.compareRowSave; }
  if (cmpImages) { cmpImages.textContent = msg.compareRowImages; }
  if (cmpReplies) { cmpReplies.textContent = msg.compareRowReplies; }
  if (cmpDupes) { cmpDupes.textContent = msg.compareRowDuplicates; }
  if (cmpFilename) { cmpFilename.textContent = msg.compareRowFilename; }
  if (cmpFolder) { cmpFolder.textContent = msg.compareRowFolder; }
  if (cmpNotionDataSource) { cmpNotionDataSource.textContent = msg.compareRowNotionDataSource; }
  if (cmpNotionMediaUpload) { cmpNotionMediaUpload.textContent = msg.compareRowNotionMediaUpload; }
  if (cmpAiSummary) { cmpAiSummary.textContent = msg.compareRowAiSummary; }
  if (cmpAiTags) { cmpAiTags.textContent = msg.compareRowAiTags; }
  if (cmpAiFrontmatter) { cmpAiFrontmatter.textContent = msg.compareRowAiFrontmatter; }
  const proKeyLabelEl = document.querySelector("#pro-key-label");
  if (proKeyLabelEl) { proKeyLabelEl.textContent = msg.optionsProUnlockLabel; }
  if (proLicenseKey) { proLicenseKey.placeholder = msg.optionsProUnlockPlaceholder; }
  if (proSalesLink) { proSalesLink.textContent = msg.optionsProSalesLink; }
  const proKeyHintEl = document.querySelector("#pro-key-hint");
  if (proKeyHintEl) { proKeyHintEl.textContent = msg.optionsProUnlockHint; }
  if (activateProButton) { activateProButton.textContent = msg.optionsProActivate; }
  if (clearProButton) { clearProButton.textContent = msg.optionsProClear; }
  const proLocalNoteEl = document.querySelector("#pro-local-note");
  if (proLocalNoteEl) { proLocalNoteEl.textContent = msg.optionsProLocalOnly; }
  const fileRulesEl = document.querySelector("#file-rules-title");
  if (fileRulesEl) { fileRulesEl.textContent = msg.optionsFileRules; }
  const folderPathLabelEl = document.querySelector("#folder-path-label");
  if (folderPathLabelEl) { folderPathLabelEl.textContent = msg.optionsFolderPathLabel; }
  const folderPathHintEl = document.querySelector("#folder-path-hint");
  if (folderPathHintEl) { folderPathHintEl.textContent = msg.optionsFolderPathHint; }
  if (disconnectFolderButton) { disconnectFolderButton.textContent = msg.optionsFolderDisconnect; }
  const saveTargetLabelEl = document.querySelector("#save-target-label");
  if (saveTargetLabelEl) { saveTargetLabelEl.textContent = msg.optionsSaveTarget; }
  const saveTargetHintEl = document.querySelector("#save-target-hint");
  if (saveTargetHintEl) { saveTargetHintEl.textContent = NOTION_UI_HIDDEN ? msg.optionsSaveTargetHintObsidianOnly : msg.optionsSaveTargetHint; }
  if (saveTarget) {
    const obsidianOption = saveTarget.querySelector<HTMLOptionElement>('option[value="obsidian"]');
    const cloudOption = saveTarget.querySelector<HTMLOptionElement>('option[value="cloud"]');
    const notionOption = saveTarget.querySelector<HTMLOptionElement>('option[value="notion"]');
    if (obsidianOption) { obsidianOption.textContent = msg.optionsSaveTargetObsidian; }
    if (cloudOption) { cloudOption.textContent = msg.optionsSaveTargetCloud; }
    if (notionOption) { notionOption.textContent = NOTION_UI_HIDDEN ? msg.optionsSaveTargetNotionHidden : msg.optionsSaveTargetNotion; }
  }
  const cloudStatusLabelEl = document.querySelector("#cloud-status-label");
  if (cloudStatusLabelEl) { cloudStatusLabelEl.textContent = msg.optionsCloudStatusLabel; }
  const cloudHintEl = document.querySelector("#cloud-link-hint");
  if (cloudHintEl) { cloudHintEl.textContent = msg.optionsCloudLinkHint; }
  if (connectCloudButton) { connectCloudButton.textContent = msg.optionsCloudConnectButton; }
  if (disconnectCloudButton) { disconnectCloudButton.textContent = msg.optionsCloudDisconnectButton; }
  const notionSectionTitleEl = document.querySelector("#notion-section-title");
  if (notionSectionTitleEl) { notionSectionTitleEl.textContent = msg.optionsNotionSection; }
  const notionSectionSubtitleEl = document.querySelector("#notion-section-subtitle");
  if (notionSectionSubtitleEl) { notionSectionSubtitleEl.textContent = msg.optionsNotionSubtitle; }
  const notionConnectionLabelEl = document.querySelector("#notion-connection-label");
  if (notionConnectionLabelEl) { notionConnectionLabelEl.textContent = msg.optionsNotionConnectionLabel; }
  if (connectNotionButton) { connectNotionButton.textContent = msg.optionsNotionConnectButton; }
  if (disconnectNotionButton) { disconnectNotionButton.textContent = msg.optionsNotionDisconnectButton; }
  const notionConnectHintEl = document.querySelector("#notion-connect-hint");
  if (notionConnectHintEl) { notionConnectHintEl.textContent = msg.optionsNotionConnectHint; }
  const notionParentTypeLabelEl = document.querySelector("#notion-parent-type-label");
  if (notionParentTypeLabelEl) { notionParentTypeLabelEl.textContent = msg.optionsNotionParentType; }
  const notionParentTypeHintEl = document.querySelector("#notion-parent-type-hint");
  if (notionParentTypeHintEl) { notionParentTypeHintEl.textContent = msg.optionsNotionParentTypeHint; }
  if (notionParentType) {
    const pageOption = notionParentType.querySelector<HTMLOptionElement>('option[value="page"]');
    const dataSourceOption = notionParentType.querySelector<HTMLOptionElement>('option[value="data_source"]');
    if (pageOption) { pageOption.textContent = msg.optionsNotionParentTypePage; }
    if (dataSourceOption) { dataSourceOption.textContent = msg.optionsNotionParentTypeDataSource; }
  }
  const notionSelectedTargetLabelEl = document.querySelector("#notion-selected-target-label");
  if (notionSelectedTargetLabelEl) { notionSelectedTargetLabelEl.textContent = msg.optionsNotionSelectedTarget; }
  const notionSelectedTargetHintEl = document.querySelector("#notion-selected-target-hint");
  if (notionSelectedTargetHintEl) { notionSelectedTargetHintEl.textContent = msg.optionsNotionSelectedTargetHint; }
  const notionSearchLabelEl = document.querySelector("#notion-search-label");
  if (notionSearchLabelEl) { notionSearchLabelEl.textContent = msg.optionsNotionSearchLabel; }
  const notionSearchHintEl = document.querySelector("#notion-search-hint");
  if (notionSearchHintEl) { notionSearchHintEl.textContent = msg.optionsNotionSearchHint; }
  if (notionSearchButton) { notionSearchButton.textContent = msg.optionsNotionSearchButton; }
  const notionResultsLabelEl = document.querySelector("#notion-results-label");
  if (notionResultsLabelEl) { notionResultsLabelEl.textContent = msg.optionsNotionResultsLabel; }
  const notionResultsHintEl = document.querySelector("#notion-results-hint");
  if (notionResultsHintEl) { notionResultsHintEl.textContent = msg.optionsNotionResultsHint; }
  if (notionUseLocationButton) { notionUseLocationButton.textContent = msg.optionsNotionUseLocationButton; }
  const notionUploadMediaLabelEl = document.querySelector("#notion-upload-media-label");
  if (notionUploadMediaLabelEl) { notionUploadMediaLabelEl.textContent = msg.optionsNotionUploadMedia; }
  const notionUploadMediaHintEl = document.querySelector("#notion-upload-media-hint");
  if (notionUploadMediaHintEl) { notionUploadMediaHintEl.textContent = msg.optionsNotionUploadMediaHint; }
  const patternLabelEl = document.querySelector("#pattern-label");
  if (patternLabelEl) { patternLabelEl.textContent = msg.optionsFilenamePattern; }
  const tokensEl = document.querySelector("#tokens-hint");
  if (tokensEl) { tokensEl.textContent = msg.optionsFilenameTokens; }
  const savePathLabelEl = document.querySelector("#save-path-pattern-label");
  if (savePathLabelEl) { savePathLabelEl.textContent = msg.optionsSavePathPattern; }
  const savePathTokensEl = document.querySelector("#save-path-tokens-hint");
  if (savePathTokensEl) { savePathTokensEl.textContent = msg.optionsSavePathTokens; }
  const aiSectionTitleEl = document.querySelector("#ai-section-title");
  if (aiSectionTitleEl) { aiSectionTitleEl.textContent = msg.optionsAiSection; }
  const aiSectionSubtitleEl = document.querySelector("#ai-section-subtitle");
  if (aiSectionSubtitleEl) { aiSectionSubtitleEl.textContent = msg.optionsAiSubtitle; }
  if (aiQuickstart) { aiQuickstart.textContent = msg.optionsAiQuickstart; }
  if (aiAdvancedSummary) { aiAdvancedSummary.textContent = msg.optionsAiAdvancedSummary; }
  const aiEnabledLabelEl = document.querySelector("#ai-enabled-label");
  if (aiEnabledLabelEl) { aiEnabledLabelEl.textContent = msg.optionsAiEnable; }
  const aiProviderLabelEl = document.querySelector("#ai-provider-label");
  if (aiProviderLabelEl) { aiProviderLabelEl.textContent = msg.optionsAiProvider; }
  const aiProviderHintEl = document.querySelector("#ai-provider-hint");
  if (aiProviderHintEl) { aiProviderHintEl.textContent = msg.optionsAiProviderHint; }
  renderAiProviderOptions();
  const aiApiKeyLabelEl = document.querySelector("#ai-api-key-label");
  if (aiApiKeyLabelEl) { aiApiKeyLabelEl.textContent = msg.optionsAiApiKey; }
  const aiApiKeyHintEl = document.querySelector("#ai-api-key-hint");
  if (aiApiKeyHintEl) { aiApiKeyHintEl.textContent = msg.optionsAiApiKeyHint; }
  const aiBaseUrlLabelEl = document.querySelector("#ai-base-url-label");
  if (aiBaseUrlLabelEl) { aiBaseUrlLabelEl.textContent = msg.optionsAiBaseUrl; }
  const aiBaseUrlHintEl = document.querySelector("#ai-base-url-hint");
  if (aiBaseUrlHintEl) { aiBaseUrlHintEl.textContent = msg.optionsAiBaseUrlHint; }
  const aiModelLabelEl = document.querySelector("#ai-model-label");
  if (aiModelLabelEl) { aiModelLabelEl.textContent = msg.optionsAiModel; }
  const aiModelHintEl = document.querySelector("#ai-model-hint");
  if (aiModelHintEl) { aiModelHintEl.textContent = msg.optionsAiModelHint; }
  const aiPromptLabelEl = document.querySelector("#ai-prompt-label");
  if (aiPromptLabelEl) { aiPromptLabelEl.textContent = msg.optionsAiPrompt; }
  const aiPromptHintEl = document.querySelector("#ai-prompt-hint");
  if (aiPromptHintEl) { aiPromptHintEl.textContent = msg.optionsAiPromptHint; }
  const imagesLabelEl = document.querySelector("#images-label");
  if (imagesLabelEl) { imagesLabelEl.textContent = msg.optionsIncludeImages; }
  const submitBtn = document.querySelector("#submit-btn");
  if (submitBtn) { submitBtn.textContent = msg.optionsSave; }
  applyNotionUiVisibility();
}

async function applyLocale(nextLocale: Locale): Promise<void> {
  await setLocale(nextLocale);
  msg = await t();
  document.documentElement.lang = nextLocale;
  applyLanguageSwitch(nextLocale);
  applyStaticMessages();
  renderSaveTargetState();
  await refreshPlanState();
  await refreshNotionConnectionState();
  await refreshFolderState();
}

function applyLanguageSwitch(locale: Locale): void {
  if (languageSelect && languageSelect.options.length === 0) {
    for (const supportedLocale of SUPPORTED_LOCALES) {
      const option = document.createElement("option");
      option.value = supportedLocale;
      option.textContent = getLocaleLabel(supportedLocale);
      languageSelect.append(option);
    }
  }

  if (languageSwitch) {
    languageSwitch.setAttribute("aria-label", msg.uiLanguageLabel);
  }
  if (languageSelect) {
    languageSelect.setAttribute("aria-label", msg.uiLanguageLabel);
    languageSelect.value = locale;
  }
}

function applyOptions(options: ExtensionOptions): void {
  if (
    !filenamePattern ||
    !savePathPattern ||
    !saveTarget ||
    !notionParentType ||
    !notionUploadMedia ||
    !includeImages ||
    !aiEnabled ||
    !aiProvider ||
    !aiApiKey ||
    !aiBaseUrl ||
    !aiModel ||
    !aiPrompt
  ) {
    return;
  }

  saveTarget.value = options.saveTarget;
  notionParentType.value = options.notion.parentType;
  notionUploadMedia.checked = options.notion.uploadMedia;
  if (notionSearchQuery) {
    notionSearchQuery.value = "";
  }
  filenamePattern.value = options.filenamePattern;
  savePathPattern.value = options.savePathPattern;
  includeImages.checked = options.includeImages;
  aiEnabled.checked = options.aiOrganization.enabled;
  aiProvider.value = options.aiOrganization.provider;
  aiApiKey.value = options.aiOrganization.apiKey;
  aiBaseUrl.value = options.aiOrganization.baseUrl;
  aiModel.value = options.aiOrganization.model;
  aiPrompt.value = options.aiOrganization.prompt;
  syncAiAdvancedPanel(options.aiOrganization);
  setNotionConnectionDisplay({
    connected: options.notion.oauthConnected,
    workspaceId: options.notion.workspaceId || null,
    workspaceName: options.notion.workspaceName || null,
    workspaceIcon: options.notion.workspaceIcon || null,
    selectedParentType: options.notion.parentType,
    selectedParentId: (options.notion.parentType === "data_source" ? options.notion.dataSourceId : options.notion.parentPageId) || null,
    selectedParentLabel: options.notion.selectedParentLabel || null,
    selectedParentUrl: options.notion.selectedParentUrl || null
  });
  populateNotionLocationResults([]);
  renderSaveTargetState();
  renderFolderPathPreview();
}

function formatPlanMeta(plan: PlanStatus): string {
  const details: string[] = [];
  if (plan.holder) {
    details.push(`${msg.optionsProHolderLabel}: ${plan.holder}`);
  }

  if (plan.expiresAt) {
    details.push(`${msg.optionsProExpiresLabel}: ${new Date(plan.expiresAt).toLocaleDateString()}`);
  }

  return details.join(" · ");
}

function formatSeatMeta(plan: PlanStatus): string {
  if (!plan.deviceLabel || !plan.seatLimit || !plan.seatsUsed) {
    return "";
  }

  return msg.optionsPlanSpotlightSeatMeta
    .replace("{used}", String(plan.seatsUsed))
    .replace("{limit}", String(plan.seatLimit))
    .replace("{device}", plan.deviceLabel);
}

function applyPlanSpotlight(plan: PlanStatus): void {
  if (!planSpotlight || !planSpotlightBadge || !planSpotlightTitle || !planSpotlightCopy || !planSpotlightMeta) {
    return;
  }

  let title = msg.optionsPlanSpotlightFreeTitle;
  let copy = msg.optionsPlanSpotlightFreeCopy;
  let badge = msg.optionsProBadgeFree;

  if (plan.tier === "pro") {
    title = msg.optionsPlanSpotlightActiveTitle;
    copy = msg.optionsPlanSpotlightActiveCopy;
    badge = msg.optionsProBadgeActive;
  } else if (plan.activationState === "seat_limit" || plan.activationState === "required") {
    title = msg.optionsPlanSpotlightNeedsActivationTitle;
    copy = msg.optionsPlanSpotlightNeedsActivationCopy;
    badge = msg.optionsProBadgeActive;
  }

  planSpotlight.classList.toggle("plan-spotlight-active", plan.tier === "pro");
  planSpotlightBadge.textContent = badge;
  planSpotlightTitle.textContent = title;
  planSpotlightCopy.textContent = copy;

  const meta = [formatSeatMeta(plan), formatPlanMeta(plan)].filter(Boolean).join(" · ");
  planSpotlightMeta.textContent = meta;
  planSpotlightMeta.classList.toggle("hidden", meta.length === 0);
}

function applyPlanState(plan: PlanStatus): void {
  currentPlan = plan;
  const isPro = plan.tier === "pro";

  if (proPlanBadge) {
    proPlanBadge.textContent = isPro ? msg.optionsProBadgeActive : msg.optionsProBadgeFree;
    proPlanBadge.classList.toggle("plan-badge-active", isPro);
  }

  if (proStatus) {
    if (plan.licenseState === "expired") {
      proStatus.textContent = msg.optionsProStatusExpired;
    } else if (plan.licenseState === "invalid") {
      proStatus.textContent = msg.optionsProStatusInvalid;
    } else if (plan.activationState === "seat_limit") {
      proStatus.textContent = msg.optionsProStatusSeatLimit;
    } else if (plan.activationState === "required") {
      proStatus.textContent = msg.optionsProStatusNeedsActivation;
    } else if (plan.activationState === "revoked") {
      proStatus.textContent = msg.optionsProStatusRevoked;
    } else if (plan.activationState === "offline") {
      proStatus.textContent = msg.optionsProStatusOffline;
    } else if (isPro) {
      proStatus.textContent = msg.optionsProStatusActive;
    } else {
      proStatus.textContent = msg.optionsProStatusFree;
    }
  }

  if (proLicenseMeta) {
    const meta = formatPlanMeta(plan);
    proLicenseMeta.textContent = meta;
    proLicenseMeta.classList.toggle("hidden", meta.length === 0);
  }

  if (filenamePattern) {
    filenamePattern.disabled = !isPro;
  }

  if (savePathPattern) {
    savePathPattern.disabled = !isPro;
  }

  if (aiEnabled) {
    aiEnabled.disabled = !isPro;
  }

  if (aiProvider) {
    aiProvider.disabled = !isPro;
  }

  if (aiApiKey) {
    aiApiKey.disabled = !isPro;
  }

  if (aiBaseUrl) {
    aiBaseUrl.disabled = !isPro;
  }

  if (aiModel) {
    aiModel.disabled = !isPro;
  }

  if (aiPrompt) {
    aiPrompt.disabled = !isPro;
  }

  if (patternLockHint) {
    patternLockHint.textContent = isPro ? "" : msg.optionsFilenamePatternLocked;
  }

  if (savePathLockHint) {
    savePathLockHint.textContent = isPro ? "" : msg.optionsSavePathLocked;
  }

  if (aiLockHint) {
    aiLockHint.textContent = isPro ? "" : msg.optionsAiLocked;
  }

  if (clearProButton) {
    clearProButton.classList.toggle("hidden", plan.licenseState === "none");
  }

  applyPlanSpotlight(plan);
  renderFolderPathPreview();
  renderSaveTargetState();
}

async function refreshPlanState(): Promise<void> {
  applyPlanState(await getPlanStatus());
  await refreshCloudConnectionState();
}

async function refreshFolderState(): Promise<void> {
  if (!connectFolderButton || !disconnectFolderButton) {
    return;
  }

  if (!supportsFileSystemAccess()) {
    connectedFolderName = null;
    renderFolderPathPreview();
    setFolderStatus(msg.optionsFolderUnsupportedStatus);
    connectFolderButton.disabled = true;
    disconnectFolderButton.classList.add("hidden");
    return;
  }

  connectFolderButton.disabled = false;
  const record = await getObsidianDirectoryRecord();
  connectedFolderName = record?.label ?? null;
  renderFolderPathPreview();

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
    setSaveStatus(msg.optionsFolderConnectedSuccess.replace("{folder}", handle.name));
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
  connectedFolderName = null;
  setSaveStatus(msg.optionsFolderDisconnect);
  await refreshFolderState();
});

connectNotionButton?.addEventListener("click", async () => {
  try {
    const authorizeUrl = await startNotionOAuthSession();
    await chrome.tabs.create({ url: authorizeUrl });
    setSaveStatus(msg.optionsNotionConnectStarted);
    startNotionConnectionPolling();
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : msg.optionsNotionConnectFailed);
  }
});

disconnectNotionButton?.addEventListener("click", async () => {
  try {
    const summary = await disconnectNotionConnection();
    populateNotionLocationResults([]);
    await persistNotionSummary(summary);
    setSaveStatus(msg.optionsNotionDisconnectedSaved);
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : msg.optionsNotionDisconnectFailed);
  }
});

connectCloudButton?.addEventListener("click", async () => {
  try {
    await chrome.runtime.sendMessage({ type: "start-cloud-link" });
    setSaveStatus(msg.statusCloudLinkStarting);
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : msg.statusCloudSessionExpired);
  }
});

disconnectCloudButton?.addEventListener("click", async () => {
  try {
    await chrome.runtime.sendMessage({ type: "disconnect-cloud-link" });
    await refreshCloudConnectionState();
    setSaveStatus(msg.statusCloudDisconnected);
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : msg.statusCloudSessionExpired);
  }
});

notionSearchButton?.addEventListener("click", async () => {
  try {
    const results = await searchNotionLocations(getCurrentNotionParentType(), notionSearchQuery?.value.trim() ?? "");
    populateNotionLocationResults(results);
    setSaveStatus(results.length > 0 ? msg.optionsNotionSearchLoaded : msg.optionsNotionSearchEmpty);
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : msg.optionsNotionSearchFailed);
  }
});

notionUseLocationButton?.addEventListener("click", async () => {
  const selectedId = notionLocationResults?.value ?? "";
  const selected = notionLocationOptions.find((item) => item.id === selectedId);
  if (!selected) {
    setSaveStatus(msg.optionsNotionTargetRequired);
    return;
  }

  try {
    const summary = await selectNotionLocation(getCurrentNotionParentType(), selected);
    await persistNotionSummary(summary);
    setSaveStatus(msg.optionsNotionTargetSaved);
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : msg.optionsNotionTargetSaveFailed);
  }
});

saveTarget?.addEventListener("change", () => {
  renderSaveTargetState();
});

notionParentType?.addEventListener("change", () => {
  populateNotionLocationResults([]);
  renderNotionParentState();
});

savePathPattern?.addEventListener("input", () => {
  renderFolderPathPreview();
});

aiProvider?.addEventListener("change", () => {
  const provider = getCurrentAiProvider();
  applyAiProviderPreset(provider);
});

form?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !DIRTY_FIELD_IDS.has(target.id)) {
    return;
  }

  setSaveStatus(msg.optionsPendingSave);
});

form?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !DIRTY_FIELD_IDS.has(target.id)) {
    return;
  }

  setSaveStatus(msg.optionsPendingSave);
});

window.addEventListener("focus", () => {
  void refreshCloudConnectionState();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    void refreshCloudConnectionState();
  }
});

activateProButton?.addEventListener("click", async () => {
  const rawKey = proLicenseKey?.value.trim() ?? "";
  if (!rawKey) {
    setSaveStatus(msg.optionsProEmptyKey);
    return;
  }

  const nextPlan = await activateProLicense(rawKey);
  if (nextPlan.tier === "pro") {
    setSaveStatus(msg.optionsProActivated);
    await refreshPlanState();
    await refreshNotionConnectionState();
    return;
  }

  if (nextPlan.licenseState === "expired") {
    setSaveStatus(msg.optionsProStatusExpired);
  } else if (nextPlan.activationState === "seat_limit") {
    setSaveStatus(msg.optionsProStatusSeatLimit);
  } else if (nextPlan.activationState === "required") {
    setSaveStatus(msg.optionsProStatusNeedsActivation);
  } else if (nextPlan.activationState === "revoked") {
    setSaveStatus(msg.optionsProStatusRevoked);
  } else if (nextPlan.activationState === "offline") {
    setSaveStatus(msg.optionsProStatusOffline);
  } else {
    setSaveStatus(msg.optionsProStatusInvalid);
  }
  await refreshPlanState();
  await refreshNotionConnectionState();
});

clearProButton?.addEventListener("click", async () => {
  await clearProLicense();
  if (proLicenseKey) {
    proLicenseKey.value = "";
  }
  setSaveStatus(msg.optionsProRemoved);
  await refreshPlanState();
  await refreshNotionConnectionState();
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (
    !filenamePattern ||
    !savePathPattern ||
    !saveTarget ||
    !notionParentType ||
    !notionUploadMedia ||
    !includeImages ||
    !aiEnabled ||
    !aiProvider ||
    !aiApiKey ||
    !aiBaseUrl ||
    !aiModel ||
    !aiPrompt
  ) {
    return;
  }

  const currentOptions = await getOptions();
  const nextSaveTarget = getCurrentSaveTarget();
  const selectedProvider = getCurrentAiProvider();
  const providerPreset = getAiProviderPreset(selectedProvider);
  const trimmedApiKey = aiApiKey.value.trim();
  const nextNotionParentType = getCurrentNotionParentType();
  const nextAiOrganization = {
    ...currentOptions.aiOrganization,
    provider: selectedProvider,
    enabled: currentPlan.tier === "pro" ? aiEnabled.checked : false,
    apiKey: trimmedApiKey,
    baseUrl: aiBaseUrl.value.trim() || providerPreset.baseUrl,
    model: aiModel.value.trim() || providerPreset.model,
    prompt: aiPrompt.value.trim() || DEFAULT_AI_ORGANIZATION_PROMPT
  };

  if (nextSaveTarget === "notion") {
    if (currentPlan.tier !== "pro") {
      setSaveStatus(msg.optionsNotionOAuthRequiresPro);
      return;
    }

    if (!isCurrentNotionConnected()) {
      setSaveStatus(msg.optionsNotionConnectFirst);
      return;
    }

    if (!isNotionReadyForSelection()) {
      setSaveStatus(msg.optionsNotionTargetRequired);
      return;
    }
  }

  if (nextSaveTarget === "cloud" && currentPlan.tier !== "pro") {
    setSaveStatus(msg.optionsCloudRequiresPro);
    return;
  }

  if (nextAiOrganization.enabled) {
    if (!providerPreset.apiKeyOptional && !trimmedApiKey) {
      setSaveStatus(msg.optionsAiApiKeyRequired);
      return;
    }

    const mismatchMessage = getAiProviderMismatchMessage(selectedProvider, trimmedApiKey);
    if (mismatchMessage) {
      setSaveStatus(mismatchMessage);
      return;
    }

    try {
      getAiPermissionPattern(nextAiOrganization.baseUrl);
    } catch {
      setSaveStatus(msg.optionsAiInvalidBaseUrl);
      return;
    }

    const granted = await requestAiHostPermission(nextAiOrganization.baseUrl);
    if (!granted) {
      setSaveStatus(msg.optionsAiPermissionDenied);
      return;
    }
  }

  const nextOptions: ExtensionOptions = {
    ...currentOptions,
    saveTarget: nextSaveTarget,
    filenamePattern: filenamePattern.value.trim() || DEFAULT_OPTIONS.filenamePattern,
    savePathPattern: savePathPattern.value.trim(),
    includeImages: includeImages.checked,
    notion: {
      ...currentOptions.notion,
      token: "",
      parentType: currentPlan.tier === "pro" ? nextNotionParentType : DEFAULT_OPTIONS.notion.parentType,
      uploadMedia: currentPlan.tier === "pro" ? notionUploadMedia.checked : false
    },
    aiOrganization: nextAiOrganization
  };

  await setOptions(nextOptions);
  renderSaveTargetState();
  setSaveStatus(nextAiOrganization.enabled ? msg.optionsAiSaved : msg.optionsSaved);
});

void (async () => {
  const requestedLocale = getLocaleFromSearch();
  if (requestedLocale) {
    const current = await getLocale();
    if (current !== requestedLocale) {
      await setLocale(requestedLocale);
    }
  }

  msg = await t();
  const locale = await getLocale();
  document.documentElement.lang = locale;
  applyLanguageSwitch(locale);

  languageSelect?.addEventListener("change", async () => {
    const next = languageSelect.value;
    if (!isSupportedLocale(next)) {
      return;
    }

    const current = await getLocale();
    if (current === next) {
      return;
    }

    await applyLocale(next);
  });

  applyStaticMessages();

  const options = await getOptions();
  applyOptions({ ...DEFAULT_OPTIONS, ...options });
  await refreshPlanState();
  await refreshCloudConnectionState();
  await refreshNotionConnectionState();
  await refreshFolderState();
})();
