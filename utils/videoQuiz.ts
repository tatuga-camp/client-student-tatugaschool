import type { StudentAssignmentStatus } from "../interfaces";

/** A video quiz answered (part-way or to the end) but not turned in yet. */
export type UnsentVideo = { correct: number; total: number; score: number };

export function dueQuestion<Q extends { id: string; timestamp: number }>(
  questions: Q[],
  now: number,
  answeredIds: string[],
): Q | null {
  return (
    questions.find(
      (q) =>
        Math.abs(q.timestamp - now) < 1 &&
        now > q.timestamp &&
        !answeredIds.includes(q.id),
    ) ?? null
  );
}

export function videoQuizScore(
  maxScore: number,
  questionCount: number,
  correct: number,
): number {
  if (questionCount <= 0) return 0;
  return (maxScore / questionCount) * correct;
}

/** A video quiz's score as the server takes it: final, to 2 decimals. */
export function videoQuizSubmission(score: number) {
  return { status: "REVIEWD" as const, score: Number(score.toFixed(2)) };
}

/**
 * The answers given since the player started (or since a retry or a submit)
 * that are not turned in; none once the work is reviewed.
 */
export function unsentVideo(input: {
  status: StudentAssignmentStatus;
  answered: number;
  correct: number;
  total: number;
  score: number;
}): UnsentVideo | null {
  if (input.status === "REVIEWD" || input.answered === 0) return null;
  return { correct: input.correct, total: input.total, score: input.score };
}

/** What turning in sends: a video quiz with answers turns in its score. */
export function turnInBody(
  status: StudentAssignmentStatus,
  video?: UnsentVideo | null,
) {
  return status === "SUBMITTED" && video
    ? videoQuizSubmission(video.score)
    : { status };
}

export function canSeekTo(input: {
  target: number;
  maxWatched: number;
  preventFastForward: boolean;
  reviewed: boolean;
}): boolean {
  return (
    !input.preventFastForward ||
    input.reviewed ||
    input.target <= input.maxWatched + 0.5
  );
}

/**
 * While fast-forward is locked, a playhead more than a second past what was
 * watched (native controls, keyboard, a lock-screen scrub) is put back.
 */
export function shouldRewind(input: {
  now: number;
  maxWatched: number;
  preventFastForward: boolean;
  reviewed: boolean;
}): boolean {
  return (
    input.preventFastForward &&
    !input.reviewed &&
    input.now > input.maxWatched + 1
  );
}
