import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import {
  dropsClick,
  movePress,
  Press,
  startPress,
} from "../../utils/clickSlop";
import {
  OVERLAY_ROOT_ID,
  isFrameExcluded,
  frameKind,
} from "../../utils/frameRoutes";
import { DESK_QUERY } from "../../utils/layoutQueries";
import { SchoolyardBackdrop } from "./SchoolyardBackdrop";
import { useIsDesktop } from "./useLayoutMode";

export { OVERLAY_ROOT_ID, isFrameExcluded };

// The page never scrolls; only the app's panes do. The layout comes from this
// CSS, not from JS: the server can't know the screen's width, so its markup
// must already be right on a phone and on a computer. Phones get the app
// full-screen. On a computer (DESK_QUERY) the subject shell fills the window
// and every other page is a card on the full-window schoolyard (frameKind):
// a phone-width card, a 760px one for pick-your-name, and one that shrinks to
// its form for sign-in. `--screen-h` is the screen's height; pages sized with
// `dvh` get `--app-dvh` instead of the window (styles/globals.css). On a
// computer the screen element must get no `contain` or transform: full-window
// layers (an expanded video quiz) are `position: fixed` inside it. No quotes,
// ampersands, < or > in it (so no child combinators): React escapes them in a
// <style>'s server-rendered text.
const PAGE_CSS = `
html, body { height: 100%; overflow: hidden; }
.app-frame { position: relative; overflow: hidden; height: 100dvh; }
.phone-screen {
  position: relative; height: 100%;
  --screen-h: 100dvh; --app-dvh: var(--screen-h);
  --safe-top: env(safe-area-inset-top); --safe-bottom: env(safe-area-inset-bottom);
}
@media ${DESK_QUERY} {
  .app-frame { position: fixed; inset: 0; height: auto; background: #F7F8FA; }
  .phone-screen { --safe-top: 0px; --safe-bottom: 0px; }
  .app-frame-card {
    display: flex; align-items: center; justify-content: center;
    background: #9CCBFA;
  }
  .app-frame-card .phone-screen {
    width: min(480px, 100% - 32px); height: calc(100% - 48px);
    --screen-h: calc(100dvh - 48px);
    border-radius: 24px; overflow: hidden; background: #F7F8FA;
    box-shadow: 0 6px 0 #E3E8F0, 0 24px 60px rgba(20,24,48,.22);
  }
  .app-frame-wide .phone-screen { width: min(760px, 100% - 32px); }
  .app-frame-fit .phone-screen {
    height: auto; max-height: calc(100% - 48px); overflow: visible;
    background: transparent; box-shadow: none; border-radius: 0;
  }
}`;

/**
 * The click that ends a mouse drag is dropped, wherever on the phone screen
 * the drag began: the shell's panes, detail pages, sheets and pop-ups all
 * render inside it (utils/clickSlop.ts).
 */
function useDragClickFilter() {
  const press = useRef<Press | null>(null);
  return {
    onPointerDownCapture: (e: React.PointerEvent) => {
      if (e.isPrimary)
        press.current = startPress(e.pointerType, e.clientX, e.clientY);
    },
    onPointerMoveCapture: (e: React.PointerEvent) => {
      if (press.current && e.buttons !== 0)
        press.current = movePress(press.current, e.clientX, e.clientY);
    },
    onClickCapture: (e: React.MouseEvent) => {
      const drop = dropsClick(press.current, e.detail);
      press.current = null;
      if (!drop) return;
      e.preventDefault();
      e.stopPropagation();
    },
  };
}

/**
 * Wraps every page. Phones get the app full-screen; on a computer the subject
 * shell fills the window and other pages are cards on the schoolyard
 * (PAGE_CSS, frameKind).
 * Both carry the overlay root that sheets, SweetAlert and PrimeReact panels
 * render into.
 * `scroll` is true for legacy pages (no getLayout): they scroll inside a
 * wrapper padded with the safe areas. Pages with getLayout pass false and
 * handle `var(--safe-top)` / `var(--safe-bottom)` themselves.
 */
export function PhoneFrame({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragClick = useDragClickFilter();
  // The schoolyard behind the cards is decoration: mounted after hydration,
  // on a computer only (the cards themselves are laid out by PAGE_CSS).
  const desktop = useIsDesktop();
  // The scroller persists across pages, so Next's scroll reset no longer
  // reaches it: reset it when the pathname changes.
  useEffect(() => {
    let last = router.asPath.split(/[?#]/)[0];
    const onDone = (url: string) => {
      const next = url.split(/[?#]/)[0];
      if (next !== last && scrollRef.current) scrollRef.current.scrollTop = 0;
      last = next;
    };
    router.events.on("routeChangeComplete", onDone);
    return () => router.events.off("routeChangeComplete", onDone);
  }, [router.events, router.asPath]);
  if (isFrameExcluded(router.pathname)) {
    // Full width, but kept clear of a notch (the viewport covers it) and
    // still holding the overlay root, which SweetAlert needs to open.
    return (
      <div
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
        <div id={OVERLAY_ROOT_ID} />
      </div>
    );
  }

  const content = scroll ? (
    <div
      ref={scrollRef}
      className="app-scroll h-full"
      style={
        {
          paddingTop: "var(--safe-top)",
          paddingBottom: "var(--safe-bottom)",
          // What `dvh` means to the page: the screen, less the padding.
          "--app-dvh":
            "calc(var(--screen-h) - var(--safe-top) - var(--safe-bottom))",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  ) : (
    children
  );

  // One tree for both layouts: PAGE_CSS lays it out, so resizing across the
  // breakpoint keeps page state and the overlay root.
  const kind = frameKind(router.pathname);
  const frameClass =
    kind === "shell"
      ? "app-frame"
      : kind === "card"
        ? "app-frame app-frame-card"
        : `app-frame app-frame-card app-frame-${kind}`;
  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className={frameClass}>
        {desktop && kind !== "shell" && <SchoolyardBackdrop />}
        <div {...dragClick} className="phone-screen">
          {content}
          <div id={OVERLAY_ROOT_ID} />
        </div>
      </div>
    </>
  );
}
