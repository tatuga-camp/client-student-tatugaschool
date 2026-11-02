import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { workErrorContent } from "../../utils/assignmentDetail";
import Swal from "../../utils/appSwal";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Lucide's check, built as nodes (no HTML strings: see safeHtml.test). */
function checkIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  const attributes = {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "3",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  };
  for (const [name, value] of Object.entries(attributes))
    svg.setAttribute(name, value);
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M20 6 9 17l-5-5");
  svg.append(path);
  return svg;
}

/** The toast's row: a soft green check (the Turned in pill's) and the title. */
function toastContent(title: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "flex items-center gap-2";
  const badge = document.createElement("span");
  badge.className =
    "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600";
  badge.append(checkIcon());
  const text = document.createElement("span");
  text.className = "text-[13px] font-bold leading-tight text-icon-color";
  text.textContent = title;
  row.append(badge, text);
  return row;
}

/**
 * A short success toast inside the phone screen: a chunky white pill at the
 * top centre that fades in and out (globals.css, .work-toast-*).
 */
export function workToast(title: string): void {
  void Swal.fire({
    html: toastContent(title),
    timer: 2500,
    showConfirmButton: false,
    toast: true,
    position: "top",
    showClass: { popup: "work-toast-in" },
    hideClass: { popup: "work-toast-out" },
    customClass: {
      // Below the status bar (and the frame's Dynamic Island).
      container: "!top-[calc(var(--safe-top)+8px)] !px-3",
      // All `!`: SweetAlert's CSS is unlayered, so it beats plain utilities.
      popup:
        "!w-fit !max-w-full !justify-self-center !rounded-full !border-2 !border-b-4 !border-solid !border-[#E3E8F0] !bg-white !py-1.5 !pl-1.5 !pr-4 !font-Anuphan !shadow-[0_8px_20px_-8px_rgba(56,55,103,0.3)]",
      htmlContainer: "!m-0",
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
