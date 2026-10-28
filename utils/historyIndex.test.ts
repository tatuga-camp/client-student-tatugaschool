import test from "node:test";
import assert from "node:assert/strict";
import { createHistoryIndex, restoreDelta } from "./historyIndex";

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
