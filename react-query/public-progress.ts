import { useQuery } from "@tanstack/react-query";
import { GetPublicProgressByTokenService } from "../services";
import { isUnavailableError } from "../utils";

export function useGetPublicProgress({ token }: { token: string }) {
  return useQuery({
    queryKey: ["public-progress", { token }],
    queryFn: () => GetPublicProgressByTokenService({ token }),
    refetchInterval: 60_000,
    // _app.tsx sets a 2-minute staleTime; focus refetch only fires on stale
    // data, so opt out here to pick up a revoked link as soon as the tab
    // regains focus.
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: !!token,
    // 404 = revoked or never existed — do not retry.
    retry: (failureCount, error) =>
      !isUnavailableError(error) && failureCount < 3,
  });
}
