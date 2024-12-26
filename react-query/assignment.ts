import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateFileOnStudentAssignmentService,
  DeleteFileOnStudentAssignmentService,
  GetAssignmentsService,
  GetFileOnStudentAssignmentService,
  RequestCreateFileOnStudentAssignmentService,
  RequestGetAssignmentsService,
  RequestUpdateFileOnStudentAssignmentService,
  ResponseGetAssignmentsService,
  ResponseGetFileOnStudentAssignmentService,
  UpdateFileOnStudentAssignmentService,
} from "../services/assignment";

export function useGetAssignments(input: RequestGetAssignmentsService) {
  return useQuery({
    queryKey: ["assignments", { subjectId: input.subjectId }],
    queryFn: () => GetAssignmentsService(input),
  });
}

export function useGetFileStudentAssignment(input: {
  studentOnAssignmentId: string;
}) {
  return useQuery({
    queryKey: [
      "file-student-assignments",
      { studentOnAssignmentId: input.studentOnAssignmentId },
    ],
    queryFn: () => GetFileOnStudentAssignmentService(input),
  });
}

export function useCreateFileStudentAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-file-on-student-assignments"],
    mutationFn: (input: RequestCreateFileOnStudentAssignmentService) =>
      CreateFileOnStudentAssignmentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "file-student-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (prevData: ResponseGetFileOnStudentAssignmentService) => {
          return [...prevData, data];
        }
      );
    },
  });
}

export function useUpdateFileStudentAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-file-on-student-assignments"],
    mutationFn: (input: RequestUpdateFileOnStudentAssignmentService) =>
      UpdateFileOnStudentAssignmentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "file-student-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (prevData: ResponseGetFileOnStudentAssignmentService) => {
          const filterDuplicate = prevData.filter(
            (item) => item.id !== data.id
          );
          return [...filterDuplicate, data];
        }
      );
    },
  });
}

export function useDeleteFileStudentAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-file-on-student-assignments"],
    mutationFn: (input: { fileOnStudentAssignmentId: string }) =>
      DeleteFileOnStudentAssignmentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "file-student-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (prevData: ResponseGetFileOnStudentAssignmentService) => {
          return prevData.filter((item) => item.id !== data.id);
        }
      );
    },
  });
}
