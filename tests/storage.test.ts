import test from "node:test";
import assert from "node:assert/strict";
import { getAiProviderKeyMismatch } from "../packages/extension/src/lib/config";
import { findDuplicateSave, getOptions, getRecentSaves, upsertRecentSave } from "../packages/extension/src/lib/storage";
import type { ExtractedPost, RecentSave } from "../packages/extension/src/lib/types";

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

test("legacy cloud recent saves infer saveTarget from savedVia", async () => {
  storageState.clear();
  storageState.set("recent-saves", [
    {
      id: "cloud-legacy-1",
      canonicalUrl: basePost.canonicalUrl,
      shortcode: basePost.shortcode,
      author: basePost.author,
      title: basePost.title,
      downloadedAt: basePost.capturedAt,
      archiveName: "threads-cloud-item",
      contentHash: basePost.contentHash,
      status: "complete",
      savedVia: "cloud",
      remotePageId: "archive-1",
      remotePageUrl: "https://threads-archive.dahanda.dev/scrapbook?archive=archive-1",
      post: basePost
    }
  ]);

  const recent = await getRecentSaves();

  assert.equal(recent[0]?.saveTarget, "cloud");
  assert.equal(recent[0]?.savedVia, "cloud");
  assert.equal(recent[0]?.remotePageId, "archive-1");
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
  assert.equal(options.saveTarget, "obsidian");
  assert.equal(options.notion.token, "");
  assert.equal(options.notion.parentType, "page");
  assert.equal(options.notion.parentPageId, "");
  assert.equal(options.notion.dataSourceId, "");
  assert.equal(options.notion.uploadMedia, false);
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

test("recent saves keep separate records for Obsidian, Cloud, and Notion targets", async () => {
  storageState.clear();
  const obsidianSave: RecentSave = {
    id: "obsidian-1",
    saveTarget: "obsidian",
    canonicalUrl: basePost.canonicalUrl,
    shortcode: basePost.shortcode,
    author: basePost.author,
    title: basePost.title,
    downloadedAt: basePost.capturedAt,
    archiveName: "writer_on_threads",
    contentHash: basePost.contentHash,
    status: "complete",
    savedVia: "direct",
    savedRelativePath: "Inbox/writer_on_threads/01. writer_on_threads.md",
    remotePageId: null,
    remotePageUrl: null,
    warning: null,
    post: basePost
  };
  const notionSave: RecentSave = {
    ...obsidianSave,
    id: "notion-1",
    saveTarget: "notion",
    savedVia: "notion",
    savedRelativePath: null,
    remotePageId: "12345678-1234-1234-1234-1234567890ab",
    remotePageUrl: "https://www.notion.so/example"
  };
  const cloudSave: RecentSave = {
    ...obsidianSave,
    id: "cloud-1",
    saveTarget: "cloud",
    savedVia: "cloud",
    savedRelativePath: null,
    remotePageId: "cloud-archive-1",
    remotePageUrl: "https://threads-archive.dahanda.dev/scrapbook?archive=cloud-archive-1"
  };

  await upsertRecentSave(obsidianSave);
  await upsertRecentSave(cloudSave);
  await upsertRecentSave(notionSave);

  const recent = await getRecentSaves();
  assert.equal(recent.length, 3);
  assert.deepEqual(
    recent.map((item) => item.saveTarget).sort(),
    ["cloud", "notion", "obsidian"]
  );
  assert.equal((await findDuplicateSave(basePost.canonicalUrl, basePost.contentHash, "obsidian"))?.id, "obsidian-1");
  assert.equal((await findDuplicateSave(basePost.canonicalUrl, basePost.contentHash, "cloud"))?.id, "cloud-1");
  assert.equal((await findDuplicateSave(basePost.canonicalUrl, basePost.contentHash, "notion"))?.id, "notion-1");
});
