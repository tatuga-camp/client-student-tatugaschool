import test from "node:test";
import assert from "node:assert/strict";
import {
  createHistoryIndex,
  restoreDelta,
  unseenIsBehind,
} from "./historyIndex";
import { decidePop, layerPop, popOutcome } from "./popGuard";

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

// A back press while a modal layer (sheet or viewer) is open: on a detail
// page and on a tab pane alike, it closes the topmost layer and puts the URL
// back with history.go(), never with a push.
const layer = { restoringKey: null as string | null, unseenIsBehind: true };

test("tab pane [SignIn(unindexed), H]: back with the switcher open closes it, one go(1), landing swallowed", () => {
  const back = layerPop({
    ...layer,
    top: "closes",
    poppedKey: "S",
    currentKey: "H",
    delta: null,
  });
  assert.deepEqual(back, { take: true, close: true, go: 1, restoringKey: "H" });
  // The sheet is closed; the go(1) lands back on H.
  const landed = layerPop({
    top: "none",
    restoringKey: back.restoringKey,
    unseenIsBehind: true,
    poppedKey: "H",
    currentKey: "H",
    delta: 0,
  });
  assert.deepEqual(landed, {
    take: true,
    close: false,
    go: null,
    restoringKey: null,
  });
  // Nothing open now: the next back leaves as before.
  const next = layerPop({
    ...layer,
    top: "none",
    poppedKey: "S",
    currentKey: "H",
    delta: null,
  });
  assert.equal(next.take, false);
});

test("no layer open and no restore in flight: the pop passes, as before", () => {
  assert.deepEqual(
    layerPop({
      ...layer,
      top: "none",
      poppedKey: "L",
      currentKey: "D",
      delta: 1,
    }),
    { take: false, close: false, go: null, restoringKey: null },
  );
});

test("tab pane [H, D(forward)]: forward with a sheet open closes it and goes back one", () => {
  const r = layerPop({
    ...layer,
    top: "closes",
    poppedKey: "D",
    currentKey: "H",
    delta: -1,
  });
  assert.deepEqual(r, { take: true, close: true, go: -1, restoringKey: "H" });
});

test("detail [SignIn, L, D] with a viewer open: back closes it with go(1) (P3-25 unchanged)", () => {
  const r = layerPop({
    ...layer,
    top: "closes",
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(r, { take: true, close: true, go: 1, restoringKey: "D" });
});

test("a layer that stays (a dirty note asking) does not block its own landing", () => {
  const r = layerPop({
    top: "closes",
    restoringKey: "D",
    unseenIsBehind: true,
    poppedKey: "D",
    currentKey: "D",
    delta: 0,
  });
  assert.deepEqual(r, {
    take: true,
    close: false,
    go: null,
    restoringKey: null,
  });
});

test("the leave guard on top handles back itself", () => {
  const r = layerPop({
    ...layer,
    top: "ownsBack",
    poppedKey: "L",
    currentKey: "D",
    delta: 1,
  });
  assert.equal(r.take, false);
});

test("a pop that is not the awaited landing clears a stale restore and passes", () => {
  const r = layerPop({
    top: "none",
    restoringKey: "D",
    unseenIsBehind: true,
    poppedKey: "X",
    currentKey: "D",
    delta: 2,
  });
  assert.deepEqual(r, {
    take: false,
    close: false,
    go: null,
    restoringKey: null,
  });
});

// The shell's history index feeding layerPop, as useShellRoute's popInfo does.
const popFrom = (
  h: ReturnType<typeof createHistoryIndex>,
  poppedKey: string,
) => ({
  poppedKey,
  currentKey: h.currentKey(),
  delta: restoreDelta(h.current(), h.peek(poppedKey)),
  unseenIsBehind: unseenIsBehind({
    placed: h.current() !== null,
    load: "navigate",
  }),
});

test("[W, P, H]: back to P and forward again, then a sheet back restores with go(1)", () => {
  const h = createHistoryIndex();
  h.visit("H", "/subject/s1");
  h.visit("P", "/?subject_code=fe5235", true); // back, nothing open: passes
  h.visit("H", "/subject/s1", true); // forward
  // The switcher is open; back moves the browser to P.
  const r = layerPop({ ...layer, top: "closes", ...popFrom(h, "P") });
  assert.deepEqual(r, { take: true, close: true, go: 1, restoringKey: "H" });
});

test("a known entry popped forward restores backwards (go(-1))", () => {
  const h = createHistoryIndex();
  h.visit("H", "/subject/s1");
  h.visit("D", "/subject/s1/assignment/a");
  h.visit("H", "/subject/s1", true); // back to H
  // A sheet on H; forward moves the browser to D.
  const r = layerPop({ ...layer, top: "closes", ...popFrom(h, "D") });
  assert.deepEqual(r, { take: true, close: true, go: -1, restoringKey: "H" });
});

test("an unseen entry, from a place the shell can't place either: the sheet closes, the pop passes", () => {
  // Off an entry the shell only reached by a pop, a pop to another unseen
  // one could be either way: no restore is guessed.
  const h = createHistoryIndex();
  h.visit("H", "/subject/s1");
  h.visit("P", "/?subject_code=fe5235", true);
  const r = layerPop({ ...layer, top: "closes", ...popFrom(h, "W") });
  assert.deepEqual(r, {
    take: false,
    close: true,
    go: null,
    restoringKey: null,
  });
});

test("forward onto an unseen entry after a reload: the sheet closes, the pop passes (no go(1) guess)", () => {
  // Real history [W, P, L, D]: the student opened D, went back to L and
  // reloaded. The shell starts again on L; D, ahead, is unseen.
  const h = createHistoryIndex();
  h.visit("L", "/subject/s1?tab=classwork");
  const r = layerPop({
    ...layer,
    top: "closes",
    ...popFrom(h, "D"),
    unseenIsBehind: unseenIsBehind({ placed: true, load: "reload" }),
  });
  assert.deepEqual(r, {
    take: false,
    close: true,
    go: null,
    restoringKey: null,
  });
});

test("with the browser's own entry indexes, the same forward restores exactly (go(-1))", () => {
  // navigation.currentEntry.index: L is 2, D is 3.
  const h = createHistoryIndex();
  h.visit("L", "/subject/s1?tab=classwork");
  const r = layerPop({
    ...layer,
    top: "closes",
    poppedKey: "D",
    currentKey: "L",
    delta: restoreDelta(2, 3),
    unseenIsBehind: false,
  });
  assert.deepEqual(r, { take: true, close: true, go: -1, restoringKey: "L" });
});
