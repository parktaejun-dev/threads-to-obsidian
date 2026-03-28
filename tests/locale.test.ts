import assert from "node:assert/strict";
import test from "node:test";

import {
  detectLocaleFromNavigator,
  getLocaleLabel,
  normalizeLocale,
  parseSupportedLocale,
  SUPPORTED_LOCALES
} from "@threads/shared/locale";

test("locale parser normalizes supported browser and app language values", () => {
  assert.equal(parseSupportedLocale("en-US"), "en");
  assert.equal(parseSupportedLocale("ja-JP"), "ja");
  assert.equal(parseSupportedLocale("pt"), "pt-BR");
  assert.equal(parseSupportedLocale("pt-BR"), "pt-BR");
  assert.equal(parseSupportedLocale("es-419"), "es");
  assert.equal(parseSupportedLocale("zh-Hant-TW"), "zh-TW");
  assert.equal(parseSupportedLocale("vi-VN"), "vi");
  assert.equal(parseSupportedLocale("fr-FR"), null);
});

test("locale normalization falls back safely for unsupported values", () => {
  assert.equal(normalizeLocale("fr-FR", "en"), "en");
  assert.equal(normalizeLocale(undefined, "ko"), "ko");
  assert.equal(detectLocaleFromNavigator("zh-HK", "en"), "zh-TW");
});

test("locale labels exist for every supported locale", () => {
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok(getLocaleLabel(locale).length > 0);
  }
});
