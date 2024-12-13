import type { ReactNode } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { IoMenu } from "react-icons/io5";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import { useRouter } from "next/router";
import { useGetStudent, useGetSubjectById } from "../../react-query";
import { FaBookOpen, FaUser } from "react-icons/fa";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetSubjectByCodeService } from "../../services";
import Header from "../subject/Header";
import TeacherList from "../subject/TeacherList";

type LayoutProps = {
  children: ReactNode;
  subject: UseQueryResult<ResponseGetSubjectByCodeService, Error>;
};

function Layout({ children }: LayoutProps) {
  const [trigger, setTrigger] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });

  const subject = useGetSubjectById({ id: router.query.subjectId as string });
  const student = useGetStudent();
  return (
    <div className="flex h-screen  flex-col">
      <Navbar
        subject={subject}
        student={student.data}
        trigger={trigger}
        setTrigger={setTrigger}
      />
      <div className="flex h-full ">
        <div ref={sidebarRef} className="h-full">
          {subject.data && student.data && (
            <Sidebar
              menuList={[
                {
                  title: "Profile",
                  icon: <FaUser />,
                  url: `/student/${student.data.id}`,
                },
                {
                  title: "Subject",
                  icon: <FaBookOpen />,
                  url: `/subject/${subject.data.id}`,
                },
                {
                  title: "Homepage",
                  icon: <IoMenu />,
                  url: `/welcome`,
                },
              ]}
              active={trigger}
            />
          )}
        </div>

        <div className="w-full flex flex-col">
          <main className="w-full h-1 grow  bg-white overflow-y-auto">
            <div className="w-full bg-sky-100 h-40"></div>
            {subject.data && <Header subject={subject.data} />}
            <section className="w-full px-40 justify-center gap-5 pb-20 flex">
              {children}
              {subject.data && (
                <TeacherList teachers={subject.data?.teacherOnSubjects} />
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
