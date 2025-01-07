import {
  Attendance,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type RequestGetAttendanceTablesService = {
  subjectId: string;
  studentId: string;
};

export type ResponseGetAttendanceTablesService = (AttendanceTable & {
  statusLists: AttendanceStatusList[];
  rows: AttendanceRow[];
  attendances: Attendance[];
})[];
export async function GetAttendanceTablesService(
  input: RequestGetAttendanceTablesService
): Promise<ResponseGetAttendanceTablesService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/attendance-tables/student/${input.studentId}/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get AttendanceTables request failed:", error.response.data);
    throw error?.response?.data;
  }
}
