import React from "react";
import { FcLink, FcPlus, FcUpload } from "react-icons/fc";
import { MdOutlineDone, MdOutlineRemoveDone } from "react-icons/md";
import { classworkDataLanguage } from "../../data/languages";
import { Language, StudentAssignmentStatus } from "../../interfaces";

const attachMenus = [
  { title: "Link", icon: <FcLink /> },
  { title: "Create", icon: <FcPlus /> },
  { title: "Upload", icon: <FcUpload /> },
] as const;

type Props = {
  language: Language;
  status: StudentAssignmentStatus;
  isPending: boolean;
  onSelectAttach: (menu: "Link" | "Create" | "Upload") => void;
  onUpdateStatus: (status: "SUBMITTED" | "PENDDING") => void;
  onClose: () => void;
};

function AssignmentActionSheet({
  language,
  status,
  isPending,
  onSelectAttach,
  onUpdateStatus,
  onClose,
}: Props) {
  return (
    <section className="fixed inset-0 z-50 flex items-end justify-center font-Anuphan">
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <div className="relative z-10 mb-24 w-[98%] max-w-md rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <span className="px-1 text-sm text-gray-500">
          {classworkDataLanguage.attrachs(language)}
        </span>
        <div className="mt-1 grid gap-1">
          {attachMenus.map((menu) => (
            <button
              key={menu.title}
              type="button"
              onClick={() => onSelectAttach(menu.title)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-base hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border text-lg">
                {menu.icon}
              </div>
              {classworkDataLanguage.attrachType[
                menu.title.toLowerCase() as keyof typeof classworkDataLanguage.attrachType
              ](language)}
            </button>
          ))}
        </div>
        <div className="my-2 border-t" />
        {(status === "PENDDING" || status === "IMPROVED") && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onUpdateStatus("SUBMITTED")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-color p-2 text-base font-medium text-white opacity-90 hover:opacity-100"
          >
            {classworkDataLanguage.menuSummitLists.done(language)}
            <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-green-200 text-green-600">
              <MdOutlineDone />
            </div>
          </button>
        )}
        {status === "SUBMITTED" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onUpdateStatus("PENDDING")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-400 p-2 text-base font-medium text-white opacity-90 hover:opacity-100"
          >
            {classworkDataLanguage.menuSummitLists.notdone(language)}
            <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-red-200 text-red-600">
              <MdOutlineRemoveDone />
            </div>
          </button>
        )}
        {status === "REVIEWD" && (
          <div className="p-2 text-center text-sm text-gray-500">
            {classworkDataLanguage.menuSummitLists.review(language)}
          </div>
        )}
      </div>
    </section>
  );
}

export default AssignmentActionSheet;
