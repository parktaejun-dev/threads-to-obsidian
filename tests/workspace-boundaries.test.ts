import test from "node:test";
import assert from "node:assert/strict";

import { WORKSPACE_INFO as extensionWorkspace } from "@threads/extension";
import { BUNDLED_EXTRACTOR_CONFIG, WORKSPACE_INFO as sharedWorkspace } from "@threads/shared";
import { WORKSPACE_INFO as webClientWorkspace } from "@threads/web-client";
import { WORKSPACE_INFO as webServerWorkspace } from "@threads/web-server";
import { WORKSPACE_INFO as webSchemaWorkspace, buildDefaultDatabase } from "@threads/web-schema";

test("workspace root exports resolve through package names", () => {
  assert.deepEqual(extensionWorkspace, {
    kind: "browser-extension",
    name: "@threads/extension"
  });
  assert.deepEqual(sharedWorkspace, {
    kind: "library",
    name: "@threads/shared"
  });
  assert.deepEqual(webClientWorkspace, {
    kind: "browser-client",
    name: "@threads/web-client"
  });
  assert.deepEqual(webServerWorkspace, {
    kind: "node-server",
    name: "@threads/web-server"
  });
  assert.deepEqual(webSchemaWorkspace, {
    kind: "schema-library",
    name: "@threads/web-schema"
  });
  assert.ok(BUNDLED_EXTRACTOR_CONFIG);
  assert.equal(buildDefaultDatabase("2026-03-17T00:00:00.000Z").paymentMethods.length, 3);
});
