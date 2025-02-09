import React, { useState } from "react";
import { useGetAssignments } from "../../react-query";
import ClassworkCard from "./ClassworkCard";
import { Assignment } from "../../interfaces";

type Props = {
  subjectId: string;
};
function Classwork({ subjectId }: Props) {
  const assignments = useGetAssignments({ subjectId });

  const [selectAssignment, setSelectAssignment] = useState<Assignment | null>(
    null
  );
  return (
    <ul className="w-full mt-5 p-0 md:p-2 grid gap-2 ">
      {assignments.data
        ?.sort((a, b) => a.order - b.order)
        .map((classwork, index) => {
          return (
            <ClassworkCard
              key={index}
              classwork={classwork}
              selectClasswork={selectAssignment}
              onSelect={(assignment) =>
                setSelectAssignment((prev) => {
                  if (prev?.id === assignment.id) return null;
                  return assignment;
                })
              }
              subjectId={subjectId}
            />
          );
        })}
    </ul>
  );
}

export default Classwork;
