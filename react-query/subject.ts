import { useQuery } from "@tanstack/react-query";
import {
  GetSubjectByCodeService,
  GetSubjectByIdService,
  GetSubjectFromStudentService,
  RequestGetSubjectByIdService,
  RequestGetSubjectFromStudentService,
  ResponseGetSubjectByCodeService,
} from "../services";

export function useGetSubjectByCode(
  code: string,
  option?: {
    initialData?: ResponseGetSubjectByCodeService | undefined;
    enable?: boolean | undefined;
  },
) {
  return useQuery({
    queryKey: ["subject", code],
    queryFn: () => GetSubjectByCodeService({ code }),
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
  request: RequestGetSubjectFromStudentService,
) {
  return useQuery({
    queryKey: ["subjects", request],
    queryFn: () => GetSubjectFromStudentService(request),
    // The Subjects tab mounts before the student and the year are known.
    enabled: !!request.studentId && !!request.educationYear,
  });
}
