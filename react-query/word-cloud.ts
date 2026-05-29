import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetWordCloudPublicService,
  SubmitWordCloudPublicService,
  SubmitWordCloudStudentService,
} from "../services";

export function useGetWordCloudPublic({ wordCloudId }: { wordCloudId: string }) {
  return useQuery({
    queryKey: ["word-cloud-public", { wordCloudId }],
    queryFn: () => GetWordCloudPublicService({ wordCloudId }),
    enabled: !!wordCloudId,
  });
}

export function useSubmitWordCloudPublic() {
  return useMutation({
    mutationKey: ["submit-word-cloud-public"],
    mutationFn: (request: {
      wordCloudId: string;
      text: string;
      browserToken: string;
    }) => SubmitWordCloudPublicService(request),
  });
}

export function useSubmitWordCloudStudent() {
  return useMutation({
    mutationKey: ["submit-word-cloud-student"],
    mutationFn: (request: {
      wordCloudId: string;
      text: string;
      browserToken: string;
    }) => SubmitWordCloudStudentService(request),
  });
}
