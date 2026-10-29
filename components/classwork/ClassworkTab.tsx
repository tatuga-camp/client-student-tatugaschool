import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { LuFileText, LuMegaphone } from "react-icons/lu";
import { homeLanguage, subjectHomeLanguage } from "../../data/languages";
import {
  useGetAnnouncements,
  useGetAssignments,
  useGetLanguage,
} from "../../react-query";
import { countClassworkBuckets } from "../../utils";
import { consumeAnnouncementLink } from "../../utils/deepLink";
import { SubjectChip } from "../app/SubjectChip";
import { TAB_BODY_CLASS, TabHeader } from "../app/TabHeader";
import { useShellRoute, type TabPaneProps } from "../app/shell/useShellRoute";
import AnnouncementsView from "./AnnouncementsView";
import AssignmentsView from "./AssignmentsView";

type View = "assignments" | "announcements";

export default function ClassworkTab({ subjectId, active }: TabPaneProps) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const announcementId = useShellRoute()?.announcementId ?? null;
  const [view, setView] = useState<View>(
    announcementId ? "announcements" : "assignments",
  );
  const scroller = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    if (scroller.current) scroller.current.scrollTop = 0;
  };

  // A notification link opens the announcements side. It is taken in once
  // and dropped from the URL, or coming back from an assignment would jump
  // here again; each tap is a new `link`, so the same card can be re-shown.
  const [link, setLink] = useState<{ id: string } | null>(
    announcementId ? { id: announcementId } : null,
  );
  useEffect(() => {
    if (!announcementId) return;
    setView("announcements");
    setLink({ id: announcementId });
    const query = consumeAnnouncementLink(router.query);
    if (query)
      router.replace({ query }, undefined, { shallow: true, scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId]);

  const assignments = useGetAssignments(
    { subjectId },
    { refetchInterval: active ? undefined : false },
  );
  const announcements = useGetAnnouncements({ subjectId });
  const announcementCount = announcements.data?.length ?? 0;
  const todo = assignments.data
    ? countClassworkBuckets(assignments.data).todo
    : 0;

  const switchTo = (next: View) => {
    if (next === view) return;
    setView(next);
    scrollToTop();
  };

  return (
    <div className="flex h-full w-full flex-col">
      <TabHeader
        title={homeLanguage.tabClasswork(lang)}
        right={<SubjectChip subjectId={subjectId} />}
      />
      <div ref={scroller} className={`${TAB_BODY_CLASS} pt-3`}>
        <div
          role="group"
          aria-label={homeLanguage.tabClasswork(lang)}
          className="mx-3 flex rounded-[14px] bg-[#E9EEF5] p-[3px] font-Anuphan"
        >
          <SwitchButton
            on={view === "assignments"}
            onClick={() => switchTo("assignments")}
            icon={<LuFileText aria-hidden />}
            label={subjectHomeLanguage.tabAssignments(lang)}
            badge={todo > 0 ? String(todo) : null}
          />
          <SwitchButton
            on={view === "announcements"}
            onClick={() => switchTo("announcements")}
            icon={<LuMegaphone aria-hidden />}
            label={subjectHomeLanguage.tabAnnouncements(lang)}
            badge={announcementCount > 0 ? String(announcementCount) : null}
          />
        </div>
        <div className="h-2" />
        {view === "assignments" ? (
          <AssignmentsView
            subjectId={subjectId}
            lang={lang}
            scrollToTop={scrollToTop}
          />
        ) : (
          <AnnouncementsView
            subjectId={subjectId}
            lang={lang}
            deepLink={link}
            onHandled={() => setLink(null)}
          />
        )}
      </div>
    </div>
  );
}

function SwitchButton({
  on,
  onClick,
  icon,
  label,
  badge,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge: string | null;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[11px] px-2 text-sm font-bold ${
        on ? "bg-white text-primary-color" : "text-[#7A80A0]"
      }`}
      style={on ? { boxShadow: "0 2px 0 #D6DEEA" } : undefined}
    >
      <span className="text-base">{icon}</span>
      <span className="truncate">{label}</span>
      {badge && (
        <span className="rounded-full bg-error-color px-1.5 text-[10px] font-bold leading-4 text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
