import test from "node:test";
import assert from "node:assert/strict";
import {
  sheetDragOutcome,
  parseTab,
  tabIndex,
  swipeOutcome,
  edgeBackOutcome,
  backTarget,
} from "./tabs";

test("sheetDragOutcome closes past 30% or on a fast flick down", () => {
  assert.equal(sheetDragOutcome({ dy: 200, vy: 0.1, height: 600 }), "close");
  assert.equal(sheetDragOutcome({ dy: 100, vy: 0.1, height: 600 }), "stay");
  assert.equal(sheetDragOutcome({ dy: 40, vy: 0.8, height: 600 }), "close");
  assert.equal(sheetDragOutcome({ dy: -50, vy: 0.9, height: 600 }), "stay");
});

test("parseTab accepts a known tab and falls back to home", () => {
  assert.equal(parseTab("me"), "me");
  assert.equal(parseTab(undefined), "home");
  assert.equal(parseTab(["me"]), "home");
  assert.equal(parseTab("x"), "home");
});

test("tabIndex follows the tab order", () => {
  assert.equal(tabIndex("classwork"), 0);
  assert.equal(tabIndex("home"), 2);
  assert.equal(tabIndex("me"), 4);
});

test("swipeOutcome commits past 25% width or on a fast flick", () => {
  assert.equal(swipeOutcome({ dx: -120, vx: 0.1, width: 390 }), 1);
  assert.equal(swipeOutcome({ dx: 90, vx: 0.1, width: 390 }), 0);
  assert.equal(swipeOutcome({ dx: 30, vx: 0.8, width: 390 }), -1);
  assert.equal(swipeOutcome({ dx: 10, vx: 0.9, width: 390 }), 0);
});

test("edgeBackOutcome only starts from the left edge", () => {
  assert.equal(edgeBackOutcome({ startX: 10, dx: 140, vx: 0, width: 390 }), "back");
  assert.equal(edgeBackOutcome({ startX: 60, dx: 140, vx: 0, width: 390 }), "stay");
  assert.equal(edgeBackOutcome({ startX: 10, dx: 30, vx: 0.8, width: 390 }), "back");
  assert.equal(edgeBackOutcome({ startX: 10, dx: 50, vx: 0.1, width: 390 }), "stay");
});

test("backTarget uses history when there is some, else the subject page", () => {
  assert.deepEqual(backTarget({ historyIdx: 0, subjectId: "s1" }), {
    kind: "replace",
    url: "/subject/s1",
  });
  assert.deepEqual(backTarget({ historyIdx: 3, subjectId: "s1" }), { kind: "history" });
});
