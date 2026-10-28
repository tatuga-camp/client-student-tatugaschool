import Image from "next/image";
import { LuMail } from "react-icons/lu";
import { defaultBlurHash } from "../../data";
import { subjectDataLanguage as t } from "../../data/languages";
import { Language, TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { Sheet } from "../app/Sheet";

type Props = {
  open: boolean;
  onClose: () => void;
  teachers: TeacherOnSubject[];
  lang: Language;
};

export function TeachersSheet({ open, onClose, teachers, lang }: Props) {
  const title = t.teachersSheetTitle(lang);
  return (
    <Sheet open={open} onClose={onClose} ariaLabel={title}>
      <h2 className="mb-2 text-lg font-extrabold text-[#383767]">{title}</h2>
      <ul className="divide-y divide-[#E3E8F0]">
        {teachers.map((teacher) => (
          <li key={teacher.id}>
            <a
              href={`mailto:${teacher.email}`}
              className="flex min-h-[56px] items-center gap-3 py-2"
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-[#E3E8F0]">
                <Image
                  src={teacher.photo}
                  alt=""
                  fill
                  sizes="44px"
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    teacher.blurHash ?? defaultBlurHash,
                  )}
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#383767]">
                  {teacher.firstName} {teacher.lastName}
                </span>
                <span className="block truncate text-xs text-[#2C7CD1]">
                  {teacher.email}
                </span>
              </span>
              <LuMail className="shrink-0 text-[#2C7CD1]" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
