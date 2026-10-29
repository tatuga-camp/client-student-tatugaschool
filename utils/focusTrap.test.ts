import test from "node:test";
import assert from "node:assert/strict";
import { focusPlace, tabWrapTarget } from "./focusTrap";

// `at`: the focused item's index, or between two items (k - 0.5: k items
// come before it) for a focused element the Tab order skips; null when focus
// is not in the panel.

test("Tab on the last item wraps to the first", () => {
  assert.equal(tabWrapTarget({ count: 3, at: 2, shift: false }), 0);
});

test("Shift+Tab on the first item wraps to the last", () => {
  assert.equal(tabWrapTarget({ count: 3, at: 0, shift: true }), 2);
});

test("between listed items the browser moves focus itself", () => {
  assert.equal(tabWrapTarget({ count: 3, at: 1, shift: false }), null);
  assert.equal(tabWrapTarget({ count: 3, at: 1, shift: true }), null);
  assert.equal(tabWrapTarget({ count: 3, at: 0, shift: false }), null);
  assert.equal(tabWrapTarget({ count: 3, at: 2, shift: true }), null);
});

test("from the panel itself (just opened, before every item) focus goes in", () => {
  assert.equal(tabWrapTarget({ count: 3, at: -0.5, shift: false }), 0);
  assert.equal(tabWrapTarget({ count: 3, at: -0.5, shift: true }), 2);
});

test("from outside the panel (the page, the body) focus goes in", () => {
  assert.equal(tabWrapTarget({ count: 3, at: null, shift: false }), 0);
  assert.equal(tabWrapTarget({ count: 3, at: null, shift: true }), 2);
});

test("from a skipped element mid-sheet, Tab goes to the next item, not the first", () => {
  // One item before it, two after.
  assert.equal(tabWrapTarget({ count: 3, at: 0.5, shift: false }), 1);
  assert.equal(tabWrapTarget({ count: 3, at: 0.5, shift: true }), 0);
  // After the last item: Tab wraps, Shift+Tab goes to the last.
  assert.equal(tabWrapTarget({ count: 3, at: 2.5, shift: false }), 0);
  assert.equal(tabWrapTarget({ count: 3, at: 2.5, shift: true }), 2);
});

test("nothing focusable inside: focus stays on the panel", () => {
  assert.equal(tabWrapTarget({ count: 0, at: null, shift: false }), "panel");
  assert.equal(tabWrapTarget({ count: 0, at: -0.5, shift: true }), "panel");
});

test("one item: Tab and Shift+Tab both stay on it", () => {
  assert.equal(tabWrapTarget({ count: 1, at: 0, shift: false }), 0);
  assert.equal(tabWrapTarget({ count: 1, at: 0, shift: true }), 0);
});

// Node has no DOM: stand-ins answer `closest` for the layer they sit in, and
// the panel "contains" only what it was given.
const inLayer = (selector: string | null) => ({
  closest: (s: string) =>
    selector !== null && s.split(",").some((part) => part.trim() === selector)
      ? {}
      : null,
});
const panelOf = (...inside: unknown[]) => ({
  contains: (node: unknown) => inside.includes(node),
});

test("focusPlace: inside the panel", () => {
  const button = inLayer(null);
  assert.equal(focusPlace(button, panelOf(button)), "panel");
});

test("focusPlace: a known layer above the sheet keeps its focus", () => {
  const panel = panelOf();
  assert.equal(focusPlace(inLayer(".swal2-container"), panel), "layer");
  assert.equal(focusPlace(inLayer(".tox-tinymce-aux"), panel), "layer");
  assert.equal(focusPlace(inLayer(".tox-dialog"), panel), "layer");
  // Another modal dialog (a viewer, the turned-in celebration, a sheet
  // opening on top before it registers).
  assert.equal(focusPlace(inLayer('[aria-modal="true"]'), panel), "layer");
});

test("focusPlace: anywhere else is behind the sheet and is pulled back in", () => {
  const panel = panelOf();
  // The page, its header or tab bar, the desktop stage, the body.
  assert.equal(focusPlace(inLayer(null), panel), "behind");
  assert.equal(focusPlace(null, panel), "behind");
});
