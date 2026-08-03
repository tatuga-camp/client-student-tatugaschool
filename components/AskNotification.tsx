import React, { useEffect } from "react";
import Image from "next/image";
import { registerServiceWorker } from "../utils/notifications";
import { SubscribeStudentToPushService } from "../services";
import PopupLayout from "./layouts/PopupLayout";
import { useGetLanguage } from "../react-query";
import { askNotificationDataLanguage } from "../data/languages";

function isIosSafariWithoutPwa(): boolean {
  if (typeof window === "undefined") return false;
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
  return isIos && !isStandalone;
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
              onClick={() => setIosNeedsInstall(false)}
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
