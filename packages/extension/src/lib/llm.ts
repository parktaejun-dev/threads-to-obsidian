import { getAiProviderPreset } from "./config";
import { getLocale, t, type Locale } from "./i18n";
import { sanitizeGeneratedTitle } from "./utils";
import type { AiOrganizationResult, AiOrganizationSettings, ExtractedPost, FrontmatterPrimitive, FrontmatterValue } from "./types";

const RESERVED_FRONTMATTER_KEYS = new Set([
  "title",
  "ai_title",
  "author",
  "tags",
  "summary",
  "canonical_url",
  "shortcode",
  "published_at",
  "captured_at",
  "source_type",
  "has_images",
  "has_external_url",
  "quoted_post_url",
  "replied_to_url",
  "author_reply_count"
]);

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const AI_OUTPUT_LANGUAGE_LABELS: Record<Locale, string> = {
  ko: "Korean",
  en: "English",
  ja: "Japanese",
  "pt-BR": "Brazilian Portuguese",
  es: "Spanish",
  "zh-TW": "Traditional Chinese",
  vi: "Vietnamese"
};

function normalizeBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.trim();
  if (!normalized) {
    throw new Error("Missing AI base URL.");
  }

  const parsed = new URL(normalized);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Unsupported AI base URL protocol.");
  }

  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

export function getAiPermissionPattern(baseUrl: string): string {
  const parsed = new URL(normalizeBaseUrl(baseUrl));
  return `${parsed.protocol}//${parsed.hostname}/*`;
}

export async function requestAiHostPermission(baseUrl: string): Promise<boolean> {
  if (!chrome.permissions?.request) {
    return false;
  }

  try {
    return await chrome.permissions.request({
      origins: [getAiPermissionPattern(baseUrl)]
    });
  } catch {
    return false;
  }
}

async function hasAiHostPermission(baseUrl: string): Promise<boolean> {
  if (!chrome.permissions?.contains) {
    return false;
  }

  try {
    return await chrome.permissions.contains({
      origins: [getAiPermissionPattern(baseUrl)]
    });
  } catch {
    return false;
  }
}

function isFlatPrimitiveArray(value: unknown): value is FrontmatterPrimitive[] {
  return Array.isArray(value) && value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item));
}

function sanitizeFrontmatterKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function sanitizeFrontmatterValue(value: unknown): FrontmatterValue | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, 500) : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (isFlatPrimitiveArray(value)) {
    const items = value
      .map((item) => sanitizeFrontmatterValue(item))
      .filter((item): item is FrontmatterPrimitive => item !== null)
      .slice(0, 12);
    return items.length > 0 ? items : null;
  }

  return null;
}

function extractTextContent(content: string | Array<{ type?: string; text?: string }> | undefined): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text ?? "")
      .join("\n")
      .trim();
  }

  return "";
}

function extractGeminiTextContent(parts: Array<{ text?: string }> | undefined): string {
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

function extractJsonCandidate(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  const start = raw.indexOf("{");
  if (start < 0) {
    return raw.trim();
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, index + 1).trim();
      }
    }
  }

  return raw.trim();
}

function buildSystemInstruction(locale: Locale): string {
  const languageLabel = AI_OUTPUT_LANGUAGE_LABELS[locale];
  return [
    "You convert Threads posts into clean Obsidian metadata.",
    "Output JSON only.",
    `Write title and summary in ${languageLabel} (${locale}) unless the user's extra rules explicitly request another language.`
  ].join(" ");
}

function buildPrompt(post: ExtractedPost, settings: AiOrganizationSettings, locale: Locale): string {
  const replyBlock =
    post.authorReplies.length > 0
      ? post.authorReplies
          .map(
            (reply, index, replies) =>
              `Reply ${index + 1}/${replies.length}\nAuthor: @${reply.author}\nPublished: ${reply.publishedAt ?? "unknown"}\nText:\n${reply.text}`
          )
          .join("\n\n")
      : "None";

  return [
    "Return JSON only.",
    "",
    "Schema:",
    "{",
    '  "title": "string | null",',
    '  "summary": "string | null",',
    '  "tags": ["string"],',
    '  "frontmatter": { "flat_key": "string | number | boolean | null | array" }',
    "}",
    "",
    "Rules:",
    "- title should be plain text, specific, and short enough to use as a note title.",
    "- Keep summary concise and factual.",
    "- tags should be short, lowercase, and reusable in Obsidian.",
    "- frontmatter must be flat. No nested objects.",
    "- Do not repeat default fields like title, ai_title, author, canonical_url, shortcode, tags, or summary inside frontmatter.",
    `- Write title and summary in ${AI_OUTPUT_LANGUAGE_LABELS[locale]} (${locale}) unless user rules explicitly request another language.`,
    "- If unsure, return null or an empty array/object.",
    "",
    `User rules:\n${settings.prompt.trim() || "No extra rules."}`,
    "",
    "Post:",
    `Author: @${post.author}`,
    `Canonical URL: ${post.canonicalUrl}`,
    `Published: ${post.publishedAt ?? "unknown"}`,
    `Source type: ${post.sourceType}`,
    `External URL: ${post.externalUrl ?? "none"}`,
    "",
    "Main text:",
    post.text,
    "",
    "Author replies:",
    replyBlock
  ].join("\n");
}

function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item
      .trim()
      .toLowerCase()
      .replace(/^#+/, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_\-가-힣]+/g, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    tags.push(normalized);

    if (tags.length >= 8) {
      break;
    }
  }

  return tags;
}

function sanitizeResult(raw: unknown): AiOrganizationResult {
  const parsed = typeof raw === "object" && raw ? (raw as Record<string, unknown>) : {};
  const title = typeof parsed.title === "string" ? sanitizeGeneratedTitle(parsed.title, 90) : null;
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim().slice(0, 600)
      : null;
  const tags = sanitizeTags(parsed.tags);
  const frontmatterInput =
    typeof parsed.frontmatter === "object" && parsed.frontmatter && !Array.isArray(parsed.frontmatter)
      ? (parsed.frontmatter as Record<string, unknown>)
      : {};
  const frontmatter: Record<string, FrontmatterValue> = {};

  for (const [rawKey, rawValue] of Object.entries(frontmatterInput)) {
    const key = sanitizeFrontmatterKey(rawKey);
    if (!key || RESERVED_FRONTMATTER_KEYS.has(key)) {
      continue;
    }

    const value = sanitizeFrontmatterValue(rawValue);
    if (value === null) {
      continue;
    }

    frontmatter[key] = value;
  }

  return { title, summary, tags, frontmatter };
}

function summarizeAiError(error: unknown, settings?: AiOrganizationSettings, normalizedBaseUrl?: string): string {
  if (!(error instanceof Error)) {
    return "Unknown error";
  }

  const baseMessage = error.message.trim().slice(0, 120) || "Unknown error";
  if (!settings || !normalizedBaseUrl) {
    return baseMessage;
  }

  return `${settings.provider} @ ${normalizedBaseUrl}: ${baseMessage}`.slice(0, 180);
}

function normalizeGeminiModel(model: string): string {
  return model.trim().replace(/^models\//, "");
}

async function requestOpenAiCompatibleCompletion(
  normalizedBaseUrl: string,
  model: string,
  systemInstruction: string,
  prompt: string,
  apiKey: string,
  signal: AbortSignal
): Promise<string> {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };
  if (apiKey.trim()) {
    headers.authorization = `Bearer ${apiKey.trim()}`;
  }

  const response = await fetch(`${normalizedBaseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: systemInstruction
        },
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    signal
  });

  const payload = (await response.json().catch(() => null)) as OpenAiChatCompletionResponse | null;
  if (!response.ok) {
    const reason = payload?.error?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(reason);
  }

  const rawContent = extractTextContent(payload?.choices?.[0]?.message?.content);
  if (!rawContent) {
    throw new Error("Empty AI response");
  }

  return rawContent;
}

async function requestGeminiCompletion(
  normalizedBaseUrl: string,
  model: string,
  systemInstruction: string,
  prompt: string,
  apiKey: string,
  signal: AbortSignal
): Promise<string> {
  const normalizedModel = normalizeGeminiModel(model);
  const requestUrl = new URL(`${normalizedBaseUrl}/models/${encodeURIComponent(normalizedModel)}:generateContent`);
  if (apiKey.trim()) {
    requestUrl.searchParams.set("key", apiKey.trim());
  }

  const response = await fetch(requestUrl.toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemInstruction
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    }),
    signal
  });

  const payload = (await response.json().catch(() => null)) as GeminiGenerateContentResponse | null;
  if (!response.ok) {
    const reason = payload?.error?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(reason);
  }

  const rawContent = extractGeminiTextContent(payload?.candidates?.[0]?.content?.parts);
  if (!rawContent) {
    throw new Error("Empty AI response");
  }

  return rawContent;
}

export async function organizePostWithAi(
  post: ExtractedPost,
  settings: AiOrganizationSettings
): Promise<{ result: AiOrganizationResult | null; warning: string | null }> {
  if (!settings.enabled) {
    return { result: null, warning: null };
  }

  let normalizedBaseUrl = "";
  try {
    normalizedBaseUrl = normalizeBaseUrl(settings.baseUrl);
    const model = settings.model.trim();
    const locale = await getLocale();
    if (!model) {
      return { result: null, warning: (await t()).warnAiMissingModel };
    }

    if (!(await hasAiHostPermission(normalizedBaseUrl))) {
      return { result: null, warning: (await t()).warnAiPermissionMissing };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const systemInstruction = buildSystemInstruction(locale);
    const prompt = buildPrompt(post, settings, locale);
    const transport = getAiProviderPreset(settings.provider).transport;

    try {
      const rawContent =
        transport === "gemini"
          ? await requestGeminiCompletion(normalizedBaseUrl, model, systemInstruction, prompt, settings.apiKey, controller.signal)
          : await requestOpenAiCompatibleCompletion(
              normalizedBaseUrl,
              model,
              systemInstruction,
              prompt,
              settings.apiKey,
              controller.signal
            );

      const candidate = extractJsonCandidate(rawContent);
      const parsed = JSON.parse(candidate) as unknown;
      const result = sanitizeResult(parsed);
      if (!result.title && !result.summary && result.tags.length === 0 && Object.keys(result.frontmatter).length === 0) {
        return { result: null, warning: null };
      }

      return { result, warning: null };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return {
      result: null,
      warning: (await t()).warnAiFailed.replace("{reason}", summarizeAiError(error, settings, normalizedBaseUrl))
    };
  }
}
