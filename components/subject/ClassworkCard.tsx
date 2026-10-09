import React from "react";
import { BiBook, BiLock } from "react-icons/bi";
import { FiPaperclip } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";
import { MdAssignment, MdQuiz, MdVideoLibrary } from "react-icons/md";
import { subjectHomeLanguage } from "../../data/languages";
import {
  Assignment,
  AssignmentType,
  FileOnAssignment,
  StudentOnAssignment,
} from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { classworkBucket, DueUrgency, dueUrgency } from "../../utils";
import AssignmentStatusCard from "./AssignmentStatus";
import { TagChipList } from "./AssignmentTagEditor";
import RubricBreakdown from "./RubricBreakdown";
import ScoreHiddenBadge from "./ScoreHiddenBadge";

type PropsClassworkCard = {
  classwork: Assignment & {
    files: FileOnAssignment[] | [];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
  canViewScore: boolean;
  locked?: boolean;
  now?: Date;
};

// Full class names only: Tailwind cannot see classes built from strings.
const TONES: Record<
  AssignmentType,
  { tile: string; label: string; border: string; icon: React.ReactNode }
> = {
  Assignment: {
    tile: "bg-sky-100 text-sky-600",
    label: "text-sky-600",
    border: "border-sky-100 hover:border-sky-300",
    icon: <MdAssignment />,
  },
  Quiz: {
    tile: "bg-violet-100 text-violet-600",
    label: "text-violet-600",
    border: "border-violet-100 hover:border-violet-300",
    icon: <MdQuiz />,
  },
  VideoQuiz: {
    tile: "bg-pink-100 text-pink-600",
    label: "text-pink-600",
    border: "border-pink-100 hover:border-pink-300",
    icon: <MdVideoLibrary />,
  },
  Material: {
    tile: "bg-teal-100 text-teal-600",
    label: "text-teal-600",
    border: "border-teal-100 hover:border-teal-300",
    icon: <BiBook />,
  },
};

const DUE_CHIP: Record<Exclude<DueUrgency, "none">, string> = {
  overdue: "bg-rose-100 text-rose-600",
  soon: "bg-amber-100 text-amber-700",
  later: "bg-gray-100 text-gray-600",
  done: "bg-gray-50 text-gray-400",
};

function stripHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function typeLabel(type: AssignmentType, lang: "en" | "th") {
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

function ClassworkCard({
  classwork,
  onSelect,
  canViewScore,
  locked,
  now = new Date(),
}: PropsClassworkCard) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [showRubric, setShowRubric] = React.useState(false);

  const tone = TONES[classwork.type] ?? TONES.Assignment;
  const isMaterial = classwork.type === "Material";
  const bucket = classworkBucket(classwork);
  const urgency = dueUrgency(classwork, now);
  const soa = classwork.studentOnAssignment;
  const graded = bucket === "graded";
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

  return (
    <li className="w-full list-none">
      <button
        type="button"
        disabled={locked}
        onClick={() => onSelect(classwork)}
        className={`group relative flex w-full gap-3 rounded-3xl border-2 bg-white p-3.5 text-left font-Anuphan shadow-sm transition sm:gap-4 sm:p-4 ${
          locked
            ? "cursor-not-allowed border-gray-100 opacity-60"
            : `${tone.border} hover:-translate-y-0.5 hover:shadow-md`
        }`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl sm:h-14 sm:w-14 ${
            locked ? "bg-gray-100 text-gray-400" : tone.tile
          }`}
        >
          {locked ? <BiLock /> : tone.icon}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                locked ? "text-gray-400" : tone.label
              }`}
            >
              {typeLabel(classwork.type, lang)}
            </span>
            {!isMaterial && soa && <AssignmentStatusCard status={soa.status} />}
          </div>

          <h3 className="line-clamp-2 text-base font-bold leading-snug text-icon-color sm:text-lg">
            {classwork.title}
          </h3>

          {description && (
            <p className="line-clamp-2 text-sm text-gray-500">{description}</p>
          )}

          {classwork.tags && classwork.tags.length > 0 && (
            <TagChipList tags={classwork.tags} size="sm" />
          )}

          {locked ? (
            <p className="mt-1 text-xs font-medium text-gray-500">
              🔒 {subjectHomeLanguage.lockedHint(lang)}
            </p>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {urgency !== "none" && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${DUE_CHIP[urgency]}`}
                >
                  {urgency === "overdue"
                    ? `⏰ ${subjectHomeLanguage.dueOverdue(lang, dueText)}`
                    : urgency === "soon"
                      ? `⚡ ${subjectHomeLanguage.dueSoon(lang, dueText)}`
                      : `📅 ${subjectHomeLanguage.dueLater(lang, dueText)}`}
                </span>
              )}
              {!isMaterial && classwork.weight !== null && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                  ⭐ {subjectHomeLanguage.weightOfGrade(lang, classwork.weight)}
                </span>
              )}
              {classwork.files?.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  <FiPaperclip aria-hidden />
                  {subjectHomeLanguage.fileCount(lang, classwork.files.length)}
                </span>
              )}
            </div>
          )}
        </div>

        {hasScore && (
          <div className="flex shrink-0 flex-col items-end justify-center">
            {canViewScore ? (
              <ScoreBubble {...displayScore(classwork, soa.score ?? 0)} />
            ) : (
              <ScoreHiddenBadge size="sm" />
            )}
          </div>
        )}
      </button>

      {canViewScore &&
        graded &&
        classwork.type === "Assignment" &&
        classwork.rubricId && (
          <div className="px-3">
            <button
              type="button"
              onClick={() => setShowRubric((v) => !v)}
              aria-expanded={showRubric}
              className="mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50"
            >
              📋 {subjectHomeLanguage.rubric(lang)}
              <IoChevronDown
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

function ScoreBubble({ score, max }: { score: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;
  const ring =
    percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#f43f5e";
  return (
    <div
      className="relative flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
      style={{
        background: `conic-gradient(${ring} ${percent * 3.6}deg, #f1f5f9 0deg)`,
      }}
    >
      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-full bg-white leading-none sm:h-[3.25rem] sm:w-[3.25rem]">
        <span className="text-sm font-extrabold text-icon-color sm:text-base">
          {Number.isInteger(score) ? score : score.toFixed(1)}
        </span>
        <span className="text-[10px] font-medium text-gray-400">/{max}</span>
      </div>
    </div>
  );
}

export default ClassworkCard;
