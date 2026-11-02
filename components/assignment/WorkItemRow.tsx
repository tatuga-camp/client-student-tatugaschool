import React, { useRef, useState } from "react";
import {
  LuExternalLink,
  LuFile,
  LuLink,
  LuLoader,
  LuPenLine,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import {
  FileOnStudentOnAssignment,
  isLinkFile,
  Language,
} from "../../interfaces";
import {
  useDeleteFileStudentAssignment,
  useUpdateFileStudentAssignment,
} from "../../react-query";
import {
  fileSizeLabel,
  workErrorContent,
  type WorkErrorContent,
  workItemMenu,
} from "../../utils/assignmentDetail";
import { withTimeout } from "../../utils/withTimeout";
import ActionMenu, { ActionMenuItem } from "./ActionMenu";
import Swal from "../../utils/appSwal";
import WorkErrorNotice from "./WorkErrorNotice";

type Props = {
  file: FileOnStudentOnAssignment;
  lang: Language;
  allowStudentDeleteWork: boolean;
  /** Reviewed work can only be opened. */
  reviewed?: boolean;
  /** Archived subjects are read-only: the item can only be opened. */
  archived?: boolean;
  /** TEXT items open in the note sheet. */
  onOpenNote: (file: FileOnStudentOnAssignment) => void;
};

/** Longest a rename waits for the server before the student is told. */
const WRITE_TIMEOUT_MS = 30_000;

const TILE =
  "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-base";

/**
 * One added item: open it, rename it inline, or delete it from the ⋯ menu.
 * A rename or delete in flight shows in the row; a failed one shows under it
 * with Try again.
 */
export default function WorkItemRow({
  file,
  lang,
  allowStudentDeleteWork,
  reviewed = false,
  archived = false,
  onOpenNote,
}: Props) {
  const updateFile = useUpdateFileStudentAssignment();
  const deleteFile = useDeleteFileStudentAssignment();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const cancelRef = useRef(false);
  const savingRef = useRef(false);
  const [failure, setFailure] = useState<{
    content: WorkErrorContent;
    retry: () => void;
  } | null>(null);
  const fail = (error: unknown, title: string, retry: () => void) => {
    console.error(error);
    setFailure({ content: workErrorContent(error, lang, { title }), retry });
  };

  const link = isLinkFile(file);
  const isImage = file.contentType === "FILE" && file.type.includes("image");
  const displayName =
    file.name ?? (link ? file.body : (file.body.split("/").pop() ?? file.body));
  const kind =
    file.contentType === "TEXT"
      ? assignmentPageLanguage.note(lang)
      : link
        ? assignmentPageLanguage.link(lang)
        : isImage
          ? assignmentPageLanguage.fileKindImage(lang)
          : assignmentPageLanguage.fileKindFile(lang);
  const size =
    link || file.contentType === "TEXT" ? "" : fileSizeLabel(file.size);

  const open = () => {
    if (file.contentType === "TEXT") onOpenNote(file);
    else window.open(file.body, "_blank", "noopener,noreferrer");
  };

  const startRename = () => {
    setFailure(null);
    cancelRef.current = false;
    setDraft(displayName);
    setEditing(true);
  };

  const commitRename = async () => {
    if (!editing || savingRef.current) return;
    if (cancelRef.current) {
      cancelRef.current = false;
      setEditing(false);
      return;
    }
    const next = draft.trim();
    if (!next || next === displayName) {
      setEditing(false);
      return;
    }
    await saveName(next);
  };

  const saveName = async (next: string) => {
    if (savingRef.current) return;
    const title = assignmentPageLanguage.renameFailed(lang);
    const retry = () => void saveName(next);
    setFailure(null);
    savingRef.current = true;
    try {
      const result = await withTimeout(
        updateFile.mutateAsync({
          query: { id: file.id },
          body: { name: next },
        }),
        WRITE_TIMEOUT_MS,
      );
      setEditing(false);
      if (!result.ok) {
        fail(
          new Error(assignmentPageLanguage.submitTimeout(lang)),
          title,
          retry,
        );
      }
    } catch (error) {
      // Back to the original name, out of edit mode: no dead-end edit state.
      setEditing(false);
      fail(error, title, retry);
    } finally {
      savingRef.current = false;
    }
  };

  const deleteItem = async () => {
    setFailure(null);
    try {
      await deleteFile.mutateAsync({ fileOnStudentAssignmentId: file.id });
    } catch (error) {
      fail(error, assignmentPageLanguage.deleteFailed(lang), () => {
        void deleteItem();
      });
    }
  };

  const remove = async () => {
    const answer = await Swal.fire({
      icon: "warning",
      title: assignmentPageLanguage.deleteConfirmTitle(lang),
      text: displayName,
      showCancelButton: true,
      confirmButtonText: assignmentPageLanguage.delete(lang),
      cancelButtonText: assignmentPageLanguage.cancel(lang),
      confirmButtonColor: "#F04438",
      customClass: { popup: "rounded-2xl border border-gray-100 shadow-md" },
    });
    if (!answer.isConfirmed) return;
    await deleteItem();
  };

  const actions: Record<"open" | "rename" | "delete", ActionMenuItem> = {
    open: {
      key: "open",
      label: assignmentPageLanguage.open(lang),
      icon: <LuExternalLink aria-hidden />,
      onSelect: open,
    },
    rename: {
      key: "rename",
      label: assignmentPageLanguage.rename(lang),
      icon: <LuPencil aria-hidden />,
      onSelect: startRename,
    },
    delete: {
      key: "delete",
      label: assignmentPageLanguage.delete(lang),
      icon: <LuTrash2 aria-hidden />,
      danger: true,
      onSelect: remove,
    },
  };
  const items = workItemMenu({
    contentType: file.contentType,
    allowStudentDeleteWork,
    reviewed,
    archived,
  }).map((key) => actions[key]);

  const tile =
    file.contentType === "TEXT" ? (
      <span className={`${TILE} bg-teal-100 text-teal-600`}>
        <LuPenLine aria-hidden />
      </span>
    ) : link ? (
      <span className={`${TILE} bg-blue-100 text-primary-color`}>
        <LuLink aria-hidden />
      </span>
    ) : isImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.body}
        alt=""
        loading="lazy"
        className="h-[34px] w-[34px] shrink-0 rounded-[10px] bg-[#EEF1F6] object-cover"
      />
    ) : (
      <span className={`${TILE} bg-gray-100 text-gray-600`}>
        <LuFile aria-hidden />
      </span>
    );

  const deleting = deleteFile.isPending;
  const pending = deleting || updateFile.isPending;
  const meta = deleting
    ? assignmentPageLanguage.deleting(lang)
    : updateFile.isPending
      ? assignmentPageLanguage.submitting(lang)
      : [kind, size].filter(Boolean).join(" · ");

  return (
    <li
      aria-busy={pending}
      className="border-b-[1.5px] border-[#EEF1F6] last:border-b-0"
    >
      <div
        className={`flex min-h-[52px] items-center gap-2.5 ${deleting ? "opacity-60" : ""}`}
      >
        {editing ? (
          <>
            {tile}
            <input
              autoFocus
              maxLength={255}
              value={draft}
              disabled={updateFile.isPending}
              aria-label={assignmentPageLanguage.fileName(lang)}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancelRef.current = true;
                  e.currentTarget.blur();
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border-2 border-primary-color px-2 text-[13px] font-bold text-icon-color outline-none"
            />
          </>
        ) : (
          <button
            type="button"
            onClick={open}
            disabled={deleting}
            title={displayName}
            className="flex min-h-[52px] min-w-0 flex-1 items-center gap-2.5 py-1.5 text-left"
          >
            {tile}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-icon-color">
                {displayName}
              </span>
              <span
                className={`block text-[11px] font-semibold ${pending ? "text-primary-color" : "text-[#9AA3B8]"}`}
              >
                {meta}
              </span>
            </span>
          </button>
        )}
        {pending ? (
          <span className="grid h-11 w-11 shrink-0 place-items-center text-xl text-primary-color">
            <LuLoader aria-hidden className="animate-spin" />
          </span>
        ) : (
          !editing && (
            <ActionMenu
              items={items}
              ariaLabel={assignmentPageLanguage.moreActions(lang)}
            />
          )
        )}
      </div>
      {failure && (
        <WorkErrorNotice
          lang={lang}
          error={failure.content}
          onRetry={failure.retry}
          onDismiss={() => setFailure(null)}
          className="mb-2"
        />
      )}
    </li>
  );
}
