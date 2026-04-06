import type { ArchiveOverride, ArchiveRecord, ArchiveView, FolderEntry, NotionArchiveExportInput } from "./types";

export interface ArchiveFilters {
  query: string;
  activeTag: string | null;
  activeFolderId: string | null;
}

export interface ArchiveAssetEntry {
  relativePath: string;
  remoteUrl: string;
  mimeType: string;
}

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function guessExtension(url: string, mimeType: string | null): string {
  const normalizedMime = safeText(mimeType).toLowerCase();
  if (normalizedMime.includes("png")) return "png";
  if (normalizedMime.includes("webp")) return "webp";
  if (normalizedMime.includes("gif")) return "gif";
  if (normalizedMime.includes("mp4")) return "mp4";
  if (normalizedMime.includes("jpeg")) return "jpg";

  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}

function guessMimeType(url: string): string {
  const extension = guessExtension(url, null);
  switch (extension) {
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    default:
      return "image/jpeg";
  }
}

export function buildInitials(displayName: string | null | undefined, handle: string | null | undefined): string {
  const name = safeText(displayName);
  if (name) {
    return name
      .split(/\s+/u)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  const normalizedHandle = safeText(handle).replace(/^@+/u, "");
  return normalizedHandle.slice(0, 2).toUpperCase() || "SS";
}

export function parseTagInput(value: string): string[] {
  const hashtagMatches = value.match(/#[\p{L}\p{N}_-]+/gu);
  const rawTags =
    hashtagMatches && hashtagMatches.length > 0
      ? hashtagMatches.map((match) => match.slice(1))
      : value.split(/[\s,]+/u);
  const normalized = new Set<string>();
  for (const rawTag of rawTags) {
    const tag = rawTag.trim().replace(/^#+/u, "").toLowerCase();
    if (tag) {
      normalized.add(tag);
    }
    if (normalized.size >= 12) {
      break;
    }
  }
  return [...normalized];
}

export function formatTagInput(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(" ");
}

export function deriveArchiveTitle(record: ArchiveRecord, override?: ArchiveOverride | null): string {
  const preferred = safeText(override?.customTitle) || safeText(record.title);
  if (preferred) {
    return preferred;
  }

  const text = safeText(record.text);
  if (text) {
    return text.slice(0, 72);
  }

  return `Threads post by @${record.author}`;
}

export function mapArchiveViews(
  archives: ArchiveRecord[],
  overrides: Record<string, ArchiveOverride>,
  folderMap: Record<string, string>,
  folders: FolderEntry[]
): ArchiveView[] {
  const folderLookup = new Map(folders.map((folder) => [folder.id, folder.name]));
  return archives.map((archive) => {
    const override = overrides[archive.id];
    const folderId = folderMap[archive.id] ?? null;
    return {
      ...archive,
      displayTitle: deriveArchiveTitle(archive, override),
      noteText: override?.noteText ?? null,
      tags: override?.tags ?? [],
      folderId,
      folderName: folderId ? folderLookup.get(folderId) ?? null : null,
      overrideUpdatedAt: override?.updatedAt ?? null
    };
  });
}

export function buildArchiveSearchText(item: ArchiveView): string {
  const replies = item.authorReplies.map((reply) => reply.text).join("\n");
  return [
    item.displayTitle,
    item.text,
    item.author,
    item.noteText ?? "",
    item.tags.join(" "),
    item.folderName ?? "",
    item.markdownContent,
    replies
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

export function filterArchiveViews(items: ArchiveView[], filters: ArchiveFilters): ArchiveView[] {
  const query = safeText(filters.query).toLowerCase();
  return items.filter((item) => {
    if (filters.activeFolderId && item.folderId !== filters.activeFolderId) {
      return false;
    }
    if (filters.activeTag && !item.tags.includes(filters.activeTag)) {
      return false;
    }
    if (!query) {
      return true;
    }
    return buildArchiveSearchText(item).includes(query);
  });
}

export function summarizeTags(items: ArchiveView[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of new Set(item.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.tag.localeCompare(right.tag);
    });
}

export function summarizeFolderCounts(items: ArchiveView[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (!item.folderId) {
      continue;
    }
    counts[item.folderId] = (counts[item.folderId] ?? 0) + 1;
  }
  return counts;
}

export function sanitizeFilenameSegment(value: string, fallback = "threads-post"): string {
  const normalized = safeText(value)
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (normalized || fallback).slice(0, 80);
}

export function buildArchiveDirectoryName(item: ArchiveView): string {
  const stamp = safeText(item.savedAt).replace(/[-:TZ.]/g, "").slice(0, 12);
  return sanitizeFilenameSegment(`${item.displayTitle} ${stamp}`, `threads-${item.id.slice(0, 8)}`);
}

function appendAssetLines(lines: string[], label: string, urls: string[]): void {
  if (urls.length === 0) {
    return;
  }

  lines.push(`## ${label}`);
  for (const url of urls) {
    lines.push(`![](${url})`);
  }
  lines.push("");
}

export function buildArchiveAssetEntries(item: ArchiveView): ArchiveAssetEntry[] {
  const assets: ArchiveAssetEntry[] = [];
  item.imageUrls.forEach((url, index) => {
    assets.push({
      relativePath: `02. image-${String(index + 1).padStart(2, "0")}.${guessExtension(url, "image/jpeg")}`,
      remoteUrl: url,
      mimeType: guessMimeType(url)
    });
  });

  if (item.videoUrl) {
    assets.push({
      relativePath: `02. video.${guessExtension(item.videoUrl, "video/mp4")}`,
      remoteUrl: item.videoUrl,
      mimeType: guessMimeType(item.videoUrl)
    });
  }
  if (item.thumbnailUrl) {
    assets.push({
      relativePath: `02. video-thumb.${guessExtension(item.thumbnailUrl, "image/jpeg")}`,
      remoteUrl: item.thumbnailUrl,
      mimeType: guessMimeType(item.thumbnailUrl)
    });
  }

  item.authorReplies.forEach((reply, replyIndex) => {
    reply.imageUrls.forEach((url, imageIndex) => {
      assets.push({
        relativePath: `03. reply-${String(replyIndex + 1).padStart(2, "0")}-image-${String(imageIndex + 1).padStart(2, "0")}.${guessExtension(url, "image/jpeg")}`,
        remoteUrl: url,
        mimeType: guessMimeType(url)
      });
    });
    if (reply.videoUrl) {
      assets.push({
        relativePath: `03. reply-${String(replyIndex + 1).padStart(2, "0")}-video.${guessExtension(reply.videoUrl, "video/mp4")}`,
        remoteUrl: reply.videoUrl,
        mimeType: guessMimeType(reply.videoUrl)
      });
    }
    if (reply.thumbnailUrl) {
      assets.push({
        relativePath: `03. reply-${String(replyIndex + 1).padStart(2, "0")}-video-thumb.${guessExtension(reply.thumbnailUrl, "image/jpeg")}`,
        remoteUrl: reply.thumbnailUrl,
        mimeType: guessMimeType(reply.thumbnailUrl)
      });
    }
  });

  return assets;
}

export function buildArchiveMarkdown(
  item: ArchiveView,
  assetRefs: Record<string, string> = {}
): string {
  const lines: string[] = [];
  const title = item.displayTitle;
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`Source: ${item.canonicalUrl}`);
  lines.push(`Author: @${item.author}`);
  lines.push(`Saved: ${item.savedAt}`);
  if (item.publishedAt) {
    lines.push(`Published: ${item.publishedAt}`);
  }
  if (item.tags.length > 0) {
    lines.push(`Tags: ${item.tags.map((tag) => `#${tag}`).join(" ")}`);
  }
  if (item.quotedPostUrl) {
    lines.push(`Quoted post: ${item.quotedPostUrl}`);
  }
  if (item.repliedToUrl) {
    lines.push(`Reply target: ${item.repliedToUrl}`);
  }
  if (item.externalUrl) {
    lines.push(`External URL: ${item.externalUrl}`);
  }
  lines.push("");

  if (safeText(item.noteText)) {
    lines.push("## Note");
    lines.push(item.noteText ?? "");
    lines.push("");
  }

  lines.push("## Post");
  lines.push(item.text || "_No text captured._");
  lines.push("");

  const assetEntries = buildArchiveAssetEntries(item);
  const imageRefs = assetEntries
    .filter((asset) => asset.relativePath.startsWith("02. image-"))
    .map((asset) => assetRefs[asset.remoteUrl] ?? asset.remoteUrl);
  appendAssetLines(lines, "Media", imageRefs);

  const primaryVideo = assetEntries.find((asset) => asset.relativePath.startsWith("02. video."));
  if (primaryVideo) {
    lines.push("## Video");
    lines.push(`[Open video](${assetRefs[primaryVideo.remoteUrl] ?? primaryVideo.remoteUrl})`);
    lines.push("");
  }

  if (item.authorReplies.length > 0) {
    lines.push(`## Replies by @${item.author}`);
    lines.push("");
    item.authorReplies.forEach((reply, replyIndex) => {
      lines.push(`### Reply ${replyIndex + 1}`);
      if (reply.publishedAt) {
        lines.push(`Published: ${reply.publishedAt}`);
      }
      if (reply.canonicalUrl) {
        lines.push(`URL: ${reply.canonicalUrl}`);
      }
      lines.push(reply.text || "_No text captured._");
      lines.push("");

      reply.imageUrls.forEach((url) => {
        lines.push(`![](${assetRefs[url] ?? url})`);
      });
      if (reply.videoUrl) {
        lines.push(`[Open video](${assetRefs[reply.videoUrl] ?? reply.videoUrl})`);
      }
      if (reply.externalUrl) {
        lines.push(`[External URL](${reply.externalUrl})`);
      }
      lines.push("");
    });
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function toNotionArchiveExportInput(item: ArchiveView): NotionArchiveExportInput {
  return {
    archiveId: item.id,
    title: item.displayTitle,
    canonicalUrl: item.canonicalUrl,
    shortcode: item.shortcode,
    author: item.author,
    text: item.text,
    markdownContent: buildArchiveMarkdown(item),
    publishedAt: item.publishedAt,
    capturedAt: item.capturedAt,
    authorReplies: item.authorReplies,
    imageUrls: [...item.imageUrls],
    videoUrl: item.videoUrl,
    thumbnailUrl: item.thumbnailUrl,
    externalUrl: item.externalUrl,
    quotedPostUrl: item.quotedPostUrl,
    repliedToUrl: item.repliedToUrl,
    sourceType: item.sourceType,
    savedAt: item.savedAt,
    updatedAt: item.updatedAt
  };
}
