import type { ReactNode } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { IoMenu } from "react-icons/io5";
import React, { useEffect } from "react";
import useClickOutside from "../../hook/useClickOutside";
import { useRouter } from "next/router";
import { useGetStudent, useGetSubjectById } from "../../react-query";
import { FaBookOpen, FaUser } from "react-icons/fa";

import Header from "../subject/Header";
import TeacherList from "../subject/TeacherList";
import { getLocalStorage } from "../../utils";

type LayoutProps = {
  children: ReactNode;
  listData?: ReactNode;
  subjectId?: string;
};

function Layout({ children, listData, subjectId }: LayoutProps) {
  const [trigger, setTrigger] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [subject_code, setSubjectCode] = React.useState<null | string>();
  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });
  const router = useRouter();

  const subject = useGetSubjectById({ id: subjectId ?? "" });
  const student = useGetStudent();

  useEffect(() => {
    if (subject.data) {
      setSubjectCode(() => subject.data.code);
    }
  }, [subject.data]);
  return (
    <div className="flex h-screen  flex-col">
      <div ref={sidebarRef}>
        <Navbar
          subject={subject}
          student={student.data}
          trigger={trigger}
          setTrigger={setTrigger}
        />
        <div className="h-full">
          {student.data && subject.data && (
            <Sidebar
              menuList={[
                {
                  title: "Profile",
                  icon: <FaUser />,
                  url: `/student/${student.data.id}?subject_id=${subject.data.id}`,
                },

                {
                  title: "Subject",
                  icon: <FaBookOpen />,
                  url: `/subject/${subject.data.id}`,
                },

                {
                  title: "Homepage",
                  icon: <IoMenu />,
                  url: `/?subject_code=${subject_code}`,
                },
              ]}
              active={trigger}
            />
          )}
        </div>
      </div>
      <div className="flex h-full ">
        <div className="w-full flex flex-col">
          <main className="w-full h-1 grow bg-gray-50  overflow-y-auto">
            <div className="w-full hidden md:block bg-sky-100 h-40"></div>
            {subject.data && !router.pathname.startsWith("/student/") && (
              <Header subject={subject.data} />
            )}
            <section className="w-full px-0 md:px-40 xl:flex-row flex-col-reverse justify-center gap-5 pb-20 flex">
              {children}
              {subject.data && !router.pathname.startsWith("/student/") && (
                <div className="w-full xl:w-4/12 bg flex flex-col gap-2">
                  <TeacherList teachers={subject.data?.teacherOnSubjects} />
                  {listData}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
