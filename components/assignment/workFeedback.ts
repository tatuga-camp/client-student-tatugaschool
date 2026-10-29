import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { errorSwalContent } from "../../utils";
import Swal from "../../utils/appSwal";

/** A short success toast inside the phone screen. */
export function workToast(title: string): void {
  void Swal.fire({
    title,
    icon: "success",
    timer: 2500,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
    customClass: { popup: "rounded-2xl border border-gray-100 shadow-md" },
  });
}

/** Failure feedback for any work-item mutation (TH/EN fallback title). */
export function workError(
  error: unknown,
  lang: Language,
  /** A TH/EN title and message to show instead of the server's (English) ones. */
  generic?: { title: string; text: string },
): void {
  console.error(error);
  const content = errorSwalContent(
    error,
    assignmentPageLanguage.somethingWentWrong(lang),
  );
  // errorSwalContent's footer is English ("Code Error: 403"): say it again.
  const code = content.footer.match(/\d+/)?.[0];
  const codeLine = code ? assignmentPageLanguage.errorCode(lang, code) : "";
  // An Error made on the client already carries a TH/EN message. Anything
  // else (a server reply) is English: show a TH/EN message and keep the
  // server's own text only as a small detail.
  const message =
    generic ??
    (error instanceof Error
      ? undefined
      : {
          title: assignmentPageLanguage.somethingWentWrong(lang),
          text: assignmentPageLanguage.updateFailedText(lang),
        });
  const detail = message
    ? [codeLine, content.text].filter(Boolean).join(" · ")
    : codeLine;
  void Swal.fire({
    ...content,
    ...(message ?? {}),
    footer: detail,
    confirmButtonText: assignmentPageLanguage.ok(lang),
    icon: "error",
  });
}
