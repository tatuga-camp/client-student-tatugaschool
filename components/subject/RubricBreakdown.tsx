import { useGetStudentRubricBreakdown } from "../../react-query";

type Props = {
  studentOnAssignmentId: string;
};

function RubricBreakdown({ studentOnAssignmentId }: Props) {
  const breakdown = useGetStudentRubricBreakdown({ studentOnAssignmentId });

  if (breakdown.isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-3 text-sm text-gray-400">
        Loading rubric...
      </div>
    );
  }

  const data = breakdown.data;
  if (!data || !data.rubric) {
    return null;
  }

  const rubric = data.rubric;

  return (
    <section className="mt-3 w-full rounded-xl border bg-white p-4 font-Anuphan">
      <header className="flex items-center justify-between gap-2 border-b pb-2">
        <span className="text-lg font-semibold text-black">{rubric.title}</span>
        <span className="text-base font-bold text-blue-700">
          Score: {data.finalScore ?? 0}
          {data.maxScore !== null ? ` / ${data.maxScore}` : ""}
        </span>
      </header>
      <ul className="mt-3 flex w-full flex-col gap-3">
        {rubric.criteria.map((criterion) => {
          const selectedLevel = criterion.levels.find(
            (level) => level.id === criterion.selectedLevelId,
          );

          return (
            <li
              key={criterion.id}
              className="flex flex-col gap-1 rounded-lg border bg-gray-50 p-3"
            >
              <span className="font-semibold text-black">
                {criterion.title}
              </span>
              {selectedLevel ? (
                <span className="text-sm text-gray-700">
                  {selectedLevel.title} ({selectedLevel.points} points)
                </span>
              ) : (
                <span className="text-sm text-gray-400">Not graded</span>
              )}
              {criterion.comment && (
                <span className="text-sm italic text-gray-500">
                  Teacher&apos;s note: {criterion.comment}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RubricBreakdown;
