/**
 * navKit — pure helpers for FilterableObjectsListV2-based navs.
 *
 * NavPods grew these privately (age buckets, timeAgo, timestamp
 * normalization); Jobs and Apps need the identical vocabulary, so this is the
 * shared copy. Pure functions only — testable without React.
 */

/** Tapis timestamps are naive-UTC more often than not; treat a zone-less ISO
 *  string as UTC instead of local time, or every age is off by the offset.
 *  Tolerates Date/number inputs — generated clients sometimes deserialize
 *  timestamps before we see them. */
export const normTs = (ts: string | Date | number): number => {
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  // An offset is a timezone whichever sign it carries. This used to test for
  // '+' alone, so every negative offset — which is to say every timestamp
  // from this side of the Atlantic — had a Z stapled onto the end of it.
  const zoned = ts.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(ts);
  return new Date(ts.includes('T') && !zoned ? ts + 'Z' : ts).getTime();
};

/**
 * The age ladder every "sort by created" nav groups on.
 *
 * Two ends, two problems. Pods and jobs are minutes old and want the top of
 * the ladder; images, volumes and snapshots are months old and used to land,
 * every one of them, in a single "< 6 months" heap with "< 1 year" and
 * "> 1 year" as the only company — a grouping that groups nothing. So the
 * tail is as finely divided as the head: months up to a year, then years.
 *
 * Empty buckets never render, so a longer ladder costs nothing on a list
 * that does not need it.
 *
 * The keys are positions, derived rather than written down, because the last
 * time a bucket was inserted by hand every key below it had to be renumbered
 * and the two copies of this list drifted apart instead.
 */
const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;

const LADDER: Array<[label: string, maxMs: number]> = [
  ['< 30 min', 30 * 60_000],
  ['< 1 hour', HOUR],
  ['< 2 hours', 2 * HOUR],
  ['< 4 hours', 4 * HOUR],
  ['< 8 hours', 8 * HOUR],
  ['< 1 day', DAY],
  ['< 2 days', 2 * DAY],
  ['< 3 days', 3 * DAY],
  ['< 4 days', 4 * DAY],
  ['< 5 days', 5 * DAY],
  ['< 6 days', 6 * DAY],
  ['< 1 week', 7 * DAY],
  ['< 2 weeks', 14 * DAY],
  ['< 3 weeks', 21 * DAY],
  ['< 1 month', 30 * DAY],
  ['< 2 months', 61 * DAY],
  ['< 3 months', 91 * DAY],
  ['< 6 months', 182 * DAY],
  ['< 9 months', 273 * DAY],
  ['< 1 year', 365 * DAY],
  ['< 2 years', 730 * DAY],
  ['< 3 years', 1095 * DAY],
  ['> 3 years', Infinity],
];

export const AGE_BUCKETS: { key: string; label: string; maxMs: number }[] =
  LADDER.map(([label, maxMs], at) => ({
    key: String(at).padStart(2, '0'),
    label,
    maxMs,
  }));

/** Where a thing with no timestamp goes, and where anything older ends up. */
export const OLDEST_BUCKET = AGE_BUCKETS[AGE_BUCKETS.length - 1].key;

export type TsLike = string | Date | number;

export const getAgeBucket = (ts: TsLike | undefined): string => {
  if (!ts) return OLDEST_BUCKET;
  const age = Date.now() - normTs(ts);
  for (const b of AGE_BUCKETS) {
    if (age < b.maxMs) return b.key;
  }
  return OLDEST_BUCKET;
};

export const ageBucketLabel = (key: string): string =>
  AGE_BUCKETS.find((b) => b.key === key)?.label ?? 'Unknown';

/**
 * The other mode: the calendar day a thing was made on.
 *
 * The age ladder answers "how old", and no ladder of relative buckets can
 * answer "which day" for something six months back without a hundred rungs.
 * A registry of images is exactly that case — every one of them is months
 * old, and the question is which afternoon it was pushed.
 *
 * The key carries its own label after a pipe, so a group needs no lookup
 * table for a set of values that is unbounded by nature. The number in front
 * is the day counted backwards, zero-padded, so the newest day sorts first
 * and stays first — the same contract the age keys have.
 *
 * Local days, not UTC ones: "Today" has to mean the day you are having.
 */
const DAY_ZERO = 400_000;

export const DATE_UNKNOWN = `${DAY_ZERO}|Unknown`;

/** The local calendar day an instant falls in, as an integer. */
const localDay = (ms: number): number =>
  Math.floor((ms - new Date(ms).getTimezoneOffset() * 60_000) / DAY);

// Intl formatters are expensive to build and free to reuse, and the label
// for a day is the same for every item on it — a list of four hundred
// images is four hundred lookups and a handful of formats.
let sameYearFormat: Intl.DateTimeFormat | undefined;
let otherYearFormat: Intl.DateTimeFormat | undefined;
const labelCache = new Map<number, string>();
let cacheDay = -1;

const dayLabel = (ms: number, day: number, today: number): string => {
  if (day === today) return 'Today';
  if (day === today - 1) return 'Yesterday';
  const when = new Date(ms);
  if (when.getFullYear() === new Date(today * DAY).getFullYear()) {
    sameYearFormat ??= new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return sameYearFormat.format(when);
  }
  otherYearFormat ??= new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return otherYearFormat.format(when);
};

export const getDateBucket = (ts: TsLike | undefined): string => {
  if (!ts) return DATE_UNKNOWN;
  const ms = normTs(ts);
  if (!Number.isFinite(ms)) return DATE_UNKNOWN;

  const today = localDay(Date.now());
  // "Today" and "Yesterday" go stale at midnight, and so does the cache
  if (cacheDay !== today) {
    labelCache.clear();
    cacheDay = today;
  }

  const day = localDay(ms);
  let key = labelCache.get(day);
  if (key === undefined) {
    key = `${String(DAY_ZERO - day).padStart(6, '0')}|${dayLabel(
      ms,
      day,
      today
    )}`;
    labelCache.set(day, key);
  }
  return key;
};

export const dateBucketLabel = (key: string): string =>
  key.slice(key.indexOf('|') + 1) || 'Unknown';

export const timeAgo = (ts: TsLike | undefined): string => {
  if (!ts) return '';
  const secs = Math.floor((Date.now() - normTs(ts)) / 1000);
  if (secs < 0) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

/**
 * Twenty jobs named hello-world-test-20260901-093000-something must still be
 * tellable apart in a 17rem column. Middles are the least informative part of
 * a generated name — prefix says which app, suffix says which run — so the
 * middle folds first.
 */
export const midEllipsis = (name: string, max = 26): string => {
  if (name.length <= max) return name;
  const keep = max - 1;
  const head = Math.ceil(keep * 0.6);
  const tail = keep - head;
  return `${name.slice(0, head)}…${name.slice(name.length - tail)}`;
};

// ── Filter helpers ───────────────────────────────────────────────────────────

const RANGE_MS: Record<string, number> = {
  last24h: 86_400_000,
  last7d: 7 * 86_400_000,
  last30d: 30 * 86_400_000,
};

/**
 * A time-range filter function for one date field.
 *
 * `getTs` reads the timestamp off an object rather than the field name doing
 * it, because the navs filter on values they joined in themselves (an app's
 * last run comes from the jobs window, not from the app).
 */
export const timeRangeFilter =
  (getTs: (o: any) => TsLike | undefined) =>
  (objects: any[], filter: any): any[] => {
    const range = filter?.value?.range;
    if (!range) return objects;
    if (range === 'custom') {
      const start = normTs(filter.value.customStart ?? 0);
      const end = filter.value.customEnd
        ? normTs(filter.value.customEnd)
        : Date.now();
      return objects.filter((o) => {
        const ts = getTs(o);
        if (!ts) return false;
        const n = normTs(ts);
        return n >= start && n <= end;
      });
    }
    const span = RANGE_MS[range];
    if (!span) return objects;
    const floor = Date.now() - span;
    return objects.filter((o) => {
      const ts = getTs(o);
      return !!ts && normTs(ts) >= floor;
    });
  };

/** A quick filter: an arbitrary predicate wearing the Filter shape. */
export const predicateFilter =
  (predicates: Record<string, (o: any) => boolean>) =>
  (objects: any[], filter: any): any[] => {
    const predicate = predicates[filter?.value];
    return predicate ? objects.filter(predicate) : objects;
  };
