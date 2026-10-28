import { useEffect, useState } from "react";
import { LuMousePointer2 } from "react-icons/lu";
import { frameLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { safeGet } from "../../utils/safeStorage";
import { FakeStatusBar } from "./FakeStatusBar";
import { PhoneQrCard } from "./PhoneQrCard";
import { SchoolyardScene } from "./scene/SchoolyardScene";

export const HINTS_SEEN_KEY = "frame_hints_seen";

/** Desktop and tablet backdrop: the schoolyard, badge, QR card and hints. */
export function DesktopStage() {
  const language = useGetLanguage();
  const l = language.data ?? "en";
  const [hintsSeen, setHintsSeen] = useState(true);
  useEffect(() => {
    setHintsSeen(safeGet(HINTS_SEEN_KEY) !== null);
    // The shell sets the key after the first swipe.
    const onStorage = () => setHintsSeen(safeGet(HINTS_SEEN_KEY) !== null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <>
      <SchoolyardScene
        variant="desktop"
        className="absolute inset-0 h-full w-full"
      />
      <span className="absolute left-[22px] top-[18px] z-[3] inline-flex items-center gap-2 rounded-[14px] border-2 border-b-4 border-[#E3E8F0] bg-white py-[5px] pl-[6px] pr-3 text-[13px] font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary-color text-xs text-white">
          T
        </span>
        TATUGA SCHOOL
      </span>
      <PhoneQrCard />
      {!hintsSeen && (
        <div className="absolute bottom-[26px] right-[22px] z-[3] flex flex-col items-end gap-1.5 text-[11px] font-bold text-[#5B6280]">
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
      )}
    </>
  );
}

/** Dynamic Island, status bar and home indicator drawn over the screen. */
export function PhoneChrome() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[11px] z-[60] h-[37px] w-[126px] -translate-x-1/2 rounded-[20px] bg-[#111]"
      />
      <FakeStatusBar />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8px] left-1/2 z-[60] h-1 w-[134px] -translate-x-1/2 rounded bg-[#111]"
      />
    </>
  );
}
