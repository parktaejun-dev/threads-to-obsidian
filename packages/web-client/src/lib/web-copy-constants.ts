export const DEFAULT_BOT_HANDLE = "ss_threads_bot";
export const BOT_HANDLE_PLACEHOLDER = "@{botHandle}";

export const EXTENSION_RELEASE_ASSET_NAME = "ss-threads-extension.zip";
export const EXTENSION_UNPACKED_FOLDER = "ss-threads-extension";
export const EXTENSION_REPO_URL = "https://github.com/parktaejun-dev/threads-to-obsidian";
export const EXTENSION_RELEASE_DOWNLOAD_URL =
  `${EXTENSION_REPO_URL}/releases/latest/download/${EXTENSION_RELEASE_ASSET_NAME}`;

export function normalizeBotHandleValue(value: string | null | undefined, fallback = ""): string {
  return `${value ?? ""}`.trim().replace(/^@+/, "") || fallback;
}
