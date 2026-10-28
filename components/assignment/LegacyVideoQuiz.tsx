import React from "react";
import StudentVideoPlayer, {
  StudentVideoPlayerRef,
} from "../common/StudentVideoPlayer";
import { assignmentPageLanguage } from "../../data/languages";
import { StudentOnAssignment } from "../../interfaces";
import {
  useGetAssignments,
  useGetLanguage,
  useUpdateStudentOnAssignment,
} from "../../react-query";
import { nextAssignmentAfter } from "../../utils/assignmentDetail";
import type { AssignmentItem } from "./types";

/** LEGACY video quiz block; Part 3 Task 6 replaces it. */
export function LegacyVideoQuiz({
  assignment,
  subjectId,
}: {
  assignment: AssignmentItem;
  subjectId: string;
}) {
  const language = useGetLanguage();
  const videoPlayerRef = React.useRef<StudentVideoPlayerRef>(null);
  const updateWork = useUpdateStudentOnAssignment();
  const assignments = useGetAssignments({ subjectId });
  const studentOnAssignment: StudentOnAssignment =
    assignment.studentOnAssignment;
  const nextAssignment = nextAssignmentAfter(
    assignments.data ?? [],
    assignment,
  );
  return (
    <div className="chunky p-3">
      {assignment.videoURL && (
        <>
          <StudentVideoPlayer
            nextVideoURL={
              nextAssignment
                ? `/subject/${subjectId}/assignment/${nextAssignment.id}`
                : undefined
            }
            ref={videoPlayerRef}
            src={assignment.videoURL}
            config={{
              preventFastForward:
                studentOnAssignment.status === "REVIEWD"
                  ? false
                  : (assignment.preventFastForward ?? false),
              questions: assignment.questions,
            }}
            cannotSummit={studentOnAssignment.status === "REVIEWD"}
            onSubmit={
              studentOnAssignment.status === "REVIEWD"
                ? undefined
                : (score, total) => {
                    const scorePerQuestions =
                      assignment.maxScore / assignment.questions.length;

                    updateWork.mutate({
                      query: {
                        studentOnAssignmentId: studentOnAssignment.id,
                      },
                      body: {
                        status: "REVIEWD",
                        score: Number((scorePerQuestions * score).toFixed(2)),
                      },
                    });
                  }
            }
          />
          {studentOnAssignment.status === "REVIEWD" && (
            <div className="mt-4 flex animate-pulse items-center justify-center gap-3 rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 text-center font-medium text-yellow-800 shadow-sm transition-all hover:bg-yellow-100">
              <span className="text-2xl">👀</span>
              <span>
                {assignmentPageLanguage.reviewedVideoNotice(
                  language.data ?? "en",
                )}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
