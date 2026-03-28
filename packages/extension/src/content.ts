import { extractPostFromDocument } from "./lib/extractor";
import { waitForReplySurface } from "./lib/reply-surface";
import type { ExtractPostRequest, PingContentScriptRequest } from "./lib/types";
import { extractShortcode, normalizeThreadsUrl } from "./lib/utils";

function getMetaContent(selector: string): string | null {
  return document.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? null;
}

function getCanonicalCandidate(): string | null {
  return document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? getMetaContent('meta[property="og:url"]');
}

function matchesExpectedPermalink(candidate: string | null, expectedUrl: string): boolean {
  if (!candidate) {
    return false;
  }

  try {
    return normalizeThreadsUrl(candidate) === normalizeThreadsUrl(expectedUrl);
  } catch {
    return false;
  }
}

async function waitForPostSurface(expectedUrl: string, timeoutMs = 1500): Promise<void> {
  const shortcode = extractShortcode(expectedUrl);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const hasPermalinkAnchor = shortcode ? Boolean(document.querySelector(`a[href*="/post/${shortcode}"]`)) : false;
    if (hasPermalinkAnchor || matchesExpectedPermalink(getCanonicalCandidate(), expectedUrl)) {
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 150));
  }
}

chrome.runtime.onMessage.addListener((request: ExtractPostRequest | PingContentScriptRequest, _sender, sendResponse) => {
  if (request.type === "ping-content-script") {
    sendResponse({ ok: true });
    return false;
  }

  if (request.type !== "extract-post") {
    return false;
  }

  void waitForPostSurface(location.href)
    .then(() => waitForReplySurface(document, location.href))
    .then(() => extractPostFromDocument(document, location.href, request.config))
    .then((post) => sendResponse(post))
    .catch((error) => {
      sendResponse({ __error: error instanceof Error ? error.message : "Extraction failed." });
    });

  return true;
});
