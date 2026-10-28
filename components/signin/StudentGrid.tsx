import { LuLoader } from "react-icons/lu";
import { subjectDataLanguage as t } from "../../data/languages";
import { Language, StudentOnSubject } from "../../interfaces";
import { mascotForStudent, mascotHash } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";

const TINTS = [
  "#FFF6D6",
  "#E5F7EC",
  "#FDE8F2",
  "#F1EAFE",
  "#E0F5F2",
  "#E8F1FD",
];

/** A stable pastel per student, so a mascot keeps its colour. */
export const tintFor = (id: string) => TINTS[mascotHash(id) % TINTS.length];

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
        return (
          <li key={student.id}>
            <button
              type="button"
              disabled={off || pendingId !== null}
              onClick={() => onPick(student)}
              className={`chunky relative flex w-full flex-col items-center gap-1 px-1 pb-2 pt-2.5 transition active:translate-y-0.5 ${
                off ? "opacity-45" : ""
              }`}
              style={pending ? { borderColor: "#2C7CD1" } : undefined}
            >
              <span
                className="relative h-[54px] w-[54px] rounded-full"
                style={{ background: tintFor(student.id) }}
              >
                <MascotAvatar
                  clips={mascotForStudent(student)}
                  alt=""
                  id={student.id}
                  idle={false}
                  sizes="54px"
                />
              </span>
              <span className="w-full truncate text-xs font-bold text-[#383767]">
                {student.firstName}
              </span>
              <span className="text-[10px] font-semibold text-[#7A80A0]">
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
