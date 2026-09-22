import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Password as PasswordPrimereact } from "primereact/password";
import React, { useEffect, useRef } from "react";
import {
  FaExclamationTriangle,
  FaKeyboard,
  FaSearch,
  FaUserSlash,
  FaUsers,
} from "react-icons/fa";
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
import { errorSwalContent, setLocalStorage } from "../utils";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
  announcementId?: string;
  error?: any;
};

type PickerStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: "neutral" | "error";
  action?: React.ReactNode;
};

/** Centred message block used for the picker's loading/empty/error states. */
function PickerState({
  icon,
  title,
  description,
  tone = "neutral",
  action,
}: PickerStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
          tone === "error"
            ? "bg-error-color/10 text-error-color"
            : "bg-primary-color/10 text-primary-color"
        }`}
      >
        {icon}
      </div>
      <p className="mt-3 text-base font-semibold text-icon-color">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Placeholder rows shown while the student list is being prepared. */
function PickerSkeleton({ label }: { label: string }) {
  return (
    <ul role="status" aria-label={label} className="animate-pulse space-y-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 px-2 py-2">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-2.5 w-1/4 rounded bg-gray-100" />
          </div>
          <div className="h-9 w-20 rounded-2xl bg-gray-200" />
        </li>
      ))}
      <li className="sr-only">{label}</li>
    </ul>
  );
}

function Index({ subjectData, code, announcementId, error }: IndexProps) {
  const subject = useGetSubjectByCode(code, {
    initialData: subjectData,
  });
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const passwordInputRef = useRef<PasswordPrimereact>(null);
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [students, setStudents] = React.useState<StudentOnSubject[]>();
  const [selectStudentId, setSelectStudentId] = React.useState<string | null>(
    null,
  );
  const [passwordError, setPasswordError] = React.useState<string | null>(
    null,
  );

  const signIn = useSignIn();

  const closePasswordForm = () => {
    setSelectStudentId(null);
    setPasswordError(null);
  };

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
      router.push(
        announcementId
          ? `/subject/${subject.data?.id}?announcement_id=${announcementId}`
          : `/subject/${subject.data?.id}`,
      );
      Swal.fire({
        title: requestDataLanguage.successTitle(lang),
        text: requestDataLanguage.successDesciption(lang),
        icon: "success",
      });
    } catch (error) {
      // Wrong password stays inside the form as an inline message instead of
      // a blocking alert, so the student can correct it in place.
      // The server answers a wrong password with a 400 whose message names the
      // password ("Password isn't correct"); show the localized copy for that
      // case and fall back to the server text for anything else.
      const { text } = errorSwalContent(error);
      const isPasswordError = !text || /password/i.test(text);
      setPasswordError(
        isPasswordError ? subjectDataLanguage.wrongPassword(lang) : text,
      );
      passwordInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (subject.data) {
      if (subject.data.allowHideStudentList) {
        setStudents([]);
      } else {
        setStudents(subject.data.studentOnSubjects);
      }
      setLocalStorage("subject_id", subject.data.id);
    }
  }, [subject.status]);

  const applySearch = (value: string) => {
    setSearch(value);
    if (subject.data) {
      if (subject.data.allowHideStudentList && value.trim().length <= 2) {
        setStudents([]);
      } else if (!subject.data.allowHideStudentList && value.trim() === "") {
        setStudents(subject.data.studentOnSubjects);
      } else {
        setStudents(
          subject.data.studentOnSubjects.filter(
            (student) =>
              student.firstName
                .toLowerCase()
                .includes(value.toLowerCase().trim()) ||
              student.lastName
                .toLowerCase()
                .includes(value.toLowerCase().trim()) ||
              `${student.firstName} ${student.lastName}`
                .toLowerCase()
                .includes(value.toLowerCase().trim()) ||
              `${student.firstName}${student.lastName}`
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(value.toLowerCase().replace(/\s+/g, "")) ||
              student.number.toString().includes(value.trim()),
          ),
        );
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applySearch(e.target.value);
  };

  const handleSignIn = async ({ studentId }: { studentId: string }) => {
    try {
      await signIn.mutateAsync({
        studentId: studentId,
      });
      router.push(
        announcementId
          ? `/subject/${subject.data?.id}?announcement_id=${announcementId}`
          : `/subject/${subject.data?.id}`,
      );
    } catch (error) {
      let result = error as ErrorMessages;
      console.error(error);
      if (result?.message === "Please enter your password") {
        setPasswordError(null);
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
      <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-5 bg-gradient-to-r from-primary-color to-secondary-color px-4 font-Anuphan">
        <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm sm:gap-2 sm:px-3">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white">
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              sizes="24px"
              alt="logo tatuga school"
            />
          </div>
          <div className="text-sm font-bold uppercase text-icon-color sm:text-base">
            Tatuga School
          </div>
        </div>
        <section className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-center sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-color/10 text-xl text-error-color">
            <FaExclamationTriangle aria-hidden />
          </div>
          <h1 className="text-lg font-semibold text-icon-color">
            {error?.message ?? "Something went wrong"}
          </h1>
          <button
            onClick={() => router.push("/welcome")}
            className="main-button min-h-11 w-full"
          >
            {subjectDataLanguage.back(lang)}
          </button>
        </section>
        <Footer />
      </main>
    );
  }

  const hideList = subject.data?.allowHideStudentList === true;
  const trimmedSearch = search.trim();

  const renderPicker = () => {
    if (subject.isError && !subject.data) {
      return (
        <PickerState
          tone="error"
          icon={<FaExclamationTriangle aria-hidden />}
          title={subjectDataLanguage.loadErrorTitle(lang)}
          description={subjectDataLanguage.loadErrorDescription(lang)}
          action={
            <button
              type="button"
              onClick={() => subject.refetch()}
              className="main-button min-h-10 px-5 text-sm"
            >
              {subjectDataLanguage.retry(lang)}
            </button>
          }
        />
      );
    }

    if (subject.isLoading || students === undefined) {
      return (
        <PickerSkeleton label={subjectDataLanguage.loadingStudents(lang)} />
      );
    }

    if (hideList && trimmedSearch === "") {
      return (
        <PickerState
          icon={<FaSearch aria-hidden />}
          title={subjectDataLanguage.whoAreYou(lang)}
          description={subjectDataLanguage.typeYourName(lang)}
        />
      );
    }

    if (hideList && trimmedSearch.length <= 2) {
      return (
        <PickerState
          icon={<FaKeyboard aria-hidden />}
          title={subjectDataLanguage.keepTyping(lang)}
          description={subjectDataLanguage.typeMoreThan3(lang)}
        />
      );
    }

    if (students.length > 0) {
      return (
        <ul className="flex flex-col gap-0.5">
          {[...students]
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map((student, index) => (
              <ListStudent
                key={student.id}
                odd={index % 2 === 0}
                student={student}
                buttonText={subjectDataLanguage.buttonJoin(lang)}
                onClick={(data) => {
                  handleSignIn({
                    studentId: data.studentId,
                  });
                }}
              />
            ))}
        </ul>
      );
    }

    if (trimmedSearch !== "") {
      return (
        <PickerState
          icon={<FaUserSlash aria-hidden />}
          title={subjectDataLanguage.noStudentsFound(lang)}
          description={subjectDataLanguage.checkSpelling(lang)}
          action={
            <button
              type="button"
              onClick={() => applySearch("")}
              className="second-button min-h-10 border border-gray-200 px-5 text-sm"
            >
              {subjectDataLanguage.clearSearch(lang)}
            </button>
          }
        />
      );
    }

    return (
      <PickerState
        icon={<FaUsers aria-hidden />}
        title={subjectDataLanguage.noStudentsYet(lang)}
        description={subjectDataLanguage.noStudentsYetDescription(lang)}
      />
    );
  };

  return (
    <>
      <Head>
        <title>{subject.data?.title}</title>
        <meta
          name="description"
          content={`welcome to subject ${subject.data?.title} by ${subject.data?.teacherOnSubjects[0].firstName}`}
        />
        <link
          rel="manifest"
          href={`/api/manifest?subject_code=${encodeURIComponent(code)}`}
        />
        <meta name="theme-color" content="#2C7CD1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-title"
          content={subject.data?.title ?? "Tatuga School"}
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      {selectStudentId && (
        <PopupLayout onClose={closePasswordForm}>
          <SignInStudentForm
            onClose={closePasswordForm}
            onSubmit={handleSignInForm}
            isPending={signIn.isPending}
            passwordInputRef={passwordInputRef}
            errorMessage={passwordError}
            onPasswordChange={() => setPasswordError(null)}
          />
        </PopupLayout>
      )}

      <HomepageLayout subject={subject}>
        <section className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <h2 className="text-base font-semibold text-icon-color">
              {subjectDataLanguage.choose(lang)}
            </h2>
            <p className="text-sm text-gray-500">
              {subjectDataLanguage.joinDescription(lang)}
            </p>
            <label className="relative mt-3 block">
              <span className="sr-only">
                {subjectDataLanguage.searchPlaceholder(lang)}
              </span>
              <FaSearch
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
              />
              <input
                value={search}
                onChange={handleChange}
                type="search"
                autoComplete="off"
                inputMode="search"
                placeholder={subjectDataLanguage.searchPlaceholder(lang)}
                className="main-input min-h-11 w-full border-gray-200 bg-background-color pl-10 text-sm text-icon-color placeholder:text-gray-400 focus:bg-white"
              />
            </label>
          </div>
          <div className="p-2 sm:p-3">{renderPicker()}</div>
        </section>
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
        ...(query.announcement_id
          ? { announcementId: query.announcement_id }
          : {}),
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
