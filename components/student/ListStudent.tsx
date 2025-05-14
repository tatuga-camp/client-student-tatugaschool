import Image from "next/image";
import React from "react";
import { Attendance, Student, StudentOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { GoChevronRight } from "react-icons/go";

type Props<T> = {
  student: T;
  odd: boolean;
  onClick: (student: T) => void;
  buttonText: string;
  isPedding?: boolean;
};
function ListStudent<
  T extends StudentOnSubject | (StudentOnSubject & { attendance: Attendance }),
>({ student, odd, onClick, buttonText, isPedding }: Props<T>) {
  return (
    <li
      key={student.id}
      className={`flex items-center justify-between py-2 hover:bg-gray-200/50 ${
        odd && "bg-gray-200/20"
      } gap-2`}
    >
      <div className="flex gap-2">
        <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1">
          <Image
            src={student.photo}
            alt={student.firstName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              student.blurHash ?? defaultBlurHash,
            )}
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-sm font-semibold">
            {student.firstName} {student.lastName}{" "}
          </h1>
          <p className="text-xs text-gray-500">
            Number {student.number} {!student.isActive && "(Disabled)"}
          </p>
        </div>
      </div>
      <button
        disabled={isPedding === true}
        onClick={() => onClick(student)}
        className="main-button flex items-center justify-center gap-1 px-4 py-1"
      >
        {isPedding === true ? (
          "Loading"
        ) : (
          <>
            {buttonText} <GoChevronRight />
          </>
        )}
      </button>
    </li>
  );
}

export default ListStudent;
