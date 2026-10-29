// What the unsent-work guard does with a browser/Android back (popstate).
// Next has already let the browser move, so the guard cancels the pop and
// either asks, or (when a question is open) treats the pop as "Stay" and
// restores the URL ONCE with history.go() - never with a push, which would
// overwrite an entry the shell never saw. Pure, so the sequences are tested.

export type PopAction =
  | { kind: "pass" } //    not guarded: let Next render it
  | { kind: "swallow" } // our own restore landed
  | { kind: "ask" } //     cancel the pop and open the question
  | {
      kind: "stay"; //      cancel; close the open question as Stay
      /** history.go() steps back to the current entry; null = already there. */
      go: number | null;
    };

export function decidePop(input: {
  /** The key of the entry a restore is heading to, if one is in flight. */
  restoringKey: string | null;
  /** The key of the entry the browser just moved to (undefined if none). */
  poppedKey: string | undefined;
  /** The key of the entry the shell is showing. */
  currentKey: string | null;
  /** A question is open (asked by the in-app back, or by an earlier pop). */
  pending: boolean;
  /** The guard is needed now (unsent work, or a question open). */
  needsAnswer: boolean;
  /** Distance back to the current entry if the popped one is known. */
  delta: number | null;
  /** How many steps the browser is already away from the current entry
   *  because of earlier, cancelled pops (0 when it is on it). */
  awayBy: number;
}): { action: PopAction; restoringKey: string | null; awayBy: number } {
  const { poppedKey, currentKey, delta } = input;
  // Our own restore landing: swallow it; the browser is home again.
  if (input.restoringKey !== null && poppedKey === input.restoringKey) {
    return { action: { kind: "swallow" }, restoringKey: null, awayBy: 0 };
  }
  // A pop onto the entry we are on (e.g. a browser forward back onto the
  // page whose sheet is open): the URL already matches. An open question
  // closes as Stay with nothing to restore, and the guard stays armed.
  if (poppedKey !== undefined && poppedKey === currentKey) {
    return input.pending
      ? { action: { kind: "stay", go: null }, restoringKey: null, awayBy: 0 }
      : { action: { kind: "swallow" }, restoringKey: null, awayBy: 0 };
  }
  // Any other pop clears a restore that never arrived (it can't get stuck).
  if (input.pending) {
    // A known entry gives the distance outright. An unknown one is one more
    // step back from wherever the earlier cancelled pops left the browser.
    const go = delta !== null && delta !== 0 ? delta : input.awayBy + 1;
    return {
      action: { kind: "stay", go },
      restoringKey: currentKey,
      awayBy: 0,
    };
  }
  if (input.needsAnswer) {
    const away = delta !== null && delta !== 0 ? delta : 1;
    return { action: { kind: "ask" }, restoringKey: null, awayBy: away };
  }
  return { action: { kind: "pass" }, restoringKey: null, awayBy: 0 };
}

/**
 * What a finished question still has to do for the pop that started it:
 * render the popped route on Leave/Submit ("replace"), put the URL back on
 * Stay ("restore"), or nothing (an in-app ask navigates through its own
 * leave(); a second pop already restored and cancelled the question).
 */
export function popOutcome(input: {
  origin: "app" | "pop";
  leave: boolean;
  cancelledByPop: boolean;
  restored: boolean;
}): "replace" | "restore" | "none" {
  if (input.origin !== "pop") return "none";
  if (input.leave) return input.cancelledByPop ? "none" : "replace";
  return input.restored ? "none" : "restore";
}

/**
 * A browser back/forward while a modal layer (a sheet, the image or PDF
 * viewer) is open, on a detail page or a tab pane: cancel the pop, put the
 * URL back with history.go() (never a push) and close the topmost layer,
 * which may ask first. `take` = cancel the pop. The leave-guard sheet
 * handles back itself, so its pops pass on to the guard.
 */
export function layerPop(input: {
  top: "none" | "closes" | "ownsBack";
  restoringKey: string | null;
  poppedKey: string | undefined;
  currentKey: string | null;
  delta: number | null;
  /** An entry with no known delta is behind (utils/historyIndex.ts). */
  unseenIsBehind: boolean;
}): {
  take: boolean;
  close: boolean;
  go: number | null;
  restoringKey: string | null;
} {
  const active = input.top === "closes";
  const pass = { take: false, close: false, go: null, restoringKey: null };
  if (!active && input.restoringKey === null) return pass;
  // With no known distance the restore is one step forward, which is only
  // right when the popped entry is behind. When it could be ahead, close the
  // layer and let the pop through rather than restore the wrong way.
  if (
    active &&
    input.delta === null &&
    !input.unseenIsBehind &&
    input.poppedKey !== input.currentKey
  ) {
    return { ...pass, close: true };
  }
  const { action, restoringKey } = decidePop({
    restoringKey: input.restoringKey,
    poppedKey: input.poppedKey,
    currentKey: input.currentKey,
    pending: active,
    needsAnswer: active,
    delta: input.delta,
    awayBy: 0,
  });
  if (action.kind === "swallow") {
    return { take: true, close: false, go: null, restoringKey };
  }
  if (action.kind === "stay") {
    const go = action.go !== null && action.go !== 0 ? action.go : null;
    return { take: true, close: true, go, restoringKey };
  }
  return { ...pass, restoringKey };
}
