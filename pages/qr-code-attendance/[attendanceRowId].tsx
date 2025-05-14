import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import Countdown from "react-countdown";
import { GrStatusUnknown } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { PiNote } from "react-icons/pi";
import Swal from "sweetalert2";
import LoadingBar from "../../components/common/LoadingBar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TextEditor from "../../components/common/TextEditor";
import ListStudent from "../../components/student/ListStudent";
import { defaultBlurHash, defaultCanvas } from "../../data";
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
  getLocalStorage,
  setLocalStorage,
} from "../../utils";
import {
  qrcodeAttendanceLanguage,
  qrcodeMenuBarLanguage,
  requestDataLanguage,
} from "../../data/language";
import LanguageSelect from "../../components/LanguageSelect";
import PopupLayout from "../../components/layouts/PopupLayout";
import SignInStudentForm from "../../components/student/SignInStudentForm";
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
  const qrCode = useGetAttendanceQRCode({
    attendanceRowId: id,
  });

  if (qrCode.isLoading) {
    return (
      <>
        <Head>
          <title>{qrcodeAttendanceLanguage.title(language.data ?? "en")}</title>
        </Head>
        <main className="gradient-bg flex min-h-screen w-screen flex-col items-center justify-center text-white">
          <LoadingSpinner />
          loading...
        </main>
      </>
    );
  }

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

  const handleSignIn = async (
    data: StudentOnSubject & {
      attendance: Attendance;
    },
  ) => {
    try {
      const result = await signIn.mutateAsync({
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
      setSelectStudent(null);
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

        <main className="gradient-bg flex min-h-screen w-screen flex-col items-center justify-center gap-2 text-white">
          <div className="flex w-full justify-end p-2">
            <LanguageSelect />
          </div>
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
              {qrcodeAttendanceLanguage.title(language.data ?? "en")}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-0">
            <span className="text-lg font-semibold">
              {qrcodeAttendanceLanguage.subject(language.data ?? "en")}:{" "}
              {qrCode.data?.subject.title}
            </span>
            <span>{dateFormat}</span>
            <span className="text-sm">{time}</span>
          </div>

          <div className="flex w-full max-w-80 flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-center">Allow to scan At</h1>
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
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="rounded-md bg-green-700 px-2 text-2xl text-green-100"
                    >
                      {qrcodeAttendanceLanguage.click_continue(
                        language.data ?? "en",
                      )}
                    </button>
                  );
                }
                return (
                  <div className="rounded-md bg-gradient-to-r from-green-400 to-green-500 px-2 text-2xl text-white">
                    {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                  </div>
                );
              }}
            />
            <div className="mt-5 h-[1px] w-full bg-white" />
            <span>
              {qrcodeAttendanceLanguage.warning_allow_scan(
                language.data ?? "en",
              )}
            </span>
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

      <main className="gradient-bg flex min-h-screen w-screen flex-col items-center justify-center gap-2 font-Anuphan text-white">
        <div className="flex w-full justify-end p-2">
          <LanguageSelect />
        </div>
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
            {qrcodeAttendanceLanguage.title(language.data ?? "en")}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-0">
          <span className="text-lg font-semibold">
            {qrcodeAttendanceLanguage.subject(language.data ?? "en")}:{" "}
            {qrCode.data?.subject.title}
          </span>
          <span>{dateFormat}</span>
          <span className="text-sm">{time}</span>
        </div>

        <span className="text-sm">
          Allow (
          {qrCode.data?.attendanceRow.isAllowScanManyTime
            ? "Many Time"
            : "One Time"}
          )
        </span>

        {selectStudent ? (
          <section className="relative flex h-[30rem] w-11/12 flex-col items-center justify-between gap-5 rounded-md bg-white p-2 pt-5 text-black md:w-96">
            <button
              type="button"
              onClick={() => {
                setSelectStatus(null);
                setSelectStudent(null);
                setSelectMenu("status");
                setNote("");
              }}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded border text-lg font-semibold hover:bg-gray-300/50"
            >
              <IoMdClose />
            </button>
            {update.isPending && <LoadingBar />}
            <div className="flex h-32 w-full flex-col items-center justify-center gap-2 border-b">
              <div className="flex gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1">
                  <Image
                    src={selectStudent.photo}
                    alt={selectStudent.firstName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      selectStudent.blurHash ?? defaultBlurHash,
                    )}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-semibold">
                    {selectStudent.firstName} {selectStudent.lastName}{" "}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Number {selectStudent.number}{" "}
                    {!selectStudent.isActive && "(Disabled)"}
                  </p>
                </div>
              </div>
              <header className="flex items-center justify-center gap-2">
                {(["status", "note"] as const).map((text) => {
                  return (
                    <button
                      key={text}
                      onClick={() => setSelectMenu(text)}
                      className={`${selectMenu === text ? "main-button" : "second-button"} flex items-center justify-center gap-2 border`}
                    >
                      {text === "note" && <PiNote />}{" "}
                      {text === "status" && <GrStatusUnknown />}{" "}
                      {qrcodeMenuBarLanguage[text](language.data ?? "en")}
                    </button>
                  );
                })}
              </header>
            </div>

            {selectMenu === "status" ? (
              <div className="grid w-full grid-cols-2 gap-2 overflow-auto p-2">
                {qrCode.data?.status.map((status, index) => {
                  return (
                    <button
                      disabled={update.isPending}
                      key={index}
                      onClick={() => {
                        setSelectStatus(status);
                      }}
                      style={{ backgroundColor: status.color }}
                      className={`w-full rounded-md p-2 text-center ${selectStatus && selectStatus.id === status.id && "ring-2 ring-black"}`}
                    >
                      {status.title}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-full grow">
                <TextEditor
                  menubar={false}
                  value={note}
                  onChange={(value) => setNote(value)}
                  toolbar="image"
                  schoolId={qrCode.data?.subject.schoolId as string}
                />
              </div>
            )}
            <div className="flex w-full justify-end border-t p-1">
              <button
                onClick={() => {
                  if (confirm("Are you sure?") && selectStatus) {
                    hanldeUpdateStatus(selectStatus.title, note);
                  }
                }}
                className="main-button w-40"
              >
                {qrcodeAttendanceLanguage.create_button(language.data ?? "en")}
              </button>
            </div>
          </section>
        ) : (
          <section className="flex h-96 w-11/12 flex-col overflow-auto rounded-md bg-white p-5 text-black md:w-96">
            {qrCode.data?.students.map((student, index) => {
              const odd = index % 2 === 0;
              return (
                <ListStudent<StudentOnSubject & { attendance: Attendance }>
                  student={student}
                  odd={odd}
                  key={index}
                  onClick={(data) => {
                    handleSignIn(data);
                  }}
                  buttonText="Go"
                />
              );
            })}
          </section>
        )}

        {qrCode.data?.attendanceRow.expireAt && (
          <div className="flex w-full flex-col items-center justify-center">
            <h1 className="text-center">
              {qrcodeAttendanceLanguage.expired_at(language.data ?? "en")}
            </h1>
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
                    <div className="rounded-md bg-gradient-to-r from-rose-400 to-red-500 px-2 text-2xl text-white">
                      {qrcodeAttendanceLanguage.time_up(language.data ?? "en")}
                    </div>
                  );
                }
                return (
                  <div className="rounded-md bg-gradient-to-r from-rose-400 to-red-500 px-2 text-2xl text-white">
                    {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                  </div>
                );
              }}
            />
          </div>
        )}

        <div className="mt-5 h-[1px] w-80 bg-white"></div>
        <span className="p-3 text-center text-xs">
          {qrcodeAttendanceLanguage.privacy(language.data ?? "en")}
        </span>
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
