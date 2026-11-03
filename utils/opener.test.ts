import test from "node:test";
import assert from "node:assert/strict";
import { pickOpener } from "./opener";

const body = { isConnected: true, name: "body" };
const button = { isConnected: true, name: "button" };
const gone = { isConnected: false, name: "gone" };
const panel = { isConnected: true, name: "panel" };

test("a tapped button is the opener even when focus went elsewhere (Safari)", () => {
  assert.equal(pickOpener(button, panel, body), button);
  assert.equal(pickOpener(button, body, body), button);
  assert.equal(pickOpener(button, null, body), button);
});

test("with no press (keyboard), the focused element is the opener", () => {
  assert.equal(pickOpener(null, button, body), button);
});

test("a pressed control that has since gone away is not the opener", () => {
  assert.equal(pickOpener(gone, panel, body), panel);
});

test("nothing focused and nothing pressed: no opener", () => {
  assert.equal(pickOpener(null, body, body), null);
  assert.equal(pickOpener(null, null, body), null);
  assert.equal(pickOpener(gone, body, body), null);
});
