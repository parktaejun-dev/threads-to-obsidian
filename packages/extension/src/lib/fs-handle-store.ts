const DB_NAME = "threads-to-obsidian";
const STORE_NAME = "handles";
const OBSIDIAN_DIRECTORY_KEY = "obsidian-target-directory";

interface StoredDirectoryHandleRecord {
  handle: FileSystemDirectoryHandle;
  label: string;
  savedAt: string;
}

async function openDatabase(): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error ?? new Error("IndexedDB를 열지 못했습니다.")));
  });
}

async function withStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => void): Promise<T> {
  const database = await openDatabase();

  return await new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    transaction.addEventListener("complete", () => {
      database.close();
    });
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("IndexedDB 작업이 중단되었습니다."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("IndexedDB 작업 중 오류가 발생했습니다."));
    });

    callback(store);

    if (mode === "readonly") {
      const request = store.get(OBSIDIAN_DIRECTORY_KEY);
      request.addEventListener("success", () => resolve((request.result ?? null) as T));
      request.addEventListener("error", () => reject(request.error ?? new Error("핸들을 읽지 못했습니다.")));
    }
  });
}

export async function getObsidianDirectoryRecord(): Promise<StoredDirectoryHandleRecord | null> {
  return await withStore<StoredDirectoryHandleRecord | null>("readonly", () => undefined);
}

export async function getObsidianDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  return (await getObsidianDirectoryRecord())?.handle ?? null;
}

export async function hasObsidianDirectoryHandle(): Promise<boolean> {
  return Boolean(await getObsidianDirectoryHandle());
}

export async function setObsidianDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(
      {
        handle,
        label: handle.name,
        savedAt: new Date().toISOString()
      } satisfies StoredDirectoryHandleRecord,
      OBSIDIAN_DIRECTORY_KEY
    );

    transaction.addEventListener("complete", () => {
      database.close();
      resolve();
    });
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("핸들을 저장하지 못했습니다."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("핸들을 저장하지 못했습니다."));
    });
  });
}

export async function clearObsidianDirectoryHandle(): Promise<void> {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(OBSIDIAN_DIRECTORY_KEY);

    transaction.addEventListener("complete", () => {
      database.close();
      resolve();
    });
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("핸들을 삭제하지 못했습니다."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("핸들을 삭제하지 못했습니다."));
    });
  });
}
