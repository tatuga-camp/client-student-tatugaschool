/** A box in viewport pixels, as getBoundingClientRect() gives it. */
export type Box = { left: number; top: number; right: number; bottom: number };

const MARGIN = 8;
const GAP = 4;

/**
 * Where a ⋯ menu goes, in `container` coordinates: below the button when it
 * fits on the screen, else above, right-aligned with it and kept on the
 * screen. It may reach past its container (a short sheet) but never covers
 * the button: when neither side fits, it takes the roomier one.
 */
export function placeMenu(input: {
  button: Box;
  container: Box;
  screen: Box;
  width: number;
  height: number;
}): { left: number; top: number } {
  const { button: b, container: c, screen: s, width: w, height: h } = input;
  const roomBelow = s.bottom - MARGIN - (b.bottom + GAP);
  const roomAbove = b.top - GAP - (s.top + MARGIN);
  const below = h <= roomBelow || (h > roomAbove && roomBelow >= roomAbove);
  const top = below ? b.bottom + GAP : b.top - GAP - h;
  const left = Math.max(
    s.left + MARGIN,
    Math.min(b.right - w, s.right - MARGIN - w),
  );
  return { left: left - c.left, top: top - c.top };
}
