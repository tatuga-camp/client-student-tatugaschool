/**
 * Numbers browser history entries by a per-entry key, for backTarget.
 *
 * Next's pages router keeps no index in `history.state` (only url, as,
 * options, __N and a unique `key` per pushed entry; a replace keeps the key),
 * so the shell numbers the entries it sees itself. The first entry seen is 0:
 * there is no in-app history behind it.
 *
 * Only pushes are numbered. An entry first reached by a back/forward could be
 * anywhere, so it stays unindexed (and the shell's place is unknown while it
 * is on one). See unseenIsBehind for where unseen entries can be.
 */
export function createHistoryIndex(): {
  /** The index of the entry with this key, recording it if it is new, and
   *  its path when given (a replace on the entry updates it). `popped`: the
   *  browser moved here by a back/forward; a new key is then left unindexed
   *  (0 is returned: no known in-app history behind it). */
  visit(
    key: string | null | undefined,
    path?: string,
    popped?: boolean,
  ): number;
  /** The index of a known entry, or undefined; never moves the position. */
  peek(key: string | null | undefined): number | undefined;
  /** The index of the entry the shell is on (null: not seen, or unindexed). */
  current(): number | null;
  /** The key of the entry the shell is on (null if none). */
  currentKey(): string | null;
  /** The last path seen on the entry behind the current one, if known. */
  previousPath(): string | undefined;
} {
  const indexes = new Map<string, number>();
  const paths = new Map<number, string>();
  let current: number | null = null;
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
      return current === null ? undefined : paths.get(current - 1);
    },
    visit(key, path, popped = false) {
      if (!key) return 0;
      currentKeyValue = key;
      let index = indexes.get(key);
      if (index === undefined) {
        if (popped) {
          current = null;
          return 0;
        }
        // A new entry is pushed right after the one we were on. Pushed from
        // an unindexed entry it drops everything numbered ahead: start at 0.
        index = current === null ? 0 : current + 1;
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
  currentIdx: number | null,
  poppedIdx: number | undefined,
): number | null {
  return poppedIdx === undefined || currentIdx === null
    ? null
    : currentIdx - poppedIdx;
}

/**
 * Whether an entry the shell hasn't seen must be behind it (so a restore
 * from a pop onto it goes forward). In a page that loaded normally, the only
 * unseen entries are the ones before the shell's first entry (sign-in): all
 * later ones were pushed in front of it. A reload, or a load by back/forward,
 * keeps the tab's entries on both sides, which the shell starts afresh among.
 * `placed`: the shell knows its own index; `load`: the page's navigation type.
 */
export function unseenIsBehind(input: {
  placed: boolean;
  load: string;
}): boolean {
  return input.placed && input.load === "navigate";
}
