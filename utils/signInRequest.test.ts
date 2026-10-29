import test from "node:test";
import assert from "node:assert/strict";
import { signInRequest } from "./signInRequest";

// StudentOnSubject.id is the enrolment; the sign-in API wants studentId.
const student = { id: "enrolment-1", studentId: "student-1" };

test("signInRequest sends the studentId, not the enrolment id", () => {
  assert.deepEqual(signInRequest(student), { studentId: "student-1" });
});

test("signInRequest adds the password when given", () => {
  assert.deepEqual(signInRequest(student, "pw"), {
    studentId: "student-1",
    password: "pw",
  });
});
