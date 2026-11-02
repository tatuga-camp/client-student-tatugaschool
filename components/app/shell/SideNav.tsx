import React from "react";
import { homeLanguage } from "../../../data/languages";
import { Language, Student } from "../../../interfaces";
import { mascotForStudent, realPhoto } from "../../../utils/mascot";
import { SIDEBAR_TABS, type TabKey } from "../../../utils/tabs";
import MascotAvatar from "../../student/MascotAvatar";
import { useAnyModalOpen } from "../modalLayers";
import { PhotoOrFallback } from "../PhotoOrFallback";
import { TAB_ITEMS } from "./TabBar";
import { inertProps } from "./TabPager";

type Props = {
  tab: TabKey;
  student: Student | undefined;
  language: Language;
  onSelect: (tab: TabKey) => void;
};

/** Home's icon: the student's photo, or their mascot when they have none. */
function HomeIcon({
  student,
  active,
}: {
  student: Student | undefined;
  active: boolean;
}) {
  return (
    <span
      className={`relative block h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full border-[2.5px] bg-[#E8F1FD] ${
        active ? "border-primary-color" : "border-[#CFE0F5]"
      }`}
    >
      {student && (
        <PhotoOrFallback
          src={realPhoto(student.photo)}
          blurHash={student.blurHash}
          sizes="30px"
          fallback={
            <MascotAvatar
              clips={mascotForStudent(student)}
              alt=""
              id={student.id}
              idle={false}
              sizes="30px"
            />
          }
        />
      )}
    </span>
  );
}

/**
 * The desktop sidebar (`desk` and up): the tab bar's five tabs, Home first.
 * An icon rail with small labels on tablets, a full sidebar on `wide`. It is
 * inert while a modal layer is open, so a click can't leave a half-written
 * note or an open viewer behind.
 */
export default function SideNav({ tab, student, language, onSelect }: Props) {
  const modalOpen = useAnyModalOpen();
  return (
    <nav
      aria-label={homeLanguage.tabBar(language)}
      {...inertProps(modalOpen)}
      className="hidden h-full w-[88px] shrink-0 flex-col gap-1 border-r-2 border-[#E3E8F0] bg-white px-2 py-4 font-Anuphan desk:flex wide:w-[220px] wide:px-3"
    >
      <div className="mb-4 flex items-center justify-center gap-2 wide:justify-start wide:px-2">
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-color text-sm font-bold text-white"
        >
          T
        </span>
        <span className="hidden text-[13px] font-bold text-icon-color wide:inline">
          TATUGA SCHOOL
        </span>
      </div>
      {SIDEBAR_TABS.map((key) => {
        const active = tab === key;
        const item = TAB_ITEMS.find((i) => i.key === key);
        const label = item
          ? item.label(language)
          : homeLanguage.tabHome(language);
        const Icon = item?.icon;
        return (
          <button
            key={key}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center gap-1 rounded-[13px] border-2 px-1 py-2 text-[10px] font-bold transition-colors wide:flex-row wide:gap-3 wide:px-3 wide:text-[14px] ${
              active
                ? "border-[#BBD6F5] bg-[#E8F1FD] text-primary-color"
                : "border-transparent text-[#7A80A0] hover:bg-[#F2F4F8]"
            }`}
          >
            {Icon ? (
              <span className="grid h-[30px] w-[30px] shrink-0 place-items-center text-[21px]">
                <Icon aria-hidden />
              </span>
            ) : (
              <HomeIcon student={student} active={active} />
            )}
            <span className="max-w-full text-center leading-tight wide:truncate wide:text-left">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
