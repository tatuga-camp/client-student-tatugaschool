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
      className={`gradient-bg fixed z-50 h-full flex-col items-center justify-start gap-3 overflow-hidden text-black transition-width ${
        active ? "flex w-60 p-5" : "hidden md:w-14"
      } `}
    >
      <ul
        className={`${!active && "place-items-center"} grid w-full gap-2 pt-5`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-1 md:hidden md:gap-2"
        >
          <div className="relative h-5 w-5 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="block text-xs font-bold uppercase text-white md:text-base">
            Tatuga School
          </div>
        </Link>
        {student.data && (
          <div className="flex gap-2 rounded-2xl bg-white md:hidden">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={student.data.photo || defaultCanvas}
                alt="User Avatar"
                fill
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  student.data.blurHash ?? defaultBlurHash,
                )}
                className="cursor-pointer object-cover"
              />
            </div>
            <div className="flex h-max w-max flex-col items-start justify-center gap-0 overflow-hidden transition-width duration-300">
              <h2 className="text-sm font-semibold text-gray-800">
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
              } h-10 items-center justify-start gap-2 rounded-2xl p-2 text-white hover:bg-gray-200/50 hover:text-white active:bg-primary-color`}
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
