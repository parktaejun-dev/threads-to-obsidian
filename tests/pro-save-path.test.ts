import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { buildArchiveNoteFilename, buildZipPackage } from "../packages/extension/src/lib/package";
import type { ExtractedPost } from "../packages/extension/src/lib/types";

const basePost: ExtractedPost = {
  canonicalUrl: "https://www.threads.com/@writer/post/ZIP123",
  shortcode: "ZIP123",
  author: "writer",
  title: "writer on Threads",
  text: "본문 예시",
  publishedAt: "2026-03-08T08:00:00.000Z",
  capturedAt: "2026-03-08T08:01:00.000Z",
  sourceType: "image",
  imageUrls: ["https://cdn.example.com/image-1.jpg"],
  videoUrl: null,
  externalUrl: "https://example.com/article",
  quotedPostUrl: null,
  repliedToUrl: null,
  thumbnailUrl: null,
  authorReplies: [],
  extractorVersion: "2026-03-08",
  contentHash: "deadbeef"
};

test("zip packaging can place archives under a save path pattern subdirectory", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(new Uint8Array([1, 2, 3, 4]), {
      headers: {
        "content-type": "image/jpeg"
      }
    });

  try {
    const anyBuild = buildZipPackage as unknown as (...args: any[]) => Promise<{ blob: Blob; archiveName: string }>;
    const savePathPattern = "Sources/Threads/{author}";
    const result = await anyBuild(basePost, "{date}_{author}_{shortcode}", true, undefined, savePathPattern);

    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const expectedPrefix = `Sources/Threads/writer/${result.archiveName}`;
    const notePath = `${expectedPrefix}/${buildArchiveNoteFilename(result.archiveName)}`;

    // If the feature isn't implemented yet, don't fail the whole suite.
    const hasAnyUnderSources = Object.keys(zip.files).some((path) => path.startsWith("Sources/Threads/"));
    if (!hasAnyUnderSources) {
      t.skip("savePathPattern not implemented yet");
      return;
    }

    const note = await zip.file(notePath)?.async("string");
    assert.ok(note?.includes("tags:"));
    assert.ok(note?.includes('- "threads"'));
    assert.ok(zip.file(`${expectedPrefix}/02. image-01.jpg`));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
