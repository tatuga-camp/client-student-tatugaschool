import { useRouter } from "next/router";
import React from "react";
import Swal from "sweetalert2";
import { classworkDataLanguage } from "../data/languages";
import { Language } from "../interfaces";
import { isSamePath } from "../utils";

const ABORT_MESSAGE =
  "Route change aborted by useConfirmSubmissionGuard (safe to ignore)";

function useConfirmSubmissionGuard({
  enabled,
  onConfirm,
  language,
}: {
  enabled: boolean;
  onConfirm: () => Promise<boolean>;
  language: Language;
}): void {
  const router = useRouter();
  const bypassRef = React.useRef(false);
  // The routeChangeStart handler is registered once, so it reads the latest
  // props through refs instead of closing over stale values.
  const enabledRef = React.useRef(enabled);
  const onConfirmRef = React.useRef(onConfirm);
  const languageRef = React.useRef(language);
  enabledRef.current = enabled;
  onConfirmRef.current = onConfirm;
  languageRef.current = language;

  React.useEffect(() => {
    const showLeaveDialog = async (url: string) => {
      const lang = languageRef.current;
      const result = await Swal.fire({
        icon: "warning",
        title: classworkDataLanguage.leaveDialog.title(lang),
        text: classworkDataLanguage.leaveDialog.text(lang),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: classworkDataLanguage.leaveDialog.confirm(lang),
        denyButtonText: classworkDataLanguage.leaveDialog.leave(lang),
        cancelButtonText: classworkDataLanguage.leaveDialog.stay(lang),
        customClass: {
          popup: "rounded-2xl border border-gray-100 shadow-md",
        },
      });
      if (result.isConfirmed) {
        const success = await onConfirmRef.current();
        if (success) {
          bypassRef.current = true;
          router.push(url);
        }
      } else if (result.isDenied) {
        bypassRef.current = true;
        router.push(url);
      }
    };

    const handleRouteChangeStart = (url: string) => {
      if (!enabledRef.current || bypassRef.current) return;
      if (isSamePath(router.asPath, url)) return;
      router.events.emit("routeChangeError");
      showLeaveDialog(url);
      // Throwing inside routeChangeStart is the Pages Router idiom to
      // cancel a navigation; Next.js surfaces it as a routeChangeError.
      throw ABORT_MESSAGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);

  React.useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
}

export default useConfirmSubmissionGuard;
