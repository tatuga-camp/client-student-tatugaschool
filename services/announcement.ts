import {
  Announcement,
  CommentOnAnnouncement,
  ReactionOnAnnouncement,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type RequestGetAnnouncementsBySubjectService = {
  subjectId: string;
};

export type ResponseGetAnnouncementsBySubjectService = Announcement[];
export async function GetAnnouncementsBySubjectService(
  input: RequestGetAnnouncementsBySubjectService
): Promise<ResponseGetAnnouncementsBySubjectService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/announcements/subject/${input.subjectId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error("GetAnnouncements request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestGetAnnouncementCommentsService = {
  announcementId: string;
};

export type ResponseGetAnnouncementCommentsService = CommentOnAnnouncement[];
export async function GetAnnouncementCommentsService(
  input: RequestGetAnnouncementCommentsService
): Promise<ResponseGetAnnouncementCommentsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/comment-on-announcements/announcement/${input.announcementId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "GetAnnouncementComments request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export type RequestCreateAnnouncementCommentService = {
  announcementId: string;
  content: string;
};

export type ResponseCreateAnnouncementCommentService = CommentOnAnnouncement;
export async function CreateAnnouncementCommentService(
  input: RequestCreateAnnouncementCommentService
): Promise<ResponseCreateAnnouncementCommentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/comment-on-announcements/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "CreateAnnouncementComment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export type RequestDeleteAnnouncementCommentService = {
  commentOnAnnouncementId: string;
};

export type ResponseDeleteAnnouncementCommentService = CommentOnAnnouncement;
export async function DeleteAnnouncementCommentService(
  input: RequestDeleteAnnouncementCommentService
): Promise<ResponseDeleteAnnouncementCommentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/comment-on-announcements/${input.commentOnAnnouncementId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "DeleteAnnouncementComment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export type RequestToggleAnnouncementReactionService = {
  announcementId: string;
  emoji: string;
};

export type ResponseToggleAnnouncementReactionService = {
  action: "added" | "removed" | "switched";
  reaction: ReactionOnAnnouncement | null;
};
export async function ToggleAnnouncementReactionService(
  input: RequestToggleAnnouncementReactionService
): Promise<ResponseToggleAnnouncementReactionService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/reaction-on-announcements/toggle/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "ToggleAnnouncementReaction request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
