import { test } from "node:test";
import assert from "node:assert/strict";
import { IntegrityEvent } from "../interfaces";
import {
  AWAY_NOTICE_MIN_MS,
  clipboardPolicy,
  createIntegritySender,
  EventQueue,
  INTEGRITY_FLUSH_MS,
  shouldShowAwayNotice,
} from "./quizIntegrity";

const ev = (type: IntegrityEvent["type"], i = 0): IntegrityEvent => ({ type, clientAt: new Date(i).toISOString() });
type Batch = { events: IntegrityEvent[]; heartbeat: boolean };

function deferred() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("flush sends queued events as a heartbeat and empties the queue", async () => {
  const queue = new EventQueue(200);
  const sent: Batch[] = [];
  const sender = createIntegritySender({ queue, send: async (b) => void sent.push(b), keepalive: async () => true });
  queue.push([ev("HIDDEN"), ev("VISIBLE", 1)]);
  await sender.flush();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].heartbeat, true);
  assert.deepEqual(sent[0].events.map((e) => e.type), ["HIDDEN", "VISIBLE"]);
  assert.equal(queue.size, 0);
});

test("flush sends an empty heartbeat when nothing is queued", async () => {
  const queue = new EventQueue(200);
  const sent: Batch[] = [];
  const sender = createIntegritySender({ queue, send: async (b) => void sent.push(b), keepalive: async () => true });
  await sender.flush();
  assert.deepEqual(sent, [{ events: [], heartbeat: true }]);
});

test("a failed flush (offline) restores the batch ahead of newer events", async () => {
  const queue = new EventQueue(200);
  const sender = createIntegritySender({
    queue,
    send: async () => {
      queue.push([ev("BLUR", 2)]); // arrives while the request is out
      throw new Error("Network Error");
    },
    keepalive: async () => true,
  });
  queue.push([ev("HIDDEN", 0), ev("VISIBLE", 1)]);
  await sender.flush();
  assert.equal(queue.size, 3);
  assert.deepEqual(queue.drain().map((e) => e.type), ["HIDDEN", "VISIBLE", "BLUR"]);
});

test("repeated offline flushes keep the queue capped at 200, newest kept", async () => {
  const queue = new EventQueue(200);
  const sender = createIntegritySender({
    queue,
    send: async () => {
      throw new Error("offline");
    },
    keepalive: async () => false,
  });
  for (let round = 0; round < 5; round++) {
    queue.push(Array.from({ length: 60 }, (_, i) => ev("BLUR", round * 60 + i)));
    await sender.flush();
  }
  assert.equal(queue.size, 200);
  const items = queue.drain();
  assert.equal(items[items.length - 1].clientAt, new Date(299).toISOString());
  assert.equal(items[0].clientAt, new Date(100).toISOString());
});

test("flush does not start a second request while one is in flight", async () => {
  const queue = new EventQueue(200);
  const gate = deferred();
  let calls = 0;
  const sender = createIntegritySender({
    queue,
    send: async () => {
      calls++;
      await gate.promise;
    },
    keepalive: async () => true,
  });
  const first = sender.flush();
  queue.push([ev("FOCUS")]);
  await sender.flush(); // ignored: first still running
  assert.equal(calls, 1);
  assert.equal(queue.size, 1, "event queued during the request waits for the next flush");
  gate.resolve();
  await first;
  await sender.flush();
  assert.equal(calls, 2);
  assert.equal(queue.size, 0);
});

test("startHeartbeat flushes immediately, then every 10 s, and stop clears the timer", async () => {
  assert.equal(INTEGRITY_FLUSH_MS, 10_000);
  const queue = new EventQueue(200);
  let calls = 0;
  const sender = createIntegritySender({ queue, send: async () => void calls++, keepalive: async () => true });
  let tick: (() => void) | null = null;
  let intervalMs = 0;
  let cleared: unknown = null;
  const stop = sender.startHeartbeat(
    (fn, ms) => {
      tick = fn;
      intervalMs = ms;
      return 42;
    },
    (h) => (cleared = h),
  );
  await Promise.resolve();
  assert.equal(calls, 1, "first heartbeat sent on start");
  assert.equal(intervalMs, 10_000);
  tick!();
  await Promise.resolve();
  tick!();
  await Promise.resolve();
  assert.equal(calls, 3);
  stop();
  assert.equal(cleared, 42);
});

test("flushKeepalive sends a non-heartbeat batch and empties the queue on success", async () => {
  const queue = new EventQueue(200);
  const sent: Batch[] = [];
  const sender = createIntegritySender({
    queue,
    send: async () => undefined,
    keepalive: async (b) => {
      sent.push(b);
      return true;
    },
  });
  queue.push([ev("HIDDEN")]);
  await sender.flushKeepalive();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].heartbeat, false);
  assert.equal(queue.size, 0);
});

test("flushKeepalive skips the request when nothing is queued", async () => {
  const queue = new EventQueue(200);
  let calls = 0;
  const sender = createIntegritySender({ queue, send: async () => undefined, keepalive: async () => (calls++, true) });
  await sender.flushKeepalive();
  assert.equal(calls, 0);
});

test("flushKeepalive keeps events queued when it could not send (no token, offline, 401)", async () => {
  for (const keepalive of [async () => false, async () => Promise.reject(new Error("offline"))]) {
    const queue = new EventQueue(200);
    const sender = createIntegritySender({ queue, send: async () => undefined, keepalive });
    queue.push([ev("HIDDEN", 0)]);
    await sender.flushKeepalive();
    queue.push([ev("VISIBLE", 1)]);
    assert.deepEqual(queue.drain().map((e) => e.type), ["HIDDEN", "VISIBLE"]);
  }
});

test("away notice shows only for absences of 2 s or more", () => {
  assert.equal(AWAY_NOTICE_MIN_MS, 2_000);
  assert.equal(shouldShowAwayNotice(null), false);
  assert.equal(shouldShowAwayNotice(0), false);
  assert.equal(shouldShowAwayNotice(1_999), false);
  assert.equal(shouldShowAwayNotice(2_000), true);
  assert.equal(shouldShowAwayNotice(45_000), true);
});

test("copy outside a text field is prevented and recorded", () => {
  assert.deepEqual(clipboardPolicy("copy", { tagName: "DIV" }), { preventDefault: true, report: "COPY_ATTEMPT" });
  assert.deepEqual(clipboardPolicy("copy", null), { preventDefault: true, report: "COPY_ATTEMPT" });
});

test("copy and context menu inside inputs and textareas are left alone", () => {
  for (const tagName of ["INPUT", "TEXTAREA", "input", "textarea"]) {
    assert.deepEqual(clipboardPolicy("copy", { tagName }), { preventDefault: false, report: null });
    assert.deepEqual(clipboardPolicy("contextmenu", { tagName }), { preventDefault: false, report: null });
  }
});

test("context menu outside a text field is prevented but not recorded", () => {
  assert.deepEqual(clipboardPolicy("contextmenu", { tagName: "IMG" }), { preventDefault: true, report: null });
});

test("paste is recorded but never prevented, anywhere", () => {
  for (const target of [{ tagName: "INPUT" }, { tagName: "TEXTAREA" }, { tagName: "DIV" }, null]) {
    assert.deepEqual(clipboardPolicy("paste", target), { preventDefault: false, report: "PASTE_ATTEMPT" });
  }
});
