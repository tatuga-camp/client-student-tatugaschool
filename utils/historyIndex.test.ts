import test from "node:test";
import assert from "node:assert/strict";
import { createHistoryIndex } from "./historyIndex";

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
