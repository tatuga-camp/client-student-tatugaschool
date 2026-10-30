/**
 * Where tapping a notification goes. An announcement (its link carries
 * `announcement_id`) opens Classwork → Announcements at that card;
 * everything else opens the subject. Either may be another subject.
 */
export function notificationHref(n: { subjectId: string; link: string }): string {
  let announcementId: string | null = null;
  try {
    // A base makes relative links parse too.
    announcementId = new URL(n.link, "https://app.invalid").searchParams.get(
      "announcement_id",
    );
  } catch {
    // Not a URL: just open the subject.
  }
  return subjectHref(n.subjectId, announcementId);
}

/**
 * A subject's URL; with an announcement it opens Classwork → Announcements
 * at that card. Every part is encoded, so the id stays one param.
 */
export function subjectHref(
  subjectId: string,
  announcementId: string | null,
): string {
  const subject = `/subject/${encodeURIComponent(subjectId)}`;
  if (!announcementId) return subject;
  return `${subject}?tab=classwork&announcement_id=${encodeURIComponent(announcementId)}`;
}
