import { useRouter } from "next/router";
import React from "react";
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
 * `scroll` is for legacy pages that do not lay themselves out.
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
  if (isFrameExcluded(router.pathname)) return <>{children}</>;

  const content = scroll ? (
    <div className="app-scroll h-full">{children}</div>
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
            ? "fixed inset-0 overflow-hidden font-Anuphan text-icon-color"
            : "relative overflow-hidden"
        }
        style={framed ? undefined : { height: "100dvh" }}
      >
        {framed && <DesktopStage />}
        <div
          className={
            framed
              ? "absolute inset-x-0 bottom-0 z-[2] flex justify-center pb-6"
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
              {framed && <PhoneChrome />}
              <div id={OVERLAY_ROOT_ID} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
