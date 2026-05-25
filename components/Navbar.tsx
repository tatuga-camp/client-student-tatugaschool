import React from "react";
import { Student } from "../interfaces";
import ButtonProfile from "./ButtonProfile";

type NavbarProps = {
  student?: Student;
};

function Navbar({ student }: NavbarProps) {
  return (
    <nav className="flex w-full items-center justify-end">
      {student && <ButtonProfile student={student} />}
    </nav>
  );
}

export default Navbar;
