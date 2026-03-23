import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildDefaultDatabase,
  type AdminHistoryEvent,
  type DashboardSummary,
  type LicenseActivationRecord,
  type LicenseRecord,
  type PaymentMethod,
  type PurchaseOrder,
  type PublicStorefrontResponse,
  type RevenueReport,
  type WebDatabase
} from "../lib/schema";

const DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");

export function getDatabaseFilePath(): string {
  return process.env.THREADS_WEB_DB_FILE || DEFAULT_DB_FILE;
}

let databaseOperationChain: Promise<void> = Promise.resolve();

async function withDatabaseLock<T>(operation: () => Promise<T>): Promise<T> {
  let operationResult: Promise<T>;
  operationResult = databaseOperationChain.then(() => operation());
  databaseOperationChain = operationResult.then(() => undefined, () => undefined);
  return operationResult;
}

async function ensureParentDirectory(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function loadDatabaseUnsafe(filePath = getDatabaseFilePath()): Promise<WebDatabase> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<WebDatabase>;
    const fallback = buildDefaultDatabase();

    return {
      settings: fallback.settings,
      paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : fallback.paymentMethods,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
      activations: Array.isArray(parsed.activations) ? parsed.activations : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    const initial = buildDefaultDatabase();
    await saveDatabase(initial, filePath);
    return initial;
  }
}

export async function saveDatabase(data: WebDatabase, filePath = getDatabaseFilePath()): Promise<void> {
  await ensureParentDirectory(filePath);
  const tmpFilePath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const payload = JSON.stringify(data, null, 2);
  await writeFile(tmpFilePath, payload, "utf8");
  await rename(tmpFilePath, filePath);
}

export async function loadDatabase(filePath = getDatabaseFilePath()): Promise<WebDatabase> {
  return loadDatabaseUnsafe(filePath);
}

export async function withDatabaseTransaction<T>(
  handler: (database: WebDatabase) => Promise<T> | T,
  filePath = getDatabaseFilePath()
): Promise<T> {
  return withDatabaseLock(async () => {
    const database = await loadDatabaseUnsafe(filePath);
    const output = await handler(database);
    await saveDatabase(database, filePath);
    return output;
  });
}

export function buildDashboardSummary(data: WebDatabase): DashboardSummary {
  const webhookIgnored = data.history.filter((event) => event.kind === "webhook_ignored");
  const webhookRejected = data.history.filter((event) => event.kind === "webhook_rejected");

  return {
    pendingOrders: data.orders.filter((order) => order.status === "pending").length,
    paidOrders: data.orders.filter((order) => order.status === "payment_confirmed").length,
    issuedKeys: data.licenses.filter((license) => license.status === "active").length,
    activePaymentMethods: data.paymentMethods.filter((method) => method.enabled).length,
    webhookProcessed: data.history.filter((event) => event.kind === "webhook_processed").length,
    webhookIgnored: webhookIgnored.length,
    webhookRejected: webhookRejected.length,
    webhookDuplicates: webhookIgnored.filter((event) => event.webhookReason === "already_processed").length,
    deliveryReadyToSend: data.orders.filter((order) => order.deliveryStatus === "ready_to_send").length,
    deliverySent: data.orders.filter((order) => order.deliveryStatus === "sent").length
  };
}

export function buildRevenueReport(data: WebDatabase): RevenueReport {
  const priceUsd = Number.parseFloat(process.env.THREADS_PRICE_USD?.trim() ?? "19") || 19;

  const paidOrders = data.orders.filter(
    (order) => order.status === "payment_confirmed" || order.status === "key_issued"
  );

  const byMethodMap = new Map<string, { methodId: string; methodName: string; orders: number; paid: number }>();
  for (const order of data.orders) {
    const method = data.paymentMethods.find((candidate) => candidate.id === order.paymentMethodId);
    const entry = byMethodMap.get(order.paymentMethodId) ?? {
      methodId: order.paymentMethodId,
      methodName: method?.name ?? order.paymentMethodId,
      orders: 0,
      paid: 0
    };
    entry.orders += 1;
    if (order.status === "payment_confirmed" || order.status === "key_issued") {
      entry.paid += 1;
    }

    byMethodMap.set(order.paymentMethodId, entry);
  }

  const byMonthMap = new Map<string, { month: string; orders: number; issued: number }>();
  for (const order of data.orders) {
    const month = order.createdAt.slice(0, 7);
    const entry = byMonthMap.get(month) ?? { month, orders: 0, issued: 0 };
    entry.orders += 1;
    if (order.status === "key_issued") {
      entry.issued += 1;
    }

    byMonthMap.set(month, entry);
  }

  return {
    totalOrders: data.orders.length,
    paidOrders: paidOrders.length,
    cancelledOrders: data.orders.filter((order) => order.status === "cancelled").length,
    issuedKeys: data.licenses.filter((license) => license.status === "active").length,
    revokedKeys: data.licenses.filter((license) => license.status === "revoked").length,
    deliveryReadyToSend: data.orders.filter((order) => order.deliveryStatus === "ready_to_send").length,
    deliverySent: data.orders.filter((order) => order.deliveryStatus === "sent").length,
    estimatedRevenueUsd: paidOrders.length * priceUsd,
    priceUsd,
    byPaymentMethod: [...byMethodMap.values()].sort((a, b) => b.paid - a.paid),
    byMonth: [...byMonthMap.values()].sort((a, b) => a.month.localeCompare(b.month))
  };
}

export function buildPublicStorefront(data: WebDatabase): PublicStorefrontResponse {
  return {
    settings: data.settings,
    paymentMethods: [...data.paymentMethods]
      .filter((method) => method.enabled)
      .sort((left, right) => left.sortOrder - right.sortOrder)
  };
}

export function appendHistory(
  data: WebDatabase,
  event: Omit<AdminHistoryEvent, "id" | "createdAt">
): AdminHistoryEvent {
  const historyEvent: AdminHistoryEvent = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event
  };
  data.history.unshift(historyEvent);
  data.history = data.history.slice(0, 200);
  return historyEvent;
}

export function upsertPaymentMethod(data: WebDatabase, method: PaymentMethod): void {
  const index = data.paymentMethods.findIndex((candidate) => candidate.id === method.id);
  if (index >= 0) {
    data.paymentMethods[index] = method;
    return;
  }

  data.paymentMethods.push(method);
}

export function upsertOrder(data: WebDatabase, order: PurchaseOrder): void {
  const index = data.orders.findIndex((candidate) => candidate.id === order.id);
  if (index >= 0) {
    data.orders[index] = order;
    return;
  }

  data.orders.unshift(order);
}

export function upsertLicense(data: WebDatabase, license: LicenseRecord): void {
  const index = data.licenses.findIndex((candidate) => candidate.id === license.id);
  if (index >= 0) {
    data.licenses[index] = license;
    return;
  }

  data.licenses.unshift(license);
}

export function upsertActivation(data: WebDatabase, activation: LicenseActivationRecord): void {
  const index = data.activations.findIndex((candidate) => candidate.id === activation.id);
  if (index >= 0) {
    data.activations[index] = activation;
    return;
  }

  data.activations.unshift(activation);
}
