import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetStudentService,
  RequestUpdateStudentService,
  UpdateStudentService,
} from "../services";

export function useGetStudent() {
  return useQuery({
    queryKey: ["student"],
    queryFn: () => GetStudentService(),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["student-update"],
    mutationFn: (data: RequestUpdateStudentService) =>
      UpdateStudentService(data),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(["student"], data);
    },
  });
}
