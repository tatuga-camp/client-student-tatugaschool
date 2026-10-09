import Head from "next/head";
import React from "react";
import Swal from "sweetalert2";
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
import RouteParamsGate, { queryString } from "../../../../components/common/RouteParamsGate";
import QuizResultScreen from "../../../../components/quiz/QuizResultScreen";
import QuizStartScreen from "../../../../components/quiz/QuizStartScreen";
import QuizTakeScreen from "../../../../components/quiz/QuizTakeScreen";
import TestModeShell from "../../../../components/quiz/TestModeShell";
import { quizLanguage } from "../../../../data/languages";
import { ErrorMessages } from "../../../../interfaces";
import { canStudentViewScore } from "../../../../utils/scoreVisibility";

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

function StudentQuizPage({ subjectId, assignmentId }: { subjectId: string; assignmentId: string }) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const assignments = useGetAssignments({ subjectId });
  const subject = useGetSubjectById({ id: subjectId });
  const soaId = assignments.data?.find((a) => a.id === assignmentId)?.studentOnAssignment?.id;
  const quiz = useGetStudentQuiz(soaId);
  const start = useStartQuiz();
  const submit = useSubmitQuiz();

  const fail = (error: unknown) => {
    const result = error as ErrorMessages;
    Swal.fire({ title: result?.error ?? "Error", text: result?.message?.toString(), icon: "error" });
  };

  const view = quiz.data;
  if (!soaId || !view) {
    return <div className="flex min-h-dvh items-center justify-center bg-background-color font-Anuphan text-icon-color/60">…</div>;
  }

  const onStart = async () => {
    if (view.assignment.quizSettings.testMode) requestFullscreenIfSupported();
    try {
      await start.mutateAsync(soaId);
    } catch (error) {
      fail(error);
    }
  };

  const onSubmit = async () => {
    try {
      await submit.mutateAsync(soaId);
    } catch (error) {
      // Already finalized by the server (deadline) or reset: show the real state.
      await quiz.refetch();
      const message = (error as ErrorMessages)?.message;
      if (message !== "QUIZ_CLOSED" && message !== "QUIZ_NOT_STARTED") fail(error);
    }
  };

  const onClosed = async () => {
    const fresh = await quiz.refetch();
    if (!fresh.data?.attempt) Swal.fire({ text: quizLanguage.resetByTeacher(lang), icon: "info" });
  };

  const canViewScore = canStudentViewScore(subject.data, { allowStudentViewScore: view.assignment.allowStudentViewScore });
  const taking = !!view.attempt && !view.attempt.submittedAt;

  return (
    <>
      <Head>
        <title>{view.assignment.title}</title>
      </Head>
      <div className="min-h-dvh bg-background-color">
        {!view.attempt && <QuizStartScreen view={view} language={lang} starting={start.isPending} onStart={onStart} />}
        {taking && (
          <TestModeShell soaId={soaId} enabled={view.assignment.quizSettings.testMode}>
            <QuizTakeScreen
              key={view.attempt!.startedAt}
              soaId={soaId}
              view={view}
              language={lang}
              submitting={submit.isPending}
              onSubmit={onSubmit}
              onClosed={onClosed}
            />
          </TestModeShell>
        )}
        {view.attempt?.submittedAt && (
          <QuizResultScreen view={view} language={lang} canViewScore={canViewScore} subjectId={subjectId} />
        )}
      </div>
    </>
  );
}
