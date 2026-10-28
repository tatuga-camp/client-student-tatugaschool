import { useQuery } from "@tanstack/react-query";
import { ErrorMessages } from "../interfaces";
import {
  GetMyCareerSuggestionService,
  NOT_ENOUGH_CAREER_DATA,
} from "../services";

export function useGetMyCareerSuggestion() {
  return useQuery({
    queryKey: ["career-suggest", "me"],
    queryFn: () => GetMyCareerSuggestionService(),
    staleTime: 1000 * 60 * 5,
    // Reuse a cached "not enough data" (or other) error instead of
    // refetching when another view mounts; Try again calls refetch.
    retryOnMount: false,
    refetchOnMount: (query) => query.state.status !== "error",
    retry: (failureCount, error) =>
      (error as unknown as ErrorMessages)?.message !== NOT_ENOUGH_CAREER_DATA &&
      failureCount < 3,
  });
}
