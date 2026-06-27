import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSubjectManifest, buildFallbackManifest } from "./pwaManifest";

test("subject manifest bakes code into id and start_url, title into name", () => {
  const m = buildSubjectManifest({ code: "fe765f", title: "Math 101" });
  assert.equal(m.start_url, "/?subject_code=fe765f");
  assert.equal(m.id, "/?subject_code=fe765f");
  assert.equal(m.name, "Math 101");
  assert.equal(m.short_name, "Math 101");
  assert.equal(m.scope, "/");
  assert.equal(m.display, "standalone");
  assert.equal(m.theme_color, "#2C7CD1");
  assert.equal(m.background_color, "#F7F8FA");
  assert.equal(m.icons.length, 3);
  assert.ok(m.icons.some((i) => i.purpose === "maskable"));
});

test("subject manifest url-encodes the code", () => {
  const m = buildSubjectManifest({ code: "a b/c", title: "X" });
  assert.equal(m.start_url, "/?subject_code=a%20b%2Fc");
  assert.equal(m.id, "/?subject_code=a%20b%2Fc");
});

test("fallback manifest points at /welcome with brand name", () => {
  const m = buildFallbackManifest();
  assert.equal(m.start_url, "/welcome");
  assert.equal(m.id, "/welcome");
  assert.equal(m.name, "Tatuga School");
  assert.equal(m.icons.length, 3);
});
