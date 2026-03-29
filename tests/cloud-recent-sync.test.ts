import test from "node:test";
import assert from "node:assert/strict";

import { buildRecentSaveFromCloudArchive, mergeRecentSavesWithCloudArchives } from "../packages/extension/src/lib/storage";
import type { CloudArchiveRecentRecord, ExtractedPost, RecentSave } from "../packages/extension/src/lib/types";

function buildPost(overrides: Partial<ExtractedPost> = {}): ExtractedPost {
  return {
    canonicalUrl: "https://www.threads.com/@writer/post/AAA111",
    shortcode: "AAA111",
    author: "writer",
    title: "writer on Threads",
    text: "본문",
    publishedAt: "2026-03-28T10:00:00.000Z",
    capturedAt: "2026-03-28T10:01:00.000Z",
    sourceType: "text",
    imageUrls: [],
    videoUrl: null,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl: null,
    authorReplies: [],
    extractorVersion: "2026-03-28",
    contentHash: "hash-1",
    ...overrides
  };
}

function buildCloudArchive(overrides: Partial<CloudArchiveRecentRecord> = {}): CloudArchiveRecentRecord {
  return {
    archiveId: "cloud-1",
    archiveUrl: "https://ss-threads.dahanda.dev/scrapbook/@writer/archive/cloud-1",
    title: "Cloud archive title",
    savedAt: "2026-03-27T10:05:00.000Z",
    updatedAt: "2026-03-28T10:05:00.000Z",
    warning: null,
    origin: "cloud",
    post: buildPost(),
    ...overrides
  };
}

function buildRecentSave(overrides: Partial<RecentSave> = {}): RecentSave {
  return {
    id: "local-1",
    saveTarget: "obsidian",
    canonicalUrl: "https://www.threads.com/@writer/post/LOCAL111",
    shortcode: "LOCAL111",
    author: "writer",
    title: "Local archive",
    savedAt: "2026-03-28T09:00:00.000Z",
    downloadedAt: "2026-03-28T09:00:00.000Z",
    archiveName: "Local archive",
    contentHash: "local-hash",
    status: "complete",
    savedVia: "zip",
    savedRelativePath: null,
    remotePageId: null,
    remotePageUrl: null,
    warning: null,
    post: buildPost({
      canonicalUrl: "https://www.threads.com/@writer/post/LOCAL111",
      shortcode: "LOCAL111",
      contentHash: "local-hash"
    }),
    ...overrides
  };
}

test("buildRecentSaveFromCloudArchive maps cloud archive metadata into a popup recent save", () => {
  const archive = buildCloudArchive();
  const recent = buildRecentSaveFromCloudArchive(archive);

  assert.equal(recent.id, "cloud-1");
  assert.equal(recent.saveTarget, "cloud");
  assert.equal(recent.savedVia, "cloud");
  assert.equal(recent.remotePageId, "cloud-1");
  assert.equal(recent.remotePageUrl, archive.archiveUrl);
  assert.equal(recent.remoteOrigin, "cloud");
  assert.equal(recent.savedAt, archive.savedAt);
  assert.equal(recent.downloadedAt, archive.updatedAt);
});

test("mergeRecentSavesWithCloudArchives replaces cloud cache with server archives and keeps non-cloud items", () => {
  const localObsidian = buildRecentSave();
  const staleCloud = buildRecentSave({
    id: "legacy-cloud-cache",
    saveTarget: "cloud",
    savedVia: "cloud",
    canonicalUrl: "https://www.threads.com/@writer/post/AAA111",
    shortcode: "AAA111",
    savedAt: "2026-03-20T08:00:00.000Z",
    downloadedAt: "2026-03-28T08:00:00.000Z",
    archiveName: "Old cloud cache",
    contentHash: "old-hash",
    remotePageId: "old-cloud-id",
    remotePageUrl: "https://ss-threads.dahanda.dev/scrapbook/@writer/archive/old-cloud-id",
    post: buildPost({
      contentHash: "old-hash"
    })
  });
  const freshCloud = buildCloudArchive();

  const merged = mergeRecentSavesWithCloudArchives([localObsidian, staleCloud], [freshCloud]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.id, "local-1");
  assert.equal(merged[1]?.id, "cloud-1");
  assert.equal(merged[1]?.contentHash, "hash-1");
  assert.equal(merged.some((item) => item.id === "legacy-cloud-cache"), false);
});
