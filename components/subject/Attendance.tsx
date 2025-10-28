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
          <div className="rounded-2xl80 flex-col rounded-2xl bg-white p-3">
            <div className="flex w-full justify-end">
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
                className={`rounded-2xl40 shrink-0 cursor-pointer rounded-2xl p-3 ${
                  table.id === selectTable?.id
                    ? "gradient-bg -primary-color text-white"
                    : "bg-white text-black"
                }`}
              >
                <h2 className="text-base font-semibold">{table.title}</h2>
                <p
                  className={`text-xs text-gray-400 ${
                    table.id === selectTable?.id
                      ? "text-white"
                      : "text-gray-400"
                  } `}
                >
                  {table.description}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="rounded-2xlw-hidden rounded-2xl bg-white">
        <table className="w-full">
          <thead className="">
            <tr className="bg-gray-200">
              <th className="">Date</th>
              <th className="">Status</th>
              <th className="">Note</th>
            </tr>
          </thead>
          <tbody>
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
                  <tr key={index} className="border-b">
                    <td className="">
                      <div className="relative flex w-24 flex-col items-start p-2">
                        <span className="font-semibold">{dateFormat}</span>
                        <span className="text-xs text-gray-500">{time}</span>
                      </div>
                    </td>
                    <td className="">
                      {attendance ? (
                        <div
                          style={{
                            backgroundColor:
                              selectTable?.statusLists.find(
                                (s) => s.title === attendance?.status,
                              )?.color ?? "#94a3b8",
                          }}
                          className="relative flex flex-col items-center justify-center rounded-2xl px-4 py-2 ring-black transition"
                        >
                          {attendance?.status}
                        </div>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center rounded-2xl px-4 py-2 ring-black transition">
                          NO DATA
                        </div>
                      )}
                    </td>
                    <td className="">
                      {attendance?.note ? (
                        <div className="flex w-full items-center justify-center">
                          <button
                            onClick={() => setSelectNote(attendance.note)}
                            className="second-button flex items-center justify-center gap-1"
                          >
                            View Note <MdOutlineSpeakerNotes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          No Note
                        </div>
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
