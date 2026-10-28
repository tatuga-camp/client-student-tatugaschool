import React, { useState } from "react";
import { LuBookOpen, LuChevronDown } from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import { useGetLanguage, useGetSubjectById } from "../../react-query";
import { SubjectSwitcherSheet } from "./SubjectSwitcherSheet";

/** The open subject as a chunky chip; tapping it opens the quick switcher. */
export function SubjectChip({ subjectId }: { subjectId: string }) {
  const subject = useGetSubjectById({ id: subjectId });
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [open, setOpen] = useState(false);
  const title = subject.data?.title ?? "";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${homeLanguage.switchSubject(lang)}: ${title}`}
        className="flex h-9 min-w-0 items-center gap-1.5 rounded-[13px] border-2 border-b-4 border-[#E3E8F0] bg-white px-2.5 font-Anuphan text-[13px] font-bold text-icon-color [-webkit-tap-highlight-color:transparent] active:translate-y-px active:border-b-2"
      >
        <LuBookOpen aria-hidden size={15} className="shrink-0 text-primary-color" />
        <span className="max-w-[150px] truncate">{title || "…"}</span>
        <LuChevronDown aria-hidden size={15} className="shrink-0" />
      </button>
      <SubjectSwitcherSheet
        open={open}
        onClose={() => setOpen(false)}
        subjectId={subjectId}
      />
    </>
  );
}
