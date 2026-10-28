import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { LuMoreHorizontal, LuSend, LuTrash2 } from "react-icons/lu";
import { announcementDataLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import {
  useCreateAnnouncementComment,
  useDeleteAnnouncementComment,
  useGetAnnouncementComments,
} from "../../react-query";
import { timeAgo } from "../../utils";
import { Sheet } from "../app/Sheet";
import LoadingBar from "../common/LoadingBar";

type Props = {
  /** The announcement whose thread is open; null keeps the sheet closed. */
  announcementId: string | null;
  studentId: string;
  lang: Language;
  title: string;
  onClose: () => void;
};

export default function AnnouncementCommentsSheet({
  announcementId,
  studentId,
  lang,
  title,
  onClose,
}: Props) {
  return (
    <Sheet
      open={announcementId !== null}
      onClose={onClose}
      size="auto"
      ariaLabel={`${announcementDataLanguage.comments(lang)}: ${title}`}
    >
      {announcementId && (
        <Thread
          announcementId={announcementId}
          studentId={studentId}
          lang={lang}
        />
      )}
    </Sheet>
  );
}

function Thread({
  announcementId,
  studentId,
  lang,
}: {
  announcementId: string;
  studentId: string;
  lang: Language;
}) {
  const comments = useGetAnnouncementComments({ announcementId });
  const createComment = useCreateAnnouncementComment();
  const deleteComment = useDeleteAnnouncementComment();
  const [content, setContent] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  // Tapping anywhere else closes the open menu.
  useEffect(() => {
    if (!menuId) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-comment-menu]")) {
        setMenuId(null);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || createComment.isPending) return;
    await createComment.mutateAsync({ announcementId, content: text });
    setContent("");
  };

  const remove = async (commentOnAnnouncementId: string) => {
    setMenuId(null);
    await deleteComment.mutateAsync({ commentOnAnnouncementId });
  };

  return (
    <div className="font-Anuphan">
      <h2 className="mb-3 text-base font-bold text-icon-color">
        {announcementDataLanguage.comments(lang)}
      </h2>
      {comments.isLoading && <LoadingBar />}
      {!comments.isLoading && (comments.data?.length ?? 0) === 0 && (
        <p className="py-6 text-center text-sm text-[#7A80A0]">
          {announcementDataLanguage.noComments(lang)}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {comments.data?.map((comment) => (
          <li key={comment.id} className="flex items-start gap-2">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-[#E3E8F0]">
              <Image
                src={comment.photo || "/avatar.png"}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="relative min-w-0 flex-1 rounded-2xl bg-[#F2F4F8] px-3 py-2">
              <div className="flex items-center gap-1.5 pr-8">
                <span className="truncate text-xs font-bold text-icon-color">
                  {comment.firstName} {comment.lastName}
                </span>
                {comment.userId && comment.title && (
                  <span className="shrink-0 rounded bg-primary-color/10 px-1.5 text-[10px] font-bold text-primary-color">
                    {comment.title}
                  </span>
                )}
                <span className="shrink-0 text-[10px] text-[#9AA3B8]">
                  {timeAgo({ pastTime: comment.createAt })}
                </span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-700">
                {comment.content}
              </p>
              {comment.studentId === studentId && (
                <div data-comment-menu className="absolute right-0.5 top-0.5">
                  <button
                    type="button"
                    aria-label={announcementDataLanguage.moreActions(lang)}
                    aria-expanded={menuId === comment.id}
                    onClick={() =>
                      setMenuId(menuId === comment.id ? null : comment.id)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#7A80A0]"
                  >
                    <LuMoreHorizontal aria-hidden />
                  </button>
                  {menuId === comment.id && (
                    <button
                      type="button"
                      disabled={deleteComment.isPending}
                      onClick={() => remove(comment.id)}
                      className="absolute right-0 top-9 z-10 flex min-h-10 items-center gap-2 whitespace-nowrap rounded-xl border-2 border-b-4 border-[#E3E8F0] bg-white px-3 text-sm font-bold text-error-color"
                    >
                      <LuTrash2 aria-hidden />
                      {announcementDataLanguage.delete(lang)}
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <form
        onSubmit={submit}
        className="sticky bottom-0 mt-3 flex items-center gap-2 bg-white pt-2"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={announcementDataLanguage.writeComment(lang)}
          aria-label={announcementDataLanguage.writeComment(lang)}
          className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-[#E3E8F0] px-4 text-base outline-none focus:border-primary-color"
        />
        <button
          type="submit"
          aria-label={announcementDataLanguage.send(lang)}
          disabled={createComment.isPending || !content.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-color text-xl text-white disabled:opacity-50"
          style={{ boxShadow: "0 4px 0 #275d96" }}
        >
          <LuSend aria-hidden />
        </button>
      </form>
    </div>
  );
}
