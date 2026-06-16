import parse from "html-react-parser";
import { ProgressBar } from "primereact/progressbar";
import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { MdOutlineSpeakerNotes } from "react-icons/md";
import {
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  Attendance as AttendanceType,
} from "../../interfaces";
import { useGetAttendanceTables } from "../../react-query";
import PopupLayout from "../layouts/PopupLayout";
type Props = {
  subjectId: string;
  studentId: string;
};
function Attendance({ subjectId, studentId }: Props) {
  const attendanceTables = useGetAttendanceTables({ subjectId, studentId });
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
        rows: AttendanceRow[];
        attendances: AttendanceType[];
      })
    | null
  >(null);
  const [selectNote, setSelectNote] = React.useState<string | null>(null);

  useEffect(() => {
    if (attendanceTables.data && attendanceTables.data.length > 0) {
      setSelectTable(attendanceTables.data[0]);
    }
  }, [attendanceTables.data]);
  return (
    <div className="w-full">
      {selectNote && (
        <PopupLayout
          onClose={() => {
            setSelectNote(null);
          }}
        >
          <div className="flex w-[90vw] max-w-md flex-col rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex w-full justify-end border-b pb-2">
              <button
                onClick={() => {
                  document.body.style.overflow = "auto";
                  setSelectNote(null);
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
              >
                <IoMdClose />
              </button>
            </div>
            <div className="grow overflow-auto">{parse(selectNote)}</div>
          </div>
        </PopupLayout>
      )}
      <section className="mt-5 text-center md:text-left">
        <h1 className="text-2xl font-semibold md:text-3xl">Attendance Data</h1>
        <span className="text-sm text-gray-400 md:text-base">
          You can view the attendance data of this subject here.
        </span>
      </section>
      <div className="mx-auto w-full px-3 pb-5 md:max-w-screen-md md:px-5 xl:max-w-screen-lg">
        {attendanceTables.isLoading && (
          <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        )}
        <ul className="mt-5 flex w-full items-center justify-start gap-2 overflow-x-auto">
          {attendanceTables.isLoading ? (
            <div>Loading..</div>
          ) : (
            attendanceTables.data?.map((table) => (
              <li
                onClick={() => setSelectTable(table)}
                key={table.id}
                className={`shrink-0 cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                  table.id === selectTable?.id
                    ? "border-primary-color bg-primary-color text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary-color hover:shadow-sm"
                }`}
              >
                <h2 className="text-base font-bold tracking-tight">
                  {table.title}
                </h2>
                <p
                  className={`mt-1 text-xs ${
                    table.id === selectTable?.id
                      ? "text-blue-100"
                      : "text-gray-500"
                  } `}
                >
                  {table.description}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 text-center font-semibold">Status</th>
              <th className="px-6 py-4 text-center font-semibold">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {selectTable?.rows
              .sort(
                (a, b) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime(),
              )
              .map((row, index) => {
                const attendance = selectTable.attendances.find(
                  (att) => att.attendanceRowId === row.id,
                );

                const dateFormat = new Date(row.startDate).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                );
                const time = new Date(row.startDate).toLocaleTimeString(
                  undefined,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );
                return (
                  <tr
                    key={index}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {dateFormat}
                        </span>
                        <span className="text-xs text-gray-500">{time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {attendance ? (
                        <div
                          style={{
                            backgroundColor:
                              selectTable?.statusLists.find(
                                (s) => s.title === attendance?.status,
                              )?.color ?? "#94a3b8",
                          }}
                          className="mx-auto flex w-max items-center justify-center rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white shadow-sm"
                        >
                          {attendance?.status}
                        </div>
                      ) : (
                        <div className="mx-auto flex w-max items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-400">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {attendance?.note ? (
                        <button
                          onClick={() => setSelectNote(attendance.note)}
                          className="mx-auto flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-primary-color hover:text-primary-color"
                        >
                          <MdOutlineSpeakerNotes className="text-base" /> Note
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
