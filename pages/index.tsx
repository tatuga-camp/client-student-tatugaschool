import { GetServerSideProps } from "next";
import React from "react";
import { SubjectQuery } from "../interfaces";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { useGetSubjectByCode } from "../react-query";
import Head from "next/head";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
};
function Index({ subjectData, code }: IndexProps) {
  const subject = useGetSubjectByCode(code, {
    initialData: subjectData,
  });
  return (
    <>
      <Head>
        <title>{subject.data?.title}</title>
        <meta
          name="description"
          content={`welcome to subject ${subject.data?.title} by ${subject.data?.teacherOnSubjects[0].firstName}`}
        />
      </Head>
      <div className="w-full min-h-screen gradient-bg flex items-center justify-center flex-col">
        <h1 className="text-4xl font-bold text-white">
          Welcome to {subject.data?.title}
        </h1>
        <p className="text-white">This is the subject page</p>
        <main className="w-96 h-96 bg-white rounded-md drop-shadow p-5"></main>
      </div>
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
