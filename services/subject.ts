import axios from "axios";
import { StudentOnSubject, Subject, TeacherOnSubject } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestGetSubjectByCodeService = {
  code: string;
};

export type ResponseGetSubjectByCodeService = Subject & {
  studentOnSubjects: StudentOnSubject[];
  teacherOnSubjects: TeacherOnSubject[];
};

export async function GetSubjectByCodeService(
  input: RequestGetSubjectByCodeService
): Promise<ResponseGetSubjectByCodeService> {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/subjects/code/${input.code}`,
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

export type RequestGetSubjectByIdService = {
  subjectId: string;
};

type ResponseGetSubjectByIdService = Subject;

export async function GetSubjectByIdService(
  input: RequestGetSubjectByIdService
): Promise<ResponseGetSubjectByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/subjects/student/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}
