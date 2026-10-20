import Image from "next/image";
import React, { useState } from "react";
import { BsChatDots } from "react-icons/bs";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import { MdComputer } from "react-icons/md";
import { RiLightbulbLine, RiPaintBrushLine } from "react-icons/ri";
import { defaultBlurHash } from "../../data";
import { careerLanguage } from "../../data/languages/career";
import { useGetLanguage, useGetMyCareerSuggestion } from "../../react-query";
import { NOT_ENOUGH_CAREER_DATA } from "../../services";
import { decodeBlurhashToCanvas } from "../../utils";
import {
  keySkills,
  localizeSkillTitle,
  sectorForCareer,
  strengthIds,
  summarizeSkills,
} from "../../utils/careerReport";

// Icon and color per skill family; unknown skills get the neutral style.
const getSkillStyles = (skillTitle: string) => {
  const title = skillTitle.toLowerCase();
  if (title.includes("leadership"))
    return { icon: <FaUserTie />, tint: "text-orange-500 bg-orange-100" };
  if (title.includes("communication"))
    return { icon: <BsChatDots />, tint: "text-blue-500 bg-blue-100" };
  if (title.includes("critical thinking"))
    return { icon: <RiLightbulbLine />, tint: "text-purple-500 bg-purple-100" };
  if (title.includes("digital literacy"))
    return { icon: <MdComputer />, tint: "text-red-500 bg-red-100" };
  if (title.includes("creativity"))
    return { icon: <RiPaintBrushLine />, tint: "text-yellow-600 bg-yellow-100" };
  if (title.includes("collaboration"))
    return { icon: <FaUsers />, tint: "text-green-600 bg-green-100" };
  return { icon: <RiLightbulbLine />, tint: "text-icon-color/70 bg-background-color" };
};

const VISIBLE_CAREERS = 3;

export default function MyCareerSuggest() {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const careers = useGetMyCareerSuggestion();
  const [showAll, setShowAll] = useState(false);

  const message = (title: string, body?: string, action?: React.ReactNode) => (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-10 text-center ring-1 ring-icon-color/10">
        <p className="font-semibold text-icon-color">{title}</p>
        {body && <p className="max-w-sm text-sm text-icon-color/70">{body}</p>}
        {action}
      </div>
    </section>
  );

  if (careers.isLoading) {
    return (
      <section className="flex animate-pulse flex-col gap-4">
        <div className="h-28 rounded-2xl bg-white" />
        <div className="h-36 rounded-2xl bg-white" />
        <div className="h-40 rounded-2xl bg-white" />
      </section>
    );
  }

  if (careers.error?.message === NOT_ENOUGH_CAREER_DATA) {
    return message(
      careerLanguage.notEnoughData(lang),
      careerLanguage.notEnoughDataBody(lang),
    );
  }

  if (careers.error) {
    return message(
      careerLanguage.loadError(lang),
      undefined,
      <button
        type="button"
        onClick={() => careers.refetch()}
        className="mt-2 h-10 rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover"
      >
        {careerLanguage.tryAgain(lang)}
      </button>,
    );
  }

  const allCareers = careers.data?.careers ?? [];
  if (allCareers.length === 0) {
    return message(careerLanguage.noCareers(lang));
  }

  const studentSkills = careers.data?.student.skills ?? [];
  const { strongest, toGrow } = summarizeSkills(studentSkills);
  const strengths = strengthIds(studentSkills);
  const strongerSkillText = careerLanguage.strongerSkill(lang);
  const topSector = sectorForCareer(allCareers[0].title, lang);
  const shown = showAll ? allCareers : allCareers.slice(0, VISIBLE_CAREERS);
  const hiddenCount = allCareers.length - VISIBLE_CAREERS;

  const skillChip = (skill: { id: string; title: string }) => {
    const styles = getSkillStyles(skill.title);
    return (
      <li
        key={skill.id}
        className="flex items-center gap-2 text-sm font-medium text-icon-color"
      >
        <span
          aria-hidden
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.tint}`}
        >
          {styles.icon}
        </span>
        {localizeSkillTitle(skill.title, lang)}
      </li>
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-icon-color/10 sm:p-5">
        <h2 className="text-lg font-bold leading-snug text-icon-color">
          {careerLanguage.heading(lang)}
        </h2>
        <p className="mt-1 text-sm text-icon-color/60">
          {careerLanguage.source(lang)}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {strongest.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-success-color">
                {careerLanguage.strongestSkills(lang)}
              </h3>
              <ul className="flex flex-col gap-2">{strongest.map(skillChip)}</ul>
            </div>
          )}
          {toGrow.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-icon-color/70">
                {careerLanguage.skillsToGrow(lang)}
              </h3>
              <ul className="flex flex-col gap-2">{toGrow.map(skillChip)}</ul>
            </div>
          )}
        </div>
      </div>

      {topSector && (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-icon-color/10">
          <div className="relative h-36 w-full bg-background-color">
            <Image
              src={topSector.picture}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                topSector.blurHash || defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm font-medium text-icon-color/60">
              {careerLanguage.topMatch(lang)}
            </p>
            <h3 className="mt-0.5 text-lg font-bold text-icon-color">
              {topSector.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-icon-color/70">
              {topSector.description}
            </p>
            <p className="mt-3 text-sm font-medium text-icon-color/60">
              {careerLanguage.exampleJobs(lang)}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {topSector.careers.map((career) => (
                <li
                  key={career.title}
                  title={career.description}
                  className="rounded-full bg-primary-color/10 px-3 py-1 text-xs font-medium text-primary-color"
                >
                  {career.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-bold text-icon-color">
            {careerLanguage.rankedCareers(lang)}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-icon-color/60">
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center rounded-full bg-success-color text-[10px] text-white"
            >
              <FiCheck />
            </span>
            {strongerSkillText}
          </p>
        </div>
        <ol className="flex flex-col gap-3">
          {shown.map((career, index) => {
            const sector = sectorForCareer(career.title, lang);
            const key = keySkills(career.skills);
            return (
              <li
                key={career.id ?? career.title}
                className="rounded-2xl bg-white p-4 ring-1 ring-icon-color/10"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-sm font-bold text-primary-color">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold leading-snug text-icon-color">
                      {sector?.title ?? career.title}
                    </h4>
                    {sector && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-icon-color/60">
                        {sector.description}
                      </p>
                    )}
                  </div>
                </div>
                {key.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-icon-color/60">
                      {careerLanguage.keySkillsHeading(lang)}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {key.map((skill) => {
                        const strong = strengths.has(skill.id);
                        const styles = getSkillStyles(skill.title);
                        return (
                          <li
                            key={skill.id}
                            className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm font-medium ${
                              strong
                                ? "bg-success-color/10 text-success-color ring-1 ring-success-color/30"
                                : "bg-background-color text-icon-color"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                strong ? "bg-success-color text-white" : styles.tint
                              }`}
                            >
                              {strong ? <FiCheck /> : styles.icon}
                            </span>
                            {localizeSkillTitle(skill.title, lang)}
                            {strong && (
                              <span className="sr-only">. {strongerSkillText}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
            className="mt-3 h-10 w-full rounded-xl border border-icon-color/15 bg-white text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
          >
            {showAll
              ? careerLanguage.showLess(lang)
              : careerLanguage.showMore(lang, hiddenCount)}
          </button>
        )}
      </div>
    </section>
  );
}
