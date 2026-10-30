import React from "react";
import { Toast } from "primereact/toast";
import { LuBriefcase, LuChevronRight } from "react-icons/lu";
import {
  assignmentPageLanguage,
  careerLanguage,
  classworkDataLanguage,
  navbarLanguageData,
  profileLanguage,
  studentDataLanguage,
} from "../../data/languages";
import { useLogout } from "../../hook/useLogout";
import type {
  Attendance,
  AttendanceStatusList,
  AttendanceTable,
  Language,
} from "../../interfaces";
import {
  useGetAssignments,
  useGetAttendanceTables,
  useGetLanguage,
  useGetMyCareerSuggestion,
  useGetStudent,
  useUpdateStudent,
} from "../../react-query";
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../services";
import {
  calculateSubmissionCompletion,
  generateBlurHash,
  summarizeAttendance,
} from "../../utils";
import {
  localizeSkillTitle,
  sectorForCareer,
  summarizeSkills,
} from "../../utils/careerReport";
import { uploadFailure } from "../../utils/assignmentDetail";
import { errorSwalContent } from "../../utils/errorSwal";
import { getPushStatus, PushStatus } from "../../utils/notifications";
import { NotificationPromptSheet } from "../app/NotificationPromptSheet";
import { Sheet } from "../app/Sheet";
import { TAB_BODY_CLASS } from "../app/TabHeader";
import type { TabPaneProps } from "../app/shell/useShellRoute";
import LoadingBar from "../common/LoadingBar";
import ChangePasswordSheet from "../student/ChangePasswordSheet";
import EditNameSheet from "../student/EditNameSheet";
import CareerSheet from "./CareerSheet";
import MeHeader from "./MeHeader";
import PhotoEditorSheet from "./PhotoEditorSheet";
import SettingsList from "./SettingsList";

const CARD = "rounded-2xl border-2 border-b-4 border-[#E3E8F0] bg-white";

type AttendanceData = AttendanceTable & {
  statusLists: AttendanceStatusList[];
  attendances: Attendance[];
};

function notificationStatusText(status: PushStatus | null, lang: Language) {
  if (status === "granted") return profileLanguage.notificationsOn(lang);
  if (status === "denied") return profileLanguage.notificationsBlocked(lang);
  if (status === "unsupported")
    return profileLanguage.notificationsUnavailable(lang);
  return profileLanguage.notificationsOff(lang);
}

/** Me: photo and mascot, progress tiles, career match, account and settings. */
export default function MeTab({ subjectId, active }: TabPaneProps) {
  const student = useGetStudent();
  const update = useUpdateStudent();
  const lang = useGetLanguage().data ?? "en";
  const logout = useLogout();
  const assignments = useGetAssignments(
    { subjectId },
    { refetchInterval: active ? undefined : false },
  );
  const attendance = useGetAttendanceTables({
    subjectId,
    studentId: student.data?.id ?? "",
  });
  // The card only shows a report the student has already opened: the request
  // is sent when they tap it (CareerSheet), never just for visiting Me.
  const careers = useGetMyCareerSuggestion({ enabled: false });
  const toast = React.useRef<Toast>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const settingsRef = React.useRef<HTMLElement>(null);
  const [sheet, setSheet] = React.useState<
    "name" | "password" | "career" | "notifications" | "logout" | null
  >(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [pushStatus, setPushStatus] = React.useState<PushStatus | null>(null);

  // Read after mount (and after the notifications sheet closes): the status
  // comes from the browser, so the server render can't know it.
  React.useEffect(() => {
    if (sheet !== "notifications") setPushStatus(getPushStatus());
  }, [sheet]);

  const completion = React.useMemo(
    () => calculateSubmissionCompletion(assignments.data ?? []),
    [assignments.data],
  );
  const attendancePercent = React.useMemo(() => {
    const table = ((attendance.data ?? []) as AttendanceData[])[0];
    if (!table) return null;
    return (
      summarizeAttendance(table.statusLists, table.attendances).best?.percent ??
      null
    );
  }, [attendance.data]);

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
      // Storage refusing the photo replies in English: show the TH/EN line.
      const failure = errorSwalContent(
        uploadFailure(error, {
          network: classworkDataLanguage.uploadNetworkError(lang),
          unreadable: classworkDataLanguage.uploadFileUnreadable(lang),
          rejected: assignmentPageLanguage.uploadRejected(lang),
        }),
        studentDataLanguage.somethingWentWrong(lang),
      );
      toast.current?.show({
        severity: "error",
        summary: failure.title,
        detail: failure.text,
        life: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSheetSaved = () => {
    setSheet(null);
    showSavedToast();
  };

  const handleLogout = () => {
    setLoggingOut(true);
    void logout();
  };

  const scrollToSettings = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    settingsRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const topCareer = careers.data?.careers?.[0];
  const topSector = topCareer ? sectorForCareer(topCareer.title, lang) : null;
  const strongest = careers.data
    ? summarizeSkills(careers.data.student.skills).strongest.slice(0, 2)
    : [];
  const pick = () => fileInput.current?.click();
  const closeSheet = () => setSheet(null);

  return (
    <div className="relative flex h-full w-full flex-col font-Anuphan">
      <Toast ref={toast} />
      <input
        ref={fileInput}
        onChange={handlePickPhoto}
        accept="image/*"
        type="file"
        className="hidden"
      />
      {uploading && <LoadingBar />}
      <MeHeader
        student={currentStudent}
        lang={lang}
        active={active}
        onEditPhoto={pick}
        onOpenSettings={scrollToSettings}
      />
      <div className={`${TAB_BODY_CLASS} px-3 pb-10 pt-6`}>
        <div className="flex flex-col gap-3">
          <div className="text-center">
            <h2 className="text-base font-bold text-[#383767]">
              {currentStudent.title} {currentStudent.firstName}{" "}
              {currentStudent.lastName}
            </h2>
            <p className="text-xs font-semibold text-[#7A80A0]">
              {profileLanguage.student(lang)}
              {currentStudent.number
                ? ` · ${profileLanguage.number(lang, currentStudent.number)}`
                : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className={`${CARD} flex items-center gap-2 p-2.5`}
              role="img"
              aria-label={
                completion.percentage === null
                  ? profileLanguage.submittedNoData(lang)
                  : navbarLanguageData.submittedLabel(
                      completion.submittedCount,
                      completion.applicableCount,
                      completion.percentage,
                      lang,
                    )
              }
            >
              <div
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#27AE60 ${completion.percentage ?? 0}%, #E3E8F0 0)`,
                }}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[9px] font-bold text-[#383767]">
                  {completion.percentage === null
                    ? "-"
                    : `${completion.percentage}%`}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-[#7A80A0]">
                  {profileLanguage.submitted(lang)}
                </p>
                <p className="text-sm font-bold text-[#383767]">
                  {completion.submittedCount} / {completion.applicableCount}
                </p>
              </div>
            </div>
            <div className={`${CARD} p-2.5`}>
              <p className="truncate text-[11px] font-bold text-[#7A80A0]">
                {profileLanguage.attendance(lang)}
              </p>
              <p className="text-sm font-bold text-[#1E8E4E]">
                {attendancePercent === null ? "-" : `${attendancePercent}%`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSheet("career")}
            className={`${CARD} flex w-full items-center gap-3 px-3 py-2.5 text-left`}
          >
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#F1EAFE] text-[#7C4DDB]"
            >
              <LuBriefcase size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-[#7A80A0]">
                {profileLanguage.careerMatch(lang)}
              </span>
              <span className="block truncate text-sm font-bold text-[#383767]">
                {topSector?.title ?? careerLanguage.heading(lang)}
              </span>
              {strongest.length > 0 && (
                <span className="mt-0.5 flex flex-wrap gap-1">
                  {strongest.map((skill, i) => (
                    <span
                      key={skill.id}
                      className={`rounded-[7px] px-1.5 py-px text-[10px] font-bold ${
                        i === 0
                          ? "bg-[#E5F7EC] text-[#1E8E4E]"
                          : "bg-[#EEF1F6] text-[#5B6280]"
                      }`}
                    >
                      {localizeSkillTitle(skill.title, lang)}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <LuChevronRight aria-hidden className="text-[#9AA3B8]" size={18} />
          </button>

          <SettingsList
            lang={lang}
            settingsRef={settingsRef}
            notificationStatus={notificationStatusText(pushStatus, lang)}
            onEditName={() => setSheet("name")}
            onEditPhoto={pick}
            onChangePassword={() => setSheet("password")}
            onOpenNotifications={() => setSheet("notifications")}
            onLogout={() => setSheet("logout")}
          />
        </div>
      </div>

      <PhotoEditorSheet
        file={photoFile}
        lang={lang}
        dismissible={!uploading}
        onClose={() => setPhotoFile(null)}
        onSave={handleSavePhoto}
      />
      <CareerSheet open={sheet === "career"} onClose={closeSheet} lang={lang} />
      {sheet === "name" && (
        <EditNameSheet
          student={currentStudent}
          language={lang}
          onClose={closeSheet}
          onSaved={handleSheetSaved}
        />
      )}
      {sheet === "password" && (
        <ChangePasswordSheet
          studentId={currentStudent.id}
          language={lang}
          onClose={closeSheet}
          onSaved={handleSheetSaved}
        />
      )}
      <NotificationPromptSheet
        forceOpen={sheet === "notifications"}
        onClose={closeSheet}
      />
      <Sheet
        open={sheet === "logout"}
        onClose={closeSheet}
        dismissible={!loggingOut}
        ariaLabel={profileLanguage.logoutTitle(lang)}
      >
        <div className="flex flex-col gap-3 pb-2">
          <h2 className="text-base font-bold text-[#383767]">
            {profileLanguage.logoutTitle(lang)}
          </h2>
          <p className="text-sm text-[#7A80A0]">
            {profileLanguage.logoutBody(lang)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loggingOut}
              onClick={closeSheet}
              className="second-button border border-[#E3E8F0] font-bold"
            >
              {profileLanguage.cancel(lang)}
            </button>
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="rounded-2xl bg-error-color px-4 py-2 font-bold text-white disabled:opacity-60"
            >
              {navbarLanguageData.logoutButton(lang)}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
