/**
 * jobsSearch — module-level store bridging the nav's search box to the
 * dashboard table, so /jobs has ONE search instead of two. Same pattern as
 * filesSearch: works outside React for the nav callback, inside via
 * useSyncExternalStore.
 */
let _query = '';
const _listeners = new Set<() => void>();

export const getJobsSearch = (): string => _query;

export const setJobsSearch = (q: string) => {
  if (q === _query) return;
  _query = q;
  _listeners.forEach((fn) => fn());
};

export const subscribeJobsSearch = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
