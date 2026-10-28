import test from "node:test";
import assert from "node:assert/strict";
import {
  nextAssignmentAfter,
  reviewedMood,
  teacherFileOpenMode,
  turnInSummary,
  workItemMenu,
  yourWorkMode,
} from "./assignmentDetail";

test("teacherFileOpenMode picks the viewer by type, then url", () => {
  assert.equal(teacherFileOpenMode({ type: "video/mp4", url: "https://x/a.mp4" }), "video");
  assert.equal(teacherFileOpenMode({ type: "application/pdf", url: "https://x/a" }), "pdf");
  assert.equal(
    teacherFileOpenMode({ type: "application/octet-stream", url: "https://x/a.PDF?x=1" }),
    "pdf",
  );
  assert.equal(teacherFileOpenMode({ type: "image/png", url: "https://x/a.png" }), "image");
  assert.equal(teacherFileOpenMode({ type: "application/zip", url: "https://x/a.zip" }), "external");
});

test("workItemMenu offers rename only for files and links, delete only when allowed", () => {
  assert.deepEqual(
    workItemMenu({ contentType: "FILE", type: "image/png", allowStudentDeleteWork: false }),
    ["open", "rename"],
  );
  assert.deepEqual(
    workItemMenu({ contentType: "TEXT", type: "", allowStudentDeleteWork: true }),
    ["open", "delete"],
  );
  assert.deepEqual(
    workItemMenu({ contentType: "LINK", type: "", allowStudentDeleteWork: true }),
    ["open", "rename", "delete"],
  );
  assert.deepEqual(
    workItemMenu({ contentType: "TEXT", type: "", allowStudentDeleteWork: false }),
    ["open"],
  );
});

test("yourWorkMode maps type and status", () => {
  assert.equal(yourWorkMode("Material", "PENDDING"), "none");
  assert.equal(yourWorkMode("Quiz", "SUBMITTED"), "none");
  assert.equal(yourWorkMode("Assignment", "REVIEWD"), "reviewed");
  assert.equal(yourWorkMode("Assignment", "SUBMITTED"), "turnedIn");
  assert.equal(yourWorkMode("Assignment", "PENDDING"), "open");
  assert.equal(yourWorkMode("Assignment", "IMPROVED"), "open");
  assert.equal(yourWorkMode("VideoQuiz", undefined), "open");
});

test("turnInSummary reports on-time against the due date", () => {
  const due = "2026-10-28T12:00:00.000Z";
  assert.deepEqual(
    turnInSummary({ dueDate: due, completedAt: "2026-10-28T10:00:00.000Z", itemCount: 2 }),
    { onTime: true, itemCount: 2, sentAt: new Date("2026-10-28T10:00:00.000Z") },
  );
  assert.equal(
    turnInSummary({ dueDate: due, completedAt: "2026-10-29T10:00:00.000Z", itemCount: 1 }).onTime,
    false,
  );
  const noDue = turnInSummary({ dueDate: null, completedAt: "2026-10-29T10:00:00.000Z", itemCount: 1 });
  assert.equal(noDue.onTime, null);
  assert.equal(turnInSummary({ itemCount: 0 }).sentAt, null);
});

test("reviewedMood cheers at half marks or better", () => {
  assert.equal(reviewedMood(4, 10), "encourage");
  assert.equal(reviewedMood(5, 10), "cheer");
  assert.equal(reviewedMood(0, 0), "cheer");
  assert.equal(reviewedMood(null, 10), null);
});

test("nextAssignmentAfter returns the lowest greater order", () => {
  const items = [
    { id: "c", order: 5 },
    { id: "a", order: 1 },
    { id: "b", order: 3 },
  ];
  assert.equal(nextAssignmentAfter(items, { order: 1 })?.id, "b");
  assert.equal(nextAssignmentAfter(items, { order: 3 })?.id, "c");
  assert.equal(nextAssignmentAfter(items, { order: 5 }), null);
  assert.deepEqual(items.map((i) => i.id), ["c", "a", "b"]);
});
