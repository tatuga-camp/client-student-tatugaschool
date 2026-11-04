import { test } from "node:test";
import assert from "node:assert/strict";
import {
  describeJoinFailure,
  lookupErrorFromAxios,
  stampOf,
} from "./joinLookupError";

const at = new Date(2026, 10, 4, 9, 5);

test("lookupErrorFromAxios: a JSON error body keeps status, message and code", () => {
  assert.deepEqual(
    lookupErrorFromAxios({
      response: {
        status: 403,
        data: { statusCode: 403, message: "archived", code: "SUBJECT_ARCHIVED" },
      },
    }),
    { statusCode: 403, message: "archived", code: "SUBJECT_ARCHIVED", reason: "http" },
  );
});

test("lookupErrorFromAxios: an HTML body (challenge page) keeps the status", () => {
  assert.deepEqual(
    lookupErrorFromAxios({
      response: { status: 403, statusText: "Forbidden", data: "<html>…" },
    }),
    { statusCode: 403, message: "non-JSON response (Forbidden)", reason: "http" },
  );
});

test("lookupErrorFromAxios: no response is network / timeout by axios code", () => {
  assert.deepEqual(lookupErrorFromAxios({ code: "ERR_NETWORK", message: "Network Error" }), {
    statusCode: null,
    message: "ERR_NETWORK",
    reason: "network",
  });
  assert.equal(lookupErrorFromAxios({ code: "ECONNABORTED" }).reason, "timeout");
  assert.deepEqual(lookupErrorFromAxios(undefined), {
    statusCode: null,
    message: null,
    reason: "unknown",
  });
});

test("describeJoinFailure: a 404 or 400 is not found, with code and time", () => {
  assert.deepEqual(
    describeJoinFailure({ statusCode: 404, message: "Subject not found" }, "a1b2c3", at),
    { kind: "not-found", detail: "HTTP 404 · code A1B2C3 · 09:05 04/11" },
  );
  assert.equal(describeJoinFailure({ statusCode: 400 }, "a1b2c3", at).kind, "not-found");
});

test("describeJoinFailure: archived is its own kind", () => {
  const f = describeJoinFailure(
    { statusCode: 403, code: "SUBJECT_ARCHIVED", message: "archived" },
    "a1b2c3",
    at,
  );
  assert.equal(f.kind, "archived");
  assert.equal(f.detail, "HTTP 403 · code A1B2C3 · 09:05 04/11");
});

test("describeJoinFailure: anything else is a failed request that names what came back", () => {
  assert.deepEqual(
    describeJoinFailure(
      { statusCode: 429, message: "Too many requests. Please wait a moment and try again." },
      "a1b2c3",
      at,
    ),
    {
      kind: "failed",
      detail:
        "HTTP 429 · Too many requests. Please wait a moment and try again. · code A1B2C3 · 09:05 04/11",
    },
  );
  // A long server message is cut so the line stays one screenshot wide.
  assert.equal(
    describeJoinFailure({ statusCode: 500, message: "x".repeat(80) }, "a1b2c3", at).detail,
    `HTTP 500 · ${"x".repeat(59)}… · code A1B2C3 · 09:05 04/11`,
  );
  assert.deepEqual(
    describeJoinFailure({ statusCode: null, message: "ERR_NETWORK", reason: "network" }, "a1b2c3", at),
    { kind: "failed", detail: "no response · ERR_NETWORK · code A1B2C3 · 09:05 04/11" },
  );
  assert.equal(
    describeJoinFailure({ statusCode: null, reason: "timeout" }, "a1b2c3", at).detail,
    "timeout · code A1B2C3 · 09:05 04/11",
  );
  // A 403 without the archived code is not "archived".
  assert.equal(describeJoinFailure({ statusCode: 403 }, "a1b2c3", at).kind, "failed");
});

test("stampOf pads hours, minutes, day and month", () => {
  assert.equal(stampOf(new Date(2026, 0, 2, 3, 4)), "03:04 02/01");
});
