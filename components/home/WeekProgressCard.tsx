import { LuZap } from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";

/** "This week" summary: blue chunky card with a yellow progress bar. */
export function WeekProgressCard({
  lang,
  done,
  total,
}: {
  lang: Language;
  done: number;
  total: number;
}) {
  const percent = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  return (
    <div className="rounded-[18px] bg-primary-color px-3 py-2 text-white shadow-[0_4px_0_#275d96]">
      <div className="flex items-center justify-between gap-2 text-[12px] font-bold">
        <span className="flex items-center gap-1.5">
          <LuZap aria-hidden size={14} />
          {total > 0
            ? homeLanguage.thisWeek(lang)
            : homeLanguage.nothingDue(lang)}
        </span>
        {total > 0 && <span>{homeLanguage.doneOf(lang, done, total)}</span>}
      </div>
      {total > 0 && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="mt-1.5 h-2.5 overflow-hidden rounded-md bg-white/30"
        >
          <div
            className="h-full rounded-md bg-warning-color"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
