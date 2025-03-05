import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { useGetAttendanceQRCode, useUpdateAttendance } from "../../react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Layout from "../../components/layouts/Layout";
import Image from "next/image";
import { defaultBlurHash, defaultCanvas } from "../../data";
import ListStudent from "../../components/student/ListStudent";
import Countdown from "react-countdown";
import { Attendance, ErrorMessages, StudentOnSubject } from "../../interfaces";
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import LoadingBar from "../../components/common/LoadingBar";
import {
  decodeBlurhashToCanvas,
  getLocalStorage,
  setLocalStorage,
} from "../../utils";

function Index({ id }: { id: string }) {
  const [selectStudent, setSelectStudent] = useState<
    (StudentOnSubject & { attendance: Attendance }) | null
  >(null);
  const update = useUpdateAttendance();
  const qrCode = useGetAttendanceQRCode({
    attendanceRowId: id,
  });

  if (qrCode.isLoading) {
    return (
      <main className="w-screen min-h-screen text-white flex-col gradient-bg flex items-center justify-center">
        <LoadingSpinner />
        loading...
      </main>
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
      }
    );
  const time =
    qrCode.data?.attendanceRow.startDate &&
    new Date(qrCode.data?.attendanceRow.startDate).toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const hanldeUpdateStatus = async (status: string) => {
    try {
      if (!selectStudent) {
        throw new Error("Select Student");
      }
      if (
        qrCode.data?.attendanceRow.isAllowScanManyTime === false &&
        getLocalStorage(
          `attendanceRow_id:${qrCode.data?.attendanceRow.id as string}`
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
        },
      });
      setLocalStorage(
        `attendanceRow_id:${qrCode.data?.attendanceRow.id}`,
        qrCode.data?.attendanceRow.id as string
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

  return (
    <>
      <Head>
        <title>Attendance QR Code</title>
      </Head>
      <main
        className="w-screen min-h-screen gap-2 
      text-white flex-col gradient-bg flex items-center justify-center"
      >
        <div className="flex items-center  justify-center bg-white px-3 rounded-full py-1 gap-1 md:gap-2">
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
            Attendance By QR Code
          </div>
        </div>

        <div className="flex items-center justify-center flex-col gap-0">
          <span className="text-lg font-semibold">
            Subject: {qrCode.data?.subject.title}
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
          <section
            className="w-11/12 items-center justify-center
           md:w-96 text-black h-96 pt-5 p-2 relative flex gap-5 flex-col  bg-white rounded-md"
          >
            <button
              type="button"
              onClick={() => {
                setSelectStudent(null);
              }}
              className="text-lg border hover:bg-gray-300/50 w-6  h-6 absolute top-2 right-2  rounded
                 flex items-center justify-center font-semibold"
            >
              <IoMdClose />
            </button>
            {update.isPending && <LoadingBar />}
            <div className="flex gap-2">
              <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                <Image
                  src={selectStudent.photo}
                  alt={selectStudent.firstName}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    selectStudent.blurHash ?? defaultBlurHash
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
            <h1>Choose Your Status</h1>
            <div className="w-full flex flex-col gap-2 grow overflow-auto items-center justify-start">
              {qrCode.data?.status.map((status, index) => {
                return (
                  <button
                    disabled={update.isPending}
                    key={index}
                    onClick={() => {
                      if (confirm(`Confirm ${status.title}`))
                        hanldeUpdateStatus(status.title);
                    }}
                    style={{ backgroundColor: status.color }}
                    className="w-40 p-2 rounded-md text-center"
                  >
                    {status.title}
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="w-11/12 md:w-96 text-black h-96 p-2 flex flex-col overflow-auto bg-white rounded-md">
            {qrCode.data?.students.map((student, index) => {
              const odd = index % 2 === 0;
              return (
                <ListStudent<StudentOnSubject & { attendance: Attendance }>
                  student={student}
                  odd={odd}
                  key={index}
                  onClick={(data) => {
                    setSelectStudent(data);
                  }}
                  buttonText="Go"
                />
              );
            })}
          </section>
        )}

        {qrCode.data?.attendanceRow.expireAt && (
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="text-center">Expire In</h1>
            <Countdown
              date={qrCode.data?.attendanceRow.expireAt}
              renderer={(props) => {
                return (
                  <div className="bg-gradient-to-r from-rose-400 to-red-500 text-2xl px-2 rounded-md text-white">
                    {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                  </div>
                );
              }}
            />
          </div>
        )}
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
