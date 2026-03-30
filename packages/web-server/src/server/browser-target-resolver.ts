import { BUNDLED_EXTRACTOR_CONFIG } from "@threads/shared/config";
import type { AuthorReply, ExtractedPost, SourceType } from "@threads/shared/types";
import { extractTitleExcerpt } from "@threads/shared/utils";
import type { Browser, BrowserContext, Page } from "playwright";

const DEFAULT_BROWSER_TIMEOUT_MS = 30_000;
const DEFAULT_HYDRATE_WAIT_MS = 3_000;
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

type BrowserRuntime = "chromium" | "cdp";

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function parsePositiveInt(raw: string | null | undefined, fallback: number, minimum = 1): number {
  const value = Number.parseInt(safeText(raw), 10);
  return Number.isInteger(value) && value >= minimum ? value : fallback;
}

function normalizeThreadsUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

function extractShortcode(value: string): string {
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const index = segments.findIndex((segment) => segment === "post");
    return index >= 0 ? safeText(segments[index + 1] ?? "") : "";
  } catch {
    return "";
  }
}

function extractAuthorFromUrl(value: string): string {
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const handleSegment = safeText(segments[0] ?? "");
    return handleSegment.replace(/^@+/, "");
  } catch {
    return "";
  }
}

function isThreadsPostUrl(value: string): boolean {
  try {
    return Boolean(extractShortcode(normalizeThreadsUrl(value)));
  } catch {
    return false;
  }
}

function matchesThreadsShortcode(left: string, right: string): boolean {
  const leftShortcode = extractShortcode(left);
  const rightShortcode = extractShortcode(right);
  return Boolean(leftShortcode && rightShortcode && leftShortcode === rightShortcode);
}

function looksLikeLoggedOutThreadsPage(text: string): boolean {
  if (!text) {
    return false;
  }

  return (
    /log in or sign up for threads|continue with instagram|log in with username|say more with threads/i.test(text) ||
    /로그인하여 더 많은 답글을 확인해보세요|사용자 이름으로 로그인|threads 약관|threads에서 소통해보세요|대화에 참여해보세요/u.test(text)
  );
}

function readBrowserTimeoutMs(): number {
  return parsePositiveInt(process.env.THREADS_BROWSER_RESOLVER_TIMEOUT_MS, DEFAULT_BROWSER_TIMEOUT_MS, 1_000);
}

function readHydrateWaitMs(): number {
  return parsePositiveInt(process.env.THREADS_BROWSER_RESOLVER_HYDRATE_WAIT_MS, DEFAULT_HYDRATE_WAIT_MS, 0);
}

function preferCdpRuntime(): boolean {
  const preference = safeText(process.env.THREADS_BROWSER_RESOLVER_PRIORITY).toLowerCase();
  return preference === "cdp" || preference === "lightpanda";
}

function readStorageStatePath(): string | undefined {
  const value = safeText(process.env.THREADS_BROWSER_RESOLVER_STORAGE_STATE_PATH);
  return value || undefined;
}

async function openRuntime(): Promise<{
  runtime: BrowserRuntime;
  browser: Browser;
  context: BrowserContext;
  close: () => Promise<void>;
} | null> {
  const playwright = (await import(["play", "wright"].join(""))) as typeof import("playwright");
  const timeoutMs = readBrowserTimeoutMs();
  const cdpUrl = safeText(process.env.THREADS_BROWSER_RESOLVER_CDP_URL);
  const executablePath = safeText(process.env.THREADS_BROWSER_RESOLVER_EXECUTABLE_PATH) || undefined;
  const storageState = readStorageStatePath();

  const launchOrder: BrowserRuntime[] = preferCdpRuntime()
    ? ["cdp", "chromium"]
    : ["chromium", "cdp"];

  for (const runtime of launchOrder) {
    if (runtime === "cdp") {
      if (!cdpUrl) {
        continue;
      }

      try {
        const browser = await playwright.chromium.connectOverCDP(cdpUrl, { timeout: timeoutMs });
        const context =
          browser.contexts()[0] ??
          (await browser.newContext({
            storageState,
            userAgent: DEFAULT_USER_AGENT,
            locale: "ko-KR",
            timezoneId: "Asia/Seoul"
          }));
        return {
          runtime,
          browser,
          context,
          close: async () => {
            await browser.close().catch(() => undefined);
          }
        };
      } catch {
        continue;
      }
    }

    try {
      const browser = await playwright.chromium.launch({
        headless: true,
        executablePath,
        args: ["--disable-dev-shm-usage", "--no-sandbox"]
      });
      const context = await browser.newContext({
        storageState,
        userAgent: DEFAULT_USER_AGENT,
        locale: "ko-KR",
        timezoneId: "Asia/Seoul"
      });
      return {
        runtime,
        browser,
        context,
        close: async () => {
          await context.close().catch(() => undefined);
          await browser.close().catch(() => undefined);
        }
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function waitForPostSurface(page: Page, expectedUrl: string, timeoutMs: number): Promise<void> {
  const expectedShortcode = extractShortcode(expectedUrl);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const ready = await page.evaluate(
      ({ shortcode, url }) => {
        const canonicalCandidate =
          document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href?.trim() ??
          document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content?.trim() ??
          "";
        const normalize = (value: string): string => {
          try {
            const parsed = new URL(value, window.location.href);
            parsed.hash = "";
            parsed.search = "";
            return parsed.toString().replace(/\/$/, "");
          } catch {
            return "";
          }
        };

        const hasPermalinkAnchor = shortcode
          ? Boolean(document.querySelector(`a[href*="/post/${shortcode}"]`))
          : false;
        return hasPermalinkAnchor || normalize(canonicalCandidate) === normalize(url);
      },
      { shortcode: expectedShortcode, url: expectedUrl }
    );

    if (ready) {
      return;
    }

    await page.waitForTimeout(150);
  }
}

async function waitForReplySurface(page: Page, expectedUrl: string, timeoutMs: number): Promise<void> {
  const shortcode = extractShortcode(expectedUrl);
  if (!shortcode) {
    return;
  }

  const deadline = Date.now() + timeoutMs;
  let previousPermalinkCount = 0;
  let sawLoadingMarker = false;

  while (Date.now() < deadline) {
    const snapshot = await page.evaluate(({ currentShortcode }) => {
      const normalize = (value: string): string | null => {
        try {
          const parsed = new URL(value, window.location.href);
          parsed.hash = "";
          parsed.search = "";
          return parsed.toString().replace(/\/$/, "");
        } catch {
          return null;
        }
      };

      const permalinkUrls = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]'))
        .map((anchor) => normalize(anchor.href))
        .filter((value): value is string => Boolean(value));
      const uniquePermalinkCount = new Set(permalinkUrls).size;
      const permalinkAnchor = currentShortcode
        ? document.querySelector<HTMLAnchorElement>(`a[href*="/post/${currentShortcode}"]`)
        : null;
      const scope = permalinkAnchor?.parentElement?.parentElement ?? document.body;
      const controls = Array.from(scope.querySelectorAll<HTMLElement>("button, [role='button']"));
      const bodyText = document.body.innerText ?? document.body.textContent ?? "";
      return {
        uniquePermalinkCount,
        hasCommentHint: controls.some((control) =>
          /댓글\s*[\d.,]+(?:천|만)?/u.test(
            (control.getAttribute("aria-label") ?? control.textContent ?? "").replace(/\s+/g, " ").trim()
          )
        ),
        loadingMarkerCount: (bodyText.match(/읽어들이는 중\.\.\./g) ?? []).length,
        loggedOutReplyPrompt: bodyText.includes("로그인하여 더 많은 답글을 확인해보세요.")
      };
    }, { currentShortcode: shortcode });

    if (!snapshot.hasCommentHint) {
      return;
    }

    if (previousPermalinkCount > 0 && snapshot.uniquePermalinkCount > previousPermalinkCount) {
      return;
    }

    if (snapshot.loadingMarkerCount > 0) {
      sawLoadingMarker = true;
    } else if (sawLoadingMarker) {
      return;
    }

    if (snapshot.loggedOutReplyPrompt) {
      return;
    }

    previousPermalinkCount = Math.max(previousPermalinkCount, snapshot.uniquePermalinkCount);
    await page.waitForTimeout(250);
  }
}

async function hashResolvedPost(post: Omit<ExtractedPost, "contentHash">): Promise<string> {
  const payload = JSON.stringify({
    canonicalUrl: post.canonicalUrl,
    text: post.text,
    imageUrls: post.imageUrls,
    externalUrl: post.externalUrl,
    quotedPostUrl: post.quotedPostUrl,
    repliedToUrl: post.repliedToUrl,
    authorReplies: post.authorReplies
  });
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

async function extractRenderedPost(page: Page, sourceUrl: string): Promise<ExtractedPost> {
  const extracted = await (async () => {
    try {
      return await page.evaluate(
        ({ pageUrl, config }) => {
      type BrowserAuthorReply = {
        author: string;
        canonicalUrl: string;
        shortcode: string;
        text: string;
        publishedAt: string | null;
        sourceType: SourceType;
        imageUrls: string[];
        videoUrl: string | null;
        externalUrl: string | null;
        thumbnailUrl: string | null;
      };

      const dedupeStrings = (values: Array<string | null | undefined>): string[] => {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const value of values) {
          const normalized = (value ?? "").trim();
          if (!normalized || seen.has(normalized)) {
            continue;
          }
          seen.add(normalized);
          result.push(normalized);
        }
        return result;
      };

      const normalizeThreadsUrl = (url: string): string => {
        const parsed = new URL(url, window.location.href);
        parsed.hash = "";
        parsed.search = "";
        parsed.hostname = "www.threads.com";
        parsed.pathname = parsed.pathname.replace(/(\/@[^/]+\/post\/[^/]+)\/media(?:\/.*)?$/i, "$1");
        return parsed.toString().replace(/\/$/, "");
      };

      const extractShortcodeFromUrl = (url: string): string => normalizeThreadsUrl(url).match(/\/post\/([^/?#]+)/i)?.[1] ?? "";
      const extractAuthorFromUrl = (url: string): string => normalizeThreadsUrl(url).match(/\/@([^/]+)/i)?.[1] ?? "unknown";

      const unwrapExternalUrl = (url: string): string | null => {
        const parsed = new URL(url, "https://www.threads.com");
        const target = parsed.searchParams.get("u");
        if (target) {
          try {
            return decodeURIComponent(target);
          } catch {
            return target;
          }
        }

        if (parsed.hostname.endsWith("threads.com") || parsed.hostname.endsWith("threads.net")) {
          return null;
        }

        parsed.hash = "";
        return parsed.toString();
      };

      const getMeta = (selector: string): string | null =>
        document.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? null;

      const getCanonicalUrl = (): string => {
        const pageShortcode = extractShortcodeFromUrl(pageUrl);
        const candidates = [
          document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
          getMeta('meta[property="og:url"]'),
          pageUrl
        ];

        for (const candidate of candidates) {
          if (!candidate) {
            continue;
          }

          try {
            const normalized = normalizeThreadsUrl(candidate);
            if (pageShortcode && extractShortcodeFromUrl(normalized) !== pageShortcode) {
              continue;
            }
            return normalized;
          } catch {
            continue;
          }
        }

        return normalizeThreadsUrl(pageUrl);
      };

      const cleanTextLines = (text: string, author: string): string => {
        const normalizedAuthor = author.trim().replace(/^@+/, "");
        const escapedAuthor = normalizedAuthor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const stripLeadingAuthorPrefix = (line: string): string => {
          const normalizedLine = line.trim().replace(/\s+/g, " ");
          if (!normalizedLine || !normalizedAuthor) {
            return normalizedLine;
          }
          if (normalizedLine === normalizedAuthor || normalizedLine === `@${normalizedAuthor}`) {
            return "";
          }
          const prefixMatch = normalizedLine.match(new RegExp(`^(?:@?${escapedAuthor})(?:[\\s·:：\\-–—]+|$)`, "i"));
          return prefixMatch ? normalizedLine.slice(prefixMatch[0].length).trim() : normalizedLine;
        };
        const isFooterLine = (line: string): boolean =>
          /^(?:Threads에 로그인 또는 가입하기|Threads에 가입하여 .*|Threads에 가입해 .*|로그인하여 더 많은 답글을 확인해보세요\.?|Threads에서 소통해보세요|Threads 약관|개인정보처리방침|쿠키 정책|문제 신고|Log in or sign up for Threads|Log in to continue|Sign in to continue|Continue with Instagram|Threads Terms|Privacy Policy|Cookie Policy|Report a problem)$/i.test(line);
        const lines = dedupeStrings(
          text
            .split(/\n+/)
            .map((line) => stripLeadingAuthorPrefix(line))
            .filter(Boolean)
        );
        const filtered: string[] = [];
        for (const line of lines) {
          if (line === author || line === `@${author}`) {
            continue;
          }
          if (isFooterLine(line)) {
            if (filtered.length > 0) {
              break;
            }
            continue;
          }
          if (
            line === "스레드" ||
            line === "인기순" ||
            line === "활동 보기" ||
            /^조회\s+[\d.,]+(?:천|만)?회$/u.test(line) ||
            /^Threads에 가입하여 .*$/u.test(line) ||
            /^Threads에 가입해 .*$/u.test(line) ||
            /^Threads에 로그인 또는 가입하기$/u.test(line) ||
            /^사람들의 이야기를 확인하고 대화에 참여해보세요\.$/u.test(line)
          ) {
            continue;
          }
          if (config.noisePatterns.some((pattern) => line === pattern || line.startsWith(`${pattern} `))) {
            if (filtered.length > 0) {
              break;
            }
            continue;
          }
          if (/^\d+\s*(초|분|시간|일|주|개월|년)$/.test(line)) {
            continue;
          }
          if (/^[\d.,]+(?:천|만)?$/u.test(line) || /^\d+\s*\/\s*\d+$/.test(line) || line === "/") {
            continue;
          }
          filtered.push(line);
        }
        return filtered.join("\n\n").trim();
      };

      const countActionButtons = (root: HTMLElement): number =>
        Array.from(root.querySelectorAll<HTMLButtonElement>("button")).filter((button) =>
          /(좋아요|댓글|리포스트|공유하기)/u.test((button.getAttribute("aria-label") ?? button.textContent ?? "").trim())
        ).length;

      const countPermalinkLinks = (root: HTMLElement): number =>
        dedupeStrings(
          Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]')).map((anchor) => {
            try {
              return normalizeThreadsUrl(anchor.href);
            } catch {
              return null;
            }
          })
        ).length;

      const scorePostBlockCandidate = (root: HTMLElement): number => {
        const textLength = Math.min((root.innerText || root.textContent || "").trim().length, 320);
        const timeCount = root.querySelectorAll("time").length;
        const permalinkCount = countPermalinkLinks(root);
        const buttonCount = countActionButtons(root);
        const mediaCount = root.querySelectorAll("img, video").length;
        const hasAuthorBadge = (root.innerText || root.textContent || "").includes("작성자");

        let score = textLength;
        if (timeCount === 1) {
          score += 120;
        } else if (timeCount > 1) {
          score -= Math.min((timeCount - 1) * 80, 240);
        }
        if (permalinkCount === 1) {
          score += 120;
        } else if (permalinkCount > 1) {
          score -= Math.min((permalinkCount - 1) * 80, 240);
        }
        if (buttonCount >= 2) {
          score += 60;
        } else if (buttonCount === 1) {
          score += 20;
        }
        if (mediaCount > 0) {
          score += 10;
        }
        if (hasAuthorBadge) {
          score += 20;
        }
        return score;
      };

      const findPostBlockFromAnchor = (anchor: HTMLAnchorElement): HTMLElement | null => {
        let current: HTMLElement | null = anchor;
        let bestCandidate: HTMLElement | null = null;
        let bestScore = Number.NEGATIVE_INFINITY;
        while (current && current !== anchor.ownerDocument.body) {
          const textLength = (current.innerText || current.textContent || "").trim().length;
          const permalinkCount = countPermalinkLinks(current);
          const timeCount = current.querySelectorAll("time").length;
          if (timeCount >= 1 && textLength > 12 && permalinkCount >= 1) {
            const score = scorePostBlockCandidate(current);
            if (score > bestScore) {
              bestScore = score;
              bestCandidate = current;
            }
          }
          current = current.parentElement;
        }
        return bestCandidate;
      };

      const findPostRoot = (canonicalUrl: string, shortcode: string): HTMLElement | null => {
        if (!shortcode) {
          return null;
        }
        const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[href*="/post/${shortcode}"]`)).sort((left, right) => {
          const leftHasTime = Number(Boolean(left.querySelector("time")));
          const rightHasTime = Number(Boolean(right.querySelector("time")));
          return rightHasTime - leftHasTime;
        });
        const normalizedTarget = normalizeThreadsUrl(canonicalUrl);
        for (const anchor of anchors) {
          const href = anchor.href ? normalizeThreadsUrl(anchor.href) : "";
          if (href && href !== normalizedTarget) {
            continue;
          }
          const postBlock = findPostBlockFromAnchor(anchor);
          if (postBlock) {
            return postBlock;
          }
        }
        return null;
      };

      const findFirstForeignPostBlock = (root: HTMLElement | null, canonicalUrl: string): HTMLElement | null => {
        if (!root) {
          return null;
        }

        let firstBlock: HTMLElement | null = null;
        for (const anchor of root.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]')) {
          let normalizedUrl: string;
          try {
            normalizedUrl = normalizeThreadsUrl(anchor.href);
          } catch {
            continue;
          }

          if (normalizedUrl === canonicalUrl) {
            continue;
          }

          const block = findPostBlockFromAnchor(anchor);
          if (!block || block === root || !root.contains(block)) {
            continue;
          }

          if (!firstBlock) {
            firstBlock = block;
            continue;
          }

          const position = firstBlock.compareDocumentPosition(block);
          if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            firstBlock = block;
          }
        }

        return firstBlock;
      };

      const getVisibleImages = (root: HTMLElement | null, author: string, minimumDimension = 140): string[] => {
        if (!root) {
          return [];
        }
        const urls = Array.from(root.querySelectorAll<HTMLImageElement>("img"))
          .filter((img) => {
            const src = img.currentSrc || img.src;
            if (!src || !src.startsWith("http")) {
              return false;
            }
            const alt = img.alt.trim();
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            if (alt.includes("프로필 사진") || alt.includes(author)) {
              return false;
            }
            return width >= minimumDimension || height >= minimumDimension;
          })
          .map((img) => img.currentSrc || img.src);
        return urls.length > 0 ? dedupeStrings(urls) : [];
      };

      const getVideoUrl = (root: ParentNode | null): string | null => {
        if (!root) {
          return null;
        }
        const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video"));
        for (const video of videos) {
          const candidates = [
            video.currentSrc,
            video.src,
            ...Array.from(video.querySelectorAll<HTMLSourceElement>("source")).map((source) => source.src)
          ];
          for (const candidate of candidates) {
            const value = candidate?.trim();
            if (value && /^https?:\/\//i.test(value)) {
              return value;
            }
          }
        }
        return null;
      };

      const getVideoPosterUrl = (root: ParentNode | null): string | null => {
        const poster = root?.querySelector<HTMLVideoElement>("video")?.getAttribute("poster")?.trim();
        return poster && /^https?:\/\//i.test(poster) ? poster : null;
      };

      const getExternalUrl = (root: HTMLElement | null): string | null => {
        if (!root) {
          return null;
        }
        const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]"));
        const external = anchors.find((anchor) => {
          try {
            return Boolean(unwrapExternalUrl(anchor.href));
          } catch {
            return false;
          }
        });
        return external ? unwrapExternalUrl(external.href) : null;
      };

      const getEmbeddedPostUrls = (canonicalUrl: string): string[] => {
        const html = document.documentElement.innerHTML;
        const matches = html.matchAll(/"post":\{[\s\S]*?"user":\{[\s\S]*?"username":"([^"]+)"[\s\S]*?"code":"([A-Za-z0-9_-]+)"/g);
        const urls: string[] = [];
        for (const match of matches) {
          const username = match[1]?.trim();
          const code = match[2]?.trim();
          if (!username || !code) {
            continue;
          }
          try {
            urls.push(normalizeThreadsUrl(`https://www.threads.com/@${username}/post/${code}`));
          } catch {
            continue;
          }
        }
        const deduped = dedupeStrings(urls);
        return deduped.length > 0 ? deduped : [canonicalUrl];
      };

      const getRelatedPostUrls = (
        root: HTMLElement | null,
        canonicalUrl: string
      ): { quotedPostUrl: string | null; repliedToUrl: string | null } => {
        if (!root) {
          const embeddedUrls = getEmbeddedPostUrls(canonicalUrl);
          const currentIndex = embeddedUrls.indexOf(canonicalUrl);
          return {
            quotedPostUrl: null,
            repliedToUrl: currentIndex > 0 ? embeddedUrls[currentIndex - 1] ?? null : null
          };
        }

        const links = dedupeStrings(
          Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]')).map((anchor) => {
            try {
              const normalized = normalizeThreadsUrl(anchor.href);
              return normalized === canonicalUrl ? null : normalized;
            } catch {
              return null;
            }
          })
        );
        if (links.length === 0) {
          const embeddedUrls = getEmbeddedPostUrls(canonicalUrl);
          const currentIndex = embeddedUrls.indexOf(canonicalUrl);
          return {
            quotedPostUrl: null,
            repliedToUrl: currentIndex > 0 ? embeddedUrls[currentIndex - 1] ?? null : null
          };
        }
        return {
          quotedPostUrl: links[0] ?? null,
          repliedToUrl: links[1] ?? null
        };
      };

      const getPublishedAt = (root: HTMLElement | null, shortcode: string): string | null => {
        const rootTime = root?.querySelector<HTMLTimeElement>("time")?.getAttribute("datetime");
        if (rootTime) {
          return rootTime;
        }
        if (!shortcode) {
          return null;
        }
        return document.querySelector<HTMLAnchorElement>(`a[href*="/post/${shortcode}"] time`)?.getAttribute("datetime") ?? null;
      };

      const detectSourceType = (
        imageUrls: string[],
        scope: ParentNode | null,
        videoUrl: string | null,
        videoPosterUrl: string | null
      ): SourceType => {
        if (scope?.querySelector("video") && (videoUrl || videoPosterUrl)) {
          return "video";
        }
        if (imageUrls.length > 0) {
          return "image";
        }
        return "text";
      };

      const getPostTitle = (author: string, text: string): string => {
        const normalizedAuthor = author.trim().replace(/^@+/, "");
        const escapedAuthor = normalizedAuthor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const blocks = text.replace(/\s+/g, " ").trim().split(/\n+/).map((line) => line.trim()).filter(Boolean);
        for (const block of blocks) {
          const normalizedLine = block.replace(/\s+/g, " ");
          if (!normalizedLine) {
            continue;
          }
          const prefixMatch = normalizedAuthor
            ? normalizedLine.match(new RegExp(`^(?:@?${escapedAuthor})(?:[\\s·:：\\-–—]+|$)`, "i"))
            : null;
          const stripped = prefixMatch ? normalizedLine.slice(prefixMatch[0].length).trim() : normalizedLine;
          const firstSentence = stripped.match(/^(.+?[.!?。！？])(?:\s|$)/u)?.[1] ?? stripped;
          const excerpt = firstSentence.replace(/\s+/g, " ").trim();
          if (excerpt.length > 2) {
            return Array.from(excerpt).slice(0, 38).join("").trim();
          }
        }
        return author;
      };

      const extractDomText = (
        root: HTMLElement | null,
        author: string,
        canonicalUrl: string,
        stopAtForeignPost = true
      ): string => {
        if (!root) {
          return "";
        }
        const cutoffBlock = findFirstForeignPostBlock(root, canonicalUrl);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const lines: string[] = [];
        let currentNode = walker.nextNode();
        while (currentNode) {
          const text = currentNode.textContent?.trim();
          const parent = currentNode.parentElement;
          if (stopAtForeignPost && cutoffBlock && parent && cutoffBlock.contains(parent)) {
            break;
          }
          if (text && parent && !parent.closest("button, time, a, script, style, svg, video, picture, figure, img")) {
            lines.push(text);
          }
          currentNode = walker.nextNode();
        }
        return cleanTextLines(lines.join("\n\n"), author);
      };

      const isNodeAfter = (referenceNode: Node, targetNode: Node): boolean =>
        Boolean(referenceNode.compareDocumentPosition(targetNode) & Node.DOCUMENT_POSITION_FOLLOWING);

      const extractAuthorReplies = (root: HTMLElement | null, author: string, canonicalUrl: string): BrowserAuthorReply[] => {
        if (!root) {
          return [];
        }
        const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]'));
        const seenBlocks = new Set<HTMLElement>();
        const orderedBlocks: Array<{ block: HTMLElement; url: string; blockAuthor: string }> = [];
        for (const anchor of anchors) {
          if (!isNodeAfter(root, anchor)) {
            continue;
          }
          let normalizedUrl: string;
          try {
            normalizedUrl = normalizeThreadsUrl(anchor.href);
          } catch {
            continue;
          }
          if (normalizedUrl === canonicalUrl) {
            continue;
          }
          const block = findPostBlockFromAnchor(anchor);
          if (!block || root.contains(block) || seenBlocks.has(block)) {
            continue;
          }
          seenBlocks.add(block);
          orderedBlocks.push({
            block,
            url: normalizedUrl,
            blockAuthor: extractAuthorFromUrl(normalizedUrl)
          });
        }
        const replies: BrowserAuthorReply[] = [];
        let startedChain = false;
        for (const candidate of orderedBlocks) {
          if (candidate.blockAuthor !== author) {
            if (startedChain) {
              break;
            }
            continue;
          }
          startedChain = true;
          const text = extractDomText(candidate.block, author, candidate.url, false);
          if (!text || text.startsWith("이전 글")) {
            continue;
          }
          const imageUrls = getVisibleImages(candidate.block, author, 48);
          const videoUrl = getVideoUrl(candidate.block);
          const videoPosterUrl = getVideoPosterUrl(candidate.block);
          const sourceType = detectSourceType(imageUrls, candidate.block, videoUrl, videoPosterUrl);
          replies.push({
            author: candidate.blockAuthor,
            canonicalUrl: candidate.url,
            shortcode: extractShortcodeFromUrl(candidate.url),
            text,
            publishedAt: getPublishedAt(candidate.block, extractShortcodeFromUrl(candidate.url)),
            sourceType,
            imageUrls,
            videoUrl,
            externalUrl: getExternalUrl(candidate.block),
            thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? imageUrls[0] ?? null : imageUrls[0] ?? null
          });
        }
        return replies;
      };

      const canonicalUrl = getCanonicalUrl();
      const shortcode = extractShortcodeFromUrl(canonicalUrl);
      const author = extractAuthorFromUrl(canonicalUrl);
      const root = findPostRoot(canonicalUrl, shortcode);
      const ogDescription = getMeta('meta[property="og:description"]') ?? "";
      const rawText = extractDomText(root, author, canonicalUrl) || ogDescription;
      const text = cleanTextLines(rawText, author) || ogDescription;
      const ogThumbnailUrl = getMeta('meta[property="og:image"]');
      const imageUrls = getVisibleImages(root, author);
      const videoUrl = getVideoUrl(root);
      const videoPosterUrl = getVideoPosterUrl(root);
      const externalUrl = getExternalUrl(root);
      const related = getRelatedPostUrls(root, canonicalUrl);
      const sourceType = detectSourceType(imageUrls, root, videoUrl, videoPosterUrl);

      return {
        canonicalUrl,
        shortcode,
        author,
        title: getPostTitle(author, text),
        text,
        publishedAt: getPublishedAt(root, shortcode),
        sourceType,
        imageUrls,
        videoUrl,
        externalUrl,
        quotedPostUrl: related.quotedPostUrl,
        repliedToUrl: related.repliedToUrl,
        thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? ogThumbnailUrl ?? imageUrls[0] ?? null : ogThumbnailUrl,
        authorReplies: extractAuthorReplies(root, author, canonicalUrl)
      };
        },
        {
          pageUrl: page.url() || sourceUrl,
          config: {
            version: BUNDLED_EXTRACTOR_CONFIG.version,
            noisePatterns: BUNDLED_EXTRACTOR_CONFIG.noisePatterns
          }
        }
      );
    } catch {
      return await page.evaluate(({ pageUrl, noisePatterns }) => {
        const normalizeThreadsUrl = (url: string): string => {
          const parsed = new URL(url, window.location.href);
          parsed.hash = "";
          parsed.search = "";
          parsed.hostname = "www.threads.com";
          parsed.pathname = parsed.pathname.replace(/(\/@[^/]+\/post\/[^/]+)\/media(?:\/.*)?$/i, "$1");
          return parsed.toString().replace(/\/$/, "");
        };

        const extractShortcodeFromUrl = (url: string): string => normalizeThreadsUrl(url).match(/\/post\/([^/?#]+)/i)?.[1] ?? "";
        const extractAuthorFromUrl = (url: string): string => normalizeThreadsUrl(url).match(/\/@([^/]+)/i)?.[1] ?? "unknown";
        const dedupeStrings = (values: Array<string | null | undefined>): string[] => {
          const seen = new Set<string>();
          const result: string[] = [];
          for (const value of values) {
            const normalized = (value ?? "").trim();
            if (!normalized || seen.has(normalized)) {
              continue;
            }
            seen.add(normalized);
            result.push(normalized);
          }
          return result;
        };
        const cleanLines = (text: string, author: string): string =>
          dedupeStrings(
            text
              .split(/\n+/)
              .map((line) => line.trim())
              .map((line) => {
                const normalizedAuthor = author.trim().replace(/^@+/, "");
                if (!normalizedAuthor || normalizedAuthor.toLowerCase() === "unknown") {
                  return line;
                }
                const escapedAuthor = normalizedAuthor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                return line.replace(new RegExp(`^(?:@?${escapedAuthor})(?:[\\s·:：\\-–—]+|$)`, "i"), "").trim();
              })
              .filter(Boolean)
          )
            .filter((line) => {
              if (line === author || line === `@${author}`) {
                return false;
              }
              if (
                line === "스레드" ||
                line === "인기순" ||
                line === "활동 보기" ||
                /^조회\s+[\d.,]+(?:천|만)?회$/u.test(line) ||
                /^Threads에 가입하여 .*$/u.test(line) ||
                /^Threads에 가입해 .*$/u.test(line) ||
                /^Threads에 로그인 또는 가입하기$/u.test(line) ||
                /^사람들의 이야기를 확인하고 대화에 참여해보세요\.$/u.test(line) ||
                /^\d+\s*(초|분|시간|일|주|개월|년)$/u.test(line) ||
                /^[\d.,]+(?:천|만)?$/u.test(line) ||
                /^\d+\s*\/\s*\d+$/u.test(line) ||
                line === "/"
              ) {
                return false;
              }
              if (noisePatterns.some((pattern) => line === pattern || line.startsWith(`${pattern} `))) {
                return false;
              }
              return true;
            })
            .join("\n\n")
            .trim();

        const canonicalUrl =
          document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href?.trim() ||
          document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content?.trim() ||
          pageUrl;
        const normalizedCanonicalUrl = normalizeThreadsUrl(canonicalUrl);
        const author = extractAuthorFromUrl(normalizedCanonicalUrl);
        const bodyText = cleanLines(document.body.innerText || document.body.textContent || "", author);
        const relatedUrls = dedupeStrings(
          Array.from(document.links)
            .map((anchor) => anchor.href)
            .filter((href) => href.includes("/post/"))
            .map((href) => {
              try {
                return normalizeThreadsUrl(href);
              } catch {
                return null;
              }
            })
        ).filter((href) => href !== normalizedCanonicalUrl);

        return {
          canonicalUrl: normalizedCanonicalUrl,
          shortcode: extractShortcodeFromUrl(normalizedCanonicalUrl),
          author,
          title:
            (() => {
              const normalizedAuthor = author.trim().replace(/^@+/, "");
              const escapedAuthor = normalizedAuthor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const blocks = bodyText
                .split(/\n+/)
                .map((line) => line.trim())
                .filter(Boolean);
              for (const block of blocks) {
                const normalized = block.replace(/\s+/g, " ");
                const prefixMatch = normalizedAuthor
                  ? normalized.match(new RegExp(`^(?:@?${escapedAuthor})(?:[\\s·:：\\-–—]+|$)`, "i"))
                  : null;
                const stripped = prefixMatch ? normalized.slice(prefixMatch[0].length).trim() : normalized;
                const firstSentence = stripped.match(/^(.+?[.!?。！？])(?:\s|$)/u)?.[1] ?? stripped;
                const excerpt = firstSentence.replace(/\s+/g, " ").trim();
                if (excerpt.length > 2) {
                  return Array.from(excerpt).slice(0, 38).join("").trim();
                }
              }
              return author;
            })(),
          text: bodyText,
          publishedAt: document.querySelector<HTMLTimeElement>("time")?.getAttribute("datetime") ?? null,
          sourceType: "text" as const,
          imageUrls: [] as string[],
          videoUrl: null,
          externalUrl: null,
          quotedPostUrl: relatedUrls[0] ?? null,
          repliedToUrl: relatedUrls[0] ?? null,
          thumbnailUrl: null,
          authorReplies: [] as AuthorReply[]
        };
      }, {
        pageUrl: page.url() || sourceUrl,
        noisePatterns: BUNDLED_EXTRACTOR_CONFIG.noisePatterns
      });
    }
  })();

  const partial: Omit<ExtractedPost, "contentHash"> = {
    canonicalUrl: extracted.canonicalUrl,
    shortcode: extracted.shortcode,
    author: extracted.author,
    title: extracted.title,
    text: extracted.text,
    publishedAt: extracted.publishedAt,
    capturedAt: new Date().toISOString(),
    sourceType: extracted.sourceType,
    imageUrls: extracted.imageUrls,
    videoUrl: extracted.videoUrl,
    externalUrl: extracted.externalUrl,
    quotedPostUrl: extracted.quotedPostUrl,
    repliedToUrl: extracted.repliedToUrl,
    thumbnailUrl: extracted.thumbnailUrl,
    authorReplies: extracted.authorReplies as AuthorReply[],
    extractorVersion: BUNDLED_EXTRACTOR_CONFIG.version
  };

  return {
    ...partial,
    contentHash: await hashResolvedPost(partial)
  };
}

type BrowserSnapshot = {
  canonicalUrl: string;
  relatedUrl: string | null;
  text: string;
  publishedAt: string | null;
  pageMatchedSource: boolean;
  blockedByAuth: boolean;
};

async function extractBrowserSnapshot(page: Page, sourceUrl: string): Promise<BrowserSnapshot> {
  const dedupeStrings = (values: Array<string | null | undefined>): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of values) {
      const normalized = safeText(value);
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      result.push(normalized);
    }
    return result;
  };

  const cleanLines = (text: string): string => {
    const lines = dedupeStrings(
      text
        .split(/\n+/)
        .map((line) => line.trim())
        .map((line) => {
          const normalizedAuthor = sourceAuthor.trim().replace(/^@+/, "");
          if (!normalizedAuthor || normalizedAuthor.toLowerCase() === "unknown") {
            return line;
          }
          const escapedAuthor = normalizedAuthor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return line.replace(new RegExp(`^(?:@?${escapedAuthor})(?:[\\s·:：\\-–—]+|$)`, "i"), "").trim();
        })
        .filter(Boolean)
    );
    const filtered: string[] = [];
    for (const line of lines) {
      const isFooterLine =
        /^(?:Threads에 로그인 또는 가입하기|Threads에 가입하여 .*|Threads에 가입해 .*|로그인하여 더 많은 답글을 확인해보세요\.?|Threads에서 소통해보세요|Threads 약관|개인정보처리방침|쿠키 정책|문제 신고|Log in or sign up for Threads|Log in to continue|Sign in to continue|Continue with Instagram|Threads Terms|Privacy Policy|Cookie Policy|Report a problem)$/i.test(
          line
        );
      if (isFooterLine) {
        if (filtered.length > 0) {
          break;
        }
        continue;
      }
      if (
        line === "스레드" ||
        line === "인기순" ||
        line === "활동 보기" ||
        /^조회\s+[\d.,]+(?:천|만)?회$/u.test(line) ||
        /^Threads에 가입하여 .*$/u.test(line) ||
        /^Threads에 가입해 .*$/u.test(line) ||
        /^Threads에 로그인 또는 가입하기$/u.test(line) ||
        /^사람들의 이야기를 확인하고 대화에 참여해보세요\.$/u.test(line) ||
        /^\d+\s*(초|분|시간|일|주|개월|년)$/u.test(line) ||
        /^[\d.,]+(?:천|만)?$/u.test(line) ||
        /^\d+\s*\/\s*\d+$/.test(line) ||
        line === "/"
      ) {
        continue;
      }
      if (BUNDLED_EXTRACTOR_CONFIG.noisePatterns.some((pattern) => line === pattern || line.startsWith(`${pattern} `))) {
        if (filtered.length > 0) {
          break;
        }
        continue;
      }
      filtered.push(line);
    }

    return filtered.join("\n\n").trim();
  };
    /*
    for (const line of lines) {
        if (
          line === "스레드" ||
          line === "인기순" ||
          line === "활동 보기" ||
          /^조회\s+[\d.,]+(?:천|만)?회$/u.test(line) ||
          /^Threads에 가입하여 .*$/u.test(line) ||
          /^Threads에 가입해 .*$/u.test(line) ||
          /^Threads에 로그인 또는 가입하기$/u.test(line) ||
          /^사람들의 이야기를 확인하고 대화에 참여해보세요\.$/u.test(line) ||
          /^\d+\s*(초|분|시간|일|주|개월|년)$/u.test(line) ||
          /^[\d.,]+(?:천|만)?$/u.test(line) ||
          /^\d+\s*\/\s*\d+$/u.test(line) ||
          line === "/"
        ) {
          return false;
        }
        if (BUNDLED_EXTRACTOR_CONFIG.noisePatterns.some((pattern) => line === pattern || line.startsWith(`${pattern} `))) {
          return false;
        }
        return true;
      })
      .join("\n\n")
      .trim();
    */

  const normalizedSourceUrl = normalizeThreadsUrl(sourceUrl);
  const sourceShortcode = extractShortcode(normalizedSourceUrl);
  const sourceAuthor = extractAuthorFromUrl(normalizedSourceUrl);
  const pageUrl = page.url() || sourceUrl;
  const canonicalCandidate =
    safeText(await page.locator('link[rel="canonical"]').first().getAttribute("href").catch(() => null)) ||
    safeText(await page.locator('meta[property="og:url"]').first().getAttribute("content").catch(() => null)) ||
    pageUrl;

  let bodyText = "";
  try {
    bodyText = await page.locator("body").innerText();
  } catch {
    bodyText = "";
  }

  const anchorHandles = await page.locator("a").elementHandles();
  const hrefCandidates: string[] = [];
  for (const anchorHandle of anchorHandles) {
    const href = safeText(await anchorHandle.getAttribute("href").catch(() => null));
    if (!href || !href.includes("/post/")) {
      continue;
    }
    try {
      hrefCandidates.push(normalizeThreadsUrl(new URL(href, pageUrl).toString()));
    } catch {
      continue;
    }
  }
  await Promise.all(anchorHandles.map((anchorHandle) => anchorHandle.dispose().catch(() => undefined)));

  const canonicalUrl = normalizeThreadsUrl(canonicalCandidate);
  const pageMatchedSource = sourceShortcode
    ? matchesThreadsShortcode(canonicalUrl, normalizedSourceUrl)
    : canonicalUrl === normalizedSourceUrl;
  const blockedByAuth = looksLikeLoggedOutThreadsPage(bodyText) && (!isThreadsPostUrl(canonicalUrl) || !pageMatchedSource);
  const relatedUrl =
    pageMatchedSource && !blockedByAuth && isThreadsPostUrl(canonicalUrl)
      ? dedupeStrings(hrefCandidates).find((href) => href !== canonicalUrl) ?? null
      : null;
  const publishedAt = safeText(await page.locator("time").first().getAttribute("datetime").catch(() => null)) || null;

  return {
    canonicalUrl,
    relatedUrl,
    text: cleanLines(bodyText),
    publishedAt,
    pageMatchedSource,
    blockedByAuth
  };
}

async function buildSimpleExtractedPost(
  snapshot: BrowserSnapshot,
  canonicalOverride?: string | null
): Promise<ExtractedPost | null> {
  const canonicalUrl = safeText(canonicalOverride || snapshot.canonicalUrl);
  const text = safeText(snapshot.text);
  if (!canonicalUrl || !text) {
    return null;
  }

  const author = extractAuthorFromUrl(canonicalUrl);

  const partial: Omit<ExtractedPost, "contentHash"> = {
    canonicalUrl,
    shortcode: extractShortcode(canonicalUrl),
    author,
    title: extractTitleExcerpt(text, author, 38) || author,
    text,
    publishedAt: snapshot.publishedAt,
    capturedAt: new Date().toISOString(),
    sourceType: "text",
    imageUrls: [],
    videoUrl: null,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: snapshot.relatedUrl,
    thumbnailUrl: null,
    authorReplies: [],
    extractorVersion: `${BUNDLED_EXTRACTOR_CONFIG.version}-browser-snapshot`
  };

  return {
    ...partial,
    contentHash: await hashResolvedPost(partial)
  };
}

export async function resolveTargetPostWithBrowser(mentionUrl: string): Promise<ExtractedPost | null> {
  const normalizedMentionUrl = safeText(mentionUrl);
  if (!normalizedMentionUrl) {
    return null;
  }

  const runtime = await openRuntime();
  if (!runtime) {
    return null;
  }

  const timeoutMs = readBrowserTimeoutMs();
  const hydrateWaitMs = readHydrateWaitMs();
  let page: Page | null = null;
  try {
    page = await runtime.context.newPage();
    page.setDefaultTimeout(timeoutMs);
    page.setDefaultNavigationTimeout(timeoutMs);

    await page.goto(normalizedMentionUrl, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    if (hydrateWaitMs > 0) {
      await page.waitForTimeout(hydrateWaitMs);
    }

    const currentSnapshot = await extractBrowserSnapshot(page, normalizedMentionUrl);
    if (!currentSnapshot.pageMatchedSource || currentSnapshot.blockedByAuth || !isThreadsPostUrl(currentSnapshot.canonicalUrl)) {
      return null;
    }
    const currentPost =
      (await extractRenderedPost(page, normalizedMentionUrl).catch(() => null)) ??
      (await buildSimpleExtractedPost(currentSnapshot));
    const relatedUrl = safeText(currentSnapshot.relatedUrl);
    if (!relatedUrl) {
      return null;
    }

    if (normalizeThreadsUrl(relatedUrl) === normalizeThreadsUrl(normalizedMentionUrl)) {
      return null;
    }
    const currentPostText = safeText(currentPost?.text);
    const canReuseCurrentPost =
      currentPostText && !currentSnapshot.blockedByAuth && !/log in or sign up for threads|로그인하여 더 많은 답글/i.test(currentPostText);

    try {
      await page.goto(relatedUrl, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      if (hydrateWaitMs > 0) {
        await page.waitForTimeout(hydrateWaitMs);
      }

      const resolvedSnapshot = await extractBrowserSnapshot(page, relatedUrl);
      const resolvedTargetMatchesRelated = normalizeThreadsUrl(resolvedSnapshot.canonicalUrl) === normalizeThreadsUrl(relatedUrl);
      const resolvedTargetPost =
        resolvedTargetMatchesRelated && !resolvedSnapshot.blockedByAuth && isThreadsPostUrl(resolvedSnapshot.canonicalUrl)
          ? ((await extractRenderedPost(page, relatedUrl).catch(() => null)) ??
            (await buildSimpleExtractedPost(resolvedSnapshot)))
          : null;
      const resolvedTargetText = safeText(resolvedTargetPost?.text);
      if (resolvedTargetText && resolvedTargetPost) {
        return resolvedTargetPost;
      }
    } catch {
      // Fall through to current-post fallback.
    }

    if (!canReuseCurrentPost || !currentPost) {
      return null;
    }

    return {
      ...currentPost,
      canonicalUrl: relatedUrl,
      shortcode: extractShortcode(relatedUrl) || currentPost.shortcode,
      author: extractAuthorFromUrl(relatedUrl) || currentPost.author,
      repliedToUrl: null
    };
  } catch {
    return null;
  } finally {
    await page?.close().catch(() => undefined);
    await runtime.close().catch(() => undefined);
  }
}
