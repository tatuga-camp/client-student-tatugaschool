import React, { useEffect, useState } from "react";
import {
  announcementDataLanguage,
  askNotificationDataLanguage,
  homeLanguage,
} from "../../data/languages";
import { useGetLanguage, useGetStudent } from "../../react-query";
import { mascotForStudent } from "../../utils/mascot";
import {
  autoPushPrompt,
  getPushStatus,
  PushStatus,
  subscribePush,
} from "../../utils/notifications";
import { safeGet, safeSet } from "../../utils/safeStorage";
import MascotAvatar from "../student/MascotAvatar";
import { Sheet } from "./Sheet";

// Same key as the old AskNotification, so a past "Later" still counts.
const DISMISSED_KEY = "ask-notification-dismissed";

const markDismissed = () => safeSet(DISMISSED_KEY, String(Date.now()));

type RequestState = "idle" | "pending" | "dismissed" | "blocked";

type Props = {
  /**
   * Show on its own when the old AskNotification rules say so: until
   * allowed or dismissed, with the install steps on iPhone Safari. Home
   * passes it while it is on screen with no detail page over it; turning
   * it off hides the prompt (not a dismissal) until it is on again.
   */
  auto?: boolean;
  /** Open now, whatever the rules say (Me → Notifications). */
  forceOpen?: boolean;
  /** Called when it closes: Later, Done, Got it, ✕, or allowed. */
  onClose?: () => void;
};

/**
 * The mascot asking to allow notifications. Shows only with `auto` (and
 * the rules agree) or `forceOpen`; mounting it alone never opens it. UI
 * only: SubjectShell's usePushSync registers the service worker and keeps
 * the subscription fresh.
 */
export function NotificationPromptSheet({
  auto = false,
  forceOpen = false,
  onClose,
}: Props): JSX.Element | null {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const student = useGetStudent();
  const [autoOpen, setAutoOpen] = useState(false);
  const [status, setStatus] = useState<PushStatus>("unsupported");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [subscribing, setSubscribing] = useState(false);

  // The rules, checked each time `auto` turns on.
  useEffect(() => {
    if (!auto) return;
    const current = getPushStatus();
    const dismissed = safeGet(DISMISSED_KEY) !== null;
    // A blocked browser can't be asked again: remember it like a "Later".
    if (!dismissed && current === "denied") markDismissed();
    setStatus(current);
    setAutoOpen(autoPushPrompt({ dismissed, status: current }) !== null);
  }, [auto]);

  useEffect(() => {
    if (!forceOpen) return;
    const current = getPushStatus();
    setStatus(current);
    setRequestState(current === "denied" ? "blocked" : "idle");
  }, [forceOpen]);

  const close = () => {
    markDismissed();
    setAutoOpen(false);
    onClose?.();
  };

  const allow = async () => {
    setRequestState("pending");
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setSubscribing(true);
        await subscribePush();
        setStatus("granted");
        setRequestState("idle");
        setAutoOpen(false);
        onClose?.();
      } else if (permission === "denied") {
        // Edge/Chrome's quiet UI often shows no popup, only an address-bar
        // icon: stay open and say where to look.
        setRequestState("blocked");
      } else {
        setRequestState("dismissed");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setRequestState("dismissed");
    } finally {
      setSubscribing(false);
    }
  };

  const busy = subscribing || requestState === "pending";
  let body: React.ReactNode;
  if (status === "ios-install") {
    body = (
      <>
        <h2 className="text-lg font-bold">
          {askNotificationDataLanguage.iosInstallTitle(lang)}
        </h2>
        <p className="text-sm text-[#5B6280]">
          {askNotificationDataLanguage.iosInstallBody(lang)}
        </p>
        <button type="button" onClick={close} className="chunky-btn mt-3 w-full">
          {askNotificationDataLanguage.gotIt(lang)}
        </button>
      </>
    );
  } else if (status === "granted" || status === "unsupported") {
    body = (
      <>
        <h2 className="text-lg font-bold">
          {status === "granted"
            ? homeLanguage.pushOnTitle(lang)
            : homeLanguage.pushUnsupported(lang)}
        </h2>
        {status === "granted" && (
          <p className="text-sm text-[#5B6280]">{homeLanguage.pushOnBody(lang)}</p>
        )}
        <button type="button" onClick={close} className="chunky-btn mt-3 w-full">
          {homeLanguage.done(lang)}
        </button>
      </>
    );
  } else {
    const help =
      requestState === "pending"
        ? askNotificationDataLanguage.lookForPrompt(lang)
        : requestState === "dismissed"
          ? askNotificationDataLanguage.promptDismissedHelp(lang)
          : requestState === "blocked"
            ? askNotificationDataLanguage.promptBlockedHelp(lang)
            : null;
    body = (
      <>
        <h2 className="text-lg font-bold">{askNotificationDataLanguage.title(lang)}</h2>
        <p className="text-sm text-[#5B6280]">{askNotificationDataLanguage.body(lang)}</p>
        {help && (
          <p
            role="status"
            className={`rounded-xl p-2 text-xs ${
              requestState === "pending"
                ? "bg-primary-color/5 text-primary-color"
                : "bg-warning-color/10 text-[#5B6280]"
            }`}
          >
            {help}
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={allow}
          className="chunky-btn mt-3 w-full disabled:opacity-60"
        >
          {busy
            ? "..."
            : requestState === "dismissed" || requestState === "blocked"
              ? askNotificationDataLanguage.tryAgain(lang)
              : askNotificationDataLanguage.allow(lang)}
        </button>
        <button
          type="button"
          onClick={close}
          className="py-2 text-sm font-bold text-[#7A80A0]"
        >
          {askNotificationDataLanguage.later(lang)}
        </button>
      </>
    );
  }

  return (
    <Sheet
      open={forceOpen || (auto && autoOpen)}
      onClose={close}
      ariaLabel={announcementDataLanguage.notifications(lang)}
    >
      <div className="flex flex-col items-center gap-2 pb-2 text-center font-Anuphan text-icon-color">
        {student.data && (
          <div className="relative mb-1 h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-white bg-[#E8F1FD] shadow-[0_4px_0_#E3E8F0]">
            <MascotAvatar
              clips={mascotForStudent(student.data)}
              alt=""
              id={student.data.id}
              greetOnMount
              sizes="120px"
            />
          </div>
        )}
        {body}
      </div>
    </Sheet>
  );
}
