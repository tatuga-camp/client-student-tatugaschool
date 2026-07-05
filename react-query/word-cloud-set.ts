import { useQuery } from "@tanstack/react-query";
import {
  GetWordCloudResultsByTokenService,
  GetWordCloudSetPublicService,
} from "../services";

export function useGetWordCloudSetPublic({
  setId,
  refetchInterval = 4000,
}: {
  setId: string;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: ["word-cloud-set-public", { setId }],
    queryFn: () => GetWordCloudSetPublicService({ setId }),
    refetchInterval,
    enabled: !!setId,
  });
}

export function useGetWordCloudResults({ token }: { token: string }) {
  return useQuery({
    queryKey: ["word-cloud-results", { token }],
    queryFn: () => GetWordCloudResultsByTokenService({ token }),
    refetchInterval: 4000,
    enabled: !!token,
    // The service throws the Nest error body ({ statusCode, message }).
    // 404 means the link was revoked or never existed — do not retry.
    retry: (failureCount, error: any) =>
      error?.statusCode !== 404 && failureCount < 3,
  });
}
