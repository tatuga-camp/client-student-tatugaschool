import test from "node:test";
import assert from "node:assert/strict";
import { isClosed } from "./wordCloud";

test("a CLOSED word cloud is closed", () => {
  assert.equal(isClosed({ status: "CLOSED" }), true);
});

test("an OPEN word cloud in an archived subject is closed", () => {
  assert.equal(isClosed({ status: "OPEN", subjectIsAchieved: true }), true);
});

test("a missing subjectIsAchieved means active", () => {
  assert.equal(isClosed({ status: "OPEN" }), false);
  assert.equal(isClosed({ status: "OPEN", subjectIsAchieved: false }), false);
});
