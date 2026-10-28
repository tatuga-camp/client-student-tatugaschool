import { useQueryClient } from "@tanstack/react-query";
import { destroyCookie } from "nookies";
import { useCallback } from "react";

/**
 * Signs the student out: clears the query cache and both cookies, then hard
 * redirects to /welcome. When email login merges, it calls
 * `signOutOrForgetDevice` first.
 */
export function useLogout(): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    // 1. Stop in-flight/triggered requests so the axios refresh interceptor
    //    can't refresh and re-set the student_access_token cookie.
    queryClient.cancelQueries();
    queryClient.clear();
    // 2. Delete both cookies (path must match how they were set: "/").
    destroyCookie(null, "student_access_token", { path: "/" });
    destroyCookie(null, "student_refresh_token", { path: "/" });
    // 3. Hard redirect (NOT router.push): tears down the React tree so no
    //    query can refetch and re-mint the token after we've logged out.
    window.location.href = "/welcome";
  }, [queryClient]);
}
