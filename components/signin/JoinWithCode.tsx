import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { welcomeDataLanguage as t } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { subjectByCodeQuery } from "../../react-query/subject";
import { joinCodeForLookup } from "../../utils/joinCode";
import { reactMascot } from "../../utils/mascot";
import { safeSet } from "../../utils/safeStorage";
import { CodeBoxes } from "./CodeBoxes";

// Matches the id WelcomeMascots gives the centre mascot.
const REACT_MASCOT_ID = "welcome-1";

export function JoinWithCode() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const lang = useGetLanguage().data ?? "en";
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const join = async () => {
    if (code.length < 6 || busy) return;
    setBusy(true);
    const lookup = joinCodeForLookup(code);
    try {
      await queryClient.fetchQuery({
        ...subjectByCodeQuery(lookup),
        retry: false,
      });
    } catch {
      reactMascot(REACT_MASCOT_ID, "sad");
      setShakeKey((n) => n + 1);
      setInvalid(true);
      setBusy(false);
      return;
    }
    safeSet("subject_code", lookup);
    try {
      await router.push("/?subject_code=" + lookup);
    } finally {
      setBusy(false);
    }
  };

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
          setInvalid(false);
        }}
        invalid={invalid}
        shakeKey={shakeKey}
        ariaLabel={t.codeLabel(lang)}
        autoFocus
      />
      <p
        role="alert"
        className="mt-2 min-h-[20px] text-center text-sm font-semibold text-[#F04438]"
      >
        {invalid ? t.notFound(lang) : ""}
      </p>
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
