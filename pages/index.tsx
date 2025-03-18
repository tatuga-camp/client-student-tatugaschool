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
    null
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
            student.number.toString().includes(e.target.value)
        )
      );
    }
  };

  const handleSignIn = async ({
    studentId,
    name,
  }: {
    studentId: string;
    name: string;
  }) => {
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
      <main className="w-screen font-Anuphan h-screen flex flex-col gap-5 items-center bg-gradient-to-r from-rose-400 to-red-500 justify-center">
        <div className="flex items-center justify-center bg-white px-3 rounded-full py-1 gap-1 md:gap-2">
          <div
            className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-white
                 relative hover:scale-105 active:scale-110 transition duration-150"
          >
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="font-bold uppercase  block text-lg md:text-base text-icon-color">
            Tatuga School
          </div>
        </div>
        <section className="w-80 md:w-96 h-32 flex flex-col justify-around bg-white rounded-md p-2">
          <h1 className="text-lg font-semibold text-center">
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
        <div className="w-full h-screen flex fixed z-50  items-center justify-center">
          <form
            onSubmit={handleSignInForm}
            className="w-96 gap-2 h-max flex flex-col border justify-center items-center relative py-10 bg-white p-3 rounded-md"
          >
            <button
              type="button"
              onClick={() => setSelectStudentId(null)}
              className="text-lg hover:bg-gray-300/50 w-6 h-6 absolute top-2 right-2 m-auto rounded flex items-center justify-center font-semibold"
            >
              <IoMdClose />
            </button>
            <h1 className="text-lg font-semibold">
              {subjectDataLanguage.password(language.data ?? "en")}
            </h1>
            <Password
              inputRef={passwordInputRef}
              toggleMask
              required={true}
              name="password"
              feedback={false}
            />
            <button
              disabled={signIn.isPending}
              type="submit"
              className="main-button w-80 h-10 flex items-center justify-center"
            >
              {signIn.isPending ? (
                <SpinLoading />
              ) : (
                subjectDataLanguage.passwordButton(language.data ?? "en")
              )}
            </button>

            <p className="text-xs text-gray-500">
              {subjectDataLanguage.forgetPassword(language.data ?? "en")}
            </p>
          </form>
          <footer
            onClick={() => setSelectStudentId(null)}
            className="w-screen h-screen fixed top-0 right-0 left-0 bottom-0 -z-10 bg-black/50"
          ></footer>
        </div>
      )}

      <HomepageLayout subject={subject}>
        <main className="w-full md:w-8/12 bg-gray-50 p-3 py-4 rounded-md h-max min-h-96">
          <div className="pb-2 border-b flex md:flex-row flex-col justify-between">
            <div>
              <h2 className="font-semibold text-xl leading-4  ">
                {subjectDataLanguage.choose(language.data ?? "en")}
              </h2>
              <span className="text-gray-500 text-sm">
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
                  language.data ?? "en"
                )}
                className="w-full md:w-96 pl-10 pr-4 py-2 border 
                      border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
              />
            </div>
          </div>
          <ul className="grid grid-cols-1 max-h-96 overflow-y-auto p-3">
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
                      language.data ?? "en"
                    )}
                    onClick={(data) => {
                      handleSignIn({
                        studentId: data.studentId,
                        name: `${data.firstName} ${data.lastName}`,
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
