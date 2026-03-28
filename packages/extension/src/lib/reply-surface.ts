import { dedupeStrings, extractShortcode, normalizeThreadsUrl } from "./utils";

function parseCompactNumber(raw: string): number | null {
  const normalized = raw.replaceAll(",", "").trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(천|만)?$/u);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  const unit = match[2];
  if (Number.isNaN(value)) {
    return null;
  }

  if (unit === "천") {
    return Math.round(value * 1000);
  }

  if (unit === "만") {
    return Math.round(value * 10000);
  }

  return Math.round(value);
}

export function countUniquePermalinkUrls(document: Document): number {
  return dedupeStrings(
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/post/"]')).map((anchor) => {
      try {
        return normalizeThreadsUrl(anchor.href);
      } catch {
        return null;
      }
    })
  ).length;
}

export function getCommentCountHint(document: Document, expectedUrl: string): number | null {
  const shortcode = extractShortcode(expectedUrl);
  const permalinkAnchor = shortcode ? document.querySelector<HTMLAnchorElement>(`a[href*="/post/${shortcode}"]`) : null;
  const scope = permalinkAnchor?.parentElement?.parentElement ?? document.body;
  const controls = Array.from(scope.querySelectorAll<HTMLElement>("button, [role='button']"));

  for (const control of controls) {
    const label = (control.getAttribute("aria-label") ?? control.textContent ?? "").replace(/\s+/g, " ").trim();
    const match = label.match(/댓글\s*([\d.,]+(?:천|만)?)/u);
    if (!match) {
      continue;
    }

    return parseCompactNumber(match[1]);
  }

  return null;
}

function getLoadingMarkerCount(document: Document): number {
  const bodyText = document.body.innerText ?? document.body.textContent ?? "";
  return (bodyText.match(/읽어들이는 중\.\.\./g) ?? []).length;
}

function getBodyText(document: Document): string {
  return document.body.innerText ?? document.body.textContent ?? "";
}

export async function waitForReplySurface(document: Document, expectedUrl: string, timeoutMs = 4500): Promise<void> {
  const commentCount = getCommentCountHint(document, expectedUrl);
  if (!commentCount || commentCount <= 0) {
    return;
  }

  const initialPermalinkCount = countUniquePermalinkUrls(document);
  const deadline = Date.now() + timeoutMs;
  let sawLoadingMarker = getLoadingMarkerCount(document) > 0;
  const setTimer = document.defaultView?.setTimeout.bind(document.defaultView) ?? globalThis.setTimeout;

  while (Date.now() < deadline) {
    const nextPermalinkCount = countUniquePermalinkUrls(document);
    if (nextPermalinkCount > initialPermalinkCount) {
      return;
    }

    const loadingMarkerCount = getLoadingMarkerCount(document);
    if (loadingMarkerCount > 0) {
      sawLoadingMarker = true;
    } else if (sawLoadingMarker) {
      return;
    }

    if (getBodyText(document).includes("로그인하여 더 많은 답글을 확인해보세요.")) {
      return;
    }

    await new Promise((resolve) => setTimer(resolve, 250));
  }
}
