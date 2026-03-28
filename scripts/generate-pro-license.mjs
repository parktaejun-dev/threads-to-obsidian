import process from "node:process";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

function parseArgs(argv) {
  const args = {
    audience: "pro",
    holder: null,
    expires: null,
    output: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--audience") {
      args.audience = argv[index + 1] ?? "pro";
      index += 1;
      continue;
    }

    if (value === "--holder" || value === "--email") {
      args.holder = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === "--expires") {
      args.expires = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === "--output") {
      args.output = argv[index + 1] ?? null;
      index += 1;
    }
  }

  return args;
}

function toBase64Url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sanitizeFileStem(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

const PRIVATE_KEY_ENV_NAME = "SS_THREADS_PRO_PRIVATE_JWK";
const PRIVATE_KEY_FILE_ENV_NAME = "SS_THREADS_PRO_PRIVATE_JWK_FILE";
const LEGACY_PRIVATE_KEY_ENV_NAME = "THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK";
const LEGACY_PRIVATE_KEY_FILE_ENV_NAME = "THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE";

async function readPrivateKeyJson() {
  const inline = process.env[PRIVATE_KEY_ENV_NAME]?.trim() || process.env[LEGACY_PRIVATE_KEY_ENV_NAME]?.trim();
  if (inline) {
    return inline;
  }

  const filePath = process.env[PRIVATE_KEY_FILE_ENV_NAME]?.trim() || process.env[LEGACY_PRIVATE_KEY_FILE_ENV_NAME]?.trim();
  if (filePath) {
    return await readFile(filePath, "utf8");
  }

  console.error(
    `Missing license private key. Set ${PRIVATE_KEY_ENV_NAME} or ${PRIVATE_KEY_FILE_ENV_NAME}. Legacy THREADS_TO_OBSIDIAN_* names are still accepted.`
  );
  process.exit(1);
}

async function writeTokenOutput(outputArg, holder, token) {
  if (!outputArg) {
    console.log(token);
    return;
  }

  const resolvedOutput = path.resolve(outputArg);
  const looksLikeFile = path.extname(resolvedOutput).length > 0;
  const targetFile = looksLikeFile
    ? resolvedOutput
    : path.join(
        resolvedOutput,
        `${sanitizeFileStem(holder ?? "pro-license-token") || "pro-license-token"}.txt`
      );

  await mkdir(path.dirname(targetFile), { recursive: true });
  await writeFile(targetFile, `${token}\n`, "utf8");
  console.log(targetFile);
}

const { audience, holder, expires, output } = parseArgs(process.argv.slice(2));
if (audience !== "pro") {
  console.error(`Unsupported audience: ${audience}. Only "pro" is supported.`);
  process.exit(1);
}

const privateKeyJson = await readPrivateKeyJson();
const privateKeyJwk = JSON.parse(privateKeyJson);
const payload = {
  plan: "pro",
  holder: holder ?? null,
  issuedAt: new Date().toISOString(),
  expiresAt: expires ?? null
};
const payloadSegment = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
const signingKey = await crypto.subtle.importKey(
  "jwk",
  privateKeyJwk,
  {
    name: "ECDSA",
    namedCurve: "P-256"
  },
  false,
  ["sign"]
);
const signature = await crypto.subtle.sign(
  {
    name: "ECDSA",
    hash: "SHA-256"
  },
  signingKey,
  new TextEncoder().encode(payloadSegment)
);

const token = `${payloadSegment}.${toBase64Url(new Uint8Array(signature))}`;
await writeTokenOutput(output, holder, token);
