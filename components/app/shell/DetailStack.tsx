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
import { edgeBackOutcome } from "../../../utils/tabs";
import { inertProps } from "./TabPager";
import { ShellRoute, takeInAppPop, useShellNav } from "./useShellRoute";

export const DETAIL_SPRING = { tension: 320, friction: 34 };
const EDGE = 24;

type Detail = NonNullable<ShellRoute["detail"]>;

/** Plain mobile Safari (not the installed app) has its own edge-back gesture. */
function isIosBrowserTab(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(navigator as Navigator & { standalone?: boolean }).standalone
  );
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
      initial: [ix],
      movement: [mx],
      velocity: [vx],
      direction: [dirX],
      currentTarget,
      cancel,
      memo,
    }) => {
      const panel = currentTarget as HTMLElement;
      const startX: number = first
        ? ix - panel.getBoundingClientRect().left
        : memo;
      if (first && startX > EDGE) return cancel();
      const width = panel.clientWidth || 1;
      const x = Math.max(0, mx);
      const c = ctrl as Controller<{ x: number }>;
      if (!last) {
        c.start({ x: (x / width) * 100, immediate: true });
        depthApi.start({ depth: 1 - x / width, immediate: true });
        return startX;
      }
      const settle = () => {
        c.start({ x: 0, immediate: false, config: DETAIL_SPRING });
        depthApi.start({ depth: 1, immediate: false, config: DETAIL_SPRING });
      };
      const outcome = edgeBackOutcome({
        startX,
        dx: mx,
        vx: dirX > 0 ? vx : 0,
        width,
      });
      if (outcome === "back") {
        nav.back();
        // If the navigation was refused (e.g. the unsent-work prompt), slide back.
        window.setTimeout(() => {
          if (currentKey.current === key) settle();
        }, 700);
      } else settle();
      return startX;
    },
    { axis: "x", filterTaps: true },
  );

  return transitions((style, item, t) => {
    const leaving = t.phase === "leave";
    return (
      <animated.div
        {...(iosTab ? {} : bind(t.ctrl, item.assignmentId))}
        data-shell-swipe={iosTab ? undefined : ""}
        aria-hidden={leaving || undefined}
        {...inertProps(leaving)}
        className="absolute inset-0 z-20 overflow-hidden bg-background-color"
        style={{
          transform: style.x.to((v) => `translate3d(${v}%,0,0)`),
          boxShadow: "-8px 0 24px rgba(20,24,48,.12)",
        }}
      >
        <AssignmentDetail
          subjectId={subjectId}
          assignmentId={item.assignmentId}
        />
      </animated.div>
    );
  });
}
