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
    <div className="w-max flex items-end justify-center">
      {members.map((teacher, index) => {
        const odd = index % 2 === 0;
        ``;

        return (
          <div
            style={{ left: `-${index * 5}px` }}
            className={`w-6 h-6 ring-1  ring-white bg-slate-700 relative rounded-full overflow-hidden`}
            key={teacher.id}
          >
            <Image
              src={teacher.photo}
              alt="User Avatar"
              fill
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                teacher.blurHash ?? defaultBlurHash
              )}
              className=" object-cover cursor-pointer"
            />
          </div>
        );
      })}
      {setTrigger && (
        <button
          onClick={() => setTrigger(true)}
          aria-label="invite teacher to subject"
          className="flex items-center text-xs active:scale-110 justify-center gap-1 hover:bg-primary-color hover:text-white
               text-primary-color bg-white w-max px-2 py-1 rounded-md"
        >
          invite
          <IoIosSend />
        </button>
      )}
    </div>
  );
}

export default ListMemberCircle;
