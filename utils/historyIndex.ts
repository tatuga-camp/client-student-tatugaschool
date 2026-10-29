/**
 * Numbers browser history entries by a per-entry key, for backTarget.
 *
 * Next's pages router keeps no index in `history.state` (only url, as,
 * options, __N and a unique `key` per pushed entry; a replace keeps the key),
 * so the shell numbers the entries it sees itself. The first entry seen is 0:
 * there is no in-app history behind it.
 */
export function createHistoryIndex(): {
  /** The index of the entry with this key, recording it if it is new, and
   *  its path when given (a replace on the entry updates it). */
  visit(key: string | null | undefined, path?: string): number;
  /** The index of a known entry, or undefined; never moves the position. */
  peek(key: string | null | undefined): number | undefined;
  /** The index of the entry the shell is on. */
  current(): number;
  /** The key of the entry the shell is on (null if none). */
  currentKey(): string | null;
  /** The last path seen on the entry behind the current one, if known. */
  previousPath(): string | undefined;
} {
  const indexes = new Map<string, number>();
  const paths = new Map<number, string>();
  let current = -1;
  let currentKeyValue: string | null = null;
  return {
    peek(key) {
      return key ? indexes.get(key) : undefined;
    },
    current() {
      return current;
    },
    currentKey() {
      return currentKeyValue;
    },
    previousPath() {
      return paths.get(current - 1);
    },
    visit(key, path) {
      if (!key) return 0;
      currentKeyValue = key;
      let index = indexes.get(key);
      if (index === undefined) {
        // A new entry is pushed right after the one we were on.
        index = current + 1;
        indexes.set(key, index);
      }
      current = index;
      if (path !== undefined) paths.set(index, path);
      return index;
    },
  };
}

/**
 * How far history.go() must move to return to the entry we were on, after
 * the browser popped to another one (null when the popped entry is unknown).
 */
export function restoreDelta(
  currentIdx: number,
  poppedIdx: number | undefined,
): number | null {
  return poppedIdx === undefined ? null : currentIdx - poppedIdx;
}
