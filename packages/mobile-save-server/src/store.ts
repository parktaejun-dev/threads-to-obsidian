import path from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";

import type { MobileSaveDatabase } from "./types";

const DEFAULT_DATABASE_FILE = path.resolve(process.cwd(), "output", "mobile-save-data.json");

let writeQueue: Promise<void> = Promise.resolve();

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function getMobileSaveDatabaseFilePath(filePath?: string): string {
  const envFilePath = safeText(process.env.THREADS_MOBILE_SAVE_DB_FILE);
  return filePath ?? (envFilePath || DEFAULT_DATABASE_FILE);
}

export function buildDefaultMobileSaveDatabase(): MobileSaveDatabase {
  return {
    devices: [],
    pairings: [],
    bindings: [],
    archives: [],
    processedMentions: [],
    notionAuthSessions: [],
    notionConnections: []
  };
}

function normalizeDatabasePayload(raw: unknown): MobileSaveDatabase {
  const parsed = raw && typeof raw === "object" ? (raw as Partial<MobileSaveDatabase>) : {};
  return {
    devices: Array.isArray(parsed.devices) ? parsed.devices : [],
    pairings: Array.isArray(parsed.pairings) ? parsed.pairings : [],
    bindings: Array.isArray(parsed.bindings) ? parsed.bindings : [],
    archives: Array.isArray(parsed.archives) ? parsed.archives : [],
    processedMentions: Array.isArray(parsed.processedMentions) ? parsed.processedMentions : [],
    notionAuthSessions: Array.isArray(parsed.notionAuthSessions) ? parsed.notionAuthSessions : [],
    notionConnections: Array.isArray(parsed.notionConnections) ? parsed.notionConnections : []
  };
}

export async function loadMobileSaveDatabase(filePath?: string): Promise<MobileSaveDatabase> {
  const resolvedPath = getMobileSaveDatabaseFilePath(filePath);

  try {
    const raw = await readFile(resolvedPath, "utf8");
    return normalizeDatabasePayload(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code !== "ENOENT") {
      throw error;
    }
  }

  const initial = buildDefaultMobileSaveDatabase();
  await saveMobileSaveDatabase(initial, resolvedPath);
  return initial;
}

export async function saveMobileSaveDatabase(data: MobileSaveDatabase, filePath?: string): Promise<void> {
  const resolvedPath = getMobileSaveDatabaseFilePath(filePath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  const tempPath = `${resolvedPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await rename(tempPath, resolvedPath);
}

export async function withMobileSaveDatabaseTransaction<T>(
  operation: (data: MobileSaveDatabase) => Promise<T> | T,
  filePath?: string
): Promise<T> {
  let resolveResult!: (value: T | PromiseLike<T>) => void;
  let rejectResult!: (reason?: unknown) => void;
  const resultPromise = new Promise<T>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const nextWrite = writeQueue.then(async () => {
    try {
      const database = await loadMobileSaveDatabase(filePath);
      const result = await operation(database);
      await saveMobileSaveDatabase(database, filePath);
      resolveResult(result);
    } catch (error) {
      rejectResult(error);
    }
  });

  writeQueue = nextWrite.then(
    () => undefined,
    () => undefined
  );

  return resultPromise;
}

export async function withMobileSaveDatabaseRead<T>(
  operation: (data: MobileSaveDatabase) => Promise<T> | T,
  filePath?: string
): Promise<T> {
  const database = structuredClone(await loadMobileSaveDatabase(filePath)) as MobileSaveDatabase;
  return await operation(database);
}
