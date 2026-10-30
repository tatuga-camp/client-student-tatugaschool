import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import {
  dropsClick,
  movePress,
  Press,
  startPress,
} from "../../utils/clickSlop";
import { OVERLAY_ROOT_ID, isFrameExcluded } from "../../utils/frameRoutes";
import { DesktopStage, PhoneChrome } from "./DesktopStage";
import { FRAMED_QUERY, useIsFramed } from "./useIsFramed";

export { OVERLAY_ROOT_ID, isFrameExcluded };

// The page never scrolls; only the phone's content does. The frame itself is
// laid out by this CSS, not by JS: the server can't know the screen's width,
// so its markup must already be framed on a wide screen and full-screen on a
// phone. `--screen-h` is the screen's height; pages sized with `dvh` get
// `--app-dvh` instead of the window (styles/globals.css). No quotes,
// ampersands, < or > in it (so no child combinators): React escapes them in a
// <style>'s server-rendered text.
const PAGE_CSS = `
html, body { height: 100%; overflow: hidden; }
.app-frame { position: relative; overflow: hidden; height: 100dvh; }
.app-frame-center, .app-frame-bezel { height: 100%; }
.phone-screen {
  position: relative; height: 100%;
  --screen-h: 100dvh; --app-dvh: var(--screen-h);
  --safe-top: env(safe-area-inset-top); --safe-bottom: env(safe-area-inset-bottom);
}
@media ${FRAMED_QUERY} {
  .app-frame { position: fixed; inset: 0; height: auto; background: #F7F8FA; }
  .app-frame-center {
    position: absolute; inset: 0; z-index: 2; height: auto;
    display: flex; align-items: center; justify-content: center;
  }
  .app-frame-bezel {
    height: auto; padding: 12px; border-radius: 54px; background: #111;
    box-shadow: 0 30px 60px rgba(0,0,0,.35), inset 0 0 0 2px #2a2a2a;
  }
  .phone-screen {
    width: 390px; overflow: hidden; border-radius: 44px; background: #F7F8FA;
    /* dvh: the iPad Safari toolbars eat into 100vh. */
    --screen-h: min(844px, 100dvh - 48px); height: var(--screen-h);
    contain: layout paint;
    --safe-top: 47px; --safe-bottom: 34px;
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
 * Wraps every page. Phones get the app full-screen; tablets and desktops get
 * it inside an iPhone frame on a schoolyard stage. Both carry the overlay
 * root that sheets, SweetAlert and PrimeReact panels render into.
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
  const framed = useIsFramed();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragClick = useDragClickFilter();
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

  // One tree for both modes: PAGE_CSS lays it out, so resizing across the
  // breakpoint keeps page state and the overlay root. Only the stage and the
  // phone's chrome, which are decoration, wait for the client's `framed`.
  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="app-frame">
        {framed && <DesktopStage />}
        <div className="app-frame-center">
          <div className="app-frame-bezel">
            <div {...dragClick} className="phone-screen">
              {content}
              {framed && <PhoneChrome legacy={scroll} />}
              <div id={OVERLAY_ROOT_ID} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
