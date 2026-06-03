import React from "react";
import { ErrorMessages, FileOnStudentOnAssignment } from "../../interfaces";
import { FiFile } from "react-icons/fi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa";
import { MdDelete, MdEdit, MdNoteAlt } from "react-icons/md";
import {
  useDeleteFileStudentAssignment,
  useUpdateFileStudentAssignment,
} from "../../react-query";
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
    <li
      title={file.name ?? ""}
      className="flex h-14 w-full items-center justify-between overflow-hidden rounded-2xl border bg-white"
    >
      <div className="flex h-full w-10/12 items-center justify-start gap-2">
        <button
          onClick={() => onShowText?.(file)}
          className="flex h-full w-14 items-center justify-center border-r bg-gradient-to-r from-green-200 to-green-600 text-lg text-white"
        >
          <MdNoteAlt />
        </button>
        <button
          onClick={() => onShowText?.(file)}
          className="w-10/12 truncate text-start"
        >
          {file.name}
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

  const deleteFile = useDeleteFileStudentAssignment();
  const updateFile = useUpdateFileStudentAssignment();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingName, setEditingName] = React.useState(file.name ?? "");
  const cancelRenameRef = React.useRef(false);

  const displayName =
    file.name ??
    (file.type === "link-url" ? file.body : file.body.split("/").pop());

  const handleCommitRename = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    if (cancelRenameRef.current) {
      cancelRenameRef.current = false;
      return;
    }
    const nextName = editingName.trim();
    if (!nextName || nextName === displayName) return;
    try {
      await updateFile.mutateAsync({
        query: { id: file.id },
        body: { name: nextName },
      });
    } catch {
      setIsEditing(true);
    }
  };

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
    <li
      title={displayName}
      className="flex h-14 w-full items-center justify-between overflow-hidden rounded-2xl border bg-white"
    >
      <div className="flex h-full w-10/12 items-center justify-start gap-2">
        <button
          onClick={() => window.open(file.body, "_blank")}
          className="gradient-bg flex h-full w-14 items-center justify-center border-r text-lg text-white"
        >
          {isImage ? (
            <FaRegFileImage />
          ) : file.type === "link-url" ? (
            <LuLink />
          ) : (
            <FaRegFile />
          )}
        </button>
        {isEditing ? (
          <input
            autoFocus
            aria-label="File name"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={handleCommitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                cancelRenameRef.current = true;
                e.currentTarget.blur();
              }
            }}
            className="w-10/12 rounded border px-2 py-1 text-sm"
          />
        ) : (
          <button
            onClick={() => window.open(file.body, "_blank")}
            className="w-10/12 truncate"
          >
            {displayName}
          </button>
        )}
      </div>

      {!isEditing && (
        <button
          type="button"
          aria-label="Rename file"
          onClick={() => {
            cancelRenameRef.current = false;
            setEditingName(displayName ?? "");
            setIsEditing(true);
          }}
          className="flex items-center justify-center rounded-full p-2 text-xl text-gray-500 hover:bg-gray-200 active:scale-105"
        >
          <MdEdit />
        </button>
      )}

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
