import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LuCheck,
  LuLoader,
  LuPlus,
} from "react-icons/lu";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import useConfirmSubmissionGuard from "../../hook/useConfirmSubmissionGuard";
import {
  FileOnStudentOnAssignment,
  StudentAssignmentStatus,
  Subject,
} from "../../interfaces";
import {
  useGetFileStudentAssignment,
  useGetLanguage,
  useUpdateStudentOnAssignment,
} from "../../react-query";
import { hasUnconfirmedWork } from "../../utils";
import Swal from "../../utils/appSwal";
import { withTimeout } from "../../utils/withTimeout";
import {
  doneAtLabel,
  shouldSubmitAfterUpload,
  yourWorkMode,
} from "../../utils/assignmentDetail";
import { turnInBody, type UnsentVideo } from "../../utils/videoQuiz";
import { useDetailActive } from "../app/shell/DetailActive";
import { Sheet } from "../app/Sheet";
import { useStudentFileUpload } from "../subject/AssignmentUploadFile";

import LeaveGuardSheet from "./LeaveGuardSheet";
import LinkSheet from "./LinkSheet";
import NoteSheet from "./NoteSheet";
import type { AssignmentItem } from "./types";
import YourWorkBody, { pillBase } from "./YourWorkBody";
import { workError, workToast } from "./workFeedback";

type Props = {
  assignment: AssignmentItem;
  /** Only the delete rule needs it; the guard works without it. */
  subject?: Subject;
  /** Called after Mark as done succeeds. */
  onTurnedIn: (info: { itemCount: number }) => void;
  /** Hide the peek (a video is playing or a question is open). */
  hidden?: boolean;
  /** Video quiz answers not turned in: Mark as done (or Submit in the leave
   *  guard, which then has no Leave anyway) sends their score as final. */
  video?: UnsentVideo | null;
  /** Where the always-open desktop card renders (the assignment page's right
   *  column). Null: the bottom sheet. This component stays mounted in one
   *  place either way, so switching keeps uploads and the leave guard. */
  cardSlot?: HTMLElement | null;
};

/** How long the guard's "Mark as done" waits for an upload before giving up. */
const UPLOAD_WAIT_MS = 60_000;
/** How long it waits for the mark-done request itself. */
const SUBMIT_WAIT_MS = 30_000;

/**
 * The "Your work" bottom sheet: a peek with the count and the two main
 * buttons, expanding to the items and the four ways to add work. Turned-in
 * and reviewed work get a read-mostly version; Material and Quiz get none.
 * With a `cardSlot` it is an always-open card there instead.
 */
export default function YourWorkSheet({
  assignment,
  subject,
  onTurnedIn,
  hidden = false,
  video = null,
  cardSlot = null,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const soa = assignment.studentOnAssignment;
  const archived = subject?.isAchieved ?? false;
  const mode = yourWorkMode(assignment.type, soa.status, archived);
  // Archived work keeps the label it would have had; only the controls go.
  // `mode` drives every control (Add, Done, Undo, the read-only note, item menus);
  // `shown` drives only the labels and pills. Never use `shown` for a control.
  const shown = archived ? yourWorkMode(assignment.type, soa.status) : mode;
  const files = useGetFileStudentAssignment({ studentOnAssignmentId: soa.id });
  const items = files.data ?? [];
  const updateWork = useUpdateStudentOnAssignment();
  const { upload, uploading, progress } = useStudentFileUpload({
    studentOnAssignmentId: soa.id,
    schoolId: soa.schoolId,
  });
  const [expanded, setExpanded] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState<FileOnStudentOnAssignment | undefined>();
  const [linkOpen, setLinkOpen] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  const unconfirmed = hasUnconfirmedWork({
    assignmentType: assignment.type,
    fileCount: items.length,
    status: soa.status,
  });

  const [justSubmitted, setJustSubmitted] = useState(false);
  useEffect(() => {
    if (soa.status === "SUBMITTED" || soa.status === "REVIEWD") {
      setJustSubmitted(false);
    }
  }, [soa.status]);

  const setStatus = async (
    status: StudentAssignmentStatus,
  ): Promise<boolean> => {
    try {
      await updateWork.mutateAsync({
        query: { studentOnAssignmentId: soa.id },
        body: turnInBody(status, video),
      });
      // The list refetch lags a moment; until it lands, don't ask again.
      setJustSubmitted(status === "SUBMITTED");
      workToast(
        status === "SUBMITTED"
          ? assignmentPageLanguage.markedDone(lang)
          : assignmentPageLanguage.markedNotDone(lang),
      );
      return true;
    } catch (error) {
      workError(error, lang, {
        title: assignmentPageLanguage.updateFailedTitle(lang),
        text: assignmentPageLanguage.updateFailedText(lang),
      });
      return false;
    }
  };

  // True only while the Mark as done BUTTON is saving; the guard's own
  // submit is tracked by the guard, so a hanging request can't disarm it.
  const [marking, setMarking] = useState(false);
  const markDone = async () => {
    setMarking(true);
    try {
      const result = await withTimeout(setStatus("SUBMITTED"), SUBMIT_WAIT_MS);
      if (!result.ok) {
        workError(new Error(assignmentPageLanguage.submitTimeout(lang)), lang);
      } else if (result.value) {
        setExpanded(false);
        onTurnedIn({ itemCount: items.length });
      }
    } finally {
      setMarking(false);
    }
  };

  // Leaving with unsent work, or mid-upload, asks first (the guard sheet).
  // The answer comes through a promise the guard waits on.
  const [guardOpen, setGuardOpen] = useState(false);
  const answerRef = useRef<((c: "submit" | "leave" | "stay") => void) | null>(
    null,
  );
  const uploadingRef = useRef(false);
  uploadingRef.current = uploading;
  // Uploads in flight, so the guard can learn whether they landed.
  const uploadsRef = useRef(new Set<Promise<boolean>>());
  const ask = () =>
    new Promise<"submit" | "leave" | "stay">((resolve) => {
      answerRef.current = resolve;
      setGuardOpen(true);
    });
  const [guardBusy, setGuardBusy] = useState<"upload" | "submit" | null>(null);
  const choose = (choice: "submit" | "leave" | "stay") => {
    // Submitting keeps the sheet open (busy) until it is done or has failed.
    if (choice === "submit")
      setGuardBusy(uploadingRef.current ? "upload" : "submit");
    else setGuardOpen(false);
    answerRef.current?.(choice);
    answerRef.current = null;
  };
  // Never leave a question hanging if the page goes away; and the upload
  // wait below stops when it does.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      answerRef.current?.("stay");
    };
  }, []);
  // A page on its way out (after Leave anyway) must not guard anything.
  const active = useDetailActive();
  const unsent = unconfirmed || uploading || !!video;
  const guardEnabled =
    active && unsent && !justSubmitted && !marking && !archived;
  // Nothing left to protect (e.g. the upload failed before any item landed)
  // while the question is open: the student asked to leave, so let them.
  useEffect(() => {
    if (!guardEnabled && answerRef.current) {
      choose("leave");
      // The failure that released them already showed its dialog; don't leave
      // it over the page they are going to.
      Swal.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardEnabled]);
  useConfirmSubmissionGuard({
    enabled: guardEnabled,
    onConfirm: async () => {
      try {
        // Submitting while a file is still going up would turn in without it,
        // so wait for it, but not forever.
        if (uploadsRef.current.size > 0) {
          setGuardBusy("upload");
          const waited = await withTimeout(
            Promise.all(Array.from(uploadsRef.current)),
            UPLOAD_WAIT_MS,
          );
          if (!mountedRef.current) return false;
          if (!waited.ok) {
            workError(
              new Error(assignmentPageLanguage.uploadWaitTimeout(lang)),
              lang,
            );
            return false;
          }
          // A failed upload already showed its own error: stay, don't submit.
          if (
            !shouldSubmitAfterUpload({ results: waited.value, timedOut: false })
          )
            return false;
        }
        setGuardBusy("submit");
        // The request itself may take up to the axios timeout; the student
        // is not held that long.
        const result = await withTimeout(
          setStatus("SUBMITTED"),
          SUBMIT_WAIT_MS,
        );
        if (!result.ok) {
          workError(
            new Error(assignmentPageLanguage.submitTimeout(lang)),
            lang,
          );
          return false;
        }
        return result.value;
      } finally {
        setGuardBusy(null);
        setGuardOpen(false);
      }
    },
    ask,
    cancelAsk: () => {
      if (answerRef.current) choose("stay");
    },
  });

  if (mode === "none") return null;

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const run = upload(picked);
    uploadsRef.current.add(run);
    void run.finally(() => uploadsRef.current.delete(run));
  };
  const openNote = (file?: FileOnStudentOnAssignment) => {
    setNote(file);
    setNoteOpen(true);
  };
  const busy = uploading || updateWork.isPending;
  const count = items.length;
  const countPill = (
    <span
      className={`${pillBase} ${count > 0 ? "bg-blue-100 text-primary-color" : "bg-gray-100 text-gray-600"}`}
    >
      {count > 0
        ? assignmentPageLanguage.itemsCount(lang, count)
        : assignmentPageLanguage.nothingAdded(lang)}
    </span>
  );
  const doneAt = doneAtLabel(soa.completedAt);

  const doneButtonFor = (className: string) => (
    <button
      type="button"
      disabled={busy}
      onClick={markDone}
      className={`chunky-btn w-full whitespace-nowrap disabled:opacity-60 ${className}`}
    >
      {updateWork.isPending ? (
        <LuLoader aria-hidden className="animate-spin" />
      ) : (
        <LuCheck aria-hidden />
      )}
      {classworkDataLanguage.menuSummitLists.done(lang)}
    </button>
  );

  const doneButton = doneButtonFor("");
  const peekDoneButton = doneButtonFor("gap-1 px-2 text-[13px]");
  const peek =
    mode === "open" ? (
      <div className="pb-2">
        <div className="mb-2 flex items-center justify-between text-[13px] font-bold text-icon-color">
          <span>{assignmentPageLanguage.yourWork(lang)}</span>
          {countPill}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="chunky-btn chunky-btn-secondary min-w-0 flex-1 gap-1 whitespace-nowrap px-2 text-[13px]"
          >
            <LuPlus aria-hidden />
            {assignmentPageLanguage.addWork(lang)}
          </button>
          <div className="min-w-0 flex-1">{peekDoneButton}</div>
        </div>
      </div>
    ) : (
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(true)}
        className="block w-full pb-2 text-left"
      >
        <span className="flex items-center justify-between text-[13px] font-bold text-icon-color">
          <span>
            {shown === "reviewed"
              ? assignmentPageLanguage.reviewedByTeacher(lang)
              : assignmentPageLanguage.yourWork(lang)}
          </span>
          {shown === "turnedIn" ? (
            <span className={`${pillBase} bg-emerald-100 text-emerald-700`}>
              <LuCheck aria-hidden />
              {assignmentPageLanguage.turnedIn(lang)}
            </span>
          ) : (
            countPill
          )}
        </span>
        {shown === "turnedIn" && doneAt && (
          <span className="mt-1 block text-xs font-semibold text-emerald-600">
            {assignmentPageLanguage.markedDoneAt(lang)} {doneAt}
          </span>
        )}
      </button>
    );

  const body = (
    <YourWorkBody
      lang={lang}
      mode={mode}
      shown={shown}
      busy={busy}
      countPill={countPill}
      doneAt={doneAt}
      unconfirmed={unconfirmed}
      items={items}
      allowStudentDeleteWork={subject?.allowStudentDeleteWork ?? false}
      archived={archived}
      progress={progress}
      doneButton={doneButton}
      onUndo={() => void setStatus("PENDDING")}
      onOpenNote={openNote}
      onCamera={() => cameraRef.current?.click()}
      onFiles={() => filesRef.current?.click()}
      onLink={() => setLinkOpen(true)}
    />
  );

  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={pickFiles}
      />
      <input ref={filesRef} type="file" multiple hidden onChange={pickFiles} />

      {cardSlot
        ? // Desktop: always open, in the right column; nothing to hide.
          createPortal(
            <section
              aria-label={assignmentPageLanguage.yourWork(lang)}
              className="chunky p-3 font-Anuphan"
            >
              {body}
            </section>,
            cardSlot,
          )
        : !hidden && (
            <Sheet
              open
              onClose={() => setExpanded(false)}
              peek={peek}
              expanded={expanded}
              onExpandedChange={setExpanded}
              ariaLabel={assignmentPageLanguage.yourWork(lang)}
            >
              {body}
            </Sheet>
          )}

      <LeaveGuardSheet
        open={guardOpen}
        busy={guardBusy}
        submitDisabled={updateWork.isPending}
        video={video}
        onChoose={choose}
      />
      <NoteSheet
        open={noteOpen}
        lang={lang}
        assignment={assignment}
        note={note}
        readOnly={mode !== "open"}
        onClose={() => setNoteOpen(false)}
      />
      <LinkSheet
        open={linkOpen}
        lang={lang}
        studentOnAssignmentId={soa.id}
        onClose={() => setLinkOpen(false)}
      />
    </>
  );
}
