import { useEffect, useRef, useState } from "react";
import { LuCalendarCheck, LuTrophy } from "react-icons/lu";
import { homeLanguage, progressLanguage } from "../../data/languages";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import { mascotForStudent } from "../../utils/mascot";
import { progressPanes } from "../../utils/tabs";
import { SubjectChip } from "../app/SubjectChip";
import { TAB_BODY_CLASS, TabHeader } from "../app/TabHeader";
import type { TabPaneProps } from "../app/shell/useShellRoute";
import MascotAvatar from "../student/MascotAvatar";
import AttendancePane from "./AttendancePane";
import GradesPane from "./GradesPane";

type Pane = "grades" | "attendance";

/** Progress: a Grades | Attendance switch over what the teacher lets students see. */
export default function ProgressTab({ subjectId, active }: TabPaneProps) {
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  const lang = useGetLanguage().data ?? "en";
  const [picked, setPicked] = useState<Pane | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const panes = subject.data ? progressPanes(subject.data) : [];
  // The pick falls back to the first pane when visibility changes under it.
  const view = picked && panes.includes(picked) ? picked : panes[0];

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [view]);

  const labels: Record<Pane, { text: string; icon: React.ReactNode }> = {
    grades: {
      text: progressLanguage.tabGrades(lang),
      icon: <LuTrophy aria-hidden />,
    },
    attendance: {
      text: progressLanguage.tabAttendance(lang),
      icon: <LuCalendarCheck aria-hidden />,
    },
  };

  return (
    <div className="flex h-full w-full flex-col font-Anuphan">
      <TabHeader
        title={homeLanguage.tabProgress(lang)}
        right={<SubjectChip subjectId={subjectId} />}
      />
      <div ref={scroller} className={`${TAB_BODY_CLASS} px-3 pb-10 pt-3`}>
        {subject.data && panes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            {student.data && (
              <div className="relative h-[140px] w-[140px]">
                <MascotAvatar
                  clips={mascotForStudent(student.data)}
                  alt=""
                  id={`${student.data.id}:progress`}
                  idle={active}
                  sizes="140px"
                />
              </div>
            )}
            <p className="text-sm font-bold text-[#7A80A0]">
              {progressLanguage.notShared(lang)}
            </p>
          </div>
        )}
        {subject.data && view && (
          <div className="flex flex-col gap-3">
            {panes.length > 1 && (
              <div
                role="group"
                aria-label={homeLanguage.tabProgress(lang)}
                className="flex rounded-[14px] bg-[#E9EEF5] p-[3px]"
              >
                {panes.map((pane) => {
                  const on = pane === view;
                  return (
                    <button
                      key={pane}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPicked(pane)}
                      className={`flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[11px] px-2 text-sm font-bold ${
                        on ? "bg-white text-primary-color" : "text-[#7A80A0]"
                      }`}
                      style={on ? { boxShadow: "0 2px 0 #D6DEEA" } : undefined}
                    >
                      <span className="text-base">{labels[pane].icon}</span>
                      <span className="truncate">{labels[pane].text}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {view === "grades" ? (
              <GradesPane subjectId={subjectId} active={active} />
            ) : (
              student.data && (
                <AttendancePane
                  subjectId={subjectId}
                  studentId={student.data.id}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
