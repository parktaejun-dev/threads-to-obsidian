import { DEFAULT_OPTIONS } from "./config";
import type { ExtensionOptions, RecentSave } from "./types";
import { decodeEscapedJsonString } from "./utils";

const OPTIONS_KEY = "options";
const RECENT_SAVES_KEY = "recent-saves";
const LEGACY_DEFAULT_FILENAME_PATTERN = "{date}__{author}__{shortcode}";
const PREVIOUS_DEFAULT_FILENAME_PATTERN = "{date}_{author}_{shortcode}";
const MAX_RECENT_SAVES = 10;

function normalizeRecentSave(item: RecentSave & { zipFilename?: string }): RecentSave {
  const archiveName = item.archiveName ?? item.zipFilename?.replace(/\.zip$/i, "") ?? "";
  const post = {
    ...item.post,
    title: decodeEscapedJsonString(item.post.title),
    text: decodeEscapedJsonString(item.post.text),
    authorReplies: item.post.authorReplies.map((reply) => ({
      ...reply,
      text: decodeEscapedJsonString(reply.text)
    }))
  };

  return {
    ...item,
    archiveName,
    savedVia: item.savedVia ?? "zip",
    savedRelativePath: item.savedRelativePath ?? null,
    warning: item.warning ?? null,
    post,
    title: decodeEscapedJsonString(item.title)
  };
}

export async function getOptions(): Promise<ExtensionOptions> {
  const stored = await chrome.storage.local.get(OPTIONS_KEY);
  const merged = { ...DEFAULT_OPTIONS, ...(stored[OPTIONS_KEY] as Partial<ExtensionOptions> | undefined) };
  let shouldPersist = false;

  if (
    !merged.filenamePattern ||
    merged.filenamePattern === LEGACY_DEFAULT_FILENAME_PATTERN ||
    merged.filenamePattern === PREVIOUS_DEFAULT_FILENAME_PATTERN
  ) {
    merged.filenamePattern = DEFAULT_OPTIONS.filenamePattern;
    shouldPersist = true;
  }

  if (merged.obsidianFolderLabel === undefined) {
    merged.obsidianFolderLabel = DEFAULT_OPTIONS.obsidianFolderLabel;
    shouldPersist = true;
  }

  if (shouldPersist) {
    await chrome.storage.local.set({ [OPTIONS_KEY]: merged });
  }
  return merged;
}

export async function setOptions(options: ExtensionOptions): Promise<void> {
  await chrome.storage.local.set({ [OPTIONS_KEY]: { ...DEFAULT_OPTIONS, ...options } });
}

export async function getRecentSaves(): Promise<RecentSave[]> {
  const stored = await chrome.storage.local.get(RECENT_SAVES_KEY);
  const recent = ((stored[RECENT_SAVES_KEY] as Array<RecentSave & { zipFilename?: string }> | undefined) ?? []).map(normalizeRecentSave);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: recent });
  return recent;
}

export async function upsertRecentSave(save: RecentSave): Promise<RecentSave[]> {
  const recent = await getRecentSaves();
  const filtered = recent.filter((item) => item.id !== save.id && item.canonicalUrl !== save.canonicalUrl);
  filtered.unshift(save);
  const next = filtered.slice(0, MAX_RECENT_SAVES);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: next });

  return next;
}

export async function findRecentSaveById(id: string): Promise<RecentSave | null> {
  const recent = await getRecentSaves();
  return recent.find((item) => item.id === id) ?? null;
}

export async function removeRecentSaveById(id: string): Promise<RecentSave[]> {
  const recent = await getRecentSaves();
  const next = recent.filter((item) => item.id !== id);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: next });
  return next;
}

export async function clearRecentSaves(): Promise<void> {
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: [] });
}

export async function findDuplicateSave(canonicalUrl: string, contentHash: string): Promise<RecentSave | null> {
  const recent = await getRecentSaves();
  return recent.find((item) => item.canonicalUrl === canonicalUrl && item.contentHash === contentHash) ?? null;
}

export async function findRecentSaveByUrl(canonicalUrl: string): Promise<RecentSave | null> {
  const recent = await getRecentSaves();
  return recent.find((item) => item.canonicalUrl === canonicalUrl) ?? null;
}
