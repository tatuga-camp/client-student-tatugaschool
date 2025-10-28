import React from "react";
import { MemberRole, Status, TeacherOnSubject } from "../interfaces";
import Image from "next/image";
import { IoIosSend } from "react-icons/io";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash } from "../data";

type Props = {
  members: {
    id: string;
    createAt: Date;
    updateAt: Date;
    status: Status;
    role: MemberRole;
    firstName: string;
    lastName: string;
    email: string;
    blurHash: string;
    photo: string;
    phone: string;
    userId: string;
    schoolId: string;
  }[];
  setTrigger?: React.Dispatch<React.SetStateAction<boolean>>;
};
function ListMemberCircle({ members, setTrigger }: Props) {
  return (
    <div className="flex w-max items-end justify-center">
      {members.map((teacher, index) => {
        const odd = index % 2 === 0;
        ``;

        return (
          <div
            style={{ left: `-${index * 5}px` }}
            className={`relative h-6 w-6 overflow-hidden rounded-full bg-slate-700 ring-1 ring-white`}
            key={teacher.id}
          >
            <Image
              src={teacher.photo}
              alt="User Avatar"
              fill
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                teacher.blurHash ?? defaultBlurHash,
              )}
              className="cursor-pointer object-cover"
            />
          </div>
        );
      })}
      {setTrigger && (
        <button
          onClick={() => setTrigger(true)}
          aria-label="invite teacher to subject"
          className="flex w-max items-center justify-center gap-1 rounded-2xl bg-white px-2 py-1 text-xs text-primary-color hover:bg-primary-color hover:text-white active:scale-110"
        >
          invite
          <IoIosSend />
        </button>
      )}
    </div>
  );
}

export default ListMemberCircle;
