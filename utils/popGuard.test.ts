import test from "node:test";
import assert from "node:assert/strict";
import { decidePop, popOutcome } from "./popGuard";

const base = {
  restoringKey: null as string | null,
  pending: false,
  needsAnswer: true,
};

test("no guard needed: the pop passes through", () => {
  const r = decidePop({
    ...base,
    needsAnswer: false,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(r.action, { kind: "pass" });
  assert.equal(r.restoringKey, null);
});

test("a first browser back asks (pop-initiated)", () => {
  const r = decidePop({ ...base, poppedKey: "L", currentKey: "D", delta: 1 });
  assert.deepEqual(r.action, { kind: "ask" });
});

test("[A0,L1,D2]: in-app sheet open, Android back = Stay, one restore, then swallowed", () => {
  // The in-app question is pending; the browser moved to L (idx 1).
  const first = decidePop({
    ...base,
    pending: true,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(first.action, { kind: "stay", restore: { go: 1 } });
  assert.equal(first.restoringKey, "D");
  // The restoring go(1) lands on D: swallowed, and the flag clears.
  const landed = decidePop({
    ...base,
    restoringKey: first.restoringKey,
    poppedKey: "D",
    currentKey: "D",
    delta: 0,
  });
  assert.deepEqual(landed.action, { kind: "swallow" });
  assert.equal(landed.restoringKey, null);
});

test("[P,L0,D1] P unindexed: back, sheet, back = Stay via the fallback, flag never set", () => {
  const first = decidePop({
    ...base,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(first.action, { kind: "ask" });
  const second = decidePop({
    ...base,
    pending: true,
    poppedKey: "P",
    currentKey: "D",
    delta: null,
  });
  assert.deepEqual(second.action, { kind: "stay", restore: { push: true } });
  assert.equal(second.restoringKey, null);
  // The next browser back, with the guard no longer needed, is normal.
  const next = decidePop({
    ...base,
    needsAnswer: false,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(next.action, { kind: "pass" });
});

test("a mismatching pop clears a stuck restoring flag instead of being swallowed", () => {
  const r = decidePop({
    ...base,
    restoringKey: "D",
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(r.action, { kind: "ask" });
  assert.equal(r.restoringKey, null);
});

test("a pop to the entry we are already on is swallowed", () => {
  const r = decidePop({ ...base, poppedKey: "D", currentKey: "D", delta: 0 });
  assert.deepEqual(r.action, { kind: "swallow" });
});

test("a pop-initiated sheet then Leave: exactly one replace, no restore", () => {
  assert.equal(
    popOutcome({
      origin: "pop",
      leave: true,
      cancelledByPop: false,
      restored: false,
    }),
    "replace",
  );
});

test("popOutcome for the other answers", () => {
  assert.equal(
    popOutcome({
      origin: "pop",
      leave: false,
      cancelledByPop: false,
      restored: false,
    }),
    "restore",
  );
  // a second pop already restored and cancelled the question
  assert.equal(
    popOutcome({
      origin: "pop",
      leave: false,
      cancelledByPop: true,
      restored: true,
    }),
    "none",
  );
  // submit finished after a second pop cancelled: stay, no replace
  assert.equal(
    popOutcome({
      origin: "pop",
      leave: true,
      cancelledByPop: true,
      restored: true,
    }),
    "none",
  );
  // in-app asks navigate through their own leave()
  assert.equal(
    popOutcome({
      origin: "app",
      leave: true,
      cancelledByPop: false,
      restored: false,
    }),
    "none",
  );
  assert.equal(
    popOutcome({
      origin: "app",
      leave: false,
      cancelledByPop: false,
      restored: false,
    }),
    "none",
  );
});
