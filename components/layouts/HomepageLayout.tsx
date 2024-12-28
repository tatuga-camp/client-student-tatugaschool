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
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex h-full ">
        <div className="w-full flex flex-col">
          <main className="w-full h-1 grow  bg-white overflow-y-auto">
            <div className="w-full bg-sky-100 h-40"></div>
            {subject.data && <Header subject={subject.data} />}
            <section className="w-full px-40 justify-center gap-5 pb-20 flex">
              {children}
              {subject.data && (
                <div className="w-4/12 bg flex flex-col gap-2">
                  <TeacherList teachers={subject.data?.teacherOnSubjects} />
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default HomepageLayout;
