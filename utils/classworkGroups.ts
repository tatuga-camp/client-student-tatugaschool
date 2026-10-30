import type { AssignmentType, StudentAssignmentStatus } from "../interfaces";
import { classworkBucket, dueUrgency } from "./subjectHome";

export type GroupableClasswork = {
  id: string;
  type: AssignmentType;
  order: number;
  dueDate?: string | null;
  studentOnAssignment?: { status: StudentAssignmentStatus } | null;
};

export type ClassworkGroupKey =
  | "dueSoon"
  | "todo"
  | "submitted"
  | "graded"
  | "material"
  | "ordered";

const byOrder = <T extends GroupableClasswork>(a: T, b: T) => a.order - b.order;

/** Work still on the student's plate (to-do bucket: pending or sent back). */
const isUnfinishedWork = (item: GroupableClasswork) =>
  classworkBucket(item) === "todo";

/**
 * When the teacher wants work done in order, everything after the first
 * unfinished non-Material item is locked (Materials included).
 */
export function lockedClassworkIds<T extends GroupableClasswork>(
  items: T[],
  inOrder: boolean,
): Set<string> {
  const locked = new Set<string>();
  if (!inOrder) return locked;
  const sorted = [...items].sort(byOrder);
  const firstIncomplete = sorted.findIndex(isUnfinishedWork);
  if (firstIncomplete === -1) return locked;
  for (const item of sorted.slice(firstIncomplete + 1)) locked.add(item.id);
  return locked;
}

export function groupClasswork<T extends GroupableClasswork>(
  items: T[],
  now: Date,
  inOrder: boolean,
): { key: ClassworkGroupKey; items: T[] }[] {
  const sorted = [...items].sort(byOrder);
  if (inOrder) {
    return sorted.length ? [{ key: "ordered", items: sorted }] : [];
  }
  const groups: Record<Exclude<ClassworkGroupKey, "ordered">, T[]> = {
    dueSoon: [],
    todo: [],
    submitted: [],
    graded: [],
    material: [],
  };
  for (const item of sorted) {
    const bucket = classworkBucket(item);
    if (bucket === "todo") {
      const urgency = dueUrgency(item, now);
      const urgent = urgency === "overdue" || urgency === "soon";
      groups[urgent ? "dueSoon" : "todo"].push(item);
    } else {
      groups[bucket].push(item);
    }
  }
  return (["dueSoon", "todo", "submitted", "graded", "material"] as const)
    .filter((key) => groups[key].length > 0)
    .map((key) => ({ key, items: groups[key] }));
}

/** Local Monday 00:00 up to the next Monday 00:00. */
export function weekRange(now: Date): { start: Date; end: Date } {
  const sinceMonday = (now.getDay() + 6) % 7;
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = new Date(y, m, now.getDate() - sinceMonday);
  const end = new Date(y, m, now.getDate() - sinceMonday + 7);
  return { start, end };
}

export function weekProgress(
  items: GroupableClasswork[],
  now: Date,
): { done: number; total: number } {
  const { start, end } = weekRange(now);
  let done = 0;
  let total = 0;
  for (const item of items) {
    if (item.type === "Material" || !item.dueDate) continue;
    const due = new Date(item.dueDate).getTime();
    if (Number.isNaN(due) || due < start.getTime() || due >= end.getTime()) {
      continue;
    }
    total += 1;
    const status = item.studentOnAssignment?.status;
    if (status === "SUBMITTED" || status === "REVIEWD") done += 1;
  }
  return { done, total };
}

/**
 * What the student should do next. Free order: unlocked to-do items by due
 * date (undated last). In order: just the first unfinished work.
 */
export function upNext<T extends GroupableClasswork>(
  items: T[],
  _now: Date,
  inOrder: boolean,
): T[] {
  const sorted = [...items].sort(byOrder);
  if (inOrder) {
    const first = sorted.find(isUnfinishedWork);
    return first ? [first] : [];
  }
  const dueMs = (i: T) =>
    i.dueDate ? new Date(i.dueDate).getTime() : Number.POSITIVE_INFINITY;
  return sorted.filter(isUnfinishedWork).sort((a, b) => {
    const da = dueMs(a);
    const db = dueMs(b);
    if (da === db) return a.order - b.order;
    return da < db ? -1 : 1;
  });
}
