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
const priceValue = document.querySelector<HTMLElement>("#price-value");
const includedUpdates = document.querySelector<HTMLElement>("#included-updates");
const brandName = document.querySelector<HTMLElement>("#brand-name");
const topbarPrimaryCta = document.querySelector<HTMLAnchorElement>("#topbar-primary-cta");
const heroDesktopCta = document.querySelector<HTMLAnchorElement>("#hero-desktop-cta");
const heroMobileCta = document.querySelector<HTMLAnchorElement>("#hero-mobile-cta");
const priceCardCta = document.querySelector<HTMLAnchorElement>("#price-card-cta");
const productACta = document.querySelector<HTMLAnchorElement>("#product-a-cta");
const productBCta = document.querySelector<HTMLAnchorElement>("#product-b-cta");
const footerExtensionLink = document.querySelector<HTMLAnchorElement>("#footer-extension-link");
const productATitle = document.querySelector<HTMLElement>("#product-a-title");
const productBTitle = document.querySelector<HTMLElement>("#product-b-title");
const compareProductALabel = document.querySelector<HTMLElement>("#compare-product-a-label");
const compareProductBLabel = document.querySelector<HTMLElement>("#compare-product-b-label");
const siteHost = document.body.dataset.siteHost?.trim() ?? "";
const initialLocaleHint = parseSupportedLocale(document.body.dataset.initialLocale);
const landingVariant = getLandingVariant(siteHost);

let msg: LandingMsg = landingMessages.ko[landingVariant];
let currentLocale: WebLocale = getLocale(initialLocaleHint ?? "en");
let currentBotHandle = DEFAULT_BOT_HANDLE;

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

function renderBrandAccent(value: string): string {
  return value
    .replace(/^SS\b/, `<span class="brand-accent">SS</span>`)
    .replace(/^ss\b/, `<span class="brand-accent">ss</span>`);
}

function renderLocalizedStorefront(locale: WebLocale): void {
  const copy = applyBotHandlePlaceholder(
    landingStorefrontCopy[locale][landingVariant],
    currentBotHandle,
    DEFAULT_BOT_HANDLE
  );

  if (brandName) {
    brandName.innerHTML = renderBrandAccent(copy.productName);
  }
  if (headline) {
    headline.innerHTML = copy.headline;
  }
  if (subheadline) {
    subheadline.textContent = copy.subheadline;
  }
  if (priceValue) {
    priceValue.textContent = "US$19.99";
  }
  if (includedUpdates) {
    includedUpdates.textContent = copy.includedUpdates;
  }

  setHref(topbarPrimaryCta, copy.links.topbarPrimaryHref);
  setHref(heroDesktopCta, copy.links.productAHref);
  setHref(heroMobileCta, copy.links.productBHref);
  setHref(priceCardCta, copy.links.priceCardHref);
  setHref(productACta, copy.links.productAHref);
  setHref(productBCta, copy.links.productBHref);
  setHref(footerExtensionLink, copy.links.productAHref);

  if (heroDesktopCta) {
    heroDesktopCta.textContent = msg.productACta;
  }
  if (heroMobileCta) {
    heroMobileCta.textContent = msg.productBCta;
  }
  if (footerExtensionLink) {
    footerExtensionLink.textContent = msg.productACta;
  }
  if (compareProductALabel) {
    compareProductALabel.innerHTML = renderBrandAccent(msg.productATitle);
  }
  if (compareProductBLabel) {
    compareProductBLabel.innerHTML = renderBrandAccent(msg.productBTitle);
  }

  document.title = [copy.productName, siteHost].filter(Boolean).join(" | ");
}

async function loadStorefront(): Promise<void> {
  const response = await fetch("/api/public/storefront");
  if (!response.ok) {
    throw new Error("Could not load storefront data.");
  }

  await response.json();
  renderLocalizedStorefront(currentLocale);
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
  renderLocalizedStorefront(locale);
}

void (async () => {
  msg = landingMessages[currentLocale][landingVariant];
  applyLocale(currentLocale);

  bindLangToggle((next) => {
    applyLocale(next);
  });

  await Promise.allSettled([
    loadBotConfig(),
    loadStorefront()
  ]);
})();
