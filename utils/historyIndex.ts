/**
 * Numbers browser history entries by a per-entry key, for backTarget.
 *
 * Next's pages router keeps no index in `history.state` (only url, as,
 * options, __N and a unique `key` per pushed entry; a replace keeps the key),
 * so the shell numbers the entries it sees itself. The first entry seen is 0:
 * there is no in-app history behind it.
 */
export function createHistoryIndex(): {
  /** The index of the entry with this key, recording it if it is new. */
  visit(key: string | null | undefined): number;
} {
  const indexes = new Map<string, number>();
  let current = -1;
  return {
    visit(key) {
      if (!key) return 0;
      let index = indexes.get(key);
      if (index === undefined) {
        // A new entry is pushed right after the one we were on.
        index = current + 1;
        indexes.set(key, index);
      }
      current = index;
      return index;
    },
  };
}
