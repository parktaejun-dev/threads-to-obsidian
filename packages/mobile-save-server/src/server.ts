import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type {
  MobileSaveNotionExportRequest,
  MobileSaveNotionLocationSearchRequest,
  MobileSaveNotionLocationSelectRequest,
  MobileSavePairingStartRequest
} from "@threads/shared/mobile-save";
import { createMobileSaveCollector } from "./collector";
import {
  completeMobileSaveNotionAuth,
  createPairingSession,
  createMobileSaveNotionAuthStart,
  disconnectMobileSaveNotionConnection,
  getMobileSaveNotionConnectionSummary,
  listArchivesForDevice,
  saveMobileSaveArchivesThroughNotionConnection,
  searchMobileSaveNotionLocations,
  selectMobileSaveNotionLocation,
  readPairingStatus
} from "./service";
import {
  withMobileSaveDatabaseRead,
  withMobileSaveDatabaseTransaction
} from "./store";

const DEFAULT_PORT = 4180;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_MAX_BODY_BYTES = 250_000;

class RequestError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

function safeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function readHeader(headers: IncomingMessage["headers"], name: string): string | null {
  const value = headers[name.toLowerCase()];
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0]?.trim() ?? null : value.trim();
}

function readDeviceAuth(request: IncomingMessage): { deviceId: string; deviceSecret: string } {
  const deviceId = safeText(readHeader(request.headers, "x-mobile-save-device-id"));
  const deviceSecret = safeText(readHeader(request.headers, "x-mobile-save-device-secret"));
  if (!deviceId || !deviceSecret) {
    throw new RequestError(401, "x-mobile-save-device-id and x-mobile-save-device-secret are required.");
  }
  return { deviceId, deviceSecret };
}

function resolvePublicOrigin(request: IncomingMessage, requestUrl: URL): string {
  const configured = safeText(process.env.THREADS_MOBILE_SAVE_PUBLIC_ORIGIN);
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to request-derived origin.
    }
  }

  const originHeader = safeText(readHeader(request.headers, "origin"));
  if (originHeader) {
    try {
      return new URL(originHeader).origin;
    } catch {
      // Ignore invalid origin headers.
    }
  }

  return requestUrl.origin;
}

async function readRequestBody(request: IncomingMessage, maxBytes = DEFAULT_MAX_BODY_BYTES): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const binary = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    totalBytes += binary.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestError(413, `Request body exceeds ${maxBytes} bytes.`);
    }
    chunks.push(binary);
  }
  return Buffer.concat(chunks);
}

function assertJsonContentType(request: IncomingMessage): void {
  const contentType = safeText(readHeader(request.headers, "content-type"));
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mediaType !== "application/json" && !mediaType.endsWith("+json")) {
    throw new RequestError(415, "Content-Type must be application/json.");
  }
}

async function parseJsonBody<T>(request: IncomingMessage): Promise<T> {
  assertJsonContentType(request);
  const raw = (await readRequestBody(request)).toString("utf8");
  if (!raw.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new RequestError(400, "Invalid JSON payload.");
  }
}

function json(response: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": String(Buffer.byteLength(body))
  });
  response.end(body);
}

function html(response: ServerResponse, statusCode: number, payload: string): void {
  response.writeHead(statusCode, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "content-length": String(Buffer.byteLength(payload))
  });
  response.end(payload);
}

function renderNotionCallbackPage(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title><style>body{font-family:system-ui,sans-serif;margin:0;padding:40px;line-height:1.5;color:#111;background:#f6f4ef}main{max-width:640px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:16px;padding:28px}h1{margin:0 0 12px;font-size:24px}p{margin:0;color:#333}</style></head><body><main><h1>${title}</h1><p>${body}</p></main></body></html>`;
}

function methodNotAllowed(response: ServerResponse): void {
  json(response, 405, { error: "Method not allowed." });
}

function notFound(response: ServerResponse): void {
  json(response, 404, { error: "Not found." });
}

function resolveHost(): string {
  return safeText(process.env.THREADS_MOBILE_SAVE_HOST) || DEFAULT_HOST;
}

function resolvePort(port?: number): number {
  if (typeof port === "number" && Number.isInteger(port) && port > 0) {
    return port;
  }
  const fromEnv = Number.parseInt(safeText(process.env.THREADS_MOBILE_SAVE_PORT), 10);
  return Number.isInteger(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_PORT;
}

export function createMobileSaveRequestHandler() {
  const collector = createMobileSaveCollector();

  return {
    collector,
    handler: async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
      const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
      const pathname = requestUrl.pathname;
      const method = request.method ?? "GET";

      try {
        if (pathname === "/health" || pathname === "/mobile-save/health") {
          if (method !== "GET") {
            methodNotAllowed(response);
            return;
          }

          json(response, 200, {
            status: "ok",
            service: "ss-threads-mobile-save",
            collector: collector.getStatus()
          });
          return;
        }

        if (pathname === "/mobile-save/pairings") {
          if (method !== "POST") {
            methodNotAllowed(response);
            return;
          }

          const body = await parseJsonBody<MobileSavePairingStartRequest>(request);
          const pairing = await createPairingSession({
            deviceId: safeText(body.deviceId),
            deviceSecret: safeText(body.deviceSecret),
            deviceLabel: safeText(body.deviceLabel)
          });
          json(response, 201, pairing);
          return;
        }

        const pairingMatch = pathname.match(/^\/mobile-save\/pairings\/([^/]+)$/);
        if (pairingMatch) {
          if (method !== "GET") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const status = await readPairingStatus(decodeURIComponent(pairingMatch[1] ?? ""), deviceId, deviceSecret);
          json(response, 200, status);
          return;
        }

        if (pathname === "/mobile-save/archives") {
          if (method !== "GET") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const archives = await listArchivesForDevice(deviceId, deviceSecret, requestUrl.searchParams.get("cursor"));
          json(response, 200, archives);
          return;
        }

        if (pathname === "/mobile-save/notion/connection") {
          if (method !== "GET") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const connection = await withMobileSaveDatabaseRead((data) =>
            getMobileSaveNotionConnectionSummary(data, deviceId, deviceSecret)
          );
          json(response, 200, connection);
          return;
        }

        if (pathname === "/mobile-save/notion/oauth/start") {
          if (method !== "POST") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const body = await parseJsonBody<{ deviceLabel?: string | null }>(request);
          const publicOrigin = resolvePublicOrigin(request, requestUrl);
          const start = await createMobileSaveNotionAuthStart(
            deviceId,
            deviceSecret,
            safeText(body.deviceLabel),
            publicOrigin
          );
          json(response, 201, start);
          return;
        }

        if (pathname === "/mobile-save/notion/oauth/callback") {
          if (method !== "GET") {
            methodNotAllowed(response);
            return;
          }

          const code = safeText(requestUrl.searchParams.get("code"));
          const state = safeText(requestUrl.searchParams.get("state"));
          const error = safeText(requestUrl.searchParams.get("error"));
          const publicOrigin = resolvePublicOrigin(request, requestUrl);

          if (error) {
            html(response, 400, renderNotionCallbackPage("Notion connection failed", error));
            return;
          }

          try {
            const connection = await completeMobileSaveNotionAuth(state, code, publicOrigin);
            html(
              response,
              200,
              renderNotionCallbackPage(
                "Notion connected",
                connection.connected ? "You can close this tab and return to the app." : "You can close this tab and return to the app."
              )
            );
          } catch (callbackError) {
            const message = callbackError instanceof Error ? callbackError.message : "Unexpected Notion OAuth error.";
            html(response, 400, renderNotionCallbackPage("Notion connection failed", message));
          }
          return;
        }

        if (pathname === "/mobile-save/notion/disconnect") {
          if (method !== "POST") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const connection = await withMobileSaveDatabaseTransaction((data) =>
            disconnectMobileSaveNotionConnection(data, deviceId, deviceSecret)
          );
          json(response, 200, connection);
          return;
        }

        if (pathname === "/mobile-save/notion/locations/search") {
          if (method !== "POST") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const body = await parseJsonBody<MobileSaveNotionLocationSearchRequest>(request);
          const locations = await withMobileSaveDatabaseRead((data) =>
            searchMobileSaveNotionLocations(data, deviceId, deviceSecret, body.parentType, safeText(body.query))
          );
          json(response, 200, { results: locations });
          return;
        }

        if (pathname === "/mobile-save/notion/locations/select") {
          if (method !== "POST") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const body = await parseJsonBody<MobileSaveNotionLocationSelectRequest>(request);
          const connection = await withMobileSaveDatabaseTransaction((data) =>
            selectMobileSaveNotionLocation(
              data,
              deviceId,
              deviceSecret,
              body.parentType,
              safeText(body.targetId),
              safeText(body.targetLabel),
              safeText(body.targetUrl)
            )
          );
          json(response, 200, connection);
          return;
        }

        if (pathname === "/mobile-save/notion/export") {
          if (method !== "POST") {
            methodNotAllowed(response);
            return;
          }

          const { deviceId, deviceSecret } = readDeviceAuth(request);
          const body = await parseJsonBody<MobileSaveNotionExportRequest>(request);
          const result = await withMobileSaveDatabaseTransaction((data) =>
            saveMobileSaveArchivesThroughNotionConnection(data, deviceId, deviceSecret, {
              items: Array.isArray(body.items) ? body.items : [],
              archiveIds: Array.isArray(body.archiveIds) ? body.archiveIds : [],
              includeImages: Boolean(body.includeImages),
              uploadMedia: Boolean(body.uploadMedia)
            })
          );
          json(response, 200, result);
          return;
        }

        notFound(response);
      } catch (error) {
        if (error instanceof RequestError) {
          json(response, error.statusCode, { error: error.message });
          return;
        }

        const message = error instanceof Error ? error.message : "Unexpected server error.";
        json(response, 400, { error: message });
      }
    }
  };
}

export function startMobileSaveServer(port?: number) {
  const runtime = createMobileSaveRequestHandler();
  const server = createServer((request, response) => {
    void runtime.handler(request, response);
  });
  const host = resolveHost();
  const resolvedPort = resolvePort(port);

  server.listen(resolvedPort, host, () => {
    console.log(`ss-threads mobile save server running at http://${host}:${resolvedPort}`);
  });

  runtime.collector.start();

  const shutdown = async (): Promise<void> => {
    await runtime.collector.stop();
  };

  const onSignal = () => {
    void shutdown().finally(() => {
      server.close(() => {
        process.exit(0);
      });
    });
  };

  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  return server;
}

const entryFilePath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (entryFilePath && fileURLToPath(import.meta.url) === entryFilePath) {
  startMobileSaveServer();
}
