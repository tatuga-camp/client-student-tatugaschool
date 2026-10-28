import { useRouter } from "next/router";
import React from "react";
import { isSamePath } from "../utils";
import { setLeaveInterceptor } from "../utils/leaveGuard";

const ABORT_MESSAGE =
  "Route change aborted by useConfirmSubmissionGuard (safe to ignore)";

type Choice = "submit" | "leave" | "stay";

/**
 * Guards leaving a page with unsent work.
 *
 * - The in-app back button/edge swipe ask first (utils/leaveGuard) and only
 *   then pop history, so "stay" never touches the URL.
 * - Any other route change (a push, or the browser's own back) is cancelled,
 *   the student is asked, and it is redone on leave/submit. On a cancelled
 *   browser back, "stay" puts the URL back.
 * - `ask` shows the choice (the sheet owns the copy); `onConfirm` submits.
 */
function useConfirmSubmissionGuard({
  enabled,
  onConfirm,
  ask,
}: {
  enabled: boolean;
  onConfirm: () => Promise<boolean>;
  ask: () => Promise<Choice>;
}): void {
  const router = useRouter();
  const bypassRef = React.useRef(false);
  const pendingRef = React.useRef<Promise<boolean> | null>(null);
  // The handlers are registered once, so they read the latest props through
  // refs instead of closing over stale values.
  const enabledRef = React.useRef(enabled);
  const onConfirmRef = React.useRef(onConfirm);
  const askRef = React.useRef(ask);
  enabledRef.current = enabled;
  onConfirmRef.current = onConfirm;
  askRef.current = ask;

  React.useEffect(() => {
    /** true = the student may leave. One question at a time. */
    const decide = (): Promise<boolean> => {
      if (!enabledRef.current || bypassRef.current)
        return Promise.resolve(true);
      if (pendingRef.current) return pendingRef.current;
      const run = (async () => {
        const choice = await askRef.current();
        if (choice === "stay") return false;
        if (choice === "submit" && !(await onConfirmRef.current()))
          return false;
        bypassRef.current = true;
        return true;
      })().finally(() => {
        pendingRef.current = null;
      });
      pendingRef.current = run;
      return run;
    };

    const interceptor = {
      active: () => enabledRef.current && !bypassRef.current,
      confirm: decide,
    };
    setLeaveInterceptor(interceptor);

    const handleRouteChangeStart = (url: string) => {
      if (!enabledRef.current || bypassRef.current) return;
      if (isSamePath(router.asPath, url)) return;
      // A browser back/forward has already moved the address bar.
      const poppedByBrowser = !isSamePath(
        window.location.pathname,
        router.asPath,
      );
      const here = router.asPath;
      router.events.emit("routeChangeError");
      void decide().then((leave) => {
        if (leave) router.push(url);
        else if (poppedByBrowser)
          router.push(here, undefined, { scroll: false });
      });
      // Throwing inside routeChangeStart is the Pages Router idiom to
      // cancel a navigation; Next.js surfaces it as a routeChangeError.
      throw ABORT_MESSAGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      setLeaveInterceptor(null, interceptor);
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
