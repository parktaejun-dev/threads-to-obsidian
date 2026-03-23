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
const isDev = process.argv.includes("--dev");

await rm(dist, { recursive: true, force: true });
await mkdir(extensionDist, { recursive: true });
await mkdir(path.join(webDist, "landing"), { recursive: true });
await mkdir(path.join(webDist, "admin"), { recursive: true });

await build({
  entryPoints: {
    background: path.join(root, "src/extension/background.ts"),
    content: path.join(root, "src/extension/content.ts"),
    popup: path.join(root, "src/extension/popup.ts"),
    options: path.join(root, "src/extension/options.ts")
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

await build({
  entryPoints: {
    landing: path.join(root, "src/web/landing/main.ts"),
    admin: path.join(root, "src/web/admin/main.ts")
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

await build({
  entryPoints: {
    server: path.join(root, "src/web/server.ts")
  },
  bundle: true,
  external: ["nodemailer"],
  outdir: webDist,
  splitting: false,
  sourcemap: isDev,
  target: "node20",
  format: "esm",
  platform: "node",
  logLevel: "info"
});

await cp(path.join(root, "src/extension/manifest.json"), path.join(extensionDist, "manifest.json"));
await cp(path.join(root, "src/extension/popup.html"), path.join(extensionDist, "popup.html"));
await cp(path.join(root, "src/extension/popup.css"), path.join(extensionDist, "popup.css"));
await cp(path.join(root, "src/extension/options.html"), path.join(extensionDist, "options.html"));
await cp(path.join(root, "src/extension/options.css"), path.join(extensionDist, "options.css"));
await cp(path.join(root, "src/extension/assets"), path.join(extensionDist, "assets"), { recursive: true });

await cp(path.join(root, "src/web/landing/index.html"), path.join(webDist, "landing", "index.html"));
await cp(path.join(root, "src/web/landing/styles.css"), path.join(webDist, "landing", "styles.css"));
await cp(path.join(root, "src/web/admin/index.html"), path.join(webDist, "admin", "index.html"));
await cp(path.join(root, "src/web/admin/styles.css"), path.join(webDist, "admin", "styles.css"));
await cp(path.join(root, "src/web/mockups"), path.join(webDist, "mockups"), { recursive: true });
await cp(path.join(root, "src/web/assets", "screenshots"), path.join(webAssetsDist, "screenshots"), { recursive: true });
await cp(path.join(root, "src/extension/assets"), path.join(webAssetsDist, "icons"), { recursive: true });
