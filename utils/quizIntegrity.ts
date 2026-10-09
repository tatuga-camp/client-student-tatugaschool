import { IntegrityEvent } from "../interfaces";

type Result = { events: IntegrityEvent[]; awayMs: number | null };
const none = (): Result => ({ events: [], awayMs: null });

/**
 * Turns browser lifecycle callbacks into integrity events. A blur that turns
 * into a hide is cancelled, so a desktop tab switch is counted once (as the
 * hidden period), not twice.
 */
export function createIntegrityTracker(now: () => number, iso: () => string) {
  let hiddenAt: number | null = null;
  let blurAt: number | null = null;
  const event = (type: IntegrityEvent["type"], durationMs?: number): IntegrityEvent =>
    durationMs === undefined ? { type, clientAt: iso() } : { type, clientAt: iso(), durationMs };

  return {
    onHidden(): Result {
      if (hiddenAt !== null) return none();
      hiddenAt = now();
      blurAt = null;
      return { events: [event("HIDDEN")], awayMs: null };
    },
    onVisible(): Result {
      if (hiddenAt === null) return none();
      const awayMs = Math.max(0, now() - hiddenAt);
      hiddenAt = null;
      return { events: [event("VISIBLE", awayMs)], awayMs };
    },
    onBlur(): Result {
      if (hiddenAt !== null || blurAt !== null) return none();
      blurAt = now();
      return { events: [event("BLUR")], awayMs: null };
    },
    onFocus(): Result {
      if (blurAt === null) return none();
      const awayMs = Math.max(0, now() - blurAt);
      blurAt = null;
      return { events: [event("FOCUS", awayMs)], awayMs };
    },
    onPageHide(): Result {
      return { events: [event("PAGE_HIDE")], awayMs: null };
    },
    onPageShow(): Result {
      return { events: [event("PAGE_SHOW")], awayMs: null };
    },
  };
}

export class EventQueue {
  private items: IntegrityEvent[] = [];
  constructor(private readonly max = 200) {}

  push(events: IntegrityEvent[]): void {
    this.items.push(...events);
    if (this.items.length > this.max) this.items = this.items.slice(this.items.length - this.max);
  }

  drain(): IntegrityEvent[] {
    const out = this.items;
    this.items = [];
    return out;
  }

  /** Put a failed batch back in front of anything queued since. */
  restore(events: IntegrityEvent[]): void {
    this.items = [...events, ...this.items];
    if (this.items.length > this.max) this.items = this.items.slice(this.items.length - this.max);
  }

  get size(): number {
    return this.items.length;
  }
}

export function isScreenshotKey(e: { key: string; code?: string; metaKey: boolean; shiftKey: boolean }): boolean {
  if (e.key === "PrintScreen" || e.code === "PrintScreen") return true;
  return e.metaKey && e.shiftKey && ["Digit3", "Digit4", "Digit5"].includes(e.code ?? "");
}

export function isTranslatedDocument(html: { className: string; lang: string }, originalLang: string): boolean {
  if (/\btranslated-(ltr|rtl)\b/.test(html.className)) return true;
  return !!html.lang && !!originalLang && html.lang !== originalLang;
}

export const INTEGRITY_FLUSH_MS = 10_000;
export const AWAY_NOTICE_MIN_MS = 2_000;

type IntegrityBatchLike = { events: IntegrityEvent[]; heartbeat: boolean };

/**
 * The send side of the integrity collector, kept free of React and the DOM so
 * it can be tested. `flush` is the heartbeat; `flushKeepalive` is for page hide.
 * A failed send puts its events back in the queue (cap applies), so an offline
 * student's events wait for the next heartbeat instead of being lost.
 */
export function createIntegritySender(deps: {
  queue: EventQueue;
  send: (batch: IntegrityBatchLike) => Promise<unknown>;
  /** Resolves true when the batch was delivered (or there was nothing to send). */
  keepalive: (batch: IntegrityBatchLike) => Promise<boolean>;
}) {
  const { queue, send, keepalive } = deps;
  let inFlight = false;

  const flush = async (): Promise<void> => {
    if (inFlight) return;
    inFlight = true;
    const events = queue.drain();
    try {
      await send({ events, heartbeat: true });
    } catch {
      queue.restore(events);
    } finally {
      inFlight = false;
    }
  };

  const flushKeepalive = async (): Promise<void> => {
    const events = queue.drain();
    if (events.length === 0) return;
    let delivered = false;
    try {
      delivered = await keepalive({ events, heartbeat: false });
    } catch {
      delivered = false;
    }
    if (!delivered) queue.restore(events);
  };

  /** Sends a first heartbeat now, then one every `ms`. Returns a stop function. */
  const startHeartbeat = (
    setIntervalFn: (fn: () => void, ms: number) => unknown,
    clearIntervalFn: (handle: unknown) => void,
    ms = INTEGRITY_FLUSH_MS,
  ) => {
    void flush();
    const handle = setIntervalFn(() => void flush(), ms);
    return () => clearIntervalFn(handle);
  };

  return { flush, flushKeepalive, startHeartbeat };
}

export function shouldShowAwayNotice(awayMs: number | null): awayMs is number {
  return awayMs !== null && awayMs >= AWAY_NOTICE_MIN_MS;
}

type TargetLike = { tagName?: string } | null | undefined;

const isTextInputTarget = (target: TargetLike) => {
  const tag = target?.tagName?.toUpperCase();
  return tag === "INPUT" || tag === "TEXTAREA";
};

/**
 * What the Test mode shell does with a clipboard or context-menu event.
 * Text fields keep normal behaviour so students can fix their own answers.
 * Paste is recorded but never prevented (detect only).
 */
export function clipboardPolicy(
  kind: "copy" | "paste" | "contextmenu",
  target: TargetLike,
): { preventDefault: boolean; report: IntegrityEvent["type"] | null } {
  if (kind === "paste") return { preventDefault: false, report: "PASTE_ATTEMPT" };
  if (isTextInputTarget(target)) return { preventDefault: false, report: null };
  return kind === "copy" ? { preventDefault: true, report: "COPY_ATTEMPT" } : { preventDefault: true, report: null };
}
