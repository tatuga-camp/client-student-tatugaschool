import type {
  AssignmentType,
  StudentAssignmentContentType,
  StudentAssignmentStatus,
} from "../interfaces";

/** Formats the browsers (other than Safari) can't draw in an <img>. */
const SAFARI_ONLY_IMAGE = /^image\/hei[cf]$/i;

export function teacherFileOpenMode(file: {
  type?: string | null;
  url: string;
}): "video" | "pdf" | "image" | "external" {
  const type = file.type ?? "";
  if (type.startsWith("video/")) return "video";
  const path = file.url.split(/[?#]/)[0];
  if (type === "application/pdf" || /\.pdf$/i.test(path)) return "pdf";
  if (SAFARI_ONLY_IMAGE.test(type)) return "external";
  if (type.startsWith("image/")) return "image";
  return "external";
}

/** A teacher's link is stored as a file whose type is the literal "LINK". */
export function isLinkFile(file: { type?: string | null }): boolean {
  return file.type === "LINK";
}

export type TeacherFileKind = "video" | "pdf" | "image" | "link" | "file";

/** How a teacher file is labelled and which tile it gets. */
export function teacherFileKind(file: {
  type?: string | null;
  url: string;
}): TeacherFileKind {
  if (isLinkFile(file)) return "link";
  const mode = teacherFileOpenMode(file);
  return mode === "external" ? "file" : mode;
}

export function teacherFileName(file: {
  name?: string | null;
  url: string;
}): string {
  if (file.name) return file.name;
  const last = file.url.split(/[?#]/)[0].split("/").pop() || file.url;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export function fileSizeLabel(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Rich text with visible content (editors leave "<p></p>" behind). */
export function hasRichContent(html: string | null | undefined): boolean {
  if (!html) return false;
  if (/<(img|iframe|video|audio)[\s>/]/i.test(html)) return true;
  return html.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0;
}

export function workItemMenu(input: {
  contentType: StudentAssignmentContentType;
  type: string;
  allowStudentDeleteWork: boolean;
  /** Reviewed work is locked: the items can only be opened. */
  reviewed?: boolean;
}): ("open" | "rename" | "delete")[] {
  if (input.reviewed) return ["open"];
  const menu: ("open" | "rename" | "delete")[] =
    input.contentType === "TEXT" ? ["open"] : ["open", "rename"];
  if (input.allowStudentDeleteWork) menu.push("delete");
  return menu;
}

/** The progress shown from the moment files are picked, before any byte is sent. */
export function initialUploadProgress(count: number): {
  percent: number;
  index: number;
  count: number;
} {
  return { percent: 0, index: 1, count };
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

/** A score as the student sees it: up to 2 decimals, none when whole. */
export function formatScore(score: number): string {
  return String(Number(score.toFixed(2)));
}
