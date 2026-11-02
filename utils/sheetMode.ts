/**
 * How a Sheet shows: phones always get the bottom sheet. On a computer a
 * peek (the Your-work sheet) stays a bottom sheet limited to the content
 * column, and every other sheet becomes a centred dialog.
 */
export type SheetMode = "bottom" | "bottom-narrow" | "dialog";

export function sheetMode(input: {
  desktop: boolean;
  isPeek: boolean;
}): SheetMode {
  if (!input.desktop) return "bottom";
  return input.isPeek ? "bottom-narrow" : "dialog";
}

/** The dialog at `progress` 0 = shown, 1 = gone: it fades and shrinks a little. */
export function dialogMotion(progress: number): {
  opacity: number;
  scale: number;
} {
  const p = Math.min(1, Math.max(0, progress));
  return { opacity: 1 - p, scale: 1 - 0.04 * p };
}
