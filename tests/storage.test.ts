import test from "node:test";
import assert from "node:assert/strict";
import { getAiProviderKeyMismatch } from "../src/extension/lib/config";
import { getOptions, getRecentSaves } from "../src/extension/lib/storage";
import type { ExtractedPost } from "../src/extension/lib/types";

const storageState = new Map<string, unknown>();

globalThis.chrome = {
  storage: {
    local: {
      async get(key: string) {
        return { [key]: storageState.get(key) };
      },
      async set(values: Record<string, unknown>) {
        for (const [key, value] of Object.entries(values)) {
          storageState.set(key, value);
        }
      }
    }
  }
} as unknown as typeof chrome;

const basePost: ExtractedPost = {
  canonicalUrl: "https://www.threads.com/@writer/post/ZIP123",
  shortcode: "ZIP123",
  author: "writer",
  title: "writer on Threads",
  text: "본문 예시",
  publishedAt: "2026-03-08T08:00:00.000Z",
  capturedAt: "2026-03-08T08:01:00.000Z",
  sourceType: "image",
  imageUrls: [],
  videoUrl: null,
  externalUrl: null,
  quotedPostUrl: null,
  repliedToUrl: null,
  thumbnailUrl: null,
  authorReplies: [],
  extractorVersion: "2026-03-08",
  contentHash: "deadbeef"
};

test("legacy recent saves migrate zipFilename to archiveName", async () => {
  storageState.clear();
  storageState.set("recent-saves", [
    {
      id: "legacy-1",
      canonicalUrl: basePost.canonicalUrl,
      shortcode: basePost.shortcode,
      author: basePost.author,
      title: "\\uc791\\uc131\\uc790 on Threads",
      downloadedAt: basePost.capturedAt,
      zipFilename: "2026-03-08_writer_ZIP123.zip",
      contentHash: basePost.contentHash,
      status: "complete",
      post: {
        ...basePost,
        text: "\\ubcf8\\ubb38 \\uc608\\uc2dc"
      }
    }
  ]);

  const recent = await getRecentSaves();

  assert.equal(recent.length, 1);
  assert.equal(recent[0]?.archiveName, "2026-03-08_writer_ZIP123");
  assert.equal(recent[0]?.savedVia, "zip");
  assert.equal(recent[0]?.savedRelativePath, null);
  assert.equal(recent[0]?.warning, null);
  assert.equal(recent[0]?.title, "작성자 on Threads");
  assert.equal(recent[0]?.post.text, "본문 예시");
});

test("legacy default filename patterns migrate to the truncated first sentence default", async () => {
  storageState.clear();
  storageState.set("options", {
    filenamePattern: "{date}_{author}_{shortcode}",
    includeImages: true,
    obsidianFolderLabel: null
  });

  const options = await getOptions();

  assert.equal(options.filenamePattern, "{author}_{first_sentence_20}");
});

test("old first sentence default filename pattern migrates to the truncated first sentence default", async () => {
  storageState.clear();
  storageState.set("options", {
    filenamePattern: "{author}_{first_sentence}",
    includeImages: true,
    obsidianFolderLabel: null
  });

  const options = await getOptions();

  assert.equal(options.filenamePattern, "{author}_{first_sentence_20}");
});

test("previous shortcode default filename pattern migrates to the truncated first sentence default", async () => {
  storageState.clear();
  storageState.set("options", {
    filenamePattern: "{author}_{shortcode}",
    includeImages: true,
    obsidianFolderLabel: null
  });

  const options = await getOptions();

  assert.equal(options.filenamePattern, "{author}_{first_sentence_20}");
});

test("AI provider mismatch detection flags Gemini with an OpenAI-style key", () => {
  assert.equal(getAiProviderKeyMismatch("gemini", "sk-1234567890abcdef"), "gemini_key_looks_openai");
});

test("AI provider mismatch detection flags OpenAI with a Gemini-style key", () => {
  assert.equal(getAiProviderKeyMismatch("openai", "AIzaSyExampleKey1234567890"), "openai_compatible_key_looks_gemini");
});

test("AI provider mismatch detection ignores matching or custom key shapes", () => {
  assert.equal(getAiProviderKeyMismatch("gemini", "AIzaSyExampleKey1234567890"), null);
  assert.equal(getAiProviderKeyMismatch("openrouter", "sk-or-v1-1234567890"), null);
  assert.equal(getAiProviderKeyMismatch("deepseek", "sk-1234567890abcdef"), null);
  assert.equal(getAiProviderKeyMismatch("custom", "AIzaSyExampleKey1234567890"), null);
});
