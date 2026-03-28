import type { PublicStorefrontResponse } from "@threads/web-schema";
import { parseSupportedLocale } from "@threads/shared/locale";
import {
  getLocale,
  applyTranslations,
  applyLangToggle,
  bindLangToggle,
  getLandingVariant,
  landingMessages,
  landingStorefrontCopy,
  type LandingMsg,
  type WebLocale
} from "../lib/web-i18n";

const headline = document.querySelector<HTMLElement>("#headline");
const subheadline = document.querySelector<HTMLElement>("#subheadline");
const priceValue = document.querySelector<HTMLElement>("#price-value");
const includedUpdates = document.querySelector<HTMLElement>("#included-updates");
const brandName = document.querySelector<HTMLElement>("#brand-name");
const topbarPrimaryCta = document.querySelector<HTMLAnchorElement>("#topbar-primary-cta");
const heroDesktopCta = document.querySelector<HTMLAnchorElement>("#hero-desktop-cta");
const heroMobileCta = document.querySelector<HTMLAnchorElement>("#hero-mobile-cta");
const priceCardCta = document.querySelector<HTMLAnchorElement>("#price-card-cta");
const productACta = document.querySelector<HTMLAnchorElement>("#product-a-cta");
const productBCta = document.querySelector<HTMLAnchorElement>("#product-b-cta");
const compareProductALabel = document.querySelector<HTMLElement>("#compare-product-a-label");
const compareProductBLabel = document.querySelector<HTMLElement>("#compare-product-b-label");
const siteHost = document.body.dataset.siteHost?.trim() ?? "";
const initialLocaleHint = parseSupportedLocale(document.body.dataset.initialLocale);
const landingVariant = getLandingVariant(siteHost);

let storefront: PublicStorefrontResponse | null = null;
let msg: LandingMsg = landingMessages.ko[landingVariant];
let currentLocale: WebLocale = getLocale(initialLocaleHint ?? "en");

function buildTranslationDict(copy: LandingMsg): Record<string, string> {
  return Object.fromEntries(
    Object.entries(copy).filter(([, value]) => typeof value === "string")
  ) as Record<string, string>;
}

function setHref(element: HTMLAnchorElement | null, href: string): void {
  if (!element) {
    return;
  }
  element.setAttribute("href", href);
}

function renderLocalizedStorefront(locale: WebLocale): void {
  const copy = landingStorefrontCopy[locale][landingVariant];

  if (brandName) {
    brandName.textContent = copy.productName;
  }
  if (headline) {
    headline.textContent = copy.headline;
  }
  if (subheadline) {
    subheadline.textContent = copy.subheadline;
  }
  if (priceValue && storefront) {
    priceValue.textContent = storefront.settings.priceValue;
  }
  if (includedUpdates) {
    includedUpdates.textContent = copy.includedUpdates;
  }

  setHref(topbarPrimaryCta, copy.links.topbarPrimaryHref);
  setHref(priceCardCta, copy.links.priceCardHref);
  setHref(productACta, copy.links.productAHref);
  setHref(productBCta, copy.links.productBHref);

  if (heroDesktopCta) {
    heroDesktopCta.textContent = msg.productATitle;
  }
  if (heroMobileCta) {
    heroMobileCta.textContent = msg.productBTitle;
  }
  if (compareProductALabel) {
    compareProductALabel.textContent = msg.productATitle;
  }
  if (compareProductBLabel) {
    compareProductBLabel.textContent = msg.productBTitle;
  }

  document.title = [copy.productName, siteHost].filter(Boolean).join(" | ");
}

async function loadStorefront(): Promise<void> {
  const response = await fetch("/api/public/storefront");
  if (!response.ok) {
    throw new Error("Could not load storefront data.");
  }

  storefront = (await response.json()) as PublicStorefrontResponse;
  renderLocalizedStorefront(currentLocale);
}

function applyLocale(locale: WebLocale): void {
  currentLocale = locale;
  msg = landingMessages[locale][landingVariant];
  document.documentElement.lang = locale;
  applyTranslations(buildTranslationDict(msg));
  applyLangToggle(locale);
  renderLocalizedStorefront(locale);
}

void (async () => {
  msg = landingMessages[currentLocale][landingVariant];
  applyLocale(currentLocale);

  bindLangToggle((next) => {
    applyLocale(next);
  });

  try {
    await loadStorefront();
  } catch {
    // Storefront data is optional for landing display.
  }
})();
