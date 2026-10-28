import type {
  AssignmentType,
  StudentAssignmentContentType,
  StudentAssignmentStatus,
} from "../interfaces";

export function teacherFileOpenMode(file: {
  type: string;
  url: string;
}): "video" | "pdf" | "image" | "external" {
  if (file.type.startsWith("video/")) return "video";
  const path = file.url.split(/[?#]/)[0];
  if (file.type === "application/pdf" || /\.pdf$/i.test(path)) return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "external";
}

export function workItemMenu(input: {
  contentType: StudentAssignmentContentType;
  type: string;
  allowStudentDeleteWork: boolean;
}): ("open" | "rename" | "delete")[] {
  const menu: ("open" | "rename" | "delete")[] =
    input.contentType === "TEXT" ? ["open"] : ["open", "rename"];
  if (input.allowStudentDeleteWork) menu.push("delete");
  return menu;
}

export function yourWorkMode(
  type: AssignmentType,
  status: StudentAssignmentStatus | undefined,
): "none" | "open" | "turnedIn" | "reviewed" {
  if (type === "Material" || type === "Quiz") return "none";
  if (status === "REVIEWD") return "reviewed";
  if (status === "SUBMITTED") return "turnedIn";
  return "open";
}

export function turnInSummary(input: {
  dueDate?: string | null;
  completedAt?: string | null;
  itemCount: number;
}): { onTime: boolean | null; itemCount: number; sentAt: Date | null } {
  const sentAt = input.completedAt ? new Date(input.completedAt) : null;
  const due = input.dueDate ? new Date(input.dueDate) : null;
  const onTime = sentAt && due ? sentAt.getTime() <= due.getTime() : null;
  return { onTime, itemCount: input.itemCount, sentAt };
}

export function reviewedMood(
  score: number | null,
  maxScore: number,
): "cheer" | "encourage" | null {
  if (score === null) return null;
  if (maxScore <= 0) return "cheer";
  return score / maxScore >= 0.5 ? "cheer" : "encourage";
}

export function nextAssignmentAfter<T extends { id: string; order: number }>(
  items: T[],
  current: { order: number },
): T | null {
  let next: T | null = null;
  for (const item of items) {
    if (item.order > current.order && (!next || item.order < next.order)) {
      next = item;
    }
  }
  return next;
}
