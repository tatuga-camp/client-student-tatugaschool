import axios from "axios";
import { StudentOnSubject, Subject, TeacherOnSubject } from "../interfaces";
import createAxiosInstance from "./apiService";
import { lookupErrorFromAxios } from "../utils/joinLookupError";
import { reportRateLimit, waitForRateLimit } from "../utils/rateLimit";

const axiosInstance = createAxiosInstance();

type RequestGetSubjectByCodeService = {
  code: string;
};

export type ResponseGetSubjectByCodeService = Subject & {
  studentOnSubjects: StudentOnSubject[];
  teacherOnSubjects: TeacherOnSubject[];
};

export async function GetSubjectByCodeService(
  input: RequestGetSubjectByCodeService,
): Promise<ResponseGetSubjectByCodeService> {
  try {
    // Same hold as the shared axios instance: while a 429 wait is on, don't
    // send a request the server would only reject again.
    await waitForRateLimit();
    // No Content-Type: a GET has no body, and the header would turn this
    // into a preflighted request with one more thing that can be blocked.
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/subjects/code/${input.code}`,
    });

    return response.data;
  } catch (error: any) {
    // Keep status, message and code; say when there was no answer at all
    // (see utils/joinLookupError) so the welcome page can show what happened.
    console.error(
      "Get Subject request failed:",
      error?.response?.data ?? error?.message,
    );
    // The shared instance's 429 handling, by hand: this public lookup can't
    // use that instance (its request interceptor sends a student with no
    // token back to /welcome, which is where this is called from).
    if (error?.response?.status === 429) reportRateLimit(error.response.data);
    throw lookupErrorFromAxios(error);
  }
}

export type RequestGetSubjectFromStudentService = {
  studentId: string;
  /** Omitted: the student's active subjects from every term. */
  educationYear?: string;
};

type ResponseGetSubjectFromStudentService = (Subject & {
  status: "complete" | "uncomplete";
})[];

export async function GetSubjectFromStudentService(
  input: RequestGetSubjectFromStudentService,
): Promise<ResponseGetSubjectFromStudentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/subjects/student/${input.studentId}`,
      params: input.educationYear
        ? { educationYear: input.educationYear }
        : undefined,
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

type ResponseGetSubjectByIdService = ResponseGetSubjectByCodeService;

export async function GetSubjectByIdService(
  input: RequestGetSubjectByIdService,
): Promise<ResponseGetSubjectByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/subjects/student/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Subject request failed:", error.response.data);
    throw error?.response?.data;
  }
}
