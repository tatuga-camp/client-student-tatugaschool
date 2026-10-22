import React from "react";
import Image from "next/image";
import { MdPhotoCamera } from "react-icons/md";
import { profileLanguage } from "../../data/languages";
import { Language, Student } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = {
  student: Student;
  language: Language;
  onEditPhoto: () => void;
};

function ProfileHeaderCard({ student, language, onEditPhoto }: Props) {
  const initials =
    (Array.from(student.firstName ?? "")[0] ?? "") +
    (Array.from(student.lastName ?? "")[0] ?? "");

  return (
    <section className="flex w-full items-center gap-4 rounded-2xl border bg-white p-4">
      <button
        type="button"
        onClick={onEditPhoto}
        aria-label={profileLanguage.profilePhoto(language)}
        className="relative h-14 w-14 shrink-0"
      >
        <span className="relative block h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-primary-color to-primary-color-hover">
          {student.photo ? (
            <Image
              src={student.photo}
              alt={`${student.firstName} - ${profileLanguage.profilePhoto(language)}`}
              fill
              sizes="56px"
              className="object-cover"
              {...(student.blurHash
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: decodeBlurhashToCanvas(student.blurHash),
                  }
                : {})}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
              {initials}
            </span>
          )}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-color shadow ring-1 ring-black/10">
          <MdPhotoCamera size={12} />
        </span>
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold">
          {student.title} {student.firstName} {student.lastName}
        </h1>
        <p className="text-sm text-gray-500">
          {profileLanguage.student(language)}
          {student.number
            ? ` · ${profileLanguage.number(language, student.number)}`
            : ""}
        </p>
      </div>
    </section>
  );
}

export default ProfileHeaderCard;
