import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classworkBucket,
  countClassworkBuckets,
  dueUrgency,
  matchesClassworkFilter,
  summarizeAttendance,
  tintColor,
} from "./subjectHome";

const work = (status: string, type = "Assignment", dueDate?: string | null) =>
  ({ type, studentOnAssignment: { status: status as never }, dueDate });

test("buckets: pending and sent-back are to do, submitted, reviewed is graded", () => {
  assert.equal(classworkBucket(work("PENDDING")), "todo");
  assert.equal(classworkBucket(work("IMPROVED")), "todo");
  assert.equal(classworkBucket(work("SUBMITTED")), "submitted");
  assert.equal(classworkBucket(work("REVIEWD")), "graded");
  assert.equal(classworkBucket(work("PENDDING", "Material")), "material");
  assert.equal(classworkBucket({ type: "Quiz", studentOnAssignment: null }), "todo");
});

test("counts every bucket", () => {
  assert.deepEqual(
    countClassworkBuckets([
      work("PENDDING"),
      work("IMPROVED", "Quiz"),
      work("SUBMITTED"),
      work("REVIEWD", "VideoQuiz"),
      work("PENDDING", "Material"),
    ]),
    { todo: 2, submitted: 1, graded: 1, material: 1 },
  );
});

test("filters keep materials visible", () => {
  assert.equal(matchesClassworkFilter(work("SUBMITTED"), "todo"), false);
  assert.equal(matchesClassworkFilter(work("PENDDING"), "todo"), true);
  assert.equal(matchesClassworkFilter(work("PENDDING", "Material"), "graded"), true);
  assert.equal(matchesClassworkFilter(work("REVIEWD"), "all"), true);
});

const now = new Date("2026-10-09T12:00:00Z");

test("due urgency", () => {
  assert.equal(dueUrgency(work("PENDDING", "Assignment", null), now), "none");
  assert.equal(dueUrgency(work("PENDDING", "Material", "2026-10-01T00:00:00Z"), now), "none");
  assert.equal(dueUrgency(work("SUBMITTED", "Assignment", "2026-10-01T00:00:00Z"), now), "done");
  assert.equal(dueUrgency(work("PENDDING", "Assignment", "2026-10-09T11:59:00Z"), now), "overdue");
  assert.equal(dueUrgency(work("IMPROVED", "Assignment", "2026-10-11T12:00:00Z"), now), "soon");
  assert.equal(dueUrgency(work("PENDDING", "Assignment", "2026-10-11T12:01:00Z"), now), "later");
  assert.equal(dueUrgency(work("PENDDING", "Assignment", "not a date"), now), "none");
});

const statuses = [
  { title: "Present", color: "#22c55e", value: 1 },
  { title: "Late", color: "#f59e0b", value: 0.5 },
  { title: "Absent", color: "#ef4444", value: 0 },
];

test("attendance summary counts in teacher order and finds the best status", () => {
  const s = summarizeAttendance(statuses, [
    { status: "Absent" },
    { status: "Present" },
    { status: "Present" },
    { status: "Late" },
    { status: "Present" },
  ]);
  assert.deepEqual(
    s.counts.map((c) => [c.title, c.count]),
    [["Present", 3], ["Late", 1], ["Absent", 1]],
  );
  assert.equal(s.recorded, 5);
  assert.deepEqual(s.best, { title: "Present", count: 3, percent: 60 });
});

test("attendance summary skips unused statuses and keeps renamed ones", () => {
  const s = summarizeAttendance(statuses, [{ status: "Present" }, { status: "Sick" }, { status: "" }]);
  assert.deepEqual(
    s.counts.map((c) => [c.title, c.count, c.color]),
    [["Present", 1, "#22c55e"], ["Sick", 1, "#94a3b8"]],
  );
  assert.equal(s.recorded, 2);
  assert.equal(s.best?.percent, 50);
});

test("no best status when none stands out or nothing is recorded", () => {
  assert.equal(summarizeAttendance(statuses, []).best, null);
  const flat = statuses.map((s) => ({ ...s, value: 1 }));
  assert.equal(summarizeAttendance(flat, [{ status: "Present" }]).best, null);
});

test("tintColor handles long, short and bad colors", () => {
  assert.equal(tintColor("#22c55e", 0.12), "rgba(34, 197, 94, 0.12)");
  assert.equal(tintColor("f00", 0.5), "rgba(255, 0, 0, 0.5)");
  assert.equal(tintColor("rgb(1,2,3)", 0.2), "rgba(148, 163, 184, 0.2)");
});
