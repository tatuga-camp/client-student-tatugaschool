import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  LuBell,
  LuBellOff,
  LuCheckCheck,
  LuFileCheck,
  LuMegaphone,
  LuMessageCircle,
} from "react-icons/lu";
import {
  announcementDataLanguage,
  askNotificationDataLanguage,
  homeLanguage,
} from "../../data/languages";
import { Language, StudentNotification } from "../../interfaces";
import {
  useGetLanguage,
  useGetStudentNotifications,
  useMarkAllAsReadStudentNotifications,
  useMarkAsReadStudentNotification,
} from "../../react-query";
import { notificationHref } from "../../utils/notificationLink";
import {
  getPushStatus,
  PushStatus,
  subscribePush,
} from "../../utils/notifications";
import LoadingSpinner from "../common/LoadingSpinner";
import { Sheet } from "./Sheet";

type Props = { open: boolean; onClose: () => void };

/** Full-screen list of the student's notifications. */
export function NotificationSheet({ open, onClose }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="full"
      ariaLabel={announcementDataLanguage.notifications(lang)}
    >
      <NotificationList onDone={onClose} lang={lang} />
    </Sheet>
  );
}

const TYPE_TILE: Record<
  StudentNotification["type"],
  { icon: React.ReactNode; className: string }
> = {
  NEW_ANNOUNCEMENT: {
    icon: <LuMegaphone aria-hidden size={18} />,
    className: "bg-[#FFF4CC] text-[#B07D00]",
  },
  STUDENT_COMMENT: {
    icon: <LuMessageCircle aria-hidden size={18} />,
    className: "bg-[#E8F1FD] text-primary-color",
  },
  STUDENT_SUBMISSION: {
    icon: <LuFileCheck aria-hidden size={18} />,
    className: "bg-[#E3F6EA] text-success-color",
  },
};
const OTHER_TILE = {
  icon: <LuBell aria-hidden size={18} />,
  className: "bg-[#EEF1F6] text-icon-color",
};

function NotificationList({ onDone, lang }: { onDone: () => void; lang: Language }) {
  const router = useRouter();
  const notifications = useGetStudentNotifications();
  const markAsRead = useMarkAsReadStudentNotification();
  const markAllAsRead = useMarkAllAsReadStudentNotifications();
  const list = notifications.data ?? [];
  const unread = list.filter((n) => !n.isRead).length;

  const select = (n: StudentNotification) => {
    // Marks it read in the cache at once (see the hook).
    markAsRead.mutate({ id: n.id });
    onDone();
    router.push(notificationHref(n));
  };

  return (
    <div className="font-Anuphan text-icon-color">
      <div className="flex items-end justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">
            {announcementDataLanguage.notifications(lang)}
          </h2>
          {unread > 0 && (
            <p className="text-xs font-bold text-[#7A80A0]">
              {homeLanguage.unread(lang, unread)}
            </p>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            disabled={markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
            className="flex shrink-0 items-center gap-1 py-1 text-sm font-bold text-primary-color disabled:opacity-50"
          >
            <LuCheckCheck aria-hidden size={16} />
            {announcementDataLanguage.markAllRead(lang)}
          </button>
        )}
      </div>
      <PushBanner lang={lang} />
      {notifications.isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner width="32px" />
        </div>
      )}
      {!notifications.isLoading && list.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-sm text-[#9AA3B8]">
          <LuBellOff aria-hidden size={28} />
          {announcementDataLanguage.empty(lang)}
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {list.map((n) => {
          const tile = TYPE_TILE[n.type] ?? OTHER_TILE;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => select(n)}
                className="flex w-full items-start gap-3 rounded-2xl border-2 border-b-4 border-[#E3E8F0] bg-white p-3 text-left active:translate-y-px"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tile.className}`}
                >
                  {tile.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {n.actorName}
                  </span>
                  <span className="line-clamp-2 text-sm text-[#5B6280]">
                    {n.message}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#9AA3B8]">
                    {new Date(n.createAt).toLocaleString(
                      lang === "th" ? "th-TH" : "en-US",
                    )}
                  </span>
                </span>
                {!n.isRead && (
                  <span
                    aria-hidden
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-error-color"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Push permission state with a way to turn it on (from NotificationBell). */
function PushBanner({ lang }: { lang: Language }) {
  const [status, setStatus] = useState<PushStatus>("granted");
  const [allowing, setAllowing] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setStatus(getPushStatus());
  }, []);

  const allow = async () => {
    setAllowing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") await subscribePush();
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setStatus(getPushStatus());
      setAllowing(false);
      setAttempted(true);
    }
  };

  if (status === "granted" || status === "unsupported") return null;
  if (status === "ios-install") {
    return (
      <p className="mb-3 rounded-2xl bg-primary-color/5 p-3 text-xs text-[#5B6280]">
        {askNotificationDataLanguage.iosInstallBody(lang)}
      </p>
    );
  }
  const blocked = status === "denied";
  return (
    <div
      className={`mb-3 flex flex-col gap-2 rounded-2xl p-3 ${
        blocked ? "bg-warning-color/10" : "bg-primary-color/5"
      }`}
    >
      <span className="text-xs text-[#5B6280]">
        {blocked
          ? askNotificationDataLanguage.promptBlockedHelp(lang)
          : announcementDataLanguage.enablePushBanner(lang)}
      </span>
      {!blocked && allowing && (
        <span className="text-xs text-primary-color">
          {askNotificationDataLanguage.lookForPrompt(lang)}
        </span>
      )}
      {!blocked && !allowing && attempted && (
        <span className="text-xs text-[#5B6280]">
          {askNotificationDataLanguage.promptDismissedHelp(lang)}
        </span>
      )}
      <button
        type="button"
        disabled={allowing}
        onClick={allow}
        className="w-max rounded-full bg-primary-color px-4 py-1 text-xs font-bold text-white disabled:opacity-50"
      >
        {attempted || blocked
          ? askNotificationDataLanguage.tryAgain(lang)
          : askNotificationDataLanguage.allow(lang)}
      </button>
    </div>
  );
}
