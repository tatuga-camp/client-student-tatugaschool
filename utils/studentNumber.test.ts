import { test } from "node:test";
import assert from "node:assert/strict";
import {
  byStudentNumber,
  compareStudentNumber,
  normalizeStudentNumber,
} from "./studentNumber";
import { searchStudents } from "./studentSearch";

test("normalizeStudentNumber maps Thai digits to ASCII and trims", () => {
  assert.equal(normalizeStudentNumber(" ๑๐ "), "10");
  assert.equal(normalizeStudentNumber("๒a"), "2a");
  assert.equal(normalizeStudentNumber(7), "7");
  assert.equal(normalizeStudentNumber(null), "");
});

test("compareStudentNumber is natural and Thai-digit aware; blanks last", () => {
  assert.ok(compareStudentNumber("2", "10") < 0);
  assert.ok(compareStudentNumber("๒", "๑๐") < 0);
  assert.ok(compareStudentNumber("๙", "10") < 0);
  assert.equal(compareStudentNumber("๑๐", "10"), 0);
  assert.ok(compareStudentNumber("", "1") > 0);
  assert.equal(compareStudentNumber("", ""), 0);
});

test("byStudentNumber orders a mixed Thai/Arabic roster", () => {
  const ids = [
    { id: "a", number: "๑๐" },
    { id: "b", number: "๒" },
    { id: "c", number: "3" },
    { id: "d", number: "๑" },
    { id: "e", number: "" },
    { id: "f", number: "11" },
  ]
    .sort(byStudentNumber)
    .map((x) => x.id);
  assert.deepEqual(ids, ["d", "b", "c", "a", "f", "e"]);
});

test("searchStudents lists a Thai-numbered roster in number order", () => {
  const list = [
    { firstName: "A", lastName: "L", number: "๓" },
    { firstName: "B", lastName: "L", number: "๑" },
    { firstName: "C", lastName: "L", number: "๒" },
  ];
  assert.deepEqual(
    searchStudents(list, "", false).map((s) => s.number),
    ["๑", "๒", "๓"],
  );
});
