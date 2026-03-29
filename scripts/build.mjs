import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const extensionDist = path.join(dist, "extension");
const webDist = path.join(dist, "web");
const webAssetsDist = path.join(webDist, "assets");
const extensionRoot = path.join(root, "packages", "extension");
const webClientRoot = path.join(root, "packages", "web-client");
const webServerRoot = path.join(root, "packages", "web-server");
const isDev = process.argv.includes("--dev");
const targetArg = process.argv.find((arg) => arg.startsWith("--target="))?.slice("--target=".length) ?? "all";

function normalizeTargets(rawTarget) {
  const targets = rawTarget
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (targets.length === 0 || targets.includes("all")) {
    return new Set(["extension", "web", "server"]);
  }

  const supportedTargets = new Set(["extension", "web", "server"]);
  for (const target of targets) {
    if (!supportedTargets.has(target)) {
      throw new Error(`Unsupported build target: ${target}`);
    }
  }

  return new Set(targets);
}

const targets = normalizeTargets(targetArg);

async function copyRecursive(from, to) {
  await cp(from, to, { recursive: true });
}

async function buildExtension() {
  await rm(extensionDist, { recursive: true, force: true });
  await mkdir(extensionDist, { recursive: true });

  await build({
    entryPoints: {
      background: path.join(extensionRoot, "src", "background.ts"),
      content: path.join(extensionRoot, "src", "content.ts"),
      popup: path.join(extensionRoot, "src", "popup.ts"),
      options: path.join(extensionRoot, "src", "options.ts")
    },
    bundle: true,
    outdir: extensionDist,
    splitting: false,
    sourcemap: isDev,
    target: "chrome120",
    format: "esm",
    platform: "browser",
    logLevel: "info"
  });

  await cp(path.join(extensionRoot, "src", "manifest.json"), path.join(extensionDist, "manifest.json"));
  await cp(path.join(extensionRoot, "src", "popup.html"), path.join(extensionDist, "popup.html"));
  await cp(path.join(extensionRoot, "src", "popup.css"), path.join(extensionDist, "popup.css"));
  await cp(path.join(extensionRoot, "src", "options.html"), path.join(extensionDist, "options.html"));
  await cp(path.join(extensionRoot, "src", "options.css"), path.join(extensionDist, "options.css"));
  await copyRecursive(path.join(extensionRoot, "src", "assets"), path.join(extensionDist, "assets"));
}

async function buildWebClient() {
  await rm(webAssetsDist, { recursive: true, force: true });
  await rm(path.join(webDist, "landing"), { recursive: true, force: true });
  await rm(path.join(webDist, "install"), { recursive: true, force: true });
  await rm(path.join(webDist, "admin"), { recursive: true, force: true });
  await rm(path.join(webDist, "scrapbook"), { recursive: true, force: true });
  await rm(path.join(webDist, "checkout"), { recursive: true, force: true });
  await rm(path.join(webDist, "mockups"), { recursive: true, force: true });

  await mkdir(path.join(webDist, "landing"), { recursive: true });
  await mkdir(path.join(webDist, "install"), { recursive: true });
  await mkdir(path.join(webDist, "admin"), { recursive: true });
  await mkdir(path.join(webDist, "scrapbook"), { recursive: true });
  await mkdir(path.join(webDist, "checkout"), { recursive: true });
  await mkdir(webAssetsDist, { recursive: true });

  await build({
    entryPoints: {
      landing: path.join(webClientRoot, "src", "landing", "main.ts"),
      admin: path.join(webClientRoot, "src", "admin", "main.ts"),
      "admin-monitoring": path.join(webClientRoot, "src", "admin", "monitoring.ts"),
      scrapbook: path.join(webClientRoot, "src", "scrapbook", "main.ts"),
      checkout: path.join(webClientRoot, "src", "checkout", "main.ts")
    },
    bundle: true,
    outdir: webAssetsDist,
    splitting: false,
    sourcemap: isDev,
    target: "es2022",
    format: "esm",
    platform: "browser",
    logLevel: "info"
  });

  await cp(path.join(webClientRoot, "src", "landing", "index.html"), path.join(webDist, "landing", "index.html"));
  await cp(path.join(webClientRoot, "src", "landing", "styles.css"), path.join(webDist, "landing", "styles.css"));
  await cp(path.join(webClientRoot, "src", "install", "index.html"), path.join(webDist, "install", "index.html"));
  await cp(path.join(webClientRoot, "src", "admin", "index.html"), path.join(webDist, "admin", "index.html"));
  await cp(path.join(webClientRoot, "src", "admin", "styles.css"), path.join(webDist, "admin", "styles.css"));
  await cp(path.join(webClientRoot, "src", "scrapbook", "index.html"), path.join(webDist, "scrapbook", "index.html"));
  await cp(path.join(webClientRoot, "src", "scrapbook", "styles.css"), path.join(webDist, "scrapbook", "styles.css"));
  await cp(path.join(webClientRoot, "src", "checkout", "index.html"), path.join(webDist, "checkout", "index.html"));
  await cp(path.join(webClientRoot, "src", "checkout", "styles.css"), path.join(webDist, "checkout", "styles.css"));
  await copyRecursive(path.join(webClientRoot, "src", "mockups"), path.join(webDist, "mockups"));
  await copyRecursive(path.join(webClientRoot, "src", "assets", "screenshots"), path.join(webAssetsDist, "screenshots"));
  await copyRecursive(path.join(extensionRoot, "src", "assets"), path.join(webAssetsDist, "icons"));
}

async function buildServer() {
  await mkdir(webDist, { recursive: true });
  await rm(path.join(webDist, "server.js"), { force: true });
  await rm(path.join(webDist, "server.js.map"), { force: true });

  await build({
    entryPoints: {
      server: path.join(webServerRoot, "src", "server.ts")
    },
    bundle: true,
    external: ["nodemailer", "jsdom", "pg"],
    outdir: webDist,
    splitting: false,
    sourcemap: isDev,
    target: "node20",
    format: "esm",
    platform: "node",
    logLevel: "info"
  });
}

if (targetArg === "all") {
  await rm(dist, { recursive: true, force: true });
}

await mkdir(dist, { recursive: true });

if (targets.has("extension")) {
  await buildExtension();
}

if (targets.has("web")) {
  await buildWebClient();
}

if (targets.has("server")) {
  await buildServer();
}
