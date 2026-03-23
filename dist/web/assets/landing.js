// src/web/lib/web-i18n.ts
var LS_KEY = "web-locale";
function getLocale(fallback = "ko") {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "ko" || v === "en") return v;
  } catch {
  }
  return fallback;
}
function setLocale(locale) {
  try {
    localStorage.setItem(LS_KEY, locale);
  } catch {
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
function applyLangToggle(locale) {
  for (const btn of document.querySelectorAll("[data-web-locale]")) {
    btn.classList.toggle("web-lang-btn-active", btn.dataset.webLocale === locale);
  }
}
function bindLangToggle(onSwitch) {
  for (const btn of document.querySelectorAll("[data-web-locale]")) {
    btn.addEventListener("click", () => {
      const next = btn.dataset.webLocale;
      if (next !== "ko" && next !== "en") return;
      setLocale(next);
      onSwitch(next);
    });
  }
}
var landingMessages = {
  ko: {
    topbarCta: "\uC124\uCE58 \uC548\uB0B4",
    siteLabel: "\uC548\uB0B4 \uC8FC\uC18C",
    heroGuideCta: "\uC124\uCE58 \uC548\uB0B4",
    heroPurchaseCta: "Pro \uAD6C\uB9E4",
    heroRailLabel1: "Free",
    heroRailText1: "\uD604\uC7AC \uAE00 \uC800\uC7A5, \uC774\uBBF8\uC9C0 \uD3EC\uD568, \uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00\uAE4C\uC9C0 \uBC14\uB85C \uC800\uC7A5",
    heroRailLabel2: "Pro",
    heroRailText2: "\uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uACFC \uB0B4 LLM \uD0A4 \uAE30\uBC18 \uC694\uC57D\xB7\uD0DC\uADF8\uB97C \uC801\uC6A9",
    priceNote: "1\uD68C \uACB0\uC81C",
    priceSummary: "Free\uB85C \uCDA9\uBD84\uD558\uBA74 \uADF8\uB300\uB85C \uC4F0\uACE0, \uADDC\uCE59 \uAE30\uBC18 \uC815\uB9AC\uC640 AI \uD6C4\uCC98\uB9AC\uAC00 \uD544\uC694\uD560 \uB54C\uB9CC Pro\uB97C \uBD99\uC774\uBA74 \uB429\uB2C8\uB2E4.",
    pricePointFreeDesc: "\uD575\uC2EC \uC800\uC7A5 \uD750\uB984\uC740 \uC9C0\uAE08 \uBC14\uB85C \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4.",
    pricePointProDesc: "\uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uACFC \uB0B4 LLM \uD0A4 \uAE30\uBC18 \uC694\uC57D\xB7\uD0DC\uADF8\xB7frontmatter\uB97C \uD65C\uC131\uD654\uD569\uB2C8\uB2E4.",
    primaryCta: "Pro \uAD6C\uB9E4 \uC694\uCCAD",
    secondaryCta: "\uC2E4\uC81C \uD654\uBA74 \uBCF4\uAE30",
    flowStep1: "\uBA3C\uC800 Free\uB85C \uC800\uC7A5 \uD750\uB984\uC744 \uD655\uC778",
    flowStep2: "\uADDC\uCE59 \uAE30\uBC18 \uC815\uB9AC\uC640 AI \uC815\uB9AC\uAC00 \uD544\uC694\uD558\uBA74 Pro \uC694\uCCAD",
    flowStep3: "\uC774\uBA54\uC77C\uB85C Pro \uD0A4 \uC804\uB2EC",
    storyEyebrow: "Quick Start",
    storyH2: "\uC124\uCE58\uBD80\uD130 \uCCAB \uC800\uC7A5\uAE4C\uC9C0 3\uB2E8\uACC4\uBA74 \uB05D\uB0A9\uB2C8\uB2E4.",
    storyP: "\uC555\uCD95\uD574\uC81C \uB85C\uB4DC, Vault \uC5F0\uACB0, \uC800\uC7A5\uAE4C\uC9C0 \uC5EC\uAE30\uC11C \uBC14\uB85C \uD655\uC778\uD558\uBA74 \uB429\uB2C8\uB2E4. \uC5EC\uAE30\uAE4C\uC9C0\uB294 Free\uB85C \uBC14\uB85C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
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
    step1Title: "\uBA3C\uC800 Free\uB85C \uC800\uC7A5\uD574\uBD05\uB2C8\uB2E4",
    step1Desc: "\uD604\uC7AC \uAE00 \uC800\uC7A5, \uC774\uBBF8\uC9C0 \uC800\uC7A5, \uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00 \uC800\uC7A5\uC774 Free\uC5D0\uC11C \uBC14\uB85C \uB3D9\uC791\uD569\uB2C8\uB2E4.",
    step2Title: "\uC815\uB9AC \uAE30\uC900\uC774 \uC0DD\uAE30\uBA74 Pro\uB85C \uC62C\uB9BD\uB2C8\uB2E4",
    step2Desc: "\uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uC774\uB098 AI \uC694\uC57D\xB7\uD0DC\uADF8\xB7frontmatter\uAC00 \uD544\uC694\uD574\uC9C8 \uB54C Pro\uAC00 \uB9DE\uC2B5\uB2C8\uB2E4.",
    step3Title: "Pro \uD0A4\uB97C \uBD99\uC5EC \uC790\uB3D9\uD654\uB97C \uCF2D\uB2C8\uB2E4",
    step3Desc: "\uACB0\uC81C \uD6C4 \uBC1B\uC740 Pro \uD0A4\uB97C \uC635\uC158 \uD398\uC774\uC9C0\uC5D0 \uB123\uC73C\uBA74 \uADDC\uCE59 \uC124\uC815\uACFC AI \uC815\uB9AC \uC124\uC815\uC774 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4.",
    commerceH2: "Pro \uAD6C\uB9E4 \uC694\uCCAD",
    commerceLead: "\uACB0\uC81C\uC218\uB2E8\uC744 \uC120\uD0DD\uD558\uACE0 \uC774\uBA54\uC77C\uC744 \uB0A8\uAE30\uBA74 Pro \uD0A4\uB97C \uBCF4\uB0C5\uB2C8\uB2E4.",
    commerceNote: "\uC8FC\uBB38 \uC694\uCCAD \uD6C4 \uACB0\uC81C\uB97C \uD655\uC778\uD558\uB294 \uBC29\uC2DD\uC73C\uB85C \uC6B4\uC601\uD569\uB2C8\uB2E4.",
    formNameLabel: "\uC774\uB984",
    formEmailLabel: "\uC774\uBA54\uC77C",
    formMethodLabel: "\uACB0\uC81C\uC218\uB2E8",
    formNoteLabel: "\uBA54\uBAA8",
    formSubmitBtn: "\uAD6C\uB9E4 \uC694\uCCAD \uBCF4\uB0B4\uAE30",
    formRemark: "\uACB0\uC81C \uD655\uC778 \uD6C4 Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0C5\uB2C8\uB2E4.",
    faqH2: "\uAD6C\uB9E4 \uC804\uC5D0 \uAC00\uC7A5 \uB9CE\uC774 \uBB3B\uB294 \uC9C8\uBB38",
    phName: "\uD64D\uAE38\uB3D9",
    phNote: "\uC138\uAE08\uACC4\uC0B0\uC11C, \uD1B5\uD654, \uBC88\uB4E4 \uC694\uCCAD \uB4F1\uC774 \uC788\uC73C\uBA74 \uC801\uC5B4\uC8FC\uC138\uC694",
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
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    orderSuccess1: "{email}\uB85C \uC694\uCCAD\uC774 \uC811\uC218\uB410\uC2B5\uB2C8\uB2E4.",
    orderNextStep: "\uB2E4\uC74C \uB2E8\uACC4: {instructions}",
    orderPayLink: "\uACB0\uC81C \uB9C1\uD06C: {url}",
    orderFinal: "\uACB0\uC81C \uD655\uC778 \uD6C4 Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4.",
    footerPurchaseLink: ""
  },
  en: {
    topbarCta: "Install guide",
    siteLabel: "Guide URL",
    heroGuideCta: "Install guide",
    heroPurchaseCta: "Buy Pro",
    heroRailLabel1: "Free",
    heroRailText1: "Save the current post, include images, and capture author reply chains right away",
    heroRailLabel2: "Pro",
    heroRailText2: "Apply file/path rules plus summaries and tags with your own LLM key",
    priceNote: "one-time",
    priceSummary: "Stay on Free if that is enough. Add Pro only when you need rule-based organization and AI post-processing.",
    pricePointFreeDesc: "The core save flow is ready to use now.",
    pricePointProDesc: "Unlock file/path rules plus summaries, tags, and frontmatter using your own LLM key.",
    primaryCta: "Request Pro",
    secondaryCta: "See real screens",
    flowStep1: "Try the Free save flow first",
    flowStep2: "Request Pro when rules and AI organization matter",
    flowStep3: "Pro key delivered by email",
    storyEyebrow: "Quick Start",
    storyH2: "From setup to first save in three steps.",
    storyP: "Load the extension, connect your vault, and save. Everything up to that point is ready in Free.",
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
    step1Title: "Start by saving with Free",
    step1Desc: "Free already handles current-post saves, images, and author reply chains.",
    step2Title: "Upgrade when organization rules matter",
    step2Desc: "Pro becomes useful when you want file/path rules plus AI summaries, tags, and frontmatter.",
    step3Title: "Paste your Pro key to enable automation",
    step3Desc: "After payment confirmation, paste the Pro key into the options page to unlock rule-based and AI settings.",
    commerceH2: "Request Pro",
    commerceLead: "Choose a payment method and leave your email. The Pro key is sent after payment confirmation.",
    commerceNote: "Orders are reviewed first, then payment is confirmed.",
    formNameLabel: "Name",
    formEmailLabel: "Email",
    formMethodLabel: "Payment method",
    formNoteLabel: "Note",
    formSubmitBtn: "Send purchase request",
    formRemark: "Your Pro key is emailed after payment confirmation.",
    faqH2: "Most common questions before buying",
    phName: "John Doe",
    phNote: "Invoice, currency, bundle requests, etc.",
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
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "English",
    orderSuccess1: "Your request has been received at {email}.",
    orderNextStep: "Next step: {instructions}",
    orderPayLink: "Payment link: {url}",
    orderFinal: "Your Pro key will be emailed after payment confirmation.",
    footerPurchaseLink: ""
  }
};
var landingStorefrontCopy = {
  ko: {
    productName: "Threads to Obsidian",
    headline: "Threads\uB97C Obsidian\uC5D0 \uC800\uC7A5.",
    subheadline: "Free\uB294 \uC800\uC7A5. Pro\uB294 \uADDC\uCE59 + \uB0B4 LLM \uD0A4\uB85C \uC694\uC57D, \uD0DC\uADF8, frontmatter.",
    priceLabel: "Pro \uC5C5\uADF8\uB808\uC774\uB4DC",
    includedUpdates: "1\uD68C \uACB0\uC81C \xB7 7\uC77C \uD658\uBD88 \xB7 \uC5C5\uB370\uC774\uD2B8 1\uB144",
    heroNotes: [
      "Free: \uD604\uC7AC \uAE00 \uC800\uC7A5 \xB7 \uC774\uBBF8\uC9C0 \uD3EC\uD568 \xB7 \uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
      "Pro: \uD30C\uC77C\uBA85 \uD328\uD134 \xB7 \uC800\uC7A5 \uACBD\uB85C \xB7 AI \uC694\uC57D \xB7 AI \uD0DC\uADF8",
      "Chrome \uD655\uC7A5\uC73C\uB85C \uBC14\uB85C \uC2DC\uC791 \xB7 \uD544\uC694\uD560 \uB54C\uB9CC Pro"
    ],
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
    productName: "Threads to Obsidian",
    headline: "Save Threads to Obsidian.",
    subheadline: "Free saves. Pro adds rules plus summary, tags, and frontmatter with your own LLM key.",
    priceLabel: "Pro upgrade",
    includedUpdates: "One-time payment \xB7 7-day refund \xB7 1 year of updates",
    heroNotes: [
      "Free: save the current post, include images, keep author reply chains",
      "Pro: file/path rules, AI summaries, AI tags",
      "Start as a Chrome extension now, upgrade only when needed"
    ],
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

// src/web/landing/main.ts
var paymentMethodsEl = document.querySelector("#payment-methods");
var purchaseForm = document.querySelector("#purchase-form");
var paymentSelect = document.querySelector("select[name='paymentMethodId']");
var purchaseStatus = document.querySelector("#purchase-status");
var heroNotes = document.querySelector("#hero-notes");
var faqList = document.querySelector("#faq-list");
var headline = document.querySelector("#headline");
var subheadline = document.querySelector("#subheadline");
var priceLabel = document.querySelector("#price-label");
var priceValue = document.querySelector("#price-value");
var includedUpdates = document.querySelector("#included-updates");
var brandName = document.querySelector("#brand-name");
var storefront = null;
var msg = landingMessages.ko;
var currentLocale = "ko";
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function renderHeroNotes(notes) {
  if (!heroNotes) {
    return;
  }
  heroNotes.innerHTML = notes.map((note) => `<span class="value-pill">${escapeHtml(note)}</span>`).join("");
}
function renderFaqs(faqs) {
  if (!faqList) {
    return;
  }
  faqList.innerHTML = faqs.map(
    (faq) => `
        <div>
          <dt>${escapeHtml(faq.question)}</dt>
          <dd>${escapeHtml(faq.answer)}</dd>
        </div>
      `
  ).join("");
}
function renderPaymentMethods(methods) {
  if (!paymentMethodsEl || !paymentSelect) {
    return;
  }
  paymentMethodsEl.innerHTML = methods.map(
    (method) => `
        <article class="method-card">
          <div class="method-card-meta">
            <strong>${escapeHtml(method.name)}</strong>
            <span class="method-badge">${escapeHtml(msg.methodBadge)}</span>
          </div>
          <p>${escapeHtml(method.summary)}</p>
          ${method.actionUrl ? `
            <a
              class="method-link"
              href="${escapeHtml(method.actionUrl)}"
              target="_blank"
              rel="noreferrer"
            >${escapeHtml(method.actionLabel || "Open payment page")}</a>
          ` : ""}
        </article>
      `
  ).join("");
  paymentSelect.innerHTML = `<option value="">${escapeHtml(msg.phMethod)}</option>`;
  for (const method of methods) {
    const option = document.createElement("option");
    option.value = method.id;
    option.textContent = method.name;
    paymentSelect.appendChild(option);
  }
}
function setStatus(message, isError = false) {
  if (!purchaseStatus) {
    return;
  }
  purchaseStatus.textContent = message;
  purchaseStatus.classList.remove("hidden");
  purchaseStatus.classList.toggle("is-error", isError);
}
async function loadStorefront() {
  const response = await fetch("/api/public/storefront");
  if (!response.ok) {
    throw new Error("Could not load storefront data.");
  }
  storefront = await response.json();
  renderLocalizedStorefront(currentLocale);
}
function renderLocalizedStorefront(locale) {
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
async function submitPurchaseRequest(event) {
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
  const result = await response.json();
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
function applyLocale(locale) {
  currentLocale = locale;
  msg = landingMessages[locale];
  document.documentElement.lang = locale;
  applyTranslations(msg);
  applyLangToggle(locale);
  renderLocalizedStorefront(locale);
}
void (async () => {
  currentLocale = getLocale("ko");
  msg = landingMessages[currentLocale];
  applyTranslations(msg);
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
