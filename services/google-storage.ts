import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestGetSignedURL = {
  fileName: string;
  fileType: string;
  fileSize: number;
  schoolId: string;
};

type ResponseGetSignedURL = {
  signURL: string;
  originalURL: string;
  contentType: string;
  fileName: string;
};

export async function getSignedURLStudentService(
  input: RequestGetSignedURL
): Promise<ResponseGetSignedURL> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/google-storage/get-signURL/student",
      params: { ...input },
    });

    return response.data;
  } catch (error: any) {
    console.error("Get Signed URL request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUploadSignURLService = {
  contentType: string;
  file: File;
  signURL: string;
};
export async function UploadSignURLService(
  input: RequestUploadSignURLService
): Promise<{
  message: "success" | "error";
}> {
  try {
    await fetch(input.signURL, {
      method: "PUT",
      headers: {
        "Content-Type": `${input.contentType}`,
      },
      body: input.file,
    });
    return { message: "success" };
  } catch (error: any) {
    console.error("Upload file fail:", error.response.data);
    throw error?.response?.data;
  }
}
