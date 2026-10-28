import test from "node:test";
import assert from "node:assert/strict";
import { sheetDragOutcome } from "./tabs";

test("sheetDragOutcome closes past 30% or on a fast flick down", () => {
  assert.equal(sheetDragOutcome({ dy: 200, vy: 0.1, height: 600 }), "close");
  assert.equal(sheetDragOutcome({ dy: 100, vy: 0.1, height: 600 }), "stay");
  assert.equal(sheetDragOutcome({ dy: 40, vy: 0.8, height: 600 }), "close");
  assert.equal(sheetDragOutcome({ dy: -50, vy: 0.9, height: 600 }), "stay");
});
