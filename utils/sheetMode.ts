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

/**
 * A desktop dialog's box. It is centred in its root by flexbox (no
 * `height: fit-content`, which Safari and Firefox treat differently). While
 * an on-screen keyboard hides the bottom of the root (`fit`, from
 * utils/keyboardFit), the root is padded by the hidden part, so the dialog
 * centres in, and fits, the visible band.
 */
export function dialogBox(input: {
  full: boolean;
  fit: { lift: number; room: number } | null;
}): {
  padBottom: number;
  maxHeight: number | string;
  height: number | string | undefined;
} {
  const { full, fit } = input;
  if (!fit) {
    return { padBottom: 0, maxHeight: "85%", height: full ? "85%" : undefined };
  }
  const max = Math.round(fit.room * 0.9);
  return {
    padBottom: fit.lift,
    maxHeight: max,
    height: full ? max : undefined,
  };
}
