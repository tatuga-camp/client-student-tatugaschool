import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { FaBookOpen, FaSearch } from "react-icons/fa";
import InputEducationYear from "../../../components/common/InputEducationYear";
import Layout from "../../../components/layouts/Layout";
import SubjectListCard from "../../../components/student/SubjectListCard";
import { subjectsPageLanguage } from "../../../data/languages";
import { EducationYear } from "../../../interfaces";
import { useGetLanguage, useGetStudent } from "../../../react-query";
import {
  useGetSubjectById,
  useGetSubjectByStudent,
} from "../../../react-query/subject";

type SortOption = "default" | "newest" | "oldest" | "az" | "za";
type StatusFilter = "all" | "complete" | "uncomplete";

function Index({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const language = useGetLanguage();
  const student = useGetStudent();
  const subject = useGetSubjectById({ id: subjectId });

  const [educationYear, setEducationYear] = React.useState<EducationYear>();
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  React.useEffect(() => {
    if (subject.data) {
      setEducationYear(subject.data.educationYear as EducationYear);
    }
  }, [subject.data]);

  const subjects = useGetSubjectByStudent({
    studentId: student.data?.id as string,
    educationYear: educationYear as EducationYear,
  });

  const lang = (language.data ?? "en") as "th" | "en";

  const filteredSubjects = React.useMemo(() => {
    if (!subjects.data) return [];
    const q = search.trim().toLowerCase();
    const filtered = subjects.data.filter((s) => {
      const matchSearch =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.educationYear.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
        );
        break;
      case "az":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        sorted.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return sorted;
  }, [subjects.data, search, sortBy, statusFilter]);

  const completedCount = React.useMemo(
    () => subjects.data?.filter((s) => s.status === "complete").length ?? 0,
    [subjects.data],
  );

  if (student.error || !student.data) {
    return (
      <Layout>
        <main className="mx-auto flex w-full max-w-3xl flex-col px-4">
          <div className="flex w-full items-center justify-center gap-5 py-16">
            <h1 className="text-2xl font-bold">
              {subjectsPageLanguage.studentNotFound(lang)}
            </h1>
          </div>
        </main>
      </Layout>
    );
  }

  const totalCount = subjects.data?.length ?? 0;
  const inProgressCount = Math.max(0, totalCount - completedCount);

  return (
    <>
      <Head>
        <title>{subjectsPageLanguage.title(lang)}</title>
        <meta name="description" content={subjectsPageLanguage.title(lang)} />
      </Head>
      <Layout subjectId={subjectId}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 pt-16 sm:px-4 md:pt-20">
          {/* Compact brand header — mirrors SubjectSummaryCard */}
          <header className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="relative bg-primary-color px-4 py-4 sm:px-5 sm:py-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-color via-primary-color to-secondary-color" />
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl text-white ring-1 ring-white/30">
                    <FaBookOpen />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h1 className="text-lg font-semibold leading-snug text-white sm:text-xl">
                      {subjectsPageLanguage.title(lang)}
                    </h1>
                    <p className="text-sm text-white/90">
                      {subjectsPageLanguage.description(lang)}
                    </p>
                    {totalCount > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary-color-focus shadow-sm">
                          {totalCount} {subjectsPageLanguage.subjectsUnit(lang)}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/40">
                          {completedCount}{" "}
                          {subjectsPageLanguage.completedUnit(lang)}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/40">
                          {inProgressCount}{" "}
                          {subjectsPageLanguage.inProgressUnit(lang)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {educationYear ? (
                  <div className="w-full sm:w-auto sm:min-w-[12rem]">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-white/80">
                      {subjectsPageLanguage.academicYear(lang)}
                    </label>
                    <div className="rounded-xl bg-white p-1 shadow-sm">
                      <InputEducationYear
                        required={false}
                        value={educationYear as EducationYear}
                        onChange={(value) =>
                          setEducationYear(value as EducationYear)
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {/* Filter toolbar — wrapping chips, teacher tokens */}
          <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={subjectsPageLanguage.searchPlaceholder(lang)}
                  className="w-full rounded-full border border-gray-200 bg-background-color py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-color focus:outline-none focus:ring-2 focus:ring-primary-color/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {subjectsPageLanguage.sort(lang)}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary-color focus:outline-none focus:ring-2 focus:ring-primary-color/20"
                >
                  {(
                    ["default", "newest", "oldest", "az", "za"] as SortOption[]
                  ).map((opt) => (
                    <option key={opt} value={opt}>
                      {subjectsPageLanguage.sortLabels[lang][opt]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {subjectsPageLanguage.status(lang)}
              </span>
              {(["all", "complete", "uncomplete"] as StatusFilter[]).map(
                (s) => {
                  const active = statusFilter === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-primary-color text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary-color"
                      }`}
                    >
                      {subjectsPageLanguage.statusLabels[lang][s]}
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {/* Subject list */}
          <div className="flex w-full flex-col gap-3 pb-4">
            {subjects.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-color border-t-transparent" />
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14">
                <p className="text-lg font-semibold text-gray-700">
                  {search || statusFilter !== "all"
                    ? subjectsPageLanguage.noMatch(lang)
                    : subjectsPageLanguage.noSubjects(lang)}
                </p>
                <p className="max-w-xs text-center text-sm text-gray-400">
                  {search || statusFilter !== "all"
                    ? subjectsPageLanguage.noMatchHint(lang)
                    : subjectsPageLanguage.noSubjectsHint(lang)}
                </p>
              </div>
            ) : (
              filteredSubjects.map((s) => (
                <SubjectListCard
                  key={s.id}
                  subject={s}
                  onOpen={() => router.push(`/subject/${s.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query;

  return {
    props: {
      subjectId: query.subject_id ?? "",
    },
  };
};
