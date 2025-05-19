import React from "react";
import { StudentAssignmentStatus } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { classworkCardDataLanguage } from "../../data/language";

type Props = {
  status: StudentAssignmentStatus;
};
function AssignmentStatusCard({ status }: Props) {
  const language = useGetLanguage();
  return (
    <div
      className={`flex h-full w-full items-center rounded-md px-2 py-2 text-white ${
        status === "SUBMITTED" &&
        "bg-gradient-to-r from-amber-200 to-yellow-400"
      } ${
        status === "REVIEWD" && "bg-gradient-to-r from-emerald-400 to-cyan-400"
      } ${
        status === "PENDDING" && "bg-gradient-to-r from-stone-500 to-stone-700"
      } ${
        status === "IMPROVED" && "bg-gradient-to-r from-red-400 to-rose-400"
      } justify-center text-sm font-normal`}
    >
      {status === "SUBMITTED" &&
        classworkCardDataLanguage.WaitReview(language.data ?? "en")}
      {status === "REVIEWD" &&
        classworkCardDataLanguage.Reviewed(language.data ?? "en")}
      {status === "PENDDING" &&
        classworkCardDataLanguage.NoWork(language.data ?? "en")}
      {status === "IMPROVED" &&
        classworkCardDataLanguage.Improve(language.data ?? "en")}
    </div>
  );
}

export default AssignmentStatusCard;
