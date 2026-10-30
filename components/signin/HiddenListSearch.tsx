import { subjectDataLanguage as t } from "../../data/languages";
import { Language, StudentOnSubject } from "../../interfaces";
import { highlightMatch } from "../../utils/studentSearch";
import MascotAvatar from "../student/MascotAvatar";
import { guideClips, tintFor } from "./mascotAvatars";
import { StudentAvatar } from "./StudentAvatar";

type Props = {
  /** Matches for the query; null until enough has been typed. */
  results: StudentOnSubject[] | null;
  query: string;
  lang: Language;
  pendingId: string | null;
  onPick: (student: StudentOnSubject) => void;
};

function Name({ text, query }: { text: string; query: string }) {
  const hit = highlightMatch(text, query);
  if (!hit) return <>{text}</>;
  return (
    <>
      {hit.before}
      <mark className="rounded bg-[#FFF1B8] text-inherit">{hit.match}</mark>
      {hit.after}
    </>
  );
}

/** Shown instead of the grid when the teacher hides the class list. */
export function HiddenListSearch({
  results,
  query,
  lang,
  pendingId,
  onPick,
}: Props) {
  return (
    <div>
      <div className="mb-3 flex items-end gap-1.5">
        {guideClips && (
          <div className="relative h-16 w-16 shrink-0">
            <MascotAvatar
              clips={guideClips}
              alt=""
              id="pick-guide"
              idle={false}
              sizes="64px"
            />
          </div>
        )}
        <p className="chunky mb-4 rounded-bl-[4px] px-2.5 py-2 text-xs font-bold leading-snug text-[#383767]">
          {t.findYourself(lang)}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {(results ?? []).map((student) => (
          <li
            key={student.id}
            className={`chunky flex items-center gap-3 px-2.5 py-2 ${
              student.isActive ? "" : "opacity-45"
            }`}
          >
            <span
              className="relative h-11 w-11 shrink-0 rounded-full"
              style={{ background: tintFor(student.studentId) }}
            >
              <StudentAvatar student={student} size={44} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-[#383767]">
                <Name
                  text={`${student.firstName} ${student.lastName}`}
                  query={query}
                />
              </span>
              <span className="text-xs font-semibold text-[#7A80A0]">
                {t.numberShort(lang)} {student.number}
                {!student.isActive && ` · ${t.disabled(lang)}`}
              </span>
            </span>
            <button
              type="button"
              className="chunky-btn h-9 shrink-0 px-3 text-sm disabled:opacity-50 aria-disabled:opacity-50"
              disabled={!student.isActive}
              // Pending: ignore presses but keep focus here (see StudentGrid).
              aria-disabled={pendingId !== null || undefined}
              onClick={() => {
                if (pendingId === null) onPick(student);
              }}
            >
              {t.thatsMe(lang)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
