import { test } from "node:test";
import assert from "node:assert/strict";
import { notificationHref, subjectHref } from "./notificationLink";

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

test("subjectHref: the announcement id stays one encoded param", () => {
  assert.equal(subjectHref("s1", null), "/subject/s1");
  const href = subjectHref("s1", "x&tab=me=1");
  assert.equal(href, "/subject/s1?tab=classwork&announcement_id=x%26tab%3Dme%3D1");
  const query = new URL(href, "https://app.invalid").searchParams;
  assert.deepEqual(query.getAll("tab"), ["classwork"]);
  assert.equal(query.get("announcement_id"), "x&tab=me=1");
});
