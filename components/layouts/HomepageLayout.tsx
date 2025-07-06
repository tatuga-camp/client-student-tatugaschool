import type { ReactNode } from "react";
import Navbar from "../Navbar";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetSubjectByCodeService } from "../../services";
import Header from "../subject/Header";
import TeacherList from "../subject/TeacherList";

type LayoutProps = {
  children: ReactNode;
  subject: UseQueryResult<ResponseGetSubjectByCodeService, Error>;
};

function HomepageLayout({ children, subject }: LayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      {" "}
      <div className="absolute top-3 z-50 w-full px-3">
        <Navbar />
      </div>
      <main className="flex w-full flex-col items-center bg-orange-50 font-Anuphan">
        <div className="hidden h-40 w-full bg-sky-100 md:block"></div>
        {subject.data && <Header subject={subject.data} />}
        <section className="flex w-11/12 flex-col-reverse justify-center gap-5 px-0 pb-40 md:px-40 xl:flex-row">
          {children}
          {subject.data && (
            <div className="bg flex w-full flex-col gap-2 md:w-4/12">
              <TeacherList teachers={subject.data?.teacherOnSubjects} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomepageLayout;
