import { createHash } from "node:crypto";

import type {
  WebDatabase,
  WebhookEventRecord,
  WebhookEventStatus
} from "@threads/web-schema";

const MAX_WEBHOOK_EVENTS = 200;

function buildWebhookDedupeKey(provider: string, eventId: string): string {
  return `${provider}:${eventId}`;
}

export function buildWebhookPayloadHash(rawText: string): string {
  return createHash("sha256").update(rawText).digest("hex");
}

export function recordWebhookEventAttempt(
  data: WebDatabase,
  options: {
    provider: string;
    eventId: string | null;
    payloadHash: string;
  }
): WebhookEventRecord | null {
  if (!options.eventId) {
    return null;
  }

  const now = new Date().toISOString();
  const dedupeKey = buildWebhookDedupeKey(options.provider, options.eventId);
  const existing = data.webhookEvents.find((candidate) => candidate.dedupeKey === dedupeKey);
  if (existing) {
    existing.attempts += 1;
    existing.lastSeenAt = now;
    existing.payloadHash = options.payloadHash;
    return existing;
  }

  const record: WebhookEventRecord = {
    id: crypto.randomUUID(),
    provider: options.provider,
    eventId: options.eventId,
    dedupeKey,
    payloadHash: options.payloadHash,
    orderId: null,
    paymentMethodId: null,
    licenseId: null,
    status: "received",
    reason: null,
    attempts: 1,
    firstSeenAt: now,
    lastSeenAt: now,
    handledAt: null,
    responseStatusCode: null
  };
  data.webhookEvents.unshift(record);
  data.webhookEvents = data.webhookEvents
    .sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt))
    .slice(0, MAX_WEBHOOK_EVENTS);
  return record;
}

export function markWebhookEventOutcome(
  event: WebhookEventRecord | null,
  options: {
    status: WebhookEventStatus;
    reason: string;
    orderId?: string | null;
    paymentMethodId?: string | null;
    licenseId?: string | null;
    responseStatusCode?: number | null;
  }
): void {
  if (!event) {
    return;
  }

  event.status = options.status;
  event.reason = options.reason;
  event.orderId = options.orderId ?? event.orderId;
  event.paymentMethodId = options.paymentMethodId ?? event.paymentMethodId;
  event.licenseId = options.licenseId ?? event.licenseId;
  event.responseStatusCode = options.responseStatusCode ?? event.responseStatusCode;
  event.handledAt = new Date().toISOString();
}

export function isProcessedWebhookDuplicate(event: WebhookEventRecord | null): boolean {
  return Boolean(event && event.status === "processed");
}

export function listRecentWebhookEvents(data: WebDatabase, limit = 50): WebhookEventRecord[] {
  return [...data.webhookEvents]
    .sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt))
    .slice(0, limit);
}
