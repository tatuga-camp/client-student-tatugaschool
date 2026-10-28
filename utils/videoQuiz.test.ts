import test from "node:test";
import assert from "node:assert/strict";
import { canSeekTo, dueQuestion, videoQuizScore } from "./videoQuiz";

const questions = [
  { id: "q1", timestamp: 10 },
  { id: "q2", timestamp: 30 },
];

test("dueQuestion fires just after the timestamp, once", () => {
  assert.equal(dueQuestion(questions, 10.3, [])?.id, "q1");
  assert.equal(dueQuestion(questions, 9.7, []), null);
  assert.equal(dueQuestion(questions, 10.3, ["q1"]), null);
  assert.equal(dueQuestion(questions, 12, []), null);
  assert.equal(dueQuestion(questions, 30.5, ["q1"])?.id, "q2");
});

test("videoQuizScore is proportional to correct answers", () => {
  assert.equal(videoQuizScore(10, 4, 3), 7.5);
  assert.equal(videoQuizScore(10, 0, 0), 0);
});

test("canSeekTo blocks forward jumps only when fast-forward is prevented and not reviewed", () => {
  const base = { maxWatched: 20, preventFastForward: true, reviewed: false };
  assert.equal(canSeekTo({ ...base, target: 25 }), false);
  assert.equal(canSeekTo({ ...base, target: 20.4 }), true);
  assert.equal(canSeekTo({ ...base, target: 5 }), true);
  assert.equal(canSeekTo({ ...base, target: 25, reviewed: true }), true);
  assert.equal(canSeekTo({ ...base, target: 25, preventFastForward: false }), true);
});
