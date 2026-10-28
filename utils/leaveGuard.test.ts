import test from "node:test";
import assert from "node:assert/strict";
import {
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
