import { test } from "node:test";
import assert from "node:assert/strict";
import { dialogMotion, sheetMode } from "./sheetMode";

test("sheetMode: phones keep the bottom sheet", () => {
  assert.equal(sheetMode({ desktop: false, isPeek: false }), "bottom");
  assert.equal(sheetMode({ desktop: false, isPeek: true }), "bottom");
});

test("sheetMode: a desktop peek stays a bottom sheet, width-limited", () => {
  assert.equal(sheetMode({ desktop: true, isPeek: true }), "bottom-narrow");
});

test("sheetMode: other desktop sheets become centred dialogs", () => {
  assert.equal(sheetMode({ desktop: true, isPeek: false }), "dialog");
});

test("dialogMotion: fully shown at progress 0", () => {
  assert.deepEqual(dialogMotion(0), { opacity: 1, scale: 1 });
});

test("dialogMotion: gone at progress 1", () => {
  assert.deepEqual(dialogMotion(1), { opacity: 0, scale: 0.96 });
});

test("dialogMotion: linear in between", () => {
  assert.equal(dialogMotion(0.5).opacity, 0.5);
});

test("dialogMotion: clamps past the ends", () => {
  assert.deepEqual(dialogMotion(2), dialogMotion(1));
  assert.deepEqual(dialogMotion(-1), dialogMotion(0));
});
