import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { subjectHomeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { useGetAssignments, useGetSubjectById } from "../../react-query";
import {
  canStudentViewScore,
  ClassworkFilter,
  countClassworkBuckets,
  matchesClassworkFilter,
} from "../../utils";
import {
  groupClasswork,
  lockedClassworkIds,
} from "../../utils/classworkGroups";
import LoadingBar from "../common/LoadingBar";
import { useShellNav } from "../app/shell/useShellRoute";
import SubjectEmptyState from "../subject/SubjectEmptyState";
import ClassworkCard, { ClassworkItem } from "./ClassworkCard";
import { StatusChips, TagChips } from "./FilterChips";

type Props = {
  subjectId: string;
  lang: Language;
  /** Resets the pane's own scroller when a filter changes. */
  scrollToTop: () => void;
};

const GROUP_TITLE = {
  dueSoon: subjectHomeLanguage.groupDueSoon,
  todo: subjectHomeLanguage.groupTodo,
  submitted: subjectHomeLanguage.groupSubmitted,
  graded: subjectHomeLanguage.groupGraded,
  material: subjectHomeLanguage.groupMaterial,
  ordered: subjectHomeLanguage.groupOrdered,
};

export default function AssignmentsView({
  subjectId,
  lang,
  scrollToTop,
}: Props) {
  const router = useRouter();
  const { openAssignment } = useShellNav();
  const subject = useGetSubjectById({ id: subjectId });
  const assignments = useGetAssignments({ subjectId });
  const [filter, setFilter] = useState<ClassworkFilter>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Copy before sorting so the React Query cache is never mutated.
  const sorted = useMemo(
    () =>
      assignments.data
        ? [...assignments.data].sort((a, b) => a.order - b.order)
        : [],
    [assignments.data],
  );

  const uniqueTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of sorted) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        if (!map.has(key)) map.set(key, t);
      }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [sorted]);

  const tagCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const a of sorted) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        out[key] = (out[key] ?? 0) + 1;
      }
    }
    return out;
  }, [sorted]);

  const buckets = useMemo(() => countClassworkBuckets(sorted), [sorted]);

  const visible = useMemo(
    () =>
      sorted.filter(
        (a) =>
          matchesClassworkFilter(a, filter) &&
          (selectedTags.size === 0 ||
            (a.tags ?? []).some((t) => selectedTags.has(t.toLowerCase()))),
      ),
    [sorted, filter, selectedTags],
  );

  // Drop selected tags that no longer exist.
  useEffect(() => {
    const lower = new Set(uniqueTags.map((t) => t.toLowerCase()));
    setSelectedTags((prev) => {
      const kept = new Set([...prev].filter((t) => lower.has(t)));
      return kept.size === prev.size ? prev : kept;
    });
  }, [uniqueTags]);

  const inOrder = !!subject.data?.allowStudentDoneAssignmentInOrder;
  // Locked is decided on the whole list, so a filter never unlocks a card.
  const locked = useMemo(
    () => lockedClassworkIds(sorted, inOrder),
    [sorted, inOrder],
  );
  const now = new Date();
  const groups = groupClasswork(visible, now, inOrder);

  const onSelect = (a: ClassworkItem) => {
    if (a.type === "Quiz") router.push(`/subject/${subjectId}/quiz/${a.id}`);
    else openAssignment(a.id);
  };

  const counts: Record<ClassworkFilter, number> = {
    all: sorted.length,
    todo: buckets.todo,
    submitted: buckets.submitted,
    graded: buckets.graded,
  };

  return (
    <>
      {assignments.isLoading && <LoadingBar />}
      {sorted.length > 0 && (
        <>
          <StatusChips
            lang={lang}
            filter={filter}
            counts={counts}
            onFilter={(next) => {
              setFilter(next);
              scrollToTop();
            }}
          />
          <TagChips
            lang={lang}
            tags={uniqueTags}
            counts={tagCounts}
            selected={selectedTags}
            total={sorted.length}
            onChange={(next) => {
              setSelectedTags(next);
              scrollToTop();
            }}
          />
        </>
      )}

      <div className="px-3 pb-10">
        {!assignments.isLoading && visible.length === 0 ? (
          <div className="pt-2">
            <SubjectEmptyState
              text={
                sorted.length === 0
                  ? subjectHomeLanguage.emptyClasswork(lang)
                  : filter === "todo"
                    ? subjectHomeLanguage.emptyTodo(lang)
                    : subjectHomeLanguage.emptyFilter(lang)
              }
            />
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.key}>
              <h2 className="mx-0.5 mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-[0.6px] text-[#7A80A0]">
                {GROUP_TITLE[group.key](lang)}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.items.map((classwork) => (
                  <ClassworkCard
                    key={classwork.id}
                    classwork={classwork}
                    lang={lang}
                    now={now}
                    locked={locked.has(classwork.id)}
                    canViewScore={canStudentViewScore(subject.data, classwork)}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
