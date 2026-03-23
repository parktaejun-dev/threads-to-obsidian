import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { buildArchiveNoteFilename, buildNotionBundle, buildZipPackage } from "../src/extension/lib/package";
import type { ExtractedPost } from "../src/extension/lib/types";

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

test("zip packaging stores note and downloaded image assets", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(new Uint8Array([1, 2, 3, 4]), {
      headers: {
        "content-type": "image/jpeg"
      }
    });

  try {
    const result = await buildZipPackage(basePost, "{date}_{author}_{shortcode}", true);
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const note = await zip.file(`2026-03-08_writer_ZIP123/${buildArchiveNoteFilename("2026-03-08_writer_ZIP123")}`)?.async("string");

    assert.equal(result.zipFilename, "2026-03-08_writer_ZIP123.zip");
    assert.ok(note?.includes("tags:"));
    assert.ok(note?.includes('- "threads"'));
    assert.ok(note?.includes("published_at: 2026-03-08T08:00:00.000Z"));
    assert.ok(note?.includes("captured_at: 2026-03-08T08:01:00.000Z"));
    assert.ok(note?.includes("Author: @writer"));
    assert.ok(note?.includes("![Image 1](02. image-01.jpg)"));
    assert.ok(zip.file("2026-03-08_writer_ZIP123/02. image-01.jpg"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("zip packaging falls back to remote image urls when image download is disabled", async () => {
  const result = await buildZipPackage(basePost, "{date}_{author}_{shortcode}", false);
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  const note = await zip.file(`2026-03-08_writer_ZIP123/${buildArchiveNoteFilename("2026-03-08_writer_ZIP123")}`)?.async("string");

  assert.ok(note?.includes("https://cdn.example.com/image-1.jpg"));
  assert.equal(Boolean(zip.file("2026-03-08_writer_ZIP123/02. image-01.jpg")), false);
});

test("zip packaging includes consecutive author replies and reply assets", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(new Uint8Array([9, 8, 7, 6]), {
      headers: {
        "content-type": "image/jpeg"
      }
    });

  try {
    const result = await buildZipPackage(
      {
        ...basePost,
        imageUrls: [],
        sourceType: "text",
        authorReplies: [
          {
            author: "writer",
            canonicalUrl: "https://www.threads.com/@writer/post/ZIP124",
            shortcode: "ZIP124",
            text: "작성자가 이어서 단 첫 번째 답글",
            publishedAt: "2026-03-08T08:03:00.000Z",
            sourceType: "image",
            imageUrls: ["https://cdn.example.com/reply-image-1.jpg"],
            videoUrl: null,
            externalUrl: "https://example.com/reply",
            thumbnailUrl: null
          }
        ]
      },
      "{date}_{author}_{shortcode}",
      true
    );
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const note = await zip.file(`2026-03-08_writer_ZIP123/${buildArchiveNoteFilename("2026-03-08_writer_ZIP123")}`)?.async("string");

    assert.ok(note?.includes("## Author Replies"));
    assert.ok(note?.includes("Author: @writer"));
    assert.ok(note?.includes("작성자가 이어서 단 첫 번째 답글"));
    assert.ok(note?.includes("![Reply image 1 1](03. reply-01-image-01.jpg)"));
    assert.ok(zip.file("2026-03-08_writer_ZIP123/03. reply-01-image-01.jpg"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("zip packaging keeps video link, thumbnail, and saved video file for video posts", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.endsWith(".mp4")) {
      return new Response(new Uint8Array([0, 1, 2, 3]), {
        headers: {
          "content-type": "video/mp4"
        }
      });
    }

    return new Response(new Uint8Array([4, 5, 6, 7]), {
      headers: {
        "content-type": "image/png"
      }
    });
  };

  try {
    const result = await buildZipPackage(
      {
        ...basePost,
        sourceType: "video",
        imageUrls: [],
        videoUrl: "https://cdn.example.com/thread-video.mp4",
        thumbnailUrl: "https://cdn.example.com/threads-logo.png"
      },
      "{date}_{author}_{shortcode}",
      true
    );
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const note = await zip.file(`2026-03-08_writer_ZIP123/${buildArchiveNoteFilename("2026-03-08_writer_ZIP123")}`)?.async("string");

    assert.ok(note?.includes('thumbnail_url: "https://cdn.example.com/threads-logo.png"'));
    assert.ok(note?.includes('video_url: "https://cdn.example.com/thread-video.mp4"'));
    assert.ok(note?.includes("## Video"));
    assert.ok(note?.includes("Open on Threads: https://www.threads.com/@writer/post/ZIP123"));
    assert.ok(note?.includes("Saved video file: 02. video.mp4"));
    assert.ok(note?.includes("![Video thumbnail](02. video-thumb.png)"));
    assert.equal(note?.includes("## Image"), false);
    assert.ok(zip.file("2026-03-08_writer_ZIP123/02. video.mp4"));
    assert.ok(zip.file("2026-03-08_writer_ZIP123/02. video-thumb.png"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("zip packaging keeps remote video links when media download is disabled", async () => {
  const result = await buildZipPackage(
    {
      ...basePost,
      sourceType: "video",
      imageUrls: [],
      videoUrl: "https://cdn.example.com/thread-video.mp4",
      thumbnailUrl: "https://cdn.example.com/threads-logo.png"
    },
    "{date}_{author}_{shortcode}",
    false
  );
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  const note = await zip.file(`2026-03-08_writer_ZIP123/${buildArchiveNoteFilename("2026-03-08_writer_ZIP123")}`)?.async("string");

  assert.ok(note?.includes("Open on Threads: https://www.threads.com/@writer/post/ZIP123"));
  assert.ok(note?.includes("![Video thumbnail](https://cdn.example.com/threads-logo.png)"));
  assert.equal(Boolean(zip.file("2026-03-08_writer_ZIP123/02. video.mp4")), false);
});

test("zip packaging uses author and first sentence when configured", async () => {
  const result = await buildZipPackage(
    {
      ...basePost,
      text: "나는 1979년에 태어났다.\n\n어릴 때는 공중전화 앞에 줄을 섰다."
    },
    "{author}_{first_sentence}",
    false
  );
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

  assert.equal(result.zipFilename, "writer_나는_1979년에_태어났다.zip");
  assert.ok(zip.file(`writer_나는_1979년에_태어났다/${buildArchiveNoteFilename("writer_나는_1979년에_태어났다")}`));
});

test("notion packaging renders body markdown without frontmatter and keeps remote media", async () => {
  const result = await buildNotionBundle(
    {
      ...basePost,
      imageUrls: ["https://cdn.example.com/image-1.jpg"],
      sourceType: "video",
      videoUrl: "https://cdn.example.com/thread-video.mp4",
      thumbnailUrl: "https://cdn.example.com/thread-thumb.png"
    },
    true
  );

  assert.equal(result.title, "writer on Threads");
  assert.equal(result.markdownContent.startsWith("---"), false);
  assert.ok(result.markdownContent.includes("# writer on Threads"));
  assert.ok(result.markdownContent.includes("Source: https://www.threads.com/@writer/post/ZIP123"));
  assert.ok(result.markdownContent.includes("![Image 1](https://cdn.example.com/image-1.jpg)"));
  assert.ok(result.markdownContent.includes("![Video thumbnail](https://cdn.example.com/thread-thumb.png)"));
});
