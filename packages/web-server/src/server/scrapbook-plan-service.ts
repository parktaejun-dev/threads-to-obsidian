import { validateProLicenseToken } from "@threads/shared/license";
import type { BotArchiveRecord, BotUserRecord, LicenseRecord, WebDatabase } from "@threads/web-schema";
import { upsertBotUser } from "./store";
import { getRuntimeConfigSnapshot } from "./runtime-config";

export const FREE_SCRAPBOOK_ARCHIVE_LIMIT = 100;
export const FREE_SCRAPBOOK_FOLDER_LIMIT = 5;
export const PLUS_SCRAPBOOK_ARCHIVE_LIMIT = 1000;
export const PLUS_SCRAPBOOK_FOLDER_LIMIT = 50;

export type ScrapbookPlanTier = "free" | "plus";
export type ScrapbookPlusStatus = "inactive" | "active" | "expired" | "revoked" | "missing";

export interface ScrapbookPlanState {
  tier: ScrapbookPlanTier;
  archiveLimit: number;
  folderLimit: number;
  archiveCount: number;
  remainingArchiveSlots: number;
  plusStatus: ScrapbookPlusStatus;
  plusLicenseId: string | null;
  plusActivatedAt: string | null;
  plusExpiresAt: string | null;
}

function safeText(value: string | null | undefined): string {
  return value ?? "";
}

function normalizeThreadsHandle(value: string | null | undefined): string {
  return safeText(value).trim().replace(/^@+/, "").toLowerCase();
}

function isTriggerOnlyArchiveRecord(
  item: Pick<BotArchiveRecord, "mentionAuthorHandle" | "mentionUrl" | "targetAuthorHandle" | "targetText" | "targetUrl">,
  botHandle: string | null | undefined
): boolean {
  const normalizedBotHandle = normalizeThreadsHandle(botHandle);
  if (!normalizedBotHandle) {
    return false;
  }

  const normalizedTargetText = safeText(item.targetText).trim().toLowerCase();
  if (!normalizedTargetText.includes(`@${normalizedBotHandle}`)) {
    return false;
  }

  return (
    item.targetUrl === item.mentionUrl &&
    normalizeThreadsHandle(item.targetAuthorHandle) === normalizeThreadsHandle(item.mentionAuthorHandle)
  );
}

function hasLicenseExpired(license: LicenseRecord | null): boolean {
  if (!license?.expiresAt) {
    return false;
  }

  const expiresAt = Date.parse(license.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

function findUserPlusLicense(data: WebDatabase, user: BotUserRecord | null): LicenseRecord | null {
  if (!user?.plusLicenseId) {
    return null;
  }

  return data.licenses.find((candidate) => candidate.id === user.plusLicenseId) ?? null;
}

function isActivePlusLicense(license: LicenseRecord | null): boolean {
  return Boolean(license && license.status !== "revoked" && !hasLicenseExpired(license));
}

export function countScrapbookArchivesForUser(data: WebDatabase, userId: string): number {
  const botHandle = getRuntimeConfigSnapshot().collector.botHandle || process.env.THREADS_BOT_HANDLE?.trim() || "";
  return (
    data.botArchives.filter(
      (candidate) => candidate.userId === userId && !isTriggerOnlyArchiveRecord(candidate, botHandle)
    ).length +
    data.cloudArchives.filter((candidate) => candidate.userId === userId).length
  );
}

export function readScrapbookPlanState(
  data: WebDatabase,
  user: BotUserRecord | null | undefined
): ScrapbookPlanState {
  const archiveCount = user ? countScrapbookArchivesForUser(data, user.id) : 0;
  const license = findUserPlusLicense(data, user ?? null);

  let plusStatus: ScrapbookPlusStatus = "inactive";
  if (user?.plusLicenseId) {
    if (!license) {
      plusStatus = "missing";
    } else if (license.status === "revoked") {
      plusStatus = "revoked";
    } else if (hasLicenseExpired(license)) {
      plusStatus = "expired";
    } else {
      plusStatus = "active";
    }
  }

  const tier: ScrapbookPlanTier = plusStatus === "active" ? "plus" : "free";
  const archiveLimit = tier === "plus" ? PLUS_SCRAPBOOK_ARCHIVE_LIMIT : FREE_SCRAPBOOK_ARCHIVE_LIMIT;
  const folderLimit = tier === "plus" ? PLUS_SCRAPBOOK_FOLDER_LIMIT : FREE_SCRAPBOOK_FOLDER_LIMIT;

  return {
    tier,
    archiveLimit,
    folderLimit,
    archiveCount,
    remainingArchiveSlots: Math.max(0, archiveLimit - archiveCount),
    plusStatus,
    plusLicenseId: user?.plusLicenseId ?? null,
    plusActivatedAt: user?.plusActivatedAt ?? null,
    plusExpiresAt: license?.expiresAt ?? null
  };
}

export function canCreateScrapbookArchive(
  data: WebDatabase,
  user: BotUserRecord,
  existingArchive: { id: string } | null | undefined
): { allowed: boolean; plan: ScrapbookPlanState } {
  const plan = readScrapbookPlanState(data, user);
  if (existingArchive) {
    return { allowed: true, plan };
  }

  return {
    allowed: plan.archiveCount < plan.archiveLimit,
    plan
  };
}

export function getScrapbookArchiveLimitError(plan: ScrapbookPlanState): string {
  if (plan.tier === "plus") {
    return `Plus scrapbook is limited to ${plan.archiveLimit} saved posts. Delete older items to keep saving.`;
  }

  return `Free scrapbook is limited to ${plan.archiveLimit} saved posts. Upgrade to Plus to keep saving.`;
}

export async function activateScrapbookPlus(
  data: WebDatabase,
  user: BotUserRecord,
  token: string
): Promise<ScrapbookPlanState> {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    throw new Error("Enter a Plus key first.");
  }

  const validation = await validateProLicenseToken(normalizedToken);
  if (validation.state === "none" || validation.state === "invalid") {
    throw new Error("This Plus key is not valid.");
  }
  if (validation.state === "expired") {
    throw new Error("This Plus key has expired.");
  }

  const license = data.licenses.find((candidate) => candidate.token === normalizedToken) ?? null;
  if (!license) {
    throw new Error("This Plus key is not recognized by this server.");
  }
  if (license.status === "revoked") {
    throw new Error("This Plus key has been revoked.");
  }
  if (hasLicenseExpired(license)) {
    throw new Error("This Plus key has expired.");
  }

  const otherUser = data.botUsers.find(
    (candidate) =>
      candidate.id !== user.id &&
      candidate.status === "active" &&
      candidate.plusLicenseId === license.id
  );
  if (otherUser) {
    throw new Error(`This Plus key is already linked to @${otherUser.threadsHandle}.`);
  }

  user.plusLicenseId = license.id;
  user.plusActivatedAt = new Date().toISOString();
  user.updatedAt = user.plusActivatedAt;
  upsertBotUser(data, user);
  return readScrapbookPlanState(data, user);
}

export function syncScrapbookPlusLicenseLink(
  data: WebDatabase,
  user: BotUserRecord,
  licenseId: string | null | undefined,
  linkedAt?: string | null
): boolean {
  const normalizedLicenseId = `${licenseId ?? ""}`.trim();
  if (!normalizedLicenseId) {
    return false;
  }

  const license = data.licenses.find((candidate) => candidate.id === normalizedLicenseId) ?? null;
  if (!license || !isActivePlusLicense(license)) {
    return false;
  }
  const activeLicense: LicenseRecord = license;

  const otherUser = data.botUsers.find(
    (candidate) =>
      candidate.id !== user.id &&
      candidate.status === "active" &&
      candidate.plusLicenseId === activeLicense.id
  );
  if (otherUser) {
    return false;
  }

  const currentLicense = findUserPlusLicense(data, user);
  if (user.plusLicenseId && user.plusLicenseId !== activeLicense.id && isActivePlusLicense(currentLicense)) {
    return false;
  }

  if (user.plusLicenseId === activeLicense.id && user.plusActivatedAt) {
    return true;
  }

  const syncedAt = `${linkedAt ?? ""}`.trim() || new Date().toISOString();
  user.plusLicenseId = activeLicense.id;
  user.plusActivatedAt = user.plusActivatedAt ?? syncedAt;
  user.updatedAt = syncedAt;
  upsertBotUser(data, user);
  return true;
}

export function clearScrapbookPlus(data: WebDatabase, user: BotUserRecord): ScrapbookPlanState {
  user.plusLicenseId = null;
  user.plusActivatedAt = null;
  user.updatedAt = new Date().toISOString();
  upsertBotUser(data, user);
  return readScrapbookPlanState(data, user);
}
