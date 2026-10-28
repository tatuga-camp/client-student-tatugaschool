import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import React, { useEffect, useRef, useState } from "react";
import ClassworkTab from "../../classwork/ClassworkTab";
import HomeTab from "../../home/HomeTab";
import MeTab from "../../me/MeTab";
import ProgressTab from "../../progress/ProgressTab";
import SubjectsTab from "../../subjects/SubjectsTab";
import { OVERLAY_ROOT_ID } from "../../../utils/frameRoutes";
import { safeGet } from "../../../utils/safeStorage";
import {
  canStartShellSwipe,
  isEditableTarget,
  swipeOutcome,
  TabKey,
  tabIndex,
  TABS,
} from "../../../utils/tabs";
import { HINTS_SEEN_KEY, markFrameHintsSeen } from "../DesktopStage";
import PaneErrorBoundary from "./PaneErrorBoundary";
import type { TabPaneProps } from "./useShellRoute";

const PANES: Record<TabKey, React.ComponentType<TabPaneProps>> = {
  classwork: ClassworkTab,
  progress: ProgressTab,
  home: HomeTab,
  subjects: SubjectsTab,
  me: MeTab,
};

const SPRING = { tension: 300, friction: 32 };
const LAST = TABS.length - 1;

/** Travel below this (px) is a tap, so a little finger jitter still clicks. */
export const TAP_SLOP = 8;

// React 18 doesn't know `inert`; an empty string sets it, undefined removes it.
export const inertProps = (inert: boolean) =>
  (inert ? { inert: "" } : {}) as React.HTMLAttributes<HTMLDivElement>;

type Props = {
  subjectId: string;
  tab: TabKey;
  /** False while a detail page covers the pager: no swipes or arrow keys. */
  enabled: boolean;
  onTabChange: (tab: TabKey) => void;
};

/**
 * The five tab panes side by side. Each pane is translated on its own (not
 * one moving strip) so `position: fixed` pop-ups inside a pane stay
 * on-screen; the drag still moves them all as one strip.
 */
export default function TabPager({
  subjectId,
  tab,
  enabled,
  onTabChange,
}: Props) {
  const index = tabIndex(tab);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startTarget = useRef<EventTarget | null>(null);
  const suppressClick = useRef(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([index]));
  // `pos` is the strip offset in panes: 2 = Home centred, 2.5 = halfway to Subjects.
  const [{ pos }, api] = useSpring(() => ({ pos: index }));

  useEffect(() => {
    setVisited((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
    api.start({ pos: index, config: SPRING });
  }, [index, api]);

  const width = () => viewportRef.current?.clientWidth || 1;

  const bind = useDrag(
    ({
      first,
      last,
      tap,
      canceled,
      axis,
      offset: [ox],
      movement: [mx],
      velocity: [vx],
      direction: [dirX],
      cancel,
    }) => {
      // A tap, or the extra release use-gesture sends after cancel():
      // nothing to decide, just make sure the strip rests on its tab.
      if (tap || canceled) {
        if (viewportRef.current) viewportRef.current.style.userSelect = "";
        api.start({ pos: index, config: SPRING });
        return;
      }
      // Vertical drags belong to the pane's own scrolling; drags in portals
      // (toasts, sheets), no-swipe areas and fields aren't tab swipes.
      if (
        first &&
        (!enabled ||
          axis === "y" ||
          !canStartShellSwipe(viewportRef.current, startTarget.current))
      ) {
        return cancel();
      }
      const w = width();
      if (first) {
        // A mouse drag would otherwise select the text it passes over.
        window.getSelection()?.removeAllRanges();
        if (viewportRef.current) viewportRef.current.style.userSelect = "none";
      }
      if (!last) {
        api.start({ pos: -ox / w, immediate: true });
        return;
      }
      if (viewportRef.current) viewportRef.current.style.userSelect = "";
      // The click that ends a mouse drag must not open what it was over.
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      // A flick only counts in the direction the strip was dragged.
      const sameWay = Math.sign(dirX) === Math.sign(mx);
      const step = swipeOutcome({ dx: mx, vx: sameWay ? vx : 0, width: w });
      const next = Math.min(LAST, Math.max(0, index + step));
      api.start({ pos: next, config: SPRING });
      if (next !== index) {
        if (safeGet(HINTS_SEEN_KEY) === null) markFrameHintsSeen();
        onTabChange(TABS[next]);
      }
    },
    {
      axis: "lock",
      filterTaps: true,
      tapsThreshold: TAP_SLOP,
      from: () => [-pos.get() * width(), 0],
      bounds: () => ({ left: -LAST * width(), right: 0 }),
      rubberband: true,
    },
  );

  // ← and → switch tabs, except while typing or under a modal sheet.
  const keyState = useRef({ index, enabled, onTabChange });
  keyState.current = { index, enabled, onTabChange };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      )
        return;
      const { index: i, enabled: on, onTabChange: change } = keyState.current;
      if (!on || isEditableTarget(document.activeElement)) return;
      if (document.querySelector(`#${OVERLAY_ROOT_ID} [aria-modal='true']`))
        return;
      const next = i + (e.key === "ArrowRight" ? 1 : -1);
      if (next < 0 || next > LAST) return;
      e.preventDefault();
      change(TABS[next]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={viewportRef}
      {...bind()}
      data-shell-swipe=""
      onPointerDownCapture={(e) => {
        startTarget.current = e.target;
      }}
      onClickCapture={(e) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
      // Anything (e.g. scrollIntoView) that scrolls this clipped box sideways
      // would shift every pane; keep it at 0.
      onScroll={(e) => {
        e.currentTarget.scrollLeft = 0;
      }}
      className="relative h-full w-full overflow-hidden"
    >
      {TABS.map((key, i) => {
        const Pane = PANES[key];
        const active = i === index;
        const mounted = visited.has(i) || Math.abs(i - index) <= 1;
        return (
          <animated.div
            key={key}
            data-tab-pane={key}
            aria-hidden={!active}
            {...inertProps(!active)}
            className="absolute inset-0"
            style={{
              transform: pos.to((p) => `translate3d(${(i - p) * 100}%,0,0)`),
              visibility: pos.to((p) =>
                Math.abs(i - p) < 1 ? "visible" : "hidden",
              ),
            }}
          >
            {/* A crash stays in its pane: the tab bar keeps working. */}
            {mounted && (
              <PaneErrorBoundary>
                <Pane subjectId={subjectId} active={active} />
              </PaneErrorBoundary>
            )}
          </animated.div>
        );
      })}
    </div>
  );
}
