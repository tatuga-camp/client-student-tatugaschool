import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
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
