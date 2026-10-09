import React from "react";
import { StudentAssignmentStatus } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { classworkCardDataLanguage } from "../../data/languages";

type Props = {
  status: StudentAssignmentStatus;
};

// Full class names only: Tailwind cannot see classes built from strings.
const STYLES: Record<StudentAssignmentStatus, { chip: string; emoji: string }> =
  {
    PENDDING: { chip: "bg-gray-100 text-gray-600", emoji: "📝" },
    SUBMITTED: { chip: "bg-amber-100 text-amber-700", emoji: "⏳" },
    REVIEWD: { chip: "bg-emerald-100 text-emerald-700", emoji: "✅" },
    IMPROVED: { chip: "bg-rose-100 text-rose-700", emoji: "✏️" },
  };

function AssignmentStatusCard({ status }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const style = STYLES[status] ?? STYLES.PENDDING;
  const label =
    status === "SUBMITTED"
      ? classworkCardDataLanguage.WaitReview(lang)
      : status === "REVIEWD"
        ? classworkCardDataLanguage.Reviewed(lang)
        : status === "IMPROVED"
          ? classworkCardDataLanguage.Improve(lang)
          : classworkCardDataLanguage.NoWork(lang);
  return (
    <span
      className={`inline-flex w-max max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${style.chip}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export default AssignmentStatusCard;
