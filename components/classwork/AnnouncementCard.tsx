import parse from "html-react-parser";
import Image from "next/image";
import { LuMegaphone, LuMessageCircle, LuPaperclip } from "react-icons/lu";
import { announcementDataLanguage } from "../../data/languages";
import { Announcement, Language } from "../../interfaces";
import { useToggleAnnouncementReaction } from "../../react-query";

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "🎉"];

type Props = {
  announcement: Announcement;
  subjectId: string;
  studentId: string;
  lang: Language;
  /** Flashes a primary outline (deep link arrival). */
  flash: boolean;
  onOpenComments: (announcementId: string) => void;
};

export default function AnnouncementCard({
  announcement,
  subjectId,
  studentId,
  lang,
  flash,
  onOpenComments,
}: Props) {
  const toggleReaction = useToggleAnnouncementReaction({ subjectId });

  const myReaction = announcement.reactions.find(
    (r) => r.studentId === studentId,
  );
  const reactionCounts = announcement.reactions.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <li
      id={`announcement-${announcement.id}`}
      className="list-none rounded-2xl border-2 border-b-4 border-[#E3E8F0] bg-white p-4 font-Anuphan"
      style={{
        outline: flash ? "2px solid #2C7CD1" : "2px solid transparent",
        outlineOffset: 2,
        backgroundColor: flash ? "#EAF2FC" : undefined,
        transition: "outline-color 300ms, background-color 300ms",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-color/10 text-xl text-primary-color">
          {announcement.photo ? (
            <Image
              fill
              sizes="40px"
              src={announcement.photo}
              alt=""
              className="object-cover"
            />
          ) : (
            <LuMegaphone aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold text-icon-color">
            {announcement.firstName} {announcement.lastName}
          </span>
          <span className="text-xs text-[#7A80A0]">
            {new Date(announcement.createAt).toLocaleDateString(
              lang === "th" ? "th-TH" : "en-US",
              { year: "numeric", month: "short", day: "numeric" },
            )}
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-[15px] font-bold leading-snug text-icon-color">
        {announcement.title}
      </h3>
      <div className="mt-1 break-words text-sm text-gray-700 [&_a]:text-primary-color [&_a]:underline [&_img]:max-w-full">
        {parse(announcement.content)}
      </div>

      {announcement.files.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          <span className="flex items-center gap-1 text-xs font-bold text-[#7A80A0]">
            <LuPaperclip aria-hidden />
            {announcementDataLanguage.attachments(lang)}
          </span>
          {announcement.files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center gap-2 rounded-xl border-2 border-[#E3E8F0] px-3 text-xs font-bold text-primary-color"
            >
              <LuPaperclip aria-hidden className="shrink-0" />
              <span className="truncate">{file.name ?? file.url}</span>
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t-2 border-[#F0F3F8] pt-3">
        {REACTION_EMOJIS.map((emoji) => {
          const count = reactionCounts[emoji] ?? 0;
          const isMine = myReaction?.emoji === emoji;
          return (
            <button
              key={emoji}
              type="button"
              aria-pressed={isMine}
              aria-label={`${announcementDataLanguage.react(lang)} ${emoji}`}
              disabled={toggleReaction.isPending}
              onClick={() =>
                toggleReaction.mutate({
                  announcementId: announcement.id,
                  emoji,
                })
              }
              className={`flex min-h-10 items-center gap-1 rounded-full border-2 px-2.5 text-sm disabled:opacity-60 ${
                isMine
                  ? "border-primary-color bg-primary-color/10"
                  : "border-transparent bg-[#F2F4F8]"
              }`}
            >
              <span aria-hidden>{emoji}</span>
              {count > 0 && (
                <span
                  className={`text-xs font-bold ${isMine ? "text-primary-color" : "text-[#7A80A0]"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onOpenComments(announcement.id)}
          className="ml-auto flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold text-[#7A80A0]"
        >
          <LuMessageCircle aria-hidden className="text-base" />
          {announcement._count.comments}{" "}
          {announcementDataLanguage.comments(lang)}
        </button>
      </div>
    </li>
  );
}
