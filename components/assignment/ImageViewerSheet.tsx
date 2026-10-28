import { animated, to, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import React, { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { overlayTarget } from "../../utils/frameRoutes";
import { anchoredZoom, wheelScaleFactor } from "../../utils/zoomMath";
import { OverlayRootContext } from "../app/OverlayScope";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_MS = 300;

type Props = {
  url: string;
  name: string;
  lang: Language;
  onClose: () => void;
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/**
 * Full-screen image viewer: pinch, wheel and double-tap zoom, drag to pan
 * when zoomed. Renders in the page's overlay scope so it moves with the
 * page. `data-no-swipe` keeps the page's edge-back from reading its drags.
 */
export default function ImageViewerSheet({ url, name, lang, onClose }: Props) {
  const scoped = useContext(OverlayRootContext);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTap = useRef(0);
  const [{ x, y, scale }, api] = useSpring(() => ({ x: 0, y: 0, scale: 1 }));

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener && document.contains(opener))
        opener.focus({ preventScroll: true });
    };
  }, []);

  // Keep the picture over the viewport: no panning past its edges.
  const constrain = (next: { x: number; y: number; scale: number }) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || next.scale <= MIN_SCALE)
      return { x: 0, y: 0, scale: MIN_SCALE };
    return {
      scale: next.scale,
      x: clamp(next.x, rect.width * (1 - next.scale), 0),
      y: clamp(next.y, rect.height * (1 - next.scale), 0),
    };
  };

  const zoomTo = (
    nextScale: number,
    clientX: number,
    clientY: number,
    immediate = false,
  ) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = constrain(
      anchoredZoom(
        { x: x.get(), y: y.get(), scale: scale.get() },
        clamp(nextScale, MIN_SCALE, MAX_SCALE),
        clientX - rect.left,
        clientY - rect.top,
      ),
    );
    api.start({ ...next, immediate });
  };

  useGesture(
    {
      onDrag: ({ tap, event, offset: [ox, oy], pinching }) => {
        if (pinching) return;
        if (tap) {
          const now = Date.now();
          if (now - lastTap.current < DOUBLE_TAP_MS) {
            lastTap.current = 0;
            const e = event as PointerEvent;
            zoomTo(scale.get() > 1.05 ? 1 : 2.5, e.clientX, e.clientY);
          } else lastTap.current = now;
          return;
        }
        if (scale.get() <= 1) return;
        api.start({
          ...constrain({ x: ox, y: oy, scale: scale.get() }),
          immediate: true,
        });
      },
      onPinch: ({ origin: [ox, oy], offset: [s], last }) => {
        zoomTo(s, ox, oy, !last);
      },
      onWheel: ({ event, delta: [, dy] }) => {
        event.preventDefault();
        const e = event as WheelEvent;
        zoomTo(scale.get() * wheelScaleFactor(dy), e.clientX, e.clientY, true);
      },
    },
    {
      target: viewportRef,
      eventOptions: { passive: false },
      drag: { from: () => [x.get(), y.get()], filterTaps: true },
      pinch: {
        from: () => [scale.get(), 0],
        scaleBounds: { min: MIN_SCALE, max: MAX_SCALE },
      },
    },
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      data-no-swipe
      className="absolute inset-0 z-[60] flex flex-col bg-black font-Anuphan"
    >
      <header
        className="flex shrink-0 items-center gap-3 px-4 pb-2 text-white"
        style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
      >
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold">{name}</h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={assignmentPageLanguage.closeViewer(lang)}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl active:bg-white/25"
        >
          <LuX aria-hidden />
        </button>
      </header>
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <animated.div
          className="absolute inset-0"
          style={{
            transformOrigin: "0 0",
            transform: to(
              [x, y, scale],
              (vx, vy, vs) => `translate3d(${vx}px,${vy}px,0) scale(${vs})`,
            ),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={name}
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
        </animated.div>
      </div>
      <p
        className="shrink-0 pt-2 text-center text-[11px] text-white/60"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 8px)" }}
      >
        {assignmentPageLanguage.zoomHint(lang)}
      </p>
    </div>,
    scoped ?? overlayTarget(),
  );
}
