import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createPairingSession,
  listArchivesForDevice,
  processMentionNode,
  readPairingStatus
} from "../packages/mobile-save-server/src/service";
import {
  createMobileSaveRequestHandler
} from "../packages/mobile-save-server/src/server";
import {
  withMobileSaveDatabaseRead,
  withMobileSaveDatabaseTransaction
} from "../packages/mobile-save-server/src/store";
import { createWebRequestHandler } from "../packages/web-server/src/server";
import { replaceRuntimeConfigForTests } from "../packages/web-server/src/server/runtime-config";

type EnvSnapshot = Record<string, string | undefined>;

type MentionNodeInput = {
  id: string;
  permalink: string;
  text: string;
  username: string;
  userId: string;
  displayName?: string | null;
  profilePictureUrl?: string | null;
  isVerified?: boolean;
  relatedNode?: Record<string, unknown> | null;
};

function captureEnv(keys: string[]): EnvSnapshot {
  const snapshot: EnvSnapshot = {};
  for (const key of keys) {
    snapshot[key] = process.env[key];
  }
  return snapshot;
}

function restoreEnv(snapshot: EnvSnapshot): void {
  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value === "string") {
      process.env[key] = value;
    } else {
      delete process.env[key];
    }
  }
}

function buildMentionNode(input: MentionNodeInput): Record<string, unknown> {
  const shortcode = input.permalink.split("/post/")[1] ?? input.id;
  return {
    id: input.id,
    permalink: input.permalink,
    shortcode,
    text: input.text,
    timestamp: "2026-04-04T09:00:00.000Z",
    username: input.username,
    media_type: "TEXT",
    owner: {
      id: input.userId,
      username: input.username,
      name: input.displayName ?? input.username,
      profile_picture_url: input.profilePictureUrl ?? null,
      is_verified: input.isVerified ?? false
    },
    replied_to: input.relatedNode ?? undefined
  };
}

async function startServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>
): Promise<{ server: Server; origin: string }> {
  const server = createServer((request, response) => {
    void handler(request, response);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not resolve test server address.");
  }

  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

async function stopServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function createTestEnvironment(prefix: string): Promise<{
  dbFile: string;
  pairingPostUrl: string;
  botHandle: string;
}> {
  const tempDir = await mkdtemp(path.join(tmpdir(), prefix));
  return {
    dbFile: path.join(tempDir, "mobile-save-data.json"),
    pairingPostUrl: "https://www.threads.com/@ss_threads_mobile_bot/post/PAIRING",
    botHandle: "ss_threads_mobile_bot"
  };
}

test("mobile-save pairing sessions reissue, expire, and reject reused codes", { concurrency: false }, async () => {
  const envKeys = [
    "THREADS_MOBILE_SAVE_DB_FILE",
    "THREADS_MOBILE_SAVE_PAIRING_POST_URL",
    "THREADS_MOBILE_SAVE_BOT_HANDLE"
  ];
  const previousEnv = captureEnv(envKeys);
  const runtime = await createTestEnvironment("threads-mobile-save-pairing-");

  process.env.THREADS_MOBILE_SAVE_DB_FILE = runtime.dbFile;
  process.env.THREADS_MOBILE_SAVE_PAIRING_POST_URL = runtime.pairingPostUrl;
  process.env.THREADS_MOBILE_SAVE_BOT_HANDLE = runtime.botHandle;

  try {
    const device = {
      deviceId: "device-a",
      deviceSecret: "secret-a",
      deviceLabel: "Phone A"
    };

    const firstPairing = await createPairingSession(device);
    const secondPairing = await createPairingSession(device);

    assert.notEqual(firstPairing.pairingId, secondPairing.pairingId);
    assert.notEqual(firstPairing.pairingCode, secondPairing.pairingCode);

    const firstStatus = await readPairingStatus(firstPairing.pairingId, device.deviceId, device.deviceSecret);
    const secondStatus = await readPairingStatus(secondPairing.pairingId, device.deviceId, device.deviceSecret);
    assert.equal(firstStatus.status, "expired");
    assert.equal(secondStatus.status, "pending");

    const pairingMention = buildMentionNode({
      id: "mention-pair-1",
      permalink: "https://www.threads.com/@writer/post/PAIRMENTION1",
      text: `@${runtime.botHandle} ${secondPairing.pairingCode}`,
      username: "writer",
      userId: "threads-user-1",
      displayName: "Writer",
      profilePictureUrl: "https://cdn.example.com/writer.jpg",
      isVerified: true,
      relatedNode: buildMentionNode({
        id: "pairing-root",
        permalink: runtime.pairingPostUrl,
        text: "Pair your device here.",
        username: runtime.botHandle,
        userId: "bot-user"
      })
    });

    const paired = await processMentionNode(pairingMention);
    assert.equal(paired.pairedDevices, 1);

    const pairedStatus = await readPairingStatus(secondPairing.pairingId, device.deviceId, device.deviceSecret);
    assert.equal(pairedStatus.status, "paired");
    assert.equal(pairedStatus.pairedAccount?.threadsHandle, "writer");
    assert.equal(pairedStatus.pairedAccount?.profilePictureUrl, "https://cdn.example.com/writer.jpg");
    assert.equal(pairedStatus.pairedAccount?.isVerified, true);

    const reused = await processMentionNode(
      buildMentionNode({
        id: "mention-pair-2",
        permalink: "https://www.threads.com/@writer/post/PAIRMENTION2",
        text: `@${runtime.botHandle} ${secondPairing.pairingCode}`,
        username: "writer",
        userId: "threads-user-1",
        relatedNode: buildMentionNode({
          id: "pairing-root",
          permalink: runtime.pairingPostUrl,
          text: "Pair your device here.",
          username: runtime.botHandle,
          userId: "bot-user"
        })
      })
    );
    assert.equal(reused.ignoredMentions, 1);
    assert.equal(reused.pairedDevices, 0);

    const expiringPairing = await createPairingSession(device);
    await withMobileSaveDatabaseTransaction((data) => {
      const record = data.pairings.find((candidate) => candidate.id === expiringPairing.pairingId);
      assert.ok(record);
      record!.expiresAt = "2000-01-01T00:00:00.000Z";
    }, runtime.dbFile);

    const expiredStatus = await readPairingStatus(expiringPairing.pairingId, device.deviceId, device.deviceSecret);
    assert.equal(expiredStatus.status, "expired");
  } finally {
    restoreEnv(previousEnv);
  }
});

test("mobile-save pairing hydrates mentions without unsupported Threads fields", { concurrency: false }, async () => {
  const envKeys = [
    "THREADS_MOBILE_SAVE_DB_FILE",
    "THREADS_MOBILE_SAVE_PAIRING_POST_URL",
    "THREADS_MOBILE_SAVE_BOT_HANDLE",
    "THREADS_MOBILE_SAVE_BOT_ACCESS_TOKEN"
  ];
  const previousEnv = captureEnv(envKeys);
  const previousFetch = globalThis.fetch;
  const runtime = await createTestEnvironment("threads-mobile-save-pairing-hydration-");

  process.env.THREADS_MOBILE_SAVE_DB_FILE = runtime.dbFile;
  process.env.THREADS_MOBILE_SAVE_PAIRING_POST_URL = runtime.pairingPostUrl;
  process.env.THREADS_MOBILE_SAVE_BOT_HANDLE = runtime.botHandle;
  process.env.THREADS_MOBILE_SAVE_BOT_ACCESS_TOKEN = "test-bot-token";

  const fetchFields: string[] = [];
  let pairingCode = "";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input.toString() : input.url);
    if (url.hostname !== "graph.threads.net") {
      return await previousFetch(input as never, init);
    }

    const fields = url.searchParams.get("fields") ?? "";
    fetchFields.push(fields);
    if (fields.includes("profile_picture_url")) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Tried accessing nonexisting field (profile_picture_url)",
            type: "THApiException",
            code: 100
          }
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    if (url.pathname.endsWith("/18093300187892938")) {
      return new Response(
        JSON.stringify({
          id: "18093300187892938",
          text: `@${runtime.botHandle} ${pairingCode}`,
          timestamp: "2026-04-05T23:26:40+0000",
          permalink: "https://www.threads.com/@parktaejun/post/DWxLRiMDlAn",
          shortcode: "DWxLRiMDlAn",
          username: "parktaejun",
          media_type: "TEXT_POST",
          replied_to: {
            id: "18088568093210536",
            text: "안녕? Hello! 你好!",
            timestamp: "2026-04-05T09:44:59+0000",
            permalink: runtime.pairingPostUrl,
            shortcode: "DWvtPZSFO22",
            username: runtime.botHandle,
            media_type: "TEXT_POST",
            owner: {
              id: "35091086347143187",
              username: runtime.botHandle,
              name: runtime.botHandle,
              is_verified: false
            }
          },
          root_post: {
            id: "18088568093210536",
            text: "안녕? Hello! 你好!",
            timestamp: "2026-04-05T09:44:59+0000",
            permalink: runtime.pairingPostUrl,
            shortcode: "DWvtPZSFO22",
            username: runtime.botHandle,
            media_type: "TEXT_POST",
            owner: {
              id: "35091086347143187",
              username: runtime.botHandle,
              name: runtime.botHandle,
              is_verified: false
            }
          }
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          message: "Not found.",
          type: "THApiException",
          code: 100
        }
      }),
      {
        status: 404,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }) as typeof fetch;

  try {
    const device = {
      deviceId: "device-hydration",
      deviceSecret: "secret-hydration",
      deviceLabel: "Phone Hydration"
    };
    const pairing = await createPairingSession(device);
    pairingCode = pairing.pairingCode;

    const paired = await processMentionNode({ id: "18093300187892938" } as Record<string, unknown>);
    assert.equal(paired.pairedDevices, 1);
    assert.equal(paired.ignoredMentions, 0);
    assert.equal(fetchFields.some((value) => value.includes("profile_picture_url")), false);

    const pairedStatus = await readPairingStatus(pairing.pairingId, device.deviceId, device.deviceSecret);
    assert.equal(pairedStatus.status, "paired");
    assert.equal(pairedStatus.pairedAccount?.threadsHandle, "parktaejun");
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});

test("mobile-save re-pair keeps only the latest device active and syncs incrementally", { concurrency: false }, async () => {
  const envKeys = [
    "THREADS_MOBILE_SAVE_DB_FILE",
    "THREADS_MOBILE_SAVE_PAIRING_POST_URL",
    "THREADS_MOBILE_SAVE_BOT_HANDLE"
  ];
  const previousEnv = captureEnv(envKeys);
  const previousFetch = globalThis.fetch;
  const runtime = await createTestEnvironment("threads-mobile-save-binding-");

  process.env.THREADS_MOBILE_SAVE_DB_FILE = runtime.dbFile;
  process.env.THREADS_MOBILE_SAVE_PAIRING_POST_URL = runtime.pairingPostUrl;
  process.env.THREADS_MOBILE_SAVE_BOT_HANDLE = runtime.botHandle;

  globalThis.fetch = (async () => {
    return new Response("", { status: 503 });
  }) as typeof fetch;

  try {
    const firstDevice = {
      deviceId: "device-a",
      deviceSecret: "secret-a",
      deviceLabel: "Phone A"
    };
    const secondDevice = {
      deviceId: "device-b",
      deviceSecret: "secret-b",
      deviceLabel: "Phone B"
    };

    const firstPairing = await createPairingSession(firstDevice);
    const secondPairing = await createPairingSession(secondDevice);

    await processMentionNode(
      buildMentionNode({
        id: "mention-pair-a",
        permalink: "https://www.threads.com/@writer/post/PAIRA",
        text: `@${runtime.botHandle} ${firstPairing.pairingCode}`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: buildMentionNode({
          id: "pairing-root",
          permalink: runtime.pairingPostUrl,
          text: "Pair your device here.",
          username: runtime.botHandle,
          userId: "bot-user"
        })
      })
    );

    await processMentionNode(
      buildMentionNode({
        id: "mention-pair-b",
        permalink: "https://www.threads.com/@writer/post/PAIRB",
        text: `@${runtime.botHandle} ${secondPairing.pairingCode}`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: buildMentionNode({
          id: "pairing-root",
          permalink: runtime.pairingPostUrl,
          text: "Pair your device here.",
          username: runtime.botHandle,
          userId: "bot-user"
        })
      })
    );

    await withMobileSaveDatabaseRead((data) => {
      const activeBindings = data.bindings.filter((candidate) => candidate.active);
      assert.equal(activeBindings.length, 1);
      assert.equal(activeBindings[0]?.deviceId, secondDevice.deviceId);
      assert.equal(data.devices.find((candidate) => candidate.id === firstDevice.deviceId)?.activeBindingId, null);
      assert.ok(data.devices.find((candidate) => candidate.id === secondDevice.deviceId)?.activeBindingId);
    }, runtime.dbFile);

    const targetOneUrl = "https://www.threads.com/@target/post/TARGET1";
    const targetOne = buildMentionNode({
      id: "target-one",
      permalink: targetOneUrl,
      text: "Target post one.",
      username: "target",
      userId: "target-user-1",
      displayName: "Target One"
    });

    const firstSave = await processMentionNode(
      buildMentionNode({
        id: "mention-save-1",
        permalink: "https://www.threads.com/@writer/post/SAVE1",
        text: `@${runtime.botHandle}`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: targetOne
      })
    );
    assert.equal(firstSave.savedArchives, 1);

    const initialSync = await listArchivesForDevice(secondDevice.deviceId, secondDevice.deviceSecret);
    assert.equal(initialSync.items.length, 1);
    assert.equal(initialSync.items[0]?.canonicalUrl, targetOneUrl);
    assert.ok(initialSync.nextCursor);

    const duplicateSave = await processMentionNode(
      buildMentionNode({
        id: "mention-save-2",
        permalink: "https://www.threads.com/@writer/post/SAVE2",
        text: `@${runtime.botHandle} again`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: targetOne
      })
    );
    assert.equal(duplicateSave.savedArchives, 0);
    assert.equal(duplicateSave.updatedArchives, 1);

    const targetTwoUrl = "https://www.threads.com/@target/post/TARGET2";
    const targetTwo = buildMentionNode({
      id: "target-two",
      permalink: targetTwoUrl,
      text: "Target post two.",
      username: "target",
      userId: "target-user-2",
      displayName: "Target Two"
    });

    const nextCursor = (await listArchivesForDevice(secondDevice.deviceId, secondDevice.deviceSecret)).nextCursor;
    assert.ok(nextCursor);

    const secondSave = await processMentionNode(
      buildMentionNode({
        id: "mention-save-3",
        permalink: "https://www.threads.com/@writer/post/SAVE3",
        text: `@${runtime.botHandle}`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: targetTwo
      })
    );
    assert.equal(secondSave.savedArchives, 1);

    const strangerSave = await processMentionNode(
      buildMentionNode({
        id: "mention-save-4",
        permalink: "https://www.threads.com/@stranger/post/SAVE4",
        text: `@${runtime.botHandle}`,
        username: "stranger",
        userId: "threads-user-999",
        displayName: "Stranger",
        relatedNode: buildMentionNode({
          id: "target-three",
          permalink: "https://www.threads.com/@target/post/TARGET3",
          text: "Target post three.",
          username: "target",
          userId: "target-user-3"
        })
      })
    );
    assert.equal(strangerSave.ignoredMentions, 1);

    const incremental = await listArchivesForDevice(secondDevice.deviceId, secondDevice.deviceSecret, nextCursor);
    assert.equal(incremental.items.length, 1);
    assert.equal(incremental.items[0]?.canonicalUrl, targetTwoUrl);

    const allArchives = await listArchivesForDevice(secondDevice.deviceId, secondDevice.deviceSecret);
    assert.equal(allArchives.items.length, 2);
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});

test("mobile-save HTTP endpoints expose pairing status and synced archives", { concurrency: false }, async () => {
  const envKeys = [
    "THREADS_MOBILE_SAVE_DB_FILE",
    "THREADS_MOBILE_SAVE_PAIRING_POST_URL",
    "THREADS_MOBILE_SAVE_BOT_HANDLE"
  ];
  const previousEnv = captureEnv(envKeys);
  const previousFetch = globalThis.fetch;
  const runtime = await createTestEnvironment("threads-mobile-save-http-");

  process.env.THREADS_MOBILE_SAVE_DB_FILE = runtime.dbFile;
  process.env.THREADS_MOBILE_SAVE_PAIRING_POST_URL = runtime.pairingPostUrl;
  process.env.THREADS_MOBILE_SAVE_BOT_HANDLE = runtime.botHandle;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith("http://127.0.0.1:")) {
      return await previousFetch(input, init);
    }
    return new Response("", { status: 503 });
  }) as typeof fetch;

  const runtimeServer = createMobileSaveRequestHandler();
  const { server, origin } = await startServer(runtimeServer.handler);

  try {
    const createdResponse = await fetch(`${origin}/mobile-save/pairings`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        deviceId: "device-http",
        deviceSecret: "secret-http",
        deviceLabel: "HTTP Device"
      })
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json() as {
      pairingId: string;
      pairingCode: string;
      pairingPostUrl: string;
    };
    assert.equal(created.pairingPostUrl, runtime.pairingPostUrl);

    const unauthorizedStatus = await fetch(`${origin}/mobile-save/pairings/${created.pairingId}`);
    assert.equal(unauthorizedStatus.status, 401);

    const pendingStatusResponse = await fetch(`${origin}/mobile-save/pairings/${created.pairingId}`, {
      headers: {
        "x-mobile-save-device-id": "device-http",
        "x-mobile-save-device-secret": "secret-http"
      }
    });
    assert.equal(pendingStatusResponse.status, 200);
    const pendingStatus = await pendingStatusResponse.json() as { status: string };
    assert.equal(pendingStatus.status, "pending");

    await processMentionNode(
      buildMentionNode({
        id: "mention-http-pair",
        permalink: "https://www.threads.com/@writer/post/PAIRHTTP",
        text: `@${runtime.botHandle} ${created.pairingCode}`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: buildMentionNode({
          id: "pairing-root",
          permalink: runtime.pairingPostUrl,
          text: "Pair your device here.",
          username: runtime.botHandle,
          userId: "bot-user"
        })
      })
    );

    await processMentionNode(
      buildMentionNode({
        id: "mention-http-save",
        permalink: "https://www.threads.com/@writer/post/SAVEHTTP",
        text: `@${runtime.botHandle}`,
        username: "writer",
        userId: "threads-user-1",
        displayName: "Writer",
        relatedNode: buildMentionNode({
          id: "target-http",
          permalink: "https://www.threads.com/@target/post/TARGETHTTP",
          text: "Saved over HTTP.",
          username: "target",
          userId: "target-user"
        })
      })
    );

    const pairedStatusResponse = await fetch(`${origin}/mobile-save/pairings/${created.pairingId}`, {
      headers: {
        "x-mobile-save-device-id": "device-http",
        "x-mobile-save-device-secret": "secret-http"
      }
    });
    const pairedStatus = await pairedStatusResponse.json() as {
      status: string;
      pairedAccount: { threadsHandle: string } | null;
    };
    assert.equal(pairedStatus.status, "paired");
    assert.equal(pairedStatus.pairedAccount?.threadsHandle, "writer");

    const archivesResponse = await fetch(`${origin}/mobile-save/archives`, {
      headers: {
        "x-mobile-save-device-id": "device-http",
        "x-mobile-save-device-secret": "secret-http"
      }
    });
    assert.equal(archivesResponse.status, 200);
    const archives = await archivesResponse.json() as {
      items: Array<{ canonicalUrl: string }>;
      nextCursor: string | null;
    };
    assert.equal(archives.items.length, 1);
    assert.equal(archives.items[0]?.canonicalUrl, "https://www.threads.com/@target/post/TARGETHTTP");
    assert.ok(archives.nextCursor);
  } finally {
    await stopServer(server);
    globalThis.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});

test("mobile-save Notion endpoints accept client-exported payloads and persist connection state", { concurrency: false }, async () => {
  const envKeys = [
    "THREADS_MOBILE_SAVE_DB_FILE",
    "THREADS_MOBILE_SAVE_PAIRING_POST_URL",
    "THREADS_MOBILE_SAVE_BOT_HANDLE",
    "THREADS_MOBILE_SAVE_NOTION_CLIENT_ID",
    "THREADS_MOBILE_SAVE_NOTION_CLIENT_SECRET"
  ];
  const previousEnv = captureEnv(envKeys);
  const previousFetch = globalThis.fetch;
  const runtime = await createTestEnvironment("threads-mobile-save-notion-");

  process.env.THREADS_MOBILE_SAVE_DB_FILE = runtime.dbFile;
  process.env.THREADS_MOBILE_SAVE_PAIRING_POST_URL = runtime.pairingPostUrl;
  process.env.THREADS_MOBILE_SAVE_BOT_HANDLE = runtime.botHandle;
  process.env.THREADS_MOBILE_SAVE_NOTION_CLIENT_ID = "notion-client";
  process.env.THREADS_MOBILE_SAVE_NOTION_CLIENT_SECRET = "notion-secret";

  const notionPagePosts: Array<Record<string, unknown>> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith("http://127.0.0.1:") || url.startsWith("http://localhost:")) {
      return await previousFetch(input, init);
    }

    if (url === "https://api.notion.com/v1/oauth/token") {
      return new Response(
        JSON.stringify({
          access_token: "notion-access-token",
          refresh_token: "notion-refresh-token",
          workspace_id: "workspace-1",
          workspace_name: "Workspace One",
          workspace_icon: "https://cdn.example.com/workspace.png",
          bot_id: "notion-bot-1"
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    if (url === "https://api.notion.com/v1/search") {
      return new Response(
        JSON.stringify({
          results: [
            {
              object: "page",
              id: "11111111-1111-4111-8111-111111111111",
              url: "https://www.notion.so/Inbox-123",
              title: [{ plain_text: "Inbox" }]
            }
          ]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    if (url === "https://api.notion.com/v1/pages" && (init?.method ?? "GET").toUpperCase() === "POST") {
      const bodyText = typeof init?.body === "string" ? init.body : "";
      notionPagePosts.push(bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {});
      return new Response(
        JSON.stringify({
          id: "page-created-1",
          url: "https://www.notion.so/page-created-1"
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    throw new Error(`Unexpected fetch in Notion test: ${url}`);
  }) as typeof fetch;

  const runtimeServer = createMobileSaveRequestHandler();
  const { server, origin } = await startServer(runtimeServer.handler);

  try {
    const device = {
      deviceId: "device-notion",
      deviceSecret: "secret-notion",
      deviceLabel: "Notion Phone"
    };

    const pairing = await createPairingSession(device);
    await processMentionNode(
      buildMentionNode({
        id: "mention-notion-pair",
        permalink: "https://www.threads.com/@writer/post/PAIRNOTION",
        text: `@${runtime.botHandle} ${pairing.pairingCode}`,
        username: "writer",
        userId: "threads-user-notion",
        displayName: "Writer",
        profilePictureUrl: "https://cdn.example.com/writer-notion.jpg",
        isVerified: true,
        relatedNode: buildMentionNode({
          id: "pairing-root",
          permalink: runtime.pairingPostUrl,
          text: "Pair your device here.",
          username: runtime.botHandle,
          userId: "bot-user"
        })
      })
    );

    const startResponse = await fetch(`${origin}/mobile-save/notion/oauth/start`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mobile-save-device-id": device.deviceId,
        "x-mobile-save-device-secret": device.deviceSecret
      },
      body: JSON.stringify({ deviceLabel: device.deviceLabel })
    });
    assert.equal(startResponse.status, 201);
    const start = await startResponse.json() as {
      authorizeUrl: string;
      sessionId: string;
      expiresAt: string;
      connection: { connected: boolean };
    };
    assert.equal(start.connection.connected, false);
    assert.ok(decodeURIComponent(start.authorizeUrl).includes("/mobile-save/notion/oauth/callback"));

    const callbackResponse = await fetch(
      `${origin}/mobile-save/notion/oauth/callback?code=oauth-code-1&state=${encodeURIComponent(start.sessionId)}`
    );
    assert.equal(callbackResponse.status, 200);

    const connectionResponse = await fetch(`${origin}/mobile-save/notion/connection`, {
      headers: {
        "x-mobile-save-device-id": device.deviceId,
        "x-mobile-save-device-secret": device.deviceSecret
      }
    });
    assert.equal(connectionResponse.status, 200);
    const connection = await connectionResponse.json() as {
      connected: boolean;
      workspaceId: string | null;
      selectedParentId: string | null;
      profilePictureUrl: string | null;
      isVerified: boolean;
    };
    assert.equal(connection.connected, true);
    assert.equal(connection.workspaceId, "workspace-1");
    assert.equal(connection.profilePictureUrl, "https://cdn.example.com/writer-notion.jpg");
    assert.equal(connection.isVerified, true);
    assert.equal(connection.selectedParentId, "11111111-1111-4111-8111-111111111111");

    const searchResponse = await fetch(`${origin}/mobile-save/notion/locations/search`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mobile-save-device-id": device.deviceId,
        "x-mobile-save-device-secret": device.deviceSecret
      },
      body: JSON.stringify({
        query: "inbox",
        parentType: "page"
      })
    });
    assert.equal(searchResponse.status, 200);
    const search = await searchResponse.json() as { results: Array<{ id: string; label: string }> };
    assert.equal(search.results[0]?.id, "11111111-1111-4111-8111-111111111111");
    assert.equal(search.results[0]?.label, "Inbox");

    const selectResponse = await fetch(`${origin}/mobile-save/notion/locations/select`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mobile-save-device-id": device.deviceId,
        "x-mobile-save-device-secret": device.deviceSecret
      },
      body: JSON.stringify({
        parentType: "page",
        targetId: "11111111-1111-4111-8111-111111111111",
        targetLabel: "Inbox",
        targetUrl: "https://www.notion.so/Inbox-123"
      })
    });
    assert.equal(selectResponse.status, 200);

    await processMentionNode(
      buildMentionNode({
        id: "mention-notion-save",
        permalink: "https://www.threads.com/@writer/post/SAVENOTION",
        text: `@${runtime.botHandle}`,
        username: "writer",
        userId: "threads-user-notion",
        displayName: "Writer",
        profilePictureUrl: "https://cdn.example.com/writer-notion.jpg",
        isVerified: true,
        relatedNode: buildMentionNode({
          id: "target-notion",
          permalink: "https://www.threads.com/@target/post/TARGETNOTION",
          text: "Original target text.",
          username: "target",
          userId: "target-user-notion",
          displayName: "Target"
        })
      })
    );

    const savedArchives = await listArchivesForDevice(device.deviceId, device.deviceSecret);
    const exportPayload = {
      items: savedArchives.items.map((archive) => ({
        archiveId: archive.id,
        canonicalUrl: archive.canonicalUrl,
        shortcode: archive.shortcode,
        author: archive.author,
        title: "Edited title",
        text: "Overlay text",
        publishedAt: archive.publishedAt,
        capturedAt: archive.capturedAt,
        sourceType: archive.sourceType,
        imageUrls: [...archive.imageUrls],
        videoUrl: archive.videoUrl,
        externalUrl: archive.externalUrl,
        quotedPostUrl: archive.quotedPostUrl,
        repliedToUrl: archive.repliedToUrl,
        thumbnailUrl: archive.thumbnailUrl,
        authorReplies: archive.authorReplies,
        markdownContent: "# Edited title\n\nOverlay text",
        savedAt: archive.savedAt,
        updatedAt: archive.updatedAt
      })),
      includeImages: false,
      uploadMedia: false
    };

    const exportResponse = await fetch(`${origin}/mobile-save/notion/export`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mobile-save-device-id": device.deviceId,
        "x-mobile-save-device-secret": device.deviceSecret
      },
      body: JSON.stringify(exportPayload)
    });
    assert.equal(exportResponse.status, 200);
    const exported = await exportResponse.json() as {
      results: Array<{ archiveId: string | null; canonicalUrl: string; pageId: string; title: string }>;
      warning: string | null;
    };
    assert.equal(exported.results.length, 1);
    assert.equal(exported.results[0]?.canonicalUrl, savedArchives.items[0]?.canonicalUrl);
    assert.equal(exported.results[0]?.title, "Edited title");
    assert.equal(notionPagePosts.length, 1);
    const notionPost = notionPagePosts[0] ?? {};
    assert.ok(typeof notionPost.markdown === "string");
    assert.ok((notionPost.markdown as string).includes("Edited title"));
    assert.ok((notionPost.markdown as string).includes("Overlay text"));
  } finally {
    await stopServer(server);
    globalThis.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});

test("web server proxies mobile-save requests without Origin enforcement", { concurrency: false }, async () => {
  const envKeys = [
    "THREADS_MOBILE_SAVE_PROXY_ORIGIN",
    "THREADS_WEB_ADMIN_TOKEN",
    "THREADS_WEB_DB_FILE"
  ];
  const previousEnv = captureEnv(envKeys);
  const tempDir = await mkdtemp(path.join(tmpdir(), "threads-mobile-save-proxy-"));
  const dbFile = path.join(tempDir, "web-admin-data.json");

  const upstream = await startServer(async (request, response) => {
    const chunks: Uint8Array[] = [];
    for await (const chunk of request) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    const payload = JSON.stringify({
      path: request.url,
      method: request.method,
      body: Buffer.concat(chunks).toString("utf8"),
      origin: request.headers.origin ?? null
    });

    response.writeHead(201, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "content-length": String(Buffer.byteLength(payload))
    });
    response.end(payload);
  });

  process.env.THREADS_MOBILE_SAVE_PROXY_ORIGIN = upstream.origin;
  process.env.THREADS_WEB_ADMIN_TOKEN = "threads-admin-secret";
  process.env.THREADS_WEB_DB_FILE = dbFile;

  replaceRuntimeConfigForTests(null);
  const webHandler = createWebRequestHandler();
  const { server, origin } = await startServer((request, response) => webHandler(request, response));

  try {
    const response = await fetch(`${origin}/mobile-save/pairings`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        deviceId: "device-proxy",
        deviceSecret: "secret-proxy"
      })
    });

    assert.equal(response.status, 201);
    const payload = await response.json() as {
      path: string;
      method: string;
      body: string;
      origin: string | null;
    };
    assert.equal(payload.path, "/mobile-save/pairings");
    assert.equal(payload.method, "POST");
    assert.equal(payload.origin, null);
    assert.equal(JSON.parse(payload.body).deviceId, "device-proxy");
  } finally {
    await stopServer(server);
    await stopServer(upstream.server);
    restoreEnv(previousEnv);
  }
});
