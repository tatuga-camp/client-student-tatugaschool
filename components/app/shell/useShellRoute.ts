import Router, { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { queryString } from "../../common/RouteParamsGate";
import { leaveIfAllowed } from "../../../utils/leaveGuard";
import { createHistoryIndex, restoreDelta } from "../../../utils/historyIndex";
import { backTarget, parseTab, TabKey } from "../../../utils/tabs";

export type ShellRoute = {
  subjectId: string;
  tab: TabKey;
  detail: { kind: "assignment"; assignmentId: string } | null;
  announcementId: string | null;
};

/** Props of every tab pane file (Part 2 rewrites the panes). */
export type TabPaneProps = { subjectId: string; active: boolean };

/** Props of components/assignment/AssignmentDetail.tsx (Part 3 rewrites it). */
export type DetailPaneProps = { subjectId: string; assignmentId: string };

const ASSIGNMENT_PATHNAME = "/subject/[subjectId]/assignment/[assignmentId]";

// Next keeps no history index, so the shell numbers entries by Next's
// per-entry `key` (see utils/historyIndex.ts) to give backTarget one.
const historyIndex = createHistoryIndex();
let tracking = false;

function currentHistoryIdx(): number {
  return historyIndex.visit(
    (window.history.state as { key?: string } | null)?.key,
  );
}

/**
 * Called while a browser pop is being handled (before the shell has moved):
 * how far history.go() must go to get back to the entry we were on.
 */
export function popRestoreDelta(): number | null {
  const key = (window.history.state as { key?: string } | null)?.key;
  return restoreDelta(historyIndex.current(), historyIndex.peek(key));
}

// Set while our own back() pops history, so the detail stack can tell it
// from the browser's back (Safari's edge swipe), which it must not animate.
let inAppPop = false;

/** True once for the popstate that the shell's own back() caused. */
export function takeInAppPop(): boolean {
  const was = inAppPop;
  inAppPop = false;
  return was;
}

/** The first entry the shell sees counts as 0: no in-app history behind it. */
function trackHistory(): void {
  if (tracking) return;
  tracking = true;
  currentHistoryIdx();
  Router.events.on("routeChangeComplete", currentHistoryIdx);
}

/** The shell's state, read from the URL; null until the router is ready. */
export function useShellRoute(): ShellRoute | null {
  const router = useRouter();
  const { isReady, pathname, query } = router;
  const subjectId = queryString(query.subjectId);
  const assignmentId = queryString(query.assignmentId);
  const rawTab = queryString(query.tab);
  const announcementId = queryString(query.announcement_id) ?? null;

  useEffect(() => {
    if (isReady) trackHistory();
  }, [isReady]);

  return useMemo(() => {
    if (!isReady || !subjectId) return null;
    const detail =
      pathname === ASSIGNMENT_PATHNAME && assignmentId
        ? { kind: "assignment" as const, assignmentId }
        : null;
    // A notification link opens the announcement, which lives on Classwork.
    const tab: TabKey =
      announcementId && !rawTab ? "classwork" : parseTab(rawTab);
    return { subjectId, tab, detail, announcementId };
  }, [isReady, pathname, subjectId, assignmentId, rawTab, announcementId]);
}

/** Navigation actions for the shell's tabs and detail pages. */
export function useShellNav(): {
  goTab(tab: TabKey): void;
  openAssignment(id: string): void;
  /** Resolves "stayed" when the unsent-work guard kept the student here. */
  back(): Promise<"left" | "stayed">;
  switchSubject(id: string): void;
} {
  const router = useRouter();
  return useMemo(
    () => ({
      // Native tab bars don't add history: replace, shallow, no scroll.
      // Home omits `tab`; a one-shot announcement_id is dropped too, or it
      // would keep forcing Classwork.
      goTab(tab: TabKey) {
        const { tab: _tab, announcement_id: _a, ...rest } = router.query;
        router.replace(
          { query: tab === "home" ? rest : { ...rest, tab } },
          undefined,
          { shallow: true, scroll: false },
        );
      },
      openAssignment(id: string) {
        const subjectId = queryString(router.query.subjectId);
        if (!subjectId) return;
        router.push(`/subject/${subjectId}/assignment/${id}`);
      },
      back() {
        const subjectId = queryString(router.query.subjectId);
        if (!subjectId) return Promise.resolve("left" as const);
        // The unsent-work guard is asked first; history is only popped once
        // it allows leaving, so "stay" never changes the URL.
        return leaveIfAllowed(() => {
          const target = backTarget({
            historyIdx: currentHistoryIdx(),
            subjectId,
          });
          if (target.kind === "history") {
            inAppPop = true;
            router.back();
          } else router.replace(target.url);
        });
      },
      switchSubject(id: string) {
        router.push(`/subject/${id}`);
      },
    }),
    [router],
  );
}
