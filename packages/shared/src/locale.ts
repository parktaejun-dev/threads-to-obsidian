export const SUPPORTED_LOCALES = ["ko", "en", "ja", "pt-BR", "es", "zh-TW", "vi"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const NON_DEFAULT_LOCALES = ["ja", "pt-BR", "es", "zh-TW", "vi"] as const satisfies ReadonlyArray<
  Exclude<SupportedLocale, "ko" | "en">
>;

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  "pt-BR": "Português (Brasil)",
  es: "Español",
  "zh-TW": "繁體中文",
  vi: "Tiếng Việt"
};

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && SUPPORTED_LOCALE_SET.has(value);
}

export function parseSupportedLocale(value: unknown): SupportedLocale | null {
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

export function normalizeLocale(value: unknown, fallback: SupportedLocale = "en"): SupportedLocale {
  return parseSupportedLocale(value) ?? fallback;
}

export function detectLocaleFromNavigator(language: string | null | undefined, fallback: SupportedLocale = "en"): SupportedLocale {
  return normalizeLocale(language, fallback);
}

export function getLocaleLabel(locale: SupportedLocale): string {
  return LOCALE_LABELS[locale];
}
