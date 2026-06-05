import { useQuery } from "@tanstack/react-query";
import { GetStudentRubricBreakdownService } from "../services/assignment";

export function useGetStudentRubricBreakdown({
  studentOnAssignmentId,
}: {
  studentOnAssignmentId: string;
}) {
  return useQuery({
    queryKey: ["rubric-breakdown", { studentOnAssignmentId }],
    queryFn: () => GetStudentRubricBreakdownService({ studentOnAssignmentId }),
    enabled: !!studentOnAssignmentId,
  });
}
