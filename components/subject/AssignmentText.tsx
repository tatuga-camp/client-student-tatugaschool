import React from "react";
import TextEditor from "../common/TextEditor";
import {
  Assignment,
  ErrorMessages,
  FileOnStudentOnAssignment,
} from "../../interfaces";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import {
  useCreateFileStudentAssignment,
  useGetLanguage,
  useUpdateFileStudentAssignment,
} from "../../react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import { MdCopyAll } from "react-icons/md";

type Props = {
  toast: React.RefObject<Toast>;
  studentOnAssignmentId: string;
  text?: FileOnStudentOnAssignment | undefined;
  onClose: () => void;
  schoolId: string;
  assignment: Assignment;
};
function AssignmentText({
  studentOnAssignmentId,
  text,
  toast,
  schoolId,
  assignment,
  onClose,
}: Props) {
  const [value, setValue] = React.useState(text ? text.body : "");
  const [title, setTitle] = React.useState<string | null>(
    text ? text.name : "",
  );
  const lanague = useGetLanguage();
  const update = useUpdateFileStudentAssignment();
  const create = useCreateFileStudentAssignment();
  const handleSave = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (text) {
        await update.mutateAsync({
          query: {
            id: text.id,
          },
          body: {
            body: value,
            name: title ?? "",
          },
        });
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Document updated successfully",
          life: 3000,
        });
        onClose();
      } else {
        await create.mutateAsync({
          studentOnAssignmentId: studentOnAssignmentId,
          body: value,
          name: title,
          contentType: "TEXT",
          size: 0,
          type: "tiny-editor",
        });
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Document created successfully",
          life: 3000,
        });
        onClose();
      }
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

  const handleCopyAssignmentToText = () => {
    setValue(assignment.description);
  };
  return (
    <form
      onSubmit={handleSave}
      className="flex h-dvh w-full flex-col gap-2 rounded-md bg-white p-2 md:h-5/6 md:w-8/12"
    >
      <div className="mt-2 flex w-full justify-between gap-2">
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title ?? ""}
          type="text"
          placeholder="Add Your Title"
          required
          className="main-input h-10 grow"
        />
        <button
          type="button"
          onClick={() => {
            if (value) {
              if (
                confirm(
                  "It will overwrite current data, Do you want to continue?",
                )
              ) {
                handleCopyAssignmentToText();
              }
            } else {
              handleCopyAssignmentToText();
            }
          }}
          className="main-button flex w-40 items-center justify-center"
        >
          <>
            <MdCopyAll /> Copy
          </>
        </button>
      </div>

      <div className="grow">
        <TextEditor
          value={value}
          onChange={(content) => setValue(content)}
          schoolId={schoolId}
        />
      </div>
      <footer className="flex items-center justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                lanague.data === "en"
                  ? "Do you want to close?"
                  : "ต้องการยกเลิกใช่หรือไม่",
              )
            ) {
              onClose();
            }
          }}
          className="second-button flex w-40 items-center justify-center border"
        >
          Close
        </button>
        <button
          disabled={update.isPending || create.isPending}
          className="main-button flex w-40 items-center justify-center"
        >
          {update.isPending || create.isPending ? (
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="h-5 w-5"
              strokeWidth="8"
            />
          ) : (
            "Save"
          )}
        </button>
      </footer>
    </form>
  );
}

export default AssignmentText;
