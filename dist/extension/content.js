// src/extension/lib/config.ts
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

// src/extension/lib/i18n.ts
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
  popupRecentSaves: "\uCD5C\uADFC \uC800\uC7A5",
  popupClearAll: "\uC804\uCCB4 \uC0AD\uC81C",
  popupEmpty: "\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  popupResave: "\uB2E4\uC2DC \uC800\uC7A5",
  popupExpand: "\uD3BC\uCE58\uAE30",
  popupCollapse: "\uC811\uAE30",
  popupDelete: "\uC0AD\uC81C",
  statusReady: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uC5D0\uC11C \uC800\uC7A5\uD560 \uC900\uBE44\uAC00 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusReadyDirect: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusReadyDownload: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  statusUnsupported: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  statusNoTab: "\uD65C\uC131 \uD0ED\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusSaving: "\uC800\uC7A5\uD558\uB294 \uC911\u2026",
  statusSavedDirect: "Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedZip: "\uC800\uC7A5 \uC644\uB8CC. \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedNotion: "Notion\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicate: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicateWarning: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: ",
  statusAlreadySaved: "\uC774\uBBF8 \uC800\uC7A5\uB41C \uAE00\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC800\uC7A5\uD558\uB824\uBA74 \uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C '\uB2E4\uC2DC \uC800\uC7A5'\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694.",
  statusNotionSetupRequired: "Notion \uC800\uC7A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uC124\uC815\uC5D0\uC11C \uD1A0\uD070\uACFC \uC800\uC7A5 \uB300\uC0C1\uC744 \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
  statusError: "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusResaving: "\uD30C\uC77C\uC744 \uB2E4\uC2DC \uB9CC\uB4DC\uB294 \uC911\u2026",
  statusResaved: "\uB2E4\uC6B4\uB85C\uB4DC\uB97C \uB2E4\uC2DC \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusResavedNotion: "Notion\uC5D0 \uC0C8 \uD398\uC774\uC9C0\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusRecentNotFound: "\uCD5C\uADFC \uC800\uC7A5 \uAE30\uB85D\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusDeletedRecent: "\uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusClearedRecents: "\uCD5C\uADFC \uC800\uC7A5\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusExtractFailed: "\uAE00 \uB0B4\uC6A9\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusTabError: "\uD604\uC7AC \uD0ED \uC815\uBCF4\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusRedownloadError: "\uB2E4\uC2DC \uB2E4\uC6B4\uB85C\uB4DC\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusRetry: "\uB2E4\uC2DC \uC2DC\uB3C4",
  statusResaveButton: "\uB2E4\uC2DC \uC800\uC7A5",
  optionsTitle: "Threads \uAE00\uC744 Obsidian \uB610\uB294 Notion\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsSubtitle: "\uBB34\uB8CC \uC800\uC7A5, \uD544\uC694\uD560 \uB54C\uB9CC Pro.",
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
  optionsSaveTargetHint: "PC\uC5D0\uC11C\uB294 Obsidian \uB610\uB294 Notion \uC911 \uD558\uB098\uB97C \uAE30\uBCF8 \uC800\uC7A5 \uB300\uC0C1\uC73C\uB85C \uC120\uD0DD\uD569\uB2C8\uB2E4.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetNotion: "Notion",
  optionsNotionSection: "Notion \uC5F0\uACB0",
  optionsNotionSubtitle: "Notion\uC740 API\uB85C \uC0C8 \uD398\uC774\uC9C0\uB97C \uB9CC\uB4ED\uB2C8\uB2E4. Free\uB294 parent page \uC800\uC7A5, Pro\uB294 data source \uC800\uC7A5\uACFC \uB0B4\uBD80 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4.",
  optionsNotionParentType: "\uC800\uC7A5 \uBC29\uC2DD",
  optionsNotionParentTypeHint: "Page \uC544\uB798 \uC0C8 \uD398\uC774\uC9C0\uB97C \uB9CC\uB4E4\uAC70\uB098, data source\uC5D0 \uC0C8 row/page\uB97C \uB9CC\uB4E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionParentTypePage: "Parent page",
  optionsNotionParentTypeDataSource: "Data source",
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
  compareRowFolder: "\uC800\uC7A5 \uD3F4\uB354 \uC9C0\uC815",
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
  optionsProLocalOnly: "\uC800\uC7A5\uD55C \uAE00\uC740 \uB0B4 \uAE30\uAE30\uC5D0\uB9CC \uBCF4\uAD00\uB418\uBA70, \uB85C\uADF8\uC778 \uC5C6\uC774 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
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
  popupRecentSaves: "Recent Saves",
  popupClearAll: "Clear All",
  popupEmpty: "No saved posts yet.",
  popupResave: "Re-save",
  popupExpand: "Expand",
  popupCollapse: "Collapse",
  popupDelete: "Delete",
  statusReady: "Ready to save from a post permalink page.",
  statusReadyDirect: "Ready. Press to save directly to your Obsidian folder.",
  statusReadyDownload: "Ready. Press to download the file.",
  statusUnsupported: "Please open an individual post page first.",
  statusNoTab: "Could not find an active tab.",
  statusSaving: "Saving\u2026",
  statusSavedDirect: "Saved directly to your Obsidian folder.",
  statusSavedZip: "Saved. Download started.",
  statusSavedNotion: "Saved to Notion.",
  statusDuplicate: "Already saved \u2014 updated with the latest content.",
  statusDuplicateWarning: "Already saved, updated: ",
  statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
  statusNotionSetupRequired: "To use Notion saving, enter your token and destination in settings first.",
  statusError: "An unknown error occurred.",
  statusResaving: "Preparing your file\u2026",
  statusResaved: "Download started.",
  statusResavedNotion: "Saved to Notion as a new page.",
  statusRecentNotFound: "Could not find the recent save record.",
  statusDeletedRecent: "Deleted from recent saves.",
  statusClearedRecents: "All recent saves cleared.",
  statusExtractFailed: "Could not read the post.",
  statusTabError: "Could not read active tab information.",
  statusRedownloadError: "Error during re-download.",
  statusRetry: "Retry",
  statusResaveButton: "Re-save",
  optionsTitle: "Save Threads posts to Obsidian or Notion, with auto-organize.",
  optionsSubtitle: "Free saving, Pro only when needed.",
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
  optionsSaveTargetHint: "On PC, choose either Obsidian or Notion as the default destination.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetNotion: "Notion",
  optionsNotionSection: "Notion Connection",
  optionsNotionSubtitle: "Notion creates new pages through the API. Free supports parent-page saving, while Pro adds data-source saving and managed media uploads.",
  optionsNotionParentType: "Save mode",
  optionsNotionParentTypeHint: "Create a new page under a page, or create a new entry/page inside a data source.",
  optionsNotionParentTypePage: "Parent page",
  optionsNotionParentTypeDataSource: "Data source",
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
  compareRowFolder: "Save folder",
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
  optionsProLocalOnly: "Your posts stay on your device. No sign-in required.",
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
var dictionaries = { ko, en };
var currentLocale = null;
function detectDefaultLocale() {
  const lang = typeof navigator !== "undefined" ? navigator.language?.toLowerCase() ?? "" : "";
  return lang.startsWith("ko") ? "ko" : "en";
}
async function getLocale() {
  if (currentLocale) {
    return currentLocale;
  }
  try {
    const stored = await chrome.storage.local.get(LOCALE_KEY);
    const value = stored[LOCALE_KEY];
    if (value === "ko" || value === "en") {
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

// src/extension/lib/utils.ts
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
function cleanTextLines(text, author, config = BUNDLED_EXTRACTOR_CONFIG) {
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

// src/extension/lib/extractor.ts
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

// src/extension/lib/reply-surface.ts
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

// src/extension/content.ts
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
