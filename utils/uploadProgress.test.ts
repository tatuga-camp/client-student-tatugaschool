import { test } from "node:test";
import assert from "node:assert/strict";
import { overallUploadPercent } from "./uploadProgress";

test("returns 0 at the start of a batch", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 0, currentLoaded: 0, totalBytes: 100 }),
    0,
  );
});

test("weights the in-flight file against the whole batch", () => {
  // 50 bytes done from earlier files + 25 of the current file, out of 100 total
  assert.equal(
    overallUploadPercent({ uploadedBytes: 50, currentLoaded: 25, totalBytes: 100 }),
    75,
  );
});

test("reaches 100 when the last file finishes", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 60, currentLoaded: 40, totalBytes: 100 }),
    100,
  );
});

test("clamps overshoot at 100", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 100, currentLoaded: 50, totalBytes: 100 }),
    100,
  );
});

test("returns 0 for a zero-byte batch instead of dividing by zero", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: 0, currentLoaded: 0, totalBytes: 0 }),
    0,
  );
});

test("clamps negative inputs to 0", () => {
  assert.equal(
    overallUploadPercent({ uploadedBytes: -10, currentLoaded: 0, totalBytes: 100 }),
    0,
  );
});
