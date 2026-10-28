import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { profileLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { OVERLAY_ROOT_ID } from "../../utils/frameRoutes";
import { sheetDragOutcome } from "../../utils/tabs";
import { OverlayRootContext } from "./OverlayScope";

/**
 * Where it renders: the nearest OverlayScope's container (each detail panel
 * provides one, so a sheet opened from a detail page slides and leaves with
 * that page), else the global #app-overlay-root (tab panes, other pages).
 */
type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "auto" | "full";
  peek?: React.ReactNode;
  expanded?: boolean;
  onExpandedChange?: (v: boolean) => void;
  dismissible?: boolean;
  ariaLabel: string;
};

// Open modal sheets, topmost last: Esc closes only the topmost one.
const openStack: number[] = [];
let nextId = 0;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Bottom sheet; see SheetProps for where it renders. */
export function Sheet({
  open,
  onClose,
  children,
  size = "auto",
  peek,
  expanded = false,
  onExpandedChange,
  dismissible = true,
  ariaLabel,
}: SheetProps) {
  const scopedRoot = useContext(OverlayRootContext);
  const [globalRoot, setGlobalRoot] = useState<HTMLElement | null>(null);
  const root = scopedRoot === undefined ? globalRoot : scopedRoot;
  const [rendered, setRendered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const heightRef = useRef(600);
  const visibleRef = useRef(false);
  const enteredRef = useRef(false);
  const idRef = useRef(0);
  if (idRef.current === 0) idRef.current = ++nextId;
  const language = useGetLanguage();
  const [{ y }, api] = useSpring(() => ({ y: 600 }));

  const isPeek = peek !== undefined;
  const visible = isPeek ? true : open;
  // Peek panel collapsed = no backdrop; expanded or normal sheet = backdrop.
  const modal = isPeek ? expanded : true;
  visibleRef.current = visible;

  useEffect(() => {
    if (scopedRoot === undefined) {
      setGlobalRoot(document.getElementById(OVERLAY_ROOT_ID));
    }
  }, [open, scopedRoot]);

  // Mount on show; slide in once measured.
  useLayoutEffect(() => {
    if (visible && root) setRendered(true);
  }, [visible, root]);

  // Keep the measured height fresh (expand/collapse, async content).
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!rendered || !el) return;
    const measure = () => {
      heightRef.current = el.offsetHeight || heightRef.current;
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rendered]);

  useLayoutEffect(() => {
    if (!rendered || !panelRef.current) return;
    heightRef.current = panelRef.current.offsetHeight || heightRef.current;
    if (visible) {
      if (!isPeek && !enteredRef.current) {
        api.start({ from: { y: heightRef.current }, y: 0 });
      } else api.start({ y: 0 });
      enteredRef.current = true;
    } else {
      api.start({
        y: heightRef.current,
        onRest: (result) => {
          if (result.finished && !visibleRef.current) {
            enteredRef.current = false;
            setRendered(false);
          }
        },
      });
    }
  }, [rendered, visible, isPeek, api]);

  // Focus in on open, back to the opener on close.
  useEffect(() => {
    if (!visible || !rendered || !modal) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [visible, rendered, modal]);

  const dismiss = () => {
    if (isPeek) onExpandedChange?.(false);
    else onClose();
  };

  useEffect(() => {
    if (!visible || !modal || !dismissible) return;
    const id = idRef.current;
    openStack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openStack[openStack.length - 1] === id) dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const i = openStack.lastIndexOf(id);
      if (i >= 0) openStack.splice(i, 1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, modal, dismissible, isPeek, onClose, onExpandedChange]);

  const usePanelDrag = (fromBody: boolean) =>
    useDrag(
      ({ first, last, movement: [, my], velocity: [, vy], direction: [, dirY], event, cancel }) => {
        const collapsedPeek = isPeek && !expanded;
        if (!dismissible && !collapsedPeek) return cancel();
        if (first && fromBody && (bodyRef.current?.scrollTop ?? 0) > 0) return cancel();
        const height = panelRef.current?.offsetHeight || heightRef.current;
        heightRef.current = height;
        if (isPeek && !expanded) {
          // Collapsed peek: dragging up expands.
          if (last && (my < -40 || (vy > 0.5 && dirY < 0))) onExpandedChange?.(true);
          return;
        }
        if (my > 0 && event.cancelable) event.preventDefault();
        if (!last) return void api.start({ y: Math.max(0, my), immediate: true });
        const outcome = sheetDragOutcome({ dy: my, vy: dirY > 0 ? vy : 0, height });
        if (outcome === "close") dismiss();
        else api.start({ y: 0, immediate: false });
      },
      {
        axis: "y",
        filterTaps: true,
        pointer: { touch: true },
        eventOptions: { passive: false },
      },
    );
  const bindHandle = usePanelDrag(false);
  const bindBody = usePanelDrag(true);

  if (!root || !rendered) return null;

  const full = size === "full";
  return createPortal(
    <div
      data-no-swipe
      className="absolute inset-0 z-50"
      style={{ pointerEvents: modal ? "auto" : "none" }}
    >
      {modal && (
        <animated.div
          data-testid="sheet-backdrop"
          onClick={dismissible ? dismiss : undefined}
          className="absolute inset-0"
          style={{
            background: "rgba(20,24,48,.45)",
            opacity: y.to((v) => 1 - clamp01(v / heightRef.current)),
          }}
        />
      )}
      <animated.div
        ref={panelRef}
        role="dialog"
        aria-modal={modal}
        aria-label={ariaLabel}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex flex-col bg-white outline-none"
        style={{
          y,
          pointerEvents: "auto",
          height: full && modal ? "100%" : undefined,
          // Full screen: keep the handle and ✕ clear of the status bar / notch.
          paddingTop: full && modal ? "var(--safe-top)" : undefined,
          maxHeight: full ? "100%" : "90%",
          borderRadius: full && modal ? 0 : "20px 20px 0 0",
          boxShadow: "0 -4px 0 #E3E8F0",
        }}
      >
        <div
          {...bindHandle()}
          data-testid="sheet-handle"
          className="relative flex shrink-0 cursor-grab justify-center pb-2 pt-3"
          style={{ touchAction: "none" }}
        >
          <div className="h-1.5 w-10 rounded-full bg-[#E3E8F0]" />
          {dismissible && modal && (
            <button
              type="button"
              aria-label={profileLanguage.close(language.data ?? "en")}
              onClick={dismiss}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-3 top-2 flex h-8 w-8 items-center justify-center rounded-full text-[#383767]"
            >
              <LuX size={20} />
            </button>
          )}
        </div>
        <div
          ref={bodyRef}
          {...bindBody()}
          className="app-scroll min-h-0 flex-1 px-4 pb-6"
        >
          {isPeek && !expanded ? peek : children}
        </div>
      </animated.div>
    </div>,
    root,
  );
}
