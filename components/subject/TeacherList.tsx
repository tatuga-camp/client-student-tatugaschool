import Image from "next/image";
import React from "react";
import { TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { useGetLanguage } from "../../react-query";
import { subjectDataLanguage } from "../../data/languages";

type Props = {
  teachers: TeacherOnSubject[];
};
function TeacherList({ teachers }: Props) {
  const language = useGetLanguage();
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-semibold text-icon-color">
        {subjectDataLanguage.teacher(language.data ?? "en")}
      </h2>
      <ul className="mt-3 divide-y divide-gray-100">
        {teachers.map((teacher) => {
          return (
            <li key={teacher.id} className="flex items-center gap-3 py-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200">
                <Image
                  src={teacher.photo}
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                  fill
                  sizes="40px"
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    teacher.blurHash ?? defaultBlurHash,
                  )}
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <h3 className="truncate text-sm font-semibold text-icon-color">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <a
                  href={`mailto:${teacher.email}`}
                  className="truncate text-xs text-primary-color hover:underline"
                >
                  {teacher.email}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TeacherList;
