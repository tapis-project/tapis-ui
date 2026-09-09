/**
 * The entity overlay — one shared, per-service map of "what we know freshest"
 * about each object, living in the react-query cache so every subscriber
 * re-renders when it moves.
 *
 * Detail pages and mutations *write through* here (they saw the newest copy
 * of an object; the nav's window may be minutes old), and `useNavWindow`
 * merges the overlay onto window rows at read time. That is the whole sync
 * story: a nav row and a detail page can no longer disagree, because the
 * freshest fields win everywhere at once.
 */
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { mergeEntity } from './spineModel';

const overlayKey = (service: string) => ['nav-spine', service, 'entities'];

export const writeSpineEntities = (
  queryClient: QueryClient,
  service: string,
  patches: Array<{ id: string; patch: object }>
) => {
  queryClient.setQueryData(
    overlayKey(service),
    (prev: Record<string, object> | undefined) => {
      const next = { ...(prev ?? {}) };
      for (const { id, patch } of patches) {
        next[id] = mergeEntity(next[id] ?? {}, patch);
      }
      return next;
    }
  );
};

/** Convenience for the common single-object write-through. */
export const useSpineWriter = (service: string) => {
  const queryClient = useQueryClient();
  return (id: string, patch: object) =>
    writeSpineEntities(queryClient, service, [{ id, patch }]);
};

export const useSpineOverlay = (
  service: string
): Record<string, Partial<object>> => {
  const { data } = useQuery(overlayKey(service), () => ({}), {
    // the overlay is written, never fetched — the query exists only so
    // subscribers re-render on setQueryData
    staleTime: Infinity,
    cacheTime: Infinity,
    initialData: {},
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
  return (data ?? {}) as Record<string, Partial<object>>;
};
