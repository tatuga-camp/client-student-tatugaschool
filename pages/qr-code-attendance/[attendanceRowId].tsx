import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Countdown from "react-countdown";
import { FaSearch } from "react-icons/fa";
import { GrStatusUnknown } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { PiNote } from "react-icons/pi";
import Swal from "sweetalert2";
import LoadingBar from "../../components/common/LoadingBar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TextEditor from "../../components/common/TextEditor";
import LanguageSelect from "../../components/LanguageSelect";
import PopupLayout from "../../components/layouts/PopupLayout";
import ListStudent from "../../components/student/ListStudent";
import SignInStudentForm from "../../components/student/SignInStudentForm";
import { defaultBlurHash, defaultCanvas } from "../../data";
import {
  qrcodeAttendanceLanguage,
  qrcodeMenuBarLanguage,
  subjectDataLanguage,
} from "../../data/languages";
import {
  Attendance,
  AttendanceStatusList,
  ErrorMessages,
  StudentOnSubject,
} from "../../interfaces";
import {
  useGetAttendanceQRCode,
  useGetLanguage,
  useSignIn,
  useUpdateAttendance,
} from "../../react-query";
import {
  decodeBlurhashToCanvas,
  errorSwalContent,
  getLocalStorage,
  setLocalStorage,
} from "../../utils";
import { Password as PasswordPrimereact } from "primereact/password";

function Index({ id }: { id: string }) {
  const [selectStudent, setSelectStudent] = useState<
    (StudentOnSubject & { attendance: Attendance }) | null
  >(null);
  const [studentId, setStudentId] = useState<string>();
  const passwordInputRef = useRef<PasswordPrimereact>(null);

  const language = useGetLanguage();
  const signIn = useSignIn();
  const update = useUpdateAttendance();
  const [selectStatus, setSelectStatus] = useState<AttendanceStatusList | null>(
    null,
  );
  const [triggerFormSignIn, setTriggerFormSignIn] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [selectMenu, setSelectMenu] = useState<"status" | "note">("status");
  const [search, setSearch] = useState("");
  const [students, setStudents] =
    useState<(StudentOnSubject & { attendance: Attendance })[]>();
  const qrCode = useGetAttendanceQRCode({
    attendanceRowId: id,
  });

  useEffect(() => {
    if (qrCode.data) {
      if (qrCode.data.subject.allowHideStudentList) {
        setStudents([]);
      } else {
        setStudents(qrCode.data.students);
      }
    }
  }, [qrCode.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (qrCode.data) {
      if (
        qrCode.data.subject.allowHideStudentList &&
        e.target.value.trim().length <= 2
      ) {
        setStudents([]);
      } else if (
        !qrCode.data.subject.allowHideStudentList &&
        e.target.value.trim() === ""
      ) {
        setStudents(qrCode.data.students);
      } else {
        setStudents(
          qrCode.data.students.filter(
            (student) =>
              student.firstName
                .toLowerCase()
                .includes(e.target.value.toLowerCase().trim()) ||
              student.lastName
                .toLowerCase()
                .includes(e.target.value.toLowerCase().trim()) ||
              `${student.firstName} ${student.lastName}`
                .toLowerCase()
                .includes(e.target.value.toLowerCase().trim()) ||
              `${student.firstName}${student.lastName}`
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(e.target.value.toLowerCase().replace(/\s+/g, "")) ||
              student.number.toString().includes(e.target.value.trim()),
          ),
        );
      }
    }
  };

  const closeStatusSheet = () => {
    setSelectStatus(null);
    setSelectStudent(null);
    setSelectMenu("status");
    setNote("");
  };

  const dateFormat =
    qrCode.data?.attendanceRow.startDate &&
    new Date(qrCode.data?.attendanceRow.startDate).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  const time =
    qrCode.data?.attendanceRow.startDate &&
    new Date(qrCode.data?.attendanceRow.startDate).toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  const handleSignInForm = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!studentId) {
        throw new Error("Student id not found");
      }
      if (!qrCode.data) {
        throw new Error("Qr code not ready");
      }
      const form = e.currentTarget as HTMLFormElement;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;
      await signIn.mutateAsync({
        studentId: studentId,
        password: password,
      });

      setSelectStudent(
        () =>
          qrCode.data.students.find((s) => s.studentId === studentId) ?? null,
      );
      setTriggerFormSignIn(false);
    } catch (error) {
      Swal.fire({
        ...errorSwalContent(error),
        icon: "error",
      });
    }
  };

  const handleSignIn = async (
    data: StudentOnSubject & {
      attendance: Attendance;
    },
  ) => {
    try {
      setStudentId(data.studentId);
      await signIn.mutateAsync({
        studentId: data.studentId,
      });

      setSelectStudent(
        () =>
          qrCode.data?.students.find((s) => s.studentId === data.studentId) ??
          null,
      );
    } catch (error) {
      let result = error as ErrorMessages;
      console.error(error);
      if (result?.message === "Please enter your password") {
        setTriggerFormSignIn(true);
        setStudentId(data.studentId);
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

  const hanldeUpdateStatus = async (status: string, note: string) => {
    try {
      if (!selectStudent) {
        throw new Error("Select Student");
      }
      if (
        qrCode.data?.attendanceRow.isAllowScanManyTime === false &&
        getLocalStorage(
          `attendanceRow_id:${qrCode.data?.attendanceRow.id as string}`,
        )
      ) {
        throw new Error("Teacher only allow one time scan!");
      }
      await update.mutateAsync({
        query: {
          attendanceId: selectStudent.attendance.id,
        },
        body: {
          status: status,
          note: note,
        },
      });
      setLocalStorage(
        `attendanceRow_id:${qrCode.data?.attendanceRow.id}`,
        qrCode.data?.attendanceRow.id as string,
      );
      closeStatusSheet();
      Swal.fire({
        title: "You have update attendance",
        icon: "success",
      });
    } catch (error) {
      let result = error as ErrorMessages;
      console.error(error);
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const SessionHeader = ({ light = false }: { light?: boolean }) => (
    <header
      className={`w-full max-w-full overflow-hidden rounded-2xl border shadow-sm ${
        light
          ? "border-gray-100 bg-white"
          : "border-primary-color/20 bg-primary-color"
      }`}
    >
      <div
        className={`relative w-full max-w-full px-4 py-4 sm:px-5 sm:py-5 ${
          light
            ? ""
            : "bg-gradient-to-br from-primary-color via-primary-color to-secondary-color"
        }`}
      >
        <div className="relative z-10 flex w-full max-w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div
                className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-1 ${
                  light ? "ring-gray-200" : "ring-white/40"
                }`}
              >
                <Image
                  src="/favicon.ico"
                  placeholder="blur"
                  blurDataURL={defaultCanvas}
                  fill
                  alt="logo tatuga school"
                />
              </div>
              <h1
                className={`min-w-0 flex-1 break-words text-base font-semibold leading-snug sm:text-lg ${
                  light ? "text-gray-800" : "text-white"
                }`}
              >
                {qrcodeAttendanceLanguage.title(language.data ?? "en")}
              </h1>
            </div>
            <LanguageSelect className="w-auto max-w-[10.5rem] shrink-0" />
          </div>

          <p
            className={`w-full max-w-full break-words text-sm leading-snug ${
              light ? "text-gray-500" : "text-white/90"
            }`}
          >
            <span className="font-medium">
              {qrcodeAttendanceLanguage.subject(language.data ?? "en")}:
            </span>{" "}
            {qrCode.data?.subject.title}
          </p>

          <div className="flex flex-wrap gap-2">
            {dateFormat ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  light
                    ? "bg-primary-color/10 text-primary-color"
                    : "bg-white/95 text-primary-color-focus"
                }`}
              >
                {dateFormat}
                {time ? ` | ${time}` : ""}
              </span>
            ) : null}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                light
                  ? "bg-gray-100 text-gray-600"
                  : "bg-white/20 text-white ring-1 ring-white/40"
              }`}
            >
              {qrCode.data?.attendanceRow.isAllowScanManyTime
                ? "Many Time"
                : "One Time"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  if (qrCode.isLoading) {
    return (
      <>
        <Head>
          <title>{qrcodeAttendanceLanguage.title(language.data ?? "en")}</title>
        </Head>
        <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background-color font-Anuphan text-gray-600">
          <LoadingSpinner />
          <p className="mt-3 text-sm">loading...</p>
        </main>
      </>
    );
  }

  if (
    qrCode.data &&
    qrCode.data.attendanceRow.allowScanAt &&
    new Date(qrCode.data.attendanceRow.allowScanAt).getTime() >
      new Date().getTime()
  ) {
    return (
      <>
        <Head>
          <title>{qrcodeAttendanceLanguage.title(language.data ?? "en")}</title>
        </Head>
        <main className="flex min-h-dvh w-full flex-col items-center bg-background-color px-3 py-6 font-Anuphan sm:px-4">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 overflow-x-hidden">
            <SessionHeader />
            <section className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-700">
                Allow to scan At
              </p>
              <Countdown
                date={qrCode.data.attendanceRow.allowScanAt}
                renderer={(props) => {
                  if (
                    qrCode.data &&
                    qrCode.data.attendanceRow.allowScanAt &&
                    new Date(qrCode.data.attendanceRow.allowScanAt).getTime() <=
                      new Date().getTime()
                  ) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.reload();
                        }}
                        className="mt-3 w-full rounded-full bg-success-color px-4 py-3 text-base font-semibold text-white shadow-sm"
                      >
                        {qrcodeAttendanceLanguage.click_continue(
                          language.data ?? "en",
                        )}
                      </button>
                    );
                  }
                  return (
                    <div className="mt-3 rounded-2xl bg-primary-color px-4 py-3 font-mono text-2xl font-semibold text-white">
                      {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                    </div>
                  );
                }}
              />
              <p className="mt-4 text-sm text-gray-500">
                {qrcodeAttendanceLanguage.warning_allow_scan(
                  language.data ?? "en",
                )}
              </p>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{qrcodeAttendanceLanguage.title(language.data ?? "en")}</title>
      </Head>
      {triggerFormSignIn && (
        <PopupLayout
          onClose={() => {
            setTriggerFormSignIn(false);
          }}
        >
          <SignInStudentForm
            onClose={() => setTriggerFormSignIn(false)}
            onSubmit={handleSignInForm}
            isPending={signIn.isPending}
            passwordInputRef={passwordInputRef}
          />
        </PopupLayout>
      )}

      <main className="relative flex min-h-dvh w-full flex-col items-center bg-background-color px-3 py-6 font-Anuphan text-gray-800 sm:px-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 overflow-x-hidden pb-8">
          <SessionHeader />

          {/* Discord-style members list panel */}
          {!selectStudent ? (
            <section className="flex max-h-[min(32rem,70dvh)] min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-3 sm:p-4">
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                  <input
                    value={search}
                    onChange={handleChange}
                    type="text"
                    placeholder={subjectDataLanguage.searchPlaceholder(
                      language.data ?? "en",
                    )}
                    className="w-full rounded-full border border-gray-200 bg-background-color py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-color focus:outline-none focus:ring-2 focus:ring-primary-color/20"
                  />
                </div>
              </div>

              {qrCode.data?.subject.allowHideStudentList &&
              search.trim() === "" ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
                  <p className="text-base font-semibold text-gray-700">
                    {subjectDataLanguage.whoAreYou(language.data ?? "en")}
                  </p>
                  <p className="text-sm text-gray-400">
                    {subjectDataLanguage.typeYourName(language.data ?? "en")}
                  </p>
                </div>
              ) : qrCode.data?.subject.allowHideStudentList &&
                search.trim().length <= 2 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
                  <p className="text-base font-semibold text-gray-700">
                    {subjectDataLanguage.keepTyping(language.data ?? "en")}
                  </p>
                  <p className="text-sm text-gray-400">
                    {subjectDataLanguage.typeMoreThan3(language.data ?? "en")}
                  </p>
                </div>
              ) : students && students.length > 0 ? (
                <ul className="flex flex-1 flex-col gap-1 overflow-auto px-2 py-2 sm:px-3">
                  {students
                    .sort((a, b) => Number(a.number) - Number(b.number))
                    .map((student, index) => {
                      const odd = index % 2 === 0;
                      return (
                        <ListStudent<
                          StudentOnSubject & { attendance: Attendance }
                        >
                          student={student}
                          odd={odd}
                          key={student.id ?? index}
                          onClick={(data) => {
                            handleSignIn(data);
                          }}
                          buttonText="Go"
                          isPedding={
                            signIn.isPending && studentId === student.studentId
                          }
                        />
                      );
                    })}
                </ul>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
                  <p className="text-base font-semibold text-gray-700">
                    {subjectDataLanguage.noStudentsFound(language.data ?? "en")}
                  </p>
                  <p className="text-sm text-gray-400">
                    {subjectDataLanguage.checkSpelling(language.data ?? "en")}
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {qrCode.data?.attendanceRow.expireAt && !selectStudent ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {qrcodeAttendanceLanguage.expired_at(language.data ?? "en")}
              </p>
              <Countdown
                date={qrCode.data?.attendanceRow.expireAt}
                renderer={(props) => {
                  if (
                    qrCode.data &&
                    qrCode.data.attendanceRow.expireAt &&
                    new Date(qrCode.data.attendanceRow.expireAt).getTime() <=
                      new Date().getTime()
                  ) {
                    return (
                      <div className="rounded-full bg-error-color px-4 py-1.5 text-sm font-semibold text-white">
                        {qrcodeAttendanceLanguage.time_up(
                          language.data ?? "en",
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="rounded-full bg-error-color/90 px-4 py-1.5 font-mono text-sm font-semibold text-white">
                      {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                    </div>
                  );
                }}
              />
            </div>
          ) : null}

          <p className="px-2 text-center text-xs text-gray-400">
            {qrcodeAttendanceLanguage.privacy(language.data ?? "en")}
          </p>
        </div>

        {/* Luma-style status sheet overlay */}
        {selectStudent ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 cursor-default"
              onClick={closeStatusSheet}
            />
            <section className="relative z-10 flex max-h-[min(90dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl">
              <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-200 sm:hidden" />
              <button
                type="button"
                onClick={closeStatusSheet}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-600 hover:bg-gray-200"
              >
                <IoMdClose />
              </button>
              {update.isPending && <LoadingBar />}

              <div className="flex flex-col items-center gap-3 border-b border-gray-100 px-5 pb-4 pt-6">
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary-color/20">
                  <Image
                    src={selectStudent.photo}
                    alt={selectStudent.firstName}
                    fill
                    sizes="64px"
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      selectStudent.blurHash ?? defaultBlurHash,
                    )}
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectStudent.firstName} {selectStudent.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Number {selectStudent.number}
                    {!selectStudent.isActive && " (Disabled)"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["status", "note"] as const).map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => setSelectMenu(text)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        selectMenu === text
                          ? "bg-primary-color text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {text === "note" ? <PiNote /> : <GrStatusUnknown />}
                      {qrcodeMenuBarLanguage[text](language.data ?? "en")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
                {selectMenu === "status" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {qrCode.data?.status.map((status) => {
                      const active = selectStatus?.id === status.id;
                      return (
                        <button
                          disabled={update.isPending}
                          key={status.id}
                          type="button"
                          onClick={() => setSelectStatus(status)}
                          style={{ backgroundColor: status.color }}
                          className={`rounded-2xl px-3 py-3 text-center text-sm font-semibold text-black/90 shadow-sm transition ${
                            active
                              ? "ring-2 ring-primary-color ring-offset-2"
                              : "opacity-90 hover:opacity-100"
                          }`}
                        >
                          {status.title}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-60">
                    <TextEditor
                      menubar={false}
                      value={note}
                      onChange={(value) => setNote(value)}
                      toolbar="image"
                      schoolId={qrCode.data?.subject.schoolId as string}
                    />
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-gray-100 p-4">
                <button
                  type="button"
                  disabled={update.isPending || !selectStatus}
                  onClick={() => {
                    if (confirm("Are you sure?") && selectStatus) {
                      hanldeUpdateStatus(selectStatus.title, note);
                    }
                  }}
                  className="w-full rounded-full bg-primary-color py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {qrcodeAttendanceLanguage.create_button(
                    language.data ?? "en",
                  )}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query;

  if (!query.attendanceRowId) {
    return {
      notFound: true,
    };
  }

  try {
    return {
      props: {
        id: query.attendanceRowId,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {},
    };
  }
};
