import React from "react";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import { Language, Subject } from "../../interfaces";
import { canStudentViewScore } from "../../utils";
import { formatScore, reviewedMood } from "../../utils/assignmentDetail";
import { mascotForStudent } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";
import RubricBreakdown from "../subject/RubricBreakdown";
import ScoreHiddenBadge from "../subject/ScoreHiddenBadge";
import type { AssignmentItem } from "./types";

type Props = {
  assignment: AssignmentItem;
  subject: Subject;
  lang: Language;
  student: { id: string; photo?: string | null };
};

const formatDate = (iso: string | undefined, lang: Language) =>
  iso
    ? new Date(iso).toLocaleString(lang === "th" ? "th-TH" : "en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/**
 * The score card of reviewed work: a ring with the score, review and hand-in
 * dates, a mood (happy = green with a cheering mascot, otherwise a calm blue
 * card, never a sad one), then the teacher's rubric when it may be shown.
 */
export default function ReviewedCard({
  assignment,
  subject,
  lang,
  student,
}: Props) {
  const t = assignmentPageLanguage;
  const soa = assignment.studentOnAssignment;
  const canView = canStudentViewScore(subject, assignment);
  const score = canView ? soa.score : null;
  const mood = reviewedMood(score, assignment.maxScore);
  const cheer = mood === "cheer";
  const percent =
    score !== null && assignment.maxScore > 0
      ? Math.min(100, Math.max(0, (score / assignment.maxScore) * 100))
      : 0;
  const reviewedAt = formatDate(soa.reviewdAt, lang);
  const turnedInAt = formatDate(soa.completedAt, lang);
  const bg = cheer ? "#27AE60" : "#2C7CD1";
  const shadow = cheer ? "#1E8E4E" : "#275d96";

  const heading = cheer
    ? t.greatJob(lang)
    : mood === "encourage"
      ? t.keepGoing(lang)
      : t.reviewedTitle(lang);

  return (
    <section>
      <div
        className={`relative flex gap-3 overflow-hidden rounded-[20px] p-3 text-white ${
          score === null ? "flex-col items-start" : "items-center"
        }`}
        style={{ background: bg, boxShadow: `0 5px 0 ${shadow}` }}
      >
        {score !== null ? (
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#fff ${percent * 3.6}deg, rgba(255,255,255,.3) 0)`,
            }}
          >
            <span
              className="grid h-[50px] w-[50px] place-items-center rounded-full text-sm font-bold"
              style={{ background: bg }}
            >
              {formatScore(score)}/{formatScore(assignment.maxScore)}
            </span>
          </div>
        ) : canView ? (
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            {classworkDataLanguage.notGraded(lang)}
          </span>
        ) : (
          <ScoreHiddenBadge />
        )}
        <div className={`min-w-0 ${mood ? "flex-1 pr-20" : ""}`}>
          <div className="text-base font-bold leading-tight">{heading}</div>
          <div className="mt-0.5 text-[11px] font-semibold opacity-90">
            {reviewedAt && <div>{t.reviewedOn(lang, reviewedAt)}</div>}
            {turnedInAt && <div>{t.turnedInOn(lang, turnedInAt)}</div>}
          </div>
        </div>
        {mood && (
          <div className="pointer-events-none absolute -bottom-3.5 -right-2 h-24 w-24">
            {/* Cheer plays happy once; encourage stays on its poster. */}
            <MascotAvatar
              clips={mascotForStudent(student)}
              alt=""
              id={student.id}
              idle={false}
              reactOnMount={cheer ? "happy" : undefined}
              sizes="96px"
            />
          </div>
        )}
      </div>

      {canView && assignment.type === "Assignment" && assignment.rubricId && (
        <RubricBreakdown studentOnAssignmentId={soa.id} />
      )}
    </section>
  );
}
