import type { ErrorMessages } from "../interfaces";

// API rejections are usually ErrorMessages objects, but signed-URL uploads
// reject with the raw response text (a string) and network failures with an
// Error — this normalizes all of them into Swal.fire content.
export function errorSwalContent(
  error: unknown,
  fallbackTitle = "Something Went Wrong",
): {
  title: string;
  text: string;
  footer: string;
} {
  if (typeof error === "string") {
    return { title: fallbackTitle, text: error, footer: "" };
  }
  const result = error as Partial<ErrorMessages> | null | undefined;
  return {
    title:
      typeof result?.error === "string" && result.error
        ? result.error
        : fallbackTitle,
    text: result?.message
      ? result.message.toString()
      : error instanceof Error
        ? error.message
        : "Please try again.",
    footer: result?.statusCode
      ? "Code Error: " + result.statusCode.toString()
      : "",
  };
}
