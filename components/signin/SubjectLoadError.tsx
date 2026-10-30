import { useRouter } from "next/router";
import { LuAlertTriangle, LuArrowLeft } from "react-icons/lu";
import { subjectDataLanguage as t } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { LanguagePill } from "./LanguagePill";

type Props = { message?: string | null; onRetry: () => void };

/** The class could not be loaded (not a bad code): retry or go back. */
export function SubjectLoadError({ message, onRetry }: Props) {
  const router = useRouter();
  const lang = useGetLanguage().data ?? "en";
  return (
    <main
      className="app-scroll hideScrollBar flex h-full w-full flex-col bg-[#F7F8FA] px-3.5 font-Anuphan"
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "calc(var(--safe-bottom) + 16px)",
      }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={t.back(lang)}
          onClick={() => router.push("/welcome")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9EEF5] text-[#383767]"
        >
          <LuArrowLeft aria-hidden />
        </button>
        <LanguagePill />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F04438]/10 text-xl text-[#F04438]">
          <LuAlertTriangle aria-hidden />
        </div>
        <h1 className="mt-3 text-lg font-extrabold text-[#383767]">
          {t.loadErrorTitle(lang)}
        </h1>
        <p className="mt-1 max-w-xs text-sm text-[#7A80A0]">
          {message || t.loadErrorDescription(lang)}
        </p>
        <button type="button" onClick={onRetry} className="chunky-btn mt-6">
          {t.retry(lang)}
        </button>
      </div>
    </main>
  );
}
