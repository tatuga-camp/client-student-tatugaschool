import { useCallback, useSyncExternalStore } from "react";
import { DESK_QUERY, WIDE_QUERY } from "../../utils/layoutQueries";

/** Live match state of a media query; false during SSR. */
export function useMediaQuery(query: string): boolean {
  // Stable per query: a new function every render would make React
  // unsubscribe and subscribe again on each one.
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * True on tablets and computers (the desktop layout). For behaviour only:
 * anything visible on first paint uses the `desk:` Tailwind screen instead.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESK_QUERY);
}

/** True on laptops and up (full sidebar, two-column assignment page). */
export function useIsWide(): boolean {
  return useMediaQuery(WIDE_QUERY);
}
