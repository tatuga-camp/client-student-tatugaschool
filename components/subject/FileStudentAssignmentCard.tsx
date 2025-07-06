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
    <li className="flex h-14 w-full items-center justify-between overflow-hidden rounded-md border bg-white">
      <div className="flex h-full w-full items-center justify-start gap-2">
        <button
          onClick={() => onShowText?.(file)}
          className="flex h-full w-16 items-center justify-center border-r bg-gradient-to-r from-green-200 to-green-600 text-lg text-white"
        >
          <MdNoteAlt />
        </button>
        <button
          onClick={() => onShowText?.(file)}
          className="flex max-w-40 items-center gap-2 truncate"
        >
          <span>{file.name}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleDeleteFile}
        disabled={deleteFile.isPending}
        className="flex items-center justify-center rounded-full p-2 text-xl text-red-500 hover:bg-red-300/50 active:scale-105"
      >
        {deleteFile.isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="h-5 w-5"
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
    <li className="flex h-14 w-full items-center justify-between overflow-hidden rounded-md border bg-white">
      <div className="flex h-full w-full items-center justify-start gap-2">
        <button
          onClick={() => window.open(file.body, "_blank")}
          className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white"
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
          className="flex w-60 items-center gap-2"
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
        className="flex items-center justify-center rounded-full p-2 text-xl text-red-500 hover:bg-red-300/50 active:scale-105"
      >
        {deleteFile.isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="h-5 w-5"
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
