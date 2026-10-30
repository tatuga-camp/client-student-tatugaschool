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

/** Props of every tab pane (components/{home,classwork,…}/…Tab.tsx). */
export type TabPaneProps = { subjectId: string; active: boolean };

/** Props of components/assignment/AssignmentDetail.tsx. */
export type DetailPaneProps = { subjectId: string; assignmentId: string };

const ASSIGNMENT_PATHNAME = "/subject/[subjectId]/assignment/[assignmentId]";

// Next keeps no history index, so the shell numbers entries by Next's
// per-entry `key` (see utils/historyIndex.ts) to give backTarget one.
const historyIndex = createHistoryIndex();
let tracking = false;
// The key of the entry the browser last moved to by a back/forward: landing
// on it is a pop, not a push, and a new key reached that way stays unindexed.
let lastPoppedKey: string | undefined;

const stateKey = () =>
  (window.history.state as { key?: string } | null)?.key ?? undefined;

// Where the browser has the Navigation API, it numbers every entry of the
// tab, from before a reload too: the exact distance back after a pop.
type NavigationLike = { currentEntry: { index: number } | null };
function browserIndex(): number | undefined {
  const nav = (window as { navigation?: NavigationLike }).navigation;
  const index = nav?.currentEntry?.index;
  return typeof index === "number" && index >= 0 ? index : undefined;
}
// The browser's index of the entry the shell is on.
let shellBrowserIndex: number | null = null;

/** The current entry's index; `path` (after a navigation) is recorded too. */
function currentHistoryIdx(path?: string): number {
  const key = stateKey();
  shellBrowserIndex = browserIndex() ?? null;
  return historyIndex.visit(key, path, key === lastPoppedKey);
}

// Told each pop's key once Next's own popstate handler has run, so a restore
// whose landing Next never passed to beforePopState can be settled.
const settleListeners = new Set<(key: string | undefined) => void>();

export function onPopSettled(
  listener: (key: string | undefined) => void,
): () => void {
  settleListeners.add(listener);
  return () => {
    settleListeners.delete(listener);
  };
}

/** The path of the entry behind the current one, if the shell saw it. */
export function previousEntryPath(): string | undefined {
  return historyIndex.previousPath();
}

/**
 * Read while a browser pop is being handled (before the shell has moved):
 * the popped and current entries' keys, how far history.go() must go to get
 * back to the entry we were on (null when the popped entry is unknown: it
 * then counts as behind, P3-21).
 */
export function popInfo(): {
  poppedKey: string | undefined;
  currentKey: string | null;
  delta: number | null;
} {
  const poppedKey = stateKey();
  return {
    poppedKey,
    currentKey: historyIndex.currentKey(),
    delta:
      restoreDelta(shellBrowserIndex, browserIndex()) ??
      restoreDelta(historyIndex.current(), historyIndex.peek(poppedKey)),
  };
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

/**
 * Starts numbering history entries (once). The first entry seen, the shell's
 * or the sign-in page's, counts as 0: no in-app history behind it.
 */
export function trackHistory(): void {
  if (tracking) return;
  tracking = true;
  // Capture: runs before Next's own popstate listener starts the navigation.
  window.addEventListener(
    "popstate",
    () => {
      const key = stateKey();
      lastPoppedKey = key;
      // A flag set before this pop was for this pop. By the tick below Next
      // has handled it, through beforePopState or not, so the flag is spent.
      const forThisPop = inAppPop;
      window.setTimeout(() => {
        if (forThisPop) inAppPop = false;
        settleListeners.forEach((l) => l(key));
      }, 0);
    },
    true,
  );
  currentHistoryIdx(Router.asPath);
  Router.events.on("routeChangeComplete", (url: string) =>
    currentHistoryIdx(url),
  );
  // A back with nothing behind it pops nothing: its flag lasts until the
  // next navigation completes or fails. (The pop back() causes reaches
  // beforePopState before any route event.)
  const clearInAppPop = () => {
    inAppPop = false;
  };
  Router.events.on("routeChangeComplete", clearInAppPop);
  Router.events.on("routeChangeError", clearInAppPop);
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
