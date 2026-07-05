import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useState } from "react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import LanguageSelect from "../../../components/LanguageSelect";
import WordCloudView from "../../../components/word-cloud/WordCloudView";
import WordCloudBars from "../../../components/word-cloud/WordCloudBars";
import { useGetLanguage, useGetWordCloudResults } from "../../../react-query";
import { wordCloudLanguage } from "../../../data/languages";

function Results({ token }: { token: string }) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const results = useGetWordCloudResults({ token });
  const [view, setView] = useState<"cloud" | "bars">("cloud");
  // Which question is displayed. null = follow the teacher's live question.
  const [viewedQuestionId, setViewedQuestionId] = useState<string | null>(null);

  const data = results.data;
  const questions = data?.questions ?? [];
  const liveQuestion =
    questions.find((q) => q.id === data?.activeWordCloudId) ?? questions[0];
  const current =
    questions.find((q) => q.id === viewedQuestionId) ?? liveQuestion;
  const unavailable =
    results.isError && (results.error as any)?.statusCode === 404;

  return (
    <>
      <Head>
        <title>{wordCloudLanguage.resultsTitle(lang)}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex h-dvh w-full flex-col bg-white font-Anuphan">
        {unavailable ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <h1 className="text-xl font-bold text-icon-color">
              {wordCloudLanguage.linkUnavailable(lang)}
            </h1>
            <p className="text-sm text-icon-color/60">
              {wordCloudLanguage.linkUnavailableHint(lang)}
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
            <header className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-icon-color/60">
                  {data.title || wordCloudLanguage.resultsTitle(lang)}
                </span>
                <h1 className="truncate text-base font-bold text-icon-color sm:text-lg">
                  {current?.question}
                </h1>
                <span className="text-xs text-icon-color/60">
                  {current?.totalAnswers ?? 0} {wordCloudLanguage.answers(lang)}{" "}
                  ·{" "}
                  {data.status === "OPEN"
                    ? wordCloudLanguage.openStatus(lang)
                    : wordCloudLanguage.closedStatus(lang)}
                </span>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView("cloud")}
                    className={`w-20 rounded-full px-3 py-1 text-xs font-semibold ${
                      view === "cloud"
                        ? "bg-primary-color text-white"
                        : "bg-background-color text-icon-color"
                    }`}
                  >
                    {wordCloudLanguage.cloudView(lang)}
                  </button>
                  <button
                    onClick={() => setView("bars")}
                    className={`w-20 rounded-full px-3 py-1 text-xs font-semibold ${
                      view === "bars"
                        ? "bg-primary-color text-white"
                        : "bg-background-color text-icon-color"
                    }`}
                  >
                    {wordCloudLanguage.barsView(lang)}
                  </button>
                </div>
                <LanguageSelect />
              </div>
            </header>

            {questions.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto border-b p-2">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setViewedQuestionId(q.id)}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      q.id === current?.id
                        ? "bg-primary-color text-white"
                        : "bg-background-color text-icon-color hover:bg-gray-200"
                    }`}
                  >
                    {wordCloudLanguage.questionN(lang, i + 1)}
                    {q.id === data.activeWordCloudId &&
                      data.status === "OPEN" && (
                        <span className="rounded bg-success-color px-1 text-[9px] text-white">
                          {wordCloudLanguage.liveNow(lang)}
                        </span>
                      )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              {current &&
                (view === "cloud" ? (
                  <WordCloudView words={current.words} />
                ) : (
                  <div className="h-full overflow-auto">
                    <WordCloudBars words={current.words} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = ctx.query.token;
  if (typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token)) {
    return { notFound: true };
  }
  return { props: { token } };
};

export default Results;
