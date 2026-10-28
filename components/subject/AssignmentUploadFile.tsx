import React from "react";
import {
  UnreadableFileError,
  UploadNetworkError,
  generateBlurHash,
  overallUploadPercent,
  snapshotFileForUpload,
} from "../../utils";
import {
  getSignedURLStudentService,
  UploadSignURLWithProgressService,
} from "../../services";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import {
  useCreateFileStudentAssignment,
  useGetLanguage,
} from "../../react-query";
import { workError, workToast } from "../assignment/workFeedback";

export type UploadProgress = {
  percent: number;
  index: number;
  count: number;
};

/**
 * The student upload pipeline: snapshot the picked files, upload each through
 * a signed URL with overall progress, then record it on the assignment.
 * `upload` never rejects; failures show a TH/EN alert and `uploading` resets.
 */
export function useStudentFileUpload({
  studentOnAssignmentId,
  schoolId,
}: {
  studentOnAssignmentId: string;
  schoolId: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<UploadProgress | null>(null);
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const createFile = useCreateFileStudentAssignment();

  const upload = async (files: File[]): Promise<boolean> => {
    if (files.length === 0) return false;
    try {
      setUploading(true);
      // Copy the picked files into memory right away: on Android the File
      // handles from the picker can go stale before the upload starts,
      // which aborts the request as a network error.
      const uploads: { name: string; type: string; data: Blob }[] = [];
      for (const file of files) {
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

        await UploadSignURLWithProgressService({
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
      workToast(assignmentPageLanguage.fileUploaded(lang));
      return true;
    } catch (error) {
      workError(
        error instanceof UploadNetworkError
          ? new Error(classworkDataLanguage.uploadNetworkError(lang))
          : error instanceof UnreadableFileError
            ? new Error(classworkDataLanguage.uploadFileUnreadable(lang))
            : error,
        lang,
      );
      return false;
    } finally {
      setProgress(null);
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
