type Searchable = { firstName: string; lastName: string; number: string };

export function searchStudents<T extends Searchable>(
  students: T[],
  query: string,
  hideList: boolean,
): T[] {
  const trimmed = query.trim();
  // A number is a precise key, so it needs no minimum length; text keeps the
  // 3-character rule so the class list cannot be browsed by name.
  if (hideList && /^\d+$/.test(trimmed)) {
    return students
      .filter((s) => s.number.toString() === trimmed)
      .sort(byNumber);
  }
  if (hideList && trimmed.length <= 2) return [];
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
