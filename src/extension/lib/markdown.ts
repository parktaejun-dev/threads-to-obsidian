import type { ExtractedPost } from "./types";
import { t } from "./i18n";

export interface MarkdownImageRefs {
  postImages: string[];
  replyImages: string[][];
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

function renderImageBlock(refs: string[], labelPrefix: string): string[] {
  const lines: string[] = [];
  for (const [index, ref] of refs.entries()) {
    lines.push(`![${labelPrefix} ${index + 1}](${ref})`, "");
  }
  return lines;
}

async function renderReplySection(post: ExtractedPost, imageRefs: MarkdownImageRefs): Promise<string[]> {
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

    section.push(...renderImageBlock(imageRefs.replyImages[index] ?? [], `${msg.mdReplyImageLabel} ${index + 1}`));
  });

  return section;
}

export async function renderMarkdown(post: ExtractedPost, imageRefs: MarkdownImageRefs, warning: string | null): Promise<string> {
  const msg = await t();
  const hasImages = post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
  const hasExternalUrl = Boolean(post.externalUrl || post.authorReplies.some((reply) => reply.externalUrl));
  const frontmatter = [
    "---",
    `title: ${formatYamlStringValue(post.title)}`,
    `author: ${formatYamlStringValue(post.author)}`,
    "tags: [threads]",
    `canonical_url: ${formatYamlStringValue(post.canonicalUrl)}`,
    `shortcode: ${formatYamlStringValue(post.shortcode)}`,
    `published_at: ${formatYamlDateValue(post.publishedAt)}`,
    `captured_at: ${formatYamlDateValue(post.capturedAt)}`,
    `source_type: ${formatYamlStringValue(post.sourceType)}`,
    `has_images: ${hasImages}`,
    `has_external_url: ${hasExternalUrl}`,
    `quoted_post_url: ${formatYamlStringValue(post.quotedPostUrl)}`,
    `replied_to_url: ${formatYamlStringValue(post.repliedToUrl)}`,
    `author_reply_count: ${post.authorReplies.length}`,
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

  body.push("", post.text.trim(), "");

  if (imageRefs.postImages.length > 0) {
    body.push(`## ${msg.mdImageLabel}`, "");
    body.push(...renderImageBlock(imageRefs.postImages, msg.mdImageLabel));
  }

  body.push(...(await renderReplySection(post, imageRefs)));

  return [...frontmatter, ...body].join("\n").trimEnd() + "\n";
}
