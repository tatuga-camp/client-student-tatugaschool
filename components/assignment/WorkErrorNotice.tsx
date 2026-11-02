import React from "react";
import { LuAlertCircle, LuRotateCw, LuX } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import type { WorkErrorContent } from "../../utils/assignmentDetail";

type Props = {
  lang: Language;
  error: WorkErrorContent;
  /** Sends the same request again. */
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/**
 * A failed work request, shown where it happened: what failed, what to do,
 * the error code in small print, and Try again when it can be repeated.
 */
export default function WorkErrorNotice({
  lang,
  error,
  onRetry,
  onDismiss,
  className = "",
}: Props) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-xl bg-[#FDECEA] p-2 text-[#B42318] ${className}`}
    >
      <LuAlertCircle aria-hidden className="mt-0.5 shrink-0 text-base" />
      <div className="min-w-0 flex-1 text-[12px] leading-snug">
        <p className="font-bold">{error.title}</p>
        <p className="font-semibold">{error.text}</p>
        {error.detail && (
          <p className="mt-0.5 break-words text-[11px] font-semibold opacity-75">
            {error.detail}
          </p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1.5 inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-[#F6C9C4] bg-white px-3 text-[12px] font-bold active:translate-y-px"
          >
            <LuRotateCw aria-hidden />
            {assignmentPageLanguage.tryAgain(lang)}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={assignmentPageLanguage.dismiss(lang)}
          className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-base active:bg-[#F9D7D2]"
        >
          <LuX aria-hidden />
        </button>
      )}
    </div>
  );
}
