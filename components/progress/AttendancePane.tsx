import parse from "html-react-parser";
import { useMemo, useState } from "react";
import { LuStickyNote } from "react-icons/lu";
import { subjectHomeLanguage } from "../../data/languages";
import type {
  Attendance,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
} from "../../interfaces";
import { useGetAttendanceTables, useGetLanguage } from "../../react-query";
import { summarizeAttendance, tintColor } from "../../utils";
import { statusByDay, textOn } from "../../utils/attendanceCalendar";
import { InlineError } from "../app/InlineError";
import { Sheet } from "../app/Sheet";
import AttendanceCalendar from "./AttendanceCalendar";

type Table = AttendanceTable & {
  statusLists: AttendanceStatusList[];
  rows: AttendanceRow[];
  attendances: Attendance[];
};

const NO_STATUS_COLOR = "#94a3b8";
const CARD = "rounded-[14px] border-2 border-b-4 border-[#E3E8F0] bg-white";

type Props = { subjectId: string; studentId: string };

/** Attendance rate, status tiles, a month calendar and the class-by-class list. */
export default function AttendancePane({ subjectId, studentId }: Props) {
  const query = useGetAttendanceTables({ subjectId, studentId });
  const lang = useGetLanguage().data ?? "en";
  const locale = lang === "th" ? "th-TH" : "en-US";
  const [tableId, setTableId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const tables = (query.data ?? []) as Table[];
  const table = tables.find((t) => t.id === tableId) ?? tables[0] ?? null;

  const summary = useMemo(
    () =>
      table ? summarizeAttendance(table.statusLists, table.attendances) : null,
    [table],
  );
  // Newest class first; copy so the React Query cache is never mutated.
  const rows = useMemo(
    () =>
      table
        ? [...table.rows].sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          )
        : [],
    [table],
  );
  const days = useMemo(
    () =>
      table
        ? statusByDay(table.attendances, table.statusLists)
        : new Map<string, { title: string; color: string }>(),
    [table],
  );

  const colorOf = (status: string) =>
    table?.statusLists.find((s) => s.title === status)?.color ||
    NO_STATUS_COLOR;

  const best = summary?.best ?? null;
  const cheer =
    best === null
      ? null
      : best.percent >= 90
        ? subjectHomeLanguage.cheerGreat(lang)
        : best.percent >= 75
          ? subjectHomeLanguage.cheerGood(lang)
          : subjectHomeLanguage.cheerLow(lang);

  if (query.isError && !query.data) {
    return <InlineError onRetry={() => query.refetch()} />;
  }

  if (query.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-color border-t-transparent motion-reduce:animate-none" />
      </div>
    );
  }

  if (!table || rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-[#7A80A0]">
        {subjectHomeLanguage.noAttendance(lang)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 font-Anuphan">
      {tables.length > 1 && (
        <ul
          data-no-swipe
          className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1"
        >
          {tables.map((t) => {
            const on = t.id === table.id;
            return (
              <li key={t.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTableId(t.id)}
                  className={`max-w-[14rem] truncate rounded-[13px] border-2 border-b-4 px-3 py-1.5 text-sm font-bold ${
                    on
                      ? "border-[#275d96] bg-primary-color text-white"
                      : "border-[#E3E8F0] bg-white text-[#383767]"
                  }`}
                >
                  {t.title}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <section
        className="flex items-center gap-4 rounded-[20px] bg-success-color p-4 text-white"
        style={{ boxShadow: "0 5px 0 #1E8E4E" }}
      >
        {best ? (
          <>
            <div
              role="img"
              aria-label={`${best.percent}%`}
              className="grid h-[70px] w-[70px] shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#fff ${best.percent}%, rgba(255,255,255,.3) 0)`,
              }}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-success-color text-base font-bold">
                {best.percent}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{cheer}</p>
              <p className="text-xs font-bold text-white/85">
                {subjectHomeLanguage.bestOf(
                  lang,
                  best.title,
                  best.count,
                  summary?.recorded ?? 0,
                )}
              </p>
            </div>
          </>
        ) : (
          <p className="text-lg font-bold">
            {subjectHomeLanguage.classesChecked(lang, summary?.recorded ?? 0)}
          </p>
        )}
      </section>

      {summary && summary.counts.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {summary.counts.map((c) => (
            <li
              key={c.title}
              className="rounded-[14px] border-2 border-b-4 px-2.5 py-1.5"
              style={{
                backgroundColor: tintColor(c.color, 0.1),
                borderColor: tintColor(c.color, 0.35),
              }}
            >
              <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#7A80A0]">
                {c.title}
              </p>
              <p className="text-xl font-bold" style={{ color: c.color }}>
                {c.count}
              </p>
            </li>
          ))}
        </ul>
      )}

      <AttendanceCalendar
        key={table.id}
        lang={lang}
        days={days}
        initial={new Date(rows[0].startDate)}
      />

      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => {
          const attendance = table.attendances.find(
            (a) => a.attendanceRowId === row.id,
          );
          const start = new Date(row.startDate);
          const color = attendance?.status
            ? colorOf(attendance.status)
            : NO_STATUS_COLOR;
          return (
            <li key={row.id} className={`${CARD} flex items-center gap-3 p-2`}>
              <div
                className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none"
                style={{ backgroundColor: tintColor(color, 0.14) }}
              >
                <span className="text-base font-bold text-[#383767]">
                  {start.getDate()}
                </span>
                <span className="text-[10px] font-bold uppercase text-[#7A80A0]">
                  {start.toLocaleDateString(locale, { month: "short" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#383767]">
                  {start.toLocaleDateString(locale, { weekday: "long" })}
                </p>
                <p className="text-xs text-[#7A80A0]">
                  {start.toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {attendance?.note && (
                <button
                  type="button"
                  aria-label={subjectHomeLanguage.note(lang)}
                  onClick={() => setNote(attendance.note)}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#E3E8F0] text-lg text-[#7A80A0] after:absolute after:-inset-1 after:content-['']"
                >
                  <LuStickyNote aria-hidden />
                </button>
              )}
              {attendance?.status ? (
                <span
                  className="max-w-[8rem] shrink-0 truncate rounded-full px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: color, color: textOn(color) }}
                >
                  {attendance.status}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-[#EEF1F6] px-3 py-1 text-xs font-bold text-[#9AA3B8]">
                  {subjectHomeLanguage.notChecked(lang)}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet
        open={note !== null}
        onClose={() => setNote(null)}
        ariaLabel={subjectHomeLanguage.note(lang)}
      >
        <div className="font-Anuphan text-[#383767]">
          <h2 className="flex items-center gap-1.5 pb-2 text-base font-bold">
            <LuStickyNote aria-hidden /> {subjectHomeLanguage.note(lang)}
          </h2>
          <div className="pb-2 text-sm">{note ? parse(note) : null}</div>
        </div>
      </Sheet>
    </div>
  );
}
