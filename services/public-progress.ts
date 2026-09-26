import axios from "axios";
import { PublicProgress } from "../interfaces";

export async function GetPublicProgressByTokenService(input: {
  token: string;
  timeout?: number;
}): Promise<PublicProgress> {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/subjects/public-progress/${input.token}`,
      headers: { "Content-Type": "application/json" },
      timeout: input.timeout,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get public progress failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
