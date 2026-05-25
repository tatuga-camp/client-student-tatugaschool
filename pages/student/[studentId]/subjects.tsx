import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { FaBookOpen, FaSearch } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import InputEducationYear from "../../../components/common/InputEducationYear";
import Layout from "../../../components/layouts/Layout";
import { defaultCanvas } from "../../../data";
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
    () =>
      subjects.data?.filter((s) => s.status === "complete").length ?? 0,
    [subjects.data],
  );

  if (student.error || !student.data) {
    return (
      <Layout>
        <main className="flex w-7/12 flex-col">
          <div className="flex w-full items-center justify-center gap-5">
            <h1 className="text-2xl font-bold">
              {subjectsPageLanguage.studentNotFound(lang)}
            </h1>
          </div>
        </main>
      </Layout>
    );
  }

  const totalCount = subjects.data?.length ?? 0;

  return (
    <>
      <Head>
        <title>{subjectsPageLanguage.title(lang)}</title>
        <meta name="description" content={subjectsPageLanguage.title(lang)} />
      </Head>
      <Layout subjectId={subjectId}>
        <div className="mx-auto mt-16 flex w-full max-w-screen-xl flex-col gap-6 px-4 md:px-6">
          {/* Hero header */}
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-6 shadow-sm md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gradient-to-tr from-sky-300/40 to-blue-300/40 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-300/40 to-sky-300/40 blur-2xl"
            />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="gradient-bg flex h-12 w-12 items-center justify-center rounded-2xl text-2xl text-white shadow-lg shadow-blue-200">
                    <FaBookOpen />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold leading-tight text-gray-800 md:text-3xl">
                      {subjectsPageLanguage.title(lang)}
                    </h1>
                    <p className="max-w-md text-sm text-gray-500 md:text-base">
                      {subjectsPageLanguage.description(lang)}
                    </p>
                  </div>
                </div>

                {totalCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary-color shadow-sm ring-1 ring-blue-100 backdrop-blur">
                      <HiSparkles className="text-sky-400" />
                      {totalCount} {subjectsPageLanguage.subjectsUnit(lang)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-success-color shadow-sm ring-1 ring-green-100 backdrop-blur">
                      ✅ {completedCount}{" "}
                      {subjectsPageLanguage.completedUnit(lang)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-error-color shadow-sm ring-1 ring-red-100 backdrop-blur">
                      📝 {totalCount - completedCount}{" "}
                      {subjectsPageLanguage.inProgressUnit(lang)}
                    </span>
                  </div>
                )}
              </div>

              {educationYear && (
                <div className="relative w-full md:w-auto">
                  <label className="mb-1 ml-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {subjectsPageLanguage.academicYear(lang)}
                  </label>
                  <div className="rounded-2xl bg-white/80 p-1 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                    <InputEducationYear
                      required={false}
                      value={educationYear as EducationYear}
                      onChange={(value) =>
                        setEducationYear(value as EducationYear)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Filter toolbar */}
          <section className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative w-full md:max-w-sm">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={subjectsPageLanguage.searchPlaceholder(lang)}
                  className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-color focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {subjectsPageLanguage.sort(lang)}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-primary-color focus:border-primary-color focus:outline-none focus:ring-2 focus:ring-blue-200"
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

            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {subjectsPageLanguage.status(lang)}
              </span>
              {(["all", "complete", "uncomplete"] as StatusFilter[]).map(
                (s) => {
                  const active = statusFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        active
                          ? "gradient-bg text-white shadow-md shadow-blue-200"
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

          {/* Subjects grid */}
          <div className="grid w-full grid-cols-1 gap-5 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.isLoading ? (
              <div className="col-span-full flex items-center justify-center py-24">
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 animate-ping rounded-full bg-sky-200 opacity-60" />
                  <div className="absolute inset-2 animate-spin rounded-full border-4 border-primary-color border-t-transparent" />
                </div>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12">
                <span className="text-6xl">
                  {search || statusFilter !== "all" ? "🔍" : "📚"}
                </span>
                <p className="text-xl font-semibold text-gray-600">
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
                <button
                  key={s.id}
                  onClick={() => router.push(`/subject/${s.id}`)}
                  className="group relative flex h-64 w-full flex-col overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/60 hover:ring-primary-color/40"
                >
                  {/* Image / gradient header */}
                  <div className="relative h-32 w-full overflow-hidden">
                    {s.backgroundImage ? (
                      <Image
                        src={s.backgroundImage}
                        alt={s.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        placeholder="blur"
                        blurDataURL={s.blurHash || defaultCanvas}
                      />
                    ) : (
                      <div className="gradient-bg h-full w-full transition-transform duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-opacity group-hover:opacity-80" />

                    {/* Code badge */}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-color shadow-sm backdrop-blur">
                      <HiSparkles className="text-sky-400" />
                      {s.code}
                    </div>

                    {/* Status indicator */}
                    {s.status === "complete" ? (
                      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-success-color/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur">
                        ✓ {subjectsPageLanguage.done(lang)}
                      </div>
                    ) : s.status === "uncomplete" ? (
                      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-error-color/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur">
                        ! {subjectsPageLanguage.todo(lang)}
                      </div>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="line-clamp-2 text-base font-bold leading-tight text-gray-800 transition-colors group-hover:text-primary-color">
                      {s.title}
                    </h2>
                    {s.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {s.description}
                      </p>
                    ) : (
                      <p className="mt-1 line-clamp-2 text-sm italic text-gray-300">
                        {subjectsPageLanguage.noDescription(lang)}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-sky-100 text-[11px]">
                          🎓
                        </span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {subjectsPageLanguage.year(lang)} {s.educationYear}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-primary-color opacity-0 transition-opacity group-hover:opacity-100">
                        {subjectsPageLanguage.enter(lang)}
                      </span>
                    </div>
                  </div>
                </button>
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
