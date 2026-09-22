import Image from "next/image";
import React from "react";
import { Subject } from "../../interfaces";
import { defaultBlurHash } from "../../data";
import { subjectDataLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = {
  subject: Subject;
};

/**
 * Compact subject summary header — Tatuga brand + mobile list/card feel.
 * Replaces the oversized decorative hero.
 */
function SubjectSummaryCard({ subject }: Props) {
  const language = useGetLanguage();

  return (
    <header className="w-full px-3 pt-16 sm:px-4 md:pt-20">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative flex min-h-[7.5rem] items-end gap-3 bg-primary-color px-4 py-4 sm:min-h-[8.5rem] sm:px-5 sm:py-5">
          {subject.backgroundImage ? (
            <>
              <Image
                src={subject.backgroundImage}
                fill
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  subject.blurHash ?? defaultBlurHash,
                )}
                alt=""
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-color/90 via-primary-color/55 to-primary-color/25" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-color via-primary-color to-secondary-color" />
          )}

          <div className="relative z-10 flex w-full flex-col gap-2">
            <h1 className="line-clamp-2 text-lg font-semibold leading-snug text-white sm:text-xl">
              {subject.title}
            </h1>
            {subject.description ? (
              <p className="line-clamp-2 text-sm text-white/90">
                {subject.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary-color-focus shadow-sm">
                {subjectDataLanguage.educationYear(language.data ?? "en")}:{" "}
                {subject.educationYear}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/40">
                {subjectDataLanguage.code(language.data ?? "en")}: {subject.code}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SubjectSummaryCard;
