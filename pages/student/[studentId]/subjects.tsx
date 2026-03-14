import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../../components/layouts/Layout";
import { defaultCanvas } from "../../../data";
import { useGetLanguage, useGetStudent } from "../../../react-query";
import {
  useGetSubjectById,
  useGetSubjectByStudent,
} from "../../../react-query/subject";
import { subjectDataLanguage } from "../../../data/languages";
import { FaBookOpen } from "react-icons/fa";
import InputEducationYear from "../../../components/common/InputEducationYear";
import { EducationYear } from "../../../interfaces";

function Index({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const language = useGetLanguage();
  const student = useGetStudent();
  const subject = useGetSubjectById({ id: subjectId });

  const [educationYear, setEducationYear] = React.useState<EducationYear>();

  React.useEffect(() => {
    if (subject.data) {
      setEducationYear(subject.data.educationYear as EducationYear);
    }
  }, [subject.data]);

  // We fetch the subjects using useGetSubjectByStudent
  const subjects = useGetSubjectByStudent({
    studentId: student.data?.id as string,
    educationYear: educationYear as EducationYear,
  });

  if (student.error || !student.data) {
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
        <title>My Subjects</title>
        <meta name="description" content="My Subjects" />
      </Head>
      <Layout subjectId={subjectId}>
        <div className="mt-20 flex w-full flex-col gap-5 px-4 md:px-0">
          <div className="flex w-full flex-col justify-between gap-5 py-5 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-orange-400 text-2xl text-white shadow-lg">
                <FaBookOpen />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                {language.data === "th" ? "วิชาเรียนของฉัน" : "My Subjects"}
              </h1>
            </div>
            {educationYear && (
              <div className="w-full md:w-max">
                <InputEducationYear
                  required={false}
                  value={educationYear as EducationYear}
                  onChange={(value) => setEducationYear(value as EducationYear)}
                />
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.isLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent"></div>
              </div>
            ) : subjects.data?.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
                <span className="mb-4 text-6xl">📚</span>
                <p className="text-xl font-medium text-gray-500">
                  {language.data === "th"
                    ? "ยังไม่มีวิชาเรียน"
                    : "No subjects found"}
                </p>
              </div>
            ) : (
              subjects.data
                ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => router.push(`/subject/${subject.id}`)}
                    className="group relative flex h-60 w-full flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-200"
                  >
                    <div className="relative h-32 w-full">
                      {subject.backgroundImage ? (
                        <Image
                          src={subject.backgroundImage}
                          alt={subject.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          placeholder="blur"
                          blurDataURL={subject.blurHash || defaultCanvas}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 transition-transform duration-500 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-pink-500 shadow-sm backdrop-blur-sm">
                        ✨ {subject.code}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4 text-left">
                      <h2 className="line-clamp-2 text-lg font-bold leading-tight text-gray-800 transition-colors group-hover:text-orange-500">
                        {subject.title}
                      </h2>
                      {subject.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {subject.description}
                        </p>
                      )}
                      <div className="mt-auto pt-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs text-orange-600">
                            🎓
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            {language.data === "th"
                              ? "ปีการศึกษา"
                              : "Academic Year"}{" "}
                            {subject.educationYear}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query;

  // We pass subject_id to keep the Layout's footbar happy if possible
  return {
    props: {
      subjectId: query.subject_id ?? "",
    },
  };
};
