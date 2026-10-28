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
export function workError(error: unknown, lang: Language): void {
  console.error(error);
  const content = errorSwalContent(
    error,
    assignmentPageLanguage.somethingWentWrong(lang),
  );
  // errorSwalContent's footer is English ("Code Error: 403"): say it again.
  const code = content.footer.match(/\d+/)?.[0];
  void Swal.fire({
    ...content,
    footer: code ? assignmentPageLanguage.errorCode(lang, code) : "",
    confirmButtonText: assignmentPageLanguage.ok(lang),
    icon: "error",
  });
}
