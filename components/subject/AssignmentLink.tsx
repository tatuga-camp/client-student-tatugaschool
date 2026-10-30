import React from "react";
import { LuLoader } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import {
  useCreateFileStudentAssignment,
  useGetLanguage,
} from "../../react-query";
import { workError, workToast } from "../assignment/workFeedback";

type Props = {
  studentOnAssignmentId: string;
  onClose: () => void;
};

/** The add-link form (rendered inside LinkSheet). */
function AssignmentLink({ studentOnAssignmentId, onClose }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const createFile = useCreateFileStudentAssignment();
  const [link, setLink] = React.useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = link.trim();
    if (!url) return;
    try {
      await createFile.mutateAsync({
        studentOnAssignmentId: studentOnAssignmentId,
        // type stays "link-url" so older teacher-app builds still show a link.
        type: "link-url",
        name: url,
        body: url,
        contentType: "LINK",
        size: 0,
      });
      setLink("");
      workToast(assignmentPageLanguage.linkAdded(lang));
      onClose();
    } catch (error) {
      workError(error, lang);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pb-2">
      <h3 className="text-base font-bold text-icon-color">
        {assignmentPageLanguage.addLink(lang)}
      </h3>
      <input
        autoFocus
        required
        value={link}
        onChange={(e) => setLink(e.target.value)}
        type="url"
        inputMode="url"
        placeholder={assignmentPageLanguage.linkPlaceholder(lang)}
        aria-label={assignmentPageLanguage.addLink(lang)}
        className="h-11 w-full rounded-xl border-2 border-[#E3E8F0] px-3 text-base text-icon-color outline-none focus:border-primary-color"
      />
      <button
        type="submit"
        disabled={createFile.isPending}
        className="chunky-btn w-full disabled:opacity-60"
      >
        {createFile.isPending ? (
          <LuLoader aria-hidden className="animate-spin" />
        ) : (
          assignmentPageLanguage.add(lang)
        )}
      </button>
    </form>
  );
}

export default AssignmentLink;
