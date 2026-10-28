import parse from "html-react-parser";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { LuSend, LuTrash2 } from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { CommentOnAssignment, Language } from "../../interfaces";
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
} from "../../react-query";
import { timeAgo } from "../../utils";
import Swal from "../../utils/appSwal";
import {
  commentDraftIsEmpty,
  plainTextToCommentHtml,
} from "../../utils/commentHtml";
import ActionMenu from "./ActionMenu";
import { workError } from "./workFeedback";

type Props = {
  studentOnAssignmentId: string;
  lang: Language;
};

/** Poll the thread only while the page is open (the query unmounts with it). */
const POLL_MS = 1000 * 10;
const MAX_LINES = 4;

function Bubble({
  comment,
  lang,
  onDelete,
}: {
  comment: CommentOnAssignment;
  lang: Language;
  onDelete: (comment: CommentOnAssignment) => void;
}) {
  const mine = !!comment.studentId;
  const name = [comment.title, comment.firstName, comment.lastName]
    .filter(Boolean)
    .join(" ");
  const ago = timeAgo({ pastTime: comment.createAt, language: lang });
  return (
    <li className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      {!mine && (
        <span className="mb-0.5 ml-9 text-[10px] font-bold text-[#7A80A0]">
          {name} · {assignmentPageLanguage.teacherRole(lang)}
        </span>
      )}
      <div
        className={`flex max-w-full items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}
      >
        {!mine && (
          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#EEF1F6]">
            <Image
              src={comment.photo || "/avatar.png"}
              alt=""
              fill
              sizes="28px"
              className="object-cover"
            />
          </span>
        )}
        <div
          className={`min-w-0 max-w-[78%] break-words px-3 py-1.5 text-[13px] leading-snug ${
            mine
              ? "rounded-2xl rounded-br-[4px] bg-primary-color text-white"
              : "rounded-2xl rounded-bl-[4px] bg-[#EEF1F6] text-icon-color"
          }`}
        >
          {parse(comment.content)}
          <span
            className={`mt-0.5 block text-[10px] ${mine ? "text-white/70" : "text-[#9AA3B8]"}`}
          >
            {ago}
          </span>
        </div>
        {mine && (
          <ActionMenu
            ariaLabel={assignmentPageLanguage.moreActions(lang)}
            items={[
              {
                key: "delete",
                label: assignmentPageLanguage.delete(lang),
                icon: <LuTrash2 aria-hidden />,
                danger: true,
                onSelect: () => onDelete(comment),
              },
            ]}
          />
        )}
      </div>
    </li>
  );
}

/**
 * The comment thread with the teacher as a chat: teacher bubbles on the left,
 * the student's on the right (⋯ to delete), and a plain-text composer that
 * grows to four lines. A failed send keeps the typed text.
 */
export default function CommentsChat({ studentOnAssignmentId, lang }: Props) {
  const comments = useGetComments({
    studentOnAssignmentId,
    refetchInterval: POLL_MS,
  });
  const create = useCreateComment();
  const deleteComment = useDeleteComment();
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const list = comments.data ?? [];

  // Grow with the text, up to MAX_LINES.
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    const line = parseFloat(getComputedStyle(area).lineHeight) || 20;
    area.style.height = `${Math.min(area.scrollHeight, line * MAX_LINES)}px`;
  }, [draft]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentDraftIsEmpty(draft) || create.isPending) return;
    try {
      await create.mutateAsync({
        content: plainTextToCommentHtml(draft),
        studentOnAssignmentId,
      });
      setDraft("");
      endRef.current?.scrollIntoView({ block: "nearest" });
    } catch (error) {
      // The draft stays in the box so nothing typed is lost.
      workError(error, lang);
    }
  };

  const remove = async (comment: CommentOnAssignment) => {
    const answer = await Swal.fire({
      icon: "warning",
      title: assignmentPageLanguage.deleteCommentTitle(lang),
      showCancelButton: true,
      confirmButtonText: assignmentPageLanguage.delete(lang),
      cancelButtonText: assignmentPageLanguage.cancel(lang),
      confirmButtonColor: "#F04438",
      customClass: { popup: "rounded-2xl border border-gray-100 shadow-md" },
    });
    if (!answer.isConfirmed) return;
    try {
      await deleteComment.mutateAsync({ commentOnAssignmentId: comment.id });
    } catch (error) {
      workError(error, lang);
    }
  };

  return (
    <section>
      <h3 className="mx-0.5 mb-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7A80A0]">
        {assignmentPageLanguage.commentsCount(lang, list.length)}
      </h3>
      <ul className="flex list-none flex-col gap-2">
        {list.map((comment) => (
          <Bubble
            key={comment.id}
            comment={comment}
            lang={lang}
            onDelete={remove}
          />
        ))}
        <li ref={endRef} aria-hidden />
      </ul>
      <form
        onSubmit={send}
        className="chunky mt-3 flex items-end gap-2 p-2"
        style={{ borderRadius: 16 }}
      >
        <textarea
          ref={areaRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={assignmentPageLanguage.addComment(lang)}
          aria-label={assignmentPageLanguage.addComment(lang)}
          className="max-h-24 min-h-[38px] w-full resize-none rounded-[14px] bg-[#F2F4F8] px-3 py-2 text-[14px] leading-5 text-icon-color outline-none"
        />
        <button
          type="submit"
          disabled={create.isPending || commentDraftIsEmpty(draft)}
          aria-label={assignmentPageLanguage.sendComment(lang)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-color text-lg text-white disabled:opacity-50"
          style={{ boxShadow: "0 3px 0 #275d96" }}
        >
          <LuSend aria-hidden />
        </button>
      </form>
    </section>
  );
}
