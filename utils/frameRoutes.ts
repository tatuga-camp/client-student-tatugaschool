// No phone frame: the big-screen routes keep their full-width layout, and a
// quiz runs full screen, as it always has.
const EXCLUDED_PREFIXES = [
  "/word-cloud/results",
  "/progress/",
  "/subject/[subjectId]/quiz/",
];

export function isFrameExcluded(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Every pop-up (sheets, SweetAlert, PrimeReact panels) renders into this element. */
export const OVERLAY_ROOT_ID = "app-overlay-root";

/** The overlay root, or document.body when no frame is mounted. */
export function overlayTarget(): HTMLElement {
  return document.getElementById(OVERLAY_ROOT_ID) ?? document.body;
}
