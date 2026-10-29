/** Sign-in body for a picked student: the person's id, not the enrolment's. */
export function signInRequest(
  student: { studentId: string },
  password?: string,
): { studentId: string; password?: string } {
  return password === undefined
    ? { studentId: student.studentId }
    : { studentId: student.studentId, password };
}
