import JSZip from "jszip";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const extensionDist = path.join(root, "dist", "extension");
const releaseOutputDir = path.join(root, "output", "release-assets");
const releaseAssetName = "threads-saver-extension.zip";
const archiveRootDirectory = "threads-saver-extension";

async function addDirectoryToZip(zip, sourceDir, zipDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const zipPath = path.posix.join(zipDir, entry.name);

    if (entry.isDirectory()) {
      await addDirectoryToZip(zip, sourcePath, zipPath);
      continue;
    }

    if (entry.isFile()) {
      zip.file(zipPath, await readFile(sourcePath));
    }
  }
}

async function main() {
  const zip = new JSZip();
  await mkdir(releaseOutputDir, { recursive: true });
  await addDirectoryToZip(zip, extensionDist, archiveRootDirectory);

  const outputPath = path.join(releaseOutputDir, releaseAssetName);
  const archiveBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });

  await rm(outputPath, { force: true });
  await writeFile(outputPath, archiveBuffer);
  console.log(outputPath);
}

await main();
