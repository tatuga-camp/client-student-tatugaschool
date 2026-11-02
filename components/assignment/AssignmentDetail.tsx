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
  useUpdateStudentOnAssignment,
} from "../../react-query";
import { DESK_COL, TAB_BODY_CLASS } from "../app/TabHeader";
import { useIsWide } from "../app/useLayoutMode";
import {
  type DetailPaneProps,
  previousEntryPath,
  useShellNav,
} from "../app/shell/useShellRoute";
import TextEditor from "../common/TextEditor";
import {
  hasRichContent,
  nextAssignmentAfter,
  turnInSummary,
  yourWorkMode,
} from "../../utils/assignmentDetail";
import ArchivedBanner from "../subject/ArchivedBanner";
import CommentsChat from "./CommentsChat";
import ReviewedCard from "./ReviewedCard";
import TurnedInCelebration from "./TurnedInCelebration";
import DetailHeader from "./DetailHeader";
import VideoQuizPlayer from "./video/VideoQuizPlayer";
import TeacherFiles from "./TeacherFiles";
import TitleCard from "./TitleCard";
import { useDetailFocus } from "./useDetailFocus";
import { refreshAccessTokenWithin } from "../../services/apiService";
import { sendWorkKeepalive } from "../../services/assignment";
import { classworkBack } from "../../utils/tabs";
import { unsentVideo, videoQuizSubmission } from "../../utils/videoQuiz";
import { withTimeout } from "../../utils/withTimeout";
import { workError } from "./workFeedback";
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
 * work" sheet, plus the video quiz player for video quizzes.
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
  // `wide`: two columns, Your work as a card in the right one (its slot).
  const wide = useIsWide();
  const [cardSlot, setCardSlot] = useState<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  useDetailFocus(backRef, pageRef);

  const isQuiz = assignment?.type === "Quiz";
  useEffect(() => {
    if (isQuiz) router.replace(`/subject/${subjectId}/quiz/${assignmentId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuiz]);

  // "Not found" only once the list has loaded (or failed) without it.
  const loading = assignments.isPending || isQuiz;
  const updateWork = useUpdateStudentOnAssignment();
  const [videoState, setVideoState] = useState({
    playing: false,
    questionOpen: false,
    expanded: false,
  });
  const [celebration, setCelebration] = useState<ReturnType<
    typeof turnInSummary
  > | null>(null);
  const next = assignment
    ? nextAssignmentAfter(assignments.data ?? [], assignment)
    : null;
  // The quiz score is maxScore / questions x correct (done in the player).
  const submitVideoScore = async (score: number): Promise<boolean> => {
    if (!assignment) return false;
    try {
      const result = await withTimeout(
        updateWork.mutateAsync({
          query: { studentOnAssignmentId: assignment.studentOnAssignment.id },
          body: videoQuizSubmission(score),
        }),
        30_000,
      );
      if (!result.ok) {
        // Not saved (yet): the player keeps the result and offers Try again.
        workError(new Error(assignmentPageLanguage.submitTimeout(lang)), lang);
        return false;
      }
      return true;
    } catch (error) {
      // The player keeps the result and offers Try again.
      workError(error, lang, {
        title: assignmentPageLanguage.updateFailedTitle(lang),
        text: assignmentPageLanguage.updateFailedText(lang),
      });
      return false;
    }
  };
  // Video quiz answers not turned in yet. Leaving asks to submit them
  // (YourWorkSheet's guard); closing the page can't ask, so it sends them.
  const [videoProgress, setVideoProgress] = useState({
    answered: 0,
    correct: 0,
    score: 0,
  });
  const unsent = assignment
    ? unsentVideo({
        status: assignment.studentOnAssignment.status,
        total: assignment.questions?.length ?? 0,
        archived: !!subject.data?.isAchieved,
        ...videoProgress,
      })
    : null;
  const unsentRef = useRef(unsent);
  unsentRef.current = unsent;
  const hasUnsent = unsent !== null;
  const soaId = assignment?.studentOnAssignment.id;
  useEffect(() => {
    if (!hasUnsent || !soaId) return;
    // The send on page hide can't refresh the token, which lives minutes.
    const keepFresh = () => {
      refreshAccessTokenWithin(90).catch(() => {});
    };
    keepFresh();
    const timer = window.setInterval(keepFresh, 60_000);
    const onPageHide = () => {
      const video = unsentRef.current;
      if (!video) return;
      void sendWorkKeepalive({
        query: { studentOnAssignmentId: soaId },
        body: videoQuizSubmission(video.score),
      });
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [hasUnsent, soaId]);
  const reviewed =
    !!assignment &&
    assignment.type !== "Material" &&
    assignment.studentOnAssignment.status === "REVIEWD";
  // Room under the content for the "Your work" peek.
  const hasSheet =
    !!assignment &&
    yourWorkMode(assignment.type, assignment.studentOnAssignment.status) !==
      "none";

  // The page's parts. Phones and tablets stack them; `wide` puts Your work and
  // the comments in a right column that stays in view.
  const main = assignment && (
    <>
      {assignment.type === "VideoQuiz" && assignment.videoURL && (
        <VideoQuizPlayer
          src={assignment.videoURL}
          questions={assignment.questions}
          preventFastForward={assignment.preventFastForward ?? false}
          reviewed={assignment.studentOnAssignment.status === "REVIEWD"}
          maxScore={assignment.maxScore}
          onSubmit={submitVideoScore}
          onNext={next ? () => nav.openAssignment(next.id) : undefined}
          onStateChange={setVideoState}
          onProgress={setVideoProgress}
          readOnly={!!subject.data?.isAchieved}
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
      {(assignment.type === "Assignment" || assignment.type === "Material") &&
        hasRichContent(assignment.description) && (
          <section>
            <h3 className={sectionLabel}>
              {assignmentPageLanguage.instructions(lang)}
            </h3>
            <div className="chunky overflow-hidden p-2">
              <TextEditor
                autoHeight
                schoolId={assignment.schoolId}
                value={assignment.description}
                onChange={() => {}}
                menubar={false}
                toolbar={false}
                ariaText={assignmentPageLanguage.instructions(lang)}
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
    </>
  );
  const comments = assignment && (
    <CommentsChat
      studentOnAssignmentId={assignment.studentOnAssignment.id}
      lang={lang}
      readOnly={!!subject.data?.isAchieved}
    />
  );
  const nextButton = reviewed && next && (
    <button
      type="button"
      onClick={() => nav.openAssignment(next.id)}
      className="chunky flex min-h-[52px] w-full items-center justify-between gap-2 px-3 text-left active:translate-y-0.5"
    >
      <span className="min-w-0 truncate text-[13px] font-bold text-icon-color">
        {assignmentPageLanguage.nextAssignment(lang, next.title)}
      </span>
      <LuChevronRight aria-hidden className="shrink-0 text-[#9AA3B8]" />
    </button>
  );
  const twoColumns = wide && !loading && !!assignment;

  return (
    <div
      ref={pageRef}
      className="flex h-full w-full flex-col font-Anuphan wide:[--col:1000px]"
    >
      {assignment && (
        <Head>
          <title>
            {assignmentPageLanguage.pageTitle(lang, assignment.title)}
          </title>
        </Head>
      )}
      <DetailHeader
        ref={backRef}
        title={subject.data?.title ?? ""}
        lang={lang}
        onBack={nav.back}
      />
      {subject.data?.isAchieved && <ArchivedBanner lang={lang} />}
      <div
        className={`${TAB_BODY_CLASS} hideScrollBar ${DESK_COL}`}
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        {/* One tree for both layouts, only the classes change: crossing 1024
            (an iPad rotating, a snapped window going fullscreen) must not
            remount the video quiz, an open viewer or the comments. Below
            `wide` both columns are `display: contents`, so the page is the
            phone's single flex column. */}
        <div
          className={
            twoColumns
              ? "grid grid-cols-[minmax(0,1fr)_320px] items-start gap-[18px] px-3 pb-6 pt-4"
              : `flex flex-col gap-3 px-3 pt-4 ${hasSheet ? "pb-44" : "pb-6"}`
          }
        >
          <div
            className={twoColumns ? "flex min-w-0 flex-col gap-3" : "contents"}
          >
            {loading ? (
              <DetailSkeleton />
            ) : !assignment ? (
              <h2 className="py-10 text-center text-base font-bold text-icon-color">
                {classworkDataLanguage.notFound(lang)}
              </h2>
            ) : (
              <>
                {main}
                {twoColumns && nextButton}
              </>
            )}
          </div>
          <div
            className={
              twoColumns ? "sticky top-4 flex flex-col gap-3" : "contents"
            }
          >
            {twoColumns && <div ref={setCardSlot} />}
            {comments}
            {!twoColumns && nextButton}
          </div>
        </div>
      </div>
      {assignment && (
        <YourWorkSheet
          assignment={assignment}
          video={unsent}
          cardSlot={wide ? cardSlot : null}
          hidden={
            // On `wide` the card shows once its slot mounts: no sheet first.
            (wide && !cardSlot) ||
            videoState.playing ||
            videoState.questionOpen ||
            videoState.expanded
          }
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
            // Lands on the Classwork list, however the student got here: back
            // to it when it is the entry behind (no duplicate entry), else
            // replace this page with it.
            const previousPath = previousEntryPath();
            if (classworkBack({ previousPath, subjectId }) === "back") {
              void nav.back();
              return;
            }
            router.replace({
              pathname: "/subject/[subjectId]",
              query: { subjectId, tab: "classwork" },
            });
          }}
        />
      )}
    </div>
  );
}
