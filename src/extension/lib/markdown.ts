import type { AiOrganizationResult, ExtractedPost, FrontmatterPrimitive, FrontmatterValue } from "./types";
import { t } from "./i18n";

export interface MarkdownVideoRef {
  thumbnail: string | null;
  file: string | null;
}

export interface MarkdownMediaRefs {
  postImages: string[];
  postVideo: MarkdownVideoRef | null;
  replyImages: string[][];
  replyVideos: Array<MarkdownVideoRef | null>;
}

function formatYamlStringValue(value: string | null): string {
  if (!value) {
    return "null";
  }

  return JSON.stringify(value);
}

function formatYamlDateValue(value: string | null): string {
  if (!value) {
    return "null";
  }

  return value;
}

function formatYamlString(value: string): string {
  return JSON.stringify(value);
}

function formatFrontmatterPrimitive(value: FrontmatterPrimitive): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return formatYamlString(value);
  }

  return String(value);
}

function renderFrontmatterField(key: string, value: FrontmatterValue): string[] {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [`${key}: []`];
    }

    return [`${key}:`, ...value.map((item) => `  - ${formatFrontmatterPrimitive(item)}`)];
  }

  return [`${key}: ${formatFrontmatterPrimitive(value)}`];
}

function renderImageBlock(refs: string[], labelPrefix: string): string[] {
  const lines: string[] = [];
  for (const [index, ref] of refs.entries()) {
    lines.push(`![${labelPrefix} ${index + 1}](${ref})`, "");
  }
  return lines;
}

function renderVideoBlock(videoRef: MarkdownVideoRef | null, canonicalUrl: string, msg: Awaited<ReturnType<typeof t>>): string[] {
  if (!videoRef) {
    return [];
  }

  const lines: string[] = [`## ${msg.mdVideoLabel}`, "", `${msg.mdVideoOnThreads}: ${canonicalUrl}`];

  if (videoRef.file && !/^https?:\/\//i.test(videoRef.file)) {
    lines.push(`${msg.mdSavedVideoFile}: ${videoRef.file}`);
  }

  lines.push("");

  if (videoRef.thumbnail) {
    lines.push(`![${msg.mdVideoThumbnailLabel}](${videoRef.thumbnail})`, "");
  }

  return lines;
}

async function renderReplySection(post: ExtractedPost, mediaRefs: MarkdownMediaRefs): Promise<string[]> {
  if (post.authorReplies.length === 0) {
    return [];
  }

  const msg = await t();
  const section: string[] = [`## ${msg.mdReplySection}`, ""];

  post.authorReplies.forEach((reply, index) => {
    section.push(`### ${msg.mdReplyLabel} ${index + 1}`, "", `${msg.mdSource}: ${reply.canonicalUrl}`);
    section.push(`${msg.mdAuthor}: @${reply.author}`);

    if (reply.publishedAt) {
      section.push(`${msg.mdPublishedAt}: ${reply.publishedAt}`);
    }

    if (reply.externalUrl) {
      section.push(`${msg.mdExternalLink}: ${reply.externalUrl}`);
    }

    section.push("", reply.text.trim(), "");

    const replyVideoRef = mediaRefs.replyVideos[index] ?? null;
    if (reply.sourceType === "video") {
      section.push(`${msg.mdVideoOnThreads}: ${reply.canonicalUrl}`);
      if (replyVideoRef?.file && !/^https?:\/\//i.test(replyVideoRef.file)) {
        section.push(`${msg.mdSavedVideoFile}: ${replyVideoRef.file}`);
      }
      section.push("");

      if (replyVideoRef?.thumbnail) {
        section.push(`![${msg.mdVideoThumbnailLabel}](${replyVideoRef.thumbnail})`, "");
      }
    }

    section.push(...renderImageBlock(mediaRefs.replyImages[index] ?? [], `${msg.mdReplyImageLabel} ${index + 1}`));
  });

  return section;
}

export async function renderMarkdown(
  post: ExtractedPost,
  mediaRefs: MarkdownMediaRefs,
  warning: string | null,
  aiResult: AiOrganizationResult | null = null
): Promise<string> {
  const msg = await t();
  const hasImages = post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
  const hasExternalUrl = Boolean(post.externalUrl || post.authorReplies.some((reply) => reply.externalUrl));
  const tags = Array.from(new Set(["threads", ...(aiResult?.tags ?? [])]));
  const frontmatter = [
    "---",
    `title: ${formatYamlStringValue(post.title)}`,
    `author: ${formatYamlStringValue(post.author)}`,
    ...renderFrontmatterField("tags", tags),
    ...(aiResult?.summary ? renderFrontmatterField("summary", aiResult.summary) : []),
    `canonical_url: ${formatYamlStringValue(post.canonicalUrl)}`,
    `shortcode: ${formatYamlStringValue(post.shortcode)}`,
    `published_at: ${formatYamlDateValue(post.publishedAt)}`,
    `captured_at: ${formatYamlDateValue(post.capturedAt)}`,
    `source_type: ${formatYamlStringValue(post.sourceType)}`,
    ...(post.sourceType === "video" && post.thumbnailUrl ? renderFrontmatterField("thumbnail_url", post.thumbnailUrl) : []),
    ...(post.sourceType === "video" && post.videoUrl ? renderFrontmatterField("video_url", post.videoUrl) : []),
    `has_images: ${hasImages}`,
    `has_external_url: ${hasExternalUrl}`,
    `quoted_post_url: ${formatYamlStringValue(post.quotedPostUrl)}`,
    `replied_to_url: ${formatYamlStringValue(post.repliedToUrl)}`,
    `author_reply_count: ${post.authorReplies.length}`,
    ...Object.entries(aiResult?.frontmatter ?? {}).flatMap(([key, value]) => renderFrontmatterField(key, value)),
    "---",
    ""
  ];

  const body: string[] = [`# ${post.title}`, "", `${msg.mdSource}: ${post.canonicalUrl}`, `${msg.mdAuthor}: @${post.author}`];

  if (post.publishedAt) {
    body.push(`${msg.mdPublishedAt}: ${post.publishedAt}`);
  }

  if (post.externalUrl) {
    body.push(`${msg.mdExternalLink}: ${post.externalUrl}`);
  }

  if (warning) {
    body.push(`${msg.mdWarning}: ${warning}`);
  }

  if (aiResult?.summary) {
    body.push("", `## ${msg.mdSummary}`, "", aiResult.summary, "");
  } else {
    body.push("");
  }

  body.push(post.text.trim(), "");

  if (post.sourceType === "video") {
    body.push(...renderVideoBlock(mediaRefs.postVideo, post.canonicalUrl, msg));
  }

  if (mediaRefs.postImages.length > 0) {
    body.push(`## ${msg.mdImageLabel}`, "");
    body.push(...renderImageBlock(mediaRefs.postImages, msg.mdImageLabel));
  }

  body.push(...(await renderReplySection(post, mediaRefs)));

  return [...frontmatter, ...body].join("\n").trimEnd() + "\n";
}
