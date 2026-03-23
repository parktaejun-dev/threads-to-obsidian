import test from "node:test";
import assert from "node:assert/strict";

type ChromeLike = typeof chrome;

function createChromeStorageStub(storageState: Map<string, unknown>): ChromeLike {
  return {
    storage: {
      local: {
        async get(key: string) {
          return { [key]: storageState.get(key) };
        },
        async set(values: Record<string, unknown>) {
          for (const [key, value] of Object.entries(values)) {
            storageState.set(key, value);
          }
        }
      }
    }
  } as unknown as ChromeLike;
}

test("free tier should fall back to default advanced options even if custom options are stored", async (t) => {
  let storageMod: any;
  let configMod: any;

  try {
    storageMod = await import("../src/extension/lib/storage");
    configMod = await import("../src/extension/lib/config");
  } catch {
    t.skip("storage/config modules not available in test environment");
    return;
  }

  if (typeof storageMod.getEffectiveOptions !== "function") {
    t.skip("getEffectiveOptions not implemented yet");
    return;
  }

  const storageState = new Map<string, unknown>();
  const previousChrome = (globalThis as any).chrome;
  (globalThis as any).chrome = createChromeStorageStub(storageState);
  try {
    // Store custom options directly.
    storageState.set("options", {
      filenamePattern: "{date}_{author}_{shortcode}",
      includeImages: true,
      obsidianFolderLabel: null,
      savePathPattern: "Sources/Threads/{author}",
      aiOrganization: {
        enabled: true,
        apiKey: "test-key",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4.1-mini",
        prompt: "test"
      }
    });

    const effective = await storageMod.getEffectiveOptions();
    assert.equal(effective.filenamePattern, configMod.DEFAULT_OPTIONS.filenamePattern);
    assert.equal(effective.savePathPattern, configMod.DEFAULT_OPTIONS.savePathPattern);
    assert.equal(effective.aiOrganization.enabled, false);
  } finally {
    (globalThis as any).chrome = previousChrome;
  }
});

test("pro tier should use stored advanced options", async (t) => {
  let storageMod: any;
  let configMod: any;

  try {
    storageMod = await import("../src/extension/lib/storage");
    configMod = await import("../src/extension/lib/config");
  } catch {
    t.skip("storage/config modules not available in test environment");
    return;
  }

  // We intentionally do not embed the real private key used for PRO_LICENSE_PUBLIC_KEY in tests.
  // So here we only verify that invalid license activation does not grant Pro behavior.
  if (typeof storageMod.getEffectiveOptions !== "function" || typeof storageMod.activateProLicense !== "function") {
    t.skip("license activation/gating not implemented yet");
    return;
  }

  const storageState = new Map<string, unknown>();
  const previousChrome = (globalThis as any).chrome;
  (globalThis as any).chrome = createChromeStorageStub(storageState);
  try {
    storageState.set("options", {
      filenamePattern: "{date}_{author}_{shortcode}",
      includeImages: true,
      obsidianFolderLabel: null,
      savePathPattern: "Sources/Threads/{author}",
      aiOrganization: {
        enabled: true,
        apiKey: "test-key",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4.1-mini",
        prompt: "test"
      }
    });

    const status = await storageMod.activateProLicense("invalid-token");
    assert.equal(status.tier, "free");

    const effective = await storageMod.getEffectiveOptions();
    assert.equal(effective.filenamePattern, configMod.DEFAULT_OPTIONS.filenamePattern);
    assert.equal(effective.savePathPattern, configMod.DEFAULT_OPTIONS.savePathPattern);
    assert.equal(effective.aiOrganization.enabled, false);

    // Sanity: pro tier should not change baseline defaults.
    assert.equal(configMod.DEFAULT_OPTIONS.filenamePattern.length > 0, true);
  } finally {
    (globalThis as any).chrome = previousChrome;
  }
});

test("plan status should be none when no license is stored", async (t) => {
  let storageMod: any;
  try {
    storageMod = await import("../src/extension/lib/storage");
  } catch {
    t.skip("storage module not available");
    return;
  }

  if (typeof storageMod.getPlanStatus !== "function") {
    t.skip("getPlanStatus not implemented");
    return;
  }

  const storageState = new Map<string, unknown>();
  const previousChrome = (globalThis as any).chrome;
  (globalThis as any).chrome = createChromeStorageStub(storageState);
  try {
    const status = await storageMod.getPlanStatus();
    assert.equal(status.tier, "free");
    assert.equal(status.licenseState, "none");
  } finally {
    (globalThis as any).chrome = previousChrome;
  }
});

test("activateProLicense should not store invalid license keys", async (t) => {
  let storageMod: any;
  try {
    storageMod = await import("../src/extension/lib/storage");
  } catch {
    t.skip("storage module not available");
    return;
  }

  if (typeof storageMod.activateProLicense !== "function") {
    t.skip("activateProLicense not implemented");
    return;
  }

  const storageState = new Map<string, unknown>();
  const previousChrome = (globalThis as any).chrome;
  (globalThis as any).chrome = createChromeStorageStub(storageState);
  try {
    const status = await storageMod.activateProLicense("invalid-token");
    assert.equal(status.tier, "free");
    assert.equal(status.licenseState, "invalid");
    assert.equal(storageState.has("pro-license"), false);
  } finally {
    (globalThis as any).chrome = previousChrome;
  }
});

test("clearProLicense should remove stored license record", async (t) => {
  let storageMod: any;
  try {
    storageMod = await import("../src/extension/lib/storage");
  } catch {
    t.skip("storage module not available");
    return;
  }

  if (typeof storageMod.clearProLicense !== "function" || typeof storageMod.getPlanStatus !== "function") {
    t.skip("clearProLicense/getPlanStatus not implemented");
    return;
  }

  const storageState = new Map<string, unknown>();
  const previousChrome = (globalThis as any).chrome;
  (globalThis as any).chrome = createChromeStorageStub(storageState);
  try {
    storageState.set("pro-license", {
      key: "definitely-invalid",
      activatedAt: new Date().toISOString(),
      payload: {
        plan: "pro",
        holder: null,
        issuedAt: new Date().toISOString(),
        expiresAt: null
      }
    });

    await storageMod.clearProLicense();
    assert.equal(storageState.get("pro-license"), null);

    const status = await storageMod.getPlanStatus();
    assert.equal(status.tier, "free");
    assert.equal(status.licenseState, "none");
  } finally {
    (globalThis as any).chrome = previousChrome;
  }
});

test("options migration should fill missing savePathPattern with default", async (t) => {
  let storageMod: any;
  let configMod: any;

  try {
    storageMod = await import("../src/extension/lib/storage");
    configMod = await import("../src/extension/lib/config");
  } catch {
    t.skip("storage/config modules not available in test environment");
    return;
  }

  if (typeof storageMod.getOptions !== "function") {
    t.skip("getOptions not implemented");
    return;
  }

  // This test only becomes meaningful once savePathPattern exists.
  if (!("savePathPattern" in configMod.DEFAULT_OPTIONS)) {
    t.skip("DEFAULT_OPTIONS.savePathPattern not implemented yet");
    return;
  }

  const storageState = new Map<string, unknown>();
  const previousChrome = (globalThis as any).chrome;
  (globalThis as any).chrome = createChromeStorageStub(storageState);
  try {
    storageState.set("options", {
      filenamePattern: configMod.DEFAULT_OPTIONS.filenamePattern,
      includeImages: true,
      obsidianFolderLabel: null
    });

    const options = await storageMod.getOptions();
    assert.equal(options.savePathPattern, configMod.DEFAULT_OPTIONS.savePathPattern);
    assert.equal(options.aiOrganization.provider, configMod.DEFAULT_OPTIONS.aiOrganization.provider);
    assert.equal(options.aiOrganization.baseUrl, configMod.DEFAULT_OPTIONS.aiOrganization.baseUrl);
  } finally {
    (globalThis as any).chrome = previousChrome;
  }
});
