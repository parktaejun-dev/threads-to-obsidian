import type { AiOrganizationSettings, AiProvider, ExtensionOptions, ExtractorConfig } from "./types";

export interface AiProviderPreset {
  baseUrl: string;
  model: string;
  apiKeyOptional: boolean;
  transport: "openai" | "gemini";
}

export const DEFAULT_AI_ORGANIZATION_PROMPT =
  "Summarize the post in 1-3 sentences. Add up to 5 concise tags. Add only useful flat frontmatter fields when confident, such as topic, language, sentiment, or source_kind.";

export const NOTION_UI_HIDDEN = false;

export const AI_PROVIDER_PRESETS: Record<AiProvider, AiProviderPreset> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKeyOptional: false,
    transport: "openai"
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash",
    apiKeyOptional: false,
    transport: "gemini"
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    apiKeyOptional: true,
    transport: "openai"
  },
  custom: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  }
};

export function getAiProviderPreset(provider: AiProvider): AiProviderPreset {
  return AI_PROVIDER_PRESETS[provider];
}

export type AiProviderKeyMismatch = "gemini_key_looks_openai" | "openai_compatible_key_looks_gemini";

export function getAiProviderKeyMismatch(provider: AiProvider, apiKey: string): AiProviderKeyMismatch | null {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return null;
  }

  const looksLikeGeminiKey = /^AIza[0-9A-Za-z_-]{10,}$/.test(trimmed);
  const looksLikeOpenAiCompatibleKey = /^sk-[0-9A-Za-z_-]{8,}$/.test(trimmed);

  if (provider === "gemini" && looksLikeOpenAiCompatibleKey) {
    return "gemini_key_looks_openai";
  }

  if ((provider === "openai" || provider === "openrouter" || provider === "deepseek") && looksLikeGeminiKey) {
    return "openai_compatible_key_looks_gemini";
  }

  return null;
}

export const DEFAULT_AI_ORGANIZATION_SETTINGS: AiOrganizationSettings = {
  provider: "openai",
  enabled: false,
  apiKey: "",
  baseUrl: AI_PROVIDER_PRESETS.openai.baseUrl,
  model: AI_PROVIDER_PRESETS.openai.model,
  prompt: DEFAULT_AI_ORGANIZATION_PROMPT
};

export const DEFAULT_OPTIONS: ExtensionOptions = {
  saveTarget: "obsidian",
  filenamePattern: "{author}_{first_sentence_20}",
  savePathPattern: "",
  includeImages: true,
  obsidianFolderLabel: null,
  notion: {
    token: "",
    parentType: "page",
    parentPageId: "",
    dataSourceId: "",
    uploadMedia: false,
    oauthConnected: false,
    workspaceId: "",
    workspaceName: "",
    workspaceIcon: "",
    selectedParentLabel: "",
    selectedParentUrl: ""
  },
  aiOrganization: DEFAULT_AI_ORGANIZATION_SETTINGS
};

export const BUNDLED_EXTRACTOR_CONFIG: ExtractorConfig = {
  version: "2026-03-08",
  noisePatterns: ["번역하기", "더 보기", "좋아요", "댓글", "리포스트", "공유하기"],
  maxRecentSaves: 10
};
