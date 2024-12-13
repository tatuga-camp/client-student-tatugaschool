import { GetServerSideProps } from "next";
import React, { useEffect } from "react";
import { ErrorMessages, StudentOnSubject, SubjectQuery } from "../interfaces";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { useGetSubjectByCode, useSignIn } from "../react-query";
import Head from "next/head";
import ListMemberCircle from "../components/ListMemberCircle";
import { HiUsers } from "react-icons/hi";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../utils";
import { defaultBlurHash } from "../data";
import { FaSearch } from "react-icons/fa";
import { GoChevronRight } from "react-icons/go";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Password from "../components/common/Password";
import { IoMdClose } from "react-icons/io";
import HomepageLayout from "../components/layouts/HomepageLayout";
import TeacherList from "../components/subject/TeacherList";
import Header from "../components/subject/Header";
import { ProgressSpinner } from "primereact/progressspinner";
import SpinLoading from "../components/common/SpinLoading";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
};
function Index({ subjectData, code }: IndexProps) {
  const subject = useGetSubjectByCode(code, {
    initialData: subjectData,
  });
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
        title: "Success",
        text: "You have successfully joined this subject",
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
    Swal.fire({
      title: "Are you sure?",
      text: `You will join this subject as ${name}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await signIn.mutateAsync({
            studentId: studentId,
          });
          router.push(`/subject/${subject.data?.id}`);
          Swal.fire({
            title: "Success",
            text: "You have successfully joined this subject",
            icon: "success",
          });
        } catch (error) {
          let result = error as ErrorMessages;
          console.error(error);
          if (result.message === "Please enter your password") {
            setSelectStudentId(studentId);
          } else {
            Swal.fire({
              title: result.error ? result.error : "Something Went Wrong",
              text: result.message.toString(),
              footer: result.statusCode
                ? "Code Error: " + result.statusCode?.toString()
                : "",
              icon: "error",
            });
          }
        }
      }
    });
  };

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
            <h1 className="text-lg font-semibold">Enter your password</h1>
            <Password toggleMask name="password" feedback={false} />
            <button
              disabled={signIn.isPending}
              type="submit"
              className="main-button w-80 h-10 flex items-center justify-center"
            >
              {signIn.isPending ? <SpinLoading /> : "Sign In"}
            </button>

            <p className="text-xs text-gray-500">
              If you forget your password, please contact your teacher.
            </p>
          </form>
          <footer
            onClick={() => setSelectStudentId(null)}
            className="w-screen h-screen fixed top-0 right-0 left-0 bottom-0 -z-10 bg-black/50"
          ></footer>
        </div>
      )}

      <HomepageLayout subject={subject}>
        <main className="w-8/12 bg-gray-50 p-3 py-4 rounded-md h-max min-h-96">
          <div className="pb-2 border-b flex justify-between">
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
                value={search}
                onChange={handleChange}
                type="text"
                placeholder="Search..."
                className="w-96 pl-10 pr-4 py-2 border 
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
                    <button
                      onClick={() =>
                        handleSignIn({
                          studentId: student.studentId,
                          name: `${student.firstName} ${student.lastName}`,
                        })
                      }
                      className="main-button flex items-center justify-center gap-1 px-4 py-1"
                    >
                      Join <GoChevronRight />
                    </button>
                  </li>
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
