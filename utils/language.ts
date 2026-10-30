import { Language } from "../interfaces";
import { safeGet, safeSet } from "./safeStorage";

// The choice made in this page's life: with storage blocked it is all there is.
let sessionChoice: Language | null = null;

const isLanguage = (v: string | null): v is Language =>
  v === "en" || v === "th";

/**
 * The language the student chose (stored, else earlier this session), else
 * the browser's. Blocked storage reads as nothing stored, so a Thai browser
 * still starts in TH.
 */
export function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = safeGet("language");
  if (isLanguage(stored)) return stored;
  if (sessionChoice) return sessionChoice;
  const browser = (window.navigator?.language ?? "").toLowerCase();
  return browser.startsWith("th") ? "th" : "en";
}

/** Remembers the choice: stored when storage works, for the session always. */
export function saveLanguage(language: Language): void {
  sessionChoice = language;
  safeSet("language", language);
}
