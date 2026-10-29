type Searchable = { firstName: string; lastName: string; number: string };

/**
 * True once a hidden-list query is enough to search: 3+ characters, a name or
 * a number alike (numbers run 1..N, so short ones would walk the roster).
 * Spaces don't count: names also match with them removed, so "m i" is "mi".
 */
export function hiddenQueryReady(query: string): boolean {
  return query.replace(/\s+/g, "").length > 2;
}

export function searchStudents<T extends Searchable>(
  students: T[],
  query: string,
  hideList: boolean,
): T[] {
  const trimmed = query.trim();
  // A hidden list can't be browsed: nobody shows for 1-2 characters.
  if (hideList && !hiddenQueryReady(trimmed)) return [];
  if (!hideList && trimmed === "") return students.slice().sort(byNumber);

  const q = trimmed.toLowerCase();
  const compact = query.toLowerCase().replace(/\s+/g, "");
  return students
    .filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        `${s.firstName}${s.lastName}`
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(compact) ||
        s.number.toString().includes(trimmed),
    )
    .sort(byNumber);
}

const byNumber = (a: Searchable, b: Searchable) =>
  Number(a.number) - Number(b.number);

/** Split `text` around the first case-insensitive occurrence of `query`. */
export function highlightMatch(
  text: string,
  query: string,
): { before: string; match: string; after: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return null;
  return {
    before: text.slice(0, i),
    match: text.slice(i, i + q.length),
    after: text.slice(i + q.length),
  };
}
