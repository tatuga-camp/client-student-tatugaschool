import { useQuery } from "@tanstack/react-query";
import { GetStudentService } from "../services";

export function useGetStudent() {
  return useQuery({
    queryKey: ["student"],
    queryFn: () => GetStudentService(),
  });
}
