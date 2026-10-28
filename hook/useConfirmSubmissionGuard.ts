import { useRouter } from "next/router";
import React from "react";
import { popRestoreDelta } from "../components/app/shell/useShellRoute";
import { isSamePath } from "../utils";
import { setLeaveInterceptor, setPopInterceptor } from "../utils/leaveGuard";

const ABORT_MESSAGE =
  "Route change aborted by useConfirmSubmissionGuard (safe to ignore)";

type Choice = "submit" | "leave" | "stay";

/**
 * Guards leaving a page with unsent work.
 *
 * - The in-app back button/edge swipe ask first (utils/leaveGuard) and only
 *   then pop history, so "stay" never touches the URL.
 * - The browser's own back/forward is cancelled through beforePopState (no
 *   throw), the student is asked, and on leave/submit the route is rendered;
 *   on stay history.go() steps back to the entry we were on.
 * - A programmatic push from elsewhere can only be cancelled by throwing in
 *   routeChangeStart (Next's idiom); it is redone on leave/submit.
 * - `ask` shows the choice (the sheet owns the copy); `onConfirm` submits.
 * - The guard stays active while its decision (or the submit) is pending.
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
  const aliveRef = React.useRef(true);
  const restoringRef = React.useRef(false);
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
    aliveRef.current = true;
    const needsAnswer = () =>
      pendingRef.current !== null || (enabledRef.current && !bypassRef.current);

    /** true = the student may leave. One question at a time. */
    const decide = (): Promise<boolean> => {
      if (pendingRef.current) return pendingRef.current;
      if (!needsAnswer()) return Promise.resolve(true);
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

    const interceptor = { active: needsAnswer, confirm: decide };
    setLeaveInterceptor(interceptor);

    // Browser back/forward: cancel, ask, then render or step back.
    const onPop = (state: { as: string }): boolean => {
      if (restoringRef.current) {
        // The pop we caused to undo the cancelled one: nothing to render.
        restoringRef.current = false;
        return true;
      }
      if (!needsAnswer() || bypassRef.current) return false;
      const delta = popRestoreDelta();
      const here = router.asPath;
      void decide().then((leave) => {
        if (!aliveRef.current) return;
        if (leave) {
          router.replace(state.as);
        } else if (delta !== null && delta !== 0) {
          restoringRef.current = true;
          window.history.go(delta);
        } else {
          // Index unknown: the old duplicate-entry fallback.
          router.push(here, undefined, { scroll: false });
        }
      });
      return true;
    };
    setPopInterceptor(onPop);

    // Anything else (a programmatic push) can only be cancelled by throwing.
    const handleRouteChangeStart = (url: string) => {
      if (!needsAnswer() || bypassRef.current) return;
      if (isSamePath(router.asPath, url)) return;
      router.events.emit("routeChangeError");
      void decide().then((leave) => {
        if (leave && aliveRef.current) router.push(url);
      });
      throw ABORT_MESSAGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      aliveRef.current = false;
      router.events.off("routeChangeStart", handleRouteChangeStart);
      setLeaveInterceptor(null, interceptor);
      setPopInterceptor(null, onPop);
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
