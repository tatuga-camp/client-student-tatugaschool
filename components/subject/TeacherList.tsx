import Image from "next/image";
import React from "react";
import { TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

type Props = {
  teachers: TeacherOnSubject[];
};
function TeacherList({ teachers }: Props) {
  return (
    <div className="w-4/12  border p-2 rounded-md h-max">
      <h2 className="font-semibold text-xl p-2">Teachers</h2>
      <ul className="gap-2 grid max-h-60 overflow-y-auto">
        {teachers.map((teacher) => {
          return (
            <li
              key={teacher.id}
              className="flex items-center gap-2 p-2 bg-white rounded-md"
            >
              <div className="w-10 h-10 relative rounded-full overflow-hidden ring-1 ring-white">
                <Image
                  src={teacher.photo}
                  alt="user avatar"
                  fill
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    teacher.blurHash ?? defaultBlurHash
                  )}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-0 leading-3">
                <h3 className="font-semibold text-lg">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-sm text-gray-500">{teacher.email}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TeacherList;
