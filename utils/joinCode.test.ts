import test from "node:test";
import assert from "node:assert/strict";
import { joinCodeForLookup, normalizeJoinCode } from "./joinCode";

test("normalizeJoinCode keeps A-Z/0-9, uppercases and caps at 6", () => {
  assert.equal(normalizeJoinCode(" ma-th 21x"), "MATH21");
  assert.equal(normalizeJoinCode("ab"), "AB");
});

test("joinCodeForLookup lowercases the code the server stores in hex", () => {
  assert.equal(joinCodeForLookup("FE5235"), "fe5235");
});
