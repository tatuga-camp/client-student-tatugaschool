import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { OVERLAY_ROOT_ID, isFrameExcluded } from "../../utils/frameRoutes";
import { DesktopStage, PhoneChrome } from "./DesktopStage";
import { useIsFramed } from "./useIsFramed";

export { OVERLAY_ROOT_ID, isFrameExcluded };

const BEZEL_SHADOW = "0 30px 60px rgba(0,0,0,.35), inset 0 0 0 2px #2a2a2a";

// The page never scrolls; only the phone's content does.
const LOCK_PAGE_SCROLL = "html, body { height: 100%; overflow: hidden; }";

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
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
      }}
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
      <style>{LOCK_PAGE_SCROLL}</style>
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
              className={
                framed
                  ? "relative w-[390px] overflow-hidden rounded-[44px] bg-background-color"
                  : "relative h-full"
              }
              style={
                framed
                  ? {
                      height: "min(844px, 100vh - 48px)",
                      contain: "layout paint",
                      "--safe-top": "47px",
                      "--safe-bottom": "34px",
                    } as React.CSSProperties
                  : {
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
