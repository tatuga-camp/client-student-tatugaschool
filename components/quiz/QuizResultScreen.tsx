import Link from "next/link";
import React from "react";
import { MdCheckCircle } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import {
  Language,
  StudentQuizResultQuestion,
  StudentQuizView,
} from "../../interfaces";
import { promptSegments } from "../../utils/quizTake";

type Props = {
  view: StudentQuizView;
  language: Language;
  canViewScore: boolean;
  subjectId: string;
};

function ResultItem({
  q,
  view,
  language,
}: {
  q: StudentQuizResultQuestion;
  view: StudentQuizView;
  language: Language;
}) {
  const mine = view.answers.find((a) => a.questionId === q.id);
  const image = q.imageUrl && (
    <img
      src={q.imageUrl}
      alt=""
      className="mb-2 max-h-48 rounded-xl object-contain"
    />
  );
  if (q.type === "FILL_BLANK") {
    const given = new Map(
      (mine?.blankAnswers ?? []).map((b) => [b.blankId, b.value]),
    );
    const accepted = new Map(
      q.acceptedAnswers.map((a) => [a.blankId, a.answers]),
    );
    return (
      <>
        {image}
        <p className="leading-9 text-icon-color">
          {promptSegments(q.prompt).map((s, i) =>
            s.kind === "text" ? (
              <span key={i}>{s.text}</span>
            ) : (
              <span
                key={i}
                className="mx-1 inline-flex flex-col align-middle text-sm"
              >
                <span className="rounded bg-primary-color/10 px-2">
                  {given.get(s.blankId) || quizLanguage.noAnswer(language)}
                </span>
                <span className="text-xs text-success-color">
                  {(accepted.get(s.blankId) ?? []).join(" / ")}
                </span>
              </span>
            ),
          )}
        </p>
      </>
    );
  }
  const picked = new Set(mine?.selectedOptionIds ?? []);
  const correct = new Set(q.correctOptionIds);
  return (
    <>
      <p className="mb-2 whitespace-pre-line text-icon-color">{q.prompt}</p>
      {image}
      <ul className="flex flex-col gap-1 text-sm">
        {q.options.map((o) => (
          <li
            key={o.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
              correct.has(o.id)
                ? "bg-success-color/10"
                : picked.has(o.id)
                  ? "bg-error-color/10"
                  : ""
            }`}
          >
            <span className="flex flex-1 flex-col gap-1">
              {o.imageUrl && (
                <img
                  src={o.imageUrl}
                  alt=""
                  className="max-h-24 rounded-lg object-contain"
                />
              )}
              <span>{o.text}</span>
            </span>
            {picked.has(o.id) && (
              <span className="text-xs text-icon-color/60">
                {quizLanguage.yourAnswer(language)}
              </span>
            )}
            {correct.has(o.id) && (
              <MdCheckCircle
                className="text-success-color"
                aria-label={quizLanguage.correctAnswer(language)}
              />
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function QuizResultScreen({
  view,
  language,
  canViewScore,
  subjectId,
}: Props) {
  const result = view.result;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 p-5 font-Anuphan">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-6 text-center">
        <MdCheckCircle className="text-5xl text-success-color" />
        <h1 className="text-xl font-semibold text-icon-color">
          {quizLanguage.submittedTitle(language)}
        </h1>
        {result && canViewScore ? (
          <p className="text-3xl font-bold text-primary-color">
            {result.score} / {result.maxScore}
          </p>
        ) : (
          <p className="text-sm text-icon-color/60">
            {quizLanguage.scoreHidden(language)}
          </p>
        )}
      </div>
      {/* Two separate gates (spec): the server sends `questions` only when showAnswersAfterSubmit
          is on; per-question scores follow score visibility. */}
      {result?.questions?.map((q, i) => (
        <article
          key={q.id}
          className="rounded-2xl border border-gray-100 bg-white p-4"
        >
          <div className="mb-2 flex justify-between text-xs text-icon-color/50">
            <span>
              {quizLanguage.questionOf(
                language,
                i + 1,
                result.questions!.length,
              )}
            </span>
            {canViewScore && (
              <span>
                {q.score}/{q.points}
              </span>
            )}
          </div>
          <ResultItem q={q} view={view} language={language} />
        </article>
      ))}
      <Link
        href={`/subject/${subjectId}`}
        className="mt-auto rounded-2xl border border-gray-200 py-3 text-center font-medium text-icon-color"
      >
        {quizLanguage.backToClass(language)}
      </Link>
    </div>
  );
}
