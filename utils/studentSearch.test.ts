import test from "node:test";
import assert from "node:assert/strict";
import {
  hiddenQueryReady,
  highlightMatch,
  searchStudents,
} from "./studentSearch";

const kids = [
  { firstName: "สมชาย", lastName: "ใจดี", number: "12" },
  { firstName: "สมชนก", lastName: "แก้วใส", number: "21" },
  { firstName: "กานต์", lastName: "ดี", number: "1" },
];

test("searchStudents hides the list for short queries when hideList", () => {
  assert.deepEqual(searchStudents(kids, "สม", true), []);
  assert.deepEqual(
    searchStudents(kids, "สมช", true).map((k) => k.number),
    ["12", "21"],
  );
});

test("searchStudents matches full names with or without spaces", () => {
  assert.deepEqual(
    searchStudents(kids, "สมชายใจดี", true).map((k) => k.number),
    ["12"],
  );
  assert.deepEqual(
    searchStudents(kids, "สมชาย ใจดี", true).map((k) => k.number),
    ["12"],
  );
});

test("searchStudents returns everyone sorted by number for an empty query", () => {
  assert.deepEqual(
    searchStudents(kids, "", false).map((k) => k.number),
    ["1", "12", "21"],
  );
});

test("searchStudents matches by number", () => {
  assert.deepEqual(
    searchStudents(kids, "21", false).map((k) => k.number),
    ["21"],
  );
});

test("highlightMatch splits around the first match", () => {
  assert.deepEqual(highlightMatch("สมชาย ใจดี", "สมช"), {
    before: "",
    match: "สมช",
    after: "าย ใจดี",
  });
  assert.equal(highlightMatch("กานต์", "xyz"), null);
});

test("searchStudents in a hidden list lists nobody for 1-2 characters, numbers too", () => {
  const roster = [
    { firstName: "A", lastName: "A", number: "1" },
    { firstName: "B", lastName: "B", number: "3" },
    { firstName: "C", lastName: "C", number: "12" },
    { firstName: "D", lastName: "D", number: "123" },
  ];
  assert.deepEqual(searchStudents(roster, "3", true), []);
  assert.deepEqual(searchStudents(roster, " 1 ", true), []);
  assert.deepEqual(searchStudents(roster, "12", true), []);
  assert.deepEqual(searchStudents(kids, "สม", true), []);
  // 3+ characters find a number too.
  assert.deepEqual(
    searchStudents(roster, "123", true).map((k) => k.number),
    ["123"],
  );
});

test("searchStudents in a hidden list still needs 3+ characters for text", () => {
  const roster = [{ firstName: "Al", lastName: "Bo", number: "5" }];
  assert.deepEqual(searchStudents(roster, "Al", true), []);
});

test("searchStudents in a visible list still matches a short number", () => {
  const roster = [
    { firstName: "A", lastName: "A", number: "3" },
    { firstName: "B", lastName: "B", number: "13" },
  ];
  assert.deepEqual(
    searchStudents(roster, "3", false).map((k) => k.number),
    ["3", "13"],
  );
});

test("hiddenQueryReady: 3+ characters, whether name or number", () => {
  assert.equal(hiddenQueryReady(""), false);
  assert.equal(hiddenQueryReady("ab"), false);
  assert.equal(hiddenQueryReady(" abc "), true);
  assert.equal(hiddenQueryReady("3"), false);
  assert.equal(hiddenQueryReady(" 12 "), false);
  assert.equal(hiddenQueryReady("123"), true);
  assert.equal(hiddenQueryReady("a1"), false);
});
