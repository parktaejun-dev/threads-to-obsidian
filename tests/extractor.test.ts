import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { extractPostFromDocument } from "../packages/extension/src/lib/extractor";
import { isSupportedPermalink } from "../packages/extension/src/lib/utils";

const textFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@writer/post/ABC123" />
    <meta property="og:title" content="writer on Threads" />
    <meta property="og:description" content="첫 번째 문장. 둘째 문장." />
  </head>
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@writer/post/ABC123"><time datetime="2026-03-08T08:00:00.000Z">1시간</time></a>
        <div>writer</div>
        <div>첫 번째 문장.</div>
        <div>둘째 문장.</div>
        <a href="https://example.com/article">외부 링크</a>
        <button>좋아요 12</button>
      </article>
    </main>
    <script>{"shortcode":"ABC123","text":"첫 번째 문장.\\n둘째 문장."}</script>
  </body>
</html>
`;

const imageFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@painter/post/IMG999" />
    <meta property="og:title" content="painter on Threads" />
    <meta property="og:image" content="https://cdn.example.com/og.jpg" />
  </head>
  <body>
    <main>
      <section>
        <a href="https://www.threads.com/@painter/post/IMG999"><time datetime="2026-03-08T08:00:00.000Z">2시간</time></a>
        <div>painter</div>
        <div>컬러 테스트</div>
        <img src="https://cdn.example.com/avatar.jpg" alt="painter님의 프로필 사진" width="40" height="40" />
        <img src="https://cdn.example.com/image-1.jpg" alt="첫 이미지" width="640" height="480" />
        <img src="https://cdn.example.com/image-2.jpg" alt="둘째 이미지" width="640" height="480" />
        <a href="https://www.threads.com/@other/post/QQQ111">quoted</a>
        <button>좋아요 3</button>
      </section>
    </main>
  </body>
</html>
`;

const videoFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@filmer/post/VID777" />
    <meta property="og:title" content="filmer on Threads" />
    <meta property="og:image" content="https://cdn.example.com/thumb.jpg" />
  </head>
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@filmer/post/VID777"><time datetime="2026-03-08T08:00:00.000Z">3시간</time></a>
        <div>filmer</div>
        <div>영상 설명</div>
        <video controls src="https://cdn.example.com/video.mp4" poster="https://cdn.example.com/thumb.jpg"></video>
        <button>댓글 1</button>
      </article>
    </main>
  </body>
</html>
`;

const authorRepliesFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@writer/post/ROOT111" />
    <meta property="og:title" content="writer on Threads" />
    <meta property="og:description" content="메인 글 본문입니다." />
  </head>
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@writer/post/ROOT111"><time datetime="2026-03-08T08:00:00.000Z">1시간</time></a>
        <div>writer</div>
        <div>메인 글 본문입니다.</div>
        <button>좋아요 12</button>
      </article>
      <article>
        <a href="https://www.threads.com/@writer/post/REP222"><time datetime="2026-03-08T08:05:00.000Z">55분</time></a>
        <div>writer</div>
        <div>작성자가 이어서 남긴 첫 번째 답글입니다.</div>
        <img src="https://cdn.example.com/reply-1.jpg" alt="답글 이미지" width="640" height="480" />
        <button>좋아요 3</button>
      </article>
      <article>
        <a href="https://www.threads.com/@writer/post/REP333"><time datetime="2026-03-08T08:07:00.000Z">53분</time></a>
        <div>writer</div>
        <div>작성자가 이어서 남긴 두 번째 답글입니다.</div>
        <a href="https://example.com/reply-link">외부 링크</a>
        <button>좋아요 4</button>
      </article>
      <article>
        <a href="https://www.threads.com/@other/post/OTH444"><time datetime="2026-03-08T08:10:00.000Z">50분</time></a>
        <div>other</div>
        <div>다른 작성자의 댓글입니다.</div>
        <button>좋아요 1</button>
      </article>
      <article>
        <a href="https://www.threads.com/@writer/post/REP555"><time datetime="2026-03-08T08:12:00.000Z">48분</time></a>
        <div>writer</div>
        <div>다른 사람이 끼어든 뒤라 저장되면 안 되는 답글입니다.</div>
        <button>좋아요 1</button>
      </article>
    </main>
  </body>
</html>
`;

const loginShellFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <title>Threads • 로그인</title>
    <link rel="canonical" href="https://www.threads.com" />
    <meta property="og:image" content="https://cdn.example.com/post-cover.png" />
  </head>
  <body>
    <main>
      <video controls></video>
      <time datetime="2026-03-07T13:54:12.000Z">어제</time>
      <div>로그인 셸</div>
    </main>
    <script>{"shortcode":"DVlAicNgu0l","text":"Vercel에서 MCP Apps용 \\"Generative UI\\"를 업데이트 했습니다."}</script>
  </body>
</html>
`;

const domFallbackFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@maker/post/LINK888" />
    <meta property="og:title" content="maker on Threads" />
  </head>
  <body>
    <main>
      <section>
        <div>
          <a href="https://www.threads.com/@maker/post/LINK888"><time datetime="2026-03-08T09:00:00.000Z">1시간</time></a>
          <a href="https://www.threads.com/@maker">maker</a>
          <div>
            <div>본문 첫 문장입니다.</div>
            <div>본문 둘째 문장입니다.</div>
            <a href="https://l.threads.com/?u=https%3A%2F%2Fgithub.com%2Ftogethercomputer%2Ferdos-minimum-overlap&e=test">GitHub - togethercomputer/erdos-minimum-overlap</a>
          </div>
          <div>
            <button>좋아요 38</button>
            <button>댓글 5</button>
            <button>리포스트 2</button>
            <button>공유하기 14</button>
          </div>
        </div>
        <div>
          <a href="https://www.threads.com/@other/post/REP999"><time datetime="2026-03-08T09:10:00.000Z">50분</time></a>
          <a href="https://www.threads.com/@other">other</a>
          <div>솔루션 :</div>
          <div>github.com/toget…</div>
          <div>GitHub</div>
          <button>좋아요 4</button>
          <button>댓글 1</button>
        </div>
      </section>
    </main>
  </body>
</html>
`;

const structuredUnicodeFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@justonestep12345/post/DVmppVEE3DB" />
    <meta property="og:title" content="justonestep12345 on Threads" />
  </head>
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@justonestep12345/post/DVmppVEE3DB"><time datetime="2026-03-08T00:49:01.000Z">방금</time></a>
        <div>justonestep12345</div>
        <div>이런건 꼭 알고 있으면 좋습니다.</div>
        <button>좋아요 3</button>
      </article>
    </main>
    <script>
      {"shortcode":"OTHER111","text":"\\\\uc774\\\\ub7f0 \\\\ub17c\\\\uc758\\\\ub294 \\\\ub2e4\\\\ub978 \\\\uae00\\\\uc785\\\\ub2c8\\\\ub2e4.","shortcode":"DVmppVEE3DB","text":"\\\\uc774\\\\ub7f0\\\\uac74 \\\\uaf2d \\\\uc54c\\\\uace0 \\\\uc788\\\\uc73c\\\\uba74 \\\\uc88b\\\\uc2b5\\\\ub2c8\\\\ub2e4."}
    </script>
  </body>
</html>
`;

const authorRepliesWithMediaFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@insta_yoonchan/post/DVl-ttiAQvv" />
    <meta property="og:title" content="insta_yoonchan on Threads" />
  </head>
  <body>
    <main>
      <article>
        <a href="https://www.threads.com/@insta_yoonchan/post/DVl-ttiAQvv"><time datetime="2026-03-07T18:33:53.000Z">8시간</time></a>
        <div>insta_yoonchan</div>
        <div>출판시장은 왜 망가졌을까</div>
        <button>댓글 4</button>
      </article>
      <article>
        <a href="https://www.threads.com/@insta_yoonchan/post/DVl-ttiAQvv/media"><time datetime="2026-03-07T18:33:53.000Z">8시간</time></a>
        <div>insta_yoonchan</div>
        <div>출판시장은 왜 망가졌을까</div>
        <img src="https://cdn.example.com/root-image.webp" alt="메인 이미지" width="640" height="480" />
        <button>댓글 4</button>
      </article>
      <article>
        <a href="https://www.threads.com/@insta_yoonchan/post/DVmARgugabq"><time datetime="2026-03-07T18:35:00.000Z">8시간</time></a>
        <div>insta_yoonchan</div>
        <div>2/ 코어가 잡히지 않은 출판사</div>
        <button>좋아요 3</button>
      </article>
      <article>
        <a href="https://www.threads.com/@insta_yoonchan/post/DVmBSklgSp1"><time datetime="2026-03-07T18:36:00.000Z">7시간</time></a>
        <div>insta_yoonchan</div>
        <div>3/ 출판사의 마케팅</div>
        <button>좋아요 2</button>
      </article>
      <article>
        <a href="https://www.threads.com/@insta_yoonchan/post/DVl7dojAWRX"><time datetime="2026-03-07T18:00:00.000Z">8시간</time></a>
        <div>insta_yoonchan</div>
        <div>이전 글</div>
        <div>성인 61.5%가 지난해 한권도 안읽었단다.</div>
        <button>좋아요 7</button>
      </article>
      <article>
        <a href="https://www.threads.com/@other/post/REP999"><time datetime="2026-03-07T19:00:00.000Z">7시간</time></a>
        <div>other</div>
        <div>다른 사람이 남긴 댓글</div>
        <button>좋아요 1</button>
      </article>
    </main>
  </body>
</html>
`;

const buttonlessThreadChainFixture = `
<!doctype html>
<html lang="ko">
  <head>
    <link rel="canonical" href="https://www.threads.com/@feelfree_ai/post/DVm4YoYAb-H" />
    <meta property="og:title" content="feelfree_ai on Threads" />
  </head>
  <body>
    <main>
      <section>
        <div class="thread-card">
          <div class="meta">
            <div><a href="https://www.threads.com/@feelfree_ai/post/DVm4YoYAb-H"><time datetime="2026-03-08T02:58:28.000Z">4분</time></a></div>
            <div>feelfree_ai</div>
          </div>
          <div class="body">
            <div>깃허브가 작정하고 공개한 'AI 보안 감사' 프레임워크, 꼭 확인해보셔야 합니다.</div>
            <div>보안 취약점 잡겠다고 비싼 SAST 툴 도입하거나 밤새 로그 뜯어보는 분들 많으시죠?</div>
            <div>GitHub Security Lab에서 오픈소스로 공개한 seclab-taskflows를 주목해볼 만합니다.</div>
          </div>
        </div>
        <div class="thread-card">
          <div class="meta">
            <div>AI Threads</div>
            <div><a href="https://www.threads.com/@feelfree_ai/post/DVm4bZsAcZH"><time datetime="2026-03-08T03:02:00.000Z">4분</time></a></div>
            <div>작성자</div>
          </div>
          <div class="body">
            <div>1. github/seclab-taskflows 레포지토리에서 Codespace 생성</div>
            <div>2. 초기화될 때까지 잠시 대기 (커피 한 잔)</div>
            <div>3. 터미널에 명령어 입력: ./scripts/audit/run_audit.sh 내조직/내레포</div>
          </div>
        </div>
        <div class="thread-card">
          <div class="meta">
            <div>AI Threads</div>
            <div><a href="https://www.threads.com/@feelfree_ai/post/DVm4bYjgRki"><time datetime="2026-03-08T03:03:00.000Z">4분</time></a></div>
            <div>작성자</div>
          </div>
          <div class="body">
            <div>출처: github.blog/secur…</div>
            <a href="https://github.blog/open-source/codeql-ai-security">github.blog</a>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>
`;

test("text permalink extracts title, text, and external URL", async () => {
  const dom = new JSDOM(textFixture, { url: "https://www.threads.com/@writer/post/ABC123" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.author, "writer");
  assert.equal(post.shortcode, "ABC123");
  assert.equal(post.externalUrl, "https://example.com/article");
  assert.equal(post.title, "첫 번째 문장");
  assert.match(post.text, /첫 번째 문장/);
  assert.equal(post.sourceType, "text");
});

test("image permalink excludes avatar images and keeps related post url", async () => {
  const dom = new JSDOM(imageFixture, { url: "https://www.threads.com/@painter/post/IMG999" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.sourceType, "image");
  assert.equal(post.imageUrls.length, 2);
  assert.equal(post.quotedPostUrl, "https://www.threads.com/@other/post/QQQ111");
});

test("video permalink falls back to thumbnail metadata", async () => {
  const dom = new JSDOM(videoFixture, { url: "https://www.threads.com/@filmer/post/VID777" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.sourceType, "video");
  assert.equal(post.videoUrl, "https://cdn.example.com/video.mp4");
  assert.equal(post.thumbnailUrl, "https://cdn.example.com/thumb.jpg");
});

test("consecutive author replies are collected until another author interrupts the chain", async () => {
  const dom = new JSDOM(authorRepliesFixture, { url: "https://www.threads.com/@writer/post/ROOT111" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.authorReplies.length, 2);
  assert.equal(post.authorReplies[0]?.author, "writer");
  assert.equal(post.authorReplies[0]?.shortcode, "REP222");
  assert.equal(post.authorReplies[0]?.imageUrls[0], "https://cdn.example.com/reply-1.jpg");
  assert.equal(post.authorReplies[1]?.shortcode, "REP333");
  assert.equal(post.authorReplies[1]?.externalUrl, "https://example.com/reply-link");
  assert.equal(post.authorReplies.some((reply) => reply.shortcode === "REP555"), false);
});

test("login shell state falls back to the current permalink and safe metadata", async () => {
  const dom = new JSDOM(loginShellFixture, { url: "https://www.threads.com/@choi.openai/post/DVlAicNgu0l" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.canonicalUrl, "https://www.threads.com/@choi.openai/post/DVlAicNgu0l");
  assert.equal(post.author, "choi.openai");
  assert.equal(post.shortcode, "DVlAicNgu0l");
  assert.equal(post.sourceType, "text");
  assert.deepEqual(post.imageUrls, []);
  assert.equal(post.thumbnailUrl, "https://cdn.example.com/post-cover.png");
  assert.equal(post.publishedAt, null);
});

test("dom fallback keeps only the main post text and unwraps link shim urls", async () => {
  const dom = new JSDOM(domFallbackFixture, { url: "https://www.threads.com/@maker/post/LINK888" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.text, "본문 첫 문장입니다.\n\n본문 둘째 문장입니다.");
  assert.equal(post.externalUrl, "https://github.com/togethercomputer/erdos-minimum-overlap");
  assert.equal(post.text.includes("좋아요"), false);
  assert.equal(post.text.includes("솔루션"), false);
  assert.equal(post.text.includes("github.com/toget"), false);
});

test("structured text decodes unicode escapes and prefers the text closest to the target shortcode", async () => {
  const dom = new JSDOM(structuredUnicodeFixture, { url: "https://www.threads.com/@justonestep12345/post/DVmppVEE3DB" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.text, "이런건 꼭 알고 있으면 좋습니다.");
  assert.equal(post.text.includes("\\u"), false);
});

test("author replies ignore same-post media links and previous post cards", async () => {
  const dom = new JSDOM(authorRepliesWithMediaFixture, { url: "https://www.threads.com/@insta_yoonchan/post/DVl-ttiAQvv" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.deepEqual(
    post.authorReplies.map((reply) => reply.shortcode),
    ["DVmARgugabq", "DVmBSklgSp1"]
  );
  assert.equal(post.authorReplies.some((reply) => reply.text.includes("이전 글")), false);
});

test("buttonless thread cards still capture the main post and follow-up author replies", async () => {
  const dom = new JSDOM(buttonlessThreadChainFixture, { url: "https://www.threads.com/@feelfree_ai/post/DVm4YoYAb-H" });
  const post = await extractPostFromDocument(dom.window.document, dom.window.location.href);

  assert.equal(post.title, "깃허브가 작정하고 공개한 'AI 보안 감사' 프레임워크, 꼭");
  assert.match(post.text, /AI 보안 감사/);
  assert.deepEqual(
    post.authorReplies.map((reply) => reply.shortcode),
    ["DVm4bZsAcZH", "DVm4bYjgRki"]
  );
  assert.match(post.authorReplies[0]?.text ?? "", /Codespace 생성/);
  assert.equal(post.authorReplies[1]?.externalUrl, "https://github.blog/open-source/codeql-ai-security");
});

test("only permalink urls are supported", () => {
  assert.equal(isSupportedPermalink("https://www.threads.com/@writer/post/ABC123"), true);
  assert.equal(isSupportedPermalink("https://www.threads.com/@writer"), false);
});
