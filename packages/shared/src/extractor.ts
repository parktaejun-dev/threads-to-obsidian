import { BUNDLED_EXTRACTOR_CONFIG } from "./config";
import { t } from "./i18n";
import type { AuthorReply, ExtractedPost, ExtractorConfig, SourceType } from "./types";
import { cleanTextLines, decodeEscapedJsonString, dedupeStrings, extractAuthorFromUrl, extractShortcode, extractTitleExcerpt, hashPost, isSupportedPermalink, normalizeThreadsUrl, unwrapExternalUrl } from "./utils";

function getMeta(document: Document, selector: string): string | null {
  return document.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? null;
}

function getCanonicalUrl(document: Document, pageUrl: string): string {
  const pageShortcode = extractShortcode(pageUrl);

  if (pageShortcode && isSupportedPermalink(pageUrl)) {
    try {
      return normalizeThreadsUrl(pageUrl);
    } catch {
      // fall through to meta-based candidates
    }
  }

  const candidates = [
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
    getMeta(document, 'meta[property="og:url"]'),
    pageUrl
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      const normalized = normalizeThreadsUrl(candidate);
      if (!isSupportedPermalink(normalized)) {
        continue;
      }

      if (pageShortcode && extractShortcode(normalized) !== pageShortcode) {
        continue;
      }

      return normalized;
    } catch {
      continue;
    }
  }

  return normalizeThreadsUrl(pageUrl);
}

function getStructuredText(document: Document, shortcode: string): string | null {
  const candidates: Array<{ text: string; distance: number; length: number }> = [];
  for (const script of document.scripts) {
    const content = script.textContent;
    if (!content || !content.includes(shortcode) || !content.includes('"text"')) {
      continue;
    }

    const shortcodeIndexes = Array.from(content.matchAll(new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).map(
      (match) => match.index ?? 0
    );
    const matches = content.matchAll(/"text":"((?:[^"\\]|\\.)+)"/g);
    for (const match of matches) {
      const raw = match[1];
      const decoded = decodeEscapedJsonString(raw);
      if (decoded.length > 12) {
        const matchIndex = match.index ?? 0;
        const distance =
          shortcodeIndexes.length > 0 ? Math.min(...shortcodeIndexes.map((index) => Math.abs(index - matchIndex))) : Number.MAX_SAFE_INTEGER;
        candidates.push({
          text: decoded,
          distance,
          length: decoded.length
        });
      }
    }
  }

  return (
    candidates
      .sort((a, b) => {
        if (Math.abs(a.length - b.length) > 20) {
          return b.length - a.length;
        }
        return a.distance - b.distance;
      })[0]
      ?.text ?? null
  );
}

function countActionButtons(root: HTMLElement): number {
  return Array.from(root.querySelectorAll<HTMLButtonElement>("button")).filter((button) =>
    /(좋아요|댓글|리포스트|공유하기)/u.test((button.getAttribute("aria-label") ?? button.textContent ?? "").trim())
  ).length;
}

function countPermalinkLinks(root: HTMLElement): number {
  return dedupeStrings(
    Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]')).map((anchor) => {
      try {
        return normalizeThreadsUrl(anchor.href);
      } catch {
        return null;
      }
    })
  ).length;
}

function scorePostBlockCandidate(root: HTMLElement): number {
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
}

function findPostBlockFromAnchor(anchor: HTMLAnchorElement): HTMLElement | null {
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
}

function findPostRoot(document: Document, canonicalUrl: string, shortcode: string): HTMLElement | null {
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
}

function getVisibleImages(root: HTMLElement | null, author: string): string[] {
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

      return width >= 140 || height >= 140;
    })
    .map((img) => img.currentSrc || img.src);

  if (urls.length > 0) {
    return dedupeStrings(urls);
  }

  return [];
}

function getVideoUrl(root: ParentNode | null): string | null {
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
}

function getVideoPosterUrl(root: ParentNode | null): string | null {
  if (!root) {
    return null;
  }

  const poster = root.querySelector<HTMLVideoElement>("video")?.getAttribute("poster")?.trim();
  return poster && /^https?:\/\//i.test(poster) ? poster : null;
}

function getExternalUrl(root: HTMLElement | null): string | null {
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
}

function getEmbeddedPostUrls(document: Document, canonicalUrl: string): string[] {
  const html = document.documentElement.innerHTML;
  const matches = html.matchAll(
    /"post":\{[\s\S]*?"user":\{[\s\S]*?"username":"([^"]+)"[\s\S]*?"code":"([A-Za-z0-9_-]+)"/g
  );
  const urls: string[] = [];

  for (const match of matches) {
    const username = match[1]?.trim();
    const code = match[2]?.trim();
    if (!username || !code) {
      continue;
    }

    try {
      const normalized = normalizeThreadsUrl(`https://www.threads.com/@${username}/post/${code}`);
      urls.push(normalized);
    } catch {
      // Ignore malformed embedded post entries.
    }
  }

  return dedupeStrings(urls);
}

function getRelatedPostUrls(
  root: HTMLElement | null,
  document: Document,
  canonicalUrl: string
): { quotedPostUrl: string | null; repliedToUrl: string | null } {
  if (!root) {
    const embeddedUrls = getEmbeddedPostUrls(document, canonicalUrl);
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
    const embeddedUrls = getEmbeddedPostUrls(document, canonicalUrl);
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
}

function getPublishedAt(root: HTMLElement | null, document: Document, shortcode: string): string | null {
  const rootTime = root?.querySelector<HTMLTimeElement>("time")?.getAttribute("datetime");
  if (rootTime) {
    return rootTime;
  }

  if (!shortcode) {
    return null;
  }

  const permalinkTime = document.querySelector<HTMLAnchorElement>(`a[href*="/post/${shortcode}"] time`);
  return permalinkTime?.getAttribute("datetime") ?? null;
}

function detectSourceType(imageUrls: string[], scope: ParentNode | null, videoUrl: string | null, videoPosterUrl: string | null): SourceType {
  if (scope?.querySelector("video") && (videoUrl || videoPosterUrl)) {
    return "video";
  }

  if (imageUrls.length > 0) {
    return "image";
  }

  return "text";
}

function trimKeyword(keyword: string, maxLength = 38): string {
  if (keyword.length <= maxLength) {
    return keyword;
  }

  const sliced = keyword.slice(0, maxLength);
  const boundary = Math.max(sliced.lastIndexOf(" "), sliced.lastIndexOf(","), sliced.lastIndexOf("·"));
  return (boundary >= 16 ? sliced.slice(0, boundary) : sliced).trim();
}

function normalizeTitleSource(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/^\(\d+\)\s*/u, "")
    .replace(/^\d+\s*\/\s*/u, "")
    .replace(/^\[[^\]]+\]\s*/u, "")
    .replace(/\s+\d+\s*\/\s+.*$/u, "")
    .replace(/\(부제\s*-\s*[^)]*\)/u, "")
    .trim();
}

function extractQuotedKeyword(line: string): string | null {
  const match = line.match(/["'“”‘’「『]([^"'“”‘’「」『』]{2,40})["'“”‘’」』]\s*([가-힣A-Za-z0-9+/#&._ -]{0,24})/u);
  if (!match) {
    return null;
  }

  const phrase = match[1].trim();
  const tail = match[2].trim().replace(/^[,:;]\s*/, "");
  if (!tail) {
    return phrase;
  }

  if (/^[은는이가을를와과도의로로서로써]/u.test(tail)) {
    return null;
  }

  return `${phrase} ${tail}`.trim();
}

function deriveKeyword(raw: string): string | null {
  const normalized = normalizeTitleSource(raw);
  if (!normalized) {
    return null;
  }

  const quoted = extractQuotedKeyword(normalized);
  const candidate = quoted ?? normalized.split(/[.!?]/)[0]?.split(/\s+-\s+/)[0]?.split(/\s+[•·]\s+/)[0] ?? normalized;

  const cleaned = candidate
    .replace(/[,:;]\s*(꼭|바로|지금).+$/u, "")
    .replace(/\s+(꼭|바로|지금)\s+.+$/u, "")
    .replace(/\s+(입니다|였습니다|합니다|입니다만|보여집니다|같습니다)\.?$/u, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned ? trimKeyword(cleaned) : null;
}

function getPostTitle(_document: Document, author: string, text: string, _externalUrl: string | null): string {
  const title = extractTitleExcerpt(text, author, 38);
  if (title) {
    return trimKeyword(title);
  }

  return author;
}

function extractDomText(root: HTMLElement | null, author: string, config: ExtractorConfig): string {
  if (!root) {
    return "";
  }

  const nodeFilter = root.ownerDocument.defaultView?.NodeFilter;
  const walker = root.ownerDocument.createTreeWalker(root, nodeFilter?.SHOW_TEXT ?? 4);
  const lines: string[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    const text = currentNode.textContent?.trim();
    const parent = currentNode.parentElement;
    if (text && parent && !parent.closest("button, time, a, script, style, svg, video, picture, figure, img")) {
      lines.push(text);
    }

    currentNode = walker.nextNode();
  }

  return cleanTextLines(lines.join("\n\n"), author, config);
}

function isNodeAfter(referenceNode: Node, targetNode: Node): boolean {
  const nodeCtor = referenceNode.ownerDocument?.defaultView?.Node;
  if (!nodeCtor) {
    return false;
  }

  return Boolean(referenceNode.compareDocumentPosition(targetNode) & nodeCtor.DOCUMENT_POSITION_FOLLOWING);
}

function extractAuthorReplies(document: Document, root: HTMLElement | null, author: string, canonicalUrl: string, config: ExtractorConfig): AuthorReply[] {
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

  const replies: AuthorReply[] = [];
  let startedChain = false;

  for (const candidate of orderedBlocks) {
    if (candidate.blockAuthor !== author) {
      if (startedChain) {
        break;
      }
      continue;
    }

    startedChain = true;
    const text = extractDomText(candidate.block, author, config);
    if (!text || text.startsWith("이전 글")) {
      continue;
    }

    const imageUrls = getVisibleImages(candidate.block, author);
    const videoUrl = getVideoUrl(candidate.block);
    const videoPosterUrl = getVideoPosterUrl(candidate.block);
    const sourceType = detectSourceType(imageUrls, candidate.block, videoUrl, videoPosterUrl);
    replies.push({
      author: candidate.blockAuthor,
      canonicalUrl: candidate.url,
      shortcode: extractShortcode(candidate.url),
      text,
      publishedAt: getPublishedAt(candidate.block, document, extractShortcode(candidate.url)),
      sourceType,
      imageUrls,
      videoUrl,
      externalUrl: getExternalUrl(candidate.block),
      thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? imageUrls[0] ?? null : imageUrls[0] ?? null
    });
  }

  return replies;
}

export async function extractPostFromDocument(document: Document, pageUrl: string, config: ExtractorConfig = BUNDLED_EXTRACTOR_CONFIG): Promise<ExtractedPost> {
  if (!isSupportedPermalink(pageUrl)) {
    throw new Error((await t()).errNotPermalink);
  }

  const canonicalUrl = getCanonicalUrl(document, pageUrl);
  const shortcode = extractShortcode(canonicalUrl);
  const author = extractAuthorFromUrl(canonicalUrl);
  const root = findPostRoot(document, canonicalUrl, shortcode);
  const structuredText = getStructuredText(document, shortcode);
  const ogDescription = getMeta(document, 'meta[property="og:description"]');
  const domText = extractDomText(root, author, config);
  const rawText = domText || structuredText || ogDescription || "";
  const text = cleanTextLines(rawText, author, config) || ogDescription || "";
  if (!text) {
    throw new Error((await t()).errPostContentNotFound);
  }
  const ogThumbnailUrl = getMeta(document, 'meta[property="og:image"]');
  const imageUrls = getVisibleImages(root, author);
  const videoUrl = getVideoUrl(root);
  const videoPosterUrl = getVideoPosterUrl(root);
  const externalUrl = getExternalUrl(root);
  const related = getRelatedPostUrls(root, document, canonicalUrl);
  const title = getPostTitle(document, author, text, externalUrl);
  const capturedAt = new Date().toISOString();
  const sourceType = detectSourceType(imageUrls, root, videoUrl, videoPosterUrl);
  const authorReplies = extractAuthorReplies(document, root, author, canonicalUrl, config);
  const partial: Omit<ExtractedPost, "contentHash"> = {
    canonicalUrl,
    shortcode,
    author,
    title,
    text,
    publishedAt: getPublishedAt(root, document, shortcode),
    capturedAt,
    sourceType,
    imageUrls,
    videoUrl,
    externalUrl,
    quotedPostUrl: related.quotedPostUrl,
    repliedToUrl: related.repliedToUrl,
    thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? ogThumbnailUrl ?? imageUrls[0] ?? null : ogThumbnailUrl,
    authorReplies,
    extractorVersion: config.version
  };

  return {
    ...partial,
    contentHash: await hashPost(partial)
  };
}
