import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentQuizView } from "../interfaces";
import { GetStudentQuizService, StartQuizService, SubmitQuizService } from "../services/quiz";

export const keyStudentQuiz = (soaId: string) => ["student-quiz", { soaId }] as const;

export function useGetStudentQuiz(soaId: string | undefined) {
  return useQuery({
    queryKey: keyStudentQuiz(soaId ?? "none"),
    queryFn: () => GetStudentQuizService(soaId as string),
    enabled: !!soaId,
    refetchOnWindowFocus: true,
  });
}

function useSetView() {
  const queryClient = useQueryClient();
  return (soaId: string, view: StudentQuizView) => {
    queryClient.setQueryData(keyStudentQuiz(soaId), view);
    queryClient.invalidateQueries({ queryKey: ["assignments"] });
  };
}

export function useStartQuiz() {
  const setView = useSetView();
  return useMutation({
    mutationKey: ["start-quiz"],
    mutationFn: (soaId: string) => StartQuizService(soaId),
    onSuccess: (view, soaId) => setView(soaId, view),
  });
}

export function useSubmitQuiz() {
  const setView = useSetView();
  return useMutation({
    mutationKey: ["submit-quiz"],
    mutationFn: (soaId: string) => SubmitQuizService(soaId),
    onSuccess: (view, soaId) => setView(soaId, view),
  });
}
