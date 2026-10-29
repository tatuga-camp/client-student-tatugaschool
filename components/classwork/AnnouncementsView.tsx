import { useEffect, useMemo, useRef, useState } from "react";
import { subjectHomeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { useGetAnnouncements, useGetStudent } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import SubjectEmptyState from "../subject/SubjectEmptyState";
import { InlineError } from "../app/InlineError";
import { flashTiming } from "../../utils/deepLink";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementCommentsSheet from "./AnnouncementCommentsSheet";

type Props = {
  subjectId: string;
  lang: Language;
  /** A new object per notification tap; null when there is none. */
  deepLink: { id: string } | null;
};

export default function AnnouncementsView({
  subjectId,
  lang,
  deepLink,
}: Props) {
  const announcements = useGetAnnouncements({ subjectId });
  const student = useGetStudent();
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const doneLink = useRef<object | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();
  const deepLinkId = deepLink?.id ?? null;

  const ready = !!announcements.data && !!student.data;
  const target = useMemo(
    () => announcements.data?.find((a) => a.id === deepLinkId) ?? null,
    [announcements.data, deepLinkId],
  );

  // Deep link: bring the card into the pane's scroller, then, once the scroll
  // has settled, flash it.
  useEffect(() => {
    if (!ready || !deepLink || doneLink.current === deepLink || !target) return;
    const raf = requestAnimationFrame(() => {
      doneLink.current = deepLink;
      const timing = flashTiming(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      const el = document.getElementById(`announcement-${target.id}`);
      const scroller = el?.closest<HTMLElement>(".app-scroll");
      if (el && scroller) {
        const delta =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top -
          16;
        scroller.scrollTo({
          top: scroller.scrollTop + delta,
          behavior: timing.behavior,
        });
      }
      flashTimer.current = setTimeout(() => {
        setFlashId(target.id);
        flashTimer.current = setTimeout(() => setFlashId(null), timing.holdMs);
      }, timing.startDelay);
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, deepLink, target]);

  // The flash timers outlive a refetch of the list, but not this view.
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const sheetTitle =
    announcements.data?.find((a) => a.id === commentsFor)?.title ?? "";
  const count = announcements.data?.length ?? 0;

  return (
    <div className="px-3 pb-10">
      {announcements.isLoading && <LoadingBar />}
      {announcements.isError && !announcements.data ? (
        <InlineError onRetry={() => announcements.refetch()} />
      ) : !announcements.isLoading && count === 0 ? (
        <SubjectEmptyState
          text={subjectHomeLanguage.emptyAnnouncements(lang)}
        />
      ) : (
        student.data && (
          <ul className="flex flex-col gap-3">
            {announcements.data?.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                subjectId={subjectId}
                studentId={student.data.id}
                lang={lang}
                flash={flashId === announcement.id}
                onOpenComments={setCommentsFor}
              />
            ))}
          </ul>
        )
      )}
      {student.data && (
        <AnnouncementCommentsSheet
          announcementId={commentsFor}
          studentId={student.data.id}
          lang={lang}
          title={sheetTitle}
          onClose={() => setCommentsFor(null)}
        />
      )}
    </div>
  );
}
