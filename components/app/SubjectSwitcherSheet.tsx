import React from "react";
import {
  LuBookOpen,
  LuCheck,
  LuChevronRight,
  LuLayoutGrid,
} from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
  useGetSubjectByStudent,
} from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { Sheet } from "./Sheet";
import { useShellNav } from "./shell/useShellRoute";

type Props = { open: boolean; onClose: () => void; subjectId: string };

/** Quick list of this year's subjects; the Subjects tab is the full list. */
export function SubjectSwitcherSheet({ open, onClose, subjectId }: Props) {
  const language = useGetLanguage();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      ariaLabel={homeLanguage.switchSubject(language.data ?? "en")}
    >
      {/* Mounted only while the sheet shows, so the list loads on open. */}
      <SwitcherList
        subjectId={subjectId}
        onDone={onClose}
        lang={language.data ?? "en"}
      />
    </Sheet>
  );
}

function SwitcherList({
  subjectId,
  onDone,
  lang,
}: {
  subjectId: string;
  onDone: () => void;
  lang: Language;
}) {
  const nav = useShellNav();
  const student = useGetStudent();
  const subject = useGetSubjectById({ id: subjectId });
  const subjects = useGetSubjectByStudent({
    studentId: student.data?.id ?? "",
    educationYear: subject.data?.educationYear ?? "",
  });
  // The Subjects tab's default order: the teacher's.
  const list = [...(subjects.data ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <div className="font-Anuphan text-icon-color">
      <h2 className="pb-3 text-lg font-bold">{homeLanguage.switchSubject(lang)}</h2>
      {subjects.isLoading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner width="32px" />
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {list.map((s) => {
          const current = s.id === subjectId;
          return (
            <li key={s.id}>
              <button
                type="button"
                aria-current={current ? "true" : undefined}
                onClick={() => {
                  onDone();
                  if (!current) nav.switchSubject(s.id);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 bg-white p-2.5 text-left active:translate-y-px ${
                  current ? "border-primary-color" : "border-[#E3E8F0]"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    current
                      ? "bg-primary-color text-white"
                      : "bg-[#E8F1FD] text-primary-color"
                  }`}
                >
                  <LuBookOpen aria-hidden size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {s.title}
                  </span>
                  {current && (
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-color">
                      <LuCheck aria-hidden size={13} />
                      {homeLanguage.currentSubject(lang)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => {
          onDone();
          nav.goTab("subjects");
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl px-2.5 py-3 text-left text-sm font-bold text-primary-color active:bg-primary-color/5"
      >
        <LuLayoutGrid aria-hidden size={20} />
        <span className="flex-1">{homeLanguage.seeAllSubjects(lang)}</span>
        <LuChevronRight aria-hidden size={18} />
      </button>
    </div>
  );
}
