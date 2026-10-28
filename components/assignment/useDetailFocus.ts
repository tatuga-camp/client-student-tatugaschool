import { RefObject, useEffect } from "react";

// What the student last pressed. The page opens after the press, and Safari
// doesn't focus a tapped button, so document.activeElement can't tell us.
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
  window.addEventListener(
    "keydown",
    () => {
      lastPressed = null;
    },
    true,
  );
}

/**
 * Moves focus into a detail page when it opens (the `entry` element) and back
 * to whatever opened it when it goes away, if that still exists and focus is
 * still in the page (or nowhere).
 */
export function useDetailFocus(
  entry: RefObject<HTMLElement | null>,
  page: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const opener =
      lastPressed && lastPressed.isConnected
        ? lastPressed
        : active && active !== document.body
          ? active
          : null;
    const pageEl = page.current;
    entry.current?.focus({ preventScroll: true });
    // Something mounting a moment later (a video player, an embed) must not
    // leave focus on BODY: if it did, put it back on the entry.
    const frame = requestAnimationFrame(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        entry.current?.focus({ preventScroll: true });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      const now = document.activeElement;
      const focusLost = !now || now === document.body;
      if (
        opener?.isConnected &&
        (focusLost || pageEl?.contains(now) === true)
      ) {
        opener.focus({ preventScroll: true });
      }
    };
    // Once per mount: the page is keyed by assignment in DetailStack.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
