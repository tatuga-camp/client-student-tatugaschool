import { test } from "node:test";
import assert from "node:assert/strict";
import { AutosaveState, autosaveBackoffMs, createAnswerAutosaver } from "./quizAutosave";

/** Manual clock: timers only fire when the test advances time. */
function fakeClock() {
  let t = 0;
  let seq = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  return {
    now: () => t,
    setTimer: (fn: () => void, ms: number) => {
      const id = ++seq;
      timers.set(id, { at: t + ms, fn });
      return id;
    },
    clearTimer: (h: unknown) => void timers.delete(h as number),
    pendingTimers: () => timers.size,
    async advance(ms: number) {
      const end = t + ms;
      for (;;) {
        await settle();
        const next = [...timers.entries()].filter(([, v]) => v.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        t = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
      }
      t = end;
      await settle();
    },
  };
}

const settle = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};

function deferred() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup() {
  const clock = fakeClock();
  const calls: { q: string; a: string; d: ReturnType<typeof deferred> }[] = [];
  const states: AutosaveState[] = [];
  const closed: string[] = [];
  const saver = createAnswerAutosaver<string>({
    send: (q, a) => {
      const d = deferred();
      calls.push({ q, a, d });
      return d.promise;
    },
    onState: (s) => states.push(s),
    onClosed: (r) => closed.push(r),
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    now: clock.now,
  });
  const last = () => states[states.length - 1];
  return { clock, calls, states, closed, saver, last };
}

test("backoff doubles and caps at 30s", () => {
  assert.equal(autosaveBackoffMs(1), 1000);
  assert.equal(autosaveBackoffMs(2), 2000);
  assert.equal(autosaveBackoffMs(10), 30_000);
});

test("debounces rapid changes into one save of the latest answer", async () => {
  const { clock, calls, saver, last } = setup();
  saver.queue("q1", "A");
  await clock.advance(300);
  saver.queue("q1", "B");
  await clock.advance(599);
  assert.equal(calls.length, 0);
  await clock.advance(1);
  assert.deepEqual(calls.map((c) => c.a), ["B"]);
  calls[0].d.resolve();
  await settle();
  assert.equal(last(), "saved");
});

test("a newer answer is never sent while an older save for the same question is in flight", async () => {
  const { clock, calls, saver, last } = setup();
  saver.queue("q1", "A");
  await clock.advance(600);
  assert.equal(calls.length, 1); // A stalls
  saver.queue("q1", "B");
  await clock.advance(600);
  assert.equal(calls.length, 1, "B must wait for A to settle");
  calls[0].d.resolve(); // A lands
  await settle();
  assert.deepEqual(calls.map((c) => c.a), ["A", "B"]);
  assert.equal(last(), "saving");
  calls[1].d.resolve();
  await settle();
  assert.equal(last(), "saved");
});

test("flush waits for an in-flight save and then sends the latest answer", async () => {
  const { clock, calls, saver } = setup();
  saver.queue("q1", "A");
  await clock.advance(600);
  saver.queue("q1", "B");
  const result = saver.flush();
  await settle();
  assert.equal(calls.length, 1);
  calls[0].d.resolve();
  await settle();
  assert.deepEqual(calls.map((c) => c.a), ["A", "B"]);
  calls[1].d.resolve();
  assert.equal(await result, true);
});

test("flush resolves false at its deadline even when a request stalls", async () => {
  const { clock, calls, saver } = setup();
  saver.queue("q1", "A");
  const result = saver.flush(5000);
  await settle();
  assert.equal(calls.length, 1);
  await clock.advance(5000);
  assert.equal(await result, false);
});

test("state stays 'error' while another question saves fine", async () => {
  const { clock, calls, saver, last } = setup();
  saver.queue("q1", "A");
  await clock.advance(600);
  calls[0].d.reject(undefined); // network failure
  await settle();
  assert.equal(last(), "error");
  saver.queue("q2", "X");
  assert.equal(last(), "error");
  await clock.advance(600);
  const q2 = calls.find((c) => c.q === "q2")!;
  q2.d.resolve();
  await settle();
  assert.equal(last(), "error");
  // q1's retry (1s backoff) succeeds -> saved
  await clock.advance(1000);
  const retry = calls.filter((c) => c.q === "q1")[1];
  assert.ok(retry);
  retry.d.resolve();
  await settle();
  assert.equal(last(), "saved");
});

test("failed saves retry with backoff", async () => {
  const { clock, calls, saver } = setup();
  saver.queue("q1", "A");
  await clock.advance(600);
  calls[0].d.reject(undefined);
  await clock.advance(999);
  assert.equal(calls.length, 1);
  await clock.advance(1);
  assert.equal(calls.length, 2);
  calls[1].d.reject(undefined);
  await clock.advance(1999);
  assert.equal(calls.length, 2);
  await clock.advance(1);
  assert.equal(calls.length, 3);
});

test("flush does not leave its own retry timers behind but re-arms leftovers", async () => {
  const { clock, calls, saver } = setup();
  saver.queue("q1", "A");
  const result = saver.flush(1500);
  await settle();
  calls[0].d.reject(undefined);
  await clock.advance(1000); // pause, then second round
  assert.equal(calls.length, 2);
  calls[1].d.reject(undefined);
  await clock.advance(500);
  assert.equal(await result, false);
  // exactly one retry timer armed for q1 after flush ended
  assert.equal(clock.pendingTimers(), 1);
});

test("QUIZ_CLOSED stops everything and reports once", async () => {
  const { clock, calls, saver, closed } = setup();
  saver.queue("q1", "A");
  saver.queue("q2", "B");
  await clock.advance(600);
  calls[0].d.reject(new Error("QUIZ_CLOSED"));
  calls[1].d.reject(new Error("QUIZ_CLOSED"));
  await settle();
  assert.deepEqual(closed, ["QUIZ_CLOSED"]);
  saver.queue("q1", "C");
  await clock.advance(5000);
  assert.equal(calls.length, 2);
  assert.equal(await saver.flush(), true);
});

test("after dispose a failing save arms no retry and nothing more is sent", async () => {
  const { clock, calls, saver, closed } = setup();
  saver.queue("q1", "A");
  await clock.advance(600);
  saver.dispose();
  calls[0].d.reject(undefined);
  await clock.advance(60_000);
  assert.equal(calls.length, 1);
  assert.equal(clock.pendingTimers(), 0);
  saver.queue("q1", "B");
  await clock.advance(1000);
  assert.equal(calls.length, 1);
  assert.deepEqual(closed, []);
});
