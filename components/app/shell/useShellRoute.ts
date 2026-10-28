import Router, { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { queryString } from "../../common/RouteParamsGate";
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

// Next's pages router keeps no index in history.state (only url, as,
// options, __N and a per-entry `key`), so the shell numbers the entries it
// sees by that key to give backTarget a real history index.
const entryIdx = new Map<string, number>();
let lastIdx = -1;
let tracking = false;

function currentHistoryIdx(): number {
  const key = (window.history.state as { key?: string } | null)?.key;
  if (!key) return 0;
  let idx = entryIdx.get(key);
  if (idx === undefined) {
    // A new entry sits right after the one we were on.
    idx = lastIdx + 1;
    entryIdx.set(key, idx);
  }
  lastIdx = idx;
  return idx;
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
  back(): void;
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
        if (!subjectId) return;
        const target = backTarget({
          historyIdx: currentHistoryIdx(),
          subjectId,
        });
        if (target.kind === "history") {
          inAppPop = true;
          router.back();
        } else router.replace(target.url);
      },
      switchSubject(id: string) {
        router.push(`/subject/${id}`);
      },
    }),
    [router],
  );
}
