import type {
  PublicProgress,
  PublicProgressAssignmentColumn,
  PublicProgressSpecialColumn,
  PublicProgressStudent,
} from "../interfaces";

export type ProgressViewMode = "assignment" | "tag";

export type ProgressColumn =
  | { kind: "assignment"; key: string; column: PublicProgressAssignmentColumn }
  | { kind: "special"; key: string; column: PublicProgressSpecialColumn }
  | { kind: "subtotal"; key: string; tag: string; maxTotal: number };

export type ProgressGroupSegment = {
  kind: "group";
  tag: string;
  assignmentCount: number;
  collapsed: boolean;
  columns: ProgressColumn[];
};

export type ProgressSegment =
  | { kind: "single"; column: ProgressColumn }
  | ProgressGroupSegment;

/**
 * Same ordering rules as the teacher Grade table: each tag group is one
 * contiguous block at the position of its first assignment. Subtotals exist
 * only when the link shows scores; without them a group cannot collapse.
 */
export function buildProgressColumns(
  data: PublicProgress,
  mode: ProgressViewMode,
  collapsedTags: string[] = [],
): { segments: ProgressSegment[]; columns: ProgressColumn[] } {
  const showScores = data.level !== "STATUS";
  const segments: ProgressSegment[] = [];
  const groups = new Map<string, ProgressGroupSegment>();
  const groupAssignments = new Map<string, ProgressColumn[]>();

  for (const column of data.columns) {
    if (column.kind === "special") {
      segments.push({
        kind: "single",
        column: { kind: "special", key: column.id, column },
      });
      continue;
    }
    const entry: ProgressColumn = { kind: "assignment", key: column.id, column };
    if (mode === "assignment" || !column.tag) {
      segments.push({ kind: "single", column: entry });
      continue;
    }
    let group = groups.get(column.tag);
    if (!group) {
      group = {
        kind: "group",
        tag: column.tag,
        assignmentCount: 0,
        collapsed: showScores && collapsedTags.includes(column.tag),
        columns: [],
      };
      groups.set(column.tag, group);
      groupAssignments.set(column.tag, []);
      segments.push(group);
    }
    group.assignmentCount += 1;
    groupAssignments.get(column.tag)!.push(entry);
  }

  for (const group of groups.values()) {
    const assignments = groupAssignments.get(group.tag)!;
    if (!showScores) {
      group.columns = assignments;
      continue;
    }
    const subtotal: ProgressColumn = {
      kind: "subtotal",
      key: `subtotal:${group.tag}`,
      tag: group.tag,
      maxTotal: data.groups.find((g) => g.tag === group.tag)?.maxTotal ?? 0,
    };
    group.columns = group.collapsed ? [subtotal] : [...assignments, subtotal];
  }

  const columns = segments.flatMap((segment) =>
    segment.kind === "single" ? [segment.column] : segment.columns,
  );
  return { segments, columns };
}

export function filterStudents(
  students: PublicProgressStudent[],
  query: string,
): PublicProgressStudent[] {
  const q = query.trim().toLowerCase();
  if (!q) return students;
  return students.filter(
    (student) =>
      student.number.startsWith(q) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(q),
  );
}

export function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/** Services throw the Nest error body ({ statusCode, message }). */
export function isUnavailableError(error: unknown): boolean {
  return (error as { statusCode?: number } | undefined)?.statusCode === 404;
}
