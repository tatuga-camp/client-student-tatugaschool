import React from "react";
import { useCreateFileStudentAssignment } from "../../react-query";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";

type Props = {
  studentOnAssignmentId: string;
};
function AssignmentLink({ studentOnAssignmentId }: Props) {
  const createFile = useCreateFileStudentAssignment();
  const [link, setLink] = React.useState("");
  const handleSumit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await createFile.mutateAsync({
        studentOnAssignmentId: studentOnAssignmentId,
        type: "link-url",
        body: link,
        contentType: "FILE",
        size: 0,
      });
      setLink("");
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
    <form onSubmit={handleSumit} className="w-full h-full flex flex-col gap-2">
      <h3>Add Link</h3>
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="main-input w-full h-10"
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
            className="w-5 h-5"
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
