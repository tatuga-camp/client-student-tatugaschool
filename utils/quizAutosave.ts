export type AutosaveState = "idle" | "saving" | "saved" | "error";
export type AutosaveClosedReason = "QUIZ_CLOSED" | "QUIZ_NOT_STARTED";

export const AUTOSAVE_DEBOUNCE_MS = 600;
export const AUTOSAVE_MAX_BACKOFF_MS = 30_000;
export const AUTOSAVE_FLUSH_PAUSE_MS = 1000;

export function autosaveBackoffMs(attempt: number): number {
  return Math.min(AUTOSAVE_MAX_BACKOFF_MS, 1000 * 2 ** (Math.max(1, attempt) - 1));
}

type TimerHandle = unknown;

/**
 * Framework-free answer autosaver used by `useQuizAutosave`.
 *
 * - Saves are serialized per question: a new PUT for a question only goes out
 *   after the previous one settled, and it always sends the latest answer, so
 *   a stalled older request can never land after (and overwrite) a newer one.
 * - The state is "error" while any question's last save failed, even if other
 *   questions are saving fine.
 * - After `dispose()` nothing is sent, no retry is armed and no callback fires.
 */
export function createAnswerAutosaver<A>(deps: {
  send: (questionId: string, answer: A) => Promise<unknown>;
  onState: (state: AutosaveState) => void;
  onClosed: (reason: AutosaveClosedReason) => void;
  setTimer: (fn: () => void, ms: number) => TimerHandle;
  clearTimer: (handle: TimerHandle) => void;
  now?: () => number;
}) {
  const now = deps.now ?? (() => Date.now());
  const pending = new Map<string, A>();
  const timers = new Map<string, TimerHandle>();
  const attempts = new Map<string, number>();
  const chains = new Map<string, Promise<void>>();
  const sending = new Set<string>();
  const failed = new Set<string>();
  let closed = false;
  let disposed = false;
  let flushing = 0;

  const stopped = () => closed || disposed;

  const emit = () => {
    if (disposed) return;
    if (failed.size > 0) deps.onState("error");
    else if (pending.size > 0 || sending.size > 0) deps.onState("saving");
    else deps.onState("saved");
  };

  const clearTimerFor = (questionId: string) => {
    if (!timers.has(questionId)) return;
    deps.clearTimer(timers.get(questionId));
    timers.delete(questionId);
  };

  const clearAllTimers = () => {
    timers.forEach((t) => deps.clearTimer(t));
    timers.clear();
  };

  const arm = (questionId: string, ms: number) => {
    clearTimerFor(questionId);
    timers.set(
      questionId,
      deps.setTimer(() => {
        timers.delete(questionId);
        void save(questionId);
      }, ms),
    );
  };

  const attempt = async (questionId: string): Promise<void> => {
    const answer = pending.get(questionId);
    if (answer === undefined || stopped()) return;
    sending.add(questionId);
    emit();
    try {
      await deps.send(questionId, answer);
      if (pending.get(questionId) === answer) pending.delete(questionId);
      attempts.delete(questionId);
      failed.delete(questionId);
    } catch (error: any) {
      const message = error?.message;
      if (message === "QUIZ_CLOSED" || message === "QUIZ_NOT_STARTED") {
        const wasStopped = stopped();
        closed = true;
        pending.clear();
        failed.clear();
        clearAllTimers();
        if (!wasStopped) deps.onClosed(message);
        return;
      }
      failed.add(questionId);
      const n = (attempts.get(questionId) ?? 0) + 1;
      attempts.set(questionId, n);
      // flush() runs its own retry loop and re-arms leftovers when it ends.
      if (!stopped() && flushing === 0) arm(questionId, autosaveBackoffMs(n));
    } finally {
      sending.delete(questionId);
      emit();
    }
  };

  /** Sends the latest pending answer for a question, after any in-flight save for it. */
  const save = (questionId: string): Promise<void> => {
    const prev = chains.get(questionId) ?? Promise.resolve();
    const run = prev.then(() => attempt(questionId));
    chains.set(questionId, run);
    void run.finally(() => {
      if (chains.get(questionId) === run) chains.delete(questionId);
    });
    return run;
  };

  const queue = (questionId: string, answer: A) => {
    if (stopped()) return;
    pending.set(questionId, answer);
    emit();
    arm(questionId, AUTOSAVE_DEBOUNCE_MS);
  };

  /** flush()'s own waits; tracked so they never outlive flush or dispose. */
  const sleeps = new Map<TimerHandle, () => void>();
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const handle = deps.setTimer(() => {
        sleeps.delete(handle);
        resolve();
      }, ms);
      sleeps.set(handle, resolve);
    });
  /** Cancels flush's waits and resolves them, so an awaiting flush never hangs. */
  const cancelSleeps = () => {
    sleeps.forEach((resolve, handle) => {
      deps.clearTimer(handle);
      resolve();
    });
    sleeps.clear();
  };

  /** Saves everything now. Resolves true when nothing is left unsaved. */
  const flush = async (timeoutMs = 10_000): Promise<boolean> => {
    flushing++;
    try {
      clearAllTimers();
      const deadline = now() + timeoutMs;
      while (pending.size > 0 && !stopped() && now() < deadline) {
        const round = Promise.all([...pending.keys()].map((id) => save(id)));
        // A stalled request must not hold flush past its deadline.
        await Promise.race([round, sleep(Math.max(0, deadline - now()))]);
        if (pending.size > 0 && now() < deadline) await sleep(Math.min(AUTOSAVE_FLUSH_PAUSE_MS, deadline - now()));
      }
      return pending.size === 0;
    } finally {
      flushing--;
      if (flushing === 0) cancelSleeps();
      if (flushing === 0 && !stopped()) {
        pending.forEach((_, id) => {
          if (!timers.has(id) && !sending.has(id)) arm(id, autosaveBackoffMs(attempts.get(id) ?? 1));
        });
      }
    }
  };

  const dispose = () => {
    disposed = true;
    clearAllTimers();
    cancelSleeps();
  };

  return { queue, flush, dispose };
}
