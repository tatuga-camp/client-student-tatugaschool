import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import { MdAssignmentAdd } from "react-icons/md";
import Layout from "../../../components/layouts/Layout";
import Attendance from "../../../components/subject/Attendance";
import Classwork from "../../../components/subject/Classwork";
import Grade from "../../../components/subject/Grade";
import { menuSubjectDataLanguage } from "../../../data/language";
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
            <ul className="flex w-full flex-wrap items-center justify-start gap-2 p-5">
              {menuLists
                .filter((m) => {
                  if (
                    m.title === "Attendance" &&
                    !subject.data.allowStudentViewAttendance
                  ) {
                    return false; // Exclude "Attendance" if not allowed
                  }
                  if (
                    m.title === "Grade" &&
                    !subject.data.allowStudentViewOverallScore
                  ) {
                    return false; // Exclude "Grade" if not allowed
                  }
                  return true; // Keep other items
                })
                .map((menu, index) => {
                  return (
                    <button
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setSelectMenu(menu.title);
                      }}
                      key={index}
                      className={` ${
                        menu.title === selectMenu
                          ? "gradient-bg text-white"
                          : "bg-white text-black"
                      } active:gradient-bg flex h-10 w-max items-center justify-start gap-2 rounded-2xl border p-2 hover:bg-primary-color hover:text-white`}
                    >
                      {menu.icon}
                      <span>
                        {menuSubjectDataLanguage[
                          menu.title.toLowerCase() as keyof typeof menuSubjectDataLanguage
                        ](language.data ?? "en")}
                      </span>
                    </button>
                  );
                })}
            </ul>
          )}
          {selectMenu === "Classwork" && <Classwork subjectId={subjectId} />}
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
