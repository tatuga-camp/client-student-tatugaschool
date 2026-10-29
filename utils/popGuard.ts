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
