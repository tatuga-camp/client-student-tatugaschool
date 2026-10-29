/** Decide whether a released bottom-sheet drag closes it (past 30% of its height, or a fast flick down). */
export function sheetDragOutcome(input: {
  dy: number;
  vy: number;
  height: number;
}): "close" | "stay" {
  const { dy, vy, height } = input;
  if (dy > height * 0.3) return "close";
  if (vy > 0.5 && dy > 0) return "close";
  return "stay";
}

export const TABS = ["classwork", "progress", "home", "subjects", "me"] as const;
export type TabKey = (typeof TABS)[number];

/** Parse a `?tab=` query value; anything unknown (including arrays) is "home". */
export function parseTab(value: unknown): TabKey {
  return typeof value === "string" && (TABS as readonly string[]).includes(value)
    ? (value as TabKey)
    : "home";
}

export function tabIndex(tab: TabKey): number {
  return TABS.indexOf(tab);
}

/** Decide a released horizontal tab swipe: +1 = next tab (dragged left), -1 = previous, 0 = snap back. */
export function swipeOutcome(input: { dx: number; vx: number; width: number }): -1 | 0 | 1 {
  const { dx, vx, width } = input;
  const commit = Math.abs(dx) > width * 0.25 || (Math.abs(vx) > 0.5 && Math.abs(dx) > 16);
  if (!commit) return 0;
  return dx < 0 ? 1 : -1;
}

/** Decide a released left-edge swipe: go back only when it starts at the edge and travels far or fast enough. */
export function edgeBackOutcome(input: {
  startX: number;
  dx: number;
  vx: number;
  width: number;
}): "back" | "stay" {
  const { startX, dx, vx, width } = input;
  if (startX > 24) return "stay";
  if (dx > width * 0.33 || (vx > 0.5 && dx > 16)) return "back";
  return "stay";
}

/** What the swipe rules read from a DOM element (a stand-in in node tests). */
type ElementLike = { closest(selector: string): unknown; isContentEditable?: boolean };

function isElementLike(target: unknown): target is ElementLike {
  return (
    typeof target === "object" &&
    target !== null &&
    typeof (target as ElementLike).closest === "function"
  );
}

/** A swipe may start unless the touch began inside an element marked `data-no-swipe`. */
export function canStartSwipe(target: unknown): boolean {
  return !isElementLike(target) || !target.closest("[data-no-swipe]");
}

/** Something you type in or select text in: fields, rich text, embedded frames. */
export function isEditableTarget(target: unknown): boolean {
  if (!isElementLike(target)) return false;
  if (target.isContentEditable) return true;
  return !!target.closest("input, textarea, select, iframe, [role='textbox']");
}

/**
 * A shell swipe (tab pager, detail edge-back) may start only on the shell's
 * own DOM: React bubbles pointer events out of portals (sheets, viewers,
 * toasts), and those keep their own drags. Never from a `data-no-swipe` area,
 * and never from a field, where a mouse drag selects text.
 */
export function canStartShellSwipe(
  container: { contains(node: Node | null): boolean } | null,
  target: unknown,
): boolean {
  if (!container || !isElementLike(target)) return false;
  return (
    // An element-like target is a DOM element in the app.
    container.contains(target as unknown as Node) &&
    canStartSwipe(target) &&
    !isEditableTarget(target)
  );
}

/**
 * Where the back control goes: real history when there is some, else the
 * subject page. `historyIdx` is the shell's own index (utils/historyIndex.ts);
 * Next's pages router keeps none in `history.state`.
 */
export function backTarget(input: {
  historyIdx: number;
  subjectId: string;
}): { kind: "history" } | { kind: "replace"; url: string } {
  if (input.historyIdx > 0) return { kind: "history" };
  return { kind: "replace", url: `/subject/${input.subjectId}` };
}

/**
 * "Back to classwork" after a turn-in: go back when the entry behind is this
 * subject's Classwork list, else replace with it. A replace onto a list that
 * is already behind would leave two equal entries, and a dead back press.
 */
export function classworkBack(input: {
  previousPath: string | undefined;
  subjectId: string;
}): "back" | "replace" {
  if (!input.previousPath) return "replace";
  const [pathname, search = ""] = input.previousPath.split("#")[0].split("?");
  const query = new URLSearchParams(search);
  return pathname === `/subject/${input.subjectId}` &&
    parseTab(query.get("tab")) === "classwork" &&
    !query.has("announcement_id")
    ? "back"
    : "replace";
}

/** The Progress switch's panes, in order: only what the teacher lets students see. */
export function progressPanes(s: {
  allowStudentViewOverallScore: boolean;
  allowStudentViewAttendance: boolean;
}): ("grades" | "attendance")[] {
  const panes: ("grades" | "attendance")[] = [];
  if (s.allowStudentViewOverallScore) panes.push("grades");
  if (s.allowStudentViewAttendance) panes.push("attendance");
  return panes;
}
