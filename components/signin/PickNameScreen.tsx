import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { LuSearch, LuUserX, LuUsers } from "react-icons/lu";
import {
  subjectDataLanguage as t,
  welcomeDataLanguage,
} from "../../data/languages";
import { ErrorMessages, StudentOnSubject } from "../../interfaces";
import {
  useGetLanguage,
  useGetSubjectByCode,
  useSignIn,
} from "../../react-query";
import { errorSwalContent } from "../../utils";
import Swal from "../../utils/appSwal";
import { subjectHref } from "../../utils/notificationLink";
import { safeSet } from "../../utils/safeStorage";
import { isPasswordRejection, needsPassword } from "../../utils/signInError";
import { signInRequest } from "../../utils/signInRequest";
import { hiddenQueryReady, searchStudents } from "../../utils/studentSearch";
import { useLayerBack } from "../app/shell/layerBack";
import { HiddenListSearch } from "./HiddenListSearch";
import { PasswordSheet } from "./PasswordSheet";
import { StudentGrid } from "./StudentGrid";
import { SubjectCover } from "./SubjectCover";
import { SubjectLoadError } from "./SubjectLoadError";
import { TeachersSheet } from "./TeachersSheet";

type Props = { subjectCode: string; announcementId: string | null };

type StateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
};

function PickerState({ icon, title, description, action }: StateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2C7CD1]/10 text-xl text-[#2C7CD1]">
        {icon}
      </div>
      <p className="mt-3 text-base font-bold text-[#383767]">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-[#7A80A0]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function GridSkeleton({ label }: { label: string }) {
  return (
    <ul
      role="status"
      aria-label={label}
      className="grid animate-pulse grid-cols-3 gap-2"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <li key={i} className="h-[104px] rounded-2xl bg-[#E9EEF5]" />
      ))}
    </ul>
  );
}

export function PickNameScreen({ subjectCode, announcementId }: Props) {
  const router = useRouter();
  const subject = useGetSubjectByCode(subjectCode);
  const lang = useGetLanguage().data ?? "en";
  const signIn = useSignIn();
  const [search, setSearch] = useState("");
  const [teachersOpen, setTeachersOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  // The student whose password is being asked for; kept while the sheet
  // slides out so its content does not blank.
  const [pwStudent, setPwStudent] = useState<StudentOnSubject | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  // Counts failed attempts, so the field refocuses even for a repeat error.
  const [attempt, setAttempt] = useState(0);
  // True from submit until navigation ends, so nothing can submit twice.
  const [pwBusy, setPwBusy] = useState(false);

  const data = subject.data;
  const hideList = data?.allowHideStudentList === true;
  const query = search.trim();
  // Back closes the password or teachers sheet first.
  useLayerBack();

  useEffect(() => {
    if (data) safeSet("subject_id", data.id);
  }, [data?.id]);

  const visible = useMemo(
    () =>
      data ? searchStudents(data.studentOnSubjects, search, hideList) : [],
    [data, search, hideList],
  );

  const goToSubject = () =>
    router.push(subjectHref(data?.id ?? "", announcementId));

  const closePasswordSheet = () => {
    setPwOpen(false);
    setPasswordError(null);
  };

  const handlePassword = async (password: string) => {
    if (!pwStudent || pwBusy) return;
    setPwBusy(true);
    try {
      await signIn.mutateAsync(signInRequest(pwStudent, password));
    } catch (error) {
      // The server names the password in its 400 message; show the localized
      // copy for that and the server text for anything else.
      const { text } = errorSwalContent(error);
      setPasswordError(
        isPasswordRejection(text) ? t.wrongPassword(lang) : text,
      );
      setAttempt((n) => n + 1);
      setPwBusy(false);
      return;
    }
    try {
      await goToSubject();
    } catch {
      setPasswordError(welcomeDataLanguage.joinFailed(lang));
      setAttempt((n) => n + 1);
    } finally {
      setPwBusy(false);
    }
  };

  const handlePick = async (student: StudentOnSubject) => {
    setPendingId(student.id);
    try {
      await signIn.mutateAsync(signInRequest(student));
    } catch (error) {
      const result = error as ErrorMessages;
      console.error(error);
      if (needsPassword(error)) {
        setPasswordError(null);
        setPwStudent(student);
        setPwOpen(true);
      } else {
        Swal.fire({
          title: result?.error ? result.error : "Something Went Wrong",
          text: result?.message?.toString(),
          footer: result?.statusCode
            ? "Code Error: " + result.statusCode.toString()
            : "",
          icon: "error",
        });
      }
      setPendingId(null);
      return;
    }
    try {
      await goToSubject();
    } catch {
      Swal.fire({
        icon: "error",
        title: welcomeDataLanguage.joinFailed(lang),
      });
    } finally {
      setPendingId(null);
    }
  };

  const clearButton = (
    <button
      type="button"
      onClick={() => setSearch("")}
      className="chunky-btn chunky-btn-secondary"
    >
      {t.clearSearch(lang)}
    </button>
  );

  const renderBody = () => {
    if (!data) return <GridSkeleton label={t.loadingStudents(lang)} />;
    if (hideList) {
      const ready = hiddenQueryReady(query);
      if (ready && visible.length === 0) {
        return (
          <PickerState
            icon={<LuUserX aria-hidden />}
            title={t.noStudentsFound(lang)}
            description={t.checkSpelling(lang)}
            action={clearButton}
          />
        );
      }
      return (
        <HiddenListSearch
          results={ready ? visible : null}
          query={query}
          lang={lang}
          pendingId={pendingId}
          onPick={handlePick}
        />
      );
    }
    if (visible.length > 0) {
      return (
        <StudentGrid
          students={visible}
          lang={lang}
          pendingId={pendingId}
          onPick={handlePick}
        />
      );
    }
    if (query !== "") {
      return (
        <PickerState
          icon={<LuUserX aria-hidden />}
          title={t.noStudentsFound(lang)}
          description={t.checkSpelling(lang)}
          action={clearButton}
        />
      );
    }
    return (
      <PickerState
        icon={<LuUsers aria-hidden />}
        title={t.noStudentsYet(lang)}
        description={t.noStudentsYetDescription(lang)}
      />
    );
  };

  if (subject.isError && !data) {
    return <SubjectLoadError onRetry={() => subject.refetch()} />;
  }

  return (
    <div className="app-scroll hideScrollBar h-full w-full bg-[#F7F8FA] font-Anuphan">
      <div className="flex min-h-full flex-col">
        {data && (
          <SubjectCover
            subject={data}
            lang={lang}
            onTeachers={() => setTeachersOpen(true)}
          />
        )}
        <main
          className="relative z-[1] -mt-4 flex-1 rounded-t-3xl bg-white px-[18px] pt-[18px]"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}
        >
          <h2 className="text-lg font-extrabold text-[#383767]">
            {t.whoAreYou(lang)}
          </h2>
          <label className="chunky mb-3 mt-2 flex items-center gap-2 px-3 focus-within:border-[#2C7CD1]">
            <LuSearch aria-hidden className="shrink-0 text-[#9AA3B8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              autoComplete="off"
              inputMode="search"
              aria-label={t.searchHint(lang)}
              placeholder={t.searchHint(lang)}
              className="min-h-11 w-full bg-transparent text-sm text-[#383767] outline-none placeholder:text-[#9AA3B8]"
              style={{ fontSize: 16 }}
            />
          </label>
          {renderBody()}
        </main>
      </div>
      <PasswordSheet
        open={pwOpen}
        student={pwStudent}
        error={passwordError}
        pending={pwBusy}
        errorKey={attempt}
        onEdit={() => setPasswordError(null)}
        onSubmit={handlePassword}
        onClose={closePasswordSheet}
      />
      {data && (
        <TeachersSheet
          open={teachersOpen}
          onClose={() => setTeachersOpen(false)}
          teachers={data.teacherOnSubjects}
          lang={lang}
        />
      )}
    </div>
  );
}
