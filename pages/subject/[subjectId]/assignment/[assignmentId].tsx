import { GetServerSideProps } from "next";
import React from "react";
import Layout from "../../../../components/layouts/Layout";
import Head from "next/head";
import {
  useCreateFileStudentAssignment,
  useGetAssignments,
  useGetFileStudentAssignment,
} from "../../../../react-query";
import parse from "html-react-parser";
import {
  FaPlus,
  FaRegFile,
  FaRegFileImage,
  FaRegSadTear,
  FaYoutube,
} from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import { useRouter } from "next/router";
import AssignmentStatusCard from "../../../../components/subject/AssignmentStatus";
import { generateBlurHash, timeAgo, timeLeft } from "../../../../utils";
import { RiEmotionHappyFill } from "react-icons/ri";
import { IoIosInformationCircle, IoMdClose } from "react-icons/io";
import { FcLink, FcPlus, FcUpload } from "react-icons/fc";
import AssignmentText from "../../../../components/subject/AssignmentText";
import AssignmentLink from "../../../../components/subject/AssignmentLink";
import {
  ErrorMessages,
  FileOnStudentOnAssignment,
  StudentOnAssignment,
} from "../../../../interfaces";
import Swal from "sweetalert2";
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../../../services";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import FileStudentAssignmentCard from "../../../../components/subject/FileStudentAssignmentCard";
import AssignmentUploadFile from "../../../../components/subject/AssignmentUploadFile";

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

function Index({
  assignmentId,
  subjectId,
}: {
  assignmentId: string;
  subjectId: string;
}) {
  const router = useRouter();
  const toast = React.useRef<Toast>(null);

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
  if (!assignment) {
    return (
      <div>
        <h1>Assignment not found</h1>
      </div>
    );
  }
  const studentOnAssignment: StudentOnAssignment =
    assignment.studentOnAssignment;

  const SummitWork = () => {
    return (
      <div className="w-full bg-white  border p-2 rounded-md h-max">
        <span className="text-xs">Attrach work</span>
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
                <span className="text-sm">{menu.title}</span>
              </label>
            );
          })}
        </div>

        <h1 className="font-semibold flex w-full items-center justify-between text-xl p-2">
          Your Work
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
                onClose={() => setSelectMenu(null)}
                text={selectMenu.file}
                studentOnAssignmentId={studentOnAssignment.id}
                toast={toast}
              />
            )}
            {selectMenu.title === "Upload" && (
              <AssignmentUploadFile
                toast={toast}
                studentOnAssignmentId={studentOnAssignment.id}
              />
            )}
            {selectMenu.title === "Link" && (
              <AssignmentLink studentOnAssignmentId={studentOnAssignment.id} />
            )}
          </div>
          <footer
            className="w-screen h-screen bg-black/50 fixed
          -z-10 top-0 right-0 bottom-0 left-0 m-auto"
          ></footer>
        </div>
      )}

      <Layout
        listData={
          <>
            <SummitWork />
            <StudentWorkInfo />
          </>
        }
      >
        <main className="w-7/12 bg-white p-3 rounded-md h-max flex flex-col">
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
