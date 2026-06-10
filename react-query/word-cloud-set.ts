import { useQuery } from "@tanstack/react-query";
import { GetWordCloudSetPublicService } from "../services";

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
