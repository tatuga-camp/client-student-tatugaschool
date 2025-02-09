import { GetServerSideProps } from "next";
import React from "react";
import Layout from "../../../components/layouts/Layout";
import { useGetStudent, useGetSubjectById } from "../../../react-query";
import Head from "next/head";
import { MdAssignmentAdd } from "react-icons/md";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import Classwork from "../../../components/subject/Classwork";
import Attendance from "../../../components/subject/Attendance";
import Grade from "../../../components/subject/Grade";

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
  const subject = useGetSubjectById({ id: subjectId });
  const student = useGetStudent();
  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Classwork");

  if (!student.data) {
    return (
      <Layout>
        <main className="w-7/12 flex flex-col">
          <div className="w-full flex justify-center items-center gap-5">
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
      <Layout>
        <main className="w-full xl:w-7/12  flex flex-col">
          <ul className="w-full flex justify-start items-center gap-5">
            {menuLists.map((menu, index) => {
              return (
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setSelectMenu(menu.title);
                  }}
                  key={index}
                  className={`
                    ${
                      menu.title === selectMenu
                        ? "gradient-bg text-white"
                        : "bg-white text-black"
                    }
                    flex items-center w-40 justify-start gap-2 p-2 rounded-md border 
                   hover:bg-primary-color  h-10 active:gradient-bg hover:text-white`}
                >
                  {menu.icon}
                  <span>{menu.title}</span>
                </button>
              );
            })}
          </ul>
          {selectMenu === "Classwork" && <Classwork subjectId={subjectId} />}
          {selectMenu === "Attendance" && (
            <Attendance subjectId={subjectId} studentId={student.data.id} />
          )}
          {selectMenu === "Grade" && <Grade subjectId={subjectId} />}
        </main>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
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
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
};
