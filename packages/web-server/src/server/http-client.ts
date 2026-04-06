const DEFAULT_OUTBOUND_FETCH_TIMEOUT_MS = 15_000;

function trimEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

function parsePositiveInteger(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getOutboundFetchTimeoutMs(): number {
  return parsePositiveInteger(trimEnv("THREADS_WEB_FETCH_TIMEOUT_MS"), DEFAULT_OUTBOUND_FETCH_TIMEOUT_MS);
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = getOutboundFetchTimeoutMs()): Promise<Response> {
  const controller = new AbortController();
  const upstreamSignal = init.signal;
  const abortFromUpstream = () => {
    controller.abort(upstreamSignal?.reason);
  };

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      abortFromUpstream();
    } else {
      upstreamSignal.addEventListener("abort", abortFromUpstream, { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Outbound request timed out after ${timeoutMs} ms.`));
  }, timeoutMs) as ReturnType<typeof setTimeout> & { unref?: () => void };
  timeoutId.unref?.();

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (controller.signal.aborted && !upstreamSignal?.aborted) {
      throw new Error(`Outbound request timed out after ${timeoutMs} ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", abortFromUpstream);
  }
}
