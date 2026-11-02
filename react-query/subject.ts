import { useQuery } from "@tanstack/react-query";
import {
  GetSubjectByCodeService,
  GetSubjectByIdService,
  GetSubjectFromStudentService,
  RequestGetSubjectByIdService,
  RequestGetSubjectFromStudentService,
  ResponseGetSubjectByCodeService,
} from "../services";

export const subjectByCodeQuery = (code: string) => ({
  queryKey: ["subject", code] as const,
  queryFn: () => GetSubjectByCodeService({ code }),
});

export function useGetSubjectByCode(
  code: string,
  option?: {
    initialData?: ResponseGetSubjectByCodeService | undefined;
    enable?: boolean | undefined;
  },
) {
  return useQuery({
    ...subjectByCodeQuery(code),
    initialData: option?.initialData,
    enabled: option?.enable,
  });
}

export function useGetSubjectById({ id }: { id: string }) {
  return useQuery({
    queryKey: ["subject", { id: id }],
    queryFn: () =>
      GetSubjectByIdService({
        subjectId: id,
      }),
    enabled: !!id,
  });
}

export function useGetSubjectByStudent(
  request: RequestGetSubjectFromStudentService & {
    /** Every term at once (no year sent): the archived-subject screen. */
    allYears?: boolean;
  },
) {
  const { allYears = false, ...input } = request;
  return useQuery({
    queryKey: ["subjects", allYears ? { studentId: input.studentId } : input],
    queryFn: () =>
      GetSubjectFromStudentService(
        allYears ? { studentId: input.studentId } : input,
      ),
    // The Subjects tab mounts before the student and the year are known.
    enabled: !!input.studentId && (allYears || !!input.educationYear),
  });
}
