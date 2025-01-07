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
};

function Layout({ children, listData }: LayoutProps) {
  const [trigger, setTrigger] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [subject_code, setSubjectCode] = React.useState<null | string>();
  const router = useRouter();
  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });

  const subject = useGetSubjectById({ id: router.query.subjectId as string });
  const student = useGetStudent();

  useEffect(() => {
    if (subject.data) {
      setSubjectCode(() => subject.data.code);
    }
  }, [subject.data]);
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
                  url: `/?subject_code=${subject_code}`,
                },
              ]}
              active={trigger}
            />
          )}
        </div>

        <div className="w-full flex flex-col">
          <main className="w-full h-1 grow bg-gray-50  overflow-y-auto">
            <div className="w-full bg-sky-100 h-40"></div>
            {subject.data && <Header subject={subject.data} />}
            <section className="w-full px-40 justify-center gap-5 pb-20 flex">
              {children}
              {subject.data && (
                <div className="w-4/12 bg flex flex-col gap-2">
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
