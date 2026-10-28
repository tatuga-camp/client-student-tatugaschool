import { useState } from "react";
import {
  LuBookMarked,
  LuChevronDown,
  LuClipboardCheck,
  LuClock,
  LuFileText,
  LuListChecks,
  LuLock,
  LuPaperclip,
  LuStar,
  LuVideo,
} from "react-icons/lu";
import {
  classworkCardDataLanguage,
  subjectHomeLanguage,
} from "../../data/languages";
import {
  Assignment,
  AssignmentType,
  FileOnAssignment,
  Language,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../../interfaces";
import { classworkBucket, DueUrgency, dueUrgency } from "../../utils";
import { TagChipList } from "../subject/AssignmentTagEditor";
import RubricBreakdown from "../subject/RubricBreakdown";
import ScoreHiddenBadge from "../subject/ScoreHiddenBadge";

export type ClassworkItem = Assignment & {
  files: FileOnAssignment[] | [];
  studentOnAssignment: StudentOnAssignment;
};

type Props = {
  classwork: ClassworkItem;
  lang: Language;
  now: Date;
  canViewScore: boolean;
  locked?: boolean;
  onSelect: (classwork: ClassworkItem) => void;
};

// Full class names only: Tailwind cannot see classes built from strings.
const TONES: Record<
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

const DUE_PILL: Record<Exclude<DueUrgency, "none">, string> = {
  overdue: "bg-rose-100 text-rose-600",
  soon: "bg-amber-100 text-amber-700",
  later: "bg-gray-100 text-gray-600",
  done: "bg-gray-50 text-gray-400",
};

const STATUS_PILL: Record<StudentAssignmentStatus, string> = {
  PENDDING: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-amber-100 text-amber-700",
  REVIEWD: "bg-emerald-100 text-emerald-700",
  IMPROVED: "bg-rose-100 text-rose-700",
};

function statusLabel(status: StudentAssignmentStatus, lang: Language) {
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

function stripHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function typeLabel(type: AssignmentType, lang: Language) {
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

/** The score as the student sees it: scaled to the weight when there is one. */
function displayScore(assignment: Assignment, raw: number) {
  if (assignment.weight !== null && assignment.maxScore > 0) {
    return {
      score: (raw / assignment.maxScore) * assignment.weight,
      max: assignment.weight,
    };
  }
  return { score: raw, max: assignment.maxScore };
}

const pill =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold";

export default function ClassworkCard({
  classwork,
  lang,
  now,
  canViewScore,
  locked = false,
  onSelect,
}: Props) {
  const [showRubric, setShowRubric] = useState(false);
  const tone = TONES[classwork.type] ?? TONES.Assignment;
  const isMaterial = classwork.type === "Material";
  const soa = classwork.studentOnAssignment;
  const urgency = dueUrgency(classwork, now);
  const graded = classworkBucket(classwork) === "graded";
  const hasScore = !isMaterial && graded && soa?.score != null;
  const description =
    classwork.type === "Assignment" || isMaterial
      ? stripHtml(classwork.description)
      : "";
  const dueText = classwork.dueDate
    ? new Date(classwork.dueDate).toLocaleDateString(
        lang === "th" ? "th-TH" : "en-US",
        { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
      )
    : "";
  const dueLabel =
    urgency === "overdue"
      ? subjectHomeLanguage.dueOverdue(lang, dueText)
      : urgency === "soon"
        ? subjectHomeLanguage.dueSoon(lang, dueText)
        : subjectHomeLanguage.dueLater(lang, dueText);

  return (
    <li className="list-none">
      <button
        type="button"
        disabled={locked}
        onClick={() => onSelect(classwork)}
        className={`flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 border-[#E3E8F0] p-3 text-left font-Anuphan ${
          locked ? "cursor-not-allowed bg-[#F2F4F8] opacity-70" : "bg-white"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px] ${
            locked ? "bg-gray-100 text-gray-400" : tone.tile
          }`}
        >
          {tone.icon}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${
              locked ? "text-gray-400" : tone.label
            }`}
          >
            {typeLabel(classwork.type, lang)}
          </span>
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-icon-color">
            {classwork.title}
          </h3>
          {description && (
            <p className="line-clamp-2 text-xs text-gray-500">{description}</p>
          )}
          {classwork.tags && classwork.tags.length > 0 && (
            <TagChipList tags={classwork.tags} size="sm" />
          )}
          {locked ? (
            <span
              className={`${pill} w-max max-w-full bg-gray-100 text-gray-500`}
            >
              <span className="truncate">
                {subjectHomeLanguage.lockedHint(lang)}
              </span>
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              {urgency !== "none" && (
                <span className={`${pill} ${DUE_PILL[urgency]}`}>
                  <LuClock aria-hidden />
                  {dueLabel}
                </span>
              )}
              {!isMaterial && classwork.weight !== null && (
                <span className={`${pill} bg-amber-100 text-amber-700`}>
                  <LuStar aria-hidden />
                  {subjectHomeLanguage.weightOfGrade(lang, classwork.weight)}
                </span>
              )}
              {classwork.files?.length > 0 && (
                <span className={`${pill} bg-gray-100 text-gray-600`}>
                  <LuPaperclip aria-hidden />
                  {subjectHomeLanguage.fileCount(lang, classwork.files.length)}
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
          )}
        </div>

        {(hasScore || locked) && (
          <div className="flex shrink-0 items-center gap-2">
            {hasScore &&
              (canViewScore ? (
                <ScoreRing {...displayScore(classwork, soa.score ?? 0)} />
              ) : (
                <ScoreHiddenBadge size="sm" />
              ))}
            {locked && (
              <LuLock aria-hidden className="text-xl text-[#9AA3B8]" />
            )}
          </div>
        )}
      </button>

      {!locked &&
        canViewScore &&
        graded &&
        classwork.type === "Assignment" &&
        classwork.rubricId && (
          <div className="px-2">
            <button
              type="button"
              onClick={() => setShowRubric((v) => !v)}
              aria-expanded={showRubric}
              className="mt-1 inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary-color"
            >
              <LuListChecks aria-hidden />
              {subjectHomeLanguage.rubric(lang)}
              <LuChevronDown
                aria-hidden
                className={`transition-transform ${showRubric ? "rotate-180" : ""}`}
              />
            </button>
            {showRubric && soa && (
              <RubricBreakdown studentOnAssignmentId={soa.id} />
            )}
          </div>
        )}
    </li>
  );
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;
  const ring =
    percent >= 80 ? "#27AE60" : percent >= 50 ? "#FFCD1B" : "#F04438";
  return (
    <div
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${ring} ${percent * 3.6}deg, #E3E8F0 0deg)`,
      }}
    >
      <div className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-white leading-none">
        <span className="text-xs font-extrabold text-icon-color">
          {Number.isInteger(score) ? score : score.toFixed(1)}
        </span>
        <span className="text-[8px] font-medium text-gray-400">/{max}</span>
      </div>
    </div>
  );
}
