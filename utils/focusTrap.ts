// Tab and Shift+Tab stay inside an open modal sheet, so nothing behind it
// (the pane, the header, the tab bar) can be reached from the keyboard.

/**
 * Where a Tab press must send focus: an item's index, "panel" (nothing
 * focusable inside), or null to let the browser move it. `at` is the focused
 * item's index; k - 0.5 for a focused element the Tab order skips, with k
 * items before it (the panel itself is -0.5); null when focus is outside.
 */
export function tabWrapTarget(input: {
  count: number;
  at: number | null;
  shift: boolean;
}): number | "panel" | null {
  const { count, at, shift } = input;
  if (count === 0) return "panel";
  if (at === null) return shift ? count - 1 : 0;
  const next = shift ? Math.ceil(at) - 1 : Math.floor(at) + 1;
  if (next < 0) return count - 1;
  if (next >= count) return 0;
  return Number.isInteger(at) ? null : next;
}

/** Layers that may sit above a sheet and keep their own focus. */
const UPPER_LAYERS =
  '.swal2-container, .tox-tinymce-aux, .tox-dialog-wrap, .tox-dialog, [aria-modal="true"]';

/**
 * Where focus is, seen from the topmost sheet's panel: inside it, in a
 * known layer above it (SweetAlert, a TinyMCE menu or dialog, another modal
 * dialog), or behind it (the page, the body), from where it is pulled back.
 */
export function focusPlace(
  focused: { closest(selector: string): unknown } | null,
  panel: { contains(node: never): boolean },
): "panel" | "layer" | "behind" {
  if (!focused) return "behind";
  if (panel.contains(focused as never)) return "panel";
  return focused.closest(UPPER_LAYERS) ? "layer" : "behind";
}

const FOCUSABLE =
  'a[href], button, input:not([type="hidden"]), select, textarea, iframe, [tabindex], [contenteditable="true"]';

/** Wraps a Tab keydown inside `panel` (the topmost sheet's). */
export function keepTabInside(e: KeyboardEvent, panel: HTMLElement | null) {
  if (!panel || e.defaultPrevented) return;
  const active = document.activeElement as HTMLElement | null;
  const place = focusPlace(active, panel);
  if (place === "layer") return;
  const items = Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest("[inert]") &&
      el.getClientRects().length > 0,
  );
  let at: number | null = null;
  if (place === "panel" && active) {
    const i = items.indexOf(active);
    at =
      i >= 0
        ? i
        : items.filter(
            (el) =>
              el.compareDocumentPosition(active) &
              Node.DOCUMENT_POSITION_FOLLOWING,
          ).length - 0.5;
  }
  const target = tabWrapTarget({ count: items.length, at, shift: e.shiftKey });
  if (target === null) return;
  e.preventDefault();
  (target === "panel" ? panel : items[target]).focus();
}

/**
 * Focus that lands behind the topmost sheet by a way its keydown can't see
 * (a Tab out of an editor's iframe, back from the browser's own UI) goes
 * back to the panel.
 */
export function reclaimFocus(
  target: EventTarget | null,
  panel: HTMLElement | null,
) {
  if (!panel || !(target instanceof Element)) return;
  if (focusPlace(target, panel) === "behind")
    panel.focus({ preventScroll: true });
}
