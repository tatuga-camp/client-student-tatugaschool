import React from "react";
import Swal from "sweetalert2";
import {
  UnreadableFileError,
  UploadNetworkError,
  errorSwalContent,
  generateBlurHash,
  overallUploadPercent,
  snapshotFileForUpload,
} from "../../utils";
import {
  getSignedURLStudentService,
  UploadSignURLWithProgressService,
} from "../../services";
import { Toast } from "primereact/toast";
import { classworkDataLanguage } from "../../data/languages";
import {
  useCreateFileStudentAssignment,
  useGetLanguage,
} from "../../react-query";
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
  const language = useGetLanguage();
  const [progress, setProgress] = React.useState<{
    percent: number;
    index: number;
    count: number;
  } | null>(null);
  const createFile = useCreateFileStudentAssignment();

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files) {
        return;
      }
      setLoading(true);
      const filesArray = Array.from(files);
      // Copy the picked files into memory right away: on Android the File
      // handles from the picker can go stale before the upload starts,
      // which aborts the request as a network error.
      const uploads: { name: string; type: string; data: Blob }[] = [];
      for (const file of filesArray) {
        uploads.push({
          name: file.name,
          type: file.type,
          data: await snapshotFileForUpload(file),
        });
      }
      const totalBytes = uploads.reduce((sum, u) => sum + u.data.size, 0);
      let uploadedBytes = 0;
      for (const [index, u] of uploads.entries()) {
        let blurHash: string | undefined = undefined;
        const signURL = await getSignedURLStudentService({
          fileName: u.name,
          fileType: u.type,
          schoolId,
          fileSize: u.data.size,
        });

        const upload = await UploadSignURLWithProgressService({
          contentType: u.type,
          file: u.data,
          signURL: signURL.signURL,
          onProgress:
            totalBytes > 0
              ? (_percent, event) => {
                  setProgress({
                    percent: overallUploadPercent({
                      uploadedBytes,
                      currentLoaded: event.loaded,
                      totalBytes,
                    }),
                    index: index + 1,
                    count: uploads.length,
                  });
                }
              : undefined,
        });
        uploadedBytes += u.data.size;

        if (u.type.includes("image")) {
          blurHash = await generateBlurHash(u.data);
        }
        await createFile.mutateAsync({
          studentOnAssignmentId: studentOnAssignmentId,
          type: u.type,
          name: u.name,
          body: signURL.originalURL,
          size: u.data.size,
          blurHash: blurHash,
          contentType: "FILE",
        });
      }
      setProgress(null);
      setLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "File uploaded successfully",
        life: 3000,
      });
      onClose();
    } catch (error) {
      setProgress(null);
      setLoading(false);
      const displayError =
        error instanceof UploadNetworkError
          ? new Error(
              classworkDataLanguage.uploadNetworkError(language.data ?? "en"),
            )
          : error instanceof UnreadableFileError
            ? new Error(
                classworkDataLanguage.uploadFileUnreadable(
                  language.data ?? "en",
                ),
              )
            : error;
      Swal.fire({
        ...errorSwalContent(displayError),
        icon: "error",
      });
    }
  };
  return (
    <form className="flex h-max w-96 flex-col gap-2 rounded-2xl bg-white p-5">
      <div className="flex w-full justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50 disabled:opacity-40"
        >
          <IoMdClose />
        </button>
      </div>
      <h3 className="flex gap-2">
        Upload File <FcUpload />{" "}
      </h3>
      {loading && progress && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">
            {classworkDataLanguage.uploading(language.data ?? "en")}{" "}
            {progress.index}/{progress.count} — {Math.round(progress.percent)}%
          </span>
          <ProgressBar
            value={Math.round(progress.percent)}
            showValue={false}
            style={{ height: "10px" }}
          />
        </div>
      )}
      {loading && !progress && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}
      <label className="main-button cursor-pointer">
        <div className="flex w-full items-center justify-center">upload</div>
        <input
          disabled={loading}
          onChange={handleUploadFiles}
          onClick={(e) => {
            e.currentTarget.value = "";
          }}
          type="file"
          className="hidden"
          multiple
        />
      </label>
    </form>
  );
}
export default AssignmentUploadFile;
