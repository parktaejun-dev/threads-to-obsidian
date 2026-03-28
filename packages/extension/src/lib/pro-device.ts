const PRO_DEVICE_KEY = "pro-device";

export interface ProDeviceRecord {
  id: string;
  label: string;
  createdAt: string;
}

function inferBrowserName(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) {
    return "Edge";
  }
  if (/Chrome\//.test(ua)) {
    return "Chrome";
  }
  if (/Firefox\//.test(ua)) {
    return "Firefox";
  }
  if (/Safari\//.test(ua)) {
    return "Safari";
  }

  return "Browser";
}

function inferPlatformLabel(): string {
  const value =
    // userAgentData isn't always available in extension pages.
    ((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? "").trim();
  if (!value) {
    return "device";
  }

  return value.replace(/^Mac/i, "macOS").replace(/^Win/i, "Windows");
}

function buildDeviceLabel(): string {
  return `${inferBrowserName()} on ${inferPlatformLabel()}`;
}

export async function getOrCreateProDevice(): Promise<ProDeviceRecord> {
  const stored = await chrome.storage.local.get(PRO_DEVICE_KEY);
  const existing = stored[PRO_DEVICE_KEY] as ProDeviceRecord | undefined;
  if (existing?.id && existing.label) {
    return existing;
  }

  const created: ProDeviceRecord = {
    id: crypto.randomUUID(),
    label: buildDeviceLabel(),
    createdAt: new Date().toISOString()
  };
  await chrome.storage.local.set({ [PRO_DEVICE_KEY]: created });
  return created;
}
