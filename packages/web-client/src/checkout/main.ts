import { DEFAULT_SETTINGS, type BillingCycle, type PaymentMethod, type PublicStorefrontResponse, type StorefrontSettings } from "@threads/web-schema";
import { parseSupportedLocale } from "@threads/shared/locale";
import {
  getLocale,
  applyTranslations,
  applyLangToggle,
  bindLangToggle,
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
const checkoutEyebrow = document.querySelector<HTMLElement>("#checkout-eyebrow");
const checkoutTitle = document.querySelector<HTMLElement>("#checkout-title");
const checkoutLead = document.querySelector<HTMLElement>("#checkout-lead");
const checkoutPriceValue = document.querySelector<HTMLElement>("#checkout-price-value");
const checkoutPriceNote = document.querySelector<HTMLElement>("#checkout-price-note");
const checkoutMethodsEyebrow = document.querySelector<HTMLElement>("#checkout-methods-eyebrow");
const checkoutMethodsTitle = document.querySelector<HTMLElement>("#checkout-methods-title");
const checkoutMethodsCopy = document.querySelector<HTMLElement>("#checkout-methods-copy");
const checkoutFulfillmentTitle = document.querySelector<HTMLElement>("#checkout-fulfillment-title");
const checkoutFulfillmentCopy = document.querySelector<HTMLElement>("#checkout-fulfillment-copy");
const checkoutFulfillmentSteps = document.querySelector<HTMLElement>("#checkout-fulfillment-steps");
const checkoutSupportLabel = document.querySelector<HTMLElement>("#checkout-support-label");
const checkoutSupportEmail = document.querySelector<HTMLAnchorElement>("#checkout-support-email");
const checkoutSupportCopy = document.querySelector<HTMLElement>("#checkout-support-copy");
const checkoutRefundLabel = document.querySelector<HTMLElement>("#checkout-refund-label");
const checkoutRefundCopy = document.querySelector<HTMLElement>("#checkout-refund-copy");
const checkoutDataLabel = document.querySelector<HTMLElement>("#checkout-data-label");
const checkoutDataCopy = document.querySelector<HTMLElement>("#checkout-data-copy");
const formNameHint = document.querySelector<HTMLElement>("#form-name-hint");
const formEmailHint = document.querySelector<HTMLElement>("#form-email-hint");
const formMethodHint = document.querySelector<HTMLElement>("#form-method-hint");
const formNoteHint = document.querySelector<HTMLElement>("#form-note-hint");
const checkoutSubmitButton = document.querySelector<HTMLButtonElement>("#checkout-submit-button");
const billingCycleInput = document.querySelector<HTMLInputElement>("input[name='billingCycle'][type='hidden']");
const billingCycleOptions = document.querySelectorAll<HTMLInputElement>("input[name='billingCycle'][type='radio']");
const siteHost = document.body.dataset.siteHost?.trim() ?? "";
const initialLocaleHint = parseSupportedLocale(document.body.dataset.initialLocale);
const landingVariant = getLandingVariant(siteHost);
const DEFAULT_YEARLY_PRICE = "US$19.99";
const DEFAULT_MONTHLY_PRICE = "US$2.99";

let storefrontSettings: StorefrontSettings | null = null;
let paymentMethods: PaymentMethod[] = [];
let msg: LandingMsg = landingMessages.ko[landingVariant];
let currentLocale: WebLocale = getLocale(initialLocaleHint ?? "en");

type CheckoutUiCopy = {
  eyebrow: string;
  methodsEyebrow: string;
  methodsTitle: string;
  methodsCopy: string;
  fulfillmentSteps: string[];
  supportLabel: string;
  supportCopy: string;
  refundLabel: string;
  refundCopy: string;
  dataLabel: string;
  dataCopy: string;
  nameHint: string;
  emailHint: string;
  methodHint: string;
  noteHint: string;
  submitCta: string;
};

const billingCycleCopy: Record<WebLocale, Record<BillingCycle, { title: string; price: string; note: string }>> = {
  ko: {
    yearly: { title: "연간", price: DEFAULT_YEARLY_PRICE, note: "권장" },
    monthly: { title: "월간", price: DEFAULT_MONTHLY_PRICE, note: "유연 결제" }
  },
  en: {
    yearly: { title: "Yearly", price: DEFAULT_YEARLY_PRICE, note: "Recommended" },
    monthly: { title: "Monthly", price: DEFAULT_MONTHLY_PRICE, note: "Flexible billing" }
  },
  ja: {
    yearly: { title: "年額", price: DEFAULT_YEARLY_PRICE, note: "年額が標準" },
    monthly: { title: "月額", price: DEFAULT_MONTHLY_PRICE, note: "月額" }
  },
  "pt-BR": {
    yearly: { title: "Anual", price: DEFAULT_YEARLY_PRICE, note: "anual por padrão" },
    monthly: { title: "Mensal", price: DEFAULT_MONTHLY_PRICE, note: "mensal" }
  },
  es: {
    yearly: { title: "Anual", price: DEFAULT_YEARLY_PRICE, note: "anual por defecto" },
    monthly: { title: "Mensual", price: DEFAULT_MONTHLY_PRICE, note: "mensual" }
  },
  "zh-TW": {
    yearly: { title: "年繳", price: DEFAULT_YEARLY_PRICE, note: "預設為年繳" },
    monthly: { title: "月繳", price: DEFAULT_MONTHLY_PRICE, note: "月繳" }
  },
  vi: {
    yearly: { title: "Theo năm", price: DEFAULT_YEARLY_PRICE, note: "mặc định theo năm" },
    monthly: { title: "Hàng tháng", price: DEFAULT_MONTHLY_PRICE, note: "hàng tháng" }
  }
};

const checkoutUiCopyByLocale: Partial<Record<WebLocale, CheckoutUiCopy>> = {
  ko: {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "결제수단",
    methodsTitle: "결제 방법을 고르세요",
    methodsCopy: "가능한 결제수단만 표시됩니다. 아래에서도 같은 수단을 고르면 됩니다.",
    fulfillmentSteps: [
      "주문서를 보냅니다.",
      "선택한 결제수단으로 결제를 마칩니다.",
      "보통 30분 안에 Plus 키를 이메일로 받습니다."
    ],
    supportLabel: "지원 메일",
    supportCopy: "주문 확인, 환불, Plus 문의를 이 이메일로 받습니다.",
    refundLabel: "환불",
    refundCopy: "구매 후 7일 안에 환불 요청을 보낼 수 있습니다.",
    dataLabel: "데이터 처리",
    dataCopy: "저장과 검색은 스크랩북 중심으로 동작하고, 필요한 연결 기능만 서버를 거칩니다.",
    nameHint: "영수증과 키 안내에 쓸 이름입니다.",
    emailHint: "Plus 키를 받을 이메일을 적어주세요.",
    methodHint: "위에서 본 결제수단과 같은 것을 고르세요.",
    noteHint: "세금계산서나 팀 요청이 있으면 남겨주세요.",
    submitCta: "주문 접수하기"
  },
  en: {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "Payment method",
    methodsTitle: "Choose a payment method",
    methodsCopy: "Only available methods are shown here. Pick the same one again in the form below.",
    fulfillmentSteps: [
      "Send the order form.",
      "Finish payment with the method you picked.",
      "Receive the Plus key by email, usually within 30 minutes."
    ],
    supportLabel: "Support email",
    supportCopy: "Use this email for order confirmation, refunds, and Plus questions.",
    refundLabel: "Refunds",
    refundCopy: "Refund requests are accepted within 7 days after purchase.",
    dataLabel: "Data handling",
    dataCopy: "Saving and search run around scrapbook, while connected features such as Plus activation and Notion save use server-side processing.",
    nameHint: "This name is used for the receipt and key delivery note.",
    emailHint: "Use the email that should receive the Plus key.",
    methodHint: "Choose the same payment method you reviewed above.",
    noteHint: "Leave invoice or team-related requests here.",
    submitCta: "Submit order"
  },
  ja: {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "お支払い方法",
    methodsTitle: "お支払い方法を選択してください",
    methodsCopy: "利用可能な方法のみが表示されています。下のフォームでも同じものを選択してください。",
    fulfillmentSteps: [
      "注文フォームを送信します。",
      "選択した方法で支払いを完了します。",
      "通常30分以内にメールで Plus キーが届きます。"
    ],
    supportLabel: "サポートメール",
    supportCopy: "注文確認、返金、Plus に関するお問い合わせはこちらまで。",
    refundLabel: "返金",
    refundCopy: "購入後7日以内であれば返金リクエストを受け付けています。",
    dataLabel: "データ処理",
    dataCopy: "保存と検索はスクラップブックを中心に行われ、必要な連携機能のみサーバーを経由します。",
    nameHint: "領収書やキーの案内に使用する名前です。",
    emailHint: "Plus キーを受け取るメールアドレスを入力してください。",
    methodHint: "上で確認したのと同じお支払い方法を選択してください。",
    noteHint: "請求書やチームに関する要望があれば記入してください。",
    submitCta: "注文を確定する"
  },
  "pt-BR": {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "Forma de pagamento",
    methodsTitle: "Escolha uma forma de pagamento",
    methodsCopy: "Apenas métodos disponíveis são mostrados. Escolha o mesmo novamente no formulário abaixo.",
    fulfillmentSteps: [
      "Envie o formulário de pedido.",
      "Finalize o pagamento com o método escolhido.",
      "Receba a chave Plus por email, geralmente em até 30 minutos."
    ],
    supportLabel: "Email de suporte",
    supportCopy: "Use este email para confirmação de pedido, reembolsos e dúvidas sobre o Plus.",
    refundLabel: "Reembolsos",
    refundCopy: "Pedidos de reembolso são aceitos em até 7 dias após a compra.",
    dataLabel: "Tratamento de dados",
    dataCopy: "Salvamento e busca rodam no scrapbook, enquanto funções conectadas como ativação do Plus e Notion usam o servidor.",
    nameHint: "Este nome será usado no recibo e na entrega da chave.",
    emailHint: "Use o email que deve receber a chave Plus.",
    methodHint: "Escolha a mesma forma de pagamento que você revisou acima.",
    noteHint: "Deixe aqui solicitações de nota fiscal ou relacionadas à equipe.",
    submitCta: "Enviar pedido"
  },
  es: {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "Método de pago",
    methodsTitle: "Elige un método de pago",
    methodsCopy: "Solo se muestran los métodos disponibles. Elige el mismo otra vez en el formulario de abajo.",
    fulfillmentSteps: [
      "Envía el formulario de pedido.",
      "Termina el pago con el método elegido.",
      "Recibe la clave Plus por correo, normalmente en unos 30 minutos."
    ],
    supportLabel: "Correo de soporte",
    supportCopy: "Usa este correo para confirmación de pedidos, reembolsos y dudas sobre Plus.",
    refundLabel: "Reembolsos",
    refundCopy: "Se aceptan solicitudes de reembolso hasta 7 días después de la compra.",
    dataLabel: "Manejo de datos",
    dataCopy: "El guardado y la búsqueda se realizan en el scrapbook, mientras que funciones como Plus o Notion usan el servidor.",
    nameHint: "Este nombre se usará para el recibo y la entrega de la clave.",
    emailHint: "Usa el correo donde quieras recibir la clave Plus.",
    methodHint: "Elige el mismo método de pago que revisaste arriba.",
    noteHint: "Deja aquí solicitudes de factura o peticiones del equipo.",
    submitCta: "Enviar pedido"
  },
  "zh-TW": {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "付款方式",
    methodsTitle: "選擇付款方式",
    methodsCopy: "僅顯示可用的付款方式。請在下方表單中再次選擇相同的項目。",
    fulfillmentSteps: [
      "送出訂單表單。",
      "使用選擇的方式完成付款。",
      "通常會在 30 分鐘內透過電子郵件收到 Plus 金鑰。"
    ],
    supportLabel: "支援信箱",
    supportCopy: "訂單確認、退款及 Plus 相關問題請洽此信箱。",
    refundLabel: "退款",
    refundCopy: "購買後 7 天內可提出退款申請。",
    dataLabel: "數據處理",
    dataCopy: "儲存與搜尋以 Scrapbook 為核心，僅必要的串接功能會經過伺服器。",
    nameHint: "此名稱將用於收據及金鑰寄送通知。",
    emailHint: "請輸入接收 Plus 金鑰的電子郵件。",
    methodHint: "請選擇與上方一致的付款方式。",
    noteHint: "如有發票或團隊相關需求請在此留言。",
    submitCta: "提交訂單"
  },
  vi: {
    eyebrow: "ss-threads Plus",
    methodsEyebrow: "Phương thức thanh toán",
    methodsTitle: "Chọn phương thức thanh toán",
    methodsCopy: "Chỉ hiển thị các phương thức khả dụng. Hãy chọn lại đúng phương thức đó ở form bên dưới.",
    fulfillmentSteps: [
      "Gửi form đặt hàng.",
      "Hoàn tất thanh toán bằng phương thức đã chọn.",
      "Nhận khóa Plus qua email, thường trong vòng 30 phút."
    ],
    supportLabel: "Email hỗ trợ",
    supportCopy: "Dùng email này để xác nhận đơn hàng, hoàn tiền và các câu hỏi về Plus.",
    refundLabel: "Hoàn tiền",
    refundCopy: "Yêu cầu hoàn tiền được chấp nhận trong vòng 7 ngày sau khi mua.",
    dataLabel: "Xử lý dữ liệu",
    dataCopy: "Lưu và tìm kiếm hoạt động trên scrapbook, các tính năng như Plus hoặc Notion sẽ dùng máy chủ.",
    nameHint: "Tên này được dùng cho hóa đơn và thông báo gửi khóa.",
    emailHint: "Dùng email bạn muốn nhận khóa Plus.",
    methodHint: "Chọn đúng phương thức thanh toán bạn đã xem ở trên.",
    noteHint: "Để lại yêu cầu về hóa đơn hoặc yêu cầu của nhóm tại đây.",
    submitCta: "Gửi đơn hàng"
  }
};

const checkoutFulfillmentCopyByLocale: Record<WebLocale, { title: string; body: string }> = {
  ko: {
    title: "보통 30분 안에 이메일로 Plus 키 발송",
    body: "즉시 활성화형이 아니라 주문 확인 뒤 발급됩니다."
  },
  en: {
    title: "Plus key emailed in about 30 minutes",
    body: "This is not instant activation. The key is issued after the order is reviewed and payment is confirmed."
  },
  ja: {
    title: "即時有効化ではありません",
    body: "注文受付後に支払いを確認し、通常30分以内に Plus キーをメールで送ります。"
  },
  "pt-BR": {
    title: "Não é ativação instantânea",
    body: "Depois que o pedido é recebido, confirmamos o pagamento e normalmente enviamos a chave Plus por email em até 30 minutos."
  },
  es: {
    title: "No es activación instantánea",
    body: "Después de recibir el pedido, confirmamos el pago y normalmente enviamos la clave Plus por correo en unos 30 minutos."
  },
  "zh-TW": {
    title: "不是即時啟用",
    body: "收到訂單後會先確認付款，通常會在 30 分鐘內透過電子郵件寄出 Plus 金鑰。"
  },
  vi: {
    title: "Không kích hoạt ngay lập tức",
    body: "Sau khi nhận đơn, chúng tôi xác nhận thanh toán và thường gửi khóa Plus qua email trong vòng 30 phút."
  }
};

const checkoutFeatureCopyEn: Record<string, string> = {
  "checkout-include-archive-limit": "Saved posts 100 -> 1,000",
  "checkout-include-folder-limit": "Folders 5 -> 50",
  "checkout-include-monitoring": "Followed accounts and account activity",
  "checkout-include-extension-advanced": "Notion save, save rules, automatic organization",
  "checkout-include-shared-key": "Use the same Plus key in scrapbook and extension",
  "compare-section-current": "Current features",
  "compare-row-save-post": "Save current post",
  "compare-row-images": "Save images",
  "compare-row-replies": "Author reply chain",
  "compare-row-duplicates": "Skip duplicates",
  "compare-row-mention-scrapbook": "Mobile mention save",
  "compare-row-watchlists": "Followed accounts",
  "compare-row-searches": "Saved post search",
  "compare-row-insights": "Account activity",
  "compare-row-markdown-export": "Markdown export",
  "compare-row-zip-export": "ZIP export",
  "compare-section-plus": "Unlocked on Plus",
  "compare-row-archive-limit": "Saved post limit",
  "compare-row-folder-limit": "Folder limit",
  "compare-row-file-name": "File naming rules",
  "compare-row-save-path": "Save location rules",
  "compare-row-notion-data-source": "Notion data source save",
  "compare-row-notion-media-upload": "Upload media into Notion",
  "compare-row-ai-summary": "Automatic summary",
  "compare-row-ai-tags": "Automatic tags",
  "compare-row-ai-frontmatter": "Automatic metadata",
  "compare-note-title": "Free covers saving and review. Plus expands limits and opens account views.",
  "compare-note-body": "Paste the same Plus key into scrapbook and extension.",
  "compare-scope-note":
    "Saved post search stays available on Free. Followed accounts and activity unlock on Plus after you sign in with Threads."
};

const checkoutFeatureCopy: Record<WebLocale, Record<string, string>> = {
  ko: {
    "checkout-include-archive-limit": "저장글 100 -> 1,000",
    "checkout-include-folder-limit": "폴더 5 -> 50",
    "checkout-include-monitoring": "관심 계정 새 글 + 내 계정 반응",
    "checkout-include-extension-advanced": "PC 저장 자동 정리와 Notion 저장",
    "checkout-include-shared-key": "같은 Plus 키를 스크랩북과 PC 저장에 함께 사용",
    "compare-section-current": "현재 제공 기능",
    "compare-row-save-post": "현재 글 저장",
    "compare-row-images": "이미지 저장",
    "compare-row-replies": "작성자 연속 답글",
    "compare-row-duplicates": "중복 건너뜀",
    "compare-row-mention-scrapbook": "모바일 댓글 저장",
    "compare-row-watchlists": "관심 계정 새 글",
    "compare-row-searches": "저장글 검색",
    "compare-row-insights": "내 계정 반응 보기",
    "compare-row-markdown-export": "글 내보내기",
    "compare-row-zip-export": "묶음 내보내기",
    "compare-section-plus": "Plus로 확장되는 항목",
    "compare-row-archive-limit": "저장글 한도",
    "compare-row-folder-limit": "폴더 한도",
    "compare-row-file-name": "파일 이름 자동 정리",
    "compare-row-save-path": "저장 위치 자동 정리",
    "compare-row-notion-data-source": "Notion 데이터베이스 저장",
    "compare-row-notion-media-upload": "Notion 안에 이미지 저장",
    "compare-row-ai-summary": "요약 자동 정리",
    "compare-row-ai-tags": "태그 자동 정리",
    "compare-row-ai-frontmatter": "메모 자동 정리",
    "compare-note-title": "Free는 저장과 다시 보기까지, Plus는 한도와 계정 보기를 넓힙니다.",
    "compare-note-body": "받은 Plus 키는 스크랩북과 PC 저장에 같이 씁니다.",
    "compare-scope-note":
      "저장글 검색은 Free에서도 쓸 수 있습니다. 관심 계정과 내 계정 반응 보기는 Plus에서 열리며, Threads 로그인 뒤 사용할 수 있습니다."
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

function getCheckoutUiCopy(locale: WebLocale): CheckoutUiCopy {
  return checkoutUiCopyByLocale[locale] ?? checkoutUiCopyByLocale.en!;
}

function replaceYearlyPrice(value: string): string {
  const yearlyPrice = storefrontSettings?.priceValue.trim() || DEFAULT_YEARLY_PRICE;
  return value.replaceAll(DEFAULT_YEARLY_PRICE, yearlyPrice);
}

function getBillingCycleCopy(locale: WebLocale, cycle: BillingCycle): { title: string; price: string; note: string } {
  const baseCopy = billingCycleCopy[locale][cycle];
  if (cycle !== "yearly") {
    return baseCopy;
  }

  return {
    ...baseCopy,
    price: storefrontSettings?.priceValue.trim() || baseCopy.price
  };
}

function applyCheckoutFeatureCopy(locale: WebLocale): void {
  const copy = checkoutFeatureCopy[locale];
  for (const [id, value] of Object.entries(copy)) {
    setTextById(id, value);
  }
}

function applyCheckoutStorefrontCopy(): void {
  const uiCopy = getCheckoutUiCopy(currentLocale);
  const title = storefrontSettings?.priceLabel.trim() || msg.commerceH2;
  const lead = replaceYearlyPrice(msg.commerceLead);

  setText(checkoutEyebrow, uiCopy.eyebrow);
  if (checkoutTitle) {
    checkoutTitle.textContent = title;
  }

  if (checkoutLead) {
    checkoutLead.textContent = lead;
  }

  document.title = [title, siteHost].filter(Boolean).join(" | ");
}

function applyCheckoutFulfillmentCopy(locale: WebLocale): void {
  const copy = checkoutFulfillmentCopyByLocale[locale];

  if (checkoutFulfillmentTitle) {
    checkoutFulfillmentTitle.textContent = copy.title;
  }

  if (checkoutFulfillmentCopy) {
    checkoutFulfillmentCopy.textContent = copy.body;
  }

  setList(checkoutFulfillmentSteps, getCheckoutUiCopy(locale).fulfillmentSteps);
}

function applyCheckoutUiCopy(locale: WebLocale): void {
  const uiCopy = getCheckoutUiCopy(locale);
  const supportEmail = storefrontSettings?.supportEmail.trim() || DEFAULT_SETTINGS.supportEmail;

  setText(checkoutMethodsEyebrow, uiCopy.methodsEyebrow);
  setText(checkoutMethodsTitle, uiCopy.methodsTitle);
  setText(checkoutMethodsCopy, uiCopy.methodsCopy);
  setText(checkoutSupportLabel, uiCopy.supportLabel);
  setEmailLink(checkoutSupportEmail, supportEmail);
  setText(checkoutSupportCopy, uiCopy.supportCopy);
  setText(checkoutRefundLabel, uiCopy.refundLabel);
  setText(checkoutRefundCopy, uiCopy.refundCopy);
  setText(checkoutDataLabel, uiCopy.dataLabel);
  setText(checkoutDataCopy, uiCopy.dataCopy);
  setText(formNameHint, uiCopy.nameHint);
  setText(formEmailHint, uiCopy.emailHint);
  setText(formMethodHint, uiCopy.methodHint);
  setText(formNoteHint, uiCopy.noteHint);
  if (checkoutSubmitButton) {
    checkoutSubmitButton.textContent = uiCopy.submitCta;
  }
}

function renderPaymentMethods(methods: PaymentMethod[]): void {
  if (!paymentMethodsEl || !paymentSelect) {
    return;
  }

  const selectedPaymentMethodId = paymentSelect.value;

  paymentMethodsEl.innerHTML = methods
    .map(
      (method) => `
        <article class="method-card${method.id === selectedPaymentMethodId ? " is-selected" : ""}" data-method-id="${escapeHtml(method.id)}">
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
            >${escapeHtml(method.actionLabel || (currentLocale === "ko" ? "결제 페이지 열기" : "Open payment page"))}</a>
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

  if (selectedPaymentMethodId && methods.some((method) => method.id === selectedPaymentMethodId)) {
    paymentSelect.value = selectedPaymentMethodId;
  }

  syncSelectedMethodCard();
}

function syncSelectedMethodCard(): void {
  if (!paymentMethodsEl || !paymentSelect) {
    return;
  }

  const selectedId = paymentSelect.value;
  for (const card of paymentMethodsEl.querySelectorAll<HTMLElement>(".method-card")) {
    card.classList.toggle("is-selected", card.dataset.methodId === selectedId);
  }
}

function getSelectedBillingCycle(): BillingCycle {
  const selected = [...billingCycleOptions].find((candidate) => candidate.checked)?.value;
  return selected === "monthly" ? "monthly" : "yearly";
}

function applyBillingCycleUi(): void {
  const cycle = getSelectedBillingCycle();
  const cycleCopy = getBillingCycleCopy(currentLocale, cycle);
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
    const copy = getBillingCycleCopy(currentLocale, option.value === "monthly" ? "monthly" : "yearly");
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

  const data = (await response.json()) as PublicStorefrontResponse;
  storefrontSettings = data.settings;
  paymentMethods = data.paymentMethods;
  renderPaymentMethods(paymentMethods);
  applyLocale(currentLocale);
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
  applyBillingCycleUi();
  syncSelectedMethodCard();
}

function applyLocale(locale: WebLocale): void {
  currentLocale = locale;
  msg = landingMessages[locale][landingVariant];
  document.documentElement.lang = locale;
  applyTranslations(buildTranslationDict(msg));
  applyLangToggle(locale);
  applyCheckoutFeatureCopy(locale);
  applyCheckoutStorefrontCopy();
  applyCheckoutUiCopy(locale);
  applyCheckoutFulfillmentCopy(locale);
  applyBillingCycleUi();
  if (paymentMethods.length > 0) {
    renderPaymentMethods(paymentMethods);
  }
}

void (async () => {
  const params = new URLSearchParams(window.location.search);
  const langParam = readWebLocale(params.get("lang"));
  if (langParam) {
    currentLocale = langParam;
  }

  msg = landingMessages[currentLocale][landingVariant];
  applyLocale(currentLocale);

  bindLangToggle((next) => {
    applyLocale(next);
  });

  try {
    await loadStorefront();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not load checkout.", true);
  }
})();

purchaseForm?.addEventListener("submit", (event) => {
  void submitPurchaseRequest(event);
});

paymentSelect?.addEventListener("change", () => {
  syncSelectedMethodCard();
});

paymentMethodsEl?.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const card = target?.closest<HTMLElement>(".method-card");
  if (!card || !paymentSelect) {
    return;
  }

  const methodId = card.dataset.methodId ?? "";
  if (!methodId) {
    return;
  }

  paymentSelect.value = methodId;
  syncSelectedMethodCard();
});

for (const option of billingCycleOptions) {
  option.addEventListener("change", () => {
    applyBillingCycleUi();
  });
}
