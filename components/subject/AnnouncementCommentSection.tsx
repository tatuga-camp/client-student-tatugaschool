import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";
import { MdDelete } from "react-icons/md";
import { announcementDataLanguage } from "../../data/languages";
import {
  useCreateAnnouncementComment,
  useDeleteAnnouncementComment,
  useGetAnnouncementComments,
  useGetLanguage,
} from "../../react-query";
import { timeAgo } from "../../utils";

type Props = {
  announcementId: string;
  studentId: string;
};

function AnnouncementCommentSection({ announcementId, studentId }: Props) {
  const language = useGetLanguage();
  const comments = useGetAnnouncementComments({ announcementId });
  const createComment = useCreateAnnouncementComment();
  const deleteComment = useDeleteAnnouncementComment();
  const [content, setContent] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || createComment.isPending) return;
    await createComment.mutateAsync({
      announcementId,
      content: content.trim(),
    });
    setContent("");
  };

  const handleDelete = async (commentOnAnnouncementId: string) => {
    try {
      setDeletingId(commentOnAnnouncementId);
      await deleteComment.mutateAsync({ commentOnAnnouncementId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <ul className="flex flex-col gap-2">
        {comments.data?.map((comment) => (
          <li key={comment.id} className="group flex items-start gap-2 text-sm">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={comment.photo || "/avatar.png"}
                alt={comment.firstName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 rounded-xl bg-gray-50 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">
                    {comment.firstName} {comment.lastName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {timeAgo({ pastTime: comment.createAt })}
                  </span>
                </div>
                {comment.studentId === studentId &&
                  (deletingId === comment.id ? (
                    <ProgressSpinner
                      animationDuration="0.5s"
                      style={{ width: "12px", height: "12px" }}
                      strokeWidth="8"
                    />
                  ) : (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-[10px] text-error-color opacity-0 underline transition group-hover:opacity-100"
                    >
                      {announcementDataLanguage.delete(language.data ?? "en")}
                    </button>
                  ))}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">
                {comment.content}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={announcementDataLanguage.writeComment(
            language.data ?? "en"
          )}
          className="flex-1 rounded-full border px-3 py-1.5 text-sm outline-none focus:border-primary-color"
        />
        <button
          type="submit"
          disabled={createComment.isPending || !content.trim()}
          className="rounded-full bg-primary-color px-4 py-1.5 text-sm text-white hover:bg-primary-color-hover disabled:opacity-50"
        >
          {createComment.isPending ? (
            <ProgressSpinner
              animationDuration="0.5s"
              style={{ width: "14px", height: "14px" }}
              strokeWidth="8"
            />
          ) : (
            announcementDataLanguage.send(language.data ?? "en")
          )}
        </button>
      </form>
    </div>
  );
}

export default AnnouncementCommentSection;
