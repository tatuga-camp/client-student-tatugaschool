// A mouse drag that starts on a row or a card ends as a click on it: the
// drag's pointer capture keeps the release on the start element, so the
// browser fires `click` there. A press that travelled is a drag, not a click.

/** How far (px, on either axis) a mouse press may travel and still click. */
export const CLICK_SLOP = 10;

export type Press = {
  pointerType: string;
  x: number;
  y: number;
  /** The furthest it has been from where it started, on either axis. */
  travel: number;
};

export function startPress(pointerType: string, x: number, y: number): Press {
  return { pointerType, x, y, travel: 0 };
}

export function movePress(press: Press, x: number, y: number): Press {
  const travel = Math.max(
    press.travel,
    Math.abs(x - press.x),
    Math.abs(y - press.y),
  );
  return travel === press.travel ? press : { ...press, travel };
}

/**
 * Whether to drop the click that ends `press`: a mouse press that travelled
 * past CLICK_SLOP. Keyboard clicks (detail 0) are never dropped, and touch
 * and pen are left to the browser and the gestures' own filters.
 */
export function dropsClick(press: Press | null, detail: number): boolean {
  return (
    press !== null &&
    press.pointerType === "mouse" &&
    detail !== 0 &&
    press.travel > CLICK_SLOP
  );
}
