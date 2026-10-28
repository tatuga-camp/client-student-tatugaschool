import React from "react";
import type { IconType } from "react-icons";
import { LuBookOpen, LuLayers, LuTrendingUp, LuUser } from "react-icons/lu";
import { homeLanguage } from "../../../data/languages";
import { Language, Student } from "../../../interfaces";
import { mascotForStudent } from "../../../utils/mascot";
import type { TabKey } from "../../../utils/tabs";
import MascotAvatar from "../../student/MascotAvatar";

const SIDE_TABS: {
  key: Exclude<TabKey, "home">;
  icon: IconType;
  label: (l: Language) => string;
}[] = [
  { key: "classwork", icon: LuBookOpen, label: homeLanguage.tabClasswork },
  { key: "progress", icon: LuTrendingUp, label: homeLanguage.tabProgress },
  { key: "subjects", icon: LuLayers, label: homeLanguage.tabSubjects },
  { key: "me", icon: LuUser, label: homeLanguage.tabMe },
];

type Props = {
  tab: TabKey;
  student: Student | undefined;
  language: Language;
  onSelect: (tab: TabKey) => void;
};

function SideTab({
  item,
  active,
  language,
  onSelect,
}: {
  item: (typeof SIDE_TABS)[number];
  active: boolean;
  language: Language;
  onSelect: (tab: TabKey) => void;
}) {
  const Icon = item.icon;
  const label = item.label(language);
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(item.key)}
      className={`flex w-[60px] flex-col items-center gap-0.5 text-[11px] font-bold [-webkit-tap-highlight-color:transparent] ${
        active ? "text-primary-color" : "text-[#9AA3B8]"
      }`}
    >
      <span
        className={`grid h-[30px] w-10 place-items-center rounded-[10px] text-[21px] transition-colors ${
          active ? "bg-[#E8F1FD]" : ""
        }`}
      >
        <Icon aria-hidden />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </button>
  );
}

/** Classwork · Progress · (mascot Home) · Subjects · Me */
export default function TabBar({ tab, student, language, onSelect }: Props) {
  const onHome = tab === "home";
  const homeLabel = homeLanguage.tabHome(language);
  return (
    <nav
      aria-label={homeLanguage.tabBar(language)}
      className="relative z-10 flex shrink-0 items-start justify-around border-t-2 border-[#E3E8F0] bg-white px-1.5 pt-1.5 font-Anuphan"
      style={{
        height: "calc(72px + var(--safe-bottom))",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      {SIDE_TABS.slice(0, 2).map((item) => (
        <SideTab
          key={item.key}
          item={item}
          active={tab === item.key}
          language={language}
          onSelect={onSelect}
        />
      ))}
      <button
        type="button"
        aria-label={homeLabel}
        aria-current={onHome ? "page" : undefined}
        onClick={() => onSelect("home")}
        className="relative -mt-6 h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border-4 bg-[#E8F1FD] transition-[border-color,box-shadow] [-webkit-tap-highlight-color:transparent]"
        style={
          onHome
            ? {
                borderColor: "#2C7CD1",
                boxShadow:
                  "0 0 0 4px rgba(44,124,209,.18), 0 6px 14px rgba(44,124,209,.35)",
              }
            : {
                borderColor: "#CFE0F5",
                boxShadow: "0 4px 10px rgba(0,0,0,.12)",
              }
        }
      >
        {student && (
          <MascotAvatar
            clips={mascotForStudent(student)}
            alt=""
            id={student.id}
            idle={false}
            sizes="60px"
          />
        )}
      </button>
      {SIDE_TABS.slice(2).map((item) => (
        <SideTab
          key={item.key}
          item={item}
          active={tab === item.key}
          language={language}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}
