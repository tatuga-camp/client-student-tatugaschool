type Query = Record<string, string | string[] | undefined>;

/**
 * The query to replace the URL with once a notification's announcement link
 * has been taken in, or null when there is none. Dropping `announcement_id`
 * means coming back from an assignment stays on the list the student left;
 * `tab` is pinned because the link alone is what chose Classwork.
 */
export function consumeAnnouncementLink<Q extends Query>(
  query: Q,
): Query | null {
  const { announcement_id: id, ...rest } = query;
  if (!id) return null;
  return { ...rest, tab: "classwork" };
}

/** How the deep-linked card is scrolled to and flashed. */
export function flashTiming(reducedMotion: boolean): {
  behavior: "smooth" | "auto";
  /** Wait for the smooth scroll to settle before the flash starts. */
  startDelay: number;
  holdMs: number;
} {
  return {
    behavior: reducedMotion ? "auto" : "smooth",
    startDelay: reducedMotion ? 0 : 450,
    holdMs: 2500,
  };
}
