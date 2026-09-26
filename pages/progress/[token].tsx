import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useMemo, useState } from "react";
import { TbColumns3, TbLayoutColumns, TbSearch } from "react-icons/tb";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LanguageSelect from "../../components/LanguageSelect";
import ProgressTable from "../../components/progress/ProgressTable";
import { progressLanguage } from "../../data/languages";
import { useGetLanguage, useGetPublicProgress } from "../../react-query";
import { GetPublicProgressByTokenService } from "../../services";
import {
  buildProgressColumns,
  filterStudents,
  isUnavailableError,
  ProgressViewMode,
} from "../../utils";

// Social crawlers (LINE, Facebook) don't run JS, so the link preview is
// built from subject info fetched in getServerSideProps.
type ShareMeta = {
  title: string;
  className: string;
  educationYear: string;
  image: string | null;
};

type Props = {
  token: string;
  origin: string;
  share: ShareMeta | null;
};

function PublicProgressPage({ token, origin, share }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const progress = useGetPublicProgress({ token });
  const [mode, setMode] = useState<ProgressViewMode>("assignment");
  const [collapsedTags, setCollapsedTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const data = progress.data;
  const { segments, columns } = useMemo(
    () =>
      data
        ? buildProgressColumns(data, mode, collapsedTags)
        : { segments: [], columns: [] },
    [data, mode, collapsedTags],
  );
  const students = useMemo(
    () => (data ? filterStudents(data.students, query) : []),
    [data, query],
  );

  const toggleGroup = (tag: string) =>
    setCollapsedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  // A revoked link must replace any stale data already on screen.
  const unavailable = progress.isError && isUnavailableError(progress.error);

  const subjectTitle = data?.subject.title ?? share?.title;
  const shareTitle = share
    ? `${share.title} · ${progressLanguage.pageTitle("en")}`
    : `${progressLanguage.pageTitle("en")} · Tatuga School`;
  const shareDescription = share
    ? `Class ${share.className} · ${share.educationYear} — read-only progress shared by the teacher`
    : "Read-only class progress shared by the teacher";
  const shareImage = share?.image ?? `${origin}/icons/icon-512.png`;

  return (
    <>
      <Head>
        <title>
          {subjectTitle
            ? `${subjectTitle} · ${progressLanguage.pageTitle(lang)}`
            : progressLanguage.pageTitle(lang)}
        </title>
        <meta name="robots" content="noindex" />
        <meta name="description" content={shareDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tatuga School" />
        <meta property="og:url" content={`${origin}/progress/${token}`} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={shareImage} />
        <meta
          name="twitter:card"
          content={share?.image ? "summary_large_image" : "summary"}
        />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={shareImage} />
      </Head>
      <main className="min-h-dvh w-full bg-background-color font-Anuphan">
        {unavailable ? (
          <div className="flex min-h-dvh flex-col items-center justify-center gap-2 p-6 text-center">
            <h1 className="text-xl font-bold text-icon-color">
              {progressLanguage.linkUnavailable(lang)}
            </h1>
            <p className="text-sm text-icon-color/60">
              {progressLanguage.linkUnavailableHint(lang)}
            </p>
          </div>
        ) : !data && progress.isError ? (
          <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-icon-color">
              {progressLanguage.loadFailed(lang)}
            </p>
            <button
              type="button"
              onClick={() => progress.refetch()}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-icon-color hover:bg-background-color"
            >
              {progressLanguage.retry(lang)}
            </button>
          </div>
        ) : !data ? (
          <div className="flex min-h-dvh items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-5 md:px-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-icon-color/60">
                    {data.subject.className} · {data.subject.educationYear}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">
                    {progressLanguage.readOnly(lang)}
                  </span>
                </div>
                <h1 className="truncate text-2xl font-semibold text-icon-color md:text-3xl">
                  {data.subject.title}
                </h1>
                <span className="text-xs text-gray-400">
                  {progressLanguage.updated(lang)}{" "}
                  {new Date(data.updatedAt).toLocaleTimeString(
                    lang === "th" ? "th-TH" : "en-GB",
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-icon-color">
                  <TbSearch className="text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={progressLanguage.search(lang)}
                    className="w-40 bg-transparent outline-none placeholder:text-gray-400"
                  />
                </label>
                <div className="flex items-center gap-1 rounded-2xl bg-white p-1 ring-1 ring-gray-200">
                  {(
                    [
                      { value: "assignment", label: progressLanguage.byAssignment(lang), icon: <TbColumns3 /> },
                      { value: "tag", label: progressLanguage.byTagGroup(lang), icon: <TbLayoutColumns /> },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={mode === option.value}
                      onClick={() => setMode(option.value)}
                      className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-semibold transition-colors ${
                        mode === option.value
                          ? "bg-primary-color text-white"
                          : "text-icon-color hover:bg-gray-100"
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
                <LanguageSelect className="w-auto max-w-[10.5rem] shrink-0" />
              </div>
            </header>

            {data.columns.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                {progressLanguage.noWorkYet(lang)}
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                {progressLanguage.noMatch(lang)}
              </div>
            ) : (
              <ProgressTable
                data={data}
                segments={segments}
                columns={columns}
                students={students}
                language={lang}
                onToggleGroup={toggleGroup}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const token = ctx.query.token;
  if (typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token)) {
    return { notFound: true };
  }

  const forwardedProto = ctx.req.headers["x-forwarded-proto"];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)
      ?.split(",")[0]
      .trim() || "http";
  const origin = `${proto}://${ctx.req.headers.host}`;

  // Best effort: a revoked link or slow API still renders the page (the client
  // shows its own error state) with a generic preview.
  let share: ShareMeta | null = null;
  try {
    const { subject } = await GetPublicProgressByTokenService({
      token,
      timeout: 3000,
    });
    share = {
      title: subject.title,
      className: subject.className,
      educationYear: subject.educationYear,
      image: subject.backgroundImage
        ? new URL(subject.backgroundImage, origin).toString()
        : null,
    };
  } catch {}

  return { props: { token, origin, share } };
};

export default PublicProgressPage;
