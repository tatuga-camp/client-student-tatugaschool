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
