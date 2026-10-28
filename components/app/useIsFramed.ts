import { useCallback, useSyncExternalStore } from "react";

const FRAMED_QUERY = "(min-width: 600px) and (min-height: 600px)";
/** Wide enough that the stage items fit beside the phone column. */
export const WIDE_STAGE_QUERY = "(min-width: 920px)";

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

/** True on tablets and desktops, where the app runs inside the phone frame. */
export function useIsFramed(): boolean {
  return useMediaQuery(FRAMED_QUERY);
}
