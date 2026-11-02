import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeSubjects,
  groupByTerm,
  isSubjectArchived,
  isSubjectArchivedError,
  needsTermFallback,
  otherSubjectsView,
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

// Review fix: the archived screen said "no other subjects" while the list
// was still loading or had failed (and the older server answers 400 to a
// list request with no term).
test("needsTermFallback: only a 400 to the all-terms list, with a term known", () => {
  const badRequest = {
    statusCode: 400,
    message: ["educationYear should not be empty"],
  };
  assert.equal(needsTermFallback(badRequest, "2/2026"), true);
  assert.equal(needsTermFallback(badRequest, undefined), false);
  assert.equal(needsTermFallback(badRequest, ""), false);
  assert.equal(needsTermFallback({ statusCode: 500 }, "2/2026"), false);
  assert.equal(needsTermFallback(null, "2/2026"), false);
});

const idle = { isPending: false, isError: false };
const pending = { isPending: true, isError: false };
const failed = { isPending: false, isError: true };

test("otherSubjectsView: loading while the student or the list is pending", () => {
  assert.equal(
    otherSubjectsView({ student: pending, list: pending, count: 0 }),
    "loading",
  );
  assert.equal(
    otherSubjectsView({ student: idle, list: pending, count: 0 }),
    "loading",
  );
});

test('otherSubjectsView: a failed load is an error, never "no other subjects"', () => {
  assert.equal(
    otherSubjectsView({ student: idle, list: failed, count: 0 }),
    "error",
  );
  assert.equal(
    otherSubjectsView({ student: failed, list: pending, count: 0 }),
    "error",
  );
});

test("otherSubjectsView: subjects on hand are shown, even if a refetch failed", () => {
  assert.equal(
    otherSubjectsView({ student: idle, list: idle, count: 2 }),
    "list",
  );
  assert.equal(
    otherSubjectsView({ student: idle, list: failed, count: 2 }),
    "list",
  );
});

test("otherSubjectsView: empty only once the list has loaded with none", () => {
  assert.equal(
    otherSubjectsView({ student: idle, list: idle, count: 0 }),
    "empty",
  );
});
