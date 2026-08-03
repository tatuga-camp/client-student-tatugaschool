import Image from "next/image";
import parse from "html-react-parser";
import React from "react";
import { FiPaperclip } from "react-icons/fi";
import { IoChatbubbleOutline, IoMegaphoneOutline } from "react-icons/io5";
import { announcementDataLanguage } from "../../data/languages";
import { Announcement } from "../../interfaces";
import {
  useGetLanguage,
  useToggleAnnouncementReaction,
} from "../../react-query";
import AnnouncementCommentSection from "./AnnouncementCommentSection";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "🎉"];

type Props = {
  announcement: Announcement;
  subjectId: string;
  studentId: string;
};

function AnnouncementCard({ announcement, subjectId, studentId }: Props) {
  const language = useGetLanguage();
  const [showComments, setShowComments] = React.useState(false);
  const toggleReaction = useToggleAnnouncementReaction({ subjectId });

  const myReaction = announcement.reactions.find(
    (r) => r.studentId === studentId
  );

  const reactionCounts = announcement.reactions.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <li
      id={`announcement-${announcement.id}`}
      className="w-full rounded-2xl border border-primary-color/20 bg-white p-4 font-Anuphan shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-color/10 text-primary-color">
          {announcement.photo ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                fill
                sizes="40px"
                src={announcement.photo}
                alt={announcement.firstName}
                className="object-cover"
              />
            </div>
          ) : (
            <IoMegaphoneOutline />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {announcement.firstName} {announcement.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(announcement.createAt).toLocaleDateString(
              language.data === "th" ? "th-TH" : "en-US",
              { year: "numeric", month: "short", day: "numeric" }
            )}
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-base font-semibold">{announcement.title}</h3>
      <div className="mt-1 text-sm text-gray-700">
        {parse(announcement.content)}
      </div>

      {announcement.files.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <FiPaperclip />
            {announcementDataLanguage.attachments(language.data ?? "en")}
          </span>
          {announcement.files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate rounded-lg border p-2 text-xs text-primary-color hover:bg-primary-color/5"
            >
              {file.name ?? file.url}
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {REACTION_EMOJIS.map((emoji) => {
            const count = reactionCounts[emoji] ?? 0;
            const isMine = myReaction?.emoji === emoji;
            return (
              <button
                key={emoji}
                disabled={toggleReaction.isPending}
                onClick={() =>
                  toggleReaction.mutate({
                    announcementId: announcement.id,
                    emoji,
                  })
                }
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition disabled:opacity-50 ${
                  isMine
                    ? "bg-primary-color/15 ring-1 ring-primary-color"
                    : "hover:bg-gray-100"
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && (
                  <span className="text-xs text-gray-600">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-color"
        >
          <IoChatbubbleOutline />
          {announcement._count.comments}{" "}
          {announcementDataLanguage.comments(language.data ?? "en")}
        </button>
      </div>

      {showComments && (
        <AnnouncementCommentSection
          announcementId={announcement.id}
          studentId={studentId}
        />
      )}
    </li>
  );
}

export default AnnouncementCard;
