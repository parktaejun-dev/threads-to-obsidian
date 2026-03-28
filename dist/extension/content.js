// src/lib/config.ts
var DEFAULT_AI_ORGANIZATION_PROMPT = "Summarize the post in 1-3 sentences. Add up to 5 concise tags. Add only useful flat frontmatter fields when confident, such as topic, language, sentiment, or source_kind.";
var AI_PROVIDER_PRESETS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKeyOptional: false,
    transport: "openai"
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash",
    apiKeyOptional: false,
    transport: "gemini"
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    apiKeyOptional: true,
    transport: "openai"
  },
  custom: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  }
};
var DEFAULT_AI_ORGANIZATION_SETTINGS = {
  provider: "openai",
  enabled: false,
  apiKey: "",
  baseUrl: AI_PROVIDER_PRESETS.openai.baseUrl,
  model: AI_PROVIDER_PRESETS.openai.model,
  prompt: DEFAULT_AI_ORGANIZATION_PROMPT
};
var BUNDLED_EXTRACTOR_CONFIG = {
  version: "2026-03-08",
  noisePatterns: ["\uBC88\uC5ED\uD558\uAE30", "\uB354 \uBCF4\uAE30", "\uC88B\uC544\uC694", "\uB313\uAE00", "\uB9AC\uD3EC\uC2A4\uD2B8", "\uACF5\uC720\uD558\uAE30"],
  maxRecentSaves: 10
};

// ../shared/src/locale.ts
var SUPPORTED_LOCALES = ["ko", "en", "ja", "pt-BR", "es", "zh-TW", "vi"];
var SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);
function isSupportedLocale(value) {
  return typeof value === "string" && SUPPORTED_LOCALE_SET.has(value);
}
function parseSupportedLocale(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith("ko")) {
    return "ko";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  if (normalized.startsWith("ja")) {
    return "ja";
  }
  if (normalized === "pt" || normalized.startsWith("pt-")) {
    return "pt-BR";
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return "es";
  }
  if (normalized === "vi" || normalized.startsWith("vi-")) {
    return "vi";
  }
  if (normalized === "zh" || normalized.startsWith("zh-")) {
    if (normalized.includes("hans") || normalized === "zh-cn" || normalized === "zh-sg") {
      return null;
    }
    return "zh-TW";
  }
  return null;
}
function normalizeLocale(value, fallback = "en") {
  return parseSupportedLocale(value) ?? fallback;
}
function detectLocaleFromNavigator(language, fallback = "en") {
  return normalizeLocale(language, fallback);
}

// src/lib/i18n.ts
var LOCALE_KEY = "app-locale";
var ko = {
  uiLanguageLabel: "\uC5B8\uC5B4",
  uiLanguageKo: "\uD55C\uAD6D\uC5B4",
  uiLanguageEn: "English",
  popupTitle: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
  popupSave: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
  popupSettings: "\uC124\uC815",
  popupPromoTitle: "\uD5A5\uD6C4 \uD655\uC7A5 \uC601\uC5ED",
  popupPromoDescription: "\uCD94\uD6C4 \uC548\uB0B4\uC640 \uCD94\uCC9C\uC774 \uB4E4\uC5B4\uAC08 \uC790\uB9AC\uB97C \uBBF8\uB9AC \uD655\uBCF4\uD574 \uB450\uC5C8\uC2B5\uB2C8\uB2E4.",
  popupSubtitleDirect: "\uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitleDownload: "\uC800\uC7A5 \uD3F4\uB354\uAC00 \uC5C6\uC5B4 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uD3F4\uB354\uB97C \uC5F0\uACB0\uD558\uC138\uC694.",
  popupSubtitleConnected: "\uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitlePermissionCheck: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC788\uC9C0\uB9CC \uAD8C\uD55C\uC744 \uB2E4\uC2DC \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  popupSubtitleNoFolder: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC788\uC73C\uBA74 \uBC14\uB85C \uC800\uC7A5\uD558\uACE0, \uC5C6\uC73C\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  popupSubtitleUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  popupSubtitleNotion: "\uC124\uC815\uD55C Notion \uB300\uC0C1\uC5D0 \uC0C8 \uD398\uC774\uC9C0\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitleNotionSetup: "Notion \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 \uC124\uC815\uC5D0\uC11C \uD1A0\uD070\uACFC \uC800\uC7A5 \uB300\uC0C1\uC744 \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
  popupSubtitleCloud: "Threads Archive scrapbook \uD074\uB77C\uC6B0\uB4DC\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4. \uBA3C\uC800 \uC6F9\uC5D0\uC11C \uB85C\uADF8\uC778\uB418\uC5B4 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
  popupRecentSaves: "\uCD5C\uADFC \uC800\uC7A5",
  popupClearAll: "\uC804\uCCB4 \uC0AD\uC81C",
  popupEmpty: "\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  popupResave: "\uB2E4\uC2DC \uC800\uC7A5",
  popupExpand: "\uD3BC\uCE58\uAE30",
  popupCollapse: "\uC811\uAE30",
  popupDelete: "\uC0AD\uC81C",
  popupOpenRemote: "\uC6D0\uACA9 \uC5F4\uAE30",
  popupCloudConnect: "Cloud \uC5F0\uACB0",
  popupCloudDisconnect: "Cloud \uC5F0\uACB0 \uD574\uC81C",
  statusReady: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uC5D0\uC11C \uC800\uC7A5\uD560 \uC900\uBE44\uAC00 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusReadyDirect: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusReadyDownload: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  statusReadyCloud: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 Threads Archive scrapbook \uD074\uB77C\uC6B0\uB4DC\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusUnsupported: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  statusNoTab: "\uD65C\uC131 \uD0ED\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusSaving: "\uC800\uC7A5\uD558\uB294 \uC911\u2026",
  statusSavedDirect: "Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedZip: "\uC800\uC7A5 \uC644\uB8CC. \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedNotion: "Notion\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedCloud: "Threads Archive scrapbook\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicate: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicateWarning: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: ",
  statusAlreadySaved: "\uC774\uBBF8 \uC800\uC7A5\uB41C \uAE00\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC800\uC7A5\uD558\uB824\uBA74 \uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C '\uB2E4\uC2DC \uC800\uC7A5'\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694.",
  statusNotionSetupRequired: "Notion \uC800\uC7A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uC124\uC815\uC5D0\uC11C \uD1A0\uD070\uACFC \uC800\uC7A5 \uB300\uC0C1\uC744 \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
  statusError: "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusResaving: "\uD30C\uC77C\uC744 \uB2E4\uC2DC \uB9CC\uB4DC\uB294 \uC911\u2026",
  statusResaved: "\uB2E4\uC6B4\uB85C\uB4DC\uB97C \uB2E4\uC2DC \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusResavedNotion: "Notion\uC5D0 \uC0C8 \uD398\uC774\uC9C0\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusResavedCloud: "Threads Archive scrapbook\uC5D0 \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusCloudLoginRequired: "Cloud \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 ss-threads.dahanda.dev/scrapbook \uC5D0 \uBA3C\uC800 \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.",
  statusCloudConnectRequired: "Cloud \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 extension\uC744 Threads Archive scrapbook\uC5D0 \uBA3C\uC800 \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  statusCloudSessionExpired: "Cloud \uC5F0\uACB0\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. extension\uC744 \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  statusCloudOffline: "Cloud \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  statusCloudConnected: "Threads Archive Cloud \uC5F0\uACB0\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusCloudDisconnected: "Threads Archive Cloud \uC5F0\uACB0\uC744 \uD574\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusCloudLinkStarting: "\uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C Threads Archive scrapbook \uC5F0\uACB0\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.",
  statusRecentNotFound: "\uCD5C\uADFC \uC800\uC7A5 \uAE30\uB85D\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusDeletedRecent: "\uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusClearedRecents: "\uCD5C\uADFC \uC800\uC7A5\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusExtractFailed: "\uAE00 \uB0B4\uC6A9\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusTabError: "\uD604\uC7AC \uD0ED \uC815\uBCF4\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusRedownloadError: "\uB2E4\uC2DC \uB2E4\uC6B4\uB85C\uB4DC\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusRetry: "\uB2E4\uC2DC \uC2DC\uB3C4",
  statusResaveButton: "\uB2E4\uC2DC \uC800\uC7A5",
  optionsTitle: "Threads \uAE00\uC744 Obsidian, Threads Archive Cloud, Notion\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsTitleObsidianOnly: "Threads \uAE00\uC744 Obsidian \uB610\uB294 Threads Archive Cloud\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsSubtitle: "\uBB34\uB8CC \uC800\uC7A5, \uD544\uC694\uD560 \uB54C\uB9CC Pro.",
  optionsSubtitleObsidianOnly: "\uD604\uC7AC UI\uC5D0\uC11C\uB294 Obsidian\uACFC Cloud \uC800\uC7A5\uC744 \uBA3C\uC800 \uC81C\uACF5\uD558\uACE0, Notion\uC740 \uB0B4\uBD80 \uC900\uBE44 \uC911\uC774\uB77C \uC228\uACA8\uC838 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightFreeTitle: "Free",
  optionsPlanSpotlightFreeCopy: "\uAE30\uBCF8 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightActiveTitle: "Pro \uD65C\uC131\uD654\uB428",
  optionsPlanSpotlightActiveCopy: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C Pro \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro \uD65C\uC131\uD654 \uD544\uC694",
  optionsPlanSpotlightNeedsActivationCopy: "\uD0A4\uB294 \uC720\uD6A8\uD558\uC9C0\uB9CC \uC544\uC9C1 \uC774 \uAE30\uAE30 seat\uAC00 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightSeatMeta: "Seat {used}/{limit} \xB7 {device}",
  optionsAdSlotLabel: "Ad",
  optionsAdSlotTitle: "\uAD11\uACE0 \uC790\uB9AC",
  optionsAdSlotCopy: "\uCD94\uD6C4 \uBC30\uB108 \uB610\uB294 \uC548\uB0B4\uAC00 \uB4E4\uC5B4\uAC08 \uC790\uB9AC\uC785\uB2C8\uB2E4.",
  optionsFolderSection: "Obsidian \uD3F4\uB354 \uC5F0\uACB0",
  optionsFolderStatus: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uB97C \uD655\uC778\uD558\uB294 \uC911\uC785\uB2C8\uB2E4\u2026",
  optionsFolderLabel: "\uD604\uC7AC \uD3F4\uB354",
  optionsFolderNotConnected: "\uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC74C",
  optionsFolderConnect: "\uD3F4\uB354 \uC5F0\uACB0",
  optionsFolderDisconnect: "\uC5F0\uACB0 \uD574\uC81C",
  optionsFolderUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD3F4\uB354 \uC5F0\uACB0\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC74C",
  optionsFolderUnsupportedStatus: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD3F4\uB354\uC5D0 \uC9C1\uC811 \uC800\uC7A5\uD560 \uC218 \uC5C6\uC5B4 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  optionsFolderNotConnectedStatus: "\uC800\uC7A5 \uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC800\uC7A5\uD558\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uB429\uB2C8\uB2E4.",
  optionsFolderReady: "\uD3F4\uB354\uAC00 \uC5F0\uACB0\uB410\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uBC14\uB85C \uAE30\uB85D\uB429\uB2C8\uB2E4.",
  optionsFolderPermissionCheck: "\uD3F4\uB354\uAC00 \uC5F0\uACB0\uB410\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uC800\uC7A5 \uC2DC \uD3F4\uB354 \uC811\uADFC \uAD8C\uD55C\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsFolderPermissionLost: "\uD3F4\uB354 \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uD3F4\uB354\uB97C \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsFolderChecked: "\uD3F4\uB354 \uC5F0\uACB0\uC744 \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uBC14\uB85C \uAE30\uB85D\uB429\uB2C8\uB2E4.",
  optionsFolderCancelled: "\uD3F4\uB354 \uC120\uD0DD\uC744 \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.",
  optionsFolderError: "\uD3F4\uB354 \uC5F0\uACB0 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  optionsFolderConnectedSuccess: '"{folder}" \uD3F4\uB354\uB97C \uC5F0\uACB0\uD588\uC2B5\uB2C8\uB2E4.',
  optionsFolderPathLabel: "\uD604\uC7AC \uC800\uC7A5 \uC704\uCE58",
  optionsFolderPathHint: "\uC808\uB300\uACBD\uB85C\uB294 \uC77D\uC744 \uC218 \uC5C6\uC5B4 \uC5F0\uACB0\uB41C \uD3F4\uB354 \uAE30\uC900\uC73C\uB85C\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.",
  optionsFolderPathUnavailable: "\uD3F4\uB354 \uC5F0\uACB0 \uD6C4 \uD45C\uC2DC",
  optionsSaveTarget: "\uC800\uC7A5 \uB300\uC0C1",
  optionsSaveTargetHint: "PC\uC5D0\uC11C\uB294 Obsidian, Threads Archive Cloud, Notion \uC911 \uD558\uB098\uB97C \uAE30\uBCF8 \uC800\uC7A5 \uB300\uC0C1\uC73C\uB85C \uC120\uD0DD\uD569\uB2C8\uB2E4.",
  optionsSaveTargetHintObsidianOnly: "\uD604\uC7AC UI\uC5D0\uC11C\uB294 Obsidian\uACFC Threads Archive Cloud\uB97C \uBA3C\uC800 \uC81C\uACF5\uD569\uB2C8\uB2E4. Notion\uC740 \uB0B4\uBD80 \uC900\uBE44 \uC911\uC774\uB77C \uC124\uC815 \uD654\uBA74\uC5D0\uC11C \uC228\uACA8\uC838 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetCloud: "Threads Archive Cloud",
  optionsSaveTargetNotion: "Notion",
  optionsSaveTargetNotionHidden: "Notion (\uC900\uBE44 \uC911)",
  optionsCloudRequiresPro: "Cloud \uC800\uC7A5\uC740 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsCloudSection: "Threads Archive Cloud \uC5F0\uACB0",
  optionsCloudStatusLabel: "Cloud \uC5F0\uACB0 \uC0C1\uD0DC",
  optionsCloudStatusUnlinked: "\uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsCloudStatusLinked: "@{handle} \uACC4\uC815\uC73C\uB85C \uC5F0\uACB0\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsCloudStatusExpired: "\uC5F0\uACB0\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsCloudStatusOffline: "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC5B4 \uB9C8\uC9C0\uB9C9 \uC5F0\uACB0 \uC0C1\uD0DC\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.",
  optionsCloudConnectButton: "Cloud \uC5F0\uACB0",
  optionsCloudDisconnectButton: "Cloud \uC5F0\uACB0 \uD574\uC81C",
  optionsCloudLinkHint: "\uC5F0\uACB0 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C scrapbook \uD398\uC774\uC9C0\uAC00 \uC5F4\uB9AC\uACE0, \uB85C\uADF8\uC778\uB41C \uACC4\uC815\uACFC extension\uC774 \uC5F0\uACB0\uB429\uB2C8\uB2E4.",
  optionsNotionSection: "Notion \uC5F0\uACB0",
  optionsNotionSubtitle: "Notion\uC740 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD1A0\uD070\uC744 \uC9C1\uC811 \uB2E4\uB8E8\uC9C0 \uC54A\uACE0 OAuth\uB85C \uC5F0\uACB0\uD569\uB2C8\uB2E4. \uD55C \uBC88 \uC5F0\uACB0\uD558\uACE0 \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uACE0\uB974\uBA74 \uC774\uD6C4\uC5D0\uB294 \uC800\uC7A5\uB9CC \uB204\uB974\uBA74 \uB429\uB2C8\uB2E4.",
  optionsNotionConnectionLabel: "\uC5F0\uACB0 \uC0C1\uD0DC",
  optionsNotionConnectButton: "Connect Notion",
  optionsNotionDisconnectButton: "\uC5F0\uACB0 \uD574\uC81C",
  optionsNotionConnectHint: "Notion \uC2B9\uC778 \uD654\uBA74\uC774 \uC0C8 \uD0ED\uC5D0\uC11C \uC5F4\uB9BD\uB2C8\uB2E4. \uC2B9\uC778 \uD6C4 \uC774 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uC624\uBA74 \uC790\uB3D9\uC73C\uB85C \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uAC31\uC2E0\uD569\uB2C8\uB2E4.",
  optionsNotionConnected: "Notion \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uAC00 \uC5F0\uACB0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  optionsNotionDisconnected: "\uC544\uC9C1 Notion\uC774 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsNotionConnectStarted: "Notion \uC5F0\uACB0 \uD0ED\uC744 \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4. \uC2B9\uC778 \uD6C4 \uC774 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uC624\uC138\uC694.",
  optionsNotionConnectFailed: "Notion \uC5F0\uACB0\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionDisconnectedSaved: "Notion \uC5F0\uACB0\uC744 \uD574\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionDisconnectFailed: "Notion \uC5F0\uACB0 \uD574\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionParentType: "\uC800\uC7A5 \uBC29\uC2DD",
  optionsNotionParentTypeHint: "\uC5F0\uACB0\uB41C \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0\uC11C \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C Page \uB610\uB294 data source \uC911 \uD558\uB098\uB85C \uACE0\uB985\uB2C8\uB2E4.",
  optionsNotionParentTypePage: "Parent page",
  optionsNotionParentTypeDataSource: "Data source",
  optionsNotionSelectedTarget: "\uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58",
  optionsNotionSelectedTargetHint: "\uD604\uC7AC \uC800\uC7A5 \uBC84\uD2BC\uC774 \uAE30\uBCF8\uC73C\uB85C \uBCF4\uB0BC Notion \uC704\uCE58\uC785\uB2C8\uB2E4.",
  optionsNotionTargetNotSelected: "\uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uAC00 \uC544\uC9C1 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsNotionTargetRequired: "\uBA3C\uC800 Notion \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  optionsNotionTargetSaved: "Notion \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionTargetSaveFailed: "Notion \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionSearchLabel: "\uC800\uC7A5 \uC704\uCE58 \uCC3E\uAE30",
  optionsNotionSearchHint: "\uD398\uC774\uC9C0\uB098 data source \uC774\uB984 \uC77C\uBD80\uB97C \uC785\uB825\uD558\uBA74 \uC811\uADFC \uAC00\uB2A5\uD55C \uB300\uC0C1\uB9CC \uAC80\uC0C9\uD569\uB2C8\uB2E4.",
  optionsNotionSearchPlaceholderPage: "\uC608: Product Notes",
  optionsNotionSearchPlaceholderDataSource: "\uC608: Threads Inbox",
  optionsNotionSearchButton: "\uC704\uCE58 \uAC80\uC0C9",
  optionsNotionResultsLabel: "\uAC80\uC0C9 \uACB0\uACFC",
  optionsNotionResultsHint: "\uBAA9\uB85D\uC5D0\uC11C \uD558\uB098\uB97C \uC120\uD0DD\uD55C \uB4A4 \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB85C \uC9C0\uC815\uD569\uB2C8\uB2E4.",
  optionsNotionUseLocationButton: "\uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB85C \uC0AC\uC6A9",
  optionsNotionSearchLoaded: "\uAC80\uC0C9 \uACB0\uACFC\uB97C \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.",
  optionsNotionSearchEmpty: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsNotionSearchFailed: "Notion \uC704\uCE58\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionOAuthRequiresPro: "Notion OAuth \uC800\uC7A5\uC740 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionConnectFirst: "\uBA3C\uC800 Notion\uC744 \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsNotionToken: "Integration token",
  optionsNotionTokenHint: "Notion internal integration \uD1A0\uD070\uC744 \uB123\uC2B5\uB2C8\uB2E4. \uC774 \uAC12\uC740 \uD604\uC7AC \uBE0C\uB77C\uC6B0\uC800 \uD504\uB85C\uD544\uC5D0\uB9CC \uC800\uC7A5\uB429\uB2C8\uB2E4.",
  optionsNotionParentPage: "Parent page ID \uB610\uB294 URL",
  optionsNotionParentPageHint: "Notion \uD398\uC774\uC9C0 URL \uC804\uCCB4\uB97C \uBD99\uC5EC\uB123\uC5B4\uB3C4 \uB418\uACE0, page ID\uB9CC \uB123\uC5B4\uB3C4 \uB429\uB2C8\uB2E4.",
  optionsNotionDataSource: "Data source ID \uB610\uB294 URL",
  optionsNotionDataSourceHint: "Notion data source URL \uC804\uCCB4 \uB610\uB294 data source ID\uB97C \uB123\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uC2DC \uC81C\uBAA9/\uD0DC\uADF8/\uB0A0\uC9DC \uAC19\uC740 \uC18D\uC131\uC744 \uC790\uB3D9 \uB9E4\uD551\uD569\uB2C8\uB2E4.",
  optionsNotionDataSourceLocked: "Data source \uC800\uC7A5\uC740 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionUploadMedia: "Notion \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC",
  optionsNotionUploadMediaHint: "\uC774\uBBF8\uC9C0\uC640 \uB3D9\uC601\uC0C1\uC744 \uC6D0\uACA9 \uB9C1\uD06C \uB300\uC2E0 Notion \uD30C\uC77C\uB85C \uC5C5\uB85C\uB4DC\uD569\uB2C8\uB2E4. \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD558\uBA74 \uB9C1\uD06C \uBC29\uC2DD\uC73C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  optionsNotionUploadMediaLocked: "Notion \uB0B4\uBD80 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC\uB294 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionTokenRequired: "Notion \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 integration token\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsNotionParentPageRequired: "Notion \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 parent page ID \uB610\uB294 URL\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsNotionInvalidPage: "Notion parent page ID \uB610\uB294 URL \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  optionsNotionDataSourceRequired: "Notion data source \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 data source ID \uB610\uB294 URL\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsNotionInvalidDataSource: "Notion data source ID \uB610\uB294 URL \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  optionsNotionPermissionDenied: "Notion API \uC811\uADFC \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC544 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsBasicSection: "\uAE30\uBCF8 \uC800\uC7A5",
  optionsBasicSubtitle: "",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Pro \uC124\uC815",
  optionsProSubtitle: "\uD544\uC694\uD560 \uB54C\uB9CC \uC5F4\uC5B4 \uC124\uC815\uD558\uC138\uC694. \uADDC\uCE59\uACFC AI \uC815\uB9AC\uB97C \uC5EC\uAE30\uC11C \uCF2D\uB2C8\uB2E4.",
  optionsProAiNote: "AI\uB294 \uC790\uB3D9\uC73C\uB85C \uC81C\uACF5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC790\uC2E0\uC758 API \uD0A4\uB97C \uB123\uC5B4\uC57C \uB3D9\uC791\uD569\uB2C8\uB2E4.",
  optionsProCompareFree: "Free",
  optionsProComparePro: "Pro",
  compareRowSave: "\uC800\uC7A5",
  compareRowImages: "\uC774\uBBF8\uC9C0 \uD3EC\uD568",
  compareRowReplies: "\uC5F0\uC18D \uB2F5\uAE00",
  compareRowDuplicates: "\uC911\uBCF5 \uAC74\uB108\uB700",
  compareRowFilename: "\uD30C\uC77C \uC774\uB984 \uADDC\uCE59",
  compareRowFolder: "\uC800\uC7A5 \uACBD\uB85C \uADDC\uCE59",
  compareRowNotionDataSource: "Notion data source \uC800\uC7A5",
  compareRowNotionMediaUpload: "Notion \uB0B4\uBD80 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC",
  compareRowAiSummary: "AI \uC694\uC57D",
  compareRowAiTags: "AI \uD0DC\uADF8",
  compareRowAiFrontmatter: "AI frontmatter",
  optionsProBadgeFree: "Free",
  optionsProBadgeActive: "Pro",
  optionsProStatusFree: "\uC9C0\uAE08\uC740 Free \uC0C1\uD0DC\uC785\uB2C8\uB2E4. \uC800\uC7A5\uC740 \uADF8\uB300\uB85C \uB418\uACE0, \uD544\uC694\uD560 \uB54C\uB9CC Pro\uB97C \uCF1C\uBA74 \uB429\uB2C8\uB2E4.",
  optionsProStatusActive: "Pro \uD65C\uC131\uD654\uB428. \uC544\uB798 \uADDC\uCE59\uACFC AI \uC124\uC815\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsProStatusExpired: "\uC774 Pro \uD0A4\uB294 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. Free \uC800\uC7A5\uC740 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsProStatusInvalid: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 Pro \uD0A4\uC785\uB2C8\uB2E4. Free \uC800\uC7A5\uC740 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsProStatusSeatLimit: "\uC774 Pro \uD0A4\uB294 \uC774\uBBF8 3\uB300\uC5D0\uC11C \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C \uBA3C\uC800 \uD574\uC81C\uD574 \uC8FC\uC138\uC694.",
  optionsProStatusNeedsActivation: "\uC720\uD6A8\uD55C Pro \uD0A4\uC774\uC9C0\uB9CC \uC544\uC9C1 \uC774 \uAE30\uAE30 seat\uAC00 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsProStatusOffline: "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC9C0\uB9CC, \uCD5C\uADFC \uD65C\uC131\uD654 \uC0C1\uD0DC\uB97C \uAE30\uC900\uC73C\uB85C \uACC4\uC18D \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
  optionsProStatusRevoked: "\uC774 Pro \uD0A4\uB294 \uB354 \uC774\uC0C1 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsProHolderLabel: "\uB300\uC0C1",
  optionsProExpiresLabel: "\uB9CC\uB8CC",
  optionsProUnlockLabel: "Pro \uD0A4 \uC785\uB825",
  optionsProUnlockHint: "\uAD6C\uB9E4 \uD6C4 \uBC1B\uC740 Pro \uD0A4\uB97C \uBD99\uC5EC\uB123\uC73C\uBA74 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBC14\uB85C \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  optionsProUnlockPlaceholder: "Pro \uD0A4\uB97C \uBD99\uC5EC\uB123\uC73C\uC138\uC694",
  optionsProSalesLink: "Pro \uAD6C\uB9E4\uD558\uAE30",
  optionsProActivate: "Pro \uD65C\uC131\uD654",
  optionsProClear: "\uC81C\uAC70",
  optionsProActivated: "Pro\uAC00 \uD65C\uC131\uD654\uB410\uC2B5\uB2C8\uB2E4.",
  optionsProRemoved: "Pro \uD0A4\uB97C \uC81C\uAC70\uD588\uC2B5\uB2C8\uB2E4.",
  optionsProEmptyKey: "\uBA3C\uC800 Pro \uD0A4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  optionsProLocalOnly: "Obsidian \uC800\uC7A5\uC740 \uAE30\uAE30 \uC548\uC5D0\uB9CC \uB0A8\uACE0, Cloud \uC800\uC7A5\uC740 \uC120\uD0DD\uD588\uC744 \uB54C\uB9CC \uB0B4 scrapbook \uACC4\uC815\uC73C\uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4.",
  optionsFileRules: "\uD30C\uC77C \uADDC\uCE59",
  optionsFilenamePattern: "\uD30C\uC77C \uC774\uB984 \uADDC\uCE59",
  optionsFilenamePatternLocked: "Free\uB294 \uAE30\uBCF8 \uD30C\uC77C \uC774\uB984\uC73C\uB85C \uC800\uC7A5\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C \uC6D0\uD558\uB294 \uADDC\uCE59\uC73C\uB85C \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsSavePathPattern: "\uC800\uC7A5 \uD3F4\uB354 \uACBD\uB85C",
  optionsSavePathTokens: "\uC608\uC2DC: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free\uB294 \uC5F0\uACB0\uD55C \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C \uB0A0\uC9DC\xB7\uC791\uC131\uC790 \uAE30\uC900\uC73C\uB85C \uD558\uC704 \uD3F4\uB354\uB97C \uC790\uB3D9 \uC9C0\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsFilenameTokens: "\uC0AC\uC6A9 \uAC00\uB2A5: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI \uC815\uB9AC",
  optionsAiSubtitle: "Provider\uB97C \uACE0\uB974\uBA74 \uAE30\uBCF8 Base URL\uACFC \uBAA8\uB378\uC774 \uC790\uB3D9\uC73C\uB85C \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.",
  optionsAiQuickstart: "\uB300\uBD80\uBD84\uC740 Provider\uC640 API \uD0A4\uB9CC \uC120\uD0DD\uD558\uBA74 \uB429\uB2C8\uB2E4. \uBC14\uAFBC \uB4A4\uC5D0\uB294 \uC544\uB798\uC5D0\uC11C \uC124\uC815 \uC800\uC7A5\uC744 \uB20C\uB7EC\uC57C \uBC18\uC601\uB429\uB2C8\uB2E4.",
  optionsAiAdvancedSummary: "\uACE0\uAE09 \uC124\uC815 \uC5F4\uAE30",
  optionsAiEnable: "AI \uC815\uB9AC \uC0AC\uC6A9",
  optionsAiProvider: "Provider",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini, Ollama\uB294 preset\uC73C\uB85C \uBC14\uB85C \uC2DC\uC791\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. Custom\uC740 OpenAI \uD638\uD658 \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uC6A9\uC785\uB2C8\uB2E4.",
  optionsAiProviderOpenAi: "OpenAI",
  optionsAiProviderOpenRouter: "OpenRouter",
  optionsAiProviderDeepSeek: "DeepSeek",
  optionsAiProviderGemini: "Gemini",
  optionsAiProviderOllama: "Ollama",
  optionsAiProviderCustom: "Custom",
  optionsAiApiKey: "API \uD0A4",
  optionsAiApiKeyHint: "Gemini \uD0A4\uB294 \uBCF4\uD1B5 AIza..., OpenAI/OpenRouter/DeepSeek \uD0A4\uB294 \uBCF4\uD1B5 sk-... \uD615\uD0DC\uC785\uB2C8\uB2E4. Ollama \uAC19\uC740 \uB85C\uCEEC \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uB294 \uBE44\uC6CC\uB458 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsAiApiKeyRequired: "\uC120\uD0DD\uD55C provider\uB294 API \uD0A4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsAiKeyMismatchGemini: "Gemini provider\uC5D0\uB294 Google Gemini API \uD0A4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uC9C0\uAE08 \uD0A4\uB294 OpenAI-compatible \uACC4\uC5F4\uCC98\uB7FC \uBCF4\uC785\uB2C8\uB2E4.",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek provider\uC5D0\uB294 Gemini \uD0A4(AIza...)\uAC00 \uC544\uB2C8\uB77C \uD574\uB2F9 provider \uD0A4\uB97C \uB123\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
  optionsAiBaseUrl: "Base URL",
  optionsAiBaseUrlHint: "\uC608\uC2DC: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
  optionsAiModel: "\uBAA8\uB378 \uC774\uB984",
  optionsAiModelHint: "\uC608\uC2DC: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
  optionsAiPrompt: "\uC815\uB9AC \uADDC\uCE59 \uD504\uB86C\uD504\uD2B8",
  optionsAiPromptHint: "\uC694\uC57D \uAE38\uC774, \uD0DC\uADF8 \uC2A4\uD0C0\uC77C, \uC6D0\uD558\uB294 frontmatter \uD544\uB4DC\uB97C \uC790\uC720\uB86D\uAC8C \uC801\uC5B4\uC8FC\uC138\uC694.",
  optionsAiLocked: "AI \uC815\uB9AC\uB294 Pro\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsAiInvalidBaseUrl: "AI Base URL \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  optionsAiPermissionDenied: "\uC120\uD0DD\uD55C AI \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \uAD8C\uD55C\uC774 \uC5C6\uC5B4 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsAiSaved: "AI \uC124\uC815\uACFC \uAD8C\uD55C\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsIncludeImages: "\uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1\uC744 \uAC19\uC774 \uC800\uC7A5",
  optionsSave: "\uC124\uC815 \uC800\uC7A5",
  optionsSaved: "\uC124\uC815\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsPendingSave: "\uBCC0\uACBD\uB428. \uC544\uB798 \uC124\uC815 \uC800\uC7A5\uC744 \uB20C\uB7EC\uC57C \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  optionsNoChanges: "\uC544\uC9C1 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsStep1: "1. Obsidian \uD3F4\uB354 \uC5F0\uACB0",
  optionsStep2: "2. \uBA3C\uC800 \uBB34\uB8CC\uB85C \uC800\uC7A5\uD574\uBCF4\uAE30",
  optionsStep3: "3. \uADDC\uCE59 \uB610\uB294 AI \uC815\uB9AC\uAC00 \uD544\uC694\uD558\uBA74 Pro \uD65C\uC131\uD654",
  mdImageLabel: "\uC774\uBBF8\uC9C0",
  mdVideoLabel: "\uB3D9\uC601\uC0C1",
  mdVideoThumbnailLabel: "\uB3D9\uC601\uC0C1 \uC378\uB124\uC77C",
  mdVideoOnThreads: "Threads\uC5D0\uC11C \uBCF4\uAE30",
  mdSavedVideoFile: "\uC800\uC7A5\uD55C \uC601\uC0C1 \uD30C\uC77C",
  mdReplySection: "\uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
  mdReplyLabel: "\uB2F5\uAE00",
  mdReplyImageLabel: "\uB2F5\uAE00 \uC774\uBBF8\uC9C0",
  mdUploadedMediaSection: "\uC5C5\uB85C\uB4DC\uD55C \uBBF8\uB514\uC5B4",
  mdSource: "\uC6D0\uBB38",
  mdAuthor: "\uC791\uC131\uC790",
  mdPublishedAt: "\uAC8C\uC2DC \uC2DC\uAC01",
  mdExternalLink: "\uC678\uBD80 \uB9C1\uD06C",
  mdWarning: "\uACBD\uACE0",
  mdSummary: "AI \uC694\uC57D",
  warnImageAccessFailed: "\uC77C\uBD80 \uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1\uC744 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD574 \uC6D0\uBCF8 \uB9C1\uD06C\uB97C \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
  warnImageDownloadOff: "\uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1 \uC800\uC7A5\uC774 \uAEBC\uC838 \uC788\uC5B4 \uC6D0\uBCF8 \uB9C1\uD06C\uB97C \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
  warnAiFailed: "AI \uC815\uB9AC\uC5D0 \uC2E4\uD328\uD574 \uC6D0\uBB38\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: {reason}",
  warnAiPermissionMissing: "AI \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \uAD8C\uD55C\uC774 \uC5C6\uC5B4 \uC6D0\uBB38\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C AI \uC139\uC158\uC744 \uB2E4\uC2DC \uC800\uC7A5\uD574 \uC8FC\uC138\uC694.",
  warnAiMissingModel: "AI \uBAA8\uB378 \uC774\uB984\uC774 \uC5C6\uC5B4 \uC6D0\uBB38\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  warnNotionMediaUploadFailed: "Notion \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD574 \uC6D0\uBCF8 \uB9C1\uD06C\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  errBrowserUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  errFolderNameFailed: "\uC800\uC7A5\uD560 \uD3F4\uB354 \uC774\uB984\uC744 \uACB0\uC815\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  errInvalidPath: "\uC798\uBABB\uB41C \uD30C\uC77C \uACBD\uB85C\uC785\uB2C8\uB2E4.",
  errNotionTokenMissing: "Notion integration token\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  errNotionPermissionMissing: "Notion API \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uB2E4\uC2DC \uC800\uC7A5\uD574 \uC8FC\uC138\uC694.",
  errNotionUnauthorized: "Notion \uD1A0\uD070\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uAC70\uB098 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  errNotionForbidden: "\uC120\uD0DD\uD55C Notion \uB300\uC0C1\uC5D0 \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. page \uB610\uB294 data source\uB97C integration\uC5D0 \uC5F0\uACB0\uD588\uB294\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  errNotionParentNotFound: "\uC120\uD0DD\uD55C Notion page \uB610\uB294 data source\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. ID\uC640 \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  errNotionRateLimited: "Notion \uC694\uCCAD\uC774 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4. {seconds}\uCD08 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
  errNotionValidation: "Notion \uC694\uCCAD \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  errNotionRequestFailed: "Notion \uC800\uC7A5 \uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  fallbackNoFolder: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC5C6\uC5B4",
  fallbackPermissionDenied: "\uD3F4\uB354 \uAD8C\uD55C\uC774 \uC5C6\uC5B4",
  fallbackDirectFailed: "\uD3F4\uB354\uC5D0 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD574",
  fallbackZipMessage: " \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD588\uC2B5\uB2C8\uB2E4.",
  errNotPermalink: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  errPostContentNotFound: "\uAC8C\uC2DC\uBB3C \uB0B4\uC6A9\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778 \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694."
};
var en = {
  uiLanguageLabel: "Language",
  uiLanguageKo: "\uD55C\uAD6D\uC5B4",
  uiLanguageEn: "English",
  popupTitle: "Save Current Post",
  popupSave: "Save Current Post",
  popupSettings: "Settings",
  popupPromoTitle: "Reserved Area",
  popupPromoDescription: "This space is reserved for future guidance and recommendations.",
  popupSubtitleDirect: "Saving directly to your connected Obsidian folder.",
  popupSubtitleDownload: "No folder connected. Saving as a download. Connect a folder in settings.",
  popupSubtitleConnected: "Saving directly to your connected Obsidian folder.",
  popupSubtitlePermissionCheck: "Folder connected, but permission may need re-confirmation.",
  popupSubtitleNoFolder: "Saves directly when a folder is connected, otherwise downloads a file.",
  popupSubtitleUnsupported: "This browser only supports file downloads.",
  popupSubtitleNotion: "Saving to your configured Notion destination.",
  popupSubtitleNotionSetup: "To use Notion saving, enter your token and destination in settings first.",
  popupSubtitleCloud: "Saving to your Threads Archive cloud scrapbook. Make sure you are signed in on the web first.",
  popupRecentSaves: "Recent Saves",
  popupClearAll: "Clear All",
  popupEmpty: "No saved posts yet.",
  popupResave: "Re-save",
  popupExpand: "Expand",
  popupCollapse: "Collapse",
  popupDelete: "Delete",
  popupOpenRemote: "Open remote",
  popupCloudConnect: "Connect Cloud",
  popupCloudDisconnect: "Disconnect Cloud",
  statusReady: "Ready to save from a post permalink page.",
  statusReadyDirect: "Ready. Press to save directly to your Obsidian folder.",
  statusReadyDownload: "Ready. Press to download the file.",
  statusReadyCloud: "Ready. Press to save into your Threads Archive cloud scrapbook.",
  statusUnsupported: "Please open an individual post page first.",
  statusNoTab: "Could not find an active tab.",
  statusSaving: "Saving\u2026",
  statusSavedDirect: "Saved directly to your Obsidian folder.",
  statusSavedZip: "Saved. Download started.",
  statusSavedNotion: "Saved to Notion.",
  statusSavedCloud: "Saved to Threads Archive scrapbook.",
  statusDuplicate: "Already saved \u2014 updated with the latest content.",
  statusDuplicateWarning: "Already saved, updated: ",
  statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
  statusNotionSetupRequired: "To use Notion saving, enter your token and destination in settings first.",
  statusError: "An unknown error occurred.",
  statusResaving: "Preparing your file\u2026",
  statusResaved: "Download started.",
  statusResavedNotion: "Saved to Notion as a new page.",
  statusResavedCloud: "Saved again to Threads Archive scrapbook.",
  statusCloudLoginRequired: "To use cloud save, sign in first at ss-threads.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "Connect the extension to your Threads Archive scrapbook first.",
  statusCloudSessionExpired: "Your cloud connection expired. Reconnect the extension.",
  statusCloudOffline: "Could not verify the cloud connection. Check your network.",
  statusCloudConnected: "Threads Archive Cloud is now connected.",
  statusCloudDisconnected: "Threads Archive Cloud has been disconnected.",
  statusCloudLinkStarting: "Finish connecting Threads Archive scrapbook in your browser.",
  statusRecentNotFound: "Could not find the recent save record.",
  statusDeletedRecent: "Deleted from recent saves.",
  statusClearedRecents: "All recent saves cleared.",
  statusExtractFailed: "Could not read the post.",
  statusTabError: "Could not read active tab information.",
  statusRedownloadError: "Error during re-download.",
  statusRetry: "Retry",
  statusResaveButton: "Re-save",
  optionsTitle: "Save Threads posts to Obsidian, Threads Archive Cloud, or Notion, with auto-organize.",
  optionsTitleObsidianOnly: "Save Threads posts to Obsidian or Threads Archive Cloud, with auto-organize.",
  optionsSubtitle: "Free saving, Pro only when needed.",
  optionsSubtitleObsidianOnly: "The current UI exposes Obsidian and Cloud save first, while Notion stays hidden until the integration is ready.",
  optionsPlanSpotlightFreeTitle: "Free",
  optionsPlanSpotlightFreeCopy: "Basic saving is ready to use.",
  optionsPlanSpotlightActiveTitle: "Pro active",
  optionsPlanSpotlightActiveCopy: "Pro features are enabled on this browser.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro needs activation",
  optionsPlanSpotlightNeedsActivationCopy: "The key is valid, but this device does not have an active seat yet.",
  optionsPlanSpotlightSeatMeta: "Seat {used}/{limit} \xB7 {device}",
  optionsAdSlotLabel: "Ad",
  optionsAdSlotTitle: "Ad placeholder",
  optionsAdSlotCopy: "Reserved for a future banner or announcement.",
  optionsFolderSection: "Connect Obsidian Folder",
  optionsFolderStatus: "Checking connected folder\u2026",
  optionsFolderLabel: "Current Folder",
  optionsFolderNotConnected: "Not connected",
  optionsFolderConnect: "Connect Folder",
  optionsFolderDisconnect: "Disconnect",
  optionsFolderUnsupported: "Folder connection not supported in this browser",
  optionsFolderUnsupportedStatus: "This browser cannot save directly to a folder. Files will be downloaded instead.",
  optionsFolderNotConnectedStatus: "No folder connected. Files will be downloaded when you save.",
  optionsFolderReady: "Folder connected. Files will be saved directly.",
  optionsFolderPermissionCheck: "Folder connected. Permission may be re-confirmed on next save.",
  optionsFolderPermissionLost: "Folder permission lost. Please reconnect your folder.",
  optionsFolderChecked: "Folder connection verified. Direct save will be attempted.",
  optionsFolderCancelled: "Folder selection cancelled.",
  optionsFolderError: "Error connecting folder.",
  optionsFolderConnectedSuccess: 'Connected the "{folder}" folder.',
  optionsFolderPathLabel: "Current Save Location",
  optionsFolderPathHint: "The browser cannot expose the OS absolute path, so this stays relative to the connected folder.",
  optionsFolderPathUnavailable: "Shown after you connect a folder",
  optionsSaveTarget: "Save target",
  optionsSaveTargetHint: "On PC, choose Obsidian, Threads Archive Cloud, or Notion as the default destination.",
  optionsSaveTargetHintObsidianOnly: "The current UI exposes Obsidian and Threads Archive Cloud first. Notion stays hidden in settings while the integration is being prepared internally.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetCloud: "Threads Archive Cloud",
  optionsSaveTargetNotion: "Notion",
  optionsSaveTargetNotionHidden: "Notion (Hidden for now)",
  optionsCloudRequiresPro: "Cloud save is available in Pro only.",
  optionsCloudSection: "Threads Archive Cloud Connection",
  optionsCloudStatusLabel: "Cloud connection",
  optionsCloudStatusUnlinked: "Not connected yet.",
  optionsCloudStatusLinked: "Connected as @{handle}.",
  optionsCloudStatusExpired: "The connection expired. Reconnect the extension.",
  optionsCloudStatusOffline: "The server could not be reached, so only the last known state is shown.",
  optionsCloudConnectButton: "Connect Cloud",
  optionsCloudDisconnectButton: "Disconnect Cloud",
  optionsCloudLinkHint: "The connect button opens scrapbook in your browser and links the logged-in account to this extension.",
  optionsNotionSection: "Notion Connection",
  optionsNotionSubtitle: "Notion is connected through OAuth so the browser never asks for an internal token. Connect once, choose a default destination, and save after that.",
  optionsNotionConnectionLabel: "Connection",
  optionsNotionConnectButton: "Connect Notion",
  optionsNotionDisconnectButton: "Disconnect",
  optionsNotionConnectHint: "A Notion approval tab will open. After approval, return here and the connection state will refresh automatically.",
  optionsNotionConnected: "A Notion workspace is connected.",
  optionsNotionDisconnected: "Notion is not connected yet.",
  optionsNotionConnectStarted: "Opened the Notion connection tab. Return here after approval.",
  optionsNotionConnectFailed: "Could not start the Notion connection flow.",
  optionsNotionDisconnectedSaved: "Disconnected the Notion workspace.",
  optionsNotionDisconnectFailed: "Could not disconnect Notion.",
  optionsNotionParentType: "Save mode",
  optionsNotionParentTypeHint: "Choose whether the default destination should be a page or a data source in the connected workspace.",
  optionsNotionParentTypePage: "Parent page",
  optionsNotionParentTypeDataSource: "Data source",
  optionsNotionSelectedTarget: "Default destination",
  optionsNotionSelectedTargetHint: "This is where the save button will send new Threads captures by default.",
  optionsNotionTargetNotSelected: "No default destination has been selected yet.",
  optionsNotionTargetRequired: "Choose a default Notion destination first.",
  optionsNotionTargetSaved: "Saved the default Notion destination.",
  optionsNotionTargetSaveFailed: "Could not save the default Notion destination.",
  optionsNotionSearchLabel: "Find a destination",
  optionsNotionSearchHint: "Search pages or data sources you have granted this integration access to.",
  optionsNotionSearchPlaceholderPage: "For example: Product Notes",
  optionsNotionSearchPlaceholderDataSource: "For example: Threads Inbox",
  optionsNotionSearchButton: "Search destinations",
  optionsNotionResultsLabel: "Results",
  optionsNotionResultsHint: "Choose one result and set it as the default save destination.",
  optionsNotionUseLocationButton: "Use as default destination",
  optionsNotionSearchLoaded: "Loaded Notion destinations.",
  optionsNotionSearchEmpty: "No matching Notion destinations were found.",
  optionsNotionSearchFailed: "Could not load Notion destinations.",
  optionsNotionOAuthRequiresPro: "Notion OAuth saving is available in Pro only.",
  optionsNotionConnectFirst: "Connect Notion first.",
  optionsNotionToken: "Integration token",
  optionsNotionTokenHint: "Paste your Notion internal integration token. It is stored only in this browser profile.",
  optionsNotionParentPage: "Parent page ID or URL",
  optionsNotionParentPageHint: "You can paste a full Notion page URL or just the page ID.",
  optionsNotionDataSource: "Data source ID or URL",
  optionsNotionDataSourceHint: "Paste a full Notion data source URL or just its ID. Title, tags, dates, and similar properties are mapped automatically when possible.",
  optionsNotionDataSourceLocked: "Data source saving is available in Pro only.",
  optionsNotionUploadMedia: "Upload media into Notion",
  optionsNotionUploadMediaHint: "Upload images and videos as Notion-managed files instead of leaving them as remote links. If upload fails, the save falls back to links.",
  optionsNotionUploadMediaLocked: "Notion-managed media upload is available in Pro only.",
  optionsNotionTokenRequired: "A Notion integration token is required to use Notion saving.",
  optionsNotionParentPageRequired: "A Notion parent page ID or URL is required to use Notion saving.",
  optionsNotionInvalidPage: "The Notion parent page ID or URL format is not valid.",
  optionsNotionDataSourceRequired: "A Notion data source ID or URL is required to use data source saving.",
  optionsNotionInvalidDataSource: "The Notion data source ID or URL format is not valid.",
  optionsNotionPermissionDenied: "Permission to access the Notion API was denied, so settings were not saved.",
  optionsBasicSection: "Basic Saving",
  optionsBasicSubtitle: "",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Pro Settings",
  optionsProSubtitle: "Open only when needed. This is where rules and AI organization live.",
  optionsProAiNote: "AI is not included automatically. It runs only after you add your own API key.",
  optionsProCompareFree: "Free",
  optionsProComparePro: "Pro",
  compareRowSave: "Save",
  compareRowImages: "Images",
  compareRowReplies: "Thread replies",
  compareRowDuplicates: "Skip duplicates",
  compareRowFilename: "File name format",
  compareRowFolder: "Save path rules",
  compareRowNotionDataSource: "Notion data source",
  compareRowNotionMediaUpload: "Notion media upload",
  compareRowAiSummary: "AI summary",
  compareRowAiTags: "AI tags",
  compareRowAiFrontmatter: "AI frontmatter",
  optionsProBadgeFree: "Free",
  optionsProBadgeActive: "Pro",
  optionsProStatusFree: "You are on Free. Saving already works, and Pro is only needed when you want rules or AI.",
  optionsProStatusActive: "Pro active. Rule-based organization and AI are available below.",
  optionsProStatusExpired: "This Pro key has expired. Free saving still works.",
  optionsProStatusInvalid: "This Pro key is not valid. Free saving still works.",
  optionsProStatusSeatLimit: "This Pro key is already active on 3 devices. Release one on another device first.",
  optionsProStatusNeedsActivation: "The Pro key is valid, but this device does not have an active seat yet.",
  optionsProStatusOffline: "Could not reach the server, so the most recent activation state is being used.",
  optionsProStatusRevoked: "This Pro key can no longer be used.",
  optionsProHolderLabel: "Holder",
  optionsProExpiresLabel: "Expires",
  optionsProUnlockLabel: "Pro key",
  optionsProUnlockHint: "Paste the Pro key from your purchase email to activate on this browser.",
  optionsProUnlockPlaceholder: "Paste your Pro key here",
  optionsProSalesLink: "Get Pro",
  optionsProActivate: "Activate Pro",
  optionsProClear: "Remove",
  optionsProActivated: "Pro activated.",
  optionsProRemoved: "The Pro key has been removed.",
  optionsProEmptyKey: "Enter a Pro key first.",
  optionsProLocalOnly: "Obsidian saves stay on your device, and Cloud save only sends a post to your scrapbook account when you choose it.",
  optionsFileRules: "File Rules",
  optionsFilenamePattern: "File Name Format",
  optionsFilenamePatternLocked: "Free uses a default file name. Pro lets you set your own format.",
  optionsSavePathPattern: "Subfolder Path",
  optionsSavePathTokens: "Examples: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free saves to the root of your connected folder. Pro lets you automatically sort into subfolders by date, author, or topic.",
  optionsFilenameTokens: "Available: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI Organization",
  optionsAiSubtitle: "Choose a provider and the default base URL and model are filled in for you.",
  optionsAiQuickstart: "Most users only need a provider and API key. After changing them, press Save Settings below to apply them.",
  optionsAiAdvancedSummary: "Show advanced settings",
  optionsAiEnable: "Enable AI organization",
  optionsAiProvider: "Provider",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini, and Ollama can start from presets. Custom is for any OpenAI-compatible endpoint.",
  optionsAiProviderOpenAi: "OpenAI",
  optionsAiProviderOpenRouter: "OpenRouter",
  optionsAiProviderDeepSeek: "DeepSeek",
  optionsAiProviderGemini: "Gemini",
  optionsAiProviderOllama: "Ollama",
  optionsAiProviderCustom: "Custom",
  optionsAiApiKey: "API key",
  optionsAiApiKeyHint: "Gemini keys usually start with AIza, while OpenAI/OpenRouter/DeepSeek keys usually start with sk-. Leave this blank only for local endpoints like Ollama when no key is required.",
  optionsAiApiKeyRequired: "The selected provider requires an API key.",
  optionsAiKeyMismatchGemini: "Gemini needs a Google Gemini API key. The current key looks like an OpenAI-compatible key.",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek providers require their own key, not a Gemini key that starts with AIza.",
  optionsAiBaseUrl: "Base URL",
  optionsAiBaseUrlHint: "Examples: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
  optionsAiModel: "Model name",
  optionsAiModelHint: "Examples: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
  optionsAiPrompt: "Organization prompt",
  optionsAiPromptHint: "Describe your summary length, tag style, and desired frontmatter fields.",
  optionsAiLocked: "AI organization is available in Pro only.",
  optionsAiInvalidBaseUrl: "The AI base URL is not valid.",
  optionsAiPermissionDenied: "Permission for the selected AI endpoint was denied, so settings were not saved.",
  optionsAiSaved: "AI settings and endpoint permission saved.",
  optionsIncludeImages: "Save images and video files",
  optionsSave: "Save Settings",
  optionsSaved: "Settings saved.",
  optionsPendingSave: "Changed. Press Save Settings below to apply it.",
  optionsNoChanges: "No changes yet.",
  optionsStep1: "1. Connect Obsidian folder",
  optionsStep2: "2. Try saving for free first",
  optionsStep3: "3. Activate Pro when you want rules or AI organization",
  mdImageLabel: "Image",
  mdVideoLabel: "Video",
  mdVideoThumbnailLabel: "Video thumbnail",
  mdVideoOnThreads: "Open on Threads",
  mdSavedVideoFile: "Saved video file",
  mdReplySection: "Author Replies",
  mdReplyLabel: "Reply",
  mdReplyImageLabel: "Reply image",
  mdUploadedMediaSection: "Uploaded media",
  mdSource: "Source",
  mdAuthor: "Author",
  mdPublishedAt: "Published at",
  mdExternalLink: "External link",
  mdWarning: "Warning",
  mdSummary: "AI Summary",
  warnImageAccessFailed: "Some images or videos couldn't be saved; original links were kept.",
  warnImageDownloadOff: "Image/video saving is off; original links were kept.",
  warnAiFailed: "AI organization failed, so the original note was saved instead: {reason}",
  warnAiPermissionMissing: "AI endpoint permission is missing, so the original note was saved. Re-save the AI section in settings.",
  warnAiMissingModel: "No AI model name is configured, so the original note was saved.",
  warnNotionMediaUploadFailed: "Notion media upload failed, so remote links were saved instead.",
  errBrowserUnsupported: "This browser cannot save directly to an Obsidian folder.",
  errFolderNameFailed: "Could not determine a folder name for saving.",
  errInvalidPath: "Invalid file path.",
  errNotionTokenMissing: "No Notion integration token is configured.",
  errNotionPermissionMissing: "Permission for the Notion API is missing. Re-save settings first.",
  errNotionUnauthorized: "The Notion token is invalid or expired.",
  errNotionForbidden: "This integration cannot access the selected Notion destination. Make sure the page or data source is shared with the integration.",
  errNotionParentNotFound: "The selected Notion page or data source could not be found. Check the ID and connection.",
  errNotionRateLimited: "Too many Notion requests. Try again in {seconds} seconds.",
  errNotionValidation: "The Notion request is not valid.",
  errNotionRequestFailed: "The Notion save request failed.",
  fallbackNoFolder: "No folder connected,",
  fallbackPermissionDenied: "No folder permission,",
  fallbackDirectFailed: "Could not save to folder,",
  fallbackZipMessage: " saved as download instead.",
  errNotPermalink: "Please open an individual post page first.",
  errPostContentNotFound: "Could not load post content. Please make sure you are logged in."
};
var ja = {
  ...en,
  uiLanguageLabel: "\u8A00\u8A9E",
  popupTitle: "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58",
  popupSave: "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58",
  popupSettings: "\u8A2D\u5B9A",
  popupPromoTitle: "\u4E88\u7D04\u6E08\u307F\u30A8\u30EA\u30A2",
  popupPromoDescription: "\u4ECA\u5F8C\u306E\u6848\u5185\u3084\u304A\u3059\u3059\u3081\u3092\u8868\u793A\u3059\u308B\u305F\u3081\u306E\u9818\u57DF\u3067\u3059\u3002",
  popupSubtitleDirect: "\u63A5\u7D9A\u6E08\u307F\u306E Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  popupSubtitleDownload: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u30D5\u30A1\u30A4\u30EB\u3068\u3057\u3066\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002\u8A2D\u5B9A\u3067\u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  popupSubtitleConnected: "\u63A5\u7D9A\u6E08\u307F\u306E Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  popupSubtitlePermissionCheck: "\u30D5\u30A9\u30EB\u30C0\u306F\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u6A29\u9650\u306E\u518D\u78BA\u8A8D\u304C\u5FC5\u8981\u306A\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
  popupSubtitleNoFolder: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308C\u3070\u76F4\u63A5\u4FDD\u5B58\u3057\u3001\u672A\u63A5\u7D9A\u306A\u3089\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
  popupSubtitleUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A1\u30A4\u30EB\u306E\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u306E\u307F\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
  popupSubtitleNotion: "\u8A2D\u5B9A\u6E08\u307F\u306E Notion \u4FDD\u5B58\u5148\u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  popupSubtitleNotionSetup: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B\u8A2D\u5B9A\u3067\u30C8\u30FC\u30AF\u30F3\u3068\u4FDD\u5B58\u5148\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  popupSubtitleCloud: "Threads Archive \u306E\u30AF\u30E9\u30A6\u30C9 scrapbook \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002\u5148\u306B Web \u3067\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  popupRecentSaves: "\u6700\u8FD1\u306E\u4FDD\u5B58",
  popupClearAll: "\u3059\u3079\u3066\u524A\u9664",
  popupEmpty: "\u307E\u3060\u4FDD\u5B58\u3057\u305F\u6295\u7A3F\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
  popupResave: "\u518D\u4FDD\u5B58",
  popupExpand: "\u5C55\u958B",
  popupCollapse: "\u6298\u308A\u305F\u305F\u3080",
  popupDelete: "\u524A\u9664",
  popupOpenRemote: "\u4FDD\u5B58\u5148\u3092\u958B\u304F",
  popupCloudConnect: "Cloud \u3092\u63A5\u7D9A",
  popupCloudDisconnect: "Cloud \u3092\u5207\u65AD",
  statusReady: "\u6295\u7A3F\u306E\u500B\u5225\u30DA\u30FC\u30B8\u304B\u3089\u4FDD\u5B58\u3059\u308B\u6E96\u5099\u304C\u3067\u304D\u307E\u3057\u305F\u3002",
  statusReadyDirect: "\u6E96\u5099\u5B8C\u4E86\u3002\u62BC\u3059\u3068 Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  statusReadyDownload: "\u6E96\u5099\u5B8C\u4E86\u3002\u62BC\u3059\u3068\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
  statusReadyCloud: "\u6E96\u5099\u5B8C\u4E86\u3002\u62BC\u3059\u3068 Threads Archive \u306E\u30AF\u30E9\u30A6\u30C9 scrapbook \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  statusUnsupported: "\u5148\u306B\u6295\u7A3F\u306E\u500B\u5225\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
  statusNoTab: "\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30BF\u30D6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusSaving: "\u4FDD\u5B58\u4E2D\u2026",
  statusSavedDirect: "Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusSavedZip: "\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3092\u958B\u59CB\u3057\u307E\u3057\u305F\u3002",
  statusSavedNotion: "Notion \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusSavedCloud: "Threads Archive scrapbook \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusDuplicate: "\u3059\u3067\u306B\u4FDD\u5B58\u6E08\u307F\u3067\u3057\u305F\u304C\u3001\u6700\u65B0\u5185\u5BB9\u3067\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002",
  statusDuplicateWarning: "\u3059\u3067\u306B\u4FDD\u5B58\u6E08\u307F\u3067\u3057\u305F\u304C\u66F4\u65B0\u3057\u307E\u3057\u305F: ",
  statusAlreadySaved: "\u3053\u306E\u6295\u7A3F\u306F\u3059\u3067\u306B\u4FDD\u5B58\u6E08\u307F\u3067\u3059\u3002\u3082\u3046\u4E00\u5EA6\u4FDD\u5B58\u3059\u308B\u306B\u306F\u6700\u8FD1\u306E\u4FDD\u5B58\u304B\u3089\u300C\u518D\u4FDD\u5B58\u300D\u3092\u4F7F\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
  statusNotionSetupRequired: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B\u8A2D\u5B9A\u3067\u30C8\u30FC\u30AF\u30F3\u3068\u4FDD\u5B58\u5148\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusError: "\u4E0D\u660E\u306A\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
  statusResaving: "\u30D5\u30A1\u30A4\u30EB\u3092\u6E96\u5099\u4E2D\u2026",
  statusResaved: "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3092\u958B\u59CB\u3057\u307E\u3057\u305F\u3002",
  statusResavedNotion: "Notion \u306B\u65B0\u3057\u3044\u30DA\u30FC\u30B8\u3068\u3057\u3066\u518D\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusResavedCloud: "Threads Archive scrapbook \u306B\u518D\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusCloudLoginRequired: "Cloud \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B ss-threads.dahanda.dev/scrapbook \u3067\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudConnectRequired: "Cloud \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B extension \u3092 Threads Archive scrapbook \u306B\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudSessionExpired: "Cloud \u63A5\u7D9A\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002extension \u3092\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudOffline: "Cloud \u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudConnected: "Threads Archive Cloud \u306E\u63A5\u7D9A\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002",
  statusCloudDisconnected: "Threads Archive Cloud \u306E\u63A5\u7D9A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",
  statusCloudLinkStarting: "\u30D6\u30E9\u30A6\u30B6\u3067 Threads Archive scrapbook \u3068\u306E\u63A5\u7D9A\u3092\u5B8C\u4E86\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusRecentNotFound: "\u6700\u8FD1\u306E\u4FDD\u5B58\u5C65\u6B74\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusDeletedRecent: "\u6700\u8FD1\u306E\u4FDD\u5B58\u304B\u3089\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
  statusClearedRecents: "\u6700\u8FD1\u306E\u4FDD\u5B58\u3092\u3059\u3079\u3066\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
  statusExtractFailed: "\u6295\u7A3F\u3092\u8AAD\u307F\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusTabError: "\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30BF\u30D6\u60C5\u5831\u3092\u8AAD\u307F\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusRedownloadError: "\u518D\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
  statusRetry: "\u518D\u8A66\u884C",
  statusResaveButton: "\u518D\u4FDD\u5B58",
  optionsTitle: "Threads \u306E\u6295\u7A3F\u3092 Obsidian\u3001Threads Archive Cloud\u3001Notion \u306B\u4FDD\u5B58\u3057\u3001\u81EA\u52D5\u6574\u7406\u3067\u304D\u307E\u3059\u3002",
  optionsTitleObsidianOnly: "Threads \u306E\u6295\u7A3F\u3092 Obsidian \u307E\u305F\u306F Threads Archive Cloud \u306B\u4FDD\u5B58\u3057\u3001\u81EA\u52D5\u6574\u7406\u3067\u304D\u307E\u3059\u3002",
  optionsSubtitle: "\u4FDD\u5B58\u306F\u7121\u6599\u3002\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051 Pro\u3002",
  optionsSubtitleObsidianOnly: "\u73FE\u5728\u306E UI \u3067\u306F Obsidian \u3068 Cloud \u4FDD\u5B58\u3092\u5148\u306B\u63D0\u4F9B\u3057\u3001Notion \u306F\u9023\u643A\u6E96\u5099\u304C\u6574\u3046\u307E\u3067\u975E\u8868\u793A\u3067\u3059\u3002",
  optionsPlanSpotlightFreeCopy: "\u57FA\u672C\u306E\u4FDD\u5B58\u6A5F\u80FD\u306F\u3059\u3050\u306B\u4F7F\u3048\u307E\u3059\u3002",
  optionsPlanSpotlightActiveTitle: "Pro \u6709\u52B9",
  optionsPlanSpotlightActiveCopy: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067 Pro \u6A5F\u80FD\u304C\u6709\u52B9\u3067\u3059\u3002",
  optionsPlanSpotlightNeedsActivationTitle: "Pro \u306E\u6709\u52B9\u5316\u304C\u5FC5\u8981\u3067\u3059",
  optionsPlanSpotlightNeedsActivationCopy: "\u30AD\u30FC\u306F\u6709\u52B9\u3067\u3059\u304C\u3001\u3053\u306E\u30C7\u30D0\u30A4\u30B9\u306E seat \u306F\u307E\u3060\u6709\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsAdSlotTitle: "\u5E83\u544A\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC",
  optionsAdSlotCopy: "\u4ECA\u5F8C\u306E\u30D0\u30CA\u30FC\u3084\u304A\u77E5\u3089\u305B\u7528\u306E\u9818\u57DF\u3067\u3059\u3002",
  optionsFolderSection: "Obsidian \u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A",
  optionsFolderStatus: "\u63A5\u7D9A\u6E08\u307F\u30D5\u30A9\u30EB\u30C0\u3092\u78BA\u8A8D\u4E2D\u2026",
  optionsFolderLabel: "\u73FE\u5728\u306E\u30D5\u30A9\u30EB\u30C0",
  optionsFolderNotConnected: "\u672A\u63A5\u7D9A",
  optionsFolderConnect: "\u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A",
  optionsFolderDisconnect: "\u5207\u65AD",
  optionsFolderUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u305B\u3093",
  optionsFolderUnsupportedStatus: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A9\u30EB\u30C0\u3078\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
  optionsFolderNotConnectedStatus: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u4FDD\u5B58\u6642\u306F\u30D5\u30A1\u30A4\u30EB\u304C\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059\u3002",
  optionsFolderReady: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u307E\u3057\u305F\u3002\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u307E\u3059\u3002",
  optionsFolderPermissionCheck: "\u30D5\u30A9\u30EB\u30C0\u306F\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u6B21\u56DE\u4FDD\u5B58\u6642\u306B\u6A29\u9650\u304C\u518D\u78BA\u8A8D\u3055\u308C\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
  optionsFolderPermissionLost: "\u30D5\u30A9\u30EB\u30C0\u6A29\u9650\u304C\u5931\u308F\u308C\u307E\u3057\u305F\u3002\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsFolderChecked: "\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u307E\u3057\u305F\u3002\u76F4\u63A5\u4FDD\u5B58\u3092\u8A66\u307F\u307E\u3059\u3002",
  optionsFolderCancelled: "\u30D5\u30A9\u30EB\u30C0\u9078\u629E\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F\u3002",
  optionsFolderError: "\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
  optionsFolderConnectedSuccess: '"{folder}" \u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A\u3057\u307E\u3057\u305F\u3002',
  optionsFolderPathLabel: "\u73FE\u5728\u306E\u4FDD\u5B58\u5148",
  optionsFolderPathHint: "\u30D6\u30E9\u30A6\u30B6\u306F OS \u306E\u7D76\u5BFE\u30D1\u30B9\u3092\u516C\u958B\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u63A5\u7D9A\u6E08\u307F\u30D5\u30A9\u30EB\u30C0\u304B\u3089\u306E\u76F8\u5BFE\u4F4D\u7F6E\u3067\u8868\u793A\u3057\u307E\u3059\u3002",
  optionsFolderPathUnavailable: "\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u5F8C\u306B\u8868\u793A\u3055\u308C\u307E\u3059",
  optionsSaveTarget: "\u4FDD\u5B58\u5148",
  optionsSaveTargetHint: "PC \u3067\u306F Obsidian\u3001Threads Archive Cloud\u3001Notion \u306E\u3044\u305A\u308C\u304B\u3092\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u306B\u9078\u3079\u307E\u3059\u3002",
  optionsSaveTargetHintObsidianOnly: "\u73FE\u5728\u306E UI \u3067\u306F Obsidian \u3068 Threads Archive Cloud \u3092\u5148\u306B\u63D0\u4F9B\u3057\u3066\u3044\u307E\u3059\u3002Notion \u306F\u5185\u90E8\u6E96\u5099\u4E2D\u306E\u305F\u3081\u8A2D\u5B9A\u3067\u306F\u975E\u8868\u793A\u3067\u3059\u3002",
  optionsSaveTargetNotionHidden: "Notion\uFF08\u4ECA\u306F\u975E\u8868\u793A\uFF09",
  optionsCloudRequiresPro: "Cloud \u4FDD\u5B58\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsCloudSection: "Threads Archive Cloud \u63A5\u7D9A",
  optionsCloudStatusLabel: "Cloud \u63A5\u7D9A\u72B6\u614B",
  optionsCloudStatusUnlinked: "\u307E\u3060\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsCloudStatusLinked: "@{handle} \u3068\u3057\u3066\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
  optionsCloudStatusExpired: "\u63A5\u7D9A\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsCloudStatusOffline: "\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u6700\u5F8C\u306B\u78BA\u8A8D\u3067\u304D\u305F\u72B6\u614B\u306E\u307F\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002",
  optionsCloudConnectButton: "Cloud \u3092\u63A5\u7D9A",
  optionsCloudDisconnectButton: "Cloud \u3092\u5207\u65AD",
  optionsCloudLinkHint: "\u63A5\u7D9A\u30DC\u30BF\u30F3\u3092\u62BC\u3059\u3068\u30D6\u30E9\u30A6\u30B6\u3067 scrapbook \u304C\u958B\u304D\u3001\u30ED\u30B0\u30A4\u30F3\u6E08\u307F\u30A2\u30AB\u30A6\u30F3\u30C8\u3068 extension \u304C\u9023\u643A\u3055\u308C\u307E\u3059\u3002",
  optionsNotionSection: "Notion \u63A5\u7D9A",
  optionsNotionSubtitle: "Notion \u306F OAuth \u3067\u63A5\u7D9A\u3055\u308C\u308B\u305F\u3081\u3001\u30D6\u30E9\u30A6\u30B6\u304C\u5185\u90E8\u30C8\u30FC\u30AF\u30F3\u3092\u76F4\u63A5\u8981\u6C42\u3059\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u4E00\u5EA6\u63A5\u7D9A\u3057\u3066\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u3092\u9078\u3079\u3070\u3001\u305D\u306E\u5F8C\u306F\u4FDD\u5B58\u3059\u308B\u3060\u3051\u3067\u3059\u3002",
  optionsNotionConnectionLabel: "\u63A5\u7D9A\u72B6\u614B",
  optionsNotionDisconnectButton: "\u5207\u65AD",
  optionsNotionConnectHint: "Notion \u306E\u627F\u8A8D\u30BF\u30D6\u304C\u958B\u304D\u307E\u3059\u3002\u627F\u8A8D\u5F8C\u306B\u3053\u3053\u3078\u623B\u308B\u3068\u63A5\u7D9A\u72B6\u614B\u304C\u81EA\u52D5\u66F4\u65B0\u3055\u308C\u307E\u3059\u3002",
  optionsNotionConnected: "Notion \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
  optionsNotionDisconnected: "Notion \u306F\u307E\u3060\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsNotionConnectStarted: "Notion \u63A5\u7D9A\u30BF\u30D6\u3092\u958B\u304D\u307E\u3057\u305F\u3002\u627F\u8A8D\u5F8C\u306B\u3053\u3053\u3078\u623B\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNotionConnectFailed: "Notion \u63A5\u7D9A\u30D5\u30ED\u30FC\u3092\u958B\u59CB\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionDisconnectedSaved: "Notion \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u63A5\u7D9A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",
  optionsNotionDisconnectFailed: "Notion \u306E\u5207\u65AD\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
  optionsNotionParentType: "\u4FDD\u5B58\u30E2\u30FC\u30C9",
  optionsNotionParentTypeHint: "\u63A5\u7D9A\u6E08\u307F\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u3001\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u3092\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u304B\u3089\u9078\u3073\u307E\u3059\u3002",
  optionsNotionSelectedTarget: "\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148",
  optionsNotionSelectedTargetHint: "\u4FDD\u5B58\u30DC\u30BF\u30F3\u306F\u65B0\u3057\u3044 Threads \u6295\u7A3F\u3092\u65E2\u5B9A\u3067\u3053\u3053\u3078\u9001\u308A\u307E\u3059\u3002",
  optionsNotionTargetNotSelected: "\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u306F\u307E\u3060\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsNotionTargetRequired: "\u5148\u306B\u65E2\u5B9A\u306E Notion \u4FDD\u5B58\u5148\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002",
  optionsNotionTargetSaved: "\u65E2\u5B9A\u306E Notion \u4FDD\u5B58\u5148\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  optionsNotionTargetSaveFailed: "\u65E2\u5B9A\u306E Notion \u4FDD\u5B58\u5148\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionSearchLabel: "\u4FDD\u5B58\u5148\u3092\u63A2\u3059",
  optionsNotionSearchHint: "\u3053\u306E\u9023\u643A\u306B\u30A2\u30AF\u30BB\u30B9\u6A29\u3092\u4E0E\u3048\u305F\u30DA\u30FC\u30B8\u3084\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u3092\u691C\u7D22\u3057\u307E\u3059\u3002",
  optionsNotionSearchPlaceholderPage: "\u4F8B: Product Notes",
  optionsNotionSearchPlaceholderDataSource: "\u4F8B: Threads Inbox",
  optionsNotionSearchButton: "\u4FDD\u5B58\u5148\u3092\u691C\u7D22",
  optionsNotionResultsLabel: "\u691C\u7D22\u7D50\u679C",
  optionsNotionResultsHint: "\u7D50\u679C\u3092\u4E00\u3064\u9078\u3073\u3001\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u3068\u3057\u3066\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNotionUseLocationButton: "\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u306B\u3059\u308B",
  optionsNotionSearchLoaded: "Notion \u306E\u4FDD\u5B58\u5148\u3092\u8AAD\u307F\u8FBC\u307F\u307E\u3057\u305F\u3002",
  optionsNotionSearchEmpty: "\u4E00\u81F4\u3059\u308B Notion \u306E\u4FDD\u5B58\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionSearchFailed: "Notion \u306E\u4FDD\u5B58\u5148\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionOAuthRequiresPro: "Notion OAuth \u4FDD\u5B58\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsNotionConnectFirst: "\u5148\u306B Notion \u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNotionTokenHint: "Notion \u306E internal integration token \u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u30FC\u30D7\u30ED\u30D5\u30A1\u30A4\u30EB\u306B\u306E\u307F\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
  optionsNotionParentPageHint: "Notion \u30DA\u30FC\u30B8\u306E URL \u5168\u4F53\u3001\u307E\u305F\u306F\u30DA\u30FC\u30B8 ID \u3060\u3051\u3067\u3082\u8CBC\u308A\u4ED8\u3051\u3089\u308C\u307E\u3059\u3002",
  optionsNotionDataSourceHint: "Notion \u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u306E URL \u5168\u4F53\u307E\u305F\u306F ID \u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002\u53EF\u80FD\u306A\u5834\u5408\u306F\u30BF\u30A4\u30C8\u30EB\u3001\u30BF\u30B0\u3001\u65E5\u4ED8\u306A\u3069\u306E\u30D7\u30ED\u30D1\u30C6\u30A3\u3092\u81EA\u52D5\u3067\u5BFE\u5FDC\u4ED8\u3051\u307E\u3059\u3002",
  optionsNotionDataSourceLocked: "\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u4FDD\u5B58\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsNotionUploadMedia: "\u30E1\u30C7\u30A3\u30A2\u3092 Notion \u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  optionsNotionUploadMediaHint: "\u753B\u50CF\u3068\u52D5\u753B\u3092\u30EA\u30E2\u30FC\u30C8\u30EA\u30F3\u30AF\u306E\u307E\u307E\u306B\u305B\u305A\u3001Notion \u7BA1\u7406\u30D5\u30A1\u30A4\u30EB\u3068\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002\u5931\u6557\u3057\u305F\u5834\u5408\u306F\u30EA\u30F3\u30AF\u4FDD\u5B58\u3078\u30D5\u30A9\u30FC\u30EB\u30D0\u30C3\u30AF\u3057\u307E\u3059\u3002",
  optionsNotionUploadMediaLocked: "Notion \u7BA1\u7406\u30E1\u30C7\u30A3\u30A2\u306E\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsNotionTokenRequired: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F integration token \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsNotionParentPageRequired: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsNotionInvalidPage: "Notion \u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL \u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsNotionDataSourceRequired: "\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsNotionInvalidDataSource: "Notion \u30C7\u30FC\u30BF\u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL \u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsNotionPermissionDenied: "Notion API \u3078\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u304C\u62D2\u5426\u3055\u308C\u305F\u305F\u3081\u3001\u8A2D\u5B9A\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsBasicSection: "\u57FA\u672C\u4FDD\u5B58",
  optionsCompareSection: "Free \u3068 Pro",
  optionsProSection: "Pro \u8A2D\u5B9A",
  optionsProSubtitle: "\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002\u30EB\u30FC\u30EB\u6574\u7406\u3068 AI \u6574\u7406\u306F\u3053\u3053\u306B\u3042\u308A\u307E\u3059\u3002",
  optionsProAiNote: "AI \u306F\u81EA\u52D5\u3067\u306F\u4ED8\u5C5E\u3057\u307E\u305B\u3093\u3002\u81EA\u5206\u306E API \u30AD\u30FC\u3092\u8FFD\u52A0\u3057\u3066\u521D\u3081\u3066\u52D5\u4F5C\u3057\u307E\u3059\u3002",
  compareRowImages: "\u753B\u50CF",
  compareRowReplies: "\u9023\u7D9A\u8FD4\u4FE1",
  compareRowDuplicates: "\u91CD\u8907\u3092\u30B9\u30AD\u30C3\u30D7",
  compareRowFilename: "\u30D5\u30A1\u30A4\u30EB\u540D\u5F62\u5F0F",
  compareRowFolder: "\u4FDD\u5B58\u30D1\u30B9\u898F\u5247",
  compareRowNotionDataSource: "Notion \u30C7\u30FC\u30BF\u30BD\u30FC\u30B9",
  compareRowNotionMediaUpload: "Notion \u30E1\u30C7\u30A3\u30A2\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  optionsProStatusFree: "\u73FE\u5728\u306F Free \u3067\u3059\u3002\u4FDD\u5B58\u306F\u3059\u3067\u306B\u4F7F\u3048\u3001\u30EB\u30FC\u30EB\u3084 AI \u304C\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051 Pro \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsProStatusActive: "Pro \u6709\u52B9\u3002\u4E0B\u306E\u30EB\u30FC\u30EB\u6574\u7406\u3068 AI \u304C\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
  optionsProStatusExpired: "\u3053\u306E Pro \u30AD\u30FC\u306F\u671F\u9650\u5207\u308C\u3067\u3059\u3002Free \u306E\u4FDD\u5B58\u306F\u5F15\u304D\u7D9A\u304D\u4F7F\u3048\u307E\u3059\u3002",
  optionsProStatusInvalid: "\u3053\u306E Pro \u30AD\u30FC\u306F\u7121\u52B9\u3067\u3059\u3002Free \u306E\u4FDD\u5B58\u306F\u5F15\u304D\u7D9A\u304D\u4F7F\u3048\u307E\u3059\u3002",
  optionsProStatusSeatLimit: "\u3053\u306E Pro \u30AD\u30FC\u306F\u3059\u3067\u306B 3 \u53F0\u3067\u6709\u52B9\u3067\u3059\u3002\u5148\u306B\u5225\u306E\u30C7\u30D0\u30A4\u30B9\u3067\u89E3\u9664\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsProStatusNeedsActivation: "Pro \u30AD\u30FC\u306F\u6709\u52B9\u3067\u3059\u304C\u3001\u3053\u306E\u30C7\u30D0\u30A4\u30B9\u306E seat \u306F\u307E\u3060\u6709\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsProStatusOffline: "\u30B5\u30FC\u30D0\u30FC\u3078\u63A5\u7D9A\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u76F4\u8FD1\u306E\u6709\u52B9\u5316\u72B6\u614B\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
  optionsProStatusRevoked: "\u3053\u306E Pro \u30AD\u30FC\u306F\u3082\u3046\u4F7F\u3048\u307E\u305B\u3093\u3002",
  optionsProHolderLabel: "\u4FDD\u6301\u8005",
  optionsProExpiresLabel: "\u6709\u52B9\u671F\u9650",
  optionsProUnlockHint: "\u8CFC\u5165\u30E1\u30FC\u30EB\u306E Pro \u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051\u308B\u3068\u3001\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u6709\u52B9\u5316\u3067\u304D\u307E\u3059\u3002",
  optionsProUnlockPlaceholder: "\u3053\u3053\u306B Pro \u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051",
  optionsProSalesLink: "Pro \u3092\u5165\u624B",
  optionsProActivate: "Pro \u3092\u6709\u52B9\u5316",
  optionsProClear: "\u524A\u9664",
  optionsProActivated: "Pro \u3092\u6709\u52B9\u5316\u3057\u307E\u3057\u305F\u3002",
  optionsProRemoved: "Pro \u30AD\u30FC\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
  optionsProEmptyKey: "\u5148\u306B Pro \u30AD\u30FC\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsProLocalOnly: "Obsidian \u4FDD\u5B58\u306F\u7AEF\u672B\u5185\u306B\u6B8B\u308A\u3001Cloud \u4FDD\u5B58\u3082\u9078\u3093\u3060\u3068\u304D\u3060\u3051\u6295\u7A3F\u304C\u3042\u306A\u305F\u306E scrapbook \u30A2\u30AB\u30A6\u30F3\u30C8\u3078\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002",
  optionsFileRules: "\u30D5\u30A1\u30A4\u30EB\u30EB\u30FC\u30EB",
  optionsFilenamePattern: "\u30D5\u30A1\u30A4\u30EB\u540D\u5F62\u5F0F",
  optionsFilenamePatternLocked: "Free \u306F\u65E2\u5B9A\u306E\u30D5\u30A1\u30A4\u30EB\u540D\u3092\u4F7F\u3044\u307E\u3059\u3002Pro \u3067\u306F\u81EA\u5206\u306E\u5F62\u5F0F\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059\u3002",
  optionsSavePathPattern: "\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u30D1\u30B9",
  optionsSavePathTokens: "\u4F8B: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free \u306F\u63A5\u7D9A\u30D5\u30A9\u30EB\u30C0\u306E\u30EB\u30FC\u30C8\u3078\u4FDD\u5B58\u3057\u307E\u3059\u3002Pro \u3067\u306F\u65E5\u4ED8\u3001\u8457\u8005\u3001\u30C8\u30D4\u30C3\u30AF\u3067\u81EA\u52D5\u7684\u306B\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u5206\u3051\u3067\u304D\u307E\u3059\u3002",
  optionsFilenameTokens: "\u5229\u7528\u53EF\u80FD: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI \u6574\u7406",
  optionsAiSubtitle: "\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u9078\u3076\u3068\u3001\u65E2\u5B9A\u306E Base URL \u3068\u30E2\u30C7\u30EB\u304C\u81EA\u52D5\u5165\u529B\u3055\u308C\u307E\u3059\u3002",
  optionsAiQuickstart: "\u591A\u304F\u306E\u30E6\u30FC\u30B6\u30FC\u306F\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3068 API \u30AD\u30FC\u3060\u3051\u3067\u5341\u5206\u3067\u3059\u3002\u5909\u66F4\u5F8C\u306F\u4E0B\u306E\u300C\u8A2D\u5B9A\u3092\u4FDD\u5B58\u300D\u3092\u62BC\u3057\u3066\u9069\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsAiAdvancedSummary: "\u8A73\u7D30\u8A2D\u5B9A\u3092\u8868\u793A",
  optionsAiEnable: "AI \u6574\u7406\u3092\u6709\u52B9\u5316",
  optionsAiProviderHint: "OpenAI\u3001OpenRouter\u3001DeepSeek\u3001Gemini\u3001Ollama \u306F\u30D7\u30EA\u30BB\u30C3\u30C8\u304B\u3089\u59CB\u3081\u3089\u308C\u307E\u3059\u3002Custom \u306F OpenAI \u4E92\u63DB\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u5411\u3051\u3067\u3059\u3002",
  optionsAiApiKeyHint: "Gemini \u306E\u30AD\u30FC\u306F\u901A\u5E38 AIza \u3067\u59CB\u307E\u308A\u3001OpenAI/OpenRouter/DeepSeek \u306E\u30AD\u30FC\u306F\u901A\u5E38 sk- \u3067\u59CB\u307E\u308A\u307E\u3059\u3002Ollama \u306E\u3088\u3046\u306A\u30ED\u30FC\u30AB\u30EB\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u3067\u306F\u30AD\u30FC\u4E0D\u8981\u306A\u3089\u7A7A\u6B04\u306E\u307E\u307E\u3067\u69CB\u3044\u307E\u305B\u3093\u3002",
  optionsAiApiKeyRequired: "\u9078\u629E\u3057\u305F\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306B\u306F API \u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsAiKeyMismatchGemini: "Gemini \u306B\u306F Google Gemini API \u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002\u73FE\u5728\u306E\u30AD\u30FC\u306F OpenAI \u4E92\u63DB\u30AD\u30FC\u306E\u3088\u3046\u306B\u898B\u3048\u307E\u3059\u3002",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek \u306B\u306F\u5404\u30B5\u30FC\u30D3\u30B9\u306E\u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3001AIza \u3067\u59CB\u307E\u308B Gemini \u30AD\u30FC\u306F\u4F7F\u3048\u307E\u305B\u3093\u3002",
  optionsAiBaseUrlHint: "\u4F8B: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
  optionsAiModel: "\u30E2\u30C7\u30EB\u540D",
  optionsAiModelHint: "\u4F8B: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
  optionsAiPrompt: "\u6574\u7406\u30D7\u30ED\u30F3\u30D7\u30C8",
  optionsAiPromptHint: "\u8981\u7D04\u306E\u9577\u3055\u3001\u30BF\u30B0\u306E\u30B9\u30BF\u30A4\u30EB\u3001\u5FC5\u8981\u306A frontmatter \u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsAiLocked: "AI \u6574\u7406\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsAiInvalidBaseUrl: "AI Base URL \u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsAiPermissionDenied: "\u9078\u629E\u3057\u305F AI \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306E\u6A29\u9650\u304C\u62D2\u5426\u3055\u308C\u305F\u305F\u3081\u3001\u8A2D\u5B9A\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsAiSaved: "AI \u8A2D\u5B9A\u3068\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u6A29\u9650\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  optionsIncludeImages: "\u753B\u50CF\u3068\u52D5\u753B\u30D5\u30A1\u30A4\u30EB\u3082\u4FDD\u5B58",
  optionsSave: "\u8A2D\u5B9A\u3092\u4FDD\u5B58",
  optionsSaved: "\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  optionsPendingSave: "\u5909\u66F4\u304C\u3042\u308A\u307E\u3059\u3002\u9069\u7528\u3059\u308B\u306B\u306F\u4E0B\u306E\u300C\u8A2D\u5B9A\u3092\u4FDD\u5B58\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNoChanges: "\u307E\u3060\u5909\u66F4\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsStep1: "1. Obsidian \u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A",
  optionsStep2: "2. \u307E\u305A\u7121\u6599\u3067\u4FDD\u5B58\u3092\u8A66\u3059",
  optionsStep3: "3. \u30EB\u30FC\u30EB\u3084 AI \u6574\u7406\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3089 Pro \u3092\u6709\u52B9\u5316",
  mdImageLabel: "\u753B\u50CF",
  mdVideoLabel: "\u52D5\u753B",
  mdVideoThumbnailLabel: "\u52D5\u753B\u30B5\u30E0\u30CD\u30A4\u30EB",
  mdVideoOnThreads: "Threads \u3067\u958B\u304F",
  mdSavedVideoFile: "\u4FDD\u5B58\u6E08\u307F\u52D5\u753B\u30D5\u30A1\u30A4\u30EB",
  mdReplySection: "\u8457\u8005\u306E\u9023\u7D9A\u8FD4\u4FE1",
  mdReplyLabel: "\u8FD4\u4FE1",
  mdReplyImageLabel: "\u8FD4\u4FE1\u753B\u50CF",
  mdUploadedMediaSection: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u6E08\u307F\u30E1\u30C7\u30A3\u30A2",
  mdSource: "\u30BD\u30FC\u30B9",
  mdAuthor: "\u8457\u8005",
  mdPublishedAt: "\u6295\u7A3F\u65E5",
  mdExternalLink: "\u5916\u90E8\u30EA\u30F3\u30AF",
  mdWarning: "\u8B66\u544A",
  mdSummary: "AI \u8981\u7D04",
  warnImageAccessFailed: "\u4E00\u90E8\u306E\u753B\u50CF\u307E\u305F\u306F\u52D5\u753B\u3092\u4FDD\u5B58\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001\u5143\u30EA\u30F3\u30AF\u3092\u4FDD\u6301\u3057\u307E\u3057\u305F\u3002",
  warnImageDownloadOff: "\u753B\u50CF\u30FB\u52D5\u753B\u4FDD\u5B58\u304C\u30AA\u30D5\u306E\u305F\u3081\u3001\u5143\u30EA\u30F3\u30AF\u3092\u4FDD\u6301\u3057\u307E\u3057\u305F\u3002",
  warnAiFailed: "AI \u6574\u7406\u306B\u5931\u6557\u3057\u305F\u305F\u3081\u3001\u5143\u306E\u30CE\u30FC\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F: {reason}",
  warnAiPermissionMissing: "AI \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306E\u6A29\u9650\u304C\u306A\u3044\u305F\u3081\u3001\u5143\u306E\u30CE\u30FC\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\u8A2D\u5B9A\u306E AI \u30BB\u30AF\u30B7\u30E7\u30F3\u3092\u4FDD\u5B58\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  warnAiMissingModel: "AI \u30E2\u30C7\u30EB\u540D\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u5143\u306E\u30CE\u30FC\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  warnNotionMediaUploadFailed: "Notion \u3078\u306E\u30E1\u30C7\u30A3\u30A2\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u305F\u305F\u3081\u3001\u30EA\u30E2\u30FC\u30C8\u30EA\u30F3\u30AF\u3067\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  errBrowserUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F Obsidian \u30D5\u30A9\u30EB\u30C0\u3078\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002",
  errFolderNameFailed: "\u4FDD\u5B58\u5148\u30D5\u30A9\u30EB\u30C0\u540D\u3092\u6C7A\u5B9A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  errInvalidPath: "\u7121\u52B9\u306A\u30D5\u30A1\u30A4\u30EB\u30D1\u30B9\u3067\u3059\u3002",
  errNotionTokenMissing: "Notion integration token \u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  errNotionPermissionMissing: "Notion API \u306E\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u5148\u306B\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionUnauthorized: "Notion \u30C8\u30FC\u30AF\u30F3\u304C\u7121\u52B9\u304B\u671F\u9650\u5207\u308C\u3067\u3059\u3002",
  errNotionForbidden: "\u3053\u306E\u9023\u643A\u306F\u9078\u629E\u3057\u305F Notion \u4FDD\u5B58\u5148\u3078\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093\u3002\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u304C\u5171\u6709\u3055\u308C\u3066\u3044\u308B\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionParentNotFound: "\u9078\u629E\u3057\u305F Notion \u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002ID \u3068\u63A5\u7D9A\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionRateLimited: "Notion \u3078\u306E\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u591A\u3059\u304E\u307E\u3059\u3002{seconds} \u79D2\u5F8C\u306B\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionValidation: "Notion \u30EA\u30AF\u30A8\u30B9\u30C8\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  errNotionRequestFailed: "Notion \u3078\u306E\u4FDD\u5B58\u30EA\u30AF\u30A8\u30B9\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
  fallbackNoFolder: "\u63A5\u7D9A\u3055\u308C\u305F\u30D5\u30A9\u30EB\u30C0\u304C\u306A\u3044\u305F\u3081\u3001",
  fallbackPermissionDenied: "\u30D5\u30A9\u30EB\u30C0\u6A29\u9650\u304C\u306A\u3044\u305F\u3081\u3001",
  fallbackDirectFailed: "\u30D5\u30A9\u30EB\u30C0\u3078\u4FDD\u5B58\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001",
  fallbackZipMessage: " \u4EE3\u308F\u308A\u306B\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3057\u305F\u3002",
  errNotPermalink: "\u5148\u306B\u6295\u7A3F\u306E\u500B\u5225\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
  errPostContentNotFound: "\u6295\u7A3F\u5185\u5BB9\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
};
var ptBR = {
  ...en,
  uiLanguageLabel: "Idioma",
  popupTitle: "Salvar post atual",
  popupSave: "Salvar post atual",
  popupSettings: "Configura\xE7\xF5es",
  popupPromoTitle: "\xC1rea reservada",
  popupPromoDescription: "Este espa\xE7o est\xE1 reservado para futuras orienta\xE7\xF5es e recomenda\xE7\xF5es.",
  popupSubtitleDirect: "Salvando diretamente na pasta do Obsidian conectada.",
  popupSubtitleDownload: "Nenhuma pasta conectada. O conte\xFAdo ser\xE1 baixado como arquivo. Conecte uma pasta nas configura\xE7\xF5es.",
  popupSubtitleConnected: "Salvando diretamente na pasta do Obsidian conectada.",
  popupSubtitlePermissionCheck: "A pasta est\xE1 conectada, mas talvez seja necess\xE1rio confirmar a permiss\xE3o novamente.",
  popupSubtitleNoFolder: "Salva diretamente quando h\xE1 uma pasta conectada; caso contr\xE1rio, baixa um arquivo.",
  popupSubtitleUnsupported: "Este navegador s\xF3 oferece suporte a download de arquivos.",
  popupSubtitleNotion: "Salvando no destino do Notion configurado.",
  popupSubtitleNotionSetup: "Para usar o salvamento no Notion, informe primeiro o token e o destino nas configura\xE7\xF5es.",
  popupSubtitleCloud: "Salvando no seu scrapbook em nuvem do Threads Archive. Primeiro fa\xE7a login na web.",
  popupRecentSaves: "Salvos recentes",
  popupClearAll: "Limpar tudo",
  popupEmpty: "Ainda n\xE3o h\xE1 posts salvos.",
  popupResave: "Salvar novamente",
  popupExpand: "Expandir",
  popupCollapse: "Recolher",
  popupDelete: "Excluir",
  popupOpenRemote: "Abrir remoto",
  popupCloudConnect: "Conectar Cloud",
  popupCloudDisconnect: "Desconectar Cloud",
  statusReady: "Pronto para salvar a partir da p\xE1gina permanente do post.",
  statusReadyDirect: "Pronto. Toque para salvar diretamente na pasta do Obsidian.",
  statusReadyDownload: "Pronto. Toque para baixar o arquivo.",
  statusReadyCloud: "Pronto. Toque para salvar no scrapbook em nuvem do Threads Archive.",
  statusUnsupported: "Abra primeiro a p\xE1gina individual do post.",
  statusNoTab: "N\xE3o foi poss\xEDvel encontrar uma aba ativa.",
  statusSaving: "Salvando\u2026",
  statusSavedDirect: "Salvo diretamente na pasta do Obsidian.",
  statusSavedZip: "Salvo. O download come\xE7ou.",
  statusSavedNotion: "Salvo no Notion.",
  statusSavedCloud: "Salvo no scrapbook do Threads Archive.",
  statusDuplicate: "J\xE1 estava salvo, mas foi atualizado com o conte\xFAdo mais recente.",
  statusDuplicateWarning: "J\xE1 estava salvo, atualizado: ",
  statusAlreadySaved: "Este post j\xE1 est\xE1 salvo. Use \u201CSalvar novamente\u201D nos salvos recentes para salvar de novo.",
  statusNotionSetupRequired: "Para usar o salvamento no Notion, informe primeiro o token e o destino nas configura\xE7\xF5es.",
  statusError: "Ocorreu um erro desconhecido.",
  statusResaving: "Preparando seu arquivo\u2026",
  statusResaved: "Download iniciado.",
  statusResavedNotion: "Salvo no Notion como uma nova p\xE1gina.",
  statusResavedCloud: "Salvo novamente no scrapbook do Threads Archive.",
  statusCloudLoginRequired: "Para usar o salvamento em nuvem, fa\xE7a login antes em ss-threads.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "Conecte primeiro a extens\xE3o ao seu scrapbook do Threads Archive.",
  statusCloudSessionExpired: "A conex\xE3o com a nuvem expirou. Reconecte a extens\xE3o.",
  statusCloudOffline: "N\xE3o foi poss\xEDvel verificar a conex\xE3o com a nuvem. Confira a rede.",
  statusCloudConnected: "O Threads Archive Cloud foi conectado.",
  statusCloudDisconnected: "O Threads Archive Cloud foi desconectado.",
  statusCloudLinkStarting: "Conclua a conex\xE3o com o Threads Archive scrapbook no navegador.",
  statusRecentNotFound: "N\xE3o foi poss\xEDvel encontrar o registro do salvamento recente.",
  statusDeletedRecent: "Removido dos salvos recentes.",
  statusClearedRecents: "Todos os salvos recentes foram removidos.",
  statusExtractFailed: "N\xE3o foi poss\xEDvel ler o post.",
  statusTabError: "N\xE3o foi poss\xEDvel ler as informa\xE7\xF5es da aba ativa.",
  statusRedownloadError: "Erro ao baixar novamente.",
  statusRetry: "Tentar novamente",
  statusResaveButton: "Salvar novamente",
  optionsTitle: "Salve posts do Threads no Obsidian, Threads Archive Cloud ou Notion, com organiza\xE7\xE3o autom\xE1tica.",
  optionsTitleObsidianOnly: "Salve posts do Threads no Obsidian ou Threads Archive Cloud, com organiza\xE7\xE3o autom\xE1tica.",
  optionsSubtitle: "Salvar \xE9 gr\xE1tis. Pro s\xF3 quando precisar.",
  optionsSubtitleObsidianOnly: "A interface atual mostra primeiro Obsidian e Cloud save, enquanto o Notion permanece oculto at\xE9 a integra\xE7\xE3o ficar pronta.",
  optionsPlanSpotlightFreeCopy: "O salvamento b\xE1sico j\xE1 est\xE1 pronto para uso.",
  optionsPlanSpotlightActiveTitle: "Pro ativo",
  optionsPlanSpotlightActiveCopy: "Os recursos Pro est\xE3o ativados neste navegador.",
  optionsPlanSpotlightNeedsActivationTitle: "O Pro precisa ser ativado",
  optionsPlanSpotlightNeedsActivationCopy: "A chave \xE9 v\xE1lida, mas este dispositivo ainda n\xE3o tem um seat ativo.",
  optionsAdSlotTitle: "Espa\xE7o reservado para an\xFAncio",
  optionsAdSlotCopy: "Reservado para um banner ou aviso futuro.",
  optionsFolderSection: "Conectar pasta do Obsidian",
  optionsFolderStatus: "Verificando a pasta conectada\u2026",
  optionsFolderLabel: "Pasta atual",
  optionsFolderNotConnected: "N\xE3o conectada",
  optionsFolderConnect: "Conectar pasta",
  optionsFolderDisconnect: "Desconectar",
  optionsFolderUnsupported: "A conex\xE3o com pasta n\xE3o \xE9 compat\xEDvel neste navegador",
  optionsFolderUnsupportedStatus: "Este navegador n\xE3o consegue salvar diretamente em uma pasta. Os arquivos ser\xE3o baixados.",
  optionsFolderNotConnectedStatus: "Nenhuma pasta conectada. Os arquivos ser\xE3o baixados ao salvar.",
  optionsFolderReady: "Pasta conectada. Os arquivos ser\xE3o salvos diretamente.",
  optionsFolderPermissionCheck: "Pasta conectada. A permiss\xE3o pode ser confirmada novamente no pr\xF3ximo salvamento.",
  optionsFolderPermissionLost: "A permiss\xE3o da pasta foi perdida. Reconecte a pasta.",
  optionsFolderChecked: "Conex\xE3o da pasta verificada. O salvamento direto ser\xE1 tentado.",
  optionsFolderCancelled: "Sele\xE7\xE3o de pasta cancelada.",
  optionsFolderError: "Erro ao conectar a pasta.",
  optionsFolderConnectedSuccess: 'A pasta "{folder}" foi conectada.',
  optionsFolderPathLabel: "Local atual de salvamento",
  optionsFolderPathHint: "O navegador n\xE3o pode expor o caminho absoluto do sistema, ent\xE3o este valor permanece relativo \xE0 pasta conectada.",
  optionsFolderPathUnavailable: "Exibido depois que voc\xEA conectar uma pasta",
  optionsSaveTarget: "Destino de salvamento",
  optionsSaveTargetHint: "No PC, escolha Obsidian, Threads Archive Cloud ou Notion como destino padr\xE3o.",
  optionsSaveTargetHintObsidianOnly: "A interface atual mostra primeiro Obsidian e Threads Archive Cloud. O Notion permanece oculto nas configura\xE7\xF5es enquanto a integra\xE7\xE3o est\xE1 sendo preparada.",
  optionsSaveTargetNotionHidden: "Notion (oculto por enquanto)",
  optionsCloudRequiresPro: "O salvamento em nuvem est\xE1 dispon\xEDvel apenas no Pro.",
  optionsCloudSection: "Conex\xE3o com Threads Archive Cloud",
  optionsCloudStatusLabel: "Status da conex\xE3o Cloud",
  optionsCloudStatusUnlinked: "Ainda n\xE3o conectado.",
  optionsCloudStatusLinked: "Conectado como @{handle}.",
  optionsCloudStatusExpired: "A conex\xE3o expirou. Reconecte a extens\xE3o.",
  optionsCloudStatusOffline: "N\xE3o foi poss\xEDvel alcan\xE7ar o servidor, ent\xE3o apenas o \xFAltimo estado conhecido \xE9 mostrado.",
  optionsCloudConnectButton: "Conectar Cloud",
  optionsCloudDisconnectButton: "Desconectar Cloud",
  optionsCloudLinkHint: "O bot\xE3o de conex\xE3o abre o scrapbook no navegador e vincula a conta logada a esta extens\xE3o.",
  optionsNotionSection: "Conex\xE3o com o Notion",
  optionsNotionSubtitle: "O Notion \xE9 conectado via OAuth, ent\xE3o o navegador nunca pede um token interno. Conecte uma vez, escolha um destino padr\xE3o e depois basta salvar.",
  optionsNotionConnectionLabel: "Conex\xE3o",
  optionsNotionDisconnectButton: "Desconectar",
  optionsNotionConnectHint: "Uma aba de aprova\xE7\xE3o do Notion ser\xE1 aberta. Depois da aprova\xE7\xE3o, volte aqui e o estado da conex\xE3o ser\xE1 atualizado automaticamente.",
  optionsNotionConnected: "Um workspace do Notion est\xE1 conectado.",
  optionsNotionDisconnected: "O Notion ainda n\xE3o est\xE1 conectado.",
  optionsNotionConnectStarted: "A aba de conex\xE3o do Notion foi aberta. Volte aqui ap\xF3s a aprova\xE7\xE3o.",
  optionsNotionConnectFailed: "N\xE3o foi poss\xEDvel iniciar o fluxo de conex\xE3o do Notion.",
  optionsNotionDisconnectedSaved: "O workspace do Notion foi desconectado.",
  optionsNotionDisconnectFailed: "N\xE3o foi poss\xEDvel desconectar o Notion.",
  optionsNotionParentType: "Modo de salvamento",
  optionsNotionParentTypeHint: "Escolha se o destino padr\xE3o deve ser uma p\xE1gina ou uma base de dados no workspace conectado.",
  optionsNotionSelectedTarget: "Destino padr\xE3o",
  optionsNotionSelectedTargetHint: "\xC9 para onde o bot\xE3o de salvar enviar\xE1 novas capturas do Threads por padr\xE3o.",
  optionsNotionTargetNotSelected: "Nenhum destino padr\xE3o foi selecionado ainda.",
  optionsNotionTargetRequired: "Escolha primeiro um destino padr\xE3o no Notion.",
  optionsNotionTargetSaved: "O destino padr\xE3o do Notion foi salvo.",
  optionsNotionTargetSaveFailed: "N\xE3o foi poss\xEDvel salvar o destino padr\xE3o do Notion.",
  optionsNotionSearchLabel: "Encontrar um destino",
  optionsNotionSearchHint: "Pesquise p\xE1ginas ou bases de dados \xE0s quais voc\xEA concedeu acesso para esta integra\xE7\xE3o.",
  optionsNotionSearchButton: "Pesquisar destinos",
  optionsNotionResultsLabel: "Resultados",
  optionsNotionResultsHint: "Escolha um resultado e defina-o como destino padr\xE3o.",
  optionsNotionUseLocationButton: "Usar como destino padr\xE3o",
  optionsNotionSearchLoaded: "Destinos do Notion carregados.",
  optionsNotionSearchEmpty: "Nenhum destino correspondente do Notion foi encontrado.",
  optionsNotionSearchFailed: "N\xE3o foi poss\xEDvel carregar os destinos do Notion.",
  optionsNotionOAuthRequiresPro: "O salvamento no Notion via OAuth est\xE1 dispon\xEDvel apenas no Pro.",
  optionsNotionConnectFirst: "Conecte primeiro o Notion.",
  optionsNotionTokenHint: "Cole o token da integra\xE7\xE3o interna do Notion. Ele \xE9 salvo apenas neste perfil do navegador.",
  optionsNotionParentPageHint: "Voc\xEA pode colar a URL completa de uma p\xE1gina do Notion ou apenas o ID da p\xE1gina.",
  optionsNotionDataSourceHint: "Cole a URL completa de uma base de dados do Notion ou apenas o ID. T\xEDtulo, tags, datas e propriedades semelhantes ser\xE3o mapeados automaticamente quando poss\xEDvel.",
  optionsNotionDataSourceLocked: "O salvamento em base de dados est\xE1 dispon\xEDvel apenas no Pro.",
  optionsNotionUploadMedia: "Enviar m\xEDdia para o Notion",
  optionsNotionUploadMediaHint: "Envie imagens e v\xEDdeos como arquivos gerenciados pelo Notion em vez de mant\xEA-los como links remotos. Se o upload falhar, o salvamento volta para links.",
  optionsNotionUploadMediaLocked: "O upload de m\xEDdia gerenciado pelo Notion est\xE1 dispon\xEDvel apenas no Pro.",
  optionsNotionTokenRequired: "Um token de integra\xE7\xE3o do Notion \xE9 necess\xE1rio para usar o salvamento no Notion.",
  optionsNotionParentPageRequired: "Um ID ou URL de p\xE1gina m\xE3e do Notion \xE9 necess\xE1rio para usar o salvamento no Notion.",
  optionsNotionInvalidPage: "O formato do ID ou URL da p\xE1gina m\xE3e do Notion \xE9 inv\xE1lido.",
  optionsNotionDataSourceRequired: "Um ID ou URL da base de dados do Notion \xE9 necess\xE1rio para usar o salvamento em base de dados.",
  optionsNotionInvalidDataSource: "O formato do ID ou URL da base de dados do Notion \xE9 inv\xE1lido.",
  optionsNotionPermissionDenied: "A permiss\xE3o para acessar a API do Notion foi negada, ent\xE3o as configura\xE7\xF5es n\xE3o foram salvas.",
  optionsBasicSection: "Salvamento b\xE1sico",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Configura\xE7\xF5es Pro",
  optionsProSubtitle: "Abra apenas quando precisar. \xC9 aqui que ficam as regras e a organiza\xE7\xE3o por IA.",
  optionsProAiNote: "A IA n\xE3o est\xE1 inclu\xEDda automaticamente. Ela funciona somente depois que voc\xEA adiciona sua pr\xF3pria chave de API.",
  compareRowReplies: "Respostas em sequ\xEAncia",
  compareRowDuplicates: "Pular duplicados",
  compareRowFilename: "Formato do nome do arquivo",
  compareRowFolder: "Regras de caminho de salvamento",
  compareRowNotionDataSource: "Base de dados do Notion",
  compareRowNotionMediaUpload: "Upload de m\xEDdia no Notion",
  optionsProStatusFree: "Voc\xEA est\xE1 no plano Free. O salvamento j\xE1 funciona, e o Pro s\xF3 \xE9 necess\xE1rio quando quiser regras ou IA.",
  optionsProStatusActive: "Pro ativo. A organiza\xE7\xE3o por regras e IA est\xE1 dispon\xEDvel abaixo.",
  optionsProStatusExpired: "Esta chave Pro expirou. O salvamento Free continua funcionando.",
  optionsProStatusInvalid: "Esta chave Pro n\xE3o \xE9 v\xE1lida. O salvamento Free continua funcionando.",
  optionsProStatusSeatLimit: "Esta chave Pro j\xE1 est\xE1 ativa em 3 dispositivos. Libere primeiro um deles em outro dispositivo.",
  optionsProStatusNeedsActivation: "A chave Pro \xE9 v\xE1lida, mas este dispositivo ainda n\xE3o tem um seat ativo.",
  optionsProStatusOffline: "N\xE3o foi poss\xEDvel alcan\xE7ar o servidor, ent\xE3o o estado de ativa\xE7\xE3o mais recente ser\xE1 usado.",
  optionsProStatusRevoked: "Esta chave Pro n\xE3o pode mais ser usada.",
  optionsProHolderLabel: "Titular",
  optionsProExpiresLabel: "Expira em",
  optionsProUnlockHint: "Cole a chave Pro enviada por e-mail para ativar neste navegador.",
  optionsProUnlockPlaceholder: "Cole sua chave Pro aqui",
  optionsProSalesLink: "Obter Pro",
  optionsProActivate: "Ativar Pro",
  optionsProClear: "Remover",
  optionsProActivated: "Pro ativado.",
  optionsProRemoved: "A chave Pro foi removida.",
  optionsProEmptyKey: "Digite primeiro uma chave Pro.",
  optionsProLocalOnly: "Os salvamentos no Obsidian ficam no seu dispositivo, e o Cloud save s\xF3 envia um post para sua conta do scrapbook quando voc\xEA escolhe essa op\xE7\xE3o.",
  optionsFileRules: "Regras de arquivo",
  optionsFilenamePattern: "Formato do nome do arquivo",
  optionsFilenamePatternLocked: "O plano Free usa um nome padr\xE3o. O Pro permite definir seu pr\xF3prio formato.",
  optionsSavePathPattern: "Caminho de subpasta",
  optionsSavePathTokens: "Exemplos: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "O plano Free salva na raiz da pasta conectada. O Pro permite classificar automaticamente em subpastas por data, autor ou t\xF3pico.",
  optionsFilenameTokens: "Dispon\xEDvel: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "Organiza\xE7\xE3o por IA",
  optionsAiSubtitle: "Escolha um provedor e a URL base padr\xE3o e o modelo ser\xE3o preenchidos para voc\xEA.",
  optionsAiQuickstart: "A maioria das pessoas s\xF3 precisa do provedor e da chave de API. Depois de alterar, pressione Salvar configura\xE7\xF5es abaixo para aplicar.",
  optionsAiAdvancedSummary: "Mostrar configura\xE7\xF5es avan\xE7adas",
  optionsAiEnable: "Ativar organiza\xE7\xE3o por IA",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini e Ollama podem come\xE7ar com presets. Custom \xE9 para qualquer endpoint compat\xEDvel com OpenAI.",
  optionsAiApiKeyHint: "As chaves do Gemini geralmente come\xE7am com AIza, enquanto as chaves do OpenAI/OpenRouter/DeepSeek geralmente come\xE7am com sk-. Deixe em branco apenas para endpoints locais como o Ollama quando nenhuma chave for necess\xE1ria.",
  optionsAiApiKeyRequired: "O provedor selecionado exige uma chave de API.",
  optionsAiKeyMismatchGemini: "O Gemini exige uma chave da API do Google Gemini. A chave atual parece ser compat\xEDvel com OpenAI.",
  optionsAiKeyMismatchOpenAi: "Os provedores OpenAI/OpenRouter/DeepSeek exigem a chave do pr\xF3prio servi\xE7o, n\xE3o uma chave Gemini que come\xE7a com AIza.",
  optionsAiModel: "Nome do modelo",
  optionsAiPrompt: "Prompt de organiza\xE7\xE3o",
  optionsAiPromptHint: "Descreva o tamanho do resumo, o estilo das tags e os campos de frontmatter desejados.",
  optionsAiLocked: "A organiza\xE7\xE3o por IA est\xE1 dispon\xEDvel apenas no Pro.",
  optionsAiInvalidBaseUrl: "A URL base da IA \xE9 inv\xE1lida.",
  optionsAiPermissionDenied: "A permiss\xE3o para o endpoint de IA selecionado foi negada, ent\xE3o as configura\xE7\xF5es n\xE3o foram salvas.",
  optionsAiSaved: "Configura\xE7\xF5es da IA e permiss\xE3o do endpoint salvas.",
  optionsIncludeImages: "Salvar imagens e v\xEDdeos",
  optionsSave: "Salvar configura\xE7\xF5es",
  optionsSaved: "Configura\xE7\xF5es salvas.",
  optionsPendingSave: "Alterado. Pressione Salvar configura\xE7\xF5es abaixo para aplicar.",
  optionsNoChanges: "Ainda n\xE3o h\xE1 altera\xE7\xF5es.",
  optionsStep1: "1. Conecte a pasta do Obsidian",
  optionsStep2: "2. Teste o salvamento gratuito primeiro",
  optionsStep3: "3. Ative o Pro quando quiser regras ou organiza\xE7\xE3o por IA",
  mdImageLabel: "Imagem",
  mdVideoLabel: "V\xEDdeo",
  mdVideoThumbnailLabel: "Miniatura do v\xEDdeo",
  mdVideoOnThreads: "Abrir no Threads",
  mdSavedVideoFile: "Arquivo de v\xEDdeo salvo",
  mdReplySection: "Respostas do autor",
  mdReplyLabel: "Resposta",
  mdReplyImageLabel: "Imagem da resposta",
  mdUploadedMediaSection: "M\xEDdia enviada",
  mdSource: "Origem",
  mdAuthor: "Autor",
  mdPublishedAt: "Publicado em",
  mdExternalLink: "Link externo",
  mdWarning: "Aviso",
  mdSummary: "Resumo da IA",
  warnImageAccessFailed: "N\xE3o foi poss\xEDvel salvar algumas imagens ou v\xEDdeos; os links originais foram mantidos.",
  warnImageDownloadOff: "O salvamento de imagem/v\xEDdeo est\xE1 desativado; os links originais foram mantidos.",
  warnAiFailed: "A organiza\xE7\xE3o por IA falhou, ent\xE3o a nota original foi salva: {reason}",
  warnAiPermissionMissing: "A permiss\xE3o para o endpoint de IA est\xE1 ausente, ent\xE3o a nota original foi salva. Salve novamente a se\xE7\xE3o de IA nas configura\xE7\xF5es.",
  warnAiMissingModel: "Nenhum nome de modelo de IA foi configurado, ent\xE3o a nota original foi salva.",
  warnNotionMediaUploadFailed: "O upload de m\xEDdia para o Notion falhou, ent\xE3o os links remotos foram salvos.",
  errBrowserUnsupported: "Este navegador n\xE3o consegue salvar diretamente em uma pasta do Obsidian.",
  errFolderNameFailed: "N\xE3o foi poss\xEDvel determinar um nome de pasta para salvar.",
  errInvalidPath: "Caminho de arquivo inv\xE1lido.",
  errNotionTokenMissing: "Nenhum token de integra\xE7\xE3o do Notion foi configurado.",
  errNotionPermissionMissing: "A permiss\xE3o para a API do Notion est\xE1 ausente. Salve novamente as configura\xE7\xF5es primeiro.",
  errNotionUnauthorized: "O token do Notion \xE9 inv\xE1lido ou expirou.",
  errNotionForbidden: "Esta integra\xE7\xE3o n\xE3o consegue acessar o destino do Notion selecionado. Verifique se a p\xE1gina ou base de dados foi compartilhada com a integra\xE7\xE3o.",
  errNotionParentNotFound: "A p\xE1gina ou base de dados do Notion selecionada n\xE3o foi encontrada. Verifique o ID e a conex\xE3o.",
  errNotionRateLimited: "H\xE1 solicita\xE7\xF5es demais ao Notion. Tente novamente em {seconds} segundos.",
  errNotionValidation: "A solicita\xE7\xE3o ao Notion n\xE3o \xE9 v\xE1lida.",
  errNotionRequestFailed: "A solicita\xE7\xE3o de salvamento no Notion falhou.",
  fallbackNoFolder: "Nenhuma pasta conectada,",
  fallbackPermissionDenied: "sem permiss\xE3o para a pasta,",
  fallbackDirectFailed: "n\xE3o foi poss\xEDvel salvar na pasta,",
  fallbackZipMessage: " ent\xE3o foi baixado como arquivo.",
  errNotPermalink: "Abra primeiro a p\xE1gina individual do post.",
  errPostContentNotFound: "N\xE3o foi poss\xEDvel carregar o conte\xFAdo do post. Verifique se voc\xEA est\xE1 conectado."
};
var es = {
  ...en,
  uiLanguageLabel: "Idioma",
  popupTitle: "Guardar publicaci\xF3n actual",
  popupSave: "Guardar publicaci\xF3n actual",
  popupSettings: "Configuraci\xF3n",
  popupPromoTitle: "\xC1rea reservada",
  popupPromoDescription: "Este espacio queda reservado para futuras gu\xEDas y recomendaciones.",
  popupSubtitleDirect: "Guardando directamente en tu carpeta conectada de Obsidian.",
  popupSubtitleDownload: "No hay carpeta conectada. Se descargar\xE1 como archivo. Conecta una carpeta en la configuraci\xF3n.",
  popupSubtitleConnected: "Guardando directamente en tu carpeta conectada de Obsidian.",
  popupSubtitlePermissionCheck: "La carpeta est\xE1 conectada, pero puede ser necesario volver a confirmar el permiso.",
  popupSubtitleNoFolder: "Guarda directamente cuando hay una carpeta conectada; en caso contrario, descarga un archivo.",
  popupSubtitleUnsupported: "Este navegador solo admite descargas de archivos.",
  popupSubtitleNotion: "Guardando en tu destino de Notion configurado.",
  popupSubtitleNotionSetup: "Para usar el guardado en Notion, primero configura el token y el destino.",
  popupSubtitleCloud: "Guardando en tu scrapbook en la nube de Threads Archive. Primero inicia sesi\xF3n en la web.",
  popupRecentSaves: "Guardados recientes",
  popupClearAll: "Borrar todo",
  popupEmpty: "Todav\xEDa no hay publicaciones guardadas.",
  popupResave: "Guardar de nuevo",
  popupExpand: "Expandir",
  popupCollapse: "Contraer",
  popupDelete: "Eliminar",
  popupOpenRemote: "Abrir remoto",
  popupCloudConnect: "Conectar Cloud",
  popupCloudDisconnect: "Desconectar Cloud",
  statusReady: "Listo para guardar desde la p\xE1gina individual de la publicaci\xF3n.",
  statusReadyDirect: "Listo. Pulsa para guardar directamente en tu carpeta de Obsidian.",
  statusReadyDownload: "Listo. Pulsa para descargar el archivo.",
  statusReadyCloud: "Listo. Pulsa para guardar en tu scrapbook en la nube de Threads Archive.",
  statusUnsupported: "Abre primero la p\xE1gina individual de la publicaci\xF3n.",
  statusNoTab: "No se pudo encontrar una pesta\xF1a activa.",
  statusSaving: "Guardando\u2026",
  statusSavedDirect: "Guardado directamente en tu carpeta de Obsidian.",
  statusSavedZip: "Guardado. La descarga ha comenzado.",
  statusSavedNotion: "Guardado en Notion.",
  statusSavedCloud: "Guardado en Threads Archive scrapbook.",
  statusDuplicate: "Ya estaba guardado, pero se actualiz\xF3 con el contenido m\xE1s reciente.",
  statusDuplicateWarning: "Ya estaba guardado, actualizado: ",
  statusAlreadySaved: "Esta publicaci\xF3n ya est\xE1 guardada. Usa \u201CGuardar de nuevo\u201D en guardados recientes para volver a guardarla.",
  statusNotionSetupRequired: "Para usar el guardado en Notion, primero configura el token y el destino.",
  statusError: "Ocurri\xF3 un error desconocido.",
  statusResaving: "Preparando tu archivo\u2026",
  statusResaved: "La descarga ha comenzado.",
  statusResavedNotion: "Guardado en Notion como una p\xE1gina nueva.",
  statusResavedCloud: "Guardado de nuevo en Threads Archive scrapbook.",
  statusCloudLoginRequired: "Para usar el guardado en la nube, inicia sesi\xF3n primero en ss-threads.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "Conecta primero la extensi\xF3n a tu Threads Archive scrapbook.",
  statusCloudSessionExpired: "La conexi\xF3n en la nube caduc\xF3. Vuelve a conectar la extensi\xF3n.",
  statusCloudOffline: "No se pudo verificar la conexi\xF3n en la nube. Revisa la red.",
  statusCloudConnected: "Threads Archive Cloud qued\xF3 conectado.",
  statusCloudDisconnected: "Threads Archive Cloud se desconect\xF3.",
  statusCloudLinkStarting: "Termina la conexi\xF3n con Threads Archive scrapbook en tu navegador.",
  statusRecentNotFound: "No se pudo encontrar el registro del guardado reciente.",
  statusDeletedRecent: "Eliminado de los guardados recientes.",
  statusClearedRecents: "Se borraron todos los guardados recientes.",
  statusExtractFailed: "No se pudo leer la publicaci\xF3n.",
  statusTabError: "No se pudo leer la informaci\xF3n de la pesta\xF1a activa.",
  statusRedownloadError: "Error durante la nueva descarga.",
  statusRetry: "Reintentar",
  statusResaveButton: "Guardar de nuevo",
  optionsTitle: "Guarda publicaciones de Threads en Obsidian, Threads Archive Cloud o Notion, con organizaci\xF3n autom\xE1tica.",
  optionsTitleObsidianOnly: "Guarda publicaciones de Threads en Obsidian o Threads Archive Cloud, con organizaci\xF3n autom\xE1tica.",
  optionsSubtitle: "Guardar es gratis. Pro solo cuando lo necesites.",
  optionsSubtitleObsidianOnly: "La interfaz actual muestra primero Obsidian y Cloud save, mientras Notion permanece oculto hasta que la integraci\xF3n est\xE9 lista.",
  optionsPlanSpotlightFreeCopy: "El guardado b\xE1sico ya est\xE1 listo para usarse.",
  optionsPlanSpotlightActiveTitle: "Pro activo",
  optionsPlanSpotlightActiveCopy: "Las funciones Pro est\xE1n habilitadas en este navegador.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro necesita activaci\xF3n",
  optionsPlanSpotlightNeedsActivationCopy: "La clave es v\xE1lida, pero este dispositivo a\xFAn no tiene un seat activo.",
  optionsAdSlotTitle: "Espacio reservado para anuncio",
  optionsAdSlotCopy: "Reservado para un futuro banner o aviso.",
  optionsFolderSection: "Conectar carpeta de Obsidian",
  optionsFolderStatus: "Comprobando la carpeta conectada\u2026",
  optionsFolderLabel: "Carpeta actual",
  optionsFolderNotConnected: "No conectada",
  optionsFolderConnect: "Conectar carpeta",
  optionsFolderDisconnect: "Desconectar",
  optionsFolderUnsupported: "La conexi\xF3n con carpetas no es compatible en este navegador",
  optionsFolderUnsupportedStatus: "Este navegador no puede guardar directamente en una carpeta. Los archivos se descargar\xE1n.",
  optionsFolderNotConnectedStatus: "No hay carpeta conectada. Los archivos se descargar\xE1n al guardar.",
  optionsFolderReady: "Carpeta conectada. Los archivos se guardar\xE1n directamente.",
  optionsFolderPermissionCheck: "Carpeta conectada. El permiso puede volver a confirmarse en el pr\xF3ximo guardado.",
  optionsFolderPermissionLost: "Se perdi\xF3 el permiso de la carpeta. Vuelve a conectar la carpeta.",
  optionsFolderChecked: "Se verific\xF3 la conexi\xF3n de la carpeta. Se intentar\xE1 el guardado directo.",
  optionsFolderCancelled: "Se cancel\xF3 la selecci\xF3n de carpeta.",
  optionsFolderError: "Error al conectar la carpeta.",
  optionsFolderConnectedSuccess: 'Se conect\xF3 la carpeta "{folder}".',
  optionsFolderPathLabel: "Ubicaci\xF3n actual de guardado",
  optionsFolderPathHint: "El navegador no puede exponer la ruta absoluta del sistema, por lo que este valor se mantiene relativo a la carpeta conectada.",
  optionsFolderPathUnavailable: "Se mostrar\xE1 despu\xE9s de conectar una carpeta",
  optionsSaveTarget: "Destino de guardado",
  optionsSaveTargetHint: "En PC puedes elegir Obsidian, Threads Archive Cloud o Notion como destino predeterminado.",
  optionsSaveTargetHintObsidianOnly: "La interfaz actual muestra primero Obsidian y Threads Archive Cloud. Notion permanece oculto en la configuraci\xF3n mientras se prepara internamente la integraci\xF3n.",
  optionsSaveTargetNotionHidden: "Notion (oculto por ahora)",
  optionsCloudRequiresPro: "El guardado en la nube est\xE1 disponible solo en Pro.",
  optionsCloudSection: "Conexi\xF3n con Threads Archive Cloud",
  optionsCloudStatusLabel: "Estado de la conexi\xF3n Cloud",
  optionsCloudStatusUnlinked: "Todav\xEDa no est\xE1 conectada.",
  optionsCloudStatusLinked: "Conectado como @{handle}.",
  optionsCloudStatusExpired: "La conexi\xF3n caduc\xF3. Vuelve a conectar la extensi\xF3n.",
  optionsCloudStatusOffline: "No se pudo alcanzar el servidor, as\xED que solo se muestra el \xFAltimo estado conocido.",
  optionsCloudConnectButton: "Conectar Cloud",
  optionsCloudDisconnectButton: "Desconectar Cloud",
  optionsCloudLinkHint: "El bot\xF3n de conexi\xF3n abre scrapbook en el navegador y vincula la cuenta iniciada con esta extensi\xF3n.",
  optionsNotionSection: "Conexi\xF3n con Notion",
  optionsNotionSubtitle: "Notion se conecta mediante OAuth, por lo que el navegador nunca pide un token interno. Con\xE9ctalo una vez, elige un destino predeterminado y despu\xE9s solo tendr\xE1s que guardar.",
  optionsNotionConnectionLabel: "Conexi\xF3n",
  optionsNotionDisconnectButton: "Desconectar",
  optionsNotionConnectHint: "Se abrir\xE1 una pesta\xF1a de aprobaci\xF3n de Notion. Despu\xE9s de aprobar, vuelve aqu\xED y el estado de conexi\xF3n se actualizar\xE1 autom\xE1ticamente.",
  optionsNotionConnected: "Hay un workspace de Notion conectado.",
  optionsNotionDisconnected: "Notion a\xFAn no est\xE1 conectado.",
  optionsNotionConnectStarted: "Se abri\xF3 la pesta\xF1a de conexi\xF3n de Notion. Vuelve aqu\xED despu\xE9s de aprobar.",
  optionsNotionConnectFailed: "No se pudo iniciar el flujo de conexi\xF3n de Notion.",
  optionsNotionDisconnectedSaved: "Se desconect\xF3 el workspace de Notion.",
  optionsNotionDisconnectFailed: "No se pudo desconectar Notion.",
  optionsNotionParentType: "Modo de guardado",
  optionsNotionParentTypeHint: "Elige si el destino predeterminado debe ser una p\xE1gina o una base de datos dentro del workspace conectado.",
  optionsNotionSelectedTarget: "Destino predeterminado",
  optionsNotionSelectedTargetHint: "Aqu\xED es donde el bot\xF3n Guardar enviar\xE1 por defecto las nuevas capturas de Threads.",
  optionsNotionTargetNotSelected: "Todav\xEDa no se ha seleccionado un destino predeterminado.",
  optionsNotionTargetRequired: "Primero elige un destino predeterminado de Notion.",
  optionsNotionTargetSaved: "Se guard\xF3 el destino predeterminado de Notion.",
  optionsNotionTargetSaveFailed: "No se pudo guardar el destino predeterminado de Notion.",
  optionsNotionSearchLabel: "Buscar un destino",
  optionsNotionSearchHint: "Busca p\xE1ginas o bases de datos a las que hayas dado acceso a esta integraci\xF3n.",
  optionsNotionSearchButton: "Buscar destinos",
  optionsNotionResultsLabel: "Resultados",
  optionsNotionResultsHint: "Elige un resultado y establ\xE9celo como destino predeterminado.",
  optionsNotionUseLocationButton: "Usar como destino predeterminado",
  optionsNotionSearchLoaded: "Se cargaron los destinos de Notion.",
  optionsNotionSearchEmpty: "No se encontraron destinos coincidentes de Notion.",
  optionsNotionSearchFailed: "No se pudieron cargar los destinos de Notion.",
  optionsNotionOAuthRequiresPro: "El guardado con OAuth de Notion est\xE1 disponible solo en Pro.",
  optionsNotionConnectFirst: "Conecta Notion primero.",
  optionsNotionTokenHint: "Pega tu token de integraci\xF3n interna de Notion. Solo se guarda en este perfil del navegador.",
  optionsNotionParentPageHint: "Puedes pegar una URL completa de p\xE1gina de Notion o solo el ID de la p\xE1gina.",
  optionsNotionDataSourceHint: "Pega una URL completa de una base de datos de Notion o solo su ID. El t\xEDtulo, las etiquetas, las fechas y propiedades similares se asignar\xE1n autom\xE1ticamente cuando sea posible.",
  optionsNotionDataSourceLocked: "El guardado en bases de datos est\xE1 disponible solo en Pro.",
  optionsNotionUploadMedia: "Subir archivos multimedia a Notion",
  optionsNotionUploadMediaHint: "Sube im\xE1genes y v\xEDdeos como archivos administrados por Notion en lugar de dejarlos como enlaces remotos. Si la subida falla, el guardado vuelve a enlaces.",
  optionsNotionUploadMediaLocked: "La subida de medios administrados por Notion est\xE1 disponible solo en Pro.",
  optionsNotionTokenRequired: "Se necesita un token de integraci\xF3n de Notion para usar el guardado en Notion.",
  optionsNotionParentPageRequired: "Se necesita un ID o URL de p\xE1gina principal de Notion para usar el guardado en Notion.",
  optionsNotionInvalidPage: "El formato del ID o URL de la p\xE1gina principal de Notion no es v\xE1lido.",
  optionsNotionDataSourceRequired: "Se necesita un ID o URL de base de datos de Notion para usar el guardado en base de datos.",
  optionsNotionInvalidDataSource: "El formato del ID o URL de la base de datos de Notion no es v\xE1lido.",
  optionsNotionPermissionDenied: "Se neg\xF3 el permiso para acceder a la API de Notion, por lo que la configuraci\xF3n no se guard\xF3.",
  optionsBasicSection: "Guardado b\xE1sico",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Configuraci\xF3n Pro",
  optionsProSubtitle: "\xC1brelo solo cuando lo necesites. Aqu\xED viven las reglas y la organizaci\xF3n por IA.",
  optionsProAiNote: "La IA no est\xE1 incluida autom\xE1ticamente. Solo funciona despu\xE9s de agregar tu propia clave de API.",
  compareRowReplies: "Respuestas encadenadas",
  compareRowDuplicates: "Omitir duplicados",
  compareRowFilename: "Formato del nombre del archivo",
  compareRowFolder: "Reglas de ruta de guardado",
  compareRowNotionDataSource: "Base de datos de Notion",
  compareRowNotionMediaUpload: "Subida de medios a Notion",
  optionsProStatusFree: "Est\xE1s en Free. El guardado ya funciona y Pro solo hace falta cuando quieres reglas o IA.",
  optionsProStatusActive: "Pro activo. La organizaci\xF3n por reglas e IA est\xE1 disponible a continuaci\xF3n.",
  optionsProStatusExpired: "Esta clave Pro ha caducado. El guardado Free sigue funcionando.",
  optionsProStatusInvalid: "Esta clave Pro no es v\xE1lida. El guardado Free sigue funcionando.",
  optionsProStatusSeatLimit: "Esta clave Pro ya est\xE1 activa en 3 dispositivos. Libera primero uno en otro dispositivo.",
  optionsProStatusNeedsActivation: "La clave Pro es v\xE1lida, pero este dispositivo a\xFAn no tiene un seat activo.",
  optionsProStatusOffline: "No se pudo llegar al servidor, as\xED que se usar\xE1 el estado de activaci\xF3n m\xE1s reciente.",
  optionsProStatusRevoked: "Esta clave Pro ya no se puede usar.",
  optionsProHolderLabel: "Titular",
  optionsProExpiresLabel: "Caduca",
  optionsProUnlockHint: "Pega la clave Pro recibida por correo para activarla en este navegador.",
  optionsProUnlockPlaceholder: "Pega aqu\xED tu clave Pro",
  optionsProSalesLink: "Obtener Pro",
  optionsProActivate: "Activar Pro",
  optionsProClear: "Quitar",
  optionsProActivated: "Pro activado.",
  optionsProRemoved: "La clave Pro se elimin\xF3.",
  optionsProEmptyKey: "Introduce primero una clave Pro.",
  optionsProLocalOnly: "Los guardados de Obsidian permanecen en tu dispositivo, y Cloud save solo env\xEDa una publicaci\xF3n a tu cuenta de scrapbook cuando t\xFA lo eliges.",
  optionsFileRules: "Reglas de archivo",
  optionsFilenamePattern: "Formato del nombre del archivo",
  optionsFilenamePatternLocked: "Free usa un nombre de archivo predeterminado. Pro te permite definir tu propio formato.",
  optionsSavePathPattern: "Ruta de subcarpeta",
  optionsSavePathTokens: "Ejemplos: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free guarda en la ra\xEDz de tu carpeta conectada. Pro te permite ordenar autom\xE1ticamente en subcarpetas por fecha, autor o tema.",
  optionsFilenameTokens: "Disponible: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "Organizaci\xF3n con IA",
  optionsAiSubtitle: "Elige un proveedor y se rellenar\xE1n por ti la URL base y el modelo predeterminados.",
  optionsAiQuickstart: "La mayor\xEDa de la gente solo necesita un proveedor y una clave de API. Despu\xE9s de cambiarlo, pulsa Guardar configuraci\xF3n abajo para aplicarlo.",
  optionsAiAdvancedSummary: "Mostrar configuraci\xF3n avanzada",
  optionsAiEnable: "Activar organizaci\xF3n con IA",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini y Ollama pueden empezar con presets. Custom es para cualquier endpoint compatible con OpenAI.",
  optionsAiApiKeyHint: "Las claves de Gemini suelen empezar por AIza, mientras que las claves de OpenAI/OpenRouter/DeepSeek suelen empezar por sk-. D\xE9jalo en blanco solo para endpoints locales como Ollama cuando no se requiera clave.",
  optionsAiApiKeyRequired: "El proveedor seleccionado requiere una clave de API.",
  optionsAiKeyMismatchGemini: "Gemini necesita una clave de la API de Google Gemini. La clave actual parece una clave compatible con OpenAI.",
  optionsAiKeyMismatchOpenAi: "Los proveedores OpenAI/OpenRouter/DeepSeek requieren su propia clave, no una clave de Gemini que empiece por AIza.",
  optionsAiModel: "Nombre del modelo",
  optionsAiPrompt: "Prompt de organizaci\xF3n",
  optionsAiPromptHint: "Describe la longitud del resumen, el estilo de las etiquetas y los campos de frontmatter que deseas.",
  optionsAiLocked: "La organizaci\xF3n con IA est\xE1 disponible solo en Pro.",
  optionsAiInvalidBaseUrl: "La URL base de IA no es v\xE1lida.",
  optionsAiPermissionDenied: "Se neg\xF3 el permiso para el endpoint de IA seleccionado, as\xED que la configuraci\xF3n no se guard\xF3.",
  optionsAiSaved: "Se guardaron la configuraci\xF3n de IA y el permiso del endpoint.",
  optionsIncludeImages: "Guardar im\xE1genes y archivos de v\xEDdeo",
  optionsSave: "Guardar configuraci\xF3n",
  optionsSaved: "Configuraci\xF3n guardada.",
  optionsPendingSave: "Hay cambios. Pulsa Guardar configuraci\xF3n abajo para aplicarlos.",
  optionsNoChanges: "Todav\xEDa no hay cambios.",
  optionsStep1: "1. Conecta la carpeta de Obsidian",
  optionsStep2: "2. Prueba primero el guardado gratuito",
  optionsStep3: "3. Activa Pro cuando quieras reglas u organizaci\xF3n con IA",
  mdImageLabel: "Imagen",
  mdVideoLabel: "V\xEDdeo",
  mdVideoThumbnailLabel: "Miniatura del v\xEDdeo",
  mdVideoOnThreads: "Abrir en Threads",
  mdSavedVideoFile: "Archivo de v\xEDdeo guardado",
  mdReplySection: "Respuestas del autor",
  mdReplyLabel: "Respuesta",
  mdReplyImageLabel: "Imagen de la respuesta",
  mdUploadedMediaSection: "Medios subidos",
  mdSource: "Fuente",
  mdAuthor: "Autor",
  mdPublishedAt: "Publicado el",
  mdExternalLink: "Enlace externo",
  mdWarning: "Advertencia",
  mdSummary: "Resumen de IA",
  warnImageAccessFailed: "No se pudieron guardar algunas im\xE1genes o v\xEDdeos; se conservaron los enlaces originales.",
  warnImageDownloadOff: "El guardado de im\xE1genes/v\xEDdeos est\xE1 desactivado; se conservaron los enlaces originales.",
  warnAiFailed: "La organizaci\xF3n con IA fall\xF3, as\xED que se guard\xF3 la nota original: {reason}",
  warnAiPermissionMissing: "Falta el permiso del endpoint de IA, as\xED que se guard\xF3 la nota original. Vuelve a guardar la secci\xF3n de IA en la configuraci\xF3n.",
  warnAiMissingModel: "No hay un nombre de modelo de IA configurado, as\xED que se guard\xF3 la nota original.",
  warnNotionMediaUploadFailed: "La subida de medios a Notion fall\xF3, as\xED que se guardaron los enlaces remotos.",
  errBrowserUnsupported: "Este navegador no puede guardar directamente en una carpeta de Obsidian.",
  errFolderNameFailed: "No se pudo determinar un nombre de carpeta para guardar.",
  errInvalidPath: "Ruta de archivo no v\xE1lida.",
  errNotionTokenMissing: "No hay configurado un token de integraci\xF3n de Notion.",
  errNotionPermissionMissing: "Falta el permiso para la API de Notion. Vuelve a guardar la configuraci\xF3n primero.",
  errNotionUnauthorized: "El token de Notion no es v\xE1lido o ha caducado.",
  errNotionForbidden: "Esta integraci\xF3n no puede acceder al destino de Notion seleccionado. Aseg\xFArate de que la p\xE1gina o la base de datos est\xE9 compartida con la integraci\xF3n.",
  errNotionParentNotFound: "No se encontr\xF3 la p\xE1gina o base de datos de Notion seleccionada. Comprueba el ID y la conexi\xF3n.",
  errNotionRateLimited: "Hay demasiadas solicitudes a Notion. Vuelve a intentarlo en {seconds} segundos.",
  errNotionValidation: "La solicitud a Notion no es v\xE1lida.",
  errNotionRequestFailed: "La solicitud de guardado en Notion fall\xF3.",
  fallbackNoFolder: "No hay carpeta conectada,",
  fallbackPermissionDenied: "no hay permiso para la carpeta,",
  fallbackDirectFailed: "no se pudo guardar en la carpeta,",
  fallbackZipMessage: " as\xED que se descarg\xF3 como archivo.",
  errNotPermalink: "Abre primero la p\xE1gina individual de la publicaci\xF3n.",
  errPostContentNotFound: "No se pudo cargar el contenido de la publicaci\xF3n. Aseg\xFArate de haber iniciado sesi\xF3n."
};
var zhTW = {
  ...en,
  uiLanguageLabel: "\u8A9E\u8A00",
  popupTitle: "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
  popupSave: "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
  popupSettings: "\u8A2D\u5B9A",
  popupPromoTitle: "\u4FDD\u7559\u5340\u57DF",
  popupPromoDescription: "\u9019\u500B\u5340\u57DF\u4FDD\u7559\u7D66\u4E4B\u5F8C\u7684\u8AAA\u660E\u8207\u63A8\u85A6\u5167\u5BB9\u3002",
  popupSubtitleDirect: "\u6B63\u5728\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u5DF2\u9023\u63A5\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  popupSubtitleDownload: "\u5C1A\u672A\u9023\u63A5\u8CC7\u6599\u593E\u3002\u5C07\u4EE5\u6A94\u6848\u5F62\u5F0F\u4E0B\u8F09\u3002\u8ACB\u5728\u8A2D\u5B9A\u4E2D\u9023\u63A5\u8CC7\u6599\u593E\u3002",
  popupSubtitleConnected: "\u6B63\u5728\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u5DF2\u9023\u63A5\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  popupSubtitlePermissionCheck: "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\uFF0C\u4F46\u53EF\u80FD\u9700\u8981\u91CD\u65B0\u78BA\u8A8D\u6B0A\u9650\u3002",
  popupSubtitleNoFolder: "\u82E5\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u5C31\u6703\u76F4\u63A5\u5132\u5B58\uFF0C\u5426\u5247\u6703\u4E0B\u8F09\u6A94\u6848\u3002",
  popupSubtitleUnsupported: "\u6B64\u700F\u89BD\u5668\u50C5\u652F\u63F4\u6A94\u6848\u4E0B\u8F09\u3002",
  popupSubtitleNotion: "\u6B63\u5728\u5132\u5B58\u5230\u4F60\u8A2D\u5B9A\u7684 Notion \u76EE\u7684\u5730\u3002",
  popupSubtitleNotionSetup: "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u8ACB\u5148\u5728\u8A2D\u5B9A\u4E2D\u586B\u5165 token \u8207\u76EE\u7684\u5730\u3002",
  popupSubtitleCloud: "\u6B63\u5728\u5132\u5B58\u5230\u4F60\u7684 Threads Archive \u96F2\u7AEF scrapbook\u3002\u8ACB\u5148\u5728\u7DB2\u9801\u4E0A\u767B\u5165\u3002",
  popupRecentSaves: "\u6700\u8FD1\u5132\u5B58",
  popupClearAll: "\u5168\u90E8\u6E05\u9664",
  popupEmpty: "\u76EE\u524D\u9084\u6C92\u6709\u5132\u5B58\u7684\u8CBC\u6587\u3002",
  popupResave: "\u91CD\u65B0\u5132\u5B58",
  popupExpand: "\u5C55\u958B",
  popupCollapse: "\u6536\u5408",
  popupDelete: "\u522A\u9664",
  popupOpenRemote: "\u958B\u555F\u9060\u7AEF\u9801\u9762",
  popupCloudConnect: "\u9023\u63A5 Cloud",
  popupCloudDisconnect: "\u4E2D\u65B7 Cloud \u9023\u63A5",
  statusReady: "\u5DF2\u53EF\u5F9E\u55AE\u7BC7\u8CBC\u6587\u9801\u9762\u9032\u884C\u5132\u5B58\u3002",
  statusReadyDirect: "\u5DF2\u6E96\u5099\u5B8C\u6210\u3002\u6309\u4E0B\u5373\u53EF\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  statusReadyDownload: "\u5DF2\u6E96\u5099\u5B8C\u6210\u3002\u6309\u4E0B\u5373\u53EF\u4E0B\u8F09\u6A94\u6848\u3002",
  statusReadyCloud: "\u5DF2\u6E96\u5099\u5B8C\u6210\u3002\u6309\u4E0B\u5373\u53EF\u5132\u5B58\u5230 Threads Archive \u96F2\u7AEF scrapbook\u3002",
  statusUnsupported: "\u8ACB\u5148\u6253\u958B\u55AE\u7BC7\u8CBC\u6587\u9801\u9762\u3002",
  statusNoTab: "\u627E\u4E0D\u5230\u4F5C\u7528\u4E2D\u7684\u5206\u9801\u3002",
  statusSaving: "\u5132\u5B58\u4E2D\u2026",
  statusSavedDirect: "\u5DF2\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  statusSavedZip: "\u5DF2\u5132\u5B58\uFF0C\u4E0B\u8F09\u5DF2\u958B\u59CB\u3002",
  statusSavedNotion: "\u5DF2\u5132\u5B58\u5230 Notion\u3002",
  statusSavedCloud: "\u5DF2\u5132\u5B58\u5230 Threads Archive scrapbook\u3002",
  statusDuplicate: "\u9019\u7BC7\u5167\u5BB9\u5DF2\u5132\u5B58\u904E\uFF0C\u4F46\u5DF2\u7528\u6700\u65B0\u5167\u5BB9\u66F4\u65B0\u3002",
  statusDuplicateWarning: "\u5DF2\u5132\u5B58\u904E\uFF0C\u5DF2\u66F4\u65B0\uFF1A",
  statusAlreadySaved: "\u9019\u7BC7\u8CBC\u6587\u5DF2\u7D93\u5132\u5B58\u904E\u3002\u82E5\u8981\u518D\u6B21\u5132\u5B58\uFF0C\u8ACB\u5F9E\u6700\u8FD1\u5132\u5B58\u4E2D\u4F7F\u7528\u300C\u91CD\u65B0\u5132\u5B58\u300D\u3002",
  statusNotionSetupRequired: "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u8ACB\u5148\u5728\u8A2D\u5B9A\u4E2D\u586B\u5165 token \u8207\u76EE\u7684\u5730\u3002",
  statusError: "\u767C\u751F\u672A\u77E5\u932F\u8AA4\u3002",
  statusResaving: "\u6B63\u5728\u6E96\u5099\u4F60\u7684\u6A94\u6848\u2026",
  statusResaved: "\u4E0B\u8F09\u5DF2\u958B\u59CB\u3002",
  statusResavedNotion: "\u5DF2\u4F5C\u70BA\u65B0\u9801\u9762\u91CD\u65B0\u5132\u5B58\u5230 Notion\u3002",
  statusResavedCloud: "\u5DF2\u518D\u6B21\u5132\u5B58\u5230 Threads Archive scrapbook\u3002",
  statusCloudLoginRequired: "\u82E5\u8981\u4F7F\u7528\u96F2\u7AEF\u5132\u5B58\uFF0C\u8ACB\u5148\u767B\u5165 ss-threads.dahanda.dev/scrapbook\u3002",
  statusCloudConnectRequired: "\u82E5\u8981\u4F7F\u7528\u96F2\u7AEF\u5132\u5B58\uFF0C\u8ACB\u5148\u5C07 extension \u9023\u63A5\u5230 Threads Archive scrapbook\u3002",
  statusCloudSessionExpired: "Cloud \u9023\u63A5\u5DF2\u904E\u671F\u3002\u8ACB\u91CD\u65B0\u9023\u63A5 extension\u3002",
  statusCloudOffline: "\u7121\u6CD5\u9A57\u8B49 Cloud \u9023\u63A5\u72C0\u614B\u3002\u8ACB\u6AA2\u67E5\u7DB2\u8DEF\u3002",
  statusCloudConnected: "\u5DF2\u5B8C\u6210 Threads Archive Cloud \u9023\u63A5\u3002",
  statusCloudDisconnected: "\u5DF2\u4E2D\u65B7 Threads Archive Cloud \u9023\u63A5\u3002",
  statusCloudLinkStarting: "\u8ACB\u5728\u700F\u89BD\u5668\u4E2D\u5B8C\u6210 Threads Archive scrapbook \u9023\u63A5\u3002",
  statusRecentNotFound: "\u627E\u4E0D\u5230\u6700\u8FD1\u5132\u5B58\u7684\u7D00\u9304\u3002",
  statusDeletedRecent: "\u5DF2\u5F9E\u6700\u8FD1\u5132\u5B58\u4E2D\u522A\u9664\u3002",
  statusClearedRecents: "\u6240\u6709\u6700\u8FD1\u5132\u5B58\u90FD\u5DF2\u6E05\u9664\u3002",
  statusExtractFailed: "\u7121\u6CD5\u8B80\u53D6\u8CBC\u6587\u5167\u5BB9\u3002",
  statusTabError: "\u7121\u6CD5\u8B80\u53D6\u76EE\u524D\u5206\u9801\u8CC7\u8A0A\u3002",
  statusRedownloadError: "\u91CD\u65B0\u4E0B\u8F09\u6642\u767C\u751F\u932F\u8AA4\u3002",
  statusRetry: "\u91CD\u8A66",
  statusResaveButton: "\u91CD\u65B0\u5132\u5B58",
  optionsTitle: "\u5C07 Threads \u8CBC\u6587\u5132\u5B58\u5230 Obsidian\u3001Threads Archive Cloud \u6216 Notion\uFF0C\u4E26\u81EA\u52D5\u6574\u7406\u3002",
  optionsTitleObsidianOnly: "\u5C07 Threads \u8CBC\u6587\u5132\u5B58\u5230 Obsidian \u6216 Threads Archive Cloud\uFF0C\u4E26\u81EA\u52D5\u6574\u7406\u3002",
  optionsSubtitle: "\u5132\u5B58\u514D\u8CBB\uFF0C\u9700\u8981\u6642\u518D\u5347\u7D1A Pro\u3002",
  optionsSubtitleObsidianOnly: "\u76EE\u524D\u4ECB\u9762\u6703\u5148\u63D0\u4F9B Obsidian \u8207 Cloud \u5132\u5B58\uFF0C\u800C Notion \u6703\u5728\u6574\u5408\u5B8C\u6210\u524D\u66AB\u6642\u96B1\u85CF\u3002",
  optionsPlanSpotlightFreeCopy: "\u57FA\u672C\u5132\u5B58\u529F\u80FD\u5DF2\u53EF\u7ACB\u5373\u4F7F\u7528\u3002",
  optionsPlanSpotlightActiveTitle: "Pro \u5DF2\u555F\u7528",
  optionsPlanSpotlightActiveCopy: "\u6B64\u700F\u89BD\u5668\u5DF2\u555F\u7528 Pro \u529F\u80FD\u3002",
  optionsPlanSpotlightNeedsActivationTitle: "Pro \u9700\u8981\u555F\u7528",
  optionsPlanSpotlightNeedsActivationCopy: "\u9019\u7D44\u91D1\u9470\u6709\u6548\uFF0C\u4F46\u6B64\u88DD\u7F6E\u5C1A\u672A\u555F\u7528 seat\u3002",
  optionsAdSlotTitle: "\u5EE3\u544A\u9810\u7559\u5340",
  optionsAdSlotCopy: "\u4FDD\u7559\u7D66\u672A\u4F86\u7684\u6A6B\u5E45\u6216\u516C\u544A\u3002",
  optionsFolderSection: "\u9023\u63A5 Obsidian \u8CC7\u6599\u593E",
  optionsFolderStatus: "\u6B63\u5728\u6AA2\u67E5\u5DF2\u9023\u63A5\u7684\u8CC7\u6599\u593E\u2026",
  optionsFolderLabel: "\u76EE\u524D\u8CC7\u6599\u593E",
  optionsFolderNotConnected: "\u5C1A\u672A\u9023\u63A5",
  optionsFolderConnect: "\u9023\u63A5\u8CC7\u6599\u593E",
  optionsFolderDisconnect: "\u4E2D\u65B7\u9023\u63A5",
  optionsFolderUnsupported: "\u6B64\u700F\u89BD\u5668\u4E0D\u652F\u63F4\u8CC7\u6599\u593E\u9023\u63A5",
  optionsFolderUnsupportedStatus: "\u6B64\u700F\u89BD\u5668\u7121\u6CD5\u76F4\u63A5\u5132\u5B58\u5230\u8CC7\u6599\u593E\uFF0C\u56E0\u6B64\u5C07\u6539\u70BA\u4E0B\u8F09\u6A94\u6848\u3002",
  optionsFolderNotConnectedStatus: "\u5C1A\u672A\u9023\u63A5\u8CC7\u6599\u593E\u3002\u5132\u5B58\u6642\u6703\u4E0B\u8F09\u6A94\u6848\u3002",
  optionsFolderReady: "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\u3002\u6A94\u6848\u5C07\u76F4\u63A5\u5132\u5B58\u3002",
  optionsFolderPermissionCheck: "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\u3002\u4E0B\u6B21\u5132\u5B58\u6642\u53EF\u80FD\u6703\u518D\u6B21\u78BA\u8A8D\u6B0A\u9650\u3002",
  optionsFolderPermissionLost: "\u8CC7\u6599\u593E\u6B0A\u9650\u5DF2\u907A\u5931\u3002\u8ACB\u91CD\u65B0\u9023\u63A5\u8CC7\u6599\u593E\u3002",
  optionsFolderChecked: "\u5DF2\u78BA\u8A8D\u8CC7\u6599\u593E\u9023\u63A5\u3002\u5C07\u5617\u8A66\u76F4\u63A5\u5132\u5B58\u3002",
  optionsFolderCancelled: "\u5DF2\u53D6\u6D88\u9078\u64C7\u8CC7\u6599\u593E\u3002",
  optionsFolderError: "\u9023\u63A5\u8CC7\u6599\u593E\u6642\u767C\u751F\u932F\u8AA4\u3002",
  optionsFolderConnectedSuccess: "\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u300C{folder}\u300D\u3002",
  optionsFolderPathLabel: "\u76EE\u524D\u5132\u5B58\u4F4D\u7F6E",
  optionsFolderPathHint: "\u700F\u89BD\u5668\u7121\u6CD5\u986F\u793A\u4F5C\u696D\u7CFB\u7D71\u7684\u7D55\u5C0D\u8DEF\u5F91\uFF0C\u56E0\u6B64\u9019\u88E1\u53EA\u6703\u986F\u793A\u76F8\u5C0D\u65BC\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u7684\u4F4D\u7F6E\u3002",
  optionsFolderPathUnavailable: "\u9023\u63A5\u8CC7\u6599\u593E\u5F8C\u986F\u793A",
  optionsSaveTarget: "\u5132\u5B58\u76EE\u6A19",
  optionsSaveTargetHint: "\u5728\u96FB\u8166\u4E0A\uFF0C\u4F60\u53EF\u4EE5\u5C07 Obsidian\u3001Threads Archive Cloud \u6216 Notion \u8A2D\u70BA\u9810\u8A2D\u5132\u5B58\u76EE\u6A19\u3002",
  optionsSaveTargetHintObsidianOnly: "\u76EE\u524D\u4ECB\u9762\u6703\u5148\u63D0\u4F9B Obsidian \u8207 Threads Archive Cloud\u3002Notion \u4ECD\u5728\u5167\u90E8\u6E96\u5099\u4E2D\uFF0C\u56E0\u6B64\u66AB\u6642\u96B1\u85CF\u3002",
  optionsSaveTargetNotionHidden: "Notion\uFF08\u66AB\u6642\u96B1\u85CF\uFF09",
  optionsCloudRequiresPro: "\u96F2\u7AEF\u5132\u5B58\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsCloudSection: "Threads Archive Cloud \u9023\u63A5",
  optionsCloudStatusLabel: "Cloud \u9023\u63A5\u72C0\u614B",
  optionsCloudStatusUnlinked: "\u5C1A\u672A\u9023\u63A5\u3002",
  optionsCloudStatusLinked: "\u5DF2\u9023\u63A5\u5230 @{handle}\u3002",
  optionsCloudStatusExpired: "\u9023\u63A5\u5DF2\u904E\u671F\u3002\u8ACB\u91CD\u65B0\u9023\u63A5 extension\u3002",
  optionsCloudStatusOffline: "\u76EE\u524D\u7121\u6CD5\u9023\u5230\u4F3A\u670D\u5668\uFF0C\u56E0\u6B64\u53EA\u986F\u793A\u6700\u5F8C\u4E00\u6B21\u5DF2\u77E5\u72C0\u614B\u3002",
  optionsCloudConnectButton: "\u9023\u63A5 Cloud",
  optionsCloudDisconnectButton: "\u4E2D\u65B7 Cloud \u9023\u63A5",
  optionsCloudLinkHint: "\u9023\u63A5\u6309\u9215\u6703\u5728\u700F\u89BD\u5668\u958B\u555F scrapbook\uFF0C\u4E26\u628A\u76EE\u524D\u767B\u5165\u7684\u5E33\u865F\u9023\u5230\u9019\u500B extension\u3002",
  optionsNotionSection: "Notion \u9023\u63A5",
  optionsNotionSubtitle: "Notion \u900F\u904E OAuth \u9023\u63A5\uFF0C\u56E0\u6B64\u700F\u89BD\u5668\u4E0D\u6703\u76F4\u63A5\u8981\u6C42 internal token\u3002\u9023\u63A5\u4E00\u6B21\u3001\u9078\u597D\u9810\u8A2D\u76EE\u7684\u5730\uFF0C\u4E4B\u5F8C\u5C31\u80FD\u76F4\u63A5\u5132\u5B58\u3002",
  optionsNotionConnectionLabel: "\u9023\u63A5\u72C0\u614B",
  optionsNotionDisconnectButton: "\u4E2D\u65B7\u9023\u63A5",
  optionsNotionConnectHint: "\u6703\u958B\u555F Notion \u6388\u6B0A\u5206\u9801\u3002\u6388\u6B0A\u5F8C\u56DE\u5230\u9019\u88E1\uFF0C\u9023\u63A5\u72C0\u614B\u6703\u81EA\u52D5\u66F4\u65B0\u3002",
  optionsNotionConnected: "\u5DF2\u9023\u63A5 Notion \u5DE5\u4F5C\u5340\u3002",
  optionsNotionDisconnected: "Notion \u5C1A\u672A\u9023\u63A5\u3002",
  optionsNotionConnectStarted: "\u5DF2\u958B\u555F Notion \u9023\u63A5\u5206\u9801\u3002\u6388\u6B0A\u5F8C\u8ACB\u56DE\u5230\u6B64\u9801\u3002",
  optionsNotionConnectFailed: "\u7121\u6CD5\u555F\u52D5 Notion \u9023\u63A5\u6D41\u7A0B\u3002",
  optionsNotionDisconnectedSaved: "\u5DF2\u4E2D\u65B7 Notion \u5DE5\u4F5C\u5340\u9023\u63A5\u3002",
  optionsNotionDisconnectFailed: "\u7121\u6CD5\u4E2D\u65B7 Notion \u9023\u63A5\u3002",
  optionsNotionParentType: "\u5132\u5B58\u6A21\u5F0F",
  optionsNotionParentTypeHint: "\u9078\u64C7\u9810\u8A2D\u76EE\u7684\u5730\u8981\u4F7F\u7528\u9801\u9762\u6216\u8CC7\u6599\u5EAB\u3002",
  optionsNotionSelectedTarget: "\u9810\u8A2D\u76EE\u7684\u5730",
  optionsNotionSelectedTargetHint: "\u5132\u5B58\u6309\u9215\u9810\u8A2D\u6703\u628A\u65B0\u7684 Threads \u64F7\u53D6\u5167\u5BB9\u9001\u5230\u9019\u88E1\u3002",
  optionsNotionTargetNotSelected: "\u5C1A\u672A\u9078\u64C7\u9810\u8A2D\u76EE\u7684\u5730\u3002",
  optionsNotionTargetRequired: "\u8ACB\u5148\u9078\u64C7\u9810\u8A2D\u7684 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionTargetSaved: "\u5DF2\u5132\u5B58\u9810\u8A2D Notion \u76EE\u7684\u5730\u3002",
  optionsNotionTargetSaveFailed: "\u7121\u6CD5\u5132\u5B58\u9810\u8A2D Notion \u76EE\u7684\u5730\u3002",
  optionsNotionSearchLabel: "\u5C0B\u627E\u76EE\u7684\u5730",
  optionsNotionSearchHint: "\u641C\u5C0B\u4F60\u5DF2\u6388\u6B0A\u6B64\u6574\u5408\u53EF\u5B58\u53D6\u7684\u9801\u9762\u6216\u8CC7\u6599\u5EAB\u3002",
  optionsNotionSearchButton: "\u641C\u5C0B\u76EE\u7684\u5730",
  optionsNotionResultsLabel: "\u7D50\u679C",
  optionsNotionResultsHint: "\u9078\u64C7\u5176\u4E2D\u4E00\u500B\u7D50\u679C\u4E26\u8A2D\u70BA\u9810\u8A2D\u5132\u5B58\u76EE\u7684\u5730\u3002",
  optionsNotionUseLocationButton: "\u8A2D\u70BA\u9810\u8A2D\u76EE\u7684\u5730",
  optionsNotionSearchLoaded: "\u5DF2\u8F09\u5165 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionSearchEmpty: "\u627E\u4E0D\u5230\u7B26\u5408\u7684 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionSearchFailed: "\u7121\u6CD5\u8F09\u5165 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionOAuthRequiresPro: "Notion OAuth \u5132\u5B58\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsNotionConnectFirst: "\u8ACB\u5148\u9023\u63A5 Notion\u3002",
  optionsNotionTokenHint: "\u8CBC\u4E0A\u4F60\u7684 Notion internal integration token\u3002\u5B83\u53EA\u6703\u5132\u5B58\u5728\u6B64\u700F\u89BD\u5668\u8A2D\u5B9A\u6A94\u4E2D\u3002",
  optionsNotionParentPageHint: "\u4F60\u53EF\u4EE5\u8CBC\u4E0A\u5B8C\u6574\u7684 Notion \u9801\u9762\u7DB2\u5740\uFF0C\u6216\u53EA\u8CBC\u4E0A\u9801\u9762 ID\u3002",
  optionsNotionDataSourceHint: "\u8CBC\u4E0A\u5B8C\u6574\u7684 Notion \u8CC7\u6599\u5EAB\u7DB2\u5740\u6216\u5176 ID\u3002\u6A19\u984C\u3001\u6A19\u7C64\u3001\u65E5\u671F\u7B49\u5C6C\u6027\u6703\u5728\u53EF\u80FD\u6642\u81EA\u52D5\u5C0D\u61C9\u3002",
  optionsNotionDataSourceLocked: "\u8CC7\u6599\u5EAB\u5132\u5B58\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsNotionUploadMedia: "\u4E0A\u50B3\u5A92\u9AD4\u5230 Notion",
  optionsNotionUploadMediaHint: "\u5C07\u5716\u7247\u8207\u5F71\u7247\u4F5C\u70BA Notion \u7BA1\u7406\u7684\u6A94\u6848\u4E0A\u50B3\uFF0C\u800C\u4E0D\u662F\u50C5\u4FDD\u7559\u9060\u7AEF\u9023\u7D50\u3002\u82E5\u4E0A\u50B3\u5931\u6557\uFF0C\u6703\u9000\u56DE\u70BA\u9023\u7D50\u5132\u5B58\u3002",
  optionsNotionUploadMediaLocked: "Notion \u7BA1\u7406\u5A92\u9AD4\u4E0A\u50B3\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsNotionTokenRequired: "\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u5FC5\u9808\u63D0\u4F9B Notion integration token\u3002",
  optionsNotionParentPageRequired: "\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u5FC5\u9808\u63D0\u4F9B Notion \u7236\u9801\u9762 ID \u6216\u7DB2\u5740\u3002",
  optionsNotionInvalidPage: "Notion \u7236\u9801\u9762 ID \u6216\u7DB2\u5740\u683C\u5F0F\u7121\u6548\u3002",
  optionsNotionDataSourceRequired: "\u8981\u4F7F\u7528\u8CC7\u6599\u5EAB\u5132\u5B58\uFF0C\u5FC5\u9808\u63D0\u4F9B Notion \u8CC7\u6599\u5EAB ID \u6216\u7DB2\u5740\u3002",
  optionsNotionInvalidDataSource: "Notion \u8CC7\u6599\u5EAB ID \u6216\u7DB2\u5740\u683C\u5F0F\u7121\u6548\u3002",
  optionsNotionPermissionDenied: "Notion API \u6B0A\u9650\u906D\u62D2\uFF0C\u56E0\u6B64\u8A2D\u5B9A\u672A\u5132\u5B58\u3002",
  optionsBasicSection: "\u57FA\u672C\u5132\u5B58",
  optionsCompareSection: "Free \u8207 Pro",
  optionsProSection: "Pro \u8A2D\u5B9A",
  optionsProSubtitle: "\u9700\u8981\u6642\u518D\u6253\u958B\u3002\u898F\u5247\u8207 AI \u6574\u7406\u90FD\u5728\u9019\u88E1\u3002",
  optionsProAiNote: "AI \u4E0D\u6703\u81EA\u52D5\u9644\u5E36\u3002\u53EA\u6709\u52A0\u5165\u4F60\u81EA\u5DF1\u7684 API key \u5F8C\u624D\u6703\u904B\u4F5C\u3002",
  compareRowReplies: "\u4E32\u63A5\u56DE\u8986",
  compareRowDuplicates: "\u7565\u904E\u91CD\u8907",
  compareRowFilename: "\u6A94\u540D\u683C\u5F0F",
  compareRowFolder: "\u5132\u5B58\u8DEF\u5F91\u898F\u5247",
  compareRowNotionDataSource: "Notion \u8CC7\u6599\u5EAB",
  compareRowNotionMediaUpload: "Notion \u5A92\u9AD4\u4E0A\u50B3",
  optionsProStatusFree: "\u4F60\u76EE\u524D\u4F7F\u7528 Free\u3002\u5132\u5B58\u529F\u80FD\u5DF2\u53EF\u4F7F\u7528\uFF0C\u53EA\u6709\u5728\u9700\u8981\u898F\u5247\u6216 AI \u6642\u624D\u9700\u8981 Pro\u3002",
  optionsProStatusActive: "Pro \u5DF2\u555F\u7528\u3002\u4E0B\u65B9\u53EF\u4F7F\u7528\u898F\u5247\u6574\u7406\u8207 AI\u3002",
  optionsProStatusExpired: "\u9019\u7D44 Pro \u91D1\u9470\u5DF2\u904E\u671F\u3002Free \u5132\u5B58\u4ECD\u53EF\u4F7F\u7528\u3002",
  optionsProStatusInvalid: "\u9019\u7D44 Pro \u91D1\u9470\u7121\u6548\u3002Free \u5132\u5B58\u4ECD\u53EF\u4F7F\u7528\u3002",
  optionsProStatusSeatLimit: "\u9019\u7D44 Pro \u91D1\u9470\u5DF2\u5728 3 \u53F0\u88DD\u7F6E\u555F\u7528\u3002\u8ACB\u5148\u5728\u5176\u4ED6\u88DD\u7F6E\u89E3\u9664\u5176\u4E2D\u4E00\u53F0\u3002",
  optionsProStatusNeedsActivation: "\u9019\u7D44 Pro \u91D1\u9470\u6709\u6548\uFF0C\u4F46\u6B64\u88DD\u7F6E\u5C1A\u672A\u555F\u7528 seat\u3002",
  optionsProStatusOffline: "\u7121\u6CD5\u9023\u63A5\u5230\u4F3A\u670D\u5668\uFF0C\u56E0\u6B64\u5C07\u6CBF\u7528\u6700\u8FD1\u4E00\u6B21\u7684\u555F\u7528\u72C0\u614B\u3002",
  optionsProStatusRevoked: "\u9019\u7D44 Pro \u91D1\u9470\u5DF2\u7121\u6CD5\u518D\u4F7F\u7528\u3002",
  optionsProHolderLabel: "\u6301\u6709\u4EBA",
  optionsProExpiresLabel: "\u5230\u671F\u65E5",
  optionsProUnlockHint: "\u8CBC\u4E0A\u8CFC\u8CB7\u90F5\u4EF6\u4E2D\u7684 Pro \u91D1\u9470\uFF0C\u5373\u53EF\u5728\u6B64\u700F\u89BD\u5668\u555F\u7528\u3002",
  optionsProUnlockPlaceholder: "\u5728\u9019\u88E1\u8CBC\u4E0A\u4F60\u7684 Pro \u91D1\u9470",
  optionsProSalesLink: "\u53D6\u5F97 Pro",
  optionsProActivate: "\u555F\u7528 Pro",
  optionsProClear: "\u79FB\u9664",
  optionsProActivated: "Pro \u5DF2\u555F\u7528\u3002",
  optionsProRemoved: "\u5DF2\u79FB\u9664 Pro \u91D1\u9470\u3002",
  optionsProEmptyKey: "\u8ACB\u5148\u8F38\u5165 Pro \u91D1\u9470\u3002",
  optionsProLocalOnly: "Obsidian \u5132\u5B58\u5167\u5BB9\u6703\u7559\u5728\u4F60\u7684\u88DD\u7F6E\u4E0A\uFF0C\u800C Cloud \u5132\u5B58\u4E5F\u53EA\u6703\u5728\u4F60\u9078\u64C7\u6642\uFF0C\u628A\u8CBC\u6587\u50B3\u9001\u5230\u4F60\u7684 scrapbook \u5E33\u865F\u3002",
  optionsFileRules: "\u6A94\u6848\u898F\u5247",
  optionsFilenamePattern: "\u6A94\u540D\u683C\u5F0F",
  optionsFilenamePatternLocked: "Free \u4F7F\u7528\u9810\u8A2D\u6A94\u540D\u3002Pro \u53EF\u8B93\u4F60\u81EA\u8A02\u683C\u5F0F\u3002",
  optionsSavePathPattern: "\u5B50\u8CC7\u6599\u593E\u8DEF\u5F91",
  optionsSavePathTokens: "\u7BC4\u4F8B\uFF1AInbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free \u6703\u5132\u5B58\u5230\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u7684\u6839\u76EE\u9304\u3002Pro \u53EF\u4F9D\u65E5\u671F\u3001\u4F5C\u8005\u6216\u4E3B\u984C\u81EA\u52D5\u6574\u7406\u5230\u5B50\u8CC7\u6599\u593E\u3002",
  optionsFilenameTokens: "\u53EF\u7528\uFF1A{date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI \u6574\u7406",
  optionsAiSubtitle: "\u9078\u64C7\u63D0\u4F9B\u8005\u5F8C\uFF0C\u9810\u8A2D\u7684 Base URL \u8207\u6A21\u578B\u6703\u81EA\u52D5\u5E36\u5165\u3002",
  optionsAiQuickstart: "\u5927\u591A\u6578\u4EBA\u53EA\u9700\u8981\u63D0\u4F9B\u8005\u8207 API key\u3002\u4FEE\u6539\u5F8C\u8ACB\u6309\u4E0B\u4E0B\u65B9\u7684\u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u5957\u7528\u3002",
  optionsAiAdvancedSummary: "\u986F\u793A\u9032\u968E\u8A2D\u5B9A",
  optionsAiEnable: "\u555F\u7528 AI \u6574\u7406",
  optionsAiProviderHint: "OpenAI\u3001OpenRouter\u3001DeepSeek\u3001Gemini \u8207 Ollama \u90FD\u53EF\u4EE5\u5F9E\u9810\u8A2D\u503C\u958B\u59CB\u3002Custom \u7528\u65BC\u4EFB\u4F55 OpenAI \u76F8\u5BB9\u7AEF\u9EDE\u3002",
  optionsAiApiKeyHint: "Gemini \u91D1\u9470\u901A\u5E38\u4EE5 AIza \u958B\u982D\uFF0C\u800C OpenAI/OpenRouter/DeepSeek \u91D1\u9470\u901A\u5E38\u4EE5 sk- \u958B\u982D\u3002\u50CF Ollama \u9019\u985E\u672C\u5730\u7AEF\u9EDE\u82E5\u4E0D\u9700\u8981\u91D1\u9470\u53EF\u7559\u7A7A\u3002",
  optionsAiApiKeyRequired: "\u6240\u9078\u63D0\u4F9B\u8005\u9700\u8981 API key\u3002",
  optionsAiKeyMismatchGemini: "Gemini \u9700\u8981 Google Gemini API key\u3002\u4F60\u76EE\u524D\u7684\u91D1\u9470\u770B\u8D77\u4F86\u50CF\u662F OpenAI \u76F8\u5BB9\u91D1\u9470\u3002",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek \u9700\u8981\u5404\u81EA\u7684\u91D1\u9470\uFF0C\u800C\u4E0D\u662F\u4EE5 AIza \u958B\u982D\u7684 Gemini \u91D1\u9470\u3002",
  optionsAiModel: "\u6A21\u578B\u540D\u7A31",
  optionsAiPrompt: "\u6574\u7406\u63D0\u793A\u8A5E",
  optionsAiPromptHint: "\u8ACB\u63CF\u8FF0\u4F60\u5E0C\u671B\u7684\u6458\u8981\u9577\u5EA6\u3001\u6A19\u7C64\u98A8\u683C\u8207 frontmatter \u6B04\u4F4D\u3002",
  optionsAiLocked: "AI \u6574\u7406\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsAiInvalidBaseUrl: "AI Base URL \u7121\u6548\u3002",
  optionsAiPermissionDenied: "\u6240\u9078 AI \u7AEF\u9EDE\u7684\u6B0A\u9650\u906D\u62D2\uFF0C\u56E0\u6B64\u8A2D\u5B9A\u672A\u5132\u5B58\u3002",
  optionsAiSaved: "\u5DF2\u5132\u5B58 AI \u8A2D\u5B9A\u8207\u7AEF\u9EDE\u6B0A\u9650\u3002",
  optionsIncludeImages: "\u5132\u5B58\u5716\u7247\u8207\u5F71\u7247\u6A94\u6848",
  optionsSave: "\u5132\u5B58\u8A2D\u5B9A",
  optionsSaved: "\u8A2D\u5B9A\u5DF2\u5132\u5B58\u3002",
  optionsPendingSave: "\u5DF2\u6709\u8B8A\u66F4\u3002\u8ACB\u6309\u4E0B\u65B9\u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u5957\u7528\u3002",
  optionsNoChanges: "\u76EE\u524D\u6C92\u6709\u8B8A\u66F4\u3002",
  optionsStep1: "1. \u9023\u63A5 Obsidian \u8CC7\u6599\u593E",
  optionsStep2: "2. \u5148\u8A66\u7528\u514D\u8CBB\u5132\u5B58",
  optionsStep3: "3. \u9700\u8981\u898F\u5247\u6216 AI \u6574\u7406\u6642\u518D\u555F\u7528 Pro",
  mdImageLabel: "\u5716\u7247",
  mdVideoLabel: "\u5F71\u7247",
  mdVideoThumbnailLabel: "\u5F71\u7247\u7E2E\u5716",
  mdVideoOnThreads: "\u5728 Threads \u958B\u555F",
  mdSavedVideoFile: "\u5DF2\u5132\u5B58\u7684\u5F71\u7247\u6A94",
  mdReplySection: "\u4F5C\u8005\u56DE\u8986\u4E32",
  mdReplyLabel: "\u56DE\u8986",
  mdReplyImageLabel: "\u56DE\u8986\u5716\u7247",
  mdUploadedMediaSection: "\u5DF2\u4E0A\u50B3\u5A92\u9AD4",
  mdSource: "\u4F86\u6E90",
  mdAuthor: "\u4F5C\u8005",
  mdPublishedAt: "\u767C\u5E03\u6642\u9593",
  mdExternalLink: "\u5916\u90E8\u9023\u7D50",
  mdWarning: "\u8B66\u544A",
  mdSummary: "AI \u6458\u8981",
  warnImageAccessFailed: "\u90E8\u5206\u5716\u7247\u6216\u5F71\u7247\u7121\u6CD5\u5132\u5B58\uFF0C\u56E0\u6B64\u4FDD\u7559\u4E86\u539F\u59CB\u9023\u7D50\u3002",
  warnImageDownloadOff: "\u5716\u7247\uFF0F\u5F71\u7247\u5132\u5B58\u5DF2\u95DC\u9589\uFF0C\u56E0\u6B64\u4FDD\u7559\u4E86\u539F\u59CB\u9023\u7D50\u3002",
  warnAiFailed: "AI \u6574\u7406\u5931\u6557\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u539F\u59CB\u7B46\u8A18\uFF1A{reason}",
  warnAiPermissionMissing: "\u7F3A\u5C11 AI \u7AEF\u9EDE\u6B0A\u9650\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u539F\u59CB\u7B46\u8A18\u3002\u8ACB\u5728\u8A2D\u5B9A\u4E2D\u91CD\u65B0\u5132\u5B58 AI \u5340\u584A\u3002",
  warnAiMissingModel: "\u5C1A\u672A\u8A2D\u5B9A AI \u6A21\u578B\u540D\u7A31\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u539F\u59CB\u7B46\u8A18\u3002",
  warnNotionMediaUploadFailed: "\u4E0A\u50B3\u5A92\u9AD4\u5230 Notion \u5931\u6557\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u9060\u7AEF\u9023\u7D50\u3002",
  errBrowserUnsupported: "\u6B64\u700F\u89BD\u5668\u7121\u6CD5\u76F4\u63A5\u5132\u5B58\u5230 Obsidian \u8CC7\u6599\u593E\u3002",
  errFolderNameFailed: "\u7121\u6CD5\u6C7A\u5B9A\u8981\u5132\u5B58\u7684\u8CC7\u6599\u593E\u540D\u7A31\u3002",
  errInvalidPath: "\u7121\u6548\u7684\u6A94\u6848\u8DEF\u5F91\u3002",
  errNotionTokenMissing: "\u5C1A\u672A\u8A2D\u5B9A Notion integration token\u3002",
  errNotionPermissionMissing: "\u7F3A\u5C11 Notion API \u6B0A\u9650\u3002\u8ACB\u5148\u91CD\u65B0\u5132\u5B58\u8A2D\u5B9A\u3002",
  errNotionUnauthorized: "Notion token \u7121\u6548\u6216\u5DF2\u904E\u671F\u3002",
  errNotionForbidden: "\u6B64\u6574\u5408\u7121\u6CD5\u5B58\u53D6\u6240\u9078\u7684 Notion \u76EE\u7684\u5730\u3002\u8ACB\u78BA\u8A8D\u8A72\u9801\u9762\u6216\u8CC7\u6599\u5EAB\u5DF2\u8207\u6574\u5408\u5206\u4EAB\u3002",
  errNotionParentNotFound: "\u627E\u4E0D\u5230\u6240\u9078\u7684 Notion \u9801\u9762\u6216\u8CC7\u6599\u5EAB\u3002\u8ACB\u6AA2\u67E5 ID \u8207\u9023\u63A5\u72C0\u614B\u3002",
  errNotionRateLimited: "Notion \u8ACB\u6C42\u904E\u591A\u3002\u8ACB\u5728 {seconds} \u79D2\u5F8C\u518D\u8A66\u4E00\u6B21\u3002",
  errNotionValidation: "Notion \u8ACB\u6C42\u7121\u6548\u3002",
  errNotionRequestFailed: "Notion \u5132\u5B58\u8ACB\u6C42\u5931\u6557\u3002",
  fallbackNoFolder: "\u5C1A\u672A\u9023\u63A5\u8CC7\u6599\u593E\uFF0C",
  fallbackPermissionDenied: "\u7F3A\u5C11\u8CC7\u6599\u593E\u6B0A\u9650\uFF0C",
  fallbackDirectFailed: "\u7121\u6CD5\u5132\u5B58\u5230\u8CC7\u6599\u593E\uFF0C",
  fallbackZipMessage: " \u56E0\u6B64\u6539\u70BA\u4E0B\u8F09\u6A94\u6848\u3002",
  errNotPermalink: "\u8ACB\u5148\u6253\u958B\u55AE\u7BC7\u8CBC\u6587\u9801\u9762\u3002",
  errPostContentNotFound: "\u7121\u6CD5\u8F09\u5165\u8CBC\u6587\u5167\u5BB9\u3002\u8ACB\u78BA\u8A8D\u4F60\u5DF2\u767B\u5165\u3002"
};
var vi = {
  ...en,
  uiLanguageLabel: "Ng\xF4n ng\u1EEF",
  popupTitle: "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
  popupSave: "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
  popupSettings: "C\xE0i \u0111\u1EB7t",
  popupPromoTitle: "Khu v\u1EF1c d\u1EF1 tr\u1EEF",
  popupPromoDescription: "Khu v\u1EF1c n\xE0y \u0111\u01B0\u1EE3c d\xE0nh s\u1EB5n cho h\u01B0\u1EDBng d\u1EABn v\xE0 g\u1EE3i \xFD trong t\u01B0\u01A1ng lai.",
  popupSubtitleDirect: "\u0110ang l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian \u0111\xE3 k\u1EBFt n\u1ED1i.",
  popupSubtitleDownload: "Ch\u01B0a k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. B\xE0i vi\u1EBFt s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng d\u01B0\u1EDBi d\u1EA1ng t\u1EC7p. H\xE3y k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c trong ph\u1EA7n c\xE0i \u0111\u1EB7t.",
  popupSubtitleConnected: "\u0110ang l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian \u0111\xE3 k\u1EBFt n\u1ED1i.",
  popupSubtitlePermissionCheck: "Th\u01B0 m\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i, nh\u01B0ng c\xF3 th\u1EC3 c\u1EA7n x\xE1c nh\u1EADn l\u1EA1i quy\u1EC1n truy c\u1EADp.",
  popupSubtitleNoFolder: "N\u1EBFu c\xF3 th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i th\xEC s\u1EBD l\u01B0u tr\u1EF1c ti\u1EBFp, n\u1EBFu kh\xF4ng s\u1EBD t\u1EA3i xu\u1ED1ng t\u1EC7p.",
  popupSubtitleUnsupported: "Tr\xECnh duy\u1EC7t n\xE0y ch\u1EC9 h\u1ED7 tr\u1EE3 t\u1EA3i t\u1EC7p xu\u1ED1ng.",
  popupSubtitleNotion: "\u0110ang l\u01B0u v\xE0o \u0111\xEDch Notion \u0111\xE3 c\u1EA5u h\xECnh.",
  popupSubtitleNotionSetup: "\u0110\u1EC3 d\xF9ng l\u01B0u v\xE0o Notion, tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp token v\xE0 \u0111\xEDch l\u01B0u trong ph\u1EA7n c\xE0i \u0111\u1EB7t.",
  popupSubtitleCloud: "\u0110ang l\u01B0u v\xE0o scrapbook \u0111\xE1m m\xE2y c\u1EE7a Threads Archive. H\xE3y \u0111\u0103ng nh\u1EADp tr\xEAn web tr\u01B0\u1EDBc.",
  popupRecentSaves: "L\u1EA7n l\u01B0u g\u1EA7n \u0111\xE2y",
  popupClearAll: "X\xF3a t\u1EA5t c\u1EA3",
  popupEmpty: "Ch\u01B0a c\xF3 b\xE0i vi\u1EBFt n\xE0o \u0111\u01B0\u1EE3c l\u01B0u.",
  popupResave: "L\u01B0u l\u1EA1i",
  popupExpand: "M\u1EDF r\u1ED9ng",
  popupCollapse: "Thu g\u1ECDn",
  popupDelete: "X\xF3a",
  popupOpenRemote: "M\u1EDF t\u1EEB xa",
  popupCloudConnect: "K\u1EBFt n\u1ED1i Cloud",
  popupCloudDisconnect: "Ng\u1EAFt k\u1EBFt n\u1ED1i Cloud",
  statusReady: "\u0110\xE3 s\u1EB5n s\xE0ng \u0111\u1EC3 l\u01B0u t\u1EEB trang permalink c\u1EE7a b\xE0i vi\u1EBFt.",
  statusReadyDirect: "\u0110\xE3 s\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
  statusReadyDownload: "\u0110\xE3 s\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 t\u1EA3i t\u1EC7p xu\u1ED1ng.",
  statusReadyCloud: "\u0110\xE3 s\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 l\u01B0u v\xE0o scrapbook \u0111\xE1m m\xE2y c\u1EE7a Threads Archive.",
  statusUnsupported: "Vui l\xF2ng m\u1EDF trang b\xE0i vi\u1EBFt ri\xEAng l\u1EBB tr\u01B0\u1EDBc.",
  statusNoTab: "Kh\xF4ng t\xECm th\u1EA5y tab \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
  statusSaving: "\u0110ang l\u01B0u\u2026",
  statusSavedDirect: "\u0110\xE3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
  statusSavedZip: "\u0110\xE3 l\u01B0u. Qu\xE1 tr\xECnh t\u1EA3i xu\u1ED1ng \u0111\xE3 b\u1EAFt \u0111\u1EA7u.",
  statusSavedNotion: "\u0110\xE3 l\u01B0u v\xE0o Notion.",
  statusSavedCloud: "\u0110\xE3 l\u01B0u v\xE0o Threads Archive scrapbook.",
  statusDuplicate: "B\xE0i vi\u1EBFt n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u tr\u01B0\u1EDBc \u0111\xF3, nh\u01B0ng \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt b\u1EB1ng n\u1ED9i dung m\u1EDBi nh\u1EA5t.",
  statusDuplicateWarning: "\u0110\xE3 l\u01B0u tr\u01B0\u1EDBc \u0111\xF3, \u0111\xE3 c\u1EADp nh\u1EADt: ",
  statusAlreadySaved: "B\xE0i vi\u1EBFt n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u r\u1ED3i. H\xE3y d\xF9ng \u201CL\u01B0u l\u1EA1i\u201D trong m\u1EE5c l\u01B0u g\u1EA7n \u0111\xE2y \u0111\u1EC3 l\u01B0u th\xEAm l\u1EA7n n\u1EEFa.",
  statusNotionSetupRequired: "\u0110\u1EC3 d\xF9ng l\u01B0u v\xE0o Notion, tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp token v\xE0 \u0111\xEDch l\u01B0u trong ph\u1EA7n c\xE0i \u0111\u1EB7t.",
  statusError: "\u0110\xE3 x\u1EA3y ra l\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh.",
  statusResaving: "\u0110ang chu\u1EA9n b\u1ECB t\u1EC7p c\u1EE7a b\u1EA1n\u2026",
  statusResaved: "Qu\xE1 tr\xECnh t\u1EA3i xu\u1ED1ng \u0111\xE3 b\u1EAFt \u0111\u1EA7u.",
  statusResavedNotion: "\u0110\xE3 l\u01B0u l\u1EA1i v\xE0o Notion nh\u01B0 m\u1ED9t trang m\u1EDBi.",
  statusResavedCloud: "\u0110\xE3 l\u01B0u l\u1EA1i v\xE0o Threads Archive scrapbook.",
  statusCloudLoginRequired: "\u0110\u1EC3 d\xF9ng l\u01B0u \u0111\xE1m m\xE2y, tr\u01B0\u1EDBc ti\xEAn h\xE3y \u0111\u0103ng nh\u1EADp t\u1EA1i ss-threads.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "H\xE3y k\u1EBFt n\u1ED1i extension v\u1EDBi Threads Archive scrapbook tr\u01B0\u1EDBc khi d\xF9ng l\u01B0u \u0111\xE1m m\xE2y.",
  statusCloudSessionExpired: "K\u1EBFt n\u1ED1i \u0111\xE1m m\xE2y \u0111\xE3 h\u1EBFt h\u1EA1n. H\xE3y k\u1EBFt n\u1ED1i l\u1EA1i extension.",
  statusCloudOffline: "Kh\xF4ng th\u1EC3 x\xE1c minh k\u1EBFt n\u1ED1i \u0111\xE1m m\xE2y. H\xE3y ki\u1EC3m tra m\u1EA1ng.",
  statusCloudConnected: "Threads Archive Cloud \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  statusCloudDisconnected: "Threads Archive Cloud \u0111\xE3 b\u1ECB ng\u1EAFt k\u1EBFt n\u1ED1i.",
  statusCloudLinkStarting: "H\xE3y ho\xE0n t\u1EA5t vi\u1EC7c k\u1EBFt n\u1ED1i Threads Archive scrapbook trong tr\xECnh duy\u1EC7t.",
  statusRecentNotFound: "Kh\xF4ng t\xECm th\u1EA5y b\u1EA3n ghi l\u01B0u g\u1EA7n \u0111\xE2y.",
  statusDeletedRecent: "\u0110\xE3 x\xF3a kh\u1ECFi m\u1EE5c l\u01B0u g\u1EA7n \u0111\xE2y.",
  statusClearedRecents: "\u0110\xE3 x\xF3a to\xE0n b\u1ED9 m\u1EE5c l\u01B0u g\u1EA7n \u0111\xE2y.",
  statusExtractFailed: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc b\xE0i vi\u1EBFt.",
  statusTabError: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc th\xF4ng tin c\u1EE7a tab hi\u1EC7n t\u1EA1i.",
  statusRedownloadError: "\u0110\xE3 x\u1EA3y ra l\u1ED7i khi t\u1EA3i l\u1EA1i.",
  statusRetry: "Th\u1EED l\u1EA1i",
  statusResaveButton: "L\u01B0u l\u1EA1i",
  optionsTitle: "L\u01B0u b\xE0i vi\u1EBFt Threads v\xE0o Obsidian, Threads Archive Cloud ho\u1EB7c Notion, k\xE8m t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp.",
  optionsTitleObsidianOnly: "L\u01B0u b\xE0i vi\u1EBFt Threads v\xE0o Obsidian ho\u1EB7c Threads Archive Cloud, k\xE8m t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp.",
  optionsSubtitle: "L\u01B0u mi\u1EC5n ph\xED. Ch\u1EC9 c\u1EA7n Pro khi th\u1EADt s\u1EF1 c\u1EA7n.",
  optionsSubtitleObsidianOnly: "Giao di\u1EC7n hi\u1EC7n t\u1EA1i \u01B0u ti\xEAn Obsidian v\xE0 Cloud save tr\u01B0\u1EDBc, c\xF2n Notion s\u1EBD \u0111\u01B0\u1EE3c \u1EA9n cho \u0111\u1EBFn khi t\xEDch h\u1EE3p s\u1EB5n s\xE0ng.",
  optionsPlanSpotlightFreeCopy: "T\xEDnh n\u0103ng l\u01B0u c\u01A1 b\u1EA3n \u0111\xE3 s\u1EB5n s\xE0ng \u0111\u1EC3 d\xF9ng.",
  optionsPlanSpotlightActiveTitle: "Pro \u0111ang ho\u1EA1t \u0111\u1ED9ng",
  optionsPlanSpotlightActiveCopy: "C\xE1c t\xEDnh n\u0103ng Pro \u0111\xE3 \u0111\u01B0\u1EE3c b\u1EADt tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro c\u1EA7n \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t",
  optionsPlanSpotlightNeedsActivationCopy: "Kh\xF3a n\xE0y h\u1EE3p l\u1EC7, nh\u01B0ng thi\u1EBFt b\u1ECB n\xE0y v\u1EABn ch\u01B0a c\xF3 seat \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
  optionsAdSlotTitle: "V\u1ECB tr\xED qu\u1EA3ng c\xE1o d\u1EF1 ph\xF2ng",
  optionsAdSlotCopy: "\u0110\u01B0\u1EE3c d\xE0nh s\u1EB5n cho banner ho\u1EB7c th\xF4ng b\xE1o trong t\u01B0\u01A1ng lai.",
  optionsFolderSection: "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian",
  optionsFolderStatus: "\u0110ang ki\u1EC3m tra th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i\u2026",
  optionsFolderLabel: "Th\u01B0 m\u1EE5c hi\u1EC7n t\u1EA1i",
  optionsFolderNotConnected: "Ch\u01B0a k\u1EBFt n\u1ED1i",
  optionsFolderConnect: "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
  optionsFolderDisconnect: "Ng\u1EAFt k\u1EBFt n\u1ED1i",
  optionsFolderUnsupported: "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng h\u1ED7 tr\u1EE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
  optionsFolderUnsupportedStatus: "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng th\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c. T\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng thay th\u1EBF.",
  optionsFolderNotConnectedStatus: "Ch\u01B0a c\xF3 th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. Khi l\u01B0u, t\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng.",
  optionsFolderReady: "Th\u01B0 m\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. T\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u tr\u1EF1c ti\u1EBFp.",
  optionsFolderPermissionCheck: "Th\u01B0 m\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. \u1EDE l\u1EA7n l\u01B0u ti\u1EBFp theo c\xF3 th\u1EC3 s\u1EBD c\u1EA7n x\xE1c nh\u1EADn l\u1EA1i quy\u1EC1n truy c\u1EADp.",
  optionsFolderPermissionLost: "Quy\u1EC1n truy c\u1EADp th\u01B0 m\u1EE5c \u0111\xE3 b\u1ECB m\u1EA5t. Vui l\xF2ng k\u1EBFt n\u1ED1i l\u1EA1i th\u01B0 m\u1EE5c.",
  optionsFolderChecked: "\u0110\xE3 x\xE1c nh\u1EADn k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. H\u1EC7 th\u1ED1ng s\u1EBD th\u1EED l\u01B0u tr\u1EF1c ti\u1EBFp.",
  optionsFolderCancelled: "\u0110\xE3 h\u1EE7y ch\u1ECDn th\u01B0 m\u1EE5c.",
  optionsFolderError: "\u0110\xE3 x\u1EA3y ra l\u1ED7i khi k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c.",
  optionsFolderConnectedSuccess: '\u0110\xE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c "{folder}".',
  optionsFolderPathLabel: "V\u1ECB tr\xED l\u01B0u hi\u1EC7n t\u1EA1i",
  optionsFolderPathHint: "Tr\xECnh duy\u1EC7t kh\xF4ng th\u1EC3 hi\u1EC3n th\u1ECB \u0111\u01B0\u1EDDng d\u1EABn tuy\u1EC7t \u0111\u1ED1i c\u1EE7a h\u1EC7 \u0111i\u1EC1u h\xE0nh, n\xEAn gi\xE1 tr\u1ECB n\xE0y s\u1EBD \u0111\u01B0\u1EE3c hi\u1EC3n th\u1ECB t\u01B0\u01A1ng \u0111\u1ED1i theo th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i.",
  optionsFolderPathUnavailable: "S\u1EBD hi\u1EC3n th\u1ECB sau khi b\u1EA1n k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
  optionsSaveTarget: "\u0110\xEDch l\u01B0u",
  optionsSaveTargetHint: "Tr\xEAn m\xE1y t\xEDnh, b\u1EA1n c\xF3 th\u1EC3 ch\u1ECDn Obsidian, Threads Archive Cloud ho\u1EB7c Notion l\xE0m \u0111\xEDch m\u1EB7c \u0111\u1ECBnh.",
  optionsSaveTargetHintObsidianOnly: "Giao di\u1EC7n hi\u1EC7n t\u1EA1i \u01B0u ti\xEAn Obsidian v\xE0 Threads Archive Cloud. Notion v\u1EABn b\u1ECB \u1EA9n trong ph\u1EA7n c\xE0i \u0111\u1EB7t trong khi t\xEDch h\u1EE3p \u0111ang \u0111\u01B0\u1EE3c chu\u1EA9n b\u1ECB.",
  optionsSaveTargetNotionHidden: "Notion (t\u1EA1m th\u1EDDi \u1EA9n)",
  optionsCloudRequiresPro: "Cloud save ch\u1EC9 kh\u1EA3 d\u1EE5ng trong Pro.",
  optionsCloudSection: "K\u1EBFt n\u1ED1i Threads Archive Cloud",
  optionsCloudStatusLabel: "Tr\u1EA1ng th\xE1i k\u1EBFt n\u1ED1i Cloud",
  optionsCloudStatusUnlinked: "Ch\u01B0a \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  optionsCloudStatusLinked: "\u0110\xE3 k\u1EBFt n\u1ED1i v\u1EDBi @{handle}.",
  optionsCloudStatusExpired: "K\u1EBFt n\u1ED1i \u0111\xE3 h\u1EBFt h\u1EA1n. H\xE3y k\u1EBFt n\u1ED1i l\u1EA1i extension.",
  optionsCloudStatusOffline: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i t\u1EDBi m\xE1y ch\u1EE7 n\xEAn ch\u1EC9 hi\u1EC3n th\u1ECB tr\u1EA1ng th\xE1i \u0111\u01B0\u1EE3c bi\u1EBFt g\u1EA7n nh\u1EA5t.",
  optionsCloudConnectButton: "K\u1EBFt n\u1ED1i Cloud",
  optionsCloudDisconnectButton: "Ng\u1EAFt k\u1EBFt n\u1ED1i Cloud",
  optionsCloudLinkHint: "N\xFAt k\u1EBFt n\u1ED1i s\u1EBD m\u1EDF scrapbook trong tr\xECnh duy\u1EC7t v\xE0 li\xEAn k\u1EBFt t\xE0i kho\u1EA3n \u0111ang \u0111\u0103ng nh\u1EADp v\u1EDBi extension n\xE0y.",
  optionsNotionSection: "K\u1EBFt n\u1ED1i Notion",
  optionsNotionSubtitle: "Notion \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i qua OAuth n\xEAn tr\xECnh duy\u1EC7t s\u1EBD kh\xF4ng bao gi\u1EDD y\xEAu c\u1EA7u internal token tr\u1EF1c ti\u1EBFp. Ch\u1EC9 c\u1EA7n k\u1EBFt n\u1ED1i m\u1ED9t l\u1EA7n, ch\u1ECDn \u0111\xEDch m\u1EB7c \u0111\u1ECBnh, r\u1ED3i sau \u0111\xF3 b\u1EA1n ch\u1EC9 vi\u1EC7c l\u01B0u.",
  optionsNotionConnectionLabel: "K\u1EBFt n\u1ED1i",
  optionsNotionDisconnectButton: "Ng\u1EAFt k\u1EBFt n\u1ED1i",
  optionsNotionConnectHint: "M\u1ED9t tab ph\xEA duy\u1EC7t Notion s\u1EBD \u0111\u01B0\u1EE3c m\u1EDF. Sau khi ph\xEA duy\u1EC7t, quay l\u1EA1i \u0111\xE2y v\xE0 tr\u1EA1ng th\xE1i k\u1EBFt n\u1ED1i s\u1EBD t\u1EF1 \u0111\u1ED9ng \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt.",
  optionsNotionConnected: "M\u1ED9t workspace Notion \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  optionsNotionDisconnected: "Notion v\u1EABn ch\u01B0a \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  optionsNotionConnectStarted: "\u0110\xE3 m\u1EDF tab k\u1EBFt n\u1ED1i Notion. H\xE3y quay l\u1EA1i \u0111\xE2y sau khi ph\xEA duy\u1EC7t.",
  optionsNotionConnectFailed: "Kh\xF4ng th\u1EC3 b\u1EAFt \u0111\u1EA7u quy tr\xECnh k\u1EBFt n\u1ED1i Notion.",
  optionsNotionDisconnectedSaved: "\u0110\xE3 ng\u1EAFt k\u1EBFt n\u1ED1i workspace Notion.",
  optionsNotionDisconnectFailed: "Kh\xF4ng th\u1EC3 ng\u1EAFt k\u1EBFt n\u1ED1i Notion.",
  optionsNotionParentType: "Ch\u1EBF \u0111\u1ED9 l\u01B0u",
  optionsNotionParentTypeHint: "Ch\u1ECDn xem \u0111\xEDch m\u1EB7c \u0111\u1ECBnh s\u1EBD l\xE0 trang hay c\u01A1 s\u1EDF d\u1EEF li\u1EC7u trong workspace \u0111\xE3 k\u1EBFt n\u1ED1i.",
  optionsNotionSelectedTarget: "\u0110\xEDch m\u1EB7c \u0111\u1ECBnh",
  optionsNotionSelectedTargetHint: "\u0110\xE2y l\xE0 n\u01A1i n\xFAt l\u01B0u s\u1EBD g\u1EEDi c\xE1c n\u1ED9i dung ch\u1EE5p t\u1EEB Threads theo m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionTargetNotSelected: "Ch\u01B0a ch\u1ECDn \u0111\xEDch m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionTargetRequired: "H\xE3y ch\u1ECDn \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh tr\u01B0\u1EDBc.",
  optionsNotionTargetSaved: "\u0110\xE3 l\u01B0u \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionTargetSaveFailed: "Kh\xF4ng th\u1EC3 l\u01B0u \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionSearchLabel: "T\xECm \u0111\xEDch l\u01B0u",
  optionsNotionSearchHint: "T\xECm c\xE1c trang ho\u1EB7c c\u01A1 s\u1EDF d\u1EEF li\u1EC7u m\xE0 b\u1EA1n \u0111\xE3 c\u1EA5p quy\u1EC1n cho t\xEDch h\u1EE3p n\xE0y truy c\u1EADp.",
  optionsNotionSearchButton: "T\xECm \u0111\xEDch l\u01B0u",
  optionsNotionResultsLabel: "K\u1EBFt qu\u1EA3",
  optionsNotionResultsHint: "Ch\u1ECDn m\u1ED9t k\u1EBFt qu\u1EA3 v\xE0 \u0111\u1EB7t n\xF3 l\xE0m \u0111\xEDch l\u01B0u m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionUseLocationButton: "D\xF9ng l\xE0m \u0111\xEDch m\u1EB7c \u0111\u1ECBnh",
  optionsNotionSearchLoaded: "\u0110\xE3 t\u1EA3i c\xE1c \u0111\xEDch Notion.",
  optionsNotionSearchEmpty: "Kh\xF4ng t\xECm th\u1EA5y \u0111\xEDch Notion ph\xF9 h\u1EE3p.",
  optionsNotionSearchFailed: "Kh\xF4ng th\u1EC3 t\u1EA3i c\xE1c \u0111\xEDch Notion.",
  optionsNotionOAuthRequiresPro: "L\u01B0u v\xE0o Notion qua OAuth ch\u1EC9 c\xF3 trong Pro.",
  optionsNotionConnectFirst: "H\xE3y k\u1EBFt n\u1ED1i Notion tr\u01B0\u1EDBc.",
  optionsNotionTokenHint: "D\xE1n token internal integration c\u1EE7a Notion. N\xF3 ch\u1EC9 \u0111\u01B0\u1EE3c l\u01B0u trong h\u1ED3 s\u01A1 tr\xECnh duy\u1EC7t n\xE0y.",
  optionsNotionParentPageHint: "B\u1EA1n c\xF3 th\u1EC3 d\xE1n URL \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a trang Notion ho\u1EB7c ch\u1EC9 d\xE1n ID c\u1EE7a trang.",
  optionsNotionDataSourceHint: "D\xE1n URL \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion ho\u1EB7c ch\u1EC9 d\xE1n ID c\u1EE7a n\xF3. Ti\xEAu \u0111\u1EC1, tag, ng\xE0y th\xE1ng v\xE0 c\xE1c thu\u1ED9c t\xEDnh t\u01B0\u01A1ng t\u1EF1 s\u1EBD \u0111\u01B0\u1EE3c \xE1nh x\u1EA1 t\u1EF1 \u0111\u1ED9ng khi c\xF3 th\u1EC3.",
  optionsNotionDataSourceLocked: "L\u01B0u v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u ch\u1EC9 c\xF3 trong Pro.",
  optionsNotionUploadMedia: "T\u1EA3i media l\xEAn Notion",
  optionsNotionUploadMediaHint: "T\u1EA3i h\xECnh \u1EA3nh v\xE0 video l\xEAn nh\u01B0 t\u1EC7p do Notion qu\u1EA3n l\xFD thay v\xEC ch\u1EC9 \u0111\u1EC3 l\u1EA1i li\xEAn k\u1EBFt t\u1EEB xa. N\u1EBFu t\u1EA3i l\xEAn th\u1EA5t b\u1EA1i, h\u1EC7 th\u1ED1ng s\u1EBD quay v\u1EC1 l\u01B0u b\u1EB1ng li\xEAn k\u1EBFt.",
  optionsNotionUploadMediaLocked: "T\u1EA3i media do Notion qu\u1EA3n l\xFD ch\u1EC9 c\xF3 trong Pro.",
  optionsNotionTokenRequired: "C\u1EA7n c\xF3 token t\xEDch h\u1EE3p Notion \u0111\u1EC3 s\u1EED d\u1EE5ng l\u01B0u v\xE0o Notion.",
  optionsNotionParentPageRequired: "C\u1EA7n c\xF3 ID ho\u1EB7c URL c\u1EE7a trang cha Notion \u0111\u1EC3 s\u1EED d\u1EE5ng l\u01B0u v\xE0o Notion.",
  optionsNotionInvalidPage: "\u0110\u1ECBnh d\u1EA1ng ID ho\u1EB7c URL trang cha Notion kh\xF4ng h\u1EE3p l\u1EC7.",
  optionsNotionDataSourceRequired: "C\u1EA7n c\xF3 ID ho\u1EB7c URL c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion \u0111\u1EC3 s\u1EED d\u1EE5ng l\u01B0u v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u.",
  optionsNotionInvalidDataSource: "\u0110\u1ECBnh d\u1EA1ng ID ho\u1EB7c URL c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion kh\xF4ng h\u1EE3p l\u1EC7.",
  optionsNotionPermissionDenied: "Quy\u1EC1n truy c\u1EADp API Notion \u0111\xE3 b\u1ECB t\u1EEB ch\u1ED1i n\xEAn c\xE0i \u0111\u1EB7t kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u.",
  optionsBasicSection: "L\u01B0u c\u01A1 b\u1EA3n",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "C\xE0i \u0111\u1EB7t Pro",
  optionsProSubtitle: "Ch\u1EC9 m\u1EDF khi c\u1EA7n. \u0110\xE2y l\xE0 n\u01A1i \u0111\u1EB7t c\xE1c quy t\u1EAFc v\xE0 ph\u1EA7n s\u1EAFp x\u1EBFp b\u1EB1ng AI.",
  optionsProAiNote: "AI kh\xF4ng \u0111\u01B0\u1EE3c \u0111i k\xE8m t\u1EF1 \u0111\u1ED9ng. N\xF3 ch\u1EC9 ho\u1EA1t \u0111\u1ED9ng sau khi b\u1EA1n th\xEAm kh\xF3a API c\u1EE7a ri\xEAng m\xECnh.",
  compareRowReplies: "Chu\u1ED7i tr\u1EA3 l\u1EDDi",
  compareRowDuplicates: "B\u1ECF qua tr\xF9ng l\u1EB7p",
  compareRowFilename: "\u0110\u1ECBnh d\u1EA1ng t\xEAn t\u1EC7p",
  compareRowFolder: "Quy t\u1EAFc \u0111\u01B0\u1EDDng d\u1EABn l\u01B0u",
  compareRowNotionDataSource: "C\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion",
  compareRowNotionMediaUpload: "T\u1EA3i media l\xEAn Notion",
  optionsProStatusFree: "B\u1EA1n \u0111ang \u1EDF g\xF3i Free. Vi\u1EC7c l\u01B0u \u0111\xE3 ho\u1EA1t \u0111\u1ED9ng s\u1EB5n v\xE0 ch\u1EC9 c\u1EA7n Pro khi b\u1EA1n mu\u1ED1n d\xF9ng quy t\u1EAFc ho\u1EB7c AI.",
  optionsProStatusActive: "Pro \u0111ang ho\u1EA1t \u0111\u1ED9ng. T\xEDnh n\u0103ng s\u1EAFp x\u1EBFp theo quy t\u1EAFc v\xE0 AI \u0111\xE3 c\xF3 \u1EDF b\xEAn d\u01B0\u1EDBi.",
  optionsProStatusExpired: "Kh\xF3a Pro n\xE0y \u0111\xE3 h\u1EBFt h\u1EA1n. Vi\u1EC7c l\u01B0u \u1EDF g\xF3i Free v\u1EABn ho\u1EA1t \u0111\u1ED9ng.",
  optionsProStatusInvalid: "Kh\xF3a Pro n\xE0y kh\xF4ng h\u1EE3p l\u1EC7. Vi\u1EC7c l\u01B0u \u1EDF g\xF3i Free v\u1EABn ho\u1EA1t \u0111\u1ED9ng.",
  optionsProStatusSeatLimit: "Kh\xF3a Pro n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t tr\xEAn 3 thi\u1EBFt b\u1ECB. H\xE3y gi\u1EA3i ph\xF3ng m\u1ED9t thi\u1EBFt b\u1ECB kh\xE1c tr\u01B0\u1EDBc.",
  optionsProStatusNeedsActivation: "Kh\xF3a Pro h\u1EE3p l\u1EC7, nh\u01B0ng thi\u1EBFt b\u1ECB n\xE0y v\u1EABn ch\u01B0a c\xF3 seat \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
  optionsProStatusOffline: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i \u0111\u1EBFn m\xE1y ch\u1EE7, v\xEC v\u1EADy tr\u1EA1ng th\xE1i k\xEDch ho\u1EA1t g\u1EA7n nh\u1EA5t s\u1EBD \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng.",
  optionsProStatusRevoked: "Kh\xF3a Pro n\xE0y kh\xF4ng c\xF2n d\xF9ng \u0111\u01B0\u1EE3c n\u1EEFa.",
  optionsProHolderLabel: "Ch\u1EE7 s\u1EDF h\u1EEFu",
  optionsProExpiresLabel: "H\u1EBFt h\u1EA1n",
  optionsProUnlockHint: "D\xE1n kh\xF3a Pro \u0111\u01B0\u1EE3c g\u1EEDi trong email mua h\xE0ng \u0111\u1EC3 k\xEDch ho\u1EA1t tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.",
  optionsProUnlockPlaceholder: "D\xE1n kh\xF3a Pro c\u1EE7a b\u1EA1n v\xE0o \u0111\xE2y",
  optionsProSalesLink: "Nh\u1EADn Pro",
  optionsProActivate: "K\xEDch ho\u1EA1t Pro",
  optionsProClear: "G\u1EE1 b\u1ECF",
  optionsProActivated: "\u0110\xE3 k\xEDch ho\u1EA1t Pro.",
  optionsProRemoved: "Kh\xF3a Pro \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EE1 b\u1ECF.",
  optionsProEmptyKey: "H\xE3y nh\u1EADp kh\xF3a Pro tr\u01B0\u1EDBc.",
  optionsProLocalOnly: "C\xE1c b\u1EA3n l\u01B0u v\xE0o Obsidian s\u1EBD \u1EDF l\u1EA1i tr\xEAn thi\u1EBFt b\u1ECB c\u1EE7a b\u1EA1n, c\xF2n Cloud save ch\u1EC9 g\u1EEDi m\u1ED9t b\xE0i vi\u1EBFt \u0111\u1EBFn t\xE0i kho\u1EA3n scrapbook c\u1EE7a b\u1EA1n khi b\u1EA1n ch\u1ECDn n\xF3.",
  optionsFileRules: "Quy t\u1EAFc t\u1EC7p",
  optionsFilenamePattern: "\u0110\u1ECBnh d\u1EA1ng t\xEAn t\u1EC7p",
  optionsFilenamePatternLocked: "G\xF3i Free d\xF9ng t\xEAn t\u1EC7p m\u1EB7c \u0111\u1ECBnh. Pro cho ph\xE9p b\u1EA1n t\u1EF1 \u0111\u1EB7t \u0111\u1ECBnh d\u1EA1ng.",
  optionsSavePathPattern: "\u0110\u01B0\u1EDDng d\u1EABn th\u01B0 m\u1EE5c con",
  optionsSavePathTokens: "V\xED d\u1EE5: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "G\xF3i Free l\u01B0u v\xE0o th\u01B0 m\u1EE5c g\u1ED1c c\u1EE7a th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i. Pro cho ph\xE9p t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp v\xE0o th\u01B0 m\u1EE5c con theo ng\xE0y, t\xE1c gi\u1EA3 ho\u1EB7c ch\u1EE7 \u0111\u1EC1.",
  optionsFilenameTokens: "C\xF3 s\u1EB5n: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "S\u1EAFp x\u1EBFp b\u1EB1ng AI",
  optionsAiSubtitle: "Ch\u1ECDn nh\xE0 cung c\u1EA5p v\xE0 URL g\u1ED1c m\u1EB7c \u0111\u1ECBnh c\xF9ng m\xF4 h\xECnh s\u1EBD \u0111\u01B0\u1EE3c \u0111i\u1EC1n s\u1EB5n cho b\u1EA1n.",
  optionsAiQuickstart: "H\u1EA7u h\u1EBFt m\u1ECDi ng\u01B0\u1EDDi ch\u1EC9 c\u1EA7n nh\xE0 cung c\u1EA5p v\xE0 kh\xF3a API. Sau khi thay \u0111\u1ED5i, h\xE3y nh\u1EA5n L\u01B0u c\xE0i \u0111\u1EB7t b\xEAn d\u01B0\u1EDBi \u0111\u1EC3 \xE1p d\u1EE5ng.",
  optionsAiAdvancedSummary: "Hi\u1EC7n c\xE0i \u0111\u1EB7t n\xE2ng cao",
  optionsAiEnable: "B\u1EADt s\u1EAFp x\u1EBFp b\u1EB1ng AI",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini v\xE0 Ollama \u0111\u1EC1u c\xF3 th\u1EC3 b\u1EAFt \u0111\u1EA7u t\u1EEB preset. Custom d\xE0nh cho m\u1ECDi endpoint t\u01B0\u01A1ng th\xEDch v\u1EDBi OpenAI.",
  optionsAiApiKeyHint: "Kh\xF3a Gemini th\u01B0\u1EDDng b\u1EAFt \u0111\u1EA7u b\u1EB1ng AIza, c\xF2n kh\xF3a OpenAI/OpenRouter/DeepSeek th\u01B0\u1EDDng b\u1EAFt \u0111\u1EA7u b\u1EB1ng sk-. Ch\u1EC9 \u0111\u1EC3 tr\u1ED1ng khi d\xF9ng endpoint c\u1EE5c b\u1ED9 nh\u01B0 Ollama m\xE0 kh\xF4ng c\u1EA7n kh\xF3a.",
  optionsAiApiKeyRequired: "Nh\xE0 cung c\u1EA5p \u0111\xE3 ch\u1ECDn y\xEAu c\u1EA7u kh\xF3a API.",
  optionsAiKeyMismatchGemini: "Gemini c\u1EA7n kh\xF3a API Google Gemini. Kh\xF3a hi\u1EC7n t\u1EA1i tr\xF4ng gi\u1ED1ng kh\xF3a t\u01B0\u01A1ng th\xEDch OpenAI.",
  optionsAiKeyMismatchOpenAi: "C\xE1c nh\xE0 cung c\u1EA5p OpenAI/OpenRouter/DeepSeek c\u1EA7n kh\xF3a ri\xEAng c\u1EE7a h\u1ECD, kh\xF4ng ph\u1EA3i kh\xF3a Gemini b\u1EAFt \u0111\u1EA7u b\u1EB1ng AIza.",
  optionsAiModel: "T\xEAn m\xF4 h\xECnh",
  optionsAiPrompt: "Prompt s\u1EAFp x\u1EBFp",
  optionsAiPromptHint: "H\xE3y m\xF4 t\u1EA3 \u0111\u1ED9 d\xE0i ph\u1EA7n t\xF3m t\u1EAFt, phong c\xE1ch tag v\xE0 c\xE1c tr\u01B0\u1EDDng frontmatter b\u1EA1n mu\u1ED1n.",
  optionsAiLocked: "S\u1EAFp x\u1EBFp b\u1EB1ng AI ch\u1EC9 c\xF3 trong Pro.",
  optionsAiInvalidBaseUrl: "AI Base URL kh\xF4ng h\u1EE3p l\u1EC7.",
  optionsAiPermissionDenied: "Quy\u1EC1n truy c\u1EADp \u0111\u1EBFn endpoint AI \u0111\xE3 ch\u1ECDn b\u1ECB t\u1EEB ch\u1ED1i n\xEAn c\xE0i \u0111\u1EB7t kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u.",
  optionsAiSaved: "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t AI v\xE0 quy\u1EC1n truy c\u1EADp endpoint.",
  optionsIncludeImages: "L\u01B0u h\xECnh \u1EA3nh v\xE0 t\u1EC7p video",
  optionsSave: "L\u01B0u c\xE0i \u0111\u1EB7t",
  optionsSaved: "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t.",
  optionsPendingSave: "C\xF3 thay \u0111\u1ED5i. H\xE3y nh\u1EA5n L\u01B0u c\xE0i \u0111\u1EB7t \u1EDF d\u01B0\u1EDBi \u0111\u1EC3 \xE1p d\u1EE5ng.",
  optionsNoChanges: "Ch\u01B0a c\xF3 thay \u0111\u1ED5i n\xE0o.",
  optionsStep1: "1. K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian",
  optionsStep2: "2. Th\u1EED l\u01B0u mi\u1EC5n ph\xED tr\u01B0\u1EDBc",
  optionsStep3: "3. K\xEDch ho\u1EA1t Pro khi b\u1EA1n mu\u1ED1n d\xF9ng quy t\u1EAFc ho\u1EB7c AI",
  mdImageLabel: "H\xECnh \u1EA3nh",
  mdVideoLabel: "Video",
  mdVideoThumbnailLabel: "\u1EA2nh thu nh\u1ECF video",
  mdVideoOnThreads: "M\u1EDF tr\xEAn Threads",
  mdSavedVideoFile: "T\u1EC7p video \u0111\xE3 l\u01B0u",
  mdReplySection: "Chu\u1ED7i tr\u1EA3 l\u1EDDi c\u1EE7a t\xE1c gi\u1EA3",
  mdReplyLabel: "Tr\u1EA3 l\u1EDDi",
  mdReplyImageLabel: "H\xECnh \u1EA3nh tr\u1EA3 l\u1EDDi",
  mdUploadedMediaSection: "Media \u0111\xE3 t\u1EA3i l\xEAn",
  mdSource: "Ngu\u1ED3n",
  mdAuthor: "T\xE1c gi\u1EA3",
  mdPublishedAt: "Th\u1EDDi \u0111i\u1EC3m \u0111\u0103ng",
  mdExternalLink: "Li\xEAn k\u1EBFt ngo\xE0i",
  mdWarning: "C\u1EA3nh b\xE1o",
  mdSummary: "T\xF3m t\u1EAFt AI",
  warnImageAccessFailed: "Kh\xF4ng th\u1EC3 l\u01B0u m\u1ED9t s\u1ED1 h\xECnh \u1EA3nh ho\u1EB7c video; c\xE1c li\xEAn k\u1EBFt g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.",
  warnImageDownloadOff: "T\xEDnh n\u0103ng l\u01B0u h\xECnh \u1EA3nh/video \u0111ang t\u1EAFt; c\xE1c li\xEAn k\u1EBFt g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.",
  warnAiFailed: "S\u1EAFp x\u1EBFp b\u1EB1ng AI th\u1EA5t b\u1EA1i n\xEAn ghi ch\xFA g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u: {reason}",
  warnAiPermissionMissing: "Thi\u1EBFu quy\u1EC1n cho endpoint AI n\xEAn ghi ch\xFA g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u. H\xE3y l\u01B0u l\u1EA1i ph\u1EA7n AI trong c\xE0i \u0111\u1EB7t.",
  warnAiMissingModel: "Ch\u01B0a c\u1EA5u h\xECnh t\xEAn m\xF4 h\xECnh AI n\xEAn ghi ch\xFA g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u.",
  warnNotionMediaUploadFailed: "T\u1EA3i media l\xEAn Notion th\u1EA5t b\u1EA1i n\xEAn c\xE1c li\xEAn k\u1EBFt t\u1EEB xa \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u thay th\u1EBF.",
  errBrowserUnsupported: "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng th\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
  errFolderNameFailed: "Kh\xF4ng th\u1EC3 x\xE1c \u0111\u1ECBnh t\xEAn th\u01B0 m\u1EE5c \u0111\u1EC3 l\u01B0u.",
  errInvalidPath: "\u0110\u01B0\u1EDDng d\u1EABn t\u1EC7p kh\xF4ng h\u1EE3p l\u1EC7.",
  errNotionTokenMissing: "Ch\u01B0a c\u1EA5u h\xECnh token t\xEDch h\u1EE3p Notion.",
  errNotionPermissionMissing: "Thi\u1EBFu quy\u1EC1n truy c\u1EADp API Notion. H\xE3y l\u01B0u l\u1EA1i c\xE0i \u0111\u1EB7t tr\u01B0\u1EDBc.",
  errNotionUnauthorized: "Token Notion kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n.",
  errNotionForbidden: "T\xEDch h\u1EE3p n\xE0y kh\xF4ng th\u1EC3 truy c\u1EADp \u0111\xEDch Notion \u0111\xE3 ch\u1ECDn. H\xE3y \u0111\u1EA3m b\u1EA3o trang ho\u1EB7c c\u01A1 s\u1EDF d\u1EEF li\u1EC7u \u0111\xE3 \u0111\u01B0\u1EE3c chia s\u1EBB v\u1EDBi t\xEDch h\u1EE3p.",
  errNotionParentNotFound: "Kh\xF4ng t\xECm th\u1EA5y trang ho\u1EB7c c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion \u0111\xE3 ch\u1ECDn. H\xE3y ki\u1EC3m tra ID v\xE0 k\u1EBFt n\u1ED1i.",
  errNotionRateLimited: "C\xF3 qu\xE1 nhi\u1EC1u y\xEAu c\u1EA7u \u0111\u1EBFn Notion. H\xE3y th\u1EED l\u1EA1i sau {seconds} gi\xE2y.",
  errNotionValidation: "Y\xEAu c\u1EA7u g\u1EEDi \u0111\u1EBFn Notion kh\xF4ng h\u1EE3p l\u1EC7.",
  errNotionRequestFailed: "Y\xEAu c\u1EA7u l\u01B0u v\xE0o Notion th\u1EA5t b\u1EA1i.",
  fallbackNoFolder: "Kh\xF4ng c\xF3 th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i,",
  fallbackPermissionDenied: "kh\xF4ng c\xF3 quy\u1EC1n v\u1EDBi th\u01B0 m\u1EE5c,",
  fallbackDirectFailed: "kh\xF4ng th\u1EC3 l\u01B0u v\xE0o th\u01B0 m\u1EE5c,",
  fallbackZipMessage: " n\xEAn \u0111\xE3 \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng d\u01B0\u1EDBi d\u1EA1ng t\u1EC7p.",
  errNotPermalink: "H\xE3y m\u1EDF trang b\xE0i vi\u1EBFt ri\xEAng l\u1EBB tr\u01B0\u1EDBc.",
  errPostContentNotFound: "Kh\xF4ng th\u1EC3 t\u1EA3i n\u1ED9i dung b\xE0i vi\u1EBFt. H\xE3y \u0111\u1EA3m b\u1EA3o b\u1EA1n \u0111\xE3 \u0111\u0103ng nh\u1EADp."
};
var dictionaries = {
  ko,
  en,
  ja,
  "pt-BR": ptBR,
  es,
  "zh-TW": zhTW,
  vi
};
var currentLocale = null;
function detectDefaultLocale() {
  return detectLocaleFromNavigator(typeof navigator !== "undefined" ? navigator.language : null, "en");
}
async function getLocale() {
  if (currentLocale) {
    return currentLocale;
  }
  try {
    const stored = await chrome.storage.local.get(LOCALE_KEY);
    const value = stored[LOCALE_KEY];
    if (isSupportedLocale(value)) {
      currentLocale = value;
      return value;
    }
  } catch {
  }
  currentLocale = detectDefaultLocale();
  return currentLocale;
}
async function t() {
  const locale = await getLocale();
  return dictionaries[locale];
}

// ../shared/src/config.ts
var BUNDLED_EXTRACTOR_CONFIG2 = {
  version: "2026-03-08",
  noisePatterns: ["\uBC88\uC5ED\uD558\uAE30", "\uB354 \uBCF4\uAE30", "\uC88B\uC544\uC694", "\uB313\uAE00", "\uB9AC\uD3EC\uC2A4\uD2B8", "\uACF5\uC720\uD558\uAE30"],
  maxRecentSaves: 10
};

// ../shared/src/utils.ts
var THREADS_PERMALINK_RE = /^https:\/\/www\.threads\.(?:com|net)\/@[^/]+\/post\/[^/?#]+/i;
function isSupportedPermalink(url) {
  return THREADS_PERMALINK_RE.test(url);
}
function normalizeThreadsUrl(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.search = "";
  parsed.hostname = "www.threads.com";
  parsed.pathname = parsed.pathname.replace(/(\/@[^/]+\/post\/[^/]+)\/media(?:\/.*)?$/i, "$1");
  return parsed.toString().replace(/\/$/, "");
}
function extractShortcode(url) {
  const match = normalizeThreadsUrl(url).match(/\/post\/([^/?#]+)/i);
  return match?.[1] ?? "";
}
function extractAuthorFromUrl(url) {
  const match = normalizeThreadsUrl(url).match(/\/@([^/]+)/i);
  return match?.[1] ?? "unknown";
}
function unwrapExternalUrl(url) {
  const parsed = new URL(url, "https://www.threads.com");
  const target = parsed.searchParams.get("u");
  if (target) {
    try {
      return decodeURIComponent(target);
    } catch {
      return target;
    }
  }
  if (parsed.hostname.endsWith("threads.com") || parsed.hostname.endsWith("threads.net")) {
    return null;
  }
  parsed.hash = "";
  return parsed.toString();
}
function dedupeStrings(values) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const value of values) {
    if (!value) {
      continue;
    }
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}
function decodeEscapedJsonString(value) {
  let current = value;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!/\\u[0-9a-fA-F]{4}|\\[nrt"\\/]/.test(current)) {
      return current;
    }
    try {
      const parsed = JSON.parse(`"${current}"`);
      if (parsed === current) {
        return current;
      }
      current = parsed;
      continue;
    } catch {
      current = current.replaceAll("\\n", "\n").replaceAll("\\r", "\r").replaceAll("\\t", "	").replaceAll('\\"', '"').replaceAll("\\\\", "\\");
    }
  }
  return current;
}
function cleanTextLines(text, author, config = BUNDLED_EXTRACTOR_CONFIG2) {
  const lines = dedupeStrings(
    text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  );
  const filtered = [];
  for (const line of lines) {
    if (line === author || line === `@${author}`) {
      continue;
    }
    if (line === "\uC2A4\uB808\uB4DC" || line === "\uC778\uAE30\uC21C" || line === "\uD65C\uB3D9 \uBCF4\uAE30" || /^조회\s+[\d.,]+(?:천|만)?회$/u.test(line) || /^Threads에 가입하여 .*$/u.test(line) || /^Threads에 가입해 .*$/u.test(line) || /^Threads에 로그인 또는 가입하기$/u.test(line) || /^사람들의 이야기를 확인하고 대화에 참여해보세요\.$/u.test(line)) {
      continue;
    }
    if (config.noisePatterns.some((pattern) => line === pattern || line.startsWith(`${pattern} `))) {
      break;
    }
    if (/^\d+\s*(초|분|시간|일|주|개월|년)$/.test(line)) {
      continue;
    }
    if (/^[\d.,]+(?:천|만)?$/u.test(line) || /^\d+\s*\/\s*\d+$/u.test(line) || line === "/") {
      continue;
    }
    filtered.push(line);
  }
  return filtered.join("\n\n").trim();
}
async function hashPost(post) {
  const payload = JSON.stringify({
    canonicalUrl: post.canonicalUrl,
    text: post.text,
    imageUrls: post.imageUrls,
    externalUrl: post.externalUrl,
    quotedPostUrl: post.quotedPostUrl,
    repliedToUrl: post.repliedToUrl,
    authorReplies: post.authorReplies
  });
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

// src/lib/extractor.ts
function getMeta(document2, selector) {
  return document2.querySelector(selector)?.content?.trim() ?? null;
}
function getCanonicalUrl(document2, pageUrl) {
  const pageShortcode = extractShortcode(pageUrl);
  if (pageShortcode && isSupportedPermalink(pageUrl)) {
    try {
      return normalizeThreadsUrl(pageUrl);
    } catch {
    }
  }
  const candidates = [
    document2.querySelector('link[rel="canonical"]')?.href ?? null,
    getMeta(document2, 'meta[property="og:url"]'),
    pageUrl
  ];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      const normalized = normalizeThreadsUrl(candidate);
      if (!isSupportedPermalink(normalized)) {
        continue;
      }
      if (pageShortcode && extractShortcode(normalized) !== pageShortcode) {
        continue;
      }
      return normalized;
    } catch {
      continue;
    }
  }
  return normalizeThreadsUrl(pageUrl);
}
function getStructuredText(document2, shortcode) {
  const candidates = [];
  for (const script of document2.scripts) {
    const content = script.textContent;
    if (!content || !content.includes(shortcode) || !content.includes('"text"')) {
      continue;
    }
    const shortcodeIndexes = Array.from(content.matchAll(new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).map(
      (match) => match.index ?? 0
    );
    const matches = content.matchAll(/"text":"((?:[^"\\]|\\.)+)"/g);
    for (const match of matches) {
      const raw = match[1];
      const decoded = decodeEscapedJsonString(raw);
      if (decoded.length > 12) {
        const matchIndex = match.index ?? 0;
        const distance = shortcodeIndexes.length > 0 ? Math.min(...shortcodeIndexes.map((index) => Math.abs(index - matchIndex))) : Number.MAX_SAFE_INTEGER;
        candidates.push({
          text: decoded,
          distance,
          length: decoded.length
        });
      }
    }
  }
  return candidates.sort((a, b) => {
    if (Math.abs(a.length - b.length) > 20) {
      return b.length - a.length;
    }
    return a.distance - b.distance;
  })[0]?.text ?? null;
}
function countActionButtons(root) {
  return Array.from(root.querySelectorAll("button")).filter(
    (button) => /(좋아요|댓글|리포스트|공유하기)/u.test((button.getAttribute("aria-label") ?? button.textContent ?? "").trim())
  ).length;
}
function countPermalinkLinks(root) {
  return dedupeStrings(
    Array.from(root.querySelectorAll('a[href*="/post/"]')).map((anchor) => {
      try {
        return normalizeThreadsUrl(anchor.href);
      } catch {
        return null;
      }
    })
  ).length;
}
function scorePostBlockCandidate(root) {
  const textLength = Math.min((root.innerText || root.textContent || "").trim().length, 320);
  const timeCount = root.querySelectorAll("time").length;
  const permalinkCount = countPermalinkLinks(root);
  const buttonCount = countActionButtons(root);
  const mediaCount = root.querySelectorAll("img, video").length;
  const hasAuthorBadge = (root.innerText || root.textContent || "").includes("\uC791\uC131\uC790");
  let score = textLength;
  if (timeCount === 1) {
    score += 120;
  } else if (timeCount > 1) {
    score -= Math.min((timeCount - 1) * 80, 240);
  }
  if (permalinkCount === 1) {
    score += 120;
  } else if (permalinkCount > 1) {
    score -= Math.min((permalinkCount - 1) * 80, 240);
  }
  if (buttonCount >= 2) {
    score += 60;
  } else if (buttonCount === 1) {
    score += 20;
  }
  if (mediaCount > 0) {
    score += 10;
  }
  if (hasAuthorBadge) {
    score += 20;
  }
  return score;
}
function findPostBlockFromAnchor(anchor) {
  let current = anchor;
  let bestCandidate = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  while (current && current !== anchor.ownerDocument.body) {
    const textLength = (current.innerText || current.textContent || "").trim().length;
    const permalinkCount = countPermalinkLinks(current);
    const timeCount = current.querySelectorAll("time").length;
    if (timeCount >= 1 && textLength > 12 && permalinkCount >= 1) {
      const score = scorePostBlockCandidate(current);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = current;
      }
    }
    current = current.parentElement;
  }
  return bestCandidate;
}
function findPostRoot(document2, canonicalUrl, shortcode) {
  if (!shortcode) {
    return null;
  }
  const anchors = Array.from(document2.querySelectorAll(`a[href*="/post/${shortcode}"]`)).sort((left, right) => {
    const leftHasTime = Number(Boolean(left.querySelector("time")));
    const rightHasTime = Number(Boolean(right.querySelector("time")));
    return rightHasTime - leftHasTime;
  });
  const normalizedTarget = normalizeThreadsUrl(canonicalUrl);
  for (const anchor of anchors) {
    const href = anchor.href ? normalizeThreadsUrl(anchor.href) : "";
    if (href && href !== normalizedTarget) {
      continue;
    }
    const postBlock = findPostBlockFromAnchor(anchor);
    if (postBlock) {
      return postBlock;
    }
  }
  return null;
}
function getVisibleImages(root, author) {
  if (!root) {
    return [];
  }
  const urls = Array.from(root.querySelectorAll("img")).filter((img) => {
    const src = img.currentSrc || img.src;
    if (!src || !src.startsWith("http")) {
      return false;
    }
    const alt = img.alt.trim();
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (alt.includes("\uD504\uB85C\uD544 \uC0AC\uC9C4") || alt.includes(author)) {
      return false;
    }
    return width >= 140 || height >= 140;
  }).map((img) => img.currentSrc || img.src);
  if (urls.length > 0) {
    return dedupeStrings(urls);
  }
  return [];
}
function getVideoUrl(root) {
  if (!root) {
    return null;
  }
  const videos = Array.from(root.querySelectorAll("video"));
  for (const video of videos) {
    const candidates = [
      video.currentSrc,
      video.src,
      ...Array.from(video.querySelectorAll("source")).map((source) => source.src)
    ];
    for (const candidate of candidates) {
      const value = candidate?.trim();
      if (value && /^https?:\/\//i.test(value)) {
        return value;
      }
    }
  }
  return null;
}
function getVideoPosterUrl(root) {
  if (!root) {
    return null;
  }
  const poster = root.querySelector("video")?.getAttribute("poster")?.trim();
  return poster && /^https?:\/\//i.test(poster) ? poster : null;
}
function getExternalUrl(root) {
  if (!root) {
    return null;
  }
  const anchors = Array.from(root.querySelectorAll("a[href]"));
  const external = anchors.find((anchor) => {
    try {
      return Boolean(unwrapExternalUrl(anchor.href));
    } catch {
      return false;
    }
  });
  return external ? unwrapExternalUrl(external.href) : null;
}
function getRelatedPostUrls(root, canonicalUrl) {
  if (!root) {
    return { quotedPostUrl: null, repliedToUrl: null };
  }
  const links = dedupeStrings(
    Array.from(root.querySelectorAll('a[href*="/post/"]')).map((anchor) => {
      try {
        const normalized = normalizeThreadsUrl(anchor.href);
        return normalized === canonicalUrl ? null : normalized;
      } catch {
        return null;
      }
    })
  );
  return {
    quotedPostUrl: links[0] ?? null,
    repliedToUrl: links[1] ?? null
  };
}
function getPublishedAt(root, document2, shortcode) {
  const rootTime = root?.querySelector("time")?.getAttribute("datetime");
  if (rootTime) {
    return rootTime;
  }
  if (!shortcode) {
    return null;
  }
  const permalinkTime = document2.querySelector(`a[href*="/post/${shortcode}"] time`);
  return permalinkTime?.getAttribute("datetime") ?? null;
}
function detectSourceType(imageUrls, scope, videoUrl, videoPosterUrl) {
  if (scope?.querySelector("video") && (videoUrl || videoPosterUrl)) {
    return "video";
  }
  if (imageUrls.length > 0) {
    return "image";
  }
  return "text";
}
function trimKeyword(keyword, maxLength = 38) {
  if (keyword.length <= maxLength) {
    return keyword;
  }
  const sliced = keyword.slice(0, maxLength);
  const boundary = Math.max(sliced.lastIndexOf(" "), sliced.lastIndexOf(","), sliced.lastIndexOf("\xB7"));
  return (boundary >= 16 ? sliced.slice(0, boundary) : sliced).trim();
}
function getPostTitle(_document, author, text, _externalUrl) {
  const firstLine = text.replace(/\s+/g, " ").trim().split(/[.!?\n]/)[0]?.trim();
  if (firstLine && firstLine.length > 2) {
    return trimKeyword(firstLine);
  }
  return author;
}
function extractDomText(root, author, config) {
  if (!root) {
    return "";
  }
  const nodeFilter = root.ownerDocument.defaultView?.NodeFilter;
  const walker = root.ownerDocument.createTreeWalker(root, nodeFilter?.SHOW_TEXT ?? 4);
  const lines = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode.textContent?.trim();
    const parent = currentNode.parentElement;
    if (text && parent && !parent.closest("button, time, a, script, style, svg, video, picture, figure, img")) {
      lines.push(text);
    }
    currentNode = walker.nextNode();
  }
  return cleanTextLines(lines.join("\n\n"), author, config);
}
function isNodeAfter(referenceNode, targetNode) {
  const nodeCtor = referenceNode.ownerDocument?.defaultView?.Node;
  if (!nodeCtor) {
    return false;
  }
  return Boolean(referenceNode.compareDocumentPosition(targetNode) & nodeCtor.DOCUMENT_POSITION_FOLLOWING);
}
function extractAuthorReplies(document2, root, author, canonicalUrl, config) {
  if (!root) {
    return [];
  }
  const anchors = Array.from(document2.querySelectorAll('a[href*="/post/"]'));
  const seenBlocks = /* @__PURE__ */ new Set();
  const orderedBlocks = [];
  for (const anchor of anchors) {
    if (!isNodeAfter(root, anchor)) {
      continue;
    }
    let normalizedUrl;
    try {
      normalizedUrl = normalizeThreadsUrl(anchor.href);
    } catch {
      continue;
    }
    if (normalizedUrl === canonicalUrl) {
      continue;
    }
    const block = findPostBlockFromAnchor(anchor);
    if (!block || root.contains(block) || seenBlocks.has(block)) {
      continue;
    }
    seenBlocks.add(block);
    orderedBlocks.push({
      block,
      url: normalizedUrl,
      blockAuthor: extractAuthorFromUrl(normalizedUrl)
    });
  }
  const replies = [];
  let startedChain = false;
  for (const candidate of orderedBlocks) {
    if (candidate.blockAuthor !== author) {
      if (startedChain) {
        break;
      }
      continue;
    }
    startedChain = true;
    const text = extractDomText(candidate.block, author, config);
    if (!text || text.startsWith("\uC774\uC804 \uAE00")) {
      continue;
    }
    const imageUrls = getVisibleImages(candidate.block, author);
    const videoUrl = getVideoUrl(candidate.block);
    const videoPosterUrl = getVideoPosterUrl(candidate.block);
    const sourceType = detectSourceType(imageUrls, candidate.block, videoUrl, videoPosterUrl);
    replies.push({
      author: candidate.blockAuthor,
      canonicalUrl: candidate.url,
      shortcode: extractShortcode(candidate.url),
      text,
      publishedAt: getPublishedAt(candidate.block, document2, extractShortcode(candidate.url)),
      sourceType,
      imageUrls,
      videoUrl,
      externalUrl: getExternalUrl(candidate.block),
      thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? imageUrls[0] ?? null : imageUrls[0] ?? null
    });
  }
  return replies;
}
async function extractPostFromDocument(document2, pageUrl, config = BUNDLED_EXTRACTOR_CONFIG) {
  if (!isSupportedPermalink(pageUrl)) {
    throw new Error((await t()).errNotPermalink);
  }
  const canonicalUrl = getCanonicalUrl(document2, pageUrl);
  const shortcode = extractShortcode(canonicalUrl);
  const author = extractAuthorFromUrl(canonicalUrl);
  const root = findPostRoot(document2, canonicalUrl, shortcode);
  const structuredText = getStructuredText(document2, shortcode);
  const ogDescription = getMeta(document2, 'meta[property="og:description"]');
  const domText = extractDomText(root, author, config);
  const rawText = domText || structuredText || ogDescription || "";
  const text = cleanTextLines(rawText, author, config) || ogDescription || "";
  if (!text) {
    throw new Error((await t()).errPostContentNotFound);
  }
  const ogThumbnailUrl = getMeta(document2, 'meta[property="og:image"]');
  const imageUrls = getVisibleImages(root, author);
  const videoUrl = getVideoUrl(root);
  const videoPosterUrl = getVideoPosterUrl(root);
  const externalUrl = getExternalUrl(root);
  const related = getRelatedPostUrls(root, canonicalUrl);
  const title = getPostTitle(document2, author, text, externalUrl);
  const capturedAt = (/* @__PURE__ */ new Date()).toISOString();
  const sourceType = detectSourceType(imageUrls, root, videoUrl, videoPosterUrl);
  const authorReplies = extractAuthorReplies(document2, root, author, canonicalUrl, config);
  const partial = {
    canonicalUrl,
    shortcode,
    author,
    title,
    text,
    publishedAt: getPublishedAt(root, document2, shortcode),
    capturedAt,
    sourceType,
    imageUrls,
    videoUrl,
    externalUrl,
    quotedPostUrl: related.quotedPostUrl,
    repliedToUrl: related.repliedToUrl,
    thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? ogThumbnailUrl ?? imageUrls[0] ?? null : ogThumbnailUrl,
    authorReplies,
    extractorVersion: config.version
  };
  return {
    ...partial,
    contentHash: await hashPost(partial)
  };
}

// src/lib/reply-surface.ts
function parseCompactNumber(raw) {
  const normalized = raw.replaceAll(",", "").trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(천|만)?$/u);
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  const unit = match[2];
  if (Number.isNaN(value)) {
    return null;
  }
  if (unit === "\uCC9C") {
    return Math.round(value * 1e3);
  }
  if (unit === "\uB9CC") {
    return Math.round(value * 1e4);
  }
  return Math.round(value);
}
function countUniquePermalinkUrls(document2) {
  return dedupeStrings(
    Array.from(document2.querySelectorAll('a[href*="/post/"]')).map((anchor) => {
      try {
        return normalizeThreadsUrl(anchor.href);
      } catch {
        return null;
      }
    })
  ).length;
}
function getCommentCountHint(document2, expectedUrl) {
  const shortcode = extractShortcode(expectedUrl);
  const permalinkAnchor = shortcode ? document2.querySelector(`a[href*="/post/${shortcode}"]`) : null;
  const scope = permalinkAnchor?.parentElement?.parentElement ?? document2.body;
  const controls = Array.from(scope.querySelectorAll("button, [role='button']"));
  for (const control of controls) {
    const label = (control.getAttribute("aria-label") ?? control.textContent ?? "").replace(/\s+/g, " ").trim();
    const match = label.match(/댓글\s*([\d.,]+(?:천|만)?)/u);
    if (!match) {
      continue;
    }
    return parseCompactNumber(match[1]);
  }
  return null;
}
function getLoadingMarkerCount(document2) {
  const bodyText = document2.body.innerText ?? document2.body.textContent ?? "";
  return (bodyText.match(/읽어들이는 중\.\.\./g) ?? []).length;
}
function getBodyText(document2) {
  return document2.body.innerText ?? document2.body.textContent ?? "";
}
async function waitForReplySurface(document2, expectedUrl, timeoutMs = 4500) {
  const commentCount = getCommentCountHint(document2, expectedUrl);
  if (!commentCount || commentCount <= 0) {
    return;
  }
  const initialPermalinkCount = countUniquePermalinkUrls(document2);
  const deadline = Date.now() + timeoutMs;
  let sawLoadingMarker = getLoadingMarkerCount(document2) > 0;
  const setTimer = document2.defaultView?.setTimeout.bind(document2.defaultView) ?? globalThis.setTimeout;
  while (Date.now() < deadline) {
    const nextPermalinkCount = countUniquePermalinkUrls(document2);
    if (nextPermalinkCount > initialPermalinkCount) {
      return;
    }
    const loadingMarkerCount = getLoadingMarkerCount(document2);
    if (loadingMarkerCount > 0) {
      sawLoadingMarker = true;
    } else if (sawLoadingMarker) {
      return;
    }
    if (getBodyText(document2).includes("\uB85C\uADF8\uC778\uD558\uC5EC \uB354 \uB9CE\uC740 \uB2F5\uAE00\uC744 \uD655\uC778\uD574\uBCF4\uC138\uC694.")) {
      return;
    }
    await new Promise((resolve) => setTimer(resolve, 250));
  }
}

// src/content.ts
function getMetaContent(selector) {
  return document.querySelector(selector)?.content?.trim() ?? null;
}
function getCanonicalCandidate() {
  return document.querySelector('link[rel="canonical"]')?.href ?? getMetaContent('meta[property="og:url"]');
}
function matchesExpectedPermalink(candidate, expectedUrl) {
  if (!candidate) {
    return false;
  }
  try {
    return normalizeThreadsUrl(candidate) === normalizeThreadsUrl(expectedUrl);
  } catch {
    return false;
  }
}
async function waitForPostSurface(expectedUrl, timeoutMs = 1500) {
  const shortcode = extractShortcode(expectedUrl);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const hasPermalinkAnchor = shortcode ? Boolean(document.querySelector(`a[href*="/post/${shortcode}"]`)) : false;
    if (hasPermalinkAnchor || matchesExpectedPermalink(getCanonicalCandidate(), expectedUrl)) {
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 150));
  }
}
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "ping-content-script") {
    sendResponse({ ok: true });
    return false;
  }
  if (request.type !== "extract-post") {
    return false;
  }
  void waitForPostSurface(location.href).then(() => waitForReplySurface(document, location.href)).then(() => extractPostFromDocument(document, location.href, request.config)).then((post) => sendResponse(post)).catch((error) => {
    sendResponse({ __error: error instanceof Error ? error.message : "Extraction failed." });
  });
  return true;
});
