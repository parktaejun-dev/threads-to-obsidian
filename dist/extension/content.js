// src/extension/lib/config.ts
var BUNDLED_EXTRACTOR_CONFIG = {
  version: "2026-03-08",
  noisePatterns: ["\uBC88\uC5ED\uD558\uAE30", "\uB354 \uBCF4\uAE30", "\uC88B\uC544\uC694", "\uB313\uAE00", "\uB9AC\uD3EC\uC2A4\uD2B8", "\uACF5\uC720\uD558\uAE30"],
  maxRecentSaves: 10
};

// src/extension/lib/i18n.ts
var LOCALE_KEY = "app-locale";
var ko = {
  popupTitle: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
  popupSave: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
  popupSettings: "\uC124\uC815",
  popupSubtitleDirect: "\uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitleDownload: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC5C6\uC5B4\uC11C \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uD3F4\uB354\uB97C \uC5F0\uACB0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  popupSubtitleConnected: "\uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitlePermissionCheck: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC788\uC9C0\uB9CC \uAD8C\uD55C\uC744 \uB2E4\uC2DC \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  popupSubtitleNoFolder: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC788\uC73C\uBA74 \uBC14\uB85C \uC800\uC7A5\uD558\uACE0, \uC5C6\uC73C\uBA74 \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitleUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupRecentSaves: "\uCD5C\uADFC \uC800\uC7A5",
  popupClearAll: "\uC804\uCCB4 \uC0AD\uC81C",
  popupEmpty: "\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  popupResave: "\uB2E4\uC2DC \uC800\uC7A5",
  popupExpand: "\uD3BC\uCE58\uAE30",
  popupCollapse: "\uC811\uAE30",
  popupDelete: "\uC0AD\uC81C",
  statusReady: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uC5D0\uC11C \uC800\uC7A5\uD560 \uC900\uBE44\uAC00 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusReadyDirect: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusReadyDownload: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusUnsupported: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  statusNoTab: "\uD65C\uC131 \uD0ED\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusSaving: "\uC800\uC7A5 \uC791\uC5C5\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4\u2026",
  statusSavedDirect: "Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedZip: "\uC800\uC7A5 \uC644\uB8CC. ZIP \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicate: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uCD94\uCD9C \uACB0\uACFC\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicateWarning: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uCD94\uCD9C \uACB0\uACFC\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: ",
  statusAlreadySaved: "\uC774\uBBF8 \uC800\uC7A5\uB41C \uAE00\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC800\uC7A5\uD558\uB824\uBA74 \uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C '\uB2E4\uC2DC \uC800\uC7A5'\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694.",
  statusError: "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusResaving: "\uC800\uC7A5\uB41C \uBA54\uD0C0\uB370\uC774\uD130\uB85C ZIP\uC744 \uB2E4\uC2DC \uB9CC\uB4E4\uACE0 \uC788\uC2B5\uB2C8\uB2E4\u2026",
  statusResaved: "\uB2E4\uC2DC \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusRecentNotFound: "\uCD5C\uADFC \uC800\uC7A5 \uAE30\uB85D\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusDeletedRecent: "\uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusClearedRecents: "\uCD5C\uADFC \uC800\uC7A5\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusExtractFailed: "\uCD94\uCD9C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  statusTabError: "\uD65C\uC131 \uD0ED \uC815\uBCF4\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusRedownloadError: "\uC7AC\uB2E4\uC6B4\uB85C\uB4DC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusRetry: "\uB2E4\uC2DC \uC2DC\uB3C4",
  statusResaveButton: "\uB2E4\uC2DC \uC800\uC7A5",
  optionsTitle: "\uC800\uC7A5 \uC124\uC815",
  optionsSubtitle: "Obsidian \uD3F4\uB354\uB97C \uD55C \uBC88 \uC5F0\uACB0\uD558\uBA74 Threads \uAE00\uC744 vault \uC548\uC5D0 \uBC14\uB85C \uB123\uC2B5\uB2C8\uB2E4.",
  optionsFolderSection: "Obsidian \uD3F4\uB354 \uC5F0\uACB0",
  optionsFolderStatus: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uB97C \uD655\uC778\uD558\uB294 \uC911\uC785\uB2C8\uB2E4\u2026",
  optionsFolderLabel: "\uD604\uC7AC \uD3F4\uB354",
  optionsFolderNotConnected: "\uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC74C",
  optionsFolderConnect: "\uD3F4\uB354 \uC5F0\uACB0",
  optionsFolderDisconnect: "\uC5F0\uACB0 \uD574\uC81C",
  optionsFolderUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD3F4\uB354 \uC5F0\uACB0\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC74C",
  optionsFolderUnsupportedStatus: "\uD604\uC7AC \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC5B4 \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  optionsFolderNotConnectedStatus: "\uC544\uC9C1 \uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  optionsFolderReady: "\uC900\uBE44 \uC644\uB8CC. \uC800\uC7A5 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uC5F0\uACB0\uB41C \uD3F4\uB354\uC5D0 \uBC14\uB85C \uAE30\uB85D\uD569\uB2C8\uB2E4.",
  optionsFolderPermissionCheck: "\uD3F4\uB354\uB294 \uC5F0\uACB0\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uC800\uC7A5 \uB54C \uAD8C\uD55C\uC744 \uD55C \uBC88 \uB354 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsFolderPermissionLost: "\uD3F4\uB354 \uAD8C\uD55C\uC774 \uC0AC\uB77C\uC84C\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uC2DC \uB2E4\uC2DC \uC694\uCCAD\uD558\uAC70\uB098 \uD3F4\uB354\uB97C \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsFolderChecked: "\uD3F4\uB354 \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uC2DC \uBC14\uB85C \uC800\uC7A5\uC744 \uC2DC\uB3C4\uD569\uB2C8\uB2E4.",
  optionsFolderCancelled: "\uD3F4\uB354 \uC120\uD0DD\uC744 \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.",
  optionsFolderError: "\uD3F4\uB354 \uC5F0\uACB0 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  optionsFileRules: "\uD30C\uC77C \uC800\uC7A5 \uADDC\uCE59",
  optionsFilenamePattern: "\uD30C\uC77C\uBA85 \uD328\uD134",
  optionsFilenameTokens: "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD1A0\uD070: {date}, {author}, {first_sentence}, {shortcode}",
  optionsIncludeImages: "\uC774\uBBF8\uC9C0\uB97C \uAC19\uC774 \uC800\uC7A5",
  optionsSave: "\uC124\uC815 \uC800\uC7A5",
  optionsSaved: "\uC124\uC815\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNoChanges: "\uC544\uC9C1 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsStep1: "1. Obsidian \uD3F4\uB354 \uC5F0\uACB0",
  optionsStep2: "2. Threads \uAE00 \uC5F4\uAE30",
  optionsStep3: "3. \uC800\uC7A5 \uBC84\uD2BC \uB204\uB974\uAE30",
  mdImageLabel: "\uC774\uBBF8\uC9C0",
  mdReplySection: "\uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
  mdReplyLabel: "\uB2F5\uAE00",
  mdReplyImageLabel: "\uB2F5\uAE00 \uC774\uBBF8\uC9C0",
  mdSource: "\uC6D0\uBB38",
  mdAuthor: "\uC791\uC131\uC790",
  mdPublishedAt: "\uAC8C\uC2DC \uC2DC\uAC01",
  mdExternalLink: "\uC678\uBD80 \uB9C1\uD06C",
  mdWarning: "\uACBD\uACE0",
  warnImageAccessFailed: "\uC77C\uBD80 \uC774\uBBF8\uC9C0\uC5D0 \uC811\uADFC\uD558\uC9C0 \uBABB\uD574 \uC6D0\uACA9 URL\uC744 \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
  warnImageDownloadOff: "\uC774\uBBF8\uC9C0 \uB2E4\uC6B4\uB85C\uB4DC\uAC00 \uAEBC\uC838 \uC788\uC5B4 \uC6D0\uACA9 URL\uC744 \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
  errBrowserUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  errFolderNameFailed: "\uC800\uC7A5\uD560 \uD3F4\uB354 \uC774\uB984\uC744 \uACB0\uC815\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  errInvalidPath: "\uC798\uBABB\uB41C \uD30C\uC77C \uACBD\uB85C\uC785\uB2C8\uB2E4.",
  fallbackNoFolder: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC5C6\uC5B4",
  fallbackPermissionDenied: "\uD3F4\uB354 \uAD8C\uD55C\uC774 \uC5C6\uC5B4",
  fallbackDirectFailed: "\uD3F4\uB354\uC5D0 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD574",
  fallbackZipMessage: " \uB2E4\uC6B4\uB85C\uB4DC \uD30C\uC77C\uB85C \uB300\uC2E0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  errNotPermalink: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694."
};
var en = {
  popupTitle: "Save Current Post",
  popupSave: "Save Current Post",
  popupSettings: "Settings",
  popupSubtitleDirect: "Saving directly to your connected Obsidian folder.",
  popupSubtitleDownload: "No folder connected. Saving as a download file. Connect a folder in settings.",
  popupSubtitleConnected: "Saving directly to your connected Obsidian folder.",
  popupSubtitlePermissionCheck: "Folder connected, but permission may need re-confirmation.",
  popupSubtitleNoFolder: "Saves directly when a folder is connected, otherwise downloads a file.",
  popupSubtitleUnsupported: "This browser only supports download file saves.",
  popupRecentSaves: "Recent Saves",
  popupClearAll: "Clear All",
  popupEmpty: "No saved posts yet.",
  popupResave: "Re-save",
  popupExpand: "Expand",
  popupCollapse: "Collapse",
  popupDelete: "Delete",
  statusReady: "Ready to save from a post permalink page.",
  statusReadyDirect: "Ready. Press to save directly to your Obsidian folder.",
  statusReadyDownload: "Ready. Press to save as a download file.",
  statusUnsupported: "Please open an individual post page first.",
  statusNoTab: "Could not find an active tab.",
  statusSaving: "Starting save\u2026",
  statusSavedDirect: "Saved directly to your Obsidian folder.",
  statusSavedZip: "Saved. ZIP download started.",
  statusDuplicate: "Already saved, but re-saved with the latest extraction.",
  statusDuplicateWarning: "Already saved, re-saved with latest extraction: ",
  statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
  statusError: "An unknown error occurred.",
  statusResaving: "Rebuilding ZIP from saved metadata\u2026",
  statusResaved: "Re-download started.",
  statusRecentNotFound: "Could not find the recent save record.",
  statusDeletedRecent: "Deleted from recent saves.",
  statusClearedRecents: "All recent saves cleared.",
  statusExtractFailed: "Extraction failed.",
  statusTabError: "Could not read active tab information.",
  statusRedownloadError: "Error during re-download.",
  statusRetry: "Retry",
  statusResaveButton: "Re-save",
  optionsTitle: "Save Settings",
  optionsSubtitle: "Connect your Obsidian folder once to save Threads posts directly into your vault.",
  optionsFolderSection: "Connect Obsidian Folder",
  optionsFolderStatus: "Checking connected folder\u2026",
  optionsFolderLabel: "Current Folder",
  optionsFolderNotConnected: "Not connected",
  optionsFolderConnect: "Connect Folder",
  optionsFolderDisconnect: "Disconnect",
  optionsFolderUnsupported: "Folder connection not supported in this browser",
  optionsFolderUnsupportedStatus: "This browser cannot save directly to a folder. Files will be downloaded instead.",
  optionsFolderNotConnectedStatus: "No folder connected yet. Files will be downloaded when you save.",
  optionsFolderReady: "Ready. Files will be saved directly to the connected folder.",
  optionsFolderPermissionCheck: "Folder is connected. Permission may be re-confirmed on next save.",
  optionsFolderPermissionLost: "Folder permission lost. Please reconnect or grant permission on next save.",
  optionsFolderChecked: "Folder connection verified. Direct save will be attempted.",
  optionsFolderCancelled: "Folder selection cancelled.",
  optionsFolderError: "Error connecting folder.",
  optionsFileRules: "File Save Rules",
  optionsFilenamePattern: "Filename Pattern",
  optionsFilenameTokens: "Available tokens: {date}, {author}, {first_sentence}, {shortcode}",
  optionsIncludeImages: "Save images together",
  optionsSave: "Save Settings",
  optionsSaved: "Settings saved.",
  optionsNoChanges: "No changes yet.",
  optionsStep1: "1. Connect Obsidian folder",
  optionsStep2: "2. Open a Threads post",
  optionsStep3: "3. Press Save",
  mdImageLabel: "Image",
  mdReplySection: "Author Replies",
  mdReplyLabel: "Reply",
  mdReplyImageLabel: "Reply image",
  mdSource: "Source",
  mdAuthor: "Author",
  mdPublishedAt: "Published at",
  mdExternalLink: "External link",
  mdWarning: "Warning",
  warnImageAccessFailed: "Some images could not be accessed; remote URLs were used.",
  warnImageDownloadOff: "Image download is off; remote URLs were used.",
  errBrowserUnsupported: "This browser cannot save directly to an Obsidian folder.",
  errFolderNameFailed: "Could not determine a folder name for saving.",
  errInvalidPath: "Invalid file path.",
  fallbackNoFolder: "No folder connected,",
  fallbackPermissionDenied: "No folder permission,",
  fallbackDirectFailed: "Could not save to folder,",
  fallbackZipMessage: " saved as download instead.",
  errNotPermalink: "Please open an individual post page first."
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
function detectSourceType(imageUrls, scope) {
  if (scope?.querySelector("video")) {
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
    replies.push({
      author: candidate.blockAuthor,
      canonicalUrl: candidate.url,
      shortcode: extractShortcode(candidate.url),
      text,
      publishedAt: getPublishedAt(candidate.block, document2, extractShortcode(candidate.url)),
      sourceType: detectSourceType(imageUrls, candidate.block),
      imageUrls,
      externalUrl: getExternalUrl(candidate.block),
      thumbnailUrl: imageUrls[0] ?? null
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
  const rawText = domText ?? structuredText ?? ogDescription ?? "";
  const text = cleanTextLines(rawText, author, config) || ogDescription || document2.title;
  const thumbnailUrl = getMeta(document2, 'meta[property="og:image"]');
  const imageUrls = getVisibleImages(root, author);
  const externalUrl = getExternalUrl(root);
  const related = getRelatedPostUrls(root, canonicalUrl);
  const title = getPostTitle(document2, author, text, externalUrl);
  const capturedAt = (/* @__PURE__ */ new Date()).toISOString();
  const sourceType = detectSourceType(imageUrls, root);
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
    externalUrl,
    quotedPostUrl: related.quotedPostUrl,
    repliedToUrl: related.repliedToUrl,
    thumbnailUrl,
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
