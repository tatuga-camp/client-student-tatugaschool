import React, { useState } from "react";
import { LuBell } from "react-icons/lu";
import { announcementDataLanguage, homeLanguage } from "../../data/languages";
import { useGetLanguage, useGetStudentNotifications } from "../../react-query";
import { NotificationSheet } from "./NotificationSheet";

/** The bell chip with the unread badge; opens the notification sheet. */
export function NotificationButton() {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const notifications = useGetStudentNotifications();
  const [open, setOpen] = useState(false);
  const unread = (notifications.data ?? []).filter((n) => !n.isRead).length;
  const title = announcementDataLanguage.notifications(lang);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `${title}, ${homeLanguage.unread(lang, unread)}` : title}
        className="relative grid h-9 w-11 shrink-0 place-items-center rounded-[13px] border-2 border-b-4 border-[#E3E8F0] bg-white text-icon-color [-webkit-tap-highlight-color:transparent] active:translate-y-px active:border-b-2"
      >
        <LuBell aria-hidden size={18} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-error-color px-1 font-Anuphan text-[10px] font-bold leading-none text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      <NotificationSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
