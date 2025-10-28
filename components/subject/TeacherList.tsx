import Image from "next/image";
import React from "react";
import { TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { useGetLanguage } from "../../react-query";
import { subjectDataLanguage } from "../../data/language";

type Props = {
  teachers: TeacherOnSubject[];
};
function TeacherList({ teachers }: Props) {
  const language = useGetLanguage();
  return (
    <div className="h-max w-full rounded-none p-2 md:rounded-2xl md:border">
      <h2 className="p-2 text-xl font-semibold text-primary-color">
        {subjectDataLanguage.teacher(language.data ?? "en")}
      </h2>
      <ul className="grid max-h-60 gap-2 overflow-y-auto p-2">
        {teachers.map((teacher) => {
          return (
            <li
              key={teacher.id}
              className="flex items-center gap-2 rounded-2xl bg-white p-2 ring-1"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white">
                <Image
                  src={teacher.photo}
                  alt="user avatar"
                  fill
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    teacher.blurHash ?? defaultBlurHash,
                  )}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-0 leading-3">
                <h3 className="text-lg font-semibold">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-sm text-primary-color">{teacher.email}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TeacherList;
