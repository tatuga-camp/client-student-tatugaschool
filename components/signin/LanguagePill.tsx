import { useState } from "react";
import { useGetLanguage, useUpdateLanguage } from "../../react-query";

const LANGS = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
] as const;

/** TH/EN toggle for the sign-in screens. */
export function LanguagePill() {
  const language = useGetLanguage();
  const update = useUpdateLanguage();
  const [picked, setPicked] = useState<string | null>(null);
  const current = picked ?? language.data ?? "en";
  return (
    <div className="flex rounded-[9px] bg-[#E9EEF5] p-0.5 text-[11px] font-bold">
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            setPicked(value);
            update.mutate(value);
          }}
          aria-pressed={current === value}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[7px] px-2.5 ${
            current === value
              ? "bg-white text-[#2C7CD1] shadow-[0_1px_0_#D6DEEA]"
              : "text-[#7A80A0]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
