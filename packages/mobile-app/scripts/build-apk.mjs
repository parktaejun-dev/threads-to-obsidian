#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const androidDir = resolve(appRoot, "android");
const androidAppDir = resolve(androidDir, "app");
const localPropertiesFile = resolve(androidDir, "local.properties");
const versionCodeFile = resolve(androidDir, "version-code.txt");
const debugKeystoreFile = resolve(androidAppDir, "debug.keystore");
const releaseKeystoreFile = resolve(androidAppDir, "release.keystore");
const keystorePropertiesFile = resolve(androidDir, "keystore.properties");
const releaseOutputApk = resolve(androidAppDir, "build/outputs/apk/release/app-release.apk");
const distDir = resolve(appRoot, "dist/apk");
const releaseStorePassword = "android";
const releaseKeyAlias = "androiddebugkey";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readVersionCode() {
  if (!existsSync(versionCodeFile)) {
    return 1;
  }

  const raw = readFileSync(versionCodeFile, "utf8").trim();
  const parsed = Number.parseInt(raw || "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function writeVersionCode(nextVersionCode) {
  writeFileSync(versionCodeFile, `${nextVersionCode}\n`, "utf8");
}

function ensureReleaseKeystore() {
  mkdirSync(androidAppDir, { recursive: true });

  if (existsSync(debugKeystoreFile)) {
    copyFileSync(debugKeystoreFile, releaseKeystoreFile);
  } else {
    const keytoolArgs = [
      "-genkeypair",
      "-v",
      "-keystore",
      releaseKeystoreFile,
      "-storetype",
      "JKS",
      "-alias",
      releaseKeyAlias,
      "-keyalg",
      "RSA",
      "-keysize",
      "2048",
      "-validity",
      "10000",
      "-storepass",
      releaseStorePassword,
      "-keypass",
      releaseStorePassword,
      "-dname",
      "CN=Threads, OU=Mobile, O=Threads, L=Seoul, ST=Seoul, C=KR",
      "-noprompt"
    ];
    const keytool = spawnSync("keytool", keytoolArgs, {
      cwd: androidAppDir,
      stdio: "inherit",
      shell: false
    });

    if (keytool.error) {
      throw keytool.error;
    }

    if (keytool.status !== 0) {
      fail("Failed to generate release keystore.");
    }
  }

  const contents = [
    "storeFile=app/release.keystore",
    `storePassword=${releaseStorePassword}`,
    `keyAlias=${releaseKeyAlias}`,
    `keyPassword=${releaseStorePassword}`,
    ""
  ].join("\n");
  writeFileSync(keystorePropertiesFile, contents, "utf8");
}

function detectAndroidSdkDir() {
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    resolve(homedir(), "Library/Android/sdk"),
    "/opt/android-sdk",
    "/usr/local/share/android-sdk"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function ensureLocalProperties() {
  const sdkDir = detectAndroidSdkDir();
  if (!sdkDir) {
    fail("Android SDK not found. Set ANDROID_SDK_ROOT or create android/local.properties with a valid sdk.dir.");
  }

  const contents = `sdk.dir=${sdkDir}\n`;
  writeFileSync(localPropertiesFile, contents, "utf8");
}

function ensureGradleWrapper() {
  const gradlew = resolve(androidDir, process.platform === "win32" ? "gradlew.bat" : "gradlew");
  if (!existsSync(gradlew)) {
    fail(`Missing Gradle wrapper: ${gradlew}`);
  }
}

function findReleaseApk() {
  if (existsSync(releaseOutputApk)) {
    return releaseOutputApk;
  }

  fail(`Release APK not found at ${releaseOutputApk}`);
}

function copyLatestArtifacts(sourceApk, nextVersionCode) {
  mkdirSync(distDir, { recursive: true });

  const versionedTarget = resolve(distDir, `ss-threads-v${nextVersionCode}.apk`);
  const latestTarget = resolve(distDir, "ss-threads-latest.apk");

  copyFileSync(sourceApk, versionedTarget);
  copyFileSync(sourceApk, latestTarget);

  console.log("");
  console.log("APK build complete:");
  console.log(`- ${versionedTarget}`);
  console.log(`- ${latestTarget}`);
  console.log(`- ${sourceApk}`);
}

ensureGradleWrapper();
ensureLocalProperties();
ensureReleaseKeystore();

const nextVersionCode = readVersionCode() + 1;
writeVersionCode(nextVersionCode);

run(process.platform === "win32" ? "gradlew.bat" : "./gradlew", ["assembleRelease"], androidDir);

copyLatestArtifacts(findReleaseApk(), nextVersionCode);
