import { test } from "node:test";
import assert from "node:assert/strict";
import { safeGet, safeRemove, safeSet } from "./safeStorage";

test("safe storage swallows a throwing localStorage", () => {
  (globalThis as any).localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(safeGet("k"), null);
  assert.doesNotThrow(() => safeSet("k", "v"));
  assert.doesNotThrow(() => safeRemove("k"));
});
test("safe storage reads back what it wrote", () => {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) };
  safeSet("k", "v"); assert.equal(safeGet("k"), "v"); safeRemove("k"); assert.equal(safeGet("k"), null);
});
