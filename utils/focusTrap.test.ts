import test from "node:test";
import assert from "node:assert/strict";
import { tabWrapTarget } from "./focusTrap";

test("Tab on the last item wraps to the first", () => {
  assert.equal(tabWrapTarget({ count: 3, index: 2, shift: false }), 0);
});

test("Shift+Tab on the first item wraps to the last", () => {
  assert.equal(tabWrapTarget({ count: 3, index: 0, shift: true }), 2);
});

test("in the middle the browser moves focus itself", () => {
  assert.equal(tabWrapTarget({ count: 3, index: 1, shift: false }), null);
  assert.equal(tabWrapTarget({ count: 3, index: 1, shift: true }), null);
  assert.equal(tabWrapTarget({ count: 3, index: 0, shift: false }), null);
  assert.equal(tabWrapTarget({ count: 3, index: 2, shift: true }), null);
});

test("from the panel itself (just opened) or the page body, focus goes in", () => {
  assert.equal(tabWrapTarget({ count: 3, index: -1, shift: false }), 0);
  assert.equal(tabWrapTarget({ count: 3, index: -1, shift: true }), 2);
});

test("nothing focusable inside: focus stays on the panel", () => {
  assert.equal(tabWrapTarget({ count: 0, index: -1, shift: false }), "panel");
  assert.equal(tabWrapTarget({ count: 0, index: -1, shift: true }), "panel");
});

test("one item: Tab and Shift+Tab both stay on it", () => {
  assert.equal(tabWrapTarget({ count: 1, index: 0, shift: false }), 0);
  assert.equal(tabWrapTarget({ count: 1, index: 0, shift: true }), 0);
});
