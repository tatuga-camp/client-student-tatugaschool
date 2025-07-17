import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateFileOnStudentAssignmentService,
  DeleteFileOnStudentAssignmentService,
  GetAssignmentsService,
  GetFileOnStudentAssignmentService,
  GetOverviewAssignmentService,
  RequestCreateFileOnStudentAssignmentService,
  RequestGetAssignmentsService,
  RequestGetOverviewAssignmentService,
  RequestUpdateFileOnStudentAssignmentService,
  RequestUpdateWorkService,
  ResponseGetAssignmentsService,
  ResponseGetFileOnStudentAssignmentService,
  UpdateFileOnStudentAssignmentService,
  UpdateWorkService,
} from "../services/assignment";

export function useGetAssignments(input: RequestGetAssignmentsService) {
  return useQuery({
    queryKey: ["assignments", { subjectId: input.subjectId }],
    queryFn: () => GetAssignmentsService(input),
  });
}

export function useGetOverviewScore(
  input: RequestGetOverviewAssignmentService,
) {
  return useQuery({
    queryKey: ["overview-score", { subjectId: input.subjectId }],
    queryFn: () => GetOverviewAssignmentService(input),
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

export function useUpdateStudentOnAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-student-on-assignment"],
    mutationFn: (input: RequestUpdateWorkService) => UpdateWorkService(input),
    onSuccess(studentOnAssignment, variables, context) {
      queryClient.setQueryData(
        ["assignments", { subjectId: studentOnAssignment.subjectId }],
        (prevData: ResponseGetAssignmentsService) => {
          return prevData.map((assignment) => {
            if (assignment.id === studentOnAssignment.assignmentId) {
              return {
                ...assignment,
                studentOnAssignment: studentOnAssignment,
              };
            }
            return assignment;
          });
        },
      );
    },
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
        },
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
            (item) => item.id !== data.id,
          );
          return [...filterDuplicate, data];
        },
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
        },
      );
    },
  });
}
