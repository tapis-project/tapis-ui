/**
 * One place that says how long a read stays good for.
 *
 * react-query v3's defaults are wrong for this app in a specific,
 * expensive way: `refetchOnWindowFocus` and `refetchOnReconnect` are TRUE
 * and `staleTime` is 0, so every alt-tab back into the browser re-runs
 * every mounted query at once. On a detail page that now carries a
 * record, a sharing read, a history ledger and a file probe, that is a
 * burst of requests for facts nobody asked to see again.
 *
 * Most hooks here answer that by turning all five refetch flags off. That
 * is right for a big windowed listing driven by an explicit Refresh
 * button, and wrong for a detail record: with `refetchOnMount: false` a
 * page can only ever be as fresh as the last mutation THIS tab made, so a
 * change from anywhere else is invisible until a hard reload.
 *
 * So the flags say "never in the background", and `staleTime` — not the
 * mount flag — decides whether arriving at a page costs a request:
 *
 *   navigate away and back inside the window   → free, served from cache
 *   arrive after it                            → one refetch, on mount
 *   alt-tab, reconnect, idle in a tab          → never
 *   write something through the UI             → the mutation invalidates
 *
 * Callers still win: the spread order puts `...options` after these, so
 * the job page's own `refetchInterval` (poll a running job) survives.
 */
import { QueryObserverOptions } from 'react-query';

/** a record that a person is looking at right now */
export const DETAIL_STALE_MS = 60_000;

/** a listing whose contents change rarely and cost a lot to fetch */
export const SLOW_LIST_STALE_MS = 5 * 60_000;

/**
 * Never fetch in the background — not on focus, not on reconnect, not on
 * a timer. What remains is: on mount, if the data has gone stale.
 */
export const noBackgroundRefetch = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false as const,
  refetchIntervalInBackground: false,
};

/** the policy a detail record is read under */
export const detailPolicy = <T>(): Partial<QueryObserverOptions<T, Error>> => ({
  ...noBackgroundRefetch,
  staleTime: DETAIL_STALE_MS,
});

/** the policy a slow, rarely-changing listing is read under */
export const slowListPolicy = <T>(): Partial<
  QueryObserverOptions<T, Error>
> => ({
  ...noBackgroundRefetch,
  staleTime: SLOW_LIST_STALE_MS,
});
