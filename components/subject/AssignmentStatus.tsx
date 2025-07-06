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
      className={`flex h-full w-full items-center rounded-full px-2 py-2 text-black ${
        status === "SUBMITTED" && "bg-yellow-400 bg-gradient-to-r"
      } ${status === "REVIEWD" && "bg-green-400 text-black"} ${
        status === "PENDDING" && "bg-gray-400 text-black"
      } ${
        status === "IMPROVED" && "bg-red-500 text-white"
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
