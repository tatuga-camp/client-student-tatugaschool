import React, { useEffect, useState } from "react";
import { assignmentPageLanguage } from "../../data/languages";
import { FileOnStudentOnAssignment, Language } from "../../interfaces";
import Swal from "../../utils/appSwal";
import { noteCloseAction } from "../../utils/assignmentDetail";
import { Sheet } from "../app/Sheet";
import AssignmentText from "../subject/AssignmentText";
import type { AssignmentItem } from "./types";

type Props = {
  open: boolean;
  lang: Language;
  assignment: AssignmentItem;
  /** The note to view/edit; none = a new note. */
  note?: FileOnStudentOnAssignment;
  readOnly?: boolean;
  onClose: () => void;
};

/** Full-height sheet hosting the note editor (TinyMCE). */
export default function NoteSheet({
  open,
  lang,
  assignment,
  note,
  readOnly = false,
  onClose,
}: Props) {
  // Unsaved text: a flick, the backdrop and Esc do nothing; the X (and a back
  // press) ask before throwing the draft away.
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!open) setDirty(false);
  }, [open]);
  const requestClose = async () => {
    if (noteCloseAction(dirty) === "close") return onClose();
    const answer = await Swal.fire({
      icon: "warning",
      title: assignmentPageLanguage.discardNoteTitle(lang),
      text: assignmentPageLanguage.discardNoteText(lang),
      showCancelButton: true,
      confirmButtonText: assignmentPageLanguage.discard(lang),
      cancelButtonText: assignmentPageLanguage.keepEditing(lang),
      confirmButtonColor: "#F04438",
      customClass: { popup: "rounded-2xl border border-gray-100 shadow-md" },
    });
    if (answer.isConfirmed) onClose();
  };
  return (
    <Sheet
      open={open}
      onClose={requestClose}
      guardClose={dirty}
      size="full"
      ariaLabel={assignmentPageLanguage.note(lang)}
    >
      <AssignmentText
        // Remount per note so each opens with its own title and content.
        key={note?.id ?? "new"}
        assignment={assignment}
        studentOnAssignmentId={assignment.studentOnAssignment.id}
        schoolId={assignment.studentOnAssignment.schoolId}
        text={note}
        readOnly={readOnly}
        onDirtyChange={setDirty}
        onClose={onClose}
      />
    </Sheet>
  );
}
