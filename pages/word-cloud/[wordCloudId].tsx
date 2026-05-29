import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Password as PasswordPrimereact } from "primereact/password";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LanguageSelect from "../../components/LanguageSelect";
import PopupLayout from "../../components/layouts/PopupLayout";
import SignInStudentForm from "../../components/student/SignInStudentForm";
import ListStudent from "../../components/student/ListStudent";
import { ErrorMessages } from "../../interfaces";
import {
  useGetLanguage,
  useGetStudent,
  useGetWordCloudPublic,
  useSignIn,
  useSubmitWordCloudPublic,
  useSubmitWordCloudStudent,
} from "../../react-query";
import { getAccessToken, getLocalStorage, setLocalStorage } from "../../utils";
import { wordCloudLanguage } from "../../data/languages";
import ButtonProfile from "../../components/ButtonProfile";

function getBrowserToken(): string {
  let token = getLocalStorage("word_cloud_browser_token");
  if (!token) {
    token = crypto.randomUUID();
    setLocalStorage("word_cloud_browser_token", token);
  }
  return token;
}

function Index({ id }: { id: string }) {
  const language = useGetLanguage();
  const wordCloud = useGetWordCloudPublic({ wordCloudId: id });
  const submitPublic = useSubmitWordCloudPublic();
  const submitStudent = useSubmitWordCloudStudent();
  const signIn = useSignIn();

  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [selectStudentId, setSelectStudentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const passwordInputRef = useRef<PasswordPrimereact>(null);
  const student = useGetStudent();

  const lang = language.data ?? "en";
  const isSubmitting = submitPublic.isPending || submitStudent.isPending;

  useEffect(() => {
    if (getLocalStorage(`word_cloud_answered:${id}`)) setDone(true);
    setSignedIn(!!getAccessToken().access_token);
  }, [id]);

  // Briefly show the success state on the button after a submit
  // (only relevant when multiple answers are allowed; otherwise the
  // view switches to the "done" message).
  useEffect(() => {
    if (!justSubmitted) return;
    const timer = setTimeout(() => setJustSubmitted(false), 2500);
    return () => clearTimeout(timer);
  }, [justSubmitted]);

  const markDoneIfSingle = () => {
    if (wordCloud.data && wordCloud.data.allowMultiple === false) {
      setLocalStorage(`word_cloud_answered:${id}`, id);
      setDone(true);
    }
    setText("");
  };

  const submitStudentAnswer = async () => {
    const browserToken = getBrowserToken();
    await submitStudent.mutateAsync({ wordCloudId: id, text, browserToken });
    markDoneIfSingle();
    setJustSubmitted(true);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !wordCloud.data) return;
    const browserToken = getBrowserToken();
    try {
      if (wordCloud.data.accessMode === "PUBLIC") {
        await submitPublic.mutateAsync({ wordCloudId: id, text, browserToken });
        markDoneIfSingle();
        setJustSubmitted(true);
      } else {
        // STUDENTS_ONLY: a profile must have been chosen + signed in already.
        if (!getAccessToken().access_token) {
          setSignedIn(false);
          return;
        }
        await submitStudentAnswer();
      }
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({
        icon: "error",
        title: result?.error ? result.error : wordCloudLanguage.error(lang),
        text: result?.message?.toString(),
      });
    }
  };

  // Tapping a student in the roster: try a password-less sign-in first; if the
  // server requires a password, open the password popup for that student.
  const handleSelectStudent = async (sid: string) => {
    try {
      await signIn.mutateAsync({ studentId: sid });
      setSignedIn(true);
    } catch (error) {
      const result = error as ErrorMessages;
      if (result?.message === "Please enter your password") {
        setSelectStudentId(sid);
        setTimeout(() => passwordInputRef.current?.focus(), 500);
      } else {
        Swal.fire({
          icon: "error",
          title: result?.error ? result.error : wordCloudLanguage.error(lang),
          text: result?.message?.toString(),
        });
      }
    }
  };

  const handleSignInForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectStudentId) return;
      const form = e.currentTarget as HTMLFormElement;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;
      await signIn.mutateAsync({ studentId: selectStudentId, password });
      setSelectStudentId(null);
      setSignedIn(true);
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({
        icon: "error",
        title: result?.error ? result.error : wordCloudLanguage.error(lang),
        text: result?.message?.toString(),
      });
    }
  };

  const data = wordCloud.data;
  const needProfile =
    !!data &&
    data.status !== "CLOSED" &&
    data.accessMode === "STUDENTS_ONLY" &&
    !signedIn;

  const filteredStudents = (data?.students ?? [])
    .filter((s) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        `${s.firstName}${s.lastName}`
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(q.replace(/\s+/g, "")) ||
        s.number.toString().includes(search.trim())
      );
    })
    .sort((a, b) => Number(a.number) - Number(b.number));

  return (
    <>
      <Head>
        <title>{wordCloudLanguage.title(lang)}</title>
      </Head>
      <main className="gradient-bg flex min-h-screen w-screen flex-col items-center justify-center gap-6 p-6 font-Anuphan text-white">
        <div className="absolute right-4 top-4">
          {student.data ? (
            <ButtonProfile student={student.data} />
          ) : (
            <LanguageSelect />
          )}
        </div>

        {wordCloud.isLoading && <LoadingSpinner />}

        {data && (
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl bg-white/95 p-6 text-icon-color shadow-xl">
            <h1 className="text-center text-xl font-bold">{data.question}</h1>

            {data.status === "CLOSED" ? (
              <p className="text-center text-error-color">
                {wordCloudLanguage.closed(lang)}
              </p>
            ) : needProfile ? (
              <div className="flex w-full flex-col gap-3">
                <p className="text-center text-sm text-icon-color/70">
                  {wordCloudLanguage.chooseProfile(lang)}
                </p>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center pl-3">
                    <FaSearch className="text-primary-color" />
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={wordCloudLanguage.searchPlaceholder(lang)}
                    className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-primary-color"
                  />
                </div>
                {filteredStudents.length > 0 ? (
                  <ul className="grid max-h-80 grid-cols-1 gap-1 overflow-y-auto pr-1">
                    {filteredStudents.map((student, index) => (
                      <ListStudent
                        key={student.id}
                        odd={index % 2 === 0}
                        student={student}
                        isPedding={signIn.isPending}
                        buttonText={wordCloudLanguage.selectButton(lang)}
                        onClick={(s) => handleSelectStudent(s.studentId)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-icon-color/50">
                    {wordCloudLanguage.noStudentsFound(lang)}
                  </p>
                )}
              </div>
            ) : done ? (
              <p className="text-center text-success-color">
                {wordCloudLanguage.submitted(lang)}
              </p>
            ) : (
              <>
                <input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setJustSubmitted(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={wordCloudLanguage.placeholder(lang)}
                  maxLength={100}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg text-icon-color outline-none focus:border-primary-color disabled:opacity-60"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-colors disabled:opacity-70 ${
                    justSubmitted ? "bg-success-color" : "bg-primary-color"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {wordCloudLanguage.submitting(lang)}
                    </>
                  ) : justSubmitted ? (
                    <>
                      <IoMdCheckmarkCircleOutline className="text-xl" />
                      {wordCloudLanguage.submitSuccess(lang)}
                    </>
                  ) : (
                    wordCloudLanguage.submit(lang)
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {selectStudentId && (
          <PopupLayout onClose={() => setSelectStudentId(null)}>
            <SignInStudentForm
              onClose={() => setSelectStudentId(null)}
              onSubmit={handleSignInForm}
              isPending={signIn.isPending}
              passwordInputRef={passwordInputRef}
            />
          </PopupLayout>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query;
  if (!query.wordCloudId) {
    return { notFound: true };
  }
  return { props: { id: query.wordCloudId } };
};

export default Index;
