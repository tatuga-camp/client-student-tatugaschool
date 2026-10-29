import test from "node:test";
import assert from "node:assert/strict";
import { createHistoryIndex, restoreDelta } from "./historyIndex";
import { decidePop, layerPop, popOutcome, settleRestore } from "./popGuard";

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
const layer = { restoringKey: null as string | null };

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

test("off an entry the shell only reached by a pop, an unseen one still counts as behind (go(1))", () => {
  const h = createHistoryIndex();
  h.visit("H", "/subject/s1");
  h.visit("P", "/?subject_code=fe5235", true);
  const r = layerPop({ ...layer, top: "closes", ...popFrom(h, "W") });
  assert.deepEqual(r, { take: true, close: true, go: 1, restoringKey: "P" });
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
  });
  assert.deepEqual(r, { take: true, close: true, go: -1, restoringKey: "L" });
});

// Ruling P4-20: with no known distance, an unseen entry counts as behind
// (P3-21), for a layer as for the leave guard. A back after a reload is the
// common case: [W, P, H, L, D], reload on D, a sheet open, back to L.
test("P3-21/P3-25: detail back after a reload with a sheet open restores with go(1)", () => {
  const h = createHistoryIndex();
  h.visit("D", "/subject/s1/assignment/a");
  const info = {
    poppedKey: "L",
    currentKey: h.currentKey(),
    delta: restoreDelta(h.current(), h.peek("L")), // null: no browser index
  };
  const r = layerPop({
    ...layer,
    top: "closes",
    ...info,
  });
  assert.deepEqual(r, { take: true, close: true, go: 1, restoringKey: "D" });
  // The leave guard decides the same pop the same way.
  const guard = decidePop({
    restoringKey: null,
    ...info,
    pending: true,
    needsAnswer: true,
    awayBy: 0,
  });
  assert.deepEqual(guard.action, { kind: "stay", go: 1 });
});

// Next skips beforePopState for a pop onto the page's own URL until the page
// has navigated client-side (isSsr), so a restore's landing on a freshly
// loaded page is never seen there. settleRestore runs once Next's handler is
// done with each pop.
test("a restore landing Next never delivered is settled, so a later real back is not swallowed", () => {
  // Reloaded on Home H; a sheet open; back to the unseen P: restore go(1).
  const back = layerPop({
    ...layer,
    top: "closes",
    poppedKey: "P",
    currentKey: "H",
    delta: null,
  });
  assert.equal(back.restoringKey, "H");
  // The go(1) lands on H, but Next skips beforePopState (isSsr): only the
  // settle step sees it.
  const settled = settleRestore(back.restoringKey, "H");
  assert.equal(settled, null);
  // Later: the student opened an assignment D (a push) and presses back to H.
  const later = layerPop({
    ...layer,
    restoringKey: settled,
    top: "none",
    poppedKey: "H",
    currentKey: "D",
    delta: 1,
  });
  assert.deepEqual(later, {
    take: false,
    close: false,
    go: null,
    restoringKey: null,
  });
  // Left stale, the same back would be swallowed: URL on H, screen on D.
  const stale = layerPop({
    ...layer,
    restoringKey: "H",
    top: "none",
    poppedKey: "H",
    currentKey: "D",
    delta: 1,
  });
  assert.equal(stale.take, true);
});

test("settleRestore leaves a delivered landing and a newly started restore alone", () => {
  // Delivered and swallowed: nothing is pending any more.
  assert.equal(settleRestore(null, "H"), null);
  // This pop (to P) started a restore back to H: still on its way.
  assert.equal(settleRestore("H", "P"), "H");
  // A pop with no key (not Next's) changes nothing.
  assert.equal(settleRestore("H", undefined), "H");
});

test("the leave guard's Stay restore settles the same way", () => {
  // Reloaded on a detail D with unsent work; the question is open and the
  // student presses back to the unseen L: Stay, restore go(1).
  const stay = decidePop({
    restoringKey: null,
    poppedKey: "L",
    currentKey: "D",
    pending: true,
    needsAnswer: true,
    delta: null,
    awayBy: 0,
  });
  assert.deepEqual(stay.action, { kind: "stay", go: 1 });
  // Its landing on D is skipped by Next; settled afterwards.
  const settled = settleRestore(stay.restoringKey, "D");
  // The next back (asking again) is not swallowed.
  const next = decidePop({
    restoringKey: settled,
    poppedKey: "L",
    currentKey: "D",
    pending: false,
    needsAnswer: true,
    delta: null,
    awayBy: 0,
  });
  assert.deepEqual(next.action, { kind: "ask" });
});
