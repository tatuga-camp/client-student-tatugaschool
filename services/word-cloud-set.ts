import axios from "axios";
import { WordCloudSetPublic } from "../interfaces";

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
