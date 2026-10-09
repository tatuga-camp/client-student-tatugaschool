import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdCheckCircle, MdCloudOff, MdSync } from "react-icons/md";
import Swal from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import { useQuizAutosave } from "../../hook/useQuizAutosave";
import { Language, QuizAnswerDraft, StudentQuizView } from "../../interfaces";
import { answeredIds, clockOffset, emptyAnswer, formatCountdown, remainingMs } from "../../utils/quizTake";
import QuizQuestionView from "./QuizQuestionView";

type Props = {
  soaId: string;
  view: StudentQuizView;
  /** Client time (ms) when `view` was fetched: the query's dataUpdatedAt. */
  fetchedAt: number;
  language: Language;
  submitting: boolean;
  onSubmit: (options?: { quiet?: boolean }) => Promise<boolean>;
  onClosed: () => void;
};

const AUTO_SUBMIT_RETRY_MS = 5_000;

export default function QuizTakeScreen({ soaId, view, fetchedAt, language, submitting, onSubmit, onClosed }: Props) {
  const questions = view.questions;
  const [index, setIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [answers, setAnswers] = useState<Map<string, QuizAnswerDraft>>(
    () => new Map(view.answers.map((a) => [a.questionId, { selectedOptionIds: a.selectedOptionIds, blankAnswers: a.blankAnswers }])),
  );
  const autosave = useQuizAutosave(soaId, () => onClosed());
  // offset = serverNow - clientNowAtFetch; recomputed whenever a refetch brings a new serverNow.
  const offset = useMemo(() => clockOffset(view.serverNow, fetchedAt), [view.serverNow, fetchedAt]);
  const [now, setNow] = useState(Date.now());
  const autoSubmitted = useRef(false);
  const retryTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(retryTimer.current);
    };
  }, []);

  const left = remainingMs(view.attempt?.deadlineAt ?? null, offset, now);
  const answered = useMemo(() => answeredIds(answers), [answers]);
  const question = questions[index];

  const submit = async (force = false, quiet = false) => {
    const savedAll = await autosave.flush();
    if (!savedAll && !force) {
      const answer = await Swal.fire({
        text: quizLanguage.submitAnyway(language),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: quizLanguage.submit(language),
        cancelButtonText: quizLanguage.cancel(language),
      });
      if (!answer.isConfirmed) return;
    }
    return onSubmit({ quiet });
  };

  useEffect(() => {
    if (left !== null && left <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      if (!retryTimer.current) Swal.fire({ text: quizLanguage.timeUp(language), showConfirmButton: false, timer: 2500 });
      void submit(true, true).then((ok) => {
        // Network down at the deadline: try again shortly instead of sitting on 00:00.
        if (ok === false) {
          retryTimer.current = window.setTimeout(() => {
            autoSubmitted.current = false;
            setNow(Date.now());
          }, AUTO_SUBMIT_RETRY_MS);
        }
      });
    }
  }, [left]);

  const change = (next: QuizAnswerDraft) => {
    setAnswers((prev) => new Map(prev).set(question.id, next));
    autosave.queue(question.id, next);
  };

  const confirmSubmit = async () => {
    const answer = await Swal.fire({
      text: quizLanguage.submitConfirm(language),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: quizLanguage.submit(language),
      cancelButtonText: quizLanguage.cancel(language),
    });
    if (answer.isConfirmed) {
      setReviewOpen(false);
      await submit();
    }
  };

  const saveBadge =
    autosave.state === "saving" ? (
      <span className="flex items-center gap-1 text-icon-color/60"><MdSync className="animate-spin" /> {quizLanguage.saving(language)}</span>
    ) : autosave.state === "error" ? (
      <span className="flex items-center gap-1 text-error-color"><MdCloudOff /> {quizLanguage.notSaved(language)}</span>
    ) : autosave.state === "saved" ? (
      <span className="flex items-center gap-1 text-success-color"><MdCheckCircle /> {quizLanguage.saved(language)}</span>
    ) : null;

  if (!question) return null;
  const unanswered = questions.map((q, i) => ({ q, i })).filter(({ q }) => !answered.has(q.id));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col font-Anuphan">
      <header className="sticky top-0 z-10 flex flex-col gap-2 border-b border-gray-100 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-icon-color">{quizLanguage.questionOf(language, index + 1, questions.length)}</span>
          <span className="text-xs">{saveBadge}</span>
          {left !== null && (
            <span
              aria-label={quizLanguage.timeLeft(language)}
              className={`rounded-full px-3 py-1 font-semibold tabular-nums ${
                left < 60_000 ? "bg-error-color/10 text-error-color" : "bg-primary-color/10 text-primary-color"
              }`}
            >
              {formatCountdown(left)}
            </span>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-primary-color transition-all" style={{ width: `${(answered.size / questions.length) * 100}%` }} />
        </div>
        <nav className="flex gap-1.5 overflow-x-auto pb-1" aria-label={quizLanguage.questionsNav(language)}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={quizLanguage.goToQuestion(language, i + 1)}
              aria-current={i === index}
              className={`h-8 min-w-8 rounded-full text-xs font-semibold ${
                i === index
                  ? "bg-primary-color text-white"
                  : answered.has(q.id)
                    ? "bg-primary-color/15 text-primary-color"
                    : "bg-gray-100 text-icon-color/60"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase text-icon-color/50">
          <span>
            {question.type === "FILL_BLANK"
              ? quizLanguage.typeFillBlank(language)
              : question.type === "MULTIPLE"
                ? quizLanguage.typeMultiple(language)
                : quizLanguage.typeSingle(language)}
          </span>
          <span>{quizLanguage.points(language, question.points)}</span>
        </div>
        <QuizQuestionView question={question} answer={answers.get(question.id) ?? emptyAnswer()} onChange={change} language={language} />
      </main>

      <footer className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="flex-1 rounded-2xl border border-gray-200 py-3 font-medium text-icon-color disabled:opacity-40"
        >
          {quizLanguage.previous(language)}
        </button>
        {index < questions.length - 1 ? (
          <button type="button" onClick={() => setIndex((i) => i + 1)} className="flex-1 rounded-2xl bg-primary-color py-3 font-medium text-white">
            {quizLanguage.next(language)}
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => setReviewOpen(true)}
            className="flex-1 rounded-2xl bg-primary-color py-3 font-medium text-white disabled:opacity-50"
          >
            {quizLanguage.review(language)}
          </button>
        )}
      </footer>

      {reviewOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={() => setReviewOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <h2 className="mb-3 font-semibold text-icon-color">{quizLanguage.unansweredTitle(language)}</h2>
            {unanswered.length === 0 ? (
              <p className="mb-4 text-sm text-success-color">{quizLanguage.allAnswered(language)}</p>
            ) : (
              <div className="mb-4 flex flex-wrap gap-2">
                {unanswered.map(({ q, i }) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      setReviewOpen(false);
                    }}
                    className="rounded-full bg-warning-color/15 px-3 py-1 text-sm font-medium text-icon-color"
                  >
                    {quizLanguage.goToQuestion(language, i + 1)}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={confirmSubmit}
              className="w-full rounded-2xl bg-primary-color py-3 font-semibold text-white disabled:opacity-50"
            >
              {quizLanguage.submit(language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
