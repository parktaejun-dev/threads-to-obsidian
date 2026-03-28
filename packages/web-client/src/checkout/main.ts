import type { BillingCycle, PaymentMethod, PublicStorefrontResponse } from "@threads/web-schema";
import {
  getLocale,
  applyTranslations,
  readWebLocale,
  landingMessages,
  getLandingVariant,
  type LandingMsg,
  type WebLocale
} from "../lib/web-i18n";

const paymentMethodsEl = document.querySelector<HTMLElement>("#payment-methods");
const purchaseForm = document.querySelector<HTMLFormElement>("#purchase-form");
const paymentSelect = document.querySelector<HTMLSelectElement>("select[name='paymentMethodId']");
const purchaseStatus = document.querySelector<HTMLElement>("#purchase-status");
const checkoutPriceValue = document.querySelector<HTMLElement>("#checkout-price-value");
const checkoutPriceNote = document.querySelector<HTMLElement>("#checkout-price-note");
const billingCycleInput = document.querySelector<HTMLInputElement>("input[name='billingCycle'][type='hidden']");
const billingCycleOptions = document.querySelectorAll<HTMLInputElement>("input[name='billingCycle'][type='radio']");
const siteHost = document.body.dataset.siteHost?.trim() ?? "";
const landingVariant = getLandingVariant(siteHost);

let storefront: PublicStorefrontResponse | null = null;
let msg: LandingMsg = landingMessages.ko[landingVariant];
let currentLocale: WebLocale = "ko";

const billingCycleCopy: Record<WebLocale, Record<BillingCycle, { title: string; price: string; note: string }>> = {
  ko: {
    yearly: { title: "연간", price: "US$19.99", note: "연간 기본" },
    monthly: { title: "월간", price: "US$2.99", note: "월간" }
  },
  en: {
    yearly: { title: "Yearly", price: "US$19.99", note: "Yearly default" },
    monthly: { title: "Monthly", price: "US$2.99", note: "Monthly" }
  },
  ja: {
    yearly: { title: "年額", price: "US$19.99", note: "年額が標準" },
    monthly: { title: "月額", price: "US$2.99", note: "月額" }
  },
  "pt-BR": {
    yearly: { title: "Anual", price: "US$19.99", note: "anual por padrão" },
    monthly: { title: "Mensal", price: "US$2.99", note: "mensal" }
  },
  es: {
    yearly: { title: "Anual", price: "US$19.99", note: "anual por defecto" },
    monthly: { title: "Mensual", price: "US$2.99", note: "mensual" }
  },
  "zh-TW": {
    yearly: { title: "年繳", price: "US$19.99", note: "預設為年繳" },
    monthly: { title: "月繳", price: "US$2.99", note: "月繳" }
  },
  vi: {
    yearly: { title: "Theo năm", price: "US$19.99", note: "mặc định theo năm" },
    monthly: { title: "Hàng tháng", price: "US$2.99", note: "hàng tháng" }
  }
};

const checkoutFeatureCopyEn: Record<string, string> = {
  "checkout-include-archive-limit": "Scrapbook 1,000 saved posts",
  "checkout-include-folder-limit": "Scrapbook 50 folders",
  "checkout-include-monitoring": "Watchlists and insights",
  "checkout-include-extension-advanced": "Extension rules, Notion save, AI organization",
  "checkout-include-shared-key": "Use the same Plus key in scrapbook and extension",
  "compare-section-current": "Current features",
  "compare-row-save-post": "Save current post",
  "compare-row-images": "Save images",
  "compare-row-replies": "Author reply chain",
  "compare-row-duplicates": "Skip duplicates",
  "compare-row-mention-scrapbook": "mention inbox",
  "compare-row-watchlists": "Watchlists",
  "compare-row-searches": "Searches",
  "compare-row-insights": "Insights",
  "compare-row-markdown-export": "Markdown export",
  "compare-row-zip-export": "ZIP export",
  "compare-section-plus": "Unlocked on Plus",
  "compare-row-archive-limit": "Scrapbook save limit",
  "compare-row-folder-limit": "Scrapbook folder limit",
  "compare-row-file-name": "File name rules",
  "compare-row-save-path": "Save path rules",
  "compare-row-notion-data-source": "Notion data source save",
  "compare-row-notion-media-upload": "Notion internal media upload",
  "compare-row-ai-summary": "AI summary",
  "compare-row-ai-tags": "AI tags",
  "compare-row-ai-frontmatter": "AI frontmatter",
  "compare-note-title": "Plus expands limits, watchlists, insights, and extension advanced save",
  "compare-note-body": "Paste the same Plus key into scrapbook and extension.",
  "compare-scope-note":
    "Searches stay available on Free. Watchlists and insights unlock on Plus. Searches, watchlists, and insights require Threads sign-in, and some actions need a reconnect for discovery, search, and insights scopes."
};

const checkoutFeatureCopy: Record<WebLocale, Record<string, string>> = {
  ko: {
    "checkout-include-archive-limit": "Scrapbook 저장글 1,000개",
    "checkout-include-folder-limit": "Scrapbook 폴더 50개",
    "checkout-include-monitoring": "Watchlists · Insights",
    "checkout-include-extension-advanced": "Extension 파일 규칙 · Notion · AI 정리",
    "checkout-include-shared-key": "같은 Plus 키로 scrapbook + extension 연결",
    "compare-section-current": "현재 제공 기능",
    "compare-row-save-post": "현재 글 저장",
    "compare-row-images": "이미지 저장",
    "compare-row-replies": "작성자 연속 답글",
    "compare-row-duplicates": "중복 건너뜀",
    "compare-row-mention-scrapbook": "mention inbox",
    "compare-row-watchlists": "Watchlists",
    "compare-row-searches": "Searches",
    "compare-row-insights": "Insights",
    "compare-row-markdown-export": "Markdown export",
    "compare-row-zip-export": "ZIP export",
    "compare-section-plus": "Plus로 확장되는 항목",
    "compare-row-archive-limit": "Scrapbook 저장글 한도",
    "compare-row-folder-limit": "Scrapbook 폴더 한도",
    "compare-row-file-name": "파일 이름 규칙",
    "compare-row-save-path": "저장 경로 규칙",
    "compare-row-notion-data-source": "Notion data source 저장",
    "compare-row-notion-media-upload": "Notion 내부 미디어 업로드",
    "compare-row-ai-summary": "AI 요약",
    "compare-row-ai-tags": "AI 태그",
    "compare-row-ai-frontmatter": "AI frontmatter",
    "compare-note-title": "Plus는 한도, watchlists, insights, extension 고급 저장을 확장합니다",
    "compare-note-body": "이 체크아웃에서 받은 같은 Plus 키를 scrapbook과 extension 양쪽에 붙여넣을 수 있습니다.",
    "compare-scope-note":
      "searches는 Free에서도 사용할 수 있습니다. watchlists와 insights는 Plus에서 열리며, searches·watchlists·insights 사용에는 Threads 로그인과 일부 권한 재연결이 필요합니다."
  },
  en: checkoutFeatureCopyEn,
  ja: {
    "checkout-include-archive-limit": "Scrapbook 保存 1,000件",
    "checkout-include-folder-limit": "Scrapbook フォルダ 50個",
    "checkout-include-monitoring": "Watchlists と insights",
    "checkout-include-extension-advanced": "Extension ルール・Notion 保存・AI 整理",
    "checkout-include-shared-key": "同じ Plus キーを scrapbook と extension で使う",
    "compare-section-current": "現在使える機能",
    "compare-row-save-post": "現在の投稿を保存",
    "compare-row-images": "画像を保存",
    "compare-row-replies": "著者の返信チェーン",
    "compare-row-duplicates": "重複をスキップ",
    "compare-row-mention-scrapbook": "mention inbox",
    "compare-row-watchlists": "Watchlists",
    "compare-row-searches": "Searches",
    "compare-row-insights": "Insights",
    "compare-row-markdown-export": "Markdown エクスポート",
    "compare-row-zip-export": "ZIP エクスポート",
    "compare-section-plus": "Plus で拡張される項目",
    "compare-row-archive-limit": "Scrapbook 保存上限",
    "compare-row-folder-limit": "Scrapbook フォルダ上限",
    "compare-row-file-name": "ファイル名ルール",
    "compare-row-save-path": "保存パスルール",
    "compare-row-notion-data-source": "Notion データソース保存",
    "compare-row-notion-media-upload": "Notion 内部メディアアップロード",
    "compare-row-ai-summary": "AI 要約",
    "compare-row-ai-tags": "AI タグ",
    "compare-row-ai-frontmatter": "AI frontmatter",
    "compare-note-title": "Plus は上限、watchlists、insights、extension の高度な保存を広げます",
    "compare-note-body": "このチェックアウトで受け取る同じ Plus キーを scrapbook と extension の両方で使えます。",
    "compare-scope-note":
      "searches は Free でも使えます。watchlists と insights は Plus で開放されます。searches・watchlists・insights を使うには Threads でのサインインが必要で、discovery/search/insights 用の権限を再接続する場合があります。"
  },
  "pt-BR": {
    "checkout-include-archive-limit": "Scrapbook com 1.000 posts salvos",
    "checkout-include-folder-limit": "Scrapbook com 50 pastas",
    "checkout-include-monitoring": "Watchlists e insights",
    "checkout-include-extension-advanced": "Regras da extensão, salvamento no Notion e organização por AI",
    "checkout-include-shared-key": "Use a mesma chave Plus no scrapbook e na extensão",
    "compare-section-current": "Recursos atuais",
    "compare-row-save-post": "Salvar post atual",
    "compare-row-images": "Salvar imagens",
    "compare-row-replies": "Cadeia de respostas do autor",
    "compare-row-duplicates": "Pular duplicados",
    "compare-row-mention-scrapbook": "mention inbox",
    "compare-row-watchlists": "Watchlists",
    "compare-row-searches": "Searches",
    "compare-row-insights": "Insights",
    "compare-row-markdown-export": "Exportação em Markdown",
    "compare-row-zip-export": "Exportação em ZIP",
    "compare-section-plus": "Desbloqueado no Plus",
    "compare-row-archive-limit": "Limite de salvamentos do scrapbook",
    "compare-row-folder-limit": "Limite de pastas do scrapbook",
    "compare-row-file-name": "Regras de nome de arquivo",
    "compare-row-save-path": "Regras de caminho de salvamento",
    "compare-row-notion-data-source": "Salvar em banco de dados do Notion",
    "compare-row-notion-media-upload": "Upload interno de mídia no Notion",
    "compare-row-ai-summary": "Resumo por AI",
    "compare-row-ai-tags": "Tags por AI",
    "compare-row-ai-frontmatter": "AI frontmatter",
    "compare-note-title": "Plus amplia limites, watchlists, insights e o salvamento avançado da extensão",
    "compare-note-body": "Você pode colar a mesma chave Plus recebida neste checkout no scrapbook e na extensão.",
    "compare-scope-note":
      "Searches continuam disponíveis no Free. Watchlists e insights são desbloqueados no Plus. Searches, watchlists e insights exigem login no Threads, e algumas ações podem pedir reconexão para os escopos de discovery, search e insights."
  },
  es: {
    "checkout-include-archive-limit": "Scrapbook con 1.000 publicaciones guardadas",
    "checkout-include-folder-limit": "Scrapbook con 50 carpetas",
    "checkout-include-monitoring": "Watchlists e insights",
    "checkout-include-extension-advanced": "Reglas de la extensión, guardado en Notion y organización con AI",
    "checkout-include-shared-key": "Usa la misma clave Plus en scrapbook y en la extensión",
    "compare-section-current": "Funciones actuales",
    "compare-row-save-post": "Guardar publicación actual",
    "compare-row-images": "Guardar imágenes",
    "compare-row-replies": "Cadena de respuestas del autor",
    "compare-row-duplicates": "Omitir duplicados",
    "compare-row-mention-scrapbook": "mention inbox",
    "compare-row-watchlists": "Watchlists",
    "compare-row-searches": "Searches",
    "compare-row-insights": "Insights",
    "compare-row-markdown-export": "Exportación en Markdown",
    "compare-row-zip-export": "Exportación en ZIP",
    "compare-section-plus": "Lo que se desbloquea con Plus",
    "compare-row-archive-limit": "Límite de guardados en scrapbook",
    "compare-row-folder-limit": "Límite de carpetas en scrapbook",
    "compare-row-file-name": "Reglas de nombre de archivo",
    "compare-row-save-path": "Reglas de ruta de guardado",
    "compare-row-notion-data-source": "Guardado en base de datos de Notion",
    "compare-row-notion-media-upload": "Subida interna de medios a Notion",
    "compare-row-ai-summary": "Resumen con AI",
    "compare-row-ai-tags": "Etiquetas con AI",
    "compare-row-ai-frontmatter": "AI frontmatter",
    "compare-note-title": "Plus amplía límites, watchlists, insights y el guardado avanzado de la extensión",
    "compare-note-body": "Puedes pegar la misma clave Plus recibida en este checkout tanto en scrapbook como en la extensión.",
    "compare-scope-note":
      "Searches sigue disponible en Free. Watchlists e insights se desbloquean en Plus. Searches, watchlists e insights requieren iniciar sesión en Threads, y algunas acciones pueden pedir reconexión para los permisos de discovery, search e insights."
  },
  "zh-TW": {
    "checkout-include-archive-limit": "Scrapbook 1,000 篇保存",
    "checkout-include-folder-limit": "Scrapbook 50 個資料夾",
    "checkout-include-monitoring": "Watchlists 與 insights",
    "checkout-include-extension-advanced": "Extension 規則、Notion 儲存、AI 整理",
    "checkout-include-shared-key": "同一組 Plus 金鑰可同時用在 scrapbook 與 extension",
    "compare-section-current": "目前提供的功能",
    "compare-row-save-post": "儲存目前貼文",
    "compare-row-images": "儲存圖片",
    "compare-row-replies": "作者回覆串",
    "compare-row-duplicates": "跳過重複項目",
    "compare-row-mention-scrapbook": "mention inbox",
    "compare-row-watchlists": "Watchlists",
    "compare-row-searches": "Searches",
    "compare-row-insights": "Insights",
    "compare-row-markdown-export": "Markdown 匯出",
    "compare-row-zip-export": "ZIP 匯出",
    "compare-section-plus": "Plus 解鎖內容",
    "compare-row-archive-limit": "Scrapbook 保存上限",
    "compare-row-folder-limit": "Scrapbook 資料夾上限",
    "compare-row-file-name": "檔名規則",
    "compare-row-save-path": "儲存路徑規則",
    "compare-row-notion-data-source": "Notion 資料庫儲存",
    "compare-row-notion-media-upload": "Notion 內部媒體上傳",
    "compare-row-ai-summary": "AI 摘要",
    "compare-row-ai-tags": "AI 標籤",
    "compare-row-ai-frontmatter": "AI frontmatter",
    "compare-note-title": "Plus 會擴充上限、watchlists、insights 與 extension 進階儲存能力",
    "compare-note-body": "你可以把這次 checkout 收到的同一組 Plus 金鑰貼到 scrapbook 和 extension。",
    "compare-scope-note":
      "searches 在 Free 也能使用。watchlists 與 insights 會在 Plus 解鎖。searches、watchlists 與 insights 需要登入 Threads，部分操作可能還需要重新授權 discovery、search 與 insights 權限。"
  },
  vi: {
    "checkout-include-archive-limit": "Scrapbook 1.000 bài đã lưu",
    "checkout-include-folder-limit": "Scrapbook 50 thư mục",
    "checkout-include-monitoring": "Watchlists và insights",
    "checkout-include-extension-advanced": "Quy tắc extension, lưu vào Notion và sắp xếp bằng AI",
    "checkout-include-shared-key": "Dùng cùng một khóa Plus cho scrapbook và extension",
    "compare-section-current": "Tính năng hiện có",
    "compare-row-save-post": "Lưu bài viết hiện tại",
    "compare-row-images": "Lưu hình ảnh",
    "compare-row-replies": "Chuỗi phản hồi của tác giả",
    "compare-row-duplicates": "Bỏ qua trùng lặp",
    "compare-row-mention-scrapbook": "mention inbox",
    "compare-row-watchlists": "Watchlists",
    "compare-row-searches": "Searches",
    "compare-row-insights": "Insights",
    "compare-row-markdown-export": "Xuất Markdown",
    "compare-row-zip-export": "Xuất ZIP",
    "compare-section-plus": "Mở khóa trong Plus",
    "compare-row-archive-limit": "Giới hạn lưu của scrapbook",
    "compare-row-folder-limit": "Giới hạn thư mục của scrapbook",
    "compare-row-file-name": "Quy tắc tên tệp",
    "compare-row-save-path": "Quy tắc đường dẫn lưu",
    "compare-row-notion-data-source": "Lưu vào cơ sở dữ liệu Notion",
    "compare-row-notion-media-upload": "Tải media nội bộ lên Notion",
    "compare-row-ai-summary": "Tóm tắt bằng AI",
    "compare-row-ai-tags": "Thẻ AI",
    "compare-row-ai-frontmatter": "AI frontmatter",
    "compare-note-title": "Plus mở rộng giới hạn, watchlists, insights và khả năng lưu nâng cao của extension",
    "compare-note-body": "Bạn có thể dán cùng một khóa Plus nhận được từ checkout này vào cả scrapbook lẫn extension.",
    "compare-scope-note":
      "searches vẫn có trong Free. Watchlists và insights được mở khóa trong Plus. Searches, watchlists và insights yêu cầu đăng nhập Threads, và một số thao tác có thể cần kết nối lại để cấp quyền discovery, search và insights."
  }
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildTranslationDict(copy: LandingMsg): Record<string, string> {
  return Object.fromEntries(
    Object.entries(copy).filter(([, value]) => typeof value === "string")
  ) as Record<string, string>;
}

function setTextById(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function applyCheckoutFeatureCopy(locale: WebLocale): void {
  const copy = checkoutFeatureCopy[locale];
  for (const [id, value] of Object.entries(copy)) {
    setTextById(id, value);
  }
}

function renderPaymentMethods(methods: PaymentMethod[]): void {
  if (!paymentMethodsEl || !paymentSelect) {
    return;
  }

  paymentMethodsEl.innerHTML = methods
    .map(
      (method) => `
        <article class="method-card">
          <div class="method-card-meta">
            <strong>${escapeHtml(method.name)}</strong>
            <span class="method-badge">${escapeHtml(msg.methodBadge)}</span>
          </div>
          <p>${escapeHtml(method.summary)}</p>
          ${
            method.actionUrl
              ? `
            <a
              class="method-link"
              href="${escapeHtml(method.actionUrl)}"
              target="_blank"
              rel="noreferrer"
            >${escapeHtml(method.actionLabel || "Open payment page")}</a>
          `
              : ""
          }
        </article>
      `
    )
    .join("");

  paymentSelect.innerHTML = `<option value="">${escapeHtml(msg.phMethod)}</option>`;
  for (const method of methods) {
    const option = document.createElement("option");
    option.value = method.id;
    option.textContent = method.name;
    paymentSelect.appendChild(option);
  }
}

function getSelectedBillingCycle(): BillingCycle {
  const selected = [...billingCycleOptions].find((candidate) => candidate.checked)?.value;
  return selected === "monthly" ? "monthly" : "yearly";
}

function applyBillingCycleUi(): void {
  const cycle = getSelectedBillingCycle();
  const cycleCopy = billingCycleCopy[currentLocale][cycle];
  if (billingCycleInput) {
    billingCycleInput.value = cycle;
  }
  if (checkoutPriceValue) {
    checkoutPriceValue.textContent = cycleCopy.price;
  }
  if (checkoutPriceNote) {
    checkoutPriceNote.textContent = cycleCopy.note;
  }

  for (const option of billingCycleOptions) {
    const copy = billingCycleCopy[currentLocale][option.value === "monthly" ? "monthly" : "yearly"];
    const label = option.closest(".checkout-cycle-option");
    const title = label?.querySelector("span");
    const price = label?.querySelector("strong");
    if (title) {
      title.textContent = copy.title;
    }
    if (price) {
      price.textContent = copy.price;
    }
  }
}

function setStatus(message: string, isError = false): void {
  if (!purchaseStatus) {
    return;
  }

  purchaseStatus.textContent = message;
  purchaseStatus.classList.remove("hidden");
  purchaseStatus.classList.toggle("error", isError);
  purchaseStatus.classList.toggle("success", !isError);
}

async function loadStorefront(): Promise<void> {
  const response = await fetch("/api/public/storefront");
  if (!response.ok) {
    throw new Error("Could not load storefront data.");
  }

  storefront = (await response.json()) as PublicStorefrontResponse;
  renderPaymentMethods(storefront.paymentMethods);
}

async function submitPurchaseRequest(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!purchaseForm) {
    return;
  }

  const formData = new FormData(purchaseForm);
  const payload = {
    buyerName: formData.get("buyerName")?.toString() ?? "",
    buyerEmail: formData.get("buyerEmail")?.toString() ?? "",
    billingCycle: getSelectedBillingCycle(),
    paymentMethodId: formData.get("paymentMethodId")?.toString() ?? "",
    note: formData.get("note")?.toString() ?? ""
  };

  const response = await fetch("/api/public/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = (await response.json()) as
    | { error: string }
    | {
        order: { id: string; buyerEmail: string };
        paymentMethod: PaymentMethod;
      };

  if (!response.ok || "error" in result) {
    setStatus(("error" in result ? result.error : "Could not create order.") || "Could not create order.", true);
    return;
  }

  const lines = [
    msg.orderSuccess1.replace("{email}", result.order.buyerEmail),
    `ID: ${result.order.id}`,
    "",
    msg.orderNextStep.replace("{instructions}", result.paymentMethod.instructions),
    result.paymentMethod.actionUrl ? msg.orderPayLink.replace("{url}", result.paymentMethod.actionUrl) : "",
    msg.orderFinal
  ].filter((line) => line !== "");
  setStatus(lines.join("\n"));
  purchaseForm.reset();
}

function applyLocale(locale: WebLocale): void {
  currentLocale = locale;
  msg = landingMessages[locale][landingVariant];
  document.documentElement.lang = locale;
  applyTranslations(buildTranslationDict(msg));
  applyCheckoutFeatureCopy(locale);
  applyBillingCycleUi();
}

void (async () => {
  currentLocale = getLocale();
  msg = landingMessages[currentLocale][landingVariant];
  applyTranslations(buildTranslationDict(msg));
  document.documentElement.lang = currentLocale;

  // Detect locale from query param (shared with landing)
  const params = new URLSearchParams(window.location.search);
  const langParam = readWebLocale(params.get("lang"));
  if (langParam) {
    applyLocale(langParam);
  }

  try {
    await loadStorefront();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not load checkout.", true);
  }

  applyBillingCycleUi();
})();

purchaseForm?.addEventListener("submit", (event) => {
  void submitPurchaseRequest(event);
});

for (const option of billingCycleOptions) {
  option.addEventListener("change", () => {
    applyBillingCycleUi();
  });
}
