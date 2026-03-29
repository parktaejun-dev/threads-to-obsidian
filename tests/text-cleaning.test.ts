import test from "node:test";
import assert from "node:assert/strict";

import { BUNDLED_EXTRACTOR_CONFIG } from "../packages/shared/src/config";
import { buildArchiveTitle, cleanTextLines, extractFirstLineTitle, extractTitleExcerpt } from "../packages/shared/src/utils";

test("extractTitleExcerpt strips a leading author handle", () => {
  assert.equal(
    extractTitleExcerpt("softdaddy_o MacBook Air에서 LLM을 로컬로 돌린 영상이 올라왔어.", "softdaddy_o"),
    "MacBook Air에서 LLM을 로컬로 돌린 영상이 올라왔어"
  );
});

test("extractFirstLineTitle returns the first line from multiline note text", () => {
  assert.equal(extractFirstLineTitle("AI 뉴스\n감사합니다. @ss_threads_bot"), "AI 뉴스");
});

test("extractFirstLineTitle ignores single-line note text", () => {
  assert.equal(extractFirstLineTitle("@ss_threads_bot AI 뉴스"), "");
});

test("buildArchiveTitle prefers a first-line note title over the target text", () => {
  assert.equal(
    buildArchiveTitle("target", "This is the first sentence that should be cut. This second sentence should not affect the title.", {
      noteText: "AI 뉴스\n감사합니다. @ss_threads_bot"
    }),
    "AI 뉴스"
  );
});

test("cleanTextLines strips author prefixes and stops at Threads footer noise", () => {
  const cleaned = cleanTextLines(
    [
      "softdaddy_o MacBook Air에서 LLM을 로컬로 돌린 영상이 올라왔어.",
      "Google의 TurboQuant 덕분.",
      "로그인하여 더 많은 답글을 확인해보세요.",
      "Threads에서 소통해보세요",
      "Threads 약관"
    ].join("\n"),
    "softdaddy_o",
    BUNDLED_EXTRACTOR_CONFIG
  );

  assert.equal(cleaned, "MacBook Air에서 LLM을 로컬로 돌린 영상이 올라왔어.\n\nGoogle의 TurboQuant 덕분.");
});
