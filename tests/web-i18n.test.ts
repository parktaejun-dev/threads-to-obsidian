import assert from "node:assert/strict";
import test from "node:test";

import { landingMessages } from "../packages/web-client/src/lib/web-i18n";

const secondaryLocales = ["ja", "pt-BR", "es", "zh-TW", "vi"] as const;
const variants = ["obsidian", "bot"] as const;

test("secondary landing messages do not expose legacy plan copy", () => {
  const bannedPatterns = [
    /\bPro\b/,
    /\$ ?29/,
    /29ドル/,
    /29 美元/,
    /29 một lần/,
    /Raise scrapbook limits/,
    /Searches stay on Free/,
    /Plus higher limits/,
    /yearly default/
  ];

  for (const locale of secondaryLocales) {
    for (const variant of variants) {
      const serialized = JSON.stringify(landingMessages[locale][variant]);

      for (const pattern of bannedPatterns) {
        assert.equal(
          pattern.test(serialized),
          false,
          `${locale}/${variant} still contains legacy copy matching ${pattern}`
        );
      }
    }
  }
});

test("secondary landing messages keep the reviewed manual translation fixes", () => {
  assert.equal(landingMessages.ja.obsidian.botStep2Title, "あなたのアカウントに紐づく scrapbook に振り分けます");
  assert.equal(landingMessages["pt-BR"].obsidian.pricePointFreeDesc, "O salvamento principal funciona imediatamente.");
  assert.equal(landingMessages.es.obsidian.langEn, "Inglés");
  assert.equal(landingMessages["zh-TW"].obsidian.shotLargeCapTitle, "Free 保存流程");
  assert.equal(
    landingMessages.vi.bot.botStep2Desc,
    "Hệ thống đối chiếu người trả lời với tài khoản Threads đã liên kết khi đăng nhập và chỉ lưu mục vào scrapbook riêng của đúng người đó."
  );
});
