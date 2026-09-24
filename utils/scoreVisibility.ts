type SubjectVisibility =
  | { allowStudentViewScoreOnAssignment?: boolean }
  | null
  | undefined;

type AssignmentVisibility = { allowStudentViewScore?: boolean };

/**
 * A student may see an assignment's score only when the subject-wide
 * setting allows it AND the assignment itself does not hide it.
 * Missing keys (older cached objects) count as "allowed".
 */
export function canStudentViewScore(
  subject: SubjectVisibility,
  assignment: AssignmentVisibility,
): boolean {
  const subjectAllows = subject?.allowStudentViewScoreOnAssignment !== false;
  const assignmentAllows = assignment.allowStudentViewScore !== false;
  return subjectAllows && assignmentAllows;
}

export type OverviewAssignmentRow = {
  assignment: {
    maxScore: number;
    weight: number | null;
    allowStudentViewScore?: boolean;
  };
  studentOnAssignment: { score: number | null };
};

/**
 * Totals for the Grade tab. Hidden rows contribute nothing to `earned`
 * or `max` so the hidden score cannot be back-calculated.
 * Weighting matches the previous inline logic: (score / maxScore) * weight.
 */
export function summarizeAssignmentScores(
  rows: OverviewAssignmentRow[],
  subject: SubjectVisibility,
): { earned: number; max: number; hiddenCount: number } {
  let earned = 0;
  let max = 0;
  let hiddenCount = 0;

  for (const row of rows) {
    if (!canStudentViewScore(subject, row.assignment)) {
      hiddenCount += 1;
      continue;
    }
    const raw = row.studentOnAssignment.score ?? 0;
    const maxScore = row.assignment.maxScore;
    let score = raw;
    if (row.assignment.weight !== null) {
      score = maxScore > 0 ? (raw / maxScore) * row.assignment.weight : 0;
    }
    earned += score;
    max += maxScore;
  }

  return { earned, max, hiddenCount };
}
