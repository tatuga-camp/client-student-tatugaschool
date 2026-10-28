/**
 * Where tapping a notification goes. An announcement (its link carries
 * `announcement_id`) opens Classwork → Announcements at that card;
 * everything else opens the subject. Either may be another subject.
 */
export function notificationHref(n: { subjectId: string; link: string }): string {
  const subject = `/subject/${encodeURIComponent(n.subjectId)}`;
  let announcementId: string | null = null;
  try {
    // A base makes relative links parse too.
    announcementId = new URL(n.link, "https://app.invalid").searchParams.get(
      "announcement_id",
    );
  } catch {
    // Not a URL: just open the subject.
  }
  if (!announcementId) return subject;
  return `${subject}?tab=classwork&announcement_id=${encodeURIComponent(announcementId)}`;
}
