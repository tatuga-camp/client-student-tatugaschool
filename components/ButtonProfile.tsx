import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { destroyCookie } from "nookies";
import { useRef, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { FiHelpCircle } from "react-icons/fi";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdNewReleases,
} from "react-icons/md";
import { defaultBlurHash, defaultCanvas } from "../data";
import { navbarLanguageData } from "../data/languages";
import useClickOutside from "../hook/useClickOutside";
import { Student } from "../interfaces";
import { useGetLanguage } from "../react-query";
import { decodeBlurhashToCanvas } from "../utils";
import LanguageSelect from "./LanguageSelect";

type Props = {
  student: Student;
};

function ButtonProfile({ student }: Props) {
  const queryClient = useQueryClient();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  const handleLogout = () => {
    setLoading(true);
    // 1. Stop in-flight/triggered requests so the axios refresh interceptor
    //    can't refresh and re-set the student_access_token cookie.
    queryClient.cancelQueries();
    queryClient.clear();
    // 2. Delete both cookies (path must match how they were set: "/").
    destroyCookie(null, "student_access_token", { path: "/" });
    destroyCookie(null, "student_refresh_token", { path: "/" });
    // 3. Hard redirect (NOT router.push): tears down the React tree so no
    //    query can refetch and re-mint the token after we've logged out.
    window.location.href = "/welcome";
  };

  return (
    <div className="relative flex items-center justify-end" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 transition-colors hover:bg-gray-50"
      >
        <div className="relative h-7 w-7 overflow-hidden rounded-full">
          <Image
            src={student.photo || defaultCanvas}
            alt={`${student.firstName} avatar`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              student.blurHash ?? defaultBlurHash,
            )}
            className="object-cover"
          />
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 md:block">
          {student.firstName}
        </span>
        {isOpen ? (
          <MdKeyboardArrowUp className="text-gray-500" size={20} />
        ) : (
          <MdKeyboardArrowDown className="text-gray-500" size={20} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {/* Header */}
          <div className="mb-2 flex items-center gap-3 border-b border-gray-100 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image
                src={student.photo || defaultCanvas}
                alt={`${student.firstName} avatar`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  student.blurHash ?? defaultBlurHash,
                )}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-semibold text-gray-800">
                {student.firstName} {student.lastName}
              </span>
              <span className="truncate text-xs text-gray-500">
                {navbarLanguageData.classNo(lang)} {student.number}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="flex flex-col gap-1">
            <Link
              href="https://tatugaschool.com/support/contact-us"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <FiHelpCircle size={18} className="text-gray-500" />
              {navbarLanguageData.helpCenter(lang)}
            </Link>

            <Link
              href="https://tatugaschool.com/news"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <MdNewReleases size={18} className="text-gray-500" />
              {navbarLanguageData.whatsNew(lang)}
            </Link>

            <div className="my-1 border-t border-gray-100"></div>

            <div className="px-3 py-1">
              <LanguageSelect />
            </div>

            <div className="my-1 border-t border-gray-100"></div>

            <button
              disabled={loading}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <AiOutlineLogout
                size={18}
                className={loading ? "text-gray-300" : "text-red-500"}
              />
              {navbarLanguageData.logoutButton(lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonProfile;
