import { TbEyeOff } from "react-icons/tb";
import { progressLanguage } from "../../data/languages";
import {
  Language,
  PublicProgressCell,
  PublicProgressCellStatus,
} from "../../interfaces";
import { formatScore } from "../../utils";

function statusLabel(
  status: Exclude<PublicProgressCellStatus, "NONE">,
  language: Language,
) {
  switch (status) {
    case "REVIEWD":
      return progressLanguage.reviewed(language);
    case "SUBMITTED":
      return progressLanguage.waitingReview(language);
    case "IMPROVED":
      return progressLanguage.needsImprovement(language);
    case "PENDDING":
      return progressLanguage.noWork(language);
  }
}

function ProgressCell({
  cell,
  scoreHidden,
  language,
}: {
  cell: PublicProgressCell | undefined;
  scoreHidden: boolean;
  language: Language;
}) {
  if (!cell || cell.status === "NONE") {
    return (
      <div
        title={progressLanguage.notAssigned(language)}
        className="flex h-11 items-center justify-center text-sm text-gray-300 md:h-14"
      >
        —
      </div>
    );
  }
  if (cell.score !== undefined) {
    return (
      <div className="flex h-11 items-center justify-center text-xs font-semibold tabular-nums text-icon-color md:h-14 md:text-sm">
        {formatScore(cell.score)}
      </div>
    );
  }
  return (
    <div className="flex h-11 flex-col items-center justify-center gap-0.5 px-1 md:h-14 md:gap-1 md:px-2">
      <span
        title={statusLabel(cell.status, language)}
        className={`inline-flex max-w-full items-center text-center text-[10px] font-medium leading-tight md:w-max md:rounded-full md:px-2 md:py-0.5 md:text-xs`}
      >
        <span className="md:hidden">
          {cell.status === "IMPROVED"
            ? progressLanguage.needsImprovementShort(language)
            : statusLabel(cell.status, language)}
        </span>
        <span className="hidden md:inline">
          {statusLabel(cell.status, language)}
        </span>
      </span>
      {scoreHidden && cell.status === "REVIEWD" && (
        <span className="hidden items-center gap-1 text-[11px] text-gray-400 md:inline-flex">
          <TbEyeOff />
          {progressLanguage.scoreHidden(language)}
        </span>
      )}
    </div>
  );
}

export default ProgressCell;
