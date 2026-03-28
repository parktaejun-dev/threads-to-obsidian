import type { ExtractedPost } from "./types";

export const OPTIONAL_MEDIA_ORIGINS = ["https://*.cdninstagram.com/*", "https://*.fbcdn.net/*"];
export const MEDIA_DISABLED_WARNING = "이미지/동영상 저장이 꺼져 있어 원격 URL을 사용했습니다.";
export const MEDIA_PERMISSION_WARNING = "추가 미디어 권한이 없어 원격 URL을 사용했습니다.";

export interface ImageDownloadPolicy {
  allowImageDownloads: boolean;
  fallbackWarning: string;
}

function hasAnyMedia(post: ExtractedPost): boolean {
  return (
    post.imageUrls.length > 0 ||
    Boolean(post.videoUrl) ||
    (post.sourceType === "video" && Boolean(post.thumbnailUrl)) ||
    post.authorReplies.some((reply) => reply.imageUrls.length > 0 || Boolean(reply.videoUrl) || (reply.sourceType === "video" && Boolean(reply.thumbnailUrl)))
  );
}

function requiresOptionalMediaPermission(post: ExtractedPost): boolean {
  const urls = [
    ...post.imageUrls,
    ...(post.sourceType === "video" ? [post.thumbnailUrl] : []),
    post.videoUrl,
    ...post.authorReplies.flatMap((reply) => [
      ...reply.imageUrls,
      ...(reply.sourceType === "video" ? [reply.thumbnailUrl] : []),
      reply.videoUrl
    ])
  ].filter(Boolean) as string[];

  return urls.some((url) => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.endsWith("cdninstagram.com") || hostname.endsWith("fbcdn.net");
    } catch {
      return false;
    }
  });
}

async function hasOptionalMediaPermission(): Promise<boolean> {
  if (!chrome.permissions?.contains) {
    return false;
  }

  try {
    return await chrome.permissions.contains({ origins: OPTIONAL_MEDIA_ORIGINS });
  } catch {
    return false;
  }
}

async function requestOptionalMediaPermission(): Promise<boolean> {
  if (!chrome.permissions?.request) {
    return false;
  }

  try {
    return await chrome.permissions.request({ origins: OPTIONAL_MEDIA_ORIGINS });
  } catch {
    return false;
  }
}

export async function resolveImageDownloadPolicy(
  post: ExtractedPost,
  includeImages: boolean,
  requestPermission: boolean
): Promise<ImageDownloadPolicy> {
  if (!includeImages || !hasAnyMedia(post)) {
    return {
      allowImageDownloads: false,
      fallbackWarning: MEDIA_DISABLED_WARNING
    };
  }

  if (!requiresOptionalMediaPermission(post)) {
    return {
      allowImageDownloads: true,
      fallbackWarning: MEDIA_DISABLED_WARNING
    };
  }

  if (await hasOptionalMediaPermission()) {
    return {
      allowImageDownloads: true,
      fallbackWarning: MEDIA_DISABLED_WARNING
    };
  }

  if (!requestPermission) {
    return {
      allowImageDownloads: false,
      fallbackWarning: MEDIA_PERMISSION_WARNING
    };
  }

  const granted = await requestOptionalMediaPermission();
  return {
    allowImageDownloads: granted,
    fallbackWarning: granted ? MEDIA_DISABLED_WARNING : MEDIA_PERMISSION_WARNING
  };
}
