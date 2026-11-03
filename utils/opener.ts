// What the student used to open something (a sheet, a detail page), so focus
// can go back to it when that closes. Safari gives a tapped button no focus
// (it focuses the nearest focusable ancestor, or nothing), so the focused
// element alone can't tell us: the last pressed control is tracked too.

let lastPressed: HTMLElement | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      const target = e.target instanceof Element ? e.target : null;
      lastPressed =
        target?.closest<HTMLElement>("button, a[href], [tabindex]") ?? null;
    },
    true,
  );
  // A key press means the keyboard is in use: focus says where it is.
  window.addEventListener(
    "keydown",
    () => {
      lastPressed = null;
    },
    true,
  );
}

type Candidate = { isConnected: boolean };

/**
 * The opener: the last pressed control if it still exists, else the focused
 * element unless that is the body (nothing focused), else null.
 */
export function pickOpener<T extends Candidate>(
  pressed: T | null,
  active: T | null,
  body: T | null,
): T | null {
  if (pressed?.isConnected) return pressed;
  if (active && active !== body) return active;
  return null;
}

/** The opener right now; see pickOpener. */
export function openerElement(): HTMLElement | null {
  return pickOpener(
    lastPressed,
    document.activeElement as HTMLElement | null,
    document.body,
  );
}
