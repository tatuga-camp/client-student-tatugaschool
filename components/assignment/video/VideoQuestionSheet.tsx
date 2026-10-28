import React, { useEffect, useRef } from "react";
import { LuCheckCircle2, LuXCircle } from "react-icons/lu";
import { assignmentPageLanguage } from "../../../data/languages";
import { Language, QuestionOnVideo } from "../../../interfaces";
import { FEEDBACK_MS } from "./useVideoQuiz";

type Props = {
  lang: Language;
  question: QuestionOnVideo;
  index: number;
  total: number;
  feedback: "correct" | "incorrect" | null;
  selected: number | null;
  onAnswer: (optionIndex: number) => void;
};

/**
 * The question, as a sheet sliding up INSIDE the player (never portalled, so
 * it stays visible in element fullscreen). Focus goes to the first answer
 * and Esc can't skip the question.
 */
export default function VideoQuestionSheet({
  lang,
  question,
  index,
  total,
  feedback,
  selected,
  onAnswer,
}: Props) {
  const t = assignmentPageLanguage;
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sheetRef.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
  }, [question.id]);

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={question.question}
      data-no-swipe
      onKeyDown={(e) => {
        // The question can't be skipped: Esc (which would close a sheet or
        // leave fullscreen elsewhere) does nothing here.
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="absolute inset-x-0 bottom-0 z-30 max-h-[65%] overflow-y-auto rounded-t-[24px] bg-white px-4 pt-2 font-Anuphan text-icon-color"
      style={{
        boxShadow: "0 -6px 24px rgba(0,0,0,.25)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
      }}
    >
      <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#D6DBE6]" />
      <p className="mb-1 text-center text-[11px] font-bold text-[#7A80A0]">
        {t.questionOfCount(lang, index + 1, total)}
      </p>
      <h3 className="mb-3 text-center text-[17px] font-bold leading-snug">
        {question.question}
      </h3>
      <div className="flex flex-col gap-2">
        {question.options.map((option, idx) => {
          const isRight = question.correctOptions.includes(idx);
          const showRight = feedback !== null && isRight;
          const showWrong =
            feedback === "incorrect" && selected === idx && !isRight;
          const tone = showRight
            ? "border-[#27AE60] bg-[#D7F5E3] text-[#1E6B3F]"
            : showWrong
              ? "border-[#F04438] bg-[#FDECEA] text-[#B42318]"
              : feedback
                ? "border-[#E3E8F0] bg-white text-[#9AA3B8] opacity-60"
                : "border-[#E3E8F0] bg-white text-icon-color active:translate-y-0.5";
          return (
            <button
              key={idx}
              type="button"
              disabled={feedback !== null}
              onClick={() => onAnswer(idx)}
              className={`flex min-h-[48px] items-center justify-between gap-2 rounded-[14px] border-2 border-b-4 px-4 py-2 text-left text-[14px] font-bold ${tone}`}
            >
              <span className="min-w-0">{option}</span>
              {showRight && (
                <LuCheckCircle2 aria-hidden className="shrink-0 text-xl" />
              )}
              {showWrong && (
                <LuXCircle aria-hidden className="shrink-0 text-xl" />
              )}
            </button>
          );
        })}
      </div>
      {feedback && (
        <div
          role="status"
          className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold ${
            feedback === "correct"
              ? "bg-[#D7F5E3] text-[#1E6B3F]"
              : "bg-[#FDECEA] text-[#B42318]"
          }`}
        >
          {feedback === "correct" ? (
            <LuCheckCircle2 aria-hidden />
          ) : (
            <LuXCircle aria-hidden />
          )}
          {feedback === "correct"
            ? t.correctFeedback(lang)
            : t.incorrectFeedback(lang)}
        </div>
      )}
      {feedback && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
          <div
            className="tg-countdown h-full bg-primary-color"
            style={{ animationDuration: `${FEEDBACK_MS}ms` }}
          />
        </div>
      )}
    </div>
  );
}
