import type { SpringRef } from "@react-spring/web";
import { type Handler, useDrag } from "@use-gesture/react";
import type React from "react";
import { sheetDragOutcome } from "../../utils/tabs";

// Where the browser has touch events, the drag listens to them (a body drag
// can then stop the native scroll), and a mouse, which sends only pointer
// events (a touch laptop, a hasTouch browser), gets a binding of its own.
const TOUCH_EVENTS = typeof window !== "undefined" && "ontouchstart" in window;

type Options = {
  /** The body (true) waits for its scroller to be at the top; the handle doesn't. */
  fromBody: boolean;
  /** False for a desktop dialog: no drag at all. */
  enabled: boolean;
  isPeek: boolean;
  expanded: boolean;
  /** A flick may close the sheet (dismissible and not guarding work). */
  gestureClosable: boolean;
  /** Set once a press moves past the tap threshold (Sheet drops that click). */
  draggedRef: React.MutableRefObject<boolean>;
  bodyRef: React.RefObject<HTMLDivElement>;
  panelRef: React.RefObject<HTMLDivElement>;
  heightRef: React.MutableRefObject<number>;
  api: SpringRef<{ y: number }>;
  onExpandedChange?: (v: boolean) => void;
  dismiss: () => void;
};

/**
 * A sheet's drag: down to dismiss (or snap back), up to expand a collapsed
 * peek. Returns the bind function for the handle or the body.
 */
export function useSheetDrag(o: Options) {
  const onDrag: Handler<"drag"> = ({
    first,
    last,
    tap,
    movement: [, my],
    velocity: [, vy],
    direction: [, dirY],
    event,
    cancel,
  }) => {
    if (!tap) o.draggedRef.current = true;
    const collapsedPeek = o.isPeek && !o.expanded;
    if (!o.gestureClosable && !collapsedPeek) return cancel();
    if (first && o.fromBody && (o.bodyRef.current?.scrollTop ?? 0) > 0)
      return cancel();
    const height = o.panelRef.current?.offsetHeight || o.heightRef.current;
    o.heightRef.current = height;
    if (o.isPeek && !o.expanded) {
      // Collapsed peek: dragging up expands.
      if (last && (my < -40 || (vy > 0.5 && dirY < 0)))
        o.onExpandedChange?.(true);
      return;
    }
    if (my > 0 && event.cancelable) event.preventDefault();
    if (!last) return void o.api.start({ y: Math.max(0, my), immediate: true });
    const outcome = sheetDragOutcome({
      dy: my,
      vy: dirY > 0 ? vy : 0,
      height,
    });
    if (outcome === "close") o.dismiss();
    else o.api.start({ y: 0, immediate: false });
  };
  const options = {
    axis: "y",
    filterTaps: true,
    eventOptions: { passive: false },
  } as const;
  const touch = useDrag(onDrag, {
    ...options,
    enabled: o.enabled,
    pointer: { touch: true },
  });
  const mouse = useDrag(onDrag, {
    ...options,
    enabled: o.enabled && TOUCH_EVENTS,
    pointer: { keys: false },
  });
  return () => {
    if (!o.enabled) return {};
    if (!TOUCH_EVENTS) return touch();
    const m = mouse();
    return {
      ...touch(),
      ...m,
      // A finger also sends pointer events: the touch binding has those.
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse") m.onPointerDown?.(e);
      },
    };
  };
}
