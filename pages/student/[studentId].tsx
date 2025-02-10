import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { useGetStudent, useUpdateStudent } from "../../react-query";
import Layout from "../../components/layouts/Layout";
import InputWithIcon from "../../components/common/InputWithIcon";
import { MdFamilyRestroom, MdOutlineSubtitles } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import Image from "next/image";
import Password from "../../components/common/Password";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../interfaces";
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../services";
import LoadingBar from "../../components/common/LoadingBar";
import { generateBlurHash } from "../../utils";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Toast } from "primereact/toast";

function Index(subjectId: { subjectId: string }) {
  const student = useGetStudent();
  const update = useUpdateStudent();
  const toast = React.useRef<Toast>(null);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<{
    title: string;
    firstName: string;
    lastName: string;
    photo: string;
    password?: string;
    confirmPassword?: string;
    blurHash?: string;
  }>({
    title: student.data?.title ?? "",
    firstName: student.data?.firstName ?? "",
    lastName: student.data?.lastName ?? "",
    photo: student.data?.photo ?? "",
  });

  useEffect(() => {
    if (student.data) {
      setData({
        title: student.data.title,
        firstName: student.data.firstName,
        lastName: student.data.lastName,
        photo: student.data.photo,
        blurHash: student.data.blurHash,
      });
    }
  }, [student.data]);
  if (student.error || !student.data) {
    return (
      <Layout>
        <main className="w-7/12 flex flex-col">
          <div className="w-full flex justify-center items-center gap-5">
            <h1 className="text-2xl font-bold">Student not found</h1>
          </div>
        </main>
      </Layout>
    );
  }
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      setLoading(true);
      const signURL = await getSignedURLStudentService({
        fileName: file.name,
        fileType: file.type,
        schoolId: student.data?.schoolId,
      });

      const upload = await UploadSignURLService({
        file: file,
        signURL: signURL.signURL,
        contentType: file.type,
      });
      const blurHash = await generateBlurHash(file);
      setData((prev) => {
        return { ...prev, photo: signURL.originalURL, blurHash: blurHash };
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (data.password !== data.confirmPassword) {
        throw new Error("Password and Confirm Password not match");
      }

      await update.mutateAsync({
        query: {
          studentId: student.data.id,
        },
        body: {
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          photo: data.photo,
          password: data.password,
          blurHash: data.blurHash,
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Student Updated",
        life: 3000,
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
        <title>Student</title>
        <meta name="description" content="student" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toast ref={toast} />
      <Layout subjectId={subjectId.subjectId}>
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-7/12 h-max bg-white flex flex-col rounded-lg p-5 relative md:-top-10 border"
        >
          <h1 className="text-lg py-5 font-medium">Student Information</h1>
          <div className="flex flex-col gap-5">
            <InputWithIcon
              required
              value={data?.title}
              title="Title"
              minLength={1}
              placeholder="Title"
              onChange={(value) => {
                setData((prev) => {
                  return { ...prev, title: value };
                });
              }}
              icon={<MdOutlineSubtitles />}
            />
            <div className="flex gap-1 md:flex-row flex-col w-full">
              <InputWithIcon
                value={data?.firstName}
                required
                title="First Name"
                minLength={1}
                placeholder="First Name"
                onChange={(value) => {
                  setData((prev) => {
                    return { ...prev, firstName: value };
                  });
                }}
                icon={<IoPerson />}
              />
              <InputWithIcon
                value={data?.lastName}
                required
                title="Last Name"
                minLength={1}
                placeholder="Last Name"
                onChange={(value) => {
                  setData((prev) => {
                    return { ...prev, lastName: value };
                  });
                }}
                icon={<MdFamilyRestroom />}
              />
            </div>
          </div>
          <div className="text-sm mt-10 mb-2">
            Upload Student Image (Optional)
          </div>
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col relative items-center justify-center w-full h-64 border-2
                 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50
                `}
          >
            {data.photo ? (
              <div className="w-full h-full relative">
                <Image
                  src={data.photo}
                  alt="student"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 ">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 ">
                  PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
            )}

            <input
              onChange={handleUpload}
              accept="image/*"
              id="dropzone-file"
              type="file"
              className="hidden"
            />
          </label>
          {loading && <LoadingBar />}

          <h1 className="text-lg font-medium mt-5">Update Password</h1>
          <span className="text-sm text-gray-500">
            Leave it blank if you don&apos;t want to update your password
          </span>

          <label className="flex flex-col gap-1">
            <span>Enter New Password</span>
            <Password
              required={!!data.confirmPassword}
              placeholder="Password"
              toggleMask={true}
              value={data.password}
              onChange={(value) => {
                setData((prev) => {
                  return { ...prev, password: value.target.value };
                });
              }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Enter New Confirm Password</span>
            <Password
              required={!!data.password}
              placeholder="Confirm Password"
              toggleMask={true}
              value={data.confirmPassword}
              onChange={(value) => {
                setData((prev) => {
                  return { ...prev, confirmPassword: value.target.value };
                });
              }}
            />
          </label>

          <button
            disabled={update.isPending}
            type="submit"
            className="main-button flex items-center justify-center w-40 mt-5 text-white py-2 rounded-md"
          >
            {update.isPending ? <LoadingSpinner /> : "Update"}
          </button>
        </form>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query;

  if (!query.subject_id) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      subjectId: query.subject_id,
    },
  };
};
