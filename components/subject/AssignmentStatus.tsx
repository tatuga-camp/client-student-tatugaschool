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
      className={`flex w-full items-center h-full 
  text-white py-2 rounded-md px-2 

  ${status === "SUBMITTED" && "bg-gradient-to-r from-amber-200 to-yellow-400"}

  ${status === "REVIEWD" && "bg-gradient-to-r from-emerald-400 to-cyan-400"}

  ${status === "PENDDING" && "bg-gradient-to-r from-stone-500 to-stone-700"}
  justify-center text-sm font-normal `}
    >
      {status === "SUBMITTED" &&
        classworkCardDataLanguage.WaitReview(language.data ?? "en")}
      {status === "REVIEWD" &&
        classworkCardDataLanguage.Reviewed(language.data ?? "en")}
      {status === "PENDDING" &&
        classworkCardDataLanguage.NoWork(language.data ?? "en")}
    </div>
  );
}

export default AssignmentStatusCard;
