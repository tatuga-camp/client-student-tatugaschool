import { animated, useTrail } from "@react-spring/web";
import type { IconType } from "react-icons";
import {
  LuChevronRight,
  LuFileQuestion,
  LuFileText,
  LuVideo,
} from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import { Assignment, AssignmentType, Language } from "../../interfaces";
import { dueUrgency } from "../../utils/subjectHome";

// Full class names only: Tailwind cannot see classes built from strings.
const TILES: Record<AssignmentType, { icon: IconType; tile: string }> = {
  Assignment: { icon: LuFileText, tile: "bg-[#E8F1FD] text-primary-color" },
  Quiz: { icon: LuFileQuestion, tile: "bg-[#FFF6D6] text-[#C98A00]" },
  VideoQuiz: { icon: LuVideo, tile: "bg-pink-100 text-pink-600" },
  Material: { icon: LuFileText, tile: "bg-teal-100 text-teal-600" },
};

function dueText(item: Assignment, lang: Language, now: Date): string {
  if (!item.dueDate) return homeLanguage.noDueDate(lang);
  if (dueUrgency(item, now) === "overdue") return homeLanguage.overdue(lang);
  const when = new Date(item.dueDate).toLocaleDateString(
    lang === "th" ? "th-TH" : "en-US",
    { weekday: "short", day: "numeric", month: "short" },
  );
  return homeLanguage.dueOn(lang, when);
}

/** The next few things to do, each a card that opens its assignment. */
export function UpNextList({
  items,
  lang,
  now,
  onOpen,
}: {
  items: Assignment[];
  lang: Language;
  now: Date;
  onOpen: (id: string) => void;
}) {
  const trail = useTrail(items.length, {
    from: { opacity: 0, y: 24 },
    to: { opacity: 1, y: 0 },
    config: { tension: 260, friction: 18 },
  });
  return (
    <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
      {trail.map((style, i) => {
        const item = items[i];
        const { icon: Icon, tile } = TILES[item.type] ?? TILES.Assignment;
        const overdue = dueUrgency(item, now) === "overdue";
        return (
          <animated.li
            key={item.id}
            style={{
              opacity: style.opacity,
              transform: style.y.to((y) => `translateY(${y}px)`),
            }}
          >
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              aria-label={homeLanguage.openAssignment(lang, item.title)}
              className="flex w-full items-center gap-2 rounded-[16px] border-2 border-b-4 border-[#E3E8F0] bg-white px-2 py-[7px] text-left [-webkit-tap-highlight-color:transparent] active:translate-y-px active:border-b-2"
            >
              <span
                aria-hidden
                className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[10px] ${tile}`}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-icon-color">
                  {item.title}
                </span>
                <span
                  className={`block text-[11px] font-semibold ${
                    overdue ? "text-error-color" : "text-[#7A80A0]"
                  }`}
                >
                  {dueText(item, lang, now)}
                </span>
              </span>
              <span
                aria-hidden
                className="grid h-[26px] w-8 shrink-0 place-items-center rounded-[10px] border-2 border-b-4 border-[#E3E8F0] text-primary-color"
              >
                <LuChevronRight size={14} />
              </span>
            </button>
          </animated.li>
        );
      })}
    </ul>
  );
}
