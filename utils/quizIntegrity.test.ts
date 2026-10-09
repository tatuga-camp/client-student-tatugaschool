import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createIntegrityTracker,
  EventQueue,
  isScreenshotKey,
  isTranslatedDocument,
} from "./quizIntegrity";

function clock() {
  let t = 0;
  return {
    now: () => t,
    iso: () => new Date(t).toISOString(),
    advance: (ms: number) => (t += ms),
  };
}

test("hide → visible emits HIDDEN then VISIBLE with the away duration", () => {
  const c = clock();
  const tracker = createIntegrityTracker(c.now, c.iso);
  assert.deepEqual(
    tracker.onHidden().events.map((e) => e.type),
    ["HIDDEN"],
  );
  c.advance(12_000);
  const back = tracker.onVisible();
  assert.equal(back.events[0].type, "VISIBLE");
  assert.equal(back.events[0].durationMs, 12_000);
  assert.equal(back.awayMs, 12_000);
});

test("desktop tab switch (blur then hidden) is counted once", () => {
  const c = clock();
  const tracker = createIntegrityTracker(c.now, c.iso);
  tracker.onBlur();
  c.advance(50);
  tracker.onHidden();
  c.advance(5_000);
  const visible = tracker.onVisible();
  const focus = tracker.onFocus();
  assert.equal(visible.events[0].durationMs, 5_000);
  assert.deepEqual(focus.events, []); // the pending blur was cancelled by the hide
});

test("blur without hide (second window, snipping tool) emits FOCUS with duration", () => {
  const c = clock();
  const tracker = createIntegrityTracker(c.now, c.iso);
  assert.equal(tracker.onBlur().events[0].type, "BLUR");
  c.advance(3_000);
  const focus = tracker.onFocus();
  assert.equal(focus.events[0].type, "FOCUS");
  assert.equal(focus.events[0].durationMs, 3_000);
});

test("visible without a prior hide emits nothing", () => {
  const c = clock();
  assert.deepEqual(createIntegrityTracker(c.now, c.iso).onVisible().events, []);
});

test("EventQueue keeps the newest 200 and restores failed drains to the front", () => {
  const q = new EventQueue(3);
  q.push([
    { type: "BLUR", clientAt: "1" },
    { type: "BLUR", clientAt: "2" },
    { type: "BLUR", clientAt: "3" },
    { type: "BLUR", clientAt: "4" },
  ]);
  assert.deepEqual(
    q.drain().map((e) => e.clientAt),
    ["2", "3", "4"],
  );
  q.push([{ type: "FOCUS", clientAt: "5" }]);
  q.restore([{ type: "BLUR", clientAt: "x" }]);
  assert.deepEqual(
    q.drain().map((e) => e.clientAt),
    ["x", "5"],
  );
  assert.equal(q.size, 0);
});

test("isScreenshotKey", () => {
  assert.equal(
    isScreenshotKey({
      key: "PrintScreen",
      code: "PrintScreen",
      metaKey: false,
      shiftKey: false,
    }),
    true,
  );
  assert.equal(
    isScreenshotKey({
      key: "4",
      code: "Digit4",
      metaKey: true,
      shiftKey: true,
    }),
    true,
  );
  assert.equal(
    isScreenshotKey({
      key: "$",
      code: "Digit4",
      metaKey: true,
      shiftKey: true,
    }),
    true,
  );
  assert.equal(
    isScreenshotKey({
      key: "4",
      code: "Digit4",
      metaKey: false,
      shiftKey: true,
    }),
    false,
  );
  assert.equal(
    isScreenshotKey({
      key: "a",
      code: "KeyA",
      metaKey: false,
      shiftKey: false,
    }),
    false,
  );
});

test("isTranslatedDocument", () => {
  assert.equal(
    isTranslatedDocument({ className: "translated-ltr", lang: "th" }, "th"),
    true,
  );
  assert.equal(isTranslatedDocument({ className: "", lang: "en" }, "th"), true);
  assert.equal(
    isTranslatedDocument({ className: "dark", lang: "th" }, "th"),
    false,
  );
  assert.equal(isTranslatedDocument({ className: "", lang: "" }, "th"), false);
});
