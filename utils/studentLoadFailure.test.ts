import { test } from "node:test";
import assert from "node:assert/strict";
import { studentLoadFailure } from "./studentLoadFailure";

test("a refused sign-in asks the student to sign in again", () => {
  assert.equal(studentLoadFailure({ statusCode: 401 }), "session");
  assert.equal(studentLoadFailure({ statusCode: 403 }), "session");
  assert.equal(studentLoadFailure(new Error("Token not found")), "session");
  assert.equal(studentLoadFailure(new Error("Session expired")), "session");
});

test("only a 404 means the student is gone", () => {
  assert.equal(studentLoadFailure({ statusCode: 404 }), "not-found");
});

test("everything else is a load problem to retry", () => {
  assert.equal(studentLoadFailure(new Error("Network Error")), "load");
  assert.equal(studentLoadFailure({ statusCode: 500 }), "load");
  assert.equal(studentLoadFailure({ statusCode: 429 }), "load");
  assert.equal(studentLoadFailure(undefined), "load");
  assert.equal(studentLoadFailure(null), "load");
});
