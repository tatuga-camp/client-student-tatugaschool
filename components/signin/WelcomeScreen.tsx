import Image from "next/image";
import { defaultCanvas } from "../../data";
import { useTimeOfDay } from "../../hook/useTimeOfDay";
import { useGetLanguage, useUpdateLanguage } from "../../react-query";
import { SchoolyardScene } from "../app/scene/SchoolyardScene";
import { JoinWithCode } from "./JoinWithCode";
import { WelcomeMascots } from "./WelcomeMascots";

const LANGS = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
] as const;

function LanguageToggle() {
  const language = useGetLanguage();
  const update = useUpdateLanguage();
  return (
    <div className="flex rounded-[9px] bg-[#E9EEF5] p-0.5 text-[11px] font-bold">
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => update.mutate(value)}
          aria-pressed={language.data === value}
          className={`rounded-[7px] px-2.5 py-1 ${
            language.data === value
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

export function WelcomeScreen() {
  const tod = useTimeOfDay();
  return (
    <div className="app-scroll relative h-full w-full bg-[#F7F8FA] font-Anuphan">
      <div className="relative min-h-full">
        <SchoolyardScene
          variant="phone"
          period={tod?.period ?? "morning"}
          className="absolute inset-x-0 top-0 h-[300px] w-full"
        />
        <div
          className="absolute inset-x-3.5 top-0 z-[5] flex items-center justify-between"
          style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm">
            <span className="relative h-5 w-5 overflow-hidden rounded-md">
              <Image
                src="/favicon.ico"
                placeholder="blur"
                blurDataURL={defaultCanvas}
                fill
                sizes="20px"
                alt=""
              />
            </span>
            <span className="text-xs font-extrabold uppercase text-[#2C7CD1]">
              Tatuga School
            </span>
          </span>
          <LanguageToggle />
        </div>
        <WelcomeMascots />
        <main
          className="relative z-[3] mt-[284px] min-h-[calc(100%-284px)] rounded-t-3xl bg-white px-[18px] pt-[18px]"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}
        >
          <JoinWithCode />
        </main>
      </div>
    </div>
  );
}
