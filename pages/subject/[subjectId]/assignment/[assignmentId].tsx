import parse from "html-react-parser";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React from "react";
import { FaRegFile, FaRegFileImage, FaRegSadTear } from "react-icons/fa";
import { FcLink, FcPlus, FcUpload } from "react-icons/fc";
import { IoIosInformationCircle, IoMdClose } from "react-icons/io";
import { IoChevronDownSharp } from "react-icons/io5";
import { MdOutlineDone, MdOutlineRemoveDone } from "react-icons/md";
import { RiEmotionHappyFill } from "react-icons/ri";
import Swal from "sweetalert2";
import Layout from "../../../../components/layouts/Layout";
import AssignmentLink from "../../../../components/subject/AssignmentLink";
import AssignmentStatusCard from "../../../../components/subject/AssignmentStatus";
import AssignmentText from "../../../../components/subject/AssignmentText";
import AssignmentUploadFile from "../../../../components/subject/AssignmentUploadFile";
import CommentSection from "../../../../components/subject/CommentSection";
import FileStudentAssignmentCard from "../../../../components/subject/FileStudentAssignmentCard";
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
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import { classworkDataLanguage } from "../../../../data/language";

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
      <div
        className="w-5 bg-green-200 text-green-600
   h-5 overflow-hidden rounded-full flex items-center justify-center"
      >
        <MdOutlineDone />
      </div>
    ),
  },
  {
    title: "notdone",
    icon: (
      <div
        className="w-5 bg-red-200 text-red-600
h-5 overflow-hidden rounded-full flex items-center justify-center"
      >
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
    (item) => item.id === assignmentId
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
    return (
      <div className="w-full bg-white  border p-2 rounded-md h-max">
        <span className="text-lg">
          {classworkDataLanguage.attrachs(language.data ?? "en")}
        </span>
        <div
          className="w-full h-32 mt-3  pb-5  border-b  
        gap-2 flex items-center justify-evenly rounded-md overflow-hidden"
        >
          {SummitWorkMenus.map((menu, index) => {
            return (
              <label
                onClick={() => setSelectMenu({ title: menu.title })}
                className="flex group flex-col cursor-pointer items-center justify-center gap-2"
                key={index}
              >
                <div className="w-10 text-xl h-10 group-hover:bg-gray-200 transition group-hover:scale-110 rounded-full overflow-hidden flex items-center justify-center border">
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

        <h1 className="font-semibold flex w-full items-center justify-between text-xl p-2">
          {classworkDataLanguage.yourWork(language.data ?? "en")}
        </h1>
        <ul className="grid gap-2 w-full">
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
    return (
      <div className="w-full bg-white  border p-2 rounded-md h-max">
        <div className="font-semibold flex w-full items-center justify-between text-xl p-2">
          <div className="flex flex-col gap-0">
            {classworkDataLanguage.summitWorkTitle(language.data ?? "en")}
            <span className="text-xs font-normal text-gray-500">
              {classworkDataLanguage.summitWorkDescription(
                language.data ?? "en"
              )}
            </span>
          </div>{" "}
          <IoIosInformationCircle />
        </div>
        <div className="flex relative  items-center">
          {studentOnAssignment.status === "PENDDING" && (
            <button
              onClick={() => {
                handleUpdateWork("SUBMITTED");
              }}
              disabled={updateWork.isPending}
              type="submit"
              className="w-52 p-2 h-10 opacity-85 hover:opacity-100 
            font-medium rounded-r-none rounded-md text-base text-white
     gradient-bg flex items-center gap-2 justify-center"
            >
              {updateWork.isPending ? (
                <LoadingSpinner />
              ) : (
                classworkDataLanguage.menuSummitLists.done(
                  language.data ?? "en"
                )
              )}
              <div
                className="w-5 bg-green-200 text-green-600
             h-5 overflow-hidden rounded-full flex items-center justify-center"
              >
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
              className="w-52 p-2 h-10 opacity-85 hover:opacity-100 
            font-medium rounded-r-none rounded-md text-base text-white
    bg-gray-400 flex items-center gap-2 justify-center"
            >
              {updateWork.isPending ? (
                <LoadingSpinner />
              ) : (
                classworkDataLanguage.menuSummitLists.notdone(
                  language.data ?? "en"
                )
              )}

              <div
                className="w-5 bg-red-200 text-red-600
h-5 overflow-hidden rounded-full flex items-center justify-center"
              >
                <MdOutlineRemoveDone />
              </div>
            </button>
          )}

          {studentOnAssignment.status === "REVIEWD" && (
            <button
              disabled={true}
              type="submit"
              className="w-52 p-2 h-10 opacity-85 hover:opacity-100 
              font-medium rounded-r-none rounded-md text-base text-white
       gradient-bg flex items-center gap-2 justify-center"
            >
              {classworkDataLanguage.menuSummitLists.review(
                language.data ?? "en"
              )}
            </button>
          )}
          <button
            onClick={() => setTriggerSummitDropDown((prev) => !prev)}
            type="button"
            className="w-max p-2 h-10  font-medium rounded-l-none rounded-md text-base text-white
     gradient-bg"
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
              <div className="w-60 h-max z-40 p-1 absolute top-8 rounded-md bg-white drop-shadow border">
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
                      className={`w-full p-2 flex gap-10 items-center justify-start text-base
             font-medium 
             text-gray-500 hover:bg-primary-color hover:text-white
             
             `}
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
            <div className="text-sm break-words text-green-500 font-medium mt-2">
              Marked as done at{" "}
              {new Date(
                assignment.studentOnAssignment.completedAt
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
    return (
      <div className="w-full bg-white  border p-2 rounded-md h-max">
        <div className="font-semibold flex w-full items-center justify-between text-xl p-2">
          Assignment <IoIosInformationCircle />
        </div>
        <ul className="mt-2 grid w-full ">
          <li className="flex gap-1 h-max border-b items-center p-2 justify-start">
            <div className="w-40  font-semibold">Status:</div>
            <div className="w-max max-w-40">
              <AssignmentStatusCard
                status={assignment.studentOnAssignment.status}
              />
            </div>
          </li>
          <li className="flex gap-1 h-max border-b items-center p-2 justify-start">
            <div className="w-40  font-semibold">Score :</div>
            <div className="w-max max-w-40 font-semibold text-2xl">
              {assignment.studentOnAssignment.score ? (
                <span>
                  {assignment.studentOnAssignment.score} / {assignment.maxScore}{" "}
                </span>
              ) : (
                "Not Graded"
              )}
            </div>
          </li>

          {assignment.studentOnAssignment.completedAt && (
            <li className="flex gap-1 h-max border-b items-center p-2 justify-start">
              <div className="w-40 font-semibold">Summit Work At:</div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-blue-600 font-semibold">
                  {new Date(
                    assignment.studentOnAssignment.completedAt
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <span className="text-xs">
                  {new Date(
                    assignment.studentOnAssignment.completedAt
                  ).toLocaleDateString(undefined, {
                    minute: "numeric",
                    hour: "numeric",
                  })}
                </span>
              </div>
            </li>
          )}
          {assignment.studentOnAssignment.reviewdAt && (
            <li className="flex gap-1 h-max border-b items-center p-2 justify-start">
              <div className="w-40 font-semibold">Review Work At:</div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-green-600 font-semibold">
                  {new Date(
                    assignment.studentOnAssignment.reviewdAt
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <span className="text-xs">
                  {new Date(
                    assignment.studentOnAssignment.reviewdAt
                  ).toLocaleDateString(undefined, {
                    minute: "numeric",
                    hour: "numeric",
                  })}
                </span>
              </div>
            </li>
          )}
          {assignment.dueDate && (
            <li className="flex gap-1 h-max border-b items-center p-2 justify-start">
              <div className="w-40 font-semibold">Deadline:</div>
              <div>
                {new Date(assignment.dueDate).getTime() <=
                new Date().getTime() ? (
                  <span className="text-red-600 flex items-center gap-1 font-semibold">
                    {timeAgo({
                      pastTime: new Date(assignment.dueDate).toISOString(),
                    })}{" "}
                    ago <FaRegSadTear />
                  </span>
                ) : (
                  <span className="text-green-600 flex font-semibold  items-center gap-1">
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
        <div className="w-screen h-screen flex items-center justify-center fixed z-50 top-0 right-0 bottom-0 left-0 m-auto">
          <div
            className="w-full md:w-10/12 lg:w-[35rem] relative 
          h-max p-3 bg-white rounded-md"
          >
            <div className="w-full flex justify-end">
              <button
                onClick={() => setSelectMenu(null)}
                className="text-lg  hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
              >
                <IoMdClose />
              </button>
            </div>
            {selectMenu.title === "Create" && (
              <AssignmentText
                schoolId={studentOnAssignment.schoolId}
                onClose={() => setSelectMenu(null)}
                text={selectMenu.file}
                studentOnAssignmentId={studentOnAssignment.id}
                toast={toast}
              />
            )}
            {selectMenu.title === "Upload" && (
              <AssignmentUploadFile
                schoolId={studentOnAssignment.schoolId}
                toast={toast}
                studentOnAssignmentId={studentOnAssignment.id}
              />
            )}
            {selectMenu.title === "Link" && (
              <AssignmentLink
                toast={toast}
                studentOnAssignmentId={studentOnAssignment.id}
              />
            )}
          </div>
          <footer
            className="w-screen h-screen bg-black/50 fixed
          -z-10 top-0 right-0 bottom-0 left-0 m-auto"
          ></footer>
        </div>
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
        <main className="w-full xl:w-7/12  h-max flex flex-col gap-5">
          <div className="w-full bg-white p-3 rounded-md">
            <h1 className="text-xl border-b">{assignment.title}</h1>

            <div className={` my-5`}>{parse(assignment.description)}</div>
            <ul className="grid  gap-2 w-full">
              {assignment.files?.map((file, index) => {
                const isImage = file.type.includes("image");
                const fileName = file.url.split("/").pop();
                return (
                  <li
                    onClick={() => window.open(file.url, "_blank")}
                    key={index}
                    className="w-full hover:cursor-pointer h-14 hover:bg-gray-100 transition
                             flex overflow-hidden rounded-md items-center justify-between  bg-white border"
                  >
                    <div className="w-full h-full flex items-center justify-start gap-2">
                      <div
                        className="w-16 gradient-bg text-white text-lg flex items-center justify-center
                       border-r h-full"
                      >
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
