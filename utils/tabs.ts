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

/** A swipe may start unless the touch began inside an element marked `data-no-swipe`. */
export function canStartSwipe(target: EventTarget | null): boolean {
  if (typeof Element !== "undefined" && target instanceof Element) {
    return !target.closest("[data-no-swipe]");
  }
  return true;
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
