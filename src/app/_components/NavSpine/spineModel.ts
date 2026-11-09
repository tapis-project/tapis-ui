/**
 * Nav spine window math and entity overlay merge. A nav holds a *window*
 * (pages of `windowSize` from the server) plus an *overlay* (per-object
 * patches written by detail pages and mutations). Rules: an incomplete
 * window reports itself as incomplete, and a sparse patch never erases a
 * field the full object already has.
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
  /** there are objects beyond the window (shows the banner) */
  truncated: boolean;
};

export const NAV_WINDOW_SIZE = 50;

export const windowMeta = <T>(
  pages: WindowPage<T>[],
  windowSize: number
): WindowMeta => {
  const loaded = pages.reduce((n, p) => n + p.items.length, 0);
  // totalCount -1 means the service did not count (apps does this even when asked): unknown
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
 * Merge a patch over a base object, skipping undefined values, so a sparse
 * projection does not blank fields of a fuller object.
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

/** newest timestamp on an object, under whichever key the service uses */
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
    // A stale patch must not override a fresher window row. Compare the
    // service's updated stamps: newest wins, ties go to the patch, and if
    // either side has no stamp the patch wins.
    const baseAt = freshnessOf(o);
    const patchAt = freshnessOf(patch);
    if (baseAt && patchAt && baseAt > patchAt) return o;
    return mergeEntity(o, patch);
  });
};

/** "jobs" → "job" when there is exactly one */
export const nounFor = (noun: string, n: number): string =>
  n === 1 ? noun.replace(/s$/, '') : noun;
