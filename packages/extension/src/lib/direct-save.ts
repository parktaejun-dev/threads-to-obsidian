import { t } from "./i18n";
import { buildArchiveBundle, buildArchiveNoteFilename } from "./package";
import type { AiOrganizationSettings, ExtractedPost } from "./types";
import { buildPathPatternParts } from "./utils";

export interface DirectSaveResult {
  archiveName: string;
  title: string;
  savedRelativePath: string;
  warning: string | null;
}

type ReadWritePermissionState = PermissionState | "unsupported";
type PickerWindow = Window & {
  showDirectoryPicker?: (options?: { id?: string; mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};
type PermissionDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
};

function getPickerWindow(): PickerWindow {
  return window as PickerWindow;
}

export function supportsFileSystemAccess(): boolean {
  return typeof getPickerWindow().showDirectoryPicker === "function";
}

export async function pickDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  if (!supportsFileSystemAccess()) {
    throw new Error((await t()).errBrowserUnsupported);
  }

  const showDirectoryPicker = getPickerWindow().showDirectoryPicker;
  if (typeof showDirectoryPicker !== "function") {
    throw new Error((await t()).errBrowserUnsupported);
  }

  return await showDirectoryPicker({
    id: "obsidian-vault-target",
    mode: "readwrite"
  });
}

export async function queryDirectoryPermission(handle: FileSystemDirectoryHandle): Promise<ReadWritePermissionState> {
  const permissionHandle = handle as PermissionDirectoryHandle;
  const queryPermission = permissionHandle.queryPermission;
  if (typeof queryPermission !== "function") {
    return "unsupported";
  }

  return await queryPermission.call(permissionHandle, { mode: "readwrite" });
}

export async function requestDirectoryPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const permissionHandle = handle as PermissionDirectoryHandle;
  const requestPermission = permissionHandle.requestPermission;
  if (typeof requestPermission !== "function") {
    return false;
  }

  const requested = await requestPermission.call(permissionHandle, { mode: "readwrite" });
  return requested === "granted";
}

async function hasDirectory(parent: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try {
    await parent.getDirectoryHandle(name);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return false;
    }
    throw error;
  }
}

async function findAvailableDirectoryName(parent: FileSystemDirectoryHandle, baseName: string): Promise<string> {
  if (!(await hasDirectory(parent, baseName))) {
    return baseName;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${baseName} (${index})`;
    if (!(await hasDirectory(parent, candidate))) {
      return candidate;
    }
  }

  throw new Error((await t()).errFolderNameFailed);
}

async function ensureSubdirectory(root: FileSystemDirectoryHandle, relativeParts: string[]): Promise<FileSystemDirectoryHandle> {
  let current = root;

  for (const part of relativeParts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }

  return current;
}

async function writeFile(root: FileSystemDirectoryHandle, relativePath: string, blob: Blob): Promise<void> {
  const parts = relativePath.split("/").filter(Boolean);
  const filename = parts.pop();

  if (!filename) {
    throw new Error((await t()).errInvalidPath);
  }

  const directory = await ensureSubdirectory(root, parts);
  const fileHandle = await directory.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function writePostToDirectory(
  rootHandle: FileSystemDirectoryHandle,
  post: ExtractedPost,
  filenamePattern: string,
  includeImages: boolean,
  fallbackWarning?: string,
  savePathPattern = "",
  aiOrganization?: AiOrganizationSettings
): Promise<DirectSaveResult> {
  const bundle = await buildArchiveBundle(post, filenamePattern, includeImages, fallbackWarning, aiOrganization);
  const routeParts = buildPathPatternParts(savePathPattern, post);
  const targetRoot = await ensureSubdirectory(rootHandle, routeParts);
  const archiveName = await findAvailableDirectoryName(targetRoot, bundle.archiveName);
  const archiveDirectory = await targetRoot.getDirectoryHandle(archiveName, { create: true });
  const markdownFilename = buildArchiveNoteFilename(archiveName);

  await writeFile(archiveDirectory, markdownFilename, new Blob([bundle.markdownContent], { type: "text/markdown;charset=utf-8" }));
  for (const assetFile of bundle.assetFiles) {
    await writeFile(archiveDirectory, assetFile.relativePath, assetFile.blob);
  }

  return {
    archiveName,
    title: bundle.title,
    savedRelativePath: [...routeParts, archiveName, markdownFilename].join("/"),
    warning: bundle.warning
  };
}
