import React from "react";
import { LuAlertTriangle, LuCheck, LuLoader, LuUndo2 } from "react-icons/lu";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import { FileOnStudentOnAssignment, Language } from "../../interfaces";
import type { yourWorkMode } from "../../utils/assignmentDetail";
import type { UploadProgress } from "../subject/AssignmentUploadFile";
import ActionMenu from "./ActionMenu";
import AddWorkOptions from "./AddWorkOptions";
import WorkItemRow from "./WorkItemRow";

type Mode = ReturnType<typeof yourWorkMode>;

export const pillBase =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold";

type Props = {
  lang: Language;
  /** Drives every control (Add, Done, Undo, item menus). */
  mode: Mode;
  /** Drives only the labels and pills (archived work keeps its label). */
  shown: Mode;
  busy: boolean;
  /** Mark as not done is saving. */
  undoing: boolean;
  /** The failed request's notice (WorkErrorNotice), if any. */
  failure: React.ReactNode;
  countPill: React.ReactNode;
  doneAt: string | null;
  unconfirmed: boolean;
  items: FileOnStudentOnAssignment[];
  allowStudentDeleteWork: boolean;
  archived: boolean;
  progress: UploadProgress | null;
  doneButton: React.ReactNode;
  onUndo: () => void;
  onOpenNote: (file?: FileOnStudentOnAssignment) => void;
  onCamera: () => void;
  onFiles: () => void;
  onLink: () => void;
};

/**
 * Everything "Your work" shows when open: the header and pill, the done-at
 * line, the unsent warning, the items, upload progress, the ways to add work
 * and Mark as done, with what is saving and what failed shown in place. The
 * phone's expanded sheet and the desktop card share it.
 */
export default function YourWorkBody({
  lang,
  mode,
  shown,
  busy,
  undoing,
  failure,
  countPill,
  doneAt,
  unconfirmed,
  items,
  allowStudentDeleteWork,
  archived,
  progress,
  doneButton,
  onUndo,
  onOpenNote,
  onCamera,
  onFiles,
  onLink,
}: Props) {
  return (
    <div className="pb-2">
      <div className="mb-2 flex items-center justify-between gap-2 text-[15px] font-bold text-icon-color">
        <span>
          {shown === "reviewed"
            ? assignmentPageLanguage.reviewedByTeacher(lang)
            : assignmentPageLanguage.yourWork(lang)}
        </span>
        <span className="flex items-center gap-1">
          {shown === "turnedIn" ? (
            <>
              <span className={`${pillBase} bg-emerald-100 text-emerald-700`}>
                <LuCheck aria-hidden />
                {assignmentPageLanguage.turnedIn(lang)}
              </span>
              {mode === "turnedIn" && (
                <ActionMenu
                  ariaLabel={assignmentPageLanguage.moreActions(lang)}
                  disabled={busy}
                  items={[
                    {
                      key: "undo",
                      label:
                        classworkDataLanguage.menuSummitLists.notdone(lang),
                      icon: <LuUndo2 aria-hidden />,
                      onSelect: onUndo,
                    },
                  ]}
                />
              )}
            </>
          ) : (
            countPill
          )}
        </span>
      </div>

      {shown === "turnedIn" && doneAt && (
        <p className="mb-2 text-xs font-semibold text-emerald-600">
          {assignmentPageLanguage.markedDoneAt(lang)} {doneAt}
        </p>
      )}

      {undoing && (
        <p
          role="status"
          className="mb-2 flex items-center gap-2 rounded-xl bg-blue-50 p-2 text-[12px] font-bold text-primary-color"
        >
          <LuLoader aria-hidden className="shrink-0 animate-spin text-base" />
          {assignmentPageLanguage.markingNotDone(lang)}
        </p>
      )}
      {/* Open: next to Mark as done instead (below). */}
      {mode !== "open" && failure && <div className="mb-2">{failure}</div>}

      {mode === "open" && unconfirmed && (
        <div className="mb-2 flex items-start gap-2 rounded-xl bg-[#FFF6D6] p-2 text-[12px] font-bold text-[#8A5E00]">
          <LuAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-base" />
          {assignmentPageLanguage.unsubmittedWarning(lang)}
        </div>
      )}

      <ul className="list-none">
        {items.map((file) => (
          <WorkItemRow
            key={file.id}
            file={file}
            lang={lang}
            allowStudentDeleteWork={allowStudentDeleteWork}
            reviewed={mode === "reviewed"}
            archived={archived}
            onOpenNote={onOpenNote}
          />
        ))}
      </ul>

      {progress && (
        <div className="flex min-h-[52px] flex-col justify-center gap-1 border-t-[1.5px] border-[#EEF1F6] py-1.5">
          <span className="text-xs font-bold text-icon-color">
            {assignmentPageLanguage.uploadingProgress(
              lang,
              progress.index,
              progress.count,
              Math.round(progress.percent),
            )}
          </span>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.percent)}
            className="h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]"
          >
            <div
              className="h-full rounded-full bg-primary-color"
              style={{ width: `${Math.round(progress.percent)}%` }}
            />
          </div>
        </div>
      )}
      {mode === "open" && (
        <>
          <AddWorkOptions
            lang={lang}
            disabled={busy}
            onCamera={onCamera}
            onFiles={onFiles}
            onNote={() => onOpenNote()}
            onLink={onLink}
          />
          {failure && <div className="mb-3">{failure}</div>}
          {doneButton}
        </>
      )}
    </div>
  );
}
