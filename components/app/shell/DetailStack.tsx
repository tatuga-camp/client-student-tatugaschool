import {
  animated,
  Controller,
  SpringRef,
  useTransition,
} from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import Router from "next/router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import AssignmentDetail from "../../assignment/AssignmentDetail";
import { OverlayScope } from "../OverlayScope";
import { canStartShellSwipe, edgeBackOutcome } from "../../../utils/tabs";
import { DetailActiveContext } from "./DetailActive";
import PaneErrorBoundary from "./PaneErrorBoundary";
import { inertProps, TAP_SLOP } from "./TabPager";
import { ShellRoute, takeInAppPop, useShellNav } from "./useShellRoute";

export const DETAIL_SPRING = { tension: 320, friction: 34 };
const EDGE = 24;
// How long an edge-back waits for the router to start navigating.
const NO_NAV_MS = 500;

type Detail = NonNullable<ShellRoute["detail"]>;

/** Plain mobile Safari (not the installed app) has its own edge-back gesture. */
function isIosBrowserTab(): boolean {
  const ua = navigator.userAgent;
  // iPadOS Safari reports a Mac user agent; only touch tells them apart.
  const ios =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return ios && !(navigator as Navigator & { standalone?: boolean }).standalone;
}

type Props = {
  subjectId: string;
  detail: ShellRoute["detail"];
  /** The tab layer behind: 1 = fully covered (shifted -30%), 0 = shown. */
  depthApi: SpringRef<{ depth: number }>;
};

/** Detail pages slide in from the right over the tabs and swipe back. */
export default function DetailStack({ subjectId, detail, depthApi }: Props) {
  const nav = useShellNav();
  // The shell only renders on the client (after router.isReady).
  const [iosTab] = useState(isIosBrowserTab);
  const popped = useRef(false);
  const currentKey = useRef<string | null>(null);
  currentKey.current = detail?.assignmentId ?? null;
  const suppressClick = useRef(false);
  // Where the press began (React also bubbles presses in portals to here).
  const startTarget = useRef<EventTarget | null>(null);
  // Watches the navigation an edge-back started, until it settles.
  const stopWatching = useRef<(() => void) | null>(null);
  useEffect(() => () => stopWatching.current?.(), []);

  // Note browser back/forward so Safari's own swipe isn't animated twice;
  // the shell's own back button pops history too, and that one animates.
  useEffect(() => {
    Router.beforePopState(() => {
      popped.current = !takeInAppPop();
      return true;
    });
    const reset = () => {
      popped.current = false;
    };
    Router.events.on("routeChangeComplete", reset);
    Router.events.on("routeChangeError", reset);
    return () => {
      Router.beforePopState(() => true);
      Router.events.off("routeChangeComplete", reset);
      Router.events.off("routeChangeError", reset);
    };
  }, []);

  const skip = iosTab && popped.current;
  const items: Detail[] = detail ? [detail] : [];
  const transitions = useTransition(items, {
    keys: (item: Detail) => item.assignmentId,
    initial: null,
    from: { x: 100 },
    enter: { x: 0, immediate: skip },
    leave: { x: 100, immediate: skip },
    config: DETAIL_SPRING,
  });

  const open = !!detail;
  useLayoutEffect(() => {
    depthApi.start({
      depth: open ? 1 : 0,
      immediate: skip,
      config: DETAIL_SPRING,
    });
    // `skip` is read for this change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, depthApi]);

  const bind = useDrag(
    ({
      args: [ctrl, key],
      first,
      last,
      tap,
      canceled,
      initial: [ix],
      movement: [mx],
      velocity: [vx],
      direction: [dirX],
      currentTarget,
      cancel,
      memo,
    }) => {
      const c = ctrl as Controller<{ x: number }>;
      const settle = () => {
        c.start({ x: 0, immediate: false, config: DETAIL_SPRING });
        depthApi.start({ depth: 1, immediate: false, config: DETAIL_SPRING });
      };
      // A tap, or the extra release use-gesture sends after cancel():
      // nothing to decide, just make sure the page rests in place.
      if (tap || canceled) {
        if (last) settle();
        return memo;
      }
      const panel = currentTarget as HTMLElement;
      // React bubbles presses out of portals (sheets, viewers, video
      // overlays opened from this page): only the page itself swipes back.
      if (first && !canStartShellSwipe(panel, startTarget.current)) {
        return cancel();
      }
      const startX: number = first
        ? ix - panel.getBoundingClientRect().left
        : memo;
      if (first && startX > EDGE) return cancel();
      const width = panel.clientWidth || 1;
      const x = Math.max(0, mx);
      if (!last) {
        c.start({ x: (x / width) * 100, immediate: true });
        depthApi.start({ depth: 1 - x / width, immediate: true });
        return startX;
      }
      // The click that ends a mouse edge-drag must not hit what it was over.
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      const outcome = edgeBackOutcome({
        startX,
        dx: mx,
        vx: dirX > 0 ? vx : 0,
        width,
      });
      if (outcome !== "back") {
        settle();
        return startX;
      }
      // Slide back if the navigation is refused (e.g. the unsent-work
      // prompt cancels it) or ends with this page still open.
      stopWatching.current?.();
      const done = () => {
        stopWatching.current?.();
        if (currentKey.current === key) settle();
      };
      // back() may start no navigation at all (nothing to go back to, or a
      // refusal before routeChangeStart): the page must not stay off-position.
      let started = false;
      const onStart = () => {
        started = true;
      };
      const idle = window.setTimeout(() => {
        if (started) return;
        // Nothing popped: the next real pop is the browser's, not ours.
        takeInAppPop();
        done();
      }, NO_NAV_MS);
      Router.events.on("routeChangeStart", onStart);
      Router.events.on("routeChangeError", done);
      Router.events.on("routeChangeComplete", done);
      stopWatching.current = () => {
        window.clearTimeout(idle);
        Router.events.off("routeChangeStart", onStart);
        Router.events.off("routeChangeError", done);
        Router.events.off("routeChangeComplete", done);
        stopWatching.current = null;
      };
      nav.back();
      return startX;
    },
    { axis: "x", filterTaps: true, tapsThreshold: TAP_SLOP },
  );

  return transitions((style, item, t) => {
    const leaving = t.phase === "leave";
    return (
      <animated.div
        {...(iosTab ? {} : bind(t.ctrl, item.assignmentId))}
        onPointerDownCapture={(e) => {
          startTarget.current = e.target;
        }}
        // Replaces use-gesture's own click filter, which would also eat
        // clicks after presses that only jittered or were cancelled.
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        data-shell-swipe={iosTab ? undefined : ""}
        aria-hidden={leaving || undefined}
        {...inertProps(leaving)}
        className="absolute inset-0 z-20 overflow-hidden bg-background-color"
        style={{
          transform: style.x.to((v) => `translate3d(${v}%,0,0)`),
          boxShadow: "-8px 0 24px rgba(20,24,48,.12)",
        }}
      >
        {/* Sheets opened from this page render in the panel and move with it. */}
        <OverlayScope>
          <PaneErrorBoundary onBack={nav.back}>
            <DetailActiveContext.Provider value={!leaving}>
              <AssignmentDetail
                subjectId={subjectId}
                assignmentId={item.assignmentId}
              />
            </DetailActiveContext.Provider>
          </PaneErrorBoundary>
        </OverlayScope>
      </animated.div>
    );
  });
}
