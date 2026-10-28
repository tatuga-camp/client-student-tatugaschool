import React from "react";
import {
  LuBellRing,
  LuCamera,
  LuChevronRight,
  LuHelpCircle,
  LuExternalLink,
  LuGlobe,
  LuKeyRound,
  LuLogOut,
  LuMegaphone,
  LuPencil,
} from "react-icons/lu";
import { navbarLanguageData, profileLanguage } from "../../data/languages";
import type { Language } from "../../interfaces";
import { useUpdateLanguage } from "../../react-query";

const CARD =
  "overflow-hidden rounded-2xl border-2 border-b-4 border-[#E3E8F0] bg-white";
const HELP_URL = "https://tatugaschool.com/support/contact-us";
const NEWS_URL = "https://tatugaschool.com/news";

const TONES = {
  blue: "bg-[#E8F1FD] text-[#2C7CD1]",
  pink: "bg-[#FDE8F2] text-[#D63384]",
  amber: "bg-[#FFF6D6] text-[#B07800]",
  teal: "bg-[#E0F5F2] text-[#138A7E]",
  violet: "bg-[#F1EAFE] text-[#7C4DDB]",
  red: "bg-[#FDECEA] text-[#D93025]",
};

const ROW =
  "flex min-h-12 w-full items-center gap-3 border-b-[1.5px] border-[#EEF1F6] px-3 py-2 text-left text-sm font-bold text-[#383767] last:border-b-0";

function Tile({
  tone,
  children,
}: {
  tone: keyof typeof TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-base ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const Chevron = () => (
  <LuChevronRight aria-hidden className="text-[#9AA3B8]" size={18} />
);

type Props = {
  lang: Language;
  /** The gear scrolls here. */
  settingsRef: React.RefObject<HTMLElement>;
  /** Text after "Notifications", e.g. "On". */
  notificationStatus: string;
  onEditName: () => void;
  onEditPhoto: () => void;
  onChangePassword: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
};

/** The Account card and the Settings card. */
export default function SettingsList({
  lang,
  settingsRef,
  notificationStatus,
  onEditName,
  onEditPhoto,
  onChangePassword,
  onOpenNotifications,
  onLogout,
}: Props) {
  const updateLanguage = useUpdateLanguage();
  const account = [
    {
      tone: "blue",
      icon: <LuPencil />,
      label: profileLanguage.name(lang),
      onClick: onEditName,
    },
    {
      tone: "pink",
      icon: <LuCamera />,
      label: profileLanguage.profilePhoto(lang),
      onClick: onEditPhoto,
    },
    {
      tone: "amber",
      icon: <LuKeyRound />,
      label: profileLanguage.password(lang),
      onClick: onChangePassword,
    },
  ] as const;

  return (
    <>
      <section aria-label={profileLanguage.account(lang)} className={CARD}>
        {account.map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={row.onClick}
            className={ROW}
          >
            <Tile tone={row.tone}>{row.icon}</Tile>
            <span className="flex-1">{row.label}</span>
            <Chevron />
          </button>
        ))}
      </section>

      <section
        ref={settingsRef}
        aria-label={profileLanguage.settings(lang)}
        className={`${CARD} scroll-mt-4`}
      >
        <div className={ROW}>
          <Tile tone="teal">
            <LuGlobe />
          </Tile>
          <span className="flex-1">{profileLanguage.language(lang)}</span>
          <div
            role="group"
            aria-label={profileLanguage.language(lang)}
            className="flex rounded-[10px] bg-[#E9EEF5] p-0.5 text-xs"
          >
            {(["th", "en"] as const).map((value) => {
              const on = lang === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  disabled={updateLanguage.isPending}
                  onClick={() => !on && updateLanguage.mutate(value)}
                  className={`min-h-8 min-w-11 rounded-[8px] px-2.5 font-bold ${
                    on ? "bg-white text-primary-color" : "text-[#7A80A0]"
                  }`}
                  style={on ? { boxShadow: "0 1px 0 #D6DEEA" } : undefined}
                >
                  {value.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" onClick={onOpenNotifications} className={ROW}>
          <Tile tone="violet">
            <LuBellRing />
          </Tile>
          <span className="flex-1">{profileLanguage.notifications(lang)}</span>
          <small className="text-[11px] font-bold text-[#7A80A0]">
            {notificationStatus}
          </small>
          <Chevron />
        </button>
        <a
          href={HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={ROW}
        >
          <Tile tone="blue">
            <LuHelpCircle />
          </Tile>
          <span className="flex-1">{navbarLanguageData.helpCenter(lang)}</span>
          <LuExternalLink aria-hidden className="text-[#9AA3B8]" size={16} />
        </a>
        <a
          href={NEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={ROW}
        >
          <Tile tone="amber">
            <LuMegaphone />
          </Tile>
          <span className="flex-1">{navbarLanguageData.whatsNew(lang)}</span>
          <LuExternalLink aria-hidden className="text-[#9AA3B8]" size={16} />
        </a>
        <button
          type="button"
          onClick={onLogout}
          className={`${ROW} text-error-color`}
        >
          <Tile tone="red">
            <LuLogOut />
          </Tile>
          <span className="flex-1">
            {navbarLanguageData.logoutButton(lang)}
          </span>
        </button>
      </section>
    </>
  );
}
