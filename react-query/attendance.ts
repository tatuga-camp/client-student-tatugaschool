import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetAttendanceByQRCodeService,
  GetAttendanceTablesService,
  RequestUpdateAttendanceService,
  UpdateAttendanceService,
} from "../services";

export function useGetAttendanceTables(request: {
  subjectId: string;
  studentId: string;
}) {
  return useQuery({
    queryKey: ["attendance-tables", { subjectId: request.subjectId }],
    queryFn: () => GetAttendanceTablesService(request),
  });
}

export function useUpdateAttendance() {
  return useMutation({
    mutationKey: ["update-attendance"],
    mutationFn: (request: RequestUpdateAttendanceService) =>
      UpdateAttendanceService(request),
  });
}

export function useGetAttendanceQRCode({
  attendanceRowId,
}: {
  attendanceRowId: string;
}) {
  return useQuery({
    queryKey: ["attendance-qrcode", { attendanceRowId }],
    queryFn: () => GetAttendanceByQRCodeService({ attendanceRowId }),
  });
}
