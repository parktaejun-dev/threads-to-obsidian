import { DEFAULT_SETTINGS, type StorefrontSettings } from "@threads/web-schema";
import { parseSupportedLocale } from "@threads/shared/locale";
import {
  getLocale,
  applyTranslations,
  applyLangToggle,
  applyBotHandlePlaceholder,
  bindLangToggle,
  getLandingVariant,
  landingMessages,
  landingStorefrontCopy,
  type LandingMsg,
  type WebLocale
} from "../lib/web-i18n";
import { DEFAULT_BOT_HANDLE, normalizeBotHandleValue } from "../lib/web-copy-constants";

interface BotPublicConfig {
  botHandle: string;
}

const headline = document.querySelector<HTMLElement>("#headline");
const heroEyebrow = document.querySelector<HTMLElement>("#hero-eyebrow");
const subheadline = document.querySelector<HTMLElement>("#subheadline");
const heroProofItems = [
  document.querySelector<HTMLElement>("#hero-proof-1"),
  document.querySelector<HTMLElement>("#hero-proof-2"),
  document.querySelector<HTMLElement>("#hero-proof-3")
];
const heroDestinationItems = [
  document.querySelector<HTMLElement>("#hero-destination-1"),
  document.querySelector<HTMLElement>("#hero-destination-2"),
  document.querySelector<HTMLElement>("#hero-destination-3")
];
const priceLabel = document.querySelector<HTMLElement>("#price-label");
const priceValue = document.querySelector<HTMLElement>("#price-value");
const includedUpdates = document.querySelector<HTMLElement>("#included-updates");
const heroMentionText = document.querySelector<HTMLElement>("#hero-mention-text");
const supportTitle = document.querySelector<HTMLElement>("#support-title");
const supportCopy = document.querySelector<HTMLElement>("#support-copy");
const supportEmailLink = document.querySelector<HTMLAnchorElement>("#support-email-link");
const supportEmailLinkSecondary = document.querySelector<HTMLAnchorElement>("#support-email-link-secondary");
const topbarPrimaryCta = document.querySelector<HTMLAnchorElement>("#topbar-primary-cta");
const heroDesktopCta = document.querySelector<HTMLAnchorElement>("#hero-desktop-cta");
const heroMobileCta = document.querySelector<HTMLAnchorElement>("#hero-mobile-cta");
const priceCardCta = document.querySelector<HTMLAnchorElement>("#price-card-cta");
const routesEyebrow = document.querySelector<HTMLElement>("#routes-eyebrow");
const routesTitle = document.querySelector<HTMLElement>("#routes-title");
const routesCopy = document.querySelector<HTMLElement>("#routes-copy");
const capabilitySection = document.querySelector<HTMLElement>(".capability-section");
const saveRouteSection = document.querySelector<HTMLElement>(".save-route-section");
const capabilityEyebrow = document.querySelector<HTMLElement>("#capability-eyebrow");
const capabilityTitle = document.querySelector<HTMLElement>("#capability-title");
const capabilityCopy = document.querySelector<HTMLElement>("#capability-copy");
const capabilitySearchTitle = document.querySelector<HTMLElement>("#capability-search-title");
const capabilitySearchDesc = document.querySelector<HTMLElement>("#capability-search-desc");
const capabilityTagTitle = document.querySelector<HTMLElement>("#capability-tag-title");
const capabilityTagDesc = document.querySelector<HTMLElement>("#capability-tag-desc");
const capabilityWatchlistsTitle = document.querySelector<HTMLElement>("#capability-watchlists-title");
const capabilityWatchlistsDesc = document.querySelector<HTMLElement>("#capability-watchlists-desc");
const capabilityInsightsTitle = document.querySelector<HTMLElement>("#capability-insights-title");
const capabilityInsightsDesc = document.querySelector<HTMLElement>("#capability-insights-desc");
const productACta = document.querySelector<HTMLAnchorElement>("#product-a-cta");
const productBCta = document.querySelector<HTMLAnchorElement>("#product-b-cta");
const productATag = document.querySelector<HTMLElement>("#product-a-tag");
const productBTag = document.querySelector<HTMLElement>("#product-b-tag");
const productAPoints = document.querySelector<HTMLElement>("#product-a-points");
const productBPoints = document.querySelector<HTMLElement>("#product-b-points");
const footerExtensionLink = document.querySelector<HTMLAnchorElement>("#footer-extension-link");
const productATitle = document.querySelector<HTMLElement>("#product-a-title");
const productBTitle = document.querySelector<HTMLElement>("#product-b-title");
const productADesc = document.querySelector<HTMLElement>("#product-a-desc");
const productBDesc = document.querySelector<HTMLElement>("#product-b-desc");
const planEyebrow = document.querySelector<HTMLElement>("#plan-eyebrow");
const planTitle = document.querySelector<HTMLElement>("#plan-title");
const planCopy = document.querySelector<HTMLElement>("#plan-copy");
const planFreeTitle = document.querySelector<HTMLElement>("#plan-free-title");
const planFreeCopy = document.querySelector<HTMLElement>("#plan-free-copy");
const planFreeList = document.querySelector<HTMLElement>("#plan-free-list");
const planPlusTitle = document.querySelector<HTMLElement>("#plan-plus-title");
const planPlusCopy = document.querySelector<HTMLElement>("#plan-plus-copy");
const planPlusList = document.querySelector<HTMLElement>("#plan-plus-list");
const trustEyebrow = document.querySelector<HTMLElement>("#trust-eyebrow");
const trustTitle = document.querySelector<HTMLElement>("#trust-title");
const trustCopy = document.querySelector<HTMLElement>("#trust-copy");
const trustSupportLabel = document.querySelector<HTMLElement>("#trust-support-label");
const trustSupportCopy = document.querySelector<HTMLElement>("#trust-support-copy");
const trustDataLabel = document.querySelector<HTMLElement>("#trust-data-label");
const trustDataCopy = document.querySelector<HTMLElement>("#trust-data-copy");
const faqList = document.querySelector<HTMLElement>("#faq-list");
const compareProductALabel = document.querySelector<HTMLElement>("#compare-product-a-label");
const compareProductBLabel = document.querySelector<HTMLElement>("#compare-product-b-label");
const installHeroEyebrow = document.querySelector<HTMLElement>("#install-hero-eyebrow");
const installTopbarCta = document.querySelector<HTMLAnchorElement>("#install-topbar-cta");
const installDownloadCta = document.querySelector<HTMLAnchorElement>("#install-download-cta");
const installBackCta = document.querySelector<HTMLAnchorElement>("#install-back-cta");
const installInlineDownloadCtas = document.querySelectorAll<HTMLAnchorElement>("[data-install-download-cta]");
const installGuideEyebrow = document.querySelector<HTMLElement>("#install-guide-eyebrow");
const installGuideTitle = document.querySelector<HTMLElement>("#install-guide-title");
const installGuideLead = document.querySelector<HTMLElement>("#install-guide-lead");
const installStep1Title = document.querySelector<HTMLElement>("#install-step-1-title");
const installStep1Body = document.querySelector<HTMLElement>("#install-step-1-body");
const installStep2Title = document.querySelector<HTMLElement>("#install-step-2-title");
const installStep2Body = document.querySelector<HTMLElement>("#install-step-2-body");
const installStep3Title = document.querySelector<HTMLElement>("#install-step-3-title");
const installStep3Body = document.querySelector<HTMLElement>("#install-step-3-body");
const installStep4Title = document.querySelector<HTMLElement>("#install-step-4-title");
const installStep4Body = document.querySelector<HTMLElement>("#install-step-4-body");
const installStep5Title = document.querySelector<HTMLElement>("#install-step-5-title");
const installStep5Body = document.querySelector<HTMLElement>("#install-step-5-body");
const installStep6Title = document.querySelector<HTMLElement>("#install-step-6-title");
const installStep6Body = document.querySelector<HTMLElement>("#install-step-6-body");
const installPageTitle = document.querySelector<HTMLElement>("#install-page-title");
const installPageLead = document.querySelector<HTMLElement>("#install-page-lead");
const installChip1 = document.querySelector<HTMLElement>("#install-chip-1");
const installChip2 = document.querySelector<HTMLElement>("#install-chip-2");
const installChip3 = document.querySelector<HTMLElement>("#install-chip-3");
const installMetaCopy = document.querySelector<HTMLElement>("#install-meta-copy");
const installSafetyTitle = document.querySelector<HTMLElement>("#install-safety-title");
const installSafetyCopy = document.querySelector<HTMLElement>("#install-safety-copy");
const installDownloadCardTitle = document.querySelector<HTMLElement>("#install-download-card-title");
const installDownloadCardCopy = document.querySelector<HTMLElement>("#install-download-card-copy");
const installVerifyTitle = document.querySelector<HTMLElement>("#install-verify-title");
const installVerifyList = document.querySelector<HTMLElement>("#install-verify-list");
const landingBootstrapEl = document.querySelector<HTMLScriptElement>("#landing-bootstrap");
const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
const siteHost = document.body.dataset.siteHost?.trim() ?? "";
const initialLocaleHint = parseSupportedLocale(document.body.dataset.initialLocale);
const landingVariant = getLandingVariant(siteHost);
const pageType = document.body.dataset.page === "install" ? "install" : "landing";

type LandingBootstrapPayload = {
  botHandle?: string | null;
  storefrontSettings?: StorefrontSettings | null;
};

function readLandingBootstrap(): LandingBootstrapPayload | null {
  const raw = landingBootstrapEl?.textContent?.trim();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LandingBootstrapPayload;
  } catch {
    return null;
  }
}

const landingBootstrap = readLandingBootstrap();

let msg: LandingMsg = landingMessages.ko[landingVariant];
let currentLocale: WebLocale = initialLocaleHint ?? getLocale("en");
let currentBotHandle = normalizeBotHandleValue(landingBootstrap?.botHandle, DEFAULT_BOT_HANDLE);
let storefrontSettings: StorefrontSettings | null = landingBootstrap?.storefrontSettings ?? null;

type InstallGuideCopy = {
  documentTitle: string;
  documentDescription: string;
  heroTitle: string;
  heroLead: string;
  eyebrow: string;
  title: string;
  lead: string;
  steps: Array<{
    title: string;
    bodyHtml: string;
  }>;
};

type CapabilitySectionCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  cards: Array<{
    title: string;
    desc: string;
  }>;
};

type LandingUiCopy = {
  heroEyebrow: string;
  heroLead: string;
  heroProofs: string[];
  heroDestinations: string[];
  heroMentionHtml: string;
  supportTitle: string;
  supportCopy: string;
  routesEyebrow: string;
  routesTitle: string;
  routesCopy: string;
  desktopTag: string;
  desktopTitle: string;
  desktopDesc: string;
  desktopPoints: string[];
  desktopCta: string;
  mobileTag: string;
  mobileTitle: string;
  mobileDesc: string;
  mobilePoints: string[];
  mobileCta: string;
  planEyebrow: string;
  planTitle: string;
  planCopy: string;
  freeTitle: string;
  freeCopy: string;
  freePoints: string[];
  plusTitle: string;
  plusCopy: string;
  plusPoints: string[];
  priceCta: string;
  trustEyebrow: string;
  trustTitle: string;
  trustCopy: string;
  trustSupportLabel: string;
  trustSupportCopy: string;
  trustDataLabel: string;
  trustDataCopy: string;
};

type InstallMetaCopy = {
  heroEyebrow: string;
  downloadCta: string;
  backToProductCta: string;
  chip1: string;
  chip2: string;
  chip3: string;
  metaCopy: string;
  safetyTitle: string;
  safetyCopy: string;
  downloadCardTitle: string;
  downloadCardCopy: string;
  verifyTitle: string;
  verifyItems: string[];
};

const installGuideCopy: Record<WebLocale, InstallGuideCopy> = {
  ko: {
    documentTitle: "ss-threads 설치 안내",
    documentDescription: "Chrome 개발자 모드로 ss-threads 확장 프로그램을 설치하는 방법",
    heroTitle: "Chrome 확장 설치",
    heroLead: "압축을 푼 폴더를 Chrome에 한 번만 등록하면 됩니다.",
    eyebrow: "PC 설치 안내",
    title: "설치는 한 번만 하면 됩니다",
    lead: "아래 순서대로 한 번 등록한 뒤, Threads 글에서 바로 저장해 쓰면 됩니다.",
    steps: [
      {
        title: "ZIP을 내려받고 압축을 풉니다",
        bodyHtml:
          "<code>ss-threads-extension.zip</code>을 먼저 압축 해제하세요. ZIP 파일 자체는 바로 선택하면 안 됩니다."
      },
      {
        title: "chrome://extensions를 엽니다",
        bodyHtml: "Chrome 주소창에 붙여넣고 이동합니다."
      },
      {
        title: "우측 상단 개발자 모드를 켭니다",
        bodyHtml:
          "토글을 켜면 <code>압축해제된 확장 프로그램을 로드합니다</code> 버튼이 나타납니다."
      },
      {
        title: "압축해제된 확장 프로그램을 로드합니다를 누릅니다",
        bodyHtml: "파일 선택 창이 열리면 방금 압축을 푼 폴더를 선택할 준비를 합니다."
      },
      {
        title: "ss-threads-extension 폴더를 선택합니다",
        bodyHtml: "압축을 푼 뒤 생긴 폴더를 고르면 설치가 끝납니다."
      },
      {
        title: "Threads 글에서 한 번 테스트합니다",
        bodyHtml: "확장 아이콘을 고정하고 Threads 글에서 저장을 한 번 실행해 보면 됩니다."
      }
    ]
  },
  en: {
    documentTitle: "ss-threads install guide",
    documentDescription: "How to install the ss-threads extension with Chrome Developer mode",
    heroTitle: "Install the Chrome extension",
    heroLead: "Register the extracted folder in Chrome once and the setup is done.",
    eyebrow: "PC install",
    title: "Install it once, then save normally",
    lead: "Follow these steps once, then save directly from Threads whenever you need it.",
    steps: [
      {
        title: "Download the ZIP and extract it first",
        bodyHtml:
          "Download <code>ss-threads-extension.zip</code> and unzip it first. Do not select the ZIP file itself."
      },
      {
        title: "Open chrome://extensions",
        bodyHtml: "Paste it into the Chrome address bar and open the page."
      },
      {
        title: "Turn on Developer mode in the top-right corner",
        bodyHtml:
          "Once the toggle is on, Chrome shows the <code>Load unpacked</code> button."
      },
      {
        title: "Click Load unpacked",
        bodyHtml: "Chrome opens a folder picker so you can choose the extracted extension directory."
      },
      {
        title: "Choose the ss-threads-extension folder",
        bodyHtml: "Selecting the extracted folder finishes the install."
      },
      {
        title: "Run one quick test on Threads",
        bodyHtml: "Pin the extension and save one Threads post to confirm the flow."
      }
    ]
  },
  ja: {
    documentTitle: "ss-threads インストール案内",
    documentDescription: "Chrome のデベロッパーモードで ss-threads extension をインストールする方法",
    heroTitle: "PC 用 extension をインストール",
    heroLead: "Chrome のデベロッパーモードで、展開したフォルダを一度だけ選択してください。",
    eyebrow: "PC インストール",
    title: "Chrome のデベロッパーモードで extension をインストール",
    lead: "現在は Chrome Web Store のワンクリック配布ではなく ZIP 配布です。下の手順を一度だけ行えば使えます。",
    steps: [
      {
        title: "ZIP をダウンロードして展開します",
        bodyHtml:
          "<code>ss-threads-extension.zip</code> を先に解凍してください。ZIP ファイル自体はそのまま選択できません。"
      },
      {
        title: "Chrome の extensions ページを開きます",
        bodyHtml: "アドレスバーに <code>chrome://extensions</code> を入力して開きます。"
      },
      {
        title: "右上のデベロッパーモードを有効にします",
        bodyHtml:
          "トグルをオンにすると <code>Load unpacked</code> ボタンが表示されます。"
      },
      {
        title: "Load unpacked をクリックします",
        bodyHtml: "ファイル選択が開いたら、解凍したフォルダを指定する準備をします。"
      },
      {
        title: "正しいフォルダを選んで完了します",
        bodyHtml:
          "解凍後にできた <code>ss-threads-extension</code> フォルダを選ぶとインストールが完了します。"
      },
      {
        title: "Threads で確認します",
        bodyHtml:
          "extension を固定し、Threads の個別投稿ページで一度保存を試してください。"
      }
    ]
  },
  "pt-BR": {
    documentTitle: "guia de instalação do ss-threads",
    documentDescription: "Como instalar a extensão ss-threads com o modo de desenvolvedor do Chrome",
    heroTitle: "Instale a extension no PC",
    heroLead: "Abra o modo de desenvolvedor do Chrome e selecione a pasta extraída uma vez.",
    eyebrow: "Instalação no PC",
    title: "Instale a extension com o modo de desenvolvedor do Chrome",
    lead: "No momento, a distribuição é por ZIP, não pela Chrome Web Store. Siga estes passos uma vez e pronto.",
    steps: [
      {
        title: "Baixe o ZIP e extraia primeiro",
        bodyHtml:
          "Extraia <code>ss-threads-extension.zip</code> antes de abrir a página de extensões. Não selecione o arquivo ZIP diretamente."
      },
      {
        title: "Abra a página de extensões do Chrome",
        bodyHtml: "Digite <code>chrome://extensions</code> na barra de endereços."
      },
      {
        title: "Ative o modo de desenvolvedor no canto superior direito",
        bodyHtml:
          "Quando o botão for ativado, o Chrome mostra <code>Load unpacked</code>."
      },
      {
        title: "Clique em Load unpacked",
        bodyHtml: "A seleção de pasta será aberta para você apontar para a pasta extraída."
      },
      {
        title: "Selecione a pasta correta e termine",
        bodyHtml:
          "Escolha a pasta <code>ss-threads-extension</code> criada após extrair o ZIP."
      },
      {
        title: "Teste no Threads",
        bodyHtml:
          "Fixe a extension e faça um teste em uma página de post individual do Threads."
      }
    ]
  },
  es: {
    documentTitle: "guía de instalación de ss-threads",
    documentDescription: "Cómo instalar la extensión ss-threads con el modo de desarrollador de Chrome",
    heroTitle: "Instala la extension en PC",
    heroLead: "Activa el modo de desarrollador de Chrome y selecciona una vez la carpeta extraída.",
    eyebrow: "Instalación en PC",
    title: "Instala la extension con el modo de desarrollador de Chrome",
    lead: "Ahora mismo se distribuye como ZIP, no desde Chrome Web Store. Sigue estos pasos una sola vez.",
    steps: [
      {
        title: "Descarga el ZIP y descomprímelo",
        bodyHtml:
          "Descomprime <code>ss-threads-extension.zip</code> antes de abrir la página de extensiones. No selecciones el ZIP directamente."
      },
      {
        title: "Abre la página de extensiones de Chrome",
        bodyHtml: "Escribe <code>chrome://extensions</code> en la barra de direcciones."
      },
      {
        title: "Activa el modo de desarrollador arriba a la derecha",
        bodyHtml:
          "Cuando lo actives, Chrome mostrará el botón <code>Load unpacked</code>."
      },
      {
        title: "Haz clic en Load unpacked",
        bodyHtml: "Se abrirá el selector para que elijas la carpeta descomprimida."
      },
      {
        title: "Selecciona la carpeta correcta y termina",
        bodyHtml:
          "Elige la carpeta <code>ss-threads-extension</code> que se creó al descomprimir."
      },
      {
        title: "Compruébalo en Threads",
        bodyHtml:
          "Fija la extension y prueba un guardado desde una página de publicación individual de Threads."
      }
    ]
  },
  "zh-TW": {
    documentTitle: "ss-threads 安裝說明",
    documentDescription: "如何用 Chrome 開發人員模式安裝 ss-threads extension",
    heroTitle: "安裝 PC 用 extension",
    heroLead: "開啟 Chrome 開發人員模式，選一次解壓後的資料夾即可。",
    eyebrow: "PC 安裝",
    title: "用 Chrome 開發人員模式安裝 extension",
    lead: "目前是 ZIP 方式發佈，不是 Chrome Web Store 一鍵安裝。照著下面步驟做一次就好。",
    steps: [
      {
        title: "先下載 ZIP 並解壓縮",
        bodyHtml:
          "請先解壓 <code>ss-threads-extension.zip</code>。不能直接選 ZIP 檔本身。"
      },
      {
        title: "打開 Chrome extensions 頁面",
        bodyHtml: "在網址列輸入 <code>chrome://extensions</code>。"
      },
      {
        title: "開啟右上角的開發人員模式",
        bodyHtml:
          "切換後會看到 <code>Load unpacked</code> 按鈕。"
      },
      {
        title: "點擊 Load unpacked",
        bodyHtml: "接著在資料夾選擇器中指定剛剛解壓的資料夾。"
      },
      {
        title: "選對資料夾並完成安裝",
        bodyHtml:
          "請選擇解壓後產生的 <code>ss-threads-extension</code> 資料夾。"
      },
      {
        title: "到 Threads 測試一次",
        bodyHtml:
          "把 extension 固定起來，然後在 Threads 單篇貼文頁測試一次保存。"
      }
    ]
  },
  vi: {
    documentTitle: "hướng dẫn cài đặt ss-threads",
    documentDescription: "Cách cài đặt extension ss-threads bằng chế độ nhà phát triển của Chrome",
    heroTitle: "Cài extension trên PC",
    heroLead: "Bật chế độ nhà phát triển của Chrome và chọn thư mục đã giải nén một lần.",
    eyebrow: "Cài trên PC",
    title: "Cài extension bằng Chrome Developer mode",
    lead: "Hiện tại extension được phát hành dưới dạng ZIP, không phải cài một chạm từ Chrome Web Store. Làm một lần là xong.",
    steps: [
      {
        title: "Tải ZIP và giải nén trước",
        bodyHtml:
          "Hãy giải nén <code>ss-threads-extension.zip</code> trước khi mở trang extension. Đừng chọn trực tiếp file ZIP."
      },
      {
        title: "Mở trang extensions của Chrome",
        bodyHtml: "Gõ <code>chrome://extensions</code> vào thanh địa chỉ."
      },
      {
        title: "Bật Developer mode ở góc trên bên phải",
        bodyHtml:
          "Sau khi bật, Chrome sẽ hiện nút <code>Load unpacked</code>."
      },
      {
        title: "Nhấn Load unpacked",
        bodyHtml: "Trình chọn thư mục sẽ mở ra để bạn chọn thư mục đã giải nén."
      },
      {
        title: "Chọn đúng thư mục và hoàn tất",
        bodyHtml:
          "Chọn thư mục <code>ss-threads-extension</code> được tạo sau khi giải nén."
      },
      {
        title: "Kiểm tra trên Threads",
        bodyHtml:
          "Ghim extension rồi thử lưu một bài trên trang post riêng của Threads."
      }
    ]
  }
};

const capabilitySectionCopyByLocale: Partial<Record<WebLocale, CapabilitySectionCopy>> = {
  ko: {
    eyebrow: "저장한 뒤",
    title: "저장한 글 다시 보기",
    lead:
      "태그와 검색으로 찾고, 관심 계정과 반응도 한곳에서 이어서 봅니다.",
    cards: [
      {
        title: "검색",
        desc: "저장한 글을 다시 찾습니다."
      },
      {
        title: "태그",
        desc: "태그로 묶어서 봅니다."
      },
      {
        title: "관심 계정",
        desc: "보고 싶은 계정의 새 글을 모아봅니다."
      },
      {
        title: "반응 보기",
        desc: "내 계정의 반응 변화를 확인합니다."
      }
    ]
  },
  en: {
    eyebrow: "After saving",
    title: "Make saved posts easy to use again",
    lead:
      "Use tags and search to find posts again, then keep an eye on accounts you follow and how your own posts are doing.",
    cards: [
      {
        title: "Search",
        desc: "Find saved posts again."
      },
      {
        title: "Tags",
        desc: "Group posts by tag."
      },
      {
        title: "Accounts",
        desc: "Follow new posts from accounts you care about."
      },
      {
        title: "Activity",
        desc: "See how your own account changes over time."
      }
    ]
  }
};

const landingUiCopyByLocale: Partial<Record<WebLocale, LandingUiCopy>> = {
  ko: {
    heroEyebrow: "Threads 저장",
    heroLead:
      "PC는 보고 있는 글을 바로 저장하고, 모바일은 댓글 한 줄로 모읍니다. 다시 볼 때는 스크랩북에서 찾습니다.",
    heroProofs: ["무료로 시작", "7일 환불", "이메일 지원"],
    heroDestinations: ["Notion", "Obsidian", "웹 스크랩북"],
    heroMentionHtml: "댓글로 <code class=\"bot-handle\">@{botHandle}</code> 만 적으세요.",
    supportTitle: "문의",
    supportCopy: "결제, 환불, Plus 문의는 이 이메일로 안내합니다.",
    routesEyebrow: "저장 방법",
    routesTitle: "PC는 바로 저장, 모바일은 댓글 한 줄",
    routesCopy: "처음 한 번 설치한 PC 저장과 매일 쓰는 스크랩북을 같은 흐름으로 묶었습니다.",
    desktopTag: "PC",
    desktopTitle: "PC는 바로 저장",
    desktopDesc: "처음 한 번만 설치하면 보고 있는 글을 바로 저장합니다.",
    desktopPoints: [
      "처음 한 번만 설치",
      "보고 있는 글 바로 저장",
      "저장한 글은 스크랩북에서도 보기"
    ],
    desktopCta: "PC 설치 안내",
    mobileTag: "모바일",
    mobileTitle: "모바일은 댓글 한 줄",
    mobileDesc: "댓글에 @ss_threads_bot만 남기면 내 스크랩북에 저장됩니다.",
    mobilePoints: [
      "댓글 한 줄로 저장",
      "매일 스크랩북에서 다시 보기",
      "태그로 정리"
    ],
    mobileCta: "스크랩북 열기",
    planEyebrow: "요금",
    planTitle: "Free로 쓰다가, 필요할 때만 Plus",
    planCopy: "저장과 다시 보기까지는 Free면 충분합니다. 더 넓게 쓰고 싶을 때만 Plus를 붙이면 됩니다.",
    freeTitle: "Free",
    freeCopy: "저장과 다시 보기에 충분합니다.",
    freePoints: [
      "저장글 100개 · 폴더 5개",
      "태그와 검색",
      "모바일 저장",
      "스크랩북에서 다시 보기"
    ],
    plusTitle: "Plus",
    plusCopy: "저장이 많아질 때 한도를 넓혀 줍니다.",
    plusPoints: [
      "저장글 1,000개 · 폴더 50개",
      "관심 계정 새 글 보기",
      "내 계정 반응 변화 보기",
      "PC 저장에도 같은 키 사용"
    ],
    priceCta: "Plus 자세히",
    trustEyebrow: "안내",
    trustTitle: "문의",
    trustCopy: "결제, 환불, Plus 문의는 이메일로 안내합니다.",
    trustSupportLabel: "이메일",
    trustSupportCopy: "영업일 기준 순서대로 답변합니다.",
    trustDataLabel: "데이터 처리",
    trustDataCopy: "저장과 검색은 스크랩북 중심으로 동작하고, 연결 기능만 서버를 거칩니다."
  },
  en: {
    heroEyebrow: "Save Threads",
    heroLead:
      "Desktop saves the post you are viewing now. Mobile collects posts with one reply and scrapbook becomes the place you return to.",
    heroProofs: ["Free to start", "7-day refund", "Email support"],
    heroDestinations: ["Notion", "Obsidian", "Web scrapbook"],
    heroMentionHtml: "Just reply with <code class=\"bot-handle\">@{botHandle}</code>.",
    supportTitle: "Support",
    supportCopy: "Use this email for payment, refunds, and Plus questions.",
    routesEyebrow: "How it works",
    routesTitle: "Desktop saves now. Mobile keeps a backlog.",
    routesCopy: "The same product supports two different save moments without making them feel equal.",
    desktopTag: "Desktop",
    desktopTitle: "Desktop uses the Chrome extension",
    desktopDesc: "Save the Threads post in front of you. Installation only happens once.",
    desktopPoints: [
      "Install once in Chrome",
      "Choose Notion, Obsidian, or scrapbook",
      "Save the post in front of you"
    ],
    desktopCta: "Install Chrome extension",
    mobileTag: "Mobile",
    mobileTitle: "Mobile saves with one reply",
    mobileDesc: "Reply with @ss_threads_bot and the post lands in your scrapbook.",
    mobilePoints: [
      "Save with one reply",
      "Return to it in scrapbook",
      "Organize with tags"
    ],
    mobileCta: "Open scrapbook",
    planEyebrow: "Pricing",
    planTitle: "Start on Free, add Plus when limits matter",
    planCopy: "Free handles saving and finding posts again. Plus is for people who save enough to outgrow the default space.",
    freeTitle: "Free",
    freeCopy: "Enough for everyday saving and review.",
    freePoints: [
      "100 saved posts and 5 folders",
      "Tags and search",
      "Save from mobile",
      "Review in scrapbook"
    ],
    plusTitle: "Plus",
    plusCopy: "A better fit when your saved archive grows.",
    plusPoints: [
      "1,000 saved posts and 50 folders",
      "Follow accounts",
      "See account activity",
      "Use the same key in the extension"
    ],
    priceCta: "See Plus",
    trustEyebrow: "Support",
    trustTitle: "Install and checkout stay brief",
    trustCopy: "Install notes, refunds, support, and data handling are kept in plain language.",
    trustSupportLabel: "Support email",
    trustSupportCopy: "Use this email for payments, refunds, and Plus questions.",
    trustDataLabel: "Data handling",
    trustDataCopy: "Core saving and search run through scrapbook, while only connected features use server-side processing."
  }
};

const installMetaCopyByLocale: Partial<Record<WebLocale, InstallMetaCopy>> = {
  ko: {
    heroEyebrow: "PC 설치",
    downloadCta: "ZIP 다운로드",
    backToProductCta: "제품 페이지",
    chip1: "ZIP 배포",
    chip2: "개발자 모드 필요",
    chip3: "자동 업데이트 없음",
    metaCopy: "지금은 ZIP으로 배포 중입니다. 한 번만 등록하면 바로 사용할 수 있습니다.",
    safetyTitle: "왜 개발자 모드가 필요한가요?",
    safetyCopy: "아직 ZIP 설치 단계라 Chrome의 압축해제된 확장 프로그램 로드 방식이 필요합니다.",
    downloadCardTitle: "업데이트 방법",
    downloadCardCopy: "새 버전이 나오면 ZIP을 다시 받아 같은 폴더로 교체하면 됩니다.",
    verifyTitle: "설치 확인",
    verifyItems: [
      "확장 아이콘을 고정합니다.",
      "Threads 단일 글 페이지를 엽니다.",
      "저장을 한 번 실행해 정상 동작을 확인합니다."
    ]
  },
  en: {
    heroEyebrow: "Desktop install",
    downloadCta: "Download ZIP",
    backToProductCta: "Product page",
    chip1: "ZIP release",
    chip2: "Developer mode required",
    chip3: "No auto-update yet",
    metaCopy: "The extension is currently shipped as a ZIP. Register it once and start using it.",
    safetyTitle: "Why is Developer mode required?",
    safetyCopy: "Because the extension is still shipped as a ZIP, Chrome needs the Load unpacked flow during setup.",
    downloadCardTitle: "Updating later",
    downloadCardCopy: "When a new release ships, download the ZIP again and replace the same folder.",
    verifyTitle: "Verify install",
    verifyItems: [
      "Pin the extension icon.",
      "Open a single Threads post page.",
      "Run one save to confirm the flow works."
    ]
  },
  ja: {
    heroEyebrow: "PC インストール",
    downloadCta: "ZIP をダウンロード",
    backToProductCta: "製品ページ",
    chip1: "ZIP 配布",
    chip2: "デベロッパーモードが必要",
    chip3: "自動更新はまだありません",
    metaCopy: "現在は ZIP で配布しています。一度登録すればすぐに使えます。",
    safetyTitle: "なぜデベロッパーモードが必要ですか？",
    safetyCopy: "まだ ZIP 配布の段階なので、Chrome の Load unpacked フローが必要です。",
    downloadCardTitle: "更新方法",
    downloadCardCopy: "新しい版が出たら ZIP をもう一度ダウンロードして同じフォルダを置き換えてください。",
    verifyTitle: "インストール確認",
    verifyItems: [
      "拡張機能アイコンを固定します。",
      "Threads の個別投稿ページを開きます。",
      "一度保存して動作を確認します。"
    ]
  },
  "pt-BR": {
    heroEyebrow: "Instalação no PC",
    downloadCta: "Baixar ZIP",
    backToProductCta: "Página do produto",
    chip1: "Entrega por ZIP",
    chip2: "Modo de desenvolvedor necessário",
    chip3: "Ainda sem atualização automática",
    metaCopy: "No momento, a extensão é distribuída como ZIP. Registre uma vez e comece a usar.",
    safetyTitle: "Por que o modo de desenvolvedor é necessário?",
    safetyCopy: "Como a extensão ainda é distribuída em ZIP, o Chrome precisa do fluxo Carregar sem compactação na instalação.",
    downloadCardTitle: "Como atualizar",
    downloadCardCopy: "Quando sair uma nova versão, baixe o ZIP novamente e substitua a mesma pasta.",
    verifyTitle: "Verificar instalação",
    verifyItems: [
      "Fixe o ícone da extensão.",
      "Abra uma página de post individual no Threads.",
      "Faça um teste de salvamento para confirmar o fluxo."
    ]
  },
  es: {
    heroEyebrow: "Instalación en PC",
    downloadCta: "Descargar ZIP",
    backToProductCta: "Página del producto",
    chip1: "Entrega por ZIP",
    chip2: "Se necesita modo de desarrollador",
    chip3: "Todavía sin actualización automática",
    metaCopy: "Por ahora la extensión se distribuye como ZIP. Regístrala una vez y empieza a usarla.",
    safetyTitle: "¿Por qué se necesita el modo de desarrollador?",
    safetyCopy: "Como la extensión aún se distribuye como ZIP, Chrome necesita el flujo Cargar descomprimida durante la instalación.",
    downloadCardTitle: "Cómo actualizar",
    downloadCardCopy: "Cuando salga una nueva versión, descarga el ZIP otra vez y reemplaza la misma carpeta.",
    verifyTitle: "Verificar instalación",
    verifyItems: [
      "Fija el icono de la extensión.",
      "Abre una página de publicación individual en Threads.",
      "Haz una prueba de guardado para confirmar el flujo."
    ]
  },
  "zh-TW": {
    heroEyebrow: "PC 安裝",
    downloadCta: "下載 ZIP",
    backToProductCta: "產品頁面",
    chip1: "ZIP 發佈",
    chip2: "需要開啟開發人員模式",
    chip3: "尚未支援自動更新",
    metaCopy: "目前以 ZIP 形式發佈。只要註冊一次，就能立即使用。",
    safetyTitle: "為什麼需要開發人員模式？",
    safetyCopy: "因為目前仍是 ZIP 發佈階段，Chrome 安裝時需要使用 Load unpacked 流程。",
    downloadCardTitle: "之後如何更新",
    downloadCardCopy: "有新版本時，再次下載 ZIP 並替換同一個資料夾即可。",
    verifyTitle: "安裝確認",
    verifyItems: [
      "將擴充功能圖示固定。",
      "打開 Threads 的單篇貼文頁面。",
      "實際執行一次儲存確認流程正常。"
    ]
  },
  vi: {
    heroEyebrow: "Cài trên PC",
    downloadCta: "Tải ZIP",
    backToProductCta: "Trang sản phẩm",
    chip1: "Phát hành bằng ZIP",
    chip2: "Cần bật chế độ nhà phát triển",
    chip3: "Chưa có tự động cập nhật",
    metaCopy: "Hiện tại tiện ích mở rộng được phát hành dưới dạng ZIP. Chỉ cần đăng ký một lần là dùng được ngay.",
    safetyTitle: "Vì sao cần chế độ nhà phát triển?",
    safetyCopy: "Vì tiện ích mở rộng vẫn đang phát hành bằng ZIP, Chrome cần luồng Load unpacked trong lúc cài đặt.",
    downloadCardTitle: "Cách cập nhật",
    downloadCardCopy: "Khi có phiên bản mới, hãy tải lại file ZIP và thay thế cùng thư mục đó.",
    verifyTitle: "Kiểm tra cài đặt",
    verifyItems: [
      "Ghim biểu tượng tiện ích mở rộng.",
      "Mở trang bài viết đơn trên Threads.",
      "Thử lưu một lần để xác nhận luồng hoạt động."
    ]
  }
};

function buildTranslationDict(copy: LandingMsg): Record<string, string> {
  return Object.fromEntries(
    Object.entries(copy).filter(([, value]) => typeof value === "string")
  ) as Record<string, string>;
}

function normalizeBotHandle(value: string | null | undefined): string {
  return normalizeBotHandleValue(value, DEFAULT_BOT_HANDLE);
}

function setHref(element: HTMLAnchorElement | null, href: string): void {
  if (!element) {
    return;
  }
  element.setAttribute("href", href);
}

function setHtml(element: HTMLElement | null, html: string): void {
  if (!element) {
    return;
  }
  element.innerHTML = html;
}

function setText(element: HTMLElement | null, value: string): void {
  if (!element) {
    return;
  }
  element.textContent = value;
}

function setList(element: HTMLElement | null, items: string[]): void {
  if (!element) {
    return;
  }

  element.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function setEmailLink(element: HTMLAnchorElement | null, email: string): void {
  if (!element) {
    return;
  }

  element.href = `mailto:${email}`;
  element.textContent = email;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderBrandAccent(value: string): string {
  return value
    .replace(/^SS\b/, `<span class="brand-accent">SS</span>`)
    .replace(/^ss\b/, `<span class="brand-accent">ss</span>`);
}

function getLandingUiCopy(locale: WebLocale): LandingUiCopy {
  return landingUiCopyByLocale[locale] ?? landingUiCopyByLocale.en!;
}

function getCapabilitySectionCopy(locale: WebLocale): CapabilitySectionCopy | null {
  return capabilitySectionCopyByLocale[locale] ?? capabilitySectionCopyByLocale.en ?? null;
}

function getInstallMetaCopy(locale: WebLocale): InstallMetaCopy {
  return installMetaCopyByLocale[locale] ?? installMetaCopyByLocale.en!;
}

function renderHeadlineLines(value: string): string {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  const normalizedLines =
    lines.length > 1
      ? lines
      : lines[0]
          .split(/(?<=[.!?。！？])\s+/)
          .map((line) => line.trim())
          .filter(Boolean);

  return normalizedLines.map((line) => `<span class="headline-row">${escapeHtml(line)}</span>`).join("");
}

function resolveLocalizedStorefront(locale: WebLocale) {
  const baseCopy = applyBotHandlePlaceholder(
    landingStorefrontCopy[locale][landingVariant],
    currentBotHandle,
    DEFAULT_BOT_HANDLE
  );

  if (!storefrontSettings) {
    return baseCopy;
  }

  const normalizedFaqs = storefrontSettings.faqs.filter((faq) => faq.question.trim() && faq.answer.trim());
  const persistedHeadline = applyBotHandlePlaceholder(storefrontSettings.headline, currentBotHandle, DEFAULT_BOT_HANDLE);
  const persistedSubheadline = applyBotHandlePlaceholder(storefrontSettings.subheadline, currentBotHandle, DEFAULT_BOT_HANDLE);
  const persistedIncludedUpdates = applyBotHandlePlaceholder(storefrontSettings.includedUpdates, currentBotHandle, DEFAULT_BOT_HANDLE);
  const persistedHeroNotes = applyBotHandlePlaceholder(storefrontSettings.heroNotes, currentBotHandle, DEFAULT_BOT_HANDLE);
  const persistedFaqs = applyBotHandlePlaceholder(normalizedFaqs, currentBotHandle, DEFAULT_BOT_HANDLE);
  const commonCopy = {
    ...baseCopy,
    productName: storefrontSettings.productName.trim() || baseCopy.productName,
    priceLabel: storefrontSettings.priceLabel.trim() || baseCopy.priceLabel
  };

  if (locale !== "ko") {
    return commonCopy;
  }

  return {
    ...commonCopy,
    headline: persistedHeadline.trim() ? renderHeadlineLines(persistedHeadline) : baseCopy.headline,
    subheadline: persistedSubheadline.trim() || baseCopy.subheadline,
    includedUpdates: persistedIncludedUpdates.trim() || baseCopy.includedUpdates,
    heroNotes: persistedHeroNotes.filter((note) => note.trim()).length > 0 ? persistedHeroNotes : baseCopy.heroNotes,
    faqs: persistedFaqs.length > 0 ? persistedFaqs : baseCopy.faqs
  };
}

function renderLocalizedStorefront(locale: WebLocale): void {
  const copy = resolveLocalizedStorefront(locale);
  const uiCopy = getLandingUiCopy(locale);
  const resolvedPriceValue = storefrontSettings?.priceValue.trim() || DEFAULT_SETTINGS.priceValue;
  const resolvedSupportEmail = storefrontSettings?.supportEmail.trim() || DEFAULT_SETTINGS.supportEmail;

  if (headline) {
    headline.innerHTML = copy.headline;
  }
  setText(heroEyebrow, uiCopy.heroEyebrow);
  if (subheadline) {
    subheadline.textContent = copy.subheadline.trim() || uiCopy.heroLead;
  }
  heroProofItems.forEach((element, index) => {
    setText(element, uiCopy.heroProofs[index] ?? "");
  });
  heroDestinationItems.forEach((element, index) => {
    setText(element, uiCopy.heroDestinations[index] ?? "");
  });
  if (priceLabel) {
    priceLabel.textContent = copy.priceLabel;
  }
  if (priceValue) {
    priceValue.textContent = resolvedPriceValue;
  }
  if (includedUpdates) {
    includedUpdates.textContent = copy.includedUpdates;
  }
  if (heroMentionText) {
    heroMentionText.innerHTML = uiCopy.heroMentionHtml.replace("{botHandle}", currentBotHandle);
  }
  setText(supportTitle, uiCopy.supportTitle);
  setText(supportCopy, uiCopy.supportCopy);
  setEmailLink(supportEmailLink, resolvedSupportEmail);
  setEmailLink(supportEmailLinkSecondary, resolvedSupportEmail);
  setText(routesEyebrow, uiCopy.routesEyebrow);
  setText(routesTitle, uiCopy.routesTitle);
  setText(routesCopy, uiCopy.routesCopy);
  setText(productATag, uiCopy.desktopTag);
  setText(productATitle, uiCopy.desktopTitle);
  setText(productADesc, uiCopy.desktopDesc);
  setList(productAPoints, uiCopy.desktopPoints);
  setText(productBTag, uiCopy.mobileTag);
  setText(productBTitle, uiCopy.mobileTitle);
  setText(productBDesc, uiCopy.mobileDesc);
  setList(productBPoints, uiCopy.mobilePoints);
  setText(planEyebrow, uiCopy.planEyebrow);
  setText(planTitle, uiCopy.planTitle);
  setText(planCopy, uiCopy.planCopy);
  setText(planFreeTitle, uiCopy.freeTitle);
  setText(planFreeCopy, uiCopy.freeCopy);
  setList(planFreeList, uiCopy.freePoints);
  setText(planPlusTitle, uiCopy.plusTitle);
  setText(planPlusCopy, uiCopy.plusCopy);
  setList(planPlusList, uiCopy.plusPoints);
  setText(trustEyebrow, uiCopy.trustEyebrow);
  setText(trustTitle, uiCopy.trustTitle);
  setText(trustCopy, uiCopy.trustCopy);
  setText(trustSupportLabel, uiCopy.trustSupportLabel);
  setText(trustSupportCopy, uiCopy.trustSupportCopy);
  setText(trustDataLabel, uiCopy.trustDataLabel);
  setText(trustDataCopy, uiCopy.trustDataCopy);

  if (faqList) {
    faqList.innerHTML = copy.faqs
      .slice(0, 4)
      .map(
        (faq) => `
          <article class="faq-item">
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          </article>
        `
      )
      .join("");
  }

  setHref(topbarPrimaryCta, copy.links.topbarPrimaryHref);
  setHref(heroDesktopCta, "/install");
  setHref(heroMobileCta, copy.links.productBHref);
  setHref(priceCardCta, copy.links.priceCardHref);
  setHref(productACta, "/install");
  setHref(productBCta, copy.links.productBHref);
  setHref(footerExtensionLink, "/install");

  if (topbarPrimaryCta) {
    topbarPrimaryCta.textContent = uiCopy.mobileCta;
  }
  if (heroDesktopCta) {
    heroDesktopCta.textContent = uiCopy.desktopCta;
  }
  if (heroMobileCta) {
    heroMobileCta.textContent = uiCopy.mobileCta;
  }
  if (productACta) {
    productACta.textContent = msg.guideInstallCta;
  }
  if (productBCta) {
    productBCta.textContent = uiCopy.mobileCta;
  }
  if (priceCardCta) {
    priceCardCta.textContent = uiCopy.priceCta;
  }
  if (footerExtensionLink) {
    footerExtensionLink.textContent = msg.guideInstallCta;
  }
  if (compareProductALabel) {
    compareProductALabel.textContent = uiCopy.desktopTitle;
  }
  if (compareProductBLabel) {
    compareProductBLabel.textContent = uiCopy.mobileTitle;
  }

  if (pageType === "landing") {
    document.title = [copy.productName, siteHost].filter(Boolean).join(" | ");
  }
}

function applyCapabilityCopy(locale: WebLocale): void {
  const copy = getCapabilitySectionCopy(locale);
  capabilitySection?.classList.toggle("hidden", !copy);
  if (!copy) {
    return;
  }
  setText(capabilityEyebrow, copy.eyebrow);
  setText(capabilityTitle, copy.title);
  setText(capabilityCopy, copy.lead);

  const titleElements = [
    capabilitySearchTitle,
    capabilityTagTitle,
    capabilityWatchlistsTitle,
    capabilityInsightsTitle
  ];
  const descElements = [
    capabilitySearchDesc,
    capabilityTagDesc,
    capabilityWatchlistsDesc,
    capabilityInsightsDesc
  ];

  copy.cards.forEach((card, index) => {
    setText(titleElements[index], card.title);
    setText(descElements[index], card.desc);
  });
}

function applySaveRouteSection(locale: WebLocale): void {
  void locale;
  saveRouteSection?.classList.add("hidden");
}

function applyInstallGuideCopy(locale: WebLocale): void {
  const copy = installGuideCopy[locale];
  const metaCopy = getInstallMetaCopy(locale);

  if (installPageTitle) {
    installPageTitle.textContent = copy.heroTitle;
  }
  if (installPageLead) {
    installPageLead.textContent = copy.heroLead;
  }
  setText(installHeroEyebrow, metaCopy.heroEyebrow);
  if (installTopbarCta) {
    installTopbarCta.textContent = metaCopy.downloadCta;
  }
  if (installDownloadCta) {
    installDownloadCta.textContent = metaCopy.downloadCta;
  }
  if (installBackCta) {
    installBackCta.textContent = metaCopy.backToProductCta;
  }
  for (const link of installInlineDownloadCtas) {
    link.textContent = metaCopy.downloadCta;
  }
  if (pageType === "install") {
    document.title = copy.documentTitle;
    metaDescription?.setAttribute("content", copy.documentDescription);
  }

  if (installGuideEyebrow) {
    installGuideEyebrow.textContent = copy.eyebrow;
  }
  if (installGuideTitle) {
    installGuideTitle.textContent = copy.title;
  }
  if (installGuideLead) {
    installGuideLead.textContent = copy.lead;
  }
  setText(installChip1, metaCopy.chip1);
  setText(installChip2, metaCopy.chip2);
  setText(installChip3, metaCopy.chip3);
  setText(installMetaCopy, metaCopy.metaCopy);
  setText(installSafetyTitle, metaCopy.safetyTitle);
  setText(installSafetyCopy, metaCopy.safetyCopy);
  setText(installDownloadCardTitle, metaCopy.downloadCardTitle);
  setText(installDownloadCardCopy, metaCopy.downloadCardCopy);
  setText(installVerifyTitle, metaCopy.verifyTitle);
  setList(installVerifyList, metaCopy.verifyItems);

  const titleElements = [
    installStep1Title,
    installStep2Title,
    installStep3Title,
    installStep4Title,
    installStep5Title,
    installStep6Title
  ];
  const bodyElements = [
    installStep1Body,
    installStep2Body,
    installStep3Body,
    installStep4Body,
    installStep5Body,
    installStep6Body
  ];

  copy.steps.forEach((step, index) => {
    if (titleElements[index]) {
      titleElements[index]!.textContent = step.title;
    }
    setHtml(bodyElements[index], step.bodyHtml);
  });
}

async function loadStorefront(): Promise<void> {
  const response = await fetch("/api/public/storefront");
  if (!response.ok) {
    throw new Error("Could not load storefront data.");
  }

  const data = (await response.json()) as { settings?: StorefrontSettings | null };
  storefrontSettings = data.settings ?? null;
  applyLocale(currentLocale);
}

async function loadBotConfig(): Promise<void> {
  const response = await fetch("/api/public/bot/config");
  if (!response.ok) {
    throw new Error("Could not load bot config.");
  }

  const config = (await response.json()) as BotPublicConfig;
  currentBotHandle = normalizeBotHandle(config.botHandle);
  applyLocale(currentLocale);
}

function applyLocale(locale: WebLocale): void {
  currentLocale = locale;
  msg = applyBotHandlePlaceholder(
    landingMessages[locale][landingVariant],
    currentBotHandle,
    DEFAULT_BOT_HANDLE
  );
  document.documentElement.lang = locale;
  applyTranslations(buildTranslationDict(msg));
  if (heroEyebrow) {
    heroEyebrow.innerHTML = renderBrandAccent(msg.heroEyebrow);
  }
  if (productATitle) {
    productATitle.innerHTML = renderBrandAccent(msg.productATitle);
  }
  if (productBTitle) {
    productBTitle.innerHTML = renderBrandAccent(msg.productBTitle);
  }
  applyLangToggle(locale);
  applyCapabilityCopy(locale);
  applySaveRouteSection(locale);
  renderLocalizedStorefront(locale);
  applyInstallGuideCopy(locale);
}

void (async () => {
  msg = landingMessages[currentLocale][landingVariant];
  applyLocale(currentLocale);

  bindLangToggle((next) => {
    applyLocale(next);
  });

  if (pageType === "landing") {
    await Promise.allSettled([
      loadBotConfig(),
      loadStorefront()
    ]);
  }
})();
