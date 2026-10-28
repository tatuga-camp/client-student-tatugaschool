// The unsent-work guard, seen from the in-app back button: it is asked BEFORE
// history is popped, so choosing Stay never touches the URL.

export type LeaveInterceptor = {
  /** Whether leaving needs an answer right now. */
  active: () => boolean;
  /** Ask the student; true = go ahead and leave. */
  confirm: () => Promise<boolean>;
};

let current: LeaveInterceptor | null = null;

/**
 * Install (or with null, remove) the interceptor. `owner` makes a removal
 * apply only if that interceptor is still the installed one.
 */
export function setLeaveInterceptor(
  next: LeaveInterceptor | null,
  owner?: LeaveInterceptor,
): void {
  if (next === null && owner && current !== owner) return;
  current = next;
}

export function leaveGuardActive(): boolean {
  return current !== null && current.active();
}

/** Run `leave` only if the guard (when active) allows it. */
export async function leaveIfAllowed(
  leave: () => void,
): Promise<"left" | "stayed"> {
  if (current && current.active() && !(await current.confirm())) {
    return "stayed";
  }
  leave();
  return "left";
}
