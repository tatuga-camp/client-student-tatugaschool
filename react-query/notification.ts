import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentNotification } from "../interfaces";
import {
  GetStudentNotificationsService,
  MarkAllAsReadStudentNotificationsService,
  MarkAsReadStudentNotificationService,
  RequestMarkAsReadStudentNotificationService,
} from "../services";

const NOTIFICATIONS_KEY = ["student-notifications"];

export function useGetStudentNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => GetStudentNotificationsService(),
    refetchInterval: 1000 * 30,
  });
}

export function useMarkAllAsReadStudentNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark-all-as-read-student-notifications"],
    mutationFn: () => MarkAllAsReadStudentNotificationsService(),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAsReadStudentNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark-as-read-student-notification"],
    mutationFn: (input: RequestMarkAsReadStudentNotificationService) =>
      MarkAsReadStudentNotificationService(input),
    // Read at once in the cache: the badge drops even when no bell is
    // mounted to refetch (the app never refetches on mount), e.g. after a
    // tap that jumps to another subject. Rolled back if the server refuses.
    async onMutate(input) {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous =
        queryClient.getQueryData<StudentNotification[]>(NOTIFICATIONS_KEY);
      queryClient.setQueryData<StudentNotification[]>(NOTIFICATIONS_KEY, (old) =>
        old?.map((n) => (n.id === input.id ? { ...n, isRead: true } : n)),
      );
      return { previous };
    },
    onError(_error, _input, context) {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
      }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
