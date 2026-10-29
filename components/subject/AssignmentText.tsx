import React from "react";
import { LuLoader } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { Assignment, FileOnStudentOnAssignment } from "../../interfaces";
import {
  useCreateFileStudentAssignment,
  useGetLanguage,
  useUpdateFileStudentAssignment,
} from "../../react-query";
import { workError, workToast } from "../assignment/workFeedback";
import TextEditor from "../common/TextEditor";

// Phone-sized: no menubar, and no buttons that open dialogs (link, image).
const NOTE_TOOLBAR = "undo redo | bold italic | bullist numlist | removeformat";

type Props = {
  studentOnAssignmentId: string;
  /** The note being opened; a new note is pre-filled with the description. */
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
  const [title, setTitle] = React.useState<string | null>(
    text ? text.name : "",
  );
  const initialTitle = text ? text.name : "";
  // What the note opened with, as the editor holds it: TinyMCE normalises
  // the body on init (and reports that as a change), which isn't typing.
  const [initialValue, setInitialValue] = React.useState(value);
  const dirty =
    !readOnly &&
    (value !== initialValue || (title ?? "") !== (initialTitle ?? ""));
  React.useEffect(() => {
    onDirtyChange?.(dirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);
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
        <TextEditor
          value={value}
          onChange={(content) => setValue(content)}
          onReady={setInitialValue}
          schoolId={schoolId}
          disabled={readOnly}
          menubar={false}
          statusbar={false}
          toolbar={NOTE_TOOLBAR}
        />
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
