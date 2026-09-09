/**
 * The consuming half of the spine: take a service's windowed infinite query
 * (e.g. `Systems.useListWindow`), lay the entity overlay over its rows, and
 * hand a nav everything it needs — merged objects, honest window metadata,
 * and the expand controls the NavWindowBar renders.
 */
import { useMemo, useRef } from 'react';
import type { UseInfiniteQueryResult } from 'react-query';
import {
  NAV_WINDOW_SIZE,
  WindowPage,
  flattenWindow,
  overlayObjects,
  windowMeta,
} from './spineModel';
import { useSpineOverlay } from './spineEntities';

/** expand-all safety: never chain more than this many pages in one press */
const MAX_EXPAND_ALL_PAGES = 40;

export const useNavWindow = <T extends object>({
  service,
  noun,
  idOf,
  query,
  windowSize = NAV_WINDOW_SIZE,
}: {
  service: string;
  noun: string;
  idOf: (o: T) => string;
  query: UseInfiniteQueryResult<WindowPage<T>, Error>;
  windowSize?: number;
}) => {
  const overlay = useSpineOverlay(service);
  // defensive: suites that automock the hooks package hand navs an undefined
  // query result — an empty window, not a crash, is the right reading
  const q = (query ?? {}) as Partial<
    UseInfiniteQueryResult<WindowPage<T>, Error>
  >;
  const pages = q.data?.pages ?? [];

  const objects = useMemo(
    () =>
      overlayObjects(
        flattenWindow(pages),
        overlay as Record<string, Partial<T>>,
        idOf
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q.data, overlay]
  );

  const meta = useMemo(
    () => windowMeta(pages, windowSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q.data, windowSize]
  );

  // survives re-renders during the chain so two presses don't interleave
  const expandingAll = useRef(false);
  const expandAll = async () => {
    if (expandingAll.current || !q.fetchNextPage) return;
    expandingAll.current = true;
    try {
      for (let i = 0; i < MAX_EXPAND_ALL_PAGES; i++) {
        const r = await q.fetchNextPage!();
        const got = r.data?.pages ?? [];
        if (windowMeta(got, windowSize).complete) break;
      }
    } finally {
      expandingAll.current = false;
    }
  };

  return {
    objects,
    meta,
    expand: () => q.fetchNextPage?.(),
    expandAll,
    expanding: !!q.isFetchingNextPage,
    canExpand: !!q.hasNextPage,
    isLoading: !!q.isLoading,
    error: q.error ?? undefined,
    windowSize,
    // the window is fetched once and then holds still by design (all the
    // refetchOn* flags are off) — so the ledger says how old it is and
    // offers to refetch it whole
    fetchedAt: q.dataUpdatedAt ?? 0,
    refresh: () => q.refetch?.(),
    refreshing: !!q.isFetching && !q.isFetchingNextPage && !q.isLoading,
  };
};

export type NavWindow<T extends object> = ReturnType<typeof useNavWindow<T>>;
