import type { PaymentMethod, PublicStorefrontResponse, StorefrontFaq } from "../lib/schema";
import {
  getLocale,
  applyTranslations,
  applyLangToggle,
  bindLangToggle,
  landingMessages,
  landingStorefrontCopy,
  type LandingMsg,
  type WebLocale
} from "../lib/web-i18n";

const paymentMethodsEl = document.querySelector<HTMLElement>("#payment-methods");
const purchaseForm = document.querySelector<HTMLFormElement>("#purchase-form");
const paymentSelect = document.querySelector<HTMLSelectElement>("select[name='paymentMethodId']");
const purchaseStatus = document.querySelector<HTMLElement>("#purchase-status");
const heroNotes = document.querySelector<HTMLElement>("#hero-notes");
const faqList = document.querySelector<HTMLElement>("#faq-list");
const headline = document.querySelector<HTMLElement>("#headline");
const subheadline = document.querySelector<HTMLElement>("#subheadline");
const priceLabel = document.querySelector<HTMLElement>("#price-label");
const priceValue = document.querySelector<HTMLElement>("#price-value");
const includedUpdates = document.querySelector<HTMLElement>("#included-updates");
const brandName = document.querySelector<HTMLElement>("#brand-name");

let storefront: PublicStorefrontResponse | null = null;
let msg: LandingMsg = landingMessages.ko;
let currentLocale: WebLocale = "ko";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHeroNotes(notes: string[]): void {
  if (!heroNotes) {
    return;
  }

  heroNotes.innerHTML = notes.map((note) => `<span class="value-pill">${escapeHtml(note)}</span>`).join("");
}

function renderFaqs(faqs: StorefrontFaq[]): void {
  if (!faqList) {
    return;
  }

  faqList.innerHTML = faqs
    .map(
      (faq) => `
        <div>
          <dt>${escapeHtml(faq.question)}</dt>
          <dd>${escapeHtml(faq.answer)}</dd>
        </div>
      `
    )
    .join("");
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

function setStatus(message: string, isError = false): void {
  if (!purchaseStatus) {
    return;
  }

  purchaseStatus.textContent = message;
  purchaseStatus.classList.remove("hidden");
  purchaseStatus.classList.toggle("is-error", isError);
}

async function loadStorefront(): Promise<void> {
  const response = await fetch("/api/public/storefront");
  if (!response.ok) {
    throw new Error("Could not load storefront data.");
  }

  storefront = (await response.json()) as PublicStorefrontResponse;
  renderLocalizedStorefront(currentLocale);
}

function renderLocalizedStorefront(locale: WebLocale): void {
  const copy = landingStorefrontCopy[locale];
  if (brandName) {
    brandName.textContent = copy.productName;
  }
  if (headline) {
    headline.textContent = copy.headline;
  }
  if (subheadline) {
    subheadline.textContent = copy.subheadline;
  }
  if (priceLabel) {
    priceLabel.textContent = copy.priceLabel;
  }
  if (priceValue && storefront) {
    priceValue.textContent = storefront.settings.priceValue;
  }
  if (includedUpdates) {
    includedUpdates.textContent = copy.includedUpdates;
  }

  const siteHost = document.body.dataset.siteHost?.trim();
  document.title = [copy.productName, siteHost].filter(Boolean).join(" | ");

  renderHeroNotes(copy.heroNotes);
  renderFaqs(copy.faqs);
  if (storefront) {
    renderPaymentMethods(storefront.paymentMethods);
  }
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
  msg = landingMessages[locale];
  document.documentElement.lang = locale;
  applyTranslations(msg as unknown as Record<string, string>);
  applyLangToggle(locale);
  renderLocalizedStorefront(locale);
}

void (async () => {
  currentLocale = getLocale("ko");
  msg = landingMessages[currentLocale];
  applyTranslations(msg as unknown as Record<string, string>);
  applyLangToggle(currentLocale);
  document.documentElement.lang = currentLocale;
  renderLocalizedStorefront(currentLocale);

  bindLangToggle((next) => {
    applyLocale(next);
  });

  try {
    await loadStorefront();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not load purchase page.", true);
  }
})();

purchaseForm?.addEventListener("submit", (event) => {
  void submitPurchaseRequest(event);
});
