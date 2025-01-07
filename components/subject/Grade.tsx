import React from "react";
import { useGetAssignments } from "../../react-query";
import CircleProgress from "../common/CircleProgress";
import BarProgress from "../common/BarProgress";

type Props = {
  subjectId: string;
};
function Grade({ subjectId }: Props) {
  const assignments = useGetAssignments({ subjectId });
  const totalMaxScore = assignments.data?.reduce((acc, curr) => {
    return acc + curr.maxScore;
  }, 0);

  const totalScore = assignments.data?.reduce((acc, curr) => {
    return acc + (curr.studentOnAssignment.score ?? 0);
  }, 0);
  return (
    <div className="w-full gap-2 flex flex-col pt-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <CircleProgress value={totalScore ?? 0} maxValue={totalMaxScore ?? 0} />
        <span className="text-gray-500">Total Score: {totalMaxScore} </span>
      </div>
      <ul className="w-full grid gap-2">
        {assignments.data
          ?.sort((a, b) => a.order - b.order)
          .map((assignment, index) => {
            let maxScore = assignment.maxScore;
            let score = assignment.studentOnAssignment.score ?? 0;
            if (assignment.weight) {
              maxScore = assignment.weight;
              score = (score / assignment.maxScore) * assignment.weight;
            }
            return (
              <div
                className="w-full border p-5 rounded flex flex-col"
                key={index}
              >
                <div className="w-full flex gap-2">
                  <span className="text-black max-w-60 truncate">
                    {assignment.title}
                  </span>
                  <span className="text-gray-500 font-semibold">
                    {score.toFixed(2) ?? 0} / {maxScore}
                  </span>
                  {assignment.weight && (
                    <div className="text-blue-500 bg-blue-100 rounded-md px-1 flex items-center text-xs">
                      {assignment.weight}% weight
                    </div>
                  )}
                </div>
                <BarProgress maxValue={maxScore} value={score ?? 0} />
              </div>
            );
          })}
      </ul>
    </div>
  );
}

export default Grade;
