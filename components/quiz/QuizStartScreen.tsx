import React from "react";
import { MdQuiz, MdShield, MdTimer } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language, StudentQuizView } from "../../interfaces";

type Props = {
  view: StudentQuizView;
  language: Language;
  starting: boolean;
  onStart: () => void;
};

export default function QuizStartScreen({
  view,
  language,
  starting,
  onStart,
}: Props) {
  const { assignment, questionCount } = view;
  const settings = assignment.quizSettings;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-5 p-5 font-Anuphan">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 text-4xl text-primary-color">
        <MdQuiz />
      </div>
      <h1 className="text-2xl font-semibold text-icon-color">
        {assignment.title}
      </h1>
      {assignment.description && (
        <p className="whitespace-pre-line text-icon-color/70">
          {assignment.description}
        </p>
      )}
      <ul className="flex flex-col gap-2 text-sm text-icon-color">
        <li>{quizLanguage.questionCount(language, questionCount)}</li>
        <li className="flex items-center gap-2">
          <MdTimer className="text-primary-color" />
          {settings.timeLimitMinutes
            ? quizLanguage.timeLimit(language, settings.timeLimitMinutes)
            : quizLanguage.noTimeLimit(language)}
        </li>
        {assignment.dueDate && (
          <li>
            {quizLanguage.dueAt(language)}:{" "}
            {new Date(assignment.dueDate).toLocaleString(
              language === "th" ? "th-TH" : "en-GB",
            )}
          </li>
        )}
      </ul>
      {settings.testMode && (
        <div className="flex gap-3 rounded-2xl border border-warning-color/30 bg-warning-color/10 p-4 text-sm text-icon-color">
          <MdShield className="mt-0.5 shrink-0 text-xl text-warning-color" />
          <p>{quizLanguage.testModeNotice(language)}</p>
        </div>
      )}
      {questionCount === 0 ? (
        <p className="text-center text-icon-color/60">
          {quizLanguage.emptyQuiz(language)}
        </p>
      ) : (
        <button
          type="button"
          disabled={starting}
          onClick={onStart}
          className="w-full rounded-2xl bg-primary-color py-4 text-lg font-semibold text-white disabled:opacity-50"
        >
          {quizLanguage.start(language)}
        </button>
      )}
    </div>
  );
}
