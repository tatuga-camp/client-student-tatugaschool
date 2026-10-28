import { DomHandler } from "primereact/utils";
import { OVERLAY_ROOT_ID } from "./frameRoutes";

let installed = false;

/**
 * PrimeReact positions a body-appended overlay with page coordinates. The
 * overlay root sits inside the phone screen, so those coordinates are off by
 * the screen's own position; shift them back so panels land under their input.
 */
export function installPrimeOverlayOffset(): void {
  if (installed) return;
  installed = true;
  const original = DomHandler.absolutePosition.bind(DomHandler);
  DomHandler.absolutePosition = (element: HTMLElement, ...rest: any[]) => {
    (original as any)(element, ...rest);
    const root = element?.parentElement;
    if (root?.id !== OVERLAY_ROOT_ID) return;
    const rect = root.getBoundingClientRect();
    element.style.left = `${(parseFloat(element.style.left) || 0) - rect.left}px`;
    element.style.top = `${(parseFloat(element.style.top) || 0) - rect.top}px`;
  };
}
