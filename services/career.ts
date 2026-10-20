import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export const NOT_ENOUGH_CAREER_DATA = "Data is not enough to give a suggestion";

export type MyCareerSuggestion = {
  student: {
    skills: { id: string; title: string; avg: number }[];
  };
  careers: {
    id: string;
    title: string;
    careerMatchPoint: number;
    skills: { id: string; title: string; emphasis: number }[];
  }[];
};

export async function GetMyCareerSuggestionService(): Promise<MyCareerSuggestion> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `v1/careers/student/suggest`,
    });
    return response.data;
  } catch (error: any) {
    console.error("GetMyCareerSuggestion request failed:", error.response.data);
    throw error?.response?.data;
  }
}
