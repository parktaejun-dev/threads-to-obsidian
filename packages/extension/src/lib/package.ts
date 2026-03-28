import JSZip from "jszip";
import { organizePostWithAi } from "./llm";
import type { AiOrganizationResult, AiOrganizationSettings, ExtractedPost, PackagedResult } from "./types";
import { t } from "./i18n";
import { renderMarkdown, renderNotionMarkdown, type MarkdownMediaRefs } from "./markdown";
import { buildArchiveBaseName, buildPathPatternParts, buildZipFilename } from "./utils";

export interface ArchiveAssetFile {
  relativePath: string;
  blob: Blob;
}

export interface ArchiveBundle {
  archiveName: string;
  markdownContent: string;
  assetFiles: ArchiveAssetFile[];
  warning: string | null;
  noteWarning: string | null;
}

export interface NotionBundle {
  title: string;
  markdownContent: string;
  aiResult: AiOrganizationResult | null;
  warning: string | null;
}

function prefixAssetBasePath(orderPrefix: string, basename: string): string {
  return `${orderPrefix}. ${basename}`;
}

export function buildArchiveNoteFilename(archiveName: string): string {
  return `01. ${archiveName}.md`;
}

function guessExtension(url: string, contentType: string | null): string {
  if (contentType?.includes("png")) {
    return "png";
  }
  if (contentType?.includes("webp")) {
    return "webp";
  }
  if (contentType?.includes("gif")) {
    return "gif";
  }
  if (contentType?.includes("mp4")) {
    return "mp4";
  }

  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}

function hasAnyMedia(post: ExtractedPost): boolean {
  return (
    post.imageUrls.length > 0 ||
    Boolean(post.videoUrl) ||
    (post.sourceType === "video" && Boolean(post.thumbnailUrl)) ||
    post.authorReplies.some((reply) => reply.imageUrls.length > 0 || Boolean(reply.videoUrl) || (reply.sourceType === "video" && Boolean(reply.thumbnailUrl)))
  );
}

async function collectRemoteAsset(
  url: string | null,
  assetBasePath: string,
  includeImages: boolean,
  fallbackWarning: string
): Promise<{ ref: string | null; assetFiles: ArchiveAssetFile[]; warning: string | null }> {
  if (!url) {
    return { ref: null, assetFiles: [], warning: null };
  }

  if (!includeImages) {
    return {
      ref: url,
      assetFiles: [],
      warning: fallbackWarning
    };
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("asset fetch failed");
    }

    const contentType = response.headers.get("content-type");
    const blob = await response.blob();
    const extension = guessExtension(url, contentType);
    const relativePath = `${assetBasePath}.${extension}`;
    return {
      ref: relativePath,
      assetFiles: [{ relativePath, blob }],
      warning: null
    };
  } catch {
    return {
      ref: url,
      assetFiles: [],
      warning: (await t()).warnImageAccessFailed
    };
  }
}

async function collectImageAssets(
  imageUrls: string[],
  assetBasename: string,
  includeImages: boolean,
  fallbackWarning: string
): Promise<{ refs: string[]; assetFiles: ArchiveAssetFile[]; warning: string | null }> {
  const refs: string[] = [];
  const assetFiles: ArchiveAssetFile[] = [];
  let warning: string | null = null;

  for (const [index, imageUrl] of imageUrls.entries()) {
    const result = await collectRemoteAsset(imageUrl, `${assetBasename}-${String(index + 1).padStart(2, "0")}`, includeImages, fallbackWarning);
    if (result.ref) {
      refs.push(result.ref);
    }
    assetFiles.push(...result.assetFiles);
    warning = warning ?? result.warning;
  }

  return { refs, assetFiles, warning };
}

async function collectVideoAssets(
  videoUrl: string | null,
  thumbnailUrl: string | null,
  assetBasePath: string,
  includeImages: boolean,
  fallbackWarning: string
): Promise<{ file: string | null; thumbnail: string | null; assetFiles: ArchiveAssetFile[]; warning: string | null }> {
  const [videoResult, thumbnailResult] = await Promise.all([
    collectRemoteAsset(videoUrl, assetBasePath, includeImages, fallbackWarning),
    collectRemoteAsset(thumbnailUrl, `${assetBasePath}-thumb`, includeImages, fallbackWarning)
  ]);

  return {
    file: videoResult.ref,
    thumbnail: thumbnailResult.ref,
    assetFiles: [...videoResult.assetFiles, ...thumbnailResult.assetFiles],
    warning: videoResult.warning ?? thumbnailResult.warning
  };
}

export async function buildArchiveBundle(
  post: ExtractedPost,
  filenamePattern: string,
  includeImages: boolean,
  fallbackWarning?: string,
  aiOrganization?: AiOrganizationSettings
): Promise<ArchiveBundle> {
  const resolvedFallbackWarning = fallbackWarning ?? (await t()).warnImageDownloadOff;
  const archiveName = buildArchiveBaseName(filenamePattern, post);
  const ai = aiOrganization ? await organizePostWithAi(post, aiOrganization) : { result: null, warning: null };
  const postImages = await collectImageAssets(
    post.imageUrls,
    prefixAssetBasePath("02", "image"),
    includeImages,
    resolvedFallbackWarning
  );
  const postVideo =
    post.sourceType === "video"
      ? await collectVideoAssets(
          post.videoUrl,
          post.thumbnailUrl,
          prefixAssetBasePath("02", "video"),
          includeImages,
          resolvedFallbackWarning
        )
      : null;
  const replyImages = await Promise.all(
    post.authorReplies.map((reply, index) =>
      collectImageAssets(
        reply.imageUrls,
        prefixAssetBasePath("03", `reply-${String(index + 1).padStart(2, "0")}-image`),
        includeImages,
        resolvedFallbackWarning
      )
    )
  );
  const replyVideos = await Promise.all(
    post.authorReplies.map((reply, index) =>
      reply.sourceType === "video"
        ? collectVideoAssets(
            reply.videoUrl,
            reply.thumbnailUrl,
            prefixAssetBasePath("03", `reply-${String(index + 1).padStart(2, "0")}-video`),
            includeImages,
            resolvedFallbackWarning
          )
        : Promise.resolve(null)
    )
  );

  let warning: string | null = null;
  if (!includeImages && hasAnyMedia(post)) {
    warning = resolvedFallbackWarning;
  }
  const noteWarning =
    warning ??
    postImages.warning ??
    postVideo?.warning ??
    replyImages.find((result) => result.warning)?.warning ??
    replyVideos.find((result) => result?.warning)?.warning ??
    null;
  const userWarnings = [noteWarning, ai.warning].filter(Boolean) as string[];
  warning = userWarnings.length > 0 ? userWarnings.join(" | ") : null;

  const markdownContent = await renderMarkdown(
    post,
    {
      postImages: postImages.refs,
      postVideo: postVideo ? { thumbnail: postVideo.thumbnail, file: postVideo.file } : null,
      replyImages: replyImages.map((result) => result.refs),
      replyVideos: replyVideos.map((result) => (result ? { thumbnail: result.thumbnail, file: result.file } : null))
    },
    noteWarning,
    ai.result
  );

  return {
    archiveName,
    markdownContent,
    assetFiles: [
      ...postImages.assetFiles,
      ...(postVideo?.assetFiles ?? []),
      ...replyImages.flatMap((result) => result.assetFiles),
      ...replyVideos.flatMap((result) => result?.assetFiles ?? [])
    ],
    warning,
    noteWarning
  };
}

function buildNotionMediaRefs(post: ExtractedPost, includeImages: boolean): MarkdownMediaRefs {
  return {
    postImages: includeImages ? [...post.imageUrls] : [],
    postVideo:
      post.sourceType === "video"
        ? {
            file: post.videoUrl,
            thumbnail: includeImages ? post.thumbnailUrl : null
          }
        : null,
    replyImages: post.authorReplies.map((reply) => (includeImages ? [...reply.imageUrls] : [])),
    replyVideos: post.authorReplies.map((reply) =>
      reply.sourceType === "video"
        ? {
            file: reply.videoUrl,
            thumbnail: includeImages ? reply.thumbnailUrl : null
          }
        : null
    )
  };
}

export async function buildNotionBundle(
  post: ExtractedPost,
  includeImages: boolean,
  aiOrganization?: AiOrganizationSettings
): Promise<NotionBundle> {
  const ai = aiOrganization ? await organizePostWithAi(post, aiOrganization) : { result: null, warning: null };
  const markdownContent = await renderNotionMarkdown(post, buildNotionMediaRefs(post, includeImages), ai.warning, ai.result);

  return {
    title: post.title,
    markdownContent,
    aiResult: ai.result,
    warning: ai.warning
  };
}

export async function buildZipPackage(
  post: ExtractedPost,
  filenamePattern: string,
  includeImages: boolean,
  fallbackWarning = "이미지/동영상 저장이 꺼져 있어 원격 URL을 사용했습니다.",
  savePathPattern = "",
  aiOrganization?: AiOrganizationSettings
): Promise<PackagedResult> {
  const bundle = await buildArchiveBundle(post, filenamePattern, includeImages, fallbackWarning, aiOrganization);
  const zip = new JSZip();
  const archiveRoot = [...buildPathPatternParts(savePathPattern, post), bundle.archiveName].join("/");

  zip.file(`${archiveRoot}/${buildArchiveNoteFilename(bundle.archiveName)}`, bundle.markdownContent);
  for (const file of bundle.assetFiles) {
    zip.file(`${archiveRoot}/${file.relativePath}`, await file.blob.arrayBuffer());
  }

  return {
    blob: await zip.generateAsync({ type: "blob" }),
    zipFilename: buildZipFilename(filenamePattern, post),
    archiveName: bundle.archiveName,
    warning: bundle.warning
  };
}
