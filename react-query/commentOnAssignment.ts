import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateCommentService,
  DeleteCommentService,
  GetCommentByStudentOnAssignmentService,
  RequestCreateCommentService,
  RequestDeleteCommentService,
  RequestUpdateCommentService,
  ResponseGetCommentByStudentOnAssignmentService,
  UpdateCommentService,
} from "../services";

export function useGetComments(input: {
  studentOnAssignmentId: string;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: [
      "comment-assignments",
      { studentOnAssignmentId: input.studentOnAssignmentId },
    ],
    queryFn: () =>
      GetCommentByStudentOnAssignmentService({
        studentOnAssignmentId: input.studentOnAssignmentId,
      }),
    refetchInterval: input.refetchInterval,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-comment"],
    mutationFn: (input: RequestCreateCommentService) =>
      CreateCommentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "comment-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (oldData: ResponseGetCommentByStudentOnAssignmentService) => {
          return [...oldData, data];
        }
      );
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-comment"],
    mutationFn: (input: RequestUpdateCommentService) =>
      UpdateCommentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "comment-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (oldData: ResponseGetCommentByStudentOnAssignmentService) => {
          return oldData.map((comment) =>
            comment.id === data.id ? data : comment
          );
        }
      );
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-comment"],
    mutationFn: (input: RequestDeleteCommentService) =>
      DeleteCommentService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        [
          "comment-assignments",
          { studentOnAssignmentId: data.studentOnAssignmentId },
        ],
        (oldData: ResponseGetCommentByStudentOnAssignmentService) => {
          return oldData.filter((comment) => comment.id !== data.id);
        }
      );
    },
  });
}
