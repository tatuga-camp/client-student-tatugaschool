import React, { useEffect } from "react";
import Image from "next/image";
import {
  isIosSafariWithoutPwa,
  registerServiceWorker,
} from "../utils/notifications";
import { SubscribeStudentToPushService } from "../services";
import PopupLayout from "./layouts/PopupLayout";
import { useGetLanguage } from "../react-query";
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

function AskNotification() {
  const language = useGetLanguage();
  const [isNotification, setIsNotification] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [iosNeedsInstall, setIosNeedsInstall] = React.useState(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);

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
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setLoading(true);
        await SubscribeStudentToPushService();
        setLoading(false);
      } else if (permission === "denied") {
        markDismissed();
      }
      setIsNotification(true);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setIsNotification(true);
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
            <button
              disabled={loading}
              onClick={requestNotificationPermission}
              className="w-60 rounded-full bg-primary-color px-4 py-1 text-white hover:bg-primary-color-hover"
            >
              {loading
                ? "..."
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
