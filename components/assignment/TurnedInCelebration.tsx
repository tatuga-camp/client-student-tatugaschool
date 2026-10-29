import React, { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuArrowRight, LuCheckCircle2 } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { overlayTarget } from "../../utils/frameRoutes";
import { mascotForStudent } from "../../utils/mascot";
import { turnInSummary } from "../../utils/assignmentDetail";
import { OverlayRootContext } from "../app/OverlayScope";
import MascotAvatar from "../student/MascotAvatar";

type Props = {
  open: boolean;
  lang: Language;
  student: { id: string; photo?: string | null; firstName?: string };
  summary: ReturnType<typeof turnInSummary>;
  next: { id: string; title: string } | null;
  onNext: () => void;
  onBack: () => void;
};

const CONFETTI = [
  { left: 20, color: "#FFCD1B", delay: 0 },
  { left: 58, color: "#2C7CD1", delay: 0.8 },
  { left: 96, color: "#F04438", delay: 1.6 },
  { left: 140, color: "#27AE60", delay: 0.4 },
  { left: 182, color: "#569DF8", delay: 1.2 },
  { left: 222, color: "#FFCD1B", delay: 2 },
  { left: 254, color: "#D63384", delay: 0.6 },
];

/**
 * Full-screen "Turned in!" screen after Mark as done: the mascot cheers,
 * confetti falls (not under reduced motion), three tiles sum up the
 * hand-in, and one tap goes to the next assignment.
 */
export default function TurnedInCelebration({
  open,
  lang,
  student,
  summary,
  next,
  onNext,
  onBack,
}: Props) {
  const scoped = useContext(OverlayRootContext);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  useEffect(() => {
    if (!open) return;
    // After a frame: the Your-work sheet gives focus back to its opener in a
    // microtask when it closes, and would take it from us.
    const frame = requestAnimationFrame(() =>
      primaryRef.current?.focus({ preventScroll: true }),
    );
    // Esc works wherever focus is.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onBackRef.current();
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey, true);
      // No focus restore here: every way out (Back, Next, Esc) navigates, and
      // DetailStack's useDetailFocus then returns focus to the card that
      // opened this page. Restoring into the leaving panel would fight it.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  if (!open) return null;

  // Esc = Back; Tab stays inside the dialog.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const buttons = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>("button") ?? [],
    );
    if (buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const t = assignmentPageLanguage;
  const sent = summary.sentAt
    ? summary.sentAt.toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
  const tiles = [
    ...(summary.onTime !== null
      ? [
          {
            key: "onTime",
            label: t.tileOnTime(lang),
            value: summary.onTime ? t.yes(lang) : t.no(lang),
            color: summary.onTime ? "#27AE60" : "#F04438",
            text: summary.onTime ? "#1E8E4E" : "#D93025",
            icon: summary.onTime,
          },
        ]
      : []),
    {
      key: "work",
      label: t.tileYourWork(lang),
      value:
        summary.itemCount > 0
          ? t.itemsCount(lang, summary.itemCount)
          : t.nothingAddedShort(lang),
      color: "#2C7CD1",
      text: "#2C7CD1",
      icon: false,
    },
    {
      key: "sent",
      label: t.tileSentAt(lang),
      value: sent,
      color: "#F5A524",
      text: "#B07800",
      icon: false,
    },
  ];

  return createPortal(
    <div
      ref={dialogRef}
      onKeyDown={onKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={t.turnedInTitle(lang)}
      data-no-swipe
      className="absolute inset-0 z-[60] flex flex-col items-center overflow-hidden font-Anuphan"
      style={{
        background:
          "radial-gradient(circle at 50% 38%, #E8F1FD 0, #F7F8FA 60%)",
        paddingTop: "calc(var(--safe-top) + 56px)",
        paddingBottom: "calc(var(--safe-bottom) + 16px)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {CONFETTI.map((c) => (
          <span
            key={c.left}
            className="tg-confetti"
            style={{
              left: c.left,
              background: c.color,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="tg-jump relative h-44 w-44 shrink-0"
        style={{ filter: "drop-shadow(0 10px 12px rgba(0,0,0,.18))" }}
      >
        <MascotAvatar
          clips={mascotForStudent(student)}
          alt=""
          id={student.id}
          idle={false}
          reactOnMount="happy"
          sizes="176px"
        />
      </div>

      <div className="mt-5 px-6 text-center">
        <h2 className="text-[26px] font-bold text-primary-color">
          {t.turnedInTitle(lang)}
        </h2>
        <p className="mt-1 text-xs font-semibold text-[#5B6280]">
          {t.turnedInBody(lang, student.firstName ?? "")}
        </p>
      </div>

      <div className="mt-5 flex w-full gap-2 px-4">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="min-w-0 flex-1 overflow-hidden rounded-[14px] border-2 bg-white text-center"
            style={{ borderColor: tile.color }}
          >
            <div
              className="py-0.5 text-[9px] font-bold tracking-wide text-white"
              style={{ background: tile.color }}
            >
              {tile.label}
            </div>
            <div
              className="flex items-center justify-center gap-1 px-1 py-2 text-[13px] font-bold"
              style={{ color: tile.text }}
            >
              {tile.icon && <LuCheckCircle2 aria-hidden />}
              <span className="truncate">{tile.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex w-full flex-col gap-2 px-4 pt-6">
        {next && (
          <button
            ref={primaryRef}
            type="button"
            onClick={onNext}
            className="flex h-[46px] w-full items-center justify-between gap-2 rounded-[14px] bg-[#FFCD1B] px-4 text-[13px] font-bold text-icon-color active:translate-y-0.5"
            style={{ boxShadow: "0 4px 0 #D9A900" }}
          >
            <span className="min-w-0 truncate">
              {t.nextAssignment(lang, next.title)}
            </span>
            <LuArrowRight aria-hidden className="shrink-0 text-lg" />
          </button>
        )}
        <button
          ref={next ? undefined : primaryRef}
          type="button"
          onClick={onBack}
          className="h-11 w-full rounded-[14px] text-[13px] font-bold text-primary-color"
        >
          {t.backToClasswork(lang)}
        </button>
      </div>
    </div>,
    scoped ?? overlayTarget(),
  );
}
