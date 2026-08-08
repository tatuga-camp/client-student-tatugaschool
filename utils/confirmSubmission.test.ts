import { test } from "node:test";
import assert from "node:assert/strict";
import { hasUnconfirmedWork, isSamePath } from "./confirmSubmission";

test("hasUnconfirmedWork is true for Assignment with files and PENDDING status", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 2, status: "PENDDING" }),
    true,
  );
});

test("hasUnconfirmedWork is true for IMPROVED status (resubmission after teacher feedback)", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 1, status: "IMPROVED" }),
    true,
  );
});

test("hasUnconfirmedWork is true for VideoQuiz with attached files", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "VideoQuiz", fileCount: 1, status: "PENDDING" }),
    true,
  );
});

test("hasUnconfirmedWork is false for Material regardless of files and status", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Material", fileCount: 3, status: "PENDDING" }),
    false,
  );
});

test("hasUnconfirmedWork is false when no files are attached", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 0, status: "PENDDING" }),
    false,
  );
});

test("hasUnconfirmedWork is false when already SUBMITTED", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 3, status: "SUBMITTED" }),
    false,
  );
});

test("hasUnconfirmedWork is false when REVIEWD", () => {
  assert.equal(
    hasUnconfirmedWork({ assignmentType: "Assignment", fileCount: 3, status: "REVIEWD" }),
    false,
  );
});

test("isSamePath ignores query strings", () => {
  assert.equal(isSamePath("/subject/a/assignment/b?tab=1", "/subject/a/assignment/b?tab=2"), true);
});

test("isSamePath ignores hash fragments", () => {
  assert.equal(isSamePath("/subject/a/assignment/b", "/subject/a/assignment/b#comments"), true);
});

test("isSamePath ignores a trailing slash", () => {
  assert.equal(isSamePath("/subject/a/assignment/b/", "/subject/a/assignment/b"), true);
});

test("isSamePath is false for different paths", () => {
  assert.equal(isSamePath("/subject/a/assignment/b", "/subject/a/assignment/c"), false);
});
