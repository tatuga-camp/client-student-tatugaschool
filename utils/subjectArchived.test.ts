import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeSubjects,
  isSubjectArchived,
  isSubjectArchivedError,
} from "./subjectArchived";

const archived403 = {
  statusCode: 403,
  message: "Subject is archived. Students cannot open it.",
  code: "SUBJECT_ARCHIVED",
  error: "Forbidden",
};

test("isSubjectArchivedError: the server's archived 403", () => {
  assert.equal(isSubjectArchivedError(archived403), true);
});

test("isSubjectArchivedError: other errors are not archived", () => {
  assert.equal(
    isSubjectArchivedError({ statusCode: 403, message: "Forbidden access" }),
    false,
  );
  assert.equal(
    isSubjectArchivedError({ statusCode: 404, code: "SUBJECT_ARCHIVED" }),
    false,
  );
  assert.equal(isSubjectArchivedError(null), false);
  assert.equal(isSubjectArchivedError(undefined), false);
  assert.equal(isSubjectArchivedError(new Error("Network")), false);
});

test("isSubjectArchived: from the subject or from the error", () => {
  assert.equal(isSubjectArchived({ isAchieved: true }), true);
  assert.equal(isSubjectArchived(undefined, archived403), true);
  assert.equal(isSubjectArchived({ isAchieved: false }), false);
  assert.equal(isSubjectArchived(undefined, { statusCode: 500 }), false);
  assert.equal(isSubjectArchived(null, null), false);
});

test("activeSubjects: drops archived ones and the excluded id, keeps order", () => {
  const list = [
    { id: "a", isAchieved: false },
    { id: "b", isAchieved: true },
    { id: "c" },
    { id: "d", isAchieved: false },
  ];
  assert.deepEqual(
    activeSubjects(list).map((s) => s.id),
    ["a", "c", "d"],
  );
  assert.deepEqual(
    activeSubjects(list, "c").map((s) => s.id),
    ["a", "d"],
  );
});
