/**
 * systemsSearch — module-level store bridging the nav's search box to the
 * landing table, so /systems has ONE search instead of two. Same pattern as
 * jobsSearch/filesSearch: works outside React for the nav callback, inside
 * via useSyncExternalStore.
 */
let _query = '';
const _listeners = new Set<() => void>();

export const getSystemsSearch = (): string => _query;

export const setSystemsSearch = (q: string) => {
  if (q === _query) return;
  _query = q;
  _listeners.forEach((fn) => fn());
};

export const subscribeSystemsSearch = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
