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
        className="flex h-14 items-center justify-center text-sm text-gray-300"
      >
        —
      </div>
    );
  }
  if (cell.score !== undefined) {
    return (
      <div className="flex h-14 items-center justify-center text-sm font-semibold tabular-nums text-icon-color">
        {formatScore(cell.score)}
      </div>
    );
  }
  return (
    <div className="flex h-14 flex-col items-center justify-center gap-1 px-2">
      <span
        className={`inline-flex w-max items-center rounded-full px-2 py-0.5 text-xs font-medium`}
      >
        {statusLabel(cell.status, language)}
      </span>
      {scoreHidden && cell.status === "REVIEWD" && (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <TbEyeOff />
          {progressLanguage.scoreHidden(language)}
        </span>
      )}
    </div>
  );
}

export default ProgressCell;
