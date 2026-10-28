import { useEffect, useMemo, useRef, useState } from "react";
import { subjectHomeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { useGetAnnouncements, useGetStudent } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import SubjectEmptyState from "../subject/SubjectEmptyState";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementCommentsSheet from "./AnnouncementCommentsSheet";

type Props = {
  subjectId: string;
  lang: Language;
  deepLinkId: string | null;
};

const FLASH_MS = 1500;

export default function AnnouncementsView({
  subjectId,
  lang,
  deepLinkId,
}: Props) {
  const announcements = useGetAnnouncements({ subjectId });
  const student = useGetStudent();
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const doneLink = useRef<string | null>(null);

  const ready = !!announcements.data && !!student.data;
  const target = useMemo(
    () => announcements.data?.find((a) => a.id === deepLinkId) ?? null,
    [announcements.data, deepLinkId],
  );

  // Deep link: bring the card into the pane's scroller, then flash it once.
  useEffect(() => {
    if (!ready || !deepLinkId || doneLink.current === deepLinkId) return;
    if (!target) return;
    const raf = requestAnimationFrame(() => {
      doneLink.current = deepLinkId;
      const el = document.getElementById(`announcement-${deepLinkId}`);
      const scroller = el?.closest<HTMLElement>(".app-scroll");
      if (el && scroller) {
        const delta =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top -
          16;
        scroller.scrollTo({
          top: scroller.scrollTop + delta,
          behavior: "smooth",
        });
      }
      setFlashId(deepLinkId);
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, deepLinkId, target]);

  useEffect(() => {
    if (!flashId) return;
    const off = setTimeout(() => setFlashId(null), FLASH_MS);
    return () => clearTimeout(off);
  }, [flashId]);

  const sheetTitle =
    announcements.data?.find((a) => a.id === commentsFor)?.title ?? "";
  const count = announcements.data?.length ?? 0;

  return (
    <div className="px-3 pb-10">
      {announcements.isLoading && <LoadingBar />}
      {!announcements.isLoading && count === 0 ? (
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
