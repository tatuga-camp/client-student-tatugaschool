import test from "node:test";
import assert from "node:assert/strict";
import { withTimeout } from "./withTimeout";

test("withTimeout resolves with the value when it is fast", async () => {
  assert.deepEqual(await withTimeout(Promise.resolve(7), 50), {
    ok: true,
    value: 7,
  });
});

test("withTimeout gives up when it is slow", async () => {
  const slow = new Promise<number>((r) => setTimeout(() => r(1), 200));
  assert.deepEqual(await withTimeout(slow, 20), { ok: false });
});

test("withTimeout passes a rejection through", async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error("x")), 50), /x/);
});
