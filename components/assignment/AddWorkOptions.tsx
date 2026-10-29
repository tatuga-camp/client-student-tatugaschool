import React from "react";
import { LuCamera, LuImage, LuLink, LuPenLine } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";

type Props = {
  lang: Language;
  disabled?: boolean;
  onCamera: () => void;
  onFiles: () => void;
  onNote: () => void;
  onLink: () => void;
};

/** The four ways to add work: Camera, Photos & files, Note, Link. */
export default function AddWorkOptions({
  lang,
  disabled,
  onCamera,
  onFiles,
  onNote,
  onLink,
}: Props) {
  const options = [
    {
      key: "camera",
      label: assignmentPageLanguage.camera(lang),
      icon: <LuCamera aria-hidden />,
      tone: "bg-pink-100 text-pink-600",
      onClick: onCamera,
    },
    {
      key: "files",
      label: assignmentPageLanguage.photosAndFiles(lang),
      icon: <LuImage aria-hidden />,
      tone: "bg-amber-100 text-amber-700",
      onClick: onFiles,
    },
    {
      key: "note",
      label: assignmentPageLanguage.note(lang),
      icon: <LuPenLine aria-hidden />,
      tone: "bg-teal-100 text-teal-600",
      onClick: onNote,
    },
    {
      key: "link",
      label: assignmentPageLanguage.link(lang),
      icon: <LuLink aria-hidden />,
      tone: "bg-blue-100 text-primary-color",
      onClick: onLink,
    },
  ];
  return (
    <div className="my-3 grid grid-cols-4 gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          disabled={disabled}
          onClick={o.onClick}
          className="chunky flex min-h-[72px] flex-col items-center justify-center gap-1 px-1 py-2 text-center text-[11px] font-bold leading-tight text-icon-color active:translate-y-0.5 disabled:opacity-50"
          style={{ borderRadius: 14 }}
        >
          <span
            className={`flex h-[30px] w-[30px] items-center justify-center rounded-[10px] text-[15px] ${o.tone}`}
          >
            {o.icon}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}
