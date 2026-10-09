import parse from "html-react-parser";
import React, { useEffect, useMemo } from "react";
import { IoMdClose } from "react-icons/io";
import { MdOutlineSpeakerNotes } from "react-icons/md";
import { subjectHomeLanguage } from "../../data/languages";
import {
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  Attendance as AttendanceType,
} from "../../interfaces";
import { useGetAttendanceTables, useGetLanguage } from "../../react-query";
import { summarizeAttendance, tintColor } from "../../utils";
import LoadingBar from "../common/LoadingBar";
import PopupLayout from "../layouts/PopupLayout";
import SubjectEmptyState from "./SubjectEmptyState";

type Props = {
  subjectId: string;
  studentId: string;
};

type Table = AttendanceTable & {
  statusLists: AttendanceStatusList[];
  rows: AttendanceRow[];
  attendances: AttendanceType[];
};

// Full class names only: Tailwind cannot see classes built from strings.
const TABLE_CHIPS = [
  "bg-emerald-500 border-emerald-500",
  "bg-sky-500 border-sky-500",
  "bg-violet-500 border-violet-500",
  "bg-amber-400 border-amber-400",
  "bg-pink-500 border-pink-500",
];

const NO_STATUS_COLOR = "#94a3b8";

function Attendance({ subjectId, studentId }: Props) {
  const attendanceTables = useGetAttendanceTables({ subjectId, studentId });
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const locale = lang === "th" ? "th-TH" : "en-US";
  const [selectTableId, setSelectTableId] = React.useState<string | null>(null);
  const [selectNote, setSelectNote] = React.useState<string | null>(null);

  const tables = (attendanceTables.data ?? []) as Table[];
  const selectTable =
    tables.find((t) => t.id === selectTableId) ?? tables[0] ?? null;

  useEffect(() => {
    if (!selectTableId && tables.length > 0) setSelectTableId(tables[0].id);
  }, [selectTableId, tables]);

  const summary = useMemo(
    () =>
      selectTable
        ? summarizeAttendance(selectTable.statusLists, selectTable.attendances)
        : null,
    [selectTable],
  );

  // Newest class first; copy so the React Query cache is never mutated.
  const rows = useMemo(
    () =>
      selectTable
        ? [...selectTable.rows].sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          )
        : [],
    [selectTable],
  );

  const colorOf = (status: string) =>
    selectTable?.statusLists.find((s) => s.title === status)?.color ||
    NO_STATUS_COLOR;

  const cheer =
    summary?.best == null
      ? null
      : summary.best.percent >= 90
        ? subjectHomeLanguage.cheerGreat(lang)
        : summary.best.percent >= 75
          ? subjectHomeLanguage.cheerGood(lang)
          : subjectHomeLanguage.cheerLow(lang);

  return (
    <div className="flex w-full flex-col gap-4 pb-8 pt-2 font-Anuphan">
      {selectNote && (
        <PopupLayout onClose={() => setSelectNote(null)}>
          <div className="flex w-[90vw] max-w-md flex-col rounded-3xl bg-white p-5 shadow-xl">
            <div className="flex w-full items-center justify-between border-b pb-2">
              <span className="flex items-center gap-1.5 font-bold text-icon-color">
                <MdOutlineSpeakerNotes /> {subjectHomeLanguage.note(lang)}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  document.body.style.overflow = "auto";
                  setSelectNote(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-gray-100"
              >
                <IoMdClose />
              </button>
            </div>
            <div className="grow overflow-auto pt-3">{parse(selectNote)}</div>
          </div>
        </PopupLayout>
      )}

      <header>
        <h2 className="text-2xl font-bold text-icon-color">
          {subjectHomeLanguage.attendanceTitle(lang)}
        </h2>
        <p className="text-sm text-gray-500">
          {subjectHomeLanguage.attendanceSubtitle(lang)}
        </p>
      </header>

      {attendanceTables.isLoading && <LoadingBar />}

      {tables.length > 1 && (
        <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {tables.map((table, i) => {
            const active = table.id === selectTable?.id;
            return (
              <li key={table.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectTableId(table.id)}
                  className={`max-w-[16rem] rounded-2xl border-2 px-4 py-2 text-left transition ${
                    active
                      ? `${TABLE_CHIPS[i % TABLE_CHIPS.length]} text-white shadow-sm`
                      : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                  }`}
                >
                  <span className="block truncate text-sm font-bold">
                    {table.title}
                  </span>
                  {table.description && (
                    <span
                      className={`block truncate text-xs ${active ? "text-white/80" : "text-gray-500"}`}
                    >
                      {table.description}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!attendanceTables.isLoading &&
        (!selectTable || rows.length === 0 ? (
          <SubjectEmptyState text={subjectHomeLanguage.noAttendance(lang)} />
        ) : (
          <>
            {/* Hero: how often the student came to class */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 text-white shadow-md">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
              <div className="absolute -bottom-10 right-16 h-20 w-20 rounded-full bg-white/10" />
              {summary?.best ? (
                <div className="relative flex items-center gap-4">
                  <span className="text-5xl font-extrabold leading-none sm:text-6xl">
                    {summary.best.percent}%
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-bold">{cheer}</p>
                    <p className="text-sm text-white/85">
                      {subjectHomeLanguage.bestOf(
                        lang,
                        summary.best.title,
                        summary.best.count,
                        summary.recorded,
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="relative text-xl font-bold">
                  ✅{" "}
                  {subjectHomeLanguage.classesChecked(
                    lang,
                    summary?.recorded ?? 0,
                  )}
                </p>
              )}
            </section>

            {/* One colorful tile per status the student received */}
            {summary && summary.counts.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {summary.counts.map((c) => (
                  <li
                    key={c.title}
                    className="flex flex-col gap-1 rounded-2xl border-2 p-3"
                    style={{
                      backgroundColor: tintColor(c.color, 0.1),
                      borderColor: tintColor(c.color, 0.35),
                    }}
                  >
                    <span
                      className="text-3xl font-extrabold leading-none"
                      style={{ color: c.color }}
                    >
                      {c.count}
                    </span>
                    <span className="truncate text-sm font-semibold text-gray-700">
                      {c.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Class by class */}
            <ul className="flex flex-col gap-2">
              {rows.map((row) => {
                const attendance = selectTable.attendances.find(
                  (att) => att.attendanceRowId === row.id,
                );
                const start = new Date(row.startDate);
                const color = attendance?.status
                  ? colorOf(attendance.status)
                  : NO_STATUS_COLOR;
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm"
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none"
                      style={{ backgroundColor: tintColor(color, 0.14) }}
                    >
                      <span className="text-lg font-extrabold text-icon-color">
                        {start.getDate()}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-gray-500">
                        {start.toLocaleDateString(locale, { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {start.toLocaleDateString(locale, { weekday: "long" })}
                      </p>
                      <p className="text-xs text-gray-500">
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
                        onClick={() => setSelectNote(attendance.note)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-500 transition hover:border-primary-color hover:text-primary-color"
                      >
                        <MdOutlineSpeakerNotes />
                      </button>
                    )}
                    {attendance?.status ? (
                      <span
                        className="max-w-[8rem] shrink-0 truncate rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {attendance.status}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-400">
                        {subjectHomeLanguage.notChecked(lang)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ))}
    </div>
  );
}

export default Attendance;
