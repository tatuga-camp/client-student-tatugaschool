import test from "node:test";
import assert from "node:assert/strict";
import {
  interceptPop,
  setPopInterceptor,
  leaveGuardActive,
  leaveIfAllowed,
  setLeaveInterceptor,
} from "./leaveGuard";

const deferred = <T>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

test("with no guard the caller leaves at once", async () => {
  setLeaveInterceptor(null);
  let left = 0;
  assert.equal(leaveGuardActive(), false);
  assert.equal(await leaveIfAllowed(() => void left++), "left");
  assert.equal(left, 1);
});

test("the guard is asked first; leaving waits for its answer", async () => {
  const answer = deferred<boolean>();
  const order: string[] = [];
  setLeaveInterceptor({
    active: () => true,
    confirm: () => {
      order.push("asked");
      return answer.promise;
    },
  });
  assert.equal(leaveGuardActive(), true);
  const result = leaveIfAllowed(() => void order.push("left"));
  await Promise.resolve();
  assert.deepEqual(order, ["asked"]);
  answer.resolve(true);
  assert.equal(await result, "left");
  assert.deepEqual(order, ["asked", "left"]);
  setLeaveInterceptor(null);
});

test("Stay: the caller never leaves", async () => {
  let left = 0;
  setLeaveInterceptor({ active: () => true, confirm: async () => false });
  assert.equal(await leaveIfAllowed(() => void left++), "stayed");
  assert.equal(left, 0);
  setLeaveInterceptor(null);
});

test("an inactive guard is not asked", async () => {
  let asked = 0;
  let left = 0;
  setLeaveInterceptor({
    active: () => false,
    confirm: async () => (asked++, false),
  });
  assert.equal(await leaveIfAllowed(() => void left++), "left");
  assert.equal(asked, 0);
  assert.equal(left, 1);
  setLeaveInterceptor(null);
});

test("a stale interceptor cannot clear a newer one", () => {
  const a = { active: () => true, confirm: async () => true };
  const b = { active: () => false, confirm: async () => true };
  setLeaveInterceptor(a);
  setLeaveInterceptor(b);
  setLeaveInterceptor(null, a);
  assert.equal(leaveGuardActive(), false);
  setLeaveInterceptor(a);
  setLeaveInterceptor(null, b);
  assert.equal(leaveGuardActive(), true);
  setLeaveInterceptor(null);
});

test("two concurrent callers produce exactly one question and one navigation", async () => {
  const answer = deferred<boolean>();
  let asked = 0;
  let left = 0;
  setLeaveInterceptor({
    active: () => true,
    confirm: () => (asked++, answer.promise),
  });
  const first = leaveIfAllowed(() => void left++);
  const second = leaveIfAllowed(() => void left++);
  answer.resolve(true);
  assert.deepEqual(await Promise.all([first, second]), ["left", "left"]);
  assert.equal(asked, 1);
  assert.equal(left, 1);
  setLeaveInterceptor(null);
});

test("concurrent callers after a Stay all stay, and a later call asks again", async () => {
  let asked = 0;
  let left = 0;
  setLeaveInterceptor({
    active: () => true,
    confirm: async () => (asked++, asked > 1),
  });
  const results = await Promise.all([
    leaveIfAllowed(() => void left++),
    leaveIfAllowed(() => void left++),
  ]);
  assert.deepEqual(results, ["stayed", "stayed"]);
  assert.equal(left, 0);
  assert.equal(await leaveIfAllowed(() => void left++), "left");
  assert.equal(asked, 2);
  assert.equal(left, 1);
  setLeaveInterceptor(null);
});

test("two quick presses with no guard leave once", async () => {
  setLeaveInterceptor(null);
  let left = 0;
  await Promise.all([
    leaveIfAllowed(() => void left++),
    leaveIfAllowed(() => void left++),
  ]);
  assert.equal(left, 1);
});

test("a pop interceptor decides whether a browser back is cancelled", () => {
  assert.equal(interceptPop({ as: "/x" }), false);
  setPopInterceptor((state) => state.as === "/x");
  assert.equal(interceptPop({ as: "/x" }), true);
  assert.equal(interceptPop({ as: "/y" }), false);
  setPopInterceptor(null);
});
