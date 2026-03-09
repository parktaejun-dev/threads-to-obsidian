export type Locale = "ko" | "en";

const LOCALE_KEY = "app-locale";

export interface Messages {
    // popup
    popupTitle: string;
    popupSave: string;
    popupSettings: string;
    popupSubtitleDirect: string;
    popupSubtitleDownload: string;
    popupSubtitleConnected: string;
    popupSubtitlePermissionCheck: string;
    popupSubtitleNoFolder: string;
    popupSubtitleUnsupported: string;
    popupRecentSaves: string;
    popupClearAll: string;
    popupEmpty: string;
    popupResave: string;
    popupExpand: string;
    popupCollapse: string;
    popupDelete: string;
    // status
    statusReady: string;
    statusReadyDirect: string;
    statusReadyDownload: string;
    statusUnsupported: string;
    statusNoTab: string;
    statusSaving: string;
    statusSavedDirect: string;
    statusSavedZip: string;
    statusDuplicate: string;
    statusDuplicateWarning: string;
    statusAlreadySaved: string;
    statusError: string;
    statusResaving: string;
    statusResaved: string;
    statusRecentNotFound: string;
    statusDeletedRecent: string;
    statusClearedRecents: string;
    statusExtractFailed: string;
    statusTabError: string;
    statusRedownloadError: string;
    statusRetry: string;
    statusResaveButton: string;
    // options
    optionsTitle: string;
    optionsSubtitle: string;
    optionsFolderSection: string;
    optionsFolderStatus: string;
    optionsFolderLabel: string;
    optionsFolderNotConnected: string;
    optionsFolderConnect: string;
    optionsFolderDisconnect: string;
    optionsFolderUnsupported: string;
    optionsFolderUnsupportedStatus: string;
    optionsFolderNotConnectedStatus: string;
    optionsFolderReady: string;
    optionsFolderPermissionCheck: string;
    optionsFolderPermissionLost: string;
    optionsFolderChecked: string;
    optionsFolderCancelled: string;
    optionsFolderError: string;
    optionsFileRules: string;
    optionsFilenamePattern: string;
    optionsFilenameTokens: string;
    optionsIncludeImages: string;
    optionsSave: string;
    optionsSaved: string;
    optionsNoChanges: string;
    optionsStep1: string;
    optionsStep2: string;
    optionsStep3: string;
    // markdown
    mdImageLabel: string;
    mdReplySection: string;
    mdReplyLabel: string;
    mdReplyImageLabel: string;
    mdSource: string;
    mdAuthor: string;
    mdPublishedAt: string;
    mdExternalLink: string;
    mdWarning: string;
    // package warnings
    warnImageAccessFailed: string;
    warnImageDownloadOff: string;
    // direct save errors
    errBrowserUnsupported: string;
    errFolderNameFailed: string;
    errInvalidPath: string;
    // fallback
    fallbackNoFolder: string;
    fallbackPermissionDenied: string;
    fallbackDirectFailed: string;
    fallbackZipMessage: string;
    // extractor
    errNotPermalink: string;
}

const ko: Messages = {
    popupTitle: "현재 글 저장",
    popupSave: "현재 글 저장",
    popupSettings: "설정",
    popupSubtitleDirect: "연결된 Obsidian 폴더에 바로 저장합니다.",
    popupSubtitleDownload: "연결된 폴더가 없어서 다운로드 파일로 저장합니다. 설정에서 폴더를 연결할 수 있습니다.",
    popupSubtitleConnected: "연결된 Obsidian 폴더에 바로 저장합니다.",
    popupSubtitlePermissionCheck: "연결된 폴더가 있지만 권한을 다시 확인할 수 있습니다.",
    popupSubtitleNoFolder: "연결된 폴더가 있으면 바로 저장하고, 없으면 다운로드 파일로 저장합니다.",
    popupSubtitleUnsupported: "이 브라우저에서는 다운로드 파일로 저장합니다.",
    popupRecentSaves: "최근 저장",
    popupClearAll: "전체 삭제",
    popupEmpty: "아직 저장한 글이 없습니다.",
    popupResave: "다시 저장",
    popupExpand: "펼치기",
    popupCollapse: "접기",
    popupDelete: "삭제",
    statusReady: "개별 포스트 페이지에서 저장할 준비가 되었습니다.",
    statusReadyDirect: "준비 완료. 버튼을 누르면 연결된 Obsidian 폴더에 바로 저장합니다.",
    statusReadyDownload: "준비 완료. 버튼을 누르면 다운로드 파일로 저장합니다.",
    statusUnsupported: "개별 포스트 페이지를 먼저 열어주세요.",
    statusNoTab: "활성 탭을 찾지 못했습니다.",
    statusSaving: "저장 작업을 시작합니다…",
    statusSavedDirect: "Obsidian 폴더에 바로 저장했습니다.",
    statusSavedZip: "저장 완료. ZIP 다운로드를 시작했습니다.",
    statusDuplicate: "이미 저장한 글이지만 최신 추출 결과로 다시 저장했습니다.",
    statusDuplicateWarning: "이미 저장한 글이지만 최신 추출 결과로 다시 저장했습니다: ",
    statusAlreadySaved: "이미 저장된 글입니다. 다시 저장하려면 최근 저장에서 '다시 저장'을 눌러주세요.",
    statusError: "알 수 없는 오류가 발생했습니다.",
    statusResaving: "저장된 메타데이터로 ZIP을 다시 만들고 있습니다…",
    statusResaved: "다시 다운로드를 시작했습니다.",
    statusRecentNotFound: "최근 저장 기록을 찾지 못했습니다.",
    statusDeletedRecent: "최근 저장에서 삭제했습니다.",
    statusClearedRecents: "최근 저장을 모두 삭제했습니다.",
    statusExtractFailed: "추출에 실패했습니다.",
    statusTabError: "활성 탭 정보를 읽지 못했습니다.",
    statusRedownloadError: "재다운로드 중 오류가 발생했습니다.",
    statusRetry: "다시 시도",
    statusResaveButton: "다시 저장",
    optionsTitle: "저장 설정",
    optionsSubtitle: "Obsidian 폴더를 한 번 연결하면 Threads 글을 vault 안에 바로 넣습니다.",
    optionsFolderSection: "Obsidian 폴더 연결",
    optionsFolderStatus: "연결된 폴더를 확인하는 중입니다…",
    optionsFolderLabel: "현재 폴더",
    optionsFolderNotConnected: "아직 연결되지 않음",
    optionsFolderConnect: "폴더 연결",
    optionsFolderDisconnect: "연결 해제",
    optionsFolderUnsupported: "이 브라우저에서는 폴더 연결을 지원하지 않음",
    optionsFolderUnsupportedStatus: "현재 브라우저에서는 폴더에 바로 저장할 수 없어 다운로드 파일로 저장합니다.",
    optionsFolderNotConnectedStatus: "아직 연결된 폴더가 없습니다. 저장 버튼을 누르면 다운로드 파일로 저장합니다.",
    optionsFolderReady: "준비 완료. 저장 버튼을 누르면 연결된 폴더에 바로 기록합니다.",
    optionsFolderPermissionCheck: "폴더는 연결되어 있습니다. 다음 저장 때 권한을 한 번 더 확인할 수 있습니다.",
    optionsFolderPermissionLost: "폴더 권한이 사라졌습니다. 저장 시 다시 요청하거나 폴더를 다시 연결해 주세요.",
    optionsFolderChecked: "폴더 연결 상태를 확인했습니다. 저장 시 바로 저장을 시도합니다.",
    optionsFolderCancelled: "폴더 선택을 취소했습니다.",
    optionsFolderError: "폴더 연결 중 오류가 발생했습니다.",
    optionsFileRules: "파일 저장 규칙",
    optionsFilenamePattern: "파일명 패턴",
    optionsFilenameTokens: "사용 가능한 토큰: {date}, {author}, {first_sentence}, {shortcode}",
    optionsIncludeImages: "이미지를 같이 저장",
    optionsSave: "설정 저장",
    optionsSaved: "설정을 저장했습니다.",
    optionsNoChanges: "아직 변경 사항이 없습니다.",
    optionsStep1: "1. Obsidian 폴더 연결",
    optionsStep2: "2. Threads 글 열기",
    optionsStep3: "3. 저장 버튼 누르기",
    mdImageLabel: "이미지",
    mdReplySection: "작성자 연속 답글",
    mdReplyLabel: "답글",
    mdReplyImageLabel: "답글 이미지",
    mdSource: "원문",
    mdAuthor: "작성자",
    mdPublishedAt: "게시 시각",
    mdExternalLink: "외부 링크",
    mdWarning: "경고",
    warnImageAccessFailed: "일부 이미지에 접근하지 못해 원격 URL을 사용했습니다.",
    warnImageDownloadOff: "이미지 다운로드가 꺼져 있어 원격 URL을 사용했습니다.",
    errBrowserUnsupported: "이 브라우저에서는 Obsidian 폴더에 바로 저장할 수 없습니다.",
    errFolderNameFailed: "저장할 폴더 이름을 결정하지 못했습니다.",
    errInvalidPath: "잘못된 파일 경로입니다.",
    fallbackNoFolder: "연결된 폴더가 없어",
    fallbackPermissionDenied: "폴더 권한이 없어",
    fallbackDirectFailed: "폴더에 저장하지 못해",
    fallbackZipMessage: " 다운로드 파일로 대신 저장했습니다.",
    errNotPermalink: "개별 포스트 페이지를 먼저 열어주세요."
};

const en: Messages = {
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
    statusSaving: "Starting save…",
    statusSavedDirect: "Saved directly to your Obsidian folder.",
    statusSavedZip: "Saved. ZIP download started.",
    statusDuplicate: "Already saved, but re-saved with the latest extraction.",
    statusDuplicateWarning: "Already saved, re-saved with latest extraction: ",
    statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
    statusError: "An unknown error occurred.",
    statusResaving: "Rebuilding ZIP from saved metadata…",
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
    optionsFolderStatus: "Checking connected folder…",
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

const dictionaries: Record<Locale, Messages> = { ko, en };

let currentLocale: Locale | null = null;

function detectDefaultLocale(): Locale {
    const lang = typeof navigator !== "undefined" ? navigator.language?.toLowerCase() ?? "" : "";
    return lang.startsWith("ko") ? "ko" : "en";
}

export async function getLocale(): Promise<Locale> {
    if (currentLocale) {
        return currentLocale;
    }

    try {
        const stored = await chrome.storage.local.get(LOCALE_KEY);
        const value = stored[LOCALE_KEY] as string | undefined;
        if (value === "ko" || value === "en") {
            currentLocale = value;
            return value;
        }
    } catch {
        // storage unavailable (e.g. content script context)
    }

    currentLocale = detectDefaultLocale();
    return currentLocale;
}

export async function setLocale(locale: Locale): Promise<void> {
    currentLocale = locale;
    await chrome.storage.local.set({ [LOCALE_KEY]: locale });
}

export async function t(): Promise<Messages> {
    const locale = await getLocale();
    return dictionaries[locale];
}

export function tSync(locale: Locale): Messages {
    return dictionaries[locale];
}
