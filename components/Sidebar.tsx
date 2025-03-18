import React, { memo, ReactNode, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash, defaultCanvas } from "../data";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectByCode,
} from "../react-query";
import Link from "next/link";
import { sidebarDataLanguage } from "../data/language";

type Props = {
  active: boolean;
  menuList: { title: string; icon: ReactNode; url?: string }[];
};

function Sidebar({ active, menuList }: Props) {
  const router = useRouter();
  const language = useGetLanguage();
  const [selectMenu, setSelectMenu] = React.useState("Dashboard");
  const student = useGetStudent();
  useEffect(() => {
    if (router.pathname === "/") {
      setSelectMenu("Dashboard");
    } else if (router.pathname === "/subject/[subjectId]") {
      setSelectMenu("Subject");
    } else if (router.pathname === "/student/[studentId]") {
      setSelectMenu("Profile");
    }
  }, [router.pathname]);

  return (
    <div
      className={`text-black  fixed z-50  overflow-hidden  flex-col items-center justify-start gap-3
            transition-width gradient-bg h-full  ${
              active ? "w-60  p-5 flex" : "md:w-14 hidden"
            } `}
    >
      <ul
        className={`${
          !active && "place-items-center"
        }  grid  gap-2 pt-5 w-full`}
      >
        <Link
          href="/"
          className="flex items-center md:hidden  justify-center gap-1 md:gap-2"
        >
          <div
            className="w-5 h-5 rounded-md overflow-hidden ring-1 ring-white
         relative hover:scale-105 active:scale-110 transition duration-150"
          >
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="font-bold uppercase block text-xs md:text-base text-white">
            Tatuga School
          </div>
        </Link>
        {student.data && (
          <div className="gap-2 md:hidden flex bg-white rounded-md">
            <div className="w-10 h-10 relative rounded-full overflow-hidden ">
              <Image
                src={student.data.photo || defaultCanvas}
                alt="User Avatar"
                fill
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  student.data.blurHash ?? defaultBlurHash
                )}
                className=" object-cover cursor-pointer"
              />
            </div>
            <div
              className="items-start overflow-hidden w-max h-max duration-300 
          transition-width flex-col justify-center gap-0 flex"
            >
              <h2 className="font-semibold text-sm text-gray-800">
                Number {student.data.number}
              </h2>
              <span className="text-xs text-gray-500">
                {student.data.firstName} {student.data.lastName}
              </span>
            </div>
          </div>
        )}
        {menuList.map((menu, index) => {
          return (
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                if (menu.url) {
                  router.push(menu.url);
                } else {
                  router.replace({
                    query: { ...router.query, menu: menu.title },
                  });
                  setSelectMenu(menu.title);
                }
              }}
              key={index}
              className={`flex ${
                menu.title === selectMenu && "bg-primary-color text-white"
              } items-center text-white  justify-start gap-2 p-2 rounded-md 
             hover:bg-gray-200/50 h-10 active:bg-primary-color hover:text-white`}
            >
              {menu.icon}
              {active && (
                <span>
                  {sidebarDataLanguage[
                    menu.title.toLowerCase() as keyof typeof sidebarDataLanguage
                  ](language.data ?? "en")}
                </span>
              )}
            </button>
          );
        })}
      </ul>
    </div>
  );
}

export default memo(Sidebar);
