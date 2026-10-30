import { LuLoader } from "react-icons/lu";
import { subjectDataLanguage as t } from "../../data/languages";
import { Language, StudentOnSubject } from "../../interfaces";
import { tintFor } from "./mascotAvatars";
import { StudentAvatar } from "./StudentAvatar";

type Props = {
  students: StudentOnSubject[];
  lang: Language;
  pendingId: string | null;
  onPick: (student: StudentOnSubject) => void;
};

export function StudentGrid({ students, lang, pendingId, onPick }: Props) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {students.map((student) => {
        const off = !student.isActive;
        const pending = pendingId === student.id;
        // While a sign-in is pending the tiles ignore presses but stay
        // focusable (not `disabled`), so the pressed tile keeps focus and the
        // password sheet can hand it back when it closes.
        const blocked = pendingId !== null;
        return (
          <li key={student.id}>
            <button
              type="button"
              disabled={off}
              aria-disabled={blocked || undefined}
              onClick={() => {
                if (!blocked) onPick(student);
              }}
              className={`chunky relative flex w-full flex-col items-center gap-1 px-1 pb-2 pt-2.5 transition active:translate-y-0.5 ${
                off ? "opacity-45" : ""
              }`}
              style={pending ? { borderColor: "#2C7CD1" } : undefined}
            >
              <span
                className="relative h-[54px] w-[54px] rounded-full"
                style={{ background: tintFor(student.studentId) }}
              >
                <StudentAvatar student={student} size={54} />
              </span>
              <span className="w-full truncate text-xs font-bold text-[#383767]">
                {student.firstName}
              </span>
              <span className="w-full truncate text-center text-[10px] font-semibold text-[#7A80A0]">
                {t.numberShort(lang)} {student.number}
                {off && ` · ${t.disabled(lang)}`}
              </span>
              {pending && (
                <LuLoader
                  aria-hidden
                  className="absolute right-1.5 top-1.5 animate-spin text-[#2C7CD1]"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
