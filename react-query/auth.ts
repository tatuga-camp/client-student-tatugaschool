import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestStudentSignInService, StudentSignInService } from "../services";
import { setAccessToken, setRefreshToken } from "../utils";

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["signIn"],
    mutationFn: (request: RequestStudentSignInService) =>
      StudentSignInService(request),
    onSuccess: (data) => {
      setAccessToken({ access_token: data.accessToken });
      setRefreshToken({ refresh_token: data.refreshToken });
    },
  });
}
