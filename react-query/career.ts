import { useQuery } from "@tanstack/react-query";
import { ErrorMessages } from "../interfaces";
import { GetMyCareerSuggestionService, NOT_ENOUGH_CAREER_DATA } from "../services";

export function useGetMyCareerSuggestion() {
  return useQuery({
    queryKey: ["career-suggest", "me"],
    queryFn: () => GetMyCareerSuggestionService(),
    retry: (failureCount, error) =>
      (error as unknown as ErrorMessages)?.message !== NOT_ENOUGH_CAREER_DATA &&
      failureCount < 3,
  });
}
