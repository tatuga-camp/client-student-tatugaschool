import test from "node:test";
import assert from "node:assert/strict";
import {
  formatScore,
  initialUploadProgress,
  fileSizeLabel,
  hasRichContent,
  isLinkFile,
  teacherFileKind,
  teacherFileName,
  nextAssignmentAfter,
  reviewedMood,
  teacherFileOpenMode,
  turnInSummary,
  workItemMenu,
  yourWorkMode,
} from "./assignmentDetail";

test("teacherFileOpenMode picks the viewer by type, then url", () => {
  assert.equal(
    teacherFileOpenMode({ type: "video/mp4", url: "https://x/a.mp4" }),
    "video",
  );
  assert.equal(
    teacherFileOpenMode({ type: "application/pdf", url: "https://x/a" }),
    "pdf",
  );
  assert.equal(
    teacherFileOpenMode({
      type: "application/octet-stream",
      url: "https://x/a.PDF?x=1",
    }),
    "pdf",
  );
  assert.equal(
    teacherFileOpenMode({ type: "image/png", url: "https://x/a.png" }),
    "image",
  );
  assert.equal(
    teacherFileOpenMode({ type: "application/zip", url: "https://x/a.zip" }),
    "external",
  );
});

test("teacherFileOpenMode survives a missing type and opens HEIC outside the app", () => {
  assert.equal(
    teacherFileOpenMode({ type: null, url: "https://x/a.pdf" }),
    "pdf",
  );
  assert.equal(
    teacherFileOpenMode({ type: undefined, url: "https://x/a.zip" }),
    "external",
  );
  assert.equal(
    teacherFileOpenMode({ type: "", url: "https://x/a" }),
    "external",
  );
  assert.equal(
    teacherFileOpenMode({ type: "image/heic", url: "https://x/a.heic" }),
    "external",
  );
  assert.equal(
    teacherFileOpenMode({ type: "image/HEIF", url: "https://x/a" }),
    "external",
  );
});

test("workItemMenu offers rename only for files and links, delete only when allowed", () => {
  assert.deepEqual(
    workItemMenu({
      contentType: "FILE",
      type: "image/png",
      allowStudentDeleteWork: false,
    }),
    ["open", "rename"],
  );
  assert.deepEqual(
    workItemMenu({
      contentType: "TEXT",
      type: "",
      allowStudentDeleteWork: true,
    }),
    ["open", "delete"],
  );
  assert.deepEqual(
    workItemMenu({
      contentType: "LINK",
      type: "",
      allowStudentDeleteWork: true,
    }),
    ["open", "rename", "delete"],
  );
  assert.deepEqual(
    workItemMenu({
      contentType: "TEXT",
      type: "",
      allowStudentDeleteWork: false,
    }),
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
    turnInSummary({
      dueDate: due,
      completedAt: "2026-10-28T10:00:00.000Z",
      itemCount: 2,
    }),
    {
      onTime: true,
      itemCount: 2,
      sentAt: new Date("2026-10-28T10:00:00.000Z"),
    },
  );
  assert.equal(
    turnInSummary({
      dueDate: due,
      completedAt: "2026-10-29T10:00:00.000Z",
      itemCount: 1,
    }).onTime,
    false,
  );
  const noDue = turnInSummary({
    dueDate: null,
    completedAt: "2026-10-29T10:00:00.000Z",
    itemCount: 1,
  });
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
  assert.deepEqual(
    items.map((i) => i.id),
    ["c", "a", "b"],
  );
});

test("isLinkFile and teacherFileKind", () => {
  assert.equal(isLinkFile({ type: "LINK" }), true);
  assert.equal(isLinkFile({ type: null }), false);
  assert.equal(
    teacherFileKind({ type: "LINK", url: "https://x/a.pdf" }),
    "link",
  );
  assert.equal(teacherFileKind({ type: null, url: "https://x/a.pdf" }), "pdf");
  assert.equal(teacherFileKind({ type: "video/mp4", url: "u" }), "video");
  assert.equal(teacherFileKind({ type: "image/png", url: "u" }), "image");
  assert.equal(teacherFileKind({ type: "application/zip", url: "u" }), "file");
});

test("teacherFileName prefers the name, then the decoded last path segment", () => {
  assert.equal(
    teacherFileName({ name: "Sheet 1", url: "https://x/a.pdf" }),
    "Sheet 1",
  );
  assert.equal(
    teacherFileName({ name: null, url: "https://x/dir/my%20file.pdf?v=2" }),
    "my file.pdf",
  );
  assert.equal(
    teacherFileName({ name: null, url: "https://x/%E0%A4%A.pdf" }),
    "%E0%A4%A.pdf",
  );
  assert.equal(teacherFileName({ name: "", url: "https://x/" }), "https://x/");
});

test("fileSizeLabel picks B, KB or MB and hides unknown sizes", () => {
  assert.equal(fileSizeLabel(0), "");
  assert.equal(fileSizeLabel(null), "");
  assert.equal(fileSizeLabel(-5), "");
  assert.equal(fileSizeLabel(512), "512 B");
  assert.equal(fileSizeLabel(240 * 1024), "240 KB");
  assert.equal(fileSizeLabel(5.5 * 1024 * 1024), "5.5 MB");
});

test("hasRichContent ignores empty editor markup but keeps media", () => {
  assert.equal(hasRichContent(null), false);
  assert.equal(hasRichContent("<p></p>"), false);
  assert.equal(hasRichContent("<p>&nbsp;</p>"), false);
  assert.equal(hasRichContent("<p>Hi</p>"), true);
  assert.equal(hasRichContent('<p><img src="a.png"></p>'), true);
});

test("workItemMenu in a reviewed assignment only opens", () => {
  for (const contentType of ["FILE", "LINK", "TEXT"] as const) {
    assert.deepEqual(
      workItemMenu({
        contentType,
        type: "",
        allowStudentDeleteWork: true,
        reviewed: true,
      }),
      ["open"],
    );
  }
});

test("initialUploadProgress starts at the first of the picked files", () => {
  assert.deepEqual(initialUploadProgress(3), {
    percent: 0,
    index: 1,
    count: 3,
  });
});

test("formatScore keeps up to two decimals and drops trailing zeros", () => {
  assert.equal(formatScore(9), "9");
  assert.equal(formatScore(8.5), "8.5");
  assert.equal(formatScore(8.75), "8.75");
  assert.equal(formatScore(8.456), "8.46");
  assert.equal(formatScore(0), "0");
});
