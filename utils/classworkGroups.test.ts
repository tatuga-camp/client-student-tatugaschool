import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupClasswork,
  lockedClassworkIds,
  upNext,
  weekProgress,
  weekRange,
  type GroupableClasswork,
} from "./classworkGroups";

const cw = (
  id: string,
  order: number,
  opts: { status?: string; type?: string; due?: string | null } = {},
): GroupableClasswork => ({
  id,
  order,
  type: (opts.type ?? "Assignment") as never,
  dueDate: opts.due ?? null,
  studentOnAssignment: opts.status ? { status: opts.status as never } : null,
});

const lockFixture = () => [
  cw("A", 1, { status: "SUBMITTED" }),
  cw("B", 2, { status: "PENDDING" }),
  cw("M", 3, { type: "Material" }),
  cw("C", 4, { status: "PENDDING" }),
];

test("lock rule: everything after the first unfinished work is locked", () => {
  assert.deepEqual(lockedClassworkIds(lockFixture(), true), new Set(["M", "C"]));
  assert.equal(lockedClassworkIds(lockFixture(), false).size, 0);
});

test("groups come in order, empty ones dropped, no due date is todo", () => {
  const now = new Date("2026-10-28T12:00:00+07:00");
  const items = [
    cw("m", 6, { type: "Material" }),
    cw("g", 5, { status: "REVIEWD" }),
    cw("s", 4, { status: "SUBMITTED" }),
    cw("nodue", 3, { status: "PENDDING" }),
    cw("later", 2, { status: "PENDDING", due: "2026-11-02T12:00:00+07:00" }),
    cw("soon", 1, { status: "PENDDING", due: "2026-10-28T13:00:00+07:00" }),
  ];
  const groups = groupClasswork(items, now, false);
  assert.deepEqual(
    groups.map((g) => g.key),
    ["dueSoon", "todo", "submitted", "graded", "material"],
  );
  assert.deepEqual(groups[0].items.map((i) => i.id), ["soon"]);
  assert.deepEqual(groups[1].items.map((i) => i.id), ["later", "nodue"]);
});

test("an overdue IMPROVED item is due soon", () => {
  const now = new Date("2026-10-28T12:00:00+07:00");
  const groups = groupClasswork(
    [cw("x", 1, { status: "IMPROVED", due: "2026-10-20T12:00:00+07:00" })],
    now,
    false,
  );
  assert.deepEqual(groups.map((g) => g.key), ["dueSoon"]);
});

test("in-order mode returns one ordered group", () => {
  const now = new Date("2026-10-28T12:00:00+07:00");
  const groups = groupClasswork([...lockFixture()].reverse(), now, true);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].key, "ordered");
  assert.deepEqual(groups[0].items.map((i) => i.id), ["A", "B", "M", "C"]);
});

test("weekRange runs Monday to next Monday and Sunday closes the week", () => {
  const wed = weekRange(new Date(2026, 9, 28, 12));
  assert.equal(wed.start.getTime(), new Date(2026, 9, 26).getTime());
  assert.equal(wed.end.getTime(), new Date(2026, 10, 2).getTime());
  const sun = weekRange(new Date(2026, 10, 1, 23, 0));
  assert.equal(sun.start.getTime(), new Date(2026, 9, 26).getTime());
});

test("weekProgress ignores materials and next week, IMPROVED is not done", () => {
  const now = new Date(2026, 9, 28, 12);
  const d = (day: number) => new Date(2026, 9, day, 9).toISOString();
  const items = [
    cw("a", 1, { status: "SUBMITTED", due: d(27) }),
    cw("b", 2, { status: "REVIEWD", due: d(29) }),
    cw("c", 3, { status: "IMPROVED", due: d(30) }),
    cw("d", 4, { status: "PENDDING", due: d(31) }),
    cw("m", 5, { type: "Material", due: d(28) }),
    cw("next", 6, {
      status: "PENDDING",
      due: new Date(2026, 10, 2, 9).toISOString(),
    }),
  ];
  assert.deepEqual(weekProgress(items, now), { done: 2, total: 4 });
});

test("upNext sorts by due date, no date last, never submitted", () => {
  const now = new Date("2026-10-28T12:00:00+07:00");
  const items = [
    cw("nodue", 1, { status: "PENDDING" }),
    cw("tomorrow", 2, { status: "PENDDING", due: "2026-10-29T12:00:00+07:00" }),
    cw("overdue", 3, { status: "IMPROVED", due: "2026-10-20T12:00:00+07:00" }),
    cw("sub", 4, { status: "SUBMITTED", due: "2026-10-19T12:00:00+07:00" }),
  ];
  assert.deepEqual(
    upNext(items, now, false).map((i) => i.id),
    ["overdue", "tomorrow", "nodue"],
  );
});

test("upNext in order returns only the first unfinished work", () => {
  const now = new Date("2026-10-28T12:00:00+07:00");
  assert.deepEqual(upNext(lockFixture(), now, true).map((i) => i.id), ["B"]);
});
