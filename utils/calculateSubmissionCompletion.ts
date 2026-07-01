import { ResponseGetAssignmentsService } from "../services/assignment";

export type SubmissionCompletion = {
  submittedCount: number;
  applicableCount: number;
  /** Round(submittedCount / applicableCount * 100); null when applicableCount === 0. */
  percentage: number | null;
};

/**
 * Submission-based completion for the current student across a subject's
 * assignments. Numerator = SUBMITTED or REVIEWD; denominator = non-Material
 * assignments (Assignment + VideoQuiz). PENDDING and IMPROVED are outstanding.
 */
export function calculateSubmissionCompletion(
  assignments: ResponseGetAssignmentsService,
): SubmissionCompletion {
  let submittedCount = 0;
  let applicableCount = 0;

  for (const assignment of assignments) {
    if (assignment.type === "Material") continue;
    applicableCount += 1;
    const status = assignment.studentOnAssignment?.status;
    if (status === "SUBMITTED" || status === "REVIEWD") {
      submittedCount += 1;
    }
  }

  const percentage =
    applicableCount === 0
      ? null
      : Math.round((submittedCount / applicableCount) * 100);

  return { submittedCount, applicableCount, percentage };
}
