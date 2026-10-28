import React from "react";
import { MdOutlineDone, MdOutlineRemoveDone } from "react-icons/md";
import { FcLink, FcPlus, FcUpload } from "react-icons/fc";
import { IoChevronDownSharp } from "react-icons/io5";
import Swal from "../../utils/appSwal";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layouts/PopupLayout";
import AssignmentLink from "../subject/AssignmentLink";
import AssignmentText from "../subject/AssignmentText";
import AssignmentUploadFile from "../subject/AssignmentUploadFile";
import CommentSection from "../subject/CommentSection";
import FileStudentAssignmentCard from "../subject/FileStudentAssignmentCard";
import {
  classworkDataLanguage,
  assignmentPageLanguage,
} from "../../data/languages";
import useClickOutside from "../../hook/useClickOutside";
import useConfirmSubmissionGuard from "../../hook/useConfirmSubmissionGuard";
import useAdjustPosition from "../../hook/useWindow";
import {
  FileOnStudentOnAssignment,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../../interfaces";
import {
  useGetFileStudentAssignment,
  useGetLanguage,
  useUpdateStudentOnAssignment,
} from "../../react-query";
import { errorSwalContent, hasUnconfirmedWork } from "../../utils";
import { LegacyStatusInfo } from "./LegacyStatusInfo";
import type { AssignmentItem } from "./types";

/*
 * LEGACY panels of the old assignment page, kept mounted under the new
 * scaffold until Part 3 Tasks 3-6 replace them (your work, status, comments,
 * video quiz).
 */
const SummitWorkMenus = [
  {
    title: "Link",
    icon: <FcLink />,
  },
  {
    title: "Create",
    icon: <FcPlus />,
  },
  {
    title: "Upload",
    icon: <FcUpload />,
  },
] as const;

type SummitWorkMenu = (typeof SummitWorkMenus)[number]["title"];

const menuSummitLists = [
  {
    title: "done",
    icon: (
      <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-green-200 text-green-600">
        <MdOutlineDone />
      </div>
    ),
  },
  {
    title: "notdone",
    icon: (
      <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-red-200 text-red-600">
        <MdOutlineRemoveDone />
      </div>
    ),
  },
] as const;

type LegacyProps = { assignment: AssignmentItem; subjectId: string };

export function LegacyWorkPanels({ assignment, subjectId }: LegacyProps) {
  const language = useGetLanguage();
  // Adapter to replace primereact Toast with Swal custom popup to fit the theme
  const toast = React.useRef<any>({
    show: (options: {
      severity: string;
      summary: string;
      detail: string;
      life?: number;
    }) => {
      Swal.fire({
        title: options.summary,
        text: options.detail,
        icon: options.severity === "error" ? "error" : "success",
        timer: options.life || 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: {
          popup: "rounded-2xl border border-gray-100 shadow-md",
        },
      });
    },
  });
  const divRef = React.useRef<HTMLDivElement>(null);
  // handleUpdateWork is declared below the guard hook; the ref bridges the gap.
  const handleUpdateWorkRef = React.useRef<
    (status: StudentAssignmentStatus) => Promise<boolean>
  >(() => Promise.resolve(false));
  const updateWork = useUpdateStudentOnAssignment();
  const adjustedStyle = useAdjustPosition(divRef, 20); // 20px padding
  const [triggerSummitDropDown, setTriggerSummitDropDown] =
    React.useState(false);
  const [selectMenu, setSelectMenu] = React.useState<{
    title: SummitWorkMenu;
    file?: FileOnStudentOnAssignment;
  } | null>(null);
  const studentFiles = useGetFileStudentAssignment({
    studentOnAssignmentId: assignment.studentOnAssignment.id,
  });

  useClickOutside(divRef, () => {
    setTriggerSummitDropDown(false);
  });

  const unconfirmedWork = hasUnconfirmedWork({
    assignmentType: assignment.type,
    fileCount: studentFiles.data?.length ?? 0,
    status: assignment.studentOnAssignment.status,
  });

  useConfirmSubmissionGuard({
    enabled: unconfirmedWork && !updateWork.isPending,
    onConfirm: () => handleUpdateWorkRef.current("SUBMITTED"),
    language: language.data ?? "en",
  });

  const studentOnAssignment: StudentOnAssignment =
    assignment.studentOnAssignment;

  const SummitWork = () => {
    if (assignment.type === "Material") {
      return null;
    }
    return (
      <div className="h-max w-full rounded-2xl border bg-white p-2">
        <span className="text-lg">
          {classworkDataLanguage.attrachs(language.data ?? "en")}
        </span>
        <div className="mt-3 flex h-32 w-full items-center justify-evenly gap-2 overflow-hidden rounded-2xl border-b pb-5">
          {SummitWorkMenus.map((menu, index) => {
            return (
              <label
                onClick={() => setSelectMenu({ title: menu.title })}
                className="group flex cursor-pointer flex-col items-center justify-center gap-2"
                key={index}
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border text-xl transition group-hover:scale-110 group-hover:bg-gray-200">
                  {menu.icon}
                </div>
                <span className="text-sm">
                  {classworkDataLanguage.attrachType[
                    menu.title.toLowerCase() as keyof typeof classworkDataLanguage.attrachType
                  ](language.data ?? "en")}
                </span>
              </label>
            );
          })}
        </div>

        <h1 className="flex w-full items-center justify-between p-2 text-xl font-semibold">
          {classworkDataLanguage.yourWork(language.data ?? "en")}
        </h1>
        <ul className="grid w-full gap-2">
          {studentFiles.data?.map((file, index) => {
            return (
              <FileStudentAssignmentCard
                key={index}
                file={file}
                onShowText={(file) => setSelectMenu({ title: "Create", file })}
              />
            );
          })}
        </ul>
      </div>
    );
  };

  const handleUpdateWork = async (
    status: StudentAssignmentStatus,
  ): Promise<boolean> => {
    try {
      await updateWork.mutateAsync({
        query: {
          studentOnAssignmentId: studentOnAssignment.id,
        },
        body: {
          status,
        },
      });
      toast.current?.show({
        severity: "success",
        summary: assignmentPageLanguage.workUpdatedTitle(language.data ?? "en"),
        detail: assignmentPageLanguage.workUpdatedDetail(language.data ?? "en"),
        life: 3000,
      });
      setTriggerSummitDropDown(false);
      return true;
    } catch (error) {
      Swal.fire({
        ...errorSwalContent(error),
        icon: "error",
      });
      return false;
    }
  };
  handleUpdateWorkRef.current = handleUpdateWork;

  const SummitStatus = () => {
    if (assignment.type === "Material") {
      return null;
    }
    return (
      <div className="h-max w-full rounded-2xl border bg-white p-2">
        <div className="flex w-full items-center justify-between p-2 text-xl font-semibold">
          <div className="flex flex-col gap-0">
            {classworkDataLanguage.summitWorkTitle(language.data ?? "en")}
            <span className="text-xs font-normal text-gray-500">
              {classworkDataLanguage.summitWorkDescription(
                language.data ?? "en",
              )}
            </span>
          </div>{" "}
        </div>
        {unconfirmedWork && (
          <div className="mx-2 mb-2 flex items-center gap-2 rounded-xl border border-warning-color bg-warning-color/20 p-2 text-sm font-medium text-gray-800">
            ⚠️
            {classworkDataLanguage.unsubmittedBanner(language.data ?? "en")}
          </div>
        )}
        <div className="relative flex items-center">
          {(studentOnAssignment.status === "PENDDING" ||
            studentOnAssignment.status === "IMPROVED") && (
            <button
              onClick={() => {
                handleUpdateWork("SUBMITTED");
              }}
              disabled={updateWork.isPending}
              type="submit"
              className="flex h-10 w-52 items-center justify-center gap-2 rounded-2xl rounded-r-none bg-primary-color p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
            >
              {updateWork.isPending ? (
                <LoadingSpinner />
              ) : (
                classworkDataLanguage.menuSummitLists.done(
                  language.data ?? "en",
                )
              )}
              <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-green-200 text-green-600">
                <MdOutlineDone />
              </div>
            </button>
          )}
          {studentOnAssignment.status === "SUBMITTED" && (
            <button
              onClick={() => {
                handleUpdateWork("PENDDING");
              }}
              disabled={updateWork.isPending}
              type="submit"
              className="flex h-10 w-52 items-center justify-center gap-2 rounded-2xl rounded-r-none bg-gray-400 p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
            >
              {updateWork.isPending ? (
                <LoadingSpinner />
              ) : (
                classworkDataLanguage.menuSummitLists.notdone(
                  language.data ?? "en",
                )
              )}

              <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-red-200 text-red-600">
                <MdOutlineRemoveDone />
              </div>
            </button>
          )}

          {studentOnAssignment.status === "REVIEWD" && (
            <button
              disabled={true}
              type="submit"
              className="flex h-10 w-52 items-center justify-center gap-2 rounded-2xl rounded-r-none bg-primary-color p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
            >
              {classworkDataLanguage.menuSummitLists.review(
                language.data ?? "en",
              )}
            </button>
          )}
          <button
            onClick={() => setTriggerSummitDropDown((prev) => !prev)}
            type="button"
            className="flex h-10 w-max items-center justify-center rounded-2xl rounded-l-none bg-primary-color p-2 text-base font-medium text-white"
          >
            <IoChevronDownSharp />
          </button>
          {triggerSummitDropDown && (
            <div
              style={{
                position: "absolute",
                ...adjustedStyle,
              }}
              ref={divRef}
            >
              <div className="absolute top-8 z-40 h-max w-60 rounded-2xl border bg-white p-1 drop-shadow">
                {menuSummitLists.map((menu, index) => {
                  return (
                    <button
                      disabled={updateWork.isPending}
                      onClick={() => {
                        if (menu.title === "done") {
                          handleUpdateWork("SUBMITTED");
                        }
                        if (menu.title === "notdone") {
                          handleUpdateWork("PENDDING");
                        }
                      }}
                      key={index}
                      className={`flex w-full items-center justify-start gap-10 p-2 text-base font-medium text-gray-500 hover:bg-primary-color hover:text-white`}
                    >
                      {menu.icon}
                      {classworkDataLanguage.menuSummitLists[
                        menu.title as keyof typeof classworkDataLanguage.menuSummitLists
                      ](language.data ?? "en")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <span>
          {assignment.studentOnAssignment.completedAt && (
            <div className="mt-2 break-words text-sm font-medium text-green-500">
              {assignmentPageLanguage.markedDoneAt(language.data ?? "en")}{" "}
              {new Date(
                assignment.studentOnAssignment.completedAt,
              ).toLocaleDateString(undefined, {
                minute: "numeric",
                hour: "numeric",
                day: "numeric",
                month: "long",
              })}{" "}
            </div>
          )}
        </span>
      </div>
    );
  };
  return (
    <>
      {selectMenu !== null && (
        <PopupLayout onClose={() => setSelectMenu(null)}>
          {selectMenu.title === "Create" && (
            <AssignmentText
              assignment={assignment}
              schoolId={studentOnAssignment.schoolId}
              onClose={() => setSelectMenu(null)}
              text={selectMenu.file}
              studentOnAssignmentId={studentOnAssignment.id}
              toast={toast}
            />
          )}
          {selectMenu.title === "Upload" && (
            <AssignmentUploadFile
              onClose={() => setSelectMenu(null)}
              schoolId={studentOnAssignment.schoolId}
              toast={toast}
              studentOnAssignmentId={studentOnAssignment.id}
            />
          )}
          {selectMenu.title === "Link" && (
            <AssignmentLink
              onClose={() => setSelectMenu(null)}
              toast={toast}
              studentOnAssignmentId={studentOnAssignment.id}
            />
          )}
        </PopupLayout>
      )}
      <LegacyStatusInfo assignment={assignment} subjectId={subjectId} />
      <SummitStatus />
      <SummitWork />
      <CommentSection
        studentOnAssignmentId={assignment.studentOnAssignment.id}
      />
    </>
  );
}
