import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { LuMoreHorizontal } from "react-icons/lu";
import { overlayTarget } from "../../utils/frameRoutes";
import { OverlayRootContext } from "../app/OverlayScope";

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

const MARGIN = 8;

/**
 * A small ⋯ popover menu; closes on outside press, scroll, Esc or choosing an
 * item. The list renders in the overlay container (so no scroller clips it),
 * below the button when it fits, else above, always clamped inside the screen.
 */
export default function ActionMenu({ items, ariaLabel, disabled }: Props) {
  const scoped = useContext(OverlayRootContext);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const container = open ? (scoped ?? overlayTarget()) : null;

  useLayoutEffect(() => {
    if (!container) {
      setPos(null);
      return;
    }
    const button = buttonRef.current;
    const list = listRef.current;
    if (!button || !list) return;
    const b = button.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    const w = list.offsetWidth;
    const h = list.offsetHeight;
    const below = b.bottom - c.top + 4;
    const top = below + h > c.height - MARGIN ? b.top - c.top - h - 4 : below;
    const clamp = (n: number, max: number) =>
      Math.max(MARGIN, Math.min(n, max));
    setPos({
      left: clamp(b.right - c.left - w, c.width - w - MARGIN),
      top: clamp(top, c.height - h - MARGIN),
    });
  }, [container]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onPress = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      )
        close();
    };
    // Capture + stop: Esc closes this menu, not the sheet around it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    };
    document.addEventListener("pointerdown", onPress);
    window.addEventListener("keydown", onKey, true);
    // The button moves with the scroller; the menu doesn't, so close it.
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  if (items.length === 0) return null;
  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
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
      {container &&
        createPortal(
          <ul
            ref={listRef}
            role="menu"
            className="chunky absolute z-[70] min-w-[150px] list-none overflow-hidden p-1 shadow-lg"
            style={{
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              visibility: pos ? "visible" : "hidden",
            }}
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
          </ul>,
          container,
        )}
    </div>
  );
}
