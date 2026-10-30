import { useMemo } from "react";
import { LuListChecks } from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import {
  useGetAssignments,
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import { upNext, weekProgress } from "../../utils/classworkGroups";
import { countClassworkBuckets } from "../../utils/subjectHome";
import { NotificationPromptSheet } from "../app/NotificationPromptSheet";
import {
  type TabPaneProps,
  useShellNav,
  useShellRoute,
} from "../app/shell/useShellRoute";
import { HomeScene } from "./HomeScene";
import { UpNextList } from "./UpNextList";
import { WeekProgressCard } from "./WeekProgressCard";

const UP_NEXT_MAX = 5;

/** Home: the schoolyard and mascot, this week's progress and what is next. */
export default function HomeTab({ subjectId, active }: TabPaneProps) {
  const lang = useGetLanguage().data ?? "en";
  const student = useGetStudent();
  const subject = useGetSubjectById({ id: subjectId });
  const assignments = useGetAssignments(
    { subjectId },
    { refetchInterval: active ? undefined : false },
  );
  const { openAssignment } = useShellNav();
  // A deep-linked detail page keeps Home "active" behind it.
  const detailOpen = !!useShellRoute()?.detail;
  const inOrder = subject.data?.allowStudentDoneAssignmentInOrder ?? false;

  const { now, progress, left, todo } = useMemo(() => {
    const now = new Date();
    const items = assignments.data ?? [];
    return {
      now,
      progress: weekProgress(items, now),
      left: upNext(items, now, inOrder),
      todo: countClassworkBuckets(items).todo,
    };
  }, [assignments.data, inOrder]);
  const next = left.slice(0, UP_NEXT_MAX);

  return (
    <div className="app-scroll h-full w-full font-Anuphan">
      <div className="relative min-h-full pb-6">
        <HomeScene
          subjectId={subjectId}
          student={student.data}
          active={active}
        />
        <div className="pointer-events-none relative z-[3] px-3 pt-[300px]">
          {/* The padding covers the scene; only the content takes taps. */}
          <div className="pointer-events-auto">
            {assignments.isSuccess ? (
              <>
                <WeekProgressCard
                  lang={lang}
                  done={progress.done}
                  total={progress.total}
                />
                {left.length === 0 ? (
                  <p className="mx-0.5 mt-4 text-center text-[13px] font-bold text-icon-color">
                    {homeLanguage.allDone(lang)}
                  </p>
                ) : (
                  <>
                    <h2 className="mx-0.5 mb-1.5 mt-2.5 flex items-center gap-1.5 text-[13px] font-bold text-icon-color">
                      <LuListChecks aria-hidden size={14} />
                      {homeLanguage.assignmentsLeft(lang, todo)}
                    </h2>
                    <UpNextList
                      items={next}
                      lang={lang}
                      now={now}
                      onOpen={openAssignment}
                    />
                  </>
                )}
              </>
            ) : assignments.isError ? (
              <p
                role="alert"
                className="mx-0.5 mt-4 text-center text-[13px] font-bold text-icon-color"
              >
                {homeLanguage.loadError(lang)}
              </p>
            ) : (
              <div aria-hidden className="animate-pulse">
                <div className="h-[58px] rounded-[18px] bg-[#E3E8F0]" />
                <div className="mt-4 h-[52px] rounded-[16px] bg-[#E3E8F0]" />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Asks on its own only while Home is on screen, uncovered. */}
      <NotificationPromptSheet auto={active && !detailOpen} />
    </div>
  );
}
