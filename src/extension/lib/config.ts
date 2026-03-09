import type { ExtensionOptions, ExtractorConfig } from "./types";

export const DEFAULT_OPTIONS: ExtensionOptions = {
  filenamePattern: "{author}_{first_sentence}",
  includeImages: true,
  obsidianFolderLabel: null
};

export const BUNDLED_EXTRACTOR_CONFIG: ExtractorConfig = {
  version: "2026-03-08",
  noisePatterns: ["번역하기", "더 보기", "좋아요", "댓글", "리포스트", "공유하기"],
  maxRecentSaves: 10
};
