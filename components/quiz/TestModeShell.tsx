import Head from "next/head";
import React from "react";
import { MdVisibility } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { useQuizIntegrity } from "../../hook/useQuizIntegrity";
import { useGetLanguage } from "../../react-query";
import { clipboardPolicy } from "../../utils/quizIntegrity";

type Props = { soaId: string; enabled: boolean; children: React.ReactNode };

/** Wraps quiz-taking. With Test mode off it renders children unchanged. */
export default function TestModeShell({ soaId, enabled, children }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const { report, awayNoticeMs, dismissAwayNotice } = useQuizIntegrity(soaId, enabled);

  if (!enabled) return <>{children}</>;

  const handle = (kind: "copy" | "paste" | "contextmenu") => (e: React.SyntheticEvent) => {
    const policy = clipboardPolicy(kind, e.target as Element | null);
    if (policy.preventDefault) e.preventDefault();
    if (policy.report) report(policy.report);
  };

  return (
    <div
      translate="no"
      className="notranslate"
      onCopy={handle("copy")}
      onPaste={handle("paste")}
      onContextMenu={handle("contextmenu")}
    >
      <Head>
        <meta name="google" content="notranslate" />
      </Head>
      {children}
      {awayNoticeMs !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="alertdialog">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center font-Anuphan shadow-xl">
            <MdVisibility className="mx-auto text-4xl text-warning-color" />
            <h2 className="mt-2 text-lg font-semibold text-icon-color">{quizLanguage.awayTitle(lang)}</h2>
            <p className="mt-1 text-sm text-icon-color/70">
              {quizLanguage.awayBody(lang, Math.round(awayNoticeMs / 1000))}
            </p>
            <button
              type="button"
              onClick={dismissAwayNotice}
              className="mt-5 w-full rounded-2xl bg-primary-color py-3 font-medium text-white"
            >
              {quizLanguage.backToQuiz(lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
