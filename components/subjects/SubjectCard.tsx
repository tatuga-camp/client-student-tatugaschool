import Image from "next/image";
import { LuBookOpen, LuCheck } from "react-icons/lu";
import { defaultCanvas } from "../../data";
import { subjectsPageLanguage } from "../../data/languages";
import { Language, Subject } from "../../interfaces";

export type SubjectWithStatus = Subject & {
  status: "complete" | "uncomplete";
};

type Props = {
  subject: SubjectWithStatus;
  current: boolean;
  lang: Language;
  onOpen: () => void;
};

/** Horizontal subject card: 70px cover, title, description, code and status. */
export function SubjectCard({ subject, current, lang, onOpen }: Props) {
  const done = subject.status === "complete";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={current ? "true" : undefined}
      className={`mb-2 flex w-full overflow-hidden rounded-2xl border-2 border-b-4 bg-white text-left font-Anuphan [-webkit-tap-highlight-color:transparent] active:translate-y-px active:border-b-2 ${
        current ? "border-primary-color" : "border-[#E3E8F0]"
      }`}
    >
      <div
        className="relative grid w-[70px] shrink-0 place-items-center text-white/90"
        style={{
          background: "linear-gradient(135deg, #569DF8, #2C7CD1)",
        }}
      >
        {subject.backgroundImage ? (
          <Image
            src={subject.backgroundImage}
            alt=""
            fill
            className="object-cover"
            placeholder="blur"
            blurDataURL={subject.blurHash || defaultCanvas}
            sizes="70px"
          />
        ) : (
          <LuBookOpen aria-hidden size={26} />
        )}
        {current && (
          <span className="absolute inset-x-1 bottom-1 rounded-md bg-primary-color py-px text-center text-[8px] font-bold tracking-[.4px] text-white">
            {subjectsPageLanguage.current(lang)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 px-2.5 py-2">
        <div className="truncate text-[13px] font-bold text-[#383767]">
          {subject.title}
        </div>
        <div className="mb-1 mt-px truncate text-[11px] text-[#7A80A0]">
          {subject.description || subjectsPageLanguage.noDescription(lang)}
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-[7px] bg-[#E8F1FC] px-1.5 py-px text-[10px] font-bold text-primary-color">
            {subject.code}
          </span>
          {done ? (
            <span className="inline-flex items-center gap-0.5 rounded-[7px] bg-[#E3F6EA] px-1.5 py-px text-[10px] font-bold text-success-color">
              <LuCheck aria-hidden size={10} />
              {subjectsPageLanguage.done(lang)}
            </span>
          ) : (
            <span className="rounded-[7px] bg-[#FFF5CC] px-1.5 py-px text-[10px] font-bold text-[#8A6A00]">
              {subjectsPageLanguage.todo(lang)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
