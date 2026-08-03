import { useRouter } from "next/router";
import React from "react";
import { IoMdNotifications } from "react-icons/io";
import { announcementDataLanguage } from "../data/languages";
import { StudentNotification } from "../interfaces";
import {
  useGetLanguage,
  useGetStudentNotifications,
  useMarkAllAsReadStudentNotifications,
  useMarkAsReadStudentNotification,
} from "../react-query";

function NotificationBell() {
  const router = useRouter();
  const language = useGetLanguage();
  const notifications = useGetStudentNotifications();
  const markAsRead = useMarkAsReadStudentNotification();
  const markAllAsRead = useMarkAllAsReadStudentNotifications();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.data?.length ?? 0;

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

  const handleSelect = (notification: StudentNotification) => {
    markAsRead.mutate({ id: notification.id });
    setOpen(false);
    const announcementId = new URL(notification.link).searchParams.get(
      "announcement_id"
    );
    router.push(
      "/subject/" +
        notification.subjectId +
        (announcementId ? "?announcement_id=" + announcementId : "")
    );
  };

  return (
    <div ref={containerRef} className="relative font-Anuphan">
      <button
        aria-label="notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl text-icon-color hover:bg-gray-100 hover:text-primary-color"
      >
        <IoMdNotifications />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-color px-1 text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border bg-white p-3 shadow-lg">
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
          <ul className="mt-2 flex max-h-80 flex-col gap-1 overflow-y-auto">
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
                      language.data === "th" ? "th-TH" : "en-US"
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
