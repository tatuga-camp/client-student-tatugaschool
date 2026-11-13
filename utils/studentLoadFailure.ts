export type StudentLoadFailure = "session" | "not-found" | "load";

/**
 * Why the signed-in student could not be loaded:
 * - "session": the sign-in is missing, expired or refused. Sign in again.
 * - "not-found": the server says this student no longer exists.
 * - "load": anything else (offline, server trouble, rate limit). Retry.
 */
export function studentLoadFailure(error: unknown): StudentLoadFailure {
  const e = error as { statusCode?: unknown; message?: unknown } | null;
  const status = Number(e?.statusCode);
  if (status === 401 || status === 403) return "session";
  if (status === 404) return "not-found";
  // Thrown by the API client before a request is sent.
  if (e?.message === "Session expired" || e?.message === "Token not found") {
    return "session";
  }
  return "load";
}
