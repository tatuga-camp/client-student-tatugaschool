import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import { MdAssignmentAdd } from "react-icons/md";
import AskNotification from "../../../components/AskNotification";
import Layout from "../../../components/layouts/Layout";
import Attendance from "../../../components/subject/Attendance";
import Classwork from "../../../components/subject/Classwork";
import Grade from "../../../components/subject/Grade";
import { menuSubjectDataLanguage } from "../../../data/languages";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../../react-query";

const menuLists = [
  {
    title: "Classwork",
    icon: <MdAssignmentAdd />,
  },
  {
    title: "Attendance",
    icon: <FaUserGroup />,
  },
  {
    title: "Grade",
    icon: <FaStarHalfStroke />,
  },
] as const;

type MenuSubject = (typeof menuLists)[number]["title"];

function Index({ subjectId }: { subjectId: string }) {
  const language = useGetLanguage();
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Classwork");

  if (student.error) {
    return (
      <Layout>
        <main className="mx-auto flex w-full max-w-3xl flex-col px-4">
          <div className="flex w-full items-center justify-center gap-5 py-16">
            <h1 className="text-2xl font-bold">Student not found</h1>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>
          {subject.data?.title
            ? `${subject.data.title} | Tatuga School`
            : "Subject"}
        </title>
        <meta name="description" content={subject.data?.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout subjectId={subjectId}>
        <AskNotification />
        <main className="mx-auto flex w-full max-w-3xl flex-col px-3 sm:px-4">
          {subject.data && (
            <div className="sticky top-14 z-20 -mx-3 bg-background-color/90 px-3 py-2 backdrop-blur-md sm:-mx-4 sm:px-4 md:static md:bg-transparent md:backdrop-blur-none">
              <div className="mx-auto flex h-12 w-full items-center justify-between gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm sm:h-14 sm:rounded-full sm:p-1.5">
                {menuLists
                  .filter((m) => {
                    if (
                      m.title === "Attendance" &&
                      !subject.data.allowStudentViewAttendance
                    ) {
                      return false;
                    }
                    if (
                      m.title === "Grade" &&
                      !subject.data.allowStudentViewOverallScore
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((menu, index) => {
                    const isActive = menu.title === selectMenu;
                    const label =
                      menuSubjectDataLanguage[
                        menu.title.toLowerCase() as keyof typeof menuSubjectDataLanguage
                      ](language.data ?? "en");
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          window.scrollTo(0, 0);
                          setSelectMenu(menu.title);
                        }}
                        key={index}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex h-full min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold transition-all duration-200 sm:gap-1.5 sm:rounded-full sm:text-xs ${
                          isActive
                            ? "bg-primary-color text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-50 hover:text-primary-color"
                        }`}
                      >
                        <span className="shrink-0 text-base sm:text-lg">
                          {menu.icon}
                        </span>
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
          {selectMenu === "Classwork" && (
            <Classwork
              allowStudentViewScoreOnAssignment={
                subject.data?.allowStudentViewScoreOnAssignment ?? true
              }
              subjectId={subjectId}
            />
          )}
          {selectMenu === "Attendance" && student.data && (
            <Attendance subjectId={subjectId} studentId={student.data.id} />
          )}
          {selectMenu === "Grade" && student.data && (
            <Grade subjectId={subjectId} studentId={student.data.id} />
          )}
        </main>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.subjectId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      subjectId: params.subjectId,
    },
  };
};
