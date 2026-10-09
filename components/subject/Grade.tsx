import { useEffect, useState } from "react";
import { FaTrophy } from "react-icons/fa";
import { MdAssignment, MdStar } from "react-icons/md";
import { gradeDataLanguage, subjectHomeLanguage } from "../../data/languages";
import {
  useGetLanguage,
  useGetOverviewScore,
  useGetSubjectById,
} from "../../react-query";
import {
  calulateGrade,
  canStudentViewScore,
  defaultGradeRule,
  summarizeAssignmentScores,
} from "../../utils";
import Image from "next/image";
import ScoreHiddenBadge from "./ScoreHiddenBadge";
import SubjectEmptyState from "./SubjectEmptyState";

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

  const language = useGetLanguage();
  const lang = language.data ?? "en";

  const assignmentSummary = summarizeAssignmentScores(
    overview.data?.assignments ?? [],
    subject.data,
  );
  const totalMaxScore = assignmentSummary.max;
  const hiddenCount = assignmentSummary.hiddenCount;

  useEffect(() => {
    if (overview.data) {
      handleCalulateScore();
    }
  }, [overview.data, subject.data]);

  const handleCalulateScore = () => {
    const totalAssignment = summarizeAssignmentScores(
      overview.data?.assignments ?? [],
      subject.data,
    ).earned;

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
  const overallPercent =
    totalMaxScore > 0
      ? Math.min(100, Math.max(0, (totalScore / totalMaxScore) * 100))
      : 0;
  const hasAnyScore =
    overview.data.assignments.length > 0 ||
    overview.data.scoreOnSubjects.length > 0;

  return (
    <div className="flex w-full flex-col gap-5 pb-12 pt-3 font-Anuphan">
      {/* Total points */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-color to-secondary-color p-5 text-white shadow-md sm:p-6">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15" />
        <div className="absolute -bottom-12 left-10 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/85">
              {subjectHomeLanguage.totalPoints(lang)}
            </p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                {totalScore.toFixed(1)}
              </span>
              <span className="text-lg font-semibold text-white/80">
                / {totalMaxScore}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm">
            <FaTrophy className="text-xl text-yellow-300" aria-hidden />
            <span className="mt-1 text-2xl font-extrabold leading-none">
              {allowViewGrade ? grade : "-"}
            </span>
            <span className="text-[11px] font-semibold text-white/80">
              {subjectHomeLanguage.currentGrade(lang)}
            </span>
          </div>
        </div>

        {totalMaxScore > 0 && (
          <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-yellow-300 transition-all duration-1000"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        )}
      </header>

      {/* Where the points come from */}
      <section className="grid w-full grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border-2 border-sky-100 bg-sky-50 p-4">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sky-600">
            <MdAssignment className="text-base" aria-hidden />
            {subjectHomeLanguage.assignmentPoints(lang)}
          </span>
          <span className="text-2xl font-extrabold text-icon-color">
            {totalAssignmentScore.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border-2 border-amber-100 bg-amber-50 p-4">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600">
            <MdStar className="text-base" aria-hidden />
            {subjectHomeLanguage.specialPoints(lang)}
          </span>
          <span className="text-2xl font-extrabold text-icon-color">
            {totalSpecialScore.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
      </section>

      {!hasAnyScore && (
        <SubjectEmptyState text={subjectHomeLanguage.noScores(lang)} />
      )}

      {/* Classwork scores */}
      {overview.data.assignments.length > 0 && (
        <section className="flex w-full flex-col gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-icon-color">
            <span aria-hidden>📝</span>
            {subjectHomeLanguage.assignmentScores(lang)}
          </h3>
          <ul className="flex flex-col gap-2">
            {overview.data.assignments.map((a) => {
              const visible = canStudentViewScore(subject.data, a.assignment);
              const score = a.studentOnAssignment.score ?? 0;
              const max = a.assignment.maxScore;
              const percent =
                max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;
              const bar =
                percent >= 80
                  ? "bg-emerald-400"
                  : percent >= 50
                    ? "bg-amber-400"
                    : "bg-rose-400";

              return (
                <li
                  key={a.assignment.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="line-clamp-2 font-semibold text-gray-800">
                      {a.assignment.title}
                    </span>
                    {visible ? (
                      <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-sm font-extrabold text-sky-700">
                        {score}
                        <span className="font-semibold text-sky-400">
                          {" "}
                          / {max}
                        </span>
                      </span>
                    ) : (
                      <div className="shrink-0">
                        <ScoreHiddenBadge size="sm" />
                      </div>
                    )}
                  </div>
                  {visible && (
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${bar}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {hiddenCount > 0 && (
            <p className="px-1 text-xs text-gray-400">
              {gradeDataLanguage.hiddenNote(lang)}
            </p>
          )}
        </section>
      )}

      {/* Special scores */}
      {overview.data.scoreOnSubjects.length > 0 && (
        <section className="flex w-full flex-col gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-icon-color">
            <span aria-hidden>⭐</span>
            {subjectHomeLanguage.specialScores(lang)}
          </h3>
          <ul className="flex flex-col gap-2">
            {overview.data.scoreOnSubjects.map((a) => {
              const sumRawScore = a.students.reduce(
                (prev, studentOnScore) => prev + studentOnScore.score,
                0,
              );
              let score = sumRawScore;
              const maxScore = a.scoreOnSubject.maxScore ?? 100;
              if (a.scoreOnSubject.weight !== null) {
                const originalScore =
                  (sumRawScore > maxScore ? maxScore : sumRawScore) / maxScore;
                score = originalScore * a.scoreOnSubject.weight;
              }
              const percent =
                maxScore > 0
                  ? Math.min(100, Math.max(0, (sumRawScore / maxScore) * 100))
                  : 0;

              return (
                <li
                  key={a.scoreOnSubject.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                        {a.scoreOnSubject.icon ? (
                          <Image
                            src={a.scoreOnSubject.icon}
                            alt={a.scoreOnSubject.title}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <MdStar
                            className="text-xl text-amber-400"
                            aria-hidden
                          />
                        )}
                      </div>
                      <span className="truncate font-semibold text-gray-800">
                        {a.scoreOnSubject.title}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-600">
                      {score.toFixed(1)}
                      {a.scoreOnSubject.maxScore && (
                        <span className="font-semibold text-amber-400">
                          {" "}
                          / {a.scoreOnSubject.weight ?? maxScore}
                        </span>
                      )}
                    </span>
                  </div>
                  {a.scoreOnSubject.maxScore && (
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

export default Grade;
