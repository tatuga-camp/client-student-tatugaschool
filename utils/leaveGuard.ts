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

// One decision, one navigation: callers arriving while it is open share it.
let flight: Promise<"left" | "stayed"> | null = null;

/** Run `leave` only if the guard (when active) allows it; single-flight. */
export function leaveIfAllowed(leave: () => void): Promise<"left" | "stayed"> {
  if (flight) return flight;
  const run = (async () => {
    if (current && current.active() && !(await current.confirm())) {
      return "stayed" as const;
    }
    leave();
    return "left" as const;
  })();
  flight = run;
  // Cleared a tick after it settles, so a sync completion is still shared.
  void run.finally(() => {
    if (flight === run) flight = null;
  });
  return run;
}

// A browser back/forward (popstate) can't be asked about in advance: the
// guard cancels it through Next's beforePopState and decides afterwards.
type PopState = { as: string };
let popInterceptor: ((state: PopState) => boolean) | null = null;

export function setPopInterceptor(
  next: ((state: PopState) => boolean) | null,
  owner?: (state: PopState) => boolean,
): void {
  if (next === null && owner && popInterceptor !== owner) return;
  popInterceptor = next;
}

/** True when the pop must be cancelled (the guard has taken it over). */
export function interceptPop(state: PopState): boolean {
  return popInterceptor ? popInterceptor(state) : false;
}
