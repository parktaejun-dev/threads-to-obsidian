import { getMobileSaveCollectorConfig, syncCollector } from "./service";
import type { MobileSaveCollectorStatus, MobileSaveCollectorSummary } from "./types";

type LoggerLike = Pick<Console, "error" | "info">;

function createInitialStatus(): MobileSaveCollectorStatus {
  const config = getMobileSaveCollectorConfig();
  return {
    enabled: Boolean(config.accessToken),
    running: false,
    botHandle: config.botHandle,
    pairingPostUrl: config.pairingPostUrl,
    pollIntervalMs: config.intervalMs,
    fetchLimit: config.fetchLimit,
    maxPages: config.maxPages,
    lastStartedAt: null,
    lastCompletedAt: null,
    lastError: null,
    lastSummary: null
  };
}

export interface MobileSaveCollector {
  start: () => void;
  stop: () => Promise<void>;
  syncNow: () => Promise<MobileSaveCollectorSummary>;
  getStatus: () => MobileSaveCollectorStatus;
}

export function createMobileSaveCollector(logger: LoggerLike = console): MobileSaveCollector {
  const status = createInitialStatus();
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight: Promise<MobileSaveCollectorSummary> | null = null;

  const refreshConfig = (): void => {
    const config = getMobileSaveCollectorConfig();
    status.enabled = Boolean(config.accessToken);
    status.botHandle = config.botHandle;
    status.pairingPostUrl = config.pairingPostUrl;
    status.pollIntervalMs = config.intervalMs;
    status.fetchLimit = config.fetchLimit;
    status.maxPages = config.maxPages;
  };

  const runSync = async (): Promise<MobileSaveCollectorSummary> => {
    if (inFlight) {
      return inFlight;
    }

    refreshConfig();
    status.lastStartedAt = new Date().toISOString();
    status.running = true;
    status.lastError = null;

    inFlight = syncCollector()
      .then((summary) => {
        status.lastSummary = summary;
        status.lastCompletedAt = new Date().toISOString();
        status.lastError = summary.ok ? null : summary.reason;
        return summary;
      })
      .catch((error) => {
        status.lastCompletedAt = new Date().toISOString();
        status.lastError = error instanceof Error ? error.message : "Unexpected collector error.";
        throw error;
      })
      .finally(() => {
        inFlight = null;
        status.running = false;
      });

    return inFlight;
  };

  const startTimer = (): void => {
    if (timer) {
      clearInterval(timer);
    }
    if (!status.enabled) {
      return;
    }

    timer = setInterval(() => {
      void runSync().catch((error) => {
        logger.error("[threads-mobile-save] collector sync failed:", error);
      });
    }, status.pollIntervalMs);
  };

  return {
    start() {
      refreshConfig();
      startTimer();
      if (status.enabled) {
        void runSync().catch((error) => {
          logger.error("[threads-mobile-save] initial collector sync failed:", error);
        });
      }
    },

    async stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }

      if (inFlight) {
        await Promise.allSettled([inFlight]);
      }
    },

    async syncNow() {
      return await runSync();
    },

    getStatus() {
      refreshConfig();
      return { ...status };
    }
  };
}
