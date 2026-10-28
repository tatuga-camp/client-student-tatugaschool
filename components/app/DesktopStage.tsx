import { useEffect, useState } from "react";
import { LuMousePointer2 } from "react-icons/lu";
import { frameLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { safeGet, safeSet } from "../../utils/safeStorage";
import { FakeStatusBar } from "./FakeStatusBar";
import { PhoneQrCard } from "./PhoneQrCard";
import { SchoolyardScene } from "./scene/SchoolyardScene";

export const HINTS_SEEN_KEY = "frame_hints_seen";
const HINTS_SEEN_EVENT = "frame-hints-seen";

/** Call after the first swipe: stores the key and fades the hints out now. */
export function markFrameHintsSeen(): void {
  safeSet(HINTS_SEEN_KEY, "1");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HINTS_SEEN_EVENT));
  }
}

/** Desktop and tablet backdrop: the schoolyard, badge, QR card and hints. */
export function DesktopStage() {
  const language = useGetLanguage();
  const l = language.data ?? "en";
  // Only mounted client-side (framed), so reading storage here cannot mismatch.
  const [hintsSeen, setHintsSeen] = useState(
    () => safeGet(HINTS_SEEN_KEY) !== null,
  );
  useEffect(() => {
    const sync = () => setHintsSeen(safeGet(HINTS_SEEN_KEY) !== null);
    window.addEventListener(HINTS_SEEN_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(HINTS_SEEN_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <>
      <SchoolyardScene
        variant="desktop"
        className="absolute inset-0 h-full w-full"
      />
      <span className="absolute left-[22px] top-[18px] z-[3] hidden items-center gap-2 rounded-[14px] border-2 border-b-4 border-[#E3E8F0] bg-white py-[5px] pl-[6px] pr-3 font-Anuphan text-[13px] font-bold text-icon-color min-[920px]:inline-flex">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary-color text-xs text-white">
          T
        </span>
        TATUGA SCHOOL
      </span>
      <PhoneQrCard />
      <div
          aria-hidden={hintsSeen}
          className={`pointer-events-none absolute bottom-[26px] right-[22px] z-[3] hidden flex-col items-end gap-1.5 font-Anuphan text-[11px] font-bold text-[#5B6280] transition-opacity duration-700 min-[920px]:flex ${hintsSeen ? "opacity-0" : "opacity-100"}`}
        >
          <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-[5px]">
            <LuMousePointer2 />
            {frameLanguage.hintDrag(l)}
          </span>
          <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-[5px]">
            <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border-[1.5px] border-b-[3px] border-[#C9D0DC] bg-white px-[3px] text-[10px]">
              ←
            </kbd>
            <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border-[1.5px] border-b-[3px] border-[#C9D0DC] bg-white px-[3px] text-[10px]">
              →
            </kbd>
            {frameLanguage.hintKeys(l)}
          </span>
        </div>
    </>
  );
}

/** Dynamic Island, status bar and home indicator drawn over the screen. */
export function PhoneChrome({ legacy = false }: { legacy?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[11px] z-[60] h-[37px] w-[126px] -translate-x-1/2 rounded-[20px] bg-[#111]"
      />
      <FakeStatusBar dark={legacy} />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8px] left-1/2 z-[60] h-1 w-[134px] -translate-x-1/2 rounded bg-[#111]"
      />
    </>
  );
}
