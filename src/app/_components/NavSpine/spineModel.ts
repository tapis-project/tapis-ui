/**
 * The nav spine's pure half — window math and the entity overlay merge.
 *
 * A nav no longer fetches everything: it holds a *window* (pages of
 * `windowSize` from the server) plus an *overlay* (fresher per-object
 * patches written by detail pages and mutations). The functions here decide
 * what the window adds up to and how the overlay lands on it, and they are
 * where the honesty rules live: an incomplete window must say so, and a
 * sparse patch must never erase a field the full object already had.
 */

export type WindowPage<T> = { items: T[]; total?: number };

export type WindowMeta = {
  /** objects actually in hand */
  loaded: number;
  /** server total when known (computeTotal on the first page), else the
   *  loaded count once the window is complete */
  total?: number;
  /** the window holds everything the query matches */
  complete: boolean;
  /** there are objects beyond the window — the banner's trigger */
  truncated: boolean;
};

export const NAV_WINDOW_SIZE = 50;

export const windowMeta = <T>(
  pages: WindowPage<T>[],
  windowSize: number
): WindowMeta => {
  const loaded = pages.reduce((n, p) => n + p.items.length, 0);
  // Tapis answers totalCount: -1 when it never counted (apps does this even
  // when asked) — that is "unknown", not a number to show anyone
  const total = [...pages]
    .reverse()
    .find((p) => p.total != null && p.total >= 0)?.total;
  const last = pages[pages.length - 1];
  const complete =
    pages.length > 0 &&
    (last.items.length < windowSize || (total != null && loaded >= total));
  return {
    loaded,
    total: total ?? (complete ? loaded : undefined),
    complete,
    truncated: !complete,
  };
};

export const flattenWindow = <T>(pages: WindowPage<T>[]): T[] =>
  pages.flatMap((p) => p.items);

/**
 * Merge a patch over a base object, skipping undefined values — a sparse
 * projection (nav fields only) must never read as "this field became
 * nothing" against a fuller object already in hand.
 */
export const mergeEntity = <T extends object>(
  base: T,
  patch: Partial<T>
): T => {
  const out = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
};

/** the freshest timestamp an object carries, however the service names it */
const freshnessOf = (o: unknown): number => {
  const rec = o as Record<string, unknown> | undefined;
  const raw = (rec?.lastUpdated ?? rec?.updated) as string | undefined;
  const t = raw ? Date.parse(String(raw)) : NaN;
  return Number.isNaN(t) ? 0 : t;
};

export const overlayObjects = <T extends object>(
  items: T[],
  overlay: Record<string, Partial<T>>,
  idOf: (o: T) => string
): T[] => {
  if (!overlay || Object.keys(overlay).length === 0) return items;
  return items.map((o) => {
    const patch = overlay[idOf(o)];
    if (!patch) return o;
    // A stale patch must not bury a fresher window row. The overlay holds
    // what a detail page knew THEN; a refreshed list can know more — two
    // BLOCKED jobs once sat blocked in the nav through every refresh
    // press, because an old write-through kept winning. Both sides carry
    // the service's own updated stamp: newest wins, ties go to the patch
    // (same knowledge, possibly more fields), and a stampless side keeps
    // the old patch-wins behaviour.
    const baseAt = freshnessOf(o);
    const patchAt = freshnessOf(patch);
    if (baseAt && patchAt && baseAt > patchAt) return o;
    return mergeEntity(o, patch);
  });
};

/** "jobs" → "job" when there is exactly one */
export const nounFor = (noun: string, n: number): string =>
  n === 1 ? noun.replace(/s$/, '') : noun;
