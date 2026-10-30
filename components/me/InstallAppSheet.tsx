import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  askNotificationDataLanguage,
  homeLanguage,
  profileLanguage,
} from "../../data/languages";
import type { Language } from "../../interfaces";
import { useGetSubjectById } from "../../react-query";
import {
  InstallMethod,
  installMethod,
  pageManifestHref,
} from "../../utils/pwaManifest";
import { Sheet } from "../app/Sheet";

// Chromium fires beforeinstallprompt soon after it reads the manifest. Past
// this it isn't coming: the app is already installed or the browser won't
// offer it, so fall back to the menu steps.
const PROMPT_WAIT_MS = 4000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  lang: Language;
};

/**
 * Me → Install app. The manifest is linked only once this first opens, so a
 * plain visit never requests /api/manifest. The installed app opens on this
 * subject; the link stays after closing so iPhone's Share sheet still sees it.
 */
export default function InstallAppSheet({
  open,
  onClose,
  subjectId,
  lang,
}: Props) {
  const subject = useGetSubjectById({ id: subjectId });
  const [method, setMethod] = useState<InstallMethod>("menu");
  const [linked, setLinked] = useState(false);
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [waitedOut, setWaitedOut] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Listening from mount, before the manifest is linked, so the event can't
  // fire unheard.
  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Our Install button replaces Chrome's mini-infobar.
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setMethod(
      installMethod({
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints,
        promptSupported: "onbeforeinstallprompt" in window,
      }),
    );
    setLinked(true);
    setInstalled(false);
    setWaitedOut(false);
    const timer = window.setTimeout(() => setWaitedOut(true), PROMPT_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  const install = async () => {
    if (!promptEvent) return;
    setInstalling(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
    } catch (error) {
      console.error("Install prompt failed:", error);
    } finally {
      // An event prompts once; Chromium sends a new one if it can ask again.
      setPromptEvent(null);
      setInstalling(false);
    }
  };

  const title = subject.data?.title;
  const name = title ?? "Tatuga School";
  const waitingForPrompt = method === "prompt" && !promptEvent && !waitedOut;
  const canPrompt = method === "prompt" && (promptEvent || waitingForPrompt);

  let steps: string | null = null;
  if (!installed && method === "ios")
    steps = profileLanguage.installIosSteps(lang);
  else if (!installed && !canPrompt)
    steps = profileLanguage.installMenuSteps(lang);

  return (
    <>
      {/* Wait for the title so the browser reads one manifest, not two. */}
      {linked && !subject.isLoading && (
        <Head>
          <link
            rel="manifest"
            href={pageManifestHref({
              path: `/subject/${encodeURIComponent(subjectId)}`,
              name: title ?? "",
            })}
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content={name} />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </Head>
      )}
      <Sheet
        open={open}
        onClose={onClose}
        ariaLabel={profileLanguage.installApp(lang)}
      >
        <div className="flex flex-col items-center gap-2 pb-2 text-center font-Anuphan text-icon-color">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={72}
            height={72}
            className="mb-1 rounded-[18px] shadow-[0_4px_0_#E3E8F0]"
          />
          <h2 className="text-lg font-bold">
            {installed
              ? profileLanguage.installedTitle(lang)
              : profileLanguage.installApp(lang)}
          </h2>
          <p className="text-sm text-[#5B6280]">
            {installed
              ? profileLanguage.installedBody(lang)
              : profileLanguage.installBody(lang, name)}
          </p>
          {steps && (
            <p
              role="status"
              className="w-full rounded-xl bg-primary-color/5 p-3 text-sm font-bold text-primary-color"
            >
              {steps}
            </p>
          )}
          {canPrompt && !installed ? (
            <>
              <button
                type="button"
                disabled={!promptEvent || installing}
                onClick={install}
                className="chunky-btn mt-3 w-full disabled:opacity-60"
              >
                {promptEvent
                  ? profileLanguage.install(lang)
                  : profileLanguage.installPreparing(lang)}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 text-sm font-bold text-[#7A80A0]"
              >
                {askNotificationDataLanguage.later(lang)}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="chunky-btn mt-3 w-full"
            >
              {installed
                ? homeLanguage.done(lang)
                : askNotificationDataLanguage.gotIt(lang)}
            </button>
          )}
        </div>
      </Sheet>
    </>
  );
}
