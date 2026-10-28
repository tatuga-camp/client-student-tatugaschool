import React from "react";
import { Toast } from "primereact/toast";
import {
  useGetLanguage,
  useGetStudent,
  useUpdateStudent,
} from "../../react-query";
import Swal from "../../utils/appSwal";
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../services";
import LoadingBar from "../common/LoadingBar";
import PhotoEditor from "../common/PhotoEditor";
import { generateBlurHash } from "../../utils";
import { errorSwalContent } from "../../utils/errorSwal";
import { studentDataLanguage } from "../../data/languages";
import MyCareerSuggest from "../student/MyCareerSuggest";
import ProfileHeaderCard from "../student/ProfileHeaderCard";
import AccountCard from "../student/AccountCard";
import EditNameSheet from "../student/EditNameSheet";
import ChangePasswordSheet from "../student/ChangePasswordSheet";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/** Placeholder until Part 2 rewrites Me: today's profile in a pane. */
export default function MeTab(_props: TabPaneProps) {
  const student = useGetStudent();
  const update = useUpdateStudent();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const toast = React.useRef<Toast>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = React.useState<"name" | "password" | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  // The shell shows "Student not found" when the student query fails.
  if (!student.data) return <div className="h-full w-full" />;
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
    <div
      className="app-scroll h-full w-full pb-10"
      style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
    >
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
      <div className="relative flex w-full flex-col gap-4 px-3 pt-2">
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
    </div>
  );
}
