import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 600px) and (min-height: 600px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** True on tablets and desktops, where the app runs inside the phone frame. */
export function useIsFramed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
