import Head from "next/head";
import Link from "next/link";
import React from "react";
import Swal from "../../../../utils/appSwal";
// Keep the react-query barrel above the quiz components: it loads services/auth before
// services/apiService. Entering apiService first (via services/quiz) hits the
// auth <-> apiService cycle and throws a TDZ ReferenceError at build time.
import {
  useGetAssignments,
  useGetLanguage,
  useGetStudentQuiz,
  useGetSubjectById,
  useStartQuiz,
  useSubmitQuiz,
} from "../../../../react-query";
import RouteParamsGate, {
  queryString,
} from "../../../../components/common/RouteParamsGate";
import QuizResultScreen from "../../../../components/quiz/QuizResultScreen";
import QuizStartScreen from "../../../../components/quiz/QuizStartScreen";
import QuizTakeScreen from "../../../../components/quiz/QuizTakeScreen";
import TestModeShell from "../../../../components/quiz/TestModeShell";
import ArchivedBanner from "../../../../components/subject/ArchivedBanner";
import { quizLanguage, subjectHomeLanguage } from "../../../../data/languages";
import { ErrorMessages, Language } from "../../../../interfaces";
import { errorSwalContent } from "../../../../utils/errorSwal";
import { canStudentViewScoreOnceLoaded } from "../../../../utils/scoreVisibility";
import {
  isSubjectArchived,
  isSubjectArchivedError,
} from "../../../../utils/subjectArchived";
import { ArchivedSubjectScreen } from "../../../../components/app/ArchivedSubjectScreen";

function requestFullscreenIfSupported() {
  const el = document.documentElement;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (!isIOS && el.requestFullscreen && !document.fullscreenElement) {
    el.requestFullscreen().catch(() => undefined);
  }
}

/** Same gate as the assignment page, so no request fires before route params exist. */
export default function Page() {
  return (
    <RouteParamsGate
      read={(query) => {
        const subjectId = queryString(query.subjectId);
        const assignmentId = queryString(query.assignmentId);
        return subjectId && assignmentId ? { subjectId, assignmentId } : null;
      }}
    >
      {(params) => <StudentQuizPage {...params} />}
    </RouteParamsGate>
  );
}

function StudentQuizPage({
  subjectId,
  assignmentId,
}: {
  subjectId: string;
  assignmentId: string;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  // Only used to resolve soaId, so no 10 s polling for the whole attempt.
  const assignments = useGetAssignments(
    { subjectId },
    { refetchInterval: false },
  );
  const subject = useGetSubjectById({ id: subjectId });
  const foundSoaId = assignments.data?.find((a) => a.id === assignmentId)
    ?.studentOnAssignment?.id;
  // Keep soaId once resolved: a failed background refetch must never unmount the take screen
  // (that would dispose the autosave queue and drop unsaved answers).
  const [resolvedSoaId, setResolvedSoaId] = React.useState<string | undefined>(
    foundSoaId,
  );
  React.useEffect(() => {
    if (foundSoaId && !resolvedSoaId) setResolvedSoaId(foundSoaId);
  }, [foundSoaId, resolvedSoaId]);
  const soaId = resolvedSoaId ?? foundSoaId;
  const quiz = useGetStudentQuiz(soaId);
  const start = useStartQuiz();
  const submit = useSubmitQuiz();

  const fail = (error: unknown) =>
    Swal.fire({ ...errorSwalContent(error), icon: "error" });

  const view = quiz.data;
  // An archived subject is closed to students: the server refuses its reads
  // (or, on an older server, the subject says it is archived).
  if (
    isSubjectArchived(subject.data, subject.error) ||
    isSubjectArchivedError(assignments.error) ||
    isSubjectArchivedError(quiz.error)
  ) {
    return (
      <ArchivedSubjectScreen
        subjectId={subjectId}
        educationYear={subject.data?.educationYear}
      />
    );
  }
  // Error screens only when there is nothing to render. TanStack keeps `data` on a failed
  // background refetch, and replacing a running take screen would lose unsaved answers.
  if (!soaId && (assignments.isError || assignments.isSuccess)) {
    return (
      <QuizPageMessage
        text={
          assignments.isError
            ? errorSwalContent(assignments.error).text
            : quizLanguage.notFound(lang)
        }
        language={lang}
        onRetry={
          assignments.isError ? () => void assignments.refetch() : undefined
        }
      />
    );
  }
  if (quiz.isError && !quiz.isFetching && !view) {
    return (
      <QuizPageMessage
        text={`${quizLanguage.loadFailed(lang)} ${errorSwalContent(quiz.error).text}`}
        language={lang}
        onRetry={() => void quiz.refetch()}
      />
    );
  }
  // Wait for a fetch made after this mount: a cached view can hold stale answers and an old
  // serverNow, which would seed the take screen with lost answers and a wrong clock.
  // Also wait for the subject, so an archived one never flashes the take screen
  // (which would start autosaving).
  if (!soaId || !view || !quiz.isFetchedAfterMount || subject.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background-color font-Anuphan text-icon-color/60">
        …
      </div>
    );
  }

  // The subject never loaded, so archived is unknown: don't offer Start or Take (they would
  // autosave into a server that rejects it). Submitted results stay viewable.
  if (subject.isError && !subject.data && !view.attempt?.submittedAt) {
    return (
      <QuizPageMessage
        text={`${quizLanguage.loadFailed(lang)} ${errorSwalContent(subject.error).text}`}
        language={lang}
        onRetry={() => void subject.refetch()}
      />
    );
  }

  const onStart = async () => {
    if (view.assignment.quizSettings.testMode) requestFullscreenIfSupported();
    try {
      await start.mutateAsync(soaId);
    } catch (error) {
      fail(error);
    }
  };

  /** Resolves true when the submit landed. `quiet` skips the error dialog (timed auto-submit retries). */
  const onSubmit = async (options?: { quiet?: boolean }) => {
    try {
      await submit.mutateAsync(soaId);
      return true;
    } catch (error) {
      // Already finalized by the server (deadline) or reset: show the real state.
      await quiz.refetch();
      const message = (error as ErrorMessages)?.message;
      if (
        !options?.quiet &&
        message !== "QUIZ_CLOSED" &&
        message !== "QUIZ_NOT_STARTED"
      )
        fail(error);
      return false;
    }
  };

  const onClosed = async () => {
    const fresh = await quiz.refetch();
    if (!fresh.data?.attempt)
      Swal.fire({ text: quizLanguage.resetByTeacher(lang), icon: "info" });
  };

  const canViewScore = canStudentViewScoreOnceLoaded(
    subject.data !== undefined,
    subject.data,
    { allowStudentViewScore: view.assignment.allowStudentViewScore },
  );
  const archived = !!subject.data?.isAchieved;
  const taking = !archived && !!view.attempt && !view.attempt.submittedAt;

  return (
    <>
      <Head>
        <title>{view.assignment.title}</title>
      </Head>
      <div className="min-h-dvh bg-background-color">
        {archived && <ArchivedBanner lang={lang} />}
        {archived && !view.attempt?.submittedAt && (
          <div className="flex flex-col items-center gap-4 px-4 py-8 text-center font-Anuphan">
            <p className="text-icon-color/70">
              {subjectHomeLanguage.archivedQuiz(lang)}
            </p>
            <Link
              href={`/subject/${subjectId}`}
              className="rounded-2xl border border-gray-200 px-5 py-2.5 font-medium text-icon-color"
            >
              {quizLanguage.backToClass(lang)}
            </Link>
          </div>
        )}
        {!archived && !view.attempt && (
          <QuizStartScreen
            view={view}
            language={lang}
            starting={start.isPending}
            onStart={onStart}
          />
        )}
        {taking && (
          <TestModeShell
            soaId={soaId}
            enabled={view.assignment.quizSettings.testMode}
          >
            <QuizTakeScreen
              key={view.attempt!.startedAt}
              soaId={soaId}
              view={view}
              fetchedAt={quiz.dataUpdatedAt}
              language={lang}
              submitting={submit.isPending}
              onSubmit={onSubmit}
              onClosed={onClosed}
            />
          </TestModeShell>
        )}
        {view.attempt?.submittedAt && (
          <QuizResultScreen
            view={view}
            language={lang}
            canViewScore={canViewScore}
            subjectId={subjectId}
          />
        )}
      </div>
    </>
  );
}

function QuizPageMessage({
  text,
  language,
  onRetry,
}: {
  text: string;
  language: Language;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background-color px-4 text-center font-Anuphan">
      <p className="text-icon-color/70">{text}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-2xl bg-primary-color px-5 py-2.5 font-medium text-white"
        >
          {quizLanguage.retry(language)}
        </button>
      )}
    </div>
  );
}
