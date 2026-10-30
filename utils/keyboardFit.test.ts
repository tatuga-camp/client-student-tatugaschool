import { test } from "node:test";
import assert from "node:assert/strict";
import { keyboardFit } from "./keyboardFit";

test("no keyboard: nothing to lift, the whole root fits", () => {
  assert.deepEqual(
    keyboardFit({ rootTop: 0, rootBottom: 844, viewTop: 0, viewHeight: 844 }),
    { lift: 0, room: 844 },
  );
});

test("keyboard covers the bottom: lift by the covered part", () => {
  assert.deepEqual(
    keyboardFit({ rootTop: 0, rootBottom: 844, viewTop: 0, viewHeight: 500 }),
    { lift: 344, room: 500 },
  );
});

test("iOS pans the visible area down: only what is visible counts", () => {
  // Visible 120..620 of a 0..844 screen.
  assert.deepEqual(
    keyboardFit({ rootTop: 0, rootBottom: 844, viewTop: 120, viewHeight: 500 }),
    { lift: 224, room: 500 },
  );
});

test("a framed phone above the keyboard needs no lift", () => {
  assert.deepEqual(
    keyboardFit({ rootTop: 24, rootBottom: 600, viewTop: 0, viewHeight: 700 }),
    { lift: 0, room: 576 },
  );
});

test("fractional pixels round so the sheet doesn't jitter", () => {
  assert.deepEqual(
    keyboardFit({ rootTop: 0, rootBottom: 844, viewTop: 0.4, viewHeight: 499.7 }),
    { lift: 344, room: 500 },
  );
});

test("an off-screen root never gives negative sizes", () => {
  assert.deepEqual(
    keyboardFit({ rootTop: 900, rootBottom: 1000, viewTop: 0, viewHeight: 500 }),
    { lift: 500, room: 0 },
  );
});
