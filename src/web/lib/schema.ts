export type OrderStatus = "pending" | "payment_confirmed" | "key_issued" | "cancelled";
export type LicenseStatus = "active" | "revoked";
export type DeliveryStatus = "not_sent" | "ready_to_send" | "sent";
export type LicenseActivationStatus = "active" | "released";

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
}

export interface StorefrontSettings {
  productName: string;
  headline: string;
  subheadline: string;
  priceLabel: string;
  priceValue: string;
  supportEmail: string;
  includedUpdates: string;
  heroNotes: string[];
  faqs: StorefrontFaq[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  summary: string;
  instructions: string;
  actionLabel: string;
  actionUrl: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  buyerName: string;
  buyerEmail: string;
  paymentMethodId: string;
  paymentProvider?: string | null;
  paymentProviderEventId?: string | null;
  paymentReference?: string | null;
  status: OrderStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  issuedLicenseId: string | null;
  deliveryStatus: DeliveryStatus;
}

export interface LicenseRecord {
  id: string;
  orderId: string;
  holderName: string;
  holderEmail: string;
  token: string;
  tokenPreview: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  status: LicenseStatus;
}

export interface LicenseActivationRecord {
  id: string;
  licenseId: string | null;
  tokenHash: string;
  tokenPreview: string;
  holder: string | null;
  deviceId: string;
  deviceLabel: string;
  activatedAt: string;
  lastValidatedAt: string;
  releasedAt: string | null;
  status: LicenseActivationStatus;
}

export interface AdminHistoryEvent {
  id: string;
  kind:
    | "payment_method_created"
    | "payment_method_updated"
    | "order_created"
    | "order_paid"
    | "license_issued"
    | "license_revoked"
    | "webhook_processed"
    | "webhook_ignored"
    | "webhook_rejected";
  message: string;
  createdAt: string;
  orderId: string | null;
  paymentMethodId: string | null;
  licenseId: string | null;
  webhookProvider?: string | null;
  webhookEventId?: string | null;
  webhookReason?: string | null;
}

export interface WebDatabase {
  settings: StorefrontSettings;
  paymentMethods: PaymentMethod[];
  orders: PurchaseOrder[];
  licenses: LicenseRecord[];
  activations: LicenseActivationRecord[];
  history: AdminHistoryEvent[];
}

export interface PublicStorefrontResponse {
  settings: StorefrontSettings;
  paymentMethods: PaymentMethod[];
}

export interface DashboardSummary {
  pendingOrders: number;
  paidOrders: number;
  issuedKeys: number;
  activePaymentMethods: number;
  webhookProcessed: number;
  webhookIgnored: number;
  webhookRejected: number;
  webhookDuplicates: number;
  deliveryReadyToSend: number;
  deliverySent: number;
}

export interface RevenueByMethod {
  methodId: string;
  methodName: string;
  orders: number;
  paid: number;
}

export interface RevenueByMonth {
  month: string;
  orders: number;
  issued: number;
}

export interface RevenueReport {
  totalOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  issuedKeys: number;
  revokedKeys: number;
  deliveryReadyToSend: number;
  deliverySent: number;
  estimatedRevenueUsd: number;
  priceUsd: number;
  byPaymentMethod: RevenueByMethod[];
  byMonth: RevenueByMonth[];
}

export interface AdminDashboardResponse extends PublicStorefrontResponse {
  orders: PurchaseOrder[];
  licenses: LicenseRecord[];
  history: AdminHistoryEvent[];
  summary: DashboardSummary;
  revenueReport: RevenueReport;
}

export interface EmailDeliveryDraft {
  to: string;
  subject: string;
  body: string;
}

export const DEFAULT_SETTINGS: StorefrontSettings = {
  productName: "Threads to Obsidian",
  headline: "Threads를 Obsidian에 저장.",
  subheadline: "Free는 저장. Pro는 규칙 + 내 LLM 키로 요약, 태그, frontmatter.",
  priceLabel: "Pro 업그레이드",
  priceValue: "$19",
  supportEmail: "hello@oxcorp.ninja",
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
};

export function buildDefaultDatabase(now = new Date().toISOString()): WebDatabase {
  return {
    settings: DEFAULT_SETTINGS,
    paymentMethods: [
      {
        id: "pm-stableorder",
        name: "Stableorder",
        summary: "KRW-friendly checkout with card and transfer options",
        instructions: "Open the Stableorder checkout page, pay using the order email, and return with the paid confirmation.",
        actionLabel: "Pay with Stableorder",
        actionUrl: "https://stableorder.com/",
        enabled: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-stripe",
        name: "Stripe Checkout",
        summary: "Global card checkout",
        instructions: "Open Stripe checkout, complete payment, and make sure the paid email matches your order email.",
        actionLabel: "Pay with Stripe",
        actionUrl: "https://checkout.stripe.com/",
        enabled: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-paypal",
        name: "PayPal",
        summary: "PayPal checkout for international buyers",
        instructions: "Use the PayPal checkout link, complete payment, and reply with the order email used in the request.",
        actionLabel: "Pay with PayPal",
        actionUrl: "https://www.paypal.com/checkout/home",
        enabled: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      }
    ],
    orders: [],
    licenses: [],
    activations: [],
    history: []
  };
}
