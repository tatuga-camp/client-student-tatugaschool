import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { announcementDataLanguage } from "../../data/languages";
import {
  useGetAnnouncements,
  useGetAssignments,
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import AnnouncementCard from "./AnnouncementCard";
import ClassworkCard from "./ClassworkCard";
import AssignmentTagFilterBar from "./AssignmentTagFilterBar";

type Props = {
  subjectId: string;
  allowStudentViewScoreOnAssignment: boolean;
};

function Classwork({ subjectId, allowStudentViewScoreOnAssignment }: Props) {
  const router = useRouter();
  const subject = useGetSubjectById({ id: subjectId });
  const assignments = useGetAssignments({ subjectId });
  const announcements = useGetAnnouncements({ subjectId });
  const student = useGetStudent();
  const language = useGetLanguage();

  // 1. Safely copy the array BEFORE sorting so you don't mutate the React Query cache
  const sortedAssignments = assignments.data
    ? [...assignments.data].sort((a, b) => a.order - b.order)
    : [];

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

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

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const a of sortedAssignments) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        out[key] = (out[key] ?? 0) + 1;
      }
    }
    return out;
  }, [sortedAssignments]);

  const visibleAssignments = useMemo(() => {
    if (selectedTags.size === 0) return sortedAssignments;
    return sortedAssignments.filter((a) =>
      (a.tags ?? []).some((t) => selectedTags.has(t.toLowerCase())),
    );
  }, [sortedAssignments, selectedTags]);

  useEffect(() => {
    const lower = new Set(uniqueTags.map((t) => t.toLowerCase()));
    setSelectedTags((prev) => {
      const filtered = new Set([...prev].filter((t) => lower.has(t)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [uniqueTags]);

  useEffect(() => {
    const announcementId = router.query.announcement_id;
    if (typeof announcementId === "string" && announcements.data) {
      document
        .getElementById(`announcement-${announcementId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [router.query.announcement_id, announcements.data]);

  // 2. Find the index of the first incomplete assignment
  let firstIncompleteIndex = -1;
  if (subject.data?.allowStudentDoneAssignmentInOrder) {
    firstIncompleteIndex = sortedAssignments.findIndex((classwork) => {
      const isCompleted =
        classwork.type === "Material" ||
        classwork.studentOnAssignment?.status === "SUBMITTED" ||
        classwork.studentOnAssignment?.status === "REVIEWD"; // Note: ensure "REVIEWD" isn't a typo in your DB!

      return !isCompleted;
    });
  }

  return (
    <>
      {assignments.isLoading && <LoadingBar />}
      <AssignmentTagFilterBar
        uniqueTags={uniqueTags}
        counts={counts}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        totalCount={sortedAssignments.length}
      />
      {announcements.data && announcements.data.length > 0 && student.data && (
        <section className="mt-5 w-full p-0 md:p-2">
          <h2 className="text-sm font-semibold text-gray-500">
            {announcementDataLanguage.sectionTitle(language.data ?? "en")}
          </h2>
          <ul className="mt-2 flex flex-col gap-3">
            {announcements.data.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                subjectId={subjectId}
                studentId={student.data.id}
              />
            ))}
          </ul>
        </section>
      )}
      <ul className="mt-5 flex h-max w-full flex-col gap-5 p-0 md:p-2">
        {visibleAssignments.map((classwork, index) => {
          const fullIndex = sortedAssignments.findIndex(
            (a) => a.id === classwork.id,
          );
          const isLocked =
            subject.data?.allowStudentDoneAssignmentInOrder &&
            firstIncompleteIndex !== -1 &&
            fullIndex > firstIncompleteIndex;

          return (
            <ClassworkCard
              key={classwork.id || index}
              locked={isLocked}
              allowStudentViewScoreOnAssignment={
                allowStudentViewScoreOnAssignment
              }
              onSelect={(a) => {
                router.push(`/subject/${subjectId}/assignment/${a.id}`);
              }}
              classwork={classwork}
              subjectId={subjectId}
            />
          );
        })}
      </ul>
    </>
  );
}

export default Classwork;
