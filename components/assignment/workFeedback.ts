import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { workErrorContent } from "../../utils/assignmentDetail";
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
    customClass: {
      // Below the status bar (and the frame's Dynamic Island).
      container: "!top-[var(--safe-top)]",
      popup: "rounded-2xl border border-gray-100 shadow-md",
    },
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
  const content = workErrorContent(error, lang, generic);
  void Swal.fire({
    title: content.title,
    text: content.text,
    footer: content.detail,
    confirmButtonText: assignmentPageLanguage.ok(lang),
    icon: "error",
  });
}
