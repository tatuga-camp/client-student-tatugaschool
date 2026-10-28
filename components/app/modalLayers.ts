import { useEffect, useRef } from "react";

// The modal layers on screen (sheets and full-screen viewers), topmost last.
// Esc closes only the topmost; a sheet is inert while a modal is above it; and
// a browser/Android back closes the topmost layer instead of leaving the page.

/** Open modal layer ids, topmost last. */
export const openStack: number[] = [];
/** Called whenever the stack changes, so layers can re-evaluate being inert. */
export const stackListeners = new Set<() => void>();
export const notifyStack = () => stackListeners.forEach((l) => l());

let nextId = 0;
export const allocLayerId = () => ++nextId;

type Closer = {
  /** Close this layer (a back press). */
  close: () => void;
  /** The layer handles a back press itself (the leave-guard sheet). */
  ownsBack: boolean;
};
const closers = new Map<number, Closer>();

export function registerLayerCloser(id: number, closer: Closer): void {
  closers.set(id, closer);
}
export function unregisterLayerCloser(id: number): void {
  closers.delete(id);
}

/** The topmost open layer, if it can be closed by a back press. */
export function topLayer(): Closer | null {
  const id = openStack[openStack.length - 1];
  return id === undefined ? null : (closers.get(id) ?? null);
}

/**
 * Registers a full-screen viewer (not a Sheet) as a modal layer while `open`,
 * so a back press closes it and the sheets below it are inert.
 */
export function useModalLayer(open: boolean, onClose: () => void): void {
  const idRef = useRef(0);
  if (idRef.current === 0) idRef.current = allocLayerId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const id = idRef.current;
    openStack.push(id);
    registerLayerCloser(id, {
      close: () => closeRef.current(),
      ownsBack: false,
    });
    notifyStack();
    return () => {
      const i = openStack.lastIndexOf(id);
      if (i >= 0) openStack.splice(i, 1);
      unregisterLayerCloser(id);
      notifyStack();
    };
  }, [open]);
}
