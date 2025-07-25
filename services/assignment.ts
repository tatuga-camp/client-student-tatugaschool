import {
  Assignment,
  FileOnAssignment,
  FileOnStudentOnAssignment,
  Grade,
  ScoreOnStudent,
  ScoreOnSubject,
  StudentAssignmentContentType,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type RequestGetAssignmentsService = {
  subjectId: string;
};

export type ResponseGetAssignmentsService = (Assignment & {
  files: FileOnAssignment[];
  studentOnAssignment: StudentOnAssignment;
})[];
export async function GetAssignmentsService(
  input: RequestGetAssignmentsService,
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

export type RequestUpdateWorkService = {
  query: {
    studentOnAssignmentId: string;
  };
  body: {
    body?: string;
    status?: StudentAssignmentStatus;
  };
};

export type RequestGetOverviewAssignmentService = {
  subjectId: string;
  studentId: string;
};
export type ResponseGetOverviewAssignmentService = {
  grade: Grade | null;
  assignments: {
    assignment: Assignment;
    studentOnAssignment: StudentOnAssignment;
  }[];
  scoreOnSubjects: {
    scoreOnSubject: ScoreOnSubject;
    students: ScoreOnStudent[];
  }[];
};

export async function GetOverviewAssignmentService(
  input: RequestGetOverviewAssignmentService,
): Promise<ResponseGetOverviewAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/assignments/subject/${input.subjectId}/student/${input.studentId}/overview`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignments request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type ResponseUpdateWorkService = StudentOnAssignment;
export async function UpdateWorkService(
  input: RequestUpdateWorkService,
): Promise<ResponseUpdateWorkService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `v1/student-on-assignments/student`,
      data: { ...input },
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

export type ResponseGetFileOnStudentAssignmentService =
  FileOnStudentOnAssignment[];
export async function GetFileOnStudentAssignmentService(
  input: RequestGetFileOnStudentAssignmentService,
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
      error.response.data,
    );
    throw error?.response?.data;
  }
}

export type RequestCreateFileOnStudentAssignmentService = {
  type: string;
  name: string | null;
  body: string;
  blurHash?: string;
  size: number;
  studentOnAssignmentId: string;
  contentType: StudentAssignmentContentType;
};

type ResponseCreateFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function CreateFileOnStudentAssignmentService(
  input: RequestCreateFileOnStudentAssignmentService,
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
      error.response.data,
    );
    throw error?.response?.data;
  }
}

export type RequestUpdateFileOnStudentAssignmentService = {
  query: {
    id: string;
  };
  body: {
    body: string;
    name?: string;
  };
};

type ResponseUpdateFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function UpdateFileOnStudentAssignmentService(
  input: RequestUpdateFileOnStudentAssignmentService,
): Promise<ResponseUpdateFileOnStudentAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `v1/file-on-student-assignments/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "CreateFileOnStudentAssignment request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestDeleteFileOnStudentAssignmentService = {
  fileOnStudentAssignmentId: string;
};

type ResponseDeleteFileOnStudentAssignmentService = FileOnStudentOnAssignment;
export async function DeleteFileOnStudentAssignmentService(
  input: RequestDeleteFileOnStudentAssignmentService,
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
      error.response.data,
    );
    throw error?.response?.data;
  }
}
