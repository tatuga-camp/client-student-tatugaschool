import React, { useEffect, useRef } from "react";
import { LuArrowRight, LuCheck, LuRotateCcw } from "react-icons/lu";
import { assignmentPageLanguage } from "../../../data/languages";
import { Language } from "../../../interfaces";

type Props = {
  lang: Language;
  correct: number;
  total: number;
  /** A reviewed quiz can't be submitted again. */
  reviewed: boolean;
  /** Where "Next video" goes, if there is a next assignment. */
  onNext?: () => void;
  onRetry: () => void;
  onSubmit: () => void;
};

/** "x / y correct" with Retry, and Submit work (or Next video once reviewed). */
export default function VideoEndScreen({
  lang,
  correct,
  total,
  reviewed,
  onNext,
  onRetry,
  onSubmit,
}: Props) {
  const t = assignmentPageLanguage;
  const firstRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
  }, []);
  const secondary =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border-2 border-b-4 border-[#E3E8F0] bg-white text-[13px] font-bold text-icon-color active:translate-y-0.5";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.videoCompleted(lang)}
      data-no-swipe
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4 font-Anuphan"
    >
      <div className="flex w-full max-w-sm flex-col items-center rounded-[24px] bg-white p-6 text-center text-icon-color shadow-2xl">
        <h2 className="text-xl font-bold">{t.videoCompleted(lang)}</h2>
        <p className="mt-3 text-xs font-semibold text-[#5B6280]">
          {t.youScored(lang)}
        </p>
        <p className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-primary-color">
            {correct}
          </span>
          <span className="text-2xl text-[#9AA3B8]">/ {total}</span>
        </p>
        <p className="mb-5 text-xs font-semibold text-[#5B6280]">
          {t.questionsCorrect(lang)}
        </p>
        <div className="flex w-full gap-2">
          <button
            ref={firstRef}
            type="button"
            onClick={onRetry}
            className={secondary}
          >
            <LuRotateCcw aria-hidden />
            {t.retry(lang)}
          </button>
          {reviewed ? (
            onNext && (
              <button type="button" onClick={onNext} className={secondary}>
                <LuArrowRight aria-hidden />
                {t.nextVideo(lang)}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              className="chunky-btn h-12 flex-1"
            >
              <LuCheck aria-hidden />
              {t.submitWork(lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
