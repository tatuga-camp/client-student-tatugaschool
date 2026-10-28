import test from "node:test";
import assert from "node:assert/strict";
import { normalizeJoinCode } from "./joinCode";

test("normalizeJoinCode keeps A-Z/0-9, uppercases and caps at 6", () => {
  assert.equal(normalizeJoinCode(" ma-th 21x"), "MATH21");
  assert.equal(normalizeJoinCode("ab"), "AB");
});
