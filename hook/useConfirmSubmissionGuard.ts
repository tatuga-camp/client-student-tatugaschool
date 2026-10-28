import { useRouter } from "next/router";
import React from "react";
import { popInfo } from "../components/app/shell/useShellRoute";
import { isSamePath } from "../utils";
import { setLeaveInterceptor, setPopInterceptor } from "../utils/leaveGuard";
import { decidePop, popOutcome } from "../utils/popGuard";

const ABORT_MESSAGE =
  "Route change aborted by useConfirmSubmissionGuard (safe to ignore)";

type Choice = "submit" | "leave" | "stay";

/**
 * Guards leaving a page with unsent work.
 *
 * - The in-app back button/edge swipe ask first (utils/leaveGuard) and only
 *   then pop history, so "stay" never touches the URL. For these, the in-app
 *   leave() is the only navigator.
 * - The browser back/forward is cancelled through beforePopState (no throw)
 *   and decided by utils/popGuard: a first pop opens the question and, on
 *   Leave/Submit, renders the popped route with one replace. A pop while a
 *   question is open never joins it: it counts as Stay (the sheet closes) and
 *   the URL is restored once.
 * - A programmatic push from elsewhere can only be cancelled by throwing in
 *   routeChangeStart (the Pages Router idiom); it is redone on leave/submit.
 * - `ask` shows the choice (the sheet owns the copy); `cancelAsk` closes it as
 *   Stay; `onConfirm` submits. The guard stays active while a decision (or
 *   the submit) is pending.
 */
function useConfirmSubmissionGuard({
  enabled,
  onConfirm,
  ask,
  cancelAsk,
}: {
  enabled: boolean;
  onConfirm: () => Promise<boolean>;
  ask: () => Promise<Choice>;
  cancelAsk: () => void;
}): void {
  const router = useRouter();
  const bypassRef = React.useRef(false);
  const aliveRef = React.useRef(true);
  const pendingRef = React.useRef<Promise<boolean> | null>(null);
  const originRef = React.useRef<"app" | "pop">("app");
  // The key of the entry a history.go() restore is heading to, if any.
  const restoringKeyRef = React.useRef<string | null>(null);
  // The latest popped route (only the latest matters) and what has been done.
  const latestPopRef = React.useRef<{ as: string } | null>(null);
  const cancelledByPopRef = React.useRef(false);
  const restoredRef = React.useRef(false);
  // The handlers are registered once, so they read the latest props through
  // refs instead of closing over stale values.
  const enabledRef = React.useRef(enabled);
  const onConfirmRef = React.useRef(onConfirm);
  const askRef = React.useRef(ask);
  const cancelAskRef = React.useRef(cancelAsk);
  enabledRef.current = enabled;
  onConfirmRef.current = onConfirm;
  askRef.current = ask;
  cancelAskRef.current = cancelAsk;

  React.useEffect(() => {
    aliveRef.current = true;
    const needsAnswer = () =>
      pendingRef.current !== null || (enabledRef.current && !bypassRef.current);

    /** true = the student may leave. One question at a time. */
    const decide = (origin: "app" | "pop"): Promise<boolean> => {
      if (pendingRef.current) return pendingRef.current;
      if (!needsAnswer()) return Promise.resolve(true);
      originRef.current = origin;
      cancelledByPopRef.current = false;
      restoredRef.current = false;
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

    const interceptor = { active: needsAnswer, confirm: () => decide("app") };
    setLeaveInterceptor(interceptor);

    /** Put the URL back on the entry we were on, once. */
    const restore = (
      restoreTo: { go: number } | { push: true },
      key: string | null,
    ) => {
      restoredRef.current = true;
      if ("go" in restoreTo) {
        restoringKeyRef.current = key;
        window.history.go(restoreTo.go);
      } else {
        // Index unknown: no flag (nothing will land to clear it).
        router.push(router.asPath, undefined, { scroll: false });
      }
    };

    // Browser back/forward: cancel, then decide with utils/popGuard.
    const onPop = (state: { as: string }): boolean => {
      if (bypassRef.current) return false;
      const info = popInfo();
      const { action, restoringKey } = decidePop({
        restoringKey: restoringKeyRef.current,
        poppedKey: info.poppedKey,
        currentKey: info.currentKey,
        pending: pendingRef.current !== null,
        needsAnswer: needsAnswer(),
        delta: info.delta,
      });
      restoringKeyRef.current = restoringKey;
      latestPopRef.current = state;
      switch (action.kind) {
        case "pass":
          return false;
        case "swallow":
          return true;
        case "stay":
          // A pop never joins an open question: it closes it as Stay.
          cancelledByPopRef.current = true;
          restore(action.restore, info.currentKey);
          cancelAskRef.current();
          return true;
        case "ask": {
          void decide("pop").then((leave) => {
            if (!aliveRef.current) return;
            const outcome = popOutcome({
              origin: originRef.current,
              leave,
              cancelledByPop: cancelledByPopRef.current,
              restored: restoredRef.current,
            });
            if (outcome === "replace" && latestPopRef.current) {
              router.replace(latestPopRef.current.as);
            } else if (outcome === "restore") {
              restore(
                info.delta !== null && info.delta !== 0
                  ? { go: info.delta }
                  : { push: true },
                info.currentKey,
              );
            }
          });
          return true;
        }
      }
    };
    setPopInterceptor(onPop);

    // Anything else (a programmatic push) can only be cancelled by throwing.
    const handleRouteChangeStart = (url: string) => {
      if (!needsAnswer() || bypassRef.current) return;
      if (isSamePath(router.asPath, url)) return;
      router.events.emit("routeChangeError");
      void decide("app").then((leave) => {
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
