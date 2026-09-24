import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canStudentViewScore,
  summarizeAssignmentScores,
} from "./scoreVisibility";

test("visible when both flags are true", () => {
  assert.equal(
    canStudentViewScore(
      { allowStudentViewScoreOnAssignment: true },
      { allowStudentViewScore: true },
    ),
    true,
  );
});

test("hidden when the assignment flag is false", () => {
  assert.equal(
    canStudentViewScore(
      { allowStudentViewScoreOnAssignment: true },
      { allowStudentViewScore: false },
    ),
    false,
  );
});

test("subject flag false wins even if the assignment allows", () => {
  assert.equal(
    canStudentViewScore(
      { allowStudentViewScoreOnAssignment: false },
      { allowStudentViewScore: true },
    ),
    false,
  );
});

test("missing keys are treated as visible", () => {
  assert.equal(canStudentViewScore(undefined, {}), true);
  assert.equal(canStudentViewScore(null, {}), true);
  assert.equal(canStudentViewScore({}, { allowStudentViewScore: undefined }), true);
});

test("summarize sums visible rows and counts hidden ones", () => {
  const out = summarizeAssignmentScores(
    [
      {
        assignment: { maxScore: 10, weight: null, allowStudentViewScore: true },
        studentOnAssignment: { score: 8 },
      },
      {
        assignment: { maxScore: 20, weight: null, allowStudentViewScore: false },
        studentOnAssignment: { score: 20 },
      },
      {
        assignment: { maxScore: 5, weight: null },
        studentOnAssignment: { score: null },
      },
    ],
    { allowStudentViewScoreOnAssignment: true },
  );
  assert.deepEqual(out, { earned: 8, max: 15, hiddenCount: 1 });
});

test("summarize applies weight the same way the Grade tab did", () => {
  const out = summarizeAssignmentScores(
    [
      {
        assignment: { maxScore: 50, weight: 20 },
        studentOnAssignment: { score: 25 },
      },
    ],
    undefined,
  );
  assert.equal(out.earned, 10);
  assert.equal(out.max, 50);
});

test("summarize treats maxScore 0 on a weighted row as 0, not NaN", () => {
  const out = summarizeAssignmentScores(
    [
      {
        assignment: { maxScore: 0, weight: 20 },
        studentOnAssignment: { score: 3 },
      },
    ],
    undefined,
  );
  assert.equal(out.earned, 0);
  assert.equal(Number.isFinite(out.earned), true);
});

test("summarize with every row hidden returns zeros and the count", () => {
  const out = summarizeAssignmentScores(
    [
      {
        assignment: { maxScore: 10, weight: null, allowStudentViewScore: false },
        studentOnAssignment: { score: 9 },
      },
    ],
    undefined,
  );
  assert.deepEqual(out, { earned: 0, max: 0, hiddenCount: 1 });
});

test("summarize hides everything when the subject flag is false", () => {
  const out = summarizeAssignmentScores(
    [
      {
        assignment: { maxScore: 10, weight: null },
        studentOnAssignment: { score: 9 },
      },
    ],
    { allowStudentViewScoreOnAssignment: false },
  );
  assert.deepEqual(out, { earned: 0, max: 0, hiddenCount: 1 });
});
