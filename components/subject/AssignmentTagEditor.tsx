import React from "react";

type Props = {
  tags: string[];
  size?: "sm" | "md";
};

export function TagChipList({ tags, size = "sm" }: Props) {
  if (!tags || tags.length === 0) return null;
  const padding = size === "sm" ? "px-1.5 py-0" : "px-2 py-0.5";
  const text = size === "sm" ? "text-xs" : "text-sm";
  return (
    <ul className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <li
          key={tag}
          className={`inline-flex items-center gap-1 rounded-2xl border border-primary-color bg-white ${padding} ${text} text-primary-color`}
        >
          <span className="max-w-[12rem] truncate">{tag}</span>
        </li>
      ))}
    </ul>
  );
}

export default TagChipList;
