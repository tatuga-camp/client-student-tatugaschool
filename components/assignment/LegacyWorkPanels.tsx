import React from "react";
import CommentSection from "../subject/CommentSection";
import { LegacyStatusInfo } from "./LegacyStatusInfo";
import type { AssignmentItem } from "./types";

/*
 * LEGACY panels of the old assignment page, kept mounted under the new
 * scaffold until Part 3 Task 4 replaces them (status table, comments).
 * "Your work" now lives in YourWorkSheet.
 */
export function LegacyWorkPanels({
  assignment,
  subjectId,
}: {
  assignment: AssignmentItem;
  subjectId: string;
}) {
  return (
    <>
      <LegacyStatusInfo assignment={assignment} subjectId={subjectId} />
      <CommentSection
        studentOnAssignmentId={assignment.studentOnAssignment.id}
      />
    </>
  );
}
