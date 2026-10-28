import Image from "next/image";
import { useState } from "react";
import { defaultBlurHash } from "../../data";
import { TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = { teacher: TeacherOnSubject; size: number };

/** A teacher's photo that falls back to their initials if it will not load. */
export function TeacherPhoto({ teacher, size }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed || !teacher.photo) {
    const initials = `${teacher.firstName[0] ?? ""}${teacher.lastName[0] ?? ""}`;
    return (
      <span
        aria-hidden
        className="flex h-full w-full items-center justify-center bg-[#E8F1FD] text-[11px] font-bold uppercase text-[#2C7CD1]"
      >
        {initials}
      </span>
    );
  }
  return (
    <Image
      src={teacher.photo}
      alt=""
      fill
      sizes={`${size}px`}
      placeholder="blur"
      blurDataURL={decodeBlurhashToCanvas(teacher.blurHash ?? defaultBlurHash)}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
