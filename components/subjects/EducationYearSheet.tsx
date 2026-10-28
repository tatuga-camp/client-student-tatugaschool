import React, { useEffect, useState } from "react";
import { subjectsPageLanguage } from "../../data/languages";
import { EducationYear, Language } from "../../interfaces";
import { Sheet } from "../app/Sheet";

type Props = {
  open: boolean;
  onClose: () => void;
  value: EducationYear;
  onChange: (value: EducationYear) => void;
  lang: Language;
};

const TERM_OPTIONS = Array.from({ length: 10 }, (_, i) => String(i + 1));

const selectClass =
  "h-14 w-full rounded-2xl border-2 border-b-4 border-[#E3E8F0] bg-white px-3 text-center text-[20px] font-bold text-[#383767] focus:border-primary-color focus:outline-none";

/** Term (1-10) and year (+-10) pickers; Done applies both at once. */
export function EducationYearSheet({
  open,
  onClose,
  value,
  onChange,
  lang,
}: Props) {
  const [term, setTerm] = useState("1");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (!open) return;
    const [t, y] = value.split("/");
    setTerm(t || "1");
    setYear(y || String(new Date().getFullYear()));
  }, [open, value]);

  const current = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => String(current - 10 + i));
  // Keep a stored year outside the +-10 window selectable.
  const yearOptions = years.includes(year) ? years : [...years, year];
  const terms = TERM_OPTIONS.includes(term)
    ? TERM_OPTIONS
    : [...TERM_OPTIONS, term];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      ariaLabel={subjectsPageLanguage.pickTermYear(lang)}
    >
      <h2 className="pb-3 text-[16px] font-bold text-[#383767]">
        {subjectsPageLanguage.pickTermYear(lang)}
      </h2>
      <div className="flex items-end gap-3 font-Anuphan">
        <label className="flex w-24 flex-col gap-1 text-[11px] font-bold text-[#7A80A0]">
          {subjectsPageLanguage.term(lang)}
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={selectClass}
          >
            {terms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-[11px] font-bold text-[#7A80A0]">
          {subjectsPageLanguage.yearLabel(lang)}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectClass}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          onChange(`${term}/${year}` as EducationYear);
          onClose();
        }}
        className="mt-5 h-12 w-full rounded-2xl bg-primary-color font-Anuphan text-[15px] font-bold text-white shadow-[0_4px_0_#275d96] active:translate-y-px active:shadow-[0_3px_0_#275d96]"
      >
        {subjectsPageLanguage.doneButton(lang)}
      </button>
    </Sheet>
  );
}
