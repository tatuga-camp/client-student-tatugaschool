import React from "react";
import { Student, Subject } from "../interfaces";
import ButtonProfile from "./ButtonProfile";
import NotificationBell from "./NotificationBell";

type NavbarProps = {
  student?: Student;
  subject?: Subject;
};

function Navbar({ student, subject }: NavbarProps) {
  return (
    <nav className="flex w-full items-center justify-end gap-2">
      {student && <NotificationBell />}
      {student && subject && (
        <ButtonProfile student={student} subjectId={subject.id} />
      )}
    </nav>
  );
}

export default Navbar;
