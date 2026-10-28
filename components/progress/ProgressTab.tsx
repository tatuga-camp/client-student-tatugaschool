import Attendance from "../subject/Attendance";
import Grade from "../subject/Grade";
import { homeLanguage } from "../../data/languages";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import { SubjectChip } from "../app/SubjectChip";
import { TAB_BODY_CLASS, TabHeader } from "../app/TabHeader";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/**
 * Placeholder until Part 2 rewrites Progress: today's grade and attendance,
 * stacked, each only when the teacher lets students see it.
 */
export default function ProgressTab({ subjectId }: TabPaneProps) {
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  const language = useGetLanguage();
  return (
    <div className="flex h-full w-full flex-col font-Anuphan">
      <TabHeader
        title={homeLanguage.tabProgress(language.data ?? "en")}
        right={<SubjectChip subjectId={subjectId} />}
      />
      <div className={`${TAB_BODY_CLASS} px-3 pb-10 pt-3`}>
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
    </div>
  );
}
