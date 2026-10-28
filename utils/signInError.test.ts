import test from "node:test";
import assert from "node:assert/strict";
import { isPasswordRejection, needsPassword } from "./signInError";

test("needsPassword matches only the server's password request", () => {
  assert.equal(needsPassword({ message: "Please enter your password" }), true);
  assert.equal(needsPassword({ message: "Student isn't found" }), false);
  assert.equal(needsPassword(null), false);
  assert.equal(needsPassword(undefined), false);
  assert.equal(needsPassword(new Error("boom")), false);
});

test("isPasswordRejection treats empty or password-related text as wrong password", () => {
  assert.equal(isPasswordRejection(undefined), true);
  assert.equal(isPasswordRejection(""), true);
  assert.equal(isPasswordRejection("Password isn't correct"), true);
  assert.equal(isPasswordRejection("Student isn't found"), false);
});
