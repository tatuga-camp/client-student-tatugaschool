import Attendance from "../subject/Attendance";
import Grade from "../subject/Grade";
import { useGetStudent, useGetSubjectById } from "../../react-query";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/**
 * Placeholder until Part 2 rewrites Progress: today's grade and attendance,
 * stacked, each only when the teacher lets students see it.
 */
export default function ProgressTab({ subjectId }: TabPaneProps) {
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  return (
    <div
      className="app-scroll h-full w-full px-3 pb-10 font-Anuphan"
      style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
    >
      {subject.data && student.data && (
        <div className="flex flex-col gap-6">
          {subject.data.allowStudentViewOverallScore && (
            <Grade subjectId={subjectId} studentId={student.data.id} />
          )}
          {subject.data.allowStudentViewAttendance && (
            <Attendance subjectId={subjectId} studentId={student.data.id} />
          )}
        </div>
      )}
    </div>
  );
}
