import { useRouter } from "next/router";
import React from "react";
import { IoMdNotifications } from "react-icons/io";
import {
  announcementDataLanguage,
  askNotificationDataLanguage,
} from "../data/languages";
import { StudentNotification } from "../interfaces";
import {
  useGetLanguage,
  useGetStudentNotifications,
  useMarkAllAsReadStudentNotifications,
  useMarkAsReadStudentNotification,
} from "../react-query";
import { SubscribeStudentToPushService } from "../services";
import { isIosSafariWithoutPwa } from "../utils/notifications";

type PushStatus =
  | "granted"
  | "default"
  | "denied"
  | "ios-install"
  | "unsupported";

function getPushStatus(): PushStatus {
  if (typeof window === "undefined") return "unsupported";
  if (isIosSafariWithoutPwa()) return "ios-install";
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission as PushStatus;
}

function NotificationBell() {
  const router = useRouter();
  const language = useGetLanguage();
  const notifications = useGetStudentNotifications();
  const markAsRead = useMarkAsReadStudentNotification();
  const markAllAsRead = useMarkAllAsReadStudentNotifications();
  const [open, setOpen] = React.useState(false);
  const [pushStatus, setPushStatus] = React.useState<PushStatus>("granted");
  const [allowing, setAllowing] = React.useState(false);
  const [attempted, setAttempted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.data?.length ?? 0;

  React.useEffect(() => {
    setPushStatus(getPushStatus());
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAllowPush = async () => {
    setAllowing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await SubscribeStudentToPushService();
      }
      setPushStatus(getPushStatus());
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setPushStatus(getPushStatus());
    } finally {
      setAllowing(false);
      setAttempted(true);
    }
  };

  const handleSelect = (notification: StudentNotification) => {
    markAsRead.mutate({ id: notification.id });
    setOpen(false);
    const announcementId = new URL(notification.link).searchParams.get(
      "announcement_id",
    );
    router.push(
      "/subject/" +
        notification.subjectId +
        (announcementId ? "?announcement_id=" + announcementId : ""),
    );
  };

  return (
    <div ref={containerRef} className="relative font-Anuphan">
      <button
        aria-label="notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-icon-color hover:bg-gray-100 hover:text-primary-color"
      >
        <IoMdNotifications />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-color px-1 text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed inset-x-3 top-14 z-50 rounded-2xl border bg-white p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-w-[90vw]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {announcementDataLanguage.notifications(language.data ?? "en")}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-primary-color underline"
              >
                {announcementDataLanguage.markAllRead(language.data ?? "en")}
              </button>
            )}
          </div>
          {pushStatus === "default" && (
            <div className="mt-2 flex flex-col gap-2 rounded-xl bg-primary-color/5 p-3">
              <span className="text-xs text-gray-600">
                {announcementDataLanguage.enablePushBanner(
                  language.data ?? "en",
                )}
              </span>
              {allowing && (
                <span className="text-xs text-primary-color">
                  {askNotificationDataLanguage.lookForPrompt(
                    language.data ?? "en",
                  )}
                </span>
              )}
              {!allowing && attempted && (
                <span className="text-xs text-gray-600">
                  {askNotificationDataLanguage.promptDismissedHelp(
                    language.data ?? "en",
                  )}
                </span>
              )}
              <button
                disabled={allowing}
                onClick={handleAllowPush}
                className="w-max rounded-full bg-primary-color px-4 py-1 text-xs text-white hover:bg-primary-color-hover disabled:opacity-50"
              >
                {attempted
                  ? askNotificationDataLanguage.tryAgain(language.data ?? "en")
                  : askNotificationDataLanguage.allow(language.data ?? "en")}
              </button>
            </div>
          )}
          {pushStatus === "denied" && (
            <div className="mt-2 flex flex-col gap-2 rounded-xl bg-warning-color/10 p-3">
              <span className="text-xs text-gray-600">
                {askNotificationDataLanguage.promptBlockedHelp(
                  language.data ?? "en",
                )}
              </span>
              <button
                disabled={allowing}
                onClick={handleAllowPush}
                className="w-max rounded-full bg-primary-color px-4 py-1 text-xs text-white hover:bg-primary-color-hover disabled:opacity-50"
              >
                {askNotificationDataLanguage.tryAgain(language.data ?? "en")}
              </button>
            </div>
          )}
          {pushStatus === "ios-install" && (
            <div className="mt-2 rounded-xl bg-primary-color/5 p-3">
              <span className="text-xs text-gray-600">
                {askNotificationDataLanguage.iosInstallBody(
                  language.data ?? "en",
                )}
              </span>
            </div>
          )}
          <ul className="mt-2 flex max-h-[60vh] flex-col gap-1 overflow-y-auto sm:max-h-80">
            {unreadCount === 0 && (
              <li className="py-6 text-center text-xs text-gray-400">
                {announcementDataLanguage.empty(language.data ?? "en")}
              </li>
            )}
            {notifications.data?.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => handleSelect(notification)}
                  className="w-full rounded-xl p-2 text-left hover:bg-primary-color/5"
                >
                  <span className="block text-xs font-semibold">
                    {notification.actorName}
                  </span>
                  <span className="block truncate text-xs text-gray-600">
                    {notification.message}
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    {new Date(notification.createAt).toLocaleString(
                      language.data === "th" ? "th-TH" : "en-US",
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
