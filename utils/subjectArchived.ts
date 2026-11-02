// Archived subjects are closed to students (spec 2026-11-02-archived-subject-
// block). The server answers a student's request for one with a 403 whose
// body carries `code: "SUBJECT_ARCHIVED"`; an older server instead serves the
// subject with `isAchieved: true`. Either way the student sees the archived
// screen, and archived subjects stay out of their lists.

export const SUBJECT_ARCHIVED_CODE = "SUBJECT_ARCHIVED";

/** The server's "students can't open this archived subject" 403. */
export function isSubjectArchivedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { statusCode?: unknown; code?: unknown };
  return e.statusCode === 403 && e.code === SUBJECT_ARCHIVED_CODE;
}

/** A subject the student can't enter: archived on load, or refused as archived. */
export function isSubjectArchived(
  subject?: { isAchieved?: boolean } | null,
  error?: unknown,
): boolean {
  return subject?.isAchieved === true || isSubjectArchivedError(error);
}

/** The subjects a student can open, in the same order, minus `excludeId`. */
export function activeSubjects<T extends { id: string; isAchieved?: boolean }>(
  subjects: T[],
  excludeId?: string,
): T[] {
  return subjects.filter((s) => s.isAchieved !== true && s.id !== excludeId);
}
