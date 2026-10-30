import test from "node:test";
import assert from "node:assert/strict";
import {
  canSeekTo,
  dueQuestion,
  shouldRewind,
  turnInBody,
  unsentVideo,
  videoQuizScore,
  videoQuizSubmission,
} from "./videoQuiz";

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
  assert.equal(
    canSeekTo({ ...base, target: 25, preventFastForward: false }),
    true,
  );
});

test("shouldRewind catches a jump past what was watched, only while locked", () => {
  const base = { maxWatched: 20, preventFastForward: true, reviewed: false };
  assert.equal(shouldRewind({ ...base, now: 20.5 }), false);
  assert.equal(shouldRewind({ ...base, now: 21 }), false);
  assert.equal(shouldRewind({ ...base, now: 21.2 }), true);
  assert.equal(shouldRewind({ ...base, now: 60 }), true);
  assert.equal(shouldRewind({ ...base, now: 60, reviewed: true }), false);
  assert.equal(
    shouldRewind({ ...base, now: 60, preventFastForward: false }),
    false,
  );
});

test("a video quiz score goes in as final, to 2 decimals", () => {
  assert.deepEqual(videoQuizSubmission(10 / 3), {
    status: "REVIEWD",
    score: 3.33,
  });
});

const progress = { answered: 2, correct: 1, total: 5, score: 2 };

test("answers given and not turned in are unsent, until reviewed", () => {
  assert.deepEqual(unsentVideo({ ...progress, status: "PENDDING" }), {
    correct: 1,
    total: 5,
    score: 2,
  });
  // Marked done earlier without a score: the answers still need sending.
  assert.notEqual(unsentVideo({ ...progress, status: "SUBMITTED" }), null);
  assert.equal(unsentVideo({ ...progress, status: "REVIEWD" }), null);
  assert.equal(
    unsentVideo({ ...progress, answered: 0, correct: 0, status: "PENDDING" }),
    null,
  );
});

test("turning in a video quiz with answers sends its score, not SUBMITTED", () => {
  const video = { correct: 1, total: 5, score: 2 };
  assert.deepEqual(turnInBody("SUBMITTED", video), {
    status: "REVIEWD",
    score: 2,
  });
  assert.deepEqual(turnInBody("SUBMITTED", null), { status: "SUBMITTED" });
  // Undoing a turn-in never carries a score.
  assert.deepEqual(turnInBody("PENDDING", video), { status: "PENDDING" });
});
