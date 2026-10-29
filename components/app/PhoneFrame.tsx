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

const BEZEL_SHADOW = "0 30px 60px rgba(0,0,0,.35), inset 0 0 0 2px #2a2a2a";

const FRAME_READY = "data-frame-ready";

// The page never scrolls; only the phone's content does. And where the frame
// goes, nothing shows until the client has put it up: the server can't know
// the width, and its markup is the unframed layout (a short blank, not a jump).
const PAGE_CSS = `html, body { height: 100%; overflow: hidden; }
@media ${FRAMED_QUERY} { html:not([${FRAME_READY}]) #__next { visibility: hidden; } }`;

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
  // The first render takes the server's guess (unframed); once `framed` is
  // the screen's own answer, the page may show. The framed re-render happens
  // in the same task as this effect, so it is painted framed or not at all.
  useEffect(() => {
    if (framed === window.matchMedia(FRAMED_QUERY).matches)
      document.documentElement.setAttribute(FRAME_READY, "");
  }, [framed]);
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
  if (isFrameExcluded(router.pathname)) return <>{children}</>;

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

  // One tree for both modes (only classes and the stage siblings change), so
  // resizing across the breakpoint keeps page state and the overlay root.
  return (
    <>
      <style>{PAGE_CSS}</style>
      <div
        className={
          framed
            ? "fixed inset-0 overflow-hidden"
            : "relative overflow-hidden"
        }
        style={framed ? undefined : { height: "100dvh" }}
      >
        {framed && <DesktopStage />}
        <div
          className={
            framed
              ? "absolute inset-0 z-[2] flex items-center justify-center"
              : "h-full"
          }
        >
          <div
            className={framed ? "rounded-[54px] bg-[#111] p-3" : "h-full"}
            style={framed ? { boxShadow: BEZEL_SHADOW } : undefined}
          >
            <div
              {...dragClick}
              className={
                framed
                  ? "phone-screen relative w-[390px] overflow-hidden rounded-[44px] bg-background-color"
                  : "phone-screen relative h-full"
              }
              // --screen-h is the screen's height; pages sized with `dvh`
              // get --app-dvh instead of the window (styles/globals.css).
              style={
                framed
                  ? {
                      // dvh: iPad Safari's toolbars eat into 100vh.
                      "--screen-h": "min(844px, 100dvh - 48px)",
                      "--app-dvh": "var(--screen-h)",
                      height: "var(--screen-h)",
                      contain: "layout paint",
                      "--safe-top": "47px",
                      "--safe-bottom": "34px",
                    } as React.CSSProperties
                  : {
                      "--screen-h": "100dvh",
                      "--app-dvh": "var(--screen-h)",
                      "--safe-top": "env(safe-area-inset-top)",
                      "--safe-bottom": "env(safe-area-inset-bottom)",
                    } as React.CSSProperties
              }
            >
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
