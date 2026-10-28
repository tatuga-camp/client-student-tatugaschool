import React from "react";
import {
  LuBookMarked,
  LuClipboardCheck,
  LuFileText,
  LuVideo,
} from "react-icons/lu";
import {
  classworkCardDataLanguage,
  subjectHomeLanguage,
} from "../../data/languages";
import {
  AssignmentType,
  Language,
  StudentAssignmentStatus,
} from "../../interfaces";
import { DueUrgency } from "../../utils";

/** Tones, pills and labels shared by the classwork card and the assignment page. */
// Full class names only: Tailwind cannot see classes built from strings.
export const TONES: Record<
  AssignmentType,
  { tile: string; label: string; icon: React.ReactNode }
> = {
  Assignment: {
    tile: "bg-sky-100 text-sky-600",
    label: "text-sky-600",
    icon: <LuFileText />,
  },
  Quiz: {
    tile: "bg-violet-100 text-violet-600",
    label: "text-violet-600",
    icon: <LuClipboardCheck />,
  },
  VideoQuiz: {
    tile: "bg-pink-100 text-pink-600",
    label: "text-pink-600",
    icon: <LuVideo />,
  },
  Material: {
    tile: "bg-teal-100 text-teal-600",
    label: "text-teal-600",
    icon: <LuBookMarked />,
  },
};

export const DUE_PILL: Record<Exclude<DueUrgency, "none">, string> = {
  overdue: "bg-rose-100 text-rose-600",
  soon: "bg-amber-100 text-amber-700",
  later: "bg-gray-100 text-gray-600",
  done: "bg-gray-50 text-gray-400",
};

export const STATUS_PILL: Record<StudentAssignmentStatus, string> = {
  PENDDING: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-amber-100 text-amber-700",
  REVIEWD: "bg-emerald-100 text-emerald-700",
  IMPROVED: "bg-rose-100 text-rose-700",
};

export function statusLabel(status: StudentAssignmentStatus, lang: Language) {
  switch (status) {
    case "SUBMITTED":
      return classworkCardDataLanguage.WaitReview(lang);
    case "REVIEWD":
      return classworkCardDataLanguage.Reviewed(lang);
    case "IMPROVED":
      return classworkCardDataLanguage.Improve(lang);
    default:
      return classworkCardDataLanguage.NoWork(lang);
  }
}

export function typeLabel(type: AssignmentType, lang: Language) {
  switch (type) {
    case "Quiz":
      return subjectHomeLanguage.typeQuiz(lang);
    case "VideoQuiz":
      return subjectHomeLanguage.typeVideo(lang);
    case "Material":
      return subjectHomeLanguage.typeMaterial(lang);
    default:
      return subjectHomeLanguage.typeAssignment(lang);
  }
}

export const pill =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold";
