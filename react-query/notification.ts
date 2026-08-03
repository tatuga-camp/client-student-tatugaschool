import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetStudentNotificationsService,
  MarkAllAsReadStudentNotificationsService,
  MarkAsReadStudentNotificationService,
  RequestMarkAsReadStudentNotificationService,
} from "../services";

export function useGetStudentNotifications() {
  return useQuery({
    queryKey: ["student-notifications"],
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
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });
}

export function useMarkAsReadStudentNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark-as-read-student-notification"],
    mutationFn: (input: RequestMarkAsReadStudentNotificationService) =>
      MarkAsReadStudentNotificationService(input),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });
}
