import Image from "next/image";
import { TbChevronDown, TbChevronRight, TbEyeOff } from "react-icons/tb";
import { defaultBlurHash } from "../../data";
import { progressLanguage } from "../../data/languages";
import {
  Language,
  PublicProgress,
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
          <div className="flex w-28 flex-col gap-0.5 px-3 py-2">
            <span className="truncate text-xs font-semibold text-primary-color">
              {column.tag} {progressLanguage.groupTotal(language)}
            </span>
            <span className="text-[11px] tabular-nums text-gray-500">
              {formatScore(column.maxTotal)} {progressLanguage.points(language)}
            </span>
          </div>
        </th>
      );
    }
    const c = column.column;
    return (
      <th key={column.key} rowSpan={span} className={HEAD}>
        <div className="flex w-36 flex-col gap-0.5 px-3 py-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-icon-color">
            <span className="truncate" title={c.title}>
              {c.title}
            </span>
            {c.kind === "assignment" && c.scoreHidden && showScores && (
              <TbEyeOff className="shrink-0 text-gray-400" />
            )}
          </span>
          {c.kind === "special" && (
            <span className="text-[11px] text-gray-500">
              {progressLanguage.special(language)}
            </span>
          )}
          {c.kind === "assignment" && c.maxScore !== undefined && (
            <span className="text-[11px] tabular-nums text-gray-500">
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
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-30">
          <tr>
            <th
              rowSpan={rowSpan}
              className={`sticky left-0 z-40 ${HEAD} px-3 py-2 align-middle text-xs font-medium text-gray-500`}
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
                      (segment.collapsed ? <TbChevronRight /> : <TbChevronDown />)}
                    <span className="truncate">{segment.tag}</span>
                    <span className="shrink-0 font-normal text-gray-500">
                      · {progressLanguage.assignmentsCount(language, segment.assignmentCount)}
                    </span>
                  </button>
                </th>
              ),
            )}
            {showScores && (
              <th
                rowSpan={rowSpan}
                className={`z-30 border-b border-r border-gray-100 px-3 py-2 text-left align-bottom font-normal lg:sticky ${showGrade ? "lg:right-20" : "lg:right-0"} ${TINT}`}
              >
                <div className="flex w-24 flex-col gap-0.5">
                  <span className="text-xs font-semibold text-icon-color">
                    {progressLanguage.total(language)}
                  </span>
                  <span className="text-[11px] tabular-nums text-gray-500">
                    {formatScore(data.maxTotal ?? 0)} {progressLanguage.points(language)}
                  </span>
                </div>
              </th>
            )}
            {showGrade && (
              <th
                rowSpan={rowSpan}
                className={`z-30 w-20 min-w-20 border-b border-gray-100 px-3 py-2 text-left align-bottom text-xs font-semibold text-icon-color lg:sticky lg:right-0 ${TINT}`}
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
          {students.map((student) => (
            <tr key={student.id} className="group">
              <td className="sticky left-0 z-20 border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color">
                <div className="flex h-14 w-52 items-center gap-3 px-3 md:w-72">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200">
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
                    <p className="truncate text-sm font-semibold text-icon-color">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
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
                    <div className="flex h-14 items-center justify-center text-sm font-semibold tabular-nums text-primary-color">
                      {formatScore(student.groupTotals?.[column.tag] ?? 0)}
                    </div>
                  </td>
                ) : (
                  <td
                    key={column.key}
                    className="border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color"
                  >
                    <ProgressCell
                      cell={student.cells[column.column.id]}
                      scoreHidden={
                        column.kind === "assignment" && column.column.scoreHidden
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
                  <div className="flex h-14 w-24 items-center justify-center text-sm font-semibold tabular-nums text-icon-color">
                    {formatScore(student.total ?? 0)}
                  </div>
                </td>
              )}
              {showGrade && (
                <td
                  className={`z-20 w-20 min-w-20 border-b border-gray-100 p-0 lg:sticky lg:right-0 ${TINT}`}
                >
                  <div className="flex h-14 items-center justify-center text-sm font-semibold text-icon-color">
                    {student.grade ?? "N/A"}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProgressTable;
