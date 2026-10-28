export const JOIN_CODE_LENGTH = 6;

/** Keep A–Z/0–9 only, uppercased, at most 6 characters. */
export function normalizeJoinCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, JOIN_CODE_LENGTH);
}
