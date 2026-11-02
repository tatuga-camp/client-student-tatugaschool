import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { LuLogOut } from "react-icons/lu";
import {
  subjectHomeLanguage as t,
  subjectsPageLanguage,
} from "../../data/languages";
import { useLogout } from "../../hook/useLogout";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectByStudent,
} from "../../react-query";
import { safeGet, safeRemove } from "../../utils/safeStorage";
import { activeSubjects, groupByTerm } from "../../utils/subjectArchived";
import { LanguagePill } from "../signin/LanguagePill";
import { guideClips } from "../signin/mascotAvatars";
import MascotAvatar from "../student/MascotAvatar";
import { SubjectCard } from "../subjects/SubjectCard";

/**
 * What a student sees instead of an archived subject (spec 2026-11-02-
 * archived-subject-block): the reason, their other open subjects from every
 * term, and, for a student whose subjects are all archived, a way to join
 * another class, sign out or change language (the Me tab lives inside a
 * subject, so it is out of reach here).
 */
export function ArchivedSubjectScreen({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const lang = useGetLanguage().data ?? "en";
  const student = useGetStudent();
  const subjects = useGetSubjectByStudent({
    studentId: student.data?.id ?? "",
    allYears: true,
  });
  const logout = useLogout();
  const groups = useMemo(
    () => groupByTerm(activeSubjects(subjects.data ?? [], subjectId)),
    [subjects.data, subjectId],
  );

  // The next launch must not land here again.
  useEffect(() => {
    if (safeGet("subject_id") === subjectId) safeRemove("subject_id");
  }, [subjectId]);

  const loading = !!student.data && subjects.isPending;
  return (
    <main
      className="app-scroll hideScrollBar flex h-full w-full flex-col bg-[#F7F8FA] px-5 font-Anuphan"
      style={{
        paddingTop: "calc(var(--safe-top) + 16px)",
        paddingBottom: "calc(var(--safe-bottom) + 16px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <div className="flex flex-col items-center text-center">
          {guideClips && (
            <div className="relative h-28 w-28">
              <MascotAvatar
                clips={guideClips}
                alt=""
                id="archived-subject"
                idle={false}
                reactOnMount="sad"
                sizes="112px"
              />
            </div>
          )}
          <h1 className="mt-3 text-xl font-extrabold text-[#383767]">
            {t.archivedScreenTitle(lang)}
          </h1>
          <p className="mt-1 max-w-xs text-sm text-[#7A80A0]">
            {t.archivedScreenBody(lang)}
          </p>
        </div>

        <section className="mt-7 flex-1" aria-busy={loading || undefined}>
          {loading ? (
            <div aria-hidden className="flex flex-col gap-2">
              <div className="h-[74px] animate-pulse rounded-2xl bg-[#E3E8F0]" />
              <div className="h-[74px] animate-pulse rounded-2xl bg-[#E3E8F0]" />
            </div>
          ) : groups.length > 0 ? (
            <>
              <h2 className="mb-2 text-sm font-bold text-[#383767]">
                {t.archivedOtherSubjects(lang)}
              </h2>
              {groups.map(([term, list]) => {
                const [termNo, year] = term.split("/");
                return (
                  <div key={term} className="mb-3">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#7A80A0]">
                      {subjectsPageLanguage.termYear(lang, termNo, year)}
                    </p>
                    {list.map((s) => (
                      <SubjectCard
                        key={s.id}
                        subject={s}
                        current={false}
                        lang={lang}
                        onOpen={() => void router.push(`/subject/${s.id}`)}
                      />
                    ))}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-[#5B6280]">
                {t.archivedNoOtherSubjects(lang)}
              </p>
              <button
                type="button"
                onClick={() => void router.push("/welcome")}
                className="chunky-btn mt-4"
              >
                {t.archivedJoinAnother(lang)}
              </button>
            </div>
          )}
        </section>

        <footer className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void logout()}
            className="chunky-btn chunky-btn-secondary gap-2"
          >
            <LuLogOut aria-hidden />
            {t.archivedSignOut(lang)}
          </button>
          <LanguagePill />
        </footer>
      </div>
    </main>
  );
}
