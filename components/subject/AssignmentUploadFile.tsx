import React from "react";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { generateBlurHash } from "../../utils";
import {
  getSignedURLStudentService,
  UploadSignURLService,
} from "../../services";
import { Toast } from "primereact/toast";
import { useCreateFileStudentAssignment } from "../../react-query";
import { ProgressBar } from "primereact/progressbar";
import { FcUpload } from "react-icons/fc";
import { IoMdClose } from "react-icons/io";

type Props = {
  studentOnAssignmentId: string;
  toast: React.RefObject<Toast>;
  schoolId: string;
  onClose: () => void;
};
function AssignmentUploadFile({
  studentOnAssignmentId,
  toast,
  schoolId,
  onClose,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const createFile = useCreateFileStudentAssignment();

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files) {
        return;
      }
      setLoading(true);
      const filesArray = Array.from(files);
      for (const file of filesArray) {
        let blurHash: string | undefined = undefined;
        const signURL = await getSignedURLStudentService({
          fileName: file.name,
          fileType: file.type,
          schoolId,
          fileSize: file.size,
        });

        const upload = await UploadSignURLService({
          contentType: file.type,
          file: file,
          signURL: signURL.signURL,
        });

        if (file.type.includes("image")) {
          blurHash = await generateBlurHash(file);
        }
        await createFile.mutateAsync({
          studentOnAssignmentId: studentOnAssignmentId,
          type: file.type,
          name: file.name,
          body: signURL.originalURL,
          size: file.size,
          blurHash: blurHash,
          contentType: "FILE",
        });
      }
      setLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "File uploaded successfully",
        life: 3000,
      });
      onClose();
    } catch (error) {
      setLoading(false);
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
    <form className="flex h-max w-96 flex-col gap-2 rounded-md bg-white p-5">
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </div>
      <h3 className="flex gap-2">
        Upload File <FcUpload />{" "}
      </h3>
      {loading && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}
      <label className="main-button cursor-pointer">
        <div className="flex w-full items-center justify-center">upload</div>
        <input
          disabled={loading}
          onChange={handleUploadFiles}
          type="file"
          className="hidden"
          multiple
        />
      </label>
    </form>
  );
}
export default AssignmentUploadFile;
