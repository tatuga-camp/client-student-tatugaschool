import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import router from "next/router";
import { destroyCookie } from "nookies";
import { useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { defaultBlurHash, defaultCanvas } from "../data";
import { Student } from "../interfaces";
import { decodeBlurhashToCanvas } from "../utils";

type Props = {
  student: Student;
  subjectId: string;
};
function ButtonProfile({ student, subjectId }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    queryClient.clear();
    destroyCookie(null, "student_access_token", { path: "/" });
    destroyCookie(null, "student_refresh_token", { path: "/" });
    router.push("/welcome");
  };
  return (
    <div className="flex h-12 flex-1 items-center justify-end rounded-md">
      <div className="flex w-max items-center justify-end gap-4 rounded-md py-2 transition-width">
        <button
          disabled={loading}
          onClick={handleLogout}
          className="flex h-10 w-32 items-center justify-center gap-2 rounded-md bg-red-500 px-3 py-1 text-lg font-normal text-white transition duration-150 hover:bg-red-600 hover:drop-shadow-md active:scale-105"
        >
          <AiOutlineLogout />
          <span className="">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ButtonProfile;
