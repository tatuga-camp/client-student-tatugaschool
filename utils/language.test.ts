import { test } from "node:test";
import assert from "node:assert/strict";
import { detectInitialLanguage, saveLanguage } from "./language";

const g = globalThis as Record<string, unknown>;

function browser(language: string, storage: () => Storage) {
  g.window = { navigator: { language } };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get: storage,
  });
}

const store = (value: string | null) =>
  ({ getItem: () => value, setItem() {}, removeItem() {} }) as unknown as Storage;

test("a Thai browser starts in TH even with site data blocked", () => {
  browser("th-TH", () => {
    throw new Error("SecurityError: Access is denied for this document");
  });
  assert.equal(detectInitialLanguage(), "th");
  browser("en-US", () => {
    throw new Error("SecurityError");
  });
  assert.equal(detectInitialLanguage(), "en");
});

test("the stored choice wins over the browser's language", () => {
  browser("th-TH", () => store("en"));
  assert.equal(detectInitialLanguage(), "en");
  browser("en-US", () => store("th"));
  assert.equal(detectInitialLanguage(), "th");
  browser("th", () => store("xx"));
  assert.equal(detectInitialLanguage(), "th");
});

test("with storage blocked, a choice holds for the session (the query refetches)", () => {
  browser("en-US", () => {
    throw new Error("SecurityError");
  });
  assert.doesNotThrow(() => saveLanguage("th"));
  assert.equal(detectInitialLanguage(), "th");
});
