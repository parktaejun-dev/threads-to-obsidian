import assert from "node:assert/strict";
import test from "node:test";

import type { ArchiveRecord, FolderEntry } from "../packages/mobile-app/src/types.ts";

const {
  buildArchiveMarkdown,
  filterArchiveViews,
  mapArchiveViews,
  parseTagInput,
  summarizeTags
} = await import("../packages/mobile-app/src/archive-utils");

function createArchive(id: string, title: string, text: string): ArchiveRecord {
  return {
    id,
    mentionId: `mention-${id}`,
    mentionUrl: null,
    sourceMentionText: null,
    canonicalUrl: `https://www.threads.com/@tester/post/${id}`,
    shortcode: id,
    author: "tester",
    title,
    text,
    publishedAt: "2026-04-05T01:00:00.000Z",
    capturedAt: "2026-04-05T01:00:00.000Z",
    sourceType: "text",
    imageUrls: [],
    videoUrl: null,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl: null,
    authorReplies: [],
    markdownContent: `# ${title}\n\n${text}\n`,
    savedAt: "2026-04-05T01:10:00.000Z",
    updatedAt: "2026-04-05T01:10:00.000Z"
  };
}

test("mobile app archive utils apply local overrides into views and filters", () => {
  const folders: FolderEntry[] = [
    {
      id: "folder-1",
      name: "Ideas",
      createdAt: "2026-04-05T01:00:00.000Z",
      updatedAt: "2026-04-05T01:00:00.000Z"
    }
  ];
  const views = mapArchiveViews(
    [createArchive("one", "Original title", "hello world"), createArchive("two", "Second", "other text")],
    {
      one: {
        archiveId: "one",
        customTitle: "Edited title",
        noteText: "Saved note",
        tags: ["alpha", "beta"],
        updatedAt: "2026-04-05T01:20:00.000Z"
      }
    },
    { one: "folder-1" },
    folders
  );

  assert.equal(views[0]?.displayTitle, "Edited title");
  assert.equal(views[0]?.folderName, "Ideas");

  const filtered = filterArchiveViews(views, {
    query: "saved note",
    activeTag: "alpha",
    activeFolderId: "folder-1"
  });

  assert.deepEqual(filtered.map((item) => item.id), ["one"]);
  assert.deepEqual(summarizeTags(views), [
    { tag: "alpha", count: 1 },
    { tag: "beta", count: 1 }
  ]);
});

test("mobile app archive utils build markdown with local notes and tags", () => {
  const [view] = mapArchiveViews(
    [createArchive("abc", "Original", "Body text")],
    {
      abc: {
        archiveId: "abc",
        customTitle: "Local title",
        noteText: "Remember this",
        tags: ["threads", "local"],
        updatedAt: "2026-04-05T01:20:00.000Z"
      }
    },
    {},
    []
  );

  const markdown = buildArchiveMarkdown(view!);
  assert.match(markdown, /^# Local title/m);
  assert.match(markdown, /Tags: #threads #local/);
  assert.match(markdown, /## Note\nRemember this/);
  assert.match(markdown, /## Post\nBody text/);
});

test("mobile app archive utils parse hashtag and comma tag input consistently", () => {
  assert.deepEqual(parseTagInput("#One #two"), ["one", "two"]);
  assert.deepEqual(parseTagInput("alpha, beta gamma"), ["alpha", "beta", "gamma"]);
});
