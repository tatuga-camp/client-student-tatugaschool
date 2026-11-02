import { test } from "node:test";
import assert from "node:assert/strict";
import { frameKind, isShellRoute } from "./frameRoutes";
import { DESK_QUERY, WIDE_QUERY } from "./layoutQueries";
import { SIDEBAR_TABS, TABS, tabHref } from "./tabs";

test("isShellRoute is true for the subject tabs and the assignment page", () => {
  assert.equal(isShellRoute("/subject/[subjectId]"), true);
  assert.equal(
    isShellRoute("/subject/[subjectId]/assignment/[assignmentId]"),
    true,
  );
});

test("isShellRoute is false for the quiz, sign-in and other pages", () => {
  for (const pathname of [
    "/subject/[subjectId]/quiz/[assignmentId]",
    "/welcome",
    "/",
    "/word-cloud/[wordCloudId]",
    "/qr-code-attendance/[attendanceRowId]",
  ]) {
    assert.equal(isShellRoute(pathname), false, pathname);
  }
});

test("SIDEBAR_TABS puts Home first and holds every tab once", () => {
  assert.deepEqual(
    [...SIDEBAR_TABS],
    ["home", "classwork", "progress", "subjects", "me"],
  );
  assert.deepEqual([...SIDEBAR_TABS].sort(), [...TABS].sort());
});

test("tabHref omits tab for Home", () => {
  assert.deepEqual(tabHref("s1", "home"), {
    pathname: "/subject/[subjectId]",
    query: { subjectId: "s1" },
  });
});

test("tabHref carries the tab for the other tabs", () => {
  assert.deepEqual(tabHref("s1", "me"), {
    pathname: "/subject/[subjectId]",
    query: { subjectId: "s1", tab: "me" },
  });
});

test("layout queries match the spec's breakpoints", () => {
  assert.equal(DESK_QUERY, "(min-width: 768px) and (min-height: 500px)");
  assert.equal(WIDE_QUERY, "(min-width: 1024px) and (min-height: 500px)");
});

test("frameKind: the subject shell fills the window", () => {
  assert.equal(frameKind("/subject/[subjectId]"), "shell");
  assert.equal(
    frameKind("/subject/[subjectId]/assignment/[assignmentId]"),
    "shell",
  );
});

test("frameKind: sign-in gets a content-sized card, pick-your-name a wide one", () => {
  assert.equal(frameKind("/welcome"), "fit");
  assert.equal(frameKind("/"), "wide");
});

test("frameKind: other phone pages get the standard card", () => {
  for (const p of [
    "/word-cloud/[wordCloudId]",
    "/word-cloud/set/[setId]",
    "/qr-code-attendance/[attendanceRowId]",
    "/student/[studentId]",
  ]) {
    assert.equal(frameKind(p), "card", p);
  }
});
