import { test } from "node:test";
import assert from "node:assert/strict";
import { nameEditError, passwordChangeError } from "./profileEdit";

test("nameEditError blocks blank and whitespace-only fields", () => {
  assert.equal(nameEditError({ title: "Mr.", firstName: "Somchai", lastName: "Jaidee" }), null);
  assert.equal(nameEditError({ title: "Mr.", firstName: "   ", lastName: "Jaidee" }), "required");
  assert.equal(nameEditError({ title: "", firstName: "Somchai", lastName: "Jaidee" }), "required");
});

test("passwordChangeError needs a password and a matching confirm", () => {
  assert.equal(passwordChangeError("secret1", "secret1"), null);
  assert.equal(passwordChangeError("", ""), "required");
  assert.equal(passwordChangeError("secret1", "secret2"), "mismatch");
});
