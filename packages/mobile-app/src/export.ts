import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import { shareAsync, isAvailableAsync as isShareAvailableAsync } from "expo-sharing";
import JSZip from "jszip";

import {
  buildArchiveAssetEntries,
  buildArchiveDirectoryName,
  buildArchiveMarkdown,
  sanitizeFilenameSegment
} from "./archive-utils";
import {
  loadExportState,
  loadMediaCacheRecord,
  saveExportState,
  upsertMediaCacheRecord
} from "./storage";
import type { ArchiveAssetEntry } from "./archive-utils";
import type { ArchiveView } from "./types";

export interface ExportOutcome {
  fileUri?: string | null;
  warning: string | null;
  exportedCount: number;
}

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function buildTempDirUri(): string {
  return `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ""}ss-threads-exports/`;
}

function buildMediaCacheDirUri(): string {
  return `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ""}ss-threads-media/`;
}

async function ensureDirectory(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

async function shareFile(uri: string, mimeType: string, dialogTitle: string): Promise<void> {
  if (!(await isShareAvailableAsync())) {
    throw new Error("This device does not support the system share sheet.");
  }
  await shareAsync(uri, {
    mimeType,
    dialogTitle
  });
}

async function ensureCachedAsset(archiveId: string, asset: ArchiveAssetEntry): Promise<{ localUri: string | null; warning: string | null }> {
  const existing = await loadMediaCacheRecord(asset.remoteUrl);
  if (existing?.localUri) {
    const info = await FileSystem.getInfoAsync(existing.localUri);
    if (info.exists) {
      return { localUri: existing.localUri, warning: null };
    }
  }

  await ensureDirectory(buildMediaCacheDirUri());
  const localUri = `${buildMediaCacheDirUri()}${hashString(asset.remoteUrl)}-${sanitizeFilenameSegment(asset.relativePath, "asset")}`;

  try {
    await FileSystem.downloadAsync(asset.remoteUrl, localUri);
    await upsertMediaCacheRecord({
      id: existing?.id ?? `${archiveId}:${hashString(asset.remoteUrl)}`,
      archiveId,
      remoteUrl: asset.remoteUrl,
      localUri,
      status: "cached",
      updatedAt: new Date().toISOString()
    });
    return { localUri, warning: null };
  } catch {
    await upsertMediaCacheRecord({
      id: existing?.id ?? `${archiveId}:${hashString(asset.remoteUrl)}`,
      archiveId,
      remoteUrl: asset.remoteUrl,
      localUri: null,
      status: "failed",
      updatedAt: new Date().toISOString()
    });
    return { localUri: null, warning: `Could not download ${asset.remoteUrl}` };
  }
}

async function buildArchiveExportPayload(item: ArchiveView): Promise<{
  markdownContent: string;
  assetFiles: Array<{ relativePath: string; localUri: string }>;
  warning: string | null;
}> {
  const assetEntries = buildArchiveAssetEntries(item);
  const assetRefs: Record<string, string> = {};
  const assetFiles: Array<{ relativePath: string; localUri: string }> = [];
  const warnings: string[] = [];

  for (const asset of assetEntries) {
    const result = await ensureCachedAsset(item.id, asset);
    if (result.localUri) {
      assetRefs[asset.remoteUrl] = asset.relativePath;
      assetFiles.push({
        relativePath: asset.relativePath,
        localUri: result.localUri
      });
    } else {
      assetRefs[asset.remoteUrl] = asset.remoteUrl;
    }
    if (result.warning) {
      warnings.push(result.warning);
    }
  }

  return {
    markdownContent: buildArchiveMarkdown(item, assetRefs),
    assetFiles,
    warning: warnings.length > 0 ? warnings.join("\n") : null
  };
}

export async function copyArchiveMarkdown(item: ArchiveView): Promise<void> {
  await Clipboard.setStringAsync(buildArchiveMarkdown(item));
}

export async function exportArchiveMarkdown(item: ArchiveView): Promise<ExportOutcome> {
  await ensureDirectory(buildTempDirUri());
  const filename = `${sanitizeFilenameSegment(item.displayTitle, "threads-post")}.md`;
  const fileUri = `${buildTempDirUri()}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, buildArchiveMarkdown(item), {
    encoding: FileSystem.EncodingType.UTF8
  });
  await shareFile(fileUri, "text/markdown", "Export markdown");
  await saveExportState({
    lastMarkdownExportAt: new Date().toISOString()
  });
  return {
    fileUri,
    warning: null,
    exportedCount: 1
  };
}

export async function exportArchivesZip(items: ArchiveView[]): Promise<ExportOutcome> {
  if (items.length === 0) {
    throw new Error("Choose at least one archive.");
  }

  await ensureDirectory(buildTempDirUri());
  const zip = new JSZip();
  const warnings: string[] = [];

  for (const item of items) {
    const directoryName = buildArchiveDirectoryName(item);
    const payload = await buildArchiveExportPayload(item);
    const markdownName = `01. ${sanitizeFilenameSegment(directoryName, "threads-post")}.md`;
    zip.file(`${directoryName}/${markdownName}`, payload.markdownContent);
    for (const asset of payload.assetFiles) {
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      zip.file(`${directoryName}/${asset.relativePath}`, base64, { base64: true });
    }
    if (payload.warning) {
      warnings.push(`${directoryName}: ${payload.warning}`);
    }
  }

  const archiveLabel =
    items.length === 1
      ? sanitizeFilenameSegment(items[0]?.displayTitle ?? "threads-scrapbook", "threads-scrapbook")
      : `threads-scrapbook-${new Date().toISOString().slice(0, 10)}`;
  const fileUri = `${buildTempDirUri()}${archiveLabel}.zip`;
  const base64 = await zip.generateAsync({ type: "base64" });
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64
  });
  await shareFile(fileUri, "application/zip", "Export ZIP");
  await saveExportState({
    lastZipExportAt: new Date().toISOString()
  });
  return {
    fileUri,
    warning: warnings.length > 0 ? warnings.join("\n") : null,
    exportedCount: items.length
  };
}

async function writeSafFile(fileUri: string, contents: string, encoding: FileSystem.EncodingType): Promise<void> {
  await FileSystem.StorageAccessFramework.writeAsStringAsync(fileUri, contents, {
    encoding
  });
}

async function ensureObsidianRoot(forcePick = false): Promise<{ directoryUri: string; directoryLabel: string | null }> {
  const current = await loadExportState();
  if (!forcePick && current.obsidianDirectoryUri) {
    return {
      directoryUri: current.obsidianDirectoryUri,
      directoryLabel: current.obsidianDirectoryLabel
    };
  }

  const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
    current.obsidianDirectoryUri
  );
  if (!permission.granted) {
    throw new Error("Obsidian folder access was not granted.");
  }

  const directoryUri = permission.directoryUri;
  const directoryLabel = decodeURIComponent(directoryUri.split("/").pop() ?? "");
  await saveExportState({
    obsidianDirectoryUri: directoryUri,
    obsidianDirectoryLabel: directoryLabel || null
  });

  return {
    directoryUri,
    directoryLabel: directoryLabel || null
  };
}

export async function pickObsidianDirectory(): Promise<{ directoryUri: string; directoryLabel: string | null }> {
  return await ensureObsidianRoot(true);
}

export async function exportArchivesToObsidian(items: ArchiveView[]): Promise<ExportOutcome> {
  if (items.length === 0) {
    throw new Error("Choose at least one archive.");
  }

  const root = await ensureObsidianRoot(false);
  const warnings: string[] = [];

  for (const item of items) {
    const directoryName = buildArchiveDirectoryName(item);
    const archiveDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(root.directoryUri, directoryName);
    const payload = await buildArchiveExportPayload(item);
    const markdownFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      archiveDirUri,
      `01. ${sanitizeFilenameSegment(directoryName, "threads-post")}.md`,
      "text/markdown"
    );
    await writeSafFile(markdownFileUri, payload.markdownContent, FileSystem.EncodingType.UTF8);
    for (const asset of payload.assetFiles) {
      const contents = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      const targetFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        archiveDirUri,
        asset.relativePath,
        "application/octet-stream"
      );
      await writeSafFile(targetFileUri, contents, FileSystem.EncodingType.Base64);
    }
    if (payload.warning) {
      warnings.push(`${directoryName}: ${payload.warning}`);
    }
  }

  await saveExportState({
    lastObsidianExportAt: new Date().toISOString()
  });
  return {
    warning: warnings.length > 0 ? warnings.join("\n") : null,
    exportedCount: items.length
  };
}

export function getObsidianDirectoryLabel(uri: string | null, label: string | null): string {
  if (safeText(label)) {
    return safeText(label);
  }
  if (!safeText(uri)) {
    return "Not selected";
  }
  return decodeURIComponent((uri ?? "").split("/").pop() ?? "") || "Selected folder";
}
