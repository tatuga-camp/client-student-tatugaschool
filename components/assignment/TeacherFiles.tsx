import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";
import {
  LuChevronRight,
  LuExternalLink,
  LuFile,
  LuFileText,
  LuImage,
  LuLink,
  LuPlay,
  LuVideo,
} from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { FileOnAssignment, Language } from "../../interfaces";
import { cleanUrl } from "../../utils/safeHtml";
import {
  fileSizeLabel,
  teacherFileKind,
  teacherFileName,
  teacherFileOpenMode,
  TeacherFileKind as Kind,
} from "../../utils/assignmentDetail";
const PdfViewerSheet = dynamic(() => import("../quiz/PdfViewerSheet"), {
  ssr: false,
});
import ImageViewerSheet from "./ImageViewerSheet";
import VideoFileSheet from "./VideoFileSheet";

type Props = { files: FileOnAssignment[]; lang: Language };

// Full class names only: Tailwind cannot see classes built from strings.
const KINDS: Record<Kind, { tile: string; icon: React.ReactNode }> = {
  pdf: { tile: "bg-rose-100 text-rose-600", icon: <LuFileText /> },
  video: { tile: "bg-pink-100 text-pink-600", icon: <LuVideo /> },
  image: { tile: "bg-violet-100 text-violet-600", icon: <LuImage /> },
  link: { tile: "bg-teal-100 text-teal-600", icon: <LuLink /> },
  file: { tile: "bg-gray-100 text-gray-600", icon: <LuFile /> },
};

/** The teacher's files: a chunky list; each opens in the best in-app viewer. */
export default function TeacherFiles({ files, lang }: Props) {
  const [open, setOpen] = useState<{
    file: FileOnAssignment;
    mode: "video" | "pdf" | "image";
  } | null>(null);
  // Kept after closing so the sheet can slide out with its video still there.
  const [lastVideo, setLastVideo] = useState<FileOnAssignment | null>(null);

  const openFile = (file: FileOnAssignment) => {
    const kind = teacherFileKind(file);
    const mode = kind === "link" ? "external" : teacherFileOpenMode(file);
    if (mode === "external") {
      const href = cleanUrl("href", file.url);
      if (href) window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (mode === "video") setLastVideo(file);
    setOpen({ file, mode });
  };
  const close = useCallback(() => setOpen(null), []);

  const kindLabel = (kind: Kind) =>
    kind === "pdf"
      ? assignmentPageLanguage.fileKindPdf(lang)
      : kind === "video"
        ? assignmentPageLanguage.fileKindVideo(lang)
        : kind === "image"
          ? assignmentPageLanguage.fileKindImage(lang)
          : kind === "link"
            ? assignmentPageLanguage.link(lang)
            : assignmentPageLanguage.fileKindFile(lang);

  return (
    <>
      <ul className="chunky list-none px-3 py-1">
        {files.map((file) => {
          const kind = teacherFileKind(file);
          const name = teacherFileName(file);
          const size = kind === "link" ? "" : fileSizeLabel(file.size);
          return (
            <li
              key={file.id}
              className="border-b-[1.5px] border-[#EEF1F6] last:border-b-0"
            >
              <button
                type="button"
                onClick={() => openFile(file)}
                title={name}
                className="flex min-h-[52px] w-full items-center gap-2.5 py-1.5 text-left"
              >
                <span
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-base ${KINDS[kind].tile}`}
                >
                  {KINDS[kind].icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-icon-color">
                    {name}
                  </span>
                  <span className="block text-[11px] font-semibold text-[#9AA3B8]">
                    {[kindLabel(kind), size].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-base text-[#9AA3B8]">
                  {kind === "video" ? (
                    <LuPlay />
                  ) : kind === "link" || kind === "file" ? (
                    <LuExternalLink />
                  ) : (
                    <LuChevronRight />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {open?.mode === "pdf" && (
        <PdfViewerSheet
          url={open.file.url}
          name={teacherFileName(open.file)}
          language={lang}
          onClose={close}
        />
      )}
      {open?.mode === "image" && (
        <ImageViewerSheet
          url={open.file.url}
          name={teacherFileName(open.file)}
          lang={lang}
          onClose={close}
        />
      )}
      {lastVideo && (
        <VideoFileSheet
          open={open?.mode === "video"}
          url={lastVideo.url}
          name={teacherFileName(lastVideo)}
          lang={lang}
          preventFastForward={lastVideo.preventFastForward ?? false}
          onClose={close}
        />
      )}
    </>
  );
}
