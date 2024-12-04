import Image from "next/image";
import Link from "next/link";
import React from "react";
import { IoMenu } from "react-icons/io5";
import { defaultCanvas } from "../data";
import { useGetSubjectByCode } from "../react-query";
import Sidebar from "./Sidebar";
import useClickOutside from "../hook/useClickOutside";

type NavbarProps = {
  trigger: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
};
function Navbar({ trigger, setTrigger }: NavbarProps) {
  return (
    <nav className="w-full font-Anuphan  ">
      <section className="w-full gradient-bg z-20 gap-5 flex items-center justify-start p-3">
        <button
          onClick={() => setTrigger(!trigger)}
          className={`text-black flex ${
            trigger ? "rotate-90" : "rotate-0"
          }  hover:bg-primary-color bg-white transition duration-150 hover:text-white 
      items-center justify-center rounded-full text-base border-2 border-gray-200 p-1`}
        >
          <IoMenu />
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-1 md:gap-2"
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
          <div className="font-bold uppercase hidden md:block text-xs md:text-base text-white">
            Tatuga School
          </div>
        </Link>
      </section>
    </nav>
  );
}

export default Navbar;
