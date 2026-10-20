import Head from "next/head";
import React from "react";
import {
  useGetLanguage,
  useGetStudent,
  useUpdateStudent,
} from "../../../react-query";
import Layout from "../../../components/layouts/Layout";
import Swal from "sweetalert2";
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../../services";
import LoadingBar from "../../../components/common/LoadingBar";
import PhotoEditor from "../../../components/common/PhotoEditor";
import { generateBlurHash } from "../../../utils";
import { errorSwalContent } from "../../../utils/errorSwal";
import { Toast } from "primereact/toast";
import { studentDataLanguage } from "../../../data/languages";
import MyCareerSuggest from "../../../components/student/MyCareerSuggest";
import ProfileHeaderCard from "../../../components/student/ProfileHeaderCard";
import AccountCard from "../../../components/student/AccountCard";
import EditNameSheet from "../../../components/student/EditNameSheet";
import ChangePasswordSheet from "../../../components/student/ChangePasswordSheet";
import RouteParamsGate, {
  queryString,
} from "../../../components/common/RouteParamsGate";

function Index(subjectId: { subjectId: string }) {
  const student = useGetStudent();
  const update = useUpdateStudent();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const toast = React.useRef<Toast>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = React.useState<"name" | "password" | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  if (student.error || !student.data) {
    return (
      <Layout>
        <main className="flex w-7/12 flex-col">
          <div className="flex w-full items-center justify-center gap-5">
            <h1 className="text-2xl font-bold">
              {studentDataLanguage.studentNotFound(lang)}
            </h1>
          </div>
        </main>
      </Layout>
    );
  }
  const currentStudent = student.data;

  const showSavedToast = () => {
    toast.current?.show({
      severity: "success",
      summary: studentDataLanguage.success(lang),
      detail: studentDataLanguage.studentUpdated(lang),
      life: 3000,
    });
  };

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
  };

  const handleSavePhoto = async (file: File) => {
    try {
      setUploading(true);
      const signURL = await getSignedURLStudentService({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        schoolId: currentStudent.schoolId,
      });
      await UploadSignURLService({
        file: file,
        signURL: signURL.signURL,
        contentType: file.type,
      });
      const blurHash = await generateBlurHash(file);
      await update.mutateAsync({
        query: { studentId: currentStudent.id },
        body: { photo: signURL.originalURL, blurHash },
      });
      setPhotoFile(null);
      showSavedToast();
    } catch (error) {
      console.error(error);
      Swal.fire({
        ...errorSwalContent(
          error,
          studentDataLanguage.somethingWentWrong(lang),
        ),
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSheetSaved = () => {
    setSheet(null);
    showSavedToast();
  };

  return (
    <>
      <Head>
        <title>Student</title>
        <meta name="description" content="student" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toast ref={toast} />
      <input
        ref={fileInput}
        onChange={handlePickPhoto}
        accept="image/*"
        type="file"
        className="hidden"
      />
      {photoFile && (
        <PhotoEditor
          file={photoFile}
          onClose={() => setPhotoFile(null)}
          onSave={handleSavePhoto}
        />
      )}
      {uploading && <LoadingBar />}
      {sheet === "name" && (
        <EditNameSheet
          student={currentStudent}
          language={lang}
          onClose={() => setSheet(null)}
          onSaved={handleSheetSaved}
        />
      )}
      {sheet === "password" && (
        <ChangePasswordSheet
          studentId={currentStudent.id}
          language={lang}
          onClose={() => setSheet(null)}
          onSaved={handleSheetSaved}
        />
      )}
      <Layout subjectId={subjectId.subjectId}>
        <div className="relative mt-20 flex w-full flex-col gap-4 px-3 md:-top-10 lg:w-7/12 lg:px-0">
          <ProfileHeaderCard
            student={currentStudent}
            language={lang}
            onEditPhoto={() => fileInput.current?.click()}
          />
          <MyCareerSuggest />
          <AccountCard
            student={currentStudent}
            language={lang}
            onEditName={() => setSheet("name")}
            onEditPhoto={() => fileInput.current?.click()}
            onChangePassword={() => setSheet("password")}
          />
        </div>
      </Layout>
    </>
  );
}

function Page() {
  return (
    <RouteParamsGate
      read={(query) => {
        const subjectId = queryString(query.subject_id);
        return subjectId ? { subjectId } : null;
      }}
    >
      {(params) => <Index {...params} />}
    </RouteParamsGate>
  );
}

export default Page;
