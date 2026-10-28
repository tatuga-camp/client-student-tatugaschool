import React from "react";
import { FaRegSadTear } from "react-icons/fa";
import { RiEmotionHappyFill } from "react-icons/ri";
import AssignmentStatusCard from "../subject/AssignmentStatus";
import ScoreHiddenBadge from "../subject/ScoreHiddenBadge";
import { classworkDataLanguage } from "../../data/languages";
import { useGetLanguage, useGetSubjectById } from "../../react-query";
import { canStudentViewScore, timeAgo, timeLeft } from "../../utils";
import type { AssignmentItem } from "./types";

/** LEGACY status/score table; Part 3 Task 4 replaces it. */
export function LegacyStatusInfo({
  assignment,
  subjectId,
}: {
  assignment: AssignmentItem;
  subjectId: string;
}) {
  const language = useGetLanguage();
  const subject = useGetSubjectById({ id: subjectId });

  if (assignment.type === "Material") {
    return null;
  }
  return (
    <div className="h-max w-full rounded-2xl border bg-white p-2">
      <div className="flex w-full items-center justify-between p-2 text-xl font-semibold">
        {classworkDataLanguage.assignment(language.data ?? "en")}
      </div>
      <ul className="mt-2 grid w-full">
        <li className="flex h-max items-center justify-start gap-1 border-b p-2">
          <div className="w-40 font-semibold">
            {classworkDataLanguage.status(language.data ?? "en")}:
          </div>
          <div className="w-max max-w-40">
            <AssignmentStatusCard
              status={assignment.studentOnAssignment.status}
            />
          </div>
        </li>
        <li className="flex h-max items-center justify-start gap-1 border-b p-2">
          <div className="w-40 font-semibold">
            {classworkDataLanguage.score(language.data ?? "en")}:
          </div>
          {canStudentViewScore(subject.data, assignment) ? (
            <div className="w-max max-w-40 text-2xl font-semibold">
              {assignment.studentOnAssignment.score !== null ? (
                <span>
                  {assignment.studentOnAssignment.score.toFixed(2)} /{" "}
                  {assignment.maxScore}{" "}
                </span>
              ) : (
                classworkDataLanguage.notGraded(language.data ?? "en")
              )}
            </div>
          ) : (
            <ScoreHiddenBadge size="md" />
          )}
        </li>

        {assignment.studentOnAssignment.completedAt && (
          <li className="flex h-max items-center justify-start gap-1 border-b p-2">
            <div className="w-40 font-semibold">
              {classworkDataLanguage.summitAt(language.data ?? "en")}:
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-blue-600">
                {new Date(
                  assignment.studentOnAssignment.completedAt,
                ).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="text-xs">
                {new Date(
                  assignment.studentOnAssignment.completedAt,
                ).toLocaleDateString(undefined, {
                  minute: "numeric",
                  hour: "numeric",
                })}
              </span>
            </div>
          </li>
        )}
        {assignment.studentOnAssignment.reviewdAt && (
          <li className="flex h-max items-center justify-start gap-1 border-b p-2">
            <div className="w-40 font-semibold">
              {classworkDataLanguage.reviewAt(language.data ?? "en")}:
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-green-600">
                {new Date(
                  assignment.studentOnAssignment.reviewdAt,
                ).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="text-xs">
                {new Date(
                  assignment.studentOnAssignment.reviewdAt,
                ).toLocaleDateString(undefined, {
                  minute: "numeric",
                  hour: "numeric",
                })}
              </span>
            </div>
          </li>
        )}
        {assignment.dueDate && (
          <li className="flex h-max items-center justify-start gap-1 border-b p-2">
            <div className="w-40 font-semibold">
              {classworkDataLanguage.deadline(language.data ?? "en")}:
            </div>
            <div>
              {new Date(assignment.dueDate).getTime() <=
              new Date().getTime() ? (
                <span className="flex items-center gap-1 font-semibold text-red-600">
                  {timeAgo({
                    pastTime: new Date(assignment.dueDate).toISOString(),
                    language: language.data ?? "en",
                  })}{" "}
                  {classworkDataLanguage.ago(language.data ?? "en")}{" "}
                  <FaRegSadTear />
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  {timeLeft({
                    targetTime: new Date(assignment.dueDate).toISOString(),
                    language: language.data ?? "en",
                  })}{" "}
                  {classworkDataLanguage.left(language.data ?? "en")}{" "}
                  <RiEmotionHappyFill />
                </span>
              )}{" "}
              <span className="text-xs">
                {new Date(assignment.dueDate).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
