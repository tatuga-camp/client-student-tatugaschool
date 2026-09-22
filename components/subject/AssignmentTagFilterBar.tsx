import React from "react";
import { tagsDataLanguage } from "../../data/languages/classwork";
import { useGetLanguage } from "../../react-query";

type Props = {
  uniqueTags: string[];
  counts: Record<string, number>;
  selectedTags: Set<string>;
  onChange: (next: Set<string>) => void;
  totalCount: number;
};

function AssignmentTagFilterBar({
  uniqueTags,
  counts,
  selectedTags,
  onChange,
  totalCount,
}: Props) {
  const language = useGetLanguage();
  if (uniqueTags.length === 0) return null;
  const showAllActive = selectedTags.size === 0;

  function toggle(tag: string) {
    const key = tag.toLowerCase();
    const next = new Set(selectedTags);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  return (
    <ul className="flex w-full flex-wrap items-center gap-2 py-1">
      <li>
        <button
          type="button"
          onClick={() => onChange(new Set())}
          className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            showAllActive
              ? "border-primary-color bg-primary-color text-white"
              : "border-primary-color/40 bg-white text-primary-color hover:bg-primary-color/10"
          }`}
        >
          <span>{tagsDataLanguage.showAll(language.data ?? "en")}</span>
          <span className="opacity-80">({totalCount})</span>
        </button>
      </li>
      {uniqueTags.map((tag) => {
        const key = tag.toLowerCase();
        const active = selectedTags.has(key);
        return (
          <li key={tag}>
            <button
              type="button"
              onClick={() => toggle(tag)}
              className={`inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary-color bg-primary-color text-white"
                  : "border-primary-color/40 bg-white text-primary-color hover:bg-primary-color/10"
              }`}
            >
              <span className="max-w-[10rem] truncate sm:max-w-[14rem]">
                {tag}
              </span>
              <span className="opacity-80">({counts[key] ?? 0})</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default AssignmentTagFilterBar;
