import test from "node:test";
import assert from "node:assert/strict";
import { highlightMatch, searchStudents } from "./studentSearch";

const kids = [
  { firstName: "สมชาย", lastName: "ใจดี", number: "12" },
  { firstName: "สมชนก", lastName: "แก้วใส", number: "21" },
  { firstName: "กานต์", lastName: "ดี", number: "1" },
];

test("searchStudents hides the list for short queries when hideList", () => {
  assert.deepEqual(searchStudents(kids, "สม", true), []);
  assert.deepEqual(searchStudents(kids, "สมช", true).map((k) => k.number), ["12", "21"]);
});

test("searchStudents matches full names with or without spaces", () => {
  assert.deepEqual(searchStudents(kids, "สมชายใจดี", true).map((k) => k.number), ["12"]);
  assert.deepEqual(searchStudents(kids, "สมชาย ใจดี", true).map((k) => k.number), ["12"]);
});

test("searchStudents returns everyone sorted by number for an empty query", () => {
  assert.deepEqual(searchStudents(kids, "", false).map((k) => k.number), ["1", "12", "21"]);
});

test("searchStudents matches by number", () => {
  assert.deepEqual(searchStudents(kids, "21", false).map((k) => k.number), ["21"]);
});

test("highlightMatch splits around the first match", () => {
  assert.deepEqual(highlightMatch("สมชาย ใจดี", "สมช"), { before: "", match: "สมช", after: "าย ใจดี" });
  assert.equal(highlightMatch("กานต์", "xyz"), null);
});
