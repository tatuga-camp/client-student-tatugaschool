import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAnnouncementCommentService,
  DeleteAnnouncementCommentService,
  GetAnnouncementCommentsService,
  GetAnnouncementsBySubjectService,
  RequestCreateAnnouncementCommentService,
  RequestDeleteAnnouncementCommentService,
  RequestToggleAnnouncementReactionService,
  ResponseGetAnnouncementCommentsService,
  ToggleAnnouncementReactionService,
} from "../services";

export function useGetAnnouncements(input: { subjectId: string }) {
  return useQuery({
    queryKey: ["announcements", { subjectId: input.subjectId }],
    queryFn: () =>
      GetAnnouncementsBySubjectService({ subjectId: input.subjectId }),
  });
}

export function useGetAnnouncementComments(input: { announcementId: string }) {
  return useQuery({
    queryKey: [
      "announcement-comments",
      { announcementId: input.announcementId },
    ],
    queryFn: () =>
      GetAnnouncementCommentsService({
        announcementId: input.announcementId,
      }),
  });
}

export function useCreateAnnouncementComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-announcement-comment"],
    mutationFn: (input: RequestCreateAnnouncementCommentService) =>
      CreateAnnouncementCommentService(input),
    onSuccess(data) {
      queryClient.setQueryData(
        ["announcement-comments", { announcementId: data.announcementId }],
        (oldData: ResponseGetAnnouncementCommentsService | undefined) => {
          return [...(oldData ?? []), data];
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["announcements", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useDeleteAnnouncementComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-announcement-comment"],
    mutationFn: (input: RequestDeleteAnnouncementCommentService) =>
      DeleteAnnouncementCommentService(input),
    onSuccess(data) {
      queryClient.setQueryData(
        ["announcement-comments", { announcementId: data.announcementId }],
        (oldData: ResponseGetAnnouncementCommentsService | undefined) => {
          return (oldData ?? []).filter((comment) => comment.id !== data.id);
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["announcements", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useToggleAnnouncementReaction(input: { subjectId: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["toggle-announcement-reaction"],
    mutationFn: (request: RequestToggleAnnouncementReactionService) =>
      ToggleAnnouncementReactionService(request),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["announcements", { subjectId: input.subjectId }],
      });
    },
  });
}
