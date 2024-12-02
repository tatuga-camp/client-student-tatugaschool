import { StudentOnSubject, Subject, TeacherOnSubject } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestGetSubjectByCodeService = {
  code: string;
};

type ResponseGetSubjectByCodeService = Subject & {
  studentOnSubjects: StudentOnSubject[];
  teacherOnSubjects: TeacherOnSubject[];
};

export async function GetSubjectByCodeService(
  input: RequestGetSubjectByCodeService
): Promise<ResponseGetSubjectByCodeService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/subjects/code/${input.code}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetSubjectFromStudentService = {
  studentId: string;
  eduYear: string;
};

type ResponseGetSubjectFromStudentService = Subject[];

export async function GetSubjectFromStudentService(
  input: RequestGetSubjectFromStudentService
): Promise<ResponseGetSubjectFromStudentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/subjects/student/${input.studentId}`,
      params: { eduYear: input.eduYear },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}
