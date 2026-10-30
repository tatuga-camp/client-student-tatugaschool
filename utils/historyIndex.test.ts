import test from "node:test";
import assert from "node:assert/strict";
import { createHistoryIndex, restoreDelta } from "./historyIndex";
import { classworkBack } from "./tabs";

test("the first entry seen is 0 and each new entry follows the current one", () => {
  const history = createHistoryIndex();
  assert.equal(history.visit("a"), 0);
  assert.equal(history.visit("b"), 1);
  assert.equal(history.visit("c"), 2);
});

test("a replace keeps the entry's key, so its index", () => {
  const history = createHistoryIndex();
  history.visit("a");
  assert.equal(history.visit("b"), 1);
  assert.equal(history.visit("b"), 1);
});

test("going back and forward returns the entries' own indexes", () => {
  const history = createHistoryIndex();
  history.visit("a");
  history.visit("b");
  history.visit("c");
  assert.equal(history.visit("b"), 1);
  assert.equal(history.visit("a"), 0);
  assert.equal(history.visit("b"), 1);
  assert.equal(history.visit("c"), 2);
});

test("a push after going back follows the entry it was pushed from", () => {
  const history = createHistoryIndex();
  history.visit("a");
  history.visit("b");
  history.visit("c");
  history.visit("b");
  assert.equal(history.visit("d"), 2);
  assert.equal(history.visit("e"), 3);
});

test("an entry without a key counts as 0 and does not move the position", () => {
  const history = createHistoryIndex();
  history.visit("a");
  history.visit("b");
  assert.equal(history.visit(null), 0);
  assert.equal(history.visit(undefined), 0);
  assert.equal(history.visit("c"), 2);
});

test("restoreDelta is how far history.go must move to get back", () => {
  assert.equal(restoreDelta(2, 1), 1);
  assert.equal(restoreDelta(2, 0), 2);
  assert.equal(restoreDelta(1, 3), -2);
  assert.equal(restoreDelta(2, 2), 0);
  assert.equal(restoreDelta(2, undefined), null);
});

test("peek and current read the index without moving it", () => {
  const h = createHistoryIndex();
  h.visit("a");
  h.visit("b");
  assert.equal(h.current(), 1);
  assert.equal(h.peek("a"), 0);
  assert.equal(h.peek("zzz"), undefined);
  assert.equal(h.current(), 1);
});

test("previousPath is the latest path of the entry behind the current one", () => {
  const h = createHistoryIndex();
  h.visit("a", "/subject/s1");
  // A tab change replaces the entry: same key, new path.
  h.visit("a", "/subject/s1?tab=classwork");
  h.visit("b", "/subject/s1/assignment/x");
  assert.equal(h.previousPath(), "/subject/s1?tab=classwork");
  // A read without a path (backTarget's) keeps what is known.
  h.visit("b");
  assert.equal(h.previousPath(), "/subject/s1?tab=classwork");
});

test("previousPath: nothing behind the first entry; a push after going back follows its entry", () => {
  const h = createHistoryIndex();
  h.visit("d", "/subject/s1/assignment/x");
  assert.equal(h.previousPath(), undefined);
  h.visit("e", "/subject/s1/assignment/y");
  h.visit("d");
  // Back on d, then a new push: the entry behind it is still d.
  h.visit("f", "/subject/s1/assignment/z");
  assert.equal(h.previousPath(), "/subject/s1/assignment/x");
});

// Entries first reached by a back/forward (popped = true) are not given a
// place: the shell can't tell from a pop where they are.
test("an entry first reached by a pop gets no index, and the shell's place is unknown there", () => {
  const h = createHistoryIndex();
  h.visit("H", "/subject/s1");
  // Back to the pick-name page, which the shell never saw being pushed.
  assert.equal(h.visit("P", "/?subject_code=fe5235", true), 0);
  assert.equal(h.peek("P"), undefined);
  assert.equal(h.current(), null);
  assert.equal(h.currentKey(), "P");
  assert.equal(h.previousPath(), undefined);
  // Forward again: H is known.
  assert.equal(h.visit("H", "/subject/s1", true), 0);
  assert.equal(h.current(), 0);
  assert.equal(restoreDelta(h.current(), h.peek("P")), null);
});

test("reload on D2, then back twice: the entry behind D1 is unknown, so Back to classwork replaces", () => {
  // Real history [H, D1, L, D2]; the shell first sees D2.
  const h = createHistoryIndex();
  h.visit("D2", "/subject/s1/assignment/b");
  h.visit("L", "/subject/s1?tab=classwork", true);
  h.visit("D1", "/subject/s1/assignment/a", true);
  assert.equal(h.previousPath(), undefined);
  assert.equal(
    classworkBack({ previousPath: h.previousPath(), subjectId: "s1" }),
    "replace",
  );
});

test("a push from an entry reached by a pop starts the numbering again", () => {
  // [W, P, H]: back to P (pop), then sign in again: P pushes H2, which drops
  // H and everything after it. Nothing in-app is behind H2.
  const h = createHistoryIndex();
  h.visit("H", "/subject/s1");
  h.visit("D", "/subject/s1/assignment/a");
  h.visit("H", "/subject/s1", true);
  h.visit("P", "/?subject_code=fe5235", true);
  assert.equal(h.visit("H2", "/subject/s1"), 0);
  assert.equal(h.previousPath(), undefined);
  assert.equal(h.visit("D2", "/subject/s1/assignment/b"), 1);
  assert.equal(h.previousPath(), "/subject/s1");
});

test("restoreDelta is unknown while the shell's own place is unknown", () => {
  assert.equal(restoreDelta(null, 1), null);
});
