/** The server asks for a password when a student has one set. */
export function needsPassword(error: unknown): boolean {
  return (
    (error as { message?: unknown } | null | undefined)?.message ===
    "Please enter your password"
  );
}

/** Whether a sign-in error message is about the password being wrong. */
export function isPasswordRejection(text: string | undefined | null): boolean {
  return !text || /password/i.test(text);
}
