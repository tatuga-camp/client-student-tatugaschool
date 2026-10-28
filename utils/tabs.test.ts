import test from "node:test";
import assert from "node:assert/strict";
import {
  sheetDragOutcome,
  progressPanes,
  parseTab,
  tabIndex,
  swipeOutcome,
  edgeBackOutcome,
  backTarget,
  canStartShellSwipe,
  isEditableTarget,
} from "./tabs";

// Node has no DOM: element stand-ins answer `closest` for the selectors the
// rules ask about, and a container "contains" only the nodes it was given.
function el(opts: { noSwipe?: boolean; field?: boolean; editable?: boolean } = {}) {
  return {
    isContentEditable: !!opts.editable,
    closest: (selector: string) => {
      if (selector.includes("data-no-swipe")) return opts.noSwipe ? {} : null;
      if (selector.includes("input")) return opts.field ? {} : null;
      return null;
    },
  };
}
const box = (...inside: unknown[]) => ({
  contains: (node: unknown) => inside.includes(node),
});

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

test("canStartShellSwipe: only from the shell's own DOM, never a no-swipe area or a field", () => {
  const plain = el();
  assert.equal(canStartShellSwipe(box(plain), plain), true);
  // React bubbles a portal's pointerdown (sheet, viewer, toast) to the shell.
  assert.equal(canStartShellSwipe(box(), plain), false);
  const noSwipe = el({ noSwipe: true });
  assert.equal(canStartShellSwipe(box(noSwipe), noSwipe), false);
  // A mouse drag in a text box selects text; it must not swipe.
  const field = el({ field: true });
  assert.equal(canStartShellSwipe(box(field), field), false);
  const rich = el({ editable: true });
  assert.equal(canStartShellSwipe(box(rich), rich), false);
  assert.equal(canStartShellSwipe(null, plain), false);
  assert.equal(canStartShellSwipe(box(null), null), false);
});

test("isEditableTarget: fields and contenteditable, not plain elements", () => {
  assert.equal(isEditableTarget(el({ field: true })), true);
  assert.equal(isEditableTarget(el({ editable: true })), true);
  assert.equal(isEditableTarget(el()), false);
  assert.equal(isEditableTarget(null), false);
});

test("progressPanes follows the teacher's visibility settings", () => {
  assert.deepEqual(progressPanes({ allowStudentViewOverallScore: true, allowStudentViewAttendance: true }), ["grades", "attendance"]);
  assert.deepEqual(progressPanes({ allowStudentViewOverallScore: true, allowStudentViewAttendance: false }), ["grades"]);
  assert.deepEqual(progressPanes({ allowStudentViewOverallScore: false, allowStudentViewAttendance: true }), ["attendance"]);
  assert.deepEqual(progressPanes({ allowStudentViewOverallScore: false, allowStudentViewAttendance: false }), []);
});
