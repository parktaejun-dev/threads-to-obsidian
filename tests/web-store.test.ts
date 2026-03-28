import test from "node:test";
import assert from "node:assert/strict";

import { buildDeliveryDraft, buildTokenPreview } from "../packages/web-server/src/server/license-service";
import { buildPublicStorefront, buildDashboardSummary } from "../packages/web-server/src/server/store";
import { buildDefaultDatabase } from "@threads/web-schema";

test("public storefront only includes enabled payment methods in sort order", () => {
  const data = buildDefaultDatabase("2026-03-17T00:00:00.000Z");
  data.paymentMethods.push({
    id: "pm-disabled",
    name: "Disabled",
    summary: "hidden",
    instructions: "n/a",
    actionLabel: "Continue",
    actionUrl: "",
    enabled: false,
    sortOrder: 0,
    createdAt: "2026-03-17T00:00:00.000Z",
    updatedAt: "2026-03-17T00:00:00.000Z"
  });

  const storefront = buildPublicStorefront(data);
  assert.equal(storefront.paymentMethods.length, 3);
  assert.equal(storefront.paymentMethods[0]?.id, "pm-stableorder");
  assert.equal(storefront.paymentMethods[1]?.id, "pm-stripe");
  assert.equal(storefront.paymentMethods[2]?.id, "pm-paypal");
});

test("dashboard summary counts pending, paid, and issued records", () => {
  const data = buildDefaultDatabase("2026-03-17T00:00:00.000Z");
  data.orders.push(
    {
      id: "o-1",
      buyerName: "A",
      buyerEmail: "a@example.com",
      paymentMethodId: "pm-stableorder",
      status: "pending",
      note: "",
      createdAt: "2026-03-17T00:00:00.000Z",
      updatedAt: "2026-03-17T00:00:00.000Z",
      paidAt: null,
      issuedLicenseId: null,
      deliveryStatus: "not_sent"
    },
    {
      id: "o-2",
      buyerName: "B",
      buyerEmail: "b@example.com",
      paymentMethodId: "pm-paypal",
      status: "payment_confirmed",
      note: "",
      createdAt: "2026-03-17T00:00:00.000Z",
      updatedAt: "2026-03-17T00:00:00.000Z",
      paidAt: "2026-03-17T01:00:00.000Z",
      issuedLicenseId: null,
      deliveryStatus: "not_sent"
    }
  );
  data.licenses.push({
    id: "l-1",
    orderId: "o-2",
    holderName: "B",
    holderEmail: "b@example.com",
    token: "token-value",
    tokenPreview: buildTokenPreview("token-value"),
    issuedAt: "2026-03-17T02:00:00.000Z",
    expiresAt: null,
    revokedAt: null,
    status: "active"
  });

  const summary = buildDashboardSummary(data);
  assert.equal(summary.pendingOrders, 1);
  assert.equal(summary.paidOrders, 1);
  assert.equal(summary.issuedKeys, 1);
  assert.equal(summary.activePaymentMethods, 3);
});

test("email delivery draft includes token and activation steps", () => {
  const draft = buildDeliveryDraft(
    {
      id: "o-1",
      buyerName: "Alice",
      buyerEmail: "alice@example.com",
      paymentMethodId: "pm-stableorder",
      status: "key_issued",
      note: "",
      createdAt: "2026-03-17T00:00:00.000Z",
      updatedAt: "2026-03-17T00:00:00.000Z",
      paidAt: "2026-03-17T00:10:00.000Z",
      issuedLicenseId: "l-1",
      deliveryStatus: "ready_to_send"
    },
    {
      id: "l-1",
      orderId: "o-1",
      holderName: "Alice",
      holderEmail: "alice@example.com",
      token: "signed.token.value",
      tokenPreview: "signed...value",
      issuedAt: "2026-03-17T00:11:00.000Z",
      expiresAt: null,
      revokedAt: null,
      status: "active"
    }
  );

  assert.equal(draft.to, "alice@example.com");
  assert.match(draft.subject, /Pro key/i);
  assert.match(draft.body, /signed\.token\.value/);
  assert.match(draft.body, /Activation steps/i);
});
