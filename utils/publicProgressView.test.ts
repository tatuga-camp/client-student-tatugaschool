import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildProgressColumns,
  filterStudents,
  formatScore,
  isUnavailableError,
} from "./publicProgressView";
import type { PublicProgress, PublicProgressStudent } from "../interfaces";

function data(level: PublicProgress["level"]): PublicProgress {
  return {
    subject: {
      title: "Math",
      educationYear: "1/2026",
      className: "M.1",
      backgroundImage: null,
    },
    level,
    columns: [
      { kind: "assignment", id: "a1", title: "A1", tag: "Unit 1", scoreHidden: false },
      { kind: "assignment", id: "a2", title: "A2", tag: null, scoreHidden: false },
      { kind: "assignment", id: "a3", title: "A3", tag: "Unit 1", scoreHidden: true },
      ...(level === "STATUS"
        ? []
        : [{ kind: "special" as const, id: "s1", title: "S1", maxScore: 10, weight: null }]),
    ],
    groups: [
      { tag: "Unit 1", assignmentIds: ["a1", "a3"], ...(level === "STATUS" ? {} : { maxTotal: 10 }) },
    ],
    students: [],
    updatedAt: "2026-09-25T07:05:00.000Z",
  };
}

const keys = (columns: { key: string }[]) => columns.map((c) => c.key);

test("assignment mode keeps server order", () => {
  const { columns } = buildProgressColumns(data("SCORE"), "assignment");
  assert.deepEqual(keys(columns), ["a1", "a2", "a3", "s1"]);
});

test("tag mode groups at first position with a subtotal when scores are shown", () => {
  const { columns, segments } = buildProgressColumns(data("SCORE"), "tag");
  assert.deepEqual(keys(columns), ["a1", "a3", "subtotal:Unit 1", "a2", "s1"]);
  assert.equal(segments[0].kind, "group");
});

test("tag mode at STATUS has no subtotal column", () => {
  const { columns } = buildProgressColumns(data("STATUS"), "tag");
  assert.deepEqual(keys(columns), ["a1", "a3", "a2"]);
});

test("collapse is ignored at STATUS so a group never renders zero columns", () => {
  const { columns, segments } = buildProgressColumns(data("STATUS"), "tag", ["Unit 1"]);
  assert.deepEqual(keys(columns), ["a1", "a3", "a2"]);
  assert.equal(segments[0].kind === "group" && segments[0].collapsed, false);
});

test("collapse at SCORE keeps only the subtotal", () => {
  const { columns } = buildProgressColumns(data("SCORE"), "tag", ["Unit 1"]);
  assert.deepEqual(keys(columns), ["subtotal:Unit 1", "a2", "s1"]);
});

function student(number: string, firstName: string, lastName: string): PublicProgressStudent {
  return {
    id: number, number, title: "", firstName, lastName, photo: "", blurHash: null,
    submittedCount: 0, assignedCount: 0, cells: {},
  };
}

test("filterStudents: trimmed, case-insensitive name; number is a prefix match", () => {
  const list = [
    student("1", "Ann", "Lee"),
    student("10", "Bee", "Kim"),
    student("11", "สมชาย", "ใจดี"),
    student("2", "Cat", "Annis"),
  ];
  assert.deepEqual(filterStudents(list, "  ").map((s) => s.number), ["1", "10", "11", "2"]);
  assert.deepEqual(filterStudents(list, " ann ").map((s) => s.number), ["1", "2"]);
  assert.deepEqual(filterStudents(list, "1").map((s) => s.number), ["1", "10", "11"]);
  assert.deepEqual(filterStudents(list, "ใจดี").map((s) => s.number), ["11"]);
});

test("formatScore keeps integers, 2 decimals otherwise", () => {
  assert.equal(formatScore(8), "8");
  assert.equal(formatScore(7.456), "7.46");
});

test("isUnavailableError is true only for 404 bodies", () => {
  assert.equal(isUnavailableError({ statusCode: 404 }), true);
  assert.equal(isUnavailableError({ statusCode: 500 }), false);
  assert.equal(isUnavailableError(undefined), false);
});
