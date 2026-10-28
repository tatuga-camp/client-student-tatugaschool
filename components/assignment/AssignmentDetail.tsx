import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import {
  useGetAssignments,
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import { TAB_BODY_CLASS } from "../app/TabHeader";
import { type DetailPaneProps, useShellNav } from "../app/shell/useShellRoute";
import TextEditor from "../common/TextEditor";
import {
  hasRichContent,
  nextAssignmentAfter,
  turnInSummary,
  yourWorkMode,
} from "../../utils/assignmentDetail";
import CommentsChat from "./CommentsChat";
import ReviewedCard from "./ReviewedCard";
import TurnedInCelebration from "./TurnedInCelebration";
import DetailHeader from "./DetailHeader";
import { LegacyVideoQuiz } from "./LegacyVideoQuiz";
import TeacherFiles from "./TeacherFiles";
import TitleCard from "./TitleCard";
import { useDetailFocus } from "./useDetailFocus";
import YourWorkSheet from "./YourWorkSheet";

const sectionLabel =
  "mx-0.5 mb-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7A80A0]";

function DetailSkeleton() {
  const bar = "rounded-lg bg-[#E3E8F0] motion-safe:animate-pulse";
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <div className="chunky p-3">
        <div className={`${bar} h-4 w-1/3`} />
        <div className={`${bar} mt-3 h-5 w-4/5`} />
        <div className={`${bar} mt-3 h-4 w-2/3`} />
      </div>
      <div className="chunky p-3">
        <div className={`${bar} h-3 w-full`} />
        <div className={`${bar} mt-2 h-3 w-5/6`} />
        <div className={`${bar} mt-2 h-3 w-2/3`} />
      </div>
    </div>
  );
}

/**
 * The assignment page: sky header with back, the reviewed score card, title
 * card, instructions, the teacher's files, the comment chat, and the "Your
 * work" sheet. Still the legacy video quiz block until Part 3 Task 6.
 */
export default function AssignmentDetail({
  subjectId,
  assignmentId,
}: DetailPaneProps) {
  const nav = useShellNav();
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  const assignments = useGetAssignments({ subjectId });
  const assignment = assignments.data?.find((item) => item.id === assignmentId);
  const pageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  useDetailFocus(backRef, pageRef);

  const isQuiz = assignment?.type === "Quiz";
  useEffect(() => {
    if (isQuiz) router.replace(`/subject/${subjectId}/quiz/${assignmentId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuiz]);

  // "Not found" only once the list has loaded (or failed) without it.
  const loading = assignments.isPending || isQuiz;
  const [celebration, setCelebration] = useState<ReturnType<
    typeof turnInSummary
  > | null>(null);
  const next = assignment
    ? nextAssignmentAfter(assignments.data ?? [], assignment)
    : null;
  const reviewed =
    !!assignment &&
    assignment.type !== "Material" &&
    assignment.studentOnAssignment.status === "REVIEWD";
  // Room under the content for the "Your work" peek.
  const hasSheet =
    !!assignment &&
    yourWorkMode(assignment.type, assignment.studentOnAssignment.status) !==
      "none";

  return (
    <div ref={pageRef} className="flex h-full w-full flex-col font-Anuphan">
      {assignment && (
        <Head>
          <title>Assignment: {assignment.title}</title>
        </Head>
      )}
      <DetailHeader
        ref={backRef}
        title={subject.data?.title ?? ""}
        lang={lang}
        onBack={nav.back}
      />
      <div
        className={`${TAB_BODY_CLASS} hideScrollBar`}
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div
          className={`flex flex-col gap-3 px-3 pt-4 ${hasSheet ? "pb-44" : "pb-6"}`}
        >
          {loading ? (
            <DetailSkeleton />
          ) : !assignment ? (
            <h2 className="py-10 text-center text-base font-bold text-icon-color">
              {classworkDataLanguage.notFound(lang)}
            </h2>
          ) : (
            <>
              {assignment.type === "VideoQuiz" && assignment.videoURL && (
                <LegacyVideoQuiz
                  assignment={assignment}
                  subjectId={subjectId}
                />
              )}
              {reviewed && subject.data && student.data && (
                <ReviewedCard
                  assignment={assignment}
                  subject={subject.data}
                  lang={lang}
                  student={student.data}
                />
              )}
              <TitleCard assignment={assignment} lang={lang} now={new Date()} />
              {(assignment.type === "Assignment" ||
                assignment.type === "Material") &&
                hasRichContent(assignment.description) && (
                  <section>
                    <h3 className={sectionLabel}>
                      {assignmentPageLanguage.instructions(lang)}
                    </h3>
                    <div className="chunky overflow-hidden p-2">
                      <TextEditor
                        disabled
                        autoHeight
                        schoolId={assignment.schoolId}
                        value={assignment.description}
                        onChange={() => {}}
                        menubar={false}
                        toolbar={false}
                      />
                    </div>
                  </section>
                )}
              {assignment.files?.length > 0 && (
                <section>
                  <h3 className={sectionLabel}>
                    {assignmentPageLanguage.fromTeacher(lang)}
                  </h3>
                  <TeacherFiles files={assignment.files} lang={lang} />
                </section>
              )}
              <CommentsChat
                studentOnAssignmentId={assignment.studentOnAssignment.id}
                lang={lang}
              />
              {reviewed && next && (
                <button
                  type="button"
                  onClick={() => nav.openAssignment(next.id)}
                  className="chunky flex min-h-[52px] w-full items-center justify-between gap-2 px-3 text-left active:translate-y-0.5"
                >
                  <span className="min-w-0 truncate text-[13px] font-bold text-icon-color">
                    {assignmentPageLanguage.nextAssignment(lang, next.title)}
                  </span>
                  <LuChevronRight
                    aria-hidden
                    className="shrink-0 text-[#9AA3B8]"
                  />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {assignment && subject.data && (
        <YourWorkSheet
          assignment={assignment}
          subject={subject.data}
          onTurnedIn={({ itemCount }) =>
            setCelebration(
              turnInSummary({
                dueDate: assignment.dueDate,
                completedAt: new Date().toISOString(),
                itemCount,
              }),
            )
          }
        />
      )}
      {assignment && student.data && celebration && (
        <TurnedInCelebration
          open
          fallbackFocus={backRef}
          lang={lang}
          student={student.data}
          summary={celebration}
          next={next ? { id: next.id, title: next.title } : null}
          onNext={() => {
            setCelebration(null);
            if (next) nav.openAssignment(next.id);
          }}
          onBack={() => {
            setCelebration(null);
            nav.back();
          }}
        />
      )}
    </div>
  );
}
