import {
  Student,
  StudentOnSubject,
  Subject,
  TeacherOnSubject,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type ResponseGetStudentService = Student;
export async function GetStudentService(): Promise<ResponseGetStudentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/students/student/get-as-user`,
    });
    return response.data;
  } catch (error: any) {
    // No response (offline, or the API client refused to send): keep the
    // error itself, so the screen can tell a lost session from a failed load.
    console.error("GetStudent request failed:", error?.response?.data ?? error);
    throw error?.response?.data ?? error;
  }
}

export type RequestUpdateStudentService = {
  query: {
    studentId: string;
  };
  body: {
    title?: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
    blurHash?: string;
    number?: string;
    password?: string;
  };
};

type ResponseUpdateStudentService = Student;
export async function UpdateStudentService(
  input: RequestUpdateStudentService
): Promise<ResponseUpdateStudentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `v1/students/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}
