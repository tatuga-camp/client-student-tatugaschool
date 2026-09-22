import { useRouter } from "next/router";
import type { ReactNode } from "react";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import type { Menu } from "../Footbar";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../react-query";
import { sidebarDataLanguage } from "../../data/languages";
import Navbar from "../Navbar";
import Footbar from "../Footbar";
import Header from "../subject/Header";
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
  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });
  const router = useRouter();
  const language = useGetLanguage();
  const subject = useGetSubjectById({ id: subjectId ?? "" });
  const student = useGetStudent();

  const showSubjectChrome =
    Boolean(subject.data) && !router.pathname.startsWith("/student/");

  return (
    <div className="relative flex min-h-dvh flex-col bg-background-color">
      <div className="absolute top-3 z-50 h-max w-full px-3">
        <div className="mx-auto w-full max-w-5xl">
          <Navbar student={student.data} subject={subject.data} />
        </div>
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
              title: sidebarDataLanguage.homepage(language.data ?? "en"),
              icon: <MdWork />,
              url: `/subject/${subject.data.id}`,
            },
            ...(customMenus ? customMenus : []),
            {
              title: sidebarDataLanguage.subject(language.data ?? "en"),
              icon: <MdSubject />,
              url: `/student/${student.data.id}/subjects?subject_id=${subject.data.id}`,
            },
          ]}
        />
      )}

      <main className="flex w-full flex-1 flex-col items-center font-Anuphan">
        {showSubjectChrome && subject.data ? (
          <Header subject={subject.data} />
        ) : null}

        {/* pb-28/32 keeps last cards above fixed Footbar (h-16 + bottom-4/5) */}
        <section className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-5 px-0 pb-28 sm:pb-32 lg:flex-row lg:gap-6 lg:px-5 xl:px-6">
          {children}
          {showSubjectChrome ? (
            <div className="flex w-full flex-col gap-2 px-3 pb-4 lg:max-w-sm lg:px-0 xl:w-4/12">
              {listData}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default Layout;
