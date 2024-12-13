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

type Props = {
  student: Student;
};
function ButtonProfile({ student }: Props) {
  const queryClient = new QueryClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    queryClient.clear();
    destroyCookie(null, "access_token", { path: "/" });
    destroyCookie(null, "refresh_token", { path: "/" });
    router.push("/welcome");
  };
  return (
    <div className="flex items-center flex-1 justify-end ">
      <div className="flex items-center justify-end w-80 transition-width    bg-white rounded-lg px-4 py-2 gap-4">
        <button className="w-8 h-8 relative bg-white rounded-full  flex items-center justify-center text-primary-color">
          <div
            className="text-white absolute z-50 -right-1 -top-1 rounded-full flex 
      text-xs items-center justify-center  w-4 h-4 bg-red-600"
          >
            1
          </div>
          <FaBell />
        </button>
        <div className="flex gap-2">
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
              onClick={() => {
                router.push("/account");
              }}
            />
          </div>
          <div className=" items-start overflow-hiddenw-max h-max duration-300 transition-width flex-col justify-center gap-0 hidden md:flex">
            <h2 className="font-semibold text-sm text-gray-800">
              Number {student.number}
            </h2>
            <span className="text-xs text-gray-500">
              {student.firstName} {student.lastName}
            </span>
          </div>
        </div>
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
