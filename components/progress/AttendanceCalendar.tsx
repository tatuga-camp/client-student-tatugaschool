import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { progressLanguage } from "../../data/languages";
import type { Language } from "../../interfaces";
import { dayKey, monthGrid } from "../../utils/attendanceCalendar";

type Props = {
  lang: Language;
  /** Day ("YYYY-MM-DD") to its status; see `statusByDay`. */
  days: Map<string, { title: string; color: string }>;
  /** The month to open on. */
  initial: Date;
};

/** Dark text on light colours (yellow), white on the rest. */
function textOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#fff";
  const n = parseInt(m[1], 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 170 ? "#383767" : "#fff";
}

const NAV =
  "flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#383767] active:bg-[#EEF1F6]";

/** Month calendar of the student's attendance, one coloured day per class day. */
export default function AttendanceCalendar({ lang, days, initial }: Props) {
  const locale = lang === "th" ? "th-TH" : "en-US";
  const [cursor, setCursor] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = monthGrid(year, month);
  const shift = (by: number) => setCursor(new Date(year, month + by, 1));

  // Sunday-first weekday initials in the viewer's language.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 9, 4 + i).toLocaleDateString(locale, { weekday: "narrow" }),
  );

  const legend = new Map<string, string>();
  for (const week of weeks)
    for (const day of week) {
      if (day === null) continue;
      const status = days.get(dayKey(new Date(year, month, day)));
      if (status) legend.set(status.title, status.color);
    }

  return (
    <section
      data-no-swipe
      className="rounded-2xl border-2 border-b-4 border-[#E3E8F0] bg-white p-3"
    >
      <div className="mb-1 flex items-center justify-between">
        <button
          type="button"
          aria-label={progressLanguage.prevMonth(lang)}
          onClick={() => shift(-1)}
          className={NAV}
        >
          <LuChevronLeft aria-hidden />
        </button>
        <h3 className="text-sm font-bold text-[#383767]" aria-live="polite">
          {cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          aria-label={progressLanguage.nextMonth(lang)}
          onClick={() => shift(1)}
          className={NAV}
        >
          <LuChevronRight aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
        {weekdays.map((w, i) => (
          <span key={i} className="py-1 text-[#9AA3B8]">
            {w}
          </span>
        ))}
        {weeks.flat().map((day, i) => {
          if (day === null) return <span key={i} />;
          const status = days.get(dayKey(new Date(year, month, day)));
          return (
            <span
              key={i}
              title={status?.title}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
              style={
                status
                  ? { backgroundColor: status.color, color: textOn(status.color) }
                  : { color: "#9AA3B8" }
              }
            >
              {day}
            </span>
          );
        })}
      </div>
      {legend.size > 0 && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-bold text-[#5B6280]">
          {[...legend].map(([title, color]) => (
            <li key={title} className="flex items-center gap-1">
              <i
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
