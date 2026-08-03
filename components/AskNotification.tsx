import React, { useEffect } from "react";
import Image from "next/image";
import {
  isIosSafariWithoutPwa,
  registerServiceWorker,
} from "../utils/notifications";
import { SubscribeStudentToPushService } from "../services";
import PopupLayout from "./layouts/PopupLayout";
import { useGetLanguage, useGetStudent } from "../react-query";
import { askNotificationDataLanguage } from "../data/languages";

const DISMISSED_KEY = "ask-notification-dismissed";

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

function markDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable (e.g. private mode) — nothing to persist
  }
}

// Browsers can rotate or invalidate a PushSubscription, and the server
// self-deletes rows whose endpoint returns 410/404. Once permission is
// granted the prompt never shows again, so we silently re-send the current
// subscription to the server on visits — at most once per day per student.
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

function shouldSyncPush(studentId: string): boolean {
  try {
    const last = window.localStorage.getItem(`push-sync-at:${studentId}`);
    return !last || Date.now() - Number(last) > SYNC_INTERVAL_MS;
  } catch {
    return true;
  }
}

function markPushSynced(studentId: string): void {
  try {
    window.localStorage.setItem(`push-sync-at:${studentId}`, String(Date.now()));
  } catch {
    // localStorage unavailable — sync will just run again next visit
  }
}

type RequestState = "idle" | "pending" | "dismissed" | "blocked";

function AskNotification() {
  const language = useGetLanguage();
  const student = useGetStudent();
  const [isNotification, setIsNotification] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [iosNeedsInstall, setIosNeedsInstall] = React.useState(false);
  const [requestState, setRequestState] = React.useState<RequestState>("idle");

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const studentId = student.data?.id;
  useEffect(() => {
    if (!studentId) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (!shouldSyncPush(studentId)) return;

    SubscribeStudentToPushService()
      .then(() => markPushSynced(studentId))
      .catch((error) =>
        console.error("Push subscription re-sync failed:", error),
      );
  }, [studentId]);

  useEffect(() => {
    if (isDismissed()) {
      setIsNotification(true);
      return;
    }
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "denied"
    ) {
      markDismissed();
      setIsNotification(true);
      return;
    }
    if (isIosSafariWithoutPwa()) {
      // iOS only supports web push from an installed home-screen PWA
      setIosNeedsInstall(true);
      setIsNotification(true);
      return;
    }
    const granted =
      typeof Notification === "undefined" ||
      Notification.permission === "granted";
    setIsNotification(granted);
  }, []);

  const requestNotificationPermission = async (): Promise<void> => {
    document.body.style.overflow = "auto";
    try {
      setRequestState("pending");
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setLoading(true);
        await SubscribeStudentToPushService();
        setLoading(false);
        setRequestState("idle");
        setIsNotification(true);
      } else if (permission === "denied") {
        // Edge/Chrome quiet UI: often no visible popup, just a small
        // address-bar icon — keep the modal open and tell the user where to look
        setRequestState("blocked");
      } else {
        setRequestState("dismissed");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setRequestState("dismissed");
    }
  };

  if (isNotification && !iosNeedsInstall) return null;

  return (
    <PopupLayout
      onClose={() => {
        markDismissed();
        setIsNotification(true);
        setIosNeedsInstall(false);
      }}
    >
      <div className="mx-4 flex h-max max-h-[90dvh] w-full max-w-96 flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-5 font-Anuphan md:mx-0">
        <div className="relative h-10 w-10">
          <Image
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src="/favicon.ico"
            alt="logo"
          />
        </div>
        {iosNeedsInstall ? (
          <>
            <h1 className="mt-5 text-center text-xl font-semibold">
              {askNotificationDataLanguage.iosInstallTitle(
                language.data ?? "en"
              )}
            </h1>
            <span className="text-center text-sm text-gray-500">
              {askNotificationDataLanguage.iosInstallBody(
                language.data ?? "en"
              )}
            </span>
            <button
              onClick={() => {
                markDismissed();
                setIosNeedsInstall(false);
              }}
              className="mt-5 rounded-full bg-primary-color px-6 py-1 text-white"
            >
              {askNotificationDataLanguage.gotIt(language.data ?? "en")}
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-center text-xl font-semibold">
              {askNotificationDataLanguage.title(language.data ?? "en")}
            </h1>
            <span className="text-sm text-gray-500">
              {askNotificationDataLanguage.body(language.data ?? "en")}
            </span>
            {requestState === "pending" && (
              <span className="rounded-xl bg-primary-color/5 p-2 text-center text-xs text-primary-color">
                {askNotificationDataLanguage.lookForPrompt(
                  language.data ?? "en",
                )}
              </span>
            )}
            {requestState === "dismissed" && (
              <span className="rounded-xl bg-warning-color/10 p-2 text-center text-xs text-gray-600">
                {askNotificationDataLanguage.promptDismissedHelp(
                  language.data ?? "en",
                )}
              </span>
            )}
            {requestState === "blocked" && (
              <span className="rounded-xl bg-warning-color/10 p-2 text-center text-xs text-gray-600">
                {askNotificationDataLanguage.promptBlockedHelp(
                  language.data ?? "en",
                )}
              </span>
            )}
            <button
              disabled={loading || requestState === "pending"}
              onClick={requestNotificationPermission}
              className="w-60 rounded-full bg-primary-color px-4 py-1 text-white hover:bg-primary-color-hover disabled:opacity-50"
            >
              {loading || requestState === "pending"
                ? "..."
                : requestState === "dismissed" || requestState === "blocked"
                  ? askNotificationDataLanguage.tryAgain(language.data ?? "en")
                  : askNotificationDataLanguage.allow(language.data ?? "en")}
            </button>
            <button
              onClick={() => {
                markDismissed();
                document.body.style.overflow = "auto";
                setIsNotification(true);
              }}
              className="mt-10 text-xs text-gray-500 underline"
            >
              {askNotificationDataLanguage.later(language.data ?? "en")}
            </button>
          </>
        )}
      </div>
    </PopupLayout>
  );
}

export default AskNotification;
