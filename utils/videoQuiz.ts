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
