import React, { useContext } from "react";
import { assignmentPageLanguage } from "../../data/languages";
import { FileOnStudentOnAssignment, Language } from "../../interfaces";
import { OVERLAY_ROOT_ID } from "../../utils/frameRoutes";
import { OverlayRootContext } from "../app/OverlayScope";
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
  // TinyMCE's menus and dialogs must render in the phone, not the page body.
  const scoped = useContext(OverlayRootContext);
  const uiContainer =
    scoped ??
    (typeof document === "undefined"
      ? null
      : document.getElementById(OVERLAY_ROOT_ID));
  return (
    <Sheet
      open={open}
      onClose={onClose}
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
        uiContainer={uiContainer}
        onClose={onClose}
      />
    </Sheet>
  );
}
