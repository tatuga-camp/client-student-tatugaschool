import { useCallback, useEffect, useRef, useState } from "react";
import { QuizAnswerDraft } from "../interfaces";
import { SaveQuizAnswerService } from "../services/quiz";
import {
  AutosaveClosedReason,
  AutosaveState,
  createAnswerAutosaver,
} from "../utils/quizAutosave";

type Autosaver = ReturnType<typeof createAnswerAutosaver<QuizAnswerDraft>>;

export function useQuizAutosave(
  soaId: string,
  onClosed: (reason: AutosaveClosedReason) => void,
) {
  const [state, setState] = useState<AutosaveState>("idle");
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;
  const saver = useRef<Autosaver | null>(null);

  // Created in an effect (not during render) so StrictMode's mount/unmount/mount
  // disposes the first instance and leaves a live one.
  useEffect(() => {
    setState("idle");
    const instance = createAnswerAutosaver<QuizAnswerDraft>({
      send: (questionId, answer) =>
        SaveQuizAnswerService(soaId, questionId, answer),
      onState: setState,
      onClosed: (reason) => onClosedRef.current(reason),
      setTimer: (fn, ms) => window.setTimeout(fn, ms),
      clearTimer: (handle) => window.clearTimeout(handle as number),
    });
    saver.current = instance;
    return () => {
      instance.dispose();
      if (saver.current === instance) saver.current = null;
    };
  }, [soaId]);

  const queue = useCallback((questionId: string, answer: QuizAnswerDraft) => {
    saver.current?.queue(questionId, answer);
  }, []);

  /** Saves everything now. Resolves true when nothing is left unsaved. */
  const flush = useCallback(async (timeoutMs = 10_000): Promise<boolean> => {
    return saver.current ? saver.current.flush(timeoutMs) : true;
  }, []);

  return { queue, flush, state };
}
