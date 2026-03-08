import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Password as PasswordPrimereact } from "primereact/password";
import React, { useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import HomepageLayout from "../components/layouts/HomepageLayout";
import PopupLayout from "../components/layouts/PopupLayout";
import ListStudent from "../components/student/ListStudent";
import SignInStudentForm from "../components/student/SignInStudentForm";
import { defaultCanvas } from "../data";
import { requestDataLanguage, subjectDataLanguage } from "../data/languages";
import { ErrorMessages, StudentOnSubject, SubjectQuery } from "../interfaces";
import { useGetLanguage, useGetSubjectByCode, useSignIn } from "../react-query";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { setLocalStorage } from "../utils";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
  error?: any;
};
function Index({ subjectData, code, error }: IndexProps) {
  const subject = useGetSubjectByCode(code, {
    initialData: subjectData,
  });
  const language = useGetLanguage();
  const passwordInputRef = useRef<PasswordPrimereact>(null);
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [students, setStudents] = React.useState<StudentOnSubject[]>();
  const [selectStudentId, setSelectStudentId] = React.useState<string | null>(
    null,
  );

  const signIn = useSignIn();

  const handleSignInForm = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!selectStudentId) {
        throw new Error("Student id not found");
      }
      const form = e.currentTarget as HTMLFormElement;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;
      await signIn.mutateAsync({
        studentId: selectStudentId,
        password: password,
      });
      router.push(`/subject/${subject.data?.id}`);
      Swal.fire({
        title: requestDataLanguage.successTitle(language.data ?? "en"),
        text: requestDataLanguage.successDesciption(language.data ?? "en"),
        icon: "success",
      });
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (subject.data) {
      setStudents([]);
      setLocalStorage("subject_id", subject.data.id);
    }
  }, [subject.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (subject.data) {
      if (e.target.value.trim().length <= 3) {
        setStudents([]);
      } else {
        setStudents(
          subject.data.studentOnSubjects.filter(
            (student) =>
              student.firstName
                .toLowerCase()
                .includes(e.target.value.toLowerCase()) ||
              student.lastName
                .toLowerCase()
                .includes(e.target.value.toLowerCase()) ||
              student.number.toString().includes(e.target.value),
          ),
        );
      }
    }
  };

  const handleSignIn = async ({ studentId }: { studentId: string }) => {
    try {
      await signIn.mutateAsync({
        studentId: studentId,
      });
      router.push(`/subject/${subject.data?.id}`);
      Swal.fire({
        title: requestDataLanguage.successTitle(language.data ?? "en"),
        text: requestDataLanguage.successDesciption(language.data ?? "en"),
        icon: "success",
      });
    } catch (error) {
      let result = error as ErrorMessages;
      console.error(error);
      if (result?.message === "Please enter your password") {
        setSelectStudentId(studentId);
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 1000);
      } else {
        Swal.fire({
          title: result?.error ? result?.error : "Something Went Wrong",
          text: result?.message?.toString(),
          footer: result?.statusCode
            ? "Code Error: " + result?.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    }
  };

  if (error) {
    return (
      <main className="flex h-screen w-screen flex-col items-center justify-center gap-5 bg-gradient-to-r from-rose-400 to-red-500 font-Anuphan">
        <div className="flex items-center justify-center gap-1 rounded-full bg-white px-3 py-1 md:gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="block text-lg font-bold uppercase text-icon-color md:text-base">
            Tatuga School
          </div>
        </div>
        <section className="rounded-2xl80 flex-col justify-around rounded-2xl bg-white p-2 md:w-96">
          <h1 className="text-center text-lg font-semibold">
            {error?.message ?? "Something went wrong"}
          </h1>
          <button
            onClick={() => router.push("/welcome")}
            className="second-button w-full border"
          >
            BACK
          </button>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{subject.data?.title}</title>
        <meta
          name="description"
          content={`welcome to subject ${subject.data?.title} by ${subject.data?.teacherOnSubjects[0].firstName}`}
        />
      </Head>
      {selectStudentId && (
        <PopupLayout
          onClose={() => {
            setSelectStudentId(null);
          }}
        >
          <SignInStudentForm
            onClose={() => setSelectStudentId(null)}
            onSubmit={handleSignInForm}
            isPending={signIn.isPending}
            passwordInputRef={passwordInputRef}
          />
        </PopupLayout>
      )}

      <HomepageLayout subject={subject}>
        <main className="w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-pink-100 bg-white shadow-xl xl:w-8/12">
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 p-6 text-white shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-wide">
              ✨ {subjectDataLanguage.choose(language.data ?? "en")}
            </h2>
            <p className="mt-1 text-white/90">
              {subjectDataLanguage.joinDescription(language.data ?? "en")}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="relative mb-4 md:mb-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaSearch className="text-pink-400" />
              </div>
              <input
                value={search}
                onChange={handleChange}
                type="text"
                placeholder={subjectDataLanguage.searchPlaceholder(
                  language.data ?? "en",
                )}
                className="w-full rounded-full border-2 border-pink-200 bg-pink-50 py-3 pl-12 pr-6 text-gray-700 transition-all focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100"
              />
            </div>

            {search.trim() === "" ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="mb-3 text-6xl">🙈</div>
                <p className="text-xl font-medium text-pink-400">
                  {subjectDataLanguage.whoAreYou(language.data ?? "en")}
                </p>
                <p className="mt-1 text-center text-sm">
                  {subjectDataLanguage.typeYourName(language.data ?? "en")}
                </p>
              </div>
            ) : search.trim().length <= 3 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="mb-3 text-6xl">⌨️</div>
                <p className="text-xl font-medium text-pink-400">
                  {subjectDataLanguage.keepTyping(language.data ?? "en")}
                </p>
                <p className="mt-1 text-center text-sm">
                  {subjectDataLanguage.typeMoreThan3(language.data ?? "en")}
                </p>
              </div>
            ) : students && students.length > 0 ? (
              <ul className="grid max-h-96 grid-cols-1 gap-1 overflow-y-auto rounded-2xl pr-2">
                {students
                  ?.sort((a, b) => Number(a.number) - Number(b.number))
                  .slice(0, 3)
                  .map((student, index) => {
                    const odd = index % 2 === 0;
                    return (
                      <ListStudent
                        key={index}
                        odd={odd}
                        student={student}
                        buttonText={subjectDataLanguage.buttonJoin(
                          language.data ?? "en",
                        )}
                        onClick={(data) => {
                          handleSignIn({
                            studentId: data.studentId,
                          });
                        }}
                      />
                    );
                  })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <div className="mb-3 text-6xl">🥺</div>
                <p className="text-xl font-medium text-purple-400">
                  {subjectDataLanguage.noStudentsFound(language.data ?? "en")}
                </p>
                <p className="mt-1 text-sm">
                  {subjectDataLanguage.checkSpelling(language.data ?? "en")}
                </p>
              </div>
            )}
          </div>
        </main>
      </HomepageLayout>
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
  } catch (error: any) {
    console.error("Error fetching subject", error);
    return {
      props: {
        error: error,
      },
    };
  }
};
