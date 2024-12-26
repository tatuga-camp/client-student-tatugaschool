import React from "react";
import { ErrorMessages, FileOnStudentOnAssignment } from "../../interfaces";
import { FiFile } from "react-icons/fi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa";
import { MdDelete, MdNoteAlt } from "react-icons/md";
import { useDeleteFileStudentAssignment } from "../../react-query";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import { LuLink } from "react-icons/lu";

type Props = {
  file: FileOnStudentOnAssignment;
  onShowText?: (file: FileOnStudentOnAssignment) => void;
};
function FileStudentAssignmentCard({ file, onShowText }: Props) {
  if (file.contentType === "FILE") {
    return <FileCard file={file} />;
  }
  if (file.contentType === "TEXT") {
    return <TextCard file={file} onShowText={onShowText} />;
  }
}

function TextCard({ file, onShowText }: Props) {
  const deleteFile = useDeleteFileStudentAssignment();

  const handleDeleteFile = async () => {
    try {
      await deleteFile.mutateAsync({ fileOnStudentAssignmentId: file.id });
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
  return (
    <li className="w-full h-14 flex overflow-hidden rounded-md items-center justify-between  bg-white border">
      <div className="w-full h-full flex items-center justify-start gap-2">
        <button
          className="w-16 bg-gradient-to-r from-green-200 to-green-600 text-white text-lg flex items-center justify-center
               border-r h-full"
        >
          <MdNoteAlt />
        </button>
        <button
          onClick={() => onShowText?.(file)}
          className="flex max-w-40 truncate items-center gap-2"
        >
          <span>Document</span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleDeleteFile}
        disabled={deleteFile.isPending}
        className="text-xl mr-5 hover:bg-red-300/50 p-2 
        flex items-center justify-center
        rounded-full active:scale-105 text-red-500"
      >
        {deleteFile.isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="w-5 h-5"
            strokeWidth="8"
          />
        ) : (
          <MdDelete />
        )}
      </button>
    </li>
  );
}

function FileCard({ file }: Props) {
  const isImage = file.type.includes("image");

  const fileName =
    file.type === "link-url" ? file.body : file.body.split("/").pop();

  const deleteFile = useDeleteFileStudentAssignment();

  const handleDeleteFile = async () => {
    try {
      await deleteFile.mutateAsync({ fileOnStudentAssignmentId: file.id });
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
  return (
    <li className="w-full h-14 flex overflow-hidden rounded-md items-center justify-between  bg-white border">
      <div className="w-full h-full flex items-center justify-start gap-2">
        <button
          onClick={() => window.open(file.body, "_blank")}
          className="w-16 gradient-bg text-white text-lg flex items-center justify-center
               border-r h-full"
        >
          {isImage ? (
            <FaRegFileImage />
          ) : file.type === "link-url" ? (
            <LuLink />
          ) : (
            <FaRegFile />
          )}
        </button>
        <button
          onClick={() => window.open(file.body, "_blank")}
          className="flex w-60  items-center gap-2"
        >
          <div className="max-w-52 overflow-x-auto text-sm">
            <span className="w-max text-nowrap">{fileName}</span>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={handleDeleteFile}
        disabled={deleteFile.isPending}
        className="text-xl mr-5 hover:bg-red-300/50 p-2 
        flex items-center justify-center
        rounded-full active:scale-105 text-red-500"
      >
        {deleteFile.isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="w-5 h-5"
            strokeWidth="8"
          />
        ) : (
          <MdDelete />
        )}
      </button>
    </li>
  );
}

export default FileStudentAssignmentCard;
