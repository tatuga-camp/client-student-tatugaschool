import React from "react";
import { LuArchive } from "react-icons/lu";
import { subjectHomeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";

/** Shown on every page of an archived subject: look, but nothing changes. */
export default function ArchivedBanner({
  lang,
  className = "mt-2",
}: {
  lang: Language;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`mx-3 ${className} flex items-start gap-2 rounded-xl bg-[#FFF6D6] p-2 font-Anuphan text-[12px] font-bold text-[#8A5E00]`}
    >
      <LuArchive aria-hidden className="mt-0.5 shrink-0 text-base" />
      {subjectHomeLanguage.archivedBanner(lang)}
    </div>
  );
}
