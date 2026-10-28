import { test } from "node:test";
import assert from "node:assert/strict";
import { autoPushPrompt } from "./notifications";

test("a fresh profile that can ask gets the Allow prompt", () => {
  assert.equal(autoPushPrompt({ dismissed: false, status: "default" }), "ask");
});

test("iPhone Safari without the installed app gets the install prompt", () => {
  assert.equal(
    autoPushPrompt({ dismissed: false, status: "ios-install" }),
    "ios-install",
  );
});

test("once dismissed, nothing shows again on its own", () => {
  assert.equal(autoPushPrompt({ dismissed: true, status: "default" }), null);
  assert.equal(autoPushPrompt({ dismissed: true, status: "ios-install" }), null);
});

test("granted, blocked or unsupported: nothing to ask", () => {
  assert.equal(autoPushPrompt({ dismissed: false, status: "granted" }), null);
  assert.equal(autoPushPrompt({ dismissed: false, status: "denied" }), null);
  assert.equal(autoPushPrompt({ dismissed: false, status: "unsupported" }), null);
});
