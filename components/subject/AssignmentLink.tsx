import React from "react";
import { useCreateFileStudentAssignment } from "../../react-query";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { IoMdClose } from "react-icons/io";

type Props = {
  studentOnAssignmentId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};
function AssignmentLink({ studentOnAssignmentId, toast, onClose }: Props) {
  const createFile = useCreateFileStudentAssignment();
  const [link, setLink] = React.useState("");
  const handleSumit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await createFile.mutateAsync({
        studentOnAssignmentId: studentOnAssignmentId,
        type: "link-url",
        name: link,
        body: link,
        contentType: "FILE",
        size: 0,
      });
      setLink("");
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Link added successfully",
        life: 3000,
      });
      onClose();
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
    <form
      onSubmit={handleSumit}
      className="flex h-max w-96 flex-col gap-2 rounded-2xl bg-white p-5"
    >
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </div>
      <h3>Add Link</h3>
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="main-input h-10 w-full"
        type="url"
      />
      <button
        disabled={createFile.isPending}
        className="main-button flex items-center justify-center"
      >
        {createFile.isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="h-5 w-5"
            strokeWidth="8"
          />
        ) : (
          "Add"
        )}
      </button>
    </form>
  );
}

export default AssignmentLink;
