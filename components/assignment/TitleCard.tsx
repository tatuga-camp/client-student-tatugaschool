import React from "react";
import { LuClock, LuStar } from "react-icons/lu";
import {
  assignmentPageLanguage,
  subjectHomeLanguage,
} from "../../data/languages";
import { Language } from "../../interfaces";
import { dueUrgency, timeAgo, timeLeft } from "../../utils";
import {
  DUE_PILL,
  pill,
  STATUS_PILL,
  statusLabel,
  TONES,
  typeLabel,
} from "../classwork/tones";
import type { AssignmentItem } from "./types";

type Props = { assignment: AssignmentItem; lang: Language; now: Date };

/** Type tile and "TYPE · N points", the title, then due / weight / status pills. */
export default function TitleCard({ assignment, lang, now }: Props) {
  const tone = TONES[assignment.type] ?? TONES.Assignment;
  const isMaterial = assignment.type === "Material";
  const soa = assignment.studentOnAssignment;
  const urgency = dueUrgency(assignment, now);
  const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const dueText = due
    ? due.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  const dueRelative = due
    ? due.getTime() <= now.getTime()
      ? assignmentPageLanguage.timeAgo(
          lang,
          timeAgo({ pastTime: due.toISOString(), language: lang }),
        )
      : assignmentPageLanguage.timeLeft(
          lang,
          timeLeft({ targetTime: due.toISOString(), language: lang }),
        )
    : "";

  return (
    <section className="chunky p-3">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] text-[15px] ${tone.tile}`}
        >
          {tone.icon}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide ${tone.label}`}
        >
          {typeLabel(assignment.type, lang)}
          {!isMaterial &&
            ` · ${assignmentPageLanguage.pointsCount(lang, assignment.maxScore)}`}
        </span>
      </div>
      <h2 className="my-1.5 text-base font-bold leading-tight text-icon-color">
        {assignment.title}
      </h2>
      <div className="flex flex-wrap items-center gap-1">
        {urgency !== "none" && (
          <span className={`${pill} ${DUE_PILL[urgency]}`}>
            <LuClock aria-hidden />
            {urgency === "done" ? dueText : `${dueText} · ${dueRelative}`}
          </span>
        )}
        {!isMaterial && assignment.weight !== null && (
          <span className={`${pill} bg-amber-100 text-amber-700`}>
            <LuStar aria-hidden />
            {subjectHomeLanguage.weightOfGrade(lang, assignment.weight)}
          </span>
        )}
        {!isMaterial && soa && (
          <span
            className={`${pill} ${STATUS_PILL[soa.status] ?? STATUS_PILL.PENDDING}`}
          >
            {statusLabel(soa.status, lang)}
          </span>
        )}
      </div>
    </section>
  );
}
