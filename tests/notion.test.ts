import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNotionPageIdInput, savePostToNotion } from "../packages/extension/src/lib/notion";
import type { ExtractedPost, NotionSettings } from "../packages/extension/src/lib/types";

const basePost: ExtractedPost = {
  canonicalUrl: "https://www.threads.com/@writer/post/NOTE123",
  shortcode: "NOTE123",
  author: "writer",
  title: "writer on Threads",
  text: "본문 예시",
  publishedAt: "2026-03-08T08:00:00.000Z",
  capturedAt: "2026-03-08T08:01:00.000Z",
  sourceType: "image",
  imageUrls: ["https://cdn.example.com/image-1.jpg"],
  videoUrl: null,
  externalUrl: null,
  quotedPostUrl: null,
  repliedToUrl: null,
  thumbnailUrl: null,
  authorReplies: [],
  extractorVersion: "2026-03-08",
  contentHash: "deadbeef"
};

function buildNotionSettings(overrides: Partial<NotionSettings> = {}): NotionSettings {
  return {
    token: "secret_test_token",
    parentType: "page",
    parentPageId: "",
    dataSourceId: "",
    uploadMedia: false,
    oauthConnected: true,
    workspaceId: "workspace-1",
    workspaceName: "Workspace",
    workspaceIcon: "",
    selectedParentLabel: "",
    selectedParentUrl: "",
    ...overrides
  };
}

test("normalizeNotionPageIdInput accepts a full Notion URL", () => {
  const normalized = normalizeNotionPageIdInput(
    "https://www.notion.so/My-page-123456781234123412341234567890ab?pvs=4"
  );

  assert.equal(normalized, "12345678-1234-1234-1234-1234567890ab");
});

test("savePostToNotion posts markdown to the Notion API", async () => {
  const originalFetch = globalThis.fetch;
  const previousChrome = (globalThis as { chrome?: typeof chrome }).chrome;
  let requestBody: any = null;
  let requestHeaders: Record<string, string> | null = null;

  (globalThis as { chrome?: typeof chrome }).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    }
  } as unknown as typeof chrome;

  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body ?? "{}"));
    requestHeaders = Object.fromEntries(new Headers(init?.headers).entries());
    return new Response(
      JSON.stringify({
        id: "page-123",
        url: "https://www.notion.so/page-123"
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const result = await savePostToNotion(
      basePost,
      buildNotionSettings({
        parentType: "page",
        parentPageId: "https://www.notion.so/My-page-123456781234123412341234567890ab"
      }),
      true
    );

    assert.equal(result.pageId, "page-123");
    assert.equal(result.pageUrl, "https://www.notion.so/page-123");
    const headers = requestHeaders as unknown as Record<string, string>;
    assert.equal(headers.authorization, "Bearer secret_test_token");
    assert.equal(headers["notion-version"], "2026-03-11");
    assert.equal(requestBody.parent.page_id, "12345678-1234-1234-1234-1234567890ab");
    assert.equal(typeof requestBody.markdown, "string");
    assert.equal(requestBody.markdown.startsWith("---"), false);
    assert.ok(requestBody.markdown.includes("# writer on Threads"));
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { chrome?: typeof chrome }).chrome = previousChrome;
  }
});

test("savePostToNotion maps supported fields when saving to a data source", async () => {
  const originalFetch = globalThis.fetch;
  const previousChrome = (globalThis as { chrome?: typeof chrome }).chrome;
  const fetchCalls: Array<{ url: string; body: any }> = [];

  (globalThis as { chrome?: typeof chrome }).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    }
  } as unknown as typeof chrome;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    fetchCalls.push({
      url,
      body: init?.body ? JSON.parse(String(init.body)) : null
    });

    if (url.includes("/v1/data_sources/")) {
      return new Response(
        JSON.stringify({
          id: "1a44be12-0953-4631-b498-9e5817518db8",
          properties: {
            Name: { id: "title-prop", type: "title" },
            Tags: { id: "tags-prop", type: "multi_select", multi_select: { options: [] } },
            Author: { id: "author-prop", type: "rich_text" },
            "Source URL": { id: "url-prop", type: "url" },
            Published: { id: "published-prop", type: "date" },
            "Captured At": { id: "captured-prop", type: "date" },
            Replies: { id: "replies-prop", type: "number" },
            "Has Images": { id: "images-prop", type: "checkbox" }
          }
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        id: "page-456",
        url: "https://www.notion.so/page-456"
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const result = await savePostToNotion(
      {
        ...basePost,
        authorReplies: [
          {
            author: "writer",
            canonicalUrl: "https://www.threads.com/@writer/post/NOTE124",
            shortcode: "NOTE124",
            text: "reply",
            publishedAt: "2026-03-08T08:02:00.000Z",
            sourceType: "text",
            imageUrls: [],
            videoUrl: null,
            externalUrl: null,
            thumbnailUrl: null
          }
        ]
      },
      buildNotionSettings({
        parentType: "data_source",
        parentPageId: "",
        dataSourceId: "https://www.notion.so/My-ds-1a44be1209534631b4989e5817518db8"
      }),
      true
    );

    assert.equal(result.pageId, "page-456");
    const createRequest = fetchCalls.find((call) => call.url.endsWith("/v1/pages"));
    assert.ok(createRequest);
    assert.equal(createRequest?.body.parent.data_source_id, "1a44be12-0953-4631-b498-9e5817518db8");
    assert.deepEqual(createRequest?.body.properties["title-prop"].title[0].text.content, "writer on Threads");
    assert.deepEqual(createRequest?.body.properties["url-prop"].url, basePost.canonicalUrl);
    assert.deepEqual(createRequest?.body.properties["author-prop"].rich_text[0].text.content, "@writer");
    assert.deepEqual(createRequest?.body.properties["replies-prop"].number, 1);
    assert.deepEqual(createRequest?.body.properties["images-prop"].checkbox, true);
    assert.deepEqual(createRequest?.body.properties["tags-prop"].multi_select[0].name, "threads");
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { chrome?: typeof chrome }).chrome = previousChrome;
  }
});

test("savePostToNotion uploads media files and appends uploaded blocks when enabled", async () => {
  const originalFetch = globalThis.fetch;
  const previousChrome = (globalThis as { chrome?: typeof chrome }).chrome;
  const fetchCalls: Array<{ url: string; method: string; body: unknown; contentType: string | null }> = [];

  (globalThis as { chrome?: typeof chrome }).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    }
  } as unknown as typeof chrome;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    fetchCalls.push({
      url,
      method: init?.method ?? "GET",
      body: init?.body ?? null,
      contentType: init?.headers ? new Headers(init.headers).get("content-type") : null
    });

    if (url === "https://cdn.example.com/image-1.jpg") {
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        headers: {
          "content-type": "image/jpeg"
        }
      });
    }

    if (url === "https://api.notion.com/v1/file_uploads") {
      return new Response(
        JSON.stringify({
          id: "file-upload-1",
          status: "pending",
          upload_url: "https://api.notion.com/v1/file_uploads/file-upload-1/send"
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    if (url === "https://api.notion.com/v1/file_uploads/file-upload-1/send") {
      return new Response(
        JSON.stringify({
          id: "file-upload-1",
          status: "uploaded"
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    if (url === "https://api.notion.com/v1/pages") {
      return new Response(
        JSON.stringify({
          id: "page-789",
          url: "https://www.notion.so/page-789"
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    if (url === "https://api.notion.com/v1/blocks/page-789/children") {
      return new Response(
        JSON.stringify({
          results: []
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const result = await savePostToNotion(
      basePost,
      buildNotionSettings({
        parentType: "page",
        parentPageId: "https://www.notion.so/My-page-123456781234123412341234567890ab",
        uploadMedia: true
      }),
      true,
      undefined,
      {
        allowMediaDownloads: true,
        fallbackWarning: "fallback"
      }
    );

    assert.equal(result.pageId, "page-789");
    const createRequest = fetchCalls.find((call) => call.url === "https://api.notion.com/v1/pages");
    assert.ok(createRequest);
    const createBody = JSON.parse(String(createRequest?.body ?? "{}"));
    assert.equal(createBody.markdown.includes("https://cdn.example.com/image-1.jpg"), false);

    const sendRequest = fetchCalls.find((call) => call.url.endsWith("/file-upload-1/send"));
    assert.ok(sendRequest);
    assert.equal(sendRequest?.contentType, null);
    assert.ok(sendRequest?.body instanceof FormData);

    const appendRequest = fetchCalls.find((call) => call.url.endsWith("/blocks/page-789/children"));
    assert.ok(appendRequest);
    const appendBody = JSON.parse(String(appendRequest?.body ?? "{}"));
    assert.equal(appendBody.children[0].type, "heading_2");
    assert.equal(appendBody.children[2].type, "image");
    assert.equal(appendBody.children[2].image.file_upload.id, "file-upload-1");
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { chrome?: typeof chrome }).chrome = previousChrome;
  }
});
