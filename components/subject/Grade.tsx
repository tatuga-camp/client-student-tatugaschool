import { useEffect, useState } from "react";
import { FaTrophy } from "react-icons/fa";
import { MdAssignment, MdStar } from "react-icons/md";
import { useGetOverviewScore, useGetSubjectById } from "../../react-query";
import { calulateGrade, defaultGradeRule } from "../../utils";
import Image from "next/image";

type Props = {
  subjectId: string;
  studentId: string;
};

function Grade({ subjectId, studentId }: Props) {
  const subject = useGetSubjectById({ id: subjectId });
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalSpecialScore, setTotalSpecialScore] = useState<number>(0);
  const [totalAssignmentScore, setTotalAssignmentScore] = useState<number>(0);
  const [grade, setGrade] = useState<string>("NONE");

  const overview = useGetOverviewScore({
    subjectId,
    studentId,
  });

  const totalMaxScore =
    overview.data?.assignments.reduce((acc, curr) => {
      return acc + curr.assignment.maxScore;
    }, 0) ?? 0;

  useEffect(() => {
    if (overview.data) {
      handleCalulateScore();
    }
  }, [overview.data]);

  const handleCalulateScore = () => {
    const totalAssignment =
      overview.data?.assignments.reduce((prev, current) => {
        let score = current.studentOnAssignment.score ?? 0;
        if (current.assignment.weight !== null) {
          const originalScore = score / current.assignment.maxScore;
          score = originalScore * current.assignment.weight;
        }
        return prev + score;
      }, 0) ?? 0;

    const totalSpecial =
      overview.data?.scoreOnSubjects.reduce((prev, scoreOnSubject) => {
        const sumRawScore = scoreOnSubject.students.reduce(
          (sum, studentOnScore) => sum + studentOnScore.score,
          0,
        );

        let score = sumRawScore;
        const maxScore = scoreOnSubject.scoreOnSubject.maxScore ?? 100;
        if (scoreOnSubject.scoreOnSubject.weight !== null) {
          const originalScore =
            (sumRawScore > maxScore ? maxScore : sumRawScore) / maxScore;
          score = originalScore * scoreOnSubject.scoreOnSubject.weight;
        }

        return prev + score;
      }, 0) ?? 0;

    setTotalAssignmentScore(totalAssignment);
    setTotalSpecialScore(totalSpecial);
    setTotalScore(totalAssignment + totalSpecial);

    const calcGrade = calulateGrade(
      overview.data?.grade?.gradeRules ?? defaultGradeRule,
      totalAssignment + totalSpecial,
    );
    setGrade(calcGrade);
  };

  if (!overview.data) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-color border-t-transparent"></div>
      </div>
    );
  }

  const allowViewGrade = subject.data?.allowStudentViewGrade === true;

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4 pb-12 pt-6 font-Anuphan md:px-0">
      {/* Top Header Card */}
      <header className="relative flex w-full max-w-lg flex-col items-center overflow-hidden rounded-3xl bg-primary-color p-6 text-white shadow-lg md:w-96">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>

        <h2 className="z-10 text-lg font-medium text-blue-100">Total Points</h2>
        <div className="z-10 mt-1 flex items-baseline gap-1">
          <span className="text-6xl font-extrabold tracking-tight">
            {totalScore.toFixed(1)}
          </span>
          <span className="text-xl font-medium text-blue-100">
            / {totalMaxScore}
          </span>
        </div>

        <div className="z-10 mt-6 flex w-full items-center justify-between rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl text-yellow-300">
              <FaTrophy />
            </div>
            <span className="font-medium text-blue-50">Current Grade</span>
          </div>
          <span className="text-2xl font-bold">
            {allowViewGrade ? grade : "-"}
          </span>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid w-full max-w-lg grid-cols-2 gap-4">
        <div className="flex flex-col items-start justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex w-full items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Assignments
            </span>
            <MdAssignment className="text-xl text-primary-color opacity-70" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {totalAssignmentScore.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
        <div className="flex flex-col items-start justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex w-full items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Special
            </span>
            <MdStar className="text-xl text-yellow-500 opacity-70" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {totalSpecialScore.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
      </section>

      {/* Breakdown Lists */}
      <main className="w-full max-w-3xl space-y-8">
        {/* Assignments Section */}
        {overview.data.assignments.length > 0 && (
          <section className="flex w-full flex-col gap-4">
            <h3 className="border-l-4 border-primary-color pl-3 text-lg font-bold text-gray-800">
              Assignment Scores
            </h3>
            <ul className="flex flex-col gap-3">
              {overview.data.assignments.map((a) => {
                const score = a.studentOnAssignment.score ?? 0;
                const max = a.assignment.maxScore;
                const percent =
                  max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;

                return (
                  <li
                    key={a.assignment.id}
                    className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex w-full items-start justify-between gap-4">
                      <span className="line-clamp-2 font-semibold text-gray-800">
                        {a.assignment.title}
                      </span>
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="text-lg font-bold text-primary-color">
                          {score}
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                          / {max}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-primary-color transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Special Points Section */}
        {overview.data.scoreOnSubjects.length > 0 && (
          <section className="flex w-full flex-col gap-4">
            <h3 className="border-l-4 border-yellow-400 pl-3 text-lg font-bold text-gray-800">
              Special Scores
            </h3>
            <ul className="flex flex-col gap-3">
              {overview.data.scoreOnSubjects.map((a) => {
                const sumRawScore = a.students.reduce(
                  (prev, studentOnScore) => prev + studentOnScore.score,
                  0,
                );
                let score = sumRawScore;
                const maxScore = a.scoreOnSubject.maxScore ?? 100;
                if (a.scoreOnSubject.weight !== null) {
                  const originalScore =
                    (sumRawScore > maxScore ? maxScore : sumRawScore) /
                    maxScore;
                  score = originalScore * a.scoreOnSubject.weight;
                }
                const percent =
                  maxScore > 0
                    ? Math.min(100, Math.max(0, (sumRawScore / maxScore) * 100))
                    : 0;

                return (
                  <li
                    key={a.scoreOnSubject.id}
                    className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {a.scoreOnSubject.icon && (
                          <div className="relative h-10 w-10 shrink-0">
                            <Image
                              src={a.scoreOnSubject.icon}
                              alt={a.scoreOnSubject.title}
                              fill
                              className="object-contain drop-shadow-sm"
                            />
                          </div>
                        )}
                        <span className="truncate font-semibold text-gray-800">
                          {a.scoreOnSubject.title}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col items-end">
                        <span className="text-lg font-bold text-yellow-500">
                          {score.toFixed(1)}
                        </span>
                        {a.scoreOnSubject.maxScore && (
                          <span className="text-xs font-medium text-gray-400">
                            / {a.scoreOnSubject.weight ?? maxScore}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar */}
                    {a.scoreOnSubject.maxScore && (
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default Grade;
