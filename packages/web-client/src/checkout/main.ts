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
    yearly: { title: "Yearly", price: "US$19.99", note: "Yearly" },
    monthly: { title: "Monthly", price: "US$2.99", note: "Monthly" }
  },
  "pt-BR": {
    yearly: { title: "Yearly", price: "US$19.99", note: "Yearly" },
    monthly: { title: "Monthly", price: "US$2.99", note: "Monthly" }
  },
  es: {
    yearly: { title: "Yearly", price: "US$19.99", note: "Yearly" },
    monthly: { title: "Monthly", price: "US$2.99", note: "Monthly" }
  },
  "zh-TW": {
    yearly: { title: "Yearly", price: "US$19.99", note: "Yearly" },
    monthly: { title: "Monthly", price: "US$2.99", note: "Monthly" }
  },
  vi: {
    yearly: { title: "Yearly", price: "US$19.99", note: "Yearly" },
    monthly: { title: "Monthly", price: "US$2.99", note: "Monthly" }
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
