import React, { forwardRef } from "react";
import { LuChevronLeft } from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { TabHeader } from "../app/TabHeader";

type Props = {
  /** The subject's title. */
  title: string;
  lang: Language;
  onBack: () => void;
};

/** The sky band of a detail page: chunky back button + the subject title. */
const DetailHeader = forwardRef<HTMLButtonElement, Props>(function DetailHeader(
  { title, lang, onBack },
  backRef,
) {
  return (
    <TabHeader
      title={title}
      leading={
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          aria-label={homeLanguage.back(lang)}
          className="grid h-11 w-11 place-items-center rounded-xl border-2 border-b-4 border-[#E3E8F0] bg-white text-xl text-icon-color active:translate-y-0.5 active:border-b-2"
        >
          <LuChevronLeft aria-hidden />
        </button>
      }
    />
  );
});

export default DetailHeader;
