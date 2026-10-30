import React from "react";
import { LuLoader } from "react-icons/lu";
import {
  assignmentPageLanguage,
  requestDataLanguage,
} from "../../data/languages";
import { Assignment, FileOnStudentOnAssignment } from "../../interfaces";
import {
  useCreateFileStudentAssignment,
  useGetFileStudentAssignment,
  useGetLanguage,
  useUpdateFileStudentAssignment,
} from "../../react-query";
import { newNoteTitle } from "../../utils/assignmentDetail";
import { workError, workToast } from "../assignment/workFeedback";
import TextEditor from "../common/TextEditor";

// Phone-sized: no menubar, and no buttons that open dialogs (link, image).
const NOTE_TOOLBAR = "undo redo | bold italic | bullist numlist | removeformat";
// What that toolbar needs (and links typed in), not the full set.
const NOTE_PLUGINS = ["lists", "autolink"];
// TinyMCE builds its iframe, theme and plugins as it mounts. Doing that while
// the sheet slides in (components/app/Sheet.tsx) makes the slide stutter on
// a phone, so the editor mounts once the slide is all but done.
const EDITOR_DELAY_MS = 400;

type Props = {
  studentOnAssignmentId: string;
  /** The note being opened; a new note is pre-filled with the description
   *  and a numbered title ("Note 3"). */
  text?: FileOnStudentOnAssignment | undefined;
  onClose: () => void;
  schoolId: string;
  assignment: Pick<Assignment, "description">;
  /** View only: no editing, no save. */
  readOnly?: boolean;
  /** Reports whether there are unsaved changes. */
  onDirtyChange?: (dirty: boolean) => void;
};

/** The note editor (rendered inside NoteSheet). */
function AssignmentText({
  studentOnAssignmentId,
  text,
  schoolId,
  assignment,
  onClose,
  readOnly = false,
  onDirtyChange,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [value, setValue] = React.useState(
    text ? text.body : (assignment.description ?? ""),
  );
  // The work list's own query: already loaded, so read from the cache.
  const files = useGetFileStudentAssignment({ studentOnAssignmentId });
  const [title, setTitle] = React.useState<string | null>(() =>
    text
      ? text.name
      : newNoteTitle(files.data ?? [], assignmentPageLanguage.note(lang)),
  );
  // What the note opened with, captured once like the fields themselves. The
  // body is then taken as the editor holds it: TinyMCE normalises it on init
  // (and reports that as a change), which isn't typing.
  const [initialTitle] = React.useState(title);
  const [initialValue, setInitialValue] = React.useState(value);
  const dirty =
    !readOnly &&
    (value !== initialValue || (title ?? "") !== (initialTitle ?? ""));
  React.useEffect(() => {
    onDirtyChange?.(dirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);
  const [editorShown, setEditorShown] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setEditorShown(true), EDITOR_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);
  const update = useUpdateFileStudentAssignment();
  const create = useCreateFileStudentAssignment();
  const pending = update.isPending || create.isPending;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (text) {
        await update.mutateAsync({
          query: { id: text.id },
          body: { body: value, name: title ?? "" },
        });
      } else {
        await create.mutateAsync({
          studentOnAssignmentId: studentOnAssignmentId,
          body: value,
          name: title,
          contentType: "TEXT",
          size: 0,
          type: "tiny-editor",
        });
      }
      workToast(assignmentPageLanguage.noteSaved(lang));
      onClose();
    } catch (error) {
      workError(error, lang);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex h-full flex-col gap-2 pb-2">
      <input
        onChange={(e) => setTitle(e.target.value)}
        value={title ?? ""}
        type="text"
        placeholder={assignmentPageLanguage.noteTitlePlaceholder(lang)}
        aria-label={assignmentPageLanguage.noteTitlePlaceholder(lang)}
        required
        readOnly={readOnly}
        className="h-11 w-full shrink-0 rounded-xl border-2 border-[#E3E8F0] px-3 text-base font-bold text-icon-color outline-none focus:border-primary-color"
      />
      <div data-no-swipe className="min-h-0 flex-1">
        {editorShown ? (
          <TextEditor
            value={value}
            onChange={(content) => setValue(content)}
            onReady={setInitialValue}
            schoolId={schoolId}
            disabled={readOnly}
            menubar={false}
            statusbar={false}
            toolbar={NOTE_TOOLBAR}
            plugins={NOTE_PLUGINS}
            ariaText={assignmentPageLanguage.noteText(lang)}
          />
        ) : (
          // The same line TextEditor shows until TinyMCE is ready.
          <span className="animate-pulse">
            {requestDataLanguage.loading(lang)}
          </span>
        )}
      </div>
      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="chunky-btn w-full shrink-0 disabled:opacity-60"
        >
          {pending ? (
            <LuLoader aria-hidden className="animate-spin" />
          ) : (
            assignmentPageLanguage.save(lang)
          )}
        </button>
      )}
    </form>
  );
}

export default AssignmentText;
