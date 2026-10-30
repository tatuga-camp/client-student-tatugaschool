import React from "react";
import { LuCheck, LuLoader } from "react-icons/lu";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import { useGetLanguage, useGetStudent } from "../../react-query";
import { mascotForStudent } from "../../utils/mascot";
import type { UnsentVideo } from "../../utils/videoQuiz";
import { Sheet } from "../app/Sheet";
import MascotAvatar from "../student/MascotAvatar";

type Props = {
  open: boolean;
  /** Set while "Mark as done" is working (waiting for an upload, or saving). */
  busy?: "upload" | "submit" | null;
  /** A mark-done request is still in flight (e.g. after a timeout). */
  submitDisabled?: boolean;
  /** Video quiz answers not turned in: submitting sends their score. */
  video?: UnsentVideo | null;
  onChoose: (choice: "submit" | "leave" | "stay") => void;
};

/**
 * Shown when the student leaves with work attached but not turned in:
 * Mark as done (submits, then leaves), Leave anyway, or Stay. With video quiz
 * answers it offers only Submit and leave or Keep watching: leaving always
 * turns the score so far in. Closing the sheet any other way (swipe, Esc,
 * backdrop) means Stay.
 */
export default function LeaveGuardSheet({
  open,
  busy = null,
  submitDisabled = false,
  video = null,
  onChoose,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const student = useGetStudent();
  const t = assignmentPageLanguage;
  const title = video ? t.videoLeaveTitle(lang) : t.leaveGuardTitle(lang);
  return (
    <Sheet
      open={open}
      onClose={() => onChoose("stay")}
      dismissible={!busy}
      ownsBack
      ariaLabel={title}
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
        <h2 className="text-base font-bold text-icon-color">{title}</h2>
        <p className="text-xs font-semibold text-[#5B6280]">
          {video
            ? t.videoLeaveBody(lang, video.correct, video.total)
            : t.leaveGuardBody(lang)}
        </p>
        <div className="mt-1 flex w-full flex-col gap-2">
          <button
            type="button"
            disabled={!!busy || submitDisabled}
            onClick={() => onChoose("submit")}
            className="chunky-btn w-full disabled:opacity-60"
          >
            {busy ? (
              <LuLoader aria-hidden className="animate-spin" />
            ) : (
              <LuCheck aria-hidden />
            )}
            {busy === "upload"
              ? t.waitingForUpload(lang)
              : busy === "submit"
                ? video
                  ? t.submitting(lang)
                  : t.markingDone(lang)
                : video
                  ? t.submitAndLeave(lang)
                  : classworkDataLanguage.menuSummitLists.done(lang)}
          </button>
          {!video && (
            <button
              type="button"
              disabled={!!busy}
              onClick={() => onChoose("leave")}
              className="chunky-btn chunky-btn-secondary w-full disabled:opacity-60"
            >
              {t.leaveAnyway(lang)}
            </button>
          )}
          <button
            type="button"
            disabled={!!busy}
            onClick={() => onChoose("stay")}
            className="h-11 w-full text-[13px] font-bold text-primary-color disabled:opacity-60"
          >
            {video ? t.keepWatching(lang) : t.stay(lang)}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
