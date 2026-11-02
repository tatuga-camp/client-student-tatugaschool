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

const SHELL_PATHNAMES = new Set([
  "/subject/[subjectId]",
  "/subject/[subjectId]/assignment/[assignmentId]",
]);

/**
 * The subject shell's routes. On a computer they fill the window; every other
 * framed page sits in a centred phone-width column.
 */
export function isShellRoute(pathname: string): boolean {
  return SHELL_PATHNAMES.has(pathname);
}

/**
 * How a framed page sits on a computer: the subject shell fills the window;
 * every other page is a card on the schoolyard: sign-in (`fit`) shrinks to
 * its form, pick-your-name (`wide`, at `/`) is 760px wide, the rest
 * (`card`) are a phone-width card. Phones ignore it.
 */
export type FrameKind = "shell" | "fit" | "wide" | "card";

export function frameKind(pathname: string): FrameKind {
  if (isShellRoute(pathname)) return "shell";
  if (pathname === "/welcome") return "fit";
  if (pathname === "/") return "wide";
  return "card";
}

/** Every pop-up (sheets, SweetAlert, PrimeReact panels) renders into this element. */
export const OVERLAY_ROOT_ID = "app-overlay-root";

/** The overlay root, or document.body when no frame is mounted. */
export function overlayTarget(): HTMLElement {
  return document.getElementById(OVERLAY_ROOT_ID) ?? document.body;
}
