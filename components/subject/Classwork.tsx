import { useRouter } from "next/router";
import { useGetAssignments, useGetSubjectById } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import ClassworkCard from "./ClassworkCard";

type Props = {
  subjectId: string;
  allowStudentViewScoreOnAssignment: boolean;
};

function Classwork({ subjectId, allowStudentViewScoreOnAssignment }: Props) {
  const router = useRouter();
  const subject = useGetSubjectById({ id: subjectId });
  const assignments = useGetAssignments({ subjectId });

  // 1. Safely copy the array BEFORE sorting so you don't mutate the React Query cache
  const sortedAssignments = assignments.data
    ? [...assignments.data].sort((a, b) => a.order - b.order)
    : [];

  // 2. Find the index of the first incomplete assignment
  let firstIncompleteIndex = -1;
  if (subject.data?.allowStudentDoneAssignmentInOrder) {
    firstIncompleteIndex = sortedAssignments.findIndex((classwork) => {
      const isCompleted =
        classwork.type === "Material" ||
        classwork.studentOnAssignment?.status === "SUBMITTED" ||
        classwork.studentOnAssignment?.status === "REVIEWD"; // Note: ensure "REVIEWD" isn't a typo in your DB!

      return !isCompleted;
    });
  }

  return (
    <>
      {assignments.isLoading && <LoadingBar />}
      <ul className="mt-5 flex h-max w-full flex-col gap-5 p-0 md:p-2">
        {sortedAssignments.map((classwork, index) => {
          // 3. Determine if THIS specific card is locked based on its index
          // It is locked if there IS an incomplete assignment, AND this item comes AFTER it.
          const isLocked =
            subject.data?.allowStudentDoneAssignmentInOrder &&
            firstIncompleteIndex !== -1 &&
            index > firstIncompleteIndex;

          return (
            <ClassworkCard
              key={classwork.id || index} // Use unique ID for key instead of index if possible
              locked={isLocked}
              allowStudentViewScoreOnAssignment={
                allowStudentViewScoreOnAssignment
              }
              onSelect={(a) => {
                router.push(`/subject/${subjectId}/assignment/${a.id}`);
              }}
              classwork={classwork}
              subjectId={subjectId}
            />
          );
        })}
      </ul>
    </>
  );
}

export default Classwork;
