import { useQuery } from "@tanstack/react-query";
import { GetAttendanceTablesService } from "../services";

export function useGetAttendanceTables(request: {
  subjectId: string;
  studentId: string;
}) {
  return useQuery({
    queryKey: ["attendance-tables", { subjectId: request.subjectId }],
    queryFn: () => GetAttendanceTablesService(request),
  });
}
