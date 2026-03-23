export type Locale = "ko" | "en";

const LOCALE_KEY = "app-locale";

export interface Messages {
    uiLanguageLabel: string;
    uiLanguageKo: string;
    uiLanguageEn: string;
    // popup
    popupTitle: string;
    popupSave: string;
    popupSettings: string;
    popupPromoTitle: string;
    popupPromoDescription: string;
    popupSubtitleDirect: string;
    popupSubtitleDownload: string;
    popupSubtitleConnected: string;
    popupSubtitlePermissionCheck: string;
    popupSubtitleNoFolder: string;
    popupSubtitleUnsupported: string;
    popupSubtitleNotion: string;
    popupSubtitleNotionSetup: string;
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
    statusSavedNotion: string;
    statusDuplicate: string;
    statusDuplicateWarning: string;
    statusAlreadySaved: string;
    statusNotionSetupRequired: string;
    statusError: string;
    statusResaving: string;
    statusResaved: string;
    statusResavedNotion: string;
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
    optionsPlanSpotlightFreeTitle: string;
    optionsPlanSpotlightFreeCopy: string;
    optionsPlanSpotlightActiveTitle: string;
    optionsPlanSpotlightActiveCopy: string;
    optionsPlanSpotlightNeedsActivationTitle: string;
    optionsPlanSpotlightNeedsActivationCopy: string;
    optionsPlanSpotlightSeatMeta: string;
    optionsAdSlotLabel: string;
    optionsAdSlotTitle: string;
    optionsAdSlotCopy: string;
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
    optionsFolderConnectedSuccess: string;
    optionsFolderPathLabel: string;
    optionsFolderPathHint: string;
    optionsFolderPathUnavailable: string;
    optionsSaveTarget: string;
    optionsSaveTargetHint: string;
    optionsSaveTargetObsidian: string;
    optionsSaveTargetNotion: string;
    optionsNotionSection: string;
    optionsNotionSubtitle: string;
    optionsNotionParentType: string;
    optionsNotionParentTypeHint: string;
    optionsNotionParentTypePage: string;
    optionsNotionParentTypeDataSource: string;
    optionsNotionToken: string;
    optionsNotionTokenHint: string;
    optionsNotionParentPage: string;
    optionsNotionParentPageHint: string;
    optionsNotionDataSource: string;
    optionsNotionDataSourceHint: string;
    optionsNotionTokenRequired: string;
    optionsNotionParentPageRequired: string;
    optionsNotionInvalidPage: string;
    optionsNotionDataSourceRequired: string;
    optionsNotionInvalidDataSource: string;
    optionsNotionPermissionDenied: string;
    optionsBasicSection: string;
    optionsBasicSubtitle: string;
    optionsCompareSection: string;
    optionsProSection: string;
    optionsProSubtitle: string;
    optionsProAiNote: string;
    optionsProCompareFree: string;
    optionsProComparePro: string;
    compareRowSave: string;
    compareRowImages: string;
    compareRowReplies: string;
    compareRowDuplicates: string;
    compareRowFilename: string;
    compareRowFolder: string;
    compareRowAiSummary: string;
    compareRowAiTags: string;
    compareRowAiFrontmatter: string;
    optionsProBadgeFree: string;
    optionsProBadgeActive: string;
    optionsProStatusFree: string;
    optionsProStatusActive: string;
    optionsProStatusExpired: string;
    optionsProStatusInvalid: string;
    optionsProStatusSeatLimit: string;
    optionsProStatusNeedsActivation: string;
    optionsProStatusOffline: string;
    optionsProStatusRevoked: string;
    optionsProHolderLabel: string;
    optionsProExpiresLabel: string;
    optionsProUnlockLabel: string;
    optionsProUnlockHint: string;
    optionsProUnlockPlaceholder: string;
    optionsProSalesLink: string;
    optionsProActivate: string;
    optionsProClear: string;
    optionsProActivated: string;
    optionsProRemoved: string;
    optionsProEmptyKey: string;
    optionsProLocalOnly: string;
    optionsFileRules: string;
    optionsFilenamePattern: string;
    optionsFilenamePatternLocked: string;
    optionsSavePathPattern: string;
    optionsSavePathTokens: string;
    optionsSavePathLocked: string;
    optionsFilenameTokens: string;
    optionsAiSection: string;
    optionsAiSubtitle: string;
    optionsAiQuickstart: string;
    optionsAiAdvancedSummary: string;
    optionsAiEnable: string;
    optionsAiProvider: string;
    optionsAiProviderHint: string;
    optionsAiProviderOpenAi: string;
    optionsAiProviderOpenRouter: string;
    optionsAiProviderDeepSeek: string;
    optionsAiProviderGemini: string;
    optionsAiProviderOllama: string;
    optionsAiProviderCustom: string;
    optionsAiApiKey: string;
    optionsAiApiKeyHint: string;
    optionsAiBaseUrl: string;
    optionsAiBaseUrlHint: string;
    optionsAiModel: string;
    optionsAiModelHint: string;
    optionsAiPrompt: string;
    optionsAiPromptHint: string;
    optionsAiLocked: string;
    optionsAiApiKeyRequired: string;
    optionsAiKeyMismatchGemini: string;
    optionsAiKeyMismatchOpenAi: string;
    optionsAiInvalidBaseUrl: string;
    optionsAiPermissionDenied: string;
    optionsAiSaved: string;
    optionsIncludeImages: string;
    optionsSave: string;
    optionsSaved: string;
    optionsPendingSave: string;
    optionsNoChanges: string;
    optionsStep1: string;
    optionsStep2: string;
    optionsStep3: string;
    // markdown
    mdImageLabel: string;
    mdVideoLabel: string;
    mdVideoThumbnailLabel: string;
    mdVideoOnThreads: string;
    mdSavedVideoFile: string;
    mdReplySection: string;
    mdReplyLabel: string;
    mdReplyImageLabel: string;
    mdSource: string;
    mdAuthor: string;
    mdPublishedAt: string;
    mdExternalLink: string;
    mdWarning: string;
    mdSummary: string;
    // package warnings
    warnImageAccessFailed: string;
    warnImageDownloadOff: string;
    warnAiFailed: string;
    warnAiPermissionMissing: string;
    warnAiMissingModel: string;
    // direct save errors
    errBrowserUnsupported: string;
    errFolderNameFailed: string;
    errInvalidPath: string;
    errNotionTokenMissing: string;
    errNotionPermissionMissing: string;
    errNotionUnauthorized: string;
    errNotionForbidden: string;
    errNotionParentNotFound: string;
    errNotionRateLimited: string;
    errNotionValidation: string;
    errNotionRequestFailed: string;
    // fallback
    fallbackNoFolder: string;
    fallbackPermissionDenied: string;
    fallbackDirectFailed: string;
    fallbackZipMessage: string;
    // extractor
    errNotPermalink: string;
    errPostContentNotFound: string;
}

const ko: Messages = {
    uiLanguageLabel: "언어",
    uiLanguageKo: "한국어",
    uiLanguageEn: "English",
    popupTitle: "현재 글 저장",
    popupSave: "현재 글 저장",
    popupSettings: "설정",
    popupPromoTitle: "향후 확장 영역",
    popupPromoDescription: "추후 안내와 추천이 들어갈 자리를 미리 확보해 두었습니다.",
    popupSubtitleDirect: "연결된 Obsidian 폴더에 바로 저장합니다.",
    popupSubtitleDownload: "저장 폴더가 없어 파일로 다운로드합니다. 설정에서 폴더를 연결하세요.",
    popupSubtitleConnected: "연결된 Obsidian 폴더에 바로 저장합니다.",
    popupSubtitlePermissionCheck: "연결된 폴더가 있지만 권한을 다시 확인할 수 있습니다.",
    popupSubtitleNoFolder: "연결된 폴더가 있으면 바로 저장하고, 없으면 파일로 다운로드합니다.",
    popupSubtitleUnsupported: "이 브라우저에서는 파일로 다운로드합니다.",
    popupSubtitleNotion: "설정한 Notion 대상에 새 페이지로 저장합니다.",
    popupSubtitleNotionSetup: "Notion 저장을 쓰려면 설정에서 토큰과 저장 대상을 먼저 입력하세요.",
    popupRecentSaves: "최근 저장",
    popupClearAll: "전체 삭제",
    popupEmpty: "아직 저장한 글이 없습니다.",
    popupResave: "다시 저장",
    popupExpand: "펼치기",
    popupCollapse: "접기",
    popupDelete: "삭제",
    statusReady: "개별 포스트 페이지에서 저장할 준비가 되었습니다.",
    statusReadyDirect: "준비 완료. 버튼을 누르면 연결된 Obsidian 폴더에 바로 저장합니다.",
    statusReadyDownload: "준비 완료. 버튼을 누르면 파일로 다운로드합니다.",
    statusUnsupported: "개별 포스트 페이지를 먼저 열어주세요.",
    statusNoTab: "활성 탭을 찾지 못했습니다.",
    statusSaving: "저장하는 중…",
    statusSavedDirect: "Obsidian 폴더에 바로 저장했습니다.",
    statusSavedZip: "저장 완료. 파일 다운로드를 시작했습니다.",
    statusSavedNotion: "Notion에 저장했습니다.",
    statusDuplicate: "이미 저장한 글이지만 최신 내용으로 덮어써 저장했습니다.",
    statusDuplicateWarning: "이미 저장한 글이지만 최신 내용으로 덮어써 저장했습니다: ",
    statusAlreadySaved: "이미 저장된 글입니다. 다시 저장하려면 최근 저장에서 '다시 저장'을 눌러주세요.",
    statusNotionSetupRequired: "Notion 저장을 사용하려면 설정에서 토큰과 저장 대상을 먼저 입력하세요.",
    statusError: "알 수 없는 오류가 발생했습니다.",
    statusResaving: "파일을 다시 만드는 중…",
    statusResaved: "다운로드를 다시 시작했습니다.",
    statusResavedNotion: "Notion에 새 페이지로 다시 저장했습니다.",
    statusRecentNotFound: "최근 저장 기록을 찾지 못했습니다.",
    statusDeletedRecent: "최근 저장에서 삭제했습니다.",
    statusClearedRecents: "최근 저장을 모두 삭제했습니다.",
    statusExtractFailed: "글 내용을 읽지 못했습니다.",
    statusTabError: "현재 탭 정보를 읽지 못했습니다.",
    statusRedownloadError: "다시 다운로드하는 중 오류가 발생했습니다.",
    statusRetry: "다시 시도",
    statusResaveButton: "다시 저장",
    optionsTitle: "Threads 글을 Obsidian 또는 Notion에 저장하고 규칙과 AI로 정리하세요.",
    optionsSubtitle: "무료 저장, 필요할 때만 Pro.",
    optionsPlanSpotlightFreeTitle: "Free",
    optionsPlanSpotlightFreeCopy: "기본 저장 기능을 바로 사용할 수 있습니다.",
    optionsPlanSpotlightActiveTitle: "Pro 활성화됨",
    optionsPlanSpotlightActiveCopy: "이 브라우저에서 Pro 기능을 사용할 수 있습니다.",
    optionsPlanSpotlightNeedsActivationTitle: "Pro 활성화 필요",
    optionsPlanSpotlightNeedsActivationCopy: "키는 유효하지만 아직 이 기기 seat가 활성화되지 않았습니다.",
    optionsPlanSpotlightSeatMeta: "Seat {used}/{limit} · {device}",
    optionsAdSlotLabel: "Ad",
    optionsAdSlotTitle: "광고 자리",
    optionsAdSlotCopy: "추후 배너 또는 안내가 들어갈 자리입니다.",
    optionsFolderSection: "Obsidian 폴더 연결",
    optionsFolderStatus: "연결된 폴더를 확인하는 중입니다…",
    optionsFolderLabel: "현재 폴더",
    optionsFolderNotConnected: "아직 연결되지 않음",
    optionsFolderConnect: "폴더 연결",
    optionsFolderDisconnect: "연결 해제",
    optionsFolderUnsupported: "이 브라우저에서는 폴더 연결을 지원하지 않음",
    optionsFolderUnsupportedStatus: "이 브라우저에서는 폴더에 직접 저장할 수 없어 파일로 다운로드합니다.",
    optionsFolderNotConnectedStatus: "저장 폴더가 없습니다. 저장하면 파일로 다운로드됩니다.",
    optionsFolderReady: "폴더가 연결됐습니다. 저장 버튼을 누르면 바로 기록됩니다.",
    optionsFolderPermissionCheck: "폴더가 연결됐습니다. 다음 저장 시 폴더 접근 권한을 확인할 수 있습니다.",
    optionsFolderPermissionLost: "폴더 접근 권한이 없습니다. 폴더를 다시 연결해 주세요.",
    optionsFolderChecked: "폴더 연결을 확인했습니다. 저장 버튼을 누르면 바로 기록됩니다.",
    optionsFolderCancelled: "폴더 선택을 취소했습니다.",
    optionsFolderError: "폴더 연결 중 오류가 발생했습니다.",
    optionsFolderConnectedSuccess: "\"{folder}\" 폴더를 연결했습니다.",
    optionsFolderPathLabel: "현재 저장 위치",
    optionsFolderPathHint: "절대경로는 읽을 수 없어 연결된 폴더 기준으로만 표시합니다.",
    optionsFolderPathUnavailable: "폴더 연결 후 표시",
    optionsSaveTarget: "저장 대상",
    optionsSaveTargetHint: "PC에서는 Obsidian 또는 Notion 중 하나를 기본 저장 대상으로 선택합니다.",
    optionsSaveTargetObsidian: "Obsidian",
    optionsSaveTargetNotion: "Notion",
    optionsNotionSection: "Notion 연결",
    optionsNotionSubtitle: "Notion은 API로 새 페이지를 만듭니다. parent page 저장과 data source 저장을 모두 지원합니다.",
    optionsNotionParentType: "저장 방식",
    optionsNotionParentTypeHint: "Page 아래 새 페이지를 만들거나, data source에 새 row/page를 만들 수 있습니다.",
    optionsNotionParentTypePage: "Parent page",
    optionsNotionParentTypeDataSource: "Data source",
    optionsNotionToken: "Integration token",
    optionsNotionTokenHint: "Notion internal integration 토큰을 넣습니다. 이 값은 현재 브라우저 프로필에만 저장됩니다.",
    optionsNotionParentPage: "Parent page ID 또는 URL",
    optionsNotionParentPageHint: "Notion 페이지 URL 전체를 붙여넣어도 되고, page ID만 넣어도 됩니다.",
    optionsNotionDataSource: "Data source ID 또는 URL",
    optionsNotionDataSourceHint: "Notion data source URL 전체 또는 data source ID를 넣습니다. 저장 시 제목/태그/날짜 같은 속성을 자동 매핑합니다.",
    optionsNotionTokenRequired: "Notion 저장을 쓰려면 integration token이 필요합니다.",
    optionsNotionParentPageRequired: "Notion 저장을 쓰려면 parent page ID 또는 URL이 필요합니다.",
    optionsNotionInvalidPage: "Notion parent page ID 또는 URL 형식이 올바르지 않습니다.",
    optionsNotionDataSourceRequired: "Notion data source 저장을 쓰려면 data source ID 또는 URL이 필요합니다.",
    optionsNotionInvalidDataSource: "Notion data source ID 또는 URL 형식이 올바르지 않습니다.",
    optionsNotionPermissionDenied: "Notion API 접근 권한을 허용하지 않아 저장하지 않았습니다.",
    optionsBasicSection: "기본 저장",
    optionsBasicSubtitle: "",
    optionsCompareSection: "Free vs Pro",
    optionsProSection: "Pro 설정",
    optionsProSubtitle: "필요할 때만 열어 설정하세요. 규칙과 AI 정리를 여기서 켭니다.",
    optionsProAiNote: "AI는 자동으로 제공되지 않습니다. 자신의 API 키를 넣어야 동작합니다.",
    optionsProCompareFree: "Free",
    optionsProComparePro: "Pro",
    compareRowSave: "저장",
    compareRowImages: "이미지 포함",
    compareRowReplies: "연속 답글",
    compareRowDuplicates: "중복 건너뜀",
    compareRowFilename: "파일 이름 규칙",
    compareRowFolder: "저장 폴더 지정",
    compareRowAiSummary: "AI 요약",
    compareRowAiTags: "AI 태그",
    compareRowAiFrontmatter: "AI frontmatter",
    optionsProBadgeFree: "Free",
    optionsProBadgeActive: "Pro",
    optionsProStatusFree: "지금은 Free 상태입니다. 저장은 그대로 되고, 필요할 때만 Pro를 켜면 됩니다.",
    optionsProStatusActive: "Pro 활성화됨. 아래 규칙과 AI 설정을 사용할 수 있습니다.",
    optionsProStatusExpired: "이 Pro 키는 만료되었습니다. Free 저장은 계속 사용할 수 있습니다.",
    optionsProStatusInvalid: "유효하지 않은 Pro 키입니다. Free 저장은 계속 사용할 수 있습니다.",
    optionsProStatusSeatLimit: "이 Pro 키는 이미 3대에서 활성화되어 있습니다. 다른 기기에서 먼저 해제해 주세요.",
    optionsProStatusNeedsActivation: "유효한 Pro 키이지만 아직 이 기기 seat가 활성화되지 않았습니다.",
    optionsProStatusOffline: "서버에 연결하지 못했지만, 최근 활성화 상태를 기준으로 계속 사용합니다.",
    optionsProStatusRevoked: "이 Pro 키는 더 이상 사용할 수 없습니다.",
    optionsProHolderLabel: "대상",
    optionsProExpiresLabel: "만료",
    optionsProUnlockLabel: "Pro 키 입력",
    optionsProUnlockHint: "구매 후 받은 Pro 키를 붙여넣으면 이 브라우저에서 바로 적용됩니다.",
    optionsProUnlockPlaceholder: "Pro 키를 붙여넣으세요",
    optionsProSalesLink: "Pro 구매하기",
    optionsProActivate: "Pro 활성화",
    optionsProClear: "제거",
    optionsProActivated: "Pro가 활성화됐습니다.",
    optionsProRemoved: "Pro 키를 제거했습니다.",
    optionsProEmptyKey: "먼저 Pro 키를 입력해 주세요.",
    optionsProLocalOnly: "저장한 글은 내 기기에만 보관되며, 로그인 없이 사용할 수 있습니다.",
    optionsFileRules: "파일 규칙",
    optionsFilenamePattern: "파일 이름 규칙",
    optionsFilenamePatternLocked: "Free는 기본 파일 이름으로 저장됩니다. Pro에서 원하는 규칙으로 바꿀 수 있습니다.",
    optionsSavePathPattern: "저장 폴더 경로",
    optionsSavePathTokens: "예시: Inbox/{date} · Threads/{author}",
    optionsSavePathLocked: "Free는 연결한 폴더에 바로 저장됩니다. Pro에서 날짜·작성자 기준으로 하위 폴더를 자동 지정할 수 있습니다.",
    optionsFilenameTokens: "사용 가능: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
    optionsAiSection: "AI 정리",
    optionsAiSubtitle: "Provider를 고르면 기본 Base URL과 모델이 자동으로 들어갑니다.",
    optionsAiQuickstart: "대부분은 Provider와 API 키만 선택하면 됩니다. 바꾼 뒤에는 아래에서 설정 저장을 눌러야 반영됩니다.",
    optionsAiAdvancedSummary: "고급 설정 열기",
    optionsAiEnable: "AI 정리 사용",
    optionsAiProvider: "Provider",
    optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini, Ollama는 preset으로 바로 시작할 수 있습니다. Custom은 OpenAI 호환 엔드포인트용입니다.",
    optionsAiProviderOpenAi: "OpenAI",
    optionsAiProviderOpenRouter: "OpenRouter",
    optionsAiProviderDeepSeek: "DeepSeek",
    optionsAiProviderGemini: "Gemini",
    optionsAiProviderOllama: "Ollama",
    optionsAiProviderCustom: "Custom",
    optionsAiApiKey: "API 키",
    optionsAiApiKeyHint: "Gemini 키는 보통 AIza..., OpenAI/OpenRouter/DeepSeek 키는 보통 sk-... 형태입니다. Ollama 같은 로컬 엔드포인트는 비워둘 수 있습니다.",
    optionsAiApiKeyRequired: "선택한 provider는 API 키가 필요합니다.",
    optionsAiKeyMismatchGemini: "Gemini provider에는 Google Gemini API 키가 필요합니다. 지금 키는 OpenAI-compatible 계열처럼 보입니다.",
    optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek provider에는 Gemini 키(AIza...)가 아니라 해당 provider 키를 넣어야 합니다.",
    optionsAiBaseUrl: "Base URL",
    optionsAiBaseUrlHint: "예시: https://api.openai.com/v1 · https://openrouter.ai/api/v1 · https://api.deepseek.com/v1 · http://localhost:11434/v1",
    optionsAiModel: "모델 이름",
    optionsAiModelHint: "예시: gpt-4.1-mini · openai/gpt-4.1-mini · llama3.2",
    optionsAiPrompt: "정리 규칙 프롬프트",
    optionsAiPromptHint: "요약 길이, 태그 스타일, 원하는 frontmatter 필드를 자유롭게 적어주세요.",
    optionsAiLocked: "AI 정리는 Pro에서만 사용할 수 있습니다.",
    optionsAiInvalidBaseUrl: "AI Base URL 형식이 올바르지 않습니다.",
    optionsAiPermissionDenied: "선택한 AI 엔드포인트 권한이 없어 저장하지 않았습니다.",
    optionsAiSaved: "AI 설정과 권한을 저장했습니다.",
    optionsIncludeImages: "이미지/동영상을 같이 저장",
    optionsSave: "설정 저장",
    optionsSaved: "설정을 저장했습니다.",
    optionsPendingSave: "변경됨. 아래 설정 저장을 눌러야 적용됩니다.",
    optionsNoChanges: "아직 변경 사항이 없습니다.",
    optionsStep1: "1. Obsidian 폴더 연결",
    optionsStep2: "2. 먼저 무료로 저장해보기",
    optionsStep3: "3. 규칙 또는 AI 정리가 필요하면 Pro 활성화",
    mdImageLabel: "이미지",
    mdVideoLabel: "동영상",
    mdVideoThumbnailLabel: "동영상 썸네일",
    mdVideoOnThreads: "Threads에서 보기",
    mdSavedVideoFile: "저장한 영상 파일",
    mdReplySection: "작성자 연속 답글",
    mdReplyLabel: "답글",
    mdReplyImageLabel: "답글 이미지",
    mdSource: "원문",
    mdAuthor: "작성자",
    mdPublishedAt: "게시 시각",
    mdExternalLink: "외부 링크",
    mdWarning: "경고",
    mdSummary: "AI 요약",
    warnImageAccessFailed: "일부 이미지/동영상을 저장하지 못해 원본 링크를 사용했습니다.",
    warnImageDownloadOff: "이미지/동영상 저장이 꺼져 있어 원본 링크를 사용했습니다.",
    warnAiFailed: "AI 정리에 실패해 원문만 저장했습니다: {reason}",
    warnAiPermissionMissing: "AI 엔드포인트 권한이 없어 원문만 저장했습니다. 설정에서 AI 섹션을 다시 저장해 주세요.",
    warnAiMissingModel: "AI 모델 이름이 없어 원문만 저장했습니다.",
    errBrowserUnsupported: "이 브라우저에서는 Obsidian 폴더에 바로 저장할 수 없습니다.",
    errFolderNameFailed: "저장할 폴더 이름을 결정하지 못했습니다.",
    errInvalidPath: "잘못된 파일 경로입니다.",
    errNotionTokenMissing: "Notion integration token이 없습니다.",
    errNotionPermissionMissing: "Notion API 권한이 없습니다. 설정에서 다시 저장해 주세요.",
    errNotionUnauthorized: "Notion 토큰이 유효하지 않거나 만료되었습니다.",
    errNotionForbidden: "선택한 Notion 대상에 접근 권한이 없습니다. page 또는 data source를 integration에 연결했는지 확인해 주세요.",
    errNotionParentNotFound: "선택한 Notion page 또는 data source를 찾지 못했습니다. ID와 연결 상태를 확인해 주세요.",
    errNotionRateLimited: "Notion 요청이 너무 많습니다. {seconds}초 후 다시 시도해 주세요.",
    errNotionValidation: "Notion 요청 형식이 올바르지 않습니다.",
    errNotionRequestFailed: "Notion 저장 요청에 실패했습니다.",
    fallbackNoFolder: "연결된 폴더가 없어",
    fallbackPermissionDenied: "폴더 권한이 없어",
    fallbackDirectFailed: "폴더에 저장하지 못해",
    fallbackZipMessage: " 파일로 다운로드했습니다.",
    errNotPermalink: "개별 포스트 페이지를 먼저 열어주세요.",
    errPostContentNotFound: "게시물 내용을 불러올 수 없습니다. 로그인 상태를 확인해 주세요."
};

const en: Messages = {
    uiLanguageLabel: "Language",
    uiLanguageKo: "한국어",
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
    statusSaving: "Saving…",
    statusSavedDirect: "Saved directly to your Obsidian folder.",
    statusSavedZip: "Saved. Download started.",
    statusSavedNotion: "Saved to Notion.",
    statusDuplicate: "Already saved — updated with the latest content.",
    statusDuplicateWarning: "Already saved, updated: ",
    statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
    statusNotionSetupRequired: "To use Notion saving, enter your token and destination in settings first.",
    statusError: "An unknown error occurred.",
    statusResaving: "Preparing your file…",
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
    optionsPlanSpotlightSeatMeta: "Seat {used}/{limit} · {device}",
    optionsAdSlotLabel: "Ad",
    optionsAdSlotTitle: "Ad placeholder",
    optionsAdSlotCopy: "Reserved for a future banner or announcement.",
    optionsFolderSection: "Connect Obsidian Folder",
    optionsFolderStatus: "Checking connected folder…",
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
    optionsFolderConnectedSuccess: "Connected the \"{folder}\" folder.",
    optionsFolderPathLabel: "Current Save Location",
    optionsFolderPathHint: "The browser cannot expose the OS absolute path, so this stays relative to the connected folder.",
    optionsFolderPathUnavailable: "Shown after you connect a folder",
    optionsSaveTarget: "Save target",
    optionsSaveTargetHint: "On PC, choose either Obsidian or Notion as the default destination.",
    optionsSaveTargetObsidian: "Obsidian",
    optionsSaveTargetNotion: "Notion",
    optionsNotionSection: "Notion Connection",
    optionsNotionSubtitle: "Notion creates new pages through the API. Both parent-page saving and data-source saving are supported.",
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
    optionsSavePathTokens: "Examples: Inbox/{date} · Threads/{author}",
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
    optionsAiBaseUrlHint: "Examples: https://api.openai.com/v1 · https://openrouter.ai/api/v1 · https://api.deepseek.com/v1 · http://localhost:11434/v1",
    optionsAiModel: "Model name",
    optionsAiModelHint: "Examples: gpt-4.1-mini · openai/gpt-4.1-mini · llama3.2",
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
