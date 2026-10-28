import test from "node:test";
import assert from "node:assert/strict";
import { dayKey, monthGrid, statusByDay } from "./attendanceCalendar";

test("monthGrid lays a month out in Sunday-first weeks", () => {
  const oct = monthGrid(2026, 9); // October 2026 starts on a Thursday
  assert.deepEqual(oct[0], [null, null, null, null, 1, 2, 3]);
  assert.equal(oct.length, 5);
  assert.deepEqual(oct[4], [25, 26, 27, 28, 29, 30, 31]);
});

test("monthGrid pads the last week with nulls", () => {
  const nov = monthGrid(2026, 10); // starts Sunday, 30 days
  assert.deepEqual(nov[0], [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(nov[4], [29, 30, null, null, null, null, null]);
});

test("dayKey is the local day", () => {
  assert.equal(dayKey(new Date(2026, 9, 5, 8, 30)), "2026-10-05");
  assert.equal(dayKey(new Date(2026, 0, 1, 23, 59)), "2026-01-01");
});

test("statusByDay keeps the worst status per day and ignores unknown ones", () => {
  const lists = [
    { title: "Present", value: 2, color: "#27AE60" },
    { title: "Late", value: 1, color: "#FFCD1B" },
    { title: "Absent", value: 0, color: "#F04438" },
  ];
  const map = statusByDay(
    [
      { startDate: new Date(2026, 9, 7, 8), status: "Present" },
      { startDate: new Date(2026, 9, 7, 13), status: "Absent" },
      { startDate: new Date(2026, 9, 8, 8), status: "Unknown" },
    ],
    lists,
  );
  assert.deepEqual(map.get("2026-10-07"), { title: "Absent", color: "#F04438" });
  assert.equal(map.has("2026-10-08"), false);
});
