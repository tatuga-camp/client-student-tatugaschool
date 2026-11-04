import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import {
  subjectHomeLanguage,
  welcomeDataLanguage as t,
} from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { subjectByCodeQuery } from "../../react-query/subject";
import { joinCodeForLookup } from "../../utils/joinCode";
import { describeJoinFailure, JoinFailure } from "../../utils/joinLookupError";
import { reactMascot } from "../../utils/mascot";
import { safeSet } from "../../utils/safeStorage";
import { CodeBoxes } from "./CodeBoxes";
import { WELCOME_REACT_ID } from "./WelcomeMascots";

export function JoinWithCode() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const lang = useGetLanguage().data ?? "en";
  const [code, setCode] = useState("");
  // Why the last Join didn't go through: a wrong code, an archived class, or
  // a request that failed. The detail line is there for a screenshot.
  const [failure, setFailure] = useState<JoinFailure | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [navFailed, setNavFailed] = useState(false);

  const join = async () => {
    if (code.length < 6 || busy) return;
    setBusy(true);
    setNavFailed(false);
    const lookup = joinCodeForLookup(code);
    try {
      await queryClient.fetchQuery({
        ...subjectByCodeQuery(lookup),
        retry: false,
      });
    } catch (error) {
      reactMascot(WELCOME_REACT_ID, "sad");
      setShakeKey((n) => n + 1);
      setFailure(describeJoinFailure(error, lookup, new Date()));
      setBusy(false);
      return;
    }
    safeSet("subject_code", lookup);
    try {
      await router.push("/?subject_code=" + lookup);
    } catch {
      setNavFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const headline = failure
    ? failure.kind === "archived"
      ? subjectHomeLanguage.archivedJoinInline(lang)
      : failure.kind === "not-found"
        ? t.notFound(lang)
        : t.loadFailed(lang)
    : navFailed
      ? t.joinFailed(lang)
      : "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        join();
      }}
    >
      <h1 className="text-xl font-extrabold text-[#383767]">{t.title(lang)}</h1>
      <p className="mb-4 mt-1 text-sm text-[#7A80A0]">{t.description(lang)}</p>
      <CodeBoxes
        length={6}
        mode="alnum"
        value={code}
        onChange={(v) => {
          setCode(v);
          setFailure(null);
        }}
        invalid={!!failure}
        shakeKey={shakeKey}
        ariaLabel={t.codeLabel(lang)}
        autoFocus
      />
      <div role="alert" className="mt-2 min-h-[20px] text-center">
        <p className="text-sm font-semibold text-[#F04438]">{headline}</p>
        {failure && (
          <>
            {/* Plain text, selectable: what the server answered, which code,
                when. Enough for a screenshot to be diagnosed. */}
            <p
              className="mt-1 select-all break-words font-mono text-[11px] leading-4 text-[#7A80A0]"
              data-testid="join-failure-detail"
            >
              {failure.detail}
            </p>
            {failure.kind === "failed" && (
              <p className="mt-1 text-xs text-[#7A80A0]">
                {t.screenshotHint(lang)}
              </p>
            )}
          </>
        )}
      </div>
      <button
        type="submit"
        disabled={code.length < 6 || busy}
        className="chunky-btn mt-2 w-full disabled:opacity-50"
      >
        {busy ? t.joining(lang) : t.join(lang)}
        <LuArrowRight />
      </button>
      <p className="mt-4 text-center text-xs text-[#7A80A0]">{t.hint(lang)}</p>
    </form>
  );
}
