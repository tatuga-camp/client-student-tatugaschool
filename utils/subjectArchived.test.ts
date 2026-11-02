import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeSubjects,
  groupByTerm,
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

test("groupByTerm: newest term first, subjects kept in order", () => {
  const list = [
    { id: "a", educationYear: "1/2026" },
    { id: "b", educationYear: "2/2025" },
    { id: "c", educationYear: "2/2026" },
    { id: "d", educationYear: "1/2026" },
    { id: "e", educationYear: "10/2025" },
  ];
  assert.deepEqual(
    groupByTerm(list).map(([term, items]) => [term, items.map((s) => s.id)]),
    [
      ["2/2026", ["c"]],
      ["1/2026", ["a", "d"]],
      ["10/2025", ["e"]],
      ["2/2025", ["b"]],
    ],
  );
});

test("groupByTerm: an empty list has no groups", () => {
  assert.deepEqual(groupByTerm([]), []);
});
