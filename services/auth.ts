import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestStudentRefetchTokenService = {
  refreshToken: string;
};

type ResponseStudentRefetchTokenService = {
  accessToken: string;
};

export async function StudentRefetchTokenService(
  input: RequestStudentRefetchTokenService
): Promise<ResponseStudentRefetchTokenService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/student/refresh-token",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Student Refetch Token request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestStudentSignInService = {
  studentId: string;
  password?: string;
};

type ResponseStudentSignInService = {
  accessToken: string;
  refreshToken: string;
};

export async function StudentSignInService(
  input: RequestStudentSignInService
): Promise<ResponseStudentSignInService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/student/sign-in",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    console.error("Student Sign-In request failed:", error.response.data);
    throw error?.response?.data;
  }
}
