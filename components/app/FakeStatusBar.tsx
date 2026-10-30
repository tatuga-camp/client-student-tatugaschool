import { useEffect, useState } from "react";
import { LuBatteryFull, LuSignal } from "react-icons/lu";
import { useTimeOfDay } from "../../hook/useTimeOfDay";

const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** iPhone-style status bar with the live time, for the desktop frame. */
export function FakeStatusBar({ dark = false }: { dark?: boolean }) {
  const tod = useTimeOfDay();
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(hhmm(new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  const color =
    dark || tod?.palette.statusText === "dark" ? "#383767" : "#fff";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 right-0 top-0 z-[60] flex items-center justify-between px-6 text-xs font-bold"
      style={{ color, height: 47, paddingTop: 13 }}
    >
      <span>{time}</span>
      <span className="flex items-center gap-1">
        <LuSignal size={14} />
        <LuBatteryFull size={16} />
      </span>
    </div>
  );
}
