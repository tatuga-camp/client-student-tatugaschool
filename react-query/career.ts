import { useQuery } from "@tanstack/react-query";
import { ErrorMessages } from "../interfaces";
import {
  GetMyCareerSuggestionService,
  NOT_ENOUGH_CAREER_DATA,
} from "../services";

/**
 * The student's career report. With `enabled: false` it only reads what is
 * already cached and never sends the request: the report loads when the
 * student opens it.
 */
export function useGetMyCareerSuggestion({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["career-suggest", "me"],
    queryFn: () => GetMyCareerSuggestionService(),
    enabled,
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
