import Image from "next/image";
import Link from "next/link";
import React from "react";
import { IoMenu } from "react-icons/io5";
import { defaultCanvas } from "../data";
import { useGetSubjectByCode, useGetSubjectById } from "../react-query";
import Sidebar from "./Sidebar";
import useClickOutside from "../hook/useClickOutside";
import { useRouter } from "next/router";
import { UseQueryResult } from "@tanstack/react-query";
import { Student, Subject } from "../interfaces";
import ButtonProfile from "./ButtonProfile";
import LanguageSelect from "./LanguageSelect";

type NavbarProps = {
  trigger?: boolean;
  setTrigger?: React.Dispatch<React.SetStateAction<boolean>>;
  subject?: UseQueryResult<Subject, Error>;
  student?: Student;
};
function Navbar({ trigger, setTrigger, subject, student }: NavbarProps) {
  return (
    <nav className="flex w-full items-center justify-between">
      <LanguageSelect />
      {student && subject?.data && (
        <ButtonProfile student={student} subjectId={subject?.data.id} />
      )}
    </nav>
  );
}

export default Navbar;
