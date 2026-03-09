import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { countUniquePermalinkUrls, getCommentCountHint, waitForReplySurface } from "../src/extension/lib/reply-surface";

const replyLoadingFixture = `
<!doctype html>
<html lang="ko">
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@writer/post/ROOT111"><time datetime="2026-03-08T08:00:00.000Z">1시간</time></a>
        <div>writer</div>
        <div>메인 글 본문입니다.</div>
        <button>좋아요 12</button>
        <button>댓글 3</button>
      </article>
      <section id="reply-surface">
        <div>읽어들이는 중...</div>
      </section>
    </main>
  </body>
</html>
`;

test("reply surface reads comment count and waits for new permalink replies", async () => {
  const dom = new JSDOM(replyLoadingFixture, { url: "https://www.threads.com/@writer/post/ROOT111" });
  const { document, window } = dom.window;

  assert.equal(getCommentCountHint(document, dom.window.location.href), 3);
  assert.equal(countUniquePermalinkUrls(document), 1);

  window.setTimeout(() => {
    const surface = document.querySelector("#reply-surface");
    if (!surface) {
      return;
    }

    surface.innerHTML = `
      <article>
        <a href="https://www.threads.com/@writer/post/REP222"><time datetime="2026-03-08T08:05:00.000Z">55분</time></a>
        <div>writer</div>
        <div>작성자가 이어서 남긴 첫 번째 답글입니다.</div>
      </article>
    `;
  }, 40);

  const startedAt = Date.now();
  await waitForReplySurface(document, dom.window.location.href, 600);
  const elapsed = Date.now() - startedAt;

  assert.equal(countUniquePermalinkUrls(document), 2);
  assert.ok(elapsed < 600);
});
