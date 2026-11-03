import { RefObject, useEffect } from "react";
import { openerElement } from "../../utils/opener";

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
    // The page opens after the press: the last pressed control, not only
    // the focused element (Safari gives a tapped button no focus).
    const opener = openerElement();
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
