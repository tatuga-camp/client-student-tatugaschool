import { assignmentPageLanguage } from "../../data/languages";
import {
  useGetLanguage,
  useGetStudentRubricBreakdown,
} from "../../react-query";

type Props = {
  studentOnAssignmentId: string;
};

// Full class names only: Tailwind cannot see classes built from strings.
function levelTone(points: number, max: number) {
  const ratio = max > 0 ? points / max : 0;
  if (ratio >= 0.9) return "bg-emerald-100 text-emerald-700";
  if (ratio >= 0.6) return "bg-blue-100 text-primary-color";
  return "bg-amber-100 text-amber-700";
}

const pill =
  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold";

/** The teacher's rubric for one assignment: a row per criterion. */
function RubricBreakdown({ studentOnAssignmentId }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const breakdown = useGetStudentRubricBreakdown({ studentOnAssignmentId });

  if (breakdown.isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-3 text-sm text-gray-400">
        {assignmentPageLanguage.loadingRubric(lang)}
      </div>
    );
  }

  const data = breakdown.data;
  if (!data || !data.rubric) {
    return null;
  }

  const rubric = data.rubric;

  return (
    <section className="chunky mt-2 w-full px-3 py-2 font-Anuphan">
      <header className="flex items-center justify-between gap-2 border-b-[1.5px] border-[#EEF1F6] py-1.5">
        <span className="min-w-0 truncate text-[13px] font-bold text-icon-color">
          {rubric.title || assignmentPageLanguage.rubric(lang)}
        </span>
        <span className={`${pill} bg-emerald-100 text-emerald-700`}>
          {data.finalScore ?? 0}
          {data.maxScore !== null ? ` / ${data.maxScore}` : ""}
        </span>
      </header>
      <ul className="list-none">
        {rubric.criteria.map((criterion) => {
          const selectedLevel = criterion.levels.find(
            (level) => level.id === criterion.selectedLevelId,
          );
          const maxPoints = Math.max(
            0,
            ...criterion.levels.map((level) => level.points),
          );

          return (
            <li
              key={criterion.id}
              className="border-b-[1.5px] border-[#EEF1F6] py-1.5 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 text-[12px] font-bold text-icon-color">
                  {criterion.title}
                </span>
                {selectedLevel ? (
                  <span
                    className={`${pill} ${levelTone(selectedLevel.points, maxPoints)}`}
                  >
                    {selectedLevel.title} · {selectedLevel.points}/{maxPoints}
                  </span>
                ) : (
                  <span className={`${pill} bg-gray-100 text-gray-500`}>
                    {assignmentPageLanguage.rubricNotGraded(lang)}
                  </span>
                )}
              </div>
              {criterion.comment && (
                <p className="mt-0.5 text-[11px] text-[#7A80A0]">
                  {assignmentPageLanguage.teacherNote(lang)} {criterion.comment}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RubricBreakdown;
