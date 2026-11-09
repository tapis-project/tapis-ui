/**
 * Cache freshness policies. react-query v3 defaults (refetch on focus and
 * reconnect, staleTime 0) refetch every mounted query on each tab focus.
 * These policies never refetch in the background; `staleTime` decides
 * whether arriving at a page refetches:
 *
 *   back within the window       cache, no request
 *   after the window             one refetch on mount
 *   focus, reconnect, idle       no request
 *   write through the UI         the mutation invalidates
 *
 * Callers can override: `...options` is spread after these (for example a
 * running job's `refetchInterval`).
 */
import { QueryObserverOptions } from 'react-query';

/** a record being viewed */
export const DETAIL_STALE_MS = 60_000;

/** a listing that changes rarely and is costly to fetch */
export const SLOW_LIST_STALE_MS = 5 * 60_000;

/** No background fetch (focus, reconnect, timer). Only on mount when stale. */
export const noBackgroundRefetch = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false as const,
  refetchIntervalInBackground: false,
};

/** policy for a detail record */
export const detailPolicy = <T>(): Partial<QueryObserverOptions<T, Error>> => ({
  ...noBackgroundRefetch,
  staleTime: DETAIL_STALE_MS,
});

/** policy for a slow, rarely-changing listing */
export const slowListPolicy = <T>(): Partial<
  QueryObserverOptions<T, Error>
> => ({
  ...noBackgroundRefetch,
  staleTime: SLOW_LIST_STALE_MS,
});
