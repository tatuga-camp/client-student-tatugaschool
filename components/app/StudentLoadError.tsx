import { useRouter } from "next/router";
import { LuLogIn, LuUserX, LuWifiOff } from "react-icons/lu";
import { homeLanguage as t } from "../../data/languages";
import type { Language } from "../../interfaces";
import { removeAccessToken, removeRefreshToken } from "../../utils";
import { studentLoadFailure } from "../../utils/studentLoadFailure";

type Props = {
  error: unknown;
  lang: Language;
  retrying: boolean;
  onRetry: () => void;
};

/**
 * The signed-in student could not be loaded. Says which of three things
 * happened, and offers the one action that fixes it: sign in again for a
 * lost session or a removed student, retry for a failed load.
 */
export function StudentLoadError({ error, lang, retrying, onRetry }: Props) {
  const router = useRouter();
  const kind = studentLoadFailure(error);

  const signInAgain = () => {
    removeAccessToken();
    removeRefreshToken();
    void router.push("/welcome");
  };

  const copy = {
    session: {
      icon: <LuLogIn aria-hidden />,
      title: t.sessionEndedTitle(lang),
      body: t.sessionEndedBody(lang),
    },
    "not-found": {
      icon: <LuUserX aria-hidden />,
      title: t.studentNotFound(lang),
      body: t.studentNotFoundBody(lang),
    },
    load: {
      icon: <LuWifiOff aria-hidden />,
      title: t.studentLoadFailedTitle(lang),
      body: t.loadFailed(lang),
    },
  }[kind];

  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center bg-background-color px-6 text-center font-Anuphan"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-color/10 text-xl text-error-color">
        {copy.icon}
      </div>
      <h1 className="mt-3 text-lg font-extrabold text-icon-color">
        {copy.title}
      </h1>
      <p className="mt-1 max-w-xs text-sm text-icon-color/70">{copy.body}</p>
      {kind === "load" ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="chunky-btn mt-6 disabled:opacity-60"
        >
          {t.retry(lang)}
        </button>
      ) : (
        <button type="button" onClick={signInAgain} className="chunky-btn mt-6">
          {t.signInAgain(lang)}
        </button>
      )}
    </div>
  );
}
