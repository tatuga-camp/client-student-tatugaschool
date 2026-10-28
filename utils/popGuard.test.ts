import test from "node:test";
import assert from "node:assert/strict";
import { decidePop, popOutcome } from "./popGuard";

const base = {
  awayBy: 0,
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

test("[A0,L1,D2]: in-app sheet open, Android back = Stay, one go(1), then swallowed", () => {
  // The in-app question is pending; the browser moved to L (idx 1).
  const first = decidePop({
    ...base,
    pending: true,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(first.action, { kind: "stay", go: 1 });
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

test("[SignIn(unindexed),L0,D1]: back, sheet, back = Stay with go(2); next back asks again", () => {
  const first = decidePop({
    ...base,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(first.action, { kind: "ask" });
  assert.equal(first.awayBy, 1);
  // Second back lands on the sign-in entry the shell never saw.
  const second = decidePop({
    ...base,
    awayBy: first.awayBy,
    pending: true,
    poppedKey: "SignIn",
    currentKey: "D",
    delta: null,
  });
  // Two steps from SignIn to D; never a push.
  assert.deepEqual(second.action, { kind: "stay", go: 2 });
  assert.equal(second.restoringKey, "D");
  assert.equal(second.awayBy, 0);
  const landed = decidePop({
    ...base,
    restoringKey: second.restoringKey,
    poppedKey: "D",
    currentKey: "D",
    delta: 0,
  });
  assert.deepEqual(landed.action, { kind: "swallow" });
  // The guard is still armed: the next back asks again.
  const next = decidePop({
    ...base,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(next.action, { kind: "ask" });
});

test("[SignIn,D]: a first back onto an unindexed entry asks, and Stay steps forward once", () => {
  const first = decidePop({
    ...base,
    poppedKey: "SignIn",
    currentKey: "D",
    delta: null,
  });
  assert.deepEqual(first.action, { kind: "ask" });
  assert.equal(first.awayBy, 1);
  assert.equal(
    popOutcome({
      origin: "pop",
      leave: false,
      cancelledByPop: false,
      restored: false,
    }),
    "restore",
  );
});

test("a browser forward onto the page whose sheet is open closes it as Stay, nothing to restore", () => {
  const first = decidePop({
    ...base,
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(first.action, { kind: "ask" });
  const forward = decidePop({
    ...base,
    awayBy: first.awayBy,
    pending: true,
    poppedKey: "D",
    currentKey: "D",
    delta: 0,
  });
  assert.deepEqual(forward.action, { kind: "stay", go: null });
  assert.equal(forward.restoringKey, null);
  assert.equal(forward.awayBy, 0);
  // Armed again: the next back asks.
  assert.deepEqual(
    decidePop({ ...base, poppedKey: "L", currentKey: "D", delta: 1 }).action,
    { kind: "ask" },
  );
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

test("a pop to the entry we are already on, with no question open, is swallowed", () => {
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
