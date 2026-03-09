import { BUNDLED_EXTRACTOR_CONFIG } from "./config";
import type { ExtractedPost, ExtractorConfig } from "./types";

const THREADS_PERMALINK_RE = /^https:\/\/www\.threads\.(?:com|net)\/@[^/]+\/post\/[^/?#]+/i;

export function isSupportedPermalink(url: string): boolean {
  return THREADS_PERMALINK_RE.test(url);
}

export function normalizeThreadsUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.search = "";
  parsed.hostname = "www.threads.com";
  parsed.pathname = parsed.pathname.replace(/(\/@[^/]+\/post\/[^/]+)\/media(?:\/.*)?$/i, "$1");

  return parsed.toString().replace(/\/$/, "");
}

export function extractShortcode(url: string): string {
  const match = normalizeThreadsUrl(url).match(/\/post\/([^/?#]+)/i);
  return match?.[1] ?? "";
}

export function extractAuthorFromUrl(url: string): string {
  const match = normalizeThreadsUrl(url).match(/\/@([^/]+)/i);
  return match?.[1] ?? "unknown";
}

export function unwrapExternalUrl(url: string): string | null {
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
}

export function sanitizeFilenamePart(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/[.!?。！？]+$/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function extractFirstSentence(text: string): string {
  const normalized = decodeEscapedJsonString(text).trim();
  if (!normalized) {
    return "";
  }

  const firstBlock = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstBlock) {
    return "";
  }

  const sentenceMatch = firstBlock.match(/^(.+?[.!?。！？])(?:\s|$)/u);
  return (sentenceMatch?.[1] ?? firstBlock).trim();
}

export function buildArchiveBaseName(pattern: string, post: ExtractedPost): string {
  const date = (post.publishedAt ?? post.capturedAt).slice(0, 10);
  const firstSentence = extractFirstSentence(post.text) || post.title || post.shortcode;
  const resolved = pattern
    .replaceAll("{date}", sanitizeFilenamePart(date))
    .replaceAll("{author}", sanitizeFilenamePart(post.author))
    .replaceAll("{first_sentence}", sanitizeFilenamePart(firstSentence))
    .replaceAll("{shortcode}", sanitizeFilenamePart(post.shortcode));

  return resolved || `${sanitizeFilenamePart(post.author)}_${sanitizeFilenamePart(firstSentence)}`;
}

export function buildZipFilename(pattern: string, post: ExtractedPost): string {
  return `${buildArchiveBaseName(pattern, post)}.zip`;
}

export function buildMarkdownFilename(pattern: string, post: ExtractedPost): string {
  return `${buildArchiveBaseName(pattern, post)}.md`;
}

export function dedupeStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

export function decodeEscapedJsonString(value: string): string {
  let current = value;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!/\\u[0-9a-fA-F]{4}|\\[nrt"\\/]/.test(current)) {
      return current;
    }

    try {
      const parsed = JSON.parse(`"${current}"`) as string;
      if (parsed === current) {
        return current;
      }
      current = parsed;
      continue;
    } catch {
      current = current
        .replaceAll("\\n", "\n")
        .replaceAll("\\r", "\r")
        .replaceAll("\\t", "\t")
        .replaceAll('\\"', '"')
        .replaceAll("\\\\", "\\");
    }
  }

  return current;
}

export function cleanTextLines(text: string, author: string, config: ExtractorConfig = BUNDLED_EXTRACTOR_CONFIG): string {
  const lines = dedupeStrings(
    text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
  );

  const filtered: string[] = [];
  for (const line of lines) {
    if (line === author || line === `@${author}`) {
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
      break;
    }

    if (/^\d+\s*(초|분|시간|일|주|개월|년)$/.test(line)) {
      continue;
    }

    if (/^[\d.,]+(?:천|만)?$/u.test(line) || /^\d+\s*\/\s*\d+$/u.test(line) || line === "/") {
      continue;
    }

    filtered.push(line);
  }

  return filtered.join("\n\n").trim();
}

export async function hashPost(post: Omit<ExtractedPost, "contentHash">): Promise<string> {
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

export async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
