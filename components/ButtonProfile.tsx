import { QueryClient, UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import router from "next/router";
import { destroyCookie } from "nookies";
import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { AiOutlineLogout } from "react-icons/ai";
import { Student } from "../interfaces";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash, defaultCanvas } from "../data";
import Link from "next/link";

type Props = {
  student: Student;
  subjectId: string;
};
function ButtonProfile({ student, subjectId }: Props) {
  const queryClient = new QueryClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    queryClient.clear();
    destroyCookie(null, "student_access_token", { path: "/" });
    destroyCookie(null, "student_refresh_token", { path: "/" });
    router.push("/welcome");
  };
  return (
    <div className="flex items-center flex-1 justify-end ">
      <div className="flex items-center justify-end w-max transition-width    bg-white rounded-lg px-4 py-2 gap-4">
        <Link
          href={`/student/${student.id}?subject_id=${subjectId}`}
          className="flex gap-2"
        >
          <div className="w-10 h-10 relative rounded-full overflow-hidden ">
            <Image
              src={student.photo || defaultCanvas}
              alt="User Avatar"
              fill
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash
              )}
              className=" object-cover cursor-pointer"
            />
          </div>
          <div
            className=" items-start overflow-hidden w-max h-max duration-300 
          transition-width flex-col justify-center gap-0 flex"
          >
            <h2 className="font-semibold text-sm text-gray-800">
              Number {student.number}
            </h2>
            <span className="text-xs text-gray-500">
              {student.firstName} {student.lastName}
            </span>
          </div>
        </Link>
        <button
          disabled={loading}
          onClick={handleLogout}
          className="flex hover:bg-red-600 transition duration-150 hover:drop-shadow-md active:scale-105
       items-center text-sm justify-center gap-2 px-3
     py-1 bg-red-500 text-white font-semibold rounded-md"
        >
          <AiOutlineLogout />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ButtonProfile;
