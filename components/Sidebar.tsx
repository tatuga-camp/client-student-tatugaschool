import React, { memo, ReactNode, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash, defaultCanvas } from "../data";
import { useGetSubjectByCode } from "../react-query";
import Link from "next/link";

type Props = {
  active: boolean;
  menuList: { title: string; icon: ReactNode; url?: string }[];
};

function Sidebar({ active, menuList }: Props) {
  const router = useRouter();
  const [selectMenu, setSelectMenu] = React.useState("Dashboard");

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
              {active && <span>{menu.title}</span>}
            </button>
          );
        })}
      </ul>
    </div>
  );
}

export default memo(Sidebar);
