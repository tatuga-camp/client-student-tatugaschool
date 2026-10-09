import { test } from "node:test";
import assert from "node:assert/strict";
import { answeredIds, clockOffset, emptyAnswer, formatCountdown, isAnswered, promptSegments, remainingMs } from "./quizTake";

test("isAnswered / answeredIds", () => {
  assert.equal(isAnswered(emptyAnswer()), false);
  assert.equal(isAnswered({ selectedOptionIds: [], blankAnswers: [{ blankId: "x", value: "  " }] }), false);
  assert.equal(isAnswered({ selectedOptionIds: ["a"], blankAnswers: [] }), true);
  const ids = answeredIds(new Map([["q1", { selectedOptionIds: ["a"], blankAnswers: [] }], ["q2", emptyAnswer()]]));
  assert.deepEqual([...ids], ["q1"]);
});

test("promptSegments", () => {
  assert.deepEqual(promptSegments("เมืองหลวงคือ{{b1}}ครับ"), [
    { kind: "text", text: "เมืองหลวงคือ" },
    { kind: "blank", blankId: "b1" },
    { kind: "text", text: "ครับ" },
  ]);
});

test("countdown uses the server clock", () => {
  const offset = clockOffset("2026-10-09T03:00:10.000Z", Date.parse("2026-10-09T03:00:00.000Z"));
  assert.equal(offset, 10_000); // client is 10 s behind
  const left = remainingMs("2026-10-09T03:05:00.000Z", offset, Date.parse("2026-10-09T03:00:00.000Z"));
  assert.equal(left, 290_000);
  assert.equal(remainingMs(null, offset, 0), null);
});

test("formatCountdown", () => {
  assert.equal(formatCountdown(290_000), "4:50");
  assert.equal(formatCountdown(3_725_000), "1:02:05");
  assert.equal(formatCountdown(-5), "0:00");
});
