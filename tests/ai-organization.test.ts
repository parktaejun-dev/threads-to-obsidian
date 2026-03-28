import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { buildArchiveNoteFilename, buildZipPackage } from "../packages/extension/src/lib/package";
import type { AiOrganizationSettings, ExtractedPost } from "../packages/extension/src/lib/types";

const post: ExtractedPost = {
  canonicalUrl: "https://www.threads.com/@writer/post/AI123",
  shortcode: "AI123",
  author: "writer",
  title: "writer on Threads",
  text: "Threads에서 저장한 내용을 다시 정리하고 싶다.",
  publishedAt: "2026-03-22T10:00:00.000Z",
  capturedAt: "2026-03-22T10:01:00.000Z",
  sourceType: "text",
  imageUrls: [],
  videoUrl: null,
  externalUrl: null,
  quotedPostUrl: null,
  repliedToUrl: null,
  thumbnailUrl: null,
  authorReplies: [],
  extractorVersion: "2026-03-22",
  contentHash: "ai123hash"
};

const aiSettings: AiOrganizationSettings = {
  provider: "openai",
  enabled: true,
  apiKey: "test-key",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
  prompt: "Return a summary, tags, and source_kind."
};

test("AI organization can add summary, tags, and frontmatter to the saved note", async () => {
  const previousChrome = (globalThis as any).chrome;
  const previousFetch = globalThis.fetch;

  (globalThis as any).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    },
    storage: {
      local: {
        async get() {
          return {};
        }
      }
    }
  };

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "짧게 요약한 저장 노트입니다.",
                tags: ["threads", "obsidian-sync", "automation"],
                frontmatter: {
                  source_kind: "thread",
                  language: "ko"
                }
              })
            }
          }
        ]
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );

  try {
    const result = await buildZipPackage(post, "{author}_{shortcode}", false, undefined, "", aiSettings);
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const note = await zip.file(`${result.archiveName}/${buildArchiveNoteFilename(result.archiveName)}`)?.async("string");

    assert.ok(note);
    assert.ok(note.includes("summary: \"짧게 요약한 저장 노트입니다.\""));
    assert.ok(note.includes('- "obsidian-sync"'));
    assert.ok(note.includes("source_kind: \"thread\""));
    assert.ok(note.includes("language: \"ko\""));
    assert.ok(note.includes("## AI Summary") || note.includes("## AI 요약"));
  } finally {
    (globalThis as any).chrome = previousChrome;
    globalThis.fetch = previousFetch;
  }
});

test("Gemini provider uses its native endpoint and still writes AI metadata", async () => {
  const previousChrome = (globalThis as any).chrome;
  const previousFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestBody = "";

  (globalThis as any).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    },
    storage: {
      local: {
        async get() {
          return {};
        }
      }
    }
  };

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestBody = typeof init?.body === "string" ? init.body : "";

    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    summary: "Gemini가 생성한 요약입니다.",
                    tags: ["gemini", "threads"],
                    frontmatter: {
                      provider: "gemini"
                    }
                  })
                }
              ]
            }
          }
        ]
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const result = await buildZipPackage(
      post,
      "{author}_{shortcode}",
      false,
      undefined,
      "",
      {
        ...aiSettings,
        provider: "gemini",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        model: "gemini-2.0-flash"
      }
    );
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const note = await zip.file(`${result.archiveName}/${buildArchiveNoteFilename(result.archiveName)}`)?.async("string");

    assert.ok(requestedUrl.includes("/models/gemini-2.0-flash:generateContent"));
    assert.ok(requestedUrl.includes("key=test-key"));
    assert.ok(requestBody.includes("\"responseMimeType\":\"application/json\""));
    assert.ok(note);
    assert.ok(note.includes("summary: \"Gemini가 생성한 요약입니다.\""));
    assert.ok(note.includes("provider: \"gemini\""));
  } finally {
    (globalThis as any).chrome = previousChrome;
    globalThis.fetch = previousFetch;
  }
});

test("DeepSeek provider uses its OpenAI-compatible endpoint and writes AI metadata", async () => {
  const previousChrome = (globalThis as any).chrome;
  const previousFetch = globalThis.fetch;
  let requestedUrl = "";
  let authorizationHeader = "";

  (globalThis as any).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    },
    storage: {
      local: {
        async get() {
          return {};
        }
      }
    }
  };

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    authorizationHeader = String((init?.headers as Record<string, string> | undefined)?.authorization ?? "");

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "DeepSeek가 생성한 요약입니다.",
                tags: ["deepseek", "threads"],
                frontmatter: {
                  provider: "deepseek"
                }
              })
            }
          }
        ]
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const result = await buildZipPackage(
      post,
      "{author}_{shortcode}",
      false,
      undefined,
      "",
      {
        ...aiSettings,
        provider: "deepseek",
        baseUrl: "https://api.deepseek.com/v1",
        model: "deepseek-chat"
      }
    );
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const note = await zip.file(`${result.archiveName}/${buildArchiveNoteFilename(result.archiveName)}`)?.async("string");

    assert.equal(requestedUrl, "https://api.deepseek.com/v1/chat/completions");
    assert.equal(authorizationHeader, "Bearer test-key");
    assert.ok(note);
    assert.ok(note.includes("summary: \"DeepSeek가 생성한 요약입니다.\""));
    assert.ok(note.includes("provider: \"deepseek\""));
  } finally {
    (globalThis as any).chrome = previousChrome;
    globalThis.fetch = previousFetch;
  }
});

test("AI failure warning includes the active provider and base URL", async () => {
  const previousChrome = (globalThis as any).chrome;
  const previousFetch = globalThis.fetch;

  (globalThis as any).chrome = {
    permissions: {
      async contains() {
        return true;
      }
    },
    storage: {
      local: {
        async get() {
          return {};
        }
      }
    }
  };

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: {
          message: "Incorrect API key provided."
        }
      }),
      {
        status: 401,
        headers: {
          "content-type": "application/json"
        }
      }
    );

  try {
    const result = await buildZipPackage(post, "{author}_{shortcode}", false, undefined, "", aiSettings);
    assert.ok(result.warning);
    assert.ok(result.warning.includes("openai @ https://api.openai.com/v1"));
  } finally {
    (globalThis as any).chrome = previousChrome;
    globalThis.fetch = previousFetch;
  }
});
