import axios from "axios";
import { WordCloudPublic } from "../interfaces";
import createAxiosInstance from "./apiService";

const authedInstance = createAxiosInstance();

export async function GetWordCloudPublicService(input: {
  wordCloudId: string;
}): Promise<WordCloudPublic> {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/word-clouds/${input.wordCloudId}/public`,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word cloud failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export async function SubmitWordCloudPublicService(input: {
  wordCloudId: string;
  text: string;
  browserToken: string;
}): Promise<{ id: string }> {
  try {
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/word-clouds/${input.wordCloudId}/answer/public`,
      data: { text: input.text, browserToken: input.browserToken },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Submit word failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

// STUDENTS_ONLY: uses the authenticated instance (attaches student bearer token)
export async function SubmitWordCloudStudentService(input: {
  wordCloudId: string;
  text: string;
  browserToken: string;
}): Promise<{ id: string }> {
  try {
    const response = await authedInstance({
      method: "POST",
      url: `/v1/word-clouds/${input.wordCloudId}/answer/student`,
      data: { text: input.text, browserToken: input.browserToken },
    });
    return response.data;
  } catch (error: any) {
    console.error("Submit word (student) failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
