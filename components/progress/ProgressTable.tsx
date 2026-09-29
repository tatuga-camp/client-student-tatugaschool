import Image from "next/image";
import { TbChevronDown, TbChevronRight, TbEyeOff } from "react-icons/tb";
import { defaultBlurHash } from "../../data";
import { progressLanguage } from "../../data/languages";
import {
  Language,
  PublicProgress,
  PublicProgressCellStatus,
  PublicProgressStudent,
} from "../../interfaces";
import {
  decodeBlurhashToCanvas,
  formatScore,
  ProgressColumn,
  ProgressSegment,
} from "../../utils";
import ProgressCell from "./ProgressCell";

// Opaque equivalent of bg-primary-color/5 over white (#2C7CD1 @ 5%).
const TINT = "bg-[#F4F8FD]";
const HEAD =
  "border-b border-r border-gray-100 bg-background-color p-0 text-left align-bottom font-normal";
const PILL: Record<Exclude<PublicProgressCellStatus, "NONE">, string> = {
  REVIEWD: "bg-success-color/10 text-success-color",
  SUBMITTED: "bg-info-color/10 text-info-color",
  IMPROVED: "bg-warning-color/20 text-amber-700",
  PENDDING: "bg-error-color text-white",
};

// A student may have no entry for a column, and "NONE" has no tint.
function cellBackground(status: PublicProgressCellStatus | undefined): string {
  return status && status !== "NONE"
    ? PILL[status]
    : "bg-white group-hover:bg-background-color";
}

function ProgressTable({
  data,
  segments,
  columns,
  students,
  language,
  onToggleGroup,
}: {
  data: PublicProgress;
  segments: ProgressSegment[];
  columns: ProgressColumn[];
  students: PublicProgressStudent[];
  language: Language;
  onToggleGroup: (tag: string) => void;
}) {
  const showScores = data.level !== "STATUS";
  const showGrade = data.level === "GRADE";
  const hasGroups = segments.some((s) => s.kind === "group");
  const rowSpan = hasGroups ? 2 : 1;

  const header = (column: ProgressColumn, span: number) => {
    if (column.kind === "subtotal") {
      return (
        <th
          key={column.key}
          rowSpan={span}
          className={`border-b border-r border-gray-100 p-0 text-left align-bottom font-normal ${TINT}`}
        >
          <div className="flex w-14 flex-col gap-0.5 px-1.5 py-1.5 md:w-28 md:px-3 md:py-2">
            <span className="truncate text-[11px] font-semibold text-primary-color md:text-xs">
              {column.tag} {progressLanguage.groupTotal(language)}
            </span>
            <span className="truncate text-[10px] tabular-nums text-gray-500 md:text-[11px]">
              {formatScore(column.maxTotal)} {progressLanguage.points(language)}
            </span>
          </div>
        </th>
      );
    }
    const c = column.column;
    return (
      <th key={column.key} rowSpan={span} className={HEAD}>
        <div className="flex w-14 flex-col gap-0.5 px-1.5 py-1.5 md:w-36 md:px-3 md:py-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-icon-color md:text-xs">
            <span className="truncate" title={c.title}>
              {c.title}
            </span>
            {c.kind === "assignment" && c.scoreHidden && showScores && (
              <TbEyeOff className="shrink-0 text-gray-400" />
            )}
          </span>
          {c.kind === "special" && (
            <span className="truncate text-[10px] text-gray-500 md:text-[11px]">
              {progressLanguage.special(language)}
            </span>
          )}
          {c.kind === "assignment" && c.maxScore !== undefined && (
            <span className="truncate text-[10px] tabular-nums text-gray-500 md:text-[11px]">
              {c.maxScore} {progressLanguage.points(language)}
              {c.weight !== null && c.weight !== undefined && ` · ${c.weight}%`}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="relative max-h-[70dvh] w-full overflow-auto rounded-2xl border border-gray-200 bg-white">
      {/* cellPadding opts out of the global TinyMCE rule
          `table:not([cellpadding]) td { padding }` that outranks p-0. */}
      <table
        cellPadding={0}
        className="min-w-full border-separate border-spacing-0"
      >
        <thead className="sticky top-0 z-30">
          <tr>
            <th
              rowSpan={rowSpan}
              className={`sticky left-0 z-40 ${HEAD} px-1.5 py-1.5 align-middle text-[11px] font-medium text-gray-500 md:px-3 md:py-2 md:text-xs`}
            >
              {progressLanguage.student(language)}
            </th>
            {segments.map((segment) =>
              segment.kind === "single" ? (
                header(segment.column, rowSpan)
              ) : (
                <th
                  key={`band:${segment.tag}`}
                  colSpan={segment.columns.length}
                  className="border-b border-r border-gray-100 bg-background-color p-0 text-left font-normal"
                >
                  <button
                    type="button"
                    disabled={!showScores}
                    onClick={() => onToggleGroup(segment.tag)}
                    aria-expanded={!segment.collapsed}
                    title={
                      showScores
                        ? segment.collapsed
                          ? progressLanguage.expandGroup(language)
                          : progressLanguage.collapseGroup(language)
                        : undefined
                    }
                    className="flex w-full items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-color enabled:hover:bg-gray-100"
                  >
                    {showScores &&
                      (segment.collapsed ? (
                        <TbChevronRight />
                      ) : (
                        <TbChevronDown />
                      ))}
                    <span className="truncate">{segment.tag}</span>
                    <span className="shrink-0 font-normal text-gray-500">
                      ·{" "}
                      {progressLanguage.assignmentsCount(
                        language,
                        segment.assignmentCount,
                      )}
                    </span>
                  </button>
                </th>
              ),
            )}
            {showScores && (
              <th
                rowSpan={rowSpan}
                className={`z-30 border-b border-r border-gray-100 px-1.5 py-1.5 text-left align-bottom font-normal md:px-3 md:py-2 lg:sticky ${showGrade ? "lg:right-20" : "lg:right-0"} ${TINT}`}
              >
                <div className="flex w-12 flex-col gap-0.5 md:w-24">
                  <span className="text-[11px] font-semibold text-icon-color md:text-xs">
                    {progressLanguage.total(language)}
                  </span>
                  <span className="truncate text-[10px] tabular-nums text-gray-500 md:text-[11px]">
                    {formatScore(data.maxTotal ?? 0)}{" "}
                    {progressLanguage.points(language)}
                  </span>
                </div>
              </th>
            )}
            {showGrade && (
              <th
                rowSpan={rowSpan}
                className={`z-30 w-12 min-w-12 border-b border-gray-100 px-1.5 py-1.5 text-left align-bottom text-[11px] font-semibold text-icon-color md:w-20 md:min-w-20 md:px-3 md:py-2 md:text-xs lg:sticky lg:right-0 ${TINT}`}
              >
                {progressLanguage.grade(language)}
              </th>
            )}
          </tr>
          {hasGroups && (
            <tr>
              {segments.flatMap((segment) =>
                segment.kind === "group"
                  ? segment.columns.map((column) => header(column, 1))
                  : [],
              )}
            </tr>
          )}
        </thead>
        <tbody>
          {students.map((student) => {
            return (
              <tr key={student.id} className="group">
                <td className="sticky left-0 z-20 border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color">
                  <div
                    className="flex h-11 w-24 items-center gap-3 px-1.5 md:h-14 md:w-72 md:px-3"
                    title={`${student.firstName} ${student.lastName}`}
                  >
                    <div className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 md:block">
                      <Image
                        src={student.photo}
                        alt={student.firstName}
                        fill
                        sizes="36px"
                        placeholder="blur"
                        blurDataURL={decodeBlurhashToCanvas(
                          student.blurHash ?? defaultBlurHash,
                        )}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-icon-color md:text-sm">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="truncate text-[11px] text-gray-500 md:text-xs">
                        {progressLanguage.number(language)} {student.number}
                        {!showScores &&
                          ` · ${progressLanguage.submittedOf(language, student.submittedCount, student.assignedCount)}`}
                      </p>
                    </div>
                  </div>
                </td>
                {columns.map((column) =>
                  column.kind === "subtotal" ? (
                    <td
                      key={column.key}
                      className={`border-b border-r border-gray-100 p-0 ${TINT}`}
                    >
                      <div className="flex h-11 items-center justify-center text-xs font-semibold tabular-nums text-primary-color md:h-14 md:text-sm">
                        {formatScore(student.groupTotals?.[column.tag] ?? 0)}
                      </div>
                    </td>
                  ) : (
                    <td
                      key={column.key}
                      className={`border-b border-r border-gray-100 p-0 ${cellBackground(student.cells[column.column.id]?.status)}`}
                    >
                      <ProgressCell
                        cell={student.cells[column.column.id]}
                        // At STATUS nothing is scored, so don't single out
                        // the assignments the teacher hid.
                        scoreHidden={
                          showScores &&
                          column.kind === "assignment" &&
                          column.column.scoreHidden
                        }
                        language={language}
                      />
                    </td>
                  ),
                )}
                {showScores && (
                  <td
                    className={`z-20 border-b border-r border-gray-100 p-0 lg:sticky ${showGrade ? "lg:right-20" : "lg:right-0"} ${TINT}`}
                  >
                    <div className="flex h-11 w-12 items-center justify-center text-xs font-semibold tabular-nums text-icon-color md:h-14 md:w-24 md:text-sm">
                      {formatScore(student.total ?? 0)}
                    </div>
                  </td>
                )}
                {showGrade && (
                  <td
                    className={`z-20 w-12 min-w-12 border-b border-gray-100 p-0 md:w-20 md:min-w-20 lg:sticky lg:right-0 ${TINT}`}
                  >
                    <div className="flex h-11 items-center justify-center text-xs font-semibold text-icon-color md:h-14 md:text-sm">
                      {student.grade ?? "N/A"}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProgressTable;
