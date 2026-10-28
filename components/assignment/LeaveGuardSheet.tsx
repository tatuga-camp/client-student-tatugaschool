import React from "react";
import { LuCheck } from "react-icons/lu";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import { useGetLanguage, useGetStudent } from "../../react-query";
import { mascotForStudent } from "../../utils/mascot";
import { Sheet } from "../app/Sheet";
import MascotAvatar from "../student/MascotAvatar";

type Props = {
  open: boolean;
  onChoose: (choice: "submit" | "leave" | "stay") => void;
};

/**
 * Shown when the student leaves with work attached but not turned in:
 * Mark as done (submits, then leaves), Leave anyway, or Stay. Closing the
 * sheet any other way (swipe, Esc, backdrop) means Stay.
 */
export default function LeaveGuardSheet({ open, onChoose }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const student = useGetStudent();
  const t = assignmentPageLanguage;
  return (
    <Sheet
      open={open}
      onClose={() => onChoose("stay")}
      ariaLabel={t.leaveGuardTitle(lang)}
    >
      <div className="flex flex-col items-center gap-3 pb-2 text-center">
        {student.data && (
          <div className="relative h-24 w-24 shrink-0">
            <MascotAvatar
              clips={mascotForStudent(student.data)}
              alt=""
              id={student.data.id}
              idle={false}
              sizes="96px"
            />
          </div>
        )}
        <h2 className="text-base font-bold text-icon-color">
          {t.leaveGuardTitle(lang)}
        </h2>
        <p className="text-xs font-semibold text-[#5B6280]">
          {t.leaveGuardBody(lang)}
        </p>
        <div className="mt-1 flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => onChoose("submit")}
            className="chunky-btn w-full"
          >
            <LuCheck aria-hidden />
            {classworkDataLanguage.menuSummitLists.done(lang)}
          </button>
          <button
            type="button"
            onClick={() => onChoose("leave")}
            className="chunky-btn chunky-btn-secondary w-full"
          >
            {t.leaveAnyway(lang)}
          </button>
          <button
            type="button"
            onClick={() => onChoose("stay")}
            className="h-11 w-full text-[13px] font-bold text-primary-color"
          >
            {t.stay(lang)}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
