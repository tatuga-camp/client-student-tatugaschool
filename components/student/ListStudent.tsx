import Image from "next/image";
import React from "react";
import { Attendance, StudentOnSubject } from "../../interfaces";
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
      className={`flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-background-color ${
        odd ? "bg-background-color/60" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200">
          <Image
            src={student.photo}
            alt={student.firstName}
            fill
            sizes="40px"
            placeholder="blur"
            quality={50}
            blurDataURL={decodeBlurhashToCanvas(
              student.blurHash ?? defaultBlurHash,
            )}
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-icon-color">
            {student.firstName} {student.lastName}
          </h3>
          <p className="truncate text-xs text-gray-500">
            Number {student.number}
            {!student.isActive && " (Disabled)"}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={isPedding === true}
        onClick={() => onClick(student)}
        className="main-button flex h-9 shrink-0 items-center justify-center gap-1 px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {isPedding === true ? (
          "Loading"
        ) : (
          <>
            {buttonText}
            <GoChevronRight aria-hidden />
          </>
        )}
      </button>
    </li>
  );
}

export default ListStudent;
