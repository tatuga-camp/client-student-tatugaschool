import { test } from "node:test";
import assert from "node:assert/strict";
import { notificationHref } from "./notificationLink";

test("an announcement opens Classwork at that card, in its own subject", () => {
  assert.equal(
    notificationHref({
      subjectId: "s2",
      link: "https://student.tatugaschool.com/subject/s2?announcement_id=a9",
    }),
    "/subject/s2?tab=classwork&announcement_id=a9",
  );
});

test("a relative link still yields the announcement", () => {
  assert.equal(
    notificationHref({ subjectId: "s2", link: "/subject/s2?announcement_id=a9" }),
    "/subject/s2?tab=classwork&announcement_id=a9",
  );
});

test("anything else opens the subject", () => {
  assert.equal(
    notificationHref({
      subjectId: "s1",
      link: "https://student.tatugaschool.com/subject/s1/assignment/x1",
    }),
    "/subject/s1",
  );
});

test("a broken link falls back to the subject", () => {
  assert.equal(notificationHref({ subjectId: "s1", link: "" }), "/subject/s1");
  assert.equal(
    notificationHref({ subjectId: "s1", link: "http://[bad" }),
    "/subject/s1",
  );
});

test("ids are URL-encoded", () => {
  assert.equal(
    notificationHref({ subjectId: "s 1", link: "/x?announcement_id=a&b" }),
    "/subject/s%201?tab=classwork&announcement_id=a",
  );
});
