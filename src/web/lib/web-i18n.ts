export type WebLocale = "ko" | "en";

const LS_KEY = "web-locale";

export function getLocale(fallback: WebLocale = "ko"): WebLocale {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "ko" || v === "en") return v as WebLocale;
  } catch {}
  return fallback;
}

export function setLocale(locale: WebLocale): void {
  try {
    localStorage.setItem(LS_KEY, locale);
  } catch {}
}

export function applyTranslations(dict: Record<string, string>): void {
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = el.getAttribute("data-i18n")!;
    if (key in dict) el.textContent = dict[key];
  }
  for (const el of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-i18n-ph]")) {
    const key = el.getAttribute("data-i18n-ph")!;
    if (key in dict) el.placeholder = dict[key];
  }
}

export function applyLangToggle(locale: WebLocale): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-web-locale]")) {
    btn.classList.toggle("web-lang-btn-active", btn.dataset.webLocale === locale);
  }
}

export function bindLangToggle(onSwitch: (locale: WebLocale) => void): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-web-locale]")) {
    btn.addEventListener("click", () => {
      const next = btn.dataset.webLocale as WebLocale;
      if (next !== "ko" && next !== "en") return;
      setLocale(next);
      onSwitch(next);
    });
  }
}

// ─── Landing messages ────────────────────────────────────────────────────────

export type LandingMsg = {
  topbarCta: string;
  siteLabel: string;
  heroGuideCta: string;
  heroPurchaseCta: string;
  heroRailLabel1: string;
  heroRailText1: string;
  heroRailLabel2: string;
  heroRailText2: string;
  priceNote: string;
  priceSummary: string;
  pricePointFreeDesc: string;
  pricePointProDesc: string;
  primaryCta: string;
  secondaryCta: string;
  flowStep1: string;
  flowStep2: string;
  flowStep3: string;
  storyEyebrow: string;
  storyH2: string;
  storyP: string;
  guideInstallCta: string;
  guideUpgradeCta: string;
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  card3Title: string;
  card3Desc: string;
  showcaseH2: string;
  showcaseCopy: string;
  shotLargeCapTitle: string;
  shotLargeCapDesc: string;
  shotSmallCapTitle: string;
  shotSmallCapDesc: string;
  compFreeDesc: string;
  compProDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  commerceH2: string;
  commerceLead: string;
  commerceNote: string;
  formNameLabel: string;
  formEmailLabel: string;
  formMethodLabel: string;
  formNoteLabel: string;
  formSubmitBtn: string;
  formRemark: string;
  faqH2: string;
  phName: string;
  phNote: string;
  phMethod: string;
  methodBadge: string;
  compareH2: string;
  compareLead: string;
  compareColFeature: string;
  compareRowSavePost: string;
  compareRowImages: string;
  compareRowReplies: string;
  compareRowRules: string;
  compareRowAi: string;
  screenH2: string;
  screenUsageCaption: string;
  screenProCaption: string;
  langKo: string;
  langEn: string;
  orderSuccess1: string;
  orderNextStep: string;
  orderPayLink: string;
  orderFinal: string;
  footerPurchaseLink: string;
};

export const landingMessages: { ko: LandingMsg; en: LandingMsg } = {
  ko: {
    topbarCta: "설치 안내",
    siteLabel: "안내 주소",
    heroGuideCta: "설치 안내",
    heroPurchaseCta: "Pro 구매",
    heroRailLabel1: "Free",
    heroRailText1: "현재 글 저장, 이미지 포함, 작성자 연속 답글까지 바로 저장",
    heroRailLabel2: "Pro",
    heroRailText2: "파일명·경로 규칙과 내 LLM 키 기반 요약·태그를 적용",
    priceNote: "1회 결제",
    priceSummary: "Free로 충분하면 그대로 쓰고, 규칙 기반 정리와 AI 후처리가 필요할 때만 Pro를 붙이면 됩니다.",
    pricePointFreeDesc: "핵심 저장 흐름은 지금 바로 사용 가능합니다.",
    pricePointProDesc: "파일명·경로 규칙과 내 LLM 키 기반 요약·태그·frontmatter를 활성화합니다.",
    primaryCta: "Pro 구매 요청",
    secondaryCta: "실제 화면 보기",
    flowStep1: "먼저 Free로 저장 흐름을 확인",
    flowStep2: "규칙 기반 정리와 AI 정리가 필요하면 Pro 요청",
    flowStep3: "이메일로 Pro 키 전달",
    storyEyebrow: "Quick Start",
    storyH2: "설치부터 첫 저장까지 3단계면 끝납니다.",
    storyP: "압축해제 로드, Vault 연결, 저장까지 여기서 바로 확인하면 됩니다. 여기까지는 Free로 바로 쓸 수 있습니다.",
    guideInstallCta: "설치 안내 보기",
    guideUpgradeCta: "Pro 구매 요청",
    card1Title: "Chrome에 로드",
    card1Desc: "압축을 풀고 Chrome에서 dist/extension 폴더를 언팩드 확장으로 로드합니다.",
    card2Title: "Vault 연결",
    card2Desc: "옵션에서 Obsidian 폴더를 연결하면 마크다운과 미디어를 바로 저장합니다.",
    card3Title: "Threads에서 저장",
    card3Desc: "Threads 개별 글에서 저장을 누르면 됩니다. Pro에서는 규칙과 AI 정리까지 이어집니다.",
    showcaseH2: "확장 안에서 실제로 보이는 화면",
    showcaseCopy: "Free와 Pro의 차이를 직접 확인하세요.",
    shotLargeCapTitle: "Free 저장 흐름",
    shotLargeCapDesc: "핵심 저장 경험은 빠르고 단순하게 유지됩니다.",
    shotSmallCapTitle: "Pro 정리 자동화",
    shotSmallCapDesc: "원하는 규칙과 내 LLM 키 기반 요약·태그가 함께 적용됩니다.",
    compFreeDesc: "핵심 저장이 이미 완성된 기본 흐름",
    compProDesc: "파일명·경로 규칙과 AI 요약·태그·frontmatter를 추가하는 업그레이드",
    step1Title: "먼저 Free로 저장해봅니다",
    step1Desc: "현재 글 저장, 이미지 저장, 작성자 연속 답글 저장이 Free에서 바로 동작합니다.",
    step2Title: "정리 기준이 생기면 Pro로 올립니다",
    step2Desc: "파일명·경로 규칙이나 AI 요약·태그·frontmatter가 필요해질 때 Pro가 맞습니다.",
    step3Title: "Pro 키를 붙여 자동화를 켭니다",
    step3Desc: "결제 후 받은 Pro 키를 옵션 페이지에 넣으면 규칙 설정과 AI 정리 설정이 활성화됩니다.",
    commerceH2: "Pro 구매 요청",
    commerceLead: "결제수단을 선택하고 이메일을 남기면 Pro 키를 보냅니다.",
    commerceNote: "주문 요청 후 결제를 확인하는 방식으로 운영합니다.",
    formNameLabel: "이름",
    formEmailLabel: "이메일",
    formMethodLabel: "결제수단",
    formNoteLabel: "메모",
    formSubmitBtn: "구매 요청 보내기",
    formRemark: "결제 확인 후 Pro 키를 이메일로 보냅니다.",
    faqH2: "구매 전에 가장 많이 묻는 질문",
    phName: "홍길동",
    phNote: "세금계산서, 통화, 번들 요청 등이 있으면 적어주세요",
    phMethod: "결제수단을 선택하세요",
    methodBadge: "이용 가능",
    compareH2: "Free vs Pro",
    compareLead: "",
    compareColFeature: "기능",
    compareRowSavePost: "현재 글 저장",
    compareRowImages: "이미지 저장",
    compareRowReplies: "작성자 연속 답글",
    compareRowRules: "파일명 / 경로 규칙",
    compareRowAi: "내 LLM 키 요약 / 태그 / frontmatter",
    screenH2: "Preview",
    screenUsageCaption: "실사용 저장 화면",
    screenProCaption: "Pro 활성화 후 옵션 화면",
    langKo: "한국어",
    langEn: "English",
    orderSuccess1: "{email}로 요청이 접수됐습니다.",
    orderNextStep: "다음 단계: {instructions}",
    orderPayLink: "결제 링크: {url}",
    orderFinal: "결제 확인 후 Pro 키를 이메일로 보내드립니다.",
    footerPurchaseLink: "",
  },
  en: {
    topbarCta: "Install guide",
    siteLabel: "Guide URL",
    heroGuideCta: "Install guide",
    heroPurchaseCta: "Buy Pro",
    heroRailLabel1: "Free",
    heroRailText1: "Save the current post, include images, and capture author reply chains right away",
    heroRailLabel2: "Pro",
    heroRailText2: "Apply file/path rules plus summaries and tags with your own LLM key",
    priceNote: "one-time",
    priceSummary: "Stay on Free if that is enough. Add Pro only when you need rule-based organization and AI post-processing.",
    pricePointFreeDesc: "The core save flow is ready to use now.",
    pricePointProDesc: "Unlock file/path rules plus summaries, tags, and frontmatter using your own LLM key.",
    primaryCta: "Request Pro",
    secondaryCta: "See real screens",
    flowStep1: "Try the Free save flow first",
    flowStep2: "Request Pro when rules and AI organization matter",
    flowStep3: "Pro key delivered by email",
    storyEyebrow: "Quick Start",
    storyH2: "From setup to first save in three steps.",
    storyP: "Load the extension, connect your vault, and save. Everything up to that point is ready in Free.",
    guideInstallCta: "Open install guide",
    guideUpgradeCta: "Request Pro",
    card1Title: "Load in Chrome",
    card1Desc: "Unzip the project and load the dist/extension folder as an unpacked Chrome extension.",
    card2Title: "Connect your vault",
    card2Desc: "Connect your Obsidian folder in options so markdown and media save directly.",
    card3Title: "Save from Threads",
    card3Desc: "Save from any single post page. Pro adds file rules and AI organization on top.",
    showcaseH2: "What you actually see in the extension",
    showcaseCopy: "See the difference between Free and Pro for yourself.",
    shotLargeCapTitle: "Free save flow",
    shotLargeCapDesc: "The core saving experience stays fast and simple.",
    shotSmallCapTitle: "Pro auto-organization",
    shotSmallCapDesc: "Organized using your chosen rules and your own LLM-powered summary/tag pass.",
    compFreeDesc: "The core save flow that already works well",
    compProDesc: "An upgrade that adds file/path rules plus AI summaries, tags, and frontmatter",
    step1Title: "Start by saving with Free",
    step1Desc: "Free already handles current-post saves, images, and author reply chains.",
    step2Title: "Upgrade when organization rules matter",
    step2Desc: "Pro becomes useful when you want file/path rules plus AI summaries, tags, and frontmatter.",
    step3Title: "Paste your Pro key to enable automation",
    step3Desc: "After payment confirmation, paste the Pro key into the options page to unlock rule-based and AI settings.",
    commerceH2: "Request Pro",
    commerceLead: "Choose a payment method and leave your email. The Pro key is sent after payment confirmation.",
    commerceNote: "Orders are reviewed first, then payment is confirmed.",
    formNameLabel: "Name",
    formEmailLabel: "Email",
    formMethodLabel: "Payment method",
    formNoteLabel: "Note",
    formSubmitBtn: "Send purchase request",
    formRemark: "Your Pro key is emailed after payment confirmation.",
    faqH2: "Most common questions before buying",
    phName: "John Doe",
    phNote: "Invoice, currency, bundle requests, etc.",
    phMethod: "Select a payment method",
    methodBadge: "Available",
    compareH2: "Free vs Pro",
    compareLead: "",
    compareColFeature: "Feature",
    compareRowSavePost: "Save current post",
    compareRowImages: "Save images",
    compareRowReplies: "Author reply chain",
    compareRowRules: "File name / path rules",
    compareRowAi: "BYO LLM summary / tags / frontmatter",
    screenH2: "Preview",
    screenUsageCaption: "Save flow in use",
    screenProCaption: "Options page with Pro enabled",
    langKo: "한국어",
    langEn: "English",
    orderSuccess1: "Your request has been received at {email}.",
    orderNextStep: "Next step: {instructions}",
    orderPayLink: "Payment link: {url}",
    orderFinal: "Your Pro key will be emailed after payment confirmation.",
    footerPurchaseLink: "",
  },
};

export interface LandingStorefrontCopy {
  productName: string;
  headline: string;
  subheadline: string;
  priceLabel: string;
  includedUpdates: string;
  heroNotes: string[];
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

export const landingStorefrontCopy: { ko: LandingStorefrontCopy; en: LandingStorefrontCopy } = {
  ko: {
    productName: "Threads to Obsidian",
    headline: "Threads를 Obsidian에 저장.",
    subheadline: "Free는 저장. Pro는 규칙 + 내 LLM 키로 요약, 태그, frontmatter.",
    priceLabel: "Pro 업그레이드",
    includedUpdates: "1회 결제 · 7일 환불 · 업데이트 1년",
    heroNotes: [
      "Free: 현재 글 저장 · 이미지 포함 · 작성자 연속 답글",
      "Pro: 파일명 패턴 · 저장 경로 · AI 요약 · AI 태그",
      "Chrome 확장으로 바로 시작 · 필요할 때만 Pro"
    ],
    faqs: [
      {
        id: "faq-1",
        question: "저장하려면 Pro가 필요한가요?",
        answer: "아니요. 저장, 이미지 포함, 연속 답글, 중복 건너뜀 모두 Free에서 가능합니다."
      },
      {
        id: "faq-2",
        question: "누가 Pro를 사면 좋나요?",
        answer: "저장할 때 파일명·경로 규칙을 직접 제어하고, 자신의 LLM 키로 요약·태그·frontmatter를 붙이고 싶은 분께 맞습니다."
      },
      {
        id: "faq-3",
        question: "요약이나 태그 같은 AI 정리는 되나요?",
        answer: "됩니다. Pro에서 OpenAI 호환 엔드포인트와 자신의 키를 넣으면 요약, 태그, 추가 frontmatter를 생성합니다."
      },
      {
        id: "faq-4",
        question: "Pro 키는 어떻게 전달되나요?",
        answer: "결제가 확인되면 Pro 키를 이메일로 보내드립니다."
      },
      {
        id: "faq-5",
        question: "환불 정책은 있나요?",
        answer: "구매 후 7일 내에 환불 요청을 보내면 확인 후 처리합니다."
      }
    ]
  },
  en: {
    productName: "Threads to Obsidian",
    headline: "Save Threads to Obsidian.",
    subheadline: "Free saves. Pro adds rules plus summary, tags, and frontmatter with your own LLM key.",
    priceLabel: "Pro upgrade",
    includedUpdates: "One-time payment · 7-day refund · 1 year of updates",
    heroNotes: [
      "Free: save the current post, include images, keep author reply chains",
      "Pro: file/path rules, AI summaries, AI tags",
      "Start as a Chrome extension now, upgrade only when needed"
    ],
    faqs: [
      {
        id: "faq-1",
        question: "Do I need Pro to save posts?",
        answer: "No. Saving, image capture, author reply chains, and duplicate skipping all work in Free."
      },
      {
        id: "faq-2",
        question: "Who should buy Pro?",
        answer: "It fits people who want direct control over file/path rules and want summaries, tags, and frontmatter generated with their own LLM key."
      },
      {
        id: "faq-3",
        question: "Does it do AI summaries or tagging?",
        answer: "Yes. In Pro, you can connect an OpenAI-compatible endpoint and your own key to generate summaries, tags, and extra frontmatter."
      },
      {
        id: "faq-4",
        question: "How is the Pro key delivered?",
        answer: "After payment is confirmed, the Pro key is sent to your email."
      },
      {
        id: "faq-5",
        question: "Is there a refund policy?",
        answer: "Refund requests are accepted within 7 days after purchase."
      }
    ]
  }
};

// ─── Admin messages ───────────────────────────────────────────────────────────

export type AdminMsg = {
  adminH1: string;
  adminLead: string;
  tokenLabel: string;
  tokenApply: string;
  tokenStatusDefault: string;
  statPending: string;
  statPaid: string;
  statIssued: string;
  statMethods: string;
  statWebhookProcessed: string;
  statWebhookIgnored: string;
  statWebhookRejected: string;
  statWebhookDuplicates: string;
  paymentMethodsTitle: string;
  paymentMethodsCopy: string;
  reloadBtn: string;
  colName: string;
  colSummary: string;
  colAction: string;
  colEnabled: string;
  colActions: string;
  methodNameLabel: string;
  methodSortLabel: string;
  methodSummaryLabel: string;
  methodInstructionsLabel: string;
  methodCtaLabel: string;
  methodActionUrlLabel: string;
  methodEnabledLabel: string;
  addMethodBtn: string;
  ordersTitle: string;
  ordersCopy: string;
  colBuyer: string;
  colMethod: string;
  colStatus: string;
  colCreated: string;
  licensesTitle: string;
  licensesCopy: string;
  colHolder: string;
  colIssuedAt: string;
  colPreview: string;
  emailDraftTitle: string;
  emailDraftCopy: string;
  emailPreviewLabel: string;
  copyEmailBtn: string;
  emailStatusDefault: string;
  historyTitle: string;
  historyCopy: string;
  filterKindLabel: string;
  filterProviderLabel: string;
  filterReasonLabel: string;
  allOption: string;
  colWhen: string;
  colEventKind: string;
  colProvider: string;
  colEventId: string;
  colReason: string;
  colMessage: string;
  langKo: string;
  langEn: string;
  dashboardLoaded: string;
  tokenSaving: string;
  tokenCleared: string;
  dashboardError: string;
  noHistoryMatch: string;
  btnEnable: string;
  btnDisable: string;
  btnMarkPaid: string;
  btnIssueKey: string;
  btnPreviewEmail: string;
  btnReissueKey: string;
  btnSendEmail: string;
  btnRevoke: string;
  noActions: string;
  pillEnabled: string;
  pillDisabled: string;
  emailDraftReady: string;
  keyIssued: string;
  keyReissued: string;
  emailSent: string;
  emailSendError: string;
  nothingToCopy: string;
  emailCopied: string;
  requestFailed: string;
  revenueTitle: string;
  revenueCopy: string;
  revenueEstimate: string;
  revenueTotalOrders: string;
  revenuePaid: string;
  revenueIssued: string;
  revenueRevoked: string;
  revenueReadyToSend: string;
  revenueSent: string;
  revenueByMethod: string;
  revenueByMonth: string;
  colOrders: string;
  colPaid: string;
  colIssued: string;
  mailerOn: string;
  mailerOff: string;
  statDeliveryReady: string;
  statDeliverySent: string;
};

export const adminMessages: { ko: AdminMsg; en: AdminMsg } = {
  ko: {
    adminH1: "결제, 발급, 전달 관리",
    adminLead: "결제 수단 관리, 구매 요청 검토, Pro 키 발급, 수동 이메일 전달을 위한 관리자 패널입니다.",
    tokenLabel: "관리자 토큰",
    tokenApply: "적용",
    tokenStatusDefault: "/api/admin/* 접근을 위해 토큰이 필요합니다",
    statPending: "미결 주문",
    statPaid: "결제 확인, 키 대기",
    statIssued: "발급된 키",
    statMethods: "활성 결제 수단",
    statWebhookProcessed: "웹훅 처리됨",
    statWebhookIgnored: "웹훅 무시됨",
    statWebhookRejected: "웹훅 거부됨",
    statWebhookDuplicates: "웹훅 중복 감지",
    paymentMethodsTitle: "결제 수단",
    paymentMethodsCopy: "활성화된 수단만 랜딩 페이지에 표시됩니다.",
    reloadBtn: "새로고침",
    colName: "이름",
    colSummary: "요약",
    colAction: "액션",
    colEnabled: "활성",
    colActions: "관리",
    methodNameLabel: "결제 수단 이름",
    methodSortLabel: "정렬 순서",
    methodSummaryLabel: "요약",
    methodInstructionsLabel: "안내사항",
    methodCtaLabel: "CTA 레이블",
    methodActionUrlLabel: "외부 링크",
    methodEnabledLabel: "활성",
    addMethodBtn: "결제 수단 추가",
    ordersTitle: "구매 요청",
    ordersCopy: "결제 확인 후 키를 발급하고, 이메일 초안을 복사하세요.",
    colBuyer: "구매자",
    colMethod: "결제 수단",
    colStatus: "상태",
    colCreated: "생성일",
    licensesTitle: "발급된 키",
    licensesCopy: "생성된 모든 키는 미리보기, 수령인, 상태와 함께 저장됩니다.",
    colHolder: "수령인",
    colIssuedAt: "발급일",
    colPreview: "미리보기",
    emailDraftTitle: "이메일 초안",
    emailDraftCopy: "단순하고 추적 가능하며 오프라인 키 전달에 최적화된 방식입니다.",
    emailPreviewLabel: "미리보기",
    copyEmailBtn: "이메일 초안 복사",
    emailStatusDefault: "발급된 주문을 선택하면 전달 텍스트가 표시됩니다.",
    historyTitle: "이벤트 기록",
    historyCopy: "키, 결제, 웹훅 이벤트 내역 (거부·중복·무시 포함).",
    filterKindLabel: "종류",
    filterProviderLabel: "프로바이더",
    filterReasonLabel: "이유",
    allOption: "전체",
    colWhen: "시간",
    colEventKind: "이벤트",
    colProvider: "프로바이더",
    colEventId: "이벤트 ID",
    colReason: "이유",
    colMessage: "메시지",
    langKo: "한국어",
    langEn: "English",
    dashboardLoaded: "대시보드 로드 완료",
    tokenSaving: "토큰 저장됨. 대시보드 로딩 중...",
    tokenCleared: "토큰 초기화됨",
    dashboardError: "대시보드를 불러올 수 없습니다",
    noHistoryMatch: "선택한 필터에 맞는 이벤트가 없습니다.",
    btnEnable: "활성화",
    btnDisable: "비활성화",
    btnMarkPaid: "결제 확인",
    btnIssueKey: "키 발급",
    btnPreviewEmail: "이메일 미리보기",
    btnReissueKey: "재발급",
    btnSendEmail: "이메일 발송",
    btnRevoke: "폐기",
    noActions: "동작 없음",
    pillEnabled: "활성",
    pillDisabled: "비활성",
    emailDraftReady: "{email} 초안 준비됨",
    keyIssued: "{email}에 키 발급됨",
    keyReissued: "{email}에 키 재발급됨",
    emailSent: "{email}로 이메일 발송 완료",
    emailSendError: "이메일 발송 실패: {error}",
    nothingToCopy: "복사할 내용이 없습니다.",
    emailCopied: "이메일 초안이 클립보드에 복사됐습니다.",
    requestFailed: "요청에 실패했습니다.",
    revenueTitle: "매출 현황",
    revenueCopy: "결제 완료 기준 예상 매출입니다. 실제 수령액과 다를 수 있습니다.",
    revenueEstimate: "예상 매출",
    revenueTotalOrders: "전체 주문",
    revenuePaid: "결제 완료",
    revenueIssued: "키 발급됨",
    revenueRevoked: "폐기된 키",
    revenueReadyToSend: "발송 대기",
    revenueSent: "발송 완료",
    revenueByMethod: "결제수단별",
    revenueByMonth: "월별 주문",
    colOrders: "주문수",
    colPaid: "결제",
    colIssued: "발급",
    mailerOn: "이메일 자동 발송: 켜짐",
    mailerOff: "이메일 자동 발송: 꺼짐 (수동 발송 필요)",
    statDeliveryReady: "발송 대기",
    statDeliverySent: "발송 완료",
  },
  en: {
    adminH1: "Payments, issuance, and delivery",
    adminLead: "Manage accepted payment methods, review purchase requests, issue signed Pro keys, and keep an auditable history for manual email delivery.",
    tokenLabel: "Admin token",
    tokenApply: "Apply",
    tokenStatusDefault: "Token required for /api/admin/*",
    statPending: "Pending orders",
    statPaid: "Paid, awaiting key",
    statIssued: "Issued keys",
    statMethods: "Active payment methods",
    statWebhookProcessed: "Webhook processed",
    statWebhookIgnored: "Webhook ignored",
    statWebhookRejected: "Webhook rejected",
    statWebhookDuplicates: "Webhook retries detected",
    paymentMethodsTitle: "Payment methods",
    paymentMethodsCopy: "Public landing page reads only enabled methods from here.",
    reloadBtn: "Reload dashboard",
    colName: "Name",
    colSummary: "Summary",
    colAction: "Action",
    colEnabled: "Enabled",
    colActions: "Actions",
    methodNameLabel: "Method name",
    methodSortLabel: "Sort order",
    methodSummaryLabel: "Summary",
    methodInstructionsLabel: "Instructions",
    methodCtaLabel: "CTA label",
    methodActionUrlLabel: "External action URL",
    methodEnabledLabel: "Enabled",
    addMethodBtn: "Add payment method",
    ordersTitle: "Purchase requests",
    ordersCopy: "Mark payment, issue a key, then copy the email draft.",
    colBuyer: "Buyer",
    colMethod: "Method",
    colStatus: "Status",
    colCreated: "Created",
    licensesTitle: "Issued keys",
    licensesCopy: "Every generated key is stored with preview, holder, and status.",
    colHolder: "Holder",
    colIssuedAt: "Issued at",
    colPreview: "Preview",
    emailDraftTitle: "Email delivery draft",
    emailDraftCopy: "Email works well for this product because it is simple, auditable, and fits paste-in offline keys.",
    emailPreviewLabel: "Preview",
    copyEmailBtn: "Copy email draft",
    emailStatusDefault: "Select an issued order to preview delivery text.",
    historyTitle: "History",
    historyCopy: "Recent key, payment, and webhook events (including rejected/duplicate/ignored cases).",
    filterKindLabel: "Kind",
    filterProviderLabel: "Provider",
    filterReasonLabel: "Reason",
    allOption: "All",
    colWhen: "When",
    colEventKind: "Event kind",
    colProvider: "Provider",
    colEventId: "Event ID",
    colReason: "Reason",
    colMessage: "Message",
    langKo: "한국어",
    langEn: "English",
    dashboardLoaded: "Dashboard loaded",
    tokenSaving: "Token saved locally. Loading dashboard...",
    tokenCleared: "Token cleared",
    dashboardError: "Could not load dashboard",
    noHistoryMatch: "No events match the selected filters.",
    btnEnable: "Enable",
    btnDisable: "Disable",
    btnMarkPaid: "Mark paid",
    btnIssueKey: "Issue key",
    btnPreviewEmail: "Preview email",
    btnReissueKey: "Reissue",
    btnSendEmail: "Send email",
    btnRevoke: "Revoke",
    noActions: "No actions",
    pillEnabled: "enabled",
    pillDisabled: "disabled",
    emailDraftReady: "Draft ready for {email}",
    keyIssued: "Issued key for {email}",
    keyReissued: "Reissued key for {email}",
    emailSent: "Email sent to {email}",
    emailSendError: "Email send failed: {error}",
    nothingToCopy: "Nothing to copy yet.",
    emailCopied: "Email draft copied to clipboard.",
    requestFailed: "Admin request failed.",
    revenueTitle: "Revenue",
    revenueCopy: "Estimated from completed payments. May differ from actual amounts received.",
    revenueEstimate: "Estimated revenue",
    revenueTotalOrders: "Total orders",
    revenuePaid: "Paid",
    revenueIssued: "Keys issued",
    revenueRevoked: "Revoked keys",
    revenueReadyToSend: "Awaiting delivery",
    revenueSent: "Delivered",
    revenueByMethod: "By payment method",
    revenueByMonth: "Monthly orders",
    colOrders: "Orders",
    colPaid: "Paid",
    colIssued: "Issued",
    mailerOn: "Auto email delivery: ON",
    mailerOff: "Auto email delivery: OFF (manual delivery required)",
    statDeliveryReady: "Awaiting delivery",
    statDeliverySent: "Delivered",
  },
};
