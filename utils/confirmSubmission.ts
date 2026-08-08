type AssignmentType = "Assignment" | "Material" | "VideoQuiz";
type SubmissionStatus = "PENDDING" | "SUBMITTED" | "REVIEWD" | "IMPROVED";

export function hasUnconfirmedWork(input: {
  assignmentType: AssignmentType;
  fileCount: number;
  status: SubmissionStatus;
}): boolean {
  return (
    input.assignmentType !== "Material" &&
    input.fileCount > 0 &&
    (input.status === "PENDDING" || input.status === "IMPROVED")
  );
}

function pathnameOf(url: string): string {
  const path = url.split(/[?#]/)[0];
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isSamePath(currentAsPath: string, targetUrl: string): boolean {
  return pathnameOf(currentAsPath) === pathnameOf(targetUrl);
}
