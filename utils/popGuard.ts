// What the unsent-work guard does with a browser/Android back (popstate).
// Next has already let the browser move, so the guard cancels the pop and
// either asks, or (when a question is open) treats the pop as "Stay" and
// restores the URL ONCE. Pure, so the sequences can be tested.

export type PopAction =
  | { kind: "pass" } //   not guarded: let Next render it
  | { kind: "swallow" } // our own restore landed (or a pop to where we are)
  | { kind: "ask" } //    cancel the pop and open the question
  | {
      kind: "stay"; //     cancel; close the open question as Stay; restore once
      restore: { go: number } | { push: true };
    };

export function decidePop(input: {
  /** The key of the entry a restore is heading to, if one is in flight. */
  restoringKey: string | null;
  /** The key of the entry the browser just moved to. */
  poppedKey: string | undefined;
  /** The key of the entry the shell is showing. */
  currentKey: string | null;
  /** A question is open (asked by the in-app back, or by an earlier pop). */
  pending: boolean;
  /** The guard is needed now (unsent work, or a question open). */
  needsAnswer: boolean;
  /** history.go() distance back to the current entry; null if unknown. */
  delta: number | null;
}): { action: PopAction; restoringKey: string | null } {
  const { poppedKey, currentKey, delta } = input;
  // Our own restore landing: swallow it, and the flag is done.
  if (input.restoringKey !== null && poppedKey === input.restoringKey) {
    return { action: { kind: "swallow" }, restoringKey: null };
  }
  // Any other pop clears a restore that never arrived (it can't get stuck).
  // A pop onto the entry we are already on needs nothing at all.
  if (poppedKey !== undefined && poppedKey === currentKey) {
    return { action: { kind: "swallow" }, restoringKey: null };
  }
  if (input.pending) {
    return delta !== null && delta !== 0
      ? {
          action: { kind: "stay", restore: { go: delta } },
          restoringKey: currentKey,
        }
      : {
          action: { kind: "stay", restore: { push: true } },
          restoringKey: null,
        };
  }
  if (input.needsAnswer) return { action: { kind: "ask" }, restoringKey: null };
  return { action: { kind: "pass" }, restoringKey: null };
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
