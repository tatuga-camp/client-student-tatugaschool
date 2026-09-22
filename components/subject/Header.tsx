import React from "react";
import { Subject } from "../../interfaces";
import SubjectSummaryCard from "../student/SubjectSummaryCard";

type Props = {
  subject: Subject;
};

/** Thin wrapper — keeps existing import sites working. */
function Header({ subject }: Props) {
  return <SubjectSummaryCard subject={subject} />;
}

export default Header;
