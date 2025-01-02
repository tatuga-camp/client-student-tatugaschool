import {
  Assignment,
  CommentOnAssignment,
  FileOnAssignment,
  StudentOnAssignment,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();
export type RequestGetCommentByStudentOnAssignmentService = {
  studentOnAssignmentId: string;
};

export type ResponseGetCommentByStudentOnAssignmentService =
  CommentOnAssignment[];
export async function GetCommentByStudentOnAssignmentService(
  input: RequestGetCommentByStudentOnAssignmentService
): Promise<ResponseGetCommentByStudentOnAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/comment-assignments/studentOnAssignmentId/${input.studentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestCreateCommentService = {
  content: string;
  studentOnAssignmentId: string;
};

export type ResponseCreateCommentService = CommentOnAssignment;
export async function CreateCommentService(
  input: RequestCreateCommentService
): Promise<ResponseCreateCommentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/comment-assignments/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateCommentService = {
  query: {
    commentOnAssignmentId: string;
  };
  body: {
    content?: string;
  };
};

export type ResponseUpdateCommentService = CommentOnAssignment;
export async function UpdateCommentService(
  input: RequestUpdateCommentService
): Promise<ResponseUpdateCommentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/comment-assignments/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteCommentService = {
  commentOnAssignmentId: string;
};

export type ResponseDeleteCommentService = CommentOnAssignment;
export async function DeleteCommentService(
  input: RequestDeleteCommentService
): Promise<ResponseDeleteCommentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/comment-assignments/${input.commentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error("UpdateStudent request failed:", error.response.data);
    throw error?.response?.data;
  }
}
