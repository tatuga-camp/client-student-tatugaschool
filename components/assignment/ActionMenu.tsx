import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LuMoreHorizontal } from "react-icons/lu";

export type ActionMenuItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onSelect: () => void;
};

type Props = {
  items: ActionMenuItem[];
  ariaLabel: string;
  disabled?: boolean;
};

/** A small ⋯ popover menu; closes on outside press, Esc or choosing an item. */
export default function ActionMenu({ items, ariaLabel, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Open upward when the list would run past the bottom of its scroller.
  useLayoutEffect(() => {
    if (!open) {
      setUp(false);
      return;
    }
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;
    const bound =
      root.closest(".app-scroll")?.getBoundingClientRect().bottom ??
      window.innerHeight;
    const below = root.getBoundingClientRect().bottom + list.offsetHeight;
    setUp(below > bound);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPress = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Capture + stop: Esc closes this menu, not the sheet around it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPress);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  if (items.length === 0) return null;
  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full text-xl text-[#9AA3B8] active:bg-[#EEF1F6] disabled:opacity-40"
      >
        <LuMoreHorizontal aria-hidden />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="menu"
          className={`chunky absolute right-0 z-10 ${up ? "bottom-full" : "top-full"} min-w-[150px] list-none overflow-hidden p-1 shadow-lg`}
        >
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-[13px] font-bold active:bg-[#EEF1F6] ${
                  item.danger ? "text-[#F04438]" : "text-icon-color"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
