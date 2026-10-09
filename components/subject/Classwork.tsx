import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { IoMegaphone } from "react-icons/io5";
import { MdAssignment } from "react-icons/md";
import { subjectHomeLanguage } from "../../data/languages";
import {
  useGetAnnouncements,
  useGetAssignments,
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import {
  canStudentViewScore,
  ClassworkFilter,
  countClassworkBuckets,
  matchesClassworkFilter,
} from "../../utils";
import LoadingBar from "../common/LoadingBar";
import AnnouncementCard from "./AnnouncementCard";
import AssignmentTagFilterBar from "./AssignmentTagFilterBar";
import ClassworkCard from "./ClassworkCard";
import SubjectEmptyState from "./SubjectEmptyState";

type Props = {
  subjectId: string;
};

type View = "classwork" | "announcements";

function Classwork({ subjectId }: Props) {
  const router = useRouter();
  const subject = useGetSubjectById({ id: subjectId });
  const assignments = useGetAssignments({ subjectId });
  const announcements = useGetAnnouncements({ subjectId });
  const student = useGetStudent();
  const language = useGetLanguage();
  const lang = language.data ?? "en";

  const deepLinkedAnnouncement =
    typeof router.query.announcement_id === "string"
      ? router.query.announcement_id
      : null;
  const [view, setView] = useState<View>(
    deepLinkedAnnouncement ? "announcements" : "classwork",
  );
  const [filter, setFilter] = useState<ClassworkFilter>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Copy before sorting so the React Query cache is never mutated.
  const sortedAssignments = useMemo(
    () =>
      assignments.data
        ? [...assignments.data].sort((a, b) => a.order - b.order)
        : [],
    [assignments.data],
  );

  const uniqueTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of sortedAssignments) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        if (!map.has(key)) map.set(key, t);
      }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [sortedAssignments]);

  const tagCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const a of sortedAssignments) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        out[key] = (out[key] ?? 0) + 1;
      }
    }
    return out;
  }, [sortedAssignments]);

  const bucketCounts = useMemo(
    () => countClassworkBuckets(sortedAssignments),
    [sortedAssignments],
  );

  const visibleAssignments = useMemo(
    () =>
      sortedAssignments.filter(
        (a) =>
          matchesClassworkFilter(a, filter) &&
          (selectedTags.size === 0 ||
            (a.tags ?? []).some((t) => selectedTags.has(t.toLowerCase()))),
      ),
    [sortedAssignments, filter, selectedTags],
  );

  useEffect(() => {
    const lower = new Set(uniqueTags.map((t) => t.toLowerCase()));
    setSelectedTags((prev) => {
      const filtered = new Set([...prev].filter((t) => lower.has(t)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [uniqueTags]);

  // A notification link opens the announcement it points at.
  useEffect(() => {
    if (deepLinkedAnnouncement) setView("announcements");
  }, [deepLinkedAnnouncement]);

  useEffect(() => {
    if (view !== "announcements" || !deepLinkedAnnouncement) return;
    if (!announcements.data || !student.data) return;
    document
      .getElementById(`announcement-${deepLinkedAnnouncement}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [view, deepLinkedAnnouncement, announcements.data, student.data]);

  // Index of the first unfinished work when the teacher wants work done in order.
  let firstIncompleteIndex = -1;
  if (subject.data?.allowStudentDoneAssignmentInOrder) {
    firstIncompleteIndex = sortedAssignments.findIndex(
      (classwork) =>
        classwork.type !== "Material" &&
        classwork.studentOnAssignment?.status !== "SUBMITTED" &&
        classwork.studentOnAssignment?.status !== "REVIEWD",
    );
  }

  const announcementCount = announcements.data?.length ?? 0;
  const filters: {
    key: ClassworkFilter;
    label: string;
    count: number;
    active: string;
  }[] = [
    {
      key: "all",
      label: subjectHomeLanguage.filterAll(lang),
      count: sortedAssignments.length,
      active: "bg-primary-color text-white border-primary-color",
    },
    {
      key: "todo",
      label: subjectHomeLanguage.filterTodo(lang),
      count: bucketCounts.todo,
      active: "bg-rose-500 text-white border-rose-500",
    },
    {
      key: "submitted",
      label: subjectHomeLanguage.filterSubmitted(lang),
      count: bucketCounts.submitted,
      active: "bg-amber-500 text-white border-amber-500",
    },
    {
      key: "graded",
      label: subjectHomeLanguage.filterGraded(lang),
      count: bucketCounts.graded,
      active: "bg-emerald-500 text-white border-emerald-500",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4 pb-6 font-Anuphan">
      {/* Classwork / Announcements switch */}
      <div
        role="tablist"
        className="mt-1 grid w-full grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100"
      >
        <SwitchButton
          active={view === "classwork"}
          onClick={() => setView("classwork")}
          icon={<MdAssignment />}
          label={subjectHomeLanguage.tabAssignments(lang)}
          badge={
            bucketCounts.todo > 0
              ? subjectHomeLanguage.todoCount(lang, bucketCounts.todo)
              : null
          }
          activeClass="bg-sky-100 text-sky-700"
          badgeClass="bg-rose-500 text-white"
        />
        <SwitchButton
          active={view === "announcements"}
          onClick={() => setView("announcements")}
          icon={<IoMegaphone />}
          label={subjectHomeLanguage.tabAnnouncements(lang)}
          badge={announcementCount > 0 ? String(announcementCount) : null}
          activeClass="bg-amber-100 text-amber-700"
          badgeClass="bg-amber-400 text-white"
        />
      </div>

      {view === "classwork" && (
        <>
          {assignments.isLoading && <LoadingBar />}

          {sortedAssignments.length > 0 && (
            <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {filters.map((f) => {
                const active = filter === f.key;
                return (
                  <li key={f.key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setFilter(f.key)}
                      aria-pressed={active}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 px-3.5 py-1 text-sm font-bold transition ${
                        active
                          ? `${f.active} shadow-sm`
                          : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                      }`}
                    >
                      {f.label}
                      <span
                        className={`rounded-full px-1.5 text-xs ${
                          active ? "bg-white/25" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <AssignmentTagFilterBar
            uniqueTags={uniqueTags}
            counts={tagCounts}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            totalCount={sortedAssignments.length}
          />

          {!assignments.isLoading && visibleAssignments.length === 0 ? (
            <SubjectEmptyState
              emoji={
                sortedAssignments.length === 0
                  ? "📚"
                  : filter === "todo"
                    ? "🎉"
                    : "🔍"
              }
              text={
                sortedAssignments.length === 0
                  ? subjectHomeLanguage.emptyClasswork(lang)
                  : filter === "todo"
                    ? subjectHomeLanguage.emptyTodo(lang)
                    : subjectHomeLanguage.emptyFilter(lang)
              }
            />
          ) : (
            <ul className="flex w-full flex-col gap-3">
              {visibleAssignments.map((classwork) => {
                const fullIndex = sortedAssignments.findIndex(
                  (a) => a.id === classwork.id,
                );
                const isLocked =
                  !!subject.data?.allowStudentDoneAssignmentInOrder &&
                  firstIncompleteIndex !== -1 &&
                  fullIndex > firstIncompleteIndex;

                return (
                  <ClassworkCard
                    key={classwork.id}
                    locked={isLocked}
                    canViewScore={canStudentViewScore(subject.data, classwork)}
                    onSelect={(a) => {
                      router.push(
                        a.type === "Quiz"
                          ? `/subject/${subjectId}/quiz/${a.id}`
                          : `/subject/${subjectId}/assignment/${a.id}`,
                      );
                    }}
                    classwork={classwork}
                    subjectId={subjectId}
                  />
                );
              })}
            </ul>
          )}
        </>
      )}

      {view === "announcements" && (
        <>
          {announcements.isLoading && <LoadingBar />}
          {!announcements.isLoading && announcementCount === 0 ? (
            <SubjectEmptyState
              emoji="📣"
              text={subjectHomeLanguage.emptyAnnouncements(lang)}
            />
          ) : (
            student.data && (
              <ul className="flex flex-col gap-3">
                {announcements.data?.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    subjectId={subjectId}
                    studentId={student.data.id}
                  />
                ))}
              </ul>
            )
          )}
        </>
      )}
    </div>
  );
}

type SwitchButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge: string | null;
  activeClass: string;
  badgeClass: string;
};

function SwitchButton({
  active,
  onClick,
  icon,
  label,
  badge,
  activeClass,
  badgeClass,
}: SwitchButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold transition ${
        active ? `${activeClass} shadow-sm` : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <span className="shrink-0 text-lg">{icon}</span>
      <span className="truncate">{label}</span>
      {badge && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none ${badgeClass}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export default Classwork;
