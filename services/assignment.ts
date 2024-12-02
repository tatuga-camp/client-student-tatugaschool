import {
  Assignment,
  FileOnAssignment,
  FileOnStudentOnAssignment,
  StudentAssignmentStatus,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestGetAssignmentsService = {
  subjectId: string;
};

type ResponseGetAssignmentsService = (Assignment & {
  files: FileOnAssignment[];
})[];
export async function GetAssignmentsService(
  input: RequestGetAssignmentsService
): Promise<ResponseGetAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/assignments/student/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateWorkService = {
  query: {
    studentOnAssignmentId: string;
  };
  body: {
    body?: string;
    status?: StudentAssignmentStatus;
  };
};

type ResponseUpdateWorkService = (Assignment & {
  files: FileOnAssignment[];
})[];
export async function UpdateWorkService(
  input: RequestUpdateWorkService
): Promise<ResponseUpdateWorkService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `v1/student-on-assignments/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetFileOnStudentAssignmentService = {
  studentOnAssignmentId: string;
};

type ResponseGetFileOnStudentAssignmentService = FileOnStudentOnAssignment[];
export async function GetFileOnStudentAssignmentService(
  input: RequestGetFileOnStudentAssignmentService
): Promise<ResponseGetFileOnStudentAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/file-on-student-assignments/student-on-assignment/${input.studentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "GetFileOnStudentAssignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestCreateFileOnStudentAssignmentService = {
  type: string;
  url: string;
  blurHash?: string;
  size: number;
  studentOnAssignmentId: string;
};

type ResponseCreateFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function CreateFileOnStudentAssignmentService(
  input: RequestCreateFileOnStudentAssignmentService
): Promise<ResponseCreateFileOnStudentAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `v1/file-on-student-assignments/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "CreateFileOnStudentAssignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestDeleteFileOnStudentAssignmentService = {
  fileOnStudentAssignmentId: string;
};

type ResponseDeleteFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function DeleteFileOnStudentAssignmentService(
  input: RequestDeleteFileOnStudentAssignmentService
): Promise<ResponseDeleteFileOnStudentAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `v1/file-on-student-assignments/${input.fileOnStudentAssignmentId}/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "DeleteFileOnStudentAssignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
