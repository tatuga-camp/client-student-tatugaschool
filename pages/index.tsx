import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Password as PasswordPrimereact } from "primereact/password";
import React, { useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import Password from "../components/common/Password";
import SpinLoading from "../components/common/SpinLoading";
import HomepageLayout from "../components/layouts/HomepageLayout";
import ListStudent from "../components/student/ListStudent";
import { defaultCanvas } from "../data";
import { ErrorMessages, StudentOnSubject, SubjectQuery } from "../interfaces";
import { useGetLanguage, useGetSubjectByCode, useSignIn } from "../react-query";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { setLocalStorage } from "../utils";
import Footer from "../components/Footer";
import { requestDataLanguage, subjectDataLanguage } from "../data/language";
import PopupLayout from "../components/layouts/PopupLayout";
import SignInStudentForm from "../components/student/SignInStudentForm";

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
      setStudents(subject.data.studentOnSubjects);
      setLocalStorage("subject_id", subject.data.id);
    }
  }, [subject.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (subject.data) {
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
          <div className="relative h-6 w-6 overflow-hidden rounded-md ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
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
        <section className="flex h-32 w-80 flex-col justify-around rounded-md bg-white p-2 md:w-96">
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
        <main className="h-max min-h-96 w-full rounded-md bg-gray-50 p-3 py-4 md:w-8/12">
          <div className="flex flex-col justify-between border-b pb-2 md:flex-row">
            <div>
              <h2 className="text-xl font-semibold leading-4">
                {subjectDataLanguage.choose(language.data ?? "en")}
              </h2>
              <span className="text-sm text-gray-500">
                {subjectDataLanguage.joinDescription(language.data ?? "en")}
              </span>
            </div>
            <div className="relative px-6">
              <FaSearch className="absolute left-9 top-3 text-gray-400" />
              <input
                value={search}
                onChange={handleChange}
                type="text"
                placeholder={subjectDataLanguage.searchPlaceholder(
                  language.data ?? "en",
                )}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-color-focus md:w-96"
              />
            </div>
          </div>
          <ul className="grid max-h-96 grid-cols-1 overflow-y-auto p-3">
            {students
              ?.sort((a, b) => Number(a.number) - Number(b.number))
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
