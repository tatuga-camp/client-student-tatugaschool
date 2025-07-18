import { useEffect, useState } from "react";
import { FaTrophy } from "react-icons/fa";
import { MdAssignment, MdStar } from "react-icons/md";
import { useGetOverviewScore, useGetSubjectById } from "../../react-query";
import { calulateGrade, defaultGradeRule } from "../../utils";
import ClassworkCard from "./ClassworkCard";
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
  const totalMaxScore = overview.data?.assignments.reduce((acc, curr) => {
    return acc + curr.assignment.maxScore;
  }, 0);

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
          (prev, studentOnScore) => {
            return (prev += studentOnScore.score);
          },
          0,
        );

        let score = sumRawScore;
        const maxScore = scoreOnSubject.scoreOnSubject.maxScore ?? 100;
        if (scoreOnSubject.scoreOnSubject.weight !== null) {
          const originalScore =
            (sumRawScore > maxScore ? maxScore : sumRawScore) / maxScore;
          score = originalScore * scoreOnSubject.scoreOnSubject.weight;
        }

        return (prev += score);
      }, 0) ?? 0;

    setTotalAssignmentScore(totalAssignment);
    setTotalSpecialScore(totalSpecial);
    setTotalScore(totalAssignment + totalSpecial);
    const grade = calulateGrade(
      overview.data?.grade?.gradeRules ?? defaultGradeRule,
      totalAssignment + totalSpecial,
    );
    setGrade(grade);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 pt-5 font-Anuphan">
      <header className="flex h-40 w-80 items-center justify-between rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 p-3">
        <section className="flex flex-col items-start justify-center">
          <span className="text-lg text-white/80">Total Points</span>
          <span className="text-5xl font-bold text-white">{totalScore}</span>
          <span className="text-lg text-white/80">
            From {totalMaxScore} Points
          </span>
        </section>
        <section className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl text-white">
            <FaTrophy />
          </div>
          <span className="text-white">
            {" "}
            {subject.data?.allowStudentViewGrade === true
              ? `Grade ${grade}`
              : "NOT ALLOW"}
          </span>
        </section>
      </header>
      <section className="flex items-center justify-center gap-5">
        <section className="flex h-20 w-44 items-center justify-between rounded-xl border bg-white p-3 py-5 text-blue-700">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Assignment Points</span>
            <span className="text-3xl font-bold text-blue-700">
              {totalAssignmentScore.toLocaleString()}
            </span>
          </div>
          <MdAssignment className="text-2xl" />
        </section>
        <section className="flex h-20 w-44 items-center justify-between rounded-xl border bg-white p-3 py-5 text-blue-700">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Speical Points</span>
            <span className="text-3xl font-bold text-blue-700">
              {totalSpecialScore.toLocaleString()}
            </span>
          </div>
          <MdStar className="text-2xl" />
        </section>
      </section>
      <main className="w-full">
        <h3 className="w-full text-start text-2xl font-bold text-black">
          Assignments
        </h3>
        <ul className="mt-3 flex w-full flex-col gap-4">
          {overview.data?.assignments.map((a) => {
            return (
              <ClassworkCard
                key={a.assignment.id}
                subjectId={subjectId}
                onSelect={() => {}}
                classwork={{
                  ...a.assignment,
                  files: [],
                  studentOnAssignment: a.studentOnAssignment,
                }}
              />
            );
          })}
        </ul>
        <h3 className="mt-5 w-full text-start text-2xl font-bold text-black">
          Speical Points
        </h3>{" "}
        <ul className="mt-3 flex w-full flex-col gap-4">
          {overview.data?.scoreOnSubjects.map((a) => {
            const sumRawScore = a.students.reduce((prev, studentOnScore) => {
              return (prev += studentOnScore.score);
            }, 0);

            let score = sumRawScore;
            const maxScore = a.scoreOnSubject.maxScore ?? 100;
            if (a.scoreOnSubject.weight !== null) {
              const originalScore =
                (sumRawScore > maxScore ? maxScore : sumRawScore) / maxScore;
              score = originalScore * a.scoreOnSubject.weight;
            }

            return (
              <section
                key={a.scoreOnSubject.id}
                className="flex h-20 w-full items-center justify-between rounded-xl border bg-white p-3"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="relative h-10 w-10">
                    <Image
                      src={a.scoreOnSubject.icon}
                      alt={a.scoreOnSubject.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="items-staet flex flex-col gap-0">
                    <span className="text-xl font-semibold">
                      {a.scoreOnSubject.title}
                    </span>
                    {a.scoreOnSubject.maxScore && (
                      <span className="text-sm text-gray-500">
                        {a.scoreOnSubject.maxScore} max score -{" "}
                        {a.scoreOnSubject.weight} weight
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xl font-bold text-green-600">
                  ({score} Points)
                </span>
              </section>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

export default Grade;
