// ../shared/src/locale.ts
var SUPPORTED_LOCALES = ["ko", "en", "ja", "pt-BR", "es", "zh-TW", "vi"];
var LOCALE_LABELS = {
  ko: "\uD55C\uAD6D\uC5B4",
  en: "English",
  ja: "\u65E5\u672C\u8A9E",
  "pt-BR": "Portugu\xEAs (Brasil)",
  es: "Espa\xF1ol",
  "zh-TW": "\u7E41\u9AD4\u4E2D\u6587",
  vi: "Ti\u1EBFng Vi\u1EC7t"
};
var SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);
function parseSupportedLocale(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith("ko")) {
    return "ko";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  if (normalized.startsWith("ja")) {
    return "ja";
  }
  if (normalized === "pt" || normalized.startsWith("pt-")) {
    return "pt-BR";
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return "es";
  }
  if (normalized === "vi" || normalized.startsWith("vi-")) {
    return "vi";
  }
  if (normalized === "zh" || normalized.startsWith("zh-")) {
    if (normalized.includes("hans") || normalized === "zh-cn" || normalized === "zh-sg") {
      return null;
    }
    return "zh-TW";
  }
  return null;
}
function normalizeLocale(value, fallback = "en") {
  return parseSupportedLocale(value) ?? fallback;
}
function detectLocaleFromNavigator(language, fallback = "en") {
  return normalizeLocale(language, fallback);
}
function getLocaleLabel(locale) {
  return LOCALE_LABELS[locale];
}

// src/lib/web-i18n-locales.ts
var landingMessageLocales = {
  "ja": {
    "obsidian": {
      "topbarCta": "\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30AC\u30A4\u30C9",
      "siteLabel": "\u30AC\u30A4\u30C9 URL",
      "heroEyebrow": "\u62E1\u5F35\u6A5F\u80FD + \u30B9\u30AF\u30E9\u30C3\u30D7\u30D6\u30C3\u30AF",
      "heroGuideCta": "scrapbook \u3092\u958B\u304F",
      "heroPurchaseCta": "Pro \u3092\u8CFC\u5165\u3059\u308B",
      "heroRailLabel1": "Free",
      "heroRailText1": "\u6295\u7A3F\u3001\u753B\u50CF\u3001\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3\u3092\u4FDD\u5B58\u3059\u308B",
      "heroRailLabel2": "Pro",
      "heroRailText2": "\u30D5\u30A1\u30A4\u30EB/\u30D1\u30B9\u306E\u30EB\u30FC\u30EB + AI \u306E\u69CB\u6210",
      "priceNote": "\u4E00\u56DE\u9650\u308A\u306E",
      "priceSummary": "Free \u304B\u3089\u59CB\u3081\u307E\u3059\u3002\u5FC5\u8981\u306B\u5FDC\u3058\u3066 Pro \u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002",
      "pricePointFreeDesc": "\u30B3\u30A2\u306E\u4FDD\u5B58\u306F\u3059\u3050\u306B\u6A5F\u80FD\u3057\u307E\u3059\u3002",
      "pricePointProDesc": "\u30D5\u30A1\u30A4\u30EB \u30EB\u30FC\u30EB\u3068 AI \u7D44\u7E54\u306E\u30ED\u30C3\u30AF\u3092\u89E3\u9664\u3057\u307E\u3059\u3002",
      "primaryCta": "Pro \u3092\u8CFC\u5165\u3059\u308B",
      "secondaryCta": "scrapbook \u3092\u958B\u304F",
      "flowStep1": "\u307E\u305A Free \u3092\u8A66\u3057\u3066\u304F\u3060\u3055\u3044",
      "flowStep2": "\u5FC5\u8981\u306B\u5FDC\u3058\u3066 Pro \u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3057\u307E\u3059",
      "flowStep3": "\u30AD\u30FC\u306F\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u914D\u4FE1\u3055\u308C\u307E\u3059",
      "storyEyebrow": "\u30AF\u30A4\u30C3\u30AF\u30B9\u30BF\u30FC\u30C8",
      "storyH2": "\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u2192\u63A5\u7D9A\u2192\u4FDD\u5B58\u3002 3 \u3064\u306E\u30B9\u30C6\u30C3\u30D7\u3002",
      "storyP": "Free \u306E\u6E96\u5099\u304C\u6574\u3044\u307E\u3057\u305F\u3002",
      "guideInstallCta": "\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30AC\u30A4\u30C9\u3092\u958B\u304F",
      "guideUpgradeCta": "\u30EA\u30AF\u30A8\u30B9\u30C8Pro",
      "card1Title": "Chrome \u306B\u30ED\u30FC\u30C9\u3059\u308B",
      "card1Desc": "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u89E3\u51CD\u3057\u3001dist/extension \u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u89E3\u51CD\u3055\u308C\u305F Chrome extension \u3068\u3057\u3066\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
      "card2Title": "\u4FDD\u7BA1\u5EAB\u3092\u63A5\u7D9A\u3059\u308B",
      "card2Desc": "\u30AA\u30D7\u30B7\u30E7\u30F3\u3067 Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3059\u308B\u3068\u3001\u30DE\u30FC\u30AF\u30C0\u30A6\u30F3\u3068\u30E1\u30C7\u30A3\u30A2\u304C\u76F4\u63A5\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
      "card3Title": "Threads \u304B\u3089\u4FDD\u5B58",
      "card3Desc": "\u5358\u4E00\u306E\u6295\u7A3F\u30DA\u30FC\u30B8\u304B\u3089\u4FDD\u5B58\u3067\u304D\u307E\u3059\u3002 Pro \u306F\u3001\u30D5\u30A1\u30A4\u30EB \u30EB\u30FC\u30EB\u3068 AI \u7D44\u7E54\u3092\u305D\u306E\u4E0A\u306B\u8FFD\u52A0\u3057\u307E\u3059\u3002",
      "showcaseH2": "\u62E1\u5F35\u6A5F\u80FD\u3067\u5B9F\u969B\u306B\u8868\u793A\u3055\u308C\u308B\u3082\u306E",
      "showcaseCopy": "Free \u3068 Pro \u306E\u9055\u3044\u3092\u81EA\u5206\u306E\u76EE\u3067\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      "shotLargeCapTitle": "Free \u4FDD\u5B58\u30D5\u30ED\u30FC",
      "shotLargeCapDesc": "\u4E3B\u8981\u306A\u4FDD\u5B58\u30A8\u30AF\u30B9\u30DA\u30EA\u30A8\u30F3\u30B9\u306F\u9AD8\u901F\u304B\u3064\u30B7\u30F3\u30D7\u30EB\u3067\u3059\u3002",
      "shotSmallCapTitle": "Pro \u81EA\u52D5\u7DE8\u6210",
      "shotSmallCapDesc": "\u9078\u629E\u3057\u305F\u30EB\u30FC\u30EB\u3068\u3001LLM \u3092\u5229\u7528\u3057\u305F\u72EC\u81EA\u306E\u6982\u8981/\u30BF\u30B0 \u30D1\u30B9\u3092\u4F7F\u7528\u3057\u3066\u7DE8\u6210\u3055\u308C\u307E\u3059\u3002",
      "compFreeDesc": "\u3059\u3067\u306B\u3046\u307E\u304F\u6A5F\u80FD\u3057\u3066\u3044\u308B\u30B3\u30A2\u306E\u4FDD\u5B58\u30D5\u30ED\u30FC",
      "compProDesc": "\u30D5\u30A1\u30A4\u30EB/\u30D1\u30B9 \u30EB\u30FC\u30EB\u306B\u52A0\u3048\u3001AI \u30B5\u30DE\u30EA\u30FC\u3001\u30BF\u30B0\u3001\u304A\u3088\u3073\u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC\u3092\u8FFD\u52A0\u3059\u308B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9",
      "step1Title": "\u307E\u305A Free \u3092\u8A66\u3057\u3066\u304F\u3060\u3055\u3044",
      "step1Desc": "\u6295\u7A3F\u3001\u753B\u50CF\u3001\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3\u306F\u3059\u3050\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
      "step2Title": "\u5FC5\u8981\u306B\u5FDC\u3058\u3066\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3059\u308B",
      "step2Desc": "Pro \u306F\u3001\u30D5\u30A1\u30A4\u30EB \u30EB\u30FC\u30EB\u3068 AI \u7D44\u7E54\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002",
      "step3Title": "\u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059",
      "step3Desc": "\u30A2\u30AF\u30C6\u30A3\u30D6\u5316\u3059\u308B\u306B\u306F\u3001\u30AA\u30D7\u30B7\u30E7\u30F3\u306B Pro \u30AD\u30FC\u3092\u5165\u529B\u3057\u307E\u3059\u3002",
      "commerceH2": "Pro \u3092\u8CFC\u5165\u3059\u308B",
      "commerceLead": "1\u56DE29\u30C9\u30EB\u3002\u30AD\u30FC\u306F\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u914D\u4FE1\u3055\u308C\u307E\u3059\u3002",
      "commerceNote": "\u6700\u521D\u306B\u6CE8\u6587\u304C\u78BA\u8A8D\u3055\u308C\u3001\u305D\u306E\u5F8C\u652F\u6255\u3044\u304C\u78BA\u8A8D\u3055\u308C\u307E\u3059\u3002",
      "commerceRefund": "7\u65E5\u9593\u306E\u8FD4\u91D1",
      "backToHome": "\u88FD\u54C1\u30DA\u30FC\u30B8\u306B\u623B\u308B",
      "formNameLabel": "\u540D\u524D",
      "formEmailLabel": "\u96FB\u5B50\u30E1\u30FC\u30EB",
      "formMethodLabel": "\u304A\u652F\u6255\u3044\u65B9\u6CD5",
      "formNoteLabel": "\u6CE8\u8A18",
      "formSubmitBtn": "\u8CFC\u5165\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u9001\u4FE1\u3059\u308B",
      "formRemark": "\u652F\u6255\u3044\u78BA\u8A8D\u5F8C\u306B\u3001Pro \u30AD\u30FC\u304C\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002",
      "faqH2": "\u8CFC\u5165\u524D\u306B\u3088\u304F\u3042\u308B\u8CEA\u554F",
      "phName": "\u30B8\u30E7\u30F3\u30FB\u30C9\u30A5",
      "phNote": "\u8ACB\u6C42\u66F8\u3001\u901A\u8CA8\u3001\u30C1\u30FC\u30E0\u30B7\u30FC\u30C8\u306E\u30EA\u30AF\u30A8\u30B9\u30C8\u306A\u3069\u3002",
      "phMethod": "\u652F\u6255\u3044\u65B9\u6CD5\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
      "methodBadge": "\u5229\u7528\u53EF\u80FD",
      "compareH2": "Free vs Pro",
      "compareLead": "",
      "compareColFeature": "\u7279\u5FB4",
      "compareRowSavePost": "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58\u3059\u308B",
      "compareRowImages": "\u753B\u50CF\u306E\u4FDD\u5B58",
      "compareRowReplies": "\u8457\u8005\u306E\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3",
      "compareRowRules": "\u30D5\u30A1\u30A4\u30EB\u540D/\u30D1\u30B9\u306E\u898F\u5247",
      "compareRowAi": "BYO LLM \u6982\u8981 / \u30BF\u30B0 / \u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC",
      "screenH2": "\u30D7\u30EC\u30D3\u30E5\u30FC",
      "screenUsageCaption": "\u4F7F\u7528\u4E2D\u306E\u30D5\u30ED\u30FC\u3092\u4FDD\u5B58\u3059\u308B",
      "screenProCaption": "Pro \u304C\u6709\u52B9\u306B\u306A\u3063\u3066\u3044\u308B\u30AA\u30D7\u30B7\u30E7\u30F3 \u30DA\u30FC\u30B8",
      "productsEyebrow": "2\u3064\u306E\u88FD\u54C1",
      "productsTitle": "2\u3064\u306E\u4FDD\u5B58\u65B9\u6CD5",
      "productsCopy": "",
      "productATag": "Chrome extension",
      "productATitle": "Threads to Obsidian",
      "productADesc": "\u8868\u793A\u3057\u3066\u3044\u308B\u6295\u7A3F\u3092 Obsidian \u307E\u305F\u306F Notion \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
      "productACta": "GitHub\u304B\u3089\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB",
      "productBTag": "\u30E1\u30F3\u30B7\u30E7\u30F3\u30DC\u30C3\u30C8",
      "productBTitle": "Mention Scrapbook",
      "productBDesc": "\u8FD4\u4FE1\u306E\u30E1\u30F3\u30B7\u30E7\u30F3\u3092\u4ECB\u3057\u3066\u53CE\u96C6\u3057\u3001Markdown \u3068\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3059\u3002",
      "productBCta": "scrapbook \u3092\u958B\u304F",
      "pricingEyebrow": "\u4FA1\u683C\u8A2D\u5B9A",
      "pricingTitle": "\u30B7\u30F3\u30D7\u30EB\u306A\u8ACB\u6C42\u3002",
      "pricingCopy": "",
      "bundleTag": "\u30EF\u30F3\u30BF\u30A4\u30E0",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "1\u56DE29\u30C9\u30EB\u3002\u62E1\u5F35\u6A5F\u80FD Pro + Scrapbook \u30B3\u30A2\u3002",
      "bundleCta": "Pro \u3092\u8CFC\u5165\u3059\u308B",
      "cloudTag": "Cloud \u30A2\u30C9\u30AA\u30F3",
      "cloudTitle": "\u30A6\u30A9\u30C3\u30C1\u30EA\u30B9\u30C8 + \u691C\u7D22 + Insights",
      "cloudDesc": "\u5225\u500B\u306E\u30A2\u30C9\u30AA\u30F3\u3068\u3057\u3066\u306E\u5E38\u6642\u540C\u671F\u6A5F\u80FD\u3002",
      "cloudCta": "scrapbook \u3092\u958B\u304F",
      "botEyebrow": "\u30E1\u30F3\u30B7\u30E7\u30F3\u30DC\u30C3\u30C8",
      "botTitle": "1 \u56DE\u306E\u8FD4\u4FE1\u3067 scrapbook \u306B\u4FDD\u5B58",
      "botCopy": "@\u3092\u4ED8\u3051\u3066\u8FD4\u4FE1\u3057\u3066\u4FDD\u5B58\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u5F8C\u3067 Markdown \u3068\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3059\u3002",
      "botStep1Title": "\u8FD4\u4FE1\u306B@parktaejun\u3092\u8FFD\u52A0",
      "botStep1Desc": "\u4FDD\u5B58\u3059\u308B Threads \u6295\u7A3F\u306B\u8FD4\u4FE1\u3057\u3001@parktaejun \u306E\u307F\u3092\u542B\u3081\u3066\u4FDD\u5B58\u30C8\u30EA\u30AC\u30FC\u3092\u4F5C\u6210\u3057\u307E\u3059\u3002",
      "botStep2Title": "ID \u306B\u3088\u3063\u3066\u305D\u308C\u3092 scrapbook \u306B\u30EB\u30FC\u30C6\u30A3\u30F3\u30B0\u3057\u307E\u3059",
      "botStep2Desc": "\u30B7\u30B9\u30C6\u30E0\u306F\u3001\u8FD4\u4FE1\u4F5C\u6210\u8005\u3092\u30B5\u30A4\u30F3\u30A4\u30F3\u6642\u306B\u30EA\u30F3\u30AF\u3055\u308C\u305F Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u7167\u5408\u3057\u3001\u30A2\u30A4\u30C6\u30E0\u3092\u305D\u306E\u30E6\u30FC\u30B6\u30FC\u306E\u30D7\u30E9\u30A4\u30D9\u30FC\u30C8 scrapbook \u306B\u306E\u307F\u4FDD\u5B58\u3057\u307E\u3059\u3002",
      "botStep3Title": "\u5F8C\u3067 Markdown \u3068\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3059",
      "botStep3Desc": "\u4FDD\u5B58\u3055\u308C\u305F\u30A2\u30A4\u30C6\u30E0\u306F Web \u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u306B\u8868\u793A\u3055\u308C\u305F\u307E\u307E\u3067\u3001Markdown \u3068\u3057\u3066\u3001\u307E\u305F\u306F Obsidian\u3001Notion\u3001\u307E\u305F\u306F\u30E1\u30E2 \u30A2\u30D7\u30EA\u306E\u30D7\u30EC\u30FC\u30F3 \u30C6\u30AD\u30B9\u30C8\u3068\u3057\u3066\u30B3\u30D4\u30FC\u3067\u304D\u307E\u3059\u3002",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "\u82F1\u8A9E",
      "orderSuccess1": "\u30EA\u30AF\u30A8\u30B9\u30C8\u306F {email} \u3067\u53D7\u4FE1\u3055\u308C\u307E\u3057\u305F\u3002",
      "orderNextStep": "\u6B21\u306E\u30B9\u30C6\u30C3\u30D7: {instructions}",
      "orderPayLink": "\u652F\u6255\u3044\u30EA\u30F3\u30AF: {url}",
      "orderFinal": "\u652F\u6255\u3044\u78BA\u8A8D\u5F8C\u306B\u3001Threads Saver Pro \u30AD\u30FC\u304C\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002",
      "footerPurchaseLink": ""
    },
    "bot": {
      "topbarCta": "scrapbook \u3092\u958B\u304F",
      "siteLabel": "\u30AC\u30A4\u30C9 URL",
      "heroEyebrow": "Mention Scrapbook SaaS",
      "heroGuideCta": "scrapbook \u3092\u958B\u304F",
      "heroPurchaseCta": "\u62E1\u5F35\u6A5F\u80FD Pro \u3092\u8CFC\u5165\u3059\u308B",
      "heroRailLabel1": "Free",
      "heroRailText1": "\u6295\u7A3F\u3001\u753B\u50CF\u3001\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3\u3092\u4FDD\u5B58\u3059\u308B",
      "heroRailLabel2": "Pro",
      "heroRailText2": "\u30D5\u30A1\u30A4\u30EB/\u30D1\u30B9\u306E\u30EB\u30FC\u30EB + AI \u306E\u69CB\u6210",
      "priceNote": "\u4E00\u56DE\u9650\u308A\u306E",
      "priceSummary": "Free \u304B\u3089\u59CB\u3081\u307E\u3059\u3002\u5FC5\u8981\u306B\u5FDC\u3058\u3066 Pro \u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002",
      "pricePointFreeDesc": "\u30B3\u30A2\u306E\u4FDD\u5B58\u306F\u3059\u3050\u306B\u6A5F\u80FD\u3057\u307E\u3059\u3002",
      "pricePointProDesc": "\u30D5\u30A1\u30A4\u30EB \u30EB\u30FC\u30EB\u3068 AI \u7D44\u7E54\u306E\u30ED\u30C3\u30AF\u3092\u89E3\u9664\u3057\u307E\u3059\u3002",
      "primaryCta": "\u62E1\u5F35\u6A5F\u80FD Pro \u3092\u8CFC\u5165\u3059\u308B",
      "secondaryCta": "scrapbook \u3092\u958B\u304F",
      "flowStep1": "\u307E\u305A Free \u3092\u8A66\u3057\u3066\u304F\u3060\u3055\u3044",
      "flowStep2": "\u5FC5\u8981\u306B\u5FDC\u3058\u3066 Pro \u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3057\u307E\u3059",
      "flowStep3": "\u30AD\u30FC\u306F\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u914D\u4FE1\u3055\u308C\u307E\u3059",
      "storyEyebrow": "Chrome \u62E1\u5F35\u5B50",
      "storyH2": "Threads to Obsidian \u3082\u3053\u3053\u3067\u5165\u624B\u3067\u304D\u307E\u3059\u3002",
      "storyP": "\u30DC\u30C3\u30C8\u306F\u30E1\u30F3\u30B7\u30E7\u30F3\u30D9\u30FC\u30B9\u306E scrapbook \u4FDD\u5B58\u3092\u51E6\u7406\u3057\u307E\u3059\u304C\u3001\u62E1\u5F35\u6A5F\u80FD\u306F\u30A2\u30AF\u30C6\u30A3\u30D6\u306B\u8868\u793A\u3057\u3066\u3044\u308B\u6295\u7A3F\u3092 Obsidian \u306B\u76F4\u63A5\u9001\u4FE1\u3057\u307E\u3059\u3002",
      "guideInstallCta": "\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30AC\u30A4\u30C9\u3092\u958B\u304F",
      "guideUpgradeCta": "\u30EA\u30AF\u30A8\u30B9\u30C8Pro",
      "card1Title": "Chrome \u306B\u30ED\u30FC\u30C9\u3059\u308B",
      "card1Desc": "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u89E3\u51CD\u3057\u3001dist/extension \u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u89E3\u51CD\u3055\u308C\u305F Chrome extension \u3068\u3057\u3066\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
      "card2Title": "\u4FDD\u7BA1\u5EAB\u3092\u63A5\u7D9A\u3059\u308B",
      "card2Desc": "\u30AA\u30D7\u30B7\u30E7\u30F3\u3067 Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3059\u308B\u3068\u3001\u30DE\u30FC\u30AF\u30C0\u30A6\u30F3\u3068\u30E1\u30C7\u30A3\u30A2\u304C\u76F4\u63A5\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
      "card3Title": "Threads \u304B\u3089\u76F4\u63A5\u4FDD\u5B58",
      "card3Desc": "\u30D6\u30E9\u30A6\u30B6\u3067\u8868\u793A\u3057\u3066\u3044\u308B\u6295\u7A3F\u3092\u3059\u3050\u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002\u30E1\u30F3\u30B7\u30E7\u30F3 \u30DC\u30C3\u30C8\u3068\u306F\u5225\u306B\u4F7F\u7528\u3059\u308B\u3053\u3068\u3082\u3001\u30E1\u30F3\u30B7\u30E7\u30F3 \u30DC\u30C3\u30C8\u3068\u4F75\u7528\u3057\u3066\u4F7F\u7528\u3059\u308B\u3053\u3068\u3082\u3067\u304D\u307E\u3059\u3002",
      "showcaseH2": "\u62E1\u5F35\u6A5F\u80FD\u3067\u5B9F\u969B\u306B\u8868\u793A\u3055\u308C\u308B\u3082\u306E",
      "showcaseCopy": "Free \u3068 Pro \u306E\u9055\u3044\u3092\u81EA\u5206\u306E\u76EE\u3067\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      "shotLargeCapTitle": "Free \u4FDD\u5B58\u30D5\u30ED\u30FC",
      "shotLargeCapDesc": "\u4E3B\u8981\u306A\u4FDD\u5B58\u30A8\u30AF\u30B9\u30DA\u30EA\u30A8\u30F3\u30B9\u306F\u9AD8\u901F\u304B\u3064\u30B7\u30F3\u30D7\u30EB\u3067\u3059\u3002",
      "shotSmallCapTitle": "Pro \u81EA\u52D5\u7DE8\u6210",
      "shotSmallCapDesc": "\u9078\u629E\u3057\u305F\u30EB\u30FC\u30EB\u3068\u3001LLM \u3092\u5229\u7528\u3057\u305F\u72EC\u81EA\u306E\u6982\u8981/\u30BF\u30B0 \u30D1\u30B9\u3092\u4F7F\u7528\u3057\u3066\u7DE8\u6210\u3055\u308C\u307E\u3059\u3002",
      "compFreeDesc": "\u3059\u3067\u306B\u3046\u307E\u304F\u6A5F\u80FD\u3057\u3066\u3044\u308B\u30B3\u30A2\u306E\u4FDD\u5B58\u30D5\u30ED\u30FC",
      "compProDesc": "\u30D5\u30A1\u30A4\u30EB/\u30D1\u30B9 \u30EB\u30FC\u30EB\u306B\u52A0\u3048\u3001AI \u30B5\u30DE\u30EA\u30FC\u3001\u30BF\u30B0\u3001\u304A\u3088\u3073\u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC\u3092\u8FFD\u52A0\u3059\u308B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9",
      "step1Title": "\u307E\u305A Free \u3092\u8A66\u3057\u3066\u304F\u3060\u3055\u3044",
      "step1Desc": "\u6295\u7A3F\u3001\u753B\u50CF\u3001\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3\u306F\u3059\u3050\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
      "step2Title": "\u5FC5\u8981\u306B\u5FDC\u3058\u3066\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3059\u308B",
      "step2Desc": "Pro \u306F\u3001\u30D5\u30A1\u30A4\u30EB \u30EB\u30FC\u30EB\u3068 AI \u7D44\u7E54\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002",
      "step3Title": "\u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059",
      "step3Desc": "\u30A2\u30AF\u30C6\u30A3\u30D6\u5316\u3059\u308B\u306B\u306F\u3001\u30AA\u30D7\u30B7\u30E7\u30F3\u306B Pro \u30AD\u30FC\u3092\u5165\u529B\u3057\u307E\u3059\u3002",
      "commerceH2": "Threads to Obsidian Pro \u3092\u8CFC\u5165\u3059\u308B",
      "commerceLead": "\u4EE5\u4E0B\u306E\u30D5\u30A9\u30FC\u30E0\u306F\u3001Chrome extension Pro \u306E\u8CFC\u5165\u7528\u3067\u3059\u3002 scrapbook \u30DC\u30C3\u30C8\u306B\u3064\u3044\u3066\u306F\u3001\u4E0A\u306E\u30BB\u30AF\u30B7\u30E7\u30F3\u3067\u8AAC\u660E\u3057\u3066\u3044\u307E\u3059\u3002",
      "commerceNote": "\u6700\u521D\u306B\u6CE8\u6587\u304C\u78BA\u8A8D\u3055\u308C\u3001\u305D\u306E\u5F8C\u652F\u6255\u3044\u304C\u78BA\u8A8D\u3055\u308C\u307E\u3059\u3002",
      "commerceRefund": "7\u65E5\u9593\u306E\u8FD4\u91D1",
      "backToHome": "\u88FD\u54C1\u30DA\u30FC\u30B8\u306B\u623B\u308B",
      "formNameLabel": "\u540D\u524D",
      "formEmailLabel": "\u96FB\u5B50\u30E1\u30FC\u30EB",
      "formMethodLabel": "\u304A\u652F\u6255\u3044\u65B9\u6CD5",
      "formNoteLabel": "\u6CE8\u8A18",
      "formSubmitBtn": "\u8CFC\u5165\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u9001\u4FE1\u3059\u308B",
      "formRemark": "\u652F\u6255\u3044\u78BA\u8A8D\u5F8C\u306B\u3001Pro \u30AD\u30FC\u304C\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002",
      "faqH2": "\u30DC\u30C3\u30C8/\u62E1\u5F35\u6A5F\u80FD\u306B\u95A2\u3059\u308B\u3088\u304F\u3042\u308B\u8CEA\u554F",
      "phName": "\u30B8\u30E7\u30F3\u30FB\u30C9\u30A5",
      "phNote": "\u8ACB\u6C42\u66F8\u3001\u901A\u8CA8\u3001\u30C1\u30FC\u30E0\u30B7\u30FC\u30C8\u306E\u30EA\u30AF\u30A8\u30B9\u30C8\u306A\u3069\u3002",
      "phMethod": "\u652F\u6255\u3044\u65B9\u6CD5\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
      "methodBadge": "\u5229\u7528\u53EF\u80FD",
      "compareH2": "Chrome \u62E1\u5F35\u6A5F\u80FD Free \u3068 Pro",
      "compareLead": "",
      "compareColFeature": "\u7279\u5FB4",
      "compareRowSavePost": "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58\u3059\u308B",
      "compareRowImages": "\u753B\u50CF\u306E\u4FDD\u5B58",
      "compareRowReplies": "\u8457\u8005\u306E\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3",
      "compareRowRules": "\u30D5\u30A1\u30A4\u30EB\u540D/\u30D1\u30B9\u306E\u898F\u5247",
      "compareRowAi": "BYO LLM \u6982\u8981 / \u30BF\u30B0 / \u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC",
      "screenH2": "Chrome extension \u30D7\u30EC\u30D3\u30E5\u30FC",
      "screenUsageCaption": "\u4F7F\u7528\u4E2D\u306E\u30D5\u30ED\u30FC\u3092\u4FDD\u5B58\u3059\u308B",
      "screenProCaption": "Pro \u304C\u6709\u52B9\u306B\u306A\u3063\u3066\u3044\u308B\u30AA\u30D7\u30B7\u30E7\u30F3 \u30DA\u30FC\u30B8",
      "productsEyebrow": "2\u3064\u306E\u88FD\u54C1",
      "productsTitle": "Threads \u304B\u3089\u4FDD\u5B58\u3059\u308B 2 \u3064\u306E\u65B9\u6CD5",
      "productsCopy": "\u3053\u306E\u30DA\u30FC\u30B8\u3067\u306F\u3001\u516C\u958B\u8FD4\u4FE1 scrapbook \u30DC\u30C3\u30C8\u3068\u3001\u73FE\u5728\u8868\u793A\u3057\u3066\u3044\u308B\u6295\u7A3F\u3092\u4FDD\u5B58\u3059\u308B Chrome extension \u306E\u4E21\u65B9\u3092\u7D39\u4ECB\u3057\u307E\u3059\u3002",
      "productATag": "\u30E1\u30F3\u30B7\u30E7\u30F3\u30DC\u30C3\u30C8",
      "productATitle": "Threads Mention Scrapbook",
      "productADesc": "\u8FD4\u4FE1\u306B @parktaejun \u3092\u8FFD\u52A0\u3059\u308B\u3068\u3001\u30A2\u30A4\u30C6\u30E0\u304C\u30D7\u30E9\u30A4\u30D9\u30FC\u30C8 scrapbook \u306B\u914D\u7F6E\u3055\u308C\u3001\u5F8C\u3067 Markdown \u3068\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3067\u304D\u308B\u3088\u3046\u306B\u306A\u308A\u307E\u3059\u3002",
      "productACta": "scrapbook \u3092\u958B\u304F",
      "productBTag": "Chrome extension",
      "productBTitle": "Threads to Obsidian",
      "productBDesc": "\u8868\u793A\u3057\u3066\u3044\u308B Threads \u6295\u7A3F\u3092 Obsidian \u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002 Pro \u3067\u306F\u3001\u30EB\u30FC\u30EB\u30D9\u30FC\u30B9\u306E\u7DE8\u6210\u3068 AI \u5F8C\u51E6\u7406\u304C\u6709\u52B9\u306B\u306A\u308A\u307E\u3059\u3002",
      "productBCta": "\u62E1\u5F35\u30AC\u30A4\u30C9\u3092\u53C2\u7167",
      "pricingEyebrow": "\u4FA1\u683C\u8A2D\u5B9A",
      "pricingTitle": "\u30B7\u30F3\u30D7\u30EB\u306A\u8ACB\u6C42\u3002",
      "pricingCopy": "",
      "bundleTag": "\u30EF\u30F3\u30BF\u30A4\u30E0",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "1\u56DE29\u30C9\u30EB\u3002\u62E1\u5F35\u6A5F\u80FD Pro + Scrapbook \u30B3\u30A2\u3002",
      "bundleCta": "Pro \u3092\u8CFC\u5165\u3059\u308B",
      "cloudTag": "Cloud \u30A2\u30C9\u30AA\u30F3",
      "cloudTitle": "\u30A6\u30A9\u30C3\u30C1\u30EA\u30B9\u30C8 + \u691C\u7D22 + Insights",
      "cloudDesc": "\u5225\u500B\u306E\u30A2\u30C9\u30AA\u30F3\u3068\u3057\u3066\u306E\u5E38\u6642\u540C\u671F\u6A5F\u80FD\u3002",
      "cloudCta": "scrapbook \u3092\u958B\u304F",
      "botEyebrow": "\u4ED5\u7D44\u307F",
      "botTitle": "\u30D1\u30D6\u30EA\u30C3\u30AF\u5FDC\u7B54\u3092\u30C8\u30EA\u30AC\u30FC\u3068\u3057\u3066\u4F7F\u7528\u3057\u3001scrapbook \u3092\u975E\u516C\u958B\u306B\u4FDD\u3061\u307E\u3059\u3002",
      "botCopy": "\u30E6\u30FC\u30B6\u30FC\u306F\u3001Threads OAuth \u3092\u4ECB\u3057\u3066 Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u63A5\u7D9A\u3057\u3001\u30D1\u30D6\u30EA\u30C3\u30AF\u8FD4\u4FE1\u30E1\u30F3\u30B7\u30E7\u30F3\u3092\u4FDD\u5B58\u30C8\u30EA\u30AC\u30FC\u3068\u3057\u3066\u4F7F\u7528\u3057\u307E\u3059\u3002\u4FDD\u5B58\u3055\u308C\u305F\u30C7\u30FC\u30BF\u306F scrapbook \u30A2\u30AB\u30A6\u30F3\u30C8\u3054\u3068\u306B\u5206\u96E2\u3055\u308C\u305F\u307E\u307E\u306B\u306A\u308A\u307E\u3059\u3002",
      "botStep1Title": "Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3057\u307E\u3059",
      "botStep1Desc": "scrapbook \u30DA\u30FC\u30B8\u3092\u958B\u304D\u3001Threads \u306B\u9032\u307F\u3001\u4FDD\u5B58\u3055\u308C\u305F\u30E1\u30F3\u30B7\u30E7\u30F3\u3092\u53D7\u4FE1\u3059\u308B\u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u63A5\u7D9A\u3057\u307E\u3059\u3002",
      "botStep2Title": "@parktaejun \u306E\u8FD4\u4FE1\u3092\u4ED8\u3051\u3066\u4FDD\u5B58\u3059\u308B",
      "botStep2Desc": "\u8FD4\u4FE1\u3067 @parktaejun \u304C\u30E1\u30F3\u30B7\u30E7\u30F3\u3055\u308C\u308B\u3068\u3001\u30E1\u30F3\u30B7\u30E7\u30F3 \u30A4\u30F3\u30B8\u30A7\u30B9\u30BF\u30FC\u306F\u8FD4\u4FE1\u4F5C\u6210\u8005\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u4E00\u81F4\u3057\u3001\u51AA\u7B49\u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
      "botStep3Title": "Web\u4E0A\u3067\u30EC\u30D3\u30E5\u30FC\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8",
      "botStep3Desc": "\u76EE\u6A19\u306F\u300160 \u79D2\u4EE5\u5185\u306B\u4FDD\u5B58\u3092\u53CD\u6620\u3057\u3001\u30E6\u30FC\u30B6\u30FC\u304C Markdown \u3068\u3057\u3066\u3001\u307E\u305F\u306F Obsidian\u3001Notion\u3001\u307E\u305F\u306F\u30E1\u30E2 \u30A2\u30D7\u30EA\u306E\u30D7\u30EC\u30FC\u30F3 \u30C6\u30AD\u30B9\u30C8\u3068\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3067\u304D\u308B\u3088\u3046\u306B\u3059\u308B\u3053\u3068\u3067\u3059\u3002",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "\u82F1\u8A9E",
      "orderSuccess1": "\u30EA\u30AF\u30A8\u30B9\u30C8\u306F {email} \u3067\u53D7\u4FE1\u3055\u308C\u307E\u3057\u305F\u3002",
      "orderNextStep": "\u6B21\u306E\u30B9\u30C6\u30C3\u30D7: {instructions}",
      "orderPayLink": "\u652F\u6255\u3044\u30EA\u30F3\u30AF: {url}",
      "orderFinal": "\u652F\u6255\u3044\u78BA\u8A8D\u5F8C\u306B\u3001Threads Saver Pro \u30AD\u30FC\u304C\u96FB\u5B50\u30E1\u30FC\u30EB\u3067\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002",
      "footerPurchaseLink": ""
    }
  },
  "pt-BR": {
    "obsidian": {
      "topbarCta": "Guia de instala\xE7\xE3o",
      "siteLabel": "Guia URL",
      "heroEyebrow": "Extens\xE3o + \xE1lbum de recortes",
      "heroGuideCta": "Abra scrapbook",
      "heroPurchaseCta": "Compre Pro",
      "heroRailLabel1": "Free",
      "heroRailText1": "Salve postagens, imagens e cadeias de resposta",
      "heroRailLabel2": "Pro",
      "heroRailText2": "Regras de arquivo/caminho + organiza\xE7\xE3o de IA",
      "priceNote": "uma vez",
      "priceSummary": "Comece com Free. Adicione Pro quando precisar.",
      "pricePointFreeDesc": "A economia principal funciona imediatamente.",
      "pricePointProDesc": "Desbloqueie regras de arquivo e organiza\xE7\xE3o de IA.",
      "primaryCta": "Comprar Pro",
      "secondaryCta": "Abra scrapbook",
      "flowStep1": "Experimente Free primeiro",
      "flowStep2": "Atualize para Pro quando necess\xE1rio",
      "flowStep3": "Chave entregue por email",
      "storyEyebrow": "In\xEDcio r\xE1pido",
      "storyH2": "Instalar \u2192 Conectar \u2192 Salvar. Tr\xEAs etapas.",
      "storyP": "Free est\xE1 pronto para funcionar.",
      "guideInstallCta": "Abra o guia de instala\xE7\xE3o",
      "guideUpgradeCta": "Solicitar Pro",
      "card1Title": "Carregar em Chrome",
      "card1Desc": "Descompacte o projeto e carregue a pasta dist/extension como um Chrome extension descompactado.",
      "card2Title": "Conecte seu cofre",
      "card2Desc": "Conecte sua pasta Obsidian nas op\xE7\xF5es para que o markdown e a m\xEDdia sejam salvos diretamente.",
      "card3Title": "Salvar de Threads",
      "card3Desc": "Salve em qualquer p\xE1gina de postagem. Pro adiciona regras de arquivo e organiza\xE7\xE3o de IA.",
      "showcaseH2": "O que voc\xEA realmente v\xEA na extens\xE3o",
      "showcaseCopy": "Veja voc\xEA mesmo a diferen\xE7a entre Free e Pro.",
      "shotLargeCapTitle": "Free salvar fluxo",
      "shotLargeCapDesc": "A experi\xEAncia b\xE1sica de economia permanece r\xE1pida e simples.",
      "shotSmallCapTitle": "Auto-organiza\xE7\xE3o Pro",
      "shotSmallCapDesc": "Organizado usando as regras escolhidas e seu pr\xF3prio resumo/tag pass com tecnologia LLM.",
      "compFreeDesc": "O fluxo principal de salvamento que j\xE1 funciona bem",
      "compProDesc": "Uma atualiza\xE7\xE3o que adiciona regras de arquivo/caminho, al\xE9m de resumos, tags e frontmatter de IA",
      "step1Title": "Experimente Free primeiro",
      "step1Desc": "Postagens, imagens e cadeias de resposta s\xE3o salvas imediatamente.",
      "step2Title": "Atualize quando necess\xE1rio",
      "step2Desc": "Pro adiciona regras de arquivo e organiza\xE7\xE3o de IA.",
      "step3Title": "Cole sua chave",
      "step3Desc": "Digite a tecla Pro nas op\xE7\xF5es para ativar.",
      "commerceH2": "Comprar Pro",
      "commerceLead": "$ 29 uma vez. Chave entregue por email.",
      "commerceNote": "Os pedidos s\xE3o revisados primeiro e depois o pagamento \xE9 confirmado.",
      "commerceRefund": "Reembolso de 7 dias",
      "backToHome": "Voltar para a p\xE1gina do produto",
      "formNameLabel": "Nome",
      "formEmailLabel": "E-mail",
      "formMethodLabel": "M\xE9todo de pagamento",
      "formNoteLabel": "Nota",
      "formSubmitBtn": "Enviar solicita\xE7\xE3o de compra",
      "formRemark": "Sua chave Pro \xE9 enviada por e-mail ap\xF3s a confirma\xE7\xE3o do pagamento.",
      "faqH2": "D\xFAvidas mais comuns antes de comprar",
      "phName": "John Doe",
      "phNote": "Fatura, moeda, solicita\xE7\xF5es de assento de equipe, etc.",
      "phMethod": "Selecione um m\xE9todo de pagamento",
      "methodBadge": "Dispon\xEDvel",
      "compareH2": "Free vs Pro",
      "compareLead": "",
      "compareColFeature": "Recurso",
      "compareRowSavePost": "Salvar postagem atual",
      "compareRowImages": "Salvar imagens",
      "compareRowReplies": "Cadeia de respostas do autor",
      "compareRowRules": "Regras de nome/caminho do arquivo",
      "compareRowAi": "Resumo / tags / frontmatter BYO LLM",
      "screenH2": "Visualiza\xE7\xE3o",
      "screenUsageCaption": "Salvar fluxo em uso",
      "screenProCaption": "P\xE1gina de op\xE7\xF5es com Pro ativado",
      "productsEyebrow": "Dois produtos",
      "productsTitle": "Duas maneiras de economizar",
      "productsCopy": "",
      "productATag": "Chrome extension",
      "productATitle": "Threads to Obsidian",
      "productADesc": "Salve a postagem que voc\xEA est\xE1 visualizando em Obsidian ou Notion.",
      "productACta": "Instalar a partir de GitHub",
      "productBTag": "Mencionar bot",
      "productBTitle": "Mention Scrapbook",
      "productBDesc": "Colete por meio de men\xE7\xF5es de resposta, exporte como Markdown.",
      "productBCta": "Abra scrapbook",
      "pricingEyebrow": "Pre\xE7os",
      "pricingTitle": "Faturamento simples.",
      "pricingCopy": "",
      "bundleTag": "\xDAnico",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "$ 29 uma vez. Extens\xE3o Pro + N\xFAcleo Scrapbook.",
      "bundleCta": "Comprar Pro",
      "cloudTag": "Complemento Cloud",
      "cloudTitle": "Listas de observa\xE7\xE3o + pesquisas + Insights",
      "cloudDesc": "Recursos de sincroniza\xE7\xE3o sempre ativos como um complemento separado.",
      "cloudCta": "Abra scrapbook",
      "botEyebrow": "Mencionar bot",
      "botTitle": "Salve em scrapbook com uma resposta",
      "botCopy": "Responda com @ para salvar. Exporte como Markdown posteriormente.",
      "botStep1Title": "Adicione @parktaejun em uma resposta",
      "botStep1Desc": "Responda \xE0 postagem Threads que deseja salvar e inclua apenas @parktaejun para criar o gatilho de salvamento.",
      "botStep2Title": "Encaminhe-o para seu scrapbook por identidade",
      "botStep2Desc": "O sistema compara o autor da resposta com a conta Threads vinculada no login e armazena o item apenas no scrapbook privado desse usu\xE1rio.",
      "botStep3Title": "Exportar como Markdown posteriormente",
      "botStep3Desc": "Os itens salvos permanecem vis\xEDveis no painel da web e podem ser copiados como Markdown ou texto simples para Obsidian, Notion ou aplicativos de notas.",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "Ingl\xEAs",
      "orderSuccess1": "Sua solicita\xE7\xE3o foi recebida em {email}.",
      "orderNextStep": "Pr\xF3xima etapa: {instructions}",
      "orderPayLink": "Link de pagamento: {url}",
      "orderFinal": "Sua chave Threads Saver Pro ser\xE1 enviada por e-mail ap\xF3s a confirma\xE7\xE3o do pagamento.",
      "footerPurchaseLink": ""
    },
    "bot": {
      "topbarCta": "Abra scrapbook",
      "siteLabel": "Guia URL",
      "heroEyebrow": "Mention Scrapbook SaaS",
      "heroGuideCta": "Abra scrapbook",
      "heroPurchaseCta": "Comprar extens\xE3o Pro",
      "heroRailLabel1": "Free",
      "heroRailText1": "Salve postagens, imagens e cadeias de resposta",
      "heroRailLabel2": "Pro",
      "heroRailText2": "Regras de arquivo/caminho + organiza\xE7\xE3o de IA",
      "priceNote": "uma vez",
      "priceSummary": "Comece com Free. Adicione Pro quando precisar.",
      "pricePointFreeDesc": "A economia principal funciona imediatamente.",
      "pricePointProDesc": "Desbloqueie regras de arquivo e organiza\xE7\xE3o de IA.",
      "primaryCta": "Comprar extens\xE3o Pro",
      "secondaryCta": "Abra scrapbook",
      "flowStep1": "Experimente Free primeiro",
      "flowStep2": "Atualize para Pro quando necess\xE1rio",
      "flowStep3": "Chave entregue por email",
      "storyEyebrow": "Extens\xE3o Chrome",
      "storyH2": "Threads to Obsidian tamb\xE9m est\xE1 dispon\xEDvel aqui.",
      "storyP": "O bot lida com salvamentos scrapbook baseados em men\xE7\xF5es, enquanto a extens\xE3o envia a postagem que voc\xEA est\xE1 visualizando ativamente diretamente para Obsidian.",
      "guideInstallCta": "Abra o guia de instala\xE7\xE3o",
      "guideUpgradeCta": "Solicitar Pro",
      "card1Title": "Carregar em Chrome",
      "card1Desc": "Descompacte o projeto e carregue a pasta dist/extension como um Chrome extension descompactado.",
      "card2Title": "Conecte seu cofre",
      "card2Desc": "Conecte sua pasta Obsidian nas op\xE7\xF5es para que o markdown e a m\xEDdia sejam salvos diretamente.",
      "card3Title": "Salve diretamente de Threads",
      "card3Desc": "Salve a postagem que voc\xEA est\xE1 visualizando no navegador imediatamente. Voc\xEA pode us\xE1-lo separadamente do bot de men\xE7\xE3o ou junto com ele.",
      "showcaseH2": "O que voc\xEA realmente v\xEA na extens\xE3o",
      "showcaseCopy": "Veja voc\xEA mesmo a diferen\xE7a entre Free e Pro.",
      "shotLargeCapTitle": "Free salvar fluxo",
      "shotLargeCapDesc": "A experi\xEAncia b\xE1sica de economia permanece r\xE1pida e simples.",
      "shotSmallCapTitle": "Auto-organiza\xE7\xE3o Pro",
      "shotSmallCapDesc": "Organizado usando as regras escolhidas e seu pr\xF3prio resumo/tag pass com tecnologia LLM.",
      "compFreeDesc": "O fluxo principal de salvamento que j\xE1 funciona bem",
      "compProDesc": "Uma atualiza\xE7\xE3o que adiciona regras de arquivo/caminho, al\xE9m de resumos, tags e frontmatter de IA",
      "step1Title": "Experimente Free primeiro",
      "step1Desc": "Postagens, imagens e cadeias de resposta s\xE3o salvas imediatamente.",
      "step2Title": "Atualize quando necess\xE1rio",
      "step2Desc": "Pro adiciona regras de arquivo e organiza\xE7\xE3o de IA.",
      "step3Title": "Cole sua chave",
      "step3Desc": "Digite a tecla Pro nas op\xE7\xF5es para ativar.",
      "commerceH2": "Compre Threads to Obsidian Pro",
      "commerceLead": "O formul\xE1rio abaixo \xE9 para compra do Chrome extension Pro. A men\xE7\xE3o do bot scrapbook \xE9 explicada nas se\xE7\xF5es acima.",
      "commerceNote": "Os pedidos s\xE3o revisados primeiro e depois o pagamento \xE9 confirmado.",
      "commerceRefund": "Reembolso de 7 dias",
      "backToHome": "Voltar para a p\xE1gina do produto",
      "formNameLabel": "Nome",
      "formEmailLabel": "E-mail",
      "formMethodLabel": "M\xE9todo de pagamento",
      "formNoteLabel": "Nota",
      "formSubmitBtn": "Enviar solicita\xE7\xE3o de compra",
      "formRemark": "Sua chave Pro \xE9 enviada por e-mail ap\xF3s a confirma\xE7\xE3o do pagamento.",
      "faqH2": "Perguntas frequentes sobre bot/extens\xE3o",
      "phName": "John Doe",
      "phNote": "Fatura, moeda, solicita\xE7\xF5es de assento de equipe, etc.",
      "phMethod": "Selecione um m\xE9todo de pagamento",
      "methodBadge": "Dispon\xEDvel",
      "compareH2": "Extens\xE3o Chrome Free vs Pro",
      "compareLead": "",
      "compareColFeature": "Recurso",
      "compareRowSavePost": "Salvar postagem atual",
      "compareRowImages": "Salvar imagens",
      "compareRowReplies": "Cadeia de respostas do autor",
      "compareRowRules": "Regras de nome/caminho do arquivo",
      "compareRowAi": "Resumo / tags / frontmatter BYO LLM",
      "screenH2": "Visualiza\xE7\xE3o do Chrome extension",
      "screenUsageCaption": "Salvar fluxo em uso",
      "screenProCaption": "P\xE1gina de op\xE7\xF5es com Pro ativado",
      "productsEyebrow": "Dois produtos",
      "productsTitle": "Duas maneiras de salvar do Threads",
      "productsCopy": "Esta p\xE1gina apresenta o bot scrapbook de resposta p\xFAblica e o Chrome extension que salva a postagem que voc\xEA est\xE1 visualizando agora.",
      "productATag": "Mencionar bot",
      "productATitle": "Threads Mention Scrapbook",
      "productADesc": "Adicione @parktaejun em uma resposta e o item chegar\xE1 ao seu scrapbook privado, pronto para ser exportado como Markdown posteriormente.",
      "productACta": "Abra scrapbook",
      "productBTag": "Chrome extension",
      "productBTitle": "Threads to Obsidian",
      "productBDesc": "Salve a postagem Threads que voc\xEA est\xE1 visualizando diretamente no Obsidian. A organiza\xE7\xE3o baseada em regras e o p\xF3s-processamento de IA s\xE3o ativados no Pro.",
      "productBCta": "Veja o guia de extens\xE3o",
      "pricingEyebrow": "Pre\xE7os",
      "pricingTitle": "Faturamento simples.",
      "pricingCopy": "",
      "bundleTag": "\xDAnico",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "$ 29 uma vez. Extens\xE3o Pro + N\xFAcleo Scrapbook.",
      "bundleCta": "Comprar Pro",
      "cloudTag": "Complemento Cloud",
      "cloudTitle": "Listas de observa\xE7\xE3o + pesquisas + Insights",
      "cloudDesc": "Recursos de sincroniza\xE7\xE3o sempre ativos como um complemento separado.",
      "cloudCta": "Abra scrapbook",
      "botEyebrow": "Como funciona",
      "botTitle": "Use uma resposta p\xFAblica como gatilho e mantenha scrapbook privado.",
      "botCopy": "Os usu\xE1rios conectam sua conta Threads por meio de Threads OAuth e, em seguida, usam uma men\xE7\xE3o de resposta p\xFAblica como gatilho para salvar. Os dados salvos permanecem separados por conta scrapbook.",
      "botStep1Title": "Conecte sua conta Threads",
      "botStep1Desc": "Abra a p\xE1gina scrapbook, continue com Threads e conecte a conta que dever\xE1 receber men\xE7\xF5es salvas.",
      "botStep2Title": "Economize com uma resposta @parktaejun",
      "botStep2Desc": "Depois que uma resposta menciona @parktaejun, o ingeridor de men\xE7\xF5es corresponde \xE0 conta do autor da resposta e a armazena de forma idempotente.",
      "botStep3Title": "Revise na web e exporte",
      "botStep3Desc": "O objetivo \xE9 refletir os salvamentos em 60 segundos e, em seguida, permitir que os usu\xE1rios exportem como Markdown ou texto simples para Obsidian, Notion ou aplicativos de notas.",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "Ingl\xEAs",
      "orderSuccess1": "Sua solicita\xE7\xE3o foi recebida em {email}.",
      "orderNextStep": "Pr\xF3xima etapa: {instructions}",
      "orderPayLink": "Link de pagamento: {url}",
      "orderFinal": "Sua chave Threads Saver Pro ser\xE1 enviada por e-mail ap\xF3s a confirma\xE7\xE3o do pagamento.",
      "footerPurchaseLink": ""
    }
  },
  "es": {
    "obsidian": {
      "topbarCta": "gu\xEDa de instalaci\xF3n",
      "siteLabel": "Gu\xEDa URL",
      "heroEyebrow": "Extensi\xF3n + \xC1lbum de recortes",
      "heroGuideCta": "Abrir scrapbook",
      "heroPurchaseCta": "Comprar Pro",
      "heroRailLabel1": "Free",
      "heroRailText1": "Guarde publicaciones, im\xE1genes y cadenas de respuestas",
      "heroRailLabel2": "Pro",
      "heroRailText2": "Reglas de archivo/ruta + organizaci\xF3n de IA",
      "priceNote": "una sola vez",
      "priceSummary": "Comience con Free. Agregue Pro cuando lo necesite.",
      "pricePointFreeDesc": "El ahorro de n\xFAcleo funciona de inmediato.",
      "pricePointProDesc": "Desbloquee reglas de archivos y organizaci\xF3n de IA.",
      "primaryCta": "Comprar Pro",
      "secondaryCta": "Abrir scrapbook",
      "flowStep1": "Pruebe Free primero",
      "flowStep2": "Actualice a Pro cuando sea necesario",
      "flowStep3": "Llave entregada por correo electr\xF3nico",
      "storyEyebrow": "Inicio r\xE1pido",
      "storyH2": "Instalar \u2192 Conectar \u2192 Guardar. Tres pasos.",
      "storyP": "Free est\xE1 listo para funcionar.",
      "guideInstallCta": "Abrir gu\xEDa de instalaci\xF3n",
      "guideUpgradeCta": "Solicitar Pro",
      "card1Title": "Cargar en Chrome",
      "card1Desc": "Descomprima el proyecto y cargue la carpeta dist/extension como un Chrome extension descomprimido.",
      "card2Title": "Conecte su b\xF3veda",
      "card2Desc": "Conecte su carpeta Obsidian en opciones para que Markdown y los medios se guarden directamente.",
      "card3Title": "Guardar desde Threads",
      "card3Desc": "Guarde desde cualquier p\xE1gina de publicaci\xF3n \xFAnica. Pro agrega reglas de archivos y organizaci\xF3n de IA en la parte superior.",
      "showcaseH2": "Lo que realmente ves en la extensi\xF3n.",
      "showcaseCopy": "Vea usted mismo la diferencia entre Free y Pro.",
      "shotLargeCapTitle": "Free guardar flujo",
      "shotLargeCapDesc": "La experiencia de ahorro principal sigue siendo r\xE1pida y sencilla.",
      "shotSmallCapTitle": "Pro autoorganizaci\xF3n",
      "shotSmallCapDesc": "Organizado utilizando las reglas elegidas y su propio resumen/pase de etiquetas impulsado por LLM.",
      "compFreeDesc": "El flujo de guardado principal que ya funciona bien",
      "compProDesc": "Una actualizaci\xF3n que agrega reglas de archivos/rutas adem\xE1s de res\xFAmenes de IA, etiquetas y texto preliminar",
      "step1Title": "Pruebe Free primero",
      "step1Desc": "Las publicaciones, im\xE1genes y cadenas de respuestas se guardan inmediatamente.",
      "step2Title": "Actualiza cuando sea necesario",
      "step2Desc": "Pro agrega reglas de archivos y organizaci\xF3n de IA.",
      "step3Title": "Pega tu clave",
      "step3Desc": "Ingrese la clave Pro en opciones para activar.",
      "commerceH2": "Comprar Pro",
      "commerceLead": "$29 por \xFAnica vez. Llave entregada por correo electr\xF3nico.",
      "commerceNote": "Primero se revisan los pedidos y luego se confirma el pago.",
      "commerceRefund": "reembolso de 7 d\xEDas",
      "backToHome": "Volver a la p\xE1gina del producto",
      "formNameLabel": "Nombre",
      "formEmailLabel": "Correo electr\xF3nico",
      "formMethodLabel": "M\xE9todo de pago",
      "formNoteLabel": "Nota",
      "formSubmitBtn": "Enviar solicitud de compra",
      "formRemark": "Su clave Pro se env\xEDa por correo electr\xF3nico despu\xE9s de la confirmaci\xF3n del pago.",
      "faqH2": "Preguntas m\xE1s comunes antes de comprar",
      "phName": "Juan P\xE9rez",
      "phNote": "Factura, moneda, solicitudes de puestos de equipo, etc.",
      "phMethod": "Seleccione un m\xE9todo de pago",
      "methodBadge": "Disponible",
      "compareH2": "Free y Pro",
      "compareLead": "",
      "compareColFeature": "Caracter\xEDstica",
      "compareRowSavePost": "Guardar publicaci\xF3n actual",
      "compareRowImages": "Guardar im\xE1genes",
      "compareRowReplies": "Cadena de respuesta del autor",
      "compareRowRules": "Nombre de archivo/reglas de ruta",
      "compareRowAi": "BYO LLM resumen / etiquetas / frontmatter",
      "screenH2": "Vista previa",
      "screenUsageCaption": "Guardar flujo en uso",
      "screenProCaption": "P\xE1gina de opciones con Pro habilitado",
      "productsEyebrow": "Dos productos",
      "productsTitle": "Dos formas de ahorrar",
      "productsCopy": "",
      "productATag": "Chrome extension",
      "productATitle": "Threads to Obsidian",
      "productADesc": "Guarde la publicaci\xF3n que est\xE1 viendo en Obsidian o Notion.",
      "productACta": "Instalar desde GitHub",
      "productBTag": "Mencionar robot",
      "productBTitle": "Mention Scrapbook",
      "productBDesc": "Recopile mediante menciones de respuesta, exporte como Markdown.",
      "productBCta": "Abrir scrapbook",
      "pricingEyebrow": "Precios",
      "pricingTitle": "Facturaci\xF3n sencilla.",
      "pricingCopy": "",
      "bundleTag": "una sola vez",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "$29 por \xFAnica vez. Extensi\xF3n Pro + N\xFAcleo de Scrapbook.",
      "bundleCta": "Comprar Pro",
      "cloudTag": "Complemento Cloud",
      "cloudTitle": "Listas de seguimiento + B\xFAsquedas + Insights",
      "cloudDesc": "Funciones de sincronizaci\xF3n siempre activas como complemento independiente.",
      "cloudCta": "Abrir scrapbook",
      "botEyebrow": "Mencionar robot",
      "botTitle": "Guardar en scrapbook con una respuesta",
      "botCopy": "Responde con @ para guardar. Exporte como Markdown m\xE1s tarde.",
      "botStep1Title": "A\xF1adir @parktaejun en una respuesta",
      "botStep1Desc": "Responda a la publicaci\xF3n Threads que desea guardar e incluya solo @parktaejun para crear el activador de guardado.",
      "botStep2Title": "Enr\xFAtelo a su scrapbook por identidad",
      "botStep2Desc": "El sistema compara el autor de la respuesta con la cuenta Threads vinculada al iniciar sesi\xF3n y almacena el elemento solo en el scrapbook privado de ese usuario.",
      "botStep3Title": "Exportar como Markdown m\xE1s tarde",
      "botStep3Desc": "Los elementos guardados permanecen visibles en el panel web y se pueden copiar como Markdown o texto sin formato para Obsidian, Notion o aplicaciones de notas.",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "ingles",
      "orderSuccess1": "Su solicitud ha sido recibida en {email}.",
      "orderNextStep": "Siguiente paso: {instructions}",
      "orderPayLink": "Enlace de pago: {url}",
      "orderFinal": "Su clave Threads Saver Pro se enviar\xE1 por correo electr\xF3nico despu\xE9s de la confirmaci\xF3n del pago.",
      "footerPurchaseLink": ""
    },
    "bot": {
      "topbarCta": "Abrir scrapbook",
      "siteLabel": "Gu\xEDa URL",
      "heroEyebrow": "Mention Scrapbook SaaS",
      "heroGuideCta": "Abrir scrapbook",
      "heroPurchaseCta": "Comprar extensi\xF3n Pro",
      "heroRailLabel1": "Free",
      "heroRailText1": "Guarde publicaciones, im\xE1genes y cadenas de respuestas",
      "heroRailLabel2": "Pro",
      "heroRailText2": "Reglas de archivo/ruta + organizaci\xF3n de IA",
      "priceNote": "una sola vez",
      "priceSummary": "Comience con Free. Agregue Pro cuando lo necesite.",
      "pricePointFreeDesc": "El ahorro de n\xFAcleo funciona de inmediato.",
      "pricePointProDesc": "Desbloquee reglas de archivos y organizaci\xF3n de IA.",
      "primaryCta": "Comprar extensi\xF3n Pro",
      "secondaryCta": "Abrir scrapbook",
      "flowStep1": "Pruebe Free primero",
      "flowStep2": "Actualice a Pro cuando sea necesario",
      "flowStep3": "Llave entregada por correo electr\xF3nico",
      "storyEyebrow": "Extensi\xF3n Chrome",
      "storyH2": "Threads to Obsidian tambi\xE9n est\xE1 disponible aqu\xED.",
      "storyP": "El bot maneja los guardados de scrapbook basados en menciones, mientras que la extensi\xF3n env\xEDa la publicaci\xF3n que est\xE1s viendo activamente directamente a Obsidian.",
      "guideInstallCta": "Abrir gu\xEDa de instalaci\xF3n",
      "guideUpgradeCta": "Solicitar Pro",
      "card1Title": "Cargar en Chrome",
      "card1Desc": "Descomprima el proyecto y cargue la carpeta dist/extension como un Chrome extension descomprimido.",
      "card2Title": "Conecte su b\xF3veda",
      "card2Desc": "Conecte su carpeta Obsidian en opciones para que Markdown y los medios se guarden directamente.",
      "card3Title": "Guardar directamente desde Threads",
      "card3Desc": "Guarde la publicaci\xF3n que est\xE1 viendo en el navegador inmediatamente. Puedes usarlo por separado del bot de menci\xF3n o junto a \xE9l.",
      "showcaseH2": "Lo que realmente ves en la extensi\xF3n.",
      "showcaseCopy": "Vea usted mismo la diferencia entre Free y Pro.",
      "shotLargeCapTitle": "Free guardar flujo",
      "shotLargeCapDesc": "La experiencia de ahorro principal sigue siendo r\xE1pida y sencilla.",
      "shotSmallCapTitle": "Pro autoorganizaci\xF3n",
      "shotSmallCapDesc": "Organizado utilizando las reglas elegidas y su propio resumen/pase de etiquetas impulsado por LLM.",
      "compFreeDesc": "El flujo de guardado principal que ya funciona bien",
      "compProDesc": "Una actualizaci\xF3n que agrega reglas de archivos/rutas adem\xE1s de res\xFAmenes de IA, etiquetas y texto preliminar",
      "step1Title": "Pruebe Free primero",
      "step1Desc": "Las publicaciones, im\xE1genes y cadenas de respuestas se guardan inmediatamente.",
      "step2Title": "Actualiza cuando sea necesario",
      "step2Desc": "Pro agrega reglas de archivos y organizaci\xF3n de IA.",
      "step3Title": "Pega tu clave",
      "step3Desc": "Ingrese la clave Pro en opciones para activar.",
      "commerceH2": "Comprar Threads to Obsidian Pro",
      "commerceLead": "El siguiente formulario es para la compra de Chrome extension Pro. La menci\xF3n del bot scrapbook se explica en las secciones anteriores.",
      "commerceNote": "Primero se revisan los pedidos y luego se confirma el pago.",
      "commerceRefund": "reembolso de 7 d\xEDas",
      "backToHome": "Volver a la p\xE1gina del producto",
      "formNameLabel": "Nombre",
      "formEmailLabel": "Correo electr\xF3nico",
      "formMethodLabel": "M\xE9todo de pago",
      "formNoteLabel": "Nota",
      "formSubmitBtn": "Enviar solicitud de compra",
      "formRemark": "Su clave Pro se env\xEDa por correo electr\xF3nico despu\xE9s de la confirmaci\xF3n del pago.",
      "faqH2": "Preguntas frecuentes sobre bots/extensiones",
      "phName": "Juan P\xE9rez",
      "phNote": "Factura, moneda, solicitudes de puestos de equipo, etc.",
      "phMethod": "Seleccione un m\xE9todo de pago",
      "methodBadge": "Disponible",
      "compareH2": "Extensi\xF3n Chrome Free frente a Pro",
      "compareLead": "",
      "compareColFeature": "Caracter\xEDstica",
      "compareRowSavePost": "Guardar publicaci\xF3n actual",
      "compareRowImages": "Guardar im\xE1genes",
      "compareRowReplies": "Cadena de respuesta del autor",
      "compareRowRules": "Nombre de archivo/reglas de ruta",
      "compareRowAi": "BYO LLM resumen / etiquetas / frontmatter",
      "screenH2": "Vista previa de Chrome extension",
      "screenUsageCaption": "Guardar flujo en uso",
      "screenProCaption": "P\xE1gina de opciones con Pro habilitado",
      "productsEyebrow": "Dos productos",
      "productsTitle": "Dos formas de guardar desde Threads",
      "productsCopy": "Esta p\xE1gina presenta tanto el bot de respuesta p\xFAblica scrapbook como el Chrome extension que guarda la publicaci\xF3n que est\xE1s viendo en este momento.",
      "productATag": "Mencionar robot",
      "productATitle": "Threads Mention Scrapbook",
      "productADesc": "Agregue @parktaejun en una respuesta y el elemento llegar\xE1 a su scrapbook privado, listo para exportar como Markdown m\xE1s adelante.",
      "productACta": "Abrir scrapbook",
      "productBTag": "Chrome extension",
      "productBTitle": "Threads to Obsidian",
      "productBDesc": "Guarde la publicaci\xF3n de Threads que est\xE1 viendo directamente en Obsidian. La organizaci\xF3n basada en reglas y el posprocesamiento de IA se activan en Pro.",
      "productBCta": "Ver gu\xEDa de extensiones",
      "pricingEyebrow": "Precios",
      "pricingTitle": "Facturaci\xF3n sencilla.",
      "pricingCopy": "",
      "bundleTag": "una sola vez",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "$29 por \xFAnica vez. Extensi\xF3n Pro + N\xFAcleo de Scrapbook.",
      "bundleCta": "Comprar Pro",
      "cloudTag": "Complemento Cloud",
      "cloudTitle": "Listas de seguimiento + B\xFAsquedas + Insights",
      "cloudDesc": "Funciones de sincronizaci\xF3n siempre activas como complemento independiente.",
      "cloudCta": "Abrir scrapbook",
      "botEyebrow": "como funciona",
      "botTitle": "Utilice una respuesta p\xFAblica como desencadenante y mantenga el scrapbook privado.",
      "botCopy": "Los usuarios conectan su cuenta Threads a trav\xE9s de Threads OAuth y luego usan una menci\xF3n de respuesta p\xFAblica como activador de guardado. Los datos guardados permanecen separados por cuenta scrapbook.",
      "botStep1Title": "Conecte su cuenta Threads",
      "botStep1Desc": "Abra la p\xE1gina scrapbook, contin\xFAe con Threads y conecte la cuenta que deber\xEDa recibir menciones guardadas.",
      "botStep2Title": "Guardar con una respuesta @parktaejun",
      "botStep2Desc": "Una vez que una respuesta menciona @parktaejun, el recopilador de menciones coincide con la cuenta del autor de la respuesta y la almacena de forma idempotente.",
      "botStep3Title": "Revisar en la web y exportar",
      "botStep3Desc": "El objetivo es reflejar los guardados en 60 segundos y luego permitir que los usuarios exporten como Markdown o texto sin formato para Obsidian, Notion o aplicaciones de notas.",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "ingles",
      "orderSuccess1": "Su solicitud ha sido recibida en {email}.",
      "orderNextStep": "Siguiente paso: {instructions}",
      "orderPayLink": "Enlace de pago: {url}",
      "orderFinal": "Su clave Threads Saver Pro se enviar\xE1 por correo electr\xF3nico despu\xE9s de la confirmaci\xF3n del pago.",
      "footerPurchaseLink": ""
    }
  },
  "zh-TW": {
    "obsidian": {
      "topbarCta": "\u5B89\u88DD\u6307\u5357",
      "siteLabel": "\u6307\u5357 URL",
      "heroEyebrow": "\u64F4\u5145 + \u526A\u8CBC\u7C3F",
      "heroGuideCta": "\u6253\u958B scrapbook",
      "heroPurchaseCta": "\u8CFC\u8CB7Pro",
      "heroRailLabel1": "ZZ\u8853\u8A9E0ZZ",
      "heroRailText1": "\u5132\u5B58\u8CBC\u6587\u3001\u5716\u7247\u548C\u56DE\u8986\u93C8",
      "heroRailLabel2": "ZZ\u8853\u8A9E0ZZ",
      "heroRailText2": "\u6A94\u6848/\u8DEF\u5F91\u898F\u5247+AI\u7D44\u7E54",
      "priceNote": "\u4E00\u6B21\u6027\u7684",
      "priceSummary": "\u4EE5 Free \u958B\u982D\u3002\u9700\u8981\u6642\u6DFB\u52A0 Pro\u3002",
      "pricePointFreeDesc": "\u6838\u5FC3\u7BC0\u7701\u7ACB\u5373\u751F\u6548\u3002",
      "pricePointProDesc": "\u89E3\u9396\u6587\u4EF6\u898F\u5247\u548C\u4EBA\u5DE5\u667A\u6167\u7D44\u7E54\u3002",
      "primaryCta": "\u8CFC\u8CB7Pro",
      "secondaryCta": "\u6253\u958B scrapbook",
      "flowStep1": "\u9996\u5148\u5617\u8A66 Free",
      "flowStep2": "\u9700\u8981\u6642\u5347\u7D1A\u5230 Pro",
      "flowStep3": "\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u5BC6\u9470",
      "storyEyebrow": "\u5FEB\u901F\u5165\u9580",
      "storyH2": "\u5B89\u88DD\u2192\u9023\u63A5\u2192\u5132\u5B58\u3002\u4E09\u6B65\u3002",
      "storyP": "Free \u5DF2\u6E96\u5099\u5C31\u7DD2\u3002",
      "guideInstallCta": "\u958B\u555F\u5B89\u88DD\u6307\u5357",
      "guideUpgradeCta": "\u8ACB\u6C42 Pro",
      "card1Title": "\u52A0\u8F09\u5230 Chrome",
      "card1Desc": "\u89E3\u58D3\u7E2E\u9805\u76EE\u4E26\u8F09\u5165 dist/extension \u8CC7\u6599\u593E\u4F5C\u70BA\u89E3\u58D3\u7E2E\u5F8C\u7684 Chrome extension\u3002",
      "card2Title": "\u9023\u63A5\u60A8\u7684\u4FDD\u7BA1\u5EAB",
      "card2Desc": "\u5728\u9078\u9805\u4E2D\u9023\u63A5\u60A8\u7684 Obsidian \u8CC7\u6599\u593E\uFF0C\u4EE5\u4FBF\u76F4\u63A5\u5132\u5B58 Markdown \u548C\u5A92\u9AD4\u3002",
      "card3Title": "\u5F9E Threads \u5132\u5B58",
      "card3Desc": "\u5F9E\u4EFB\u4F55\u55AE\u4E00\u8CBC\u6587\u9801\u9762\u5132\u5B58\u3002 Pro \u5728\u9802\u90E8\u65B0\u589E\u4E86\u6A94\u6848\u898F\u5247\u548C AI \u7D44\u7E54\u3002",
      "showcaseH2": "\u60A8\u5728\u64F4\u5145\u529F\u80FD\u4E2D\u5BE6\u969B\u770B\u5230\u7684\u5167\u5BB9",
      "showcaseCopy": "\u89AA\u81EA\u770B\u770B Free \u548C Pro \u4E4B\u9593\u7684\u5DEE\u7570\u3002",
      "shotLargeCapTitle": "Free \u4FDD\u5B58\u6D41\u91CF",
      "shotLargeCapDesc": "\u6838\u5FC3\u7BC0\u7701\u9AD4\u9A57\u4ECD\u7136\u5FEB\u901F\u800C\u7C21\u55AE\u3002",
      "shotSmallCapTitle": "Pro \u81EA\u52D5\u7D44\u7E54",
      "shotSmallCapDesc": "\u4F7F\u7528\u60A8\u9078\u64C7\u7684\u898F\u5247\u548C\u60A8\u81EA\u5DF1\u7684 LLM \u652F\u63F4\u7684\u6458\u8981/\u6A19\u7C64\u901A\u884C\u8B49\u9032\u884C\u7D44\u7E54\u3002",
      "compFreeDesc": "\u6838\u5FC3\u4FDD\u5B58\u6D41\u7A0B\u5DF2\u7D93\u904B\u4F5C\u826F\u597D",
      "compProDesc": "\u65B0\u589E\u6A94\u6848/\u8DEF\u5F91\u898F\u5247\u4EE5\u53CA AI \u6458\u8981\u3001\u6A19\u7C64\u548C frontmatter \u7684\u5347\u7D1A",
      "step1Title": "\u9996\u5148\u5617\u8A66 Free",
      "step1Desc": "\u8CBC\u6587\u3001\u5716\u50CF\u548C\u56DE\u8986\u93C8\u7ACB\u5373\u4FDD\u5B58\u3002",
      "step2Title": "\u9700\u8981\u6642\u5347\u7D1A",
      "step2Desc": "Pro \u65B0\u589E\u6A94\u6848\u898F\u5247\u548C AI \u7D44\u7E54\u3002",
      "step3Title": "\u8CBC\u4E0A\u60A8\u7684\u91D1\u9470",
      "step3Desc": "\u5728\u9078\u9805\u4E2D\u8F38\u5165 Pro \u9375\u4EE5\u555F\u52D5\u3002",
      "commerceH2": "\u8CFC\u8CB7Pro",
      "commerceLead": "\u4E00\u6B21\u6027 29 \u7F8E\u5143\u3002\u5BC6\u9470\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u3002",
      "commerceNote": "\u9996\u5148\u5BE9\u6838\u8A02\u55AE\uFF0C\u7136\u5F8C\u78BA\u8A8D\u4ED8\u6B3E\u3002",
      "commerceRefund": "7\u5929\u9000\u6B3E",
      "backToHome": "\u8FD4\u56DE\u7522\u54C1\u9801\u9762",
      "formNameLabel": "\u540D\u7A31",
      "formEmailLabel": "\u96FB\u5B50\u90F5\u4EF6",
      "formMethodLabel": "\u4ED8\u6B3E\u65B9\u5F0F",
      "formNoteLabel": "\u6CE8\u610F\u4E8B\u9805",
      "formSubmitBtn": "\u767C\u9001\u8CFC\u8CB7\u8ACB\u6C42",
      "formRemark": "\u4ED8\u6B3E\u78BA\u8A8D\u5F8C\uFF0C\u60A8\u7684 Pro \u91D1\u9470\u5C07\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u3002",
      "faqH2": "\u8CFC\u8CB7\u524D\u6700\u5E38\u898B\u7684\u554F\u984C",
      "phName": "\u7D04\u7FF0\xB7\u591A\u4F0A",
      "phNote": "\u767C\u7968\u3001\u8CA8\u5E63\u3001\u5718\u968A\u5EA7\u4F4D\u8ACB\u6C42\u7B49\u3002",
      "phMethod": "\u9078\u64C7\u4ED8\u6B3E\u65B9\u5F0F",
      "methodBadge": "\u53EF\u7528",
      "compareH2": "Free \u8207 Pro",
      "compareLead": "",
      "compareColFeature": "\u7279\u9EDE",
      "compareRowSavePost": "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
      "compareRowImages": "\u5132\u5B58\u5F71\u50CF",
      "compareRowReplies": "\u4F5C\u8005\u56DE\u8986\u93C8",
      "compareRowRules": "\u6A94\u6848\u540D\u7A31/\u8DEF\u5F91\u898F\u5247",
      "compareRowAi": "BYO LLM \u6458\u8981/\u6A19\u7C64/frontmatter",
      "screenH2": "\u9810\u89BD",
      "screenUsageCaption": "\u4F7F\u7528\u4E2D\u7BC0\u7701\u6D41\u91CF",
      "screenProCaption": "\u555F\u7528 Pro \u7684\u9078\u9805\u9801\u9762",
      "productsEyebrow": "\u5169\u7A2E\u7522\u54C1",
      "productsTitle": "\u5169\u7A2E\u4FDD\u5B58\u65B9\u5F0F",
      "productsCopy": "",
      "productATag": "ZZ\u8853\u8A9E0ZZ",
      "productATitle": "ZZ\u8853\u8A9E0ZZ",
      "productADesc": "\u5C07\u60A8\u6B63\u5728\u67E5\u770B\u7684\u8CBC\u6587\u5132\u5B58\u5230 Obsidian \u6216 Notion\u3002",
      "productACta": "\u5F9E GitHub \u5B89\u88DD",
      "productBTag": "\u63D0\u53CA\u6A5F\u5668\u4EBA",
      "productBTitle": "ZZ\u8853\u8A9E0ZZ",
      "productBDesc": "\u900F\u904E\u56DE\u61C9\u63D0\u53CA\u6536\u96C6\uFF0C\u532F\u51FA\u70BA Markdown\u3002",
      "productBCta": "\u6253\u958B scrapbook",
      "pricingEyebrow": "\u5B9A\u50F9",
      "pricingTitle": "\u7C21\u55AE\u7684\u8A08\u8CBB\u3002",
      "pricingCopy": "",
      "bundleTag": "\u4E00\u6B21\u6027",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "\u4E00\u6B21\u6027 29 \u7F8E\u5143\u3002\u64F4\u5145 Pro + \u526A\u8CBC\u7C3F\u6838\u5FC3\u3002",
      "bundleCta": "\u8CFC\u8CB7Pro",
      "cloudTag": "Cloud \u9644\u52A0\u5143\u4EF6",
      "cloudTitle": "\u95DC\u6CE8\u5217\u8868 + \u641C\u5C0B + Insights",
      "cloudDesc": "\u59CB\u7D42\u5728\u7DDA\u7684\u540C\u6B65\u529F\u80FD\u4F5C\u70BA\u55AE\u7368\u7684\u9644\u52A0\u7D44\u4EF6\u3002",
      "cloudCta": "\u6253\u958B scrapbook",
      "botEyebrow": "\u63D0\u53CA\u6A5F\u5668\u4EBA",
      "botTitle": "\u5132\u5B58\u81F3 scrapbook \u4E26\u9644\u4E0A\u4E00\u689D\u56DE\u590D",
      "botCopy": "\u56DE\u8986@\u5373\u53EF\u4FDD\u5B58\u3002\u7A0D\u5F8C\u532F\u51FA\u70BA Markdown\u3002",
      "botStep1Title": "\u5728\u56DE\u8986\u4E2D\u52A0\u5165 @parktaejun",
      "botStep1Desc": "\u56DE\u8986\u60A8\u8981\u5132\u5B58\u7684 Threads \u5E16\u5B50\uFF0C\u4E26\u50C5\u5305\u542B @parktaejun \u4EE5\u5EFA\u7ACB\u5132\u5B58\u89F8\u767C\u5668\u3002",
      "botStep2Title": "\u900F\u904E\u8EAB\u5206\u5C07\u5176\u8DEF\u7531\u5230\u60A8\u7684 scrapbook",
      "botStep2Desc": "\u7CFB\u7D71\u5C07\u56DE\u8986\u4F5C\u8005\u8207\u767B\u5165\u6642\u9023\u7D50\u7684 Threads \u5E33\u6236\u9032\u884C\u5339\u914D\uFF0C\u4E26\u5C07\u8A72\u9805\u76EE\u50C5\u5132\u5B58\u5728\u8A72\u7528\u6236\u7684\u79C1\u4EBA scrapbook \u4E2D\u3002",
      "botStep3Title": "\u7A0D\u5F8C\u532F\u51FA\u70BA Markdown",
      "botStep3Desc": "\u5132\u5B58\u7684\u9805\u76EE\u5728 Web \u5100\u8868\u677F\u4E0A\u4FDD\u6301\u53EF\u898B\uFF0C\u4E26\u4E14\u53EF\u4EE5\u8907\u88FD\u70BA Markdown \u6216 Obsidian\u3001Notion \u6216\u7B46\u8A18\u61C9\u7528\u7A0B\u5F0F\u7684\u7D14\u6587\u5B57\u3002",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "\u82F1\u8A9E",
      "orderSuccess1": "{email} \u5DF2\u6536\u5230\u60A8\u7684\u8981\u6C42\u3002",
      "orderNextStep": "\u4E0B\u4E00\u6B65\uFF1A{instructions}",
      "orderPayLink": "\u4ED8\u6B3E\u9023\u7D50\uFF1A{url}",
      "orderFinal": "\u60A8\u7684 Threads Saver Pro \u91D1\u9470\u5C07\u5728\u4ED8\u6B3E\u78BA\u8A8D\u5F8C\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u3002",
      "footerPurchaseLink": ""
    },
    "bot": {
      "topbarCta": "\u6253\u958B scrapbook",
      "siteLabel": "\u6307\u5357 URL",
      "heroEyebrow": "Mention Scrapbook SaaS",
      "heroGuideCta": "\u6253\u958B scrapbook",
      "heroPurchaseCta": "\u8CFC\u8CB7\u64F4\u5145 Pro",
      "heroRailLabel1": "ZZ\u8853\u8A9E0ZZ",
      "heroRailText1": "\u5132\u5B58\u8CBC\u6587\u3001\u5716\u7247\u548C\u56DE\u8986\u93C8",
      "heroRailLabel2": "ZZ\u8853\u8A9E0ZZ",
      "heroRailText2": "\u6A94\u6848/\u8DEF\u5F91\u898F\u5247+AI\u7D44\u7E54",
      "priceNote": "\u4E00\u6B21\u6027\u7684",
      "priceSummary": "\u4EE5 Free \u958B\u982D\u3002\u9700\u8981\u6642\u6DFB\u52A0 Pro\u3002",
      "pricePointFreeDesc": "\u6838\u5FC3\u7BC0\u7701\u7ACB\u5373\u751F\u6548\u3002",
      "pricePointProDesc": "\u89E3\u9396\u6587\u4EF6\u898F\u5247\u548C\u4EBA\u5DE5\u667A\u6167\u7D44\u7E54\u3002",
      "primaryCta": "\u8CFC\u8CB7\u64F4\u5145 Pro",
      "secondaryCta": "\u6253\u958B scrapbook",
      "flowStep1": "\u9996\u5148\u5617\u8A66 Free",
      "flowStep2": "\u9700\u8981\u6642\u5347\u7D1A\u5230 Pro",
      "flowStep3": "\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u5BC6\u9470",
      "storyEyebrow": "Chrome \u64F4\u5C55",
      "storyH2": "Threads to Obsidian \u4E5F\u53EF\u4EE5\u5728\u9019\u88E1\u627E\u5230\u3002",
      "storyP": "\u8A72\u6A5F\u5668\u4EBA\u8655\u7406\u57FA\u65BC\u63D0\u53CA\u7684 scrapbook \u4FDD\u5B58\uFF0C\u800C\u64F4\u5145\u529F\u80FD\u5C07\u60A8\u6B63\u5728\u4E3B\u52D5\u67E5\u770B\u7684\u8CBC\u6587\u76F4\u63A5\u767C\u9001\u5230 Obsidian\u3002",
      "guideInstallCta": "\u958B\u555F\u5B89\u88DD\u6307\u5357",
      "guideUpgradeCta": "\u8ACB\u6C42 Pro",
      "card1Title": "\u52A0\u8F09\u5230 Chrome",
      "card1Desc": "\u89E3\u58D3\u7E2E\u9805\u76EE\u4E26\u8F09\u5165 dist/extension \u8CC7\u6599\u593E\u4F5C\u70BA\u89E3\u58D3\u7E2E\u5F8C\u7684 Chrome extension\u3002",
      "card2Title": "\u9023\u63A5\u60A8\u7684\u4FDD\u7BA1\u5EAB",
      "card2Desc": "\u5728\u9078\u9805\u4E2D\u9023\u63A5\u60A8\u7684 Obsidian \u8CC7\u6599\u593E\uFF0C\u4EE5\u4FBF\u76F4\u63A5\u5132\u5B58 Markdown \u548C\u5A92\u9AD4\u3002",
      "card3Title": "\u76F4\u63A5\u5F9E Threads \u5132\u5B58",
      "card3Desc": "\u7ACB\u5373\u5132\u5B58\u60A8\u6B63\u5728\u700F\u89BD\u5668\u4E2D\u67E5\u770B\u7684\u8CBC\u6587\u3002\u60A8\u53EF\u4EE5\u5C07\u5176\u8207\u63D0\u53CA\u6A5F\u5668\u4EBA\u5206\u958B\u4F7F\u7528\uFF0C\u4E5F\u53EF\u4EE5\u8207\u5B83\u4E00\u8D77\u4F7F\u7528\u3002",
      "showcaseH2": "\u60A8\u5728\u64F4\u5145\u529F\u80FD\u4E2D\u5BE6\u969B\u770B\u5230\u7684\u5167\u5BB9",
      "showcaseCopy": "\u89AA\u81EA\u770B\u770B Free \u548C Pro \u4E4B\u9593\u7684\u5DEE\u7570\u3002",
      "shotLargeCapTitle": "Free \u4FDD\u5B58\u6D41\u91CF",
      "shotLargeCapDesc": "\u6838\u5FC3\u7BC0\u7701\u9AD4\u9A57\u4ECD\u7136\u5FEB\u901F\u800C\u7C21\u55AE\u3002",
      "shotSmallCapTitle": "Pro \u81EA\u52D5\u7D44\u7E54",
      "shotSmallCapDesc": "\u4F7F\u7528\u60A8\u9078\u64C7\u7684\u898F\u5247\u548C\u60A8\u81EA\u5DF1\u7684 LLM \u652F\u63F4\u7684\u6458\u8981/\u6A19\u7C64\u901A\u884C\u8B49\u9032\u884C\u7D44\u7E54\u3002",
      "compFreeDesc": "\u6838\u5FC3\u4FDD\u5B58\u6D41\u7A0B\u5DF2\u7D93\u904B\u4F5C\u826F\u597D",
      "compProDesc": "\u65B0\u589E\u6A94\u6848/\u8DEF\u5F91\u898F\u5247\u4EE5\u53CA AI \u6458\u8981\u3001\u6A19\u7C64\u548C frontmatter \u7684\u5347\u7D1A",
      "step1Title": "\u9996\u5148\u5617\u8A66 Free",
      "step1Desc": "\u8CBC\u6587\u3001\u5716\u50CF\u548C\u56DE\u8986\u93C8\u7ACB\u5373\u4FDD\u5B58\u3002",
      "step2Title": "\u9700\u8981\u6642\u5347\u7D1A",
      "step2Desc": "Pro \u65B0\u589E\u6A94\u6848\u898F\u5247\u548C AI \u7D44\u7E54\u3002",
      "step3Title": "\u8CBC\u4E0A\u60A8\u7684\u91D1\u9470",
      "step3Desc": "\u5728\u9078\u9805\u4E2D\u8F38\u5165 Pro \u9375\u4EE5\u555F\u52D5\u3002",
      "commerceH2": "\u8CFC\u8CB7 Threads to Obsidian Pro",
      "commerceLead": "\u4E0B\u9762\u7684\u8868\u683C\u9069\u7528\u65BC Chrome extension Pro \u8CFC\u8CB7\u3002\u4E0A\u9762\u7684\u7AE0\u7BC0\u4E2D\u5C0D\u63D0\u5230\u7684 scrapbook \u6A5F\u5668\u4EBA\u9032\u884C\u4E86\u89E3\u91CB\u3002",
      "commerceNote": "\u9996\u5148\u5BE9\u6838\u8A02\u55AE\uFF0C\u7136\u5F8C\u78BA\u8A8D\u4ED8\u6B3E\u3002",
      "commerceRefund": "7\u5929\u9000\u6B3E",
      "backToHome": "\u8FD4\u56DE\u7522\u54C1\u9801\u9762",
      "formNameLabel": "\u540D\u7A31",
      "formEmailLabel": "\u96FB\u5B50\u90F5\u4EF6",
      "formMethodLabel": "\u4ED8\u6B3E\u65B9\u5F0F",
      "formNoteLabel": "\u6CE8\u610F\u4E8B\u9805",
      "formSubmitBtn": "\u767C\u9001\u8CFC\u8CB7\u8ACB\u6C42",
      "formRemark": "\u4ED8\u6B3E\u78BA\u8A8D\u5F8C\uFF0C\u60A8\u7684 Pro \u91D1\u9470\u5C07\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u3002",
      "faqH2": "\u6A5F\u5668\u4EBA/\u64F4\u5145\u529F\u80FD\u5E38\u898B\u554F\u984C\u89E3\u7B54",
      "phName": "\u7D04\u7FF0\xB7\u591A\u4F0A",
      "phNote": "\u767C\u7968\u3001\u8CA8\u5E63\u3001\u5718\u968A\u5EA7\u4F4D\u8ACB\u6C42\u7B49\u3002",
      "phMethod": "\u9078\u64C7\u4ED8\u6B3E\u65B9\u5F0F",
      "methodBadge": "\u53EF\u7528",
      "compareH2": "Chrome \u64F4\u5145 Free \u8207 Pro",
      "compareLead": "",
      "compareColFeature": "\u7279\u9EDE",
      "compareRowSavePost": "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
      "compareRowImages": "\u5132\u5B58\u5F71\u50CF",
      "compareRowReplies": "\u4F5C\u8005\u56DE\u8986\u93C8",
      "compareRowRules": "\u6A94\u6848\u540D\u7A31/\u8DEF\u5F91\u898F\u5247",
      "compareRowAi": "BYO LLM \u6458\u8981/\u6A19\u7C64/frontmatter",
      "screenH2": "Chrome extension \u9810\u89BD",
      "screenUsageCaption": "\u4F7F\u7528\u4E2D\u7BC0\u7701\u6D41\u91CF",
      "screenProCaption": "\u555F\u7528 Pro \u7684\u9078\u9805\u9801\u9762",
      "productsEyebrow": "\u5169\u7A2E\u7522\u54C1",
      "productsTitle": "Threads \u7684\u5169\u7A2E\u4FDD\u5B58\u65B9\u6CD5",
      "productsCopy": "\u672C\u9801\u9762\u4ECB\u7D39\u4E86\u516C\u958B\u56DE\u61C9 scrapbook \u6A5F\u5668\u4EBA\u548C\u4FDD\u5B58\u60A8\u76EE\u524D\u6B63\u5728\u67E5\u770B\u7684\u8CBC\u6587\u7684 Chrome extension\u3002",
      "productATag": "\u63D0\u53CA\u6A5F\u5668\u4EBA",
      "productATitle": "ZZ\u8853\u8A9E0ZZ",
      "productADesc": "\u5728\u56DE\u8986\u4E2D\u52A0\u5165 @parktaejun\uFF0C\u8A72\u9805\u76EE\u5C31\u6703\u51FA\u73FE\u5728\u60A8\u7684\u79C1\u4EBA scrapbook \u4E2D\uFF0C\u6E96\u5099\u7A0D\u5F8C\u532F\u51FA\u70BA Markdown\u3002",
      "productACta": "\u6253\u958B scrapbook",
      "productBTag": "ZZ\u8853\u8A9E0ZZ",
      "productBTitle": "ZZ\u8853\u8A9E0ZZ",
      "productBDesc": "\u5C07\u60A8\u6B63\u5728\u67E5\u770B\u7684 Threads \u8CBC\u6587\u76F4\u63A5\u5132\u5B58\u5230 Obsidian \u4E2D\u3002\u57FA\u65BC\u898F\u5247\u7684\u7D44\u7E54\u548C\u4EBA\u5DE5\u667A\u6167\u5F8C\u8655\u7406\u5728 Pro \u4E2D\u958B\u555F\u3002",
      "productBCta": "\u8ACB\u53C3\u95B1\u64F4\u5145\u6307\u5357",
      "pricingEyebrow": "\u5B9A\u50F9",
      "pricingTitle": "\u7C21\u55AE\u7684\u8A08\u8CBB\u3002",
      "pricingCopy": "",
      "bundleTag": "\u4E00\u6B21\u6027",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "\u4E00\u6B21\u6027 29 \u7F8E\u5143\u3002\u64F4\u5145 Pro + \u526A\u8CBC\u7C3F\u6838\u5FC3\u3002",
      "bundleCta": "\u8CFC\u8CB7Pro",
      "cloudTag": "Cloud \u9644\u52A0\u5143\u4EF6",
      "cloudTitle": "\u95DC\u6CE8\u5217\u8868 + \u641C\u5C0B + Insights",
      "cloudDesc": "\u59CB\u7D42\u5728\u7DDA\u7684\u540C\u6B65\u529F\u80FD\u4F5C\u70BA\u55AE\u7368\u7684\u9644\u52A0\u7D44\u4EF6\u3002",
      "cloudCta": "\u6253\u958B scrapbook",
      "botEyebrow": "\u5B83\u662F\u5982\u4F55\u904B\u4F5C\u7684",
      "botTitle": "\u4F7F\u7528\u516C\u958B\u56DE\u5FA9\u4F5C\u70BA\u89F8\u767C\u5668\u4E26\u5C07 scrapbook \u4FDD\u5BC6\u3002",
      "botCopy": "\u4F7F\u7528\u8005\u900F\u904E Threads OAuth \u9023\u63A5\u4ED6\u5011\u7684 Threads \u5E33\u6236\uFF0C\u7136\u5F8C\u4F7F\u7528\u516C\u958B\u56DE\u61C9\u63D0\u53CA\u4F5C\u70BA\u5132\u5B58\u89F8\u767C\u5668\u3002\u6BCF\u500B scrapbook \u5E33\u6236\u4FDD\u5B58\u7684\u8CC7\u6599\u90FD\u662F\u5206\u958B\u7684\u3002",
      "botStep1Title": "\u9023\u63A5\u60A8\u7684 Threads \u5E33\u6236",
      "botStep1Desc": "\u958B\u555F scrapbook \u9801\u9762\uFF0C\u7E7C\u7E8C Threads\uFF0C\u7136\u5F8C\u9023\u7DDA\u61C9\u63A5\u6536\u5DF2\u5132\u5B58\u63D0\u53CA\u7684\u5E33\u865F\u3002",
      "botStep2Title": "\u900F\u904E @parktaejun \u56DE\u8986\u4FDD\u5B58",
      "botStep2Desc": "\u4E00\u65E6\u56DE\u8986\u63D0\u53CA @parktaejun\uFF0C\u63D0\u53CA\u63A5\u6536\u5668\u5C31\u6703\u5339\u914D\u56DE\u5FA9\u4F5C\u8005\u5E33\u6236\u4E26\u51AA\u7B49\u5730\u5132\u5B58\u5B83\u3002",
      "botStep3Title": "\u7DB2\u4E0A\u5BE9\u6838\u4E26\u5C0E\u51FA",
      "botStep3Desc": "\u76EE\u6A19\u662F\u5728 60 \u79D2\u5167\u53CD\u6620\u4FDD\u5B58\u60C5\u6CC1\uFF0C\u7136\u5F8C\u8B93\u4F7F\u7528\u8005\u532F\u51FA\u70BA Markdown \u6216 Obsidian\u3001Notion \u6216\u7B46\u8A18\u61C9\u7528\u7A0B\u5F0F\u7684\u7D14\u6587\u5B57\u3002",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "\u82F1\u8A9E",
      "orderSuccess1": "{email} \u5DF2\u6536\u5230\u60A8\u7684\u8981\u6C42\u3002",
      "orderNextStep": "\u4E0B\u4E00\u6B65\uFF1A{instructions}",
      "orderPayLink": "\u4ED8\u6B3E\u9023\u7D50\uFF1A{url}",
      "orderFinal": "\u60A8\u7684 Threads Saver Pro \u91D1\u9470\u5C07\u5728\u4ED8\u6B3E\u78BA\u8A8D\u5F8C\u900F\u904E\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u3002",
      "footerPurchaseLink": ""
    }
  },
  "vi": {
    "obsidian": {
      "topbarCta": "H\u01B0\u1EDBng d\u1EABn c\xE0i \u0111\u1EB7t",
      "siteLabel": "H\u01B0\u1EDBng d\u1EABn URL",
      "heroEyebrow": "Ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng + S\u1ED5 l\u01B0u ni\u1EC7m",
      "heroGuideCta": "M\u1EDF scrapbook",
      "heroPurchaseCta": "Mua Pro",
      "heroRailLabel1": "Free",
      "heroRailText1": "L\u01B0u b\xE0i vi\u1EBFt, h\xECnh \u1EA3nh v\xE0 chu\u1ED7i ph\u1EA3n h\u1ED3i",
      "heroRailLabel2": "Pro",
      "heroRailText2": "Quy t\u1EAFc t\u1EC7p/\u0111\u01B0\u1EDDng d\u1EABn + t\u1ED5 ch\u1EE9c AI",
      "priceNote": "m\u1ED9t l\u1EA7n",
      "priceSummary": "B\u1EAFt \u0111\u1EA7u v\u1EDBi Free. Th\xEAm Pro khi b\u1EA1n c\u1EA7n.",
      "pricePointFreeDesc": "T\xEDnh n\u0103ng ti\u1EBFt ki\u1EC7m l\xF5i ho\u1EA1t \u0111\u1ED9ng ngay l\u1EADp t\u1EE9c.",
      "pricePointProDesc": "M\u1EDF kh\xF3a c\xE1c quy t\u1EAFc t\u1EADp tin v\xE0 t\u1ED5 ch\u1EE9c AI.",
      "primaryCta": "Mua Pro",
      "secondaryCta": "M\u1EDF scrapbook",
      "flowStep1": "H\xE3y th\u1EED Free tr\u01B0\u1EDBc",
      "flowStep2": "N\xE2ng c\u1EA5p l\xEAn Pro khi c\u1EA7n",
      "flowStep3": "Ch\xECa kh\xF3a \u0111\u01B0\u1EE3c g\u1EEDi qua email",
      "storyEyebrow": "B\u1EAFt \u0111\u1EA7u nhanh",
      "storyH2": "C\xE0i \u0111\u1EB7t \u2192 K\u1EBFt n\u1ED1i \u2192 L\u01B0u. Ba b\u01B0\u1EDBc.",
      "storyP": "Free \u0111\xE3 s\u1EB5n s\xE0ng ho\u1EA1t \u0111\u1ED9ng.",
      "guideInstallCta": "M\u1EDF h\u01B0\u1EDBng d\u1EABn c\xE0i \u0111\u1EB7t",
      "guideUpgradeCta": "Y\xEAu c\u1EA7u Pro",
      "card1Title": "T\u1EA3i trong Chrome",
      "card1Desc": "Gi\u1EA3i n\xE9n d\u1EF1 \xE1n v\xE0 t\u1EA3i th\u01B0 m\u1EE5c dist/extension d\u01B0\u1EDBi d\u1EA1ng Chrome extension \u0111\xE3 gi\u1EA3i n\xE9n.",
      "card2Title": "K\u1EBFt n\u1ED1i kho ti\u1EC1n c\u1EE7a b\u1EA1n",
      "card2Desc": "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian c\u1EE7a b\u1EA1n trong c\xE1c t\xF9y ch\u1ECDn \u0111\u1EC3 \u0111\xE1nh d\u1EA5u v\xE0 l\u01B0u ph\u01B0\u01A1ng ti\u1EC7n tr\u1EF1c ti\u1EBFp.",
      "card3Title": "L\u01B0u t\u1EEB Threads",
      "card3Desc": "L\u01B0u t\u1EEB b\u1EA5t k\u1EF3 trang b\xE0i vi\u1EBFt n\xE0o. Pro th\xEAm c\xE1c quy t\u1EAFc t\u1EC7p v\xE0 t\u1ED5 ch\u1EE9c AI l\xEAn h\xE0ng \u0111\u1EA7u.",
      "showcaseH2": "Nh\u1EEFng g\xEC b\u1EA1n th\u1EF1c s\u1EF1 th\u1EA5y trong ph\u1EA7n m\u1EDF r\u1ED9ng",
      "showcaseCopy": "H\xE3y t\u1EF1 m\xECnh xem s\u1EF1 kh\xE1c bi\u1EC7t gi\u1EEFa Free v\xE0 Pro.",
      "shotLargeCapTitle": "Lu\u1ED3ng l\u01B0u Free",
      "shotLargeCapDesc": "Tr\u1EA3i nghi\u1EC7m ti\u1EBFt ki\u1EC7m c\u1ED1t l\xF5i v\u1EABn nhanh ch\xF3ng v\xE0 \u0111\u01A1n gi\u1EA3n.",
      "shotSmallCapTitle": "Pro t\u1EF1 \u0111\u1ED9ng t\u1ED5 ch\u1EE9c",
      "shotSmallCapDesc": "\u0110\u01B0\u1EE3c t\u1ED5 ch\u1EE9c b\u1EB1ng c\xE1ch s\u1EED d\u1EE5ng c\xE1c quy t\u1EAFc b\u1EA1n \u0111\xE3 ch\u1ECDn v\xE0 th\u1EBB t\xF3m t\u1EAFt/th\u1EBB \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 b\u1EDFi LLM c\u1EE7a ri\xEAng b\u1EA1n.",
      "compFreeDesc": "Lu\u1ED3ng l\u01B0u c\u1ED1t l\xF5i \u0111\xE3 ho\u1EA1t \u0111\u1ED9ng t\u1ED1t",
      "compProDesc": "B\u1EA3n n\xE2ng c\u1EA5p b\u1ED5 sung c\xE1c quy t\u1EAFc t\u1EC7p/\u0111\u01B0\u1EDDng d\u1EABn c\xF9ng v\u1EDBi c\xE1c b\u1EA3n t\xF3m t\u1EAFt, th\u1EBB v\xE0 n\u1ED9i dung ch\xEDnh c\u1EE7a AI",
      "step1Title": "H\xE3y th\u1EED Free tr\u01B0\u1EDBc",
      "step1Desc": "B\xE0i vi\u1EBFt, h\xECnh \u1EA3nh v\xE0 chu\u1ED7i ph\u1EA3n h\u1ED3i s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u ngay l\u1EADp t\u1EE9c.",
      "step2Title": "N\xE2ng c\u1EA5p khi c\u1EA7n thi\u1EBFt",
      "step2Desc": "Pro th\xEAm quy t\u1EAFc t\u1EC7p v\xE0 t\u1ED5 ch\u1EE9c AI.",
      "step3Title": "D\xE1n ch\xECa kh\xF3a c\u1EE7a b\u1EA1n",
      "step3Desc": "Nh\u1EADp key Pro v\xE0o c\xE1c t\xF9y ch\u1ECDn \u0111\u1EC3 k\xEDch ho\u1EA1t.",
      "commerceH2": "Mua Pro",
      "commerceLead": "$29 m\u1ED9t l\u1EA7n. Ch\xECa kh\xF3a \u0111\u01B0\u1EE3c g\u1EEDi qua email.",
      "commerceNote": "\u0110\u01A1n \u0111\u1EB7t h\xE0ng \u0111\u01B0\u1EE3c xem x\xE9t tr\u01B0\u1EDBc, sau \u0111\xF3 thanh to\xE1n \u0111\u01B0\u1EE3c x\xE1c nh\u1EADn.",
      "commerceRefund": "Ho\xE0n ti\u1EC1n trong 7 ng\xE0y",
      "backToHome": "Quay l\u1EA1i trang s\u1EA3n ph\u1EA9m",
      "formNameLabel": "T\xEAn",
      "formEmailLabel": "Email",
      "formMethodLabel": "Ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
      "formNoteLabel": "L\u01B0u \xFD",
      "formSubmitBtn": "G\u1EEDi y\xEAu c\u1EA7u mua h\xE0ng",
      "formRemark": "Kh\xF3a Pro c\u1EE7a b\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi qua email sau khi x\xE1c nh\u1EADn thanh to\xE1n.",
      "faqH2": "Nh\u1EEFng c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p nh\u1EA5t tr\u01B0\u1EDBc khi mua",
      "phName": "John Doe",
      "phNote": "H\xF3a \u0111\u01A1n, ti\u1EC1n t\u1EC7, y\xEAu c\u1EA7u ch\u1ED7 ng\u1ED3i c\u1EE7a \u0111\u1ED9i, v.v.",
      "phMethod": "Ch\u1ECDn ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
      "methodBadge": "C\xF3 s\u1EB5n",
      "compareH2": "Free so v\u1EDBi Pro",
      "compareLead": "",
      "compareColFeature": "t\xEDnh n\u0103ng",
      "compareRowSavePost": "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
      "compareRowImages": "L\u01B0u h\xECnh \u1EA3nh",
      "compareRowReplies": "Chu\u1ED7i tr\u1EA3 l\u1EDDi c\u1EE7a t\xE1c gi\u1EA3",
      "compareRowRules": "T\xEAn t\u1EC7p/quy t\u1EAFc \u0111\u01B0\u1EDDng d\u1EABn",
      "compareRowAi": "BYO LLM t\xF3m t\u1EAFt / th\u1EBB / v\u1EA5n \u0111\u1EC1 ch\xEDnh",
      "screenH2": "Xem tr\u01B0\u1EDBc",
      "screenUsageCaption": "L\u01B0u lu\u1ED3ng \u0111ang s\u1EED d\u1EE5ng",
      "screenProCaption": "Trang t\xF9y ch\u1ECDn \u0111\xE3 b\u1EADt Pro",
      "productsEyebrow": "Hai s\u1EA3n ph\u1EA9m",
      "productsTitle": "Hai c\xE1ch \u0111\u1EC3 ti\u1EBFt ki\u1EC7m",
      "productsCopy": "",
      "productATag": "Chrome extension",
      "productATitle": "Threads to Obsidian",
      "productADesc": "L\u01B0u b\xE0i \u0111\u0103ng b\u1EA1n \u0111ang xem v\xE0o Obsidian ho\u1EB7c Notion.",
      "productACta": "C\xE0i \u0111\u1EB7t t\u1EEB GitHub",
      "productBTag": "\u0110\u1EC1 c\u1EADp \u0111\u1EBFn bot",
      "productBTitle": "Mention Scrapbook",
      "productBDesc": "Thu th\u1EADp th\xF4ng qua \u0111\u1EC1 c\u1EADp tr\u1EA3 l\u1EDDi, xu\u1EA5t d\u01B0\u1EDBi d\u1EA1ng Markdown.",
      "productBCta": "M\u1EDF scrapbook",
      "pricingEyebrow": "\u0110\u1ECBnh gi\xE1",
      "pricingTitle": "Thanh to\xE1n \u0111\u01A1n gi\u1EA3n.",
      "pricingCopy": "",
      "bundleTag": "M\u1ED9t l\u1EA7n",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "$29 m\u1ED9t l\u1EA7n. Ph\u1EA7n m\u1EDF r\u1ED9ng Pro + l\xF5i s\u1ED5 l\u01B0u ni\u1EC7m.",
      "bundleCta": "Mua Pro",
      "cloudTag": "Ti\u1EC7n \xEDch b\u1ED5 sung Cloud",
      "cloudTitle": "Danh s\xE1ch theo d\xF5i + T\xECm ki\u1EBFm + Insights",
      "cloudDesc": "T\xEDnh n\u0103ng \u0111\u1ED3ng b\u1ED9 lu\xF4n b\u1EADt nh\u01B0 m\u1ED9t ti\u1EC7n \xEDch b\u1ED5 sung ri\xEAng bi\u1EC7t.",
      "cloudCta": "M\u1EDF scrapbook",
      "botEyebrow": "\u0110\u1EC1 c\u1EADp \u0111\u1EBFn bot",
      "botTitle": "L\u01B0u v\xE0o scrapbook v\u1EDBi m\u1ED9t c\xE2u tr\u1EA3 l\u1EDDi",
      "botCopy": "Tr\u1EA3 l\u1EDDi b\u1EB1ng @ \u0111\u1EC3 l\u01B0u. Xu\u1EA5t d\u01B0\u1EDBi d\u1EA1ng Markdown sau.",
      "botStep1Title": "Th\xEAm @parktaejun v\xE0o th\u01B0 tr\u1EA3 l\u1EDDi",
      "botStep1Desc": "Tr\u1EA3 l\u1EDDi b\xE0i \u0111\u0103ng Threads b\u1EA1n mu\u1ED1n l\u01B0u v\xE0 ch\u1EC9 bao g\u1ED3m @parktaejun \u0111\u1EC3 t\u1EA1o tr\xECnh k\xEDch ho\u1EA1t l\u01B0u.",
      "botStep2Title": "\u0110\u1ECBnh tuy\u1EBFn n\xF3 \u0111\u1EBFn scrapbook c\u1EE7a b\u1EA1n theo danh t\xEDnh",
      "botStep2Desc": "H\u1EC7 th\u1ED1ng \u0111\u1ED1i s\xE1nh t\xE1c gi\u1EA3 tr\u1EA3 l\u1EDDi v\u1EDBi t\xE0i kho\u1EA3n Threads \u0111\u01B0\u1EE3c li\xEAn k\u1EBFt khi \u0111\u0103ng nh\u1EADp v\xE0 ch\u1EC9 l\u01B0u tr\u1EEF m\u1EE5c trong scrapbook ri\xEAng t\u01B0 c\u1EE7a ng\u01B0\u1EDDi d\xF9ng \u0111\xF3.",
      "botStep3Title": "Xu\u1EA5t d\u01B0\u1EDBi d\u1EA1ng Markdown sau",
      "botStep3Desc": "C\xE1c m\u1EE5c \u0111\xE3 l\u01B0u v\u1EABn hi\u1EC3n th\u1ECB tr\xEAn b\u1EA3ng \u0111i\u1EC1u khi\u1EC3n web v\xE0 c\xF3 th\u1EC3 \u0111\u01B0\u1EE3c sao ch\xE9p d\u01B0\u1EDBi d\u1EA1ng Markdown ho\u1EB7c v\u0103n b\u1EA3n thu\u1EA7n t\xFAy cho c\xE1c \u1EE9ng d\u1EE5ng Obsidian, Notion ho\u1EB7c ghi ch\xFA.",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "Ti\u1EBFng Anh",
      "orderSuccess1": "Y\xEAu c\u1EA7u c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c nh\u1EADn t\u1EA1i {email}.",
      "orderNextStep": "B\u01B0\u1EDBc ti\u1EBFp theo: {instructions}",
      "orderPayLink": "Link thanh to\xE1n: {url}",
      "orderFinal": "Kh\xF3a Threads Saver Pro c\u1EE7a b\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi qua email sau khi x\xE1c nh\u1EADn thanh to\xE1n.",
      "footerPurchaseLink": ""
    },
    "bot": {
      "topbarCta": "M\u1EDF scrapbook",
      "siteLabel": "H\u01B0\u1EDBng d\u1EABn URL",
      "heroEyebrow": "Mention Scrapbook SaaS",
      "heroGuideCta": "M\u1EDF scrapbook",
      "heroPurchaseCta": "Mua ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng Pro",
      "heroRailLabel1": "Free",
      "heroRailText1": "L\u01B0u b\xE0i vi\u1EBFt, h\xECnh \u1EA3nh v\xE0 chu\u1ED7i ph\u1EA3n h\u1ED3i",
      "heroRailLabel2": "Pro",
      "heroRailText2": "Quy t\u1EAFc t\u1EC7p/\u0111\u01B0\u1EDDng d\u1EABn + t\u1ED5 ch\u1EE9c AI",
      "priceNote": "m\u1ED9t l\u1EA7n",
      "priceSummary": "B\u1EAFt \u0111\u1EA7u v\u1EDBi Free. Th\xEAm Pro khi b\u1EA1n c\u1EA7n.",
      "pricePointFreeDesc": "T\xEDnh n\u0103ng ti\u1EBFt ki\u1EC7m l\xF5i ho\u1EA1t \u0111\u1ED9ng ngay l\u1EADp t\u1EE9c.",
      "pricePointProDesc": "M\u1EDF kh\xF3a c\xE1c quy t\u1EAFc t\u1EADp tin v\xE0 t\u1ED5 ch\u1EE9c AI.",
      "primaryCta": "Mua ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng Pro",
      "secondaryCta": "M\u1EDF scrapbook",
      "flowStep1": "H\xE3y th\u1EED Free tr\u01B0\u1EDBc",
      "flowStep2": "N\xE2ng c\u1EA5p l\xEAn Pro khi c\u1EA7n",
      "flowStep3": "Ch\xECa kh\xF3a \u0111\u01B0\u1EE3c g\u1EEDi qua email",
      "storyEyebrow": "Ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng Chrome",
      "storyH2": "Threads to Obsidian c\u0169ng c\xF3 s\u1EB5n \u1EDF \u0111\xE2y.",
      "storyP": "Bot x\u1EED l\xFD c\xE1c l\u1EA7n l\u01B0u scrapbook d\u1EF1a tr\xEAn \u0111\u1EC1 c\u1EADp, trong khi ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng s\u1EBD g\u1EEDi b\xE0i \u0111\u0103ng m\xE0 b\u1EA1n \u0111ang t\xEDch c\u1EF1c xem th\u1EB3ng v\xE0o Obsidian.",
      "guideInstallCta": "M\u1EDF h\u01B0\u1EDBng d\u1EABn c\xE0i \u0111\u1EB7t",
      "guideUpgradeCta": "Y\xEAu c\u1EA7u Pro",
      "card1Title": "T\u1EA3i trong Chrome",
      "card1Desc": "Gi\u1EA3i n\xE9n d\u1EF1 \xE1n v\xE0 t\u1EA3i th\u01B0 m\u1EE5c dist/extension d\u01B0\u1EDBi d\u1EA1ng Chrome extension \u0111\xE3 gi\u1EA3i n\xE9n.",
      "card2Title": "K\u1EBFt n\u1ED1i kho ti\u1EC1n c\u1EE7a b\u1EA1n",
      "card2Desc": "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian c\u1EE7a b\u1EA1n trong c\xE1c t\xF9y ch\u1ECDn \u0111\u1EC3 \u0111\xE1nh d\u1EA5u v\xE0 l\u01B0u ph\u01B0\u01A1ng ti\u1EC7n tr\u1EF1c ti\u1EBFp.",
      "card3Title": "L\u01B0u tr\u1EF1c ti\u1EBFp t\u1EEB Threads",
      "card3Desc": "L\u01B0u ngay b\xE0i vi\u1EBFt b\u1EA1n \u0111ang xem tr\xEAn tr\xECnh duy\u1EC7t. B\u1EA1n c\xF3 th\u1EC3 s\u1EED d\u1EE5ng n\xF3 ri\xEAng bi\u1EC7t v\u1EDBi bot \u0111\u1EC1 c\u1EADp ho\u1EB7c s\u1EED d\u1EE5ng c\xF9ng v\u1EDBi n\xF3.",
      "showcaseH2": "Nh\u1EEFng g\xEC b\u1EA1n th\u1EF1c s\u1EF1 th\u1EA5y trong ph\u1EA7n m\u1EDF r\u1ED9ng",
      "showcaseCopy": "H\xE3y t\u1EF1 m\xECnh xem s\u1EF1 kh\xE1c bi\u1EC7t gi\u1EEFa Free v\xE0 Pro.",
      "shotLargeCapTitle": "Lu\u1ED3ng l\u01B0u Free",
      "shotLargeCapDesc": "Tr\u1EA3i nghi\u1EC7m ti\u1EBFt ki\u1EC7m c\u1ED1t l\xF5i v\u1EABn nhanh ch\xF3ng v\xE0 \u0111\u01A1n gi\u1EA3n.",
      "shotSmallCapTitle": "Pro t\u1EF1 \u0111\u1ED9ng t\u1ED5 ch\u1EE9c",
      "shotSmallCapDesc": "\u0110\u01B0\u1EE3c t\u1ED5 ch\u1EE9c b\u1EB1ng c\xE1ch s\u1EED d\u1EE5ng c\xE1c quy t\u1EAFc b\u1EA1n \u0111\xE3 ch\u1ECDn v\xE0 th\u1EBB t\xF3m t\u1EAFt/th\u1EBB \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 b\u1EDFi LLM c\u1EE7a ri\xEAng b\u1EA1n.",
      "compFreeDesc": "Lu\u1ED3ng l\u01B0u c\u1ED1t l\xF5i \u0111\xE3 ho\u1EA1t \u0111\u1ED9ng t\u1ED1t",
      "compProDesc": "B\u1EA3n n\xE2ng c\u1EA5p b\u1ED5 sung c\xE1c quy t\u1EAFc t\u1EC7p/\u0111\u01B0\u1EDDng d\u1EABn c\xF9ng v\u1EDBi c\xE1c b\u1EA3n t\xF3m t\u1EAFt, th\u1EBB v\xE0 n\u1ED9i dung ch\xEDnh c\u1EE7a AI",
      "step1Title": "H\xE3y th\u1EED Free tr\u01B0\u1EDBc",
      "step1Desc": "B\xE0i vi\u1EBFt, h\xECnh \u1EA3nh v\xE0 chu\u1ED7i ph\u1EA3n h\u1ED3i s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u ngay l\u1EADp t\u1EE9c.",
      "step2Title": "N\xE2ng c\u1EA5p khi c\u1EA7n thi\u1EBFt",
      "step2Desc": "Pro th\xEAm quy t\u1EAFc t\u1EC7p v\xE0 t\u1ED5 ch\u1EE9c AI.",
      "step3Title": "D\xE1n ch\xECa kh\xF3a c\u1EE7a b\u1EA1n",
      "step3Desc": "Nh\u1EADp key Pro v\xE0o c\xE1c t\xF9y ch\u1ECDn \u0111\u1EC3 k\xEDch ho\u1EA1t.",
      "commerceH2": "Mua Threads to Obsidian Pro",
      "commerceLead": "Bi\u1EC3u m\u1EABu b\xEAn d\u01B0\u1EDBi d\xE0nh cho vi\u1EC7c mua Chrome extension Pro. Vi\u1EC7c \u0111\u1EC1 c\u1EADp \u0111\u1EBFn bot scrapbook \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EA3i th\xEDch trong c\xE1c ph\u1EA7n tr\xEAn.",
      "commerceNote": "\u0110\u01A1n \u0111\u1EB7t h\xE0ng \u0111\u01B0\u1EE3c xem x\xE9t tr\u01B0\u1EDBc, sau \u0111\xF3 thanh to\xE1n \u0111\u01B0\u1EE3c x\xE1c nh\u1EADn.",
      "commerceRefund": "Ho\xE0n ti\u1EC1n trong 7 ng\xE0y",
      "backToHome": "Quay l\u1EA1i trang s\u1EA3n ph\u1EA9m",
      "formNameLabel": "T\xEAn",
      "formEmailLabel": "Email",
      "formMethodLabel": "Ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
      "formNoteLabel": "L\u01B0u \xFD",
      "formSubmitBtn": "G\u1EEDi y\xEAu c\u1EA7u mua h\xE0ng",
      "formRemark": "Kh\xF3a Pro c\u1EE7a b\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi qua email sau khi x\xE1c nh\u1EADn thanh to\xE1n.",
      "faqH2": "C\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p v\u1EC1 Bot/Ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng",
      "phName": "John Doe",
      "phNote": "H\xF3a \u0111\u01A1n, ti\u1EC1n t\u1EC7, y\xEAu c\u1EA7u ch\u1ED7 ng\u1ED3i c\u1EE7a \u0111\u1ED9i, v.v.",
      "phMethod": "Ch\u1ECDn ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
      "methodBadge": "C\xF3 s\u1EB5n",
      "compareH2": "Ph\u1EA7n m\u1EDF r\u1ED9ng Chrome Free so v\u1EDBi Pro",
      "compareLead": "",
      "compareColFeature": "t\xEDnh n\u0103ng",
      "compareRowSavePost": "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
      "compareRowImages": "L\u01B0u h\xECnh \u1EA3nh",
      "compareRowReplies": "Chu\u1ED7i tr\u1EA3 l\u1EDDi c\u1EE7a t\xE1c gi\u1EA3",
      "compareRowRules": "T\xEAn t\u1EC7p/quy t\u1EAFc \u0111\u01B0\u1EDDng d\u1EABn",
      "compareRowAi": "BYO LLM t\xF3m t\u1EAFt / th\u1EBB / v\u1EA5n \u0111\u1EC1 ch\xEDnh",
      "screenH2": "Xem tr\u01B0\u1EDBc Chrome extension",
      "screenUsageCaption": "L\u01B0u lu\u1ED3ng \u0111ang s\u1EED d\u1EE5ng",
      "screenProCaption": "Trang t\xF9y ch\u1ECDn \u0111\xE3 b\u1EADt Pro",
      "productsEyebrow": "Hai s\u1EA3n ph\u1EA9m",
      "productsTitle": "Hai c\xE1ch \u0111\u1EC3 ti\u1EBFt ki\u1EC7m t\u1EEB Threads",
      "productsCopy": "Trang n\xE0y gi\u1EDBi thi\u1EC7u c\u1EA3 bot scrapbook tr\u1EA3 l\u1EDDi c\xF4ng khai v\xE0 Chrome extension \u0111\u1EC3 l\u01B0u b\xE0i \u0111\u0103ng b\u1EA1n \u0111ang xem ngay b\xE2y gi\u1EDD.",
      "productATag": "\u0110\u1EC1 c\u1EADp \u0111\u1EBFn bot",
      "productATitle": "Threads Mention Scrapbook",
      "productADesc": "Th\xEAm @parktaejun v\xE0o th\u01B0 tr\u1EA3 l\u1EDDi v\xE0 m\u1EE5c n\xE0y s\u1EBD n\u1EB1m trong scrapbook ri\xEAng t\u01B0 c\u1EE7a b\u1EA1n, s\u1EB5n s\xE0ng xu\u1EA5t d\u01B0\u1EDBi d\u1EA1ng Markdown sau n\xE0y.",
      "productACta": "M\u1EDF scrapbook",
      "productBTag": "Chrome extension",
      "productBTitle": "Threads to Obsidian",
      "productBDesc": "L\u01B0u b\xE0i \u0111\u0103ng Threads b\u1EA1n \u0111ang xem th\u1EB3ng v\xE0o Obsidian. T\u1ED5 ch\u1EE9c d\u1EF1a tr\xEAn quy t\u1EAFc v\xE0 x\u1EED l\xFD h\u1EADu k\u1EF3 AI \u0111\u01B0\u1EE3c b\u1EADt trong Pro.",
      "productBCta": "Xem h\u01B0\u1EDBng d\u1EABn m\u1EDF r\u1ED9ng",
      "pricingEyebrow": "\u0110\u1ECBnh gi\xE1",
      "pricingTitle": "Thanh to\xE1n \u0111\u01A1n gi\u1EA3n.",
      "pricingCopy": "",
      "bundleTag": "M\u1ED9t l\u1EA7n",
      "bundleTitle": "Threads Saver Pro",
      "bundleDesc": "$29 m\u1ED9t l\u1EA7n. Ph\u1EA7n m\u1EDF r\u1ED9ng Pro + l\xF5i s\u1ED5 l\u01B0u ni\u1EC7m.",
      "bundleCta": "Mua Pro",
      "cloudTag": "Ti\u1EC7n \xEDch b\u1ED5 sung Cloud",
      "cloudTitle": "Danh s\xE1ch theo d\xF5i + T\xECm ki\u1EBFm + Insights",
      "cloudDesc": "T\xEDnh n\u0103ng \u0111\u1ED3ng b\u1ED9 lu\xF4n b\u1EADt nh\u01B0 m\u1ED9t ti\u1EC7n \xEDch b\u1ED5 sung ri\xEAng bi\u1EC7t.",
      "cloudCta": "M\u1EDF scrapbook",
      "botEyebrow": "N\xF3 ho\u1EA1t \u0111\u1ED9ng nh\u01B0 th\u1EBF n\xE0o",
      "botTitle": "S\u1EED d\u1EE5ng c\xE2u tr\u1EA3 l\u1EDDi c\xF4ng khai l\xE0m y\u1EBFu t\u1ED1 k\xEDch ho\u1EA1t v\xE0 gi\u1EEF scrapbook \u1EDF ch\u1EBF \u0111\u1ED9 ri\xEAng t\u01B0.",
      "botCopy": "Ng\u01B0\u1EDDi d\xF9ng k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads c\u1EE7a h\u1ECD th\xF4ng qua Threads OAuth, sau \u0111\xF3 s\u1EED d\u1EE5ng \u0111\u1EC1 c\u1EADp tr\u1EA3 l\u1EDDi c\xF4ng khai l\xE0m tr\xECnh k\xEDch ho\u1EA1t l\u01B0u. D\u1EEF li\u1EC7u \u0111\xE3 l\u01B0u \u0111\u01B0\u1EE3c t\xE1ch ri\xEAng cho m\u1ED7i t\xE0i kho\u1EA3n scrapbook.",
      "botStep1Title": "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads c\u1EE7a b\u1EA1n",
      "botStep1Desc": "M\u1EDF trang scrapbook, ti\u1EBFp t\u1EE5c v\u1EDBi Threads v\xE0 k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n s\u1EBD nh\u1EADn \u0111\u01B0\u1EE3c c\xE1c \u0111\u1EC1 c\u1EADp \u0111\xE3 l\u01B0u.",
      "botStep2Title": "L\u01B0u v\u1EDBi c\xE2u tr\u1EA3 l\u1EDDi @parktaejun",
      "botStep2Desc": "Sau khi m\u1ED9t c\xE2u tr\u1EA3 l\u1EDDi \u0111\u1EC1 c\u1EADp \u0111\u1EBFn @parktaejun, tr\xECnh nh\u1EADp \u0111\u1EC1 c\u1EADp s\u1EBD kh\u1EDBp v\u1EDBi t\xE0i kho\u1EA3n t\xE1c gi\u1EA3 c\xE2u tr\u1EA3 l\u1EDDi v\xE0 l\u01B0u tr\u1EEF n\xF3 m\u1ED9t c\xE1ch b\xECnh th\u01B0\u1EDDng.",
      "botStep3Title": "\u0110\xE1nh gi\xE1 tr\xEAn web v\xE0 xu\u1EA5t kh\u1EA9u",
      "botStep3Desc": "M\u1EE5c ti\xEAu l\xE0 ph\u1EA3n \xE1nh c\xE1c l\u01B0\u1EE3t l\u01B0u trong v\xF2ng 60 gi\xE2y, sau \u0111\xF3 cho ph\xE9p ng\u01B0\u1EDDi d\xF9ng xu\u1EA5t d\u01B0\u1EDBi d\u1EA1ng Markdown ho\u1EB7c v\u0103n b\u1EA3n thu\u1EA7n t\xFAy cho c\xE1c \u1EE9ng d\u1EE5ng Obsidian, Notion ho\u1EB7c ghi ch\xFA.",
      "langKo": "\uD55C\uAD6D\uC5B4",
      "langEn": "Ti\u1EBFng Anh",
      "orderSuccess1": "Y\xEAu c\u1EA7u c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c nh\u1EADn t\u1EA1i {email}.",
      "orderNextStep": "B\u01B0\u1EDBc ti\u1EBFp theo: {instructions}",
      "orderPayLink": "Link thanh to\xE1n: {url}",
      "orderFinal": "Kh\xF3a Threads Saver Pro c\u1EE7a b\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi qua email sau khi x\xE1c nh\u1EADn thanh to\xE1n.",
      "footerPurchaseLink": ""
    }
  }
};
var landingStorefrontLocales = {
  "ja": {
    "obsidian": {
      "productName": "Threads Saver",
      "headline": "PC\u306F extension\u3002\u30E2\u30D0\u30A4\u30EB\u306F mention\u3002",
      "subheadline": "\u4ECA\u898B\u3066\u3044\u308B\u6295\u7A3F\u306F Chrome extension \u3067\u4FDD\u5B58\u3057\u3001\u30E2\u30D0\u30A4\u30EB\u3067\u306F mention scrapbook \u3067\u96C6\u3081\u307E\u3059\u3002",
      "priceLabel": "Threads Saver Pro",
      "includedUpdates": "29 \u30C9\u30EB\u306E 1 \u56DE\u9650\u308A \xB7 \u62E1\u5F35 Pro + scrapbook \u30B3\u30A2 \xB7 7 \u65E5\u9593\u306E\u8FD4\u91D1",
      "heroNotes": [
        "Chrome extension: \u4ECA\u8AAD\u3093\u3067\u3044\u308B\u6295\u7A3F\u3092\u4FDD\u5B58\u3057\u307E\u3059",
        "scrapbook: \u30E1\u30F3\u30B7\u30E7\u30F3\u3001watchlists\u3001searches \u3092\u6574\u7406\u3057\u307E\u3059\u3002",
        "Cloud \u30A2\u30C9\u30AA\u30F3: \u30C7\u30A3\u30B9\u30AB\u30D0\u30EA\u30FC\u3001\u691C\u7D22\u3001Insights"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "https://github.com/parktaejun-dev/threads-to-obsidian",
        "productBHref": "/scrapbook"
      },
      "faqs": [
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-1",
          "question": "\u6295\u7A3F\u3092\u4FDD\u5B58\u3059\u308B\u306B\u306F Pro \u304C\u5FC5\u8981\u3067\u3059\u304B?",
          "answer": "\u3044\u3044\u3048\u3002\u4FDD\u5B58\u3001\u753B\u50CF\u30AD\u30E3\u30D7\u30C1\u30E3\u3001\u4F5C\u6210\u8005\u8FD4\u4FE1\u30C1\u30A7\u30FC\u30F3\u3001\u8907\u88FD\u30B9\u30AD\u30C3\u30D7\u306F\u3059\u3079\u3066 Free \u3067\u6A5F\u80FD\u3057\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-2",
          "question": "Pro \u3092\u8CB7\u3046\u3079\u304D\u4EBA\u306F\u8AB0\u3067\u3059\u304B?",
          "answer": "\u3053\u308C\u306F\u3001\u30D5\u30A1\u30A4\u30EB/\u30D1\u30B9 \u30EB\u30FC\u30EB\u3092\u76F4\u63A5\u5236\u5FA1\u3057\u3001\u72EC\u81EA\u306E LLM \u30AD\u30FC\u3092\u4F7F\u7528\u3057\u3066\u30B5\u30DE\u30EA\u30FC\u3001\u30BF\u30B0\u3001\u304A\u3088\u3073\u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC\u3092\u751F\u6210\u3057\u305F\u3044\u4EBA\u306B\u9069\u3057\u3066\u3044\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-3",
          "question": "AI \u306B\u3088\u308B\u8981\u7D04\u3084\u30BF\u30B0\u4ED8\u3051\u306F\u884C\u308F\u308C\u307E\u3059\u304B?",
          "answer": "\u306F\u3044\u3002 Pro \u3067\u306F\u3001OpenAI \u4E92\u63DB\u306E\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u3068\u72EC\u81EA\u306E\u30AD\u30FC\u3092\u63A5\u7D9A\u3057\u3066\u3001\u6982\u8981\u3001\u30BF\u30B0\u3001\u304A\u3088\u3073\u8FFD\u52A0\u306E\u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC\u3092\u751F\u6210\u3067\u304D\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-4",
          "question": "Pro \u30AD\u30FC\u306F\u3069\u306E\u3088\u3046\u306B\u914D\u5E03\u3055\u308C\u307E\u3059\u304B?",
          "answer": "\u652F\u6255\u3044\u304C\u78BA\u8A8D\u3055\u308C\u308B\u3068\u3001Pro \u30AD\u30FC\u304C\u96FB\u5B50\u30E1\u30FC\u30EB\u306B\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-5",
          "question": "\u8FD4\u91D1\u30DD\u30EA\u30B7\u30FC\u306F\u3042\u308A\u307E\u3059\u304B?",
          "answer": "\u8FD4\u54C1\u30EA\u30AF\u30A8\u30B9\u30C8\u306F\u8CFC\u5165\u5F8C7\u65E5\u4EE5\u5185\u306B\u53D7\u3051\u4ED8\u3051\u307E\u3059\u3002"
        }
      ]
    },
    "bot": {
      "productName": "Threads Mention Scrapbook",
      "headline": "Threads \u5FDC\u7B54\u306B @parktaejun \u3092\u8FFD\u52A0\u3059\u308B\u3068\u3001\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
      "subheadline": "\u30D1\u30D6\u30EA\u30C3\u30AF\u5FDC\u7B54\u3092\u30D7\u30E9\u30A4\u30D9\u30FC\u30C8 scrapbook \u306E\u4FDD\u5B58\u30C8\u30EA\u30AC\u30FC\u306B\u5909\u63DB\u3057\u3001\u5F8C\u3067\u305D\u306E\u7D50\u679C\u3092 Markdown\u3001Obsidian\u3001\u307E\u305F\u306F Notion \u306B\u79FB\u52D5\u3057\u307E\u3059\u3002",
      "priceLabel": "Threads to Obsidian Pro",
      "includedUpdates": "Chrome extension \xB7 1 \u56DE\u9650\u308A\u306E\u652F\u6255\u3044 \xB7 1 \u5E74\u9593\u306E\u66F4\u65B0",
      "heroNotes": [
        "\u8FD4\u4FE1\u306F\u516C\u958B\u30C8\u30EA\u30AC\u30FC\u3067\u3042\u308B\u305F\u3081\u3001\u305D\u3053\u306B\u6A5F\u5BC6\u306E\u30E1\u30E2\u3092\u66F8\u304D\u8FBC\u307E\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002",
        "\u30B7\u30B9\u30C6\u30E0\u306F\u3001\u8FD4\u4FE1\u4F5C\u6210\u8005\u3092 OAuth \u3092\u901A\u3058\u3066\u30EA\u30F3\u30AF\u3055\u308C\u305F Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u7167\u5408\u3057\u3001\u30E6\u30FC\u30B6\u30FC\u3054\u3068\u306B\u30A2\u30A4\u30C6\u30E0\u3092\u4FDD\u5B58\u3057\u307E\u3059\u3002",
        "\u4FDD\u5B58\u3055\u308C\u305F\u30A2\u30A4\u30C6\u30E0\u306F\u3001Markdown \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3068\u30D7\u30EC\u30FC\u30F3\u30C6\u30AD\u30B9\u30C8 \u30B3\u30D4\u30FC\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u307E\u3059\u3002"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "/scrapbook",
        "productBHref": "#install"
      },
      "faqs": [
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-1",
          "question": "\u8FD4\u4FE1\u306F\u516C\u958B\u3055\u308C\u307E\u3059\u304B?",
          "answer": "\u306F\u3044\u3002\u8FD4\u4FE1\u306F\u516C\u958B\u30C8\u30EA\u30AC\u30FC\u3068\u3057\u3066\u6A5F\u80FD\u3059\u308B\u305F\u3081\u3001\u3053\u306E\u30DA\u30FC\u30B8\u3067\u306F\u30E6\u30FC\u30B6\u30FC\u306B\u6A5F\u5BC6\u30E1\u30E2\u3092\u66F8\u304D\u8FBC\u307E\u306A\u3044\u3088\u3046\u306B\u660E\u78BA\u306B\u8B66\u544A\u3057\u3066\u3044\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-2",
          "question": "\u9805\u76EE\u3092\u9593\u9055\u3063\u305F scrapbook \u306B\u4FDD\u5B58\u3067\u304D\u307E\u3059\u304B?",
          "answer": "\u30B7\u30B9\u30C6\u30E0\u306F\u3001\u8FD4\u4FE1\u4F5C\u6210\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u304C scrapbook \u306B\u30EA\u30F3\u30AF\u3055\u308C\u3066\u3044\u308B Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u4E00\u81F4\u3059\u308B\u5834\u5408\u306B\u306E\u307F\u4FDD\u5B58\u3057\u307E\u3059\u3002\u305D\u308C\u4EE5\u5916\u306E\u5834\u5408\u3001\u30A4\u30D9\u30F3\u30C8\u306F\u7121\u8996\u3055\u308C\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-3",
          "question": "\u30E6\u30FC\u30B6\u30FC\u540D\u304C\u5909\u66F4\u3055\u308C\u305F\u5834\u5408\u306F\u3069\u3046\u306A\u308A\u307E\u3059\u304B?",
          "answer": "\u30E6\u30FC\u30B6\u30FC\u306F\u3001\u540C\u3058 Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u518D\u5EA6\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u3001\u540C\u3058 scrapbook \u3092\u7DAD\u6301\u3057\u306A\u304C\u3089\u3001\u6700\u65B0\u306E\u30E6\u30FC\u30B6\u30FC\u540D\u3068\u30D7\u30ED\u30D5\u30A1\u30A4\u30EB\u60C5\u5831\u3092\u66F4\u65B0\u3067\u304D\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-4",
          "question": "\u4FDD\u5B58\u306F\u3069\u306E\u304F\u3089\u3044\u306E\u901F\u3055\u3067\u8868\u793A\u3055\u308C\u307E\u3059\u304B?",
          "answer": "\u30C7\u30D5\u30A9\u30EB\u30C8\u3067\u306F\u3001\u30E1\u30F3\u30B7\u30E7\u30F3\u306F 30 \uFF5E 60 \u79D2\u3054\u3068\u306B\u30DD\u30FC\u30EA\u30F3\u30B0\u3055\u308C\u300160 \u79D2\u4EE5\u5185\u306B\u4FDD\u5B58\u304C\u8868\u793A\u3055\u308C\u308B\u3053\u3068\u304C\u76EE\u6A19\u3068\u306A\u308A\u307E\u3059\u3002"
        },
        {
          "id": "\u3088\u304F\u3042\u308B\u8CEA\u554F-5",
          "question": "\u4FDD\u5B58\u3057\u305F\u30A2\u30A4\u30C6\u30E0\u3092\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3059\u308B\u306B\u306F\u3069\u3046\u3059\u308C\u3070\u3088\u3044\u3067\u3059\u304B?",
          "answer": "Markdown \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3068\u30D7\u30EC\u30FC\u30F3\u30C6\u30AD\u30B9\u30C8 \u30B3\u30D4\u30FC\u304C\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u308B\u305F\u3081\u3001\u30A2\u30A4\u30C6\u30E0\u3092 Obsidian\u3001Notion\u3001\u307E\u305F\u306F\u30E1\u30E2 \u30A2\u30D7\u30EA\u306B\u79FB\u52D5\u3067\u304D\u307E\u3059\u3002"
        }
      ]
    }
  },
  "pt-BR": {
    "obsidian": {
      "productName": "Threads Saver",
      "headline": "PC \xE9 extension. Celular \xE9 mention.",
      "subheadline": "Salve a postagem que voc\xEA est\xE1 vendo no PC com a Chrome extension e re\xFAna-a no celular com o mention scrapbook.",
      "priceLabel": "Threads Saver Pro",
      "includedUpdates": "US$ 29 \xFAnicos \xB7 extens\xE3o Pro + n\xFAcleo scrapbook \xB7 reembolso em 7 dias",
      "heroNotes": [
        "Chrome extension: salve a postagem que voc\xEA est\xE1 lendo agora",
        "scrapbook: organizar men\xE7\xF5es, watchlists e searches",
        "Complemento Cloud: descoberta, pesquisa, Insights"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "https://github.com/parktaejun-dev/threads-to-obsidian",
        "productBHref": "/scrapbook"
      },
      "faqs": [
        {
          "id": "perguntas frequentes-1",
          "question": "Preciso de Pro para salvar postagens?",
          "answer": "N\xE3o. Salvar, capturar imagens, cadeias de resposta do autor e ignorar duplicatas s\xE3o todos trabalhos em Free."
        },
        {
          "id": "perguntas frequentes-2",
          "question": "Quem deve comprar Pro?",
          "answer": "Ele \xE9 adequado para pessoas que desejam controle direto sobre regras de arquivo/caminho e desejam resumos, tags e frontmatter gerados com sua pr\xF3pria chave LLM."
        },
        {
          "id": "perguntas frequentes-3",
          "question": "Ele faz resumos ou tags de IA?",
          "answer": "Sim. No Pro, voc\xEA pode conectar um endpoint compat\xEDvel com OpenAI e sua pr\xF3pria chave para gerar resumos, tags e frontmatter extra."
        },
        {
          "id": "perguntas frequentes-4",
          "question": "Como a chave Pro \xE9 entregue?",
          "answer": "Ap\xF3s a confirma\xE7\xE3o do pagamento, a chave Pro \xE9 enviada para o seu email."
        },
        {
          "id": "perguntas frequentes-5",
          "question": "Existe uma pol\xEDtica de reembolso?",
          "answer": "Solicita\xE7\xF5es de reembolso s\xE3o aceitas em at\xE9 7 dias ap\xF3s a compra."
        }
      ]
    },
    "bot": {
      "productName": "Threads Mention Scrapbook",
      "headline": "Adicione @parktaejun em uma resposta Threads e ela ser\xE1 salva.",
      "subheadline": "Transforme uma resposta p\xFAblica em um gatilho de salvamento para um scrapbook privado e, posteriormente, mova o resultado para Markdown, Obsidian ou Notion.",
      "priceLabel": "Threads to Obsidian Pro",
      "includedUpdates": "Chrome extension \xB7 pagamento \xFAnico \xB7 1 ano de atualiza\xE7\xF5es",
      "heroNotes": [
        "As respostas s\xE3o gatilhos p\xFAblicos, portanto, n\xE3o escreva notas confidenciais ali.",
        "O sistema compara o autor da resposta com a conta Threads vinculada por meio de OAuth e armazena itens por usu\xE1rio.",
        "Os itens salvos suportam exporta\xE7\xE3o Markdown e c\xF3pia de texto simples."
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "/scrapbook",
        "productBHref": "#install"
      },
      "faqs": [
        {
          "id": "perguntas frequentes-1",
          "question": "As respostas s\xE3o p\xFAblicas?",
          "answer": "Sim. As respostas atuam como gatilhos p\xFAblicos, de modo que a p\xE1gina avisa claramente os usu\xE1rios para n\xE3o escreverem notas confidenciais ali."
        },
        {
          "id": "perguntas frequentes-2",
          "question": "Um item pode ser salvo no scrapbook errado?",
          "answer": "O sistema salva somente quando a conta do autor da resposta corresponde \xE0 conta Threads vinculada ao scrapbook. Caso contr\xE1rio, o evento ser\xE1 ignorado."
        },
        {
          "id": "perguntas frequentes-3",
          "question": "E se um nome de usu\xE1rio mudar?",
          "answer": "Os usu\xE1rios podem fazer login novamente com a mesma conta Threads e manter a mesma scrapbook enquanto atualizam o nome de usu\xE1rio e as informa\xE7\xF5es de perfil mais recentes."
        },
        {
          "id": "perguntas frequentes-4",
          "question": "Com que rapidez um salvamento aparece?",
          "answer": "As men\xE7\xF5es s\xE3o pesquisadas a cada 30 a 60 segundos por padr\xE3o, com o objetivo de mostrar o salvamento em 60 segundos."
        },
        {
          "id": "perguntas frequentes-5",
          "question": "Como posso exportar o item salvo?",
          "answer": "A exporta\xE7\xE3o Markdown e a c\xF3pia de texto simples s\xE3o suportadas para que o item possa ser movido para Obsidian, Notion ou aplicativos de notas."
        }
      ]
    }
  },
  "es": {
    "obsidian": {
      "productName": "Threads Saver",
      "headline": "PC es extension. M\xF3vil es mention.",
      "subheadline": "Guarda la publicaci\xF3n que est\xE1s viendo con la Chrome extension y recop\xEDlala en el m\xF3vil con el mention scrapbook.",
      "priceLabel": "Threads Saver Pro",
      "includedUpdates": "$29 por \xFAnica vez \xB7 extensi\xF3n Pro + n\xFAcleo scrapbook \xB7 reembolso de 7 d\xEDas",
      "heroNotes": [
        "Chrome extension: guarda el post que est\xE1s leyendo ahora",
        "scrapbook: organiza menciones, watchlists y searches",
        "Complemento Cloud: Descubrimiento, B\xFAsqueda, Insights"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "https://github.com/parktaejun-dev/threads-to-obsidian",
        "productBHref": "/scrapbook"
      },
      "faqs": [
        {
          "id": "preguntas frecuentes-1",
          "question": "\xBFNecesito Pro para guardar publicaciones?",
          "answer": "No. Guardar, capturar im\xE1genes, cadenas de respuestas del autor y duplicar se saltan todo el trabajo en Free."
        },
        {
          "id": "preguntas frecuentes-2",
          "question": "\xBFQui\xE9n deber\xEDa comprar Pro?",
          "answer": "Se adapta a las personas que desean un control directo sobre las reglas de archivos/rutas y desean generar res\xFAmenes, etiquetas y texto frontal con su propia clave LLM."
        },
        {
          "id": "preguntas frecuentes-3",
          "question": "\xBFHace res\xFAmenes o etiquetado de IA?",
          "answer": "S\xED. En Pro, puede conectar un punto final compatible con OpenAI y su propia clave para generar res\xFAmenes, etiquetas y contenido adicional."
        },
        {
          "id": "preguntas frecuentes-4",
          "question": "\xBFC\xF3mo se entrega la clave Pro?",
          "answer": "Una vez confirmado el pago, se env\xEDa la clave Pro a su correo electr\xF3nico."
        },
        {
          "id": "preguntas frecuentes-5",
          "question": "\xBFExiste una pol\xEDtica de reembolso?",
          "answer": "Las solicitudes de reembolso se aceptan dentro de los 7 d\xEDas posteriores a la compra."
        }
      ]
    },
    "bot": {
      "productName": "Threads Mention Scrapbook",
      "headline": "Agregue @parktaejun en una respuesta Threads y se guardar\xE1.",
      "subheadline": "Convierta una respuesta p\xFAblica en un activador de guardado para un scrapbook privado y luego mueva el resultado a Markdown, Obsidian o Notion m\xE1s tarde.",
      "priceLabel": "Threads to Obsidian Pro",
      "includedUpdates": "Chrome extension \xB7 pago \xFAnico \xB7 1 a\xF1o de actualizaciones",
      "heroNotes": [
        "Las respuestas son activadores p\xFAblicos, as\xED que no escriba notas confidenciales all\xED.",
        "El sistema compara el autor de la respuesta con la cuenta Threads vinculada a trav\xE9s de OAuth y almacena elementos por usuario.",
        "Los elementos guardados admiten exportaci\xF3n Markdown y copia de texto sin formato."
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "/scrapbook",
        "productBHref": "#install"
      },
      "faqs": [
        {
          "id": "preguntas frecuentes-1",
          "question": "\xBFLas respuestas son p\xFAblicas?",
          "answer": "S\xED. Las respuestas act\xFAan como disparadores p\xFAblicos, por lo que la p\xE1gina advierte claramente a los usuarios que no escriban notas confidenciales all\xED."
        },
        {
          "id": "preguntas frecuentes-2",
          "question": "\xBFSe puede guardar un elemento en el scrapbook incorrecto?",
          "answer": "El sistema guarda solo cuando la cuenta del autor de la respuesta coincide con la cuenta Threads vinculada a scrapbook. De lo contrario, el evento se ignora."
        },
        {
          "id": "preguntas frecuentes-3",
          "question": "\xBFQu\xE9 pasa si cambia un nombre de usuario?",
          "answer": "Los usuarios pueden iniciar sesi\xF3n nuevamente con la misma cuenta Threads y mantener la misma scrapbook mientras actualizan el nombre de usuario y la informaci\xF3n de perfil m\xE1s recientes."
        },
        {
          "id": "preguntas frecuentes-4",
          "question": "\xBFQu\xE9 tan r\xE1pido aparece un guardado?",
          "answer": "Las menciones se sondean cada 30 a 60 segundos de forma predeterminada, con el objetivo de mostrar el guardado en 60 segundos."
        },
        {
          "id": "preguntas frecuentes-5",
          "question": "\xBFC\xF3mo puedo exportar el elemento guardado?",
          "answer": "Se admiten la exportaci\xF3n Markdown y la copia de texto sin formato para que el elemento pueda moverse a Obsidian, Notion o aplicaciones de notas."
        }
      ]
    }
  },
  "zh-TW": {
    "obsidian": {
      "productName": "ZZ\u8853\u8A9E0ZZ",
      "headline": "\u96FB\u8166\u7528 extension\u3002\u624B\u6A5F\u7528 mention\u3002",
      "subheadline": "\u73FE\u5728\u89C0\u770B\u7684\u8CBC\u6587\u7528 Chrome extension \u5132\u5B58\uFF0C\u624B\u6A5F\u4E0A\u5247\u7528 mention scrapbook \u6536\u96C6\u3002",
      "priceLabel": "Threads Saver Pro",
      "includedUpdates": "\u4E00\u6B21\u6027 29 \u7F8E\u5143 \xB7 \u64F4\u5145 Pro + scrapbook \u6838\u5FC3 \xB7 7 \u5929\u9000\u6B3E",
      "heroNotes": [
        "Chrome extension\uFF1A\u5132\u5B58\u60A8\u6B63\u5728\u95B1\u8B80\u7684\u5E16\u5B50",
        "scrapbook\uFF1A\u7D44\u7E54\u63D0\u53CA\u3001watchlists \u548C searches",
        "Cloud \u9644\u52A0\u5143\u4EF6\uFF1A\u767C\u73FE\u3001\u641C\u5C0B\u3001Insights"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "https://github.com/parktaejun-dev/threads-to-obsidian",
        "productBHref": "/scrapbook"
      },
      "faqs": [
        {
          "id": "\u5E38\u898B\u554F\u984C-1",
          "question": "\u6211\u9700\u8981 Pro \u4F86\u4FDD\u5B58\u8CBC\u6587\u55CE\uFF1F",
          "answer": "\u4E0D\u3002\u4FDD\u5B58\u3001\u5F71\u50CF\u64F7\u53D6\u3001\u4F5C\u8005\u56DE\u61C9\u93C8\u4EE5\u53CA\u91CD\u8907\u8DF3\u904E Free \u4E2D\u7684\u6240\u6709\u5DE5\u4F5C\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C2",
          "question": "\u8AB0\u8A72\u8CFC\u8CB7 Pro\uFF1F",
          "answer": "\u5B83\u9069\u5408\u60F3\u8981\u76F4\u63A5\u63A7\u88FD\u6A94\u6848/\u8DEF\u5F91\u898F\u5247\u4E26\u5E0C\u671B\u4F7F\u7528\u81EA\u5DF1\u7684 LLM \u91D1\u9470\u7522\u751F\u6458\u8981\u3001\u6A19\u7C64\u548C frontmatter \u7684\u4EBA\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C3",
          "question": "\u5B83\u6703\u9032\u884C\u4EBA\u5DE5\u667A\u6167\u6458\u8981\u6216\u6A19\u8A18\u55CE\uFF1F",
          "answer": "\u662F\u7684\u3002\u5728 Pro \u4E2D\uFF0C\u60A8\u53EF\u4EE5\u9023\u63A5 OpenAI \u76F8\u5BB9\u7AEF\u9EDE\u548C\u60A8\u81EA\u5DF1\u7684\u91D1\u9470\u4F86\u7522\u751F\u6458\u8981\u3001\u6A19\u7C64\u548C\u984D\u5916\u7684 frontmatter\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C4",
          "question": "Pro \u5BC6\u9470\u662F\u5982\u4F55\u4EA4\u4ED8\u7684\uFF1F",
          "answer": "\u78BA\u8A8D\u4ED8\u6B3E\u5F8C\uFF0CPro \u91D1\u9470\u5C07\u767C\u9001\u5230\u60A8\u7684\u96FB\u5B50\u90F5\u4EF6\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C5",
          "question": "\u6709\u9000\u8CBB\u653F\u7B56\u55CE\uFF1F",
          "answer": "\u8CFC\u8CB7\u5F8C 7 \u5929\u5167\u63A5\u53D7\u9000\u6B3E\u8ACB\u6C42\u3002"
        }
      ]
    },
    "bot": {
      "productName": "ZZ\u8853\u8A9E0ZZ",
      "headline": "\u5728 Threads \u56DE\u8986\u4E2D\u52A0\u5165 @parktaejun \u5373\u53EF\u5132\u5B58\u3002",
      "subheadline": "\u5C07\u516C\u958B\u56DE\u61C9\u8F49\u63DB\u70BA\u79C1\u4EBA scrapbook \u7684\u5132\u5B58\u89F8\u767C\u5668\uFF0C\u7136\u5F8C\u5C07\u7D50\u679C\u79FB\u81F3 Markdown\u3001Obsidian \u6216 Notion \u4E2D\u3002",
      "priceLabel": "Threads to Obsidian Pro",
      "includedUpdates": "Chrome extension \xB7 \u4E00\u6B21\u6027\u4ED8\u6B3E \xB7 1 \u5E74\u66F4\u65B0",
      "heroNotes": [
        "\u56DE\u5FA9\u662F\u516C\u958B\u89F8\u767C\u56E0\u7D20\uFF0C\u56E0\u6B64\u8ACB\u52FF\u5728\u5176\u4E2D\u5BEB\u654F\u611F\u8A3B\u91CB\u3002",
        "\u7CFB\u7D71\u5C07\u56DE\u5FA9\u4F5C\u8005\u8207\u900F\u904E OAuth \u9023\u7D50\u7684 Threads \u5E33\u6236\u9032\u884C\u5339\u914D\uFF0C\u4E26\u5132\u5B58\u6BCF\u500B\u4F7F\u7528\u8005\u7684\u9805\u76EE\u3002",
        "\u5132\u5B58\u7684\u9805\u76EE\u652F\u63F4 Markdown \u532F\u51FA\u548C\u7D14\u6587\u5B57\u8907\u88FD\u3002"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "/scrapbook",
        "productBHref": "#install"
      },
      "faqs": [
        {
          "id": "\u5E38\u898B\u554F\u984C-1",
          "question": "\u56DE\u8986\u662F\u5426\u516C\u958B\uFF1F",
          "answer": "\u662F\u7684\u3002\u56DE\u5FA9\u5145\u7576\u516C\u5171\u89F8\u767C\u5668\uFF0C\u56E0\u6B64\u8A72\u9801\u9762\u660E\u78BA\u8B66\u544A\u7528\u6236\u4E0D\u8981\u5728\u90A3\u88E1\u5BEB\u654F\u611F\u8A3B\u91CB\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C2",
          "question": "\u9805\u76EE\u662F\u5426\u53EF\u4EE5\u5132\u5B58\u5230\u932F\u8AA4\u7684 scrapbook \u4E2D\uFF1F",
          "answer": "\u53EA\u6709\u7576\u56DE\u8986\u4F5C\u8005\u5E33\u6236\u8207\u9023\u7D50\u81F3 scrapbook \u7684 Threads \u5E33\u6236\u76F8\u7B26\u6642\uFF0C\u7CFB\u7D71\u624D\u6703\u5132\u5B58\u3002\u5426\u5247\u8A72\u4E8B\u4EF6\u5C07\u88AB\u5FFD\u7565\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C3",
          "question": "\u5982\u679C\u4F7F\u7528\u8005\u540D\u7A31\u767C\u751F\u8B8A\u5316\u600E\u9EBC\u8FA6\uFF1F",
          "answer": "\u7528\u6236\u53EF\u4EE5\u4F7F\u7528\u76F8\u540C\u7684 Threads \u5E33\u6236\u518D\u6B21\u767B\u9304\uFF0C\u4E26\u4FDD\u7559\u76F8\u540C\u7684 scrapbook\uFF0C\u540C\u6642\u5237\u65B0\u6700\u65B0\u7684\u7528\u6236\u540D\u548C\u500B\u4EBA\u8CC7\u6599\u8CC7\u8A0A\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C4",
          "question": "\u4FDD\u5B58\u51FA\u73FE\u7684\u901F\u5EA6\u6709\u591A\u5FEB\uFF1F",
          "answer": "\u9810\u8A2D\u60C5\u6CC1\u4E0B\uFF0C\u6BCF 30 \u5230 60 \u79D2\u8F2A\u8A62\u4E00\u6B21\u63D0\u53CA\uFF0C\u76EE\u6A19\u662F\u5728 60 \u79D2\u5167\u986F\u793A\u5132\u5B58\u5167\u5BB9\u3002"
        },
        {
          "id": "\u5E38\u898B\u554F\u984C5",
          "question": "\u5982\u4F55\u532F\u51FA\u5DF2\u5132\u5B58\u7684\u9805\u76EE\uFF1F",
          "answer": "\u652F\u63F4 Markdown \u532F\u51FA\u548C\u7D14\u6587\u5B57\u8907\u88FD\uFF0C\u56E0\u6B64\u8A72\u5C08\u6848\u53EF\u4EE5\u79FB\u52D5\u5230 Obsidian\u3001Notion \u6216\u7B46\u8A18\u61C9\u7528\u7A0B\u5F0F\u4E2D\u3002"
        }
      ]
    }
  },
  "vi": {
    "obsidian": {
      "productName": "Threads Saver",
      "headline": "PC d\xF9ng extension. Mobile d\xF9ng mention.",
      "subheadline": "L\u01B0u b\xE0i vi\u1EBFt b\u1EA1n \u0111ang xem b\u1EB1ng Chrome extension v\xE0 thu th\u1EADp n\xF3 tr\xEAn thi\u1EBFt b\u1ECB di \u0111\u1ED9ng b\u1EB1ng mention scrapbook.",
      "priceLabel": "Threads Saver Pro",
      "includedUpdates": "$29 m\u1ED9t l\u1EA7n \xB7 ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng Pro + l\xF5i scrapbook \xB7 Ho\xE0n ti\u1EC1n trong 7 ng\xE0y",
      "heroNotes": [
        "Chrome extension: l\u01B0u b\xE0i vi\u1EBFt b\u1EA1n \u0111ang \u0111\u1ECDc",
        "scrapbook: s\u1EAFp x\u1EBFp c\xE1c \u0111\u1EC1 c\u1EADp, watchlists v\xE0 searches",
        "Ti\u1EC7n \xEDch b\u1ED5 sung Cloud: Kh\xE1m ph\xE1, T\xECm ki\u1EBFm, Insights"
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "https://github.com/parktaejun-dev/threads-to-obsidian",
        "productBHref": "/scrapbook"
      },
      "faqs": [
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-1",
          "question": "T\xF4i c\xF3 c\u1EA7n Pro \u0111\u1EC3 l\u01B0u b\xE0i vi\u1EBFt kh\xF4ng?",
          "answer": "Kh\xF4ng. Vi\u1EC7c l\u01B0u, ch\u1EE5p \u1EA3nh, chu\u1ED7i ph\u1EA3n h\u1ED3i c\u1EE7a t\xE1c gi\u1EA3 v\xE0 b\u1ECF qua b\u1EA3n sao \u0111\u1EC1u ho\u1EA1t \u0111\u1ED9ng trong Free."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-2",
          "question": "Ai n\xEAn mua Pro?",
          "answer": "N\xF3 ph\xF9 h\u1EE3p v\u1EDBi nh\u1EEFng ng\u01B0\u1EDDi mu\u1ED1n ki\u1EC3m so\xE1t tr\u1EF1c ti\u1EBFp c\xE1c quy t\u1EAFc t\u1EC7p/\u0111\u01B0\u1EDDng d\u1EABn v\xE0 mu\u1ED1n c\xE1c b\u1EA3n t\xF3m t\u1EAFt, th\u1EBB v\xE0 n\u1ED9i dung ch\xEDnh \u0111\u01B0\u1EE3c t\u1EA1o b\u1EB1ng kh\xF3a LLM c\u1EE7a ri\xEAng h\u1ECD."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-3",
          "question": "N\xF3 c\xF3 th\u1EF1c hi\u1EC7n t\xF3m t\u1EAFt ho\u1EB7c g\u1EAFn th\u1EBB AI kh\xF4ng?",
          "answer": "V\xE2ng. Trong Pro, b\u1EA1n c\xF3 th\u1EC3 k\u1EBFt n\u1ED1i \u0111i\u1EC3m cu\u1ED1i t\u01B0\u01A1ng th\xEDch v\u1EDBi OpenAI v\xE0 kh\xF3a ri\xEAng c\u1EE7a b\u1EA1n \u0111\u1EC3 t\u1EA1o c\xE1c b\u1EA3n t\xF3m t\u1EAFt, th\u1EBB v\xE0 n\u1ED9i dung ch\xEDnh b\u1ED5 sung."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-4",
          "question": "Kh\xF3a Pro \u0111\u01B0\u1EE3c ph\xE2n ph\u1ED1i nh\u01B0 th\u1EBF n\xE0o?",
          "answer": "Sau khi thanh to\xE1n \u0111\u01B0\u1EE3c x\xE1c nh\u1EADn, kh\xF3a Pro s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn email c\u1EE7a b\u1EA1n."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-5",
          "question": "C\xF3 ch\xEDnh s\xE1ch ho\xE0n ti\u1EC1n kh\xF4ng?",
          "answer": "Y\xEAu c\u1EA7u ho\xE0n ti\u1EC1n \u0111\u01B0\u1EE3c ch\u1EA5p nh\u1EADn trong v\xF2ng 7 ng\xE0y sau khi mua."
        }
      ]
    },
    "bot": {
      "productName": "Threads Mention Scrapbook",
      "headline": "Th\xEAm @parktaejun v\xE0o c\xE2u tr\u1EA3 l\u1EDDi Threads v\xE0 n\xF3 s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u.",
      "subheadline": "Bi\u1EBFn c\xE2u tr\u1EA3 l\u1EDDi c\xF4ng khai th\xE0nh tr\xECnh k\xEDch ho\u1EA1t l\u01B0u cho scrapbook ri\xEAng t\u01B0, sau \u0111\xF3 chuy\u1EC3n k\u1EBFt qu\u1EA3 sang Markdown, Obsidian ho\u1EB7c Notion sau.",
      "priceLabel": "Threads to Obsidian Pro",
      "includedUpdates": "Chrome extension \xB7 thanh to\xE1n m\u1ED9t l\u1EA7n \xB7 1 n\u0103m c\u1EADp nh\u1EADt",
      "heroNotes": [
        "C\xE1c c\xE2u tr\u1EA3 l\u1EDDi \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t c\xF4ng khai, v\xEC v\u1EADy \u0111\u1EEBng vi\u1EBFt nh\u1EEFng ghi ch\xFA nh\u1EA1y c\u1EA3m \u1EDF \u0111\xF3.",
        "H\u1EC7 th\u1ED1ng \u0111\u1ED1i chi\u1EBFu t\xE1c gi\u1EA3 tr\u1EA3 l\u1EDDi v\u1EDBi t\xE0i kho\u1EA3n Threads \u0111\u01B0\u1EE3c li\xEAn k\u1EBFt th\xF4ng qua OAuth v\xE0 l\u01B0u tr\u1EEF c\xE1c m\u1EE5c cho m\u1ED7i ng\u01B0\u1EDDi d\xF9ng.",
        "C\xE1c m\u1EE5c \u0111\xE3 l\u01B0u h\u1ED7 tr\u1EE3 xu\u1EA5t Markdown v\xE0 sao ch\xE9p v\u0103n b\u1EA3n thu\u1EA7n t\xFAy."
      ],
      "links": {
        "topbarSecondaryHref": "/scrapbook",
        "topbarPrimaryHref": "/checkout",
        "heroSecondaryHref": "/scrapbook",
        "heroPrimaryHref": "/checkout",
        "priceCardHref": "/checkout",
        "productAHref": "/scrapbook",
        "productBHref": "#install"
      },
      "faqs": [
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-1",
          "question": "C\xE1c c\xE2u tr\u1EA3 l\u1EDDi c\xF3 \u0111\u01B0\u1EE3c c\xF4ng khai kh\xF4ng?",
          "answer": "V\xE2ng. C\xE1c c\xE2u tr\u1EA3 l\u1EDDi \u0111\xF3ng vai tr\xF2 l\xE0 tr\xECnh k\xEDch ho\u1EA1t c\xF4ng khai, v\xEC v\u1EADy trang n\xE0y c\u1EA3nh b\xE1o r\xF5 r\xE0ng ng\u01B0\u1EDDi d\xF9ng kh\xF4ng vi\u1EBFt ghi ch\xFA nh\u1EA1y c\u1EA3m \u1EDF \u0111\xF3."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-2",
          "question": "M\u1ED9t m\u1EE5c c\xF3 th\u1EC3 \u0111\u01B0\u1EE3c l\u01B0u v\xE0o scrapbook sai kh\xF4ng?",
          "answer": "H\u1EC7 th\u1ED1ng ch\u1EC9 l\u01B0u khi t\xE0i kho\u1EA3n t\xE1c gi\u1EA3 tr\u1EA3 l\u1EDDi kh\u1EDBp v\u1EDBi t\xE0i kho\u1EA3n Threads \u0111\u01B0\u1EE3c li\xEAn k\u1EBFt v\u1EDBi scrapbook. N\u1EBFu kh\xF4ng th\xEC s\u1EF1 ki\u1EC7n s\u1EBD b\u1ECB b\u1ECF qua."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-3",
          "question": "N\u1EBFu t\xEAn ng\u01B0\u1EDDi d\xF9ng thay \u0111\u1ED5i th\xEC sao?",
          "answer": "Ng\u01B0\u1EDDi d\xF9ng c\xF3 th\u1EC3 \u0111\u0103ng nh\u1EADp l\u1EA1i b\u1EB1ng c\xF9ng m\u1ED9t t\xE0i kho\u1EA3n Threads v\xE0 gi\u1EEF nguy\xEAn scrapbook trong khi l\xE0m m\u1EDBi th\xF4ng tin h\u1ED3 s\u01A1 v\xE0 t\xEAn ng\u01B0\u1EDDi d\xF9ng m\u1EDBi nh\u1EA5t."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-4",
          "question": "T\u1ED1c \u0111\u1ED9 l\u01B0u xu\u1EA5t hi\u1EC7n nhanh nh\u01B0 th\u1EBF n\xE0o?",
          "answer": "Theo m\u1EB7c \u0111\u1ECBnh, c\xE1c \u0111\u1EC1 c\u1EADp \u0111\u01B0\u1EE3c th\u0103m d\xF2 sau m\u1ED7i 30 \u0111\u1EBFn 60 gi\xE2y, v\u1EDBi m\u1EE5c ti\xEAu hi\u1EC3n th\u1ECB l\u01B0\u1EE3t l\u01B0u trong v\xF2ng 60 gi\xE2y."
        },
        {
          "id": "c\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p-5",
          "question": "L\xE0m c\xE1ch n\xE0o t\xF4i c\xF3 th\u1EC3 xu\u1EA5t m\u1EE5c \u0111\xE3 l\u01B0u?",
          "answer": "H\u1ED7 tr\u1EE3 xu\u1EA5t Markdown v\xE0 sao ch\xE9p v\u0103n b\u1EA3n thu\u1EA7n t\xFAy \u0111\u1EC3 m\u1EE5c c\xF3 th\u1EC3 di chuy\u1EC3n v\xE0o c\xE1c \u1EE9ng d\u1EE5ng Obsidian, Notion ho\u1EB7c ghi ch\xFA."
        }
      ]
    }
  }
};
var adminMessageLocales = {
  "ja": {
    "adminH1": "\u652F\u6255\u3044\u3001\u767A\u884C\u3001\u914D\u9001",
    "adminLead": "\u53D7\u3051\u5165\u308C\u3089\u308C\u305F\u652F\u6255\u3044\u65B9\u6CD5\u306E\u7BA1\u7406\u3001\u8CFC\u5165\u30EA\u30AF\u30A8\u30B9\u30C8\u306E\u78BA\u8A8D\u3001\u7F72\u540D\u4ED8\u304D Pro \u30AD\u30FC\u306E\u767A\u884C\u3001\u624B\u52D5\u96FB\u5B50\u30E1\u30FC\u30EB\u914D\u4FE1\u306E\u76E3\u67FB\u53EF\u80FD\u306A\u5C65\u6B74\u306E\u4FDD\u5B58\u3092\u884C\u3044\u307E\u3059\u3002",
    "tokenLabel": "\u7BA1\u7406\u8005\u30C8\u30FC\u30AF\u30F3",
    "tokenApply": "\u7533\u3057\u8FBC\u3080",
    "tokenStatusDefault": "/api/admin/* \u306B\u5FC5\u8981\u306A\u30C8\u30FC\u30AF\u30F3",
    "statPending": "\u672A\u6C7A\u6CE8\u6587",
    "statPaid": "\u652F\u6255\u3044\u6E08\u307F\u3001\u30AD\u30FC\u5F85\u3061",
    "statIssued": "\u767A\u884C\u3055\u308C\u305F\u30AD\u30FC",
    "statMethods": "\u6709\u52B9\u306A\u652F\u6255\u3044\u65B9\u6CD5",
    "statWebhookProcessed": "Webhook \u304C\u51E6\u7406\u3055\u308C\u307E\u3057\u305F",
    "statWebhookIgnored": "Webhook \u304C\u7121\u8996\u3055\u308C\u307E\u3057\u305F",
    "statWebhookRejected": "Webhook \u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F",
    "statWebhookDuplicates": "Webhook \u306E\u518D\u8A66\u884C\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F",
    "paymentMethodsTitle": "\u652F\u6255\u3044\u65B9\u6CD5",
    "paymentMethodsCopy": "\u30D1\u30D6\u30EA\u30C3\u30AF \u30E9\u30F3\u30C7\u30A3\u30F3\u30B0 \u30DA\u30FC\u30B8\u306F\u3001\u3053\u3053\u304B\u3089\u6709\u52B9\u306A\u30E1\u30BD\u30C3\u30C9\u306E\u307F\u3092\u8AAD\u307F\u53D6\u308A\u307E\u3059\u3002",
    "reloadBtn": "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3092\u30EA\u30ED\u30FC\u30C9\u3059\u308B",
    "colName": "\u540D\u524D",
    "colSummary": "\u6982\u8981",
    "colAction": "\u30A2\u30AF\u30B7\u30E7\u30F3",
    "colEnabled": "\u6709\u52B9",
    "colActions": "\u30A2\u30AF\u30B7\u30E7\u30F3",
    "methodNameLabel": "\u30E1\u30BD\u30C3\u30C9\u540D",
    "methodSortLabel": "\u4E26\u3079\u66FF\u3048\u9806\u5E8F",
    "methodSummaryLabel": "\u6982\u8981",
    "methodInstructionsLabel": "\u6307\u793A",
    "methodCtaLabel": "CTA\u30E9\u30D9\u30EB",
    "methodActionUrlLabel": "\u5916\u90E8\u30A2\u30AF\u30B7\u30E7\u30F3 URL",
    "methodEnabledLabel": "\u6709\u52B9",
    "addMethodBtn": "\u652F\u6255\u3044\u65B9\u6CD5\u3092\u8FFD\u52A0\u3059\u308B",
    "ordersTitle": "\u8CFC\u5165\u30EA\u30AF\u30A8\u30B9\u30C8",
    "ordersCopy": "\u652F\u6255\u3044\u3092\u30DE\u30FC\u30AF\u3057\u3001\u30AD\u30FC\u3092\u767A\u884C\u3057\u3001\u96FB\u5B50\u30E1\u30FC\u30EB\u306E\u4E0B\u66F8\u304D\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3059\u3002",
    "colBuyer": "\u8CFC\u5165\u8005",
    "colMethod": "\u65B9\u6CD5",
    "colStatus": "\u30B9\u30C6\u30FC\u30BF\u30B9",
    "colCreated": "\u4F5C\u6210\u3055\u308C\u307E\u3057\u305F",
    "licensesTitle": "\u767A\u884C\u3055\u308C\u305F\u30AD\u30FC",
    "licensesCopy": "\u751F\u6210\u3055\u308C\u305F\u3059\u3079\u3066\u306E\u30AD\u30FC\u306F\u3001\u30D7\u30EC\u30D3\u30E5\u30FC\u3001\u30DB\u30EB\u30C0\u30FC\u3001\u30B9\u30C6\u30FC\u30BF\u30B9\u3068\u3068\u3082\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    "colHolder": "\u30DB\u30EB\u30C0\u30FC",
    "colIssuedAt": "\u767A\u884C\u65E5",
    "colPreview": "\u30D7\u30EC\u30D3\u30E5\u30FC",
    "emailDraftTitle": "\u30E1\u30FC\u30EB\u914D\u4FE1\u306E\u4E0B\u66F8\u304D",
    "emailDraftCopy": "\u96FB\u5B50\u30E1\u30FC\u30EB\u306F\u30B7\u30F3\u30D7\u30EB\u3067\u76E3\u67FB\u53EF\u80FD\u3067\u3001\u30AA\u30D5\u30E9\u30A4\u30F3 \u30AD\u30FC\u306E\u8CBC\u308A\u4ED8\u3051\u306B\u9069\u3057\u3066\u3044\u308B\u305F\u3081\u3001\u3053\u306E\u88FD\u54C1\u306B\u9069\u3057\u3066\u3044\u307E\u3059\u3002",
    "emailPreviewLabel": "\u30D7\u30EC\u30D3\u30E5\u30FC",
    "copyEmailBtn": "\u30E1\u30FC\u30EB\u306E\u4E0B\u66F8\u304D\u3092\u30B3\u30D4\u30FC\u3059\u308B",
    "emailStatusDefault": "\u767A\u884C\u3055\u308C\u305F\u6CE8\u6587\u3092\u9078\u629E\u3057\u3066\u3001\u914D\u9001\u30C6\u30AD\u30B9\u30C8\u3092\u30D7\u30EC\u30D3\u30E5\u30FC\u3057\u307E\u3059\u3002",
    "historyTitle": "\u6B74\u53F2",
    "historyCopy": "\u6700\u8FD1\u306E\u30AD\u30FC\u3001\u652F\u6255\u3044\u3001Webhook \u30A4\u30D9\u30F3\u30C8 (\u62D2\u5426/\u91CD\u8907/\u7121\u8996\u3055\u308C\u305F\u30B1\u30FC\u30B9\u3092\u542B\u3080)\u3002",
    "filterKindLabel": "\u7A2E\u985E",
    "filterProviderLabel": "Provider",
    "filterReasonLabel": "\u7406\u7531",
    "allOption": "\u3059\u3079\u3066",
    "colWhen": "\u3044\u3064",
    "colEventKind": "\u30A4\u30D9\u30F3\u30C8\u306E\u7A2E\u985E",
    "colProvider": "Provider",
    "colEventId": "\u30A4\u30D9\u30F3\u30C8ID",
    "colReason": "\u7406\u7531",
    "colMessage": "\u30E1\u30C3\u30BB\u30FC\u30B8",
    "langKo": "\uD55C\uAD6D\uC5B4",
    "langEn": "\u82F1\u8A9E",
    "dashboardLoaded": "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u304C\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3057\u305F",
    "tokenSaving": "\u30ED\u30FC\u30AB\u30EB\u306B\u4FDD\u5B58\u3055\u308C\u305F\u30C8\u30FC\u30AF\u30F3\u3002\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059...",
    "tokenCleared": "\u30C8\u30FC\u30AF\u30F3\u304C\u30AF\u30EA\u30A2\u3055\u308C\u307E\u3057\u305F",
    "dashboardError": "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F",
    "noHistoryMatch": "\u9078\u629E\u3057\u305F\u30D5\u30A3\u30EB\u30BF\u30FC\u306B\u4E00\u81F4\u3059\u308B\u30A4\u30D9\u30F3\u30C8\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "btnEnable": "\u6709\u52B9\u306B\u3059\u308B",
    "btnDisable": "\u7121\u52B9\u306B\u3059\u308B",
    "btnMarkPaid": "\u652F\u6255\u3044\u6E08\u307F\u306E\u30DE\u30FC\u30AF\u3092\u4ED8\u3051\u308B",
    "btnIssueKey": "\u30AD\u30FC\u306E\u767A\u884C",
    "btnPreviewEmail": "\u30E1\u30FC\u30EB\u306E\u30D7\u30EC\u30D3\u30E5\u30FC",
    "btnReissueKey": "\u518D\u767A\u884C",
    "btnSendEmail": "\u96FB\u5B50\u30E1\u30FC\u30EB\u3092\u9001\u4FE1\u3059\u308B",
    "btnRevoke": "\u53D6\u308A\u6D88\u3057",
    "noActions": "\u30A2\u30AF\u30B7\u30E7\u30F3\u306F\u3042\u308A\u307E\u305B\u3093",
    "pillEnabled": "\u6709\u52B9",
    "pillDisabled": "\u7121\u52B9\u5316\u3055\u308C\u305F",
    "emailDraftReady": "{email} \u306E\u30C9\u30E9\u30D5\u30C8\u6E96\u5099\u5B8C\u4E86",
    "keyIssued": "{email} \u306E\u767A\u884C\u3055\u308C\u305F\u30AD\u30FC",
    "keyReissued": "{email} \u306E\u30AD\u30FC\u306E\u518D\u767A\u884C",
    "emailSent": "{email} \u306B\u96FB\u5B50\u30E1\u30FC\u30EB\u304C\u9001\u4FE1\u3055\u308C\u307E\u3057\u305F",
    "emailSendError": "\u96FB\u5B50\u30E1\u30FC\u30EB\u306E\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F: {error}",
    "nothingToCopy": "\u307E\u3060\u30B3\u30D4\u30FC\u3059\u308B\u3082\u306E\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "emailCopied": "\u96FB\u5B50\u30E1\u30FC\u30EB\u306E\u4E0B\u66F8\u304D\u304C\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3055\u308C\u307E\u3057\u305F\u3002",
    "requestFailed": "\u7BA1\u7406\u8005\u306E\u30EA\u30AF\u30A8\u30B9\u30C8\u306F\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
    "revenueTitle": "\u53CE\u76CA",
    "revenueCopy": "\u5B8C\u4E86\u3057\u305F\u652F\u6255\u3044\u304B\u3089\u63A8\u5B9A\u3055\u308C\u307E\u3059\u3002\u5B9F\u969B\u306E\u53D7\u3051\u53D6\u308A\u91D1\u984D\u3068\u306F\u7570\u306A\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
    "revenueEstimate": "\u63A8\u5B9A\u53CE\u76CA",
    "revenueTotalOrders": "\u7DCF\u6CE8\u6587\u6570",
    "revenuePaid": "\u6709\u6599",
    "revenueIssued": "\u767A\u884C\u3055\u308C\u305F\u30AD\u30FC",
    "revenueRevoked": "\u53D6\u308A\u6D88\u3055\u308C\u305F\u30AD\u30FC",
    "revenueReadyToSend": "\u914D\u9054\u5F85\u3061",
    "revenueSent": "\u7D0D\u54C1\u6E08\u307F",
    "revenueByMethod": "\u652F\u6255\u3044\u65B9\u6CD5\u5225",
    "revenueByMonth": "\u6BCE\u6708\u306E\u3054\u6CE8\u6587",
    "colOrders": "\u6CE8\u6587",
    "colPaid": "\u6709\u6599",
    "colIssued": "\u767A\u884C\u6E08\u307F",
    "mailerOn": "\u81EA\u52D5\u30E1\u30FC\u30EB\u914D\u4FE1\uFF1AON",
    "mailerOff": "\u81EA\u52D5\u30E1\u30FC\u30EB\u914D\u4FE1\uFF1AOFF\uFF08\u624B\u52D5\u914D\u4FE1\u5FC5\u9808\uFF09",
    "statDeliveryReady": "\u914D\u9054\u5F85\u3061",
    "statDeliverySent": "\u7D0D\u54C1\u6E08\u307F"
  },
  "pt-BR": {
    "adminH1": "Pagamentos, emiss\xE3o e entrega",
    "adminLead": "Gerencie m\xE9todos de pagamento aceitos, revise solicita\xE7\xF5es de compra, emita chaves Pro assinadas e mantenha um hist\xF3rico audit\xE1vel para entrega manual de e-mails.",
    "tokenLabel": "Token de administrador",
    "tokenApply": "Aplicar",
    "tokenStatusDefault": "Token necess\xE1rio para /api/admin/*",
    "statPending": "Pedidos pendentes",
    "statPaid": "Pago, aguardando chave",
    "statIssued": "Chaves emitidas",
    "statMethods": "M\xE9todos de pagamento ativos",
    "statWebhookProcessed": "Webhook processado",
    "statWebhookIgnored": "Webhook ignorado",
    "statWebhookRejected": "Webhook rejeitado",
    "statWebhookDuplicates": "Novas tentativas de webhook detectadas",
    "paymentMethodsTitle": "M\xE9todos de pagamento",
    "paymentMethodsCopy": "A p\xE1gina de destino p\xFAblica l\xEA apenas m\xE9todos habilitados daqui.",
    "reloadBtn": "Recarregar painel",
    "colName": "Nome",
    "colSummary": "Resumo",
    "colAction": "A\xE7\xE3o",
    "colEnabled": "Habilitado",
    "colActions": "A\xE7\xF5es",
    "methodNameLabel": "Nome do m\xE9todo",
    "methodSortLabel": "Ordem de classifica\xE7\xE3o",
    "methodSummaryLabel": "Resumo",
    "methodInstructionsLabel": "Instru\xE7\xF5es",
    "methodCtaLabel": "Etiqueta de CTA",
    "methodActionUrlLabel": "A\xE7\xE3o externa URL",
    "methodEnabledLabel": "Habilitado",
    "addMethodBtn": "Adicionar forma de pagamento",
    "ordersTitle": "Solicita\xE7\xF5es de compra",
    "ordersCopy": "Marque o pagamento, emita uma chave e copie o rascunho do e-mail.",
    "colBuyer": "Comprador",
    "colMethod": "M\xE9todo",
    "colStatus": "Estado",
    "colCreated": "Criado",
    "licensesTitle": "Chaves emitidas",
    "licensesCopy": "Cada chave gerada \xE9 armazenada com visualiza\xE7\xE3o, titular e status.",
    "colHolder": "Suporte",
    "colIssuedAt": "Emitido em",
    "colPreview": "Visualiza\xE7\xE3o",
    "emailDraftTitle": "Rascunho de entrega de e-mail",
    "emailDraftCopy": "O e-mail funciona bem para este produto porque \xE9 simples, audit\xE1vel e cabe em chaves offline coladas.",
    "emailPreviewLabel": "Visualiza\xE7\xE3o",
    "copyEmailBtn": "Copiar rascunho de e-mail",
    "emailStatusDefault": "Selecione um pedido emitido para visualizar o texto de entrega.",
    "historyTitle": "Hist\xF3ria",
    "historyCopy": "Eventos recentes de chave, pagamento e webhook (incluindo casos rejeitados/duplicados/ignorados).",
    "filterKindLabel": "Gentil",
    "filterProviderLabel": "Provider",
    "filterReasonLabel": "Raz\xE3o",
    "allOption": "Todos",
    "colWhen": "Quando",
    "colEventKind": "Tipo de evento",
    "colProvider": "Provider",
    "colEventId": "ID do evento",
    "colReason": "Raz\xE3o",
    "colMessage": "Mensagem",
    "langKo": "\uD55C\uAD6D\uC5B4",
    "langEn": "Ingl\xEAs",
    "dashboardLoaded": "Painel carregado",
    "tokenSaving": "Token salvo localmente. Carregando painel...",
    "tokenCleared": "Token limpo",
    "dashboardError": "N\xE3o foi poss\xEDvel carregar o painel",
    "noHistoryMatch": "Nenhum evento corresponde aos filtros selecionados.",
    "btnEnable": "Habilitar",
    "btnDisable": "Desativar",
    "btnMarkPaid": "Marcar como pago",
    "btnIssueKey": "Chave do problema",
    "btnPreviewEmail": "Visualizar e-mail",
    "btnReissueKey": "Reeditar",
    "btnSendEmail": "Enviar e-mail",
    "btnRevoke": "Revogar",
    "noActions": "Nenhuma a\xE7\xE3o",
    "pillEnabled": "habilitado",
    "pillDisabled": "desativado",
    "emailDraftReady": "Rascunho pronto para {email}",
    "keyIssued": "Chave emitida para {email}",
    "keyReissued": "Chave reemitida para {email}",
    "emailSent": "E-mail enviado para {email}",
    "emailSendError": "Falha no envio de e-mail: {error}",
    "nothingToCopy": "Nada para copiar ainda.",
    "emailCopied": "Rascunho de e-mail copiado para a \xE1rea de transfer\xEAncia.",
    "requestFailed": "Falha na solicita\xE7\xE3o do administrador.",
    "revenueTitle": "Receita",
    "revenueCopy": "Estimado a partir de pagamentos conclu\xEDdos. Podem diferir dos valores reais recebidos.",
    "revenueEstimate": "Receita estimada",
    "revenueTotalOrders": "Total de pedidos",
    "revenuePaid": "Pago",
    "revenueIssued": "Chaves emitidas",
    "revenueRevoked": "Chaves revogadas",
    "revenueReadyToSend": "Aguardando entrega",
    "revenueSent": "Entregue",
    "revenueByMethod": "Por forma de pagamento",
    "revenueByMonth": "Pedidos mensais",
    "colOrders": "Pedidos",
    "colPaid": "Pago",
    "colIssued": "Emitido",
    "mailerOn": "Entrega autom\xE1tica de e-mail: ATIVADA",
    "mailerOff": "Entrega autom\xE1tica de e-mail: DESATIVADA (\xE9 necess\xE1ria entrega manual)",
    "statDeliveryReady": "Aguardando entrega",
    "statDeliverySent": "Entregue"
  },
  "es": {
    "adminH1": "Pagos, emisi\xF3n y entrega",
    "adminLead": "Administre los m\xE9todos de pago aceptados, revise las solicitudes de compra, emita claves Pro firmadas y mantenga un historial auditable para la entrega manual de correos electr\xF3nicos.",
    "tokenLabel": "token de administrador",
    "tokenApply": "Aplicar",
    "tokenStatusDefault": "Token requerido para /api/admin/*",
    "statPending": "\xD3rdenes pendientes",
    "statPaid": "Pagado, esperando llave",
    "statIssued": "llaves emitidas",
    "statMethods": "M\xE9todos de pago activos",
    "statWebhookProcessed": "Webhook procesado",
    "statWebhookIgnored": "Webhook ignorado",
    "statWebhookRejected": "Webhook rechazado",
    "statWebhookDuplicates": "Reintentos de webhook detectados",
    "paymentMethodsTitle": "M\xE9todos de pago",
    "paymentMethodsCopy": "La p\xE1gina de destino p\xFAblica solo lee los m\xE9todos habilitados desde aqu\xED.",
    "reloadBtn": "Recargar panel",
    "colName": "Nombre",
    "colSummary": "Resumen",
    "colAction": "acci\xF3n",
    "colEnabled": "Habilitado",
    "colActions": "Acciones",
    "methodNameLabel": "Nombre del m\xE9todo",
    "methodSortLabel": "orden de clasificaci\xF3n",
    "methodSummaryLabel": "Resumen",
    "methodInstructionsLabel": "Instrucciones",
    "methodCtaLabel": "etiqueta de acci\xF3n",
    "methodActionUrlLabel": "Acci\xF3n exterior URL",
    "methodEnabledLabel": "Habilitado",
    "addMethodBtn": "Agregar m\xE9todo de pago",
    "ordersTitle": "Solicitudes de compra",
    "ordersCopy": "Marque el pago, emita una clave y luego copie el borrador del correo electr\xF3nico.",
    "colBuyer": "Comprador",
    "colMethod": "M\xE9todo",
    "colStatus": "Estado",
    "colCreated": "Creado",
    "licensesTitle": "llaves emitidas",
    "licensesCopy": "Cada clave generada se almacena con vista previa, titular y estado.",
    "colHolder": "Titular",
    "colIssuedAt": "Emitido en",
    "colPreview": "Vista previa",
    "emailDraftTitle": "Borrador de entrega de correo electr\xF3nico",
    "emailDraftCopy": "El correo electr\xF3nico funciona bien para este producto porque es simple, auditable y admite claves para pegar sin conexi\xF3n.",
    "emailPreviewLabel": "Vista previa",
    "copyEmailBtn": "Copiar borrador de correo electr\xF3nico",
    "emailStatusDefault": "Seleccione un pedido emitido para obtener una vista previa del texto de entrega.",
    "historyTitle": "Historia",
    "historyCopy": "Eventos clave, de pago y de webhook recientes (incluidos casos rechazados/duplicados/ignorados).",
    "filterKindLabel": "amable",
    "filterProviderLabel": "Provider",
    "filterReasonLabel": "Raz\xF3n",
    "allOption": "Todos",
    "colWhen": "cuando",
    "colEventKind": "Tipo de evento",
    "colProvider": "Provider",
    "colEventId": "ID de evento",
    "colReason": "Raz\xF3n",
    "colMessage": "Mensaje",
    "langKo": "\uD55C\uAD6D\uC5B4",
    "langEn": "ingles",
    "dashboardLoaded": "Panel cargado",
    "tokenSaving": "Token guardado localmente. Cargando panel...",
    "tokenCleared": "Token borrado",
    "dashboardError": "No se pudo cargar el panel",
    "noHistoryMatch": "Ning\xFAn evento coincide con los filtros seleccionados.",
    "btnEnable": "Habilitar",
    "btnDisable": "Desactivar",
    "btnMarkPaid": "marca pagada",
    "btnIssueKey": "Clave de problema",
    "btnPreviewEmail": "Vista previa del correo electr\xF3nico",
    "btnReissueKey": "Reedici\xF3n",
    "btnSendEmail": "Enviar correo electr\xF3nico",
    "btnRevoke": "Revocar",
    "noActions": "Sin acciones",
    "pillEnabled": "habilitado",
    "pillDisabled": "discapacitado",
    "emailDraftReady": "Borrador listo para {email}",
    "keyIssued": "Clave emitida para {email}",
    "keyReissued": "Clave reeditada para {email}",
    "emailSent": "Correo electr\xF3nico enviado a {email}",
    "emailSendError": "Error al enviar correo electr\xF3nico: {error}",
    "nothingToCopy": "Nada que copiar todav\xEDa.",
    "emailCopied": "Borrador de correo electr\xF3nico copiado al portapapeles.",
    "requestFailed": "La solicitud del administrador fall\xF3.",
    "revenueTitle": "Ingresos",
    "revenueCopy": "Estimado a partir de pagos completados. Puede diferir de los montos reales recibidos.",
    "revenueEstimate": "Ingresos estimados",
    "revenueTotalOrders": "Pedidos totales",
    "revenuePaid": "Pagado",
    "revenueIssued": "llaves emitidas",
    "revenueRevoked": "Claves revocadas",
    "revenueReadyToSend": "En espera de entrega",
    "revenueSent": "Entregado",
    "revenueByMethod": "Por m\xE9todo de pago",
    "revenueByMonth": "Pedidos mensuales",
    "colOrders": "\xD3rdenes",
    "colPaid": "Pagado",
    "colIssued": "Emitido",
    "mailerOn": "Entrega autom\xE1tica de correo electr\xF3nico: ACTIVADA",
    "mailerOff": "Entrega autom\xE1tica de correo electr\xF3nico: DESACTIVADA (se requiere entrega manual)",
    "statDeliveryReady": "En espera de entrega",
    "statDeliverySent": "Entregado"
  },
  "zh-TW": {
    "adminH1": "\u4ED8\u6B3E\u3001\u767C\u884C\u548C\u4EA4\u4ED8",
    "adminLead": "\u7BA1\u7406\u63A5\u53D7\u7684\u4ED8\u6B3E\u65B9\u5F0F\u3001\u5BE9\u67E5\u8CFC\u8CB7\u8ACB\u6C42\u3001\u9812\u767C\u7C3D\u7F72\u7684 Pro \u91D1\u9470\uFF0C\u4E26\u4FDD\u7559\u624B\u52D5\u96FB\u5B50\u90F5\u4EF6\u50B3\u9001\u7684\u53EF\u5BE9\u6838\u6B77\u53F2\u8A18\u9304\u3002",
    "tokenLabel": "\u7BA1\u7406\u54E1\u4EE4\u724C",
    "tokenApply": "\u7533\u8ACB",
    "tokenStatusDefault": "/api/admin/* \u6240\u9700\u7684\u4EE3\u5E63",
    "statPending": "\u5F85\u8655\u7406\u8A02\u55AE",
    "statPaid": "\u5DF2\u4ED8\u6B3E\uFF0C\u7B49\u5F85\u9470\u5319",
    "statIssued": "\u5DF2\u767C\u653E\u9470\u5319",
    "statMethods": "\u6D3B\u8E8D\u7684\u4ED8\u6B3E\u65B9\u5F0F",
    "statWebhookProcessed": "\u5DF2\u8655\u7406 Webhook",
    "statWebhookIgnored": "Webhook \u88AB\u5FFD\u7565",
    "statWebhookRejected": "Webhook \u88AB\u62D2\u7D55",
    "statWebhookDuplicates": "\u5075\u6E2C\u5230 Webhook \u91CD\u8A66",
    "paymentMethodsTitle": "\u4ED8\u6B3E\u65B9\u5F0F",
    "paymentMethodsCopy": "\u516C\u5171\u767B\u9678\u9801\u9762\u50C5\u8B80\u53D6\u6B64\u8655\u555F\u7528\u7684\u65B9\u6CD5\u3002",
    "reloadBtn": "\u91CD\u65B0\u8F09\u5165\u5100\u8868\u677F",
    "colName": "\u540D\u7A31",
    "colSummary": "\u7E3D\u7D50",
    "colAction": "\u884C\u52D5",
    "colEnabled": "\u555F\u7528",
    "colActions": "\u884C\u52D5",
    "methodNameLabel": "\u65B9\u6CD5\u540D\u7A31",
    "methodSortLabel": "\u6392\u5E8F\u9806\u5E8F",
    "methodSummaryLabel": "\u7E3D\u7D50",
    "methodInstructionsLabel": "\u4F7F\u7528\u8AAA\u660E",
    "methodCtaLabel": "\u865F\u53EC\u6027\u7528\u8A9E\u6A19\u7C64",
    "methodActionUrlLabel": "\u5916\u90E8\u52D5\u4F5C URL",
    "methodEnabledLabel": "\u555F\u7528",
    "addMethodBtn": "\u65B0\u589E\u4ED8\u6B3E\u65B9\u5F0F",
    "ordersTitle": "\u63A1\u8CFC\u8ACB\u6C42",
    "ordersCopy": "\u6A19\u8A18\u4ED8\u6B3E\uFF0C\u767C\u51FA\u5BC6\u9470\uFF0C\u7136\u5F8C\u8907\u88FD\u96FB\u5B50\u90F5\u4EF6\u8349\u7A3F\u3002",
    "colBuyer": "\u8CB7\u5BB6",
    "colMethod": "\u65B9\u6CD5",
    "colStatus": "\u72C0\u614B",
    "colCreated": "\u5DF2\u5275\u5EFA",
    "licensesTitle": "\u5DF2\u767C\u653E\u9470\u5319",
    "licensesCopy": "\u6BCF\u500B\u7522\u751F\u7684\u5BC6\u9470\u90FD\u5132\u5B58\u6709\u9810\u89BD\u3001\u6301\u6709\u8005\u548C\u72C0\u614B\u3002",
    "colHolder": "\u652F\u67B6",
    "colIssuedAt": "\u767C\u4F48\u65BC",
    "colPreview": "\u9810\u89BD",
    "emailDraftTitle": "\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u8349\u7A3F",
    "emailDraftCopy": "\u96FB\u5B50\u90F5\u4EF6\u975E\u5E38\u9069\u5408\u6B64\u7522\u54C1\uFF0C\u56E0\u70BA\u5B83\u7C21\u55AE\u3001\u53EF\u5BE9\u6838\u4E26\u4E14\u9069\u5408\u8CBC\u4E0A\u96E2\u7DDA\u91D1\u9470\u3002",
    "emailPreviewLabel": "\u9810\u89BD",
    "copyEmailBtn": "\u8907\u88FD\u96FB\u5B50\u90F5\u4EF6\u8349\u7A3F",
    "emailStatusDefault": "\u9078\u64C7\u5DF2\u767C\u51FA\u7684\u8A02\u55AE\u4EE5\u9810\u89BD\u4EA4\u4ED8\u6587\u5B57\u3002",
    "historyTitle": "\u6B77\u53F2",
    "historyCopy": "\u6700\u8FD1\u7684\u5BC6\u9470\u3001\u4ED8\u6B3E\u548C Webhook \u4E8B\u4EF6\uFF08\u5305\u62EC\u62D2\u7D55/\u91CD\u8907/\u5FFD\u7565\u7684\u6848\u4F8B\uFF09\u3002",
    "filterKindLabel": "\u7A2E\u985E",
    "filterProviderLabel": "Provider",
    "filterReasonLabel": "\u539F\u56E0",
    "allOption": "\u5168\u90E8",
    "colWhen": "\u7576",
    "colEventKind": "\u6D3B\u52D5\u7A2E\u985E",
    "colProvider": "Provider",
    "colEventId": "\u4E8B\u4EF6ID",
    "colReason": "\u539F\u56E0",
    "colMessage": "\u7559\u8A00",
    "langKo": "\uD55C\uAD6D\uC5B4",
    "langEn": "\u82F1\u8A9E",
    "dashboardLoaded": "\u5100\u8868\u677F\u5DF2\u52A0\u8F09",
    "tokenSaving": "\u4EE4\u724C\u4FDD\u5B58\u5728\u672C\u5730\u3002\u6B63\u5728\u52A0\u8F09\u5100\u8868\u677F...",
    "tokenCleared": "\u4EE4\u724C\u5DF2\u6E05\u9664",
    "dashboardError": "\u7121\u6CD5\u8F09\u5165\u5100\u8868\u677F",
    "noHistoryMatch": "\u6C92\u6709\u4E8B\u4EF6\u8207\u9078\u5B9A\u7684\u904E\u6FFE\u5668\u76F8\u7B26\u3002",
    "btnEnable": "\u555F\u7528",
    "btnDisable": "\u505C\u7528",
    "btnMarkPaid": "\u6A19\u8A18\u5DF2\u4ED8\u6B3E",
    "btnIssueKey": "\u767C\u884C\u91D1\u9470",
    "btnPreviewEmail": "\u9810\u89BD\u96FB\u5B50\u90F5\u4EF6",
    "btnReissueKey": "\u91CD\u65B0\u767C\u884C",
    "btnSendEmail": "\u50B3\u9001\u96FB\u5B50\u90F5\u4EF6",
    "btnRevoke": "\u64A4\u92B7",
    "noActions": "\u6C92\u6709\u52D5\u4F5C",
    "pillEnabled": "\u5DF2\u555F\u7528",
    "pillDisabled": "\u6B98\u969C\u4EBA\u58EB",
    "emailDraftReady": "{email} \u8349\u6848\u5DF2\u6E96\u5099\u5C31\u7DD2",
    "keyIssued": "\u5DF2\u9812\u767C {email} \u5BC6\u9470",
    "keyReissued": "\u91CD\u65B0\u9812\u767C {email} \u91D1\u9470",
    "emailSent": "\u96FB\u5B50\u90F5\u4EF6\u5DF2\u767C\u9001\u81F3 {email}",
    "emailSendError": "\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\u5931\u6557\uFF1A{error}",
    "nothingToCopy": "\u9084\u6C92\u6709\u4EC0\u9EBC\u53EF\u8907\u88FD\u7684\u3002",
    "emailCopied": "\u96FB\u5B50\u90F5\u4EF6\u8349\u7A3F\u5DF2\u8907\u88FD\u5230\u526A\u8CBC\u7C3F\u3002",
    "requestFailed": "\u7BA1\u7406\u54E1\u8ACB\u6C42\u5931\u6557\u3002",
    "revenueTitle": "\u6536\u5165",
    "revenueCopy": "\u6839\u64DA\u5DF2\u5B8C\u6210\u7684\u4ED8\u6B3E\u4F30\u7B97\u3002\u53EF\u80FD\u8207\u5BE6\u969B\u6536\u5230\u7684\u91D1\u984D\u6709\u6240\u4E0D\u540C\u3002",
    "revenueEstimate": "\u9810\u8A08\u6536\u5165",
    "revenueTotalOrders": "\u8A02\u55AE\u7E3D\u6578",
    "revenuePaid": "\u4ED8\u8CBB",
    "revenueIssued": "\u5DF2\u767C\u653E\u9470\u5319",
    "revenueRevoked": "\u5DF2\u64A4\u92B7\u7684\u91D1\u9470",
    "revenueReadyToSend": "\u7B49\u5F85\u767C\u8CA8",
    "revenueSent": "\u5DF2\u4EA4\u4ED8",
    "revenueByMethod": "\u6309\u4ED8\u6B3E\u65B9\u5F0F",
    "revenueByMonth": "\u6BCF\u6708\u8A02\u55AE",
    "colOrders": "\u8A02\u55AE",
    "colPaid": "\u4ED8\u8CBB",
    "colIssued": "\u5DF2\u767C\u884C",
    "mailerOn": "\u81EA\u52D5\u96FB\u5B50\u90F5\u4EF6\u767C\u9001\uFF1A\u958B",
    "mailerOff": "\u81EA\u52D5\u96FB\u5B50\u90F5\u4EF6\u50B3\u9001\uFF1A\u95DC\u9589\uFF08\u9700\u624B\u52D5\u50B3\u9001\uFF09",
    "statDeliveryReady": "\u7B49\u5F85\u767C\u8CA8",
    "statDeliverySent": "\u5DF2\u4EA4\u4ED8"
  },
  "vi": {
    "adminH1": "Thanh to\xE1n, ph\xE1t h\xE0nh v\xE0 giao h\xE0ng",
    "adminLead": "Qu\u1EA3n l\xFD c\xE1c ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n \u0111\u01B0\u1EE3c ch\u1EA5p nh\u1EADn, xem x\xE9t c\xE1c y\xEAu c\u1EA7u mua h\xE0ng, c\u1EA5p kh\xF3a Pro \u0111\xE3 k\xFD v\xE0 l\u01B0u gi\u1EEF l\u1ECBch s\u1EED c\xF3 th\u1EC3 ki\u1EC3m tra \u0111\u1EC3 g\u1EEDi email th\u1EE7 c\xF4ng.",
    "tokenLabel": "M\xE3 th\xF4ng b\xE1o qu\u1EA3n tr\u1ECB",
    "tokenApply": "\xC1p d\u1EE5ng",
    "tokenStatusDefault": "C\u1EA7n c\xF3 m\xE3 th\xF4ng b\xE1o cho /api/admin/*",
    "statPending": "L\u1EC7nh ch\u1EDD x\u1EED l\xFD",
    "statPaid": "\u0110\xE3 thanh to\xE1n, \u0111ang ch\u1EDD key",
    "statIssued": "Kh\xF3a \u0111\xE3 ph\xE1t h\xE0nh",
    "statMethods": "Ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n \u0111ang ho\u1EA1t \u0111\u1ED9ng",
    "statWebhookProcessed": "Webhook \u0111\xE3 \u0111\u01B0\u1EE3c x\u1EED l\xFD",
    "statWebhookIgnored": "Webhook b\u1ECB b\u1ECF qua",
    "statWebhookRejected": "Webhook b\u1ECB t\u1EEB ch\u1ED1i",
    "statWebhookDuplicates": "\u0110\xE3 ph\xE1t hi\u1EC7n th\u1EA5y s\u1ED1 l\u1EA7n th\u1EED l\u1EA1i Webhook",
    "paymentMethodsTitle": "Ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
    "paymentMethodsCopy": "Trang \u0111\xEDch c\xF4ng khai ch\u1EC9 \u0111\u1ECDc c\xE1c ph\u01B0\u01A1ng th\u1EE9c \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t t\u1EEB \u0111\xE2y.",
    "reloadBtn": "T\u1EA3i l\u1EA1i trang t\u1ED5ng quan",
    "colName": "T\xEAn",
    "colSummary": "T\xF3m t\u1EAFt",
    "colAction": "h\xE0nh \u0111\u1ED9ng",
    "colEnabled": "\u0110\xE3 b\u1EADt",
    "colActions": "h\xE0nh \u0111\u1ED9ng",
    "methodNameLabel": "T\xEAn ph\u01B0\u01A1ng th\u1EE9c",
    "methodSortLabel": "S\u1EAFp x\u1EBFp th\u1EE9 t\u1EF1",
    "methodSummaryLabel": "T\xF3m t\u1EAFt",
    "methodInstructionsLabel": "H\u01B0\u1EDBng d\u1EABn",
    "methodCtaLabel": "Nh\xE3n CTA",
    "methodActionUrlLabel": "H\xE0nh \u0111\u1ED9ng b\xEAn ngo\xE0i URL",
    "methodEnabledLabel": "\u0110\xE3 b\u1EADt",
    "addMethodBtn": "Th\xEAm ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
    "ordersTitle": "Y\xEAu c\u1EA7u mua h\xE0ng",
    "ordersCopy": "\u0110\xE1nh d\u1EA5u thanh to\xE1n, c\u1EA5p ch\xECa kh\xF3a, sau \u0111\xF3 sao ch\xE9p b\u1EA3n nh\xE1p email.",
    "colBuyer": "Ng\u01B0\u1EDDi mua",
    "colMethod": "ph\u01B0\u01A1ng ph\xE1p",
    "colStatus": "Tr\u1EA1ng th\xE1i",
    "colCreated": "\u0110\xE3 t\u1EA1o",
    "licensesTitle": "Kh\xF3a \u0111\xE3 ph\xE1t h\xE0nh",
    "licensesCopy": "M\u1ECDi kh\xF3a \u0111\u01B0\u1EE3c t\u1EA1o \u0111\u1EC1u \u0111\u01B0\u1EE3c l\u01B0u tr\u1EEF v\u1EDBi b\u1EA3n xem tr\u01B0\u1EDBc, ch\u1EE7 s\u1EDF h\u1EEFu v\xE0 tr\u1EA1ng th\xE1i.",
    "colHolder": "Ng\u01B0\u1EDDi gi\u1EEF",
    "colIssuedAt": "Ph\xE1t h\xE0nh t\u1EA1i",
    "colPreview": "Xem tr\u01B0\u1EDBc",
    "emailDraftTitle": "B\u1EA3n th\u1EA3o g\u1EEDi email",
    "emailDraftCopy": "Email ho\u1EA1t \u0111\u1ED9ng t\u1ED1t cho s\u1EA3n ph\u1EA9m n\xE0y v\xEC n\xF3 \u0111\u01A1n gi\u1EA3n, c\xF3 th\u1EC3 ki\u1EC3m tra \u0111\u01B0\u1EE3c v\xE0 ph\xF9 h\u1EE3p v\u1EDBi c\xE1c kh\xF3a ngo\u1EA1i tuy\u1EBFn c\xF3 th\u1EC3 d\xE1n v\xE0o.",
    "emailPreviewLabel": "Xem tr\u01B0\u1EDBc",
    "copyEmailBtn": "Sao ch\xE9p email nh\xE1p",
    "emailStatusDefault": "Ch\u1ECDn m\u1ED9t \u0111\u01A1n \u0111\u1EB7t h\xE0ng \u0111\xE3 ph\xE1t h\xE0nh \u0111\u1EC3 xem tr\u01B0\u1EDBc v\u0103n b\u1EA3n giao h\xE0ng.",
    "historyTitle": "L\u1ECBch s\u1EED",
    "historyCopy": "C\xE1c s\u1EF1 ki\u1EC7n kh\xF3a, thanh to\xE1n v\xE0 webhook g\u1EA7n \u0111\xE2y (bao g\u1ED3m c\xE1c tr\u01B0\u1EDDng h\u1EE3p b\u1ECB t\u1EEB ch\u1ED1i/tr\xF9ng l\u1EB7p/b\u1ECF qua).",
    "filterKindLabel": "lo\u1EA1i",
    "filterProviderLabel": "Provider",
    "filterReasonLabel": "L\xFD do",
    "allOption": "T\u1EA5t c\u1EA3",
    "colWhen": "Khi n\xE0o",
    "colEventKind": "Lo\u1EA1i s\u1EF1 ki\u1EC7n",
    "colProvider": "Provider",
    "colEventId": "M\xE3 s\u1EF1 ki\u1EC7n",
    "colReason": "L\xFD do",
    "colMessage": "Tin nh\u1EAFn",
    "langKo": "\uD55C\uAD6D\uC5B4",
    "langEn": "Ti\u1EBFng Anh",
    "dashboardLoaded": "\u0110\xE3 t\u1EA3i trang t\u1ED5ng quan",
    "tokenSaving": "M\xE3 th\xF4ng b\xE1o \u0111\u01B0\u1EE3c l\u01B0u c\u1EE5c b\u1ED9. \u0110ang t\u1EA3i trang t\u1ED5ng quan...",
    "tokenCleared": "\u0110\xE3 x\xF3a m\xE3 th\xF4ng b\xE1o",
    "dashboardError": "Kh\xF4ng th\u1EC3 t\u1EA3i trang t\u1ED5ng quan",
    "noHistoryMatch": "Kh\xF4ng c\xF3 s\u1EF1 ki\u1EC7n n\xE0o ph\xF9 h\u1EE3p v\u1EDBi b\u1ED9 l\u1ECDc \u0111\xE3 ch\u1ECDn.",
    "btnEnable": "K\xEDch ho\u1EA1t",
    "btnDisable": "V\xF4 hi\u1EC7u h\xF3a",
    "btnMarkPaid": "\u0110\xE1nh d\u1EA5u \u0111\xE3 tr\u1EA3 ti\u1EC1n",
    "btnIssueKey": "Ch\xECa kh\xF3a ph\xE1t h\xE0nh",
    "btnPreviewEmail": "Xem tr\u01B0\u1EDBc email",
    "btnReissueKey": "Ph\xE1t h\xE0nh l\u1EA1i",
    "btnSendEmail": "G\u1EEDi email",
    "btnRevoke": "Thu h\u1ED3i",
    "noActions": "Kh\xF4ng c\xF3 h\xE0nh \u0111\u1ED9ng n\xE0o",
    "pillEnabled": "\u0111\xE3 b\u1EADt",
    "pillDisabled": "b\u1ECB v\xF4 hi\u1EC7u h\xF3a",
    "emailDraftReady": "B\u1EA3n nh\xE1p \u0111\xE3 s\u1EB5n s\xE0ng cho {email}",
    "keyIssued": "Kh\xF3a \u0111\xE3 c\u1EA5p cho {email}",
    "keyReissued": "Kh\xF3a \u0111\u01B0\u1EE3c c\u1EA5p l\u1EA1i cho {email}",
    "emailSent": "Email \u0111\u01B0\u1EE3c g\u1EEDi t\u1EDBi {email}",
    "emailSendError": "G\u1EEDi email kh\xF4ng th\xE0nh c\xF4ng: {error}",
    "nothingToCopy": "Ch\u01B0a c\xF3 g\xEC \u0111\u1EC3 sao ch\xE9p.",
    "emailCopied": "\u0110\xE3 sao ch\xE9p b\u1EA3n nh\xE1p email v\xE0o b\u1EA3ng nh\u1EDB t\u1EA1m.",
    "requestFailed": "Y\xEAu c\u1EA7u qu\u1EA3n tr\u1ECB vi\xEAn kh\xF4ng th\xE0nh c\xF4ng.",
    "revenueTitle": "Doanh thu",
    "revenueCopy": "\u01AF\u1EDBc t\xEDnh t\u1EEB c\xE1c kho\u1EA3n thanh to\xE1n \u0111\xE3 ho\xE0n th\xE0nh. C\xF3 th\u1EC3 kh\xE1c v\u1EDBi s\u1ED1 ti\u1EC1n th\u1EF1c t\u1EBF nh\u1EADn \u0111\u01B0\u1EE3c.",
    "revenueEstimate": "Doanh thu \u01B0\u1EDBc t\xEDnh",
    "revenueTotalOrders": "T\u1ED5ng s\u1ED1 \u0111\u01A1n \u0111\u1EB7t h\xE0ng",
    "revenuePaid": "\u0110\xE3 tr\u1EA3 ti\u1EC1n",
    "revenueIssued": "Ch\xECa kh\xF3a \u0111\u01B0\u1EE3c ph\xE1t h\xE0nh",
    "revenueRevoked": "Kh\xF3a b\u1ECB thu h\u1ED3i",
    "revenueReadyToSend": "\u0110ang ch\u1EDD giao h\xE0ng",
    "revenueSent": "\u0110\xE3 giao",
    "revenueByMethod": "Theo ph\u01B0\u01A1ng th\u1EE9c thanh to\xE1n",
    "revenueByMonth": "\u0110\u01A1n h\xE0ng h\xE0ng th\xE1ng",
    "colOrders": "\u0110\u01A1n \u0111\u1EB7t h\xE0ng",
    "colPaid": "\u0110\xE3 tr\u1EA3 ti\u1EC1n",
    "colIssued": "\u0110\xE3 ph\xE1t h\xE0nh",
    "mailerOn": "G\u1EEDi email t\u1EF1 \u0111\u1ED9ng: B\u1EACT",
    "mailerOff": "G\u1EEDi email t\u1EF1 \u0111\u1ED9ng: T\u1EAET (y\xEAu c\u1EA7u g\u1EEDi th\u1EE7 c\xF4ng)",
    "statDeliveryReady": "\u0110ang ch\u1EDD giao h\xE0ng",
    "statDeliverySent": "\u0110\xE3 giao"
  }
};

// src/lib/web-i18n.ts
var LS_KEY = "web-locale";
var COOKIE_KEY = "threads-web-locale";
var EXTENSION_RELEASE_ASSET_NAME = "threads-saver-extension.zip";
var EXTENSION_RELEASE_DOWNLOAD_URL = `https://github.com/parktaejun-dev/threads-to-obsidian/releases/latest/download/${EXTENSION_RELEASE_ASSET_NAME}`;
var LEGACY_EXTENSION_REPO_URL = "https://github.com/parktaejun-dev/threads-to-obsidian";
var LEGACY_EXTENSION_SOURCE_ZIP_URL = `${LEGACY_EXTENSION_REPO_URL}/archive/refs/heads/main.zip`;
function readLocaleCookie() {
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
function detectPreferredNavigatorLocale() {
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
function getLocale(fallback) {
  try {
    const v = localStorage.getItem(LS_KEY);
    const saved = parseSupportedLocale(v);
    if (saved) {
      return saved;
    }
  } catch {
  }
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
function setLocale(locale) {
  try {
    localStorage.setItem(LS_KEY, locale);
  } catch {
  }
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
}
function applyTranslations(dict) {
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key = el.getAttribute("data-i18n");
    if (key in dict) el.textContent = dict[key];
  }
  for (const el of document.querySelectorAll("[data-i18n-ph]")) {
    const key = el.getAttribute("data-i18n-ph");
    if (key in dict) el.placeholder = dict[key];
  }
}
var obsidianLandingMessages = {
  ko: {
    topbarCta: "\uC124\uCE58 \uC548\uB0B4",
    siteLabel: "\uC548\uB0B4 \uC8FC\uC18C",
    heroEyebrow: "Extension + Scrapbook",
    heroGuideCta: "scrapbook \uC5F4\uAE30",
    heroPurchaseCta: "Pro \uAD6C\uB9E4",
    heroRailLabel1: "Free",
    heroRailText1: "\uAE00\xB7\uC774\uBBF8\uC9C0\xB7\uB2F5\uAE00 \uC800\uC7A5",
    heroRailLabel2: "Pro",
    heroRailText2: "\uD30C\uC77C\uBA85 \uADDC\uCE59 + AI \uC815\uB9AC",
    priceNote: "1\uD68C \uACB0\uC81C",
    priceSummary: "Free\uB85C \uC800\uC7A5\uD558\uACE0, \uD544\uC694\uD560 \uB54C Pro\uB97C \uCD94\uAC00\uD558\uC138\uC694.",
    pricePointFreeDesc: "\uD575\uC2EC \uC800\uC7A5\uC740 \uBC14\uB85C \uC0AC\uC6A9 \uAC00\uB2A5.",
    pricePointProDesc: "\uD30C\uC77C\uBA85 \uADDC\uCE59\uACFC AI \uC815\uB9AC\uB97C \uD65C\uC131\uD654.",
    primaryCta: "Pro \uAD6C\uB9E4",
    secondaryCta: "scrapbook \uC5F4\uAE30",
    flowStep1: "Free\uB85C \uBA3C\uC800 \uC800\uC7A5\uD574\uBCF4\uAE30",
    flowStep2: "\uD544\uC694\uD558\uBA74 Pro\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC",
    flowStep3: "\uC774\uBA54\uC77C\uB85C \uD0A4 \uC804\uB2EC",
    storyEyebrow: "Quick Start",
    storyH2: "\uC124\uCE58 \u2192 \uC5F0\uACB0 \u2192 \uC800\uC7A5, 3\uB2E8\uACC4.",
    storyP: "Free\uB85C \uBC14\uB85C \uC2DC\uC791\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    guideInstallCta: "\uC124\uCE58 \uC548\uB0B4 \uBCF4\uAE30",
    guideUpgradeCta: "Pro \uAD6C\uB9E4 \uC694\uCCAD",
    card1Title: "Chrome\uC5D0 \uB85C\uB4DC",
    card1Desc: "\uC555\uCD95\uC744 \uD480\uACE0 Chrome\uC5D0\uC11C dist/extension \uD3F4\uB354\uB97C \uC5B8\uD329\uB4DC \uD655\uC7A5\uC73C\uB85C \uB85C\uB4DC\uD569\uB2C8\uB2E4.",
    card2Title: "Vault \uC5F0\uACB0",
    card2Desc: "\uC635\uC158\uC5D0\uC11C Obsidian \uD3F4\uB354\uB97C \uC5F0\uACB0\uD558\uBA74 \uB9C8\uD06C\uB2E4\uC6B4\uACFC \uBBF8\uB514\uC5B4\uB97C \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
    card3Title: "Threads\uC5D0\uC11C \uC800\uC7A5",
    card3Desc: "Threads \uAC1C\uBCC4 \uAE00\uC5D0\uC11C \uC800\uC7A5\uC744 \uB204\uB974\uBA74 \uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C\uB294 \uADDC\uCE59\uACFC AI \uC815\uB9AC\uAE4C\uC9C0 \uC774\uC5B4\uC9D1\uB2C8\uB2E4.",
    showcaseH2: "\uD655\uC7A5 \uC548\uC5D0\uC11C \uC2E4\uC81C\uB85C \uBCF4\uC774\uB294 \uD654\uBA74",
    showcaseCopy: "Free\uC640 Pro\uC758 \uCC28\uC774\uB97C \uC9C1\uC811 \uD655\uC778\uD558\uC138\uC694.",
    shotLargeCapTitle: "Free \uC800\uC7A5 \uD750\uB984",
    shotLargeCapDesc: "\uD575\uC2EC \uC800\uC7A5 \uACBD\uD5D8\uC740 \uBE60\uB974\uACE0 \uB2E8\uC21C\uD558\uAC8C \uC720\uC9C0\uB429\uB2C8\uB2E4.",
    shotSmallCapTitle: "Pro \uC815\uB9AC \uC790\uB3D9\uD654",
    shotSmallCapDesc: "\uC6D0\uD558\uB294 \uADDC\uCE59\uACFC \uB0B4 LLM \uD0A4 \uAE30\uBC18 \uC694\uC57D\xB7\uD0DC\uADF8\uAC00 \uD568\uAED8 \uC801\uC6A9\uB429\uB2C8\uB2E4.",
    compFreeDesc: "\uD575\uC2EC \uC800\uC7A5\uC774 \uC774\uBBF8 \uC644\uC131\uB41C \uAE30\uBCF8 \uD750\uB984",
    compProDesc: "\uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uACFC AI \uC694\uC57D\xB7\uD0DC\uADF8\xB7frontmatter\uB97C \uCD94\uAC00\uD558\uB294 \uC5C5\uADF8\uB808\uC774\uB4DC",
    step1Title: "Free\uB85C \uC800\uC7A5 \uCCB4\uD5D8",
    step1Desc: "\uAE00\xB7\uC774\uBBF8\uC9C0\xB7\uB2F5\uAE00 \uC800\uC7A5\uC774 \uBC14\uB85C \uB429\uB2C8\uB2E4.",
    step2Title: "\uD544\uC694\uD560 \uB54C Pro \uC5C5\uADF8\uB808\uC774\uB4DC",
    step2Desc: "\uD30C\uC77C\uBA85 \uADDC\uCE59\uACFC AI \uC815\uB9AC\uAC00 \uD544\uC694\uD558\uBA74 Pro.",
    step3Title: "\uD0A4 \uC785\uB825\uC73C\uB85C \uD65C\uC131\uD654",
    step3Desc: "\uC635\uC158 \uD398\uC774\uC9C0\uC5D0 Pro \uD0A4\uB97C \uB123\uC73C\uBA74 \uB05D.",
    commerceH2: "Pro \uAD6C\uB9E4",
    commerceLead: "29\uB2EC\uB7EC 1\uD68C \uACB0\uC81C. \uC774\uBA54\uC77C\uB85C \uD0A4\uB97C \uBC1C\uC1A1\uD569\uB2C8\uB2E4.",
    commerceNote: "\uC8FC\uBB38 \uC694\uCCAD \uD6C4 \uACB0\uC81C\uB97C \uD655\uC778\uD558\uB294 \uBC29\uC2DD\uC73C\uB85C \uC6B4\uC601\uD569\uB2C8\uB2E4.",
    commerceRefund: "7\uC77C \uD658\uBD88",
    backToHome: "\uC81C\uD488 \uD398\uC774\uC9C0\uB85C \uB3CC\uC544\uAC00\uAE30",
    formNameLabel: "\uC774\uB984",
    formEmailLabel: "\uC774\uBA54\uC77C",
    formMethodLabel: "\uACB0\uC81C\uC218\uB2E8",
    formNoteLabel: "\uBA54\uBAA8",
    formSubmitBtn: "\uAD6C\uB9E4 \uC694\uCCAD \uBCF4\uB0B4\uAE30",
    formRemark: "\uACB0\uC81C \uD655\uC778 \uD6C4 Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0C5\uB2C8\uB2E4.",
    faqH2: "\uAD6C\uB9E4 \uC804\uC5D0 \uAC00\uC7A5 \uB9CE\uC774 \uBB3B\uB294 \uC9C8\uBB38",
    phName: "\uD64D\uAE38\uB3D9",
    phNote: "\uC138\uAE08\uACC4\uC0B0\uC11C, \uD1B5\uD654, \uD300\uC6A9 \uC88C\uC11D \uC694\uCCAD \uB4F1\uC774 \uC788\uC73C\uBA74 \uC801\uC5B4\uC8FC\uC138\uC694",
    phMethod: "\uACB0\uC81C\uC218\uB2E8\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    methodBadge: "\uC774\uC6A9 \uAC00\uB2A5",
    compareH2: "Free vs Pro",
    compareLead: "",
    compareColFeature: "\uAE30\uB2A5",
    compareRowSavePost: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
    compareRowImages: "\uC774\uBBF8\uC9C0 \uC800\uC7A5",
    compareRowReplies: "\uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
    compareRowRules: "\uD30C\uC77C\uBA85 / \uACBD\uB85C \uADDC\uCE59",
    compareRowAi: "\uB0B4 LLM \uD0A4 \uC694\uC57D / \uD0DC\uADF8 / frontmatter",
    screenH2: "Preview",
    screenUsageCaption: "\uC2E4\uC0AC\uC6A9 \uC800\uC7A5 \uD654\uBA74",
    screenProCaption: "Pro \uD65C\uC131\uD654 \uD6C4 \uC635\uC158 \uD654\uBA74",
    productsEyebrow: "Two products",
    productsTitle: "\uC800\uC7A5\uD558\uB294 \uB450 \uAC00\uC9C0 \uBC29\uC2DD",
    productsCopy: "",
    productATag: "Chrome extension",
    productATitle: "Threads to Obsidian",
    productADesc: "PC\uC5D0\uC11C \uBCF4\uACE0 \uC788\uB294 Threads \uAE00\uC744 \uBC14\uB85C \uC800\uC7A5.",
    productACta: "ZIP \uB2E4\uC6B4\uB85C\uB4DC",
    productBTag: "Mention bot",
    productBTitle: "Mention Scrapbook",
    productBDesc: "\uBAA8\uBC14\uC77C\uC5D0\uC11C\uB294 \uB313\uAE00 \uBA58\uC158\uC73C\uB85C \uBAA8\uC544\uC11C \uB098\uC911\uC5D0 \uAEBC\uB0B4\uAE30.",
    productBCta: "Scrapbook \uBC14\uB85C\uAC00\uAE30",
    pricingEyebrow: "Pricing",
    pricingTitle: "\uACB0\uC81C\uB294 \uB2E8\uC21C\uD558\uAC8C.",
    pricingCopy: "",
    bundleTag: "One-time",
    bundleTitle: "Threads Saver Pro",
    bundleDesc: "29\uB2EC\uB7EC 1\uD68C \uACB0\uC81C. Extension Pro\uC640 Scrapbook core \uD3EC\uD568.",
    bundleCta: "Pro \uAD6C\uB9E4",
    cloudTag: "Cloud Add-on",
    cloudTitle: "Watchlists + Searches + Insights",
    cloudDesc: "\uC9C0\uC18D \uB3D9\uAE30\uD654\uAC00 \uD544\uC694\uD55C \uAE30\uB2A5\uC740 \uBCC4\uB3C4 add-on.",
    cloudCta: "scrapbook \uC5F4\uAE30",
    botEyebrow: "Mention bot",
    botTitle: "\uB313\uAE00 \uBA58\uC158\uC73C\uB85C scrapbook\uC5D0 \uC800\uC7A5",
    botCopy: "\uB313\uAE00\uC5D0 @\uB97C \uBD99\uC774\uBA74 \uC800\uC7A5. \uC774\uD6C4 Markdown\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uAE30.",
    botStep1Title: "\uB313\uAE00\uC5D0 @parktaejun \uCD94\uAC00",
    botStep1Desc: "\uC800\uC7A5\uD558\uACE0 \uC2F6\uC740 Threads \uAE00\uC5D0 \uB313\uAE00\uC744 \uB2EC\uACE0 @parktaejun\uB9CC \uBD99\uC774\uBA74 \uC800\uC7A5 \uD2B8\uB9AC\uAC70\uAC00 \uC0DD\uC131\uB429\uB2C8\uB2E4.",
    botStep2Title: "\uACC4\uC815 \uAE30\uC900\uC73C\uB85C \uB0B4 scrapbook\uC5D0 \uB77C\uC6B0\uD305",
    botStep2Desc: "\uB85C\uADF8\uC778 \uC2DC \uC5F0\uACB0\uD55C Threads \uACC4\uC815\uC744 \uAE30\uC900\uC73C\uB85C \uC791\uC131\uC790\uB97C \uB9E4\uCE6D\uD574 \uC0AC\uC6A9\uC790\uBCC4 private scrapbook\uC5D0\uB9CC \uC800\uC7A5\uD569\uB2C8\uB2E4.",
    botStep3Title: "Markdown\uC73C\uB85C \uAEBC\uB0B4 \uC0AC\uC6A9",
    botStep3Desc: "\uC800\uC7A5\uB41C \uD56D\uBAA9\uC740 \uC6F9\uC5D0\uC11C \uD655\uC778\uD558\uACE0 Markdown export\uB098 plain text copy\uB85C Obsidian, Notion, \uBA54\uBAA8 \uC571\uC5D0 \uC62E\uAE41\uB2C8\uB2E4.",
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    orderSuccess1: "{email}\uB85C \uC694\uCCAD\uC774 \uC811\uC218\uB410\uC2B5\uB2C8\uB2E4.",
    orderNextStep: "\uB2E4\uC74C \uB2E8\uACC4: {instructions}",
    orderPayLink: "\uACB0\uC81C \uB9C1\uD06C: {url}",
    orderFinal: "\uACB0\uC81C \uD655\uC778 \uD6C4 Threads Saver Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4.",
    footerPurchaseLink: ""
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
    storyH2: "Install \u2192 Connect \u2192 Save. Three steps.",
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
    productBCta: "Go to Scrapbook",
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
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    orderSuccess1: "Your request has been received at {email}.",
    orderNextStep: "Next step: {instructions}",
    orderPayLink: "Payment link: {url}",
    orderFinal: "Your Threads Saver Pro key will be emailed after payment confirmation.",
    footerPurchaseLink: ""
  }
};
var landingMessages = {
  ko: {
    obsidian: obsidianLandingMessages.ko,
    bot: {
      ...obsidianLandingMessages.ko,
      topbarCta: "scrapbook \uC5F4\uAE30",
      heroEyebrow: "Mention Scrapbook SaaS",
      heroGuideCta: "scrapbook \uC5F4\uAE30",
      heroPurchaseCta: "\uD655\uC7A5 Pro \uAD6C\uB9E4",
      primaryCta: "\uD655\uC7A5 Pro \uAD6C\uB9E4",
      storyEyebrow: "Chrome Extension",
      storyH2: "Threads to Obsidian \uD655\uC7A5\uB3C4 \uD568\uAED8 \uC81C\uACF5\uD569\uB2C8\uB2E4.",
      storyP: "\uB313\uAE00 \uBA58\uC158 \uC800\uC7A5\uC740 bot\uC774 \uB9E1\uACE0, \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBCF4\uACE0 \uC788\uB294 Threads \uAE00\uC744 \uC989\uC2DC Obsidian\uC73C\uB85C \uBCF4\uB0B4\uB294 \uD750\uB984\uC740 extension\uC774 \uB9E1\uC2B5\uB2C8\uB2E4.",
      card3Title: "Threads\uC5D0\uC11C \uBC14\uB85C \uC800\uC7A5",
      card3Desc: "\uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBCF4\uACE0 \uC788\uB294 \uAE00\uC744 \uC989\uC2DC \uC800\uC7A5\uD569\uB2C8\uB2E4. mention bot\uC640 \uBCC4\uB3C4\uB85C \uC4F0\uAC70\uB098 \uD568\uAED8 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      commerceH2: "Threads to Obsidian Pro \uAD6C\uB9E4",
      commerceLead: "\uC774 \uC544\uB798 \uD3FC\uC740 Chrome extension Pro \uAD6C\uB9E4\uC6A9\uC785\uB2C8\uB2E4. mention scrapbook bot \uC548\uB0B4\uB294 \uC704 \uC139\uC158\uC5D0\uC11C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      faqH2: "Bot / Extension FAQ",
      compareH2: "Chrome Extension Free vs Pro",
      screenH2: "Chrome extension preview",
      productsEyebrow: "Two products",
      productsTitle: "Threads\uC5D0\uC11C \uC800\uC7A5\uD558\uB294 \uB450 \uAC00\uC9C0 \uBC29\uC2DD",
      productsCopy: "\uACF5\uAC1C \uB313\uAE00 \uAE30\uBC18 scrapbook bot\uACFC, \uBCF4\uACE0 \uC788\uB294 \uAE00\uC744 \uBC14\uB85C \uC800\uC7A5\uD558\uB294 Chrome extension\uC744 \uD568\uAED8 \uC548\uB0B4\uD569\uB2C8\uB2E4.",
      productATag: "Mention bot",
      productATitle: "Threads Mention Scrapbook",
      productADesc: "\uB313\uAE00\uC5D0 @parktaejun\uB9CC \uBD99\uC774\uBA74 \uB0B4 private scrapbook\uC73C\uB85C \uC800\uC7A5\uB418\uACE0, \uB098\uC911\uC5D0 Markdown\uC73C\uB85C \uAEBC\uB0B4 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      productACta: "scrapbook \uC5F4\uAE30",
      productBTag: "Chrome extension",
      productBTitle: "Threads to Obsidian",
      productBDesc: "\uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBCF4\uACE0 \uC788\uB294 Threads \uAE00\uC744 \uBC14\uB85C Obsidian\uC73C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4. \uC815\uB9AC \uADDC\uCE59\uACFC AI \uD6C4\uCC98\uB9AC\uB294 Pro\uC5D0\uC11C \uCF2D\uB2C8\uB2E4.",
      productBCta: "\uD655\uC7A5 \uC548\uB0B4 \uBCF4\uAE30",
      botEyebrow: "How it works",
      botTitle: "\uACF5\uAC1C \uB313\uAE00\uB85C \uD2B8\uB9AC\uAC70\uD558\uACE0, private scrapbook\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4.",
      botCopy: "Threads \uB85C\uADF8\uC778\uC73C\uB85C \uB0B4 \uACC4\uC815\uC744 \uC5F0\uACB0\uD55C \uB4A4, \uACF5\uAC1C \uB313\uAE00 \uBA58\uC158\uC744 \uC800\uC7A5 \uD2B8\uB9AC\uAC70\uB85C \uC501\uB2C8\uB2E4. \uC800\uC7A5\uB41C \uB370\uC774\uD130\uB294 \uC0AC\uC6A9\uC790\uBCC4 scrapbook\uC5D0\uB9CC \uBCF4\uC785\uB2C8\uB2E4.",
      botStep1Title: "Threads \uACC4\uC815 \uC5F0\uACB0",
      botStep1Desc: "scrapbook \uD398\uC774\uC9C0\uC5D0\uC11C Threads\uB85C \uB85C\uADF8\uC778\uD558\uACE0, \uC800\uC7A5 \uC694\uCCAD\uC744 \uBC1B\uC744 \uACC4\uC815\uC744 \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
      botStep2Title: "@parktaejun \uB313\uAE00\uB85C \uC800\uC7A5 \uC694\uCCAD",
      botStep2Desc: "Threads \uAC8C\uC2DC\uBB3C \uB313\uAE00\uC5D0 @parktaejun\uB9CC \uBD99\uC774\uBA74 \uBA58\uC158 \uC218\uC9D1\uAE30\uAC00 \uC5F0\uACB0\uB41C \uACC4\uC815 \uAE30\uC900\uC73C\uB85C scrapbook\uC5D0 \uBC18\uC601\uD569\uB2C8\uB2E4.",
      botStep3Title: "\uC6F9\uC5D0\uC11C \uD655\uC778\uD558\uACE0 Markdown export",
      botStep3Desc: "\uC800\uC7A5 \uBC18\uC601\uC740 60\uCD08 \uC774\uB0B4\uB97C \uBAA9\uD45C\uB85C \uD558\uACE0, Markdown export\uB098 plain text copy\uB85C Obsidian, Notion, \uBA54\uBAA8 \uC571\uC73C\uB85C \uC62E\uAE41\uB2C8\uB2E4."
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
var obsidianLandingStorefrontCopy = {
  ko: {
    productName: "Threads Saver",
    headline: '<span class="headline-row"><span>PC</span><span>extension.</span></span><span class="headline-row"><span>Mobile</span><span>mention.</span></span>',
    subheadline: "\uC9C0\uAE08 \uBCF4\uB294 \uAE00\uC740 Chrome extension\uC73C\uB85C \uC800\uC7A5\uD558\uACE0, \uBAA8\uBC14\uC77C\uC5D0\uC11C\uB294 mention scrapbook\uC73C\uB85C \uBAA8\uC74D\uB2C8\uB2E4.",
    priceLabel: "Threads Saver Pro",
    includedUpdates: "29\uB2EC\uB7EC 1\uD68C \uACB0\uC81C \xB7 Extension Pro + Scrapbook core \xB7 7\uC77C \uD658\uBD88",
    heroNotes: [
      "Chrome extension: \uD604\uC7AC \uBCF4\uACE0 \uC788\uB294 \uAE00 \uC800\uC7A5",
      "scrapbook: \uBA58\uC158, watchlist, search \uACB0\uACFC \uC815\uB9AC",
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
        question: "\uC800\uC7A5\uD558\uB824\uBA74 Pro\uAC00 \uD544\uC694\uD55C\uAC00\uC694?",
        answer: "\uC544\uB2C8\uC694. \uC800\uC7A5, \uC774\uBBF8\uC9C0 \uD3EC\uD568, \uC5F0\uC18D \uB2F5\uAE00, \uC911\uBCF5 \uAC74\uB108\uB700 \uBAA8\uB450 Free\uC5D0\uC11C \uAC00\uB2A5\uD569\uB2C8\uB2E4."
      },
      {
        id: "faq-2",
        question: "\uB204\uAC00 Pro\uB97C \uC0AC\uBA74 \uC88B\uB098\uC694?",
        answer: "\uC800\uC7A5\uD560 \uB54C \uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uC744 \uC9C1\uC811 \uC81C\uC5B4\uD558\uACE0, \uC790\uC2E0\uC758 LLM \uD0A4\uB85C \uC694\uC57D\xB7\uD0DC\uADF8\xB7frontmatter\uB97C \uBD99\uC774\uACE0 \uC2F6\uC740 \uBD84\uAED8 \uB9DE\uC2B5\uB2C8\uB2E4."
      },
      {
        id: "faq-3",
        question: "\uC694\uC57D\uC774\uB098 \uD0DC\uADF8 \uAC19\uC740 AI \uC815\uB9AC\uB294 \uB418\uB098\uC694?",
        answer: "\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C OpenAI \uD638\uD658 \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uC640 \uC790\uC2E0\uC758 \uD0A4\uB97C \uB123\uC73C\uBA74 \uC694\uC57D, \uD0DC\uADF8, \uCD94\uAC00 frontmatter\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4."
      },
      {
        id: "faq-4",
        question: "Pro \uD0A4\uB294 \uC5B4\uB5BB\uAC8C \uC804\uB2EC\uB418\uB098\uC694?",
        answer: "\uACB0\uC81C\uAC00 \uD655\uC778\uB418\uBA74 Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4."
      },
      {
        id: "faq-5",
        question: "\uD658\uBD88 \uC815\uCC45\uC740 \uC788\uB098\uC694?",
        answer: "\uAD6C\uB9E4 \uD6C4 7\uC77C \uB0B4\uC5D0 \uD658\uBD88 \uC694\uCCAD\uC744 \uBCF4\uB0B4\uBA74 \uD655\uC778 \uD6C4 \uCC98\uB9AC\uD569\uB2C8\uB2E4."
      }
    ]
  },
  en: {
    productName: "Threads Saver",
    headline: '<span class="headline-row"><span>PC</span><span>extension.</span></span><span class="headline-row"><span>Mobile</span><span>mention.</span></span>',
    subheadline: "Save the current post using the Chrome extension, or collect it later via mention scrapbook on mobile.",
    priceLabel: "Threads Saver Pro",
    includedUpdates: "$29 one-time \xB7 extension Pro + scrapbook core \xB7 7-day refund",
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
var landingStorefrontCopy = {
  ko: {
    obsidian: obsidianLandingStorefrontCopy.ko,
    bot: {
      productName: "Threads Mention Scrapbook",
      headline: "Threads \uB313\uAE00\uC5D0 @parktaejun\uB9CC \uBD99\uC774\uBA74 \uC800\uC7A5\uB429\uB2C8\uB2E4.",
      subheadline: "\uACF5\uAC1C \uB313\uAE00\uC744 private scrapbook \uC800\uC7A5 \uD2B8\uB9AC\uAC70\uB85C \uBC14\uAFB8\uACE0, \uB098\uC911\uC5D0 Markdown\uC774\uB098 Obsidian, Notion\uC73C\uB85C \uAEBC\uB0B4 \uC4F0\uB294 SaaS\uC785\uB2C8\uB2E4.",
      priceLabel: "Threads to Obsidian Pro",
      includedUpdates: "Chrome extension \xB7 1\uD68C \uACB0\uC81C \xB7 \uC5C5\uB370\uC774\uD2B8 1\uB144",
      heroNotes: [
        "\uB313\uAE00\uC740 \uACF5\uAC1C \uD2B8\uB9AC\uAC70\uC785\uB2C8\uB2E4. \uBBFC\uAC10\uD55C \uBA54\uBAA8\uB294 \uC801\uC9C0 \uB9C8\uC138\uC694.",
        "Threads \uB85C\uADF8\uC778\uC73C\uB85C \uC5F0\uACB0\uB41C \uACC4\uC815\uACFC \uB313\uAE00 \uC791\uC131 \uACC4\uC815\uC744 \uAE30\uC900\uC73C\uB85C \uC0AC\uC6A9\uC790\uBCC4\uB85C \uBD84\uB9AC \uC800\uC7A5\uD569\uB2C8\uB2E4.",
        "\uC800\uC7A5 \uD6C4 Markdown export\uC640 plain text copy\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4."
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
          question: "\uB313\uAE00 \uB0B4\uC6A9\uC740 \uACF5\uAC1C\uB85C \uBCF4\uC774\uB098\uC694?",
          answer: "\uB124. \uB313\uAE00\uC740 \uACF5\uAC1C \uD2B8\uB9AC\uAC70\uC774\uBBC0\uB85C \uBBFC\uAC10\uD55C \uBA54\uBAA8\uB97C \uC801\uC9C0 \uB9D0\uC544\uC57C \uD558\uACE0, \uD398\uC774\uC9C0\uC5D0\uC11C\uB3C4 \uADF8 \uC810\uC744 \uBA85\uC2DC\uD569\uB2C8\uB2E4."
        },
        {
          id: "faq-2",
          question: "\uC798\uBABB\uB41C \uC0AC\uC6A9\uC790 scrapbook\uC5D0 \uC800\uC7A5\uB420 \uC218 \uC788\uB098\uC694?",
          answer: "\uC5F0\uACB0\uD55C Threads \uACC4\uC815\uACFC \uB313\uAE00 \uC791\uC131 \uACC4\uC815\uC774 \uC77C\uCE58\uD560 \uB54C\uB9CC \uC800\uC7A5\uD558\uACE0, \uC77C\uCE58\uD558\uC9C0 \uC54A\uC73C\uBA74 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
        },
        {
          id: "faq-3",
          question: "username\uC774 \uBC14\uB00C\uBA74 \uAE30\uC874 \uC800\uC7A5\uC740 \uC5B4\uB5BB\uAC8C \uB418\uB098\uC694?",
          answer: "\uAC19\uC740 Threads \uACC4\uC815\uC73C\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD558\uBA74 \uAE30\uC874 scrapbook\uC740 \uC720\uC9C0\uD55C \uCC44 \uCD5C\uC2E0 \uC0AC\uC6A9\uC790\uBA85\uACFC \uD504\uB85C\uD544 \uC815\uBCF4\uB85C \uAC31\uC2E0\uB429\uB2C8\uB2E4."
        },
        {
          id: "faq-4",
          question: "\uC800\uC7A5 \uBC18\uC601\uC740 \uC5BC\uB9C8\uB098 \uAC78\uB9AC\uB098\uC694?",
          answer: "\uBA58\uC158 \uC218\uC9D1 \uC8FC\uAE30\uB294 \uAE30\uBCF8 30\uCD08\uC5D0\uC11C 60\uCD08\uC774\uBA70, \uCCAB \uBC18\uC601 \uBAA9\uD45C\uB294 60\uCD08 \uC774\uB0B4\uC785\uB2C8\uB2E4."
        },
        {
          id: "faq-5",
          question: "\uB0B4\uBCF4\uB0B4\uAE30\uB294 \uC5B4\uB514\uAE4C\uC9C0 \uC9C0\uC6D0\uD558\uB098\uC694?",
          answer: "Markdown export\uC640 plain text copy\uB97C \uC9C0\uC6D0\uD574 Obsidian, Notion, \uBA54\uBAA8 \uC571\uC73C\uB85C \uC62E\uAE38 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
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
      includedUpdates: "Chrome extension \xB7 one-time payment \xB7 1 year of updates",
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
var adminMessages = {
  ko: {
    adminH1: "\uACB0\uC81C, \uBC1C\uAE09, \uC804\uB2EC \uAD00\uB9AC",
    adminLead: "\uACB0\uC81C \uC218\uB2E8 \uAD00\uB9AC, \uAD6C\uB9E4 \uC694\uCCAD \uAC80\uD1A0, Pro \uD0A4 \uBC1C\uAE09, \uC218\uB3D9 \uC774\uBA54\uC77C \uC804\uB2EC\uC744 \uC704\uD55C \uAD00\uB9AC\uC790 \uD328\uB110\uC785\uB2C8\uB2E4.",
    authBannerEyebrow: "\uC6B4\uC601 \uAD8C\uD55C",
    authBannerTitle: "\uBA3C\uC800 \uB85C\uADF8\uC778\uD574\uC57C \uC2E4\uC2DC\uAC04 \uC6B4\uC601 \uD56D\uBAA9\uC744 \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    authBannerCopy: "\uB9E4\uCD9C, \uC218\uC9D1\uAE30 \uB3D9\uAE30\uD654, \uB7F0\uD0C0\uC784 \uC124\uC815, \uACB0\uC81C \uC218\uB2E8, \uD0A4 \uBC1C\uAE09\uC740 \uAD00\uB9AC\uC790 \uD1A0\uD070 \uAC80\uC99D \uC804\uAE4C\uC9C0 \uC7A0\uAE08 \uC0C1\uD0DC\uB85C \uC720\uC9C0\uB429\uB2C8\uB2E4.",
    authOverlayLabel: "\uAD00\uB9AC\uC790 \uD1A0\uD070\uC73C\uB85C \uB85C\uADF8\uC778\uD558\uBA74 \uC774 \uC139\uC158\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    tokenLabel: "\uAD00\uB9AC\uC790 \uD1A0\uD070",
    tokenApply: "\uB85C\uADF8\uC778",
    tokenLogout: "\uB85C\uADF8\uC544\uC6C3",
    tokenPlaceholder: "\uAD00\uB9AC\uC790 \uC811\uADFC \uD1A0\uD070",
    tokenStatusDefault: "/api/admin/* \uC811\uADFC\uC744 \uC704\uD574 \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4",
    statPending: "\uBBF8\uACB0 \uC8FC\uBB38",
    statPaid: "\uACB0\uC81C \uD655\uC778, \uD0A4 \uB300\uAE30",
    statIssued: "\uBC1C\uAE09\uB41C \uD0A4",
    statMethods: "\uD65C\uC131 \uACB0\uC81C \uC218\uB2E8",
    statWebhookProcessed: "\uC6F9\uD6C5 \uCC98\uB9AC\uB428",
    statWebhookIgnored: "\uC6F9\uD6C5 \uBB34\uC2DC\uB428",
    statWebhookRejected: "\uC6F9\uD6C5 \uAC70\uBD80\uB428",
    statWebhookDuplicates: "\uC6F9\uD6C5 \uC911\uBCF5 \uAC10\uC9C0",
    paymentMethodsTitle: "\uACB0\uC81C \uC218\uB2E8",
    paymentMethodsCopy: "\uD65C\uC131\uD654\uB41C \uC218\uB2E8\uB9CC \uB79C\uB529 \uD398\uC774\uC9C0\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
    reloadBtn: "\uC0C8\uB85C\uACE0\uCE68",
    colName: "\uC774\uB984",
    colSummary: "\uC694\uC57D",
    colAction: "\uC561\uC158",
    colEnabled: "\uD65C\uC131",
    colActions: "\uAD00\uB9AC",
    methodNameLabel: "\uACB0\uC81C \uC218\uB2E8 \uC774\uB984",
    methodSortLabel: "\uC815\uB82C \uC21C\uC11C",
    methodSummaryLabel: "\uC694\uC57D",
    methodInstructionsLabel: "\uC548\uB0B4\uC0AC\uD56D",
    methodCtaLabel: "CTA \uB808\uC774\uBE14",
    methodActionUrlLabel: "\uC678\uBD80 \uB9C1\uD06C",
    methodEnabledLabel: "\uD65C\uC131",
    addMethodBtn: "\uACB0\uC81C \uC218\uB2E8 \uCD94\uAC00",
    ordersTitle: "\uAD6C\uB9E4 \uC694\uCCAD",
    ordersCopy: "\uACB0\uC81C \uD655\uC778 \uD6C4 \uD0A4\uB97C \uBC1C\uAE09\uD558\uACE0, \uC774\uBA54\uC77C \uCD08\uC548\uC744 \uBCF5\uC0AC\uD558\uC138\uC694.",
    colBuyer: "\uAD6C\uB9E4\uC790",
    colMethod: "\uACB0\uC81C \uC218\uB2E8",
    colStatus: "\uC0C1\uD0DC",
    colCreated: "\uC0DD\uC131\uC77C",
    licensesTitle: "\uBC1C\uAE09\uB41C \uD0A4",
    licensesCopy: "\uC0DD\uC131\uB41C \uBAA8\uB4E0 \uD0A4\uB294 \uBBF8\uB9AC\uBCF4\uAE30, \uC218\uB839\uC778, \uC0C1\uD0DC\uC640 \uD568\uAED8 \uC800\uC7A5\uB429\uB2C8\uB2E4.",
    colHolder: "\uC218\uB839\uC778",
    colIssuedAt: "\uBC1C\uAE09\uC77C",
    colPreview: "\uBBF8\uB9AC\uBCF4\uAE30",
    emailDraftTitle: "\uC774\uBA54\uC77C \uCD08\uC548",
    emailDraftCopy: "\uB2E8\uC21C\uD558\uACE0 \uCD94\uC801 \uAC00\uB2A5\uD558\uBA70 \uC624\uD504\uB77C\uC778 \uD0A4 \uC804\uB2EC\uC5D0 \uCD5C\uC801\uD654\uB41C \uBC29\uC2DD\uC785\uB2C8\uB2E4.",
    emailPreviewLabel: "\uBBF8\uB9AC\uBCF4\uAE30",
    copyEmailBtn: "\uC774\uBA54\uC77C \uCD08\uC548 \uBCF5\uC0AC",
    emailStatusDefault: "\uBC1C\uAE09\uB41C \uC8FC\uBB38\uC744 \uC120\uD0DD\uD558\uBA74 \uC804\uB2EC \uD14D\uC2A4\uD2B8\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
    historyTitle: "\uC774\uBCA4\uD2B8 \uAE30\uB85D",
    historyCopy: "\uD0A4, \uACB0\uC81C, \uC6F9\uD6C5 \uC774\uBCA4\uD2B8 \uB0B4\uC5ED (\uAC70\uBD80\xB7\uC911\uBCF5\xB7\uBB34\uC2DC \uD3EC\uD568).",
    filterKindLabel: "\uC885\uB958",
    filterProviderLabel: "\uD504\uB85C\uBC14\uC774\uB354",
    filterReasonLabel: "\uC774\uC720",
    allOption: "\uC804\uCCB4",
    colWhen: "\uC2DC\uAC04",
    colEventKind: "\uC774\uBCA4\uD2B8",
    colProvider: "\uD504\uB85C\uBC14\uC774\uB354",
    colEventId: "\uC774\uBCA4\uD2B8 ID",
    colReason: "\uC774\uC720",
    colMessage: "\uBA54\uC2DC\uC9C0",
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    dashboardLoaded: "\uB300\uC2DC\uBCF4\uB4DC \uB85C\uB4DC \uC644\uB8CC",
    tokenSaving: "\uB85C\uADF8\uC778 \uCC98\uB9AC \uC911...",
    tokenCleared: "\uB85C\uADF8\uC544\uC6C3\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    dashboardError: "\uB300\uC2DC\uBCF4\uB4DC\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    noHistoryMatch: "\uC120\uD0DD\uD55C \uD544\uD130\uC5D0 \uB9DE\uB294 \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    btnEnable: "\uD65C\uC131\uD654",
    btnDisable: "\uBE44\uD65C\uC131\uD654",
    btnMarkPaid: "\uACB0\uC81C \uD655\uC778",
    btnIssueKey: "\uD0A4 \uBC1C\uAE09",
    btnPreviewEmail: "\uC774\uBA54\uC77C \uBBF8\uB9AC\uBCF4\uAE30",
    btnReissueKey: "\uC7AC\uBC1C\uAE09",
    btnSendEmail: "\uC774\uBA54\uC77C \uBC1C\uC1A1",
    btnRevoke: "\uD3D0\uAE30",
    noActions: "\uB3D9\uC791 \uC5C6\uC74C",
    pillEnabled: "\uD65C\uC131",
    pillDisabled: "\uBE44\uD65C\uC131",
    emailDraftReady: "{email} \uCD08\uC548 \uC900\uBE44\uB428",
    keyIssued: "{email}\uC5D0 \uD0A4 \uBC1C\uAE09\uB428",
    keyReissued: "{email}\uC5D0 \uD0A4 \uC7AC\uBC1C\uAE09\uB428",
    emailSent: "{email}\uB85C \uC774\uBA54\uC77C \uBC1C\uC1A1 \uC644\uB8CC",
    emailSendError: "\uC774\uBA54\uC77C \uBC1C\uC1A1 \uC2E4\uD328: {error}",
    nothingToCopy: "\uBCF5\uC0AC\uD560 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    emailCopied: "\uC774\uBA54\uC77C \uCD08\uC548\uC774 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB410\uC2B5\uB2C8\uB2E4.",
    requestFailed: "\uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
    revenueTitle: "\uB9E4\uCD9C \uD604\uD669",
    revenueCopy: "\uACB0\uC81C \uC644\uB8CC \uAE30\uC900 \uC608\uC0C1 \uB9E4\uCD9C\uC785\uB2C8\uB2E4. \uC2E4\uC81C \uC218\uB839\uC561\uACFC \uB2E4\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    revenueEstimate: "\uC608\uC0C1 \uB9E4\uCD9C",
    revenueTotalOrders: "\uC804\uCCB4 \uC8FC\uBB38",
    revenuePaid: "\uACB0\uC81C \uC644\uB8CC",
    revenueIssued: "\uD0A4 \uBC1C\uAE09\uB428",
    revenueRevoked: "\uD3D0\uAE30\uB41C \uD0A4",
    revenueReadyToSend: "\uBC1C\uC1A1 \uB300\uAE30",
    revenueSent: "\uBC1C\uC1A1 \uC644\uB8CC",
    revenueByMethod: "\uACB0\uC81C\uC218\uB2E8\uBCC4",
    revenueByMonth: "\uC6D4\uBCC4 \uC8FC\uBB38",
    revenueEmptyTitle: "\uC544\uC9C1 \uC9D1\uACC4\uB41C \uB9E4\uCD9C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    revenueEmptyCopy: "\uACB0\uC81C \uC644\uB8CC \uAC74\uC774 \uC0DD\uAE30\uBA74 \uC774 \uD45C\uC5D0 \uC790\uB3D9\uC73C\uB85C \uBC18\uC601\uB429\uB2C8\uB2E4.",
    colOrders: "\uC8FC\uBB38\uC218",
    colMonth: "\uC6D4",
    colPaid: "\uACB0\uC81C",
    colIssued: "\uBC1C\uAE09",
    mailerOn: "\uC774\uBA54\uC77C \uC790\uB3D9 \uBC1C\uC1A1: \uCF1C\uC9D0",
    mailerOff: "\uC774\uBA54\uC77C \uC790\uB3D9 \uBC1C\uC1A1: \uAEBC\uC9D0 (\uC218\uB3D9 \uBC1C\uC1A1 \uD544\uC694)",
    statDeliveryReady: "\uBC1C\uC1A1 \uB300\uAE30",
    statDeliverySent: "\uBC1C\uC1A1 \uC644\uB8CC",
    collectorTitle: "\uBA58\uC158 \uC218\uC9D1\uAE30",
    collectorCopy: "\uC218\uC9D1\uAE30 \uC0C1\uD0DC\uB97C \uC810\uAC80\uD558\uACE0, \uD3F4\uB9C1 \uC124\uC815\uC744 \uC218\uC815\uD558\uACE0, \uC989\uC2DC \uB3D9\uAE30\uD654\uB97C \uC2E4\uD589\uD569\uB2C8\uB2E4.",
    collectorSyncBtn: "\uC9C0\uAE08 \uB3D9\uAE30\uD654",
    collectorStateLabel: "\uC0C1\uD0DC",
    collectorLastSuccessLabel: "\uB9C8\uC9C0\uB9C9 \uC131\uACF5",
    collectorLastErrorLabel: "\uCD5C\uADFC \uC624\uB958",
    collectorHandleLabel: "Threads \uBD07 \uD578\uB4E4",
    collectorHandlePlaceholder: "threadsbot",
    collectorGraphLabel: "Graph API \uBC84\uC804",
    collectorGraphPlaceholder: "v1.0",
    collectorTokenLabel: "\uC561\uC138\uC2A4 \uD1A0\uD070 \uC624\uBC84\uB77C\uC774\uB4DC",
    collectorTokenPlaceholder: "\uC120\uD0DD \uC0AC\uD56D: \uC7A5\uAE30 \uC561\uC138\uC2A4 \uD1A0\uD070",
    collectorIntervalLabel: "\uD3F4\uB9C1 \uAC04\uACA9 (ms)",
    collectorFetchLabel: "\uAC00\uC838\uC62C \uAC1C\uC218",
    collectorPagesLabel: "\uCD5C\uB300 \uD398\uC774\uC9C0",
    collectorPublicHandleLabel: "\uACF5\uAC1C \uBD07 \uACC4\uC815",
    collectorProfileLink: "\uD504\uB85C\uD544 \uC5F4\uAE30",
    collectorHandleCopy: "\uC5EC\uAE30\uC11C \uBCC0\uACBD\uD55C \uD578\uB4E4\uC740 \uACF5\uAC1C scrapbook \uC548\uB0B4 \uBB38\uAD6C\uC640 \uC218\uC9D1\uAE30 \uC870\uD68C \uB300\uC0C1\uC5D0 \uD568\uAED8 \uBC18\uC601\uB429\uB2C8\uB2E4.",
    collectorSaveBtn: "\uC218\uC9D1\uAE30 \uC124\uC815 \uC800\uC7A5",
    collectorStateRunning: "\uC2E4\uD589 \uC911",
    collectorStateReady: "\uC900\uBE44\uB428",
    collectorStateDisabled: "\uBE44\uD65C\uC131",
    collectorSaving: "\uC218\uC9D1\uAE30 \uC124\uC815 \uC800\uC7A5 \uC911...",
    collectorSaved: "\uC218\uC9D1\uAE30 \uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    collectorSyncing: "\uBA58\uC158\uC744 \uC989\uC2DC \uB3D9\uAE30\uD654\uD558\uB294 \uC911...",
    collectorSynced: "\uC218\uC9D1\uAE30 \uC218\uB3D9 \uB3D9\uAE30\uD654\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    runtimeTitle: "\uB7F0\uD0C0\uC784 \uC124\uC815",
    runtimeCopy: "\uC11C\uBC84 \uD30C\uC77C\uC744 \uC9C1\uC811 \uC218\uC815\uD558\uC9C0 \uC54A\uACE0 public origin, \uB370\uC774\uD130\uBCA0\uC774\uC2A4, SMTP\uB97C \uBCC0\uACBD\uD569\uB2C8\uB2E4.",
    publicOriginLabel: "Public origin",
    publicOriginPlaceholder: "https://ss-threads.dahanda.dev",
    databaseTitle: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4",
    databaseBackendLabel: "\uBC31\uC5D4\uB4DC",
    databaseBackendFile: "\uD30C\uC77C",
    databaseBackendPostgres: "Postgres",
    databaseFilePathLabel: "\uD30C\uC77C \uACBD\uB85C",
    databaseFilePathPlaceholder: "/var/app/output/web-admin-data.json",
    databaseUrlLabel: "Postgres URL",
    databaseUrlPlaceholder: "postgres://user:pass@host:5432/db",
    databaseTableLabel: "\uD14C\uC774\uBE14 \uC774\uB984",
    databaseTablePlaceholder: "threads_web_store",
    databaseStoreKeyLabel: "Store key",
    databaseStoreKeyPlaceholder: "default",
    databaseActiveLabel: "\uD604\uC7AC \uD65C\uC131 \uB370\uC774\uD130\uBCA0\uC774\uC2A4",
    databaseClearUrlLabel: "\uC800\uC7A5\uB41C Postgres URL\uC744 \uC800\uC7A5 \uC2DC \uC81C\uAC70",
    databaseUrlConfiguredPlaceholder: "\uC774\uBBF8 \uC800\uC7A5\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uAD50\uCCB4\uD560 \uC0C8 URL\uB9CC \uC785\uB825\uD558\uC138\uC694.",
    databaseTesting: "DB \uC5F0\uACB0\uC744 \uD14C\uC2A4\uD2B8\uD558\uB294 \uC911...",
    databaseTestBtn: "DB \uC5F0\uACB0 \uD14C\uC2A4\uD2B8",
    runtimeSaving: "\uB7F0\uD0C0\uC784 \uC124\uC815 \uC800\uC7A5 \uC911...",
    runtimeSaveBtn: "\uB7F0\uD0C0\uC784 \uC124\uC815 \uC800\uC7A5",
    runtimeSaved: "\uB7F0\uD0C0\uC784 \uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    runtimeMigrated: "\uB7F0\uD0C0\uC784 \uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uACE0 \uB370\uC774\uD130\uAC00 \uC0C8 \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uB85C \uC774\uC804\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    runtimeRestartRequired: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC0C8 \uBC31\uC5D4\uB4DC\uB97C \uC4F0\uAE30 \uC804\uC5D0 \uC11C\uBC84\uB97C \uC7AC\uC2DC\uC791\uD558\uC138\uC694.",
    smtpTitle: "SMTP",
    smtpHostLabel: "\uD638\uC2A4\uD2B8",
    smtpHostPlaceholder: "smtp.resend.com",
    smtpPortLabel: "\uD3EC\uD2B8",
    smtpUserLabel: "\uC0AC\uC6A9\uC790",
    smtpUserPlaceholder: "apikey",
    smtpPassLabel: "\uBE44\uBC00\uBC88\uD638",
    smtpPassPlaceholder: "secret",
    smtpFromLabel: "\uBCF4\uB0B4\uB294 \uC8FC\uC18C",
    smtpFromPlaceholder: "hello@example.com",
    smtpSecureLabel: "TLS / secure \uC804\uC1A1 \uC0AC\uC6A9",
    smtpClearPassLabel: "\uC800\uC7A5\uB41C SMTP \uBE44\uBC00\uBC88\uD638\uB97C \uC800\uC7A5 \uC2DC \uC81C\uAC70",
    smtpPassConfiguredPlaceholder: "\uC774\uBBF8 \uC800\uC7A5\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uAD50\uCCB4\uD560 \uC0C8 \uBE44\uBC00\uBC88\uD638\uB9CC \uC785\uB825\uD558\uC138\uC694.",
    smtpTesting: "SMTP \uC5F0\uACB0\uC744 \uD14C\uC2A4\uD2B8\uD558\uB294 \uC911...",
    smtpTestBtn: "SMTP \uD14C\uC2A4\uD2B8",
    storefrontTitle: "\uC2A4\uD1A0\uC5B4\uD504\uB860\uD2B8 \uC124\uC815",
    storefrontCopy: "\uAD6C\uB9E4\uC790\uC5D0\uAC8C \uBCF4\uC774\uB294 \uB79C\uB529 \uD398\uC774\uC9C0 \uBB38\uAD6C\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.",
    storefrontProductNameLabel: "\uC81C\uD488\uBA85",
    storefrontSupportEmailLabel: "\uC9C0\uC6D0 \uC774\uBA54\uC77C",
    storefrontHeadlineLabel: "\uD5E4\uB4DC\uB77C\uC778",
    storefrontSubheadlineLabel: "\uC11C\uBE0C\uD5E4\uB4DC\uB77C\uC778",
    storefrontPriceLabelLabel: "\uAC00\uACA9 \uB808\uC774\uBE14",
    storefrontPriceValueLabel: "\uAC00\uACA9 \uAC12",
    storefrontUpdatesLabel: "\uD3EC\uD568 \uC5C5\uB370\uC774\uD2B8",
    storefrontHeroNotesLabel: "Hero \uB178\uD2B8",
    storefrontHeroNotesPlaceholder: "\uD55C \uC904\uC5D0 \uD558\uB098\uC529 \uC785\uB825",
    storefrontFaqsLabel: "FAQ",
    storefrontFaqsPlaceholder: "\uC9C8\uBB38 :: \uB2F5\uBCC0",
    storefrontSaving: "\uC2A4\uD1A0\uC5B4\uD504\uB860\uD2B8 \uC124\uC815 \uC800\uC7A5 \uC911...",
    storefrontSaveBtn: "\uC2A4\uD1A0\uC5B4\uD504\uB860\uD2B8 \uC800\uC7A5",
    storefrontSaved: "\uC2A4\uD1A0\uC5B4\uD504\uB860\uD2B8 \uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    methodEditBtn: "\uC218\uC815",
    methodSaveBtn: "\uACB0\uC81C \uC218\uB2E8 \uC800\uC7A5",
    methodCancelBtn: "\uC218\uC815 \uCDE8\uC18C",
    methodNamePlaceholder: "\uACC4\uC88C\uC774\uCCB4",
    methodSummaryPlaceholder: "\uC218\uB3D9 \uD655\uC778\uC774 \uD544\uC694\uD55C \uAD6D\uB0B4 \uACB0\uC81C \uBC29\uC2DD",
    methodInstructionsPlaceholder: "\uAD6C\uB9E4\uC790\uAC00 \uACB0\uC81C\uB97C \uC644\uB8CC\uD558\uAC70\uB098 \uD655\uC778\uD574\uC57C \uD558\uB294 \uC808\uCC28\uB97C \uC801\uC5B4\uC8FC\uC138\uC694.",
    methodActionLabelPlaceholder: "\uAD6C\uB9E4 \uC694\uCCAD \uBCF4\uB0B4\uAE30",
    methodActionUrlPlaceholder: "https://...",
    methodSaving: "\uACB0\uC81C \uC218\uB2E8 \uC800\uC7A5 \uC911...",
    methodEditing: "\uACB0\uC81C \uC218\uB2E8 \uC218\uC815 \uC911\uC785\uB2C8\uB2E4.",
    methodSaved: "\uACB0\uC81C \uC218\uB2E8\uC774 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    methodCreated: "\uACB0\uC81C \uC218\uB2E8\uC774 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    methodEditCancelled: "\uC218\uC815\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    methodsEmptyTitle: "\uB4F1\uB85D\uB41C \uACB0\uC81C \uC218\uB2E8\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    methodsEmptyCopy: "\uCCAB \uACB0\uC81C \uC218\uB2E8\uC744 \uCD94\uAC00\uD558\uBA74 \uAD6C\uB9E4 \uD398\uC774\uC9C0\uC5D0 \uBC14\uB85C \uB178\uCD9C\uB429\uB2C8\uB2E4.",
    ordersEmptyTitle: "\uB4E4\uC5B4\uC628 \uAD6C\uB9E4 \uC694\uCCAD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    ordersEmptyCopy: "\uC0C8 \uAD6C\uB9E4 \uC694\uCCAD\uC774 \uB4E4\uC5B4\uC624\uBA74 \uC774 \uD45C\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
    orderMarkingPaid: "\uACB0\uC81C \uC644\uB8CC\uB85C \uD45C\uC2DC\uD558\uB294 \uC911...",
    orderMarkedPaid: "{email} \uC8FC\uBB38\uC744 \uACB0\uC81C \uC644\uB8CC\uB85C \uD45C\uC2DC\uD588\uC2B5\uB2C8\uB2E4.",
    keyIssuing: "\uD0A4\uB97C \uBC1C\uAE09\uD558\uB294 \uC911...",
    keyReissuing: "\uD0A4\uB97C \uC7AC\uBC1C\uAE09\uD558\uB294 \uC911...",
    emailSending: "\uC774\uBA54\uC77C\uC744 \uBC1C\uC1A1\uD558\uB294 \uC911...",
    licensesEmptyTitle: "\uBC1C\uAE09\uB41C \uD0A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    licensesEmptyCopy: "\uD0A4\uB97C \uBC1C\uAE09\uD558\uBA74 \uC774 \uD45C\uC5D0 \uAE30\uB85D\uB429\uB2C8\uB2E4.",
    licenseRevoking: "\uD0A4\uB97C \uD3D0\uAE30\uD558\uB294 \uC911...",
    licenseRevoked: "{email} \uD0A4\uB97C \uD3D0\uAE30\uD588\uC2B5\uB2C8\uB2E4.",
    historyEmptyTitle: "\uD45C\uC2DC\uD560 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    historyEmptyCopy: "\uACB0\uC81C, \uD0A4, \uC6F9\uD6C5 \uC774\uBCA4\uD2B8\uAC00 \uBC1C\uC0DD\uD558\uBA74 \uC5EC\uAE30\uC5D0 \uB204\uC801\uB429\uB2C8\uB2E4.",
    emailPreviewLoading: "\uC774\uBA54\uC77C \uCD08\uC548\uC744 \uC900\uBE44\uD558\uB294 \uC911...",
    issueExpiryLabel: "\uB2E4\uC74C \uBC1C\uAE09 \uD0A4 \uB9CC\uB8CC\uC77C",
    issueExpiryHint: "Issue key \uB610\uB294 Reissue\uB97C \uB204\uB97C \uB54C \uC801\uC6A9\uB429\uB2C8\uB2E4. \uBE44\uC6CC\uB450\uBA74 \uB9CC\uB8CC\uC77C \uC5C6\uB294 \uD0A4\uB97C \uBC1C\uAE09\uD569\uB2C8\uB2E4.",
    issueExpiryClear: "\uB9CC\uB8CC\uC77C \uC9C0\uC6B0\uAE30",
    issueExpiryInvalid: "\uB9CC\uB8CC\uC77C\uC740 YYYY-MM-DD \uD615\uC2DD\uC758 \uC720\uD6A8\uD55C \uB0A0\uC9DC\uC5EC\uC57C \uD569\uB2C8\uB2E4."
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
    langKo: "\uD55C\uAD6D\uC5B4",
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
    issueExpiryInvalid: "Expiry must be a valid YYYY-MM-DD date."
  },
  ...adminMessageLocales
};
var scrapbookMessages = {
  ko: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription: "\uB313\uAE00 \uBA58\uC158\uC73C\uB85C \uC800\uC7A5\uD55C Threads \uAE00\uC744 private scrapbook\uC5D0 \uBAA8\uC73C\uACE0 Markdown\uC73C\uB85C \uB0B4\uBCF4\uB0C5\uB2C8\uB2E4.",
    scrapbookHomeAriaLabel: "Threads \uB3C4\uAD6C \uD648",
    scrapbookWorkspaceAriaLabel: "Scrapbook \uC791\uC5C5\uACF5\uAC04",
    scrapbookLocaleLabel: "\uC5B8\uC5B4",
    scrapbookNavHome: "\uD648\uC73C\uB85C",
    scrapbookNavCurrent: "\uB0B4 scrapbook",
    scrapbookHeroEyebrow: "\uBA58\uC158 scrapbook",
    scrapbookHeroTitle: "\uBA58\uC158\uC73C\uB85C \uBAA8\uC740 Threads\uB97C private scrapbook\uC5D0 \uC800\uC7A5.",
    scrapbookHeroLead: "\uC800\uC7A5\uD558\uACE0 \uC2F6\uC740 \uAE00\uC5D0 {handleStrong} \uC744 \uBA58\uC158\uD558\uBA74, \uC11C\uBE44\uC2A4 \uACC4\uC815\uC740 \uBA58\uC158\uB9CC \uBC1B\uACE0 \uB85C\uADF8\uC778\uC73C\uB85C \uC5F0\uACB0\uD55C \uB0B4 Threads \uACC4\uC815\uC758 scrapbook\uC5D0\uB9CC \uBCF4\uAD00\uB429\uB2C8\uB2E4.",
    scrapbookConnectButton: "Threads\uB85C \uB85C\uADF8\uC778",
    scrapbookConnectBusy: "\uC5F0\uACB0 \uD398\uC774\uC9C0 \uC5EC\uB294 \uC911...",
    scrapbookCopyLoginLink: "\uB85C\uADF8\uC778 \uB9C1\uD06C \uBCF5\uC0AC",
    scrapbookHeroHowItWorks: "\uC791\uB3D9 \uBC29\uC2DD",
    scrapbookMobileOauthNote: "\uBAA8\uBC14\uC77C\uC5D0\uC11C\uB294 \uBE0C\uB77C\uC6B0\uC800\uC6A9 \uC5F0\uACB0 \uD398\uC774\uC9C0\uC5D0\uC11C {copyLoginLinkStrong}\uB97C \uB204\uB978 \uB4A4, \uC0C8 \uD0ED \uC8FC\uC18C\uCC3D\uC5D0 \uBD99\uC5EC\uB123\uB294 \uBC29\uC2DD\uC73C\uB85C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "private scrapbook",
    scrapbookHeroNoteExport: "Markdown export",
    scrapbookFlowLabel: "\uD750\uB984",
    scrapbookFlowStep1: "\uB0B4 Threads \uACC4\uC815\uC744 \uD55C \uBC88 \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
    scrapbookFlowStep2: "Threads\uC5D0\uC11C \uC800\uC7A5\uD560 \uAE00\uC5D0 {handleInline} \uC744 \uBA58\uC158\uD569\uB2C8\uB2E4.",
    scrapbookFlowStep3: "\uC800\uC7A5\uB41C \uD56D\uBAA9\uC744 \uC6F9\uC5D0\uC11C \uD655\uC778\uD558\uACE0 Markdown\uC73C\uB85C \uAEBC\uB0C5\uB2C8\uB2E4.",
    scrapbookConnectTag: "Threads \uC5F0\uACB0",
    scrapbookConnectTitle: "\uB0B4 Threads \uACC4\uC815 \uC5F0\uACB0",
    scrapbookConnectCopy: "\uC5EC\uAE30\uC11C\uB294 \uB0B4 scrapbook \uC18C\uC720 \uACC4\uC815\uB9CC \uC5F0\uACB0\uD569\uB2C8\uB2E4. \uC11C\uBE44\uC2A4 \uACC4\uC815\uC740 {handleInline} \uC73C\uB85C \uB530\uB85C \uC6B4\uC601\uB418\uACE0, \uB85C\uADF8\uC778\uD55C \uACC4\uC815\uACFC \uB313\uAE00 \uC791\uC131 \uACC4\uC815\uC774 \uC77C\uCE58\uD560 \uB54C\uB9CC \uB0B4 \uBCF4\uAD00\uD568\uC73C\uB85C \uB4E4\uC5B4\uC635\uB2C8\uB2E4.",
    scrapbookConnectedTag: "\uC5F0\uACB0\uB428",
    scrapbookProfileLink: "Threads \uD504\uB85C\uD544 \uBCF4\uAE30",
    scrapbookLogout: "\uB0B4 \uACC4\uC815 \uC5F0\uACB0 \uB04A\uAE30",
    scrapbookTabInbox: "Inbox",
    scrapbookTabWatchlists: "Watchlists",
    scrapbookTabSearches: "Searches",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "\uC791\uB3D9 \uBC29\uC2DD",
    scrapbookHowTitle: "\uC124\uC815\uC740 \uD55C \uBC88, \uC800\uC7A5\uC740 \uBA58\uC158\uB9CC.",
    scrapbookHowCopy: "\uACF5\uAC1C \uB313\uAE00\uC740 \uD2B8\uB9AC\uAC70 \uC5ED\uD560\uB9CC \uD558\uACE0, \uC800\uC7A5\uB41C \uACB0\uACFC\uB294 \uB0B4 scrapbook\uC5D0\uB9CC \uBCF4\uC785\uB2C8\uB2E4.",
    scrapbookHowStep1Title: "Threads\uB85C \uB85C\uADF8\uC778",
    scrapbookHowStep1Desc: "\uB0B4 Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD574 \uC5B4\uB5A4 \uB313\uAE00 \uC791\uC131\uC790\uAC00 \uC5B4\uB5A4 scrapbook \uC18C\uC720\uC790\uC778\uC9C0 \uC11C\uBC84\uAC00 \uC815\uD655\uD788 \uC2DD\uBCC4\uD558\uAC8C \uD569\uB2C8\uB2E4.",
    scrapbookHowStep2Title: "\uB313\uAE00\uC5D0 \uBD07 \uBA58\uC158",
    scrapbookHowStep2Desc: "\uC800\uC7A5\uD558\uACE0 \uC2F6\uC740 \uAE00\uC5D0 {handleInline} \uB9CC \uBA58\uC158\uD558\uBA74 \uC218\uC9D1\uAE30\uAC00 \uADF8 \uC774\uBCA4\uD2B8\uB97C \uBCF4\uAD00\uD569\uB2C8\uB2E4.",
    scrapbookHowStep3Title: "\uC6F9\uC5D0\uC11C \uAC80\uD1A0\uD558\uACE0 \uB0B4\uBCF4\uB0B4\uAE30",
    scrapbookHowStep3Desc: "\uC6F9 scrapbook\uC5D0\uC11C \uC800\uC7A5 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uACE0 Markdown \uBCF5\uC0AC\uB098 \uB2E4\uC6B4\uB85C\uB4DC\uB85C \uB2E4\uC74C \uD234\uB85C \uB118\uAE41\uB2C8\uB2E4.",
    scrapbookInboxEyebrow: "Inbox",
    scrapbookInboxTitle: "\uBA58\uC158\uC73C\uB85C \uBAA8\uC740 inbox",
    scrapbookInboxCopy: "\uC800\uC7A5\uB41C \uD56D\uBAA9\uC740 \uAC8C\uC2DC\uD310\uCC98\uB7FC \uD55C \uC904\uC529 \uC815\uB9AC\uB418\uBA70, \uD589\uC744 \uD074\uB9AD\uD558\uBA74 \uBCF8\uBB38\uACFC \uB0B4\uBCF4\uB0B4\uAE30 \uBA54\uB274\uAC00 \uC5F4\uB9BD\uB2C8\uB2E4.",
    scrapbookSelectAll: "\uC804\uCCB4 \uC120\uD0DD",
    scrapbookExportSelected: "\uC120\uD0DD ZIP \uB0B4\uBCF4\uB0B4\uAE30",
    scrapbookExportAll: "\uC804\uCCB4 ZIP \uB0B4\uBCF4\uB0B4\uAE30",
    scrapbookArchiveLoginTitle: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookArchiveLoginCopy: "Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD558\uBA74 \uC800\uC7A5\uB41C \uBA58\uC158\uC774 \uC5EC\uAE30\uC5D0 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.",
    scrapbookArchiveTableTitle: "\uC81C\uBAA9",
    scrapbookArchiveTableDate: "\uC218\uC9D1\uC77C\uC790",
    scrapbookArchiveTableSource: "\uCD9C\uCC98",
    scrapbookArchiveTableTags: "\uD0DC\uADF8",
    scrapbookNoResults: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookWatchlistsEyebrow: "Watchlists",
    scrapbookWatchlistsTitle: "\uACF5\uAC1C \uACC4\uC815 \uAC10\uC2DC",
    scrapbookWatchlistsCopy: "\uACF5\uAC1C Threads \uACC4\uC815\uC744 \uB4F1\uB85D\uD558\uACE0, \uC870\uAC74\uC5D0 \uB9DE\uB294 \uC0C8 \uAE00\uB9CC \uBAA8\uC74D\uB2C8\uB2E4.",
    scrapbookWatchlistTargetHandle: "\uB300\uC0C1 \uD578\uB4E4",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "\uD3EC\uD568 \uD0A4\uC6CC\uB4DC",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "\uC81C\uC678 \uD0A4\uC6CC\uB4DC",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "\uBBF8\uB514\uC5B4 \uD0C0\uC785",
    scrapbookFilterIncludeLabel: "\uD3EC\uD568",
    scrapbookFilterExcludeLabel: "\uC81C\uC678",
    scrapbookFilterMediaLabel: "\uBBF8\uB514\uC5B4",
    scrapbookFilterAutoArchiveLabel: "\uC790\uB3D9 \uBCF4\uAD00",
    scrapbookFilterAuthorLabel: "\uC791\uC131\uC790",
    scrapbookMediaTypeText: "\uD14D\uC2A4\uD2B8\uB9CC",
    scrapbookMediaTypeImage: "\uC774\uBBF8\uC9C0",
    scrapbookMediaTypeVideo: "\uB3D9\uC601\uC0C1",
    scrapbookMediaTypeCarousel: "\uCE90\uB7EC\uC140",
    scrapbookWatchlistAutoArchive: "\uC0C8 \uACB0\uACFC\uB97C inbox\uC5D0\uB3C4 \uBC14\uB85C \uC800\uC7A5",
    scrapbookWatchlistSubmit: "Watchlist \uCD94\uAC00",
    scrapbookWatchlistsEmptyTitle: "\uB4F1\uB85D\uB41C watchlist\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookWatchlistsEmptyCopy: "\uACF5\uAC1C \uACC4\uC815\uC744 \uCD94\uAC00\uD558\uBA74 \uCD5C\uADFC \uAE00\uC744 \uAC00\uC838\uC640 scrapbook \uADDC\uCE59\uC73C\uB85C \uC815\uB9AC\uD569\uB2C8\uB2E4.",
    scrapbookSearchesEyebrow: "Searches",
    scrapbookSearchesTitle: "\uD0A4\uC6CC\uB4DC \uBAA8\uB2C8\uD130\uB9C1",
    scrapbookSearchesCopy: "\uC800\uC7A5 \uAC80\uC0C9\uC5B4\uB97C \uB4F1\uB85D\uD558\uACE0 \uBC18\uBCF5\uB418\uB294 \uB178\uC774\uC988\uB97C \uC81C\uC678\uD55C \uACB0\uACFC\uB9CC \uCD94\uB9BD\uB2C8\uB2E4.",
    scrapbookSearchQuery: "\uAC80\uC0C9\uC5B4",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "\uC791\uC131\uC790 \uD544\uD130",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "\uC81C\uC678 \uD578\uB4E4",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "\uAC80\uC0C9 \uBC29\uC2DD",
    scrapbookSearchTypeTop: "\uC778\uAE30\uC21C",
    scrapbookSearchTypeRecent: "\uCD5C\uC2E0\uC21C",
    scrapbookSearchAutoArchive: "\uC0C8 \uACB0\uACFC\uB97C inbox\uC5D0\uB3C4 \uBC14\uB85C \uC800\uC7A5",
    scrapbookSearchSubmit: "Search \uCD94\uAC00",
    scrapbookSearchesEmptyTitle: "\uC800\uC7A5\uB41C search monitor\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookSearchesEmptyCopy: "\uD0A4\uC6CC\uB4DC\uB97C \uB4F1\uB85D\uD558\uBA74 \uACB0\uACFC \uC2A4\uD2B8\uB9BC\uACFC archive \uC561\uC158\uC744 \uD568\uAED8 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "\uB0B4 \uACC4\uC815 \uC131\uACFC \uCD94\uC801",
    scrapbookInsightsCopy: "\uC5F0\uACB0\uB41C Threads \uACC4\uC815\uC758 \uD504\uB85C\uD544/\uD3EC\uC2A4\uD2B8 \uC778\uC0AC\uC774\uD2B8\uB97C \uC2DC\uACC4\uC5F4\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
    scrapbookInsightsRecentSnapshot: "\uCD5C\uADFC \uC2A4\uB0C5\uC0F7",
    scrapbookInsightsNotLoaded: "\uC544\uC9C1 \uBD88\uB7EC\uC624\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
    scrapbookInsightsRefresh: "Insights \uC0C8\uB85C\uACE0\uCE68",
    scrapbookMetricFollowers: "Followers",
    scrapbookMetricProfileViews: "Profile views",
    scrapbookMetricViews: "Views",
    scrapbookMetricLikes: "Likes",
    scrapbookMetricReplies: "Replies",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "\uC544\uC9C1 \uC800\uC7A5\uB41C \uC778\uC0AC\uC774\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookInsightsEmptyCopy: "\uC0C8\uB85C\uACE0\uCE68\uC744 \uB204\uB974\uBA74 \uB0B4 \uACC4\uC815\uACFC \uCD5C\uADFC \uD3EC\uC2A4\uD2B8 \uC131\uACFC\uB97C \uAC00\uC838\uC635\uB2C8\uB2E4.",
    scrapbookFooterTagline: "Public reply trigger, private scrapbook result.",
    scrapbookDateNone: "\uC5C6\uC74C",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "\uBCC0\uD654 \uC5C6\uC74C",
    scrapbookConnectServerNotReady: "Threads \uB85C\uADF8\uC778\uC740 \uC544\uC9C1 \uC11C\uBC84 \uC124\uC815 \uC911\uC785\uB2C8\uB2E4. \uC571 ID\uC640 \uC2DC\uD06C\uB9BF\uC774 \uC11C\uBC84\uC5D0 \uB4E4\uC5B4\uAC00\uBA74 \uBC14\uB85C \uC5F0\uACB0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookArchiveFallbackAuthorPost: "@{handle} post",
    scrapbookArchiveFallbackSavedItem: "\uC800\uC7A5\uB41C Threads \uD56D\uBAA9",
    scrapbookArchiveSelectionSummary: "{count}\uAC1C \uC120\uD0DD\uB428 \xB7 \uCD1D {total}\uAC1C",
    scrapbookArchiveSelectionTotal: "\uCD1D {total}\uAC1C",
    scrapbookMediaIncluded: "media {count}\uAC1C\uAC00 export\uC5D0 \uD3EC\uD568\uB429\uB2C8\uB2E4.",
    scrapbookReplyHeader: "\uC791\uC131\uC790 \uB313\uAE00 {count}\uAC1C",
    scrapbookReplyLabel: "\uB313\uAE00 {index}",
    scrapbookReplyOpenOriginal: "\uB313\uAE00 \uC6D0\uBB38 \uBCF4\uAE30",
    scrapbookCopied: "\uBCF5\uC0AC\uB428",
    scrapbookCopyMarkdown: "Markdown \uBCF5\uC0AC",
    scrapbookClipboardError: "\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uBE0C\uB77C\uC6B0\uC800 \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uC138\uC694.",
    scrapbookExportPreparing: "ZIP \uC900\uBE44 \uC911...",
    scrapbookExportChooseItems: "\uB0B4\uBCF4\uB0BC \uD56D\uBAA9\uC744 \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.",
    scrapbookExportReady: "ZIP export\uB97C \uC900\uBE44\uD588\uC2B5\uB2C8\uB2E4. {count}\uAC1C \uD56D\uBAA9\uC744 \uB0B4\uB824\uBC1B\uC2B5\uB2C8\uB2E4.",
    scrapbookExportFailed: "ZIP export\uB97C \uB9CC\uB4E4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookTriggerView: "\uD2B8\uB9AC\uAC70 \uBCF4\uAE30",
    scrapbookImagesHide: "\uC774\uBBF8\uC9C0 \uB2EB\uAE30",
    scrapbookImagesShow: "\uC774\uBBF8\uC9C0 {count}\uAC1C \uBCF4\uAE30",
    scrapbookOpenOriginal: "\uC6D0\uBB38 \uBCF4\uAE30",
    scrapbookDownloadMarkdown: "Markdown \uB2E4\uC6B4\uB85C\uB4DC",
    scrapbookDownloadZip: "ZIP \uB2E4\uC6B4\uB85C\uB4DC",
    scrapbookArchiveLoginRequiredCopy: "Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD558\uBA74 \uBA58\uC158 inbox\uC640 extension cloud \uC800\uC7A5 \uD56D\uBAA9\uC774 \uC5EC\uAE30\uC5D0 \uD568\uAED8 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.",
    scrapbookArchiveEmptyTitle: "\uC544\uC9C1 \uC800\uC7A5\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookArchiveEmptyCopy: "\uBA58\uC158 inbox, extension cloud \uC800\uC7A5, watchlist auto-archive, search archive\uAC00 \uC5EC\uAE30\uC5D0 \uBAA8\uC785\uB2C8\uB2E4.",
    scrapbookVerified: "\uC778\uC99D\uB428",
    scrapbookLastLogin: "\uB9C8\uC9C0\uB9C9 \uB85C\uADF8\uC778 {date}",
    scrapbookProfilePictureAlt: "{name} profile picture",
    scrapbookScopeReady: "\uAD8C\uD55C \uC900\uBE44 \uC644\uB8CC \xB7 {scopes}",
    scrapbookScopeReconnect: "\uACE0\uAE09 \uAE30\uB2A5\uC744 \uC4F0\uB824\uBA74 Threads \uC7AC\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uB204\uB77D \uAD8C\uD55C: {scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "\uC6D0\uBB38",
    scrapbookTrackedSaveInbox: "Inbox \uC800\uC7A5",
    scrapbookEmptyBody: "(\uBCF8\uBB38 \uC5C6\uC74C)",
    scrapbookWatchlistsLoginTitle: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookWatchlistsLoginCopy: "Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD574\uC57C watchlists\uB97C \uB9CC\uB4E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookWatchlistsReconnectTitle: "\uAD8C\uD55C \uC7AC\uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookWatchlistsReconnectCopy: "Threads\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD558\uBA74 profile discovery watchlist\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookWatchlistsResults: "\uACB0\uACFC {count}\uAC1C",
    scrapbookWatchlistsLastSync: "\uB9C8\uC9C0\uB9C9 \uB3D9\uAE30\uD654 {date}",
    scrapbookWatchlistsSyncNow: "\uC9C0\uAE08 \uB3D9\uAE30\uD654",
    scrapbookDelete: "\uC0AD\uC81C",
    scrapbookArchiveDeleteConfirm: '"{title}" \uD56D\uBAA9\uC744 scrapbook\uC5D0\uC11C \uC0AD\uC81C\uD560\uAE4C\uC694?',
    scrapbookIncludeNone: "\uC5C6\uC74C",
    scrapbookExcludeNone: "\uC5C6\uC74C",
    scrapbookMediaAll: "\uC804\uCCB4",
    scrapbookAutoArchiveOn: "on",
    scrapbookAutoArchiveOff: "off",
    scrapbookRecentError: "\uCD5C\uADFC \uC624\uB958: {error}",
    scrapbookWatchlistsNoResultsTitle: "\uC544\uC9C1 \uB9E4\uCE6D\uB41C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookWatchlistsNoResultsCopy: "\uB3D9\uAE30\uD654\uB97C \uC2E4\uD589\uD558\uBA74 \uC870\uAC74\uC5D0 \uB9DE\uB294 \uC0C8 \uAE00\uC774 \uC5EC\uAE30\uC5D0 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.",
    scrapbookSearchesLoginTitle: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookSearchesLoginCopy: "Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD574\uC57C keyword search\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookSearchesReconnectTitle: "\uAD8C\uD55C \uC7AC\uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookSearchesReconnectCopy: "Threads\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD558\uBA74 keyword search\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookSearchResults: "\uACB0\uACFC {count}\uAC1C",
    scrapbookSearchMode: "\uBAA8\uB4DC {mode}",
    scrapbookSearchLastRun: "\uB9C8\uC9C0\uB9C9 \uC2E4\uD589 {date}",
    scrapbookSearchAuthorAll: "\uC804\uCCB4",
    scrapbookSearchHide: "\uC228\uAE30\uAE30",
    scrapbookSearchesNoResultsTitle: "\uC544\uC9C1 \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    scrapbookSearchesNoResultsCopy: "\uC2E4\uD589 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uCD5C\uC2E0 \uACB0\uACFC\uAC00 \uCC44\uC6CC\uC9D1\uB2C8\uB2E4.",
    scrapbookInsightsRefreshedAt: "{date} \uAE30\uC900",
    scrapbookInsightsNotLoadedYet: "\uC544\uC9C1 \uBD88\uB7EC\uC624\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
    scrapbookInsightsLoginTitle: "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookInsightsLoginCopy: "Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD574\uC57C insights\uB97C \uBD88\uB7EC\uC62C \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookInsightsReconnectTitle: "\uAD8C\uD55C \uC7AC\uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
    scrapbookInsightsReconnectCopy: "Threads\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD558\uBA74 manage insights\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    scrapbookInsightsViews: "\uC870\uD68C\uC218 {value}",
    scrapbookInsightsLikes: "\uC88B\uC544\uC694 {value}",
    scrapbookInsightsReplies: "\uB2F5\uAE00 {value}",
    scrapbookInsightsReposts: "\uB9AC\uD3EC\uC2A4\uD2B8 {value}",
    scrapbookInsightsQuotes: "\uC778\uC6A9 {value}",
    scrapbookStatusConnected: "Threads \uACC4\uC815 \uC5F0\uACB0\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    scrapbookSessionRouting: "\uC774 scrapbook\uC740 @{handle} \uACC4\uC815\uC5D0 \uC5F0\uACB0\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uACF5\uAC1C \uB313\uAE00\uC5D0\uC11C @{botHandle} \uC744 \uBA58\uC158\uD588\uACE0, \uADF8 \uB313\uAE00 \uC791\uC131 \uACC4\uC815\uC774 @{handle} \uC774\uBA74 \uC5EC\uAE30\uC5D0 \uC800\uC7A5\uB429\uB2C8\uB2E4.",
    scrapbookLogoutSuccess: "\uC5F0\uACB0\uC744 \uD574\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookLogoutFail: "\uB85C\uADF8\uC544\uC6C3\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusLoadFailed: "scrapbook \uC0C1\uD0DC\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusWatchlistSaved: "Watchlist\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusWatchlistSynced: "Watchlist\uB97C \uB3D9\uAE30\uD654\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusWatchlistDeleted: "Watchlist\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusArchiveDeleted: "\uC544\uCE74\uC774\uBE0C\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusTrackedSaved: "\uACB0\uACFC\uB97C inbox\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusSearchSaved: "Search monitor\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusSearchRun: "Keyword search\uB97C \uC2E4\uD589\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusSearchDeleted: "Search monitor\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusSearchArchived: "\uAC80\uC0C9 \uACB0\uACFC\uB97C inbox\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusSearchDismissed: "\uAC80\uC0C9 \uACB0\uACFC\uB97C \uC228\uACBC\uC2B5\uB2C8\uB2E4.",
    scrapbookInsightsRefreshLoading: "\uBD88\uB7EC\uC624\uB294 \uC911...",
    scrapbookStatusInsightsRefreshed: "Insights \uC2A4\uB0C5\uC0F7\uC744 \uC0C8\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
    scrapbookStatusInsightSaved: "\uC778\uC0AC\uC774\uD2B8 \uD3EC\uC2A4\uD2B8\uB97C inbox\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4."
  },
  en: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription: "Keep Threads posts saved by reply mentions in a private scrapbook and export them as Markdown.",
    scrapbookHomeAriaLabel: "Threads tools home",
    scrapbookWorkspaceAriaLabel: "Scrapbook workspace",
    scrapbookLocaleLabel: "Language",
    scrapbookNavHome: "Home",
    scrapbookNavCurrent: "My scrapbook",
    scrapbookHeroEyebrow: "Mention scrapbook",
    scrapbookHeroTitle: "Save Threads posts collected by mentions into a private scrapbook.",
    scrapbookHeroLead: "Mention {handleStrong} on a post you want to save. The service account only receives the mention, and the result is stored only in the scrapbook tied to your signed-in Threads account.",
    scrapbookConnectButton: "Continue with Threads",
    scrapbookConnectBusy: "Opening the sign-in page...",
    scrapbookCopyLoginLink: "Copy sign-in link",
    scrapbookHeroHowItWorks: "How it works",
    scrapbookMobileOauthNote: "On mobile, open the browser-based connect page, tap {copyLoginLinkStrong}, then paste the link into a new tab's address bar.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "private scrapbook",
    scrapbookHeroNoteExport: "Markdown export",
    scrapbookFlowLabel: "Flow",
    scrapbookFlowStep1: "Connect your Threads account once.",
    scrapbookFlowStep2: "Mention {handleInline} on the post you want to save.",
    scrapbookFlowStep3: "Review saved items on the web and export them as Markdown.",
    scrapbookConnectTag: "Connect Threads",
    scrapbookConnectTitle: "Connect your Threads account",
    scrapbookConnectCopy: "Only the scrapbook owner account is connected here. The service account runs separately as {handleInline}, and items enter your archive only when the signed-in account matches the reply author account.",
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
    scrapbookHowStep1Desc: "Link your Threads account so the server can reliably identify which reply author belongs to which scrapbook owner.",
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
    scrapbookNoResults: "No results found.",
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
    scrapbookConnectServerNotReady: "Threads sign-in is not configured on the server yet. Add the app ID and secret to enable it.",
    scrapbookArchiveFallbackAuthorPost: "@{handle} post",
    scrapbookArchiveFallbackSavedItem: "Saved Threads item",
    scrapbookArchiveSelectionSummary: "{count} selected \xB7 {total} total",
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
    scrapbookArchiveLoginRequiredCopy: "Connect your Threads account to see mention inbox items and extension cloud saves together here.",
    scrapbookArchiveEmptyTitle: "No saved items yet.",
    scrapbookArchiveEmptyCopy: "Mention inbox items, extension cloud saves, watchlist auto-archives, and search archives all gather here.",
    scrapbookVerified: "verified",
    scrapbookLastLogin: "last login {date}",
    scrapbookProfilePictureAlt: "{name} profile picture",
    scrapbookScopeReady: "Permissions ready \xB7 {scopes}",
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
    scrapbookArchiveDeleteConfirm: 'Delete "{title}" from your scrapbook?',
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
    scrapbookSessionRouting: "This scrapbook is linked to @{handle}. When a public reply mentions @{botHandle} and the reply author account is @{handle}, the item is saved here.",
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
    scrapbookDocumentDescription: "\u8FD4\u4FE1\u30E1\u30F3\u30B7\u30E7\u30F3\u3067\u4FDD\u5B58\u3057\u305F Threads \u6295\u7A3F\u3092\u975E\u516C\u958B\u306E scrapbook \u306B\u96C6\u3081\u3001Markdown \u3067\u66F8\u304D\u51FA\u3057\u307E\u3059\u3002",
    scrapbookHomeAriaLabel: "Threads \u30C4\u30FC\u30EB\u306E\u30DB\u30FC\u30E0",
    scrapbookWorkspaceAriaLabel: "scrapbook \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9",
    scrapbookLocaleLabel: "\u8A00\u8A9E",
    scrapbookNavHome: "\u30DB\u30FC\u30E0",
    scrapbookNavCurrent: "\u81EA\u5206\u306E scrapbook",
    scrapbookHeroEyebrow: "scrapbook por men\xE7\xE3o",
    scrapbookHeroTitle: "\u30E1\u30F3\u30B7\u30E7\u30F3\u3067\u96C6\u3081\u305F Threads \u3092\u975E\u516C\u958B\u306E scrapbook \u306B\u4FDD\u5B58\u3002",
    scrapbookHeroLead: "\u4FDD\u5B58\u3057\u305F\u3044\u6295\u7A3F\u306B {handleStrong} \u3092\u30E1\u30F3\u30B7\u30E7\u30F3\u3059\u308B\u3068\u3001\u30B5\u30FC\u30D3\u30B9\u7528\u30A2\u30AB\u30A6\u30F3\u30C8\u306F\u30E1\u30F3\u30B7\u30E7\u30F3\u3060\u3051\u3092\u53D7\u3051\u53D6\u308A\u3001\u30B5\u30A4\u30F3\u30A4\u30F3\u6E08\u307F\u306E Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u7D10\u3065\u304F scrapbook \u306B\u3060\u3051\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    scrapbookConnectButton: "Threads \u3067\u30ED\u30B0\u30A4\u30F3",
    scrapbookConnectBusy: "\u63A5\u7D9A\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u3044\u307E\u3059...",
    scrapbookCopyLoginLink: "\u30ED\u30B0\u30A4\u30F3\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC",
    scrapbookHeroHowItWorks: "\u4ED5\u7D44\u307F",
    scrapbookMobileOauthNote: "\u30E2\u30D0\u30A4\u30EB\u3067\u306F\u30D6\u30E9\u30A6\u30B6\u7528\u306E\u63A5\u7D9A\u30DA\u30FC\u30B8\u3067 {copyLoginLinkStrong} \u3092\u62BC\u3057\u3001\u305D\u306E\u30EA\u30F3\u30AF\u3092\u65B0\u3057\u3044\u30BF\u30D6\u306E\u30A2\u30C9\u30EC\u30B9\u30D0\u30FC\u306B\u8CBC\u308A\u4ED8\u3051\u3066\u9032\u3081\u3066\u304F\u3060\u3055\u3044\u3002",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "private scrapbook",
    scrapbookHeroNoteExport: "Markdown export",
    scrapbookFlowLabel: "Flow",
    scrapbookFlowStep1: "\u81EA\u5206\u306E Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u4E00\u5EA6\u3060\u3051\u63A5\u7D9A\u3057\u307E\u3059\u3002",
    scrapbookFlowStep2: "\u4FDD\u5B58\u3057\u305F\u3044\u6295\u7A3F\u3067 {handleInline} \u3092\u30E1\u30F3\u30B7\u30E7\u30F3\u3057\u307E\u3059\u3002",
    scrapbookFlowStep3: "\u4FDD\u5B58\u3055\u308C\u305F\u9805\u76EE\u3092 Web \u3067\u78BA\u8A8D\u3057\u3001Markdown \u3068\u3057\u3066\u66F8\u304D\u51FA\u3057\u307E\u3059\u3002",
    scrapbookConnectTag: "Connect Threads",
    scrapbookConnectTitle: "\u81EA\u5206\u306E Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A",
    scrapbookConnectCopy: "\u3053\u3053\u3067\u63A5\u7D9A\u3059\u308B\u306E\u306F scrapbook \u306E\u6240\u6709\u30A2\u30AB\u30A6\u30F3\u30C8\u3060\u3051\u3067\u3059\u3002\u30B5\u30FC\u30D3\u30B9\u7528\u30A2\u30AB\u30A6\u30F3\u30C8\u306F {handleInline} \u3068\u3057\u3066\u5225\u306B\u52D5\u4F5C\u3057\u3001\u30B5\u30A4\u30F3\u30A4\u30F3\u4E2D\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u8FD4\u4FE1\u6295\u7A3F\u8005\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u4E00\u81F4\u3057\u305F\u3068\u304D\u3060\u3051\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    scrapbookConnectedTag: "Connected",
    scrapbookProfileLink: "Threads \u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u958B\u304F",
    scrapbookLogout: "\u30A2\u30AB\u30A6\u30F3\u30C8\u63A5\u7D9A\u3092\u89E3\u9664",
    scrapbookTabInbox: "Inbox",
    scrapbookTabWatchlists: "Watchlists",
    scrapbookTabSearches: "Searches",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "How it works",
    scrapbookHowTitle: "\u8A2D\u5B9A\u306F\u4E00\u5EA6\u3060\u3051\u3002\u4FDD\u5B58\u306F\u30E1\u30F3\u30B7\u30E7\u30F3\u3060\u3051\u3002",
    scrapbookHowCopy: "\u516C\u958B\u8FD4\u4FE1\u306F\u30C8\u30EA\u30AC\u30FC\u3068\u3057\u3066\u3060\u3051\u4F7F\u308F\u308C\u3001\u4FDD\u5B58\u7D50\u679C\u306F\u81EA\u5206\u306E scrapbook \u306B\u3060\u3051\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
    scrapbookHowStep1Title: "Threads \u3067\u30ED\u30B0\u30A4\u30F3",
    scrapbookHowStep1Desc: "\u81EA\u5206\u306E Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3057\u3066\u3001\u3069\u306E\u8FD4\u4FE1\u6295\u7A3F\u8005\u304C\u3069\u306E scrapbook \u6240\u6709\u8005\u306A\u306E\u304B\u3092\u30B5\u30FC\u30D0\u30FC\u304C\u6B63\u78BA\u306B\u5224\u5B9A\u3067\u304D\u308B\u3088\u3046\u306B\u3057\u307E\u3059\u3002",
    scrapbookHowStep2Title: "\u8FD4\u4FE1\u3067\u30DC\u30C3\u30C8\u3092\u30E1\u30F3\u30B7\u30E7\u30F3",
    scrapbookHowStep2Desc: "\u4FDD\u5B58\u3057\u305F\u3044\u6295\u7A3F\u3067 {handleInline} \u3060\u3051\u3092\u30E1\u30F3\u30B7\u30E7\u30F3\u3059\u308B\u3068\u3001\u53CE\u96C6\u5074\u304C\u305D\u306E\u30A4\u30D9\u30F3\u30C8\u3092\u4FDD\u7BA1\u3057\u307E\u3059\u3002",
    scrapbookHowStep3Title: "Web \u3067\u78BA\u8A8D\u3057\u3066\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8",
    scrapbookHowStep3Desc: "scrapbook \u753B\u9762\u3067\u4FDD\u5B58\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3001Markdown \u306E\u30B3\u30D4\u30FC\u3084\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3067\u6B21\u306E\u30C4\u30FC\u30EB\u3078\u6E21\u3057\u307E\u3059\u3002",
    scrapbookInboxEyebrow: "Inbox",
    scrapbookInboxTitle: "\u30E1\u30F3\u30B7\u30E7\u30F3\u304B\u3089\u96C6\u307E\u308B inbox",
    scrapbookInboxCopy: "\u4FDD\u5B58\u9805\u76EE\u306F\u30DC\u30FC\u30C9\u5F62\u5F0F\u3067\u4E26\u3073\u3001\u884C\u3092\u62BC\u3059\u3068\u672C\u6587\u3068\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u30E1\u30CB\u30E5\u30FC\u304C\u958B\u304D\u307E\u3059\u3002",
    scrapbookSelectAll: "\u3059\u3079\u3066\u9078\u629E",
    scrapbookExportSelected: "\u9078\u629E\u3057\u305F ZIP \u3092\u66F8\u304D\u51FA\u3057",
    scrapbookExportAll: "\u3059\u3079\u3066 ZIP \u3092\u66F8\u304D\u51FA\u3057",
    scrapbookArchiveLoginTitle: "\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookArchiveLoginCopy: "Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3059\u308B\u3068\u3001\u4FDD\u5B58\u6E08\u307F\u30E1\u30F3\u30B7\u30E7\u30F3\u304C\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
    scrapbookArchiveTableTitle: "\u30BF\u30A4\u30C8\u30EB",
    scrapbookArchiveTableDate: "\u4FDD\u5B58\u65E5\u6642",
    scrapbookArchiveTableSource: "\u30BD\u30FC\u30B9",
    scrapbookArchiveTableTags: "\u30BF\u30B0",
    scrapbookNoResults: "\u4E00\u81F4\u3059\u308B\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookWatchlistsEyebrow: "Watchlists",
    scrapbookWatchlistsTitle: "\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u76E3\u8996",
    scrapbookWatchlistsCopy: "\u516C\u958B Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u767B\u9332\u3057\u3001\u6761\u4EF6\u306B\u5408\u3046\u65B0\u898F\u6295\u7A3F\u3060\u3051\u3092\u96C6\u3081\u307E\u3059\u3002",
    scrapbookWatchlistTargetHandle: "\u5BFE\u8C61\u30CF\u30F3\u30C9\u30EB",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "\u542B\u3081\u308B\u30AD\u30FC\u30EF\u30FC\u30C9",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "\u9664\u5916\u30AD\u30FC\u30EF\u30FC\u30C9",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "\u30E1\u30C7\u30A3\u30A2\u7A2E\u5225",
    scrapbookFilterIncludeLabel: "\u542B\u3081\u308B",
    scrapbookFilterExcludeLabel: "\u9664\u5916",
    scrapbookFilterMediaLabel: "\u30E1\u30C7\u30A3\u30A2",
    scrapbookFilterAutoArchiveLabel: "\u81EA\u52D5\u4FDD\u5B58",
    scrapbookFilterAuthorLabel: "\u6295\u7A3F\u8005",
    scrapbookMediaTypeText: "\u30C6\u30AD\u30B9\u30C8\u306E\u307F",
    scrapbookMediaTypeImage: "\u753B\u50CF",
    scrapbookMediaTypeVideo: "\u52D5\u753B",
    scrapbookMediaTypeCarousel: "\u30AB\u30EB\u30FC\u30BB\u30EB",
    scrapbookWatchlistAutoArchive: "\u65B0\u3057\u3044\u4E00\u81F4\u3092 inbox \u306B\u3082\u4FDD\u5B58",
    scrapbookWatchlistSubmit: "Watchlist \u3092\u8FFD\u52A0",
    scrapbookWatchlistsEmptyTitle: "watchlist \u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookWatchlistsEmptyCopy: "\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u8FFD\u52A0\u3059\u308B\u3068\u3001\u6700\u8FD1\u306E\u6295\u7A3F\u304C scrapbook \u30EB\u30FC\u30EB\u3067\u6574\u7406\u3055\u308C\u307E\u3059\u3002",
    scrapbookSearchesEyebrow: "Searches",
    scrapbookSearchesTitle: "\u30AD\u30FC\u30EF\u30FC\u30C9\u76E3\u8996",
    scrapbookSearchesCopy: "\u691C\u7D22\u30E2\u30CB\u30BF\u30FC\u3092\u4FDD\u5B58\u3057\u3001\u7E70\u308A\u8FD4\u3057\u51FA\u308B\u30CE\u30A4\u30BA\u3092\u9664\u5916\u3057\u3066\u7D50\u679C\u3092\u7D5E\u308A\u8FBC\u307F\u307E\u3059\u3002",
    scrapbookSearchQuery: "\u691C\u7D22\u8A9E",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "\u6295\u7A3F\u8005\u30D5\u30A3\u30EB\u30BF\u30FC",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "\u9664\u5916\u30CF\u30F3\u30C9\u30EB",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "\u691C\u7D22\u30E2\u30FC\u30C9",
    scrapbookSearchTypeTop: "\u4EBA\u6C17",
    scrapbookSearchTypeRecent: "\u6700\u65B0",
    scrapbookSearchAutoArchive: "\u65B0\u3057\u3044\u4E00\u81F4\u3092 inbox \u306B\u3082\u4FDD\u5B58",
    scrapbookSearchSubmit: "Search \u3092\u8FFD\u52A0",
    scrapbookSearchesEmptyTitle: "\u4FDD\u5B58\u6E08\u307F\u306E\u691C\u7D22\u30E2\u30CB\u30BF\u30FC\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookSearchesEmptyCopy: "\u30AD\u30FC\u30EF\u30FC\u30C9\u3092\u767B\u9332\u3059\u308B\u3068\u3001\u7D50\u679C\u30B9\u30C8\u30EA\u30FC\u30E0\u3068\u30A2\u30FC\u30AB\u30A4\u30D6\u64CD\u4F5C\u3092\u307E\u3068\u3081\u3066\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "\u81EA\u5206\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u6210\u679C\u3092\u8FFD\u8DE1",
    scrapbookInsightsCopy: "\u63A5\u7D9A\u3057\u305F Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3068\u6295\u7A3F\u30A4\u30F3\u30B5\u30A4\u30C8\u3092\u6642\u7CFB\u5217\u3067\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    scrapbookInsightsRecentSnapshot: "\u6700\u65B0\u30B9\u30CA\u30C3\u30D7\u30B7\u30E7\u30C3\u30C8",
    scrapbookInsightsNotLoaded: "\u307E\u3060\u8AAD\u307F\u8FBC\u307E\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
    scrapbookInsightsRefresh: "Insights \u3092\u66F4\u65B0",
    scrapbookMetricFollowers: "Followers",
    scrapbookMetricProfileViews: "Profile views",
    scrapbookMetricViews: "Views",
    scrapbookMetricLikes: "Likes",
    scrapbookMetricReplies: "Replies",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "\u4FDD\u5B58\u3055\u308C\u305F\u30A4\u30F3\u30B5\u30A4\u30C8\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookInsightsEmptyCopy: "\u66F4\u65B0\u3092\u62BC\u3059\u3068\u3001\u81EA\u5206\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3068\u6700\u8FD1\u306E\u6295\u7A3F\u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
    scrapbookFooterTagline: "Public reply trigger, private scrapbook result.",
    scrapbookDateNone: "\u306A\u3057",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "\u5909\u5316\u306A\u3057",
    scrapbookConnectServerNotReady: "Threads \u30ED\u30B0\u30A4\u30F3\u306F\u307E\u3060\u30B5\u30FC\u30D0\u30FC\u3067\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u30A2\u30D7\u30EA ID \u3068\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8\u3092\u8FFD\u52A0\u3059\u308B\u3068\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
    scrapbookArchiveFallbackAuthorPost: "@{handle} \u306E\u6295\u7A3F",
    scrapbookArchiveFallbackSavedItem: "\u4FDD\u5B58\u3055\u308C\u305F Threads \u9805\u76EE",
    scrapbookArchiveSelectionSummary: "{count}\u4EF6\u3092\u9078\u629E\u4E2D \xB7 \u5408\u8A08{total}\u4EF6",
    scrapbookArchiveSelectionTotal: "\u5408\u8A08{total}\u4EF6",
    scrapbookMediaIncluded: "{count}\u4EF6\u306E\u30E1\u30C7\u30A3\u30A2\u304C\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u306B\u542B\u307E\u308C\u307E\u3059\u3002",
    scrapbookReplyHeader: "\u6295\u7A3F\u8005\u306E\u8FD4\u4FE1 {count}\u4EF6",
    scrapbookReplyLabel: "\u8FD4\u4FE1 {index}",
    scrapbookReplyOpenOriginal: "\u8FD4\u4FE1\u306E\u539F\u6587\u3092\u898B\u308B",
    scrapbookCopied: "\u30B3\u30D4\u30FC\u6E08\u307F",
    scrapbookCopyMarkdown: "Markdown \u3092\u30B3\u30D4\u30FC",
    scrapbookClipboardError: "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30D6\u30E9\u30A6\u30B6\u6A29\u9650\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    scrapbookExportPreparing: "ZIP \u3092\u6E96\u5099\u4E2D...",
    scrapbookExportChooseItems: "\u5148\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3059\u308B\u9805\u76EE\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    scrapbookExportReady: "ZIP \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3092\u7528\u610F\u3057\u307E\u3057\u305F\u3002{count}\u4EF6\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
    scrapbookExportFailed: "ZIP \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3092\u4F5C\u6210\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    scrapbookTriggerView: "\u30C8\u30EA\u30AC\u30FC\u3092\u898B\u308B",
    scrapbookImagesHide: "\u753B\u50CF\u3092\u9589\u3058\u308B",
    scrapbookImagesShow: "\u753B\u50CF\u3092{count}\u679A\u8868\u793A",
    scrapbookOpenOriginal: "\u539F\u6587\u3092\u898B\u308B",
    scrapbookDownloadMarkdown: "Markdown \u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
    scrapbookDownloadZip: "ZIP \u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
    scrapbookArchiveLoginRequiredCopy: "Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3059\u308B\u3068\u3001\u30E1\u30F3\u30B7\u30E7\u30F3 inbox \u3068 extension cloud \u4FDD\u5B58\u304C\u3053\u3053\u306B\u4E00\u7DD2\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
    scrapbookArchiveEmptyTitle: "\u4FDD\u5B58\u3055\u308C\u305F\u9805\u76EE\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookArchiveEmptyCopy: "\u30E1\u30F3\u30B7\u30E7\u30F3 inbox\u3001extension cloud \u4FDD\u5B58\u3001watchlist \u306E\u81EA\u52D5\u30A2\u30FC\u30AB\u30A4\u30D6\u3001search \u30A2\u30FC\u30AB\u30A4\u30D6\u304C\u3053\u3053\u306B\u96C6\u307E\u308A\u307E\u3059\u3002",
    scrapbookVerified: "\u8A8D\u8A3C\u6E08\u307F",
    scrapbookLastLogin: "\u6700\u7D42\u30ED\u30B0\u30A4\u30F3 {date}",
    scrapbookProfilePictureAlt: "{name} \u306E\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u753B\u50CF",
    scrapbookScopeReady: "\u6A29\u9650\u6E96\u5099\u5B8C\u4E86 \xB7 {scopes}",
    scrapbookScopeReconnect: "\u9AD8\u5EA6\u306A\u6A5F\u80FD\u3092\u4F7F\u3046\u306B\u306F Threads \u306B\u518D\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u4E0D\u8DB3\u6A29\u9650: {scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "\u539F\u6587",
    scrapbookTrackedSaveInbox: "Inbox \u306B\u4FDD\u5B58",
    scrapbookEmptyBody: "(\u672C\u6587\u306A\u3057)",
    scrapbookWatchlistsLoginTitle: "\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookWatchlistsLoginCopy: "watchlist \u3092\u4F5C\u6210\u3059\u308B\u306B\u306F Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    scrapbookWatchlistsReconnectTitle: "\u6A29\u9650\u306E\u518D\u540C\u610F\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookWatchlistsReconnectCopy: "Threads \u306B\u518D\u30ED\u30B0\u30A4\u30F3\u3059\u308B\u3068 profile discovery watchlist \u3092\u4F7F\u3048\u307E\u3059\u3002",
    scrapbookWatchlistsResults: "\u7D50\u679C {count}\u4EF6",
    scrapbookWatchlistsLastSync: "\u6700\u7D42\u540C\u671F {date}",
    scrapbookWatchlistsSyncNow: "\u4ECA\u3059\u3050\u540C\u671F",
    scrapbookDelete: "\u524A\u9664",
    scrapbookArchiveDeleteConfirm: "\u300C{title}\u300D\u3092 scrapbook \u304B\u3089\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
    scrapbookIncludeNone: "\u306A\u3057",
    scrapbookExcludeNone: "\u306A\u3057",
    scrapbookMediaAll: "\u3059\u3079\u3066",
    scrapbookAutoArchiveOn: "on",
    scrapbookAutoArchiveOff: "off",
    scrapbookRecentError: "\u6700\u8FD1\u306E\u30A8\u30E9\u30FC: {error}",
    scrapbookWatchlistsNoResultsTitle: "\u4E00\u81F4\u3057\u305F\u7D50\u679C\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookWatchlistsNoResultsCopy: "\u540C\u671F\u3092\u5B9F\u884C\u3059\u308B\u3068\u3001\u6761\u4EF6\u306B\u5408\u3046\u65B0\u3057\u3044\u6295\u7A3F\u304C\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
    scrapbookSearchesLoginTitle: "\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookSearchesLoginCopy: "keyword search \u3092\u4F7F\u3046\u306B\u306F Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    scrapbookSearchesReconnectTitle: "\u6A29\u9650\u306E\u518D\u540C\u610F\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookSearchesReconnectCopy: "Threads \u306B\u518D\u30ED\u30B0\u30A4\u30F3\u3059\u308B\u3068 keyword search \u3092\u4F7F\u3048\u307E\u3059\u3002",
    scrapbookSearchResults: "\u7D50\u679C {count}\u4EF6",
    scrapbookSearchMode: "\u30E2\u30FC\u30C9 {mode}",
    scrapbookSearchLastRun: "\u6700\u7D42\u5B9F\u884C {date}",
    scrapbookSearchAuthorAll: "\u3059\u3079\u3066",
    scrapbookSearchHide: "\u975E\u8868\u793A",
    scrapbookSearchesNoResultsTitle: "\u691C\u7D22\u7D50\u679C\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002",
    scrapbookSearchesNoResultsCopy: "\u5B9F\u884C\u30DC\u30BF\u30F3\u3092\u62BC\u3059\u3068\u6700\u65B0\u7D50\u679C\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
    scrapbookInsightsRefreshedAt: "{date} \u6642\u70B9",
    scrapbookInsightsNotLoadedYet: "\u307E\u3060\u8AAD\u307F\u8FBC\u307E\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
    scrapbookInsightsLoginTitle: "\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookInsightsLoginCopy: "Insights \u3092\u8AAD\u307F\u8FBC\u3080\u306B\u306F Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    scrapbookInsightsReconnectTitle: "\u6A29\u9650\u306E\u518D\u540C\u610F\u304C\u5FC5\u8981\u3067\u3059\u3002",
    scrapbookInsightsReconnectCopy: "Threads \u306B\u518D\u30ED\u30B0\u30A4\u30F3\u3059\u308B\u3068 manage insights \u3092\u4F7F\u3048\u307E\u3059\u3002",
    scrapbookInsightsViews: "\u95B2\u89A7\u6570 {value}",
    scrapbookInsightsLikes: "\u3044\u3044\u306D {value}",
    scrapbookInsightsReplies: "\u8FD4\u4FE1 {value}",
    scrapbookInsightsReposts: "\u30EA\u30DD\u30B9\u30C8 {value}",
    scrapbookInsightsQuotes: "\u5F15\u7528 {value}",
    scrapbookStatusConnected: "Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u63A5\u7D9A\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002",
    scrapbookSessionRouting: "\u3053\u306E scrapbook \u306F @{handle} \u306B\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u516C\u958B\u8FD4\u4FE1\u3067 @{botHandle} \u304C\u30E1\u30F3\u30B7\u30E7\u30F3\u3055\u308C\u3001\u305D\u306E\u8FD4\u4FE1\u6295\u7A3F\u8005\u304C @{handle} \u3067\u3042\u308C\u3070\u3001\u3053\u3053\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    scrapbookLogoutSuccess: "\u63A5\u7D9A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",
    scrapbookLogoutFail: "\u30ED\u30B0\u30A2\u30A6\u30C8\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    scrapbookStatusLoadFailed: "scrapbook \u306E\u72B6\u614B\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    scrapbookStatusWatchlistSaved: "Watchlist \u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusWatchlistSynced: "Watchlist \u3092\u540C\u671F\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusWatchlistDeleted: "Watchlist \u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusArchiveDeleted: "\u30A2\u30FC\u30AB\u30A4\u30D6\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusTrackedSaved: "\u7D50\u679C\u3092 inbox \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusSearchSaved: "Search monitor \u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusSearchRun: "Keyword search \u3092\u5B9F\u884C\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusSearchDeleted: "Search monitor \u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusSearchArchived: "\u691C\u7D22\u7D50\u679C\u3092 inbox \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusSearchDismissed: "\u691C\u7D22\u7D50\u679C\u3092\u975E\u8868\u793A\u306B\u3057\u307E\u3057\u305F\u3002",
    scrapbookInsightsRefreshLoading: "\u8AAD\u307F\u8FBC\u307F\u4E2D...",
    scrapbookStatusInsightsRefreshed: "\u65B0\u3057\u3044 insights \u30B9\u30CA\u30C3\u30D7\u30B7\u30E7\u30C3\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
    scrapbookStatusInsightSaved: "\u30A4\u30F3\u30B5\u30A4\u30C8\u6295\u7A3F\u3092 inbox \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002"
  },
  "pt-BR": {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription: "Guarde posts do Threads salvos por men\xE7\xF5es em respostas em um scrapbook privado e exporte tudo em Markdown.",
    scrapbookHomeAriaLabel: "P\xE1gina inicial das ferramentas Threads",
    scrapbookWorkspaceAriaLabel: "\xC1rea de trabalho do scrapbook",
    scrapbookLocaleLabel: "Idioma",
    scrapbookNavHome: "In\xEDcio",
    scrapbookNavCurrent: "Meu scrapbook",
    scrapbookHeroEyebrow: "Mention scrapbook",
    scrapbookHeroTitle: "Salve no scrapbook privado os Threads coletados por men\xE7\xF5es.",
    scrapbookHeroLead: "Mencione {handleStrong} no post que deseja salvar. A conta do servi\xE7o recebe apenas a men\xE7\xE3o, e o resultado \xE9 guardado somente no scrapbook ligado \xE0 sua conta do Threads conectada.",
    scrapbookConnectButton: "Entrar com Threads",
    scrapbookConnectBusy: "Abrindo a p\xE1gina de conex\xE3o...",
    scrapbookCopyLoginLink: "Copiar link de login",
    scrapbookHeroHowItWorks: "Como funciona",
    scrapbookMobileOauthNote: "No celular, abra a p\xE1gina de conex\xE3o no navegador, toque em {copyLoginLinkStrong} e depois cole o link na barra de endere\xE7o de uma nova aba.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "scrapbook privado",
    scrapbookHeroNoteExport: "exporta\xE7\xE3o em Markdown",
    scrapbookFlowLabel: "Fluxo de salvamento",
    scrapbookFlowStep1: "Conecte sua conta do Threads uma vez.",
    scrapbookFlowStep2: "Mencione {handleInline} no post que deseja salvar.",
    scrapbookFlowStep3: "Revise os itens salvos na web e exporte em Markdown.",
    scrapbookConnectTag: "Conectar Threads",
    scrapbookConnectTitle: "Conecte sua conta do Threads",
    scrapbookConnectCopy: "Aqui voc\xEA conecta apenas a conta propriet\xE1ria do scrapbook. A conta de servi\xE7o roda separadamente como {handleInline}, e os itens entram no seu arquivo somente quando a conta conectada corresponde \xE0 conta autora da resposta.",
    scrapbookConnectedTag: "Conectado",
    scrapbookProfileLink: "Abrir perfil no Threads",
    scrapbookLogout: "Desconectar minha conta",
    scrapbookTabInbox: "Caixa de entrada",
    scrapbookTabWatchlists: "Listas de monitoramento",
    scrapbookTabSearches: "Buscas",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "Como funciona",
    scrapbookHowTitle: "Configure uma vez, salve por men\xE7\xE3o.",
    scrapbookHowCopy: "As respostas p\xFAblicas servem apenas como gatilho. Os resultados salvos ficam somente no seu scrapbook privado.",
    scrapbookHowStep1Title: "Entrar com Threads",
    scrapbookHowStep1Desc: "Conecte sua conta do Threads para que o servidor identifique com precis\xE3o qual autor de resposta pertence a qual dono de scrapbook.",
    scrapbookHowStep2Title: "Mencione o bot na resposta",
    scrapbookHowStep2Desc: "Mencione apenas {handleInline} no post que deseja salvar, e o coletor registra esse evento.",
    scrapbookHowStep3Title: "Revise e exporte na web",
    scrapbookHowStep3Desc: "Confira o resultado salvo na interface do scrapbook e copie ou baixe em Markdown para usar na pr\xF3xima ferramenta.",
    scrapbookInboxEyebrow: "Caixa de entrada",
    scrapbookInboxTitle: "Inbox coletada por men\xE7\xF5es",
    scrapbookInboxCopy: "Os itens salvos aparecem em formato de quadro. Clique em uma linha para abrir o conte\xFAdo e as a\xE7\xF5es de exporta\xE7\xE3o.",
    scrapbookSelectAll: "Selecionar tudo",
    scrapbookExportSelected: "Exportar ZIP selecionado",
    scrapbookExportAll: "Exportar ZIP completo",
    scrapbookArchiveLoginTitle: "\xC9 necess\xE1rio entrar.",
    scrapbookArchiveLoginCopy: "Conecte sua conta do Threads para ver aqui as men\xE7\xF5es salvas.",
    scrapbookArchiveTableTitle: "T\xEDtulo",
    scrapbookArchiveTableDate: "Salvo em",
    scrapbookArchiveTableSource: "Origem",
    scrapbookArchiveTableTags: "Tags",
    scrapbookNoResults: "Nenhum resultado encontrado.",
    scrapbookWatchlistsEyebrow: "Listas de monitoramento",
    scrapbookWatchlistsTitle: "Monitorar contas p\xFAblicas",
    scrapbookWatchlistsCopy: "Cadastre contas p\xFAblicas do Threads e colete apenas os novos posts que combinarem com suas regras.",
    scrapbookWatchlistTargetHandle: "Handle alvo",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "Palavras inclu\xEDdas",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "Palavras exclu\xEDdas",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "Tipo de m\xEDdia",
    scrapbookFilterIncludeLabel: "incluir",
    scrapbookFilterExcludeLabel: "excluir",
    scrapbookFilterMediaLabel: "m\xEDdia",
    scrapbookFilterAutoArchiveLabel: "arquivamento autom\xE1tico",
    scrapbookFilterAuthorLabel: "autor",
    scrapbookMediaTypeText: "Somente texto",
    scrapbookMediaTypeImage: "Imagem",
    scrapbookMediaTypeVideo: "V\xEDdeo",
    scrapbookMediaTypeCarousel: "Carrossel",
    scrapbookWatchlistAutoArchive: "Salvar novos resultados tamb\xE9m na inbox",
    scrapbookWatchlistSubmit: "Adicionar watchlist",
    scrapbookWatchlistsEmptyTitle: "Ainda n\xE3o h\xE1 watchlists.",
    scrapbookWatchlistsEmptyCopy: "Adicione uma conta p\xFAblica para organizar os posts recentes com suas regras do scrapbook.",
    scrapbookSearchesEyebrow: "Buscas",
    scrapbookSearchesTitle: "Monitorar palavras-chave",
    scrapbookSearchesCopy: "Salve monitores de busca e filtre ru\xEDdos recorrentes no fluxo de resultados.",
    scrapbookSearchQuery: "Consulta",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "Filtro de autor",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Handles exclu\xEDdos",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Modo de busca",
    scrapbookSearchTypeTop: "Em alta",
    scrapbookSearchTypeRecent: "Recentes",
    scrapbookSearchAutoArchive: "Salvar novos resultados tamb\xE9m na inbox",
    scrapbookSearchSubmit: "Adicionar busca",
    scrapbookSearchesEmptyTitle: "Nenhum monitor de busca salvo.",
    scrapbookSearchesEmptyCopy: "Cadastre palavras-chave para ver o fluxo de resultados junto com as a\xE7\xF5es de arquivamento.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "Acompanhar o desempenho da conta",
    scrapbookInsightsCopy: "Salve em linha do tempo os insights de perfil e posts da sua conta do Threads conectada.",
    scrapbookInsightsRecentSnapshot: "\xDAltimo snapshot",
    scrapbookInsightsNotLoaded: "Ainda n\xE3o carregado.",
    scrapbookInsightsRefresh: "Atualizar insights",
    scrapbookMetricFollowers: "Seguidores",
    scrapbookMetricProfileViews: "Visualiza\xE7\xF5es do perfil",
    scrapbookMetricViews: "Visualiza\xE7\xF5es",
    scrapbookMetricLikes: "Curtidas",
    scrapbookMetricReplies: "Respostas",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "Ainda n\xE3o h\xE1 insights salvos.",
    scrapbookInsightsEmptyCopy: "Atualize para capturar o desempenho da sua conta e dos posts recentes.",
    scrapbookFooterTagline: "Gatilho p\xFAblico por resposta, resultado privado no scrapbook.",
    scrapbookDateNone: "Nenhum",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "Sem mudan\xE7a",
    scrapbookConnectServerNotReady: "O login com Threads ainda n\xE3o est\xE1 configurado no servidor. Adicione o app ID e o segredo para habilitar.",
    scrapbookArchiveFallbackAuthorPost: "post de @{handle}",
    scrapbookArchiveFallbackSavedItem: "Item salvo do Threads",
    scrapbookArchiveSelectionSummary: "{count} selecionados \xB7 {total} no total",
    scrapbookArchiveSelectionTotal: "{total} no total",
    scrapbookMediaIncluded: "{count} arquivos de m\xEDdia ser\xE3o inclu\xEDdos na exporta\xE7\xE3o.",
    scrapbookReplyHeader: "{count} respostas do autor",
    scrapbookReplyLabel: "resposta {index}",
    scrapbookReplyOpenOriginal: "Abrir resposta original",
    scrapbookCopied: "Copiado",
    scrapbookCopyMarkdown: "Copiar Markdown",
    scrapbookClipboardError: "N\xE3o foi poss\xEDvel copiar para a \xE1rea de transfer\xEAncia. Verifique as permiss\xF5es do navegador.",
    scrapbookExportPreparing: "Preparando ZIP...",
    scrapbookExportChooseItems: "Selecione primeiro os itens que deseja exportar.",
    scrapbookExportReady: "A exporta\xE7\xE3o ZIP est\xE1 pronta. Baixando {count} itens.",
    scrapbookExportFailed: "N\xE3o foi poss\xEDvel criar a exporta\xE7\xE3o ZIP.",
    scrapbookTriggerView: "Ver gatilho",
    scrapbookImagesHide: "Ocultar imagens",
    scrapbookImagesShow: "Mostrar {count} imagens",
    scrapbookOpenOriginal: "Abrir original",
    scrapbookDownloadMarkdown: "Baixar Markdown",
    scrapbookDownloadZip: "Baixar ZIP",
    scrapbookArchiveLoginRequiredCopy: "Conecte sua conta do Threads para ver aqui juntos a inbox de men\xE7\xF5es e os salvamentos cloud da extens\xE3o.",
    scrapbookArchiveEmptyTitle: "Ainda n\xE3o h\xE1 itens salvos.",
    scrapbookArchiveEmptyCopy: "Inbox de men\xE7\xF5es, salvamentos cloud da extens\xE3o, auto-arquivos de watchlist e arquivos de busca aparecem todos aqui.",
    scrapbookVerified: "verificado",
    scrapbookLastLogin: "\xFAltimo login {date}",
    scrapbookProfilePictureAlt: "foto de perfil de {name}",
    scrapbookScopeReady: "Escopos prontos \xB7 {scopes}",
    scrapbookScopeReconnect: "Entre novamente com Threads para usar recursos avan\xE7ados. Escopos ausentes: {scopes}",
    scrapbookScopeUpgrade: "atualiza\xE7\xE3o de escopo",
    scrapbookTrackedOpen: "Abrir",
    scrapbookTrackedSaveInbox: "Salvar na inbox",
    scrapbookEmptyBody: "(Sem texto)",
    scrapbookWatchlistsLoginTitle: "\xC9 necess\xE1rio entrar.",
    scrapbookWatchlistsLoginCopy: "Conecte sua conta do Threads para criar watchlists.",
    scrapbookWatchlistsReconnectTitle: "\xC9 necess\xE1rio atualizar as permiss\xF5es.",
    scrapbookWatchlistsReconnectCopy: "Entre novamente com Threads para usar watchlists de descoberta de perfil.",
    scrapbookWatchlistsResults: "{count} resultados",
    scrapbookWatchlistsLastSync: "\xFAltima sincroniza\xE7\xE3o {date}",
    scrapbookWatchlistsSyncNow: "Sincronizar agora",
    scrapbookDelete: "Excluir",
    scrapbookArchiveDeleteConfirm: 'Excluir "{title}" do scrapbook?',
    scrapbookIncludeNone: "nenhum",
    scrapbookExcludeNone: "nenhum",
    scrapbookMediaAll: "todos",
    scrapbookAutoArchiveOn: "ativado",
    scrapbookAutoArchiveOff: "desativado",
    scrapbookRecentError: "Erro recente: {error}",
    scrapbookWatchlistsNoResultsTitle: "Ainda n\xE3o h\xE1 resultados correspondentes.",
    scrapbookWatchlistsNoResultsCopy: "Execute uma sincroniza\xE7\xE3o para ver aqui novos posts compat\xEDveis.",
    scrapbookSearchesLoginTitle: "\xC9 necess\xE1rio entrar.",
    scrapbookSearchesLoginCopy: "Conecte sua conta do Threads para usar busca por palavra-chave.",
    scrapbookSearchesReconnectTitle: "\xC9 necess\xE1rio atualizar as permiss\xF5es.",
    scrapbookSearchesReconnectCopy: "Entre novamente com Threads para usar busca por palavra-chave.",
    scrapbookSearchResults: "{count} resultados",
    scrapbookSearchMode: "modo {mode}",
    scrapbookSearchLastRun: "\xFAltima execu\xE7\xE3o {date}",
    scrapbookSearchAuthorAll: "todos",
    scrapbookSearchHide: "Ocultar",
    scrapbookSearchesNoResultsTitle: "Ainda n\xE3o h\xE1 resultados de busca.",
    scrapbookSearchesNoResultsCopy: "Execute a busca para preencher os resultados mais recentes.",
    scrapbookInsightsRefreshedAt: "Atualizado em {date}",
    scrapbookInsightsNotLoadedYet: "Ainda n\xE3o carregado.",
    scrapbookInsightsLoginTitle: "\xC9 necess\xE1rio entrar.",
    scrapbookInsightsLoginCopy: "Conecte sua conta do Threads para carregar os insights.",
    scrapbookInsightsReconnectTitle: "\xC9 necess\xE1rio atualizar as permiss\xF5es.",
    scrapbookInsightsReconnectCopy: "Entre novamente com Threads para usar insights gerenciados.",
    scrapbookInsightsViews: "visualiza\xE7\xF5es {value}",
    scrapbookInsightsLikes: "curtidas {value}",
    scrapbookInsightsReplies: "respostas {value}",
    scrapbookInsightsReposts: "republica\xE7\xF5es {value}",
    scrapbookInsightsQuotes: "cita\xE7\xF5es {value}",
    scrapbookStatusConnected: "Sua conta do Threads foi conectada.",
    scrapbookSessionRouting: "Este scrapbook est\xE1 vinculado a @{handle}. Quando uma resposta p\xFAblica menciona @{botHandle} e a conta autora da resposta \xE9 @{handle}, o item \xE9 salvo aqui.",
    scrapbookLogoutSuccess: "Sua conta foi desconectada.",
    scrapbookLogoutFail: "N\xE3o foi poss\xEDvel sair.",
    scrapbookStatusLoadFailed: "N\xE3o foi poss\xEDvel carregar o estado do scrapbook.",
    scrapbookStatusWatchlistSaved: "Watchlist salva.",
    scrapbookStatusWatchlistSynced: "Watchlist sincronizada.",
    scrapbookStatusWatchlistDeleted: "Watchlist exclu\xEDda.",
    scrapbookStatusArchiveDeleted: "Arquivo exclu\xEDdo.",
    scrapbookStatusTrackedSaved: "Resultado salvo na inbox.",
    scrapbookStatusSearchSaved: "Monitor de busca salvo.",
    scrapbookStatusSearchRun: "Busca por palavra-chave executada.",
    scrapbookStatusSearchDeleted: "Monitor de busca exclu\xEDdo.",
    scrapbookStatusSearchArchived: "Resultado de busca salvo na inbox.",
    scrapbookStatusSearchDismissed: "Resultado de busca ocultado.",
    scrapbookInsightsRefreshLoading: "Carregando...",
    scrapbookStatusInsightsRefreshed: "Novo snapshot de insights salvo.",
    scrapbookStatusInsightSaved: "Post de insight salvo na inbox."
  },
  es: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription: "Guarda publicaciones de Threads salvadas por menciones en respuestas dentro de un scrapbook privado y exp\xF3rtalas en Markdown.",
    scrapbookHomeAriaLabel: "Inicio de herramientas de Threads",
    scrapbookWorkspaceAriaLabel: "Espacio de trabajo de scrapbook",
    scrapbookLocaleLabel: "Idioma",
    scrapbookNavHome: "Inicio",
    scrapbookNavCurrent: "Mi scrapbook",
    scrapbookHeroEyebrow: "scrapbook por menciones",
    scrapbookHeroTitle: "Guarda en un scrapbook privado los Threads recogidos por menciones.",
    scrapbookHeroLead: "Menciona {handleStrong} en la publicaci\xF3n que quieras guardar. La cuenta del servicio solo recibe la menci\xF3n y el resultado se almacena \xFAnicamente en el scrapbook vinculado a tu cuenta de Threads conectada.",
    scrapbookConnectButton: "Iniciar sesi\xF3n con Threads",
    scrapbookConnectBusy: "Abriendo la p\xE1gina de acceso...",
    scrapbookCopyLoginLink: "Copiar enlace de acceso",
    scrapbookHeroHowItWorks: "C\xF3mo funciona",
    scrapbookMobileOauthNote: "En m\xF3vil, abre la p\xE1gina de conexi\xF3n en el navegador, pulsa {copyLoginLinkStrong} y luego pega el enlace en la barra de direcciones de una nueva pesta\xF1a.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "scrapbook privado",
    scrapbookHeroNoteExport: "exportaci\xF3n Markdown",
    scrapbookFlowLabel: "Flujo de guardado",
    scrapbookFlowStep1: "Conecta tu cuenta de Threads una sola vez.",
    scrapbookFlowStep2: "Menciona {handleInline} en la publicaci\xF3n que quieras guardar.",
    scrapbookFlowStep3: "Revisa los elementos guardados en la web y exp\xF3rtalos como Markdown.",
    scrapbookConnectTag: "Conectar Threads",
    scrapbookConnectTitle: "Conecta tu cuenta de Threads",
    scrapbookConnectCopy: "Aqu\xED solo conectas la cuenta propietaria del scrapbook. La cuenta del servicio funciona aparte como {handleInline}, y los elementos entran en tu archivo solo cuando la cuenta conectada coincide con la cuenta autora de la respuesta.",
    scrapbookConnectedTag: "Conectado",
    scrapbookProfileLink: "Abrir perfil de Threads",
    scrapbookLogout: "Desconectar mi cuenta",
    scrapbookTabInbox: "Bandeja",
    scrapbookTabWatchlists: "Listas de seguimiento",
    scrapbookTabSearches: "B\xFAsquedas",
    scrapbookTabInsights: "Insights",
    scrapbookHowEyebrow: "C\xF3mo funciona",
    scrapbookHowTitle: "Configura una vez, guarda con una menci\xF3n.",
    scrapbookHowCopy: "Las respuestas p\xFAblicas solo act\xFAan como disparador. Los resultados guardados permanecen en tu scrapbook privado.",
    scrapbookHowStep1Title: "Iniciar sesi\xF3n con Threads",
    scrapbookHowStep1Desc: "Conecta tu cuenta de Threads para que el servidor identifique con precisi\xF3n qu\xE9 autor de respuesta pertenece a qu\xE9 propietario de scrapbook.",
    scrapbookHowStep2Title: "Menciona al bot en la respuesta",
    scrapbookHowStep2Desc: "Menciona solo {handleInline} en la publicaci\xF3n que quieras guardar y el recolector almacenar\xE1 ese evento.",
    scrapbookHowStep3Title: "Revisa y exporta en la web",
    scrapbookHowStep3Desc: "Consulta el resultado guardado en la interfaz del scrapbook y luego c\xF3pialo o desc\xE1rgalo en Markdown para tu siguiente herramienta.",
    scrapbookInboxEyebrow: "Bandeja",
    scrapbookInboxTitle: "Inbox reunida por menciones",
    scrapbookInboxCopy: "Los elementos guardados se muestran en una lista tipo tablero. Haz clic en una fila para abrir el contenido y las acciones de exportaci\xF3n.",
    scrapbookSelectAll: "Seleccionar todo",
    scrapbookExportSelected: "Exportar ZIP seleccionado",
    scrapbookExportAll: "Exportar todo en ZIP",
    scrapbookArchiveLoginTitle: "Se requiere iniciar sesi\xF3n.",
    scrapbookArchiveLoginCopy: "Conecta tu cuenta de Threads para ver aqu\xED las menciones guardadas.",
    scrapbookArchiveTableTitle: "T\xEDtulo",
    scrapbookArchiveTableDate: "Guardado el",
    scrapbookArchiveTableSource: "Origen",
    scrapbookArchiveTableTags: "Etiquetas",
    scrapbookNoResults: "No se encontraron resultados.",
    scrapbookWatchlistsEyebrow: "Listas de seguimiento",
    scrapbookWatchlistsTitle: "Vigilar cuentas p\xFAblicas",
    scrapbookWatchlistsCopy: "Registra cuentas p\xFAblicas de Threads y recopila solo las nuevas publicaciones que coincidan con tus reglas.",
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
    scrapbookFilterAutoArchiveLabel: "archivo autom\xE1tico",
    scrapbookFilterAuthorLabel: "autor",
    scrapbookMediaTypeText: "Solo texto",
    scrapbookMediaTypeImage: "Imagen",
    scrapbookMediaTypeVideo: "Video",
    scrapbookMediaTypeCarousel: "Carrusel",
    scrapbookWatchlistAutoArchive: "Guardar tambi\xE9n los nuevos resultados en inbox",
    scrapbookWatchlistSubmit: "A\xF1adir watchlist",
    scrapbookWatchlistsEmptyTitle: "Todav\xEDa no hay watchlists.",
    scrapbookWatchlistsEmptyCopy: "A\xF1ade una cuenta p\xFAblica para organizar las publicaciones recientes con tus reglas del scrapbook.",
    scrapbookSearchesEyebrow: "B\xFAsquedas",
    scrapbookSearchesTitle: "Supervisar palabras clave",
    scrapbookSearchesCopy: "Guarda monitores de b\xFAsqueda y filtra el ruido repetitivo del flujo de resultados.",
    scrapbookSearchQuery: "Consulta",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "Filtro de autor",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Handles excluidos",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Modo de b\xFAsqueda",
    scrapbookSearchTypeTop: "Destacados",
    scrapbookSearchTypeRecent: "Recientes",
    scrapbookSearchAutoArchive: "Guardar tambi\xE9n los nuevos resultados en inbox",
    scrapbookSearchSubmit: "A\xF1adir b\xFAsqueda",
    scrapbookSearchesEmptyTitle: "No hay monitores de b\xFAsqueda guardados.",
    scrapbookSearchesEmptyCopy: "Registra palabras clave para ver el flujo de resultados junto con las acciones de archivo.",
    scrapbookInsightsEyebrow: "Insights",
    scrapbookInsightsTitle: "Seguir el rendimiento de la cuenta",
    scrapbookInsightsCopy: "Guarda en una l\xEDnea temporal los insights del perfil y de las publicaciones de tu cuenta conectada de Threads.",
    scrapbookInsightsRecentSnapshot: "\xDAltima captura",
    scrapbookInsightsNotLoaded: "Todav\xEDa no se ha cargado.",
    scrapbookInsightsRefresh: "Actualizar insights",
    scrapbookMetricFollowers: "Seguidores",
    scrapbookMetricProfileViews: "Vistas del perfil",
    scrapbookMetricViews: "Vistas",
    scrapbookMetricLikes: "Me gusta",
    scrapbookMetricReplies: "Respuestas",
    scrapbookMetricReposts: "Reposts",
    scrapbookInsightsEmptyTitle: "A\xFAn no hay insights guardados.",
    scrapbookInsightsEmptyCopy: "Actualiza para capturar el rendimiento de tu cuenta y de tus publicaciones recientes.",
    scrapbookFooterTagline: "Disparador p\xFAblico por respuesta, resultado privado en el scrapbook.",
    scrapbookDateNone: "Ninguno",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "Sin cambios",
    scrapbookConnectServerNotReady: "El inicio de sesi\xF3n con Threads todav\xEDa no est\xE1 configurado en el servidor. A\xF1ade el app ID y el secreto para habilitarlo.",
    scrapbookArchiveFallbackAuthorPost: "publicaci\xF3n de @{handle}",
    scrapbookArchiveFallbackSavedItem: "Elemento guardado de Threads",
    scrapbookArchiveSelectionSummary: "{count} seleccionados \xB7 {total} en total",
    scrapbookArchiveSelectionTotal: "{total} en total",
    scrapbookMediaIncluded: "Se incluir\xE1n {count} archivos multimedia en la exportaci\xF3n.",
    scrapbookReplyHeader: "{count} respuestas del autor",
    scrapbookReplyLabel: "respuesta {index}",
    scrapbookReplyOpenOriginal: "Abrir respuesta original",
    scrapbookCopied: "Copiado",
    scrapbookCopyMarkdown: "Copiar Markdown",
    scrapbookClipboardError: "No se pudo copiar al portapapeles. Revisa los permisos del navegador.",
    scrapbookExportPreparing: "Preparando ZIP...",
    scrapbookExportChooseItems: "Selecciona primero los elementos que quieres exportar.",
    scrapbookExportReady: "La exportaci\xF3n ZIP est\xE1 lista. Se descargar\xE1n {count} elementos.",
    scrapbookExportFailed: "No se pudo crear la exportaci\xF3n ZIP.",
    scrapbookTriggerView: "Ver disparador",
    scrapbookImagesHide: "Ocultar im\xE1genes",
    scrapbookImagesShow: "Mostrar {count} im\xE1genes",
    scrapbookOpenOriginal: "Abrir original",
    scrapbookDownloadMarkdown: "Descargar Markdown",
    scrapbookDownloadZip: "Descargar ZIP",
    scrapbookArchiveLoginRequiredCopy: "Conecta tu cuenta de Threads para ver aqu\xED juntos la inbox de menciones y los guardados cloud de la extensi\xF3n.",
    scrapbookArchiveEmptyTitle: "Todav\xEDa no hay elementos guardados.",
    scrapbookArchiveEmptyCopy: "Aqu\xED se re\xFAnen la inbox de menciones, los guardados cloud de la extensi\xF3n, los autoarchivados de watchlist y los archivos de b\xFAsqueda.",
    scrapbookVerified: "verificado",
    scrapbookLastLogin: "\xFAltimo acceso {date}",
    scrapbookProfilePictureAlt: "foto de perfil de {name}",
    scrapbookScopeReady: "Permisos listos \xB7 {scopes}",
    scrapbookScopeReconnect: "Vuelve a iniciar sesi\xF3n con Threads para usar funciones avanzadas. Permisos faltantes: {scopes}",
    scrapbookScopeUpgrade: "actualizaci\xF3n de permisos",
    scrapbookTrackedOpen: "Abrir",
    scrapbookTrackedSaveInbox: "Guardar en inbox",
    scrapbookEmptyBody: "(Sin texto)",
    scrapbookWatchlistsLoginTitle: "Se requiere iniciar sesi\xF3n.",
    scrapbookWatchlistsLoginCopy: "Conecta tu cuenta de Threads para crear watchlists.",
    scrapbookWatchlistsReconnectTitle: "Se requiere actualizar permisos.",
    scrapbookWatchlistsReconnectCopy: "Vuelve a iniciar sesi\xF3n con Threads para usar watchlists de descubrimiento de perfiles.",
    scrapbookWatchlistsResults: "{count} resultados",
    scrapbookWatchlistsLastSync: "\xFAltima sincronizaci\xF3n {date}",
    scrapbookWatchlistsSyncNow: "Sincronizar ahora",
    scrapbookDelete: "Eliminar",
    scrapbookArchiveDeleteConfirm: '\xBFEliminar "{title}" del scrapbook?',
    scrapbookIncludeNone: "ninguno",
    scrapbookExcludeNone: "ninguno",
    scrapbookMediaAll: "todos",
    scrapbookAutoArchiveOn: "activado",
    scrapbookAutoArchiveOff: "desactivado",
    scrapbookRecentError: "Error reciente: {error}",
    scrapbookWatchlistsNoResultsTitle: "Todav\xEDa no hay resultados coincidentes.",
    scrapbookWatchlistsNoResultsCopy: "Ejecuta una sincronizaci\xF3n y aqu\xED aparecer\xE1n las nuevas publicaciones coincidentes.",
    scrapbookSearchesLoginTitle: "Se requiere iniciar sesi\xF3n.",
    scrapbookSearchesLoginCopy: "Conecta tu cuenta de Threads para usar b\xFAsqueda por palabras clave.",
    scrapbookSearchesReconnectTitle: "Se requiere actualizar permisos.",
    scrapbookSearchesReconnectCopy: "Vuelve a iniciar sesi\xF3n con Threads para usar b\xFAsqueda por palabras clave.",
    scrapbookSearchResults: "{count} resultados",
    scrapbookSearchMode: "modo {mode}",
    scrapbookSearchLastRun: "\xFAltima ejecuci\xF3n {date}",
    scrapbookSearchAuthorAll: "todos",
    scrapbookSearchHide: "Ocultar",
    scrapbookSearchesNoResultsTitle: "Todav\xEDa no hay resultados de b\xFAsqueda.",
    scrapbookSearchesNoResultsCopy: "Ejecuta la b\xFAsqueda para cargar los resultados m\xE1s recientes.",
    scrapbookInsightsRefreshedAt: "Actualizado {date}",
    scrapbookInsightsNotLoadedYet: "Todav\xEDa no se ha cargado.",
    scrapbookInsightsLoginTitle: "Se requiere iniciar sesi\xF3n.",
    scrapbookInsightsLoginCopy: "Conecta tu cuenta de Threads para cargar los insights.",
    scrapbookInsightsReconnectTitle: "Se requiere actualizar permisos.",
    scrapbookInsightsReconnectCopy: "Vuelve a iniciar sesi\xF3n con Threads para usar insights gestionados.",
    scrapbookInsightsViews: "vistas {value}",
    scrapbookInsightsLikes: "me gusta {value}",
    scrapbookInsightsReplies: "respuestas {value}",
    scrapbookInsightsReposts: "republicaciones {value}",
    scrapbookInsightsQuotes: "citas {value}",
    scrapbookStatusConnected: "Tu cuenta de Threads est\xE1 conectada.",
    scrapbookSessionRouting: "Este scrapbook est\xE1 vinculado a @{handle}. Cuando una respuesta p\xFAblica menciona a @{botHandle} y la cuenta autora de la respuesta es @{handle}, el elemento se guarda aqu\xED.",
    scrapbookLogoutSuccess: "Tu cuenta se desconect\xF3.",
    scrapbookLogoutFail: "No se pudo cerrar sesi\xF3n.",
    scrapbookStatusLoadFailed: "No se pudo cargar el estado del scrapbook.",
    scrapbookStatusWatchlistSaved: "Watchlist guardada.",
    scrapbookStatusWatchlistSynced: "Watchlist sincronizada.",
    scrapbookStatusWatchlistDeleted: "Watchlist eliminada.",
    scrapbookStatusArchiveDeleted: "Archivo eliminado.",
    scrapbookStatusTrackedSaved: "Resultado guardado en inbox.",
    scrapbookStatusSearchSaved: "Monitor de b\xFAsqueda guardado.",
    scrapbookStatusSearchRun: "B\xFAsqueda por palabra clave ejecutada.",
    scrapbookStatusSearchDeleted: "Monitor de b\xFAsqueda eliminado.",
    scrapbookStatusSearchArchived: "Resultado de b\xFAsqueda guardado en inbox.",
    scrapbookStatusSearchDismissed: "Resultado de b\xFAsqueda ocultado.",
    scrapbookInsightsRefreshLoading: "Cargando...",
    scrapbookStatusInsightsRefreshed: "Se guard\xF3 un nuevo snapshot de insights.",
    scrapbookStatusInsightSaved: "La publicaci\xF3n de insights se guard\xF3 en inbox."
  },
  "zh-TW": {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription: "\u628A\u900F\u904E\u7559\u8A00\u63D0\u53CA\u4FDD\u5B58\u7684 Threads \u8CBC\u6587\u96C6\u4E2D\u5230\u79C1\u5BC6 scrapbook\uFF0C\u4E26\u532F\u51FA\u6210 Markdown\u3002",
    scrapbookHomeAriaLabel: "Threads \u5DE5\u5177\u9996\u9801",
    scrapbookWorkspaceAriaLabel: "scrapbook \u5DE5\u4F5C\u5340",
    scrapbookLocaleLabel: "\u8A9E\u8A00",
    scrapbookNavHome: "\u9996\u9801",
    scrapbookNavCurrent: "\u6211\u7684 scrapbook",
    scrapbookHeroEyebrow: "\u63D0\u53CA scrapbook",
    scrapbookHeroTitle: "\u628A\u900F\u904E\u63D0\u53CA\u6536\u96C6\u7684 Threads \u5B58\u9032\u79C1\u5BC6 scrapbook\u3002",
    scrapbookHeroLead: "\u5728\u60F3\u4FDD\u5B58\u7684\u8CBC\u6587\u4E2D\u63D0\u53CA {handleStrong}\u3002\u670D\u52D9\u5E33\u865F\u53EA\u6703\u6536\u5230\u63D0\u53CA\u8A0A\u865F\uFF0C\u5167\u5BB9\u53EA\u6703\u5B58\u9032\u8207\u4F60\u767B\u5165 Threads \u5E33\u865F\u7D81\u5B9A\u7684 scrapbook\u3002",
    scrapbookConnectButton: "\u4F7F\u7528 Threads \u767B\u5165",
    scrapbookConnectBusy: "\u6B63\u5728\u958B\u555F\u767B\u5165\u9801\u9762...",
    scrapbookCopyLoginLink: "\u8907\u88FD\u767B\u5165\u9023\u7D50",
    scrapbookHeroHowItWorks: "\u904B\u4F5C\u65B9\u5F0F",
    scrapbookMobileOauthNote: "\u5728\u624B\u6A5F\u4E0A\uFF0C\u8ACB\u5148\u958B\u555F\u700F\u89BD\u5668\u7248\u9023\u7DDA\u9801\u9762\uFF0C\u6309\u4E0B {copyLoginLinkStrong}\uFF0C\u518D\u628A\u9023\u7D50\u8CBC\u5230\u65B0\u5206\u9801\u7684\u7DB2\u5740\u5217\u4E2D\u7E7C\u7E8C\u3002",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "\u79C1\u5BC6 scrapbook",
    scrapbookHeroNoteExport: "Markdown \u532F\u51FA",
    scrapbookFlowLabel: "\u4FDD\u5B58\u6D41\u7A0B",
    scrapbookFlowStep1: "\u5148\u628A\u4F60\u7684 Threads \u5E33\u865F\u9023\u7DDA\u4E00\u6B21\u3002",
    scrapbookFlowStep2: "\u5728\u60F3\u4FDD\u5B58\u7684\u8CBC\u6587\u63D0\u53CA {handleInline}\u3002",
    scrapbookFlowStep3: "\u5728\u7DB2\u9801\u4E0A\u6AA2\u67E5\u4FDD\u5B58\u7D50\u679C\uFF0C\u4E26\u532F\u51FA\u6210 Markdown\u3002",
    scrapbookConnectTag: "\u9023\u7DDA Threads",
    scrapbookConnectTitle: "\u9023\u7DDA\u4F60\u7684 Threads \u5E33\u865F",
    scrapbookConnectCopy: "\u9019\u88E1\u53EA\u9023\u7DDA scrapbook \u64C1\u6709\u8005\u5E33\u865F\u3002\u670D\u52D9\u5E33\u865F\u6703\u53E6\u5916\u4EE5 {handleInline} \u904B\u4F5C\uFF0C\u53EA\u6709\u7576\u767B\u5165\u5E33\u865F\u8207\u7559\u8A00\u4F5C\u8005\u5E33\u865F\u4E00\u81F4\u6642\uFF0C\u5167\u5BB9\u624D\u6703\u9032\u5165\u4F60\u7684\u6536\u85CF\u3002",
    scrapbookConnectedTag: "\u5DF2\u9023\u7DDA",
    scrapbookProfileLink: "\u958B\u555F Threads \u500B\u4EBA\u6A94\u6848",
    scrapbookLogout: "\u89E3\u9664\u6211\u7684\u5E33\u865F\u9023\u7DDA",
    scrapbookTabInbox: "\u6536\u4EF6\u5323",
    scrapbookTabWatchlists: "\u76E3\u770B\u6E05\u55AE",
    scrapbookTabSearches: "\u641C\u5C0B",
    scrapbookTabInsights: "\u6D1E\u5BDF",
    scrapbookHowEyebrow: "\u904B\u4F5C\u65B9\u5F0F",
    scrapbookHowTitle: "\u8A2D\u5B9A\u4E00\u6B21\uFF0C\u9760\u63D0\u53CA\u4FDD\u5B58\u3002",
    scrapbookHowCopy: "\u516C\u958B\u7559\u8A00\u53EA\u8CA0\u8CAC\u89F8\u767C\uFF0C\u771F\u6B63\u4FDD\u5B58\u7684\u7D50\u679C\u53EA\u6703\u986F\u793A\u5728\u4F60\u7684\u79C1\u5BC6 scrapbook\u3002",
    scrapbookHowStep1Title: "\u4F7F\u7528 Threads \u767B\u5165",
    scrapbookHowStep1Desc: "\u5148\u9023\u7DDA\u4F60\u7684 Threads \u5E33\u865F\uFF0C\u8B93\u4F3A\u670D\u5668\u80FD\u6B63\u78BA\u8FA8\u8B58\u54EA\u500B\u7559\u8A00\u4F5C\u8005\u5C6C\u65BC\u54EA\u500B scrapbook \u64C1\u6709\u8005\u3002",
    scrapbookHowStep2Title: "\u5728\u7559\u8A00\u4E2D\u63D0\u53CA\u6A5F\u5668\u4EBA",
    scrapbookHowStep2Desc: "\u5728\u60F3\u4FDD\u5B58\u7684\u8CBC\u6587\u4E2D\u53EA\u63D0\u53CA {handleInline}\uFF0C\u6536\u96C6\u5668\u5C31\u6703\u8A18\u9304\u9019\u500B\u4E8B\u4EF6\u3002",
    scrapbookHowStep3Title: "\u5728\u7DB2\u9801\u4E0A\u6AA2\u67E5\u4E26\u532F\u51FA",
    scrapbookHowStep3Desc: "\u5728 scrapbook \u4ECB\u9762\u78BA\u8A8D\u4FDD\u5B58\u5167\u5BB9\uFF0C\u7136\u5F8C\u7528 Markdown \u8907\u88FD\u6216\u4E0B\u8F09\u5230\u4E0B\u4E00\u500B\u5DE5\u5177\u3002",
    scrapbookInboxEyebrow: "\u6536\u4EF6\u5323",
    scrapbookInboxTitle: "\u7531\u63D0\u53CA\u6536\u96C6\u7684 inbox",
    scrapbookInboxCopy: "\u4FDD\u5B58\u7684\u9805\u76EE\u6703\u4EE5\u770B\u677F\u6E05\u55AE\u5448\u73FE\uFF0C\u9EDE\u64CA\u4EFB\u4E00\u5217\u5373\u53EF\u958B\u555F\u5167\u5BB9\u8207\u532F\u51FA\u64CD\u4F5C\u3002",
    scrapbookSelectAll: "\u5168\u9078",
    scrapbookExportSelected: "\u532F\u51FA\u6240\u9078 ZIP",
    scrapbookExportAll: "\u532F\u51FA\u5168\u90E8 ZIP",
    scrapbookArchiveLoginTitle: "\u9700\u8981\u767B\u5165\u3002",
    scrapbookArchiveLoginCopy: "\u9023\u7DDA Threads \u5E33\u865F\u5F8C\uFF0C\u4FDD\u5B58\u7684\u63D0\u53CA\u5C31\u6703\u986F\u793A\u5728\u9019\u88E1\u3002",
    scrapbookArchiveTableTitle: "\u6A19\u984C",
    scrapbookArchiveTableDate: "\u4FDD\u5B58\u6642\u9593",
    scrapbookArchiveTableSource: "\u4F86\u6E90",
    scrapbookArchiveTableTags: "\u6A19\u7C64",
    scrapbookNoResults: "\u6C92\u6709\u7B26\u5408\u7684\u7D50\u679C\u3002",
    scrapbookWatchlistsEyebrow: "\u76E3\u770B\u6E05\u55AE",
    scrapbookWatchlistsTitle: "\u8FFD\u8E64\u516C\u958B\u5E33\u865F",
    scrapbookWatchlistsCopy: "\u8A3B\u518A\u516C\u958B Threads \u5E33\u865F\uFF0C\u53EA\u6536\u96C6\u7B26\u5408\u898F\u5247\u7684\u65B0\u8CBC\u6587\u3002",
    scrapbookWatchlistTargetHandle: "\u76EE\u6A19 handle",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "\u5305\u542B\u95DC\u9375\u5B57",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "\u6392\u9664\u95DC\u9375\u5B57",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "\u5A92\u9AD4\u985E\u578B",
    scrapbookFilterIncludeLabel: "\u5305\u542B",
    scrapbookFilterExcludeLabel: "\u6392\u9664",
    scrapbookFilterMediaLabel: "\u5A92\u9AD4",
    scrapbookFilterAutoArchiveLabel: "\u81EA\u52D5\u5C01\u5B58",
    scrapbookFilterAuthorLabel: "\u4F5C\u8005",
    scrapbookMediaTypeText: "\u7D14\u6587\u5B57",
    scrapbookMediaTypeImage: "\u5716\u7247",
    scrapbookMediaTypeVideo: "\u5F71\u7247",
    scrapbookMediaTypeCarousel: "\u8F2A\u64AD",
    scrapbookWatchlistAutoArchive: "\u65B0\u7D50\u679C\u4E5F\u540C\u6B65\u4FDD\u5B58\u5230 inbox",
    scrapbookWatchlistSubmit: "\u65B0\u589E watchlist",
    scrapbookWatchlistsEmptyTitle: "\u76EE\u524D\u9084\u6C92\u6709 watchlist\u3002",
    scrapbookWatchlistsEmptyCopy: "\u52A0\u5165\u516C\u958B\u5E33\u865F\u5F8C\uFF0C\u6700\u8FD1\u8CBC\u6587\u6703\u4F9D\u7167\u4F60\u7684 scrapbook \u898F\u5247\u6574\u7406\u3002",
    scrapbookSearchesEyebrow: "\u641C\u5C0B",
    scrapbookSearchesTitle: "\u76E3\u63A7\u95DC\u9375\u5B57",
    scrapbookSearchesCopy: "\u4FDD\u5B58\u641C\u5C0B\u76E3\u63A7\uFF0C\u6392\u9664\u91CD\u8907\u96DC\u8A0A\uFF0C\u53EA\u7559\u4E0B\u9700\u8981\u7684\u7D50\u679C\u6D41\u3002",
    scrapbookSearchQuery: "\u641C\u5C0B\u8A5E",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "\u4F5C\u8005\u7BE9\u9078",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "\u6392\u9664 handles",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "\u641C\u5C0B\u6A21\u5F0F",
    scrapbookSearchTypeTop: "\u71B1\u9580",
    scrapbookSearchTypeRecent: "\u6700\u65B0",
    scrapbookSearchAutoArchive: "\u65B0\u7D50\u679C\u4E5F\u540C\u6B65\u4FDD\u5B58\u5230 inbox",
    scrapbookSearchSubmit: "\u65B0\u589E search",
    scrapbookSearchesEmptyTitle: "\u76EE\u524D\u6C92\u6709\u5DF2\u4FDD\u5B58\u7684 search monitor\u3002",
    scrapbookSearchesEmptyCopy: "\u52A0\u5165\u95DC\u9375\u5B57\u5F8C\uFF0C\u5C31\u80FD\u540C\u6642\u770B\u5230\u7D50\u679C\u6D41\u8207\u5C01\u5B58\u64CD\u4F5C\u3002",
    scrapbookInsightsEyebrow: "\u6D1E\u5BDF",
    scrapbookInsightsTitle: "\u8FFD\u8E64\u5E33\u865F\u8868\u73FE",
    scrapbookInsightsCopy: "\u628A\u5DF2\u9023\u7DDA Threads \u5E33\u865F\u7684\u500B\u4EBA\u6A94\u6848\u8207\u8CBC\u6587 insights \u4EE5\u6642\u9593\u7DDA\u65B9\u5F0F\u4FDD\u5B58\u3002",
    scrapbookInsightsRecentSnapshot: "\u6700\u8FD1\u5FEB\u7167",
    scrapbookInsightsNotLoaded: "\u5C1A\u672A\u8F09\u5165\u3002",
    scrapbookInsightsRefresh: "\u91CD\u65B0\u6574\u7406 Insights",
    scrapbookMetricFollowers: "\u8FFD\u8E64\u8005",
    scrapbookMetricProfileViews: "\u500B\u4EBA\u6A94\u6848\u700F\u89BD",
    scrapbookMetricViews: "\u700F\u89BD\u6B21\u6578",
    scrapbookMetricLikes: "\u6309\u8B9A",
    scrapbookMetricReplies: "\u56DE\u8986",
    scrapbookMetricReposts: "\u8F49\u767C",
    scrapbookInsightsEmptyTitle: "\u76EE\u524D\u9084\u6C92\u6709\u4FDD\u5B58\u7684 insights\u3002",
    scrapbookInsightsEmptyCopy: "\u6309\u4E0B\u91CD\u65B0\u6574\u7406\u5F8C\uFF0C\u5C31\u6703\u6293\u53D6\u4F60\u7684\u5E33\u865F\u8207\u6700\u8FD1\u8CBC\u6587\u8868\u73FE\u3002",
    scrapbookFooterTagline: "\u516C\u958B\u7559\u8A00\u89F8\u767C\uFF0C\u79C1\u5BC6 scrapbook \u4FDD\u5B58\u3002",
    scrapbookDateNone: "\u7121",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "\u6C92\u6709\u8B8A\u5316",
    scrapbookConnectServerNotReady: "\u4F3A\u670D\u5668\u7AEF\u5C1A\u672A\u5B8C\u6210 Threads \u767B\u5165\u8A2D\u5B9A\u3002\u52A0\u5165 app ID \u8207 secret \u5F8C\u5373\u53EF\u555F\u7528\u3002",
    scrapbookArchiveFallbackAuthorPost: "@{handle} \u7684\u8CBC\u6587",
    scrapbookArchiveFallbackSavedItem: "\u5DF2\u4FDD\u5B58\u7684 Threads \u9805\u76EE",
    scrapbookArchiveSelectionSummary: "\u5DF2\u9078 {count} \u9805 \xB7 \u5171 {total} \u9805",
    scrapbookArchiveSelectionTotal: "\u5171 {total} \u9805",
    scrapbookMediaIncluded: "\u532F\u51FA\u6703\u5305\u542B {count} \u500B\u5A92\u9AD4\u6A94\u3002",
    scrapbookReplyHeader: "\u4F5C\u8005\u56DE\u8986 {count} \u5247",
    scrapbookReplyLabel: "\u56DE\u8986 {index}",
    scrapbookReplyOpenOriginal: "\u67E5\u770B\u539F\u59CB\u56DE\u8986",
    scrapbookCopied: "\u5DF2\u8907\u88FD",
    scrapbookCopyMarkdown: "\u8907\u88FD Markdown",
    scrapbookClipboardError: "\u7121\u6CD5\u8907\u88FD\u5230\u526A\u8CBC\u7C3F\u3002\u8ACB\u6AA2\u67E5\u700F\u89BD\u5668\u6B0A\u9650\u3002",
    scrapbookExportPreparing: "\u6B63\u5728\u6E96\u5099 ZIP...",
    scrapbookExportChooseItems: "\u8ACB\u5148\u9078\u64C7\u8981\u532F\u51FA\u7684\u9805\u76EE\u3002",
    scrapbookExportReady: "ZIP \u532F\u51FA\u5DF2\u6E96\u5099\u5B8C\u6210\uFF0C\u6B63\u5728\u4E0B\u8F09 {count} \u9805\u3002",
    scrapbookExportFailed: "\u7121\u6CD5\u5EFA\u7ACB ZIP \u532F\u51FA\u3002",
    scrapbookTriggerView: "\u67E5\u770B\u89F8\u767C\u7559\u8A00",
    scrapbookImagesHide: "\u6536\u8D77\u5716\u7247",
    scrapbookImagesShow: "\u986F\u793A {count} \u5F35\u5716\u7247",
    scrapbookOpenOriginal: "\u67E5\u770B\u539F\u6587",
    scrapbookDownloadMarkdown: "\u4E0B\u8F09 Markdown",
    scrapbookDownloadZip: "\u4E0B\u8F09 ZIP",
    scrapbookArchiveLoginRequiredCopy: "\u9023\u7DDA Threads \u5E33\u865F\u5F8C\uFF0C\u9019\u88E1\u6703\u540C\u6642\u986F\u793A\u63D0\u53CA inbox \u8207 extension cloud \u4FDD\u5B58\u5167\u5BB9\u3002",
    scrapbookArchiveEmptyTitle: "\u76EE\u524D\u9084\u6C92\u6709\u4FDD\u5B58\u7684\u9805\u76EE\u3002",
    scrapbookArchiveEmptyCopy: "\u63D0\u53CA inbox\u3001extension cloud \u4FDD\u5B58\u3001watchlist \u81EA\u52D5\u5C01\u5B58\u8207 search archive \u90FD\u6703\u96C6\u4E2D\u5728\u9019\u88E1\u3002",
    scrapbookVerified: "\u5DF2\u9A57\u8B49",
    scrapbookLastLogin: "\u4E0A\u6B21\u767B\u5165 {date}",
    scrapbookProfilePictureAlt: "{name} \u7684\u500B\u4EBA\u982D\u50CF",
    scrapbookScopeReady: "\u6B0A\u9650\u5DF2\u5C31\u7DD2 \xB7 {scopes}",
    scrapbookScopeReconnect: "\u82E5\u8981\u4F7F\u7528\u9032\u968E\u529F\u80FD\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165 Threads\u3002\u7F3A\u5C11\u6B0A\u9650\uFF1A{scopes}",
    scrapbookScopeUpgrade: "scope upgrade",
    scrapbookTrackedOpen: "\u958B\u555F",
    scrapbookTrackedSaveInbox: "\u4FDD\u5B58\u5230 inbox",
    scrapbookEmptyBody: "\uFF08\u7121\u672C\u6587\uFF09",
    scrapbookWatchlistsLoginTitle: "\u9700\u8981\u767B\u5165\u3002",
    scrapbookWatchlistsLoginCopy: "\u5FC5\u9808\u5148\u9023\u7DDA Threads \u5E33\u865F\u624D\u80FD\u5EFA\u7ACB watchlists\u3002",
    scrapbookWatchlistsReconnectTitle: "\u9700\u8981\u91CD\u65B0\u540C\u610F\u6B0A\u9650\u3002",
    scrapbookWatchlistsReconnectCopy: "\u91CD\u65B0\u767B\u5165 Threads \u5F8C\u5373\u53EF\u4F7F\u7528 profile discovery watchlist\u3002",
    scrapbookWatchlistsResults: "{count} \u7B46\u7D50\u679C",
    scrapbookWatchlistsLastSync: "\u4E0A\u6B21\u540C\u6B65 {date}",
    scrapbookWatchlistsSyncNow: "\u7ACB\u5373\u540C\u6B65",
    scrapbookDelete: "\u522A\u9664",
    scrapbookArchiveDeleteConfirm: "\u8981\u5F9E scrapbook \u522A\u9664\u300C{title}\u300D\u55CE\uFF1F",
    scrapbookIncludeNone: "\u7121",
    scrapbookExcludeNone: "\u7121",
    scrapbookMediaAll: "\u5168\u90E8",
    scrapbookAutoArchiveOn: "\u958B\u555F",
    scrapbookAutoArchiveOff: "\u95DC\u9589",
    scrapbookRecentError: "\u6700\u8FD1\u932F\u8AA4\uFF1A{error}",
    scrapbookWatchlistsNoResultsTitle: "\u76EE\u524D\u9084\u6C92\u6709\u7B26\u5408\u7684\u7D50\u679C\u3002",
    scrapbookWatchlistsNoResultsCopy: "\u57F7\u884C\u540C\u6B65\u5F8C\uFF0C\u7B26\u5408\u689D\u4EF6\u7684\u65B0\u8CBC\u6587\u5C31\u6703\u986F\u793A\u5728\u9019\u88E1\u3002",
    scrapbookSearchesLoginTitle: "\u9700\u8981\u767B\u5165\u3002",
    scrapbookSearchesLoginCopy: "\u5FC5\u9808\u5148\u9023\u7DDA Threads \u5E33\u865F\u624D\u80FD\u4F7F\u7528 keyword search\u3002",
    scrapbookSearchesReconnectTitle: "\u9700\u8981\u91CD\u65B0\u540C\u610F\u6B0A\u9650\u3002",
    scrapbookSearchesReconnectCopy: "\u91CD\u65B0\u767B\u5165 Threads \u5F8C\u5373\u53EF\u4F7F\u7528 keyword search\u3002",
    scrapbookSearchResults: "{count} \u7B46\u7D50\u679C",
    scrapbookSearchMode: "\u6A21\u5F0F {mode}",
    scrapbookSearchLastRun: "\u4E0A\u6B21\u57F7\u884C {date}",
    scrapbookSearchAuthorAll: "\u5168\u90E8",
    scrapbookSearchHide: "\u96B1\u85CF",
    scrapbookSearchesNoResultsTitle: "\u76EE\u524D\u9084\u6C92\u6709\u641C\u5C0B\u7D50\u679C\u3002",
    scrapbookSearchesNoResultsCopy: "\u57F7\u884C\u641C\u5C0B\u5F8C\uFF0C\u9019\u88E1\u5C31\u6703\u586B\u5165\u6700\u65B0\u7D50\u679C\u3002",
    scrapbookInsightsRefreshedAt: "{date} \u66F4\u65B0",
    scrapbookInsightsNotLoadedYet: "\u5C1A\u672A\u8F09\u5165\u3002",
    scrapbookInsightsLoginTitle: "\u9700\u8981\u767B\u5165\u3002",
    scrapbookInsightsLoginCopy: "\u5FC5\u9808\u5148\u9023\u7DDA Threads \u5E33\u865F\u624D\u80FD\u8F09\u5165 insights\u3002",
    scrapbookInsightsReconnectTitle: "\u9700\u8981\u91CD\u65B0\u540C\u610F\u6B0A\u9650\u3002",
    scrapbookInsightsReconnectCopy: "\u91CD\u65B0\u767B\u5165 Threads \u5F8C\u5373\u53EF\u4F7F\u7528 managed insights\u3002",
    scrapbookInsightsViews: "\u700F\u89BD {value}",
    scrapbookInsightsLikes: "\u6309\u8B9A {value}",
    scrapbookInsightsReplies: "\u56DE\u8986 {value}",
    scrapbookInsightsReposts: "\u8F49\u767C {value}",
    scrapbookInsightsQuotes: "\u5F15\u7528 {value}",
    scrapbookStatusConnected: "\u4F60\u7684 Threads \u5E33\u865F\u5DF2\u5B8C\u6210\u9023\u7DDA\u3002",
    scrapbookSessionRouting: "\u9019\u500B scrapbook \u5DF2\u7D81\u5B9A @{handle}\u3002\u7576\u516C\u958B\u7559\u8A00\u63D0\u53CA @{botHandle}\uFF0C\u800C\u7559\u8A00\u4F5C\u8005\u5E33\u865F\u5C31\u662F @{handle} \u6642\uFF0C\u5167\u5BB9\u5C31\u6703\u4FDD\u5B58\u5230\u9019\u88E1\u3002",
    scrapbookLogoutSuccess: "\u5DF2\u89E3\u9664\u5E33\u865F\u9023\u7DDA\u3002",
    scrapbookLogoutFail: "\u7121\u6CD5\u767B\u51FA\u3002",
    scrapbookStatusLoadFailed: "\u7121\u6CD5\u8F09\u5165 scrapbook \u72C0\u614B\u3002",
    scrapbookStatusWatchlistSaved: "\u5DF2\u4FDD\u5B58 watchlist\u3002",
    scrapbookStatusWatchlistSynced: "\u5DF2\u540C\u6B65 watchlist\u3002",
    scrapbookStatusWatchlistDeleted: "\u5DF2\u522A\u9664 watchlist\u3002",
    scrapbookStatusArchiveDeleted: "\u5DF2\u522A\u9664\u5C01\u5B58\u9805\u76EE\u3002",
    scrapbookStatusTrackedSaved: "\u5DF2\u628A\u7D50\u679C\u4FDD\u5B58\u5230 inbox\u3002",
    scrapbookStatusSearchSaved: "\u5DF2\u4FDD\u5B58 search monitor\u3002",
    scrapbookStatusSearchRun: "\u5DF2\u57F7\u884C keyword search\u3002",
    scrapbookStatusSearchDeleted: "\u5DF2\u522A\u9664 search monitor\u3002",
    scrapbookStatusSearchArchived: "\u5DF2\u628A\u641C\u5C0B\u7D50\u679C\u4FDD\u5B58\u5230 inbox\u3002",
    scrapbookStatusSearchDismissed: "\u5DF2\u96B1\u85CF\u641C\u5C0B\u7D50\u679C\u3002",
    scrapbookInsightsRefreshLoading: "\u8F09\u5165\u4E2D...",
    scrapbookStatusInsightsRefreshed: "\u5DF2\u4FDD\u5B58\u65B0\u7684 insights \u5FEB\u7167\u3002",
    scrapbookStatusInsightSaved: "\u5DF2\u628A insight \u8CBC\u6587\u4FDD\u5B58\u5230 inbox\u3002"
  },
  vi: {
    scrapbookDocumentTitle: "Threads Scrapbook",
    scrapbookDocumentDescription: "L\u01B0u c\xE1c b\xE0i Threads \u0111\u01B0\u1EE3c \u0111\xE1nh d\u1EA5u b\u1EB1ng l\u01B0\u1EE3t mention v\xE0o scrapbook ri\xEAng t\u01B0 v\xE0 xu\u1EA5t ra Markdown.",
    scrapbookHomeAriaLabel: "Trang ch\u1EE7 c\xF4ng c\u1EE5 Threads",
    scrapbookWorkspaceAriaLabel: "Kh\xF4ng gian l\xE0m vi\u1EC7c scrapbook",
    scrapbookLocaleLabel: "Ng\xF4n ng\u1EEF",
    scrapbookNavHome: "Trang ch\u1EE7",
    scrapbookNavCurrent: "scrapbook c\u1EE7a t\xF4i",
    scrapbookHeroEyebrow: "scrapbook b\u1EB1ng mention",
    scrapbookHeroTitle: "L\u01B0u c\xE1c b\xE0i Threads \u0111\u01B0\u1EE3c gom b\u1EB1ng mention v\xE0o scrapbook ri\xEAng t\u01B0.",
    scrapbookHeroLead: "H\xE3y mention {handleStrong} trong b\xE0i b\u1EA1n mu\u1ED1n l\u01B0u. T\xE0i kho\u1EA3n d\u1ECBch v\u1EE5 ch\u1EC9 nh\u1EADn t\xEDn hi\u1EC7u mention, c\xF2n n\u1ED9i dung ch\u1EC9 \u0111\u01B0\u1EE3c l\u01B0u v\xE0o scrapbook g\u1EAFn v\u1EDBi t\xE0i kho\u1EA3n Threads b\u1EA1n \u0111\xE3 \u0111\u0103ng nh\u1EADp.",
    scrapbookConnectButton: "\u0110\u0103ng nh\u1EADp b\u1EB1ng Threads",
    scrapbookConnectBusy: "\u0110ang m\u1EDF trang \u0111\u0103ng nh\u1EADp...",
    scrapbookCopyLoginLink: "Sao ch\xE9p li\xEAn k\u1EBFt \u0111\u0103ng nh\u1EADp",
    scrapbookHeroHowItWorks: "C\xE1ch ho\u1EA1t \u0111\u1ED9ng",
    scrapbookMobileOauthNote: "Tr\xEAn di \u0111\u1ED9ng, h\xE3y m\u1EDF trang k\u1EBFt n\u1ED1i b\u1EB1ng tr\xECnh duy\u1EC7t, b\u1EA5m {copyLoginLinkStrong}, r\u1ED3i d\xE1n li\xEAn k\u1EBFt v\xE0o thanh \u0111\u1ECBa ch\u1EC9 c\u1EE7a tab m\u1EDBi \u0111\u1EC3 ti\u1EBFp t\u1EE5c.",
    scrapbookHeroNoteOauth: "Threads OAuth",
    scrapbookHeroNotePrivate: "scrapbook ri\xEAng t\u01B0",
    scrapbookHeroNoteExport: "xu\u1EA5t Markdown",
    scrapbookFlowLabel: "Lu\u1ED3ng l\u01B0u",
    scrapbookFlowStep1: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads c\u1EE7a b\u1EA1n m\u1ED9t l\u1EA7n.",
    scrapbookFlowStep2: "Mention {handleInline} trong b\xE0i b\u1EA1n mu\u1ED1n l\u01B0u.",
    scrapbookFlowStep3: "Xem l\u1EA1i m\u1EE5c \u0111\xE3 l\u01B0u tr\xEAn web v\xE0 xu\u1EA5t ra Markdown.",
    scrapbookConnectTag: "K\u1EBFt n\u1ED1i Threads",
    scrapbookConnectTitle: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads c\u1EE7a b\u1EA1n",
    scrapbookConnectCopy: "\u1EDE \u0111\xE2y ch\u1EC9 k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n ch\u1EE7 s\u1EDF h\u1EEFu scrapbook. T\xE0i kho\u1EA3n d\u1ECBch v\u1EE5 ch\u1EA1y ri\xEAng d\u01B0\u1EDBi t\xEAn {handleInline}, v\xE0 m\u1EE5c ch\u1EC9 v\xE0o kho l\u01B0u tr\u1EEF c\u1EE7a b\u1EA1n khi t\xE0i kho\u1EA3n \u0111ang \u0111\u0103ng nh\u1EADp tr\xF9ng v\u1EDBi t\xE0i kho\u1EA3n \u0111\xE3 vi\u1EBFt reply.",
    scrapbookConnectedTag: "\u0110\xE3 k\u1EBFt n\u1ED1i",
    scrapbookProfileLink: "M\u1EDF h\u1ED3 s\u01A1 Threads",
    scrapbookLogout: "Ng\u1EAFt k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n c\u1EE7a t\xF4i",
    scrapbookTabInbox: "H\u1ED9p th\u01B0",
    scrapbookTabWatchlists: "Danh s\xE1ch theo d\xF5i",
    scrapbookTabSearches: "T\xECm ki\u1EBFm",
    scrapbookTabInsights: "Ph\xE2n t\xEDch",
    scrapbookHowEyebrow: "C\xE1ch ho\u1EA1t \u0111\u1ED9ng",
    scrapbookHowTitle: "Thi\u1EBFt l\u1EADp m\u1ED9t l\u1EA7n, l\u01B0u b\u1EB1ng mention.",
    scrapbookHowCopy: "Reply c\xF4ng khai ch\u1EC9 \u0111\xF3ng vai tr\xF2 k\xEDch ho\u1EA1t. K\u1EBFt qu\u1EA3 \u0111\xE3 l\u01B0u ch\u1EC9 xu\u1EA5t hi\u1EC7n trong scrapbook ri\xEAng c\u1EE7a b\u1EA1n.",
    scrapbookHowStep1Title: "\u0110\u0103ng nh\u1EADp b\u1EB1ng Threads",
    scrapbookHowStep1Desc: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads \u0111\u1EC3 m\xE1y ch\u1EE7 x\xE1c \u0111\u1ECBnh ch\xEDnh x\xE1c ai l\xE0 ng\u01B0\u1EDDi vi\u1EBFt reply v\xE0 thu\u1ED9c scrapbook n\xE0o.",
    scrapbookHowStep2Title: "Mention bot trong reply",
    scrapbookHowStep2Desc: "Ch\u1EC9 c\u1EA7n mention {handleInline} trong b\xE0i mu\u1ED1n l\u01B0u, b\u1ED9 thu th\u1EADp s\u1EBD ghi l\u1EA1i s\u1EF1 ki\u1EC7n \u0111\xF3.",
    scrapbookHowStep3Title: "Xem l\u1EA1i v\xE0 xu\u1EA5t tr\xEAn web",
    scrapbookHowStep3Desc: "Ki\u1EC3m tra k\u1EBFt qu\u1EA3 \u0111\xE3 l\u01B0u trong giao di\u1EC7n scrapbook r\u1ED3i sao ch\xE9p ho\u1EB7c t\u1EA3i Markdown sang c\xF4ng c\u1EE5 ti\u1EBFp theo.",
    scrapbookInboxEyebrow: "H\u1ED9p th\u01B0",
    scrapbookInboxTitle: "Inbox \u0111\u01B0\u1EE3c gom t\u1EEB mention",
    scrapbookInboxCopy: "C\xE1c m\u1EE5c \u0111\xE3 l\u01B0u \u0111\u01B0\u1EE3c s\u1EAFp th\xE0nh danh s\xE1ch ki\u1EC3u b\u1EA3ng. B\u1EA5m v\xE0o t\u1EEBng d\xF2ng \u0111\u1EC3 m\u1EDF n\u1ED9i dung v\xE0 thao t\xE1c xu\u1EA5t.",
    scrapbookSelectAll: "Ch\u1ECDn t\u1EA5t c\u1EA3",
    scrapbookExportSelected: "Xu\u1EA5t ZIP \u0111\xE3 ch\u1ECDn",
    scrapbookExportAll: "Xu\u1EA5t to\xE0n b\u1ED9 ZIP",
    scrapbookArchiveLoginTitle: "C\u1EA7n \u0111\u0103ng nh\u1EADp.",
    scrapbookArchiveLoginCopy: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads \u0111\u1EC3 xem c\xE1c mention \u0111\xE3 l\u01B0u t\u1EA1i \u0111\xE2y.",
    scrapbookArchiveTableTitle: "Ti\xEAu \u0111\u1EC1",
    scrapbookArchiveTableDate: "Th\u1EDDi \u0111i\u1EC3m l\u01B0u",
    scrapbookArchiveTableSource: "Ngu\u1ED3n",
    scrapbookArchiveTableTags: "Th\u1EBB",
    scrapbookNoResults: "Kh\xF4ng c\xF3 k\u1EBFt qu\u1EA3 ph\xF9 h\u1EE3p.",
    scrapbookWatchlistsEyebrow: "Danh s\xE1ch theo d\xF5i",
    scrapbookWatchlistsTitle: "Theo d\xF5i t\xE0i kho\u1EA3n c\xF4ng khai",
    scrapbookWatchlistsCopy: "\u0110\u0103ng k\xFD t\xE0i kho\u1EA3n Threads c\xF4ng khai v\xE0 ch\u1EC9 thu c\xE1c b\xE0i m\u1EDBi kh\u1EDBp v\u1EDBi \u0111i\u1EC1u ki\u1EC7n c\u1EE7a b\u1EA1n.",
    scrapbookWatchlistTargetHandle: "Handle m\u1EE5c ti\xEAu",
    scrapbookWatchlistTargetHandlePh: "@handle",
    scrapbookWatchlistInclude: "T\u1EEB kh\xF3a bao g\u1ED3m",
    scrapbookWatchlistIncludePh: "ai agent prompt",
    scrapbookWatchlistExclude: "T\u1EEB kh\xF3a lo\u1EA1i tr\u1EEB",
    scrapbookWatchlistExcludePh: "giveaway ad",
    scrapbookWatchlistMediaTypes: "Lo\u1EA1i media",
    scrapbookFilterIncludeLabel: "bao g\u1ED3m",
    scrapbookFilterExcludeLabel: "lo\u1EA1i tr\u1EEB",
    scrapbookFilterMediaLabel: "ph\u01B0\u01A1ng ti\u1EC7n",
    scrapbookFilterAutoArchiveLabel: "t\u1EF1 \u0111\u1ED9ng l\u01B0u tr\u1EEF",
    scrapbookFilterAuthorLabel: "t\xE1c gi\u1EA3",
    scrapbookMediaTypeText: "Ch\u1EC9 v\u0103n b\u1EA3n",
    scrapbookMediaTypeImage: "H\xECnh \u1EA3nh",
    scrapbookMediaTypeVideo: "Video",
    scrapbookMediaTypeCarousel: "B\u0103ng chuy\u1EC1n",
    scrapbookWatchlistAutoArchive: "L\u01B0u k\u1EBFt qu\u1EA3 m\u1EDBi v\xE0o inbox lu\xF4n",
    scrapbookWatchlistSubmit: "Th\xEAm watchlist",
    scrapbookWatchlistsEmptyTitle: "Ch\u01B0a c\xF3 watchlist n\xE0o.",
    scrapbookWatchlistsEmptyCopy: "Th\xEAm m\u1ED9t t\xE0i kho\u1EA3n c\xF4ng khai \u0111\u1EC3 b\xE0i \u0111\u0103ng g\u1EA7n \u0111\xE2y \u0111\u01B0\u1EE3c s\u1EAFp x\u1EBFp theo quy t\u1EAFc scrapbook c\u1EE7a b\u1EA1n.",
    scrapbookSearchesEyebrow: "T\xECm ki\u1EBFm",
    scrapbookSearchesTitle: "Gi\xE1m s\xE1t t\u1EEB kh\xF3a",
    scrapbookSearchesCopy: "L\u01B0u b\u1ED9 theo d\xF5i t\xECm ki\u1EBFm v\xE0 l\u1ECDc b\u1EDBt nhi\u1EC5u l\u1EB7p l\u1EA1i kh\u1ECFi lu\u1ED3ng k\u1EBFt qu\u1EA3.",
    scrapbookSearchQuery: "T\u1EEB kh\xF3a",
    scrapbookSearchQueryPh: "openai codex",
    scrapbookSearchAuthor: "B\u1ED9 l\u1ECDc t\xE1c gi\u1EA3",
    scrapbookSearchAuthorPh: "@parktaejun",
    scrapbookSearchExcludeHandles: "Handle lo\u1EA1i tr\u1EEB",
    scrapbookSearchExcludeHandlesPh: "@spam1, @spam2",
    scrapbookSearchType: "Ch\u1EBF \u0111\u1ED9 t\xECm ki\u1EBFm",
    scrapbookSearchTypeTop: "N\u1ED5i b\u1EADt",
    scrapbookSearchTypeRecent: "M\u1EDBi nh\u1EA5t",
    scrapbookSearchAutoArchive: "L\u01B0u k\u1EBFt qu\u1EA3 m\u1EDBi v\xE0o inbox lu\xF4n",
    scrapbookSearchSubmit: "Th\xEAm search",
    scrapbookSearchesEmptyTitle: "Ch\u01B0a c\xF3 search monitor n\xE0o \u0111\u01B0\u1EE3c l\u01B0u.",
    scrapbookSearchesEmptyCopy: "\u0110\u0103ng k\xFD t\u1EEB kh\xF3a \u0111\u1EC3 xem lu\u1ED3ng k\u1EBFt qu\u1EA3 c\xF9ng c\xE1c thao t\xE1c l\u01B0u tr\u1EEF.",
    scrapbookInsightsEyebrow: "Ph\xE2n t\xEDch",
    scrapbookInsightsTitle: "Theo d\xF5i hi\u1EC7u su\u1EA5t t\xE0i kho\u1EA3n",
    scrapbookInsightsCopy: "L\u01B0u insight h\u1ED3 s\u01A1 v\xE0 b\xE0i vi\u1EBFt c\u1EE7a t\xE0i kho\u1EA3n Threads \u0111\xE3 k\u1EBFt n\u1ED1i theo d\u1EA1ng d\xF2ng th\u1EDDi gian.",
    scrapbookInsightsRecentSnapshot: "\u1EA2nh ch\u1EE5p g\u1EA7n nh\u1EA5t",
    scrapbookInsightsNotLoaded: "Ch\u01B0a t\u1EA3i.",
    scrapbookInsightsRefresh: "L\xE0m m\u1EDBi Insights",
    scrapbookMetricFollowers: "Ng\u01B0\u1EDDi theo d\xF5i",
    scrapbookMetricProfileViews: "L\u01B0\u1EE3t xem h\u1ED3 s\u01A1",
    scrapbookMetricViews: "L\u01B0\u1EE3t xem",
    scrapbookMetricLikes: "L\u01B0\u1EE3t th\xEDch",
    scrapbookMetricReplies: "Ph\u1EA3n h\u1ED3i",
    scrapbookMetricReposts: "B\xE0i \u0111\u0103ng l\u1EA1i",
    scrapbookInsightsEmptyTitle: "Ch\u01B0a c\xF3 insight n\xE0o \u0111\u01B0\u1EE3c l\u01B0u.",
    scrapbookInsightsEmptyCopy: "B\u1EA5m l\xE0m m\u1EDBi \u0111\u1EC3 l\u1EA5y hi\u1EC7u su\u1EA5t t\xE0i kho\u1EA3n v\xE0 c\xE1c b\xE0i g\u1EA7n \u0111\xE2y c\u1EE7a b\u1EA1n.",
    scrapbookFooterTagline: "Reply c\xF4ng khai l\xE0m t\xEDn hi\u1EC7u, scrapbook ri\xEAng t\u01B0 gi\u1EEF k\u1EBFt qu\u1EA3.",
    scrapbookDateNone: "Kh\xF4ng c\xF3",
    scrapbookNumberNone: "-",
    scrapbookNoChange: "Kh\xF4ng thay \u0111\u1ED5i",
    scrapbookConnectServerNotReady: "\u0110\u0103ng nh\u1EADp Threads v\u1EABn ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh tr\xEAn m\xE1y ch\u1EE7. Th\xEAm app ID v\xE0 secret \u0111\u1EC3 b\u1EADt t\xEDnh n\u0103ng n\xE0y.",
    scrapbookArchiveFallbackAuthorPost: "b\xE0i vi\u1EBFt c\u1EE7a @{handle}",
    scrapbookArchiveFallbackSavedItem: "M\u1EE5c Threads \u0111\xE3 l\u01B0u",
    scrapbookArchiveSelectionSummary: "\u0110\xE3 ch\u1ECDn {count} \xB7 t\u1ED5ng {total}",
    scrapbookArchiveSelectionTotal: "T\u1ED5ng {total}",
    scrapbookMediaIncluded: "B\u1EA3n xu\u1EA5t s\u1EBD g\u1ED3m {count} t\u1EC7p media.",
    scrapbookReplyHeader: "{count} reply c\u1EE7a t\xE1c gi\u1EA3",
    scrapbookReplyLabel: "ph\u1EA3n h\u1ED3i {index}",
    scrapbookReplyOpenOriginal: "Xem reply g\u1ED1c",
    scrapbookCopied: "\u0110\xE3 sao ch\xE9p",
    scrapbookCopyMarkdown: "Sao ch\xE9p Markdown",
    scrapbookClipboardError: "Kh\xF4ng th\u1EC3 sao ch\xE9p v\xE0o clipboard. H\xE3y ki\u1EC3m tra quy\u1EC1n c\u1EE7a tr\xECnh duy\u1EC7t.",
    scrapbookExportPreparing: "\u0110ang chu\u1EA9n b\u1ECB ZIP...",
    scrapbookExportChooseItems: "H\xE3y ch\u1ECDn m\u1EE5c c\u1EA7n xu\u1EA5t tr\u01B0\u1EDBc.",
    scrapbookExportReady: "B\u1EA3n xu\u1EA5t ZIP \u0111\xE3 s\u1EB5n s\xE0ng. \u0110ang t\u1EA3i xu\u1ED1ng {count} m\u1EE5c.",
    scrapbookExportFailed: "Kh\xF4ng th\u1EC3 t\u1EA1o b\u1EA3n xu\u1EA5t ZIP.",
    scrapbookTriggerView: "Xem trigger",
    scrapbookImagesHide: "\u1EA8n h\xECnh \u1EA3nh",
    scrapbookImagesShow: "Hi\u1EC7n {count} h\xECnh \u1EA3nh",
    scrapbookOpenOriginal: "M\u1EDF b\xE0i g\u1ED1c",
    scrapbookDownloadMarkdown: "T\u1EA3i Markdown",
    scrapbookDownloadZip: "T\u1EA3i ZIP",
    scrapbookArchiveLoginRequiredCopy: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads \u0111\u1EC3 xem c\xF9ng l\xFAc inbox mention v\xE0 c\xE1c m\u1EE5c cloud save t\u1EEB extension t\u1EA1i \u0111\xE2y.",
    scrapbookArchiveEmptyTitle: "Ch\u01B0a c\xF3 m\u1EE5c n\xE0o \u0111\u01B0\u1EE3c l\u01B0u.",
    scrapbookArchiveEmptyCopy: "Inbox mention, cloud save t\u1EEB extension, auto-archive c\u1EE7a watchlist v\xE0 search archive \u0111\u1EC1u t\u1EADp trung t\u1EA1i \u0111\xE2y.",
    scrapbookVerified: "\u0111\xE3 x\xE1c minh",
    scrapbookLastLogin: "\u0111\u0103ng nh\u1EADp g\u1EA7n nh\u1EA5t {date}",
    scrapbookProfilePictureAlt: "\u1EA3nh h\u1ED3 s\u01A1 c\u1EE7a {name}",
    scrapbookScopeReady: "Quy\u1EC1n \u0111\xE3 s\u1EB5n s\xE0ng \xB7 {scopes}",
    scrapbookScopeReconnect: "H\xE3y \u0111\u0103ng nh\u1EADp l\u1EA1i b\u1EB1ng Threads \u0111\u1EC3 d\xF9ng t\xEDnh n\u0103ng n\xE2ng cao. Quy\u1EC1n c\xF2n thi\u1EBFu: {scopes}",
    scrapbookScopeUpgrade: "n\xE2ng c\u1EA5p scope",
    scrapbookTrackedOpen: "M\u1EDF",
    scrapbookTrackedSaveInbox: "L\u01B0u v\xE0o inbox",
    scrapbookEmptyBody: "(Kh\xF4ng c\xF3 n\u1ED9i dung)",
    scrapbookWatchlistsLoginTitle: "C\u1EA7n \u0111\u0103ng nh\u1EADp.",
    scrapbookWatchlistsLoginCopy: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads \u0111\u1EC3 t\u1EA1o watchlists.",
    scrapbookWatchlistsReconnectTitle: "C\u1EA7n c\u1EA5p l\u1EA1i quy\u1EC1n.",
    scrapbookWatchlistsReconnectCopy: "\u0110\u0103ng nh\u1EADp l\u1EA1i b\u1EB1ng Threads \u0111\u1EC3 d\xF9ng watchlist kh\xE1m ph\xE1 h\u1ED3 s\u01A1.",
    scrapbookWatchlistsResults: "{count} k\u1EBFt qu\u1EA3",
    scrapbookWatchlistsLastSync: "l\u1EA7n \u0111\u1ED3ng b\u1ED9 g\u1EA7n nh\u1EA5t {date}",
    scrapbookWatchlistsSyncNow: "\u0110\u1ED3ng b\u1ED9 ngay",
    scrapbookDelete: "X\xF3a",
    scrapbookArchiveDeleteConfirm: 'X\xF3a "{title}" kh\u1ECFi scrapbook?',
    scrapbookIncludeNone: "kh\xF4ng c\xF3",
    scrapbookExcludeNone: "kh\xF4ng c\xF3",
    scrapbookMediaAll: "t\u1EA5t c\u1EA3",
    scrapbookAutoArchiveOn: "b\u1EADt",
    scrapbookAutoArchiveOff: "t\u1EAFt",
    scrapbookRecentError: "L\u1ED7i g\u1EA7n \u0111\xE2y: {error}",
    scrapbookWatchlistsNoResultsTitle: "Ch\u01B0a c\xF3 k\u1EBFt qu\u1EA3 kh\u1EDBp.",
    scrapbookWatchlistsNoResultsCopy: "H\xE3y ch\u1EA1y \u0111\u1ED3ng b\u1ED9 \u0111\u1EC3 c\xE1c b\xE0i m\u1EDBi ph\xF9 h\u1EE3p xu\u1EA5t hi\u1EC7n t\u1EA1i \u0111\xE2y.",
    scrapbookSearchesLoginTitle: "C\u1EA7n \u0111\u0103ng nh\u1EADp.",
    scrapbookSearchesLoginCopy: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads \u0111\u1EC3 d\xF9ng t\xECm ki\u1EBFm theo t\u1EEB kh\xF3a.",
    scrapbookSearchesReconnectTitle: "C\u1EA7n c\u1EA5p l\u1EA1i quy\u1EC1n.",
    scrapbookSearchesReconnectCopy: "\u0110\u0103ng nh\u1EADp l\u1EA1i b\u1EB1ng Threads \u0111\u1EC3 d\xF9ng t\xECm ki\u1EBFm theo t\u1EEB kh\xF3a.",
    scrapbookSearchResults: "{count} k\u1EBFt qu\u1EA3",
    scrapbookSearchMode: "ch\u1EBF \u0111\u1ED9 {mode}",
    scrapbookSearchLastRun: "l\u1EA7n ch\u1EA1y g\u1EA7n nh\u1EA5t {date}",
    scrapbookSearchAuthorAll: "t\u1EA5t c\u1EA3",
    scrapbookSearchHide: "\u1EA8n",
    scrapbookSearchesNoResultsTitle: "Ch\u01B0a c\xF3 k\u1EBFt qu\u1EA3 t\xECm ki\u1EBFm.",
    scrapbookSearchesNoResultsCopy: "H\xE3y ch\u1EA1y t\xECm ki\u1EBFm \u0111\u1EC3 n\u1EA1p c\xE1c k\u1EBFt qu\u1EA3 m\u1EDBi nh\u1EA5t.",
    scrapbookInsightsRefreshedAt: "C\u1EADp nh\u1EADt l\xFAc {date}",
    scrapbookInsightsNotLoadedYet: "Ch\u01B0a t\u1EA3i.",
    scrapbookInsightsLoginTitle: "C\u1EA7n \u0111\u0103ng nh\u1EADp.",
    scrapbookInsightsLoginCopy: "K\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n Threads \u0111\u1EC3 t\u1EA3i insights.",
    scrapbookInsightsReconnectTitle: "C\u1EA7n c\u1EA5p l\u1EA1i quy\u1EC1n.",
    scrapbookInsightsReconnectCopy: "\u0110\u0103ng nh\u1EADp l\u1EA1i b\u1EB1ng Threads \u0111\u1EC3 d\xF9ng managed insights.",
    scrapbookInsightsViews: "l\u01B0\u1EE3t xem {value}",
    scrapbookInsightsLikes: "l\u01B0\u1EE3t th\xEDch {value}",
    scrapbookInsightsReplies: "ph\u1EA3n h\u1ED3i {value}",
    scrapbookInsightsReposts: "l\u01B0\u1EE3t \u0111\u0103ng l\u1EA1i {value}",
    scrapbookInsightsQuotes: "tr\xEDch d\u1EABn {value}",
    scrapbookStatusConnected: "T\xE0i kho\u1EA3n Threads c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
    scrapbookSessionRouting: "scrapbook n\xE0y \u0111\u01B0\u1EE3c li\xEAn k\u1EBFt v\u1EDBi @{handle}. Khi m\u1ED9t reply c\xF4ng khai mention @{botHandle} v\xE0 t\xE0i kho\u1EA3n vi\u1EBFt reply l\xE0 @{handle}, m\u1EE5c \u0111\xF3 s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u t\u1EA1i \u0111\xE2y.",
    scrapbookLogoutSuccess: "\u0110\xE3 ng\u1EAFt k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n.",
    scrapbookLogoutFail: "Kh\xF4ng th\u1EC3 \u0111\u0103ng xu\u1EA5t.",
    scrapbookStatusLoadFailed: "Kh\xF4ng th\u1EC3 t\u1EA3i tr\u1EA1ng th\xE1i scrapbook.",
    scrapbookStatusWatchlistSaved: "\u0110\xE3 l\u01B0u watchlist.",
    scrapbookStatusWatchlistSynced: "\u0110\xE3 \u0111\u1ED3ng b\u1ED9 watchlist.",
    scrapbookStatusWatchlistDeleted: "\u0110\xE3 x\xF3a watchlist.",
    scrapbookStatusArchiveDeleted: "\u0110\xE3 x\xF3a m\u1EE5c l\u01B0u tr\u1EEF.",
    scrapbookStatusTrackedSaved: "\u0110\xE3 l\u01B0u k\u1EBFt qu\u1EA3 v\xE0o inbox.",
    scrapbookStatusSearchSaved: "\u0110\xE3 l\u01B0u search monitor.",
    scrapbookStatusSearchRun: "\u0110\xE3 ch\u1EA1y t\xECm ki\u1EBFm t\u1EEB kh\xF3a.",
    scrapbookStatusSearchDeleted: "\u0110\xE3 x\xF3a search monitor.",
    scrapbookStatusSearchArchived: "\u0110\xE3 l\u01B0u k\u1EBFt qu\u1EA3 t\xECm ki\u1EBFm v\xE0o inbox.",
    scrapbookStatusSearchDismissed: "\u0110\xE3 \u1EA9n k\u1EBFt qu\u1EA3 t\xECm ki\u1EBFm.",
    scrapbookInsightsRefreshLoading: "\u0110ang t\u1EA3i...",
    scrapbookStatusInsightsRefreshed: "\u0110\xE3 l\u01B0u snapshot insights m\u1EDBi.",
    scrapbookStatusInsightSaved: "\u0110\xE3 l\u01B0u b\xE0i insight v\xE0o inbox."
  }
};

// src/scrapbook/main.ts
var LEGACY_BOT_HANDLE = "parktaejun";
var DEFAULT_BOT_HANDLE = "your-bot";
var latestConfig = null;
var latestState = null;
var latestWorkspace = null;
var activeTab = "inbox";
var activeArchiveId = null;
var selectedArchiveIds = /* @__PURE__ */ new Set();
var expandedMediaArchiveIds = /* @__PURE__ */ new Set();
var connectButtonsBusy = false;
var connectButtonsAvailable = true;
var isExportingArchives = false;
var archiveSearchQuery = "";
var activeFolderId = null;
var FOLDER_STORAGE_KEY = "scrapbook_folders";
var FOLDER_MAP_STORAGE_KEY = "scrapbook_folder_map";
function loadFolders() {
  try {
    const raw = localStorage.getItem(FOLDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveFolders(folders) {
  localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders));
}
function loadFolderMap() {
  try {
    const raw = localStorage.getItem(FOLDER_MAP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveFolderMap(map) {
  localStorage.setItem(FOLDER_MAP_STORAGE_KEY, JSON.stringify(map));
}
function generateFolderId() {
  return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
var currentLocale = getLocale("en");
var msg = scrapbookMessages[currentLocale];
var botHandleEls = document.querySelectorAll("[data-bot-handle]");
var hostEls = document.querySelectorAll("[data-site-host]");
var connectButtons = document.querySelectorAll("[data-bot-connect]");
var mobileOauthNotes = document.querySelectorAll("[data-mobile-oauth-note]");
var brandLink = document.querySelector(".brand-link");
var localeSelect = document.querySelector("#scrapbook-locale-select");
var metaDescription = document.querySelector("#scrapbook-meta-description");
var authPanel = document.querySelector("#auth-panel");
var sessionPanel = document.querySelector("#session-panel");
var pageStatus = document.querySelector("#page-status");
var sessionName = document.querySelector("#session-name");
var sessionMeta = document.querySelector("#session-meta");
var sessionBio = document.querySelector("#session-bio");
var sessionRouting = document.querySelector("#session-routing");
var scopeStatus = document.querySelector("#scope-status");
var sessionProfileLink = document.querySelector("#session-profile-link");
var avatarImage = document.querySelector("#profile-avatar-image");
var avatarFallback = document.querySelector("#profile-avatar-fallback");
var archivesEl = document.querySelector("#archives");
var archivesBoard = document.querySelector("#archives-board");
var archivesEmptyEl = document.querySelector("#archives-empty");
var archivesPaginationEl = document.querySelector("#archives-pagination");
var archivesPerPageSelect = document.querySelector("#archives-per-page-select");
var archivesPagePrev = document.querySelector("#archives-page-prev");
var archivesPageNext = document.querySelector("#archives-page-next");
var archivesPageInfo = document.querySelector("#archives-page-info");
var archivesPage = 1;
var archivesPerPage = 10;
var archivesToolbar = document.querySelector("#archives-toolbar");
var archivesToolbarMeta = document.querySelector("#archives-toolbar-meta");
var archivesSelectAll = document.querySelector("#archives-select-all");
var archivesExportSelected = document.querySelector("#archives-export-selected");
var archivesExportAll = document.querySelector("#archives-export-all");
var archivesMoveSelected = document.querySelector("#archives-move-selected");
var archivesDeleteSelected = document.querySelector("#archives-delete-selected");
var archivesFilterBar = document.querySelector("#archives-filter-bar");
var archivesSearchInput = document.querySelector("#archives-search");
var archivesFolderStrip = document.querySelector("#archives-folder-strip");
var logoutButton = document.querySelector("#logout");
var workspaceTabs = document.querySelector("#workspace-tabs");
var workspaceTabButtons = document.querySelectorAll("[data-tab]");
var workspacePanels = document.querySelectorAll("[data-tab-panel]");
var watchlistForm = document.querySelector("#watchlist-form");
var watchlistsList = document.querySelector("#watchlists-list");
var watchlistsEmpty = document.querySelector("#watchlists-empty");
var searchForm = document.querySelector("#search-form");
var searchesList = document.querySelector("#searches-list");
var searchesEmpty = document.querySelector("#searches-empty");
var insightsRefresh = document.querySelector("#insights-refresh");
var insightsRefreshed = document.querySelector("#insights-refreshed");
var insightsEmpty = document.querySelector("#insights-empty");
var insightsPosts = document.querySelector("#insights-posts");
var metricFollowers = document.querySelector("#metric-followers");
var metricFollowersDelta = document.querySelector("#metric-followers-delta");
var metricProfileViews = document.querySelector("#metric-profile-views");
var metricProfileViewsDelta = document.querySelector("#metric-profile-views-delta");
var metricViews = document.querySelector("#metric-views");
var metricViewsDelta = document.querySelector("#metric-views-delta");
var metricLikes = document.querySelector("#metric-likes");
var metricLikesDelta = document.querySelector("#metric-likes-delta");
var metricReplies = document.querySelector("#metric-replies");
var metricRepliesDelta = document.querySelector("#metric-replies-delta");
var metricReposts = document.querySelector("#metric-reposts");
var metricRepostsDelta = document.querySelector("#metric-reposts-delta");
function formatMessage(template, params) {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
function t(key, params) {
  return formatMessage(msg[key], params);
}
var runtimeLocaleLabels = {
  ko: {
    requestFailed: "\uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4 ({status}).",
    sourceMention: "\uBA58\uC158 inbox",
    sourceCloud: "\uD074\uB77C\uC6B0\uB4DC \uC800\uC7A5",
    searchRunNow: "\uC9C0\uAE08 \uC2E4\uD589",
    searchStatusNew: "\uC2E0\uADDC",
    searchStatusArchived: "\uBCF4\uAD00\uB428",
    searchStatusDismissed: "\uC228\uAE40"
  },
  en: {
    requestFailed: "Request failed ({status}).",
    sourceMention: "Mention inbox",
    sourceCloud: "Cloud save",
    searchRunNow: "Run now",
    searchStatusNew: "New",
    searchStatusArchived: "Archived",
    searchStatusDismissed: "Dismissed"
  },
  ja: {
    requestFailed: "\u30EA\u30AF\u30A8\u30B9\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F ({status})\u3002",
    sourceMention: "\u30E1\u30F3\u30B7\u30E7\u30F3 inbox",
    sourceCloud: "\u30AF\u30E9\u30A6\u30C9\u4FDD\u5B58",
    searchRunNow: "\u4ECA\u3059\u3050\u5B9F\u884C",
    searchStatusNew: "\u65B0\u898F",
    searchStatusArchived: "\u4FDD\u5B58\u6E08\u307F",
    searchStatusDismissed: "\u975E\u8868\u793A"
  },
  "pt-BR": {
    requestFailed: "A solicita\xE7\xE3o falhou ({status}).",
    sourceMention: "Inbox de men\xE7\xF5es",
    sourceCloud: "Salvamento na nuvem",
    searchRunNow: "Executar agora",
    searchStatusNew: "Novo",
    searchStatusArchived: "Arquivado",
    searchStatusDismissed: "Ocultado"
  },
  es: {
    requestFailed: "La solicitud fall\xF3 ({status}).",
    sourceMention: "Inbox de menciones",
    sourceCloud: "Guardado en la nube",
    searchRunNow: "Ejecutar ahora",
    searchStatusNew: "Nuevo",
    searchStatusArchived: "Archivado",
    searchStatusDismissed: "Oculto"
  },
  "zh-TW": {
    requestFailed: "\u8ACB\u6C42\u5931\u6557 ({status})\u3002",
    sourceMention: "\u63D0\u53CA inbox",
    sourceCloud: "\u96F2\u7AEF\u5132\u5B58",
    searchRunNow: "\u7ACB\u5373\u57F7\u884C",
    searchStatusNew: "\u65B0\u589E",
    searchStatusArchived: "\u5DF2\u5C01\u5B58",
    searchStatusDismissed: "\u5DF2\u96B1\u85CF"
  },
  vi: {
    requestFailed: "Y\xEAu c\u1EA7u th\u1EA5t b\u1EA1i ({status}).",
    sourceMention: "Inbox \u0111\u1EC1 c\u1EADp",
    sourceCloud: "L\u01B0u \u0111\xE1m m\xE2y",
    searchRunNow: "Ch\u1EA1y ngay",
    searchStatusNew: "M\u1EDBi",
    searchStatusArchived: "\u0110\xE3 l\u01B0u tr\u1EEF",
    searchStatusDismissed: "\u0110\xE3 \u1EA9n"
  }
};
function runtimeLabel() {
  return runtimeLocaleLabels[currentLocale];
}
function localizeMediaType(mediaType) {
  switch ((mediaType ?? "").toUpperCase()) {
    case "TEXT":
      return t("scrapbookMediaTypeText");
    case "IMAGE":
      return t("scrapbookMediaTypeImage");
    case "VIDEO":
      return t("scrapbookMediaTypeVideo");
    case "CAROUSEL":
      return t("scrapbookMediaTypeCarousel");
    default:
      return mediaType ?? "";
  }
}
function localizeSearchType(searchType) {
  return searchType === "recent" ? t("scrapbookSearchTypeRecent") : t("scrapbookSearchTypeTop");
}
function localizeSearchStatus(status) {
  if (status === "archived") {
    return runtimeLabel().searchStatusArchived;
  }
  if (status === "dismissed") {
    return runtimeLabel().searchStatusDismissed;
  }
  return runtimeLabel().searchStatusNew;
}
function normalizeBotHandle(value) {
  return `${value ?? ""}`.trim().replace(/^@+/, "");
}
function replaceLegacyBotHandle(value, handle = getCurrentBotHandle()) {
  const normalized = normalizeBotHandle(handle) || DEFAULT_BOT_HANDLE;
  return value.replaceAll(`@${LEGACY_BOT_HANDLE}`, `@${normalized}`);
}
function applyBotHandleToCopy(value) {
  if (typeof value === "string") {
    return replaceLegacyBotHandle(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => applyBotHandleToCopy(entry));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, applyBotHandleToCopy(entry)])
    );
  }
  return value;
}
function getCurrentBotHandle() {
  return normalizeBotHandle(latestConfig?.botHandle) || DEFAULT_BOT_HANDLE;
}
function setLocalizedHtml(selector, html) {
  for (const element of document.querySelectorAll(selector)) {
    element.innerHTML = html;
  }
}
function applyStaticTranslations() {
  const botHandle = getCurrentBotHandle();
  const handleInline = `<span data-bot-handle>@${escapeHtml(botHandle)}</span>`;
  const handleStrong = `<strong data-bot-handle>@${escapeHtml(botHandle)}</strong>`;
  const copyLoginLinkStrong = `<strong>${escapeHtml(t("scrapbookCopyLoginLink"))}</strong>`;
  document.documentElement.lang = currentLocale;
  document.title = t("scrapbookDocumentTitle");
  metaDescription?.setAttribute("content", t("scrapbookDocumentDescription"));
  brandLink?.setAttribute("aria-label", t("scrapbookHomeAriaLabel"));
  localeSelect?.setAttribute("aria-label", t("scrapbookLocaleLabel"));
  workspaceTabs?.setAttribute("aria-label", t("scrapbookWorkspaceAriaLabel"));
  applyTranslations(msg);
  setLocalizedHtml(
    "[data-i18n='scrapbookHeroLead']",
    formatMessage(t("scrapbookHeroLead"), { handleStrong })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookMobileOauthNote']",
    formatMessage(t("scrapbookMobileOauthNote"), { copyLoginLinkStrong })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookFlowStep2']",
    formatMessage(t("scrapbookFlowStep2"), { handleInline })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookConnectCopy']",
    formatMessage(t("scrapbookConnectCopy"), { handleInline })
  );
  setLocalizedHtml(
    "[data-i18n='scrapbookHowStep2Desc']",
    formatMessage(t("scrapbookHowStep2Desc"), { handleInline })
  );
}
function syncLocaleSelect() {
  if (!localeSelect) {
    return;
  }
  if (localeSelect.options.length === 0) {
    for (const locale of SUPPORTED_LOCALES) {
      const option = document.createElement("option");
      option.value = locale;
      option.textContent = getLocaleLabel(locale);
      localeSelect.append(option);
    }
  }
  localeSelect.value = currentLocale;
}
function applyLocale(locale) {
  currentLocale = locale;
  msg = applyBotHandleToCopy(scrapbookMessages[currentLocale]);
  setLocale(locale);
  syncLocaleSelect();
  applyStaticTranslations();
  renderConnectButtons();
  if (latestConfig && latestState) {
    applySessionState(latestConfig, latestState);
  }
  if (latestWorkspace) {
    applyWorkspaceState(latestWorkspace);
  }
}
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
async function requestJson(url, init) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || formatMessage(runtimeLabel().requestFailed, { status: response.status }));
  }
  return payload;
}
async function requestBlob(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || formatMessage(runtimeLabel().requestFailed, { status: response.status }));
  }
  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? null
  };
}
function formatDate(iso) {
  if (!iso) {
    return t("scrapbookDateNone");
  }
  try {
    return new Date(iso).toLocaleString(currentLocale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}
function formatCompactNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return t("scrapbookNumberNone");
  }
  return new Intl.NumberFormat(currentLocale, {
    notation: value >= 1e3 ? "compact" : "standard",
    maximumFractionDigits: value >= 1e3 ? 1 : 0
  }).format(value);
}
function formatDelta(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return t("scrapbookNoChange");
  }
  if (value === 0) {
    return t("scrapbookNoChange");
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCompactNumber(value)}`;
}
function setMetricValue(valueEl, deltaEl, metric) {
  if (valueEl) {
    valueEl.textContent = formatCompactNumber(metric.value);
  }
  if (!deltaEl) {
    return;
  }
  deltaEl.textContent = formatDelta(metric.delta);
  deltaEl.classList.toggle("metric-positive", typeof metric.delta === "number" && metric.delta > 0);
  deltaEl.classList.toggle("metric-negative", typeof metric.delta === "number" && metric.delta < 0);
}
function setStatus(message, isError = false) {
  if (!pageStatus) {
    return;
  }
  if (!message.trim()) {
    pageStatus.textContent = "";
    pageStatus.classList.add("hidden");
    pageStatus.classList.remove("is-error");
    return;
  }
  pageStatus.textContent = message;
  pageStatus.classList.remove("hidden");
  pageStatus.classList.toggle("is-error", isError);
}
function setConnectButtonsEnabled(enabled) {
  connectButtonsAvailable = enabled;
  renderConnectButtons();
}
function isLikelyMobileDevice() {
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}
function renderMobileOauthNotice() {
  const show = isLikelyMobileDevice() && connectButtonsAvailable && !(latestState?.authenticated && latestState.user);
  for (const note of mobileOauthNotes) {
    note.classList.toggle("hidden", !show);
  }
}
function renderConnectButtons() {
  const disabled = connectButtonsBusy || !connectButtonsAvailable;
  for (const button of connectButtons) {
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
    button.setAttribute("aria-busy", String(connectButtonsBusy));
    button.textContent = connectButtonsBusy ? t("scrapbookConnectBusy") : t("scrapbookConnectButton");
    button.title = "";
  }
  renderMobileOauthNotice();
}
function setConnectButtonsBusy(isBusy) {
  connectButtonsBusy = isBusy;
  renderConnectButtons();
}
function setConnectButtonsIdle() {
  connectButtonsBusy = false;
  renderConnectButtons();
}
function extractArchiveTitleExcerpt(text, maxChars = 20) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  const firstSentence = normalized.split(/(?<=[.!?。！？])\s+|\n+/u, 1)[0]?.trim() ?? normalized;
  return Array.from(firstSentence).slice(0, maxChars).join("").trim();
}
function buildArchiveTitle(item) {
  const excerpt = extractArchiveTitleExcerpt(item.targetText, 20);
  if (excerpt) {
    return excerpt;
  }
  if (item.targetAuthorHandle) {
    return t("scrapbookArchiveFallbackAuthorPost", { handle: item.targetAuthorHandle });
  }
  return t("scrapbookArchiveFallbackSavedItem");
}
function buildArchiveSource(item) {
  const originLabel = item.origin === "cloud" ? runtimeLabel().sourceCloud : runtimeLabel().sourceMention;
  if (item.targetAuthorHandle) {
    return `${originLabel} \xB7 @${item.targetAuthorHandle}`;
  }
  return originLabel;
}
function buildArchiveTagsLabel(item) {
  return item.tags.map((tag) => `#${tag}`).join(" ");
}
function buildArchiveSelectionTitle(count, total) {
  if (total === 0) {
    return "";
  }
  return count > 0 ? t("scrapbookArchiveSelectionSummary", { count, total }) : t("scrapbookArchiveSelectionTotal", { total });
}
function isLikelyVideoUrl(url) {
  return /\.(mp4|mov|webm)(?:[?#]|$)/i.test(url);
}
function renderMediaPreviewUrls(urls) {
  if (urls.length === 0) {
    return "";
  }
  const previewUrls = urls.filter((url) => !isLikelyVideoUrl(url)).slice(0, 4);
  if (previewUrls.length === 0) {
    return `<div class="archive-media-note">${escapeHtml(t("scrapbookMediaIncluded", { count: urls.length }))}</div>`;
  }
  return `
    <div class="archive-media-grid">
      ${previewUrls.map(
    (url, index) => `
            <a class="archive-media-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(`${t("scrapbookMediaTypeImage")} ${index + 1}`)}">
              <img class="archive-media-thumb" src="${escapeHtml(url)}" alt="" loading="lazy" />
            </a>
          `
  ).join("")}
    </div>
  `;
}
function countArchiveMedia(item) {
  return item.mediaUrls.length + item.authorReplies.reduce((count, reply) => count + reply.mediaUrls.length, 0);
}
function renderReplyBlocks(item, showMedia) {
  if (item.authorReplies.length === 0) {
    return "";
  }
  return `
    <section class="archive-replies">
      <div class="archive-replies-head">
        <h4>${escapeHtml(t("scrapbookReplyHeader", { count: item.authorReplies.length }))}</h4>
      </div>
      <div class="archive-replies-list">
        ${item.authorReplies.map(
    (reply, index) => `
              <article class="archive-reply-card">
                <div class="archive-reply-meta">
                  <span class="archive-chip">${escapeHtml(t("scrapbookReplyLabel", { index: index + 1 }))}</span>
                  <span class="archive-chip">@${escapeHtml(reply.author)}</span>
                  ${reply.publishedAt ? `<span class="archive-chip">${escapeHtml(formatDate(reply.publishedAt))}</span>` : ""}
                </div>
                <p class="archive-reply-body">${escapeHtml(reply.text)}</p>
                <div class="archive-reply-actions">
                  <a class="topbar-link archive-action-link" href="${escapeHtml(reply.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookReplyOpenOriginal"))}</a>
                </div>
                ${showMedia && reply.mediaUrls.length > 0 ? renderMediaPreviewUrls(reply.mediaUrls) : ""}
              </article>
            `
  ).join("")}
      </div>
    </section>
  `;
}
async function copyArchiveMarkdown(item, button) {
  try {
    await navigator.clipboard.writeText(item.markdownContent);
    const previousLabel = button.textContent;
    button.textContent = t("scrapbookCopied");
    window.setTimeout(() => {
      button.textContent = previousLabel ?? t("scrapbookCopyMarkdown");
    }, 1200);
  } catch {
    setStatus(t("scrapbookClipboardError"), true);
  }
}
function syncSelectedArchiveIds(items) {
  const validIds = new Set(items.map((item) => item.id));
  for (const archiveId of [...selectedArchiveIds]) {
    if (!validIds.has(archiveId)) {
      selectedArchiveIds.delete(archiveId);
    }
  }
}
function updateArchivesToolbar(items, isAuthenticated) {
  if (!archivesToolbar || !archivesToolbarMeta || !archivesSelectAll || !archivesExportSelected || !archivesExportAll) {
    return;
  }
  const hasItems = isAuthenticated && items.length > 0;
  archivesToolbar.classList.toggle("hidden", !hasItems);
  if (!hasItems) {
    archivesSelectAll.checked = false;
    archivesSelectAll.indeterminate = false;
    archivesExportSelected.disabled = true;
    archivesExportAll.disabled = true;
    if (archivesMoveSelected) archivesMoveSelected.disabled = true;
    if (archivesDeleteSelected) archivesDeleteSelected.disabled = true;
    archivesToolbarMeta.textContent = "";
    return;
  }
  const selectedCount = items.filter((item) => selectedArchiveIds.has(item.id)).length;
  archivesToolbarMeta.textContent = buildArchiveSelectionTitle(selectedCount, items.length);
  archivesSelectAll.checked = selectedCount > 0 && selectedCount === items.length;
  archivesSelectAll.indeterminate = selectedCount > 0 && selectedCount < items.length;
  archivesExportSelected.disabled = isExportingArchives || selectedCount === 0;
  archivesExportAll.disabled = isExportingArchives || items.length === 0;
  archivesExportSelected.textContent = isExportingArchives ? t("scrapbookExportPreparing") : t("scrapbookExportSelected");
  archivesExportAll.textContent = isExportingArchives ? t("scrapbookExportPreparing") : t("scrapbookExportAll");
  if (archivesMoveSelected) archivesMoveSelected.disabled = selectedCount === 0;
  if (archivesDeleteSelected) archivesDeleteSelected.disabled = selectedCount === 0;
}
function filterArchives(items) {
  let filtered = items;
  if (activeFolderId) {
    const folderMap = loadFolderMap();
    filtered = filtered.filter((item) => folderMap[item.id] === activeFolderId);
  }
  if (archiveSearchQuery.trim()) {
    const query = archiveSearchQuery.trim().toLowerCase();
    const activeBotHandle = (latestConfig?.botHandle || latestState?.botHandle || "").toLowerCase();
    filtered = filtered.filter((item) => {
      const searchable = [
        item.targetText,
        item.targetAuthorHandle ?? "",
        item.targetAuthorDisplayName ?? "",
        item.noteText ?? "",
        item.targetUrl,
        ...item.tags,
        item.mentionUrl ?? "",
        item.mentionAuthorHandle ?? "",
        item.mentionAuthorDisplayName ?? "",
        ...item.authorReplies.map((r) => r.text),
        activeBotHandle
      ].join(" ").toLowerCase();
      return searchable.includes(query);
    });
  }
  return filtered;
}
function renderFolderStrip(allItems) {
  if (!archivesFolderStrip) return;
  const folders = loadFolders();
  const folderMap = loadFolderMap();
  const folderCounts = {};
  let unfolderedCount = 0;
  for (const item of allItems) {
    const fid = folderMap[item.id];
    if (fid) {
      folderCounts[fid] = (folderCounts[fid] || 0) + 1;
    } else {
      unfolderedCount++;
    }
  }
  const allLabel = currentLocale === "ko" ? "\uC804\uCCB4" : currentLocale === "ja" ? "\u3059\u3079\u3066" : "All";
  const newFolderLabel = currentLocale === "ko" ? "+ \uC0C8 \uD3F4\uB354" : currentLocale === "ja" ? "+ \u65B0\u898F" : "+ New";
  let html = `<button class="folder-pill ${activeFolderId === null ? "is-active" : ""}" type="button" data-folder-id="">
    ${escapeHtml(allLabel)}
    <span class="folder-pill-count">${allItems.length}</span>
  </button>`;
  for (const folder of folders) {
    const count = folderCounts[folder.id] || 0;
    const isActive = activeFolderId === folder.id;
    html += `<button class="folder-pill ${isActive ? "is-active" : ""}" type="button" data-folder-id="${escapeHtml(folder.id)}">
      ${escapeHtml(folder.name)}
      <span class="folder-pill-count">${count}</span>
    </button>`;
  }
  html += `<button class="folder-pill folder-pill-new" type="button" data-folder-new="1">${escapeHtml(newFolderLabel)}</button>`;
  archivesFolderStrip.innerHTML = html;
  for (const button of archivesFolderStrip.querySelectorAll("[data-folder-id]")) {
    button.addEventListener("click", () => {
      const fid = button.dataset.folderId || null;
      activeFolderId = fid || null;
      if (latestState) {
        renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
      }
    });
    button.addEventListener("contextmenu", (event) => {
      const fid = button.dataset.folderId;
      if (!fid) return;
      event.preventDefault();
      showFolderContextMenu(fid, event);
    });
  }
  const newFolderButton = archivesFolderStrip.querySelector("[data-folder-new]");
  newFolderButton?.addEventListener("click", () => void createFolderPrompt());
}
function createFolderPrompt() {
  const labelPrompt = currentLocale === "ko" ? "\uD3F4\uB354 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694:" : "Enter folder name:";
  const name = window.prompt(labelPrompt);
  if (!name?.trim()) return;
  const folders = loadFolders();
  const newFolder = {
    id: generateFolderId(),
    name: name.trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  folders.push(newFolder);
  saveFolders(folders);
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
  const label = currentLocale === "ko" ? `\uD3F4\uB354 "${newFolder.name}" \uC0DD\uC131\uB428` : `Folder "${newFolder.name}" created`;
  setStatus(label);
}
function showFolderContextMenu(folderId, event) {
  const existing = document.querySelector(".folder-context-menu");
  existing?.remove();
  const folders = loadFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return;
  const renameLabel = currentLocale === "ko" ? "\uC774\uB984 \uBCC0\uACBD" : "Rename";
  const deleteLabel = currentLocale === "ko" ? "\uD3F4\uB354 \uC0AD\uC81C" : "Delete folder";
  const menu = document.createElement("div");
  menu.className = "folder-context-menu";
  menu.style.position = "fixed";
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  menu.innerHTML = `
    <button class="folder-context-item" data-action="rename">${escapeHtml(renameLabel)}</button>
    <button class="folder-context-item folder-context-item-danger" data-action="delete">${escapeHtml(deleteLabel)}</button>
  `;
  document.body.appendChild(menu);
  const dismiss = () => menu.remove();
  window.setTimeout(() => document.addEventListener("click", dismiss, { once: true }), 0);
  menu.querySelector("[data-action='rename']")?.addEventListener("click", () => {
    dismiss();
    const prompt = currentLocale === "ko" ? `\uC0C8 \uC774\uB984 \uC785\uB825 (\uD604\uC7AC: ${folder.name}):` : `New name (current: ${folder.name}):`;
    const newName = window.prompt(prompt, folder.name);
    if (!newName?.trim()) return;
    folder.name = newName.trim();
    saveFolders(folders);
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  });
  menu.querySelector("[data-action='delete']")?.addEventListener("click", () => {
    dismiss();
    const confirmMsg = currentLocale === "ko" ? `\uD3F4\uB354 "${folder.name}"\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? (\uC548\uC758 \uC544\uC774\uD15C\uC740 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4)` : `Delete folder "${folder.name}"? (Items inside will not be deleted)`;
    if (!window.confirm(confirmMsg)) return;
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    saveFolders(updatedFolders);
    const folderMap = loadFolderMap();
    for (const key of Object.keys(folderMap)) {
      if (folderMap[key] === folderId) {
        delete folderMap[key];
      }
    }
    saveFolderMap(folderMap);
    if (activeFolderId === folderId) {
      activeFolderId = null;
    }
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  });
}
function showMoveToFolderMenu() {
  const existing = document.querySelector(".folder-move-menu");
  existing?.remove();
  const folders = loadFolders();
  const removeLabel = currentLocale === "ko" ? "\uD3F4\uB354\uC5D0\uC11C \uC81C\uAC70" : "Remove from folder";
  const newLabel = currentLocale === "ko" ? "+ \uC0C8 \uD3F4\uB354\uC5D0 \uC774\uB3D9" : "+ Move to new folder";
  const menu = document.createElement("div");
  menu.className = "folder-move-menu";
  let html = `<div class="folder-move-menu-title">${escapeHtml(currentLocale === "ko" ? "\uD3F4\uB354 \uC120\uD0DD" : "Choose folder")}</div>`;
  for (const folder of folders) {
    html += `<button class="folder-move-item" type="button" data-move-folder="${escapeHtml(folder.id)}">${escapeHtml(folder.name)}</button>`;
  }
  html += `<button class="folder-move-item" type="button" data-move-folder="">${escapeHtml(removeLabel)}</button>`;
  html += `<button class="folder-move-item folder-move-item-new" type="button" data-move-new="1">${escapeHtml(newLabel)}</button>`;
  menu.innerHTML = html;
  const btn = archivesMoveSelected;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 4}px`;
  }
  document.body.appendChild(menu);
  const dismiss = () => menu.remove();
  window.setTimeout(() => document.addEventListener("click", dismiss, { once: true }), 0);
  for (const item of menu.querySelectorAll("[data-move-folder]")) {
    item.addEventListener("click", () => {
      dismiss();
      const targetFolderId = item.dataset.moveFolder || "";
      const folderMap = loadFolderMap();
      for (const archiveId of selectedArchiveIds) {
        if (targetFolderId) {
          folderMap[archiveId] = targetFolderId;
        } else {
          delete folderMap[archiveId];
        }
      }
      saveFolderMap(folderMap);
      selectedArchiveIds.clear();
      if (latestState) {
        renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
      }
      const label = currentLocale === "ko" ? "\uC774\uB3D9 \uC644\uB8CC" : "Moved";
      setStatus(label);
    });
  }
  menu.querySelector("[data-move-new]")?.addEventListener("click", () => {
    dismiss();
    const labelPrompt = currentLocale === "ko" ? "\uC0C8 \uD3F4\uB354 \uC774\uB984:" : "New folder name:";
    const name = window.prompt(labelPrompt);
    if (!name?.trim()) return;
    const folders2 = loadFolders();
    const newFolder = {
      id: generateFolderId(),
      name: name.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    folders2.push(newFolder);
    saveFolders(folders2);
    const folderMap = loadFolderMap();
    for (const archiveId of selectedArchiveIds) {
      folderMap[archiveId] = newFolder.id;
    }
    saveFolderMap(folderMap);
    selectedArchiveIds.clear();
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
    const label = currentLocale === "ko" ? `"${newFolder.name}" \uD3F4\uB354\uB85C \uC774\uB3D9\uB428` : `Moved to "${newFolder.name}"`;
    setStatus(label);
  });
}
async function bulkDeleteSelectedArchives() {
  const count = selectedArchiveIds.size;
  if (count === 0) return;
  const confirmMsg = currentLocale === "ko" ? `\uC120\uD0DD\uD55C ${count}\uAC1C \uD56D\uBAA9\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?` : `Delete ${count} selected items?`;
  if (!window.confirm(confirmMsg)) return;
  const ids = [...selectedArchiveIds];
  for (const id of ids) {
    try {
      await requestJson(`/api/public/bot/archive/${encodeURIComponent(id)}`, { method: "DELETE" });
      selectedArchiveIds.delete(id);
      expandedMediaArchiveIds.delete(id);
      if (activeArchiveId === id) {
        activeArchiveId = null;
      }
    } catch {
    }
  }
  const folderMap = loadFolderMap();
  for (const id of ids) {
    delete folderMap[id];
  }
  saveFolderMap(folderMap);
  await refreshEverything();
  const label = currentLocale === "ko" ? `${ids.length}\uAC1C \uC0AD\uC81C\uB428` : `${ids.length} deleted`;
  setStatus(label);
}
function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1e3);
}
async function exportArchivesZip(archiveIds) {
  if (archiveIds.length === 0) {
    setStatus(t("scrapbookExportChooseItems"), true);
    return;
  }
  isExportingArchives = true;
  if (latestState) {
    updateArchivesToolbar(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
  try {
    const { blob, filename } = await requestBlob("/api/public/bot/archives.zip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: archiveIds })
    });
    downloadBlob(blob, filename || "threads-scrapbook.zip");
    setStatus(t("scrapbookExportReady", { count: archiveIds.length }));
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookExportFailed"), true);
  } finally {
    isExportingArchives = false;
    if (latestState) {
      updateArchivesToolbar(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }
}
function renderArchiveDetailHtml(item) {
  const tagsLabel = buildArchiveTagsLabel(item);
  const totalMediaCount = countArchiveMedia(item);
  const hasMedia = totalMediaCount > 0;
  const showMedia = expandedMediaArchiveIds.has(item.id);
  const triggerLink = item.mentionUrl ? `<a class="topbar-link archive-action-link" href="${escapeHtml(item.mentionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTriggerView"))}</a>` : "";
  return `
    <div class="archive-detail-inline">
      <div class="archive-detail-head">
        <div>
          <h3>${escapeHtml(buildArchiveTitle(item))}</h3>
          <div class="archive-detail-meta">
            <span class="archive-chip">${escapeHtml(formatDate(item.archivedAt))}</span>
            ${buildArchiveSource(item) ? `<span class="archive-chip">${escapeHtml(buildArchiveSource(item))}</span>` : ""}
            ${tagsLabel ? `<span class="archive-chip">${escapeHtml(tagsLabel)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="archive-detail-body">${escapeHtml(item.targetText)}</div>
      ${hasMedia ? `<button class="secondary-cta archive-media-toggle" type="button" data-media-toggle="${item.id}">${escapeHtml(
    showMedia ? t("scrapbookImagesHide") : t("scrapbookImagesShow", { count: totalMediaCount })
  )}</button>` : ""}
      ${hasMedia && showMedia && item.mediaUrls.length > 0 ? renderMediaPreviewUrls(item.mediaUrls) : ""}
      ${renderReplyBlocks(item, showMedia)}
      <div class="archive-actions">
        <a class="secondary-cta archive-action-link" href="${escapeHtml(item.targetUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookOpenOriginal"))}</a>
        ${triggerLink}
        <button class="topbar-link archive-copy" type="button" data-copy="${item.id}">${escapeHtml(t("scrapbookCopyMarkdown"))}</button>
        <a class="topbar-link archive-action-link" href="/api/public/bot/archive/${encodeURIComponent(item.id)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>
        <a class="topbar-link archive-action-link" href="/api/public/bot/archive/${encodeURIComponent(item.id)}.zip">${escapeHtml(t("scrapbookDownloadZip"))}</a>
        <button class="topbar-link archive-action-link" type="button" data-archive-delete="${item.id}">${escapeHtml(t("scrapbookDelete"))}</button>
      </div>
    </div>
  `;
}
function renderArchives(items, isAuthenticated) {
  if (!archivesEl || !archivesEmptyEl || !archivesBoard) {
    return;
  }
  if (!isAuthenticated || items.length === 0) {
    archivesEl.innerHTML = "";
    archivesBoard.classList.add("hidden");
    archivesEmptyEl.classList.remove("hidden");
    archivesEmptyEl.innerHTML = !isAuthenticated ? `<strong>${escapeHtml(t("scrapbookArchiveLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookArchiveLoginRequiredCopy"))}</span>` : `<strong>${escapeHtml(t("scrapbookArchiveEmptyTitle"))}</strong><span>${escapeHtml(t("scrapbookArchiveEmptyCopy"))}</span>`;
    activeArchiveId = null;
    archivesPaginationEl?.classList.add("hidden");
    updateArchivesToolbar([], isAuthenticated);
    archivesFilterBar?.classList.toggle("hidden", true);
    return;
  }
  archivesFilterBar?.classList.remove("hidden");
  const ordered = [...items].sort((left, right) => {
    const archivedDelta = Date.parse(right.archivedAt) - Date.parse(left.archivedAt);
    if (archivedDelta !== 0) {
      return archivedDelta;
    }
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  });
  renderFolderStrip(ordered);
  const filtered = filterArchives(ordered);
  syncSelectedArchiveIds(filtered);
  if (!filtered.some((item) => item.id === activeArchiveId)) {
    activeArchiveId = null;
  }
  archivesEmptyEl.classList.add("hidden");
  archivesBoard.classList.remove("hidden");
  if (filtered.length === 0) {
    archivesEl.innerHTML = `<tr><td colspan="5" class="archive-no-results">${escapeHtml(t("scrapbookNoResults"))}</td></tr>`;
    archivesPaginationEl?.classList.add("hidden");
    updateArchivesToolbar(filtered, isAuthenticated);
    return;
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / archivesPerPage));
  if (archivesPage > totalPages) archivesPage = totalPages;
  if (archivesPaginationEl) archivesPaginationEl.classList.remove("hidden");
  if (archivesPageInfo) archivesPageInfo.textContent = `${archivesPage} / ${totalPages}`;
  if (archivesPagePrev) archivesPagePrev.disabled = archivesPage <= 1;
  if (archivesPageNext) archivesPageNext.disabled = archivesPage >= totalPages;
  const startIndex = (archivesPage - 1) * archivesPerPage;
  const paginated = filtered.slice(startIndex, startIndex + archivesPerPage);
  let html = "";
  for (const item of paginated) {
    const isSelected = selectedArchiveIds.has(item.id);
    const isActive = activeArchiveId === item.id;
    const source = buildArchiveSource(item);
    const tagsLabel = buildArchiveTagsLabel(item);
    html += `
        <tr class="${isActive ? "is-active" : ""}" data-open="${item.id}">
          <td class="archive-table-select">
            <label class="archive-row-checkbox">
              <input type="checkbox" data-select="${item.id}" ${isSelected ? "checked" : ""} />
            </label>
          </td>
          <td>
            <button class="archive-row-title" type="button" data-open="${item.id}">${escapeHtml(buildArchiveTitle(item))}</button>
          </td>
          <td class="archive-row-date">${escapeHtml(formatDate(item.archivedAt))}</td>
          <td class="archive-row-source">${escapeHtml(source)}</td>
          <td class="archive-row-tags">${escapeHtml(tagsLabel)}</td>
        </tr>
      `;
    if (isActive) {
      html += `<tr class="archive-row-detail"><td colspan="5">${renderArchiveDetailHtml(item)}</td></tr>`;
    }
  }
  archivesEl.innerHTML = html;
  for (const input of archivesEl.querySelectorAll("[data-select]")) {
    input.addEventListener("change", () => {
      const archiveId = input.dataset.select;
      if (!archiveId) {
        return;
      }
      if (input.checked) {
        selectedArchiveIds.add(archiveId);
      } else {
        selectedArchiveIds.delete(archiveId);
      }
      updateArchivesToolbar(filtered, isAuthenticated);
    });
  }
  for (const trigger of archivesEl.querySelectorAll("[data-open]")) {
    trigger.addEventListener("click", (event) => {
      const archiveId = trigger.dataset.open;
      if (!archiveId) {
        return;
      }
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      if (activeArchiveId === archiveId) {
        activeArchiveId = null;
      } else {
        activeArchiveId = archiveId;
      }
      renderArchives(items, isAuthenticated);
    });
  }
  const detailItem = paginated.find((item) => item.id === activeArchiveId);
  if (detailItem) {
    const copyButton = archivesEl.querySelector("[data-copy]");
    if (copyButton) {
      copyButton.addEventListener("click", () => void copyArchiveMarkdown(detailItem, copyButton));
    }
    const mediaToggle = archivesEl.querySelector("[data-media-toggle]");
    if (mediaToggle) {
      mediaToggle.addEventListener("click", () => {
        if (expandedMediaArchiveIds.has(detailItem.id)) {
          expandedMediaArchiveIds.delete(detailItem.id);
        } else {
          expandedMediaArchiveIds.add(detailItem.id);
        }
        renderArchives(items, isAuthenticated);
      });
    }
    const archiveDeleteButton = archivesEl.querySelector("[data-archive-delete]");
    if (archiveDeleteButton) {
      archiveDeleteButton.addEventListener("click", () => void deleteArchiveRequest(detailItem.id));
    }
  }
  updateArchivesToolbar(filtered, isAuthenticated);
}
function renderUser(user) {
  if (!user) {
    if (sessionName) sessionName.textContent = "";
    if (sessionMeta) sessionMeta.textContent = "";
    if (sessionBio) {
      sessionBio.textContent = "";
      sessionBio.classList.add("hidden");
    }
    if (sessionRouting) {
      sessionRouting.textContent = "";
      sessionRouting.classList.add("hidden");
    }
    if (scopeStatus) {
      scopeStatus.textContent = "";
      scopeStatus.classList.add("hidden");
    }
    if (sessionProfileLink) {
      sessionProfileLink.href = "#";
    }
    if (avatarImage) {
      avatarImage.src = "";
      avatarImage.classList.add("hidden");
    }
    if (avatarFallback) {
      avatarFallback.textContent = "T";
    }
    return;
  }
  const displayName = user.displayName?.trim() || `@${user.threadsHandle}`;
  if (sessionName) {
    sessionName.textContent = displayName;
  }
  if (sessionMeta) {
    const parts = [`@${user.threadsHandle}`];
    if (user.isVerified) {
      parts.push(t("scrapbookVerified"));
    }
    parts.push(t("scrapbookLastLogin", { date: formatDate(user.lastLoginAt) }));
    sessionMeta.textContent = parts.join(" \xB7 ");
  }
  if (sessionBio) {
    const bio = user.biography?.trim() || "";
    sessionBio.textContent = bio;
    sessionBio.classList.toggle("hidden", bio.length === 0);
  }
  if (sessionProfileLink) {
    sessionProfileLink.href = `https://www.threads.com/@${encodeURIComponent(user.threadsHandle)}`;
  }
  if (avatarFallback) {
    avatarFallback.textContent = displayName.charAt(0).toUpperCase() || "T";
  }
  if (avatarImage) {
    if (user.profilePictureUrl) {
      avatarImage.src = user.profilePictureUrl;
      avatarImage.alt = t("scrapbookProfilePictureAlt", { name: displayName });
      avatarImage.classList.remove("hidden");
    } else {
      avatarImage.src = "";
      avatarImage.classList.add("hidden");
    }
  }
}
function renderScopeStatus(state) {
  if (!scopeStatus) {
    return;
  }
  if (!state || !state.authenticated) {
    scopeStatus.textContent = "";
    scopeStatus.classList.add("hidden");
    return;
  }
  if (!state.scopes.needsReconnect) {
    scopeStatus.textContent = t("scrapbookScopeReady", {
      scopes: state.scopes.grantedScopes.join(", ")
    });
    scopeStatus.classList.remove("hidden");
    return;
  }
  const missing = state.scopes.missingScopes.join(", ");
  scopeStatus.textContent = t("scrapbookScopeReconnect", {
    scopes: missing || t("scrapbookScopeUpgrade")
  });
  scopeStatus.classList.remove("hidden");
}
function setActiveTab(tab) {
  activeTab = tab;
  for (const button of workspaceTabButtons) {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  }
  for (const panel of workspacePanels) {
    panel.classList.toggle("hidden", panel.dataset.tabPanel !== tab);
  }
}
function renderTrackedPostCard(item, archiveEndpoint) {
  return `
    <article class="feature-item">
      <div class="feature-item-head">
        <div>
          <strong>@${escapeHtml(item.authorHandle)}</strong>
          <div class="feature-item-meta">
            <span class="archive-chip">${escapeHtml(formatDate(item.publishedAt || item.discoveredAt))}</span>
            ${item.mediaType ? `<span class="archive-chip">${escapeHtml(localizeMediaType(item.mediaType))}</span>` : ""}
            ${item.matchedTerms.length > 0 ? `<span class="archive-chip">${escapeHtml(item.matchedTerms.join(", "))}</span>` : ""}
          </div>
        </div>
        <div class="feature-inline-actions">
          <a class="secondary-cta" href="${escapeHtml(item.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTrackedOpen"))}</a>
          ${item.archived ? `<a class="topbar-link" href="/api/public/bot/archive/${encodeURIComponent(item.archiveId || "")}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>` : `<button class="topbar-link" type="button" data-track-archive="${escapeHtml(item.id)}" data-track-endpoint="${escapeHtml(archiveEndpoint)}">${escapeHtml(t("scrapbookTrackedSaveInbox"))}</button>`}
        </div>
      </div>
      <p class="feature-item-body">${escapeHtml(item.text || t("scrapbookEmptyBody"))}</p>
    </article>
  `;
}
function renderWatchlists(workspace) {
  if (!watchlistsList || !watchlistsEmpty) {
    return;
  }
  if (!workspace || !workspace.authenticated) {
    watchlistsList.innerHTML = "";
    watchlistsList.classList.add("hidden");
    watchlistsEmpty.classList.remove("hidden");
    watchlistsEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookWatchlistsLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookWatchlistsLoginCopy"))}</span>`;
    return;
  }
  if (workspace.scopes.needsReconnect) {
    watchlistsList.innerHTML = "";
    watchlistsList.classList.add("hidden");
    watchlistsEmpty.classList.remove("hidden");
    watchlistsEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookWatchlistsReconnectTitle"))}</strong><span>${escapeHtml(t("scrapbookWatchlistsReconnectCopy"))}</span>`;
    return;
  }
  if (workspace.watchlists.length === 0) {
    watchlistsList.innerHTML = "";
    watchlistsList.classList.add("hidden");
    watchlistsEmpty.classList.remove("hidden");
    return;
  }
  watchlistsEmpty.classList.add("hidden");
  watchlistsList.classList.remove("hidden");
  watchlistsList.innerHTML = workspace.watchlists.map(
    (watchlist) => `
        <article class="feature-card">
          <div class="feature-card-head">
            <div>
              <strong>@${escapeHtml(watchlist.targetHandle)}</strong>
                <div class="feature-card-meta">
                  ${watchlist.targetDisplayName ? `<span class="archive-chip">${escapeHtml(watchlist.targetDisplayName)}</span>` : ""}
                <span class="archive-chip">${escapeHtml(t("scrapbookWatchlistsResults", { count: watchlist.resultCount }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookWatchlistsLastSync", { date: formatDate(watchlist.lastSyncedAt) }))}</span>
              </div>
            </div>
            <div class="feature-actions">
              <button class="secondary-cta" type="button" data-watchlist-sync="${watchlist.id}">${escapeHtml(t("scrapbookWatchlistsSyncNow"))}</button>
              <button class="topbar-link" type="button" data-watchlist-delete="${watchlist.id}">${escapeHtml(t("scrapbookDelete"))}</button>
            </div>
          </div>
          <p class="feature-card-copy">
            ${escapeHtml(t("scrapbookFilterIncludeLabel"))}: ${escapeHtml(watchlist.includeText || t("scrapbookIncludeNone"))} \xB7 ${escapeHtml(t("scrapbookFilterExcludeLabel"))}: ${escapeHtml(watchlist.excludeText || t("scrapbookExcludeNone"))} \xB7 ${escapeHtml(t("scrapbookFilterMediaLabel"))}: ${escapeHtml(watchlist.mediaTypes.map((mediaType) => localizeMediaType(mediaType)).join(", ") || t("scrapbookMediaAll"))} \xB7 ${escapeHtml(t("scrapbookFilterAutoArchiveLabel"))}: ${escapeHtml(watchlist.autoArchive ? t("scrapbookAutoArchiveOn") : t("scrapbookAutoArchiveOff"))}
          </p>
          ${watchlist.lastError ? `<p class="feature-card-copy">${escapeHtml(t("scrapbookRecentError", { error: watchlist.lastError }))}</p>` : ""}
          <div class="feature-result-list">
            ${watchlist.results.length > 0 ? watchlist.results.map((item) => renderTrackedPostCard(item, "tracked")).join("") : `<div class="empty-state"><strong>${escapeHtml(t("scrapbookWatchlistsNoResultsTitle"))}</strong><span>${escapeHtml(t("scrapbookWatchlistsNoResultsCopy"))}</span></div>`}
          </div>
        </article>
      `
  ).join("");
  for (const button of watchlistsList.querySelectorAll("[data-watchlist-sync]")) {
    button.addEventListener("click", () => void syncWatchlistRequest(button.dataset.watchlistSync || ""));
  }
  for (const button of watchlistsList.querySelectorAll("[data-watchlist-delete]")) {
    button.addEventListener("click", () => void deleteWatchlistRequest(button.dataset.watchlistDelete || ""));
  }
  for (const button of watchlistsList.querySelectorAll("[data-track-archive]")) {
    button.addEventListener("click", () => void archiveTrackedPostRequest(button.dataset.trackArchive || ""));
  }
}
function renderSearches(workspace) {
  if (!searchesList || !searchesEmpty) {
    return;
  }
  if (!workspace || !workspace.authenticated) {
    searchesList.innerHTML = "";
    searchesList.classList.add("hidden");
    searchesEmpty.classList.remove("hidden");
    searchesEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookSearchesLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookSearchesLoginCopy"))}</span>`;
    return;
  }
  if (workspace.scopes.needsReconnect) {
    searchesList.innerHTML = "";
    searchesList.classList.add("hidden");
    searchesEmpty.classList.remove("hidden");
    searchesEmpty.innerHTML = `<strong>${escapeHtml(t("scrapbookSearchesReconnectTitle"))}</strong><span>${escapeHtml(t("scrapbookSearchesReconnectCopy"))}</span>`;
    return;
  }
  if (workspace.searches.length === 0) {
    searchesList.innerHTML = "";
    searchesList.classList.add("hidden");
    searchesEmpty.classList.remove("hidden");
    return;
  }
  searchesEmpty.classList.add("hidden");
  searchesList.classList.remove("hidden");
  searchesList.innerHTML = workspace.searches.map(
    (search) => `
        <article class="feature-card">
          <div class="feature-card-head">
            <div>
              <strong>${escapeHtml(search.query)}</strong>
              <div class="feature-card-meta">
                <span class="archive-chip">${escapeHtml(t("scrapbookSearchResults", { count: search.resultCount }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookSearchMode", { mode: localizeSearchType(search.searchType) }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookSearchLastRun", { date: formatDate(search.lastRunAt) }))}</span>
              </div>
            </div>
            <div class="feature-actions">
              <button class="secondary-cta" type="button" data-search-run="${search.id}">${escapeHtml(runtimeLabel().searchRunNow)}</button>
              <button class="topbar-link" type="button" data-search-delete="${search.id}">${escapeHtml(t("scrapbookDelete"))}</button>
            </div>
          </div>
          <p class="feature-card-copy">
            ${escapeHtml(t("scrapbookFilterAuthorLabel"))}: ${escapeHtml(search.authorHandle ? `@${search.authorHandle}` : t("scrapbookSearchAuthorAll"))} \xB7 ${escapeHtml(t("scrapbookFilterExcludeLabel"))}: ${escapeHtml(search.excludeHandles.join(", ") || t("scrapbookExcludeNone"))} \xB7 ${escapeHtml(t("scrapbookFilterAutoArchiveLabel"))}: ${escapeHtml(search.autoArchive ? t("scrapbookAutoArchiveOn") : t("scrapbookAutoArchiveOff"))}
          </p>
          ${search.lastError ? `<p class="feature-card-copy">${escapeHtml(t("scrapbookRecentError", { error: search.lastError }))}</p>` : ""}
          <div class="feature-result-list">
            ${search.results.length > 0 ? search.results.map(
      (result) => `
                        <article class="feature-item">
                          <div class="feature-item-head">
                            <div>
                              <strong>@${escapeHtml(result.authorHandle)}</strong>
                              <div class="feature-item-meta">
                                <span class="archive-chip">${escapeHtml(localizeSearchStatus(result.status))}</span>
                                <span class="archive-chip">${escapeHtml(formatDate(result.publishedAt || result.discoveredAt))}</span>
                                ${result.matchedTerms.length > 0 ? `<span class="archive-chip">${escapeHtml(result.matchedTerms.join(", "))}</span>` : ""}
                              </div>
                            </div>
                            <div class="feature-inline-actions">
                              <a class="secondary-cta" href="${escapeHtml(result.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTrackedOpen"))}</a>
                              ${result.status === "archived" && result.archiveId ? `<a class="topbar-link" href="/api/public/bot/archive/${encodeURIComponent(result.archiveId)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>` : `<button class="topbar-link" type="button" data-search-archive="${result.id}">${escapeHtml(t("scrapbookTrackedSaveInbox"))}</button>`}
                              ${result.status === "dismissed" ? "" : `<button class="topbar-link" type="button" data-search-dismiss="${result.id}">${escapeHtml(t("scrapbookSearchHide"))}</button>`}
                            </div>
                          </div>
                          <p class="feature-item-body">${escapeHtml(result.text || t("scrapbookEmptyBody"))}</p>
                        </article>
                      `
    ).join("") : `<div class="empty-state"><strong>${escapeHtml(t("scrapbookSearchesNoResultsTitle"))}</strong><span>${escapeHtml(t("scrapbookSearchesNoResultsCopy"))}</span></div>`}
          </div>
        </article>
      `
  ).join("");
  for (const button of searchesList.querySelectorAll("[data-search-run]")) {
    button.addEventListener("click", () => void runSearchRequest(button.dataset.searchRun || ""));
  }
  for (const button of searchesList.querySelectorAll("[data-search-delete]")) {
    button.addEventListener("click", () => void deleteSearchRequest(button.dataset.searchDelete || ""));
  }
  for (const button of searchesList.querySelectorAll("[data-search-archive]")) {
    button.addEventListener("click", () => void archiveSearchResultRequest(button.dataset.searchArchive || ""));
  }
  for (const button of searchesList.querySelectorAll("[data-search-dismiss]")) {
    button.addEventListener("click", () => void dismissSearchResultRequest(button.dataset.searchDismiss || ""));
  }
}
function renderInsights(workspace) {
  if (insightsRefreshed) {
    insightsRefreshed.textContent = workspace?.insights.refreshedAt ? t("scrapbookInsightsRefreshedAt", { date: formatDate(workspace.insights.refreshedAt) }) : t("scrapbookInsightsNotLoadedYet");
  }
  if (!workspace || !workspace.authenticated || workspace.scopes.needsReconnect) {
    setMetricValue(metricFollowers, metricFollowersDelta, { value: null, delta: null });
    setMetricValue(metricProfileViews, metricProfileViewsDelta, { value: null, delta: null });
    setMetricValue(metricViews, metricViewsDelta, { value: null, delta: null });
    setMetricValue(metricLikes, metricLikesDelta, { value: null, delta: null });
    setMetricValue(metricReplies, metricRepliesDelta, { value: null, delta: null });
    setMetricValue(metricReposts, metricRepostsDelta, { value: null, delta: null });
    if (insightsPosts) {
      insightsPosts.innerHTML = "";
      insightsPosts.classList.add("hidden");
    }
    if (insightsEmpty) {
      insightsEmpty.classList.remove("hidden");
      insightsEmpty.innerHTML = !workspace || !workspace.authenticated ? `<strong>${escapeHtml(t("scrapbookInsightsLoginTitle"))}</strong><span>${escapeHtml(t("scrapbookInsightsLoginCopy"))}</span>` : `<strong>${escapeHtml(t("scrapbookInsightsReconnectTitle"))}</strong><span>${escapeHtml(t("scrapbookInsightsReconnectCopy"))}</span>`;
    }
    return;
  }
  setMetricValue(metricFollowers, metricFollowersDelta, workspace.insights.overview.followers);
  setMetricValue(metricProfileViews, metricProfileViewsDelta, workspace.insights.overview.profileViews);
  setMetricValue(metricViews, metricViewsDelta, workspace.insights.overview.views);
  setMetricValue(metricLikes, metricLikesDelta, workspace.insights.overview.likes);
  setMetricValue(metricReplies, metricRepliesDelta, workspace.insights.overview.replies);
  setMetricValue(metricReposts, metricRepostsDelta, workspace.insights.overview.reposts);
  if (!insightsPosts || !insightsEmpty) {
    return;
  }
  if (workspace.insights.posts.length === 0) {
    insightsPosts.innerHTML = "";
    insightsPosts.classList.add("hidden");
    insightsEmpty.classList.remove("hidden");
    return;
  }
  insightsEmpty.classList.add("hidden");
  insightsPosts.classList.remove("hidden");
  insightsPosts.innerHTML = workspace.insights.posts.map(
    (post) => `
        <article class="feature-card">
          <div class="feature-card-head">
            <div>
              <strong>${escapeHtml(post.title)}</strong>
              <div class="feature-card-meta">
                <span class="archive-chip">${escapeHtml(formatDate(post.publishedAt || post.capturedAt))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookInsightsViews", { value: formatCompactNumber(post.metrics.views.value) }))}</span>
                <span class="archive-chip">${escapeHtml(t("scrapbookInsightsLikes", { value: formatCompactNumber(post.metrics.likes.value) }))}</span>
              </div>
            </div>
            <div class="feature-actions">
              <a class="secondary-cta" href="${escapeHtml(post.canonicalUrl)}" target="_blank" rel="noreferrer">${escapeHtml(t("scrapbookTrackedOpen"))}</a>
              ${post.archived && post.archiveId ? `<a class="topbar-link" href="/api/public/bot/archive/${encodeURIComponent(post.archiveId)}.md">${escapeHtml(t("scrapbookDownloadMarkdown"))}</a>` : `<button class="topbar-link" type="button" data-insight-archive="${escapeHtml(post.externalPostId)}">${escapeHtml(t("scrapbookTrackedSaveInbox"))}</button>`}
            </div>
          </div>
          <p class="feature-card-copy">${escapeHtml(post.text || t("scrapbookEmptyBody"))}</p>
          <div class="feature-card-meta">
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsViews", { value: formatDelta(post.metrics.views.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsLikes", { value: formatDelta(post.metrics.likes.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsReplies", { value: formatDelta(post.metrics.replies.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsReposts", { value: formatDelta(post.metrics.reposts.delta) }))}</span>
            <span class="archive-chip">${escapeHtml(t("scrapbookInsightsQuotes", { value: formatDelta(post.metrics.quotes.delta) }))}</span>
          </div>
        </article>
      `
  ).join("");
  for (const button of insightsPosts.querySelectorAll("[data-insight-archive]")) {
    button.addEventListener("click", () => void archiveInsightPostRequest(button.dataset.insightArchive || ""));
  }
}
function applySessionState(config, state) {
  latestConfig = config;
  latestState = state;
  applyStaticTranslations();
  for (const element of document.querySelectorAll("[data-bot-handle]")) {
    element.textContent = `@${normalizeBotHandle(config.botHandle) || DEFAULT_BOT_HANDLE}`;
  }
  for (const element of document.querySelectorAll("[data-site-host]")) {
    element.textContent = window.location.host;
  }
  const isAuthenticated = state.authenticated && Boolean(state.user);
  authPanel?.classList.toggle("hidden", isAuthenticated);
  sessionPanel?.classList.toggle("hidden", !isAuthenticated);
  workspaceTabs?.classList.toggle("hidden", !isAuthenticated);
  if (!config.oauthConfigured && !isAuthenticated) {
    setStatus(t("scrapbookConnectServerNotReady"), true);
    setConnectButtonsEnabled(false);
  } else {
    setConnectButtonsEnabled(true);
  }
  renderUser(isAuthenticated ? state.user : null);
  if (sessionRouting) {
    if (isAuthenticated && state.user) {
      sessionRouting.textContent = t("scrapbookSessionRouting", {
        handle: state.user.threadsHandle,
        botHandle: config.botHandle
      });
      sessionRouting.classList.remove("hidden");
    } else {
      sessionRouting.textContent = "";
      sessionRouting.classList.add("hidden");
    }
  }
  renderArchives(state.archives, isAuthenticated);
}
function applyWorkspaceState(workspace) {
  latestWorkspace = workspace;
  renderScopeStatus(workspace);
  renderWatchlists(workspace);
  renderSearches(workspace);
  renderInsights(workspace);
}
function applyQueryStatus() {
  const currentUrl = new URL(window.location.href);
  const connected = currentUrl.searchParams.get("connected");
  const authError = currentUrl.searchParams.get("authError");
  const archiveId = currentUrl.searchParams.get("archive");
  if (connected === "1") {
    setStatus(t("scrapbookStatusConnected"));
  } else if (authError) {
    setStatus(authError, true);
  }
  if (archiveId) {
    activeArchiveId = archiveId;
  }
  if (connected === "1" || authError || archiveId) {
    currentUrl.searchParams.delete("connected");
    currentUrl.searchParams.delete("authError");
    currentUrl.searchParams.delete("archive");
    history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }
}
async function refreshSession() {
  const [config, state] = await Promise.all([
    requestJson("/api/public/bot/config"),
    requestJson("/api/public/bot/session")
  ]);
  latestConfig = config;
  applySessionState(config, {
    ...state,
    botHandle: config.botHandle,
    oauthConfigured: config.oauthConfigured
  });
}
async function refreshWorkspace() {
  const workspace = await requestJson("/api/public/bot/plus");
  applyWorkspaceState(workspace);
}
async function refreshEverything() {
  await Promise.all([refreshSession(), refreshWorkspace()]);
}
async function syncLatestMentions() {
  if (!latestConfig) {
    return;
  }
  const state = await requestJson("/api/public/bot/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applySessionState(latestConfig, {
    ...state,
    botHandle: latestConfig.botHandle,
    oauthConfigured: latestConfig.oauthConfigured
  });
}
async function startOauth() {
  setConnectButtonsBusy(true);
  window.location.assign(isLikelyMobileDevice() ? "/api/public/bot/oauth/bridge" : "/api/public/bot/oauth/start?redirect=1");
}
async function submitWatchlist(event) {
  event.preventDefault();
  if (!watchlistForm) {
    return;
  }
  const formData = new FormData(watchlistForm);
  const mediaTypes = Array.from(watchlistForm.querySelectorAll("select[name='mediaTypes'] option")).filter((option) => option.selected).map((option) => option.value);
  const workspace = await requestJson("/api/public/bot/watchlists", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      targetHandle: formData.get("targetHandle")?.toString() ?? "",
      includeText: formData.get("includeText")?.toString() ?? "",
      excludeText: formData.get("excludeText")?.toString() ?? "",
      mediaTypes,
      autoArchive: formData.get("autoArchive") === "on"
    })
  });
  watchlistForm.reset();
  for (const option of watchlistForm.querySelectorAll("select[name='mediaTypes'] option")) {
    option.selected = false;
  }
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusWatchlistSaved"));
  setActiveTab("watchlists");
}
async function syncWatchlistRequest(watchlistId) {
  const workspace = await requestJson(`/api/public/bot/watchlists/${encodeURIComponent(watchlistId)}/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusWatchlistSynced"));
}
async function deleteWatchlistRequest(watchlistId) {
  const workspace = await requestJson(`/api/public/bot/watchlists/${encodeURIComponent(watchlistId)}`, {
    method: "DELETE"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusWatchlistDeleted"));
}
async function deleteArchiveRequest(archiveId) {
  const normalizedId = archiveId.trim();
  if (!normalizedId) {
    return;
  }
  const archive = latestState?.archives.find((candidate) => candidate.id === normalizedId) ?? null;
  const archiveTitle = archive ? buildArchiveTitle(archive) : t("scrapbookArchiveFallbackSavedItem");
  const confirmed = window.confirm(t("scrapbookArchiveDeleteConfirm", { title: archiveTitle }));
  if (!confirmed) {
    return;
  }
  await requestJson(`/api/public/bot/archive/${encodeURIComponent(normalizedId)}`, {
    method: "DELETE"
  });
  selectedArchiveIds.delete(normalizedId);
  expandedMediaArchiveIds.delete(normalizedId);
  if (activeArchiveId === normalizedId) {
    activeArchiveId = null;
  }
  await refreshEverything();
  setStatus(t("scrapbookStatusArchiveDeleted"));
}
async function archiveTrackedPostRequest(trackedPostId) {
  const workspace = await requestJson(`/api/public/bot/tracked-posts/${encodeURIComponent(trackedPostId)}/archive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusTrackedSaved"));
}
async function submitSearch(event) {
  event.preventDefault();
  if (!searchForm) {
    return;
  }
  const formData = new FormData(searchForm);
  const workspace = await requestJson("/api/public/bot/searches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: formData.get("query")?.toString() ?? "",
      authorHandle: formData.get("authorHandle")?.toString() ?? "",
      excludeHandles: formData.get("excludeHandles")?.toString() ?? "",
      searchType: formData.get("searchType")?.toString() ?? "top",
      autoArchive: formData.get("autoArchive") === "on"
    })
  });
  searchForm.reset();
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusSearchSaved"));
  setActiveTab("searches");
}
async function runSearchRequest(searchId) {
  const workspace = await requestJson(`/api/public/bot/searches/${encodeURIComponent(searchId)}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusSearchRun"));
}
async function deleteSearchRequest(searchId) {
  const workspace = await requestJson(`/api/public/bot/searches/${encodeURIComponent(searchId)}`, {
    method: "DELETE"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusSearchDeleted"));
}
async function archiveSearchResultRequest(resultId) {
  const workspace = await requestJson(`/api/public/bot/search-results/${encodeURIComponent(resultId)}/archive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusSearchArchived"));
}
async function dismissSearchResultRequest(resultId) {
  const workspace = await requestJson(`/api/public/bot/search-results/${encodeURIComponent(resultId)}/dismiss`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  applyWorkspaceState(workspace);
  setStatus(t("scrapbookStatusSearchDismissed"));
}
async function refreshInsightsRequest() {
  if (insightsRefresh) {
    insightsRefresh.disabled = true;
    insightsRefresh.textContent = t("scrapbookInsightsRefreshLoading");
  }
  try {
    const workspace = await requestJson("/api/public/bot/insights/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    applyWorkspaceState(workspace);
    setStatus(t("scrapbookStatusInsightsRefreshed"));
  } finally {
    if (insightsRefresh) {
      insightsRefresh.disabled = false;
      insightsRefresh.textContent = t("scrapbookInsightsRefresh");
    }
  }
}
async function archiveInsightPostRequest(postId) {
  const workspace = await requestJson("/api/public/bot/insights/archive", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ postId })
  });
  applyWorkspaceState(workspace);
  await refreshSession();
  setStatus(t("scrapbookStatusInsightSaved"));
}
for (const button of connectButtons) {
  button.addEventListener("click", () => void startOauth());
}
logoutButton?.addEventListener("click", async () => {
  try {
    await requestJson("/api/public/bot/logout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    setStatus(t("scrapbookLogoutSuccess"));
    selectedArchiveIds.clear();
    expandedMediaArchiveIds.clear();
    activeArchiveId = null;
    await refreshEverything();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookLogoutFail"), true);
  }
});
for (const button of workspaceTabButtons) {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    if (tab) {
      setActiveTab(tab);
    }
  });
}
watchlistForm?.addEventListener("submit", (event) => {
  void submitWatchlist(event);
});
searchForm?.addEventListener("submit", (event) => {
  void submitSearch(event);
});
insightsRefresh?.addEventListener("click", () => {
  void refreshInsightsRequest();
});
archivesSelectAll?.addEventListener("change", () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  const filtered = filterArchives(latestState.archives);
  if (archivesSelectAll.checked) {
    for (const item of filtered) {
      selectedArchiveIds.add(item.id);
    }
  } else {
    selectedArchiveIds.clear();
  }
  renderArchives(latestState.archives, true);
});
archivesExportSelected?.addEventListener("click", async () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  await exportArchivesZip(latestState.archives.filter((item) => selectedArchiveIds.has(item.id)).map((item) => item.id));
});
archivesExportAll?.addEventListener("click", async () => {
  if (!latestState?.authenticated || !latestState.user) {
    return;
  }
  await exportArchivesZip(latestState.archives.map((item) => item.id));
});
archivesMoveSelected?.addEventListener("click", () => {
  showMoveToFolderMenu();
});
archivesDeleteSelected?.addEventListener("click", () => {
  void bulkDeleteSelectedArchives();
});
var searchDebounceTimer = null;
archivesSearchInput?.addEventListener("input", () => {
  archiveSearchQuery = archivesSearchInput.value;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }, 200);
});
syncLocaleSelect();
applyLocale(currentLocale);
localeSelect?.addEventListener("change", () => {
  const selected = localeSelect.value;
  if (selected in scrapbookMessages) {
    applyLocale(selected);
  }
});
applyQueryStatus();
setActiveTab("inbox");
void (async () => {
  try {
    await refreshEverything();
    const sessionState = latestState;
    if (sessionState && sessionState.authenticated && sessionState.user) {
      await syncLatestMentions();
      await refreshWorkspace();
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : t("scrapbookStatusLoadFailed"), true);
  } finally {
    setConnectButtonsIdle();
    renderConnectButtons();
  }
})();
archivesPerPageSelect?.addEventListener("change", () => {
  archivesPerPage = parseInt(archivesPerPageSelect.value, 10);
  archivesPage = 1;
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
});
archivesPagePrev?.addEventListener("click", () => {
  if (archivesPage > 1) {
    archivesPage--;
    if (latestState) {
      renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
    }
  }
});
archivesPageNext?.addEventListener("click", () => {
  archivesPage++;
  if (latestState) {
    renderArchives(latestState.archives, latestState.authenticated && Boolean(latestState.user));
  }
});
