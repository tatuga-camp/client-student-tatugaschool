import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import { MdAssignmentAdd } from "react-icons/md";
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
        <main className="flex w-7/12 flex-col">
          <div className="flex w-full items-center justify-center gap-5">
            <h1 className="text-2xl font-bold">Student not found</h1>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Subject </title>
        <meta name="description" content={subject.data?.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout subjectId={subjectId}>
        <main className="flex w-full flex-col xl:w-7/12">
          {subject.data && (
            <div className="w-full px-5 py-3 md:top-0 md:bg-transparent md:backdrop-blur-none">
              <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between rounded-full bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
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
                    return (
                      <button
                        onClick={() => {
                          window.scrollTo(0, 0);
                          setSelectMenu(menu.title);
                        }}
                        key={index}
                        className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-full px-1 text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? "bg-primary-color text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-50 hover:text-primary-color"
                        }`}
                      >
                        <span className={isActive ? "text-base" : "text-sm"}>
                          {menu.icon}
                        </span>
                        <span
                          className={`truncate ${isActive ? "block" : "hidden sm:block"}`}
                        >
                          {menuSubjectDataLanguage[
                            menu.title.toLowerCase() as keyof typeof menuSubjectDataLanguage
                          ](language.data ?? "en")}
                        </span>
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
