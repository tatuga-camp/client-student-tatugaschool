import React from "react";
import {
  LuArrowUpDown,
  LuCalendar,
  LuChevronDown,
  LuSearch,
} from "react-icons/lu";
import { subjectsPageLanguage } from "../../data/languages";
import { EducationYear } from "../../interfaces";
import { useGetLanguage, useGetStudent } from "../../react-query";
import {
  useGetSubjectById,
  useGetSubjectByStudent,
} from "../../react-query/subject";
import { Sheet } from "../app/Sheet";
import { TAB_BODY_CLASS, TabHeader } from "../app/TabHeader";
import { useShellNav, type TabPaneProps } from "../app/shell/useShellRoute";
import { EducationYearSheet } from "./EducationYearSheet";
import { SubjectCard } from "./SubjectCard";

type SortOption = "default" | "newest" | "oldest" | "az" | "za";
type StatusFilter = "all" | "complete" | "uncomplete";

const SORTS: SortOption[] = ["default", "newest", "oldest", "az", "za"];
const STATUSES: StatusFilter[] = ["all", "uncomplete", "complete"];

export default function SubjectsTab({ subjectId }: TabPaneProps) {
  const nav = useShellNav();
  const language = useGetLanguage();
  const student = useGetStudent();
  const subject = useGetSubjectById({ id: subjectId });
  const lang = (language.data ?? "en") as "th" | "en";

  const [educationYear, setEducationYear] = React.useState<EducationYear>();
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [yearOpen, setYearOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  // Start on the open subject's term/year.
  React.useEffect(() => {
    if (subject.data) {
      setEducationYear(
        (prev) => prev ?? (subject.data.educationYear as EducationYear),
      );
    }
  }, [subject.data]);

  const subjects = useGetSubjectByStudent({
    studentId: student.data?.id as string,
    educationYear: educationYear as EducationYear,
  });

  const filteredSubjects = React.useMemo(() => {
    if (!subjects.data) return [];
    const q = search.trim().toLowerCase();
    const filtered = subjects.data.filter((s) => {
      const matchSearch =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.educationYear.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
    const time = (d: Date | string) => new Date(d).getTime();
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => time(b.createAt) - time(a.createAt));
        break;
      case "oldest":
        sorted.sort((a, b) => time(a.createAt) - time(b.createAt));
        break;
      case "az":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        sorted.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return sorted;
  }, [subjects.data, search, sortBy, statusFilter]);

  const totalCount = subjects.data?.length ?? 0;
  const completedCount =
    subjects.data?.filter((s) => s.status === "complete").length ?? 0;
  const counts: Record<StatusFilter, number> = {
    all: totalCount,
    complete: completedCount,
    uncomplete: totalCount - completedCount,
  };

  const [term, year] = (educationYear ?? "").split("/");
  const filtering = search !== "" || statusFilter !== "all";

  return (
    <div className="flex h-full w-full flex-col">
      <TabHeader
        title={subjectsPageLanguage.myTitle(lang)}
        right={
          educationYear ? (
            <button
              type="button"
              onClick={() => setYearOpen(true)}
              aria-haspopup="dialog"
              aria-label={subjectsPageLanguage.pickTermYear(lang)}
              className="flex h-[30px] items-center gap-1 rounded-[12px] border-2 border-b-4 border-[#E3E8F0] bg-white px-2 font-Anuphan text-[12px] font-bold text-icon-color [-webkit-tap-highlight-color:transparent] active:translate-y-px active:border-b-2"
            >
              <LuCalendar
                aria-hidden
                size={14}
                className="text-primary-color"
              />
              {subjectsPageLanguage.termYear(lang, term, year)}
              <LuChevronDown aria-hidden size={14} />
            </button>
          ) : null
        }
      />
      <div className={`${TAB_BODY_CLASS} px-3 pt-3 font-Anuphan`}>
        <div className="flex gap-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[13px] border-2 border-[#E3E8F0] bg-white px-2.5 py-1.5 text-[#9AA3B8]">
            <LuSearch aria-hidden size={16} className="shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={subjectsPageLanguage.searchShort(lang)}
              aria-label={subjectsPageLanguage.searchPlaceholder(lang)}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#383767] placeholder:text-[#9AA3B8] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            aria-haspopup="dialog"
            aria-label={subjectsPageLanguage.sortBy(lang)}
            className="grid w-10 place-items-center rounded-[12px] border-2 border-b-4 border-[#E3E8F0] bg-white text-[#5B6280] active:translate-y-px active:border-b-2"
          >
            <LuArrowUpDown aria-hidden size={17} />
          </button>
        </div>

        <div
          data-no-swipe
          className="-mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 pb-1"
        >
          {STATUSES.map((s) => {
            const on = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-2 px-2.5 py-1 text-[12px] font-bold ${
                  on
                    ? "border-primary-color bg-primary-color text-white shadow-[0_3px_0_#275d96]"
                    : "border-[#E3E8F0] bg-white text-[#5B6280]"
                }`}
              >
                {subjectsPageLanguage.statusLabels[lang][s]}
                <b className="opacity-65">{counts[s]}</b>
              </button>
            );
          })}
        </div>

        <div className="h-2.5" />
        {subjects.isPending ? (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-color border-t-transparent motion-reduce:animate-none" />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#E3E8F0] bg-white px-6 py-12 text-center">
            <p className="text-[15px] font-bold text-[#383767]">
              {filtering
                ? subjectsPageLanguage.noMatch(lang)
                : subjectsPageLanguage.noSubjects(lang)}
            </p>
            <p className="max-w-xs text-[12px] text-[#7A80A0]">
              {filtering
                ? subjectsPageLanguage.noMatchHint(lang)
                : subjectsPageLanguage.noSubjectsHint(lang)}
            </p>
          </div>
        ) : (
          filteredSubjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              lang={lang}
              current={s.id === subjectId}
              onOpen={() => nav.switchSubject(s.id)}
            />
          ))
        )}
        <div className="h-4" />
      </div>

      {educationYear && (
        <EducationYearSheet
          open={yearOpen}
          onClose={() => setYearOpen(false)}
          value={educationYear}
          onChange={setEducationYear}
          lang={lang}
        />
      )}
      <Sheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        ariaLabel={subjectsPageLanguage.sortBy(lang)}
      >
        <h2 className="pb-2 font-Anuphan text-[16px] font-bold text-[#383767]">
          {subjectsPageLanguage.sortBy(lang)}
        </h2>
        <div role="radiogroup" className="flex flex-col gap-1.5 font-Anuphan">
          {SORTS.map((o) => {
            const on = sortBy === o;
            return (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setSortBy(o);
                  setSortOpen(false);
                }}
                className={`rounded-2xl border-2 border-b-4 px-3 py-3 text-left text-[14px] font-bold ${
                  on
                    ? "border-primary-color bg-[#E8F1FC] text-primary-color"
                    : "border-[#E3E8F0] bg-white text-[#383767]"
                }`}
              >
                {subjectsPageLanguage.sortLabels[lang][o]}
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}
