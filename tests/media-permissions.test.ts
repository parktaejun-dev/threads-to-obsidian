import test from "node:test";
import assert from "node:assert/strict";
import { IMAGE_PERMISSION_WARNING, resolveImageDownloadPolicy } from "../src/extension/lib/media-permissions";
import type { ExtractedPost } from "../src/extension/lib/types";

const basePost: ExtractedPost = {
  canonicalUrl: "https://www.threads.com/@writer/post/ZIP123",
  shortcode: "ZIP123",
  author: "writer",
  title: "writer",
  text: "본문 예시",
  publishedAt: "2026-03-08T08:00:00.000Z",
  capturedAt: "2026-03-08T08:01:00.000Z",
  sourceType: "image",
  imageUrls: ["https://scontent-icn2-1.cdninstagram.com/v/test.jpg"],
  externalUrl: null,
  quotedPostUrl: null,
  repliedToUrl: null,
  thumbnailUrl: null,
  authorReplies: [],
  extractorVersion: "2026-03-08",
  contentHash: "deadbeef"
};

test("image download policy requests optional media origins and allows local downloads when granted", async () => {
  const originalChrome = globalThis.chrome;
  let requested = false;

  globalThis.chrome = {
    permissions: {
      async contains() {
        return false;
      },
      async request() {
        requested = true;
        return true;
      }
    }
  } as unknown as typeof chrome;

  try {
    const policy = await resolveImageDownloadPolicy(basePost, true, true);

    assert.equal(requested, true);
    assert.equal(policy.allowImageDownloads, true);
  } finally {
    globalThis.chrome = originalChrome;
  }
});

test("image download policy falls back to remote urls when optional media permission is denied", async () => {
  const originalChrome = globalThis.chrome;

  globalThis.chrome = {
    permissions: {
      async contains() {
        return false;
      },
      async request() {
        return false;
      }
    }
  } as unknown as typeof chrome;

  try {
    const policy = await resolveImageDownloadPolicy(basePost, true, true);

    assert.equal(policy.allowImageDownloads, false);
    assert.equal(policy.fallbackWarning, IMAGE_PERMISSION_WARNING);
  } finally {
    globalThis.chrome = originalChrome;
  }
});
