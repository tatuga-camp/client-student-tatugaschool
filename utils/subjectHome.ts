import type { StudentAssignmentStatus } from "../interfaces";

export type ClassworkBucket = "todo" | "submitted" | "graded" | "material";
export type ClassworkFilter = "all" | Exclude<ClassworkBucket, "material">;

type ClassworkLike = {
  type: string;
  studentOnAssignment?: { status: StudentAssignmentStatus } | null;
};

/** Where a classwork item sits on the student's to-do board. */
export function classworkBucket(classwork: ClassworkLike): ClassworkBucket {
  if (classwork.type === "Material") return "material";
  switch (classwork.studentOnAssignment?.status) {
    case "SUBMITTED":
      return "submitted";
    case "REVIEWD":
      return "graded";
    // IMPROVED means the teacher sent it back: it is on the student's plate again.
    default:
      return "todo";
  }
}

export function countClassworkBuckets(items: ClassworkLike[]) {
  const counts = { todo: 0, submitted: 0, graded: 0, material: 0 };
  for (const item of items) counts[classworkBucket(item)] += 1;
  return counts;
}

/** Materials stay visible under every filter: they are reading, not work to hand in. */
export function matchesClassworkFilter(
  classwork: ClassworkLike,
  filter: ClassworkFilter,
): boolean {
  if (filter === "all") return true;
  const bucket = classworkBucket(classwork);
  return bucket === "material" || bucket === filter;
}

export type DueUrgency = "none" | "done" | "overdue" | "soon" | "later";

const SOON_MS = 2 * 24 * 60 * 60 * 1000;

export function dueUrgency(
  classwork: ClassworkLike & { dueDate?: string | Date | null },
  now: Date,
): DueUrgency {
  const bucket = classworkBucket(classwork);
  if (bucket === "material" || !classwork.dueDate) return "none";
  if (bucket !== "todo") return "done";
  const due = new Date(classwork.dueDate).getTime();
  if (Number.isNaN(due)) return "none";
  const left = due - now.getTime();
  if (left < 0) return "overdue";
  if (left <= SOON_MS) return "soon";
  return "later";
}

type StatusLike = { title: string; color: string; value: number };

export type AttendanceStatusCount = {
  title: string;
  color: string;
  count: number;
};

export type AttendanceSummary = {
  counts: AttendanceStatusCount[];
  recorded: number;
  /** The status worth the most points (usually "Present"), when one stands out. */
  best: { title: string; count: number; percent: number } | null;
};

const FALLBACK_COLOR = "#94a3b8";

/**
 * Counts each status the student received, in the teacher's status order.
 * Statuses the student never got are left out so the tiles stay short.
 */
export function summarizeAttendance(
  statusLists: StatusLike[],
  attendances: { status: string }[],
): AttendanceSummary {
  const byTitle = new Map<string, number>();
  for (const a of attendances) {
    if (!a.status) continue;
    byTitle.set(a.status, (byTitle.get(a.status) ?? 0) + 1);
  }
  const recorded = [...byTitle.values()].reduce((sum, n) => sum + n, 0);

  const counts: AttendanceStatusCount[] = [];
  for (const s of statusLists) {
    const count = byTitle.get(s.title);
    if (!count) continue;
    counts.push({ title: s.title, color: s.color || FALLBACK_COLOR, count });
    byTitle.delete(s.title);
  }
  // Statuses the teacher has since renamed or removed still count.
  for (const [title, count] of byTitle) {
    counts.push({ title, color: FALLBACK_COLOR, count });
  }

  let best: AttendanceSummary["best"] = null;
  if (recorded > 0 && statusLists.length > 1) {
    const top = statusLists.reduce((a, b) => (b.value > a.value ? b : a));
    const tied = statusLists.filter((s) => s.value === top.value).length;
    if (tied === 1) {
      const count = counts.find((c) => c.title === top.title)?.count ?? 0;
      best = {
        title: top.title,
        count,
        percent: Math.round((count / recorded) * 100),
      };
    }
  }

  return { counts, recorded, best };
}

/** A soft background from a status color ("#22c55e" → "rgba(34, 197, 94, 0.12)"). */
export function tintColor(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `rgba(148, 163, 184, ${alpha})`;
  const h =
    m[1].length === 3
      ? m[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : m[1];
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
