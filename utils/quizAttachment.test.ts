import { test } from "node:test";
import assert from "node:assert/strict";
import { formatBytes } from "./quizAttachment";

test("formatBytes", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(850 * 1024), "850 KB");
  assert.equal(formatBytes(12.4 * 1024 * 1024), "12.4 MB");
  assert.equal(formatBytes(200 * 1024 * 1024), "200 MB");
});
