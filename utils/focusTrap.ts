// Tab and Shift+Tab stay inside an open modal sheet, so nothing behind it
// (the pane, the header, the tab bar) can be reached from the keyboard.

/**
 * Where a Tab press must send focus: an item's index, "panel" (nothing
 * focusable inside), or null to let the browser move it. `index` is the
 * focused item, -1 when focus is on the panel itself or the page body.
 */
export function tabWrapTarget(input: {
  count: number;
  index: number;
  shift: boolean;
}): number | "panel" | null {
  const { count, index, shift } = input;
  if (count === 0) return "panel";
  if (shift) return index <= 0 ? count - 1 : null;
  return index === -1 || index === count - 1 ? 0 : null;
}

const FOCUSABLE =
  'a[href], button, input:not([type="hidden"]), select, textarea, iframe, [tabindex], [contenteditable="true"]';

/** Wraps a Tab keydown inside `container` (the topmost sheet's panel). */
export function keepTabInside(
  e: KeyboardEvent,
  container: HTMLElement | null,
): void {
  if (!container || e.defaultPrevented) return;
  const active = document.activeElement as HTMLElement | null;
  // Focus is in another layer on top (a SweetAlert dialog, an editor menu).
  if (active && active !== document.body && !container.contains(active)) return;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest("[inert]") &&
      el.getClientRects().length > 0,
  );
  const target = tabWrapTarget({
    count: items.length,
    index: active ? items.indexOf(active) : -1,
    shift: e.shiftKey,
  });
  if (target === null) return;
  e.preventDefault();
  (target === "panel" ? container : items[target]).focus();
}
