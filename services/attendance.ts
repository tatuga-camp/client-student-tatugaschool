import axios from "axios";
import {
  Attendance,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  StudentOnSubject,
  Subject,
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

export type RequestUpdateAttendanceService = {
  query: {
    attendanceId: string;
  };
  body: {
    status?: string;
    note?: string;
  };
};

export type ResponseUpdateAttendanceService = Attendance;

export async function UpdateAttendanceService(
  input: RequestUpdateAttendanceService
): Promise<ResponseUpdateAttendanceService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/attendances/by-qr-code`,
      data: input,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Get Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetAttendanceByQRCodeService = {
  attendanceRowId: string;
};

export type ResponseGetAttendanceByQRCodeService = {
  students: (StudentOnSubject & { attendance: Attendance })[];
  attendanceRow: AttendanceRow;
  subject: Subject;
  status: AttendanceStatusList[];
};

export async function GetAttendanceByQRCodeService(
  input: RequestGetAttendanceByQRCodeService
): Promise<ResponseGetAttendanceByQRCodeService> {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/attendance-rows/${input.attendanceRowId}/by-qr-code`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Get Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}
