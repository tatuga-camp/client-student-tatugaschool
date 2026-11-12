import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTurnstileToken } from "../components/signin/TurnstileProvider";
import { RequestStudentSignInService, StudentSignInService } from "../services";
import { setAccessToken, setRefreshToken } from "../utils";

/**
 * Student sign-in. Every call carries a fresh Turnstile token, and using
 * this hook keeps the (normally invisible) Turnstile widget mounted.
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const getTurnstileToken = useTurnstileToken();
  return useMutation({
    mutationKey: ["signIn"],
    mutationFn: async (
      request: Omit<RequestStudentSignInService, "turnstileToken">,
    ) =>
      StudentSignInService({
        ...request,
        turnstileToken: await getTurnstileToken(),
      }),
    onSuccess: async (data) => {
      setAccessToken({ access_token: data.accessToken });
      setRefreshToken({ refresh_token: data.refreshToken });
      // Drop any data cached for a previous session before the new user
      // enters the app. Cancel first so nothing repopulates the cache.
      await queryClient.cancelQueries();
      queryClient.clear();
    },
  });
}
