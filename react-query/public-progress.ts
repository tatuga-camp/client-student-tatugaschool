import { useQuery } from "@tanstack/react-query";
import { GetPublicProgressByTokenService } from "../services";
import { isUnavailableError } from "../utils";

export function useGetPublicProgress({ token }: { token: string }) {
  return useQuery({
    queryKey: ["public-progress", { token }],
    queryFn: () => GetPublicProgressByTokenService({ token }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    enabled: !!token,
    // 404 = revoked or never existed — do not retry.
    retry: (failureCount, error) =>
      !isUnavailableError(error) && failureCount < 3,
  });
}
