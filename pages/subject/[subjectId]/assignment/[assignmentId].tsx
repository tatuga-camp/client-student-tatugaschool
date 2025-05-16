import parse from "html-react-parser";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Toast } from "primereact/toast";
import React from "react";
import { FaRegFile, FaRegFileImage, FaRegSadTear } from "react-icons/fa";
import { FcLink, FcPlus, FcUpload } from "react-icons/fc";
import { IoIosInformationCircle, IoMdClose } from "react-icons/io";
import { IoChevronDownSharp } from "react-icons/io5";
import { MdOutlineDone, MdOutlineRemoveDone } from "react-icons/md";
import { RiEmotionHappyFill } from "react-icons/ri";
import Swal from "sweetalert2";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import Layout from "../../../../components/layouts/Layout";
import AssignmentLink from "../../../../components/subject/AssignmentLink";
import AssignmentStatusCard from "../../../../components/subject/AssignmentStatus";
import AssignmentText from "../../../../components/subject/AssignmentText";
import AssignmentUploadFile from "../../../../components/subject/AssignmentUploadFile";
import CommentSection from "../../../../components/subject/CommentSection";
import FileStudentAssignmentCard from "../../../../components/subject/FileStudentAssignmentCard";
import { classworkDataLanguage } from "../../../../data/language";
import useClickOutside from "../../../../hook/useClickOutside";
import useAdjustPosition from "../../../../hook/useWindow";
import {
  ErrorMessages,
  FileOnStudentOnAssignment,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../../../../interfaces";
import {
  useGetAssignments,
  useGetFileStudentAssignment,
  useGetLanguage,
  useUpdateStudentOnAssignment,
} from "../../../../react-query";
import { timeAgo, timeLeft } from "../../../../utils";
import PopupLayout from "../../../../components/layouts/PopupLayout";
import TextEditor from "../../../../components/common/TextEditor";

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

function Index({
  assignmentId,
  subjectId,
}: {
  assignmentId: string;
  subjectId: string;
}) {
  const language = useGetLanguage();
  const toast = React.useRef<Toast>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const updateWork = useUpdateStudentOnAssignment();
  const adjustedStyle = useAdjustPosition(divRef, 20); // 20px padding
  const [triggerSummitDropDown, setTriggerSummitDropDown] =
    React.useState(false);
  const [selectMenu, setSelectMenu] = React.useState<{
    title: SummitWorkMenu;
    file?: FileOnStudentOnAssignment;
  } | null>(null);
  const assignment = useGetAssignments({ subjectId }).data?.find(
    (item) => item.id === assignmentId,
  );

  const studentFiles = useGetFileStudentAssignment({
    studentOnAssignmentId: assignment?.studentOnAssignment.id as string,
  });

  useClickOutside(divRef, () => {
    setTriggerSummitDropDown(false);
  });
  if (!assignment) {
    return (
      <div>
        <h1>{classworkDataLanguage.notFound(language.data ?? "en")}</h1>
      </div>
    );
  }
  const studentOnAssignment: StudentOnAssignment =
    assignment.studentOnAssignment;

  const SummitWork = () => {
    if (assignment.type === "Material") {
      return null;
    }
    return (
      <div className="h-max w-full rounded-md border bg-white p-2">
        <span className="text-lg">
          {classworkDataLanguage.attrachs(language.data ?? "en")}
        </span>
        <div className="mt-3 flex h-32 w-full items-center justify-evenly gap-2 overflow-hidden rounded-md border-b pb-5">
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

  const handleUpdateWork = async (status: StudentAssignmentStatus) => {
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
        summary: "Success",
        detail: "Work updated successfully",
        life: 3000,
      });
      setTriggerSummitDropDown(false);
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

  const SummitStatus = () => {
    if (assignment.type === "Material") {
      return null;
    }
    return (
      <div className="h-max w-full rounded-md border bg-white p-2">
        <div className="flex w-full items-center justify-between p-2 text-xl font-semibold">
          <div className="flex flex-col gap-0">
            {classworkDataLanguage.summitWorkTitle(language.data ?? "en")}
            <span className="text-xs font-normal text-gray-500">
              {classworkDataLanguage.summitWorkDescription(
                language.data ?? "en",
              )}
            </span>
          </div>{" "}
          <IoIosInformationCircle />
        </div>
        <div className="relative flex items-center">
          {studentOnAssignment.status === "PENDDING" && (
            <button
              onClick={() => {
                handleUpdateWork("SUBMITTED");
              }}
              disabled={updateWork.isPending}
              type="submit"
              className="gradient-bg flex h-10 w-52 items-center justify-center gap-2 rounded-md rounded-r-none p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
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
              className="flex h-10 w-52 items-center justify-center gap-2 rounded-md rounded-r-none bg-gray-400 p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
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
              className="gradient-bg flex h-10 w-52 items-center justify-center gap-2 rounded-md rounded-r-none p-2 text-base font-medium text-white opacity-85 hover:opacity-100"
            >
              {classworkDataLanguage.menuSummitLists.review(
                language.data ?? "en",
              )}
            </button>
          )}
          <button
            onClick={() => setTriggerSummitDropDown((prev) => !prev)}
            type="button"
            className="gradient-bg h-10 w-max rounded-md rounded-l-none p-2 text-base font-medium text-white"
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
              <div className="absolute top-8 z-40 h-max w-60 rounded-md border bg-white p-1 drop-shadow">
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
              Marked as done at{" "}
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
  const StudentWorkInfo = () => {
    if (assignment.type === "Material") {
      return null;
    }
    return (
      <div className="h-max w-full rounded-md border bg-white p-2">
        <div className="flex w-full items-center justify-between p-2 text-xl font-semibold">
          Assignment <IoIosInformationCircle />
        </div>
        <ul className="mt-2 grid w-full">
          <li className="flex h-max items-center justify-start gap-1 border-b p-2">
            <div className="w-40 font-semibold">Status:</div>
            <div className="w-max max-w-40">
              <AssignmentStatusCard
                status={assignment.studentOnAssignment.status}
              />
            </div>
          </li>
          <li className="flex h-max items-center justify-start gap-1 border-b p-2">
            <div className="w-40 font-semibold">Score :</div>
            <div className="w-max max-w-40 text-2xl font-semibold">
              {assignment.studentOnAssignment.score ? (
                <span>
                  {assignment.studentOnAssignment.score} /{" "}
                  {assignment.maxScore}{" "}
                </span>
              ) : (
                "Not Graded"
              )}
            </div>
          </li>

          {assignment.studentOnAssignment.completedAt && (
            <li className="flex h-max items-center justify-start gap-1 border-b p-2">
              <div className="w-40 font-semibold">Summit Work At:</div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-blue-600">
                  {new Date(
                    assignment.studentOnAssignment.completedAt,
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <span className="text-xs">
                  {new Date(
                    assignment.studentOnAssignment.completedAt,
                  ).toLocaleDateString(undefined, {
                    minute: "numeric",
                    hour: "numeric",
                  })}
                </span>
              </div>
            </li>
          )}
          {assignment.studentOnAssignment.reviewdAt && (
            <li className="flex h-max items-center justify-start gap-1 border-b p-2">
              <div className="w-40 font-semibold">Review Work At:</div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-green-600">
                  {new Date(
                    assignment.studentOnAssignment.reviewdAt,
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <span className="text-xs">
                  {new Date(
                    assignment.studentOnAssignment.reviewdAt,
                  ).toLocaleDateString(undefined, {
                    minute: "numeric",
                    hour: "numeric",
                  })}
                </span>
              </div>
            </li>
          )}
          {assignment.dueDate && (
            <li className="flex h-max items-center justify-start gap-1 border-b p-2">
              <div className="w-40 font-semibold">Deadline:</div>
              <div>
                {new Date(assignment.dueDate).getTime() <=
                new Date().getTime() ? (
                  <span className="flex items-center gap-1 font-semibold text-red-600">
                    {timeAgo({
                      pastTime: new Date(assignment.dueDate).toISOString(),
                    })}{" "}
                    ago <FaRegSadTear />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-green-600">
                    {timeLeft({
                      targetTime: new Date(assignment.dueDate).toISOString(),
                    })}{" "}
                    left <RiEmotionHappyFill />
                  </span>
                )}{" "}
                <span className="text-xs">
                  {new Date(assignment.dueDate).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Assignment: {assignment.title} </title>
      </Head>
      <Toast ref={toast} />
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

      <Layout
        subjectId={subjectId}
        listData={
          <>
            <StudentWorkInfo />
            <SummitStatus />
            <SummitWork />
          </>
        }
      >
        <main className="flex h-max w-full flex-col gap-5 xl:w-7/12">
          <div className="w-full rounded-md bg-white p-3">
            <h1 className="border-b text-xl">{assignment.title}</h1>

            <div className={`my-5 h-screen`}>
              <TextEditor
                disabled={true}
                schoolId={assignment.schoolId}
                value={assignment.description}
                onChange={() => {}}
                menubar={false}
                toolbar={false}
              />
            </div>
            <ul className="grid w-full gap-2">
              {assignment.files?.map((file, index) => {
                const isImage = file.type.includes("image");
                const fileName = file.url.split("/").pop();
                return (
                  <li
                    onClick={() => window.open(file.url, "_blank")}
                    key={index}
                    className="flex h-14 w-full items-center justify-between overflow-hidden rounded-md border bg-white transition hover:cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex h-full w-full items-center justify-start gap-2">
                      <div className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white">
                        {isImage ? <FaRegFileImage /> : <FaRegFile />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{fileName}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-white p-2">
            <CommentSection
              studentOnAssignmentId={assignment.studentOnAssignment.id}
            />
          </div>
        </main>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const params = ctx.params;

    if (!params?.subjectId || !params?.assignmentId) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        subjectId: params.subjectId,
        assignmentId: params.assignmentId,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }
};
