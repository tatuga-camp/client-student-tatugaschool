import Image from "next/image";
import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { Subject } from "../../interfaces";
import { defaultCanvas } from "../../data";
import { subjectsPageLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

type SubjectWithStatus = Subject & {
  status: "complete" | "uncomplete";
};

type Props = {
  subject: SubjectWithStatus;
  onOpen: () => void;
};

/**
 * Dense subject row — Tatuga brand + mobile list/card feel (Mobbin-style).
 * Horizontal thumb + meta instead of tall image cards.
 */
function SubjectListCard({ subject, onOpen }: Props) {
  const language = useGetLanguage();
  const lang = (language.data ?? "en") as "th" | "en";
  const isComplete = subject.status === "complete";
  const isTodo = subject.status === "uncomplete";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-stretch gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 text-left shadow-sm transition-all duration-200 hover:border-primary-color/30 hover:shadow-md active:scale-[0.99] sm:gap-4 sm:p-3"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-color sm:h-24 sm:w-24">
        {subject.backgroundImage ? (
          <Image
            src={subject.backgroundImage}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={subject.blurHash || defaultCanvas}
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-color to-secondary-color" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-primary-color/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-color">
            {subject.code}
          </span>
          {isComplete ? (
            <span className="inline-flex items-center rounded-full bg-success-color/10 px-2 py-0.5 text-[10px] font-semibold text-success-color">
              {subjectsPageLanguage.done(lang)}
            </span>
          ) : null}
          {isTodo ? (
            <span className="inline-flex items-center rounded-full bg-error-color/10 px-2 py-0.5 text-[10px] font-semibold text-error-color">
              {subjectsPageLanguage.todo(lang)}
            </span>
          ) : null}
        </div>

        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-primary-color sm:text-base">
          {subject.title}
        </h2>

        {subject.description ? (
          <p className="line-clamp-1 text-xs text-gray-500 sm:text-sm">
            {subject.description}
          </p>
        ) : null}

        <p className="text-[11px] font-medium text-gray-400">
          {subjectsPageLanguage.year(lang)} {subject.educationYear}
        </p>
      </div>

      <div className="flex shrink-0 items-center pr-1 text-gray-300 transition-colors group-hover:text-primary-color">
        <FaChevronRight className="text-sm" aria-hidden />
        <span className="sr-only">{subjectsPageLanguage.enter(lang)}</span>
      </div>
    </button>
  );
}

export default SubjectListCard;
