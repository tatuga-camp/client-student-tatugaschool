import { LuHash } from "react-icons/lu";
import { tagsDataLanguage } from "../../data/languages/classwork";
import { subjectHomeLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { ClassworkFilter } from "../../utils";

type StatusProps = {
  lang: Language;
  filter: ClassworkFilter;
  onFilter: (next: ClassworkFilter) => void;
  counts: Record<ClassworkFilter, number>;
};

const STATUS_KEYS: ClassworkFilter[] = ["all", "todo", "submitted", "graded"];

const chipBase =
  "relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-2 font-bold transition-colors after:absolute after:inset-x-0 after:content-['']";
const chipOn = "border-primary-color bg-primary-color text-white";
const chipOff = "border-[#E3E8F0] bg-white text-[#5B6280]";

/** All / To do / Submitted / Graded with counts; scrolls sideways on its own. */
export function StatusChips({ lang, filter, onFilter, counts }: StatusProps) {
  const label = (key: ClassworkFilter) =>
    key === "all"
      ? subjectHomeLanguage.filterAll(lang)
      : key === "todo"
        ? subjectHomeLanguage.filterTodo(lang)
        : key === "submitted"
          ? subjectHomeLanguage.filterSubmitted(lang)
          : subjectHomeLanguage.filterGraded(lang);
  return (
    <ul
      data-no-swipe
      className="hideScrollBar -mb-1 -mt-0.5 flex gap-1.5 overflow-x-auto px-3 pb-2.5 pt-1"
    >
      {STATUS_KEYS.map((key) => {
        const on = filter === key;
        return (
          <li key={key} className="shrink-0">
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onFilter(key)}
              className={`${chipBase} min-h-9 px-3 text-sm after:-inset-y-1 ${on ? chipOn : chipOff}`}
              style={on ? { boxShadow: "0 3px 0 #275d96" } : undefined}
            >
              {label(key)}
              <b className="opacity-65">{counts[key]}</b>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type TagProps = {
  lang: Language;
  tags: string[];
  counts: Record<string, number>;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  total: number;
};

/** Tag filter: "All" clears; tags toggle (any selected tag matches). */
export function TagChips({
  lang,
  tags,
  counts,
  selected,
  onChange,
  total,
}: TagProps) {
  if (tags.length === 0) return null;
  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };
  const allOn = selected.size === 0;
  return (
    <ul
      data-no-swipe
      className="hideScrollBar -my-1.5 flex gap-1.5 overflow-x-auto px-3 py-1.5"
    >
      <li className="shrink-0">
        <button
          type="button"
          aria-pressed={allOn}
          onClick={() => onChange(new Set())}
          className={`${chipBase} min-h-8 px-2.5 text-xs after:-inset-y-1.5 ${allOn ? chipOn : chipOff}`}
        >
          <LuHash aria-hidden />
          {tagsDataLanguage.showAll(lang)} · {total}
        </button>
      </li>
      {tags.map((tag) => {
        const key = tag.toLowerCase();
        const on = selected.has(key);
        return (
          <li key={tag} className="shrink-0">
            <button
              type="button"
              aria-pressed={on}
              onClick={() => toggle(key)}
              className={`${chipBase} min-h-8 px-2.5 text-xs after:-inset-y-1.5 ${on ? chipOn : chipOff}`}
            >
              <LuHash aria-hidden />
              <span className="max-w-[10rem] truncate">{tag}</span> ·{" "}
              {counts[key] ?? 0}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
