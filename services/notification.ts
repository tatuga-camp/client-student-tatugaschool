import { StudentNotification } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type ResponseGetStudentNotificationsService = StudentNotification[];
export async function GetStudentNotificationsService(): Promise<ResponseGetStudentNotificationsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/notifications/student",
    });
    return response.data;
  } catch (error: any) {
    console.error("GetStudentNotifications request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type ResponseMarkAllAsReadStudentNotificationsService = {
  count: number;
};
export async function MarkAllAsReadStudentNotificationsService(): Promise<ResponseMarkAllAsReadStudentNotificationsService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "/v1/notifications/student/mark-as-read",
    });
    return response.data;
  } catch (error: any) {
    console.error("MarkAllAsRead request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestMarkAsReadStudentNotificationService = { id: string };
export type ResponseMarkAsReadStudentNotificationService = StudentNotification;
export async function MarkAsReadStudentNotificationService(
  input: RequestMarkAsReadStudentNotificationService
): Promise<ResponseMarkAsReadStudentNotificationService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/notifications/student/mark-as-read/${input.id}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("MarkAsRead request failed:", error.response.data);
    throw error?.response?.data;
  }
}
