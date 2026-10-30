export const JOIN_CODE_LENGTH = 6;

// The teacher's link carries the code as `subject_code=…`.
const LINK_CODE = /[?&]subject_code=([^&#\s]*)/i;

function codeInLink(raw: string): string | null {
  const value = raw.match(LINK_CODE)?.[1];
  if (value === undefined) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Keep A–Z/0–9 only, uppercased, at most 6 characters. A pasted teacher link
 * gives the code it carries, not the start of its address.
 */
export function normalizeJoinCode(raw: string): string {
  return (codeInLink(raw) ?? raw)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, JOIN_CODE_LENGTH);
}

/** What the code boxes keep of their input, in either mode. */
export function cleanCodeInput(raw: string, mode: "alnum" | "digits"): string {
  return mode === "digits"
    ? raw.replace(/[^0-9]/g, "").slice(0, JOIN_CODE_LENGTH)
    : normalizeJoinCode(raw);
}

/** Codes are stored lowercase on the server; the boxes show them uppercase. */
export function joinCodeForLookup(code: string): string {
  return code.toLowerCase();
}

/**
 * The code to look up from a `subject_code` query value, or null when it
 * can't be one: the server only takes exactly 6 letters or digits (anything
 * else is a 400, not "not found"). A repeated param counts as no code.
 */
export function joinCodeFromQuery(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = joinCodeForLookup(value.trim());
  return /^[a-z0-9]{6}$/.test(code) ? code : null;
}
