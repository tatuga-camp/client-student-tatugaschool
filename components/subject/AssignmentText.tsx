import React from "react";
import TextEditor from "../common/TextEditor";
import { ErrorMessages, FileOnStudentOnAssignment } from "../../interfaces";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import {
  useCreateFileStudentAssignment,
  useUpdateFileStudentAssignment,
} from "../../react-query";
import { ProgressSpinner } from "primereact/progressspinner";

type Props = {
  toast: React.RefObject<Toast>;
  studentOnAssignmentId: string;
  text?: FileOnStudentOnAssignment | undefined;
  onClose: () => void;
};
function AssignmentText({
  studentOnAssignmentId,
  text,
  toast,
  onClose,
}: Props) {
  const [value, setValue] = React.useState(text ? text.body : "");
  const update = useUpdateFileStudentAssignment();
  const create = useCreateFileStudentAssignment();
  const handleSave = async () => {
    try {
      if (text) {
        await update.mutateAsync({
          query: {
            id: text.id,
          },
          body: {
            body: value,
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
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="w-full flex justify-between mt-2">
        <h3>{text ? "Edit" : "Add"} Document</h3>
        <button
          disabled={update.isPending || create.isPending}
          onClick={handleSave}
          className="main-button w-60 flex items-center justify-center"
        >
          {update.isPending || create.isPending ? (
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="w-5 h-5"
              strokeWidth="8"
            />
          ) : (
            "Save"
          )}
        </button>
      </div>
      <div className="h-96">
        <TextEditor value={value} onChange={(content) => setValue(content)} />
      </div>
    </div>
  );
}

export default AssignmentText;
