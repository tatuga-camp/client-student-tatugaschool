/** Weeks (Sunday first) of a month; `month` is 0-based. Days outside it are null. */
export function monthGrid(year: number, month: number): (number | null)[][] {
  const lead = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** The local calendar day of a date as "YYYY-MM-DD". */
export function dayKey(date: Date | string): string {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * The status shown on each day: when a day has several, the one with the
 * lowest `value` (the worst). Statuses missing from `statusLists` are ignored.
 */
export function statusByDay(
  attendances: { startDate: Date | string; status: string }[],
  statusLists: { title: string; value: number; color: string }[],
): Map<string, { title: string; color: string }> {
  const worst = new Map<
    string,
    { title: string; color: string; value: number }
  >();
  for (const a of attendances) {
    const status = statusLists.find((s) => s.title === a.status);
    if (!status) continue;
    const key = dayKey(a.startDate);
    const current = worst.get(key);
    if (!current || status.value < current.value) {
      worst.set(key, {
        title: status.title,
        color: status.color,
        value: status.value,
      });
    }
  }
  return new Map(
    [...worst].map(([key, { title, color }]) => [key, { title, color }]),
  );
}

/** Dark text on light colours (yellow), white on the rest. */
export function textOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#fff";
  const n = parseInt(m[1], 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 170 ? "#383767" : "#fff";
}
