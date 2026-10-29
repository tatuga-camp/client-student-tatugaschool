import { test } from "node:test";
import assert from "node:assert/strict";
import { CLICK_SLOP, dropsClick, movePress, startPress } from "./clickSlop";

const mouse = startPress("mouse", 100, 100);

test("a mouse press that moved past the slop on either axis is a drag", () => {
  assert.equal(dropsClick(movePress(mouse, 100 + CLICK_SLOP + 1, 100), 1), true);
  assert.equal(dropsClick(movePress(mouse, 100, 100 - CLICK_SLOP - 1), 1), true);
  // Out and back again still moved.
  const back = movePress(movePress(mouse, 160, 100), 100, 100);
  assert.equal(dropsClick(back, 1), true);
});

test("jitter within the slop still clicks", () => {
  const jitter = movePress(movePress(mouse, 106, 97), 100 + CLICK_SLOP, 100);
  assert.equal(dropsClick(jitter, 1), false);
  assert.equal(dropsClick(mouse, 1), false);
});

test("keyboard clicks, touch and pen are never dropped", () => {
  const moved = movePress(mouse, 300, 300);
  assert.equal(dropsClick(moved, 0), false);
  for (const type of ["touch", "pen"]) {
    assert.equal(dropsClick(movePress(startPress(type, 0, 0), 300, 0), 1), false);
  }
  assert.equal(dropsClick(null, 1), false);
});
