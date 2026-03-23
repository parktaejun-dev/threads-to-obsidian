import { DEFAULT_OPTIONS } from "./config";
import { validateProLicenseToken } from "./license";
import { getOrCreateProDevice } from "./pro-device";
import { activateLicenseWithServer, getServerLicenseStatus, mapServerFailureToActivationState, releaseLicenseWithServer } from "./pro-activation";
import type { ExtensionOptions, LicensePayload, PlanStatus, RecentSave } from "./types";
import { decodeEscapedJsonString } from "./utils";

const OPTIONS_KEY = "options";
const RECENT_SAVES_KEY = "recent-saves";
const LICENSE_KEY = "pro-license";
const LEGACY_DEFAULT_FILENAME_PATTERN = "{date}__{author}__{shortcode}";
const PREVIOUS_DEFAULT_FILENAME_PATTERN = "{date}_{author}_{shortcode}";
const OLD_FIRST_SENTENCE_DEFAULT_FILENAME_PATTERN = "{author}_{first_sentence}";
const PREVIOUS_SHORTCODE_DEFAULT_FILENAME_PATTERN = "{author}_{shortcode}";
const MAX_RECENT_SAVES = 10;
const PLAN_STATUS_TTL_MS = 5 * 60_000;

interface StoredActivationRecord {
  state: "active";
  deviceId: string;
  deviceLabel: string;
  seatLimit: number;
  seatsUsed: number;
  activatedAt: string;
  validatedAt: string;
}

interface StoredLicenseRecord {
  key: string;
  activatedAt: string;
  payload: LicensePayload;
  activation: StoredActivationRecord | null;
}

function mergeOptionsWithDefaults(options: Partial<ExtensionOptions> | undefined): ExtensionOptions {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    aiOrganization: {
      ...DEFAULT_OPTIONS.aiOrganization,
      ...(options?.aiOrganization ?? {})
    }
  };
}

function normalizeRecentSave(item: RecentSave & { zipFilename?: string }): RecentSave {
  const archiveName = item.archiveName ?? item.zipFilename?.replace(/\.zip$/i, "") ?? "";
  const post = {
    ...item.post,
    videoUrl: item.post.videoUrl ?? null,
    title: decodeEscapedJsonString(item.post.title),
    text: decodeEscapedJsonString(item.post.text),
    authorReplies: item.post.authorReplies.map((reply) => ({
      ...reply,
      videoUrl: reply.videoUrl ?? null,
      text: decodeEscapedJsonString(reply.text)
    }))
  };

  return {
    ...item,
    archiveName,
    savedVia: item.savedVia ?? "zip",
    savedRelativePath: item.savedRelativePath ?? null,
    warning: item.warning ?? null,
    post,
    title: decodeEscapedJsonString(item.title)
  };
}

export async function getOptions(): Promise<ExtensionOptions> {
  const stored = await chrome.storage.local.get(OPTIONS_KEY);
  const storedOptions = stored[OPTIONS_KEY] as Partial<ExtensionOptions> | undefined;
  const merged = mergeOptionsWithDefaults(storedOptions);
  let shouldPersist = false;

  if (
    !merged.filenamePattern ||
    merged.filenamePattern === LEGACY_DEFAULT_FILENAME_PATTERN ||
    merged.filenamePattern === PREVIOUS_DEFAULT_FILENAME_PATTERN ||
    merged.filenamePattern === OLD_FIRST_SENTENCE_DEFAULT_FILENAME_PATTERN ||
    merged.filenamePattern === PREVIOUS_SHORTCODE_DEFAULT_FILENAME_PATTERN
  ) {
    merged.filenamePattern = DEFAULT_OPTIONS.filenamePattern;
    shouldPersist = true;
  }

  if (merged.obsidianFolderLabel === undefined) {
    merged.obsidianFolderLabel = DEFAULT_OPTIONS.obsidianFolderLabel;
    shouldPersist = true;
  }

  if (merged.savePathPattern === undefined) {
    merged.savePathPattern = DEFAULT_OPTIONS.savePathPattern;
    shouldPersist = true;
  }

  if (!storedOptions?.aiOrganization) {
    shouldPersist = true;
  } else {
    const expectedAiKeys = Object.keys(DEFAULT_OPTIONS.aiOrganization) as Array<keyof ExtensionOptions["aiOrganization"]>;
    for (const key of expectedAiKeys) {
      if (storedOptions.aiOrganization[key] === undefined) {
        shouldPersist = true;
        break;
      }
    }
  }

  if (shouldPersist) {
    await chrome.storage.local.set({ [OPTIONS_KEY]: merged });
  }
  return merged;
}

export async function setOptions(options: ExtensionOptions): Promise<void> {
  await chrome.storage.local.set({ [OPTIONS_KEY]: mergeOptionsWithDefaults(options) });
}

function buildPlanStatus(
  licenseState: PlanStatus["licenseState"],
  payload: LicensePayload | null,
  overrides: Partial<PlanStatus> = {}
): PlanStatus {
  return {
    tier: licenseState === "valid" && payload && overrides.activationState === "active" ? "pro" : "free",
    licenseState,
    holder: payload?.holder ?? null,
    expiresAt: payload?.expiresAt ?? null,
    activationState: overrides.activationState ?? "none",
    seatLimit: overrides.seatLimit ?? null,
    seatsUsed: overrides.seatsUsed ?? null,
    deviceLabel: overrides.deviceLabel ?? null,
    activatedAt: overrides.activatedAt ?? null
  };
}

function isActivationFresh(record: StoredActivationRecord | null): boolean {
  if (!record?.validatedAt) {
    return false;
  }

  return Date.now() - Date.parse(record.validatedAt) < PLAN_STATUS_TTL_MS;
}

async function readStoredLicenseRecord(): Promise<StoredLicenseRecord | null> {
  const stored = await chrome.storage.local.get(LICENSE_KEY);
  return (stored[LICENSE_KEY] as StoredLicenseRecord | null | undefined) ?? null;
}

async function writeStoredLicenseRecord(record: StoredLicenseRecord | null): Promise<void> {
  await chrome.storage.local.set({ [LICENSE_KEY]: record });
}

export async function getPlanStatus(): Promise<PlanStatus> {
  const record = await readStoredLicenseRecord();
  if (!record?.key) {
    return buildPlanStatus("none", null);
  }

  const validation = await validateProLicenseToken(record.key);
  if (validation.state !== "valid" || !validation.payload) {
    return buildPlanStatus(validation.state, validation.payload);
  }

  if (isActivationFresh(record.activation)) {
    const activation = record.activation;
    return buildPlanStatus("valid", validation.payload, {
      activationState: "active",
      seatLimit: activation?.seatLimit ?? null,
      seatsUsed: activation?.seatsUsed ?? null,
      deviceLabel: activation?.deviceLabel ?? null,
      activatedAt: activation?.activatedAt ?? null
    });
  }

  const device = await getOrCreateProDevice();
  try {
    const server = await getServerLicenseStatus(record.key, device.id, device.label);
    if (server.ok) {
      const nextRecord: StoredLicenseRecord = {
        ...record,
        payload: validation.payload,
        activation: {
          state: "active",
          deviceId: server.deviceId,
          deviceLabel: server.deviceLabel,
          seatLimit: server.seatLimit,
          seatsUsed: server.seatsUsed,
          activatedAt: server.activatedAt,
          validatedAt: new Date().toISOString()
        }
      };
      await writeStoredLicenseRecord(nextRecord);
      return buildPlanStatus("valid", validation.payload, {
        activationState: "active",
        seatLimit: server.seatLimit,
        seatsUsed: server.seatsUsed,
        deviceLabel: server.deviceLabel,
        activatedAt: server.activatedAt
      });
    }

    const nextRecord: StoredLicenseRecord = {
      ...record,
      payload: validation.payload,
      activation: null
    };
    await writeStoredLicenseRecord(nextRecord);
    return buildPlanStatus("valid", validation.payload, {
      activationState: mapServerFailureToActivationState(server.reason),
      seatLimit: server.seatLimit,
      seatsUsed: server.seatsUsed
    });
  } catch {
    if (record.activation) {
      return buildPlanStatus("valid", validation.payload, {
        activationState: "active",
        seatLimit: record.activation.seatLimit,
        seatsUsed: record.activation.seatsUsed,
        deviceLabel: record.activation.deviceLabel,
        activatedAt: record.activation.activatedAt
      });
    }

    return buildPlanStatus("valid", validation.payload, {
      activationState: "offline"
    });
  }
}

export async function activateProLicense(key: string): Promise<PlanStatus> {
  const validation = await validateProLicenseToken(key);
  if (validation.state !== "valid" || !validation.payload) {
    return buildPlanStatus(validation.state, validation.payload);
  }

  const existing = await readStoredLicenseRecord();
  if (existing?.key && existing.key !== key.trim() && existing.activation?.deviceId) {
    try {
      await releaseLicenseWithServer(existing.key, existing.activation.deviceId);
    } catch {
      // continue with the new activation attempt
    }
  }

  const device = await getOrCreateProDevice();
  try {
    const server = await activateLicenseWithServer(key.trim(), device.id, device.label);
    if (!server.ok) {
      return buildPlanStatus("valid", validation.payload, {
        activationState: mapServerFailureToActivationState(server.reason),
        seatLimit: server.seatLimit,
        seatsUsed: server.seatsUsed
      });
    }

    const nextRecord: StoredLicenseRecord = {
      key: key.trim(),
      activatedAt: new Date().toISOString(),
      payload: validation.payload,
      activation: {
        state: "active",
        deviceId: server.deviceId,
        deviceLabel: server.deviceLabel,
        seatLimit: server.seatLimit,
        seatsUsed: server.seatsUsed,
        activatedAt: server.activatedAt,
        validatedAt: new Date().toISOString()
      }
    };
    await writeStoredLicenseRecord(nextRecord);
    return buildPlanStatus(validation.state, validation.payload, {
      activationState: "active",
      seatLimit: server.seatLimit,
      seatsUsed: server.seatsUsed,
      deviceLabel: server.deviceLabel,
      activatedAt: server.activatedAt
    });
  } catch {
    return buildPlanStatus("valid", validation.payload, {
      activationState: "offline"
    });
  }
}

export async function clearProLicense(): Promise<void> {
  const record = await readStoredLicenseRecord();
  if (record?.key && record.activation?.deviceId) {
    try {
      await releaseLicenseWithServer(record.key, record.activation.deviceId);
    } catch {
      // local clear is best-effort even if release fails
    }
  }

  await writeStoredLicenseRecord(null);
}

export async function getEffectiveOptions(): Promise<ExtensionOptions> {
  const [options, planStatus] = await Promise.all([getOptions(), getPlanStatus()]);
  if (planStatus.tier === "pro") {
    return options;
  }

  return {
    ...options,
    filenamePattern: DEFAULT_OPTIONS.filenamePattern,
    savePathPattern: DEFAULT_OPTIONS.savePathPattern,
    aiOrganization: {
      ...options.aiOrganization,
      enabled: false
    }
  };
}

export async function getRecentSaves(): Promise<RecentSave[]> {
  const stored = await chrome.storage.local.get(RECENT_SAVES_KEY);
  const recent = ((stored[RECENT_SAVES_KEY] as Array<RecentSave & { zipFilename?: string }> | undefined) ?? []).map(normalizeRecentSave);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: recent });
  return recent;
}

export async function upsertRecentSave(save: RecentSave): Promise<RecentSave[]> {
  const recent = await getRecentSaves();
  const filtered = recent.filter((item) => item.id !== save.id && item.canonicalUrl !== save.canonicalUrl);
  filtered.unshift(save);
  const next = filtered.slice(0, MAX_RECENT_SAVES);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: next });

  return next;
}

export async function findRecentSaveById(id: string): Promise<RecentSave | null> {
  const recent = await getRecentSaves();
  return recent.find((item) => item.id === id) ?? null;
}

export async function removeRecentSaveById(id: string): Promise<RecentSave[]> {
  const recent = await getRecentSaves();
  const next = recent.filter((item) => item.id !== id);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: next });
  return next;
}

export async function clearRecentSaves(): Promise<void> {
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: [] });
}

export async function findDuplicateSave(canonicalUrl: string, contentHash: string): Promise<RecentSave | null> {
  const recent = await getRecentSaves();
  return recent.find((item) => item.canonicalUrl === canonicalUrl && item.contentHash === contentHash) ?? null;
}

export async function findRecentSaveByUrl(canonicalUrl: string): Promise<RecentSave | null> {
  const recent = await getRecentSaves();
  return recent.find((item) => item.canonicalUrl === canonicalUrl) ?? null;
}
