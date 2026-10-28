import React from "react";
import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { Sheet } from "../app/Sheet";
import AssignmentLink from "../subject/AssignmentLink";

type Props = {
  open: boolean;
  lang: Language;
  studentOnAssignmentId: string;
  onClose: () => void;
};

/** Add a link to the student's work. */
export default function LinkSheet({
  open,
  lang,
  studentOnAssignmentId,
  onClose,
}: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      ariaLabel={assignmentPageLanguage.addLink(lang)}
    >
      <AssignmentLink
        studentOnAssignmentId={studentOnAssignmentId}
        onClose={onClose}
      />
    </Sheet>
  );
}
