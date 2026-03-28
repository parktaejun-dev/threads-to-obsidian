import {
  detectLocaleFromNavigator,
  getLocaleLabel,
  normalizeLocale,
  parseSupportedLocale,
  type SupportedLocale
} from "@threads/shared/locale";
import {
  adminMessageLocales,
  landingMessageLocales,
  landingStorefrontLocales
} from "./web-i18n-locales";

export type WebLocale = SupportedLocale;

const LS_KEY = "web-locale";
const COOKIE_KEY = "threads-web-locale";

function readLocaleCookie(): WebLocale | null {
  if (typeof document === "undefined") {
    return null;
  }

  for (const pair of document.cookie.split(";")) {
    const [rawKey, ...rawValue] = pair.split("=");
    if (rawKey?.trim() !== COOKIE_KEY) {
      continue;
    }

    try {
      const value = rawValue.join("=");
      return parseSupportedLocale(decodeURIComponent(value));
    } catch {
      return null;
    }
  }

  return null;
}

function detectPreferredNavigatorLocale(): WebLocale | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  if (Array.isArray(navigator.languages)) {
    for (const candidate of navigator.languages) {
      const parsed = parseSupportedLocale(candidate);
      if (parsed) {
        return parsed;
      }
    }
  }

  return parseSupportedLocale(navigator.language);
}

export function readWebLocale(value: unknown): WebLocale | null {
  return parseSupportedLocale(value);
}

export function getLocale(fallback?: WebLocale): WebLocale {
  try {
    const v = localStorage.getItem(LS_KEY);
    const saved = parseSupportedLocale(v);
    if (saved) {
      return saved;
    }
  } catch {}

  const cookieLocale = readLocaleCookie();
  if (cookieLocale) {
    return cookieLocale;
  }

  const browserLocale = detectPreferredNavigatorLocale();
  if (browserLocale) {
    return browserLocale;
  }

  const detected = detectLocaleFromNavigator(
    typeof navigator !== "undefined" ? navigator.language : null,
    fallback ?? "en"
  );
  return detected;
}

export function setLocale(locale: WebLocale): void {
  try {
    localStorage.setItem(LS_KEY, locale);
  } catch {}

  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
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
  for (const select of document.querySelectorAll<HTMLSelectElement>("[data-web-lang-select]")) {
    select.value = locale;
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-web-locale]")) {
    const isActive = button.dataset.webLocale === locale;
    button.classList.toggle("web-lang-btn-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

export function bindLangToggle(onSwitch: (locale: WebLocale) => void): void {
  for (const select of document.querySelectorAll<HTMLSelectElement>("[data-web-lang-select]")) {
    select.addEventListener("change", () => {
      const next = readWebLocale(select.value);
      if (!next) return;
      setLocale(next);
      onSwitch(next);
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-web-locale]")) {
    button.addEventListener("click", () => {
      const next = readWebLocale(button.dataset.webLocale);
      if (!next) {
        return;
      }

      setLocale(next);
      onSwitch(next);
    });
  }
}

// ─── Landing messages ────────────────────────────────────────────────────────

export type LandingVariant = "obsidian" | "bot";

export function getLandingVariant(siteHost: string | null | undefined): LandingVariant {
  void siteHost;
  return "obsidian";
}

export type LandingMsg = {
  topbarCta: string;
  siteLabel: string;
  heroEyebrow: string;
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
  commerceRefund: string;
  backToHome: string;
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
  productsEyebrow: string;
  productsTitle: string;
  productsCopy: string;
  productATag: string;
  productATitle: string;
  productADesc: string;
  productACta: string;
  productBTag: string;
  productBTitle: string;
  productBDesc: string;
  productBCta: string;
  pricingEyebrow: string;
  pricingTitle: string;
  pricingCopy: string;
  bundleTag: string;
  bundleTitle: string;
  bundleDesc: string;
  bundleCta: string;
  cloudTag: string;
  cloudTitle: string;
  cloudDesc: string;
  cloudCta: string;
  botEyebrow: string;
  botTitle: string;
  botCopy: string;
  botStep1Title: string;
  botStep1Desc: string;
  botStep2Title: string;
  botStep2Desc: string;
  botStep3Title: string;
  botStep3Desc: string;
  langKo: string;
  langEn: string;
  orderSuccess1: string;
  orderNextStep: string;
  orderPayLink: string;
  orderFinal: string;
  footerPurchaseLink: string;
};

const obsidianLandingMessages: { ko: LandingMsg; en: LandingMsg } = {
  ko: {
    topbarCta: "설치 안내",
    siteLabel: "안내 주소",
    heroEyebrow: "Extension + Scrapbook",
    heroGuideCta: "scrapbook 열기",
    heroPurchaseCta: "Pro 구매",
    heroRailLabel1: "Free",
    heroRailText1: "글·이미지·답글 저장",
    heroRailLabel2: "Pro",
    heroRailText2: "파일명 규칙 + AI 정리",
    priceNote: "1회 결제",
    priceSummary: "Free로 저장하고, 필요할 때 Pro를 추가하세요.",
    pricePointFreeDesc: "핵심 저장은 바로 사용 가능.",
    pricePointProDesc: "파일명 규칙과 AI 정리를 활성화.",
    primaryCta: "Pro 구매",
    secondaryCta: "scrapbook 열기",
    flowStep1: "Free로 먼저 저장해보기",
    flowStep2: "필요하면 Pro로 업그레이드",
    flowStep3: "이메일로 키 전달",
    storyEyebrow: "Quick Start",
    storyH2: "설치 → 연결 → 저장, 3단계.",
    storyP: "Free로 바로 시작할 수 있습니다.",
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
    step1Title: "Free로 저장 체험",
    step1Desc: "글·이미지·답글 저장이 바로 됩니다.",
    step2Title: "필요할 때 Pro 업그레이드",
    step2Desc: "파일명 규칙과 AI 정리가 필요하면 Pro.",
    step3Title: "키 입력으로 활성화",
    step3Desc: "옵션 페이지에 Pro 키를 넣으면 끝.",
    commerceH2: "Pro 구매",
    commerceLead: "29달러 1회 결제. 이메일로 키를 발송합니다.",
    commerceNote: "주문 요청 후 결제를 확인하는 방식으로 운영합니다.",
    commerceRefund: "7일 환불",
    backToHome: "제품 페이지로 돌아가기",
    formNameLabel: "이름",
    formEmailLabel: "이메일",
    formMethodLabel: "결제수단",
    formNoteLabel: "메모",
    formSubmitBtn: "구매 요청 보내기",
    formRemark: "결제 확인 후 Pro 키를 이메일로 보냅니다.",
    faqH2: "구매 전에 가장 많이 묻는 질문",
    phName: "홍길동",
    phNote: "세금계산서, 통화, 팀용 좌석 요청 등이 있으면 적어주세요",
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
    productsEyebrow: "Two products",
    productsTitle: "저장하는 두 가지 방식",
    productsCopy: "",
    productATag: "Chrome extension",
    productATitle: "Threads to Obsidian",
    productADesc: "PC에서 보고 있는 Threads 글을 바로 저장.",
    productACta: "ZIP 다운로드",
    productBTag: "Mention bot",
    productBTitle: "Mention Scrapbook",
    productBDesc: "모바일에서는 댓글 멘션으로 모아서 나중에 꺼내기.",
    productBCta: "scrapbook 열기",
    pricingEyebrow: "Pricing",
    pricingTitle: "결제는 단순하게.",
    pricingCopy: "",
    bundleTag: "One-time",
    bundleTitle: "Threads Saver Pro",
    bundleDesc: "29달러 1회 결제. Extension Pro와 Scrapbook core 포함.",
    bundleCta: "Pro 구매",
    cloudTag: "Cloud Add-on",
    cloudTitle: "Watchlists + Searches + Insights",
    cloudDesc: "지속 동기화가 필요한 기능은 별도 add-on.",
    cloudCta: "scrapbook 열기",
    botEyebrow: "Mention bot",
    botTitle: "댓글 멘션으로 scrapbook에 저장",
    botCopy: "댓글에 @를 붙이면 저장. 이후 Markdown으로 내보내기.",
    botStep1Title: "댓글에 @parktaejun 추가",
    botStep1Desc: "저장하고 싶은 Threads 글에 댓글을 달고 @parktaejun만 붙이면 저장 트리거가 생성됩니다.",
    botStep2Title: "계정 기준으로 내 scrapbook에 라우팅",
    botStep2Desc: "로그인 시 연결한 Threads 계정을 기준으로 작성자를 매칭해 사용자별 private scrapbook에만 저장합니다.",
    botStep3Title: "Markdown으로 꺼내 사용",
    botStep3Desc: "저장된 항목은 웹에서 확인하고 Markdown export나 plain text copy로 Obsidian, Notion, 메모 앱에 옮깁니다.",
    langKo: "한국어",
    langEn: "English",
    orderSuccess1: "{email}로 요청이 접수됐습니다.",
    orderNextStep: "다음 단계: {instructions}",
    orderPayLink: "결제 링크: {url}",
    orderFinal: "결제 확인 후 Threads Saver Pro 키를 이메일로 보내드립니다.",
    footerPurchaseLink: "",
  },
  en: {
    topbarCta: "Install guide",
    siteLabel: "Guide URL",
    heroEyebrow: "Extension + Scrapbook",
    heroGuideCta: "Open scrapbook",
    heroPurchaseCta: "Buy Pro",
    heroRailLabel1: "Free",
    heroRailText1: "Save posts, images, and reply chains",
    heroRailLabel2: "Pro",
    heroRailText2: "File/path rules + AI organization",
    priceNote: "one-time",
    priceSummary: "Start with Free. Add Pro when you need it.",
    pricePointFreeDesc: "Core saving works right away.",
    pricePointProDesc: "Unlock file rules and AI organization.",
    primaryCta: "Buy Pro",
    secondaryCta: "Open scrapbook",
    flowStep1: "Try Free first",
    flowStep2: "Upgrade to Pro when needed",
    flowStep3: "Key delivered by email",
    storyEyebrow: "Quick Start",
    storyH2: "Install → Connect → Save. Three steps.",
    storyP: "Free is ready to go.",
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
    step1Title: "Try Free first",
    step1Desc: "Posts, images, and reply chains save immediately.",
    step2Title: "Upgrade when needed",
    step2Desc: "Pro adds file rules and AI organization.",
    step3Title: "Paste your key",
    step3Desc: "Enter the Pro key in options to activate.",
    commerceH2: "Buy Pro",
    commerceLead: "$29 one-time. Key delivered by email.",
    commerceNote: "Orders are reviewed first, then payment is confirmed.",
    commerceRefund: "7-day refund",
    backToHome: "Back to product page",
    formNameLabel: "Name",
    formEmailLabel: "Email",
    formMethodLabel: "Payment method",
    formNoteLabel: "Note",
    formSubmitBtn: "Send purchase request",
    formRemark: "Your Pro key is emailed after payment confirmation.",
    faqH2: "Most common questions before buying",
    phName: "John Doe",
    phNote: "Invoice, currency, team seat requests, etc.",
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
    productsEyebrow: "Two products",
    productsTitle: "Two ways to save",
    productsCopy: "",
    productATag: "Chrome extension",
    productATitle: "Threads to Obsidian",
    productADesc: "Save the Threads post you are viewing on desktop.",
    productACta: "Download ZIP",
    productBTag: "Mention bot",
    productBTitle: "Mention Scrapbook",
    productBDesc: "Use mention replies on mobile, then export later.",
    productBCta: "Open scrapbook",
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple billing.",
    pricingCopy: "",
    bundleTag: "One-time",
    bundleTitle: "Threads Saver Pro",
    bundleDesc: "$29 one-time. Includes Extension Pro and Scrapbook core.",
    bundleCta: "Buy Pro",
    cloudTag: "Cloud Add-on",
    cloudTitle: "Watchlists + Searches + Insights",
    cloudDesc: "Always-on sync features as a separate add-on.",
    cloudCta: "Open scrapbook",
    botEyebrow: "Mention bot",
    botTitle: "Save to scrapbook with one reply",
    botCopy: "Reply with @ to save. Export as Markdown later.",
    botStep1Title: "Add @parktaejun in a reply",
    botStep1Desc: "Reply to the Threads post you want to save and include only @parktaejun to create the save trigger.",
    botStep2Title: "Route it to your scrapbook by identity",
    botStep2Desc: "The system matches the reply author against the Threads account linked at sign-in and stores the item only in that user's private scrapbook.",
    botStep3Title: "Export as Markdown later",
    botStep3Desc: "Saved items stay visible on the web dashboard and can be copied out as Markdown or plain text for Obsidian, Notion, or note apps.",
    langKo: "한국어",
    langEn: "English",
    orderSuccess1: "Your request has been received at {email}.",
    orderNextStep: "Next step: {instructions}",
    orderPayLink: "Payment link: {url}",
    orderFinal: "Your Threads Saver Pro key will be emailed after payment confirmation.",
    footerPurchaseLink: "",
  },
};

export const landingMessages: Record<WebLocale, Record<LandingVariant, LandingMsg>> = {
  ko: {
    obsidian: obsidianLandingMessages.ko,
    bot: {
      ...obsidianLandingMessages.ko,
      topbarCta: "scrapbook 열기",
      heroEyebrow: "Mention Scrapbook SaaS",
      heroGuideCta: "scrapbook 열기",
      heroPurchaseCta: "확장 Pro 구매",
      primaryCta: "확장 Pro 구매",
      storyEyebrow: "Chrome Extension",
      storyH2: "Threads to Obsidian 확장도 함께 제공합니다.",
      storyP: "댓글 멘션 저장은 bot이 맡고, 브라우저에서 보고 있는 Threads 글을 즉시 Obsidian으로 보내는 흐름은 extension이 맡습니다.",
      card3Title: "Threads에서 바로 저장",
      card3Desc: "브라우저에서 보고 있는 글을 즉시 저장합니다. mention bot와 별도로 쓰거나 함께 쓸 수 있습니다.",
      commerceH2: "Threads to Obsidian Pro 구매",
      commerceLead: "이 아래 폼은 Chrome extension Pro 구매용입니다. mention scrapbook bot 안내는 위 섹션에서 확인할 수 있습니다.",
      faqH2: "Bot / Extension FAQ",
      compareH2: "Chrome Extension Free vs Pro",
      screenH2: "Chrome extension preview",
      productsEyebrow: "Two products",
      productsTitle: "Threads에서 저장하는 두 가지 방식",
      productsCopy: "공개 댓글 기반 scrapbook bot과, 보고 있는 글을 바로 저장하는 Chrome extension을 함께 안내합니다.",
      productATag: "Mention bot",
      productATitle: "Threads Mention Scrapbook",
      productADesc: "댓글에 @parktaejun만 붙이면 내 private scrapbook으로 저장되고, 나중에 Markdown으로 꺼내 쓸 수 있습니다.",
      productACta: "scrapbook 열기",
      productBTag: "Chrome extension",
      productBTitle: "Threads to Obsidian",
      productBDesc: "브라우저에서 보고 있는 Threads 글을 바로 Obsidian으로 저장합니다. 정리 규칙과 AI 후처리는 Pro에서 켭니다.",
      productBCta: "확장 안내 보기",
      botEyebrow: "How it works",
      botTitle: "공개 댓글로 트리거하고, private scrapbook에 저장합니다.",
      botCopy: "Threads 로그인으로 내 계정을 연결한 뒤, 공개 댓글 멘션을 저장 트리거로 씁니다. 저장된 데이터는 사용자별 scrapbook에만 보입니다.",
      botStep1Title: "Threads 계정 연결",
      botStep1Desc: "scrapbook 페이지에서 Threads로 로그인하고, 저장 요청을 받을 계정을 연결합니다.",
      botStep2Title: "@parktaejun 댓글로 저장 요청",
      botStep2Desc: "Threads 게시물 댓글에 @parktaejun만 붙이면 멘션 수집기가 연결된 계정 기준으로 scrapbook에 반영합니다.",
      botStep3Title: "웹에서 확인하고 Markdown export",
      botStep3Desc: "저장 반영은 60초 이내를 목표로 하고, Markdown export나 plain text copy로 Obsidian, Notion, 메모 앱으로 옮깁니다."
    }
  },
  en: {
    obsidian: obsidianLandingMessages.en,
    bot: {
      ...obsidianLandingMessages.en,
      topbarCta: "Open scrapbook",
      heroEyebrow: "Mention Scrapbook SaaS",
      heroGuideCta: "Open scrapbook",
      heroPurchaseCta: "Buy extension Pro",
      primaryCta: "Buy extension Pro",
      storyEyebrow: "Chrome Extension",
      storyH2: "Threads to Obsidian is also available here.",
      storyP: "The bot handles mention-based scrapbook saves, while the extension sends the post you are actively viewing straight into Obsidian.",
      card3Title: "Save directly from Threads",
      card3Desc: "Save the post you are viewing in the browser immediately. You can use it separately from the mention bot or alongside it.",
      commerceH2: "Buy Threads to Obsidian Pro",
      commerceLead: "The form below is for the Chrome extension Pro purchase. The mention scrapbook bot is explained in the sections above.",
      faqH2: "Bot / Extension FAQ",
      compareH2: "Chrome Extension Free vs Pro",
      screenH2: "Chrome extension preview",
      productsEyebrow: "Two products",
      productsTitle: "Two ways to save from Threads",
      productsCopy: "This page introduces both the public-reply scrapbook bot and the Chrome extension that saves the post you are viewing right now.",
      productATag: "Mention bot",
      productATitle: "Threads Mention Scrapbook",
      productADesc: "Add @parktaejun in a reply and the item lands in your private scrapbook, ready to export as Markdown later.",
      productACta: "Open scrapbook",
      productBTag: "Chrome extension",
      productBTitle: "Threads to Obsidian",
      productBDesc: "Save the Threads post you are viewing straight into Obsidian. Rule-based organization and AI post-processing turn on in Pro.",
      productBCta: "See extension guide",
      botEyebrow: "How it works",
      botTitle: "Use a public reply as the trigger and keep the scrapbook private.",
      botCopy: "Users connect their Threads account through Threads OAuth, then use a public reply mention as the save trigger. Saved data stays separated per scrapbook account.",
      botStep1Title: "Connect your Threads account",
      botStep1Desc: "Open the scrapbook page, continue with Threads, and connect the account that should receive saved mentions.",
      botStep2Title: "Save with an @parktaejun reply",
      botStep2Desc: "Once a reply mentions @parktaejun, the mention ingester matches the reply author account and stores it idempotently.",
      botStep3Title: "Review on the web and export",
      botStep3Desc: "The target is to reflect saves within 60 seconds, then let users export as Markdown or plain text for Obsidian, Notion, or note apps."
    }
  },
  ...landingMessageLocales
};

export interface LandingLinkSet {
  topbarSecondaryHref: string;
  topbarPrimaryHref: string;
  heroSecondaryHref: string;
  heroPrimaryHref: string;
  priceCardHref: string;
  productAHref: string;
  productBHref: string;
}

export interface LandingStorefrontCopy {
  productName: string;
  headline: string;
  subheadline: string;
  priceLabel: string;
  includedUpdates: string;
  heroNotes: string[];
  links: LandingLinkSet;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

const obsidianLandingStorefrontCopy: { ko: LandingStorefrontCopy; en: LandingStorefrontCopy } = {
  ko: {
    productName: "Threads Saver",
    headline: "PC는 extension.<br/>모바일은 mention.",
    subheadline: "지금 보는 글은 Chrome extension으로 저장하고, 모바일에서는 mention scrapbook으로 모읍니다.",
    priceLabel: "Threads Saver Pro",
    includedUpdates: "29달러 1회 결제 · Extension Pro + Scrapbook core · 7일 환불",
    heroNotes: [
      "Chrome extension: 현재 보고 있는 글 저장",
      "scrapbook: 멘션, watchlist, search 결과 정리",
      "Cloud add-on: Discovery, Search, Insights"
    ],
    links: {
      topbarSecondaryHref: "/scrapbook",
      topbarPrimaryHref: "/checkout",
      heroSecondaryHref: "/scrapbook",
      heroPrimaryHref: "/checkout",
      priceCardHref: "/checkout",
      productAHref: "https://github.com/parktaejun-dev/threads-to-obsidian",
      productBHref: "/scrapbook"
    },
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
    productName: "Threads Saver",
    headline: "Desktop extension. Mobile mention.",
    subheadline: "Save the current post using the Chrome extension, or collect it later via mention scrapbook on mobile.",
    priceLabel: "Threads Saver Pro",
    includedUpdates: "$29 one-time · extension Pro + scrapbook core · 7-day refund",
    heroNotes: [
      "Chrome extension: save the post you are reading now",
      "scrapbook: organize mentions, watchlists, and searches",
      "Cloud add-on: Discovery, Search, Insights"
    ],
    links: {
      topbarSecondaryHref: "/scrapbook",
      topbarPrimaryHref: "/checkout",
      heroSecondaryHref: "/scrapbook",
      heroPrimaryHref: "/checkout",
      priceCardHref: "/checkout",
      productAHref: "https://github.com/parktaejun-dev/threads-to-obsidian",
      productBHref: "/scrapbook"
    },
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

export const landingStorefrontCopy: Record<WebLocale, Record<LandingVariant, LandingStorefrontCopy>> = {
  ko: {
    obsidian: obsidianLandingStorefrontCopy.ko,
    bot: {
      productName: "Threads Mention Scrapbook",
      headline: "Threads 댓글에 @parktaejun만 붙이면 저장됩니다.",
      subheadline: "공개 댓글을 private scrapbook 저장 트리거로 바꾸고, 나중에 Markdown이나 Obsidian, Notion으로 꺼내 쓰는 SaaS입니다.",
      priceLabel: "Threads to Obsidian Pro",
      includedUpdates: "Chrome extension · 1회 결제 · 업데이트 1년",
      heroNotes: [
        "댓글은 공개 트리거입니다. 민감한 메모는 적지 마세요.",
        "Threads 로그인으로 연결된 계정과 댓글 작성 계정을 기준으로 사용자별로 분리 저장합니다.",
        "저장 후 Markdown export와 plain text copy를 지원합니다."
      ],
      links: {
        topbarSecondaryHref: "/scrapbook",
        topbarPrimaryHref: "/checkout",
        heroSecondaryHref: "/scrapbook",
        heroPrimaryHref: "/checkout",
        priceCardHref: "/checkout",
        productAHref: "/scrapbook",
        productBHref: "#install"
      },
      faqs: [
        {
          id: "faq-1",
          question: "댓글 내용은 공개로 보이나요?",
          answer: "네. 댓글은 공개 트리거이므로 민감한 메모를 적지 말아야 하고, 페이지에서도 그 점을 명시합니다."
        },
        {
          id: "faq-2",
          question: "잘못된 사용자 scrapbook에 저장될 수 있나요?",
          answer: "연결한 Threads 계정과 댓글 작성 계정이 일치할 때만 저장하고, 일치하지 않으면 저장하지 않습니다."
        },
        {
          id: "faq-3",
          question: "username이 바뀌면 기존 저장은 어떻게 되나요?",
          answer: "같은 Threads 계정으로 다시 로그인하면 기존 scrapbook은 유지한 채 최신 사용자명과 프로필 정보로 갱신됩니다."
        },
        {
          id: "faq-4",
          question: "저장 반영은 얼마나 걸리나요?",
          answer: "멘션 수집 주기는 기본 30초에서 60초이며, 첫 반영 목표는 60초 이내입니다."
        },
        {
          id: "faq-5",
          question: "내보내기는 어디까지 지원하나요?",
          answer: "Markdown export와 plain text copy를 지원해 Obsidian, Notion, 메모 앱으로 옮길 수 있습니다."
        }
      ]
    }
  },
  en: {
    obsidian: obsidianLandingStorefrontCopy.en,
    bot: {
      productName: "Threads Mention Scrapbook",
      headline: "Add @parktaejun in a Threads reply and it gets saved.",
      subheadline: "Turn a public reply into a save trigger for a private scrapbook, then move the result into Markdown, Obsidian, or Notion later.",
      priceLabel: "Threads to Obsidian Pro",
      includedUpdates: "Chrome extension · one-time payment · 1 year of updates",
      heroNotes: [
        "Replies are public triggers, so do not write sensitive notes there.",
        "The system matches the reply author against the Threads account linked through OAuth and stores items per user.",
        "Saved items support Markdown export and plain-text copy."
      ],
      links: {
        topbarSecondaryHref: "/scrapbook",
        topbarPrimaryHref: "/checkout",
        heroSecondaryHref: "/scrapbook",
        heroPrimaryHref: "/checkout",
        priceCardHref: "/checkout",
        productAHref: "/scrapbook",
        productBHref: "#install"
      },
      faqs: [
        {
          id: "faq-1",
          question: "Are replies public?",
          answer: "Yes. Replies act as public triggers, so the page clearly warns users not to write sensitive notes there."
        },
        {
          id: "faq-2",
          question: "Can an item be saved into the wrong scrapbook?",
          answer: "The system saves only when the reply author account matches the Threads account linked to the scrapbook. Otherwise the event is ignored."
        },
        {
          id: "faq-3",
          question: "What if a username changes?",
          answer: "Users can sign in again with the same Threads account and keep the same scrapbook while refreshing the latest username and profile info."
        },
        {
          id: "faq-4",
          question: "How fast does a save appear?",
          answer: "Mentions are polled every 30 to 60 seconds by default, with a target of showing the save within 60 seconds."
        },
        {
          id: "faq-5",
          question: "How can I export the saved item?",
          answer: "Markdown export and plain-text copy are supported so the item can move into Obsidian, Notion, or note apps."
        }
      ]
    }
  },
  ...landingStorefrontLocales
};

// ─── Admin messages ───────────────────────────────────────────────────────────

export type AdminMsg = {
  adminH1: string;
  adminLead: string;
  authBannerEyebrow?: string;
  authBannerTitle?: string;
  authBannerCopy?: string;
  authOverlayLabel?: string;
  tokenLabel: string;
  tokenApply: string;
  tokenLogout?: string;
  tokenPlaceholder?: string;
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
  revenueEmptyTitle?: string;
  revenueEmptyCopy?: string;
  colOrders: string;
  colMonth?: string;
  colPaid: string;
  colIssued: string;
  mailerOn: string;
  mailerOff: string;
  statDeliveryReady: string;
  statDeliverySent: string;
  collectorTitle?: string;
  collectorCopy?: string;
  collectorSyncBtn?: string;
  collectorStateLabel?: string;
  collectorLastSuccessLabel?: string;
  collectorLastErrorLabel?: string;
  collectorHandleLabel?: string;
  collectorHandlePlaceholder?: string;
  collectorGraphLabel?: string;
  collectorGraphPlaceholder?: string;
  collectorTokenLabel?: string;
  collectorTokenPlaceholder?: string;
  collectorIntervalLabel?: string;
  collectorFetchLabel?: string;
  collectorPagesLabel?: string;
  collectorPublicHandleLabel?: string;
  collectorProfileLink?: string;
  collectorHandleCopy?: string;
  collectorSaveBtn?: string;
  collectorStateRunning?: string;
  collectorStateReady?: string;
  collectorStateDisabled?: string;
  collectorSaving?: string;
  collectorSaved?: string;
  collectorSyncing?: string;
  collectorSynced?: string;
  runtimeTitle?: string;
  runtimeCopy?: string;
  publicOriginLabel?: string;
  publicOriginPlaceholder?: string;
  databaseTitle?: string;
  databaseBackendLabel?: string;
  databaseBackendFile?: string;
  databaseBackendPostgres?: string;
  databaseFilePathLabel?: string;
  databaseFilePathPlaceholder?: string;
  databaseUrlLabel?: string;
  databaseUrlPlaceholder?: string;
  databaseTableLabel?: string;
  databaseTablePlaceholder?: string;
  databaseStoreKeyLabel?: string;
  databaseStoreKeyPlaceholder?: string;
  databaseActiveLabel?: string;
  databaseClearUrlLabel?: string;
  databaseUrlConfiguredPlaceholder?: string;
  databaseTesting?: string;
  databaseTestBtn?: string;
  runtimeSaving?: string;
  runtimeSaveBtn?: string;
  runtimeSaved?: string;
  runtimeMigrated?: string;
  runtimeRestartRequired?: string;
  smtpTitle?: string;
  smtpHostLabel?: string;
  smtpHostPlaceholder?: string;
  smtpPortLabel?: string;
  smtpUserLabel?: string;
  smtpUserPlaceholder?: string;
  smtpPassLabel?: string;
  smtpPassPlaceholder?: string;
  smtpFromLabel?: string;
  smtpFromPlaceholder?: string;
  smtpSecureLabel?: string;
  smtpClearPassLabel?: string;
  smtpPassConfiguredPlaceholder?: string;
  smtpTesting?: string;
  smtpTestBtn?: string;
  storefrontTitle?: string;
  storefrontCopy?: string;
  storefrontProductNameLabel?: string;
  storefrontSupportEmailLabel?: string;
  storefrontHeadlineLabel?: string;
  storefrontSubheadlineLabel?: string;
  storefrontPriceLabelLabel?: string;
  storefrontPriceValueLabel?: string;
  storefrontUpdatesLabel?: string;
  storefrontHeroNotesLabel?: string;
  storefrontHeroNotesPlaceholder?: string;
  storefrontFaqsLabel?: string;
  storefrontFaqsPlaceholder?: string;
  storefrontSaving?: string;
  storefrontSaveBtn?: string;
  storefrontSaved?: string;
  methodEditBtn?: string;
  methodSaveBtn?: string;
  methodCancelBtn?: string;
  methodNamePlaceholder?: string;
  methodSummaryPlaceholder?: string;
  methodInstructionsPlaceholder?: string;
  methodActionLabelPlaceholder?: string;
  methodActionUrlPlaceholder?: string;
  methodSaving?: string;
  methodEditing?: string;
  methodSaved?: string;
  methodCreated?: string;
  methodEditCancelled?: string;
  methodsEmptyTitle?: string;
  methodsEmptyCopy?: string;
  ordersEmptyTitle?: string;
  ordersEmptyCopy?: string;
  orderMarkingPaid?: string;
  orderMarkedPaid?: string;
  keyIssuing?: string;
  keyReissuing?: string;
  emailSending?: string;
  licensesEmptyTitle?: string;
  licensesEmptyCopy?: string;
  licenseRevoking?: string;
  licenseRevoked?: string;
  historyEmptyTitle?: string;
  historyEmptyCopy?: string;
  emailPreviewLoading?: string;
  issueExpiryLabel?: string;
  issueExpiryHint?: string;
  issueExpiryClear?: string;
  issueExpiryInvalid?: string;
};

export const adminMessages: Record<WebLocale, AdminMsg> = {
  ko: {
    adminH1: "결제, 발급, 전달 관리",
    adminLead: "결제 수단 관리, 구매 요청 검토, Pro 키 발급, 수동 이메일 전달을 위한 관리자 패널입니다.",
    authBannerEyebrow: "운영 권한",
    authBannerTitle: "먼저 로그인해야 실시간 운영 항목을 수정할 수 있습니다.",
    authBannerCopy: "매출, 수집기 동기화, 런타임 설정, 결제 수단, 키 발급은 관리자 토큰 검증 전까지 잠금 상태로 유지됩니다.",
    authOverlayLabel: "관리자 토큰으로 로그인하면 이 섹션을 사용할 수 있습니다.",
    tokenLabel: "관리자 토큰",
    tokenApply: "로그인",
    tokenLogout: "로그아웃",
    tokenPlaceholder: "관리자 접근 토큰",
    tokenStatusDefault: "/api/admin/* 접근을 위해 로그인이 필요합니다",
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
    tokenSaving: "로그인 처리 중...",
    tokenCleared: "로그아웃되었습니다.",
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
    revenueEmptyTitle: "아직 집계된 매출이 없습니다.",
    revenueEmptyCopy: "결제 완료 건이 생기면 이 표에 자동으로 반영됩니다.",
    colOrders: "주문수",
    colMonth: "월",
    colPaid: "결제",
    colIssued: "발급",
    mailerOn: "이메일 자동 발송: 켜짐",
    mailerOff: "이메일 자동 발송: 꺼짐 (수동 발송 필요)",
    statDeliveryReady: "발송 대기",
    statDeliverySent: "발송 완료",
    collectorTitle: "멘션 수집기",
    collectorCopy: "수집기 상태를 점검하고, 폴링 설정을 수정하고, 즉시 동기화를 실행합니다.",
    collectorSyncBtn: "지금 동기화",
    collectorStateLabel: "상태",
    collectorLastSuccessLabel: "마지막 성공",
    collectorLastErrorLabel: "최근 오류",
    collectorHandleLabel: "Threads 봇 핸들",
    collectorHandlePlaceholder: "threadsbot",
    collectorGraphLabel: "Graph API 버전",
    collectorGraphPlaceholder: "v1.0",
    collectorTokenLabel: "액세스 토큰 오버라이드",
    collectorTokenPlaceholder: "선택 사항: 장기 액세스 토큰",
    collectorIntervalLabel: "폴링 간격 (ms)",
    collectorFetchLabel: "가져올 개수",
    collectorPagesLabel: "최대 페이지",
    collectorPublicHandleLabel: "공개 봇 계정",
    collectorProfileLink: "프로필 열기",
    collectorHandleCopy: "여기서 변경한 핸들은 공개 scrapbook 안내 문구와 수집기 조회 대상에 함께 반영됩니다.",
    collectorSaveBtn: "수집기 설정 저장",
    collectorStateRunning: "실행 중",
    collectorStateReady: "준비됨",
    collectorStateDisabled: "비활성",
    collectorSaving: "수집기 설정 저장 중...",
    collectorSaved: "수집기 설정이 저장되었습니다.",
    collectorSyncing: "멘션을 즉시 동기화하는 중...",
    collectorSynced: "수집기 수동 동기화가 완료되었습니다.",
    runtimeTitle: "런타임 설정",
    runtimeCopy: "서버 파일을 직접 수정하지 않고 public origin, 데이터베이스, SMTP를 변경합니다.",
    publicOriginLabel: "Public origin",
    publicOriginPlaceholder: "https://ss-threads.dahanda.dev",
    databaseTitle: "데이터베이스",
    databaseBackendLabel: "백엔드",
    databaseBackendFile: "파일",
    databaseBackendPostgres: "Postgres",
    databaseFilePathLabel: "파일 경로",
    databaseFilePathPlaceholder: "/var/app/output/web-admin-data.json",
    databaseUrlLabel: "Postgres URL",
    databaseUrlPlaceholder: "postgres://user:pass@host:5432/db",
    databaseTableLabel: "테이블 이름",
    databaseTablePlaceholder: "threads_web_store",
    databaseStoreKeyLabel: "Store key",
    databaseStoreKeyPlaceholder: "default",
    databaseActiveLabel: "현재 활성 데이터베이스",
    databaseClearUrlLabel: "저장된 Postgres URL을 저장 시 제거",
    databaseUrlConfiguredPlaceholder: "이미 저장되어 있습니다. 교체할 새 URL만 입력하세요.",
    databaseTesting: "DB 연결을 테스트하는 중...",
    databaseTestBtn: "DB 연결 테스트",
    runtimeSaving: "런타임 설정 저장 중...",
    runtimeSaveBtn: "런타임 설정 저장",
    runtimeSaved: "런타임 설정이 저장되었습니다.",
    runtimeMigrated: "런타임 설정이 저장되었고 데이터가 새 데이터베이스로 이전되었습니다.",
    runtimeRestartRequired: "데이터베이스 설정이 저장되었습니다. 새 백엔드를 쓰기 전에 서버를 재시작하세요.",
    smtpTitle: "SMTP",
    smtpHostLabel: "호스트",
    smtpHostPlaceholder: "smtp.resend.com",
    smtpPortLabel: "포트",
    smtpUserLabel: "사용자",
    smtpUserPlaceholder: "apikey",
    smtpPassLabel: "비밀번호",
    smtpPassPlaceholder: "secret",
    smtpFromLabel: "보내는 주소",
    smtpFromPlaceholder: "hello@example.com",
    smtpSecureLabel: "TLS / secure 전송 사용",
    smtpClearPassLabel: "저장된 SMTP 비밀번호를 저장 시 제거",
    smtpPassConfiguredPlaceholder: "이미 저장되어 있습니다. 교체할 새 비밀번호만 입력하세요.",
    smtpTesting: "SMTP 연결을 테스트하는 중...",
    smtpTestBtn: "SMTP 테스트",
    storefrontTitle: "스토어프론트 설정",
    storefrontCopy: "구매자에게 보이는 랜딩 페이지 문구를 관리합니다.",
    storefrontProductNameLabel: "제품명",
    storefrontSupportEmailLabel: "지원 이메일",
    storefrontHeadlineLabel: "헤드라인",
    storefrontSubheadlineLabel: "서브헤드라인",
    storefrontPriceLabelLabel: "가격 레이블",
    storefrontPriceValueLabel: "가격 값",
    storefrontUpdatesLabel: "포함 업데이트",
    storefrontHeroNotesLabel: "Hero 노트",
    storefrontHeroNotesPlaceholder: "한 줄에 하나씩 입력",
    storefrontFaqsLabel: "FAQ",
    storefrontFaqsPlaceholder: "질문 :: 답변",
    storefrontSaving: "스토어프론트 설정 저장 중...",
    storefrontSaveBtn: "스토어프론트 저장",
    storefrontSaved: "스토어프론트 설정이 저장되었습니다.",
    methodEditBtn: "수정",
    methodSaveBtn: "결제 수단 저장",
    methodCancelBtn: "수정 취소",
    methodNamePlaceholder: "계좌이체",
    methodSummaryPlaceholder: "수동 확인이 필요한 국내 결제 방식",
    methodInstructionsPlaceholder: "구매자가 결제를 완료하거나 확인해야 하는 절차를 적어주세요.",
    methodActionLabelPlaceholder: "구매 요청 보내기",
    methodActionUrlPlaceholder: "https://...",
    methodSaving: "결제 수단 저장 중...",
    methodEditing: "결제 수단 수정 중입니다.",
    methodSaved: "결제 수단이 업데이트되었습니다.",
    methodCreated: "결제 수단이 생성되었습니다.",
    methodEditCancelled: "수정이 취소되었습니다.",
    methodsEmptyTitle: "등록된 결제 수단이 없습니다.",
    methodsEmptyCopy: "첫 결제 수단을 추가하면 구매 페이지에 바로 노출됩니다.",
    ordersEmptyTitle: "들어온 구매 요청이 없습니다.",
    ordersEmptyCopy: "새 구매 요청이 들어오면 이 표에 표시됩니다.",
    orderMarkingPaid: "결제 완료로 표시하는 중...",
    orderMarkedPaid: "{email} 주문을 결제 완료로 표시했습니다.",
    keyIssuing: "키를 발급하는 중...",
    keyReissuing: "키를 재발급하는 중...",
    emailSending: "이메일을 발송하는 중...",
    licensesEmptyTitle: "발급된 키가 없습니다.",
    licensesEmptyCopy: "키를 발급하면 이 표에 기록됩니다.",
    licenseRevoking: "키를 폐기하는 중...",
    licenseRevoked: "{email} 키를 폐기했습니다.",
    historyEmptyTitle: "표시할 기록이 없습니다.",
    historyEmptyCopy: "결제, 키, 웹훅 이벤트가 발생하면 여기에 누적됩니다.",
    emailPreviewLoading: "이메일 초안을 준비하는 중...",
    issueExpiryLabel: "다음 발급 키 만료일",
    issueExpiryHint: "Issue key 또는 Reissue를 누를 때 적용됩니다. 비워두면 만료일 없는 키를 발급합니다.",
    issueExpiryClear: "만료일 지우기",
    issueExpiryInvalid: "만료일은 YYYY-MM-DD 형식의 유효한 날짜여야 합니다.",
  },
  en: {
    adminH1: "Payments, issuance, and delivery",
    adminLead: "Manage accepted payment methods, review purchase requests, issue signed Pro keys, and keep an auditable history for manual email delivery.",
    authBannerEyebrow: "Admin access",
    authBannerTitle: "Sign in first to unlock live operations.",
    authBannerCopy: "Revenue, collector sync, runtime settings, payment methods, and key issuance stay locked until the admin token is verified.",
    authOverlayLabel: "Sign in with the admin token to unlock this section.",
    tokenLabel: "Admin token",
    tokenApply: "Sign in",
    tokenLogout: "Sign out",
    tokenPlaceholder: "Admin access token",
    tokenStatusDefault: "Sign in required for /api/admin/*",
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
    tokenSaving: "Signing in...",
    tokenCleared: "Signed out.",
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
    revenueEmptyTitle: "No revenue has been recorded yet.",
    revenueEmptyCopy: "Completed payments will show up here automatically.",
    colOrders: "Orders",
    colMonth: "Month",
    colPaid: "Paid",
    colIssued: "Issued",
    mailerOn: "Auto email delivery: ON",
    mailerOff: "Auto email delivery: OFF (manual delivery required)",
    statDeliveryReady: "Awaiting delivery",
    statDeliverySent: "Delivered",
    collectorTitle: "Mention collector",
    collectorCopy: "Review collector health, update polling settings, and run a manual sync.",
    collectorSyncBtn: "Sync now",
    collectorStateLabel: "State",
    collectorLastSuccessLabel: "Last success",
    collectorLastErrorLabel: "Last error",
    collectorHandleLabel: "Threads bot handle",
    collectorHandlePlaceholder: "threadsbot",
    collectorGraphLabel: "Graph API version",
    collectorGraphPlaceholder: "v1.0",
    collectorTokenLabel: "Access token override",
    collectorTokenPlaceholder: "Optional long-lived access token",
    collectorIntervalLabel: "Poll interval (ms)",
    collectorFetchLabel: "Fetch limit",
    collectorPagesLabel: "Max pages",
    collectorPublicHandleLabel: "Public bot account",
    collectorProfileLink: "Open profile",
    collectorHandleCopy: "Changing this updates both the public scrapbook mention target and the collector lookup handle.",
    collectorSaveBtn: "Save collector settings",
    collectorStateRunning: "Running",
    collectorStateReady: "Ready",
    collectorStateDisabled: "Disabled",
    collectorSaving: "Saving collector settings...",
    collectorSaved: "Collector settings saved.",
    collectorSyncing: "Syncing mentions now...",
    collectorSynced: "Collector sync completed.",
    runtimeTitle: "Runtime settings",
    runtimeCopy: "Change public origin, database, and SMTP without editing the server manually.",
    publicOriginLabel: "Public origin",
    publicOriginPlaceholder: "https://ss-threads.dahanda.dev",
    databaseTitle: "Database",
    databaseBackendLabel: "Backend",
    databaseBackendFile: "File",
    databaseBackendPostgres: "Postgres",
    databaseFilePathLabel: "File path",
    databaseFilePathPlaceholder: "/var/app/output/web-admin-data.json",
    databaseUrlLabel: "Postgres URL",
    databaseUrlPlaceholder: "postgres://user:pass@host:5432/db",
    databaseTableLabel: "Table name",
    databaseTablePlaceholder: "threads_web_store",
    databaseStoreKeyLabel: "Store key",
    databaseStoreKeyPlaceholder: "default",
    databaseActiveLabel: "Active database",
    databaseClearUrlLabel: "Clear saved Postgres URL on save",
    databaseUrlConfiguredPlaceholder: "Already configured. Enter a new URL only if you want to replace it.",
    databaseTesting: "Testing database connection...",
    databaseTestBtn: "Test database",
    runtimeSaving: "Saving runtime settings...",
    runtimeSaveBtn: "Save runtime settings",
    runtimeSaved: "Runtime settings saved.",
    runtimeMigrated: "Runtime settings saved and data migrated to the new database.",
    runtimeRestartRequired: "Database settings were saved. Restart the server before using the new backend.",
    smtpTitle: "SMTP",
    smtpHostLabel: "Host",
    smtpHostPlaceholder: "smtp.resend.com",
    smtpPortLabel: "Port",
    smtpUserLabel: "User",
    smtpUserPlaceholder: "apikey",
    smtpPassLabel: "Password",
    smtpPassPlaceholder: "secret",
    smtpFromLabel: "From",
    smtpFromPlaceholder: "hello@example.com",
    smtpSecureLabel: "Use TLS / secure transport",
    smtpClearPassLabel: "Clear saved SMTP password on save",
    smtpPassConfiguredPlaceholder: "Already configured. Enter a new password only if you want to replace it.",
    smtpTesting: "Testing SMTP connection...",
    smtpTestBtn: "Test SMTP",
    storefrontTitle: "Storefront settings",
    storefrontCopy: "Manage the landing page copy shown to buyers.",
    storefrontProductNameLabel: "Product name",
    storefrontSupportEmailLabel: "Support email",
    storefrontHeadlineLabel: "Headline",
    storefrontSubheadlineLabel: "Subheadline",
    storefrontPriceLabelLabel: "Price label",
    storefrontPriceValueLabel: "Price value",
    storefrontUpdatesLabel: "Included updates",
    storefrontHeroNotesLabel: "Hero notes",
    storefrontHeroNotesPlaceholder: "One note per line",
    storefrontFaqsLabel: "FAQs",
    storefrontFaqsPlaceholder: "Question :: Answer",
    storefrontSaving: "Saving storefront settings...",
    storefrontSaveBtn: "Save storefront settings",
    storefrontSaved: "Storefront settings saved.",
    methodEditBtn: "Edit",
    methodSaveBtn: "Save method",
    methodCancelBtn: "Cancel edit",
    methodNamePlaceholder: "Bank transfer",
    methodSummaryPlaceholder: "Manual confirmation for local sales",
    methodInstructionsPlaceholder: "Explain how the buyer should complete or confirm payment.",
    methodActionLabelPlaceholder: "Request purchase",
    methodActionUrlPlaceholder: "https://...",
    methodSaving: "Saving payment method...",
    methodEditing: "Editing payment method.",
    methodSaved: "Payment method updated.",
    methodCreated: "Payment method created.",
    methodEditCancelled: "Edit cancelled.",
    methodsEmptyTitle: "No payment methods yet.",
    methodsEmptyCopy: "Add the first payment method to publish checkout choices.",
    ordersEmptyTitle: "No purchase requests yet.",
    ordersEmptyCopy: "New purchase requests will appear here.",
    orderMarkingPaid: "Marking the order as paid...",
    orderMarkedPaid: "Marked the order for {email} as paid.",
    keyIssuing: "Issuing a key...",
    keyReissuing: "Reissuing a key...",
    emailSending: "Sending email...",
    licensesEmptyTitle: "No issued keys yet.",
    licensesEmptyCopy: "Issued keys will appear here.",
    licenseRevoking: "Revoking the key...",
    licenseRevoked: "Revoked the key for {email}.",
    historyEmptyTitle: "No records to show.",
    historyEmptyCopy: "Payment, key, and webhook events will accumulate here.",
    emailPreviewLoading: "Preparing email preview...",
    issueExpiryLabel: "Expiry date for the next issued key",
    issueExpiryHint: "Applied when you use Issue key or Reissue. Leave it empty for a key without expiry.",
    issueExpiryClear: "Clear expiry",
    issueExpiryInvalid: "Expiry must be a valid YYYY-MM-DD date.",
  },
  ...adminMessageLocales
};

// ─── Scrapbook messages ──────────────────────────────────────────────────────

export const scrapbookMessages = {
  ko: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "댓글 멘션으로 저장한 Threads 글을 private scrapbook에 모으고 Markdown으로 내보냅니다.",
    scrapbookHomeAriaLabel: "Threads 도구 홈",
    scrapbookWorkspaceAriaLabel: "Scrapbook 작업공간",
    scrapbookLocaleLabel: "언어",
    scrapbookNavHome: "홈으로",
    scrapbookNavCurrent: "내 scrapbook",
    scrapbookHeroEyebrow: "멘션 scrapbook",
    scrapbookHeroTitle: "멘션으로 모은 Threads를 private scrapbook에 저장.",
    scrapbookHeroLead:
      "저장하고 싶은 글에 {handleStrong} 을 멘션하면, 서비스 계정은 멘션만 받고 로그인으로 연결한 내 Threads 계정의 scrapbook에만 보관됩니다.",
    scrapbookConnectButton: "Threads로 로그인",
    scrapbookConnectBusy: "Threads로 이동 중...",
    scrapbookCopyLoginLink: "로그인 링크 복사",
    scrapbookHeroHowItWorks: "작동 방식",
    scrapbookMobileOauthNote:
      "모바일에서는 브라우저용 연결 페이지에서 {copyLoginLinkStrong}를 누른 뒤, 새 탭 주소창에 붙여넣는 방식으로 진행해 주세요.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "private scrapbook",
    scrapbookHeroNoteExport: "Markdown export",
    scrapbookFlowLabel: "흐름",
    scrapbookFlowStep1: "내 Threads 계정을 한 번 연결합니다.",
    scrapbookFlowStep2: "Threads에서 저장할 글에 {handleInline} 을 멘션합니다.",
    scrapbookFlowStep3: "저장된 항목을 웹에서 확인하고 Markdown으로 꺼냅니다.",
    scrapbookConnectTag: "Threads 연결",
    scrapbookConnectTitle: "내 Threads 계정 연결",
    scrapbookConnectCopy:
      "여기서는 내 scrapbook 소유 계정만 연결합니다. 서비스 계정은 {handleInline} 으로 따로 운영되고, 로그인한 계정과 댓글 작성 계정이 일치할 때만 내 보관함으로 들어옵니다.",
    scrapbookConnectedTag: "연결됨",
    scrapbookProfileLink: "Threads 프로필 보기",
    scrapbookLogout: "내 계정 연결 끊기",
    scrapbookTabInbox: "Inbox",
    scrapbookTabWatchlists: "Watchlists",
    scrapbookTabSearches: "Searches",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "작동 방식",
    scrapbookHowTitle: "설정은 한 번, 저장은 멘션만.",
    scrapbookHowCopy: "공개 댓글은 트리거 역할만 하고, 저장된 결과는 내 scrapbook에만 보입니다.",
    scrapbookHowStep1Title: "Threads로 로그인",
    scrapbookHowStep1Desc:
      "내 Threads 계정을 연결해 어떤 댓글 작성자가 어떤 scrapbook 소유자인지 서버가 정확히 식별하게 합니다.",
    scrapbookHowStep2Title: "댓글에 봇 멘션",
    scrapbookHowStep2Desc: "저장하고 싶은 글에 {handleInline} 만 멘션하면 수집기가 그 이벤트를 보관합니다.",
    scrapbookHowStep3Title: "웹에서 검토하고 내보내기",
    scrapbookHowStep3Desc: "웹 scrapbook에서 저장 상태를 확인하고 Markdown 복사나 다운로드로 다음 툴로 넘깁니다.",
    scrapbookInboxEyebrow: "Inbox",
    scrapbookInboxTitle: "멘션으로 모은 inbox",
    scrapbookInboxCopy: "저장된 항목은 게시판처럼 한 줄씩 정리되며, 행을 클릭하면 본문과 내보내기 메뉴가 열립니다.",
    scrapbookSelectAll: "전체 선택",
    scrapbookExportSelected: "선택 ZIP 내보내기",
    scrapbookExportAll: "전체 ZIP 내보내기",
    scrapbookArchiveLoginTitle: "로그인이 필요합니다.",
    scrapbookArchiveLoginCopy: "Threads 계정을 연결하면 저장된 멘션이 여기에 나타납니다.",
    scrapbookArchiveTableTitle: "제목",
    scrapbookArchiveTableDate: "수집일자",
    scrapbookArchiveTableSource: "출처",
    scrapbookArchiveTableTags: "태그",
    scrapbookWatchlistsEyebrow: "Watchlists",
    scrapbookWatchlistsTitle: "공개 계정 감시",
    scrapbookWatchlistsCopy: "공개 Threads 계정을 등록하고, 조건에 맞는 새 글만 모읍니다.",
    scrapbookWatchlistTargetHandle: "대상 핸들",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "포함 키워드",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "제외 키워드",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "미디어 타입",
    scrapbookFilterIncludeLabel: "포함",
    scrapbookFilterExcludeLabel: "제외",
    scrapbookFilterMediaLabel: "미디어",
    scrapbookFilterAutoArchiveLabel: "자동 보관",
    scrapbookFilterAuthorLabel: "작성자",
    scrapbookMediaTypeText: "텍스트만",
    scrapbookMediaTypeImage: "이미지",
    scrapbookMediaTypeVideo: "동영상",
    scrapbookMediaTypeCarousel: "캐러셀",
    scrapbookWatchlistAutoArchive: "새 결과를 inbox에도 바로 저장",
    scrapbookWatchlistSubmit: "Watchlist 추가",
    scrapbookWatchlistsEmptyTitle: "등록된 watchlist가 없습니다.",
    scrapbookWatchlistsEmptyCopy: "공개 계정을 추가하면 최근 글을 가져와 scrapbook 규칙으로 정리합니다.",
    scrapbookSearchesEyebrow: "Searches",
    scrapbookSearchesTitle: "키워드 모니터링",
    scrapbookSearchesCopy: "저장 검색어를 등록하고 반복되는 노이즈를 제외한 결과만 추립니다.",
    scrapbookSearchQuery: "검색어",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "작성자 필터",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "제외 핸들",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "검색 방식",
    scrapbookSearchTypeTop: "인기순",
    scrapbookSearchTypeRecent: "최신순",
    scrapbookSearchAutoArchive: "새 결과를 inbox에도 바로 저장",
    scrapbookSearchSubmit: "Search 추가",
    scrapbookSearchesEmptyTitle: "저장된 search monitor가 없습니다.",
    scrapbookSearchesEmptyCopy: "키워드를 등록하면 결과 스트림과 archive 액션을 함께 보여줍니다.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "내 계정 성과 추적",
    scrapbookInsightsCopy: "연결된 Threads 계정의 프로필/포스트 인사이트를 시계열로 저장합니다.",
    scrapbookInsightsRecentSnapshot: "최근 스냅샷",
    scrapbookInsightsNotLoaded: "아직 불러오지 않았습니다.",
    scrapbookInsightsRefresh: "Insights 새로고침",
    scrapbookMetricFollowers: "Followers",
    scrapbookMetricProfileViews: "Profile views",
    scrapbookMetricViews: "Views",
    scrapbookMetricLikes: "Likes",
    scrapbookMetricReplies: "Replies",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "아직 저장된 인사이트가 없습니다.",
    scrapbookInsightsEmptyCopy: "새로고침을 누르면 내 계정과 최근 포스트 성과를 가져옵니다.",
    scrapbookFooterTagline: "Public reply trigger, private scrapbook result.",
    scrapbookDateNone: "없음",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "변화 없음",
    scrapbookConnectServerNotReady:
      "Threads 로그인은 아직 서버 설정 중입니다. 앱 ID와 시크릿이 서버에 들어가면 바로 연결할 수 있습니다.",
    scrapbookArchiveFallbackAuthorPost: "@{handle} post",
    scrapbookArchiveFallbackSavedItem: "저장된 Threads 항목",
    scrapbookArchiveSelectionSummary: "{count}개 선택됨 · 총 {total}개",
    scrapbookArchiveSelectionTotal: "총 {total}개",
    scrapbookMediaIncluded: "media {count}개가 export에 포함됩니다.",
    scrapbookReplyHeader: "작성자 댓글 {count}개",
    scrapbookReplyLabel: "댓글 {index}",
    scrapbookReplyOpenOriginal: "댓글 원문 보기",
    scrapbookCopied: "복사됨",
    scrapbookCopyMarkdown: "Markdown 복사",
    scrapbookClipboardError: "클립보드에 복사하지 못했습니다. 브라우저 권한을 확인하세요.",
    scrapbookExportPreparing: "ZIP 준비 중...",
    scrapbookExportChooseItems: "내보낼 항목을 먼저 선택하세요.",
    scrapbookExportReady: "ZIP export를 준비했습니다. {count}개 항목을 내려받습니다.",
    scrapbookExportFailed: "ZIP export를 만들지 못했습니다.",
    scrapbookTriggerView: "트리거 보기",
    scrapbookImagesHide: "이미지 닫기",
    scrapbookImagesShow: "이미지 {count}개 보기",
    scrapbookOpenOriginal: "원문 보기",
    scrapbookDownloadMarkdown: "Markdown 다운로드",
    scrapbookDownloadZip: "ZIP 다운로드",
    scrapbookArchiveLoginRequiredCopy:
      "Threads 계정을 연결하면 멘션 inbox와 extension cloud 저장 항목이 여기에 함께 나타납니다.",
    scrapbookArchiveEmptyTitle: "아직 저장된 항목이 없습니다.",
    scrapbookArchiveEmptyCopy: "멘션 inbox, extension cloud 저장, watchlist auto-archive, search archive가 여기에 모입니다.",
    scrapbookVerified: "인증됨",
    scrapbookLastLogin: "마지막 로그인 {date}",
    scrapbookProfilePictureAlt: "{name} profile picture",
    scrapbookScopeReady: "권한 준비 완료 · {scopes}",
    scrapbookScopeReconnect: "고급 기능을 쓰려면 Threads 재로그인이 필요합니다. 누락 권한: {scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "원문",
    scrapbookTrackedSaveInbox: "Inbox 저장",
    scrapbookEmptyBody: "(본문 없음)",
    scrapbookWatchlistsLoginTitle: "로그인이 필요합니다.",
    scrapbookWatchlistsLoginCopy: "Threads 계정을 연결해야 watchlists를 만들 수 있습니다.",
    scrapbookWatchlistsReconnectTitle: "권한 재동의가 필요합니다.",
    scrapbookWatchlistsReconnectCopy: "Threads로 다시 로그인하면 profile discovery watchlist를 쓸 수 있습니다.",
    scrapbookWatchlistsResults: "결과 {count}개",
    scrapbookWatchlistsLastSync: "마지막 동기화 {date}",
    scrapbookWatchlistsSyncNow: "지금 동기화",
    scrapbookDelete: "삭제",
    scrapbookArchiveDeleteConfirm: "\"{title}\" 항목을 scrapbook에서 삭제할까요?",
    scrapbookIncludeNone: "없음",
    scrapbookExcludeNone: "없음",
    scrapbookMediaAll: "전체",
    scrapbookAutoArchiveOn: "on",
    scrapbookAutoArchiveOff: "off",
    scrapbookRecentError: "최근 오류: {error}",
    scrapbookWatchlistsNoResultsTitle: "아직 매칭된 결과가 없습니다.",
    scrapbookWatchlistsNoResultsCopy: "동기화를 실행하면 조건에 맞는 새 글이 여기에 나타납니다.",
    scrapbookSearchesLoginTitle: "로그인이 필요합니다.",
    scrapbookSearchesLoginCopy: "Threads 계정을 연결해야 keyword search를 쓸 수 있습니다.",
    scrapbookSearchesReconnectTitle: "권한 재동의가 필요합니다.",
    scrapbookSearchesReconnectCopy: "Threads로 다시 로그인하면 keyword search를 쓸 수 있습니다.",
    scrapbookSearchResults: "결과 {count}개",
    scrapbookSearchMode: "모드 {mode}",
    scrapbookSearchLastRun: "마지막 실행 {date}",
    scrapbookSearchAuthorAll: "전체",
    scrapbookSearchHide: "숨기기",
    scrapbookSearchesNoResultsTitle: "아직 검색 결과가 없습니다.",
    scrapbookSearchesNoResultsCopy: "실행 버튼을 누르면 최신 결과가 채워집니다.",
    scrapbookInsightsRefreshedAt: "{date} 기준",
    scrapbookInsightsNotLoadedYet: "아직 불러오지 않았습니다.",
    scrapbookInsightsLoginTitle: "로그인이 필요합니다.",
    scrapbookInsightsLoginCopy: "Threads 계정을 연결해야 insights를 불러올 수 있습니다.",
    scrapbookInsightsReconnectTitle: "권한 재동의가 필요합니다.",
    scrapbookInsightsReconnectCopy: "Threads로 다시 로그인하면 manage insights를 쓸 수 있습니다.",
    scrapbookInsightsViews: "조회수 {value}",
    scrapbookInsightsLikes: "좋아요 {value}",
    scrapbookInsightsReplies: "답글 {value}",
    scrapbookInsightsReposts: "리포스트 {value}",
    scrapbookInsightsQuotes: "인용 {value}",
    scrapbookStatusConnected: "Threads 계정 연결이 완료되었습니다.",
    scrapbookSessionRouting:
      "이 scrapbook은 @{handle} 계정에 연결되어 있습니다. 공개 댓글에서 @{botHandle} 을 멘션했고, 그 댓글 작성 계정이 @{handle} 이면 여기에 저장됩니다.",
    scrapbookLogoutSuccess: "연결을 해제했습니다.",
    scrapbookLogoutFail: "로그아웃하지 못했습니다.",
    scrapbookStatusLoadFailed: "scrapbook 상태를 불러오지 못했습니다.",
    scrapbookStatusWatchlistSaved: "Watchlist를 저장했습니다.",
    scrapbookStatusWatchlistSynced: "Watchlist를 동기화했습니다.",
    scrapbookStatusWatchlistDeleted: "Watchlist를 삭제했습니다.",
    scrapbookStatusArchiveDeleted: "아카이브를 삭제했습니다.",
    scrapbookStatusTrackedSaved: "결과를 inbox에 저장했습니다.",
    scrapbookStatusSearchSaved: "Search monitor를 저장했습니다.",
    scrapbookStatusSearchRun: "Keyword search를 실행했습니다.",
    scrapbookStatusSearchDeleted: "Search monitor를 삭제했습니다.",
    scrapbookStatusSearchArchived: "검색 결과를 inbox에 저장했습니다.",
    scrapbookStatusSearchDismissed: "검색 결과를 숨겼습니다.",
    scrapbookInsightsRefreshLoading: "불러오는 중...",
    scrapbookStatusInsightsRefreshed: "Insights 스냅샷을 새로 저장했습니다.",
    scrapbookStatusInsightSaved: "인사이트 포스트를 inbox에 저장했습니다."
  },
  en: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "Keep Threads posts saved by reply mentions in a private scrapbook and export them as Markdown.",
    scrapbookHomeAriaLabel: "Threads tools home",
    scrapbookWorkspaceAriaLabel: "Scrapbook workspace",
    scrapbookLocaleLabel: "Language",
    scrapbookNavHome: "Home",
    scrapbookNavCurrent: "My scrapbook",
    scrapbookHeroEyebrow: "Mention scrapbook",
    scrapbookHeroTitle: "Save Threads posts collected by mentions into a private scrapbook.",
    scrapbookHeroLead:
      "Mention {handleStrong} on a post you want to save. The service account only receives the mention, and the result is stored only in the scrapbook tied to your signed-in Threads account.",
    scrapbookConnectButton: "Continue with Threads",
    scrapbookConnectBusy: "Opening Threads...",
    scrapbookCopyLoginLink: "Copy sign-in link",
    scrapbookHeroHowItWorks: "How it works",
    scrapbookMobileOauthNote:
      "On mobile, open the browser-based connect page, tap {copyLoginLinkStrong}, then paste the link into a new tab's address bar.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "private scrapbook",
    scrapbookHeroNoteExport: "Markdown export",
    scrapbookFlowLabel: "Flow",
    scrapbookFlowStep1: "Connect your Threads account once.",
    scrapbookFlowStep2: "Mention {handleInline} on the post you want to save.",
    scrapbookFlowStep3: "Review saved items on the web and export them as Markdown.",
    scrapbookConnectTag: "Connect Threads",
    scrapbookConnectTitle: "Connect your Threads account",
    scrapbookConnectCopy:
      "Only the scrapbook owner account is connected here. The service account runs separately as {handleInline}, and items enter your archive only when the signed-in account matches the reply author account.",
    scrapbookConnectedTag: "Connected",
    scrapbookProfileLink: "Open Threads profile",
    scrapbookLogout: "Disconnect my account",
    scrapbookTabInbox: "Inbox",
    scrapbookTabWatchlists: "Watchlists",
    scrapbookTabSearches: "Searches",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "How it works",
    scrapbookHowTitle: "Set up once, save by mention.",
    scrapbookHowCopy: "Public replies act only as triggers. Saved results stay inside your private scrapbook.",
    scrapbookHowStep1Title: "Sign in with Threads",
    scrapbookHowStep1Desc:
      "Link your Threads account so the server can reliably identify which reply author belongs to which scrapbook owner.",
    scrapbookHowStep2Title: "Mention the bot in a reply",
    scrapbookHowStep2Desc: "Mention only {handleInline} on the post you want to save, and the collector stores that event.",
    scrapbookHowStep3Title: "Review and export on the web",
    scrapbookHowStep3Desc: "Check the saved result in the scrapbook UI, then copy or download it as Markdown for your next tool.",
    scrapbookInboxEyebrow: "Inbox",
    scrapbookInboxTitle: "Inbox collected from mentions",
    scrapbookInboxCopy: "Saved items are organized in a board-style list. Click any row to open the body and export actions.",
    scrapbookSelectAll: "Select all",
    scrapbookExportSelected: "Export selected ZIP",
    scrapbookExportAll: "Export all ZIP",
    scrapbookArchiveLoginTitle: "Sign-in required.",
    scrapbookArchiveLoginCopy: "Connect your Threads account to see saved mentions here.",
    scrapbookArchiveTableTitle: "Title",
    scrapbookArchiveTableDate: "Saved at",
    scrapbookArchiveTableSource: "Source",
    scrapbookArchiveTableTags: "Tags",
    scrapbookWatchlistsEyebrow: "Watchlists",
    scrapbookWatchlistsTitle: "Track public accounts",
    scrapbookWatchlistsCopy: "Register public Threads accounts and collect only new posts that match your rules.",
    scrapbookWatchlistTargetHandle: "Target handle",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "Include keywords",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "Exclude keywords",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "Media type",
    scrapbookFilterIncludeLabel: "include",
    scrapbookFilterExcludeLabel: "exclude",
    scrapbookFilterMediaLabel: "media",
    scrapbookFilterAutoArchiveLabel: "auto archive",
    scrapbookFilterAuthorLabel: "author",
    scrapbookMediaTypeText: "Text only",
    scrapbookMediaTypeImage: "Image",
    scrapbookMediaTypeVideo: "Video",
    scrapbookMediaTypeCarousel: "Carousel",
    scrapbookWatchlistAutoArchive: "Also save new matches into inbox",
    scrapbookWatchlistSubmit: "Add watchlist",
    scrapbookWatchlistsEmptyTitle: "No watchlists yet.",
    scrapbookWatchlistsEmptyCopy: "Add a public account and recent posts will be organized by your scrapbook rules.",
    scrapbookSearchesEyebrow: "Searches",
    scrapbookSearchesTitle: "Monitor keywords",
    scrapbookSearchesCopy: "Save search monitors and filter out recurring noise from the result stream.",
    scrapbookSearchQuery: "Query",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "Author filter",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Exclude handles",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Search mode",
    scrapbookSearchTypeTop: "Top",
    scrapbookSearchTypeRecent: "Recent",
    scrapbookSearchAutoArchive: "Also save new matches into inbox",
    scrapbookSearchSubmit: "Add search",
    scrapbookSearchesEmptyTitle: "No saved search monitors.",
    scrapbookSearchesEmptyCopy: "Register keywords to see the result stream and archive actions together.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "Track account performance",
    scrapbookInsightsCopy: "Store profile and post insights from your connected Threads account as a timeline.",
    scrapbookInsightsRecentSnapshot: "Latest snapshot",
    scrapbookInsightsNotLoaded: "Not loaded yet.",
    scrapbookInsightsRefresh: "Refresh insights",
    scrapbookMetricFollowers: "Followers",
    scrapbookMetricProfileViews: "Profile views",
    scrapbookMetricViews: "Views",
    scrapbookMetricLikes: "Likes",
    scrapbookMetricReplies: "Replies",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "No saved insights yet.",
    scrapbookInsightsEmptyCopy: "Refresh to capture your account and recent post performance.",
    scrapbookFooterTagline: "Public reply trigger, private scrapbook result.",
    scrapbookDateNone: "None",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "No change",
    scrapbookConnectServerNotReady:
      "Threads sign-in is not configured on the server yet. Add the app ID and secret to enable it.",
    scrapbookArchiveFallbackAuthorPost: "@{handle} post",
    scrapbookArchiveFallbackSavedItem: "Saved Threads item",
    scrapbookArchiveSelectionSummary: "{count} selected · {total} total",
    scrapbookArchiveSelectionTotal: "{total} total",
    scrapbookMediaIncluded: "{count} media files will be included in the export.",
    scrapbookReplyHeader: "{count} author replies",
    scrapbookReplyLabel: "reply {index}",
    scrapbookReplyOpenOriginal: "Open original reply",
    scrapbookCopied: "Copied",
    scrapbookCopyMarkdown: "Copy Markdown",
    scrapbookClipboardError: "Could not copy to the clipboard. Check your browser permissions.",
    scrapbookExportPreparing: "Preparing ZIP...",
    scrapbookExportChooseItems: "Select items to export first.",
    scrapbookExportReady: "ZIP export is ready. Downloading {count} items.",
    scrapbookExportFailed: "Could not create the ZIP export.",
    scrapbookTriggerView: "View trigger",
    scrapbookImagesHide: "Hide images",
    scrapbookImagesShow: "Show {count} images",
    scrapbookOpenOriginal: "Open original",
    scrapbookDownloadMarkdown: "Download Markdown",
    scrapbookDownloadZip: "Download ZIP",
    scrapbookArchiveLoginRequiredCopy:
      "Connect your Threads account to see mention inbox items and extension cloud saves together here.",
    scrapbookArchiveEmptyTitle: "No saved items yet.",
    scrapbookArchiveEmptyCopy:
      "Mention inbox items, extension cloud saves, watchlist auto-archives, and search archives all gather here.",
    scrapbookVerified: "verified",
    scrapbookLastLogin: "last login {date}",
    scrapbookProfilePictureAlt: "{name} profile picture",
    scrapbookScopeReady: "Permissions ready · {scopes}",
    scrapbookScopeReconnect: "Sign in with Threads again to use advanced features. Missing scopes: {scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "Open",
    scrapbookTrackedSaveInbox: "Save to inbox",
    scrapbookEmptyBody: "(No text)",
    scrapbookWatchlistsLoginTitle: "Sign-in required.",
    scrapbookWatchlistsLoginCopy: "Connect your Threads account to create watchlists.",
    scrapbookWatchlistsReconnectTitle: "Permission update required.",
    scrapbookWatchlistsReconnectCopy: "Sign in with Threads again to use profile discovery watchlists.",
    scrapbookWatchlistsResults: "{count} results",
    scrapbookWatchlistsLastSync: "last sync {date}",
    scrapbookWatchlistsSyncNow: "Sync now",
    scrapbookDelete: "Delete",
    scrapbookArchiveDeleteConfirm: "Delete \"{title}\" from your scrapbook?",
    scrapbookIncludeNone: "none",
    scrapbookExcludeNone: "none",
    scrapbookMediaAll: "all",
    scrapbookAutoArchiveOn: "on",
    scrapbookAutoArchiveOff: "off",
    scrapbookRecentError: "Recent error: {error}",
    scrapbookWatchlistsNoResultsTitle: "No matching results yet.",
    scrapbookWatchlistsNoResultsCopy: "Run a sync and new matching posts will appear here.",
    scrapbookSearchesLoginTitle: "Sign-in required.",
    scrapbookSearchesLoginCopy: "Connect your Threads account to use keyword search.",
    scrapbookSearchesReconnectTitle: "Permission update required.",
    scrapbookSearchesReconnectCopy: "Sign in with Threads again to use keyword search.",
    scrapbookSearchResults: "{count} results",
    scrapbookSearchMode: "mode {mode}",
    scrapbookSearchLastRun: "last run {date}",
    scrapbookSearchAuthorAll: "all",
    scrapbookSearchHide: "Hide",
    scrapbookSearchesNoResultsTitle: "No search results yet.",
    scrapbookSearchesNoResultsCopy: "Run the search to populate the latest results.",
    scrapbookInsightsRefreshedAt: "Updated {date}",
    scrapbookInsightsNotLoadedYet: "Not loaded yet.",
    scrapbookInsightsLoginTitle: "Sign-in required.",
    scrapbookInsightsLoginCopy: "Connect your Threads account to load insights.",
    scrapbookInsightsReconnectTitle: "Permission update required.",
    scrapbookInsightsReconnectCopy: "Sign in with Threads again to use managed insights.",
    scrapbookInsightsViews: "views {value}",
    scrapbookInsightsLikes: "likes {value}",
    scrapbookInsightsReplies: "replies {value}",
    scrapbookInsightsReposts: "reposts {value}",
    scrapbookInsightsQuotes: "quotes {value}",
    scrapbookStatusConnected: "Your Threads account is connected.",
    scrapbookSessionRouting:
      "This scrapbook is linked to @{handle}. When a public reply mentions @{botHandle} and the reply author account is @{handle}, the item is saved here.",
    scrapbookLogoutSuccess: "Disconnected your account.",
    scrapbookLogoutFail: "Could not log out.",
    scrapbookStatusLoadFailed: "Could not load scrapbook state.",
    scrapbookStatusWatchlistSaved: "Watchlist saved.",
    scrapbookStatusWatchlistSynced: "Watchlist synced.",
    scrapbookStatusWatchlistDeleted: "Watchlist deleted.",
    scrapbookStatusArchiveDeleted: "Archive deleted.",
    scrapbookStatusTrackedSaved: "Saved the result to inbox.",
    scrapbookStatusSearchSaved: "Search monitor saved.",
    scrapbookStatusSearchRun: "Keyword search started.",
    scrapbookStatusSearchDeleted: "Search monitor deleted.",
    scrapbookStatusSearchArchived: "Saved the search result to inbox.",
    scrapbookStatusSearchDismissed: "Search result hidden.",
    scrapbookInsightsRefreshLoading: "Loading...",
    scrapbookStatusInsightsRefreshed: "Saved a fresh insights snapshot.",
    scrapbookStatusInsightSaved: "Saved the insight post to inbox."
  },
  ja: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "返信メンションで保存した Threads 投稿を非公開の scrapbook に集め、Markdown で書き出します。",
    scrapbookHomeAriaLabel: "Threads ツールのホーム",
    scrapbookWorkspaceAriaLabel: "scrapbook ワークスペース",
    scrapbookLocaleLabel: "言語",
    scrapbookNavHome: "ホーム",
    scrapbookNavCurrent: "自分の scrapbook",
    scrapbookHeroEyebrow: "scrapbook por menção",
    scrapbookHeroTitle: "メンションで集めた Threads を非公開の scrapbook に保存。",
    scrapbookHeroLead:
      "保存したい投稿に {handleStrong} をメンションすると、サービス用アカウントはメンションだけを受け取り、サインイン済みの Threads アカウントに紐づく scrapbook にだけ保存します。",
    scrapbookConnectButton: "Threads でログイン",
    scrapbookConnectBusy: "Threads を開いています...",
    scrapbookCopyLoginLink: "ログインリンクをコピー",
    scrapbookHeroHowItWorks: "仕組み",
    scrapbookMobileOauthNote:
      "モバイルではブラウザ用の接続ページで {copyLoginLinkStrong} を押し、そのリンクを新しいタブのアドレスバーに貼り付けて進めてください。",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "private scrapbook",
    scrapbookHeroNoteExport: "Markdown export",
    scrapbookFlowLabel: "Flow",
    scrapbookFlowStep1: "自分の Threads アカウントを一度だけ接続します。",
    scrapbookFlowStep2: "保存したい投稿で {handleInline} をメンションします。",
    scrapbookFlowStep3: "保存された項目を Web で確認し、Markdown として書き出します。",
    scrapbookConnectTag: "Connect Threads",
    scrapbookConnectTitle: "自分の Threads アカウントを接続",
    scrapbookConnectCopy:
      "ここで接続するのは scrapbook の所有アカウントだけです。サービス用アカウントは {handleInline} として別に動作し、サインイン中のアカウントと返信投稿者のアカウントが一致したときだけ保存されます。",
    scrapbookConnectedTag: "Connected",
    scrapbookProfileLink: "Threads プロフィールを開く",
    scrapbookLogout: "アカウント接続を解除",
    scrapbookTabInbox: "Inbox",
    scrapbookTabWatchlists: "Watchlists",
    scrapbookTabSearches: "Searches",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "How it works",
    scrapbookHowTitle: "設定は一度だけ。保存はメンションだけ。",
    scrapbookHowCopy: "公開返信はトリガーとしてだけ使われ、保存結果は自分の scrapbook にだけ表示されます。",
    scrapbookHowStep1Title: "Threads でログイン",
    scrapbookHowStep1Desc:
      "自分の Threads アカウントを接続して、どの返信投稿者がどの scrapbook 所有者なのかをサーバーが正確に判定できるようにします。",
    scrapbookHowStep2Title: "返信でボットをメンション",
    scrapbookHowStep2Desc: "保存したい投稿で {handleInline} だけをメンションすると、収集側がそのイベントを保管します。",
    scrapbookHowStep3Title: "Web で確認してエクスポート",
    scrapbookHowStep3Desc: "scrapbook 画面で保存状態を確認し、Markdown のコピーやダウンロードで次のツールへ渡します。",
    scrapbookInboxEyebrow: "Inbox",
    scrapbookInboxTitle: "メンションから集まる inbox",
    scrapbookInboxCopy: "保存項目はボード形式で並び、行を押すと本文とエクスポートメニューが開きます。",
    scrapbookSelectAll: "すべて選択",
    scrapbookExportSelected: "選択した ZIP を書き出し",
    scrapbookExportAll: "すべて ZIP を書き出し",
    scrapbookArchiveLoginTitle: "ログインが必要です。",
    scrapbookArchiveLoginCopy: "Threads アカウントを接続すると、保存済みメンションがここに表示されます。",
    scrapbookArchiveTableTitle: "タイトル",
    scrapbookArchiveTableDate: "保存日時",
    scrapbookArchiveTableSource: "ソース",
    scrapbookArchiveTableTags: "タグ",
    scrapbookWatchlistsEyebrow: "Watchlists",
    scrapbookWatchlistsTitle: "公開アカウントを監視",
    scrapbookWatchlistsCopy: "公開 Threads アカウントを登録し、条件に合う新規投稿だけを集めます。",
    scrapbookWatchlistTargetHandle: "対象ハンドル",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "含めるキーワード",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "除外キーワード",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "メディア種別",
    scrapbookFilterIncludeLabel: "含める",
    scrapbookFilterExcludeLabel: "除外",
    scrapbookFilterMediaLabel: "メディア",
    scrapbookFilterAutoArchiveLabel: "自動保存",
    scrapbookFilterAuthorLabel: "投稿者",
    scrapbookMediaTypeText: "テキストのみ",
    scrapbookMediaTypeImage: "画像",
    scrapbookMediaTypeVideo: "動画",
    scrapbookMediaTypeCarousel: "カルーセル",
    scrapbookWatchlistAutoArchive: "新しい一致を inbox にも保存",
    scrapbookWatchlistSubmit: "Watchlist を追加",
    scrapbookWatchlistsEmptyTitle: "watchlist はまだありません。",
    scrapbookWatchlistsEmptyCopy: "公開アカウントを追加すると、最近の投稿が scrapbook ルールで整理されます。",
    scrapbookSearchesEyebrow: "Searches",
    scrapbookSearchesTitle: "キーワード監視",
    scrapbookSearchesCopy: "検索モニターを保存し、繰り返し出るノイズを除外して結果を絞り込みます。",
    scrapbookSearchQuery: "検索語",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "投稿者フィルター",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "除外ハンドル",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "検索モード",
    scrapbookSearchTypeTop: "人気",
    scrapbookSearchTypeRecent: "最新",
    scrapbookSearchAutoArchive: "新しい一致を inbox にも保存",
    scrapbookSearchSubmit: "Search を追加",
    scrapbookSearchesEmptyTitle: "保存済みの検索モニターはありません。",
    scrapbookSearchesEmptyCopy: "キーワードを登録すると、結果ストリームとアーカイブ操作をまとめて確認できます。",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "自分のアカウント成果を追跡",
    scrapbookInsightsCopy: "接続した Threads アカウントのプロフィールと投稿インサイトを時系列で保存します。",
    scrapbookInsightsRecentSnapshot: "最新スナップショット",
    scrapbookInsightsNotLoaded: "まだ読み込まれていません。",
    scrapbookInsightsRefresh: "Insights を更新",
    scrapbookMetricFollowers: "Followers",
    scrapbookMetricProfileViews: "Profile views",
    scrapbookMetricViews: "Views",
    scrapbookMetricLikes: "Likes",
    scrapbookMetricReplies: "Replies",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "保存されたインサイトはまだありません。",
    scrapbookInsightsEmptyCopy: "更新を押すと、自分のアカウントと最近の投稿パフォーマンスを取得します。",
    scrapbookFooterTagline: "Public reply trigger, private scrapbook result.",
    scrapbookDateNone: "なし",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "変化なし",
    scrapbookConnectServerNotReady:
      "Threads ログインはまだサーバーで設定されていません。アプリ ID とシークレットを追加すると利用できます。",
    scrapbookArchiveFallbackAuthorPost: "@{handle} の投稿",
    scrapbookArchiveFallbackSavedItem: "保存された Threads 項目",
    scrapbookArchiveSelectionSummary: "{count}件を選択中 · 合計{total}件",
    scrapbookArchiveSelectionTotal: "合計{total}件",
    scrapbookMediaIncluded: "{count}件のメディアがエクスポートに含まれます。",
    scrapbookReplyHeader: "投稿者の返信 {count}件",
    scrapbookReplyLabel: "返信 {index}",
    scrapbookReplyOpenOriginal: "返信の原文を見る",
    scrapbookCopied: "コピー済み",
    scrapbookCopyMarkdown: "Markdown をコピー",
    scrapbookClipboardError: "クリップボードにコピーできませんでした。ブラウザ権限を確認してください。",
    scrapbookExportPreparing: "ZIP を準備中...",
    scrapbookExportChooseItems: "先にエクスポートする項目を選択してください。",
    scrapbookExportReady: "ZIP エクスポートを用意しました。{count}件をダウンロードします。",
    scrapbookExportFailed: "ZIP エクスポートを作成できませんでした。",
    scrapbookTriggerView: "トリガーを見る",
    scrapbookImagesHide: "画像を閉じる",
    scrapbookImagesShow: "画像を{count}枚表示",
    scrapbookOpenOriginal: "原文を見る",
    scrapbookDownloadMarkdown: "Markdown をダウンロード",
    scrapbookDownloadZip: "ZIP をダウンロード",
    scrapbookArchiveLoginRequiredCopy:
      "Threads アカウントを接続すると、メンション inbox と extension cloud 保存がここに一緒に表示されます。",
    scrapbookArchiveEmptyTitle: "保存された項目はまだありません。",
    scrapbookArchiveEmptyCopy:
      "メンション inbox、extension cloud 保存、watchlist の自動アーカイブ、search アーカイブがここに集まります。",
    scrapbookVerified: "認証済み",
    scrapbookLastLogin: "最終ログイン {date}",
    scrapbookProfilePictureAlt: "{name} のプロフィール画像",
    scrapbookScopeReady: "権限準備完了 · {scopes}",
    scrapbookScopeReconnect: "高度な機能を使うには Threads に再ログインしてください。不足権限: {scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "原文",
    scrapbookTrackedSaveInbox: "Inbox に保存",
    scrapbookEmptyBody: "(本文なし)",
    scrapbookWatchlistsLoginTitle: "ログインが必要です。",
    scrapbookWatchlistsLoginCopy: "watchlist を作成するには Threads アカウントを接続してください。",
    scrapbookWatchlistsReconnectTitle: "権限の再同意が必要です。",
    scrapbookWatchlistsReconnectCopy: "Threads に再ログインすると profile discovery watchlist を使えます。",
    scrapbookWatchlistsResults: "結果 {count}件",
    scrapbookWatchlistsLastSync: "最終同期 {date}",
    scrapbookWatchlistsSyncNow: "今すぐ同期",
    scrapbookDelete: "削除",
    scrapbookArchiveDeleteConfirm: "「{title}」を scrapbook から削除しますか？",
    scrapbookIncludeNone: "なし",
    scrapbookExcludeNone: "なし",
    scrapbookMediaAll: "すべて",
    scrapbookAutoArchiveOn: "on",
    scrapbookAutoArchiveOff: "off",
    scrapbookRecentError: "最近のエラー: {error}",
    scrapbookWatchlistsNoResultsTitle: "一致した結果はまだありません。",
    scrapbookWatchlistsNoResultsCopy: "同期を実行すると、条件に合う新しい投稿がここに表示されます。",
    scrapbookSearchesLoginTitle: "ログインが必要です。",
    scrapbookSearchesLoginCopy: "keyword search を使うには Threads アカウントを接続してください。",
    scrapbookSearchesReconnectTitle: "権限の再同意が必要です。",
    scrapbookSearchesReconnectCopy: "Threads に再ログインすると keyword search を使えます。",
    scrapbookSearchResults: "結果 {count}件",
    scrapbookSearchMode: "モード {mode}",
    scrapbookSearchLastRun: "最終実行 {date}",
    scrapbookSearchAuthorAll: "すべて",
    scrapbookSearchHide: "非表示",
    scrapbookSearchesNoResultsTitle: "検索結果はまだありません。",
    scrapbookSearchesNoResultsCopy: "実行ボタンを押すと最新結果が表示されます。",
    scrapbookInsightsRefreshedAt: "{date} 時点",
    scrapbookInsightsNotLoadedYet: "まだ読み込まれていません。",
    scrapbookInsightsLoginTitle: "ログインが必要です。",
    scrapbookInsightsLoginCopy: "Insights を読み込むには Threads アカウントを接続してください。",
    scrapbookInsightsReconnectTitle: "権限の再同意が必要です。",
    scrapbookInsightsReconnectCopy: "Threads に再ログインすると manage insights を使えます。",
    scrapbookInsightsViews: "閲覧数 {value}",
    scrapbookInsightsLikes: "いいね {value}",
    scrapbookInsightsReplies: "返信 {value}",
    scrapbookInsightsReposts: "リポスト {value}",
    scrapbookInsightsQuotes: "引用 {value}",
    scrapbookStatusConnected: "Threads アカウントの接続が完了しました。",
    scrapbookSessionRouting:
      "この scrapbook は @{handle} に接続されています。公開返信で @{botHandle} がメンションされ、その返信投稿者が @{handle} であれば、ここに保存されます。",
    scrapbookLogoutSuccess: "接続を解除しました。",
    scrapbookLogoutFail: "ログアウトできませんでした。",
    scrapbookStatusLoadFailed: "scrapbook の状態を読み込めませんでした。",
    scrapbookStatusWatchlistSaved: "Watchlist を保存しました。",
    scrapbookStatusWatchlistSynced: "Watchlist を同期しました。",
    scrapbookStatusWatchlistDeleted: "Watchlist を削除しました。",
    scrapbookStatusArchiveDeleted: "アーカイブを削除しました。",
    scrapbookStatusTrackedSaved: "結果を inbox に保存しました。",
    scrapbookStatusSearchSaved: "Search monitor を保存しました。",
    scrapbookStatusSearchRun: "Keyword search を実行しました。",
    scrapbookStatusSearchDeleted: "Search monitor を削除しました。",
    scrapbookStatusSearchArchived: "検索結果を inbox に保存しました。",
    scrapbookStatusSearchDismissed: "検索結果を非表示にしました。",
    scrapbookInsightsRefreshLoading: "読み込み中...",
    scrapbookStatusInsightsRefreshed: "新しい insights スナップショットを保存しました。",
    scrapbookStatusInsightSaved: "インサイト投稿を inbox に保存しました。"
  },
  "pt-BR": {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "Guarde posts do Threads salvos por menções em respostas em um scrapbook privado e exporte tudo em Markdown.",
    scrapbookHomeAriaLabel: "Página inicial das ferramentas Threads",
    scrapbookWorkspaceAriaLabel: "Área de trabalho do scrapbook",
    scrapbookLocaleLabel: "Idioma",
    scrapbookNavHome: "Início",
    scrapbookNavCurrent: "Meu scrapbook",
    scrapbookHeroEyebrow: "Mention scrapbook",
    scrapbookHeroTitle: "Salve no scrapbook privado os Threads coletados por menções.",
    scrapbookHeroLead:
      "Mencione {handleStrong} no post que deseja salvar. A conta do serviço recebe apenas a menção, e o resultado é guardado somente no scrapbook ligado à sua conta do Threads conectada.",
    scrapbookConnectButton: "Entrar com Threads",
    scrapbookConnectBusy: "Abrindo o Threads...",
    scrapbookCopyLoginLink: "Copiar link de login",
    scrapbookHeroHowItWorks: "Como funciona",
    scrapbookMobileOauthNote:
      "No celular, abra a página de conexão no navegador, toque em {copyLoginLinkStrong} e depois cole o link na barra de endereço de uma nova aba.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "scrapbook privado",
    scrapbookHeroNoteExport: "exportação em Markdown",
    scrapbookFlowLabel: "Fluxo de salvamento",
    scrapbookFlowStep1: "Conecte sua conta do Threads uma vez.",
    scrapbookFlowStep2: "Mencione {handleInline} no post que deseja salvar.",
    scrapbookFlowStep3: "Revise os itens salvos na web e exporte em Markdown.",
    scrapbookConnectTag: "Conectar Threads",
    scrapbookConnectTitle: "Conecte sua conta do Threads",
    scrapbookConnectCopy:
      "Aqui você conecta apenas a conta proprietária do scrapbook. A conta de serviço roda separadamente como {handleInline}, e os itens entram no seu arquivo somente quando a conta conectada corresponde à conta autora da resposta.",
    scrapbookConnectedTag: "Conectado",
    scrapbookProfileLink: "Abrir perfil no Threads",
    scrapbookLogout: "Desconectar minha conta",
    scrapbookTabInbox: "Caixa de entrada",
    scrapbookTabWatchlists: "Listas de monitoramento",
    scrapbookTabSearches: "Buscas",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "Como funciona",
    scrapbookHowTitle: "Configure uma vez, salve por menção.",
    scrapbookHowCopy: "As respostas públicas servem apenas como gatilho. Os resultados salvos ficam somente no seu scrapbook privado.",
    scrapbookHowStep1Title: "Entrar com Threads",
    scrapbookHowStep1Desc:
      "Conecte sua conta do Threads para que o servidor identifique com precisão qual autor de resposta pertence a qual dono de scrapbook.",
    scrapbookHowStep2Title: "Mencione o bot na resposta",
    scrapbookHowStep2Desc: "Mencione apenas {handleInline} no post que deseja salvar, e o coletor registra esse evento.",
    scrapbookHowStep3Title: "Revise e exporte na web",
    scrapbookHowStep3Desc: "Confira o resultado salvo na interface do scrapbook e copie ou baixe em Markdown para usar na próxima ferramenta.",
    scrapbookInboxEyebrow: "Caixa de entrada",
    scrapbookInboxTitle: "Inbox coletada por menções",
    scrapbookInboxCopy: "Os itens salvos aparecem em formato de quadro. Clique em uma linha para abrir o conteúdo e as ações de exportação.",
    scrapbookSelectAll: "Selecionar tudo",
    scrapbookExportSelected: "Exportar ZIP selecionado",
    scrapbookExportAll: "Exportar ZIP completo",
    scrapbookArchiveLoginTitle: "É necessário entrar.",
    scrapbookArchiveLoginCopy: "Conecte sua conta do Threads para ver aqui as menções salvas.",
    scrapbookArchiveTableTitle: "Título",
    scrapbookArchiveTableDate: "Salvo em",
    scrapbookArchiveTableSource: "Origem",
    scrapbookArchiveTableTags: "Tags",
    scrapbookWatchlistsEyebrow: "Listas de monitoramento",
    scrapbookWatchlistsTitle: "Monitorar contas públicas",
    scrapbookWatchlistsCopy: "Cadastre contas públicas do Threads e colete apenas os novos posts que combinarem com suas regras.",
    scrapbookWatchlistTargetHandle: "Handle alvo",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "Palavras incluídas",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "Palavras excluídas",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "Tipo de mídia",
    scrapbookFilterIncludeLabel: "incluir",
    scrapbookFilterExcludeLabel: "excluir",
    scrapbookFilterMediaLabel: "mídia",
    scrapbookFilterAutoArchiveLabel: "arquivamento automático",
    scrapbookFilterAuthorLabel: "autor",
    scrapbookMediaTypeText: "Somente texto",
    scrapbookMediaTypeImage: "Imagem",
    scrapbookMediaTypeVideo: "Vídeo",
    scrapbookMediaTypeCarousel: "Carrossel",
    scrapbookWatchlistAutoArchive: "Salvar novos resultados também na inbox",
    scrapbookWatchlistSubmit: "Adicionar watchlist",
    scrapbookWatchlistsEmptyTitle: "Ainda não há watchlists.",
    scrapbookWatchlistsEmptyCopy: "Adicione uma conta pública para organizar os posts recentes com suas regras do scrapbook.",
    scrapbookSearchesEyebrow: "Buscas",
    scrapbookSearchesTitle: "Monitorar palavras-chave",
    scrapbookSearchesCopy: "Salve monitores de busca e filtre ruídos recorrentes no fluxo de resultados.",
    scrapbookSearchQuery: "Consulta",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "Filtro de autor",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Handles excluídos",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Modo de busca",
    scrapbookSearchTypeTop: "Em alta",
    scrapbookSearchTypeRecent: "Recentes",
    scrapbookSearchAutoArchive: "Salvar novos resultados também na inbox",
    scrapbookSearchSubmit: "Adicionar busca",
    scrapbookSearchesEmptyTitle: "Nenhum monitor de busca salvo.",
    scrapbookSearchesEmptyCopy: "Cadastre palavras-chave para ver o fluxo de resultados junto com as ações de arquivamento.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "Acompanhar o desempenho da conta",
    scrapbookInsightsCopy: "Salve em linha do tempo os insights de perfil e posts da sua conta do Threads conectada.",
    scrapbookInsightsRecentSnapshot: "Último snapshot",
    scrapbookInsightsNotLoaded: "Ainda não carregado.",
    scrapbookInsightsRefresh: "Atualizar insights",
    scrapbookMetricFollowers: "Seguidores",
    scrapbookMetricProfileViews: "Visualizações do perfil",
    scrapbookMetricViews: "Visualizações",
    scrapbookMetricLikes: "Curtidas",
    scrapbookMetricReplies: "Respostas",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "Ainda não há insights salvos.",
    scrapbookInsightsEmptyCopy: "Atualize para capturar o desempenho da sua conta e dos posts recentes.",
    scrapbookFooterTagline: "Gatilho público por resposta, resultado privado no scrapbook.",
    scrapbookDateNone: "Nenhum",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "Sem mudança",
    scrapbookConnectServerNotReady:
      "O login com Threads ainda não está configurado no servidor. Adicione o app ID e o segredo para habilitar.",
    scrapbookArchiveFallbackAuthorPost: "post de @{handle}",
    scrapbookArchiveFallbackSavedItem: "Item salvo do Threads",
    scrapbookArchiveSelectionSummary: "{count} selecionados · {total} no total",
    scrapbookArchiveSelectionTotal: "{total} no total",
    scrapbookMediaIncluded: "{count} arquivos de mídia serão incluídos na exportação.",
    scrapbookReplyHeader: "{count} respostas do autor",
    scrapbookReplyLabel: "resposta {index}",
    scrapbookReplyOpenOriginal: "Abrir resposta original",
    scrapbookCopied: "Copiado",
    scrapbookCopyMarkdown: "Copiar Markdown",
    scrapbookClipboardError: "Não foi possível copiar para a área de transferência. Verifique as permissões do navegador.",
    scrapbookExportPreparing: "Preparando ZIP...",
    scrapbookExportChooseItems: "Selecione primeiro os itens que deseja exportar.",
    scrapbookExportReady: "A exportação ZIP está pronta. Baixando {count} itens.",
    scrapbookExportFailed: "Não foi possível criar a exportação ZIP.",
    scrapbookTriggerView: "Ver gatilho",
    scrapbookImagesHide: "Ocultar imagens",
    scrapbookImagesShow: "Mostrar {count} imagens",
    scrapbookOpenOriginal: "Abrir original",
    scrapbookDownloadMarkdown: "Baixar Markdown",
    scrapbookDownloadZip: "Baixar ZIP",
    scrapbookArchiveLoginRequiredCopy:
      "Conecte sua conta do Threads para ver aqui juntos a inbox de menções e os salvamentos cloud da extensão.",
    scrapbookArchiveEmptyTitle: "Ainda não há itens salvos.",
    scrapbookArchiveEmptyCopy:
      "Inbox de menções, salvamentos cloud da extensão, auto-arquivos de watchlist e arquivos de busca aparecem todos aqui.",
    scrapbookVerified: "verificado",
    scrapbookLastLogin: "último login {date}",
    scrapbookProfilePictureAlt: "foto de perfil de {name}",
    scrapbookScopeReady: "Escopos prontos · {scopes}",
    scrapbookScopeReconnect: "Entre novamente com Threads para usar recursos avançados. Escopos ausentes: {scopes}",
    scrapbookScopeUpgrade: "atualização de escopo",
    scrapbookTrackedOpen: "Abrir",
    scrapbookTrackedSaveInbox: "Salvar na inbox",
    scrapbookEmptyBody: "(Sem texto)",
    scrapbookWatchlistsLoginTitle: "É necessário entrar.",
    scrapbookWatchlistsLoginCopy: "Conecte sua conta do Threads para criar watchlists.",
    scrapbookWatchlistsReconnectTitle: "É necessário atualizar as permissões.",
    scrapbookWatchlistsReconnectCopy: "Entre novamente com Threads para usar watchlists de descoberta de perfil.",
    scrapbookWatchlistsResults: "{count} resultados",
    scrapbookWatchlistsLastSync: "última sincronização {date}",
    scrapbookWatchlistsSyncNow: "Sincronizar agora",
    scrapbookDelete: "Excluir",
    scrapbookArchiveDeleteConfirm: "Excluir \"{title}\" do scrapbook?",
    scrapbookIncludeNone: "nenhum",
    scrapbookExcludeNone: "nenhum",
    scrapbookMediaAll: "todos",
    scrapbookAutoArchiveOn: "ativado",
    scrapbookAutoArchiveOff: "desativado",
    scrapbookRecentError: "Erro recente: {error}",
    scrapbookWatchlistsNoResultsTitle: "Ainda não há resultados correspondentes.",
    scrapbookWatchlistsNoResultsCopy: "Execute uma sincronização para ver aqui novos posts compatíveis.",
    scrapbookSearchesLoginTitle: "É necessário entrar.",
    scrapbookSearchesLoginCopy: "Conecte sua conta do Threads para usar busca por palavra-chave.",
    scrapbookSearchesReconnectTitle: "É necessário atualizar as permissões.",
    scrapbookSearchesReconnectCopy: "Entre novamente com Threads para usar busca por palavra-chave.",
    scrapbookSearchResults: "{count} resultados",
    scrapbookSearchMode: "modo {mode}",
    scrapbookSearchLastRun: "última execução {date}",
    scrapbookSearchAuthorAll: "todos",
    scrapbookSearchHide: "Ocultar",
    scrapbookSearchesNoResultsTitle: "Ainda não há resultados de busca.",
    scrapbookSearchesNoResultsCopy: "Execute a busca para preencher os resultados mais recentes.",
    scrapbookInsightsRefreshedAt: "Atualizado em {date}",
    scrapbookInsightsNotLoadedYet: "Ainda não carregado.",
    scrapbookInsightsLoginTitle: "É necessário entrar.",
    scrapbookInsightsLoginCopy: "Conecte sua conta do Threads para carregar os insights.",
    scrapbookInsightsReconnectTitle: "É necessário atualizar as permissões.",
    scrapbookInsightsReconnectCopy: "Entre novamente com Threads para usar insights gerenciados.",
    scrapbookInsightsViews: "visualizações {value}",
    scrapbookInsightsLikes: "curtidas {value}",
    scrapbookInsightsReplies: "respostas {value}",
    scrapbookInsightsReposts: "republicações {value}",
    scrapbookInsightsQuotes: "citações {value}",
    scrapbookStatusConnected: "Sua conta do Threads foi conectada.",
    scrapbookSessionRouting:
      "Este scrapbook está vinculado a @{handle}. Quando uma resposta pública menciona @{botHandle} e a conta autora da resposta é @{handle}, o item é salvo aqui.",
    scrapbookLogoutSuccess: "Sua conta foi desconectada.",
    scrapbookLogoutFail: "Não foi possível sair.",
    scrapbookStatusLoadFailed: "Não foi possível carregar o estado do scrapbook.",
    scrapbookStatusWatchlistSaved: "Watchlist salva.",
    scrapbookStatusWatchlistSynced: "Watchlist sincronizada.",
    scrapbookStatusWatchlistDeleted: "Watchlist excluída.",
    scrapbookStatusArchiveDeleted: "Arquivo excluído.",
    scrapbookStatusTrackedSaved: "Resultado salvo na inbox.",
    scrapbookStatusSearchSaved: "Monitor de busca salvo.",
    scrapbookStatusSearchRun: "Busca por palavra-chave executada.",
    scrapbookStatusSearchDeleted: "Monitor de busca excluído.",
    scrapbookStatusSearchArchived: "Resultado de busca salvo na inbox.",
    scrapbookStatusSearchDismissed: "Resultado de busca ocultado.",
    scrapbookInsightsRefreshLoading: "Carregando...",
    scrapbookStatusInsightsRefreshed: "Novo snapshot de insights salvo.",
    scrapbookStatusInsightSaved: "Post de insight salvo na inbox."
  },
  es: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "Guarda publicaciones de Threads salvadas por menciones en respuestas dentro de un scrapbook privado y expórtalas en Markdown.",
    scrapbookHomeAriaLabel: "Inicio de herramientas de Threads",
    scrapbookWorkspaceAriaLabel: "Espacio de trabajo de scrapbook",
    scrapbookLocaleLabel: "Idioma",
    scrapbookNavHome: "Inicio",
    scrapbookNavCurrent: "Mi scrapbook",
    scrapbookHeroEyebrow: "scrapbook por menciones",
    scrapbookHeroTitle: "Guarda en un scrapbook privado los Threads recogidos por menciones.",
    scrapbookHeroLead:
      "Menciona {handleStrong} en la publicación que quieras guardar. La cuenta del servicio solo recibe la mención y el resultado se almacena únicamente en el scrapbook vinculado a tu cuenta de Threads conectada.",
    scrapbookConnectButton: "Iniciar sesión con Threads",
    scrapbookConnectBusy: "Abriendo Threads...",
    scrapbookCopyLoginLink: "Copiar enlace de acceso",
    scrapbookHeroHowItWorks: "Cómo funciona",
    scrapbookMobileOauthNote:
      "En móvil, abre la página de conexión en el navegador, pulsa {copyLoginLinkStrong} y luego pega el enlace en la barra de direcciones de una nueva pestaña.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "scrapbook privado",
    scrapbookHeroNoteExport: "exportación Markdown",
    scrapbookFlowLabel: "Flujo de guardado",
    scrapbookFlowStep1: "Conecta tu cuenta de Threads una sola vez.",
    scrapbookFlowStep2: "Menciona {handleInline} en la publicación que quieras guardar.",
    scrapbookFlowStep3: "Revisa los elementos guardados en la web y expórtalos como Markdown.",
    scrapbookConnectTag: "Conectar Threads",
    scrapbookConnectTitle: "Conecta tu cuenta de Threads",
    scrapbookConnectCopy:
      "Aquí solo conectas la cuenta propietaria del scrapbook. La cuenta del servicio funciona aparte como {handleInline}, y los elementos entran en tu archivo solo cuando la cuenta conectada coincide con la cuenta autora de la respuesta.",
    scrapbookConnectedTag: "Conectado",
    scrapbookProfileLink: "Abrir perfil de Threads",
    scrapbookLogout: "Desconectar mi cuenta",
    scrapbookTabInbox: "Bandeja",
    scrapbookTabWatchlists: "Listas de seguimiento",
    scrapbookTabSearches: "Búsquedas",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "Cómo funciona",
    scrapbookHowTitle: "Configura una vez, guarda con una mención.",
    scrapbookHowCopy: "Las respuestas públicas solo actúan como disparador. Los resultados guardados permanecen en tu scrapbook privado.",
    scrapbookHowStep1Title: "Iniciar sesión con Threads",
    scrapbookHowStep1Desc:
      "Conecta tu cuenta de Threads para que el servidor identifique con precisión qué autor de respuesta pertenece a qué propietario de scrapbook.",
    scrapbookHowStep2Title: "Menciona al bot en la respuesta",
    scrapbookHowStep2Desc: "Menciona solo {handleInline} en la publicación que quieras guardar y el recolector almacenará ese evento.",
    scrapbookHowStep3Title: "Revisa y exporta en la web",
    scrapbookHowStep3Desc: "Consulta el resultado guardado en la interfaz del scrapbook y luego cópialo o descárgalo en Markdown para tu siguiente herramienta.",
    scrapbookInboxEyebrow: "Bandeja",
    scrapbookInboxTitle: "Inbox reunida por menciones",
    scrapbookInboxCopy: "Los elementos guardados se muestran en una lista tipo tablero. Haz clic en una fila para abrir el contenido y las acciones de exportación.",
    scrapbookSelectAll: "Seleccionar todo",
    scrapbookExportSelected: "Exportar ZIP seleccionado",
    scrapbookExportAll: "Exportar todo en ZIP",
    scrapbookArchiveLoginTitle: "Se requiere iniciar sesión.",
    scrapbookArchiveLoginCopy: "Conecta tu cuenta de Threads para ver aquí las menciones guardadas.",
    scrapbookArchiveTableTitle: "Título",
    scrapbookArchiveTableDate: "Guardado el",
    scrapbookArchiveTableSource: "Origen",
    scrapbookArchiveTableTags: "Etiquetas",
    scrapbookWatchlistsEyebrow: "Listas de seguimiento",
    scrapbookWatchlistsTitle: "Vigilar cuentas públicas",
    scrapbookWatchlistsCopy: "Registra cuentas públicas de Threads y recopila solo las nuevas publicaciones que coincidan con tus reglas.",
    scrapbookWatchlistTargetHandle: "Handle objetivo",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "Palabras incluidas",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "Palabras excluidas",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "Tipo de medio",
    scrapbookFilterIncludeLabel: "incluir",
    scrapbookFilterExcludeLabel: "excluir",
    scrapbookFilterMediaLabel: "medio",
    scrapbookFilterAutoArchiveLabel: "archivo automático",
    scrapbookFilterAuthorLabel: "autor",
    scrapbookMediaTypeText: "Solo texto",
    scrapbookMediaTypeImage: "Imagen",
    scrapbookMediaTypeVideo: "Video",
    scrapbookMediaTypeCarousel: "Carrusel",
    scrapbookWatchlistAutoArchive: "Guardar también los nuevos resultados en inbox",
    scrapbookWatchlistSubmit: "Añadir watchlist",
    scrapbookWatchlistsEmptyTitle: "Todavía no hay watchlists.",
    scrapbookWatchlistsEmptyCopy: "Añade una cuenta pública para organizar las publicaciones recientes con tus reglas del scrapbook.",
    scrapbookSearchesEyebrow: "Búsquedas",
    scrapbookSearchesTitle: "Supervisar palabras clave",
    scrapbookSearchesCopy: "Guarda monitores de búsqueda y filtra el ruido repetitivo del flujo de resultados.",
    scrapbookSearchQuery: "Consulta",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "Filtro de autor",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Handles excluidos",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Modo de búsqueda",
    scrapbookSearchTypeTop: "Destacados",
    scrapbookSearchTypeRecent: "Recientes",
    scrapbookSearchAutoArchive: "Guardar también los nuevos resultados en inbox",
    scrapbookSearchSubmit: "Añadir búsqueda",
    scrapbookSearchesEmptyTitle: "No hay monitores de búsqueda guardados.",
    scrapbookSearchesEmptyCopy: "Registra palabras clave para ver el flujo de resultados junto con las acciones de archivo.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "Seguir el rendimiento de la cuenta",
    scrapbookInsightsCopy: "Guarda en una línea temporal los insights del perfil y de las publicaciones de tu cuenta conectada de Threads.",
    scrapbookInsightsRecentSnapshot: "Última captura",
    scrapbookInsightsNotLoaded: "Todavía no se ha cargado.",
    scrapbookInsightsRefresh: "Actualizar insights",
    scrapbookMetricFollowers: "Seguidores",
    scrapbookMetricProfileViews: "Vistas del perfil",
    scrapbookMetricViews: "Vistas",
    scrapbookMetricLikes: "Me gusta",
    scrapbookMetricReplies: "Respuestas",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "Aún no hay insights guardados.",
    scrapbookInsightsEmptyCopy: "Actualiza para capturar el rendimiento de tu cuenta y de tus publicaciones recientes.",
    scrapbookFooterTagline: "Disparador público por respuesta, resultado privado en el scrapbook.",
    scrapbookDateNone: "Ninguno",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "Sin cambios",
    scrapbookConnectServerNotReady:
      "El inicio de sesión con Threads todavía no está configurado en el servidor. Añade el app ID y el secreto para habilitarlo.",
    scrapbookArchiveFallbackAuthorPost: "publicación de @{handle}",
    scrapbookArchiveFallbackSavedItem: "Elemento guardado de Threads",
    scrapbookArchiveSelectionSummary: "{count} seleccionados · {total} en total",
    scrapbookArchiveSelectionTotal: "{total} en total",
    scrapbookMediaIncluded: "Se incluirán {count} archivos multimedia en la exportación.",
    scrapbookReplyHeader: "{count} respuestas del autor",
    scrapbookReplyLabel: "respuesta {index}",
    scrapbookReplyOpenOriginal: "Abrir respuesta original",
    scrapbookCopied: "Copiado",
    scrapbookCopyMarkdown: "Copiar Markdown",
    scrapbookClipboardError: "No se pudo copiar al portapapeles. Revisa los permisos del navegador.",
    scrapbookExportPreparing: "Preparando ZIP...",
    scrapbookExportChooseItems: "Selecciona primero los elementos que quieres exportar.",
    scrapbookExportReady: "La exportación ZIP está lista. Se descargarán {count} elementos.",
    scrapbookExportFailed: "No se pudo crear la exportación ZIP.",
    scrapbookTriggerView: "Ver disparador",
    scrapbookImagesHide: "Ocultar imágenes",
    scrapbookImagesShow: "Mostrar {count} imágenes",
    scrapbookOpenOriginal: "Abrir original",
    scrapbookDownloadMarkdown: "Descargar Markdown",
    scrapbookDownloadZip: "Descargar ZIP",
    scrapbookArchiveLoginRequiredCopy:
      "Conecta tu cuenta de Threads para ver aquí juntos la inbox de menciones y los guardados cloud de la extensión.",
    scrapbookArchiveEmptyTitle: "Todavía no hay elementos guardados.",
    scrapbookArchiveEmptyCopy:
      "Aquí se reúnen la inbox de menciones, los guardados cloud de la extensión, los autoarchivados de watchlist y los archivos de búsqueda.",
    scrapbookVerified: "verificado",
    scrapbookLastLogin: "último acceso {date}",
    scrapbookProfilePictureAlt: "foto de perfil de {name}",
    scrapbookScopeReady: "Permisos listos · {scopes}",
    scrapbookScopeReconnect: "Vuelve a iniciar sesión con Threads para usar funciones avanzadas. Permisos faltantes: {scopes}",
    scrapbookScopeUpgrade: "actualización de permisos",
    scrapbookTrackedOpen: "Abrir",
    scrapbookTrackedSaveInbox: "Guardar en inbox",
    scrapbookEmptyBody: "(Sin texto)",
    scrapbookWatchlistsLoginTitle: "Se requiere iniciar sesión.",
    scrapbookWatchlistsLoginCopy: "Conecta tu cuenta de Threads para crear watchlists.",
    scrapbookWatchlistsReconnectTitle: "Se requiere actualizar permisos.",
    scrapbookWatchlistsReconnectCopy: "Vuelve a iniciar sesión con Threads para usar watchlists de descubrimiento de perfiles.",
    scrapbookWatchlistsResults: "{count} resultados",
    scrapbookWatchlistsLastSync: "última sincronización {date}",
    scrapbookWatchlistsSyncNow: "Sincronizar ahora",
    scrapbookDelete: "Eliminar",
    scrapbookArchiveDeleteConfirm: "¿Eliminar \"{title}\" del scrapbook?",
    scrapbookIncludeNone: "ninguno",
    scrapbookExcludeNone: "ninguno",
    scrapbookMediaAll: "todos",
    scrapbookAutoArchiveOn: "activado",
    scrapbookAutoArchiveOff: "desactivado",
    scrapbookRecentError: "Error reciente: {error}",
    scrapbookWatchlistsNoResultsTitle: "Todavía no hay resultados coincidentes.",
    scrapbookWatchlistsNoResultsCopy: "Ejecuta una sincronización y aquí aparecerán las nuevas publicaciones coincidentes.",
    scrapbookSearchesLoginTitle: "Se requiere iniciar sesión.",
    scrapbookSearchesLoginCopy: "Conecta tu cuenta de Threads para usar búsqueda por palabras clave.",
    scrapbookSearchesReconnectTitle: "Se requiere actualizar permisos.",
    scrapbookSearchesReconnectCopy: "Vuelve a iniciar sesión con Threads para usar búsqueda por palabras clave.",
    scrapbookSearchResults: "{count} resultados",
    scrapbookSearchMode: "modo {mode}",
    scrapbookSearchLastRun: "última ejecución {date}",
    scrapbookSearchAuthorAll: "todos",
    scrapbookSearchHide: "Ocultar",
    scrapbookSearchesNoResultsTitle: "Todavía no hay resultados de búsqueda.",
    scrapbookSearchesNoResultsCopy: "Ejecuta la búsqueda para cargar los resultados más recientes.",
    scrapbookInsightsRefreshedAt: "Actualizado {date}",
    scrapbookInsightsNotLoadedYet: "Todavía no se ha cargado.",
    scrapbookInsightsLoginTitle: "Se requiere iniciar sesión.",
    scrapbookInsightsLoginCopy: "Conecta tu cuenta de Threads para cargar los insights.",
    scrapbookInsightsReconnectTitle: "Se requiere actualizar permisos.",
    scrapbookInsightsReconnectCopy: "Vuelve a iniciar sesión con Threads para usar insights gestionados.",
    scrapbookInsightsViews: "vistas {value}",
    scrapbookInsightsLikes: "me gusta {value}",
    scrapbookInsightsReplies: "respuestas {value}",
    scrapbookInsightsReposts: "republicaciones {value}",
    scrapbookInsightsQuotes: "citas {value}",
    scrapbookStatusConnected: "Tu cuenta de Threads está conectada.",
    scrapbookSessionRouting:
      "Este scrapbook está vinculado a @{handle}. Cuando una respuesta pública menciona a @{botHandle} y la cuenta autora de la respuesta es @{handle}, el elemento se guarda aquí.",
    scrapbookLogoutSuccess: "Tu cuenta se desconectó.",
    scrapbookLogoutFail: "No se pudo cerrar sesión.",
    scrapbookStatusLoadFailed: "No se pudo cargar el estado del scrapbook.",
    scrapbookStatusWatchlistSaved: "Watchlist guardada.",
    scrapbookStatusWatchlistSynced: "Watchlist sincronizada.",
    scrapbookStatusWatchlistDeleted: "Watchlist eliminada.",
    scrapbookStatusArchiveDeleted: "Archivo eliminado.",
    scrapbookStatusTrackedSaved: "Resultado guardado en inbox.",
    scrapbookStatusSearchSaved: "Monitor de búsqueda guardado.",
    scrapbookStatusSearchRun: "Búsqueda por palabra clave ejecutada.",
    scrapbookStatusSearchDeleted: "Monitor de búsqueda eliminado.",
    scrapbookStatusSearchArchived: "Resultado de búsqueda guardado en inbox.",
    scrapbookStatusSearchDismissed: "Resultado de búsqueda ocultado.",
    scrapbookInsightsRefreshLoading: "Cargando...",
    scrapbookStatusInsightsRefreshed: "Se guardó un nuevo snapshot de insights.",
    scrapbookStatusInsightSaved: "La publicación de insights se guardó en inbox."
  },
  "zh-TW": {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "把透過留言提及保存的 Threads 貼文集中到私密 scrapbook，並匯出成 Markdown。",
    scrapbookHomeAriaLabel: "Threads 工具首頁",
    scrapbookWorkspaceAriaLabel: "scrapbook 工作區",
    scrapbookLocaleLabel: "語言",
    scrapbookNavHome: "首頁",
    scrapbookNavCurrent: "我的 scrapbook",
    scrapbookHeroEyebrow: "提及 scrapbook",
    scrapbookHeroTitle: "把透過提及收集的 Threads 存進私密 scrapbook。",
    scrapbookHeroLead:
      "在想保存的貼文中提及 {handleStrong}。服務帳號只會收到提及訊號，內容只會存進與你登入 Threads 帳號綁定的 scrapbook。",
    scrapbookConnectButton: "使用 Threads 登入",
    scrapbookConnectBusy: "正在開啟 Threads...",
    scrapbookCopyLoginLink: "複製登入連結",
    scrapbookHeroHowItWorks: "運作方式",
    scrapbookMobileOauthNote:
      "在手機上，請先開啟瀏覽器版連線頁面，按下 {copyLoginLinkStrong}，再把連結貼到新分頁的網址列中繼續。",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "私密 scrapbook",
    scrapbookHeroNoteExport: "Markdown 匯出",
    scrapbookFlowLabel: "保存流程",
    scrapbookFlowStep1: "先把你的 Threads 帳號連線一次。",
    scrapbookFlowStep2: "在想保存的貼文提及 {handleInline}。",
    scrapbookFlowStep3: "在網頁上檢查保存結果，並匯出成 Markdown。",
    scrapbookConnectTag: "連線 Threads",
    scrapbookConnectTitle: "連線你的 Threads 帳號",
    scrapbookConnectCopy:
      "這裡只連線 scrapbook 擁有者帳號。服務帳號會另外以 {handleInline} 運作，只有當登入帳號與留言作者帳號一致時，內容才會進入你的收藏。",
    scrapbookConnectedTag: "已連線",
    scrapbookProfileLink: "開啟 Threads 個人檔案",
    scrapbookLogout: "解除我的帳號連線",
    scrapbookTabInbox: "收件匣",
    scrapbookTabWatchlists: "監看清單",
    scrapbookTabSearches: "搜尋",
    scrapbookTabInsights: "洞察",
    scrapbookHowEyebrow: "運作方式",
    scrapbookHowTitle: "設定一次，靠提及保存。",
    scrapbookHowCopy: "公開留言只負責觸發，真正保存的結果只會顯示在你的私密 scrapbook。",
    scrapbookHowStep1Title: "使用 Threads 登入",
    scrapbookHowStep1Desc:
      "先連線你的 Threads 帳號，讓伺服器能正確辨識哪個留言作者屬於哪個 scrapbook 擁有者。",
    scrapbookHowStep2Title: "在留言中提及機器人",
    scrapbookHowStep2Desc: "在想保存的貼文中只提及 {handleInline}，收集器就會記錄這個事件。",
    scrapbookHowStep3Title: "在網頁上檢查並匯出",
    scrapbookHowStep3Desc: "在 scrapbook 介面確認保存內容，然後用 Markdown 複製或下載到下一個工具。",
    scrapbookInboxEyebrow: "收件匣",
    scrapbookInboxTitle: "由提及收集的 inbox",
    scrapbookInboxCopy: "保存的項目會以看板清單呈現，點擊任一列即可開啟內容與匯出操作。",
    scrapbookSelectAll: "全選",
    scrapbookExportSelected: "匯出所選 ZIP",
    scrapbookExportAll: "匯出全部 ZIP",
    scrapbookArchiveLoginTitle: "需要登入。",
    scrapbookArchiveLoginCopy: "連線 Threads 帳號後，保存的提及就會顯示在這裡。",
    scrapbookArchiveTableTitle: "標題",
    scrapbookArchiveTableDate: "保存時間",
    scrapbookArchiveTableSource: "來源",
    scrapbookArchiveTableTags: "標籤",
    scrapbookWatchlistsEyebrow: "監看清單",
    scrapbookWatchlistsTitle: "追蹤公開帳號",
    scrapbookWatchlistsCopy: "註冊公開 Threads 帳號，只收集符合規則的新貼文。",
    scrapbookWatchlistTargetHandle: "目標 handle",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "包含關鍵字",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "排除關鍵字",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "媒體類型",
    scrapbookFilterIncludeLabel: "包含",
    scrapbookFilterExcludeLabel: "排除",
    scrapbookFilterMediaLabel: "媒體",
    scrapbookFilterAutoArchiveLabel: "自動封存",
    scrapbookFilterAuthorLabel: "作者",
    scrapbookMediaTypeText: "純文字",
    scrapbookMediaTypeImage: "圖片",
    scrapbookMediaTypeVideo: "影片",
    scrapbookMediaTypeCarousel: "輪播",
    scrapbookWatchlistAutoArchive: "新結果也同步保存到 inbox",
    scrapbookWatchlistSubmit: "新增 watchlist",
    scrapbookWatchlistsEmptyTitle: "目前還沒有 watchlist。",
    scrapbookWatchlistsEmptyCopy: "加入公開帳號後，最近貼文會依照你的 scrapbook 規則整理。",
    scrapbookSearchesEyebrow: "搜尋",
    scrapbookSearchesTitle: "監控關鍵字",
    scrapbookSearchesCopy: "保存搜尋監控，排除重複雜訊，只留下需要的結果流。",
    scrapbookSearchQuery: "搜尋詞",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "作者篩選",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "排除 handles",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "搜尋模式",
    scrapbookSearchTypeTop: "熱門",
    scrapbookSearchTypeRecent: "最新",
    scrapbookSearchAutoArchive: "新結果也同步保存到 inbox",
    scrapbookSearchSubmit: "新增 search",
    scrapbookSearchesEmptyTitle: "目前沒有已保存的 search monitor。",
    scrapbookSearchesEmptyCopy: "加入關鍵字後，就能同時看到結果流與封存操作。",
    scrapbookInsightsEyebrow: "洞察",
    scrapbookInsightsTitle: "追蹤帳號表現",
    scrapbookInsightsCopy: "把已連線 Threads 帳號的個人檔案與貼文 insights 以時間線方式保存。",
    scrapbookInsightsRecentSnapshot: "最近快照",
    scrapbookInsightsNotLoaded: "尚未載入。",
    scrapbookInsightsRefresh: "重新整理 Insights",
    scrapbookMetricFollowers: "追蹤者",
    scrapbookMetricProfileViews: "個人檔案瀏覽",
    scrapbookMetricViews: "瀏覽次數",
    scrapbookMetricLikes: "按讚",
    scrapbookMetricReplies: "回覆",
    scrapbookMetricReposts: "轉發",
    scrapbookInsightsEmptyTitle: "目前還沒有保存的 insights。",
    scrapbookInsightsEmptyCopy: "按下重新整理後，就會抓取你的帳號與最近貼文表現。",
    scrapbookFooterTagline: "公開留言觸發，私密 scrapbook 保存。",
    scrapbookDateNone: "無",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "沒有變化",
    scrapbookConnectServerNotReady:
      "伺服器端尚未完成 Threads 登入設定。加入 app ID 與 secret 後即可啟用。",
    scrapbookArchiveFallbackAuthorPost: "@{handle} 的貼文",
    scrapbookArchiveFallbackSavedItem: "已保存的 Threads 項目",
    scrapbookArchiveSelectionSummary: "已選 {count} 項 · 共 {total} 項",
    scrapbookArchiveSelectionTotal: "共 {total} 項",
    scrapbookMediaIncluded: "匯出會包含 {count} 個媒體檔。",
    scrapbookReplyHeader: "作者回覆 {count} 則",
    scrapbookReplyLabel: "回覆 {index}",
    scrapbookReplyOpenOriginal: "查看原始回覆",
    scrapbookCopied: "已複製",
    scrapbookCopyMarkdown: "複製 Markdown",
    scrapbookClipboardError: "無法複製到剪貼簿。請檢查瀏覽器權限。",
    scrapbookExportPreparing: "正在準備 ZIP...",
    scrapbookExportChooseItems: "請先選擇要匯出的項目。",
    scrapbookExportReady: "ZIP 匯出已準備完成，正在下載 {count} 項。",
    scrapbookExportFailed: "無法建立 ZIP 匯出。",
    scrapbookTriggerView: "查看觸發留言",
    scrapbookImagesHide: "收起圖片",
    scrapbookImagesShow: "顯示 {count} 張圖片",
    scrapbookOpenOriginal: "查看原文",
    scrapbookDownloadMarkdown: "下載 Markdown",
    scrapbookDownloadZip: "下載 ZIP",
    scrapbookArchiveLoginRequiredCopy:
      "連線 Threads 帳號後，這裡會同時顯示提及 inbox 與 extension cloud 保存內容。",
    scrapbookArchiveEmptyTitle: "目前還沒有保存的項目。",
    scrapbookArchiveEmptyCopy:
      "提及 inbox、extension cloud 保存、watchlist 自動封存與 search archive 都會集中在這裡。",
    scrapbookVerified: "已驗證",
    scrapbookLastLogin: "上次登入 {date}",
    scrapbookProfilePictureAlt: "{name} 的個人頭像",
    scrapbookScopeReady: "權限已就緒 · {scopes}",
    scrapbookScopeReconnect: "若要使用進階功能，請重新登入 Threads。缺少權限：{scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "開啟",
    scrapbookTrackedSaveInbox: "保存到 inbox",
    scrapbookEmptyBody: "（無本文）",
    scrapbookWatchlistsLoginTitle: "需要登入。",
    scrapbookWatchlistsLoginCopy: "必須先連線 Threads 帳號才能建立 watchlists。",
    scrapbookWatchlistsReconnectTitle: "需要重新同意權限。",
    scrapbookWatchlistsReconnectCopy: "重新登入 Threads 後即可使用 profile discovery watchlist。",
    scrapbookWatchlistsResults: "{count} 筆結果",
    scrapbookWatchlistsLastSync: "上次同步 {date}",
    scrapbookWatchlistsSyncNow: "立即同步",
    scrapbookDelete: "刪除",
    scrapbookArchiveDeleteConfirm: "要從 scrapbook 刪除「{title}」嗎？",
    scrapbookIncludeNone: "無",
    scrapbookExcludeNone: "無",
    scrapbookMediaAll: "全部",
    scrapbookAutoArchiveOn: "開啟",
    scrapbookAutoArchiveOff: "關閉",
    scrapbookRecentError: "最近錯誤：{error}",
    scrapbookWatchlistsNoResultsTitle: "目前還沒有符合的結果。",
    scrapbookWatchlistsNoResultsCopy: "執行同步後，符合條件的新貼文就會顯示在這裡。",
    scrapbookSearchesLoginTitle: "需要登入。",
    scrapbookSearchesLoginCopy: "必須先連線 Threads 帳號才能使用 keyword search。",
    scrapbookSearchesReconnectTitle: "需要重新同意權限。",
    scrapbookSearchesReconnectCopy: "重新登入 Threads 後即可使用 keyword search。",
    scrapbookSearchResults: "{count} 筆結果",
    scrapbookSearchMode: "模式 {mode}",
    scrapbookSearchLastRun: "上次執行 {date}",
    scrapbookSearchAuthorAll: "全部",
    scrapbookSearchHide: "隱藏",
    scrapbookSearchesNoResultsTitle: "目前還沒有搜尋結果。",
    scrapbookSearchesNoResultsCopy: "執行搜尋後，這裡就會填入最新結果。",
    scrapbookInsightsRefreshedAt: "{date} 更新",
    scrapbookInsightsNotLoadedYet: "尚未載入。",
    scrapbookInsightsLoginTitle: "需要登入。",
    scrapbookInsightsLoginCopy: "必須先連線 Threads 帳號才能載入 insights。",
    scrapbookInsightsReconnectTitle: "需要重新同意權限。",
    scrapbookInsightsReconnectCopy: "重新登入 Threads 後即可使用 managed insights。",
    scrapbookInsightsViews: "瀏覽 {value}",
    scrapbookInsightsLikes: "按讚 {value}",
    scrapbookInsightsReplies: "回覆 {value}",
    scrapbookInsightsReposts: "轉發 {value}",
    scrapbookInsightsQuotes: "引用 {value}",
    scrapbookStatusConnected: "你的 Threads 帳號已完成連線。",
    scrapbookSessionRouting:
      "這個 scrapbook 已綁定 @{handle}。當公開留言提及 @{botHandle}，而留言作者帳號就是 @{handle} 時，內容就會保存到這裡。",
    scrapbookLogoutSuccess: "已解除帳號連線。",
    scrapbookLogoutFail: "無法登出。",
    scrapbookStatusLoadFailed: "無法載入 scrapbook 狀態。",
    scrapbookStatusWatchlistSaved: "已保存 watchlist。",
    scrapbookStatusWatchlistSynced: "已同步 watchlist。",
    scrapbookStatusWatchlistDeleted: "已刪除 watchlist。",
    scrapbookStatusArchiveDeleted: "已刪除封存項目。",
    scrapbookStatusTrackedSaved: "已把結果保存到 inbox。",
    scrapbookStatusSearchSaved: "已保存 search monitor。",
    scrapbookStatusSearchRun: "已執行 keyword search。",
    scrapbookStatusSearchDeleted: "已刪除 search monitor。",
    scrapbookStatusSearchArchived: "已把搜尋結果保存到 inbox。",
    scrapbookStatusSearchDismissed: "已隱藏搜尋結果。",
    scrapbookInsightsRefreshLoading: "載入中...",
    scrapbookStatusInsightsRefreshed: "已保存新的 insights 快照。",
    scrapbookStatusInsightSaved: "已把 insight 貼文保存到 inbox。"
  },
  vi: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription:
      "Lưu các bài Threads được đánh dấu bằng lượt mention vào scrapbook riêng tư và xuất ra Markdown.",
    scrapbookHomeAriaLabel: "Trang chủ công cụ Threads",
    scrapbookWorkspaceAriaLabel: "Không gian làm việc scrapbook",
    scrapbookLocaleLabel: "Ngôn ngữ",
    scrapbookNavHome: "Trang chủ",
    scrapbookNavCurrent: "scrapbook của tôi",
    scrapbookHeroEyebrow: "scrapbook bằng mention",
    scrapbookHeroTitle: "Lưu các bài Threads được gom bằng mention vào scrapbook riêng tư.",
    scrapbookHeroLead:
      "Hãy mention {handleStrong} trong bài bạn muốn lưu. Tài khoản dịch vụ chỉ nhận tín hiệu mention, còn nội dung chỉ được lưu vào scrapbook gắn với tài khoản Threads bạn đã đăng nhập.",
    scrapbookConnectButton: "Đăng nhập bằng Threads",
    scrapbookConnectBusy: "Đang mở Threads...",
    scrapbookCopyLoginLink: "Sao chép liên kết đăng nhập",
    scrapbookHeroHowItWorks: "Cách hoạt động",
    scrapbookMobileOauthNote:
      "Trên di động, hãy mở trang kết nối bằng trình duyệt, bấm {copyLoginLinkStrong}, rồi dán liên kết vào thanh địa chỉ của tab mới để tiếp tục.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "scrapbook riêng tư",
    scrapbookHeroNoteExport: "xuất Markdown",
    scrapbookFlowLabel: "Luồng lưu",
    scrapbookFlowStep1: "Kết nối tài khoản Threads của bạn một lần.",
    scrapbookFlowStep2: "Mention {handleInline} trong bài bạn muốn lưu.",
    scrapbookFlowStep3: "Xem lại mục đã lưu trên web và xuất ra Markdown.",
    scrapbookConnectTag: "Kết nối Threads",
    scrapbookConnectTitle: "Kết nối tài khoản Threads của bạn",
    scrapbookConnectCopy:
      "Ở đây chỉ kết nối tài khoản chủ sở hữu scrapbook. Tài khoản dịch vụ chạy riêng dưới tên {handleInline}, và mục chỉ vào kho lưu trữ của bạn khi tài khoản đang đăng nhập trùng với tài khoản đã viết reply.",
    scrapbookConnectedTag: "Đã kết nối",
    scrapbookProfileLink: "Mở hồ sơ Threads",
    scrapbookLogout: "Ngắt kết nối tài khoản của tôi",
    scrapbookTabInbox: "Hộp thư",
    scrapbookTabWatchlists: "Danh sách theo dõi",
    scrapbookTabSearches: "Tìm kiếm",
    scrapbookTabInsights: "Phân tích",
    scrapbookHowEyebrow: "Cách hoạt động",
    scrapbookHowTitle: "Thiết lập một lần, lưu bằng mention.",
    scrapbookHowCopy: "Reply công khai chỉ đóng vai trò kích hoạt. Kết quả đã lưu chỉ xuất hiện trong scrapbook riêng của bạn.",
    scrapbookHowStep1Title: "Đăng nhập bằng Threads",
    scrapbookHowStep1Desc:
      "Kết nối tài khoản Threads để máy chủ xác định chính xác ai là người viết reply và thuộc scrapbook nào.",
    scrapbookHowStep2Title: "Mention bot trong reply",
    scrapbookHowStep2Desc: "Chỉ cần mention {handleInline} trong bài muốn lưu, bộ thu thập sẽ ghi lại sự kiện đó.",
    scrapbookHowStep3Title: "Xem lại và xuất trên web",
    scrapbookHowStep3Desc: "Kiểm tra kết quả đã lưu trong giao diện scrapbook rồi sao chép hoặc tải Markdown sang công cụ tiếp theo.",
    scrapbookInboxEyebrow: "Hộp thư",
    scrapbookInboxTitle: "Inbox được gom từ mention",
    scrapbookInboxCopy: "Các mục đã lưu được sắp thành danh sách kiểu bảng. Bấm vào từng dòng để mở nội dung và thao tác xuất.",
    scrapbookSelectAll: "Chọn tất cả",
    scrapbookExportSelected: "Xuất ZIP đã chọn",
    scrapbookExportAll: "Xuất toàn bộ ZIP",
    scrapbookArchiveLoginTitle: "Cần đăng nhập.",
    scrapbookArchiveLoginCopy: "Kết nối tài khoản Threads để xem các mention đã lưu tại đây.",
    scrapbookArchiveTableTitle: "Tiêu đề",
    scrapbookArchiveTableDate: "Thời điểm lưu",
    scrapbookArchiveTableSource: "Nguồn",
    scrapbookArchiveTableTags: "Thẻ",
    scrapbookWatchlistsEyebrow: "Danh sách theo dõi",
    scrapbookWatchlistsTitle: "Theo dõi tài khoản công khai",
    scrapbookWatchlistsCopy: "Đăng ký tài khoản Threads công khai và chỉ thu các bài mới khớp với điều kiện của bạn.",
    scrapbookWatchlistTargetHandle: "Handle mục tiêu",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "Từ khóa bao gồm",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "Từ khóa loại trừ",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "Loại media",
    scrapbookFilterIncludeLabel: "bao gồm",
    scrapbookFilterExcludeLabel: "loại trừ",
    scrapbookFilterMediaLabel: "phương tiện",
    scrapbookFilterAutoArchiveLabel: "tự động lưu trữ",
    scrapbookFilterAuthorLabel: "tác giả",
    scrapbookMediaTypeText: "Chỉ văn bản",
    scrapbookMediaTypeImage: "Hình ảnh",
    scrapbookMediaTypeVideo: "Video",
    scrapbookMediaTypeCarousel: "Băng chuyền",
    scrapbookWatchlistAutoArchive: "Lưu kết quả mới vào inbox luôn",
    scrapbookWatchlistSubmit: "Thêm watchlist",
    scrapbookWatchlistsEmptyTitle: "Chưa có watchlist nào.",
    scrapbookWatchlistsEmptyCopy: "Thêm một tài khoản công khai để bài đăng gần đây được sắp xếp theo quy tắc scrapbook của bạn.",
    scrapbookSearchesEyebrow: "Tìm kiếm",
    scrapbookSearchesTitle: "Giám sát từ khóa",
    scrapbookSearchesCopy: "Lưu bộ theo dõi tìm kiếm và lọc bớt nhiễu lặp lại khỏi luồng kết quả.",
    scrapbookSearchQuery: "Từ khóa",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "Bộ lọc tác giả",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Handle loại trừ",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Chế độ tìm kiếm",
    scrapbookSearchTypeTop: "Nổi bật",
    scrapbookSearchTypeRecent: "Mới nhất",
    scrapbookSearchAutoArchive: "Lưu kết quả mới vào inbox luôn",
    scrapbookSearchSubmit: "Thêm search",
    scrapbookSearchesEmptyTitle: "Chưa có search monitor nào được lưu.",
    scrapbookSearchesEmptyCopy: "Đăng ký từ khóa để xem luồng kết quả cùng các thao tác lưu trữ.",
    scrapbookInsightsEyebrow: "Phân tích",
    scrapbookInsightsTitle: "Theo dõi hiệu suất tài khoản",
    scrapbookInsightsCopy: "Lưu insight hồ sơ và bài viết của tài khoản Threads đã kết nối theo dạng dòng thời gian.",
    scrapbookInsightsRecentSnapshot: "Ảnh chụp gần nhất",
    scrapbookInsightsNotLoaded: "Chưa tải.",
    scrapbookInsightsRefresh: "Làm mới Insights",
    scrapbookMetricFollowers: "Người theo dõi",
    scrapbookMetricProfileViews: "Lượt xem hồ sơ",
    scrapbookMetricViews: "Lượt xem",
    scrapbookMetricLikes: "Lượt thích",
    scrapbookMetricReplies: "Phản hồi",
    scrapbookMetricReposts: "Bài đăng lại",
    scrapbookInsightsEmptyTitle: "Chưa có insight nào được lưu.",
    scrapbookInsightsEmptyCopy: "Bấm làm mới để lấy hiệu suất tài khoản và các bài gần đây của bạn.",
    scrapbookFooterTagline: "Reply công khai làm tín hiệu, scrapbook riêng tư giữ kết quả.",
    scrapbookDateNone: "Không có",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "Không thay đổi",
    scrapbookConnectServerNotReady:
      "Đăng nhập Threads vẫn chưa được cấu hình trên máy chủ. Thêm app ID và secret để bật tính năng này.",
    scrapbookArchiveFallbackAuthorPost: "bài viết của @{handle}",
    scrapbookArchiveFallbackSavedItem: "Mục Threads đã lưu",
    scrapbookArchiveSelectionSummary: "Đã chọn {count} · tổng {total}",
    scrapbookArchiveSelectionTotal: "Tổng {total}",
    scrapbookMediaIncluded: "Bản xuất sẽ gồm {count} tệp media.",
    scrapbookReplyHeader: "{count} reply của tác giả",
    scrapbookReplyLabel: "phản hồi {index}",
    scrapbookReplyOpenOriginal: "Xem reply gốc",
    scrapbookCopied: "Đã sao chép",
    scrapbookCopyMarkdown: "Sao chép Markdown",
    scrapbookClipboardError: "Không thể sao chép vào clipboard. Hãy kiểm tra quyền của trình duyệt.",
    scrapbookExportPreparing: "Đang chuẩn bị ZIP...",
    scrapbookExportChooseItems: "Hãy chọn mục cần xuất trước.",
    scrapbookExportReady: "Bản xuất ZIP đã sẵn sàng. Đang tải xuống {count} mục.",
    scrapbookExportFailed: "Không thể tạo bản xuất ZIP.",
    scrapbookTriggerView: "Xem trigger",
    scrapbookImagesHide: "Ẩn hình ảnh",
    scrapbookImagesShow: "Hiện {count} hình ảnh",
    scrapbookOpenOriginal: "Mở bài gốc",
    scrapbookDownloadMarkdown: "Tải Markdown",
    scrapbookDownloadZip: "Tải ZIP",
    scrapbookArchiveLoginRequiredCopy:
      "Kết nối tài khoản Threads để xem cùng lúc inbox mention và các mục cloud save từ extension tại đây.",
    scrapbookArchiveEmptyTitle: "Chưa có mục nào được lưu.",
    scrapbookArchiveEmptyCopy:
      "Inbox mention, cloud save từ extension, auto-archive của watchlist và search archive đều tập trung tại đây.",
    scrapbookVerified: "đã xác minh",
    scrapbookLastLogin: "đăng nhập gần nhất {date}",
    scrapbookProfilePictureAlt: "ảnh hồ sơ của {name}",
    scrapbookScopeReady: "Quyền đã sẵn sàng · {scopes}",
    scrapbookScopeReconnect: "Hãy đăng nhập lại bằng Threads để dùng tính năng nâng cao. Quyền còn thiếu: {scopes}",
    scrapbookScopeUpgrade: "nâng cấp scope",
    scrapbookTrackedOpen: "Mở",
    scrapbookTrackedSaveInbox: "Lưu vào inbox",
    scrapbookEmptyBody: "(Không có nội dung)",
    scrapbookWatchlistsLoginTitle: "Cần đăng nhập.",
    scrapbookWatchlistsLoginCopy: "Kết nối tài khoản Threads để tạo watchlists.",
    scrapbookWatchlistsReconnectTitle: "Cần cấp lại quyền.",
    scrapbookWatchlistsReconnectCopy: "Đăng nhập lại bằng Threads để dùng watchlist khám phá hồ sơ.",
    scrapbookWatchlistsResults: "{count} kết quả",
    scrapbookWatchlistsLastSync: "lần đồng bộ gần nhất {date}",
    scrapbookWatchlistsSyncNow: "Đồng bộ ngay",
    scrapbookDelete: "Xóa",
    scrapbookArchiveDeleteConfirm: "Xóa \"{title}\" khỏi scrapbook?",
    scrapbookIncludeNone: "không có",
    scrapbookExcludeNone: "không có",
    scrapbookMediaAll: "tất cả",
    scrapbookAutoArchiveOn: "bật",
    scrapbookAutoArchiveOff: "tắt",
    scrapbookRecentError: "Lỗi gần đây: {error}",
    scrapbookWatchlistsNoResultsTitle: "Chưa có kết quả khớp.",
    scrapbookWatchlistsNoResultsCopy: "Hãy chạy đồng bộ để các bài mới phù hợp xuất hiện tại đây.",
    scrapbookSearchesLoginTitle: "Cần đăng nhập.",
    scrapbookSearchesLoginCopy: "Kết nối tài khoản Threads để dùng tìm kiếm theo từ khóa.",
    scrapbookSearchesReconnectTitle: "Cần cấp lại quyền.",
    scrapbookSearchesReconnectCopy: "Đăng nhập lại bằng Threads để dùng tìm kiếm theo từ khóa.",
    scrapbookSearchResults: "{count} kết quả",
    scrapbookSearchMode: "chế độ {mode}",
    scrapbookSearchLastRun: "lần chạy gần nhất {date}",
    scrapbookSearchAuthorAll: "tất cả",
    scrapbookSearchHide: "Ẩn",
    scrapbookSearchesNoResultsTitle: "Chưa có kết quả tìm kiếm.",
    scrapbookSearchesNoResultsCopy: "Hãy chạy tìm kiếm để nạp các kết quả mới nhất.",
    scrapbookInsightsRefreshedAt: "Cập nhật lúc {date}",
    scrapbookInsightsNotLoadedYet: "Chưa tải.",
    scrapbookInsightsLoginTitle: "Cần đăng nhập.",
    scrapbookInsightsLoginCopy: "Kết nối tài khoản Threads để tải insights.",
    scrapbookInsightsReconnectTitle: "Cần cấp lại quyền.",
    scrapbookInsightsReconnectCopy: "Đăng nhập lại bằng Threads để dùng managed insights.",
    scrapbookInsightsViews: "lượt xem {value}",
    scrapbookInsightsLikes: "lượt thích {value}",
    scrapbookInsightsReplies: "phản hồi {value}",
    scrapbookInsightsReposts: "lượt đăng lại {value}",
    scrapbookInsightsQuotes: "trích dẫn {value}",
    scrapbookStatusConnected: "Tài khoản Threads của bạn đã được kết nối.",
    scrapbookSessionRouting:
      "scrapbook này được liên kết với @{handle}. Khi một reply công khai mention @{botHandle} và tài khoản viết reply là @{handle}, mục đó sẽ được lưu tại đây.",
    scrapbookLogoutSuccess: "Đã ngắt kết nối tài khoản.",
    scrapbookLogoutFail: "Không thể đăng xuất.",
    scrapbookStatusLoadFailed: "Không thể tải trạng thái scrapbook.",
    scrapbookStatusWatchlistSaved: "Đã lưu watchlist.",
    scrapbookStatusWatchlistSynced: "Đã đồng bộ watchlist.",
    scrapbookStatusWatchlistDeleted: "Đã xóa watchlist.",
    scrapbookStatusArchiveDeleted: "Đã xóa mục lưu trữ.",
    scrapbookStatusTrackedSaved: "Đã lưu kết quả vào inbox.",
    scrapbookStatusSearchSaved: "Đã lưu search monitor.",
    scrapbookStatusSearchRun: "Đã chạy tìm kiếm từ khóa.",
    scrapbookStatusSearchDeleted: "Đã xóa search monitor.",
    scrapbookStatusSearchArchived: "Đã lưu kết quả tìm kiếm vào inbox.",
    scrapbookStatusSearchDismissed: "Đã ẩn kết quả tìm kiếm.",
    scrapbookInsightsRefreshLoading: "Đang tải...",
    scrapbookStatusInsightsRefreshed: "Đã lưu snapshot insights mới.",
    scrapbookStatusInsightSaved: "Đã lưu bài insight vào inbox."
  }
} satisfies Record<WebLocale, Record<string, string>>;

export type ScrapbookMsg = (typeof scrapbookMessages)["ko"];
