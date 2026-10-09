import { useCallback, useEffect, useRef, useState } from "react";
import { QuizAnswerDraft } from "../interfaces";
import { SaveQuizAnswerService } from "../services/quiz";

type SaveState = "idle" | "saving" | "saved" | "error";
type ClosedReason = "QUIZ_CLOSED" | "QUIZ_NOT_STARTED";

const DEBOUNCE_MS = 600;
const MAX_BACKOFF_MS = 30_000;

export function useQuizAutosave(soaId: string, onClosed: (reason: ClosedReason) => void) {
  const pending = useRef(new Map<string, QuizAnswerDraft>());
  const timers = useRef(new Map<string, number>());
  const attempts = useRef(new Map<string, number>());
  const closed = useRef(false);
  const [state, setState] = useState<SaveState>("idle");
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  const save = useCallback(
    async (questionId: string): Promise<void> => {
      const answer = pending.current.get(questionId);
      if (!answer || closed.current) return;
      setState("saving");
      try {
        await SaveQuizAnswerService(soaId, questionId, answer);
        if (pending.current.get(questionId) === answer) pending.current.delete(questionId);
        attempts.current.delete(questionId);
        setState(pending.current.size > 0 ? "saving" : "saved");
      } catch (error: any) {
        const message = error?.message;
        if (message === "QUIZ_CLOSED" || message === "QUIZ_NOT_STARTED") {
          closed.current = true;
          pending.current.clear();
          onClosedRef.current(message);
          return;
        }
        setState("error");
        const n = (attempts.current.get(questionId) ?? 0) + 1;
        attempts.current.set(questionId, n);
        const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** (n - 1));
        window.clearTimeout(timers.current.get(questionId));
        timers.current.set(questionId, window.setTimeout(() => void save(questionId), delay));
      }
    },
    [soaId],
  );

  const queue = useCallback(
    (questionId: string, answer: QuizAnswerDraft) => {
      if (closed.current) return;
      pending.current.set(questionId, answer);
      setState("saving");
      window.clearTimeout(timers.current.get(questionId));
      timers.current.set(questionId, window.setTimeout(() => void save(questionId), DEBOUNCE_MS));
    },
    [save],
  );

  /** Saves everything now. Resolves true when nothing is left unsaved. */
  const flush = useCallback(
    async (timeoutMs = 10_000): Promise<boolean> => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current.clear();
      const deadline = Date.now() + timeoutMs;
      while (pending.current.size > 0 && !closed.current && Date.now() < deadline) {
        await Promise.all([...pending.current.keys()].map((id) => save(id)));
        if (pending.current.size > 0) await new Promise((r) => setTimeout(r, 1000));
      }
      return pending.current.size === 0;
    },
    [save],
  );

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return { queue, flush, state };
}
