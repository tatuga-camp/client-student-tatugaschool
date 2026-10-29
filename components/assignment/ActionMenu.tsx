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
import { placeMenu } from "../../utils/menuPlacement";
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

/**
 * A small ⋯ popover menu; closes on outside press, scroll, Esc or choosing an
 * item. The list renders in the sheet's panel when the button is in a sheet,
 * else in the overlay container (so no scroller clips it), below the button
 * when it fits, else above, kept on the phone screen and never over the
 * button (above a short sheet it reaches past the panel).
 */
export default function ActionMenu({ items, ariaLabel, disabled }: Props) {
  const scoped = useContext(OverlayRootContext);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Inside the sheet's own (aria-modal) dialog when there is one, so screen
  // readers can reach it; else the page's overlay container.
  const [host, setHost] = useState<HTMLElement | null>(null);
  const container = open ? (host ?? scoped ?? overlayTarget()) : null;
  const wasOpen = useRef(false);
  // Closed with focus already placed: by a choice (focus goes back to ⋯
  // before the item runs, so a dialog or field it opens keeps the focus it
  // takes) or by Tab moving focus on. Only other closes refocus ⋯.
  const chose = useRef(false);
  // A press on ⋯ is under way: it toggles the menu itself when it clicks.
  // Until the click (after pointerup, for a finger), the menu's blur from that
  // press must not close it too, whatever the browser focuses meanwhile.
  const pressingButton = useRef(false);

  // Focus moves into the menu on open and back to the button on close.
  useEffect(() => {
    if (open && pos) {
      listRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus({ preventScroll: true });
    }
    if (!open && wasOpen.current && !chose.current)
      buttonRef.current?.focus({ preventScroll: true });
    if (!open) chose.current = false;
    wasOpen.current = open;
  }, [open, pos]);

  useLayoutEffect(() => {
    if (!container) {
      setPos(null);
      return;
    }
    const button = buttonRef.current;
    const list = listRef.current;
    if (!button || !list) return;
    setPos(
      placeMenu({
        button: button.getBoundingClientRect(),
        container: container.getBoundingClientRect(),
        // The phone screen: the sheet's panel is often shorter than the menu.
        screen: overlayTarget().getBoundingClientRect(),
        width: list.offsetWidth,
        height: list.offsetHeight,
      }),
    );
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
      if (e.key === "Tab") {
        pressingButton.current = false;
        // Shift+Tab out of the menu goes back to its own ⋯, whatever sits
        // before the list in the DOM (it renders at the end of the dialog).
        const first = listRef.current?.querySelector('[role="menuitem"]');
        if (e.shiftKey && first && document.activeElement === first) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        return;
      }
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
        onPointerDown={() => {
          pressingButton.current = true;
        }}
        onPointerCancel={() => {
          pressingButton.current = false;
        }}
        onClick={() => {
          pressingButton.current = false;
          setHost(
            buttonRef.current?.closest<HTMLElement>('[role="dialog"]') ?? null,
          );
          setOpen((v) => !v);
        }}
        className="grid h-11 w-11 place-items-center rounded-full text-xl text-[#9AA3B8] active:bg-[#EEF1F6] disabled:opacity-40"
      >
        <LuMoreHorizontal aria-hidden />
      </button>
      {container &&
        createPortal(
          <ul
            ref={listRef}
            role="menu"
            // Focus moved on out of the menu (Tab past the last item): close
            // it, and leave focus where it went. A press on ⋯ toggles it.
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (
                pressingButton.current ||
                !next ||
                listRef.current?.contains(next)
              )
                return;
              chose.current = true;
              setOpen(false);
            }}
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
                    chose.current = true;
                    buttonRef.current?.focus({ preventScroll: true });
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
