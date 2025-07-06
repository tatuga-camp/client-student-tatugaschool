import { useRouter } from "next/router";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { FaBookOpen, FaHome, FaUser } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import useClickOutside from "../../hook/useClickOutside";
import { useGetStudent, useGetSubjectById } from "../../react-query";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

import Header from "../subject/Header";
import TeacherList from "../subject/TeacherList";
import Footbar from "../Footbar";
import { PiStudent } from "react-icons/pi";
import { MdHome } from "react-icons/md";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

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
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute top-3 z-50 w-full px-3">
        <Navbar
          subject={subject}
          student={student.data}
          trigger={trigger}
          setTrigger={setTrigger}
        />
      </div>
      {student.data && subject.data && (
        <Footbar
          onClick={(item) => {
            if (item.url) {
              router.push(item.url);
            }
          }}
          menuList={[
            {
              title: "Student",
              icon: (
                <div className="relative h-7 w-7 overflow-hidden rounded-full ring-1 ring-orange-400">
                  <Image
                    alt={`profile picture of ${student.data.firstName}`}
                    src={student.data.photo}
                    fill
                    className="object-cover"
                    blurDataURL={decodeBlurhashToCanvas(
                      student.data.blurHash ?? defaultBlurHash,
                    )}
                    placeholder="blur"
                  />
                </div>
              ),
              url: `/student/${student.data.id}?subject_id=${subject.data.id}`,
            },

            {
              title: "Subject",
              icon: <FaBookOpen />,
              url: `/subject/${subject.data.id}`,
            },

            {
              title: "Home",
              icon: <FaHome />,
              url: `/`,
            },
          ]}
        />
      )}
      <main className="flex w-full flex-col items-center bg-orange-50 font-Anuphan">
        <div className="hidden h-40 w-full bg-sky-100 md:block"></div>
        {subject.data && !router.pathname.startsWith("/student/") && (
          <Header subject={subject.data} />
        )}
        <section className="flex w-11/12 flex-col-reverse justify-center gap-5 px-0 pb-40 md:px-40 xl:flex-row">
          {children}
          {subject.data && !router.pathname.startsWith("/student/") && (
            <div className="bg flex w-full flex-col gap-2 xl:w-4/12">
              <TeacherList teachers={subject.data?.teacherOnSubjects} />
              {listData}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Layout;
