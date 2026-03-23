import { DEFAULT_AI_ORGANIZATION_PROMPT, DEFAULT_OPTIONS, getAiProviderKeyMismatch, getAiProviderPreset } from "./lib/config";
import { pickDirectoryHandle, queryDirectoryPermission, supportsFileSystemAccess } from "./lib/direct-save";
import { clearObsidianDirectoryHandle, getObsidianDirectoryRecord, setObsidianDirectoryHandle } from "./lib/fs-handle-store";
import { type Locale, type Messages, getLocale, setLocale, t } from "./lib/i18n";
import { getAiPermissionPattern, requestAiHostPermission } from "./lib/llm";
import { normalizeNotionPageIdInput, requestNotionHostPermission } from "./lib/notion";
import { activateProLicense, clearProLicense, getOptions, getPlanStatus, setOptions } from "./lib/storage";
import { AI_PROVIDER_VALUES, type AiProvider, type ExtensionOptions, type NotionParentType, type PlanStatus, type SaveTarget } from "./lib/types";

const form = document.querySelector<HTMLFormElement>("#options-form");
const filenamePattern = document.querySelector<HTMLInputElement>("#filename-pattern");
const savePathPattern = document.querySelector<HTMLInputElement>("#save-path-pattern");
const saveTarget = document.querySelector<HTMLSelectElement>("#save-target");
const notionSection = document.querySelector<HTMLElement>("#notion-section");
const notionParentType = document.querySelector<HTMLSelectElement>("#notion-parent-type");
const notionToken = document.querySelector<HTMLInputElement>("#notion-token");
const notionParentPage = document.querySelector<HTMLInputElement>("#notion-parent-page");
const notionDataSourceField = document.querySelector<HTMLElement>("#notion-data-source-field");
const notionDataSource = document.querySelector<HTMLInputElement>("#notion-data-source");
const includeImages = document.querySelector<HTMLInputElement>("#include-images");
const saveStatus = document.querySelector<HTMLParagraphElement>("#save-status");
const folderSection = document.querySelector<HTMLElement>("#folder-section");
const folderStatus = document.querySelector<HTMLParagraphElement>("#folder-status");
const folderPathPreview = document.querySelector<HTMLElement>("#folder-path-preview");
const connectFolderButton = document.querySelector<HTMLButtonElement>("#connect-folder");
const disconnectFolderButton = document.querySelector<HTMLButtonElement>("#disconnect-folder");
const languageSwitch = document.querySelector<HTMLElement>("#language-switch");
const languageButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-locale]"));
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
const DIRTY_FIELD_IDS = new Set([
  "save-target",
  "notion-parent-type",
  "notion-token",
  "notion-parent-page",
  "notion-data-source",
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
  return value === "ko" || value === "en" ? value : null;
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
  return saveTarget?.value === "notion" ? "notion" : "obsidian";
}

function getCurrentNotionParentType(): NotionParentType {
  return notionParentType?.value === "data_source" ? "data_source" : "page";
}

function renderNotionParentState(): void {
  const parentType = getCurrentNotionParentType();
  notionParentPage?.parentElement?.classList.toggle("hidden", parentType !== "page");
  notionDataSourceField?.classList.toggle("hidden", parentType !== "data_source");
}

function renderSaveTargetState(): void {
  currentSaveTarget = getCurrentSaveTarget();
  folderSection?.classList.toggle("hidden", currentSaveTarget !== "obsidian");
  notionSection?.classList.toggle("hidden", currentSaveTarget !== "notion");
  renderNotionParentState();
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
  if (titleEl) { titleEl.textContent = msg.optionsTitle; }
  const subtitleEl = document.querySelector("#options-subtitle");
  if (subtitleEl) { subtitleEl.textContent = msg.optionsSubtitle; }
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
  if (saveTargetHintEl) { saveTargetHintEl.textContent = msg.optionsSaveTargetHint; }
  if (saveTarget) {
    const obsidianOption = saveTarget.querySelector<HTMLOptionElement>('option[value="obsidian"]');
    const notionOption = saveTarget.querySelector<HTMLOptionElement>('option[value="notion"]');
    if (obsidianOption) { obsidianOption.textContent = msg.optionsSaveTargetObsidian; }
    if (notionOption) { notionOption.textContent = msg.optionsSaveTargetNotion; }
  }
  const notionSectionTitleEl = document.querySelector("#notion-section-title");
  if (notionSectionTitleEl) { notionSectionTitleEl.textContent = msg.optionsNotionSection; }
  const notionSectionSubtitleEl = document.querySelector("#notion-section-subtitle");
  if (notionSectionSubtitleEl) { notionSectionSubtitleEl.textContent = msg.optionsNotionSubtitle; }
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
  const notionTokenLabelEl = document.querySelector("#notion-token-label");
  if (notionTokenLabelEl) { notionTokenLabelEl.textContent = msg.optionsNotionToken; }
  const notionTokenHintEl = document.querySelector("#notion-token-hint");
  if (notionTokenHintEl) { notionTokenHintEl.textContent = msg.optionsNotionTokenHint; }
  const notionParentPageLabelEl = document.querySelector("#notion-parent-page-label");
  if (notionParentPageLabelEl) { notionParentPageLabelEl.textContent = msg.optionsNotionParentPage; }
  const notionParentPageHintEl = document.querySelector("#notion-parent-page-hint");
  if (notionParentPageHintEl) { notionParentPageHintEl.textContent = msg.optionsNotionParentPageHint; }
  const notionDataSourceLabelEl = document.querySelector("#notion-data-source-label");
  if (notionDataSourceLabelEl) { notionDataSourceLabelEl.textContent = msg.optionsNotionDataSource; }
  const notionDataSourceHintEl = document.querySelector("#notion-data-source-hint");
  if (notionDataSourceHintEl) { notionDataSourceHintEl.textContent = msg.optionsNotionDataSourceHint; }
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
}

async function applyLocale(nextLocale: Locale): Promise<void> {
  await setLocale(nextLocale);
  msg = await t();
  document.documentElement.lang = nextLocale;
  applyLanguageSwitch(nextLocale);
  applyStaticMessages();
  renderSaveTargetState();
  await refreshPlanState();
  await refreshFolderState();
}

function applyLanguageSwitch(locale: Locale): void {
  if (languageSwitch) {
    languageSwitch.setAttribute("aria-label", msg.uiLanguageLabel);
  }

  for (const button of languageButtons) {
    const buttonLocale = button.dataset.locale;
    const isActive = buttonLocale === locale;
    button.textContent = buttonLocale === "ko" ? msg.uiLanguageKo : msg.uiLanguageEn;
    button.classList.toggle("lang-button-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function applyOptions(options: ExtensionOptions): void {
  if (
    !filenamePattern ||
    !savePathPattern ||
    !saveTarget ||
    !notionParentType ||
    !notionToken ||
    !notionParentPage ||
    !notionDataSource ||
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
  notionToken.value = options.notion.token;
  notionParentPage.value = options.notion.parentPageId;
  notionDataSource.value = options.notion.dataSourceId;
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
}

async function refreshPlanState(): Promise<void> {
  applyPlanState(await getPlanStatus());
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

saveTarget?.addEventListener("change", () => {
  renderSaveTargetState();
});

notionParentType?.addEventListener("change", () => {
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
});

clearProButton?.addEventListener("click", async () => {
  await clearProLicense();
  if (proLicenseKey) {
    proLicenseKey.value = "";
  }
  setSaveStatus(msg.optionsProRemoved);
  await refreshPlanState();
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (
    !filenamePattern ||
    !savePathPattern ||
    !saveTarget ||
    !notionParentType ||
    !notionToken ||
    !notionParentPage ||
    !notionDataSource ||
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
  const trimmedNotionToken = notionToken.value.trim();
  const trimmedNotionParentPage = notionParentPage.value.trim();
  const trimmedNotionDataSource = notionDataSource.value.trim();
  const nextAiOrganization = {
    ...currentOptions.aiOrganization,
    provider: selectedProvider,
    enabled: currentPlan.tier === "pro" ? aiEnabled.checked : false,
    apiKey: trimmedApiKey,
    baseUrl: aiBaseUrl.value.trim() || providerPreset.baseUrl,
    model: aiModel.value.trim() || providerPreset.model,
    prompt: aiPrompt.value.trim() || DEFAULT_AI_ORGANIZATION_PROMPT
  };

  let normalizedNotionParentPage = trimmedNotionParentPage;
  let normalizedNotionDataSource = trimmedNotionDataSource;
  if (nextSaveTarget === "notion") {
    if (!trimmedNotionToken) {
      setSaveStatus(msg.optionsNotionTokenRequired);
      return;
    }

    if (nextNotionParentType === "page") {
      if (!trimmedNotionParentPage) {
        setSaveStatus(msg.optionsNotionParentPageRequired);
        return;
      }

      try {
        normalizedNotionParentPage = normalizeNotionPageIdInput(trimmedNotionParentPage);
      } catch {
        setSaveStatus(msg.optionsNotionInvalidPage);
        return;
      }
    } else {
      if (!trimmedNotionDataSource) {
        setSaveStatus(msg.optionsNotionDataSourceRequired);
        return;
      }

      try {
        normalizedNotionDataSource = normalizeNotionPageIdInput(trimmedNotionDataSource);
      } catch {
        setSaveStatus(msg.optionsNotionInvalidDataSource);
        return;
      }
    }

    const granted = await requestNotionHostPermission();
    if (!granted) {
      setSaveStatus(msg.optionsNotionPermissionDenied);
      return;
    }
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
      token: trimmedNotionToken,
      parentType: nextNotionParentType,
      parentPageId: normalizedNotionParentPage,
      dataSourceId: normalizedNotionDataSource
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

      await applyLocale(next);
    });
  }

  applyStaticMessages();

  const options = await getOptions();
  applyOptions({ ...DEFAULT_OPTIONS, ...options });
  await refreshPlanState();
  await refreshFolderState();
})();
