import { TeacherOnSubject } from "../../interfaces";
import { PhotoOrFallback } from "../app/PhotoOrFallback";

type Props = { teacher: TeacherOnSubject; size: number };

/** A teacher's photo that falls back to their initials if it will not load. */
export function TeacherPhoto({ teacher, size }: Props) {
  const small = size < 32;
  const initials = small
    ? (teacher.firstName[0] ?? "")
    : `${teacher.firstName[0] ?? ""}${teacher.lastName[0] ?? ""}`;
  return (
    <PhotoOrFallback
      src={teacher.photo}
      blurHash={teacher.blurHash}
      sizes={`${size}px`}
      fallback={
        <span
          aria-hidden
          className={`flex h-full w-full items-center justify-center bg-[#E8F1FD] ${small ? "text-[10px]" : "text-[11px]"} font-bold uppercase text-[#2C7CD1]`}
        >
          {initials}
        </span>
      }
    />
  );
}
