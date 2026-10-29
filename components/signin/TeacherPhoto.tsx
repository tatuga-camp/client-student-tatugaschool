import Image from "next/image";
import { useEffect, useState } from "react";
import { defaultBlurHash } from "../../data";
import { TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = { teacher: TeacherOnSubject; size: number };

/** A teacher's photo that falls back to their initials if it will not load. */
export function TeacherPhoto({ teacher, size }: Props) {
  // Remember which photo failed, so a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === teacher.photo;
  // The blur is drawn on a canvas, which the server doesn't have: made after
  // mount, so the server's markup and the first client render agree.
  const [blur, setBlur] = useState<string | null>(null);
  useEffect(() => {
    setBlur(decodeBlurhashToCanvas(teacher.blurHash ?? defaultBlurHash));
  }, [teacher.blurHash]);
  if (failed || !teacher.photo) {
    const small = size < 32;
    const initials = small
      ? (teacher.firstName[0] ?? "")
      : `${teacher.firstName[0] ?? ""}${teacher.lastName[0] ?? ""}`;
    return (
      <span
        aria-hidden
        className={`flex h-full w-full items-center justify-center bg-[#E8F1FD] ${small ? "text-[10px]" : "text-[11px]"} font-bold uppercase text-[#2C7CD1]`}
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
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur ?? undefined}
      className="object-cover"
      onError={() => setFailedSrc(teacher.photo)}
    />
  );
}
