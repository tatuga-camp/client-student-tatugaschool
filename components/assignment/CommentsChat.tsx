import parse from "html-react-parser";
import React, { useEffect, useRef, useState } from "react";
import { LuSend, LuTrash2 } from "react-icons/lu";
import { useDetailActive } from "../app/shell/DetailActive";
import { safeHtmlReplace } from "../../utils/safeHtml";
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

/** The teacher's photo, or their initials when there is none (or it fails). */
function Avatar({ comment }: { comment: CommentOnAssignment }) {
  const [failed, setFailed] = useState(false);
  const initials = [comment.firstName, comment.lastName]
    .map((n) => n?.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase();
  return (
    <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#D9E6F7] text-[10px] font-bold text-primary-color">
      {comment.photo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={comment.photo}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}

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
        {!mine && <Avatar comment={comment} />}
        <div
          className={`min-w-0 max-w-[78%] break-words px-3 py-1.5 text-[13px] leading-snug [&_a]:underline ${
            mine
              ? "rounded-2xl rounded-br-[4px] bg-primary-color text-white"
              : "rounded-2xl rounded-bl-[4px] bg-[#EEF1F6] text-icon-color"
          }`}
        >
          {parse(comment.content, { replace: safeHtmlReplace })}
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
  // Only the live (topmost) detail page polls; one on its way out stops.
  const active = useDetailActive();
  const comments = useGetComments({
    studentOnAssignmentId,
    refetchInterval: active ? POLL_MS : false,
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
    const style = getComputedStyle(area);
    const line = parseFloat(style.lineHeight) || 24;
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    area.style.height = `${Math.min(area.scrollHeight, line * MAX_LINES + padding)}px`;
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
          className="min-h-[40px] w-full resize-none overflow-y-auto rounded-[14px] bg-[#F2F4F8] px-3 py-2 text-[16px] leading-6 text-icon-color outline-none"
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
