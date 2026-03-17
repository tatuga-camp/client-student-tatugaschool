import { useRouter } from "next/router";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { FaBookOpen, FaHome } from "react-icons/fa";
import useClickOutside from "../../hook/useClickOutside";
import type { Menu } from "../Footbar";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import { sidebarDataLanguage } from "../../data/languages";
import Navbar from "../Navbar";

import Image from "next/image";
import { defaultBlurHash } from "../../data";
import { decodeBlurhashToCanvas } from "../../utils";
import Footbar from "../Footbar";
import Header from "../subject/Header";
import TeacherList from "../subject/TeacherList";
import { MdSubject, MdWork } from "react-icons/md";

type LayoutProps = {
  children: ReactNode;
  listData?: ReactNode;
  subjectId?: string;
  customMenus?: Menu[];
};

function Layout({ children, listData, subjectId, customMenus }: LayoutProps) {
  const [trigger, setTrigger] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [subject_code, setSubjectCode] = React.useState<null | string>();
  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });
  const router = useRouter();
  const language = useGetLanguage();
  const subject = useGetSubjectById({ id: subjectId ?? "" });
  const student = useGetStudent();

  useEffect(() => {
    if (subject.data) {
      setSubjectCode(() => subject.data.code);
    }
  }, [subject.data]);
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute top-3 z-50 h-max w-full px-3">
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
              title: sidebarDataLanguage.profile(language.data ?? "th"),
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
              title: sidebarDataLanguage.homepage(language.data ?? "th"),
              icon: <MdWork />,
              url: `/subject/${subject.data.id}`,
            },
            ...(customMenus ? customMenus : []),
            {
              title: sidebarDataLanguage.subject(language.data ?? "th"),
              icon: <MdSubject />,
              url: `/student/${student.data.id}/subjects?subject_id=${subject.data.id}`,
            },
          ]}
        />
      )}
      <main className="flex w-full flex-col items-center bg-orange-50 font-Anuphan">
        <div className="hidden h-40 w-full bg-sky-100 md:block"></div>
        {subject.data && !router.pathname.startsWith("/student/") && (
          <Header subject={subject.data} />
        )}
        <section className="flex w-full flex-col-reverse justify-center gap-5 px-0 pb-40 xl:flex-row xl:px-40">
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
