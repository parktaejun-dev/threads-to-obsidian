import type { ExtractedPost } from "./types";

export const OPTIONAL_MEDIA_ORIGINS = ["https://*.cdninstagram.com/*", "https://*.fbcdn.net/*"];
export const IMAGES_DISABLED_WARNING = "이미지 다운로드가 꺼져 있어 원격 URL을 사용했습니다.";
export const IMAGE_PERMISSION_WARNING = "추가 이미지 권한이 없어 원격 URL을 사용했습니다.";

export interface ImageDownloadPolicy {
  allowImageDownloads: boolean;
  fallbackWarning: string;
}

function hasAnyImages(post: ExtractedPost): boolean {
  return post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
}

function requiresOptionalMediaPermission(post: ExtractedPost): boolean {
  const urls = [...post.imageUrls, ...post.authorReplies.flatMap((reply) => reply.imageUrls)];

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
  if (!includeImages || !hasAnyImages(post)) {
    return {
      allowImageDownloads: false,
      fallbackWarning: IMAGES_DISABLED_WARNING
    };
  }

  if (!requiresOptionalMediaPermission(post)) {
    return {
      allowImageDownloads: true,
      fallbackWarning: IMAGES_DISABLED_WARNING
    };
  }

  if (await hasOptionalMediaPermission()) {
    return {
      allowImageDownloads: true,
      fallbackWarning: IMAGES_DISABLED_WARNING
    };
  }

  if (!requestPermission) {
    return {
      allowImageDownloads: false,
      fallbackWarning: IMAGE_PERMISSION_WARNING
    };
  }

  const granted = await requestOptionalMediaPermission();
  return {
    allowImageDownloads: granted,
    fallbackWarning: granted ? IMAGES_DISABLED_WARNING : IMAGE_PERMISSION_WARNING
  };
}
