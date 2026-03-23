import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { buildDefaultDatabase } from "../src/web/lib/schema";
import { activateLicenseSeat, getLicenseSeatStatus, releaseLicenseSeat } from "../src/web/server/activation-service";
import { signProLicenseToken } from "../src/web/server/license-service";

const privateKeyFile = path.resolve(process.cwd(), "output", "dev-pro-license-private.jwk");

test("seat activation allows up to 3 devices and blocks the 4th", async () => {
  const previous = process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE;
  process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE = privateKeyFile;

  try {
    const data = buildDefaultDatabase("2026-03-22T00:00:00.000Z");
    const token = await signProLicenseToken("master@example.com", null);

    const first = await activateLicenseSeat(data, token, "device-1", "Chrome on macOS");
    const second = await activateLicenseSeat(data, token, "device-2", "Chrome on Windows");
    const third = await activateLicenseSeat(data, token, "device-3", "Edge on Windows");
    const fourth = await activateLicenseSeat(data, token, "device-4", "Chrome on Linux");

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(third.ok, true);
    assert.equal(first.ok && first.seatsUsed, 1);
    assert.equal(second.ok && second.seatsUsed, 2);
    assert.equal(third.ok && third.seatsUsed, 3);
    assert.equal(fourth.ok, false);
    assert.equal(!fourth.ok && fourth.reason, "seat_limit");

    const released = await releaseLicenseSeat(data, token, "device-2");
    assert.equal(released.released, true);

    const retry = await activateLicenseSeat(data, token, "device-4", "Chrome on Linux");
    assert.equal(retry.ok, true);
    assert.equal(retry.ok && retry.seatsUsed, 3);
  } finally {
    if (previous === undefined) {
      delete process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE;
    } else {
      process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE = previous;
    }
  }
});

test("status returns activation_required until this device is activated", async () => {
  const previous = process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE;
  process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE = privateKeyFile;

  try {
    const data = buildDefaultDatabase("2026-03-22T00:00:00.000Z");
    const token = await signProLicenseToken("master@example.com", null);

    const statusBefore = await getLicenseSeatStatus(data, token, "device-1", "Chrome on macOS");
    assert.equal(statusBefore.ok, false);
    assert.equal(!statusBefore.ok && statusBefore.reason, "activation_required");

    await activateLicenseSeat(data, token, "device-1", "Chrome on macOS");
    const statusAfter = await getLicenseSeatStatus(data, token, "device-1", "Chrome on macOS");
    assert.equal(statusAfter.ok, true);
    assert.equal(statusAfter.ok && statusAfter.deviceLabel, "Chrome on macOS");
  } finally {
    if (previous === undefined) {
      delete process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE;
    } else {
      process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE = previous;
    }
  }
});
