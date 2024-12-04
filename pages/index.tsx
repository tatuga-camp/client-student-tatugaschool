import { GetServerSideProps } from "next";
import React from "react";
import { SubjectQuery } from "../interfaces";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { useGetSubjectByCode } from "../react-query";
import Head from "next/head";
import Layout from "../components/layouts/Layout";
import ListMemberCircle from "../components/ListMemberCircle";
import { HiUsers } from "react-icons/hi";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash } from "../data";
import { FaSearch } from "react-icons/fa";
import { GoChevronRight } from "react-icons/go";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
};
function Index({ subjectData, code }: IndexProps) {
  const subject = useGetSubjectByCode(code, {
    initialData: subjectData,
  });
  const [selectMenu, setSelectMenu] = React.useState("Dashboard");
  return (
    <>
      <Head>
        <title>{subject.data?.title}</title>
        <meta
          name="description"
          content={`welcome to subject ${subject.data?.title} by ${subject.data?.teacherOnSubjects[0].firstName}`}
        />
      </Head>
      <Layout code={code} setSelectMenu={setSelectMenu} selectMenu={selectMenu}>
        <div className="w-full flex flex-col">
          <header className="w-full border-b p-5 h-20 flex items-center justify-between gap-5">
            <h1 className="text-xl text-gray-700 font-bold">
              {subject.data?.title}
            </h1>
            <div className="flex items-center justify-center gap-2">
              {subject.data && (
                <ListMemberCircle members={subject.data?.teacherOnSubjects} />
              )}
              <div
                className="bg-primary-color flex items-center justify-center gap-1
               text-white px-2 text-sm py-1 rounded-md"
              >
                <HiUsers />
                Teachers
              </div>
            </div>
          </header>

          <main className="w-full h-1 grow  bg-white overflow-y-auto">
            <div className="w-full bg-sky-100 h-40"></div>
            <header className="w-full relative -top-20 flex items-center h-max justify-center">
              <section
                className={`w-8/12 z-30 overflow-hidden ring-4 ring-white
                   h-60 relative flex justify-between  p-5 shadow-inner ${
                     subject.data?.backgroundImage ? "" : "gradient-bg"
                   }  rounded-md`}
              >
                {subject.data?.backgroundImage && (
                  <div className="gradient-shadow  -z-10  absolute w-full h-full top-0 bottom-0 right-0 left-0 m-auto"></div>
                )}{" "}
                {subject.data?.backgroundImage && (
                  <Image
                    src={subject.data?.backgroundImage}
                    fill
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      subject.data?.blurHash ?? defaultBlurHash
                    )}
                    alt="backgroud"
                    className="object-cover -z-20 "
                  />
                )}
                <div className="flex h-full justify-end flex-col gap-1">
                  <h1 className="text-lg font-semibold w-8/12 min-w-96 line-clamp-2 text-white">
                    {subject.data ? subject.data?.title : "Loading..."}
                  </h1>
                  <p className="text-lg w-11/12 min-w-96 line-clamp-2 text-white">
                    {subject.data ? subject.data?.description : "Loading..."}
                  </p>
                  <div className="flex gap-2">
                    <div className="bg-white w-max px-2 py-1 rounded-md">
                      <h2 className="text-xs text-primary-color">
                        Academic year:{" "}
                        {subject.data
                          ? subject.data?.educationYear
                          : "Loading..."}
                      </h2>
                    </div>
                    <div className="bg-white w-max px-2 py-1 rounded-md">
                      <h2 className="text-xs text-primary-color">
                        Subject Code:{" "}
                        {subject.data ? subject.data?.code : "Loading..."}
                      </h2>
                    </div>
                  </div>
                </div>
              </section>
            </header>
            <section className="w-full px-40 justify-center gap-5 pb-20 flex">
              <div className="w-8/12 bg-gray-50 p-3 py-4 rounded-md h-max min-h-96">
                <header className="pb-2 border-b flex justify-between">
                  <div>
                    <h2 className="font-semibold text-xl leading-4  ">
                      Choose Yourself
                    </h2>
                    <span className="text-gray-500 text-sm">
                      to join this subject
                    </span>
                  </div>
                  <div className="b relative px-6">
                    <FaSearch className="absolute left-9 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-96 pl-10 pr-4 py-2 border 
                      border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
                    />
                  </div>
                </header>
                <ul className="grid grid-cols-1 max-h-96 overflow-y-auto p-3">
                  {subject.data?.studentOnSubjects
                    ?.sort((a, b) => Number(a.number) - Number(b.number))
                    .map((student, index) => {
                      const odd = index % 2 === 0;
                      return (
                        <li
                          key={student.id}
                          className={`flex justify-between py-2 hover:bg-gray-200/50  items-center ${
                            odd && "bg-gray-200/20"
                          } gap-2`}
                        >
                          <div className="flex gap-2">
                            <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                              <Image
                                src={student.photo}
                                alt={student.firstName}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                placeholder="blur"
                                blurDataURL={decodeBlurhashToCanvas(
                                  student.blurHash ?? defaultBlurHash
                                )}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h1 className="text-sm font-semibold">
                                {student.firstName} {student.lastName}{" "}
                              </h1>
                              <p className="text-xs text-gray-500">
                                Number {student.number}{" "}
                                {!student.isActive && "(Disabled)"}
                              </p>
                            </div>
                          </div>
                          <button className="main-button flex items-center justify-center gap-1 px-4 py-1">
                            Join <GoChevronRight />
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className="w-4/12  border p-2 rounded-md h-max">
                <h2 className="font-semibold text-xl p-2">Teachers</h2>
                <ul className="gap-2 grid max-h-60 overflow-y-auto">
                  {subject.data?.teacherOnSubjects.map((teacher) => {
                    return (
                      <li
                        key={teacher.id}
                        className="flex items-center gap-2 p-2 bg-white rounded-md"
                      >
                        <div className="w-10 h-10 relative rounded-full overflow-hidden ring-1 ring-white">
                          <Image
                            src={teacher.photo}
                            alt="user avatar"
                            fill
                            placeholder="blur"
                            blurDataURL={decodeBlurhashToCanvas(
                              teacher.blurHash ?? defaultBlurHash
                            )}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-0 leading-3">
                          <h3 className="font-semibold text-lg">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {teacher.email}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </main>
        </div>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const query: SubjectQuery = ctx.query as SubjectQuery;

    if (!query.subject_code) {
      return {
        redirect: {
          destination: "/welcome",
          permanent: false,
        },
      };
    }

    const subject = await GetSubjectByCodeService({
      code: query.subject_code,
    });
    return {
      props: {
        subjectData: subject,
        code: query.subject_code,
      },
    };
  } catch (error) {
    console.error("Error fetching subject", error);
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
};
