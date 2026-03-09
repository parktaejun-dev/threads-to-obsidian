import JSZip from "jszip";
import type { ExtractedPost, PackagedResult } from "./types";
import { t } from "./i18n";
import { renderMarkdown } from "./markdown";
import { buildArchiveBaseName, buildZipFilename } from "./utils";

export interface ArchiveAssetFile {
  relativePath: string;
  blob: Blob;
}

export interface ArchiveBundle {
  archiveName: string;
  markdownContent: string;
  assetFiles: ArchiveAssetFile[];
  warning: string | null;
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

function hasAnyImages(post: ExtractedPost): boolean {
  return post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
}

async function collectImageAssets(
  imageUrls: string[],
  assetStem: string,
  includeImages: boolean,
  fallbackWarning: string
): Promise<{ refs: string[]; assetFiles: ArchiveAssetFile[]; warning: string | null }> {
  const refs: string[] = [];
  const assetFiles: ArchiveAssetFile[] = [];
  let warning: string | null = null;

  if (!includeImages) {
    refs.push(...imageUrls);
    if (imageUrls.length > 0) {
      warning = fallbackWarning;
    }
    return { refs, assetFiles, warning };
  }

  for (const [index, imageUrl] of imageUrls.entries()) {
    try {
      const response = await fetch(imageUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`image ${index + 1} failed`);
      }
      const contentType = response.headers.get("content-type");
      const blob = await response.blob();
      const extension = guessExtension(imageUrl, contentType);
      const relativePath = `assets/${assetStem}-${String(index + 1).padStart(2, "0")}.${extension}`;
      assetFiles.push({ relativePath, blob });
      refs.push(relativePath);
    } catch {
      warning = (await t()).warnImageAccessFailed;
      refs.push(imageUrl);
    }
  }

  return { refs, assetFiles, warning };
}

export async function buildArchiveBundle(
  post: ExtractedPost,
  filenamePattern: string,
  includeImages: boolean,
  fallbackWarning?: string
): Promise<ArchiveBundle> {
  const resolvedFallbackWarning = fallbackWarning ?? (await t()).warnImageDownloadOff;
  const archiveName = buildArchiveBaseName(filenamePattern, post);
  const postImages = await collectImageAssets(post.imageUrls, "post-image", includeImages, resolvedFallbackWarning);
  const replyImages = await Promise.all(
    post.authorReplies.map((reply, index) =>
      collectImageAssets(reply.imageUrls, `reply-${String(index + 1).padStart(2, "0")}-image`, includeImages, resolvedFallbackWarning)
    )
  );

  let warning: string | null = null;
  if (!includeImages && hasAnyImages(post)) {
    warning = resolvedFallbackWarning;
  }
  warning ??= postImages.warning ?? replyImages.find((result) => result.warning)?.warning ?? null;

  const markdownContent = await renderMarkdown(
    post,
    {
      postImages: postImages.refs,
      replyImages: replyImages.map((result) => result.refs)
    },
    warning
  );

  return {
    archiveName,
    markdownContent,
    assetFiles: [...postImages.assetFiles, ...replyImages.flatMap((result) => result.assetFiles)],
    warning
  };
}

export async function buildZipPackage(
  post: ExtractedPost,
  filenamePattern: string,
  includeImages: boolean,
  fallbackWarning = "이미지 다운로드가 꺼져 있어 원격 URL을 사용했습니다."
): Promise<PackagedResult> {
  const bundle = await buildArchiveBundle(post, filenamePattern, includeImages, fallbackWarning);
  const zip = new JSZip();

  zip.file(`${bundle.archiveName}/${bundle.archiveName}.md`, bundle.markdownContent);
  for (const file of bundle.assetFiles) {
    zip.file(`${bundle.archiveName}/${file.relativePath}`, await file.blob.arrayBuffer());
  }

  return {
    blob: await zip.generateAsync({ type: "blob" }),
    zipFilename: buildZipFilename(filenamePattern, post),
    archiveName: bundle.archiveName,
    warning: bundle.warning
  };
}
