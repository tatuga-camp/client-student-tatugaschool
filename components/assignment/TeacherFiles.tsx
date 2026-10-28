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
import { teacherFileOpenMode } from "../../utils/assignmentDetail";
import PdfViewerSheet from "../quiz/PdfViewerSheet";
import ImageViewerSheet from "./ImageViewerSheet";
import VideoFileSheet from "./VideoFileSheet";

type Props = { files: FileOnAssignment[]; lang: Language };

type Kind = "video" | "pdf" | "image" | "link" | "file";

// Full class names only: Tailwind cannot see classes built from strings.
const KINDS: Record<Kind, { tile: string; icon: React.ReactNode }> = {
  pdf: { tile: "bg-rose-100 text-rose-600", icon: <LuFileText /> },
  video: { tile: "bg-pink-100 text-pink-600", icon: <LuVideo /> },
  image: { tile: "bg-violet-100 text-violet-600", icon: <LuImage /> },
  link: { tile: "bg-teal-100 text-teal-600", icon: <LuLink /> },
  file: { tile: "bg-gray-100 text-gray-600", icon: <LuFile /> },
};

function fileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileName(file: FileOnAssignment): string {
  if (file.name) return file.name;
  const last = file.url.split(/[?#]/)[0].split("/").pop() ?? file.url;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/** The teacher's files: a chunky list; each opens in the best in-app viewer. */
export default function TeacherFiles({ files, lang }: Props) {
  const [open, setOpen] = useState<{
    file: FileOnAssignment;
    mode: "video" | "pdf" | "image";
  } | null>(null);
  // Kept after closing so the sheet can slide out with its video still there.
  const [lastVideo, setLastVideo] = useState<FileOnAssignment | null>(null);

  const openFile = (file: FileOnAssignment) => {
    const isLink = file.type === "LINK";
    const mode = isLink ? "external" : teacherFileOpenMode(file);
    if (mode === "external") {
      window.open(file.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (mode === "video") setLastVideo(file);
    setOpen({ file, mode });
  };
  const close = useCallback(() => setOpen(null), []);

  const kindOf = (file: FileOnAssignment): Kind => {
    if (file.type === "LINK") return "link";
    const mode = teacherFileOpenMode(file);
    return mode === "external" ? "file" : mode;
  };
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
          const kind = kindOf(file);
          const name =
            file.type === "LINK" && !file.name ? file.url : fileName(file);
          const size = kind === "link" ? "" : fileSize(file.size);
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
          name={fileName(open.file)}
          language={lang}
          onClose={close}
        />
      )}
      {open?.mode === "image" && (
        <ImageViewerSheet
          url={open.file.url}
          name={fileName(open.file)}
          lang={lang}
          onClose={close}
        />
      )}
      {lastVideo && (
        <VideoFileSheet
          open={open?.mode === "video"}
          url={lastVideo.url}
          name={fileName(lastVideo)}
          preventFastForward={lastVideo.preventFastForward ?? false}
          onClose={close}
        />
      )}
    </>
  );
}
