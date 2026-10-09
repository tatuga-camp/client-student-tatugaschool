import React from "react";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import {
  Language,
  QuizAnswerDraft,
  StudentQuizQuestion,
} from "../../interfaces";
import { promptSegments } from "../../utils/quizTake";

type Props = {
  question: StudentQuizQuestion;
  answer: QuizAnswerDraft;
  onChange: (next: QuizAnswerDraft) => void;
  language: Language;
};

export default function QuizQuestionView({
  question,
  answer,
  onChange,
  language,
}: Props) {
  if (question.type === "FILL_BLANK") {
    const value = (blankId: string) =>
      answer.blankAnswers.find((b) => b.blankId === blankId)?.value ?? "";
    const setValue = (blankId: string, next: string) =>
      onChange({
        selectedOptionIds: [],
        blankAnswers: [
          ...answer.blankAnswers.filter((b) => b.blankId !== blankId),
          { blankId, value: next },
        ],
      });
    return (
      <div className="flex flex-col gap-4">
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt=""
            className="max-h-64 rounded-2xl object-contain"
          />
        )}
        <p className="select-none text-lg leading-[3rem] text-icon-color">
          {promptSegments(question.prompt).map((segment, i) =>
            segment.kind === "text" ? (
              <span key={i}>{segment.text}</span>
            ) : (
              <input
                key={i}
                value={value(segment.blankId)}
                onChange={(e) => setValue(segment.blankId, e.target.value)}
                size={Math.max(6, value(segment.blankId).length + 2)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="mx-1 inline-block max-w-full select-text rounded-lg border-b-2 border-primary-color bg-primary-color/10 px-2 py-1 align-baseline text-lg outline-none focus:bg-primary-color/15"
              />
            ),
          )}
        </p>
      </div>
    );
  }

  const multiple = question.type === "MULTIPLE";
  const picked = new Set(answer.selectedOptionIds);
  const toggle = (id: string) => {
    if (!multiple)
      return onChange({ selectedOptionIds: [id], blankAnswers: [] });
    const next = new Set(picked);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange({ selectedOptionIds: [...next], blankAnswers: [] });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="select-none whitespace-pre-line text-lg text-icon-color">
        {question.prompt}
      </p>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt=""
          className="max-h-64 rounded-2xl object-contain"
        />
      )}
      <ul
        className="flex flex-col gap-3"
        role={multiple ? "group" : "radiogroup"}
      >
        {question.options.map((option) => {
          const on = picked.has(option.id);
          const Icon = multiple
            ? on
              ? MdCheckBox
              : MdCheckBoxOutlineBlank
            : on
              ? MdRadioButtonChecked
              : MdRadioButtonUnchecked;
          return (
            <li key={option.id}>
              <button
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => toggle(option.id)}
                className={`flex w-full select-none items-center gap-3 rounded-2xl border-2 p-4 text-left text-base transition ${
                  on
                    ? "border-primary-color bg-primary-color/10 text-icon-color"
                    : "border-gray-200 bg-white text-icon-color hover:border-primary-color/40"
                }`}
              >
                <Icon
                  className={`shrink-0 text-2xl ${on ? "text-primary-color" : "text-icon-color/30"}`}
                />
                <span className="flex flex-col gap-2">
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt=""
                      className="max-h-40 rounded-xl object-contain"
                    />
                  )}
                  <span>{option.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-icon-color/50">
        {multiple
          ? quizLanguage.typeMultiple(language)
          : quizLanguage.typeSingle(language)}
      </p>
    </div>
  );
}
