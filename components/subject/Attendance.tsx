import React, { useEffect } from "react";
import { useGetAttendanceTables } from "../../react-query";
import { ProgressBar } from "primereact/progressbar";
import {
  Attendance as AttendanceType,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
} from "../../interfaces";
import parse from "html-react-parser";
import { MdOutlineSpeakerNotes } from "react-icons/md";
import PopupLayout from "../layouts/PopupLayout";
import { IoMdClose } from "react-icons/io";
import { PiNote } from "react-icons/pi";
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
          <div className="bg-white p-3 rounded-md flex flex-col w-80 h-96">
            <div className="w-full flex justify-end">
              <button
                onClick={() => {
                  document.body.style.overflow = "auto";
                  setSelectNote(null);
                }}
                className="text-lg hover:bg-gray-300/50 w-6  h-6  rounded
         flex items-center justify-center font-semibold"
              >
                <IoMdClose />
              </button>
            </div>
            <div className="grow overflow-auto">{parse(selectNote)}</div>
          </div>
        </PopupLayout>
      )}
      <section className="text-center mt-5 md:text-left">
        <h1 className="text-2xl md:text-3xl font-semibold">Attendance Data</h1>
        <span className="text-gray-400 text-sm md:text-base">
          You can view the attendance data of this subject here.
        </span>
      </section>
      <div className="w-full md:max-w-screen-md xl:max-w-screen-lg mx-auto border-b pb-5 px-3 md:px-5">
        {attendanceTables.isLoading && (
          <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        )}
        <ul className="mt-5 flex items-center justify-start w-full overflow-x-auto gap-2">
          {attendanceTables.isLoading ? (
            <div>Loading..</div>
          ) : (
            attendanceTables.data?.map((table) => (
              <li
                onClick={() => setSelectTable(table)}
                key={table.id}
                className={`w-max rounded-md min-w-40 shrink-0 p-3 cursor-pointer ${
                  table.id === selectTable?.id
                    ? "border-primary-color gradient-bg text-white"
                    : "border bg-white  text-black"
                }`}
              >
                <h2 className="text-base font-semibold">{table.title}</h2>
                <p
                  className={`text-xs text-gray-400
                  ${
                    table.id === selectTable?.id
                      ? " text-white"
                      : " text-gray-400"
                  }
                  `}
                >
                  {table.description}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="mt-5 max-w-full overflow-auto ">
        <table className="">
          <thead className="border-collapse">
            <tr className="border">
              <th className="border">Date</th>
              <th className="border">Status</th>
              <th className="border">Note</th>
            </tr>
          </thead>
          <tbody>
            {selectTable?.rows
              .sort(
                (a, b) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime()
              )
              .map((row, index) => {
                const attendance = selectTable.attendances.find(
                  (att) => att.attendanceRowId === row.id
                );

                const dateFormat = new Date(row.startDate).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                );
                const time = new Date(row.startDate).toLocaleTimeString(
                  undefined,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
                return (
                  <tr key={index} className="border">
                    <td className="border">
                      <div
                        className="min-w-60 p-2 relative
                flex items-start flex-col"
                      >
                        <span className="font-semibold">{dateFormat}</span>
                        <span className="text-xs text-gray-500">{time}</span>
                      </div>
                    </td>
                    <td className="border">
                      {attendance ? (
                        <div
                          style={{
                            backgroundColor:
                              selectTable?.statusLists.find(
                                (s) => s.title === attendance?.status
                              )?.color ?? "#94a3b8",
                          }}
                          className="flex w-40 h-14
                   relative   ring-black 
                   items-center transition
                   justify-center flex-col"
                        >
                          <span>{attendance?.status}</span>
                        </div>
                      ) : (
                        <div
                          className="flex w-full h-14
                   relative   bg-black select-none
                    text-white ring-black 
                   items-center transition
                   justify-center flex-col"
                        >
                          NO DATA
                        </div>
                      )}
                    </td>
                    <td className="border">
                      {attendance?.note ? (
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setSelectNote(attendance.note)}
                            className="second-button border flex items-center justify-center gap-1"
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
