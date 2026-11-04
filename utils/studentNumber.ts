// Thai digits ๐-๙ (U+0E50-U+0E59) -> ASCII 0-9, so "๑๐" sorts as 10.
// `Number("๑")` is NaN, which is why Thai-numbered rosters never sorted.
const THAI_DIGIT_ZERO = 0x0e50;
export function normalizeStudentNumber(
  value: string | number | null | undefined,
): string {
  return String(value ?? "")
    .trim()
    .replace(/[\u0E50-\u0E59]/g, (d) =>
      String(d.charCodeAt(0) - THAI_DIGIT_ZERO),
    );
}

// Natural order ("2" before "10", "12A" after "12", "๓" between "2" and "4");
// blank numbers go last.
export function compareStudentNumber(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  const left = normalizeStudentNumber(a);
  const right = normalizeStudentNumber(b);
  if (!left || !right) return left ? -1 : right ? 1 : 0;
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/** Comparator for anything with a `number` field: roster order. */
export const byStudentNumber = (
  a: { number: string | number | null | undefined },
  b: { number: string | number | null | undefined },
): number => compareStudentNumber(a.number, b.number);
