import Image from "next/image";
import { LuEyeOff, LuFileText, LuStar, LuTrophy } from "react-icons/lu";
import {
  gradeDataLanguage,
  progressLanguage,
  subjectHomeLanguage,
} from "../../data/languages";
import {
  useGetLanguage,
  useGetOverviewScore,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import {
  calulateGrade,
  canStudentViewScore,
  defaultGradeRule,
  summarizeAssignmentScores,
} from "../../utils";
import { mascotForStudent } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";

const CARD = "rounded-[14px] border-2 border-b-4 border-[#E3E8F0] bg-white";

const pct = (score: number, max: number) =>
  max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;
const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 });

type Props = { subjectId: string; active: boolean };

/** Total points, the grade, and the classwork and special score lists. */
export default function GradesPane({ subjectId, active }: Props) {
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  const lang = useGetLanguage().data ?? "en";
  const overview = useGetOverviewScore({
    subjectId,
    studentId: student.data?.id ?? "",
  });

  if (!overview.data || !subject.data) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-color border-t-transparent motion-reduce:animate-none" />
      </div>
    );
  }

  const { assignments, scoreOnSubjects } = overview.data;
  const summary = summarizeAssignmentScores(assignments, subject.data);
  // A special score is its raw sum, or the share of its max scaled to its weight.
  const special = scoreOnSubjects.map((item) => {
    const raw = item.students.reduce((sum, s) => sum + s.score, 0);
    const max = item.scoreOnSubject.maxScore ?? 100;
    const weight = item.scoreOnSubject.weight;
    const score = weight !== null ? (Math.min(raw, max) / max) * weight : raw;
    return { item, raw, max, score };
  });
  const specialTotal = special.reduce((sum, s) => sum + s.score, 0);
  const total = summary.earned + specialTotal;
  const grade = calulateGrade(
    overview.data.grade?.gradeRules ?? defaultGradeRule,
    total,
  );
  const showGrade = subject.data.allowStudentViewGrade === true;
  const hasAnyScore = assignments.length > 0 || scoreOnSubjects.length > 0;

  return (
    <div className="flex flex-col gap-3 font-Anuphan">
      <section
        className="relative overflow-hidden rounded-[20px] bg-primary-color p-4 text-white"
        style={{ boxShadow: "0 5px 0 #275d96" }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-white/85">
          {subjectHomeLanguage.totalPoints(lang)}
        </p>
        <p className="text-4xl font-bold leading-tight">
          {total.toFixed(1)}
          <small className="ml-1 text-lg opacity-80">/ {summary.max}</small>
        </p>
        {summary.max > 0 && (
          <div className="mt-2 h-2.5 w-3/5 overflow-hidden rounded-md bg-white/30">
            <div
              className="h-full rounded-md bg-warning-color"
              style={{ width: `${pct(total, summary.max)}%` }}
            />
          </div>
        )}
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-warning-color px-2.5 py-1 text-xs font-bold text-[#383767]"
          style={{ boxShadow: "0 3px 0 #D9A900" }}
        >
          <LuTrophy aria-hidden />
          {subjectHomeLanguage.currentGrade(lang)} {showGrade ? grade : "-"}
        </span>
        {student.data && (
          <div className="pointer-events-none absolute -bottom-2.5 -right-1.5 h-[104px] w-[104px]">
            <MascotAvatar
              clips={mascotForStudent(student.data)}
              alt=""
              id={`${student.data.id}:grades`}
              idle={active}
              sizes="104px"
            />
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Tile
          label={subjectHomeLanguage.assignmentPoints(lang)}
          value={fmt(summary.earned)}
          icon={<LuFileText className="text-primary-color" aria-hidden />}
        />
        <Tile
          label={subjectHomeLanguage.specialPoints(lang)}
          value={fmt(specialTotal)}
          icon={<LuStar className="text-[#F5A524]" aria-hidden />}
        />
      </div>

      {!hasAnyScore && (
        <p className="py-6 text-center text-sm font-semibold text-[#7A80A0]">
          {subjectHomeLanguage.noScores(lang)}
        </p>
      )}

      {assignments.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h2 className="mt-1 text-sm font-bold text-[#383767]">
            {subjectHomeLanguage.assignmentScores(lang)}
          </h2>
          {assignments.map((a) => {
            const visible = canStudentViewScore(subject.data, a.assignment);
            const score = a.studentOnAssignment.score ?? 0;
            const max = a.assignment.maxScore;
            return (
              <ScoreRow
                key={a.assignment.id}
                title={a.assignment.title}
                value={visible ? `${score} / ${max}` : null}
                hiddenLabel={progressLanguage.scoreHidden(lang)}
                percent={visible ? pct(score, max) : null}
              />
            );
          })}
          {summary.hiddenCount > 0 && (
            <p className="px-1 text-xs text-[#7A80A0]">
              {gradeDataLanguage.hiddenNote(lang)}
            </p>
          )}
        </section>
      )}

      {special.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h2 className="mt-1 text-sm font-bold text-[#383767]">
            {subjectHomeLanguage.specialScores(lang)}
          </h2>
          {special.map(({ item, raw, max, score }) => {
            const hasMax = !!item.scoreOnSubject.maxScore;
            return (
              <ScoreRow
                key={item.scoreOnSubject.id}
                title={item.scoreOnSubject.title}
                icon={
                  item.scoreOnSubject.icon ? (
                    <span className="relative h-5 w-5 shrink-0">
                      <Image
                        src={item.scoreOnSubject.icon}
                        alt=""
                        fill
                        sizes="20px"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <LuStar className="shrink-0 text-[#F5A524]" aria-hidden />
                  )
                }
                value={
                  hasMax
                    ? `${score.toFixed(1)} / ${item.scoreOnSubject.weight ?? max}`
                    : score.toFixed(1)
                }
                hiddenLabel=""
                percent={hasMax ? pct(raw, max) : null}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${CARD} px-3 py-2`}>
      <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#7A80A0]">
        {label}
      </p>
      <p className="flex items-center gap-1.5 text-xl font-bold text-[#383767]">
        {icon}
        {value}
      </p>
    </div>
  );
}

function ScoreRow({
  title,
  icon,
  value,
  hiddenLabel,
  percent,
}: {
  title: string;
  icon?: React.ReactNode;
  value: string | null;
  hiddenLabel: string;
  percent: number | null;
}) {
  const color =
    percent === null || percent >= 80
      ? "#27AE60"
      : percent >= 50
        ? "#FFCD1B"
        : "#F04438";
  return (
    <div className={`${CARD} px-3 py-2`}>
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-[#383767]">
        <span className="flex min-w-0 items-center gap-1.5">
          {icon}
          <span className="line-clamp-2">{title}</span>
        </span>
        {value !== null ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs"
            style={{ backgroundColor: `${color}26` }}
          >
            {value}
          </span>
        ) : (
          <span
            data-testid="score-hidden-badge"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EEF1F6] px-2.5 py-0.5 text-xs text-[#7A80A0]"
          >
            <LuEyeOff aria-hidden />
            {hiddenLabel}
          </span>
        )}
      </div>
      {percent !== null && (
        <div className="mt-1.5 h-[7px] overflow-hidden rounded-[5px] bg-[#EEF1F6]">
          <div
            className="h-full rounded-[5px]"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}
