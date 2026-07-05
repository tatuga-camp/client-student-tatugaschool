import axios from "axios";
import { WordCloudSetPublic, WordCloudSetResults } from "../interfaces";

export async function GetWordCloudSetPublicService(input: {
  setId: string;
}): Promise<WordCloudSetPublic> {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/word-cloud-sets/${input.setId}/public`,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word cloud set failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export async function GetWordCloudResultsByTokenService(input: {
  token: string;
}): Promise<WordCloudSetResults> {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/word-cloud-sets/results/${input.token}`,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get word cloud results failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
